/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/menu.js — منوی اصلی

   منو خودش را با وضعیت بازی هماهنگ می‌کند: اگر دانش‌آموز قبلاً
   بازی کرده، دکمهٔ «ادامهٔ بازی» بالا می‌آید و پیام خوشامد
   می‌گوید چند چراغ روشن شده است.

   وابستگی: APP.Router، APP.UI، APP.State
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  APP.Router.register("menu", {
    el: "screen-menu",
    topbar: false,
    root: true,
    title: "قهرمانان محلهٔ آفتاب",
    onEnter: refresh
  });

  /* ---------- تازه‌کردن منو ---------- */

  function refresh() {
    var st = APP.State;
    var played = st.lampsLit() > 0;

    D.getElementById("btn-continue").hidden = !played;
    D.getElementById("btn-new-game").textContent = played ? "🔄 شروع دوباره" : "🌟 شروع بازی";

    var welcome = D.getElementById("menu-welcome");
    var name = st.data.player.name;

    if (!st.hasPlayer()) {
      welcome.textContent = "به محلهٔ آفتاب خوش آمدی!";
    } else if (st.allStationsDone()) {
      welcome.textContent = name + " جان، هر هفت چراغ محله روشن است! هر وقت خواستی دوباره سر بزن.";
    } else if (played) {
      welcome.textContent = name + " جان، " + st.lampsLit() + " چراغ از ۷ چراغ روشن شده.";
    } else {
      welcome.textContent = "سلام " + name + "! محله منتظر توست.";
    }

    drawTree(st.lampsLit());
  }

  /**
   * درخت میدان روی منو.
   * هرچه چراغ بیشتری روشن شده باشد، درخت روشن‌تر است.
   */
  function drawTree(lit) {
    var box = U.clear(D.getElementById("menu-tree"));
    var total = APP.State.totalStations();

    var tree = U.el("div", "", "🌳");
    tree.style.fontSize = "5rem";
    tree.style.lineHeight = "1";
    tree.setAttribute("aria-hidden", "true");
    box.appendChild(tree);

    var lamps = U.el("div", "lamp-tree__lamps");
    for (var i = 0; i < total; i++) {
      var lamp = U.el("span", "lamp" + (i < lit ? " is-lit" : ""), i < lit ? "💡" : "·");
      lamps.appendChild(lamp);
    }
    lamps.setAttribute("aria-hidden", "true");
    box.appendChild(lamps);
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", lit + " چراغ از " + total + " چراغ روشن است");
  }

  /* ---------- دکمه‌ها ---------- */

  U.onTap(D.getElementById("btn-continue"), function () {
    APP.Router.go("map");
  });

  U.onTap(D.getElementById("btn-new-game"), function () {
    if (APP.State.lampsLit() === 0) {
      APP.Router.go(APP.State.hasPlayer() ? "map" : "profile");
      return;
    }
    U.dialog({
      icon: "🔄",
      title: "شروع دوباره؟",
      text: "اگر دوباره شروع کنی، چراغ‌ها، ستاره‌ها و سکه‌هایت پاک می‌شوند. " +
            "اگر فقط می‌خواهی یک مأموریت را دوباره بازی کنی، «کوچه‌گردی آزاد» را بزن.",
      actions: [
        { label: "نه، برگرد", kind: "ghost" },
        { label: "بله، از اول", kind: "primary", onTap: function () {
            APP.State.resetAll();
            APP.Router.go("profile");
          } }
      ]
    });
  });

  U.onTap(D.getElementById("btn-free-mode"), function () {
    if (!APP.State.hasPlayer()) { APP.Router.go("profile"); return; }
    APP.Router.go("map", { free: true });
  });

  U.onTap(D.getElementById("btn-open-report"), function () {
    APP.Router.go("report");
  });

  U.onTap(D.getElementById("btn-open-shop"), function () {
    APP.Router.go("shop");
  });

  U.onTap(D.getElementById("btn-open-about"), function () {
    APP.Router.go("about");
  });

  // وقتی چیزی در بازی عوض شد و منو باز بود، خودش را تازه کند
  APP.State.on("change", function () {
    if (APP.Router.isOn("menu")) { refresh(); }
  });
})();
