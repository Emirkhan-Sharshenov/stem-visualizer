/* Heat processes: every body is described by its enthalpy H (J, counted from ice at 0 °C for water,
   from 0 °C for metals). Temperature, phase and the heating curve all follow from H, so heating,
   melting, boiling and mixing with ice are one calculation. */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export const WATER = { cIce: 2100, cWater: 4200, cSteam: 2000, lambda: 3.3e5, L: 2.3e6 };

export type Kind = 'water' | 'Cu' | 'Fe' | 'Al' | 'Pb';
export const SUBST: Record<Kind, { name: T2; c: number; color: string; density: number }> = {
  water: { name: t('Вода / лёд', 'Water / ice'), c: WATER.cWater, color: '#5BA4E6', density: 1000 },
  Cu: { name: t('Медь', 'Copper'), c: 400, color: '#C8743C', density: 8900 },
  Fe: { name: t('Железо', 'Iron'), c: 460, color: '#7D8288', density: 7800 },
  Al: { name: t('Алюминий', 'Aluminium'), c: 920, color: '#C3C8CF', density: 2700 },
  Pb: { name: t('Свинец', 'Lead'), c: 130, color: '#6E7480', density: 11300 },
};

export interface Body {
  id: string;
  kind: Kind;
  m: number;
  H: number;
}

/** enthalpy of a body at temperature T; for water at 0 or 100 °C `frac` is the share already melted / boiled */
export function enthalpy(kind: Kind, m: number, T: number, frac = 0): number {
  if (kind !== 'water') return SUBST[kind].c * m * T;
  const { cIce, cWater, cSteam, lambda, L } = WATER;
  if (T < 0) return cIce * m * T;
  if (T === 0) return lambda * m * frac;
  if (T < 100) return lambda * m + cWater * m * T;
  if (T === 100) return lambda * m + cWater * m * 100 + L * m * frac;
  return lambda * m + cWater * m * 100 + L * m + cSteam * m * (T - 100);
}

export interface State {
  T: number;
  /** water only: share that is liquid / steam */
  ice: number;
  liquid: number;
  steam: number;
}

export function state(b: Body): State {
  const { kind, m, H } = b;
  if (kind !== 'water') return { T: H / (SUBST[kind].c * m), ice: 0, liquid: 0, steam: 0 };
  const { cIce, cWater, cSteam, lambda, L } = WATER;
  const melt = lambda * m;
  const hot = melt + cWater * m * 100;
  const boil = hot + L * m;
  if (H < 0) return { T: H / (cIce * m), ice: 1, liquid: 0, steam: 0 };
  if (H <= melt) return { T: 0, ice: 1 - H / melt, liquid: H / melt, steam: 0 };
  if (H < hot) return { T: (H - melt) / (cWater * m), ice: 0, liquid: 1, steam: 0 };
  if (H <= boil) return { T: 100, ice: 0, liquid: 1 - (H - hot) / (L * m), steam: (H - hot) / (L * m) };
  return { T: 100 + (H - boil) / (cSteam * m), ice: 0, liquid: 0, steam: 1 };
}

/** water at exactly 0 °C is ice unless `liquid`; at 100 °C it is liquid */
export const makeBody = (id: string, kind: Kind, m: number, T: number, liquid = false): Body => ({ id, kind, m, H: enthalpy(kind, m, T, T === 0 && liquid ? 1 : 0) });

/** thermal equilibrium of several bodies in an ideal calorimeter */
export function equilibrium(bodies: Body[]): { T: number; after: Body[] } {
  const H0 = bodies.reduce((s, b) => s + b.H, 0);
  const total = (T: number, frac: number) => bodies.reduce((s, b) => s + enthalpy(b.kind, b.m, T, frac), 0);
  // a plateau at 0 or 100 °C: some water partly melted / boiled
  for (const P of [0, 100]) {
    const lo = total(P, 0);
    const hi = total(P, 1);
    if (H0 >= lo && H0 <= hi && hi > lo) {
      const frac = (H0 - lo) / (hi - lo);
      return { T: P, after: bodies.map((b) => ({ ...b, H: enthalpy(b.kind, b.m, P, frac) })) };
    }
  }
  let a = -200;
  let z = 1500;
  for (let i = 0; i < 100; i++) {
    const mid = (a + z) / 2;
    if (total(mid, 0) < H0) a = mid;
    else z = mid;
  }
  const T = (a + z) / 2;
  return { T, after: bodies.map((b) => ({ ...b, H: enthalpy(b.kind, b.m, T) })) };
}

/** stages of heating a body from H0 to H1, with the textbook formula for each */
export interface Stage {
  name: T2;
  formula: string;
  Q: number;
}

export function stages(kind: Kind, m: number, H0: number, H1: number): Stage[] {
  const out: Stage[] = [];
  if (kind !== 'water') {
    const c = SUBST[kind].c;
    out.push({ name: H1 >= H0 ? t('нагревание', 'heating') : t('остывание', 'cooling'), formula: `Q = cmΔt = ${c}·${fmt(m)}·${fmt((H1 - H0) / (c * m))}`, Q: H1 - H0 });
    return out;
  }
  const { cIce, cWater, cSteam, lambda, L } = WATER;
  const bounds = [
    { lo: -Infinity, hi: 0, name: t('нагревание льда', 'heating ice'), f: (q: number) => `Q = c_льда·m·Δt = ${cIce}·${fmt(m)}·${fmt(q / (cIce * m))}` },
    { lo: 0, hi: lambda * m, name: t('плавление льда', 'melting'), f: (q: number) => `Q = λm = 3,3·10⁵·${fmt(q / lambda)}` },
    { lo: lambda * m, hi: lambda * m + cWater * m * 100, name: t('нагревание воды', 'heating water'), f: (q: number) => `Q = c_воды·m·Δt = ${cWater}·${fmt(m)}·${fmt(q / (cWater * m))}` },
    { lo: lambda * m + cWater * m * 100, hi: lambda * m + cWater * m * 100 + L * m, name: t('кипение', 'boiling'), f: (q: number) => `Q = Lm = 2,3·10⁶·${fmt(q / L)}` },
    { lo: lambda * m + cWater * m * 100 + L * m, hi: Infinity, name: t('нагревание пара', 'heating steam'), f: (q: number) => `Q = c_пара·m·Δt = ${cSteam}·${fmt(m)}·${fmt(q / (cSteam * m))}` },
  ];
  for (const s of bounds) {
    const a = Math.max(Math.min(H0, H1), s.lo);
    const b = Math.min(Math.max(H0, H1), s.hi);
    if (b - a > 1e-6) out.push({ name: s.name, formula: s.f(b - a), Q: (H1 > H0 ? 1 : -1) * (b - a) });
  }
  if (H1 > H0) return out;
  const back: Record<string, T2> = {
    'нагревание льда': t('охлаждение льда', 'cooling ice'),
    'плавление льда': t('кристаллизация (замерзание)', 'freezing'),
    'нагревание воды': t('охлаждение воды', 'cooling water'),
    кипение: t('конденсация пара', 'condensation'),
    'нагревание пара': t('охлаждение пара', 'cooling steam'),
  };
  return out.reverse().map((x) => ({ ...x, name: back[x.name.ru] ?? x.name }));
}

export const fmt = (x: number, d = 2) => {
  const r = Math.round(x * 10 ** d) / 10 ** d;
  return String(r).replace('.', ',');
};
export const fmtJ = (q: number) => {
  const a = Math.abs(q);
  if (a >= 1e6) return `${fmt(q / 1e6, 2)} МДж`;
  if (a >= 1e3) return `${fmt(q / 1e3, 1)} кДж`;
  return `${fmt(q, 0)} Дж`;
};
