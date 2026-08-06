/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/ui/report.js — ساخت کارنامهٔ قهرمان

   کارنامه، نمرهٔ امتحان نیست. هدفش این است که دانش‌آموز و معلم
   ببینند کدام مهارت‌ها جا افتاده و کدام‌ها تمرین بیشتری لازم
   دارند. به همین دلیل:

   • هیچ نمرهٔ کلی از ۲۰ داده نمی‌شود.
   • هیچ مقایسه‌ای با دانش‌آموز دیگری وجود ندارد.
   • بخش «تمرین بیشتر» هیچ‌وقت با لحن منفی نوشته نمی‌شود.
   • حتی وقتی درصدها پایین است، بخش «نقاط قوت» خالی نمی‌ماند.

   کارنامه قابل چاپ است تا معلم بتواند در پرونده بگذارد.

   وابستگی: APP.UI، APP.Scoring، APP.State، APP.Badges
   ============================================================ */

var APP = APP || {};

APP.Report = (function () {
  "use strict";

  var U = APP.UI;

  /* ============================================================
     ساخت کارنامه
     ============================================================ */

  function build() {
    var data = APP.Scoring.reportData();

    head();
    skills(data);
    strengths(data);
    practice(data);
    badges();

    return data;
  }

  /* ---------- سربرگ ---------- */

  function head() {
    var name = U.$("report-name");
    if (name) {
      name.textContent = APP.State.data.player.name || "قهرمان محله";
    }

    var date = U.$("report-date");
    if (date) {
      date.textContent = today() + " — " +
        U.fa(APP.State.lampsLit()) + " مأموریت از " +
        U.fa(APP.State.totalStations()) + " تمام شده";
    }
  }

  /** تاریخ امروز به شمسی، و اگر ممکن نبود به میلادی */
  function today() {
    var d = new Date();
    try {
      return d.toLocaleDateString("fa-IR-u-ca-persian", {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch (err) {
      try {
        return d.toLocaleDateString("fa-IR");
      } catch (err2) {
        return U.fa(d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate());
      }
    }
  }

  /* ---------- نوار مهارت‌ها ---------- */

  function skills(data) {
    var box = U.clear(U.$("skill-bars"));
    if (!box) { return; }

    if (!data.subjects.length) {
      box.appendChild(emptyNote("هنوز مأموریتی انجام نداده‌ای. با اولین مأموریت، کارنامه‌ات ساخته می‌شود."));
      return;
    }

    for (var i = 0; i < data.subjects.length; i++) {
      var s = data.subjects[i];
      box.appendChild(U.skillBar(s.name, s.score, s.tone));
    }

    // یک نوار جمع‌بندی، جدا از درس‌ها
    var overall = U.skillBar("همهٔ درس‌ها روی هم", data.overall, APP.Scoring.tone(data.overall));
    overall.style.marginTop = "var(--s-3)";
    overall.style.paddingTop = "var(--s-3)";
    overall.style.borderTop = "2px dashed var(--c-line-soft)";
    box.appendChild(overall);
  }

  /* ---------- نقاط قوت ---------- */

  function strengths(data) {
    var box = U.clear(U.$("report-strengths"));
    if (!box) { return; }

    if (data.strengths.length) {
      for (var i = 0; i < data.strengths.length; i++) {
        var s = data.strengths[i];
        box.appendChild(U.el("li", "", s.name + " — " + s.subject));
      }
      return;
    }

    // اگر هنوز مهارتی به ۷۰٪ نرسیده، بهترین‌ها را نشان می‌دهیم
    // تا این بخش هیچ‌وقت خالی و دلسردکننده نباشد
    var best = bestSkills(3);
    if (best.length) {
      for (var j = 0; j < best.length; j++) {
        box.appendChild(U.el("li", "", best[j].name + " — بهتر از بقیه پیش رفته"));
      }
    } else {
      box.appendChild(U.el("li", "", "شروع کردی و تا آخر مأموریت ادامه دادی — همین خودش مهم است."));
    }
  }

  function bestSkills(n) {
    var skillsData = APP.State.data.skills, rows = [], id;
    for (id in skillsData) {
      if (!skillsData.hasOwnProperty(id) || !skillsData[id].asked) { continue; }
      rows.push({ name: APP.Scoring.skillName(id), score: APP.State.skillScore(id) });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    return rows.slice(0, n);
  }

  /* ---------- تمرین بیشتر ---------- */

  function practice(data) {
    var box = U.clear(U.$("report-practice"));
    if (!box) { return; }

    if (!data.practice.length) {
      box.appendChild(U.el("li", "",
        "همهٔ مهارت‌ها خوب پیش رفته‌اند. سطح چالشی را امتحان کن!"));
      return;
    }

    for (var i = 0; i < data.practice.length; i++) {
      var p = data.practice[i];
      box.appendChild(U.el("li", "", p.name + " — " + whereToPractice(p.id)));
    }
  }

  /**
   * راهنمایی عملی: این مهارت را کجای بازی می‌شود تمرین کرد؟
   * کارنامه بدون این جمله فقط گزارش است؛ با آن، راهنما می‌شود.
   */
  function whereToPractice(skillId) {
    var list = APP.Bank ? APP.Bank.forSkill(skillId) : [];
    if (!list.length) { return "با تکرار مأموریت‌ها تمرین کن"; }

    var names = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      var stations = list[i].stations || [];
      for (var j = 0; j < stations.length; j++) {
        var nm = APP.Stations.nameOf(stations[j]);
        if (!names[nm]) { names[nm] = true; out.push(nm); }
      }
    }
    if (!out.length) { return "با تکرار مأموریت‌ها تمرین کن"; }
    return "در مأموریت " + out.slice(0, 2).join(" و ") + " تمرین کن";
  }

  /* ---------- نشان‌ها ---------- */

  function badges() {
    var box = U.clear(U.$("badge-list"));
    if (!box || !APP.Badges) { return; }

    var all = APP.Badges.all();
    for (var i = 0; i < all.length; i++) {
      box.appendChild(U.badgeCard(all[i], APP.State.hasBadge(all[i].id)));
    }
  }

  function emptyNote(text) {
    var li = U.el("li", "field__hint", text);
    li.style.listStyle = "none";
    return li;
  }

  /* ============================================================
     چاپ
     ============================================================ */

  function print() {
    build();
    // کمی صبر تا نوارها پر شوند، بعد پنجرهٔ چاپ باز شود
    setTimeout(function () {
      try {
        window.print();
      } catch (err) {
        U.toast("چاپ در این مرورگر ممکن نیست.");
      }
    }, 400);
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    build: build,
    print: print
  };
})();
