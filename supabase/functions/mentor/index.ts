// AI mentor as a Supabase Edge Function (Deno).
// Answers about the topic the learner has open, using the Gemini API; counts free questions per day.
import { createClient } from 'npm:@supabase/supabase-js@2';

const FREE_DAILY = 5;
const GUEST_DAILY = 3;
const MODELS = [Deno.env.get('GEMINI_MODEL'), 'gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-3.5-flash-lite'].filter(Boolean) as string[];

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'X-Mentor-Left',
};
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { ...CORS, ...extra, 'Content-Type': 'application/json' } });
const clip = (v: unknown, n: number) => String(v ?? '').slice(0, n);

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

/** who is asking and how many questions they have left; Pro is unlimited */
async function allowance(req: Request): Promise<{ ok: boolean; left: number | 'unlimited' }> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  let userId: string | null = null;
  if (token.split('.').length === 3) {
    const { data } = await admin.auth.getUser(token);
    userId = data.user?.id ?? null;
  }
  if (userId) {
    const { data: sub } = await admin.from('subscriptions').select('status, expires_at').eq('user_id', userId).maybeSingle();
    if (sub && sub.status === 'active' && new Date(sub.expires_at) > new Date()) return { ok: true, left: 'unlimited' };
  }
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const key = userId ? `u:${userId}` : `g:${await sha256(ip + (Deno.env.get('SUPABASE_URL') ?? ''))}`;
  const { data, error } = await admin.rpc('use_mentor', { p_key: key, p_limit: userId ? FREE_DAILY : GUEST_DAILY });
  if (error) {
    console.warn('[mentor] counter', error.message);
    return { ok: true, left: 0 };
  }
  const left = data as number;
  return left < 0 ? { ok: false, left: 0 } : { ok: true, left };
}

async function gemini(system: string, contents: unknown[]): Promise<{ text?: string; busy?: boolean }> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return {};
  for (const model of MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 4000, temperature: 0.4 } }),
    }).catch(() => null);
    if (!res) continue;
    if (res.status === 429) return { busy: true };
    if (!res.ok) {
      console.warn(`[mentor] ${model} ${res.status}`);
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
  let body: { question?: string; topic?: Record<string, unknown> | null; history?: { role: string; text: string }[]; lang?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const q = clip(body.question, 600).trim();
  if (!q) return json({ error: 'empty' }, 400);
  const ru = body.lang !== 'en';

  const allow = await allowance(req);
  if (!allow.ok) return json({ error: 'limit', limit: FREE_DAILY }, 402);
  const leftHeader = { 'X-Mentor-Left': String(allow.left === 'unlimited' ? 'Infinity' : allow.left) };

  const t = body.topic && typeof body.topic === 'object' ? body.topic : null;
  const context = t
    ? `Тема, открытая у ученика: «${clip(t.title, 200)}» (${clip(t.subject, 20)}, ${clip(t.grade, 3)} класс).
Вступление: ${clip(t.intro, 800)}
Содержание темы в учебнике:
${clip(t.points, 3500)}${t.formula ? `\nГлавная формула: ${clip(t.formula, 200)}` : ''}`
    : 'Ученик не открыл конкретную тему.';
  const system = `Ты — наставник на сайте STEM Visualizer: школьный учебник физики, химии и биологии (5–11 классы, Кыргызстан, подготовка к ОРТ) с интерактивными моделями.
Правила:
- Отвечай на ${ru ? 'русском' : 'английском'} языке, коротко: до 150–180 слов. Без вступлений и повторения вопроса.
- Объясняй просто, через наглядный образ или пример из жизни, затем точная формулировка.
- Опирайся на содержание открытой темы; если вопрос о другом, всё равно помоги.
- Формулы пиши в LaTeX внутри $...$, например $F = ma$. Используй **жирный** для ключевых слов и короткие списки.
- В задачах разбирай решение по шагам с единицами измерения.
- Если ученик просит проверить его — задай вопросы по одному и жди ответа.
- Отвечай только на учебные вопросы; на остальное вежливо верни к учёбе.

${context}`;
  const turns = (Array.isArray(body.history) ? body.history : [])
    .slice(-6)
    .filter((m) => m && (m.role === 'user' || m.role === 'mentor'))
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: clip(m.text, 1500) }] }));

  const out = await gemini(system, [...turns, { role: 'user', parts: [{ text: q }] }]);
  if (out.busy) return json({ answer: ru ? 'Сейчас наставнику пишет слишком много людей. Подожди минуту и спроси снова.' : 'The mentor is busy right now. Wait a minute and ask again.' }, 200, leftHeader);
  if (out.text) return json({ answer: out.text }, 200, leftHeader);

  // no AI available: answer from the textbook itself
  const answer = t
    ? ru
      ? `ИИ-наставник сейчас недоступен, но вот главное по теме **«${clip(t.title, 200)}»**:\n\n${clip(t.intro, 600)}\n\n${clip(t.points, 900)
          .split('\n')
          .slice(0, 4)
          .map((l) => `- ${l}`)
          .join('\n')}`
      : `The AI mentor is unavailable right now. Key points of **“${clip(t.title, 200)}”**:\n\n${clip(t.intro, 600)}`
    : ru
      ? 'ИИ-наставник сейчас недоступен. Открой нужную тему в учебнике — там есть объяснение и модель.'
      : 'The AI mentor is unavailable right now. Open the topic in the textbook for the explanation and model.';
  return json({ answer }, 200, leftHeader);
});
