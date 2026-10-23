import { useEffect, useState } from 'react';
import { supabase, SUPABASE_KEY, SUPABASE_URL, useSession } from './supabase';

/** prices in US dollars (card payments go through Freemius); roubles and soms are only shown as a guide */
export const PRICES = { month: 3.99, year: 29.99, teacher: 7.99 };
const KGS_PER_USD = 87;
export const inSom = (usd: number) => Math.round((usd * KGS_PER_USD) / 5) * 5;

export type Currency = 'RUB' | 'KGS' | 'USD';
/** rough rates (October 2026); the card is always charged in dollars */
const RATE: Record<Currency, number> = { RUB: 83, KGS: KGS_PER_USD, USD: 1 };
const CURRENCY_KEY = 'stem-currency';
const RU_TZ = /^(Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Saratov|Ulyanovsk|Astrakhan|Kirov)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr))$/;

/** the visitor's own currency: a choice made on the plans page, else guessed from the time zone and languages */
export function localCurrency(): Currency {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    if (saved === 'RUB' || saved === 'KGS' || saved === 'USD') return saved;
  } catch {
    // storage unavailable: guess below
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  if (tz === 'Asia/Bishkek') return 'KGS';
  if (RU_TZ.test(tz)) return 'RUB';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (langs.some((l) => /-RU$/i.test(l))) return 'RUB';
  if (langs.some((l) => /^ky|-KG$/i.test(l))) return 'KGS';
  return 'USD';
}
export function saveCurrency(c: Currency) {
  try {
    localStorage.setItem(CURRENCY_KEY, c);
  } catch {
    // the choice just won't be remembered
  }
}

/** a dollar price in the given currency, rounded the way a price tag would be: "330 ₽", "345 сом", "$3.99" */
export function money(usd: number, cur: Currency, lang: 'ru' | 'en' = 'ru') {
  if (cur === 'USD') return `$${usd < 1 ? usd.toFixed(2) : String(usd)}`;
  const v = usd * RATE[cur];
  const step = v < 50 ? 1 : v < 1000 ? 5 : 10;
  const n = Math.max(1, Math.round(v / step) * step).toLocaleString('ru-RU');
  return cur === 'RUB' ? `${n} ₽` : `${n} ${lang === 'ru' ? 'сом' : 'KGS'}`;
}

const env = import.meta.env;
export const FREEMIUS = {
  productId: env.VITE_FREEMIUS_PRODUCT_ID || env.NEXT_PUBLIC_FREEMIUS_PRODUCT_ID,
  publicKey: env.VITE_FREEMIUS_PUBLIC_KEY || env.NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY,
  planId: env.VITE_FREEMIUS_PLAN_ID || env.NEXT_PUBLIC_FREEMIUS_PLAN_ID,
  teacherPlanId: env.VITE_FREEMIUS_TEACHER_PLAN_ID || env.NEXT_PUBLIC_FREEMIUS_TEACHER_PLAN_ID,
};
/** where to ask for another way to pay (e.g. a Telegram link): cards of Russian banks don't work abroad */
export const PAY_CONTACT = (env.VITE_PAY_CONTACT as string | undefined) || '';
export const paymentsEnabled = !!(FREEMIUS.productId && FREEMIUS.publicKey && FREEMIUS.planId);

declare global {
  interface Window {
    FS?: { Checkout: new (o: Record<string, unknown>) => { open: (o: Record<string, unknown>) => void } };
  }
}

let script: Promise<void> | null = null;
const loadCheckout = () =>
  (script ??= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = 'https://checkout.freemius.com/js/v1/';
    el.onload = () => resolve();
    el.onerror = () => {
      script = null;
      reject(new Error('checkout_load'));
    };
    document.head.appendChild(el);
  }));

/** opens the Freemius card checkout; Pro is granted by the server webhook, matched by this e-mail */
export async function openCheckout(period: 'month' | 'year', email: string, onPaid: () => void, tier: 'pro' | 'teacher' = 'pro') {
  await loadCheckout();
  const checkout = new window.FS!.Checkout({
    product_id: FREEMIUS.productId,
    plan_id: tier === 'teacher' && FREEMIUS.teacherPlanId ? FREEMIUS.teacherPlanId : FREEMIUS.planId,
    public_key: FREEMIUS.publicKey,
    image: `${location.origin}/icon-512.png`,
  });
  checkout.open({
    name: tier === 'teacher' ? 'STEM Visualizer — Учитель' : 'STEM Visualizer Pro',
    billing_cycle: period === 'month' ? 'monthly' : 'annual',
    user_email: email,
    readonly_user: true,
    success: onPaid,
  });
}
export const FREE_MENTOR_DAILY = 5;
export const GUEST_MENTOR_DAILY = 3;

export interface Plan {
  pro: boolean;
  plan: 'pro' | 'teacher' | null;
  expiresAt: Date | null;
  /** the current Pro is the free week */
  trial: boolean;
  /** signed in and never had any plan, so the free week can still be started */
  canTrial: boolean;
  loading: boolean;
  refresh: () => void;
}

const PLAN_CHANGED = 'plan-changed';
/** tells every usePlan() on the page to reload, e.g. after a trial starts or a code is redeemed */
export const planChanged = () => window.dispatchEvent(new Event(PLAN_CHANGED));

/** the signed-in user's subscription (read-only on the client; only the server grants Pro) */
export function usePlan(): Plan {
  const { user } = useSession();
  const [state, setState] = useState<Omit<Plan, 'refresh'>>({ pro: false, plan: null, expiresAt: null, trial: false, canTrial: false, loading: !!supabase });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const again = () => setTick((n) => n + 1);
    window.addEventListener(PLAN_CHANGED, again);
    return () => window.removeEventListener(PLAN_CHANGED, again);
  }, []);
  useEffect(() => {
    if (!supabase || !user) {
      setState({ pro: false, plan: null, expiresAt: null, trial: false, canTrial: false, loading: false });
      return;
    }
    let alive = true;
    supabase
      .from('subscriptions')
      .select('plan, status, expires_at, source')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        const exp = data?.expires_at ? new Date(data.expires_at) : null;
        const active = !!data && data.status === 'active' && !!exp && exp > new Date();
        setState({ pro: active, plan: active ? data!.plan : null, expiresAt: exp, trial: active && data!.source === 'trial', canTrial: !data && !error, loading: false });
      });
    return () => {
      alive = false;
    };
  }, [user, tick]);
  return { ...state, refresh: () => setTick((n) => n + 1) };
}

/** starts the free week of Pro (once per account; the server checks) and returns when it ends */
export async function startTrial(): Promise<Date> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc('start_trial');
  if (error) throw error;
  planChanged();
  return new Date(data as string);
}

/** the learner's secret link for a parent: progress and a pay button */
export async function parentLink(): Promise<string> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc('parent_link');
  if (error) throw error;
  return `${window.location.origin}/#/parent/${data as string}`;
}

export async function redeemCode(code: string): Promise<Date> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc('redeem_code', { p_code: code });
  if (error) throw error;
  return new Date(data as string);
}

export function redeemErrorText(e: unknown, lang: 'ru' | 'en') {
  const msg = e instanceof Error ? e.message : String(e);
  const map: [RegExp, string, string][] = [
    [/not_signed_in/, 'Сначала войди в аккаунт.', 'Log in first.'],
    [/invalid_code/, 'Такого кода нет. Проверь, нет ли опечатки.', 'No such code. Check for typos.'],
    [/code_expired/, 'Срок действия кода истёк.', 'This code has expired.'],
    [/code_used_up/, 'Код уже использован максимальное число раз.', 'This code has been used up.'],
    [/already_redeemed/, 'Ты уже активировал этот код.', 'You have already used this code.'],
    [/offline/, 'Аккаунты ещё не подключены.', 'Accounts are not connected yet.'],
    [/trial_used/, 'Пробная неделя уже была на этом аккаунте.', 'This account has already had its free week.'],
    [/not_confirmed/, 'Сначала подтверди почту кодом из письма.', 'Confirm your e-mail with the code first.'],
  ];
  const hit = map.find(([r]) => r.test(msg));
  return hit ? (lang === 'ru' ? hit[1] : hit[2]) : lang === 'ru' ? 'Не получилось. Попробуй ещё раз.' : 'Something went wrong. Try again.';
}

/** headers for calls to our own API, so the server knows who is asking */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  const h: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  // Supabase Edge Functions also want the public key
  if (SUPABASE_KEY && !import.meta.env.DEV) h.apikey = SUPABASE_KEY;
  return h;
}

/** the mentor: the local Express server in development, a Supabase Edge Function in production */
export const MENTOR_URL = import.meta.env.DEV || !SUPABASE_URL ? '/api/mentor' : `${SUPABASE_URL}/functions/v1/mentor`;
