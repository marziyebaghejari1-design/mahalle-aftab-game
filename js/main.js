/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/main.js — راه‌اندازی بازی

   آخرین فایلی است که بارگذاری می‌شود. کارهایش:
   ۱. خواندن پیشرفت ذخیره‌شده
   ۲. اعمال تنظیمات (صدا، حرکت، اندازهٔ متن)
   ۳. راه‌اندازی مسیریاب، صدا و چرک‌نویس
   ۴. وصل‌کردن پنجرهٔ تنظیمات
   ۵. باز کردن اولین صفحه

   وابستگی: همهٔ فایل‌های قبلی
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  /* ============================================================
     راه‌اندازی
     ============================================================ */

  function boot() {
    // ۱. وضعیت
    APP.State.init();

    // ۲. تنظیمات ظاهری
    applySettings();

    // ۳. زیرسیستم‌ها
    APP.Audio.init();
    APP.Router.init();
    APP.Scratchpad.init();

    // ۴. تنظیمات و رویدادهای عمومی
    wireSettings();
    wireGlobal();

    // ۵. شروع
    APP.Router.go("splash");

    if (!APP.Storage.available) {
      setTimeout(function () {
        U.toast("این مرورگر اجازهٔ ذخیره نمی‌دهد؛ تا بستن صفحه پیشرفت می‌ماند.", 4000);
      }, 5000);
    }
  }

  /* ============================================================
     اعمال تنظیمات روی صفحه
     ============================================================ */

  function applySettings() {
    var s = APP.State.data.settings;
    var html = D.documentElement;

    U.toggleClass(html, "is-textlg", !!s.largeText);
    U.toggleClass(html, "is-reduced-motion", !!s.reducedMotion);

    setSwitch("toggle-sound", s.sound);
    setSwitch("toggle-motion", s.reducedMotion);
    setSwitch("toggle-textsize", s.largeText);
    markLevel(APP.State.data.player.level);
  }

  function setSwitch(id, on) {
    var el = D.getElementById(id);
    if (el) { el.setAttribute("aria-checked", on ? "true" : "false"); }
  }

  function markLevel(level) {
    var chips = D.querySelectorAll("#settings-level .level-chip");
    for (var i = 0; i < chips.length; i++) {
      var on = parseInt(chips[i].getAttribute("data-level"), 10) === level;
      U.toggleClass(chips[i], "is-selected", on);
      chips[i].setAttribute("aria-checked", on ? "true" : "false");
    }
  }

  /* ============================================================
     پنجرهٔ تنظیمات
     ============================================================ */

  function wireSettings() {
    var modal = D.getElementById("settings-modal");

    U.onTap(D.getElementById("btn-settings"), function () {
      applySettings();
      modal.hidden = false;
      var first = modal.querySelector("button");
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    });

    U.onTap(D.getElementById("btn-close-settings"), closeSettings);

    U.on(modal, "click", function (ev) {
      if (ev.target.hasAttribute("data-close-modal")) { closeSettings(); }
    });

    // کلیدهای روشن/خاموش
    flip("toggle-sound", "sound");
    flip("toggle-motion", "reducedMotion");
    flip("toggle-textsize", "largeText");

    // تغییر سطح از داخل تنظیمات
    var chips = D.querySelectorAll("#settings-level .level-chip");
    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        U.onTap(chip, function () {
          var level = parseInt(chip.getAttribute("data-level"), 10) || 1;
          APP.State.setLevel(level);
          markLevel(level);
          U.toast("سطح بازی: " + APP.Adaptive.levelName(level));
        });
      })(chips[i]);
    }

    // شروع دوبارهٔ همه‌چیز
    U.onTap(D.getElementById("btn-reset-progress"), function () {
      U.dialog({
        icon: "⚠️",
        title: "همه‌چیز از اول؟",
        text: "چراغ‌ها، ستاره‌ها، سکه‌ها، نشان‌ها و کارنامه پاک می‌شوند. این کار برگشت ندارد.",
        actions: [
          { label: "نه، برگرد", kind: "ghost" },
          { label: "بله، پاک کن", kind: "danger-ghost", onTap: function () {
              APP.State.resetAll();
              applySettings();
              closeSettings();
              APP.Router.go("profile");
            } }
        ]
      });
    });
  }

  function closeSettings() {
    D.getElementById("settings-modal").hidden = true;
  }

  /** وصل‌کردن یک کلید روشن/خاموش به یک تنظیم */
  function flip(id, key) {
    var btn = D.getElementById(id);
    if (!btn) { return; }

    U.onTap(btn, function () {
      var now = btn.getAttribute("aria-checked") === "true";
      APP.State.setSetting(key, !now);
      applySettings();

      if (key === "sound" && !now && APP.Audio) { APP.Audio.click(); }
      if (key === "largeText") { APP.Scratchpad.resize(); }
    });
  }

  /* ============================================================
     رویدادهای عمومی
     ============================================================ */

  function wireGlobal() {
    // ذخیرهٔ فوری هنگام بستن یا پنهان شدن صفحه
    U.on(window, "beforeunload", function () { APP.State.saveNow(); });
    U.on(D, "visibilitychange", function () {
      if (D.visibilityState === "hidden") { APP.State.saveNow(); }
    });

    // اندازهٔ چرک‌نویس با چرخاندن گوشی
    U.on(window, "resize", function () {
      if (APP.Scratchpad) { APP.Scratchpad.resize(); }
    });

    // کلید Escape: بستن پنجره‌ها
    U.on(D, "keydown", function (ev) {
      if (ev.key !== "Escape") { return; }
      if (!D.getElementById("settings-modal").hidden) { closeSettings(); return; }
      if (!D.getElementById("scratchpad").hidden) { APP.Scratchpad.close(); }
    });

    // نوار بالا با هر تغییری تازه شود
    APP.State.on("change", function () { APP.Router.refreshStats(); });

    // فوتر: نام طراح همیشه دیده شود
    var footer = D.getElementById("site-footer");
    if (footer) { footer.hidden = false; }
  }

  /* ============================================================
     شروع، وقتی صفحه آماده شد
     ============================================================ */

  if (D.readyState === "loading") {
    D.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
