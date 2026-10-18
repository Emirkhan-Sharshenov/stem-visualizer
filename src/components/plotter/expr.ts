/*
 * A small, safe parser for school formulas: + − · / ^, brackets, implicit multiplication (2x, 3(x+1), x sin x),
 * functions sin cos tg/tan ctg sqrt abs ln log lg exp and the constants π and e. No eval.
 */

export type Vars = Record<string, number>;
export type Fn = (v: Vars) => number;

const FUNCS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tg: Math.tan,
  tan: Math.tan,
  ctg: (x) => 1 / Math.tan(x),
  cot: (x) => 1 / Math.tan(x),
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  lg: Math.log10,
  exp: Math.exp,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctg: Math.atan,
  atan: Math.atan,
};
const CONSTS: Record<string, number> = { pi: Math.PI, 'π': Math.PI, e: Math.E };

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function lex(src: string): Tok[] {
  const s = src.replace(/·|×|\*/g, '*').replace(/÷|:/g, '/').replace(/−|–/g, '-').replace(/,/g, '.').replace(/²/g, '^2').replace(/³/g, '^3').replace(/√/g, 'sqrt').toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = Number(s.slice(i, j));
      if (Number.isNaN(v)) throw new Error(`число «${s.slice(i, j)}»`);
      out.push({ t: 'num', v });
      i = j;
      continue;
    }
    if (/[a-zπ]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zπ]/.test(s[j])) j++;
      // split glued names like "xsinx" or "ax" into known pieces
      let word = s.slice(i, j);
      while (word) {
        const f = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort((a, b) => b.length - a.length).find((k) => word.startsWith(k));
        const piece = f ?? word[0];
        out.push({ t: 'id', v: piece });
        word = word.slice(piece.length);
      }
      i = j;
      continue;
    }
    if ('+-*/^()|'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    throw new Error(`непонятный символ «${c}»`);
  }
  return out;
}

export function compile(src: string, allowed: string[] = ['x', 'a', 'b', 'c']): Fn {
  const toks = lex(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek().v === v;
  const take = (v: string) => {
    if (!isOp(v)) throw new Error(`ожидалось «${v}»`);
    p++;
  };
  // the start of a factor: lets "2x" and "x(x+1)" mean multiplication
  const startsFactor = () => {
    const t = peek();
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && (t.v === '(' || t.v === '|')));
  };

  const expr = (): Fn => {
    let left = term();
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v;
      const r = term();
      const l = left;
      left = op === '+' ? (v) => l(v) + r(v) : (v) => l(v) - r(v);
    }
    return left;
  };
  const term = (): Fn => {
    let left = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[p++].v;
        const r = unary();
        const l = left;
        left = op === '*' ? (v) => l(v) * r(v) : (v) => l(v) / r(v);
      } else if (startsFactor() && !isOp('|')) {
        const r = power();
        const l = left;
        left = (v) => l(v) * r(v);
      } else return left;
    }
  };
  const unary = (): Fn => {
    if (isOp('-')) {
      p++;
      const f = unary();
      return (v) => -f(v);
    }
    if (isOp('+')) {
      p++;
      return unary();
    }
    return power();
  };
  const power = (): Fn => {
    const base = atom();
    if (isOp('^')) {
      p++;
      const ex = unary();
      return (v) => Math.pow(base(v), ex(v));
    }
    return base;
  };
  const atom = (): Fn => {
    const t = peek();
    if (!t) throw new Error('выражение оборвалось');
    if (t.t === 'num') {
      p++;
      return () => t.v;
    }
    if (t.t === 'op' && t.v === '(') {
      p++;
      const e = expr();
      take(')');
      return e;
    }
    if (t.t === 'op' && t.v === '|') {
      p++;
      const e = expr();
      take('|');
      return (v) => Math.abs(e(v));
    }
    if (t.t === 'id') {
      p++;
      const f = FUNCS[t.v];
      if (f) {
        // sin x, sin(x), sin 2x
        const arg = isOp('(') ? atom() : power();
        return (v) => f(arg(v));
      }
      if (t.v in CONSTS) return () => CONSTS[t.v];
      if (allowed.includes(t.v)) return (v) => v[t.v];
      throw new Error(`неизвестное «${t.v}»`);
    }
    throw new Error(`лишний знак «${t.v}»`);
  };

  if (!toks.length) throw new Error('пусто');
  const f = expr();
  if (p < toks.length) throw new Error(`лишнее «${toks[p].t === 'num' ? toks[p].v : toks[p].v}»`);
  return f;
}
