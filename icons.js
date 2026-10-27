/* Subly — каталог сервисов и иконки.
   Иконки нарисованы как стилизованные значки (цвет бренда + простой символ),
   это не официальные логотипы. Всё встроено, интернет не нужен. */
(function () {
  'use strict';

  const F = (d) => d; // inline markup helper

  // Символы 24×24. Контурные рисуются через .glyph (stroke), закрашенные задают fill сами.
  const GLYPHS = {
    play:   F('<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>'),
    music:  F('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
    cloud:  F('<path d="M7.5 18.5a4.5 4.5 0 0 1-.7-8.95 6 6 0 0 1 11.5 1.6 3.9 3.9 0 0 1-.8 7.35z"/>'),
    game:   F('<rect x="3" y="7.5" width="18" height="10" rx="5"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".9" fill="currentColor"/>'),
    spark:  F('<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" fill="currentColor" stroke="none"/><path d="M19 15.5c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5z" fill="currentColor" stroke="none"/>'),
    shield: F('<path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
    book:   F('<path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>'),
    cart:   F('<path d="M3.5 4.5h2.2l2 10.5h9.6l1.7-7.5H6.4"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="16.5" cy="19" r="1.4"/>'),
    heart:  F('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>'),
    news:   F('<rect x="4" y="4.5" width="16" height="15" rx="2.5"/><path d="M8 9h8M8 12.5h8M8 16h5"/>'),
    phone:  F('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'),
    film:   F('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3M6.5 5v14M17.5 5v14"/>'),
    tv:     F('<rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M8.5 20.5h7M12 17v3.5"/>'),
    code:   F('<path d="M8.5 8L4.5 12l4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13"/>'),
    mail:   F('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/>'),
    send:   F('<path d="M20.5 3.8L3.8 10.6l6 2.2 2.4 6.2 3-4.2 4.5 3.3z" fill="currentColor" stroke="none"/>'),
    grid:   F('<rect x="4" y="4" width="7" height="7" rx="1.2" fill="currentColor" stroke="none"/><rect x="13" y="4" width="7" height="7" rx="1.2" fill="currentColor" stroke="none"/><rect x="4" y="13" width="7" height="7" rx="1.2" fill="currentColor" stroke="none"/><rect x="13" y="13" width="7" height="7" rx="1.2" fill="currentColor" stroke="none"/>'),
    box:    F('<path d="M12 3.5l8 4.5v8l-8 4.5-8-4.5V8z"/><path d="M4 8l8 4.5L20 8M12 12.5v8"/>'),
    wallet: F('<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16" height="11" rx="2.5"/><circle cx="16" cy="13.5" r="1.1" fill="currentColor"/>'),
    star:   F('<path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 17l-5.2 2.8 1-5.8L3.6 9.9l5.8-.8z"/>')
  };

  // Глифы, доступные при создании «своей» подписки
  const CUSTOM_GLYPHS = ['spark', 'play', 'music', 'cloud', 'game', 'shield', 'book', 'cart',
    'heart', 'news', 'phone', 'tv', 'code', 'mail', 'wallet', 'star'];

  const PALETTE = ['#7A5CFF', '#3B82F6', '#06B6D4', '#10B981', '#84CC16',
    '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#64748B'];

  const LEGACY_COLORS = {
    violet: '#7A5CFF', green: '#10B981', orange: '#F97316', blue: '#3B82F6', red: '#EF4444'
  };

  const DARK_FG = '#1A1A1A';

  // [id, название, цвет, символ ("t:" — буквы), ключевые слова через запятую, цвет символа]
  const RAW = [
    ['youtube',   'YouTube',       '#FF0033', 'play',  'youtube,ютуб,ютьюб'],
    ['netflix',   'Netflix',       '#E50914', 't:N',   'netflix,нетфликс'],
    ['spotify',   'Spotify',       '#1DB954', 'music', 'spotify,спотифай'],
    ['chatgpt',   'ChatGPT',       '#10A37F', 'spark', 'chatgpt,чатгпт,openai,gpt'],
    ['claude',    'Claude',        '#D97757', 'spark', 'claude,клод,anthropic'],
    ['telegram',  'Telegram',      '#27A7E7', 'send',  'telegram,телеграм,телеграмм'],
    ['yplus',     'Яндекс Плюс',   '#7A3CFF', 't:+',   'яндекс плюс,yandex plus'],
    ['kinopoisk', 'Кинопоиск',     '#FF5500', 'film',  'кинопоиск,kinopoisk'],
    ['icloud',    'iCloud',        '#3D8BFD', 'cloud', 'icloud,айклауд,apple one'],
    ['applemusic','Apple Music',   '#FA243C', 'music', 'apple music,эппл музыка'],
    ['ymusic',    'Яндекс Музыка', '#FFCC00', 'music', 'яндекс музыка,yandex music', DARK_FG],
    ['vkmusic',   'VK Музыка',     '#0077FF', 'music', 'вк музыка,vk музыка,vk music'],
    ['zvuk',      'Звук',          '#6A2BFF', 'music', 'звук,zvuk'],
    ['ivi',       'ivi',           '#EA003D', 't:ivi', 'ivi,иви'],
    ['okko',      'Okko',          '#6A3DF0', 'play',  'okko,окко'],
    ['disney',    'Disney+',       '#113CCF', 't:D+',  'disney,дисней'],
    ['prime',     'Prime Video',   '#00A8E1', 'play',  'prime video,прайм видео,amazon prime'],
    ['twitch',    'Twitch',        '#9146FF', 'tv',    'twitch,твич'],
    ['sberprime', 'СберПрайм',     '#21A038', 't:С',   'сберпрайм,сбер прайм,sberprime'],
    ['tbank',     'Т-Банк Pro',    '#FFDD2D', 't:T',   'тинькофф,tinkoff,т-банк,tbank,т банк', DARK_FG],
    ['gemini',    'Gemini',        '#4285F4', 'spark', 'gemini,джемини'],
    ['googleone', 'Google One',    '#34A853', 'cloud', 'google one,гугл ван'],
    ['dropbox',   'Dropbox',       '#0061FF', 'box',   'dropbox,дропбокс'],
    ['ydisk',     'Яндекс Диск',   '#FFCC00', 'cloud', 'яндекс диск,yandex disk', DARK_FG],
    ['m365',      'Microsoft 365', '#D83B01', 'grid',  'microsoft,майкрософт,office 365,m365'],
    ['discord',   'Discord',       '#5865F2', 'game',  'discord,дискорд'],
    ['vk',        'VK',            '#0077FF', 't:VK',  'vk,вк,вконтакте'],
    ['boosty',    'Boosty',        '#F15F2C', 't:B',   'boosty,бусти'],
    ['xbox',      'Xbox',          '#107C10', 't:X',   'xbox,иксбокс,game pass'],
    ['ps',        'PlayStation',   '#0070D1', 't:PS',  'playstation,плейстейшн,psn,ps plus'],
    ['github',    'GitHub',        '#24292F', 'code',  'github,гитхаб,copilot'],
    ['notion',    'Notion',        '#2B2B2B', 't:N',   'notion,ноушн'],
    ['figma',     'Figma',         '#A259FF', 't:F',   'figma,фигма'],
    ['adobe',     'Adobe',         '#FA0F00', 't:A',   'adobe,адоб,photoshop,фотошоп,creative cloud'],
    ['canva',     'Canva',         '#00A5B5', 't:C',   'canva,канва'],
    ['duolingo',  'Duolingo',      '#58CC02', 'book',  'duolingo,дуолинго'],
    ['skyeng',    'Skyeng',        '#1FB6FF', 'book',  'skyeng,скайенг'],
    ['ozon',      'Ozon',          '#005BFF', 't:O',   'ozon,озон'],
    ['wb',        'Wildberries',   '#CB11AB', 't:WB',  'wildberries,вайлдберриз,вб,wb'],
    ['amazon',    'Amazon',        '#FF9900', 'cart',  'amazon,амазон', DARK_FG],
    ['vpn',       'VPN',           '#3B82F6', 'shield','vpn,впн'],
    ['fitness',   'Спорт',         '#F43F5E', 'heart', 'спорт,фитнес,зал,gym,fitness'],
    ['news',      'Новости',       '#64748B', 'news',  'новости,газета,журнал']
  ];

  const CATALOG = {};
  const LIST = [];
  RAW.forEach(([id, n, c, g, k, f]) => {
    const e = { id, n, c, g, k: k.split(','), f: f || '#fff' };
    CATALOG[id] = e;
    LIST.push(e);
  });

  function norm(s) {
    return ' ' + String(s || '').toLowerCase().replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9+]+/g, ' ').trim() + ' ';
  }

  // Определяет сервис по названию: выигрывает самое длинное совпавшее слово или фраза.
  function detectService(name) {
    const text = norm(name);
    if (text.trim().length < 2) return null;
    let best = null, bestLen = 0;
    LIST.forEach(e => {
      e.k.forEach(kw => {
        const key = norm(kw);
        if (text.includes(key) && kw.length > bestLen) { best = e.id; bestLen = kw.length; }
      });
    });
    return best;
  }

  function search(query) {
    const q = norm(query).trim();
    if (!q) return LIST.slice();
    return LIST.filter(e => norm(e.n).includes(q) || e.k.some(k => norm(k).includes(q)));
  }

  function resolveColor(c) {
    if (!c) return PALETTE[0];
    if (LEGACY_COLORS[c]) return LEGACY_COLORS[c];
    return /^#[0-9a-f]{6}$/i.test(c) ? c : PALETTE[0];
  }

  function fgFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 175 ? DARK_FG : '#fff';
  }

  function svg(g) {
    if (g && g.indexOf('t:') === 0) {
      const t = g.slice(2);
      const fs = t.length === 1 ? 16 : t.length === 2 ? 12.5 : 10;
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="12" dy=".35em" text-anchor="middle" ' +
        'font-size="' + fs + '" font-weight="800" fill="currentColor">' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>';
    }
    return '<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">' + (GLYPHS[g] || GLYPHS.spark) + '</svg>';
  }

  window.SublyIcons = { CATALOG, LIST, GLYPHS, CUSTOM_GLYPHS, PALETTE, detectService, search, resolveColor, fgFor, svg };
})();
