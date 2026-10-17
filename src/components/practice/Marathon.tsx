import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, Timer, Trophy, Zap } from 'lucide-react';
import { PROBLEMS, problemQuestion } from '../../lib/problems';
import { progress, useProgress, XP } from '../../lib/progress';
import { Formula } from '../Formula';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
const LIVES = 3;
const SECONDS = 45;

/** problems in a row until three mistakes; every 5 right answers the grade goes up */
export const Marathon: React.FC<{ lang: Lang; subject: string; onBack: () => void }> = ({ lang, subject, onBack }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { marathonBest } = useProgress();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [answer, setAnswer] = useState<number | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [over, setOver] = useState(false);
  const [best0] = useState(marathonBest ?? 0);

  // harder grades as the run grows: 7–8, then up to 9, 10, all of them
  const level = Math.min(3, Math.floor(score / 5));
  const pool = useMemo(() => {
    const maxGrade = [8, 9, 10, 11][level];
    return PROBLEMS.filter((g) => (subject === 'all' || g.subject === subject) && g.grade <= maxGrade);
  }, [level, subject]);
  const gen = pool[seed % pool.length];
  const q = useMemo(() => problemQuestion(gen, seed), [gen, seed]);
  useScreenDetail('question-marathon', over ? null : `Марафон задач (на время, ${lives} жизни, счёт ${score}).\n${questionDetail(q, answer)}`);

  useEffect(() => {
    if (answer !== null || over) return;
    if (left <= 0) {
      choose(-1);
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, answer, over]);

  function choose(k: number) {
    if (answer !== null) return;
    setAnswer(k);
    const ok = k === q.correct;
    progress.recordProblem(gen.id, ok);
    if (ok) setScore((s) => s + 1);
    else {
      progress.recordMistakes([q]);
      setLives((n) => n - 1);
    }
  }
  const next = () => {
    if (lives <= 0) {
      setOver(true);
      progress.recordMarathon(score);
      return;
    }
    setAnswer(null);
    setLeft(SECONDS);
    setSeed((s) => s + 1 + Math.floor(Math.random() * 97));
  };
  const restart = () => {
    setScore(0);
    setLives(LIVES);
    setAnswer(null);
    setLeft(SECONDS);
    setOver(false);
    setSeed(Math.floor(Math.random() * 1e6));
  };

  if (over) {
    const record = score > best0;
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <div className="bg-surface border border-line rounded-xl p-6 text-center">
          <Trophy className={`w-10 h-10 mx-auto ${record ? 'text-[#D6A419]' : 'text-ink-3'}`} />
          <div className="mt-2 font-serif text-4xl text-ink">{score}</div>
          <p className="text-ink-2">{record ? L('Новый рекорд!', 'New record!') : L(`Рекорд: ${best0}`, `Best: ${best0}`)}</p>
          <p className="mt-1 text-sm text-ink-2">
            {L('Бонус за серию', 'Run bonus')}: <b className="text-ink">+{score * XP.perMarathon}</b> {L('очков', 'points')}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={restart} className="h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
              {L('Ещё раз', 'Again')}
            </button>
            <button onClick={onBack} className="h-10 px-4 rounded-lg border border-line bg-surface text-sm text-ink cursor-pointer">
              {L('К задачам', 'Back to problems')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Выйти из марафона', 'Leave the marathon')}
      </button>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-[26px] text-ink mr-auto">{L('Марафон задач', 'Problem marathon')}</h2>
        <span className="inline-flex gap-1">
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-[#E5484D]' : 'text-line'}`} fill={i < lives ? '#E5484D' : 'none'} />
          ))}
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-surface border border-line font-mono text-sm inline-flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#D6A419]" fill="#FFD60A" />
          {score}
        </span>
        <span className={`px-3 py-1.5 rounded-lg border font-mono text-sm inline-flex items-center gap-1.5 ${left <= 10 && answer === null ? 'bg-[#FFF4F0] border-[#F6CBB9] text-[#B42318]' : 'bg-surface border-line text-ink'}`}>
          <Timer className="w-4 h-4" />
          {left}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${(left / SECONDS) * 100}%` }} />
      </div>
      <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
        <span className="text-xs text-ink-3">
          {gen.title[lang]} · {gen.grade} {L('класс', 'grade')} · {L('уровень', 'level')} {level + 1}
        </span>
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
                  state === 'idle' ? 'bg-surface border-line hover:border-accent hover:bg-accent-soft cursor-pointer text-ink' : state === 'right' ? 'bg-[#EAF6EF] border-[#30A46C] text-ink anim-right' : state === 'wrong' ? 'bg-[#FDF0EF] border-[#E5484D] text-ink anim-wrong' : 'bg-surface border-line text-ink-3'
                }`}
              >
                {o.tex ? <Formula tex={o.ru} /> : o[lang]}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <>
            <div className={`rounded-xl px-4 py-3 text-[14.5px] ${answer === q.correct ? 'bg-[#EAF6EF]' : 'bg-[#FDF0EF]'}`}>
              <p className="font-medium text-ink">{answer === q.correct ? L('Верно!', 'Correct!') : answer === -1 ? L('Время вышло.', 'Time is up.') : L('Неверно — минус жизнь.', 'Wrong: you lose a life.')}</p>
              {q.explain && <p className="mt-1 text-ink-2">{q.explain[lang]}</p>}
            </div>
            <button onClick={next} className="self-end h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
              {lives <= 0 ? L('Итоги', 'Results') : L('Дальше', 'Next')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
