import { Button } from '@heroui/react';
import React, { lazy, Suspense, useState } from 'react';
import { ArrowLeft, Calculator, Clock, ListChecks, Timer, Trophy } from 'lucide-react';
import { BOARD_EXAMS, boardExam, type BoardExam, type BoardSubject, ORT_FORMATS, ORT_SUBJECT_MINUTES, OrtFormat, ortExam, Question } from '../../lib/quiz';
import { ORT_SECTIONS, ortSavedRun, type OrtRunPlan, type OrtSectionId } from '../../lib/ort/sections';
import { ORT_DRILLS, type OrtDrill } from '../../lib/ort/paper';
import { localCurrency } from '../../lib/plan';
import { progress, useProgress } from '../../lib/progress';
import { usePlan } from '../../lib/plan';
import { Quiz } from './Quiz';
import { OrtReadiness } from './OrtReadiness';
import { OrtPlan } from './OrtPlan';

const OrtMainRun = lazy(() => import('./OrtMain'));
const OrtTraining = lazy(() => import('./OrtMain').then((m) => ({ default: m.OrtTraining })));

type Lang = 'ru' | 'en';
const SUBJ = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
  { id: 'mathematics', ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
];

/** Pro: a full timed mock of the ORT subject test with a review at the end */
export const OrtExam: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const plan = usePlan();
  const [subject, setSubject] = useState('physics');
  const [format, setFormat] = useState<OrtFormat>('full');
  // Kyrgyzstan sits the ORT; everyone else most likely the Russian OGE/EGE
  const [exam, setExam] = useState<'ort' | BoardExam>(() => (localCurrency() === 'KGS' ? 'ort' : 'ege'));
  // the main test everyone sits, or a subject test on top of it
  const [ortKind, setOrtKind] = useState<'main' | 'subject'>('main');
  const [mainRun, setMainRun] = useState<OrtRunPlan | null>(null);
  const [drill, setDrill] = useState<OrtDrill | null>(null);
  const [run, setRun] = useState<{ qs: Question[]; seed: number; minutes: number; section: string } | null>(null);
  const { tests } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const past = tests.filter((t) => t.section === 'ort' || t.section === 'oge' || t.section === 'ege' || t.section === 'ort-main');
  const saved = ortSavedRun();
  const board = exam === 'ort' ? null : BOARD_EXAMS[exam][subject as BoardSubject];
  const subjectMinutes = (f: OrtFormat) => (f === 'full' ? ORT_SUBJECT_MINUTES[subject] : ORT_FORMATS[f].minutes);
  const ORT = board ? { questions: board.part1 + board.part2, minutes: board.minutes } : { questions: ORT_FORMATS[format].questions, minutes: subjectMinutes(format) };
  const FORMATS: { id: OrtFormat; icon: React.ReactNode; ru: string; en: string; dru: string; den: string }[] = [
    { id: 'full', icon: <Trophy className="w-4 h-4" />, ru: 'Полный вариант', en: 'Full paper', dru: 'Как на настоящем экзамене', den: 'Like the real exam' },
    { id: 'quick', icon: <Timer className="w-4 h-4" />, ru: 'Экспресс', en: 'Quick', dru: 'Быстрая проверка за перемену', den: 'A check in a break' },
    { id: 'problems', icon: <Calculator className="w-4 h-4" />, ru: 'Только задачи', en: 'Problems only', dru: 'Одни расчёты, от простых к сложным', den: 'Calculations only, easy to hard' },
  ];
  // without Pro: one practice set a day and one section of the main test, to see how it works; the rest is Pro
  const freeUsed = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const useFree = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // still allowed this time
    }
  };
  const today = new Date().toISOString().slice(0, 10);
  const freeDrill = !plan.pro && freeUsed('stem-ort-free-drill') !== today;
  const freeSection = !plan.pro && !freeUsed('stem-ort-free-section');
  const toPro = () => window.dispatchEvent(new Event('open-pro'));
  const openDrill = (d: OrtDrill) => {
    if (plan.pro) return setDrill(d);
    if (!freeDrill) return toPro();
    useFree('stem-ort-free-drill', today);
    setDrill(d);
  };
  // a free week that is still running keeps its two mock exams
  const TRIAL_EXAMS = 2;
  const trialFrom = plan.trial && plan.expiresAt ? plan.expiresAt.getTime() - 7 * 864e5 : 0;
  const trialLeft = plan.trial ? Math.max(0, TRIAL_EXAMS - past.filter((t) => t.at >= trialFrom).length) : Infinity;
  const start = () => {
    if (!plan.pro || trialLeft <= 0) return toPro();
    const seed = Date.now() % 1000000;
    // the full subject test runs like the real one: answer sheet, no answers until the end
    if (exam === 'ort' && format === 'full') return setMainRun({ seed, sections: [`subj:${subject}`] });
    if (exam === 'ort') setRun({ seed, minutes: subjectMinutes(format), section: 'ort', qs: ortExam(subject, seed, format) });
    else setRun({ seed, minutes: BOARD_EXAMS[exam][subject as BoardSubject].minutes, section: exam, qs: boardExam(exam, subject as BoardSubject, seed) });
  };

  const startMain = (sections: OrtSectionId[]) => {
    // only the full test uses up one of the free week's mock exams; practising a section doesn't
    if (!plan.pro) {
      if (sections.length > 1 || !freeSection) return toPro();
      useFree('stem-ort-free-section', today);
    } else if (sections.length > 1 && trialLeft <= 0) return toPro();
    setMainRun({ seed: Date.now() % 1000000, sections });
  };

  if (drill) {
    return (
      <Suspense fallback={null}>
        <OrtTraining key={drill} lang={lang} drill={drill} onExit={() => setDrill(null)} />
      </Suspense>
    );
  }

  if (mainRun) {
    return (
      <Suspense fallback={null}>
        <OrtMainRun key={mainRun.seed} lang={lang} plan={mainRun} onExit={() => setMainRun(null)} onRetry={() => setMainRun({ seed: Date.now() % 1000000, sections: mainRun.sections })} onTrain={(d) => (setMainRun(null), setDrill(d))} />
      </Suspense>
    );
  }

  if (run) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <Button variant="ghost" className="self-start text-sm" onPress={() => setRun(null)}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти из экзамена', 'Leave the exam')}
        </Button>
        <Quiz
          key={run.seed}
          lang={lang}
          questions={run.qs}
          timeLimit={run.minutes * 60}
          passMark={0.6}
          onFinish={(score, total, secs) => progress.recordTest({ at: Date.now(), subject, score, total, secs, section: run.section })}
          onRetry={start}
          onOpenTopic={onOpenTopic}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5">
      {exam === 'ort' && <OrtPlan lang={lang} onDrill={openDrill} onSection={(id) => startMain([id])} onFull={() => startMain(ORT_SECTIONS.map((x) => x.id))} />}
      {plan.pro ? (
        <OrtReadiness lang={lang} onOpenTopic={onOpenTopic} />
      ) : (
        <div className="rounded-xl border-2 border-accent bg-surface p-4 flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-[240px] text-sm text-ink">
            {L('Бесплатно: одна тренировка по типу заданий в день и один раздел основного теста ОРТ. Полный ОРТ, предметные тесты, ОГЭ и ЕГЭ — в Pro.', 'Free: one practice set a day and one section of the ORT main test. The full ORT, subject tests, OGE and EGE are in Pro.')}
          </p>
          <Button size="sm" className="text-sm font-medium" onPress={toPro}>
            {L('Открыть всё в Pro', 'Unlock everything with Pro')}
          </Button>
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            {([
              ['ort', L('ОРТ · Кыргызстан', 'ORT · Kyrgyzstan')],
              ['oge', L('ОГЭ · 9 класс', 'OGE · grade 9')],
              ['ege', L('ЕГЭ · 11 класс', 'EGE · grade 11')],
            ] as const).map(([id, label]) => (
              <Button key={id} size="sm" variant={exam === id ? 'primary' : 'outline'} className="text-xs" onPress={() => (setExam(id), id !== 'ort' && subject === 'astronomy' && setSubject('physics'))}>
                {label}
              </Button>
            ))}
          </div>
          {exam === 'ort' && (
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant={ortKind === 'main' ? 'primary' : 'outline'} className="text-xs" onPress={() => setOrtKind('main')}>
                {L('Основной тест', 'Main test')}
              </Button>
              <Button size="sm" variant={ortKind === 'subject' ? 'primary' : 'outline'} className="text-xs" onPress={() => setOrtKind('subject')}>
                {L('Предметные тесты', 'Subject tests')}
              </Button>
            </div>
          )}
          {exam === 'ort' && ortKind === 'main' ? (
            <>
              <div>
                <h2 className="font-serif text-2xl text-ink">{L('Пробный основной тест ОРТ', 'Mock ORT main test')}</h2>
                <p className="mt-1 text-sm text-ink-2">
                  {L(
                    'Основной тест сдают все абитуриенты: 150 заданий и 215 минут, как в брошюре ЦООМО. У каждого раздела своё время, а в закрытый раздел вернуться нельзя. Калькулятора нет, правильные ответы и разбор появятся в конце. Задания составлены для этого сайта, это не настоящие варианты.',
                    'Every applicant sits the main test: 150 tasks in 215 minutes, as in the official brochure. Each section has its own time and a closed section cannot be reopened. No calculator; answers and review come at the end. The tasks are written for this site, and the verbal sections are in Russian.',
                  )}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {ORT_SECTIONS.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm font-medium text-ink">{s[lang]}</p>
                      <p className="mt-0.5 text-xs text-ink-2">{lang === 'ru' ? s.dru : s.den}</p>
                      <p className="mt-1 text-xs font-mono text-ink-3">
                        {s.questions} · {s.minutes} {L('мин', 'min')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onPress={() => startMain([s.id])}>
                      {plan.pro || freeSection ? L('Только этот раздел', 'This section only') : L('Раздел — в Pro', 'Section in Pro')}
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {saved && (
                  <Button size="lg" className="text-sm font-medium" onPress={() => setMainRun(saved)}>
                    {L('Продолжить начатый тест', 'Resume your test')}
                  </Button>
                )}
                <Button size="lg" variant={saved ? 'outline' : 'primary'} className="text-sm font-medium" onPress={() => startMain(ORT_SECTIONS.map((s) => s.id))}>
                  {!plan.pro || trialLeft <= 0 ? L('Весь тест — в Pro', 'Whole test in Pro') : L('Начать весь тест', 'Start the whole test')}
                </Button>
              </div>
              <div className="border-t border-line pt-4">
                <h3 className="font-serif text-xl text-ink">{L('Тренировка по типам заданий', 'Practice by kind of task')}</h3>
                <p className="mt-1 text-sm text-ink-2">{L('Как решать каждый тип, и 10 заданий без таймера с разбором сразу.', 'How to tackle each kind, then 10 untimed tasks with the answer right away.')}</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {ORT_DRILLS.map((d) => (
                    <button key={d.id} type="button" onClick={() => openDrill(d.id)} className="text-left rounded-xl border border-line bg-surface hover:border-accent transition-colors p-3 cursor-pointer">
                      <span className="block text-sm font-medium text-ink">{d[lang]}</span>
                      <span className="mt-0.5 block text-xs text-ink-2">{d.tips[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : board ? (
            <div>
              <h2 className="font-serif text-2xl text-ink">{exam === 'oge' ? L('Пробный ОГЭ', 'Mock OGE') : L('Пробный ЕГЭ', 'Mock EGE')}</h2>
              <p className="mt-1 text-sm text-ink-2">
                {L(
                  `Как на экзамене: ${board.part1 + board.part2} заданий и ${board.minutes} минут. Часть 1 — ${board.part1} заданий по программе ${board.grades[0]}–${board.grades[1]} классов, часть 2 — ${board.part2} расчётных задач посложнее. Задания составлены по нашему учебнику, а не взяты из банка ФИПИ.`,
                  `Like the real thing: ${board.part1 + board.part2} tasks in ${board.minutes} minutes. Part 1: ${board.part1} tasks on the grade ${board.grades[0]}–${board.grades[1]} syllabus; part 2: ${board.part2} harder calculations. The tasks are built from our textbook, not taken from the FIPI bank.`,
                )}
              </p>
            </div>
          ) : (
          <div>
            <h2 className="font-serif text-2xl text-ink">{L('Пробный ОРТ по предмету', 'Mock ORT subject test')}</h2>
            <p className="mt-1 text-sm text-ink-2">
              {L(
                `Программа ${subject === 'mathematics' ? '5–11' : '7–11'} классов, ${format === 'problems' ? 'только расчётные задачи' : subject === 'mathematics' ? 'половина — задачи на вычисление' : 'треть — расчётные задачи'}. Вариант каждый раз новый. В конце — балл, разбор и ссылки на темы, которые стоит повторить.`,
                `The grade ${subject === 'mathematics' ? '5–11' : '7–11'} syllabus, ${format === 'problems' ? 'calculations only' : subject === 'mathematics' ? 'half are calculations' : 'a third are calculations'}. A fresh paper every time, with a score, review and topic links at the end.`,
              )}
            </p>
          </div>
          )}
          {!board && !(exam === 'ort' && ortKind === 'main') && (
          <div className="grid sm:grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`text-left rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${format === f.id ? 'border-accent bg-accent-soft shadow-sm' : 'border-line bg-surface hover:border-line-strong'}`}
              >
                <span className={`flex items-center gap-1.5 text-sm font-medium ${format === f.id ? 'text-accent' : 'text-ink'}`}>
                  {f.icon}
                  {lang === 'ru' ? f.ru : f.en}
                </span>
                <span className="mt-1 block text-xs text-ink-2">{lang === 'ru' ? f.dru : f.den}</span>
                <span className="mt-1.5 block text-xs font-mono text-ink-3">
                  {ORT_FORMATS[f.id].questions} · {subjectMinutes(f.id)} {L('мин', 'min')}
                </span>
              </button>
            ))}
          </div>
          )}
          {!(exam === 'ort' && ortKind === 'main') && (
          <>
          <div className="flex flex-wrap gap-2">
            {SUBJ.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`h-10 px-4 rounded-full text-sm border cursor-pointer ${subject === s.id ? 'border-transparent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
                style={subject === s.id ? { background: s.color, color: '#fff' } : undefined}
              >
                {s[lang]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="w-4 h-4" strokeWidth={1.75} />
              {ORT.questions} {L('вопросов', 'questions')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" strokeWidth={1.75} />
              {ORT.minutes} {L('минут', 'minutes')}
            </span>
          </div>
          <Button size="lg" className="self-start text-sm font-medium" onPress={() => start()}>
            {!plan.pro || trialLeft <= 0 ? L('Экзамен — в Pro', 'Exam in Pro') : L('Начать экзамен', 'Start the exam')}
          </Button>
          </>
          )}
          {plan.trial && (
            <p className="text-sm text-[#B5651D]">
              {trialLeft > 0
                ? L(`В пробную неделю — ${TRIAL_EXAMS} пробных экзамена. Осталось: ${trialLeft}.`, `The free week includes ${TRIAL_EXAMS} mock exams. Left: ${trialLeft}.`)
                : L('Пробные экзамены пробной недели закончились. С Pro — без ограничений.', 'The free week’s mock exams are used up. Pro has no limit.')}
            </p>
          )}
        </div>
        <aside className="bg-surface border border-line rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Мои попытки', 'My attempts')}</h3>
          {past.length === 0 && <p className="mt-3 text-sm text-ink-3">{L('Пока ни одной.', 'None yet.')}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {[...past]
              .reverse()
              .slice(0, 8)
              .map((r) => (
                <li key={r.at} className="flex items-center justify-between text-sm">
                  <span className="text-ink-2">
                    {r.section === 'ort-main' ? L('ОРТ · основной тест', 'ORT · main test') : `${({ ort: 'ОРТ', oge: 'ОГЭ', ege: 'ЕГЭ' } as Record<string, string>)[r.section ?? 'ort']} · ${SUBJ.find((s) => s.id === r.subject)?.[lang] ?? r.subject}`} · {new Date(r.at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')}
                  </span>
                  <span className={`font-mono ${r.score / r.total >= 0.6 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{Math.round((r.score / r.total) * 100)}%</span>
                </li>
              ))}
          </ul>
        </aside>
      </div>
      </div>
    </>
  );
};

export default OrtExam;
