import { useSyncExternalStore } from 'react';
import type { Question } from './quiz';

/* Learner progress kept in the browser (until accounts arrive with Supabase). */

export interface TestRecord {
  at: number;
  subject: string;
  score: number;
  total: number;
  secs: number;
  /** section id for thematic tests */
  section?: string;
}

export interface Progress {
  /** topics marked as understood (manually or by passing the topic quiz) */
  completed: Record<string, boolean>;
  /** best topic-quiz score per topic */
  quiz: Record<string, { best: number; total: number; at: number }>;
  /** predict-then-check results by challenge id (latest attempt) */
  predictions: Record<string, { ok: boolean; at: number }>;
  /** longest run of correct predictions */
  bestStreak: number;
  currentStreak: number;
  /** simulations opened from the labs gallery or topics */
  labs: Record<string, number>;
  /** days with activity, yyyy-mm-dd */
  days: string[];
  tests: TestRecord[];
  /** questions of the day by date */
  daily: Record<string, { score: number; total: number }>;
  /** calculation problems solved, by generator */
  problems: Record<string, { ok: number; total: number }>;
  /** experience points earned on this device (the league total lives on the server) */
  xp: number;
  /** wrong answers to revisit, spaced out: box 0…3, due as a timestamp */
  mistakes: Record<string, Mistake>;
  /** best run in the problem marathon */
  marathonBest: number;
  /** best score in each game */
  games?: Record<string, number>;
  /** last change, used to merge with the cloud copy */
  updatedAt: number;
}

export interface Mistake {
  q: Question;
  box: number;
  due: number;
  at: number;
  misses: number;
}

/** days until the next review after a correct answer from box 0, 1, 2; after box 3 it is learnt */
export const REVIEW_DAYS = [1, 3, 7];
const DAY = 86400000;
const MAX_MISTAKES = 150;

/** points for each kind of work (the server caps a day at 2000) */
export const XP = { problem: 10, review: 8, prediction: 5, topic: 10, quizPass: 15, perQuizAnswer: 2, perTestAnswer: 2, perDailyAnswer: 5, daily: 5, perMarathon: 2 };

const KEY = 'stemProgress';
const EMPTY: Progress = { completed: {}, quiz: {}, predictions: {}, bestStreak: 0, currentStreak: 0, labs: {}, days: [], tests: [], daily: {}, problems: {}, xp: 0, mistakes: {}, marathonBest: 0, updatedAt: 0 };

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : { ...EMPTY };
    // migrate the textbook's older "completedLessons" store
    const old = localStorage.getItem('completedLessons');
    if (old) p.completed = { ...(JSON.parse(old) as Record<string, boolean>), ...p.completed };
    return p;
  } catch {
    return { ...EMPTY };
  }
}

let state: Progress = typeof window === 'undefined' ? EMPTY : load();
const listeners = new Set<() => void>();

function commit(next: Progress, touch = true) {
  state = touch ? { ...next, updatedAt: Date.now() } : next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem('completedLessons', JSON.stringify(state.completed));
  } catch {
    // storage unavailable: progress lives for this session only
  }
  listeners.forEach((l) => l());
}

const today = () => new Date().toISOString().slice(0, 10);

/** points: kept locally and announced, xp.ts sends them to the league on the server */
function award(p: Progress, amount: number, reason: string): Progress {
  if (amount <= 0) return p;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('stem-xp', { detail: { amount, reason } }));
  return { ...p, xp: (p.xp ?? 0) + amount };
}
const withDay = (p: Progress): Progress => (p.days.includes(today()) ? p : { ...p, days: [...p.days, today()].slice(-400) });

export function useProgress() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export const progress = {
  get: () => state,
  setCompleted(id: string, value: boolean) {
    const first = value && !state.completed[id];
    commit(award(withDay({ ...state, completed: { ...state.completed, [id]: value } }), first ? XP.topic : 0, 'topic'));
  },
  recordQuiz(id: string, score: number, total: number) {
    const prev = state.quiz[id];
    const best = Math.max(prev?.best ?? 0, score);
    const passed = score / total >= 0.75;
    const firstPass = passed && !state.completed[id];
    commit(award(withDay({ ...state, quiz: { ...state.quiz, [id]: { best, total, at: Date.now() } }, completed: passed ? { ...state.completed, [id]: true } : state.completed }), score * XP.perQuizAnswer + (firstPass ? XP.quizPass : 0), 'quiz'));
  },
  recordPrediction(id: string, ok: boolean) {
    const currentStreak = ok ? state.currentStreak + 1 : 0;
    const firstRight = ok && !state.predictions[id]?.ok;
    commit(award(withDay({ ...state, predictions: { ...state.predictions, [id]: { ok, at: Date.now() } }, currentStreak, bestStreak: Math.max(state.bestStreak, currentStreak) }), firstRight ? XP.prediction : 0, 'prediction'));
  },
  recordLab(key: string) {
    commit(withDay({ ...state, labs: { ...state.labs, [key]: (state.labs[key] ?? 0) + 1 } }));
  },
  recordTest(t: TestRecord) {
    commit(award(withDay({ ...state, tests: [...state.tests, t].slice(-100) }), t.score * XP.perTestAnswer, 'test'));
  },
  recordProblem(id: string, ok: boolean) {
    const cur = state.problems?.[id] ?? { ok: 0, total: 0 };
    commit(award(withDay({ ...state, problems: { ...state.problems, [id]: { ok: cur.ok + (ok ? 1 : 0), total: cur.total + 1 } } }), ok ? XP.problem : 0, 'problem'));
  },
  recordDaily(date: string, score: number, total: number) {
    const first = !state.daily[date];
    commit(award(withDay({ ...state, daily: { ...state.daily, [date]: { score, total } } }), first ? score * XP.perDailyAnswer + XP.daily : 0, 'daily'));
  },
  /** remember wrong answers for spaced review (a repeated mistake starts over) */
  recordMistakes(qs: Question[]) {
    if (!qs.length) return;
    const now = Date.now();
    const mistakes = { ...(state.mistakes ?? {}) };
    for (const q of qs) mistakes[q.id] = { q, box: 0, due: now, at: now, misses: (mistakes[q.id]?.misses ?? 0) + 1 };
    // keep the newest ones
    const keep = Object.values(mistakes).sort((a, b) => b.at - a.at).slice(0, MAX_MISTAKES);
    commit({ ...state, mistakes: Object.fromEntries(keep.map((m) => [m.q.id, m])) });
  },
  /** answer a review card: right moves it to a longer interval (and out after the last), wrong starts over tomorrow */
  reviewMistake(id: string, ok: boolean) {
    const m = state.mistakes?.[id];
    if (!m) return;
    const now = Date.now();
    const mistakes = { ...state.mistakes };
    if (ok && m.box >= REVIEW_DAYS.length) delete mistakes[id];
    else mistakes[id] = ok ? { ...m, box: m.box + 1, due: now + REVIEW_DAYS[m.box] * DAY, at: now } : { ...m, box: 0, due: now + DAY, at: now, misses: m.misses + 1 };
    commit(award(withDay({ ...state, mistakes }), ok ? XP.review : 0, 'review'));
  },
  /** a finished game: keeps the record and gives XP for the points scored (a little extra for a new record) */
  recordGame(id: string, score: number, xp: number) {
    const best = state.games?.[id] ?? 0;
    const bonus = score > best && best > 0 ? 5 : 0;
    commit(award(withDay({ ...state, games: { ...(state.games ?? {}), [id]: Math.max(best, score) } }), Math.min(60, Math.round(xp)) + bonus, 'game'));
  },
  recordMarathon(score: number) {
    commit(award(withDay({ ...state, marathonBest: Math.max(state.marathonBest ?? 0, score) }), score * XP.perMarathon, 'marathon'));
  },
  /** replace the whole state (after merging with the cloud copy) */
  replace(next: Progress) {
    commit({ ...EMPTY, ...next }, false);
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  touch() {
    if (!state.days.includes(today())) commit(withDay(state));
  },
};

/** consecutive days up to today (or yesterday) with activity */
export function dayStreak(p: Progress) {
  const set = new Set(p.days);
  let n = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export interface Badge {
  id: string;
  title: { ru: string; en: string };
  text: { ru: string; en: string };
  icon: string;
  got: boolean;
  /** 0..1 progress toward the badge */
  part: number;
}

/** badges for real learning actions */
export function badges(p: Progress, totals: Record<string, number>): Badge[] {
  const done = Object.values(p.completed).filter(Boolean).length;
  const bySubject = (s: string) => Object.keys(p.completed).filter((id) => p.completed[id] && id.startsWith(s[0])).length;
  const preds = Object.values(p.predictions).filter((x) => x.ok).length;
  const labs = Object.keys(p.labs).length;
  const quizPerfect = Object.values(p.quiz).filter((q) => q.best === q.total).length;
  const streak = dayStreak(p);
  const b = (id: string, icon: string, ru: string, en: string, tRu: string, tEn: string, have: number, need: number): Badge => ({ id, icon, title: { ru, en }, text: { ru: tRu, en: tEn }, got: have >= need, part: Math.min(1, have / need) });
  return [
    b('first', '🌱', 'Первый шаг', 'First step', 'Пройди первую тему', 'Complete your first topic', done, 1),
    b('ten', '📚', 'Десятка', 'Ten down', 'Пройди 10 тем', 'Complete 10 topics', done, 10),
    b('fifty', '🏔️', 'Полсотни', 'Fifty', 'Пройди 50 тем', 'Complete 50 topics', done, 50),
    b('physics', '⚡', 'Физик', 'Physicist', 'Пройди 25 тем по физике', 'Complete 25 physics topics', bySubject('physics'), 25),
    b('chemistry', '🧪', 'Химик', 'Chemist', 'Пройди 25 тем по химии', 'Complete 25 chemistry topics', bySubject('chemistry'), 25),
    b('biology', '🧬', 'Биолог', 'Biologist', 'Пройди 25 тем по биологии', 'Complete 25 biology topics', bySubject('biology'), 25),
    b('predict5', '🔮', 'Провидец', 'Seer', 'Угадай 5 исходов в «Предскажи, потом проверь»', 'Get 5 predictions right', preds, 5),
    b('streak5', '🎯', 'Без промаха', 'Sharpshooter', '5 верных предсказаний подряд', '5 correct predictions in a row', p.bestStreak, 5),
    b('perfect', '💯', 'Отличник', 'Straight A', '5 тестов по темам без ошибок', '5 topic quizzes with no mistakes', quizPerfect, 5),
    b('explorer', '🔭', 'Исследователь', 'Explorer', 'Открой 15 разных лабораторий', 'Open 15 different labs', labs, 15),
    b('days3', '🔥', 'Три дня подряд', 'Three-day streak', 'Занимайся 3 дня подряд', 'Study 3 days in a row', streak, 3),
    b('days7', '🏆', 'Неделя без пропусков', 'Perfect week', 'Занимайся 7 дней подряд', 'Study 7 days in a row', streak, 7),
    b('daily', '☀️', 'Утренняя зарядка', 'Daily warm-up', 'Ответь на вопросы дня 5 раз', 'Do the questions of the day 5 times', Object.keys(p.daily).length, 5),
    b('solver', '🧮', 'Решатель', 'Problem solver', 'Реши правильно 50 задач', 'Solve 50 problems correctly', Object.values(p.problems ?? {}).reduce((s, x) => s + x.ok, 0), 50),
    b('tester', '⏱️', 'Тренировка', 'Practice run', 'Пройди 3 тренировочных теста', 'Finish 3 practice tests', p.tests.length, 3),
    b('all', '🌌', 'Вся программа', 'Whole course', 'Пройди все темы', 'Complete every topic', done, totals.all ?? 660),
  ];
}

/** merge two copies of progress (this device and the cloud) without losing anything */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const quiz = { ...a.quiz };
  Object.entries(b.quiz).forEach(([k, v]) => {
    const x = quiz[k];
    quiz[k] = !x || v.best > x.best ? v : x;
  });
  const predictions = { ...a.predictions };
  Object.entries(b.predictions).forEach(([k, v]) => {
    if (!predictions[k] || v.at > predictions[k].at) predictions[k] = v;
  });
  const labs = { ...a.labs };
  Object.entries(b.labs).forEach(([k, v]) => (labs[k] = Math.max(labs[k] ?? 0, v)));
  const daily = { ...a.daily };
  Object.entries(b.daily ?? {}).forEach(([k, v]) => {
    if (!daily[k] || v.score > daily[k].score) daily[k] = v;
  });
  const problems = { ...(a.problems ?? {}) };
  Object.entries(b.problems ?? {}).forEach(([k, v]) => {
    const x = problems[k];
    problems[k] = !x || v.total > x.total ? v : x;
  });
  const tests = [...a.tests, ...b.tests.filter((t) => !a.tests.some((x) => x.at === t.at))].sort((x, y) => x.at - y.at).slice(-100);
  const mistakes = { ...(a.mistakes ?? {}) };
  Object.entries(b.mistakes ?? {}).forEach(([k, v]) => {
    if (!mistakes[k] || v.at > mistakes[k].at) mistakes[k] = v;
  });
  const completed = { ...a.completed };
  Object.entries(b.completed).forEach(([k, v]) => v && (completed[k] = true));
  return {
    completed,
    quiz,
    predictions,
    labs,
    daily,
    problems,
    tests,
    mistakes,
    xp: Math.max(a.xp ?? 0, b.xp ?? 0),
    marathonBest: Math.max(a.marathonBest ?? 0, b.marathonBest ?? 0),
    games: Object.fromEntries([...new Set([...Object.keys(a.games ?? {}), ...Object.keys(b.games ?? {})])].map((k) => [k, Math.max(a.games?.[k] ?? 0, b.games?.[k] ?? 0)])),
    days: [...new Set([...a.days, ...b.days])].sort().slice(-400),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    currentStreak: a.updatedAt >= b.updatedAt ? a.currentStreak : b.currentStreak,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
}
