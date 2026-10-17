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
