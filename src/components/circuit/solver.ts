/* Circuit builder: parts sit on the edges of a dot grid; the circuit is solved by nodal analysis
   (Kirchhoff's current law at every dot, Ohm's law in every part). Batteries are an EMF with an
   internal resistance, wires and ammeters are near-zero resistances, voltmeters and open switches
   carry no current. */

export type PartType = 'wire' | 'battery' | 'resistor' | 'lamp' | 'rheostat' | 'switch' | 'ammeter' | 'voltmeter';

export interface Part {
  type: PartType;
  /** resistance for resistor / lamp / rheostat, Ω */
  R: number;
  /** battery EMF (V) and internal resistance (Ω) */
  emf: number;
  r: number;
  /** battery: +1 if the "+" terminal is at the edge's second dot */
  dir: 1 | -1;
  /** switch closed? */
  on: boolean;
  /** lamp burnt out */
  burnt: boolean;
}

/** edge key: "h:x,y" joins (x,y)–(x+1,y); "v:x,y" joins (x,y)–(x,y+1) */
export type Board = Record<string, Part>;

export const COLS = 9;
export const ROWS = 6;

export function ends(key: string): [[number, number], [number, number]] {
  const [kind, xy] = key.split(':');
  const [x, y] = xy.split(',').map(Number);
  return kind === 'h' ? [[x, y], [x + 1, y]] : [[x, y], [x, y + 1]];
}

export const DEFAULTS: Record<PartType, Part> = {
  wire: { type: 'wire', R: 0, emf: 0, r: 0, dir: 1, on: true, burnt: false },
  battery: { type: 'battery', R: 0, emf: 4.5, r: 0.5, dir: 1, on: true, burnt: false },
  resistor: { type: 'resistor', R: 10, emf: 0, r: 0, dir: 1, on: true, burnt: false },
  lamp: { type: 'lamp', R: 6, emf: 0, r: 0, dir: 1, on: true, burnt: false },
  rheostat: { type: 'rheostat', R: 20, emf: 0, r: 0, dir: 1, on: true, burnt: false },
  switch: { type: 'switch', R: 0, emf: 0, r: 0, dir: 1, on: false, burnt: false },
  ammeter: { type: 'ammeter', R: 0, emf: 0, r: 0, dir: 1, on: true, burnt: false },
  voltmeter: { type: 'voltmeter', R: 0, emf: 0, r: 0, dir: 1, on: true, burnt: false },
};

const WIRE_R = 1e-6;
/** lamps burn out above this power, W */
export const LAMP_MAX_P = 15;
/** a battery current above this is a short circuit, A */
export const SHORT_I = 8;

export interface PartResult {
  /** current from the edge's first dot to its second, A */
  I: number;
  /** potential of second dot minus first, V */
  U: number;
  /** power turned into heat/light in the part, W */
  P: number;
}

export interface Solution {
  potentials: Map<string, number>;
  parts: Record<string, PartResult>;
  short: boolean;
}

/** conductance of a part, or null if it carries no current */
function conductance(p: Part): number | null {
  switch (p.type) {
    case 'wire':
    case 'ammeter':
      return 1 / WIRE_R;
    case 'switch':
      return p.on ? 1 / WIRE_R : null;
    case 'voltmeter':
      return null;
    case 'lamp':
      return p.burnt ? null : 1 / Math.max(0.1, p.R);
    case 'battery':
      return 1 / Math.max(1e-4, p.r);
    default:
      return 1 / Math.max(0.1, p.R);
  }
}

export function solve(board: Board): Solution {
  const keys = Object.keys(board);
  const idx = new Map<string, number>();
  const node = (x: number, y: number) => {
    const k = `${x},${y}`;
    if (!idx.has(k)) idx.set(k, idx.size);
    return idx.get(k)!;
  };
  const edges = keys.map((k) => {
    const [a, b] = ends(k);
    return { k, a: node(a[0], a[1]), b: node(b[0], b[1]), p: board[k] };
  });
  const n = idx.size;
  const G = Array.from({ length: n }, () => new Float64Array(n));
  const J = new Float64Array(n);
  // a tiny leak to "ground" keeps floating pieces solvable
  for (let i = 0; i < n; i++) G[i][i] += 1e-7;
  for (const e of edges) {
    const g = conductance(e.p);
    if (g === null) continue;
    G[e.a][e.a] += g;
    G[e.b][e.b] += g;
    G[e.a][e.b] -= g;
    G[e.b][e.a] -= g;
    if (e.p.type === 'battery') {
      // Norton form: EMF pushes current emf/r out of the "+" terminal
      const i = e.p.emf * g;
      const plus = e.p.dir === 1 ? e.b : e.a;
      const minus = e.p.dir === 1 ? e.a : e.b;
      J[plus] += i;
      J[minus] -= i;
    }
  }
  const V = gauss(G, J);
  const potentials = new Map<string, number>();
  for (const [k, i] of idx) potentials.set(k, V[i]);

  const parts: Record<string, PartResult> = {};
  let short = false;
  for (const e of edges) {
    const U = V[e.b] - V[e.a];
    const g = conductance(e.p);
    let I = 0;
    let P = 0;
    if (g !== null) {
      if (e.p.type === 'battery') {
        // current through the battery from a to b: (EMF towards b − U)/r
        const emfAB = e.p.emf * e.p.dir;
        I = (emfAB - U) * g;
        P = I * I / g;
        if (Math.abs(I) > SHORT_I) short = true;
      } else {
        I = -U * g;
        P = I * I / g;
      }
    }
    parts[e.k] = { I, U, P };
  }
  return { potentials, parts, short };
}

function gauss(A: Float64Array[], b: Float64Array): Float64Array {
  const n = b.length;
  const M = A.map((row, i) => {
    const r = new Float64Array(n + 1);
    r.set(row);
    r[n] = b[i];
    return r;
  });
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c];
    if (Math.abs(d) < 1e-15) continue;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / d;
      if (!f) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return Float64Array.from({ length: n }, (_, i) => (Math.abs(M[i][i]) < 1e-15 ? 0 : M[i][n] / M[i][i]));
}
