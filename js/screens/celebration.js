/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/screens/celebration.js — جشن پایان

   وقتی هر هفت چراغ روشن شد، محله جشن می‌گیرد. میدانی که در
   این صفحه دیده می‌شود، همان میدانی است که دانش‌آموز خودش با
   سکه‌هایش تزیین کرده — پس جشن هر بچه با بچهٔ دیگر فرق دارد.

   کاغذرنگی‌ها روی canvas کشیده می‌شوند و اگر کاربر «کاهش حرکت»
   را روشن کرده باشد، اصلاً اجرا نمی‌شوند.

   وابستگی: APP.Router، APP.UI، APP.State، APP.SquareView
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var U = APP.UI;
  var D = document;

  var canvas = null, ctx = null, pieces = [], raf = null, running = false;
  var COLORS = ["#FFC93C", "#2EC4B6", "#FF8A5B", "#E86A8B", "#48B26A", "#8E6BBF"];

  APP.Router.register("celebration", {
    el: "screen-celebration",
    topbar: false,
    title: "جشن محله",
    onEnter: enter,
    onLeave: stop
  });

  /* ---------- ورود ---------- */

  function enter() {
    var st = APP.State;
    var name = st.data.player.name || "قهرمان محله";

    D.getElementById("celebration-text").textContent =
      name + " جان، هر هفت چراغ محلهٔ آفتاب روشن شد! " +
      "با " + U.fa(st.data.progress.stars) + " ستاره و " +
      U.fa(st.data.badges.length) + " نشان، محله به تو افتخار می‌کند.";

    // میدانی که خودش ساخته
    if (APP.SquareView) {
      APP.SquareView.draw(D.getElementById("celebration-square"), true);
    }

    st.markFinished();
    if (APP.Audio) { APP.Audio.celebrate(); }

    start();
  }

  /* ---------- کاغذرنگی ---------- */

  function start() {
    if (U.reducedMotion()) { return; }

    canvas = D.getElementById("confetti-canvas");
    if (!canvas || !canvas.getContext) { return; }
    ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    resize();
    U.on(window, "resize", resize);

    pieces = [];
    for (var i = 0; i < 90; i++) { pieces.push(makePiece(true)); }

    running = true;
    raf = window.requestAnimationFrame(tick);

    // بعد از ده ثانیه آرام می‌گیرد تا حواس کسی پرت نماند
    setTimeout(stop, 10000);
  }

  function makePiece(spread) {
    return {
      x: Math.random() * canvas.width,
      y: spread ? (Math.random() * canvas.height - canvas.height) : -20,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 1.2 + Math.random() * 2.4,
      drift: -0.8 + Math.random() * 1.6,
      spin: -0.06 + Math.random() * 0.12,
      angle: Math.random() * Math.PI
    };
  }

  function tick() {
    if (!running || !ctx) { return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      p.y += p.speed;
      p.x += p.drift;
      p.angle += p.spin;

      if (p.y > canvas.height + 20) {
        pieces[i] = makePiece(false);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    raf = window.requestAnimationFrame(tick);
  }

  function resize() {
    if (!canvas) { return; }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function stop() {
    running = false;
    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    if (ctx && canvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  /* ---------- دکمه‌ها ---------- */

  U.onTap(D.getElementById("btn-celebration-report"), function () {
    APP.Router.go("report");
  });

  U.onTap(D.getElementById("btn-celebration-menu"), function () {
    APP.Router.go("menu");
  });
})();
