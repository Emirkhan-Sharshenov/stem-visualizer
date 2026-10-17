import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/*
 * Experience points and leagues. progress.ts announces every award with a 'stem-xp' event;
 * here signed-in learners' points are batched and sent to add_xp (supabase/migrations/0007_leagues.sql),
 * which caps calls and days on the server. Guests keep their points on the device only.
 */

export const TIERS = [
  { ru: 'Бронза', en: 'Bronze', color: '#B87333', light: '#F6E7DA' },
  { ru: 'Серебро', en: 'Silver', color: '#8A94A3', light: '#ECEFF3' },
  { ru: 'Золото', en: 'Gold', color: '#D6A419', light: '#FBF1D3' },
  { ru: 'Платина', en: 'Platinum', color: '#3BA3B5', light: '#DDF1F4' },
  { ru: 'Изумруд', en: 'Emerald', color: '#21945E', light: '#DCF2E6' },
  { ru: 'Алмаз', en: 'Diamond', color: '#5B6CFF', light: '#E3E6FF' },
];
export const PROMOTE = 7;
export const DEMOTE = 5;

export interface LeagueMember {
  nick: string;
  xp: number;
  me: boolean;
}
export interface League {
  week: string;
  ends: string;
  tier: number;
  xp: number;
  nickname: string;
  members: LeagueMember[];
}
export interface TotalBoard {
  top: LeagueMember[];
  me: { xp: number; rank: number } | null;
}
export interface ClassBoard {
  id: string;
  name: string;
  members: { nick: string; week: number; total: number; me: boolean }[];
}

/* ---------- sending points ---------- */

let pending = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const changed = new Set<() => void>();

async function flush() {
  timer = null;
  if (!supabase || pending <= 0) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    pending = 0;
    return;
  }
  while (pending > 0) {
    const chunk = Math.min(200, pending);
    pending -= chunk;
    const { error } = await supabase.rpc('add_xp', { p_amount: chunk });
    if (error) {
      console.warn('[xp]', error.message);
      break;
    }
  }
  changed.forEach((f) => f());
}

if (typeof window !== 'undefined') {
  window.addEventListener('stem-xp', (e) => {
    pending += (e as CustomEvent<{ amount: number }>).detail.amount;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 1500);
  });
  window.addEventListener('pagehide', () => {
    if (pending > 0) flush();
  });
}

/* ---------- reading the boards ---------- */

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export const myLeague = () => call<League>('my_league');
export const topTotal = () => call<TotalBoard>('top_total');
export const classBoard = () => call<ClassBoard[]>('class_board');
export const setNickname = (nick: string) => call<string>('set_nickname', { p: nick });

/** loads a board and reloads it after this device sends new points */
export function useBoard<T>(load: () => Promise<T>, enabled: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    load()
      .then((d) => live && (setData(d), setError(null)))
      .catch((e) => live && setError(String(e?.message ?? e)));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, n]);
  useEffect(() => {
    const f = () => setN((k) => k + 1);
    changed.add(f);
    return () => {
      changed.delete(f);
    };
  }, []);
  return { data, error, reload: () => setN((k) => k + 1) };
}
