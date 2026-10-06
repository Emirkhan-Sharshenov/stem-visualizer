/* VSEPR: electron domains around a central atom repel each other, which fixes the molecule's shape.
   Given a central atom, its ligands (with bond orders) and the charge, we count lone pairs,
   place every domain in 3D, squeeze bonds a little away from lone pairs, and read off the shape,
   bond angle, hybridisation and polarity. */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export type V3 = [number, number, number];

export const CENTRAL: Record<string, { valence: number; en: number; period: number }> = {
  Be: { valence: 2, en: 1.57, period: 2 },
  B: { valence: 3, en: 2.04, period: 2 },
  C: { valence: 4, en: 2.55, period: 2 },
  N: { valence: 5, en: 3.04, period: 2 },
  O: { valence: 6, en: 3.44, period: 2 },
  Si: { valence: 4, en: 1.9, period: 3 },
  P: { valence: 5, en: 2.19, period: 3 },
  S: { valence: 6, en: 2.58, period: 3 },
  Cl: { valence: 7, en: 3.16, period: 3 },
  Xe: { valence: 8, en: 2.6, period: 5 },
};

export interface LigandType {
  id: string;
  atom: string;
  order: number;
  label: string;
  en: number;
}
export const LIGANDS: LigandType[] = [
  { id: 'H', atom: 'H', order: 1, label: 'H', en: 2.2 },
  { id: 'F', atom: 'F', order: 1, label: 'F', en: 3.98 },
  { id: 'Cl', atom: 'Cl', order: 1, label: 'Cl', en: 3.16 },
  { id: 'Br', atom: 'Br', order: 1, label: 'Br', en: 2.96 },
  { id: 'O2', atom: 'O', order: 2, label: '=O', en: 3.44 },
  { id: 'S2', atom: 'S', order: 2, label: '=S', en: 2.58 },
  { id: 'N3', atom: 'N', order: 3, label: '≡N', en: 3.04 },
];
export const ligand = (id: string) => LIGANDS.find((l) => l.id === id)!;

const norm = (v: V3): V3 => {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** domain directions for each steric number, ordered so lone pairs take the right slots first */
function slots(sn: number, lp: number): V3[] {
  const deg = Math.PI / 180;
  switch (sn) {
    case 1:
      return [[1, 0, 0]];
    case 2:
      return [
        [1, 0, 0],
        [-1, 0, 0],
      ];
    case 3:
      // lone pair (if any) points up
      return [90, 210, 330].map((a) => [Math.cos(a * deg), Math.sin(a * deg), 0] as V3);
    case 4: {
      const s = Math.sqrt(8 / 9);
      return [[0, 1, 0] as V3, ...[90, 210, 330].map((a) => [s * Math.cos(a * deg), -1 / 3, s * Math.sin(a * deg)] as V3)];
    }
    case 5: {
      const eq = [0, 120, 240].map((a) => [Math.cos(a * deg), 0, Math.sin(a * deg)] as V3);
      const ax: V3[] = [
        [0, 1, 0],
        [0, -1, 0],
      ];
      // lone pairs go equatorial; with 3 lone pairs the axial pair is what stays bonded
      return [...eq, ...ax];
    }
    default: {
      const ax: V3[] = [
        [0, 1, 0],
        [0, -1, 0],
      ];
      const eq: V3[] = [
        [1, 0, 0],
        [0, 0, 1],
        [-1, 0, 0],
        [0, 0, -1],
      ];
      // one lone pair: up; two: up and down (square planar)
      return lp ? [...ax, ...eq] : [...ax, ...eq];
    }
  }
}

const SHAPES: Record<string, T2> = {
  '1,0': t('линейная', 'linear'),
  '2,0': t('линейная', 'linear'),
  '2,1': t('линейная', 'linear'),
  '3,0': t('плоская треугольная', 'trigonal planar'),
  '3,1': t('угловая', 'bent'),
  '4,0': t('тетраэдрическая', 'tetrahedral'),
  '4,1': t('тригональная пирамида', 'trigonal pyramidal'),
  '4,2': t('угловая', 'bent'),
  '4,3': t('линейная', 'linear'),
  '5,0': t('тригональная бипирамида', 'trigonal bipyramidal'),
  '5,1': t('«качели» (искажённый тетраэдр)', 'see-saw'),
  '5,2': t('T-образная', 'T-shaped'),
  '5,3': t('линейная', 'linear'),
  '6,0': t('октаэдрическая', 'octahedral'),
  '6,1': t('квадратная пирамида', 'square pyramidal'),
  '6,2': t('плоский квадрат', 'square planar'),
};
const HYBRID: Record<number, string> = { 1: 's', 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²' };

export const KNOWN: Record<string, T2> = {
  'O|H,H': t('вода', 'water'),
  'N|H,H,H': t('аммиак', 'ammonia'),
  'C|H,H,H,H': t('метан', 'methane'),
  'C|O2,O2': t('углекислый газ', 'carbon dioxide'),
  'B|F,F,F': t('трифторид бора', 'boron trifluoride'),
  'Be|Cl,Cl': t('хлорид бериллия', 'beryllium chloride'),
  'S|H,H': t('сероводород', 'hydrogen sulfide'),
  'P|H,H,H': t('фосфин', 'phosphine'),
  'C|Cl,Cl,Cl,Cl': t('тетрахлорметан', 'carbon tetrachloride'),
  'S|O2,O2': t('сернистый газ', 'sulfur dioxide'),
  'S|O2,O2,O2': t('серный ангидрид', 'sulfur trioxide'),
  'P|Cl,Cl,Cl,Cl,Cl': t('пентахлорид фосфора', 'phosphorus pentachloride'),
  'S|F,F,F,F,F,F': t('гексафторид серы', 'sulfur hexafluoride'),
  'Xe|F,F,F,F': t('тетрафторид ксенона', 'xenon tetrafluoride'),
  'Xe|F,F': t('дифторид ксенона', 'xenon difluoride'),
  'S|F,F,F,F': t('тетрафторид серы', 'sulfur tetrafluoride'),
  'Cl|F,F,F': t('трифторид хлора', 'chlorine trifluoride'),
  'C|H,N3': t('синильная кислота', 'hydrogen cyanide'),
  'C|H,H,O2': t('формальдегид', 'formaldehyde'),
  'Si|H,H,H,H': t('силан', 'silane'),
  'N|H,H,H,H': t('ион аммония', 'ammonium ion'),
  'O|H,H,H': t('ион гидроксония', 'hydronium ion'),
  'C|O2,S2': t('сероокись углерода', 'carbonyl sulfide'),
  'C|S2,S2': t('сероуглерод', 'carbon disulfide'),
};

export interface Result {
  ok: boolean;
  error?: T2;
  lonePairs: number;
  radical: boolean;
  sn: number;
  shape: T2 | null;
  hybrid: string;
  /** bonded directions (unit vectors) in the order of the ligands */
  bonds: V3[];
  lps: V3[];
  angle: number | null;
  dipole: V3;
  polar: boolean;
  formula: string;
  name: T2 | null;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => (n > 1 ? String(n).replace(/\d/g, (d) => SUB[+d]) : '');

export function analyse(center: string, ligs: string[], charge: number): Result {
  const c = CENTRAL[center];
  const used = ligs.reduce((s, id) => s + ligand(id).order, 0);
  const free = c.valence - used - charge;
  const lonePairs = Math.max(0, Math.floor(free / 2));
  const radical = free > 0 && free % 2 === 1;
  // an unpaired electron also takes up a direction (NO₂ is bent)
  const lpDomains = lonePairs + (radical ? 1 : 0);
  const sn = ligs.length + lpDomains;
  const pairs = used + lonePairs;
  const sorted = [...ligs].sort();
  const counts = new Map<string, number>();
  for (const id of ligs) counts.set(ligand(id).atom, (counts.get(ligand(id).atom) ?? 0) + 1);
  const hFirst = (center === 'O' || center === 'S') && counts.has('H') && counts.size === 1;
  const formula = (hFirst ? `H${sub(counts.get('H')!)}${center}` : center + [...counts].map(([a, n]) => a + sub(n)).join('')) + (charge ? (charge > 0 ? '⁺' : '⁻') : '');
  const special: Record<string, string> = { 'C|H,N3': 'HCN', 'C|H,H,O2': 'H₂CO' };
  const name = KNOWN[`${center}|${sorted.join(',')}`] ?? null;
  const base: Result = { ok: false, lonePairs, radical, sn, shape: null, hybrid: '', bonds: [], lps: [], angle: null, dipole: [0, 0, 0], polar: false, formula: special[`${center}|${sorted.join(',')}`] ?? formula, name };

  if (!ligs.length) return { ...base, error: t('Добавь к центральному атому хотя бы один атом.', 'Attach at least one atom to the centre.') };
  if (free < 0) return { ...base, error: t(`У ${center} не хватает валентных электронов на столько связей (их ${c.valence}${charge ? `, заряд ${charge > 0 ? '+' : ''}${charge}` : ''}).`, `${center} doesn’t have enough valence electrons for that many bonds (${c.valence}).`) };
  if (c.period === 2 && pairs + (radical ? 1 : 0) > 4) return { ...base, error: t(`Элементы 2-го периода не могут иметь больше 8 электронов (октет): у ${center} получается ${pairs * 2 + (radical ? 1 : 0)}. Попробуй задать заряд.`, `Period-2 atoms can’t exceed an octet: ${center} would have ${pairs * 2 + (radical ? 1 : 0)} electrons. Try setting a charge.`) };
  if (sn > 6) return { ...base, error: t('Больше шести электронных пар вокруг атома не бывает.', 'More than six electron domains is not possible.') };

  // place lone pairs first in their preferred slots, then the ligands
  const sl = slots(sn, lpDomains);
  const lps = sl.slice(0, lpDomains);
  let bonds = sl.slice(lpDomains);
  // lone pairs repel more strongly: squeeze bonds away from them
  // squeeze strength tuned to textbook angles (NH₃ 107°, H₂O 104.5°)
  const k = sn === 3 ? 0.02 : 0.045;
  if (lpDomains && sn >= 3)
    bonds = bonds.map((b) => {
      let v: V3 = [...b];
      for (const lp of lps) v = [v[0] - lp[0] * k, v[1] - lp[1] * k, v[2] - lp[2] * k];
      return norm(v);
    });
  let angle: number | null = null;
  if (bonds.length >= 2) {
    // the smallest angle between bonds is the one textbooks quote
    let best = 180;
    for (let i = 0; i < bonds.length; i++) for (let j = i + 1; j < bonds.length; j++) best = Math.min(best, (Math.acos(Math.max(-1, Math.min(1, dot(bonds[i], bonds[j])))) * 180) / Math.PI);
    angle = best;
  }
  // dipole: bond dipoles towards the more electronegative atom, plus lone pairs
  let d: V3 = [0, 0, 0];
  ligs.forEach((id, i) => {
    const k = ligand(id).en - c.en;
    d = [d[0] + bonds[i][0] * k, d[1] + bonds[i][1] * k, d[2] + bonds[i][2] * k];
  });
  for (const lp of lps) d = [d[0] + lp[0] * 0.6, d[1] + lp[1] * 0.6, d[2] + lp[2] * 0.6];
  const polar = Math.hypot(...d) > 0.12;
  return { ...base, ok: true, shape: SHAPES[`${sn},${lpDomains}`] ?? null, hybrid: HYBRID[sn], bonds, lps, angle, dipole: d, polar };
}

export const PRESETS: { center: string; ligs: string[]; charge?: number }[] = [
  { center: 'O', ligs: ['H', 'H'] },
  { center: 'N', ligs: ['H', 'H', 'H'] },
  { center: 'C', ligs: ['H', 'H', 'H', 'H'] },
  { center: 'C', ligs: ['O2', 'O2'] },
  { center: 'B', ligs: ['F', 'F', 'F'] },
  { center: 'Be', ligs: ['Cl', 'Cl'] },
  { center: 'C', ligs: ['H', 'N3'] },
  { center: 'C', ligs: ['H', 'H', 'O2'] },
  { center: 'S', ligs: ['O2', 'O2'] },
  { center: 'P', ligs: ['Cl', 'Cl', 'Cl', 'Cl', 'Cl'] },
  { center: 'S', ligs: ['F', 'F', 'F', 'F'] },
  { center: 'Cl', ligs: ['F', 'F', 'F'] },
  { center: 'S', ligs: ['F', 'F', 'F', 'F', 'F', 'F'] },
  { center: 'Xe', ligs: ['F', 'F', 'F', 'F'] },
  { center: 'Xe', ligs: ['F', 'F'] },
  { center: 'N', ligs: ['H', 'H', 'H', 'H'], charge: 1 },
];
