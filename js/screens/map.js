/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/map.js — نقشهٔ محله

   هفت ایستگاه به شکل کارت نشان داده می‌شوند و درخت میدان،
   پیشرفت کلی را با چراغ‌هایش نمایش می‌دهد.

   ── یک تصمیم آموزشی ──
   هیچ ایستگاهی قفل نیست. دانش‌آموز از همان اول می‌تواند هر
   جایی را انتخاب کند. قفل‌کردن مسیر، حس کنترل را از بچه
   می‌گیرد؛ در عوض کارت «بعدی» پیشنهاد می‌دهد از کجا ادامه دهد.

   وابستگی: APP.Router، APP.UI، APP.State، APP.Stations
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  APP.Router.register("map", {
    el: "screen-map",
    topbar: true,
    root: true,
    title: "محلهٔ آفتاب",
    onEnter: draw
  });

  /* ---------- کشیدن صفحه ---------- */

  function draw() {
    var st = APP.State;
    var lit = st.lampsLit();
    var total = st.totalStations();

    D.getElementById("map-title").textContent =
      st.data.player.name ? ("محلهٔ آفتاب — " + st.data.player.name) : "محلهٔ آفتاب";

    D.getElementById("map-subtitle").textContent = subtitle(lit, total);

    drawTree(lit, total);
    drawStations();
    APP.Router.refreshStats();
  }

  function subtitle(lit, total) {
    if (lit === 0) { return "یک مکان را انتخاب کن و به اهالی محله کمک کن."; }
    if (lit >= total) { return "هر هفت چراغ روشن است! می‌توانی هر مأموریت را دوباره بازی کنی."; }
    return lit + " چراغ روشن شده، " + (total - lit) + " چراغ مانده.";
  }

  /* ---------- درخت هفت‌چراغ ---------- */

  function drawTree(lit, total) {
    var canvas = U.clear(D.getElementById("lamp-tree-canvas"));
    var tree = U.el("div", "", "🌳");
    tree.style.fontSize = "4.6rem";
    tree.style.lineHeight = "1";
    canvas.appendChild(tree);

    var list = U.clear(D.getElementById("lamp-list"));
    for (var i = 1; i <= total; i++) {
      var on = i <= lit;
      var lamp = U.el("li", "lamp" + (on ? " is-lit" : ""), on ? "💡" : "·");
      lamp.title = APP.Stations.nameOf(i);
      list.appendChild(lamp);
    }

    D.getElementById("lamp-tree-label").textContent =
      "درخت میدان: " + lit + " چراغ از " + total + " چراغ روشن است";
  }

  /* ---------- کارت ایستگاه‌ها ---------- */

  function drawStations() {
    var list = U.clear(D.getElementById("station-list"));
    var stations = APP.Stations.all();
    var next = APP.State.nextStation();

    for (var i = 0; i < stations.length; i++) {
      list.appendChild(stationCard(stations[i], stations[i].id === next));
    }
  }

  function stationCard(station, isNext) {
    var saved = APP.State.getStation(station.id);
    var done = !!(saved && saved.done);

    var li = U.el("li");
    var btn = U.el("button", "station" + (done ? " is-done" : "") + (isNext ? " is-next" : ""));
    btn.type = "button";
    btn.style.borderColor = station.color;

    btn.appendChild(U.el("span", "station__icon", station.icon));
    btn.appendChild(U.el("span", "station__name", station.name));
    btn.appendChild(U.el("span", "station__task", done ? station.done : station.task));

    var stars = U.el("span", "station__stars",
      done ? U.starText(saved.best) : "☆☆☆");
    btn.appendChild(stars);

    btn.setAttribute("aria-label",
      station.name + "؛ " + (done ? ("تمام‌شده با " + saved.best + " ستاره") : station.task) +
      (isNext ? "؛ پیشنهاد بعدی" : ""));

    U.onTap(btn, function () {
      APP.Router.go("mission", { stationId: station.id });
    });

    li.appendChild(btn);
    return li;
  }

  // اگر وضعیت عوض شد و نقشه باز بود، تازه شود
  APP.State.on("change", function () {
    if (APP.Router.isOn("map")) { draw(); }
  });
})();
