/* ============================================================
   قهرمانان محلهٔ آفتاب
   js/ui/components.js — ابزارهای مشترک رابط کاربری

   هر چیزی که در چند صفحه تکرار می‌شود اینجاست: ساخت عنصر،
   پیام کوتاه، پنجرهٔ گفت‌وگو، ستاره‌ها و انیمیشن سکه.

   ── چرا اینجا؟ ──
   اگر هر صفحه پنجره و پیام خودش را بسازد، ظاهر بازی یکدست
   نمی‌ماند و کد تکراری می‌شود. همهٔ صفحه‌ها از همین توابع
   استفاده می‌کنند.

   وابستگی: APP.Audio (اختیاری)
   ============================================================ */

var APP = APP || {};

APP.UI = (function () {
  "use strict";

  var toastTimer = null;
  var lastFocus = null;

  /* ============================================================
     ۱. ابزار کار با صفحه
     ============================================================ */

  /** گرفتن عنصر با شناسه */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * ساخت یک عنصر تازه.
   * @param {string} tag نام تگ
   * @param {string} [cls] کلاس‌ها
   * @param {string} [text] متن داخل
   */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  }

  /** خالی‌کردن یک عنصر */
  function clear(node) {
    if (!node) { return; }
    while (node.firstChild) { node.removeChild(node.firstChild); }
    return node;
  }

  /** افزودن چند فرزند با هم */
  function add(parent, children) {
    if (!parent) { return parent; }
    for (var i = 0; i < children.length; i++) {
      if (children[i]) { parent.appendChild(children[i]); }
    }
    return parent;
  }

  /** شنیدن رویداد با صدای کلیک خودکار برای دکمه‌ها */
  function onTap(node, fn) {
    if (!node) { return; }
    node.addEventListener("click", function (ev) {
      if (APP.Audio) { APP.Audio.click(); }
      fn(ev);
    });
  }

  /** گوش‌دادن به هر رویدادی (غیر از کلیک، که onTap دارد) */
  function on(node, evt, fn, opts) {
    if (!node) { return; }
    node.addEventListener(evt, fn, opts || false);
    return fn;
  }

  /** روشن یا خاموش‌کردن یک کلاس */
  function toggleClass(node, cls, state) {
    if (!node) { return; }
    if (state) { node.classList.add(cls); } else { node.classList.remove(cls); }
  }

  /** پرش کوتاه یک عنصر برای جلب توجه */
  function bump(node) {
    if (!node) { return; }
    node.classList.remove("is-bumping");
    void node.offsetWidth;
    node.classList.add("is-bumping");
  }

  /** تکان نرم برای پاسخ نادرست — بدون رنگ قرمز */
  function nudge(node) {
    if (!node) { return; }
    node.classList.remove("is-nudging");
    void node.offsetWidth;
    node.classList.add("is-nudging");
  }

  /** خواندن یک پیام برای صفحه‌خوان */
  function announce(text) {
    if (APP.Router) { APP.Router.announce(text); }
  }

  /* ============================================================
     ۲. عدد فارسی
     ============================================================ */

  var FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  /**
   * تبدیل رقم‌های لاتین به فارسی.
   * فونت بازی خودش رقم‌ها را فارسی نشان می‌دهد، ولی برای متنی
   * که روی بوم نقاشی یا در برچسب صفحه‌خوان می‌رود، به تبدیل
   * واقعی نیاز داریم.
   */
  function fa(value) {
    var s = String(value), out = "", ch;
    for (var i = 0; i < s.length; i++) {
      ch = s.charAt(i);
      out += (ch >= "0" && ch <= "9") ? FA_DIGITS.charAt(+ch) : ch;
    }
    return out;
  }

  /* ============================================================
     ۳. ستاره‌ها
     ============================================================ */

  /**
   * رشتهٔ ستاره‌ها.
   * @param {number} n تعداد ستارهٔ پر
   * @param {number} [max] تعداد کل، پیش‌فرض ۳
   */
  function starText(n, max) {
    max = max || 3;
    var out = "";
    for (var i = 0; i < max; i++) { out += (i < n) ? "★" : "☆"; }
    return out;
  }

  /** ساخت ستاره‌ها به شکل عنصر، با ظاهر شدن یکی‌یکی */
  function starRow(n, max) {
    max = max || 3;
    var box = el("div", "modal__stars");
    for (var i = 0; i < max; i++) {
      var s = el("span", "", i < n ? "⭐" : "☆");
      s.style.animation = "pop-in 300ms var(--ease-pop) both";
      s.style.animationDelay = (i * 220) + "ms";
      box.appendChild(s);
    }
    return box;
  }

  /* ============================================================
     ۴. پیام کوتاه شناور
     ============================================================ */

  /**
   * نمایش پیام کوتاه.
   * @param {string} text متن
   * @param {number} [ms] چند میلی‌ثانیه بماند
   */
  function toast(text, ms) {
    var box = $("toast");
    if (!box) { return; }

    box.textContent = text;
    box.hidden = false;
    box.style.animation = "none";
    void box.offsetWidth;
    box.style.animation = "";

    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () {
      box.hidden = true;
      toastTimer = null;
    }, ms || 2600);
  }

  /* ============================================================
     ۵. پنجرهٔ گفت‌وگو
     ============================================================ */

  /**
   * نمایش پنجره.
   * @param {Object} conf {
   *   icon, title, text, stars,
   *   actions: [ { label, kind, onTap } ],
   *   dismissable: آیا با کلیک بیرون بسته شود
   * }
   */
  function dialog(conf) {
    var modal = $("dialog-modal");
    if (!modal) { return; }

    lastFocus = document.activeElement;

    $("dialog-icon").textContent = conf.icon || "";
    $("dialog-title").textContent = conf.title || "";
    $("dialog-text").textContent = conf.text || "";

    var starsBox = $("dialog-stars");
    clear(starsBox);
    if (typeof conf.stars === "number") {
      var row = starRow(conf.stars, conf.maxStars || 3);
      while (row.firstChild) { starsBox.appendChild(row.firstChild); }
    }

    var actions = clear($("dialog-actions"));
    var list = conf.actions || [{ label: "باشه" }];
    for (var i = 0; i < list.length; i++) {
      actions.appendChild(actionButton(list[i]));
    }

    modal.hidden = false;
    modal.dataset.dismissable = conf.dismissable === false ? "no" : "yes";

    // تمرکز روی اولین دکمه، برای کاربر صفحه‌کلید
    var first = actions.querySelector("button");
    if (first) {
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }
    trapFocus(modal);
    announce((conf.title || "") + " " + (conf.text || ""));
  }

  function actionButton(conf) {
    var kind = conf.kind || "primary";
    var btn = el("button", "btn btn--" + kind, conf.label || "باشه");
    btn.type = "button";
    onTap(btn, function () {
      closeDialog();
      if (typeof conf.onTap === "function") { conf.onTap(); }
    });
    return btn;
  }

  function closeDialog() {
    var modal = $("dialog-modal");
    if (!modal || modal.hidden) { return; }
    modal.hidden = true;
    releaseFocus();
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* بی‌اهمیت */ }
    }
    lastFocus = null;
  }

  /* ============================================================
     ۶. نگه‌داشتن تمرکز داخل پنجره (دسترسی‌پذیری)
     ============================================================ */

  var trapped = null;

  function trapFocus(modal) {
    trapped = modal;
    document.addEventListener("keydown", onTrapKey, true);
  }

  function releaseFocus() {
    trapped = null;
    document.removeEventListener("keydown", onTrapKey, true);
  }

  function onTrapKey(ev) {
    if (!trapped || trapped.hidden) { return; }

    if (ev.key === "Escape") {
      if (trapped.dataset.dismissable !== "no") {
        ev.preventDefault();
        if (trapped.id === "dialog-modal") { closeDialog(); }
        else { trapped.hidden = true; releaseFocus(); }
      }
      return;
    }

    if (ev.key !== "Tab") { return; }

    var focusables = trapped.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables.length) { return; }

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  /* ============================================================
     ۷. انیمیشن سکه
     ============================================================ */

  /**
   * پرواز سکه از یک نقطه به سمت بالا.
   * @param {Element} fromEl عنصری که سکه از آن شروع می‌شود
   * @param {number} count چند سکه
   */
  function coinFly(fromEl, count) {
    if (!fromEl || reducedMotion()) { return; }

    var rect = fromEl.getBoundingClientRect();
    var n = Math.min(count || 1, 5);

    for (var i = 0; i < n; i++) {
      (function (index) {
        setTimeout(function () {
          var coin = el("span", "coin-fly", "🪙");
          coin.style.left = (rect.left + rect.width / 2 - 12 + (index * 8 - 16)) + "px";
          coin.style.top = (rect.top + rect.height / 2 - 12) + "px";
          document.body.appendChild(coin);
          setTimeout(function () {
            if (coin.parentNode) { coin.parentNode.removeChild(coin); }
          }, 950);
        }, index * 110);
      })(i);
    }
  }

  /** آیا کاربر کاهش حرکت را خواسته است */
  function reducedMotion() {
    if (APP.State && APP.State.data.settings.reducedMotion) { return true; }
    if (!window.matchMedia) { return false; }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ============================================================
     ۸. کارت‌های کوچک تکرارشونده
     ============================================================ */

  /** ساخت یک نشان برای کارنامه */
  function badgeCard(badge, owned) {
    var card = el("li", "badge" + (owned ? "" : " is-locked"));
    card.appendChild(el("span", "badge__icon", owned ? badge.icon : "🔒"));
    card.appendChild(el("span", "badge__name", badge.name));
    card.title = owned ? badge.desc : "هنوز به دستش نیاورده‌ای";
    return card;
  }

  /** نوار مهارت برای کارنامه */
  function skillBar(name, score, tone) {
    var row = el("li", "skill-bar");
    row.appendChild(el("span", "skill-bar__name", name));
    row.appendChild(el("span", "skill-bar__value", fa(score) + "٪"));

    var track = el("div", "skill-bar__track");
    var fill = el("div", "skill-bar__fill");
    fill.setAttribute("data-tone", tone || "mid");
    track.appendChild(fill);
    row.appendChild(track);

    // پر شدن نوار با کمی تأخیر، تا حرکتش دیده شود
    setTimeout(function () { fill.style.width = score + "%"; }, 120);

    row.setAttribute("role", "img");
    row.setAttribute("aria-label", name + ": " + fa(score) + " درصد");
    return row;
  }

  /* ============================================================
     خروجی
     ============================================================ */

  return {
    $: $,
    el: el,
    clear: clear,
    add: add,
    onTap: onTap,
    on: on,
    toggleClass: toggleClass,
    bump: bump,
    nudge: nudge,
    announce: announce,
    fa: fa,
    starText: starText,
    starRow: starRow,
    toast: toast,
    dialog: dialog,
    closeDialog: closeDialog,
    coinFly: coinFly,
    reducedMotion: reducedMotion,
    badgeCard: badgeCard,
    skillBar: skillBar
  };
})();
