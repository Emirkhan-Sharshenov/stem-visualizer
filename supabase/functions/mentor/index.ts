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

/* ---------- formula normalisation ---------- */

const UNICODE_TEX: Record<string, string> = {
  '×': '\\times ', '·': '\\cdot ', '⋅': '\\cdot ', '÷': '\\div ', '−': '-', '–': '-', '≈': '\\approx ', '≠': '\\neq ',
  '≤': '\\le ', '≥': '\\ge ', '→': '\\rightarrow ', '⇄': '\\rightleftharpoons ', '⇌': '\\rightleftharpoons ', '°': '^\\circ ',
  '∞': '\\infty ', '√': '\\sqrt', '±': '\\pm ', '∝': '\\propto ',
  'Δ': '\\Delta ', 'δ': '\\delta ', 'α': '\\alpha ', 'β': '\\beta ', 'γ': '\\gamma ', 'ε': '\\varepsilon ', 'η': '\\eta ',
  'θ': '\\theta ', 'λ': '\\lambda ', 'μ': '\\mu ', 'ν': '\\nu ', 'π': '\\pi ', 'ρ': '\\rho ', 'σ': '\\sigma ', 'τ': '\\tau ',
  'φ': '\\varphi ', 'ω': '\\omega ', 'Ω': '\\Omega ', 'Σ': '\\Sigma ',
  '²': '^2', '³': '^3', '¹': '^1', '⁻': '^-',
  '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4', '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9',
};

function cleanTex(x: string): string {
  let t = x.trim();
  t = t.replace(/\*\*/g, ''); // no markdown bold inside math
  t = t.replace(/\\\\(?=[a-zA-Z])/g, '\\'); // \\frac -> \frac
  t = t.replace(/\\dfrac|\\tfrac/g, '\\frac');
  t = t.replace(/\\left\s*\\\{/g, '\\left\\{');
  t = t.replace(/[×·⋅÷−–≈≠≤≥→⇄⇌°∞√±∝ΔδαβγεηθλμνπρστφωΩΣ²³¹⁻₀-₉]/g, (c) => UNICODE_TEX[c] ?? c);
  t = t.replace(/\\sqrt\s*([A-Za-z0-9])/g, '\\sqrt{$1}');
  return t.trim();
}

/** bring whatever the model produced to $...$ (inline) and $$...$$ (display) */
function fixMath(text: string): string {
  let s = text;
  s = s.replace(/```(?:latex|tex|math)\s*([\s\S]*?)```/gi, (_m, m: string) => `\n$$${m.trim()}$$\n`);
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_m, m: string) => `\n$$${m.trim()}$$\n`);
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, (_m, m: string) => `$${m.trim()}$`);
  s = s.replace(/`\$([^`$\n]+)\$`/g, '$$$1$$'); // `$x$` in backticks -> $x$
  s = s.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_m, block?: string, inline?: string) =>
    block !== undefined ? `$$${cleanTex(block)}$$` : `$${cleanTex(inline ?? '')}$`,
  );
  return s;
}

/* ---------- allowance ---------- */

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

/* ---------- Gemini ---------- */

async function gemini(system: string, contents: unknown[]): Promise<{ text?: string; busy?: boolean }> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return {};
  for (const model of MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 4000, temperature: 0.3 } }),
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

/* ---------- handler ---------- */

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
- Используй **жирный** для ключевых слов и короткие списки.
- В задачах разбирай решение по шагам: Дано → формула → подстановка → ответ, всегда с единицами измерения.
- Если ученик просит проверить его — задай вопросы по одному и жди ответа.
- Отвечай только на учебные вопросы; на остальное вежливо верни к учёбе.

ФОРМУЛЫ — СТРОГИЕ ПРАВИЛА (ответ рендерится через KaTeX):
1. Любая формула, переменная с индексом/степенью, число с единицей в вычислении — только в LaTeX.
2. Короткие формулы внутри предложения: $...$, например $F = ma$. Важные и длинные формулы, а также шаги решения — отдельной строкой в $$...$$.
3. Запрещено: \\( \\), \\[ \\], блоки кода (\`\`\`) и обратные кавычки для формул, юникод-символы в формулах (×, ·, Δ, ², ₂, °, →), обычный текст вида m*g/2 или v^2.
4. Умножение — \\cdot, дроби — \\frac{a}{b}, корень — \\sqrt{x}, степень — x^{2}, индекс — v_{0}.
5. Греческие буквы — командами: \\Delta, \\rho, \\omega, \\lambda, \\mu.
6. Единицы измерения — прямым шрифтом через \\text{}: $v = 10\\ \\text{м/с}$, $m = 2\\ \\text{кг}$, $T = 300\\ \\text{К}$. Между числом и единицей ставь \\ .
7. Слова внутри формулы — через \\text{...}, например $A = F \\cdot s \\cdot \\cos\\alpha$, $\\text{КПД} = \\frac{A_{\\text{полезная}}}{A_{\\text{затраченная}}} \\cdot 100\\%$.
8. Химия: формулы веществ и реакции — в \\mathrm{}, например $\\mathrm{H_2O}$, $\\mathrm{CO_2}$, $\\mathrm{2H_2 + O_2 \\rightarrow 2H_2O}$, ионы — $\\mathrm{SO_4^{2-}}$, $\\mathrm{Ca^{2+}}$. Стрелка — \\rightarrow, обратимая реакция — \\rightleftharpoons.
9. Не вставляй **жирный** и переносы строк внутрь $...$. Знак доллара как валюту не используй.
10. Каждая формула должна быть полной и закрытой: если открыл $, обязательно закрой его.

Примеры правильной записи:
- $a = \\frac{F}{m}$, где $F = 12\\ \\text{Н}$, $m = 3\\ \\text{кг}$
- $$E_k = \\frac{m v^{2}}{2} = \\frac{2\\ \\text{кг} \\cdot (3\\ \\text{м/с})^{2}}{2} = 9\\ \\text{Дж}$$
- $\\mathrm{Zn + 2HCl \\rightarrow ZnCl_2 + H_2\\uparrow}$

${context}`;
  const turns = (Array.isArray(body.history) ? body.history : [])
    .slice(-6)
    .filter((m) => m && (m.role === 'user' || m.role === 'mentor'))
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: clip(m.text, 1500) }] }));

  const out = await gemini(system, [...turns, { role: 'user', parts: [{ text: q }] }]);
  if (out.busy) return json({ answer: ru ? 'Сейчас наставнику пишет слишком много людей. Подожди минуту и спроси снова.' : 'The mentor is busy right now. Wait a minute and ask again.' }, 200, leftHeader);
  if (out.text) return json({ answer: fixMath(out.text) }, 200, leftHeader);

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