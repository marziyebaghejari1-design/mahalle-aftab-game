/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/core/audio.js — صداهای کوتاه بازی

   هیچ فایل صوتی در پروژه نیست. همهٔ صداها همان لحظه با
   Web Audio ساخته می‌شوند. دلیل این تصمیم:
   • حجم پروژه بسیار کم می‌ماند
   • روی پروتکل file:// هیچ مشکلی در بارگذاری پیش نمی‌آید
   • هر صدا دقیقاً به همان کوتاهی و ملایمی که می‌خواهیم درمی‌آید

   قانون آموزشی: هیچ صدای منفی یا خشن ساخته نمی‌شود.
   صدای پاسخ نادرست هم فقط یک نُت پایین و نرم است، نه بوق خطا.

   وابستگی: APP.State (برای خواندن تنظیم صدا)
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var Audio = {

    ctx: null,
    ready: false,
    _unlocked: false,

    /* ---------- راه‌اندازی ---------- */

    /**
     * ساخت زمینهٔ صوتی.
     * مرورگرها اجازهٔ پخش صدا را فقط بعد از اولین لمس یا کلیک
     * کاربر می‌دهند؛ پس اینجا فقط به اولین کنش گوش می‌دهیم.
     */
    init: function () {
      var self = this;

      function unlock() {
        if (self._unlocked) { return; }
        self._unlocked = true;
        self._make();
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
      }

      document.addEventListener("pointerdown", unlock);
      document.addEventListener("keydown", unlock);
      return this;
    },

    _make: function () {
      if (this.ctx) { return this.ctx; }
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) { return null; }
        this.ctx = new Ctx();
        this.ready = true;
      } catch (err) {
        this.ready = false;
      }
      return this.ctx;
    },

    /** آیا صدا باید پخش شود */
    enabled: function () {
      return !!(APP.State && APP.State.data.settings.sound);
    },

    /* ---------- سازندهٔ پایه ---------- */

    /**
     * پخش یک نُت کوتاه.
     * @param {number} freq بسامد (هرتز)
     * @param {number} dur  طول صدا (ثانیه)
     * @param {string} [type] شکل موج: sine نرم‌ترین است
     * @param {number} [delay] تأخیر شروع
     * @param {number} [vol] بلندی، بین ۰ تا ۱
     */
    tone: function (freq, dur, type, delay, vol) {
      if (!this.enabled()) { return; }
      var ctx = this.ctx || this._make();
      if (!ctx) { return; }

      if (ctx.state === "suspended" && ctx.resume) {
        try { ctx.resume(); } catch (e) { /* بی‌اهمیت */ }
      }

      dur = dur || 0.16;
      type = type || "sine";
      delay = delay || 0;
      vol = (vol === undefined) ? 0.16 : vol;

      var t0 = ctx.currentTime + delay;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);

      // بالا و پایین آمدن نرم، تا صدا «تق» نکند
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    },

    /** پخش چند نُت پشت سر هم */
    melody: function (notes, gap, type, vol) {
      gap = gap || 0.11;
      for (var i = 0; i < notes.length; i++) {
        this.tone(notes[i], gap + 0.05, type, i * gap, vol);
      }
    },

    /* ---------- صداهای بازی ---------- */

    /** فشردن دکمه — بسیار کوتاه و بی‌سر و صدا */
    click: function () {
      this.tone(520, 0.06, "triangle", 0, 0.08);
    },

    /** پاسخ درست — سه نُت بالا رونده */
    correct: function () {
      this.melody([523, 659, 784], 0.09, "sine", 0.17);
    },

    /** پاسخ نادرست — یک نُت نرم پایین، بدون حس شکست */
    softNo: function () {
      this.tone(330, 0.18, "sine", 0, 0.12);
      this.tone(294, 0.22, "sine", 0.12, 0.10);
    },

    /** گرفتن سکه */
    coin: function () {
      this.melody([880, 1175], 0.07, "triangle", 0.13);
    },

    /** گرفتن ستاره */
    star: function () {
      this.melody([784, 988, 1319], 0.1, "sine", 0.16);
    },

    /** روشن‌شدن یکی از چراغ‌های درخت */
    lamp: function () {
      this.melody([659, 880, 1047, 1319], 0.09, "sine", 0.15);
    },

    /** گرفتن نشان تازه */
    badge: function () {
      this.melody([523, 784, 1047], 0.12, "triangle", 0.16);
    },

    /** جشن پایانی */
    celebrate: function () {
      this.melody([523, 587, 659, 784, 880, 1047], 0.13, "sine", 0.17);
      this.tone(1319, 0.5, "triangle", 0.8, 0.12);
    }
  };

  APP.Audio = Audio;
})();
