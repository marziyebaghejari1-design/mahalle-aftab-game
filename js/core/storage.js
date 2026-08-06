/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/core/storage.js — ذخیرهٔ پیشرفت دانش‌آموز

   پیشرفت در LocalStorage مرورگر ذخیره می‌شود.
   نکتهٔ مهم: بعضی مرورگرها وقتی فایل با دابل‌کلیک باز شود
   (پروتکل file://) اجازهٔ LocalStorage نمی‌دهند. در آن حالت
   بازی نباید خطا بدهد؛ به‌جای آن روی حافظهٔ موقت کار می‌کند و
   فقط تا وقتی صفحه باز است پیشرفت را نگه می‌دارد.

   وابستگی: ندارد.
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var KEY = "mahalle-aftab:v1";

  var Storage = {

    /** آیا LocalStorage واقعاً در دسترس است */
    available: false,

    /** حافظهٔ جایگزین وقتی LocalStorage در دسترس نیست */
    _memory: null,

    /** آیا یک بار به کاربر هشدار داده‌ایم */
    _warned: false,

    /* ---------- بررسی دسترسی ---------- */

    check: function () {
      try {
        var probe = "__probe__";
        window.localStorage.setItem(probe, "1");
        window.localStorage.removeItem(probe);
        this.available = true;
      } catch (err) {
        this.available = false;
      }
      return this.available;
    },

    /* ---------- خواندن و نوشتن ---------- */

    /**
     * خواندن پیشرفت ذخیره‌شده.
     * @returns {Object|null} دادهٔ ذخیره‌شده، یا null اگر چیزی نبود
     */
    load: function () {
      var raw = null;
      try {
        raw = this.available ? window.localStorage.getItem(KEY) : this._memory;
      } catch (err) {
        raw = this._memory;
      }
      if (!raw) { return null; }

      try {
        var data = JSON.parse(raw);
        return (data && typeof data === "object") ? data : null;
      } catch (err) {
        // دادهٔ خراب: پاک می‌شود تا بازی گیر نکند
        this.clear();
        return null;
      }
    },

    /**
     * ذخیرهٔ پیشرفت.
     * @returns {boolean} آیا واقعاً روی دیسک ذخیره شد
     */
    save: function (data) {
      var raw;
      try {
        raw = JSON.stringify(data);
      } catch (err) {
        return false;
      }

      this._memory = raw;

      if (!this.available) { return false; }

      try {
        window.localStorage.setItem(KEY, raw);
        return true;
      } catch (err) {
        // حافظه پر شده یا مرورگر اجازه نمی‌دهد
        this.available = false;
        this._notifyOnce();
        return false;
      }
    },

    /** پاک‌کردن پیشرفت ذخیره‌شده */
    clear: function () {
      this._memory = null;
      try {
        if (this.available) { window.localStorage.removeItem(KEY); }
      } catch (err) { /* بی‌اهمیت */ }
    },

    /* ---------- پیام به کاربر ---------- */

    _notifyOnce: function () {
      if (this._warned) { return; }
      this._warned = true;
      if (APP.UI && APP.UI.toast) {
        APP.UI.toast("این مرورگر اجازهٔ ذخیره نمی‌دهد. تا بستن صفحه، بازی ادامه دارد.");
      }
    }
  };

  Storage.check();
  APP.Storage = Storage;
})();
