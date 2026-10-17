import type { ProblemGen } from './problems';
import { topicById } from '../data/curriculum';

/*
 * Procedural problems from the textbook's formulas.
 * Every law is a product of powers, y = K · x₁^e₁ · x₂^e₂ · …, so it can be solved for any of its quantities.
 * A problem picks fresh "nice" values, hides one quantity and asks for it; the wrong options are the
 * classic slips: forgetting the constant (½, 2π), the square or root, dividing instead of multiplying,
 * or skipping the unit conversion.
 */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

interface Qty {
  /** symbol as shown in the text */
  s: string;
  /** what to find, in the accusative: "Найди массу" */
  ru: string;
  en: string;
  u: T2;
  /** display unit → SI */
  si: number;
  vals: number[];
  /** a constant: given, never asked for */
  c?: boolean;
}
interface Law {
  topic: string;
  text: string;
  K?: number;
  /** how 1/K reads when the law is solved for a factor, e.g. ½ → "2" on top, 2π → "2π" below */
  kInv?: { num?: string; den?: string };
  y: Qty;
  x: [Qty, number][];
  ctx?: T2;
}

const q = (s: string, ru: string, en: string, uRu: string, uEn: string, vals: number[], si = 1): Qty => ({ s, ru, en, u: t(uRu, uEn), si, vals });
const C = (s: string, ru: string, en: string, uRu: string, uEn: string, value: number, si = 1): Qty => ({ s, ru, en, u: t(uRu, uEn), si, vals: [value], c: true });

/* ---------- common quantities ---------- */
const m = q('m', 'массу', 'the mass', 'кг', 'kg', [0.2, 0.5, 1, 2, 3, 4, 5, 8, 10, 20, 50]);
const mG = q('m', 'массу', 'the mass', 'г', 'g', [2, 4, 5, 8, 10, 16, 20, 32, 40, 50, 64, 100]);
const v = q('v', 'скорость', 'the speed', 'м/с', 'm/s', [2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
const tS = q('t', 'время', 'the time', 'с', 's', [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30]);
const s = q('s', 'путь', 'the distance', 'м', 'm', [10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200]);
const F = q('F', 'силу', 'the force', 'Н', 'N', [2, 5, 10, 20, 40, 50, 80, 100, 200, 500]);
const a = q('a', 'ускорение', 'the acceleration', 'м/с²', 'm/s²', [0.5, 1, 2, 3, 4, 5]);
const h = q('h', 'высоту', 'the height', 'м', 'm', [1, 2, 3, 5, 10, 20, 45, 80]);
const g = C('g', 'ускорение свободного падения', 'g', 'Н/кг', 'N/kg', 10);
const I = q('I', 'силу тока', 'the current', 'А', 'A', [0.5, 1, 2, 3, 4, 5, 6, 8, 10]);
const U = q('U', 'напряжение', 'the voltage', 'В', 'V', [2, 4, 6, 12, 24, 36, 110, 220]);
const R = q('R', 'сопротивление', 'the resistance', 'Ом', 'Ω', [2, 4, 5, 10, 20, 40, 50, 100]);
const kJ = (s0: string, ru: string, en: string) => q(s0, ru, en, 'кДж', 'kJ', [], 1e3);
const J = (s0: string, ru: string, en: string) => q(s0, ru, en, 'Дж', 'J', []);
const dens = q('ρж', 'плотность жидкости', 'the liquid density', 'кг/м³', 'kg/m³', [800, 1000, 1030, 1260]);
const kC = C('k', 'коэффициент', 'k', 'Н·м²/Кл²', 'N·m²/C²', 9e9);
const qC = q('q', 'заряд', 'the charge', 'мкКл', 'µC', [1, 2, 3, 4, 5, 8], 1e-6);
const rCm = q('r', 'расстояние', 'the distance', 'см', 'cm', [1, 2, 3, 5, 10], 0.01);
const Rgas = C('R', 'газовая постоянная', 'R', 'Дж/(моль·К)', 'J/(mol·K)', 8.31);
const nu = q('ν', 'количество вещества', 'the amount of substance', 'моль', 'mol', [0.5, 1, 2, 3, 4, 5]);
const T = q('T', 'температуру', 'the temperature', 'К', 'K', [250, 273, 300, 350, 400, 500]);
const pct = (s0: string, ru: string, en: string) => q(s0, ru, en, '%', '%', []);

const LAWS: Law[] = [
  /* ===== physics 7 ===== */
  { topic: 'p7-speed', text: 'v = s / t', y: v, x: [[s, 1], [tS, -1]] },
  { topic: 'p7-distance-time', text: 's = v · t', y: s, x: [[v, 1], [tS, 1]] },
  { topic: 'p7-density', text: 'ρ = m / V', y: q('ρ', 'плотность', 'the density', 'г/см³', 'g/cm³', []), x: [[q('m', 'массу', 'the mass', 'г', 'g', [27, 54, 78, 89, 113, 135, 156, 178, 270]), 1], [q('V', 'объём', 'the volume', 'см³', 'cm³', [10, 20, 30, 50, 100]), -1]] },
  { topic: 'p7-gravity', text: 'F = m · g', y: q('F', 'силу тяжести', 'the weight force', 'Н', 'N', []), x: [[m, 1], [g, 1]] },
  { topic: 'p7-elastic', text: 'F = k · Δx', y: q('F', 'силу упругости', 'the elastic force', 'Н', 'N', []), x: [[q('k', 'жёсткость пружины', 'the spring constant', 'Н/м', 'N/m', [50, 100, 200, 400, 500, 1000]), 1], [q('Δx', 'удлинение пружины', 'the extension', 'см', 'cm', [1, 2, 4, 5, 8, 10], 0.01), 1]] },
  { topic: 'p7-friction', text: 'F = μ · N', y: q('F', 'силу трения', 'the friction force', 'Н', 'N', []), x: [[q('μ', 'коэффициент трения', 'the friction coefficient', '', '', [0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), 1], [q('N', 'силу нормального давления', 'the normal force', 'Н', 'N', [10, 20, 50, 100, 200, 400]), 1]] },
  { topic: 'p7-pressure', text: 'p = F / S', y: q('p', 'давление', 'the pressure', 'Па', 'Pa', []), x: [[F, 1], [q('S', 'площадь опоры', 'the area', 'м²', 'm²', [0.01, 0.02, 0.05, 0.1, 0.2, 0.5]), -1]] },
  { topic: 'p7-liquid-pressure', text: 'p = ρ · g · h', y: q('p', 'давление жидкости', 'the liquid pressure', 'кПа', 'kPa', [], 1e3), x: [[dens, 1], [g, 1], [q('h', 'глубину', 'the depth', 'м', 'm', [0.5, 1, 2, 5, 10, 20]), 1]] },
  { topic: 'p7-hydraulic', text: 'F₂ = F₁ · S₂ / S₁', y: q('F₂', 'силу на большом поршне', 'the force on the large piston', 'Н', 'N', []), x: [[q('F₁', 'силу на малом поршне', 'the force on the small piston', 'Н', 'N', [50, 100, 200, 300]), 1], [q('S₂', 'площадь большого поршня', 'the large piston area', 'см²', 'cm²', [50, 100, 200, 400]), 1], [q('S₁', 'площадь малого поршня', 'the small piston area', 'см²', 'cm²', [2, 4, 5, 10]), -1]] },
  { topic: 'p7-archimedes', text: 'F = ρж · g · V', y: q('F', 'выталкивающую силу', 'the buoyant force', 'Н', 'N', []), x: [[dens, 1], [g, 1], [q('V', 'объём тела', 'the volume', 'дм³', 'dm³', [1, 2, 5, 10, 20], 1e-3), 1]], ctx: t('Тело полностью погружено в жидкость.', 'A body is fully submerged in a liquid.') },
  { topic: 'p7-work', text: 'A = F · s', y: J('A', 'работу', 'the work'), x: [[F, 1], [s, 1]] },
  { topic: 'p7-power', text: 'N = A / t', y: q('N', 'мощность', 'the power', 'Вт', 'W', []), x: [[q('A', 'работу', 'the work', 'Дж', 'J', [600, 1200, 1800, 3000, 4800, 6000]), 1], [tS, -1]] },
  { topic: 'p7-lever', text: 'F₂ = F₁ · l₁ / l₂', y: q('F₂', 'силу на втором плече', 'the second force', 'Н', 'N', []), x: [[q('F₁', 'силу на первом плече', 'the first force', 'Н', 'N', [10, 20, 40, 50, 100]), 1], [q('l₁', 'первое плечо', 'the first arm', 'м', 'm', [0.2, 0.3, 0.5, 0.8, 1]), 1], [q('l₂', 'второе плечо', 'the second arm', 'м', 'm', [0.1, 0.2, 0.4, 0.5]), -1]], ctx: t('Рычаг в равновесии.', 'A lever is balanced.') },
  { topic: 'p7-energy', text: 'Eп = m · g · h', y: J('Eп', 'потенциальную энергию', 'the potential energy'), x: [[m, 1], [g, 1], [h, 1]] },
  { topic: 'p7-energy', text: 'Eк = m · v² / 2', K: 0.5, kInv: { num: '2' }, y: J('Eк', 'кинетическую энергию', 'the kinetic energy'), x: [[m, 1], [v, 2]] },
  /* ===== physics 8 ===== */
  { topic: 'p8-heat-quantity', text: 'Q = c · m · Δt', y: kJ('Q', 'количество теплоты', 'the heat'), x: [[q('c', 'удельную теплоёмкость', 'the specific heat', 'Дж/(кг·°C)', 'J/(kg·°C)', [4200, 920, 460, 400, 2100]), 1], [q('m', 'массу', 'the mass', 'кг', 'kg', [0.5, 1, 2, 3, 5]), 1], [q('Δt', 'изменение температуры', 'the temperature change', '°C', '°C', [10, 20, 30, 40, 50, 80]), 1]] },
  { topic: 'p8-fuel', text: 'Q = q · m', y: q('Q', 'количество теплоты', 'the heat', 'МДж', 'MJ', [], 1e6), x: [[q('q', 'удельную теплоту сгорания', 'the heat of combustion', 'МДж/кг', 'MJ/kg', [10, 27, 30, 44, 46], 1e6), 1], [q('m', 'массу топлива', 'the fuel mass', 'кг', 'kg', [0.5, 1, 2, 5, 10]), 1]] },
  { topic: 'p8-melting', text: 'Q = λ · m', y: kJ('Q', 'количество теплоты', 'the heat'), x: [[q('λ', 'удельную теплоту плавления', 'the latent heat of fusion', 'кДж/кг', 'kJ/kg', [330, 25, 59, 84, 210], 1e3), 1], [q('m', 'массу', 'the mass', 'кг', 'kg', [0.5, 1, 2, 3, 5]), 1]], ctx: t('Вещество взято при температуре плавления.', 'The substance is at its melting point.') },
  { topic: 'p8-boiling', text: 'Q = L · m', y: q('Q', 'количество теплоты', 'the heat', 'МДж', 'MJ', [], 1e6), x: [[q('L', 'удельную теплоту парообразования', 'the latent heat of vaporisation', 'МДж/кг', 'MJ/kg', [2.3, 0.9, 0.4], 1e6), 1], [q('m', 'массу', 'the mass', 'кг', 'kg', [0.5, 1, 2, 3]), 1]], ctx: t('Жидкость взята при температуре кипения.', 'The liquid is at its boiling point.') },
  { topic: 'p8-heat-engines', text: 'η = Aпол / Qзатр · 100%', K: 100, kInv: { den: '100%' }, y: pct('η', 'КПД', 'the efficiency'), x: [[q('Aпол', 'полезную работу', 'the useful work', 'кДж', 'kJ', [100, 200, 300, 400, 500], 1e3), 1], [q('Qзатр', 'затраченную теплоту', 'the heat spent', 'кДж', 'kJ', [1000, 1200, 1500, 2000], 1e3), -1]] },
  { topic: 'p8-current-strength', text: 'I = q / t', y: I, x: [[q('q', 'заряд', 'the charge', 'Кл', 'C', [6, 10, 12, 30, 60, 120]), 1], [tS, -1]] },
  { topic: 'p8-voltage', text: 'U = A / q', y: U, x: [[q('A', 'работу тока', 'the work', 'Дж', 'J', [12, 24, 60, 120, 240, 600]), 1], [q('q', 'заряд', 'the charge', 'Кл', 'C', [2, 4, 5, 10, 20]), -1]] },
  { topic: 'p8-resistance', text: 'R = ρ · l / S', y: R, x: [[q('ρ', 'удельное сопротивление', 'the resistivity', 'Ом·мм²/м', 'Ω·mm²/m', [0.017, 0.028, 0.1, 0.4, 1.1]), 1], [q('l', 'длину проводника', 'the wire length', 'м', 'm', [1, 2, 5, 10, 20, 50]), 1], [q('S', 'площадь сечения', 'the cross-section', 'мм²', 'mm²', [0.1, 0.2, 0.5, 1, 2]), -1]] },
  { topic: 'p8-ohm', text: 'I = U / R', y: I, x: [[U, 1], [R, -1]] },
  { topic: 'p8-power-current', text: 'P = U · I', y: q('P', 'мощность тока', 'the power', 'Вт', 'W', []), x: [[U, 1], [I, 1]] },
  { topic: 'p8-joule-lenz', text: 'Q = I² · R · t', y: kJ('Q', 'количество теплоты', 'the heat'), x: [[q('I', 'силу тока', 'the current', 'А', 'A', [1, 2, 3, 4, 5]), 2], [R, 1], [q('t', 'время', 'the time', 'с', 's', [60, 120, 300, 600]), 1]] },
  { topic: 'p8-lenses', text: 'D = 1 / F', y: q('D', 'оптическую силу', 'the optical power', 'дптр', 'D', []), x: [[q('F', 'фокусное расстояние', 'the focal length', 'м', 'm', [0.1, 0.2, 0.25, 0.4, 0.5, 1, 2]), -1]] },
  /* ===== physics 9 ===== */
  { topic: 'p9-accelerated', text: 's = a · t² / 2', K: 0.5, kInv: { num: '2' }, y: s, x: [[a, 1], [tS, 2]], ctx: t('Тело начинает двигаться из состояния покоя.', 'A body starts from rest.') },
  { topic: 'p9-newton', text: 'F = m · a', y: F, x: [[m, 1], [a, 1]] },
  { topic: 'p9-freefall', text: 'h = g · t² / 2', K: 0.5, kInv: { num: '2' }, y: q('h', 'высоту падения', 'the drop height', 'м', 'm', []), x: [[g, 1], [q('t', 'время падения', 'the fall time', 'с', 's', [1, 2, 3, 4, 5]), 2]], ctx: t('Тело свободно падает без начальной скорости.', 'A body falls freely from rest.') },
  { topic: 'p9-gravitation', text: 'F = G · m₁ · m₂ / r²', y: q('F', 'силу притяжения', 'the attraction', 'Н', 'N', []), x: [[C('G', 'гравитационную постоянную', 'G', 'Н·м²/кг²', 'N·m²/kg²', 6.67e-11), 1], [q('m₁', 'массу первого тела', 'the first mass', 'т', 't', [10, 20, 50, 100], 1e3), 1], [q('m₂', 'массу второго тела', 'the second mass', 'т', 't', [10, 20, 50, 100], 1e3), 1], [q('r', 'расстояние', 'the distance', 'м', 'm', [1, 2, 5, 10, 20]), -2]] },
  { topic: 'p9-circular', text: 'a = v² / r', y: q('a', 'центростремительное ускорение', 'the centripetal acceleration', 'м/с²', 'm/s²', []), x: [[v, 2], [q('r', 'радиус окружности', 'the radius', 'м', 'm', [2, 4, 5, 10, 20, 50]), -1]] },
  { topic: 'p9-momentum', text: 'p = m · v', y: q('p', 'импульс', 'the momentum', 'кг·м/с', 'kg·m/s', []), x: [[m, 1], [v, 1]] },
  { topic: 'p9-oscillation-quantities', text: 'T = 2π · √(l / g)', K: 2 * Math.PI, kInv: { den: '2π' }, y: q('T', 'период колебаний', 'the period', 'с', 's', []), x: [[q('l', 'длину маятника', 'the pendulum length', 'м', 'm', [0.1, 0.4, 0.9, 1.6, 2.5]), 0.5], [g, -0.5]] },
  { topic: 'p9-waves', text: 'v = λ · ν', y: q('v', 'скорость волны', 'the wave speed', 'м/с', 'm/s', []), x: [[q('λ', 'длину волны', 'the wavelength', 'м', 'm', [0.5, 1, 2, 3, 5, 10]), 1], [q('ν', 'частоту', 'the frequency', 'Гц', 'Hz', [2, 5, 10, 50, 100, 170]), 1]] },
  { topic: 'p9-ampere', text: 'F = B · I · l', y: q('F', 'силу Ампера', 'the Ampère force', 'Н', 'N', []), x: [[q('B', 'индукцию поля', 'the field', 'Тл', 'T', [0.1, 0.2, 0.5, 1]), 1], [I, 1], [q('l', 'длину проводника', 'the wire length', 'м', 'm', [0.1, 0.2, 0.5, 1]), 1]], ctx: t('Проводник расположен перпендикулярно линиям поля.', 'The wire is perpendicular to the field.') },
  { topic: 'p9-induction', text: 'ε = ΔΦ / Δt', y: q('ε', 'ЭДС индукции', 'the induced EMF', 'В', 'V', []), x: [[q('ΔΦ', 'изменение магнитного потока', 'the flux change', 'мВб', 'mWb', [2, 5, 10, 20, 50], 1e-3), 1], [q('Δt', 'время изменения', 'the time', 'с', 's', [0.01, 0.02, 0.05, 0.1, 0.2]), -1]] },
  { topic: 'p9-ac', text: 'U₂ = U₁ · N₂ / N₁', y: q('U₂', 'напряжение на вторичной обмотке', 'the secondary voltage', 'В', 'V', []), x: [[q('U₁', 'напряжение на первичной обмотке', 'the primary voltage', 'В', 'V', [110, 220, 380]), 1], [q('N₂', 'число витков вторичной обмотки', 'the secondary turns', '', '', [50, 100, 200, 500]), 1], [q('N₁', 'число витков первичной обмотки', 'the primary turns', '', '', [500, 1000, 2000]), -1]] },
  { topic: 'p9-em-waves', text: 'λ = c / ν', y: q('λ', 'длину волны', 'the wavelength', 'м', 'm', []), x: [[C('c', 'скорость света', 'c', 'м/с', 'm/s', 3e8), 1], [q('ν', 'частоту', 'the frequency', 'МГц', 'MHz', [1, 10, 50, 100, 300, 900], 1e6), -1]] },
  { topic: 'p9-nucleus', text: 'E = Δm · c²', y: q('E', 'энергию связи', 'the binding energy', 'Дж', 'J', []), x: [[q('Δm', 'дефект массы', 'the mass defect', 'мг', 'mg', [1, 2, 5, 10], 1e-6), 1], [C('c', 'скорость света', 'c', 'м/с', 'm/s', 3e8), 2]] },
  { topic: 'p9-galaxies', text: 'v = H · r', y: q('v', 'скорость удаления галактики', 'the recession speed', 'км/с', 'km/s', []), x: [[C('H', 'постоянную Хаббла', 'H', 'км/(с·Мпк)', 'km/(s·Mpc)', 70), 1], [q('r', 'расстояние до галактики', 'the distance', 'Мпк', 'Mpc', [10, 50, 100, 200, 500, 1000]), 1]] },
  /* ===== physics 10 ===== */
  { topic: 'p10-accelerated', text: 'v = a · t', y: v, x: [[a, 1], [tS, 1]], ctx: t('Тело начинает разгон из состояния покоя.', 'A body speeds up from rest.') },
  { topic: 'p10-projectile', text: 'L = v₀² · sin2α / g = v₀² / g', y: q('L', 'дальность полёта', 'the range', 'м', 'm', []), x: [[q('v₀', 'начальную скорость', 'the launch speed', 'м/с', 'm/s', [5, 10, 15, 20, 30]), 2], [g, -1]], ctx: t('Тело брошено под углом 45° к горизонту, сопротивления воздуха нет.', 'A body is launched at 45° with no air resistance.') },
  { topic: 'p10-circular', text: 'a = ω² · r', y: q('a', 'центростремительное ускорение', 'the centripetal acceleration', 'м/с²', 'm/s²', []), x: [[q('ω', 'угловую скорость', 'the angular speed', 'рад/с', 'rad/s', [1, 2, 3, 4, 5, 10]), 2], [q('r', 'радиус', 'the radius', 'м', 'm', [0.1, 0.2, 0.5, 1, 2]), 1]] },
  { topic: 'p10-elastic', text: 'F = k · x', y: q('F', 'силу упругости', 'the elastic force', 'Н', 'N', []), x: [[q('k', 'жёсткость', 'the stiffness', 'Н/м', 'N/m', [100, 200, 400, 500, 1000]), 1], [q('x', 'деформацию', 'the deformation', 'см', 'cm', [1, 2, 3, 5, 10], 0.01), 1]] },
  { topic: 'p10-friction', text: 'F = μ · m · g', y: q('F', 'силу трения скольжения', 'the friction force', 'Н', 'N', []), x: [[q('μ', 'коэффициент трения', 'the friction coefficient', '', '', [0.1, 0.2, 0.3, 0.4, 0.5]), 1], [m, 1], [g, 1]], ctx: t('Брусок скользит по горизонтальной поверхности.', 'A block slides on a level surface.') },
  { topic: 'p10-momentum', text: 'F = Δp / Δt', y: q('F', 'среднюю силу удара', 'the average force', 'Н', 'N', []), x: [[q('Δp', 'изменение импульса', 'the momentum change', 'кг·м/с', 'kg·m/s', [2, 5, 10, 20, 50]), 1], [q('Δt', 'время удара', 'the impact time', 'с', 's', [0.01, 0.02, 0.05, 0.1]), -1]] },
  { topic: 'p10-work-power', text: 'N = F · v', y: q('N', 'мощность', 'the power', 'Вт', 'W', []), x: [[F, 1], [v, 1]], ctx: t('Тело движется равномерно под действием силы тяги.', 'A body moves steadily under a pulling force.') },
  { topic: 'p10-hydrostatics', text: 'F = ρж · g · V', y: q('F', 'силу Архимеда', 'the buoyant force', 'Н', 'N', []), x: [[dens, 1], [g, 1], [q('V', 'объём погружённой части', 'the submerged volume', 'дм³', 'dm³', [1, 2, 4, 5, 10], 1e-3), 1]] },
  { topic: 'p10-mkt-basics', text: 'ν = m / M', y: nu, x: [[mG, 1], [q('M', 'молярную массу', 'the molar mass', 'г/моль', 'g/mol', [2, 4, 16, 18, 28, 32, 44]), -1]] },
  { topic: 'p10-temperature', text: 'E = 3/2 · k · T', K: 1.5, kInv: { num: '2', den: '3' }, y: q('E', 'среднюю кинетическую энергию молекулы', 'the mean kinetic energy', 'Дж', 'J', []), x: [[C('k', 'постоянную Больцмана', 'k', 'Дж/К', 'J/K', 1.38e-23), 1], [T, 1]] },
  { topic: 'p10-clapeyron', text: 'p = ν · R · T / V', y: q('p', 'давление газа', 'the gas pressure', 'кПа', 'kPa', [], 1e3), x: [[nu, 1], [Rgas, 1], [T, 1], [q('V', 'объём', 'the volume', 'л', 'L', [10, 20, 25, 50, 100], 1e-3), -1]] },
  { topic: 'p10-vapour', text: 'φ = p / pнас · 100%', K: 100, kInv: { den: '100%' }, y: pct('φ', 'относительную влажность', 'the relative humidity'), x: [[q('p', 'парциальное давление пара', 'the vapour pressure', 'кПа', 'kPa', [0.6, 0.9, 1.2, 1.5, 1.8]), 1], [q('pнас', 'давление насыщенного пара', 'the saturated vapour pressure', 'кПа', 'kPa', [2.34, 3.17]), -1]] },
  { topic: 'p10-internal-energy', text: 'U = 3/2 · ν · R · T', K: 1.5, kInv: { num: '2', den: '3' }, y: kJ('U', 'внутреннюю энергию', 'the internal energy'), x: [[nu, 1], [Rgas, 1], [T, 1]], ctx: t('Газ одноатомный, идеальный.', 'The gas is ideal and monatomic.') },
  { topic: 'p10-gas-work', text: 'A = p · ΔV', y: J('A', 'работу газа', 'the work of the gas'), x: [[q('p', 'давление', 'the pressure', 'кПа', 'kPa', [100, 150, 200, 300], 1e3), 1], [q('ΔV', 'изменение объёма', 'the volume change', 'л', 'L', [1, 2, 5, 10, 20], 1e-3), 1]], ctx: t('Газ расширяется при постоянном давлении.', 'The gas expands at constant pressure.') },
  { topic: 'p10-charge', text: 'F = k · q₁ · q₂ / r²', y: F, x: [[kC, 1], [{ ...qC, s: 'q₁', ru: 'первый заряд' }, 1], [{ ...qC, s: 'q₂', ru: 'второй заряд' }, 1], [{ ...rCm, vals: [3, 5, 10, 20, 30] }, -2]] },
  { topic: 'p10-field', text: 'E = k · q / r²', y: q('E', 'напряжённость поля', 'the field strength', 'кН/Кл', 'kN/C', [], 1e3), x: [[kC, 1], [qC, 1], [{ ...rCm, vals: [10, 20, 30, 50] }, -2]] },
  { topic: 'p10-potential', text: 'E = U / d', y: q('E', 'напряжённость поля', 'the field strength', 'В/м', 'V/m', []), x: [[q('U', 'разность потенциалов', 'the voltage', 'В', 'V', [10, 50, 100, 200, 500]), 1], [q('d', 'расстояние между пластинами', 'the plate gap', 'см', 'cm', [1, 2, 5, 10], 0.01), -1]], ctx: t('Поле между пластинами однородное.', 'The field between the plates is uniform.') },
  { topic: 'p10-capacitors', text: 'W = C · U² / 2', K: 0.5, kInv: { num: '2' }, y: q('W', 'энергию конденсатора', 'the stored energy', 'мДж', 'mJ', [], 1e-3), x: [[q('C', 'ёмкость', 'the capacitance', 'мкФ', 'µF', [2, 5, 10, 20, 50], 1e-6), 1], [q('U', 'напряжение', 'the voltage', 'В', 'V', [10, 20, 50, 100]), 2]] },
  { topic: 'p10-liquids', text: 'm = k · I · t', y: q('m', 'массу выделившегося вещества', 'the deposited mass', 'г', 'g', [], 1e-3), x: [[q('k', 'электрохимический эквивалент', 'the electrochemical equivalent', 'мг/Кл', 'mg/C', [0.33, 1.12, 0.3], 1e-6), 1], [I, 1], [q('t', 'время электролиза', 'the time', 'с', 's', [600, 1200, 1800, 3600]), 1]] },
  /* ===== physics 11 ===== */
  { topic: 'p11-ampere', text: 'F = B · I · l', y: q('F', 'силу Ампера', 'the Ampère force', 'Н', 'N', []), x: [[q('B', 'индукцию', 'the field', 'Тл', 'T', [0.05, 0.1, 0.2, 0.5]), 1], [I, 1], [q('l', 'длину активной части', 'the active length', 'см', 'cm', [10, 20, 40, 50], 0.01), 1]], ctx: t('Проводник перпендикулярен линиям индукции.', 'The wire is perpendicular to the field lines.') },
  { topic: 'p11-lorentz', text: 'F = q · v · B', y: q('F', 'силу Лоренца', 'the Lorentz force', 'Н', 'N', []), x: [[C('e', 'заряд электрона', 'e', 'Кл', 'C', 1.6e-19), 1], [q('v', 'скорость электрона', 'the speed', 'Мм/с', 'Mm/s', [1, 2, 5, 10], 1e6), 1], [q('B', 'индукцию', 'the field', 'Тл', 'T', [0.1, 0.2, 0.5, 1]), 1]], ctx: t('Электрон влетает перпендикулярно линиям поля.', 'An electron enters perpendicular to the field.') },
  { topic: 'p11-flux-law', text: 'ε = ΔΦ / Δt', y: q('ε', 'ЭДС индукции', 'the EMF', 'В', 'V', []), x: [[q('ΔΦ', 'изменение потока', 'the flux change', 'мВб', 'mWb', [5, 10, 20, 50, 100], 1e-3), 1], [q('Δt', 'время', 'the time', 'мс', 'ms', [5, 10, 20, 50], 1e-3), -1]] },
  { topic: 'p11-vortex', text: 'ε = B · v · l', y: q('ε', 'ЭДС индукции', 'the EMF', 'В', 'V', []), x: [[q('B', 'индукцию', 'the field', 'Тл', 'T', [0.1, 0.2, 0.5, 1]), 1], [v, 1], [q('l', 'длину проводника', 'the rod length', 'м', 'm', [0.2, 0.5, 1, 2]), 1]], ctx: t('Проводник движется перпендикулярно линиям поля.', 'The rod moves across the field lines.') },
  { topic: 'p11-self-induction', text: 'W = L · I² / 2', K: 0.5, kInv: { num: '2' }, y: q('W', 'энергию магнитного поля', 'the field energy', 'мДж', 'mJ', [], 1e-3), x: [[q('L', 'индуктивность', 'the inductance', 'мГн', 'mH', [10, 20, 50, 100, 200], 1e-3), 1], [q('I', 'силу тока', 'the current', 'А', 'A', [1, 2, 3, 4, 5]), 2]] },
  { topic: 'p11-free-osc', text: 'T = 2π · √(m / k)', K: 2 * Math.PI, kInv: { den: '2π' }, y: q('T', 'период колебаний', 'the period', 'с', 's', []), x: [[q('m', 'массу груза', 'the mass', 'кг', 'kg', [0.1, 0.2, 0.4, 0.5, 1]), 0.5], [q('k', 'жёсткость пружины', 'the stiffness', 'Н/м', 'N/m', [10, 40, 100, 160, 400]), -0.5]] },
  { topic: 'p11-lc', text: 'T = 2π · √(L · C)', K: 2 * Math.PI, kInv: { den: '2π' }, y: q('T', 'период колебаний', 'the period', 'мс', 'ms', [], 1e-3), x: [[q('L', 'индуктивность катушки', 'the inductance', 'мГн', 'mH', [10, 40, 100, 250], 1e-3), 0.5], [q('C', 'ёмкость конденсатора', 'the capacitance', 'мкФ', 'µF', [1, 4, 10, 25], 1e-6), 0.5]] },
  { topic: 'p11-ac', text: 'Iд = Im / √2', K: Math.SQRT1_2, kInv: { num: '√2' }, y: q('Iд', 'действующее значение силы тока', 'the RMS current', 'А', 'A', []), x: [[q('Im', 'амплитуду силы тока', 'the peak current', 'А', 'A', [1, 2, 5, 10, 14.1]), 1]] },
  { topic: 'p11-generator', text: 'k = N₁ / N₂', y: q('k', 'коэффициент трансформации', 'the turns ratio', '', '', []), x: [[q('N₁', 'число витков первичной обмотки', 'the primary turns', '', '', [200, 500, 1000, 2000]), 1], [q('N₂', 'число витков вторичной обмотки', 'the secondary turns', '', '', [50, 100, 250, 4000]), -1]] },
  { topic: 'p11-mech-waves', text: 'v = λ · ν', y: q('v', 'скорость звука', 'the speed of sound', 'м/с', 'm/s', []), x: [[q('λ', 'длину волны', 'the wavelength', 'м', 'm', [0.5, 0.68, 1, 1.36, 2]), 1], [q('ν', 'частоту', 'the frequency', 'Гц', 'Hz', [250, 340, 500, 1000]), 1]] },
  { topic: 'p11-emc2', text: 'E = m · c²', y: q('E', 'энергию покоя', 'the rest energy', 'Дж', 'J', []), x: [[q('m', 'массу', 'the mass', 'г', 'g', [1, 2, 5, 10], 1e-3), 1], [C('c', 'скорость света', 'c', 'м/с', 'm/s', 3e8), 2]] },
  { topic: 'p11-photons', text: 'p = h / λ', y: q('p', 'импульс фотона', 'the photon momentum', 'кг·м/с', 'kg·m/s', []), x: [[C('h', 'постоянную Планка', 'h', 'Дж·с', 'J·s', 6.63e-34), 1], [q('λ', 'длину волны', 'the wavelength', 'нм', 'nm', [400, 500, 600, 663, 700], 1e-9), -1]] },
  { topic: 'p11-quanta', text: 'E = h · ν', y: q('E', 'энергию фотона', 'the photon energy', 'Дж', 'J', []), x: [[C('h', 'постоянную Планка', 'h', 'Дж·с', 'J·s', 6.63e-34), 1], [q('ν', 'частоту света', 'the frequency', '·10¹⁴ Гц', '·10¹⁴ Hz', [4, 5, 6, 7.5, 10], 1e14), 1]] },
  /* ===== chemistry ===== */
  { topic: 'c8-mole', text: 'ν = m / M', y: nu, x: [[mG, 1], [q('M', 'молярную массу', 'the molar mass', 'г/моль', 'g/mol', [2, 16, 18, 32, 40, 44, 58.5, 98]), -1]] },
  { topic: 'c8-mole', text: 'ν = V / Vm', y: nu, x: [[q('V', 'объём газа (н. у.)', 'the gas volume (STP)', 'л', 'L', [2.24, 5.6, 11.2, 22.4, 44.8, 67.2]), 1], [C('Vm', 'молярный объём', 'Vm', 'л/моль', 'L/mol', 22.4), -1]] },
  { topic: 'c8-mole', text: 'N = ν · Nₐ', y: q('N', 'число молекул', 'the number of molecules', '', '', []), x: [[nu, 1], [C('Nₐ', 'число Авогадро', 'Nₐ', 'моль⁻¹', 'mol⁻¹', 6.02e23), 1]] },
  { topic: 'c8-solutions', text: 'w = mв-ва / mр-ра · 100%', K: 100, kInv: { den: '100%' }, y: pct('w', 'массовую долю вещества', 'the mass fraction'), x: [[q('mв-ва', 'массу растворённого вещества', 'the solute mass', 'г', 'g', [5, 10, 15, 20, 25, 40, 50]), 1], [q('mр-ра', 'массу раствора', 'the solution mass', 'г', 'g', [100, 200, 250, 400, 500]), -1]] },
  { topic: 'c11-concentration', text: 'c = ν / V', y: q('c', 'молярную концентрацию', 'the molar concentration', 'моль/л', 'mol/L', []), x: [[q('ν', 'количество вещества', 'the amount', 'моль', 'mol', [0.1, 0.2, 0.5, 1, 2]), 1], [q('V', 'объём раствора', 'the volume', 'л', 'L', [0.1, 0.25, 0.5, 1, 2]), -1]] },
  { topic: 'c9-degree', text: 'α = Nдисс / Nобщ · 100%', K: 100, kInv: { den: '100%' }, y: pct('α', 'степень диссоциации', 'the degree of dissociation'), x: [[q('Nдисс', 'число распавшихся молекул', 'the dissociated molecules', '', '', [5, 10, 20, 40, 60]), 1], [q('Nобщ', 'общее число молекул', 'the total molecules', '', '', [100, 200, 400, 500]), -1]] },
];

/* ---------- numbers ---------- */

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUPER[Number(d)]).join('');

/** 3–4 significant digits, scientific notation for very large or small values, Russian decimal comma */
export function fmtNum(x: number): string {
  if (!Number.isFinite(x)) return '—';
  const ab = Math.abs(x);
  if (ab === 0) return '0';
  if (ab >= 1e6 || ab < 1e-3) {
    let e = Math.floor(Math.log10(ab));
    let mant = Number((x / 10 ** e).toPrecision(3));
    if (Math.abs(mant) >= 10) {
      mant /= 10;
      e += 1;
    }
    return `${String(mant).replace('.', ',')}·10${sup(e)}`;
  }
  const v = ab >= 1000 ? Math.round(x) : ab >= 100 ? Math.round(x * 10) / 10 : Number(x.toPrecision(3));
  return String(v).replace('.', ',');
}

const symPow = (sym: string, e: number) => (e === 2 ? `${sym}²` : e === 0.5 ? `√${sym}` : e === 3 ? `${sym}³` : sym);

/** the law solved for quantity j, as readable text: "v = √(2·Eк / m)" */
function solvedText(law: Law, j: number): string {
  const [target, ej] = law.x[j];
  const num: string[] = [law.y.s];
  const den: string[] = [];
  if (law.kInv?.num) num.unshift(law.kInv.num);
  if (law.kInv?.den) den.push(law.kInv.den);
  law.x.forEach(([qq, e], i) => {
    if (i === j) return;
    (e > 0 ? den : num).push(symPow(qq.s, Math.abs(e)));
  });
  let top = num;
  let bottom = den;
  if (ej < 0) [top, bottom] = [den.length ? den : ['1'], num];
  const frac = bottom.length ? `${top.join(' · ')} / ${bottom.length > 1 ? `(${bottom.join(' · ')})` : bottom[0]}` : top.join(' · ');
  const p = Math.abs(ej);
  const expr = p === 1 ? frac : p === 2 ? `√(${frac})` : p === 0.5 ? `(${frac})²` : `(${frac})^(1/${p})`;
  return `${target.s} = ${expr}`;
}

/* ---------- problem generators ---------- */

const pick = <X,>(r: () => number, arr: X[]) => arr[Math.floor(r() * arr.length)];

function lawGen(law: Law, idx: number): ProblemGen {
  const topic = topicById(law.topic);
  const subject = law.topic.startsWith('c') ? 'chemistry' : law.topic.startsWith('b') ? 'biology' : 'physics';
  const grade = topic?.grade ?? Number(law.topic.match(/\d+/)?.[0] ?? 9);
  const title = topic ? t(`${topic.title.ru} (${law.text.split('=')[0].trim()})`, `${topic.title.en} (${law.text.split('=')[0].trim()})`) : t(law.text, law.text);
  return {
    id: `law:${law.topic}:${idx}`,
    subject,
    grade,
    topics: [law.topic],
    title,
    make: (r) => {
      const K = law.K ?? 1;
      const xs = law.x.map(([qq]) => pick(r, qq.vals));
      const si = xs.map((val, i) => val * law.x[i][0].si);
      const ySI = K * si.reduce((acc, val, i) => acc * val ** law.x[i][1], 1);
      const free = law.x.map((x0, i) => (x0[0].c ? -1 : i)).filter((i) => i >= 0);
      const j = r() < 0.5 || !free.length ? -1 : pick(r, free); // -1: find y
      const unknown = j < 0 ? law.y : law.x[j][0];

      // the value in display units of an answer computed in SI
      const disp = (valSI: number) => valSI / unknown.si;
      const solve = (k: number, exps: number[], times = false) => {
        if (j < 0) return disp(k * si.reduce((acc, val, i) => acc * val ** exps[i], 1));
        const rest = si.reduce((acc, val, i) => (i === j ? acc : acc * val ** exps[i]), 1);
        const base = times ? ySI * k * rest : ySI / (k * rest);
        return disp(base ** (1 / exps[j]));
      };
      const exps = law.x.map((x0) => x0[1]);
      const answer = j < 0 ? disp(ySI) : xs[j];
      const slips = [
        K !== 1 ? solve(1, exps) : NaN, // forgot ½, 2π, 100%
        solve(K, exps.map((e) => Math.sign(e))), // forgot the square or the root
        j < 0 ? solve(K, exps.map((e) => -e)) : solve(K, exps, true), // divided instead of multiplied
        law.x.some(([qq]) => qq.si !== 1) || unknown.si !== 1 ? answer * 1000 : answer * 10, // skipped the unit conversion
        answer / 2,
        answer * 2,
        answer / 10,
      ];
      const ans = fmtNum(answer);
      const wrong: string[] = [];
      for (const w of slips) {
        const f = fmtNum(w);
        if (Number.isFinite(w) && w > 0 && f !== ans && !wrong.includes(f)) wrong.push(f);
        if (wrong.length === 3) break;
      }

      const given = [
        ...(j < 0 ? [] : [`${law.y.s} = ${fmtNum(disp0(ySI, law.y))}${unitStr(law.y.u.ru)}`]),
        ...law.x.map(([qq], i) => (i === j ? '' : `${qq.s} = ${fmtNum(xs[i])}${unitStr(qq.u.ru)}`)).filter(Boolean),
      ];
      const givenEn = [
        ...(j < 0 ? [] : [`${law.y.s} = ${fmtNum(disp0(ySI, law.y)).replace(',', '.')}${unitStr(law.y.u.en)}`]),
        ...law.x.map(([qq], i) => (i === j ? '' : `${qq.s} = ${fmtNum(xs[i]).replace(',', '.')}${unitStr(qq.u.en)}`)).filter(Boolean),
      ];
      const conv = law.x.some(([qq], i) => i !== j && qq.si !== 1) || unknown.si !== 1;
      return {
        prompt: t(`${law.ctx ? law.ctx.ru + ' ' : ''}Дано: ${given.join(', ')}. Найди ${unknown.ru} ${unknown.s}.`, `${law.ctx ? law.ctx.en + ' ' : ''}Given: ${givenEn.join(', ')}. Find ${unknown.en} ${unknown.s}.`),
        answer: ans,
        unit: unknown.u.ru ? unknown.u : undefined,
        wrong,
        solution: t(
          `${law.text}${j < 0 ? '' : ` ⇒ ${solvedText(law, j)}`}.${conv ? ' Все величины переводим в СИ.' : ''} ${unknown.s} = ${ans}${unitStr(unknown.u.ru)}`,
          `${law.text}${j < 0 ? '' : ` ⇒ ${solvedText(law, j)}`}.${conv ? ' Convert everything to SI.' : ''} ${unknown.s} = ${ans.replace(',', '.')}${unitStr(unknown.u.en)}`,
        ),
      };
    },
  };
}

const unitStr = (u: string) => (u ? (u.startsWith('·') || u === '°' ? u : ` ${u}`) : '');
const disp0 = (valSI: number, qq: Qty) => valSI / qq.si;

export const LAW_PROBLEMS: ProblemGen[] = LAWS.map((law, i) => lawGen(law, LAWS.slice(0, i).filter((l) => l.topic === law.topic).length));
export const LAW_COUNT = LAWS.length;

/* ---------- laws with sums, differences and other non-product forms ---------- */

/*
 * Written as an equation rel(v) = 0 over values in display units (each law keeps its units consistent).
 * gen() picks a consistent set of nice values; any listed quantity can be the unknown.
 * Wrong options come from typical wrong equations, solved numerically for the unknown.
 */
type Vals = Record<string, number>;
interface GLaw {
  topic: string;
  text: string;
  vars: Record<string, Qty>;
  ask: string[];
  gen: (r: () => number) => Vals;
  rel: (v: Vals) => number;
  wrong: ((v: Vals) => number)[];
  solved: Record<string, string>;
  ctx?: T2;
}

const deg = Math.PI / 180;
const ints = (a0: number, b0: number) => Array.from({ length: b0 - a0 + 1 }, (_, i) => a0 + i);

const GLAWS: GLaw[] = [
  {
    topic: 'p8-connections',
    text: 'R = R₁ + R₂ (последовательно)',
    vars: { R: q('R', 'общее сопротивление', 'the total resistance', 'Ом', 'Ω', []), R1: q('R₁', 'сопротивление первого резистора', 'the first resistance', 'Ом', 'Ω', []), R2: q('R₂', 'сопротивление второго резистора', 'the second resistance', 'Ом', 'Ω', []) },
    ask: ['R', 'R1', 'R2'],
    gen: (r) => {
      const R1 = pick(r, [2, 3, 4, 5, 6, 10, 15, 20]);
      const R2 = pick(r, [4, 5, 8, 12, 20, 30, 40]);
      return { R1, R2, R: R1 + R2 };
    },
    rel: (v) => v.R - (v.R1 + v.R2),
    wrong: [(v) => v.R - (v.R1 * v.R2) / (v.R1 + v.R2), (v) => v.R - v.R1 * v.R2, (v) => v.R - Math.abs(v.R1 - v.R2)],
    solved: { R: 'R = R₁ + R₂', R1: 'R₁ = R − R₂', R2: 'R₂ = R − R₁' },
    ctx: t('Резисторы соединены последовательно.', 'The resistors are in series.'),
  },
  {
    topic: 'p8-connections',
    text: '1/R = 1/R₁ + 1/R₂ (параллельно)',
    vars: { R: q('R', 'общее сопротивление', 'the total resistance', 'Ом', 'Ω', []), R1: q('R₁', 'сопротивление первого резистора', 'the first resistance', 'Ом', 'Ω', []), R2: q('R₂', 'сопротивление второго резистора', 'the second resistance', 'Ом', 'Ω', []) },
    ask: ['R', 'R2'],
    gen: (r) => {
      const [R1, R2] = pick(r, [[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [10, 40], [6, 30], [8, 24]]);
      return { R1, R2, R: (R1 * R2) / (R1 + R2) };
    },
    rel: (v) => 1 / v.R - (1 / v.R1 + 1 / v.R2),
    wrong: [(v) => v.R - (v.R1 + v.R2), (v) => v.R - (v.R1 + v.R2) / 2, (v) => 1 / v.R - Math.abs(1 / v.R1 - 1 / v.R2)],
    solved: { R: 'R = R₁·R₂ / (R₁ + R₂)', R2: 'R₂ = R·R₁ / (R₁ − R)' },
    ctx: t('Резисторы соединены параллельно.', 'The resistors are in parallel.'),
  },
  {
    topic: 'p11-lenses',
    text: '1/F = 1/d + 1/f',
    vars: { F: q('F', 'фокусное расстояние', 'the focal length', 'см', 'cm', []), d: q('d', 'расстояние от предмета до линзы', 'the object distance', 'см', 'cm', []), f: q('f', 'расстояние от линзы до изображения', 'the image distance', 'см', 'cm', []) },
    ask: ['F', 'd', 'f'],
    gen: (r) => {
      const F = pick(r, [10, 12, 15, 20, 30]);
      const d = F * pick(r, [1.5, 2, 3, 4, 6]);
      return { F, d, f: (d * F) / (d - F) };
    },
    rel: (v) => 1 / v.F - (1 / v.d + 1 / v.f),
    wrong: [(v) => v.F - (v.d + v.f), (v) => 1 / v.F - (1 / v.d - 1 / v.f), (v) => v.F - (v.d * v.f) / Math.abs(v.d - v.f)],
    solved: { F: 'F = d·f / (d + f)', d: 'd = F·f / (f − F)', f: 'f = F·d / (d − F)' },
    ctx: t('Собирающая линза даёт действительное изображение.', 'A converging lens gives a real image.'),
  },
  {
    topic: 'p10-first-law',
    text: 'Q = ΔU + A',
    vars: { Q: q('Q', 'количество теплоты', 'the heat', 'кДж', 'kJ', []), dU: q('ΔU', 'изменение внутренней энергии', 'the change in internal energy', 'кДж', 'kJ', []), A: q('A', 'работу газа', 'the work done by the gas', 'кДж', 'kJ', []) },
    ask: ['Q', 'dU', 'A'],
    gen: (r) => {
      const dU = pick(r, [20, 30, 50, 80, 120, 200]);
      const A = pick(r, [10, 15, 25, 40, 60, 100]);
      return { dU, A, Q: dU + A };
    },
    rel: (v) => v.Q - (v.dU + v.A),
    wrong: [(v) => v.Q - Math.abs(v.dU - v.A), (v) => v.Q - v.dU * v.A, (v) => v.Q - (v.dU + v.A) / 2],
    solved: { Q: 'Q = ΔU + A', dU: 'ΔU = Q − A', A: 'A = Q − ΔU' },
    ctx: t('Газ получил теплоту и совершил работу.', 'A gas receives heat and does work.'),
  },
  {
    topic: 'p9-uniform',
    text: 'x = x₀ + v·t',
    vars: { x: q('x', 'координату тела', 'the position', 'м', 'm', []), x0: q('x₀', 'начальную координату', 'the starting position', 'м', 'm', []), v: q('v', 'скорость', 'the speed', 'м/с', 'm/s', []), t: q('t', 'время движения', 'the time', 'с', 's', []) },
    ask: ['x', 'x0', 'v', 't'],
    gen: (r) => {
      const x0 = pick(r, [5, 10, 20, 50, 100]);
      const v = pick(r, [2, 3, 4, 5, 10, 15]);
      const tt = pick(r, [4, 5, 10, 20, 30]);
      return { x0, v, t: tt, x: x0 + v * tt };
    },
    rel: (v) => v.x - (v.x0 + v.v * v.t),
    wrong: [(v) => v.x - v.v * v.t, (v) => v.x - (v.x0 + v.v / v.t), (v) => v.x - (v.x0 * v.t + v.v)],
    solved: { x: 'x = x₀ + v·t', x0: 'x₀ = x − v·t', v: 'v = (x − x₀) / t', t: 't = (x − x₀) / v' },
    ctx: t('Тело движется равномерно вдоль оси X.', 'A body moves steadily along X.'),
  },
  {
    topic: 'p10-accelerated',
    text: 'v = v₀ + a·t',
    vars: { v: q('v', 'конечную скорость', 'the final speed', 'м/с', 'm/s', []), v0: q('v₀', 'начальную скорость', 'the initial speed', 'м/с', 'm/s', []), a: q('a', 'ускорение', 'the acceleration', 'м/с²', 'm/s²', []), t: q('t', 'время разгона', 'the time', 'с', 's', []) },
    ask: ['v', 'v0', 'a', 't'],
    gen: (r) => {
      const v0 = pick(r, [2, 4, 5, 10, 15]);
      const a = pick(r, [0.5, 1, 2, 3, 4]);
      const tt = pick(r, [2, 4, 5, 6, 10]);
      return { v0, a, t: tt, v: v0 + a * tt };
    },
    rel: (v) => v.v - (v.v0 + v.a * v.t),
    wrong: [(v) => v.v - v.a * v.t, (v) => v.v - (v.v0 + v.a / v.t), (v) => v.v - (v.v0 + (v.a * v.t * v.t) / 2)],
    solved: { v: 'v = v₀ + a·t', v0: 'v₀ = v − a·t', a: 'a = (v − v₀) / t', t: 't = (v − v₀) / a' },
    ctx: t('Тело разгоняется равноускоренно.', 'A body speeds up uniformly.'),
  },
  {
    topic: 'p9-accelerated',
    text: 's = v₀·t + a·t² / 2',
    vars: { s: q('s', 'пройденный путь', 'the distance', 'м', 'm', []), v0: q('v₀', 'начальную скорость', 'the initial speed', 'м/с', 'm/s', []), a: q('a', 'ускорение', 'the acceleration', 'м/с²', 'm/s²', []), t: q('t', 'время', 'the time', 'с', 's', []) },
    ask: ['s', 'v0', 'a', 't'],
    gen: (r) => {
      const v0 = pick(r, [2, 3, 5, 10]);
      const a = pick(r, [1, 2, 4]);
      const tt = pick(r, [2, 4, 5, 6, 10]);
      return { v0, a, t: tt, s: v0 * tt + (a * tt * tt) / 2 };
    },
    rel: (v) => v.s - (v.v0 * v.t + (v.a * v.t * v.t) / 2),
    wrong: [(v) => v.s - (v.v0 * v.t + v.a * v.t * v.t), (v) => v.s - v.v0 * v.t, (v) => v.s - (v.a * v.t * v.t) / 2],
    solved: { s: 's = v₀·t + a·t²/2', v0: 'v₀ = (s − a·t²/2) / t', a: 'a = 2·(s − v₀·t) / t²', t: 't = (√(v₀² + 2·a·s) − v₀) / a' },
  },
  {
    topic: 'p9-relative',
    text: 'v = v₁ + v₂ (по течению)',
    vars: { v: q('v', 'скорость лодки относительно берега', 'the speed relative to the bank', 'км/ч', 'km/h', []), v1: q('v₁', 'скорость лодки в стоячей воде', 'the boat speed in still water', 'км/ч', 'km/h', []), v2: q('v₂', 'скорость течения', 'the current speed', 'км/ч', 'km/h', []) },
    ask: ['v', 'v1', 'v2'],
    gen: (r) => {
      const v1 = pick(r, [8, 10, 12, 15, 18, 20]);
      const v2 = pick(r, [1, 2, 3, 4, 5]);
      return { v1, v2, v: v1 + v2 };
    },
    rel: (v) => v.v - (v.v1 + v.v2),
    wrong: [(v) => v.v - Math.abs(v.v1 - v.v2), (v) => v.v - v.v1 * v.v2, (v) => v.v - (v.v1 + v.v2) / 2],
    solved: { v: 'v = v₁ + v₂', v1: 'v₁ = v − v₂', v2: 'v₂ = v − v₁' },
    ctx: t('Лодка плывёт по течению реки.', 'A boat goes downstream.'),
  },
  {
    topic: 'p10-emf',
    text: 'I = ε / (R + r)',
    vars: { I: q('I', 'силу тока', 'the current', 'А', 'A', []), e: q('ε', 'ЭДС источника', 'the EMF', 'В', 'V', []), R: q('R', 'внешнее сопротивление', 'the external resistance', 'Ом', 'Ω', []), r: q('r', 'внутреннее сопротивление', 'the internal resistance', 'Ом', 'Ω', []) },
    ask: ['I', 'e', 'R', 'r'],
    gen: (r) => {
      const R = pick(r, [2, 4, 5, 8, 10, 11]);
      const ri = pick(r, [0.5, 1, 2]);
      const I = pick(r, [0.5, 1, 1.5, 2]);
      return { R, r: ri, I, e: I * (R + ri) };
    },
    rel: (v) => v.I - v.e / (v.R + v.r),
    wrong: [(v) => v.I - v.e / v.R, (v) => v.I - v.e / Math.abs(v.R - v.r), (v) => v.I - v.e / v.r],
    solved: { I: 'I = ε / (R + r)', e: 'ε = I·(R + r)', R: 'R = ε / I − r', r: 'r = ε / I − R' },
  },
  {
    topic: 'p10-heat-engines',
    text: 'η = (T₁ − T₂) / T₁ · 100%',
    vars: { eta: q('η', 'максимальный КПД', 'the maximum efficiency', '%', '%', []), T1: q('T₁', 'температуру нагревателя', 'the hot reservoir temperature', 'К', 'K', []), T2: q('T₂', 'температуру холодильника', 'the cold reservoir temperature', 'К', 'K', []) },
    ask: ['eta', 'T1', 'T2'],
    gen: (r) => {
      const T1 = pick(r, [400, 500, 600, 800, 1000]);
      const T2 = pick(r, [280, 300, 320, 350]);
      return { T1, T2, eta: ((T1 - T2) / T1) * 100 };
    },
    rel: (v) => v.eta - ((v.T1 - v.T2) / v.T1) * 100,
    wrong: [(v) => v.eta - (v.T2 / v.T1) * 100, (v) => v.eta - ((v.T1 - v.T2) / v.T2) * 100, (v) => v.eta - (v.T1 - v.T2) / 10],
    solved: { eta: 'η = (T₁ − T₂) / T₁ · 100%', T1: 'T₁ = T₂ / (1 − η)', T2: 'T₂ = T₁·(1 − η)' },
    ctx: t('Идеальная тепловая машина (цикл Карно).', 'An ideal (Carnot) heat engine.'),
  },
  {
    topic: 'p10-metals',
    text: 'R = R₀·(1 + α·t)',
    vars: { R: q('R', 'сопротивление при нагреве', 'the hot resistance', 'Ом', 'Ω', []), R0: q('R₀', 'сопротивление при 0 °C', 'the resistance at 0 °C', 'Ом', 'Ω', []), t: q('t', 'температуру', 'the temperature', '°C', '°C', []), alpha: C('α', 'температурный коэффициент', 'α', '1/°C', '1/°C', 0.004) },
    ask: ['R', 'R0', 't'],
    gen: (r) => {
      const R0 = pick(r, [10, 20, 25, 50, 100]);
      const tt = pick(r, [50, 100, 200, 250, 500]);
      return { R0, t: tt, alpha: 0.004, R: R0 * (1 + 0.004 * tt) };
    },
    rel: (v) => v.R - v.R0 * (1 + v.alpha * v.t),
    wrong: [(v) => v.R - v.R0 * v.alpha * v.t, (v) => v.R - (v.R0 + v.alpha * v.t), (v) => v.R - v.R0 * (1 - v.alpha * v.t)],
    solved: { R: 'R = R₀·(1 + α·t)', R0: 'R₀ = R / (1 + α·t)', t: 't = (R / R₀ − 1) / α' },
    ctx: t('Металлический проводник нагревают.', 'A metal wire is heated.'),
  },
  {
    topic: 'p8-heat-quantity',
    text: 'Q = c·m·(t₂ − t₁)',
    vars: { Q: q('Q', 'количество теплоты', 'the heat', 'кДж', 'kJ', []), c: C('c', 'удельную теплоёмкость воды', 'c of water', 'кДж/(кг·°C)', 'kJ/(kg·°C)', 4.2), m: q('m', 'массу воды', 'the water mass', 'кг', 'kg', []), t1: q('t₁', 'начальную температуру', 'the initial temperature', '°C', '°C', []), t2: q('t₂', 'конечную температуру', 'the final temperature', '°C', '°C', []) },
    ask: ['Q', 'm', 't1', 't2'],
    gen: (r) => {
      const m0 = pick(r, [0.5, 1, 2, 3, 5]);
      const t1 = pick(r, [10, 15, 20, 25]);
      const t2 = pick(r, [40, 50, 60, 80, 100]);
      return { c: 4.2, m: m0, t1, t2, Q: 4.2 * m0 * (t2 - t1) };
    },
    rel: (v) => v.Q - v.c * v.m * (v.t2 - v.t1),
    wrong: [(v) => v.Q - v.c * v.m * v.t2, (v) => v.Q - v.c * v.m * (v.t1 + v.t2), (v) => v.Q - v.m * (v.t2 - v.t1)],
    solved: { Q: 'Q = c·m·(t₂ − t₁)', m: 'm = Q / (c·(t₂ − t₁))', t1: 't₁ = t₂ − Q / (c·m)', t2: 't₂ = t₁ + Q / (c·m)' },
    ctx: t('Воду нагревают.', 'Water is heated.'),
  },
  {
    topic: 'p8-heat-balance',
    text: 'c·m₁·(t − t₁) = c·m₂·(t₂ − t)',
    vars: { t: q('t', 'температуру смеси', 'the final temperature', '°C', '°C', []), m1: q('m₁', 'массу холодной воды', 'the cold water mass', 'кг', 'kg', []), t1: q('t₁', 'температуру холодной воды', 'the cold water temperature', '°C', '°C', []), m2: q('m₂', 'массу горячей воды', 'the hot water mass', 'кг', 'kg', []), t2: q('t₂', 'температуру горячей воды', 'the hot water temperature', '°C', '°C', []) },
    ask: ['t', 'm2', 't2'],
    gen: (r) => {
      const m1 = pick(r, [1, 2, 3, 4]);
      const m2 = pick(r, [1, 2, 3, 4]);
      const t1 = pick(r, [10, 20, 30]);
      const t2 = pick(r, [60, 70, 80, 90]);
      return { m1, m2, t1, t2, t: (m1 * t1 + m2 * t2) / (m1 + m2) };
    },
    rel: (v) => v.m1 * (v.t - v.t1) - v.m2 * (v.t2 - v.t),
    wrong: [(v) => v.t - (v.t1 + v.t2) / 2, (v) => v.m1 * (v.t - v.t1) - v.m2 * (v.t2 + v.t), (v) => v.m1 * v.t - v.m2 * v.t2],
    solved: { t: 't = (m₁·t₁ + m₂·t₂) / (m₁ + m₂)', m2: 'm₂ = m₁·(t − t₁) / (t₂ − t)', t2: 't₂ = t + m₁·(t − t₁) / m₂' },
    ctx: t('Холодную и горячую воду смешали, потерь тепла нет.', 'Cold and hot water are mixed with no heat loss.'),
  },
  {
    topic: 'p10-applications',
    text: 'a = g·(sin α − μ·cos α)',
    vars: { a: q('a', 'ускорение бруска', 'the acceleration', 'м/с²', 'm/s²', []), mu: q('μ', 'коэффициент трения', 'the friction coefficient', '', '', []), g: C('g', 'ускорение свободного падения', 'g', 'м/с²', 'm/s²', 10), al: C('α', 'угол наклона', 'the angle', '°', '°', 30) },
    ask: ['a', 'mu'],
    gen: (r) => {
      const mu = pick(r, [0.1, 0.2, 0.3, 0.4, 0.5]);
      return { mu, g: 10, al: 30, a: 10 * (Math.sin(30 * deg) - mu * Math.cos(30 * deg)) };
    },
    rel: (v) => v.a - v.g * (Math.sin(v.al * deg) - v.mu * Math.cos(v.al * deg)),
    wrong: [(v) => v.a - v.g * Math.sin(v.al * deg), (v) => v.a - v.g * (Math.sin(v.al * deg) + v.mu * Math.cos(v.al * deg)), (v) => v.a - v.g * (Math.cos(v.al * deg) - v.mu * Math.sin(v.al * deg))],
    solved: { a: 'a = g·(sin α − μ·cos α)', mu: 'μ = (g·sin α − a) / (g·cos α)' },
    ctx: t('Брусок соскальзывает с наклонной плоскости (sin 30° = 0,5, cos 30° ≈ 0,87).', 'A block slides down an incline (sin 30° = 0.5, cos 30° ≈ 0.87).'),
  },
  {
    topic: 'p9-energy',
    text: 'm·v²/2 = m·g·h ⇒ v = √(2·g·h)',
    vars: { v: q('v', 'скорость у земли', 'the speed at the ground', 'м/с', 'm/s', []), h: q('h', 'высоту', 'the height', 'м', 'm', []), g: C('g', 'ускорение свободного падения', 'g', 'м/с²', 'm/s²', 10) },
    ask: ['v', 'h'],
    gen: (r) => {
      const v = pick(r, [10, 20, 30, 40]);
      return { v, g: 10, h: (v * v) / 20 };
    },
    rel: (v) => (v.v * v.v) / 2 - v.g * v.h,
    wrong: [(v) => v.v - 2 * v.g * v.h, (v) => v.v * v.v - v.g * v.h, (v) => v.v - Math.sqrt(v.g * v.h) / 2],
    solved: { v: 'v = √(2·g·h)', h: 'h = v² / (2·g)' },
    ctx: t('Тело падает без начальной скорости, сопротивления воздуха нет.', 'A body falls from rest without air resistance.'),
  },
  {
    topic: 'p11-quanta',
    text: 'h·ν = A + Eк',
    vars: { E: q('hν', 'энергию фотона', 'the photon energy', 'эВ', 'eV', []), A: q('A', 'работу выхода', 'the work function', 'эВ', 'eV', []), Ek: q('Eк', 'кинетическую энергию электрона', 'the electron kinetic energy', 'эВ', 'eV', []) },
    ask: ['E', 'A', 'Ek'],
    gen: (r) => {
      const A = pick(r, [1.9, 2.2, 2.3, 4.3, 4.5]);
      const Ek = pick(r, [0.5, 1, 1.5, 2, 3]);
      return { A, Ek, E: Math.round((A + Ek) * 10) / 10 };
    },
    rel: (v) => v.E - (v.A + v.Ek),
    wrong: [(v) => v.E - Math.abs(v.A - v.Ek), (v) => v.E - v.A, (v) => v.E - v.A * v.Ek],
    solved: { E: 'hν = A + Eк', A: 'A = hν − Eк', Ek: 'Eк = hν − A' },
    ctx: t('Фотоэффект.', 'The photoelectric effect.'),
  },
  {
    topic: 'p11-relativistic-effects',
    text: 'Δt = Δt₀ / √(1 − v²/c²)',
    vars: { dt: q('Δt', 'время по часам наблюдателя', 'the observed time', 'с', 's', []), dt0: q('Δt₀', 'собственное время', 'the proper time', 'с', 's', []), b: q('v/c', 'скорость в долях скорости света', 'the speed as a fraction of c', '', '', []) },
    ask: ['dt', 'dt0', 'b'],
    gen: (r) => {
      const b = pick(r, [0.6, 0.8, 0.28 * 3.5]);
      const dt0 = pick(r, [1, 2, 3, 4, 6, 10]);
      return { b, dt0, dt: dt0 / Math.sqrt(1 - b * b) };
    },
    rel: (v) => v.dt - v.dt0 / Math.sqrt(1 - v.b * v.b),
    wrong: [(v) => v.dt - v.dt0 * Math.sqrt(1 - v.b * v.b), (v) => v.dt - v.dt0 / (1 - v.b * v.b), (v) => v.dt - v.dt0 / (1 - v.b)],
    solved: { dt: 'Δt = Δt₀ / √(1 − v²/c²)', dt0: 'Δt₀ = Δt·√(1 − v²/c²)', b: 'v/c = √(1 − (Δt₀/Δt)²)' },
    ctx: t('Часы движутся относительно наблюдателя.', 'A clock moves relative to the observer.'),
  },
  {
    topic: 'p11-decay-law',
    text: 'N = N₀ · 2^(−t/T)',
    vars: { N: q('N', 'число оставшихся ядер', 'the nuclei left', '', '', []), N0: q('N₀', 'начальное число ядер', 'the initial number of nuclei', '', '', []), t: q('t', 'время', 'the time', 'сут', 'days', []), T: q('T', 'период полураспада', 'the half-life', 'сут', 'days', []) },
    ask: ['N', 'N0', 't', 'T'],
    gen: (r) => {
      const T = pick(r, [2, 5, 8, 10, 30]);
      const k = pick(r, [1, 2, 3, 4]);
      const N0 = pick(r, [1600, 3200, 8000, 16000, 64000]);
      return { T, t: T * k, N0, N: N0 / 2 ** k };
    },
    rel: (v) => Math.log(v.N / v.N0) + (v.t / v.T) * Math.LN2,
    wrong: [(v) => v.N - v.N0 / (2 * (v.t / v.T)), (v) => v.N - v.N0 * (1 - v.t / (2 * v.T)), (v) => v.N - v.N0 / 2 ** (v.T / v.t)],
    solved: { N: 'N = N₀ · 2^(−t/T)', N0: 'N₀ = N · 2^(t/T)', t: 't = T · log₂(N₀ / N)', T: 'T = t / log₂(N₀ / N)' },
  },
  {
    topic: 'c11-kinetics',
    text: 'v₂ = v₁ · γ^((t₂ − t₁)/10)',
    vars: { v2: q('v₂', 'скорость реакции после нагрева', 'the new rate', 'моль/(л·с)', 'mol/(L·s)', []), v1: q('v₁', 'начальную скорость реакции', 'the initial rate', 'моль/(л·с)', 'mol/(L·s)', []), g: q('γ', 'температурный коэффициент', 'the temperature coefficient', '', '', []), dt: q('Δt', 'изменение температуры', 'the temperature rise', '°C', '°C', []) },
    ask: ['v2', 'v1', 'g', 'dt'],
    gen: (r) => {
      const g0 = pick(r, [2, 3, 4]);
      const dt = pick(r, [10, 20, 30, 40]);
      const v1 = pick(r, [0.01, 0.02, 0.05, 0.1]);
      return { g: g0, dt, v1, v2: v1 * g0 ** (dt / 10) };
    },
    rel: (v) => Math.log(v.v2) - Math.log(v.v1) - (v.dt / 10) * Math.log(v.g),
    wrong: [(v) => v.v2 - v.v1 * v.g * (v.dt / 10), (v) => v.v2 - v.v1 * v.g, (v) => v.v2 - v.v1 * (v.dt / 10) ** v.g],
    solved: { v2: 'v₂ = v₁ · γ^(Δt/10)', v1: 'v₁ = v₂ / γ^(Δt/10)', g: 'γ = (v₂ / v₁)^(10/Δt)', dt: 'Δt = 10 · log_γ(v₂ / v₁)' },
    ctx: t('Правило Вант-Гоффа.', 'Van ’t Hoff’s rule.'),
  },
  {
    topic: 'c11-ph',
    text: 'pH = −lg[H⁺]',
    vars: { pH: q('pH', 'pH раствора', 'the pH', '', '', []), H: q('[H⁺]', 'концентрацию ионов водорода', 'the hydrogen ion concentration', 'моль/л', 'mol/L', []) },
    ask: ['pH', 'H'],
    gen: (r) => {
      const k = pick(r, ints(1, 13));
      return { pH: k, H: 10 ** -k };
    },
    rel: (v) => v.pH + Math.log10(v.H),
    wrong: [(v) => v.pH - (14 + Math.log10(v.H)), (v) => v.pH + Math.log10(v.H) / 10, (v) => v.pH - 1 / -Math.log10(v.H)],
    solved: { pH: 'pH = −lg[H⁺]', H: '[H⁺] = 10^(−pH)' },
  },
  {
    topic: 'c8-masses',
    text: 'w(Э) = n·Ar(Э) / Mr · 100%',
    vars: { w: q('w', 'массовую долю элемента', 'the mass fraction of the element', '%', '%', []), n: q('n', 'число атомов элемента', 'the number of atoms', '', '', []), Ar: q('Ar', 'относительную атомную массу', 'the atomic mass', '', '', []), Mr: q('Mr', 'относительную молекулярную массу', 'the molecular mass', '', '', []) },
    ask: ['w', 'Mr'],
    gen: (r) => {
      const c = pick(r, [
        { n: 2, Ar: 1, Mr: 18 },
        { n: 1, Ar: 12, Mr: 44 },
        { n: 2, Ar: 56, Mr: 160 },
        { n: 1, Ar: 32, Mr: 98 },
        { n: 1, Ar: 40, Mr: 100 },
        { n: 1, Ar: 14, Mr: 17 },
        { n: 4, Ar: 1, Mr: 16 },
        { n: 2, Ar: 27, Mr: 102 },
      ]);
      return { ...c, w: ((c.n * c.Ar) / c.Mr) * 100 };
    },
    rel: (v) => v.w - ((v.n * v.Ar) / v.Mr) * 100,
    wrong: [(v) => v.w - (v.Ar / v.Mr) * 100, (v) => v.w - (v.Mr / (v.n * v.Ar)) * 10, (v) => v.w - (v.n * v.Ar) / v.Mr],
    solved: { w: 'w = n·Ar / Mr · 100%', Mr: 'Mr = n·Ar / w · 100%' },
  },
  {
    topic: 'p7-measurement',
    text: 'C = (a − b) / n',
    vars: { C: q('C', 'цену деления', 'the scale division', 'мл', 'mL', []), a: q('a', 'большее значение у штриха', 'the larger mark', 'мл', 'mL', []), b: q('b', 'меньшее значение у штриха', 'the smaller mark', 'мл', 'mL', []), n: q('n', 'число делений между ними', 'the number of divisions', '', '', []) },
    ask: ['C', 'n'],
    gen: (r) => {
      const n = pick(r, [2, 4, 5, 10]);
      const C0 = pick(r, [0.5, 1, 2, 5]);
      const b = pick(r, [10, 20, 40, 50]);
      return { n, C: C0, b, a: b + C0 * n };
    },
    rel: (v) => v.C - (v.a - v.b) / v.n,
    wrong: [(v) => v.C - (v.a + v.b) / v.n, (v) => v.C - v.a / v.n, (v) => v.C - (v.a - v.b) * v.n],
    solved: { C: 'C = (a − b) / n', n: 'n = (a − b) / C' },
    ctx: t('У мензурки соседние подписанные штрихи.', 'Two neighbouring labelled marks on a measuring cylinder.'),
  },
];

/** numeric root of f between lo and hi (log-spaced scan, then bisection), closest to `near` */
function findRoot(f: (z: number) => number, near: number): number[] {
  const lo = Math.abs(near) / 1000;
  const hi = Math.abs(near) * 1000;
  const steps = 240;
  const roots: number[] = [];
  let px = lo;
  let pf = f(px);
  for (let i = 1; i <= steps; i++) {
    const x = lo * (hi / lo) ** (i / steps);
    const fx = f(x);
    if (Number.isFinite(pf) && Number.isFinite(fx) && Math.sign(pf) !== Math.sign(fx)) {
      let a0 = px;
      let b0 = x;
      for (let k = 0; k < 60; k++) {
        const m0 = Math.sqrt(a0 * b0);
        const fm = f(m0);
        if (Math.sign(fm) === Math.sign(f(a0))) a0 = m0;
        else b0 = m0;
      }
      roots.push(Math.sqrt(a0 * b0));
    }
    px = x;
    pf = fx;
  }
  return roots;
}

function gLawGen(law: GLaw, idx: number): ProblemGen {
  const topic = topicById(law.topic);
  const subject = law.topic.startsWith('c') ? 'chemistry' : law.topic.startsWith('b') ? 'biology' : 'physics';
  const grade = topic?.grade ?? Number(law.topic.match(/\d+/)?.[0] ?? 9);
  const head = law.text.split(/[=(]/)[0].trim();
  return {
    id: `law:${law.topic}:s${idx}`,
    subject,
    grade,
    topics: [law.topic],
    title: topic ? t(`${topic.title.ru} (${head})`, `${topic.title.en} (${head})`) : t(law.text, law.text),
    make: (r) => {
      const vals = law.gen(r);
      const key = pick(r, law.ask);
      const unknown = law.vars[key];
      const answer = vals[key];
      const ans = fmtNum(answer);
      const wrong: string[] = [];
      const add = (w: number) => {
        const f = fmtNum(w);
        if (Number.isFinite(w) && w > 0 && f !== ans && !wrong.includes(f) && wrong.length < 3) wrong.push(f);
      };
      // solve each wrong equation for the unknown, keeping the other values
      for (const bad of law.wrong) {
        const roots = findRoot((z) => bad({ ...vals, [key]: z }), answer).filter((z) => Math.abs(z / answer - 1) > 0.02);
        if (roots.length) add(roots.sort((a0, b0) => Math.abs(Math.log(a0 / answer)) - Math.abs(Math.log(b0 / answer)))[0]);
      }
      for (const k of [2, 0.5, 10, 0.1, 3]) add(answer * k);

      const given = Object.entries(law.vars)
        .filter(([k]) => k !== key)
        .map(([k, qq]) => `${qq.s} = ${fmtNum(vals[k])}${unitStr(qq.u.ru)}`);
      const givenEn = Object.entries(law.vars)
        .filter(([k]) => k !== key)
        .map(([k, qq]) => `${qq.s} = ${fmtNum(vals[k]).replace(',', '.')}${unitStr(qq.u.en)}`);
      return {
        prompt: t(`${law.ctx ? law.ctx.ru + ' ' : ''}Дано: ${given.join(', ')}. Найди ${unknown.ru} ${unknown.s}.`, `${law.ctx ? law.ctx.en + ' ' : ''}Given: ${givenEn.join(', ')}. Find ${unknown.en} ${unknown.s}.`),
        answer: ans,
        unit: unknown.u.ru ? unknown.u : undefined,
        wrong,
        // when the law is already written for the unknown, don't repeat it after "⇒"
        solution: law.text.includes(law.solved[key])
          ? t(`${law.text} = ${ans}${unitStr(unknown.u.ru)}`, `${law.text} = ${ans.replace(',', '.')}${unitStr(unknown.u.en)}`)
          : t(`${law.text} ⇒ ${law.solved[key]} = ${ans}${unitStr(unknown.u.ru)}`, `${law.text} ⇒ ${law.solved[key]} = ${ans.replace(',', '.')}${unitStr(unknown.u.en)}`),
      };
    },
  };
}

export const SUM_LAW_PROBLEMS: ProblemGen[] = GLAWS.map((law, i) => gLawGen(law, GLAWS.slice(0, i).filter((l) => l.topic === law.topic).length));
