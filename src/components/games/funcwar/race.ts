import { rng } from './engine';

/* The opening race of an online duel: both players get the same quick function question;
   whoever answers right first shoots first. Answers are whole numbers so typing them is quick. */

export interface Race {
  ru: string;
  en: string;
  answer: number;
}

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const signed = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`);

export function raceQuestion(seed: number): Race {
  const r = rng(seed * 31 + 7);
  const kind = int(r, 0, 4);
  if (kind === 0) {
    const a = pick(r, [-3, -2, 2, 3, 4, 5]);
    const b = int(r, -9, 9);
    const x = int(r, -4, 6);
    return { ru: `y = ${a}x ${signed(b)}. Чему равен y при x = ${x}?`, en: `y = ${a}x ${signed(b)}. What is y when x = ${x}?`, answer: a * x + b };
  }
  if (kind === 1) {
    const a = pick(r, [1, 2, 3, -1, -2]);
    const c = int(r, -8, 8);
    const x = int(r, -4, 4);
    return { ru: `y = ${a === 1 ? '' : a === -1 ? '−' : a}x² ${signed(c)}. Чему равен y при x = ${x}?`, en: `y = ${a === 1 ? '' : a === -1 ? '−' : a}x² ${signed(c)}. What is y at x = ${x}?`, answer: a * x * x + c };
  }
  if (kind === 2) {
    const k = pick(r, [-4, -3, -2, 2, 3, 4, 5]);
    const x = int(r, 2, 6);
    return { ru: `Прямая y = kx проходит через точку (${x}; ${k * x}). Найди k.`, en: `The line y = kx passes through (${x}, ${k * x}). Find k.`, answer: k };
  }
  if (kind === 3) {
    const a = int(r, -5, 5);
    const b = int(r, -6, 6);
    const x = int(r, -6, 6);
    return { ru: `y = |x ${signed(-a)}| ${signed(b)}. Чему равен y при x = ${x}?`, en: `y = |x ${signed(-a)}| ${signed(b)}. What is y at x = ${x}?`, answer: Math.abs(x - a) + b };
  }
  const h = int(r, -5, 5);
  const c = int(r, -9, 9);
  // y = (x − h)² + c written out: x² − 2hx + h² + c
  return { ru: `y = x² ${signed(-2 * h)}x ${signed(h * h + c)}. При каком x вершина параболы?`, en: `y = x² ${signed(-2 * h)}x ${signed(h * h + c)}. At what x is the vertex?`, answer: h };
}

/** reads "−3", "-3", "3,0" */
export const parseAnswer = (s: string) => {
  const v = parseFloat(s.trim().replace(/[−–]/g, '-').replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};
