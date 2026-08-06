/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/q-science.js — الگوهای سؤال علوم و محیط زیست (۱۶ الگو)

   موضوع اصلی این فایل، صرفه‌جویی در آب و برق و گاز است؛ ولی
   نه به شکل نصیحت. دانش‌آموز باید تصمیم بگیرد و پیامد تصمیمش
   را ببیند. به همین دلیل بیشتر سؤال‌ها به شکل «کدام کار درست
   است» یا «کدام بیشتر صرفه‌جویی می‌کند» طراحی شده‌اند، نه
   «چرا باید صرفه‌جویی کنیم».

   بقیهٔ موضوع‌ها: بازیافت، گیاهان، جانوران، مواد، نور، چرخهٔ
   آب، سبک زندگی سالم و تفکر علمی.

   وابستگی: APP.Bank، APP.Pools
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var P = APP.Pools;
  var B = APP.Bank;

  /* ============================================================
     دادهٔ ویژهٔ علوم
     ============================================================ */

  var D = {

    /** حالت‌های ماده */
    matter: [
      { name: "سنگ",   icon: "🪨", state: "جامد" },
      { name: "یخ",    icon: "🧊", state: "جامد" },
      { name: "چوب",   icon: "🪵", state: "جامد" },
      { name: "آب",    icon: "💧", state: "مایع" },
      { name: "شیر",   icon: "🥛", state: "مایع" },
      { name: "روغن",  icon: "🫒", state: "مایع" },
      { name: "هوای داخل بادکنک", icon: "🎈", state: "گاز" },
      { name: "بخار آب", icon: "♨️", state: "گاز" },
      { name: "گاز اجاق", icon: "🔥", state: "گاز" }
    ],

    /** نیازهای گیاه */
    plantNeeds: [
      { need: "آب",       ok: true },
      { need: "نور خورشید", ok: true },
      { need: "خاک",      ok: true },
      { need: "هوا",      ok: true },
      { need: "تلویزیون", ok: false },
      { need: "پول",      ok: false },
      { need: "تاریکی همیشگی", ok: false },
      { need: "نمک زیاد", ok: false }
    ],

    /** بخش‌های گیاه و کار هرکدام */
    plantParts: [
      { part: "ریشه", job: "آب و مواد غذایی را از خاک می‌گیرد" },
      { part: "ساقه", job: "گیاه را نگه می‌دارد و آب را بالا می‌برد" },
      { part: "برگ",  job: "با کمک نور خورشید غذا می‌سازد" },
      { part: "گل",   job: "دانه و میوه از آن به وجود می‌آید" }
    ],

    /** گروه‌های جانوری */
    animalGroups: [
      { group: "پرنده", members: ["گنجشک", "کبوتر", "لک‌لک", "قناری"] },
      { group: "ماهی",  members: ["ماهی قرمز", "قزل‌آلا", "کپور"] },
      { group: "حشره",  members: ["مورچه", "پروانه", "زنبور", "سوسک"] },
      { group: "پستاندار", members: ["گربه", "گوسفند", "اسب", "خرگوش"] }
    ],

    /** عادت‌های سالم و ناسالم */
    healthHabits: [
      { text: "خوردن صبحانه پیش از مدرسه",        good: true },
      { text: "شستن دست‌ها پیش از غذا",           good: true },
      { text: "مسواک زدن دو بار در روز",          good: true },
      { text: "خوابیدن به‌اندازه در شب",           good: true },
      { text: "ورزش کردن و بازی در هوای آزاد",    good: true },
      { text: "خوردن میوه به‌جای تنقلات",          good: true },
      { text: "تماشای طولانی تلویزیون",           good: false },
      { text: "نخوردن صبحانه",                    good: false },
      { text: "خوردن زیاد نوشابه",                good: false },
      { text: "خوابیدن خیلی دیروقت",              good: false }
    ],

    /** گروه‌های غذایی */
    foodGroups: [
      { group: "میوه و سبزی", members: ["سیب", "هویج", "کاهو", "پرتقال"] },
      { group: "لبنیات",      members: ["شیر", "ماست", "پنیر", "دوغ"] },
      { group: "نان و غلات",  members: ["نان", "برنج", "ماکارونی"] },
      { group: "گوشت و حبوبات", members: ["مرغ", "ماهی", "عدس", "لوبیا"] }
    ],

    /** تفکر علمی: مشاهده و نتیجه */
    observations: [
      { obs: "کف حیاط خیس است و از ناودان آب می‌چکد.",
        right: "شاید باران باریده باشد",
        wrong: ["حتماً کسی حیاط را رنگ کرده", "یعنی هوا خیلی گرم است", "یعنی برق قطع شده"] },
      { obs: "گلدان کنار پنجره سبز و شاداب است، ولی گلدان داخل کمد زرد شده.",
        right: "گیاه برای رشد به نور نیاز دارد",
        wrong: ["گیاه‌ها از کمد می‌ترسند", "گلدان دوم کهنه بوده", "رنگ گلدان مهم است"] },
      { obs: "لیوان آب سرد را روی میز گذاشتیم و بیرون آن قطره‌های آب پیدا شد.",
        right: "بخار آبِ هوا روی لیوان سرد به آب تبدیل شده",
        wrong: ["لیوان سوراخ است", "آب از داخل بیرون زده", "لیوان دارد آب می‌سازد"] },
      { obs: "قبض برق این ماه خیلی بیشتر از ماه پیش شده است.",
        right: "شاید وسیله‌ای بیشتر یا بی‌دلیل روشن مانده باشد",
        wrong: ["حتماً برق گران‌تر شده", "یعنی خانه بزرگ‌تر شده", "یعنی لامپ‌ها کم‌مصرف‌اند"] }
    ],

    /** نور و سایه */
    shadow: [
      { q: "سایه چه وقت درست می‌شود؟",
        right: "وقتی جسمی جلوی نور قرار بگیرد",
        wrong: ["وقتی هوا سرد باشد", "وقتی جسم رنگ تیره داشته باشد", "فقط در شب"] },
      { q: "کدام جسم نور را از خودش عبور می‌دهد؟",
        right: "شیشهٔ صاف پنجره",
        wrong: ["تختهٔ چوبی", "دیوار آجری", "کتاب"] },
      { q: "سایهٔ ما چه وقت بلندتر است؟",
        right: "نزدیک غروب که خورشید پایین است",
        wrong: ["ظهر که خورشید بالای سر است", "وقتی می‌دویم", "وقتی چراغ روشن است"] }
    ],

    /** مراحل چرخهٔ آب، به ترتیب درست */
    waterCycle: [
      "خورشید آب دریا را گرم می‌کند",
      "آب بخار می‌شود و بالا می‌رود",
      "بخار در آسمان سرد می‌شود",
      "ابر درست می‌شود",
      "باران می‌بارد"
    ],

    /** وسیلهٔ اندازه‌گیری */
    tools: [
      { tool: "خط‌کش",   use: "اندازه گرفتن طول" },
      { tool: "ترازو",   use: "اندازه گرفتن وزن" },
      { tool: "ساعت",    use: "اندازه گرفتن زمان" },
      { tool: "دماسنج",  use: "اندازه گرفتن گرما و سرما" },
      { tool: "پیمانه",  use: "اندازه گرفتن مقدار مایع" }
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

  /* ============================================================
     ۱. صرفه‌جویی در آب، برق و گاز (ایستگاه ۱)
     ============================================================ */

  B.add({
    id: "SCI_HABIT_GOOD",
    subject: "علوم", skill: "sci.energy", skillName: "صرفه‌جویی در انرژی",
    topic: "مصرف درست", station: 1, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var goods = P.energyHabits.filter(function (h) { return h.good; });
      var bads = P.energyHabits.filter(function (h) { return !h.good; });
      var right = rnd.pick(goods).text;

      return {
        story: "مامان می‌گوید قبض این ماه زیاد شده.",
        stem: "کدام کار باعث صرفه‌جویی می‌شود؟",
        answer: right,
        choices: pickOpts(rnd, right, bads.map(function (h) { return h.text; })),
        hint1: "فکر کن کدام کار باعث می‌شود کمتر آب یا برق یا گاز مصرف شود.",
        hint2: "کاری که چیزی را بی‌خودی روشن یا باز نگه دارد، صرفه‌جویی نیست.",
        solution: "«" + right + "» کار درستی است و مصرف را کم می‌کند.",
        why: "چون تشخیص دادی کدام رفتار جلوی هدررفت را می‌گیرد."
      };
    }
  });

  B.add({
    id: "SCI_HABIT_BAD",
    subject: "علوم", skill: "sci.energy", skillName: "صرفه‌جویی در انرژی",
    topic: "هدررفت", station: 1, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var goods = P.energyHabits.filter(function (h) { return h.good; });
      var bads = P.energyHabits.filter(function (h) { return !h.good; });
      var right = rnd.pick(bads).text;

      return {
        story: "می‌خواهیم بفهمیم کجای خانه هدررفت داریم.",
        stem: "کدام کار باعث هدررفت آب یا برق یا گاز می‌شود؟",
        answer: right,
        choices: pickOpts(rnd, right, goods.map(function (h) { return h.text; })),
        hint1: "دنبال کاری بگرد که چیزی را بی‌فایده مصرف می‌کند.",
        hint2: "سه گزینه کار درست هستند و فقط یکی هدررفت است.",
        solution: "«" + right + "» هدررفت است و باید تغییرش داد.",
        why: "چون رفتار نادرست را تشخیص دادی؛ اولین قدم اصلاح، همین شناختن است."
      };
    }
  });

  B.add({
    id: "SCI_HABIT_KIND",
    subject: "علوم", skill: "sci.energy", skillName: "شناخت نوع انرژی",
    topic: "آب، برق، گاز", station: 1, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var h = rnd.pick(P.energyHabits);

      return {
        story: "باید بفهمیم هر کار به کدام قبض ربط دارد.",
        stem: "این کار به مصرف کدام‌یک مربوط است؟ « " + h.text + " »",
        answer: h.kind,
        choices: rnd.shuffle(["آب", "برق", "گاز"]),
        hint1: "به وسیله‌ای که در جمله آمده فکر کن: شیر، لامپ یا بخاری؟",
        hint2: "شیر و حمام یعنی آب، لامپ و تلویزیون یعنی برق، اجاق و بخاری یعنی گاز.",
        solution: "این کار به مصرف «" + h.kind + "» مربوط است.",
        why: "چون ارتباط وسیله با نوع انرژی را درست فهمیدی."
      };
    }
  });

  B.add({
    id: "SCI_DRAG_HABITS",
    subject: "علوم", skill: "sci.energy", skillName: "صرفه‌جویی در انرژی",
    topic: "مصرف درست و نادرست", station: 1, levels: [1, 2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 2 : 3;
      var goods = rnd.pickMany(P.energyHabits.filter(function (h) { return h.good; }), n);
      var bads = rnd.pickMany(P.energyHabits.filter(function (h) { return !h.good; }), n);
      var items = [], i;

      for (i = 0; i < goods.length; i++) {
        items.push({ id: "g" + i, label: goods[i].text, zone: "درست" });
      }
      for (i = 0; i < bads.length; i++) {
        items.push({ id: "b" + i, label: bads[i].text, zone: "نادرست" });
      }

      return {
        story: "کارهای خانه را با هم بررسی کنیم.",
        stem: "هر کار را در جای درست خودش بگذار.",
        items: rnd.shuffle(items),
        zones: [
          { id: "درست",  label: "✅ صرفه‌جویی" },
          { id: "نادرست", label: "⚠️ هدررفت" }
        ],
        hint1: "از خودت بپرس: این کار مصرف را کم می‌کند یا زیاد؟",
        hint2: "هر کاری که چیزی را بی‌خودی روشن یا باز بگذارد، هدررفت است.",
        solution: "کارهای درست: " + goods.map(function (h) { return h.text; }).join("، "),
        why: "چون تفاوت صرفه‌جویی و هدررفت را در کارهای روزمره فهمیدی."
      };
    }
  });

  B.add({
    id: "SCI_SAVER_LAMP",
    subject: "علوم", skill: "sci.energy", skillName: "انتخاب کم‌مصرف",
    topic: "مقایسهٔ مصرف", station: 1, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var savers = P.appliances.filter(function (a) { return a.saver; });
      var heavy = P.appliances.filter(function (a) { return !a.saver; });
      var right = rnd.pick(savers);

      return {
        story: "بابا می‌خواهد وسیلهٔ کم‌مصرف بخرد.",
        stem: "کدام‌یک از این‌ها کمترین برق را مصرف می‌کند؟",
        answer: right.icon + " " + right.name,
        choices: pickOpts(rnd, right.icon + " " + right.name,
          rnd.pickMany(heavy, 3).map(function (a) { return a.icon + " " + a.name; })),
        hint1: "وسیله‌هایی که گرما تولید می‌کنند معمولاً برق بیشتری می‌خورند.",
        hint2: right.name + " فقط " + right.watt + " وات مصرف دارد.",
        solution: right.name + " با " + right.watt + " وات کم‌مصرف‌ترین است.",
        why: "چون وسیلهٔ کم‌مصرف را درست شناختی؛ همین انتخاب، قبض را کم می‌کند."
      };
    }
  });

  /* ============================================================
     ۲. بازیافت (ایستگاه ۴)
     ============================================================ */

  B.add({
    id: "SCI_RECYCLE_BIN",
    subject: "علوم", skill: "sci.recycle", skillName: "تفکیک زباله",
    topic: "بازیافت", station: 4, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var trash = rnd.pick(P.recyclables);
      var rightBin = null, i;
      for (i = 0; i < P.bins.length; i++) {
        if (P.bins[i].name === trash.bin) { rightBin = P.bins[i]; }
      }
      var right = rightBin.icon + " " + rightBin.name;
      var others = P.bins
        .filter(function (b) { return b.name !== trash.bin; })
        .map(function (b) { return b.icon + " " + b.name; });

      return {
        story: "زباله‌های پارک را باید جدا کنیم.",
        stem: trash.icon + " «" + trash.name + "» در کدام سطل باید برود؟",
        answer: right,
        choices: pickOpts(rnd, right, others),
        hint1: "به جنس آن فکر کن: از چه چیزی ساخته شده است؟",
        hint2: "روزنامه و مقوا کاغذی‌اند، بطری آب پلاستیکی، قوطی کنسرو فلزی.",
        solution: trash.name + " باید در سطل «" + trash.bin + "» برود.",
        why: "چون جنس زباله را درست تشخیص دادی؛ تفکیک درست، بازیافت را ممکن می‌کند."
      };
    }
  });

  B.add({
    id: "SCI_RECYCLE_DRAG",
    subject: "علوم", skill: "sci.recycle", skillName: "تفکیک زباله",
    topic: "بازیافت", station: 4, levels: [1, 2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var groups = level === 1 ? 2 : 3;
      var bins = rnd.pickMany(P.bins, groups);
      var items = [], i, j;

      for (i = 0; i < bins.length; i++) {
        var pool = P.recyclables.filter(function (r) { return r.bin === bins[i].name; });
        var picked = rnd.pickMany(pool, Math.min(level === 1 ? 2 : 3, pool.length));
        for (j = 0; j < picked.length; j++) {
          items.push({
            id: bins[i].name + "-" + j,
            label: picked[j].icon + " " + picked[j].name,
            zone: bins[i].name
          });
        }
      }

      return {
        story: "سطل‌های بازیافت پارک آماده‌اند.",
        stem: "هر زباله را داخل سطل درست خودش بینداز.",
        items: rnd.shuffle(items),
        zones: bins.map(function (b) { return { id: b.name, label: b.icon + " " + b.name }; }),
        hint1: "جنس هر چیز را ببین، نه شکل و رنگش را.",
        hint2: "سطل‌های موجود: " + bins.map(function (b) { return b.name; }).join("، "),
        solution: "هر زباله باید در سطل هم‌جنس خودش برود.",
        why: "چون همهٔ زباله‌ها را بر اساس جنسشان درست جدا کردی."
      };
    }
  });

  /* ============================================================
     ۳. گیاهان و جانوران (ایستگاه ۴)
     ============================================================ */

  B.add({
    id: "SCI_PLANT_NEEDS",
    subject: "علوم", skill: "sci.plants", skillName: "نیازهای گیاه",
    topic: "گیاهان", station: 4, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var right = rnd.pick(D.plantNeeds.filter(function (n) { return n.ok; })).need;
      var wrongs = D.plantNeeds.filter(function (n) { return !n.ok; })
                               .map(function (n) { return n.need; });

      return {
        story: "گل‌های باغچه پژمرده شده‌اند.",
        stem: "گیاه برای رشد به کدام‌یک نیاز دارد؟",
        answer: right,
        choices: pickOpts(rnd, right, wrongs),
        hint1: "فکر کن گیاه در طبیعت از کجا غذا و آب می‌گیرد.",
        hint2: "گیاه به آب، نور، خاک و هوا نیاز دارد.",
        solution: "گیاه به «" + right + "» نیاز دارد.",
        why: "چون نیاز واقعی گیاه را از چیزهای بی‌ربط جدا کردی."
      };
    }
  });

  B.add({
    id: "SCI_PLANT_PART",
    subject: "علوم", skill: "sci.plants", skillName: "بخش‌های گیاه",
    topic: "گیاهان", station: 4, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var part = rnd.pick(D.plantParts);
      var wrongs = D.plantParts.filter(function (p) { return p.part !== part.part; })
                               .map(function (p) { return p.job; });

      return {
        story: "عمو حسن دربارهٔ گیاهان توضیح می‌دهد.",
        stem: "کار «" + part.part + "» در گیاه چیست؟",
        answer: part.job,
        choices: pickOpts(rnd, part.job, wrongs),
        hint1: "به جای این بخش در گیاه فکر کن: زیر خاک است یا بالای آن؟",
        hint2: "بخشی که در خاک است با خاک کار دارد؛ بخشی که در نور است با نور.",
        solution: part.part + " " + part.job + ".",
        why: "چون کار هر بخش گیاه را با جای آن ربط دادی."
      };
    }
  });

  B.add({
    id: "SCI_ANIMAL_GROUP",
    subject: "علوم", skill: "sci.animals", skillName: "گروه‌های جانوری",
    topic: "جانوران", station: 4, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var g = rnd.pick(D.animalGroups);
      var animal = rnd.pick(g.members);
      var wrongs = D.animalGroups.filter(function (x) { return x.group !== g.group; })
                                 .map(function (x) { return x.group; });

      return {
        story: "در پارک جانورهای مختلفی دیدی.",
        stem: "«" + animal + "» جزو کدام گروه است؟",
        answer: g.group,
        choices: pickOpts(rnd, g.group, wrongs),
        hint1: "به بدن آن فکر کن: پر دارد؟ بال دارد؟ در آب زندگی می‌کند؟",
        hint2: "پرنده‌ها پر دارند، حشره‌ها شش پا، ماهی‌ها در آب زندگی می‌کنند.",
        solution: animal + " جزو گروه «" + g.group + "» است.",
        why: "چون از روی ویژگی‌های بدن، گروه جانور را تشخیص دادی."
      };
    }
  });

  B.add({
    id: "SCI_ANIMAL_DRAG",
    subject: "علوم", skill: "sci.animals", skillName: "گروه‌های جانوری",
    topic: "جانوران", station: 4, levels: [2, 3],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var groups = rnd.pickMany(D.animalGroups, level === 2 ? 2 : 3);
      var items = [], i, j;
      for (i = 0; i < groups.length; i++) {
        var picked = rnd.pickMany(groups[i].members, 2);
        for (j = 0; j < picked.length; j++) {
          items.push({ id: groups[i].group + "-" + j, label: picked[j], zone: groups[i].group });
        }
      }

      return {
        story: "بچه‌های محله دربارهٔ جانوران پارک تحقیق می‌کنند.",
        stem: "هر جانور را در گروه خودش بگذار.",
        items: rnd.shuffle(items),
        zones: groups.map(function (g) { return { id: g.group, label: g.group }; }),
        hint1: "به بدن هر جانور فکر کن: پر، پولک، پا یا مو؟",
        hint2: "گروه‌ها: " + groups.map(function (g) { return g.group; }).join("، "),
        solution: "هر جانور باید در گروه ویژگی‌های بدنش قرار بگیرد.",
        why: "چون جانورها را بر اساس ویژگی مشترکشان دسته‌بندی کردی."
      };
    }
  });

  /* ============================================================
     ۴. مواد، نور و چرخهٔ آب
     ============================================================ */

  B.add({
    id: "SCI_MATTER_STATE",
    subject: "علوم", skill: "sci.matter", skillName: "حالت‌های ماده",
    topic: "مواد", station: 4, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var m = rnd.pick(D.matter);

      return {
        story: "در آزمایش کلاس، مواد را دسته‌بندی می‌کنیم.",
        stem: m.icon + " «" + m.name + "» در کدام حالت است؟",
        answer: m.state,
        choices: rnd.shuffle(["جامد", "مایع", "گاز"]),
        hint1: "جامد شکل ثابت دارد، مایع روان است و گاز همه‌جای ظرف را پر می‌کند.",
        hint2: "آیا می‌شود آن را در دست گرفت و شکلش عوض نشود؟",
        solution: m.name + " در حالت «" + m.state + "» است.",
        why: "چون ویژگی هر حالت ماده را درست به کار بردی."
      };
    }
  });

  B.add({
    id: "SCI_LIGHT_SHADOW",
    subject: "علوم", skill: "sci.light", skillName: "نور و سایه",
    topic: "نور", station: 4, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(D.shadow);

      return {
        story: "زیر درخت میدان، سایه‌ها را نگاه کن.",
        stem: item.q,
        answer: item.right,
        choices: pickOpts(rnd, item.right, item.wrong),
        hint1: "سایه جایی درست می‌شود که نور به آن نمی‌رسد.",
        hint2: "به جای خورشید یا چراغ نسبت به جسم فکر کن.",
        solution: "پاسخ درست: " + item.right,
        why: "چون رابطهٔ نور و جسم را درست فهمیدی."
      };
    }
  });

  B.add({
    id: "SCI_WATER_CYCLE",
    subject: "علوم", skill: "sci.water", skillName: "چرخهٔ آب",
    topic: "آب", station: 4, levels: [2, 3],
    interaction: "order",
    generate: function (level, rnd, ctx) {
      var steps = level === 2 ? D.waterCycle.slice(0, 4) : D.waterCycle;

      return {
        story: "بارانی که به باغچه می‌رسد، از کجا می‌آید؟",
        stem: "مرحله‌های چرخهٔ آب را به ترتیب درست بچین.",
        items: steps.map(function (s, i) { return { id: "wc" + i, label: s }; }),
        hint1: "اول فکر کن گرما با آب چه می‌کند.",
        hint2: "ترتیب کلی: گرم شدن ← بخار شدن ← سرد شدن ← ابر ← باران",
        solution: "ترتیب درست: " + steps.join(" ← "),
        why: "چون فهمیدی آب در طبیعت نابود نمی‌شود، فقط شکلش عوض می‌شود."
      };
    }
  });

  B.add({
    id: "SCI_TOOL_USE",
    subject: "علوم", skill: "sci.tools", skillName: "وسیلهٔ اندازه‌گیری",
    topic: "اندازه‌گیری", station: 4, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var t = rnd.pick(D.tools);
      var wrongs = D.tools.filter(function (x) { return x.tool !== t.tool; })
                          .map(function (x) { return x.tool; });

      return {
        story: "برای آماده‌کردن جشن، وسیلهٔ درست لازم داریم.",
        stem: "برای «" + t.use + "» از کدام وسیله استفاده می‌کنیم؟",
        answer: t.tool,
        choices: pickOpts(rnd, t.tool, wrongs),
        hint1: "به این فکر کن که هر وسیله چه چیزی را نشان می‌دهد.",
        hint2: "ترازو وزن، خط‌کش طول، ساعت زمان و دماسنج گرما را می‌سنجد.",
        solution: "برای " + t.use + " از «" + t.tool + "» استفاده می‌کنیم.",
        why: "چون وسیلهٔ درست را برای اندازه‌گیری درست انتخاب کردی."
      };
    }
  });

  /* ============================================================
     ۵. تفکر علمی و سبک زندگی سالم
     ============================================================ */

  B.add({
    id: "SCI_OBSERVE_THINK",
    subject: "علوم", skill: "sci.thinking", skillName: "تفکر علمی",
    topic: "مشاهده و نتیجه‌گیری", station: 4, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var o = rnd.pick(D.observations);

      return {
        story: "یک دانشمند کوچک، اول خوب نگاه می‌کند بعد نتیجه می‌گیرد.",
        stem: "این را دیدی: « " + o.obs + " » به نظرت کدام نتیجه درست‌تر است؟",
        answer: o.right,
        choices: pickOpts(rnd, o.right, o.wrong),
        hint1: "فقط به چیزی که دیده‌ای تکیه کن، نه به حدس‌های دور.",
        hint2: "کدام نتیجه با همان چیزی که دیدی جور درمی‌آید؟",
        solution: "نتیجهٔ درست‌تر: " + o.right,
        why: "چون از مشاهده به نتیجه رسیدی، نه از حدس‌های بی‌ربط."
      };
    }
  });

  B.add({
    id: "SCI_HEALTH_HABIT",
    subject: "علوم", skill: "sci.health", skillName: "سبک زندگی سالم",
    topic: "بهداشت و سلامت", station: 6, levels: [1, 2],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var goods = D.healthHabits.filter(function (h) { return h.good; });
      var bads = D.healthHabits.filter(function (h) { return !h.good; });
      var askGood = rnd.chance(0.6);
      var right = askGood ? rnd.pick(goods).text : rnd.pick(bads).text;
      var wrongs = (askGood ? bads : goods).map(function (h) { return h.text; });

      return {
        story: "خانم صادقی در درمانگاه دربارهٔ سلامت حرف می‌زند.",
        stem: askGood ? "کدام‌یک عادت سالمی است؟" : "کدام‌یک برای سلامتی خوب نیست؟",
        answer: right,
        choices: pickOpts(rnd, right, wrongs),
        hint1: "فکر کن کدام کار به بدن تو کمک می‌کند و کدام به آن آسیب می‌زند.",
        hint2: "خواب کافی، صبحانه و ورزش به بدن کمک می‌کنند.",
        solution: "پاسخ درست: " + right,
        why: "چون اثر هر عادت روی بدن را درست تشخیص دادی."
      };
    }
  });

  B.add({
    id: "SCI_FOOD_GROUP",
    subject: "علوم", skill: "sci.health", skillName: "گروه‌های غذایی",
    topic: "تغذیهٔ سالم", station: 6, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var g = rnd.pick(D.foodGroups);
      var food = rnd.pick(g.members);
      var wrongs = D.foodGroups.filter(function (x) { return x.group !== g.group; })
                               .map(function (x) { return x.group; });

      return {
        story: "برای سفرهٔ جشن باید غذاها را دسته‌بندی کنیم.",
        stem: "«" + food + "» جزو کدام گروه غذایی است؟",
        answer: g.group,
        choices: pickOpts(rnd, g.group, wrongs),
        hint1: "فکر کن این خوراکی از چه چیزی به دست می‌آید.",
        hint2: "شیر و ماست و پنیر همه لبنیات هستند.",
        solution: food + " جزو گروه «" + g.group + "» است.",
        why: "چون گروه غذایی درست را شناختی؛ این کار به تغذیهٔ متعادل کمک می‌کند."
      };
    }
  });

})();
