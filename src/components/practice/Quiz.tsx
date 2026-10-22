import { Button } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { Confetti } from '../fx/Confetti';
import { Check, Clock, RotateCcw, X } from 'lucide-react';
import type { Question } from '../../lib/quiz';
import { topicById } from '../../data/curriculum';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';

/** One-question-at-a-time quiz with instant feedback, optional timer and a review at the end */
export const Quiz: React.FC<{
  lang: Lang;
  questions: Question[];
  timeLimit?: number;
  onFinish: (score: number, total: number, secs: number) => void;
  onRetry?: () => void;
  onOpenTopic?: (id: string) => void;
  passMark?: number;
}> = ({ lang, questions, timeLimit, onFinish, onRetry, onOpenTopic, passMark = 0.75 }) => {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [done, setDone] = useState(false);
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  useEffect(() => {
    if (!timeLimit || done) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timeLimit, done]);

  const elapsed = Math.floor((now - start) / 1000);
  const left = timeLimit ? Math.max(0, timeLimit - elapsed) : 0;
  const score = picked.filter((p, k) => p === questions[k].correct).length;

  const finish = () => {
    if (done) return;
    setDone(true);
    progress.recordMistakes(questions.filter((q, k) => picked[k] !== null && picked[k] !== q.correct));
    onFinish(score, questions.length, Math.floor((Date.now() - start) / 1000));
  };

  const missed = done ? questions.filter((q, k) => picked[k] !== q.correct) : [];
  useScreenDetail(
    'question-quiz',
    done
      ? `Ученик закончил тест: ${score} из ${questions.length}.${missed.length ? ` Ошибки в вопросах: ${missed.slice(0, 6).map((q) => `«${q.prompt.ru}» (верно: ${q.options[q.correct].ru})`).join('; ')}` : ''}`
      : `Тест, вопрос ${i + 1} из ${questions.length}${timeLimit ? ' (идёт на время — это экзамен, готовые ответы не подсказывай)' : ''}.\n${questionDetail(questions[i], picked[i] ?? null)}`,
  );

  useEffect(() => {
    if (timeLimit && left === 0 && !done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (done) {
    const ok = score / questions.length >= passMark;
    return (
      <div className="flex flex-col gap-4">
        <div className={`relative overflow-hidden rounded-xl p-5 border anim-page ${ok ? 'bg-[#EAF6EF] border-[#BFE3CC]' : 'bg-[#FDF0EF] border-[#F2C8C5]'}`}>
          {ok && <Confetti />}
          <div className="font-serif text-3xl text-ink">
            <span className="anim-score">{score}</span> / {questions.length}
          </div>
          <p className="mt-1 text-[15px] text-ink-2">
            {ok ? L('Отлично! Тема засчитана.', 'Great! Topic passed.') : L('Почти. Перечитай пункты, где ошибся, и попробуй снова.', 'Nearly. Re-read the points you missed and try again.')}
          </p>
          {onRetry && (
            <Button variant="outline" className="mt-3 text-sm" onPress={() => onRetry()}>
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              {L('Пройти ещё раз', 'Try again')}
            </Button>
          )}
        </div>
        <ol className="flex flex-col gap-2">
          {questions.map((q, k) => {
            const right = picked[k] === q.correct;
            const topic = topicById(q.topicId);
            return (
              <li key={q.id} className="bg-surface border border-line rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${right ? 'bg-chemistry' : 'bg-physics'}`}>
                    {right ? <Check className="w-3 h-3" color="#fff" strokeWidth={3} /> : <X className="w-3 h-3" color="#fff" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] text-ink">{q.prompt[lang]}</p>
                    <p className="mt-1 text-[13.5px] text-[#1E7A4C]">{q.options[q.correct].tex ? <Formula tex={q.options[q.correct].ru} /> : q.options[q.correct][lang]}</p>
                    {topic && onOpenTopic && (
                      <Button variant="ghost" size="sm" className="mt-1 text-xs" onPress={() => onOpenTopic(topic.id)}>
                        {L('Тема:', 'Topic:')} {topic.title[lang]} →
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const q = questions[i];
  const answer = picked[i];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${((i + (answer !== null ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-ink-2">
          {i + 1}/{questions.length}
        </span>
        {timeLimit && (
          <span className={`inline-flex items-center gap-1 font-mono text-xs ${left < 30 ? 'text-[#CC2F35]' : 'text-ink-2'}`}>
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      <h3 key={`h${i}`} className="font-serif text-xl text-ink leading-snug anim-q">{q.prompt[lang]}</h3>
      <div key={`o${i}`} className="flex flex-col gap-2 anim-stagger">
        {q.options.map((o, k) => {
          const chosen = answer === k;
          const isRight = k === q.correct;
          const state = answer === null ? 'idle' : isRight ? 'right' : chosen ? 'wrong' : 'dim';
          return (
            <button
              key={k}
              disabled={answer !== null}
              onClick={() => setPicked((p) => p.map((x, n) => (n === i ? k : x)))}
              className={`text-left px-4 py-3 rounded-xl border text-[14.5px] leading-relaxed transition-colors ${
                state === 'idle'
                  ? 'bg-surface border-line hover:border-accent hover:bg-accent-soft cursor-pointer text-ink'
                  : state === 'right'
                    ? 'bg-[#EAF6EF] border-[#30A46C] text-ink anim-right'
                    : state === 'wrong'
                      ? 'bg-[#FDF0EF] border-[#E5484D] text-ink anim-wrong'
                      : 'bg-surface border-line text-ink-3'
              }`}
            >
              <span className="font-mono text-xs text-ink-3 mr-2">{String.fromCharCode(65 + k)}</span>
              {o.tex ? <Formula tex={o.ru} /> : o[lang]}
            </button>
          );
        })}
      </div>
      {answer !== null && q.explain && (
        <div className="anim-page rounded-xl bg-muted px-4 py-3 text-[14px] leading-relaxed text-ink">
          <span className="font-medium text-accent">{lang === 'ru' ? 'Решение: ' : 'Solution: '}</span>
          {q.explain[lang]}
        </div>
      )}
      {answer !== null && (
        <div className="flex justify-end">
          <Button className="text-sm font-medium" onPress={() => (i + 1 < questions.length ? setI(i + 1) : finish())}>
            {i + 1 < questions.length ? L('Дальше', 'Next') : L('Результат', 'See results')}
          </Button>
        </div>
      )}
    </div>
  );
};
