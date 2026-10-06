import React, { useEffect, useMemo, useState } from 'react';
import { Dices, GitBranch } from 'lucide-react';
import { cross, fmtGen, gametes, Genotype, key, Mode, MODES, Phenotype, ratios, sample, simplify } from './genetics';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';

/* ---------- pictures ---------- */

const Pic: React.FC<{ p: Phenotype; size?: number }> = ({ p, size = 34 }) => {
  const l = p.look;
  if (l.kind === 'pea') {
    const fill = l.color === 'yellow' ? '#F2C94C' : '#6FBF5A';
    const stroke = l.color === 'yellow' ? '#C99A1E' : '#3F8F33';
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        {l.smooth ? (
          <circle cx="20" cy="20" r="14" fill={fill} stroke={stroke} strokeWidth="1.5" />
        ) : (
          <path d="M20 6 Q24 9 27 7 Q29 12 33 13 Q31 18 34 21 Q30 24 31 29 Q26 29 24 33 Q20 30 16 33 Q14 29 9 29 Q10 24 6 21 Q9 18 7 13 Q11 12 13 7 Q16 9 20 6Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        )}
        <ellipse cx="15" cy="15" rx="4" ry="2.5" fill="#fff" opacity="0.45" />
      </svg>
    );
  }
  if (l.kind === 'flower') {
    const c = l.color as string;
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="20" cy="10" rx="6" ry="9" fill={c} stroke="#00000022" transform={`rotate(${a} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="4.5" fill="#F5A524" />
      </svg>
    );
  }
  if (l.kind === 'person') {
    // pedigree symbols: square ♂, circle ♀; filled = affected, dot = carrier
    const fill = l.sick ? '#16171A' : '#FFFFFF';
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        {l.male ? <rect x="7" y="7" width="26" height="26" rx="2" fill={fill} stroke="#5B8CFF" strokeWidth="2.5" /> : <circle cx="20" cy="20" r="13.5" fill={fill} stroke="#E0338A" strokeWidth="2.5" />}
        {l.carrier && <circle cx="20" cy="20" r="4.5" fill="#16171A" />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <path d="M20 4 C27 14 32 20 32 26 A12 12 0 0 1 8 26 C8 20 13 14 20 4Z" fill={l.color as string} />
      <text x="20" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {l.label as string}
      </text>
    </svg>
  );
};

/* ---------- component ---------- */

export const GeneticsLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [modeId, setModeId] = useState<Mode>('mono');
  const m = MODES.find((x) => x.id === modeId)!;
  const [parents, setParents] = useState<[Genotype, Genotype]>(m.start);
  const [gen, setGen] = useState(0);
  const [picking, setPicking] = useState<Genotype[] | null>(null);
  const [sim, setSim] = useState<{ n: number; counts: Map<string, { p: Phenotype; n: number }> } | null>(null);

  useEffect(() => progress.recordLab('sandbox-genetics'), []);

  const setMode = (id: Mode) => {
    const nm = MODES.find((x) => x.id === id)!;
    setModeId(id);
    setParents(nm.start);
    setGen(0);
    setPicking(null);
    setSim(null);
  };
  const setParent = (i: 0 | 1, g: Genotype) => {
    setParents((p) => (i === 0 ? [g, p[1]] : [p[0], g]));
    setGen(0);
    setSim(null);
  };

  const c = useMemo(() => cross(m, parents[0], parents[1]), [m, parents]);
  const r = useMemo(() => ratios(m, c.cells), [m, c]);
  const genRatio = simplify(r.gen.map((x) => x.n));
  const phenRatio = simplify(r.phen.map((x) => x.n));
  const genName = (n: number) => (n === 0 ? 'P' : `F${'₀₁₂₃₄₅₆₇₈₉'[n] ?? n}`);

  /** cross the offspring: if they are all the same, just use them; otherwise let the user pick two */
  const nextGen = () => {
    const uniq = [...new Map(c.cells.flat().map((g) => [key(g), g])).values()];
    if (uniq.length === 1 && m.id !== 'sex') {
      setParents([uniq[0], uniq[0]]);
      setGen((g) => g + 1);
      setSim(null);
    } else setPicking([]);
  };
  const pick = (g: Genotype) => {
    if (!picking) return;
    const isMale = (x: Genotype) => x[0].includes('Y');
    const next = [...picking, g];
    if (m.id === 'sex' && next.length === 2 && isMale(next[0]) === isMale(next[1])) return; // need a mother and a father
    if (next.length < 2) return setPicking(next);
    const ordered: [Genotype, Genotype] = m.id === 'sex' && isMale(next[0]) ? [next[1], next[0]] : [next[0], next[1]];
    setParents(ordered);
    setGen((x) => x + 1);
    setPicking(null);
    setSim(null);
  };

  const ParentCard = ({ i }: { i: 0 | 1 }) => {
    const g = parents[i];
    const p = m.phenotype(g);
    return (
      <div className="bg-surface border border-line rounded-xl p-4 flex-1 min-w-[240px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
            {m.parents[i][lang]} · {genName(gen)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Pic p={p} size={48} />
          <div>
            <div className="font-mono text-xl text-ink">{fmtGen(m, g)}</div>
            <div className="text-sm text-ink-2">{p.name[lang]}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.options[i].map((o) => {
            const on = key(o) === key(g);
            return (
              <button
                key={key(o)}
                onClick={() => setParent(i, o)}
                className={`h-8 px-2.5 rounded-md border text-sm font-mono cursor-pointer ${on ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
                style={on ? { color: '#fff' } : undefined}
              >
                {fmtGen(m, o)}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-ink-2">
          {L('Гаметы', 'Gametes')}:{' '}
          {gametes(g).map((x, k) => (
            <span key={k} className="inline-block ml-1 px-1.5 py-0.5 rounded-full bg-muted font-mono text-ink">
              {x.map(m.show).join('')}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {MODES.map((x) => (
          <button
            key={x.id}
            onClick={() => setMode(x.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-sm border cursor-pointer ${modeId === x.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={modeId === x.id ? { color: '#fff' } : undefined}
          >
            {x.title[lang]}
          </button>
        ))}
      </div>
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{m.law[lang]}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{m.hint[lang]}</p>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <ParentCard i={0} />
        <div className="flex items-center justify-center text-3xl text-ink-3 px-1">×</div>
        <ParentCard i={1} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="bg-surface border border-line rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
              {L('Решётка Пеннета', 'Punnett square')} · {L('потомство', 'offspring')} {genName(gen + 1)}
            </h3>
            <button onClick={nextGen} className="h-8 px-3 rounded-lg border border-line bg-surface text-xs text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <GitBranch className="w-3.5 h-3.5" />
              {L('Скрестить потомков между собой', 'Cross the offspring')}
            </button>
          </div>
          {picking && (
            <p className="mb-2 text-sm text-accent">
              {m.id === 'sex' ? L('Выбери в решётке дочь и сына — они станут родителями следующего поколения.', 'Pick a daughter and a son in the square: they become the next parents.') : L(`Выбери в решётке двух потомков (${picking.length}/2).`, `Pick two offspring in the square (${picking.length}/2).`)}
            </p>
          )}
          <table className="border-separate border-spacing-1 mx-auto">
            <thead>
              <tr>
                <th className="w-12 h-10 text-[11px] text-ink-3 font-normal">♀ \ ♂</th>
                {c.gb.map((x, j) => (
                  <th key={j} className="h-10 px-2 rounded-lg bg-[#EEF3FF] font-mono text-sm text-accent">
                    {x.map(m.show).join('')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.ga.map((x, i) => (
                <tr key={i}>
                  <th className="px-2 rounded-lg bg-[#FDEEF5] font-mono text-sm text-[#C2296F]">{x.map(m.show).join('')}</th>
                  {c.cells[i].map((g, j) => {
                    const p = m.phenotype(g);
                    const chosen = picking?.some((q) => q === g);
                    return (
                      <td key={j}>
                        <button
                          onClick={() => pick(g)}
                          disabled={!picking}
                          className={`w-[78px] h-[74px] rounded-lg border flex flex-col items-center justify-center gap-0.5 ${chosen ? 'border-accent bg-accent-soft' : 'border-line bg-paper'} ${picking ? 'hover:border-accent cursor-pointer' : 'cursor-default'}`}
                        >
                          <Pic p={p} size={c.cells.length > 2 ? 28 : 34} />
                          <span className="font-mono text-[12px] text-ink">{fmtGen(m, g)}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Расщепление', 'Ratios')}</h3>
            <div className="text-sm text-ink">
              {L('По фенотипу', 'By phenotype')}: <span className="font-mono font-semibold">{phenRatio.join(' : ')}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {r.phen.map((x) => (
                <li key={x.p.key} className="flex items-center gap-2 text-sm">
                  <Pic p={x.p} size={24} />
                  <span className="flex-1 text-ink">{x.p.name[lang]}</span>
                  <span className="font-mono text-ink-2">{Math.round((x.n / r.total) * 1000) / 10}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-sm text-ink">
              {L('По генотипу', 'By genotype')}: <span className="font-mono font-semibold">{genRatio.join(' : ')}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {r.gen.map((x) => (
                <span key={key(x.g)} className="px-2 py-0.5 rounded-full bg-muted font-mono text-xs text-ink">
                  {x.n} {fmtGen(m, x.g)}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Вырастить потомство', 'Grow offspring')}</h3>
            <p className="text-xs text-ink-3">{L('Решётка даёт вероятности. Настоящие числа случайны — как у Менделя, который считал тысячи горошин.', 'The square gives probabilities; real counts are random, like the thousands of peas Mendel counted.')}</p>
            <div className="mt-2 flex gap-2">
              {[20, 100, 1000].map((n) => (
                <button key={n} onClick={() => setSim({ n, counts: sample(m, parents[0], parents[1], n) })} className="h-8 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
                  <Dices className="w-3.5 h-3.5" />
                  {n}
                </button>
              ))}
            </div>
            {sim && (
              <ul className="mt-3 flex flex-col gap-2">
                {r.phen.map((x) => {
                  const got = sim.counts.get(x.p.key)?.n ?? 0;
                  const exp = (x.n / r.total) * sim.n;
                  return (
                    <li key={x.p.key} className="text-xs">
                      <div className="flex justify-between text-ink">
                        <span className="inline-flex items-center gap-1.5">
                          <Pic p={x.p} size={18} />
                          {x.p.name[lang]}
                        </span>
                        <span className="font-mono">
                          {got} <span className="text-ink-3">/ {L('ожид.', 'exp.')} {Math.round(exp * 10) / 10}</span>
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted relative overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(got / sim.n) * 100}%` }} />
                        <div className="absolute top-0 h-full w-0.5 bg-ink" style={{ left: `${(exp / sim.n) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneticsLab;

