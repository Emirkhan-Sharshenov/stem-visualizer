import { useSyncExternalStore } from 'react';

/* Learner progress kept in the browser (until accounts arrive with Supabase). */

export interface TestRecord {
  at: number;
  subject: string;
  score: number;
  total: number;
  secs: number;
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
}

const KEY = 'stemProgress';
const EMPTY: Progress = { completed: {}, quiz: {}, predictions: {}, bestStreak: 0, currentStreak: 0, labs: {}, days: [], tests: [] };

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

function commit(next: Progress) {
  state = next;
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
    b('tester', '⏱️', 'Тренировка', 'Practice run', 'Пройди 3 тренировочных теста', 'Finish 3 practice tests', p.tests.length, 3),
    b('all', '🌌', 'Вся программа', 'Whole course', 'Пройди все темы', 'Complete every topic', done, totals.all ?? 486),
  ];
}
