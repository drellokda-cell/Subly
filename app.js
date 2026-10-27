(() => {
  'use strict';

  const I = window.SublyIcons;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ───────── Константы ───────── */
  const KEYS = { subs: 'subly-subscriptions-v1', settings: 'subly-settings-v1', reminded: 'subly-reminded', hint: 'subly-swipe-hint' };
  const CURRENCIES = ['₽', '$', '€', '₴', '₸', 'zł'];
  const PERIODS = {
    month: { label: 'Месяц',  every: 'каждый месяц',   short: '/мес.', days: 30 },
    year:  { label: 'Год',    every: 'каждый год',     short: '/год',  days: 365 },
    week:  { label: 'Неделя', every: 'каждую неделю',  short: '/нед.', days: 7 },
    once:  { label: 'Разово', every: 'разовый платёж', short: 'разово', days: 30 }
  };
  const THEMES = [
    { id: 'dark', name: 'Чернила' }, { id: 'light', name: 'Молоко' }, { id: 'red', name: 'Вишня' },
    { id: 'green', name: 'Хвоя' }, { id: 'violet', name: 'Сирень' }, { id: 'amoled', name: 'Уголь' }
  ];
  const ICON_STYLES = [{ id: 'soft', name: 'Мягкие' }, { id: 'bold', name: 'Яркие' }];
  const FONTS = [
    { id: 'system', name: 'Системный', stack: 'system-ui, sans-serif' },
    { id: 'round', name: 'Округлый', stack: 'ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif' },
    { id: 'serif', name: 'С засечками', stack: 'Georgia, "Iowan Old Style", serif' }
  ];
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (ms = 10) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

  /* ───────── Даты и форматы ───────── */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const addDaysISO = n => iso(addDays(new Date(), n));
  const daysUntil = s => { const d = parseISO(s); return d ? Math.round((d - startOfToday()) / 86400000) : 0; };
  function addMonths(d, n) {
    const day = d.getDate();
    const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
    x.setDate(Math.min(day, last));
    return x;
  }
  function nextDate(s, period) {
    const d = parseISO(s);
    if (!d) return s;
    if (period === 'year') return iso(addMonths(d, 12));
    if (period === 'month') return iso(addMonths(d, 1));
    if (period === 'week') return iso(addDays(d, 7));
    return s;
  }
  const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  const money = (v, c) => `${nf.format(v)}\u00A0${c || '₽'}`;
  const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, k = m % 10; return (m > 10 && m < 20) ? c : k === 1 ? a : (k >= 2 && k <= 4) ? b : c; };
  const dateShort = s => { const d = parseISO(s); return d ? d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '') : s; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  function status(d) {
    if (d < 0) return { cls: 'danger', short: 'просрочено', long: `просрочено на ${-d} ${plural(-d, 'день', 'дня', 'дней')}` };
    if (d === 0) return { cls: 'danger', short: 'сегодня', long: 'списание сегодня' };
    if (d === 1) return { cls: 'danger', short: 'завтра', long: 'списание завтра' };
    const t = `через ${d} ${plural(d, 'день', 'дня', 'дней')}`;
    return { cls: d <= 7 ? 'warn' : 'safe', short: t, long: t };
  }

  // Короткий статус для карточки: слова только для ближайшей недели, дальше — дата
  function sideStatus(d, date) {
    if (d < 0) return { t: 'просрочено', cls: 'danger' };
    if (d === 0) return { t: 'сегодня', cls: 'danger' };
    if (d === 1) return { t: 'завтра', cls: 'danger' };
    if (d <= 7) return { t: `через ${d} дн.`, cls: 'warn' };
    return { t: dateShort(date), cls: '' };
  }

  /* ───────── Данные ───────── */
  function starter() {
    return [
      { id: uid(), name: 'ChatGPT Plus', price: 20, currency: '$', period: 'month', date: addDaysISO(12), service: 'chatgpt' },
      { id: uid(), name: 'Spotify Premium', price: 299, currency: '₽', period: 'month', date: addDaysISO(2), service: 'spotify' },
      { id: uid(), name: 'YouTube Premium', price: 399, currency: '₽', period: 'month', date: addDaysISO(1), service: 'youtube' }
    ];
  }
  const validSub = s => s && typeof s.name === 'string' && Number.isFinite(Number(s.price)) && typeof s.date === 'string';
  function normalizeSub(s) {
    const item = {
      id: s.id || uid(), name: String(s.name).slice(0, 60), price: Number(s.price),
      currency: s.currency || '₽', period: PERIODS[s.period] ? s.period : 'month', date: s.date
    };
    if (s.service && (I.CATALOG[s.service] || s.service === 'custom')) item.service = s.service;
    else item.service = I.detectService(s.name) || 'custom';
    if (item.service === 'custom') {
      if (s.glyph) item.glyph = s.glyph;
      if (s.color) item.color = s.color;
      if (s.icon) item.icon = s.icon;
    }
    return item;
  }
  function loadSubs() {
    try {
      const raw = localStorage.getItem(KEYS.subs);
      if (raw === null) return starter();
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(validSub).map(normalizeSub) : starter();
    } catch (_) { return starter(); }
  }
  function loadSettings() {
    const base = { theme: 'dark', font: 'system', icons: 'soft', notifications: false, currency: '₽' };
    try {
      const s = { ...base, ...JSON.parse(localStorage.getItem(KEYS.settings) || '{}') };
      if (!THEMES.some(t => t.id === s.theme)) s.theme = 'dark';
      if (!FONTS.some(f => f.id === s.font)) s.font = 'system';
      if (!ICON_STYLES.some(x => x.id === s.icons)) s.icons = 'soft';
      if (!CURRENCIES.includes(s.currency)) s.currency = '₽';
      return s;
    } catch (_) { return base; }
  }

  let subs = loadSubs();
  let settings = loadSettings();
  let filter = 'all';
  let tab = 'home';
  let statCur = null;
  let booted = false;
  const fresh = new Set();

  function persist() {
    try { localStorage.setItem(KEYS.subs, JSON.stringify(subs)); } catch (_) { toast('Не удалось сохранить: память заполнена'); }
    render();
    window.dispatchEvent(new Event('subly-data-changed'));
  }
  function persistSettings() {
    try { localStorage.setItem(KEYS.settings, JSON.stringify(settings)); } catch (_) {}
    applySettings();
    window.dispatchEvent(new Event('subly-data-changed'));
  }

  /* ───────── Расчёты ───────── */
  const monthly = s => {
    const p = Number(s.price) || 0;
    return s.period === 'year' ? p / 12 : s.period === 'week' ? p * 52 / 12 : s.period === 'once' ? 0 : p;
  };
  function totals() {
    const t = {};
    subs.forEach(s => { if (s.period !== 'once') t[s.currency] = (t[s.currency] || 0) + monthly(s); });
    return t;
  }
  function primaryCurrency(t) {
    const keys = Object.keys(t);
    if (!keys.length || keys.includes(settings.currency)) return settings.currency;
    return keys.sort((a, b) => t[b] - t[a])[0];
  }
  // Списания на ближайшие N дней (регулярные повторяются внутри окна)
  function upcoming(days = 30) {
    const start = startOfToday(), end = addDays(start, days - 1), out = [];
    subs.forEach(s => {
      let d = parseISO(s.date), guard = 0, overdueDone = false;
      while (d && guard++ < 400 && d <= end) {
        if (d < start) { if (!overdueDone) { out.push({ s, day: 0 }); overdueDone = true; } }
        else out.push({ s, day: Math.round((d - start) / 86400000) });
        if (s.period === 'once') break;
        d = parseISO(nextDate(iso(d), s.period));
      }
    });
    return out;
  }

  /* ───────── Иконки сервисов ───────── */
  function look(s) {
    const e = I.CATALOG[s.service];
    if (e) return { c: e.c, g: e.g, fg: e.f };
    const c = I.resolveColor(s.color), fg = I.fgFor(c);
    if (s.glyph && I.GLYPHS[s.glyph]) return { c, g: s.glyph, fg };
    if (s.icon && !I.GLYPHS[s.icon]) return { c, text: s.icon, fg };
    return { c, g: 'spark', fg };
  }
  const lumOf = hex => { const n = parseInt(hex.slice(1), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  function tileHTML(lk, cls = 'tile') {
    const inner = lk.text ? `<span class="tile-text">${esc(lk.text)}</span>` : I.svg(lk.g);
    const ink = lumOf(lk.c) < 70 ? ';--ink:var(--text)' : '';
    return `<div class="${cls}" style="--c:${lk.c};--fg:${lk.fg}${ink}">${inner}</div>`;
  }

  /* ───────── Отрисовка: главная ───────── */
  function countTo(el, to, fmt) {
    const from = el._v ?? 0;
    el._v = to;
    cancelAnimationFrame(el._raf);
    if (reduceMotion() || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 850;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  function renderHero() {
    const t = totals(), cur = primaryCurrency(t), total = t[cur] || 0;
    $('#heroCur').textContent = cur;
    countTo($('#heroValue'), total, v => nf.format(total >= 100 ? Math.round(v) : Math.round(v * 100) / 100));

    const lines = [];
    if (total > 0) lines.push(`${money(total * 12, cur)} в год`);
    Object.keys(t).filter(c => c !== cur).forEach(c => lines.push(`+ ${money(t[c], c)} / мес.`));
    $('#heroNote').innerHTML = lines.length ? lines.map(l => `<span>${esc(l)}</span>`).join('') : 'Добавьте подписку, чтобы увидеть траты';
    const n = subs.length, m10 = n % 10, m100 = n % 100;
    $('#heroCount').textContent = n ? `${n} ${m10 === 1 && m100 !== 11 ? 'подписка' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'подписки' : 'подписок'}` : '';

    const sorted = subs.map(s => ({ s, d: daysUntil(s.date) })).sort((a, b) => a.d - b.d);
    const next = sorted.find(x => x.d >= 0) || sorted[0];
    const card = $('#nextCard');
    card.hidden = !next;
    if (next) {
      const sd = sideStatus(next.d, next.s.date);
      card.dataset.id = next.s.id;
      $('#nextDot').className = 'next-dot ' + sd.cls;
      $('#nextName').textContent = next.s.name;
      $('#nextWhen').textContent = next.d < 0 ? 'просрочено' : `спишется ${sd.t}`;
      card.setAttribute('aria-label', `Ближайшее списание: ${next.s.name}, ${$('#nextWhen').textContent}`);
    }
  }

  function rowHTML(s, d, idx, enter) {
    const st = status(d), sd = sideStatus(d, s.date), lk = look(s), per = PERIODS[s.period];
    const delay = Math.min(idx * 60, 420);
    const cls = 'row' + (enter ? ' enter' : '') + (fresh.has(s.id) ? ' pop' : '');
    return `<div class="${cls}" data-id="${esc(s.id)}" style="--d:${delay}ms">
      <div class="under"><span class="u-paid"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Оплачено</span><span class="u-del">Удалить<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></span></div>
      <article class="card" tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(money(s.price, s.currency))}, ${esc(per.every)}, ${esc(st.long)}. Нажмите, чтобы изменить">
        ${tileHTML(lk)}
        <div class="card-main"><h3>${esc(s.name)}</h3><p>${esc(cap(per.every))}</p></div>
        <div class="card-side"><b>${esc(money(s.price, s.currency))}</b><small class="${sd.cls}">${esc(sd.t)}</small></div>
      </article>
    </div>`;
  }

  const EMPTY_ART = `<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="22" y="14" width="76" height="28" rx="10" fill="var(--surface2)"/><rect x="14" y="34" width="92" height="30" rx="11" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/><rect x="8" y="56" width="104" height="32" rx="12" fill="var(--accent)"/><circle cx="26" cy="72" r="8" fill="var(--on-accent)" opacity=".25"/><rect x="42" y="66" width="38" height="6" rx="3" fill="var(--on-accent)" opacity=".35"/><rect x="42" y="76" width="22" height="5" rx="2.5" fill="var(--on-accent)" opacity=".2"/></svg>`;

  function renderList() {
    const items = subs.map(s => ({ s, d: daysUntil(s.date) }))
      .sort((a, b) => a.d - b.d || a.s.name.localeCompare(b.s.name, 'ru'));
    const soon = items.filter(x => x.d >= 0 && x.d <= 7), late = items.filter(x => x.d < 0);
    $('#cntAll').textContent = items.length;
    $('#cntSoon').textContent = soon.length;
    $('#cntExpired').textContent = late.length;

    let groups;
    if (filter === 'soon') groups = [[null, soon]];
    else if (filter === 'expired') groups = [[null, late]];
    else groups = [[null, items]];

    const list = $('#list'), empty = $('#empty');
    const total = groups.reduce((a, g) => a + g[1].length, 0);
    let idx = 0;
    list.innerHTML = groups.map(([title, arr]) =>
      (title && groups.length > 0 ? `<div class="group-head">${title}<span>${arr.length}</span></div>` : '') +
      arr.map(x => rowHTML(x.s, x.d, idx++, !booted)).join('')
    ).join('');
    if (!booted) { list.classList.add('boot'); setTimeout(() => list.classList.remove('boot'), 2200); }
    fresh.clear();

    list.hidden = total === 0;
    empty.hidden = total !== 0;
    if (total === 0) {
      if (!subs.length) {
        empty.innerHTML = `${EMPTY_ART}<h3>Пока пусто</h3><p>Добавьте первую подписку — Subly покажет, сколько она стоит и когда спишут деньги.</p><button class="btn primary" id="emptyAdd" type="button">Добавить подписку</button>`;
      } else {
        const msg = filter === 'soon' ? ['Тихая неделя', 'В ближайшие 7 дней ничего не спишется.'] : ['Просрочек нет', 'Все даты списаний впереди.'];
        empty.innerHTML = `${EMPTY_ART}<h3>${msg[0]}</h3><p>${msg[1]}</p>`;
      }
    }
    if (!booted && subs.length) {
      let seen = false; try { seen = !!localStorage.getItem(KEYS.hint); } catch (_) {}
      if (!seen) setTimeout(() => { toast('Свайп вправо — оплачено, влево — удалить'); try { localStorage.setItem(KEYS.hint, '1'); } catch (_) {} }, 1600);
    }
  }

  /* ───────── Отрисовка: обзор ───────── */
  function renderStats(animate) {
    const t = totals();
    const curs = [...new Set(subs.map(s => s.currency))];
    if (!curs.includes(statCur)) statCur = primaryCurrency(t);
    const chips = $('#statCurrency');
    chips.hidden = curs.length < 2;
    chips.innerHTML = curs.map(c => `<button class="chip${c === statCur ? ' active' : ''}" data-cur="${esc(c)}">${esc(c)}</button>`).join('');

    const body = $('#statsBody');
    if (!subs.length) { body.innerHTML = '<p class="stat-empty">Здесь появится статистика, когда вы добавите подписки.</p>'; return; }

    const mine = subs.filter(s => s.currency === statCur);
    const perMonth = t[statCur] || 0;
    const occ = upcoming(30).filter(o => o.s.currency === statCur);
    const sum30 = occ.reduce((a, o) => a + Number(o.s.price), 0);

    // полоса на 30 дней
    const byDay = Array.from({ length: 30 }, () => []);
    occ.forEach(o => byDay[o.day].push(o.s));
    const today = startOfToday();
    const strip = byDay.map((arr, k) => {
      if (!arr.length) return `<button class="day${k === 0 ? ' today' : ''}" style="--k:${k}" data-day="${k}" aria-label="${k} дн., списаний нет" tabindex="-1"></button>`;
      const cols = arr.map(s => look(s).c);
      const bg = cols.length === 1 ? `--c:${cols[0]}` :
        `background:linear-gradient(to bottom,${cols.map((c, i) => `${c} ${i * 100 / cols.length}% ${(i + 1) * 100 / cols.length}%`).join(',')})`;
      return `<button class="day has${k === 0 ? ' today' : ''}" style="--k:${k};${bg}" data-day="${k}" aria-label="${esc(dateShort(iso(addDays(today, k))))}: ${esc(arr.map(s => s.name).join(', '))}"></button>`;
    }).join('');
    body._byDay = byDay;

    // рейтинг
    const ranked = mine.filter(s => monthly(s) > 0).sort((a, b) => monthly(b) - monthly(a));
    const max = ranked.length ? monthly(ranked[0]) : 1;
    const rank = ranked.map((s, k) => {
      const v = monthly(s), share = perMonth ? Math.round(v / perMonth * 100) : 0;
      return `<div class="rank">${tileHTML(look(s), 'tile sm')}
        <div style="min-width:0"><div class="rank-name">${esc(s.name)}</div><div class="rank-bar"><i style="--w:${(v / max * 100).toFixed(1)}%;--c:${look(s).c};--k:${k}"></i></div></div>
        <div class="rank-sum">${esc(money(v, statCur))}<small>${share}%</small></div></div>`;
    }).join('');

    const end = addDays(today, 29);
    body.innerHTML = `
      <div class="card-block">
        <p class="block-title">В год</p>
        <p class="big">${esc(money(perMonth * 12, statCur))}</p>
        <p class="block-note">${perMonth ? `Примерно ${esc(money(perMonth, statCur))} в месяц` : 'Регулярных подписок в этой валюте нет'}</p>
      </div>
      <div class="card-block">
        <p class="block-title">Ближайшие 30 дней</p>
        <p class="big">${esc(money(sum30, statCur))}</p>
        <p class="block-note">${occ.length ? `${occ.length} ${plural(occ.length, 'списание', 'списания', 'списаний')}` : 'Списаний не ожидается'}</p>
        <div class="strip${animate ? ' boot-strip' : ''}" id="strip">${strip}</div>
        <div class="strip-axis"><span>${esc(dateShort(iso(today)))}</span><span>${esc(dateShort(iso(end)))}</span></div>
      </div>
      <div class="card-block">
        <p class="block-title">Что дороже всего</p>
        ${rank || '<p class="block-note" style="margin-top:10px">Нет регулярных платежей.</p>'}
      </div>`;
  }

  /* ───────── Отрисовка: настройки ───────── */
  function buildSeg(el, options, active, onPick) {
    $$('button', el).forEach(b => b.remove());
    options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = o.name; b.dataset.id = o.id;
      if (o.stack) b.style.fontFamily = o.stack;
      b.classList.toggle('active', o.id === active);
      b.setAttribute('aria-pressed', o.id === active);
      b.addEventListener('click', () => onPick(o.id));
      el.appendChild(b);
    });
    el.style.setProperty('--i', Math.max(0, options.findIndex(o => o.id === active)));
  }
  function renderSettings() {
    $('#themeGrid').innerHTML = THEMES.map(t => `
      <button class="theme-card${t.id === settings.theme ? ' active' : ''}" data-pick="${t.id}" aria-pressed="${t.id === settings.theme}">
        <span class="theme-prev" data-theme="${t.id}"><span class="tp-hero"><b>896<u>₽</u></b><i></i></span><i class="tp-row"></i><i class="tp-row s"></i></span>
        <span>${t.name}</span></button>`).join('');
    buildSeg($('#fontSeg'), FONTS, settings.font, id => { settings.font = id; persistSettings(); renderSettings(); });
    buildSeg($('#iconSeg'), ICON_STYLES, settings.icons, id => { settings.icons = id; persistSettings(); renderSettings(); render(); buzz(6); });
    $('#currencyDefault').innerHTML = CURRENCIES.map(c => `<button class="chip${c === settings.currency ? ' active' : ''}" data-cur="${esc(c)}">${esc(c)}</button>`).join('');
    $('#notifyToggle').checked = !!settings.notifications;
    const denied = 'Notification' in window && Notification.permission === 'denied';
    $('#notifyHint').textContent = denied
      ? 'Уведомления запрещены в настройках телефона. Разрешите их для Subly в настройках Android.'
      : 'Уведомления придут даже когда приложение закрыто: за 7 дней, 3 дня, 1 день и за 12 часов.';
  }

  function render() {
    renderHero();
    renderList();
    if (tab === 'stats') renderStats(false);
    $('#todayLabel').textContent = cap(new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
    booted = true;
  }

  function applySettings() {
    const root = document.documentElement;
    root.classList.add('theming');
    root.dataset.theme = settings.theme;
    root.dataset.font = settings.font;
    root.dataset.icons = settings.icons;
    clearTimeout(applySettings._t);
    applySettings._t = setTimeout(() => root.classList.remove('theming'), 500);
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    const meta = $('meta[name="theme-color"]');
    if (meta && bg) meta.content = bg;
  }

  /* ───────── Тост и диалог ───────── */
  let toastTimer;
  function toast(msg, opt = {}) {
    const el = $('#toast'), btn = $('#toastAction');
    $('#toastText').textContent = msg;
    btn.hidden = !opt.action;
    btn.textContent = opt.action || '';
    btn.onclick = () => { el.classList.remove('show'); opt.onAction && opt.onAction(); };
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), opt.action ? 5000 : 2600);
  }
  let dlgResolve = null;
  function confirmDialog({ title, text, ok = 'Да', danger = false }) {
    return new Promise(res => {
      $('#dlgTitle').textContent = title; $('#dlgText').textContent = text;
      const okBtn = $('#dlgOk'); okBtn.textContent = ok; okBtn.classList.toggle('bad', danger);
      const layer = $('#dialog'); layer.hidden = false;
      requestAnimationFrame(() => layer.classList.add('open'));
      dlgResolve = v => { layer.classList.remove('open'); setTimeout(() => { layer.hidden = true; }, 250); dlgResolve = null; res(v); };
      okBtn.focus({ preventScroll: true });
    });
  }
  $('#dlgOk').addEventListener('click', () => dlgResolve && dlgResolve(true));
  $('#dlgCancel').addEventListener('click', () => dlgResolve && dlgResolve(false));
  $('#dialog .scrim').addEventListener('click', () => dlgResolve && dlgResolve(false));

  /* ───────── Действия над подписками ───────── */
  function removeSub(id, msg = 'Подписка удалена') {
    const idx = subs.findIndex(s => s.id === id);
    if (idx < 0) return;
    const item = subs[idx];
    const row = $(`.row[data-id="${CSS.escape(id)}"]`);
    const finish = () => {
      subs = subs.filter(s => s.id !== id);
      persist();
      toast(msg, { action: 'Вернуть', onAction: () => { subs.splice(Math.min(idx, subs.length), 0, item); fresh.add(id); persist(); } });
    };
    if (row && !reduceMotion()) {
      row.style.height = row.offsetHeight + 'px';
      void row.offsetHeight;
      row.classList.add('leaving');
      setTimeout(finish, 290);
    } else finish();
  }
  function markPaid(id) {
    const s = subs.find(x => x.id === id);
    if (!s) return;
    if (s.period === 'once') { removeSub(id, 'Оплачено — платёж убран из списка'); return; }
    const prev = s.date;
    let d = nextDate(s.date, s.period), g = 0;
    while (daysUntil(d) < 0 && g++ < 500) d = nextDate(d, s.period);
    s.date = d;
    fresh.add(id);
    persist();
    toast(`Следующее списание: ${dateShort(d)}`, { action: 'Отменить', onAction: () => { s.date = prev; fresh.add(id); persist(); } });
  }

  /* ───────── Вкладки ───────── */
  const TAB_ORDER = ['home', 'stats', 'settings'];
  function switchTab(name) {
    if (name === tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    tab = name;
    $('#tabs').style.setProperty('--i', TAB_ORDER.indexOf(name));
    $$('.tab').forEach(b => { const on = b.dataset.tab === name; b.classList.toggle('active', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
    $$('.pane').forEach(p => {
      const on = p.dataset.pane === name;
      p.hidden = !on; p.classList.toggle('active', on);
      p.classList.remove('in');
      if (on) { void p.offsetWidth; p.classList.add('in'); }
    });
    window.scrollTo(0, 0);
    if (name === 'stats') renderStats(true);
    if (name === 'settings') renderSettings();
    buzz(6);
  }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) switchTab(b.dataset.tab); });

  /* ───────── Свайпы по карточкам ───────── */
  const SWIPE = 92;
  let drag = null, suppressUntil = 0;
  const list = $('#list');
  list.addEventListener('pointerdown', e => {
    const card = e.target.closest('.card');
    if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { card, row: card.parentElement, x: e.clientX, y: e.clientY, dx: 0, active: false, armed: false, pid: e.pointerId };
  });
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pid) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        drag.active = true; drag.card.classList.add('dragging');
        try { drag.card.setPointerCapture(e.pointerId); } catch (_) {}
      } else if (Math.abs(dy) > 10) { drag = null; return; }
      else return;
    }
    drag.dx = dx;
    const a = Math.abs(dx), t = a > 150 ? Math.sign(dx) * (150 + (a - 150) * .25) : dx;
    drag.card.style.transform = `translateX(${t}px)`;
    drag.row.dataset.dir = dx > 0 ? 'right' : 'left';
    const armed = a >= SWIPE;
    if (armed !== drag.armed) { drag.armed = armed; if (armed) buzz(8); }
    drag.row.style.setProperty('--armed', armed ? 1 : 0);
  });
  const endDrag = (cancel) => {
    if (!drag) return;
    const { card, row, dx, active, armed } = drag;
    drag = null;
    if (!active) return;
    suppressUntil = performance.now() + 350;
    card.classList.remove('dragging');
    const id = row.dataset.id;
    try { localStorage.setItem(KEYS.hint, '1'); } catch (_) {}
    if (!cancel && armed && dx < 0) {
      card.style.transform = 'translateX(-108%)';
      setTimeout(() => removeSub(id), 180);
    } else if (!cancel && armed && dx > 0) {
      card.style.transform = '';
      delete row.dataset.dir;
      setTimeout(() => markPaid(id), 160);
    } else {
      card.style.transform = '';
      setTimeout(() => { if (!card.classList.contains('dragging')) delete row.dataset.dir; }, 320);
    }
  };
  window.addEventListener('pointerup', () => endDrag(false));
  window.addEventListener('pointercancel', () => endDrag(true));

  list.addEventListener('click', e => {
    if (performance.now() < suppressUntil) return;
    const row = e.target.closest('.row');
    if (row) openEdit(row.dataset.id);
  });
  list.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) { e.preventDefault(); e.target.click(); }
  });

  /* ───────── Шторка ───────── */
  const layer = $('#sheetLayer'), sheet = $('#sheet');
  let sheetOpen = false, editing = false, draft = null;

  function openSheet() {
    sheetOpen = true;
    layer.classList.add('open');
    document.body.style.overflow = 'hidden';
    try { history.pushState({ sheet: 1 }, ''); } catch (_) {}
  }
  function hideSheet() {
    sheetOpen = false;
    layer.classList.remove('open');
    document.body.style.overflow = '';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  function closeSheet() {
    if (!sheetOpen) return;
    if (history.state && history.state.sheet) history.back(); else hideSheet();
  }
  window.addEventListener('popstate', () => { if (sheetOpen) hideSheet(); });
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (dlgResolve) dlgResolve(false); else closeSheet();
  });

  // перетаскивание шторки вниз
  let sd = null;
  const top = $('#sheetTop');
  top.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    sd = { y: e.clientY, t: performance.now(), dy: 0, pid: e.pointerId };
    sheet.style.transition = 'none';
    try { top.setPointerCapture(e.pointerId); } catch (_) {}
  });
  top.addEventListener('pointermove', e => {
    if (!sd || e.pointerId !== sd.pid) return;
    sd.dy = Math.max(0, e.clientY - sd.y);
    sheet.style.transform = `translateY(${sd.dy}px)`;
    $('#scrim').style.opacity = String(Math.max(0, 1 - sd.dy / sheet.offsetHeight));
  });
  const endSheetDrag = () => {
    if (!sd) return;
    const { dy, t } = sd, v = dy / Math.max(1, performance.now() - t);
    sd = null;
    sheet.style.transition = '';
    $('#scrim').style.opacity = '';
    if (dy > 120 || v > 0.7) {
      sheet.style.transform = 'translateY(102%)';
      closeSheet();
      setTimeout(() => { sheet.style.transform = ''; }, 500);
    } else sheet.style.transform = '';
  };
  top.addEventListener('pointerup', endSheetDrag);
  top.addEventListener('pointercancel', endSheetDrag);

  /* — форма — */
  function newDraft() {
    return { id: '', name: '', price: '', currency: settings.currency, period: 'month', date: iso(addMonths(startOfToday(), 1)), service: 'custom', glyph: 'spark', color: I.PALETTE[0], manualLook: false, auto: false };
  }
  function openAdd() {
    editing = false; draft = newDraft();
    enterForm(false);
    openSheet();
    buzz(8);
    setTimeout(() => { if (sheetOpen && !editing) $('#fName').focus({ preventScroll: true }); }, 380);
  }
  function openEdit(id) {
    const s = subs.find(x => x.id === id);
    if (!s) return;
    editing = true;
    draft = { ...newDraft(), ...s, price: String(s.price).replace('.', ','), manualLook: true, auto: false };
    enterForm(false);
    openSheet();
  }
  function enterForm(openLook) {
    $('#sugg').classList.remove('open');
    fillForm();
    $('#sheetTitle').textContent = editing ? 'Изменить подписку' : 'Новая подписка';
    $('#stepForm').scrollTop = 0;
    setLookOpen(openLook);
    $('#fSave').textContent = editing ? 'Сохранить' : 'Добавить';
    $('#editExtras').hidden = !editing;
    $('#fPaid').textContent = draft.period === 'once' ? 'Оплачено, убрать' : 'Оплачено';
    $$('.bad').forEach(x => x.classList.remove('bad'));
  }

  // Подсказки: популярные сервисы или результаты поиска по тому, что набрано в названии
  function renderSugg() {
    const box = $('#sugg');
    const q = (draft.name || '').trim();
    if (editing || draft.service !== 'custom') { box.innerHTML = ''; box.classList.remove('open'); return; }
    const list = (q ? I.search(q) : I.LIST).slice(0, 30);
    const btn = e => `<button type="button" class="sg" data-service="${e.id}">${tileHTML({ c: e.c, g: e.g, fg: e.f }, 'tile xs')}<span>${esc(e.n)}</span></button>`;
    const first = list.slice(0, 3), rest = list.slice(3);
    if (!rest.length) box.classList.remove('open');
    box.innerHTML = `<div class="sugg-row${rest.length ? ' has-more' : ''}">${first.map(btn).join('')}${rest.length ? `<button type="button" class="sg-more" data-more aria-label="Показать больше сервисов" aria-expanded="${box.classList.contains('open')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>` : ''}</div>`
      + (rest.length ? `<div class="sugg-more"><div class="sugg-more-in"><div class="sugg-grid">${rest.map(btn).join('')}</div></div></div>` : '');
  }
  $('#sugg').addEventListener('click', e => {
    const more = e.target.closest('[data-more]');
    if (more) {
      const open = $('#sugg').classList.toggle('open');
      more.setAttribute('aria-expanded', open); buzz(5);
      return;
    }
    const b = e.target.closest('[data-service]');
    if (!b) return;
    const id = b.dataset.service;
    draft.service = id; draft.name = I.CATALOG[id].n; draft.manualLook = false; draft.auto = false;
    $('#fName').value = draft.name;
    renderFormTile(); renderGlyphs(); renderColors(); renderSugg(); buzz(6);
    $('#fPrice').focus({ preventScroll: true });
  });

  function fillForm() {
    $('#fName').value = draft.name;
    $('#fPrice').value = draft.price;
    renderCurrency(); renderPeriod(); renderGlyphs(); renderColors();
    $('#fDate').value = draft.date;
    renderDate(); renderFormTile(); renderSugg();
  }
  function renderFormTile() { $('#formTile').innerHTML = tileHTML(look(draft), 'tile lg'); }
  function renderCurrency() {
    $('#fCurrency').innerHTML = CURRENCIES.map(c => `<button type="button" class="chip${c === draft.currency ? ' active' : ''}" data-cur="${esc(c)}" aria-pressed="${c === draft.currency}">${esc(c)}</button>`).join('');
  }
  function renderPeriod() {
    buildSeg($('#fPeriod'), Object.entries(PERIODS).map(([id, p]) => ({ id, name: p.label })), draft.period, id => { draft.period = id; renderPeriod(); $('#fPaid').textContent = id === 'once' ? 'Оплачено, убрать' : 'Оплачено'; buzz(5); });
  }
  function renderDate() {
    const t0 = startOfToday();
    const opts = [['Сегодня', iso(t0)], ['Завтра', iso(addDays(t0, 1))], ['+ неделя', iso(addDays(t0, 7))], ['+ месяц', iso(addMonths(t0, 1))]];
    $('#fDateChips').innerHTML = opts.map(([l, d]) => `<button type="button" class="chip${d === draft.date ? ' active' : ''}" data-date="${d}">${l}</button>`).join('');
    const note = $('#fDateNote'), d = parseISO(draft.date);
    if (!d) { note.textContent = 'Выберите дату'; note.className = 'date-note'; return; }
    const st = status(daysUntil(draft.date));
    note.textContent = `${cap(d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }))}, ${st.long}`;
    note.className = 'date-note' + (st.cls === 'safe' ? '' : ' ' + st.cls);
  }
  function renderGlyphs() {
    $('#glyphGrid').innerHTML = I.CUSTOM_GLYPHS.map(g => `<button type="button" class="glyph-btn${draft.service === 'custom' && draft.glyph === g ? ' active' : ''}" data-glyph="${g}" aria-label="Иконка ${g}">${I.svg(g)}</button>`).join('');
  }
  function renderColors() {
    const cur = draft.service === 'custom' ? I.resolveColor(draft.color) : null;
    $('#colorRow').innerHTML = I.PALETTE.map(c => `<button type="button" class="color-dot${c === cur ? ' active' : ''}" style="--c:${c}" data-color="${c}" aria-label="Цвет ${c}"></button>`).join('');
  }
  function setLookOpen(open) {
    $('#look').classList.toggle('open', open);
    $('#lookToggle').setAttribute('aria-expanded', open);
  }
  function ensureCustom() {
    if (draft.service !== 'custom') {
      const l = look(draft);
      draft.service = 'custom'; draft.color = l.c; draft.glyph = I.GLYPHS[l.g] ? l.g : 'spark';
    }
    draft.icon = undefined; draft.manualLook = true; draft.auto = false;
  }
  $('#lookToggle').addEventListener('click', () => setLookOpen(!$('#look').classList.contains('open')));
  $('#glyphGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-glyph]'); if (!b) return;
    ensureCustom(); draft.glyph = b.dataset.glyph;
    renderGlyphs(); renderColors(); renderFormTile(); buzz(5);
  });
  $('#colorRow').addEventListener('click', e => {
    const b = e.target.closest('[data-color]'); if (!b) return;
    ensureCustom(); draft.color = b.dataset.color;
    renderGlyphs(); renderColors(); renderFormTile(); buzz(5);
  });
  $('#fName').addEventListener('input', e => {
    draft.name = e.target.value;
    $('.name-row').classList.remove('bad');
    if (!draft.manualLook && (draft.service === 'custom' || draft.auto)) {
      const f = I.detectService(draft.name);
      if (f) { draft.service = f; draft.auto = true; }
      else if (draft.auto) { draft.service = 'custom'; draft.auto = false; }
      renderFormTile(); renderGlyphs(); renderColors();
    }
    renderSugg();
  });
  $('#fPrice').addEventListener('input', e => { draft.price = e.target.value; $('#fPrice').parentElement.classList.remove('bad'); });
  $('#fCurrency').addEventListener('click', e => { const b = e.target.closest('[data-cur]'); if (b) { draft.currency = b.dataset.cur; renderCurrency(); buzz(5); } });
  $('#fDateChips').addEventListener('click', e => {
    const b = e.target.closest('[data-date]'); if (!b) return;
    draft.date = b.dataset.date; $('#fDate').value = draft.date; renderDate(); buzz(5);
  });
  $('#fDate').addEventListener('input', e => { draft.date = e.target.value; renderDate(); });

  const parsePrice = v => { const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

  $('#stepForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName').value.trim(), price = parsePrice($('#fPrice').value), date = $('#fDate').value;
    let bad = false;
    if (!name) { $('.name-row').classList.add('bad'); bad = true; }
    if (!(price >= 0)) { $('#fPrice').parentElement.classList.add('bad'); bad = true; }
    if (!parseISO(date)) { $('#fDate').parentElement.classList.add('bad'); bad = true; }
    if (bad) {
      const b = $('#fSave'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); buzz([20, 40, 20]);
      toast(!name ? 'Введите название' : !(price >= 0) ? 'Укажите цену' : 'Выберите дату');
      return;
    }
    const item = { id: draft.id || uid(), name, price, currency: draft.currency, period: draft.period, date, service: draft.service };
    if (draft.service === 'custom') {
      item.glyph = draft.glyph; item.color = draft.color;
      if (draft.icon) item.icon = draft.icon;
    }
    if (draft.id) subs = subs.map(s => s.id === draft.id ? item : s); else subs.push(item);
    fresh.add(item.id);
    const wasEditing = editing;
    persist(); closeSheet(); buzz(12);
    toast(wasEditing ? 'Изменения сохранены' : `${name} добавлена`);
    if (tab !== 'home') switchTab('home');
  });
  $('#fPaid').addEventListener('click', () => { const id = draft.id; closeSheet(); setTimeout(() => markPaid(id), 220); });
  $('#fDelete').addEventListener('click', () => { const id = draft.id; closeSheet(); setTimeout(() => removeSub(id), 260); });

  /* ───────── Привязки интерфейса ───────── */
  $('#fab').addEventListener('click', openAdd);
  $('#nextCard').addEventListener('click', () => { const id = $('#nextCard').dataset.id; if (id) openEdit(id); });
  document.addEventListener('click', e => { if (e.target.closest('#emptyAdd')) openAdd(); });
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    filter = b.dataset.filter;
    $$('#filters .chip').forEach(c => { const on = c === b; c.classList.toggle('active', on); c.setAttribute('aria-pressed', on); });
    renderList();
  });
  $('#statCurrency').addEventListener('click', e => { const b = e.target.closest('[data-cur]'); if (b) { statCur = b.dataset.cur; renderStats(false); } });
  $('#statsBody').addEventListener('click', e => {
    const b = e.target.closest('.day'); if (!b) return;
    const arr = ($('#statsBody')._byDay || [])[+b.dataset.day] || [];
    const d = addDays(startOfToday(), +b.dataset.day);
    toast(arr.length ? `${dateShort(iso(d))}: ${arr.map(s => `${s.name} ${money(s.price, s.currency)}`).join(', ')}` : `${dateShort(iso(d))}: списаний нет`);
  });

  $('#themeGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-pick]'); if (!b) return;
    settings.theme = b.dataset.pick; persistSettings(); renderSettings(); buzz(8);
  });
  $('#currencyDefault').addEventListener('click', e => {
    const b = e.target.closest('[data-cur]'); if (!b) return;
    settings.currency = b.dataset.cur; persistSettings(); renderSettings(); renderHero(); buzz(5);
  });
  window.addEventListener('subly-native-permission-result', () => {
    settings = loadSettings();
    renderSettings();
  });

  $('#notifyToggle').addEventListener('change', async e => {
    settings.notifications = e.target.checked;
    if (settings.notifications) {
      window.dispatchEvent(new Event('subly-request-notification-permission'));
      if (!window.SublyNativeNotifications && 'Notification' in window && Notification.permission === 'default') {
        try { settings.notifications = (await Notification.requestPermission()) === 'granted'; } catch (_) { settings.notifications = false; }
      }
    }
    persistSettings(); renderSettings();
    toast(settings.notifications ? 'Напоминания включены' : 'Напоминания выключены');
  });

  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), subscriptions: subs, settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'subly-backup.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Копия сохранена');
  });
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.subscriptions;
      if (!Array.isArray(incoming) || !incoming.every(validSub)) throw new Error('format');
      const ok = await confirmDialog({ title: 'Загрузить копию?', text: `В файле ${incoming.length} ${plural(incoming.length, 'подписка', 'подписки', 'подписок')}. Текущий список будет заменён.`, ok: 'Загрузить' });
      if (!ok) return;
      subs = incoming.map(normalizeSub);
      if (parsed.settings && !Array.isArray(parsed)) {
        const s = parsed.settings;
        if (THEMES.some(t => t.id === s.theme)) settings.theme = s.theme;
        if (FONTS.some(f => f.id === s.font)) settings.font = s.font;
        if (ICON_STYLES.some(x => x.id === s.icons)) settings.icons = s.icons;
        if (CURRENCIES.includes(s.currency)) settings.currency = s.currency;
        persistSettings(); renderSettings();
      }
      persist(); toast('Подписки загружены');
    } catch (_) { toast('Не удалось прочитать файл'); }
    finally { e.target.value = ''; }
  });
  $('#resetBtn').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Удалить все подписки?', text: 'Список очистится. Если нужна копия — сначала сохраните её.', ok: 'Удалить', danger: true });
    if (ok) { const old = subs; subs = []; persist(); toast('Список очищен', { action: 'Вернуть', onAction: () => { subs = old; persist(); } }); }
  });

  /* ───────── Напоминания ───────── */
  function dueReminder() {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return;
    if (!settings.notifications) return;
    const key = iso(new Date());
    try { if (localStorage.getItem(KEYS.reminded) === key) return; } catch (_) {}
    const due = subs.filter(s => daysUntil(s.date) <= 1);
    if (!due.length) return;
    try { localStorage.setItem(KEYS.reminded, key); } catch (_) {}
    const text = `Скоро спишется: ${due.map(s => s.name).join(', ')}`;
    setTimeout(() => toast(text), 900);
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Subly', { body: text }); } catch (_) {}
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

  /* ───────── Старт ───────── */
  applySettings();
  renderSettings();
  render();
  dueReminder();
})();
