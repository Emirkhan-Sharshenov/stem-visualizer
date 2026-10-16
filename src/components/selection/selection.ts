/* Peppered moths: one gene, dark allele C dominant over light c.
   Birds find moths that stand out against the bark; survivors mate at random. */

export type Genotype = 0 | 1 | 2; // cc, Cc, CC
export type Env = 'clean' | 'soot';

export interface Moth {
  g: Genotype;
  x: number;
  y: number;
  a: number;
  eaten: boolean;
}

export const N = 60;
export const BARK_LUM: Record<Env, number> = { clean: 0.78, soot: 0.2 };
export const isDark = (g: Genotype) => g > 0;
const mothLum = (g: Genotype) => (isDark(g) ? 0.15 : 0.85);

export function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** chance that a bird spots and eats this moth during one generation */
export function eatChance(g: Genotype, env: Env, strength: number) {
  const visibility = Math.abs(mothLum(g) - BARK_LUM[env]);
  return strength * (0.12 + 0.88 * visibility);
}

/** place a generation on the trunk (coordinates 0…1) */
export function place(gs: Genotype[], rand: () => number): Moth[] {
  return gs.map((g) => ({ g, x: 0.06 + rand() * 0.88, y: 0.06 + rand() * 0.88, a: (rand() - 0.5) * 0.6, eaten: false }));
}

export function firstGeneration(q: number, rand: () => number): Genotype[] {
  return Array.from({ length: N }, () => {
    const c1 = rand() < q ? 0 : 1;
    const c2 = rand() < q ? 0 : 1;
    return (c1 + c2) as Genotype;
  });
}

/** survivors mate at random; each allele mutates with probability mu */
export function nextGeneration(survivors: Genotype[], rand: () => number, mu: number): Genotype[] {
  if (survivors.length === 0) return [];
  const gamete = (g: Genotype) => {
    let allele = g === 2 ? 1 : g === 0 ? 0 : rand() < 0.5 ? 1 : 0;
    if (rand() < mu) allele = 1 - allele;
    return allele;
  };
  return Array.from({ length: N }, () => {
    const a = survivors[Math.floor(rand() * survivors.length)];
    const b = survivors[Math.floor(rand() * survivors.length)];
    return (gamete(a) + gamete(b)) as Genotype;
  });
}

export function stats(gs: Genotype[]) {
  const cc = gs.filter((g) => g === 0).length;
  const het = gs.filter((g) => g === 1).length;
  const CC = gs.filter((g) => g === 2).length;
  const n = gs.length || 1;
  const q = (2 * cc + het) / (2 * n);
  return { cc, het, CC, dark: (het + CC) / n, q, p: 1 - q };
}
