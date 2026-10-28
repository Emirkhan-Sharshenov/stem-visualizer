/* "Бой функций": the rules, independent of React so they can be tested on their own.
   A shot flies along the graph of the player's function, written in the shooter's own coordinates:
   the shooter stands at x = 0, x grows forward (to the right for the blue side, to the left for the red one),
   and the graph is shifted so that it starts exactly at the shooter. */

export const W = 40; // field width in units, from −20 to 20
export const H = 24; // field height, from −12 to 12
export const SOLDIER_R = 0.6;
export const CRATER_R = 1.1;

export interface Pt { x: number; y: number }
export interface Circle extends Pt { r: number }
export interface Soldier extends Pt { id: number; team: 0 | 1; alive: boolean; name: string }
export interface World { obstacles: Circle[]; holes: Circle[]; soldiers: Soldier[] }

export type Ending = 'obstacle' | 'edge' | 'jump' | 'undefined' | 'range';
export interface Shot { path: Pt[]; killed: number[]; end: Ending; impact: Pt }

/* ---------------- formula parser ---------------- */

export class FormulaError extends Error {
  constructor(public ru: string, public en: string) {
    super(en);
  }
}

type Fn = (x: number) => number;
const FUNCS: Record<string, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, ctg: (v) => 1 / Math.tan(v), cot: (v) => 1 / Math.tan(v),
  asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctg: Math.atan, arctan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, lg: Math.log10, log: Math.log10, exp: Math.exp,
  sh: Math.sinh, ch: Math.cosh, th: Math.tanh, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  floor: Math.floor, round: Math.round, sign: Math.sign, sgn: Math.sign,
};
const CONSTS: Record<string, number> = { pi: Math.PI, 'π': Math.PI, e: Math.E };

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Tok[] {
  const s = src
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[·×∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/\*\*/g, '^')
    .replace(/^\s*y\s*=/, '');
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    // numbers take a dot or a comma as the decimal mark
    const num = /^(\d+([.,]\d+)?|[.,]\d+)/.exec(s.slice(i));
    if (num) { out.push({ t: 'num', v: parseFloat(num[0].replace(',', '.')) }); i += num[0].length; continue; }
    const id = /^([a-zа-яё]+|π)/i.exec(s.slice(i));
    if (id) {
      // split glued names like "xsin" or "2pix" into known pieces
      let w = id[0];
      while (w) {
        const known = [...Object.keys(FUNCS), ...Object.keys(CONSTS), 'x'].sort((a, b) => b.length - a.length).find((k) => w.startsWith(k));
        if (!known) throw new FormulaError(`Не знаю, что такое «${w}». Можно: x, числа, + − * / ^, sin, cos, sqrt, abs, ln, exp, pi.`, `Unknown name “${w}”. Allowed: x, numbers, + − * / ^, sin, cos, sqrt, abs, ln, exp, pi.`);
        out.push({ t: 'id', v: known });
        w = w.slice(known.length);
      }
      i += id[0].length;
      continue;
    }
    if ('+-*/^()|'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    throw new FormulaError(`Лишний символ «${c}».`, `Unexpected “${c}”.`);
  }
  return out;
}

/** compiles a school-style formula of x ("0,5x² − 2", "3sin(x/2)", "|x−4|") into a function */
export function compile(src: string): Fn {
  if (!src.trim()) throw new FormulaError('Впиши функцию, например 0.5x.', 'Type a function, e.g. 0.5x.');
  const toks = tokenize(src);
  let p = 0;
  let absDepth = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new FormulaError(`Не хватает «${v}».`, `Missing “${v}”.`);
    p++;
  };
  const startsPrimary = () => {
    const k = peek();
    if (!k) return false;
    if (k.t !== 'op') return true;
    return k.v === '(' || (k.v === '|' && absDepth === 0);
  };

  function expr(): Fn {
    let a = term();
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v;
      const l = a, r = term();
      a = op === '+' ? (x) => l(x) + r(x) : (x) => l(x) - r(x);
    }
    return a;
  }
  function term(): Fn {
    let a = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[p++].v;
        const l = a, r = unary();
        a = op === '*' ? (x) => l(x) * r(x) : (x) => l(x) / r(x);
      } else if (startsPrimary()) {
        // implicit multiplication: 2x, 3sin x, x(x−1), 2|x|
        const l = a, r = power();
        a = (x) => l(x) * r(x);
      } else return a;
    }
  }
  function unary(): Fn {
    if (isOp('-')) { p++; const a = unary(); return (x) => -a(x); }
    if (isOp('+')) { p++; return unary(); }
    return power();
  }
  function power(): Fn {
    const base = primary();
    if (isOp('^')) {
      p++;
      const ex = unary();
      return (x) => Math.pow(base(x), ex(x));
    }
    return base;
  }
  function primary(): Fn {
    const k = toks[p];
    if (!k) throw new FormulaError('Формула обрывается.', 'The formula ends too early.');
    if (k.t === 'num') { p++; const v = k.v; return () => v; }
    if (k.t === 'id') {
      p++;
      if (k.v === 'x') return (x) => x;
      if (k.v in CONSTS) { const v = CONSTS[k.v]; return () => v; }
      const f = FUNCS[k.v];
      // sin(x), or sin x / sin 2x without brackets (takes the next power)
      const arg = isOp('(') ? (p++, ((a) => (expect(')'), a))(expr())) : power();
      return (x) => f(arg(x));
    }
    if (k.v === '(') { p++; const a = expr(); expect(')'); return a; }
    if (k.v === '|') { p++; absDepth++; const a = expr(); absDepth--; expect('|'); return (x) => Math.abs(a(x)); }
    throw new FormulaError(`Здесь не может стоять «${k.v}».`, `“${k.v}” can’t go here.`);
  }

  const f = expr();
  if (p < toks.length) throw new FormulaError(`Лишнее в конце: «${toks.slice(p).map((t) => t.v).join('')}».`, 'Something extra at the end.');
  return f;
}

/* ---------------- the field ---------------- */

const inside = (c: Circle, x: number, y: number, pad = 0) => (x - c.x) ** 2 + (y - c.y) ** 2 < (c.r + pad) ** 2;

/** solid ground: inside an obstacle and not in a crater */
export const solid = (w: World, x: number, y: number) => w.obstacles.some((o) => inside(o, x, y)) && !w.holes.some((h) => inside(h, x, y));

/** the path of a shot; does not change the world (see applyShot) */
export function fly(w: World, shooter: Soldier, f: Fn): Shot {
  const dir = shooter.team === 0 ? 1 : -1;
  const f0 = f(0);
  if (!Number.isFinite(f0)) return { path: [{ x: shooter.x, y: shooter.y }], killed: [], end: 'undefined', impact: { x: shooter.x, y: shooter.y } };
  const STEP = 0.004;
  const path: Pt[] = [{ x: shooter.x, y: shooter.y }];
  const killed = new Set<number>();
  let prevY = shooter.y;
  let last: Pt = { x: shooter.x, y: shooter.y };
  for (let t = STEP; t <= W + 2; t += STEP) {
    const fy = f(t);
    const x = shooter.x + dir * t;
    const y = shooter.y + fy - f0;
    if (!Number.isFinite(fy)) return { path, killed: [...killed], end: 'undefined', impact: last };
    if (Math.abs(y - prevY) > 0.6) return { path, killed: [...killed], end: 'jump', impact: last }; // a break in the graph
    if (Math.abs(x) > W / 2 || Math.abs(y) > H / 2) return { path, killed: [...killed], end: 'edge', impact: last };
    for (const s of w.soldiers) if (s.alive && s.id !== shooter.id && !killed.has(s.id) && inside({ ...s, r: SOLDIER_R }, x, y)) killed.add(s.id);
    // the shooter can be hit by their own shot only after it has left them
    if (t > 1.5 && shooter.alive && !killed.has(shooter.id) && inside({ ...shooter, r: SOLDIER_R }, x, y)) killed.add(shooter.id);
    last = { x, y };
    if (solid(w, x, y)) { path.push(last); return { path, killed: [...killed], end: 'obstacle', impact: last }; }
    // keep the path light: one point per ~0.05 units of travel
    const tail = path[path.length - 1];
    if ((x - tail.x) ** 2 + (y - tail.y) ** 2 > 0.0025) path.push(last);
    prevY = y;
  }
  path.push(last);
  return { path, killed: [...killed], end: 'range', impact: last };
}

/** the shot's consequences: dead soldiers and a crater where it struck */
export function applyShot(w: World, shot: Shot): World {
  return {
    obstacles: w.obstacles,
    holes: shot.end === 'obstacle' ? [...w.holes, { ...shot.impact, r: CRATER_R }] : w.holes,
    soldiers: w.soldiers.map((s) => (shot.killed.includes(s.id) ? { ...s, alive: false } : s)),
  };
}

/* ---------------- random battlefields ---------------- */

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** a random field: obstacles in the middle, `perSide` soldiers on each half, nobody inside rock */
export function randomWorld(seed: number, perSide = 2, rocks = 9): World {
  const r = rng(seed);
  const obstacles: Circle[] = [];
  for (let i = 0; i < rocks; i++) obstacles.push({ x: (r() - 0.5) * 30, y: (r() - 0.5) * 20, r: 1.2 + r() * 2.6 });
  const soldiers: Soldier[] = [];
  const NAMES = [['Альфа', 'Бета', 'Гамма'], ['Дельта', 'Эпсилон', 'Зета']];
  for (const team of [0, 1] as const)
    for (let k = 0; k < perSide; k++) {
      let s: Soldier;
      let tries = 0;
      do {
        const x = team === 0 ? -19 + r() * 13 : 6 + r() * 13;
        s = { id: team * 10 + k, team, x, y: (r() - 0.5) * 20, alive: true, name: NAMES[team][k] };
        tries++;
      } while (tries < 200 && (obstacles.some((o) => inside(o, s.x, s.y, 1.2)) || soldiers.some((o) => Math.hypot(o.x - s.x, o.y - s.y) < 3)));
      soldiers.push(s);
    }
  return { obstacles, holes: [], soldiers };
}

/* ---------------- the bot ---------------- */

const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return String(r).replace('.', ',');
};

/** candidate formulas the bot tries, in the shooter's coordinates */
function candidate(r: () => number): string {
  const a = (r() - 0.5) * 2;
  const pick = Math.floor(r() * 6);
  if (pick === 0) return `${fmt(a * 1.5)}x`;
  if (pick === 1) return `${fmt(a * 0.08)}x^2 + ${fmt((r() - 0.5) * 2)}x`;
  if (pick === 2) return `${fmt(a * 6)}sin(${fmt(0.1 + r() * 0.5)}x)`;
  if (pick === 3) return `${fmt(a)}x + ${fmt((r() - 0.5) * 6)}sin(${fmt(0.2 + r() * 0.6)}x)`;
  if (pick === 4) return `${fmt(a * 0.005)}x^3 + ${fmt((r() - 0.5) * 0.1)}x^2`;
  return `${fmt(a * 4)}sqrt(x) + ${fmt((r() - 0.5) * 0.6)}x`;
}

/** the bot's move: searches formulas that kill an enemy and spare its own side; weaker bots search less and aim worse */
export function botMove(w: World, shooter: Soldier, level: 0 | 1 | 2, seed: number): string {
  const r = rng(seed);
  const tries = [60, 250, 900][level];
  let best: { src: string; score: number } | null = null;
  for (let i = 0; i < tries; i++) {
    const src = candidate(r);
    const shot = fly(w, shooter, compile(src));
    const enemies = shot.killed.filter((id) => w.soldiers.find((s) => s.id === id)!.team !== shooter.team).length;
    const friends = shot.killed.length - enemies;
    const score = enemies * 10 - friends * 15;
    if (!best || score > best.score) best = { src, score };
    if (enemies > 0 && friends === 0 && level === 2) break;
  }
  let src = best!.src;
  // an easier bot's hand shakes: nudge its coefficients
  const shake = [0.12, 0.04, 0][level];
  if (shake) src = src.replace(/(?<!\^)-?\d+(,\d+)?/g, (m) => fmt(parseFloat(m.replace(',', '.')) * (1 + (r() - 0.5) * 2 * shake)));
  return src;
}
