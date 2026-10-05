import { useSyncExternalStore } from 'react';

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
  /** last change, used to merge with the cloud copy */
  updatedAt: number;
}

const KEY = 'stemProgress';
const EMPTY: Progress = { completed: {}, quiz: {}, predictions: {}, bestStreak: 0, currentStreak: 0, labs: {}, days: [], tests: [], daily: {}, problems: {}, updatedAt: 0 };

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
    commit(withDay({ ...state, completed: { ...state.completed, [id]: value } }));
  },
  recordQuiz(id: string, score: number, total: number) {
    const prev = state.quiz[id];
    const best = Math.max(prev?.best ?? 0, score);
    const passed = score / total >= 0.75;
    commit(withDay({ ...state, quiz: { ...state.quiz, [id]: { best, total, at: Date.now() } }, completed: passed ? { ...state.completed, [id]: true } : state.completed }));
  },
  recordPrediction(id: string, ok: boolean) {
    const currentStreak = ok ? state.currentStreak + 1 : 0;
    commit(withDay({ ...state, predictions: { ...state.predictions, [id]: { ok, at: Date.now() } }, currentStreak, bestStreak: Math.max(state.bestStreak, currentStreak) }));
  },
  recordLab(key: string) {
    commit(withDay({ ...state, labs: { ...state.labs, [key]: (state.labs[key] ?? 0) + 1 } }));
  },
  recordTest(t: TestRecord) {
    commit(withDay({ ...state, tests: [...state.tests, t].slice(-100) }));
  },
  recordProblem(id: string, ok: boolean) {
    const cur = state.problems?.[id] ?? { ok: 0, total: 0 };
    commit(withDay({ ...state, problems: { ...state.problems, [id]: { ok: cur.ok + (ok ? 1 : 0), total: cur.total + 1 } } }));
  },
  recordDaily(date: string, score: number, total: number) {
    commit(withDay({ ...state, daily: { ...state.daily, [date]: { score, total } } }));
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
    b('all', '🌌', 'Вся программа', 'Whole course', 'Пройди все темы', 'Complete every topic', done, totals.all ?? 486),
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
    days: [...new Set([...a.days, ...b.days])].sort().slice(-400),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    currentStreak: a.updatedAt >= b.updatedAt ? a.currentStreak : b.currentStreak,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
}
