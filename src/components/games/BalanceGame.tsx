import { Button } from '@heroui/react';
import React, { useMemo, useState } from 'react';
import { Check, Lightbulb, Minus, Plus, SkipForward } from 'lucide-react';
import { GameBar, GameOver, Lang, shuffle, useCountdown } from './common';

/* Balance the equation: set the coefficients so every element has the same number of atoms on both sides. */

/** reactants | products, with the textbook coefficients for the hint */
const EQUATIONS: [string[], string[], number[]][] = [
  [['H2', 'O2'], ['H2O'], [2, 1, 2]],
  [['Na', 'Cl2'], ['NaCl'], [2, 1, 2]],
  [['Mg', 'O2'], ['MgO'], [2, 1, 2]],
  [['Cu', 'O2'], ['CuO'], [2, 1, 2]],
  [['N2', 'H2'], ['NH3'], [1, 3, 2]],
  [['Fe', 'Cl2'], ['FeCl3'], [2, 3, 2]],
  [['Al', 'O2'], ['Al2O3'], [4, 3, 2]],
  [['Fe', 'O2'], ['Fe2O3'], [4, 3, 2]],
  [['P', 'O2'], ['P2O5'], [4, 5, 2]],
  [['SO2', 'O2'], ['SO3'], [2, 1, 2]],
  [['H2O2'], ['H2O', 'O2'], [2, 2, 1]],
  [['KClO3'], ['KCl', 'O2'], [2, 2, 3]],
  [['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2]],
  [['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6]],
  [['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4]],
  [['C2H5OH', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 3]],
  [['Mg', 'HCl'], ['MgCl2', 'H2'], [1, 2, 1, 1]],
  [['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3]],
  [['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1]],
  [['NaOH', 'H2SO4'], ['Na2SO4', 'H2O'], [2, 1, 1, 2]],
  [['Ca(OH)2', 'HCl'], ['CaCl2', 'H2O'], [1, 2, 1, 2]],
  [['Al(OH)3', 'H2SO4'], ['Al2(SO4)3', 'H2O'], [2, 3, 1, 6]],
  [['BaCl2', 'Na2SO4'], ['BaSO4', 'NaCl'], [1, 1, 1, 2]],
  [['Fe2O3', 'H2'], ['Fe', 'H2O'], [1, 3, 2, 3]],
  [['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6]],
  [['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6]],
  [['CO2', 'H2O'], ['C6H12O6', 'O2'], [6, 6, 1, 6]],
  [['KMnO4'], ['K2MnO4', 'MnO2', 'O2'], [2, 1, 1, 1]],
  [['Cu(NO3)2'], ['CuO', 'NO2', 'O2'], [2, 2, 4, 1]],
  [['FeS2', 'O2'], ['Fe2O3', 'SO2'], [4, 11, 2, 8]],
];

/** atoms in a formula, brackets included: Al2(SO4)3 → Al 2, S 3, O 12 */
export function atoms(f: string): Record<string, number> {
  const stack: Record<string, number>[] = [{}];
  const re = /([A-Z][a-z]?)(\d*)|\(|\)(\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(f))) {
    if (m[0] === '(') stack.push({});
    else if (m[0].startsWith(')')) {
      const k = Number(m[3] || 1);
      const top = stack.pop()!;
      for (const [e, c] of Object.entries(top)) stack[stack.length - 1][e] = (stack[stack.length - 1][e] ?? 0) + c * k;
    } else stack[stack.length - 1][m[1]] = (stack[stack.length - 1][m[1]] ?? 0) + Number(m[2] || 1);
  }
  return stack[0];
}
const sub = (f: string) => f.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const ROUND = 120;

export const BalanceGame: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [order, setOrder] = useState(() => shuffle(EQUATIONS.map((_, i) => i)).sort((a, b) => EQUATIONS[a][2].reduce((s, x) => s + x, 0) - EQUATIONS[b][2].reduce((s, x) => s + x, 0) + (Math.random() - 0.5) * 6));
  const [idx, setIdx] = useState(0);
  const [co, setCo] = useState<number[]>(() => EQUATIONS[order[0]][2].map(() => 1));
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [hint, setHint] = useState(false);
  const [flash, setFlash] = useState(false);
  const [over, setOver] = useState(false);
  const [run, setRun] = useState(0);
  const { left } = useCountdown(ROUND, !over, () => setOver(true));

  const [re, pr] = EQUATIONS[order[idx % order.length]];
  const all = [...re, ...pr];
  const counts = useMemo(() => {
    const side = (list: string[], off: number) => {
      const t: Record<string, number> = {};
      list.forEach((f, i) => Object.entries(atoms(f)).forEach(([e, c]) => (t[e] = (t[e] ?? 0) + c * co[off + i])));
      return t;
    };
    return { l: side(re, 0), r: side(pr, re.length) };
  }, [re, pr, co]);
  const elements = [...new Set([...Object.keys(counts.l), ...Object.keys(counts.r)])];
  const balanced = elements.every((e) => counts.l[e] === counts.r[e]) && co.reduce((g, x) => gcd(g, x), 0) === 1;

  const next = (gained: number) => {
    setScore((s) => s + gained);
    if (gained) setSolved((x) => x + 1);
    const i = idx + 1;
    setIdx(i);
    setCo(EQUATIONS[order[i % order.length]][2].map(() => 1));
    setHint(false);
  };
  const check = () => {
    if (!balanced) return;
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      // bigger coefficients are worth more; a hint halves the points
      const worth = Math.max(1, Math.round(co.reduce((s, x) => s + x, 0) / 2));
      next(hint ? Math.ceil(worth / 2) : worth);
    }, 450);
  };

  if (over)
    return (
      <GameOver
        lang={lang}
        id="balance"
        score={score}
        xp={solved * 5}
        lines={[L(`Уравнено реакций: ${solved}`, `Equations balanced: ${solved}`)]}
        onAgain={() => {
          const o = shuffle(EQUATIONS.map((_, i) => i));
          setOrder(o);
          setIdx(0);
          setCo(EQUATIONS[o[0]][2].map(() => 1));
          setScore(0);
          setSolved(0);
          setOver(false);
          setRun(run + 1);
        }}
        onExit={onExit}
      />
    );

  return (
    <div key={run} className="flex flex-col gap-4">
      <GameBar lang={lang} title={L('Уравняй реакцию', 'Balance the equation')} onExit={onExit} left={left} total={ROUND} score={score} />
      <div className={`rounded-2xl border bg-surface p-5 sm:p-8 flex flex-col items-center gap-6 transition-colors ${flash ? 'border-[#30A46C] bg-[#EAF6EF]' : 'border-line'}`}>
        <div key={idx} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4 anim-q">
          {all.map((f, i) => (
            <React.Fragment key={i}>
              {i === re.length && <span className="text-3xl text-ink-3 mx-1">→</span>}
              {i > 0 && i !== re.length && <span className="text-2xl text-ink-3">+</span>}
              <div className="flex flex-col items-center gap-1">
                <Button variant="outline" isIconOnly size="sm" className="w-9" onPress={() => setCo(co.map((x, j) => (j === i ? Math.min(12, x + 1) : x)))} aria-label="+">
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="flex items-baseline gap-0.5">
                  <span className={`font-mono text-3xl w-8 text-right ${co[i] > 1 ? 'text-accent font-bold' : 'text-ink-3'}`}>{co[i]}</span>
                  <span className="font-serif text-3xl text-ink">{sub(f)}</span>
                </div>
                <Button variant="outline" isIconOnly size="sm" className="w-9" onPress={() => setCo(co.map((x, j) => (j === i ? Math.max(1, x - 1) : x)))} aria-label="−">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* atom counter: shows which element still does not match */}
        <div className="flex flex-wrap justify-center gap-2">
          {elements.map((e) => {
            const ok = counts.l[e] === counts.r[e];
            return (
              <span key={e} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-mono border transition-colors ${ok ? 'border-[#30A46C] bg-[#EAF6EF] text-[#1E7A4C]' : 'border-[#E5484D] bg-[#FDF0EF] text-[#CC2F35]'}`}>
                <b>{e}</b> {counts.l[e] ?? 0} : {counts.r[e] ?? 0}
              </span>
            );
          })}
        </div>
        {hint && <p className="text-sm text-ink-2 anim-page">{L('Подсказка: коэффициенты', 'Hint: coefficients')} — <b className="font-mono">{EQUATIONS[order[idx % order.length]][2].join(', ')}</b></p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="lg" className="text-sm font-medium" onPress={() => check()} isDisabled={!balanced}>
            <Check className="w-4 h-4" /> {L('Готово', 'Done')}
          </Button>
          <Button variant="outline" size="lg" className="text-sm" onPress={() => setHint(true)} isDisabled={hint}>
            <Lightbulb className="w-4 h-4" /> {L('Подсказка', 'Hint')}
          </Button>
          <Button variant="outline" size="lg" className="text-sm" onPress={() => next(0)}>
            <SkipForward className="w-4 h-4" /> {L('Пропустить', 'Skip')}
          </Button>
        </div>
        <p className="text-xs text-ink-3 text-center max-w-md">{L('Число атомов каждого элемента слева и справа должно совпасть. Коэффициенты — наименьшие целые.', 'Each element needs the same number of atoms on both sides, with the smallest whole coefficients.')}</p>
      </div>
    </div>
  );
};

export default BalanceGame;
