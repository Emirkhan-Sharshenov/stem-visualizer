import React, { useState } from 'react';
import { ArrowLeft, Calculator, Clock, ListChecks, Timer, Trophy } from 'lucide-react';
import { ORT_FORMATS, OrtFormat, ortExam, Question } from '../../lib/quiz';
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
  const [run, setRun] = useState<{ qs: Question[]; seed: number; format: OrtFormat } | null>(null);
  const { tests } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const past = tests.filter((t) => t.section === 'ort');
  const ORT = ORT_FORMATS[format];
  const FORMATS: { id: OrtFormat; icon: React.ReactNode; ru: string; en: string; dru: string; den: string }[] = [
    { id: 'full', icon: <Trophy className="w-4 h-4" />, ru: 'Полный вариант', en: 'Full paper', dru: 'Как на настоящем экзамене', den: 'Like the real exam' },
    { id: 'quick', icon: <Timer className="w-4 h-4" />, ru: 'Экспресс', en: 'Quick', dru: 'Быстрая проверка за перемену', den: 'A check in a break' },
    { id: 'problems', icon: <Calculator className="w-4 h-4" />, ru: 'Только задачи', en: 'Problems only', dru: 'Одни расчёты, от простых к сложным', den: 'Calculations only, easy to hard' },
  ];
  const start = () => {
    const seed = Date.now() % 1000000;
    setRun({ seed, format, qs: ortExam(subject, seed, format) });
  };

  if (run && plan.pro) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <button onClick={() => setRun(null)} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Выйти из экзамена', 'Leave the exam')}
        </button>
        <Quiz
          key={run.seed}
          lang={lang}
          questions={run.qs}
          timeLimit={ORT_FORMATS[run.format].minutes * 60}
          passMark={0.6}
          onFinish={(score, total, secs) => progress.recordTest({ at: Date.now(), subject, score, total, secs, section: 'ort' })}
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
      title={L('Пробный ОРТ и прогноз готовности — в Pro', 'Mock exams and readiness are part of Pro')}
      text={L('Полный вариант на время с разбором ошибок и процент готовности по каждому предмету со списком тем, которые нужно подтянуть.', 'Full timed papers with review, plus your readiness for each subject and the topics to fix first.')}
    >
      <div className="flex flex-col gap-5">
      <OrtReadiness lang={lang} onOpenTopic={onOpenTopic} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-serif text-2xl text-ink">{L('Пробный ОРТ по предмету', 'Mock ORT subject test')}</h2>
            <p className="mt-1 text-sm text-ink-2">
              {L(
                `Программа ${subject === 'mathematics' ? '5–11' : '7–11'} классов, ${format === 'problems' ? 'только расчётные задачи' : subject === 'mathematics' ? 'половина — задачи на вычисление' : 'треть — расчётные задачи'}. Вариант каждый раз новый. В конце — балл, разбор и ссылки на темы, которые стоит повторить.`,
                `The grade ${subject === 'mathematics' ? '5–11' : '7–11'} syllabus, ${format === 'problems' ? 'calculations only' : subject === 'mathematics' ? 'half are calculations' : 'a third are calculations'}. A fresh paper every time, with a score, review and topic links at the end.`,
              )}
            </p>
          </div>
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
          <button onClick={start} className="self-start h-11 px-6 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
            {L('Начать экзамен', 'Start the exam')}
          </button>
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
                    {SUBJ.find((s) => s.id === r.subject)?.[lang] ?? r.subject} · {new Date(r.at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')}
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
