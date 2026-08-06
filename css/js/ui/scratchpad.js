/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/ui/scratchpad.js — دفترچه حل مسئله (چرک‌نویس)

   شبیه‌سازی همان برگهٔ چرک‌نویسی که دانش‌آموز کنار دستش
   می‌گذارد. فقط در فعالیت‌های ریاضی دیده می‌شود.

   ── چرا این ویژگی مهم است؟ ──
   در مسئله‌های دو یا سه مرحله‌ای، دانش‌آموز پایهٔ سوم نمی‌تواند
   همهٔ عددها را در ذهنش نگه دارد. بدون جای نوشتن، مسئله به
   آزمون حافظه تبدیل می‌شود، نه آزمون فهم. این دفترچه همان
   بار حافظه را برمی‌دارد.

   ── تصمیم‌های فنی ──
   • خط‌ها به شکل «فهرست نقطه» نگه داشته می‌شوند، نه عکس.
     به همین دلیل با تغییر اندازهٔ پنجره یا چرخاندن گوشی،
     نوشته‌ها پاک نمی‌شوند و تار هم نمی‌شوند.
   • با Pointer Events نوشته می‌شود؛ یعنی ماوس، انگشت و قلم
     هر سه با یک کد کار می‌کنند.
   • هیچ‌چیز ذخیره نمی‌شود. با رفتن به سؤال بعد، دفترچه پاک
     می‌شود؛ درست مثل برگهٔ چرک‌نویس واقعی.

   وابستگی: APP.UI
   ============================================================ */

var APP = APP || {};

APP.Scratchpad = (function () {
  "use strict";

  var U = APP.UI;

  var pad, canvas, ctx, fab;
  var strokes = [];        // [{ color, width, erase, points: [{x,y}] }]
  var current = null;
  var drawing = false;
  var ready = false;

  var tool = "pen";
  var color = "#2D3E50";
  var width = 6;

  var dpr = 1;
  var cssW = 0, cssH = 0;

  /* ============================================================
     راه‌اندازی
     ============================================================ */

  function init() {
    pad = U.$("scratchpad");
    canvas = U.$("scratchpad-canvas");
    fab = U.$("btn-scratchpad");
    if (!pad || !canvas) { return; }

    ctx = canvas.getContext("2d");
    ready = true;

    bindTools();
    bindDrawing();
    bindDragBar();

    window.addEventListener("resize", function () {
      if (!pad.hidden) { resize(); }
    });
    window.addEventListener("orientationchange", function () {
      if (!pad.hidden) { setTimeout(resize, 250); }
    });

    if (fab) {
      U.onTap(fab, toggle);
    }
    var closeBtn = U.$("btn-close-scratchpad");
    if (closeBtn) { U.onTap(closeBtn, close); }

    return this;
  }

  /* ============================================================
     ابزارها
     ============================================================ */

  function bindTools() {
    // قلم و پاک‌کن
    each(pad.querySelectorAll("[data-tool]"), function (btn) {
      U.onTap(btn, function () {
        tool = btn.getAttribute("data-tool");
        setActive(pad.querySelectorAll("[data-tool]"), btn);
        canvas.style.cursor = (tool === "eraser") ? "cell" : "crosshair";
      });
    });

    // رنگ‌ها
    each(pad.querySelectorAll(".swatch"), function (btn) {
      U.onTap(btn, function () {
        color = btn.getAttribute("data-color");
        tool = "pen";
        setActive(pad.querySelectorAll(".swatch"), btn);
        setActive(pad.querySelectorAll("[data-tool]"),
                  pad.querySelector('[data-tool="pen"]'));
      });
    });

    // ضخامت
    each(pad.querySelectorAll(".width-btn"), function (btn) {
      U.onTap(btn, function () {
        width = parseInt(btn.getAttribute("data-width"), 10) || 6;
        setActive(pad.querySelectorAll(".width-btn"), btn);
      });
    });

    var clearBtn = U.$("btn-clear-scratchpad");
    if (clearBtn) {
      U.onTap(clearBtn, function () {
        clearAll();
        U.announce("چرک‌نویس پاک شد.");
      });
    }
  }

  /** یک دکمه را فعال و بقیه را غیرفعال می‌کند */
  function setActive(group, active) {
    each(group, function (btn) {
      var on = (btn === active);
      btn.classList.toggle("is-active", on);
      if (btn.hasAttribute("role")) {
        btn.setAttribute("aria-checked", on ? "true" : "false");
      }
    });
  }

  function each(nodeList, fn) {
    for (var i = 0; i < nodeList.length; i++) { fn(nodeList[i]); }
  }

  /* ============================================================
     نوشتن روی بوم
     ============================================================ */

  function bindDrawing() {
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onUp);

    // جلوگیری از اسکرول صفحه هنگام نوشتن با انگشت
    canvas.addEventListener("touchstart", stop, { passive: false });
    canvas.addEventListener("touchmove", stop, { passive: false });
  }

  function stop(ev) {
    ev.preventDefault();
  }

  function pointOf(ev) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left),
      y: (ev.clientY - rect.top)
    };
  }

  function onDown(ev) {
    if (!ready) { return; }
    drawing = true;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* بی‌اهمیت */ }

    current = {
      color: color,
      width: (tool === "eraser") ? Math.max(width * 3, 18) : width,
      erase: (tool === "eraser"),
      points: [pointOf(ev)]
    };
    strokes.push(current);
    redraw();
  }

  function onMove(ev) {
    if (!drawing || !current) { return; }
    var p = pointOf(ev);
    var last = current.points[current.points.length - 1];

    // نقطه‌های خیلی نزدیک را نادیده می‌گیریم تا خط نرم‌تر شود
    if (Math.abs(p.x - last.x) < 1 && Math.abs(p.y - last.y) < 1) { return; }

    current.points.push(p);
    redraw();
  }

  function onUp(ev) {
    if (!drawing) { return; }
    drawing = false;
    if (ev && ev.pointerId !== undefined) {
      try { canvas.releasePointerCapture(ev.pointerId); } catch (e) { /* بی‌اهمیت */ }
    }
    current = null;
  }

  /* ============================================================
     رسم دوباره
     ============================================================ */

  function redraw() {
    if (!ready) { return; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (var i = 0; i < strokes.length; i++) {
      var s = strokes[i];
      if (!s.points.length) { continue; }

      ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
      ctx.strokeStyle = s.erase ? "rgba(0,0,0,1)" : s.color;
      ctx.lineWidth = s.width;

      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);

      if (s.points.length === 1) {
        // یک ضربهٔ تکی: یک نقطهٔ کوچک
        ctx.lineTo(s.points[0].x + 0.1, s.points[0].y + 0.1);
      } else {
        for (var j = 1; j < s.points.length; j++) {
          ctx.lineTo(s.points[j].x, s.points[j].y);
        }
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  /** هماهنگ‌کردن اندازهٔ بوم با اندازهٔ واقعی روی صفحه */
  function resize() {
    if (!ready) { return; }
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) { return; }

    dpr = window.devicePixelRatio || 1;
    cssW = rect.width;
    cssH = rect.height;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    redraw();
  }

  /* ============================================================
     جابه‌جا کردن پنجره روی رایانه
     ============================================================ */

  function bindDragBar() {
    var bar = U.$("scratchpad-handle");
    if (!bar) { return; }

    var moving = false, offX = 0, offY = 0;

    bar.addEventListener("pointerdown", function (ev) {
      // فقط روی صفحهٔ بزرگ؛ روی گوشی پنجره پایین صفحه ثابت است
      if (window.innerWidth < 760) { return; }
      if (ev.target.closest("button")) { return; }

      moving = true;
      var rect = pad.getBoundingClientRect();
      offX = ev.clientX - rect.left;
      offY = ev.clientY - rect.top;
      bar.style.cursor = "grabbing";
      try { bar.setPointerCapture(ev.pointerId); } catch (e) { /* بی‌اهمیت */ }
    });

    bar.addEventListener("pointermove", function (ev) {
      if (!moving) { return; }
      var x = ev.clientX - offX;
      var y = ev.clientY - offY;

      // پنجره نباید کامل از صفحه بیرون برود
      x = Math.max(8, Math.min(x, window.innerWidth - pad.offsetWidth - 8));
      y = Math.max(8, Math.min(y, window.innerHeight - 60));

      pad.style.insetInlineEnd = "auto";
      pad.style.insetBlockEnd = "auto";
      pad.style.left = x + "px";
      pad.style.top = y + "px";
    });

    function release(ev) {
      if (!moving) { return; }
      moving = false;
      bar.style.cursor = "grab";
      if (ev && ev.pointerId !== undefined) {
        try { bar.releasePointerCapture(ev.pointerId); } catch (e) { /* بی‌اهمیت */ }
      }
    }
    bar.addEventListener("pointerup", release);
    bar.addEventListener("pointercancel", release);
  }

  /* ============================================================
     باز و بسته کردن
     ============================================================ */

  function open() {
    if (!ready) { return; }
    pad.hidden = false;
    if (fab) { fab.setAttribute("aria-expanded", "true"); }
    // اندازه‌گیری بعد از نمایش انجام می‌شود، وگرنه اندازه صفر است
    setTimeout(resize, 30);
    U.announce("چرک‌نویس باز شد.");
  }

  function close() {
    if (!ready) { return; }
    pad.hidden = true;
    if (fab) { fab.setAttribute("aria-expanded", "false"); }
  }

  function toggle() {
    if (!ready) { return; }
    if (pad.hidden) { open(); } else { close(); }
  }

  /** پاک‌کردن کامل نوشته‌ها */
  function clearAll() {
    strokes = [];
    current = null;
    redraw();
  }

  /**
   * آماده‌سازی برای یک سؤال تازه.
   * چرک‌نویس فقط در سؤال‌های ریاضی دیده می‌شود.
   *
   * @param {Object|boolean} q خود سؤال، یا مستقیماً بله/خیر.
   *   پذیرفتن هر دو حالت عمدی است: اگر جایی به‌اشتباه خودِ سؤال
   *   فرستاده شود، چرک‌نویس در همهٔ درس‌ها ظاهر نمی‌شود.
   */
  function forQuestion(q) {
    if (!ready) { return; }
    clearAll();

    var show;
    if (q && typeof q === "object") {
      show = !!q.needsPad;
    } else {
      show = !!q;
    }

    if (show) {
      if (fab) { fab.hidden = false; }
    } else {
      if (fab) { fab.hidden = true; }
      close();
    }
  }

  /** آیا دانش‌آموز چیزی نوشته است — برای تصمیم‌های آینده */
  function hasContent() {
    return strokes.length > 0;
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    clearAll: clearAll,
    forQuestion: forQuestion,
    hasContent: hasContent,
    resize: resize
  };
})();
