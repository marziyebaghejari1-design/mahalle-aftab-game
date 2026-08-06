/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/splash.js — صفحهٔ معرفی طراح

   این صفحه چند ثانیه دیده می‌شود و بعد خودش به منو می‌رود.
   دکمهٔ «رد کردن» هم هست تا کسی معطل نماند.

   وابستگی: APP.Router، APP.UI
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var WAIT = 4200;   // هماهنگ با انیمیشن نوار پایین صفحه
  var timer = null;

  APP.Router.register("splash", {
    el: "screen-splash",
    topbar: false,
    root: true,
    title: "قهرمانان محلهٔ آفتاب",

    onEnter: function () {
      go(false);
      U.announce("قهرمانان محلهٔ آفتاب. طراحی و ایده‌پردازی آموزشی: مرضیه باغجری.");
    },

    onLeave: function () {
      if (timer) { clearTimeout(timer); timer = null; }
    }
  });

  /** رفتن به صفحهٔ بعد؛ اگر نامی ثبت نشده باشد، ابتدا ساخت شخصیت */
  function go(now) {
    if (timer) { clearTimeout(timer); }
    var next = function () {
      timer = null;
      APP.Router.go(APP.State.hasPlayer() ? "menu" : "profile");
    };
    timer = setTimeout(next, now ? 0 : WAIT);
  }

  U.onTap(document.getElementById("btn-skip-splash"), function () { go(true); });
})();
