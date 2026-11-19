import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Lightbulb, RotateCcw, Target, X } from 'lucide-react';
import { drillOf, ORT_DRILLS, ortDrill, ortSection, type OrtDrill, type OrtQuestion } from '../../lib/ort/paper';
import { ORT_MAX, ORT_SECTIONS, ORT_THRESHOLD, ortLoadRun, ortStoreRun, ROMAN, roughOrtScore, sectionMeta, type OrtRunPlan, type OrtRunSection, type OrtRunState } from '../../lib/ort/sections';
import { questionDetail, useScreenDetail } from '../../lib/pageContext';
import { progress } from '../../lib/progress';
import { Figure, Quiz } from './Quiz';
import { AnswerSheet, letter, NumberedText, OrtOption, OrtTaskBody } from './OrtTask';

type Lang = 'ru' | 'en';

/* What the proctor reads out before a section, in our own words after the official guide. */
const GENERAL = [
  'В каждом задании только один верный ответ: в математике из пяти вариантов, в остальных разделах из четырёх.',
  'Отмечайте ответ на листе ответов. Исправить отмеченный ответ можно только один раз: исправленный ответ отмечается квадратом.',
  'Задания идут от лёгких к трудным, и все стоят одинаково. Не задерживайтесь на одном: вернитесь к нему, если останется время.',
  'Когда время раздела закончится, тест перейдёт к следующему. Вернуться к закрытому разделу нельзя, даже если в следующем останется время.',
];
const COMPARE_RULES = [
  '(А) — если больше величина в колонке А;',
  '(Б) — если больше величина в колонке Б;',
  '(В) — если величины равны;',
  '(Г) — если по имеющимся данным определить нельзя.',
];
const SECTION_RULES: Record<string, string[]> = {
  math: [
    'Раздел из двух частей. В части I сравните две величины, каждая в своей рамке, и выберите:',
    ...COMPARE_RULES,
    'Сведения над рамками относятся к обеим величинам. Буква в обеих колонках означает одно и то же. Все числа действительные.',
    'В части II выберите один ответ из пяти. Черновиком пользоваться можно, калькулятором нельзя. Наши рисунки схематичные: решайте по данным, а не по линейке.',
  ],
  verbal: [
    'Аналогии: пара слов, выделенная жирным, показывает образец связи. Выберите из четырёх пар ту, в которой слова связаны так же. Порядок слов важен.',
    'Дополнение предложений: в высказывании от одного до четырёх пропусков. Выберите вариант, слова которого по порядку лучше всего заполняют все пропуски.',
  ],
  reading: ['Прочитайте текст и ответьте на вопросы к нему. Ответ прямо или косвенно содержится в тексте. Строки пронумерованы: номер стоит у каждой пятой.'],
  grammar: ['Задания на правописание, пунктуацию, формы слов и построение предложений. В заданиях с римскими цифрами сначала проверьте каждое утверждение, потом выберите вариант.'],
};
const PART_TITLE: Record<string, string> = { compare: 'Часть I. Сравнение величин', pick5: 'Часть II', analogy: 'Аналогии', completion: 'Дополнение предложений' };

const clock = (secs: number) => `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

/** The ORT main test, section by section: no feedback while it runs, a strict time for each section and no way back */
export const OrtMain: React.FC<{ lang: Lang; plan: OrtRunPlan; onExit: () => void; onRetry: () => void; onTrain?: (d: OrtDrill) => void }> = ({ lang, plan, onExit, onRetry, onTrain }) => {
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

  const [warn, setWarn] = useState('');
  const sectionId = state.sections[state.at];
  const section = sectionMeta(sectionId);
  const subject = sectionId.startsWith('subj:');
  const sectionNo = ORT_SECTIONS.findIndex((x) => x.id === sectionId);
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
  const subjectRun = plan.sections.every((x) => x.startsWith('subj:'));
  // the same results by kind of task, weakest first: they say what to practise
  const byDrill = useMemo(() => {
    if (!results || subjectRun) return [];
    const acc = new Map<OrtDrill, { right: number; total: number }>();
    for (const r of results)
      r.qs.forEach((x, k) => {
        const d = drillOf(x);
        const a = acc.get(d) ?? { right: 0, total: 0 };
        a.total++;
        if (r.answers[k] === x.correct) a.right++;
        acc.set(d, a);
      });
    return [...acc.entries()].map(([id, v]) => ({ drill: ORT_DRILLS.find((d) => d.id === id)!, ...v })).sort((a, b) => a.right / a.total - b.right / b.total);
  }, [results]);

  // saved once, when the last section closes; a reading question makes no sense without its text, so it stays out of the mistake review
  const [recorded, setRecorded] = useState(false);
  useEffect(() => {
    if (!results || recorded) return;
    setRecorded(true);
    const secs = Math.floor((Date.now() - state.startedAt) / 1000);
    progress.recordMistakes(results.flatMap((r) => r.qs.filter((x, k) => !x.passage && r.answers[k] !== null && r.answers[k] !== x.correct)));
    // a subject test is filed like the other subject mocks, so the readiness card counts it
    if (subjectRun) progress.recordTest({ at: Date.now(), subject: results[0].id.slice(5), score: right, total, secs, section: 'ort' });
    else progress.recordTest({ at: Date.now(), subject: whole ? 'ort-main' : results[0].id, score: right, total, secs, section: whole ? 'ort-main' : 'ort-sec' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  useScreenDetail(
    'ort-main',
    state.phase === 'run'
      ? `Пробный ОРТ на время, раздел «${section.ru}», вопрос ${i + 1} из ${questions.length} (это экзамен, готовые ответы не подсказывай).\n${questionDetail(q, null)}`
      : state.phase === 'done'
        ? `Ученик закончил пробный основной тест ОРТ: ${right} из ${total}.`
        : `Ученик готовится начать раздел «${section.ru}» пробного основного теста ОРТ.`,
  );

  if (state.phase === 'intro') {
    const leftSections = state.sections.length - state.at;
    const rules = SECTION_RULES[sectionId] ?? ['Задания по школьной программе. В каждом задании один верный ответ из четырёх или пяти. Черновиком пользоваться можно, калькулятором нельзя.'];
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Button variant="ghost" className="self-start text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти, тест сохранится', 'Leave, the test is saved')}
        </Button>
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">
            {sectionNo >= 0 ? L(`Основной тест · Раздел ${ROMAN[sectionNo]}`, `Main test · Section ${ROMAN[sectionNo]}`) : L('Предметный тест', 'Subject test')}
          </p>
          <h2 className="font-serif text-2xl text-ink">{section[lang]}</h2>
          <p className="text-sm font-mono text-ink">
            {section.questions} {L('заданий', 'tasks')} · {section.minutes} {L('минут', 'minutes')}
          </p>
          <div>
            <p className="text-sm font-semibold text-ink">{L('Инструкция', 'Instructions')}</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-[15px] leading-relaxed text-ink">
              {rules.map((t) => (
                <li key={t} className={t.startsWith('(') ? 'pl-5' : ''}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{L('Общие правила', 'General rules')}</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-2 list-disc pl-5">
              {GENERAL.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-ink-2">
            {leftSections > 1 ? L('Время пойдёт, как только вы начнёте.', 'The clock starts when you begin.') : L('Время пойдёт, как только вы начнёте. Это последний раздел.', 'The clock starts when you begin. This is the last section.')}
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
              const s = sectionMeta(r.id as OrtRunSection);
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
          {byDrill.length > 1 && (
            <div className="border-t border-line pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('По типам заданий', 'By kind of task')}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {byDrill.map((d) => (
                  <li key={d.drill.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex-1 min-w-[160px] text-ink">{d.drill[lang]}</span>
                    <span className={`font-mono ${d.right / d.total >= 0.7 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>
                      {d.right}/{d.total}
                    </span>
                    {onTrain && d.right / d.total < 0.7 && (
                      <Button size="sm" variant="outline" className="text-xs" onPress={() => onTrain(d.drill.id)}>
                        <Target className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {L('Тренировать', 'Practise')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          const s = sectionMeta(r.id as OrtRunSection);
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
                    <OrtTaskBody q={x} lang={lang} n={k + 1} />
                    {r.answers[k] !== null ? (
                      <p className="mt-1 inline-flex items-start gap-1 text-[#CC2F35]">
                        <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        ({letter(r.answers[k]!, lang)}) {x.options[r.answers[k]!][lang]}
                      </p>
                    ) : (
                      <p className="mt-1 text-ink-3">{L('Нет ответа', 'Not answered')}</p>
                    )}
                    <p className="mt-1 flex items-start gap-1 text-[#1E7A4C]">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      ({letter(x.correct, lang)}) {x.options[x.correct][lang]}
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
  const changed = state.changed?.[sectionId] ?? questions.map(() => false);
  const firstOfKind = i === 0 || questions[i - 1].kind !== q.kind;
  // the paper's rule: an answer may be marked, and corrected once; a second correction isn't allowed
  const mark = (t: number, k: number) => {
    setI(t);
    const was = picked[t];
    if (was === k) return;
    if (was !== null && changed[t]) {
      setWarn(L(`Ответ на задание ${t + 1} уже исправлен один раз, больше менять нельзя.`, `Task ${t + 1} was already corrected once and can't be changed again.`));
      return;
    }
    setWarn('');
    setState((st) => ({
      ...st,
      picked: { ...st.picked, [sectionId]: st.picked[sectionId].map((p, n) => (n === t ? k : p)) },
      changed: { ...st.changed, [sectionId]: (st.changed?.[sectionId] ?? questions.map(() => false)).map((c, n) => (n === t ? c || was !== null : c)) },
    }));
  };
  const range = (kind: OrtQuestion['kind']) => {
    const first = questions.findIndex((x) => x.kind === kind);
    const last = questions.length - 1 - [...questions].reverse().findIndex((x) => x.kind === kind);
    return `${first + 1}–${last + 1}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button variant="ghost" className="text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти', 'Leave')}
        </Button>
        <h2 className="font-serif text-lg text-ink flex-1 min-w-[180px]">
          {sectionNo >= 0 && <span className="text-ink-2">{L(`Раздел ${ROMAN[sectionNo]}. `, `Section ${ROMAN[sectionNo]}. `)}</span>}
          {section[lang]}
        </h2>
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
          <article className="bg-surface border border-line rounded-xl p-5 max-h-80 lg:max-h-[72vh] overflow-y-auto">
            <NumberedText title={q.passage.title} text={q.passage.text} />
          </article>
        )}
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-4 min-w-0">
          {!subject && firstOfKind && q.kind && PART_TITLE[q.kind] && (
            <div className="border-b border-line pb-3">
              <p className="text-sm font-semibold text-ink">
                {PART_TITLE[q.kind]} <span className="font-normal text-ink-2">· {L(`задания ${range(q.kind)}`, `tasks ${range(q.kind)}`)}</span>
              </p>
              {q.kind === 'compare' && (
                <ul className="mt-1.5 text-sm text-ink-2">
                  {COMPARE_RULES.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <OrtTaskBody q={q} lang={lang} n={i + 1} />
          <div className="flex flex-col gap-1.5">
            {q.options.map((o, k) => (
              <button
                key={k}
                type="button"
                aria-pressed={picked[i] === k}
                onClick={() => mark(i, k)}
                className={`text-left px-4 py-2.5 rounded-lg border text-[16px] leading-relaxed cursor-pointer transition-colors text-ink ${picked[i] === k ? 'border-ink bg-accent-soft' : 'border-transparent hover:border-line'}`}
              >
                <OrtOption o={o} k={k} lang={lang} />
              </button>
            ))}
          </div>
          {warn && (
            <p role="alert" className="text-sm text-[#B5651D]">
              {warn}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" className="text-sm" isDisabled={i === 0} onPress={() => (setI(i - 1), setWarn(''))}>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              {L('Назад', 'Back')}
            </Button>
            {i + 1 < questions.length ? (
              <Button className="text-sm" onPress={() => (setI(i + 1), setWarn(''))}>
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
        <AnswerSheet
          lang={lang}
          title={sectionNo >= 0 ? L(`ЛИСТ ОТВЕТОВ · РАЗДЕЛ ${ROMAN[sectionNo]}. ${section.ru.toUpperCase()}`, `ANSWER SHEET · SECTION ${ROMAN[sectionNo]}`) : L('ЛИСТ ОТВЕТОВ', 'ANSWER SHEET')}
          questions={questions}
          picked={picked}
          changed={changed}
          current={i}
          onPick={mark}
        />
        <p className="text-xs text-ink-3">{L('Нажмите кружок, чтобы отметить ответ. Исправить можно один раз: исправленный ответ станет квадратом.', 'Tap a circle to mark an answer. You may correct it once: a corrected answer becomes a square.')}</p>
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

/** Practice one kind of task: how to tackle it, then ten tasks with the answer and its reason right after each */
export const OrtTraining: React.FC<{ lang: Lang; drill: OrtDrill; onExit: () => void }> = ({ lang, drill, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [seed, setSeed] = useState(() => Date.now() % 1000000);
  const info = ORT_DRILLS.find((d) => d.id === drill)!;
  const questions = useMemo(() => ortDrill(drill, seed), [drill, seed]);
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <Button variant="ghost" className="self-start text-sm" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('К экзаменам', 'Back to exams')}
      </Button>
      <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Тренировка ОРТ', 'ORT practice')}</p>
        <h2 className="font-serif text-2xl text-ink">{info[lang]}</h2>
        <ul className="flex flex-col gap-2">
          {info.tips.map((t) => (
            <li key={t} className="flex gap-2.5 text-[15px] text-ink">
              <Lightbulb className="w-4 h-4 mt-1 shrink-0 text-accent" strokeWidth={1.75} />
              {t}
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-2">{L('Без таймера: ответ и разбор сразу после каждого задания.', 'No timer: the answer and its reason come right after each task.')}</p>
      </div>
      <Quiz
        key={seed}
        lang={lang}
        questions={questions}
        passMark={0.7}
        ort
        onFinish={(score, total, secs) => progress.recordTest({ at: Date.now(), subject: drill, score, total, secs, section: 'ort-drill' })}
        onRetry={() => setSeed(Date.now() % 1000000)}
      />
    </div>
  );
};

export default OrtMain;
