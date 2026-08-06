/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/q-farsi.js — الگوهای سؤال فارسی (۱۸ الگو)

   بیشتر این الگوها در ایستگاه ۳ (مدرسه و کتابخانه) به کار
   می‌روند، ولی چند تا هم در ایستگاه‌های دیگر جا خوش کرده‌اند؛
   چون خواندن تابلوی خیابان و برچسب مغازه هم فارسی است.

   ── تفاوت این فایل با ریاضی ──
   در ریاضی عددها عوض می‌شوند، در فارسی واژه‌ها. هر الگو از
   بانک واژهٔ همین فایل هر بار واژهٔ تازه‌ای برمی‌دارد، پس
   دانش‌آموز هیچ‌وقت دو بار پشت‌سرهم یک سؤال نمی‌بیند.

   واژه‌ها همه در حد دایرهٔ واژگان پایهٔ سوم ابتدایی هستند.

   وابستگی: APP.Bank، APP.Pools
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var P = APP.Pools;
  var B = APP.Bank;

  /* ============================================================
     بانک واژه‌ها — معلم می‌تواند به همین فهرست‌ها اضافه کند
     ============================================================ */

  var D = {

    /** خانواده‌های واژه؛ عضو اول ریشه است */
    families: [
      { root: "علم",  members: ["عالم", "معلم", "تعلیم", "معلوم"] },
      { root: "کتاب", members: ["کاتب", "مکتوب", "کتابخانه", "کتابدار"] },
      { root: "نظم",  members: ["منظم", "ناظم", "تنظیم", "نظام"] },
      { root: "حفظ",  members: ["حافظ", "محافظ", "حفاظت", "محفوظ"] },
      { root: "درس",  members: ["مدرسه", "مدرّس", "تدریس", "درسی"] },
      { root: "خبر",  members: ["مخبر", "اخبار", "باخبر", "خبرنگار"] },
      { root: "صبر",  members: ["صابر", "صبور", "پرصبر"] },
      { root: "کار",  members: ["کارگر", "کارخانه", "همکار", "پرکار"] },
      { root: "دانش", members: ["دانا", "دانشمند", "دانش‌آموز", "دانستن"] },
      { root: "شهر",  members: ["شهری", "شهردار", "شهروند", "شهرداری"] }
    ],

    /** مترادف‌ها */
    synonyms: [
      ["شاد", "خوشحال"], ["غمگین", "ناراحت"], ["سریع", "تند"],
      ["زیبا", "قشنگ"], ["دانا", "آگاه"], ["شجاع", "دلیر"],
      ["مهربان", "دلسوز"], ["سخت", "دشوار"], ["آسان", "راحت"],
      ["صدا", "آوا"], ["پاک", "تمیز"], ["کوشا", "سخت‌کوش"],
      ["بزرگ", "درشت"], ["ترسیدن", "هراسیدن"]
    ],

    /** متضادها */
    antonyms: [
      ["روز", "شب"], ["گرم", "سرد"], ["بلند", "کوتاه"],
      ["پیر", "جوان"], ["سنگین", "سبک"], ["تاریک", "روشن"],
      ["دور", "نزدیک"], ["باز", "بسته"], ["شاد", "غمگین"],
      ["سخت", "آسان"], ["تمیز", "کثیف"], ["زود", "دیر"],
      ["پر", "خالی"], ["نو", "کهنه"]
    ],

    /** معنی واژه‌های کتاب پایهٔ سوم */
    meanings: [
      { word: "نهال",     mean: "درخت کوچک و تازه‌کاشته" },
      { word: "چشمه",     mean: "جایی که آب از زمین بیرون می‌آید" },
      { word: "همسایه",   mean: "کسی که کنار خانهٔ ما زندگی می‌کند" },
      { word: "کوشش",     mean: "تلاش کردن برای انجام کار" },
      { word: "امانت",    mean: "چیزی که کسی به ما می‌سپارد تا نگه داریم" },
      { word: "میهن",     mean: "کشوری که در آن زندگی می‌کنیم" },
      { word: "بردبار",   mean: "کسی که زود عصبانی نمی‌شود" },
      { word: "سپاسگزار", mean: "کسی که قدر خوبی دیگران را می‌داند" },
      { word: "پرتلاش",   mean: "کسی که زیاد کار و کوشش می‌کند" },
      { word: "خوش‌قول",  mean: "کسی که به قولش عمل می‌کند" }
    ],

    /** جمله‌هایی برای مرتب‌کردن؛ به ترتیب درست نوشته شده‌اند */
    sentences: [
      ["بچه‌ها", "در", "پارک", "بازی", "می‌کنند"],
      ["مادر", "برای", "جشن", "شیرینی", "پخت"],
      ["ما", "همیشه", "به", "همسایه‌ها", "سلام", "می‌کنیم"],
      ["باغبان", "گل‌های", "باغچه", "را", "آب", "داد"],
      ["دانش‌آموزان", "کتاب‌ها", "را", "مرتب", "چیدند"],
      ["پدر", "شیر", "آب", "را", "بست"],
      ["ما", "زباله‌ها", "را", "جدا", "می‌کنیم"],
      ["گنجشک", "روی", "شاخهٔ", "درخت", "نشست"],
      ["معلم", "داستان", "قشنگی", "برایمان", "خواند"],
      ["من", "هر", "روز", "به", "مدرسه", "می‌روم"]
    ],

    /** جمله‌ها برای نشانه‌گذاری پایان */
    endMarks: [
      { text: "تو کتاب مرا دیدی",            mark: "؟", why: "این جمله سؤال می‌پرسد" },
      { text: "چه باغچهٔ قشنگی",             mark: "!", why: "این جمله تعجب و شگفتی دارد" },
      { text: "ما هر روز به مدرسه می‌رویم",   mark: ".", why: "این جمله خبر می‌دهد" },
      { text: "آتش‌نشان‌ها چقدر شجاع‌اند",    mark: "!", why: "این جمله تعجب دارد" },
      { text: "کتابخانه کجاست",              mark: "؟", why: "این جمله سؤال می‌پرسد" },
      { text: "گل‌ها را آب دادم",             mark: ".", why: "این جمله خبر می‌دهد" },
      { text: "چرا شیر آب باز مانده",        mark: "؟", why: "این جمله سؤال می‌پرسد" },
      { text: "وای چه جشن بزرگی",            mark: "!", why: "این جمله تعجب دارد" }
    ],

    /** نوع جمله */
    sentenceKinds: [
      { text: "در را ببند.",                    kind: "امری" },
      { text: "هوا امروز آفتابی است.",           kind: "خبری" },
      { text: "کتابت را کجا گذاشتی؟",            kind: "پرسشی" },
      { text: "لطفاً شیر آب را ببند.",           kind: "امری" },
      { text: "بچه‌ها در حیاط بازی می‌کنند.",     kind: "خبری" },
      { text: "جشن ساعت چند شروع می‌شود؟",       kind: "پرسشی" },
      { text: "زباله را در سطل بینداز.",         kind: "امری" },
      { text: "پارک محلهٔ ما بزرگ است.",         kind: "خبری" }
    ],

    /** تکمیل جمله */
    cloze: [
      { text: "برای اینکه آب هدر نرود، باید شیر آب را ___.",
        right: "ببندیم", wrong: ["باز بگذاریم", "بشکنیم", "فراموش کنیم"] },
      { text: "کتاب‌ها را بعد از خواندن، در ___ می‌گذاریم.",
        right: "قفسه", wrong: ["سطل زباله", "حیاط", "یخچال"] },
      { text: "وقتی از خیابان رد می‌شویم، اول به ___ نگاه می‌کنیم.",
        right: "چراغ راهنما", wrong: ["آسمان", "کفشمان", "مغازه"] },
      { text: "زبالهٔ کاغذی را در سطل ___ می‌اندازیم.",
        right: "کاغذ", wrong: ["شیشه", "فلز", "پلاستیک"] },
      { text: "به همسایهٔ سالخورده در حمل خرید ___ می‌کنیم.",
        right: "کمک", wrong: ["نگاه", "خنده", "شکایت"] },
      { text: "برای اینکه گل‌ها خشک نشوند، به آن‌ها ___ می‌دهیم.",
        right: "آب", wrong: ["کاغذ", "سنگ", "نور چراغ"] }
    ],

    /** واژه‌های هم‌گروه، برای دسته‌بندی */
    groups: [
      { name: "میوه",    words: ["سیب", "انار", "هلو", "خرمالو"] },
      { name: "پرنده",   words: ["گنجشک", "کبوتر", "قناری", "لک‌لک"] },
      { name: "وسیلهٔ مدرسه", words: ["مداد", "دفتر", "پاک‌کن", "خط‌کش"] },
      { name: "رنگ",     words: ["آبی", "سبز", "زرد", "بنفش"] }
    ],

    /** مفرد و جمع */
    plurals: [
      ["کتاب", "کتاب‌ها"], ["گل", "گل‌ها"], ["دانش‌آموز", "دانش‌آموزان"],
      ["درخت", "درختان"], ["معلم", "معلمان"], ["پرنده", "پرندگان"],
      ["خانه", "خانه‌ها"], ["همسایه", "همسایگان"]
    ],

    /** املای درست و نادرست */
    spelling: [
      { right: "خواهر",   wrong: ["خاهر", "خواحر"] },
      { right: "مسئول",   wrong: ["مسعول", "مسئل"] },
      { right: "زباله",   wrong: ["ذباله", "زبالح"] },
      { right: "صبح",     wrong: ["سبح", "صبهـ"] },
      { right: "کتابخانه", wrong: ["کتابخونه", "کتاب خانه"] },
      { right: "بهداشت",  wrong: ["بحداشت", "بهداشط"] },
      { right: "تشکر",    wrong: ["تشگر", "طشکر"] },
      { right: "همسایه",  wrong: ["همصایه", "هم سایه"] }
    ],

    /** متن‌های کوتاه درک مطلب */
    passages: [
      {
        text: "عمو حسن هر صبح زودتر از همه به پارک می‌آید. او اول به گل‌ها آب می‌دهد، " +
              "بعد برگ‌های خشک را جمع می‌کند. بچه‌های محله وقتی به پارک می‌رسند، " +
              "همه‌جا تمیز است. عمو حسن می‌گوید: «پارک خانهٔ دوم ماست.»",
        questions: [
          { q: "عمو حسن اول چه کاری می‌کند؟",
            a: "به گل‌ها آب می‌دهد",
            w: ["برگ‌ها را جمع می‌کند", "با بچه‌ها بازی می‌کند", "پارک را جارو می‌کند"] },
          { q: "عمو حسن پارک را چه می‌داند؟",
            a: "خانهٔ دوم",
            w: ["محل کار", "زمین بازی", "باغ میوه"] }
        ]
      },
      {
        text: "زهرا دفترش را در کتابخانه جا گذاشته بود. آقای کریمی دفتر را پیدا کرد و " +
              "روی میز خودش گذاشت تا صاحبش بیاید. فردا زهرا برگشت و دفترش را سالم تحویل گرفت. " +
              "او از آقای کریمی تشکر کرد.",
        questions: [
          { q: "آقای کریمی با دفتر چه کرد؟",
            a: "آن را نگه داشت تا صاحبش بیاید",
            w: ["آن را به خانه برد", "آن را دور انداخت", "آن را به بچهٔ دیگری داد"] },
          { q: "این متن دربارهٔ کدام رفتار خوب است؟",
            a: "امانت‌داری",
            w: ["شجاعت", "ورزش کردن", "زود بیدار شدن"] }
        ]
      },
      {
        text: "قبض آب خانهٔ ما این ماه زیاد شده بود. مادر گفت شاید شیر حمام چکه می‌کند. " +
              "پدر شیر را درست کرد. ماه بعد قبض کمتر شد. حالا همهٔ ما حواسمان به چکهٔ شیرها هست.",
        questions: [
          { q: "چرا قبض آب زیاد شده بود؟",
            a: "شیر حمام چکه می‌کرد",
            w: ["مهمان زیاد آمده بود", "باغچه بزرگ بود", "لباس زیاد شسته بودند"] },
          { q: "بعد از درست شدن شیر چه شد؟",
            a: "قبض ماه بعد کمتر شد",
            w: ["قبض بیشتر شد", "آب قطع شد", "هیچ فرقی نکرد"] }
        ]
      },
      {
        text: "روز جشن محله، بچه‌ها زودتر آمدند. بعضی صندلی‌ها را چیدند و بعضی ریسه‌ها را " +
              "به درخت بستند. کار که تقسیم شد، خیلی زود تمام شد. مادربزرگ گفت: " +
              "«کار گروهی یعنی همین.»",
        questions: [
          { q: "چرا کار زود تمام شد؟",
            a: "چون کارها بین بچه‌ها تقسیم شد",
            w: ["چون بچه‌ها کم بودند", "چون کار آسان بود", "چون بزرگ‌ترها کمک کردند"] },
          { q: "مادربزرگ دربارهٔ چه چیزی حرف زد؟",
            a: "کار گروهی",
            w: ["نظم کلاس", "تمیزی پارک", "درس خواندن"] }
        ]
      }
    ],

    /** ترتیب الفبای فارسی برای مرتب‌کردن کتاب‌ها */
    alphabet: "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی",

    /** نام کتاب‌های کتابخانه با حرف اول متفاوت */
    bookWords: ["آسمان", "بهار", "پروانه", "توت", "جنگل", "چشمه", "خورشید",
                "دریا", "رنگین‌کمان", "زمین", "ستاره", "شهر", "گنجشک", "مهتاب", "نسیم"]
  };

  /* ============================================================
     ابزارهای کمکی
     ============================================================ */

  /** ساخت گزینه‌ها از یک پاسخ درست و چند پاسخ نادرست، بدون تکرار */
  function pickOpts(rnd, right, wrongs, n) {
    n = n || 3;
    var seen = {}, pool = [], i;
    seen[right] = true;
    var mixed = rnd.shuffle(wrongs);
    for (i = 0; i < mixed.length && pool.length < n; i++) {
      if (mixed[i] && !seen[mixed[i]]) {
        seen[mixed[i]] = true;
        pool.push(mixed[i]);
      }
    }
    return rnd.shuffle(pool.concat([right]));
  }

  /** جایگاه یک حرف در الفبای فارسی */
  function alphaIndex(word) {
    var ch = word.charAt(0);
    if (ch === "آ" || ch === "أ" || ch === "إ") { ch = "ا"; }
    var i = D.alphabet.indexOf(ch);
    return i === -1 ? 99 : i;
  }

  /** واژه‌های همهٔ خانواده‌ها به‌جز یک خانواده — برای گزینهٔ نادرست */
  function otherFamilyWords(rnd, exceptRoot, count) {
    var pool = [];
    for (var i = 0; i < D.families.length; i++) {
      if (D.families[i].root === exceptRoot) { continue; }
      pool = pool.concat(D.families[i].members);
    }
    return rnd.pickMany(pool, count);
  }

  /* ============================================================
     ۱. واژه‌شناسی: هم‌خانواده، مترادف، متضاد، معنی
     ============================================================ */

  B.add({
    id: "FA_FAMILY_PICK",
    subject: "فارسی", skill: "fa.family", skillName: "هم‌خانواده",
    topic: "واژه‌شناسی", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var fam = rnd.pick(D.families);
      var right = rnd.pick(fam.members);

      return {
        story: "آقای کریمی واژه‌های تابلوی جشن را دسته‌بندی می‌کند.",
        stem: "کدام واژه با واژهٔ «" + fam.root + "» هم‌خانواده است؟",
        answer: right,
        choices: pickOpts(rnd, right, otherFamilyWords(rnd, fam.root, 5)),
        hint1: "واژه‌های هم‌خانواده حرف‌های مشترک دارند و معنی‌شان به هم نزدیک است.",
        hint2: "دنبال واژه‌ای بگرد که حرف‌های «" + fam.root + "» در آن دیده می‌شود.",
        solution: "«" + right + "» با «" + fam.root + "» هم‌خانواده است. " +
                  "بقیهٔ اعضای این خانواده: " + fam.members.join("، ") + ".",
        why: "چون حرف‌های اصلی مشترک را درست پیدا کردی."
      };
    }
  });

  B.add({
    id: "FA_FAMILY_ODD",
    subject: "فارسی", skill: "fa.family", skillName: "هم‌خانواده",
    topic: "واژه‌شناسی", station: 3, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var fam = rnd.pick(D.families);
      var three = rnd.pickMany(fam.members, 3);
      var odd = otherFamilyWords(rnd, fam.root, 1)[0];

      return {
        story: "یک واژه اشتباهی وارد این دسته شده.",
        stem: "کدام واژه با بقیه هم‌خانواده نیست؟",
        answer: odd,
        choices: rnd.shuffle(three.concat([odd])),
        hint1: "سه واژه حرف‌های مشترک دارند و یکی ندارد.",
        hint2: "سه واژه از خانوادهٔ «" + fam.root + "» هستند.",
        solution: "«" + odd + "» از خانوادهٔ «" + fam.root + "» نیست؛ بقیه هستند.",
        why: "چون واژهٔ ناهماهنگ را با دقت به حرف‌های مشترک پیدا کردی."
      };
    }
  });

  B.add({
    id: "FA_SYNONYM",
    subject: "فارسی", skill: "fa.vocab", skillName: "مترادف",
    topic: "واژگان", station: 3, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var pair = rnd.pick(D.synonyms);
      var flip = rnd.chance(0.5);
      var word = flip ? pair[1] : pair[0];
      var right = flip ? pair[0] : pair[1];
      var wrongs = [];
      for (var i = 0; i < 6; i++) {
        var p = rnd.pick(D.antonyms.concat(D.synonyms));
        var w = rnd.pick(p);
        if (w !== word && w !== right) { wrongs.push(w); }
      }

      return {
        story: "برای تابلوی جشن دنبال واژهٔ هم‌معنی می‌گردیم.",
        stem: "کدام واژه هم‌معنی «" + word + "» است؟",
        answer: right,
        choices: pickOpts(rnd, right, wrongs),
        hint1: "هم‌معنی یعنی واژه‌ای که همان معنی را می‌دهد، نه معنی مخالف.",
        hint2: "به جای «" + word + "» کدام واژه را می‌شود در جمله گذاشت و معنی عوض نشود؟",
        solution: "«" + word + "» و «" + right + "» هم‌معنی هستند.",
        why: "چون واژه‌ای را انتخاب کردی که همان معنی را می‌رساند."
      };
    }
  });

  B.add({
    id: "FA_ANTONYM",
    subject: "فارسی", skill: "fa.vocab", skillName: "متضاد",
    topic: "واژگان", station: 3, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var pair = rnd.pick(D.antonyms);
      var flip = rnd.chance(0.5);
      var word = flip ? pair[1] : pair[0];
      var right = flip ? pair[0] : pair[1];
      var wrongs = [];
      for (var i = 0; i < 6; i++) {
        var w = rnd.pick(rnd.pick(D.antonyms));
        if (w !== word && w !== right) { wrongs.push(w); }
      }

      return {
        story: "در بازی واژه‌ها، باید مخالف هر واژه را پیدا کنی.",
        stem: "مخالف واژهٔ «" + word + "» کدام است؟",
        answer: right,
        choices: pickOpts(rnd, right, wrongs),
        hint1: "مخالف یعنی درست برعکس، نه شبیه.",
        hint2: "اگر چیزی «" + word + "» نباشد، چه می‌شود؟",
        solution: "مخالف «" + word + "» می‌شود «" + right + "».",
        why: "چون واژهٔ درست مخالف را پیدا کردی، نه واژهٔ هم‌معنی."
      };
    }
  });

  B.add({
    id: "FA_MEANING",
    subject: "فارسی", skill: "fa.vocab", skillName: "معنی واژه",
    topic: "واژگان", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.meanings);
      var others = [];
      for (var i = 0; i < D.meanings.length; i++) {
        if (D.meanings[i].word !== item.word) { others.push(D.meanings[i].mean); }
      }

      return {
        story: "در کتاب یک واژهٔ تازه دیدی.",
        stem: "معنی واژهٔ «" + item.word + "» چیست؟",
        answer: item.mean,
        choices: pickOpts(rnd, item.mean, others),
        hint1: "به جمله‌ای فکر کن که این واژه را در آن شنیده‌ای.",
        hint2: "کدام توضیح دقیقاً به «" + item.word + "» می‌خورد؟",
        solution: "«" + item.word + "» یعنی " + item.mean + ".",
        why: "چون معنی واژه را از میان توضیح‌های نزدیک درست تشخیص دادی."
      };
    }
  });

  B.add({
    id: "FA_PLURAL",
    subject: "فارسی", skill: "fa.grammar", skillName: "مفرد و جمع",
    topic: "دستور زبان", station: 3, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var pair = rnd.pick(D.plurals);
      var others = [];
      for (var i = 0; i < D.plurals.length; i++) {
        if (D.plurals[i][0] !== pair[0]) { others.push(D.plurals[i][1]); }
      }

      return {
        story: "روی برچسب قفسه‌ها باید شکل جمع واژه‌ها نوشته شود.",
        stem: "شکل جمعِ «" + pair[0] + "» کدام است؟",
        answer: pair[1],
        choices: pickOpts(rnd, pair[1], others),
        hint1: "برای جمع بستن معمولاً «ها» یا «ان» به آخر واژه اضافه می‌شود.",
        hint2: "کدام گزینه از خود واژهٔ «" + pair[0] + "» ساخته شده است؟",
        solution: "جمعِ «" + pair[0] + "» می‌شود «" + pair[1] + "».",
        why: "چون نشانهٔ جمع را درست به همان واژه اضافه کردی."
      };
    }
  });

  /* ============================================================
     ۲. جمله: ترتیب، نشانه‌گذاری، نوع جمله، تکمیل
     ============================================================ */

  B.add({
    id: "FA_ORDER_SENTENCE",
    subject: "فارسی", skill: "fa.sentence", skillName: "ترتیب جمله",
    topic: "ساخت جمله", station: 3, levels: [1, 2, 3],
    interaction: "order",
    generate: function (level, rnd, ctx) {
      var pool = D.sentences.filter(function (s) {
        return level === 1 ? s.length <= 5 : (level === 2 ? s.length <= 6 : true);
      });
      var words = rnd.pick(pool.length ? pool : D.sentences);

      return {
        story: "واژه‌های تابلوی جشن به‌هم ریخته‌اند.",
        stem: "واژه‌ها را طوری مرتب کن که یک جملهٔ درست بسازند.",
        items: words.map(function (w, i) { return { id: "w" + i, label: w }; }),
        hint1: "اول ببین جمله دربارهٔ چه کسی یا چه چیزی است؛ آن معمولاً اول می‌آید.",
        hint2: "فعل جمله (کاری که انجام می‌شود) معمولاً آخر می‌آید.",
        solution: "جملهٔ درست: " + words.join(" "),
        why: "چون جای درست هر واژه را در جمله پیدا کردی."
      };
    }
  });

  B.add({
    id: "FA_PUNCT_END",
    subject: "فارسی", skill: "fa.punct", skillName: "نشانه‌گذاری",
    topic: "نشانه‌های پایان جمله", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.endMarks);

      return {
        story: "روی تابلوی جشن، نشانه‌های پایان جمله جا افتاده.",
        stem: "آخر این جمله کدام نشانه باید بیاید؟ « " + item.text + " ___ »",
        answer: item.mark,
        choices: rnd.shuffle([".", "؟", "!"]),
        hint1: "اگر جمله سؤال بپرسد «؟»، اگر تعجب داشته باشد «!»، و اگر خبر بدهد «.» می‌گیرد.",
        hint2: "جمله را بلند بخوان؛ صدایت بالا می‌رود یا خبر می‌دهی؟",
        solution: "پاسخ «" + item.mark + "» است، چون " + item.why + ".",
        why: "چون از روی معنی جمله، نشانهٔ درست را انتخاب کردی."
      };
    }
  });

  B.add({
    id: "FA_SENTENCE_KIND",
    subject: "فارسی", skill: "fa.sentence", skillName: "نوع جمله",
    topic: "شناخت جمله", station: 3, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.sentenceKinds);

      return {
        story: "جمله‌های تابلو باید دسته‌بندی شوند.",
        stem: "این جمله چه نوع جمله‌ای است؟ « " + item.text + " »",
        answer: item.kind,
        choices: rnd.shuffle(["خبری", "پرسشی", "امری"]),
        hint1: "جملهٔ خبری خبر می‌دهد، پرسشی سؤال می‌کند و امری دستور یا خواهش دارد.",
        hint2: "به نشانهٔ آخر جمله هم نگاه کن.",
        solution: "این جمله «" + item.kind + "» است.",
        why: "چون از روی کار جمله، نوع آن را درست تشخیص دادی."
      };
    }
  });

  B.add({
    id: "FA_CLOZE",
    subject: "فارسی", skill: "fa.sentence", skillName: "تکمیل جمله",
    topic: "ساخت جمله", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.cloze);

      return {
        story: "یک واژه از جملهٔ تابلو افتاده است.",
        stem: "جای خالی را کامل کن: « " + item.text + " »",
        answer: item.right,
        choices: pickOpts(rnd, item.right, item.wrong),
        hint1: "جمله را با هر گزینه بخوان؛ کدام معنی درستی می‌دهد؟",
        hint2: "به معنی کل جمله فکر کن، نه فقط به واژهٔ کنار جای خالی.",
        solution: "جملهٔ کامل: " + item.text.replace("___", item.right),
        why: "چون واژه‌ای را انتخاب کردی که معنی جمله را درست می‌کند."
      };
    }
  });

  /* ============================================================
     ۳. املا و دقت
     ============================================================ */

  B.add({
    id: "FA_SPELLING",
    subject: "فارسی", skill: "fa.spelling", skillName: "املا",
    topic: "املای درست", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.spelling);
      var extra = rnd.pick(D.spelling.filter(function (s) {
        return s.right !== item.right;
      })).wrong[0];

      return {
        story: "تابلوی جشن نباید غلط املایی داشته باشد.",
        stem: "کدام واژه درست نوشته شده است؟",
        answer: item.right,
        choices: pickOpts(rnd, item.right, item.wrong.concat([extra])),
        hint1: "واژه را در ذهنت بخش‌بخش کن و به حرف‌هایش دقت کن.",
        hint2: "به یاد بیاور این واژه را در کتاب چطور دیده‌ای.",
        solution: "شکل درست «" + item.right + "» است.",
        why: "چون به حرف‌های واژه دقت کردی؛ همین دقت، املا را قوی می‌کند."
      };
    }
  });

  B.add({
    id: "FA_ODD_WORD",
    subject: "فارسی", skill: "fa.vocab", skillName: "دسته‌بندی واژه",
    topic: "واژگان", station: 3, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var g = rnd.pick(D.groups);
      var other = rnd.pick(D.groups.filter(function (x) { return x.name !== g.name; }));
      var three = rnd.pickMany(g.words, 3);
      var odd = rnd.pick(other.words);

      return {
        story: "واژه‌ها را دسته‌بندی می‌کنیم.",
        stem: "کدام واژه به این دسته تعلق ندارد؟",
        answer: odd,
        choices: rnd.shuffle(three.concat([odd])),
        hint1: "ببین سه واژه چه چیز مشترکی دارند.",
        hint2: "سه واژه از دستهٔ «" + g.name + "» هستند.",
        solution: "«" + odd + "» از دستهٔ «" + other.name + "» است، نه «" + g.name + "».",
        why: "چون ویژگی مشترک سه واژهٔ دیگر را پیدا کردی."
      };
    }
  });

  B.add({
    id: "FA_DRAG_GROUPS",
    subject: "فارسی", skill: "fa.vocab", skillName: "دسته‌بندی واژه",
    topic: "واژگان", station: 3, levels: [1, 2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 2 : 3;
      var groups = rnd.pickMany(D.groups, n);
      var items = [], i, j;

      for (i = 0; i < groups.length; i++) {
        var picked = rnd.pickMany(groups[i].words, level === 1 ? 2 : 3);
        for (j = 0; j < picked.length; j++) {
          items.push({ id: groups[i].name + "-" + j, label: picked[j], zone: groups[i].name });
        }
      }

      return {
        story: "برچسب قفسه‌های کتابخانه باید مرتب شود.",
        stem: "هر واژه را به دستهٔ خودش بکش.",
        items: rnd.shuffle(items),
        zones: groups.map(function (g) { return { id: g.name, label: g.name }; }),
        hint1: "از خودت بپرس: این واژه چه چیزی را نشان می‌دهد؟",
        hint2: "دسته‌ها این‌ها هستند: " + groups.map(function (g) { return g.name; }).join("، "),
        solution: "هر واژه باید در دستهٔ هم‌معنی خودش قرار بگیرد.",
        why: "چون معنی هر واژه را فهمیدی و درست دسته‌بندی کردی."
      };
    }
  });

  /* ============================================================
     ۴. کتابخانه: ترتیب الفبایی
     ============================================================ */

  B.add({
    id: "FA_ALPHABET_ORDER",
    subject: "فارسی", skill: "fa.alphabet", skillName: "ترتیب الفبایی",
    topic: "الفبا", station: 3, levels: [1, 2, 3],
    interaction: "order",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 3 : (level === 2 ? 4 : 5);
      var words = rnd.pickMany(D.bookWords, n);
      var sorted = words.slice().sort(function (a, b) {
        return alphaIndex(a) - alphaIndex(b);
      });

      return {
        story: "کتاب‌های کتابخانه باید به ترتیب الفبا در قفسه بروند.",
        stem: "نام کتاب‌ها را به ترتیب الفبا مرتب کن.",
        items: sorted.map(function (w) { return { id: w, label: "📕 " + w }; }),
        hint1: "به حرف اول هر نام نگاه کن.",
        hint2: "ترتیب الفبا این‌طور شروع می‌شود: ا، ب، پ، ت، ث، ج، چ، ح، خ، د …",
        solution: "ترتیب درست: " + sorted.join(" ← "),
        why: "چون حرف اول هر واژه را با ترتیب الفبا مقایسه کردی."
      };
    }
  });

  /* ============================================================
     ۵. درک مطلب
     ============================================================ */

  B.add({
    id: "FA_READING",
    subject: "فارسی", skill: "fa.reading", skillName: "درک مطلب",
    topic: "خواندن و فهمیدن", station: 3, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var p = rnd.pick(D.passages);
      var q = rnd.pick(p.questions);

      return {
        story: "این متن را با هم بخوانیم.",
        stem: q.q,
        passage: p.text,
        answer: q.a,
        choices: pickOpts(rnd, q.a, q.w),
        hint1: "دوباره متن را بخوان و دنبال همان بخشی بگرد که سؤال دربارهٔ آن است.",
        hint2: "جواب داخل خود متن هست؛ لازم نیست از خودت چیزی اضافه کنی.",
        solution: "پاسخ درست: " + q.a,
        why: "چون جواب را از داخل متن پیدا کردی، نه از حدس زدن."
      };
    }
  });

  /* ============================================================
     ۶. فارسی در محله (ایستگاه‌های دیگر)
     ============================================================ */

  B.add({
    id: "FA_SIGN_READ",
    subject: "فارسی", skill: "fa.reading", skillName: "خواندن تابلو",
    topic: "درک مطلب کاربردی", station: 5, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var sign = rnd.pick(P.trafficSigns);
      var others = P.trafficSigns
        .filter(function (s) { return s.name !== sign.name; })
        .map(function (s) { return s.meaning; });

      return {
        story: "سر راه دعوت‌نامه‌ها، یک تابلو دیدی.",
        stem: "روی تابلو نوشته «" + sign.name + "». معنی این تابلو چیست؟",
        answer: sign.meaning,
        choices: pickOpts(rnd, sign.meaning, others),
        visual: { kind: "sign", icon: sign.icon, name: sign.name },
        hint1: "به شکل و نام تابلو با هم نگاه کن.",
        hint2: "این تابلو به تو می‌گوید چه کاری بکنی یا نکنی.",
        solution: "تابلوی «" + sign.name + "» یعنی: " + sign.meaning + ".",
        why: "چون پیام تابلو را درست خواندی؛ این کار در خیابان جان آدم را حفظ می‌کند."
      };
    }
  });

  B.add({
    id: "FA_LABEL_MATCH",
    subject: "فارسی", skill: "fa.reading", skillName: "خواندن برچسب",
    topic: "درک مطلب کاربردی", station: 2, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var picks = rnd.pickMany(P.goods.concat(P.fruits), 4);
      var right = picks[0];
      var kid = P.otherName(rnd, ctx.name);

      return {
        story: "خانم رضایی فهرست خرید را نوشته.",
        stem: kid + " باید چیزی بخرد که با آن نان و پنیر و صبحانه خورده می‌شود و در پاکت است. " +
              "کدام‌یک را بردارد؟",
        answer: "🥛 شیر",
        choices: rnd.shuffle(["🥛 شیر"].concat(
          picks.filter(function (g) { return g.name !== "شیر"; })
               .slice(0, 3)
               .map(function (g) { return g.icon + " " + g.name; })
        )),
        hint1: "به نشانه‌های داخل جمله دقت کن: «صبحانه» و «پاکت».",
        hint2: "کدام کالا در پاکت فروخته می‌شود؟",
        solution: "پاسخ «شیر» است، چون در پاکت است و با صبحانه خورده می‌شود.",
        why: "چون نشانه‌های داخل متن را کنار هم گذاشتی و به جواب رسیدی."
      };
    }
  });

})();
