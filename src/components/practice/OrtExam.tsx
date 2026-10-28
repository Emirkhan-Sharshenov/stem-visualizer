import { Button } from '@heroui/react';
import React, { useState } from 'react';
import { ArrowLeft, Calculator, Clock, ListChecks, Timer, Trophy } from 'lucide-react';
import { BOARD_EXAMS, boardExam, type BoardExam, type BoardSubject, ORT_FORMATS, OrtFormat, ortExam, Question } from '../../lib/quiz';
import { localCurrency } from '../../lib/plan';
import { progress, useProgress } from '../../lib/progress';
import { usePlan } from '../../lib/plan';
import { ProGate } from '../pro/ProPage';
import { Quiz } from './Quiz';
import { OrtReadiness } from './OrtReadiness';

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
  const [run, setRun] = useState<{ qs: Question[]; seed: number; minutes: number; section: string } | null>(null);
  const { tests } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const past = tests.filter((t) => t.section === 'ort' || t.section === 'oge' || t.section === 'ege');
  const board = exam === 'ort' ? null : BOARD_EXAMS[exam][subject as BoardSubject];
  const ORT = board ? { questions: board.part1 + board.part2, minutes: board.minutes } : ORT_FORMATS[format];
  const FORMATS: { id: OrtFormat; icon: React.ReactNode; ru: string; en: string; dru: string; den: string }[] = [
    { id: 'full', icon: <Trophy className="w-4 h-4" />, ru: 'Полный вариант', en: 'Full paper', dru: 'Как на настоящем экзамене', den: 'Like the real exam' },
    { id: 'quick', icon: <Timer className="w-4 h-4" />, ru: 'Экспресс', en: 'Quick', dru: 'Быстрая проверка за перемену', den: 'A check in a break' },
    { id: 'problems', icon: <Calculator className="w-4 h-4" />, ru: 'Только задачи', en: 'Problems only', dru: 'Одни расчёты, от простых к сложным', den: 'Calculations only, easy to hard' },
  ];
  // the free week includes two mock exams; paid Pro has no limit
  const TRIAL_EXAMS = 2;
  const trialFrom = plan.trial && plan.expiresAt ? plan.expiresAt.getTime() - 7 * 864e5 : 0;
  const trialLeft = plan.trial ? Math.max(0, TRIAL_EXAMS - past.filter((t) => t.at >= trialFrom).length) : Infinity;
  const start = () => {
    if (trialLeft <= 0) return window.dispatchEvent(new Event('open-pro'));
    const seed = Date.now() % 1000000;
    if (exam === 'ort') setRun({ seed, minutes: ORT_FORMATS[format].minutes, section: 'ort', qs: ortExam(subject, seed, format) });
    else setRun({ seed, minutes: BOARD_EXAMS[exam][subject as BoardSubject].minutes, section: exam, qs: boardExam(exam, subject as BoardSubject, seed) });
  };

  if (run && plan.pro) {
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
    <ProGate
      lang={lang}
      pro={plan.pro}
      onUpgrade={() => window.dispatchEvent(new Event('open-pro'))}
      title={L('Пробные ОРТ, ОГЭ и ЕГЭ — в Pro', 'Mock ORT, OGE and EGE are part of Pro')}
      text={L('Полный вариант на время с разбором ошибок: ОРТ, ОГЭ или ЕГЭ по числу заданий и времени настоящего экзамена, плюс процент готовности и темы, которые нужно подтянуть.', 'Full timed papers with review — ORT, OGE or EGE with the real number of tasks and time — plus your readiness and the topics to fix first.')}
    >
      <div className="flex flex-col gap-5">
      <OrtReadiness lang={lang} onOpenTopic={onOpenTopic} />
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
          {board ? (
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
          {!board && (
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
                  {ORT_FORMATS[f.id].questions} · {ORT_FORMATS[f.id].minutes} {L('мин', 'min')}
                </span>
              </button>
            ))}
          </div>
          )}
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
            {trialLeft <= 0 ? L('Продолжить с Pro', 'Continue with Pro') : L('Начать экзамен', 'Start the exam')}
          </Button>
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
                    {({ ort: 'ОРТ', oge: 'ОГЭ', ege: 'ЕГЭ' } as Record<string, string>)[r.section ?? 'ort']} · {SUBJ.find((s) => s.id === r.subject)?.[lang] ?? r.subject} · {new Date(r.at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')}
                  </span>
                  <span className={`font-mono ${r.score / r.total >= 0.6 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{Math.round((r.score / r.total) * 100)}%</span>
                </li>
              ))}
          </ul>
        </aside>
      </div>
      </div>
    </ProGate>
  );
};

export default OrtExam;
