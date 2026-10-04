import type { PartInfo } from '../../lib/three/ThreeStage';
import type { TimelineMark } from '../lab/Timeline';

/* Building blocks for timeline-driven 2D process simulations.
   Every engine draws a frame as a pure function of time `t`, so pausing,
   rewinding and scrubbing always show exactly the same picture. */

export type Lang = 'ru' | 'en';
export type T2 = { ru: string; en: string };

export const tx = (ru: string, en: string): T2 => ({ ru, en });
export const info = (ru: string, en: string, tRu: string, tEn: string): PartInfo => ({ title: { ru, en }, text: { ru: tRu, en: tEn } });

export interface SimParam {
  id: string;
  label: T2;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  digits?: number;
}

export interface SimMode {
  id: string;
  label: T2;
}

/** A stage of the process: a timeline mark with an explanation of what happens from here on */
export interface Stage extends TimelineMark {
  text?: T2;
}

export interface Frame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  /** parameter values by id */
  p: Record<string, number>;
  mode: string;
  lang: Lang;
  L: (ru: string, en: string) => string;
  /** register a clickable circle */
  hit: (info: PartInfo, x: number, y: number, r: number) => void;
  /** register a clickable rectangle */
  hitRect: (info: PartInfo, x: number, y: number, w: number, h: number) => void;
}

export interface SimDef {
  id: string;
  title: T2;
  modes?: SimMode[];
  duration: number | ((mode: string, p: Record<string, number>) => number);
  loop?: boolean;
  stages?: Stage[] | ((mode: string, p: Record<string, number>) => Stage[]);
  params?: SimParam[] | ((mode: string) => SimParam[]);
  /** live readouts under the stage */
  metrics?: (f: { t: number; p: Record<string, number>; mode: string }) => { label: T2; value: string; tone?: 'good' | 'bad' }[];
  /** short "what to notice" hint for the current mode */
  tip?: (mode: string) => T2;
  draw: (f: Frame) => void;
}

/* ---------- palette (dark stage, matches the 3D labs) ---------- */

export const C = {
  bg: '#111214',
  panel: '#1A1C21',
  grid: '#1F2126',
  line: '#2C2F36',
  text: '#EDEDED',
  dim: '#8C8F98',
  faint: '#5A5D66',
  accent: '#2F5BFF',
  blue: '#5B8CFF',
  sky: '#8FA4FF',
  cyan: '#3DD6F5',
  teal: '#12A594',
  green: '#30A46C',
  lime: '#8BD450',
  yellow: '#FFD60A',
  amber: '#F5A524',
  orange: '#F76B15',
  red: '#E5484D',
  pink: '#F07AA0',
  purple: '#8E4EC6',
  violet: '#AB8AFF',
  brown: '#A0703C',
  white: '#FFFFFF',
  water: '#1B4F8A',
};

/* ---------- math ---------- */

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
/** progress of t through [a, b], 0..1 */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const ease = (t: number, a: number, b: number) => smooth(seg(t, a, b));
export const TAU = Math.PI * 2;

/** deterministic pseudo-random in [0, 1) from integers */
export function hash(i: number, j = 0, k = 0) {
  let h = (i * 374761393 + j * 668265263 + k * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** smooth deterministic wander in [-1, 1] for particle jitter */
export const wobble = (i: number, t: number, f = 1) => Math.sin(t * f * (1.3 + hash(i, 1)) + hash(i, 2) * TAU) * 0.6 + Math.sin(t * f * (2.7 + hash(i, 3)) + hash(i, 4) * TAU) * 0.4;

export function mixColor(a: string, b: string, k: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, k));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, k));
  const bl = Math.round(lerp(pa & 255, pb & 255, k));
  return `rgb(${r},${g},${bl})`;
}

export function alpha(hex: string, a: number) {
  const p = parseInt(hex.slice(1), 16);
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${a})`;
}

/* ---------- drawing ---------- */

export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill?: string, stroke?: string, lw = 1.5) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

/** shaded sphere (atoms, cells, planets) */
export function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = 0) {
  if (r <= 0) return;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * (1.8 + glow));
    g.addColorStop(0, alpha(color.startsWith('#') ? color : '#ffffff', 0.35 * glow));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * (1.8 + glow), 0, TAU);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, mixColor(color.startsWith('#') ? color : '#888888', '#ffffff', 0.45));
  g.addColorStop(0.55, color);
  g.addColorStop(1, mixColor(color.startsWith('#') ? color : '#888888', '#000000', 0.45));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: { size?: number; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; weight?: number; mono?: boolean; serif?: boolean } = {},
) {
  ctx.font = `${o.weight ?? 500} ${o.size ?? 13}px ${o.mono ? '"JetBrains Mono", monospace' : o.serif ? 'Newsreader, Georgia, serif' : 'Inter, system-ui, sans-serif'}`;
  ctx.fillStyle = o.color ?? C.text;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = o.baseline ?? 'middle';
  ctx.fillText(s, x, y);
}

/** label on a rounded dark chip */
export function tag(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: { color?: string; size?: number; align?: 'left' | 'center' | 'right'; bg?: string } = {}) {
  const size = o.size ?? 12;
  ctx.font = `500 ${size}px Inter, system-ui, sans-serif`;
  const w = ctx.measureText(s).width + 14;
  const h = size + 10;
  const x0 = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
  rrect(ctx, x0, y - h / 2, w, h, 6);
  ctx.fillStyle = o.bg ?? 'rgba(26,28,33,0.92)';
  ctx.fill();
  ctx.strokeStyle = o.color ? alpha(o.color, 0.55) : C.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, s, x0 + w / 2, y + 0.5, { size, color: o.color ?? C.text });
  return w;
}

export function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, o: { color?: string; width?: number; head?: number; dash?: number[] } = {}) {
  const color = o.color ?? C.text;
  const head = o.head ?? 8;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = o.width ?? 2;
  ctx.setLineDash(o.dash ?? []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(a) * head * 0.8, y2 - Math.sin(a) * head * 0.8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.4) * head, y2 - Math.sin(a - 0.4) * head);
  ctx.lineTo(x2 - Math.cos(a + 0.4) * head, y2 - Math.sin(a + 0.4) * head);
  ctx.closePath();
  ctx.fill();
}

export function line(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, width = 2, dash: number[] = []) {
  if (pts.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** faint background grid like the rest of the labs */
export function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number, step = 40) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
}

export interface Series {
  color: string;
  /** y for a given x */
  fn?: (x: number) => number;
  points?: [number, number][];
  label?: string;
  width?: number;
  dash?: number[];
}

/** compact chart panel; `upTo` draws curves only up to that x (process so far) */
export function chart(
  ctx: CanvasRenderingContext2D,
  o: { x: number; y: number; w: number; h: number; xMax: number; yMin?: number; yMax: number; series: Series[]; xLabel?: string; yLabel?: string; upTo?: number; cursor?: number; title?: string },
) {
  const { x, y, w, h, xMax, yMax } = o;
  const yMin = o.yMin ?? 0;
  rrect(ctx, x, y, w, h, 10);
  ctx.fillStyle = 'rgba(26,28,33,0.92)';
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  const px = x + 34;
  const py = y + (o.title ? 26 : 12);
  const pw = w - 46;
  const ph = h - (o.title ? 26 : 12) - 26;
  if (o.title) text(ctx, o.title, x + 12, y + 14, { size: 11.5, color: C.dim, align: 'left' });
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + ph);
  ctx.lineTo(px + pw, py + ph);
  ctx.stroke();
  if (o.xLabel) text(ctx, o.xLabel, px + pw, py + ph + 13, { size: 10.5, color: C.dim, align: 'right' });
  if (o.yLabel) text(ctx, o.yLabel, px - 6, py + 2, { size: 10.5, color: C.dim, align: 'right' });
  const X = (v: number) => px + (v / xMax) * pw;
  const Y = (v: number) => py + ph - ((v - yMin) / (yMax - yMin)) * ph;
  const end = o.upTo ?? xMax;
  o.series.forEach((s) => {
    const pts: [number, number][] = [];
    if (s.fn) {
      const n = 120;
      for (let i = 0; i <= n; i++) {
        const xv = (i / n) * xMax;
        if (xv > end) break;
        pts.push([X(xv), Y(clamp(s.fn(xv), yMin, yMax))]);
      }
    } else if (s.points) s.points.filter((p) => p[0] <= end).forEach((p) => pts.push([X(p[0]), Y(clamp(p[1], yMin, yMax))]));
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py - 2, pw, ph + 4);
    ctx.clip();
    line(ctx, pts, s.color, s.width ?? 2, s.dash);
    ctx.restore();
  });
  if (o.cursor !== undefined) {
    ctx.strokeStyle = alpha(C.sky, 0.5);
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(clamp(o.cursor, 0, xMax)), py);
    ctx.lineTo(X(clamp(o.cursor, 0, xMax)), py + ph);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // legend
  let lx = px + 6;
  o.series.forEach((s) => {
    if (!s.label) return;
    circle(ctx, lx + 4, py + 6, 3.5, s.color);
    text(ctx, s.label, lx + 11, py + 6.5, { size: 10.5, color: C.dim, align: 'left' });
    ctx.font = '500 10.5px Inter, system-ui, sans-serif';
    lx += ctx.measureText(s.label).width + 24;
  });
  return { X, Y, px, py, pw, ph };
}

/** sine path from (x1,y) to (x2,y) — waves, springs, light */
export function wave(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, amp: number, lambda: number, phase: number, color: string, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let x = x1; x <= x2; x += 2) {
    const yy = y + amp * Math.sin(((x - x1) / lambda) * TAU - phase);
    if (x === x1) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

/** wavelength (nm) → visible colour */
export function spectrumColor(nm: number) {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) [r, g, b] = [-(nm - 440) / 60, 0, 1];
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm < 510) [r, g, b] = [0, 1, -(nm - 510) / 20];
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm < 645) [r, g, b] = [1, -(nm - 645) / 65, 0];
  else [r, g, b] = [1, 0, 0];
  const f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (780 - nm)) / 80 : 1;
  const c = (v: number) => Math.round(255 * Math.pow(clamp(v * f), 0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
