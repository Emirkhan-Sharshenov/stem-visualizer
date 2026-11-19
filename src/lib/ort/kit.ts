/* Small helpers shared by the ORT maths generators. */

export type T2 = { ru: string; en: string };
export type R = () => number;
export const T = (ru: string, en: string = ru): T2 => ({ ru, en });
export const int = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = <V,>(r: R, list: readonly V[]) => list[Math.floor(r() * list.length)];
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
/** a number the way a Russian paper writes it */
export const num = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
export const frac = (a: number, b: number) => {
  const g = gcd(a, b);
  return b / g === 1 ? num(a / g) : `${num(a / g)}/${num(b / g)}`;
};
export const days = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дня' : 'дней');
export const sub = (n: number) => String(n).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);

/** a comparison task of part 1 */
export interface Compare {
  level: number;
  given?: T2;
  a: string | T2;
  b: string | T2;
  /** the two values, or null when the given facts don't settle it */
  values: [number, number] | null;
  why: T2;
  /** a drawing that comes with the task (SVG markup) */
  figure?: string;
}

/** a five-option task of part 2 */
export interface Pick5 {
  level: number;
  prompt: T2;
  /** the right answer first, then wrong ones; duplicates are thrown out and replaced */
  answers: string[];
  why: T2;
  figure?: string;
}
