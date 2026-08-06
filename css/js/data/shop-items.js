/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/shop-items.js — تزیین‌های میدان جشن

   دانش‌آموز با سکه‌هایی که از پاسخ درست گرفته، میدان جشن خودش را
   می‌سازد. این چرخه (سکه ← تزیین ← جشنِ شخصی‌شده) دلیل اصلی
   بازیِ دوبارهٔ دانش‌آموز است؛ چون میدان هر بچه با بچهٔ دیگر فرق دارد.

   هر جایگاه (slot) فقط یک تزیین فعال دارد، ولی دانش‌آموز می‌تواند
   چند تا بخرد و هر وقت خواست عوض کند.

   وابستگی: ندارد.
   ============================================================ */

var APP = APP || {};

APP.ShopItems = (function () {
  "use strict";

  var categories = [
    { key: "lights",   name: "چراغانی", slot: "lights" },
    { key: "balloons", name: "بادکنک",  slot: "balloons" },
    { key: "carpet",   name: "فرش",     slot: "carpet" },
    { key: "stage",    name: "سن و غرفه", slot: "stage" }
  ];

  var list = [

    /* ---------- چراغانی ---------- */
    {
      id: "l1", cat: "lights", slot: "lights",
      name: "ریسهٔ ساده", icon: "💡", price: 10,
      render: { colors: ["#FFC93C"], count: 9 }
    },
    {
      id: "l2", cat: "lights", slot: "lights",
      name: "ریسهٔ رنگی", icon: "🎇", price: 25,
      render: { colors: ["#FFC93C", "#2EC4B6", "#E86A8B"], count: 12 }
    },
    {
      id: "l3", cat: "lights", slot: "lights",
      name: "ریسهٔ ستاره‌ای", icon: "✨", price: 45,
      render: { colors: ["#FFC93C", "#FFF8ED"], count: 14, shape: "star" }
    },
    {
      id: "l4", cat: "lights", slot: "lights",
      name: "فانوس کاغذی", icon: "🏮", price: 60,
      render: { colors: ["#FF8A5B", "#E86A8B"], count: 7, shape: "lantern" }
    },

    /* ---------- بادکنک ---------- */
    {
      id: "b1", cat: "balloons", slot: "balloons",
      name: "چند بادکنک", icon: "🎈", price: 10,
      render: { colors: ["#E86A8B", "#2EC4B6"], count: 4 }
    },
    {
      id: "b2", cat: "balloons", slot: "balloons",
      name: "دستهٔ بادکنک", icon: "🎈", price: 25,
      render: { colors: ["#E86A8B", "#2EC4B6", "#FFC93C", "#8E6BBF"], count: 8 }
    },
    {
      id: "b3", cat: "balloons", slot: "balloons",
      name: "طاق بادکنکی", icon: "🌈", price: 50,
      render: { colors: ["#D64545", "#FF8A5B", "#FFC93C", "#48B26A", "#1B6CA8"], count: 14, shape: "arch" }
    },

    /* ---------- فرش ---------- */
    {
      id: "c1", cat: "carpet", slot: "carpet",
      name: "زیرانداز ساده", icon: "🟫", price: 10,
      render: { base: "#C99A6B", pattern: "plain" }
    },
    {
      id: "c2", cat: "carpet", slot: "carpet",
      name: "گلیم رنگی", icon: "🧶", price: 30,
      render: { base: "#D64545", pattern: "stripe", accent: "#FFC93C" }
    },
    {
      id: "c3", cat: "carpet", slot: "carpet",
      name: "فرش ایرانی", icon: "🪆", price: 55,
      render: { base: "#8E2B2B", pattern: "medallion", accent: "#2EC4B6" }
    },

    /* ---------- سن و غرفه ---------- */
    {
      id: "s1", cat: "stage", slot: "stage",
      name: "میز پذیرایی", icon: "🍽️", price: 15,
      render: { kind: "table" }
    },
    {
      id: "s2", cat: "stage", slot: "stage",
      name: "غرفهٔ شیرینی", icon: "🍬", price: 35,
      render: { kind: "booth", color: "#E86A8B" }
    },
    {
      id: "s3", cat: "stage", slot: "stage",
      name: "سن اجرا", icon: "🎤", price: 55,
      render: { kind: "stage", color: "#2EC4B6" }
    },
    {
      id: "s4", cat: "stage", slot: "stage",
      name: "چادر جشن", icon: "⛺", price: 70,
      render: { kind: "tent", color: "#FF8A5B" }
    }
  ];

  var byId = {};
  for (var i = 0; i < list.length; i++) {
    byId[list[i].id] = list[i];
  }

  return {

    categories: function () {
      return categories.slice();
    },

    all: function () {
      return list.slice();
    },

    get: function (id) {
      return byId[id] || null;
    },

    /** کالاهای یک دسته */
    byCategory: function (key) {
      var out = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].cat === key) { out.push(list[i]); }
      }
      return out;
    },

    /** ارزان‌ترین کالای هر دسته — برای راهنمایی دانش‌آموز */
    cheapestOf: function (key) {
      var items = this.byCategory(key);
      var best = null;
      for (var i = 0; i < items.length; i++) {
        if (!best || items[i].price < best.price) { best = items[i]; }
      }
      return best;
    },

    /** تزیین‌هایی که هم‌اکنون در میدان قرار گرفته‌اند */
    placedItems: function () {
      var out = [];
      if (!APP.State) { return out; }
      var placed = APP.State.data.shop.placed;
      for (var slot in placed) {
        if (!placed.hasOwnProperty(slot)) { continue; }
        var item = byId[placed[slot]];
        if (item) { out.push(item); }
      }
      return out;
    }
  };
})();
