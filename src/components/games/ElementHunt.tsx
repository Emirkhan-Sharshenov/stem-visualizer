import React, { useMemo, useState } from 'react';
import { ELEMENTS_TABLE, CATEGORY_INFO, El } from '../../lib/chem/periodic';
import { GameBar, GameOver, Lang, shuffle, useCountdown } from './common';

/* Element hunt: name ↔ symbol, and "find it on the table". 60 seconds, the first 36 elements plus the famous ones. */

const ROUND = 60;
const FAMOUS = new Set(['Ag', 'Au', 'Hg', 'Pb', 'Sn', 'I', 'Ba', 'Pt', 'U', 'Sr', 'W']);
const POOL = ELEMENTS_TABLE.filter((e) => e.z <= 36 || FAMOUS.has(e.sym));

type Q = { kind: 'sym' | 'name' | 'table'; el: El; options: El[] };

function question(prev?: El): Q {
  let el = POOL[Math.floor(Math.random() * POOL.length)];
  while (prev && el.sym === prev.sym) el = POOL[Math.floor(Math.random() * POOL.length)];
  const r = Math.random();
  const kind = r < 0.4 ? 'sym' : r < 0.75 ? 'name' : 'table';
  // wrong options that look alike: same first letter or close in the table
  const near = shuffle(POOL.filter((e) => e.sym !== el.sym && (e.sym[0] === el.sym[0] || Math.abs(e.z - el.z) <= 3)));
  const rest = shuffle(POOL.filter((e) => e.sym !== el.sym && !near.includes(e)));
  return { kind, el, options: shuffle([el, ...[...near, ...rest].slice(0, 3)]) };
}

export const ElementHunt: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [run, setRun] = useState(0);
  const [over, setOver] = useState(false);
  const [q, setQ] = useState<Q>(() => question());
  const [score, setScore] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { left } = useCountdown(ROUND, !over, () => setOver(true));

  const answer = (sym: string) => {
    if (picked) return;
    setPicked(sym);
    const ok = sym === q.el.sym;
    if (ok) {
      setScore((s) => s + (q.kind === 'table' ? 2 : 1));
      setRight((r) => r + 1);
    } else setScore((s) => Math.max(0, s - 1));
    setTimeout(
      () => {
        setPicked(null);
        setQ(question(q.el));
      },
      ok ? 350 : 900,
    );
  };

  const rows = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  if (over)
    return (
      <GameOver
        lang={lang}
        id="elements"
        score={score}
        xp={score * 1.5}
        lines={[L(`Верных ответов: ${right}`, `Correct: ${right}`)]}
        onAgain={() => {
          setScore(0);
          setRight(0);
          setQ(question());
          setOver(false);
          setRun(run + 1);
        }}
        onExit={onExit}
      />
    );

  const btn = (e: El, label: React.ReactNode) => {
    const state = !picked ? 'idle' : e.sym === q.el.sym ? 'right' : e.sym === picked ? 'wrong' : 'dim';
    return (
      <button
        key={e.sym}
        onClick={() => answer(e.sym)}
        className={`h-20 rounded-xl border-2 text-center cursor-pointer transition-all ${state === 'idle' ? 'border-line bg-surface hover:border-accent hover:-translate-y-0.5' : state === 'right' ? 'border-[#30A46C] bg-[#EAF6EF] anim-right' : state === 'wrong' ? 'border-[#E5484D] bg-[#FDF0EF] anim-wrong' : 'border-line bg-surface opacity-50'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div key={run} className="flex flex-col gap-4">
      <GameBar lang={lang} title={L('Охота на элементы', 'Element hunt')} onExit={onExit} left={left} total={ROUND} score={score} />
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 flex flex-col items-center gap-5">
        <div key={q.el.sym + q.kind} className="text-center anim-q">
          <p className="text-sm text-ink-2">{q.kind === 'sym' ? L('Какой символ у элемента', 'What is the symbol of') : q.kind === 'name' ? L('Как называется элемент', 'What is the name of') : L('Найди на таблице', 'Find on the table')}</p>
          <p className="font-serif text-4xl text-ink mt-1">{q.kind === 'name' ? q.el.sym : q.el.name[lang]}</p>
        </div>
        {q.kind === 'table' ? (
          // a compact table of the first periods; the right cell gives double points
          <div className="w-full overflow-x-auto">
            <div className="grid gap-[3px] mx-auto" style={{ gridTemplateColumns: 'repeat(18, minmax(26px, 1fr))', maxWidth: 760 }}>
              {rows.flatMap((r) =>
                Array.from({ length: 18 }, (_, c) => {
                  const e = ELEMENTS_TABLE.find((x) => x.row === r && x.col === c + 1);
                  if (!e) return <div key={`${r}-${c}`} />;
                  const state = !picked ? 'idle' : e.sym === q.el.sym ? 'right' : e.sym === picked ? 'wrong' : 'dim';
                  return (
                    <button
                      key={e.sym}
                      onClick={() => answer(e.sym)}
                      className={`h-9 rounded-md text-[11px] font-semibold cursor-pointer transition-transform hover:scale-110 ${state === 'right' ? 'ring-2 ring-[#30A46C] anim-right' : state === 'wrong' ? 'ring-2 ring-[#E5484D] anim-wrong' : ''}`}
                      style={{ background: CATEGORY_INFO[e.cat].color + '33', color: '#16171A' }}
                      title={e.sym}
                    >
                      {e.sym}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {q.options.map((e) => btn(e, q.kind === 'sym' ? <span className="font-serif text-3xl text-ink">{e.sym}</span> : <span className="text-lg text-ink">{e.name[lang]}</span>))}
          </div>
        )}
        {picked && picked !== q.el.sym && (
          <p className="text-sm text-ink-2 anim-page">
            {q.el.name[lang]} — <b>{q.el.sym}</b>, {L('№', 'No.')} {q.el.z}, {L('период', 'period')} {q.el.period}
            {q.el.group ? `, ${L('группа', 'group')} ${q.el.group}` : ''}
          </p>
        )}
        <p className="text-xs text-ink-3">{L('Ошибка: −1 очко. Найти на таблице: +2.', 'Mistake: −1. Finding on the table: +2.')}</p>
      </div>
    </div>
  );
};

export default ElementHunt;
