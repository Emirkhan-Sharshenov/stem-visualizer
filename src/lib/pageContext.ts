import { useEffect, useSyncExternalStore } from 'react';
import type { Question } from './quiz';

/*
 * What the learner is looking at right now, for the AI mentor.
 * The app sets the section (setPageBase); screens add live details with useScreenDetail:
 * the problem on screen, the state of a sandbox, an open map section…
 */

export interface PageContext {
  where: string;
  details: string;
  /** what kind of content is on screen, to pick the mentor's suggestions */
  kind: 'question' | 'lab' | 'page';
}

let base: { where: string; about?: string; lab?: boolean } = { where: 'Главная страница приложения' };
const details = new Map<string, string>();
let snapshot: PageContext = compute();
const listeners = new Set<() => void>();

function compute(): PageContext {
  const parts = [base.about, ...details.values()].filter(Boolean) as string[];
  const kind = [...details.keys()].some((k) => k.startsWith('question')) ? 'question' : base.lab ? 'lab' : 'page';
  return { where: base.where, details: parts.join('\n'), kind };
}
function emit() {
  snapshot = compute();
  listeners.forEach((l) => l());
}

export function setPageBase(where: string, about?: string, lab = false) {
  // details are not cleared here: screens remove their own on unmount, and child effects run before the app's
  base = { where, about, lab };
  emit();
}

export function setScreenDetail(key: string, text: string | null) {
  if (text) details.set(key, text);
  else details.delete(key);
  emit();
}

/** register a live detail while a component is on screen */
export function useScreenDetail(key: string, text: string | null) {
  useEffect(() => {
    setScreenDetail(key, text);
    return () => setScreenDetail(key, null);
  }, [key, text]);
}

export function usePageContext() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
  );
}

/** a question on screen as plain text: the prompt, options and whether it has been answered */
export function questionDetail(q: Question | undefined, picked: number | null): string | null {
  if (!q) return null;
  const letters = 'АБВГДЕ';
  const opts = q.options.map((o, i) => `${letters[i]}) ${o.ru}`).join('; ');
  const state =
    picked === null
      ? 'Ученик ещё НЕ ответил на этот вопрос.'
      : `Ученик выбрал ${letters[picked]} — ${picked === q.correct ? 'верно' : `неверно, правильный ответ ${letters[q.correct]}`}.${q.explain ? ` Разбор с сайта: ${q.explain.ru}` : ''}`;
  return `Вопрос на экране: ${q.prompt.ru}\nВарианты: ${opts}\n${state}`;
}
