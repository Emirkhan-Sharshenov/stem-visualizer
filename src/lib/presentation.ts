import type { Section, Topic } from '../data/curriculum';
import { Question, questionsForTopic, shuffle, rng, hashStr } from './quiz';
import { problemQuestion, problemsForTopic } from './problems';
import { iconFor, IconName } from './slideIcons';

/*
 * Presentations for a topic (Pro) or a whole section (Teacher).
 * Slides are described as data, then laid out once as shapes (layoutSlide);
 * the preview and the .pptx file both draw those same shapes, so they always match.
 */

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };

export type ThemeId = 'light' | 'bright' | 'dark' | 'paper' | 'chalk' | 'neon' | 'mono' | 'pastel';
export type FontPairId = 'classic' | 'modern' | 'strict' | 'book' | 'friendly';
export type DecorId = 'none' | 'dots' | 'grid' | 'blobs' | 'rings';
export type TitleLayoutId = 'split' | 'full' | 'center';
export type ScaleId = 'compact' | 'normal' | 'large';

/** everything the person can choose about the look of a deck */
export interface DesignStyle {
  theme: ThemeId;
  fonts: FontPairId;
  /** null keeps the subject colour */
  accent: string | null;
  decor: DecorId;
  title: TitleLayoutId;
  scale: ScaleId;
}
export const DEFAULT_STYLE: DesignStyle = { theme: 'light', fonts: 'classic', accent: null, decor: 'none', title: 'split', scale: 'normal' };
export type Part = 'title' | 'intro' | 'points' | 'formula' | 'model' | 'summary' | 'quiz' | 'answers' | 'end';

export type Slide =
  | { k: 'title'; label: string; title: string; subtitle: string; grade: number; topicId: string }
  | { k: 'agenda'; title: string; items: string[] }
  | { k: 'divider'; n: number; total: number; title: string; label: string; icon: IconName }
  | { k: 'text'; label: string; title: string; text: string; topicId?: string }
  | { k: 'point'; label: string; n: number; total: number; title: string; text: string; of: string; icon: IconName }
  | { k: 'formula'; label: string; title: string; plain: string; caption: string; topicId: string }
  | { k: 'model'; label: string; title: string; caption: string; topicId: string }
  | { k: 'summary'; label: string; title: string; items: { title: string; text: string; icon: IconName }[] }
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
  /** the accent colour and the text colour that reads on it */
  accent: string;
  onAccent: string;
  dark: boolean;
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

const hexRgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
/** relative brightness 0…1 */
export const lum = (h: string) => {
  const [r, g, b] = hexRgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
/** a mixed into b by t (0 → b, 1 → a) */
const mix = (a: string, b: string, t: number) =>
  hexRgb(a)
    .map((v, i) => Math.round(v * t + hexRgb(b)[i] * (1 - t)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const NEON: Record<string, string> = { physics: 'FF4D6D', chemistry: '2EF2A0', biology: 'FFC93C', mathematics: 'B98CFF' };
export const THEME_NAMES: Record<ThemeId, T2> = {
  light: { ru: 'Светлая', en: 'Light' },
  bright: { ru: 'Яркая', en: 'Bright' },
  dark: { ru: 'Тёмная', en: 'Dark' },
  paper: { ru: 'Бумага', en: 'Paper' },
  chalk: { ru: 'Школьная доска', en: 'Chalkboard' },
  neon: { ru: 'Неон', en: 'Neon' },
  mono: { ru: 'Чёрно-белая', en: 'Mono' },
  pastel: { ru: 'Пастель', en: 'Pastel' },
};

export function themeFor(id: ThemeId, subject: string, accent: string | null = null): Theme {
  const a = accent ?? (id === 'chalk' ? 'F2D06B' : id === 'mono' ? '1A1A1A' : id === 'neon' ? NEON[subject] ?? '3DF2D0' : accentFor(subject));
  const onAccent = lum(a) > 0.6 ? '16171A' : 'FFFFFF';
  const base = { id, name: THEME_NAMES[id], accent: a, onAccent };
  switch (id) {
    case 'dark':
      return { ...base, bg: '121316', ink: 'F1F1EE', muted: '8C8F98', card: '1D1F24', panel: '1A1C21', heroBg: '0C0D0F', heroInk: 'FFFFFF', heroMuted: 'A0A3AB', dark: true };
    case 'bright':
      return { ...base, bg: mix(a, 'FFFFFF', 0.1), ink: '16171A', muted: '5A5D66', card: 'FFFFFF', panel: 'FFFFFF', heroBg: a, heroInk: onAccent, heroMuted: onAccent === 'FFFFFF' ? 'FFFFFF' : '3A2E10', dark: false };
    case 'paper':
      return { ...base, bg: 'F6F1E6', ink: '2E2A24', muted: '7C7263', card: 'EDE5D3', panel: mix(a, 'F6F1E6', 0.14), heroBg: 'F6F1E6', heroInk: '2E2A24', heroMuted: '7C7263', dark: false };
    case 'chalk':
      return { ...base, bg: '223B2F', ink: 'F3F1E7', muted: 'B4C2B8', card: '2B4A3B', panel: '284536', heroBg: '1B3226', heroInk: 'FFFFFF', heroMuted: 'C8D4CB', dark: true };
    case 'neon':
      return { ...base, bg: '0B1026', ink: 'EAEEFF', muted: '8E97C4', card: '151C3F', panel: '121939', heroBg: '070B1C', heroInk: 'FFFFFF', heroMuted: 'A3ACD6', dark: true };
    case 'mono':
      return { ...base, bg: 'FFFFFF', ink: '111111', muted: '6E6E6E', card: 'F2F2F2', panel: 'F2F2F2', heroBg: '111111', heroInk: 'FFFFFF', heroMuted: 'B5B5B5', dark: false };
    case 'pastel':
      return { ...base, bg: 'FBF8F3', ink: '2E2A33', muted: '7E7886', card: 'FFFFFF', panel: mix(a, 'FFFFFF', 0.18), heroBg: mix(a, 'FFFFFF', 0.22), heroInk: '2E2A33', heroMuted: '6E6876', dark: false };
    default:
      return { ...base, bg: 'FFFFFF', ink: '16171A', muted: '6B6B6B', card: 'F5F4F0', panel: mix(a, 'FFFFFF', 0.12), heroBg: 'FFFFFF', heroInk: '16171A', heroMuted: '6B6B6B', dark: false };
  }
}
export const THEMES: ThemeId[] = ['light', 'bright', 'dark', 'paper', 'pastel', 'chalk', 'neon', 'mono'];
/** accent swatches besides the subject colour */
export const ACCENTS = ['2F5BFF', '0EA5E9', '14B8A6', '22A06B', 'F97316', 'E11D48', 'D946EF', '7C3AED', '334155'];

/** font pairs present in PowerPoint (Windows and Mac) and Google Slides, all with Cyrillic */
export const FONT_PAIRS: Record<FontPairId, { name: T2; head: string; body: string; headBold: boolean }> = {
  classic: { name: { ru: 'Классика', en: 'Classic' }, head: 'Georgia', body: 'Calibri', headBold: false },
  modern: { name: { ru: 'Современный', en: 'Modern' }, head: 'Calibri', body: 'Calibri', headBold: true },
  strict: { name: { ru: 'Строгий', en: 'Strict' }, head: 'Arial', body: 'Arial', headBold: true },
  book: { name: { ru: 'Книжный', en: 'Bookish' }, head: 'Cambria', body: 'Cambria', headBold: false },
  friendly: { name: { ru: 'Дружелюбный', en: 'Friendly' }, head: 'Trebuchet MS', body: 'Trebuchet MS', headBold: true },
};


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
    if (o.section) slides.push({ k: 'divider', n: ti + 1, total: topics.length, title: t.title[lang], label: L(`Тема ${ti + 1} из ${topics.length}`, `Topic ${ti + 1} of ${topics.length}`), icon: iconFor([t.title.ru, t.intro.ru], t.subject) });
    if (parts.has('intro'))
      slides.push({ k: 'text', label: tl, title: o.section ? L('Суть', 'The idea') : L('О чём тема', 'What it is about'), text: t.intro[lang], topicId: o.section ? undefined : t.id, notes: note(`${t.intro[lang]}\n\n${L('Вопрос классу: как бы вы объяснили это младшему брату?', 'Ask the class: how would you explain this to a younger sibling?')}`) });
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
          icon: iconFor([p.title.ru, p.text.ru, t.title.ru], t.subject),
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
      items: o.section
        ? topics.map((t) => ({ title: t.title[lang], text: firstSentence(t.intro[lang]), icon: iconFor([t.title.ru, t.intro.ru], t.subject) }))
        : o.topic.points.map((p) => ({ title: p.title[lang], text: firstSentence(p.text[lang]), icon: iconFor([p.title.ru, p.text.ru, o.topic.title.ru], o.topic.subject) })),
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
export const fontFace = (pair: FontPairId, f: keyof typeof FONTS) => (f === 'math' ? FONTS.math : FONT_PAIRS[pair][f]);

export interface Img {
  data: string;
  w: number;
  h: number;
}
/** a picture from Wikipedia with its credit line; photos fill their box, diagrams sit inside it whole */
export type Photo = Img & { credit: string; photo: boolean };
export type Images = { formula: Record<string, Img>; model: Record<string, Img>; photos: Photo[]; icons: Partial<Record<IconName, Img>> };
export const NO_IMAGES: Images = { formula: {}, model: {}, photos: [], icons: {} };

/** every icon the slides use, to prepare them before drawing */
export function iconsUsed(slides: Slide[]): IconName[] {
  const set = new Set<IconName>();
  for (const s of slides) {
    if (s.k === 'point' || s.k === 'divider') set.add(s.icon);
    if (s.k === 'summary') s.items.forEach((i) => set.add(i.icon));
  }
  return [...set];
}

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
  | { t: 'ellipse'; x: number; y: number; w: number; h: number; fill: string; alpha?: number; line?: string; lineAlpha?: number }
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
  | { t: 'img'; x: number; y: number; w: number; h: number; data: string; cover?: boolean; alpha?: number };

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
  style: DesignStyle;
  theme: Theme;
  accent: string;
  images: Images;
  /** footer: the deck's name */
  deck: string;
  index: number;
  total: number;
}

const M = 0.75; // side margin

/** Wikipedia pictures take the title and the intro (the model, with its controls, has a slide of its own) */
function picks(c: { images: Images; style: DesignStyle }) {
  const ph = c.images.photos;
  // the centred title has no picture, so the intro takes the first one
  return c.style.title === 'center' ? { title: null, intro: ph[0] ?? null } : { title: ph[0] ?? null, intro: ph[1] ?? null };
}
const one = (text: string): Run[] => [{ text }];

export function layoutSlide(sl: Slide, c: LayoutCtx): { bg: string; prims: Prim[] } {
  const { theme: T, accent: A, style: S } = c;
  const P: Prim[] = [];
  const k = S.scale === 'large' ? 1.1 : S.scale === 'compact' ? 0.9 : 1;
  const headBold = FONT_PAIRS[S.fonts].headBold;
  // body and heading sizes follow the chosen text size; small labels and huge numerals stay put
  const text = (x: number, y: number, w: number, h: number, runs: Run[] | string, size: number, color: string, font: keyof typeof FONTS = 'body', extra: Partial<Extract<Prim, { t: 'text' }>> = {}) =>
    P.push({ t: 'text', x, y, w, h, runs: typeof runs === 'string' ? one(runs) : runs, size: size >= 15 && size <= 60 ? Math.round(size * k) : size, color, font, bold: font === 'head' && headBold ? true : undefined, ...extra });
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra: Partial<Extract<Prim, { t: 'rect' }>> = {}) => P.push({ t: 'rect', x, y, w, h, fill, ...extra });
  const ellipse = (x: number, y: number, w: number, h: number, fill: string, alpha = 1) => P.push({ t: 'ellipse', x, y, w, h, fill, alpha });
  // the accent on the title and closing slides: falls back to the text colour when it would not show
  const heroA = Math.abs(lum(A) - lum(T.heroBg)) < 0.25 ? T.heroInk : A;
  const heroOnAccent = T.heroBg === A;
  const ON = T.onAccent;

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

  // background pattern on the content slides, drawn first so everything sits on top
  if (sl.k !== 'title' && sl.k !== 'end' && sl.k !== 'divider') {
    if (S.decor === 'dots') for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) ellipse(SLIDE_W - 3.0 + i * 0.32, 0.4 + j * 0.32, 0.07, 0.07, A, 0.4);
    if (S.decor === 'grid') {
      for (let x = 0.5; x < SLIDE_W; x += 0.5) rect(x, 0, 0.01, SLIDE_H, T.ink, { alpha: 0.05 });
      for (let y = 0.5; y < SLIDE_H; y += 0.5) rect(0, y, SLIDE_W, 0.01, T.ink, { alpha: 0.05 });
    }
    if (S.decor === 'blobs') {
      ellipse(SLIDE_W - 3.2, -1.7, 5.2, 5.2, A, 0.08);
      ellipse(-1.9, SLIDE_H - 2.3, 4.4, 4.4, A, 0.06);
    }
    if (S.decor === 'rings') {
      P.push({ t: 'ellipse', x: SLIDE_W - 3.0, y: -1.6, w: 4.4, h: 4.4, fill: A, alpha: 0, line: A, lineAlpha: 0.3 });
      P.push({ t: 'ellipse', x: SLIDE_W - 2.3, y: -0.9, w: 3.0, h: 3.0, fill: A, alpha: 0, line: A, lineAlpha: 0.22 });
      P.push({ t: 'ellipse', x: -1.6, y: SLIDE_H - 1.9, w: 3.4, h: 3.4, fill: A, alpha: 0, line: A, lineAlpha: 0.2 });
    }
  }

  switch (sl.k) {
    case 'title': {
      bg = T.heroBg;
      const photo = picks(c).title;
      const tsz = pick(sl.title.length, [[24, 46], [44, 40], [70, 34]], 30);
      if (S.title === 'center') {
        P.push({ t: 'ellipse', x: SLIDE_W / 2 - 4.2, y: SLIDE_H / 2 - 4.2, w: 8.4, h: 8.4, fill: A, alpha: 0, line: heroA, lineAlpha: 0.18 });
        P.push({ t: 'ellipse', x: SLIDE_W / 2 - 3.2, y: SLIDE_H / 2 - 3.2, w: 6.4, h: 6.4, fill: A, alpha: 0, line: heroA, lineAlpha: 0.12 });
        ellipse(SLIDE_W - 2.4, -1.1, 3.4, 3.4, heroOnAccent ? 'FFFFFF' : A, heroOnAccent ? 0.12 : 0.1);
        ellipse(-1.2, SLIDE_H - 2.2, 3.0, 3.0, heroOnAccent ? 'FFFFFF' : A, heroOnAccent ? 0.12 : 0.1);
        text(M, 1.7, SLIDE_W - 2 * M, 0.35, sl.label.toUpperCase(), 12, heroA, 'body', { bold: true, spacing: 3, align: 'center' });
        text(1.5, 2.2, SLIDE_W - 3, 2.4, sl.title, tsz + 4, T.heroInk, 'head', { align: 'center', valign: 'middle', lh: 0.95 });
        rect(SLIDE_W / 2 - 0.5, 4.8, 1.0, 0.06, heroA);
        if (sl.subtitle) text(2.2, 5.05, SLIDE_W - 4.4, 1.2, sl.subtitle, 17, heroOnAccent ? T.heroMuted : T.heroMuted, 'body', { align: 'center', valign: 'top', lh: 1.1 });
        break;
      }
      if (S.title === 'full') {
        const overlay = !!photo?.photo;
        if (photo?.photo) {
          P.push({ t: 'img', x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, data: photo.data, cover: true });
          rect(0, 0, SLIDE_W, SLIDE_H, '000000', { alpha: 0.55 });
        } else {
          text(SLIDE_W - 5.6, -0.6, 5.6, 7.5, String(sl.grade), 400, heroOnAccent ? 'FFFFFF' : A, 'head', { align: 'right', valign: 'middle', alpha: heroOnAccent ? 0.18 : 0.12 });
          ellipse(-1.6, -1.8, 5.2, 5.2, heroOnAccent ? 'FFFFFF' : A, heroOnAccent ? 0.12 : 0.08);
          if (photo) {
            rect(8.4, 1.1, 4.2, 4.9, 'FFFFFF', { r: 0.2 });
            P.push({ t: 'img', ...fit(photo, 8.65, 1.35, 3.7, 4.4), data: photo.data });
          }
        }
        const ink = overlay ? 'FFFFFF' : T.heroInk;
        const acc = overlay ? 'FFFFFF' : heroA;
        text(M, 3.1, 7.4, 0.35, sl.label.toUpperCase(), 12, acc, 'body', { bold: true, spacing: 3 });
        rect(M, 3.55, 0.7, 0.06, acc);
        text(M, 3.8, photo && !overlay ? 7.2 : 10.5, 2.2, sl.title, tsz + 4, ink, 'head', { valign: 'top', lh: 0.95 });
        if (sl.subtitle) text(M, 6.0, photo && !overlay ? 7.0 : 9.5, 0.9, sl.subtitle, 16, overlay ? 'FFFFFF' : T.heroMuted, 'body', { valign: 'top', lh: 1.1 });
        if (photo) text(M, SLIDE_H - 0.4, 9, 0.3, photo.credit, 8, overlay ? 'FFFFFF' : T.heroMuted, 'body', { alpha: 0.8 });
        break;
      }
      const bright = heroOnAccent;
      const px = 8.15;
      // right side: a Wikipedia picture, or a coloured panel with the grade
      if (photo) {
        const pw = SLIDE_W - px;
        if (photo.photo) P.push({ t: 'img', x: px, y: 0, w: pw, h: SLIDE_H, data: photo.data, cover: true });
        else {
          rect(px, 0, pw, SLIDE_H, 'FFFFFF');
          P.push({ t: 'img', ...fit(photo, px + 0.45, 0.5, pw - 0.9, SLIDE_H - 1.3), data: photo.data });
        }
        rect(px, SLIDE_H - 0.42, pw, 0.42, '000000', { alpha: 0.45 });
        text(px + 0.2, SLIDE_H - 0.38, pw - 0.4, 0.34, photo.credit, 8, 'FFFFFF', 'body', { valign: 'middle' });
        rect(px - 0.12, 0, 0.12, SLIDE_H, A);
      } else {
        rect(px, 0, SLIDE_W - px, SLIDE_H, bright ? 'FFFFFF' : A, { alpha: bright ? 0.14 : 1 });
        ellipse(px + 2.2, -1.4, 5, 5, 'FFFFFF', 0.12);
        ellipse(px - 1.2, 4.6, 3.6, 3.6, bright ? 'FFFFFF' : A, bright ? 0.12 : 1);
        text(px, 1.6, SLIDE_W - px, 3.2, String(sl.grade), 190, bright ? T.heroInk : ON, 'head', { align: 'center', valign: 'middle' });
        text(px, 4.7, SLIDE_W - px, 0.5, sl.label.split('·')[1]?.trim().toUpperCase() ?? '', 14, bright ? T.heroInk : ON, 'body', { align: 'center', bold: true, spacing: 4 });
      }
      const ink = T.heroInk;
      const sub = T.heroMuted;
      kicker(sl.label, M, 1.55, heroA);
      text(M, 2.25, px - M - 0.6, 3.0, sl.title, tsz, ink, 'head', { valign: 'top', lh: 0.95 });
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
      text(0, 1.6, 5.0, 3.6, String(sl.n).padStart(2, '0'), 150, ON, 'head', { align: 'center', valign: 'middle' });
      const dic = c.images.icons[sl.icon];
      if (dic) P.push({ t: 'img', x: SLIDE_W - M - 2.4, y: SLIDE_H - 3.0, w: 2.4, h: 2.4, data: dic.data, alpha: 0.35 });
      kicker(sl.label, 5.8, 2.55);
      text(5.8, 3.15, SLIDE_W - 5.8 - M, 2.6, sl.title, pick(sl.title.length, [[30, 40], [60, 34]], 28), T.ink, 'head', { valign: 'top', lh: 1.0 });
      break;
    }
    case 'text': {
      const photo = sl.topicId ? picks(c).intro : null;
      if (photo) {
        // text on the left, the picture fills the right
        const px = 7.9;
        const pw = SLIDE_W - px;
        if (photo.photo) P.push({ t: 'img', x: px, y: 0, w: pw, h: SLIDE_H, data: photo.data, cover: true });
        else {
          rect(px, 0, pw, SLIDE_H, 'FFFFFF');
          P.push({ t: 'img', ...fit(photo, px + 0.4, 0.45, pw - 0.8, SLIDE_H - 1.25), data: photo.data });
        }
        rect(px, SLIDE_H - 0.42, pw, 0.42, '000000', { alpha: 0.45 });
        text(px + 0.2, SLIDE_H - 0.38, pw - 0.4, 0.34, photo.credit, 8, 'FFFFFF', 'body', { valign: 'middle' });
        kicker(sl.label);
        text(M, 1.3, px - M - 0.5, 0.9, sl.title, 34, T.ink, 'head');
        rect(M, 2.45, 0.06, 3.7, A, { alpha: 0.6 });
        text(M + 0.4, 2.3, px - M - 1.0, 4.0, sl.text, pick(sl.text.length, [[110, 28], [200, 24], [330, 21], [480, 18]], 16), T.ink, 'head', { valign: 'middle', lh: 1.15 });
        text(M, SLIDE_H - 0.55, 5, 0.3, c.deck, 10, T.muted, 'body');
        break;
      }
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
      text(M, 3.35, pw - M - 0.35, 1.5, sl.title, pick(sl.title.length, [[18, 36], [34, 30], [56, 25]], 21), T.ink, 'head', { valign: 'top', lh: 1.0 });
      const ic = c.images.icons[sl.icon];
      if (ic) {
        // a big line drawing in the corner of the panel, partly cut off by the edge
        P.push({ t: 'img', x: pw - 2.3, y: 5.0, w: 2.6, h: 2.6, data: ic.data, alpha: T.dark ? 0.55 : 0.4 });
        ellipse(SLIDE_W - M - 1.0, 0.55, 1.0, 1.0, A, 0.12);
        P.push({ t: 'img', x: SLIDE_W - M - 0.8, y: 0.75, w: 0.6, h: 0.6, data: ic.data });
      }
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
      rect(M, 2.3, SLIDE_W - 2 * M, 3.85, T.dark ? 'FFFFFF' : T.card, { r: 0.18 });
      rect(M, 2.3, 0.09, 3.85, A);
      if (img) P.push({ t: 'img', ...fit(img, M + 0.8, 2.75, SLIDE_W - 2 * M - 1.6, 2.95), data: img.data });
      else text(M + 0.5, 2.3, SLIDE_W - 2 * M - 1, 3.85, sl.plain, pick(sl.plain.length, [[20, 54], [40, 44]], 34), T.dark ? '16171A' : T.ink, 'math', { align: 'center', valign: 'middle' });
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
        const ic = c.images.icons[it.icon];
        if (ic) {
          const d = n <= 4 ? 0.62 : 0.42;
          P.push({ t: 'img', x: x + cw - d - 0.3, y: y + 0.3, w: d, h: d, data: ic.data });
        }
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
        text(x + 0.3, y + oh / 2 - 0.3, 0.6, 0.6, 'ABCD'[i], 16, ON, 'body', { bold: true, align: 'center', valign: 'middle' });
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
        text(x + 0.6, y + rh / 2 - 0.24, 0.48, 0.48, it.letter, 13, ON, 'body', { bold: true, align: 'center', valign: 'middle' });
        text(x + 1.3, y, gw - 1.3, rh, it.text, rows > 6 ? 14 : 18, T.ink, 'body', { valign: 'middle' });
        if (row < rows - 1) rect(x, y + rh - 0.01, gw, 0.01, T.muted, { alpha: 0.25 });
      });
      footer();
      break;
    }
    case 'end': {
      bg = T.heroBg;
      ellipse(-1.6, -1.8, 5.2, 5.2, heroOnAccent ? 'FFFFFF' : A, heroOnAccent ? 0.12 : 0.1);
      ellipse(SLIDE_W - 3.2, SLIDE_H - 2.6, 4.6, 4.6, heroOnAccent ? 'FFFFFF' : A, heroOnAccent ? 0.12 : 0.14);
      text(M, 2.35, SLIDE_W - 2 * M, 1.5, sl.title, 54, T.heroInk, 'head', { align: 'center', valign: 'middle' });
      rect(SLIDE_W / 2 - 0.5, 4.05, 1.0, 0.06, heroA);
      text(M, 4.35, SLIDE_W - 2 * M, 0.7, sl.subtitle, 24, heroA, 'body', { align: 'center', valign: 'middle' });
      break;
    }
  }
  return { bg, prims: P };
}

export const fileName = (s: string) => `${s.replace(/[\\/:*?"<>|«»]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'presentation'}.pptx`;

/** writes the .pptx; pptxgenjs loads only when someone downloads */
export async function downloadPptx(slides: SlideWithNotes[], style: DesignStyle, theme: Theme, images: Images, name: string, deck: string, author?: string) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck;
  if (author) pptx.author = author;
  const tr = (alpha?: number) => (alpha === undefined || alpha >= 1 ? 0 : Math.round((1 - alpha) * 100));

  slides.forEach((sl, index) => {
    const s = pptx.addSlide();
    const { bg, prims } = layoutSlide(sl, { style, theme, accent: theme.accent, images, deck, index, total: slides.length });
    s.background = { color: bg };
    for (const p of prims) {
      if (p.t === 'rect') s.addShape(p.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x: p.x, y: p.y, w: p.w, h: p.h, fill: { color: p.fill, transparency: tr(p.alpha) }, line: p.line ? { color: p.line, width: 1 } : { type: 'none' }, rectRadius: p.r });
      else if (p.t === 'ellipse')
        s.addShape(pptx.ShapeType.ellipse, { x: p.x, y: p.y, w: p.w, h: p.h, fill: p.alpha === 0 ? { type: 'none' } : { color: p.fill, transparency: tr(p.alpha) }, line: p.line ? { color: p.line, width: 1.5, transparency: tr(p.lineAlpha) } : { type: 'none' } });
      else if (p.t === 'img') s.addImage({ data: p.data, x: p.x, y: p.y, w: p.w, h: p.h, ...(p.cover ? { sizing: { type: 'cover' as const, w: p.w, h: p.h } } : {}), ...(p.alpha !== undefined && p.alpha < 1 ? { transparency: tr(p.alpha) } : {}) });
      else
        s.addText(
          p.runs.map((r) => ({ text: r.text, options: { bold: r.bold, color: r.color, fontSize: r.size, breakLine: r.br } })),
          { x: p.x, y: p.y, w: p.w, h: p.h, margin: 0, fontFace: fontFace(style.fonts, p.font), fontSize: p.size, color: p.color, bold: p.bold, italic: p.italic, transparency: tr(p.alpha), align: p.align ?? 'left', valign: p.valign ?? 'top', lineSpacingMultiple: p.lh, charSpacing: p.spacing, paraSpaceAfter: p.para, fit: 'none' },
        );
    }
    if (sl.notes) s.addNotes(sl.notes);
  });

  await pptx.writeFile({ fileName: name });
}
