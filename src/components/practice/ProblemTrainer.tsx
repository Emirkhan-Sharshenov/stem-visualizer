import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calculator, Check, Flame, Shuffle, X } from 'lucide-react';
import { PROBLEMS, ProblemGen, problemQuestion } from '../../lib/problems';
import { progress, useProgress } from '../../lib/progress';
import { Formula } from '../Formula';

type Lang = 'ru' | 'en';
const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524' };
const NAME: Record<string, { ru: string; en: string }> = {
  all: { ru: 'Все', en: 'All' },
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
};

/** endless run of generated problems: answer, see the worked solution, next */
const Run: React.FC<{ lang: Lang; gens: ProblemGen[]; title: string; onBack: () => void }> = ({ lang, gens, title, onBack }) => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const [answer, setAnswer] = useState<number | null>(null);
  const [stats, setStats] = useState({ ok: 0, total: 0, streak: 0 });
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const gen = gens[seed % gens.length];
  const q = useMemo(() => problemQuestion(gen, seed), [gen, seed]);
  const choose = (k: number) => {
    if (answer !== null) return;
    setAnswer(k);
    const ok = k === q.correct;
    progress.recordProblem(gen.id, ok);
    setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }));
  };
  const next = () => {
    setAnswer(null);
    setSeed((s) => s + 1 + Math.floor(Math.random() * 97));
  };
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Все задачи', 'All problems')}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLOR[gen.subject] }} />
            {gen.title[lang]} · {gen.grade} {L('класс', 'grade')}
          </span>
          <h2 className="font-serif text-[26px] leading-tight text-ink">{title}</h2>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-line font-mono">
            {stats.ok}/{stats.total}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-line inline-flex items-center gap-1.5 font-mono">
            <Flame className={`w-4 h-4 ${stats.streak ? 'text-[#F76B15]' : 'text-ink-3'}`} strokeWidth={1.75} />
            {stats.streak}
          </span>
        </div>
      </div>
      <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
        <p className="font-serif text-xl leading-snug text-ink">{q.prompt[lang]}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((o, k) => {
            const state = answer === null ? 'idle' : k === q.correct ? 'right' : k === answer ? 'wrong' : 'dim';
            return (
              <button
                key={k}
                disabled={answer !== null}
                onClick={() => choose(k)}
                className={`text-left px-4 py-3 rounded-xl border font-mono text-[15px] transition-colors ${
                  state === 'idle'
                    ? 'bg-surface border-line hover:border-accent hover:bg-accent-soft cursor-pointer text-ink'
                    : state === 'right'
                      ? 'bg-[#EAF6EF] border-[#30A46C] text-ink'
                      : state === 'wrong'
                        ? 'bg-[#FDF0EF] border-[#E5484D] text-ink'
                        : 'bg-surface border-line text-ink-3'
                }`}
              >
                {o.tex ? <Formula tex={o.ru} /> : o[lang]}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <>
            <div className={`rounded-xl px-4 py-3 text-[14.5px] leading-relaxed ${answer === q.correct ? 'bg-[#EAF6EF]' : 'bg-[#FDF0EF]'}`}>
              <p className="font-medium inline-flex items-center gap-1.5 text-ink">
                {answer === q.correct ? <Check className="w-4 h-4 text-[#1E7A4C]" strokeWidth={2.5} /> : <X className="w-4 h-4 text-[#CC2F35]" strokeWidth={2.5} />}
                {answer === q.correct ? L('Верно!', 'Correct!') : L('Неверно. Смотри решение:', 'Not quite. Here is the solution:')}
              </p>
              {q.explain && <p className="mt-1 text-ink-2">{q.explain[lang]}</p>}
            </div>
            <button onClick={next} className="self-end h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
              {L('Следующая задача', 'Next problem')}
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/** catalogue of problem types with progress, plus a mixed mode */
export const ProblemTrainer: React.FC<{ lang: Lang }> = ({ lang }) => {
  const [subject, setSubject] = useState('all');
  const [run, setRun] = useState<{ gens: ProblemGen[]; title: string } | null>(null);
  const { problems } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  if (run) return <Run lang={lang} gens={run.gens} title={run.title} onBack={() => setRun(null)} />;
  const list = PROBLEMS.filter((g) => subject === 'all' || g.subject === subject).sort((a, b) => a.grade - b.grade);
  const solved = Object.values(problems ?? {}).reduce((s, x) => s + x.ok, 0);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(NAME).map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`h-9 px-3.5 rounded-full text-sm border cursor-pointer ${subject === s ? 'border-transparent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
              style={subject === s ? { background: COLOR[s] ?? '#16171A', color: '#fff' } : undefined}
            >
              {NAME[s][lang]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRun({ gens: [...list].sort(() => Math.random() - 0.5), title: L('Смешанные задачи', 'Mixed problems') })}
          className="h-10 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          style={{ color: '#fff' }}
        >
          <Shuffle className="w-4 h-4" strokeWidth={1.75} />
          {L('Решать вперемешку', 'Mixed run')}
        </button>
      </div>
      <p className="text-sm text-ink-2">
        {L(`${PROBLEMS.length} типов задач — числа каждый раз новые, так что задач бесконечно много. После ответа показывается решение. Решено верно: `, `${PROBLEMS.length} problem types with fresh numbers each time, so there’s no end to them. A worked solution follows each answer. Solved correctly: `)}
        <span className="font-mono text-ink">{solved}</span>
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((g) => {
          const st = problems?.[g.id];
          return (
            <button key={g.id} onClick={() => setRun({ gens: [g], title: g.title[lang] })} className="text-left bg-surface border border-line rounded-xl p-4 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer flex items-start gap-3">
              <span className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${COLOR[g.subject]}1A`, color: COLOR[g.subject] }}>
                <Calculator className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink">{g.title[lang]}</span>
                <span className="block text-xs text-ink-3">
                  {NAME[g.subject][lang]} · {g.grade} {L('кл.', 'gr.')}
                  {st && ` · ${st.ok}/${st.total}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
