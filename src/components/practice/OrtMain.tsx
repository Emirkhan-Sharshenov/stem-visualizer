import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw, X } from 'lucide-react';
import { ORT_KIND_HINT, ortSection, type OrtQuestion } from '../../lib/ort/paper';
import { ORT_MAX, ORT_SECTIONS, ORT_THRESHOLD, ortLoadRun, ortStoreRun, roughOrtScore, type OrtRunPlan, type OrtRunState } from '../../lib/ort/sections';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';

const clock = (secs: number) => `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

/** The ORT main test, section by section: no feedback while it runs, a strict time for each section and no way back */
export const OrtMain: React.FC<{ lang: Lang; plan: OrtRunPlan; onExit: () => void; onRetry: () => void }> = ({ lang, plan, onExit, onRetry }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const papers = useMemo(() => Object.fromEntries(plan.sections.map((id) => [id, ortSection(id, plan.seed)])) as Record<string, OrtQuestion[]>, [plan.seed, plan.sections]);
  const [state, setState] = useState<OrtRunState>(() => {
    const was = ortLoadRun();
    if (was && was.seed === plan.seed && was.phase !== 'done') return was;
    return { ...plan, at: 0, phase: 'intro', deadline: 0, startedAt: Date.now(), picked: Object.fromEntries(plan.sections.map((id) => [id, papers[id].map(() => null)])) };
  });
  const [i, setI] = useState(0);
  const [closing, setClosing] = useState(false);
  const [now, setNow] = useState(Date.now());

  const sectionId = state.sections[state.at];
  const section = ORT_SECTIONS.find((s) => s.id === sectionId)!;
  const questions = papers[sectionId];
  const picked = state.picked[sectionId];
  const q = questions[i];
  const left = Math.max(0, Math.ceil((state.deadline - now) / 1000));

  useEffect(() => ortStoreRun(state.phase === 'done' ? null : state), [state]);

  const closeSection = () => {
    setI(0);
    setClosing(false);
    setState((s) => {
      if (s.at + 1 < s.sections.length) return { ...s, at: s.at + 1, phase: 'intro', deadline: 0 };
      return { ...s, phase: 'done' };
    });
  };

  // the clock runs on the wall: time away from the page counts, as it does in a test hall
  useEffect(() => {
    if (state.phase !== 'run') return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [state.phase]);
  useEffect(() => {
    if (state.phase === 'run' && Date.now() >= state.deadline) closeSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, state.phase, state.deadline]);

  const results = useMemo(() => {
    if (state.phase !== 'done') return null;
    return state.sections.map((id) => {
      const qs = papers[id];
      const answers = state.picked[id];
      return { id, qs, answers, right: qs.filter((x, k) => answers[k] === x.correct).length };
    });
  }, [state.phase, state.sections, state.picked, papers]);
  const total = results?.reduce((a, r) => a + r.qs.length, 0) ?? 0;
  const right = results?.reduce((a, r) => a + r.right, 0) ?? 0;
  const whole = plan.sections.length === ORT_SECTIONS.length;

  // saved once, when the last section closes; a reading question makes no sense without its text, so it stays out of the mistake review
  const [recorded, setRecorded] = useState(false);
  useEffect(() => {
    if (!results || recorded) return;
    setRecorded(true);
    const secs = Math.floor((Date.now() - state.startedAt) / 1000);
    progress.recordMistakes(results.flatMap((r) => r.qs.filter((x, k) => !x.passage && r.answers[k] !== null && r.answers[k] !== x.correct)));
    progress.recordTest({ at: Date.now(), subject: whole ? 'ort-main' : results[0].id, score: right, total, secs, section: whole ? 'ort-main' : 'ort-sec' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  useScreenDetail(
    'ort-main',
    state.phase === 'run'
      ? `Пробный основной тест ОРТ на время, раздел «${section.ru}», вопрос ${i + 1} из ${questions.length} (это экзамен, готовые ответы не подсказывай).\n${questionDetail(q, null)}`
      : state.phase === 'done'
        ? `Ученик закончил пробный основной тест ОРТ: ${right} из ${total}.`
        : `Ученик готовится начать раздел «${section.ru}» пробного основного теста ОРТ.`,
  );

  if (state.phase === 'intro') {
    const leftSections = state.sections.length - state.at;
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Button variant="ghost" className="self-start text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти, тест сохранится', 'Leave, the test is saved')}
        </Button>
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-3">
          {state.sections.length > 1 && (
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
              {L(`Раздел ${state.at + 1} из ${state.sections.length}`, `Section ${state.at + 1} of ${state.sections.length}`)}
            </p>
          )}
          <h2 className="font-serif text-2xl text-ink">{section[lang]}</h2>
          <p className="text-sm text-ink-2">{lang === 'ru' ? section.dru : section.den}</p>
          <p className="text-sm font-mono text-ink">
            {section.questions} {L('заданий', 'tasks')} · {section.minutes} {L('минут', 'minutes')}
          </p>
          <p className="text-sm text-ink-2">
            {leftSections > 1
              ? L('Время пойдёт, как только ты начнёшь. Если закончишь раньше, вернуться в этот раздел будет нельзя.', 'The clock starts when you begin. If you finish early, you cannot come back to this section.')
              : L('Время пойдёт, как только ты начнёшь. Это последний раздел.', 'The clock starts when you begin. This is the last section.')}
          </p>
          <Button
            size="lg"
            className="self-start text-sm font-medium"
            onPress={() => {
              const t = Date.now();
              setNow(t);
              setState((s) => ({ ...s, phase: 'run', deadline: t + section.minutes * 60000 }));
            }}
          >
            {L('Начать раздел', 'Start the section')}
          </Button>
        </div>
      </div>
    );
  }

  if (state.phase === 'done' && results) {
    const rough = roughOrtScore(right);
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <div>
            <p className="font-serif text-3xl text-ink">
              {right} / {total}
            </p>
            {whole && (
              <p className="mt-1 text-sm text-ink-2">
                {L(
                  `Примерно ${rough} из ${ORT_MAX}. Это грубый ориентир: настоящий балл шкалируется, и формула не публикуется. Для участия в конкурсе на поступление нужно ${ORT_THRESHOLD}.`,
                  `Roughly ${rough} of ${ORT_MAX}. This is only a guide: the real score is scaled and the formula is not published. University admission needs ${ORT_THRESHOLD}.`,
                )}
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2.5">
            {results.map((r) => {
              const s = ORT_SECTIONS.find((x) => x.id === r.id)!;
              return (
                <li key={r.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-ink">{s[lang]}</span>
                    <span className="font-mono text-ink-2">
                      {r.right}/{r.qs.length}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(r.right / r.qs.length) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-sm" onPress={onRetry}>
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              {L('Новый вариант', 'A new paper')}
            </Button>
            <Button variant="ghost" className="text-sm" onPress={onExit}>
              {L('К экзаменам', 'Back to exams')}
            </Button>
          </div>
        </div>
        {results.map((r) => {
          const s = ORT_SECTIONS.find((x) => x.id === r.id)!;
          const wrong = r.qs.map((x, k) => ({ x, k })).filter(({ x, k }) => r.answers[k] !== x.correct);
          if (!wrong.length) return null;
          return (
            <details key={r.id} className="bg-surface border border-line rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-medium text-ink">
                {s[lang]}: {L(`разбор ошибок (${wrong.length})`, `review (${wrong.length})`)}
              </summary>
              <ol className="mt-3 flex flex-col gap-3">
                {wrong.map(({ x, k }) => (
                  <li key={x.id} className="text-sm border-t border-line pt-3">
                    {x.passage && <p className="text-xs text-ink-3">{L(`Текст «${x.passage.title}»`, `Text “${x.passage.title}”`)}</p>}
                    <p className="text-ink">
                      {k + 1}. {x.prompt[lang]}
                    </p>
                    {r.answers[k] !== null ? (
                      <p className="mt-1 inline-flex items-start gap-1 text-[#CC2F35]">
                        <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {x.options[r.answers[k]!][lang]}
                      </p>
                    ) : (
                      <p className="mt-1 text-ink-3">{L('Нет ответа', 'Not answered')}</p>
                    )}
                    <p className="mt-1 flex items-start gap-1 text-[#1E7A4C]">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {x.options[x.correct][lang]}
                    </p>
                    {x.explain && <p className="mt-1 text-ink-2">{x.explain[lang]}</p>}
                  </li>
                ))}
              </ol>
            </details>
          );
        })}
      </div>
    );
  }

  const answered = picked.filter((p) => p !== null).length;
  const letters = lang === 'ru' ? 'АБВГД' : 'ABCDE';
  const firstOfKind = i === 0 || questions[i - 1].kind !== q.kind;
  const choose = (k: number) => setState((s) => ({ ...s, picked: { ...s.picked, [sectionId]: s.picked[sectionId].map((p, n) => (n === i ? (p === k ? null : k) : p)) } }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button variant="ghost" className="text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти', 'Leave')}
        </Button>
        <h2 className="font-serif text-lg text-ink flex-1 min-w-[180px]">{section[lang]}</h2>
        <span className="font-mono text-xs text-ink-2">
          {answered}/{questions.length}
        </span>
        <span className={`inline-flex items-center gap-1 font-mono text-sm ${left < 120 ? 'text-[#CC2F35]' : 'text-ink'}`}>
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          {clock(left)}
        </span>
      </div>

      <div className={`grid gap-4 items-start ${q.passage ? 'lg:grid-cols-2' : ''}`}>
        {q.passage && (
          <article className="bg-surface border border-line rounded-xl p-5 max-h-72 lg:max-h-[70vh] overflow-y-auto">
            <h3 className="font-serif text-lg text-ink">{q.passage.title}</h3>
            <div className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-ink">
              {q.passage.text.split('\n\n').map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          </article>
        )}
        <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3 min-w-0">
          {firstOfKind && q.kind && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-ink-2">{ORT_KIND_HINT[q.kind][lang]}</p>}
          <p className="text-xs font-mono text-ink-3">{L(`Задание ${i + 1}`, `Task ${i + 1}`)}</p>
          <h3 className="font-serif text-xl text-ink leading-snug">{q.prompt[lang]}</h3>
          <div className="flex flex-col gap-2">
            {q.options.map((o, k) => (
              <button
                key={k}
                type="button"
                aria-pressed={picked[i] === k}
                onClick={() => choose(k)}
                className={`text-left px-4 py-3 rounded-xl border text-[14.5px] leading-relaxed cursor-pointer transition-colors text-ink ${picked[i] === k ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-accent'}`}
              >
                <span className="font-mono text-xs text-ink-3 mr-2">{letters[k]}</span>
                {o[lang]}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" className="text-sm" isDisabled={i === 0} onPress={() => setI(i - 1)}>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              {L('Назад', 'Back')}
            </Button>
            {i + 1 < questions.length ? (
              <Button className="text-sm" onPress={() => setI(i + 1)}>
                {L('Дальше', 'Next')}
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Button>
            ) : (
              <Button className="text-sm" onPress={() => setClosing(true)}>
                {L('Завершить раздел', 'Finish the section')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label={L('Задания раздела', 'Tasks in this section')}>
          {questions.map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={L(`Задание ${k + 1}`, `Task ${k + 1}`)}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => setI(k)}
              className={`w-8 h-8 rounded-lg text-xs font-mono cursor-pointer border ${k === i ? 'border-accent text-accent' : picked[k] !== null ? 'border-transparent bg-accent-soft text-ink' : 'border-line text-ink-3'}`}
            >
              {k + 1}
            </button>
          ))}
        </div>
        {closing ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink flex-1 min-w-[220px]">
              {answered < questions.length
                ? L(`Без ответа: ${questions.length - answered}. Вернуться в этот раздел будет нельзя.`, `${questions.length - answered} unanswered. You cannot come back to this section.`)
                : L('Вернуться в этот раздел будет нельзя.', 'You cannot come back to this section.')}
            </p>
            <Button size="sm" className="text-sm" onPress={closeSection}>
              {L('Завершить', 'Finish')}
            </Button>
            <Button size="sm" variant="outline" className="text-sm" onPress={() => setClosing(false)}>
              {L('Остаться', 'Stay')}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="self-start text-sm" onPress={() => setClosing(true)}>
            {L('Завершить раздел раньше', 'Finish the section early')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrtMain;
