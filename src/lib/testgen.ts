import { sectionsFor, TOPICS, type Topic } from '../data/curriculum';
import type { StemCategory } from '../types/stem';
import { problemQuestion, problemsForTopic } from './problems';
import { hashStr, questionsForTopic, rng, shuffle, type Question } from './quiz';

/* The test builder: printable tests in several variants, built from the textbook's own topics and calculation
   generators. Every setting lives in one object so a teacher can save it as a template. */

export type TaskKind = 'choice' | 'short' | 'long';
export type VariantMode = 'shuffle' | 'numbers' | 'different';

export interface TestSettings {
  subject: StemCategory;
  grade: number;
  sections: string[]; // section ids; empty = the whole grade
  count: number;
  kinds: Record<TaskKind, boolean>;
  /** share of calculation problems, 0–100 */
  calcShare: number;
  order: 'easy-first' | 'mixed';
  variants: number;
  variantMode: VariantMode;
  shuffleOptions: boolean;
  seed: number;
  // header
  title: string;
  subtitle: string;
  school: string;
  fields: { name: boolean; cls: boolean; date: boolean; variant: boolean; grade: boolean; extra: string };
  instructions: string;
  minutes: number;
  // scoring
  points: Record<TaskKind, number>;
  showPoints: boolean;
  scale: { on: boolean; five: number; four: number; three: number };
  // layout
  fontSize: 12 | 14 | 16;
  columns: 1 | 2;
  spacing: 'compact' | 'normal' | 'roomy';
  numbering: 'dot' | 'paren' | 'word';
  longLines: number;
  answerSheet: boolean;
  answerKey: boolean;
  solutions: boolean;
  newPagePerVariant: boolean;
  showTopics: boolean;
  accent: string;
}

export const DEFAULT_SETTINGS: TestSettings = {
  subject: 'physics',
  grade: 8,
  sections: [],
  count: 10,
  kinds: { choice: true, short: true, long: false },
  calcShare: 40,
  order: 'easy-first',
  variants: 2,
  variantMode: 'numbers',
  shuffleOptions: true,
  seed: 1,
  title: 'Контрольная работа',
  subtitle: '',
  school: '',
  fields: { name: true, cls: true, date: true, variant: true, grade: false, extra: '' },
  instructions: 'Выберите один верный ответ или запишите ответ в поле. В задачах с развёрнутым ответом запишите решение полностью.',
  minutes: 40,
  points: { choice: 1, short: 1, long: 2 },
  showPoints: true,
  scale: { on: true, five: 85, four: 65, three: 45 },
  fontSize: 14,
  columns: 1,
  spacing: 'normal',
  numbering: 'dot',
  longLines: 5,
  answerSheet: false,
  answerKey: true,
  solutions: false,
  newPagePerVariant: true,
  showTopics: false,
  accent: '#2F5BFF',
};

export interface Task {
  kind: TaskKind;
  q: Question;
  topic: Topic;
  points: number;
}
export interface Variant {
  n: number;
  tasks: Task[];
}

/** the topics a test draws from */
export function topicPool(s: TestSettings): Topic[] {
  const secs = sectionsFor(s.subject, s.grade).filter((x) => !s.sections.length || s.sections.includes(x.id));
  const ids = new Set(secs.flatMap((x) => x.topics.map((t) => t.id)));
  return TOPICS.filter((t) => ids.has(t.id) && t.points.length >= 2);
}

/** what kind each slot is: calculations first get the 'short'/'long' kinds, the rest are choice questions */
function plan(s: TestSettings, rand: () => number, pool: Topic[]): { topic: Topic; calc: boolean; kind: TaskKind }[] {
  const kinds = (Object.keys(s.kinds) as TaskKind[]).filter((k) => s.kinds[k]);
  if (!kinds.length) kinds.push('choice');
  const withCalc = pool.filter((t) => problemsForTopic(t.id).length);
  const calcCount = Math.round((s.count * Math.min(100, Math.max(0, s.calcShare))) / 100);
  const picked: { topic: Topic; calc: boolean }[] = [];
  const calcTopics = shuffle(withCalc, rand);
  const allTopics = shuffle(pool, rand);
  for (let i = 0; i < s.count; i++) {
    const calc = i < calcCount && calcTopics.length > 0;
    const src = calc ? calcTopics : allTopics;
    if (!src.length) break;
    picked.push({ topic: src[i % src.length], calc });
  }
  const ordered = s.order === 'easy-first' ? picked.sort((a, b) => Number(a.calc) - Number(b.calc)) : shuffle(picked, rand);
  // a calculation can be any kind; a theory question can only be a choice
  let k = 0;
  return ordered.map((p) => {
    if (!p.calc) return { ...p, kind: 'choice' as TaskKind };
    const calcKinds = kinds.filter((x) => x !== 'choice');
    const kind = calcKinds.length && (!kinds.includes('choice') || k % 2 === 0) ? calcKinds[k % calcKinds.length] : 'choice';
    k++;
    return { ...p, kind };
  });
}

function makeTask(slot: { topic: Topic; calc: boolean; kind: TaskKind }, seed: number, s: TestSettings, rand: () => number): Task {
  let q: Question;
  if (slot.calc) {
    const gens = problemsForTopic(slot.topic.id);
    q = problemQuestion(gens[Math.floor(rand() * gens.length)], seed);
  } else {
    const qs = questionsForTopic(slot.topic, 10, seed);
    q = qs[Math.floor(rand() * qs.length)];
  }
  if (s.shuffleOptions && slot.kind === 'choice') {
    const right = q.options[q.correct];
    const options = shuffle(q.options, rng(seed * 7 + 3));
    q = { ...q, options, correct: options.indexOf(right) };
  }
  return { kind: slot.kind, q, topic: slot.topic, points: s.points[slot.kind] };
}

/** all variants of a test */
export function buildTest(s: TestSettings): Variant[] {
  const pool = topicPool(s);
  if (!pool.length) return [];
  const base = rng(s.seed * 1000 + hashStr(s.subject + s.grade));
  const slots = plan(s, base, pool);
  const out: Variant[] = [];
  for (let v = 0; v < s.variants; v++) {
    const r = rng(s.seed * 7919 + v * 104729);
    if (s.variantMode === 'different') {
      const own = plan(s, r, pool);
      out.push({ n: v + 1, tasks: own.map((slot, i) => makeTask(slot, s.seed * 131 + v * 977 + i, s, r)) });
    } else if (s.variantMode === 'numbers') {
      // the same topics in the same order; new numbers and new questions on them
      out.push({ n: v + 1, tasks: slots.map((slot, i) => makeTask(slot, s.seed * 131 + v * 977 + i, s, r)) });
    } else {
      // the very same tasks, in a different order (and with shuffled options) per variant
      const same = slots.map((slot, i) => makeTask(slot, s.seed * 131 + i, { ...s, shuffleOptions: false }, rng(s.seed + i)));
      const tasks = v === 0 ? same : shuffle(same, r).map((t) => {
        if (!s.shuffleOptions || t.kind !== 'choice') return t;
        const right = t.q.options[t.q.correct];
        const options = shuffle(t.q.options, r);
        return { ...t, q: { ...t.q, options, correct: options.indexOf(right) } };
      });
      out.push({ n: v + 1, tasks });
    }
  }
  return out;
}

export const maxPoints = (v: Variant) => v.tasks.reduce((a, t) => a + t.points, 0);
export const LETTERS = ['А', 'Б', 'В', 'Г', 'Д'];
export const LETTERS_EN = ['A', 'B', 'C', 'D', 'E'];
