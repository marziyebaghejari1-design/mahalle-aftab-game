/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/core/state.js — وضعیت مرکزی بازی

   تنها جایی است که دادهٔ بازی نگه‌داری و تغییر داده می‌شود.
   هیچ فایل دیگری نباید مستقیم داده را دست بزند؛ همه از توابع
   همین فایل استفاده می‌کنند. با هر تغییر، رویداد پخش می‌شود تا
   رابط کاربری خودش را تازه کند.

   دو نوع داده داریم:
   • data    — ماندگار است و در LocalStorage ذخیره می‌شود.
   • session — موقت است؛ با بستن بازی از بین می‌رود
               (سؤال جاری، پاسخ‌های همین مأموریت و …).

   وابستگی: APP.Storage (فقط هنگام اجرا، نه هنگام بارگذاری)
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var SCHEMA_VERSION = 1;
  var TOTAL_STATIONS = 7;

  /* ============================================================
     دادهٔ اولیهٔ یک دانش‌آموز تازه
     ============================================================ */
  function defaults() {
    return {
      version: SCHEMA_VERSION,

      player: {
        name: "",
        avatar: "a1",
        level: 1            // ۱ آسان، ۲ متوسط، ۳ چالشی
      },

      settings: {
        sound: true,
        reducedMotion: false,
        largeText: false
      },

      progress: {
        coins: 0,
        stars: 0,
        stations: {},        // { "1": { done: true, stars: 2, best: 2, plays: 1 } }
        finished: false,     // آیا جشن پایانی دیده شده است
        lastStation: 0
      },

      shop: {
        owned: [],           // شناسهٔ تزیین‌های خریداری‌شده
        placed: {}           // { lights: "l2", balloons: "b1", ... }
      },

      badges: [],            // شناسهٔ نشان‌های گرفته‌شده

      skills: {},            // { "math.multiply": { subject, asked, first, second, third, missed } }

      stats: {
        sessions: 0,
        answers: 0,
        firstTry: 0,
        createdAt: 0,
        lastPlayed: 0
      }
    };
  }

  /* ============================================================
     سازنده
     ============================================================ */
  var State = {

    data: defaults(),

    /** دادهٔ موقت همین اجرا — ذخیره نمی‌شود */
    session: null,

    _listeners: {},
    _saveTimer: null,

    /* ---------- راه‌اندازی ---------- */

    /** خواندن پیشرفت ذخیره‌شده و آماده‌کردن بازی */
    init: function () {
      var saved = APP.Storage ? APP.Storage.load() : null;

      if (saved && saved.version === SCHEMA_VERSION) {
        this.data = this._merge(defaults(), saved);
      } else {
        this.data = defaults();
        this.data.stats.createdAt = Date.now();
      }

      this.data.stats.sessions++;
      this.data.stats.lastPlayed = Date.now();
      this.resetSession();
      this.save();
      return this.data;
    },

    /** ادغام دادهٔ ذخیره‌شده با ساختار پیش‌فرض (برای افزودن کلیدهای تازه) */
    _merge: function (base, saved) {
      var out = {}, key;
      for (key in base) {
        if (!base.hasOwnProperty(key)) { continue; }
        var b = base[key];
        var s = saved[key];
        if (b && typeof b === "object" && !(b instanceof Array) &&
            s && typeof s === "object" && !(s instanceof Array)) {
          out[key] = this._merge(b, s);
        } else {
          out[key] = (s === undefined) ? b : s;
        }
      }
      return out;
    },

    /** پاک‌کردن کامل پیشرفت (از پنجرهٔ تنظیمات) */
    resetAll: function () {
      this.data = defaults();
      this.data.stats.createdAt = Date.now();
      this.data.stats.sessions = 1;
      this.resetSession();
      this.save();
      this.emit("reset");
      this.emit("change");
    },

    /* ---------- دادهٔ موقت مأموریت ---------- */

    resetSession: function () {
      this.session = {
        stationId: 0,
        steps: [],           // فهرست سؤال‌های همین مأموریت
        index: 0,            // شمارهٔ سؤال جاری
        attempt: 0,          // چندمین تلاش روی سؤال جاری
        streakRight: 0,      // پاسخ درست پشت‌سرهم (برای تنظیم خودکار سطح)
        streakWrong: 0,
        levelNow: this.data.player.level,
        coinsEarned: 0,
        rightFirstTry: 0,
        reviewQueue: [],     // مهارت‌هایی که باید در پایان مأموریت مرور شوند
        seenIds: {}          // جلوگیری از تکرار الگو در یک مأموریت
      };
      return this.session;
    },

    /* ---------- بازیکن و تنظیمات ---------- */

    setPlayer: function (name, avatar) {
      if (name !== undefined) { this.data.player.name = String(name).slice(0, 12); }
      if (avatar !== undefined) { this.data.player.avatar = avatar; }
      this.save();
      this.emit("player");
      this.emit("change");
    },

    setLevel: function (level) {
      level = Math.max(1, Math.min(3, parseInt(level, 10) || 1));
      this.data.player.level = level;
      if (this.session) { this.session.levelNow = level; }
      this.save();
      this.emit("level", level);
      this.emit("change");
    },

    setSetting: function (key, value) {
      if (!this.data.settings.hasOwnProperty(key)) { return; }
      this.data.settings[key] = value;
      this.save();
      this.emit("setting", { key: key, value: value });
      this.emit("change");
    },

    hasPlayer: function () {
      return !!this.data.player.name;
    },

    /* ---------- سکه و ستاره ---------- */

    addCoins: function (n) {
      n = parseInt(n, 10) || 0;
      this.data.progress.coins += n;
      if (this.session) { this.session.coinsEarned += n; }
      this.save();
      this.emit("coins", this.data.progress.coins);
      this.emit("change");
      return this.data.progress.coins;
    },

    /** خرج‌کردن سکه؛ اگر پول کافی نباشد false برمی‌گرداند */
    spendCoins: function (n) {
      n = parseInt(n, 10) || 0;
      if (this.data.progress.coins < n) { return false; }
      this.data.progress.coins -= n;
      this.save();
      this.emit("coins", this.data.progress.coins);
      this.emit("change");
      return true;
    },

    addStars: function (n) {
      this.data.progress.stars += (parseInt(n, 10) || 0);
      this.save();
      this.emit("stars", this.data.progress.stars);
      this.emit("change");
    },

    /* ---------- ایستگاه‌ها و چراغ‌ها ---------- */

    getStation: function (id) {
      return this.data.progress.stations[String(id)] || null;
    },

    isStationDone: function (id) {
      var s = this.getStation(id);
      return !!(s && s.done);
    },

    /** ثبت نتیجهٔ یک مأموریت؛ ستارهٔ بهتر جایگزین ستارهٔ قبلی می‌شود */
    completeStation: function (id, stars) {
      var key = String(id);
      var prev = this.data.progress.stations[key];
      var wasDone = !!(prev && prev.done);
      var best = prev ? Math.max(prev.best || 0, stars) : stars;

      this.data.progress.stations[key] = {
        done: true,
        stars: stars,
        best: best,
        plays: (prev ? (prev.plays || 0) : 0) + 1
      };

      // ستاره فقط برای بهترشدن رکورد اضافه می‌شود، نه برای هر بار بازی
      var gained = wasDone ? Math.max(0, best - (prev.best || 0)) : stars;
      if (gained > 0) { this.addStars(gained); }

      this.data.progress.lastStation = id;
      this.save();
      this.emit("station", { id: id, stars: stars, isNew: !wasDone });
      this.emit("change");
      return { isNew: !wasDone, best: best, gained: gained };
    },

    /** چند چراغ از هفت چراغ درخت روشن شده است */
    lampsLit: function () {
      var n = 0;
      for (var k in this.data.progress.stations) {
        if (this.data.progress.stations.hasOwnProperty(k) &&
            this.data.progress.stations[k].done) { n++; }
      }
      return n;
    },

    totalStations: function () {
      return TOTAL_STATIONS;
    },

    allStationsDone: function () {
      return this.lampsLit() >= TOTAL_STATIONS;
    },

    /** شمارهٔ ایستگاه پیشنهادی بعدی */
    nextStation: function () {
      for (var i = 1; i <= TOTAL_STATIONS; i++) {
        if (!this.isStationDone(i)) { return i; }
      }
      return 0;
    },

    markFinished: function () {
      this.data.progress.finished = true;
      this.save();
      this.emit("finished");
      this.emit("change");
    },

    /* ---------- ثبت مهارت‌ها (ارزشیابی تکوینی) ---------- */

    /**
     * ثبت نتیجهٔ یک پاسخ.
     * @param {string} subject نام درس، مثل "ریاضی"
     * @param {string} skillId شناسهٔ مهارت، مثل "math.multiply"
     * @param {number} attempt چندمین تلاش بود (۱، ۲ یا ۳)
     * @param {boolean} solved آیا سرانجام خودش حل کرد
     */
    recordAnswer: function (subject, skillId, attempt, solved) {
      var s = this.data.skills[skillId];
      if (!s) {
        s = this.data.skills[skillId] = {
          subject: subject, asked: 0, first: 0, second: 0, third: 0, missed: 0
        };
      }
      s.asked++;
      if (!solved)          { s.missed++; }
      else if (attempt <= 1) { s.first++; }
      else if (attempt === 2) { s.second++; }
      else                   { s.third++; }

      this.data.stats.answers++;
      if (solved && attempt <= 1) { this.data.stats.firstTry++; }

      this.save();
      this.emit("skill", { skillId: skillId, attempt: attempt, solved: solved });
    },

    /**
     * درصد تسلط یک مهارت.
     * تلاش اول ارزش کامل، تلاش دوم نصف، تلاش سوم یک‌چهارم.
     */
    skillScore: function (skillId) {
      var s = this.data.skills[skillId];
      if (!s || !s.asked) { return 0; }
      var pts = s.first + (s.second * 0.5) + (s.third * 0.25);
      return Math.round((pts / s.asked) * 100);
    },

    /** میانگین تسلط یک درس */
    subjectScore: function (subject) {
      var sum = 0, n = 0;
      for (var id in this.data.skills) {
        if (!this.data.skills.hasOwnProperty(id)) { continue; }
        if (this.data.skills[id].subject !== subject) { continue; }
        sum += this.skillScore(id);
        n++;
      }
      return n ? Math.round(sum / n) : 0;
    },

    /* ---------- نشان‌ها ---------- */

    hasBadge: function (id) {
      return this.data.badges.indexOf(id) !== -1;
    },

    /** دادن نشان؛ اگر تازه باشد true برمی‌گرداند */
    awardBadge: function (id) {
      if (this.hasBadge(id)) { return false; }
      this.data.badges.push(id);
      this.save();
      this.emit("badge", id);
      this.emit("change");
      return true;
    },

    /* ---------- فروشگاه تزیین ---------- */

    isOwned: function (itemId) {
      return this.data.shop.owned.indexOf(itemId) !== -1;
    },

    buyItem: function (itemId, price) {
      if (this.isOwned(itemId)) { return true; }
      if (!this.spendCoins(price)) { return false; }
      this.data.shop.owned.push(itemId);
      this.save();
      this.emit("shop", itemId);
      this.emit("change");
      return true;
    },

    /** قراردادن یک تزیین در جای خودش در میدان */
    placeItem: function (slot, itemId) {
      this.data.shop.placed[slot] = itemId;
      this.save();
      this.emit("shop", itemId);
      this.emit("change");
    },

    /* ---------- ذخیره ---------- */

    /** ذخیرهٔ کمی با تأخیر، تا نوشتن پشت‌سرهم انجام نشود */
    save: function () {
      var self = this;
      if (this._saveTimer) { clearTimeout(this._saveTimer); }
      this._saveTimer = setTimeout(function () {
        self._saveTimer = null;
        if (APP.Storage) { APP.Storage.save(self.data); }
      }, 250);
    },

    /** ذخیرهٔ فوری (هنگام بستن صفحه) */
    saveNow: function () {
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
      if (APP.Storage) { APP.Storage.save(this.data); }
    },

    /* ---------- رویدادها ---------- */

    /** گوش‌دادن به رویداد. مثال: APP.State.on("coins", fn) */
    on: function (name, fn) {
      if (!this._listeners[name]) { this._listeners[name] = []; }
      this._listeners[name].push(fn);
      return fn;
    },

    off: function (name, fn) {
      var list = this._listeners[name];
      if (!list) { return; }
      var i = list.indexOf(fn);
      if (i !== -1) { list.splice(i, 1); }
    },

    emit: function (name, payload) {
      var list = this._listeners[name];
      if (!list) { return; }
      for (var i = 0; i < list.length; i++) {
        try {
          list[i](payload);
        } catch (err) {
          if (window.console) { console.warn("خطا در شنوندهٔ رویداد " + name, err); }
        }
      }
    }
  };

  APP.State = State;
})();
