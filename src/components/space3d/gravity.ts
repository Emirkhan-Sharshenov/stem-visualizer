/* N-body gravity for the 3D space sandbox.
   Bodies carry μ = G·m (so units can be anything consistent: km & s for the Earth scenes,
   AU & years for the Solar System). Integration is leapfrog (kick–drift–kick), which keeps orbits
   stable for a long time; touching bodies merge with momentum conserved. */

export type V3 = [number, number, number];

export interface Body {
  id: string;
  name: string;
  /** μ = G·m in scene units (distance³ / time²) */
  mu: number;
  /** physical radius for collisions, in distance units */
  r: number;
  /** radius used for drawing, in distance units (planets are often enlarged) */
  drawR: number;
  color: string;
  pos: V3;
  vel: V3;
  /** stays put (a fixed central star or planet) */
  fixed?: boolean;
  /** light source / glows */
  star?: boolean;
  /** the body was swallowed by another one */
  dead?: boolean;
}

export interface Units {
  /** label of a distance unit, a time unit and a speed unit */
  dist: { ru: string; en: string };
  time: { ru: string; en: string };
  speed: { ru: string; en: string };
  /** how many distance units fit in one 3D-scene unit */
  scale: number;
  /** simulated time per real second at ×1 */
  rate: number;
}

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

export interface Event {
  kind: 'merge';
  a: string;
  b: string;
  into: string;
}

export class Sim {
  bodies: Body[];
  t = 0;
  events: Event[] = [];
  constructor(bodies: Body[]) {
    this.bodies = bodies;
  }

  private acc(): V3[] {
    const bs = this.bodies;
    const out: V3[] = bs.map(() => [0, 0, 0]);
    for (let i = 0; i < bs.length; i++) {
      for (let j = i + 1; j < bs.length; j++) {
        const d = sub(bs[j].pos, bs[i].pos);
        const soft = Math.min(bs[i].r, bs[j].r) * 0.2;
        const r2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + soft * soft;
        const inv = 1 / (r2 * Math.sqrt(r2));
        out[i] = add(out[i], d, bs[j].mu * inv);
        out[j] = add(out[j], d, -bs[i].mu * inv);
      }
    }
    return out;
  }

  /** advance by dt, splitting into steps small enough for close passes */
  step(dt: number) {
    let left = dt;
    let guard = 0;
    while (left > 0 && guard++ < 4000) {
      const h = Math.min(left, this.safeStep());
      const a0 = this.acc();
      this.bodies.forEach((b, i) => {
        if (b.fixed) return;
        b.vel = add(b.vel, a0[i], h / 2);
        b.pos = add(b.pos, b.vel, h);
      });
      const a1 = this.acc();
      this.bodies.forEach((b, i) => {
        if (!b.fixed) b.vel = add(b.vel, a1[i], h / 2);
      });
      this.collide();
      this.t += h;
      left -= h;
    }
  }

  /** a step that keeps the fastest close encounter well resolved */
  private safeStep() {
    let best = Infinity;
    const bs = this.bodies;
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++) {
        const d = len(sub(bs[j].pos, bs[i].pos));
        const v = len(sub(bs[j].vel, bs[i].vel)) + 1e-9;
        const free = Math.sqrt((d * d * d) / (bs[i].mu + bs[j].mu + 1e-12));
        best = Math.min(best, (d / v) * 0.02, free * 0.01);
      }
    return Math.max(best, 1e-9);
  }

  private collide() {
    const bs = this.bodies;
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i];
        const b = bs[j];
        if (a.dead || b.dead) continue;
        if (len(sub(a.pos, b.pos)) > a.r + b.r) continue;
        const [big, small] = a.mu >= b.mu ? [a, b] : [b, a];
        const m = big.mu + small.mu;
        if (!big.fixed) {
          big.vel = [(big.vel[0] * big.mu + small.vel[0] * small.mu) / m, (big.vel[1] * big.mu + small.vel[1] * small.mu) / m, (big.vel[2] * big.mu + small.vel[2] * small.mu) / m];
          big.pos = [(big.pos[0] * big.mu + small.pos[0] * small.mu) / m, (big.pos[1] * big.mu + small.pos[1] * small.mu) / m, (big.pos[2] * big.mu + small.pos[2] * small.mu) / m];
        }
        // volumes add up
        big.r = Math.cbrt(big.r ** 3 + small.r ** 3);
        big.drawR = Math.cbrt(big.drawR ** 3 + small.drawR ** 3);
        big.mu = m;
        small.dead = true;
        this.events.push({ kind: 'merge', a: big.id, b: small.id, into: big.id });
      }
    if (bs.some((b) => b.dead)) this.bodies = bs.filter((b) => !b.dead);
  }

  /** total mechanical energy per unit G (for the readout) */
  energy() {
    const bs = this.bodies;
    let k = 0;
    let u = 0;
    for (const b of bs) k += 0.5 * b.mu * (b.vel[0] ** 2 + b.vel[1] ** 2 + b.vel[2] ** 2);
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) u -= (bs[i].mu * bs[j].mu) / len(sub(bs[i].pos, bs[j].pos));
    return k + u;
  }
}

/** orbit info of a body around the heaviest other body */
export function orbitAround(b: Body, bodies: Body[]) {
  const others = bodies.filter((o) => o.id !== b.id);
  if (!others.length) return null;
  const c = others.reduce((m, o) => (o.mu > m.mu ? o : m));
  const r = sub(b.pos, c.pos);
  const v = sub(b.vel, c.vel);
  const d = len(r);
  const sp = len(v);
  const mu = c.mu + b.mu;
  const eps = (sp * sp) / 2 - mu / d;
  const a = eps < 0 ? -mu / (2 * eps) : Infinity;
  const h: V3 = [r[1] * v[2] - r[2] * v[1], r[2] * v[0] - r[0] * v[2], r[0] * v[1] - r[1] * v[0]];
  const e = Math.sqrt(Math.max(0, 1 + (2 * eps * len(h) ** 2) / (mu * mu)));
  return {
    center: c,
    dist: d,
    speed: sp,
    /** speed of a circular orbit and the escape speed at this distance */
    vCirc: Math.sqrt(mu / d),
    vEsc: Math.sqrt((2 * mu) / d),
    bound: eps < 0,
    a,
    e,
    period: eps < 0 ? 2 * Math.PI * Math.sqrt(a ** 3 / mu) : Infinity,
  };
}
