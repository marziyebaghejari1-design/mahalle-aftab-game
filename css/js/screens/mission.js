/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/mission.js — زمین بازی

   چرخهٔ هر سؤال:
   نمایش موقعیت → پاسخ دانش‌آموز → بررسی → بازخورد سه‌پله‌ای
   → (در صورت لزوم تلاش دوباره) → سؤال بعدی

   در پایان مأموریت، اگر مهارتی سخت بوده، یک سؤال مرور از همان
   مهارت اضافه می‌شود. این همان ارزشیابی تکوینی است: خطا به
   فرصت تمرین تبدیل می‌شود، نه به نمرهٔ کم.

   وابستگی: تقریباً همهٔ فایل‌های موتور و رابط کاربری
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  var questions = [];      // سؤال‌های این مأموریت
  var index = 0;           // سؤال جاری
  var attempt = 0;         // چندمین تلاش روی سؤال جاری
  var hintsUsed = 0;       // چند بار دکمهٔ راهنما زده شده
  var controller = null;   // کنترل‌کنندهٔ ناحیهٔ پاسخ
  var station = null;
  var reviewAdded = false;
  var finished = false;

  APP.Router.register("mission", {
    el: "screen-mission",
    topbar: true,
    title: "مأموریت",
    onEnter: start,
    onLeave: cleanup
  });

  /* ============================================================
     شروع مأموریت
     ============================================================ */

  function start(params) {
    var id = (params && params.stationId) || APP.State.nextStation() || 1;
    station = APP.Stations.get(id);
    if (!station) { APP.Router.go("map"); return; }

    APP.State.resetSession();
    APP.State.session.stationId = id;
    APP.Adaptive.reset();

    reviewAdded = false;
    finished = false;
    index = 0;

    questions = APP.Selector.buildMission(id, APP.Adaptive.level(), APP.rnd);

    if (!questions.length) {
      U.dialog({
        icon: "🙁",
        title: "این مأموریت آماده نیست",
        text: "بیا یک جای دیگر محله را امتحان کنیم.",
        actions: [{ label: "برگرد به نقشه", onTap: function () { APP.Router.go("map"); } }]
      });
      return;
    }

    APP.Router.screens.mission.title = station.name;
    var place = D.getElementById("topbar-place");
    if (place) { place.textContent = station.icon + " " + station.name; }

    drawDots();
    showIntro();
  }

  /** حرف اول فندق دربارهٔ مشکل این مکان */
  function showIntro() {
    U.dialog({
      icon: station.icon,
      title: station.name,
      text: station.story,
      dismissable: false,
      actions: [{ label: "شروع کنیم!", onTap: function () { showQuestion(); } }]
    });
  }

  /* ============================================================
     نمایش یک سؤال
     ============================================================ */

  function showQuestion() {
    var q = questions[index];
    if (!q) { finish(); return; }

    attempt = 0;
    hintsUsed = 0;

    APP.Router.setSubtitle("فعالیت " + U.fa(index + 1) + " از " + U.fa(questions.length));
    drawDots();

    // حرف فندق
    var story = D.getElementById("mission-story");
    story.textContent = q.story || station.task;

    // متن خواندنی (درک مطلب)
    var stem = D.getElementById("q-stem");
    U.clear(stem);
    if (q.passage) {
      var box = U.el("p", "feedback__step", q.passage);
      box.style.marginBottom = "12px";
      stem.appendChild(box);
    }
    stem.appendChild(D.createTextNode(q.stem));

    // شکل کمکی
    drawVisual(q);

    // ناحیهٔ پاسخ
    controller = APP.Interactions.render(q, D.getElementById("q-interaction"), function (has) {
      D.getElementById("btn-check").disabled = !has;
    });

    // چرک‌نویس فقط در سؤال‌های ریاضی
    APP.Scratchpad.forQuestion(q);

    // دکمه‌ها و بازخورد
    hideFeedback();
    D.getElementById("btn-check").hidden = false;
    D.getElementById("btn-check").disabled = true;
    D.getElementById("btn-next").hidden = true;
    D.getElementById("btn-hint").hidden = false;
    D.getElementById("btn-hint").disabled = false;

    U.announce(q.stem);
  }

  /* ============================================================
     شکل‌های کمکی کنار سؤال
     ============================================================ */

  function drawVisual(q) {
    var box = U.clear(D.getElementById("q-visual"));
    var v = q.visual;
    if (!v) { return; }

    var wrap = U.el("div", "viz");
    var i, j, row;

    switch (v.kind) {

      case "grid":            // ردیف‌های هم‌اندازه (ضرب)
        for (i = 0; i < Math.min(v.rows, 10); i++) {
          row = U.el("div", "viz__row");
          for (j = 0; j < Math.min(v.cols, 12); j++) {
            row.appendChild(U.el("span", "viz__cell", v.icon));
          }
          wrap.appendChild(row);
        }
        break;

      case "packs":           // بسته‌های هم‌اندازه
        for (i = 0; i < Math.min(v.packs, 8); i++) {
          var g = U.el("div", "viz__group");
          for (j = 0; j < Math.min(v.perPack, 12); j++) {
            g.appendChild(U.el("span", "viz__cell", v.icon));
          }
          wrap.appendChild(g);
        }
        break;

      case "share":           // تقسیم بین چند گروه
        wrap.appendChild(U.el("span", "viz__label",
          U.fa(v.total) + " " + v.icon + " بین " + U.fa(v.groups) + " نفر"));
        break;

      case "fraction":        // کسر ساده
        row = U.el("div", "viz__parts");
        for (i = 0; i < v.parts; i++) {
          row.appendChild(U.el("div", "viz__part" + (i < v.filled ? " is-filled" : "")));
        }
        wrap.appendChild(row);
        break;

      case "fraction-pair":   // مقایسهٔ دو کسر
        wrap.appendChild(fractionRow("باغچهٔ اول", v.den, v.a));
        wrap.appendChild(fractionRow("باغچهٔ دوم", v.den, v.b));
        break;

      case "rect":            // محیط یا مساحت
        var rect = U.el("div", "viz__rect", U.fa(v.h) + " × " + U.fa(v.w));
        rect.setAttribute("data-mode", v.mode);
        rect.style.width = Math.min(60 + v.w * 12, 240) + "px";
        rect.style.height = Math.min(40 + v.h * 10, 160) + "px";
        wrap.appendChild(rect);
        wrap.appendChild(U.el("span", "viz__label",
          v.mode === "area" ? "کف میدان" : "دور تا دور میدان"));
        break;

      case "pattern":         // الگوی شکلی
        for (i = 0; i < v.items.length; i++) {
          wrap.appendChild(U.el("span", "viz__cell", v.items[i].icon));
        }
        wrap.appendChild(U.el("span", "viz__q", "؟"));
        break;

      case "sequence":        // الگوی عددی
        for (i = 0; i < v.items.length; i++) {
          wrap.appendChild(U.el("span", "viz__step", U.fa(v.items[i])));
        }
        wrap.appendChild(U.el("span", "viz__q", "؟"));
        break;

      case "watts":           // مقایسهٔ مصرف
        var list = U.el("div", "viz__list");
        var max = 1;
        for (i = 0; i < v.items.length; i++) { max = Math.max(max, v.items[i].watt); }
        for (i = 0; i < v.items.length; i++) {
          var it = U.el("div", "viz__item");
          it.appendChild(U.el("span", "", v.items[i].icon + " " + v.items[i].name));
          var bar = U.el("span", "viz__bar");
          bar.style.width = Math.round((v.items[i].watt / max) * 100) + "px";
          bar.title = v.items[i].watt + " وات";
          it.appendChild(bar);
          list.appendChild(it);
        }
        wrap.appendChild(list);
        break;

      case "receipt":         // فهرست خرید
        var rl = U.el("div", "viz__list");
        for (i = 0; i < v.items.length; i++) {
          var line = U.el("div", "viz__item");
          line.appendChild(U.el("span", "", v.items[i].icon + " " + v.items[i].name));
          line.appendChild(U.el("span", "", U.fa(v.items[i].price)));
          rl.appendChild(line);
        }
        wrap.appendChild(rl);
        break;

      case "sign":            // تابلوی راهنما
        var sign = U.el("div", "viz__sign", v.icon);
        sign.appendChild(U.el("span", "viz__label", v.name));
        wrap.appendChild(sign);
        break;

      case "path":            // مسیر روی نقشه
        var path = U.el("div", "viz__path");
        path.appendChild(U.el("span", "viz__step", v.from.icon + " " + v.from.name));
        for (i = 0; i < v.steps.length; i++) {
          path.appendChild(U.el("span", "", "←"));
          path.appendChild(U.el("span", "viz__step", v.steps[i]));
        }
        path.appendChild(U.el("span", "", "←"));
        path.appendChild(U.el("span", "viz__step", v.to.icon + " " + v.to.name));
        wrap.appendChild(path);
        break;

      default:
        return;
    }

    box.appendChild(wrap);
  }

  function fractionRow(label, den, filled) {
    var wrap = U.el("div", "viz__row");
    wrap.appendChild(U.el("span", "viz__label", label));
    var parts = U.el("div", "viz__parts");
    for (var i = 0; i < den; i++) {
      parts.appendChild(U.el("div", "viz__part" + (i < filled ? " is-filled" : "")));
    }
    wrap.appendChild(parts);
    return wrap;
  }

  /* ============================================================
     نقطه‌های پیشرفت
     ============================================================ */

  function drawDots() {
    var box = U.clear(D.getElementById("step-dots"));
    for (var i = 0; i < questions.length; i++) {
      var cls = "step-dot";
      if (i < index) { cls += " is-done"; }
      else if (i === index) { cls += " is-current"; }
      if (questions[i].isReview) { cls += " is-review"; }

      var dot = U.el("li", cls);
      dot.setAttribute("aria-label", "فعالیت " + (i + 1));
      box.appendChild(dot);
    }
  }

  /* ============================================================
     بررسی پاسخ
     ============================================================ */

  function checkAnswer() {
    if (!controller || finished) { return; }
    var q = questions[index];
    var resp = controller.getResponse();
    if (!controller.hasResponse()) { return; }

    attempt++;
    var result = APP.Feedback.judge(q, resp, attempt);
    APP.Feedback.sound(result);
    showFeedback(result);

    if (result.correct) {
      controller.lock();
      finishQuestion(q, true);
      return;
    }

    if (result.done) {
      // پلهٔ سوم: راه حل نشان داده شد
      controller.lock();
      if (controller.reveal) { controller.reveal(); }
      finishQuestion(q, false);
      return;
    }

    // هنوز فرصت هست
    if (controller.markWrong) { controller.markWrong(); }
    D.getElementById("btn-check").disabled = true;
  }

  /** ثبت نتیجه و آماده‌کردن دکمهٔ ادامه */
  function finishQuestion(q, solved) {
    var res = APP.Scoring.recordAnswer(q, solved, attempt, hintsUsed);

    if (solved) {
      U.coinFly(D.getElementById("btn-check"), res.coins);
    }

    var change = APP.Adaptive.record(solved, attempt);
    if (change) {
      U.toast(change.message, 3200);
    }

    D.getElementById("btn-check").hidden = true;
    D.getElementById("btn-hint").disabled = true;
    var next = D.getElementById("btn-next");
    next.hidden = false;
    next.textContent = (index >= questions.length - 1) ? "پایان مأموریت" : "ادامه";
    try { next.focus({ preventScroll: true }); } catch (e) { /* بی‌اهمیت */ }
  }

  /* ============================================================
     بازخورد
     ============================================================ */

  function showFeedback(result) {
    var panel = D.getElementById("feedback-panel");
    D.getElementById("feedback-icon").textContent = result.icon || "";
    D.getElementById("feedback-text").textContent = result.text || "";

    var steps = U.clear(D.getElementById("feedback-steps"));
    for (var i = 0; i < (result.steps || []).length; i++) {
      if (!result.steps[i]) { continue; }
      steps.appendChild(U.el("p", "feedback__step", result.steps[i]));
    }

    U.toggleClass(panel, "feedback--correct", result.tone === "correct");
    panel.hidden = false;
  }

  function hideFeedback() {
    var panel = D.getElementById("feedback-panel");
    panel.hidden = true;
    U.clear(D.getElementById("feedback-steps"));
    D.getElementById("feedback-text").textContent = "";
    D.getElementById("feedback-icon").textContent = "";
  }

  /* ============================================================
     راهنمای درخواستی
     ============================================================ */

  function askHint() {
    var q = questions[index];
    if (!q || finished) { return; }

    hintsUsed++;
    var help = APP.Feedback.askedHint(q, hintsUsed);
    showFeedback({ icon: help.icon, text: help.text, steps: help.steps, tone: "try" });

    if (hintsUsed >= 3) {
      D.getElementById("btn-hint").disabled = true;
    }
  }

  /* ============================================================
     سؤال بعدی و پایان مأموریت
     ============================================================ */

  function nextQuestion() {
    // اگر سؤال‌های اصلی تمام شد، یک سؤال مرور اضافه می‌کنیم
    if (index >= questions.length - 1 && !reviewAdded) {
      var weak = APP.Selector.weakSkillsOfSession();
      if (weak.length) {
        var seen = {};
        for (var i = 0; i < questions.length; i++) { seen[questions[i].stem] = true; }

        var rq = APP.Selector.reviewQuestion(weak[0], APP.Adaptive.level(), APP.rnd, seen);
        if (rq) {
          questions.push(rq);
          reviewAdded = true;
          index++;
          U.toast("یک تمرین دیگر از همان چیزی که سخت بود 💪", 2800);
          showQuestion();
          return;
        }
      }
      reviewAdded = true;
    }

    if (index >= questions.length - 1) { finish(); return; }

    index++;
    showQuestion();
  }

  function finish() {
    if (finished) { return; }
    finished = true;

    var report = APP.Scoring.finishMission(station.id, questions.length);
    var msg = APP.Feedback.missionMessage(report.stars, station);

    // نشان‌های تازه را یکی‌یکی خبر می‌دهیم
    for (var i = 0; i < report.newBadges.length; i++) {
      (function (badge, delay) {
        setTimeout(function () {
          U.toast("نشان تازه: " + badge.icon + " " + badge.name, 3000);
        }, 900 + delay * 1200);
      })(report.newBadges[i], i);
    }

    U.dialog({
      icon: msg.icon,
      title: msg.title,
      text: msg.text + " " + U.fa(report.rightFirstTry) + " از " + U.fa(report.total) +
            " فعالیت را در همان تلاش اول درست انجام دادی.",
      stars: report.stars,
      dismissable: false,
      actions: buildEndActions(report)
    });
  }

  function buildEndActions(report) {
    var actions = [];

    if (report.allDone && !APP.State.data.progress.finished) {
      actions.push({ label: "برویم به جشن! 🎉", kind: "primary", onTap: function () {
        APP.Router.go("celebration");
      } });
    } else {
      actions.push({ label: "برگرد به محله", kind: "primary", onTap: function () {
        APP.Router.go("map");
      } });
    }

    actions.push({ label: "فروشگاه تزیین", kind: "ghost", onTap: function () {
      APP.Router.go("shop");
    } });

    return actions;
  }

  /* ============================================================
     پاک‌سازی
     ============================================================ */

  function cleanup() {
    if (APP.Scratchpad) { APP.Scratchpad.forQuestion(false); }
    if (controller && controller.lock) { controller.lock(); }
    controller = null;
    hideFeedback();
    APP.Router.setSubtitle("");
  }

  /* ---------- دکمه‌ها ---------- */

  U.onTap(D.getElementById("btn-check"), checkAnswer);
  U.onTap(D.getElementById("btn-next"), nextQuestion);
  U.onTap(D.getElementById("btn-hint"), askHint);
})();
