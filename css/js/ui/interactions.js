/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/ui/interactions.js — پنج نوع تعامل پاسخ

   choice / decision → گزینه‌ای
   numpad            → صفحه‌کلید عددی
   order             → مرتب‌سازی
   drag              → کشیدن و رهاکردن

   ── تصمیم مهم: «ضربه‌ای» به‌جای «کشیدنی» ──
   کشیدن با انگشت برای کودک ۸ ساله روی گوشی سخت است و روی
   صفحه‌کلید اصلاً کار نمی‌کند. به همین دلیل همهٔ تعامل‌ها با
   «ضربه زدن» هم کار می‌کنند: یک بار روی مورد می‌زنی، یک بار
   روی جای مقصد. برای کسانی که با ماوس کار می‌کنند، کشیدن
   واقعی هم فعال است. هر دو راه همیشه در دسترس‌اند.

   وابستگی: APP.UI، APP.Generator، APP.Audio
   ============================================================ */

var APP = APP || {};

APP.Interactions = (function () {
  "use strict";

  var U = APP.UI;

  /* ============================================================
     نقطهٔ ورود
     ============================================================ */

  /**
   * ساخت ناحیهٔ پاسخ برای یک سؤال.
   * @param {Object} q سؤال
   * @param {Element} box ظرف نمایش
   * @param {Function} onChange وقتی پاسخ عوض شد صدا زده می‌شود
   * @returns {Object} کنترل‌کننده با توابع getResponse، lock و reveal
   */
  function render(q, box, onChange) {
    U.clear(box);
    box.setAttribute("data-interaction", q.interaction);

    switch (q.interaction) {
      case "choice":
      case "decision":
        return buildChoice(q, box, onChange);
      case "numpad":
        return buildNumpad(q, box, onChange);
      case "order":
        return buildOrder(q, box, onChange);
      case "drag":
        return buildDrag(q, box, onChange);
      default:
        return emptyController();
    }
  }

  function emptyController() {
    return {
      getResponse: function () { return null; },
      hasResponse: function () { return false; },
      lock: function () {},
      reveal: function () {},
      focusFirst: function () {}
    };
  }

  /* ============================================================
     ۱. گزینه‌ای
     ============================================================ */

  function buildChoice(q, box, onChange) {
    var wrap = U.el("div", "choices");
    var buttons = [];
    var picked = null;

    for (var i = 0; i < q.choices.length; i++) {
      wrap.appendChild(makeChoice(q.choices[i]));
    }
    box.appendChild(wrap);

    function makeChoice(value) {
      var btn = U.el("button", "choice", value);
      btn.type = "button";
      btn.setAttribute("aria-pressed", "false");
      buttons.push(btn);

      U.onTap(btn, function () {
        if (btn.disabled) { return; }
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].classList.remove("is-picked");
          buttons[j].setAttribute("aria-pressed", "false");
        }
        btn.classList.add("is-picked");
        btn.setAttribute("aria-pressed", "true");
        picked = value;
        onChange(true);
      });
      return btn;
    }

    return {
      getResponse: function () { return picked; },
      hasResponse: function () { return picked !== null; },

      /** بعد از پاسخ نادرست، همان گزینه کنار گذاشته می‌شود */
      markWrong: function () {
        for (var j = 0; j < buttons.length; j++) {
          if (buttons[j].classList.contains("is-picked")) {
            buttons[j].classList.remove("is-picked");
            buttons[j].classList.add("is-removed");
            U.nudge(buttons[j]);
          }
        }
        picked = null;
        onChange(false);
      },

      lock: function () {
        for (var j = 0; j < buttons.length; j++) { buttons[j].disabled = true; }
      },

      reveal: function () {
        for (var j = 0; j < buttons.length; j++) {
          if (buttons[j].textContent === q.answer) {
            buttons[j].classList.add("is-correct");
            buttons[j].classList.remove("is-removed");
          }
        }
      },

      focusFirst: function () {
        if (buttons.length) { buttons[0].focus(); }
      }
    };
  }

  /* ============================================================
     ۲. صفحه‌کلید عددی
     ============================================================ */

  function buildNumpad(q, box, onChange) {
    var wrap = U.el("div", "numpad");
    var value = "";

    var display = U.el("div", "numpad__display", "؟");
    display.setAttribute("role", "status");
    display.setAttribute("aria-live", "polite");
    display.setAttribute("aria-label", "عددی که وارد کرده‌ای");
    wrap.appendChild(display);

    if (q.unit) {
      wrap.appendChild(U.el("p", "field__hint", "واحد: " + q.unit));
    }

    var keys = U.el("div", "numpad__keys");
    var order = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "پاک", "۰", "⌫"];
    var latin = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];

    for (var i = 0; i < order.length; i++) {
      keys.appendChild(makeKey(order[i], latin[i]));
    }
    wrap.appendChild(keys);
    box.appendChild(wrap);

    function makeKey(label, digit) {
      var btn = U.el("button", "numpad__key", label);
      btn.type = "button";
      btn.setAttribute("aria-label",
        label === "پاک" ? "پاک کردن همه" : (label === "⌫" ? "حذف رقم آخر" : "عدد " + label));

      U.onTap(btn, function () {
        if (btn.disabled) { return; }
        if (label === "پاک") { value = ""; }
        else if (label === "⌫") { value = value.slice(0, -1); }
        else if (value.length < 6) { value += digit; }

        display.textContent = value === "" ? "؟" : U.fa(value);
        onChange(value !== "");
      });
      return btn;
    }

    // پشتیبانی از صفحه‌کلید واقعی رایانه
    function onKey(ev) {
      if (ev.key >= "0" && ev.key <= "9" && value.length < 6) {
        value += ev.key;
      } else if (ev.key === "Backspace") {
        value = value.slice(0, -1);
      } else {
        return;
      }
      ev.preventDefault();
      display.textContent = value === "" ? "؟" : U.fa(value);
      onChange(value !== "");
    }
    document.addEventListener("keydown", onKey);

    return {
      getResponse: function () { return value; },
      hasResponse: function () { return value !== ""; },

      markWrong: function () {
        U.nudge(display);
        value = "";
        display.textContent = "؟";
        onChange(false);
      },

      lock: function () {
        document.removeEventListener("keydown", onKey);
        var all = keys.querySelectorAll("button");
        for (var j = 0; j < all.length; j++) { all[j].disabled = true; }
      },

      reveal: function () {
        display.textContent = U.fa(q.answer);
        display.classList.add("is-correct");
      },

      focusFirst: function () {
        var first = keys.querySelector("button");
        if (first) { first.focus(); }
      }
    };
  }

  /* ============================================================
     ۳. مرتب‌سازی
     ============================================================ */

  function buildOrder(q, box, onChange) {
    var current = q.items.slice();
    var selected = null;
    var list = U.el("ol", "token-tray");
    list.style.flexDirection = "column";
    list.setAttribute("aria-label", "فهرست برای مرتب کردن");
    box.appendChild(list);

    box.appendChild(U.el("p", "field__hint",
      "روی یک مورد بزن و بعد روی مورد دیگر، تا جایشان عوض شود."));

    draw();
    onChange(true);   // ترتیب اولیه هم یک پاسخ است

    function draw() {
      U.clear(list);
      for (var i = 0; i < current.length; i++) {
        list.appendChild(makeRow(current[i], i));
      }
    }

    function makeRow(item, index) {
      var li = U.el("li", "token");
      li.style.width = "100%";
      li.style.justifyContent = "space-between";

      var btn = U.el("button", "", U.fa(index + 1) + ". " + item.label);
      btn.type = "button";
      btn.style.flex = "1 1 auto";
      btn.style.textAlign = "start";
      btn.setAttribute("aria-label", item.label + "، جایگاه " + U.fa(index + 1));
      btn.setAttribute("aria-pressed", selected === index ? "true" : "false");
      if (selected === index) { li.classList.add("is-placed"); }

      U.onTap(btn, function () {
        if (selected === null) {
          selected = index;
        } else if (selected === index) {
          selected = null;
        } else {
          swap(selected, index);
          selected = null;
        }
        draw();
        onChange(true);
      });

      var up = arrowButton("▲", "بردن به بالا", function () {
        if (index > 0) { swap(index, index - 1); selected = null; draw(); onChange(true); }
      });
      var down = arrowButton("▼", "بردن به پایین", function () {
        if (index < current.length - 1) { swap(index, index + 1); selected = null; draw(); onChange(true); }
      });

      li.appendChild(btn);
      li.appendChild(up);
      li.appendChild(down);
      return li;
    }

    function arrowButton(label, aria, fn) {
      var b = U.el("button", "icon-btn icon-btn--sm", label);
      b.type = "button";
      b.setAttribute("aria-label", aria);
      U.onTap(b, fn);
      return b;
    }

    function swap(a, b) {
      var t = current[a];
      current[a] = current[b];
      current[b] = t;
    }

    return {
      getResponse: function () {
        return current.map(function (it) { return it.id; });
      },
      hasResponse: function () { return true; },

      markWrong: function () {
        U.nudge(list);
        selected = null;
        draw();
      },

      lock: function () {
        var all = list.querySelectorAll("button");
        for (var j = 0; j < all.length; j++) { all[j].disabled = true; }
      },

      reveal: function () {
        var byId = {};
        for (var i = 0; i < current.length; i++) { byId[current[i].id] = current[i]; }
        current = q.correctOrder.map(function (id) { return byId[id]; });
        selected = null;
        draw();
        var rows = list.querySelectorAll(".token");
        for (var k = 0; k < rows.length; k++) { rows[k].classList.add("is-placed"); }
      },

      focusFirst: function () {
        var first = list.querySelector("button");
        if (first) { first.focus(); }
      }
    };
  }

  /* ============================================================
     ۴. کشیدن و رهاکردن
     ============================================================ */

  function buildDrag(q, box, onChange) {
    var placed = {};      // { شناسهٔ مورد: شناسهٔ منطقه }
    var holding = null;   // موردی که برداشته شده
    var tray = U.el("div", "token-tray");
    var zonesBox = U.el("div", "dropzones");
    var zoneNodes = {};

    box.appendChild(U.el("p", "field__hint",
      "روی یک مورد بزن، بعد روی جای درستش بزن. با ماوس هم می‌توانی بکشی."));
    box.appendChild(tray);
    box.appendChild(zonesBox);

    for (var z = 0; z < q.zones.length; z++) {
      zonesBox.appendChild(makeZone(q.zones[z]));
    }
    drawTray();

    /* ---------- منطقه‌ها ---------- */

    function makeZone(zone) {
      var node = U.el("div", "dropzone");
      node.setAttribute("data-zone", zone.id);
      node.appendChild(U.el("span", "dropzone__label", zone.label));
      zoneNodes[zone.id] = node;

      node.addEventListener("click", function () {
        if (holding) { place(holding, zone.id); }
      });

      node.addEventListener("dragover", function (ev) {
        ev.preventDefault();
        node.classList.add("is-over");
      });
      node.addEventListener("dragleave", function () {
        node.classList.remove("is-over");
      });
      node.addEventListener("drop", function (ev) {
        ev.preventDefault();
        node.classList.remove("is-over");
        var id = ev.dataTransfer.getData("text/plain");
        if (id) { place(id, zone.id); }
      });

      return node;
    }

    /* ---------- موردها ---------- */

    function drawTray() {
      U.clear(tray);
      var left = 0;
      for (var i = 0; i < q.items.length; i++) {
        if (placed[q.items[i].id]) { continue; }
        tray.appendChild(makeToken(q.items[i]));
        left++;
      }
      if (!left) {
        tray.appendChild(U.el("p", "field__hint", "همه را گذاشتی! حالا «بررسی پاسخ» را بزن."));
      }
    }

    function makeToken(item) {
      var btn = U.el("button", "token", item.label);
      btn.type = "button";
      btn.draggable = true;
      btn.setAttribute("aria-label", item.label + " — برای برداشتن بزن");
      btn.setAttribute("aria-pressed", holding === item.id ? "true" : "false");
      if (holding === item.id) { btn.classList.add("is-dragging"); }

      U.onTap(btn, function () {
        holding = (holding === item.id) ? null : item.id;
        drawTray();
        highlightZones();
        if (holding) {
          U.announce(item.label + " برداشته شد. حالا جای درستش را بزن.");
        }
      });

      btn.addEventListener("dragstart", function (ev) {
        holding = item.id;
        ev.dataTransfer.setData("text/plain", item.id);
        btn.classList.add("is-dragging");
      });
      btn.addEventListener("dragend", function () {
        btn.classList.remove("is-dragging");
      });

      return btn;
    }

    /* ---------- گذاشتن در منطقه ---------- */

    function place(itemId, zoneId) {
      var item = findItem(itemId);
      if (!item) { return; }

      placed[itemId] = zoneId;
      holding = null;

      if (APP.Audio) { APP.Audio.click(); }
      drawTray();
      drawZones();
      highlightZones();
      onChange(allPlaced());
    }

    function drawZones() {
      for (var id in zoneNodes) {
        if (!zoneNodes.hasOwnProperty(id)) { continue; }
        var node = zoneNodes[id];
        // برچسب منطقه می‌ماند، بقیه پاک می‌شود
        while (node.childNodes.length > 1) { node.removeChild(node.lastChild); }
      }
      for (var itemId in placed) {
        if (!placed.hasOwnProperty(itemId)) { continue; }
        var item = findItem(itemId);
        var zone = zoneNodes[placed[itemId]];
        if (item && zone) { zone.appendChild(makePlaced(item)); }
      }
    }

    function makePlaced(item) {
      var chip = U.el("button", "token is-placed", item.label);
      chip.type = "button";
      chip.setAttribute("aria-label", item.label + " — برای برداشتن دوباره بزن");
      U.onTap(chip, function () {
        delete placed[item.id];
        drawTray();
        drawZones();
        onChange(allPlaced());
      });
      return chip;
    }

    function highlightZones() {
      for (var id in zoneNodes) {
        if (!zoneNodes.hasOwnProperty(id)) { continue; }
        zoneNodes[id].classList.toggle("is-over", !!holding);
      }
    }

    function findItem(id) {
      for (var i = 0; i < q.items.length; i++) {
        if (q.items[i].id === id) { return q.items[i]; }
      }
      return null;
    }

    function allPlaced() {
      for (var i = 0; i < q.items.length; i++) {
        if (!placed[q.items[i].id]) { return false; }
      }
      return true;
    }

    return {
      getResponse: function () {
        var copy = {};
        for (var k in placed) {
          if (placed.hasOwnProperty(k)) { copy[k] = placed[k]; }
        }
        return copy;
      },
      hasResponse: allPlaced,

      /** فقط موردهای نادرست به سینی برمی‌گردند، درست‌ها می‌مانند */
      markWrong: function () {
        var back = 0;
        for (var id in q.correctZones) {
          if (!q.correctZones.hasOwnProperty(id)) { continue; }
          if (placed[id] && placed[id] !== q.correctZones[id]) {
            delete placed[id];
            back++;
          }
        }
        drawTray();
        drawZones();
        U.nudge(tray);
        onChange(allPlaced());
        if (back) {
          U.announce(U.fa(back) + " مورد به سینی برگشت. بقیه درست بود.");
        }
      },

      lock: function () {
        var all = box.querySelectorAll("button");
        for (var j = 0; j < all.length; j++) { all[j].disabled = true; }
      },

      reveal: function () {
        for (var id in q.correctZones) {
          if (q.correctZones.hasOwnProperty(id)) { placed[id] = q.correctZones[id]; }
        }
        holding = null;
        drawTray();
        drawZones();
        highlightZones();
      },

      focusFirst: function () {
        var first = tray.querySelector("button");
        if (first) { first.focus(); }
      }
    };
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return { render: render };
})();
