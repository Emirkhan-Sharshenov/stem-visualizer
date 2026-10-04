import type { OrbitalType } from '../types/stem';

// Hydrogen-like orbitals in atomic units (Z = 1). Real (not complex) forms,
// so lobes have a definite sign that can be shown as phase.
export function psi(type: OrbitalType, x: number, y: number, z: number): number {
  const r = Math.sqrt(x * x + y * y + z * z);
  switch (type) {
    case '1s': return Math.exp(-r);
    case '2s': return (2 - r) * Math.exp(-r / 2);
    case '2pz': return z * Math.exp(-r / 2);
    case '2px': return x * Math.exp(-r / 2);
    case '3dz2': return (3 * z * z - r * r) * Math.exp(-r / 3);
    case '3dxy': return x * y * Math.exp(-r / 3);
    case '4f': return z * (5 * z * z - 3 * r * r) * Math.exp(-r / 4);
  }
}

const EXTENT: Record<OrbitalType, number> = { '1s': 5, '2s': 13, '2pz': 12, '2px': 12, '3dz2': 22, '3dxy': 22, '4f': 34 };

export interface OrbitalSample {
  positions: Float32Array; // display units, three.js y-up (physics z → y)
  signs: Int8Array;
  density: Float32Array; // 0..1 relative to max
  scale: number; // display units per Bohr radius
  count: number;
}

/** Rejection-sample |ψ|² and normalise so 97% of the cloud fits a radius of `fitRadius` */
export function sampleOrbital(type: OrbitalType, count: number, fitRadius = 2.6): OrbitalSample {
  const L = EXTENT[type];
  const rnd = () => (Math.random() * 2 - 1) * L;

  // Estimate the peak density so the acceptance test is properly normalised
  let max = 0;
  for (let i = 0; i < 40000; i++) {
    const p = psi(type, rnd(), rnd(), rnd());
    if (p * p > max) max = p * p;
  }
  max *= 1.1;

  const raw = new Float32Array(count * 3);
  const signs = new Int8Array(count);
  const density = new Float32Array(count);
  const radii: number[] = [];
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 600; tries++) {
    const x = rnd(), y = rnd(), z = rnd();
    const p = psi(type, x, y, z);
    const d = p * p;
    if (Math.random() * max > d) continue;
    raw[placed * 3] = x;
    raw[placed * 3 + 1] = z;
    raw[placed * 3 + 2] = y;
    signs[placed] = p >= 0 ? 1 : -1;
    density[placed] = Math.min(1, d / max);
    radii.push(Math.sqrt(x * x + y * y + z * z));
    placed++;
  }

  radii.sort((a, b) => a - b);
  const r97 = radii[Math.floor(radii.length * 0.97)] || 1;
  const scale = fitRadius / r97;
  for (let i = 0; i < placed * 3; i++) raw[i] *= scale;

  return { positions: raw.subarray(0, placed * 3), signs, density, scale, count: placed };
}
