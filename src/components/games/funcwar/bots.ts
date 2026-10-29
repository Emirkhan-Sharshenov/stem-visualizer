import { compile, fly, rng, type Soldier, type World } from './engine';
import type { Look } from './looks';

/* "Бой функций" bots. Each bot has a character: the families of functions it knows, how long it thinks,
   how steady its hand is and how it picks targets. The search is a real optimisation, not a lottery:
   random starts in each family's parameter space, then a local refinement of the best candidates with a
   shrinking step. Scoring rewards hits on wounded enemies and double kills, punishes friendly fire and,
   when nothing hits, prefers paths that pass close to an enemy — or, for strong bots, shots that dig a
   tunnel through the rock in front of one. The work runs in slices so the page never freezes. */

type Family = 'line' | 'parab' | 'arc' | 'sine' | 'lineSine' | 'bump' | 'step' | 'abs' | 'cubic' | 'damped' | 'root' | 'exp';

interface FamilyDef {
  ranges: [number, number][];
  write: (v: number[]) => string;
}

const n = (v: number) => {
  const r = Math.round(v * 10000) / 10000;
  return String(r).replace('.', ',');
};
const sg = (v: number) => (v < 0 ? `− ${n(-v)}` : `+ ${n(v)}`);

const FAMILIES: Record<Family, FamilyDef> = {
  line: { ranges: [[-1.3, 1.3]], write: ([k]) => `${n(k)}x` },
  parab: { ranges: [[-0.08, 0.08], [-2, 2]], write: ([a, b]) => `${n(a)}x^2 ${sg(b)}x` },
  arc: { ranges: [[-0.08, 0.08], [4, 40]], write: ([a, d]) => `${n(-a)}x(x − ${n(d)})` },
  sine: { ranges: [[-9, 9], [3, 30]], write: ([A, L]) => `${n(A)}sin(πx/${n(L)})` },
  lineSine: { ranges: [[-1, 1], [-6, 6], [3, 25]], write: ([k, A, L]) => `${n(k)}x ${sg(A)}sin(πx/${n(L)})` },
  bump: { ranges: [[-1, 1], [-9, 9], [2, 36], [1, 7]], write: ([k, A, c, w]) => `${n(k)}x ${sg(A)}e^(−((x − ${n(c)})/${n(w)})²)` },
  step: { ranges: [[-0.8, 0.8], [-14, 14], [2, 34], [0.5, 6]], write: ([k, H, c, w]) => `${n(k)}x ${sg(H / 2)}(1 + th((x − ${n(c)})/${n(w)}))` },
  abs: { ranges: [[-1.5, 1.5], [1, 34]], write: ([k, c]) => `${n(k)}(|x − ${n(c)}| − ${n(c)})` },
  cubic: { ranges: [[-0.004, 0.004], [-0.12, 0.12], [-2, 2]], write: ([a, b, c]) => `${n(a)}x^3 ${sg(b)}x^2 ${sg(c)}x` },
  damped: { ranges: [[-10, 10], [4, 40], [3, 25]], write: ([A, k, L]) => `${n(A)}e^(−x/${n(k)})sin(πx/${n(L)})` },
  root: { ranges: [[-4, 4], [-0.8, 0.8]], write: ([a, b]) => `${n(a)}sqrt(x) ${sg(b)}x` },
  exp: { ranges: [[-3, 3], [3, 16]], write: ([s, k]) => `${n(s)}(e^(x/${n(k)}) − 1)` },
};

export interface Bot {
  id: string;
  ru: string;
  en: string;
  /** what kind of player it is */
  about: { ru: string; en: string };
  rating: number;
  families: Family[];
  /** coarse evaluations in the random phase, then refinement rounds */
  budget: number;
  refine: number;
  /** relative error added to its chosen parameters (0 = a perfect hand) */
  noise: number;
  /** finishes wounded soldiers and looks for double kills */
  hunter: boolean;
  /** shoots through rock when it can't curve round it */
  digger: boolean;
  look: Look;
}

const look = (color: string, body: Look['body'], hat: Look['hat'], eyes: Look['eyes'], trail: Look['trail'], blast: Look['blast']): Look => ({ color, body, hat, eyes, trail, blast });

export const BOTS: Bot[] = [
  { id: 'intern', ru: 'Стажёр', en: 'Intern', about: { ru: 'Знает только прямые и часто промахивается. Хорош для первой пробы.', en: 'Knows only lines and often misses. Good for a first go.' }, rating: 800, families: ['line'], budget: 40, refine: 0, noise: 0.22, hunter: false, digger: false, look: look('lime', 'circle', 'cap', 'smile', 'dashed', 'ring') },
  { id: 'rookie', ru: 'Новичок', en: 'Rookie', about: { ru: 'Прямые и простые параболы, рука дрожит.', en: 'Lines and simple parabolas; a shaky hand.' }, rating: 950, families: ['line', 'arc'], budget: 80, refine: 1, noise: 0.12, hunter: false, digger: false, look: look('amber', 'circle', 'beanie', 'dot', 'solid', 'ring') },
  { id: 'ruler', ru: 'Линейка', en: 'Ruler', about: { ru: 'Только прямые, зато очень точно. Прячься за скалами!', en: 'Lines only, but very precise. Hide behind rocks!' }, rating: 1050, families: ['line'], budget: 160, refine: 3, noise: 0, hunter: true, digger: false, look: look('white', 'square', 'grad', 'glasses', 'dashed', 'ring') },
  { id: 'fighter', ru: 'Боец', en: 'Fighter', about: { ru: 'Прямые, параболы и синусы — уверенный середняк.', en: 'Lines, parabolas and sines: a solid all-rounder.' }, rating: 1150, families: ['line', 'arc', 'parab', 'sine'], budget: 220, refine: 3, noise: 0.05, hunter: false, digger: false, look: look('coral', 'hex', 'headphones', 'angry', 'solid', 'shock') },
  { id: 'parabolic', ru: 'Параболик', en: 'Parabolic', about: { ru: 'Мастер дуг: перебрасывает снаряд через любые стены.', en: 'Master of arcs: lobs over any wall.' }, rating: 1200, families: ['arc', 'parab'], budget: 300, refine: 4, noise: 0.02, hunter: true, digger: false, look: look('sunset', 'blob', 'cowboy', 'shades', 'comet', 'star') },
  { id: 'sinusoid', ru: 'Синусоид', en: 'Sinusoid', about: { ru: 'Стреляет волнами и змейками между скал.', en: 'Fires waves that weave between rocks.' }, rating: 1250, families: ['sine', 'lineSine', 'damped'], budget: 320, refine: 4, noise: 0.02, hunter: true, digger: false, look: look('ocean', 'ghost', 'none', 'cyclops', 'ribbon', 'flower') },
  { id: 'modulus', ru: 'Модуль', en: 'Modulus', about: { ru: 'Ломаные траектории: удар вниз и рикошет вверх.', en: 'Kinked paths: down, then bounce up.' }, rating: 1300, families: ['abs', 'line', 'arc'], budget: 320, refine: 4, noise: 0.01, hunter: true, digger: false, look: look('violet', 'diamond', 'horns', 'angry', 'lightning', 'pixels') },
  { id: 'pro', ru: 'Профи', en: 'Pro', about: { ru: 'Знает все школьные функции и редко ошибается.', en: 'Knows every school function and rarely misses.' }, rating: 1350, families: ['line', 'arc', 'parab', 'sine', 'abs', 'root', 'exp'], budget: 420, refine: 5, noise: 0.01, hunter: true, digger: false, look: look('mint', 'circle', 'crown', 'shades', 'neon', 'firework') },
  { id: 'gauss', ru: 'Гаусс', en: 'Gauss', about: { ru: 'Целится прямой и перешагивает скалы горбами-колоколами.', en: 'Aims with a line and hops rocks with Gaussian bumps.' }, rating: 1450, families: ['bump', 'line', 'arc'], budget: 520, refine: 6, noise: 0.005, hunter: true, digger: true, look: look('galaxy', 'star', 'wizard', 'star', 'sparks', 'confetti') },
  { id: 'tangent', ru: 'Тангенс', en: 'Tangent', about: { ru: 'Ступеньки и горбы: достаёт цели на уступах за укрытием.', en: 'Steps and bumps: reaches targets on ledges behind cover.' }, rating: 1550, families: ['step', 'bump', 'lineSine'], budget: 600, refine: 6, noise: 0.004, hunter: true, digger: true, look: look('ice', 'robot', 'antenna', 'visor', 'lightning', 'pixels') },
  { id: 'euler', ru: 'Эйлер', en: 'Euler', about: { ru: 'Владеет экспонентой, затуханием и всем остальным. Думает долго.', en: 'Commands exponentials, damping and everything else. Thinks hard.' }, rating: 1650, families: ['exp', 'damped', 'bump', 'step', 'cubic', 'arc', 'sine'], budget: 800, refine: 7, noise: 0.002, hunter: true, digger: true, look: look('aurora', 'planet', 'none', 'dot', 'stars', 'atom') },
  { id: 'lagrange', ru: 'Лагранж', en: 'Lagrange', about: { ru: 'Проводит кривые через несколько целей сразу и прорывает туннели.', en: 'Threads curves through several targets and digs tunnels.' }, rating: 1800, families: ['cubic', 'parab', 'bump', 'step', 'lineSine', 'abs'], budget: 1000, refine: 8, noise: 0.001, hunter: true, digger: true, look: look('ember', 'hex', 'viking', 'angry', 'fire', 'shock') },
  { id: 'archimedes', ru: 'Архимед', en: 'Archimedes', about: { ru: 'Почти не промахивается. Каждое укрытие — временное.', en: 'Hardly ever misses. Every cover is temporary.' }, rating: 1950, families: ['line', 'arc', 'parab', 'cubic', 'sine', 'lineSine', 'bump', 'step', 'abs', 'damped'], budget: 1300, refine: 9, noise: 0, hunter: true, digger: true, look: look('gold', 'ufo', 'none', 'cyclops', 'neon', 'atom') },
  { id: 'singularity', ru: 'Сингулярность', en: 'Singularity', about: { ru: 'Босс. Все функции, огромный перебор, идеальная рука.', en: 'The boss. Every function, a huge search, a perfect hand.' }, rating: 2200, families: ['line', 'arc', 'parab', 'cubic', 'sine', 'lineSine', 'bump', 'step', 'abs', 'damped', 'root', 'exp'], budget: 1800, refine: 10, noise: 0, hunter: true, digger: true, look: look('candy', 'cat', 'halo', 'heart', 'rainbow', 'firework') },
];

export const botById = (id: string) => BOTS.find((b) => b.id === id) ?? BOTS[1];
/** the bot nearest to a rating (ranked games when nobody is in the queue) */
export const botNear = (rating: number) => BOTS.reduce((best, b) => (Math.abs(b.rating - rating) < Math.abs(best.rating - rating) ? b : best), BOTS[1]);

/* ---------------- the search ---------------- */

interface Cand { family: Family; v: number[]; score: number }

function score(w: World, me: Soldier, src: string, bot: Bot, step: number): number {
  let f: (x: number) => number;
  try {
    f = compile(src);
  } catch {
    return -1e9;
  }
  const shot = fly(w, me, f, step);
  let s = 0;
  let hits = 0;
  for (const id of shot.killed) {
    const t = w.soldiers.find((x) => x.id === id)!;
    if (t.team === me.team) s -= 1500;
    else {
      hits++;
      // a hunter prefers finishing the wounded
      s += 1000 + (bot.hunter && t.hp !== undefined ? (3 - t.hp) * 150 : 0);
    }
  }
  if (bot.hunter && hits > 1) s += 600; // a double kill
  if (hits) return s;
  // no hit: how close did it pass to an enemy?
  const enemies = w.soldiers.filter((x) => x.alive && x.team !== me.team);
  let best = 1e9;
  for (const p of shot.path) for (const e of enemies) best = Math.min(best, Math.hypot(p.x - e.x, p.y - e.y));
  s -= best * 20;
  // a digger likes blasting the rock that stands right in front of an enemy
  if (bot.digger && shot.end === 'obstacle') {
    const near = Math.min(...enemies.map((e) => Math.hypot(shot.impact.x - e.x, shot.impact.y - e.y)));
    s += Math.max(0, 140 - near * 14);
  }
  return s;
}

const rand = (r: () => number, [lo, hi]: [number, number]) => lo + r() * (hi - lo);
const clampTo = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v));
const tick = () => new Promise<void>((res) => setTimeout(res, 0));

/** the bot's formula for this turn; resolves after thinking in slices (about 8 ms at a time) */
export async function botThink(w: World, me: Soldier, bot: Bot, seed: number): Promise<string> {
  const r = rng(seed);
  const COARSE = 0.025;
  const pool: Cand[] = [];
  let t0 = performance.now();
  const breathe = async () => {
    if (performance.now() - t0 > 8) {
      await tick();
      t0 = performance.now();
    }
  };
  // 1. random starts across the bot's families
  for (let i = 0; i < bot.budget; i++) {
    const family = bot.families[i % bot.families.length];
    const def = FAMILIES[family];
    const v = def.ranges.map((rg) => rand(r, rg));
    pool.push({ family, v, score: score(w, me, def.write(v), bot, COARSE) });
    await breathe();
  }
  pool.sort((a, b) => b.score - a.score);
  // 2. refine the best few with a shrinking step
  let top = pool.slice(0, 6);
  for (let round = 0; round < bot.refine; round++) {
    const scale = 0.25 * Math.pow(0.6, round);
    const next: Cand[] = [...top];
    for (const c of top) {
      const def = FAMILIES[c.family];
      for (let k = 0; k < 10; k++) {
        const v = c.v.map((x, j) => clampTo(x + (r() - 0.5) * 2 * scale * (def.ranges[j][1] - def.ranges[j][0]), def.ranges[j]));
        next.push({ family: c.family, v, score: score(w, me, def.write(v), bot, COARSE) });
        await breathe();
      }
    }
    top = next.sort((a, b) => b.score - a.score).slice(0, 6);
  }
  // 3. check the finalists with the fine step the real shot uses
  let best = top[0];
  let bestFine = -1e9;
  for (const c of top.slice(0, 4)) {
    const s = score(w, me, FAMILIES[c.family].write(c.v), bot, 0.004);
    if (s > bestFine) {
      bestFine = s;
      best = c;
    }
    await breathe();
  }
  // 4. a weaker hand shakes
  const def = FAMILIES[best.family];
  const v = bot.noise ? best.v.map((x, j) => clampTo(x * (1 + (r() - 0.5) * 2 * bot.noise), def.ranges[j])) : best.v;
  return def.write(v);
}
