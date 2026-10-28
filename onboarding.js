(() => {
  'use strict';

  const SETTINGS_KEY = 'subly-settings-v1';
  const LANG_KEY = 'subly-language-v1';
  const TOUR_KEY = 'subly-onboarding-complete-v1';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const RU_EN = new Map(Object.entries({
    'Подписки':'Subscriptions','В месяц уходит':'Monthly spending','Все':'All','Скоро':'Due soon',
    'Просрочено':'Overdue','Обзор':'Overview','Куда уходят деньги':'Where your money goes',
    'Настройки':'Settings','Всё хранится на этом устройстве':'Everything stays on this device',
    'Тема':'Theme','Шрифт':'Font','Иконки сервисов':'Service icons','Валюта по умолчанию':'Default currency',
    'Напоминания':'Reminders','О скором списании':'Upcoming payments','Напоминания о предстоящих списаниях':'Reminders for upcoming payments',
    'Данные':'Data','Сохранить копию':'Export backup','Файл JSON со всеми подписками':'JSON file with all subscriptions',
    'Загрузить из копии':'Import backup','Заменит текущий список':'Replaces the current list',
    'Удалить все подписки':'Delete all subscriptions','Это действие нельзя отменить':'This cannot be undone',
    'Subly — личный учёт подписок':'Subly — your personal subscription tracker',
    'Новая подписка':'New subscription','Закрыть':'Close','Название':'Name','Например, Spotify':'For example, Spotify',
    'Иконка':'Icon','Цвет':'Color','Сколько платите':'Price','Как часто':'Billing frequency',
    'Следующее списание':'Next payment','Сегодня':'Today','Завтра':'Tomorrow','+ неделя':'+ week','+ месяц':'+ month',
    'Добавить':'Add','Сохранить':'Save','Оплачено':'Paid','Удалить':'Delete','Отмена':'Cancel','Да':'Yes',
    'Пока пусто':'Nothing here yet','Добавьте первую подписку — Subly покажет, сколько она стоит и когда спишут деньги.':'Add your first subscription to see its cost and next payment in Subly.',
    'Добавить подписку':'Add subscription','Тихая неделя':'A quiet week',
    'В ближайшие 7 дней ничего не спишется.':'No payments are due in the next 7 days.',
    'Просрочек нет':'Nothing overdue','Все даты списаний впереди.':'All upcoming payment dates are still ahead.',
    'Чернила':'Ink','Молоко':'Milk','Вишня':'Cherry','Хвоя':'Pine','Сирень':'Lilac','Уголь':'Charcoal',
    'Системный':'System','Округлый':'Rounded','С засечками':'Serif','Мягкие':'Soft','Яркие':'Bold',
    'В год':'per year','Добавьте подписку, чтобы увидеть траты':'Add a subscription to see your spending',
    'Ближайшее списание':'Next payment','Нажмите, чтобы изменить':'Tap to edit',
    'Показать больше сервисов':'Show more services','Выберите дату':'Choose a date',
    'Подписка удалена':'Subscription deleted','Вернуть':'Undo','Отменить':'Undo',
    'Оплачено — платёж убран из списка':'Marked as paid — payment removed from the list',
    'Ваша подписка':'Your subscription',
    // aria-label и прочее из index.html
    'Цена':'Price','Валюта':'Currency','Фильтр списка':'List filter','Разделы':'Sections',
    'Подсказки сервисов':'Service suggestions','Изменить иконку':'Change icon',
    'Быстрый выбор даты':'Quick date picker','Дата списания':'Payment date',
    'Неделя':'Week','Месяц':'Month','Год':'Year','Разово':'One-time'
  }));

  const STRINGS = {
    ru: {
      language: 'Язык', languageHint: 'Выберите язык интерфейса',
      welcomeEyebrow: 'ДАВАЙТЕ НАСТРОИМ SUBLY', welcomeTitle: 'Добро пожаловать в Subly',
      welcomeText: 'Subly помогает следить за подписками, предстоящими списаниями и общими расходами — всё в одном месте.',
      choose: 'Выберите язык', russian: 'Русский', english: 'English', next: 'Далее', back: 'Назад',
      skip: 'Пропустить обучение', finish: 'Закончить обучение', step: 'Шаг',
      homeTitle: 'Ваши подписки', homeText: 'Здесь собраны ваши подписки и ближайшие списания. Нажмите «+», чтобы добавить первую.',
      addTitle: 'Создаём подписку', nameText: 'Введите название сервиса, например Spotify или YouTube Premium.',
      priceText: 'Укажите цену подписки и выберите валюту.',
      periodText: 'Выберите, как часто вы платите: каждую неделю, месяц, год или разово.',
      dateText: 'Укажите дату следующего списания. Subly будет показывать, сколько осталось до оплаты.',
      saveText: 'Сохраните подписку, чтобы она появилась в вашем списке.',
      statsTitle: 'Ваш обзор', statsText: 'В разделе «Обзор» собрана статистика расходов. Здесь можно оценить траты и понять, сколько уходит на подписки.',
      settingsTitle: 'Настройки под вас', settingsText: 'Здесь можно сменить тему, шрифт, язык, валюту и настроить напоминания.',
      finishTitle: 'Всё готово!', finishText: 'Теперь вы можете управлять подписками в Subly. Настройки всегда доступны в нижнем меню.',
      progress: 'обучение',
      restartTitle: 'Пройти обучение заново', restartHint: 'Повторить знакомство с Subly'
    },
    en: {
      language: 'Language', languageHint: 'Choose the interface language',
      welcomeEyebrow: 'LET’S SET UP SUBLY', welcomeTitle: 'Welcome to Subly',
      welcomeText: 'Subly helps you keep track of subscriptions, upcoming payments, and your total spending — all in one place.',
      choose: 'Choose your language', russian: 'Русский', english: 'English', next: 'Next', back: 'Back',
      skip: 'Skip tutorial', finish: 'Finish tutorial', step: 'Step',
      homeTitle: 'Your subscriptions', homeText: 'Your subscriptions and upcoming payments live here. Tap “+” to add your first one.',
      addTitle: 'Create a subscription', nameText: 'Enter the service name, for example Spotify or YouTube Premium.',
      priceText: 'Enter the subscription price and choose a currency.',
      periodText: 'Choose how often you pay: weekly, monthly, yearly, or one-time.',
      dateText: 'Choose the next payment date. Subly will show how long remains until payment.',
      saveText: 'Save the subscription to add it to your list.',
      statsTitle: 'Your overview', statsText: 'The Overview tab shows your spending statistics, helping you understand how much your subscriptions cost.',
      settingsTitle: 'Make it yours', settingsText: 'Change the theme, font, language, default currency, and reminder settings here.',
      finishTitle: 'You’re all set!', finishText: 'You can now manage your subscriptions in Subly. Settings are always available in the bottom menu.',
      progress: 'tutorial',
      restartTitle: 'Show tutorial again', restartHint: 'Replay the introduction to Subly'
    }
  };

  /* ---------- язык: определение и хранение ---------- */

  function readSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function detectLang() {
    const list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'ru'];
    const code = String(list[0]).slice(0, 2).toLowerCase();
    return ['ru', 'uk', 'be', 'kk'].includes(code) ? 'ru' : 'en';
  }

  function getLang() {
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY) || readSettings().language; } catch (_) {}
    return saved === 'ru' || saved === 'en' ? saved : detectLang();
  }

  let lang = getLang();
  let overlay = null;
  let stepIndex = 0;
  let tourMode = false;

  /* ---------- перевод DOM ---------- */

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  const lastWritten = new WeakMap();
  const tx = v => (lang === 'en' ? (RU_EN.get(v) || v) : v);

  function translateText(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    const trimmed = original.trim();
    if (!trimmed) return;
    const next = original.replace(trimmed, () => tx(trimmed));
    if (node.nodeValue !== next) node.nodeValue = next;
    lastWritten.set(node, next);
  }

  function translateAttrs(el) {
    let store = originalAttrs.get(el);
    for (const name of ['placeholder', 'aria-label']) {
      if (!el.hasAttribute(name)) continue;
      if (!store) originalAttrs.set(el, (store = {}));
      if (!(name in store)) store[name] = el.getAttribute(name);
      const next = tx(store[name]);
      if (el.getAttribute(name) !== next) el.setAttribute(name, next);
    }
  }

  function translateTree(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) return translateText(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateText);

    translateAttrs(root);
    $$('[placeholder],[aria-label]', root).forEach(translateAttrs);
  }

  function updateDate() {
    const el = $('#todayLabel');
    if (!el) return;
    const text = new Date().toLocaleDateString(
      lang === 'en' ? 'en-US' : 'ru-RU',
      { weekday: 'long', month: 'long', day: 'numeric' }
    );
    if (el.textContent !== text) el.textContent = text;
  }

  function setLanguage(next) {
    lang = next === 'en' ? 'en' : 'ru';

    try {
      localStorage.setItem(LANG_KEY, lang);
      const settings = readSettings();
      settings.language = lang;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}

    applyLanguage();
    if (overlay) renderStep();

    window.dispatchEvent(new CustomEvent('subly-language-changed', {
      detail: { language: lang }
    }));
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    translateTree(document.body);
    updateDate();
    updateLanguageSetting();
    updateRestartButton();
  }

  /* ---------- настройка языка ---------- */

  function addLanguageSetting() {
    const settingsPane = $('#paneSettings');
    if (!settingsPane || $('#sublyLanguageSetting')) return;

    const section = document.createElement('section');
    section.className = 'subly-language-setting';
    section.id = 'sublyLanguageSetting';

    section.innerHTML = `
      <h2 class="group-title" data-i18n="language">${STRINGS[lang].language}</h2>
      <div class="group subly-language-card">
        <div class="subly-language-copy">
          <b data-i18n="language">${STRINGS[lang].language}</b>
          <small data-i18n="languageHint">${STRINGS[lang].languageHint}</small>
        </div>
        <div class="subly-language-options" role="group" aria-label="Language">
          <button type="button" class="subly-lang-option" data-lang-choice="ru">🇷🇺 <span>Русский</span></button>
          <button type="button" class="subly-lang-option" data-lang-choice="en">🇬🇧 <span>English</span></button>
        </div>
      </div>`;

    const themeTitle = $$('h2.group-title', settingsPane).find(el => {
      const t = el.textContent.trim();
      return t === 'Тема' || t === 'Theme';
    });

    settingsPane.insertBefore(section, themeTitle || settingsPane.firstChild);

    section.addEventListener('click', e => {
      const button = e.target.closest('[data-lang-choice]');
      if (button) setLanguage(button.dataset.langChoice);
    });

    updateLanguageSetting();
  }

  function updateLanguageSetting() {
    const section = $('#sublyLanguageSetting');
    if (!section) return;

    const s = STRINGS[lang];

    $$('[data-i18n="language"]', section).forEach(el => { el.textContent = s.language; });

    const hint = $('[data-i18n="languageHint"]', section);
    if (hint) hint.textContent = s.languageHint;

    $$('[data-lang-choice]', section).forEach(btn => {
      const active = btn.dataset.langChoice === lang;
      btn.classList.toggle('selected', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  /* ---------- обучение ---------- */

  const FORM_STEPS = ['name', 'price', 'period', 'date', 'save'];

  const steps = [
    { type: 'language', titleKey: 'choose', text: 'languageHint' },
    { type: 'welcome', titleKey: 'welcomeTitle', text: 'welcomeText' },
    { type: 'home', titleKey: 'homeTitle', text: 'homeText', target: '#paneHome' },
    { type: 'name', titleKey: 'addTitle', text: 'nameText', target: '#fName' },
    { type: 'price', titleKey: 'addTitle', text: 'priceText', target: '#fPrice' },
    { type: 'period', titleKey: 'addTitle', text: 'periodText', target: '#fPeriod' },
    { type: 'date', titleKey: 'addTitle', text: 'dateText', target: '#fDate' },
    { type: 'save', titleKey: 'addTitle', text: 'saveText', target: '#fSave' },
    { type: 'stats', titleKey: 'statsTitle', text: 'statsText', target: '[data-tab="stats"]' },
    { type: 'settings', titleKey: 'settingsTitle', text: 'settingsText', target: '[data-tab="settings"]' },
    { type: 'finish', titleKey: 'finishTitle', text: 'finishText' }
  ];

  const clearHighlights = () =>
    $$('.subly-tour-highlight').forEach(el => el.classList.remove('subly-tour-highlight'));

  const closeSheet = () => {
    if ($('#sheetLayer')?.classList.contains('open')) $('#sheetClose')?.click();
  };

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'sublyTour';
    overlay.className = 'subly-tour';

    overlay.innerHTML = `
      <div class="subly-tour-backdrop"></div>
      <section class="subly-tour-card" role="dialog" aria-modal="true" aria-labelledby="sublyTourTitle">
        <div class="subly-tour-brand">
          <span class="subly-tour-mark">S</span>
          <span>SUBLY</span>
          <span class="subly-tour-step"></span>
        </div>
        <div class="subly-tour-content"></div>
        <div class="subly-tour-progress"><i></i></div>
        <div class="subly-tour-actions">
          <button type="button" class="subly-tour-skip"></button>
          <span class="subly-tour-spacer"></span>
          <button type="button" class="subly-tour-next"></button>
        </div>
      </section>`;

    document.body.appendChild(overlay);

    $('.subly-tour-skip', overlay).addEventListener('click', finishTour);
    $('.subly-tour-next', overlay).addEventListener('click', nextStep);
  }

  function titleText(key) {
    return STRINGS[lang][key] || key;
  }

  function switchTo(name) {
    const tab = $(`[data-tab="${name}"]`);
    if (tab && !tab.classList.contains('active')) tab.click();
  }

  function renderStep() {
    if (!overlay) createOverlay();

    const step = steps[stepIndex];
    const s = STRINGS[lang];
    const content = $('.subly-tour-content', overlay);
    const stepLabel = $('.subly-tour-step', overlay);
    const progress = $('.subly-tour-progress i', overlay);
    const next = $('.subly-tour-next', overlay);
    const skip = $('.subly-tour-skip', overlay);

    stepLabel.textContent = `${s.step} ${stepIndex + 1} / ${steps.length}`;
    progress.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
    next.textContent = step.type === 'finish' ? s.finish : s.next;
    skip.textContent = s.skip;
    content.innerHTML = '';

    if (step.type === 'language') {
      content.innerHTML = `
        <p class="subly-tour-eyebrow">${s.welcomeEyebrow}</p>
        <h2 id="sublyTourTitle">${s.choose}</h2>
        <p>${s.languageHint}</p>
        <div class="subly-tour-languages">
          <button type="button" data-tour-lang="ru" class="${lang === 'ru' ? 'selected' : ''}">
            <span>🇷🇺</span><b>Русский</b><i>RU</i>
          </button>
          <button type="button" data-tour-lang="en" class="${lang === 'en' ? 'selected' : ''}">
            <span>🇬🇧</span><b>English</b><i>EN</i>
          </button>
        </div>`;

      $$('[data-tour-lang]', content).forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.tourLang));
      });

      return;
    }

    const target = step.target ? $(step.target) : null;

    if (step.type === 'home') {
      switchTo('home');
    } else if (FORM_STEPS.includes(step.type)) {
      if (step.type === 'name' && !$('#sheetLayer')?.classList.contains('open')) {
        $('#fab')?.click();
      }
    } else if (step.type === 'stats') {
      switchTo('stats');
    } else if (step.type === 'settings') {
      switchTo('settings');
    }

    const icon = ({
      welcome: '✦', home: '▤', name: 'Aa', price: '₽', period: '↻',
      date: '◷', save: '✓', stats: '▥', settings: '⚙', finish: '✧'
    })[step.type] || '✦';

    content.innerHTML = `
      <div class="subly-tour-icon">${icon}</div>
      <p class="subly-tour-eyebrow">${s.welcomeEyebrow}</p>
      <h2 id="sublyTourTitle">${titleText(step.titleKey)}</h2>
      <p>${s[step.text] || ''}</p>`;

    clearHighlights();

    if (step.type === 'home') $('#fab')?.classList.add('subly-tour-highlight');

    if (target && FORM_STEPS.includes(step.type)) {
      target.classList.add('subly-tour-highlight');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function nextStep() {
    if (steps[stepIndex].type === 'save') closeSheet();
    clearHighlights();

    stepIndex += 1;

    if (stepIndex >= steps.length) return finishTour();
    renderStep();
  }

  function finishTour() {
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (_) {}
    tourMode = false;

    clearHighlights();
    closeSheet();

    if (overlay) overlay.remove();
    overlay = null;

    switchTo('home');
  }

  function startTour() {
    if (tourMode) return;

    tourMode = true;
    stepIndex = 0;

    createOverlay();
    renderStep();
  }

  /* ---------- кнопка «пройти обучение заново» ---------- */

  function restartButtonHTML() {
    const s = STRINGS[lang];
    return `
      <span class="set-text">
        <b>${s.restartTitle}</b>
        <small>${s.restartHint}</small>
      </span>
      <span aria-hidden="true">↻</span>`;
  }

  function installTourRestart() {
    const settingsPane = $('#paneSettings');
    if (!settingsPane || $('#sublyRestartTour')) return;

    const button = document.createElement('button');
    button.id = 'sublyRestartTour';
    button.type = 'button';
    button.className = 'set-row set-btn subly-restart-tour';
    button.innerHTML = restartButtonHTML();
    button.addEventListener('click', startTour);

    const footer = $('.foot-note', settingsPane);
    settingsPane.insertBefore(button, footer || null);
  }

  function updateRestartButton() {
    const b = $('#sublyRestartTour');
    if (b) b.innerHTML = restartButtonHTML();
  }

  /* ---------- запуск ---------- */

  function init() {
    document.documentElement.lang = lang;

    addLanguageSetting();
    installTourRestart();
    applyLanguage();

    const observer = new MutationObserver(records => {
      for (const r of records) {
        if (r.type === 'characterData') {
          const n = r.target;
          if (n.nodeValue === lastWritten.get(n)) continue; // это наша запись
          originalText.set(n, n.nodeValue);
          translateText(n);
        } else {
          r.addedNodes.forEach(n => translateTree(n));
        }
      }
      if (lang === 'en') updateDate();
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    let tourSeen = false;
    try { tourSeen = localStorage.getItem(TOUR_KEY) === '1'; } catch (_) {}
    if (!tourSeen) setTimeout(startTour, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
