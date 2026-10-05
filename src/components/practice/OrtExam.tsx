import React, { useState } from 'react';
import { ArrowLeft, Clock, ListChecks } from 'lucide-react';
import { ORT, ortExam, Question } from '../../lib/quiz';
import { progress, useProgress } from '../../lib/progress';
import { usePlan } from '../../lib/plan';
import { ProGate } from '../pro/ProPage';
import { Quiz } from './Quiz';

type Lang = 'ru' | 'en';
const SUBJ = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
];

/** Pro: a full timed mock of the ORT subject test with a review at the end */
export const OrtExam: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const plan = usePlan();
  const [subject, setSubject] = useState('physics');
  const [run, setRun] = useState<{ qs: Question[]; seed: number } | null>(null);
  const { tests } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const past = tests.filter((t) => t.section === 'ort');
  const start = () => {
    const seed = Date.now() % 1000000;
    setRun({ seed, qs: ortExam(subject, seed) });
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
          timeLimit={ORT.minutes * 60}
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
      title={L('Пробный ОРТ — в Pro', 'Mock ORT is part of Pro')}
      text={L('Полный вариант на время, как на настоящем экзамене, с разбором каждой ошибки.', 'A full timed paper, like the real exam, with every mistake explained.')}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-serif text-2xl text-ink">{L('Пробный ОРТ по предмету', 'Mock ORT subject test')}</h2>
            <p className="mt-1 text-sm text-ink-2">
              {L(
                `${ORT.questions} вопросов за ${ORT.minutes} минут по программе 7–11 классов, треть — расчётные задачи. Вариант каждый раз новый. В конце — балл, разбор и ссылки на темы, которые стоит повторить.`,
                `${ORT.questions} questions in ${ORT.minutes} minutes from the grade 7–11 syllabus, a third are calculations. A fresh paper every time, with a score, review and topic links at the end.`,
              )}
            </p>
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
    </ProGate>
  );
};

export default OrtExam;
