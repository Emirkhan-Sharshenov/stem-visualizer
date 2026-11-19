import { rng, shuffle, type Option, type Question } from '../quiz';
import { days, frac, gcd, int, lcm, num, pick, sub, T, type Compare, type Pick5, type R, type T2 } from './kit';
import { COMPARE_MORE, FIGURE_COMPARE, FIGURE_PICK5, PICK5_MORE } from './mathMore';

/* The maths part of the ORT main test: part 1 compares two quantities, part 2 picks one of five answers. The topics follow
   the official list in the CEEATM brochure for 2025 (arithmetic, algebra, geometry, trigonometry), and within each part the
   tasks go from easy to hard, as the brochure says. The tasks are generated here, none comes from the real paper. */

/* ---------------- part 1: comparing two quantities ---------------- */

const COMPARE_OPTIONS: Option[] = [
  T('Больше величина в колонке А', 'Column A is greater'),
  T('Больше величина в колонке Б', 'Column B is greater'),
  T('Обе величины равны', 'The two are equal'),
  T('По этим данным определить нельзя', 'Cannot be determined from the information given'),
];

const COMPARE_BASE: ((r: R) => Compare)[] = [
  (r) => {
    const [p, q] = pick(r, [[1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [7, 10]] as const);
    const v = p / q;
    const d = v + pick(r, [0, 0, 0.05, -0.05]);
    return { level: 1, a: `${p}/${q}`, b: num(d), values: [v, d], why: T(`${p}/${q} = ${num(v)}. Сравниваем с ${num(d)}.`, `${p}/${q} = ${num(v)}. Compare with ${num(d)}.`) };
  },
  (r) => {
    const x = pick(r, [10, 20, 25, 40, 50]);
    const y = pick(r, [20, 30, 60, 80, 120]);
    const swap = r() < 0.5;
    const n = swap ? x : y + 10;
    return { level: 1, a: `${x}% от ${y}`, b: `${swap ? y : n}% от ${swap ? n : x}`, values: [(x * y) / 100, ((swap ? y : n) * (swap ? n : x)) / 100], why: T(`Считаем обе величины: ${num((x * y) / 100)} и ${num(((swap ? y : n) * (swap ? n : x)) / 100)}.`, `Work out both: ${num((x * y) / 100)} and ${num(((swap ? y : n) * (swap ? n : x)) / 100)}.`) };
  },
  (r) => {
    const a = int(r, 2, 9);
    const k = a * a + pick(r, [0, 0, 3, -2]);
    return { level: 1, a: `√${k}`, b: `${a}`, values: [Math.sqrt(k), a], why: T(`Сравниваем квадраты: ${k} и ${a * a}.`, `Compare the squares: ${k} and ${a * a}.`) };
  },
  (r) => {
    const a = int(r, 2, 6);
    return { level: 2, a: `(−${a})²`, b: `−${a}²`, values: [a * a, -a * a], why: T(`(−${a})² = ${a * a}, а −${a}² = −${a * a}: степень считается раньше знака минус.`, `(−${a})² = ${a * a}, but −${a}² = −${a * a}: the power comes before the minus.`) };
  },
  (r) => {
    const n = int(r, 2, 5);
    const m = 2 * n + pick(r, [0, 1, -1]);
    return { level: 2, a: `4^${n}`, b: `2^${m}`, values: [4 ** n, 2 ** m], why: T(`4^${n} = 2^${2 * n}. Сравниваем показатели: ${2 * n} и ${m}.`, `4^${n} = 2^${2 * n}. Compare the exponents: ${2 * n} and ${m}.`) };
  },
  (r) => {
    const p = int(r, 40, 80);
    const q = int(r, 30, 130 - p);
    const third = 180 - p - q;
    const v = third + pick(r, [0, 5, -5]);
    return { level: 2, given: T(`В треугольнике два угла равны ${p}° и ${q}°.`, `Two angles of a triangle are ${p}° and ${q}°.`), a: T('Третий угол', 'The third angle'), b: `${v}°`, values: [third, v], why: T(`Сумма углов 180°, значит третий угол ${third}°.`, `The angles add up to 180°, so the third is ${third}°.`) };
  },
  (r) => {
    const w = int(r, 3, 9);
    const h = w + int(r, 1, 5);
    const side = (w + h) / 2;
    return { level: 2, given: T(`Стороны прямоугольника ${w} и ${h}, сторона квадрата ${num(side)}.`, `A rectangle has sides ${w} and ${h}; a square has side ${num(side)}.`), a: T('Площадь прямоугольника', 'The rectangle’s area'), b: T('Площадь квадрата', 'The square’s area'), values: [w * h, side * side], why: T(`${w}·${h} = ${w * h}, а ${num(side)}² = ${num(side * side)}. При равном периметре у квадрата площадь больше.`, `${w}·${h} = ${w * h} and ${num(side)}² = ${num(side * side)}. For the same perimeter a square has the larger area.`) };
  },
  (r) => {
    const set = pick(r, [[1, 2, 3, 10], [2, 4, 6, 8], [1, 5, 6, 8], [3, 3, 4, 14], [2, 6, 7, 9]]);
    const mean = set.reduce((x, y) => x + y, 0) / set.length;
    const median = (set[1] + set[2]) / 2;
    return { level: 3, given: T(`Набор чисел: ${set.join('; ')}.`, `The numbers: ${set.join('; ')}.`), a: T('Среднее арифметическое', 'The mean'), b: T('Медиана', 'The median'), values: [mean, median], why: T(`Среднее ${num(mean)}, медиана ${num(median)}.`, `The mean is ${num(mean)}, the median ${num(median)}.`) };
  },
  (r) => {
    const n = int(r, 5, 9);
    const sum = (n - 2) * 180;
    const v = sum + pick(r, [0, 180, -180]);
    return { level: 3, a: T(`Сумма внутренних углов выпуклого ${n}-угольника`, `The interior angles of a convex ${n}-gon, added up`), b: `${v}°`, values: [sum, v], why: T(`Сумма углов n-угольника: 180°·(n − 2) = ${sum}°.`, `The angles of an n-gon add up to 180°·(n − 2) = ${sum}°.`) };
  },
  (r) => {
    const a = int(r, 2, 7);
    const x = int(r, 2, 9);
    const b = int(r, 1, 12);
    const v = x + pick(r, [0, 1, -1]);
    return { level: 2, given: T(`${a}x + ${b} = ${a * x + b}`), a: 'x', b: `${v}`, values: [x, v], why: T(`${a}x = ${a * x}, значит x = ${x}.`, `${a}x = ${a * x}, so x = ${x}.`) };
  },
  (r) => {
    const n = pick(r, [8, 16, 32, 64, 128]);
    const log = Math.log2(n);
    const v = log + pick(r, [0, 1, -1]);
    return { level: 3, a: `log₂ ${n}`, b: `${v}`, values: [log, v], why: T(`2^${log} = ${n}, значит log₂ ${n} = ${log}.`, `2^${log} = ${n}, so log₂ ${n} = ${log}.`) };
  },
  (r) => {
    const [a, va, b, vb, note] = pick(r, [
      ['sin 30°', 0.5, 'cos 60°', 0.5, 'оба равны 1/2'],
      ['sin 45°', Math.SQRT1_2, 'cos 30°', Math.sqrt(3) / 2, '√2/2 меньше √3/2'],
      ['tg 45°', 1, 'sin 90°', 1, 'оба равны 1'],
      ['cos 0°', 1, 'sin 60°', Math.sqrt(3) / 2, '1 больше √3/2'],
      ['tg 60°', Math.sqrt(3), 'ctg 45°', 1, '√3 больше 1'],
      ['sin 180°', 0, 'cos 90°', 0, 'оба равны 0'],
    ] as const);
    return { level: 3, a, b, values: [va, vb], why: T(`Табличные значения: ${note}.`, `Table values: ${a} = ${num(va)}, ${b} = ${num(vb)}.`) };
  },
  (r) => {
    const k = int(r, 2, 9);
    const c = pick(r, [
      { given: `0 < x < 1`, a: 'x', b: 'x²', values: [0.5, 0.25] as [number, number], ru: 'Число меньше 1 при возведении в квадрат уменьшается.', en: 'A number below 1 shrinks when squared.' },
      { given: `x > 1`, a: 'x²', b: 'x', values: [4, 2] as [number, number], ru: 'Число больше 1 при возведении в квадрат растёт.', en: 'A number above 1 grows when squared.' },
      { given: `x < 0`, a: '−x', b: 'x', values: [2, -2] as [number, number], ru: 'Если x отрицателен, то −x положителен.', en: 'If x is negative, −x is positive.' },
      { given: `x > 0`, a: 'x', b: 'x²', values: null, ru: 'При x = 1/2 больше x, при x = 2 больше x²: данных не хватает.', en: 'At x = 1/2 x is greater, at x = 2 x² is greater: not enough information.' },
      { given: `x + y = ${k}`, a: 'x', b: 'y', values: null, ru: 'Подходят и x = 0, и x = ' + k + ': одного уравнения не хватает.', en: 'Both x = 0 and x = ' + k + ' fit: one equation is not enough.' },
      { given: `x − y = ${k}`, a: 'x', b: 'y', values: [k, 0] as [number, number], ru: `x = y + ${k}, поэтому x больше.`, en: `x = y + ${k}, so x is greater.` },
      { given: `x < 0`, a: 'x³', b: 'x', values: null, ru: 'При x = −2 больше x, при x = −1/2 больше x³.', en: 'At x = −2 x is greater, at x = −1/2 x³ is greater.' },
      { given: `x² = ${k * k}`, a: 'x', b: '0', values: null, ru: `x может быть и ${k}, и −${k}.`, en: `x can be ${k} or −${k}.` },
    ]);
    return { level: 4, given: T(c.given), a: c.a, b: c.b, values: c.values, why: T(c.ru, c.en) };
  },
  (r) => {
    const d = int(r, 2, 12);
    const c = pick(r, [
      { a: T('Длина окружности', 'The circumference'), b: `${3 * d}`, va: Math.PI * d, vb: 3 * d, ru: `C = πd, а π больше 3.`, en: `C = πd and π is above 3.` },
      { a: T('Площадь круга', 'The area'), b: `${d * d}`, va: (Math.PI * d * d) / 4, vb: d * d, ru: `S = πd²/4, а π/4 меньше 1: круг помещается в квадрат со стороной d.`, en: `S = πd²/4 and π/4 is below 1: the circle fits inside a square of side d.` },
    ]);
    return { level: 3, given: T(`Диаметр круга равен ${d}.`, `A circle has diameter ${d}.`), a: c.a, b: c.b, values: [c.va, c.vb], why: T(c.ru, c.en) };
  },
  (r) => {
    const a = int(r, 2, 9);
    const b = a + int(r, 1, 6);
    const c = int(r, 1, 5);
    return { level: 4, a: `${a}/${b}`, b: `${a + c}/${b + c}`, values: [a / b, (a + c) / (b + c)], why: T(`Если к числителю и знаменателю правильной дроби прибавить одно и то же положительное число, дробь растёт: ${frac(a, b)} меньше ${frac(a + c, b + c)}.`, `Adding the same positive number to the top and bottom of a proper fraction makes it larger: ${frac(a, b)} is below ${frac(a + c, b + c)}.`) };
  },
  (r) => {
    const n = int(r, 3, 7);
    const sum = (n * (n + 1)) / 2;
    const v = sum + pick(r, [0, 2, -2]);
    return { level: 3, a: `1 + 2 + … + ${n}`, b: `${v}`, values: [sum, v], why: T(`Сумма равна ${n}·${n + 1}/2 = ${sum}.`, `The sum is ${n}·${n + 1}/2 = ${sum}.`) };
  },
];

const stop = (s: string) => (s.endsWith('.') ? s : `${s}.`);

function compareQuestion(c: Compare, id: string): Question {
  const correct = !c.values ? 3 : Math.abs(c.values[0] - c.values[1]) < 1e-9 ? 2 : c.values[0] > c.values[1] ? 0 : 1;
  const side = (v: string | T2, lang: 'ru' | 'en') => (typeof v === 'string' ? v : v[lang]);
  const body = `Колонка А: ${side(c.a, 'ru')}.  Колонка Б: ${side(c.b, 'ru')}.`;
  const bodyEn = `Column A: ${side(c.a, 'en')}.  Column B: ${side(c.b, 'en')}.`;
  return {
    id,
    topicId: '',
    prompt: { ru: c.given ? `${stop(c.given.ru)} ${body}` : body, en: c.given ? `${stop(c.given.en)} ${bodyEn}` : bodyEn },
    options: COMPARE_OPTIONS,
    correct,
    explain: c.why,
    figure: c.figure,
    columns: { given: c.given, a: typeof c.a === 'string' ? T(c.a) : c.a, b: typeof c.b === 'string' ? T(c.b) : c.b },
  };
}

/* ---------------- part 2: one of five answers ---------------- */

const PICK5_BASE: ((r: R) => Pick5)[] = [
  (r) => {
    const price = pick(r, [200, 400, 500, 800, 1000, 1200]);
    const pct = pick(r, [10, 20, 25, 30, 50]);
    const left = (price * (100 - pct)) / 100;
    return { level: 1, prompt: T(`Товар стоил ${price} сомов. После скидки ${pct}% он стоит:`, `An item cost ${price} som. After a ${pct}% discount it costs:`), answers: [num(left), num((price * pct) / 100), num(price - pct), num(left + 50), num(left - 40)], why: T(`${price}·${num((100 - pct) / 100)} = ${num(left)}.`) };
  },
  (r) => {
    const a = int(r, 2, 9);
    const x = int(r, 2, 12);
    const b = int(r, 1, 20);
    return { level: 1, prompt: T(`Чему равен x, если ${a}x − ${b} = ${a * x - b}?`, `Find x if ${a}x − ${b} = ${a * x - b}.`), answers: [num(x), num(x + 1), num(x - 1), num(a * x), num(x + b)], why: T(`${a}x = ${a * x}, значит x = ${x}.`, `${a}x = ${a * x}, so x = ${x}.`) };
  },
  (r) => {
    const a = pick(r, [4, 6, 8, 9, 10, 12, 15]);
    const b = pick(r, [6, 8, 9, 14, 16, 18, 20]);
    const g = gcd(a, b);
    const l = lcm(a, b);
    return { level: 1, prompt: T(`Наименьшее общее кратное чисел ${a} и ${b} равно:`, `The least common multiple of ${a} and ${b} is:`), answers: [num(l), num(a * b === l ? l * 2 : a * b), num(g), num(a + b), num(l + g + 1)], why: T(`НОД равен ${g}, поэтому НОК = ${a}·${b}/${g} = ${l}.`, `The GCD is ${g}, so the LCM = ${a}·${b}/${g} = ${l}.`) };
  },
  (r) => {
    const b = pick(r, [3, 4, 5, 6]);
    const d = pick(r, [7, 8, 9, 10]);
    const a = int(r, 1, b - 1);
    const c = int(r, 1, d - 1);
    const top = a * d + c * b;
    const bottom = b * d;
    return { level: 1, prompt: T(`${a}/${b} + ${c}/${d} =`), answers: [frac(top, bottom), frac(a + c, b + d), frac(a * c, bottom), frac(top + 1, bottom), frac(top, bottom + 1)], why: T(`Общий знаменатель ${bottom}: (${a * d} + ${c * b})/${bottom} = ${frac(top, bottom)}.`, `The common denominator is ${bottom}: (${a * d} + ${c * b})/${bottom} = ${frac(top, bottom)}.`) };
  },
  (r) => {
    const [v, v2] = pick(r, [[40, 60], [60, 80], [60, 90], [40, 80], [50, 75], [80, 100], [60, 120]] as const);
    const s = lcm(v, v2) * int(r, 1, 2);
    const t = s / v;
    const t2 = s / v2;
    return { level: 2, prompt: T(`Автомобиль проехал путь за ${t} ч со скоростью ${v} км/ч. Сколько часов займёт этот путь со скоростью ${v2} км/ч?`, `A car covered a distance in ${t} h at ${v} km/h. How many hours will it take at ${v2} km/h?`), answers: [num(t2), num(t2 + 1), num(t - 1), num(t + 1), num(t2 / 2)], why: T(`Путь ${s} км, ${s}/${v2} = ${num(t2)} ч.`, `The distance is ${s} km, ${s}/${v2} = ${num(t2)} h.`) };
  },
  (r) => {
    const w = pick(r, [2, 3, 4, 6]);
    const d = pick(r, [6, 8, 12, 24]);
    const w2 = pick(r, [8, 16]);
    const left = (w * d) / w2;
    return { level: 2, prompt: T(`Работу выполняют ${w} рабочих, на неё уходит ${d} ${days(d)}. За сколько дней сделают её ${w2} рабочих при той же производительности?`, `${w} workers finish a job in ${d} days. How many days will ${w2} workers need at the same rate?`), answers: [num(left), num(left * 2), num(d - 2), num((d * w2) / w), num(left + 3)], why: T(`Всего ${w * d} человеко-дней, ${w * d}/${w2} = ${num(left)}.`, `It is ${w * d} worker-days, ${w * d}/${w2} = ${num(left)}.`) };
  },
  (r) => {
    const a = int(r, 2, 6);
    const m = int(r, 2, 5);
    const n = int(r, 2, 5);
    return { level: 2, prompt: T(`Упростите выражение: (x^${m})^${n} · x^${a}`, `Simplify: (x^${m})^${n} · x^${a}`), answers: [`x^${m * n + a}`, `x^${m + n + a}`, `x^${m * n * a}`, `x^${m * n}`, `x^${m * n + a + 1}`, `x^${m * n + a + 2}`], why: T(`При возведении степени в степень показатели умножаются, при умножении степеней складываются: ${m * n} + ${a}.`, `A power of a power multiplies the exponents, a product of powers adds them: ${m * n} + ${a}.`) };
  },
  (r) => {
    const p = int(r, 1, 6);
    const q = p + int(r, 1, 6);
    return { level: 2, prompt: T(`Корни уравнения x² − ${p + q}x + ${p * q} = 0 равны:`, `The roots of x² − ${p + q}x + ${p * q} = 0 are:`), answers: [`${p}; ${q}`, `−${p}; −${q}`, `${p + 1}; ${q + 1}`, `${p}; ${p * q}`, `${p + q}; ${p * q}`, `${q}; ${q + 2}`], why: T(`По теореме Виета сумма корней ${p + q}, произведение ${p * q}.`, `By Vieta's formulas the roots add up to ${p + q} and multiply to ${p * q}.`) };
  },
  (r) => {
    const x = int(r, 1, 8);
    const y = int(r, 1, 8);
    return { level: 2, prompt: T(`Если x + y = ${x + y} и x − y = ${x - y}, то xy =`, `If x + y = ${x + y} and x − y = ${x - y}, then xy =`), answers: [num(x * y), num(x + y), num(x * y + 1), num(x * x), num(x * y + x)], why: T(`Складываем уравнения: x = ${x}, значит y = ${y}, а xy = ${x * y}.`, `Add the equations: x = ${x}, so y = ${y} and xy = ${x * y}.`) };
  },
  (r) => {
    const a1 = int(r, 1, 9);
    const d = int(r, 2, 7);
    const n = int(r, 6, 15);
    const an = a1 + (n - 1) * d;
    return { level: 3, prompt: T(`В арифметической прогрессии a₁ = ${a1}, d = ${d}. Найдите a${sub(n)}.`, `In an arithmetic progression a₁ = ${a1}, d = ${d}. Find a${sub(n)}.`), answers: [num(an), num(a1 + n * d), num(an - a1), num(n * d), num(an + 2 * d)], why: T(`aₙ = a₁ + (n − 1)d = ${a1} + ${n - 1}·${d} = ${an}.`) };
  },
  (r) => {
    const b = int(r, 1, 5);
    const q = pick(r, [2, 3]);
    const n = int(r, 4, 6);
    const v = b * q ** (n - 1);
    return { level: 3, prompt: T(`В геометрической прогрессии b₁ = ${b}, q = ${q}. Найдите b${sub(n)}.`, `In a geometric progression b₁ = ${b}, q = ${q}. Find b${sub(n)}.`), answers: [num(v), num(b * q ** n), num(v + q), num(b + q * (n - 1)), num(q ** (n - 1))], why: T(`bₙ = b₁·qⁿ⁻¹ = ${b}·${q}^${n - 1} = ${v}.`) };
  },
  (r) => {
    const [a, b, c] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
    return { level: 2, prompt: T(`Катеты прямоугольного треугольника равны ${a} и ${b}. Гипотенуза равна:`, `The legs of a right triangle are ${a} and ${b}. The hypotenuse is:`), answers: [num(c), num(a + b), num(c + 1), num(c - 1), num(b + 1 === c ? c + 2 : b + 1)], why: T(`√(${a}² + ${b}²) = √${a * a + b * b} = ${c}.`) };
  },
  (r) => {
    const a = pick(r, [4, 6, 8, 10]);
    const b = a + pick(r, [2, 4, 6]);
    const h = int(r, 3, 9);
    const s = ((a + b) * h) / 2;
    return { level: 3, prompt: T(`Основания трапеции равны ${a} и ${b}, высота ${h}. Её площадь равна:`, `A trapezoid has bases ${a} and ${b} and height ${h}. Its area is:`), answers: [num(s), num((a + b) * h), num(a * b), num(s + h), num(a * h)], why: T(`S = (${a} + ${b})/2 · ${h} = ${num(s)}.`) };
  },
  (r) => {
    const R = int(r, 2, 9);
    return { level: 2, prompt: T(`Длина окружности равна ${2 * R}π. Площадь этого круга равна:`, `A circle has circumference ${2 * R}π. Its area is:`), answers: [`${R * R}π`, `${2 * R}π`, `${4 * R * R}π`, `${R}π`, `${2 * R * R}π`, `${R * R + 1}π`], why: T(`2πR = ${2 * R}π, значит R = ${R}, а S = πR² = ${R * R}π.`, `2πR = ${2 * R}π, so R = ${R} and S = πR² = ${R * R}π.`) };
  },
  (r) => {
    const R = int(r, 2, 6);
    const h = int(r, 3, 10);
    return { level: 3, prompt: T(`Объём цилиндра с радиусом основания ${R} и высотой ${h} равен:`, `A cylinder has base radius ${R} and height ${h}. Its volume is:`), answers: [`${R * R * h}π`, `${2 * R * h}π`, `${R * h}π`, `${R * R * h * 2}π`, `${(R + h) * R}π`, `${R * R * h + 1}π`], why: T(`V = πR²h = π·${R * R}·${h} = ${R * R * h}π.`) };
  },
  (r) => {
    const a = int(r, 2, 6);
    const V = a ** 3;
    return { level: 3, prompt: T(`Объём куба равен ${V}. Площадь его полной поверхности равна:`, `A cube has volume ${V}. Its total surface area is:`), answers: [num(6 * a * a), num(a * a), num(4 * a * a), num(12 * a), num(6 * a)], why: T(`Ребро равно ${a}, поверхность 6·${a}² = ${6 * a * a}.`, `The edge is ${a}, the surface is 6·${a}² = ${6 * a * a}.`) };
  },
  (r) => {
    const [p, q, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
    return { level: 4, prompt: T(`Угол α острый, sin α = ${p}/${h}. Тогда cos α =`, `Angle α is acute and sin α = ${p}/${h}. Then cos α =`), answers: [`${q}/${h}`, `${p}/${q}`, `${q}/${p}`, `${h}/${q}`, `${h - p}/${h}`], why: T(`cos²α = 1 − sin²α = ${q * q}/${h * h}, а при остром угле косинус положителен.`, `cos²α = 1 − sin²α = ${q * q}/${h * h}, and the cosine of an acute angle is positive.`) };
  },
  (r) => {
    const b = pick(r, [2, 3, 5]);
    const n = int(r, 2, 4);
    const k = int(r, 1, 3);
    return { level: 3, prompt: T(`log${sub(b)} ${b ** (n + k)} − log${sub(b)} ${b ** k} =`), answers: [num(n), num(n + k), num(b ** n), num(k), num(n + 1 === k ? n + 2 : n + 1)], why: T(`Разность логарифмов равна логарифму частного: log${sub(b)} ${b ** n} = ${n}.`, `A difference of logs is the log of the quotient: log${sub(b)} ${b ** n} = ${n}.`) };
  },
  (r) => {
    const x1 = int(r, -4, 4);
    const y1 = int(r, -4, 4);
    const [dx, dy, d] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
    return { level: 3, prompt: T(`Расстояние между точками (${num(x1)}; ${num(y1)}) и (${num(x1 + dx)}; ${num(y1 + dy)}) равно:`, `The distance between (${num(x1)}; ${num(y1)}) and (${num(x1 + dx)}; ${num(y1 + dy)}) is:`), answers: [num(d), num(dx + dy), num(d + 1), num(d - 1), num(dx * dy)], why: T(`√(${dx}² + ${dy}²) = ${d}.`) };
  },
  (r) => {
    const red = int(r, 2, 6);
    const blue = int(r, 2, 6);
    const green = int(r, 1, 5);
    const all = red + blue + green;
    return { level: 3, prompt: T(`Шаров в коробке: красных ${red}, синих ${blue}, зелёных ${green}. Вероятность вынуть наугад красный шар равна:`, `A box holds ${red} red, ${blue} blue and ${green} green balls. The chance of drawing a red one is:`), answers: [frac(red, all), frac(red, blue + green), frac(blue, all), frac(green, all + 1), frac(1, red + 1)], why: T(`Красных ${red} из ${all}: ${frac(red, all)}.`, `${red} red out of ${all}: ${frac(red, all)}.`) };
  },
  (r) => {
    const mean = int(r, 5, 12);
    const n = int(r, 3, 5);
    const add = mean + n + 1;
    const next = (mean * n + add) / (n + 1);
    return { level: 3, prompt: T(`Среднее арифметическое ${n} чисел равно ${mean}. К ним добавили число ${add}. Новое среднее равно:`, `The mean of ${n} numbers is ${mean}. The number ${add} is added. The new mean is:`), answers: [num(next), num((mean + add) / 2), num(mean), num(next + 2), num(add)], why: T(`Сумма была ${mean * n}, стала ${mean * n + add}; делим на ${n + 1}.`, `The sum was ${mean * n}, now ${mean * n + add}; divide by ${n + 1}.`) };
  },
  (r) => {
    const a = int(r, 2, 5);
    const b = int(r, 1, 6);
    const x = int(r, 2, 4);
    const v = a * x * x - b;
    return { level: 2, prompt: T(`f(x) = ${a}x² − ${b}. Чему равно f(${x})?`, `f(x) = ${a}x² − ${b}. Find f(${x}).`), answers: [num(v), num(a * x - b), num((a * x) ** 2 - b), num(v + 2 * b), num(v + 1)], why: T(`${a}·${x * x} − ${b} = ${v}.`) };
  },
  (r) => {
    const a = int(r, 1, 7);
    const b = int(r, 2, 8);
    return { level: 3, prompt: T(`Сумма корней уравнения |x − ${a}| = ${b} равна:`, `The roots of |x − ${a}| = ${b} add up to:`), answers: [num(2 * a), num(a + b), num(2 * b), num(a), num(2 * a + b)], why: T(`x = ${a + b} или x = ${num(a - b)}, их сумма ${2 * a}.`, `x = ${a + b} or x = ${num(a - b)}; they add up to ${2 * a}.`) };
  },
  (r) => {
    const lo = int(r, 1, 6);
    const hi = lo + int(r, 4, 9);
    const n = hi - lo - 1;
    return { level: 2, prompt: T(`Сколько целых чисел x удовлетворяют неравенству ${lo} < x < ${hi}?`, `How many integers x satisfy ${lo} < x < ${hi}?`), answers: [num(n), num(n + 1), num(n + 2), num(n - 1), num(hi - lo + 3)], why: T(`Это числа от ${lo + 1} до ${hi - 1}: всего ${n}.`, `They run from ${lo + 1} to ${hi - 1}: ${n} in all.`) };
  },
  (r) => {
    const a = int(r, 2, 5);
    const b = a + int(r, 1, 4);
    const whole = (a + b) * int(r, 3, 8);
    return { level: 2, prompt: T(`Число ${whole} разделили в отношении ${a} : ${b}. Большая часть равна:`, `${whole} is split in the ratio ${a} : ${b}. The larger part is:`), answers: [num((whole * b) / (a + b)), num((whole * a) / (a + b)), num(whole / b), num(whole - a * b), num((whole * b) / (a + b) + a)], why: T(`Одна часть равна ${whole}/${a + b} = ${whole / (a + b)}, большая ${b}·${whole / (a + b)} = ${(whole * b) / (a + b)}.`, `One share is ${whole}/${a + b} = ${whole / (a + b)}, the larger is ${b}·${whole / (a + b)} = ${(whole * b) / (a + b)}.`) };
  },
  (r) =>
    pick(r, [
      {
        level: 4,
        prompt: T('n — целое число. Что верно всегда? I. n² + n чётно; II. 2n + 1 нечётно; III. n² нечётно.', 'n is an integer. What is always true? I. n² + n is even; II. 2n + 1 is odd; III. n² is odd.'),
        answers: ['I, II', 'I', 'II', 'III', 'I, II, III'],
        why: T('n² + n = n(n + 1) — произведение соседних чисел, оно чётно; 2n + 1 нечётно; n² при чётном n чётно.', 'n² + n = n(n + 1) is a product of neighbours, so it is even; 2n + 1 is odd; n² is even when n is even.'),
      },
      {
        level: 4,
        prompt: T('n — целое число. Какое выражение всегда делится на 6? I. n(n + 1)(n + 2); II. 4n + 2; III. n + 3.', 'n is an integer. Which expression always divides by 6? I. n(n + 1)(n + 2); II. 4n + 2; III. n + 3.'),
        answers: ['I', 'II', 'III', 'I, II', 'I, II, III'],
        why: T('Среди трёх чисел подряд есть чётное и кратное 3. При n = 0 выражения II и III равны 2 и 3.', 'Three numbers in a row include an even one and a multiple of 3. At n = 0 expressions II and III equal 2 and 3.'),
      },
    ]),
];

function pick5Question(p: Pick5, r: R, id: string): Question {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const a of p.answers) {
    if (seen.has(a)) continue;
    seen.add(a);
    unique.push(a);
  }
  // a duplicate wrong answer gives way to the right one with its first number changed, so there are always five options
  for (let k = 2; unique.length < 5; k++) {
    const extra = unique[0].replace(/\d+/, (m) => String(Number(m) + k));
    if (!seen.has(extra)) {
      seen.add(extra);
      unique.push(extra);
    }
  }
  const options = shuffle(unique.slice(0, 5), r);
  return { id, topicId: '', prompt: p.prompt, options: options.map((s) => T(s)), correct: options.indexOf(unique[0]), explain: p.why, figure: p.figure };
}

/* ---------------- a paper ---------------- */

/** walks the generators in a shuffled loop, so each is used before any repeats and no task appears twice in a paper */
function take<V extends { level: number }>(gens: ((r: R) => V)[], count: number, r: R): V[] {
  const out: V[] = [];
  const seen = new Set<string>();
  let bag: ((r: R) => V)[] = [];
  while (out.length < count) {
    if (!bag.length) bag = shuffle(gens, r);
    const gen = bag.pop()!;
    let item = gen(r);
    for (let tries = 0; tries < 30 && seen.has(JSON.stringify(item)); tries++) item = gen(r);
    seen.add(JSON.stringify(item));
    out.push(item);
  }
  return out.sort((a, b) => a.level - b.level);
}

const COMPARE = [...COMPARE_BASE, ...COMPARE_MORE, ...FIGURE_COMPARE];
const PICK5 = [...PICK5_BASE, ...PICK5_MORE, ...FIGURE_PICK5];

/** the brochure gives two parts and 60 tasks in all; the even split is ours */
export const MATH_PART = 30;

export function ortMathPart1(seed: number, count = MATH_PART): Question[] {
  const r = rng(seed ^ 0x51ed);
  return take(COMPARE, count, r).map((c, k) => compareQuestion(c, `ort-math1-${seed}-${k}`));
}

export function ortMathPart2(seed: number, count = MATH_PART): Question[] {
  const r = rng(seed ^ 0x7a3b);
  return take(PICK5, count, r).map((p, k) => pick5Question(p, r, `ort-math2-${seed}-${k}`));
}

/** practice on drawings, charts and graphs only: comparisons and five-option tasks mixed */
export function ortMathFigures(seed: number, count = 10): { compare: Question[]; pick5: Question[] } {
  const r = rng(seed ^ 0x2f19);
  const half = Math.ceil(count / 2);
  return {
    compare: take(FIGURE_COMPARE, count - half, r).map((c, k) => compareQuestion(c, `ort-fig1-${seed}-${k}`)),
    pick5: take(FIGURE_PICK5, half, r).map((p, k) => pick5Question(p, r, `ort-fig2-${seed}-${k}`)),
  };
}
