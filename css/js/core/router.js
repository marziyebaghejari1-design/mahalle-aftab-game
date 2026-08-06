/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/core/router.js — جابه‌جایی بین صفحه‌ها

   همهٔ صفحه‌ها در همان index.html هستند و فقط یکی در هر لحظه
   دیده می‌شود. هر صفحه خودش را اینجا ثبت می‌کند و می‌گوید هنگام
   باز و بسته شدن چه کاری انجام دهد.

   کارهایی که این فایل انجام می‌دهد:
   • نمایش یک صفحه و پنهان‌کردن بقیه
   • نگه‌داشتن مسیر بازگشت (دکمهٔ →)
   • نمایش یا پنهان‌کردن نوار بالا
   • بردن تمرکز صفحه‌کلید به ابتدای صفحهٔ تازه
   • اعلام نام صفحه برای صفحه‌خوان‌ها
   • پشتیبانی از دکمهٔ بازگشت گوشی

   وابستگی: APP.State (برای نوار بالا)
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var Router = {

    /** { name: { el, onEnter, onLeave, topbar, title, root } } */
    screens: {},

    current: null,
    params: null,
    stack: [],
    _busy: false,
    _historyOk: false,

    /* ---------- ثبت صفحه ---------- */

    /**
     * ثبت یک صفحه.
     * @param {string} name نام کوتاه صفحه، مثل "map"
     * @param {Object} conf تنظیمات صفحه
     *   el      شناسهٔ عنصر در HTML
     *   topbar  آیا نوار بالا دیده شود
     *   title   عنوان نمایشی در نوار بالا
     *   root    آیا صفحهٔ ریشه است (بازگشت به آن مسیر را پاک می‌کند)
     *   onEnter تابعی که هنگام باز شدن اجرا می‌شود
     *   onLeave تابعی که هنگام بسته شدن اجرا می‌شود
     */
    register: function (name, conf) {
      conf = conf || {};
      conf.el = conf.el || ("screen-" + name);
      this.screens[name] = conf;
      return conf;
    },

    /* ---------- راه‌اندازی ---------- */

    init: function () {
      var self = this;

      // آیا مرورگر اجازهٔ کار با تاریخچه را می‌دهد؟
      // روی پروتکل file:// بعضی مرورگرها خطا می‌دهند.
      try {
        window.history.replaceState({ screen: "boot" }, "");
        this._historyOk = true;
      } catch (err) {
        this._historyOk = false;
      }

      if (this._historyOk) {
        window.addEventListener("popstate", function (ev) {
          var name = ev.state && ev.state.screen;
          if (name && self.screens[name] && name !== self.current) {
            self.go(name, null, { silent: true });
          } else {
            self.back();
          }
        });
      }

      // دکمهٔ بازگشت نوار بالا
      var btnBack = document.getElementById("btn-back");
      if (btnBack) {
        btnBack.addEventListener("click", function () { self.back(); });
      }

      return this;
    },

    /* ---------- رفتن به یک صفحه ---------- */

    /**
     * نمایش یک صفحه.
     * @param {string} name نام صفحه
     * @param {Object} [params] داده‌ای که به onEnter داده می‌شود
     * @param {Object} [opt] { silent: بدون ثبت در تاریخچه, replace: جایگزینی }
     */
    go: function (name, params, opt) {
      opt = opt || {};
      var conf = this.screens[name];

      if (!conf) {
        if (window.console) { console.warn("صفحهٔ ناشناخته: " + name); }
        return false;
      }
      if (this._busy || name === this.current) { return false; }
      this._busy = true;

      // بستن صفحهٔ قبلی
      if (this.current) {
        var prev = this.screens[this.current];
        if (prev && typeof prev.onLeave === "function") {
          try { prev.onLeave(); } catch (e) { this._warn(e); }
        }
        this._el(prev).hidden = true;

        if (!opt.replace && !prev.root) {
          this.stack.push(this.current);
        } else if (prev.root) {
          this.stack = [this.current];
        }
        if (conf.root) { this.stack = []; }
      }

      // باز کردن صفحهٔ تازه
      this.current = name;
      this.params = params || null;

      var el = this._el(conf);
      el.hidden = false;

      this._syncTopbar(conf);

      if (typeof conf.onEnter === "function") {
        try { conf.onEnter(params || {}); } catch (e) { this._warn(e); }
      }

      this._focusFirst(el);
      this.announce(conf.title || name);
      window.scrollTo(0, 0);

      if (this._historyOk && !opt.silent) {
        try {
          window.history.pushState({ screen: name }, "");
        } catch (e) { /* بی‌اهمیت */ }
      }

      this._busy = false;
      return true;
    },

    /** بازگشت به صفحهٔ قبلی؛ اگر مسیری نبود، به منو */
    back: function () {
      var prev = this.stack.pop();
      if (!prev) { prev = "menu"; }
      // چون خودمان مسیر را مدیریت می‌کنیم، نباید دوباره در پشته ثبت شود
      var keep = this.stack.slice();
      this.go(prev, null, { replace: true, silent: true });
      this.stack = keep;
      return prev;
    },

    /** آیا در حال حاضر این صفحه باز است */
    isOn: function (name) {
      return this.current === name;
    },

    /* ---------- نوار بالا ---------- */

    _syncTopbar: function (conf) {
      var bar = document.getElementById("topbar");
      if (!bar) { return; }

      bar.hidden = !conf.topbar;
      if (!conf.topbar) { return; }

      var place = document.getElementById("topbar-place");
      if (place) { place.textContent = conf.title || "محلهٔ آفتاب"; }

      var sub = document.getElementById("topbar-sub");
      if (sub) { sub.textContent = conf.subtitle || ""; }

      var back = document.getElementById("btn-back");
      if (back) { back.hidden = !!conf.root; }

      this.refreshStats();
    },

    /** تازه‌کردن سکه، ستاره و چراغ‌ها در نوار بالا */
    refreshStats: function () {
      if (!APP.State) { return; }
      var p = APP.State.data.progress;

      this._setStat("stat-coins", p.coins);
      this._setStat("stat-stars", p.stars);

      var lamps = document.getElementById("stat-lamps");
      if (lamps) {
        lamps.textContent = APP.State.lampsLit() + "/" + APP.State.totalStations();
      }
    },

    _setStat: function (id, value) {
      var el = document.getElementById(id);
      if (!el) { return; }
      var old = el.textContent;
      el.textContent = String(value);
      if (old !== String(value) && el.parentNode) {
        var box = el.parentNode;
        box.classList.remove("is-bumping");
        void box.offsetWidth;          // اجبار مرورگر به اجرای دوبارهٔ انیمیشن
        box.classList.add("is-bumping");
      }
    },

    /** تغییر زیرعنوان نوار بالا هنگام بازی */
    setSubtitle: function (text) {
      var sub = document.getElementById("topbar-sub");
      if (sub) { sub.textContent = text || ""; }
    },

    /* ---------- دسترسی‌پذیری ---------- */

    /** بردن تمرکز به اولین عنوان یا دکمهٔ صفحهٔ تازه */
    _focusFirst: function (el) {
      var target = el.querySelector("h1, h2, [autofocus], .btn, button, input");
      if (!target) { return; }
      if (!target.hasAttribute("tabindex") && /^H[12]$/.test(target.tagName)) {
        target.setAttribute("tabindex", "-1");
      }
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    },

    /** خواندن یک پیام برای صفحه‌خوان */
    announce: function (text) {
      var box = document.getElementById("sr-announcer");
      if (!box) { return; }
      box.textContent = "";
      setTimeout(function () { box.textContent = text; }, 60);
    },

    /* ---------- کمکی ---------- */

    _el: function (conf) {
      if (!conf._node) { conf._node = document.getElementById(conf.el); }
      return conf._node || document.createElement("div");
    },

    _warn: function (err) {
      if (window.console) { console.warn("خطا هنگام تعویض صفحه", err); }
    }
  };

  APP.Router = Router;
})();
