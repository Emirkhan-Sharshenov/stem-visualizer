import React, { useEffect, useMemo, useState } from 'react';
import { StemCategory, VisualMode } from '../types/stem';
import { ArrowLeft, ArrowRight, Box, Check, Search, X } from 'lucide-react';
import { Formula } from './Formula';
import { SimView } from './SimView';
import { Quiz } from './practice/Quiz';
import { progress, useProgress } from '../lib/progress';
import { questionsForTopic } from '../lib/quiz';
import { gradesFor, sectionsFor, SimRef, SUBJECTS as SUBJECT_IDS, Topic, topicById, TOPICS } from '../data/curriculum';

type Lang = 'ru' | 'en';

interface TextbookReaderProps {
  lang: Lang;
  onLaunchSimulation: (mode: VisualMode) => void;
  onAskMentor?: (topic: string, question: string) => void;
  /** open this topic straight away (from the map, labs or practice) */
  initialTopicId?: string;
}

const SUBJECT_META: Record<StemCategory, { dot: string; label: { ru: string; en: string } }> = {
  physics: { dot: 'bg-physics', label: { ru: 'Физика', en: 'Physics' } },
  chemistry: { dot: 'bg-chemistry', label: { ru: 'Химия', en: 'Chemistry' } },
  biology: { dot: 'bg-biology', label: { ru: 'Биология', en: 'Biology' } },
  mathematics: { dot: 'bg-math', label: { ru: 'Математика', en: 'Math' } },
};

const LABS_3D: { mode: VisualMode; subject: StemCategory; tex: string; title: { ru: string; en: string }; text: { ru: string; en: string } }[] = [
  { mode: 'orbitals', subject: 'chemistry', tex: '|\\psi_{n\\ell m}(r,\\theta,\\varphi)|^2', title: { ru: 'Атомные орбитали', en: 'Atomic orbitals' }, text: { ru: 'Форма электронного облака при разных n, ℓ, m', en: 'Electron cloud shapes for different n, ℓ, m' } },
  { mode: 'deconstruction', subject: 'chemistry', tex: '\\angle\\mathrm{HOH} = 104.5^\\circ', title: { ru: 'Разбор молекулы H₂O', en: 'Deconstructing H₂O' }, text: { ru: 'От атомов до гибридизации, шаг за шагом', en: 'From atoms to hybridization, step by step' } },
  { mode: 'physics_gravity', subject: 'physics', tex: 'F = G\\frac{m_1 m_2}{r^2}', title: { ru: 'Гравитация и Кулон', en: 'Gravity and Coulomb' }, text: { ru: 'Почему сила падает как 1/r²', en: 'Why force falls off as 1/r²' } },
  { mode: 'biology_cell', subject: 'biology', tex: '\\mathrm{ADP} + P_i \\to \\mathrm{ATP}', title: { ru: 'Клетка и АТФ', en: 'The cell and ATP' }, text: { ru: 'Как работает молекулярная турбина', en: 'How the molecular turbine works' } },
];

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; progress lives only for this session
  }
}

const simKind = (sim?: SimRef) => (!sim ? null : 'lab' in sim || 'model' in sim || 'molecules' in sim || 'reactions' in sim || 'lattices' in sim ? '3d' : 'live');

export const TextbookReader: React.FC<TextbookReaderProps> = ({ lang, onLaunchSimulation, onAskMentor, initialTopicId }) => {
  const [subject, setSubject] = useState<StemCategory>(() => {
    const stored = readStored<StemCategory>('tbSubject', 'physics');
    return SUBJECT_IDS.includes(stored) ? stored : 'physics';
  });
  const [grade, setGrade] = useState<number>(() => readStored('tbGrade', 7));
  const [query, setQuery] = useState('');
  const [openTopicId, setOpenTopicId] = useState<string | null>(initialTopicId ?? null);
  const [lastTopicId, setLastTopicId] = useState<string | null>(() => readStored('lastTopic', null));
  const { completed } = useProgress();

  const grades = gradesFor(subject);
  const activeGrade = grades.includes(grade) ? grade : grades[0];
  const sections = sectionsFor(subject, activeGrade);

  useEffect(() => writeStored('tbSubject', subject), [subject]);
  useEffect(() => writeStored('tbGrade', activeGrade), [activeGrade]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return TOPICS.filter((t) => t.title[lang].toLowerCase().includes(q) || t.keywords.some((k) => k.includes(q))).slice(0, 60);
  }, [query, lang]);

  const openTopic = (id: string) => {
    setOpenTopicId(id);
    setLastTopicId(id);
    writeStored('lastTopic', id);
    window.scrollTo(0, 0);
  };

  const toggleCompleted = (id: string) => progress.setCompleted(id, !completed[id]);

  const openTopicData = openTopicId ? topicById(openTopicId) : undefined;
  if (openTopicData) {
    // Prev/next run through the whole grade course of that subject
    const course = sectionsFor(openTopicData.subject, openTopicData.grade).flatMap((s) => s.topics);
    const index = course.findIndex((t) => t.id === openTopicData.id);
    return (
      <TopicView
        topic={openTopicData}
        lang={lang}
        prev={index > 0 ? course[index - 1] : undefined}
        next={index < course.length - 1 ? course[index + 1] : undefined}
        isCompleted={!!completed[openTopicData.id]}
        onToggleCompleted={() => toggleCompleted(openTopicData.id)}
        onBack={() => setOpenTopicId(null)}
        onOpen={openTopic}
        onLaunchSimulation={onLaunchSimulation}
        onAskMentor={onAskMentor}
      />
    );
  }

  const lastTopic = lastTopicId ? topicById(lastTopicId) : undefined;
  const gradeTopics = sections.flatMap((s) => s.topics);
  const gradeDone = gradeTopics.filter((t) => completed[t.id]).length;

  return (
    <div className="flex flex-col gap-10 w-full">
      <section className="flex flex-col gap-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {lang === 'ru' ? `Учебник · ${TOPICS.length} тем` : `Textbook · ${TOPICS.length} topics`}
        </div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em] text-ink">
          {lang === 'ru' ? 'Понимать, а не заучивать' : 'Understand, don’t memorize'}
        </h1>
        <p className="font-serif text-lg text-ink-2 leading-relaxed">
          {lang === 'ru'
            ? 'Вся школьная программа по темам: объяснение каждой подтемы и живая модель там, где её стоит увидеть.'
            : 'The whole school course by topic: every sub-topic explained, with a live model wherever it helps to see it.'}
        </p>
      </section>

      {lastTopic && (
        <section className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
              <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{lang === 'ru' ? 'Ты остановился здесь' : 'You stopped here'}</span>
              <SubjectTag subject={lastTopic.subject} lang={lang} />
              <span className="text-ink-3">{lastTopic.grade} {lang === 'ru' ? 'класс' : 'grade'}</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-ink">{lastTopic.title[lang]}</h2>
          </div>
          <button
            onClick={() => openTopic(lastTopic.id)}
            className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Продолжить' : 'Continue'}
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </section>
      )}

      {/* Course navigation */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUBJECT_IDS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setQuery('');
                }}
                className={`shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-full border text-sm transition-colors cursor-pointer ${
                  subject === s && !results ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-2 hover:text-ink hover:border-line-strong'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${SUBJECT_META[s].dot}`} />
                {SUBJECT_META[s].label[lang]}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ru' ? 'Найти тему во всех классах' : 'Search topics in every grade'}
              className="w-full h-10 pl-9 pr-9 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-ink-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label={lang === 'ru' ? 'Очистить' : 'Clear'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {results ? (
          <div className="bg-surface border border-line rounded-xl divide-y divide-line">
            {results.length === 0 && <p className="p-6 text-sm text-ink-2">{lang === 'ru' ? 'Ничего не нашлось. Попробуй другое слово.' : 'Nothing found. Try another word.'}</p>}
            {results.map((t) => (
              <TopicRow key={t.id} topic={t} lang={lang} done={!!completed[t.id]} onOpen={() => openTopic(t.id)} showMeta />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-lg bg-muted border border-line overflow-x-auto max-w-full">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`shrink-0 h-8 px-3.5 rounded-md text-sm transition-colors cursor-pointer ${
                      activeGrade === g ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    {g} {lang === 'ru' ? 'класс' : 'grade'}
                  </button>
                ))}
              </div>
              <span className="text-sm text-ink-2">
                <span className="font-mono text-ink">{gradeTopics.length}</span> {lang === 'ru' ? 'тем' : 'topics'}
                <span className="mx-2 text-ink-3">·</span>
                {lang === 'ru' ? 'понято' : 'understood'} <span className="font-mono text-ink">{gradeDone}</span>
              </span>
            </div>

            <div className="flex flex-col gap-6">
              {sections.map((s, si) => (
                <div key={s.id} className="bg-surface border border-line rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-line flex items-baseline gap-3">
                    <span className="font-mono text-sm text-ink-3">{String(si + 1).padStart(2, '0')}</span>
                    <h2 className="font-serif text-xl text-ink">{s.title[lang]}</h2>
                    <span className="ml-auto text-xs text-ink-3">{s.topics.length} {lang === 'ru' ? 'тем' : 'topics'}</span>
                  </div>
                  <div className="divide-y divide-line">
                    {s.topics.map((t) => (
                      <TopicRow key={t.id} topic={t} lang={lang} done={!!completed[t.id]} onOpen={() => openTopic(t.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Dedicated 3D labs */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl text-ink">{lang === 'ru' ? '3D-лаборатории' : '3D labs'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LABS_3D.map((lab) => (
            <button
              key={lab.mode}
              onClick={() => onLaunchSimulation(lab.mode)}
              className="group text-left bg-surface border border-line hover:border-line-strong rounded-xl overflow-hidden transition-colors cursor-pointer"
            >
              <div className="lab-stage relative h-24 flex items-center justify-center text-[#EDEDED] text-lg !rounded-none">
                <div className="absolute inset-0 tech-grid opacity-60" />
                <Formula tex={lab.tex} className="relative" />
              </div>
              <div className="p-4">
                <SubjectTag subject={lab.subject} lang={lang} />
                <h3 className="mt-1.5 font-serif text-lg text-ink">{lab.title[lang]}</h3>
                <p className="mt-0.5 text-sm text-ink-2">{lab.text[lang]}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

const SubjectTag: React.FC<{ subject: StemCategory; lang: Lang }> = ({ subject, lang }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.04em] text-ink-2">
    <span className={`w-2 h-2 rounded-full ${SUBJECT_META[subject].dot}`} />
    {SUBJECT_META[subject].label[lang]}
  </span>
);

const TopicRow: React.FC<{ topic: Topic; lang: Lang; done: boolean; onOpen: () => void; showMeta?: boolean }> = ({ topic, lang, done, onOpen, showMeta }) => {
  const kind = simKind(topic.sim);
  return (
    <button onClick={onOpen} className="group w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted transition-colors cursor-pointer">
      <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${done ? 'bg-chemistry border-chemistry' : 'border-line-strong'}`}>
        {done && <Check className="w-3 h-3" color="#fff" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] text-ink truncate">{topic.title[lang]}</span>
        <span className="block text-xs text-ink-3 truncate">
          {showMeta && `${SUBJECT_META[topic.subject].label[lang]} · ${topic.grade} ${lang === 'ru' ? 'кл.' : 'gr.'} · `}
          {topic.points.map((p) => p.title[lang]).join(' · ')}
        </span>
      </span>
      {kind && (
        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${kind === '3d' ? 'bg-accent-soft text-accent' : 'bg-muted text-ink-2'}`}>
          {kind === '3d' && <Box className="w-3 h-3" strokeWidth={2} />}
          {kind === '3d' ? '3D' : lang === 'ru' ? 'модель' : 'model'}
        </span>
      )}
      <ArrowRight className="shrink-0 w-4 h-4 text-ink-3 group-hover:text-accent transition-colors" strokeWidth={1.75} />
    </button>
  );
};

interface TopicViewProps {
  topic: Topic;
  lang: Lang;
  prev?: Topic;
  next?: Topic;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onBack: () => void;
  onOpen: (id: string) => void;
  onLaunchSimulation: (mode: VisualMode) => void;
  onAskMentor?: (topic: string, question: string) => void;
}

const TopicView: React.FC<TopicViewProps> = ({ topic, lang, prev, next, isCompleted, onToggleCompleted, onBack, onOpen, onLaunchSimulation, onAskMentor }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [topic.id]);

  const sectionTitle = sectionsFor(topic.subject, topic.grade).find((s) => s.id === topic.sectionId)?.title;

  return (
    <article className="flex flex-col gap-6 w-full">
      <nav className="flex items-center gap-2 text-sm text-ink-2 min-w-0">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer shrink-0">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {lang === 'ru' ? 'Учебник' : 'Textbook'}
        </button>
        <span className="text-ink-3">/</span>
        <span className="shrink-0">{SUBJECT_META[topic.subject].label[lang]}, {topic.grade} {lang === 'ru' ? 'класс' : 'grade'}</span>
        {sectionTitle && (
          <>
            <span className="text-ink-3">/</span>
            <span className="truncate">{sectionTitle[lang]}</span>
          </>
        )}
      </nav>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-3xl">
          <SubjectTag subject={topic.subject} lang={lang} />
          <h1 className="mt-2 font-serif text-[30px] sm:text-[36px] leading-tight tracking-[-0.02em] text-ink">{topic.title[lang]}</h1>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {onAskMentor && (
            <button
              onClick={() => onAskMentor(topic.id, topic.title[lang])}
              className="h-10 px-4 rounded-lg bg-surface border border-line hover:bg-muted text-sm text-ink transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Спросить наставника' : 'Ask the mentor'}
            </button>
          )}
          <button
            onClick={onToggleCompleted}
            className={`h-10 px-4 rounded-lg border text-sm inline-flex items-center gap-2 transition-colors cursor-pointer ${
              isCompleted ? 'border-chemistry bg-[#E9F6EF] text-[#1E7A4C]' : 'bg-surface border-line hover:bg-muted text-ink'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {isCompleted ? (lang === 'ru' ? 'Понято' : 'Understood') : lang === 'ru' ? 'Я понял' : 'I get it'}
          </button>
        </div>
      </header>

      <p className="max-w-3xl font-serif text-xl leading-relaxed text-ink">{topic.intro[lang]}</p>

      {topic.formula && (
        <div className="self-start max-w-full overflow-x-auto px-5 py-3 rounded-xl bg-surface border border-line text-ink">
          <Formula tex={topic.formula} display />
        </div>
      )}

      {topic.sim && (
        <SimView sim={topic.sim} title={topic.title[lang]} formula={topic.formula} lang={lang} onLaunchSimulation={onLaunchSimulation} />
      )}

      <section>
        <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Разбираем по шагам' : 'Step by step'}</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          {topic.points.map((p, i) => (
            <div key={i} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-serif text-lg text-ink">{p.title[lang]}</h3>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.text[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <TopicQuiz key={topic.id} topic={topic} lang={lang} onOpen={onOpen} />

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        {prev ? (
          <button onClick={() => onOpen(prev.id)} className="text-left p-4 rounded-xl border border-line bg-surface hover:border-line-strong transition-colors cursor-pointer">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-3"><ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />{lang === 'ru' ? 'Предыдущая тема' : 'Previous topic'}</span>
            <span className="mt-1 block font-serif text-lg text-ink">{prev.title[lang]}</span>
          </button>
        ) : <span />}
        {next && (
          <button onClick={() => onOpen(next.id)} className="text-right p-4 rounded-xl border border-line bg-surface hover:border-line-strong transition-colors cursor-pointer">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">{lang === 'ru' ? 'Следующая тема' : 'Next topic'}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} /></span>
            <span className="mt-1 block font-serif text-lg text-ink">{next.title[lang]}</span>
          </button>
        )}
      </div>
    </article>
  );
};

/** "Check yourself": a short quiz built from the topic's own sub-topics; passing marks the topic as understood */
const TopicQuiz: React.FC<{ topic: Topic; lang: Lang; onOpen: (id: string) => void }> = ({ topic, lang, onOpen }) => {
  const [attempt, setAttempt] = useState<number | null>(null);
  const { quiz } = useProgress();
  const best = quiz[topic.id];
  if (topic.points.length < 2) return null;
  return (
    <section className="bg-surface border border-line rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink">{lang === 'ru' ? 'Проверь себя' : 'Check yourself'}</h2>
          <p className="text-sm text-ink-2">
            {best
              ? lang === 'ru'
                ? `Лучший результат: ${best.best} из ${best.total}`
                : `Best score: ${best.best} of ${best.total}`
              : lang === 'ru'
                ? `${questionsForTopic(topic, 10, 0).length} вопросов на закрепление. 75% верных — тема засчитана.`
                : `${questionsForTopic(topic, 10, 0).length} questions to lock it in. 75% correct passes the topic.`}
          </p>
        </div>
        {attempt === null && (
          <button onClick={() => setAttempt(0)} className="h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
            {best ? (lang === 'ru' ? 'Пройти ещё раз' : 'Retake') : lang === 'ru' ? 'Начать тест' : 'Start the quiz'}
          </button>
        )}
      </div>
      {attempt !== null && (
        <div className="mt-5">
          <Quiz
            key={attempt}
            lang={lang}
            questions={questionsForTopic(topic, 10, attempt)}
            onFinish={(score, total) => progress.recordQuiz(topic.id, score, total)}
            onRetry={() => setAttempt((a) => (a ?? 0) + 1)}
            onOpenTopic={(id) => id !== topic.id && onOpen(id)}
          />
        </div>
      )}
    </section>
  );
};
