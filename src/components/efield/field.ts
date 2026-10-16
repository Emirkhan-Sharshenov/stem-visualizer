/* Electrostatics of point charges: Coulomb field, potential and field lines.
   Positions are in centimetres, charges in nanocoulombs; E comes out in N/C and φ in volts. */

export interface Charge {
  id: number;
  x: number;
  y: number;
  /** nC, never 0 */
  q: number;
}

export const W = 40;
export const H = 25;
export const K = 8.99e9;

/** E (N/C) and φ (V) at a point; a tiny softening keeps the numbers finite on top of a charge */
export function fieldAt(cs: Charge[], x: number, y: number) {
  let ex = 0;
  let ey = 0;
  let phi = 0;
  for (const c of cs) {
    const dx = (x - c.x) / 100;
    const dy = (y - c.y) / 100;
    const r2 = dx * dx + dy * dy + 1e-7;
    const r = Math.sqrt(r2);
    const kq = K * c.q * 1e-9;
    ex += (kq * dx) / (r2 * r);
    ey += (kq * dy) / (r2 * r);
    phi += kq / r;
  }
  return { ex, ey, e: Math.hypot(ex, ey), phi };
}

/** force between two charges, N (positive = repulsion) */
export function coulomb(a: Charge, b: Charge) {
  const r = Math.hypot(a.x - b.x, a.y - b.y) / 100;
  return (K * a.q * b.q * 1e-18) / (r * r);
}

const STEP = 0.12;
const HIT = 0.32;

/** follows E (dir = 1) or −E (dir = −1) from a point until it reaches a charge or leaves the box */
function trace(cs: Charge[], x0: number, y0: number, dir: 1 | -1, skip: number) {
  const pts: number[] = [x0, y0];
  let x = x0;
  let y = y0;
  for (let i = 0; i < 1400; i++) {
    const a = fieldAt(cs, x, y);
    if (a.e === 0) break;
    // midpoint step along the unit field direction
    const mx = x + ((dir * a.ex) / a.e) * STEP * 0.5;
    const my = y + ((dir * a.ey) / a.e) * STEP * 0.5;
    const b = fieldAt(cs, mx, my);
    if (b.e === 0) break;
    x += ((dir * b.ex) / b.e) * STEP;
    y += ((dir * b.ey) / b.e) * STEP;
    pts.push(x, y);
    if (x < -2 || y < -2 || x > W + 2 || y > H + 2) break;
    if (i > 3 && cs.some((c) => c.id !== skip && Math.hypot(c.x - x, c.y - y) < HIT)) break;
    if (i > 12 && Math.hypot(x - x0, y - y0) < STEP) break; // closed loop guard
  }
  return pts;
}

/** field lines: they leave positive charges (8 per nC) and end on negative ones */
export function fieldLines(cs: Charge[]): number[][] {
  const lines: number[][] = [];
  const pos = cs.filter((c) => c.q > 0);
  const sources = pos.length ? pos : cs.filter((c) => c.q < 0);
  const dir: 1 | -1 = pos.length ? 1 : -1;
  for (const c of sources) {
    const n = Math.max(6, Math.min(32, Math.round(8 * Math.abs(c.q))));
    for (let k = 0; k < n; k++) {
      const a = ((k + 0.5) / n) * Math.PI * 2;
      lines.push(trace(cs, c.x + Math.cos(a) * 0.4, c.y + Math.sin(a) * 0.4, dir, c.id));
    }
  }
  // net negative systems: a few lines arrive at the negative charges from far away
  if (pos.length) {
    const qPos = pos.reduce((s, c) => s + c.q, 0);
    const qNeg = -cs.filter((c) => c.q < 0).reduce((s, c) => s + c.q, 0);
    if (qNeg > qPos + 0.5)
      for (const c of cs.filter((c) => c.q < 0)) {
        const n = Math.round((8 * Math.abs(c.q) * (qNeg - qPos)) / qNeg);
        for (let k = 0; k < n; k++) {
          const a = ((k + 0.25) / n) * Math.PI * 2;
          lines.push(trace(cs, c.x + Math.cos(a) * 0.4, c.y + Math.sin(a) * 0.4, -1, c.id));
        }
      }
  }
  return lines;
}

export type PresetId = 'single' | 'dipole' | 'like' | 'capacitor' | 'quad';

export function preset(id: PresetId): Charge[] {
  let n = 0;
  const c = (x: number, y: number, q: number): Charge => ({ id: ++n, x, y, q });
  switch (id) {
    case 'single':
      return [c(20, 12.5, 2)];
    case 'dipole':
      return [c(14, 12.5, 2), c(26, 12.5, -2)];
    case 'like':
      return [c(14, 12.5, 2), c(26, 12.5, 2)];
    case 'quad':
      return [c(15, 8, 2), c(25, 8, -2), c(25, 17, 2), c(15, 17, -2)];
    case 'capacitor':
      return [
        ...Array.from({ length: 9 }, (_, i) => c(10 + i * 2.5, 7.5, 1)),
        ...Array.from({ length: 9 }, (_, i) => c(10 + i * 2.5, 17.5, -1)),
      ];
  }
}
