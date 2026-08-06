/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/core/rng.js — تولیدکنندهٔ عدد تصادفی با بذر (Seeded RNG)

   چرا خودمان می‌سازیم و از Math.random استفاده نمی‌کنیم؟
   ۱. با «بذر» می‌توان یک سؤال را دقیقاً دوباره ساخت (برای مرور و اشکال‌زدایی).
   ۲. رفتار آن روی همهٔ مرورگرها یکسان است.
   ۳. ابزارهای آماده‌ای مثل pick و shuffle دارد که در همهٔ الگوهای
      سؤال بارها لازم می‌شوند.

   وابستگی: ندارد. این اولین فایل بارگذاری‌شدهٔ پروژه است.
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  /**
   * سازندهٔ یک تولیدکنندهٔ تصادفی مستقل.
   * الگوریتم mulberry32: کوچک، سریع و با پخش یکنواخت.
   * @param {number} [seed] بذر شروع؛ اگر ندهید از ساعت سیستم گرفته می‌شود.
   */
  function Rng(seed) {
    if (typeof seed !== "number" || !isFinite(seed)) {
      seed = (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0;
    }
    this.seed = seed >>> 0;
    this._s = this.seed;
  }

  /* ---------- پایه ---------- */

  /** عدد اعشاری تصادفی در بازهٔ [0, 1) */
  Rng.prototype.next = function () {
    this._s = (this._s + 0x6D2B79F5) >>> 0;
    var t = this._s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** بازگرداندن تولیدکننده به حالت اولیهٔ همان بذر */
  Rng.prototype.reset = function () {
    this._s = this.seed;
    return this;
  };

  /* ---------- عددها ---------- */

  /**
   * عدد صحیح تصادفی بین min و max (هر دو شامل).
   * @example rnd.int(2, 5) → یکی از ۲، ۳، ۴، ۵
   */
  Rng.prototype.int = function (min, max) {
    if (max === undefined) { max = min; min = 0; }
    if (max < min) { var t = min; min = max; max = t; }
    return min + Math.floor(this.next() * (max - min + 1));
  };

  /** عدد اعشاری تصادفی بین min و max */
  Rng.prototype.float = function (min, max) {
    return min + this.next() * (max - min);
  };

  /**
   * عدد صحیح تصادفی که مضربی از step باشد.
   * برای قیمت‌ها لازم است تا عددهای بی‌ریخت مثل ۴۳۷۱ تومان ساخته نشود.
   * @example rnd.step(1000, 12000, 500) → مثلاً ۷۵۰۰
   */
  Rng.prototype.step = function (min, max, step) {
    step = step || 1;
    var lo = Math.ceil(min / step);
    var hi = Math.floor(max / step);
    if (hi < lo) { hi = lo; }
    return this.int(lo, hi) * step;
  };

  /** با احتمال p (بین ۰ تا ۱) درست برمی‌گرداند */
  Rng.prototype.chance = function (p) {
    return this.next() < p;
  };

  /** یکی از ۱+ یا ۱- را برمی‌گرداند */
  Rng.prototype.sign = function () {
    return this.next() < 0.5 ? -1 : 1;
  };

  /* ---------- فهرست‌ها ---------- */

  /** یک عضو تصادفی از آرایه */
  Rng.prototype.pick = function (arr) {
    if (!arr || !arr.length) { return undefined; }
    return arr[this.int(0, arr.length - 1)];
  };

  /**
   * چند عضو متفاوت از آرایه (بدون تکرار).
   * اگر n از طول آرایه بیشتر باشد، همهٔ اعضا برگردانده می‌شوند.
   */
  Rng.prototype.pickMany = function (arr, n) {
    return this.shuffle(arr).slice(0, Math.min(n, arr.length));
  };

  /**
   * انتخاب وزن‌دار.
   * @param {Array} arr فهرست گزینه‌ها
   * @param {Array<number>} weights وزن هر گزینه با همان ترتیب
   */
  Rng.prototype.pickWeighted = function (arr, weights) {
    var total = 0, i;
    for (i = 0; i < weights.length; i++) { total += weights[i]; }
    var r = this.next() * total;
    for (i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) { return arr[i]; }
    }
    return arr[arr.length - 1];
  };

  /**
   * درهم‌ریزی آرایه با روش فیشر–ییتس.
   * آرایهٔ تازه برمی‌گرداند؛ آرایهٔ اصلی دست‌نخورده می‌ماند.
   */
  Rng.prototype.shuffle = function (arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = this.int(0, i);
      var t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  };

  /**
   * چند عدد صحیح متفاوت در یک بازه.
   * برای ساخت گزینه‌های انحرافی به کار می‌رود.
   * @param {number} n چند عدد
   * @param {Array<number>} [avoid] عددهایی که نباید تکرار شوند
   */
  Rng.prototype.uniqueInts = function (n, min, max, avoid) {
    var taken = {}, out = [], guard = 0, i;
    if (avoid) {
      for (i = 0; i < avoid.length; i++) { taken[avoid[i]] = true; }
    }
    while (out.length < n && guard < 400) {
      guard++;
      var v = this.int(min, max);
      if (!taken[v]) {
        taken[v] = true;
        out.push(v);
      }
    }
    return out;
  };

  /* ---------- ابزار ساخت ---------- */

  /** ساخت یک تولیدکنندهٔ تازه */
  Rng.create = function (seed) {
    return new Rng(seed);
  };

  /**
   * ساخت بذر عددی از روی یک رشته.
   * کاربرد: بذر یکتا برای «اسم دانش‌آموز + شمارهٔ مأموریت».
   */
  Rng.seedFrom = function (str) {
    var h = 2166136261, i;
    str = String(str);
    for (i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  APP.Rng = Rng;

  /**
   * تولیدکنندهٔ مشترک بازی.
   * هر بار که بازی باز می‌شود بذر تازه می‌گیرد؛
   * به همین دلیل هیچ دو اجرایی مثل هم نیست.
   */
  APP.rnd = new Rng();
})();
