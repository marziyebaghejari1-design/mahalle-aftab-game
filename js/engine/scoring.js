/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/engine/scoring.js — سکه، ستاره و پایان مأموریت

   ── سکه ──
   تلاش اول ......... ۵ سکه
   تلاش دوم ......... ۳ سکه
   تلاش سوم ......... ۱ سکه
   با راهنمای درخواستی ... یک سکه کمتر (ولی هیچ‌وقت صفر نمی‌شود)
   وقتی راه حل نشان داده شد ... ۱ سکه (برای همراهی تا آخر)

   هیچ‌وقت سکه کم نمی‌شود. تنبیه در بازی آموزشی کودک جایی ندارد؛
   فقط پاداش کم و زیاد می‌شود.

   ── ستاره ──
   ستارهٔ مأموریت از روی «درصد پاسخ‌های تلاش‌اول» حساب می‌شود،
   نه از روی سرعت. یعنی دانش‌آموزی که آرام ولی درست کار می‌کند
   امتیاز کامل می‌گیرد.
     ۸۰٪ و بالاتر → ۳ ستاره
     ۵۰٪ تا ۷۹٪  → ۲ ستاره
     کمتر از ۵۰٪ → ۱ ستاره  (هیچ‌وقت صفر ستاره نمی‌دهیم)

   وابستگی: APP.State، APP.Badges، APP.Stations، APP.Audio
   ============================================================ */

var APP = APP || {};

APP.Scoring = (function () {
  "use strict";

  var COIN_BY_ATTEMPT = { 1: 5, 2: 3, 3: 1 };
  var COIN_REVEALED = 1;
  var HINT_PENALTY = 1;

  /* ============================================================
     سکهٔ یک پاسخ
     ============================================================ */

  /**
   * @param {boolean} solved آیا خودش حل کرد
   * @param {number} attempt چندمین تلاش
   * @param {number} hintsUsed چند بار دکمهٔ راهنما را زده
   */
  function coinsFor(solved, attempt, hintsUsed) {
    var base = solved ? (COIN_BY_ATTEMPT[attempt] || 1) : COIN_REVEALED;
    base -= (hintsUsed || 0) * HINT_PENALTY;
    return Math.max(1, base);
  }

  /**
   * ثبت نتیجهٔ یک سؤال: سکه، آمار مهارت و صف مرور.
   * @returns {Object} { coins, newBadges }
   */
  function recordAnswer(q, solved, attempt, hintsUsed) {
    var coins = coinsFor(solved, attempt, hintsUsed);
    var s = APP.State.session;

    APP.State.addCoins(coins);
    APP.State.recordAnswer(q.subject, q.skill, attempt, solved);

    if (s) {
      if (solved && attempt <= 1 && !hintsUsed) { s.rightFirstTry++; }
      // اگر تا پلهٔ سوم رفت یا حل نشد، این مهارت باید مرور شود
      if (!solved || attempt >= 3) {
        if (s.reviewQueue.indexOf(q.skill) === -1) {
          s.reviewQueue.push(q.skill);
        }
      }
    }

    if (APP.Audio) {
      if (solved) { APP.Audio.coin(); }
    }

    return { coins: coins, newBadges: [] };
  }

  /* ============================================================
     پایان مأموریت
     ============================================================ */

  /** ستارهٔ مأموریت از روی درصد پاسخ‌های تلاش‌اول */
  function starsFor(rightFirstTry, total) {
    if (!total) { return 1; }
    var pct = (rightFirstTry / total) * 100;
    if (pct >= 80) { return 3; }
    if (pct >= 50) { return 2; }
    return 1;
  }

  /**
   * بستن مأموریت: ستاره، سکهٔ پاداش، چراغ و نشان‌ها.
   * @param {number} stationId شمارهٔ ایستگاه
   * @param {number} total تعداد کل سؤال‌های مأموریت
   * @returns {Object} گزارش کامل برای صفحهٔ پایان
   */
  function finishMission(stationId, total) {
    var s = APP.State.session || { rightFirstTry: 0, coinsEarned: 0 };
    var stars = starsFor(s.rightFirstTry, total);

    // پاداش پایان مأموریت: به ازای هر ستاره ۱۰ سکه
    var bonus = stars * 10;
    APP.State.addCoins(bonus);

    var result = APP.State.completeStation(stationId, stars);
    var badges = APP.Badges ? APP.Badges.checkAll() : [];

    if (APP.Audio) {
      APP.Audio.lamp();
      if (badges.length) { APP.Audio.badge(); }
    }

    return {
      stationId: stationId,
      stars: stars,
      bonus: bonus,
      coinsEarned: s.coinsEarned + bonus,
      rightFirstTry: s.rightFirstTry,
      total: total,
      percent: total ? Math.round((s.rightFirstTry / total) * 100) : 0,
      isNew: result.isNew,
      best: result.best,
      newBadges: badges,
      lamps: APP.State.lampsLit(),
      allDone: APP.State.allStationsDone()
    };
  }

  /* ============================================================
     خلاصهٔ کارنامه
     ============================================================ */

  /**
   * ساخت دادهٔ کارنامه از روی آمار مهارت‌ها.
   * @returns {Object} { subjects, strengths, practice, overall }
   */
  function reportData() {
    var skills = APP.State.data.skills;
    var bySubject = {}, rows = [], id, s;

    for (id in skills) {
      if (!skills.hasOwnProperty(id)) { continue; }
      s = skills[id];
      if (!s.asked) { continue; }

      var score = APP.State.skillScore(id);
      var name = skillName(id);

      rows.push({ id: id, name: name, subject: s.subject, score: score, asked: s.asked });

      if (!bySubject[s.subject]) { bySubject[s.subject] = { sum: 0, n: 0, asked: 0 }; }
      bySubject[s.subject].sum += score;
      bySubject[s.subject].n++;
      bySubject[s.subject].asked += s.asked;
    }

    var subjects = [];
    for (var sub in bySubject) {
      if (!bySubject.hasOwnProperty(sub)) { continue; }
      var b = bySubject[sub];
      subjects.push({
        name: sub,
        score: Math.round(b.sum / b.n),
        asked: b.asked,
        tone: tone(Math.round(b.sum / b.n))
      });
    }
    subjects.sort(function (a, b2) { return b2.score - a.score; });

    // مرتب‌سازی مهارت‌ها برای نقاط قوت و تمرین بیشتر
    rows.sort(function (a, b3) { return b3.score - a.score; });

    var strengths = [], practice = [], i;
    for (i = 0; i < rows.length && strengths.length < 4; i++) {
      if (rows[i].score >= 70) { strengths.push(rows[i]); }
    }
    for (i = rows.length - 1; i >= 0 && practice.length < 4; i--) {
      if (rows[i].score < 70) { practice.push(rows[i]); }
    }

    var overall = 0;
    for (i = 0; i < rows.length; i++) { overall += rows[i].score; }
    overall = rows.length ? Math.round(overall / rows.length) : 0;

    return {
      subjects: subjects,
      strengths: strengths,
      practice: practice,
      overall: overall,
      answers: APP.State.data.stats.answers,
      skillCount: rows.length
    };
  }

  /** پیدا کردن نام فارسی یک مهارت از روی بانک الگوها */
  function skillName(skillId) {
    var list = APP.Bank ? APP.Bank.forSkill(skillId) : [];
    if (list.length && list[0].skillName) { return list[0].skillName; }
    return skillId;
  }

  /** رنگ نوار کارنامه */
  function tone(score) {
    if (score >= 70) { return "high"; }
    if (score >= 40) { return "mid"; }
    return "low";
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    coinsFor: coinsFor,
    recordAnswer: recordAnswer,
    starsFor: starsFor,
    finishMission: finishMission,
    reportData: reportData,
    skillName: skillName,
    tone: tone
  };
})();
