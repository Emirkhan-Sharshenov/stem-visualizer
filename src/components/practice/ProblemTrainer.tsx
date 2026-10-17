import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, Check, Flame, Heart, Search, Shuffle, Sigma, X } from 'lucide-react';
import { PROBLEMS, ProblemGen, problemQuestion } from '../../lib/problems';
import { progress, useProgress } from '../../lib/progress';
import { Formula } from '../Formula';
import { Marathon } from './Marathon';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';
import { TopicDrill } from './TopicDrill';
import { TOPICS } from '../../data/curriculum';

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
  useScreenDetail('question-problem', `Расчётная задача «${gen.title.ru}», ${gen.grade} класс.\n${questionDetail(q, answer)}`);
  const choose = (k: number) => {
    if (answer !== null) return;
    setAnswer(k);
    const ok = k === q.correct;
    progress.recordProblem(gen.id, ok);
    if (!ok) progress.recordMistakes([q]);
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
export const ProblemTrainer: React.FC<{ lang: Lang; onOpenTopic?: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const [drill, setDrill] = useState<string | null>(null);
  const [showLaws, setShowLaws] = useState(false);
  const [run, setRun] = useState<{ gens: ProblemGen[]; title: string } | null>(null);
  const [marathon, setMarathon] = useState(false);
  const { problems, marathonBest } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  if (drill) return <TopicDrill lang={lang} topicId={drill} onBack={() => setDrill(null)} onOpenTopic={onOpenTopic} />;
  if (marathon) return <Marathon lang={lang} subject={subject} onBack={() => setMarathon(false)} />;
  if (run) return <Run lang={lang} gens={run.gens} title={run.title} onBack={() => setRun(null)} />;
  const list = PROBLEMS.filter((g) => subject === 'all' || g.subject === subject).sort((a, b) => a.grade - b.grade);
  const solved = Object.values(problems ?? {}).reduce((s, x) => s + x.ok, 0);
  const qry = query.trim().toLowerCase();
  const match = (txt: string) => txt.toLowerCase().includes(qry);
  const handwritten = list.filter((g) => !g.id.startsWith('law:') && (!qry || match(g.title[lang])));
  const laws = list.filter((g) => g.id.startsWith('law:') && (!qry || match(g.title[lang])));
  const topicHits = qry.length >= 2 ? TOPICS.filter((tp) => (subject === 'all' || tp.subject === subject) && (match(tp.title.ru) || match(tp.title.en))).slice(0, 12) : [];
  const card = (g: ProblemGen, compact = false) => {
    const st = problems?.[g.id];
    return (
      <button key={g.id} onClick={() => setRun({ gens: [g], title: g.title[lang] })} className={`text-left bg-surface border border-line rounded-xl ${compact ? 'p-3' : 'p-4'} hover:border-line-strong hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer flex items-start gap-3`}>
        <span className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${COLOR[g.subject]}1A`, color: COLOR[g.subject] }}>
          {g.id.startsWith('law:') ? <Sigma className="w-4 h-4" strokeWidth={1.75} /> : <Calculator className="w-4 h-4" strokeWidth={1.75} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block ${compact ? 'text-sm' : 'text-[15px]'} font-medium text-ink`}>{g.title[lang]}</span>
          <span className="block text-xs text-ink-3">
            {NAME[g.subject][lang]} · {g.grade} {L('кл.', 'gr.')}
            {st && ` · ${st.ok}/${st.total}`}
          </span>
        </span>
      </button>
    );
  };
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
        <div className="flex flex-wrap gap-2">
        <button onClick={() => setMarathon(true)} className="h-10 px-4 rounded-lg border border-[#F6CBB9] bg-[#FFF4F0] hover:bg-[#FFE9E1] text-sm font-medium text-[#B42318] inline-flex items-center gap-2 cursor-pointer">
          <Heart className="w-4 h-4" fill="#E5484D" strokeWidth={1.75} />
          {L('Марафон: 3 жизни', 'Marathon: 3 lives')}
          {(marathonBest ?? 0) > 0 && <span className="font-mono text-xs opacity-70">{L('рекорд', 'best')} {marathonBest}</span>}
        </button>
        <button
          onClick={() => setRun({ gens: [...list].sort(() => Math.random() - 0.5), title: L('Смешанные задачи', 'Mixed problems') })}
          className="h-10 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          style={{ color: '#fff' }}
        >
          <Shuffle className="w-4 h-4" strokeWidth={1.75} />
          {L('Решать вперемешку', 'Mixed run')}
        </button>
        </div>
      </div>
      <p className="text-sm text-ink-2">
        {L(`${PROBLEMS.length} типов задач, из них ${PROBLEMS.filter((g) => g.id.startsWith('law:')).length} строятся автоматически по формулам учебника. Числа и неизвестная каждый раз новые — задач бесконечно много. Решено верно: `, `${PROBLEMS.length} problem types, ${PROBLEMS.filter((g) => g.id.startsWith('law:')).length} of them built from the textbook formulas. Numbers and the unknown change every time. Solved correctly: `)}
        <span className="font-mono text-ink">{solved}</span>
      </p>
      <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-surface border border-line focus-within:border-accent max-w-xl">
        <Search className="w-4 h-4 text-ink-3" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={L('Любая тема или задача: «импульс», «моль», «линза»…', 'Any topic or problem: “momentum”, “mole”, “lens”…')} className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3" />
      </label>
      {topicHits.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Тренировка по теме — бесконечно', 'Endless topic drill')}</h3>
          <div className="flex flex-wrap gap-2">
            {topicHits.map((tp) => (
              <button key={tp.id} onClick={() => setDrill(tp.id)} className="h-9 px-3 rounded-full border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:border-accent hover:text-accent cursor-pointer">
                <BookOpen className="w-3.5 h-3.5" style={{ color: COLOR[tp.subject] }} />
                {tp.title[lang]} <span className="text-ink-3 text-xs">{tp.grade} {L('кл.', 'gr.')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!qry && (
        <p className="text-sm text-ink-2 -mt-2">{L('Найди любую из 486 тем — и решай по ней сколько угодно: расчётные задачи по её формулам вперемешку с вопросами по теории.', 'Look up any of the 486 topics and drill it as long as you like: calculations from its formulas mixed with theory questions.')}</p>
      )}
      {handwritten.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{handwritten.map((g) => card(g))}</div>}
      {laws.length > 0 && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setShowLaws(!showLaws)} className="self-start inline-flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
            <Sigma className="w-4 h-4 text-accent" />
            {L(`Задачи по формулам учебника · ${laws.length}`, `Problems from textbook formulas · ${laws.length}`)}
            <span className="text-accent">{showLaws || qry ? L('свернуть', 'hide') : L('показать', 'show')}</span>
          </button>
          {(showLaws || qry) && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{laws.map((g) => card(g, true))}</div>}
        </div>
      )}
      {qry && !handwritten.length && !laws.length && !topicHits.length && <p className="text-sm text-ink-2">{L('Ничего не нашлось.', 'Nothing found.')}</p>}
    </div>
  );
};
