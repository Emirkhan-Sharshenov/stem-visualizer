/* Checks the "Бой функций" rules and campaign. Run: npx tsx src/components/games/funcwar/levels.test.ts */
import { applyShot, botMove, compile, fly, FormulaError, randomWorld } from './engine';
import { LEVELS, levelWorld } from './levels';
import { raceQuestion } from './race';
import { CHAPTERS, chapterWorld } from './chapters';

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`);
};
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// the parser reads school notation
const cases: [string, number, number][] = [
  ['2x', 3, 6], ['0,5x²', 2, 2], ['x^2-3x+2', 1, 0], ['3sin(x)', Math.PI / 2, 3], ['sin x', Math.PI / 2, 1],
  ['|x-4|', 1, 3], ['2|x|+1', -2, 5], ['sqrt(x)', 9, 3], ['√x', 16, 4], ['e^x', 0, 1], ['2pi', 0, 2 * Math.PI],
  ['-x^2', 3, -9], ['x(x-1)', 3, 6], ['y = 4', 7, 4], ['1/x', 4, 0.25], ['2^-x', 1, 0.5], ['(x+1)(x-1)', 3, 8], ['−2·x', 1, -2],
];
for (const [src, x, want] of cases) {
  let got = NaN;
  try {
    got = compile(src)(x);
  } catch (e) {
    console.log(e);
  }
  ok(near(got, want), `${src} at ${x} = ${want} (got ${got})`);
}
for (const bad of ['', '2+', 'foo(x)', 'sin(x', 'x$']) {
  let threw = false;
  try {
    compile(bad);
  } catch (e) {
    threw = e instanceof FormulaError;
  }
  ok(threw, `rejects “${bad}”`);
}

// every campaign level is won in one shot by its listed solution
for (const l of LEVELS) {
  const w = levelWorld(l);
  const shot = fly(w, w.soldiers[0], compile(l.solution));
  const targets = w.soldiers.filter((s) => s.team === 1).map((s) => s.id);
  const all = targets.every((id) => shot.killed.includes(id));
  if (l.id === 'final') {
    // the finale needs several shots: each target must at least be reachable
    for (const id of targets) {
      const one = { ...w, soldiers: w.soldiers.filter((s) => s.team === 0 || s.id === id) };
      let hit = false;
      for (let seed = 1; seed < 40 && !hit; seed++) {
        const src = botMove(one, one.soldiers[0], 2, seed);
        hit = fly(one, one.soldiers[0], compile(src)).killed.includes(id);
      }
      ok(hit, `finale: target ${id} is reachable`);
    }
  } else ok(all && !shot.killed.includes(0), `${l.id}: “${l.solution}” hits ${shot.killed.length}/${targets.length} (${shot.end})`);
}

// a crater opens a way through rock
{
  const w = randomWorld(7);
  const s = w.soldiers[0];
  const shot = fly(w, s, compile('0'));
  const after = applyShot(w, shot);
  ok(shot.end !== 'obstacle' || after.holes.length === 1, 'an obstacle hit leaves a crater');
}

// the bot finds kills on random fields most of the time
{
  let kills = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const w = randomWorld(seed);
    const me = w.soldiers.find((x) => x.team === 1)!;
    const shot = fly(w, me, compile(botMove(w, me, 2, seed)));
    if (shot.killed.some((id) => w.soldiers.find((x) => x.id === id)!.team === 0)) kills++;
  }
  ok(kills >= 12, `hard bot kills in ${kills}/20 random fields`);
}

// three lives: a hit takes one, the third kills
{
  const w = randomWorld(3, 1, 0, 3);
  const [a, b] = w.soldiers;
  const k = (b.y - a.y) / (b.x - a.x);
  let cur = w;
  for (let i = 1; i <= 3; i++) cur = applyShot(cur, fly(cur, cur.soldiers[0], compile(`${k}x`)));
  const target = cur.soldiers[1];
  ok(target.hp === 0 && !target.alive, `three hits use up three lives (hp ${target.hp}, alive ${target.alive})`);
}

// the opening race always has a whole-number answer
{
  let whole = 0;
  for (let s = 1; s <= 300; s++) if (Number.isInteger(raceQuestion(s).answer)) whole++;
  ok(whole === 300, `race answers are whole numbers (${whole}/300)`);
}

// every guide example does what its caption says
for (const ch of CHAPTERS) {
  for (const ex of ch.examples) {
    const w = chapterWorld(ch);
    const shot = fly(w, w.soldiers[0], compile(ex.src));
    const targets = w.soldiers.filter((s) => s.team === 1).map((s) => s.id);
    const got = targets.every((id) => shot.killed.includes(id)) ? 'hit' : shot.end;
    ok(got === ex.expect, `guide ${ch.id}: “${ex.src}” → ${got} (expected ${ex.expect})`);
  }
}

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
