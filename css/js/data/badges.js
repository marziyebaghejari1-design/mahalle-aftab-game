/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/badges.js — دوازده نشان افتخار

   هفت نشان برای هفت مأموریت، و پنج نشان برای کارهای ویژه.
   هر نشان یک تابع check دارد که وضعیت بازی را نگاه می‌کند و
   می‌گوید آیا شرطش برقرار شده یا نه.

   اصل آموزشی: هیچ نشانی با «سرعت» یا «رقابت با دیگران» گرفته
   نمی‌شود. همهٔ شرط‌ها دربارهٔ تلاش و پیشرفت خود دانش‌آموز است.

   وابستگی: APP.State (هنگام اجرا)
   ============================================================ */

var APP = APP || {};

APP.Badges = (function () {
  "use strict";

  var list = [

    /* ---------- نشان‌های مأموریت‌ها ---------- */

    {
      id: "water-guard",
      name: "نگهبان آب و برق",
      icon: "💧",
      desc: "مأموریت خانه را تمام کردی و جلوی هدررفت آب و برق را گرفتی.",
      check: function (st) { return st.isStationDone(1); }
    },
    {
      id: "shop-accountant",
      name: "حسابدار بازارچه",
      icon: "🧮",
      desc: "خرید جشن را درست حساب کردی و پول کم نیاوردی.",
      check: function (st) { return st.isStationDone(2); }
    },
    {
      id: "book-friend",
      name: "دوست کتاب",
      icon: "📖",
      desc: "جمله‌ها را مرتب کردی و کتاب‌ها را سر جایشان برگرداندی.",
      check: function (st) { return st.isStationDone(3); }
    },
    {
      id: "park-keeper",
      name: "پاکبان پارک",
      icon: "🌿",
      desc: "پارک را تمیز کردی و به گل‌ها آب دادی.",
      check: function (st) { return st.isStationDone(4); }
    },
    {
      id: "smart-walker",
      name: "عابر باهوش",
      icon: "🚸",
      desc: "دعوت‌نامه‌ها را رساندی، آن هم با رعایت کامل قانون.",
      check: function (st) { return st.isStationDone(5); }
    },
    {
      id: "kind-neighbor",
      name: "همسایهٔ مهربان",
      icon: "🤝",
      desc: "به همسایه‌هایی که کمک لازم داشتند، درست راهنمایی دادی.",
      check: function (st) { return st.isStationDone(6); }
    },
    {
      id: "square-builder",
      name: "معمار میدان",
      icon: "📐",
      desc: "میدان جشن را اندازه گرفتی و آماده کردی.",
      check: function (st) { return st.isStationDone(7); }
    },

    /* ---------- نشان‌های ویژه ---------- */

    {
      id: "first-step",
      name: "اولین قدم",
      icon: "👣",
      desc: "اولین مأموریتت را تمام کردی و اولین چراغ را روشن کردی.",
      check: function (st) { return st.lampsLit() >= 1; }
    },
    {
      id: "three-stars",
      name: "کار بی‌عیب",
      icon: "🌟",
      desc: "یک مأموریت را با هر سه ستاره تمام کردی.",
      check: function (st) {
        var s = st.data.progress.stations;
        for (var k in s) {
          if (s.hasOwnProperty(k) && s[k].best >= 3) { return true; }
        }
        return false;
      }
    },
    {
      id: "coin-saver",
      name: "پس‌اندازکن",
      icon: "🪙",
      desc: "روی هم ۱۰۰ سکه جمع کردی.",
      check: function (st) {
        // سکه‌های خرج‌شده هم حساب می‌شوند، پس مجموع را از ستاره‌ها جدا نگه می‌داریم
        var spent = st.data.shop.owned.length * 10;
        return (st.data.progress.coins + spent) >= 100;
      }
    },
    {
      id: "decorator",
      name: "تزیین‌گر جشن",
      icon: "🎈",
      desc: "برای میدان جشن پنج تزیین خریدی.",
      check: function (st) { return st.data.shop.owned.length >= 5; }
    },
    {
      id: "neighborhood-hero",
      name: "قهرمان محله",
      icon: "🏅",
      desc: "هر هفت چراغ درخت میدان را روشن کردی. محله به تو افتخار می‌کند!",
      check: function (st) { return st.allStationsDone(); }
    }
  ];

  var byId = {};
  for (var i = 0; i < list.length; i++) {
    byId[list[i].id] = list[i];
  }

  return {

    all: function () {
      return list.slice();
    },

    get: function (id) {
      return byId[id] || null;
    },

    count: function () {
      return list.length;
    },

    /**
     * بررسی همهٔ نشان‌ها و دادن نشان‌های تازه.
     * @returns {Array} فهرست نشان‌های تازه‌ای که همین حالا گرفته شد
     */
    checkAll: function () {
      var st = APP.State;
      if (!st) { return []; }

      var fresh = [];
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        if (st.hasBadge(b.id)) { continue; }
        var ok = false;
        try {
          ok = b.check(st);
        } catch (err) {
          ok = false;
        }
        if (ok && st.awardBadge(b.id)) {
          fresh.push(b);
        }
      }
      return fresh;
    }
  };
})();
