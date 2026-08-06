/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/about.js — دربارهٔ بازی

   متن این صفحه از پیش در index.html نوشته شده تا حتی اگر
   جاوااسکریپت هم اجرا نشود، داور جشنواره بتواند آن را بخواند.
   اینجا فقط صفحه ثبت می‌شود و پیوندهای فهرست نرم حرکت می‌کنند.

   وابستگی: APP.Router، APP.UI
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  APP.Router.register("about", {
    el: "screen-about",
    topbar: true,
    title: "دربارهٔ بازی",
    onEnter: function () {
      var art = D.querySelector(".about");
      if (art) { art.scrollTop = 0; }
    }
  });

  // پیوندهای فهرست: پرش نرم به بخش مربوطه
  (function wireToc() {
    var links = D.querySelectorAll(".about__toc a");

    for (var i = 0; i < links.length; i++) {
      (function (link) {
        U.on(link, "click", function (ev) {
          var id = link.getAttribute("href");
          if (!id || id.charAt(0) !== "#") { return; }

          var target = D.getElementById(id.slice(1));
          if (!target) { return; }

          ev.preventDefault();
          try {
            target.scrollIntoView({
              behavior: U.reducedMotion() ? "auto" : "smooth",
              block: "start"
            });
          } catch (e) {
            target.scrollIntoView();
          }
          target.setAttribute("tabindex", "-1");
          try { target.focus({ preventScroll: true }); } catch (e2) { /* بی‌اهمیت */ }
        });
      })(links[i]);
    }
  })();
})();
