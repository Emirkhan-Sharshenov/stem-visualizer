import type { Question } from './quiz';
import { hashStr, rng, shuffle } from './quiz';

/*
 * Calculation problems generated with fresh numbers every time.
 * Each wrong option is a typical mistake (wrong unit conversion, inverted formula, forgot a factor).
 */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });
type Rand = () => number;

interface Problem {
  prompt: T2;
  answer: number | string;
  unit?: T2;
  wrong: (number | string)[];
  digits?: number;
  solution: T2;
}

export interface ProblemGen {
  id: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: number;
  topics: string[];
  title: T2;
  make: (r: Rand) => Problem;
}

const int = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rand, arr: T[]) => arr[Math.floor(r() * arr.length)];
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const fmt = (x: number | string, d: number, lang: 'ru' | 'en') => {
  if (typeof x === 'string') return x;
  const s = Number.isInteger(x) ? String(x) : String(round(x, d));
  return lang === 'ru' ? s.replace('.', ',') : s;
};
const n = (x: number) => fmt(x, 3, 'ru');

/* ---------- chemistry helpers ---------- */

const AR: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 64, Zn: 65, P: 31, Si: 28, Ba: 137 };
const COMPOUNDS: { f: string; parts: [string, number][]; name: T2 }[] = [
  { f: 'H₂O', parts: [['H', 2], ['O', 1]], name: t('вода', 'water') },
  { f: 'CO₂', parts: [['C', 1], ['O', 2]], name: t('углекислый газ', 'carbon dioxide') },
  { f: 'NaCl', parts: [['Na', 1], ['Cl', 1]], name: t('поваренная соль', 'table salt') },
  { f: 'H₂SO₄', parts: [['H', 2], ['S', 1], ['O', 4]], name: t('серная кислота', 'sulfuric acid') },
  { f: 'CaCO₃', parts: [['Ca', 1], ['C', 1], ['O', 3]], name: t('мел', 'chalk') },
  { f: 'NaOH', parts: [['Na', 1], ['O', 1], ['H', 1]], name: t('едкий натр', 'caustic soda') },
  { f: 'HCl', parts: [['H', 1], ['Cl', 1]], name: t('хлороводород', 'hydrogen chloride') },
  { f: 'NH₃', parts: [['N', 1], ['H', 3]], name: t('аммиак', 'ammonia') },
  { f: 'CH₄', parts: [['C', 1], ['H', 4]], name: t('метан', 'methane') },
  { f: 'Fe₂O₃', parts: [['Fe', 2], ['O', 3]], name: t('оксид железа(III)', 'iron(III) oxide') },
  { f: 'CuSO₄', parts: [['Cu', 1], ['S', 1], ['O', 4]], name: t('медный купорос (безв.)', 'copper sulfate') },
  { f: 'MgO', parts: [['Mg', 1], ['O', 1]], name: t('оксид магния', 'magnesium oxide') },
  { f: 'HNO₃', parts: [['H', 1], ['N', 1], ['O', 3]], name: t('азотная кислота', 'nitric acid') },
  { f: 'C₆H₁₂O₆', parts: [['C', 6], ['H', 12], ['O', 6]], name: t('глюкоза', 'glucose') },
  { f: 'Al₂O₃', parts: [['Al', 2], ['O', 3]], name: t('оксид алюминия', 'aluminium oxide') },
  { f: 'KCl', parts: [['K', 1], ['Cl', 1]], name: t('хлорид калия', 'potassium chloride') },
];
const M = (c: (typeof COMPOUNDS)[number]) => c.parts.reduce((s, [e, k]) => s + AR[e] * k, 0);
const noIdx = (c: (typeof COMPOUNDS)[number]) => c.parts.reduce((s, [e]) => s + AR[e], 0);

const OX: { f: string; el: string; v: string; opts: string[] }[] = [
  { f: 'H₂SO₄', el: 'S', v: '+6', opts: ['+4', '−2', '+2'] },
  { f: 'SO₂', el: 'S', v: '+4', opts: ['+6', '+2', '−2'] },
  { f: 'H₂S', el: 'S', v: '−2', opts: ['+2', '+4', '0'] },
  { f: 'HNO₃', el: 'N', v: '+5', opts: ['+3', '−3', '+4'] },
  { f: 'NH₃', el: 'N', v: '−3', opts: ['+3', '0', '+5'] },
  { f: 'KMnO₄', el: 'Mn', v: '+7', opts: ['+4', '+2', '+6'] },
  { f: 'Fe₂O₃', el: 'Fe', v: '+3', opts: ['+2', '+6', '0'] },
  { f: 'CO₂', el: 'C', v: '+4', opts: ['+2', '−4', '0'] },
  { f: 'CH₄', el: 'C', v: '−4', opts: ['+4', '0', '−2'] },
  { f: 'Cl₂', el: 'Cl', v: '0', opts: ['−1', '+1', '+7'] },
  { f: 'HClO₄', el: 'Cl', v: '+7', opts: ['+5', '−1', '+1'] },
  { f: 'K₂Cr₂O₇', el: 'Cr', v: '+6', opts: ['+3', '+7', '+12'] },
  { f: 'H₃PO₄', el: 'P', v: '+5', opts: ['+3', '−3', '+4'] },
  { f: 'Na₂O₂', el: 'O', v: '−1', opts: ['−2', '0', '+2'] },
];

/* ---------- generators ---------- */

const U = { kmh: t('км/ч', 'km/h'), km: t('км', 'km'), m: t('м', 'm'), s: t('с', 's'), N: t('Н', 'N'), Pa: t('Па', 'Pa'), kPa: t('кПа', 'kPa'), J: t('Дж', 'J'), kJ: t('кДж', 'kJ'), MJ: t('МДж', 'MJ'), W: t('Вт', 'W'), A: t('А', 'A'), Ohm: t('Ом', 'Ω'), V: t('В', 'V'), kg: t('кг', 'kg'), g: t('г', 'g'), gcm3: t('г/см³', 'g/cm³'), ms2: t('м/с²', 'm/s²'), ms: t('м/с', 'm/s'), kgms: t('кг·м/с', 'kg·m/s'), dptr: t('дптр', 'D'), pct: t('%', '%'), mol: t('моль', 'mol'), L: t('л', 'L'), gmol: t('г/моль', 'g/mol'), Hz: t('Гц', 'Hz'), cm: t('см', 'cm'), uC: t('мкКл', 'µC'), eV: t('эВ', 'eV'), nuc: t('ядер', 'nuclei') };

export const PROBLEMS: ProblemGen[] = [
  /* ===== physics 7 ===== */
  {
    id: 'speed', subject: 'physics', grade: 7, topics: ['p7-speed', 'p9-uniform'], title: t('Скорость', 'Speed'),
    make: (r) => {
      const v = int(r, 4, 18) * 5;
      const tt = int(r, 2, 6);
      const s = v * tt;
      return { prompt: t(`Автобус проехал ${s} км за ${tt} ч. Найди его скорость.`, `A bus covers ${s} km in ${tt} h. Find its speed.`), answer: v, unit: U.kmh, wrong: [s * tt, round(tt / s, 3), v * 2], solution: t(`v = s / t = ${s} / ${tt} = ${v} км/ч`, `v = s / t = ${s} / ${tt} = ${v} km/h`) };
    },
  },
  {
    id: 'distance', subject: 'physics', grade: 7, topics: ['p7-distance-time'], title: t('Путь за время', 'Distance in a time'),
    make: (r) => {
      const v = int(r, 3, 12) * 10;
      const min = pick(r, [15, 30, 45, 90, 120]);
      const s = (v * min) / 60;
      return { prompt: t(`Велосипедист едет со скоростью ${v} км/ч. Какой путь он проедет за ${min} мин?`, `A cyclist rides at ${v} km/h. How far does he go in ${min} min?`), answer: s, unit: U.km, wrong: [v * min, round(v / min, 2), s * 2], solution: t(`${min} мин = ${n(min / 60)} ч; s = v·t = ${v}·${n(min / 60)} = ${n(s)} км`, `${min} min = ${min / 60} h; s = v·t = ${s} km`) };
    },
  },
  {
    id: 'density', subject: 'physics', grade: 7, topics: ['p7-density'], title: t('Плотность', 'Density'),
    make: (r) => {
      const mat = pick(r, [{ rho: 2.7, ru: 'алюминия', en: 'aluminium' }, { rho: 7.8, ru: 'железа', en: 'iron' }, { rho: 8.9, ru: 'меди', en: 'copper' }, { rho: 11.3, ru: 'свинца', en: 'lead' }, { rho: 0.9, ru: 'льда', en: 'ice' }]);
      const V = int(r, 2, 20) * 10;
      const m = round(mat.rho * V, 1);
      return { prompt: t(`Брусок ${mat.ru} объёмом ${V} см³ имеет массу ${n(m)} г. Найди плотность.`, `A block of ${mat.en} of ${V} cm³ has a mass of ${m} g. Find the density.`), answer: mat.rho, unit: U.gcm3, wrong: [round(V / m, 3), round(m * V, 0), round(mat.rho * 10, 1)], digits: 2, solution: t(`ρ = m / V = ${n(m)} / ${V} = ${n(mat.rho)} г/см³`, `ρ = m / V = ${m} / ${V} = ${mat.rho} g/cm³`) };
    },
  },
  {
    id: 'gravity', subject: 'physics', grade: 7, topics: ['p7-gravity', 'p7-force'], title: t('Сила тяжести', 'Weight force'),
    make: (r) => {
      const m = int(r, 2, 90);
      return { prompt: t(`Найди силу тяжести, действующую на тело массой ${m} кг (g = 10 Н/кг).`, `Find the gravity force on a ${m} kg body (g = 10 N/kg).`), answer: m * 10, unit: U.N, wrong: [m, m / 10, m * 100], solution: t(`F = m·g = ${m}·10 = ${m * 10} Н`, `F = m·g = ${m}·10 = ${m * 10} N`) };
    },
  },
  {
    id: 'hooke', subject: 'physics', grade: 7, topics: ['p7-elastic', 'p10-elastic'], title: t('Закон Гука', 'Hooke’s law'),
    make: (r) => {
      const k = int(r, 2, 20) * 10;
      const x = int(r, 2, 15);
      const F = (k * x) / 100;
      return { prompt: t(`Пружину жёсткостью ${k} Н/м растянули на ${x} см. Какова сила упругости?`, `A spring with k = ${k} N/m is stretched by ${x} cm. Find the elastic force.`), answer: F, unit: U.N, wrong: [k * x, round(k / x, 2), F * 10], solution: t(`${x} см = ${n(x / 100)} м; F = k·x = ${k}·${n(x / 100)} = ${n(F)} Н`, `${x} cm = ${x / 100} m; F = kx = ${F} N`) };
    },
  },
  {
    id: 'pressure', subject: 'physics', grade: 7, topics: ['p7-pressure'], title: t('Давление твёрдого тела', 'Pressure of a solid'),
    make: (r) => {
      const F = int(r, 10, 80) * 10;
      const S = pick(r, [20, 25, 40, 50, 80, 100, 200]);
      const p = (F / S) * 10000;
      return { prompt: t(`Ящик весом ${F} Н стоит на площади ${S} см². Какое давление он оказывает?`, `A box weighing ${F} N rests on ${S} cm². What pressure does it exert?`), answer: p, unit: U.Pa, wrong: [F / S, F * S, p / 100], solution: t(`${S} см² = ${n(S / 10000)} м²; p = F / S = ${F} / ${n(S / 10000)} = ${n(p)} Па`, `${S} cm² = ${S / 10000} m²; p = F/S = ${p} Pa`) };
    },
  },
  {
    id: 'liquid', subject: 'physics', grade: 7, topics: ['p7-liquid-pressure', 'p10-hydrostatics'], title: t('Давление на глубине', 'Pressure at depth'),
    make: (r) => {
      const h = int(r, 2, 40);
      const p = 1000 * 10 * h;
      return { prompt: t(`Найди давление воды на глубине ${h} м (ρ = 1000 кг/м³, g = 10 Н/кг).`, `Find the water pressure at ${h} m depth (ρ = 1000 kg/m³, g = 10 N/kg).`), answer: p / 1000, unit: U.kPa, wrong: [p, h * 10, (p / 1000) * 10], solution: t(`p = ρgh = 1000·10·${h} = ${p} Па = ${p / 1000} кПа`, `p = ρgh = ${p} Pa = ${p / 1000} kPa`) };
    },
  },
  {
    id: 'archimedes', subject: 'physics', grade: 7, topics: ['p7-archimedes', 'p7-floating'], title: t('Сила Архимеда', 'Buoyant force'),
    make: (r) => {
      const V = int(r, 1, 40) * 50;
      const F = (1000 * 10 * V) / 1e6;
      return { prompt: t(`Тело объёмом ${V} см³ полностью погрузили в воду. Найди архимедову силу (g = 10 Н/кг).`, `A ${V} cm³ body is fully under water. Find the buoyant force (g = 10 N/kg).`), answer: F, unit: U.N, wrong: [V * 10, F * 1000, F / 10], solution: t(`${V} см³ = ${n(V / 1e6)} м³; F = ρgV = 1000·10·${n(V / 1e6)} = ${n(F)} Н`, `F = ρgV = ${F} N`) };
    },
  },
  {
    id: 'work', subject: 'physics', grade: 7, topics: ['p7-work', 'p10-work-power'], title: t('Механическая работа', 'Mechanical work'),
    make: (r) => {
      const F = int(r, 5, 60) * 10;
      const s = int(r, 2, 30);
      return { prompt: t(`Тележку тянут с силой ${F} Н на расстояние ${s} м. Какая совершена работа?`, `A cart is pulled with ${F} N over ${s} m. How much work is done?`), answer: (F * s) / 1000, unit: U.kJ, wrong: [F * s, round(F / s, 2), (F * s) / 100], solution: t(`A = F·s = ${F}·${s} = ${F * s} Дж = ${n((F * s) / 1000)} кДж`, `A = Fs = ${F * s} J`) };
    },
  },
  {
    id: 'power', subject: 'physics', grade: 7, topics: ['p7-power'], title: t('Мощность', 'Power'),
    make: (r) => {
      const N = int(r, 5, 60) * 10;
      const tt = int(r, 5, 30);
      const A = N * tt;
      return { prompt: t(`Подъёмник совершил работу ${A} Дж за ${tt} с. Найди его мощность.`, `A lift does ${A} J of work in ${tt} s. Find its power.`), answer: N, unit: U.W, wrong: [A * tt, round(tt / A, 4), N * 2], solution: t(`N = A / t = ${A} / ${tt} = ${N} Вт`, `N = A/t = ${N} W`) };
    },
  },
  {
    id: 'lever', subject: 'physics', grade: 7, topics: ['p7-lever', 'p10-equilibrium'], title: t('Равновесие рычага', 'Lever balance'),
    make: (r) => {
      const F1 = int(r, 2, 20) * 10;
      const l1 = int(r, 1, 6) * 10;
      const l2 = pick(r, [5, 10, 20, 25, 40, 50].filter((x) => x !== l1));
      const F2 = (F1 * l1) / l2;
      return { prompt: t(`На рычаг действует сила ${F1} Н с плечом ${l1} см. Какую силу нужно приложить с плечом ${l2} см для равновесия?`, `A force of ${F1} N acts at ${l1} cm. What force at ${l2} cm balances the lever?`), answer: round(F2, 2), unit: U.N, wrong: [round((F1 * l2) / l1, 2), F1, round(F1 * l1 * l2 / 100, 1)], solution: t(`F₁l₁ = F₂l₂ ⇒ F₂ = ${F1}·${l1} / ${l2} = ${n(F2)} Н`, `F₂ = F₁l₁/l₂ = ${round(F2, 2)} N`) };
    },
  },
  {
    id: 'efficiency', subject: 'physics', grade: 7, topics: ['p7-efficiency', 'p7-pulleys'], title: t('КПД', 'Efficiency'),
    make: (r) => {
      const Az = int(r, 4, 20) * 100;
      const eta = pick(r, [40, 50, 60, 70, 75, 80, 90]);
      const Ap = (Az * eta) / 100;
      return { prompt: t(`Полезная работа ${Ap} Дж, затраченная ${Az} Дж. Найди КПД.`, `Useful work is ${Ap} J, total work ${Az} J. Find the efficiency.`), answer: eta, unit: U.pct, wrong: [round((Az / Ap) * 100, 0), 100 - eta, round(eta / 10, 1)], solution: t(`η = A_п / A_з · 100% = ${Ap} / ${Az} · 100% = ${eta}%`, `η = useful/total = ${eta}%`) };
    },
  },
  {
    id: 'ek', subject: 'physics', grade: 7, topics: ['p7-energy', 'p9-energy', 'p10-energy'], title: t('Кинетическая энергия', 'Kinetic energy'),
    make: (r) => {
      const m = int(r, 1, 20) * 50;
      const v = int(r, 2, 20);
      const E = (m * v * v) / 2;
      return { prompt: t(`Автомобиль массой ${m} кг едет со скоростью ${v} м/с. Найди его кинетическую энергию.`, `A ${m} kg car moves at ${v} m/s. Find its kinetic energy.`), answer: E / 1000, unit: U.kJ, wrong: [(m * v) / 1000, (m * v * v) / 1000, E], solution: t(`E = mv²/2 = ${m}·${v}²/2 = ${E} Дж = ${n(E / 1000)} кДж`, `E = mv²/2 = ${E} J`) };
    },
  },
  {
    id: 'ep', subject: 'physics', grade: 7, topics: ['p7-energy'], title: t('Потенциальная энергия', 'Potential energy'),
    make: (r) => {
      const m = int(r, 1, 50);
      const h = int(r, 2, 30);
      return { prompt: t(`Груз массой ${m} кг подняли на высоту ${h} м. Какая у него потенциальная энергия (g = 10)?`, `A ${m} kg load is lifted ${h} m. Find its potential energy (g = 10).`), answer: m * 10 * h, unit: U.J, wrong: [m * h, m * 10 + h, (m * 10 * h) / 2], solution: t(`E = mgh = ${m}·10·${h} = ${m * 10 * h} Дж`, `E = mgh = ${m * 10 * h} J`) };
    },
  },
  /* ===== physics 8 ===== */
  {
    id: 'heat', subject: 'physics', grade: 8, topics: ['p8-heat-quantity', 'p8-heat-balance'], title: t('Количество теплоты', 'Heat'),
    make: (r) => {
      const m = pick(r, [0.5, 1, 1.5, 2, 3, 5]);
      const dt = int(r, 2, 8) * 10;
      const Q = 4200 * m * dt;
      return { prompt: t(`Сколько теплоты нужно, чтобы нагреть ${n(m)} кг воды на ${dt} °C? (c = 4200 Дж/(кг·°C))`, `How much heat warms ${m} kg of water by ${dt} °C? (c = 4200 J/(kg·°C))`), answer: Q / 1000, unit: U.kJ, wrong: [Q, (4200 * dt) / 1000, (Q / 1000) * 2], solution: t(`Q = cmΔt = 4200·${n(m)}·${dt} = ${Q} Дж = ${n(Q / 1000)} кДж`, `Q = cmΔt = ${Q} J`) };
    },
  },
  {
    id: 'fuel', subject: 'physics', grade: 8, topics: ['p8-fuel'], title: t('Энергия топлива', 'Fuel energy'),
    make: (r) => {
      const f = pick(r, [{ q: 46, ru: 'бензина', en: 'petrol' }, { q: 27, ru: 'спирта', en: 'alcohol' }, { q: 10, ru: 'сухих дров', en: 'dry wood' }, { q: 30, ru: 'каменного угля', en: 'coal' }]);
      const m = int(r, 2, 20);
      return { prompt: t(`Сколько теплоты выделится при сгорании ${m} кг ${f.ru}? (q = ${f.q} МДж/кг)`, `How much heat does burning ${m} kg of ${f.en} release? (q = ${f.q} MJ/kg)`), answer: f.q * m, unit: U.MJ, wrong: [round(f.q / m, 2), f.q + m, f.q * m * 1000], solution: t(`Q = qm = ${f.q}·${m} = ${f.q * m} МДж`, `Q = qm = ${f.q * m} MJ`) };
    },
  },
  {
    id: 'ohm', subject: 'physics', grade: 8, topics: ['p8-ohm', 'p10-current-ohm'], title: t('Закон Ома', 'Ohm’s law'),
    make: (r) => {
      const R = pick(r, [2, 4, 5, 10, 20, 25, 40, 50]);
      const I = pick(r, [0.2, 0.5, 1, 1.5, 2, 3]);
      const Uv = R * I;
      return { prompt: t(`Напряжение на резисторе ${n(Uv)} В, сопротивление ${R} Ом. Найди силу тока.`, `A ${R} Ω resistor has ${Uv} V across it. Find the current.`), answer: I, unit: U.A, wrong: [Uv * R, round(R / Uv, 3), I * 2], solution: t(`I = U / R = ${n(Uv)} / ${R} = ${n(I)} А`, `I = U/R = ${I} A`) };
    },
  },
  {
    id: 'connections', subject: 'physics', grade: 8, topics: ['p8-connections'], title: t('Соединение резисторов', 'Resistor networks'),
    make: (r) => {
      const R1 = pick(r, [2, 3, 4, 6, 10, 12]);
      const R2 = pick(r, [2, 3, 4, 6, 10, 12]);
      const par = r() < 0.5;
      const ans = par ? (R1 * R2) / (R1 + R2) : R1 + R2;
      return { prompt: t(`Резисторы ${R1} Ом и ${R2} Ом соединены ${par ? 'параллельно' : 'последовательно'}. Найди общее сопротивление.`, `Resistors of ${R1} Ω and ${R2} Ω are connected in ${par ? 'parallel' : 'series'}. Find the total resistance.`), answer: round(ans, 2), unit: U.Ohm, wrong: [round(par ? R1 + R2 : (R1 * R2) / (R1 + R2), 2), R1 * R2, round(Math.abs(R1 - R2) + 1, 0)], solution: par ? t(`R = R₁R₂ / (R₁ + R₂) = ${R1 * R2} / ${R1 + R2} = ${n(ans)} Ом`, `R = R₁R₂/(R₁+R₂) = ${round(ans, 2)} Ω`) : t(`R = R₁ + R₂ = ${ans} Ом`, `R = R₁ + R₂ = ${ans} Ω`) };
    },
  },
  {
    id: 'elec-power', subject: 'physics', grade: 8, topics: ['p8-power-current'], title: t('Мощность тока', 'Electric power'),
    make: (r) => {
      const Uv = pick(r, [12, 24, 110, 220]);
      const I = pick(r, [0.5, 1, 2, 4, 5, 10]);
      return { prompt: t(`Прибор работает при напряжении ${Uv} В и силе тока ${n(I)} А. Какова его мощность?`, `A device runs at ${Uv} V and ${I} A. What is its power?`), answer: Uv * I, unit: U.W, wrong: [round(Uv / I, 2), Uv + I, Uv * I * I], solution: t(`P = UI = ${Uv}·${n(I)} = ${n(Uv * I)} Вт`, `P = UI = ${Uv * I} W`) };
    },
  },
  {
    id: 'joule', subject: 'physics', grade: 8, topics: ['p8-joule-lenz'], title: t('Закон Джоуля–Ленца', 'Joule heating'),
    make: (r) => {
      const I = pick(r, [1, 2, 3, 4, 5]);
      const R = pick(r, [5, 10, 20, 50]);
      const tt = pick(r, [10, 30, 60, 120]);
      const Q = I * I * R * tt;
      return { prompt: t(`Через проводник сопротивлением ${R} Ом течёт ток ${I} А. Сколько теплоты выделится за ${tt} с?`, `${I} A flows through ${R} Ω. How much heat is released in ${tt} s?`), answer: Q, unit: U.J, wrong: [I * R * tt, Q * 2, I * I * R], solution: t(`Q = I²Rt = ${I}²·${R}·${tt} = ${Q} Дж`, `Q = I²Rt = ${Q} J`) };
    },
  },
  {
    id: 'lens-power', subject: 'physics', grade: 8, topics: ['p8-lenses'], title: t('Оптическая сила', 'Optical power'),
    make: (r) => {
      const F = pick(r, [10, 20, 25, 40, 50, 100]);
      return { prompt: t(`Фокусное расстояние линзы ${F} см. Найди её оптическую силу.`, `A lens has a focal length of ${F} cm. Find its optical power.`), answer: 100 / F, unit: U.dptr, wrong: [F, round(1 / F, 3), F / 10], solution: t(`F = ${F} см = ${n(F / 100)} м; D = 1/F = ${n(100 / F)} дптр`, `D = 1/F = ${100 / F} D`) };
    },
  },
  /* ===== physics 9 ===== */
  {
    id: 'acc', subject: 'physics', grade: 9, topics: ['p9-accelerated', 'p10-accelerated'], title: t('Равноускоренное движение', 'Uniform acceleration'),
    make: (r) => {
      const v0 = int(r, 0, 10);
      const a = int(r, 1, 5);
      const tt = int(r, 2, 10);
      return { prompt: t(`Тело имело скорость ${v0} м/с и двигалось с ускорением ${a} м/с². Какой станет скорость через ${tt} с?`, `A body at ${v0} m/s accelerates at ${a} m/s². What is its speed after ${tt} s?`), answer: v0 + a * tt, unit: U.ms, wrong: [a * tt, v0 * tt + a, v0 + (a * tt * tt) / 2], solution: t(`v = v₀ + at = ${v0} + ${a}·${tt} = ${v0 + a * tt} м/с`, `v = v₀ + at = ${v0 + a * tt} m/s`) };
    },
  },
  {
    id: 'freefall', subject: 'physics', grade: 9, topics: ['p9-freefall', 'p10-projectile'], title: t('Свободное падение', 'Free fall'),
    make: (r) => {
      const tt = int(r, 1, 6);
      const h = (10 * tt * tt) / 2;
      return { prompt: t(`Камень падал без начальной скорости ${tt} с. С какой высоты он упал? (g = 10 м/с²)`, `A stone falls from rest for ${tt} s. From what height? (g = 10 m/s²)`), answer: h, unit: U.m, wrong: [10 * tt, 10 * tt * tt, h / 2], solution: t(`h = gt²/2 = 10·${tt}²/2 = ${h} м`, `h = gt²/2 = ${h} m`) };
    },
  },
  {
    id: 'newton2', subject: 'physics', grade: 9, topics: ['p9-newton', 'p10-newton', 'p10-applications'], title: t('Второй закон Ньютона', 'Newton’s 2nd law'),
    make: (r) => {
      const m = int(r, 2, 50);
      const a = int(r, 1, 6);
      const F = m * a;
      return { prompt: t(`На тело массой ${m} кг действует сила ${F} Н. С каким ускорением оно движется?`, `A ${F} N force acts on ${m} kg. What is the acceleration?`), answer: a, unit: U.ms2, wrong: [F * m, round(m / F, 3), a * 10], solution: t(`a = F / m = ${F} / ${m} = ${a} м/с²`, `a = F/m = ${a} m/s²`) };
    },
  },
  {
    id: 'momentum', subject: 'physics', grade: 9, topics: ['p9-momentum', 'p10-momentum', 'p10-collisions'], title: t('Неупругий удар', 'Inelastic collision'),
    make: (r) => {
      const m1 = int(r, 1, 10) * 10;
      const m2 = int(r, 1, 10) * 10;
      const v1 = int(r, 2, 10);
      const v = (m1 * v1) / (m1 + m2);
      return { prompt: t(`Тележка ${m1} кг со скоростью ${v1} м/с сцепляется с неподвижной тележкой ${m2} кг. Какой станет скорость?`, `A ${m1} kg cart at ${v1} m/s couples with a resting ${m2} kg cart. Final speed?`), answer: round(v, 2), unit: U.ms, wrong: [v1, round((m2 * v1) / (m1 + m2), 2), round(v1 / 2, 2)], solution: t(`m₁v₁ = (m₁ + m₂)v ⇒ v = ${m1}·${v1} / ${m1 + m2} = ${n(v)} м/с`, `v = m₁v₁/(m₁+m₂) = ${round(v, 2)} m/s`) };
    },
  },
  {
    id: 'wavelength', subject: 'physics', grade: 9, topics: ['p9-waves', 'p9-sound', 'p11-mech-waves'], title: t('Длина волны', 'Wavelength'),
    make: (r) => {
      const v = pick(r, [340, 1500, 5000]);
      const nu = pick(r, [100, 170, 200, 250, 500, 1000]);
      return { prompt: t(`Звук частотой ${nu} Гц распространяется со скоростью ${v} м/с. Найди длину волны.`, `Sound at ${nu} Hz travels at ${v} m/s. Find the wavelength.`), answer: round(v / nu, 3), unit: U.m, wrong: [v * nu, round(nu / v, 4), round((v / nu) * 2, 3)], solution: t(`λ = v / ν = ${v} / ${nu} = ${n(v / nu)} м`, `λ = v/ν = ${round(v / nu, 3)} m`) };
    },
  },
  {
    id: 'period', subject: 'physics', grade: 9, topics: ['p9-oscillation-quantities', 'p9-harmonic', 'p11-free-osc'], title: t('Период и частота', 'Period and frequency'),
    make: (r) => {
      const N = pick(r, [10, 20, 30, 50]);
      const T = pick(r, [0.5, 1, 2, 4]);
      const tt = N * T;
      return { prompt: t(`Маятник совершил ${N} колебаний за ${tt} с. Найди частоту колебаний.`, `A pendulum makes ${N} swings in ${tt} s. Find the frequency.`), answer: round(1 / T, 3), unit: U.Hz, wrong: [T, N * tt, round(tt / N / 2, 3)], solution: t(`T = t / N = ${tt} / ${N} = ${n(T)} с; ν = 1/T = ${n(1 / T)} Гц`, `ν = N/t = ${1 / T} Hz`) };
    },
  },
  {
    id: 'circular', subject: 'physics', grade: 9, topics: ['p9-circular', 'p10-circular'], title: t('Центростремительное ускорение', 'Centripetal acceleration'),
    make: (r) => {
      const v = int(r, 2, 20);
      const R = pick(r, [1, 2, 4, 5, 10, 20, 50]);
      return { prompt: t(`Тело движется по окружности радиусом ${R} м со скоростью ${v} м/с. Найди центростремительное ускорение.`, `A body moves round a ${R} m circle at ${v} m/s. Find the centripetal acceleration.`), answer: round((v * v) / R, 2), unit: U.ms2, wrong: [round(v / R, 2), v * v * R, round((v * v) / R / 2, 2)], solution: t(`a = v² / R = ${v * v} / ${R} = ${n((v * v) / R)} м/с²`, `a = v²/R = ${round((v * v) / R, 2)} m/s²`) };
    },
  },
  /* ===== physics 10–11 ===== */
  {
    id: 'boyle', subject: 'physics', grade: 10, topics: ['p10-gas-laws', 'p10-clapeyron'], title: t('Изотермический процесс', 'Isothermal process'),
    make: (r) => {
      const p1 = pick(r, [100, 120, 150, 200]);
      const V1 = pick(r, [2, 4, 6, 8, 12]);
      const V2 = pick(r, [1, 2, 3, 4].filter((x) => x < V1));
      return { prompt: t(`Газ при давлении ${p1} кПа занимал ${V1} л. Его изотермически сжали до ${V2} л. Каким стало давление?`, `Gas at ${p1} kPa in ${V1} L is compressed isothermally to ${V2} L. New pressure?`), answer: round((p1 * V1) / V2, 1), unit: U.kPa, wrong: [round((p1 * V2) / V1, 1), p1, round(p1 * V1 * V2, 0)], solution: t(`p₁V₁ = p₂V₂ ⇒ p₂ = ${p1}·${V1} / ${V2} = ${n((p1 * V1) / V2)} кПа`, `p₂ = p₁V₁/V₂ = ${round((p1 * V1) / V2, 1)} kPa`) };
    },
  },
  {
    id: 'coulomb', subject: 'physics', grade: 10, topics: ['p10-charge'], title: t('Закон Кулона', 'Coulomb’s law'),
    make: (r) => {
      const q1 = int(r, 1, 6);
      const q2 = int(r, 1, 6);
      const rr = pick(r, [0.1, 0.2, 0.3, 0.5]);
      const F = (9e9 * q1 * 1e-6 * q2 * 1e-6) / (rr * rr);
      return { prompt: t(`Заряды ${q1} мкКл и ${q2} мкКл находятся на расстоянии ${n(rr)} м. Найди силу их взаимодействия (k = 9·10⁹).`, `Charges of ${q1} µC and ${q2} µC are ${rr} m apart. Find the force (k = 9·10⁹).`), answer: round(F, 3), unit: U.N, wrong: [round(F * rr, 4), round(F * 10, 3), round((9e9 * q1 * q2 * 1e-12) / rr, 4)], digits: 4, solution: t(`F = kq₁q₂ / r² = 9·10⁹·${q1}·10⁻⁶·${q2}·10⁻⁶ / ${n(rr)}² = ${n(F)} Н`, `F = kq₁q₂/r² = ${round(F, 3)} N`) };
    },
  },
  {
    id: 'emf', subject: 'physics', grade: 10, topics: ['p10-emf'], title: t('Закон Ома для полной цепи', 'Ohm’s law, full circuit'),
    make: (r) => {
      const E = pick(r, [4.5, 6, 9, 12, 24]);
      const Rr = pick(r, [1, 2, 3, 5, 10]);
      const ri = pick(r, [0.5, 1, 2]);
      return { prompt: t(`ЭДС источника ${n(E)} В, внутреннее сопротивление ${n(ri)} Ом, внешнее ${Rr} Ом. Найди силу тока.`, `EMF ${E} V, internal resistance ${ri} Ω, external ${Rr} Ω. Find the current.`), answer: round(E / (Rr + ri), 2), unit: U.A, wrong: [round(E / Rr, 2), round(E / ri, 2), round(E * (Rr + ri), 1)], solution: t(`I = ε / (R + r) = ${n(E)} / ${n(Rr + ri)} = ${n(E / (Rr + ri))} А`, `I = ε/(R+r) = ${round(E / (Rr + ri), 2)} A`) };
    },
  },
  {
    id: 'capacitor', subject: 'physics', grade: 10, topics: ['p10-capacitors'], title: t('Заряд конденсатора', 'Capacitor charge'),
    make: (r) => {
      const C = pick(r, [2, 5, 10, 20, 50, 100]);
      const Uv = pick(r, [10, 12, 50, 100, 200]);
      return { prompt: t(`Конденсатор ёмкостью ${C} мкФ зарядили до ${Uv} В. Каков его заряд?`, `A ${C} µF capacitor is charged to ${Uv} V. What is its charge?`), answer: C * Uv, unit: U.uC, wrong: [round(C / Uv, 3), round((C * Uv * Uv) / 2, 0), C + Uv], solution: t(`q = CU = ${C}·${Uv} = ${C * Uv} мкКл`, `q = CU = ${C * Uv} µC`) };
    },
  },
  {
    id: 'halflife', subject: 'physics', grade: 11, topics: ['p11-decay-law', 'p9-radiation-bio'], title: t('Период полураспада', 'Half-life'),
    make: (r) => {
      const N0 = pick(r, [800, 1600, 3200, 6400]);
      const T = pick(r, [2, 3, 5, 8]);
      const k = int(r, 1, 4);
      return { prompt: t(`Было ${N0} радиоактивных ядер, период полураспада ${T} суток. Сколько ядер останется через ${T * k} суток?`, `There are ${N0} nuclei with a half-life of ${T} days. How many remain after ${T * k} days?`), answer: N0 / 2 ** k, unit: U.nuc, wrong: [N0 / (2 * k), N0 / 2 ** (k + 1), k === 1 ? N0 / 4 : N0 / 2], solution: t(`N = N₀ / 2^(t/T) = ${N0} / 2^${k} = ${N0 / 2 ** k}`, `N = N₀/2^(t/T) = ${N0 / 2 ** k}`) };
    },
  },
  {
    id: 'photon', subject: 'physics', grade: 11, topics: ['p11-quanta', 'p11-photons'], title: t('Энергия фотона', 'Photon energy'),
    make: (r) => {
      const lam = pick(r, [310, 400, 496, 620, 248]);
      return { prompt: t(`Найди энергию фотона с длиной волны ${lam} нм (hc ≈ 1240 эВ·нм).`, `Find the energy of a ${lam} nm photon (hc ≈ 1240 eV·nm).`), answer: round(1240 / lam, 2), unit: U.eV, wrong: [round(lam / 1240, 3), round(1240 * lam, 0), round(1240 / lam / 2, 2)], solution: t(`E = hc / λ = 1240 / ${lam} = ${n(1240 / lam)} эВ`, `E = hc/λ = ${round(1240 / lam, 2)} eV`) };
    },
  },
  {
    id: 'thinlens', subject: 'physics', grade: 11, topics: ['p11-lenses', 'p8-lens-images'], title: t('Формула тонкой линзы', 'Thin lens formula'),
    make: (r) => {
      const F = pick(r, [10, 15, 20]);
      const d = pick(r, [30, 40, 60]);
      const f = (F * d) / (d - F);
      return { prompt: t(`Предмет стоит в ${d} см от собирающей линзы с фокусом ${F} см. На каком расстоянии получится изображение?`, `An object is ${d} cm from a converging lens with F = ${F} cm. Where is the image?`), answer: round(f, 1), unit: U.cm, wrong: [round((F * d) / (d + F), 1), d - F, d + F], solution: t(`1/F = 1/d + 1/f ⇒ f = Fd / (d − F) = ${F}·${d} / ${d - F} = ${n(f)} см`, `f = Fd/(d−F) = ${round(f, 1)} cm`) };
    },
  },
  /* ===== chemistry ===== */
  {
    id: 'molar', subject: 'chemistry', grade: 8, topics: ['c8-masses', 'c8-formulas-valence'], title: t('Молярная масса', 'Molar mass'),
    make: (r) => {
      const c = pick(r, COMPOUNDS);
      const m = M(c);
      return { prompt: t(`Найди молярную массу ${c.f} (${c.name.ru}).`, `Find the molar mass of ${c.f} (${c.name.en}).`), answer: m, unit: U.gmol, wrong: [noIdx(c), m * 2, round(m / 2, 1)], solution: t(`M = ${c.parts.map(([e, k]) => `${k > 1 ? k + '·' : ''}${AR[e]}`).join(' + ')} = ${n(m)} г/моль`, `M = ${m} g/mol`) };
    },
  },
  {
    id: 'moles', subject: 'chemistry', grade: 8, topics: ['c8-mole'], title: t('Количество вещества', 'Amount of substance'),
    make: (r) => {
      const c = pick(r, COMPOUNDS.filter((x) => Number.isInteger(M(x))));
      const nn = pick(r, [0.5, 1, 2, 3, 4, 0.25]);
      const mass = M(c) * nn;
      return { prompt: t(`Сколько моль составляют ${n(mass)} г ${c.f}?`, `How many moles are ${mass} g of ${c.f}?`), answer: nn, unit: U.mol, wrong: [round(mass * M(c), 0), round(M(c) / mass, 3), nn * 2], solution: t(`M(${c.f}) = ${M(c)} г/моль; n = m / M = ${n(mass)} / ${M(c)} = ${n(nn)} моль`, `n = m/M = ${nn} mol`) };
    },
  },
  {
    id: 'gasvol', subject: 'chemistry', grade: 8, topics: ['c8-mole', 'c8-oxygen'], title: t('Молярный объём газа', 'Molar volume'),
    make: (r) => {
      const nn = pick(r, [0.5, 1, 2, 3, 5, 0.1]);
      const gas = pick(r, ['O₂', 'H₂', 'CO₂', 'N₂', 'CH₄']);
      return { prompt: t(`Какой объём при н.у. займут ${n(nn)} моль ${gas}?`, `What volume at STP do ${nn} mol of ${gas} take?`), answer: round(22.4 * nn, 2), unit: U.L, wrong: [round(22.4 / nn, 2), nn, round(22.4 * nn * 2, 1)], solution: t(`V = n·Vm = ${n(nn)}·22,4 = ${n(22.4 * nn)} л`, `V = n·22.4 = ${round(22.4 * nn, 2)} L`) };
    },
  },
  {
    id: 'massfrac-el', subject: 'chemistry', grade: 8, topics: ['c8-formulas-valence', 'c10-formula-problems'], title: t('Массовая доля элемента', 'Mass fraction of an element'),
    make: (r) => {
      const c = pick(r, COMPOUNDS);
      const [el, k] = pick(r, c.parts);
      const w = (AR[el] * k * 100) / M(c);
      return { prompt: t(`Найди массовую долю ${el} в ${c.f}.`, `Find the mass fraction of ${el} in ${c.f}.`), answer: round(w, 1), unit: U.pct, wrong: [round((AR[el] * 100) / M(c), 1) === round(w, 1) ? round(100 - w, 1) : round((AR[el] * 100) / M(c), 1), round(100 / c.parts.length, 1), round(w / 2, 1)], solution: t(`ω = ${k > 1 ? k + '·' : ''}${AR[el]} / ${n(M(c))} · 100% = ${n(round(w, 1))}%`, `ω = ${round(w, 1)}%`) };
    },
  },
  {
    id: 'solution', subject: 'chemistry', grade: 8, topics: ['c8-solutions', 'c11-concentration'], title: t('Массовая доля раствора', 'Solution concentration'),
    make: (r) => {
      const ms = pick(r, [5, 10, 15, 20, 25, 40]);
      const mw = pick(r, [45, 90, 135, 180, 60, 160]);
      return { prompt: t(`В ${mw} г воды растворили ${ms} г соли. Какова массовая доля соли?`, `${ms} g of salt dissolve in ${mw} g of water. What is the mass fraction?`), answer: round((ms * 100) / (ms + mw), 1), unit: U.pct, wrong: [round((ms * 100) / mw, 1), round(ms + mw, 0), round((mw * 100) / (ms + mw), 1)], solution: t(`ω = m(соли) / m(раствора) = ${ms} / ${ms + mw} · 100% = ${n(round((ms * 100) / (ms + mw), 1))}%`, `ω = ${ms}/${ms + mw} = ${round((ms * 100) / (ms + mw), 1)}%`) };
    },
  },
  {
    id: 'oxstate', subject: 'chemistry', grade: 8, topics: ['c8-oxidation-state', 'c8-redox', 'c11-redox'], title: t('Степень окисления', 'Oxidation state'),
    make: (r) => {
      const c = pick(r, OX);
      return { prompt: t(`Какова степень окисления ${c.el} в ${c.f}?`, `What is the oxidation state of ${c.el} in ${c.f}?`), answer: c.v, wrong: c.opts, solution: t(`Сумма степеней окисления в молекуле равна нулю: у H +1, у O −2 (кроме пероксидов) ⇒ ${c.el}: ${c.v}`, `Oxidation states add up to zero (H +1, O −2 except peroxides) ⇒ ${c.el}: ${c.v}`) };
    },
  },
  {
    id: 'stoich', subject: 'chemistry', grade: 8, topics: ['c8-equations', 'c8-hydrogen-props'], title: t('Расчёт по уравнению', 'Calculation from an equation'),
    make: (r) => {
      const mH2 = pick(r, [2, 4, 6, 8, 10, 20]);
      const mH2O = mH2 * 9;
      return { prompt: t(`2H₂ + O₂ → 2H₂O. Сколько граммов воды получится из ${mH2} г водорода?`, `2H₂ + O₂ → 2H₂O. How many grams of water form from ${mH2} g of hydrogen?`), answer: mH2O, unit: U.g, wrong: [mH2 * 18, mH2 * 2, (mH2 * 9) / 2], solution: t(`n(H₂) = ${mH2} / 2 = ${mH2 / 2} моль = n(H₂O); m = ${mH2 / 2}·18 = ${mH2O} г`, `n(H₂) = ${mH2 / 2} mol; m(H₂O) = ${mH2O} g`) };
    },
  },
  {
    id: 'co2-volume', subject: 'chemistry', grade: 9, topics: ['c9-carbon', 'c11-classification'], title: t('Объём газа по реакции', 'Gas volume from a reaction'),
    make: (r) => {
      const m = pick(r, [50, 100, 200, 250, 500]);
      const V = (m / 100) * 22.4;
      return { prompt: t(`CaCO₃ → CaO + CO₂. Какой объём CO₂ (н.у.) выделится при разложении ${m} г мела?`, `CaCO₃ → CaO + CO₂. What volume of CO₂ (STP) comes from ${m} g of chalk?`), answer: round(V, 2), unit: U.L, wrong: [round(m * 22.4, 0), round((m / 44) * 22.4, 2), round(V * 2, 1)], solution: t(`n(CaCO₃) = ${m} / 100 = ${n(m / 100)} моль; V(CO₂) = ${n(m / 100)}·22,4 = ${n(V)} л`, `V = ${round(V, 2)} L`) };
    },
  },
  {
    id: 'ph', subject: 'chemistry', grade: 11, topics: ['c11-ph', 'c9-ted-classes'], title: t('pH раствора', 'Solution pH'),
    make: (r) => {
      const k = int(r, 1, 5);
      const acid = r() < 0.6;
      return acid
        ? { prompt: t(`Концентрация ионов H⁺ в растворе 10⁻${k} моль/л. Найди pH.`, `[H⁺] = 10⁻${k} mol/L. Find the pH.`), answer: k, wrong: [14 - k, -k, k * 10], solution: t(`pH = −lg[H⁺] = −lg 10⁻${k} = ${k}`, `pH = −log[H⁺] = ${k}`) }
        : { prompt: t(`Концентрация ионов OH⁻ в растворе 10⁻${k} моль/л. Найди pH.`, `[OH⁻] = 10⁻${k} mol/L. Find the pH.`), answer: 14 - k, wrong: [k, 7, 14 + k], solution: t(`pOH = ${k}; pH = 14 − pOH = ${14 - k}`, `pOH = ${k}; pH = ${14 - k}`) };
    },
  },
  {
    id: 'thermo', subject: 'chemistry', grade: 11, topics: ['c11-thermochemistry', 'c8-combustion'], title: t('Термохимическое уравнение', 'Thermochemical equation'),
    make: (r) => {
      const m = pick(r, [6, 12, 24, 36, 60, 120]);
      const Q = (m / 12) * 394;
      return { prompt: t(`C + O₂ → CO₂ + 394 кДж. Сколько теплоты выделится при сгорании ${m} г угля?`, `C + O₂ → CO₂ + 394 kJ. How much heat does burning ${m} g of carbon release?`), answer: round(Q, 1), unit: U.kJ, wrong: [394 * m, round(394 / m, 2), round(Q / 2, 1)], solution: t(`n(C) = ${m} / 12 = ${n(m / 12)} моль; Q = ${n(m / 12)}·394 = ${n(Q)} кДж`, `Q = ${round(Q, 1)} kJ`) };
    },
  },
  /* ===== biology ===== */
  {
    id: 'mendel', subject: 'biology', grade: 9, topics: ['b9-mendel', 'b10-mendel-laws', 'b10-genetics-terms'], title: t('Моногибридное скрещивание', 'Monohybrid cross'),
    make: (r) => {
      const c = pick(r, [
        { p: 'Aa × Aa', ans: 25, w: [50, 75, 0], ex: t('AA : 2Aa : aa — рецессивный признак у 1/4 = 25%', 'AA : 2Aa : aa, so 1/4 = 25% recessive') },
        { p: 'Aa × aa', ans: 50, w: [25, 75, 100], ex: t('Aa : aa = 1 : 1 — рецессивный признак у 50%', 'Aa : aa = 1 : 1, so 50% recessive') },
        { p: 'AA × aa', ans: 0, w: [25, 50, 100], ex: t('Все потомки Aa — рецессивного признака нет (0%), закон единообразия', 'All offspring are Aa: 0% recessive, the law of uniformity') },
        { p: 'aa × aa', ans: 100, w: [0, 25, 50], ex: t('Все потомки aa — 100% рецессивный признак', 'All offspring are aa: 100% recessive') },
      ]);
      return { prompt: t(`Скрещивают ${c.p} (A — доминантный признак). Какой процент потомков будет с рецессивным признаком?`, `Cross ${c.p} (A is dominant). What percentage of offspring show the recessive trait?`), answer: c.ans, unit: U.pct, wrong: c.w, solution: c.ex };
    },
  },
  {
    id: 'dna', subject: 'biology', grade: 10, topics: ['b10-nucleic', 'b9-nucleic-atp', 'b10-replication'], title: t('Комплементарная цепь ДНК', 'Complementary DNA'),
    make: (r) => {
      const B = ['А', 'Т', 'Г', 'Ц'];
      const P: Record<string, string> = { А: 'Т', Т: 'А', Г: 'Ц', Ц: 'Г' };
      const s = Array.from({ length: 6 }, () => pick(r, B)).join('');
      const comp = s.split('').map((x) => P[x]).join('');
      const rna = s.split('').map((x) => (x === 'А' ? 'У' : P[x])).join('');
      // one point mutation as an extra distractor (used when the RNA option repeats the answer)
      const k = int(r, 0, 5);
      const mutated = comp.slice(0, k) + (comp[k] === 'Г' ? 'А' : 'Г') + comp.slice(k + 1);
      return { prompt: t(`Участок цепи ДНК: ${s}. Какова комплементарная цепь ДНК?`, `A DNA strand reads ${s}. What is the complementary DNA strand?`), answer: comp, wrong: [s, rna, comp.split('').reverse().join(''), mutated], solution: t('Правило комплементарности: А — Т, Г — Ц (в ДНК нет урацила).', 'Complementarity: A pairs with T, G with C (DNA has no uracil).') };
    },
  },
  {
    id: 'chargaff', subject: 'biology', grade: 10, topics: ['b10-nucleic', 'b9-nucleic-atp'], title: t('Правило Чаргаффа', 'Chargaff’s rule'),
    make: (r) => {
      const a = int(r, 10, 40);
      const g = (100 - 2 * a) / 2;
      return { prompt: t(`В молекуле ДНК ${a}% нуклеотидов с аденином. Сколько процентов нуклеотидов с гуанином?`, `${a}% of a DNA molecule’s nucleotides are adenine. What percentage are guanine?`), answer: g, unit: U.pct, wrong: [a, 100 - a, 100 - 2 * a], solution: t(`А = Т = ${a}%, значит Г + Ц = ${100 - 2 * a}%, а Г = Ц = ${g}%`, `A = T = ${a}%, so G + C = ${100 - 2 * a}% and G = ${g}%`) };
    },
  },
  {
    id: 'codons', subject: 'biology', grade: 10, topics: ['b10-protein-synthesis', 'b9-protein-synthesis'], title: t('Генетический код', 'Genetic code'),
    make: (r) => {
      const aa = int(r, 50, 400);
      return { prompt: t(`Белок состоит из ${aa} аминокислот. Сколько нуклеотидов в кодирующем участке иРНК (без стоп-кодона)?`, `A protein has ${aa} amino acids. How many mRNA nucleotides code for it (without a stop codon)?`), answer: aa * 3, wrong: [aa, aa * 2, aa * 6], solution: t(`Каждую аминокислоту кодирует триплет: ${aa}·3 = ${aa * 3} нуклеотидов`, `Each amino acid is a triplet: ${aa}·3 = ${aa * 3}`) };
    },
  },
  {
    id: 'pyramid', subject: 'biology', grade: 9, topics: ['b9-food-chains', 'b11-ecosystem', 'b5-communities'], title: t('Правило 10%', 'The 10% rule'),
    make: (r) => {
      const E = pick(r, [10000, 50000, 100000, 200000]);
      const lv = int(r, 2, 4);
      const ans = E / 10 ** (lv - 1);
      const names = [t('продуцентов', 'producers'), t('консументов I порядка', 'primary consumers'), t('консументов II порядка', 'secondary consumers'), t('консументов III порядка', 'tertiary consumers')];
      return { prompt: t(`В растениях запасено ${E} кДж энергии. Сколько дойдёт до ${names[lv - 1].ru}?`, `Plants store ${E} kJ. How much reaches the ${names[lv - 1].en}?`), answer: ans, unit: U.kJ, wrong: [E / 10 ** lv, E / 10 ** (lv - 2), E / (lv * 10)], solution: t(`На каждый следующий уровень переходит ~10%: ${E}·0,1^${lv - 1} = ${ans} кДж`, `About 10% passes each level: ${ans} kJ`) };
    },
  },
  {
    id: 'chromosomes', subject: 'biology', grade: 10, topics: ['b10-meiosis', 'b9-reproduction', 'b9-mitosis', 'b10-cell-cycle'], title: t('Число хромосом', 'Chromosome number'),
    make: (r) => {
      const o = pick(r, [{ ru: 'человека', en: 'a human', n2: 46 }, { ru: 'собаки', en: 'a dog', n2: 78 }, { ru: 'дрозофилы', en: 'a fruit fly', n2: 8 }, { ru: 'картофеля', en: 'a potato', n2: 48 }, { ru: 'кошки', en: 'a cat', n2: 38 }]);
      const meiosis = r() < 0.5;
      return meiosis
        ? { prompt: t(`В соматических клетках ${o.ru} ${o.n2} хромосом. Сколько хромосом в гамете?`, `Body cells of ${o.en} have ${o.n2} chromosomes. How many are in a gamete?`), answer: o.n2 / 2, wrong: [o.n2, o.n2 * 2, o.n2 / 4], solution: t('Гаметы гаплоидны (n): число хромосом вдвое меньше.', 'Gametes are haploid (n): half the chromosomes.') }
        : { prompt: t(`В соматических клетках ${o.ru} ${o.n2} хромосом. Сколько хромосом будет в каждой клетке после митоза?`, `Body cells of ${o.en} have ${o.n2} chromosomes. How many does each cell have after mitosis?`), answer: o.n2, wrong: [o.n2 / 2, o.n2 * 2, o.n2 * 4], solution: t('Митоз сохраняет набор: дочерние клетки получают столько же хромосом (2n).', 'Mitosis keeps the set: daughter cells have the same number (2n).') };
    },
  },
  {
    id: 'glucose', subject: 'biology', grade: 10, topics: ['b10-photosynthesis', 'b6-photosynthesis', 'b10-energy-metabolism'], title: t('Фотосинтез и дыхание', 'Photosynthesis and respiration'),
    make: (r) => {
      const g = int(r, 1, 6);
      const resp = r() < 0.5;
      return resp
        ? { prompt: t(`Сколько молекул АТФ даёт полное окисление ${g} молекул глюкозы (≈38 АТФ на молекулу)?`, `How many ATP does fully oxidising ${g} glucose molecules give (≈38 each)?`), answer: g * 38, wrong: [g * 2, g * 36, g * 19], solution: t(`${g}·38 = ${g * 38} АТФ (2 при гликолизе и 36 в митохондриях на каждую молекулу).`, `${g}·38 = ${g * 38} ATP.`) }
        : { prompt: t(`6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Сколько молекул CO₂ нужно для синтеза ${g} молекул глюкозы?`, `How many CO₂ molecules are needed to make ${g} glucose molecules?`), answer: g * 6, wrong: [g, g * 12, g * 3], solution: t(`На одну глюкозу — 6 CO₂: ${g}·6 = ${g * 6}`, `6 CO₂ per glucose: ${g * 6}`) };
    },
  },
  /* ===== exam set: physics ===== */
  {
    id: 'avg-speed', subject: 'physics', grade: 9, topics: ['p9-uniform', 'p10-uniform'], title: t('Средняя скорость', 'Average speed'),
    make: (r) => {
      const [v1, v2] = pick(r, [[60, 40], [30, 60], [40, 120], [20, 80], [90, 45], [36, 72]]);
      const v = (2 * v1 * v2) / (v1 + v2);
      return { prompt: t(`Первую половину пути машина ехала со скоростью ${v1} км/ч, вторую — ${v2} км/ч. Найди среднюю скорость на всём пути.`, `A car covers the first half of the way at ${v1} km/h and the second at ${v2} km/h. Find the average speed.`), answer: v, unit: U.kmh, wrong: [(v1 + v2) / 2, v1 + v2, Math.abs(v1 - v2)], solution: t(`Пусть каждая половина s. t = s/${v1} + s/${v2}; v = 2s / t = 2·${v1}·${v2} / (${v1} + ${v2}) = ${n(v)} км/ч. Среднее арифметическое (${(v1 + v2) / 2}) — частая ловушка.`, `v = 2v₁v₂/(v₁ + v₂) = ${v} km/h, not the arithmetic mean ${(v1 + v2) / 2}.`) };
    },
  },
  {
    id: 'throw-up', subject: 'physics', grade: 9, topics: ['p9-freefall', 'p10-projectile', 'p9-energy'], title: t('Бросок вверх', 'Vertical throw'),
    make: (r) => {
      const v = int(r, 2, 6) * 5;
      const h = (v * v) / 20;
      return { prompt: t(`Мяч бросили вертикально вверх со скоростью ${v} м/с. На какую высоту он поднимется? (g = 10 м/с², сопротивление воздуха не учитывать)`, `A ball is thrown straight up at ${v} m/s. How high does it rise? (g = 10 m/s²)`), answer: h, unit: U.m, wrong: [(v * v) / 10, v / 2, (v * v) / 2], solution: t(`h = v² / 2g = ${v}² / 20 = ${n(h)} м`, `h = v²/2g = ${h} m`) };
    },
  },
  {
    id: 'horizontal-throw', subject: 'physics', grade: 10, topics: ['p10-projectile'], title: t('Горизонтальный бросок', 'Horizontal throw'),
    make: (r) => {
      const h = pick(r, [5, 20, 45, 80, 125]);
      const v = int(r, 2, 10);
      const tt = Math.sqrt(h / 5);
      return { prompt: t(`Камень бросили горизонтально с высоты ${h} м со скоростью ${v} м/с. На каком расстоянии от места броска (по горизонтали) он упадёт? (g = 10 м/с²)`, `A stone is thrown horizontally from ${h} m at ${v} m/s. How far away does it land? (g = 10 m/s²)`), answer: v * tt, unit: U.m, wrong: [(v * 2 * h) / 10, v * tt * 2, v * h], solution: t(`Время падения t = √(2h/g) = √(${2 * h}/10) = ${tt} с; L = v·t = ${v}·${tt} = ${v * tt} м`, `t = √(2h/g) = ${tt} s; L = vt = ${v * tt} m`) };
    },
  },
  {
    id: 'friction', subject: 'physics', grade: 10, topics: ['p10-friction', 'p7-friction'], title: t('Сила трения', 'Friction force'),
    make: (r) => {
      const m = int(r, 2, 50);
      const mu = pick(r, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
      const F = round(mu * m * 10, 2);
      return { prompt: t(`Брусок массой ${m} кг тянут по горизонтальному столу равномерно. Коэффициент трения ${n(mu)}. Какова сила трения? (g = 10 м/с²)`, `A ${m} kg block slides steadily on a table, μ = ${mu}. Find the friction force (g = 10 m/s²).`), answer: F, unit: U.N, wrong: [round(mu * m, 2), m * 10, round(F * 10, 1)], solution: t(`F = μ·N = μ·m·g = ${n(mu)}·${m}·10 = ${n(F)} Н`, `F = μmg = ${F} N`) };
    },
  },
  {
    id: 'pendulum', subject: 'physics', grade: 9, topics: ['p9-harmonic', 'p9-oscillation-quantities', 'p11-free-osc'], title: t('Математический маятник', 'Simple pendulum'),
    make: (r) => {
      const l = pick(r, [0.25, 1, 2.25, 4]);
      const T = 2 * Math.sqrt(l);
      return { prompt: t(`Найди период колебаний математического маятника длиной ${n(l)} м. Считай g ≈ π² м/с².`, `Find the period of a ${l} m pendulum. Take g ≈ π² m/s².`), answer: T, unit: U.s, wrong: [2 * l, Math.sqrt(l), 4 * Math.sqrt(l)], solution: t(`T = 2π√(l/g) = 2π√(${n(l)}/π²) = 2√${n(l)} = ${n(T)} с`, `T = 2π√(l/g) = 2√l = ${T} s`) };
    },
  },
  {
    id: 'spring-period', subject: 'physics', grade: 11, topics: ['p11-free-osc', 'p9-harmonic'], title: t('Пружинный маятник', 'Mass on a spring'),
    make: (r) => {
      const ratio = pick(r, [0.01, 0.04, 0.09, 0.16, 0.25]);
      const m = pick(r, [0.1, 0.2, 0.4, 0.5, 1]);
      const k = round(m / ratio, 2);
      const s = Math.sqrt(ratio);
      return { prompt: t(`Груз массой ${n(m)} кг висит на пружине жёсткостью ${n(k)} Н/м. Найди период колебаний (π = 3,14).`, `A ${m} kg mass hangs on a ${k} N/m spring. Find the period (π = 3.14).`), answer: round(6.28 * s, 2), unit: U.s, wrong: [round(6.28 * ratio, 3), round(3.14 * s, 2), round(6.28 / s, 1)], solution: t(`T = 2π√(m/k) = 6,28·√(${n(m)}/${n(k)}) = 6,28·${n(s)} = ${n(round(6.28 * s, 2))} с`, `T = 2π√(m/k) = ${round(6.28 * s, 2)} s`) };
    },
  },
  {
    id: 'mixing', subject: 'physics', grade: 8, topics: ['p8-heat-balance', 'p8-heat-quantity'], title: t('Смешивание воды', 'Mixing water'),
    make: (r) => {
      const m1 = int(r, 1, 5);
      const m2 = int(r, 1, 5);
      const t1 = int(r, 1, 3) * 10;
      const t2 = int(r, 6, 9) * 10;
      const tt = (m1 * t1 + m2 * t2) / (m1 + m2);
      return { prompt: t(`Смешали ${m1} кг воды при ${t1} °C и ${m2} кг воды при ${t2} °C. Какая установится температура? (потерями тепла пренебречь)`, `Mix ${m1} kg of water at ${t1} °C with ${m2} kg at ${t2} °C. What is the final temperature?`), answer: round(tt, 1), unit: t('°C', '°C'), digits: 1, wrong: [(t1 + t2) / 2, t2 - t1, round((m1 * t2 + m2 * t1) / (m1 + m2), 1)], solution: t(`Тепло отданное = тепло полученное: ${m2}·(${t2} − t) = ${m1}·(t − ${t1}) ⇒ t = (${m1}·${t1} + ${m2}·${t2}) / ${m1 + m2} = ${n(round(tt, 1))} °C`, `t = (m₁t₁ + m₂t₂)/(m₁ + m₂) = ${round(tt, 1)} °C`) };
    },
  },
  {
    id: 'melting', subject: 'physics', grade: 8, topics: ['p8-melting'], title: t('Плавление льда', 'Melting ice'),
    make: (r) => {
      const m = pick(r, [0.5, 1, 2, 3, 4, 5]);
      return { prompt: t(`Сколько теплоты нужно, чтобы расплавить ${n(m)} кг льда, взятого при 0 °C? (λ = 330 кДж/кг)`, `How much heat melts ${m} kg of ice at 0 °C? (λ = 330 kJ/kg)`), answer: 330 * m, unit: U.kJ, wrong: [round(330 / m, 1), 2300 * m, 33 * m], solution: t(`Q = λm = 330·${n(m)} = ${n(330 * m)} кДж (лёд уже при 0 °C, нагревать не нужно)`, `Q = λm = ${330 * m} kJ`) };
    },
  },
  {
    id: 'boiling', subject: 'physics', grade: 8, topics: ['p8-boiling', 'p8-evaporation'], title: t('Парообразование', 'Vaporisation'),
    make: (r) => {
      const m = pick(r, [0.2, 0.5, 1, 2, 3]);
      return { prompt: t(`Сколько теплоты нужно, чтобы превратить в пар ${n(m)} кг воды при 100 °C? (L = 2,3 МДж/кг)`, `How much heat turns ${m} kg of water at 100 °C into steam? (L = 2.3 MJ/kg)`), answer: round(2.3 * m, 2), unit: U.MJ, wrong: [round(0.33 * m, 3), round(2.3 / m, 2), round(23 * m, 1)], solution: t(`Q = Lm = 2,3·${n(m)} = ${n(round(2.3 * m, 2))} МДж`, `Q = Lm = ${round(2.3 * m, 2)} MJ`) };
    },
  },
  {
    id: 'clapeyron', subject: 'physics', grade: 10, topics: ['p10-clapeyron', 'p10-ideal-gas'], title: t('Уравнение Менделеева–Клапейрона', 'Ideal gas equation'),
    make: (r) => {
      const nu = int(r, 1, 5);
      const T = pick(r, [300, 350, 400, 500]);
      const V = pick(r, [0.01, 0.02, 0.05, 0.1]);
      const p = round((nu * 8.31 * T) / V / 1000, 1);
      return { prompt: t(`${nu} моль идеального газа занимают объём ${n(V)} м³ при температуре ${T} К. Найди давление газа (R = 8,31 Дж/(моль·К)).`, `${nu} mol of ideal gas fill ${V} m³ at ${T} K. Find the pressure (R = 8.31).`), answer: p, unit: U.kPa, digits: 1, wrong: [round(nu * 8.31 * T * V / 1000, 2), round((nu * 8.31 * (T - 273)) / V / 1000, 1), round(p * 1000, 0)], solution: t(`pV = νRT ⇒ p = νRT / V = ${nu}·8,31·${T} / ${n(V)} ≈ ${n(p)} кПа`, `p = νRT/V ≈ ${p} kPa`) };
    },
  },
  {
    id: 'field-strength', subject: 'physics', grade: 8, topics: ['p8-electric-field', 'p10-field'], title: t('Напряжённость поля', 'Field strength'),
    make: (r) => {
      const q = int(r, 2, 9);
      const k = int(r, 1, 9);
      const F = q * k;
      return { prompt: t(`На заряд ${q} мкКл в электрическом поле действует сила ${F} мН. Найди напряжённость поля.`, `A ${q} µC charge feels a ${F} mN force. Find the field strength.`), answer: k * 1000, unit: t('Н/Кл', 'N/C'), wrong: [F * q, k, round(1000 / k, 1)], solution: t(`E = F / q = ${F}·10⁻³ / ${q}·10⁻⁶ = ${k * 1000} Н/Кл`, `E = F/q = ${k * 1000} N/C`) };
    },
  },
  {
    id: 'cap-energy', subject: 'physics', grade: 10, topics: ['p10-capacitors'], title: t('Энергия конденсатора', 'Capacitor energy'),
    make: (r) => {
      const C = pick(r, [2, 4, 5, 10, 20]);
      const Uv = pick(r, [10, 20, 50, 100]);
      const W = (C * Uv * Uv) / 2 / 1000;
      return { prompt: t(`Конденсатор ёмкостью ${C} мкФ заряжен до ${Uv} В. Какая энергия в нём запасена?`, `A ${C} µF capacitor is charged to ${Uv} V. How much energy does it store?`), answer: W, unit: t('мДж', 'mJ'), wrong: [W * 2, (C * Uv) / 2 / 1000, (C * Uv * Uv) / 2], solution: t(`W = CU²/2 = ${C}·10⁻⁶·${Uv}² / 2 = ${n(W)}·10⁻³ Дж = ${n(W)} мДж`, `W = CU²/2 = ${W} mJ`) };
    },
  },
  {
    id: 'ampere-force', subject: 'physics', grade: 9, topics: ['p9-ampere', 'p11-ampere'], title: t('Сила Ампера', 'Ampère force'),
    make: (r) => {
      const B = pick(r, [0.1, 0.2, 0.5]);
      const I = int(r, 2, 10);
      const Lm = pick(r, [0.2, 0.5, 1]);
      const F = round(B * I * Lm, 3);
      return { prompt: t(`Проводник длиной ${n(Lm)} м с током ${I} А расположен перпендикулярно линиям поля с индукцией ${n(B)} Тл. Найди силу Ампера.`, `A ${Lm} m wire with ${I} A lies across a ${B} T field. Find the force.`), answer: F, unit: U.N, wrong: [round((B * I) / Lm, 2), round(F * 10, 2), I * Lm], solution: t(`F = B·I·L·sin 90° = ${n(B)}·${I}·${n(Lm)} = ${n(F)} Н`, `F = BIL = ${F} N`) };
    },
  },
  {
    id: 'induction-emf', subject: 'physics', grade: 11, topics: ['p11-flux-law', 'p9-induction'], title: t('ЭДС индукции', 'Induced EMF'),
    make: (r) => {
      const N = pick(r, [1, 10, 50, 100]);
      const dF = int(r, 2, 20);
      const dt = pick(r, [0.1, 0.2, 0.5]);
      const e = round((N * dF * 1e-3) / dt, 3);
      return { prompt: t(`Магнитный поток через катушку из ${N} витков равномерно изменился на ${dF} мВб за ${n(dt)} с. Найди ЭДС индукции.`, `The flux through a ${N}-turn coil changes by ${dF} mWb in ${dt} s. Find the induced EMF.`), answer: e, unit: U.V, wrong: [round((dF * 1e-3) / dt, 4), round(N * dF * 1e-3 * dt, 4), round((N * dF) / dt, 0)], solution: t(`ε = N·ΔΦ/Δt = ${N}·${dF}·10⁻³ / ${n(dt)} = ${n(e)} В`, `ε = NΔΦ/Δt = ${e} V`) };
    },
  },
  {
    id: 'transformer', subject: 'physics', grade: 11, topics: ['p11-generator', 'p9-ac'], title: t('Трансформатор', 'Transformer'),
    make: (r) => {
      const U1 = pick(r, [220, 110, 380]);
      const N1 = pick(r, [500, 1000, 2000]);
      const N2 = pick(r, [50, 100, 250, 500]);
      const U2 = round((U1 * N2) / N1, 1);
      return { prompt: t(`Первичная обмотка трансформатора — ${N1} витков, вторичная — ${N2}. На первичную подали ${U1} В. Какое напряжение на вторичной?`, `A transformer has ${N1} primary and ${N2} secondary turns; ${U1} V is applied. Find the secondary voltage.`), answer: U2, unit: U.V, digits: 1, wrong: [round((U1 * N1) / N2, 1), round(U1 / N2, 2), round(U2 * 2, 1)], solution: t(`U₂ / U₁ = N₂ / N₁ ⇒ U₂ = ${U1}·${N2} / ${N1} = ${n(U2)} В`, `U₂ = U₁N₂/N₁ = ${U2} V`) };
    },
  },
  {
    id: 'photoeffect', subject: 'physics', grade: 11, topics: ['p11-quanta'], title: t('Уравнение Эйнштейна', 'Photoelectric equation'),
    make: (r) => {
      const metal = pick(r, [{ A: 2.3, ru: 'натрия', en: 'sodium' }, { A: 1.9, ru: 'цезия', en: 'caesium' }, { A: 2.2, ru: 'калия', en: 'potassium' }, { A: 4.3, ru: 'цинка', en: 'zinc' }]);
      const E = round(metal.A + int(r, 3, 25) / 10, 1);
      const Ek = round(E - metal.A, 1);
      return { prompt: t(`Фотон с энергией ${n(E)} эВ выбивает электрон из ${metal.ru} (работа выхода ${n(metal.A)} эВ). Какова максимальная кинетическая энергия электрона?`, `A ${E} eV photon ejects an electron from ${metal.en} (work function ${metal.A} eV). Find the maximum kinetic energy.`), answer: Ek, unit: U.eV, digits: 1, wrong: [round(E + metal.A, 1), metal.A, E], solution: t(`hν = A + Eₖ ⇒ Eₖ = ${n(E)} − ${n(metal.A)} = ${n(Ek)} эВ`, `Eₖ = hν − A = ${Ek} eV`) };
    },
  },
  {
    id: 'refraction-speed', subject: 'physics', grade: 11, topics: ['p11-geometric', 'p11-light-speed'], title: t('Скорость света в среде', 'Speed of light in a medium'),
    make: (r) => {
      const m = pick(r, [{ n: 1.33, ru: 'воде', en: 'water' }, { n: 1.5, ru: 'стекле', en: 'glass' }, { n: 2.42, ru: 'алмазе', en: 'diamond' }, { n: 1.2, ru: 'среде с n = 1,2', en: 'a medium with n = 1.2' }]);
      const v = Math.round(300 / m.n);
      return { prompt: t(`Показатель преломления равен ${n(m.n)}. С какой скоростью свет идёт в ${m.ru}? (c = 300 тыс. км/с)`, `The refractive index is ${m.n}. How fast does light travel in ${m.en}? (c = 300 thousand km/s)`), answer: v, unit: t('тыс. км/с', 'thousand km/s'), digits: 0, wrong: [Math.round(300 * m.n), 300, Math.round(300 - m.n * 100)], solution: t(`n = c / v ⇒ v = c / n = 300 / ${n(m.n)} ≈ ${v} тыс. км/с`, `v = c/n ≈ ${v} thousand km/s`) };
    },
  },
  /* ===== exam set: chemistry ===== */
  {
    id: 'molarity', subject: 'chemistry', grade: 9, topics: ['c8-solutions', 'c9-electrolytes'], title: t('Молярная концентрация', 'Molar concentration'),
    make: (r) => {
      const V = pick(r, [0.25, 0.5, 1, 2]);
      const c = pick(r, [0.1, 0.2, 0.5, 1, 2]);
      const m = round(40 * c * V, 2);
      return { prompt: t(`В ${n(V)} л раствора содержится ${n(m)} г NaOH. Найди молярную концентрацию (M(NaOH) = 40 г/моль).`, `${V} L of solution contains ${m} g of NaOH. Find the molar concentration (M = 40 g/mol).`), answer: c, unit: t('моль/л', 'mol/L'), wrong: [round(m / V, 2), round(m / 40, 3), round(c * V, 3)], solution: t(`n = m / M = ${n(m)} / 40 = ${n(round(m / 40, 3))} моль; c = n / V = ${n(round(m / 40, 3))} / ${n(V)} = ${n(c)} моль/л`, `c = (m/M)/V = ${c} mol/L`) };
    },
  },
  {
    id: 'dilution', subject: 'chemistry', grade: 8, topics: ['c8-solutions'], title: t('Разбавление раствора', 'Diluting a solution'),
    make: (r) => {
      const m = pick(r, [100, 200, 250, 400, 500]);
      const w1 = pick(r, [10, 20, 25, 30, 40]);
      const k = pick(r, [0.25, 1, 3]);
      const water = m * k;
      const w2 = round(w1 / (1 + k), 1);
      return { prompt: t(`К ${m} г ${w1}%-го раствора соли добавили ${water} г воды. Какой стала массовая доля соли?`, `${water} g of water is added to ${m} g of a ${w1}% salt solution. What is the new mass fraction?`), answer: w2, unit: U.pct, digits: 1, wrong: [round(w1 * (1 + k), 1), round((w1 * m) / water, 1), round(w1 - w1 * k, 1)], solution: t(`m(соли) = ${m}·${w1}% = ${(m * w1) / 100} г; m(раствора) = ${m} + ${water} = ${m + water} г; w = ${(m * w1) / 100} / ${m + water} = ${n(w2)}%`, `w = ${(m * w1) / 100} / ${m + water} = ${w2}%`) };
    },
  },
  {
    id: 'yield', subject: 'chemistry', grade: 9, topics: ['c8-equations', 'c9-alkali', 'c9-carbon'], title: t('Выход продукта', 'Product yield'),
    make: (r) => {
      const a = int(r, 1, 5);
      const eta = pick(r, [75, 80, 85, 90]);
      const mPr = round((56 * a * eta) / 100, 1);
      return { prompt: t(`CaCO₃ → CaO + CO₂. При обжиге ${100 * a} г известняка получили оксид кальция с выходом ${eta}%. Сколько граммов CaO получили?`, `CaCO₃ → CaO + CO₂. Roasting ${100 * a} g of limestone gives CaO with ${eta}% yield. How many grams of CaO?`), answer: mPr, unit: U.g, digits: 1, wrong: [56 * a, round((100 * a * eta) / 100, 1), round((56 * a * 100) / eta, 1)], solution: t(`n(CaCO₃) = ${100 * a} / 100 = ${a} моль = n(CaO); m(теор) = ${a}·56 = ${56 * a} г; m(практ) = ${56 * a}·${eta}% = ${n(mPr)} г`, `m = ${56 * a}·${eta}% = ${mPr} g`) };
    },
  },
  {
    id: 'avogadro', subject: 'chemistry', grade: 8, topics: ['c8-mole'], title: t('Число Авогадро', 'Avogadro’s number'),
    make: (r) => {
      const nu = pick(r, [0.5, 1, 2, 3, 5]);
      const m = 18 * nu;
      const sci = (x: number) => {
        let e = 23;
        let v = x;
        while (v >= 10) {
          v /= 10;
          e++;
        }
        return `${String(round(v, 2)).replace('.', ',')}·10${e === 23 ? '²³' : e === 24 ? '²⁴' : '²⁵'}`;
      };
      const ans = sci(6.02 * nu);
      return { prompt: t(`Сколько молекул содержится в ${n(m)} г воды? (M = 18 г/моль, Nₐ = 6,02·10²³ моль⁻¹)`, `How many molecules are in ${m} g of water? (M = 18 g/mol, Nₐ = 6.02·10²³)`), answer: ans, wrong: [sci(6.02 * m), sci(round(6.02 * nu * 3, 2)), sci(6.02 * nu * 10)].filter((w) => w !== ans), solution: t(`n = ${n(m)} / 18 = ${n(nu)} моль; N = n·Nₐ = ${n(nu)}·6,02·10²³ = ${ans}`, `N = nNₐ = ${ans}`) };
    },
  },
  {
    id: 'rel-density', subject: 'chemistry', grade: 8, topics: ['c8-masses', 'c8-mole'], title: t('Относительная плотность газа', 'Relative gas density'),
    make: (r) => {
      const g = pick(r, [{ f: 'CO₂', M: 44 }, { f: 'CH₄', M: 16 }, { f: 'O₂', M: 32 }, { f: 'NH₃', M: 17 }, { f: 'SO₂', M: 64 }, { f: 'N₂', M: 28 }, { f: 'C₂H₆', M: 30 }]);
      return { prompt: t(`Найди относительную плотность ${g.f} по водороду.`, `Find the density of ${g.f} relative to hydrogen.`), answer: g.M / 2, digits: 1, wrong: [g.M, g.M * 2, round(g.M / 29, 2)], solution: t(`D(H₂) = M(${g.f}) / M(H₂) = ${g.M} / 2 = ${n(g.M / 2)}`, `D = M/2 = ${g.M / 2}`) };
    },
  },
  {
    id: 'excess', subject: 'chemistry', grade: 9, topics: ['c8-equations', 'c8-acids', 'c9-metals-general'], title: t('Задача на избыток', 'Limiting reagent'),
    make: (r) => {
      const a = int(r, 1, 4);
      let b = int(r, 1, 8);
      if (b === 2 * a) b += 1;
      const lim = Math.min(a, b / 2);
      const V = round(lim * 22.4, 2);
      return { prompt: t(`Zn + 2HCl → ZnCl₂ + H₂↑. Смешали ${65 * a} г цинка и ${n(36.5 * b)} г HCl. Какой объём водорода (н. у.) выделится?`, `Zn + 2HCl → ZnCl₂ + H₂. ${65 * a} g of zinc reacts with ${36.5 * b} g of HCl. What volume of H₂ forms (STP)?`), answer: V, unit: U.L, digits: 2, wrong: [round(Math.max(a, b / 2) * 22.4, 2), round(b * 22.4, 2), round((a + b) * 22.4, 2)], solution: t(`n(Zn) = ${a} моль, n(HCl) = ${b} моль. На ${a} моль Zn нужно ${2 * a} моль HCl — ${b < 2 * a ? 'кислоты не хватает, считаем по HCl' : 'кислота в избытке, считаем по цинку'}: n(H₂) = ${n(lim)} моль, V = ${n(lim)}·22,4 = ${n(V)} л`, `Limiting reagent: ${b < 2 * a ? 'HCl' : 'Zn'}; n(H₂) = ${lim} mol, V = ${V} L`) };
    },
  },
  {
    id: 'formula-find', subject: 'chemistry', grade: 10, topics: ['c10-formula-problems', 'c8-formulas-valence'], title: t('Вывод формулы', 'Finding the formula'),
    make: (r) => {
      const c = pick(r, [
        { q: t('Оксид железа содержит 70% железа по массе.', 'An iron oxide is 70% iron by mass.'), a: 'Fe₂O₃', w: ['FeO', 'Fe₃O₄', 'FeO₂'], ex: '70/56 : 30/16 = 1,25 : 1,875 = 2 : 3' },
        { q: t('Оксид железа содержит 77,8% железа по массе.', 'An iron oxide is 77.8% iron by mass.'), a: 'FeO', w: ['Fe₂O₃', 'Fe₃O₄', 'Fe₂O'], ex: '77,8/56 : 22,2/16 = 1,39 : 1,39 = 1 : 1' },
        { q: t('Углеводород: 75% углерода, 25% водорода.', 'A hydrocarbon is 75% C and 25% H.'), a: 'CH₄', w: ['C₂H₆', 'C₂H₄', 'CH₂'], ex: '75/12 : 25/1 = 6,25 : 25 = 1 : 4' },
        { q: t('Углеводород: 80% углерода, 20% водорода.', 'A hydrocarbon is 80% C and 20% H.'), a: 'C₂H₆', w: ['CH₄', 'C₂H₄', 'C₃H₈'], ex: '80/12 : 20/1 = 6,67 : 20 = 1 : 3 ⇒ CH₃, реальная формула C₂H₆' },
        { q: t('Углеводород: 85,7% углерода, плотность по водороду 14.', 'A hydrocarbon: 85.7% C, density relative to H₂ is 14.'), a: 'C₂H₄', w: ['CH₂', 'C₂H₆', 'C₃H₆'], ex: '85,7/12 : 14,3/1 = 1 : 2 ⇒ (CH₂)ₙ; M = 14·2 = 28 ⇒ n = 2' },
      ]);
      return { prompt: t(`${c.q.ru} Какова формула вещества?`, `${c.q.en} What is its formula?`), answer: c.a, wrong: c.w, solution: t(`Делим массовые доли на атомные массы: ${c.ex} ⇒ ${c.a}`, `Divide the mass fractions by atomic masses: ${c.ex} ⇒ ${c.a}`) };
    },
  },
  /* ===== exam set: biology ===== */
  {
    id: 'dihybrid', subject: 'biology', grade: 10, topics: ['b10-gene-interaction', 'b10-mendel-laws', 'b9-mendel'], title: t('Дигибридное скрещивание', 'Dihybrid cross'),
    make: (r) => {
      const c = pick(r, [
        { ph: t('жёлтые гладкие', 'yellow smooth'), a: '9/16' },
        { ph: t('жёлтые морщинистые', 'yellow wrinkled'), a: '3/16' },
        { ph: t('зелёные гладкие', 'green smooth'), a: '3/16' },
        { ph: t('зелёные морщинистые', 'green wrinkled'), a: '1/16' },
      ]);
      const all = ['9/16', '3/16', '1/16', '1/4', '3/4', '1/2'];
      return { prompt: t(`У гороха жёлтая окраска (A) доминирует над зелёной, гладкая форма (B) — над морщинистой. Скрещивают AaBb × AaBb. Какая доля потомков будет ${c.ph.ru}?`, `In peas yellow (A) is dominant over green and smooth (B) over wrinkled. AaBb × AaBb: what share of offspring are ${c.ph.en}?`), answer: c.a, wrong: all.filter((x) => x !== c.a).slice(0, 3), solution: t(`Решётка Пеннета даёт расщепление 9 : 3 : 3 : 1 (A_B_ : A_bb : aaB_ : aabb). ${c.ph.ru} — ${c.a}.`, `The Punnett square gives 9 : 3 : 3 : 1; ${c.ph.en} is ${c.a}.`) };
    },
  },
  {
    id: 'blood-groups', subject: 'biology', grade: 11, topics: ['b11-human-methods', 'b10-gene-interaction', 'b11-hereditary-diseases'], title: t('Группы крови', 'Blood groups'),
    make: (r) => {
      const c = pick(r, [
        { p: 'IᴬI⁰ × IᴮI⁰', q: t('I (0)', 'O'), a: 25, w: [0, 50, 75], ex: t('Потомки: IᴬIᴮ, IᴬI⁰, IᴮI⁰, I⁰I⁰ — по 1/4; группа I только у I⁰I⁰.', 'Children: AB, A, B, O, each 1/4.') },
        { p: 'IᴬIᴬ × IᴮIᴮ', q: t('IV (AB)', 'AB'), a: 100, w: [25, 50, 0], ex: t('Все дети IᴬIᴮ — IV группа (кодоминирование).', 'All children are IᴬIᴮ: group AB (codominance).') },
        { p: 'IᴬI⁰ × I⁰I⁰', q: t('II (A)', 'A'), a: 50, w: [25, 75, 100], ex: t('Потомки IᴬI⁰ и I⁰I⁰ поровну.', 'Children IᴬI⁰ and I⁰I⁰ in equal shares.') },
        { p: 'IᴬIᴮ × I⁰I⁰', q: t('IV (AB)', 'AB'), a: 0, w: [25, 50, 100], ex: t('Потомки только IᴬI⁰ и IᴮI⁰ — IV группы не будет.', 'Children are only IᴬI⁰ or IᴮI⁰: no AB.') },
      ]);
      return { prompt: t(`Генотипы родителей по группе крови: ${c.p}. Какова вероятность (%) рождения ребёнка с группой крови ${c.q.ru}?`, `Parents’ blood-group genotypes: ${c.p}. What is the chance (%) of a child with group ${c.q.en}?`), answer: c.a, unit: U.pct, wrong: c.w, solution: c.ex };
    },
  },
  {
    id: 'hemophilia', subject: 'biology', grade: 10, topics: ['b10-morgan', 'b9-linkage-sex', 'b11-hereditary-diseases'], title: t('Наследование, сцепленное с полом', 'Sex-linked inheritance'),
    make: (r) => {
      const c = pick(r, [
        { q: t('больного сына (от всех детей)', 'an affected son (of all children)'), a: 25, w: [50, 0, 100] },
        { q: t('больного ребёнка среди сыновей', 'an affected child among the sons'), a: 50, w: [25, 0, 100] },
        { q: t('больной дочери', 'an affected daughter'), a: 0, w: [25, 50, 100] },
        { q: t('дочери-носительницы среди дочерей', 'a carrier among the daughters'), a: 50, w: [25, 0, 100] },
      ]);
      return { prompt: t(`Мать — носительница гемофилии (XᴴXʰ), отец здоров (XᴴY). Какова вероятность (%) рождения ${c.q.ru}?`, `The mother carries haemophilia (XᴴXʰ), the father is healthy (XᴴY). What is the chance (%) of ${c.q.en}?`), answer: c.a, unit: U.pct, wrong: c.w, solution: t('Дети: XᴴXᴴ, XᴴXʰ (дочери здоровы, половина — носительницы), XᴴY, XʰY (половина сыновей больны). Каждый вариант — 1/4.', 'Children: XᴴXᴴ, XᴴXʰ, XᴴY, XʰY, each 1/4: daughters are healthy (half carriers), half of the sons are affected.') };
    },
  },
  {
    id: 'hardy-weinberg', subject: 'biology', grade: 11, topics: ['b11-populations', 'b11-species-population', 'b9-species-population'], title: t('Закон Харди–Вайнберга', 'Hardy–Weinberg law'),
    make: (r) => {
      const q = pick(r, [0.1, 0.2, 0.3, 0.4, 0.5]);
      const rec = round(q * q * 100, 1);
      const het = round(2 * q * (1 - q) * 100, 1);
      return { prompt: t(`В популяции ${n(rec)}% особей имеют рецессивный признак (aa). Какой процент гетерозиготных носителей (Aa)?`, `${rec}% of a population show the recessive trait (aa). What percentage are carriers (Aa)?`), answer: het, unit: U.pct, digits: 1, wrong: [round(rec * 2, 1), round(q * 100, 1), round((1 - q) * (1 - q) * 100, 1)], solution: t(`q² = ${n(q * q)} ⇒ q = ${n(q)}, p = ${n(1 - q)}; 2pq = 2·${n(1 - q)}·${n(q)} = ${n(het / 100)} = ${n(het)}%`, `q = ${q}, p = ${1 - q}; 2pq = ${het}%`) };
    },
  },
  {
    id: 'dna-length', subject: 'biology', grade: 10, topics: ['b10-nucleic', 'b9-nucleic-atp', 'b10-replication'], title: t('Длина молекулы ДНК', 'DNA length'),
    make: (r) => {
      const pairs = int(r, 3, 30) * 100;
      const len = round(pairs * 0.34, 1);
      return { prompt: t(`Фрагмент ДНК содержит ${pairs} пар нуклеотидов. Какова его длина? (расстояние между нуклеотидами 0,34 нм)`, `A DNA fragment has ${pairs} base pairs. How long is it? (0.34 nm per pair)`), answer: len, unit: t('нм', 'nm'), digits: 1, wrong: [round(len * 2, 1), round(len / 2, 1), round(pairs / 0.34, 0)], solution: t(`Длину считают по одной цепи: L = ${pairs}·0,34 = ${n(len)} нм`, `L = ${pairs}·0.34 = ${len} nm (one strand)`) };
    },
  },
  {
    id: 'mrna-length', subject: 'biology', grade: 10, topics: ['b10-protein-synthesis', 'b9-protein-synthesis'], title: t('Белок, иРНК и ген', 'Protein, mRNA and gene'),
    make: (r) => {
      const N = int(r, 5, 40) * 10;
      const gene = r() < 0.5;
      return gene
        ? { prompt: t(`Белок состоит из ${N} аминокислот. Сколько нуклеотидов в участке ДНК (обе цепи), который его кодирует? (стоп-кодон не учитывать)`, `A protein has ${N} amino acids. How many nucleotides are in the coding DNA (both strands)? (ignore the stop codon)`), answer: N * 6, wrong: [N * 3, N * 2, N], solution: t(`Каждую аминокислоту кодирует триплет: в иРНК ${N}·3 = ${N * 3}; в двух цепях ДНК вдвое больше — ${N * 6}`, `3 per amino acid in mRNA (${N * 3}); twice that in double-stranded DNA: ${N * 6}`) }
        : { prompt: t(`Белок состоит из ${N} аминокислот. Сколько нуклеотидов в кодирующей его иРНК? (стоп-кодон не учитывать)`, `A protein has ${N} amino acids. How many nucleotides are in its mRNA? (ignore the stop codon)`), answer: N * 3, wrong: [N, N * 6, Math.round(N / 3)], solution: t(`Одна аминокислота — один кодон из 3 нуклеотидов: ${N}·3 = ${N * 3}`, `One codon (3 nucleotides) per amino acid: ${N * 3}`) };
    },
  },
];

/* ---------- to quiz questions ---------- */

export function problemQuestion(gen: ProblemGen, seed: number): Question {
  const r = rng(seed + hashStr(gen.id));
  const p = gen.make(r);
  const d = p.digits ?? 3;
  const show = (x: number | string, lang: 'ru' | 'en') => `${fmt(x, d, lang)}${p.unit ? ' ' + p.unit[lang] : ''}`;
  const right = { ru: show(p.answer, 'ru'), en: show(p.answer, 'en') };
  const seen = new Set([right.ru]);
  const wrong: { ru: string; en: string }[] = [];
  for (const w of p.wrong) {
    const o = { ru: show(w, 'ru'), en: show(w, 'en') };
    if (!seen.has(o.ru) && !(typeof w === 'number' && !Number.isFinite(w))) {
      seen.add(o.ru);
      wrong.push(o);
    }
  }
  // make sure there are always three wrong options
  for (let k = 2; wrong.length < 3 && typeof p.answer === 'number'; k++) {
    const o = { ru: show(round(p.answer * (k % 2 ? k : 1 / k), 3), 'ru'), en: show(round(p.answer * (k % 2 ? k : 1 / k), 3), 'en') };
    if (!seen.has(o.ru)) {
      seen.add(o.ru);
      wrong.push(o);
    }
  }
  const options = shuffle([right, ...wrong.slice(0, 3)], r);
  return { id: `prob:${gen.id}:${seed}`, topicId: gen.topics[0], prompt: p.prompt, options, correct: options.indexOf(right), explain: p.solution };
}

/** problems for a topic (used inside topic quizzes) */
export const problemsForTopic = (topicId: string) => PROBLEMS.filter((g) => g.topics.includes(topicId));
