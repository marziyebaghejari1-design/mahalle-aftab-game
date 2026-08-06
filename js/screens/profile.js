/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/profile.js — ساخت شخصیت

   دانش‌آموز اسمش را می‌نویسد، چهرک انتخاب می‌کند و سطح شروع را
   می‌گزیند. اسم در همهٔ سؤال‌ها و کارنامه استفاده می‌شود.

   نکته: اگر اسمی وارد نشود، بازی متوقف نمی‌شود؛ نام «قهرمان
   محله» گذاشته می‌شود تا هیچ بچه‌ای پشت یک فرم گیر نکند.

   وابستگی: APP.Router، APP.UI، APP.State
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  var AVATARS = [
    { id: "a1", icon: "👧", label: "دختر با موی بافته" },
    { id: "a2", icon: "🧒", label: "بچهٔ با موی کوتاه" },
    { id: "a3", icon: "👦", label: "پسر" },
    { id: "a4", icon: "🧕", label: "دختر با روسری" },
    { id: "a5", icon: "🦸", label: "قهرمان" },
    { id: "a6", icon: "🐤", label: "جوجه" }
  ];

  var chosenAvatar = "a1";
  var chosenLevel = 1;

  APP.Router.register("profile", {
    el: "screen-profile",
    topbar: false,
    root: true,
    title: "ساخت شخصیت",
    onEnter: fill
  });

  /* ---------- پرکردن صفحه ---------- */

  function fill() {
    var p = APP.State.data.player;
    chosenAvatar = p.avatar || "a1";
    chosenLevel = p.level || 1;

    D.getElementById("input-name").value = p.name || "";
    drawAvatars();
    markLevel(chosenLevel);
  }

  function drawAvatars() {
    var list = U.clear(D.getElementById("avatar-list"));

    for (var i = 0; i < AVATARS.length; i++) {
      list.appendChild(avatarButton(AVATARS[i]));
    }
  }

  function avatarButton(av) {
    var btn = U.el("button", "avatar-opt" + (av.id === chosenAvatar ? " is-selected" : ""), av.icon);
    btn.type = "button";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", av.id === chosenAvatar ? "true" : "false");
    btn.setAttribute("aria-label", av.label);

    U.onTap(btn, function () {
      chosenAvatar = av.id;
      drawAvatars();
      U.announce(av.label + " انتخاب شد");
    });
    return btn;
  }

  function markLevel(level) {
    var chips = D.getElementById("level-list").querySelectorAll(".level-chip");
    for (var i = 0; i < chips.length; i++) {
      var on = parseInt(chips[i].getAttribute("data-level"), 10) === level;
      U.toggleClass(chips[i], "is-selected", on);
      chips[i].setAttribute("aria-checked", on ? "true" : "false");
    }
  }

  /* ---------- دکمه‌ها ---------- */

  (function wireLevels() {
    var chips = D.getElementById("level-list").querySelectorAll(".level-chip");
    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        U.onTap(chip, function () {
          chosenLevel = parseInt(chip.getAttribute("data-level"), 10) || 1;
          markLevel(chosenLevel);
        });
      })(chips[i]);
    }
  })();

  U.onTap(D.getElementById("btn-start-adventure"), function () {
    var name = (D.getElementById("input-name").value || "").trim();
    if (!name) { name = "قهرمان محله"; }

    APP.State.setPlayer(name, chosenAvatar);
    APP.State.setLevel(chosenLevel);
    APP.State.resetSession();

    APP.Router.go("map");
  });

  // زدن کلید Enter در جعبهٔ اسم، مثل زدن دکمهٔ شروع است
  U.on(D.getElementById("input-name"), "keydown", function (ev) {
    if (ev.key === "Enter") {
      ev.preventDefault();
      D.getElementById("btn-start-adventure").click();
    }
  });
})();
