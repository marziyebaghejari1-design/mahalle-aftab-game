/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/data/q-math.js — الگوهای سؤال ریاضی (۲۶ الگو)

   هیچ سؤالی ثابت نیست. هر الگو با اجرای تابع generate یک سؤال
   تازه می‌سازد: عددها، نام‌ها، کالاها و موقعیت هر بار عوض می‌شوند.

   ── سه قانون ثابت در همهٔ الگوها ──
   ۱. هیچ سؤالی محاسبهٔ خشک نیست. همیشه یک موقعیت واقعی زندگی است.
   ۲. گزینه‌های انحرافی تصادفی نیستند؛ هرکدام یک «خطای رایج
      دانش‌آموز» را نشان می‌دهند (جمع به‌جای ضرب، فراموش‌کردن
      مرحلهٔ دوم، جابه‌جایی عددها). به همین دلیل انتخاب گزینهٔ
      اشتباه به ما می‌گوید دانش‌آموز کجا را نفهمیده است.
   ۳. سطح‌ها فقط عدد بزرگ‌تر نیستند:
      سطح ۱ → یک مرحله، عدد تا ۱۰۰
      سطح ۲ → دو مرحله، عدد تا ۱۰۰۰
      سطح ۳ → سه مرحله یا بیشتر، با اطلاعات اضافی که باید کنار گذاشته شود

   وابستگی: APP.Bank، APP.Pools
   ============================================================ */

var APP = APP || {};

(function () {
  "use strict";

  var P = APP.Pools;
  var B = APP.Bank;

  /* ============================================================
     ابزارهای مشترک
     ============================================================ */

  /**
   * ساخت چهار گزینه: پاسخ درست + سه گزینهٔ انحرافی.
   * گزینه‌های تکراری، منفی یا برابر با پاسخ درست کنار گذاشته
   * می‌شوند و در صورت کم‌بودن، با عددهای نزدیک پر می‌شوند.
   *
   * @param {Object} rnd تولیدکنندهٔ تصادفی
   * @param {number} right پاسخ درست
   * @param {Array<number>} errs گزینه‌های انحرافی بر پایهٔ خطاهای رایج
   * @param {Function} [fmt] تبدیل عدد به متن نمایشی
   */
  function opts(rnd, right, errs, fmt) {
    fmt = fmt || String;
    var seen = {}, pool = [], i, v;
    seen[right] = true;

    for (i = 0; i < errs.length; i++) {
      v = errs[i];
      if (typeof v !== "number" || !isFinite(v)) { continue; }
      v = Math.round(v * 100) / 100;
      if (v < 0 || seen[v]) { continue; }
      seen[v] = true;
      pool.push(v);
    }

    var guard = 0;
    while (pool.length < 3 && guard < 60) {
      guard++;
      v = right + rnd.int(1, Math.max(2, Math.round(right * 0.2))) * rnd.sign();
      if (v < 0 || seen[v]) { continue; }
      seen[v] = true;
      pool.push(v);
    }

    return rnd.shuffle(pool.slice(0, 3).concat([right])).map(fmt);
  }

  /** قیمت با واحد یکسان در همهٔ بازی */
  function money(n) {
    return P.money(n);
  }

  /**
   * همان کار opts، ولی برای گزینه‌های متنی (مثل کسرها).
   * گزینه‌های تکراری حذف می‌شوند و در صورت کم‌بودن، از فهرست
   * ذخیره پر می‌شوند. اگر باز هم کم بود، تعداد کمتری برمی‌گردد
   * — بهتر از نمایش دو گزینهٔ یکسان به دانش‌آموز.
   */
  function optsText(rnd, right, cands, spare) {
    var seen = {}, pool = [], i, v;
    seen[right] = true;
    cands = cands.concat(spare || []);

    for (i = 0; i < cands.length; i++) {
      v = cands[i];
      if (!v || seen[v]) { continue; }
      seen[v] = true;
      pool.push(v);
    }
    return rnd.shuffle(pool.slice(0, 3).concat([right]));
  }

  /** متن «الف، ب و ج» برای فهرست کالاها */
  function listText(parts) {
    if (parts.length === 1) { return parts[0]; }
    return parts.slice(0, -1).join("، ") + " و " + parts[parts.length - 1];
  }

  /** جملهٔ اطلاعات اضافی برای سطح چالشی */
  function noise(rnd, name) {
    return rnd.pick([
      name + " ساعت چهار بعدازظهر به بازارچه رفت.",
      "هوا آن روز آفتابی بود.",
      "مغازه سه تا قفسه دارد.",
      name + " کفش آبی پوشیده بود."
    ]);
  }

  /* ============================================================
     ایستگاه ۱ — خانه (صرفه‌جویی در آب، برق و گاز)
     ============================================================ */

  B.add({
    id: "MATH_HOME_BILL_DIFF",
    subject: "ریاضی", skill: "math.subtract", skillName: "تفریق",
    topic: "تفریق در موقعیت واقعی", station: 1, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var lastMonth = level === 1 ? rnd.step(40, 95, 5) : rnd.step(300, 900, 10);
      var saved = level === 1 ? rnd.step(10, 35, 5) : rnd.step(60, 250, 10);
      var thisMonth = lastMonth - saved;

      return {
        story: "مامان دو تا قبض برق را کنار هم گذاشته.",
        stem: "قبض برق ماه پیش " + money(lastMonth) + " بود. این ماه " +
              money(thisMonth) + " شده. چقدر کمتر شده است؟",
        answer: saved,
        unit: "هزار تومان",
        hint1: "برای پیدا کردن «چقدر کمتر»، باید عدد کوچک‌تر را از عدد بزرگ‌تر کم کنی.",
        hint2: "بنویس: " + lastMonth + " − " + thisMonth + " = ؟ اگر خواستی روی چرک‌نویس حساب کن.",
        solution: lastMonth + " − " + thisMonth + " = " + saved +
                  "، یعنی " + money(saved) + " صرفه‌جویی شده.",
        why: "چون اختلاف دو عدد را با تفریق پیدا می‌کنیم."
      };
    }
  });

  B.add({
    id: "MATH_HOME_LAMP_SAVE",
    subject: "ریاضی", skill: "math.multiply", skillName: "ضرب",
    topic: "ضرب در موقعیت واقعی", station: 1, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var rooms = rnd.int(3, level === 1 ? 5 : 8);
      var perRoom = level === 1 ? rnd.int(2, 3) : rnd.int(2, 5);
      var total = rooms * perRoom;

      if (level < 3) {
        return {
          story: "بابا می‌خواهد لامپ‌های خانه را کم‌مصرف کند.",
          stem: "خانهٔ شما " + rooms + " اتاق دارد و در هر اتاق " + perRoom +
                " لامپ هست. همهٔ لامپ‌های خانه چند تا هستند؟",
          answer: total,
          unit: "لامپ",
          hint1: "لازم نیست یکی‌یکی بشماری. تعداد اتاق‌ها را در تعداد لامپ هر اتاق ضرب کن.",
          hint2: rooms + " × " + perRoom + " = ؟",
          solution: rooms + " × " + perRoom + " = " + total + " لامپ.",
          why: "چون همهٔ اتاق‌ها به یک اندازه لامپ دارند، ضرب سریع‌تر از جمع است."
        };
      }

      // سطح چالشی: دو مرحله — ضرب، بعد تفریق لامپ‌های سوخته
      var broken = rnd.int(2, 5);
      var working = total - broken;
      return {
        story: "بابا لامپ‌های خانه را می‌شمارد.",
        stem: "خانهٔ شما " + rooms + " اتاق دارد و در هر اتاق " + perRoom +
              " لامپ هست، ولی " + broken + " لامپ سوخته است. " +
              "چند لامپ سالم داریم؟",
        answer: working,
        unit: "لامپ",
        hint1: "اول باید بفهمی کلاً چند لامپ هست، بعد سوخته‌ها را کم کنی.",
        hint2: "مرحلهٔ اول: " + rooms + " × " + perRoom + " = " + total +
               "؛ مرحلهٔ دوم: " + total + " − " + broken + " = ؟",
        solution: rooms + " × " + perRoom + " = " + total + "، سپس " +
                  total + " − " + broken + " = " + working + " لامپ سالم.",
        why: "چون اول ضرب کردی و بعد کم کردی؛ ترتیب مرحله‌ها درست بود."
      };
    }
  });

  B.add({
    id: "MATH_HOME_WATER_TAP",
    subject: "ریاضی", skill: "math.multiply", skillName: "ضرب و اندازه‌گیری",
    topic: "مصرف آب", station: 1, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var perMin = level === 1 ? rnd.int(2, 5) : rnd.int(4, 9);
      var mins = level === 1 ? rnd.int(2, 4) : rnd.int(3, 8);
      var total = perMin * mins;
      var kid = P.otherName(rnd, ctx.name);

      return {
        story: "شیر آب دستشویی باز مانده بود.",
        stem: kid + " موقع مسواک‌زدن شیر آب را باز می‌گذارد. از این شیر در هر دقیقه " +
              perMin + " لیتر آب می‌رود. اگر " + mins +
              " دقیقه باز بماند، چند لیتر آب هدر می‌رود؟",
        answer: String(total),
        choices: opts(rnd, total, [perMin + mins, total - perMin, total + perMin, mins]),
        unit: "لیتر",
        hint1: "در هر دقیقه یک مقدار ثابت آب می‌رود. پس مصرف هر دقیقه را در تعداد دقیقه‌ها ضرب کن.",
        hint2: perMin + " × " + mins + " = ؟",
        solution: perMin + " × " + mins + " = " + total +
                  " لیتر. با بستن شیر، همهٔ این آب صرفه‌جویی می‌شود.",
        why: "چون مصرف هر دقیقه ثابت است و ضرب همان جمعِ تکراری است."
      };
    }
  });

  B.add({
    id: "MATH_HOME_COMPARE_WATT",
    subject: "ریاضی", skill: "math.compare", skillName: "مقایسه و تصمیم‌گیری",
    topic: "مقایسهٔ مصرف", station: 1, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var picks = rnd.pickMany(P.appliances, 4);
      var most = picks[0];
      for (var i = 1; i < picks.length; i++) {
        if (picks[i].watt > most.watt) { most = picks[i]; }
      }
      var labels = picks.map(function (a) { return a.icon + " " + a.name; });

      return {
        story: "قبض برق زیاد آمده و باید ببینیم کدام وسیله بیشتر برق می‌خورد.",
        stem: "از بین این وسیله‌ها، کدام‌یک در یک ساعت بیشترین برق را مصرف می‌کند؟",
        answer: most.icon + " " + most.name,
        choices: rnd.shuffle(labels),
        visual: { kind: "watts", items: picks },
        hint1: "به عددِ کنار هر وسیله نگاه کن؛ هرچه عدد بزرگ‌تر باشد، برق بیشتری می‌خورد.",
        hint2: "بین این عددها بگرد: " + picks.map(function (a) { return a.watt; }).join("، ") +
               ". کدام بزرگ‌ترین است؟",
        solution: most.name + " با " + most.watt +
                  " وات بیشترین مصرف را دارد؛ پس بی‌خودی روشن نماند.",
        why: "چون برای پیدا کردن بیشترین، عددها را با هم مقایسه کردی."
      };
    }
  });

  B.add({
    id: "MATH_HOME_GAS_DAYS",
    subject: "ریاضی", skill: "math.divide", skillName: "تقسیم",
    topic: "تقسیم در موقعیت واقعی", station: 1, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var days = rnd.int(4, 9);
      var perDay = rnd.int(3, 8);
      var total = days * perDay;

      return {
        story: "بابا مصرف گاز این هفته را روی کاغذ نوشته.",
        stem: "این هفته روی هم " + total + " واحد گاز مصرف شده و هر روز به یک اندازه بوده است. " +
              "اگر " + days + " روز حساب کنیم، هر روز چند واحد گاز مصرف شده؟",
        answer: perDay,
        unit: "واحد",
        hint1: "وقتی یک مقدار کل را به‌طور مساوی بین روزها پخش می‌کنیم، تقسیم می‌کنیم.",
        hint2: total + " ÷ " + days + " = ؟",
        solution: total + " ÷ " + days + " = " + perDay + " واحد در هر روز.",
        why: "چون مصرف هر روز برابر بوده و تقسیم، کل را به قسمت‌های مساوی می‌شکند."
      };
    }
  });

  /* ============================================================
     ایستگاه ۲ — بازارچهٔ محله (پول و حل مسئله)
     ============================================================ */

  B.add({
    id: "MATH_SHOP_TOTAL",
    subject: "ریاضی", skill: "math.money", skillName: "جمع پول",
    topic: "جمع", station: 2, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 2 : (level === 2 ? 3 : 4);
      var items = rnd.pickMany(P.goods.concat(P.fruits), n);
      var sum = 0, parts = [];
      for (var i = 0; i < items.length; i++) {
        sum += items[i].price;
        parts.push(items[i].icon + " " + items[i].name + " " + money(items[i].price));
      }

      return {
        story: "خانم رضایی سفارش جشن را روی کاغذ نوشته.",
        stem: "برای جشن باید این‌ها را بخریم: " + listText(parts) +
              ". همهٔ خرید روی هم چقدر می‌شود؟",
        answer: sum,
        unit: "هزار تومان",
        visual: { kind: "receipt", items: items },
        hint1: "قیمت‌ها را یکی‌یکی با هم جمع کن. اگر زیاد است، دوتا دوتا جمع کن.",
        hint2: items.map(function (g) { return g.price; }).join(" + ") + " = ؟",
        solution: items.map(function (g) { return g.price; }).join(" + ") +
                  " = " + sum + "، یعنی " + money(sum) + ".",
        why: "چون برای پیدا کردن مجموع خرید، قیمت‌ها را جمع می‌کنیم."
      };
    }
  });

  B.add({
    id: "MATH_SHOP_CHANGE",
    subject: "ریاضی", skill: "math.money", skillName: "پول و باقی‌مانده",
    topic: "تفریق", station: 2, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(P.goods);
      var count = level === 1 ? rnd.int(1, 2) : rnd.int(2, 4);
      var cost = item.price * count;
      var paid = level === 1 ? rnd.step(cost + 5, cost + 40, 5)
                             : rnd.step(cost + 10, cost + 120, 10);
      var back = paid - cost;

      return {
        story: "نوبت توست که خرید کنی.",
        stem: count + " " + item.unit + " " + item.name + " می‌خری. هر کدام " +
              money(item.price) + " است و تو " + money(paid) +
              " می‌دهی. خانم رضایی چقدر باید به تو پس بدهد؟",
        answer: back,
        unit: "هزار تومان",
        hint1: "اول حساب کن خریدت روی هم چقدر شد، بعد آن را از پولی که دادی کم کن.",
        hint2: "مرحلهٔ اول: " + count + " × " + item.price + " = " + cost +
               "؛ مرحلهٔ دوم: " + paid + " − " + cost + " = ؟",
        solution: count + " × " + item.price + " = " + cost + "، سپس " +
                  paid + " − " + cost + " = " + back + "، یعنی " + money(back) + " پس می‌گیری.",
        why: "چون اول ضرب کردی و بعد کم کردی؛ همین ترتیب درست است."
      };
    }
  });

  B.add({
    id: "MATH_SHOP_PACKS",
    subject: "ریاضی", skill: "math.multiply", skillName: "ضرب",
    topic: "ضرب بسته‌ها", station: 2, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(P.stationery);
      var packs = level === 1 ? rnd.int(2, 4) : rnd.int(3, 7);
      var total = packs * item.perPack;

      return {
        story: "برای بچه‌های جشن باید هدیه بخریم.",
        stem: packs + " بستهٔ " + item.name + " می‌خریم. در هر بسته " + item.perPack +
              " " + item.name + " هست. روی هم چند " + item.name + " داریم؟",
        answer: String(total),
        // خطاهای رایج: جمع به‌جای ضرب، یک بسته کمتر، فقط یک بسته
        choices: opts(rnd, total, [
          packs + item.perPack,
          total - item.perPack,
          item.perPack
        ]),
        unit: item.name,
        visual: { kind: "packs", icon: item.icon, packs: packs, perPack: item.perPack },
        hint1: "هر بسته به یک اندازه است. پس تعداد بسته‌ها را در تعداد داخل هر بسته ضرب کن.",
        hint2: packs + " × " + item.perPack + " = ؟",
        solution: packs + " × " + item.perPack + " = " + total + " " + item.name + ".",
        why: "چون بسته‌ها همه یک‌اندازه‌اند، ضرب جواب می‌دهد نه جمعِ دو عدد."
      };
    }
  });

  B.add({
    id: "MATH_SHOP_COMPARE_PRICE",
    subject: "ریاضی", skill: "math.compare", skillName: "مقایسه و تصمیم‌گیری",
    topic: "مقایسهٔ قیمت", station: 2, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var item = rnd.pick(P.fruits);
      var aCount = rnd.int(2, 4);
      var aPrice = item.price * aCount + rnd.int(1, 4);
      var bCount = aCount + rnd.int(1, 3);
      var bPrice = item.price * bCount - rnd.int(0, 3);

      var aUnit = aPrice / aCount;
      var bUnit = bPrice / bCount;
      var better = (aUnit <= bUnit) ? "مغازهٔ اول" : "مغازهٔ دوم";

      return {
        story: "دو مغازه در بازارچه " + item.name + " دارند.",
        stem: "مغازهٔ اول: " + aCount + " کیلو " + item.name + " با " + money(aPrice) +
              ". مغازهٔ دوم: " + bCount + " کیلو با " + money(bPrice) +
              ". از کدام مغازه بخریم به‌صرفه‌تر است؟",
        answer: better,
        choices: rnd.shuffle(["مغازهٔ اول", "مغازهٔ دوم", "هر دو یکی است"]),
        hint1: "نمی‌شود فقط قیمت کل را مقایسه کرد، چون مقدارها فرق دارند. ببین هر کیلو چند می‌شود.",
        hint2: "مغازهٔ اول: " + aPrice + " ÷ " + aCount + "؛ مغازهٔ دوم: " +
               bPrice + " ÷ " + bCount + ". کدام کمتر است؟",
        solution: "قیمت هر کیلو در مغازهٔ اول حدود " + Math.round(aUnit) +
                  " و در مغازهٔ دوم حدود " + Math.round(bUnit) + " است. پس " + better + " به‌صرفه‌تر است.",
        why: "چون برای مقایسهٔ درست، قیمت را به ازای یک کیلو حساب کردی."
      };
    }
  });

  B.add({
    id: "MATH_SHOP_SHARE",
    subject: "ریاضی", skill: "math.divide", skillName: "تقسیم",
    topic: "تقسیم مساوی", station: 2, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var food = rnd.pick(P.partyFood);
      var kids = level === 1 ? rnd.int(2, 5) : rnd.int(4, 9);
      var each = level === 1 ? rnd.int(2, 5) : rnd.int(3, 9);
      var total = kids * each;

      return {
        story: "شیرینی‌های جشن باید بین بچه‌ها پخش شود.",
        stem: total + " " + food.name + " داریم و می‌خواهیم بین " + kids +
              " بچه به‌طور مساوی پخش کنیم. به هر بچه چند تا می‌رسد؟",
        answer: each,
        unit: "تا",
        visual: { kind: "share", icon: food.icon, total: total, groups: kids },
        hint1: "«به‌طور مساوی پخش کردن» یعنی تقسیم.",
        hint2: total + " ÷ " + kids + " = ؟",
        solution: total + " ÷ " + kids + " = " + each + " " + food.name + " برای هر بچه.",
        why: "چون سهم همه باید برابر باشد و تقسیم دقیقاً همین کار را می‌کند."
      };
    }
  });

  B.add({
    id: "MATH_SHOP_BUDGET",
    subject: "ریاضی", skill: "math.multistep", skillName: "حل مسئلهٔ چندمرحله‌ای",
    topic: "بودجه و تصمیم‌گیری", station: 2, levels: [3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var a = rnd.pick(P.goods);
      var b = rnd.pick(P.fruits);
      var na = rnd.int(2, 4);
      var nb = rnd.int(2, 5);
      var budget = rnd.step(a.price * na + b.price * nb + 20, a.price * na + b.price * nb + 90, 10);
      var spent = a.price * na + b.price * nb;
      var left = budget - spent;

      return {
        story: "خانم رضایی پول خرید را به تو سپرده.",
        stem: money(budget) + " برای خرید جشن داری. " + na + " " + a.unit + " " + a.name +
              " (هرکدام " + money(a.price) + ") و " + nb + " کیلو " + b.name +
              " (هر کیلو " + money(b.price) + ") می‌خری. " + noise(rnd, ctx.name) +
              " چقدر پول برایت می‌ماند؟",
        answer: left,
        unit: "هزار تومان",
        hint1: "بعضی جمله‌ها به حساب کردن ربطی ندارند. فقط عددهای لازم را جدا کن.",
        hint2: "قیمت " + a.name + ": " + na + " × " + a.price + " = " + (na * a.price) +
               "؛ قیمت " + b.name + ": " + nb + " × " + b.price + " = " + (nb * b.price) +
               "؛ بعد جمع کن و از " + budget + " کم کن.",
        solution: (na * a.price) + " + " + (nb * b.price) + " = " + spent + "، سپس " +
                  budget + " − " + spent + " = " + left + ".",
        why: "چون سه مرحله را به ترتیب درست انجام دادی و اطلاعات اضافی را کنار گذاشتی."
      };
    }
  });

  /* ============================================================
     ایستگاه ۳ — مدرسه و کتابخانه (ریاضی در بافت کتاب)
     ============================================================ */

  B.add({
    id: "MATH_SCHOOL_SHELVES",
    subject: "ریاضی", skill: "math.divide", skillName: "تقسیم با باقی‌مانده",
    topic: "تقسیم", station: 3, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var shelves = rnd.int(4, 8);
      var perShelf = rnd.int(6, 12);
      var extra = level === 3 ? rnd.int(1, shelves - 1) : 0;
      var total = shelves * perShelf + extra;

      return {
        story: "کتاب‌های کتابخانه روی زمین ریخته‌اند.",
        stem: total + " کتاب داریم و می‌خواهیم روی " + shelves +
              " قفسه به‌طور مساوی بچینیم. روی هر قفسه چند کتاب می‌گذاریم؟" +
              (extra ? " (کتاب‌های اضافی روی میز می‌مانند.)" : ""),
        answer: perShelf,
        unit: "کتاب",
        hint1: "کل کتاب‌ها را بین قفسه‌ها پخش کن؛ یعنی تقسیم.",
        hint2: total + " ÷ " + shelves + " = ؟ " +
               (extra ? "دقت کن جواب ممکن است باقی‌مانده داشته باشد." : ""),
        solution: total + " ÷ " + shelves + " = " + perShelf +
                  (extra ? " و " + extra + " کتاب باقی می‌ماند." : "."),
        why: "چون تقسیم، تعداد کل را به گروه‌های برابر می‌شکند."
      };
    }
  });

  /* ============================================================
     ایستگاه ۴ — پارک و باغچه (کسر، الگو، ضرب)
     ============================================================ */

  B.add({
    id: "MATH_PARK_ROWS",
    subject: "ریاضی", skill: "math.multiply", skillName: "ضرب",
    topic: "ضرب در آرایش سطری", station: 4, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var flower = rnd.pick(P.flowers);
      var rows = level === 1 ? rnd.int(2, 4) : rnd.int(3, 7);
      var each = level === 1 ? rnd.int(3, 6) : rnd.int(4, 9);
      var total = rows * each;

      return {
        story: "عمو حسن باغچه را ردیف‌ردیف کاشته.",
        stem: "در باغچه " + rows + " ردیف " + flower.name + " هست و هر ردیف " + each +
              " گل دارد. همهٔ گل‌های باغچه چند تا هستند؟",
        answer: total,
        unit: "گل",
        visual: { kind: "grid", icon: flower.icon, rows: rows, cols: each },
        hint1: "به شکل نگاه کن: ردیف‌ها همه یک‌اندازه‌اند.",
        hint2: rows + " × " + each + " = ؟",
        solution: rows + " × " + each + " = " + total + " گل.",
        why: "چون در آرایش ردیفی، ضربِ تعداد ردیف در تعداد هر ردیف جواب می‌دهد."
      };
    }
  });

  B.add({
    id: "MATH_PARK_FRACTION_WATER",
    subject: "ریاضی", skill: "math.fraction", skillName: "کسر",
    topic: "کسر ساده", station: 4, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var parts = level === 1 ? rnd.pick([2, 4]) : rnd.pick([3, 4, 6, 8]);
      var done = rnd.int(1, parts - 1);
      var right = done + " از " + parts;

      return {
        story: "باغچه را به چند قسمت مساوی تقسیم کرده‌اند.",
        stem: "باغچه " + parts + " قسمت مساوی دارد و تو به " + done +
              " قسمت آب داده‌ای. چه کسری از باغچه آب خورده است؟",
        answer: right,
        choices: optsText(rnd, right, [
          (parts - done) + " از " + parts,     // خطای رایج: شمردن قسمت آب‌نخورده
          done + " از " + (parts - done),       // خطای رایج: مخرج اشتباه
          (done + 1) + " از " + parts
        ], [
          // ذخیره، برای وقتی که گزینه‌های بالا با هم یکی می‌شوند
          Math.max(1, done - 1) + " از " + parts,
          done + " از " + (parts + 1),
          parts + " از " + parts
        ]),
        visual: { kind: "fraction", parts: parts, filled: done },
        hint1: "عدد پایین کسر یعنی کل قسمت‌ها، عدد بالا یعنی قسمت‌هایی که انجام شده.",
        hint2: "کل قسمت‌ها " + parts + " تاست و " + done + " تا آب خورده.",
        solution: "پاسخ " + done + " از " + parts + " است؛ یعنی " + done + "/" + parts + ".",
        why: "چون در کسر، عدد پایین کل قسمت‌ها و عدد بالا قسمت‌های انجام‌شده است."
      };
    }
  });

  B.add({
    id: "MATH_PARK_FRACTION_COMPARE",
    subject: "ریاضی", skill: "math.fraction", skillName: "مقایسهٔ کسر",
    topic: "کسر", station: 4, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var den = rnd.pick([4, 6, 8]);
      var a = rnd.int(1, den - 2);
      var b = rnd.int(a + 1, den - 1);
      var bigger = b + " از " + den;

      return {
        story: "دو باغچه در پارک هست، هر کدام " + den + " قسمت مساوی.",
        stem: "در باغچهٔ اول " + a + " قسمت آب خورده و در باغچهٔ دوم " + b +
              " قسمت. کدام باغچه بیشتر آب خورده است؟",
        answer: "باغچهٔ دوم",
        choices: rnd.shuffle(["باغچهٔ اول", "باغچهٔ دوم", "هر دو برابرند"]),
        visual: { kind: "fraction-pair", den: den, a: a, b: b },
        hint1: "وقتی کل قسمت‌ها برابر است، فقط کافی است عددهای بالا را مقایسه کنی.",
        hint2: "کدام بزرگ‌تر است: " + a + " یا " + b + "؟",
        solution: b + " از " + den + " بیشتر از " + a + " از " + den +
                  " است، پس باغچهٔ دوم بیشتر آب خورده. (" + bigger + ")",
        why: "چون مخرج‌ها برابر بودند و فقط صورت‌ها را مقایسه کردی."
      };
    }
  });

  B.add({
    id: "MATH_PARK_PATTERN",
    subject: "ریاضی", skill: "math.pattern", skillName: "الگو",
    topic: "کشف الگو", station: 4, levels: [1, 2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var f = rnd.pickMany(P.flowers, 3);
      var seq, right, wrongList;

      if (level === 1) {
        // الگوی تکراری: الف ب الف ب …
        seq = [f[0], f[1], f[0], f[1], f[0]];
        right = f[1];
      } else if (level === 2) {
        // الگوی سه‌تایی
        seq = [f[0], f[1], f[2], f[0], f[1]];
        right = f[2];
      } else {
        // الگوی دوتاییِ اولی: الف الف ب الف الف
        seq = [f[0], f[0], f[1], f[0], f[0]];
        right = f[1];
      }
      wrongList = [f[0], f[1], f[2]].filter(function (x) { return x.name !== right.name; });

      return {
        story: "عمو حسن گل‌ها را با یک نظم خاص کاشته.",
        stem: "گل‌ها به این ترتیب کاشته شده‌اند. گل بعدی کدام است؟",
        answer: right.icon + " " + right.name,
        choices: rnd.shuffle(
          [right].concat(wrongList).slice(0, 3).map(function (x) { return x.icon + " " + x.name; })
        ),
        visual: { kind: "pattern", items: seq },
        hint1: "از اول نگاه کن؛ چه چیزی دارد تکرار می‌شود؟",
        hint2: "ترتیب تکرارشونده این است: " +
               seq.slice(0, level === 2 ? 3 : (level === 3 ? 3 : 2))
                  .map(function (x) { return x.name; }).join(" ← "),
        solution: "الگو تکرار می‌شود، پس گل بعدی " + right.name + " است.",
        why: "چون بخش تکرارشوندهٔ الگو را پیدا کردی و آن را ادامه دادی."
      };
    }
  });

  B.add({
    id: "MATH_PARK_TRASH_COUNT",
    subject: "ریاضی", skill: "math.add", skillName: "جمع",
    topic: "جمع چند عدد", station: 4, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 2 : 3;
      var bins = rnd.pickMany(P.bins, n);
      var counts = [], sum = 0, parts = [];
      for (var i = 0; i < n; i++) {
        var c = level === 1 ? rnd.int(5, 20) : rnd.int(10, 60);
        counts.push(c);
        sum += c;
        parts.push(c + " تا در سطل " + bins[i].name);
      }

      return {
        story: "زباله‌های پارک را جدا کردیم.",
        stem: "امروز در پارک این زباله‌ها را جمع کردیم: " + listText(parts) +
              ". روی هم چند زباله جمع شد؟",
        answer: sum,
        unit: "زباله",
        hint1: "همهٔ عددها را با هم جمع کن.",
        hint2: counts.join(" + ") + " = ؟",
        solution: counts.join(" + ") + " = " + sum + " زباله.",
        why: "چون برای پیدا کردن مجموع، عددها را جمع می‌کنیم."
      };
    }
  });

  /* ============================================================
     ایستگاه ۵ — خیابان و مسیر (طول، زمان، تقسیم)
     ============================================================ */

  B.add({
    id: "MATH_STREET_DISTANCE",
    subject: "ریاضی", skill: "math.measure", skillName: "اندازه‌گیری طول",
    topic: "جمع و تفریق طول", station: 5, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var place1 = rnd.pick(P.places);
      var place2 = rnd.pick(P.places);
      var d1 = level === 1 ? rnd.step(10, 50, 5) : rnd.step(80, 400, 10);
      var d2 = level === 1 ? rnd.step(10, 50, 5) : rnd.step(80, 400, 10);

      return {
        story: "باید دعوت‌نامه‌ها را به چند جا برسانیم.",
        stem: "از خانه تا " + place1.name + " " + d1 + " متر راه است و از آنجا تا " +
              place2.name + " " + d2 + " متر دیگر. روی هم چند متر راه می‌روی؟",
        answer: d1 + d2,
        unit: "متر",
        hint1: "دو تکه راه را پشت سر هم می‌روی، پس باید جمعشان کنی.",
        hint2: d1 + " + " + d2 + " = ؟",
        solution: d1 + " + " + d2 + " = " + (d1 + d2) + " متر.",
        why: "چون طول کل مسیر، جمع طول تکه‌های آن است."
      };
    }
  });

  B.add({
    id: "MATH_STREET_TIME",
    subject: "ریاضی", skill: "math.time", skillName: "زمان",
    topic: "محاسبهٔ زمان", station: 5, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var houses = rnd.int(3, 7);
      var perHouse = rnd.int(2, 6);
      var walk = level === 3 ? rnd.int(5, 15) : 0;
      var total = houses * perHouse + walk;

      return {
        story: "باید حساب کنیم کار چقدر طول می‌کشد.",
        stem: "برای هر خانه " + perHouse + " دقیقه وقت می‌گذاری و " + houses +
              " خانه در محله هست." + (walk ? " رفت‌وآمد هم " + walk + " دقیقه طول می‌کشد." : "") +
              " کل کار چند دقیقه طول می‌کشد؟",
        answer: total,
        unit: "دقیقه",
        hint1: "اول زمان همهٔ خانه‌ها را حساب کن" + (walk ? "، بعد زمان رفت‌وآمد را اضافه کن." : "."),
        hint2: houses + " × " + perHouse + " = " + (houses * perHouse) +
               (walk ? "، سپس + " + walk : "") + " = ؟",
        solution: houses + " × " + perHouse + " = " + (houses * perHouse) +
                  (walk ? " و " + (houses * perHouse) + " + " + walk + " = " + total : "") + " دقیقه.",
        why: "چون زمان‌های تکراری را ضرب کردی و زمان جداگانه را جمع."
      };
    }
  });

  B.add({
    id: "MATH_STREET_LETTERS",
    subject: "ریاضی", skill: "math.divide", skillName: "تقسیم",
    topic: "تقسیم مساوی", station: 5, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var friends = level === 1 ? rnd.int(2, 4) : rnd.int(3, 8);
      var each = level === 1 ? rnd.int(3, 8) : rnd.int(5, 12);
      var total = friends * each;

      return {
        story: "دعوت‌نامه‌ها را بین بچه‌ها پخش می‌کنیم.",
        stem: total + " دعوت‌نامه داریم و " + friends +
              " نفر هستید. اگر به‌طور مساوی تقسیم کنید، به هر نفر چند دعوت‌نامه می‌رسد؟",
        answer: each,
        unit: "دعوت‌نامه",
        hint1: "به‌طور مساوی یعنی تقسیم.",
        hint2: total + " ÷ " + friends + " = ؟",
        solution: total + " ÷ " + friends + " = " + each + " دعوت‌نامه برای هر نفر.",
        why: "چون سهم همه باید برابر باشد."
      };
    }
  });

  B.add({
    id: "MATH_STREET_MULTISTEP",
    subject: "ریاضی", skill: "math.multistep", skillName: "حل مسئلهٔ چندمرحله‌ای",
    topic: "مسیر و مسافت", station: 5, levels: [3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var go = rnd.step(100, 500, 10);
      var back = rnd.step(50, 300, 10);
      var trips = rnd.int(2, 4);
      var total = (go + back) * trips;

      return {
        story: "چند بار باید بین خانه و میدان رفت‌وبرگشت کنی.",
        stem: "از خانه تا میدان " + go + " متر است و برگشت از راه دیگری " + back +
              " متر. " + noise(rnd, ctx.name) + " اگر " + trips +
              " بار این رفت‌وبرگشت را انجام دهی، روی هم چند متر راه می‌روی؟",
        answer: total,
        unit: "متر",
        hint1: "اول حساب کن یک رفت‌وبرگشت چند متر است، بعد در تعداد دفعه‌ها ضرب کن.",
        hint2: go + " + " + back + " = " + (go + back) + "، سپس " +
               (go + back) + " × " + trips + " = ؟",
        solution: "(" + go + " + " + back + ") × " + trips + " = " + total + " متر.",
        why: "چون اول جمع کردی و بعد ضرب؛ ترتیب مرحله‌ها درست بود."
      };
    }
  });

  /* ============================================================
     ایستگاه ۶ — مرکز خدمات محله
     ============================================================ */

  B.add({
    id: "MATH_SERVICE_QUEUE",
    subject: "ریاضی", skill: "math.subtract", skillName: "تفریق",
    topic: "تفریق و زمان", station: 6, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var all = level === 1 ? rnd.int(10, 40) : rnd.int(40, 120);
      var done = level === 1 ? rnd.int(3, all - 2) : rnd.int(10, all - 5);

      return {
        story: "در درمانگاه محله نوبت‌ها روی تابلو نوشته شده.",
        stem: "امروز " + all + " نفر نوبت گرفته‌اند و تا حالا " + done +
              " نفر ویزیت شده‌اند. چند نفر هنوز منتظرند؟",
        answer: all - done,
        unit: "نفر",
        hint1: "از کل نوبت‌ها، آن‌هایی که تمام شده‌اند را کم کن.",
        hint2: all + " − " + done + " = ؟",
        solution: all + " − " + done + " = " + (all - done) + " نفر هنوز منتظرند.",
        why: "چون باقی‌مانده را با تفریق پیدا می‌کنیم."
      };
    }
  });

  /* ============================================================
     ایستگاه ۷ — میدان و جشن (محیط، مساحت، چیدمان)
     ============================================================ */

  B.add({
    id: "MATH_SQUARE_PERIMETER",
    subject: "ریاضی", skill: "math.perimeter", skillName: "محیط",
    topic: "محیط مستطیل", station: 7, levels: [1, 2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var w = level === 1 ? rnd.int(3, 9) : rnd.int(8, 25);
      var h = level === 1 ? rnd.int(3, 9) : rnd.int(6, 20);
      var per = 2 * (w + h);

      return {
        story: "می‌خواهیم ریسهٔ چراغانی را دور تا دور میدان بکشیم.",
        stem: "میدان مستطیلی است؛ درازای آن " + w + " متر و پهنای آن " + h +
              " متر است. برای دور تا دور میدان چند متر ریسه لازم داریم؟",
        answer: per,
        unit: "متر",
        visual: { kind: "rect", w: w, h: h, mode: "perimeter" },
        hint1: "ریسه دور تا دور می‌رود، پس باید طول هر چهار ضلع را جمع کنی.",
        hint2: w + " + " + h + " + " + w + " + " + h + " = ؟ یا کوتاه‌تر: ۲ × (" + w + " + " + h + ")",
        solution: "۲ × (" + w + " + " + h + ") = " + per + " متر.",
        why: "چون محیط یعنی مجموع طول همهٔ ضلع‌ها."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_AREA",
    subject: "ریاضی", skill: "math.area", skillName: "مساحت",
    topic: "مساحت مستطیل", station: 7, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var w = rnd.int(3, level === 3 ? 12 : 8);
      var h = rnd.int(2, level === 3 ? 10 : 7);
      var area = w * h;

      return {
        story: "باید کف میدان را فرش کنیم.",
        stem: "کف میدان مستطیلی به درازای " + w + " متر و پهنای " + h +
              " متر است. برای پوشاندن کامل کف، چند متر مربع فرش لازم است؟",
        answer: area,
        unit: "متر مربع",
        visual: { kind: "rect", w: w, h: h, mode: "area" },
        hint1: "مساحت یعنی مقدار سطحی که پوشانده می‌شود، نه دور آن.",
        hint2: w + " × " + h + " = ؟",
        solution: w + " × " + h + " = " + area + " متر مربع.",
        why: "چون مساحت مستطیل از ضرب درازا در پهنا به دست می‌آید."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_PERIMETER_AREA",
    subject: "ریاضی", skill: "math.multistep", skillName: "محیط و مساحت با هم",
    topic: "تشخیص محیط از مساحت", station: 7, levels: [3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var w = rnd.int(4, 12);
      var h = rnd.int(3, 10);
      var wantArea = rnd.chance(0.5);
      var right = wantArea ? (w * h) : (2 * (w + h));
      var wrong = wantArea ? (2 * (w + h)) : (w * h);

      return {
        story: "دو کار مانده: فرش کف میدان و ریسه دور میدان.",
        stem: "میدان " + w + " متر در " + h + " متر است. " +
              (wantArea ? "برای فرش کردن کف میدان چند متر مربع فرش لازم است؟"
                        : "برای ریسه دور تا دور میدان چند متر ریسه لازم است؟"),
        answer: String(right),
        choices: opts(rnd, right, [wrong, w + h, w * h + w]),
        unit: wantArea ? "متر مربع" : "متر",
        visual: { kind: "rect", w: w, h: h, mode: wantArea ? "area" : "perimeter" },
        hint1: wantArea ? "فرش روی کف پهن می‌شود، یعنی سطح را می‌پوشاند."
                        : "ریسه دور تا دور می‌رود، یعنی طول ضلع‌ها.",
        hint2: wantArea ? "برای سطح: درازا × پهنا" : "برای دور: ۲ × (درازا + پهنا)",
        solution: wantArea ? (w + " × " + h + " = " + right + " متر مربع")
                           : ("۲ × (" + w + " + " + h + ") = " + right + " متر"),
        why: "چون درست تشخیص دادی که این مسئله دربارهٔ " +
             (wantArea ? "مساحت" : "محیط") + " است."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_CHAIRS",
    subject: "ریاضی", skill: "math.multiply", skillName: "ضرب و چیدمان",
    topic: "ضرب", station: 7, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var rows = level === 1 ? rnd.int(3, 6) : rnd.int(4, 9);
      var perRow = level === 1 ? rnd.int(4, 8) : rnd.int(6, 12);
      var total = rows * perRow;

      return {
        story: "صندلی‌های جشن باید ردیف‌به‌ردیف چیده شوند.",
        stem: "می‌خواهیم " + rows + " ردیف صندلی بچینیم و در هر ردیف " + perRow +
              " صندلی بگذاریم. روی هم چند صندلی لازم داریم؟",
        answer: total,
        unit: "صندلی",
        visual: { kind: "grid", icon: "🪑", rows: rows, cols: perRow },
        hint1: "ردیف‌ها همه یک‌اندازه‌اند، پس لازم نیست یکی‌یکی بشماری.",
        hint2: rows + " × " + perRow + " = ؟",
        solution: rows + " × " + perRow + " = " + total + " صندلی.",
        why: "چون در چیدمان ردیفی، ضرب سریع‌ترین راه است."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_GUESTS_REMAINDER",
    subject: "ریاضی", skill: "math.divide", skillName: "تقسیم با باقی‌مانده",
    topic: "تقسیم", station: 7, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var food = rnd.pick(P.partyFood);
      var boxes = rnd.int(3, 8);
      var total = boxes * food.perBox;
      var guests = rnd.int(6, 14);
      var each = Math.floor(total / guests);

      return {
        story: "شیرینی‌های جشن را آورده‌اند.",
        stem: boxes + " جعبه " + food.name + " داریم و در هر جعبه " + food.perBox +
              " تا هست. اگر بین " + guests +
              " مهمان به‌طور مساوی پخش کنیم، به هر نفر چند تا می‌رسد؟ " +
              "(اضافه‌ها در جعبه می‌مانند.)",
        answer: each,
        unit: "تا",
        hint1: "اول باید بفهمی روی هم چند تا داریم، بعد بین مهمان‌ها تقسیم کنی.",
        hint2: boxes + " × " + food.perBox + " = " + total + "، سپس " +
               total + " ÷ " + guests + " = ؟",
        solution: boxes + " × " + food.perBox + " = " + total + "، سپس " +
                  total + " ÷ " + guests + " = " + each +
                  " و " + (total - each * guests) + " تا اضافه می‌ماند.",
        why: "چون اول ضرب کردی و بعد تقسیم؛ و باقی‌مانده را هم درست فهمیدی."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_PATTERN_FLAGS",
    subject: "ریاضی", skill: "math.pattern", skillName: "الگوی عددی",
    topic: "الگوی عددی", station: 7, levels: [2, 3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var start = rnd.int(2, 9);
      var stepv = level === 2 ? rnd.int(2, 5) : rnd.int(3, 9);
      var seq = [start, start + stepv, start + 2 * stepv, start + 3 * stepv];
      var next = start + 4 * stepv;

      return {
        story: "پرچم‌های جشن را با یک نظم عددی روی ریسه می‌بندند.",
        stem: "تعداد پرچم‌های هر ریسه این‌طور پیش می‌رود: " + seq.join("، ") +
              "، … ریسهٔ بعدی چند پرچم دارد؟",
        answer: next,
        unit: "پرچم",
        visual: { kind: "sequence", items: seq },
        hint1: "ببین از هر عدد به عدد بعدی چقدر اضافه می‌شود.",
        hint2: "هر بار " + stepv + " تا اضافه می‌شود. آخرین عدد " + seq[3] + " است.",
        solution: seq[3] + " + " + stepv + " = " + next + " پرچم.",
        why: "چون قاعدهٔ الگو را پیدا کردی و آن را ادامه دادی."
      };
    }
  });

  B.add({
    id: "MATH_SQUARE_CARPET_FIT",
    subject: "ریاضی", skill: "math.area", skillName: "مساحت و تقسیم",
    topic: "مساحت", station: 7, levels: [3],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var pieceW = rnd.int(2, 4);
      var pieceH = rnd.int(2, 3);
      var count = rnd.int(3, 8);
      var area = pieceW * pieceH * count;

      return {
        story: "فرش‌ها را تکه‌تکه آورده‌اند.",
        stem: count + " تکه فرش داریم و هر تکه " + pieceW + " متر در " + pieceH +
              " متر است. اگر همه را کنار هم پهن کنیم، روی هم چند متر مربع از میدان پوشیده می‌شود؟",
        answer: area,
        unit: "متر مربع",
        hint1: "اول مساحت یک تکه را حساب کن، بعد در تعداد تکه‌ها ضرب کن.",
        hint2: pieceW + " × " + pieceH + " = " + (pieceW * pieceH) + "، سپس × " + count + " = ؟",
        solution: "(" + pieceW + " × " + pieceH + ") × " + count + " = " + area + " متر مربع.",
        why: "چون مساحت کل، مجموع مساحت تکه‌های یک‌اندازه است."
      };
    }
  });

  /* ============================================================
     الگوهای تعاملی (کشیدن، مرتب‌سازی، جفت‌کردن)
     ============================================================ */

  B.add({
    id: "MATH_ORDER_PRICES",
    subject: "ریاضی", skill: "math.compare", skillName: "مرتب‌کردن عددها",
    topic: "مقایسهٔ عددها", station: 2, levels: [1, 2, 3],
    interaction: "order",
    generate: function (level, rnd, ctx) {
      var n = level === 1 ? 3 : (level === 2 ? 4 : 5);
      var items = rnd.pickMany(P.goods.concat(P.fruits), n);
      var sorted = items.slice().sort(function (a, b) { return a.price - b.price; });

      return {
        story: "خانم رضایی می‌خواهد قیمت‌ها را روی تابلو مرتب بنویسد.",
        stem: "کالاها را از ارزان‌ترین به گران‌ترین مرتب کن.",
        items: sorted.map(function (g) {
          return { id: g.name, label: g.icon + " " + g.name + " — " + money(g.price) };
        }),
        hint1: "دنبال کوچک‌ترین عدد بگرد و آن را اول بگذار.",
        hint2: "قیمت‌ها این‌ها هستند: " + items.map(function (g) { return g.price; }).join("، "),
        solution: "ترتیب درست: " + sorted.map(function (g) { return g.name; }).join(" ← "),
        why: "چون عددها را درست با هم مقایسه کردی."
      };
    }
  });

  B.add({
    id: "MATH_DRAG_BINS_COUNT",
    subject: "ریاضی", skill: "math.divide", skillName: "دسته‌بندی و شمارش",
    topic: "گروه‌بندی", station: 4, levels: [1, 2],
    interaction: "drag",
    generate: function (level, rnd, ctx) {
      var groups = level === 1 ? 2 : 3;
      var perGroup = rnd.int(2, 4);
      var bins = rnd.pickMany(P.bins, groups);
      var items = [], i, j;

      for (i = 0; i < groups; i++) {
        var pool = P.recyclables.filter(function (r) { return r.bin === bins[i].name; });
        var picked = rnd.pickMany(pool, Math.min(perGroup, pool.length));
        for (j = 0; j < picked.length; j++) {
          items.push({
            id: bins[i].name + "-" + j,
            label: picked[j].icon + " " + picked[j].name,
            zone: bins[i].name
          });
        }
      }

      return {
        story: "زباله‌های پارک باید در سطل درست بروند.",
        stem: "هر زباله را به سطل خودش بکش. بعد می‌شماریم هر سطل چند تا شد.",
        items: rnd.shuffle(items),
        zones: bins.map(function (b) {
          return { id: b.name, label: b.icon + " " + b.name };
        }),
        hint1: "به جنس هر چیز فکر کن: کاغذ است؟ پلاستیک؟ فلز؟ شیشه؟",
        hint2: "مثلاً روزنامه و جعبهٔ مقوایی هر دو کاغذی هستند.",
        solution: "هر زباله باید در سطل هم‌جنس خودش برود.",
        why: "چون جنس هر زباله را درست تشخیص دادی و گروه‌بندی کردی."
      };
    }
  });

  B.add({
    id: "MATH_MATCH_OPERATION",
    subject: "ریاضی", skill: "math.multistep", skillName: "تشخیص عمل درست",
    topic: "انتخاب عمل ریاضی", station: 2, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var kinds = [
        { text: "۵ بستهٔ ۴تایی مداد داریم. همهٔ مدادها چند تاست؟", op: "ضرب" },
        { text: "۲۰ شیرینی را بین ۴ بچه پخش می‌کنیم. به هرکدام چند تا می‌رسد؟", op: "تقسیم" },
        { text: "۱۵ هزار تومان داشتی و ۶ هزار تومان خرج کردی. چقدر مانده؟", op: "تفریق" },
        { text: "۷ سیب و ۸ پرتقال داریم. روی هم چند میوه داریم؟", op: "جمع" }
      ];
      var q = rnd.pick(kinds);

      return {
        story: "قبل از حساب کردن، باید بدانیم چه عملی لازم است.",
        stem: "برای حل این مسئله از کدام عمل استفاده می‌کنیم؟ « " + q.text + " »",
        answer: q.op,
        choices: rnd.shuffle(["جمع", "تفریق", "ضرب", "تقسیم"]),
        hint1: "به کلمه‌های مسئله دقت کن: «روی هم»، «مانده»، «پخش کردن»، «هر بسته».",
        hint2: "«پخش کردن مساوی» یعنی تقسیم و «چند تای یک‌اندازه» یعنی ضرب.",
        solution: "پاسخ درست «" + q.op + "» است.",
        why: "چون پیش از حساب کردن، فهمیدی چه کاری لازم است — این مهم‌ترین قدم حل مسئله است."
      };
    }
  });

  B.add({
    id: "MATH_MENTAL_ROUND",
    subject: "ریاضی", skill: "math.mental", skillName: "محاسبهٔ ذهنی",
    topic: "تخمین و محاسبهٔ ذهنی", station: 2, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var a = rnd.step(20, 90, 10) + rnd.int(1, 9);
      var b = rnd.step(20, 90, 10) + rnd.int(1, 9);
      var exact = a + b;
      var approx = Math.round(a / 10) * 10 + Math.round(b / 10) * 10;

      return {
        story: "گاهی لازم نیست دقیق حساب کنیم؛ تخمین کافی است.",
        stem: "می‌خواهی سریع بفهمی " + a + " + " + b +
              " تقریباً چند می‌شود. کدام تخمین به جواب نزدیک‌تر است؟",
        answer: String(approx),
        choices: opts(rnd, approx, [approx + 20, approx - 20, approx + 50]),
        hint1: "هر عدد را به نزدیک‌ترین دهگان گرد کن، بعد جمع کن.",
        hint2: a + " ≈ " + (Math.round(a / 10) * 10) + " و " + b + " ≈ " +
               (Math.round(b / 10) * 10),
        solution: "با گرد کردن: " + (Math.round(a / 10) * 10) + " + " +
                  (Math.round(b / 10) * 10) + " = " + approx +
                  ". جواب دقیق " + exact + " است، پس تخمین خوبی بود.",
        why: "چون با گرد کردن، سریع به جوابی نزدیک به جواب دقیق رسیدی."
      };
    }
  });

  B.add({
    id: "MATH_HALF_DOUBLE",
    subject: "ریاضی", skill: "math.fraction", skillName: "نصف و دو برابر",
    topic: "نصف و دو برابر", station: 4, levels: [1, 2],
    interaction: "numpad",
    generate: function (level, rnd, ctx) {
      var half = rnd.chance(0.5);
      var base = level === 1 ? rnd.int(2, 10) * 2 : rnd.int(10, 40) * 2;
      var flower = rnd.pick(P.flowers);
      var answer = half ? base / 2 : base * 2;

      return {
        story: "باغچه را باید دوباره بکاریم.",
        stem: "پارسال " + base + " " + flower.name + " کاشته بودیم. امسال " +
              (half ? "نصف" : "دو برابر") + " پارسال می‌کاریم. امسال چند گل می‌کاریم؟",
        answer: answer,
        unit: "گل",
        hint1: half ? "نصف یعنی عدد را به دو قسمت مساوی بشکن."
                    : "دو برابر یعنی عدد را دو بار بردار.",
        hint2: half ? (base + " ÷ ۲ = ؟") : (base + " × ۲ = ؟"),
        solution: half ? (base + " ÷ ۲ = " + answer) : (base + " × ۲ = " + answer),
        why: half ? "چون نصف کردن همان تقسیم بر ۲ است."
                  : "چون دو برابر کردن همان ضرب در ۲ است."
      };
    }
  });

  B.add({
    id: "MATH_MONEY_ENOUGH",
    subject: "ریاضی", skill: "math.money", skillName: "کافی بودن پول",
    topic: "تصمیم‌گیری با پول", station: 2, levels: [2, 3],
    interaction: "choice",
    generate: function (level, rnd, ctx) {
      var items = rnd.pickMany(P.goods, 3);
      var sum = 0;
      for (var i = 0; i < items.length; i++) { sum += items[i].price; }

      // سه حالت: پول بیشتر، دقیقاً برابر، یا کمتر
      // گزینهٔ «دقیقاً به‌اندازه» باعث می‌شود حدس‌زدن جواب ندهد
      var mode = rnd.int(0, 2);
      var purse = mode === 0 ? sum + rnd.int(2, 15)
                : (mode === 1 ? sum : sum - rnd.int(1, 10));
      var right = mode === 0 ? "بله، پولم بیشتر است"
                : (mode === 1 ? "دقیقاً به‌اندازه است" : "نه، کم می‌آورم");

      return {
        story: "پول توی جیبت محدود است.",
        stem: money(purse) + " داری و می‌خواهی این‌ها را بخری: " +
              items.map(function (g) { return g.name + " " + money(g.price); }).join("، ") +
              ". پولت کافی است؟",
        answer: right,
        choices: rnd.shuffle([
          "بله، پولم بیشتر است",
          "دقیقاً به‌اندازه است",
          "نه، کم می‌آورم"
        ]),
        hint1: "اول جمع خرید را حساب کن، بعد با پولت مقایسه کن.",
        hint2: items.map(function (g) { return g.price; }).join(" + ") + " = " + sum +
               "؛ حالا با " + purse + " مقایسه کن.",
        solution: "جمع خرید " + money(sum) + " است و تو " + money(purse) + " داری، پس " +
                  (mode === 0 ? "پولت بیشتر است." :
                   (mode === 1 ? "دقیقاً به‌اندازه است." : "کم می‌آوری.")),
        why: "چون اول جمع زدی و بعد مقایسه کردی؛ همین کار را در خرید واقعی هم می‌کنیم."
      };
    }
  });

})();
