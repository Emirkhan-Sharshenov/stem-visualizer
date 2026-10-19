import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';
import type { GraphId } from './ids';
import { Formula } from '../Formula';
import { useScreenDetail } from '../../lib/pageContext';

/* Interactive function graphs for the maths topics: sliders change the parameters, the graph and the facts update live. */

type Lang = 'ru' | 'en';
type P = Record<string, number>;

interface Slider {
  k: string;
  ru: string;
  en: string;
  min: number;
  max: number;
  step: number;
  v: number;
}
interface Draw {
  ctx: CanvasRenderingContext2D;
  X: (x: number) => number;
  Y: (y: number) => number;
  dpr: number;
  w: number;
  h: number;
  view: number[];
  curve: (f: (x: number) => number, color: string, width?: number, dash?: number[], from?: number, to?: number) => void;
  dot: (x: number, y: number, color: string, label?: string, r?: number) => void;
  seg: (x1: number, y1: number, x2: number, y2: number, color: string, dash?: number[], width?: number) => void;
  label: (x: number, y: number, text: string, color: string, dx?: number, dy?: number) => void;
}
interface Preset {
  view: [number, number, number, number];
  sliders: Slider[];
  tex: (p: P) => string;
  facts: (p: P, lang: Lang) => string[];
  draw: (d: Draw, p: P) => void;
  /** one-axis number line instead of a coordinate plane */
  line?: boolean;
}

const C1 = '#2F5BFF';
const C2 = '#E5484D';
const C3 = '#30A46C';
const C4 = '#8E4EC6';
const GREY = '#9AA0AA';

const n = (x: number, d = 2) => {
  if (!Number.isFinite(x)) return '—';
  const v = Math.round(x * 10 ** d) / 10 ** d;
  return String(Object.is(v, -0) ? 0 : v).replace('.', ',');
};
const sgn = (x: number) => (x < 0 ? `- ${n(-x)}` : `+ ${n(x)}`);
const L = (lang: Lang, ru: string, en: string) => (lang === 'ru' ? ru : en);
/** TeX polynomial in x without zero terms or unit coefficients */
const tpoly = (...cs: number[]) => {
  const deg = cs.length - 1;
  let out = '';
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const v = p === 0 ? '' : p === 1 ? 'x' : `x^{${p}}`;
    const m = Math.abs(c) === 1 && v ? '' : n(Math.abs(c));
    out += `${out ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''}${m}${v}`;
  });
  return out || '0';
};

/** zeros of f on [a, b] by sign changes and bisection, skipping the jumps of poles */
function rootsOf(f: (x: number) => number, a: number, b: number, steps = 600) {
  const out: number[] = [];
  let px = a;
  let py = f(a);
  for (let i = 1; i <= steps; i++) {
    const x = a + ((b - a) * i) / steps;
    const y = f(x);
    if (Number.isFinite(py) && Number.isFinite(y) && (y === 0 || py * y < 0)) {
      let lo = px;
      let hi = x;
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2;
        if (f(lo) * f(m) <= 0) hi = m;
        else lo = m;
      }
      const r = (lo + hi) / 2;
      if (Math.abs(f(r)) < 1e-3 * Math.max(1, Math.abs(py), Math.abs(y)) && !out.some((o) => Math.abs(o - r) < (b - a) / steps)) out.push(Math.abs(r) < 1e-9 ? 0 : r);
    }
    px = x;
    py = y;
  }
  return out;
}

const PRESETS: Record<GraphId, Preset> = {
  'number-line': {
    view: [-10, 10, -1, 1],
    line: true,
    sliders: [
      { k: 'a', ru: 'Число a', en: 'Number a', min: -9, max: 9, step: 0.5, v: -3 },
      { k: 'b', ru: 'Число b', en: 'Number b', min: -9, max: 9, step: 0.5, v: 5 },
    ],
    tex: (p) => `|${n(p.a)}| = ${n(Math.abs(p.a))}, \\quad ${n(p.a)} + (${n(p.b)}) = ${n(p.a + p.b)}`,
    facts: (p, lang) => [
      `${n(p.a)} ${p.a < p.b ? '<' : p.a > p.b ? '>' : '='} ${n(p.b)} — ${L(lang, 'правее то, что больше', 'the one further right is larger')}`,
      `${L(lang, 'Расстояние между ними', 'Distance between them')}: |a − b| = ${n(Math.abs(p.a - p.b))}`,
      `a · b = ${n(p.a * p.b)} (${p.a * p.b > 0 ? L(lang, 'знаки одинаковые → плюс', 'same signs → plus') : p.a * p.b < 0 ? L(lang, 'знаки разные → минус', 'different signs → minus') : '0'})`,
    ],
    draw: (d, p) => {
      d.seg(0, 0, p.a, 0, C1, [], 6);
      d.dot(p.a, 0, C1, `a = ${n(p.a)}`);
      d.dot(p.b, 0, C2, `b = ${n(p.b)}`);
      d.dot(p.a + p.b, 0, C3, `a + b`);
    },
  },
  proportional: {
    view: [-1, 10, -1, 10],
    sliders: [{ k: 'k', ru: 'Коэффициент k', en: 'Coefficient k', min: 0.5, max: 6, step: 0.5, v: 2 }],
    tex: (p) => `y = ${n(p.k)}x, \\quad y = \\frac{${n(p.k * 4)}}{x}`,
    facts: (p, lang) => [
      L(lang, `Прямая пропорциональность (синяя): x вдвое больше — y вдвое больше.`, 'Direct (blue): double x, double y.'),
      L(lang, `Обратная (красная): x вдвое больше — y вдвое меньше; x · y = ${n(p.k * 4)} всегда.`, `Inverse (red): double x, halve y; x · y = ${n(p.k * 4)} always.`),
    ],
    draw: (d, p) => {
      d.curve((x) => p.k * x, C1, 3);
      d.curve((x) => (p.k * 4) / x, C2, 3, [], 0.05, 10);
      d.dot(2, 2 * p.k, C1);
      d.dot(4, 4 * p.k, C1);
      d.dot(2, (p.k * 4) / 2, C2);
      d.dot(4, (p.k * 4) / 4, C2);
    },
  },
  linear: {
    view: [-8, 8, -6, 6],
    sliders: [
      { k: 'k', ru: 'Наклон k', en: 'Slope k', min: -4, max: 4, step: 0.25, v: 1 },
      { k: 'b', ru: 'Сдвиг b', en: 'Intercept b', min: -5, max: 5, step: 0.5, v: 2 },
    ],
    tex: (p) => `y = ${tpoly(p.k, p.b)}`,
    facts: (p, lang) => [
      p.k > 0 ? L(lang, 'k > 0 — функция возрастает', 'k > 0: increasing') : p.k < 0 ? L(lang, 'k < 0 — функция убывает', 'k < 0: decreasing') : L(lang, 'k = 0 — прямая горизонтальна', 'k = 0: a flat line'),
      `${L(lang, 'Пересечение с осью y', 'Crosses the y-axis')}: (0; ${n(p.b)})`,
      p.k !== 0 ? `${L(lang, 'Нуль функции', 'Zero')}: x = −b/k = ${n(-p.b / p.k)}` : '',
    ],
    draw: (d, p) => {
      d.curve((x) => p.k * x + p.b, C1, 3);
      d.dot(0, p.b, C2, `(0; ${n(p.b)})`);
      if (p.k !== 0) d.dot(-p.b / p.k, 0, C3, `x = ${n(-p.b / p.k)}`);
      // slope triangle
      d.seg(1, p.k + p.b, 2, p.k + p.b, GREY, [4, 4]);
      d.seg(2, p.k + p.b, 2, 2 * p.k + p.b, GREY, [4, 4]);
      d.label(2, 1.5 * p.k + p.b, `k = ${n(p.k)}`, GREY, 8);
    },
  },
  power: {
    view: [-3, 3, -4, 6],
    sliders: [{ k: 'p', ru: 'Показатель n', en: 'Exponent n', min: -2, max: 5, step: 1, v: 2 }],
    tex: (p) => `y = x^{${p.p}}`,
    facts: (p, lang) => [
      p.p % 2 === 0 ? L(lang, 'Чётная степень: график симметричен относительно оси y', 'Even power: symmetric about the y-axis') : L(lang, 'Нечётная степень: график симметричен относительно начала координат', 'Odd power: symmetric about the origin'),
      p.p < 0 ? L(lang, 'Отрицательный показатель: x⁻ⁿ = 1/xⁿ, при x = 0 не определена', 'Negative power: x⁻ⁿ = 1/xⁿ, undefined at 0') : p.p === 0 ? L(lang, 'x⁰ = 1 при x ≠ 0', 'x⁰ = 1 for x ≠ 0') : L(lang, 'Чем больше n, тем быстрее растёт функция при |x| > 1', 'The larger n, the faster it grows for |x| > 1'),
    ],
    draw: (d, p) => {
      d.curve((x) => x ** 2, GREY, 1, [4, 4]);
      if (p.p < 0) {
        d.curve((x) => x ** p.p, C1, 3, [], -3, -0.05);
        d.curve((x) => x ** p.p, C1, 3, [], 0.05, 3);
      } else d.curve((x) => x ** p.p, C1, 3);
      d.dot(1, 1, C2, '(1; 1)');
    },
  },
  system: {
    view: [-8, 8, -6, 6],
    sliders: [
      { k: 'k1', ru: 'k₁', en: 'k₁', min: -3, max: 3, step: 0.25, v: 1 },
      { k: 'b1', ru: 'b₁', en: 'b₁', min: -5, max: 5, step: 0.5, v: -1 },
      { k: 'k2', ru: 'k₂', en: 'k₂', min: -3, max: 3, step: 0.25, v: -0.5 },
      { k: 'b2', ru: 'b₂', en: 'b₂', min: -5, max: 5, step: 0.5, v: 2 },
    ],
    tex: (p) => `\\begin{cases} y = ${tpoly(p.k1, p.b1)} \\\\ y = ${tpoly(p.k2, p.b2)} \\end{cases}`,
    facts: (p, lang) => {
      if (p.k1 === p.k2) return [p.b1 === p.b2 ? L(lang, 'Прямые совпадают — решений бесконечно много', 'Same line: infinitely many solutions') : L(lang, 'Прямые параллельны — решений нет', 'Parallel lines: no solution')];
      const x = (p.b2 - p.b1) / (p.k1 - p.k2);
      return [`${L(lang, 'Одно решение', 'One solution')}: x = ${n(x)}, y = ${n(p.k1 * x + p.b1)}`, L(lang, 'Это точка пересечения прямых.', 'It is where the lines cross.')];
    },
    draw: (d, p) => {
      d.curve((x) => p.k1 * x + p.b1, C1, 3);
      d.curve((x) => p.k2 * x + p.b2, C2, 3);
      if (p.k1 !== p.k2) {
        const x = (p.b2 - p.b1) / (p.k1 - p.k2);
        d.dot(x, p.k1 * x + p.b1, C3, `(${n(x)}; ${n(p.k1 * x + p.b1)})`, 7);
      }
    },
  },
  hyperbola: {
    view: [-8, 8, -6, 6],
    sliders: [
      { k: 'k', ru: 'k', en: 'k', min: -6, max: 6, step: 0.5, v: 3 },
      { k: 'a', ru: 'Сдвиг вправо a', en: 'Shift right a', min: -4, max: 4, step: 0.5, v: 0 },
      { k: 'b', ru: 'Сдвиг вверх b', en: 'Shift up b', min: -4, max: 4, step: 0.5, v: 0 },
    ],
    tex: (p) => `y = \\frac{${n(p.k)}}{x ${sgn(-p.a)}} ${sgn(p.b)}`,
    facts: (p, lang) => [
      `${L(lang, 'Асимптоты', 'Asymptotes')}: x = ${n(p.a)}, y = ${n(p.b)}`,
      p.k > 0 ? L(lang, 'k > 0: ветви в I и III четвертях (относительно асимптот)', 'k > 0: branches in quadrants I and III') : L(lang, 'k < 0: ветви во II и IV четвертях', 'k < 0: branches in II and IV'),
      `${L(lang, 'Нельзя подставлять', 'Not allowed')}: x = ${n(p.a)}`,
    ],
    draw: (d, p) => {
      d.seg(p.a, d.view[2], p.a, d.view[3], GREY, [6, 5]);
      d.seg(d.view[0], p.b, d.view[1], p.b, GREY, [6, 5]);
      if (p.k !== 0) {
        d.curve((x) => p.k / (x - p.a) + p.b, C1, 3, [], d.view[0], p.a - 0.02);
        d.curve((x) => p.k / (x - p.a) + p.b, C1, 3, [], p.a + 0.02, d.view[1]);
      }
    },
  },
  sqrt: {
    view: [-2, 12, -2, 6],
    sliders: [
      { k: 'a', ru: 'Множитель a', en: 'Factor a', min: 0.5, max: 3, step: 0.25, v: 1 },
      { k: 'm', ru: 'Сдвиг вправо', en: 'Shift right', min: -2, max: 4, step: 0.5, v: 0 },
    ],
    tex: (p) => `y = ${n(p.a)}\\sqrt{x ${sgn(-p.m)}}`,
    facts: (p, lang) => [`${L(lang, 'Область определения', 'Domain')}: x ≥ ${n(p.m)}`, L(lang, 'Это половинка параболы y² = x, лежащей на боку.', 'Half of the parabola y² = x lying on its side.'), `√9 = 3, √4 = 2: ${L(lang, 'точки (9; 3) и (4; 2) при a = 1, сдвиге 0', 'points (9, 3) and (4, 2) when a = 1, no shift')}`],
    draw: (d, p) => {
      d.curve((x) => x * x, GREY, 1, [4, 4], 0, 3);
      d.curve((x) => (x >= p.m ? p.a * Math.sqrt(x - p.m) : NaN), C1, 3, [], p.m, d.view[1]);
      d.dot(p.m, 0, C2, `x = ${n(p.m)}`);
    },
  },
  quadratic: {
    view: [-7, 7, -8, 8],
    sliders: [
      { k: 'a', ru: 'a', en: 'a', min: -3, max: 3, step: 0.25, v: 1 },
      { k: 'b', ru: 'b', en: 'b', min: -6, max: 6, step: 0.5, v: -2 },
      { k: 'c', ru: 'c', en: 'c', min: -6, max: 6, step: 0.5, v: -3 },
    ],
    tex: (p) => `y = ${tpoly(p.a, p.b, p.c)}`,
    facts: (p, lang) => {
      if (p.a === 0) return [L(lang, 'При a = 0 это уже не парабола, а прямая', 'With a = 0 it is a line, not a parabola')];
      const D = p.b * p.b - 4 * p.a * p.c;
      const x0 = -p.b / (2 * p.a);
      const roots = D > 0 ? `x₁ = ${n((-p.b - Math.sqrt(D)) / (2 * p.a))}, x₂ = ${n((-p.b + Math.sqrt(D)) / (2 * p.a))}` : D === 0 ? `x = ${n(x0)}` : L(lang, 'корней нет', 'no real roots');
      return [`D = b² − 4ac = ${n(D)} → ${roots}`, `${L(lang, 'Вершина', 'Vertex')}: (${n(x0)}; ${n(p.a * x0 * x0 + p.b * x0 + p.c)})`, p.a > 0 ? L(lang, 'a > 0: ветви вверх', 'a > 0: opens up') : L(lang, 'a < 0: ветви вниз', 'a < 0: opens down')];
    },
    draw: (d, p) => {
      const f = (x: number) => p.a * x * x + p.b * x + p.c;
      if (p.a !== 0) {
        const x0 = -p.b / (2 * p.a);
        d.seg(x0, d.view[2], x0, d.view[3], GREY, [5, 5]);
        d.dot(x0, f(x0), C4, undefined, 7);
        const D = p.b * p.b - 4 * p.a * p.c;
        if (D >= 0) {
          d.dot((-p.b - Math.sqrt(D)) / (2 * p.a), 0, C2, undefined, 6);
          d.dot((-p.b + Math.sqrt(D)) / (2 * p.a), 0, C2, undefined, 6);
        }
      }
      d.curve(f, C1, 3);
      d.dot(0, p.c, C3, `c = ${n(p.c)}`);
    },
  },
  inequality: {
    view: [-7, 7, -8, 8],
    sliders: [
      { k: 'x1', ru: 'Корень x₁', en: 'Root x₁', min: -5, max: 5, step: 0.5, v: -2 },
      { k: 'x2', ru: 'Корень x₂', en: 'Root x₂', min: -5, max: 5, step: 0.5, v: 3 },
      { k: 's', ru: 'Знак: 1 — «< 0», 2 — «> 0»', en: 'Sign: 1 is “< 0”, 2 is “> 0”', min: 1, max: 2, step: 1, v: 1 },
    ],
    tex: (p) => `(x ${sgn(-p.x1)})(x ${sgn(-p.x2)}) ${p.s === 1 ? '<' : '>'} 0`,
    facts: (p, lang) => {
      const lo = Math.min(p.x1, p.x2);
      const hi = Math.max(p.x1, p.x2);
      if (lo === hi) return [p.s === 1 ? L(lang, 'Решений нет: квадрат не бывает отрицательным', 'No solution: a square is never negative') : `x ≠ ${n(lo)}`];
      return [p.s === 1 ? `${L(lang, 'Ответ', 'Answer')}: ${n(lo)} < x < ${n(hi)}` : `${L(lang, 'Ответ', 'Answer')}: x < ${n(lo)} ${L(lang, 'или', 'or')} x > ${n(hi)}`, L(lang, 'Зелёным отмечено, где парабола ниже/выше оси x.', 'Green marks where the parabola is below/above the axis.')];
    },
    draw: (d, p) => {
      const f = (x: number) => (x - p.x1) * (x - p.x2);
      // shade the solution on the x-axis
      const step = (d.view[1] - d.view[0]) / 400;
      for (let x = d.view[0]; x < d.view[1]; x += step) {
        const ok = p.s === 1 ? f(x) < 0 : f(x) > 0;
        if (ok) d.seg(x, 0, x + step, 0, C3, [], 8);
      }
      d.curve(f, C1, 3);
      d.dot(p.x1, 0, C2, `x₁`, 6);
      d.dot(p.x2, 0, C2, `x₂`, 6);
    },
  },
  sequence: {
    view: [0, 11, -2, 30],
    sliders: [
      { k: 'g', ru: 'Тип: 1 — арифметическая, 2 — геометрическая', en: 'Type: 1 arithmetic, 2 geometric', min: 1, max: 2, step: 1, v: 1 },
      { k: 'a1', ru: 'Первый член', en: 'First term', min: 1, max: 8, step: 1, v: 2 },
      { k: 'd', ru: 'Разность d / знаменатель q', en: 'Difference d / ratio q', min: 0.5, max: 4, step: 0.5, v: 2 },
      { k: 'n', ru: 'Число членов n', en: 'Number of terms n', min: 2, max: 10, step: 1, v: 6 },
    ],
    tex: (p) => (p.g === 1 ? `a_n = ${p.a1} + (n - 1)\\cdot ${n(p.d)}` : `b_n = ${p.a1} \\cdot ${n(p.d)}^{\\,n-1}`),
    facts: (p, lang) => {
      const terms = Array.from({ length: p.n }, (_, i) => (p.g === 1 ? p.a1 + i * p.d : p.a1 * p.d ** i));
      return [`${terms.map((t) => n(t)).join('; ')}`, `S${p.n} = ${n(terms.reduce((s, t) => s + t, 0))}`, p.g === 1 ? L(lang, 'Точки лежат на прямой — арифметическая прогрессия растёт равномерно.', 'The dots lie on a line: arithmetic growth is steady.') : L(lang, 'Точки лежат на показательной кривой — рост ускоряется.', 'The dots follow an exponential curve: growth speeds up.')];
    },
    draw: (d, p) => {
      const term = (i: number) => (p.g === 1 ? p.a1 + (i - 1) * p.d : p.a1 * p.d ** (i - 1));
      d.curve((x) => term(x), GREY, 1, [4, 4], 1, p.n);
      for (let i = 1; i <= p.n; i++) {
        d.seg(i, 0, i, term(i), p.g === 1 ? C1 : C4, [], 10);
        d.dot(i, term(i), C2, i === p.n ? `a${i} = ${n(term(i))}` : undefined, 5);
      }
    },
  },
  dice: { view: [0, 7, 0, 0.4], sliders: [], tex: () => 'P(A) = \\frac{m}{n}', facts: () => [], draw: () => {} },
  sin: {
    view: [-7, 7, -4, 4],
    sliders: [
      { k: 'A', ru: 'Амплитуда A', en: 'Amplitude A', min: 0.5, max: 3, step: 0.25, v: 1.5 },
      { k: 'w', ru: 'Частота ω', en: 'Frequency ω', min: 0.5, max: 4, step: 0.25, v: 1 },
      { k: 'f', ru: 'Сдвиг фазы φ', en: 'Phase φ', min: -3.14, max: 3.14, step: 0.1, v: 0 },
    ],
    tex: (p) => `y = ${n(p.A)}\\sin(${n(p.w)}x ${sgn(p.f)})`,
    facts: (p, lang) => [`${L(lang, 'Период', 'Period')} T = 2π/ω ≈ ${n((2 * Math.PI) / p.w)}`, `${L(lang, 'Значения от', 'Values from')} −${n(p.A)} ${L(lang, 'до', 'to')} ${n(p.A)}`, L(lang, 'Серым — y = sin x для сравнения, пунктир — y = cos x.', 'Grey: y = sin x for comparison; dashed: y = cos x.')],
    draw: (d, p) => {
      d.curve(Math.sin, GREY, 1.5);
      d.curve(Math.cos, GREY, 1, [4, 4]);
      d.curve((x) => p.A * Math.sin(p.w * x + p.f), C1, 3);
      for (const k of [-2, -1, 1, 2]) d.label(k * Math.PI, 0, `${k > 0 ? '' : '−'}${Math.abs(k) === 1 ? '' : Math.abs(k)}π`, GREY, -8, 16);
    },
  },
  tangent: {
    view: [-3.5, 3.5, -3, 3],
    sliders: [{ k: 'x0', ru: 'Точка касания x₀', en: 'Tangent point x₀', min: -2.5, max: 2.5, step: 0.05, v: 1.5 }],
    tex: (p) => `f(x) = \\frac{x^3}{3} - x, \\quad f'(${n(p.x0)}) = ${n(p.x0 * p.x0 - 1)}`,
    facts: (p, lang) => {
      const k = p.x0 * p.x0 - 1;
      return [`f′(x) = x² − 1`, `${L(lang, 'Наклон касательной', 'Tangent slope')}: ${n(k)} → ${k > 0.001 ? L(lang, 'функция растёт', 'rising') : k < -0.001 ? L(lang, 'функция убывает', 'falling') : L(lang, 'горизонтальная касательная — экстремум!', 'flat tangent: an extremum!')}`, L(lang, 'Зелёная кривая — график производной.', 'The green curve is the derivative.')];
    },
    draw: (d, p) => {
      const f = (x: number) => x ** 3 / 3 - x;
      const k = p.x0 * p.x0 - 1;
      d.curve((x) => x * x - 1, C3, 1.5, [5, 4]);
      d.curve(f, C1, 3);
      d.curve((x) => f(p.x0) + k * (x - p.x0), C2, 2);
      d.dot(p.x0, f(p.x0), C2, `x₀`, 6);
      d.dot(-1, f(-1), C4, 'max', 5);
      d.dot(1, f(1), C4, 'min', 5);
    },
  },
  integral: {
    view: [-0.5, 4, -0.5, 9],
    sliders: [
      { k: 'a', ru: 'От a', en: 'From a', min: 0, max: 3, step: 0.1, v: 0 },
      { k: 'b', ru: 'До b', en: 'To b', min: 0.5, max: 3, step: 0.1, v: 2 },
      { k: 'nn', ru: 'Прямоугольников', en: 'Rectangles', min: 2, max: 40, step: 1, v: 8 },
    ],
    tex: (p) => `\\int_{${n(p.a)}}^{${n(p.b)}} x^2\\,dx = \\frac{b^3 - a^3}{3} = ${n((p.b ** 3 - p.a ** 3) / 3)}`,
    facts: (p, lang) => {
      const dx = (p.b - p.a) / p.nn;
      let s = 0;
      for (let i = 0; i < p.nn; i++) s += (p.a + (i + 0.5) * dx) ** 2 * dx;
      return [`${L(lang, 'Сумма прямоугольников', 'Rectangle sum')}: ${n(s, 3)}`, `${L(lang, 'Точно', 'Exact')}: ${n((p.b ** 3 - p.a ** 3) / 3, 3)}`, L(lang, 'Чем больше прямоугольников, тем точнее — в пределе это и есть интеграл.', 'More rectangles give a better match; in the limit it is the integral.')];
    },
    draw: (d, p) => {
      const lo = Math.min(p.a, p.b);
      const hi = Math.max(p.a, p.b);
      const dx = (hi - lo) / p.nn;
      d.ctx.fillStyle = 'rgba(47,91,255,0.18)';
      d.ctx.strokeStyle = 'rgba(47,91,255,0.55)';
      d.ctx.lineWidth = d.dpr;
      for (let i = 0; i < p.nn; i++) {
        const x = lo + i * dx;
        const y = (x + dx / 2) ** 2;
        d.ctx.fillRect(d.X(x), d.Y(y), d.X(x + dx) - d.X(x), d.Y(0) - d.Y(y));
        d.ctx.strokeRect(d.X(x), d.Y(y), d.X(x + dx) - d.X(x), d.Y(0) - d.Y(y));
      }
      d.curve((x) => x * x, C2, 3);
    },
  },
  exp: {
    view: [-4, 4, -1, 9],
    sliders: [{ k: 'a', ru: 'Основание a', en: 'Base a', min: 0.2, max: 4, step: 0.1, v: 2 }],
    tex: (p) => `y = ${n(p.a)}^{\\,x}`,
    facts: (p, lang) => [Math.abs(p.a - 1) < 0.01 ? L(lang, 'При a = 1 это прямая y = 1', 'With a = 1 it is just y = 1') : p.a > 1 ? L(lang, 'a > 1 — функция возрастает', 'a > 1: increasing') : L(lang, '0 < a < 1 — функция убывает', '0 < a < 1: decreasing'), L(lang, 'Проходит через (0; 1), всегда выше оси x', 'Passes through (0, 1) and never touches the x-axis'), `a³ = ${n(p.a ** 3)}`],
    draw: (d, p) => {
      d.curve((x) => 2 ** x, GREY, 1, [4, 4]);
      d.curve((x) => p.a ** x, C1, 3);
      d.dot(0, 1, C2, '(0; 1)');
      d.dot(1, p.a, C3, `(1; ${n(p.a)})`);
    },
  },
  log: {
    view: [-2, 9, -4, 6],
    sliders: [{ k: 'a', ru: 'Основание a', en: 'Base a', min: 0.3, max: 4, step: 0.1, v: 2 }],
    tex: (p) => `y = \\log_{${n(p.a)}} x`,
    facts: (p, lang) => [L(lang, 'Определена только при x > 0, проходит через (1; 0)', 'Defined for x > 0 only, passes through (1, 0)'), L(lang, 'Пунктир — показательная функция; графики симметричны относительно y = x', 'Dashed: the exponential; the graphs mirror in y = x'), Math.abs(p.a - 1) > 0.01 ? `log(8) = ${n(Math.log(8) / Math.log(p.a))}` : ''],
    draw: (d, p) => {
      if (Math.abs(p.a - 1) < 0.01) return;
      d.curve((x) => x, GREY, 1, [3, 5]);
      d.curve((x) => p.a ** x, C4, 1.5, [6, 4]);
      d.curve((x) => Math.log(x) / Math.log(p.a), C1, 3, [], 0.01, d.view[1]);
      d.dot(1, 0, C2, '(1; 0)');
      d.dot(p.a, 1, C3, `(${n(p.a)}; 1)`);
    },
  },
  abs: {
    view: [-7, 7, -4, 8],
    sliders: [
      { k: 'm', ru: 'Вид: 1 — a|x − b| + c, 2 — |x² − q|', en: 'Type: 1 a|x − b| + c, 2 |x² − q|', min: 1, max: 2, step: 1, v: 1 },
      { k: 'a', ru: 'a', en: 'a', min: -3, max: 3, step: 0.5, v: 1 },
      { k: 'b', ru: 'b (сдвиг вправо)', en: 'b (shift right)', min: -4, max: 4, step: 0.5, v: 1 },
      { k: 'c', ru: 'c (сдвиг вверх) / q', en: 'c (shift up) / q', min: -3, max: 6, step: 0.5, v: -2 },
    ],
    tex: (p) => (p.m === 1 ? `y = ${n(p.a)}\\,|x ${sgn(-p.b)}| ${sgn(p.c)}` : `y = |x^2 ${sgn(-p.c)}|`),
    facts: (p, lang) => {
      if (p.m === 2) return [L(lang, 'Модуль отражает вверх всё, что было ниже оси x: «галочки» вместо ям.', 'The modulus flips everything below the x-axis upwards.'), p.c > 0 ? `${L(lang, 'Нули', 'Zeros')}: x = ±${n(Math.sqrt(p.c))}` : L(lang, 'Нулей нет, кроме x = 0 при q = 0', 'No zeros except x = 0 when q = 0')];
      const zs = p.a !== 0 && -p.c / p.a >= 0 ? [p.b - -p.c / p.a, p.b + -p.c / p.a] : [];
      return [`${L(lang, 'Вершина «уголка»', 'Corner')}: (${n(p.b)}; ${n(p.c)})`, p.a > 0 ? L(lang, 'a > 0: ветви вверх', 'a > 0: opens up') : p.a < 0 ? L(lang, 'a < 0: ветви вниз', 'a < 0: opens down') : L(lang, 'a = 0: прямая', 'a = 0: a line'), zs.length ? `${L(lang, 'Нули', 'Zeros')}: x = ${n(zs[0])}${zs[0] !== zs[1] ? ` ${L(lang, 'и', 'and')} ${n(zs[1])}` : ''}` : L(lang, 'Нулей нет', 'No zeros'), L(lang, '|x| = x при x ≥ 0 и −x при x < 0.', '|x| is x for x ≥ 0 and −x for x < 0.')];
    },
    draw: (d, p) => {
      if (p.m === 1) {
        d.curve((x) => Math.abs(x), GREY, 1, [4, 4]);
        d.curve((x) => p.a * Math.abs(x - p.b) + p.c, C1, 3);
        d.dot(p.b, p.c, C2, `(${n(p.b)}; ${n(p.c)})`);
      } else {
        d.curve((x) => x * x - p.c, GREY, 1.5, [5, 5]);
        d.curve((x) => Math.abs(x * x - p.c), C1, 3);
      }
    },
  },
  transform: {
    view: [-7, 7, -5, 7],
    sliders: [
      { k: 'f', ru: 'Функция: 1 x², 2 √x, 3 |x|, 4 1/x, 5 sin x', en: 'Base: 1 x², 2 √x, 3 |x|, 4 1/x, 5 sin x', min: 1, max: 5, step: 1, v: 1 },
      { k: 'k', ru: 'Растяжение k', en: 'Stretch k', min: -3, max: 3, step: 0.5, v: 1 },
      { k: 'm', ru: 'Сдвиг вправо m', en: 'Shift right m', min: -4, max: 4, step: 0.5, v: 2 },
      { k: 'q', ru: 'Сдвиг вверх n', en: 'Shift up n', min: -4, max: 4, step: 0.5, v: -1 },
    ],
    tex: (p) => {
      const base = ['x^2', '\\sqrt{x}', '|x|', '\\frac{1}{x}', '\\sin x'][p.f - 1];
      const inner = p.m === 0 ? base : base.replace(/x/g, `(x ${sgn(-p.m)})`);
      return `y = ${p.k === 1 ? '' : p.k === -1 ? '-' : n(p.k)}${inner} ${p.q ? sgn(p.q) : ''}`;
    },
    facts: (p, lang) => [L(lang, `f(x − m): график сдвигается на ${n(p.m)} вправо (минус в скобке — вправо!).`, `f(x − m) moves the graph ${n(p.m)} to the right.`), L(lang, `+ n: сдвиг на ${n(p.q)} вверх.`, `+ n moves it ${n(p.q)} up.`), p.k < 0 ? L(lang, 'k < 0: график отражается относительно оси x.', 'k < 0 mirrors the graph in the x-axis.') : L(lang, `k = ${n(p.k)}: растяжение от оси x.`, `k = ${n(p.k)} stretches from the x-axis.`), L(lang, 'Серым — исходный график.', 'Grey: the original graph.')],
    draw: (d, p) => {
      const F = [(x: number) => x * x, (x: number) => (x >= 0 ? Math.sqrt(x) : NaN), Math.abs, (x: number) => 1 / x, Math.sin][p.f - 1];
      const g = (x: number) => p.k * F(x - p.m) + p.q;
      if (p.f === 4) {
        d.curve(F, GREY, 1.5, [5, 4], d.view[0], -0.02);
        d.curve(F, GREY, 1.5, [5, 4], 0.02, d.view[1]);
        d.curve(g, C1, 3, [], d.view[0], p.m - 0.02);
        d.curve(g, C1, 3, [], p.m + 0.02, d.view[1]);
      } else {
        d.curve(F, GREY, 1.5, [5, 4]);
        d.curve(g, C1, 3);
      }
      if (p.f !== 4 && p.f !== 5) d.dot(p.m, p.q, C2);
    },
  },
  cubic: {
    view: [-5, 5, -8, 8],
    sliders: [
      { k: 't', ru: 'Вид: 1 — ax³ + bx² + cx + d, 2 — x⁴ + bx² + d', en: 'Type: 1 cubic, 2 biquadratic x⁴ + bx² + d', min: 1, max: 2, step: 1, v: 1 },
      { k: 'a', ru: 'a', en: 'a', min: -2, max: 2, step: 0.25, v: 1 },
      { k: 'b', ru: 'b', en: 'b', min: -6, max: 6, step: 0.5, v: 0 },
      { k: 'c', ru: 'c', en: 'c', min: -6, max: 6, step: 0.5, v: -3 },
      { k: 'd', ru: 'd', en: 'd', min: -6, max: 6, step: 0.5, v: 0 },
    ],
    tex: (p) => (p.t === 1 ? `y = ${tpoly(p.a, p.b, p.c, p.d)}` : `y = ${tpoly(1, 0, p.b, 0, p.d)}`),
    facts: (p, lang) => {
      const f = p.t === 1 ? (x: number) => ((p.a * x + p.b) * x + p.c) * x + p.d : (x: number) => x ** 4 + p.b * x * x + p.d;
      const rs = rootsOf(f, -6, 6);
      const ex = rootsOf((x) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4, -6, 6);
      const out = [`${L(lang, 'Корни', 'Roots')}: ${rs.length ? rs.map((r) => n(r)).join('; ') : L(lang, 'нет', 'none')}`, `${L(lang, 'Точки экстремума', 'Turning points')}: ${ex.length ? ex.map((r) => `${n(r)}`).join('; ') : L(lang, 'нет', 'none')}`];
      const whole = rs.find((r) => Math.abs(r - Math.round(r)) < 1e-6 && Math.round(r) !== 0);
      if (p.t === 1 && whole !== undefined) out.push(L(lang, `Безу: P(${Math.round(whole)}) = 0, значит P(x) делится на (x ${sgn(-Math.round(whole))}).`, `Bezout: P(${Math.round(whole)}) = 0, so P(x) divides by (x ${sgn(-Math.round(whole))}).`));
      if (p.t === 2) out.push(L(lang, 'Замена t = x² сводит уравнение к квадратному: t² + bt + d = 0.', 'Put t = x²: it becomes t² + bt + d = 0.'));
      return out;
    },
    draw: (d, p) => {
      const f = p.t === 1 ? (x: number) => ((p.a * x + p.b) * x + p.c) * x + p.d : (x: number) => x ** 4 + p.b * x * x + p.d;
      d.curve(f, C1, 3);
      rootsOf(f, -6, 6).forEach((r) => d.dot(r, 0, C2));
      rootsOf((x) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4, -6, 6).forEach((r) => d.dot(r, f(r), C4));
    },
  },
  region: {
    view: [-7, 7, -6, 6],
    sliders: [
      { k: 'k1', ru: 'Прямая 1: наклон', en: 'Line 1: slope', min: -3, max: 3, step: 0.5, v: 1 },
      { k: 'b1', ru: 'Прямая 1: сдвиг', en: 'Line 1: intercept', min: -5, max: 5, step: 0.5, v: -1 },
      { k: 'k2', ru: 'Прямая 2: наклон', en: 'Line 2: slope', min: -3, max: 3, step: 0.5, v: -0.5 },
      { k: 'b2', ru: 'Прямая 2: сдвиг', en: 'Line 2: intercept', min: -5, max: 5, step: 0.5, v: 3 },
      { k: 'r', ru: 'Круг x² + y² ≤ r² (0 — нет)', en: 'Disc x² + y² ≤ r² (0 = off)', min: 0, max: 6, step: 0.5, v: 0 },
    ],
    tex: (p) => `\\begin{cases} y \\ge ${tpoly(p.k1, p.b1)} \\\\ y \\le ${tpoly(p.k2, p.b2)}${p.r ? ` \\\\ x^2 + y^2 \\le ${n(p.r * p.r)}` : ''} \\end{cases}`,
    facts: (p, lang) => [L(lang, 'Решение системы — область, где выполняются все неравенства сразу (закрашена).', 'The solution is the shaded area where every inequality holds.'), L(lang, '«y ≥ …» — всё выше прямой, «y ≤ …» — всё ниже. Граница входит, потому что знак нестрогий.', '“y ≥” is above the line, “y ≤” below; the border counts since the sign is not strict.'), p.k1 === p.k2 ? (p.b1 <= p.b2 ? L(lang, 'Прямые параллельны: решение — полоса между ними.', 'Parallel lines: the solution is the strip between them.') : L(lang, 'Прямые параллельны и «смотрят» в разные стороны: решений нет.', 'Parallel and facing apart: no solutions.')) : ''],
    draw: (d, p) => {
      const ctx = d.ctx;
      ctx.fillStyle = 'rgba(47,91,255,0.18)';
      const step = (d.view[1] - d.view[0]) / 300;
      for (let x = d.view[0]; x < d.view[1]; x += step) {
        let lo = Math.max(d.view[2], p.k1 * x + p.b1);
        let hi = Math.min(d.view[3], p.k2 * x + p.b2);
        if (p.r) {
          if (Math.abs(x) > p.r) continue;
          const yc = Math.sqrt(p.r * p.r - x * x);
          lo = Math.max(lo, -yc);
          hi = Math.min(hi, yc);
        }
        if (hi > lo) ctx.fillRect(d.X(x), d.Y(hi), d.X(x + step) - d.X(x) + 0.5, d.Y(lo) - d.Y(hi));
      }
      d.curve((x) => p.k1 * x + p.b1, C2, 2.5);
      d.curve((x) => p.k2 * x + p.b2, C3, 2.5);
      if (p.r) {
        d.curve((x) => Math.sqrt(p.r * p.r - x * x), C4, 2, [], -p.r, p.r);
        d.curve((x) => -Math.sqrt(p.r * p.r - x * x), C4, 2, [], -p.r, p.r);
      }
    },
  },
  stats: {
    view: [0, 7.5, -0.5, 11],
    sliders: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((dd, i) => ({ k: `v${i}`, ru: `${L('ru', 'Значение', '')} ${i + 1} (${dd})`, en: `Value ${i + 1}`, min: 0, max: 10, step: 1, v: [4, 7, 5, 9, 5, 6][i] })),
    tex: (p) => {
      const v = [0, 1, 2, 3, 4, 5].map((i) => p[`v${i}`]);
      return `\\bar{x} = \\frac{${v.join(' + ')}}{6} = ${n(v.reduce((a, b) => a + b, 0) / 6)}`;
    },
    facts: (p, lang) => {
      const v = [0, 1, 2, 3, 4, 5].map((i) => p[`v${i}`]);
      const s = [...v].sort((a, b) => a - b);
      const mean = v.reduce((a, b) => a + b, 0) / 6;
      const cnt: Record<number, number> = {};
      v.forEach((x) => (cnt[x] = (cnt[x] ?? 0) + 1));
      const top = Math.max(...Object.values(cnt));
      const mode = Object.keys(cnt).filter((k) => cnt[Number(k)] === top).join(', ');
      const disp = v.reduce((a, x) => a + (x - mean) ** 2, 0) / 6;
      return [`${L(lang, 'Среднее', 'Mean')} = ${n(mean)} (${L(lang, 'красная линия', 'red line')})`, `${L(lang, 'Медиана', 'Median')} = (${s[2]} + ${s[3]}) / 2 = ${n((s[2] + s[3]) / 2)} (${L(lang, 'зелёная', 'green')})`, `${L(lang, 'Мода', 'Mode')}: ${top > 1 ? mode : L(lang, 'нет, все значения разные', 'none, all differ')}`, `${L(lang, 'Размах', 'Range')} = ${s[5]} − ${s[0]} = ${s[5] - s[0]}; ${L(lang, 'дисперсия', 'variance')} = ${n(disp)}, σ = ${n(Math.sqrt(disp))}`];
    },
    draw: (d, p) => {
      const v = [0, 1, 2, 3, 4, 5].map((i) => p[`v${i}`]);
      const ctx = d.ctx;
      v.forEach((y, i) => {
        const x = i + 1;
        ctx.fillStyle = 'rgba(142,78,198,0.75)';
        ctx.fillRect(d.X(x - 0.35), d.Y(y), d.X(x + 0.35) - d.X(x - 0.35), d.Y(0) - d.Y(y));
        d.label(x - 0.12, y, String(y), C4, 0, -6);
      });
      const mean = v.reduce((a, b) => a + b, 0) / 6;
      const s = [...v].sort((a, b) => a - b);
      d.seg(0.3, mean, 7.2, mean, C2, [6, 4], 2.5);
      d.seg(0.3, (s[2] + s[3]) / 2, 7.2, (s[2] + s[3]) / 2, C3, [2, 4], 2.5);
    },
  },
  inverse: {
    view: [-4, 7, -3, 7],
    sliders: [
      { k: 'f', ru: 'Функция: 1 — 2x + 1, 2 — x² (x ≥ 0), 3 — eˣ, 4 — x³', en: 'f: 1 2x + 1, 2 x² (x ≥ 0), 3 eˣ, 4 x³', min: 1, max: 4, step: 1, v: 2 },
      { k: 't', ru: 'Точка на графике', en: 'Point on the graph', min: -2, max: 2.5, step: 0.05, v: 1.5 },
    ],
    tex: (p) => ['f(x) = 2x + 1, \\; f^{-1}(x) = \\frac{x - 1}{2}', 'f(x) = x^2, \\; f^{-1}(x) = \\sqrt{x}', 'f(x) = e^{x}, \\; f^{-1}(x) = \\ln x', 'f(x) = x^3, \\; f^{-1}(x) = \\sqrt[3]{x}'][p.f - 1],
    facts: (p, lang) => {
      const F = [(x: number) => 2 * x + 1, (x: number) => x * x, Math.exp, (x: number) => x ** 3][p.f - 1];
      const t = p.f === 2 ? Math.abs(p.t) : p.t;
      return [L(lang, 'Графики f и f⁻¹ симметричны относительно прямой y = x (пунктир).', 'f and f⁻¹ mirror each other in y = x (dashed).'), `${L(lang, 'Точка', 'Point')} (${n(t)}; ${n(F(t))}) ${L(lang, 'на f ↔ точка', 'on f ↔ point')} (${n(F(t))}; ${n(t)}) ${L(lang, 'на f⁻¹', 'on f⁻¹')}`, L(lang, 'Обратная есть только у монотонной функции: поэтому для x² берём x ≥ 0.', 'Only a monotonic function has an inverse, so x² is taken for x ≥ 0.')];
    },
    draw: (d, p) => {
      const F = [(x: number) => 2 * x + 1, (x: number) => (x >= 0 ? x * x : NaN), Math.exp, (x: number) => x ** 3][p.f - 1];
      const G = [(x: number) => (x - 1) / 2, (x: number) => (x >= 0 ? Math.sqrt(x) : NaN), (x: number) => (x > 0 ? Math.log(x) : NaN), Math.cbrt][p.f - 1];
      d.curve((x) => x, GREY, 1.5, [5, 5]);
      d.curve(F, C1, 3);
      d.curve(G, C2, 3, [], p.f === 3 ? 0.01 : d.view[0]);
      const t = p.f === 2 ? Math.abs(p.t) : p.t;
      d.seg(t, F(t), F(t), t, GREY, [3, 4], 1.5);
      d.dot(t, F(t), C1, 'P');
      d.dot(F(t), t, C2, 'P′');
    },
  },
  'trig-ineq': {
    view: [-7, 7, -2, 2],
    sliders: [
      { k: 'f', ru: '1 — sin x, 2 — cos x', en: '1 sin x, 2 cos x', min: 1, max: 2, step: 1, v: 1 },
      { k: 'a', ru: 'Число a', en: 'Number a', min: -1.2, max: 1.2, step: 0.05, v: 0.5 },
      { k: 's', ru: 'Знак: 1 — «>», 2 — «<»', en: 'Sign: 1 “>”, 2 “<”', min: 1, max: 2, step: 1, v: 1 },
    ],
    tex: (p) => `\\${p.f === 1 ? 'sin' : 'cos'} x ${p.s === 1 ? '>' : '<'} ${n(p.a)}`,
    facts: (p, lang) => {
      const fn = p.f === 1 ? 'sin' : 'cos';
      if (Math.abs(p.a) > 1) return [(p.a > 1) === (p.s === 2) ? L(lang, `Решение — все x: ${fn} x всегда между −1 и 1.`, `Every x works: ${fn} x is always between −1 and 1.`) : L(lang, 'Решений нет: синус и косинус не выходят за [−1; 1].', 'No solutions: sine and cosine stay within [−1; 1].')];
      const base = p.f === 1 ? Math.asin(p.a) : Math.acos(p.a);
      const nm = p.f === 1 ? 'arcsin' : 'arccos';
      const sol =
        p.f === 1
          ? p.s === 1
            ? `${nm} a + 2πk < x < π − ${nm} a + 2πk`
            : `π − ${nm} a + 2πk < x < 2π + ${nm} a + 2πk`
          : p.s === 1
            ? `−${nm} a + 2πk < x < ${nm} a + 2πk`
            : `${nm} a + 2πk < x < 2π − ${nm} a + 2πk`;
      return [`${nm} ${n(p.a)} = ${n(base)} ≈ ${n((base * 180) / Math.PI, 1)}°`, sol, L(lang, 'Зелёным отмечены x, где неравенство верно. Равенство — точки пересечения с прямой y = a.', 'Green marks where it holds; equality is where the curve meets y = a.')];
    },
    draw: (d, p) => {
      const F = p.f === 1 ? Math.sin : Math.cos;
      const step = (d.view[1] - d.view[0]) / 500;
      for (let x = d.view[0]; x < d.view[1]; x += step) if (p.s === 1 ? F(x) > p.a : F(x) < p.a) d.seg(x, 0, x + step, 0, C3, [], 7);
      d.seg(d.view[0], p.a, d.view[1], p.a, C2, [6, 4], 2);
      d.curve(F, C1, 3);
      if (Math.abs(p.a) <= 1) rootsOf((x) => F(x) - p.a, d.view[0], d.view[1]).forEach((r) => d.dot(r, p.a, C2));
      for (const k of [-2, -1, 1, 2]) d.label(k * Math.PI, 0, `${k > 0 ? '' : '−'}${Math.abs(k) === 1 ? '' : Math.abs(k)}π`, GREY, -8, 18);
    },
  },
  motion: {
    view: [0, 5, 0, 110],
    sliders: [
      { k: 'm', ru: '1 — навстречу, 2 — вдогонку', en: '1 towards each other, 2 a chase', min: 1, max: 2, step: 1, v: 1 },
      { k: 'v1', ru: 'Скорость первого, км/ч', en: 'Speed 1, km/h', min: 5, max: 60, step: 5, v: 20 },
      { k: 'v2', ru: 'Скорость второго, км/ч', en: 'Speed 2, km/h', min: 5, max: 60, step: 5, v: 30 },
      { k: 'S', ru: 'Расстояние между ними, км', en: 'Distance apart, km', min: 10, max: 100, step: 5, v: 100 },
    ],
    tex: (p) => (p.m === 1 ? `t = \\frac{S}{v_1 + v_2} = \\frac{${p.S}}{${p.v1 + p.v2}} = ${n(p.S / (p.v1 + p.v2))}\\text{ ч}` : `t = \\frac{S}{v_2 - v_1} = ${p.v2 > p.v1 ? `\\frac{${p.S}}{${p.v2 - p.v1}} = ${n(p.S / (p.v2 - p.v1))}\\text{ ч}` : '\\infty'}`),
    facts: (p, lang) =>
      p.m === 1
        ? [L(lang, `Скорость сближения v₁ + v₂ = ${p.v1 + p.v2} км/ч.`, `Closing speed v₁ + v₂ = ${p.v1 + p.v2} km/h.`), L(lang, `Встреча через ${n(p.S / (p.v1 + p.v2))} ч, в ${n((p.v1 * p.S) / (p.v1 + p.v2))} км от старта первого.`, `They meet after ${n(p.S / (p.v1 + p.v2))} h, ${n((p.v1 * p.S) / (p.v1 + p.v2))} km from the first one’s start.`), L(lang, 'На графике s(t) встреча — точка пересечения прямых.', 'On the s(t) graph they meet where the lines cross.')]
        : p.v2 > p.v1
          ? [L(lang, `Скорость сближения v₂ − v₁ = ${p.v2 - p.v1} км/ч.`, `Closing speed v₂ − v₁ = ${p.v2 - p.v1} km/h.`), L(lang, `Догонит через ${n(p.S / (p.v2 - p.v1))} ч.`, `Catches up after ${n(p.S / (p.v2 - p.v1))} h.`)]
          : [L(lang, 'Второй не быстрее первого — никогда не догонит: прямые на графике не пересекаются.', 'The second one is not faster: it never catches up; the lines do not cross.')],
    draw: (d, p) => {
      if (p.m === 1) {
        d.curve((t) => p.v1 * t, C1, 3);
        d.curve((t) => p.S - p.v2 * t, C2, 3);
        const t = p.S / (p.v1 + p.v2);
        d.dot(t, p.v1 * t, C3, L('ru', 'встреча', 'meet'));
      } else {
        d.curve((t) => p.S + p.v1 * t, C1, 3);
        d.curve((t) => p.v2 * t, C2, 3);
        if (p.v2 > p.v1) {
          const t = p.S / (p.v2 - p.v1);
          d.dot(t, p.v2 * t, C3, L('ru', 'догнал', 'caught'));
        }
      }
      d.label(4.2, 104, 's, км', GREY, 0, 0);
    },
  },
};

export const MathGraph: React.FC<{ id: GraphId; lang: Lang }> = ({ id, lang }) => {
  const pre = PRESETS[id];
  const [p, setP] = useState<P>(() => Object.fromEntries(pre.sliders.map((s) => [s.k, s.v])));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => setP(Object.fromEntries(pre.sliders.map((s) => [s.k, s.v]))), [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ro = new ResizeObserver(() => setW(cv.clientWidth));
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  const h = pre.line ? Math.max(140, Math.min(200, w * 0.24)) : Math.max(260, Math.min(440, w * 0.6));
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || id === 'dice') return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d')!;
    const [x0, x1, y0, y1] = pre.view;
    const W = cv.width;
    const H = cv.height;
    const X = (x: number) => ((x - x0) / (x1 - x0)) * W;
    const Y = pre.line ? () => H * 0.55 : (y: number) => H - ((y - y0) / (y1 - y0)) * H;
    ctx.fillStyle = '#FCFCFA';
    ctx.fillRect(0, 0, W, H);
    // grid
    const step = (span: number) => (span <= 12 ? 1 : span <= 24 ? 2 : 5);
    ctx.lineWidth = dpr;
    ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#8C8F98';
    const sx = step(x1 - x0);
    for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) {
      if (!pre.line) {
        ctx.strokeStyle = x === 0 ? '#16171A' : '#ECECE7';
        ctx.beginPath();
        ctx.moveTo(X(x), 0);
        ctx.lineTo(X(x), H);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#16171A';
        ctx.beginPath();
        ctx.moveTo(X(x), Y(0) - 6 * dpr);
        ctx.lineTo(X(x), Y(0) + 6 * dpr);
        ctx.stroke();
      }
      if (x !== 0 || pre.line) ctx.fillText(String(x), X(x) + 3 * dpr, (pre.line ? Y(0) + 20 * dpr : Math.min(H - 4 * dpr, Math.max(12 * dpr, Y(0) + 14 * dpr))));
    }
    if (!pre.line) {
      const sy = step(y1 - y0);
      for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) {
        ctx.strokeStyle = y === 0 ? '#16171A' : '#ECECE7';
        ctx.beginPath();
        ctx.moveTo(0, Y(y));
        ctx.lineTo(W, Y(y));
        ctx.stroke();
        if (y !== 0) ctx.fillText(String(y), Math.min(W - 24 * dpr, Math.max(3 * dpr, X(0) + 4 * dpr)), Y(y) - 3 * dpr);
      }
    } else {
      ctx.strokeStyle = '#16171A';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, Y(0));
      ctx.lineTo(W, Y(0));
      ctx.stroke();
    }
    const d: Draw = {
      ctx,
      X,
      Y,
      dpr,
      w: W,
      h: H,
      view: pre.view,
      curve: (f, color, width = 2, dash = [], from = x0, to = x1) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width * dpr;
        ctx.setLineDash(dash.map((v) => v * dpr));
        ctx.beginPath();
        let pen = false;
        const steps = 600;
        for (let i = 0; i <= steps; i++) {
          const x = from + ((to - from) * i) / steps;
          const y = f(x);
          const py = Y(y);
          if (!Number.isFinite(y) || py < -H || py > 2 * H) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(X(x), py);
          else ctx.moveTo(X(x), py);
          pen = true;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      },
      dot: (x, y, color, label, r = 5) => {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(X(x), Y(y), r * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        if (label) d.label(x, y, label, color, 8, -8);
      },
      seg: (xa, ya, xb, yb, color, dash = [], width = 2) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width * dpr;
        ctx.setLineDash(dash.map((v) => v * dpr));
        ctx.beginPath();
        ctx.moveTo(X(xa), Y(ya));
        ctx.lineTo(X(xb), Y(yb));
        ctx.stroke();
        ctx.setLineDash([]);
      },
      label: (x, y, text, color, dx = 6, dy = -6) => {
        ctx.font = `600 ${12 * dpr}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(text, X(x) + dx * dpr, Y(y) + dy * dpr);
      },
    };
    pre.draw(d, p);
  }, [p, w, h, pre, id]);

  const facts = pre.facts(p, lang).filter(Boolean);
  useScreenDetail('model-graph', `Интерактивный график на экране: ${pre.tex(p).replace(/\\\\/g, '')}. ${facts.join(' ')}`);

  if (id === 'dice') return <DiceSim lang={lang} />;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <canvas ref={canvas} className="block w-full" style={{ height: h }} />
      <div className="grid md:grid-cols-[1fr_1fr] gap-4 p-4 border-t border-line">
        <div className="flex flex-col gap-3">
          {pre.sliders.map((s) => (
            <label key={s.k} className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                <span>{lang === 'ru' ? s.ru : s.en}</span>
                <span className="font-mono text-ink">{n(p[s.k] ?? s.v)}</span>
              </span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={p[s.k] ?? s.v} onChange={(e) => setP({ ...p, [s.k]: Number(e.target.value) })} className="w-full accent-[#8E4EC6] cursor-pointer" />
            </label>
          ))}
          <button onClick={() => setP(Object.fromEntries(pre.sliders.map((s) => [s.k, s.v])))} className="self-start h-8 px-3 rounded-lg border border-line text-xs text-ink-2 hover:text-ink inline-flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
            {lang === 'ru' ? 'Сбросить' : 'Reset'}
          </button>
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="overflow-x-auto text-ink text-[17px] py-1">
            <Formula tex={pre.tex(p)} display />
          </div>
          <ul className="text-sm text-ink-2 flex flex-col gap-1">
            {facts.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/** rolling dice: the share of each outcome approaches its probability */
const DiceSim: React.FC<{ lang: Lang }> = ({ lang }) => {
  const [two, setTwo] = useState(false);
  const [counts, setCounts] = useState<number[]>(() => Array(13).fill(0));
  const [last, setLast] = useState<number[]>([]);
  const total = counts.reduce((s, c) => s + c, 0);
  const faces = two ? Array.from({ length: 11 }, (_, i) => i + 2) : [1, 2, 3, 4, 5, 6];
  const prob = (v: number) => (two ? (6 - Math.abs(7 - v)) / 36 : 1 / 6);
  const roll = (k: number) => {
    const next = [...counts];
    let lastRoll: number[] = [];
    for (let i = 0; i < k; i++) {
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      next[two ? a + b : a]++;
      lastRoll = two ? [a, b] : [a];
    }
    setCounts(next);
    setLast(lastRoll);
  };
  const max = useMemo(() => Math.max(...faces.map((f) => Math.max(prob(f), total ? counts[f] / total : 0))), [counts, total, two]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rounded-xl border border-line bg-surface p-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex p-0.5 rounded-lg bg-muted border border-line text-sm">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              onClick={() => {
                setTwo(v);
                setCounts(Array(13).fill(0));
                setLast([]);
              }}
              className={`h-8 px-3 rounded-md cursor-pointer ${two === v ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2'}`}
            >
              {v ? L(lang, 'Два кубика (сумма)', 'Two dice (sum)') : L(lang, 'Один кубик', 'One die')}
            </button>
          ))}
        </div>
        {[1, 10, 100, 1000].map((k) => (
          <button key={k} onClick={() => roll(k)} className="h-9 px-3 rounded-lg bg-[#8E4EC6] text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
            <Dices className="w-4 h-4" />×{k}
          </button>
        ))}
        <span className="text-sm text-ink-2 ml-auto">
          {L(lang, 'Бросков', 'Rolls')}: <b className="font-mono text-ink">{total}</b>
          {last.length > 0 && ` · ${L(lang, 'последний', 'last')}: ${last.join(' + ')}`}
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-48">
        {faces.map((f) => {
          const share = total ? counts[f] / total : 0;
          return (
            <div key={f} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative">
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-[#E5484D]" style={{ bottom: `calc(${(prob(f) / max) * 85}% + 20px)` }} />
              <div className="w-full rounded-t-md bg-[#8E4EC6] transition-all duration-500" style={{ height: `${(share / max) * 85}%` }} />
              <span className="text-xs font-mono text-ink-2">{f}</span>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-ink-2">
        {L(lang, 'Фиолетовые столбики — доля выпадений, красный пунктир — теоретическая вероятность', 'Purple bars: observed share; red dashes: the theoretical probability')} ({two ? L(lang, 'сумма 7 выпадает чаще всего: 6/36', 'a sum of 7 is most likely: 6/36') : '1/6'}). {L(lang, 'Брось 1000 раз — столбики почти совпадут с пунктиром.', 'Roll 1000 times and the bars nearly match the dashes.')}
      </p>
    </div>
  );
};

export default MathGraph;
