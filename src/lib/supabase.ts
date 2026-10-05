import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/*
 * Supabase is optional: without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * the site works as before and keeps progress in the browser only.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } }) : null;

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

const appUrl = () => `${window.location.origin}${window.location.pathname}#/app`;

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
