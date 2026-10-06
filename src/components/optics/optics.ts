/* Optics bench: 2D ray tracing. Units are centimetres, y points down (screen-like).
   Refraction follows Snell's law (with total internal reflection), mirrors reflect with equal angles,
   thin lenses bend rays by the ideal-lens rule (a ray at height y gets its slope changed by −y/f).
   White light is split into seven colours with a Cauchy-type n(λ), so prisms make a spectrum. */

export type Vec = { x: number; y: number };
const v = (x: number, y: number): Vec => ({ x, y });
const add = (a: Vec, b: Vec) => v(a.x + b.x, a.y + b.y);
const sub = (a: Vec, b: Vec) => v(a.x - b.x, a.y - b.y);
const mul = (a: Vec, k: number) => v(a.x * k, a.y * k);
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const len = (a: Vec) => Math.hypot(a.x, a.y);
const norm = (a: Vec) => mul(a, 1 / (len(a) || 1));
const rot = (deg: number) => v(Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180));
const perp = (a: Vec) => v(-a.y, a.x);

export type LightColor = 'red' | 'green' | 'blue' | 'white';

interface Base {
  id: string;
  x: number;
  y: number;
  /** orientation in degrees */
  angle: number;
}
export interface Laser extends Base {
  kind: 'laser';
  color: LightColor;
}
export interface Beam extends Base {
  kind: 'beam';
  color: LightColor;
  /** width, cm */
  w: number;
  rays: number;
}
export interface Lamp extends Base {
  kind: 'lamp';
  color: LightColor;
  rays: number;
}
/** an upright arrow; rays leave its tip */
export interface Thing extends Base {
  kind: 'object';
  h: number;
}
export interface Lens extends Base {
  kind: 'lens';
  /** half the lens height */
  h: number;
  /** focal length: + converging, − diverging */
  f: number;
}
export interface Mirror extends Base {
  kind: 'mirror';
  h: number;
}
/** spherical mirror: R > 0 concave towards `angle`, R < 0 convex */
export interface Curved extends Base {
  kind: 'curved';
  h: number;
  R: number;
}
export interface Block extends Base {
  kind: 'block';
  w: number;
  h: number;
  n: number;
}
export interface Prism extends Base {
  kind: 'prism';
  size: number;
  n: number;
}
export interface Semi extends Base {
  kind: 'semi';
  r: number;
  n: number;
}
export type Source = Laser | Beam | Lamp | Thing;
export type Element = Lens | Mirror | Curved | Block | Prism | Semi;
export type Item = Source | Element;

export const isSource = (i: Item): i is Source => i.kind === 'laser' || i.kind === 'beam' || i.kind === 'lamp' || i.kind === 'object';

/* ---------- wavelengths ---------- */

const SPECTRUM = [
  { nm: 410, color: '#8B5CF6' },
  { nm: 450, color: '#3B82F6' },
  { nm: 490, color: '#22D3EE' },
  { nm: 530, color: '#22C55E' },
  { nm: 575, color: '#FACC15' },
  { nm: 610, color: '#F97316' },
  { nm: 660, color: '#EF4444' },
];
export const COLOR_OF: Record<Exclude<LightColor, 'white'>, { nm: number; color: string }> = {
  red: { nm: 650, color: '#FF4D4D' },
  green: { nm: 532, color: '#4ADE80' },
  blue: { nm: 460, color: '#60A5FA' },
};
/** n at a wavelength for a glass whose catalogue index (yellow light) is n0; dispersion a bit exaggerated so it's visible */
export const nAt = (n0: number, nm: number) => n0 + 9000 * (1 / (nm * nm) - 1 / (589 * 589));

/* ---------- surfaces ---------- */

type Surface =
  | { type: 'seg'; a: Vec; b: Vec; el: Element; role: 'glass' | 'mirror' | 'lens' }
  | { type: 'arc'; c: Vec; r: number; from: number; to: number; el: Element; role: 'glass' | 'mirror' };

export function polygon(el: Block | Prism): Vec[] {
  const c = v(el.x, el.y);
  const u = rot(el.angle);
  const w = perp(u);
  if (el.kind === 'block') {
    const hw = el.w / 2;
    const hh = el.h / 2;
    return [add(add(c, mul(u, -hw)), mul(w, -hh)), add(add(c, mul(u, hw)), mul(w, -hh)), add(add(c, mul(u, hw)), mul(w, hh)), add(add(c, mul(u, -hw)), mul(w, hh))];
  }
  // equilateral prism, apex pointing along -w (up when angle = 0)
  const s = el.size;
  const hgt = (s * Math.sqrt(3)) / 2;
  return [add(c, mul(w, (-2 * hgt) / 3)), add(add(c, mul(u, s / 2)), mul(w, hgt / 3)), add(add(c, mul(u, -s / 2)), mul(w, hgt / 3))];
}

/** end points of a flat element (lens or mirror) */
export function flatEnds(el: Lens | Mirror): [Vec, Vec] {
  const c = v(el.x, el.y);
  const t = rot(el.angle + 90);
  return [add(c, mul(t, -el.h)), add(c, mul(t, el.h))];
}

/** spherical mirror arc: centre, radius, angular span */
export function curvedArc(el: Curved) {
  const face = rot(el.angle);
  const c = add(v(el.x, el.y), mul(face, el.R));
  const r = Math.abs(el.R);
  const toVertex = Math.atan2(el.y - c.y, el.x - c.x);
  const span = Math.asin(Math.min(0.99, el.h / r));
  return { c, r, from: toVertex - span, to: toVertex + span };
}

function surfaces(items: Item[]): Surface[] {
  const out: Surface[] = [];
  for (const el of items) {
    if (el.kind === 'lens' || el.kind === 'mirror') {
      const [a, b] = flatEnds(el);
      out.push({ type: 'seg', a, b, el, role: el.kind === 'lens' ? 'lens' : 'mirror' });
    } else if (el.kind === 'curved') {
      const { c, r, from, to } = curvedArc(el);
      out.push({ type: 'arc', c, r, from, to, el, role: 'mirror' });
    } else if (el.kind === 'block' || el.kind === 'prism') {
      const p = polygon(el);
      p.forEach((a, i) => out.push({ type: 'seg', a, b: p[(i + 1) % p.length], el, role: 'glass' }));
    } else if (el.kind === 'semi') {
      // flat side across the diameter, round side facing `angle`
      const c = v(el.x, el.y);
      const t = rot(el.angle + 90);
      out.push({ type: 'seg', a: add(c, mul(t, -el.r)), b: add(c, mul(t, el.r)), el, role: 'glass' });
      const mid = (el.angle * Math.PI) / 180;
      out.push({ type: 'arc', c, r: el.r, from: mid - Math.PI / 2, to: mid + Math.PI / 2, el, role: 'glass' });
    }
  }
  return out;
}

const inArc = (ang: number, from: number, to: number) => {
  const TAU = Math.PI * 2;
  const a = (((ang - from) % TAU) + TAU) % TAU;
  return a <= (((to - from) % TAU) + TAU) % TAU + 1e-9;
};

interface Hit {
  t: number;
  p: Vec;
  n: Vec;
  s: Surface;
}

function intersect(o: Vec, d: Vec, s: Surface): Hit | null {
  if (s.type === 'seg') {
    const e = sub(s.b, s.a);
    const den = d.x * e.y - d.y * e.x;
    if (Math.abs(den) < 1e-12) return null;
    const w = sub(s.a, o);
    const t = (w.x * e.y - w.y * e.x) / den;
    const u = (w.x * d.y - w.y * d.x) / den;
    if (t < 1e-6 || u < 0 || u > 1) return null;
    const n = norm(perp(e));
    return { t, p: add(o, mul(d, t)), n, s };
  }
  const oc = sub(o, s.c);
  const b = dot(oc, d);
  const cc = dot(oc, oc) - s.r * s.r;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  for (const t of [-b - sq, -b + sq]) {
    if (t < 1e-6) continue;
    const p = add(o, mul(d, t));
    if (!inArc(Math.atan2(p.y - s.c.y, p.x - s.c.x), s.from, s.to)) continue;
    return { t, p, n: norm(sub(p, s.c)), s };
  }
  return null;
}

/* ---------- tracing ---------- */

export interface RaySeg {
  a: Vec;
  b: Vec;
  color: string;
  alpha: number;
  /** drawn dashed: a backward extension that shows a virtual image */
  dashed?: boolean;
}
/** where a ray met a surface, for drawing normals and angle labels */
export interface Event {
  p: Vec;
  n: Vec;
  inDeg: number;
  outDeg: number | null;
  kind: 'refract' | 'reflect' | 'tir' | 'lens';
  n1: number;
  n2: number;
  source: string;
}

export interface Trace {
  rays: RaySeg[];
  events: Event[];
}

const MAX_LEN = 1000;

function traceRay(o: Vec, d: Vec, nm: number, color: string, alpha: number, surfs: Surface[], out: Trace, source: string, depth = 0, tagEvents = true) {
  let pos = o;
  let dir = norm(d);
  let a = alpha;
  for (let bounce = 0; bounce < 40 && a > 0.04; bounce++) {
    let best: Hit | null = null;
    for (const s of surfs) {
      const h = intersect(pos, dir, s);
      if (h && (!best || h.t < best.t)) best = h;
    }
    if (!best) {
      out.rays.push({ a: pos, b: add(pos, mul(dir, MAX_LEN)), color, alpha: a });
      return;
    }
    out.rays.push({ a: pos, b: best.p, color, alpha: a });
    const { s, p } = best;
    let n = best.n;
    const cosI = dot(dir, n);
    // make n face against the incoming ray
    if (cosI > 0) n = mul(n, -1);
    const ci = -dot(dir, n);
    const inDeg = (Math.acos(Math.min(1, ci)) * 180) / Math.PI;
    if (s.role === 'mirror') {
      dir = norm(sub(dir, mul(n, 2 * dot(dir, n))));
      if (tagEvents) out.events.push({ p, n, inDeg, outDeg: inDeg, kind: 'reflect', n1: 1, n2: 1, source });
    } else if (s.role === 'lens') {
      const el = s.el as Lens;
      const c = v(el.x, el.y);
      const axis = rot(el.angle);
      const t = rot(el.angle + 90);
      const y = dot(sub(p, c), t);
      const da = dot(dir, axis);
      const sg = da >= 0 ? 1 : -1;
      const k = dot(dir, t) / Math.max(1e-9, Math.abs(da)) - y / el.f;
      const nd = norm(add(mul(axis, sg), mul(t, k)));
      if (tagEvents) out.events.push({ p, n: mul(axis, -sg), inDeg, outDeg: null, kind: 'lens', n1: 1, n2: 1, source });
      dir = nd;
    } else {
      const glass = s.el as Block | Prism | Semi;
      const ng = nAt(glass.n, nm);
      // entering if the surface's outward normal opposes the ray
      const outward = s.type === 'arc' ? best.n : outwardNormal(s, glass);
      const entering = dot(dir, outward) < 0;
      const n1 = entering ? 1 : ng;
      const n2 = entering ? ng : 1;
      const eta = n1 / n2;
      const k = 1 - eta * eta * (1 - ci * ci);
      if (k < 0) {
        dir = norm(sub(dir, mul(n, 2 * dot(dir, n))));
        if (tagEvents) out.events.push({ p, n, inDeg, outDeg: inDeg, kind: 'tir', n1, n2, source });
      } else {
        const refr = norm(add(mul(dir, eta), mul(n, eta * ci - Math.sqrt(k))));
        const outDeg = (Math.acos(Math.min(1, -dot(refr, n))) * 180) / Math.PI;
        if (tagEvents) out.events.push({ p, n, inDeg, outDeg, kind: 'refract', n1, n2, source });
        // a little light is always reflected too (Fresnel), shown faintly
        if (depth < 2 && a > 0.3) {
          const refl = norm(sub(dir, mul(n, 2 * dot(dir, n))));
          traceRay(add(p, mul(refl, 1e-3)), refl, nm, color, a * 0.18, surfs, out, source, depth + 1, false);
        }
        dir = refr;
      }
    }
    pos = add(p, mul(dir, 1e-4));
    if (s.role === 'glass') a *= 0.97;
  }
}

function outwardNormal(s: Surface & { type: 'seg' }, glass: Block | Prism | Semi): Vec {
  const mid = mul(add(s.a, s.b), 0.5);
  const n = norm(perp(sub(s.b, s.a)));
  const c = v(glass.x, glass.y);
  // the polygon centroid is inside; for the semicircle's flat side use the arc's direction
  const inside = glass.kind === 'semi' ? add(c, mul(rot(glass.angle), glass.r * 0.5)) : centroid(glass as Block | Prism);
  return dot(n, sub(mid, inside)) > 0 ? n : mul(n, -1);
}

function centroid(el: Block | Prism) {
  const p = polygon(el);
  return mul(p.reduce((s, q) => add(s, q), v(0, 0)), 1 / p.length);
}

export function trace(items: Item[]): Trace {
  const surfs = surfaces(items);
  const out: Trace = { rays: [], events: [] };
  for (const src of items.filter(isSource)) {
    const colors = src.kind === 'object' ? [{ nm: 589, color: '#FFD60A' }] : src.color === 'white' ? SPECTRUM : [COLOR_OF[src.color]];
    const a0 = src.kind === 'object' || src.color === 'white' ? 0.75 : 1;
    const emit = (o: Vec, d: Vec, alpha: number) => colors.forEach((c) => traceRay(o, d, c.nm, c.color, alpha * a0, surfs, out, src.id));
    if (src.kind === 'laser') emit(v(src.x, src.y), rot(src.angle), 1);
    else if (src.kind === 'beam') {
      const d = rot(src.angle);
      const t = rot(src.angle + 90);
      for (let i = 0; i < src.rays; i++) {
        const k = src.rays === 1 ? 0 : i / (src.rays - 1) - 0.5;
        emit(add(v(src.x, src.y), mul(t, k * src.w)), d, 0.8);
      }
    } else if (src.kind === 'lamp') {
      for (let i = 0; i < src.rays; i++) emit(v(src.x, src.y), rot(src.angle + (360 * i) / src.rays), 0.55);
    } else {
      // rays from the arrow's tip towards every lens / curved mirror: the three textbook rays
      const tip = v(src.x, src.y - src.h);
      for (const el of items) {
        if (el.kind !== 'lens' && el.kind !== 'curved') continue;
        const axis = rot(el.angle);
        const c = v(el.x, el.y);
        const f = el.kind === 'lens' ? el.f : el.R / 2;
        const towardEl = dot(sub(c, tip), axis) >= 0 ? axis : mul(axis, -1);
        const F = el.kind === 'lens' ? sub(c, mul(towardEl, f)) : add(c, mul(rot(el.angle), f));
        emit(tip, towardEl, 0.9); // parallel to the axis
        emit(tip, norm(sub(c, tip)), 0.9); // through the centre (vertex)
        const toF = sub(F, tip);
        if (len(toF) > 0.5 && dot(toF, towardEl) > 0) emit(tip, norm(toF), 0.9);
      }
      if (!items.some((e) => e.kind === 'lens' || e.kind === 'curved')) for (let i = -2; i <= 2; i++) emit(tip, rot(i * 12), 0.6);
    }
  }
  return out;
}

/* ---------- images by the lens / mirror formula ---------- */

export interface ImageInfo {
  /** distance object → lens/mirror, cm (positive) */
  d: number;
  /** image distance; > 0 real, < 0 virtual */
  di: number;
  f: number;
  /** magnification Γ = −d′/d */
  m: number;
  base: Vec;
  tip: Vec;
  real: boolean;
  kind: 'lens' | 'curved';
}

export function imageOf(obj: Thing, el: Lens | Curved): ImageInfo | null {
  const c = v(el.x, el.y);
  const axis = rot(el.angle);
  const t = rot(el.angle + 90);
  const base = v(obj.x, obj.y);
  const tip = v(obj.x, obj.y - obj.h);
  const f = el.kind === 'lens' ? el.f : el.R / 2;
  const side = dot(sub(base, c), axis);
  const d = Math.abs(side);
  if (d < 0.5 || Math.abs(d - f) < 0.05) return null;
  const di = 1 / (1 / f - 1 / d);
  const m = -di / d;
  // lens: real image on the far side; mirror: real image on the same side
  const dirOut = el.kind === 'lens' ? (side < 0 ? axis : mul(axis, -1)) : side < 0 ? mul(axis, -1) : axis;
  const yb = dot(sub(base, c), t);
  const yt = dot(sub(tip, c), t);
  const at = (y: number) => add(add(c, mul(dirOut, di)), mul(t, y * m));
  return { d, di, f, m, base: at(yb), tip: at(yt), real: di > 0, kind: el.kind };
}
