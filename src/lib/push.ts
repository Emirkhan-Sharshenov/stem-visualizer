import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { dayStreak, progress } from './progress';

/* Installing the site as an app and push reminders about the streak (see supabase/migrations/0008_push.sql
   and the push-remind function). The service worker only shows pushes; it caches nothing. */

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
const HOUR_KEY = 'stem-push-hour';
const TOUCH_KEY = 'stem-push-touch';

export const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
export const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const pushable = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID && !!supabase;

const today = () => new Date().toISOString().slice(0, 10);
const getHour = () => {
  try {
    return Number(localStorage.getItem(HOUR_KEY) ?? 18);
  } catch {
    return 18;
  }
};

function keyBytes(b64: string) {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function save(sub: PushSubscription, lang: string) {
  const j = sub.toJSON();
  const p = progress.get();
  await supabase!.rpc('push_save', {
    p_endpoint: sub.endpoint,
    p_p256dh: j.keys?.p256dh ?? '',
    p_auth: j.keys?.auth ?? '',
    p_lang: lang,
    p_tz: -new Date().getTimezoneOffset(),
    p_hour: getHour(),
    p_streak: dayStreak(p),
    p_active: p.days.includes(today()) ? today() : null,
  });
}

let installEvent: (Event & { prompt: () => Promise<void> }) | null = null;
const installListeners = new Set<() => void>();

/** registers the service worker, keeps the install prompt for later and tells the server about study days */
export function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e as typeof installEvent;
    installListeners.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    installListeners.forEach((f) => f());
  });
  navigator.serviceWorker.register('/sw.js').catch(() => {});
  // the first activity of a day moves last_active, so no reminder comes on a day the learner already studied
  const touch = async () => {
    if (!pushable() || !progress.get().days.includes(today())) return;
    try {
      if (localStorage.getItem(TOUCH_KEY) === today()) return;
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) return;
      localStorage.setItem(TOUCH_KEY, today());
      await save(sub, localStorage.getItem('lang') === 'en' ? 'en' : 'ru');
    } catch {
      /* the next activity tries again */
    }
  };
  progress.subscribe(touch);
  touch();
}

export type PushState = 'unsupported' | 'ios-install' | 'denied' | 'off' | 'on' | 'busy';

/** the reminder switch and the "install the app" button */
export function usePwa(lang: 'ru' | 'en') {
  const [state, setState] = useState<PushState>('busy');
  const [canInstall, setCanInstall] = useState(!!installEvent);
  const [hour, setHourState] = useState(getHour);

  useEffect(() => {
    const f = () => setCanInstall(!!installEvent);
    installListeners.add(f);
    return () => {
      installListeners.delete(f);
    };
  }, []);
  useEffect(() => {
    (async () => {
      // iPhone shows pushes only to a site added to the home screen
      if (isIos() && !isStandalone()) return setState('ios-install');
      if (!pushable()) return setState('unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      const reg = await navigator.serviceWorker.getRegistration();
      setState((await reg?.pushManager.getSubscription()) ? 'on' : 'off');
    })().catch(() => setState('unsupported'));
  }, []);

  const enable = async () => {
    setState('busy');
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setState('denied');
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID!) }));
      await save(sub, lang);
      setState('on');
    } catch (e) {
      console.error(e);
      setState('off');
    }
  };
  const disable = async () => {
    setState('busy');
    try {
      const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription();
      if (sub) {
        await supabase!.rpc('push_remove', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
    } finally {
      setState('off');
    }
  };
  const setHour = async (h: number) => {
    setHourState(h);
    try {
      localStorage.setItem(HOUR_KEY, String(h));
      const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription();
      if (sub) await save(sub, lang);
    } catch {
      /* kept locally; saved with the next activity */
    }
  };
  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    installEvent = null;
    setCanInstall(false);
  };
  return { state, enable, disable, hour, setHour, canInstall, install };
}
