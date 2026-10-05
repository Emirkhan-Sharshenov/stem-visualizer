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
  await sbAdmin.from('subscriptions').upsert({
    user_id: userId,
    plan: 'pro',
    status: active ? 'active' : 'expired',
    expires_at: expires.toISOString(),
    source: 'freemius',
    external_id: licenseId,
    updated_at: new Date().toISOString(),
  });
});

// AI Visual Mentor endpoint
app.post('/api/mentor', async (req, res) => {
  const { question, topic, state, lang = 'ru' } = req.body;
  const allowance = await mentorAllowance(req).catch(() => ({ ok: true, pro: false, left: 0 }));
  if (!allowance.ok) return res.status(402).json({ error: 'limit', limit: FREE_DAILY });
  res.setHeader('X-Mentor-Left', String(allowance.left));

  const systemPrompt = `You are the Interactive STEM Visual Mentor in "STEM Visualizer" (Mental Model Explorer).
Your key pedagogical philosophy:
- The user understands the textbook definition, but cannot picture what it means visually in 3D space.
- DO NOT produce long, dry textbook walls of text.
- Be concrete, vivid, and ALWAYS refer to the visual parameters currently on the screen.
- Say things like: "Notice the parameter ℓ on the right. When ℓ=0, the angular dependence vanishes, making it a sphere. Change ℓ to 1 to see the two opposite lobes with a nodal plane cutting through the nucleus."
- Speak in ${lang === 'ru' ? 'Russian' : 'English'}. Keep your answer under 120-150 words.
- Provide 1 actionable experiment the user can try with the sliders or buttons right now!`;

  const contextStr = `Current STEM Model: ${topic || 'Quantum Orbitals'}
Current Model State/Parameters: ${JSON.stringify(state || {})}
Student Question: ${question}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\n${contextStr}`,
      });
      return res.json({ answer: response.text });
    } catch (error: any) {
      console.error('Gemini API call failed, falling back to heuristic mentor response:', error);
    }
  }

  // Smart heuristic response tailored to the visual context
  let fallbackAnswer = '';
  if (lang === 'ru') {
    if (topic === 'orbitals') {
      fallbackAnswer = `Посмотри на квантовое число ℓ на панели справа. Сейчас ℓ = ${state?.l ?? 0}. Когда ℓ = 0 (s-орбиталь), угловой зависимости нет — волновая функция распределена одинаково во все стороны, поэтому получается идеальная сфера! Переключи ℓ на 1: появится узловая плоскость в центре ядра, а электронное облако разделится на две гантелевидные лопасти с противоположными фазами (+) и (-).`;
    } else if (topic === 'deconstruct_h2o') {
      fallbackAnswer = `Обрати внимание на шаг «Гибридизация и отталкивание». В молекуле воды кислород имеет sp³-гибридизацию с 4 электронными парами. Две из них — неподелённые (lone pairs), они сильнее отталкивают связывающие пары O–H, поэтому идеальный тетраэдрический угол 109.5° сжимается до 104.5°. Нажми шаг «Разбор на связи», чтобы увидеть перекрывание орбиталей!`;
    } else if (topic === 'gravity') {
      fallbackAnswer = `Взгляни на вектор силы F. Закон всемирного тяготения Ньютона квадратичен по расстоянию: F ~ 1 / r². Увеличь дистанцию в 2 раза с помощью ползунка — заметь, что стрелка силы станет не в 2, а ровно в 4 раза короче! Нажми режим «Сначала представь», чтобы проверить свою интуицию перед симуляцией.`;
    } else if (topic === 'revolution') {
      fallbackAnswer = `Посмотри на ось вращения X. Слева ты видишь 2D график f(x), а справа — трёхмерное тело вращения, собранное из бесконечно тонких цилиндрических дисков толщиной dx. Формула объёма V = π ∫ [f(x)]² dx — это просто сумма объёмов всех этих тонких дисков! Попробуй увеличить количество сечений n.`;
    } else if (topic === 'divergence') {
      fallbackAnswer = `Дивергенция ∇·F показывает, является ли точка «источником» (векторы выходят наружу, div > 0) или «стоком» (векторы втягиваются внутрь, div < 0). Подвигай пробную частицу в центр поля: если стрелки разлетаются во все стороны — в этой точке рождается поток!`;
    } else {
      fallbackAnswer = `Обрати внимание на параметры на панели управления. Измени ключевую величину и наблюдай, как пространственная 3D модель мгновенно перестраивается, отражая математический закон.`;
    }
  } else {
    fallbackAnswer = `Look at the parameter controls on the right. When you adjust the main values, observe how the 3D mental model shifts in real time. For orbitals, notice how changing ℓ from 0 to 1 introduces a nodal plane right through the nucleus!`;
  }

  return res.json({ answer: fallbackAnswer });
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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
