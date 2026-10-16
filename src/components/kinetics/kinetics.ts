/* A + B ⇌ AB in a box of moving particles.
   A collision of A and B reacts with probability e^(−Ea/T); AB falls apart with probability
   k·e^(−(Ea + Q)/T) per step. Q > 0 makes the forward reaction exothermic, so heating shifts the
   equilibrium back to A + B (Le Chatelier), and a catalyst lowers Ea for both directions, so it
   speeds things up without moving the equilibrium. */

export const BOX_H = 360;
export const R_SMALL = 5;
export const R_BIG = 7;

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = A, 1 = B, 2 = AB */
  t: 0 | 1 | 2;
}

export interface Params {
  /** temperature in model units, 1…6 ↔ 150…900 K */
  T: number;
  catalyst: boolean;
  /** box width, px */
  width: number;
}

export const EA = 4;
export const EA_CAT = 1.8;
export const Q = 8;
const K_BACK = 0.15;

export interface World {
  ps: Particle[];
  rand: () => number;
  fwd: number;
  back: number;
  history: { a: number; b: number; ab: number }[];
  tick: number;
}

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const speed = (T: number, t: number) => Math.sqrt(T) * (t === 2 ? 1.25 : 1.75);

export function spawn(w: World, t: 0 | 1 | 2, count: number, p: Params) {
  for (let i = 0; i < count; i++) {
    const a = w.rand() * Math.PI * 2;
    const v = speed(p.T, t) * (0.6 + w.rand() * 0.8);
    w.ps.push({ x: 10 + w.rand() * (p.width - 20), y: 10 + w.rand() * (BOX_H - 20), vx: Math.cos(a) * v, vy: Math.sin(a) * v, t });
  }
}

export function makeWorld(p: Params): World {
  const w: World = { ps: [], rand: rng(42), fwd: 0, back: 0, history: [], tick: 0 };
  spawn(w, 0, 60, p);
  spawn(w, 1, 60, p);
  return w;
}

export function count(w: World) {
  let a = 0;
  let b = 0;
  let ab = 0;
  for (const q of w.ps) {
    if (q.t === 0) a++;
    else if (q.t === 1) b++;
    else ab++;
  }
  return { a, b, ab };
}

export function step(w: World, p: Params) {
  const ea = p.catalyst ? EA_CAT : EA;
  const pF = Math.exp(-ea / p.T);
  const pB = K_BACK * Math.exp(-(ea + Q) / p.T);
  const ps = w.ps;
  // move, bounce off the walls, and nudge speeds towards the temperature (thermostat)
  for (const q of ps) {
    q.x += q.vx;
    q.y += q.vy;
    const r = q.t === 2 ? R_BIG : R_SMALL;
    if (q.x < r) {
      q.x = r;
      q.vx = Math.abs(q.vx);
    } else if (q.x > p.width - r) {
      q.x = p.width - r;
      q.vx = -Math.abs(q.vx);
    }
    if (q.y < r) {
      q.y = r;
      q.vy = Math.abs(q.vy);
    } else if (q.y > BOX_H - r) {
      q.y = BOX_H - r;
      q.vy = -Math.abs(q.vy);
    }
    const v = Math.hypot(q.vx, q.vy) || 1;
    const target = speed(p.T, q.t);
    const k = 1 + (target / v - 1) * 0.02;
    q.vx *= k;
    q.vy *= k;
  }
  // collisions A + B → AB
  const remove = new Set<number>();
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i];
    if (a.t !== 0 || remove.has(i)) continue;
    for (let j = 0; j < ps.length; j++) {
      const b = ps[j];
      if (b.t !== 1 || remove.has(j)) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy > (2 * R_SMALL) ** 2) continue;
      if (w.rand() < pF) {
        a.t = 2;
        a.x = (a.x + b.x) / 2;
        a.y = (a.y + b.y) / 2;
        a.vx = (a.vx + b.vx) / 2;
        a.vy = (a.vy + b.vy) / 2;
        remove.add(j);
        w.fwd++;
      } else {
        // unsuccessful collision: they bounce apart
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / d;
        const ny = dy / d;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel < 0) {
          a.vx -= rel * nx;
          a.vy -= rel * ny;
          b.vx += rel * nx;
          b.vy += rel * ny;
        }
      }
      break;
    }
  }
  if (remove.size) w.ps = ps.filter((_, i) => !remove.has(i));
  // AB → A + B
  const born: Particle[] = [];
  for (const q of w.ps) {
    if (q.t !== 2 || w.rand() >= pB) continue;
    const a = w.rand() * Math.PI * 2;
    const v = speed(p.T, 0);
    q.t = 0;
    born.push({ x: q.x + Math.cos(a) * 6, y: q.y + Math.sin(a) * 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 1 });
    q.vx = -Math.cos(a) * v;
    q.vy = -Math.sin(a) * v;
    w.back++;
  }
  w.ps.push(...born);
  w.tick++;
  if (w.tick % 10 === 0) {
    w.history.push(count(w));
    if (w.history.length > 300) w.history.shift();
  }
}
