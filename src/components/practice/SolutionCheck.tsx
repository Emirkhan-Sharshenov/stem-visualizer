import { Button } from '@heroui/react';
import React, { useRef, useState } from 'react';
import { AlertTriangle, Camera, Check, CircleHelp, Crown, ImagePlus, Loader2, RotateCcw, X } from 'lucide-react';
import { authHeaders, CHECK_URL, usePlan } from '../../lib/plan';
import { CHECK_DAILY, CRITERIA, type CriterionId, type SolutionCheck as Result } from '../../../supabase/functions/_shared/solutionCheck';
import { useScreenDetail } from '../../lib/pageContext';
import { Rich, shrinkPhoto } from '../VisualMentor';

type Lang = 'ru' | 'en';

const CRITERION_NAME: Record<CriterionId, { ru: string; en: string }> = {
  method: { ru: 'Метод и формулы', en: 'Method and formulas' },
  reasoning: { ru: 'Ход решения', en: 'Reasoning' },
  calculation: { ru: 'Вычисления', en: 'Calculations' },
  answer: { ru: 'Ответ и единицы', en: 'Answer and units' },
};
const MARK = {
  ok: { Icon: Check, bg: 'bg-[#EAF6EF]', fg: 'text-[#1E7A4C]' },
  partial: { Icon: AlertTriangle, bg: 'bg-[#FFF4DA]', fg: 'text-[#B5651D]' },
  error: { Icon: X, bg: 'bg-[#FDF0EF]', fg: 'text-[#CC2F35]' },
  unclear: { Icon: CircleHelp, bg: 'bg-muted', fg: 'text-ink-2' },
};
const Mark: React.FC<{ kind: keyof typeof MARK }> = ({ kind }) => {
  const { Icon, bg, fg } = MARK[kind];
  return (
    <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${bg} ${fg}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
    </span>
  );
};

/** Rich draws a line starting with "Ответ:" as a green answer box; a learner's own line, maybe wrong, mustn't look like that */
const Line: React.FC<{ text: string; lang: Lang }> = ({ text, lang }) => <Rich text={`\u2060${text}`} lang={lang} />;

/** Paid plans: photograph your own solution and see, step by step, where the marks were lost */
export const SolutionCheck: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const paid = plan.pro && !plan.trial;
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<{ url: string; data: string } | null>(null);
  const [task, setTask] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  useScreenDetail('solution-check', result?.status === 'ok' ? `Ученик проверил своё решение по фото. Задача: ${result.problem}. Итог ученика: ${result.studentAnswer} (${result.answerVerdict}). Что исправить: ${result.fix}` : null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    try {
      // handwriting needs more detail than a printed problem
      setPhoto(await shrinkPhoto(f, 1600));
      setResult(null);
    } catch {
      setError(L('Не получилось открыть фото. Попробуй другое.', 'Could not open the photo. Try another one.'));
    }
  };

  const send = async () => {
    if (!photo || busy) return;
    setBusy(true);
    setError('');
    setShown(false);
    try {
      const res = await fetch(CHECK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ image: { mime: 'image/jpeg', data: photo.data }, task, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.check) {
        setResult(data.check);
        setLeft(typeof data.left === 'number' ? data.left : null);
      } else if (res.status === 402) {
        plan.refresh();
      } else if (res.status === 429) {
        setError(L(`На сегодня проверки закончились: ${CHECK_DAILY} в день. Завтра лимит обновится.`, `That’s all for today: ${CHECK_DAILY} checks a day. The limit resets tomorrow.`));
      } else if (data.error === 'busy') {
        setError(L('Сейчас слишком много запросов. Подожди минуту и попробуй снова. Проверка не списана.', 'Too many requests right now. Wait a minute and try again. This check wasn’t counted.'));
      } else {
        setError(L('Проверить не получилось. Попробуй ещё раз. Проверка не списана.', 'The check failed. Please try again. It wasn’t counted.'));
      }
    } catch {
      setError(L('Нет связи с сервером. Проверь интернет и попробуй ещё раз.', 'Can’t reach the server. Check your connection and try again.'));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setResult(null);
    setTask('');
    setError('');
  };

  if (plan.loading) return null;

  if (!paid) {
    return (
      <div className="bg-surface border border-line rounded-xl p-6 flex flex-col items-start gap-3 max-w-2xl">
        <span className="w-10 h-10 rounded-full bg-[#FFF4DA] flex items-center justify-center text-[#B5651D]">
          <Crown className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <h2 className="font-serif text-2xl text-ink">{L('Проверка решения по фото', 'Check your solution from a photo')}</h2>
        <p className="text-[15px] text-ink-2">{L('Сфотографируй своё решение из тетради. ИИ разберёт его по шагам и покажет, где именно ошибка и что повторить, вместо того чтобы просто выдать ответ.', 'Photograph your solution from your notebook. The AI goes through it step by step and shows exactly where the mistake is and what to revise, rather than just giving you the answer.')}</p>
        <p className="text-sm text-ink-2">{plan.trial ? L('Эта функция не входит в пробную неделю, она есть только в платных тарифах Pro и «Учитель».', 'This isn’t part of the free week. It comes with the paid Pro and Teacher plans.') : L('Есть только в платных тарифах Pro и «Учитель».', 'It comes with the paid Pro and Teacher plans.')}</p>
        <Button className="text-sm font-medium" onPress={() => window.dispatchEvent(new Event('open-pro'))}>
          {L('Посмотреть тарифы', 'See the plans')}
        </Button>
      </div>
    );
  }

  const ok = result?.status === 'ok';
  const passed = ok && CRITERIA.filter((id) => result.criteria[id].verdict === 'ok').length;
  const verdict = !ok ? null : result.answerVerdict === 'correct' ? { t: L('Ответ верный', 'The answer is right'), kind: 'ok' as const } : result.answerVerdict === 'missing' ? { t: L('Итогового ответа нет', 'No final answer'), kind: 'partial' as const } : { t: L('Ответ неверный', 'The answer is wrong'), kind: 'error' as const };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-2xl text-ink">{L('Проверка решения по фото', 'Check your solution from a photo')}</h2>
          <p className="mt-1 text-sm text-ink-2">{L('Сними решение одной задачи из тетради. Пиши разборчиво и снимай ровно, при хорошем свете.', 'Photograph the solution to one problem from your notebook. Write clearly and shoot straight on, in good light.')}</p>
        </div>

        {photo ? (
          <div className="flex flex-col gap-2">
            <img src={photo.url} alt={L('Фото решения', 'Photo of the solution')} className="max-h-72 w-fit max-w-full rounded-xl border border-line object-contain" />
            {!busy && (
              <Button size="sm" variant="ghost" className="self-start text-sm" onPress={reset}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                {L('Другое фото', 'Another photo')}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="text-sm font-medium" onPress={() => camera.current?.click()}>
              <Camera className="w-4 h-4" strokeWidth={1.75} />
              {L('Сфотографировать', 'Take a photo')}
            </Button>
            <Button size="lg" variant="outline" className="text-sm font-medium" onPress={() => gallery.current?.click()}>
              <ImagePlus className="w-4 h-4" strokeWidth={1.75} />
              {L('Выбрать из галереи', 'Choose from gallery')}
            </Button>
          </div>
        )}
        <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
        <input ref={gallery} type="file" accept="image/*" className="hidden" onChange={pick} />

        {photo && !result && (
          <>
            <label className="flex flex-col gap-1 text-sm text-ink">
              {L('Условие, если его нет на фото', 'The task, if it isn’t in the photo')}
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                maxLength={1000}
                rows={2}
                disabled={busy}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-accent"
              />
            </label>
            <Button size="lg" className="self-start text-sm font-medium" isDisabled={busy} onPress={send}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? L('Проверяю, это до минуты…', 'Checking, up to a minute…') : L('Проверить решение', 'Check the solution')}
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-[#CC2F35]">
            {error}
          </p>
        )}
        <p className="text-xs text-ink-3">
          {L('Фото отправляется на обработку ИИ-сервису, мы его не сохраняем. Не снимай лица и личные данные. ИИ может ошибаться: это подсказка для тренировки, а не официальная оценка.', 'The photo is sent to an AI service for processing and we don’t store it. Keep faces and personal details out of the shot. The AI can be wrong: this is help for practice, not an official mark.')}
          {left !== null && ` ${L(`Осталось проверок сегодня: ${left}.`, `Checks left today: ${left}.`)}`}
        </p>
      </div>

      {result && !ok && (
        <div className="bg-surface border border-line rounded-xl p-5 flex gap-3" role="status">
          <Mark kind="partial" />
          <div>
            <h3 className="font-medium text-ink">{result.status === 'unreadable' ? L('Не удалось разобрать фото', 'The photo can’t be read') : result.status === 'no_task' ? L('Не вижу условия задачи', 'The task is missing') : L('На фото нет решения задачи', 'There’s no solution in the photo')}</h3>
            <p className="mt-1 text-sm text-ink-2">{result.retake || (result.status === 'no_task' ? L('Допиши условие в поле выше и проверь снова.', 'Type the task in the box above and check again.') : L('Сними решение ближе и при хорошем свете.', 'Take the photo closer, in good light.'))}</p>
            <Button size="sm" variant="outline" className="mt-3 text-sm" onPress={() => setResult(null)}>
              {result.status === 'no_task' ? L('Дописать условие', 'Add the task') : L('Попробовать снова', 'Try again')}
            </Button>
          </div>
        </div>
      )}

      {result && ok && verdict && (
        <>
          <section className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Mark kind={verdict.kind} />
              <div className="min-w-0">
                <h3 className="font-serif text-xl text-ink">{verdict.t}</h3>
                {result.studentAnswer && <div className="mt-0.5 text-sm text-ink-2"><Rich text={L(`У тебя: ${result.studentAnswer}`, `Yours: ${result.studentAnswer}`)} lang={lang} /></div>}
              </div>
            </div>
            {result.problem && (
              <div className="text-sm text-ink-2 border-t border-line pt-3">
                <p className="text-xs font-medium uppercase tracking-[0.05em] mb-1">{L('Как ИИ понял условие', 'The task as the AI read it')}</p>
                <Rich text={result.problem} lang={lang} />
              </div>
            )}
            {result.fix && (
              <div className="rounded-xl bg-muted px-4 py-3 text-[15px] text-ink">
                <p className="font-medium text-accent mb-1">{L('Что исправить', 'What to fix')}</p>
                <Line text={result.fix} lang={lang} />
              </div>
            )}
          </section>

          <section className="bg-surface border border-line rounded-xl p-5">
            <h3 className="font-serif text-xl text-ink">{L('Твоё решение по шагам', 'Your solution, step by step')}</h3>
            <p className="mt-0.5 text-xs text-ink-3">{L('Если ИИ прочитал строку неверно, перепиши её разборчивее и проверь снова.', 'If the AI misread a line, rewrite it more clearly and check again.')}</p>
            <ol className="mt-3 flex flex-col gap-3">
              {result.steps.map((s, k) => (
                <li key={k} className="flex items-start gap-3">
                  <Mark kind={s.verdict} />
                  <div className="min-w-0 flex-1 text-[15px] text-ink">
                    <Line text={s.read} lang={lang} />
                    {s.comment && <div className={`mt-1 text-sm ${s.verdict === 'error' ? 'text-[#CC2F35]' : 'text-ink-2'}`}><Line text={s.comment} lang={lang} /></div>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-surface border border-line rounded-xl p-5">
            <h3 className="font-serif text-xl text-ink">{L(`Критерии: ${passed} из ${CRITERIA.length}`, `Criteria: ${passed} of ${CRITERIA.length}`)}</h3>
            <p className="mt-0.5 text-xs text-ink-3">{L('Это ориентир сайта, а не баллы ОРТ, ОГЭ или ЕГЭ.', 'This is the site’s guide, not an official exam score.')}</p>
            <ul className="mt-3 flex flex-col gap-3">
              {CRITERIA.map((id) => {
                const c = result.criteria[id];
                return (
                  <li key={id} className="flex items-start gap-3">
                    <Mark kind={c.verdict === 'ok' ? 'ok' : c.verdict === 'partial' ? 'partial' : 'error'} />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-ink">{CRITERION_NAME[id][lang]}</p>
                      {c.note && <div className="text-ink-2"><Line text={c.note} lang={lang} /></div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-surface border border-line rounded-xl p-5 flex flex-col items-start gap-3">
            {shown ? (
              <div className="w-full">
                <h3 className="font-serif text-xl text-ink">{L('Верное решение', 'A correct solution')}</h3>
                <div className="mt-2 text-[15px] text-ink"><Rich text={result.solution} lang={lang} /></div>
                {result.answer && <div className="mt-2 text-[15px] text-ink"><Rich text={L(`**Ответ:** ${result.answer}`, `**Answer:** ${result.answer}`)} lang={lang} /></div>}
              </div>
            ) : (
              <Button variant="outline" className="text-sm" onPress={() => setShown(true)}>
                {result.answerVerdict === 'correct' ? L('Сравнить с решением ИИ', 'Compare with the AI’s solution') : L('Сначала попробую сам, потом покажи решение', 'Show the solution after I’ve tried')}
              </Button>
            )}
            <Button variant="ghost" className="text-sm" onPress={reset}>
              <Camera className="w-4 h-4" strokeWidth={1.75} />
              {L('Проверить другое решение', 'Check another solution')}
            </Button>
          </section>
        </>
      )}
    </div>
  );
};

export default SolutionCheck;
