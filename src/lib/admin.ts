import { useEffect, useState } from 'react';
import { supabase, useSession } from './supabase';

/* The private statistics page (supabase/migrations/0010_admin_stats.sql). Who is an admin is decided on the
   server; the client only asks, to know whether to show the menu item. */

export interface AdminStats {
  totals: { users: number; confirmed: number; new_today: number; new_7d: number; teachers: number; push: number };
  daily: { day: string; signups: number; active: number }[];
  returning: { learners: number; days2: number; days3: number; days7: number; active_today: number; active_7d: number };
  plans: { trial_active: number; trial_ended: number; paid_active: number; paid_ever: number; promo_active: number; teacher_active: number };
  top_topics: { id: string; n: number }[];
}

const cache = new Map<string, boolean>();

/** true when the signed-in user is listed in public.admins */
export function useIsAdmin() {
  const { user } = useSession();
  const [admin, setAdmin] = useState(() => (user ? cache.get(user.id) ?? false : false));
  useEffect(() => {
    if (!supabase || !user) {
      setAdmin(false);
      return;
    }
    if (cache.has(user.id)) {
      setAdmin(cache.get(user.id)!);
      return;
    }
    let alive = true;
    supabase.rpc('is_admin').then(({ data }) => {
      cache.set(user.id, !!data);
      if (alive) setAdmin(!!data);
    });
    return () => {
      alive = false;
    };
  }, [user]);
  return admin;
}

export async function loadAdminStats(days: number): Promise<AdminStats> {
  if (!supabase) throw new Error('offline');
  const { data, error } = await supabase.rpc('admin_stats', { p_days: days });
  if (error) throw error;
  return data as AdminStats;
}
