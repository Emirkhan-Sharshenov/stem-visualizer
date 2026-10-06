import { ACTIVITY, HYDROLYSIS, INSOLUBLE, IONS, METAL_ION, reagent, Reagent, Solid } from './data';

/* A beaker of aqueous chemistry: ions in solution, solids at the bottom, gases leaving.
   Reactions run by school rules (neutralisation, ion exchange with precipitate / gas / water,
   metals with acids and salts by the activity series, amphoteric hydroxides, basic oxides),
   and every reaction is written as a balanced molecular and net ionic equation. */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

/** one pour: 10 mL of a 0.5 M solution, or a 0.005 mol piece of a solid */
export const PORTION = 0.005;
export const POUR_ML = 10;
export const MAX_ML = 200;

export interface Beaker {
  ml: number;
  /** ions in solution, mol */
  ions: Record<string, number>;
  /** the compound each ion came from and its partner ion (for writing molecular equations) */
  from: Record<string, { f: string; p: string | null }>;
  /** precipitates: formula → mol */
  solids: Record<string, { mol: number; info: Solid }>;
  /** undissolved metals and oxides: id → mol */
  pieces: Record<string, number>;
  /** metal deposited on other metals (Cu on iron etc.) */
  coated: Record<string, string>;
  tempC: number;
  indicator: Reagent['indicator'] | null;
  /** gas being given off right now: formula → intensity (decays) */
  gas: Record<string, number>;
  log: Entry[];
}

export interface Entry {
  id: number;
  text: T2;
  molecular?: string;
  ionic?: string;
  tone?: 'react' | 'info' | 'warn';
}

export const empty = (): Beaker => ({ ml: 0, ions: {}, from: {}, solids: {}, pieces: {}, coated: {}, tempC: 20, indicator: null, gas: {}, log: [] });

let logId = 1;
const note = (b: Beaker, e: Omit<Entry, 'id'>) => b.log.unshift({ id: logId++, ...e });

/* ---------- formulas ---------- */

const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const pretty = (f: string) => f.replace(/\d/g, (d) => SUB[+d]);
const supCharge = (c: number) => {
  const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '+': '⁺', '-': '⁻' };
  const s = `${Math.abs(c) === 1 ? '' : Math.abs(c)}${c > 0 ? '+' : '-'}`;
  return s.replace(/./g, (ch) => map[ch] ?? ch);
};
export const ionText = (id: string) => {
  const ion = IONS[id];
  return pretty(ion.f) + supCharge(ion.charge);
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** neutral formula from a cation and an anion, e.g. Fe³⁺ + SO₄²⁻ → Fe2(SO4)3 */
export function saltFormula(cat: string, an: string) {
  const c = IONS[cat];
  const a = IONS[an];
  if (cat === 'H+' && an === 'OH-') return 'H2O';
  const g = gcd(c.charge, -a.charge);
  const nc = -a.charge / g;
  const na = c.charge / g;
  const part = (ion: typeof c, n: number) => (n === 1 ? ion.f : ion.poly ? `(${ion.f})${n}` : `${ion.f}${n}`);
  // complex anions are written after the cation as they are: Na[Al(OH)4]
  return part(c, nc) + part(a, na);
}

/** element counts of a formula like Ca3(PO4)2 or Na[Al(OH)4] */
export function atoms(formula: string): Record<string, number> {
  const out: Record<string, number> = {};
  const stack: Record<string, number>[] = [out];
  const re = /([A-Z][a-z]?)(\d*)|([([])|([)\]])(\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formula))) {
    if (m[1]) {
      const top = stack[stack.length - 1];
      top[m[1]] = (top[m[1]] ?? 0) + (m[2] ? +m[2] : 1);
    } else if (m[3]) stack.push({});
    else if (m[4]) {
      const inner = stack.pop()!;
      const k = m[5] ? +m[5] : 1;
      const top = stack[stack.length - 1];
      for (const [el, n] of Object.entries(inner)) top[el] = (top[el] ?? 0) + n * k;
    }
  }
  return out;
}

/** smallest whole coefficients that balance the atoms (brute force, fine for school reactions) */
export function balance(left: string[], right: string[]): number[] | null {
  const species = [...left, ...right];
  const counts = species.map(atoms);
  const els = [...new Set(counts.flatMap((c) => Object.keys(c)))];
  const n = species.length;
  const k = new Array(n).fill(1);
  const max = 8;
  const ok = () => els.every((e) => left.reduce((s, _, i) => s + k[i] * (counts[i][e] ?? 0), 0) === right.reduce((s, _, j) => s + k[left.length + j] * (counts[left.length + j][e] ?? 0), 0));
  const rec = (i: number): boolean => {
    if (i === n) return ok();
    for (let c = 1; c <= max; c++) {
      k[i] = c;
      if (rec(i + 1)) return true;
    }
    return false;
  };
  return rec(0) ? [...k] : null;
}

export function equation(left: string[], right: string[], marks: Record<string, string> = {}) {
  const k = balance(left, right);
  const side = (fs: string[], off: number) => fs.map((f, i) => `${k && k[off + i] > 1 ? k[off + i] : ''}${pretty(f)}${marks[f] ?? ''}`).join(' + ');
  return `${side(left, 0)} → ${side(right, left.length)}`;
}

/* ---------- helpers ---------- */

const amt = (b: Beaker, id: string) => b.ions[id] ?? 0;
const take = (b: Beaker, id: string, n: number) => {
  b.ions[id] = Math.max(0, amt(b, id) - n);
  if (b.ions[id] < 1e-9) delete b.ions[id];
};
const give = (b: Beaker, id: string, n: number, f?: string, p?: string | null) => {
  b.ions[id] = amt(b, id) + n;
  if (f) b.from[id] = { f, p: p ?? null };
};
/** add a dissolved salt made of two ions, remembering where both came from */
const giveSalt = (b: Beaker, cat: string, nCat: number, an: string, nAn = 0) => {
  const f = saltFormula(cat, an);
  give(b, cat, nCat, f, an);
  if (nAn) give(b, an, nAn, f, cat);
};
const heat = (b: Beaker, joules: number) => {
  const kg = Math.max(0.005, b.ml / 1000);
  b.tempC += joules / (kg * 4200);
};
const srcFormula = (b: Beaker, ion: string, fallback: string) => b.from[ion]?.f ?? fallback;
/** the other ion in the same source compound, e.g. NO3⁻ for Ag⁺ from AgNO3 */
const partner = (b: Beaker, ion: string): string | null => b.from[ion]?.p ?? null;

const ACID_SOLUBLE = /OH|CO3|PO4|^FeS$|^ZnS$|O$/;
const acidSoluble = (f: string) => ACID_SOLUBLE.test(f) && !['CuS', 'PbS', 'Ag2S'].includes(f);

export function pH(b: Beaker): number {
  if (b.ml <= 0) return 7;
  const L = b.ml / 1000;
  const h = amt(b, 'H+');
  const oh = amt(b, 'OH-');
  if (h > 1e-7) return Math.max(0, -Math.log10(h / L));
  if (oh > 1e-7) return Math.min(14, 14 + Math.log10(oh / L));
  // salt solutions: hydrolysis pushes pH away from 7
  let p = 7;
  for (const [ion, v] of Object.entries(HYDROLYSIS)) if (amt(b, ion) > 1e-7) p = v > 7 ? Math.max(p, v) : Math.min(p, v);
  return p;
}

/* ---------- reactions ---------- */

function react(b: Beaker) {
  for (let guard = 0; guard < 30; guard++) {
    let changed = false;

    // 1. neutralisation H⁺ + OH⁻ → H₂O
    const n = Math.min(amt(b, 'H+'), amt(b, 'OH-'));
    if (n > 1e-9) {
      const acid = srcFormula(b, 'H+', 'HCl');
      const base = srcFormula(b, 'OH-', 'NaOH');
      const an = partner(b, 'H+') ?? 'Cl-';
      const cat = partner(b, 'OH-') ?? 'Na+';
      take(b, 'H+', n);
      take(b, 'OH-', n);
      heat(b, n * 57000);
      note(b, {
        tone: 'react',
        text: t('Нейтрализация: кислота и щёлочь превращаются в соль и воду, раствор нагревается.', 'Neutralisation: acid and alkali turn into salt and water; the solution warms up.'),
        molecular: equation([acid, base], [saltFormula(cat, an), 'H2O']),
        ionic: `${ionText('H+')} + ${ionText('OH-')} → H₂O`,
      });
      changed = true;
    }

    // 2. gases from ion exchange
    const co3 = amt(b, 'CO3 2-');
    if (co3 > 1e-9 && amt(b, 'H+') > 1e-9) {
      const k = Math.min(co3, amt(b, 'H+') / 2);
      const salt = srcFormula(b, 'CO3 2-', 'Na2CO3');
      const acid = srcFormula(b, 'H+', 'HCl');
      const cat = partner(b, 'CO3 2-') ?? 'Na+';
      const an = partner(b, 'H+') ?? 'Cl-';
      take(b, 'CO3 2-', k);
      take(b, 'H+', 2 * k);
      b.gas.CO2 = (b.gas.CO2 ?? 0) + k * 400;
      note(b, {
        tone: 'react',
        text: t('Бурно выделяется газ без цвета и запаха — углекислый газ CO₂ (качественная реакция на карбонаты).', 'A colourless, odourless gas fizzes out: carbon dioxide (the test for carbonates).'),
        molecular: equation([salt, acid], [saltFormula(cat, an), 'H2O', 'CO2'], { CO2: '↑' }),
        ionic: `${ionText('CO3 2-')} + 2${ionText('H+')} → H₂O + CO₂↑`,
      });
      changed = true;
    }
    const s2 = amt(b, 'S2-');
    if (s2 > 1e-9 && amt(b, 'H+') > 1e-9) {
      const k = Math.min(s2, amt(b, 'H+') / 2);
      take(b, 'S2-', k);
      take(b, 'H+', 2 * k);
      b.gas.H2S = (b.gas.H2S ?? 0) + k * 400;
      note(b, {
        tone: 'react',
        text: t('Выделяется сероводород H₂S — газ с запахом тухлых яиц.', 'Hydrogen sulfide is released: it smells of rotten eggs.'),
        molecular: equation([srcFormula(b, 'S2-', 'Na2S'), srcFormula(b, 'H+', 'HCl')], [saltFormula(partner(b, 'S2-') ?? 'Na+', partner(b, 'H+') ?? 'Cl-'), 'H2S'], { H2S: '↑' }),
        ionic: `${ionText('S2-')} + 2${ionText('H+')} → H₂S↑`,
      });
      changed = true;
    }
    const nh4 = amt(b, 'NH4+');
    if (nh4 > 1e-9 && amt(b, 'OH-') > 1e-9) {
      const k = Math.min(nh4, amt(b, 'OH-'));
      take(b, 'NH4+', k);
      take(b, 'OH-', k);
      b.gas.NH3 = (b.gas.NH3 ?? 0) + k * 300;
      note(b, {
        tone: 'react',
        text: t('Выделяется аммиак NH₃ — газ с резким запахом нашатыря (качественная реакция на ион аммония).', 'Ammonia is given off, with a sharp smell (the test for the ammonium ion).'),
        molecular: equation([srcFormula(b, 'NH4+', 'NH4Cl'), srcFormula(b, 'OH-', 'NaOH')], [saltFormula(partner(b, 'OH-') ?? 'Na+', partner(b, 'NH4+') ?? 'Cl-'), 'NH3', 'H2O'], { NH3: '↑' }),
        ionic: `${ionText('NH4+')} + ${ionText('OH-')} → NH₃↑ + H₂O`,
      });
      changed = true;
    }

    // 3. precipitates (only those that survive the acidity of the solution)
    const acidic = amt(b, 'H+') > 1e-9;
    for (const [key, solid] of Object.entries(INSOLUBLE)) {
      const [cat, an] = key.split('|');
      const c = IONS[cat];
      const a = IONS[an];
      if (acidic && acidSoluble(solid.formula)) continue;
      const g = gcd(c.charge, -a.charge);
      const nc = -a.charge / g;
      const na = c.charge / g;
      const units = Math.min(amt(b, cat) / nc, amt(b, an) / na);
      if (units < 1e-9) continue;
      // Ag₂O forms as 2Ag⁺ + 2OH⁻ → Ag₂O + H₂O
      const pc = partner(b, cat);
      const pa = partner(b, an);
      const r1 = srcFormula(b, cat, saltFormula(cat, 'NO3-'));
      const r2 = srcFormula(b, an, saltFormula('Na+', an));
      take(b, cat, units * nc);
      take(b, an, units * na);
      const cur = b.solids[solid.formula];
      b.solids[solid.formula] = { mol: (cur?.mol ?? 0) + units, info: solid };
      const products = solid.formula === 'Ag2O' ? ['Ag2O', 'H2O'] : [solid.formula];
      if (pc && pa) products.push(saltFormula(pa, pc));
      note(b, {
        tone: 'react',
        text: t(`Выпадает ${solid.look.ru}: ${solid.name.ru} ${pretty(solid.formula)}.`, `A ${solid.look.en} forms: ${solid.name.en}, ${pretty(solid.formula)}.`),
        molecular: r1 === r2 ? undefined : equation([r1, r2], products, { [solid.formula]: '↓' }),
        ionic: solid.formula === 'Ag2O' ? `2${ionText('Ag+')} + 2${ionText('OH-')} → Ag₂O↓ + H₂O` : `${nc > 1 ? nc : ''}${ionText(cat)} + ${na > 1 ? na : ''}${ionText(an)} → ${pretty(solid.formula)}↓`,
      });
      changed = true;
    }

    // 4. acids dissolve hydroxides, carbonates, basic oxides
    for (const [f, s] of Object.entries(b.solids)) {
      if (!acidSoluble(f) || amt(b, 'H+') < 1e-9) continue;
      const cat = Object.keys(IONS).find((k) => INSOLUBLE[`${k}|OH-`]?.formula === f || INSOLUBLE[`${k}|CO3 2-`]?.formula === f || INSOLUBLE[`${k}|PO4 3-`]?.formula === f || INSOLUBLE[`${k}|S2-`]?.formula === f);
      if (!cat) continue;
      const anion = f.includes('CO3') ? 'CO3 2-' : f.includes('PO4') ? 'PO4 3-' : f.endsWith('S') ? 'S2-' : 'OH-';
      const c = IONS[cat];
      const a = IONS[anion];
      const g = gcd(c.charge, -a.charge);
      const nc = -a.charge / g;
      const na = c.charge / g;
      const hPer = anion === 'OH-' ? na : anion === 'CO3 2-' ? 2 * na : anion === 'S2-' ? 2 * na : 3 * na;
      const units = Math.min(s.mol, amt(b, 'H+') / hPer);
      if (units < 1e-9) continue;
      s.mol -= units;
      if (s.mol < 1e-9) delete b.solids[f];
      take(b, 'H+', units * hPer);
      giveSalt(b, cat, units * nc, partner(b, 'H+') ?? 'Cl-');
      if (anion === 'CO3 2-') b.gas.CO2 = (b.gas.CO2 ?? 0) + units * 400;
      if (anion === 'S2-') b.gas.H2S = (b.gas.H2S ?? 0) + units * 400;
      const acid = srcFormula(b, 'H+', 'HCl');
      const an = partner(b, 'H+') ?? 'Cl-';
      const right = [saltFormula(cat, an), ...(anion === 'OH-' ? ['H2O'] : anion === 'CO3 2-' ? ['H2O', 'CO2'] : anion === 'S2-' ? ['H2S'] : ['H3PO4'])];
      note(b, {
        tone: 'react',
        text: t(`Осадок ${pretty(f)} растворяется в кислоте${anion === 'CO3 2-' ? ', выделяется CO₂' : ''}.`, `The ${pretty(f)} precipitate dissolves in the acid${anion === 'CO3 2-' ? ', giving off CO₂' : ''}.`),
        molecular: equation([f, acid], right, { CO2: '↑', H2S: '↑' }),
      });
      changed = true;
    }

    // 5. amphoteric hydroxides dissolve in excess alkali
    for (const [f, cat, complex, k] of [
      ['Al(OH)3', 'Al3+', 'AlO2-', 1],
      ['Zn(OH)2', 'Zn2+', 'ZnO2 2-', 2],
    ] as const) {
      const s = b.solids[f];
      if (!s || amt(b, 'OH-') < 1e-9) continue;
      const units = Math.min(s.mol, amt(b, 'OH-') / k);
      s.mol -= units;
      if (s.mol < 1e-9) delete b.solids[f];
      const base = srcFormula(b, 'OH-', 'NaOH');
      const bc = partner(b, 'OH-') ?? 'Na+';
      take(b, 'OH-', units * k);
      give(b, complex, units, saltFormula(bc, complex), bc);
      note(b, {
        tone: 'react',
        text: t(`Осадок ${pretty(f)} растворился в избытке щёлочи — гидроксид ${cat === 'Al3+' ? 'алюминия' : 'цинка'} амфотерный.`, `${pretty(f)} dissolves in excess alkali: the hydroxide is amphoteric.`),
        molecular: equation([f, base], [saltFormula(bc, complex)]),
        ionic: `${pretty(f)} + ${k > 1 ? k : ''}${ionText('OH-')} → ${ionText(complex)}`,
      });
      changed = true;
    }

    // 6. metals: with water (Na), with acids (above H), with salts of less active metals
    for (const [id, mol] of Object.entries(b.pieces)) {
      const r = reagent(id);
      if (r.kind !== 'metal' || mol < 1e-9) continue;
      const m = r.metal!;
      const ion = METAL_ION[m];
      const z = IONS[ion].charge;
      const rank = ACTIVITY.indexOf(m);
      if (m === 'Na' && b.ml > 0) {
        b.pieces[id] = 0;
        give(b, 'Na+', mol, 'NaOH', 'OH-');
        give(b, 'OH-', mol, 'NaOH', 'Na+');
        b.gas.H2 = (b.gas.H2 ?? 0) + mol * 500;
        heat(b, mol * 184000);
        note(b, {
          tone: 'react',
          text: t('Натрий бегает по воде, шипит и растворяется: образуется щёлочь и водород. Реакция идёт с выделением тепла.', 'Sodium darts across the water, fizzing away: alkali and hydrogen form, with a lot of heat.'),
          molecular: equation(['Na', 'H2O'], ['NaOH', 'H2'], { H2: '↑' }),
        });
        changed = true;
        continue;
      }
      const h = amt(b, 'H+');
      if (h > 1e-9 && rank < ACTIVITY.indexOf('H')) {
        const nitric = amt(b, 'NO3-') > 1e-9;
        const units = Math.min(mol, h / z);
        b.pieces[id] = mol - units;
        const acid = srcFormula(b, 'H+', 'HCl');
        const an = partner(b, 'H+') ?? 'Cl-';
        take(b, 'H+', units * z);
        giveSalt(b, ion, units, an);
        heat(b, units * 150000);
        if (nitric) {
          b.gas.NO = (b.gas.NO ?? 0) + units * 300;
          note(b, {
            tone: 'react',
            text: t(`${r.name.ru} растворяется в азотной кислоте, но водород не выделяется: азотная кислота даёт оксиды азота.`, `${r.name.en} dissolves in nitric acid, but no hydrogen forms: nitric acid gives nitrogen oxides instead.`),
          });
        } else {
          b.gas.H2 = (b.gas.H2 ?? 0) + units * 400;
          note(b, {
            tone: 'react',
            text: t(`${r.name.ru} стоит в ряду активности левее водорода — вытесняет его из кислоты, выделяются пузырьки H₂.`, `${r.name.en} is above hydrogen in the activity series, so it pushes hydrogen out of the acid.`),
            molecular: equation([m, acid], [saltFormula(ion, an), 'H2'], { H2: '↑' }),
            ionic: `${m} + ${z > 1 ? z : ''}${ionText('H+')} → ${ionText(ion)} + H₂↑`,
          });
        }
        changed = true;
        continue;
      }
      if (h > 1e-9 && m === 'Cu' && amt(b, 'NO3-') > 1e-9) {
        const units = Math.min(mol, h / 4);
        b.pieces[id] = mol - units;
        take(b, 'H+', units * 4);
        giveSalt(b, 'Cu2+', units, 'NO3-');
        b.gas.NO2 = (b.gas.NO2 ?? 0) + units * 600;
        note(b, {
          tone: 'react',
          text: t('Медь не вытесняет водород, но азотная кислота её окисляет: раствор синеет, выделяется бурый газ NO₂.', 'Copper can’t push out hydrogen, but nitric acid oxidises it: the solution turns blue and brown NO₂ comes off.'),
          molecular: equation(['Cu', 'HNO3'], ['Cu(NO3)2', 'NO2', 'H2O'], { NO2: '↑' }),
        });
        changed = true;
        continue;
      }
      // displacement from salts: a more active metal pushes out a less active one
      for (const other of ACTIVITY.slice(rank + 1)) {
        if (other === 'H') continue;
        const oion = METAL_ION[other];
        if (amt(b, oion) < 1e-9 || b.pieces[id] < 1e-9) continue;
        const oz = IONS[oion].charge;
        const units = Math.min(b.pieces[id], (amt(b, oion) * oz) / z);
        const salt = srcFormula(b, oion, saltFormula(oion, 'SO4 2-'));
        const an = partner(b, oion) ?? 'SO4 2-';
        b.pieces[id] -= units;
        take(b, oion, (units * z) / oz);
        giveSalt(b, ion, units, an);
        b.coated[id] = other;
        note(b, {
          tone: 'react',
          text: t(`${r.name.ru} активнее, чем ${other}: на металле оседает ${other === 'Cu' ? 'красная медь' : other === 'Ag' ? 'серебро' : other}, а ${r.name.ru.toLowerCase()} переходит в раствор.`, `${r.name.en} is more active than ${other}: ${other} coats the metal while ${r.name.en.toLowerCase()} goes into solution.`),
          molecular: equation([m, salt], [saltFormula(ion, an), other]),
          ionic: `${m} + ${ionText(oion)} → ${ionText(ion)} + ${other}`,
        });
        changed = true;
      }
    }

    // 7. oxides: CaO with water; basic oxides with acids
    for (const [id, mol] of Object.entries(b.pieces)) {
      const r = reagent(id);
      if (r.kind !== 'oxide' || mol < 1e-9) continue;
      const o = r.oxide!;
      if (id === 'CaO' && b.ml > 0) {
        b.pieces[id] = 0;
        give(b, 'Ca2+', mol, 'Ca(OH)2', 'OH-');
        give(b, 'OH-', mol * 2, 'Ca(OH)2', 'Ca2+');
        heat(b, mol * 65000);
        note(b, { tone: 'react', text: t('Негашёная известь CaO бурно реагирует с водой: получается гашёная известь Ca(OH)₂ (щёлочь), раствор греется.', 'Quicklime reacts vigorously with water, making slaked lime, an alkali; the solution heats up.'), molecular: equation(['CaO', 'H2O'], ['Ca(OH)2']) });
        changed = true;
        continue;
      }
      const h = amt(b, 'H+');
      if (h < 1e-9) continue;
      const hPer = 2 * o.o;
      const units = Math.min(mol, h / hPer);
      b.pieces[id] = mol - units;
      const acid = srcFormula(b, 'H+', 'HCl');
      const an = partner(b, 'H+') ?? 'Cl-';
      take(b, 'H+', units * hPer);
      giveSalt(b, o.ion, units * o.m, an);
      note(b, {
        tone: 'react',
        text: t(`Основный оксид ${pretty(r.formula)} растворяется в кислоте — получаются соль и вода.`, `The basic oxide ${pretty(r.formula)} dissolves in the acid, giving salt and water.`),
        molecular: equation([r.formula, acid], [saltFormula(o.ion, an), 'H2O']),
      });
      changed = true;
    }

    if (!changed) break;
  }
  for (const [k, v] of Object.entries(b.pieces)) if (v < 1e-9) delete b.pieces[k];
}

/* ---------- user actions ---------- */

export function pour(prev: Beaker, id: string): Beaker {
  const b: Beaker = JSON.parse(JSON.stringify(prev));
  const r = reagent(id);
  const before = pH(b);
  if (r.kind === 'indicator') {
    b.indicator = r.indicator!;
    note(b, { tone: 'info', text: t(`Добавлено несколько капель: ${r.name.ru.toLowerCase()}.`, `A few drops of ${r.name.en.toLowerCase()} added.`) });
    if (b.ml === 0) note(b, { tone: 'warn', text: t('Стакан пустой — налей раствор, чтобы индикатор что-то показал.', 'The beaker is empty: pour a solution in so the indicator shows something.') });
    return b;
  }
  if (r.kind === 'metal' || r.kind === 'oxide') {
    b.pieces[id] = (b.pieces[id] ?? 0) + PORTION;
    note(b, { tone: 'info', text: t(`В стакан положили: ${r.name.ru.toLowerCase()} (${pretty(r.formula)}).`, `Added ${r.name.en.toLowerCase()} (${pretty(r.formula)}).`) });
    if (b.ml === 0) note(b, { tone: 'warn', text: t('Сухое вещество само не реагирует — добавь воду или раствор.', 'A dry solid won’t react on its own: add water or a solution.') });
  } else {
    if (b.ml + POUR_ML > MAX_ML) {
      note(b, { tone: 'warn', text: t('Стакан полон. Вылей его, чтобы начать заново.', 'The beaker is full. Empty it to start again.') });
      return b;
    }
    // mixing cools/warms towards the poured liquid (at 20 °C)
    b.tempC = (b.tempC * b.ml + 20 * POUR_ML) / (b.ml + POUR_ML);
    b.ml += POUR_ML;
    for (const [ion, k] of r.ions ?? []) give(b, ion, PORTION * k, r.formula, r.ions!.find(([i]) => i !== ion)?.[0] ?? null);
    note(b, { tone: 'info', text: t(`Налито ${POUR_ML} мл: ${r.name.ru.toLowerCase()} ${pretty(r.formula)}.`, `Poured ${POUR_ML} mL of ${r.name.en.toLowerCase()} ${pretty(r.formula)}.`) });
  }
  const logBefore = b.log.length;
  react(b);
  if (b.log.length === logBefore && r.kind !== 'water' && Object.keys(b.ions).length > 2 && r.kind !== 'metal' && r.kind !== 'oxide') {
    note(b, { tone: 'info', text: t('Видимых изменений нет: ни осадка, ни газа, ни воды не образуется — реакция ионного обмена не идёт.', 'Nothing visible happens: no precipitate, gas or water forms, so there is no ion-exchange reaction.') });
  }
  if (r.kind === 'metal' && b.log.length === logBefore && b.ml > 0) {
    note(b, { tone: 'info', text: t(`${r.name.ru} не реагирует: в растворе нет ни кислоты, ни солей менее активных металлов.`, `${r.name.en} does not react: there is no acid and no salt of a less active metal.`) });
  }
  const after = pH(b);
  if (b.indicator && Math.abs(after - before) > 1) note(b, { tone: 'info', text: t(`pH изменился: ${before.toFixed(1)} → ${after.toFixed(1)}.`, `pH changed: ${before.toFixed(1)} → ${after.toFixed(1)}.`) });
  return b;
}

/** let gases fade and the beaker cool down; returns a new object only if something changed */
export function tick(b: Beaker, dt: number): Beaker {
  const gasOn = Object.values(b.gas).some((g) => g > 0.01);
  const hot = Math.abs(b.tempC - 20) > 0.05;
  if (!gasOn && !hot) return b;
  const gas: Record<string, number> = {};
  for (const [k, g] of Object.entries(b.gas)) if (g * Math.exp(-dt * 0.6) > 0.01) gas[k] = g * Math.exp(-dt * 0.6);
  return { ...b, gas, tempC: 20 + (b.tempC - 20) * Math.exp(-dt / 90) };
}

export function liquidColor(b: Beaker): { color: string; alpha: number } {
  if (b.ml <= 0) return { color: 'transparent', alpha: 0 };
  const L = b.ml / 1000;
  let r = 0;
  let g = 0;
  let bl = 0;
  let w = 0;
  for (const [ion, mol] of Object.entries(b.ions)) {
    const c = IONS[ion]?.color;
    if (!c) continue;
    const k = Math.min(1, mol / L / 0.15);
    const n = parseInt(c.slice(1), 16);
    r += ((n >> 16) & 255) * k;
    g += ((n >> 8) & 255) * k;
    bl += (n & 255) * k;
    w += k;
  }
  if (!w) return { color: '#9EC9F0', alpha: 0.18 };
  return { color: `rgb(${Math.round(r / w)},${Math.round(g / w)},${Math.round(bl / w)})`, alpha: Math.min(0.85, 0.25 + w * 0.5) };
}

export const GAS_INFO: Record<string, { color: string; name: T2 }> = {
  H2: { color: 'rgba(255,255,255,0.75)', name: t('водород H₂', 'hydrogen H₂') },
  CO2: { color: 'rgba(255,255,255,0.75)', name: t('углекислый газ CO₂', 'carbon dioxide CO₂') },
  NH3: { color: 'rgba(255,255,255,0.6)', name: t('аммиак NH₃', 'ammonia NH₃') },
  H2S: { color: 'rgba(255,255,255,0.6)', name: t('сероводород H₂S', 'hydrogen sulfide H₂S') },
  NO: { color: 'rgba(255,255,255,0.6)', name: t('оксид азота NO', 'nitric oxide NO') },
  NO2: { color: 'rgba(160,70,20,0.85)', name: t('бурый газ NO₂', 'brown gas NO₂') },
};
