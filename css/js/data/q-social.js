/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/q-social.js — الگوهای مطالعات اجتماعی و شهروندی (۱۶ الگو)

   این فایل بیشتر در ایستگاه ۵ (خیابان و مسیر) و ایستگاه ۶
   (مرکز خدمات محله) به کار می‌رود.

   ── نکتهٔ ایمنی ──
   در همهٔ سؤال‌های مربوط به خیابان، پاسخ درست همیشه رفتار ایمن
   است و هیچ گزینه‌ای رفتار خطرناک را «باحال» یا «زرنگی» نشان
   نمی‌دهد. گزینه‌های نادرست فقط اشتباه‌های رایج بچه‌ها هستند،
   نه کارهای تشویق‌کننده.

   ── نوع تعامل decision ──
   در سطح چالشی، بعضی سؤال‌ها چند راه درست دارند با نتیجه‌های
   متفاوت. در این سؤال‌ها، بهترین راه پاسخ درست است و برای هر
   گزینه توضیح پیامد آن نوشته شده است.

   وابستگی: APP.Bank، APP.Pools
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var P = APP.Pools;
  var B = APP.Bank;

  /* ============================================================
     دادهٔ ویژهٔ مطالعات اجتماعی
     ============================================================ */

  var D = {

    /** موقعیت‌های اضطراری و شمارهٔ درست */
    emergencies: [
      { case: "از پنجرهٔ خانهٔ همسایه دود بیرون می‌آید", service: "آتش‌نشانی" },
      { case: "پیرمردی در کوچه زمین خورده و نمی‌تواند بلند شود", service: "اورژانس" },
      { case: "در کوچه بوی گاز می‌آید", service: "امداد گاز" },
      { case: "سیم برق پاره شده و روی زمین افتاده", service: "امداد برق" },
      { case: "لولهٔ آب سر کوچه ترکیده و آب همه‌جا را گرفته", service: "امداد آب" },
      { case: "کسی می‌خواهد وارد خانه‌ای شود که صاحبش نیست", service: "پلیس" },
      { case: "آتش از سطل زبالهٔ پارک بلند شده", service: "آتش‌نشانی" },
      { case: "دوستت در حیاط مدرسه از حال رفته", service: "اورژانس" }
    ],

    /** نیاز مردم و مکان درست */
    needs: [
      { need: "می‌خواهم کتاب قرض بگیرم",              place: "کتابخانه" },
      { need: "پایم درد می‌کند و باید دکتر ببینم",     place: "درمانگاه" },
      { need: "می‌خواهم بسته‌ای برای مادربزرگم بفرستم", place: "ادارهٔ پست" },
      { need: "نان تمام شده است",                     place: "نانوایی" },
      { need: "می‌خواهم با بچه‌ها بازی کنم",           place: "پارک" },
      { need: "باید در کلاس درس حاضر شوم",            place: "مدرسه" },
      { need: "می‌خواهم خرید هفته را انجام دهم",       place: "بازارچه" }
    ],

    /** رفتار در برابر چراغ راهنما */
    lights: [
      { light: "چراغ قرمز عابر",  right: "می‌ایستم و صبر می‌کنم",
        wrong: ["سریع می‌دوم", "دست بلند می‌کنم و رد می‌شوم", "از بین ماشین‌ها رد می‌شوم"] },
      { light: "چراغ سبز عابر",   right: "اول چپ و راست را نگاه می‌کنم، بعد رد می‌شوم",
        wrong: ["بدون نگاه کردن می‌دوم", "همان‌جا می‌ایستم", "وسط خیابان بازی می‌کنم"] },
      { light: "چراغ چشمک‌زن",    right: "صبر می‌کنم تا چراغ کامل سبز شود",
        wrong: ["تندتر می‌دوم", "با دوچرخه رد می‌شوم", "چشم‌هایم را می‌بندم و رد می‌شوم"] }
    ],

    /** ترتیب کارهای عبور ایمن */
    crossSteps: [
      "به گذرگاه عابر پیاده می‌روم",
      "چراغ عابر را نگاه می‌کنم",
      "چپ و راست را نگاه می‌کنم",
      "وقتی ماشینی نیامد، آرام رد می‌شوم"
    ],

    /** نمادهای سادهٔ نقشه */
    mapSymbols: [
      { symbol: "🏥", meaning: "درمانگاه" },
      { symbol: "🏫", meaning: "مدرسه" },
      { symbol: "🌳", meaning: "پارک" },
      { symbol: "📮", meaning: "ادارهٔ پست" },
      { symbol: "🕌", meaning: "مسجد" },
      { symbol: "🚒", meaning: "آتش‌نشانی" }
    ],

    /** رفتار شهروندی */
    citizen: [
      { good: "زباله را در سطل می‌اندازم",              bad: "زباله را در کوچه می‌ریزم" },
      { good: "در صف نوبت را رعایت می‌کنم",             bad: "از وسط صف جلو می‌روم" },
      { good: "به دیوار مدرسه چیزی نمی‌نویسم",          bad: "روی دیوار نقاشی می‌کشم" },
      { good: "برای همسایهٔ سالخورده در را باز می‌کنم",  bad: "خودم را به ندیدن می‌زنم" },
      { good: "در اتوبوس جایم را به سالخورده می‌دهم",    bad: "روی صندلی می‌مانم و نگاه نمی‌کنم" },
      { good: "شیر آب پارک را بعد از استفاده می‌بندم",   bad: "شیر آب را باز می‌گذارم" },
      { good: "نیمکت پارک را سالم نگه می‌دارم",          bad: "روی نیمکت با چاقو خط می‌کشم" }
    ],

    /** مسئولیت‌پذیری در موقعیت واقعی */
    responsibility: [
      { case: "توپ بازی‌ات به شیشهٔ همسایه خورده و شکسته است.",
        right: "می‌روم و خودم به همسایه می‌گویم و عذرخواهی می‌کنم",
        wrong: ["فرار می‌کنم", "می‌گویم کار من نبوده", "منتظر می‌مانم کسی نفهمد"] },
      { case: "کتاب کتابخانه را که امانت گرفته بودی، پاره کرده‌ای.",
        right: "به کتابدار می‌گویم و برای درست کردنش کمک می‌کنم",
        wrong: ["کتاب را قایم می‌کنم", "کتاب را پس نمی‌دهم", "می‌گویم قبلاً پاره بوده"] },
      { case: "در راه مدرسه کیف پولی روی زمین پیدا کرده‌ای.",
        right: "آن را به بزرگ‌ترِ مطمئن یا دفتر مدرسه تحویل می‌دهم",
        wrong: ["برای خودم برمی‌دارم", "پولش را برمی‌دارم و کیف را می‌گذارم", "به کسی نمی‌گویم"] },
      { case: "قرار بود امروز نوبت تو باشد که به گل‌های کلاس آب بدهی، ولی یادت رفته.",
        right: "به محض یادآوری، خودم می‌روم و کار را انجام می‌دهم",
        wrong: ["می‌گویم نوبت من نبود", "کار را به دیگری می‌سپارم", "می‌گذارم برای هفتهٔ بعد"] }
    ],

    /** تصمیم‌های چندراهه برای سطح چالشی */
    decisions: [
      {
        case: "روز جشن، هم باید صندلی‌ها چیده شود و هم ریسه‌ها بسته شود، " +
              "ولی فقط تو و دو دوستت هستید.",
        best: "کارها را بین سه نفر تقسیم می‌کنیم",
        others: [
          { text: "همه با هم اول صندلی‌ها را می‌چینیم",
            note: "بد نیست، ولی وقت بیشتری می‌گیرد." },
          { text: "خودم هر دو کار را انجام می‌دهم",
            note: "خسته می‌شوی و کار به‌موقع تمام نمی‌شود." },
          { text: "صبر می‌کنیم بزرگ‌ترها بیایند",
            note: "کار می‌ماند و ممکن است جشن دیر شروع شود." }
        ],
        why: "چون تقسیم کار باعث می‌شود همه با هم و زودتر به نتیجه برسند."
      },
      {
        case: "برای جشن، پول کمی مانده است و هم بادکنک لازم داریم و هم شیرینی.",
        best: "با هم مشورت می‌کنیم و چیزی را می‌خریم که به همه می‌رسد",
        others: [
          { text: "همهٔ پول را بادکنک می‌خریم",
            note: "میدان قشنگ می‌شود ولی چیزی برای پذیرایی نمی‌ماند." },
          { text: "خودم تصمیم می‌گیرم و به کسی نمی‌گویم",
            note: "شاید تصمیمت درست باشد، ولی بقیه ناراحت می‌شوند." },
          { text: "هیچ‌کدام را نمی‌خریم",
            note: "پول می‌ماند ولی جشن سرد برگزار می‌شود." }
        ],
        why: "چون در کار گروهی، مشورت بهترین راه تصمیم‌گیری است."
      }
    ]
  };

  /** گزینه‌سازی بدون تکرار */
  function pickOpts(rnd, right, wrongs, n) {
    n = n || 3;
    var seen = {}, pool = [], i, mixed = rnd.shuffle(wrongs);
    seen[right] = true;
    for (i = 0; i < mixed.length && pool.length < n; i++) {
      if (mixed[i] && !seen[mixed[i]]) { seen[mixed[i]] = true; pool.push(mixed[i]); }
    }
    return rnd.shuffle(pool.concat([right]));
  }

  /** پیدا کردن یک خدمت شهری با نام */
  function serviceByName(name) {
    for (var i = 0; i < P.cityServices.length; i++) {
      if (P.cityServices[i].name === name) { return P.cityServices[i]; }
    }
    return null;
  }

  /* ============================================================
     ۱. خدمات شهری و شماره‌های اضطراری (ایستگاه ۶)
     ============================================================ */

  B.add({
    id: "SOC_EMERGENCY_SERVICE",
    subject: "مطالعات اجتماعی", skill: "soc.services", skillName: "خدمات اضطراری",
    topic: "خدمات شهری", station: 6, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var e = rnd.pick(D.emergencies);
      var svc = serviceByName(e.service);
      var wrongs = P.cityServices
        .filter(function (s) { return s.name !== e.service; })
        .map(function (s) { return s.icon + " " + s.name; });

      return {
        story: "یک نفر با نگرانی سراغت آمده.",
        stem: "« " + e.case + " » به کجا باید خبر بدهیم؟",
        answer: svc.icon + " " + svc.name,
        choices: pickOpts(rnd, svc.icon + " " + svc.name, wrongs),
        hint1: "فکر کن این مشکل دربارهٔ آتش است، سلامتی، آب، برق، گاز یا امنیت؟",
        hint2: "هر خدمت فقط کار خودش را انجام می‌دهد.",
        solution: "باید به " + svc.name + " با شمارهٔ " + svc.number + " خبر داد.",
        why: "چون خدمت درست را برای این موقعیت انتخاب کردی؛ در موقعیت واقعی، همین انتخاب وقت را نجات می‌دهد."
      };
    }
  });

  B.add({
    id: "SOC_EMERGENCY_NUMBER",
    subject: "مطالعات اجتماعی", skill: "soc.services", skillName: "شماره‌های اضطراری",
    topic: "خدمات شهری", station: 6, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var svc = rnd.pick(P.cityServices);
      var wrongs = P.cityServices
        .filter(function (s) { return s.name !== svc.name; })
        .map(function (s) { return s.number; });

      return {
        story: "شماره‌های مهم را باید حفظ باشیم.",
        stem: "شمارهٔ " + svc.name + " چند است؟",
        answer: svc.number,
        choices: pickOpts(rnd, svc.number, wrongs),
        hint1: "این شماره‌ها سه‌رقمی هستند و هرکدام برای یک خدمت است.",
        hint2: svc.name + " را وقتی خبر می‌کنیم که " + svc.when + " پیش بیاید.",
        solution: "شمارهٔ " + svc.name + " برابر " + svc.number + " است.",
        why: "چون شمارهٔ درست را به یاد آوردی؛ دانستن این شماره‌ها یک مهارت واقعی زندگی است."
      };
    }
  });

  B.add({
    id: "SOC_SERVICE_WHEN",
    subject: "مطالعات اجتماعی", skill: "soc.services", skillName: "کاربرد خدمات",
    topic: "خدمات شهری", station: 6, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var svc = rnd.pick(P.cityServices);
      var wrongs = P.cityServices
        .filter(function (s) { return s.name !== svc.name; })
        .map(function (s) { return s.when; });

      return {
        story: "روی تابلوی مرکز خدمات، کارها نوشته شده.",
        stem: "در چه موقعی به " + svc.name + " خبر می‌دهیم؟",
        answer: svc.when,
        choices: pickOpts(rnd, svc.when, wrongs),
        hint1: "به اسم خود خدمت دقت کن؛ اسمش کارش را می‌گوید.",
        hint2: "هر خدمت فقط برای یک نوع مشکل است.",
        solution: "به " + svc.name + " وقتی خبر می‌دهیم که " + svc.when + " پیش بیاید.",
        why: "چون کار هر خدمت شهری را درست شناختی."
      };
    }
  });

  B.add({
    id: "SOC_PLACE_FOR_NEED",
    subject: "مطالعات اجتماعی", skill: "soc.city", skillName: "شناخت مکان‌های شهر",
    topic: "مکان‌های محله", station: 6, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var n = rnd.pick(D.needs);
      var wrongs = D.needs
        .filter(function (x) { return x.place !== n.place; })
        .map(function (x) { return x.place; });

      return {
        story: "یکی از همسایه‌ها راه را بلد نیست.",
        stem: "« " + n.need + " » این نفر باید کجا برود؟",
        answer: n.place,
        choices: pickOpts(rnd, n.place, wrongs),
        hint1: "فکر کن هر مکان در محله چه کاری انجام می‌دهد.",
        hint2: "کتاب در کتابخانه است، دارو و دکتر در درمانگاه، بسته در ادارهٔ پست.",
        solution: "این نفر باید به " + n.place + " برود.",
        why: "چون کار هر مکان محله را درست می‌دانی."
      };
    }
  });

  B.add({
    id: "SOC_DRAG_SERVICES",
    subject: "مطالعات اجتماعی", skill: "soc.services", skillName: "خدمات اضطراری",
    topic: "خدمات شهری", station: 6, levels: [2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var picked = rnd.pickMany(D.emergencies, level === 2 ? 3 : 4);
      var zoneNames = {}, zones = [], items = [], i;

      for (i = 0; i < picked.length; i++) {
        zoneNames[picked[i].service] = true;
      }
      for (var name in zoneNames) {
        if (!zoneNames.hasOwnProperty(name)) { continue; }
        var svc = serviceByName(name);
        zones.push({ id: name, label: svc.icon + " " + name + " " + svc.number });
      }
      for (i = 0; i < picked.length; i++) {
        items.push({ id: "e" + i, label: picked[i].case, zone: picked[i].service });
      }

      return {
        story: "چند نفر با هم به مرکز خدمات آمده‌اند.",
        stem: "هر موقعیت را به خدمت درستش بکش.",
        items: rnd.shuffle(items),
        zones: zones,
        hint1: "برای هر موقعیت بپرس: مشکل اصلی چیست؟",
        hint2: "آتش یعنی آتش‌نشانی، حال بد یعنی اورژانس، بوی گاز یعنی امداد گاز.",
        solution: "هر موقعیت باید به خدمت مربوط به خودش برود.",
        why: "چون هر مشکل را به خدمت درستش وصل کردی."
      };
    }
  });

  /* ============================================================
     ۲. خیابان، تابلو و عبور ایمن (ایستگاه ۵)
     ============================================================ */

  B.add({
    id: "SOC_TRAFFIC_LIGHT",
    subject: "مطالعات اجتماعی", skill: "soc.safety", skillName: "عبور ایمن",
    topic: "راهنمایی و رانندگی", station: 5, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var l = rnd.pick(D.lights);

      return {
        story: "سر چهارراه رسیدی.",
        stem: "«" + l.light + "» روشن است. چه کار می‌کنی؟",
        answer: l.right,
        choices: pickOpts(rnd, l.right, l.wrong),
        hint1: "همیشه اول ایمنی، بعد عجله.",
        hint2: "حتی وقتی چراغ سبز است، باز هم باید نگاه کنی.",
        solution: "کار درست: " + l.right,
        why: "چون رفتار ایمن را انتخاب کردی؛ در خیابان همین انتخاب مهم‌ترین است."
      };
    }
  });

  B.add({
    id: "SOC_SIGN_FOR_PLACE",
    subject: "مطالعات اجتماعی", skill: "soc.signs", skillName: "شناخت تابلوها",
    topic: "تابلوهای راهنما", station: 5, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var sign = rnd.pick(P.trafficSigns);
      var wrongs = P.trafficSigns
        .filter(function (s) { return s.name !== sign.name; })
        .map(function (s) { return s.icon + " " + s.name; });

      return {
        story: "می‌خواهیم برای کوچه تابلوی درست بگذاریم.",
        stem: "برای این موقعیت کدام تابلو درست است؟ « " + sign.meaning + " »",
        answer: sign.icon + " " + sign.name,
        choices: pickOpts(rnd, sign.icon + " " + sign.name, wrongs),
        hint1: "هر تابلو یک پیام مشخص دارد.",
        hint2: "به شکل تابلو نگاه کن؛ شکل، پیام را نشان می‌دهد.",
        solution: "تابلوی درست: " + sign.name + " — " + sign.meaning,
        why: "چون پیام تابلو را با موقعیت درست جور کردی."
      };
    }
  });

  B.add({
    id: "SOC_CROSS_ORDER",
    subject: "مطالعات اجتماعی", skill: "soc.safety", skillName: "ترتیب عبور ایمن",
    topic: "ایمنی در خیابان", station: 5, levels: [1, 2, 3],
    interaction: "order",
    generate: function (level, rnd, ctx) {
      return {
        story: "می‌خواهی از خیابان رد شوی و دعوت‌نامه‌ها را برسانی.",
        stem: "کارهای عبور ایمن از خیابان را به ترتیب درست بچین.",
        items: D.crossSteps.map(function (s, i) { return { id: "cs" + i, label: s }; }),
        hint1: "اول باید به جای درست عبور بروی، نه هر جای خیابان.",
        hint2: "نگاه کردن همیشه پیش از رد شدن است.",
        solution: "ترتیب درست: " + D.crossSteps.join(" ← "),
        why: "چون ترتیب کارهای ایمنی را درست فهمیدی؛ جابه‌جا شدن این ترتیب خطرناک است."
      };
    }
  });

  B.add({
    id: "SOC_MAP_DIRECTION",
    subject: "مطالعات اجتماعی", skill: "soc.map", skillName: "نقشه‌خوانی",
    topic: "جهت‌ها و مسیر", station: 5, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var from = rnd.pick(P.places);
      var to = rnd.pick(P.places.filter(function (p) { return p.name !== from.name; }));
      var turns = level === 1 ? 1 : (level === 2 ? 2 : 3);
      var path = [], i;
      for (i = 0; i < turns; i++) {
        path.push(rnd.pick(["راست", "چپ", "مستقیم"]));
      }
      var last = path[path.length - 1];
      var wrongs = ["راست", "چپ", "مستقیم"].filter(function (d) { return d !== last; });

      return {
        story: "روی نقشهٔ محله، مسیر را دنبال کن.",
        stem: "از " + from.icon + " " + from.name + " تا " + to.icon + " " + to.name +
              " مسیر این‌طور است: " + path.join(" ← ") +
              ". آخرین حرکت به کدام سمت است؟",
        answer: last,
        choices: rnd.shuffle(wrongs.concat([last])),
        visual: { kind: "path", from: from, to: to, steps: path },
        hint1: "مسیر را از اول با انگشتت دنبال کن.",
        hint2: "آخرین قدم مسیر را نگاه کن.",
        solution: "آخرین حرکت به سمت «" + last + "» است.",
        why: "چون مسیر را از ابتدا تا انتها درست دنبال کردی."
      };
    }
  });

  B.add({
    id: "SOC_MAP_SYMBOL",
    subject: "مطالعات اجتماعی", skill: "soc.map", skillName: "نمادهای نقشه",
    topic: "نقشه‌خوانی", station: 5, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var s = rnd.pick(D.mapSymbols);
      var wrongs = D.mapSymbols
        .filter(function (x) { return x.meaning !== s.meaning; })
        .map(function (x) { return x.meaning; });

      return {
        story: "روی نقشهٔ محله نشانه‌هایی کشیده شده.",
        stem: "این نشانه روی نقشه یعنی چه؟  " + s.symbol,
        answer: s.meaning,
        choices: pickOpts(rnd, s.meaning, wrongs),
        hint1: "شکل نشانه معمولاً به خود آن مکان شبیه است.",
        hint2: "به کاری که در آن مکان انجام می‌شود فکر کن.",
        solution: "این نشانه یعنی «" + s.meaning + "».",
        why: "چون زبان نشانه‌های نقشه را می‌فهمی."
      };
    }
  });

  B.add({
    id: "SOC_MAP_DRAG",
    subject: "مطالعات اجتماعی", skill: "soc.map", skillName: "نمادهای نقشه",
    topic: "نقشه‌خوانی", station: 5, levels: [2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var picked = rnd.pickMany(D.mapSymbols, level === 2 ? 3 : 4);

      return {
        story: "نقشهٔ محله را باید کامل کنیم.",
        stem: "هر نشانه را کنار نام درستش بگذار.",
        items: rnd.shuffle(picked.map(function (s, i) {
          return { id: "ms" + i, label: s.symbol, zone: s.meaning };
        })),
        zones: rnd.shuffle(picked.map(function (s) {
          return { id: s.meaning, label: s.meaning };
        })),
        hint1: "شکل هر نشانه به کار آن مکان اشاره دارد.",
        hint2: "مثلاً نشانهٔ درخت برای پارک است.",
        solution: "هر نشانه باید کنار نام مکان خودش قرار بگیرد.",
        why: "چون نشانه‌های نقشه را درست خواندی."
      };
    }
  });

  /* ============================================================
     ۳. شهروندی و مسئولیت‌پذیری
     ============================================================ */

  B.add({
    id: "SOC_CITIZEN_GOOD",
    subject: "مطالعات اجتماعی", skill: "soc.citizen", skillName: "رفتار شهروندی",
    topic: "شهروندی", station: 6, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var pair = rnd.pick(D.citizen);
      var others = rnd.pickMany(
        D.citizen.filter(function (c) { return c.good !== pair.good; }), 3
      );

      return {
        story: "شهروند خوب بودن، از کارهای کوچک شروع می‌شود.",
        stem: "کدام‌یک رفتار یک شهروند خوب است؟",
        answer: pair.good,
        choices: pickOpts(rnd, pair.good, others.map(function (c) { return c.bad; })),
        hint1: "فکر کن کدام کار به بقیهٔ مردم محله کمک می‌کند.",
        hint2: "کاری که به دیگران یا به وسایل عمومی آسیب بزند، درست نیست.",
        solution: "رفتار درست: " + pair.good,
        why: "چون رفتاری را انتخاب کردی که به محله و مردمش کمک می‌کند."
      };
    }
  });

  B.add({
    id: "SOC_CITIZEN_BAD",
    subject: "مطالعات اجتماعی", skill: "soc.citizen", skillName: "رفتار شهروندی",
    topic: "شهروندی", station: 6, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var pair = rnd.pick(D.citizen);
      var others = rnd.pickMany(
        D.citizen.filter(function (c) { return c.bad !== pair.bad; }), 3
      );

      return {
        story: "بعضی کارها به محله آسیب می‌زنند.",
        stem: "کدام‌یک رفتار نادرستی است؟",
        answer: pair.bad,
        choices: pickOpts(rnd, pair.bad, others.map(function (c) { return c.good; })),
        hint1: "سه گزینه کار درست هستند و فقط یکی نادرست است.",
        hint2: "کاری که به وسایل عمومی یا حق دیگران آسیب بزند، نادرست است.",
        solution: "رفتار نادرست: " + pair.bad,
        why: "چون رفتار آسیب‌زننده را تشخیص دادی."
      };
    }
  });

  B.add({
    id: "SOC_RESPONSIBILITY",
    subject: "مطالعات اجتماعی", skill: "soc.responsibility", skillName: "مسئولیت‌پذیری",
    topic: "مسئولیت‌پذیری", station: 6, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var r = rnd.pick(D.responsibility);

      return {
        story: "گاهی کار سختی پیش می‌آید که باید خودت تصمیم بگیری.",
        stem: "« " + r.case + " » بهترین کار کدام است؟",
        answer: r.right,
        choices: pickOpts(rnd, r.right, r.wrong),
        hint1: "فکر کن کدام کار مشکل را واقعاً حل می‌کند، نه فقط پنهانش می‌کند.",
        hint2: "پذیرفتن اشتباه سخت است، ولی درست‌ترین راه است.",
        solution: "بهترین کار: " + r.right,
        why: "چون مسئولیت کارت را پذیرفتی؛ این نشانهٔ بزرگ شدن است."
      };
    }
  });

  B.add({
    id: "SOC_PUBLIC_PROPERTY",
    subject: "مطالعات اجتماعی", skill: "soc.citizen", skillName: "اموال عمومی",
    topic: "شهروندی", station: 6, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var things = [
        { thing: "نیمکت پارک", right: "مال همهٔ مردم است و باید سالم بماند" },
        { thing: "تابلوی خیابان", right: "مال همهٔ مردم است و باید سالم بماند" },
        { thing: "کتاب کتابخانه", right: "امانت است و باید سالم برگردد" },
        { thing: "شیر آب پارک", right: "مال همهٔ مردم است و باید سالم بماند" }
      ];
      var t = rnd.pick(things);

      return {
        story: "بعضی چیزهای محله مال یک نفر نیست.",
        stem: "«" + t.thing + "» مال کیست و چه‌طور باید با آن رفتار کرد؟",
        answer: t.right,
        choices: rnd.shuffle([
          t.right,
          "مال شهرداری است و به ما ربطی ندارد",
          "هرکس زودتر برسد مال اوست",
          "چون رایگان است، خراب شدنش مهم نیست"
        ]),
        hint1: "چیزی که همه از آن استفاده می‌کنند، مال همه است.",
        hint2: "اگر خراب شود، همهٔ مردم محله ضرر می‌کنند.",
        solution: t.thing + " " + t.right + ".",
        why: "چون فهمیدی نگهداری از اموال عمومی، وظیفهٔ همهٔ ماست."
      };
    }
  });

  B.add({
    id: "SOC_GROUP_DECISION",
    subject: "مطالعات اجتماعی", skill: "soc.decision", skillName: "تصمیم‌گیری گروهی",
    topic: "تصمیم‌گیری", station: 7, levels: [3],
    interaction: "decision",
    generate: function (level, rnd, ctx) {
      var d = rnd.pick(D.decisions);
      var choices = [d.best].concat(d.others.map(function (o) { return o.text; }));
      var outcomes = {};
      for (var i = 0; i < d.others.length; i++) {
        outcomes[d.others[i].text] = d.others[i].note;
      }
      outcomes[d.best] = "بهترین راه؛ همه راضی‌اند و کار هم به‌موقع تمام می‌شود.";

      return {
        story: "تصمیم امروز را باید با هم بگیرید.",
        stem: "« " + d.case + " » به نظرت بهترین راه کدام است؟",
        answer: d.best,
        choices: rnd.shuffle(choices),
        outcomes: outcomes,
        hint1: "همهٔ راه‌ها بد نیستند، ولی یکی از همه بهتر است.",
        hint2: "فکر کن کدام راه هم کار را جلو می‌برد و هم همه را راضی نگه می‌دارد.",
        solution: "بهترین راه: " + d.best,
        why: d.why
      };
    }
  });

  B.add({
    id: "SOC_NEIGHBOR_HELP",
    subject: "مطالعات اجتماعی", skill: "soc.citizen", skillName: "کمک به همسایه",
    topic: "زندگی در محله", station: 6, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var who = rnd.pick(P.neighbors);
      var cases = [
        { case: who.name + " خریدهای سنگین دارد و پله‌ها زیاد است.",
          right: "کمک می‌کنم خریدها را بالا ببرد" },
        { case: who.name + " نمی‌تواند نوشتهٔ روی نامه را بخواند.",
          right: "با اجازه‌اش نامه را برایش می‌خوانم" },
        { case: who.name + " دنبال کوچه‌ای می‌گردد و راه را بلد نیست.",
          right: "مسیر را با احترام برایش توضیح می‌دهم" }
      ];
      var c = rnd.pick(cases);

      return {
        story: "در کوچه با یکی از همسایه‌ها روبه‌رو شدی.",
        stem: "« " + c.case + " » چه کار می‌کنی؟",
        answer: c.right,
        choices: rnd.shuffle([
          c.right,
          "خودم را به ندیدن می‌زنم",
          "می‌گویم وقت ندارم",
          "می‌خندم و رد می‌شوم"
        ]),
        hint1: "فکر کن اگر خودت جای او بودی، دوست داشتی کسی چه کار کند.",
        hint2: "کمک کردن به همسایه از کارهای کوچک شروع می‌شود.",
        solution: "کار درست: " + c.right,
        why: "چون به همسایه‌ات کمک کردی؛ محلهٔ خوب از همین کارها ساخته می‌شود."
      };
    }
  });

})();
