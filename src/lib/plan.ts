import { useEffect, useState } from 'react';
import { supabase, useSession } from './supabase';

/** prices in US dollars (card payments go through Freemius); KGS is only a rough hint */
export const PRICES = { month: 3.99, year: 29.99, teacher: 7.99 };
const KGS_PER_USD = 87;
export const inSom = (usd: number) => Math.round((usd * KGS_PER_USD) / 5) * 5;

const env = import.meta.env;
export const FREEMIUS = {
  productId: env.VITE_FREEMIUS_PRODUCT_ID || env.NEXT_PUBLIC_FREEMIUS_PRODUCT_ID,
  publicKey: env.VITE_FREEMIUS_PUBLIC_KEY || env.NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY,
  planId: env.VITE_FREEMIUS_PLAN_ID || env.NEXT_PUBLIC_FREEMIUS_PLAN_ID,
  teacherPlanId: env.VITE_FREEMIUS_TEACHER_PLAN_ID || env.NEXT_PUBLIC_FREEMIUS_TEACHER_PLAN_ID,
};
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
    image: `${location.origin}/favicon.svg`,
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
  loading: boolean;
  refresh: () => void;
}

/** the signed-in user's subscription (read-only on the client; only the server grants Pro) */
export function usePlan(): Plan {
  const { user } = useSession();
  const [state, setState] = useState<Omit<Plan, 'refresh'>>({ pro: false, plan: null, expiresAt: null, loading: !!supabase });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!supabase || !user) {
      setState({ pro: false, plan: null, expiresAt: null, loading: false });
      return;
    }
    let alive = true;
    supabase
      .from('subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        const exp = data?.expires_at ? new Date(data.expires_at) : null;
        const active = !!data && data.status === 'active' && !!exp && exp > new Date();
        setState({ pro: active, plan: active ? data!.plan : null, expiresAt: exp, loading: false });
      });
    return () => {
      alive = false;
    };
  }, [user, tick]);
  return { ...state, refresh: () => setTick((n) => n + 1) };
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
  ];
  const hit = map.find(([r]) => r.test(msg));
  return hit ? (lang === 'ru' ? hit[1] : hit[2]) : lang === 'ru' ? 'Не получилось. Попробуй ещё раз.' : 'Something went wrong. Try again.';
}

/** headers for calls to our own API, so the server knows who is asking */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
