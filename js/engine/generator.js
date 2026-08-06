/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/engine/generator.js — ساخت سؤال از روی الگو

   کار این فایل دو چیز است:
   ۱. یک الگو را اجرا کند و سؤال آماده تحویل دهد.
   ۲. پاسخ دانش‌آموز را با پاسخ درست بسنجد.

   ── چرا سؤال بعد از ساخته‌شدن بررسی می‌شود؟ ──
   الگوها را آدم می‌نویسد و آدم اشتباه می‌کند. اگر یک الگو
   روزی سؤال خرابی بسازد (مثلاً پاسخ درست بین گزینه‌ها نباشد)،
   نباید آن سؤال به دانش‌آموز نشان داده شود. اینجا هر سؤال پیش
   از نمایش بررسی می‌شود و اگر خراب بود، دوباره ساخته می‌شود.

   وابستگی: APP.Bank، APP.State
   ============================================================ */

var APP = APP || {};

APP.Generator = (function () {
  "use strict";

  var MAX_TRIES = 6;

  /* ============================================================
     ساخت سؤال
     ============================================================ */

  /**
   * ساخت یک سؤال آمادهٔ نمایش از روی یک الگو.
   * @param {Object} tpl الگوی سؤال
   * @param {number} level سطح بازی (۱ تا ۳)
   * @param {Object} rnd تولیدکنندهٔ تصادفی
   * @returns {Object|null} سؤال آماده، یا null اگر الگو خراب بود
   */
  function make(tpl, level, rnd) {
    if (!tpl) { return null; }

    // اگر الگو در این سطح تعریف نشده، به نزدیک‌ترین سطح مجاز می‌رویم
    if (tpl.levels.indexOf(level) === -1) {
      level = nearestLevel(tpl.levels, level);
    }

    for (var i = 0; i < MAX_TRIES; i++) {
      var raw;
      try {
        raw = tpl.generate(level, rnd, context());
      } catch (err) {
        warn("الگوی " + tpl.id + " هنگام ساخت سؤال خطا داد", err);
        return null;
      }

      var q = normalize(raw, tpl, level, rnd);
      if (validate(q)) { return q; }
    }

    warn("الگوی " + tpl.id + " در " + MAX_TRIES + " تلاش سؤال سالم نساخت.");
    return null;
  }

  /** اطلاعاتی که الگوها ممکن است لازم داشته باشند */
  function context() {
    var name = (APP.State && APP.State.data.player.name) || "دوست من";
    return {
      name: name,
      avatar: (APP.State && APP.State.data.player.avatar) || "a1"
    };
  }

  /** نزدیک‌ترین سطحی که الگو پشتیبانی می‌کند */
  function nearestLevel(levels, wanted) {
    var best = levels[0], bestGap = 99;
    for (var i = 0; i < levels.length; i++) {
      var gap = Math.abs(levels[i] - wanted);
      if (gap < bestGap) { bestGap = gap; best = levels[i]; }
    }
    return best;
  }

  /* ============================================================
     یکسان‌سازی ساختار سؤال
     ============================================================ */

  /**
   * خروجی الگوها کمی با هم فرق دارد. اینجا همه را به یک شکل
   * ثابت درمی‌آوریم تا بقیهٔ بازی با همهٔ سؤال‌ها یکسان کار کند.
   */
  function normalize(raw, tpl, level, rnd) {
    if (!raw) { return null; }

    var q = {
      // شناسه
      tplId: tpl.id,
      subject: tpl.subject,
      skill: tpl.skill,
      skillName: tpl.skillName,
      topic: tpl.topic,
      interaction: tpl.interaction,
      needsPad: !!tpl.needsPad,
      level: level,

      // متن‌ها
      story: raw.story || "",
      stem: raw.stem || "",
      passage: raw.passage || "",
      unit: raw.unit || "",
      visual: raw.visual || null,

      // پاسخ
      answer: raw.answer,
      answerText: "",

      // دادهٔ تعامل
      choices: raw.choices || null,
      items: raw.items || null,
      zones: raw.zones || null,
      outcomes: raw.outcomes || null,
      correctOrder: null,
      correctZones: null,

      // راهنما
      hint1: raw.hint1 || "",
      hint2: raw.hint2 || "",
      solution: raw.solution || "",
      why: raw.why || ""
    };

    if (q.interaction === "order" && q.items) {
      // ترتیب درست همان ترتیبی است که الگو ساخته؛ نمایش را به‌هم می‌ریزیم
      q.correctOrder = q.items.map(function (it) { return it.id; });
      q.items = shuffleUntilDifferent(rnd, q.items, q.correctOrder);
      q.answerText = q.items.length + " مورد به ترتیب درست";
    } else if (q.interaction === "drag" && q.items) {
      q.correctZones = {};
      for (var i = 0; i < q.items.length; i++) {
        q.correctZones[q.items[i].id] = q.items[i].zone;
      }
      q.answerText = q.items.length + " مورد در جای درست";
    } else {
      q.answerText = String(q.answer);
    }

    return q;
  }

  /**
   * به‌هم‌ریختن ترتیب، ولی نه طوری که تصادفاً همان ترتیب درست
   * دربیاید — چون آن‌وقت دانش‌آموز بدون هیچ کاری امتیاز می‌گیرد.
   */
  function shuffleUntilDifferent(rnd, items, correct) {
    if (items.length < 2) { return items.slice(); }
    for (var t = 0; t < 12; t++) {
      var mixed = rnd.shuffle(items);
      var same = true;
      for (var i = 0; i < mixed.length; i++) {
        if (mixed[i].id !== correct[i]) { same = false; break; }
      }
      if (!same) { return mixed; }
    }
    // اگر شانس آورد و همیشه یکی درآمد، دو مورد اول را دستی جابه‌جا می‌کنیم
    var out = items.slice();
    var tmp = out[0]; out[0] = out[1]; out[1] = tmp;
    return out;
  }

  /* ============================================================
     بررسی سلامت سؤال
     ============================================================ */

  /** آیا این سؤال قابل نمایش به دانش‌آموز است؟ */
  function validate(q) {
    if (!q || !q.stem) { return false; }
    if (!q.hint1 || !q.solution) { return false; }

    if (q.interaction === "choice" || q.interaction === "decision") {
      if (!q.choices || q.choices.length < 2) { return false; }
      if (q.choices.indexOf(q.answer) === -1) { return false; }
      // گزینهٔ تکراری یعنی سؤال خراب است
      var seen = {};
      for (var i = 0; i < q.choices.length; i++) {
        if (seen[q.choices[i]]) { return false; }
        seen[q.choices[i]] = true;
      }
      return true;
    }

    if (q.interaction === "numpad") {
      return typeof q.answer === "number" && isFinite(q.answer) && q.answer >= 0;
    }

    if (q.interaction === "order") {
      return !!(q.items && q.items.length >= 2 && q.correctOrder);
    }

    if (q.interaction === "drag") {
      if (!q.items || !q.items.length || !q.zones || !q.zones.length) { return false; }
      for (var j = 0; j < q.items.length; j++) {
        var zone = q.items[j].zone, found = false;
        for (var k = 0; k < q.zones.length; k++) {
          if (q.zones[k].id === zone) { found = true; break; }
        }
        if (!found) { return false; }
      }
      return true;
    }

    return false;
  }

  /* ============================================================
     سنجش پاسخ دانش‌آموز
     ============================================================ */

  /**
   * آیا پاسخ درست است؟
   * @param {Object} q سؤال
   * @param {*} resp پاسخ دانش‌آموز:
   *   choice/decision → متن گزینه
   *   numpad          → عدد یا رشتهٔ عدد
   *   order           → آرایهٔ شناسه‌ها به ترتیبی که چیده شده
   *   drag            → شیء { شناسهٔ مورد: شناسهٔ منطقه }
   */
  function check(q, resp) {
    if (!q) { return false; }

    switch (q.interaction) {

      case "choice":
      case "decision":
        return resp === q.answer;

      case "numpad":
        var n = parseNumber(resp);
        return n !== null && n === q.answer;

      case "order":
        if (!resp || resp.length !== q.correctOrder.length) { return false; }
        for (var i = 0; i < resp.length; i++) {
          if (resp[i] !== q.correctOrder[i]) { return false; }
        }
        return true;

      case "drag":
        if (!resp) { return false; }
        for (var id in q.correctZones) {
          if (!q.correctZones.hasOwnProperty(id)) { continue; }
          if (resp[id] !== q.correctZones[id]) { return false; }
        }
        return true;

      default:
        return false;
    }
  }

  /**
   * چند مورد از پاسخ درست است — برای بازخورد دقیق‌تر در
   * سؤال‌های کشیدنی و مرتب‌سازی.
   * @returns {Object} { right, total }
   */
  function partialScore(q, resp) {
    var right = 0, total = 0, i;

    if (q.interaction === "drag" && resp) {
      for (var id in q.correctZones) {
        if (!q.correctZones.hasOwnProperty(id)) { continue; }
        total++;
        if (resp[id] === q.correctZones[id]) { right++; }
      }
    } else if (q.interaction === "order" && resp) {
      total = q.correctOrder.length;
      for (i = 0; i < resp.length && i < total; i++) {
        if (resp[i] === q.correctOrder[i]) { right++; }
      }
    } else {
      total = 1;
      right = check(q, resp) ? 1 : 0;
    }

    return { right: right, total: total };
  }

  /** تبدیل ورودی به عدد؛ رقم‌های فارسی و عربی هم پذیرفته می‌شوند */
  function parseNumber(v) {
    if (typeof v === "number") { return isFinite(v) ? v : null; }
    if (typeof v !== "string") { return null; }

    var fa = "۰۱۲۳۴۵۶۷۸۹";
    var ar = "٠١٢٣٤٥٦٧٨٩";
    var out = "";
    for (var i = 0; i < v.length; i++) {
      var ch = v.charAt(i);
      var f = fa.indexOf(ch);
      var a = ar.indexOf(ch);
      if (f !== -1) { out += String(f); }
      else if (a !== -1) { out += String(a); }
      else if (ch >= "0" && ch <= "9") { out += ch; }
      else if (ch === "-" && out === "") { out += ch; }
    }
    if (out === "" || out === "-") { return null; }
    var n = parseInt(out, 10);
    return isFinite(n) ? n : null;
  }

  function warn(msg, err) {
    if (window.console) { console.warn("[سازندهٔ سؤال] " + msg, err || ""); }
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    make: make,
    check: check,
    partialScore: partialScore,
    validate: validate,
    parseNumber: parseNumber
  };
})();
