import { useSyncExternalStore } from 'react';
import type { Progress } from './progress';
import { ORT_DRILLS, type OrtDrill } from './ort/paper';
import { ORT_MAX, ORT_SECTIONS, type OrtSectionId } from './ort/sections';

/* The plan to the ORT: the learner sets the exam date, a target score and minutes a day; every day the plan picks
   what to do from how each section and each kind of task has gone so far, and ticks tasks off by itself when the
   work shows up in the progress. Kept in the browser, like the rest of the plan settings. */

export interface OrtPlanSettings {
  /** yyyy-mm-dd */
  date: string | null;
  /** target on the 245-point scale */
  target: number;
  minutes: 20 | 40 | 60 | 90;
  /** days on which every task was done */
  doneDays: string[];
  /** the last day mistakes were due, so a cleared review still shows as done */
  dueDay?: string;
}

const KEY = 'stem-ort-plan';
const DEFAULTS: OrtPlanSettings = { date: null, target: 150, minutes: 40, doneDays: [] };
const DAY = 864e5;
const listeners = new Set<() => void>();
let state: OrtPlanSettings = load();

function load(): OrtPlanSettings {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as OrtPlanSettings) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}
export const ortPlan = {
  get: () => state,
  set(patch: Partial<OrtPlanSettings>) {
    state = { ...state, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // the plan lives for this session only
    }
    listeners.forEach((l) => l());
  },
  markDone(day: string) {
    if (!state.doneDays.includes(day)) ortPlan.set({ doneDays: [...state.doneDays, day].slice(-400) });
  },
};
export function useOrtPlan() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

/* ---------- what the learner can already do ---------- */

export const DRILL_SECTION: Record<OrtDrill, OrtSectionId> = { compare: 'math', pick5: 'math', figure: 'math', analogy: 'verbal', completion: 'verbal', reading: 'reading', grammar: 'grammar' };
export const localDay = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/** recent work counts more: its weight halves every three weeks */
const weight = (at: number, now: number) => Math.pow(0.5, Math.max(0, now - at) / (21 * DAY));

export interface Skill {
  /** share of right answers, 0…1, or null when there is nothing to go on */
  acc: number | null;
  /** how many answers stand behind it (weighted) */
  n: number;
  /** the last time it was practised */
  last: number;
}

/** accuracy for every kind of task, from main-test runs and from the drills */
export function drillSkills(p: Progress, now = Date.now(), until = Infinity): Record<OrtDrill, Skill> {
  const acc: Record<string, { r: number; t: number; last: number }> = {};
  const add = (d: string, right: number, total: number, at: number) => {
    if (at > until || total <= 0) return;
    const w = weight(at, now);
    const a = acc[d] ?? { r: 0, t: 0, last: 0 };
    acc[d] = { r: a.r + right * w, t: a.t + total * w, last: Math.max(a.last, at) };
  };
  for (const run of p.ort ?? []) for (const [d, v] of Object.entries(run.byDrill)) add(d, v.right, v.total, run.at);
  for (const t of p.tests) if (t.section === 'ort-drill') add(t.subject, t.score, t.total, t.at);
  return Object.fromEntries(ORT_DRILLS.map((d) => {
    const a = acc[d.id];
    return [d.id, a && a.t >= 3 ? { acc: a.r / a.t, n: a.t, last: a.last } : { acc: null, n: a?.t ?? 0, last: a?.last ?? 0 }];
  })) as Record<OrtDrill, Skill>;
}

/** accuracy for every section: from section and full runs, or from its kinds of task when there are none */
export function sectionSkills(p: Progress, now = Date.now(), until = Infinity): Record<OrtSectionId, Skill> {
  const drills = drillSkills(p, now, until);
  const acc: Record<string, { r: number; t: number; last: number }> = {};
  for (const run of p.ort ?? []) {
    if (run.at > until) continue;
    const w = weight(run.at, now);
    for (const [s, v] of Object.entries(run.bySection)) {
      const a = acc[s] ?? { r: 0, t: 0, last: 0 };
      acc[s] = { r: a.r + v.right * w, t: a.t + v.total * w, last: Math.max(a.last, run.at) };
    }
  }
  return Object.fromEntries(ORT_SECTIONS.map((s) => {
    const a = acc[s.id];
    if (a && a.t >= 5) return [s.id, { acc: a.r / a.t, n: a.t, last: a.last }];
    // no section runs yet: lean on the drills of this section
    const ds = ORT_DRILLS.filter((d) => DRILL_SECTION[d.id] === s.id).map((d) => drills[d.id]).filter((x) => x.acc !== null);
    const n = ds.reduce((x, d) => x + d.n, 0);
    return [s.id, n >= 5 ? { acc: ds.reduce((x, d) => x + (d.acc ?? 0) * d.n, 0) / n, n, last: Math.max(...ds.map((d) => d.last)) } : { acc: null, n, last: 0 }];
  })) as Record<OrtSectionId, Skill>;
}

/** the expected score on the 245-point scale, or null until every section has been tried */
export function predictScore(p: Progress, now = Date.now(), until = Infinity): number | null {
  const s = sectionSkills(p, now, until);
  if (ORT_SECTIONS.some((x) => s[x.id].acc === null)) return null;
  const right = ORT_SECTIONS.reduce((a, x) => a + (s[x.id].acc ?? 0) * x.questions, 0);
  const total = ORT_SECTIONS.reduce((a, x) => a + x.questions, 0);
  return Math.round((right / total) * ORT_MAX);
}

/** the prediction at the end of each of the last few weeks, for a small chart */
export function predictionHistory(p: Progress, weeks = 8, now = Date.now()): (number | null)[] {
  return Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * 7 * DAY;
    return predictScore(p, end, end);
  });
}

/* ---------- today's work ---------- */

export type Phase = 'none' | 'base' | 'train' | 'final' | 'rest' | 'past';
export interface PlanTask {
  id: string;
  kind: 'mistakes' | 'drill' | 'section' | 'full';
  ref?: string;
  minutes: number;
  /** why this, today: a number the learner can see moving */
  why: { ru: string; en: string };
  done: boolean;
}

export function daysLeft(date: string | null, now = Date.now()): number | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  const exam = new Date(y, m - 1, d).getTime();
  const t = new Date(now);
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return Math.round((exam - today) / DAY);
}
export function phaseOf(left: number | null): Phase {
  if (left === null) return 'none';
  if (left < 0) return 'past';
  if (left <= 2) return 'rest';
  if (left <= 14) return 'final';
  if (left <= 60) return 'train';
  return 'base';
}

const SECTION_MIN: Record<OrtSectionId, number> = Object.fromEntries(ORT_SECTIONS.map((s) => [s.id, s.minutes])) as Record<OrtSectionId, number>;
const pct = (x: number | null) => (x === null ? null : Math.round(x * 100));

/** the tasks for one day; `day` decides the rotation, `p` what is weak and what is already done */
export function buildDay(p: Progress, s: OrtPlanSettings, now = Date.now()): { phase: Phase; left: number | null; tasks: PlanTask[] } {
  const left = daysLeft(s.date, now);
  const phase = phaseOf(left);
  if (phase === 'none' || phase === 'past') return { phase, left, tasks: [] };
  const today = localDay(now);
  const isToday = (at: number) => localDay(at) === today;
  const goal = s.target / ORT_MAX; // the share of right answers the target needs
  const drills = drillSkills(p, now);
  const sections = sectionSkills(p, now);
  const tasks: PlanTask[] = [];
  let budget: number = s.minutes;

  // 1. mistakes that are due: short and the best value for the time
  const due = Object.values(p.mistakes ?? {}).filter((m) => m.due <= now).length;
  const reviewedToday = due === 0 && s.dueDay === today;
  if (due > 0 || reviewedToday) {
    const n = Math.min(10, Math.max(due, 1));
    tasks.push({ id: 'mistakes', kind: 'mistakes', minutes: n, why: { ru: due ? `${due} ${due === 1 ? 'ошибка ждёт' : due < 5 ? 'ошибки ждут' : 'ошибок ждут'} повторения` : 'все ошибки повторены', en: due ? `${due} mistake${due === 1 ? '' : 's'} due` : 'all mistakes reviewed' }, done: due === 0 });
    budget -= n;
  }

  // 2. a full mock: on Saturdays while training, every fourth day near the end, never in the last two days
  const weekday = new Date(now).getDay();
  const fullDay = (phase === 'train' && weekday === 6) || (phase === 'final' && (left ?? 0) % 4 === 0);
  if (fullDay) {
    const doneFull = (p.ort ?? []).some((r) => r.whole && isToday(r.at));
    tasks.push({ id: 'full', kind: 'full', minutes: 215, why: { ru: 'полный пробник: 150 заданий, как на экзамене', en: 'full mock: 150 tasks, like the real thing' }, done: doneFull });
    return { phase, left, tasks };
  }

  // 3. a section run on longer days: the weakest section, the least recently practised among the two weakest
  if (phase !== 'rest' && phase !== 'base') {
    const order = ORT_SECTIONS.map((x) => ({ id: x.id, sk: sections[x.id] })).sort((a, b) => (a.sk.acc ?? -1) - (b.sk.acc ?? -1));
    const pick = order.slice(0, 2).sort((a, b) => a.sk.last - b.sk.last)[0];
    const mins = SECTION_MIN[pick.id];
    if (mins <= budget + 15) {
      const done = (p.ort ?? []).some((r) => !r.whole && r.bySection[pick.id] && isToday(r.at));
      const a = pct(pick.sk.acc);
      tasks.push({ id: `section:${pick.id}`, kind: 'section', ref: pick.id, minutes: mins, why: { ru: a === null ? 'ещё не сдавал этот раздел' : `точность ${a}%, для цели нужно ${Math.round(goal * 100)}%`, en: a === null ? 'not tried yet' : `accuracy ${a}%, the goal needs ${Math.round(goal * 100)}%` }, done });
      budget -= mins;
    }
  }

  // 4. drills fill the rest: untried kinds first early on, then the weakest; 10 tasks take about 10 minutes.
  //    A small jitter seeded by the day lets two nearly equal kinds take turns.
  const dayNo = Math.floor(now / DAY);
  const jitter = (i: number) => ((Math.sin((dayNo + 1) * 12.9898 + i * 78.233) * 43758.5453) % 1) * 0.02;
  const ranked = ORT_DRILLS.map((d, i) => {
    const a = drills[d.id].acc;
    return { id: d.id, sk: drills[d.id], v: (a === null ? (phase === 'base' ? -1 : 0.5) : a) + jitter(i) };
  }).sort((a, b) => a.v - b.v);
  const maxDrills = phase === 'rest' ? 1 : 4;
  let added = 0;
  for (const r of ranked) {
    if (added >= maxDrills) break;
    if (tasks.some((t) => t.ref === r.id)) continue;
    if (budget < 8 && added > 0) break;
    const done = p.tests.some((t) => t.section === 'ort-drill' && t.subject === r.id && isToday(t.at));
    const a = pct(r.sk.acc);
    tasks.push({ id: `drill:${r.id}`, kind: 'drill', ref: r.id, minutes: 10, why: { ru: a === null ? 'ещё не пробовал этот тип' : a >= goal * 100 ? `уже ${a}% — держим форму` : `точность ${a}%, цель ${Math.round(goal * 100)}%`, en: a === null ? 'not tried yet' : a >= goal * 100 ? `already ${a}%, keeping it up` : `accuracy ${a}%, goal ${Math.round(goal * 100)}%` }, done });
    budget -= 10;
    added++;
  }
  return { phase, left, tasks };
}

/** the shape of the coming week, one word per day, for a strip under today's plan */
export function weekAhead(s: OrtPlanSettings, now = Date.now()): { day: string; weekday: number; kind: 'full' | 'section' | 'drills' | 'rest' | 'exam' }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const t = now + i * DAY;
    const left = daysLeft(s.date, t);
    const ph = phaseOf(left);
    const wd = new Date(t).getDay();
    const kind = left === 0 ? 'exam' : ph === 'rest' ? 'rest' : (ph === 'train' && wd === 6) || (ph === 'final' && (left ?? 0) % 4 === 0) ? 'full' : ph === 'base' ? 'drills' : 'section';
    return { day: localDay(t), weekday: wd, kind };
  });
}
