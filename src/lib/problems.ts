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
