import type { Section, Topic } from '../data/curriculum';
import { sectionsFor } from '../data/curriculum';
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
export type TitleLayoutId = 'split' | 'full' | 'center' | 'band' | 'frame' | 'minimal' | 'magazine' | 'blocks' | 'split-left';
export type HeaderId = 'kicker' | 'band' | 'underline' | 'side';
export type PointLayoutId = 'panel' | 'panel-right' | 'band' | 'card' | 'big-number' | 'steps';
export type IntroLayoutId = 'quote' | 'card' | 'centered' | 'band';
export type SummaryLayoutId = 'cards' | 'list' | 'timeline' | 'columns';
export type QuizLayoutId = 'grid' | 'list' | 'tiles';
export type EndLayoutId = 'center' | 'split' | 'band';
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
  /** rounded or square cards */
  corners?: 'round' | 'sharp';
  /** what the bottom line shows */
  footer?: 'full' | 'number' | 'none';
  /** subject icons on the slides */
  icons?: boolean;
  /** how each kind of slide is composed */
  header?: HeaderId;
  point?: PointLayoutId;
  intro?: IntroLayoutId;
  summary?: SummaryLayoutId;
  quiz?: QuizLayoutId;
  end?: EndLayoutId;
  /** the template these settings came from */
  template?: string;
}

/** ready-made templates: each sets its own composition for every kind of slide, plus colours and fonts */
export const TEMPLATES: { id: string; name: T2; style: Partial<DesignStyle> }[] = [
  { id: 'classic', name: { ru: 'Классика', en: 'Classic' }, style: { theme: 'light', fonts: 'classic', accent: null, decor: 'none', title: 'split', header: 'kicker', point: 'panel', intro: 'quote', summary: 'cards', quiz: 'grid', end: 'center', corners: 'round' } },
  { id: 'magazine', name: { ru: 'Журнал', en: 'Magazine' }, style: { theme: 'light', fonts: 'book', accent: null, decor: 'none', title: 'magazine', header: 'underline', point: 'big-number', intro: 'centered', summary: 'list', quiz: 'list', end: 'split', corners: 'sharp' } },
  { id: 'corporate', name: { ru: 'Деловой', en: 'Business' }, style: { theme: 'light', fonts: 'strict', accent: '334155', decor: 'none', title: 'band', header: 'band', point: 'band', intro: 'card', summary: 'columns', quiz: 'tiles', end: 'band', corners: 'sharp' } },
  { id: 'minimal', name: { ru: 'Минимализм', en: 'Minimal' }, style: { theme: 'mono', fonts: 'modern', accent: null, decor: 'none', title: 'minimal', header: 'underline', point: 'big-number', intro: 'centered', summary: 'list', quiz: 'list', end: 'center', corners: 'sharp' } },
  { id: 'science', name: { ru: 'Научный', en: 'Science' }, style: { theme: 'light', fonts: 'book', accent: null, decor: 'grid', title: 'frame', header: 'side', point: 'panel-right', intro: 'card', summary: 'timeline', quiz: 'list', end: 'center', corners: 'sharp' } },
  { id: 'steps', name: { ru: 'Шаг за шагом', en: 'Step by step' }, style: { theme: 'light', fonts: 'modern', accent: null, decor: 'none', title: 'split-left', header: 'kicker', point: 'steps', intro: 'quote', summary: 'timeline', quiz: 'grid', end: 'split', corners: 'round' } },
  { id: 'cards', name: { ru: 'Карточки', en: 'Cards' }, style: { theme: 'pastel', fonts: 'friendly', accent: null, decor: 'blobs', title: 'center', header: 'kicker', point: 'card', intro: 'card', summary: 'cards', quiz: 'tiles', end: 'center', corners: 'round' } },
  { id: 'kids', name: { ru: 'Для младших', en: 'For kids' }, style: { theme: 'bright', fonts: 'friendly', accent: null, decor: 'blobs', title: 'blocks', header: 'band', point: 'card', intro: 'band', summary: 'columns', quiz: 'tiles', end: 'band', corners: 'round' } },
  { id: 'chalk', name: { ru: 'У доски', en: 'Chalkboard' }, style: { theme: 'chalk', fonts: 'friendly', accent: null, decor: 'none', title: 'center', header: 'underline', point: 'big-number', intro: 'centered', summary: 'list', quiz: 'list', end: 'center', corners: 'round' } },
  { id: 'neon', name: { ru: 'Неон', en: 'Neon' }, style: { theme: 'neon', fonts: 'modern', accent: null, decor: 'rings', title: 'full', header: 'side', point: 'panel-right', intro: 'band', summary: 'timeline', quiz: 'tiles', end: 'split', corners: 'round' } },
  { id: 'paper', name: { ru: 'Тетрадь', en: 'Notebook' }, style: { theme: 'paper', fonts: 'book', accent: null, decor: 'grid', title: 'frame', header: 'underline', point: 'big-number', intro: 'quote', summary: 'list', quiz: 'list', end: 'center', corners: 'sharp' } },
  { id: 'cinema', name: { ru: 'Кинозал', en: 'Cinema' }, style: { theme: 'dark', fonts: 'classic', accent: null, decor: 'none', title: 'full', header: 'kicker', point: 'big-number', intro: 'centered', summary: 'columns', quiz: 'grid', end: 'band', corners: 'round' } },
  { id: 'poster', name: { ru: 'Плакат', en: 'Poster' }, style: { theme: 'bright', fonts: 'strict', accent: null, decor: 'none', title: 'band', header: 'band', point: 'band', intro: 'band', summary: 'cards', quiz: 'tiles', end: 'band', corners: 'sharp' } },
  { id: 'gallery', name: { ru: 'Галерея', en: 'Gallery' }, style: { theme: 'light', fonts: 'classic', accent: null, decor: 'dots', title: 'magazine', header: 'kicker', point: 'panel', intro: 'quote', summary: 'columns', quiz: 'grid', end: 'split', corners: 'round' } },
  { id: 'mosaic', name: { ru: 'Мозаика', en: 'Mosaic' }, style: { theme: 'light', fonts: 'modern', accent: null, decor: 'dots', title: 'blocks', header: 'side', point: 'card', intro: 'card', summary: 'cards', quiz: 'tiles', end: 'split', corners: 'round' } },
  { id: 'lesson', name: { ru: 'Открытый урок', en: 'Open lesson' }, style: { theme: 'light', fonts: 'friendly', accent: null, decor: 'none', title: 'split', header: 'band', point: 'steps', intro: 'card', summary: 'timeline', quiz: 'list', end: 'center', corners: 'round' } },
  { id: 'academic', name: { ru: 'Академический', en: 'Academic' }, style: { theme: 'paper', fonts: 'book', accent: '7C3AED', decor: 'none', title: 'minimal', header: 'underline', point: 'panel-right', intro: 'quote', summary: 'list', quiz: 'list', end: 'center', corners: 'sharp' } },
  { id: 'ocean', name: { ru: 'Океан', en: 'Ocean' }, style: { theme: 'light', fonts: 'modern', accent: '0EA5E9', decor: 'rings', title: 'split-left', header: 'side', point: 'band', intro: 'card', summary: 'columns', quiz: 'tiles', end: 'band', corners: 'round' } },
  { id: 'sunset', name: { ru: 'Закат', en: 'Sunset' }, style: { theme: 'pastel', fonts: 'classic', accent: 'F97316', decor: 'blobs', title: 'center', header: 'underline', point: 'card', intro: 'centered', summary: 'timeline', quiz: 'grid', end: 'split', corners: 'round' } },
  { id: 'forest', name: { ru: 'Природа', en: 'Nature' }, style: { theme: 'paper', fonts: 'friendly', accent: '22A06B', decor: 'none', title: 'frame', header: 'kicker', point: 'panel', intro: 'band', summary: 'columns', quiz: 'list', end: 'band', corners: 'round' } },
  { id: 'night', name: { ru: 'Ночь', en: 'Night' }, style: { theme: 'neon', fonts: 'strict', accent: null, decor: 'none', title: 'minimal', header: 'band', point: 'steps', intro: 'centered', summary: 'cards', quiz: 'tiles', end: 'center', corners: 'sharp' } },
  { id: 'berry', name: { ru: 'Ягодный', en: 'Berry' }, style: { theme: 'bright', fonts: 'classic', accent: 'E11D48', decor: 'rings', title: 'split-left', header: 'underline', point: 'panel-right', intro: 'quote', summary: 'timeline', quiz: 'grid', end: 'split', corners: 'round' } },
];

/** the teacher's own details for the title slide and footer */
export interface Branding {
  school?: string;
  teacher?: string;
  klass?: string;
  date?: string;
  logo?: Img;
}
export const DEFAULT_STYLE: DesignStyle = { theme: 'light', fonts: 'classic', accent: null, decor: 'none', title: 'split', scale: 'normal', corners: 'round', footer: 'full', icons: true };
export type Part = 'title' | 'intro' | 'points' | 'formula' | 'model' | 'summary' | 'quiz' | 'answers' | 'end' | LessonPart;
/** lesson-structure slides for teachers */
export type LessonPart = 'goals' | 'warmup' | 'terms' | 'example' | 'homework' | 'reflection';
export const LESSON_PARTS: LessonPart[] = ['goals', 'warmup', 'terms', 'example', 'homework', 'reflection'];

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
  | { k: 'end'; title: string; subtitle: string }
  | { k: 'goals'; title: string; know: string[]; can: string[] }
  | { k: 'warmup'; title: string; items: string[] }
  | { k: 'terms'; title: string; items: { term: string; text: string }[] }
  | { k: 'example'; title: string; problem: string; steps: string[]; answer: string }
  | { k: 'homework'; title: string; items: string[]; due: string }
  | { k: 'reflection'; title: string; prompts: string[] };

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

/** the topic that comes right before this one in its subject and grade */
function TOPICS_BEFORE(t: Topic): Topic | undefined {
  const list = sectionsFor(t.subject, t.grade).flatMap((s) => s.topics);
  const i = list.findIndex((x) => x.id === t.id);
  return i > 0 ? list[i - 1] : undefined;
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
  // lesson start: goals, a warm-up on the previous topic, key terms
  if (!o.section && parts.has('goals')) {
    const hasCalc = problemsForTopic(o.topic.id).length > 0;
    slides.push({
      k: 'goals',
      title: L('Цели урока', 'Lesson goals'),
      know: o.topic.points.map((p) => p.title[lang]),
      can: [
        L(`объяснять своими словами тему «${o.topic.title[lang]}»`, `explain “${o.topic.title[lang]}” in your own words`),
        ...(o.topic.formula ? [L('применять формулу темы и знать, что означает каждая буква', 'use the topic formula and know what each letter means')] : []),
        ...(hasCalc ? [L('решать расчётные задачи по теме', 'solve calculation problems on the topic')] : [L('приводить примеры из жизни', 'give real-life examples')]),
      ],
      notes: note(L('Озвучьте цели и вернитесь к ним в конце урока на рефлексии.', 'Read the goals out and come back to them at the reflection.')),
    });
  }
  if (o.section && parts.has('title')) slides.push({ k: 'agenda', title: L('План урока', 'Outline'), items: topics.map((t) => t.title[lang]) });
  if (!o.section && parts.has('warmup')) {
    // questions on the topic just before this one, or on this one when it is the first
    const sec = o.topic;
    const prev = TOPICS_BEFORE(sec);
    const qs = topicQuestions(prev ?? sec, 3, seed + 11);
    const letters = 'ABCD';
    slides.push({
      k: 'warmup',
      title: prev ? L(`Разминка: вспомним «${prev.title[lang]}»`, `Warm-up: “${prev.title[lang]}”`) : L('Разминка', 'Warm-up'),
      items: qs.map((q) => `${q.prompt[lang]}  (${q.options.map((x, i) => `${letters[i]}) ${optText(x, lang)}`).join('; ')})`),
      notes: note(qs.map((q, i) => `${i + 1}. ${letters[q.correct]} — ${optText(q.options[q.correct], lang)}`).join('\n')),
    });
  }
  if (!o.section && parts.has('terms'))
    slides.push({ k: 'terms', title: L('Ключевые понятия', 'Key terms'), items: o.topic.points.map((p) => ({ term: p.title[lang], text: firstSentence(p.text[lang]) })) });

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

  // a problem solved together at the board, step by step
  if (!o.section && parts.has('example')) {
    const gens = problemsForTopic(o.topic.id);
    if (gens.length) {
      const q = problemQuestion(gens[(seed + 3) % gens.length], seed + 101);
      const steps = (q.explain?.[lang] ?? '').split(/;\s+|\.\s+(?=[А-ЯA-Z])/).map((x) => x.trim()).filter(Boolean);
      slides.push({ k: 'example', title: L('Разбираем у доски', 'Worked example'), problem: q.prompt[lang], steps, answer: optText(q.options[q.correct], lang), notes: note(L('Сначала дайте классу 2–3 минуты подумать, потом открывайте решение по шагам.', 'Give the class 2–3 minutes first, then go through the steps.')) });
    }
  }
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

  if (parts.has('homework')) {
    const gens = topics.flatMap((t) => problemsForTopic(t.id));
    // three different problems, none of them the one solved at the board
    const taken = new Set(slides.filter((x) => x.k === 'example').map((x) => (x as { problem: string }).problem));
    const qs: ReturnType<typeof problemQuestion>[] = [];
    for (let i = 0; gens.length && qs.length < 3 && i < 30; i++) {
      const q = problemQuestion(gens[(seed + i * 5) % gens.length], seed + 500 + i * 37);
      if (!taken.has(q.prompt[lang])) {
        taken.add(q.prompt[lang]);
        qs.push(q);
      }
    }
    const items = qs.length
      ? qs.map((q) => q.prompt[lang])
      : topics.slice(0, 3).flatMap((t) => t.points.slice(0, 1).map((p) => L(`Объясни письменно: ${p.title[lang].toLowerCase()} (тема «${t.title[lang]}»).`, `Explain in writing: ${p.title[lang]} (“${t.title[lang]}”).`)));
    slides.push({
      k: 'homework',
      title: L('Домашнее задание', 'Homework'),
      items: [...items, L('Повтори конспект и проверь себя тестом по теме на сайте.', 'Review your notes and take the topic test on the site.')],
      due: L('к следующему уроку', 'for next lesson'),
      notes: note(qs.length ? L('Ответы: ', 'Answers: ') + qs.map((q, i) => `${i + 1}) ${optText(q.options[q.correct], lang)}`).join('; ') : L('Проверьте устно в начале следующего урока.', 'Check orally next lesson.')),
    });
  }
  if (parts.has('reflection'))
    slides.push({
      k: 'reflection',
      title: L('Рефлексия', 'Reflection'),
      prompts: [L('Сегодня я узнал…', 'Today I learned…'), L('Было трудно…', 'It was hard to…'), L('Хочу спросить…', 'I want to ask…')],
      notes: note(L('Попросите поднять карточку цвета светофора или показать пальцами 1–3.', 'Ask for a traffic-light card or 1–3 fingers.')),
    });
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
  brand?: Branding;
  index: number;
  total: number;
}

const M = 0.75; // side margin

/** Wikipedia pictures take the title and the intro (the model, with its controls, has a slide of its own) */
function picks(c: { images: Images; style: DesignStyle }) {
  const ph = c.images.photos;
  // titles without a picture slot hand the first one to the intro
  const noPhoto = ['center', 'frame', 'minimal'].includes(c.style.title);
  return noPhoto ? { title: null, intro: ph[0] ?? null } : { title: ph[0] ?? null, intro: ph[1] ?? null };
}
const one = (text: string): Run[] => [{ text }];
/** labels drawn by the layout follow the deck language, read from the first Cyrillic letter in its name */
const L0 = (c: { deck: string }, ru: string, en: string) => (/[а-яё]/i.test(c.deck) || !c.deck ? ru : en);

export function layoutSlide(sl: Slide, c: LayoutCtx): { bg: string; prims: Prim[] } {
  const { theme: T, accent: A, style: S } = c;
  const P: Prim[] = [];
  const k = S.scale === 'large' ? 1.1 : S.scale === 'compact' ? 0.9 : 1;
  const headBold = FONT_PAIRS[S.fonts].headBold;
  // body and heading sizes follow the chosen text size; small labels and huge numerals stay put
  const text = (x: number, y: number, w: number, h: number, runs: Run[] | string, size: number, color: string, font: keyof typeof FONTS = 'body', extra: Partial<Extract<Prim, { t: 'text' }>> = {}) =>
    P.push({ t: 'text', x, y, w, h, runs: typeof runs === 'string' ? one(runs) : runs, size: size >= 15 && size <= 60 ? Math.round(size * k) : size, color, font, bold: font === 'head' && headBold ? true : undefined, ...extra });
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra: Partial<Extract<Prim, { t: 'rect' }>> = {}) => P.push({ t: 'rect', x, y, w, h, fill, ...extra, ...(S.corners === 'sharp' ? { r: undefined } : {}) });
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
  /** the label and heading at the top of a content slide, in the template's style; an empty title draws only the label */
  const HD = S.header ?? 'kicker';
  const head = (label: string, title: string, size = 36) => {
    if (HD === 'band') {
      rect(0, 0, SLIDE_W, title ? 1.9 : 1.0, A);
      text(M, title ? 0.42 : 0.35, 9, 0.3, label.toUpperCase(), 11, ON, 'body', { bold: true, spacing: 2, alpha: 0.85 });
      if (title) text(M, 0.78, SLIDE_W - 2 * M, 0.95, title, size - 2, ON, 'head', { valign: 'middle' });
      return;
    }
    if (HD === 'underline') {
      text(M, 0.45, 9, 0.3, label.toUpperCase(), 11, T.muted, 'body', { bold: true, spacing: 2 });
      if (title) {
        text(M, 0.85, SLIDE_W - 2 * M, 0.95, title, size, T.ink, 'head', { valign: 'middle' });
        rect(M, 1.9, SLIDE_W - 2 * M, 0.035, A);
      } else rect(M, 0.9, SLIDE_W - 2 * M, 0.03, A);
      return;
    }
    if (HD === 'side') {
      rect(0, 0, 0.3, SLIDE_H, A);
      kicker(label, M + 0.1);
      if (title) text(M + 0.1, 1.2, SLIDE_W - 2 * M - 0.1, 0.9, title, size, T.ink, 'head');
      return;
    }
    kicker(label);
    if (title) text(M, 1.2, SLIDE_W - 2 * M, 0.9, title, size, T.ink, 'head');
  };
  const B = c.brand ?? {};
  const pageNo = () => {
    if (S.footer === 'none') return;
    text(SLIDE_W - M - 1.5, SLIDE_H - 0.55, 1.5, 0.3, `${String(c.index + 1).padStart(2, '0')} / ${String(c.total).padStart(2, '0')}`, 10, T.muted, 'body', { align: 'right', spacing: 1 });
    // the school logo sits next to the page number on every slide
    if (B.logo) P.push({ t: 'img', ...fit(B.logo, SLIDE_W - M - 2.4, SLIDE_H - 0.68, 0.75, 0.48), data: B.logo.data });
  };
  const footer = (left = c.deck) => {
    if (S.footer === 'full' || S.footer === undefined) text(M, SLIDE_H - 0.55, 9, 0.3, [left, B.school, B.klass].filter(Boolean).join(' · '), 10, T.muted, 'body');
    pageNo();
  };
  const icon = (name: IconName) => (S.icons === false ? undefined : c.images.icons[name]);
  /** title-slide line with the teacher, class, school and date */
  const credits = [B.teacher && `${L0(c, 'Учитель', 'Teacher')}: ${B.teacher}`, B.klass, B.school, B.date].filter(Boolean).join(' · ');
  let bg = T.bg;

  // background pattern on the content slides, drawn first so everything sits on top
  if (sl.k !== 'title' && sl.k !== 'end' && sl.k !== 'divider') {
    if (S.decor === 'dots') for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) ellipse(SLIDE_W - 3.0 + i * 0.32, (S.header === 'band' ? SLIDE_H - 1.75 : 0.4) + j * 0.32, 0.07, 0.07, A, 0.4);
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

  // the title slide gets the teacher line and the logo whatever its layout
  switch (sl.k) {
    case 'title': {
      bg = T.heroBg;
      const titleExtras = (x: number, y: number, w: number, color: string, align: 'left' | 'center' = 'left') => {
        if (credits) text(x, y, w, 0.35, credits, 12, color, 'body', { align });
        if (B.logo) P.push({ t: 'img', ...fit(B.logo, align === 'center' ? SLIDE_W / 2 - 0.6 : x, 0.4, 1.2, 0.8), data: B.logo.data });
      };
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
        if (sl.subtitle) text(2.2, 5.05, SLIDE_W - 4.4, 1.2, sl.subtitle, 17, T.heroMuted, 'body', { align: 'center', valign: 'top', lh: 1.1 });
        titleExtras(M, SLIDE_H - 0.75, SLIDE_W - 2 * M, T.heroMuted, 'center');
        break;
      }
      if (S.title === 'band') {
        const top = 2.25;
        const bh = 2.9;
        rect(0, top, SLIDE_W, bh, heroOnAccent ? T.heroInk : A);
        const onBand = heroOnAccent ? T.heroBg : ON;
        const bw = photo ? SLIDE_W - 5.0 - M : SLIDE_W - 2 * M;
        text(M, 1.55, 9, 0.35, sl.label.toUpperCase(), 12, heroA, 'body', { bold: true, spacing: 3 });
        text(M, top, bw, bh, sl.title, tsz + 2, onBand, 'head', { valign: 'middle', lh: 0.95 });
        if (photo) {
          rect(SLIDE_W - 4.6, 1.2, 4.0, 5.0, 'FFFFFF', { r: 0.12 });
          if (photo.photo) P.push({ t: 'img', x: SLIDE_W - 4.45, y: 1.35, w: 3.7, h: 4.7, data: photo.data, cover: true });
          else P.push({ t: 'img', ...fit(photo, SLIDE_W - 4.45, 1.35, 3.7, 4.7), data: photo.data });
          if (photo.credit) text(SLIDE_W - 4.6, 6.3, 4.0, 0.3, photo.credit, 7, T.heroMuted, 'body');
        }
        if (sl.subtitle) text(M, top + bh + 0.3, bw, 1.0, sl.subtitle, 16, T.heroMuted, 'body', { valign: 'top', lh: 1.1 });
        titleExtras(M, SLIDE_H - 0.6, bw, T.heroMuted);
        break;
      }
      if (S.title === 'frame') {
        rect(0.45, 0.45, SLIDE_W - 0.9, SLIDE_H - 0.9, T.heroBg, { alpha: 0, line: heroA });
        for (const [x, y] of [[0.3, 0.3], [SLIDE_W - 0.6, 0.3], [0.3, SLIDE_H - 0.6], [SLIDE_W - 0.6, SLIDE_H - 0.6]] as [number, number][]) rect(x, y, 0.3, 0.3, heroA);
        text(M + 0.5, 1.9, SLIDE_W - 2 * M - 1, 0.35, sl.label.toUpperCase(), 12, heroA, 'body', { bold: true, spacing: 4, align: 'center' });
        text(1.4, 2.35, SLIDE_W - 2.8, 2.3, sl.title, tsz + 4, T.heroInk, 'head', { align: 'center', valign: 'middle', lh: 0.95 });
        rect(SLIDE_W / 2 - 1.2, 4.85, 2.4, 0.03, heroA);
        if (sl.subtitle) text(2.2, 5.05, SLIDE_W - 4.4, 1.0, sl.subtitle, 15, T.heroMuted, 'body', { align: 'center', valign: 'top', lh: 1.1 });
        titleExtras(M + 0.5, SLIDE_H - 1.15, SLIDE_W - 2 * M - 1, T.heroMuted, 'center');
        break;
      }
      if (S.title === 'minimal') {
        text(M, 0.65, 8, 0.35, sl.label.toUpperCase(), 12, heroA, 'body', { bold: true, spacing: 3 });
        text(SLIDE_W - M - 2.2, 0.35, 2.2, 1.4, String(sl.grade), 64, heroA, 'head', { align: 'right', alpha: 0.6 });
        rect(M, 3.35, SLIDE_W - 2 * M, 0.025, T.heroInk, { alpha: 0.6 });
        text(M, 3.55, SLIDE_W - 2 * M, 2.4, sl.title, tsz + 10, T.heroInk, 'head', { valign: 'top', lh: 0.95 });
        if (sl.subtitle) text(M, 6.0, 9, 0.8, sl.subtitle, 14, T.heroMuted, 'body', { valign: 'top' });
        titleExtras(M, 1.15, 9, T.heroMuted);
        break;
      }
      if (S.title === 'magazine') {
        const ph = 4.0;
        if (photo?.photo) P.push({ t: 'img', x: 0, y: 0, w: SLIDE_W, h: ph, data: photo.data, cover: true });
        else {
          rect(0, 0, SLIDE_W, ph, heroOnAccent ? T.heroInk : A);
          text(SLIDE_W - 6.5, -0.4, 6.0, ph + 0.4, String(sl.grade), 260, heroOnAccent ? T.heroBg : ON, 'head', { align: 'right', valign: 'middle', alpha: 0.25 });
          if (photo) {
            rect(M, 0.45, 4.6, 3.1, 'FFFFFF', { r: 0.1 });
            P.push({ t: 'img', ...fit(photo, M + 0.15, 0.6, 4.3, 2.8), data: photo.data });
          }
        }
        if (photo?.credit) text(SLIDE_W - 5.2, ph + 0.05, 4.5, 0.25, photo.credit, 7, T.heroMuted, 'body', { align: 'right' });
        text(M, ph + 0.35, 4, 0.35, sl.label.toUpperCase(), 12, heroA, 'body', { bold: true, spacing: 3 });
        text(M, ph + 0.7, 7.9, 2.2, sl.title, tsz, T.heroInk, 'head', { valign: 'top', lh: 0.95 });
        rect(8.95, ph + 0.45, 0.03, 2.4, heroA);
        if (sl.subtitle) text(9.25, ph + 0.4, SLIDE_W - 9.25 - M, 2.5, sl.subtitle, 13, T.heroMuted, 'body', { valign: 'top', lh: 1.15 });
        titleExtras(M, SLIDE_H - 0.45, 8, T.heroMuted);
        break;
      }
      if (S.title === 'blocks') {
        // a mosaic of squares in the accent colour, the picture taking the big one
        const x0 = 7.4;
        const cell = 1.95;
        const alphas = [1, 0.55, 0.3, 0.75, 0.15, 0.9, 0.45, 0.2, 0.65];
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++) rect(x0 + i * (cell + 0.08), 0.6 + j * (cell + 0.08), cell, cell, heroOnAccent ? 'FFFFFF' : A, { alpha: heroOnAccent ? alphas[i * 3 + j] * 0.35 : alphas[i * 3 + j], r: 0.12 });
        if (photo) {
          const big = 2 * cell + 0.08;
          rect(x0 + cell + 0.08, 0.6, big, big, 'FFFFFF', { r: 0.12 });
          if (photo.photo) P.push({ t: 'img', x: x0 + cell + 0.08, y: 0.6, w: big, h: big, data: photo.data, cover: true });
          else P.push({ t: 'img', ...fit(photo, x0 + cell + 0.2, 0.72, big - 0.24, big - 0.24), data: photo.data });
        } else text(x0 + cell + 0.08, 0.6, 2 * cell + 0.08, 2 * cell + 0.08, String(sl.grade), 140, heroOnAccent ? T.heroInk : ON, 'head', { align: 'center', valign: 'middle' });
        kicker(sl.label, M, 1.55, heroA);
        text(M, 2.25, x0 - M - 0.5, 3.0, sl.title, tsz, T.heroInk, 'head', { valign: 'top', lh: 0.95 });
        if (sl.subtitle) text(M, 5.35, x0 - M - 0.6, 1.3, sl.subtitle, 15, T.heroMuted, 'body', { valign: 'top', lh: 1.1 });
        titleExtras(M, SLIDE_H - 0.6, x0 - M - 0.5, T.heroMuted);
        break;
      }
      if (S.title === 'split-left') {
        const pw = 5.2;
        if (photo) {
          if (photo.photo) P.push({ t: 'img', x: 0, y: 0, w: pw, h: SLIDE_H, data: photo.data, cover: true });
          else {
            rect(0, 0, pw, SLIDE_H, 'FFFFFF');
            P.push({ t: 'img', ...fit(photo, 0.4, 0.5, pw - 0.8, SLIDE_H - 1.3), data: photo.data });
          }
          if (photo.credit) {
            rect(0, SLIDE_H - 0.42, pw, 0.42, '000000', { alpha: 0.45 });
            text(0.2, SLIDE_H - 0.38, pw - 0.4, 0.34, photo.credit, 8, 'FFFFFF', 'body', { valign: 'middle' });
          }
          rect(pw, 0, 0.12, SLIDE_H, A);
        } else {
          rect(0, 0, pw, SLIDE_H, heroOnAccent ? 'FFFFFF' : A, { alpha: heroOnAccent ? 0.14 : 1 });
          ellipse(-2, -1.5, 5, 5, 'FFFFFF', 0.12);
          text(0, 1.6, pw, 3.2, String(sl.grade), 190, heroOnAccent ? T.heroInk : ON, 'head', { align: 'center', valign: 'middle' });
        }
        const tx = pw + 0.8;
        kicker(sl.label, tx, 1.55, heroA);
        text(tx, 2.25, SLIDE_W - tx - M, 3.0, sl.title, tsz, T.heroInk, 'head', { valign: 'top', lh: 0.95 });
        if (sl.subtitle) text(tx, 5.35, SLIDE_W - tx - M, 1.3, sl.subtitle, 15, T.heroMuted, 'body', { valign: 'top', lh: 1.1 });
        titleExtras(tx, SLIDE_H - 0.8, SLIDE_W - tx - M, T.heroMuted);
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
        if (photo?.credit) text(M, SLIDE_H - 0.4, 9, 0.3, photo.credit, 8, overlay ? 'FFFFFF' : T.heroMuted, 'body', { alpha: 0.8 });
        titleExtras(M, 2.45, 7.4, overlay ? 'FFFFFF' : T.heroMuted);
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
        if (photo.credit) {
          rect(px, SLIDE_H - 0.42, pw, 0.42, '000000', { alpha: 0.45 });
          text(px + 0.2, SLIDE_H - 0.38, pw - 0.4, 0.34, photo.credit, 8, 'FFFFFF', 'body', { valign: 'middle' });
        }
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
      titleExtras(M, SLIDE_H - 0.8, px - M - 0.7, sub);
      break;
    }
    case 'agenda': {
      head(c.deck, sl.title);
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
      const dic = icon(sl.icon);
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
        if (photo.credit) {
          rect(px, SLIDE_H - 0.42, pw, 0.42, '000000', { alpha: 0.45 });
          text(px + 0.2, SLIDE_H - 0.38, pw - 0.4, 0.34, photo.credit, 8, 'FFFFFF', 'body', { valign: 'middle' });
        }
        kicker(sl.label);
        text(M, 1.3, px - M - 0.5, 0.9, sl.title, 34, T.ink, 'head');
        rect(M, 2.45, 0.06, 3.7, A, { alpha: 0.6 });
        text(M + 0.4, 2.3, px - M - 1.0, 4.0, sl.text, pick(sl.text.length, [[110, 28], [200, 24], [330, 21], [480, 18]], 16), T.ink, 'head', { valign: 'middle', lh: 1.15 });
        text(M, SLIDE_H - 0.55, 5, 0.3, c.deck, 10, T.muted, 'body');
        break;
      }
      const IL = S.intro ?? 'quote';
      const tsz2 = pick(sl.text.length, [[110, 32], [200, 28], [330, 24], [480, 21]], 18);
      if (IL === 'card') {
        head(sl.label, sl.title);
        rect(M, 2.35, SLIDE_W - 2 * M, 4.1, T.card, { r: 0.18 });
        rect(M, 2.35, 0.1, 4.1, A);
        text(M + 0.6, 2.35, SLIDE_W - 2 * M - 1.1, 4.1, sl.text, tsz2, T.ink, 'head', { valign: 'middle', lh: 1.15 });
        footer();
        break;
      }
      if (IL === 'centered') {
        text(M, 0.6, SLIDE_W - 2 * M, 0.3, sl.label.toUpperCase(), 11, A, 'body', { bold: true, spacing: 2, align: 'center' });
        text(M, 1.0, SLIDE_W - 2 * M, 0.8, sl.title, 30, T.muted, 'head', { align: 'center' });
        rect(SLIDE_W / 2 - 0.4, 1.95, 0.8, 0.05, A);
        text(1.4, 2.3, SLIDE_W - 2.8, 4.0, sl.text, tsz2 + 2, T.ink, 'head', { align: 'center', valign: 'middle', lh: 1.15 });
        footer();
        break;
      }
      if (IL === 'band') {
        head(sl.label, sl.title);
        rect(0, 2.45, SLIDE_W, 3.7, A);
        text(M, 2.45, SLIDE_W - 2 * M, 3.7, sl.text, tsz2, ON, 'head', { valign: 'middle', lh: 1.15 });
        footer();
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
      const PL = S.point ?? 'panel';
      const bodySz = pick(sl.text.length, [[80, 34], [150, 30], [260, 26], [400, 22], [560, 19]], 17);
      const titleSz = pick(sl.title.length, [[18, 36], [34, 30], [56, 25]], 21);
      const num = String(sl.n).padStart(2, '0');
      const dots = (x: number, y: number) => {
        for (let i = 0; i < Math.min(sl.total, 12); i++) ellipse(x + i * 0.28, y, 0.13, 0.13, A, i === sl.n - 1 ? 1 : 0.28);
      };
      if (PL === 'panel-right') {
        const pw = 4.7;
        const px = SLIDE_W - pw;
        rect(px, 0, pw, SLIDE_H, T.panel);
        kicker(sl.label, px + 0.55, 0.55);
        text(px + 0.55, 1.3, pw - 1, 1.9, num, 110, A, 'head', { valign: 'top', lh: 0.9 });
        text(px + 0.55, 3.35, pw - 0.9, 1.5, sl.title, titleSz, T.ink, 'head', { valign: 'top', lh: 1.0 });
        const ic = icon(sl.icon);
        if (ic) P.push({ t: 'img', x: SLIDE_W - 2.4, y: 4.9, w: 2.7, h: 2.7, data: ic.data, alpha: T.dark ? 0.55 : 0.4 });
        dots(px + 0.55, 6.55);
        text(px + 0.55, 6.8, pw - 1, 0.3, sl.of, 10, T.muted, 'body');
        text(M, 0.9, px - M - 0.85, 5.6, sl.text, bodySz, T.ink, 'body', { valign: 'middle', lh: 1.25 });
        text(M, SLIDE_H - 0.55, 1.5, 0.3, `${String(c.index + 1).padStart(2, '0')} / ${String(c.total).padStart(2, '0')}`, 10, T.muted, 'body', { spacing: 1 });
        break;
      }
      if (PL === 'band') {
        rect(0, 0, SLIDE_W, 2.45, A);
        text(M, 0.35, 9, 0.3, sl.label.toUpperCase(), 11, ON, 'body', { bold: true, spacing: 2, alpha: 0.85 });
        text(M, 0.7, 2.0, 1.5, num, 80, ON, 'head', { valign: 'middle' });
        text(M + 2.2, 0.7, SLIDE_W - 2 * M - 2.2, 1.5, sl.title, titleSz, ON, 'head', { valign: 'middle', lh: 1.0 });
        const ic = icon(sl.icon);
        if (ic) P.push({ t: 'img', x: SLIDE_W - M - 2.4, y: 3.4, w: 2.4, h: 2.4, data: ic.data, alpha: 0.85 });
        text(M, 2.9, SLIDE_W - 2 * M - (ic ? 3.0 : 0), 3.6, sl.text, bodySz, T.ink, 'body', { valign: 'middle', lh: 1.25 });
        dots(M, 6.75);
        pageNo();
        break;
      }
      if (PL === 'card') {
        rect(1.2, 0.8, SLIDE_W - 2.4, 5.75, T.card, { r: 0.3 });
        ellipse(0.8, 0.45, 1.1, 1.1, A);
        text(0.8, 0.45, 1.1, 1.1, String(sl.n), 30, ON, 'head', { align: 'center', valign: 'middle' });
        text(2.2, 1.0, 8, 0.3, sl.label.toUpperCase(), 11, A, 'body', { bold: true, spacing: 2 });
        text(2.2, 1.35, SLIDE_W - 5.5, 1.2, sl.title, titleSz, T.ink, 'head', { valign: 'middle', lh: 1.0 });
        const ic = icon(sl.icon);
        if (ic) P.push({ t: 'img', x: SLIDE_W - 3.0, y: 1.05, w: 1.4, h: 1.4, data: ic.data });
        rect(2.2, 2.75, 1.0, 0.05, A);
        text(2.2, 2.95, SLIDE_W - 4.4, 3.35, sl.text, bodySz - 2, T.ink, 'body', { valign: 'top', lh: 1.25 });
        dots(SLIDE_W / 2 - Math.min(sl.total, 12) * 0.14, 6.85);
        pageNo();
        break;
      }
      if (PL === 'big-number') {
        text(SLIDE_W - 6.2, -0.6, 6.0, 7.0, num, 330, A, 'head', { align: 'right', valign: 'middle', alpha: T.dark ? 0.16 : 0.1 });
        kicker(`${sl.label} · ${sl.of}`);
        text(M, 1.25, SLIDE_W - 2 * M - 2, 1.3, sl.title, titleSz + 6, T.ink, 'head', { valign: 'top', lh: 1.0 });
        const ic = icon(sl.icon);
        if (ic) P.push({ t: 'img', x: M, y: 2.75, w: 0.75, h: 0.75, data: ic.data });
        text(M + (ic ? 1.05 : 0), 2.7, 8.6, 3.8, sl.text, bodySz - 2, T.ink, 'body', { valign: 'top', lh: 1.3 });
        pageNo();
        break;
      }
      if (PL === 'steps') {
        // the steps of the topic as a row of numbered stops
        const nn = Math.min(sl.total, 8);
        const span = Math.min(SLIDE_W - 2 * M, nn * 1.6);
        const gap = nn > 1 ? span / (nn - 1) : 0;
        if (nn > 1) rect(M + 0.25, 0.83, span - 0.0, 0.04, A, { alpha: 0.35 });
        for (let i = 0; i < nn; i++) {
          const x = M + i * gap;
          const on = i === sl.n - 1;
          P.push({ t: 'ellipse', x, y: 0.6, w: 0.5, h: 0.5, fill: on || i < sl.n - 1 ? A : T.bg, alpha: 1, line: A, lineAlpha: 1 });
          text(x, 0.6, 0.5, 0.5, String(i + 1), 13, on || i < sl.n - 1 ? ON : A, 'body', { align: 'center', valign: 'middle', bold: true });
        }
        text(M, 1.5, SLIDE_W - 2 * M, 1.0, sl.title, titleSz + 2, T.ink, 'head', { valign: 'middle' });
        rect(M, 2.6, 1.2, 0.05, A);
        const ic = icon(sl.icon);
        if (ic) {
          rect(SLIDE_W - M - 3.0, 3.0, 3.0, 3.0, T.card, { r: 0.2 });
          P.push({ t: 'img', x: SLIDE_W - M - 2.55, y: 3.45, w: 2.1, h: 2.1, data: ic.data });
        }
        text(M, 2.95, SLIDE_W - 2 * M - (ic ? 3.5 : 0), 3.6, sl.text, bodySz - 2, T.ink, 'body', { valign: 'middle', lh: 1.25 });
        footer(sl.of);
        break;
      }
      const pw = 4.7;
      rect(0, 0, pw, SLIDE_H, T.panel);
      kicker(sl.label, M, 0.55);
      text(M, 1.3, pw - M - 0.3, 1.9, String(sl.n).padStart(2, '0'), 110, A, 'head', { valign: 'top', lh: 0.9 });
      text(M, 3.35, pw - M - 0.35, 1.5, sl.title, pick(sl.title.length, [[18, 36], [34, 30], [56, 25]], 21), T.ink, 'head', { valign: 'top', lh: 1.0 });
      const ic = icon(sl.icon);
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
      pageNo();
      break;
    }
    case 'formula': {
      head(sl.label, sl.title);
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
      head(sl.label, sl.title);
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
      head(sl.label, sl.title);
      const SL = S.summary ?? 'cards';
      if (SL === 'list') {
        const nn = sl.items.length;
        const rh = Math.min(1.15, 4.4 / nn);
        sl.items.forEach((it, i) => {
          const y = 2.3 + i * rh;
          text(M, y, 1.0, rh, String(i + 1).padStart(2, '0'), nn > 4 ? 22 : 30, A, 'head', { valign: 'middle' });
          text(M + 1.2, y, SLIDE_W - 2 * M - 1.2, rh, [{ text: it.title + '  ', bold: true }, { text: it.text, color: T.muted }], nn > 4 ? 13 : 16, T.ink, 'body', { valign: 'middle', lh: 1.05 });
          if (i < nn - 1) rect(M + 1.2, y + rh - 0.02, SLIDE_W - 2 * M - 1.2, 0.015, T.muted, { alpha: 0.3 });
        });
        footer();
        break;
      }
      if (SL === 'timeline') {
        const nn = sl.items.length;
        const span = SLIDE_W - 2 * M - 1.0;
        const gap = nn > 1 ? span / (nn - 1) : 0;
        const ly = 3.7;
        rect(M + 0.5, ly - 0.02, span, 0.05, A, { alpha: 0.5 });
        sl.items.forEach((it, i) => {
          const cx = M + 0.5 + i * gap;
          const up = i % 2 === 0;
          const w = Math.min(3.0, Math.max(1.6, gap - 0.1));
          ellipse(cx - 0.3, ly - 0.3, 0.6, 0.6, A);
          text(cx - 0.3, ly - 0.3, 0.6, 0.6, String(i + 1), 14, ON, 'body', { align: 'center', valign: 'middle', bold: true });
          // captions stay inside the slide even for the first and last stop
          const lx = Math.max(0.35, Math.min(SLIDE_W - 0.35 - w, cx - w / 2));
          text(lx, up ? 2.15 : 4.2, w, up ? 1.35 : 0.45, it.title, nn > 5 ? 12 : 15, T.ink, 'body', { align: 'center', valign: up ? 'bottom' : 'top', bold: true });
          text(lx, up ? 4.2 : 4.7, w, 1.9, it.text, nn > 5 ? 10 : 12, T.muted, 'body', { align: 'center', valign: 'top', lh: 1.05 });
        });
        footer();
        break;
      }
      if (SL === 'columns') {
        const nn = sl.items.length;
        const cols = Math.min(nn, 4);
        const rows = Math.ceil(nn / cols);
        const cw = (SLIDE_W - 2 * M - (cols - 1) * 0.35) / cols;
        const rhh = (SLIDE_H - 3.1) / rows;
        sl.items.forEach((it, i) => {
          const x = M + (i % cols) * (cw + 0.35);
          const y = 2.3 + Math.floor(i / cols) * rhh;
          const d = rows > 1 ? 0.7 : 1.1;
          ellipse(x + cw / 2 - d / 2, y, d, d, A, 0.15);
          const ic = icon(it.icon);
          if (ic) P.push({ t: 'img', x: x + cw / 2 - d * 0.3, y: y + d * 0.2, w: d * 0.6, h: d * 0.6, data: ic.data });
          else text(x + cw / 2 - d / 2, y, d, d, String(i + 1), 18, A, 'head', { align: 'center', valign: 'middle' });
          text(x, y + d + 0.15, cw, 0.5, it.title, rows > 1 ? 14 : 18, T.ink, 'body', { align: 'center', bold: true, valign: 'top' });
          text(x + 0.1, y + d + 0.7, cw - 0.2, rhh - d - 0.8, it.text, rows > 1 ? 12 : 15, T.muted, 'body', { align: 'center', valign: 'top', lh: 1.1 });
        });
        footer();
        break;
      }
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
        const ic = icon(it.icon);
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
      head(sl.label, '');
      const qy = HD === 'band' ? 1.25 : 1.15;
      const QL = S.quiz ?? 'grid';
      if (QL === 'list') {
        text(M, qy, SLIDE_W - 2 * M, 1.9, sl.q, pick(sl.q.length, [[70, 30], [130, 25], [220, 21]], 18), T.ink, 'head', { valign: 'middle', lh: 1.05 });
        const rh = Math.min(0.85, 3.4 / sl.options.length);
        sl.options.forEach((o, i) => {
          const y = 3.25 + i * (rh + 0.12);
          rect(M, y, SLIDE_W - 2 * M, rh, T.card, { r: 0.12 });
          rect(M, y, 0.09, rh, A);
          text(M + 0.35, y, 0.6, rh, 'ABCD'[i], 20, A, 'head', { valign: 'middle', bold: true });
          text(M + 1.0, y, SLIDE_W - 2 * M - 1.3, rh, o, pick(o.length, [[50, 18], [100, 15]], 13), T.ink, 'body', { valign: 'middle' });
        });
        footer();
        break;
      }
      if (QL === 'tiles') {
        text(M, qy, SLIDE_W - 2 * M, 1.9, sl.q, pick(sl.q.length, [[70, 30], [130, 25], [220, 21]], 18), T.ink, 'head', { valign: 'middle', lh: 1.05, align: 'center' });
        const nn = sl.options.length;
        const gap = 0.25;
        const tw = (SLIDE_W - 2 * M - (nn - 1) * gap) / nn;
        sl.options.forEach((o, i) => {
          const x = M + i * (tw + gap);
          rect(x, 3.35, tw, 3.1, T.card, { r: 0.16 });
          rect(x, 3.35, tw, 0.9, A, { r: 0.16 });
          text(x, 3.35, tw, 0.9, 'ABCD'[i], 30, ON, 'head', { align: 'center', valign: 'middle' });
          text(x + 0.2, 4.35, tw - 0.4, 2.0, o, pick(o.length, [[30, 18], [70, 15]], 12), T.ink, 'body', { align: 'center', valign: 'middle', lh: 1.05 });
        });
        footer();
        break;
      }
      text(M, qy, SLIDE_W - 2 * M, 2.0, sl.q, pick(sl.q.length, [[70, 32], [130, 27], [220, 23]], 20), T.ink, 'head', { valign: 'middle', lh: 1.05 });
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
      head(c.deck, sl.title);
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
    case 'goals': {
      head(c.deck, sl.title);
      const colW = (SLIDE_W - 2 * M - 0.4) / 2;
      ([[L0(c, 'Узнаем', 'We will learn'), sl.know], [L0(c, 'Научимся', 'We will be able to'), sl.can]] as [string, string[]][]).forEach(([h, items], i) => {
        const x = M + i * (colW + 0.4);
        rect(x, 2.3, colW, 4.3, T.card, { r: 0.16 });
        rect(x, 2.3, colW, 0.08, A);
        text(x + 0.4, 2.6, colW - 0.8, 0.5, h, 22, A, 'head');
        text(x + 0.4, 3.25, colW - 0.8, 3.2, items.map((t, j) => ({ text: `${j + 1}. ${t}`, br: true })), pick(items.join('').length, [[120, 20], [220, 17]], 15), T.ink, 'body', { valign: 'top', lh: 1.1, para: 8 });
      });
      footer();
      break;
    }
    case 'warmup': {
      head(L0(c, 'Повторение', 'Review'), sl.title, pick(sl.title.length, [[40, 34], [70, 28]], 24));
      sl.items.forEach((q, i) => {
        const y = 2.35 + i * 1.45;
        rect(M, y, SLIDE_W - 2 * M, 1.25, T.card, { r: 0.14 });
        ellipse(M + 0.3, y + 0.32, 0.6, 0.6, A);
        text(M + 0.3, y + 0.32, 0.6, 0.6, String(i + 1), 18, ON, 'head', { align: 'center', valign: 'middle' });
        text(M + 1.15, y, SLIDE_W - 2 * M - 1.4, 1.25, q, pick(q.length, [[110, 17], [200, 15]], 13), T.ink, 'body', { valign: 'middle', lh: 1.05 });
      });
      footer();
      break;
    }
    case 'terms': {
      head(c.deck, sl.title);
      const n2 = sl.items.length;
      const rh = Math.min(1.25, 4.6 / Math.max(1, n2));
      sl.items.forEach((it, i) => {
        const y = 2.3 + i * rh;
        rect(M, y + rh - 0.02, SLIDE_W - 2 * M, 0.015, T.muted, { alpha: 0.3 });
        text(M, y, 3.6, rh, it.term, n2 > 4 ? 17 : 20, A, 'head', { valign: 'middle', bold: true });
        text(M + 3.9, y, SLIDE_W - 2 * M - 3.9, rh, it.text, n2 > 4 ? 14 : 17, T.ink, 'body', { valign: 'middle', lh: 1.05 });
      });
      footer();
      break;
    }
    case 'example': {
      head(c.deck, sl.title, 34);
      rect(M, 2.1, SLIDE_W - 2 * M, 1.35, T.card, { r: 0.14 });
      rect(M, 2.1, 0.09, 1.35, A);
      text(M + 0.4, 2.1, SLIDE_W - 2 * M - 0.7, 1.35, sl.problem, pick(sl.problem.length, [[90, 22], [170, 19]], 16), T.ink, 'head', { valign: 'middle', lh: 1.05 });
      text(M, 3.7, 3, 0.35, L0(c, 'РЕШЕНИЕ', 'SOLUTION'), 11, A, 'body', { bold: true, spacing: 2 });
      text(M, 4.05, SLIDE_W - 2 * M - 3.4, 2.6, sl.steps.map((t, i) => ({ text: `${i + 1}) ${t}`, br: true })), pick(sl.steps.join('').length, [[140, 18], [260, 15]], 13), T.ink, 'body', { valign: 'top', lh: 1.1, para: 6 });
      rect(SLIDE_W - M - 3.0, 4.05, 3.0, 1.6, A, { r: 0.14 });
      text(SLIDE_W - M - 3.0, 4.15, 3.0, 0.4, L0(c, 'Ответ', 'Answer'), 13, ON, 'body', { align: 'center', bold: true });
      text(SLIDE_W - M - 3.0, 4.5, 3.0, 1.0, sl.answer, pick(sl.answer.length, [[10, 28], [24, 20]], 15), ON, 'head', { align: 'center', valign: 'middle' });
      footer();
      break;
    }
    case 'homework': {
      head(L0(c, 'Задание на дом', 'Homework'), sl.title);
      rect(SLIDE_W - M - 2.6, HD === 'band' ? 0.25 : 1.3, 2.6, 0.55, HD === 'band' ? ON : A, { r: 0.27 });
      text(SLIDE_W - M - 2.6, HD === 'band' ? 0.25 : 1.3, 2.6, 0.55, sl.due, 13, HD === 'band' ? A : ON, 'body', { align: 'center', valign: 'middle', bold: true });
      sl.items.forEach((t, i) => {
        const y = 2.35 + i * 1.12;
        text(M, y, 0.8, 0.9, String(i + 1).padStart(2, '0'), 26, A, 'head', { valign: 'middle' });
        text(M + 0.95, y, SLIDE_W - 2 * M - 0.95, 0.9, t, pick(t.length, [[90, 18], [170, 15]], 13), T.ink, 'body', { valign: 'middle', lh: 1.05 });
        if (i < sl.items.length - 1) rect(M + 0.95, y + 1.0, SLIDE_W - 2 * M - 0.95, 0.015, T.muted, { alpha: 0.3 });
      });
      footer();
      break;
    }
    case 'reflection': {
      head(c.deck, sl.title);
      const cards: [string, string][] = [
        ['30A46C', L0(c, 'Понял и могу объяснить', 'I get it and can explain it')],
        ['F5A524', L0(c, 'Понял, но есть вопросы', 'I get it, with questions')],
        ['E5484D', L0(c, 'Нужно ещё разобраться', 'I need more practice')],
      ];
      const cw = (SLIDE_W - 2 * M - 0.6) / 3;
      cards.forEach(([col, t], i) => {
        const x = M + i * (cw + 0.3);
        rect(x, 2.25, cw, 2.0, T.card, { r: 0.16 });
        ellipse(x + cw / 2 - 0.42, 2.45, 0.84, 0.84, col);
        text(x + 0.2, 3.4, cw - 0.4, 0.75, t, 16, T.ink, 'body', { align: 'center', valign: 'middle', bold: true });
      });
      sl.prompts.forEach((t, i) => {
        const y = 4.6 + i * 0.62;
        text(M, y, 4.2, 0.5, t, 18, T.ink, 'head', { valign: 'middle' });
        rect(M + 4.3, y + 0.42, SLIDE_W - 2 * M - 4.3, 0.02, T.muted, { alpha: 0.5 });
      });
      footer();
      break;
    }
    case 'end': {
      bg = T.heroBg;
      const EL = S.end ?? 'center';
      if (EL === 'split') {
        rect(0, 0, SLIDE_W * 0.42, SLIDE_H, A);
        text(0, 0.5, SLIDE_W * 0.42, 6.5, '?', 300, ON, 'head', { align: 'center', valign: 'middle', alpha: 0.9 });
        text(SLIDE_W * 0.42 + 0.8, 2.3, SLIDE_W * 0.58 - 1.6, 1.6, sl.title, 46, T.heroInk, 'head', { valign: 'middle' });
        rect(SLIDE_W * 0.42 + 0.8, 4.05, 1.0, 0.06, heroA);
        text(SLIDE_W * 0.42 + 0.8, 4.3, SLIDE_W * 0.58 - 1.6, 0.7, sl.subtitle, 24, heroA, 'body', { valign: 'middle' });
        break;
      }
      if (EL === 'band') {
        rect(0, 2.3, SLIDE_W, 2.9, A);
        text(M, 2.35, SLIDE_W - 2 * M, 1.8, sl.title, 52, ON, 'head', { align: 'center', valign: 'middle' });
        text(M, 4.1, SLIDE_W - 2 * M, 0.8, sl.subtitle, 22, ON, 'body', { align: 'center', valign: 'middle', alpha: 0.85 });
        break;
      }
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
export async function downloadPptx(slides: SlideWithNotes[], style: DesignStyle, theme: Theme, images: Images, name: string, deck: string, author?: string, brand?: Branding) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck;
  if (author) pptx.author = author;
  if (brand?.school) pptx.company = brand.school;
  const tr = (alpha?: number) => (alpha === undefined || alpha >= 1 ? 0 : Math.round((1 - alpha) * 100));

  slides.forEach((sl, index) => {
    const s = pptx.addSlide();
    const { bg, prims } = layoutSlide(sl, { style, theme, accent: theme.accent, images, deck, index, total: slides.length, brand });
    s.background = { color: bg };
    for (const p of prims) {
      if (p.t === 'rect') s.addShape(p.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, { x: p.x, y: p.y, w: p.w, h: p.h, fill: p.alpha === 0 ? { type: 'none' } : { color: p.fill, transparency: tr(p.alpha) }, line: p.line ? { color: p.line, width: 1.5 } : { type: 'none' }, rectRadius: p.r });
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
