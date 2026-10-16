/* The first 20 elements: names, stable isotopes, electron shells and configurations (school model). */

export interface Element {
  z: number;
  sym: string;
  ru: string;
  en: string;
  mass: number;
  stable: number[];
}

export const ELEMENTS: Element[] = [
  { z: 1, sym: 'H', ru: 'Водород', en: 'Hydrogen', mass: 1.008, stable: [1, 2] },
  { z: 2, sym: 'He', ru: 'Гелий', en: 'Helium', mass: 4.003, stable: [3, 4] },
  { z: 3, sym: 'Li', ru: 'Литий', en: 'Lithium', mass: 6.94, stable: [6, 7] },
  { z: 4, sym: 'Be', ru: 'Бериллий', en: 'Beryllium', mass: 9.012, stable: [9] },
  { z: 5, sym: 'B', ru: 'Бор', en: 'Boron', mass: 10.81, stable: [10, 11] },
  { z: 6, sym: 'C', ru: 'Углерод', en: 'Carbon', mass: 12.011, stable: [12, 13] },
  { z: 7, sym: 'N', ru: 'Азот', en: 'Nitrogen', mass: 14.007, stable: [14, 15] },
  { z: 8, sym: 'O', ru: 'Кислород', en: 'Oxygen', mass: 15.999, stable: [16, 17, 18] },
  { z: 9, sym: 'F', ru: 'Фтор', en: 'Fluorine', mass: 18.998, stable: [19] },
  { z: 10, sym: 'Ne', ru: 'Неон', en: 'Neon', mass: 20.18, stable: [20, 21, 22] },
  { z: 11, sym: 'Na', ru: 'Натрий', en: 'Sodium', mass: 22.99, stable: [23] },
  { z: 12, sym: 'Mg', ru: 'Магний', en: 'Magnesium', mass: 24.305, stable: [24, 25, 26] },
  { z: 13, sym: 'Al', ru: 'Алюминий', en: 'Aluminium', mass: 26.98, stable: [27] },
  { z: 14, sym: 'Si', ru: 'Кремний', en: 'Silicon', mass: 28.085, stable: [28, 29, 30] },
  { z: 15, sym: 'P', ru: 'Фосфор', en: 'Phosphorus', mass: 30.97, stable: [31] },
  { z: 16, sym: 'S', ru: 'Сера', en: 'Sulfur', mass: 32.06, stable: [32, 33, 34, 36] },
  { z: 17, sym: 'Cl', ru: 'Хлор', en: 'Chlorine', mass: 35.45, stable: [35, 37] },
  { z: 18, sym: 'Ar', ru: 'Аргон', en: 'Argon', mass: 39.95, stable: [36, 38, 40] },
  { z: 19, sym: 'K', ru: 'Калий', en: 'Potassium', mass: 39.1, stable: [39, 41] },
  { z: 20, sym: 'Ca', ru: 'Кальций', en: 'Calcium', mass: 40.08, stable: [40, 42, 43, 44, 46, 48] },
];

/** the isotope you get by default: the mass number closest to the average atomic mass */
export const commonA = (e: Element) => e.stable.reduce((b, a) => (Math.abs(a - e.mass) < Math.abs(b - e.mass) ? a : b));

/** electrons per shell in the school model: 2, 8, 8, 2 */
export function shells(e: number): number[] {
  const cap = [2, 8, 8, 2];
  const out: number[] = [];
  let left = e;
  for (const c of cap) {
    if (left <= 0) break;
    out.push(Math.min(c, left));
    left -= c;
  }
  return out;
}

const ORBITALS: [string, number][] = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];

/** 1s^{2} 2s^{2} 2p^{6}… as TeX */
export function configTex(e: number): string {
  const parts: string[] = [];
  let left = e;
  for (const [name, cap] of ORBITALS) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    parts.push(`${name}^{${n}}`);
    left -= n;
  }
  return parts.join('\\,') || '—';
}

export const SUP = (n: number) =>
  String(n)
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
    .join('');

/** e.g. "2+", "−" or "" */
export function chargeLabel(q: number) {
  if (q === 0) return '';
  const m = Math.abs(q) === 1 ? '' : String(Math.abs(q));
  return `${m}${q > 0 ? '+' : '−'}`;
}

export interface Task {
  id: string;
  ru: string;
  en: string;
  check: (p: number, n: number, e: number) => boolean;
}

export const TASKS: Task[] = [
  { id: 'h', ru: 'Собери атом водорода', en: 'Build a hydrogen atom', check: (p, n, e) => p === 1 && e === 1 && (n === 0 || n === 1) },
  { id: 'c12', ru: 'Собери углерод-12', en: 'Build carbon-12', check: (p, n, e) => p === 6 && n === 6 && e === 6 },
  { id: 'c14', ru: 'Собери радиоактивный углерод-14', en: 'Build radioactive carbon-14', check: (p, n, e) => p === 6 && n === 8 && e === 6 },
  { id: 'na', ru: 'Собери ион натрия Na⁺', en: 'Build a sodium ion Na⁺', check: (p, n, e) => p === 11 && n === 12 && e === 10 },
  { id: 'cl', ru: 'Собери хлорид-ион ³⁵Cl⁻', en: 'Build a chloride ion ³⁵Cl⁻', check: (p, n, e) => p === 17 && n === 18 && e === 18 },
  { id: 'mg', ru: 'Собери ион магния ²⁴Mg²⁺', en: 'Build a magnesium ion ²⁴Mg²⁺', check: (p, n, e) => p === 12 && n === 12 && e === 10 },
  { id: 'noble', ru: 'Собери атом инертного газа с 3 слоями', en: 'Build a noble-gas atom with 3 shells', check: (p, n, e) => p === 18 && e === 18 && [18, 20, 22].includes(n) },
];
