import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/*
 * Supabase is optional: without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * the site works as before and keeps progress in the browser only.
 */
const env = import.meta.env;
const url = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
// either the new publishable key (sb_publishable_…) or the legacy anon key
const key = (env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

/** the address the page was opened with: e-mail links and OAuth return tokens here */
export const landingUrl = typeof window === 'undefined' ? { hash: '', search: '' } : { hash: window.location.hash, search: window.location.search };

// implicit flow: links from e-mails work in any browser, not only the one used to sign up
/** public project URL and key, for calling Edge Functions */
export const SUPABASE_URL = url;
export const SUPABASE_KEY = key;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } }) : null;

export type AuthNotice = 'welcome' | 'confirmed' | 'recovery' | { error: string };

/**
 * Finishes an e-mail confirmation, password-reset or Google sign-in redirect:
 * waits for the session, cleans the URL and tells the app where to go.
 */
export async function completeAuthRedirect(): Promise<{ route: 'app' | 'login' | 'reset'; notice: AuthNotice } | null> {
  if (!supabase) return null;
  const { hash, search } = landingUrl;
  const params = new URLSearchParams(hash.replace(/^#\/?/, '') + '&' + search.replace(/^\?/, ''));
  const isAuth = params.has('access_token') || params.has('error_description') || params.has('code') || params.has('type');
  if (!isAuth) return null;
  const { data } = await supabase.auth.getSession();
  const type = params.get('type');
  const error = params.get('error_description');
  let result: { route: 'app' | 'login' | 'reset'; notice: AuthNotice };
  if (data.session) result = type === 'recovery' ? { route: 'reset', notice: 'recovery' } : { route: 'app', notice: 'welcome' };
  else result = { route: 'login', notice: error ? { error: error.replace(/\+/g, ' ') } : 'confirmed' };
  window.history.replaceState(null, '', `${window.location.pathname}#/${result.route}`);
  return result;
}

export async function updatePassword(password: string) {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export const cloudEnabled = !!supabase;

export interface Profile {
  id: string;
  name: string | null;
  role: 'student' | 'teacher' | null;
  grade: number | null;
}

/** current auth session, kept in sync with Supabase */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready, user: session?.user ?? null };
}

// no hash here: Supabase appends its tokens after "#", and the app routes once they are read
const appUrl = () => `${window.location.origin}${window.location.pathname}`;

export async function signUp(email: string, password: string, meta: { name: string; role: string; grade: number | null }) {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: appUrl() } });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: appUrl() } });
  if (error) throw error;
}

/** confirm an e-mail or a password reset with the code from the letter */
export async function verifyEmailCode(email: string, token: string, type: 'signup' | 'recovery') {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) throw error;
}

export async function resendSignupCode(email: string) {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: appUrl() } });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl() });
  if (error) throw error;
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('id, name, role, grade').eq('id', id).maybeSingle();
  return (data as Profile) ?? null;
}

/** human-readable auth errors */
export function authErrorText(e: unknown, lang: 'ru' | 'en') {
  const msg = e instanceof Error ? e.message : String(e);
  const ru: [RegExp, string][] = [
    [/invalid login credentials/i, 'Неверная почта или пароль.'],
    [/email not confirmed/i, 'Почта не подтверждена. Проверь письмо от нас.'],
    [/already registered|already been registered/i, 'Эта почта уже зарегистрирована. Попробуй войти.'],
    [/password should be/i, 'Пароль слишком простой: минимум 8 символов.'],
    [/rate limit|too many/i, 'Слишком много попыток. Подожди минуту.'],
    [/offline/i, 'Аккаунты ещё не подключены.'],
  ];
  if (lang === 'ru') return ru.find(([r]) => r.test(msg))?.[1] ?? 'Что-то пошло не так. Попробуй ещё раз.';
  return msg === 'offline' ? 'Accounts are not connected yet.' : msg;
}
