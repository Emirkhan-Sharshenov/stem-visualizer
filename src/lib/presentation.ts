import type { Section, Topic } from '../data/curriculum';
import { Question, questionsForTopic, shuffle, rng, hashStr } from './quiz';
import { problemQuestion, problemsForTopic } from './problems';

/*
 * Presentations for a topic (Pro) or a whole section (Teacher).
 * Slides are described once as data; the preview and the .pptx file are both drawn from it.
 */

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };

export type ThemeId = 'light' | 'dark' | 'bright';
export type Part = 'title' | 'intro' | 'points' | 'formula' | 'model' | 'summary' | 'quiz' | 'answers' | 'end';
export const TEACHER_PARTS: Part[] = ['quiz', 'answers'];

export type Slide =
  | { k: 'title'; label: string; title: string; subtitle: string }
  | { k: 'agenda'; title: string; items: string[] }
  | { k: 'divider'; n: number; title: string }
  | { k: 'text'; label: string; title: string; text: string }
  | { k: 'point'; label: string; n: number; title: string; text: string }
  | { k: 'formula'; label: string; title: string; plain: string; topicId: string }
  | { k: 'model'; label: string; title: string; caption: string; topicId: string }
  | { k: 'summary'; label: string; title: string; items: string[] }
  | { k: 'quiz'; label: string; n: number; total: number; q: string; options: string[] }
  | { k: 'answers'; title: string; items: string[] }
  | { k: 'end'; title: string; subtitle: string };

export type SlideWithNotes = Slide & { notes?: string };

export interface Theme {
  id: ThemeId;
  name: T2;
  bg: string;
  ink: string;
  muted: string;
  card: string;
  /** the title and closing slides */
  heroBg: string;
  heroInk: string;
}

const SUBJECT_COLOR: Record<string, string> = { physics: 'E5484D', chemistry: '30A46C', biology: 'F5A524', mathematics: '8E4EC6' };
const SUBJECT_SOFT: Record<string, string> = { physics: 'FDECEC', chemistry: 'E7F6EE', biology: 'FEF4E0', mathematics: 'F3ECFA' };
const SUBJECT_NAME: Record<string, T2> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
  mathematics: { ru: 'Математика', en: 'Mathematics' },
};

export const accentFor = (subject: string) => SUBJECT_COLOR[subject] ?? '2F5BFF';

export function themeFor(id: ThemeId, subject: string): Theme {
  const a = accentFor(subject);
  if (id === 'dark') return { id, name: { ru: 'Тёмная', en: 'Dark' }, bg: '111214', ink: 'EDEDED', muted: '8C8F98', card: '1C1E23', heroBg: '0B0C0E', heroInk: 'FFFFFF' };
  if (id === 'bright') return { id, name: { ru: 'Яркая', en: 'Bright' }, bg: SUBJECT_SOFT[subject] ?? 'EEF1FF', ink: '16171A', muted: '5A5D66', card: 'FFFFFF', heroBg: a, heroInk: 'FFFFFF' };
  return { id, name: { ru: 'Светлая', en: 'Light' }, bg: 'FFFFFF', ink: '16171A', muted: '6B6B6B', card: 'F4F3EF', heroBg: 'FFFFFF', heroInk: '16171A' };
}
export const THEMES: ThemeId[] = ['light', 'bright', 'dark'];

/** TeX to readable text for when the formula picture is not available */
export function texToText(tex: string): string {
  const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', n: 'ⁿ' };
  const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  const GREEK: Record<string, string> = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', varepsilon: 'ε', epsilon: 'ε', eta: 'η', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', varphi: 'φ', phi: 'φ', omega: 'ω', Omega: 'Ω', psi: 'ψ', chi: 'χ' };
  let t = tex;
  for (let i = 0; i < 4; i++) {
    t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => `${a.length > 1 ? `(${a})` : a}/${b.length > 1 ? `(${b})` : b}`);
    t = t.replace(/\\sqrt\[(\w+)\]\{([^{}]*)\}/g, '$1√($2)').replace(/\\sqrt\{([^{}]*)\}/g, (_m, a: string) => (a.length > 1 ? `√(${a})` : `√${a}`));
    t = t.replace(/\\(?:text|mathrm|mathbf|operatorname|vec|overline)\{([^{}]*)\}/g, '$1');
  }
  t = t
    .replace(/\\left|\\right|\\,|\\;|\\!|\\quad|\\qquad|\\displaystyle/g, ' ')
    .replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±').replace(/\\approx/g, '≈').replace(/\\neq?/g, '≠')
    .replace(/\\le(q)?/g, '≤').replace(/\\ge(q)?/g, '≥').replace(/\\(?:right)?arrow|\\to/g, '→').replace(/\\rightleftharpoons/g, '⇄').replace(/\\infty/g, '∞')
    .replace(/\\int/g, '∫').replace(/\\sum/g, 'Σ').replace(/\\circ/g, '°').replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tg|\\tan/g, 'tg').replace(/\\log/g, 'log').replace(/\\ln/g, 'ln').replace(/\\lg/g, 'lg')
    .replace(/\\([A-Za-z]+)/g, (m, g: string) => GREEK[g] ?? m.slice(1))
    .replace(/\^\{([^{}]*)\}/g, (_m, a: string) => ([...a].every((c) => SUP[c]) ? [...a].map((c) => SUP[c]).join('') : `^(${a})`))
    .replace(/\^([0-9n-])/g, (_m, a: string) => SUP[a])
    .replace(/_\{([^{}]*)\}/g, (_m, a: string) => ([...a].every((c) => SUB[c]) ? [...a].map((c) => SUB[c]).join('') : a))
    .replace(/_([0-9])/g, (_m, a: string) => SUB[a])
    .replace(/_/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

const firstSentence = (s: string) => {
  const m = s.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
};
const optText = (o: { ru: string; en: string; tex?: boolean }, lang: Lang) => (o.tex ? texToText(o.ru) : o[lang]);

/** a few questions for a topic: textbook questions plus a calculation when the topic has one */
function topicQuestions(t: Topic, count: number, seed: number): Question[] {
  const qs = shuffle(questionsForTopic(t, 10, seed), rng(seed + hashStr(t.id)));
  const gens = problemsForTopic(t.id);
  const out = qs.slice(0, gens.length ? count - 1 : count);
  if (gens.length) out.push(problemQuestion(gens[seed % gens.length], seed));
  return out.slice(0, count);
}

export interface BuildOptions {
  lang: Lang;
  topic: Topic;
  /** set for a whole-section deck (Teacher) */
  section?: Section;
  parts: Set<Part>;
  notes: boolean;
  /** which pictures the page could capture */
  hasFormulaImage: boolean;
  hasModel: boolean;
  seed?: number;
}

export function buildSlides(o: BuildOptions): SlideWithNotes[] {
  const { lang, parts } = o;
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const subj = SUBJECT_NAME[o.topic.subject][lang];
  const grade = `${o.topic.grade} ${L('класс', 'grade')}`;
  const label = `${subj} · ${grade}`.toUpperCase();
  const seed = o.seed ?? 7;
  const slides: SlideWithNotes[] = [];
  const topics = o.section ? o.section.topics : [o.topic];
  const note = (s: string) => (o.notes ? s : undefined);

  if (parts.has('title'))
    slides.push({
      k: 'title',
      label: `${subj} · ${grade}`,
      title: o.section ? o.section.title[lang] : o.topic.title[lang],
      subtitle: o.section ? L(`${topics.length} тем раздела`, `${topics.length} topics`) : firstSentence(o.topic.intro[lang]),
      notes: note(L('Представьте тему и спросите класс, где они встречали это в жизни.', 'Introduce the topic and ask where the class has met it in real life.')),
    });
  if (o.section && parts.has('title')) slides.push({ k: 'agenda', title: L('План', 'Outline'), items: topics.map((t) => t.title[lang]) });

  topics.forEach((t, ti) => {
    const tl = o.section ? t.title[lang].toUpperCase() : label;
    if (o.section) slides.push({ k: 'divider', n: ti + 1, title: t.title[lang] });
    if (parts.has('intro'))
      slides.push({ k: 'text', label: tl, title: o.section ? L('Суть', 'The idea') : L('О чём тема', 'What it is about'), text: t.intro[lang], notes: note(`${t.intro[lang]}\n\n${L('Вопрос классу: ', 'Ask the class: ')}${L('как бы вы объяснили это младшему брату?', 'how would you explain this to a younger sibling?')}`) });
    if (parts.has('points'))
      t.points.forEach((p, i) =>
        slides.push({ k: 'point', label: tl, n: i + 1, title: p.title[lang], text: p.text[lang], notes: note(`${p.text[lang]}\n\n${L('Проверка понимания: попросите ученика своими словами объяснить', 'Check understanding: ask a student to explain')} «${p.title[lang]}».`) }),
      );
    if (parts.has('formula') && t.formula)
      slides.push({ k: 'formula', label: tl, title: L('Формула', 'Formula'), plain: texToText(t.formula), topicId: t.id, notes: note(`${texToText(t.formula)}\n\n${L('Разберите, что означает каждая буква и в каких единицах она измеряется.', 'Go through what each letter means and its units.')}`) });
    if (parts.has('model') && o.hasModel && !o.section)
      slides.push({ k: 'model', label: tl, title: L('Модель', 'Model'), caption: L('Интерактивная модель — stem-visualizer.pages.dev', 'Interactive model — stem-visualizer.pages.dev'), topicId: t.id, notes: note(L('Откройте модель на сайте и покажите, как меняется результат при изменении параметров.', 'Open the model on the site and show how the result changes with the parameters.')) });
  });

  if (parts.has('summary'))
    slides.push({
      k: 'summary',
      label: o.section ? (o.section.title[lang] ?? '').toUpperCase() : label,
      title: L('Главное', 'Key points'),
      items: o.section ? topics.map((t) => `${t.title[lang]}: ${firstSentence(t.intro[lang])}`) : o.topic.points.map((p) => `${p.title[lang]}: ${firstSentence(p.text[lang])}`),
    });

  if (parts.has('quiz') || parts.has('answers')) {
    const qs = o.section ? topics.flatMap((t, i) => topicQuestions(t, 1, seed + i)).slice(0, 10) : topicQuestions(o.topic, 4, seed);
    const letters = 'ABCD';
    if (parts.has('quiz'))
      qs.forEach((q, i) =>
        slides.push({ k: 'quiz', label: L(`ВОПРОС ${i + 1} / ${qs.length}`, `QUESTION ${i + 1} / ${qs.length}`), n: i + 1, total: qs.length, q: q.prompt[lang], options: q.options.map((x) => optText(x, lang)), notes: note(`${L('Ответ', 'Answer')}: ${letters[q.correct]} — ${optText(q.options[q.correct], lang)}${q.explain ? `\n${q.explain[lang]}` : ''}`) }),
      );
    if (parts.has('answers')) slides.push({ k: 'answers', title: L('Ответы', 'Answers'), items: qs.map((q, i) => `${i + 1}. ${letters[q.correct]} — ${optText(q.options[q.correct], lang)}`) });
  }

  if (parts.has('end')) slides.push({ k: 'end', title: L('Спасибо за внимание!', 'Thank you!'), subtitle: L('Вопросы?', 'Questions?') });
  return slides;
}

/* ---------- layout shared by the preview and the file (inches on a 13.333 × 7.5 slide) ---------- */

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
export const FONT_HEAD = 'Georgia';
export const FONT_BODY = 'Arial';

/** body size that fills the slide with short texts and keeps long ones on it */
export const bodySize = (text: string, extra = 0) => extra + (text.length < 90 ? 36 : text.length < 160 ? 32 : text.length < 300 ? 26 : text.length < 480 ? 22 : 19);
export const listSize = (items: string[]) => {
  const len = items.join('').length;
  return len < 240 ? 26 : len < 420 ? 22 : len < 650 ? 18 : 15;
};
export const optSize = (s: string) => (s.length > 70 ? 14 : s.length > 40 ? 17 : 20);

export interface Img {
  data: string;
  w: number;
  h: number;
}

/** fit an image into a box keeping its proportions */
export function fit(img: Img, x: number, y: number, w: number, h: number) {
  const k = Math.min(w / img.w, h / img.h);
  const iw = img.w * k;
  const ih = img.h * k;
  return { x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih };
}

export const fileName = (s: string) => `${s.replace(/[\\/:*?"<>|«»]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'presentation'}.pptx`;

/** writes the .pptx; pptxgenjs loads only when someone downloads */
export async function downloadPptx(slides: SlideWithNotes[], theme: Theme, accent: string, images: { formula: Record<string, Img>; model: Record<string, Img> }, name: string, author?: string) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = name;
  if (author) pptx.author = author;
  const A = accent;
  const total = slides.length;

  slides.forEach((sl, idx) => {
    const s = pptx.addSlide();
    const hero = sl.k === 'title' || sl.k === 'end';
    s.background = { color: hero ? theme.heroBg : sl.k === 'divider' ? theme.card : theme.bg };
    const ink = hero ? theme.heroInk : theme.ink;
    const onAccent = hero && theme.heroBg === A;
    const head = (label: string) => {
      s.addText(label, { x: 0.6, y: 0.3, w: 10, h: 0.4, fontFace: FONT_BODY, fontSize: 12, bold: true, color: A, charSpacing: 1.5 });
      s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.78, w: 0.7, h: 0.06, fill: { color: A }, line: { color: A } });
    };
    if (!hero) s.addText(`${idx + 1} / ${total}`, { x: SLIDE_W - 1.8, y: SLIDE_H - 0.55, w: 1.3, h: 0.3, fontFace: FONT_BODY, fontSize: 10, color: theme.muted, align: 'right' });

    switch (sl.k) {
      case 'title':
      case 'end': {
        if (!onAccent) s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: SLIDE_H, fill: { color: A }, line: { color: A } });
        s.addShape(pptx.ShapeType.ellipse, { x: 9.4, y: -1.2, w: 5.2, h: 5.2, fill: { color: onAccent ? 'FFFFFF' : A, transparency: onAccent ? 85 : 88 }, line: { type: 'none' } });
        s.addShape(pptx.ShapeType.ellipse, { x: 10.9, y: 4.3, w: 3, h: 3, fill: { color: onAccent ? 'FFFFFF' : A, transparency: onAccent ? 80 : 82 }, line: { type: 'none' } });
        if (sl.k === 'title') {
          s.addText(sl.label.toUpperCase(), { x: 1.0, y: 1.6, w: 10, h: 0.5, fontFace: FONT_BODY, fontSize: 16, bold: true, color: onAccent ? 'FFFFFF' : A, charSpacing: 2 });
          s.addText(sl.title, { x: 1.0, y: 2.15, w: 10.5, h: 2.4, fontFace: FONT_HEAD, fontSize: sl.title.length > 50 ? 36 : 44, color: ink, valign: 'top' });
          if (sl.subtitle) s.addText(sl.subtitle, { x: 1.0, y: 4.7, w: 10, h: 1.4, fontFace: FONT_BODY, fontSize: 18, color: onAccent ? 'FFFFFF' : theme.muted, valign: 'top' });
        } else {
          s.addText(sl.title, { x: 1.0, y: 2.6, w: 10.5, h: 1.3, fontFace: FONT_HEAD, fontSize: 48, color: ink });
          s.addText(sl.subtitle, { x: 1.0, y: 3.9, w: 10, h: 0.8, fontFace: FONT_BODY, fontSize: 24, color: onAccent ? 'FFFFFF' : A });
        }
        break;
      }
      case 'agenda': {
        head('');
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.9, fontFace: FONT_HEAD, fontSize: 34, color: ink });
        const half = Math.ceil(sl.items.length / 2);
        const cols = sl.items.length > 6 ? [sl.items.slice(0, half), sl.items.slice(half)] : [sl.items];
        cols.forEach((col, c) =>
          s.addText(
            col.map((t, i) => ({ text: `${String(c * half + i + 1).padStart(2, '0')}   ${t}`, options: { breakLine: true } })),
            { x: 0.6 + c * 6.2, y: 2.1, w: cols.length > 1 ? 6 : 12, h: 4.8, fontFace: FONT_BODY, fontSize: sl.items.length > 8 ? 18 : 24, color: ink, valign: 'top', paraSpaceAfter: 12 },
          ),
        );
        break;
      }
      case 'divider':
        s.addText(String(sl.n).padStart(2, '0'), { x: 0.9, y: 1.9, w: 3, h: 1.4, fontFace: FONT_HEAD, fontSize: 80, color: A });
        s.addText(sl.title, { x: 0.9, y: 3.4, w: 11.5, h: 2, fontFace: FONT_HEAD, fontSize: 40, color: ink, valign: 'top' });
        break;
      case 'text':
        head(sl.label);
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.9, fontFace: FONT_HEAD, fontSize: 32, color: ink });
        s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.25, w: 0.08, h: 3.9, fill: { color: A }, line: { color: A } });
        s.addText(sl.text, { x: 0.95, y: 2.2, w: 11.6, h: 4.2, fontFace: FONT_HEAD, fontSize: bodySize(sl.text, 2), color: ink, valign: 'top', lineSpacingMultiple: 1.15 });
        break;
      case 'point':
        s.addShape(pptx.ShapeType.ellipse, { x: 10.6, y: 4.6, w: 4.2, h: 4.2, fill: { color: A, transparency: 90 }, line: { type: 'none' } });
        head(sl.label);
        s.addText(String(sl.n).padStart(2, '0'), { x: 0.6, y: 1.0, w: 2, h: 1, fontFace: FONT_HEAD, fontSize: 48, color: A });
        s.addText(sl.title, { x: 0.6, y: 2.0, w: 12, h: 1.1, fontFace: FONT_HEAD, fontSize: sl.title.length > 45 ? 28 : 34, color: ink, valign: 'top' });
        s.addText(sl.text, { x: 0.6, y: 3.25, w: 11.2, h: 3.6, fontFace: FONT_BODY, fontSize: bodySize(sl.text), color: ink, valign: 'top', lineSpacingMultiple: 1.2 });
        break;
      case 'formula': {
        head(sl.label);
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.9, fontFace: FONT_HEAD, fontSize: 32, color: ink });
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 2.1, w: 12.1, h: 4.4, fill: { color: theme.card }, line: { type: 'none' }, rectRadius: 0.15 });
        const img = images.formula[sl.topicId];
        if (img) {
          const f = fit(img, 1.0, 2.5, 11.3, 3.6);
          if (theme.id === 'dark') s.addShape(pptx.ShapeType.roundRect, { x: f.x - 0.25, y: f.y - 0.2, w: f.w + 0.5, h: f.h + 0.4, fill: { color: 'FFFFFF' }, line: { type: 'none' }, rectRadius: 0.1 });
          s.addImage({ data: img.data, ...f });
        } else s.addText(sl.plain, { x: 1.0, y: 2.5, w: 11.3, h: 3.6, fontFace: 'Cambria Math', fontSize: sl.plain.length > 40 ? 30 : 40, color: ink, align: 'center', valign: 'middle' });
        break;
      }
      case 'model': {
        head(sl.label);
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.8, fontFace: FONT_HEAD, fontSize: 30, color: ink });
        const img = images.model[sl.topicId];
        if (img) s.addImage({ data: img.data, ...fit(img, 0.6, 1.9, 12.1, 4.9) });
        s.addText(sl.caption, { x: 0.6, y: SLIDE_H - 0.6, w: 9, h: 0.35, fontFace: FONT_BODY, fontSize: 11, color: theme.muted });
        break;
      }
      case 'summary':
        head(sl.label);
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.9, fontFace: FONT_HEAD, fontSize: 32, color: ink });
        s.addText(
          sl.items.map((t) => ({ text: t, options: { bullet: { code: '25CF' }, breakLine: true } })),
          { x: 0.6, y: 2.1, w: 12, h: 4.8, fontFace: FONT_BODY, fontSize: listSize(sl.items), color: ink, valign: 'top', paraSpaceAfter: 10 },
        );
        break;
      case 'quiz': {
        head(sl.label);
        s.addText(sl.q, { x: 0.6, y: 1.1, w: 12.1, h: 2.0, fontFace: FONT_HEAD, fontSize: sl.q.length > 140 ? 22 : 28, color: ink, valign: 'top' });
        sl.options.forEach((opt, i) => {
          const x = 0.6 + (i % 2) * 6.15;
          const y = 3.35 + Math.floor(i / 2) * 1.75;
          s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.95, h: 1.5, fill: { color: theme.card }, line: { type: 'none' }, rectRadius: 0.12 });
          s.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.45, w: 0.6, h: 0.6, fill: { color: A }, line: { type: 'none' } });
          s.addText('ABCD'[i], { x: x + 0.3, y: y + 0.45, w: 0.6, h: 0.6, fontFace: FONT_BODY, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
          s.addText(opt, { x: x + 1.1, y, w: 4.7, h: 1.5, fontFace: FONT_BODY, fontSize: optSize(opt), color: ink, valign: 'middle' });
        });
        break;
      }
      case 'answers':
        head('');
        s.addText(sl.title, { x: 0.6, y: 1.0, w: 12, h: 0.9, fontFace: FONT_HEAD, fontSize: 32, color: ink });
        s.addText(
          sl.items.map((t) => ({ text: t, options: { breakLine: true } })),
          { x: 0.6, y: 2.1, w: 12, h: 4.8, fontFace: FONT_BODY, fontSize: sl.items.length > 6 ? 18 : 24, color: ink, valign: 'top', paraSpaceAfter: 10 },
        );
        break;
    }
    if (sl.notes) s.addNotes(sl.notes);
  });

  await pptx.writeFile({ fileName: name });
}
