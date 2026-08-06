/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/engine/selector.js — چیدن سؤال‌های یک مأموریت

   این فایل تصمیم می‌گیرد دانش‌آموز در هر مأموریت چه سؤال‌هایی
   ببیند. کارش فقط انتخاب تصادفی نیست؛ چند قانون دارد:

   ۱. تا وقتی الگوی استفاده‌نشده هست، سراغ الگوی تکراری نمی‌رود.
   ۲. دو سؤال پشت‌سرهم از یک مهارت نمی‌آید (خسته‌کننده می‌شود).
   ۳. نوع تعامل هم عوض می‌شود؛ پنج سؤال چهارگزینه‌ای پشت هم نه.
   ۴. اگر الگوهای یک سطح کم بود، از سطح کناری قرض می‌گیرد.
      (مثلاً ایستگاه میدان در سطح آسان الگوی کمی دارد.)
   ۵. هیچ دو سؤالی با صورت یکسان در یک مأموریت نمی‌آید.

   وابستگی: APP.Bank، APP.Generator، APP.State
   ============================================================ */

var APP = APP || {};

APP.Selector = (function () {
  "use strict";

  /* ============================================================
     ساخت فهرست سؤال‌های یک مأموریت
     ============================================================ */

  /**
   * @param {number} stationId شمارهٔ ایستگاه
   * @param {number} level سطح بازی
   * @param {Object} rnd تولیدکنندهٔ تصادفی
   * @param {number} [count] تعداد سؤال؛ پیش‌فرض از خود ایستگاه
   * @returns {Array} فهرست سؤال‌های آماده
   */
  function buildMission(stationId, level, rnd, count) {
    var need = count || (APP.Stations ? APP.Stations.stepsOf(stationId) : 5);
    var pool = templatePool(stationId, level);

    if (!pool.length) {
      warn("برای ایستگاه " + stationId + " هیچ الگویی پیدا نشد.");
      return [];
    }

    var questions = [];
    var usedIds = {};
    var seenStems = {};
    var lastSkill = "";
    var lastKind = "";
    var guard = 0;

    while (questions.length < need && guard < need * 25) {
      guard++;

      var tpl = pickNext(rnd, pool, usedIds, lastSkill, lastKind);
      if (!tpl) {
        // همهٔ الگوها استفاده شده‌اند؛ دور تازه‌ای شروع می‌کنیم
        usedIds = {};
        tpl = pickNext(rnd, pool, usedIds, lastSkill, lastKind);
        if (!tpl) { break; }
      }

      var q = APP.Generator.make(tpl, level, rnd);
      if (!q) {
        // الگوی خراب: از این مأموریت کنارش می‌گذاریم
        usedIds[tpl.id] = true;
        continue;
      }
      if (seenStems[q.stem]) { continue; }   // سؤال تکراری

      seenStems[q.stem] = true;
      usedIds[tpl.id] = true;
      lastSkill = q.skill;
      lastKind = q.interaction;
      questions.push(q);
    }

    return questions;
  }

  /**
   * فهرست الگوهای مناسب.
   * اول سطح خواسته‌شده، و اگر کم بود سطح‌های کناری.
   */
  function templatePool(stationId, level) {
    var exact = APP.Bank.forStation(stationId, level);
    if (exact.length >= 6) { return exact; }

    var all = APP.Bank.forStation(stationId);
    var pool = exact.slice();
    var have = {};
    for (var i = 0; i < pool.length; i++) { have[pool[i].id] = true; }

    // نزدیک‌ترین سطح‌ها را اضافه می‌کنیم
    var order = level === 1 ? [2, 3] : (level === 3 ? [2, 1] : [1, 3]);
    for (var o = 0; o < order.length && pool.length < 6; o++) {
      for (var j = 0; j < all.length; j++) {
        if (have[all[j].id]) { continue; }
        if (all[j].levels.indexOf(order[o]) === -1) { continue; }
        have[all[j].id] = true;
        pool.push(all[j]);
      }
    }
    return pool.length ? pool : all;
  }

  /**
   * انتخاب الگوی بعدی با رعایت تنوع.
   * ترتیب اولویت:
   *   ۱. استفاده‌نشده، مهارت تازه، تعامل تازه
   *   ۲. استفاده‌نشده، مهارت تازه
   *   ۳. الگوی تکراری ولی با مهارت تازه — چون سؤالش با عددها و
   *      واژه‌های تازه ساخته می‌شود و باز هم متفاوت است؛ این از
   *      دو سؤال پشت‌سرهم با یک مهارت بهتر است
   *   ۴. هر الگوی استفاده‌نشده
   */
  function pickNext(rnd, pool, usedIds, lastSkill, lastKind) {
    var strict = [], mid = [], alt = [], loose = [], i, t;

    for (i = 0; i < pool.length; i++) {
      t = pool[i];
      var freshSkill = (t.skill !== lastSkill);

      if (usedIds[t.id]) {
        if (freshSkill) { alt.push(t); }
        continue;
      }
      loose.push(t);
      if (!freshSkill) { continue; }
      mid.push(t);
      if (t.interaction === lastKind) { continue; }
      strict.push(t);
    }

    if (strict.length) { return rnd.pick(strict); }
    if (mid.length)    { return rnd.pick(mid); }
    if (alt.length)    { return rnd.pick(alt); }
    if (loose.length)  { return rnd.pick(loose); }
    return null;
  }

  /* ============================================================
     سؤال مرور
     ============================================================ */

  /**
   * ساخت یک سؤال تازه از همان مهارتی که دانش‌آموز در آن لغزیده.
   * این قلب ارزشیابی تکوینی است: خطا به جای نمرهٔ منفی، به
   * فرصت تمرین دوباره تبدیل می‌شود.
   *
   * @param {string} skillId شناسهٔ مهارت
   * @param {number} level سطح
   * @param {Object} rnd تولیدکنندهٔ تصادفی
   * @param {Object} [avoidStems] صورت سؤال‌هایی که نباید تکرار شوند
   */
  function reviewQuestion(skillId, level, rnd, avoidStems) {
    var pool = APP.Bank.forSkill(skillId, level);
    if (!pool.length) { pool = APP.Bank.forSkill(skillId); }
    if (!pool.length) { return null; }

    for (var i = 0; i < 8; i++) {
      var q = APP.Generator.make(rnd.pick(pool), level, rnd);
      if (!q) { continue; }
      if (avoidStems && avoidStems[q.stem]) { continue; }
      q.isReview = true;
      return q;
    }
    return null;
  }

  /**
   * مهارت‌هایی که در همین مأموریت سخت بوده‌اند.
   * فقط مهارت‌هایی برمی‌گردند که دانش‌آموز در آن‌ها بیش از یک
   * بار تلاش کرده است.
   */
  function weakSkillsOfSession() {
    var s = APP.State && APP.State.session;
    if (!s || !s.reviewQueue.length) { return []; }

    var seen = {}, out = [];
    for (var i = 0; i < s.reviewQueue.length; i++) {
      var id = s.reviewQueue[i];
      if (seen[id]) { continue; }
      seen[id] = true;
      out.push(id);
    }
    return out;
  }

  /* ============================================================
     گزارش تنوع — برای بررسی کیفیت
     ============================================================ */

  /**
   * تخمین تعداد سؤال‌های ممکن یک ایستگاه.
   * برای ارائه در جشنواره و برای بررسی اینکه بانک به‌اندازهٔ
   * کافی بزرگ هست یا نه.
   */
  function varietyReport(stationId, level, rnd, samples) {
    samples = samples || 200;
    var stems = {}, n = 0, i;
    var pool = templatePool(stationId, level);

    for (i = 0; i < samples; i++) {
      var q = APP.Generator.make(rnd.pick(pool), level, rnd);
      if (!q) { continue; }
      if (!stems[q.stem]) { stems[q.stem] = true; n++; }
    }
    return { templates: pool.length, uniqueStems: n, samples: samples };
  }

  function warn(msg) {
    if (window.console) { console.warn("[چینش سؤال] " + msg); }
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    buildMission: buildMission,
    reviewQuestion: reviewQuestion,
    weakSkillsOfSession: weakSkillsOfSession,
    templatePool: templatePool,
    varietyReport: varietyReport
  };
})();
