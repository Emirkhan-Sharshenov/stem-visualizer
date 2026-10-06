import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// behind the hosting proxy: real client IPs (for the guest mentor limit) and https
app.set('trust proxy', 1);
const port = process.env.PORT || 3000;

// payment webhooks need the raw body to check the signature
const json = express.json();
app.use((req, res, next) => (req.path.startsWith('/api/billing/') ? next() : json(req, res, next)));

// Initialize Gemini if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

/* ---------- free mentor limit and Pro check ---------- */

const FREE_DAILY = 5;
const GUEST_DAILY = 3;
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const sbKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// the service key stays on the server only; it lets us count usage and read subscriptions reliably
const sbService = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const sbAdmin = sbUrl && sbService ? createClient(sbUrl, sbService, { auth: { persistSession: false } }) : null;
const sbPublic = sbUrl && sbKey ? createClient(sbUrl, sbKey, { auth: { persistSession: false } }) : null;
const memoryUsage = new Map<string, number>(); // fallback when no service key: per process, per day

async function mentorAllowance(req: express.Request): Promise<{ ok: boolean; pro: boolean; left: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  let userId: string | null = null;
  if (token && sbPublic) {
    const { data } = await sbPublic.auth.getUser(token);
    userId = data.user?.id ?? null;
  }
  if (userId && sbAdmin) {
    const { data: sub } = await sbAdmin.from('subscriptions').select('status, expires_at').eq('user_id', userId).maybeSingle();
    const pro = !!sub && sub.status === 'active' && new Date(sub.expires_at) > new Date();
    if (pro) return { ok: true, pro: true, left: Infinity };
    const { data: row } = await sbAdmin.from('mentor_usage').select('count').eq('user_id', userId).eq('day', today).maybeSingle();
    const used = row?.count ?? 0;
    if (used >= FREE_DAILY) return { ok: false, pro: false, left: 0 };
    await sbAdmin.from('mentor_usage').upsert({ user_id: userId, day: today, count: used + 1 });
    return { ok: true, pro: false, left: FREE_DAILY - used - 1 };
  }
  const key = `${userId ?? req.ip}:${today}`;
  const limit = userId ? FREE_DAILY : GUEST_DAILY;
  const used = memoryUsage.get(key) ?? 0;
  if (used >= limit) return { ok: false, pro: false, left: 0 };
  memoryUsage.set(key, used + 1);
  return { ok: true, pro: false, left: limit - used - 1 };
}

/* ---------- Freemius payment webhook: turns a paid license into Pro ---------- */

const FREEMIUS_SECRET = process.env.FREEMIUS_SECRET_KEY;

app.post('/api/billing/freemius', express.raw({ type: '*/*' }), async (req, res) => {
  // always answer 200 so Freemius doesn't retry forever; problems are logged
  res.sendStatus(200);
  if (!FREEMIUS_SECRET || !sbAdmin) return console.warn('[billing] FREEMIUS_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is missing');
  const raw: Buffer = req.body;
  const expected = crypto.createHmac('sha256', FREEMIUS_SECRET).update(raw).digest('hex');
  const got = String(req.headers['x-signature'] || '');
  if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return console.warn('[billing] bad signature');

  let ev: any;
  try {
    ev = JSON.parse(raw.toString('utf8'));
  } catch {
    return;
  }
  const type: string = ev.type || '';
  const license = ev.objects?.license;
  const licenseId = String(license?.id ?? ev.data?.license_id ?? '');
  console.log('[billing]', type, licenseId);

  // license gone or revoked: end Pro now
  if (/^license.(deleted|cancelled)$/.test(type) || /^payment.(refund|dispute.lost)$/.test(type)) {
    if (licenseId) await sbAdmin.from('subscriptions').update({ status: 'canceled', expires_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('external_id', licenseId);
    return;
  }
  if (!license || !/^(license|subscription|payment)./.test(type)) return;

  const email = ev.objects?.user?.email;
  let userId: string | null = null;
  if (email) {
    const { data } = await sbAdmin.rpc('user_id_by_email', { p_email: email });
    userId = (data as string) || null;
  }
  if (!userId) {
    const { data } = await sbAdmin.from('subscriptions').select('user_id').eq('external_id', licenseId).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) return console.warn('[billing] no account for', email);

  // Freemius dates are UTC "YYYY-MM-DD HH:MM:SS"; null means lifetime
  const expires = license.expiration ? new Date(String(license.expiration).replace(' ', 'T') + 'Z') : new Date(Date.now() + 100 * 365 * 864e5);
  const active = !license.is_cancelled && type !== 'license.expired' && expires > new Date();
  // the Teacher plan has its own Freemius plan id
  const teacherPlan = process.env.FREEMIUS_TEACHER_PLAN_ID || process.env.VITE_FREEMIUS_TEACHER_PLAN_ID;
  const plan = teacherPlan && String(license.plan_id) === String(teacherPlan) ? 'teacher' : 'pro';
  await sbAdmin.from('subscriptions').upsert({
    user_id: userId,
    plan,
    status: active ? 'active' : 'expired',
    expires_at: expires.toISOString(),
    source: 'freemius',
    external_id: licenseId,
    updated_at: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// AI mentor: answers about the topic the learner has open (Gemini free tier; model is configurable)
const MODELS = [process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-3.5-flash-lite'].filter(Boolean) as string[];
const clip = (v: unknown, n: number) => String(v ?? '').slice(0, n);

app.post('/api/mentor', async (req, res) => {
  const { question, topic, history, lang = 'ru' } = req.body || {};
  const q = clip(question, 600).trim();
  if (!q) return res.status(400).json({ error: 'empty' });
  const ru = lang !== 'en';

  const allowance = await mentorAllowance(req).catch(() => ({ ok: true, pro: false, left: 0 }));
  if (!allowance.ok) return res.status(402).json({ error: 'limit', limit: FREE_DAILY });
  res.setHeader('X-Mentor-Left', String(allowance.left));

  const t = topic && typeof topic === 'object' ? topic : null;
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

  const turns = (Array.isArray(history) ? history : [])
    .slice(-6)
    .filter((m: any) => m && (m.role === 'user' || m.role === 'mentor'))
    .map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: clip(m.text, 1500) }] }));
  const contents = [...turns, { role: 'user', parts: [{ text: q }] }];

  if (ai) {
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction: system, maxOutputTokens: 4000, temperature: 0.4 },
        });
        if (response.text) return res.json({ answer: response.text });
      } catch (error: any) {
        const status = error?.status ?? error?.code;
        if (status === 429) {
          return res.json({
            answer: ru
              ? 'Сейчас наставнику пишет слишком много людей. Подожди минуту и спроси снова.'
              : 'The mentor is busy right now. Wait a minute and ask again.',
          });
        }
        console.warn(`[mentor] ${model} failed:`, status, String(error?.message || error).slice(0, 200));
        // unknown or retired model: try the next one
      }
    }
  }

  // no AI key (or every model failed): answer from the textbook itself
  if (t) {
    const answer = ru
      ? `ИИ-наставник сейчас недоступен, но вот главное по теме **«${clip(t.title, 200)}»**:\n\n${clip(t.intro, 600)}\n\n${clip(t.points, 900)
          .split('\n')
          .slice(0, 4)
          .map((l) => `- ${l}`)
          .join('\n')}`
      : `The AI mentor is unavailable right now. Here are the key points of **“${clip(t.title, 200)}”**:\n\n${clip(t.intro, 600)}`;
    return res.json({ answer });
  }
  return res.json({
    answer: ru
      ? 'ИИ-наставник сейчас недоступен. Открой нужную тему в учебнике — там есть объяснение и модель.'
      : 'The AI mentor is unavailable right now. Open the topic in the textbook for the explanation and model.',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // hashed build assets can be cached for a year; html must always be fresh
    app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets'), { maxAge: '365d', immutable: true }));
    app.use(express.static(path.resolve(__dirname, 'dist'), { maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
