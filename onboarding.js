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
    'Ваша подписка':'Your subscription'
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
      progress: 'обучение'
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
      progress: 'tutorial'
    }
  };

  function readSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY) || readSettings().language;
    return saved === 'en' ? 'en' : 'ru';
  }

  let lang = getLang();
  let overlay = null;
  let stepIndex = 0;
  let tourMode = false;
  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();

  function tr(value) {
    if (lang !== 'en') return value;
    return RU_EN.get(value) || value;
  }

  function translateTree(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);

      const original = originalText.get(node);
      const trimmed = original.trim();

      if (!trimmed) continue;

      const translated = lang === 'en'
        ? (RU_EN.get(trimmed) || trimmed)
        : trimmed;

      node.nodeValue = original.replace(trimmed, translated);
    }

    if (root.nodeType === Node.ELEMENT_NODE && root.hasAttribute('placeholder')) {
      if (!originalAttrs.has(root)) {
        originalAttrs.set(root, { placeholder: root.getAttribute('placeholder') });
      }

      const original = originalAttrs.get(root).placeholder;
      root.setAttribute('placeholder', lang === 'en' ? (RU_EN.get(original) || original) : original);
    }

    if (root.nodeType === Node.ELEMENT_NODE && root.hasAttribute('aria-label')) {
      if (!originalAttrs.has(root)) {
        originalAttrs.set(root, {
          ...(originalAttrs.get(root) || {}),
          ariaLabel: root.getAttribute('aria-label')
        });
      }

      const original = originalAttrs.get(root).ariaLabel;
      root.setAttribute('aria-label', lang === 'en' ? (RU_EN.get(original) || original) : original);
    }

    $$('[placeholder]', root).forEach(el => {
      if (!originalAttrs.has(el)) {
        originalAttrs.set(el, { placeholder: el.getAttribute('placeholder') });
      }

      const original = originalAttrs.get(el).placeholder;
      el.setAttribute('placeholder', lang === 'en' ? (RU_EN.get(original) || original) : original);
    });

    $$('[aria-label]', root).forEach(el => {
      if (!originalAttrs.has(el)) {
        originalAttrs.set(el, {
          ...(originalAttrs.get(el) || {}),
          ariaLabel: el.getAttribute('aria-label')
        });
      }

      const original = originalAttrs.get(el).ariaLabel;
      el.setAttribute('aria-label', lang === 'en' ? (RU_EN.get(original) || original) : original);
    });
  }

  function setLanguage(next) {
    lang = next === 'en' ? 'en' : 'ru';

    localStorage.setItem(LANG_KEY, lang);

    const settings = readSettings();
    settings.language = lang;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    document.documentElement.lang = lang;
    applyLanguage();

    if (overlay) renderStep();

    window.dispatchEvent(new CustomEvent('subly-language-changed', {
      detail: { language: lang }
    }));
  }

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

    const themeTitle = $$('h2.group-title', settingsPane).find(el =>
      el.textContent.trim() === 'Тема' || el.textContent.trim() === 'Theme'
    );

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

    section.querySelectorAll('[data-i18n="language"]').forEach(el => {
      el.textContent = s.language;
    });

    const hint = $('[data-i18n="languageHint"]', section);
    if (hint) hint.textContent = s.languageHint;

    $$('[data-lang-choice]', section).forEach(btn => {
      const active = btn.dataset.langChoice === lang;
      btn.classList.toggle('selected', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    translateTree(document.body);

    const date = $('#todayLabel');

    if (date && date.textContent) {
      const parsed = new Date();
      date.textContent = parsed.toLocaleDateString(
        lang === 'en' ? 'en-US' : 'ru-RU',
        { weekday: 'long', month: 'long', day: 'numeric' }
      );
    }

    updateLanguageSetting();
    updateRestartButton();
  }

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
    $('.subly-tour-backdrop', overlay).addEventListener('click', () => {});
  }

  function titleText(key) {
    return STRINGS[lang][key] || key;
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
        btn.addEventListener('click', () => {
          setLanguage(btn.dataset.tourLang);
          renderStep();
        });
      });

      return;
    }

    const target = step.target ? $(step.target) : null;

    if (step.type === 'home') {
      switchTo('home');
    } else if (['name', 'price', 'period', 'date', 'save'].includes(step.type)) {
      const sheet = $('#sheetLayer');

      if (sheet && !sheet.classList.contains('open')) {
        const fab = $('#fab');
        if (fab && step.type === 'name') fab.click();
      }
    } else if (step.type === 'stats') {
      switchTo('stats');
    } else if (step.type === 'settings') {
      switchTo('settings');
    }

    const icon = ({
      welcome:'✦',
      home:'▤',
      name:'Aa',
      price:'₽',
      period:'↻',
      date:'◷',
      save:'✓',
      stats:'▥',
      settings:'⚙',
      finish:'✧'
    })[step.type] || '✦';

    content.innerHTML = `
      <div class="subly-tour-icon">${icon}</div>
      <p class="subly-tour-eyebrow">${s.welcomeEyebrow}</p>
      <h2 id="sublyTourTitle">${titleText(step.titleKey)}</h2>
      <p>${s[step.text] || ''}</p>`;

    $$('.subly-tour-highlight').forEach(el => {
      el.classList.remove('subly-tour-highlight');
    });

    if (target && ['name','price','period','date','save'].includes(step.type)) {
      target.classList.add('subly-tour-highlight');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    if (step.type === 'finish') {
      next.textContent = s.finish;
    }
  }

  function switchTo(name) {
    const tab = $(`[data-tab="${name}"]`);

    if (tab && !tab.classList.contains('active')) {
      tab.click();
    }
  }

  function nextStep() {
    const current = steps[stepIndex];

    if (current.type === 'save') {
      const save = $('#fSave');

      if ($('#sheetLayer') && $('#sheetLayer').classList.contains('open')) {
        // Keep the real form intact; the tour can continue without forcing a sample subscription.
      }
    }

    if (current.type === 'home') {
      switchTo('home');

      const fab = $('#fab');
      if (fab) fab.classList.add('subly-tour-highlight');
    }

    if (current.type === 'save') {
      const close = $('#sheetClose');

      if (close && $('#sheetLayer')?.classList.contains('open')) {
        close.click();
      }
    }

    if (current.type === 'stats') switchTo('stats');
    if (current.type === 'settings') switchTo('settings');

    $$('.subly-tour-highlight').forEach(el => {
      el.classList.remove('subly-tour-highlight');
    });

    stepIndex += 1;

    if (stepIndex >= steps.length) {
      finishTour();
      return;
    }

    renderStep();
  }

  function finishTour() {
    localStorage.setItem(TOUR_KEY, '1');
    tourMode = false;

    $$('.subly-tour-highlight').forEach(el => {
      el.classList.remove('subly-tour-highlight');
    });

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

  function installTourRestart() {
    const settingsPane = $('#paneSettings');

    if (!settingsPane || $('#sublyRestartTour')) return;

    const button = document.createElement('button');
    button.id = 'sublyRestartTour';
    button.type = 'button';
    button.className = 'set-row set-btn subly-restart-tour';

    button.innerHTML = `
      <span class="set-text">
        <b>${lang === 'en' ? 'Show tutorial again' : 'Пройти обучение заново'}</b>
        <small>${lang === 'en' ? 'Replay the introduction to Subly' : 'Повторить знакомство с Subly'}</small>
      </span>
      <span aria-hidden="true">↻</span>`;

    button.addEventListener('click', startTour);

    const footer = $('.foot-note', settingsPane);
    settingsPane.insertBefore(button, footer || null);
  }

  function updateRestartButton() {
    const b = $('#sublyRestartTour');
    if (!b) return;

    b.innerHTML = `
      <span class="set-text">
        <b>${lang === 'en' ? 'Show tutorial again' : 'Пройти обучение заново'}</b>
        <small>${lang === 'en' ? 'Replay the introduction to Subly' : 'Повторить знакомство с Subly'}</small>
      </span>
      <span aria-hidden="true">↻</span>`;
  }

  function init() {
    document.documentElement.lang = lang;

    addLanguageSetting();
    installTourRestart();
    applyLanguage();

    const observer = new MutationObserver(records => {
      if (lang !== 'en') return;

      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
          else if (node.nodeType === Node.TEXT_NODE) {
            if (!originalText.has(node)) originalText.set(node, node.nodeValue);

            const original = originalText.get(node);
            const trimmed = original.trim();

            if (trimmed) {
              const translated = lang === 'en' ? (RU_EN.get(trimmed) || trimmed) : trimmed;
              node.nodeValue = original.replace(trimmed, translated);
            }
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    updateLanguageSetting();
    updateRestartButton();

    if (localStorage.getItem(TOUR_KEY) !== '1') {
      setTimeout(startTour, 450);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
