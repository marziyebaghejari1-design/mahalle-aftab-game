/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/engine/adaptive.js — تنظیم خودکار سطح

   دانش‌آموز در ابتدا سطحش را خودش انتخاب می‌کند، ولی همیشه
   انتخاب درستی نیست. این فایل در حین بازی حواسش هست:

   • سه پاسخ درست پشت‌سرهم در تلاش اول → یک پله بالاتر
   • دو سؤال پشت‌سرهم که تا پلهٔ سوم راهنما رفته → یک پله پایین‌تر

   ── سه قانون مهم ──
   ۱. تغییر سطح هرگز به دانش‌آموز به شکل «تو ضعیفی» گفته نمی‌شود.
      پیامِ پایین آمدن سطح، جمله‌ای دربارهٔ خود بازی است، نه بچه.
   ۲. سطح فقط یک پله از انتخاب اولیهٔ دانش‌آموز فاصله می‌گیرد،
      نه بیشتر؛ تا بازی ناگهان عوض نشود.
   ۳. سطح انتخابی خود دانش‌آموز در تنظیمات دست‌نخورده می‌ماند؛
      این تغییر فقط برای همین مأموریت است.

   وابستگی: APP.State
   ============================================================ */

var APP = APP || {};

APP.Adaptive = (function () {
  "use strict";

  var UP_STREAK = 3;     // چند پاسخ درستِ تلاش‌اول برای یک پله بالا
  var DOWN_STREAK = 2;   // چند سؤال سخت پشت‌سرهم برای یک پله پایین
  var MAX_DRIFT = 1;     // حداکثر فاصله از سطح انتخابی دانش‌آموز

  /* ============================================================
     ثبت نتیجهٔ هر سؤال
     ============================================================ */

  /**
   * پس از هر سؤال صدا زده می‌شود.
   * @param {boolean} solved آیا خودش حل کرد
   * @param {number} attempt در چندمین تلاش
   * @returns {Object|null} اگر سطح عوض شد: { from, to, direction, message }
   */
  function record(solved, attempt) {
    var s = APP.State.session;
    if (!s) { return null; }

    if (solved && attempt <= 1) {
      s.streakRight++;
      s.streakWrong = 0;
    } else if (!solved || attempt >= 3) {
      s.streakWrong++;
      s.streakRight = 0;
    } else {
      // تلاش دوم: نه بالا، نه پایین
      s.streakRight = 0;
      s.streakWrong = 0;
    }

    if (s.streakRight >= UP_STREAK) {
      s.streakRight = 0;
      return shift(+1);
    }
    if (s.streakWrong >= DOWN_STREAK) {
      s.streakWrong = 0;
      return shift(-1);
    }
    return null;
  }

  /* ============================================================
     تغییر سطح
     ============================================================ */

  function shift(direction) {
    var s = APP.State.session;
    var base = APP.State.data.player.level;
    var from = s.levelNow;

    var to = from + direction;
    if (to < 1) { to = 1; }
    if (to > 3) { to = 3; }
    if (to < base - MAX_DRIFT) { to = base - MAX_DRIFT; }
    if (to > base + MAX_DRIFT) { to = base + MAX_DRIFT; }
    if (to < 1) { to = 1; }
    if (to > 3) { to = 3; }

    if (to === from) { return null; }
    s.levelNow = to;

    return {
      from: from,
      to: to,
      direction: direction > 0 ? "up" : "down",
      message: message(direction > 0, to)
    };
  }

  /**
   * پیام تغییر سطح.
   * پیام‌ها دربارهٔ بازی هستند، نه دربارهٔ توانایی دانش‌آموز.
   */
  function message(isUp, to) {
    if (isUp) {
      return "خیلی خوب پیش می‌روی! سؤال‌های بعدی کمی چالشی‌تر می‌شوند.";
    }
    return "بیا کمی آرام‌تر پیش برویم تا مطمئن شویم همه‌چیز جا افتاده.";
  }

  /* ============================================================
     خواندن سطح جاری
     ============================================================ */

  /** سطحی که همین حالا باید سؤال از آن ساخته شود */
  function level() {
    var s = APP.State.session;
    return (s && s.levelNow) || APP.State.data.player.level || 1;
  }

  /** برگرداندن سطح مأموریت به سطح انتخابی دانش‌آموز */
  function reset() {
    var s = APP.State.session;
    if (s) {
      s.levelNow = APP.State.data.player.level;
      s.streakRight = 0;
      s.streakWrong = 0;
    }
  }

  /** نام فارسی سطح، برای نمایش */
  function levelName(n) {
    return n === 1 ? "آسان" : (n === 2 ? "متوسط" : "چالشی");
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    record: record,
    level: level,
    reset: reset,
    levelName: levelName,
    UP_STREAK: UP_STREAK,
    DOWN_STREAK: DOWN_STREAK
  };
})();
