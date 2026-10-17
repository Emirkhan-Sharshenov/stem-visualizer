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

const unitStr = (u: string) => (u ? (u.startsWith('·') ? u : ` ${u}`) : '');
const disp0 = (valSI: number, qq: Qty) => valSI / qq.si;

export const LAW_PROBLEMS: ProblemGen[] = LAWS.map((law, i) => lawGen(law, LAWS.slice(0, i).filter((l) => l.topic === law.topic).length));
export const LAW_COUNT = LAWS.length;
