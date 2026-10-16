/* Acid–base titration: exact pH from the charge balance, indicators and their colours. */

export type AnalyteId = 'HCl' | 'CH3COOH' | 'NaOH' | 'NH3';

export interface Analyte {
  id: AnalyteId;
  kind: 'acid' | 'base';
  /** Ka for an acid, Kb for a base; strong ones get a huge K */
  K: number;
  tex: string;
  name: { ru: string; en: string };
  titrant: { tex: string; name: { ru: string; en: string } };
}

const NAOH = { tex: '\\mathrm{NaOH}', name: { ru: 'гидроксид натрия', en: 'sodium hydroxide' } };
const HCLT = { tex: '\\mathrm{HCl}', name: { ru: 'соляная кислота', en: 'hydrochloric acid' } };

export const ANALYTES: Analyte[] = [
  { id: 'HCl', kind: 'acid', K: 1e7, tex: '\\mathrm{HCl}', name: { ru: 'Соляная кислота (сильная)', en: 'Hydrochloric acid (strong)' }, titrant: NAOH },
  { id: 'CH3COOH', kind: 'acid', K: 1.8e-5, tex: '\\mathrm{CH_3COOH}', name: { ru: 'Уксусная кислота (слабая)', en: 'Acetic acid (weak)' }, titrant: NAOH },
  { id: 'NaOH', kind: 'base', K: 1e7, tex: '\\mathrm{NaOH}', name: { ru: 'Гидроксид натрия (сильное основание)', en: 'Sodium hydroxide (strong base)' }, titrant: HCLT },
  { id: 'NH3', kind: 'base', K: 1.8e-5, tex: '\\mathrm{NH_3 \\cdot H_2O}', name: { ru: 'Аммиак (слабое основание)', en: 'Ammonia (weak base)' }, titrant: HCLT },
];

const KW = 1e-14;

/** pH after adding vt mL of 0.1 M titrant to va mL of analyte with concentration ca */
export function pH(an: Analyte, ca: number, va: number, ct: number, vt: number): number {
  const v = va + vt;
  const total = (ca * va) / v; // analyte, mol/L
  const added = (ct * vt) / v; // titrant, mol/L
  // charge balance f(h) = 0, f grows with h, so bisection on log h is safe
  const f = (h: number) => {
    if (an.kind === 'acid') {
      // h + [Na+] = [OH-] + [A-]
      return h + added - KW / h - (total * an.K) / (an.K + h);
    }
    // h + [BH+] = [OH-] + [Cl-];  BH+ fraction with Ka(BH+) = Kw / Kb
    const kaBH = KW / an.K;
    return h + (total * h) / (h + kaBH) - KW / h - added;
  };
  let lo = -15;
  let hi = 1;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (f(10 ** mid) > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}

export type IndicatorId = 'phenolphthalein' | 'methylorange' | 'litmus' | 'bromothymol' | 'universal';

export interface Indicator {
  id: IndicatorId;
  name: { ru: string; en: string };
  range: [number, number];
  acid: string;
  base: string;
}

export const INDICATORS: Indicator[] = [
  { id: 'phenolphthalein', name: { ru: 'Фенолфталеин', en: 'Phenolphthalein' }, range: [8.2, 10], acid: '#FFFFFF00', base: '#E0218A' },
  { id: 'methylorange', name: { ru: 'Метиловый оранжевый', en: 'Methyl orange' }, range: [3.1, 4.4], acid: '#E5484D', base: '#F5C518' },
  { id: 'litmus', name: { ru: 'Лакмус', en: 'Litmus' }, range: [5, 8], acid: '#D64545', base: '#3A5BD9' },
  { id: 'bromothymol', name: { ru: 'Бромтимоловый синий', en: 'Bromothymol blue' }, range: [6, 7.6], acid: '#E8C61A', base: '#2B5FD9' },
  { id: 'universal', name: { ru: 'Универсальный', en: 'Universal' }, range: [1, 13], acid: '#E5484D', base: '#6B3FA0' },
];

const hex = (c: string) => [1, 3, 5, 7].map((i) => (i < c.length ? parseInt(c.slice(i, i + 2), 16) : 255));
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return x.map((v, i) => v + (y[i] - v) * t);
};

// universal indicator: red → orange → yellow → green → blue → violet
const UNIVERSAL: [number, string][] = [
  [1, '#E5484D'], [3, '#F76B15'], [5, '#F5C518'], [7, '#30A46C'], [9, '#2F7FD9'], [11, '#3A3FA8'], [13, '#6B3FA0'],
];

/** colour of the solution with this indicator, as rgba() */
export function solutionColor(ind: Indicator, ph: number): string {
  let rgba: number[];
  if (ind.id === 'universal') {
    const p = Math.max(1, Math.min(13, ph));
    let i = 0;
    while (i < UNIVERSAL.length - 2 && p > UNIVERSAL[i + 1][0]) i++;
    const [p0, c0] = UNIVERSAL[i];
    const [p1, c1] = UNIVERSAL[i + 1];
    rgba = [...mix(c0, c1, (p - p0) / (p1 - p0)).slice(0, 3), 200];
  } else {
    const mid = (ind.range[0] + ind.range[1]) / 2;
    const width = (ind.range[1] - ind.range[0]) / 4;
    const t = 1 / (1 + Math.exp(-(ph - mid) / width));
    rgba = mix(ind.acid, ind.base, t);
    rgba[3] = Math.max(rgba[3], 0);
  }
  return `rgba(${Math.round(rgba[0])},${Math.round(rgba[1])},${Math.round(rgba[2])},${(rgba[3] / 255) * 0.85})`;
}
