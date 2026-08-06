/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/engine/feedback.js — بازخورد آموزشی سه‌پله‌ای

   مهم‌ترین فایل آموزشی پروژه. هرگز کلمهٔ «اشتباه» یا «غلط» به
   دانش‌آموز گفته نمی‌شود.

   ── سه پله ──
   تلاش ۱ نادرست → یک سرنخ کوتاه، دوباره تلاش کن
   تلاش ۲ نادرست → راهنمای گام‌به‌گام، دوباره تلاش کن
   تلاش ۳ نادرست → راه‌حل کامل با دلیل، بعد می‌رویم جلو
                     و همان مهارت در پایان مأموریت مرور می‌شود

   ── چهار قانون ──
   ۱. بازخورد دربارهٔ کار است، نه دربارهٔ بچه.
      «این راه جواب نداد» به‌جای «تو بلد نیستی».
   ۲. بعد از پاسخ درست، فقط تشویق نمی‌کنیم؛ دلیل درستی را هم
      می‌گوییم. تشویق بدون دلیل، یادگیری نمی‌سازد.
   ۳. در سؤال‌های کشیدنی و مرتب‌سازی، می‌گوییم چند مورد درست
      بوده — تا دانش‌آموز ببیند بخشی از کارش درست بوده است.
   ۴. متن‌های تشویق چرخشی هستند تا تکراری نشوند.

   وابستگی: APP.Generator، APP.State، APP.Audio
   ============================================================ */

var APP = APP || {};

APP.Feedback = (function () {
  "use strict";

  var MAX_ATTEMPTS = 3;

  /* ============================================================
     متن‌های تشویق و دلگرمی
     ============================================================ */

  var PRAISE_FIRST = [
    "آفرین! درست بود.",
    "عالی بود!",
    "دقیقاً همین بود!",
    "خیلی خوب فکر کردی.",
    "بدون هیچ کمکی حلش کردی!"
  ];

  var PRAISE_LATER = [
    "آفرین! با تلاش دوباره پیدایش کردی.",
    "درست شد! دست نکشیدن ارزشش را داشت.",
    "همین بود! خوب شد که دوباره امتحان کردی.",
    "رسیدی! این پشتکار خیلی خوب است."
  ];

  var TRY_AGAIN = [
    "نزدیک شدی، ولی این راه جواب نداد. یک بار دیگر با این سرنخ:",
    "این یکی نشد. بیا با یک راهنمایی دوباره امتحان کنیم:",
    "هنوز نه — ولی نگران نباش. این را در نظر بگیر:"
  ];

  var TRY_HARDER = [
    "بیا با هم قدم‌به‌قدم پیش برویم:",
    "این بار راه حل را با هم می‌شکنیم به قدم‌های کوچک:",
    "خب، گام‌به‌گام نگاه کنیم:"
  ];

  var REVEAL = [
    "این یکی سخت بود. با هم ببینیم چطور حل می‌شود:",
    "اشکالی ندارد؛ این سؤال چالشی بود. راه حلش این است:",
    "بگذار نشانت بدهم، دفعهٔ بعد خودت از پسش برمی‌آیی:"
  ];

  var PARTIAL = [
    "چند مورد را درست گذاشتی!",
    "بخشی از کارت درست بود!",
    "خوب شروع کردی!"
  ];

  /* ============================================================
     ساخت بازخورد
     ============================================================ */

  /**
   * بازخورد یک پاسخ.
   * @param {Object} q سؤال
   * @param {*} resp پاسخ دانش‌آموز
   * @param {number} attempt چندمین تلاش (از ۱ شروع می‌شود)
   * @returns {Object} {
   *   correct, done, tone, icon, text, steps, coins, attempt
   * }
   *   done یعنی این سؤال تمام شد و باید رفت سؤال بعدی.
   */
  function judge(q, resp, attempt) {
    var rnd = APP.rnd;
    var correct = APP.Generator.check(q, resp);

    if (correct) {
      return {
        correct: true,
        done: true,
        tone: "correct",
        icon: attempt <= 1 ? "🌟" : "👏",
        text: rnd.pick(attempt <= 1 ? PRAISE_FIRST : PRAISE_LATER),
        steps: q.why ? [q.why] : [],
        attempt: attempt
      };
    }

    // پاسخ درست نبود
    var part = APP.Generator.partialScore(q, resp);
    var partText = "";
    if (part.total > 1 && part.right > 0) {
      partText = rnd.pick(PARTIAL) + " (" + part.right + " از " + part.total + ")";
    }

    if (attempt === 1) {
      return {
        correct: false,
        done: false,
        tone: "try",
        icon: "💭",
        text: (partText ? partText + " " : "") + rnd.pick(TRY_AGAIN),
        steps: [q.hint1],
        attempt: attempt
      };
    }

    if (attempt === 2) {
      return {
        correct: false,
        done: false,
        tone: "try",
        icon: "🧭",
        text: (partText ? partText + " " : "") + rnd.pick(TRY_HARDER),
        steps: [q.hint2 || q.hint1],
        attempt: attempt
      };
    }

    // پلهٔ سوم: راه حل کامل و رفتن به سؤال بعد
    return {
      correct: false,
      done: true,
      tone: "reveal",
      icon: "💡",
      text: rnd.pick(REVEAL),
      steps: [q.solution, answerLine(q)].concat(q.why ? [q.why] : []),
      attempt: attempt
    };
  }

  /** یک خط که پاسخ درست را روشن نشان می‌دهد */
  function answerLine(q) {
    if (q.interaction === "order" || q.interaction === "drag") {
      return "";
    }
    return "پاسخ درست: " + q.answer + (q.unit ? " " + q.unit : "");
  }

  /**
   * راهنمای درخواستی (وقتی دانش‌آموز خودش دکمهٔ «کمک می‌خواهم»
   * را می‌زند). این حالت یک تلاش مصرف نمی‌کند، ولی سکه‌اش کمتر
   * می‌شود — چون کمک گرفتن آزاد است، اما رایگان نیست.
   */
  function askedHint(q, hintLevel) {
    if (hintLevel <= 1) {
      return { icon: "💭", text: "این سرنخ کمکت می‌کند:", steps: [q.hint1] };
    }
    if (hintLevel === 2) {
      return { icon: "🧭", text: "قدم‌به‌قدم:", steps: [q.hint2 || q.hint1] };
    }
    return { icon: "💡", text: "بیا با هم حلش کنیم:", steps: [q.solution] };
  }

  /**
   * پیام پایان مأموریت.
   * لحن پیام بر اساس عملکرد عوض می‌شود، ولی هیچ‌وقت منفی نیست.
   */
  function missionMessage(stars, station) {
    var doneLine = station && station.done ? station.done : "مأموریت تمام شد!";

    if (stars >= 3) {
      return { icon: "🏆", title: "عالی بود!", text: doneLine };
    }
    if (stars === 2) {
      return { icon: "🎉", title: "کارت خوب بود!", text: doneLine };
    }
    return {
      icon: "🌱",
      title: "مأموریت تمام شد!",
      text: doneLine + " هر بار که دوباره بازی کنی، بهتر می‌شوی."
    };
  }

  /** پخش صدای متناسب با بازخورد */
  function sound(result) {
    if (!APP.Audio) { return; }
    if (result.correct) { APP.Audio.correct(); }
    else if (result.tone === "reveal") { APP.Audio.softNo(); }
    else { APP.Audio.softNo(); }
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    judge: judge,
    askedHint: askedHint,
    missionMessage: missionMessage,
    sound: sound,
    MAX_ATTEMPTS: MAX_ATTEMPTS
  };
})();
