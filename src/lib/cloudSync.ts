import { supabase } from './supabase';
import { mergeProgress, progress, Progress } from './progress';

/*
 * Keeps the browser progress and the user's cloud copy in sync:
 * on sign-in both copies are merged (nothing is lost), then every change is saved with a short debounce.
 */
let stop: (() => void) | null = null;

export function startSync(userId: string) {
  stopSync();
  if (!supabase) return;
  const db = supabase;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let ready = false;

  const push = async () => {
    const data = progress.get();
    await db.from('progress').upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  };

  (async () => {
    const { data } = await db.from('progress').select('data').eq('user_id', userId).maybeSingle();
    const remote = (data?.data ?? null) as Progress | null;
    if (remote) progress.replace(mergeProgress(progress.get(), remote));
    ready = true;
    await push();
  })();

  const unsub = progress.subscribe(() => {
    if (!ready) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 1500);
  });

  // flush before the tab closes
  const onHide = () => ready && push();
  window.addEventListener('pagehide', onHide);

  stop = () => {
    unsub();
    window.removeEventListener('pagehide', onHide);
    if (timer) clearTimeout(timer);
  };
}

export function stopSync() {
  stop?.();
  stop = null;
}

/** start/stop syncing whenever the auth state changes */
export function initCloudSync() {
  if (!supabase) return;
  supabase.auth.getSession().then(({ data }) => data.session && startSync(data.session.user.id));
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) startSync(session.user.id);
    if (event === 'SIGNED_OUT') stopSync();
  });
}
