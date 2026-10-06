/* A small agent-based ecosystem: grass regrows on a grid, rabbits graze, foxes hunt rabbits.
   Every animal spends energy to live and move, eats to gain it, breeds when it has plenty
   and dies when it runs out — the classic predator–prey cycles come out by themselves. */

export interface Params {
  /** grass regrowth per tick (share of a full cell) */
  grow: number;
  /** rabbit: energy from a full cell of grass, breeding threshold */
  rabbitGain: number;
  rabbitBreed: number;
  /** fox: energy from one rabbit, breeding threshold, hunting radius */
  foxGain: number;
  foxBreed: number;
  foxSense: number;
  /** chance to catch a rabbit within reach, and energy a fox burns per tick */
  foxCatch: number;
  foxCost: number;
  /** number of burrows where rabbits are safe */
  burrows: number;
}

export const DEFAULTS: Params = { grow: 0.01, rabbitGain: 3.2, rabbitBreed: 11, foxGain: 8, foxBreed: 30, foxSense: 5, foxCatch: 0.4, foxCost: 0.15, burrows: 8 };

export interface Animal {
  x: number;
  y: number;
  e: number;
  age: number;
  dx: number;
  dy: number;
}

/** burrow positions (only the first p.burrows are open) */
export const BURROWS = Array.from({ length: 16 }, (_, i) => ({ x: ((i * 37) % 60) + 2, y: ((i * 23) % 34) + 2 }));
const safe = (a: { x: number; y: number }, n: number) => BURROWS.slice(0, n).some((b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < 2.5);

export const GW = 64;
export const GH = 38;

export interface World {
  grass: Float32Array;
  rabbits: Animal[];
  foxes: Animal[];
  t: number;
  /** energy that reached each level since the last reset of the counters */
  flow: { grassEaten: number; rabbitGot: number; foxGot: number };
  history: { t: number; grass: number; rabbits: number; foxes: number }[];
  rand: () => number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const spawn = (r: () => number, e: number): Animal => ({ x: r() * GW, y: r() * GH, e, age: Math.floor(r() * 100), dx: r() - 0.5, dy: r() - 0.5 });

export function makeWorld(rabbits = 80, foxes = 8, seed = Date.now() % 100000): World {
  const r = rng(seed);
  const grass = new Float32Array(GW * GH);
  for (let i = 0; i < grass.length; i++) grass[i] = 0.4 + r() * 0.6;
  return {
    grass,
    rabbits: Array.from({ length: rabbits }, () => spawn(r, 6)),
    foxes: Array.from({ length: foxes }, () => spawn(r, 14)),
    t: 0,
    flow: { grassEaten: 0, rabbitGot: 0, foxGot: 0 },
    history: [],
    rand: r,
  };
}

const wrap = (v: number, max: number) => ((v % max) + max) % max;
const cell = (x: number, y: number) => Math.floor(wrap(y, GH)) * GW + Math.floor(wrap(x, GW));

export function step(w: World, p: Params) {
  const r = w.rand;
  // grass
  for (let i = 0; i < w.grass.length; i++) w.grass[i] = Math.min(1, w.grass[i] + p.grow * (0.6 + 0.8 * r()));

  // rabbits: wander towards greener cells, graze, breed
  const born: Animal[] = [];
  for (const a of w.rabbits) {
    let best = -1;
    let bx = 0;
    let by = 0;
    for (let k = 0; k < 4; k++) {
      const ang = r() * Math.PI * 2;
      const g = w.grass[cell(a.x + Math.cos(ang) * 1.5, a.y + Math.sin(ang) * 1.5)];
      if (g > best) {
        best = g;
        bx = Math.cos(ang);
        by = Math.sin(ang);
      }
    }
    // run from a fox that is very close
    for (const f of w.foxes) {
      const ddx = a.x - f.x;
      const ddy = a.y - f.y;
      if (ddx * ddx + ddy * ddy < 6) {
        bx = ddx;
        by = ddy;
        break;
      }
    }
    const len = Math.hypot(bx, by) || 1;
    a.dx = a.dx * 0.6 + (bx / len) * 0.4;
    a.dy = a.dy * 0.6 + (by / len) * 0.4;
    a.x = wrap(a.x + a.dx * 0.55, GW);
    a.y = wrap(a.y + a.dy * 0.55, GH);
    const c = cell(a.x, a.y);
    const bite = Math.min(w.grass[c], 0.35);
    w.grass[c] -= bite;
    a.e += bite * p.rabbitGain - 0.16;
    w.flow.grassEaten += bite;
    w.flow.rabbitGot += bite * p.rabbitGain;
    a.age++;
    if (a.e > p.rabbitBreed && r() < 0.05) {
      a.e /= 2;
      born.push({ ...a, dx: r() - 0.5, dy: r() - 0.5, age: 0 });
    }
  }
  w.rabbits = w.rabbits.filter((a) => a.e > 0 && a.age < 700).concat(born);

  // foxes: chase the nearest rabbit they can sense, eat it, breed
  const foxBorn: Animal[] = [];
  const eaten = new Set<Animal>();
  // foxes get in each other's way: the more of them, the harder each one hunts
  const catchP = p.foxCatch / (1 + w.foxes.length / 30);
  for (const f of w.foxes) {
    let target: Animal | null = null;
    // a well-fed fox does not hunt
    let bestD = f.e > p.foxBreed * 1.15 ? 0 : p.foxSense * p.foxSense;
    for (const a of w.rabbits) {
      if (eaten.has(a) || safe(a, p.burrows)) continue;
      const ddx = a.x - f.x;
      const ddy = a.y - f.y;
      const d = ddx * ddx + ddy * ddy;
      if (d < bestD) {
        bestD = d;
        target = a;
      }
    }
    if (target) {
      const len = Math.sqrt(bestD) || 1;
      f.dx = f.dx * 0.3 + ((target.x - f.x) / len) * 0.7;
      f.dy = f.dy * 0.3 + ((target.y - f.y) / len) * 0.7;
    } else {
      f.dx = f.dx * 0.9 + (r() - 0.5) * 0.4;
      f.dy = f.dy * 0.9 + (r() - 0.5) * 0.4;
    }
    const sp = Math.hypot(f.dx, f.dy) || 1;
    f.x = wrap(f.x + (f.dx / sp) * 0.8, GW);
    f.y = wrap(f.y + (f.dy / sp) * 0.8, GH);
    f.e -= p.foxCost;
    f.age++;
    if (target && bestD < 1.2 && r() < catchP) {
      eaten.add(target);
      f.e += p.foxGain;
      w.flow.foxGot += p.foxGain;
    }
    if (f.e > p.foxBreed && r() < 0.03) {
      f.e /= 2;
      foxBorn.push({ ...f, dx: r() - 0.5, dy: r() - 0.5, age: 0 });
    }
  }
  if (eaten.size) w.rabbits = w.rabbits.filter((a) => !eaten.has(a));
  w.foxes = w.foxes.filter((f) => f.e > 0 && f.age < 900).concat(foxBorn);

  // migration from neighbouring places keeps a population from vanishing for good
  if (w.rabbits.length < 3 && r() < 0.05) w.rabbits.push(spawn(r, 6));
  if (w.foxes.length === 0 && r() < 0.004) w.foxes.push(spawn(r, 14));

  // keep the screen from flooding
  if (w.rabbits.length > 900) w.rabbits.length = 900;
  if (w.foxes.length > 250) w.foxes.length = 250;

  w.t++;
  if (w.t % 5 === 0) {
    let g = 0;
    for (let i = 0; i < w.grass.length; i++) g += w.grass[i];
    w.history.push({ t: w.t, grass: g / w.grass.length, rabbits: w.rabbits.length, foxes: w.foxes.length });
    if (w.history.length > 600) w.history.shift();
  }
}
