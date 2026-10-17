import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Flame, X } from 'lucide-react';
import { topicById } from '../../data/curriculum';
import { problemQuestion, problemsForTopic } from '../../lib/problems';
import { questionsForTopic, Question } from '../../lib/quiz';
import { progress } from '../../lib/progress';
import { Formula } from '../Formula';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';

/**
 * Endless practice on any topic: calculation problems from its formulas take turns with
 * questions built from the topic text, so every one of the textbook's topics can be drilled.
 */
export const TopicDrill: React.FC<{ lang: Lang; topicId: string; onBack: () => void; onOpenTopic?: (id: string) => void }> = ({ lang, topicId, onBack, onOpenTopic }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const topic = topicById(topicId)!;
  const gens = useMemo(() => problemsForTopic(topicId), [topicId]);
  const [k, setK] = useState(0);
  const [seed] = useState(() => Math.floor(Math.random() * 1e6));
  const [answer, setAnswer] = useState<number | null>(null);
  const [stats, setStats] = useState({ ok: 0, total: 0, streak: 0 });

  const q: Question | undefined = useMemo(() => {
    // every other question is a calculation when the topic has formulas
    if (gens.length && k % 2 === 0) return problemQuestion(gens[(k / 2) % gens.length], seed + k * 7);
    const pool = questionsForTopic(topic, 10, seed + Math.floor(k / 6));
    return pool[k % pool.length];
  }, [gens, k, seed, topic]);

  useScreenDetail('question-drill', q ? `Тренировка по теме «${topic.title.ru}» (${topic.grade} класс).\n${questionDetail(q, answer)}` : null);

  if (!q) {
    return (
      <div className="flex flex-col gap-3 max-w-3xl">
        <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          {L('Назад', 'Back')}
        </button>
        <p className="text-ink-2">{L('По этой теме пока мало материала для заданий.', 'Not enough material in this topic for exercises yet.')}</p>
      </div>
    );
  }

  const isCalc = q.id.startsWith('prob:');
  const choose = (i: number) => {
    if (answer !== null) return;
    setAnswer(i);
    const ok = i === q.correct;
    // prob:<generator id>:<seed>, and law generator ids contain colons themselves
    progress.recordProblem(isCalc ? q.id.slice(5, q.id.lastIndexOf(':')) : `topic:${topicId}`, ok);
    if (!ok) progress.recordMistakes([q]);
    setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }));
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Все задачи', 'All problems')}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs text-ink-3">
            {L('Тренировка по теме', 'Topic drill')} · {topic.grade} {L('класс', 'grade')} · {gens.length ? L(`расчётные задачи (${gens.length}) + теория`, `calculations (${gens.length}) + theory`) : L('вопросы по теории', 'theory questions')}
          </span>
          <h2 className="font-serif text-[26px] leading-tight text-ink">{topic.title[lang]}</h2>
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
        <span className="text-[11px] uppercase tracking-[0.05em] text-ink-3">{isCalc ? L('Расчётная задача', 'Calculation') : L('Теория', 'Theory')}</span>
        <p className="font-serif text-xl leading-snug text-ink">{q.prompt[lang]}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((o, i) => {
            const state = answer === null ? 'idle' : i === q.correct ? 'right' : i === answer ? 'wrong' : 'dim';
            return (
              <button
                key={i}
                disabled={answer !== null}
                onClick={() => choose(i)}
                className={`text-left px-4 py-3 rounded-xl border text-[15px] transition-colors ${isCalc ? 'font-mono' : ''} ${
                  state === 'idle' ? 'bg-surface border-line hover:border-accent hover:bg-accent-soft cursor-pointer text-ink' : state === 'right' ? 'bg-[#EAF6EF] border-[#30A46C] text-ink' : state === 'wrong' ? 'bg-[#FDF0EF] border-[#E5484D] text-ink' : 'bg-surface border-line text-ink-3'
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
                {answer === q.correct ? L('Верно!', 'Correct!') : L('Неверно. Разбор:', 'Not quite. Here is why:')}
              </p>
              {q.explain && <p className="mt-1 text-ink-2">{q.explain[lang]}</p>}
            </div>
            <div className="flex justify-between gap-2">
              {onOpenTopic ? (
                <button onClick={() => onOpenTopic(topicId)} className="h-10 px-3 rounded-lg border border-line bg-surface text-sm text-ink cursor-pointer">
                  {L('Открыть тему', 'Open the topic')}
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => {
                  setAnswer(null);
                  setK((n) => n + 1);
                }}
                className="h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
                style={{ color: '#fff' }}
              >
                {L('Следующее задание', 'Next')}
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicDrill;
