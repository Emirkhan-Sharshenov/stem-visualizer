import type { ProblemGen } from './problems';

/*
 * Maths problems for grades 5–11 with fresh numbers every time.
 * Wrong options are the usual slips: sign errors, a forgotten factor, mixing up formulas.
 */

type T2 = { ru: string; en: string };
type Rand = () => number;
const t = (ru: string, en: string): T2 => ({ ru, en });
const int = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rand, arr: T[]) => arr[Math.floor(r() * arr.length)];
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
/** a reduced fraction as text: "3/4", "−1/2", "5" */
const fr = (a: number, b: number) => {
  if (b < 0) [a, b] = [-a, -b];
  const g = gcd(a, b) || 1;
  const p = a / g;
  const q = b / g;
  const s = q === 1 ? String(Math.abs(p)) : `${Math.abs(p)}/${q}`;
  return p < 0 ? `−${s}` : s;
};
const num = (x: number) => (x < 0 ? `−${Math.abs(x)}` : String(x));
/** "+ 3" or "− 3" for writing expressions */
const sg = (x: number) => (x < 0 ? `− ${Math.abs(x)}` : `+ ${x}`);
/** a polynomial in x without zero terms or unit coefficients: poly(3, -1, 2) → "3x² − x + 2" */
const poly = (...cs: number[]) => {
  const deg = cs.length - 1;
  const parts: string[] = [];
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const v = p === 0 ? '' : p === 1 ? 'x' : `x${['', '', '²', '³', '⁴', '⁵'][p]}`;
    const m = Math.abs(c) === 1 && v ? '' : String(Math.abs(c));
    parts.push(`${parts.length ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${m}${v}`);
  });
  return parts.join('') || '0';
};
const nz = (r: Rand, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = int(r, a, b);
  return v;
};
const U = { cm: t('см', 'cm'), cm2: t('см²', 'cm²'), cm3: t('см³', 'cm³'), deg: t('°', '°'), m: t('м', 'm'), m2: t('м²', 'm²') };

export const MATH_PROBLEMS: ProblemGen[] = [
  /* ===== grade 5 ===== */
  {
    id: 'm-order', subject: 'mathematics', grade: 5, topics: ['m5-operations', 'm5-natural'], title: t('Порядок действий', 'Order of operations'),
    make: (r) => {
      const a = int(r, 10, 60);
      const b = int(r, 2, 9);
      const c = int(r, 3, 12);
      return { prompt: t(`Вычисли: ${a} + ${b} · ${c}`, `Work out: ${a} + ${b} · ${c}`), answer: a + b * c, wrong: [(a + b) * c, a + b + c, a * b + c], solution: t(`Сначала умножение: ${b} · ${c} = ${b * c}, затем ${a} + ${b * c} = ${a + b * c}`, `Multiply first: ${b} · ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}`) };
    },
  },
  {
    id: 'm-power', subject: 'mathematics', grade: 5, topics: ['m5-powers-expr', 'm7-powers'], title: t('Степень числа', 'Powers'),
    make: (r) => {
      const a = int(r, 2, 9);
      const k = a > 5 ? 2 : int(r, 2, 4);
      return { prompt: t(`Вычисли ${a}${['', '', '²', '³', '⁴'][k]}`, `Work out ${a}${['', '', '²', '³', '⁴'][k]}`), answer: a ** k, wrong: [a * k, k ** a, a ** (k + 1)], solution: t(`${a}${['', '', '²', '³', '⁴'][k]} = ${Array(k).fill(a).join(' · ')} = ${a ** k}. Это не ${a} · ${k}!`, `${Array(k).fill(a).join(' · ')} = ${a ** k}, not ${a} · ${k}!`) };
    },
  },
  {
    id: 'm-simple-eq', subject: 'mathematics', grade: 5, topics: ['m5-equations'], title: t('Простое уравнение', 'Simple equation'),
    make: (r) => {
      const x = int(r, 3, 40);
      const a = int(r, 2, 9);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Реши уравнение: x + ${a * 3} = ${x + a * 3}`, `Solve: x + ${a * 3} = ${x + a * 3}`), answer: x, wrong: [x + 6 * a, x + a * 3, a * 3], solution: t(`x = ${x + a * 3} − ${a * 3} = ${x}`, `x = ${x + a * 3} − ${a * 3} = ${x}`) };
      if (kind === 1) return { prompt: t(`Реши уравнение: ${a}x = ${a * x}`, `Solve: ${a}x = ${a * x}`), answer: x, wrong: [a * a * x, a * x - a, a * x + a], solution: t(`x = ${a * x} : ${a} = ${x}`, `x = ${a * x} ÷ ${a} = ${x}`) };
      return { prompt: t(`Реши уравнение: x − ${a * 2} = ${x}`, `Solve: x − ${a * 2} = ${x}`), answer: x + a * 2, wrong: [x - a * 2, x, a * 2 * x], solution: t(`x = ${x} + ${a * 2} = ${x + a * 2}`, `x = ${x} + ${a * 2} = ${x + a * 2}`) };
    },
  },
  {
    id: 'm-frac-of', subject: 'mathematics', grade: 5, topics: ['m5-fractions', 'm6-fraction-mult'], title: t('Дробь от числа', 'Fraction of a number'),
    make: (r) => {
      const q = int(r, 3, 9);
      const p = int(r, 1, q - 1);
      const N = q * int(r, 2, 12);
      return { prompt: t(`Найди ${p}/${q} от ${N}.`, `Find ${p}/${q} of ${N}.`), answer: (N / q) * p, wrong: [(N / p) * q, N / q, N * p], solution: t(`${N} : ${q} · ${p} = ${N / q} · ${p} = ${(N / q) * p}`, `${N} ÷ ${q} · ${p} = ${(N / q) * p}`) };
    },
  },
  {
    id: 'm-frac-same', subject: 'mathematics', grade: 5, topics: ['m5-fraction-ops'], title: t('Дроби с одинаковым знаменателем', 'Like fractions'),
    make: (r) => {
      const d = int(r, 5, 15);
      const a = int(r, 1, d - 2);
      const b = int(r, 1, d - a);
      return { prompt: t(`Вычисли: ${a}/${d} + ${b}/${d}`, `Add: ${a}/${d} + ${b}/${d}`), answer: fr(a + b, d), wrong: [fr(a + b, 2 * d), fr(a * b, d), fr(Math.abs(a - b), d), fr(a + b + 1, d), fr(a + b - 1, d)], solution: t(`Знаменатель тот же, числители складываем: ${a + b}/${d}${gcd(a + b, d) > 1 ? ` = ${fr(a + b, d)}` : ''}`, `Same denominator, add the tops: ${fr(a + b, d)}`) };
    },
  },
  {
    id: 'm-decimal-mult', subject: 'mathematics', grade: 5, topics: ['m5-decimals'], title: t('Умножение десятичных дробей', 'Multiplying decimals'),
    make: (r) => {
      const a = int(r, 2, 9);
      const b = int(r, 2, 9);
      const c = int(r, 11, 49);
      const kind = int(r, 0, 1);
      if (kind === 0) return { prompt: t(`Вычисли: 0,${a} · 0,${b}`, `Work out: 0.${a} × 0.${b}`), answer: round(a * b / 100, 4), wrong: [round((a * b) / 10, 3), a * b, round((a * b) / 1000, 4)], digits: 4, solution: t(`${a} · ${b} = ${a * b}, после запятой 1 + 1 = 2 знака: ${String(round((a * b) / 100, 4)).replace('.', ',')}`, `${a} × ${b} = ${a * b}, two decimal places in total: ${round((a * b) / 100, 4)}`) };
      return { prompt: t(`Вычисли: ${String(c / 10).replace('.', ',')} · 100`, `Work out: ${c / 10} × 100`), answer: c * 10, wrong: [c, round(c / 1000, 3), c * 100], solution: t('Умножить на 100 — перенести запятую на 2 знака вправо.', 'Multiplying by 100 moves the point two places right.') };
    },
  },
  {
    id: 'm-percent', subject: 'mathematics', grade: 5, topics: ['m5-percent', 'm6-ratio'], title: t('Процент от числа', 'Percent of a number'),
    make: (r) => {
      const p = pick(r, [5, 10, 15, 20, 25, 30, 40, 60, 75]);
      const N = pick(r, [40, 60, 80, 120, 200, 240, 360, 500, 800]);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Найди ${p}% от ${N}.`, `Find ${p}% of ${N}.`), answer: (N * p) / 100, wrong: [N * p, N / p, N - (N * p) / 100], solution: t(`${p}% = ${p / 100}; ${N} · ${String(p / 100).replace('.', ',')} = ${(N * p) / 100}`, `${N} × ${p / 100} = ${(N * p) / 100}`) };
      if (kind === 1) return { prompt: t(`Товар стоил ${N} сом, цену подняли на ${p}%. Сколько он стоит теперь?`, `An item cost ${N}, the price rose by ${p}%. What is it now?`), answer: N + (N * p) / 100, wrong: [(N * p) / 100, N + p, N - (N * p) / 100], solution: t(`${N} · ${String(1 + p / 100).replace('.', ',')} = ${N + (N * p) / 100}`, `${N} × ${1 + p / 100} = ${N + (N * p) / 100}`) };
      return { prompt: t(`${(N * p) / 100} — это ${p}% от какого числа?`, `${(N * p) / 100} is ${p}% of what number?`), answer: N, wrong: [round((N * p * p) / 10000, 2), round((N * p) / 100 + p, 2), (N * p) / 10], solution: t(`${(N * p) / 100} : ${String(p / 100).replace('.', ',')} = ${N}`, `${(N * p) / 100} ÷ ${p / 100} = ${N}`) };
    },
  },
  {
    id: 'm-rect', subject: 'mathematics', grade: 5, topics: ['m5-areas', 'm5-lines-angles'], title: t('Прямоугольник', 'Rectangle'),
    make: (r) => {
      const a = int(r, 3, 25);
      const b = int(r, 2, 15);
      if (int(r, 0, 1)) return { prompt: t(`Стороны прямоугольника ${a} см и ${b} см. Найди площадь.`, `A rectangle is ${a} cm by ${b} cm. Find its area.`), answer: a * b, unit: U.cm2, wrong: [2 * (a + b), a + b, 2 * a * b], solution: t(`S = a · b = ${a} · ${b} = ${a * b} см²`, `A = ab = ${a * b} cm²`) };
      return { prompt: t(`Стороны прямоугольника ${a} см и ${b} см. Найди периметр.`, `A rectangle is ${a} cm by ${b} cm. Find its perimeter.`), answer: 2 * (a + b), unit: U.cm, wrong: [a * b, a + b, 2 * a + b], solution: t(`P = 2(a + b) = 2 · ${a + b} = ${2 * (a + b)} см`, `P = 2(a + b) = ${2 * (a + b)} cm`) };
    },
  },
  {
    id: 'm-cuboid', subject: 'mathematics', grade: 5, topics: ['m5-volume'], title: t('Объём параллелепипеда', 'Volume of a cuboid'),
    make: (r) => {
      const a = int(r, 2, 12);
      const b = int(r, 2, 10);
      const c = int(r, 2, 8);
      return { prompt: t(`Найди объём коробки ${a} × ${b} × ${c} см.`, `Find the volume of a ${a} × ${b} × ${c} cm box.`), answer: a * b * c, unit: U.cm3, wrong: [2 * (a * b + b * c + a * c), a + b + c, a * b + c], solution: t(`V = abc = ${a} · ${b} · ${c} = ${a * b * c} см³`, `V = abc = ${a * b * c} cm³`) };
    },
  },
  /* ===== grade 6 ===== */
  {
    id: 'm-gcd-lcm', subject: 'mathematics', grade: 6, topics: ['m6-gcd-lcm'], title: t('НОД и НОК', 'GCD and LCM'),
    make: (r) => {
      const g = int(r, 2, 9);
      let x = int(r, 2, 7);
      let y = int(r, 2, 9);
      while (gcd(x, y) > 1 || x === y) y = int(r, 2, 9);
      if (x > y) [x, y] = [y, x];
      const a = g * x;
      const b = g * y;
      if (int(r, 0, 1)) return { prompt: t(`Найди НОД(${a}; ${b}).`, `Find GCD(${a}, ${b}).`), answer: g, wrong: [lcm(a, b), a * b, x], solution: t(`${a} = ${g} · ${x}, ${b} = ${g} · ${y}; наибольший общий делитель — ${g}`, `${a} = ${g}·${x}, ${b} = ${g}·${y}, so GCD = ${g}`) };
      return { prompt: t(`Найди НОК(${a}; ${b}).`, `Find LCM(${a}, ${b}).`), answer: lcm(a, b), wrong: [a * b, g, a + b], solution: t(`НОК = ${a} · ${b} : НОД = ${a * b} : ${g} = ${lcm(a, b)}`, `LCM = ${a}·${b} ÷ GCD = ${lcm(a, b)}`) };
    },
  },
  {
    id: 'm-divisible', subject: 'mathematics', grade: 6, topics: ['m6-divisibility'], title: t('Признаки делимости', 'Divisibility rules'),
    make: (r) => {
      const d = pick(r, [3, 9, 5, 4]);
      const make = (ok: boolean) => {
        for (;;) {
          const x = int(r, 100, 9999);
          if ((x % d === 0) === ok) return x;
        }
      };
      const ans = make(true);
      const rule: Record<number, T2> = { 3: t('сумма цифр делится на 3', 'its digit sum divides by 3'), 9: t('сумма цифр делится на 9', 'its digit sum divides by 9'), 5: t('оканчивается на 0 или 5', 'it ends in 0 or 5'), 4: t('число из двух последних цифр делится на 4', 'its last two digits divide by 4') };
      const ws = new Set<number>();
      while (ws.size < 3) ws.add(make(false));
      return { prompt: t(`Какое число делится на ${d}?`, `Which number divides by ${d}?`), answer: String(ans), wrong: [...ws].map(String), solution: t(`${ans}: ${rule[d].ru}.`, `${ans}: ${rule[d].en}.`) };
    },
  },
  {
    id: 'm-frac-reduce', subject: 'mathematics', grade: 6, topics: ['m6-fraction-property'], title: t('Сокращение дробей', 'Simplifying fractions'),
    make: (r) => {
      let a = int(r, 1, 8);
      let b = int(r, 2, 11);
      while (gcd(a, b) > 1 || a >= b) {
        a = int(r, 1, 8);
        b = int(r, 2, 11);
      }
      const k = int(r, 2, 9);
      return { prompt: t(`Сократи дробь ${a * k}/${b * k}.`, `Simplify ${a * k}/${b * k}.`), answer: `${a}/${b}`, wrong: [`${a * k - k + 1}/${b * k - k + 1}`, `${b}/${a}`, `${a * k}/${b}`], solution: t(`Делим числитель и знаменатель на ${k}: ${a}/${b}`, `Divide top and bottom by ${k}: ${a}/${b}`) };
    },
  },
  {
    id: 'm-frac-add', subject: 'mathematics', grade: 6, topics: ['m6-fraction-add'], title: t('Сложение дробей', 'Adding fractions'),
    make: (r) => {
      const b = int(r, 2, 9);
      let d = int(r, 2, 9);
      while (d === b) d = int(r, 2, 9);
      const a = int(r, 1, b - 1);
      const c = int(r, 1, d - 1);
      const minus = int(r, 0, 1) === 1;
      const top = minus ? a * d - c * b : a * d + c * b;
      return { prompt: t(`Вычисли: ${a}/${b} ${minus ? '−' : '+'} ${c}/${d}`, `Work out: ${a}/${b} ${minus ? '−' : '+'} ${c}/${d}`), answer: fr(top, b * d), wrong: [fr(minus ? a - c : a + c, b + d), fr(minus ? a - c : a + c, b * d), fr(minus ? -top : top + 1, b * d), fr(top, b + d), fr(a * c, b * d), fr(top + 2, b * d)], solution: t(`Общий знаменатель ${b * d}: ${a * d}/${b * d} ${minus ? '−' : '+'} ${c * b}/${b * d} = ${fr(top, b * d)}`, `Common denominator ${b * d}: ${fr(top, b * d)}`) };
    },
  },
  {
    id: 'm-frac-mult', subject: 'mathematics', grade: 6, topics: ['m6-fraction-mult'], title: t('Умножение и деление дробей', 'Multiplying and dividing fractions'),
    make: (r) => {
      const b = int(r, 2, 9);
      const a = int(r, 1, b - 1);
      const d = int(r, 2, 9);
      const c = int(r, 1, d - 1);
      if (int(r, 0, 1)) return { prompt: t(`Вычисли: ${a}/${b} · ${c}/${d}`, `Work out: ${a}/${b} × ${c}/${d}`), answer: fr(a * c, b * d), wrong: [fr(a * d, b * c), fr(a + c, b + d), fr(a * c, b + d), fr(a * c + 1, b * d), fr(b * d, a * c)], solution: t(`Числитель на числитель, знаменатель на знаменатель: ${a * c}/${b * d} = ${fr(a * c, b * d)}`, `Tops times tops, bottoms times bottoms: ${fr(a * c, b * d)}`) };
      return { prompt: t(`Вычисли: ${a}/${b} : ${c}/${d}`, `Work out: ${a}/${b} ÷ ${c}/${d}`), answer: fr(a * d, b * c), wrong: [fr(a * c, b * d), fr(b * c, a * d), fr(a * d + 1, b * c), fr(a + d, b + c), fr(a * d, b * c + 1)], solution: t(`Делить — значит умножить на перевёрнутую дробь: ${a}/${b} · ${d}/${c} = ${fr(a * d, b * c)}`, `Divide = multiply by the flipped fraction: ${fr(a * d, b * c)}`) };
    },
  },
  {
    id: 'm-proportion', subject: 'mathematics', grade: 6, topics: ['m6-proportional', 'm6-ratio'], title: t('Пропорция', 'Proportion'),
    make: (r) => {
      const c = int(r, 2, 9);
      const x = int(r, 2, 15);
      const b = c * int(r, 2, 5);
      const a = (x * c) / b;
      if (!Number.isInteger(a)) {
        const N = int(r, 2, 6);
        const p = int(r, 30, 90);
        const k = int(r, 2, 4);
        return { prompt: t(`${N} тетрадей стоят ${N * p} сом. Сколько стоят ${N * k} таких тетрадей?`, `${N} notebooks cost ${N * p}. How much do ${N * k} cost?`), answer: N * p * k, wrong: [N * p + k, p * k, (N * p) / k], solution: t(`Прямая пропорциональность: в ${k} раза больше тетрадей — в ${k} раза дороже: ${N * p * k}`, `Direct proportion: ${k}× the notebooks, ${k}× the price: ${N * p * k}`) };
      }
      return { prompt: t(`Найди x из пропорции x : ${a} = ${b} : ${c}`, `Solve the proportion x : ${a} = ${b} : ${c}`), answer: x, wrong: [round((a * c) / b, 2), round((b * c) / a, 2), a + b - c], solution: t(`Произведение крайних = произведению средних: x · ${c} = ${a} · ${b}, x = ${x}`, `Cross-multiply: x · ${c} = ${a} · ${b}, x = ${x}`) };
    },
  },
  {
    id: 'm-signed', subject: 'mathematics', grade: 6, topics: ['m6-signed-ops', 'm6-integers'], title: t('Действия с отрицательными', 'Negative numbers'),
    make: (r) => {
      const a = int(r, 2, 15);
      const b = int(r, 2, 9);
      const c = int(r, 3, 30);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Вычисли: −${a} · ${b} + ${c}`, `Work out: −${a} · ${b} + ${c}`), answer: -a * b + c, wrong: [a * b + c, -a * b - c, -(a * b + c) + 2 * c + 1], solution: t(`−${a} · ${b} = −${a * b}; −${a * b} + ${c} = ${num(-a * b + c)}`, `−${a * b} + ${c} = ${num(-a * b + c)}`) };
      if (kind === 1) return { prompt: t(`Вычисли: (−${a}) · (−${b})`, `Work out: (−${a}) · (−${b})`), answer: a * b, wrong: [-a * b, -(a + b), a + b], solution: t('Минус на минус даёт плюс: ' + a * b, 'Minus times minus is plus: ' + a * b) };
      return { prompt: t(`Вычисли: −${a} − ${c}`, `Work out: −${a} − ${c}`), answer: -a - c, wrong: [c - a, a + c, a - c === -a - c ? a - c + 1 : a - c], solution: t(`Двигаемся влево от −${a} ещё на ${c}: ${num(-a - c)}`, `Move ${c} further left from −${a}: ${num(-a - c)}`) };
    },
  },
  {
    id: 'm-lin-eq', subject: 'mathematics', grade: 6, topics: ['m6-linear-equations', 'm7-linear-equation'], title: t('Линейное уравнение', 'Linear equation'),
    make: (r) => {
      const x = nz(r, -9, 9);
      const a = int(r, 3, 9);
      let c = int(r, 1, 7);
      if (c === a) c = a - 1;
      const b = int(r, -15, 15);
      const d = a * x + b - c * x;
      return { prompt: t(`Реши: ${poly(a, b)} = ${poly(c, d)}`, `Solve: ${poly(a, b)} = ${poly(c, d)}`), answer: x, wrong: [round((d + b) / (a - c), 2), round((d - b) / (a + c), 2), -x], solution: t(`Переносим: ${poly(a, 0)} − ${poly(c, 0)} = ${num(d)} ${sg(-b)} → ${poly(a - c, 0)} = ${num(d - b)} → x = ${num(x)}`, `Collect terms: ${poly(a - c, 0)} = ${num(d - b)}, x = ${num(x)}`) };
    },
  },
  {
    id: 'm-circle', subject: 'mathematics', grade: 6, topics: ['m6-circle'], title: t('Длина окружности и площадь круга', 'Circumference and area'),
    make: (r) => {
      const R = int(r, 2, 20);
      if (int(r, 0, 1)) return { prompt: t(`Радиус круга ${R} см. Найди длину окружности (π ≈ 3,14).`, `The radius is ${R} cm. Find the circumference (π ≈ 3.14).`), answer: round(2 * 3.14 * R, 2), unit: U.cm, wrong: [round(3.14 * R * R, 2), round(3.14 * R, 2), round(2 * 3.14 * R * R, 2)], solution: t(`C = 2πr = 2 · 3,14 · ${R} = ${String(round(6.28 * R, 2)).replace('.', ',')} см`, `C = 2πr = ${round(6.28 * R, 2)} cm`) };
      return { prompt: t(`Радиус круга ${R} см. Найди площадь круга (π ≈ 3,14).`, `The radius is ${R} cm. Find the area (π ≈ 3.14).`), answer: round(3.14 * R * R, 2), unit: U.cm2, wrong: [round(2 * 3.14 * R, 2), round(3.14 * 2 * R * 2 * R, 2), round(3.14 * R, 2)], solution: t(`S = πr² = 3,14 · ${R * R} = ${String(round(3.14 * R * R, 2)).replace('.', ',')} см²`, `A = πr² = ${round(3.14 * R * R, 2)} cm²`) };
    },
  },
  /* ===== grade 7 ===== */
  {
    id: 'm-expr-value', subject: 'mathematics', grade: 7, topics: ['m7-expressions'], title: t('Значение выражения', 'Evaluating an expression'),
    make: (r) => {
      const a = nz(r, -6, 8);
      const b = nz(r, -6, 8);
      const p = int(r, 2, 6);
      const q = int(r, 2, 5);
      const v = p * a - q * b;
      return { prompt: t(`Найди значение ${p}a − ${q}b при a = ${num(a)}, b = ${num(b)}.`, `Evaluate ${p}a − ${q}b for a = ${num(a)}, b = ${num(b)}.`), answer: v, wrong: [p * a + q * b, p * b - q * a, v === -v ? v + 1 : -v], solution: t(`${p} · (${num(a)}) − ${q} · (${num(b)}) = ${num(p * a)} ${sg(-q * b)} = ${num(v)}`, `${num(p * a)} ${sg(-q * b)} = ${num(v)}`) };
    },
  },
  {
    id: 'm-lin-func', subject: 'mathematics', grade: 7, topics: ['m7-linear-function', 'm9-function'], title: t('Линейная функция', 'Linear function'),
    make: (r) => {
      const k = nz(r, -5, 5);
      const b = int(r, -10, 10);
      if (int(r, 0, 1)) {
        const x = nz(r, -6, 6);
        return { prompt: t(`Функция y = ${poly(k, b)}. Найди y при x = ${num(x)}.`, `y = ${poly(k, b)}. Find y at x = ${num(x)}.`), answer: k * x + b, wrong: [k * x - b, k + x + b, -k * x + b === k * x + b ? k * x + b + 2 : -k * x + b], solution: t(`y = ${k} · (${num(x)}) ${sg(b)} = ${num(k * x + b)}`, `y = ${num(k * x + b)}`) };
      }
      const x0 = nz(r, -6, 6);
      const bb = -k * x0;
      return { prompt: t(`При каком x функция y = ${poly(k, bb)} обращается в ноль?`, `Where is y = ${poly(k, bb)} equal to zero?`), answer: x0, wrong: [-x0, bb, round(k / (bb || 1), 2) === x0 ? x0 + 1 : round(k / (bb || 1), 2)], solution: t(`${poly(k, bb)} = 0 → x = ${num(-bb)} : ${num(k)} = ${num(x0)}`, `x = −b/k = ${num(x0)}`) };
    },
  },
  {
    id: 'm-power-rules', subject: 'mathematics', grade: 7, topics: ['m7-powers', 'm8-integer-powers'], title: t('Свойства степеней', 'Laws of exponents'),
    make: (r) => {
      const a = pick(r, [2, 3, 5, 7, 'a']);
      const m = int(r, 2, 9);
      const nn = int(r, 2, 9);
      const k = int(r, 1, m + nn - 1);
      const kind = int(r, 0, 1);
      if (kind === 0) return { prompt: t(`Упрости: ${a}^${m} · ${a}^${nn} : ${a}^${k}. Чему равен показатель?`, `Simplify ${a}^${m} · ${a}^${nn} ÷ ${a}^${k}. What is the exponent?`), answer: m + nn - k, wrong: [m * nn - k, m + nn + k, round((m * nn) / k, 2)], solution: t(`При умножении показатели складываются, при делении вычитаются: ${m} + ${nn} − ${k} = ${m + nn - k}`, `Add when multiplying, subtract when dividing: ${m + nn - k}`) };
      return { prompt: t(`Упрости: (${a}^${m})^${nn}. Чему равен показатель?`, `Simplify (${a}^${m})^${nn}. What is the exponent?`), answer: m * nn, wrong: [m + nn, m ** nn, nn ** m], solution: t(`При возведении степени в степень показатели перемножаются: ${m} · ${nn} = ${m * nn}`, `Power of a power: multiply, ${m * nn}`) };
    },
  },
  {
    id: 'm-short-mult', subject: 'mathematics', grade: 7, topics: ['m7-short-mult'], title: t('Формулы сокращённого умножения', 'Special products'),
    make: (r) => {
      const base = pick(r, [20, 30, 40, 50, 60, 70, 80, 90, 100]);
      const d = int(r, 1, 4);
      if (int(r, 0, 1)) return { prompt: t(`Вычисли устно: ${base - d} · ${base + d}`, `Work out mentally: ${base - d} × ${base + d}`), answer: base * base - d * d, wrong: [base * base, base * base + d * d, base * base - 2 * d], solution: t(`(a − b)(a + b) = a² − b²: ${base}² − ${d}² = ${base * base} − ${d * d} = ${base * base - d * d}`, `(a − b)(a + b) = a² − b² = ${base * base - d * d}`) };
      return { prompt: t(`Вычисли устно: ${base + d}²`, `Work out mentally: ${base + d}²`), answer: (base + d) ** 2, wrong: [base * base + d * d, base * base + base * d + d * d, (base + d) * 2], solution: t(`(a + b)² = a² + 2ab + b² = ${base * base} + ${2 * base * d} + ${d * d} = ${(base + d) ** 2}`, `(a + b)² = a² + 2ab + b² = ${(base + d) ** 2}`) };
    },
  },
  {
    id: 'm-poly-mult', subject: 'mathematics', grade: 7, topics: ['m7-polynomials'], title: t('Умножение многочленов', 'Multiplying polynomials'),
    make: (r) => {
      const a = nz(r, -7, 7);
      let b = nz(r, -7, 7);
      if (a + b === 0) b = b + 1 || 2;
      const show = (s: number, p: number) => poly(1, s, p);
      return { prompt: t(`Раскрой скобки: (x ${sg(a)})(x ${sg(b)})`, `Expand: (x ${sg(a)})(x ${sg(b)})`), answer: show(a + b, a * b), wrong: [show(a * b, a + b), poly(1, 0, a * b), show(a + b, -a * b), show(-(a + b), a * b), show(a + b, a + b)], solution: t(`x · x + x · (${num(b)}) + (${num(a)}) · x + (${num(a)})(${num(b)}) = ${show(a + b, a * b)}`, `= ${show(a + b, a * b)}`) };
    },
  },
  {
    id: 'm-system', subject: 'mathematics', grade: 7, topics: ['m7-systems'], title: t('Система уравнений', 'System of equations'),
    make: (r) => {
      const x = int(r, -6, 9);
      let y = int(r, -6, 9);
      if (y === x) y++;
      const k = int(r, 2, 4);
      const ans = (p: number, q: number) => `x = ${num(p)}, y = ${num(q)}`;
      return { prompt: t(`Реши систему: x + y = ${num(x + y)}, ${k}x − y = ${num(k * x - y)}`, `Solve: x + y = ${num(x + y)}, ${k}x − y = ${num(k * x - y)}`), answer: ans(x, y), wrong: [ans(y, x), ans(-x, x + 2 * y), ans(x + 1, y - 1), ans(-x, -y), ans(x - 1, y + 1)], solution: t(`Складываем уравнения: ${k + 1}x = ${num((k + 1) * x)}, x = ${num(x)}; y = ${num(x + y)} − ${num(x)} = ${num(y)}`, `Add the equations: x = ${num(x)}, then y = ${num(y)}`) };
    },
  },
  {
    id: 'm-angles', subject: 'mathematics', grade: 7, topics: ['m7-geo-angles', 'm7-parallel', 'm5-lines-angles'], title: t('Смежные и вертикальные углы', 'Adjacent and vertical angles'),
    make: (r) => {
      const a = int(r, 20, 160);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Один из смежных углов равен ${a}°. Найди другой.`, `One of two adjacent angles is ${a}°. Find the other.`), answer: 180 - a, unit: U.deg, wrong: [360 - a, Math.abs(90 - a), a], solution: t(`Смежные углы вместе дают 180°: 180 − ${a} = ${180 - a}°`, `Adjacent angles add up to 180°: ${180 - a}°`) };
      if (kind === 1) return { prompt: t(`Параллельные прямые пересечены секущей. Один из односторонних углов ${a}°. Найди второй.`, `Two parallel lines are cut by a transversal. One co-interior angle is ${a}°. Find the other.`), answer: 180 - a, unit: U.deg, wrong: [a, 360 - a, Math.abs(90 - a) === 180 - a ? 90 + a : Math.abs(90 - a)], solution: t('Односторонние углы при параллельных прямых в сумме дают 180°: ' + (180 - a) + '°', `Co-interior angles add up to 180°: ${180 - a}°`) };
      return { prompt: t(`Сумма двух вертикальных углов ${2 * a > 300 ? 2 * (a - 80) : 2 * a}°. Найди каждый из них.`, `Two vertical angles add up to ${2 * a > 300 ? 2 * (a - 80) : 2 * a}°. Find each.`), answer: 2 * a > 300 ? a - 80 : a, unit: U.deg, wrong: [180 - (2 * a > 300 ? a - 80 : a), 2 * a > 300 ? 2 * (a - 80) : 2 * a, 360 - (2 * a > 300 ? 2 * (a - 80) : 2 * a)], solution: t('Вертикальные углы равны — делим сумму пополам.', 'Vertical angles are equal: halve the sum.') };
    },
  },
  {
    id: 'm-triangle-angles', subject: 'mathematics', grade: 7, topics: ['m7-angle-sum', 'm7-isosceles', 'm7-triangle-equality'], title: t('Углы треугольника', 'Angles of a triangle'),
    make: (r) => {
      if (int(r, 0, 1)) {
        const a = int(r, 20, 90);
        const b = int(r, 20, 160 - a);
        return { prompt: t(`Два угла треугольника ${a}° и ${b}°. Найди третий.`, `Two angles of a triangle are ${a}° and ${b}°. Find the third.`), answer: 180 - a - b, unit: U.deg, wrong: [360 - a - b, a + b, Math.abs(90 - a - b) === 180 - a - b ? 100 - a - b + 90 : Math.abs(90 - a - b)], solution: t(`Сумма углов 180°: 180 − ${a} − ${b} = ${180 - a - b}°`, `The angles add to 180°: ${180 - a - b}°`) };
      }
      const v = 2 * int(r, 10, 80);
      return { prompt: t(`Угол при вершине равнобедренного треугольника ${v}°. Найди угол при основании.`, `The apex angle of an isosceles triangle is ${v}°. Find a base angle.`), answer: (180 - v) / 2, unit: U.deg, wrong: [180 - v, v / 2, (360 - v) / 2], solution: t(`Углы при основании равны: (180 − ${v}) : 2 = ${(180 - v) / 2}°`, `Base angles are equal: (180 − ${v}) ÷ 2 = ${(180 - v) / 2}°`) };
    },
  },
  {
    id: 'm-right-30', subject: 'mathematics', grade: 7, topics: ['m7-right-triangle'], title: t('Катет против 30°', 'Leg opposite 30°'),
    make: (r) => {
      const c = 2 * int(r, 2, 25);
      if (int(r, 0, 1)) return { prompt: t(`В прямоугольном треугольнике гипотенуза ${c} см, один угол 30°. Найди катет против этого угла.`, `A right triangle has hypotenuse ${c} cm and a 30° angle. Find the leg opposite it.`), answer: c / 2, unit: U.cm, wrong: [c * 2, round((c * Math.sqrt(3)) / 2, 2), c / 3], solution: t('Катет против 30° равен половине гипотенузы: ' + c / 2 + ' см', `The leg opposite 30° is half the hypotenuse: ${c / 2} cm`) };
      const a = int(r, 15, 70);
      return { prompt: t(`Один острый угол прямоугольного треугольника ${a}°. Найди другой.`, `One acute angle of a right triangle is ${a}°. Find the other.`), answer: 90 - a, unit: U.deg, wrong: [180 - a, 90 + a, 180 - 90 - a + 10], solution: t(`Острые углы в сумме 90°: 90 − ${a} = ${90 - a}°`, `The acute angles add to 90°: ${90 - a}°`) };
    },
  },
  /* ===== grade 8 ===== */
  {
    id: 'm-sqrt', subject: 'mathematics', grade: 8, topics: ['m8-sqrt'], title: t('Квадратные корни', 'Square roots'),
    make: (r) => {
      const kind = int(r, 0, 2);
      if (kind === 0) {
        const a = int(r, 4, 30);
        return { prompt: t(`Вычисли √${a * a}`, `Work out √${a * a}`), answer: a, wrong: [(a * a) / 2, a * 2, a + 1], solution: t(`${a}² = ${a * a}, значит √${a * a} = ${a}`, `${a}² = ${a * a}, so √${a * a} = ${a}`) };
      }
      if (kind === 1) {
        const p = int(r, 2, 6);
        const q = pick(r, [2, 3, 5, 7]);
        return { prompt: t(`Вычисли √${q * p * p} · √${q}`, `Work out √${q * p * p} · √${q}`), answer: p * q, wrong: [q * p * p * q, p, p * q * q], solution: t(`√${q * p * p} · √${q} = √${q * q * p * p} = ${p * q}`, `= √${q * q * p * p} = ${p * q}`) };
      }
      const a = int(r, 2, 9);
      const b = int(r, 2, 9);
      return { prompt: t(`Вычисли √(${a * a} · ${b * b})`, `Work out √(${a * a} · ${b * b})`), answer: a * b, wrong: [a + b, a * a * b, a * b * 2], solution: t(`Корень из произведения = произведение корней: ${a} · ${b} = ${a * b}`, `√ of a product = product of √: ${a * b}`) };
    },
  },
  {
    id: 'm-quad-roots', subject: 'mathematics', grade: 8, topics: ['m8-quadratic', 'm8-vieta'], title: t('Корни квадратного уравнения', 'Roots of a quadratic'),
    make: (r) => {
      const p = nz(r, -9, 9);
      let q = nz(r, -9, 9);
      if (q === p) q = -q === p ? q + 1 : -q;
      const S = p + q;
      const P = p * q;
      const ans = (x: number, y: number) => `${num(Math.min(x, y))}; ${num(Math.max(x, y))}`;
      return { prompt: t(`Реши уравнение ${poly(1, -S, P)} = 0`, `Solve ${poly(1, -S, P)} = 0`), answer: ans(p, q), wrong: [ans(-p, -q), ans(p, -q), ans(S, P), ans(-p, q), ans(2 * p, 2 * q), ans(p + 1, q + 1)], solution: t(`D = ${S * S} − ${4 * P} = ${S * S - 4 * P}, √D = ${Math.abs(p - q)}; x = (${num(S)} ± ${Math.abs(p - q)}) / 2 → ${ans(p, q)}. Проверка по Виету: сумма ${num(S)}, произведение ${num(P)}.`, `D = ${S * S - 4 * P}; roots ${ans(p, q)}. Vieta: sum ${num(S)}, product ${num(P)}.`) };
    },
  },
  {
    id: 'm-discriminant', subject: 'mathematics', grade: 8, topics: ['m8-quadratic', 'm9-quadratic-function'], title: t('Дискриминант', 'Discriminant'),
    make: (r) => {
      const a = nz(r, -4, 5);
      const b = int(r, -9, 9);
      const c = nz(r, -9, 9);
      const D = b * b - 4 * a * c;
      return { prompt: t(`Найди дискриминант уравнения ${poly(a, b, c)} = 0.`, `Find the discriminant of ${poly(a, b, c)} = 0.`), answer: D, wrong: [b * b + 4 * a * c, b - 4 * a * c, b * b - 2 * a * c], solution: t(`D = b² − 4ac = ${b * b} ${sg(-4 * a * c)} = ${num(D)}. ${D > 0 ? 'D > 0 — два корня' : D === 0 ? 'D = 0 — один корень' : 'D < 0 — действительных корней нет'}.`, `D = b² − 4ac = ${num(D)}: ${D > 0 ? 'two roots' : D === 0 ? 'one root' : 'no real roots'}.`) };
    },
  },
  {
    id: 'm-vieta', subject: 'mathematics', grade: 8, topics: ['m8-vieta'], title: t('Теорема Виета', 'Vieta’s formulas'),
    make: (r) => {
      const a = pick(r, [1, 1, 2, 3]);
      const b = nz(r, -12, 12) * a;
      const c = nz(r, -12, 12) * a;
      const sum = int(r, 0, 1) === 1;
      return { prompt: t(`Не решая уравнение ${poly(a, b, c)} = 0, найди ${sum ? 'сумму' : 'произведение'} его корней.`, `Without solving ${poly(a, b, c)} = 0, find the ${sum ? 'sum' : 'product'} of its roots.`), answer: sum ? -b / a : c / a, wrong: sum ? [b / a, c / a, -c / a === -b / a ? b / a + 1 : -c / a] : [-c / a, -b / a, b / a === c / a ? c / a + 1 : b / a], solution: t(sum ? `x₁ + x₂ = −b/a = ${num(-b / a)}` : `x₁ · x₂ = c/a = ${num(c / a)}`, sum ? `x₁ + x₂ = −b/a = ${num(-b / a)}` : `x₁ · x₂ = c/a = ${num(c / a)}`) };
    },
  },
  {
    id: 'm-lin-ineq', subject: 'mathematics', grade: 8, topics: ['m8-inequalities'], title: t('Линейное неравенство', 'Linear inequality'),
    make: (r) => {
      const a = nz(r, -6, 6);
      const x0 = int(r, -8, 8);
      const b = int(r, -12, 12);
      const c = a * x0 + b;
      const flip = a < 0;
      return { prompt: t(`Реши неравенство: ${poly(a, b)} > ${num(c)}`, `Solve: ${poly(a, b)} > ${num(c)}`), answer: `x ${flip ? '<' : '>'} ${num(x0)}`, wrong: [`x ${flip ? '>' : '<'} ${num(x0)}`, `x ${flip ? '<' : '>'} ${num(-x0 === x0 ? x0 + 1 : -x0)}`, `x ${flip ? '>' : '<'} ${num(-x0 === x0 ? x0 - 1 : -x0)}`], solution: t(`${poly(a, 0)} > ${num(c - b)}; делим на ${num(a)}${flip ? ' — число отрицательное, знак меняется' : ''}: x ${flip ? '<' : '>'} ${num(x0)}`, `${a}x > ${num(c - b)}; divide by ${num(a)}${flip ? ' (negative, so flip the sign)' : ''}: x ${flip ? '<' : '>'} ${num(x0)}`) };
    },
  },
  {
    id: 'm-neg-power', subject: 'mathematics', grade: 8, topics: ['m8-integer-powers'], title: t('Отрицательная степень', 'Negative exponents'),
    make: (r) => {
      const a = int(r, 2, 6);
      const k = a > 4 ? 2 : int(r, 1, 3);
      return { prompt: t(`Вычисли ${a}^(−${k})`, `Work out ${a}^(−${k})`), answer: `1/${a ** k}`, wrong: [`−${a ** k}`, `−${a * k}`, `1/${a * k}`, String(a ** k), `−1/${a ** k}`, `1/${a ** (k + 1)}`], solution: t(`a^(−n) = 1/aⁿ: 1/${a}^${k} = 1/${a ** k}. Минус в показателе — это не отрицательное число!`, `a^(−n) = 1/aⁿ = 1/${a ** k}. A negative exponent does not make the number negative!`) };
    },
  },
  {
    id: 'm-stats', subject: 'mathematics', grade: 8, topics: ['m8-statistics'], title: t('Среднее, медиана, мода', 'Mean, median, mode'),
    make: (r) => {
      const k = pick(r, [5, 7]);
      const xs = Array.from({ length: k }, () => int(r, 1, 20));
      xs[int(r, 0, k - 1)] = xs[0];
      const s = xs.reduce((a, b) => a + b, 0);
      const extra = (k - (s % k)) % k;
      xs[1] += extra;
      const sum = s + extra;
      const sorted = [...xs].sort((a, b) => a - b);
      const kind = int(r, 0, 1);
      if (kind === 0) return { prompt: t(`Найди среднее арифметическое: ${xs.join(', ')}`, `Find the mean of ${xs.join(', ')}`), answer: sum / k, wrong: [sorted[(k - 1) / 2] === sum / k ? sum / k + 1 : sorted[(k - 1) / 2], sum, round(sum / (k - 1), 2)], solution: t(`(${xs.join(' + ')}) : ${k} = ${sum} : ${k} = ${sum / k}`, `${sum} ÷ ${k} = ${sum / k}`) };
      const med = sorted[(k - 1) / 2];
      return { prompt: t(`Найди медиану ряда: ${xs.join(', ')}`, `Find the median of ${xs.join(', ')}`), answer: med, wrong: [xs[(k - 1) / 2] === med ? med + 1 : xs[(k - 1) / 2], round(sum / k, 2) === med ? med + 2 : round(sum / k, 2), sorted[k - 1] - sorted[0] === med ? med + 3 : sorted[k - 1] - sorted[0]], solution: t(`Упорядочим: ${sorted.join(', ')}. В середине стоит ${med}.`, `Sort: ${sorted.join(', ')}. The middle value is ${med}.`) };
    },
  },
  {
    id: 'm-pythagoras', subject: 'mathematics', grade: 8, topics: ['m8-pythagoras', 'm7-right-triangle'], title: t('Теорема Пифагора', 'Pythagoras’ theorem'),
    make: (r) => {
      const [a0, b0, c0] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]);
      const k = a0 > 6 ? 1 : int(r, 1, 3);
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      if (int(r, 0, 1)) return { prompt: t(`Катеты прямоугольного треугольника ${a} и ${b} см. Найди гипотенузу.`, `The legs are ${a} and ${b} cm. Find the hypotenuse.`), answer: c, unit: U.cm, wrong: [a + b, round(Math.sqrt(b * b - a * a), 2), (a * b) / 2], solution: t(`c = √(${a}² + ${b}²) = √${c * c} = ${c} см`, `c = √(${a * a} + ${b * b}) = ${c} cm`) };
      return { prompt: t(`Гипотенуза ${c} см, один катет ${a} см. Найди другой катет.`, `The hypotenuse is ${c} cm, one leg is ${a} cm. Find the other leg.`), answer: b, unit: U.cm, wrong: [round(Math.sqrt(c * c + a * a), 2), c - a, round((c + a) / 2, 1) === b ? b + 1 : round((c + a) / 2, 1)], solution: t(`b = √(${c}² − ${a}²) = √${b * b} = ${b} см`, `b = √(${c * c} − ${a * a}) = ${b} cm`) };
    },
  },
  {
    id: 'm-areas', subject: 'mathematics', grade: 8, topics: ['m8-areas', 'm8-trapezoid', 'm8-quadrilaterals'], title: t('Площади фигур', 'Areas of shapes'),
    make: (r) => {
      const kind = int(r, 0, 3);
      const a = int(r, 3, 20);
      const b = int(r, 3, 20);
      const h = 2 * int(r, 2, 9);
      if (kind === 0) return { prompt: t(`Основания трапеции ${a} и ${b} см, высота ${h} см. Найди площадь.`, `A trapezoid has bases ${a} and ${b} cm and height ${h} cm. Find its area.`), answer: ((a + b) / 2) * h, unit: U.cm2, wrong: [(a + b) * h, a * b * h, ((a + b) / 2) * h + h], solution: t(`S = (a + b)/2 · h = ${(a + b) / 2} · ${h} = ${((a + b) / 2) * h} см²`, `A = (a + b)/2 · h = ${((a + b) / 2) * h} cm²`) };
      if (kind === 1) return { prompt: t(`Сторона параллелограмма ${a} см, высота к ней ${h} см. Найди площадь.`, `A parallelogram has side ${a} cm and height ${h} cm. Find its area.`), answer: a * h, unit: U.cm2, wrong: [(a * h) / 2, 2 * (a + h), a + h], solution: t(`S = a · h = ${a * h} см²`, `A = a · h = ${a * h} cm²`) };
      if (kind === 2) return { prompt: t(`Сторона треугольника ${a} см, высота к ней ${h} см. Найди площадь.`, `A triangle has base ${a} cm and height ${h} cm. Find its area.`), answer: (a * h) / 2, unit: U.cm2, wrong: [a * h, a + h, (a * h) / 4], solution: t(`S = ½ · a · h = ½ · ${a} · ${h} = ${(a * h) / 2} см²`, `A = ½ah = ${(a * h) / 2} cm²`) };
      return { prompt: t(`Диагонали ромба ${a * 2} и ${h} см. Найди площадь.`, `A rhombus has diagonals ${a * 2} and ${h} cm. Find its area.`), answer: a * h, unit: U.cm2, wrong: [2 * a * h, a * 2 + h, (a * h) / 2], solution: t(`S = d₁ · d₂ / 2 = ${2 * a} · ${h} / 2 = ${a * h} см²`, `A = d₁d₂/2 = ${a * h} cm²`) };
    },
  },
  {
    id: 'm-similar', subject: 'mathematics', grade: 8, topics: ['m8-similar'], title: t('Подобные треугольники', 'Similar triangles'),
    make: (r) => {
      const k = int(r, 2, 5);
      const s = int(r, 2, 12);
      if (int(r, 0, 1)) return { prompt: t(`Треугольники подобны с коэффициентом ${k}. Площадь меньшего ${s} см². Найди площадь большего.`, `Two triangles are similar with ratio ${k}. The smaller has area ${s} cm². Find the larger one’s area.`), answer: s * k * k, unit: U.cm2, wrong: [s * k, s * k * 2, s + k], solution: t(`Площади относятся как k²: ${s} · ${k * k} = ${s * k * k} см²`, `Areas scale by k²: ${s * k * k} cm²`) };
      const a = int(r, 3, 9);
      const b = int(r, 3, 9);
      return { prompt: t(`ΔABC ∼ ΔA₁B₁C₁, AB = ${a}, A₁B₁ = ${a * k}, BC = ${b}. Найди B₁C₁.`, `ΔABC ∼ ΔA₁B₁C₁, AB = ${a}, A₁B₁ = ${a * k}, BC = ${b}. Find B₁C₁.`), answer: b * k, wrong: [b + a * k - a, round(b / k, 2), b * k * k], solution: t(`k = ${a * k} : ${a} = ${k}; B₁C₁ = ${b} · ${k} = ${b * k}`, `k = ${k}; B₁C₁ = ${b * k}`) };
    },
  },
  {
    id: 'm-trig-acute', subject: 'mathematics', grade: 8, topics: ['m8-trig-acute'], title: t('sin, cos, tg острого угла', 'sin, cos, tan of an acute angle'),
    make: (r) => {
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
      const f = pick(r, ['sin', 'cos', 'tg']);
      const ans = f === 'sin' ? fr(a, c) : f === 'cos' ? fr(b, c) : fr(a, b);
      const pool = [fr(a, c), fr(b, c), fr(a, b), fr(b, a), fr(c, a)].filter((x) => x !== ans);
      return { prompt: t(`В прямоугольном треугольнике катет против угла A равен ${a}, прилежащий катет ${b}, гипотенуза ${c}. Найди ${f} A.`, `In a right triangle the leg opposite A is ${a}, the adjacent leg ${b}, the hypotenuse ${c}. Find ${f === 'tg' ? 'tan' : f} A.`), answer: ans, wrong: pool.slice(0, 3), solution: t(f === 'sin' ? `sin A = противолежащий / гипотенуза = ${ans}` : f === 'cos' ? `cos A = прилежащий / гипотенуза = ${ans}` : `tg A = противолежащий / прилежащий = ${ans}`, f === 'sin' ? `sin = opposite/hypotenuse = ${ans}` : f === 'cos' ? `cos = adjacent/hypotenuse = ${ans}` : `tan = opposite/adjacent = ${ans}`) };
    },
  },
  {
    id: 'm-inscribed-angle', subject: 'mathematics', grade: 8, topics: ['m8-circle-angles'], title: t('Вписанный угол', 'Inscribed angle'),
    make: (r) => {
      const c = 2 * int(r, 15, 85);
      if (int(r, 0, 1)) return { prompt: t(`Центральный угол равен ${c}°. Найди вписанный угол, опирающийся на ту же дугу.`, `A central angle is ${c}°. Find the inscribed angle on the same arc.`), answer: c / 2, unit: U.deg, wrong: [c, c * 2, 180 - c], solution: t(`Вписанный угол равен половине центрального: ${c / 2}°`, `The inscribed angle is half the central one: ${c / 2}°`) };
      return { prompt: t(`Вписанный угол равен ${c / 2}°. Найди центральный угол, опирающийся на ту же дугу.`, `An inscribed angle is ${c / 2}°. Find the central angle on the same arc.`), answer: c, unit: U.deg, wrong: [c / 2, c / 4, 180 - c / 2], solution: t(`Центральный вдвое больше вписанного: ${c}°`, `The central angle is twice the inscribed one: ${c}°`) };
    },
  },
  {
    id: 'm-incircle', subject: 'mathematics', grade: 8, topics: ['m8-inscribed-circles'], title: t('Вписанная и описанная окружности', 'Incircle and circumcircle'),
    make: (r) => {
      const [a0, b0, c0] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
      const k = int(r, 1, 3);
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      if (int(r, 0, 1)) return { prompt: t(`Катеты прямоугольного треугольника ${a} и ${b}, гипотенуза ${c}. Найди радиус описанной окружности.`, `A right triangle has legs ${a}, ${b} and hypotenuse ${c}. Find the circumradius.`), answer: c / 2, wrong: [c, (a + b - c) / 2, (a + b) / 2], solution: t(`Центр описанной окружности — середина гипотенузы: R = ${c} / 2 = ${String(c / 2).replace(".", ",")}`, `The circumcentre is the midpoint of the hypotenuse: R = ${c / 2}`) };
      return { prompt: t(`Катеты прямоугольного треугольника ${a} и ${b}, гипотенуза ${c}. Найди радиус вписанной окружности.`, `A right triangle has legs ${a}, ${b} and hypotenuse ${c}. Find the inradius.`), answer: (a + b - c) / 2, wrong: [c / 2, (a + b + c) / 2, a + b - c], solution: t(`r = (a + b − c) / 2 = (${a} + ${b} − ${c}) / 2 = ${(a + b - c) / 2}`, `r = (a + b − c)/2 = ${(a + b - c) / 2}`) };
    },
  },
  /* ===== grade 9 ===== */
  {
    id: 'm-vertex', subject: 'mathematics', grade: 9, topics: ['m9-quadratic-function'], title: t('Вершина параболы', 'Vertex of a parabola'),
    make: (r) => {
      const a = nz(r, -3, 3);
      const x0 = int(r, -5, 5);
      const y0 = int(r, -9, 9);
      const b = -2 * a * x0;
      const c = a * x0 * x0 + y0;
      const ans = (x: number, y: number) => `(${num(x)}; ${num(y)})`;
      return { prompt: t(`Найди вершину параболы y = ${poly(a, b, c)}`, `Find the vertex of y = ${poly(a, b, c)}`), answer: ans(x0, y0), wrong: [ans(-x0, y0), ans(x0, c), ans(round(-b / a, 2), y0), ans(x0, -y0), ans(y0, x0), ans(x0 + 1, y0), ans(x0, y0 + a), ans(x0 - 1, y0 - 1), ans(-x0 + 2, -y0 + 2)], solution: t(`x₀ = −b/(2a) = ${num(-b)}/${num(2 * a)} = ${num(x0)}; y₀ = y(${num(x0)}) = ${num(y0)}`, `x₀ = −b/(2a) = ${num(x0)}, y₀ = ${num(y0)}`) };
    },
  },
  {
    id: 'm-quad-ineq', subject: 'mathematics', grade: 9, topics: ['m9-quadratic-inequality'], title: t('Квадратное неравенство', 'Quadratic inequality'),
    make: (r) => {
      const p = int(r, -7, 4);
      const q = p + int(r, 1, 7);
      const less = int(r, 0, 1) === 1;
      const inside = `(${num(p)}; ${num(q)})`;
      const outside = `(−∞; ${num(p)}) ∪ (${num(q)}; +∞)`;
      return { prompt: t(`Реши неравенство ${poly(1, -(p + q), p * q)} ${less ? '<' : '>'} 0`, `Solve ${poly(1, -(p + q), p * q)} ${less ? '<' : '>'} 0`), answer: less ? inside : outside, wrong: [less ? outside : inside, `(${num(-q)}; ${num(-p)})`, `(−∞; ${num(-q)}) ∪ (${num(-p)}; +∞)`, less ? `[${num(p)}; ${num(q)}]` : `(−∞; ${num(p)}] ∪ [${num(q)}; +∞)`, `(${num(p)}; +∞)`, `(−∞; ${num(q)})`], solution: t(`Корни ${num(p)} и ${num(q)}, ветви вверх. Парабола ${less ? 'ниже' : 'выше'} оси x ${less ? 'между корнями' : 'снаружи корней'}: ${less ? inside : outside}`, `Roots ${num(p)} and ${num(q)}; opens up, so it is ${less ? 'negative between' : 'positive outside'} the roots.`) };
    },
  },
  {
    id: 'm-arith', subject: 'mathematics', grade: 9, topics: ['m9-arithmetic'], title: t('Арифметическая прогрессия', 'Arithmetic sequence'),
    make: (r) => {
      const a1 = int(r, -10, 15);
      const d = nz(r, -5, 7);
      const k = int(r, 6, 25);
      const an = a1 + (k - 1) * d;
      if (int(r, 0, 1)) return { prompt: t(`a₁ = ${num(a1)}, d = ${num(d)}. Найди a${k}.`, `a₁ = ${num(a1)}, d = ${num(d)}. Find a${k}.`), answer: an, wrong: [a1 + k * d, a1 * d ** (k - 1) === an ? an + 1 : k * d, a1 + (k - 1) + d], solution: t(`aₙ = a₁ + (n − 1)d = ${num(a1)} + ${k - 1} · (${num(d)}) = ${num(an)}`, `aₙ = a₁ + (n − 1)d = ${num(an)}`) };
      return { prompt: t(`a₁ = ${num(a1)}, d = ${num(d)}. Найди сумму первых ${k} членов.`, `a₁ = ${num(a1)}, d = ${num(d)}. Find the sum of the first ${k} terms.`), answer: ((a1 + an) * k) / 2, wrong: [(a1 + an) * k, ((a1 + an + d) * k) / 2, ((a1 + an) * (k - 1)) / 2], solution: t(`a${k} = ${num(an)}; Sₙ = (a₁ + aₙ)/2 · n = (${num(a1)} + ${num(an)})/2 · ${k} = ${num(((a1 + an) * k) / 2)}`, `Sₙ = (a₁ + aₙ)n/2 = ${num(((a1 + an) * k) / 2)}`) };
    },
  },
  {
    id: 'm-geom-seq', subject: 'mathematics', grade: 9, topics: ['m9-geometric'], title: t('Геометрическая прогрессия', 'Geometric sequence'),
    make: (r) => {
      const b1 = int(r, 1, 6);
      const q = pick(r, [2, 3, -2]);
      const k = int(r, 3, 6);
      const bn = b1 * q ** (k - 1);
      if (int(r, 0, 1)) return { prompt: t(`b₁ = ${b1}, q = ${num(q)}. Найди b${k}.`, `b₁ = ${b1}, q = ${num(q)}. Find b${k}.`), answer: bn, wrong: [b1 * q ** k, b1 + (k - 1) * q, b1 * q * (k - 1) === bn ? bn * 2 : b1 * q * (k - 1)], solution: t(`bₙ = b₁ · qⁿ⁻¹ = ${b1} · (${num(q)})^${k - 1} = ${num(bn)}`, `bₙ = b₁qⁿ⁻¹ = ${num(bn)}`) };
      const S = (b1 * (q ** k - 1)) / (q - 1);
      return { prompt: t(`b₁ = ${b1}, q = ${num(q)}. Найди сумму первых ${k} членов.`, `b₁ = ${b1}, q = ${num(q)}. Find the sum of the first ${k} terms.`), answer: S, wrong: [bn, (b1 * (q ** (k + 1) - 1)) / (q - 1), b1 * k * q], solution: t(`Sₙ = b₁(qⁿ − 1)/(q − 1) = ${b1} · (${num(q ** k)} − 1)/${num(q - 1)} = ${num(S)}`, `Sₙ = b₁(qⁿ − 1)/(q − 1) = ${num(S)}`) };
    },
  },
  {
    id: 'm-comb', subject: 'mathematics', grade: 9, topics: ['m9-combinatorics'], title: t('Комбинаторика', 'Counting'),
    make: (r) => {
      const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
      const kind = int(r, 0, 2);
      const nn = int(r, 4, 8);
      const k = int(r, 2, 3);
      if (kind === 0) return { prompt: t(`Сколькими способами можно рассадить ${nn - 1} человек на ${nn - 1} стульев в ряд?`, `In how many ways can ${nn - 1} people sit on ${nn - 1} chairs in a row?`), answer: fact(nn - 1), wrong: [(nn - 1) ** 2, (nn - 1) * 2, fact(nn - 2)], solution: t(`Перестановки: ${nn - 1}! = ${fact(nn - 1)}`, `Permutations: ${nn - 1}! = ${fact(nn - 1)}`) };
      const A = fact(nn) / fact(nn - k);
      const C = A / fact(k);
      if (kind === 1) return { prompt: t(`Из ${nn} учеников выбирают ${k === 2 ? 'старосту и его заместителя' : 'старосту, заместителя и казначея'}. Сколько способов?`, `From ${nn} students choose ${k === 2 ? 'a head and a deputy' : 'a head, a deputy and a treasurer'}. How many ways?`), answer: A, wrong: [C, nn ** k, nn * k], solution: t(`Порядок важен (разные должности): A = ${Array.from({ length: k }, (_, i) => nn - i).join(' · ')} = ${A}`, `Order matters: ${A}`) };
      return { prompt: t(`Из ${nn} учеников нужно выбрать ${k} на олимпиаду. Сколько способов?`, `Choose ${k} of ${nn} students for a contest. How many ways?`), answer: C, wrong: [A, nn * k, fact(nn) / fact(k) === C ? C + 1 : fact(nn) / fact(k)], solution: t(`Порядок не важен: C = ${A} / ${k}! = ${C}`, `Order does not matter: C = ${A} / ${k}! = ${C}`) };
    },
  },
  {
    id: 'm-prob', subject: 'mathematics', grade: 9, topics: ['m9-probability', 'm11-probability'], title: t('Вероятность', 'Probability'),
    make: (r) => {
      const kind = int(r, 0, 2);
      if (kind === 0) {
        const red = int(r, 2, 9);
        const blue = int(r, 2, 9);
        const white = int(r, 1, 6);
        const N = red + blue + white;
        return { prompt: t(`В коробке шары: красных — ${red}, синих — ${blue}, белых — ${white}. Какова вероятность вынуть синий?`, `A box has ${red} red, ${blue} blue and ${white} white balls. What is the chance of drawing blue?`), answer: fr(blue, N), wrong: [fr(blue, red + white), fr(1, 3), fr(red + white, N), fr(red, N), fr(white, N), fr(blue, N - 1), fr(blue + 1, N)], solution: t(`P = благоприятные / все = ${blue}/${N}${gcd(blue, N) > 1 ? ` = ${fr(blue, N)}` : ''}`, `P = favourable / all = ${fr(blue, N)}`) };
      }
      if (kind === 1) {
        const s = int(r, 3, 11);
        const ways = 6 - Math.abs(7 - s);
        return { prompt: t(`Бросают два кубика. Какова вероятность, что сумма равна ${s}?`, `Two dice are rolled. What is the chance the sum is ${s}?`), answer: fr(ways, 36), wrong: [fr(1, 11), fr(ways, 12), fr(ways + 1, 36), fr(ways - 1 || 2, 36), fr(1, 6)], solution: t(`Всего 6 · 6 = 36 исходов, сумму ${s} дают ${ways}: P = ${fr(ways, 36)}`, `36 outcomes, ${ways} give ${s}: P = ${fr(ways, 36)}`) };
      }
      const p = pick(r, [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      return { prompt: t(`Стрелок попадает в мишень с вероятностью ${String(p).replace('.', ',')}. Какова вероятность, что он попадёт два раза подряд?`, `A shooter hits with probability ${p}. What is the chance of two hits in a row?`), answer: round(p * p, 2), wrong: [round(2 * p, 2) > 1 ? round(1 - p, 2) : round(2 * p, 2), p, round(1 - p * p, 2)], solution: t(`Независимые события — вероятности перемножаются: ${String(p).replace('.', ',')}² = ${String(round(p * p, 2)).replace('.', ',')}`, `Independent events multiply: ${p}² = ${round(p * p, 2)}`) };
    },
  },
  {
    id: 'm-vectors', subject: 'mathematics', grade: 9, topics: ['m9-vectors', 'm9-coordinates'], title: t('Векторы и координаты', 'Vectors and coordinates'),
    make: (r) => {
      const [a0, b0, c0] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [12, 5, 13]]);
      const x1 = int(r, -5, 5);
      const y1 = int(r, -5, 5);
      const sx = pick(r, [1, -1]);
      const sy = pick(r, [1, -1]);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Найди расстояние между точками A(${num(x1)}; ${num(y1)}) и B(${num(x1 + sx * a0)}; ${num(y1 + sy * b0)}).`, `Find the distance between A(${num(x1)}, ${num(y1)}) and B(${num(x1 + sx * a0)}, ${num(y1 + sy * b0)}).`), answer: c0, wrong: [a0 + b0, c0 * c0, Math.abs(a0 - b0) === 0 ? c0 + 1 : Math.abs(a0 - b0) * 2], solution: t(`AB = √(${a0}² + ${b0}²) = √${c0 * c0} = ${c0}`, `AB = √(${a0 * a0} + ${b0 * b0}) = ${c0}`) };
      if (kind === 1) return { prompt: t(`Найди длину вектора a⃗{${num(sx * a0)}; ${num(sy * b0)}}.`, `Find the length of a⃗(${num(sx * a0)}, ${num(sy * b0)}).`), answer: c0, wrong: [a0 + b0, c0 * c0, Math.abs(sx * a0 + sy * b0) === c0 ? c0 + 2 : Math.abs(sx * a0 + sy * b0)], solution: t(`|a⃗| = √(x² + y²) = √${c0 * c0} = ${c0}`, `|a⃗| = √(x² + y²) = ${c0}`) };
      const x2 = x1 + 2 * int(r, -4, 4);
      const y2 = y1 + 2 * int(r, -4, 4);
      const ans = (x: number, y: number) => `(${num(x)}; ${num(y)})`;
      return { prompt: t(`Найди координаты середины отрезка A(${num(x1)}; ${num(y1)}), B(${num(x2)}; ${num(y2)}).`, `Find the midpoint of A(${num(x1)}, ${num(y1)}) and B(${num(x2)}, ${num(y2)}).`), answer: ans((x1 + x2) / 2, (y1 + y2) / 2), wrong: [ans(x2 - x1, y2 - y1), ans((x2 - x1) / 2, (y2 - y1) / 2), ans(x1 + x2, y1 + y2), ans((y1 + y2) / 2, (x1 + x2) / 2), ans((x1 + x2) / 2 + 1, (y1 + y2) / 2 - 1)], solution: t(`Середина = полусумма координат: (${num(x1)} ${sg(x2)})/2 = ${num((x1 + x2) / 2)}, (${num(y1)} ${sg(y2)})/2 = ${num((y1 + y2) / 2)}`, `Midpoint = average of coordinates: ${ans((x1 + x2) / 2, (y1 + y2) / 2)}`) };
    },
  },
  {
    id: 'm-cos-law', subject: 'mathematics', grade: 9, topics: ['m9-sine-cosine-law'], title: t('Теорема косинусов', 'Law of cosines'),
    make: (r) => {
      const [a0, b0, c0, C] = pick(r, [[5, 8, 7, 60], [3, 8, 7, 60], [8, 15, 13, 60], [3, 5, 7, 120], [7, 8, 13, 120], [5, 16, 19, 120]]);
      const k = int(r, 1, 3);
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      return { prompt: t(`В треугольнике две стороны ${a} и ${b}, угол между ними ${C}°. Найди третью сторону.`, `Two sides of a triangle are ${a} and ${b} with ${C}° between them. Find the third side.`), answer: c, wrong: [round(Math.sqrt(a * a + b * b), 2), C === 60 ? round(Math.sqrt(a * a + b * b + a * b), 2) : round(Math.sqrt(a * a + b * b - a * b), 2), a + b], solution: t(`c² = a² + b² − 2ab·cos ${C}° = ${a * a} + ${b * b} ${C === 60 ? '−' : '+'} ${a * b} = ${c * c}, c = ${c}`, `c² = a² + b² − 2ab cos ${C}° = ${c * c}, c = ${c}`) };
    },
  },
  {
    id: 'm-polygon', subject: 'mathematics', grade: 9, topics: ['m9-regular-polygons', 'm8-quadrilaterals'], title: t('Углы многоугольника', 'Polygon angles'),
    make: (r) => {
      const nn = pick(r, [5, 6, 8, 9, 10, 12, 15, 18, 20]);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Найди сумму углов выпуклого ${nn}-угольника.`, `Find the angle sum of a convex ${nn}-gon.`), answer: (nn - 2) * 180, unit: U.deg, wrong: [nn * 180, (nn - 1) * 180, 360], solution: t(`(n − 2) · 180° = ${nn - 2} · 180° = ${(nn - 2) * 180}°`, `(n − 2) · 180° = ${(nn - 2) * 180}°`) };
      if (kind === 1) return { prompt: t(`Найди угол правильного ${nn}-угольника.`, `Find each angle of a regular ${nn}-gon.`), answer: ((nn - 2) * 180) / nn, unit: U.deg, wrong: [360 / nn, (nn - 2) * 180, 180 - 180 / nn === ((nn - 2) * 180) / nn ? 180 / nn : 180 - 180 / nn], digits: 2, solution: t(`(n − 2) · 180° / n = ${(nn - 2) * 180} / ${nn} = ${round(((nn - 2) * 180) / nn, 2)}°`, `(n − 2) · 180° / n = ${round(((nn - 2) * 180) / nn, 2)}°`) };
      return { prompt: t(`Сколько диагоналей у выпуклого ${nn}-угольника?`, `How many diagonals does a convex ${nn}-gon have?`), answer: (nn * (nn - 3)) / 2, wrong: [nn * (nn - 3), nn - 3, (nn * (nn - 1)) / 2], solution: t(`n(n − 3)/2 = ${nn} · ${nn - 3} / 2 = ${(nn * (nn - 3)) / 2}`, `n(n − 3)/2 = ${(nn * (nn - 3)) / 2}`) };
    },
  },
  {
    id: 'm-coord-sym', subject: 'mathematics', grade: 6, topics: ['m6-coordinates', 'm9-motions'], title: t('Симметрия точек', 'Symmetric points'),
    make: (r) => {
      const x = nz(r, -9, 9);
      let y = nz(r, -9, 9);
      if (Math.abs(y) === Math.abs(x)) y = y > 0 ? y + 1 : y - 1;
      const ans = (p: number, q: number) => `(${num(p)}; ${num(q)})`;
      const kind = int(r, 0, 2);
      const what = [t('оси Ox', 'the x-axis'), t('оси Oy', 'the y-axis'), t('начала координат', 'the origin')][kind];
      const right = kind === 0 ? ans(x, -y) : kind === 1 ? ans(-x, y) : ans(-x, -y);
      return { prompt: t(`Найди точку, симметричную A${ans(x, y)} относительно ${what.ru}.`, `Reflect A${ans(x, y)} in ${what.en}.`), answer: right, wrong: [ans(x, -y), ans(-x, y), ans(-x, -y), ans(y, x)].filter((v) => v !== right), solution: t(kind === 0 ? 'Относительно Ox меняется знак y.' : kind === 1 ? 'Относительно Oy меняется знак x.' : 'Относительно начала координат меняются оба знака.', kind === 0 ? 'In the x-axis the sign of y flips.' : kind === 1 ? 'In the y-axis the sign of x flips.' : 'Through the origin both signs flip.') };
    },
  },
  {
    id: 'm-rational-frac', subject: 'mathematics', grade: 8, topics: ['m8-rational-fractions'], title: t('Сокращение алгебраических дробей', 'Simplifying algebraic fractions'),
    make: (r) => {
      const a = int(r, 1, 9);
      if (int(r, 0, 1) === 0) return { prompt: t(`Сократи дробь (x² − ${a * a}) / (x − ${a})`, `Simplify (x² − ${a * a}) / (x − ${a})`), answer: `x + ${a}`, wrong: [`x − ${a}`, `x + ${a * a}`, `x² + ${a}`, `x + ${2 * a}`], solution: t(`x² − ${a * a} = (x − ${a})(x + ${a}), сокращаем на (x − ${a}): x + ${a}`, `x² − ${a * a} = (x − ${a})(x + ${a}); cancel (x − ${a}): x + ${a}`) };
      const x = int(r, 1, 9) + a;
      return { prompt: t(`Найди значение (x² + ${2 * a}x + ${a * a}) / (x + ${a}) при x = ${x}.`, `Evaluate (x² + ${2 * a}x + ${a * a}) / (x + ${a}) at x = ${x}.`), answer: x + a, wrong: [(x + a) ** 2, x - a, x + a * a], solution: t(`Числитель — (x + ${a})², дробь равна x + ${a} = ${x + a}`, `The top is (x + ${a})², so the fraction is x + ${a} = ${x + a}`) };
    },
  },
  {
    id: 'm-nonlinear-system', subject: 'mathematics', grade: 9, topics: ['m9-systems-nonlinear'], title: t('Нелинейная система', 'Non-linear system'),
    make: (r) => {
      const p = int(r, 1, 8);
      let q = int(r, 1, 9);
      if (q === p) q++;
      const ans = (u: number, v: number): string => (u > v ? ans(v, u) : `(${num(u)}; ${num(v)}), (${num(v)}; ${num(u)})`);
      return { prompt: t(`Реши систему: x + y = ${p + q}, xy = ${p * q}`, `Solve: x + y = ${p + q}, xy = ${p * q}`), answer: ans(p, q), wrong: [ans(-p, -q), ans(p + 1, q - 1), ans(p - 1, q + 1), ans(1, p * q), ans(p, -q), ans(-p, q)], solution: t(`По Виету x и y — корни t² − ${p + q}t + ${p * q} = 0: t = ${p} и t = ${q}. Ответ: ${ans(p, q)}`, `x and y are the roots of t² − ${p + q}t + ${p * q} = 0: ${p} and ${q}.`) };
    },
  },
  /* ===== grade 10 ===== */
  {
    id: 'm-radians', subject: 'mathematics', grade: 10, topics: ['m10-radians'], title: t('Радианы', 'Radians'),
    make: (r) => {
      const [d, rad] = pick(r, [[30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'], [120, '2π/3'], [135, '3π/4'], [150, '5π/6'], [180, 'π'], [270, '3π/2'], [360, '2π']] as [number, string][]);
      const others = ['π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '3π/2', '2π'].filter((x) => x !== rad);
      const i = int(r, 0, others.length - 1);
      return { prompt: t(`Переведи ${d}° в радианы.`, `Convert ${d}° to radians.`), answer: rad, wrong: [others[i], others[(i + 3) % others.length], others[(i + 6) % others.length]], solution: t(`180° = π, значит ${d}° = ${d}/180 · π = ${rad}`, `180° = π, so ${d}° = ${rad}`) };
    },
  },
  {
    id: 'm-trig-values', subject: 'mathematics', grade: 10, topics: ['m10-trig-functions', 'm10-trig-formulas'], title: t('Значения sin и cos', 'Values of sin and cos'),
    make: (r) => {
      const V: Record<string, [string, string]> = { '0°': ['0', '1'], '30°': ['1/2', '√3/2'], '45°': ['√2/2', '√2/2'], '60°': ['√3/2', '1/2'], '90°': ['1', '0'], '120°': ['√3/2', '−1/2'], '150°': ['1/2', '−√3/2'], '180°': ['0', '−1'], '270°': ['−1', '0'] };
      const ang = pick(r, Object.keys(V));
      const f = int(r, 0, 1);
      const ans = V[ang][f];
      const pool = ['0', '1', '−1', '1/2', '−1/2', '√2/2', '√3/2', '−√3/2'].filter((x) => x !== ans);
      const i = int(r, 0, pool.length - 1);
      return { prompt: t(`Чему равен ${f ? 'cos' : 'sin'} ${ang}?`, `What is ${f ? 'cos' : 'sin'} ${ang}?`), answer: ans, wrong: [V[ang][1 - f], pool[i], pool[(i + 2) % pool.length], pool[(i + 5) % pool.length], pool[(i + 1) % pool.length]], solution: t(`По единичной окружности: ${f ? 'cos' : 'sin'} ${ang} = ${ans} (${f ? 'cos — абсцисса' : 'sin — ордината'} точки).`, `On the unit circle ${f ? 'cos is the x' : 'sin is the y'}-coordinate: ${ans}.`) };
    },
  },
  {
    id: 'm-trig-identity', subject: 'mathematics', grade: 10, topics: ['m10-trig-formulas'], title: t('Основное тригонометрическое тождество', 'Pythagorean identity'),
    make: (r) => {
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
      return { prompt: t(`sin α = ${a}/${c}, α — острый угол. Найди cos α.`, `sin α = ${a}/${c}, α acute. Find cos α.`), answer: `${b}/${c}`, wrong: [`${c - a}/${c}`, `${a}/${b}`, `−${b}/${c}`], solution: t(`cos α = √(1 − sin²α) = √(1 − ${a * a}/${c * c}) = √(${b * b}/${c * c}) = ${b}/${c}`, `cos α = √(1 − sin²α) = ${b}/${c}`) };
    },
  },
  {
    id: 'm-trig-eq', subject: 'mathematics', grade: 10, topics: ['m10-trig-equations'], title: t('Простейшие тригонометрические уравнения', 'Basic trig equations'),
    make: (r) => {
      const all: [string, string][] = [
        ['sin x = 0', 'x = πk'],
        ['cos x = 0', 'x = π/2 + πk'],
        ['sin x = 1', 'x = π/2 + 2πk'],
        ['cos x = 1', 'x = 2πk'],
        ['cos x = −1', 'x = π + 2πk'],
        ['tg x = 1', 'x = π/4 + πk'],
        ['cos x = 1/2', 'x = ±π/3 + 2πk'],
        ['sin x = 1/2', 'x = (−1)ᵏ·π/6 + πk'],
      ];
      const [eq, ans] = pick(r, all);
      const others = all.map((x) => x[1]).filter((x) => x !== ans);
      const i = int(r, 0, others.length - 1);
      return { prompt: t(`Реши уравнение ${eq} (k ∈ ℤ).`, `Solve ${eq} (k ∈ ℤ).`), answer: ans, wrong: [others[i], others[(i + 2) % others.length], others[(i + 4) % others.length]], solution: t(`Отмечаем на единичной окружности все точки, где ${eq}: ${ans}`, `Mark the points on the unit circle where ${eq}: ${ans}`) };
    },
  },
  {
    id: 'm-roots-powers', subject: 'mathematics', grade: 10, topics: ['m10-nth-root', 'm10-rational-powers'], title: t('Корни и дробные степени', 'Roots and fractional powers'),
    make: (r) => {
      const [b, p, q] = pick(r, [[8, 2, 3], [27, 2, 3], [16, 3, 4], [32, 2, 5], [81, 3, 4], [64, 5, 6], [125, 2, 3], [4, 3, 2], [9, 3, 2], [16, 1, 4], [27, 1, 3]]);
      const root = Math.round(b ** (1 / q));
      const ans = root ** p;
      return { prompt: t(`Вычисли ${b}^(${p}/${q})`, `Work out ${b}^(${p}/${q})`), answer: ans, wrong: [round((b * p) / q, 2), root, ans * root === ans ? ans + 1 : ans * root], solution: t(`${b}^(${p}/${q}) = (ᵠ√${b})^${p} = ${root}^${p} = ${ans}`.replace('ᵠ', q === 2 ? '' : String(q)), `(${q}-th root of ${b})^${p} = ${root}^${p} = ${ans}`) };
    },
  },
  {
    id: 'm-polyhedra', subject: 'mathematics', grade: 10, topics: ['m10-polyhedra', 'm10-axioms'], title: t('Многогранники', 'Polyhedra'),
    make: (r) => {
      const k = int(r, 3, 10);
      const pyr = int(r, 0, 1) === 1;
      const V = pyr ? k + 1 : 2 * k;
      const E = pyr ? 2 * k : 3 * k;
      const F = pyr ? k + 1 : k + 2;
      const what = int(r, 0, 2);
      const name = pyr ? t(`${k}-угольной пирамиды`, `a ${k}-gonal pyramid`) : t(`${k}-угольной призмы`, `a ${k}-gonal prism`);
      const ask = [t('вершин', 'vertices'), t('рёбер', 'edges'), t('граней', 'faces')][what];
      const ans = [V, E, F][what];
      const ws = [V, E, F, ans + k, ans + 2].filter((x) => x !== ans);
      return { prompt: t(`Сколько ${ask.ru} у ${name.ru}?`, `How many ${ask.en} does ${name.en} have?`), answer: ans, wrong: [...new Set(ws)].slice(0, 3), solution: t(`${pyr ? 'Пирамида' : 'Призма'}: вершин ${V}, рёбер ${E}, граней ${F}. Проверка Эйлера: ${V} − ${E} + ${F} = 2.`, `Vertices ${V}, edges ${E}, faces ${F}. Euler: V − E + F = 2.`) };
    },
  },
  /* ===== grade 11 ===== */
  {
    id: 'm-derivative', subject: 'mathematics', grade: 11, topics: ['m11-derivative', 'm11-derivative-rules'], title: t('Производная в точке', 'Derivative at a point'),
    make: (r) => {
      const a = nz(r, -4, 5);
      const p = int(r, 2, 4);
      const b = int(r, -9, 9);
      const c = int(r, -9, 9);
      const x = nz(r, -3, 3);
      const d = a * p * x ** (p - 1) + b;
      return { prompt: t(`f(x) = ${poly(a, ...Array(p - 2).fill(0), b, c)}. Найди f′(${num(x)}).`, `f(x) = ${poly(a, ...Array(p - 2).fill(0), b, c)}. Find f′(${num(x)}).`), answer: d, wrong: [a * x ** p + b * x + c === d ? d + 3 : a * x ** p + b * x + c, a * p * x ** (p - 1) + b + c === d ? d - 2 : a * p * x ** (p - 1) + b + c, a * p * x ** p + b === d ? d + 1 : a * p * x ** p + b], solution: t(`f′(x) = ${poly(a * p, ...Array(p - 2).fill(0), b)}; f′(${num(x)}) = ${num(d)}`, `f′(x) = ${poly(a * p, ...Array(p - 2).fill(0), b)}, so f′(${num(x)}) = ${num(d)}`) };
    },
  },
  {
    id: 'm-extremum', subject: 'mathematics', grade: 11, topics: ['m11-derivative-use'], title: t('Экстремумы', 'Extrema'),
    make: (r) => {
      const a = int(r, 1, 5);
      const max = int(r, 0, 1) === 1;
      return { prompt: t(`Найди точку ${max ? 'максимума' : 'минимума'} функции f(x) = x³ − ${3 * a * a}x.`, `Find the point of local ${max ? 'maximum' : 'minimum'} of f(x) = x³ − ${3 * a * a}x.`), answer: max ? -a : a, wrong: [max ? a : -a, 0, 3 * a * a], solution: t(`f′(x) = 3x² − ${3 * a * a} = 0 → x = ±${a}. Производная меняет знак с + на − в точке −${a} (максимум) и с − на + в точке ${a} (минимум).`, `f′(x) = 3x² − ${3 * a * a} = 0 gives x = ±${a}; max at −${a}, min at ${a}.`) };
    },
  },
  {
    id: 'm-integral', subject: 'mathematics', grade: 11, topics: ['m11-integral', 'm11-antiderivative'], title: t('Определённый интеграл', 'Definite integral'),
    make: (r) => {
      if (int(r, 0, 1)) {
        const b = int(r, 1, 6);
        const k = int(r, 1, 4) * 3;
        return { prompt: t(`Вычисли ∫₀^${b} ${k}x² dx`, `Work out ∫₀^${b} ${k}x² dx`), answer: (k * b ** 3) / 3, wrong: [k * b ** 3, k * b * b, (k * b * b) / 2], solution: t(`Первообразная ${k / 3}x³: ${k / 3} · ${b}³ − 0 = ${(k * b ** 3) / 3}`, `Antiderivative ${k / 3}x³: ${(k * b ** 3) / 3}`) };
      }
      const a = int(r, 0, 3);
      const b = a + int(r, 1, 4);
      const k = 2 * int(r, 1, 4);
      return { prompt: t(`Вычисли ∫${a}^${b} ${k}x dx`, `Work out ∫ from ${a} to ${b} of ${k}x dx`), answer: (k / 2) * (b * b - a * a), wrong: [k * (b - a), k * (b * b - a * a), (k / 2) * (b - a) ** 2 === (k / 2) * (b * b - a * a) ? (k / 2) * (b * b - a * a) + 2 : (k / 2) * (b - a) ** 2], solution: t(`Первообразная ${k / 2}x²: ${k / 2}·${b * b} − ${k / 2}·${a * a} = ${(k / 2) * (b * b - a * a)}`, `Antiderivative ${k / 2}x²: ${(k / 2) * (b * b - a * a)}`) };
    },
  },
  {
    id: 'm-antiderivative', subject: 'mathematics', grade: 11, topics: ['m11-antiderivative'], title: t('Первообразная', 'Antiderivative'),
    make: (r) => {
      const p = int(r, 1, 4);
      const a = (p + 1) * int(r, 1, 3);
      const sup = (k: number) => ['', '', '²', '³', '⁴', '⁵'][k];
      const show = (c: number, k: number) => `${c === 1 ? '' : c}x${sup(k)} + C`;
      return { prompt: t(`Найди первообразную функции f(x) = ${a}x${sup(p)}.`, `Find an antiderivative of f(x) = ${a}x${sup(p)}.`), answer: show(a / (p + 1), p + 1), wrong: [show(a * p, p - 1 || 1) === show(a / (p + 1), p + 1) ? show(a, p + 1) : show(a * p, Math.max(1, p - 1)), show(a, p + 1), show(a * (p + 1), p + 1)], solution: t(`∫xⁿdx = xⁿ⁺¹/(n + 1): ${a}x${sup(p + 1)}/${p + 1} = ${show(a / (p + 1), p + 1)}`, `∫xⁿdx = xⁿ⁺¹/(n + 1): ${show(a / (p + 1), p + 1)}`) };
    },
  },
  {
    id: 'm-exp-eq', subject: 'mathematics', grade: 11, topics: ['m11-exponential'], title: t('Показательное уравнение', 'Exponential equation'),
    make: (r) => {
      const a = pick(r, [2, 3, 5]);
      const m = int(r, 2, a === 2 ? 7 : 4);
      const k = int(r, -3, 4);
      const x = m - k;
      return { prompt: t(`Реши уравнение ${a}^(x ${sg(k)}) = ${a ** m}`, `Solve ${a}^(x ${sg(k)}) = ${a ** m}`), answer: x, wrong: [m + k === x ? x + 2 : m + k, round(a ** m / a, 2), m], solution: t(`${a ** m} = ${a}^${m}, значит x ${sg(k)} = ${m}, x = ${num(x)}`, `${a ** m} = ${a}^${m}, so x ${sg(k)} = ${m}, x = ${num(x)}`) };
    },
  },
  {
    id: 'm-log', subject: 'mathematics', grade: 11, topics: ['m11-logarithm', 'm11-log-equations'], title: t('Логарифмы', 'Logarithms'),
    make: (r) => {
      const a = pick(r, [2, 3, 5, 10]);
      const k = int(r, 2, a === 2 ? 7 : a === 10 ? 4 : 4);
      const kind = int(r, 0, 2);
      if (kind === 0) return { prompt: t(`Вычисли log${a === 10 ? '' : `_${a}`}${a === 10 ? ' (lg)' : ''} ${a ** k}`, `Work out log base ${a} of ${a ** k}`), answer: k, wrong: [a ** k / a, a * k, k + 1], solution: t(`${a}^${k} = ${a ** k}, значит логарифм равен ${k}`, `${a}^${k} = ${a ** k}, so the log is ${k}`) };
      if (kind === 1) return { prompt: t(`Реши уравнение log_${a} x = ${k}`, `Solve log base ${a} of x = ${k}`), answer: a ** k, wrong: [a * k, k ** a === a ** k ? a ** k + 1 : k ** a, a ** (k - 1)], solution: t(`x = ${a}^${k} = ${a ** k}`, `x = ${a}^${k} = ${a ** k}`) };
      const p = int(r, 1, 4);
      const q = int(r, 1, 3);
      return { prompt: t(`Вычисли log_${a} ${a ** p} + log_${a} ${a ** q}`, `Work out log_${a} ${a ** p} + log_${a} ${a ** q}`), answer: p + q, wrong: [p * q === p + q ? p + q + 1 : p * q, a ** (p + q), Math.abs(p - q) === p + q ? p + q + 2 : Math.abs(p - q)], solution: t(`Сумма логарифмов = логарифм произведения: log_${a} ${a ** (p + q)} = ${p + q}`, `Sum of logs = log of the product: ${p + q}`) };
    },
  },
  {
    id: 'm-solids', subject: 'mathematics', grade: 11, topics: ['m11-cylinder-cone', 'm11-volumes', 'm11-sphere'], title: t('Объёмы тел вращения', 'Volumes of round solids'),
    make: (r) => {
      const R = int(r, 1, 6);
      const h = 3 * int(r, 1, 4);
      const kind = int(r, 0, 2);
      const pi = (x: number) => `${x}π`;
      if (kind === 0) return { prompt: t(`Радиус основания цилиндра ${R}, высота ${h}. Найди объём.`, `A cylinder has radius ${R} and height ${h}. Find its volume.`), answer: pi(R * R * h), wrong: [pi(2 * R * h), pi((R * R * h) / 3), pi(R * h), pi(2 * R * R * h), pi(R * R * h + R * R)], solution: t(`V = πr²h = π · ${R * R} · ${h} = ${R * R * h}π`, `V = πr²h = ${R * R * h}π`) };
      if (kind === 1) return { prompt: t(`Радиус основания конуса ${R}, высота ${h}. Найди объём.`, `A cone has radius ${R} and height ${h}. Find its volume.`), answer: pi((R * R * h) / 3), wrong: [pi(R * R * h), pi((2 * R * h) / 3), pi((R * h) / 3), pi((2 * R * R * h) / 3), pi(R * R * h * 3)], solution: t(`V = ⅓πr²h = ⅓ · π · ${R * R} · ${h} = ${(R * R * h) / 3}π`, `V = ⅓πr²h = ${(R * R * h) / 3}π`) };
      const S = 3 * int(r, 1, 3);
      return { prompt: t(`Радиус шара ${S}. Найди его объём.`, `A ball has radius ${S}. Find its volume.`), answer: pi((4 * S ** 3) / 3), wrong: [pi(4 * S * S), pi(S ** 3), pi((4 * S * S) / 3), pi(4 * S ** 3), pi(2 * S ** 3)], solution: t(`V = 4/3 · πR³ = 4/3 · ${S ** 3}π = ${(4 * S ** 3) / 3}π`, `V = 4/3 πR³ = ${(4 * S ** 3) / 3}π`) };
    },
  },
  {
    id: 'm-space-dist', subject: 'mathematics', grade: 11, topics: ['m11-space-coords', 'm10-perpendicular-space', 'm10-parallel-space'], title: t('Расстояние в пространстве', 'Distance in space'),
    make: (r) => {
      const [a, b, c, d] = pick(r, [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]]);
      const x = int(r, -4, 4);
      const y = int(r, -4, 4);
      const z = int(r, -4, 4);
      return { prompt: t(`Найди расстояние между точками A(${num(x)}; ${num(y)}; ${num(z)}) и B(${num(x + a)}; ${num(y - b)}; ${num(z + c)}).`, `Find the distance between A(${num(x)}, ${num(y)}, ${num(z)}) and B(${num(x + a)}, ${num(y - b)}, ${num(z + c)}).`), answer: d, wrong: [a + b + c, d * d, round(Math.sqrt(a * a + b * b), 2)], solution: t(`AB = √(${a}² + ${b}² + ${c}²) = √${d * d} = ${d}`, `AB = √(${a * a} + ${b * b} + ${c * c}) = ${d}`) };
    },
  },
];
