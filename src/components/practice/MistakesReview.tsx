import React, { useMemo, useState } from 'react';
import { Check, NotebookPen, X } from 'lucide-react';
import { progress, REVIEW_DAYS, useProgress } from '../../lib/progress';
import { usePlan } from '../../lib/plan';
import { topicById } from '../../data/curriculum';
import { ProGate } from '../pro/ProPage';
import { Formula } from '../Formula';

type Lang = 'ru' | 'en';

/** Pro: every wrong answer comes back after 1, 3 and 7 days until it is solved three times in a row */
export const MistakesReview: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const { mistakes } = useProgress();
  const all = Object.values(mistakes ?? {});
  // a stable queue for this session: what was due when the tab opened
  const [queue] = useState(() => all.filter((m) => m.due <= Date.now()).sort((a, b) => a.due - b.due).map((m) => m.q.id));
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [done, setDone] = useState(0);
  // cards come from a snapshot so an answered (or just learnt) card stays on screen until "Next"
  const [snapshot] = useState(() => ({ ...(mistakes ?? {}) }));
  const card = snapshot[queue[i]];
  const nextDue = useMemo(() => all.filter((m) => m.due > Date.now()).sort((a, b) => a.due - b.due)[0]?.due, [all]);
  const byBox = [0, 1, 2, 3].map((b) => all.filter((m) => m.box === b).length);

  const content = (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="flex flex-col gap-4">
        {card ? (
          <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-ink-3">
              <span>
                {L('Карточка', 'Card')} {i + 1} / {queue.length}
                {topicById(card.q.topicId) && ` · ${topicById(card.q.topicId)!.title[lang]}`}
              </span>
              <span>{L(`ошибок: ${card.misses}`, `missed ${card.misses}×`)}</span>
            </div>
            <p className="font-serif text-xl leading-snug text-ink">{card.q.prompt[lang]}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {card.q.options.map((o, k) => {
                const state = answer === null ? 'idle' : k === card.q.correct ? 'right' : k === answer ? 'wrong' : 'dim';
                return (
                  <button
                    key={k}
                    disabled={answer !== null}
                    onClick={() => {
                      setAnswer(k);
                      progress.reviewMistake(card.q.id, k === card.q.correct);
                    }}
                    className={`text-left px-4 py-3 rounded-xl border text-[15px] transition-colors ${
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
                <div className={`rounded-xl px-4 py-3 text-[14.5px] ${answer === card.q.correct ? 'bg-[#EAF6EF]' : 'bg-[#FDF0EF]'}`}>
                  <p className="font-medium text-ink inline-flex items-center gap-1.5">
                    {answer === card.q.correct ? <Check className="w-4 h-4 text-[#1E7A4C]" /> : <X className="w-4 h-4 text-[#CC2F35]" />}
                    {answer === card.q.correct
                      ? card.box >= REVIEW_DAYS.length
                        ? L('Верно! Ошибка исправлена окончательно.', 'Correct! This one is learnt.')
                        : L(`Верно! Повторим через ${REVIEW_DAYS[card.box]} дн.`, `Correct! Again in ${REVIEW_DAYS[card.box]} day(s).`)
                      : L('Снова мимо — повторим завтра.', 'Missed again: back tomorrow.')}
                  </p>
                  {card.q.explain && <p className="mt-1 text-ink-2">{card.q.explain[lang]}</p>}
                </div>
                <div className="flex justify-between gap-2">
                  {topicById(card.q.topicId) ? (
                    <button onClick={() => onOpenTopic(card.q.topicId)} className="h-10 px-3 rounded-lg border border-line bg-surface text-sm text-ink cursor-pointer">
                      {L('Повторить тему', 'Revise the topic')}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => {
                      setAnswer(null);
                      setDone((d) => d + 1);
                      setI((k) => k + 1);
                    }}
                    className="h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer"
                    style={{ color: '#fff' }}
                  >
                    {L('Дальше', 'Next')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-xl p-6 text-center">
            <NotebookPen className="w-9 h-9 mx-auto text-accent" />
            <h3 className="mt-2 font-serif text-2xl text-ink">{all.length === 0 ? L('Ошибок пока нет', 'No mistakes yet') : L('На сегодня всё!', 'All done for today!')}</h3>
            <p className="mt-1 text-sm text-ink-2">
              {all.length === 0
                ? L('Решай задачи и тесты — каждая ошибка попадёт сюда, и мы вернём её в нужный момент.', 'Solve problems and tests: every mistake lands here and comes back at the right time.')
                : done
                  ? L(`Ты разобрал ${done} карточек. `, `You reviewed ${done} cards. `) + (nextDue ? L(`Следующие появятся ${new Date(nextDue).toLocaleDateString('ru-RU')}.`, `More arrive on ${new Date(nextDue).toLocaleDateString('en-GB')}.`) : '')
                  : nextDue
                    ? L(`Следующие карточки появятся ${new Date(nextDue).toLocaleDateString('ru-RU')}.`, `The next cards arrive on ${new Date(nextDue).toLocaleDateString('en-GB')}.`)
                    : ''}
            </p>
          </div>
        )}
      </div>
      <aside className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2 text-sm">
        <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Тетрадь ошибок', 'Mistake notebook')}</h3>
        {[
          [L('Ждут повторения сегодня', 'Due today'), Math.max(0, queue.length - i)],
          [L('Новые (ещё не исправлены)', 'New'), byBox[0]],
          [L('Повторены 1 раз', 'Reviewed once'), byBox[1]],
          [L('Повторены 2 раза', 'Reviewed twice'), byBox[2]],
          [L('Почти выучены', 'Nearly learnt'), byBox[3]],
        ].map(([k, v]) => (
          <div key={k as string} className="flex justify-between">
            <span className="text-ink-2">{k}</span>
            <span className="font-mono text-ink">{v}</span>
          </div>
        ))}
        <p className="text-xs text-ink-3 mt-1">{L('Интервальное повторение: через 1, 3 и 7 дней. Так ошибки запоминаются надолго — прямо к ОРТ.', 'Spaced repetition after 1, 3 and 7 days, so the fixes stick until the exam.')}</p>
      </aside>
    </div>
  );

  return (
    <ProGate lang={lang} pro={plan.pro} onUpgrade={() => window.dispatchEvent(new Event('open-pro'))} title={L(`Работа над ошибками — в Pro (у тебя ${all.length})`, `Mistake review is part of Pro (you have ${all.length})`)} text={L('Все твои ошибки из задач и тестов возвращаются через 1, 3 и 7 дней, пока ты не решишь их уверенно.', 'Every mistake from problems and tests comes back after 1, 3 and 7 days until you get it right for good.')}>
      {content}
    </ProGate>
  );
};

export default MistakesReview;
