/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/shop.js — فروشگاه تزیین میدان

   سکه‌هایی که از پاسخ درست به دست آمده، اینجا به تزیین تبدیل
   می‌شوند و میدان جشنِ هر دانش‌آموز شکل خودش را می‌گیرد.

   هر جایگاه (چراغانی، بادکنک، فرش، سن) یک تزیین فعال دارد.
   خریدن دائمی است؛ جابه‌جا کردن آزاد و رایگان.

   وابستگی: APP.Router، APP.UI، APP.State، APP.ShopItems
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;
  var activeTab = "lights";

  APP.Router.register("shop", {
    el: "screen-shop",
    topbar: true,
    title: "فروشگاه تزیین",
    onEnter: draw
  });

  /* ---------- کشیدن صفحه ---------- */

  function draw() {
    D.getElementById("shop-coins").textContent = U.fa(APP.State.data.progress.coins);
    drawTabs();
    drawItems();
    drawPreview(D.getElementById("square-preview"));
  }

  function drawTabs() {
    var tabs = D.querySelectorAll("[data-shop-tab]");
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute("data-shop-tab") === activeTab;
      U.toggleClass(tabs[i], "is-active", on);
      tabs[i].setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  function drawItems() {
    var list = U.clear(D.getElementById("shop-items"));
    var items = APP.ShopItems.byCategory(activeTab);
    var coins = APP.State.data.progress.coins;

    for (var i = 0; i < items.length; i++) {
      list.appendChild(itemCard(items[i], coins));
    }
  }

  function itemCard(item, coins) {
    var owned = APP.State.isOwned(item.id);
    var placed = APP.State.data.shop.placed[item.slot] === item.id;
    var tooDear = !owned && coins < item.price;

    var li = U.el("li");
    var btn = U.el("button", "shop-item" +
      (owned ? " is-owned" : "") + (tooDear ? " is-tooexpensive" : ""));
    btn.type = "button";

    btn.appendChild(U.el("span", "shop-item__icon", item.icon));
    btn.appendChild(U.el("span", "shop-item__name", item.name));
    btn.appendChild(U.el("span", "shop-item__price",
      placed ? "✅ در میدان" : (owned ? "خریداری‌شده" : U.fa(item.price) + " سکه")));

    btn.setAttribute("aria-label", item.name + "، " +
      (placed ? "هم‌اکنون در میدان" :
       (owned ? "خریداری‌شده، برای گذاشتن در میدان بزن" :
        ("قیمت " + item.price + " سکه" + (tooDear ? "، هنوز سکهٔ کافی نداری" : "")))));

    U.onTap(btn, function () { pick(item, owned, placed, tooDear); });
    li.appendChild(btn);
    return li;
  }

  /* ---------- خرید و قراردادن ---------- */

  function pick(item, owned, placed, tooDear) {
    if (placed) {
      U.toast("این تزیین همین حالا در میدان است.");
      return;
    }

    if (owned) {
      APP.State.placeItem(item.slot, item.id);
      U.toast(item.icon + " " + item.name + " در میدان گذاشته شد.");
      draw();
      return;
    }

    if (tooDear) {
      var need = item.price - APP.State.data.progress.coins;
      U.dialog({
        icon: "🪙",
        title: "هنوز کمی مانده",
        text: U.fa(need) + " سکهٔ دیگر لازم داری. با هر پاسخ درست سکه می‌گیری.",
        actions: [
          { label: "باشه", kind: "ghost" },
          { label: "برویم مأموریت", kind: "primary", onTap: function () {
              APP.Router.go("map");
            } }
        ]
      });
      return;
    }

    if (APP.State.buyItem(item.id, item.price)) {
      APP.State.placeItem(item.slot, item.id);
      if (APP.Audio) { APP.Audio.coin(); }
      U.toast("خریدی! " + item.icon + " " + item.name + " در میدان گذاشته شد.");
      draw();
    }
  }

  /* ============================================================
     نقاشی میدان — همین تابع در صفحهٔ جشن هم استفاده می‌شود
     ============================================================ */

  /**
   * کشیدن میدان با تزیین‌های خریداری‌شده.
   * @param {Element} box جایی که میدان کشیده می‌شود
   * @param {boolean} [night] حالت شب برای صفحهٔ جشن
   */
  function drawPreview(box, night) {
    if (!box) { return; }
    U.clear(box);

    var placed = APP.State.data.shop.placed;
    var lights = APP.ShopItems.get(placed.lights);
    var balloons = APP.ShopItems.get(placed.balloons);
    var carpet = APP.ShopItems.get(placed.carpet);
    var stage = APP.ShopItems.get(placed.stage);

    box.style.position = "relative";

    // چراغانی: یک ردیف بالا
    if (lights) {
      var row = U.el("div");
      row.style.position = "absolute";
      row.style.top = "6%";
      row.style.insetInline = "4%";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";

      for (var i = 0; i < lights.render.count; i++) {
        var dot = U.el("span", night ? "twinkle" : "",
          lights.render.shape === "lantern" ? "🏮" :
          (lights.render.shape === "star" ? "✨" : "•"));
        dot.style.color = lights.render.colors[i % lights.render.colors.length];
        dot.style.fontSize = lights.render.shape ? "1rem" : "1.6rem";
        dot.style.animationDelay = (i * 120) + "ms";
        row.appendChild(dot);
      }
      box.appendChild(row);
    }

    // فرش: کف میدان
    if (carpet) {
      var rug = U.el("div");
      rug.style.position = "absolute";
      rug.style.insetInlineStart = "18%";
      rug.style.width = "64%";
      rug.style.bottom = "8%";
      rug.style.height = "22%";
      rug.style.borderRadius = "8px";
      rug.style.border = "2px solid var(--c-navy)";
      rug.style.background = carpet.render.pattern === "stripe"
        ? ("repeating-linear-gradient(90deg," + carpet.render.base + " 0 12px," +
           carpet.render.accent + " 12px 20px)")
        : (carpet.render.pattern === "medallion"
           ? ("radial-gradient(circle at 50% 50%," + carpet.render.accent +
              " 0 14%," + carpet.render.base + " 14%)")
           : carpet.render.base);
      box.appendChild(rug);
    }

    // سن یا غرفه
    if (stage) {
      var st = U.el("div", "", stage.icon);
      st.style.position = "absolute";
      st.style.insetInlineEnd = "12%";
      st.style.bottom = "26%";
      st.style.fontSize = "2.4rem";
      box.appendChild(st);
    }

    // بادکنک‌ها
    if (balloons) {
      var band = U.el("div");
      band.style.position = "absolute";
      band.style.insetInlineStart = "6%";
      band.style.bottom = "30%";
      band.style.display = "flex";
      band.style.gap = "4px";

      for (var b = 0; b < Math.min(balloons.render.count, 10); b++) {
        var bal = U.el("span", "float-soft", "🎈");
        bal.style.fontSize = "1.5rem";
        bal.style.animationDelay = (b * 180) + "ms";
        if (balloons.render.shape === "arch") {
          bal.style.transform = "translateY(" + (Math.abs(4 - b) * 5) + "px)";
        }
        band.appendChild(bal);
      }
      box.appendChild(band);
    }

    // اگر هنوز چیزی خریده نشده
    if (!lights && !balloons && !carpet && !stage) {
      var hint = U.el("p", "field__hint", "هنوز تزیینی نخریده‌ای. با سکه‌هایت میدان را بساز!");
      hint.style.position = "absolute";
      hint.style.inset = "auto 8% 12%";
      hint.style.textAlign = "center";
      box.appendChild(hint);
    }

    box.setAttribute("aria-label", describe(lights, balloons, carpet, stage));
  }

  function describe(lights, balloons, carpet, stage) {
    var parts = [];
    if (lights) { parts.push(lights.name); }
    if (balloons) { parts.push(balloons.name); }
    if (carpet) { parts.push(carpet.name); }
    if (stage) { parts.push(stage.name); }
    return parts.length ? ("میدان تو با " + parts.join("، ")) : "میدان هنوز خالی است";
  }

  /* ---------- زبانه‌ها ---------- */

  (function wireTabs() {
    var tabs = D.querySelectorAll("[data-shop-tab]");
    for (var i = 0; i < tabs.length; i++) {
      (function (tab) {
        U.onTap(tab, function () {
          activeTab = tab.getAttribute("data-shop-tab");
          drawTabs();
          drawItems();
        });
      })(tabs[i]);
    }
  })();

  // در دسترس بقیهٔ صفحه‌ها (صفحهٔ جشن از همین استفاده می‌کند)
  APP.SquareView = { draw: drawPreview };
})();
