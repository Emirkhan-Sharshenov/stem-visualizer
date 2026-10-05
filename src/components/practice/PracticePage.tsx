import React, { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Eye, Sparkles, X } from 'lucide-react';
import { PREDICTIONS, Prediction } from '../../data/practice/predictions';
import { progress, useProgress } from '../../lib/progress';
import { practiceTest, Question } from '../../lib/quiz';
import { Quiz } from './Quiz';
import { DailyCard, SectionTests, TopicsBrowser } from './PracticeBlocks';

const SimById = lazy(() => import('../sims/SimById'));

type Lang = 'ru' | 'en';
type Tab = 'predict' | 'topics' | 'sections' | 'test';

const SUBJECTS: Record<string, { ru: string; en: string; color: string }> = {
  all: { ru: 'Все предметы', en: 'All subjects', color: '#2F5BFF' },
  physics: { ru: 'Физика', en: 'Physics', color: '#E5484D' },
  chemistry: { ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  biology: { ru: 'Биология', en: 'Biology', color: '#F5A524' },
};

/* ---------- predict, then check ---------- */

const Challenge: React.FC<{ lang: Lang; p: Prediction; onNext?: () => void; onBack: () => void; onOpenTopic: (id: string) => void }> = ({ lang, p, onNext, onBack, onOpenTopic }) => {
  const [answer, setAnswer] = useState<number | null>(null);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const ok = answer === p.correct;
  const choose = (k: number) => {
    if (answer !== null) return;
    setAnswer(k);
    progress.recordPrediction(p.id, k === p.correct);
  };
  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Все задания', 'All challenges')}
      </button>
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
          <span className="w-2 h-2 rounded-full" style={{ background: SUBJECTS[p.subject].color }} />
          {SUBJECTS[p.subject][lang]} · {p.grade} {L('класс', 'grade')}
        </span>
        <h1 className="mt-1 font-serif text-[28px] sm:text-[32px] leading-tight text-ink max-w-3xl">{p.question[lang]}</h1>
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <Suspense fallback={<div className="lab-stage rounded-xl aspect-video" />}>
          {/* paused until the learner commits to an answer, then it plays out */}
          <SimById key={answer === null ? 'wait' : 'go'} lang={lang} id={p.sim} mode={p.mode} initialParams={p.params} autoplay={answer !== null} locked={answer === null} />
        </Suspense>
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-ink-2">{answer === null ? L('Сначала выбери ответ — потом запустим опыт.', 'Pick an answer first, then we run the experiment.') : L('Смотри опыт ↖', 'Watch the experiment ↖')}</p>
          {p.options.map((o, k) => {
            const state = answer === null ? 'idle' : k === p.correct ? 'right' : k === answer ? 'wrong' : 'dim';
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                disabled={answer !== null}
                className={`text-left px-4 py-3 rounded-xl border text-[15px] transition-colors ${
                  state === 'idle'
                    ? 'bg-surface border-line hover:border-accent hover:bg-accent-soft text-ink cursor-pointer'
                    : state === 'right'
                      ? 'bg-[#EAF6EF] border-[#30A46C] text-ink'
                      : state === 'wrong'
                        ? 'bg-[#FDF0EF] border-[#E5484D] text-ink'
                        : 'bg-surface border-line text-ink-3'
                }`}
              >
                {o[lang]}
              </button>
            );
          })}
          {answer !== null && (
            <div className={`mt-2 rounded-xl p-4 border ${ok ? 'bg-[#EAF6EF] border-[#BFE3CC]' : 'bg-[#FDF0EF] border-[#F2C8C5]'}`}>
              <p className="font-medium text-ink inline-flex items-center gap-1.5">
                {ok ? <Check className="w-4 h-4 text-[#1E7A4C]" strokeWidth={2.5} /> : <X className="w-4 h-4 text-[#CC2F35]" strokeWidth={2.5} />}
                {ok ? L('Верно!', 'Correct!') : L('Не угадал — и это нормально', 'Not quite, and that’s fine')}
              </p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{p.explain[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => onOpenTopic(p.topicId)} className="h-9 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-sm text-ink cursor-pointer">
                  {L('Читать тему', 'Read the topic')}
                </button>
                {onNext && (
                  <button onClick={onNext} className="h-9 px-3 rounded-lg bg-accent hover:bg-accent-hover text-sm inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
                    {L('Следующее', 'Next')}
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- timed practice test ---------- */

const GRADE_RANGES: { id: string; r: [number, number]; ru: string; en: string }[] = [
  { id: '5-7', r: [5, 7], ru: '5–7 класс', en: 'Grades 5–7' },
  { id: '8-9', r: [8, 9], ru: '8–9 класс', en: 'Grades 8–9' },
  { id: '10-11', r: [10, 11], ru: '10–11 класс', en: 'Grades 10–11' },
  { id: 'all', r: [5, 11], ru: 'Все классы', en: 'All grades' },
];

const TestRunner: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const [subject, setSubject] = useState('all');
  const [range, setRange] = useState('all');
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [run, setRun] = useState<{ qs: Question[]; seed: number } | null>(null);
  const { tests } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const chip = (active: boolean) => `h-9 px-3.5 rounded-full text-sm border transition-colors cursor-pointer ${active ? 'bg-accent border-accent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`;

  if (run) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <button onClick={() => setRun(null)} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Настройки теста', 'Test settings')}
        </button>
        <Quiz
          key={run.seed}
          lang={lang}
          questions={run.qs}
          timeLimit={timed ? run.qs.length * 60 : undefined}
          passMark={0.7}
          onFinish={(score, total, secs) => progress.recordTest({ at: Date.now(), subject, score, total, secs })}
          onRetry={() => {
            const seed = Date.now() % 100000;
            setRun({ seed, qs: practiceTest(subject, GRADE_RANGES.find((g) => g.id === range)!.r, count, seed) });
          }}
          onOpenTopic={onOpenTopic}
        />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="font-serif text-2xl text-ink">{L('Тренировочный тест', 'Practice test')}</h2>
          <p className="mt-1 text-sm text-ink-2">{L('Вопросы из всех тем учебника, по 1 минуте на вопрос — как на ОРТ и экзаменах. В конце — разбор с ссылками на темы.', 'Questions from across the textbook, a minute each, exam-style. A review with topic links at the end.')}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Предмет', 'Subject')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECTS).map(([id, s]) => (
              <button key={id} onClick={() => setSubject(id)} className={chip(subject === id)} style={subject === id ? { color: '#fff' } : undefined}>
                {s[lang]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Классы', 'Grades')}</p>
          <div className="flex flex-wrap gap-2">
            {GRADE_RANGES.map((g) => (
              <button key={g.id} onClick={() => setRange(g.id)} className={chip(range === g.id)} style={range === g.id ? { color: '#fff' } : undefined}>
                {g[lang]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Вопросов', 'Questions')}</p>
            <div className="flex gap-2">
              {[10, 20, 30].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={chip(count === n)} style={count === n ? { color: '#fff' } : undefined}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer mt-5">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="accent-[#2F5BFF] w-4 h-4" />
            <Clock className="w-4 h-4" strokeWidth={1.75} />
            {L(`На время (${count} мин)`, `Timed (${count} min)`)}
          </label>
        </div>
        <button
          onClick={() => {
            const seed = Date.now() % 100000;
            setRun({ seed, qs: practiceTest(subject, GRADE_RANGES.find((g) => g.id === range)!.r, count, seed) });
          }}
          className="self-start h-11 px-6 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer"
          style={{ color: '#fff' }}
        >
          {L('Начать тест', 'Start the test')}
        </button>
      </div>
      <aside className="bg-surface border border-line rounded-xl p-5">
        <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Последние результаты', 'Recent results')}</h3>
        {tests.length === 0 && <p className="mt-3 text-sm text-ink-3">{L('Пока пусто — пройди первый тест.', 'Nothing yet: take your first test.')}</p>}
        <ul className="mt-3 flex flex-col gap-2">
          {[...tests]
            .reverse()
            .slice(0, 8)
            .map((r) => (
              <li key={r.at} className="flex items-center justify-between text-sm">
                <span className="text-ink-2">
                  {SUBJECTS[r.subject]?.[lang] ?? r.subject} · {new Date(r.at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')}
                </span>
                <span className={`font-mono ${r.score / r.total >= 0.7 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>
                  {r.score}/{r.total}
                </span>
              </li>
            ))}
        </ul>
      </aside>
    </div>
  );
};

/* ---------- page ---------- */

export const PracticePage: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const [tab, setTab] = useState<Tab>('predict');
  const [subject, setSubject] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const { predictions, currentStreak, bestStreak } = useProgress();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const list = useMemo(() => PREDICTIONS.filter((p) => subject === 'all' || p.subject === subject), [subject]);
  const solved = Object.values(predictions).filter((x) => x.ok).length;

  if (openId) {
    const idx = PREDICTIONS.findIndex((p) => p.id === openId);
    const p = PREDICTIONS[idx];
    const next = PREDICTIONS[idx + 1];
    return <Challenge key={p.id} lang={lang} p={p} onBack={() => setOpenId(null)} onNext={next ? () => setOpenId(next.id) : undefined} onOpenTopic={onOpenTopic} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Практикум', 'Practice')}</h1>
          <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">{L('Проверь, понимаешь ли ты, а не просто помнишь. Сначала предскажи результат — потом опыт покажет правду.', 'Check that you understand, not just remember. Predict the result first, then the experiment shows the truth.')}</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-surface border border-line px-4 py-2">
            <div className="text-[11px] text-ink-2">{L('Угадано', 'Correct')}</div>
            <div className="font-mono text-lg text-ink">
              {solved}/{PREDICTIONS.length}
            </div>
          </div>
          <div className="rounded-xl bg-surface border border-line px-4 py-2">
            <div className="text-[11px] text-ink-2">{L('Серия / рекорд', 'Streak / best')}</div>
            <div className="font-mono text-lg text-ink">
              {currentStreak} / {bestStreak}
            </div>
          </div>
        </div>
      </header>

      <DailyCard lang={lang} onOpenTopic={onOpenTopic} />

      <div className="flex p-1 rounded-lg bg-muted border border-line self-start max-w-full overflow-x-auto">
        {(
          [
            ['predict', L('Предскажи, потом проверь', 'Predict, then check')],
            ['topics', L('По темам', 'By topic')],
            ['sections', L('Тесты по разделам', 'Section tests')],
            ['test', L('Тренировка', 'Practice test')],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`h-9 px-4 rounded-md text-sm whitespace-nowrap cursor-pointer ${tab === id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'topics' ? (
        <TopicsBrowser lang={lang} onOpenTopic={onOpenTopic} />
      ) : tab === 'sections' ? (
        <SectionTests lang={lang} onOpenTopic={onOpenTopic} />
      ) : tab === 'test' ? (
        <TestRunner lang={lang} onOpenTopic={onOpenTopic} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECTS).map(([id, s]) => (
              <button
                key={id}
                onClick={() => setSubject(id)}
                className={`h-9 px-3.5 rounded-full text-sm border cursor-pointer ${subject === id ? 'border-transparent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
                style={subject === id ? { background: '#16171A', color: '#fff' } : undefined}
              >
                {s[lang]}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((p) => {
              const r = predictions[p.id];
              return (
                <button key={p.id} onClick={() => setOpenId(p.id)} className="group text-left bg-surface border border-line rounded-xl p-5 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-3">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: SUBJECTS[p.subject].color }} />
                      {SUBJECTS[p.subject][lang]} · {p.grade} {L('кл.', 'gr.')}
                    </span>
                    {r ? (
                      <span className={`inline-flex items-center gap-1 text-xs ${r.ok ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>
                        {r.ok ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <X className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        {r.ok ? L('угадал', 'right') : L('мимо', 'missed')}
                      </span>
                    ) : (
                      <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
                    )}
                  </div>
                  <p className="font-serif text-lg leading-snug text-ink">{p.question[lang]}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-accent">
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                    {L('Предсказать', 'Predict')}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PracticePage;
