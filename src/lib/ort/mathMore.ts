import { int, num, pick, T, type Compare, type Pick5, type R } from './kit';

/* More ORT maths: word problems the real paper is fond of (percent chains, joint work, mixtures, average speed, ages,
   remainders, patterns) and tasks with a drawing, a chart or a graph. Drawings are schematic: the numbers decide, not a
   ruler. All tasks are generated here; none comes from a real paper. */

/** a drawing in the page's own colours: lines and text use the current text colour, so it works on light and dark */
const svg = (w: number, h: number, label: string, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w * 1.4}px" role="img" aria-label="${label}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" font-family="inherit" font-size="17">${body}</svg>`;
const text = (x: number, y: number, s: string, anchor = 'middle') => `<text x="${x}" y="${y}" fill="currentColor" stroke="none" text-anchor="${anchor}">${s}</text>`;
const dot = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="4" fill="currentColor" stroke="none"/>`;

/* ---------------- comparisons without a drawing ---------------- */

export const COMPARE_MORE: ((r: R) => Compare)[] = [
  (r) => {
    const price = pick(r, [500, 800, 1000, 2000]);
    const p = pick(r, [10, 20, 25, 50]);
    const after = price * (1 + p / 100) * (1 - p / 100);
    return {
      level: 3,
      given: T(`Товар стоил ${price} сомов. Цену повысили на ${p}%, а потом снизили на ${p}%.`, `An item cost ${price} som. The price rose by ${p}%, then fell by ${p}%.`),
      a: T('Новая цена', 'The new price'),
      b: T(`${price} сомов`, `${price} som`),
      values: [after, price],
      why: T(`Снижение считается от уже повышенной цены: ${price}·${num(1 + p / 100)}·${num(1 - p / 100)} = ${num(after)}.`, `The fall is taken from the raised price: ${price}·${num(1 + p / 100)}·${num(1 - p / 100)} = ${num(after)}.`),
    };
  },
  (r) => {
    const [v1, v2] = pick(r, [[40, 60], [30, 60], [60, 90], [20, 30], [10, 15], [30, 70]] as const);
    const avg = (2 * v1 * v2) / (v1 + v2);
    return {
      level: 4,
      given: T(`Машина ехала туда со скоростью ${v1} км/ч, а обратно той же дорогой — ${v2} км/ч.`, `A car went at ${v1} km/h and came back the same way at ${v2} km/h.`),
      a: T('Средняя скорость на всём пути', 'The average speed for the whole trip'),
      b: T(`${num((v1 + v2) / 2)} км/ч`, `${num((v1 + v2) / 2)} km/h`),
      values: [avg, (v1 + v2) / 2],
      why: T(`Медленный участок длится дольше, поэтому средняя скорость меньше среднего арифметического: 2·${v1}·${v2}/(${v1} + ${v2}) = ${num(avg)} км/ч.`, `The slow leg lasts longer, so the average is below the arithmetic mean: 2·${v1}·${v2}/(${v1} + ${v2}) = ${num(avg)} km/h.`),
    };
  },
  (r) => {
    const b = int(r, 4, 12);
    const d = int(r, 4, 12);
    const a = int(r, 1, b - 1);
    const c = int(r, 1, d - 1);
    return {
      level: 2,
      a: `${a}/${b}`,
      b: `${c}/${d}`,
      values: [a / b, c / d],
      why: T(`Сравниваем «крест-накрест»: ${a}·${d} = ${a * d} и ${c}·${b} = ${c * b}.`, `Cross-multiply: ${a}·${d} = ${a * d} and ${c}·${b} = ${c * b}.`),
    };
  },
];

/* ---------------- comparisons with a drawing ---------------- */

export const FIGURE_COMPARE: ((r: R) => Compare)[] = [
  (r) => {
    const a = pick(r, [40, 45, 50, 55, 65, 70, 75]);
    const apex = pick(r, [true, false]);
    const figure = svg(340, 210, 'Равнобедренный треугольник ABC, AB = BC',
      `<path d="M40 180 L170 30 L300 180 Z"/><path d="M98 100 L112 110 M228 110 L242 100"/>` +
        text(28, 198, 'A') + text(170, 22, 'B') + text(312, 198, 'C') + text(80, 172, `${a}°`));
    return {
      level: 3,
      given: T(`В треугольнике ABC стороны AB и BC равны, угол A равен ${a}°.`, `In triangle ABC, AB = BC and angle A is ${a}°.`),
      a: apex ? T('Угол B', 'Angle B') : T('Угол C', 'Angle C'),
      b: `${a}°`,
      values: apex ? [180 - 2 * a, a] : [a, a],
      why: apex
        ? T(`Углы при основании AC равны, поэтому угол B = 180° − 2·${a}° = ${180 - 2 * a}°.`, `The base angles are equal, so angle B = 180° − 2·${a}° = ${180 - 2 * a}°.`)
        : T('В равнобедренном треугольнике углы при основании равны: угол C равен углу A.', 'In an isosceles triangle the base angles are equal, so angle C equals angle A.'),
      figure,
    };
  },
  (r) => {
    const variant = pick(r, [
      { a: 'a + b', b: '0', values: [-1, 0] as [number, number], ru: 'a меньше −1, а b меньше 1, поэтому сумма отрицательна.', en: 'a is below −1 and b below 1, so the sum is negative.' },
      { a: '|a|', b: 'b', values: [1.5, 0.5] as [number, number], ru: '|a| больше 1, а b меньше 1.', en: '|a| is above 1 while b is below 1.' },
      { a: 'a·b', b: 'a', values: [-0.75, -1.5] as [number, number], ru: 'ab − a = a(b − 1): оба множителя отрицательны, значит ab больше a.', en: 'ab − a = a(b − 1): both factors are negative, so ab is greater than a.' },
      { a: 'b²', b: 'b', values: [0.25, 0.5] as [number, number], ru: 'Число от 0 до 1 при возведении в квадрат уменьшается.', en: 'A number between 0 and 1 shrinks when squared.' },
      { a: 'a²', b: 'b²', values: [2.25, 0.25] as [number, number], ru: 'a² больше 1, а b² меньше 1.', en: 'a² is above 1 and b² below 1.' },
    ]);
    const ticks = [-3, -2, -1, 0, 1, 2, 3].map((k) => `<path d="M${200 + k * 55} 52 V68"/>` + text(200 + k * 55, 92, num(k))).join('');
    const figure = svg(400, 110, 'Числовая прямая с точками a и b', `<path d="M15 60 H385"/><path d="M375 54 L385 60 L375 66"/>${ticks}${dot(117, 60)}${dot(228, 60)}` + text(117, 40, 'a') + text(228, 40, 'b'));
    return {
      level: 4,
      given: T('На числовой прямой отмечены числа a и b: −2 < a < −1, 0 < b < 1.', 'Numbers a and b are marked on the line: −2 < a < −1, 0 < b < 1.'),
      a: variant.a,
      b: variant.b,
      values: variant.values,
      why: T(variant.ru, variant.en),
      figure,
    };
  },
  (r) => {
    const [w, h, d] = pick(r, [[8, 6, 10], [12, 5, 13], [12, 9, 15], [15, 8, 17]] as const);
    const v = d + pick(r, [0, 0, 1, -1]);
    const figure = svg(340, 200, 'Прямоугольник со сторонами и диагональю',
      `<path d="M40 160 H300 V40 H40 Z"/><path d="M40 160 L300 40" stroke-dasharray="7 6"/>` + text(170, 186, String(w)) + text(316, 106, String(h), 'start'));
    return {
      level: 3,
      given: T(`Стороны прямоугольника равны ${w} и ${h}.`, `The sides of a rectangle are ${w} and ${h}.`),
      a: T('Длина диагонали', 'The diagonal'),
      b: String(v),
      values: [d, v],
      why: T(`По теореме Пифагора диагональ равна √(${w}² + ${h}²) = √${w * w + h * h} = ${d}.`, `By Pythagoras the diagonal is √(${w}² + ${h}²) = √${w * w + h * h} = ${d}.`),
      figure,
    };
  },
];

/* ---------------- five-option word problems ---------------- */

const lin = (m: number, b: number) => `y = ${m === 1 ? '' : m === -1 ? '−' : num(m)}x${b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`}`;

export const PICK5_MORE: ((r: R) => Pick5)[] = [
  (r) => {
    const price = pick(r, [500, 1000, 2000, 2500]);
    const p = pick(r, [10, 20, 25, 50]);
    const res = price * (1 + p / 100) * (1 - p / 100);
    return { level: 3, prompt: T(`Цену товара в ${price} сомов повысили на ${p}%, затем снизили на ${p}%. Сколько стоит товар теперь?`, `An item at ${price} som went up by ${p}%, then down by ${p}%. What does it cost now?`), answers: [num(res), num(price), num(price * (1 - p / 100)), num(price * (1 + p / 100)), num(price - p)], why: T(`${price}·${num(1 + p / 100)} = ${num(price * (1 + p / 100))}, затем ·${num(1 - p / 100)} = ${num(res)}.`, `${price}·${num(1 + p / 100)} = ${num(price * (1 + p / 100))}, then ·${num(1 - p / 100)} = ${num(res)}.`) };
  },
  (r) => {
    const [a, b] = pick(r, [[3, 6], [4, 12], [6, 12], [10, 15], [2, 6], [12, 24], [6, 3]] as const);
    const t = (a * b) / (a + b);
    return { level: 4, prompt: T(`Один кран наполняет бак за ${a} ч, другой — за ${b} ч. За сколько часов наполнят бак оба крана вместе?`, `One tap fills a tank in ${a} h, another in ${b} h. How many hours do both need together?`), answers: [num(t), num((a + b) / 2), num(a + b), num(Math.abs(a - b)), num(t + 1)], why: T(`За час вместе наполняется 1/${a} + 1/${b} = ${a + b}/${a * b} бака, значит нужно ${a * b}/${a + b} = ${num(t)} ч.`, `Together they fill 1/${a} + 1/${b} = ${a + b}/${a * b} of the tank an hour, so it takes ${a * b}/${a + b} = ${num(t)} h.`) };
  },
  (r) => {
    const m1 = pick(r, [100, 200, 300]);
    const m2 = pick(r, [100, 200, 300]);
    const p1 = pick(r, [5, 10, 20]);
    const p2 = p1 + pick(r, [10, 20, 30]);
    const res = (m1 * p1 + m2 * p2) / (m1 + m2);
    return { level: 4, prompt: T(`Смешали ${m1} г ${p1}%-го раствора соли и ${m2} г ${p2}%-го. Какова концентрация смеси (в %)?`, `${m1} g of a ${p1}% salt solution is mixed with ${m2} g of a ${p2}% one. What is the concentration of the mix (%)?`), answers: [num(res), num((p1 + p2) / 2), num(p1 + p2), num(p2 - p1), num(res + 3)], why: T(`Соли ${num((m1 * p1) / 100)} + ${num((m2 * p2) / 100)} = ${num((m1 * p1 + m2 * p2) / 100)} г на ${m1 + m2} г смеси: ${num(res)}%.`, `Salt: ${num((m1 * p1) / 100)} + ${num((m2 * p2) / 100)} = ${num((m1 * p1 + m2 * p2) / 100)} g in ${m1 + m2} g: ${num(res)}%.`) };
  },
  (r) => {
    const [v1, v2] = pick(r, [[40, 60], [30, 60], [60, 90], [20, 30], [10, 15], [30, 70]] as const);
    const avg = (2 * v1 * v2) / (v1 + v2);
    return { level: 4, prompt: T(`Велосипедист ехал до озера со скоростью ${v1} км/ч, а обратно той же дорогой — ${v2} км/ч. Средняя скорость на всём пути равна (км/ч):`, `A cyclist rode to a lake at ${v1} km/h and back the same way at ${v2} km/h. The average speed (km/h) is:`), answers: [num(avg), num((v1 + v2) / 2), num(v1 + v2), num(Math.abs(v2 - v1)), num(avg + 2)], why: T(`Пусть путь равен ${v1 * v2} км в одну сторону: время ${v2} ч + ${v1} ч, путь ${2 * v1 * v2} км, средняя скорость ${2 * v1 * v2}/${v1 + v2} = ${num(avg)}.`, `Take ${v1 * v2} km each way: ${v2} h + ${v1} h for ${2 * v1 * v2} km, so ${2 * v1 * v2}/${v1 + v2} = ${num(avg)}.`) };
  },
  (r) => {
    const n = int(r, 5, 12);
    const res = (n * (n - 1)) / 2;
    return { level: 3, prompt: T(`${n} друзей при встрече пожали руку каждый каждому. Сколько было рукопожатий?`, `${n} friends each shook hands with every other one. How many handshakes were there?`), answers: [num(res), num(n * (n - 1)), num(n * n), num(n - 1), num((n * (n + 1)) / 2)], why: T(`Каждый из ${n} пожал ${n - 1} рук, но так каждое рукопожатие посчитано дважды: ${n}·${n - 1}/2 = ${res}.`, `Each of ${n} shakes ${n - 1} hands, but that counts each handshake twice: ${n}·${n - 1}/2 = ${res}.`) };
  },
  (r) => {
    if (pick(r, [true, false])) {
      const a = pick(r, [2, 3, 5]);
      const k = pick(r, [2, 3]);
      const seq = [a, a * k, a * k * k, a * k ** 3];
      const next = a * k ** 4;
      return { level: 2, prompt: T(`Какое число следующее: ${seq.join(', ')}, …?`, `What comes next: ${seq.join(', ')}, …?`), answers: [num(next), num(seq[3] + (seq[3] - seq[2])), num(next / k + k), num(seq[3] * 2 === next ? next + a : seq[3] * 2), num(next + k)], why: T(`Каждое число в ${k} раза больше предыдущего: ${seq[3]}·${k} = ${next}.`, `Each number is ${k} times the one before: ${seq[3]}·${k} = ${next}.`) };
    }
    const s = int(r, 1, 9);
    const seq = [s, s + 1, s + 3, s + 6, s + 10];
    return { level: 3, prompt: T(`Какое число следующее: ${seq.join(', ')}, …?`, `What comes next: ${seq.join(', ')}, …?`), answers: [num(s + 15), num(s + 14), num(s + 16), num(s + 20), num(s + 12)], why: T('Разности растут на 1: +1, +2, +3, +4, значит дальше +5.', 'The steps grow by one: +1, +2, +3, +4, so next is +5.') };
  },
  (r) => {
    if (pick(r, [true, false])) {
      const k = int(r, 4, 7);
      return { level: 3, prompt: T(`Решите уравнение: 2^(x + 1) = ${2 ** k}`), answers: [num(k - 1), num(k), num(k + 1), num(2 ** k / 2), num(k - 2)], why: T(`${2 ** k} = 2^${k}, значит x + 1 = ${k}, x = ${k - 1}.`, `${2 ** k} = 2^${k}, so x + 1 = ${k} and x = ${k - 1}.`) };
    }
    const k = int(r, 2, 4);
    return { level: 3, prompt: T(`Решите уравнение: 3^(x − 1) = ${3 ** k}`), answers: [num(k + 1), num(k), num(k - 1), num(3 ** k / 3), num(k + 2)], why: T(`${3 ** k} = 3^${k}, значит x − 1 = ${k}, x = ${k + 1}.`, `${3 ** k} = 3^${k}, so x − 1 = ${k} and x = ${k + 1}.`) };
  },
  (r) => {
    const m = pick(r, [5, 7, 9]);
    const rest = int(r, 2, m - 1);
    const k = int(r, 2, 4);
    const res = (k * rest) % m;
    return { level: 4, prompt: T(`При делении натурального числа n на ${m} получается остаток ${rest}. Какой остаток при делении ${k}n на ${m}?`, `n leaves remainder ${rest} when divided by ${m}. What remainder does ${k}n leave when divided by ${m}?`), answers: [num(res), num(rest), num(k * rest), num((res + 1) % m), num((res + 2) % m)], why: T(`n = ${m}q + ${rest}, тогда ${k}n = ${m}·${k}q + ${k * rest}, а ${k * rest} при делении на ${m} даёт остаток ${res}.`, `n = ${m}q + ${rest}, so ${k}n = ${m}·${k}q + ${k * rest}, and ${k * rest} leaves ${res} when divided by ${m}.`) };
  },
  (r) => {
    let t = 0;
    let s = 0;
    let k = 2;
    let f = 0;
    for (let i = 0; i < 50; i++) {
      t = int(r, 2, 10);
      s = int(r, 4, 14);
      k = pick(r, [2, 3]);
      f = k * (s + t) - t;
      if (f - s >= 20 && f - s <= 40) break;
    }
    const times = k === 2 ? 'вдвое' : 'втрое';
    return { level: 4, prompt: T(`Отцу ${f} лет, сыну ${s}. Через сколько лет отец будет ${times} старше сына?`, `A father is ${f} and his son ${s}. In how many years will the father be ${k} times as old?`), answers: [num(t), num(t + 1), num(t - 1 > 0 ? t - 1 : t + 3), num(f - s), num(t + 4)], why: T(`${f} + t = ${k}(${s} + t), отсюда t = ${t}.`, `${f} + t = ${k}(${s} + t), so t = ${t}.`) };
  },
];

/* ---------------- five-option tasks with a drawing ---------------- */

export const FIGURE_PICK5: ((r: R) => Pick5)[] = [
  (r) => {
    const a = pick(r, [35, 40, 45, 50, 55, 60, 65, 70]);
    const figure = svg(360, 210, 'Две параллельные прямые m и n и секущая',
      `<path d="M20 60 H340 M20 150 H340"/><path d="M110 15 L250 195"/>` + text(14, 54, 'm', 'start') + text(14, 144, 'n', 'start') + text(180, 82, `${a}°`, 'start') + text(232, 138, 'x', 'start'));
    return { level: 2, prompt: T('Прямые m и n параллельны. Найдите угол x (в градусах).', 'Lines m and n are parallel. Find angle x (in degrees).'), answers: [num(180 - a), num(a), num(90 - a), num(180 - 2 * a), num(90 + a)], why: T(`Углы ${a}° и x — односторонние при параллельных прямых, их сумма 180°: x = ${180 - a}°.`, `${a}° and x are co-interior angles between parallel lines, so they add up to 180°: x = ${180 - a}°.`), figure };
  },
  (r) => {
    const a = pick(r, [30, 40, 45, 50, 60]);
    const c = pick(r, [40, 50, 55, 65, 70]);
    const figure = svg(350, 200, 'Треугольник с внешним углом x',
      `<path d="M40 170 L250 170 L140 40 Z"/><path d="M250 170 H335" stroke-dasharray="7 6"/>` + text(78, 162, `${a}°`) + text(140, 76, `${c}°`) + text(276, 160, 'x'));
    return { level: 3, prompt: T('Найдите внешний угол x треугольника (в градусах).', 'Find the exterior angle x of the triangle (in degrees).'), answers: [num(a + c), num(180 - a - c), num(180 - a), num(180 - c), num(a + c + 10)], why: T(`Внешний угол равен сумме двух внутренних, не смежных с ним: ${a}° + ${c}° = ${a + c}°.`, `An exterior angle equals the sum of the two opposite interior angles: ${a}° + ${c}° = ${a + c}°.`), figure };
  },
  (r) => {
    const months = ['янв', 'фев', 'мар', 'апр'];
    const percent = pick(r, [true, false]);
    let vals = [0, 0, 0, 0].map(() => int(r, 2, 9) * 10);
    let i = 0;
    let j = 1;
    let pairY = 0;
    let pairX = 0;
    if (percent) {
      [pairY, pairX] = pick(r, [[40, 50], [40, 60], [20, 30], [50, 60], [20, 40], [30, 60], [60, 90], [80, 90]] as const);
      i = int(r, 0, 2);
      j = i + 1;
      vals[i] = pairY;
      vals[j] = pairX;
    } else {
      // a mean that comes out whole
      while (vals.reduce((x, y) => x + y, 0) % 40) vals = [0, 0, 0, 0].map(() => int(r, 2, 9) * 10);
    }
    const bars = vals.map((v, k) => `<rect x="${55 + k * 75}" y="${190 - v * 1.7}" width="46" height="${v * 1.7}" fill="currentColor" fill-opacity="0.18"/>` + text(78 + k * 75, 182 - v * 1.7, String(v)) + text(78 + k * 75, 210, months[k])).join('');
    const figure = svg(360, 220, 'Столбчатая диаграмма продаж по месяцам', `<path d="M40 190 H340 M40 190 V20"/>${bars}`);
    if (percent) {
      const p = ((pairX - pairY) / pairY) * 100;
      return { level: 3, prompt: T(`По диаграмме продаж (штук в месяц): на сколько процентов продажи в месяце «${months[j]}» больше, чем в «${months[i]}»?`, `From the sales chart (units a month): by what percent are ${months[j]} sales above ${months[i]}?`), answers: [num(p), num(pairX - pairY), num(((pairX - pairY) / pairX) * 100), num((pairX / pairY) * 100), num(p + 10)], why: T(`Рост ${pairX - pairY} считаем от старого значения ${pairY}: ${pairX - pairY}/${pairY}·100% = ${num(p)}%.`, `The rise of ${pairX - pairY} is taken from the old value ${pairY}: ${pairX - pairY}/${pairY}·100% = ${num(p)}%.`), figure };
    }
    const mean = vals.reduce((x, y) => x + y, 0) / 4;
    return { level: 2, prompt: T('По диаграмме продаж (штук в месяц): сколько в среднем продавали за месяц?', 'From the sales chart (units a month): what were the average monthly sales?'), answers: [num(mean), num(Math.max(...vals)), num(mean + 5), num(vals.reduce((x, y) => x + y, 0) / 3), num(mean - 10)], why: T(`(${vals.join(' + ')}) / 4 = ${num(mean)}.`), figure };
  },
  (r) => {
    const m = pick(r, [1, 2, -1]);
    const b = pick(r, [1, 2, 3]);
    const x2 = 2;
    const y2 = b + m * x2;
    const X = (x: number) => 50 + x * 40;
    const Y = (y: number) => 230 - y * 26;
    const grid = [0, 1, 2, 3, 4, 5].map((k) => `<path d="M${X(k)} ${Y(0)} V${Y(8)}" stroke-opacity="0.15"/>`).join('') + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<path d="M${X(0)} ${Y(k)} H${X(5)}" stroke-opacity="0.15"/>`).join('');
    // the line stops at the edge of the grid
    const xEnd = Math.min(5, m > 0 ? (8 - b) / m : b / -m);
    const figure = svg(300, 260, 'Прямая на координатной плоскости через две отмеченные точки',
      grid + `<path d="M${X(0)} ${Y(0)} H${X(5)} M${X(0)} ${Y(0)} V${Y(8)}"/>` + text(X(5) + 12, Y(0) + 6, 'x') + text(X(0) - 4, Y(8) - 6, 'y') + text(X(0) - 12, Y(0) + 18, '0') +
        `<path d="M${X(0)} ${Y(b)} L${X(xEnd)} ${Y(b + m * xEnd)}" stroke-width="3"/>${dot(X(0), Y(b))}${dot(X(x2), Y(y2))}` + text(X(0) + 10, Y(b) - 8, `(0; ${b})`, 'start') + text(X(x2) + 10, Y(y2) - 8, `(${x2}; ${y2})`, 'start'));
    return { level: 3, prompt: T('Какое уравнение задаёт прямую на рисунке?', 'Which equation describes the line in the figure?'), answers: [lin(m, b), lin(b, m), lin(-m, b), lin(m, -b), lin(m === 1 ? 2 : 1, b)], why: T(`Прямая пересекает ось y в точке ${b}, а при сдвиге на 2 вправо y меняется на ${y2 - b}: наклон ${num((y2 - b) / 2)}.`, `The line crosses the y-axis at ${b}, and moving 2 to the right changes y by ${y2 - b}: the slope is ${num((y2 - b) / 2)}.`), figure };
  },
  (r) => {
    const a = pick(r, [4, 6, 8, 10]);
    const a2 = a * a;
    const figure = svg(220, 220, 'Квадрат со вписанной окружностью, закрашены углы', `<path d="M20 20 H200 V200 H20 Z M110 20 A90 90 0 1 0 110 200 A90 90 0 1 0 110 20 Z" fill="currentColor" fill-opacity="0.18" fill-rule="evenodd"/>` + text(110, 214, String(a)));
    return { level: 4, prompt: T(`В квадрат со стороной ${a} вписан круг. Найдите площадь закрашенной части.`, `A circle is inscribed in a square of side ${a}. Find the shaded area.`), answers: [`${a2} − ${a2 / 4}π`, `${a2 / 4}π`, `${a2} − ${a2}π`, `${a2} − ${a / 2}π`, `${4 * a} − ${a2 / 4}π`], why: T(`Площадь квадрата ${a2}, радиус круга ${a / 2}, его площадь ${a2 / 4}π. Разность: ${a2} − ${a2 / 4}π.`, `The square is ${a2}, the circle has radius ${a / 2} and area ${a2 / 4}π. The difference is ${a2} − ${a2 / 4}π.`), figure };
  },
  (r) => {
    const c = pick(r, [60, 80, 100, 120, 140]);
    // A and B sit on the circle so that the drawn central angle really is c degrees
    const half = (c / 2) * (Math.PI / 180);
    const ax = Math.round(130 - 95 * Math.sin(half));
    const bx = Math.round(130 + 95 * Math.sin(half));
    const ay = Math.round(125 + 95 * Math.cos(half));
    const figure = svg(260, 240, 'Окружность с центральным углом AOB и вписанным углом ACB',
      `<circle cx="130" cy="125" r="95"/><path d="M${ax} ${ay} L130 125 L${bx} ${ay}"/><path d="M${ax} ${ay} L130 30 L${bx} ${ay}"/>${dot(130, 125)}` +
        text(130, 112, 'O') + text(ax - 12, ay + 16, 'A') + text(bx + 12, ay + 16, 'B') + text(130, 22, 'C') + text(130, 148, `${c}°`) + text(130, 62, 'x'));
    return { level: 3, prompt: T(`Центральный угол AOB равен ${c}°. Найдите вписанный угол ACB, опирающийся на ту же дугу (в градусах).`, `Central angle AOB is ${c}°. Find inscribed angle ACB on the same arc (in degrees).`), answers: [num(c / 2), num(c), num(180 - c), num(2 * c), num(90 - c / 2 + 10)], why: T(`Вписанный угол равен половине центрального, опирающегося на ту же дугу: ${c}°/2 = ${c / 2}°.`, `An inscribed angle is half the central angle on the same arc: ${c}°/2 = ${c / 2}°.`), figure };
  },
  (r) => {
    const w = pick(r, [8, 10, 12, 14]);
    const h = pick(r, [5, 6, 7, 9]);
    const apex = int(r, 70, 250);
    const figure = svg(320, 200, 'Прямоугольник, внутри закрашен треугольник с основанием на нижней стороне и вершиной на верхней',
      `<rect x="30" y="30" width="260" height="140"/><path d="M30 170 L${apex} 30 L290 170 Z" fill="currentColor" fill-opacity="0.18"/>` + text(160, 192, String(w)) + text(304, 106, String(h), 'start'));
    return { level: 3, prompt: T(`Прямоугольник имеет стороны ${w} и ${h}. Вершина закрашенного треугольника лежит на верхней стороне. Найдите площадь треугольника.`, `A rectangle is ${w} by ${h}. The shaded triangle's top vertex is on the upper side. Find its area.`), answers: [num((w * h) / 2), num(w * h), num((w * h) / 4), num(w + h), num((w * h) / 3)], why: T(`Основание ${w}, высота равна стороне ${h}, где бы ни была вершина: ${w}·${h}/2 = ${num((w * h) / 2)}.`, `The base is ${w} and the height is ${h} wherever the vertex is: ${w}·${h}/2 = ${num((w * h) / 2)}.`), figure };
  },
];
