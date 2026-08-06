/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/report-screen.js — صفحهٔ کارنامه

   ساخت خود کارنامه در js/ui/report.js انجام می‌شود؛ اینجا فقط
   صفحه ثبت و دکمه‌هایش وصل می‌شوند.

   وابستگی: APP.Router، APP.Report، APP.UI
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  APP.Router.register("report", {
    el: "screen-report",
    topbar: true,
    title: "کارنامهٔ قهرمان",
    onEnter: function () {
      APP.Report.build();
    }
  });

  U.onTap(D.getElementById("btn-print-report"), function () {
    APP.Report.print();
  });

  U.onTap(D.getElementById("btn-report-back"), function () {
    APP.Router.back();
  });
})();
