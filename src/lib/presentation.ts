import type { Section, Topic } from '../data/curriculum';
import { Question, questionsForTopic, shuffle, rng, hashStr } from './quiz';
import { problemQuestion, problemsForTopic } from './problems';

/*
 * Presentations for a topic (Pro) or a whole section (Teacher).
 * Slides are described as data, then laid out once as shapes (layoutSlide);
 * the preview and the .pptx file both draw those same shapes, so they always match.
 */

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };

export type ThemeId = 'light' | 'dark' | 'bright';
export type Part = 'title' | 'intro' | 'points' | 'formula' | 'model' | 'summary' | 'quiz' | 'answers' | 'end';

export type Slide =
  | { k: 'title'; label: string; title: string; subtitle: string; grade: number; topicId: string }
  | { k: 'agenda'; title: string; items: string[] }
  | { k: 'divider'; n: number; total: number; title: string; label: string }
  | { k: 'text'; label: string; title: string; text: string }
  | { k: 'point'; label: string; n: number; total: number; title: string; text: string; of: string }
  | { k: 'formula'; label: string; title: string; plain: string; caption: string; topicId: string }
  | { k: 'model'; label: string; title: string; caption: string; topicId: string }
  | { k: 'summary'; label: string; title: string; items: { title: string; text: string }[] }
  | { k: 'quiz'; label: string; q: string; options: string[] }
  | { k: 'answers'; title: string; items: { letter: string; text: string }[] }
  | { k: 'end'; title: string; subtitle: string };

export type SlideWithNotes = Slide & { notes?: string };

export interface Theme {
  id: ThemeId;
  name: T2;
  bg: string;
  ink: string;
  muted: string;
  /** cards on the slide */
  card: string;
  /** the coloured side panel of point slides */
  panel: string;
  heroBg: string;
  heroInk: string;
  heroMuted: string;
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
  const soft = SUBJECT_SOFT[subject] ?? 'EEF1FF';
  if (id === 'dark') return { id, name: { ru: 'Тёмная', en: 'Dark' }, bg: '121316', ink: 'F1F1EE', muted: '8C8F98', card: '1D1F24', panel: '1A1C21', heroBg: '0C0D0F', heroInk: 'FFFFFF', heroMuted: 'A0A3AB' };
  if (id === 'bright') {
    // white text is hard to read on yellow, so the biology hero keeps dark text
    const darkHero = subject === 'biology';
    return { id, name: { ru: 'Яркая', en: 'Bright' }, bg: soft, ink: '16171A', muted: '5A5D66', card: 'FFFFFF', panel: 'FFFFFF', heroBg: a, heroInk: darkHero ? '1D1405' : 'FFFFFF', heroMuted: darkHero ? '4A3A12' : 'FFFFFF' };
  }
  return { id, name: { ru: 'Светлая', en: 'Light' }, bg: 'FFFFFF', ink: '16171A', muted: '6B6B6B', card: 'F5F4F0', panel: soft, heroBg: 'FFFFFF', heroInk: '16171A', heroMuted: '6B6B6B' };
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
  const label = `${subj} · ${grade}`;
  const seed = o.seed ?? 7;
  const slides: SlideWithNotes[] = [];
  const topics = o.section ? o.section.topics : [o.topic];
  const note = (s: string) => (o.notes ? s : undefined);

  if (parts.has('title'))
    slides.push({
      k: 'title',
      label,
      title: o.section ? o.section.title[lang] : o.topic.title[lang],
      subtitle: o.section ? L(`Раздел · ${topics.length} тем`, `Section · ${topics.length} topics`) : firstSentence(o.topic.intro[lang]),
      grade: o.topic.grade,
      topicId: o.topic.id,
      notes: note(L('Представьте тему и спросите класс, где они встречали это в жизни.', 'Introduce the topic and ask where the class has met it in real life.')),
    });
  if (o.section && parts.has('title')) slides.push({ k: 'agenda', title: L('План урока', 'Outline'), items: topics.map((t) => t.title[lang]) });

  topics.forEach((t, ti) => {
    const tl = o.section ? t.title[lang] : label;
    if (o.section) slides.push({ k: 'divider', n: ti + 1, total: topics.length, title: t.title[lang], label: L(`Тема ${ti + 1} из ${topics.length}`, `Topic ${ti + 1} of ${topics.length}`) });
    if (parts.has('intro'))
      slides.push({ k: 'text', label: tl, title: o.section ? L('Суть', 'The idea') : L('О чём тема', 'What it is about'), text: t.intro[lang], notes: note(`${t.intro[lang]}\n\n${L('Вопрос классу: как бы вы объяснили это младшему брату?', 'Ask the class: how would you explain this to a younger sibling?')}`) });
    if (parts.has('points'))
      t.points.forEach((p, i) =>
        slides.push({
          k: 'point',
          label: tl,
          n: i + 1,
          total: t.points.length,
          of: L(`Шаг ${i + 1} из ${t.points.length}`, `Step ${i + 1} of ${t.points.length}`),
          title: p.title[lang],
          text: p.text[lang],
          notes: note(`${p.text[lang]}\n\n${L('Проверка понимания: попросите ученика своими словами объяснить', 'Check understanding: ask a student to explain')} «${p.title[lang]}».`),
        }),
      );
    if (parts.has('formula') && t.formula)
      slides.push({ k: 'formula', label: tl, title: L('Формула', 'Formula'), plain: texToText(t.formula), caption: t.title[lang], topicId: t.id, notes: note(`${texToText(t.formula)}\n\n${L('Разберите, что означает каждая буква и в каких единицах она измеряется.', 'Go through what each letter means and its units.')}`) });
    if (parts.has('model') && o.hasModel && !o.section)
      slides.push({ k: 'model', label: tl, title: L('Смотрим на модели', 'See it in the model'), caption: L('Интерактивная модель: stem-visualizer.pages.dev', 'Interactive model: stem-visualizer.pages.dev'), topicId: t.id, notes: note(L('Откройте модель на сайте и покажите, как меняется результат при изменении параметров.', 'Open the model on the site and show how the result changes with the parameters.')) });
  });

  if (parts.has('summary'))
    slides.push({
      k: 'summary',
      label: o.section ? o.section.title[lang] : label,
      title: L('Главное', 'Key points'),
      items: o.section ? topics.map((t) => ({ title: t.title[lang], text: firstSentence(t.intro[lang]) })) : o.topic.points.map((p) => ({ title: p.title[lang], text: firstSentence(p.text[lang]) })),
    });

  if (parts.has('quiz') || parts.has('answers')) {
    const qs = o.section ? topics.flatMap((t, i) => topicQuestions(t, 1, seed + i)).slice(0, 10) : topicQuestions(o.topic, 4, seed);
    const letters = 'ABCD';
    if (parts.has('quiz'))
      qs.forEach((q, i) =>
        slides.push({ k: 'quiz', label: L(`Вопрос ${i + 1} из ${qs.length}`, `Question ${i + 1} of ${qs.length}`), q: q.prompt[lang], options: q.options.map((x) => optText(x, lang)), notes: note(`${L('Ответ', 'Answer')}: ${letters[q.correct]} — ${optText(q.options[q.correct], lang)}${q.explain ? `\n${q.explain[lang]}` : ''}`) }),
      );
    if (parts.has('answers')) slides.push({ k: 'answers', title: L('Ответы', 'Answers'), items: qs.map((q) => ({ letter: letters[q.correct], text: optText(q.options[q.correct], lang) })) });
  }

  if (parts.has('end')) slides.push({ k: 'end', title: L('Спасибо за внимание!', 'Thank you!'), subtitle: L('Ваши вопросы?', 'Any questions?') });
  return slides;
}

/* ---------- layout: every slide becomes a list of shapes in inches on a 13.333 × 7.5 slide ---------- */

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
/** fonts present in PowerPoint on Windows and Mac and in Google Slides, with Cyrillic */
export const FONTS = { head: 'Georgia', body: 'Calibri', math: 'Cambria Math' } as const;

export interface Img {
  data: string;
  w: number;
  h: number;
}
export type Images = { formula: Record<string, Img>; model: Record<string, Img> };

export interface Run {
  text: string;
  bold?: boolean;
  color?: string;
  size?: number;
  /** start a new paragraph after this run */
  br?: boolean;
}

export type Prim =
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill: string; alpha?: number; r?: number; line?: string }
  | { t: 'ellipse'; x: number; y: number; w: number; h: number; fill: string; alpha?: number }
  | {
      t: 'text';
      x: number;
      y: number;
      w: number;
      h: number;
      runs: Run[];
      size: number;
      color: string;
      font: keyof typeof FONTS;
      bold?: boolean;
      italic?: boolean;
      /** 0..1 */
      alpha?: number;
      align?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      /** line spacing, as a multiple of single */
      lh?: number;
      /** letter spacing in points */
      spacing?: number;
      /** space after each paragraph in points */
      para?: number;
    }
  | { t: 'img'; x: number; y: number; w: number; h: number; data: string; cover?: boolean };

/** fit an image into a box keeping its proportions */
export function fit(img: Img, x: number, y: number, w: number, h: number) {
  const k = Math.min(w / img.w, h / img.h);
  const iw = img.w * k;
  const ih = img.h * k;
  return { x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih };
}

// text sizes chosen by length so short texts fill the slide and long ones still fit
const pick = (len: number, steps: [number, number][], last: number) => steps.find(([max]) => len <= max)?.[1] ?? last;

export interface LayoutCtx {
  theme: Theme;
  accent: string;
  images: Images;
  /** footer: the deck's name */
  deck: string;
  index: number;
  total: number;
}

const M = 0.75; // side margin
const one = (text: string): Run[] => [{ text }];

export function layoutSlide(sl: Slide, c: LayoutCtx): { bg: string; prims: Prim[] } {
  const { theme: T, accent: A } = c;
  const P: Prim[] = [];
  const text = (x: number, y: number, w: number, h: number, runs: Run[] | string, size: number, color: string, font: keyof typeof FONTS = 'body', extra: Partial<Extract<Prim, { t: 'text' }>> = {}) =>
    P.push({ t: 'text', x, y, w, h, runs: typeof runs === 'string' ? one(runs) : runs, size, color, font, ...extra });
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra: Partial<Extract<Prim, { t: 'rect' }>> = {}) => P.push({ t: 'rect', x, y, w, h, fill, ...extra });
  const ellipse = (x: number, y: number, w: number, h: number, fill: string, alpha = 1) => P.push({ t: 'ellipse', x, y, w, h, fill, alpha });

  /** small caps label with a short accent rule under it */
  const kicker = (label: string, x = M, y = 0.55, color = A) => {
    text(x, y, 9, 0.3, label.toUpperCase(), 11, color, 'body', { bold: true, spacing: 2 });
    rect(x, y + 0.42, 0.55, 0.05, color);
  };
  const footer = (left = c.deck) => {
    text(M, SLIDE_H - 0.55, 9, 0.3, left, 10, T.muted, 'body');
    text(SLIDE_W - M - 1.5, SLIDE_H - 0.55, 1.5, 0.3, `${String(c.index + 1).padStart(2, '0')} / ${String(c.total).padStart(2, '0')}`, 10, T.muted, 'body', { align: 'right', spacing: 1 });
  };
  let bg = T.bg;

  switch (sl.k) {
    case 'title': {
      bg = T.heroBg;
      const img = c.images.model[sl.topicId];
      const bright = T.id === 'bright';
      const px = 8.15;
      // right side: the model picture, or a coloured panel with the grade
      if (img) {
        rect(px, 0, SLIDE_W - px, SLIDE_H, bright ? 'FFFFFF' : A, { alpha: bright ? 0.18 : 1 });
        P.push({ t: 'img', x: px, y: 0, w: SLIDE_W - px, h: SLIDE_H, data: img.data, cover: true });
      } else {
        rect(px, 0, SLIDE_W - px, SLIDE_H, bright ? 'FFFFFF' : A, { alpha: bright ? 0.14 : 1 });
        ellipse(px + 2.2, -1.4, 5, 5, 'FFFFFF', 0.12);
        ellipse(px - 1.2, 4.6, 3.6, 3.6, bright ? 'FFFFFF' : A, bright ? 0.12 : 1);
        text(px, 1.6, SLIDE_W - px, 3.2, String(sl.grade), 190, 'FFFFFF', 'head', { align: 'center', valign: 'middle' });
        text(px, 4.7, SLIDE_W - px, 0.5, sl.label.split('·')[1]?.trim().toUpperCase() ?? '', 14, 'FFFFFF', 'body', { align: 'center', bold: true, spacing: 4 });
      }
      const ink = T.heroInk;
      const sub = bright ? T.heroMuted : T.muted;
      kicker(sl.label, M, 1.55, bright ? T.heroInk : A);
      const ts = pick(sl.title.length, [[24, 46], [44, 40], [70, 34]], 30);
      text(M, 2.25, px - M - 0.6, 3.0, sl.title, ts, ink, 'head', { valign: 'top', lh: 0.95 });
      if (sl.subtitle) text(M, 5.35, px - M - 0.7, 1.3, sl.subtitle, pick(sl.subtitle.length, [[90, 18], [160, 16]], 14), sub, 'body', { valign: 'top', lh: 1.1 });
      break;
    }
    case 'agenda': {
      kicker(c.deck);
      text(M, 1.2, 10, 0.9, sl.title, 36, T.ink, 'head');
      const n = sl.items.length;
      const cols = n > 5 ? 2 : 1;
      const rows = Math.ceil(n / cols);
      const gw = (SLIDE_W - 2 * M - (cols - 1) * 0.4) / cols;
      const rh = Math.min(0.85, 4.5 / rows);
      sl.items.forEach((it, i) => {
        const col = Math.floor(i / rows);
        const row = i % rows;
        const x = M + col * (gw + 0.4);
        const y = 2.35 + row * rh;
        text(x, y, 0.8, rh, String(i + 1).padStart(2, '0'), 20, A, 'head', { valign: 'middle' });
        text(x + 0.8, y, gw - 0.8, rh, it, rows > 6 ? 16 : 20, T.ink, 'body', { valign: 'middle' });
        if (row < rows - 1) rect(x, y + rh - 0.01, gw, 0.01, T.muted, { alpha: 0.25 });
      });
      footer();
      break;
    }
    case 'divider': {
      rect(0, 0, 5.0, SLIDE_H, A);
      ellipse(-1.4, 4.4, 4.5, 4.5, 'FFFFFF', 0.1);
      text(0, 1.6, 5.0, 3.6, String(sl.n).padStart(2, '0'), 150, 'FFFFFF', 'head', { align: 'center', valign: 'middle' });
      kicker(sl.label, 5.8, 2.55);
      text(5.8, 3.15, SLIDE_W - 5.8 - M, 2.6, sl.title, pick(sl.title.length, [[30, 40], [60, 34]], 28), T.ink, 'head', { valign: 'top', lh: 1.0 });
      break;
    }
    case 'text': {
      kicker(sl.label);
      text(M, 1.35, 4.0, 1.6, sl.title, 36, T.ink, 'head', { valign: 'top', lh: 0.95 });
      text(4.95, 0.85, 1.2, 1.4, '“', 120, A, 'head', { alpha: 0.35 });
      rect(5.3, 1.55, 0.06, 4.6, A, { alpha: 0.6 });
      text(5.75, 1.35, SLIDE_W - 5.75 - M, 5.0, sl.text, pick(sl.text.length, [[110, 32], [200, 28], [330, 24], [480, 21]], 18), T.ink, 'head', { valign: 'middle', lh: 1.15 });
      footer();
      break;
    }
    case 'point': {
      const pw = 4.7;
      rect(0, 0, pw, SLIDE_H, T.panel);
      kicker(sl.label, M, 0.55);
      text(M, 1.3, pw - M - 0.3, 1.9, String(sl.n).padStart(2, '0'), 110, A, 'head', { valign: 'top', lh: 0.9 });
      text(M, 3.35, pw - M - 0.35, 2.6, sl.title, pick(sl.title.length, [[18, 36], [34, 30], [56, 25]], 21), T.ink, 'head', { valign: 'top', lh: 1.0 });
      // progress dots for the steps of this topic
      for (let i = 0; i < Math.min(sl.total, 12); i++) ellipse(M + i * 0.28, 6.55, 0.13, 0.13, A, i === sl.n - 1 ? 1 : 0.28);
      text(M, 6.8, pw - M, 0.3, sl.of, 10, T.muted, 'body');
      text(pw + 0.85, 0.9, SLIDE_W - pw - 0.85 - M, 5.6, sl.text, pick(sl.text.length, [[80, 34], [150, 30], [260, 26], [400, 22], [560, 19]], 17), T.ink, 'body', { valign: 'middle', lh: 1.25 });
      text(SLIDE_W - M - 1.5, SLIDE_H - 0.55, 1.5, 0.3, `${String(c.index + 1).padStart(2, '0')} / ${String(c.total).padStart(2, '0')}`, 10, T.muted, 'body', { align: 'right', spacing: 1 });
      break;
    }
    case 'formula': {
      kicker(sl.label);
      text(M, 1.2, 10, 0.9, sl.title, 36, T.ink, 'head');
      const img = c.images.formula[sl.topicId];
      rect(M, 2.3, SLIDE_W - 2 * M, 3.85, T.id === 'dark' ? 'FFFFFF' : T.card, { r: 0.18 });
      rect(M, 2.3, 0.09, 3.85, A);
      if (img) P.push({ t: 'img', ...fit(img, M + 0.8, 2.75, SLIDE_W - 2 * M - 1.6, 2.95), data: img.data });
      else text(M + 0.5, 2.3, SLIDE_W - 2 * M - 1, 3.85, sl.plain, pick(sl.plain.length, [[20, 54], [40, 44]], 34), T.id === 'dark' ? '16171A' : T.ink, 'math', { align: 'center', valign: 'middle' });
      text(M, 6.35, SLIDE_W - 2 * M, 0.4, sl.caption, 13, T.muted, 'body', { italic: true });
      footer();
      break;
    }
    case 'model': {
      kicker(sl.label);
      text(M, 1.2, 10, 0.9, sl.title, 36, T.ink, 'head');
      const img = c.images.model[sl.topicId];
      if (img) {
        const f = fit(img, M, 2.25, SLIDE_W - 2 * M, 4.35);
        rect(f.x - 0.06, f.y - 0.06, f.w + 0.12, f.h + 0.12, A, { alpha: 0.35, r: 0.08 });
        P.push({ t: 'img', ...f, data: img.data });
      }
      footer(sl.caption);
      break;
    }
    case 'summary': {
      kicker(sl.label);
      text(M, 1.2, 10, 0.9, sl.title, 36, T.ink, 'head');
      const n = sl.items.length;
      const cols = n <= 3 ? n : n === 4 ? 2 : 3;
      const rows = Math.ceil(n / cols);
      const gap = 0.3;
      const cw = (SLIDE_W - 2 * M - (cols - 1) * gap) / cols;
      const top = 2.35;
      // few points get big cards with big text; many points share the space
      const ts = n <= 3 ? 22 : n === 4 ? 19 : 15;
      const bs = n <= 3 ? 17 : n === 4 ? 15 : 12;
      const ch = Math.min((SLIDE_H - 0.95 - top - (rows - 1) * gap) / rows, n <= 3 ? 3.1 : 9);
      const y0 = top + ((SLIDE_H - 0.95 - top) - (rows * ch + (rows - 1) * gap)) / 2;
      sl.items.forEach((it, i) => {
        const x = M + (i % cols) * (cw + gap);
        const y = y0 + Math.floor(i / cols) * (ch + gap);
        rect(x, y, cw, ch, T.card, { r: 0.14 });
        rect(x, y, cw, 0.07, A);
        text(x + 0.35, y + 0.3, 1.2, 0.6, String(i + 1).padStart(2, '0'), ts + 6, A, 'head');
        text(x + 0.35, y + (n <= 4 ? 1.0 : 0.75), cw - 0.7, ch - (n <= 4 ? 1.15 : 0.85), [{ text: it.title, bold: true, size: ts, br: true }, { text: it.text, color: T.muted }], bs, T.ink, 'body', { valign: 'top', lh: 1.1, para: 6 });
      });
      footer();
      break;
    }
    case 'quiz': {
      kicker(sl.label);
      text(M, 1.15, SLIDE_W - 2 * M, 2.0, sl.q, pick(sl.q.length, [[70, 32], [130, 27], [220, 23]], 20), T.ink, 'head', { valign: 'middle', lh: 1.05 });
      const two = sl.options.length <= 2;
      const gap = 0.3;
      const ow = (SLIDE_W - 2 * M - gap) / 2;
      const oh = two ? 2.0 : 1.45;
      sl.options.forEach((o, i) => {
        const x = M + (i % 2) * (ow + gap);
        const y = (two ? 3.75 : 3.5) + Math.floor(i / 2) * (oh + 0.25);
        rect(x, y, ow, oh, T.card, { r: 0.14 });
        ellipse(x + 0.3, y + oh / 2 - 0.3, 0.6, 0.6, A);
        text(x + 0.3, y + oh / 2 - 0.3, 0.6, 0.6, 'ABCD'[i], 16, 'FFFFFF', 'body', { bold: true, align: 'center', valign: 'middle' });
        text(x + 1.15, y, ow - 1.4, oh, o, pick(o.length, [[30, two ? 26 : 20], [60, 17], [100, 15]], 13), T.ink, 'body', { valign: 'middle', lh: 1.05 });
      });
      footer();
      break;
    }
    case 'answers': {
      kicker(c.deck);
      text(M, 1.2, 10, 0.9, sl.title, 36, T.ink, 'head');
      const n = sl.items.length;
      const cols = n > 5 ? 2 : 1;
      const rows = Math.ceil(n / cols);
      const gw = (SLIDE_W - 2 * M - (cols - 1) * 0.4) / cols;
      const rh = Math.min(0.85, 4.5 / rows);
      sl.items.forEach((it, i) => {
        const col = Math.floor(i / rows);
        const row = i % rows;
        const x = M + col * (gw + 0.4);
        const y = 2.35 + row * rh;
        text(x, y, 0.6, rh, String(i + 1), 18, T.muted, 'head', { valign: 'middle' });
        ellipse(x + 0.6, y + rh / 2 - 0.24, 0.48, 0.48, A);
        text(x + 0.6, y + rh / 2 - 0.24, 0.48, 0.48, it.letter, 13, 'FFFFFF', 'body', { bold: true, align: 'center', valign: 'middle' });
        text(x + 1.3, y, gw - 1.3, rh, it.text, rows > 6 ? 14 : 18, T.ink, 'body', { valign: 'middle' });
        if (row < rows - 1) rect(x, y + rh - 0.01, gw, 0.01, T.muted, { alpha: 0.25 });
      });
      footer();
      break;
    }
    case 'end': {
      bg = T.heroBg;
      const onAccent = T.heroBg === A;
      ellipse(-1.6, -1.8, 5.2, 5.2, onAccent ? 'FFFFFF' : A, onAccent ? 0.12 : 0.1);
      ellipse(SLIDE_W - 3.2, SLIDE_H - 2.6, 4.6, 4.6, onAccent ? 'FFFFFF' : A, onAccent ? 0.12 : 0.14);
      text(M, 2.35, SLIDE_W - 2 * M, 1.5, sl.title, 54, T.heroInk, 'head', { align: 'center', valign: 'middle' });
      rect(SLIDE_W / 2 - 0.5, 4.05, 1.0, 0.06, onAccent ? T.heroInk : A);
      text(M, 4.35, SLIDE_W - 2 * M, 0.7, sl.subtitle, 24, onAccent ? T.heroInk : A, 'body', { align: 'center', valign: 'middle' });
      break;
    }
  }
  return { bg, prims: P };
}

export const fileName = (s: string) => `${s.replace(/[\\/:*?"<>|«»]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'presentation'}.pptx`;

/** writes the .pptx; pptxgenjs loads only when someone downloads */
export async function downloadPptx(slides: SlideWithNotes[], theme: Theme, accent: string, images: Images, name: string, deck: string, author?: string) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck;
  if (author) pptx.author = author;
  const tr = (alpha?: number) => (alpha === undefined || alpha >= 1 ? 0 : Math.round((1 - alpha) * 100));

  slides.forEach((sl, index) => {
    const s = pptx.addSlide();
    const { bg, prims } = layoutSlide(sl, { theme, accent, images, deck, index, total: slides.length });
    s.background = { color: bg };
    for (const p of prims) {
      if (p.t === 'rect') s.addShape(p.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x: p.x, y: p.y, w: p.w, h: p.h, fill: { color: p.fill, transparency: tr(p.alpha) }, line: p.line ? { color: p.line, width: 1 } : { type: 'none' }, rectRadius: p.r });
      else if (p.t === 'ellipse') s.addShape(pptx.ShapeType.ellipse, { x: p.x, y: p.y, w: p.w, h: p.h, fill: { color: p.fill, transparency: tr(p.alpha) }, line: { type: 'none' } });
      else if (p.t === 'img') s.addImage(p.cover ? { data: p.data, x: p.x, y: p.y, w: p.w, h: p.h, sizing: { type: 'cover', w: p.w, h: p.h } } : { data: p.data, x: p.x, y: p.y, w: p.w, h: p.h });
      else
        s.addText(
          p.runs.map((r) => ({ text: r.text, options: { bold: r.bold, color: r.color, fontSize: r.size, breakLine: r.br } })),
          { x: p.x, y: p.y, w: p.w, h: p.h, margin: 0, fontFace: FONTS[p.font], fontSize: p.size, color: p.color, bold: p.bold, italic: p.italic, transparency: tr(p.alpha), align: p.align ?? 'left', valign: p.valign ?? 'top', lineSpacingMultiple: p.lh, charSpacing: p.spacing, paraSpaceAfter: p.para, fit: 'none' },
        );
    }
    if (sl.notes) s.addNotes(sl.notes);
  });

  await pptx.writeFile({ fileName: name });
}
