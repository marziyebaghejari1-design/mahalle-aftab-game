/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/bank.js — دفتر ثبت الگوهای سؤال

   در این بازی هیچ سؤالی به شکل آماده ذخیره نمی‌شود.
   به‌جای آن «الگوی سؤال» ذخیره می‌شود: یک شیء که تابع generate
   دارد و هر بار که صدا زده شود، یک سؤال تازه می‌سازد.

   ── ساختار یک الگو ──
   {
     id:          شناسهٔ یکتا، مثل "MATH_SHOP_CHANGE"
     subject:     نام درس، مثل "ریاضی"
     skill:       شناسهٔ مهارت برای کارنامه، مثل "math.money"
     skillName:   نام فارسی مهارت برای نمایش در کارنامه
     station:     شمارهٔ ایستگاه (۱ تا ۷) یا آرایه‌ای از شماره‌ها
     levels:      در کدام سطح‌ها استفاده شود، مثل [1, 2, 3]
     interaction: نوع تعامل: choice | numpad | drag | order | match | decision
     needsPad:    آیا دفترچه چرک‌نویس نمایش داده شود (پیش‌فرض: فقط ریاضی)
     generate:    function (level, rnd, ctx) → شیء سؤال
   }

   ── چیزی که generate برمی‌گرداند ──
   {
     story:    حرف فندق پیش از سؤال (اختیاری)
     stem:     صورت سؤال
     visual:   نمایش کمکی (اختیاری)
     answer:   پاسخ درست
     choices:  گزینه‌ها (برای choice)
     hint1:    پلهٔ ۱ — سرنخ کوتاه
     hint2:    پلهٔ ۲ — راهنمای گام‌به‌گام
     solution: پلهٔ ۳ — راه‌حل کامل
     why:      دلیل درست بودن، برای بازخورد مثبت
   }

   وابستگی: ندارد. باید پیش از فایل‌های q-*.js بارگذاری شود.
   ============================================================ */

var APP = APP || {};

APP.Bank = (function () {
  "use strict";

  var templates = [];
  var byId = {};
  var VALID_INTERACTIONS = {
    choice: 1, numpad: 1, drag: 1, order: 1, match: 1, decision: 1
  };

  return {

    /**
     * افزودن یک الگوی تازه.
     * معلم فقط با همین تابع می‌تواند سؤال اضافه کند.
     * @returns {boolean} آیا الگو پذیرفته شد
     */
    add: function (tpl) {
      if (!tpl || !tpl.id) {
        this._warn("الگو بدون شناسه رد شد.");
        return false;
      }
      if (byId[tpl.id]) {
        this._warn("شناسهٔ تکراری: " + tpl.id);
        return false;
      }
      if (typeof tpl.generate !== "function") {
        this._warn("الگوی " + tpl.id + " تابع generate ندارد.");
        return false;
      }
      if (!VALID_INTERACTIONS[tpl.interaction]) {
        this._warn("نوع تعامل ناشناخته در " + tpl.id + ": " + tpl.interaction);
        return false;
      }

      // مقدارهای پیش‌فرض
      tpl.levels = tpl.levels || [1, 2, 3];
      tpl.stations = (tpl.station instanceof Array) ? tpl.station : [tpl.station];
      tpl.skill = tpl.skill || (tpl.id.toLowerCase());
      tpl.skillName = tpl.skillName || tpl.topic || tpl.subject;
      if (tpl.needsPad === undefined) {
        tpl.needsPad = (tpl.subject === "ریاضی");
      }

      templates.push(tpl);
      byId[tpl.id] = tpl;
      return true;
    },

    /** افزودن چند الگو با هم */
    addAll: function (list) {
      var ok = 0;
      for (var i = 0; i < list.length; i++) {
        if (this.add(list[i])) { ok++; }
      }
      return ok;
    },

    get: function (id) {
      return byId[id] || null;
    },

    all: function () {
      return templates.slice();
    },

    count: function () {
      return templates.length;
    },

    /**
     * الگوهای مناسب یک ایستگاه و یک سطح.
     * @param {number} stationId شمارهٔ ایستگاه
     * @param {number} level سطح بازی
     */
    forStation: function (stationId, level) {
      var out = [];
      for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        if (t.stations.indexOf(stationId) === -1) { continue; }
        if (level && t.levels.indexOf(level) === -1) { continue; }
        out.push(t);
      }
      return out;
    },

    /** الگوهای یک مهارت مشخص — برای بخش مرور به کار می‌رود */
    forSkill: function (skillId, level) {
      var out = [];
      for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        if (t.skill !== skillId) { continue; }
        if (level && t.levels.indexOf(level) === -1) { continue; }
        out.push(t);
      }
      return out;
    },

    /** گزارش کوتاه از بانک — برای بررسی کیفیت و ارائه در جشنواره */
    summary: function () {
      var bySubject = {}, i, t;
      for (i = 0; i < templates.length; i++) {
        t = templates[i];
        if (!bySubject[t.subject]) {
          bySubject[t.subject] = { templates: 0, skills: {} };
        }
        bySubject[t.subject].templates++;
        bySubject[t.subject].skills[t.skill] = true;
      }
      var out = { total: templates.length, subjects: {} };
      for (var s in bySubject) {
        if (!bySubject.hasOwnProperty(s)) { continue; }
        var skills = 0;
        for (var k in bySubject[s].skills) {
          if (bySubject[s].skills.hasOwnProperty(k)) { skills++; }
        }
        out.subjects[s] = { templates: bySubject[s].templates, skills: skills };
      }
      return out;
    },

    _warn: function (msg) {
      if (window.console) { console.warn("[بانک سؤال] " + msg); }
    }
  };
})();
