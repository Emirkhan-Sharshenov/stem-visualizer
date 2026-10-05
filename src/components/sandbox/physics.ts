/* Mechanics sandbox engine.
   Bodies are point masses with a contact radius (blocks don't rotate, which is exactly the school model).
   Contacts, friction and ropes are solved with sequential impulses (like Box2D), so static friction,
   taut/slack ropes and stacking come out right; springs, gravity, drag and pushes are plain forces.
   All units are SI: metres, kilograms, seconds, newtons. y points up, the ground is y = 0. */

export type Vec = { x: number; y: number };
const v = (x: number, y: number): Vec => ({ x, y });
const sub = (a: Vec, b: Vec) => v(a.x - b.x, a.y - b.y);
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const len = (a: Vec) => Math.hypot(a.x, a.y);
const norm = (a: Vec) => {
  const l = len(a) || 1;
  return v(a.x / l, a.y / l);
};

export interface Body {
  id: string;
  kind: 'block' | 'ball';
  x: number;
  y: number;
  vx: number;
  vy: number;
  m: number;
  /** half-size of a block / radius of a ball, m */
  r: number;
  color: string;
  /** external push: magnitude (N) and direction (degrees from +x) */
  F: number;
  Fdeg: number;
  trace: boolean;
}

export interface Anchor {
  id: string;
  kind: 'pulley' | 'hook';
  x: number;
  y: number;
}

export interface Incline {
  id: string;
  kind: 'incline';
  x: number;
  w: number;
  deg: number;
  /** which side is high */
  flip: boolean;
  mu: number;
}
export interface Table {
  id: string;
  kind: 'table';
  x: number;
  w: number;
  h: number;
  mu: number;
}
export type Solid = Incline | Table;

export interface Spring {
  id: string;
  kind: 'spring';
  a: string;
  b: string;
  k: number;
  L0: number;
}
/** a rope a→b, optionally running over a pulley */
export interface Rope {
  id: string;
  kind: 'rope';
  a: string;
  b: string;
  via?: string;
  L: number;
}
export type Link = Spring | Rope;

export interface Laws {
  g: number;
  friction: boolean;
  /** ground friction coefficient */
  groundMu: number;
  air: boolean;
  /** drag coefficient (×½ρC, kg/m³) */
  airK: number;
  /** restitution of impacts: 1 elastic, 0 perfectly inelastic */
  e: number;
}

export interface Scene {
  W: number;
  H: number;
  bodies: Body[];
  anchors: Anchor[];
  solids: Solid[];
  links: Link[];
  laws: Laws;
}

/** forces acting on a body during the last frame, for arrows and readouts */
export interface ForceSet {
  gravity: Vec;
  normal: Vec;
  friction: Vec;
  tension: Vec;
  spring: Vec;
  push: Vec;
  drag: Vec;
}
const zeroForces = (): ForceSet => ({ gravity: v(0, 0), normal: v(0, 0), friction: v(0, 0), tension: v(0, 0), spring: v(0, 0), push: v(0, 0), drag: v(0, 0) });

export const PULLEY_R = 0.25;

/** where a rope leaves a pulley towards point p: the side of the wheel, so hanging parts are vertical */
export function ropeExit(pulley: Vec, p: Vec): Vec {
  const dx = p.x - pulley.x;
  if (Math.abs(dx) < 1e-6) return pulley;
  return v(pulley.x + Math.sign(dx) * Math.min(PULLEY_R, Math.abs(dx)), pulley.y);
}

/** current length of a rope's path */
export function ropePath(pa: Vec, pb: Vec, pv: Vec | null) {
  if (!pv) return len(sub(pa, pb));
  return len(sub(pa, ropeExit(pv, pa))) + len(sub(pb, ropeExit(pv, pb)));
}

/* ---------- static geometry ---------- */

interface Segment {
  a: Vec;
  b: Vec;
  mu: number;
}

export function inclinePoints(s: Incline): Vec[] {
  const h = s.w * Math.tan((s.deg * Math.PI) / 180);
  return s.flip ? [v(s.x, 0), v(s.x + s.w, 0), v(s.x, h)] : [v(s.x, 0), v(s.x + s.w, 0), v(s.x + s.w, h)];
}

function segments(scene: Scene): Segment[] {
  const mu = (m: number) => (scene.laws.friction ? m : 0);
  const out: Segment[] = [
    { a: v(-50, 0), b: v(scene.W + 50, 0), mu: mu(scene.laws.groundMu) },
    { a: v(0, 0), b: v(0, 60), mu: 0 },
    { a: v(scene.W, 0), b: v(scene.W, 60), mu: 0 },
  ];
  for (const s of scene.solids) {
    if (s.kind === 'incline') {
      const [p0, p1, p2] = inclinePoints(s);
      // slope and the vertical back side (which is which depends on flip)
      out.push({ a: p0, b: p2, mu: mu(s.mu) }, { a: p1, b: p2, mu: mu(s.mu) });
    } else {
      const l = v(s.x, s.h);
      const r = v(s.x + s.w, s.h);
      out.push({ a: l, b: r, mu: mu(s.mu) }, { a: v(s.x, 0), b: l, mu: 0 }, { a: v(s.x + s.w, 0), b: r, mu: 0 });
    }
  }
  return out;
}

function closest(p: Vec, s: Segment): Vec {
  const ab = sub(s.b, s.a);
  const t = Math.max(0, Math.min(1, dot(sub(p, s.a), ab) / (dot(ab, ab) || 1)));
  return v(s.a.x + ab.x * t, s.a.y + ab.y * t);
}

/* ---------- world ---------- */

interface Contact {
  a: Body;
  b: Body | null;
  n: Vec;
  pen: number;
  mu: number;
  bounce: number;
  ln: number;
  lt: number;
}

export interface Stats {
  t: number;
  forces: Record<string, ForceSet>;
  /** total energy split, J */
  kinetic: number;
  potential: number;
  elastic: number;
  lost: number;
  /** momentum of the whole system, kg·m/s */
  px: number;
  py: number;
  /** each body's acceleration (smoothed), m/s² */
  acc: Record<string, Vec>;
  /** tension in each rope, N */
  ropeT: Record<string, number>;
}

export class World {
  scene: Scene;
  t = 0;
  forces: Record<string, ForceSet> = {};
  acc: Record<string, Vec> = {};
  ropeT: Record<string, number> = {};
  traces: Record<string, Vec[]> = {};
  /** energy bookkeeping: what friction, drag and impacts have turned into heat */
  private e0 = 0;
  private work = 0;
  /** a body the user is dragging: it follows the pointer */
  held: { id: string; x: number; y: number } | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.rebase();
  }

  body(id: string) {
    return this.scene.bodies.find((b) => b.id === id);
  }
  point(id: string): Vec | null {
    const b = this.body(id);
    if (b) return v(b.x, b.y);
    const a = this.scene.anchors.find((x) => x.id === id);
    return a ? v(a.x, a.y) : null;
  }

  /** start counting losses from the current state (after the user edits something) */
  rebase() {
    this.e0 = this.mechanical();
    this.work = 0;
  }

  mechanical() {
    return this.kinetic() + this.potential() + this.elastic();
  }
  kinetic() {
    return this.scene.bodies.reduce((s, b) => s + 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy), 0);
  }
  potential() {
    return this.scene.bodies.reduce((s, b) => s + b.m * this.scene.laws.g * (b.y - b.r), 0);
  }
  elastic() {
    let s = 0;
    for (const l of this.scene.links) {
      if (l.kind !== 'spring') continue;
      const a = this.point(l.a);
      const b = this.point(l.b);
      if (a && b) s += 0.5 * l.k * (len(sub(a, b)) - l.L0) ** 2;
    }
    return s;
  }

  stats(): Stats {
    const mech = this.mechanical();
    return {
      t: this.t,
      forces: this.forces,
      kinetic: this.kinetic(),
      potential: this.potential(),
      elastic: this.elastic(),
      lost: Math.max(0, this.e0 + this.work - mech),
      px: this.scene.bodies.reduce((s, b) => s + b.m * b.vx, 0),
      py: this.scene.bodies.reduce((s, b) => s + b.m * b.vy, 0),
      acc: this.acc,
      ropeT: this.ropeT,
    };
  }

  /** work out the forces in the current pose without moving anything (for the paused picture) */
  probe() {
    const saved = this.scene.bodies.map((b) => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy }));
    const t = this.t;
    const traces = this.traces;
    this.traces = {};
    this.step(1 / 240, 2);
    this.scene.bodies.forEach((b, i) => Object.assign(b, saved[i]));
    this.t = t;
    this.traces = traces;
  }

  /** advance by dt seconds (split into small substeps) */
  step(dt: number, sub = 10) {
    const h = dt / sub;
    const { bodies } = this.scene;
    const before = Object.fromEntries(bodies.map((b) => [b.id, v(b.vx, b.vy)]));
    const acc: Record<string, ForceSet> = Object.fromEntries(bodies.map((b) => [b.id, zeroForces()]));
    const ropeT: Record<string, number> = {};
    for (let i = 0; i < sub; i++) this.substep(h, acc, ropeT);
    // average the forces over the frame
    for (const b of bodies) {
      const f = acc[b.id];
      for (const k of Object.keys(f) as (keyof ForceSet)[]) f[k] = v(f[k].x / sub, f[k].y / sub);
      const a = v((b.vx - before[b.id].x) / dt, (b.vy - before[b.id].y) / dt);
      const old = this.acc[b.id] ?? a;
      this.acc[b.id] = v(old.x * 0.8 + a.x * 0.2, old.y * 0.8 + a.y * 0.2);
      if (b.trace) {
        const tr = (this.traces[b.id] ??= []);
        const last = tr[tr.length - 1];
        if (!last || Math.hypot(last.x - b.x, last.y - b.y) > 0.04) tr.push(v(b.x, b.y));
        if (tr.length > 1500) tr.shift();
      }
    }
    for (const k of Object.keys(ropeT)) ropeT[k] /= sub;
    this.forces = acc;
    this.ropeT = ropeT;
    this.t += dt;
  }

  private substep(h: number, F: Record<string, ForceSet>, ropeT: Record<string, number>) {
    const { bodies, links, laws } = this.scene;
    const free = bodies.filter((b) => this.held?.id !== b.id);

    // 1. forces → velocities
    for (const b of free) {
      const f = F[b.id];
      const g = v(0, -b.m * laws.g);
      const push = v(b.F * Math.cos((b.Fdeg * Math.PI) / 180), b.F * Math.sin((b.Fdeg * Math.PI) / 180));
      const sp = Math.hypot(b.vx, b.vy);
      const area = (2 * b.r) ** 2;
      const drag = laws.air ? v(-laws.airK * area * sp * b.vx, -laws.airK * area * sp * b.vy) : v(0, 0);
      f.gravity = v(f.gravity.x + g.x, f.gravity.y + g.y);
      f.push = v(f.push.x + push.x, f.push.y + push.y);
      f.drag = v(f.drag.x + drag.x, f.drag.y + drag.y);
      b.vx += ((g.x + push.x + drag.x) / b.m) * h;
      b.vy += ((g.y + push.y + drag.y) / b.m) * h;
      this.work += (push.x * b.vx + push.y * b.vy) * h;
    }
    for (const l of links) {
      if (l.kind !== 'spring') continue;
      const pa = this.point(l.a);
      const pb = this.point(l.b);
      if (!pa || !pb) continue;
      const d = sub(pb, pa);
      const dist = len(d) || 1e-6;
      const fmag = l.k * (dist - l.L0);
      const u = v(d.x / dist, d.y / dist);
      for (const [id, s] of [
        [l.a, 1],
        [l.b, -1],
      ] as const) {
        const b = this.body(id);
        if (!b || this.held?.id === b.id) continue;
        const fv = v(u.x * fmag * s, u.y * fmag * s);
        F[b.id].spring = v(F[b.id].spring.x + fv.x, F[b.id].spring.y + fv.y);
        b.vx += (fv.x / b.m) * h;
        b.vy += (fv.y / b.m) * h;
      }
    }

    // a dragged body moves with the pointer and carries that velocity when released
    if (this.held) {
      const b = this.body(this.held.id);
      if (b) {
        b.vx = (this.held.x - b.x) / Math.max(h * 6, 1e-4);
        b.vy = (this.held.y - b.y) / Math.max(h * 6, 1e-4);
      }
    }

    // 2. contacts
    const contacts: Contact[] = [];
    const segs = segments(this.scene);
    for (const b of bodies) {
      for (const s of segs) {
        const c = closest(v(b.x, b.y), s);
        const d = sub(v(b.x, b.y), c);
        const dist = len(d);
        if (dist < b.r + 0.002 && dist > 1e-9) {
          const n = v(d.x / dist, d.y / dist);
          const vn = b.vx * n.x + b.vy * n.y;
          contacts.push({ a: b, b: null, n, pen: b.r - dist, mu: s.mu, bounce: vn < -0.6 ? -laws.e * vn : 0, ln: 0, lt: 0 });
        }
      }
    }
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const d = v(a.x - b.x, a.y - b.y);
        const dist = len(d);
        if (dist < a.r + b.r && dist > 1e-9) {
          const n = v(d.x / dist, d.y / dist);
          const vn = (a.vx - b.vx) * n.x + (a.vy - b.vy) * n.y;
          const mu = laws.friction ? 0.3 : 0;
          contacts.push({ a, b, n, pen: a.r + b.r - dist, mu, bounce: vn < -0.3 ? -laws.e * vn : 0, ln: 0, lt: 0 });
        }
      }

    // 3. ropes (they only pull)
    const ropes = links.filter((l): l is Rope => l.kind === 'rope').map((r) => ({ r, l: 0 }));

    const inv = (b: Body | null | undefined) => (!b || this.held?.id === b.id ? 0 : 1 / b.m);
    for (let it = 0; it < 12; it++) {
      for (const c of contacts) {
        const ia = inv(c.a);
        const ib = inv(c.b);
        const k = ia + ib;
        if (!k) continue;
        const rv = v(c.a.vx - (c.b?.vx ?? 0), c.a.vy - (c.b?.vy ?? 0));
        const vn = dot(rv, c.n);
        const bias = c.bounce;
        const dn = (-(vn - bias)) / k;
        const nl = Math.max(0, c.ln + dn);
        const pn = nl - c.ln;
        c.ln = nl;
        this.apply(c, c.n, pn, ia, ib);
        // friction along the surface
        const t = v(-c.n.y, c.n.x);
        const rv2 = v(c.a.vx - (c.b?.vx ?? 0), c.a.vy - (c.b?.vy ?? 0));
        const vt = dot(rv2, t);
        const dt = -vt / k;
        const max = c.mu * c.ln;
        const tl = Math.max(-max, Math.min(max, c.lt + dt));
        const pt = tl - c.lt;
        c.lt = tl;
        this.apply(c, t, pt, ia, ib);
      }
      for (const R of ropes) {
        const { r } = R;
        const pa = this.point(r.a);
        const pb = this.point(r.b);
        const pv = r.via ? this.point(r.via) : null;
        if (!pa || !pb) continue;
        const ua = norm(sub(pa, pv ? ropeExit(pv, pa) : pb));
        const ub = norm(sub(pb, pv ? ropeExit(pv, pb) : pa));
        const C = ropePath(pa, pb, pv) - r.L;
        const A = this.body(r.a);
        const B = this.body(r.b);
        const ia = inv(A);
        const ib = inv(B);
        const k = ia + ib;
        if (!k) continue;
        const cd = (A ? A.vx * ua.x + A.vy * ua.y : 0) + (B ? B.vx * ub.x + B.vy * ub.y : 0);
        // taut: pull back gently; slack: only act if the gap would close within this step
        const bias = C > 0 ? (0.2 / h) * Math.max(0, C - 0.002) : C / h;
        const dl = -(cd + bias) / k;
        const nl = Math.min(0, R.l + dl);
        const p = nl - R.l;
        R.l = nl;
        if (A && ia) {
          A.vx += ua.x * p * ia;
          A.vy += ua.y * p * ia;
        }
        if (B && ib) {
          B.vx += ub.x * p * ib;
          B.vy += ub.y * p * ib;
        }
      }
    }

    // record contact and rope forces (impulse / time)
    for (const c of contacts) {
      const t = v(-c.n.y, c.n.x);
      for (const [b, s] of [
        [c.a, 1],
        [c.b, -1],
      ] as const) {
        if (!b || !F[b.id]) continue;
        F[b.id].normal = v(F[b.id].normal.x + (c.n.x * c.ln * s) / h, F[b.id].normal.y + (c.n.y * c.ln * s) / h);
        F[b.id].friction = v(F[b.id].friction.x + (t.x * c.lt * s) / h, F[b.id].friction.y + (t.y * c.lt * s) / h);
      }
    }
    for (const { r, l } of ropes) {
      ropeT[r.id] = (ropeT[r.id] ?? 0) - l / h;
      const pa = this.point(r.a);
      const pb = this.point(r.b);
      const pv = r.via ? this.point(r.via) : null;
      if (!pa || !pb) continue;
      for (const [id, from, to] of [
        [r.a, pa, pv ? ropeExit(pv, pa) : pb],
        [r.b, pb, pv ? ropeExit(pv, pb) : pa],
      ] as const) {
        const b = this.body(id);
        if (!b) continue;
        const u = norm(sub(to, from));
        F[b.id].tension = v(F[b.id].tension.x + (u.x * -l) / h, F[b.id].tension.y + (u.y * -l) / h);
      }
    }

    // 4. move, then push overlapping things apart (position fix, so it adds no speed)
    for (const b of bodies) {
      b.x += b.vx * h;
      b.y += b.vy * h;
    }
    for (const c of contacts) {
      const ia = inv(c.a);
      const ib = inv(c.b);
      const k = ia + ib;
      const fix = Math.max(0, c.pen - 0.002) * 0.6;
      if (!k || !fix) continue;
      c.a.x += c.n.x * fix * (ia / k);
      c.a.y += c.n.y * fix * (ia / k);
      if (c.b) {
        c.b.x -= c.n.x * fix * (ib / k);
        c.b.y -= c.n.y * fix * (ib / k);
      }
    }
    for (const b of bodies) {
      // nothing leaves the room
      b.x = Math.max(b.r, Math.min(this.scene.W - b.r, b.x));
      b.y = Math.max(b.r * 0.5, Math.min(this.scene.H * 2, b.y));
    }
  }

  private apply(c: Contact, dir: Vec, p: number, ia: number, ib: number) {
    c.a.vx += dir.x * p * ia;
    c.a.vy += dir.y * p * ia;
    if (c.b) {
      c.b.vx -= dir.x * p * ib;
      c.b.vy -= dir.y * p * ib;
    }
  }
}

/** deep copy, so "reset" can restore a scene */
export const cloneScene = (s: Scene): Scene => JSON.parse(JSON.stringify(s));
