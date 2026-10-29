import { supabase } from './supabase';

/* The "Бой функций" rating (supabase/migrations/0011_funcwar_rating.sql): Elo from 1000, results applied on the server.
   The bots that stand in when nobody is in the queue are in components/games/funcwar/bots.ts. */

export interface FwMe { rating: number; games: number; wins: number; place: number | null }
export interface FwRow { nick: string; rating: number; games: number; wins: number; me: boolean }
export interface FwResult { rating: number; delta: number; pending?: boolean; capped?: boolean }

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data as T;
}

export const fwMe = () => call<FwMe | null>('fw_me');
export const fwTop = (limit = 20) => call<FwRow[]>('fw_top', { p_limit: limit });
export const fwBotResult = (bot: number, won: boolean) => call<FwResult>('fw_bot_result', { p_bot: bot, p_won: won });
export const fwPvpResult = (match: string, opponent: string, won: boolean) => call<FwResult>('fw_pvp_result', { p_match: match, p_opponent: opponent, p_won: won });
