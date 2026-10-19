import React, { useEffect, useRef, useState } from 'react';
import { Move, RotateCcw } from 'lucide-react';
import type { GeomId } from './ids';
import { Formula } from '../Formula';
import { useScreenDetail } from '../../lib/pageContext';

/* Geometry board: drag the points, the measures and formulas update live. World units, 1 unit = 40 px. */

type Lang = 'ru' | 'en';
type Pt = [number, number];
type Pts = Record<string, Pt>;
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
interface Ctx {
  pts: Pts;
  p: P;
  lang: Lang;
}
interface Preset {
  pts?: Pts;
  sliders?: Slider[];
  snap?: number;
  constrain?: (k: string, pt: Pt, all: Pts) => Pt;
  render: (c: Ctx) => React.ReactNode;
  tex?: (c: Ctx) => string;
  facts: (c: Ctx) => string[];
  /** hide the coordinate axes */
  noAxes?: boolean;
}

const VW = 640;
const VH = 400;
const U = 40;
const C1 = '#2F5BFF';
const C2 = '#E5484D';
const C3 = '#30A46C';
const C4 = '#8E4EC6';
const C5 = '#F5A524';
const INK = '#16171A';

const sx = (x: number) => VW / 2 + x * U;
const sy = (y: number) => VH / 2 - y * U;
const n = (x: number, d = 2) => {
  if (!Number.isFinite(x)) return '—';
  const v = Math.round(x * 10 ** d) / 10 ** d;
  return String(Object.is(v, -0) ? 0 : v).replace('.', ',');
};
const L = (lang: Lang, ru: string, en: string) => (lang === 'ru' ? ru : en);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** angle at v between rays v→a and v→b, degrees */
const deg = (v: Pt, a: Pt, b: Pt) => {
  const u = [a[0] - v[0], a[1] - v[1]];
  const w = [b[0] - v[0], b[1] - v[1]];
  const c = (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
};
const area = (ps: Pt[]) => Math.abs(ps.reduce((s, p, i) => s + p[0] * ps[(i + 1) % ps.length][1] - ps[(i + 1) % ps.length][0] * p[1], 0)) / 2;
const onCircle = (c: Pt, r: number) => (_k: string, pt: Pt): Pt => {
  const a = Math.atan2(pt[1] - c[1], pt[0] - c[0]);
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
};

const GREY = '#9AA0AA';
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/** the foot of the perpendicular from p to the line ab */
const foot = (p: Pt, a: Pt, b: Pt): Pt => {
  const d = [b[0] - a[0], b[1] - a[1]];
  const t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2 || 1);
  return [a[0] + d[0] * t, a[1] + d[1] * t];
};
/** centre and radius of the inscribed circle */
const incenter = (A: Pt, B: Pt, C: Pt) => {
  const a = dist(B, C);
  const b = dist(A, C);
  const c = dist(A, B);
  const s = a + b + c || 1;
  return { c: [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s] as Pt, r: (2 * area([A, B, C])) / s };
};
/** centre and radius of the circumscribed circle */
const circum = (A: Pt, B: Pt, C: Pt) => {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1])) || 1e-9;
  const sq = (P: Pt) => P[0] ** 2 + P[1] ** 2;
  const c: Pt = [(sq(A) * (B[1] - C[1]) + sq(B) * (C[1] - A[1]) + sq(C) * (A[1] - B[1])) / d, (sq(A) * (C[0] - B[0]) + sq(B) * (A[0] - C[0]) + sq(C) * (B[0] - A[0])) / d];
  return { c, r: dist(c, A) };
};
/** where the lines p1p2 and p3p4 cross */
const lineX = (p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null => {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
};

/* ---------- drawing helpers (world coordinates) ---------- */
const Poly: React.FC<{ ps: Pt[]; fill?: string; stroke?: string; dash?: boolean; w?: number }> = ({ ps, fill = 'none', stroke = INK, dash, w = 2 }) => (
  <polygon points={ps.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill={fill} stroke={stroke} strokeWidth={w} strokeDasharray={dash ? '6 5' : undefined} strokeLinejoin="round" className="transition-[fill] duration-300" />
);
const Seg: React.FC<{ a: Pt; b: Pt; c?: string; dash?: boolean; w?: number; arrow?: boolean }> = ({ a, b, c = INK, dash, w = 2, arrow }) => (
  <line x1={sx(a[0])} y1={sy(a[1])} x2={sx(b[0])} y2={sy(b[1])} stroke={c} strokeWidth={w} strokeDasharray={dash ? '6 5' : undefined} strokeLinecap="round" markerEnd={arrow ? `url(#arr-${c.slice(1)})` : undefined} />
);
const Txt: React.FC<{ at: Pt; c?: string; dx?: number; dy?: number; children: React.ReactNode; size?: number }> = ({ at, c = INK, dx = 8, dy = -8, children, size = 14 }) => (
  <text x={sx(at[0]) + dx} y={sy(at[1]) + dy} fill={c} fontSize={size} fontWeight={600} style={{ paintOrder: 'stroke', stroke: '#FCFCFA', strokeWidth: 4 }}>
    {children}
  </text>
);
/** arc marking the angle at v, with its size */
const Arc: React.FC<{ v: Pt; a: Pt; b: Pt; c?: string; r?: number; label?: boolean }> = ({ v, a, b, c = C2, r = 26, label = true }) => {
  const d = deg(v, a, b);
  const V = [sx(v[0]), sy(v[1])];
  const ta = Math.atan2(sy(a[1]) - V[1], sx(a[0]) - V[0]);
  const tb = Math.atan2(sy(b[1]) - V[1], sx(b[0]) - V[0]);
  let delta = tb - ta;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  const mid = ta + delta / 2;
  const lx = V[0] + Math.cos(mid) * (r + 16);
  const ly = V[1] + Math.sin(mid) * (r + 16);
  if (Math.abs(d - 90) < 0.5) {
    const k = r * 0.6;
    const ua = [Math.cos(ta) * k, Math.sin(ta) * k];
    const ub = [Math.cos(tb) * k, Math.sin(tb) * k];
    return (
      <g>
        <path d={`M ${V[0] + ua[0]} ${V[1] + ua[1]} L ${V[0] + ua[0] + ub[0]} ${V[1] + ua[1] + ub[1]} L ${V[0] + ub[0]} ${V[1] + ub[1]}`} fill="none" stroke={c} strokeWidth={2} />
        {label && <text x={lx} y={ly + 5} fill={c} fontSize={13} fontWeight={600} textAnchor="middle">90°</text>}
      </g>
    );
  }
  return (
    <g>
      <path d={`M ${V[0]} ${V[1]} L ${V[0] + Math.cos(ta) * r} ${V[1] + Math.sin(ta) * r} A ${r} ${r} 0 0 ${delta > 0 ? 1 : 0} ${V[0] + Math.cos(tb) * r} ${V[1] + Math.sin(tb) * r} Z`} fill={c} fillOpacity={0.15} stroke={c} strokeWidth={1.5} />
      {label && (
        <text x={lx} y={ly + 5} fill={c} fontSize={13} fontWeight={600} textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#FCFCFA', strokeWidth: 4 }}>
          {n(d, 1)}°
        </text>
      )}
    </g>
  );
};

const triFacts = (A: Pt, B: Pt, C: Pt, lang: Lang) => {
  const a = deg(A, B, C);
  const b = deg(B, A, C);
  const c = deg(C, A, B);
  const max = Math.max(a, b, c);
  const kind = Math.abs(max - 90) < 0.5 ? L(lang, 'прямоугольный', 'right') : max > 90 ? L(lang, 'тупоугольный', 'obtuse') : L(lang, 'остроугольный', 'acute');
  const s = [dist(B, C), dist(A, C), dist(A, B)].sort((x, y) => x - y);
  const sides = Math.abs(s[0] - s[2]) < 0.01 ? L(lang, 'равносторонний', 'equilateral') : Math.abs(s[0] - s[1]) < 0.01 || Math.abs(s[1] - s[2]) < 0.01 ? L(lang, 'равнобедренный', 'isosceles') : L(lang, 'разносторонний', 'scalene');
  return { a, b, c, kind, sides };
};

const PRESETS: Record<GeomId, Preset> = {
  'fraction-pie': {
    noAxes: true,
    sliders: [
      { k: 'num', ru: 'Числитель', en: 'Numerator', min: 0, max: 12, step: 1, v: 3 },
      { k: 'den', ru: 'Знаменатель', en: 'Denominator', min: 1, max: 12, step: 1, v: 8 },
    ],
    render: ({ p }) => {
      const R = 4;
      const k = Math.max(1, p.den);
      const wholes = Math.max(1, Math.ceil(p.num / k));
      const off = (wholes - 1) * 4.6;
      return Array.from({ length: wholes }, (_, w) => {
        const cx = -off / 2 + w * 4.6;
        const r = wholes > 1 ? 2.1 : R;
        return Array.from({ length: k }, (_, i) => {
          const a0 = Math.PI / 2 - (i / k) * 2 * Math.PI;
          const a1 = Math.PI / 2 - ((i + 1) / k) * 2 * Math.PI;
          const on = w * k + i < p.num;
          const P0: Pt = [cx + r * Math.cos(a0), r * Math.sin(a0)];
          const P1: Pt = [cx + r * Math.cos(a1), r * Math.sin(a1)];
          const path = k === 1 ? `M ${sx(cx - r)} ${sy(0)} a ${r * U} ${r * U} 0 1 0 ${2 * r * U} 0 a ${r * U} ${r * U} 0 1 0 ${-2 * r * U} 0` : `M ${sx(cx)} ${sy(0)} L ${sx(P0[0])} ${sy(P0[1])} A ${r * U} ${r * U} 0 0 1 ${sx(P1[0])} ${sy(P1[1])} Z`;
          return <path key={`${w}-${i}`} d={path} fill={on ? C4 : '#F1EEF6'} stroke="#fff" strokeWidth={2} className="transition-[fill] duration-300" />;
        });
      });
    },
    tex: ({ p }) => `\\frac{${p.num}}{${p.den}} = ${n(p.num / p.den, 3)} = ${n((p.num / p.den) * 100, 1)}\\%`,
    facts: ({ p, lang }) => {
      const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
      const d = g(p.num, p.den) || 1;
      return [
        d > 1 ? `${L(lang, 'Сокращаем на', 'Simplify by')} ${d}: ${p.num / d}/${p.den / d}` : L(lang, 'Дробь несократимая', 'Already in lowest terms'),
        p.num > p.den ? `${L(lang, 'Неправильная дробь', 'Improper fraction')}: ${Math.floor(p.num / p.den)} ${L(lang, 'целых', 'whole')} ${p.num % p.den}/${p.den}` : p.num === p.den ? L(lang, 'Целая единица', 'Exactly one whole') : L(lang, 'Правильная дробь: меньше единицы', 'Proper fraction: less than one'),
        `${L(lang, 'Равные дроби', 'Equal fractions')}: ${p.num * 2}/${p.den * 2} = ${p.num * 3}/${p.den * 3}`,
      ];
    },
  },
  'percent-grid': {
    noAxes: true,
    sliders: [
      { k: 'pc', ru: 'Процент', en: 'Percent', min: 0, max: 100, step: 1, v: 35 },
      { k: 'of', ru: 'От числа', en: 'Of the number', min: 10, max: 500, step: 10, v: 200 },
    ],
    render: ({ p }) => {
      const cell = 0.78;
      return Array.from({ length: 100 }, (_, i) => {
        const r = Math.floor(i / 10);
        const c = i % 10;
        const x = -3.9 + c * cell;
        const y = 3.9 - r * cell;
        return <rect key={i} x={sx(x)} y={sy(y)} width={cell * U - 3} height={cell * U - 3} rx={4} fill={i < p.pc ? C4 : '#F1EEF6'} className="transition-[fill] duration-200" style={{ transitionDelay: `${(i % 10) * 12}ms` }} />;
      });
    },
    tex: ({ p }) => `${p.pc}\\% \\text{ от } ${p.of} = ${p.of} \\cdot ${n(p.pc / 100)} = ${n((p.of * p.pc) / 100)}`,
    facts: ({ p, lang }) => [`${p.pc}% = ${p.pc}/100 = ${n(p.pc / 100)}`, L(lang, `Одна клетка — 1%, всё поле — 100%.`, 'One cell is 1%, the whole grid is 100%.'), `${L(lang, 'Увеличить', 'Increase')} ${p.of} ${L(lang, 'на', 'by')} ${p.pc}%: ${p.of} · ${n(1 + p.pc / 100)} = ${n(p.of * (1 + p.pc / 100))}`],
  },
  angles: {
    pts: { O: [-1, -2], A: [5, -2], B: [2, 3] },
    render: ({ pts }) => (
      <>
        <Seg a={pts.O} b={pts.A} w={3} />
        <Seg a={pts.O} b={pts.B} w={3} />
        <Seg a={pts.O} b={[2 * pts.O[0] - pts.A[0], 2 * pts.O[1] - pts.A[1]]} c="#B9BCC4" dash />
        <Arc v={pts.O} a={pts.A} b={pts.B} c={C4} r={34} />
        <Arc v={pts.O} a={pts.B} b={[2 * pts.O[0] - pts.A[0], 2 * pts.O[1] - pts.A[1]]} c={C3} r={22} />
      </>
    ),
    tex: ({ pts }) => `\\angle AOB = ${n(deg(pts.O, pts.A, pts.B), 1)}^\\circ`,
    facts: ({ pts, lang }) => {
      const d = deg(pts.O, pts.A, pts.B);
      const kind = d < 0.5 ? L(lang, 'нулевой', 'zero') : Math.abs(d - 90) < 0.5 ? L(lang, 'прямой', 'right') : d < 90 ? L(lang, 'острый', 'acute') : Math.abs(d - 180) < 0.5 ? L(lang, 'развёрнутый', 'straight') : L(lang, 'тупой', 'obtuse');
      return [`${L(lang, 'Угол', 'The angle is')} ${kind}`, `${L(lang, 'Смежный угол (зелёный)', 'Adjacent angle (green)')}: 180° − ${n(d, 1)}° = ${n(180 - d, 1)}°`, L(lang, 'Двигай точки A, B и вершину O.', 'Drag A, B and the vertex O.')];
    },
  },
  rectangle: {
    snap: 1,
    pts: { C: [2, 1] },
    constrain: (_k, pt) => [Math.max(-5, pt[0]), Math.max(-3, pt[1])],
    render: ({ pts }) => {
      const O: Pt = [-6, -4];
      const C = pts.C;
      const cells = [];
      for (let x = O[0]; x < C[0]; x++) for (let y = O[1]; y < C[1]; y++) cells.push(<rect key={`${x},${y}`} x={sx(x) + 2} y={sy(y + 1) + 2} width={U - 4} height={U - 4} rx={3} fill={C4} fillOpacity={0.18} />);
      return (
        <>
          {cells}
          <Poly ps={[O, [C[0], O[1]], C, [O[0], C[1]]]} stroke={C4} w={3} />
          <Txt at={[(O[0] + C[0]) / 2, O[1]]} dx={-10} dy={22} c={C1}>a = {C[0] - O[0]}</Txt>
          <Txt at={[O[0], (O[1] + C[1]) / 2]} dx={-58} dy={4} c={C2}>b = {C[1] - O[1]}</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const a = pts.C[0] + 6;
      const b = pts.C[1] + 4;
      return `S = ab = ${a} \\cdot ${b} = ${a * b}, \\quad P = 2(a + b) = ${2 * (a + b)}`;
    },
    facts: ({ pts, lang }) => {
      const a = pts.C[0] + 6;
      const b = pts.C[1] + 4;
      return [L(lang, `Площадь — это число единичных квадратиков внутри: ${a * b}.`, `Area is the number of unit squares inside: ${a * b}.`), a === b ? L(lang, 'Это квадрат: S = a²', 'This is a square: S = a²') : L(lang, 'Сделай стороны равными — получится квадрат.', 'Make the sides equal to get a square.'), `${L(lang, 'Диагональ', 'Diagonal')}: √(a² + b²) = ${n(Math.hypot(a, b))}`];
    },
  },
  coords: {
    pts: { P: [3, 2] },
    render: ({ pts }) => {
      const P = pts.P;
      return (
        <>
          <Seg a={P} b={[P[0], 0]} c={C1} dash />
          <Seg a={P} b={[0, P[1]]} c={C2} dash />
          <circle cx={sx(-P[0])} cy={sy(-P[1])} r={6} fill={C3} />
          <Txt at={[-P[0], -P[1]]} c={C3}>P′({n(-P[0])}; {n(-P[1])})</Txt>
          <circle cx={sx(-P[0])} cy={sy(P[1])} r={5} fill="#B9BCC4" />
          <circle cx={sx(P[0])} cy={sy(-P[1])} r={5} fill="#B9BCC4" />
          <Txt at={P} c={C4} dy={-16}>P({n(P[0])}; {n(P[1])})</Txt>
        </>
      );
    },
    facts: ({ pts, lang }) => {
      const [x, y] = pts.P;
      const q = x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : x > 0 && y < 0 ? 'IV' : L(lang, 'на оси', 'on an axis');
      return [`${L(lang, 'Абсцисса', 'x-coordinate')} x = ${n(x)}, ${L(lang, 'ордината', 'y-coordinate')} y = ${n(y)}`, `${L(lang, 'Четверть', 'Quadrant')}: ${q}`, L(lang, 'Зелёная точка симметрична P относительно начала координат, серые — относительно осей.', 'Green is P mirrored through the origin, grey are mirrors in the axes.'), `${L(lang, 'Расстояние до O', 'Distance to O')}: √(x² + y²) = ${n(Math.hypot(x, y))}`];
    },
  },
  circle: {
    pts: { O: [0, 0], M: [3, 2] },
    render: ({ pts }) => {
      const r = dist(pts.O, pts.M);
      const D: Pt = [2 * pts.O[0] - pts.M[0], 2 * pts.O[1] - pts.M[1]];
      return (
        <>
          <circle cx={sx(pts.O[0])} cy={sy(pts.O[1])} r={r * U} fill={C4} fillOpacity={0.12} stroke={C4} strokeWidth={3} />
          <Seg a={D} b={pts.O} c={C1} dash />
          <Seg a={pts.O} b={pts.M} c={C2} w={3} />
          <Txt at={[(pts.O[0] + pts.M[0]) / 2, (pts.O[1] + pts.M[1]) / 2]} c={C2}>r</Txt>
          <Txt at={D} c={C1}>d</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const r = dist(pts.O, pts.M);
      return `C = 2\\pi r = ${n(2 * Math.PI * r)}, \\quad S = \\pi r^2 = ${n(Math.PI * r * r)}`;
    },
    facts: ({ pts, lang }) => {
      const r = dist(pts.O, pts.M);
      return [`r = ${n(r)}, d = 2r = ${n(2 * r)}`, L(lang, 'π ≈ 3,14 — во столько раз длина окружности больше диаметра.', 'π ≈ 3.14: how many times the circumference exceeds the diameter.'), L(lang, 'Увеличь радиус вдвое: длина вырастет в 2 раза, площадь — в 4.', 'Double r: the length doubles, the area grows 4×.')];
    },
  },
  'square-of-sum': {
    noAxes: true,
    sliders: [
      { k: 'a', ru: 'a', en: 'a', min: 1, max: 5, step: 0.5, v: 4 },
      { k: 'b', ru: 'b', en: 'b', min: 0.5, max: 4, step: 0.5, v: 2 },
    ],
    render: ({ p }) => {
      const s = p.a + p.b;
      const x0 = -s / 2;
      const y0 = s / 2;
      const R = (x: number, y: number, w: number, h: number, c: string, t: string) => (
        <g>
          <rect x={sx(x0 + x)} y={sy(y0 - y)} width={w * U} height={h * U} fill={c} fillOpacity={0.75} stroke="#fff" strokeWidth={3} className="transition-all duration-300" />
          <text x={sx(x0 + x + w / 2)} y={sy(y0 - y - h / 2) + 6} fill="#fff" fontSize={Math.min(22, 8 + Math.min(w, h) * 6)} fontWeight={700} textAnchor="middle">{t}</text>
        </g>
      );
      return (
        <>
          {R(0, 0, p.a, p.a, C4, 'a²')}
          {R(p.a, 0, p.b, p.a, C1, 'ab')}
          {R(0, p.a, p.a, p.b, C1, 'ab')}
          {R(p.a, p.a, p.b, p.b, C2, 'b²')}
        </>
      );
    },
    tex: ({ p }) => `(a + b)^2 = a^2 + 2ab + b^2 = ${n(p.a * p.a)} + ${n(2 * p.a * p.b)} + ${n(p.b * p.b)} = ${n((p.a + p.b) ** 2)}`,
    facts: ({ lang }) => [L(lang, 'Большой квадрат со стороной a + b разрезан на 4 части: a², b² и два прямоугольника ab.', 'The big square with side a + b splits into a², b² and two ab rectangles.'), L(lang, 'Частая ошибка: (a + b)² ≠ a² + b² — забывают два синих прямоугольника.', 'Common slip: (a + b)² ≠ a² + b², the two blue rectangles get forgotten.'), `(a − b)² = a² − 2ab + b², a² − b² = (a − b)(a + b)`],
  },
  triangle: {
    pts: { A: [-4, -3], B: [4, -3], C: [1, 3] },
    render: ({ pts }) => (
      <>
        <Poly ps={[pts.A, pts.B, pts.C]} fill="rgba(142,78,198,0.12)" stroke={C4} w={3} />
        <Arc v={pts.A} a={pts.B} b={pts.C} c={C1} />
        <Arc v={pts.B} a={pts.C} b={pts.A} c={C2} />
        <Arc v={pts.C} a={pts.A} b={pts.B} c={C3} />
      </>
    ),
    tex: ({ pts }) => {
      const t = triFacts(pts.A, pts.B, pts.C, 'ru');
      return `${n(t.a, 1)}^\\circ + ${n(t.b, 1)}^\\circ + ${n(t.c, 1)}^\\circ = 180^\\circ`;
    },
    facts: ({ pts, lang }) => {
      const t = triFacts(pts.A, pts.B, pts.C, lang);
      return [`${L(lang, 'Треугольник', 'Triangle:')} ${t.kind}, ${t.sides}`, `AB = ${n(dist(pts.A, pts.B))}, BC = ${n(dist(pts.B, pts.C))}, AC = ${n(dist(pts.A, pts.C))}`, L(lang, 'Против большей стороны лежит больший угол.', 'The largest angle faces the longest side.'), `${L(lang, 'Периметр', 'Perimeter')}: ${n(dist(pts.A, pts.B) + dist(pts.B, pts.C) + dist(pts.A, pts.C))}`];
    },
  },
  parallel: {
    pts: { P: [1, 2], Q: [-2, -2] },
    constrain: (k, pt) => [Math.max(-7, Math.min(7, pt[0])), k === 'P' ? 2 : -2],
    render: ({ pts }) => {
      const { P, Q } = pts;
      const dx = P[0] - Q[0];
      const ext = (t: number): Pt => [Q[0] + dx * t, -2 + 4 * t];
      return (
        <>
          <Seg a={[-8, 2]} b={[8, 2]} c={C1} w={3} />
          <Seg a={[-8, -2]} b={[8, -2]} c={C1} w={3} />
          <Seg a={ext(-0.6)} b={ext(1.6)} c={INK} w={2.5} />
          <Arc v={P} a={[8, 2]} b={ext(1.6)} c={C4} r={24} />
          <Arc v={Q} a={[8, -2]} b={ext(1.6)} c={C4} r={24} />
          <Arc v={P} a={[-8, 2]} b={ext(-0.6)} c={C4} r={24} />
          <Arc v={P} a={[8, 2]} b={ext(-0.6)} c={C3} r={18} />
          <Txt at={[7, 2]} c={C1} dy={-10}>a</Txt>
          <Txt at={[7, -2]} c={C1} dy={-10}>b</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const a = deg(pts.P, [8, 2], [pts.P[0] + (pts.P[0] - pts.Q[0]), 6]);
      return `a \\parallel b: \\quad \\alpha = ${n(a, 1)}^\\circ, \\quad 180^\\circ - \\alpha = ${n(180 - a, 1)}^\\circ`;
    },
    facts: ({ lang }) => [L(lang, 'Фиолетовые углы равны: соответственные (сверху и снизу справа) и вертикальные.', 'Purple angles are equal: corresponding and vertical ones.'), L(lang, 'Накрест лежащие углы равны, односторонние в сумме дают 180°.', 'Alternate angles are equal; co-interior ones add up to 180°.'), L(lang, 'Зелёный — смежный с фиолетовым: вместе 180°.', 'Green is adjacent to purple: together 180°.')],
  },
  'right-trig': {
    pts: { A: [4, -3], B: [-4, 2] },
    constrain: (k, pt) => (k === 'A' ? [Math.max(-2, Math.min(7, pt[0])), -3] : [-4, Math.max(-1, Math.min(4.5, pt[1]))]),
    render: ({ pts, lang }) => {
      const C: Pt = [-4, -3];
      const { A, B } = pts;
      return (
        <>
          <Poly ps={[A, B, C]} fill="rgba(142,78,198,0.12)" stroke={INK} w={2} />
          <Seg a={C} b={A} c={C1} w={4} />
          <Seg a={C} b={B} c={C2} w={4} />
          <Seg a={A} b={B} c={C4} w={4} />
          <Arc v={C} a={A} b={B} c={INK} r={18} label={false} />
          <Arc v={A} a={B} b={C} c={C3} r={34} />
          <Txt at={[(A[0] + C[0]) / 2, -3]} c={C1} dy={22}>{L(lang, 'прилежащий', 'adjacent')} {n(dist(A, C))}</Txt>
          <Txt at={[-4, (B[1] - 3) / 2]} c={C2} dx={-110}>{L(lang, 'противолежащий', 'opposite')} {n(dist(B, C))}</Txt>
          <Txt at={[(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]} c={C4}>{L(lang, 'гипотенуза', 'hypotenuse')} {n(dist(A, B))}</Txt>
          <Txt at={A} c={C3} dx={6} dy={18}>α</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const a = dist(pts.A, [-4, -3]);
      const b = dist(pts.B, [-4, -3]);
      const c = Math.hypot(a, b);
      return `\\sin\\alpha = \\frac{${n(b)}}{${n(c)}} = ${n(b / c, 3)}, \\; \\cos\\alpha = ${n(a / c, 3)}, \\; \\operatorname{tg}\\alpha = ${n(b / a, 3)}`;
    },
    facts: ({ pts, lang }) => {
      const a = dist(pts.A, [-4, -3]);
      const b = dist(pts.B, [-4, -3]);
      return [`α = ${n((Math.atan2(b, a) * 180) / Math.PI, 1)}°`, `${L(lang, 'Пифагор', 'Pythagoras')}: ${n(a)}² + ${n(b)}² = ${n(a * a + b * b)} = ${n(Math.hypot(a, b))}²`, L(lang, 'sin — противолежащий / гипотенуза, cos — прилежащий / гипотенуза, tg — противолежащий / прилежащий.', 'sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.')];
    },
  },
  quadrilateral: {
    pts: { A: [-5, -3], B: [3, -3], C: [5, 2], D: [-3, 2] },
    render: ({ pts }) => (
      <>
        <Poly ps={[pts.A, pts.B, pts.C, pts.D]} fill="rgba(142,78,198,0.12)" stroke={C4} w={3} />
        <Seg a={pts.A} b={pts.C} c="#B9BCC4" dash />
        <Seg a={pts.B} b={pts.D} c="#B9BCC4" dash />
        <Arc v={pts.A} a={pts.B} b={pts.D} c={C1} r={22} />
        <Arc v={pts.B} a={pts.C} b={pts.A} c={C2} r={22} />
        <Arc v={pts.C} a={pts.D} b={pts.B} c={C3} r={22} />
        <Arc v={pts.D} a={pts.A} b={pts.C} c={C5} r={22} />
      </>
    ),
    tex: ({ pts }) => `S = ${n(area([pts.A, pts.B, pts.C, pts.D]))}`,
    facts: ({ pts, lang }) => {
      const { A, B, C, D } = pts;
      const par = (p1: Pt, p2: Pt, p3: Pt, p4: Pt) => Math.abs((p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0])) < 0.01;
      const p1 = par(A, B, D, C);
      const p2 = par(B, C, A, D);
      const right = Math.abs(deg(A, B, D) - 90) < 0.5;
      const eq = Math.abs(dist(A, B) - dist(B, C)) < 0.01;
      const kind = p1 && p2 ? (right && eq ? L(lang, 'квадрат', 'square') : right ? L(lang, 'прямоугольник', 'rectangle') : eq ? L(lang, 'ромб', 'rhombus') : L(lang, 'параллелограмм', 'parallelogram')) : p1 || p2 ? L(lang, 'трапеция', 'trapezoid') : L(lang, 'произвольный четырёхугольник', 'a general quadrilateral');
      const sum = deg(A, B, D) + deg(B, C, A) + deg(C, D, B) + deg(D, A, C);
      return [`${L(lang, 'Это', 'This is')} ${kind}`, `${L(lang, 'Сумма углов', 'Angle sum')}: ${n(sum, 0)}°`, `${L(lang, 'Диагонали', 'Diagonals')}: AC = ${n(dist(A, C))}, BD = ${n(dist(B, D))}`, L(lang, 'Подвинь вершины так, чтобы получились ромб или прямоугольник.', 'Move the vertices to make a rhombus or a rectangle.')];
    },
  },
  'triangle-area': {
    pts: { A: [-5, -3], B: [4, -3], C: [-1, 3] },
    render: ({ pts }) => {
      const { A, B, C } = pts;
      const ab = [B[0] - A[0], B[1] - A[1]];
      const t = ((C[0] - A[0]) * ab[0] + (C[1] - A[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1);
      const H: Pt = [A[0] + ab[0] * t, A[1] + ab[1] * t];
      return (
        <>
          {(t < 0 || t > 1) && <Seg a={t < 0 ? A : B} b={H} c="#B9BCC4" dash />}
          <Poly ps={[A, B, C]} fill="rgba(142,78,198,0.15)" stroke={C4} w={3} />
          <Seg a={A} b={B} c={C1} w={4} />
          <Seg a={C} b={H} c={C2} w={2.5} dash />
          <Arc v={H} a={C} b={t < 0.5 ? B : A} c={C2} r={12} label={false} />
          <Txt at={[(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]} c={C1} dy={22}>a = {n(dist(A, B))}</Txt>
          <Txt at={[(C[0] + H[0]) / 2, (C[1] + H[1]) / 2]} c={C2}>h = {n(dist(C, H))}</Txt>
        </>
      );
    },
    tex: ({ pts }) => `S = \\frac{1}{2} a h = ${n(area([pts.A, pts.B, pts.C]))}`,
    facts: ({ pts, lang }) => {
      const { A, B, C } = pts;
      const a = dist(B, C);
      const b = dist(A, C);
      const c = dist(A, B);
      const p = (a + b + c) / 2;
      return [`${L(lang, 'Формула Герона', 'Heron’s formula')}: √(p(p−a)(p−b)(p−c)) = ${n(Math.sqrt(Math.max(0, p * (p - a) * (p - b) * (p - c))))}`, `S = ½·AB·AC·sin A = ${n(0.5 * c * b * Math.sin((deg(A, B, C) * Math.PI) / 180))}`, L(lang, 'Двигай C параллельно AB — высота и площадь не меняются!', 'Slide C parallel to AB: the height and area stay the same!')];
    },
  },
  similar: {
    pts: { C: [-5.5, -0.5] },
    sliders: [{ k: 'k', ru: 'Коэффициент подобия k', en: 'Scale factor k', min: 0.5, max: 2.5, step: 0.25, v: 2 }],
    render: ({ pts, p }) => {
      const A: Pt = [-7, -3];
      const B: Pt = [-4.5, -3];
      const o: Pt = [-2.5, -4];
      const m = (q: Pt): Pt => [o[0] + (q[0] - A[0]) * p.k, o[1] + (q[1] - A[1]) * p.k];
      return (
        <>
          <Poly ps={[A, B, pts.C]} fill="rgba(47,91,255,0.15)" stroke={C1} w={3} />
          <Poly ps={[m(A), m(B), m(pts.C)]} fill="rgba(142,78,198,0.15)" stroke={C4} w={3} />
          <Arc v={A} a={B} b={pts.C} c={C2} r={18} label={false} />
          <Arc v={m(A)} a={m(B)} b={m(pts.C)} c={C2} r={18} />
          <Txt at={[(A[0] + B[0]) / 2, -3]} c={C1} dy={20} dx={-10}>{n(dist(A, B))}</Txt>
          <Txt at={[(m(A)[0] + m(B)[0]) / 2, m(A)[1]]} c={C4} dy={20} dx={-10}>{n(dist(A, B) * p.k)}</Txt>
        </>
      );
    },
    tex: ({ p }) => `\\frac{A'B'}{AB} = k = ${n(p.k)}, \\quad \\frac{S'}{S} = k^2 = ${n(p.k * p.k)}`,
    facts: ({ pts, p, lang }) => {
      const s = area([[-7, -3], [-4.5, -3], pts.C]);
      return [L(lang, 'Углы у подобных треугольников равны, стороны пропорциональны.', 'Similar triangles have equal angles and proportional sides.'), `S = ${n(s)}, S′ = ${n(s * p.k * p.k)}`, L(lang, 'Периметры относятся как k, площади — как k².', 'Perimeters scale by k, areas by k².')];
    },
  },
  'circle-angles': {
    noAxes: true,
    pts: { A: [-3.46, -2], B: [3.46, -2], C: [0.8, 3.92] },
    constrain: onCircle([0, 0], 4),
    render: ({ pts }) => {
      const O: Pt = [0, 0];
      const ins = deg(pts.C, pts.A, pts.B);
      return (
        <>
          <circle cx={sx(0)} cy={sy(0)} r={4 * U} fill="none" stroke={INK} strokeWidth={2} />
          <Seg a={pts.C} b={pts.A} c={C1} w={3} />
          <Seg a={pts.C} b={pts.B} c={C1} w={3} />
          <Seg a={O} b={pts.A} c={C4} w={2.5} />
          <Seg a={O} b={pts.B} c={C4} w={2.5} />
          <Arc v={pts.C} a={pts.A} b={pts.B} c={C1} r={30} />
          {ins < 89.5 ? <Arc v={O} a={pts.A} b={pts.B} c={C4} r={26} /> : <Txt at={O} c={C4}>{n(2 * ins, 1)}°</Txt>}
          <circle cx={sx(0)} cy={sy(0)} r={4} fill={INK} />
          <Txt at={O} dx={-18} dy={18}>O</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const ins = deg(pts.C, pts.A, pts.B);
      return `\\angle ACB = \\frac{1}{2}\\angle AOB: \\quad ${n(ins, 1)}^\\circ = \\frac{${n(2 * ins, 1)}^\\circ}{2}`;
    },
    facts: ({ lang }) => [L(lang, 'Вписанный угол (синий) равен половине центрального (фиолетового), опирающегося на ту же дугу.', 'The inscribed angle (blue) is half the central one (purple) on the same arc.'), L(lang, 'Двигай C по окружности — вписанный угол не меняется!', 'Move C around the circle: the inscribed angle does not change!'), L(lang, 'Поставь A и B на концы диаметра — угол станет 90°.', 'Put A and B at the ends of a diameter: the angle becomes 90°.')],
  },
  vectors: {
    pts: { A: [4, 1], B: [1, 3] },
    render: ({ pts }) => {
      const O: Pt = [0, 0];
      const S: Pt = [pts.A[0] + pts.B[0], pts.A[1] + pts.B[1]];
      return (
        <>
          <Seg a={pts.A} b={S} c={C2} dash />
          <Seg a={pts.B} b={S} c={C1} dash />
          <Seg a={O} b={S} c={C3} w={3.5} arrow />
          <Seg a={O} b={pts.A} c={C1} w={3.5} arrow />
          <Seg a={O} b={pts.B} c={C2} w={3.5} arrow />
          <Txt at={pts.A} c={C1} dx={10} dy={20}>a</Txt>
          <Txt at={pts.B} c={C2} dx={-22}>b</Txt>
          <Txt at={S} c={C3}>a + b</Txt>
        </>
      );
    },
    tex: ({ pts }) => `\\vec a\\{${n(pts.A[0])}; ${n(pts.A[1])}\\} + \\vec b\\{${n(pts.B[0])}; ${n(pts.B[1])}\\} = \\{${n(pts.A[0] + pts.B[0])}; ${n(pts.A[1] + pts.B[1])}\\}`,
    facts: ({ pts, lang }) => {
      const dot = pts.A[0] * pts.B[0] + pts.A[1] * pts.B[1];
      const la = Math.hypot(...pts.A);
      const lb = Math.hypot(...pts.B);
      return [`|a⃗| = ${n(la)}, |b⃗| = ${n(lb)}`, `${L(lang, 'Скалярное произведение', 'Dot product')}: a⃗·b⃗ = ${n(dot)}${Math.abs(dot) < 0.01 ? L(lang, ' — векторы перпендикулярны!', ': perpendicular!') : ''}`, `${L(lang, 'Угол между ними', 'Angle between')}: ${n((Math.acos(Math.max(-1, Math.min(1, dot / (la * lb || 1)))) * 180) / Math.PI, 1)}°`, L(lang, 'Сумма — диагональ параллелограмма (правило параллелограмма).', 'The sum is the diagonal of the parallelogram.')];
    },
  },
  polygon: {
    noAxes: true,
    sliders: [{ k: 'k', ru: 'Число сторон n', en: 'Number of sides n', min: 3, max: 12, step: 1, v: 6 }],
    render: ({ p }) => {
      const ps: Pt[] = Array.from({ length: p.k }, (_, i) => [4 * Math.cos(Math.PI / 2 + (i * 2 * Math.PI) / p.k), 4 * Math.sin(Math.PI / 2 + (i * 2 * Math.PI) / p.k)]);
      const diag = [];
      for (let i = 0; i < p.k; i++) for (let j = i + 2; j < p.k; j++) if (!(i === 0 && j === p.k - 1)) diag.push(<Seg key={`${i}-${j}`} a={ps[i]} b={ps[j]} c="#CFC2E6" w={1} />);
      return (
        <>
          {diag}
          <Poly ps={ps} fill="rgba(142,78,198,0.12)" stroke={C4} w={3} />
          <Arc v={ps[0]} a={ps[1]} b={ps[p.k - 1]} c={C2} r={22} />
          {ps.map((q, i) => (
            <circle key={i} cx={sx(q[0])} cy={sy(q[1])} r={4} fill={C4} />
          ))}
        </>
      );
    },
    tex: ({ p }) => `(n - 2)\\cdot 180^\\circ = ${(p.k - 2) * 180}^\\circ, \\quad \\alpha = ${n(((p.k - 2) * 180) / p.k, 1)}^\\circ`,
    facts: ({ p, lang }) => [`${L(lang, 'Диагоналей', 'Diagonals')}: n(n − 3)/2 = ${(p.k * (p.k - 3)) / 2}`, `${L(lang, 'Внешний угол', 'Exterior angle')}: 360°/n = ${n(360 / p.k, 1)}°`, L(lang, 'Из одной вершины диагонали делят n-угольник на n − 2 треугольника — отсюда сумма углов.', 'Diagonals from one vertex cut it into n − 2 triangles: that is where the sum comes from.')],
  },
  symmetry: {
    pts: { A: [1, 1], B: [5, 2], C: [2, 4] },
    sliders: [{ k: 'm', ru: '1 — ось Oy, 2 — ось Ox, 3 — центр O', en: '1 y-axis, 2 x-axis, 3 point O', min: 1, max: 3, step: 1, v: 1 }],
    render: ({ pts, p }) => {
      const f = (q: Pt): Pt => (p.m === 1 ? [-q[0], q[1]] : p.m === 2 ? [q[0], -q[1]] : [-q[0], -q[1]]);
      const ks = ['A', 'B', 'C'];
      return (
        <>
          {p.m === 1 && <Seg a={[0, -5]} b={[0, 5]} c={C2} w={3} />}
          {p.m === 2 && <Seg a={[-8, 0]} b={[8, 0]} c={C2} w={3} />}
          {p.m === 3 && <circle cx={sx(0)} cy={sy(0)} r={7} fill={C2} />}
          {ks.map((k) => (
            <Seg key={k} a={pts[k]} b={f(pts[k])} c="#B9BCC4" dash w={1.5} />
          ))}
          <Poly ps={ks.map((k) => pts[k])} fill="rgba(47,91,255,0.15)" stroke={C1} w={3} />
          <Poly ps={ks.map((k) => f(pts[k]))} fill="rgba(142,78,198,0.15)" stroke={C4} w={3} />
          {ks.map((k) => (
            <Txt key={k} at={f(pts[k])} c={C4}>{k}′</Txt>
          ))}
        </>
      );
    },
    facts: ({ pts, p, lang }) => [p.m === 1 ? L(lang, 'Симметрия относительно оси Oy: (x; y) → (−x; y)', 'Mirror in the y-axis: (x, y) → (−x, y)') : p.m === 2 ? L(lang, 'Симметрия относительно оси Ox: (x; y) → (x; −y)', 'Mirror in the x-axis: (x, y) → (x, −y)') : L(lang, 'Центральная симметрия: (x; y) → (−x; −y)', 'Point symmetry: (x, y) → (−x, −y)'), `A(${n(pts.A[0])}; ${n(pts.A[1])}) → A′(${n(p.m === 2 ? pts.A[0] : -pts.A[0])}; ${n(p.m === 1 ? pts.A[1] : -pts.A[1])})`, L(lang, 'Фигура и её отражение равны: длины и углы сохраняются.', 'The shape and its image are congruent: lengths and angles are kept.')],
  },
  'triangle-lines': {
    pts: { A: [-5, -3], B: [5, -3], C: [0.5, 3.5] },
    sliders: [{ k: 'm', ru: '1 медианы, 2 биссектрисы, 3 высоты, 4 серединные перпендикуляры', en: '1 medians, 2 bisectors, 3 altitudes, 4 perpendicular bisectors', min: 1, max: 4, step: 1, v: 1 }],
    render: ({ pts, p }) => {
      const { A, B, C } = pts;
      const T = [A, B, C];
      const lines: [Pt, Pt][] = [];
      let point: Pt | null = null;
      if (p.m === 1) {
        T.forEach((V, i) => lines.push([V, mid(T[(i + 1) % 3], T[(i + 2) % 3])]));
        point = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      } else if (p.m === 2) {
        T.forEach((V, i) => {
          const P1 = T[(i + 1) % 3];
          const P2 = T[(i + 2) % 3];
          const k = dist(V, P1) / (dist(V, P1) + dist(V, P2));
          lines.push([V, [P1[0] + (P2[0] - P1[0]) * k, P1[1] + (P2[1] - P1[1]) * k]]);
        });
        point = incenter(A, B, C).c;
      } else if (p.m === 3) {
        T.forEach((V, i) => lines.push([V, foot(V, T[(i + 1) % 3], T[(i + 2) % 3])]));
        const O = circum(A, B, C).c;
        point = [A[0] + B[0] + C[0] - 2 * O[0], A[1] + B[1] + C[1] - 2 * O[1]];
      } else {
        const O = circum(A, B, C).c;
        T.forEach((V, i) => lines.push([mid(V, T[(i + 1) % 3]), O]));
        point = O;
      }
      const colors = [C1, C2, C3];
      return (
        <>
          <Poly ps={T} fill="rgba(142,78,198,0.08)" stroke={INK} w={2.5} />
          {lines.map(([a, b], i) => (
            <Seg key={i} a={a} b={b} c={colors[i]} w={2} dash={p.m === 4} />
          ))}
          {p.m === 3 && lines.map(([, f], i) => <circle key={`f${i}`} cx={sx(f[0])} cy={sy(f[1])} r={3.5} fill={colors[i]} />)}
          {p.m === 4 && (() => { const O = circum(A, B, C); return <circle cx={sx(O.c[0])} cy={sy(O.c[1])} r={O.r * U} fill="none" stroke={C4} strokeWidth={1.5} strokeDasharray="5 5" />; })()}
          {p.m === 2 && (() => { const I = incenter(A, B, C); return <circle cx={sx(I.c[0])} cy={sy(I.c[1])} r={I.r * U} fill="none" stroke={C4} strokeWidth={1.5} strokeDasharray="5 5" />; })()}
          {point && (
            <>
              <circle cx={sx(point[0])} cy={sy(point[1])} r={6} fill={C5} stroke="#fff" strokeWidth={2} />
              <Txt at={point} c={C5}>{['M', 'I', 'H', 'O'][p.m - 1]}</Txt>
            </>
          )}
        </>
      );
    },
    facts: ({ p, lang }) =>
      [
        [L(lang, 'Медианы соединяют вершину с серединой противоположной стороны и пересекаются в одной точке M (центр тяжести).', 'Medians join a vertex to the midpoint of the opposite side and meet at M, the centroid.'), L(lang, 'Точка M делит каждую медиану в отношении 2 : 1, считая от вершины.', 'M splits each median 2 : 1 from the vertex.')],
        [L(lang, 'Биссектрисы делят углы пополам и пересекаются в точке I — центре вписанной окружности.', 'Bisectors halve the angles and meet at I, the centre of the inscribed circle.'), L(lang, 'Биссектриса делит сторону пропорционально прилежащим сторонам.', 'A bisector splits the side in the ratio of the adjacent sides.')],
        [L(lang, 'Высоты опущены перпендикулярно на стороны и пересекаются в ортоцентре H.', 'Altitudes drop at right angles and meet at the orthocentre H.'), L(lang, 'У тупоугольного треугольника H лежит снаружи — проверь!', 'In an obtuse triangle H lies outside: try it!')],
        [L(lang, 'Серединные перпендикуляры к сторонам пересекаются в точке O — центре описанной окружности.', 'Perpendicular bisectors meet at O, the centre of the circumscribed circle.'), L(lang, 'O одинаково удалена от всех трёх вершин.', 'O is equally far from all three vertices.')],
      ][p.m - 1],
  },
  incircle: {
    pts: { A: [-5, -3], B: [4.5, -3], C: [-1, 3.5] },
    render: ({ pts }) => {
      const { A, B, C } = pts;
      const I = incenter(A, B, C);
      const O = circum(A, B, C);
      return (
        <>
          <circle cx={sx(O.c[0])} cy={sy(O.c[1])} r={O.r * U} fill="rgba(229,72,77,0.05)" stroke={C2} strokeWidth={2} />
          <Poly ps={[A, B, C]} fill="rgba(142,78,198,0.10)" stroke={INK} w={2.5} />
          <circle cx={sx(I.c[0])} cy={sy(I.c[1])} r={I.r * U} fill="rgba(47,91,255,0.08)" stroke={C1} strokeWidth={2} />
          <Seg a={I.c} b={foot(I.c, A, B)} c={C1} dash />
          <Seg a={O.c} b={A} c={C2} dash />
          <circle cx={sx(I.c[0])} cy={sy(I.c[1])} r={4} fill={C1} />
          <circle cx={sx(O.c[0])} cy={sy(O.c[1])} r={4} fill={C2} />
          <Txt at={I.c} c={C1}>r</Txt>
          <Txt at={O.c} c={C2}>R</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const { A, B, C } = pts;
      return `r = \\frac{S}{p} = ${n(incenter(A, B, C).r)}, \\quad R = \\frac{abc}{4S} = ${n(circum(A, B, C).r)}`;
    },
    facts: ({ lang }) => [L(lang, 'Синяя окружность вписана: касается всех сторон, центр — пересечение биссектрис.', 'Blue is inscribed: it touches every side; its centre is where the bisectors meet.'), L(lang, 'Красная описана: проходит через вершины, центр — пересечение серединных перпендикуляров.', 'Red is circumscribed: through the vertices; its centre is where the perpendicular bisectors meet.'), L(lang, 'У прямоугольного треугольника центр описанной окружности — середина гипотенузы.', 'In a right triangle the circumcentre is the midpoint of the hypotenuse.')],
  },
  'chord-tangent': {
    noAxes: true,
    pts: { P: [6.5, 1], A: [-2.12, 2.12], B: [-2.12, -2.12] },
    constrain: (k, pt) => (k === 'P' ? pt : onCircle([0, 0], 3)(k, pt)),
    render: ({ pts }) => {
      const O: Pt = [0, 0];
      const R = 3;
      const P = pts.P;
      const d = dist(O, P);
      const th = Math.atan2(P[1], P[0]);
      const tang = d > R ? [1, -1].map((s) => [R * Math.cos(th + s * Math.acos(R / d)), R * Math.sin(th + s * Math.acos(R / d))] as Pt) : [];
      const M = mid(pts.A, pts.B);
      return (
        <>
          <circle cx={sx(0)} cy={sy(0)} r={R * U} fill="rgba(142,78,198,0.06)" stroke={INK} strokeWidth={2} />
          <circle cx={sx(0)} cy={sy(0)} r={4} fill={INK} />
          <Txt at={O} dx={-16} dy={18}>O</Txt>
          {tang.map((T, i) => (
            <g key={i}>
              <Seg a={P} b={T} c={C1} w={2.5} />
              <Seg a={O} b={T} c={GREY} dash />
              <Arc v={T} a={O} b={P} c={C1} r={12} label={false} />
              <circle cx={sx(T[0])} cy={sy(T[1])} r={4} fill={C1} />
            </g>
          ))}
          <Seg a={pts.A} b={pts.B} c={C2} w={2.5} />
          <Seg a={O} b={M} c={C2} dash />
          {dist(pts.A, pts.B) > 0.3 && <Arc v={M} a={O} b={pts.A} c={C2} r={10} label={false} />}
        </>
      );
    },
    facts: ({ pts, lang }) => {
      const d = dist([0, 0], pts.P);
      return [
        d > 3 ? `${L(lang, 'Отрезки касательных из одной точки равны', 'Tangent segments from one point are equal')}: PT = √(OP² − R²) = √(${n(d * d)} − 9) = ${n(Math.sqrt(d * d - 9))}` : L(lang, 'Точка P внутри круга — касательных из неё нет.', 'P is inside the circle: no tangents from it.'),
        L(lang, 'Касательная перпендикулярна радиусу, проведённому в точку касания.', 'A tangent is perpendicular to the radius at the point of contact.'),
        `${L(lang, 'Хорда AB', 'Chord AB')} = ${n(dist(pts.A, pts.B))}; ${L(lang, 'перпендикуляр из центра делит её пополам', 'the perpendicular from the centre halves it')}.`,
      ];
    },
  },
  thales: {
    noAxes: true,
    pts: { R: [6, 3.5] },
    sliders: [
      { k: 'tilt', ru: 'Наклон параллельных прямых', en: 'Tilt of the parallel lines', min: 40, max: 140, step: 5, v: 110 },
      { k: 's', ru: 'Шаг на нижнем луче', en: 'Step on the lower ray', min: 1, max: 4, step: 0.25, v: 3 },
    ],
    render: ({ pts, p }) => {
      const O: Pt = [-7, -3.5];
      const u = [pts.R[0] - O[0], pts.R[1] - O[1]];
      const D = [Math.cos((p.tilt * Math.PI) / 180), Math.sin((p.tilt * Math.PI) / 180)];
      const Bs: Pt[] = [];
      const As: Pt[] = [];
      for (let i = 1; i <= 3; i++) {
        const Ai: Pt = [O[0] + i * p.s, O[1]];
        // A + μD = O + λu
        const det = D[0] * -u[1] - D[1] * -u[0];
        const lam = (D[0] * (Ai[1] - O[1]) - D[1] * (Ai[0] - O[0])) / -det;
        As.push(Ai);
        Bs.push([O[0] + lam * u[0], O[1] + lam * u[1]]);
      }
      return (
        <>
          <Seg a={O} b={[7.5, -3.5]} w={2.5} />
          <Seg a={O} b={pts.R} w={2.5} />
          {As.map((a, i) => (
            <g key={i}>
              <Seg a={a} b={Bs[i]} c={[C1, C2, C3][i]} w={2} />
              <circle cx={sx(a[0])} cy={sy(a[1])} r={4} fill={INK} />
              <circle cx={sx(Bs[i][0])} cy={sy(Bs[i][1])} r={4} fill={INK} />
              <Txt at={a} dx={-4} dy={20}>A{i + 1}</Txt>
              <Txt at={Bs[i]} dx={-26}>B{i + 1}</Txt>
            </g>
          ))}
          <Txt at={O} dx={-6} dy={20}>O</Txt>
        </>
      );
    },
    facts: ({ pts, p, lang }) => {
      const u = dist([-7, -3.5], pts.R);
      void u;
      return [L(lang, `OA₁ = A₁A₂ = A₂A₃ = ${n(p.s)} — и на другой стороне отрезки тоже равны: теорема Фалеса.`, `OA₁ = A₁A₂ = A₂A₃ = ${n(p.s)}, so the segments on the other side are equal too: Thales’ theorem.`), L(lang, 'Параллельные прямые отсекают на сторонах угла пропорциональные отрезки (обобщённая теорема Фалеса).', 'Parallel lines cut the sides of an angle into proportional segments.'), L(lang, 'Двигай точку R и меняй наклон — равенство сохраняется.', 'Drag R and change the tilt: the equality stays.')];
    },
  },
  midline: {
    pts: { A: [-6, -3], B: [-1, 3.5], C: [5, -3] },
    render: ({ pts }) => {
      const { A, B, C } = pts;
      const M = mid(A, B);
      const N = mid(B, C);
      return (
        <>
          <Poly ps={[A, B, C]} fill="rgba(142,78,198,0.08)" stroke={INK} w={2.5} />
          <Seg a={A} b={C} c={C1} w={4} />
          <Seg a={M} b={N} c={C2} w={4} />
          <circle cx={sx(M[0])} cy={sy(M[1])} r={5} fill={C2} />
          <circle cx={sx(N[0])} cy={sy(N[1])} r={5} fill={C2} />
          <Txt at={M} c={C2} dx={-24}>M</Txt>
          <Txt at={N} c={C2}>N</Txt>
        </>
      );
    },
    tex: ({ pts }) => `MN = \\frac{AC}{2} = \\frac{${n(dist(pts.A, pts.C))}}{2} = ${n(dist(pts.A, pts.C) / 2)}`,
    facts: ({ lang }) => [L(lang, 'Средняя линия соединяет середины двух сторон.', 'A midline joins the midpoints of two sides.'), L(lang, 'Она параллельна третьей стороне и равна её половине.', 'It is parallel to the third side and half as long.'), L(lang, 'Средняя линия отсекает треугольник, подобный исходному с k = ½ — его площадь в 4 раза меньше.', 'It cuts off a similar triangle with k = ½, a quarter of the area.')],
  },
  trapezoid: {
    pts: { A: [-6, -3], B: [6, -3], C: [3, 2], D: [-3, 2] },
    constrain: (k, pt) => [Math.max(-7.5, Math.min(7.5, pt[0])), k === 'A' || k === 'B' ? -3 : 2],
    render: ({ pts }) => {
      const { A, B, C, D } = pts;
      const M = mid(A, D);
      const N = mid(B, C);
      const O = lineX(A, C, B, D);
      return (
        <>
          <Poly ps={[A, B, C, D]} fill="rgba(142,78,198,0.10)" stroke={INK} w={2.5} />
          <Seg a={M} b={N} c={C2} w={3.5} />
          <Seg a={A} b={C} c={GREY} dash />
          <Seg a={B} b={D} c={GREY} dash />
          <Seg a={D} b={[D[0], -3]} c={C1} dash />
          <Txt at={[D[0], -0.5]} c={C1}>h = 5</Txt>
          {O && <circle cx={sx(O[0])} cy={sy(O[1])} r={4} fill={GREY} />}
        </>
      );
    },
    tex: ({ pts }) => {
      const a = dist(pts.A, pts.B);
      const b = dist(pts.C, pts.D);
      return `m = \\frac{a + b}{2} = ${n((a + b) / 2)}, \\quad S = \\frac{a + b}{2} \\cdot h = ${n(((a + b) / 2) * 5)}`;
    },
    facts: ({ pts, lang }) => {
      const iso = Math.abs(dist(pts.A, pts.D) - dist(pts.B, pts.C)) < 0.05;
      return [`${L(lang, 'Основания', 'Bases')}: a = ${n(dist(pts.A, pts.B))}, b = ${n(dist(pts.C, pts.D))}`, L(lang, 'Средняя линия (красная) параллельна основаниям и равна их полусумме.', 'The midline (red) is parallel to the bases and equals their half-sum.'), iso ? L(lang, 'Трапеция равнобедренная: боковые стороны и диагонали равны.', 'An isosceles trapezoid: equal legs and equal diagonals.') : L(lang, 'Сделай боковые стороны равными — получится равнобедренная трапеция.', 'Make the legs equal to get an isosceles trapezoid.')];
    },
  },
  parallelogram: {
    pts: { A: [-5, -2.5], B: [3, -2.5], D: [-2, 2.5] },
    render: ({ pts }) => {
      const { A, B, D } = pts;
      const C: Pt = [B[0] + D[0] - A[0], B[1] + D[1] - A[1]];
      const O = mid(A, C);
      return (
        <>
          <Poly ps={[A, B, C, D]} fill="rgba(142,78,198,0.10)" stroke={INK} w={2.5} />
          <Seg a={A} b={C} c={C1} w={2} />
          <Seg a={B} b={D} c={C2} w={2} />
          <circle cx={sx(O[0])} cy={sy(O[1])} r={5} fill={C5} />
          <Arc v={A} a={B} b={D} c={C3} r={24} />
          <Arc v={B} a={C} b={A} c={C4} r={24} />
          <Txt at={C} dx={10}>C</Txt>
          <Txt at={O} c={C5}>O</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const { A, B, D } = pts;
      const S = Math.abs((B[0] - A[0]) * (D[1] - A[1]) - (B[1] - A[1]) * (D[0] - A[0]));
      return `S = ab\\sin\\alpha = ${n(S)}`;
    },
    facts: ({ pts, lang }) => {
      const { A, B, D } = pts;
      const C: Pt = [B[0] + D[0] - A[0], B[1] + D[1] - A[1]];
      const right = Math.abs(deg(A, B, D) - 90) < 0.5;
      const eq = Math.abs(dist(A, B) - dist(A, D)) < 0.05;
      return [L(lang, 'Диагонали делятся точкой пересечения O пополам', 'The diagonals bisect each other at O') + `: AO = ${n(dist(A, C) / 2)}, BO = ${n(dist(B, D) / 2)}`, L(lang, 'Соседние углы в сумме 180°, противоположные равны.', 'Neighbouring angles add to 180°, opposite ones are equal.'), right && eq ? L(lang, 'Это квадрат!', 'It is a square!') : right ? L(lang, 'Это прямоугольник: диагонали равны.', 'A rectangle: equal diagonals.') : eq ? L(lang, 'Это ромб: диагонали перпендикулярны.', 'A rhombus: perpendicular diagonals.') : L(lang, 'Сделай угол прямым или стороны равными.', 'Make a right angle or equal sides.')];
    },
  },
  sector: {
    noAxes: true,
    sliders: [
      { k: 'R', ru: 'Радиус R', en: 'Radius R', min: 1, max: 4.5, step: 0.5, v: 4 },
      { k: 'a', ru: 'Центральный угол α, °', en: 'Central angle α, °', min: 10, max: 360, step: 5, v: 120 },
    ],
    render: ({ p }) => {
      const c: Pt = [-1.5, 0];
      const a = (p.a * Math.PI) / 180;
      const P0: Pt = [c[0] + p.R, 0];
      const P1: Pt = [c[0] + p.R * Math.cos(a), p.R * Math.sin(a)];
      const path = p.a >= 360 ? '' : `M ${sx(c[0])} ${sy(0)} L ${sx(P0[0])} ${sy(0)} A ${p.R * U} ${p.R * U} 0 ${p.a > 180 ? 1 : 0} 0 ${sx(P1[0])} ${sy(P1[1])} Z`;
      return (
        <>
          <circle cx={sx(c[0])} cy={sy(0)} r={p.R * U} fill="none" stroke={GREY} strokeWidth={1.5} strokeDasharray="5 5" />
          {p.a >= 360 ? <circle cx={sx(c[0])} cy={sy(0)} r={p.R * U} fill="rgba(142,78,198,0.25)" stroke={C4} strokeWidth={3} /> : <path d={path} fill="rgba(142,78,198,0.25)" stroke={C4} strokeWidth={2.5} />}
          {p.a < 360 && <path d={`M ${sx(P0[0])} ${sy(0)} A ${p.R * U} ${p.R * U} 0 ${p.a > 180 ? 1 : 0} 0 ${sx(P1[0])} ${sy(P1[1])}`} fill="none" stroke={C2} strokeWidth={5} />}
          <circle cx={sx(c[0])} cy={sy(0)} r={4} fill={INK} />
          <Txt at={[c[0] + 0.3, 0.3]} c={C4}>α = {p.a}°</Txt>
        </>
      );
    },
    tex: ({ p }) => `l = \\frac{\\pi R \\alpha}{180^\\circ} = ${n((Math.PI * p.R * p.a) / 180)}, \\quad S = \\frac{\\pi R^2 \\alpha}{360^\\circ} = ${n((Math.PI * p.R * p.R * p.a) / 360)}`,
    facts: ({ p, lang }) => [L(lang, 'Красная дуга — часть окружности, фиолетовый сектор — часть круга.', 'The red arc is part of the circle, the purple sector part of the disc.'), `${L(lang, 'Доля круга', 'Share of the disc')}: ${p.a}/360 = ${n(p.a / 360, 3)}`, `${L(lang, 'В радианах', 'In radians')}: α = ${n((p.a * Math.PI) / 180, 3)}, ${L(lang, 'тогда', 'so')} l = Rα, S = R²α/2`],
  },
  transform2d: {
    pts: { A: [1, 1], B: [4, 1], C: [2, 3.5], V: [-4, -2] },
    sliders: [
      { k: 'm', ru: '1 перенос на вектор, 2 поворот, 3 гомотетия', en: '1 translation, 2 rotation, 3 dilation', min: 1, max: 3, step: 1, v: 2 },
      { k: 'phi', ru: 'Угол поворота φ, °', en: 'Rotation angle φ, °', min: -180, max: 180, step: 15, v: 90 },
      { k: 'k', ru: 'Коэффициент гомотетии k', en: 'Dilation factor k', min: -2, max: 2, step: 0.25, v: -1 },
    ],
    render: ({ pts, p }) => {
      const ks = ['A', 'B', 'C'];
      const ph = (p.phi * Math.PI) / 180;
      const f = (q: Pt): Pt => (p.m === 1 ? [q[0] + pts.V[0], q[1] + pts.V[1]] : p.m === 2 ? [q[0] * Math.cos(ph) - q[1] * Math.sin(ph), q[0] * Math.sin(ph) + q[1] * Math.cos(ph)] : [q[0] * p.k, q[1] * p.k]);
      return (
        <>
          {p.m === 1 && <Seg a={[0, 0]} b={pts.V} c={C5} w={3} arrow />}
          {p.m !== 1 && <circle cx={sx(0)} cy={sy(0)} r={6} fill={C2} />}
          {ks.map((k) => (
            <Seg key={k} a={pts[k]} b={f(pts[k])} c="#B9BCC4" dash w={1.5} />
          ))}
          <Poly ps={ks.map((k) => pts[k])} fill="rgba(47,91,255,0.15)" stroke={C1} w={3} />
          <Poly ps={ks.map((k) => f(pts[k]))} fill="rgba(142,78,198,0.18)" stroke={C4} w={3} />
          {ks.map((k) => (
            <Txt key={k} at={f(pts[k])} c={C4}>{k}′</Txt>
          ))}
        </>
      );
    },
    facts: ({ p, lang }) =>
      p.m === 1
        ? [L(lang, 'Параллельный перенос: все точки сдвигаются на один и тот же вектор V.', 'Translation: every point moves by the same vector V.'), L(lang, 'Это движение — расстояния и углы сохраняются.', 'It is an isometry: lengths and angles are kept.')]
        : p.m === 2
          ? [L(lang, `Поворот вокруг точки O на ${p.phi}°: каждая точка остаётся на том же расстоянии от O.`, `Rotation about O by ${p.phi}°: every point keeps its distance to O.`), L(lang, 'Поворот на 180° — это центральная симметрия.', 'A 180° turn is point symmetry.')]
          : [L(lang, `Гомотетия с центром O и k = ${n(p.k)}: расстояния от O умножаются на |k|.`, `Dilation about O with k = ${n(p.k)} multiplies distances from O by |k|.`), L(lang, `Фигура подобна исходной, площадь меняется в k² = ${n(p.k * p.k)} раза. При k < 0 — переворот через O.`, `The image is similar; the area changes by k² = ${n(p.k * p.k)}. With k < 0 it flips through O.`)],
  },
  venn: {
    noAxes: true,
    sliders: [
      { k: 'a', ru: 'Только в A', en: 'Only in A', min: 0, max: 20, step: 1, v: 8 },
      { k: 'ab', ru: 'И в A, и в B', en: 'In A and B', min: 0, max: 20, step: 1, v: 5 },
      { k: 'b', ru: 'Только в B', en: 'Only in B', min: 0, max: 20, step: 1, v: 6 },
      { k: 'o', ru: 'Ни в A, ни в B', en: 'In neither', min: 0, max: 20, step: 1, v: 3 },
      { k: 'h', ru: 'Подсветить: 1 A∪B, 2 A∩B, 3 A\\B, 4 B\\A', en: 'Highlight: 1 A∪B, 2 A∩B, 3 A\\B, 4 B\\A', min: 1, max: 4, step: 1, v: 2 },
    ],
    render: ({ p }) => {
      const r = 3 * U;
      const ax = sx(-1.6);
      const bx = sx(1.6);
      const cy = sy(0);
      const hl = 'rgba(142,78,198,0.45)';
      return (
        <>
          <defs>
            <clipPath id="vennA"><circle cx={ax} cy={cy} r={r} /></clipPath>
            <clipPath id="vennB"><circle cx={bx} cy={cy} r={r} /></clipPath>
            <mask id="notB"><rect x="0" y="0" width={VW} height={VH} fill="white" /><circle cx={bx} cy={cy} r={r} fill="black" /></mask>
            <mask id="notA"><rect x="0" y="0" width={VW} height={VH} fill="white" /><circle cx={ax} cy={cy} r={r} fill="black" /></mask>
          </defs>
          <rect x={sx(-7)} y={sy(4.4)} width={14 * U} height={8.8 * U} rx={12} fill="#F6F5F1" stroke={GREY} />
          {p.h === 1 && (
            <>
              <circle cx={ax} cy={cy} r={r} fill={hl} />
              <circle cx={bx} cy={cy} r={r} fill={hl} />
            </>
          )}
          {p.h === 2 && <circle cx={bx} cy={cy} r={r} fill={hl} clipPath="url(#vennA)" />}
          {p.h === 3 && <circle cx={ax} cy={cy} r={r} fill={hl} mask="url(#notB)" />}
          {p.h === 4 && <circle cx={bx} cy={cy} r={r} fill={hl} mask="url(#notA)" />}
          <circle cx={ax} cy={cy} r={r} fill="none" stroke={C1} strokeWidth={3} />
          <circle cx={bx} cy={cy} r={r} fill="none" stroke={C2} strokeWidth={3} />
          <Txt at={[-4.3, 2.6]} c={C1} size={22}>A</Txt>
          <Txt at={[3.6, 2.6]} c={C2} size={22}>B</Txt>
          <Txt at={[-3.1, 0]} dx={0} dy={8} size={24}>{p.a}</Txt>
          <Txt at={[-0.25, 0]} dx={0} dy={8} size={24}>{p.ab}</Txt>
          <Txt at={[2.6, 0]} dx={0} dy={8} size={24}>{p.b}</Txt>
          <Txt at={[5.6, -3.6]} dx={0} dy={8} size={20}>{p.o}</Txt>
        </>
      );
    },
    tex: ({ p }) => `|A \\cup B| = |A| + |B| - |A \\cap B| = ${p.a + p.ab} + ${p.b + p.ab} - ${p.ab} = ${p.a + p.b + p.ab}`,
    facts: ({ p, lang }) => [`|A| = ${p.a + p.ab}, |B| = ${p.b + p.ab}, |A ∩ B| = ${p.ab}`, `|A \\ B| = ${p.a}, |B \\ A| = ${p.b}; ${L(lang, 'всего элементов', 'all elements')}: ${p.a + p.b + p.ab + p.o}`, L(lang, 'Пересечение считали дважды — поэтому его вычитают.', 'The overlap was counted twice, so it is subtracted once.')],
  },
  'sine-law': {
    pts: { A: [-5, -2.5], B: [4.5, -2.5], C: [-0.5, 3] },
    render: ({ pts }) => {
      const { A, B, C } = pts;
      const O = circum(A, B, C);
      return (
        <>
          <circle cx={sx(O.c[0])} cy={sy(O.c[1])} r={O.r * U} fill="none" stroke={GREY} strokeWidth={1.5} strokeDasharray="5 5" />
          <Poly ps={[A, B, C]} fill="rgba(142,78,198,0.10)" stroke={INK} w={2.5} />
          <Arc v={A} a={B} b={C} c={C1} />
          <Arc v={B} a={C} b={A} c={C2} />
          <Arc v={C} a={A} b={B} c={C3} />
          <Seg a={O.c} b={C} c={C4} dash />
          <Txt at={mid(O.c, C)} c={C4}>R</Txt>
          <Txt at={mid(B, C)} c={C1}>a</Txt>
          <Txt at={mid(A, C)} c={C2} dx={-20}>b</Txt>
          <Txt at={mid(A, B)} c={C3} dy={20}>c</Txt>
        </>
      );
    },
    tex: ({ pts }) => {
      const { A, B, C } = pts;
      const a = dist(B, C);
      const sA = Math.sin((deg(A, B, C) * Math.PI) / 180);
      return `\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R = ${n(a / sA)}`;
    },
    facts: ({ pts, lang }) => {
      const { A, B, C } = pts;
      const r = (x: number, ang: number) => n(x / Math.sin((ang * Math.PI) / 180));
      return [`a / sin A = ${r(dist(B, C), deg(A, B, C))}, b / sin B = ${r(dist(A, C), deg(B, A, C))}, c / sin C = ${r(dist(A, B), deg(C, A, B))}`, L(lang, 'Все три отношения равны диаметру описанной окружности.', 'All three ratios equal the diameter of the circumcircle.'), `${L(lang, 'Теорема косинусов', 'Law of cosines')}: c² = a² + b² − 2ab·cos C`];
    },
  },
  'tri-ineq': {
    noAxes: true,
    sliders: [
      { k: 'a', ru: 'Сторона a', en: 'Side a', min: 1, max: 8, step: 0.5, v: 4 },
      { k: 'b', ru: 'Сторона b', en: 'Side b', min: 1, max: 8, step: 0.5, v: 3 },
      { k: 'c', ru: 'Сторона c (основание)', en: 'Side c (base)', min: 1, max: 10, step: 0.5, v: 6 },
    ],
    render: ({ p, lang }) => {
      const A: Pt = [-p.c / 2, -2.5];
      const B: Pt = [p.c / 2, -2.5];
      // C: |AC| = b, |BC| = a
      const x = (p.b * p.b - p.a * p.a + p.c * p.c) / (2 * p.c);
      const y2 = p.b * p.b - x * x;
      const ok = p.a + p.b > p.c && p.a + p.c > p.b && p.b + p.c > p.a;
      const C: Pt | null = y2 > 0 ? [A[0] + x, -2.5 + Math.sqrt(y2)] : null;
      return (
        <>
          <circle cx={sx(A[0])} cy={sy(A[1])} r={p.b * U} fill="none" stroke={C2} strokeDasharray="5 5" />
          <circle cx={sx(B[0])} cy={sy(B[1])} r={p.a * U} fill="none" stroke={C1} strokeDasharray="5 5" />
          <Seg a={A} b={B} c={C3} w={4} />
          {ok && C ? (
            <>
              <Poly ps={[A, B, C]} fill="rgba(48,164,108,0.15)" stroke={INK} w={2.5} />
              <circle cx={sx(C[0])} cy={sy(C[1])} r={5} fill={INK} />
            </>
          ) : (
            <Txt at={[-3.5, 3.6]} c={C2} size={18}>
              {L(lang, 'Окружности не пересекаются — треугольника нет', 'The circles do not meet: no triangle')}
            </Txt>
          )}
        </>
      );
    },
    tex: ({ p }) => `${n(p.a)} + ${n(p.b)} ${p.a + p.b > p.c ? '>' : '\\le'} ${n(p.c)}`,
    facts: ({ p, lang }) => {
      const ok = p.a + p.b > p.c && p.a + p.c > p.b && p.b + p.c > p.a;
      return [ok ? L(lang, 'Треугольник существует: каждая сторона меньше суммы двух других.', 'The triangle exists: every side is shorter than the other two together.') : L(lang, 'Треугольника нет: одна сторона не меньше суммы двух других.', 'No triangle: one side is at least the sum of the other two.'), L(lang, 'Проверять достаточно самую большую сторону.', 'It is enough to check the longest side.'), L(lang, 'Пунктиры — все точки на расстоянии a и b от концов основания; вершина там, где они пересекаются.', 'The dashed circles hold every point a and b away; the apex is where they meet.')];
    },
  },
  distributive: {
    noAxes: true,
    sliders: [
      { k: 'a', ru: 'a', en: 'a', min: 1, max: 4, step: 0.5, v: 3 },
      { k: 'b', ru: 'b', en: 'b', min: 1, max: 6, step: 0.5, v: 4 },
      { k: 'c', ru: 'c', en: 'c', min: 1, max: 5, step: 0.5, v: 2.5 },
    ],
    render: ({ p }) => {
      const x0 = -(p.b + p.c) / 2;
      const y0 = p.a / 2;
      return (
        <>
          <rect x={sx(x0)} y={sy(y0)} width={p.b * U} height={p.a * U} fill={C1} fillOpacity={0.7} stroke="#fff" strokeWidth={3} />
          <rect x={sx(x0 + p.b)} y={sy(y0)} width={p.c * U} height={p.a * U} fill={C2} fillOpacity={0.7} stroke="#fff" strokeWidth={3} />
          <text x={sx(x0 + p.b / 2)} y={sy(0) + 6} textAnchor="middle" fontSize={20} fontWeight={700} fill="#fff">ab</text>
          <text x={sx(x0 + p.b + p.c / 2)} y={sy(0) + 6} textAnchor="middle" fontSize={20} fontWeight={700} fill="#fff">ac</text>
          <Txt at={[x0 + p.b / 2, y0]} dx={-6} dy={-10} c={C1}>b = {n(p.b)}</Txt>
          <Txt at={[x0 + p.b + p.c / 2, y0]} dx={-6} dy={-10} c={C2}>c = {n(p.c)}</Txt>
          <Txt at={[x0, 0]} dx={-58} dy={6}>a = {n(p.a)}</Txt>
        </>
      );
    },
    tex: ({ p }) => `a(b + c) = ab + ac: \\; ${n(p.a)} \\cdot ${n(p.b + p.c)} = ${n(p.a * p.b)} + ${n(p.a * p.c)} = ${n(p.a * (p.b + p.c))}`,
    facts: ({ lang }) => [L(lang, 'Площадь большого прямоугольника равна сумме площадей двух частей — так работает раскрытие скобок.', 'The big area equals the two parts: that is how brackets open.'), L(lang, 'Обратно: ab + ac = a(b + c) — вынесение общего множителя за скобки.', 'Backwards: ab + ac = a(b + c), taking out a common factor.'), L(lang, 'Если перед скобкой минус, знаки внутри меняются: −(b − c) = −b + c.', 'A minus in front flips the signs inside: −(b − c) = −b + c.')],
  },
  'diff-squares': {
    noAxes: true,
    sliders: [
      { k: 'a', ru: 'a', en: 'a', min: 2, max: 5, step: 0.5, v: 4 },
      { k: 'b', ru: 'b', en: 'b', min: 0.5, max: 3.5, step: 0.5, v: 1.5 },
    ],
    render: ({ p }) => {
      const b = Math.min(p.b, p.a - 0.5);
      const x0 = -7;
      const y0 = p.a / 2;
      const rx = 1.5;
      return (
        <>
          {/* a² with the b² corner cut out */}
          <rect x={sx(x0)} y={sy(y0)} width={(p.a - b) * U} height={p.a * U} fill={C1} fillOpacity={0.7} stroke="#fff" strokeWidth={2} />
          <rect x={sx(x0 + p.a - b)} y={sy(y0 - b)} width={b * U} height={(p.a - b) * U} fill={C2} fillOpacity={0.7} stroke="#fff" strokeWidth={2} />
          <rect x={sx(x0 + p.a - b)} y={sy(y0)} width={b * U} height={b * U} fill="none" stroke={GREY} strokeDasharray="4 4" />
          <text x={sx(x0 + p.a / 2)} y={sy(y0) - 8} textAnchor="middle" fontSize={14} fill={INK}>a² − b²</text>
          {/* the same pieces stacked: one rectangle (a − b) wide and (a + b) tall */}
          <rect x={sx(rx)} y={sy((p.a + b) / 2)} width={(p.a - b) * U} height={p.a * U} fill={C1} fillOpacity={0.7} stroke="#fff" strokeWidth={2} />
          <rect x={sx(rx)} y={sy((p.a + b) / 2 - p.a)} width={(p.a - b) * U} height={b * U} fill={C2} fillOpacity={0.7} stroke="#fff" strokeWidth={2} />
          <text x={sx(rx + (p.a - b) / 2)} y={sy((p.a + b) / 2) - 8} textAnchor="middle" fontSize={14} fill={INK}>(a − b)(a + b)</text>
          <text x={sx(-0.25)} y={sy(0) + 8} textAnchor="middle" fontSize={26} fill={INK}>=</text>
        </>
      );
    },
    tex: ({ p }) => {
      const b = Math.min(p.b, p.a - 0.5);
      return `a^2 - b^2 = (a - b)(a + b): \\; ${n(p.a * p.a)} - ${n(b * b)} = ${n(p.a - b)} \\cdot ${n(p.a + b)} = ${n(p.a * p.a - b * b)}`;
    },
    facts: ({ lang }) => [L(lang, 'Из квадрата a² вырезали квадрат b², а красную полоску переставили вбок — вышел прямоугольник (a − b)(a + b).', 'Cut b² out of a² and move the red strip aside: you get an (a − b)(a + b) rectangle.'), L(lang, 'Так считают устно: 49 · 51 = 50² − 1² = 2499.', 'Mental maths: 49 · 51 = 50² − 1² = 2499.'), L(lang, 'Разложение на множители — это и есть обратный путь от суммы к произведению.', 'Factoring is the way back from a sum to a product.')],
  },
  units: {
    noAxes: true,
    sliders: [{ k: 'v', ru: 'Длина, мм', en: 'Length, mm', min: 1, max: 1500, step: 1, v: 125 }],
    render: ({ p }) => {
      const short = p.v <= 150;
      const scale = short ? 0.09 : 0.009; // world units per mm
      const len = p.v * scale;
      const x0 = -6.75;
      const ticks = short ? 150 : 150; // 15 cm or 1.5 m
      return (
        <>
          <rect x={sx(x0)} y={sy(1.2)} width={13.5 * U} height={1.4 * U} rx={6} fill="#F4E6C8" stroke="#C8A86A" />
          {Array.from({ length: ticks + 1 }, (_, i) => {
            const x = x0 + i * 0.09;
            const big = short ? i % 10 === 0 : i % 10 === 0;
            const mid5 = i % 5 === 0;
            return <line key={i} x1={sx(x)} x2={sx(x)} y1={sy(1.2)} y2={sy(1.2) + (big ? 22 : mid5 ? 15 : 8)} stroke="#6B5530" strokeWidth={big ? 1.5 : 0.8} />;
          })}
          {Array.from({ length: 16 }, (_, i) => (
            <text key={i} x={sx(x0 + i * 0.9) + 2} y={sy(1.2) + 36} fontSize={11} fill="#6B5530">{short ? i : i * 10}</text>
          ))}
          <text x={sx(x0 + 13.2)} y={sy(1.2) + 36} fontSize={11} fill="#6B5530">{short ? 'см' : 'см'}</text>
          <rect x={sx(x0)} y={sy(-0.4)} width={Math.min(13.5, len) * U} height={0.7 * U} rx={6} fill={C1} />
          <text x={sx(x0) + 6} y={sy(-0.4) + 0.5 * U} fontSize={14} fontWeight={700} fill="#fff">{p.v} мм</text>
        </>
      );
    },
    tex: ({ p }) => `${p.v}\\text{ мм} = ${n(p.v / 10)}\\text{ см} = ${n(p.v / 100)}\\text{ дм} = ${n(p.v / 1000, 3)}\\text{ м}`,
    facts: ({ lang }) => [L(lang, '1 см = 10 мм, 1 дм = 10 см, 1 м = 100 см = 1000 мм, 1 км = 1000 м.', '1 cm = 10 mm, 1 dm = 10 cm, 1 m = 100 cm = 1000 mm, 1 km = 1000 m.'), L(lang, 'Масса: 1 кг = 1000 г, 1 т = 1000 кг. Время: 1 ч = 60 мин = 3600 с.', 'Mass: 1 kg = 1000 g, 1 t = 1000 kg. Time: 1 h = 60 min = 3600 s.'), L(lang, 'Площадь: 1 м² = 100 дм² = 10 000 см² — степень «единицы» возводится в квадрат!', 'Area: 1 m² = 100 dm² = 10,000 cm²: the factor gets squared!')],
  },
  scale: {
    noAxes: true,
    sliders: [
      { k: 'N', ru: 'Масштаб 1 : N (тысяч)', en: 'Scale 1 : N (thousands)', min: 1, max: 100, step: 1, v: 25 },
      { k: 'l', ru: 'Расстояние на карте, см', en: 'Map distance, cm', min: 1, max: 12, step: 0.5, v: 6 },
    ],
    render: ({ p }) => {
      const A: Pt = [-6, -1];
      const B: Pt = [-6 + p.l, 1.5];
      return (
        <>
          <rect x={sx(-7.2)} y={sy(3.8)} width={14.4 * U} height={7.4 * U} rx={12} fill="#EAF3E6" stroke="#A9C9A0" />
          <path d={`M ${sx(-7)} ${sy(-2.5)} C ${sx(-3)} ${sy(-1)}, ${sx(0)} ${sy(-3)}, ${sx(7)} ${sy(-1.5)}`} fill="none" stroke="#7FB2E5" strokeWidth={10} strokeLinecap="round" />
          <Seg a={A} b={B} c={C2} w={4} />
          <circle cx={sx(A[0])} cy={sy(A[1])} r={7} fill={C2} />
          <circle cx={sx(B[0])} cy={sy(B[1])} r={7} fill={C2} />
          <Txt at={A} dx={-10} dy={22}>A</Txt>
          <Txt at={B}>B</Txt>
          <rect x={sx(-6.8)} y={sy(-3.2)} width={2 * U} height={8} fill={INK} />
          <rect x={sx(-4.8)} y={sy(-3.2)} width={2 * U} height={8} fill="#fff" stroke={INK} />
          <text x={sx(-6.8)} y={sy(-3.2) + 22} fontSize={11} fill={INK}>0</text>
          <text x={sx(-2.9)} y={sy(-3.2) + 22} fontSize={11} fill={INK}>{n((2 * p.N * 1000) / 100000, 2)} км</text>
        </>
      );
    },
    tex: ({ p }) => `${n(p.l)}\\text{ см} \\cdot ${p.N * 1000} = ${n(p.l * p.N * 1000)}\\text{ см} = ${n((p.l * p.N * 1000) / 100000, 3)}\\text{ км}`,
    facts: ({ p, lang }) => [L(lang, `Масштаб 1 : ${p.N * 1000} — 1 см на карте равен ${p.N * 1000} см = ${n((p.N * 1000) / 100000, 3)} км на местности.`, `Scale 1 : ${p.N * 1000}: 1 cm on the map is ${n((p.N * 1000) / 100000, 3)} km on the ground.`), L(lang, 'Чем больше N, тем мельче карта и тем больше места на ней помещается.', 'The bigger N, the smaller the map scale and the more ground it covers.'), L(lang, 'Площади меняются в N² раз!', 'Areas change N² times!')],
  },
};

const initP = (pre: Preset): P => Object.fromEntries((pre.sliders ?? []).map((s) => [s.k, s.v]));

export const GeoBoard: React.FC<{ id: GeomId; lang: Lang }> = ({ id, lang }) => {
  const pre = PRESETS[id];
  const [pts, setPts] = useState<Pts>(() => ({ ...(pre.pts ?? {}) }));
  const [p, setP] = useState<P>(() => initP(pre));
  const [drag, setDrag] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    setPts({ ...(pre.pts ?? {}) });
    setP(initP(pre));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (e: React.PointerEvent) => {
    if (!drag || !svg.current) return;
    const m = svg.current.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const snap = pre.snap ?? 0.5;
    let pt: Pt = [Math.round(((q.x - VW / 2) / U) / snap) * snap, Math.round(((VH / 2 - q.y) / U) / snap) * snap];
    pt = [Math.max(-7.5, Math.min(7.5, pt[0])), Math.max(-4.5, Math.min(4.5, pt[1]))];
    if (pre.constrain) pt = pre.constrain(drag, pt, pts);
    setPts({ ...pts, [drag]: pt });
  };

  const c: Ctx = { pts, p, lang };
  const facts = pre.facts(c).filter(Boolean);
  const tex = pre.tex?.(c);
  useScreenDetail('model-geom', `Чертёж на экране. ${Object.entries(pts).map(([k, v]) => `${k}(${n(v[0])}; ${n(v[1])})`).join(', ')} ${tex ?? ''} ${facts.join(' ')}`);

  const grid = [];
  for (let x = -8; x <= 8; x++) grid.push(<line key={`x${x}`} x1={sx(x)} y1={0} x2={sx(x)} y2={VH} stroke={x === 0 && !pre.noAxes ? INK : '#ECECE7'} strokeWidth={x === 0 && !pre.noAxes ? 1.5 : 1} />);
  for (let y = -5; y <= 5; y++) grid.push(<line key={`y${y}`} x1={0} y1={sy(y)} x2={VW} y2={sy(y)} stroke={y === 0 && !pre.noAxes ? INK : '#ECECE7'} strokeWidth={y === 0 && !pre.noAxes ? 1.5 : 1} />);

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="relative">
        <svg
          ref={svg}
          viewBox={`0 0 ${VW} ${VH}`}
          className="block w-full h-auto select-none"
          style={{ background: '#FCFCFA', touchAction: drag ? 'none' : 'pan-y' }}
          onPointerMove={move}
          onPointerUp={() => setDrag(null)}
          onPointerLeave={() => setDrag(null)}
        >
          <defs>
            {[C1, C2, C3, C4].map((col) => (
              <marker key={col} id={`arr-${col.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={col} />
              </marker>
            ))}
          </defs>
          {grid}
          {pre.render(c)}
          {Object.entries(pts).map(([k, v]) => (
            <g
              key={k}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                e.preventDefault();
                svg.current?.setPointerCapture(e.pointerId);
                setDrag(k);
                setTouched(true);
              }}
            >
              {!touched && <circle cx={sx(v[0])} cy={sy(v[1])} r={10} fill={C4} className="geo-ping" />}
              <circle cx={sx(v[0])} cy={sy(v[1])} r={20} fill="transparent" />
              <circle cx={sx(v[0])} cy={sy(v[1])} r={drag === k ? 10 : 8} fill={drag === k ? C5 : C4} stroke="#fff" strokeWidth={3} style={{ transition: 'r 150ms' }} />
              <Txt at={v} c={INK} dx={10} dy={-12} size={15}>
                {k}
              </Txt>
            </g>
          ))}
        </svg>
        {Object.keys(pts).length > 0 && (
          <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-md bg-white/85 border border-line text-ink-2 inline-flex items-center gap-1 pointer-events-none">
            <Move className="w-3.5 h-3.5" />
            {L(lang, 'Тяни точки', 'Drag the points')}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4 border-t border-line">
        <div className="flex flex-col gap-3 min-w-0">
          {(pre.sliders ?? []).map((s) => (
            <label key={s.k} className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                <span>{lang === 'ru' ? s.ru : s.en}</span>
                <span className="font-mono text-ink">{n(p[s.k] ?? s.v)}</span>
              </span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={p[s.k] ?? s.v} onChange={(e) => setP({ ...p, [s.k]: Number(e.target.value) })} className="w-full accent-[#8E4EC6] cursor-pointer" />
            </label>
          ))}
          {tex && (
            <div className="overflow-x-auto text-ink text-[17px] py-1">
              <Formula tex={tex} display />
            </div>
          )}
          <button
            onClick={() => {
              setPts({ ...(pre.pts ?? {}) });
              setP(initP(pre));
            }}
            className="self-start h-8 px-3 rounded-lg border border-line text-xs text-ink-2 hover:text-ink inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {L(lang, 'Сбросить', 'Reset')}
          </button>
        </div>
        <ul className="text-sm text-ink-2 flex flex-col gap-1.5">
          {facts.map((f, i) => (
            <li key={i}>• {f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GeoBoard;
