import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const SUBS_KEY = 'subly-subscriptions-v1';
const SETTINGS_KEY = 'subly-settings-v1';
const isNative = Capacitor.isNativePlatform();

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function stableId(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 2000000000 + 1;
}

function atLocalTime(dateString, hour, minute = 0) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || '');
  if (!match) return null;
  const date = new Date(+match[1], +match[2] - 1, +match[3], hour, minute, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function reminderDates(subscription) {
  // Дата в карточке считается датой окончания/списания в 09:00 по местному времени.
  const expiry = atLocalTime(subscription.date, 9, 0);
  if (!expiry) return [];
  const plans = [
    { key: '7d', offset: 7 * 86400000, hour: 10, body: `истечёт через 7 дней` },
    { key: '3d', offset: 3 * 86400000, hour: 10, body: `истечёт через 3 дня` },
    { key: '1d', offset: 1 * 86400000, hour: 10, body: `истечёт через 1 день` },
    { key: '12h', offset: 12 * 3600000, exact: true, body: `истечёт через 12 часов` }
  ];
  return plans.map(plan => {
    const at = new Date(expiry.getTime() - plan.offset);
    if (!plan.exact) at.setHours(plan.hour, 0, 0, 0);
    return { key: plan.key, at, body: plan.body };
  }).filter(item => item.at.getTime() > Date.now());
}

async function syncNotifications() {
  if (!isNative) return;
  const settings = readJSON(SETTINGS_KEY, {});
  if (!settings.notifications) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
      }
    } catch (e) { console.warn('Subly: cancel notifications failed', e); }
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
    }

    const subscriptions = readJSON(SUBS_KEY, []);
    const notifications = [];
    for (const sub of subscriptions) {
      if (!sub || !sub.id || !sub.name || !sub.date) continue;
      for (const reminder of reminderDates(sub)) {
        notifications.push({
          id: stableId(`${sub.id}:${reminder.key}`),
          title: 'Subly — напоминание о подписке',
          body: `Ваша подписка «${sub.name}» ${reminder.body}!`,
          schedule: { at: reminder.at },
          smallIcon: 'ic_stat_icon_config_sample',
          sound: undefined,
          extra: { subscriptionId: sub.id, reminder: reminder.key }
        });
      }
    }
    if (notifications.length) await LocalNotifications.schedule({ notifications });
  } catch (e) {
    console.warn('Subly: notification scheduling failed', e);
  }
}

async function requestPermission() {
  if (!isNative) return false;
  try {
    let permissions = await LocalNotifications.checkPermissions();
    if (permissions.display !== 'granted') {
      permissions = await LocalNotifications.requestPermissions();
    }
    const granted = permissions.display === 'granted';
    const settings = readJSON(SETTINGS_KEY, {});
    settings.notifications = granted;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    await syncNotifications();
    window.dispatchEvent(new Event('subly-native-permission-result'));
    return granted;
  } catch (e) {
    console.warn('Subly: notification permission request failed', e);
    return false;
  }
}

if (isNative) {
  window.SublyNativeNotifications = { sync: syncNotifications, requestPermission };
  window.addEventListener('subly-data-changed', () => { void syncNotifications(); });
  window.addEventListener('subly-request-notification-permission', () => { void requestPermission(); });

  // Android asks for notification permission on the first launch.
  window.addEventListener('load', async () => {
    const settings = readJSON(SETTINGS_KEY, {});
    const askedBefore = localStorage.getItem('subly-notification-permission-asked') === '1';
    if (!askedBefore) {
      localStorage.setItem('subly-notification-permission-asked', '1');
      await requestPermission();
    } else if (settings.notifications) {
      await syncNotifications();
    }
  });
}
