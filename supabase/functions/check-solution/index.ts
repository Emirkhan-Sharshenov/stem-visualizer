// Checks a photo of a learner's own handwritten solution with the Gemini API. Paid plans only: the free Pro week doesn't open it.
// The photo goes to the model and nowhere else; nothing is stored.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { CHECK_CONFIG, CHECK_DAILY, CHECK_MODELS, checkContents, checkPhoto, checkSystem, isPaidSub, parseCheck } from '../_shared/solutionCheck.ts';

const MODELS = [Deno.env.get('GEMINI_MODEL'), ...CHECK_MODELS].filter(Boolean) as string[];
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** the raw model answer, or why there is none */
async function ask(system: string, contents: unknown[]): Promise<{ text?: string; busy?: boolean }> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return {};
  for (const model of MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: CHECK_CONFIG }),
    }).catch(() => null);
    if (!res) continue;
    if (res.status === 429) return { busy: true };
    if (!res.ok) {
      console.warn(`[check-solution] ${model} ${res.status}`);
      continue;
    }
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
    if (text) return { text };
  }
  return {};
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body: { image?: unknown; task?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const { data: who } = token.split('.').length === 3 ? await admin.auth.getUser(token) : { data: { user: null } };
  const userId = who.user?.id;
  if (!userId) return json({ error: 'not_signed_in' }, 401);
  const { data: sub } = await admin.from('subscriptions').select('status, expires_at, source').eq('user_id', userId).maybeSingle();
  if (!isPaidSub(sub)) return json({ error: 'paid_only' }, 402);

  const photo = checkPhoto(body.image);
  if (!photo) return json({ error: 'bad_photo' }, 400);
  const ru = body.lang !== 'en';
  const task = String(body.task ?? '').trim().slice(0, 1000);

  const counter = `check:${userId}`;
  const { data: left, error: countError } = await admin.rpc('use_mentor', { p_key: counter, p_limit: CHECK_DAILY });
  if (countError) {
    console.warn('[check-solution] counter', countError.message);
    return json({ error: 'failed' }, 503);
  }
  if ((left as number) < 0) return json({ error: 'limit', limit: CHECK_DAILY }, 429);
  // a check that never reached the learner shouldn't use up one of theirs
  const refund = () => admin.from('mentor_counter').update({ count: CHECK_DAILY - (left as number) - 1 }).eq('key', counter).eq('day', new Date().toISOString().slice(0, 10));

  const out = await ask(checkSystem(ru), checkContents(photo, task, ru));
  const check = out.text ? parseCheck(out.text) : null;
  if (!check) {
    await refund();
    return json({ error: out.busy ? 'busy' : 'failed' }, 503);
  }
  return json({ check, left });
});
