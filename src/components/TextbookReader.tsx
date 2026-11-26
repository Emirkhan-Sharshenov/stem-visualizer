import { Button, Input } from '@heroui/react';
import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { StemCategory, VisualMode } from '../types/stem';
import { ArrowLeft, ArrowRight, Box, Check, Presentation, Search, Sparkles, X } from 'lucide-react';
import { Formula } from './Formula';
import { SimView } from './SimView';
import { Quiz } from './practice/Quiz';
import { progress, useProgress } from '../lib/progress';
import { questionsForTopic } from '../lib/quiz';
import { gradesFor, sectionsFor, SimRef, SUBJECTS as SUBJECT_IDS, Topic, topicById, TOPICS } from '../data/curriculum';
import { setMentorTopic } from '../lib/mentorTopic';
import { gradeName } from '../data/curriculum/index';

type Lang = 'ru' | 'en';

const PresentationModal = lazy(() => import('./presentation/PresentationModal'));

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
  astronomy: { dot: 'bg-astro', label: { ru: 'Астрономия', en: 'Astronomy' } },
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

const simKind = (sim?: SimRef) => (!sim ? null : 'lab' in sim || 'model' in sim || 'molecules' in sim || 'reactions' in sim || 'lattices' in sim || 'solid' in sim ? '3d' : 'live');

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
  // let the mentor know which topic is on screen
  useEffect(() => {
    setMentorTopic(openTopicData?.id ?? null);
    return () => setMentorTopic(null);
  }, [openTopicData?.id]);
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
      <section className="grid lg:grid-cols-[1.15fr_1fr] gap-5 items-stretch">
        <div className="flex flex-col justify-center gap-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-2">
            {lang === 'ru' ? `Учебник · ${TOPICS.length} тем` : `Textbook · ${TOPICS.length} topics`}
          </span>
          <h1 className="font-serif font-extrabold text-[34px] sm:text-[48px] leading-[1.04] tracking-[-0.04em] text-ink">
            {lang === 'ru' ? 'Вся школьная программа — с моделью, которую можно покрутить' : 'The whole school course, with a model you can play with'}
          </h1>
          <div className="relative mt-1">
            <Search className="w-5 h-5 text-ink-2 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" strokeWidth={2} />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ru' ? 'Найти тему во всех классах' : 'Search topics in every grade'}
              aria-label={lang === 'ru' ? 'Найти тему' : 'Search topics'}
              className="w-full h-14 pl-12 pr-11 text-base rounded-2xl shadow-[0_8px_24px_-16px_rgba(30,24,110,0.35)]"
            />
            {query && (
              <Button variant="ghost" isIconOnly size="sm" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8" onPress={() => setQuery('')} aria-label={lang === 'ru' ? 'Очистить' : 'Clear'}>
                <X className="w-4 h-4" strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>

        {lastTopic ? (
          <button onClick={() => openTopic(lastTopic.id)} className="group relative overflow-hidden text-left rounded-3xl bg-[#0E1024] text-[#F4F6FF] p-6 sm:p-7 flex flex-col gap-3 min-h-[220px] cursor-pointer transition-transform active:scale-[0.99]">
            <span className="self-start px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#C6CBE3]">{lang === 'ru' ? 'Ты остановился здесь' : 'You stopped here'}</span>
            <span className="relative font-serif font-bold text-[24px] sm:text-[28px] leading-[1.15] tracking-[-0.02em] max-w-[80%]">{lastTopic.title[lang]}</span>
            <span className="text-sm text-[#B4BBD9]">{SUBJECT_META[lastTopic.subject].label[lang]} · {gradeName(lastTopic.grade, lang)}</span>
            <span className="mt-auto self-start inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-[#0E1024] text-[15px] font-semibold">
              {lang === 'ru' ? 'Продолжить' : 'Continue'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
            </span>
            <svg viewBox="0 0 200 120" className="absolute -right-6 -bottom-6 w-56 opacity-70 pointer-events-none" aria-hidden="true">
              <path d="M10 110Q100 -30 190 110" fill="none" stroke="#8B7CFF" strokeWidth="4" />
              <circle cx="100" cy="40" r="8" fill="#FFFFFF" />
            </svg>
          </button>
        ) : (
          <div className="rounded-3xl bg-[#5B4BFF] text-white p-7 flex flex-col justify-end gap-2 min-h-[220px]">
            <span className="font-serif font-bold text-[26px] leading-tight tracking-[-0.02em]">{lang === 'ru' ? 'Начни с любой темы' : 'Start with any topic'}</span>
            <span className="text-[15px] text-[#E2DEFF]">{lang === 'ru' ? 'Выбери предмет и класс ниже — прогресс сохранится сам.' : 'Pick a subject and grade below; progress saves itself.'}</span>
          </div>
        )}
      </section>

      {/* Course navigation */}
      <section className="flex flex-col gap-5">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {SUBJECT_IDS.map((s) => {
            const on = subject === s && !results;
            return (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setQuery('');
                }}
                aria-pressed={on}
                className={`shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl text-[15px] font-semibold border transition-colors cursor-pointer ${on ? 'bg-ink text-paper border-ink' : 'bg-surface text-ink-2 border-line hover:text-ink hover:border-line-strong'}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${SUBJECT_META[s].dot}`} />
                {SUBJECT_META[s].label[lang]}
              </button>
            );
          })}
        </div>

        {results ? (
          <div className="bg-surface border border-line rounded-3xl overflow-hidden divide-y divide-line">
            {results.length === 0 && <p className="p-6 text-sm text-ink-2">{lang === 'ru' ? 'Ничего не нашлось. Попробуй другое слово.' : 'Nothing found. Try another word.'}</p>}
            {results.map((t) => (
              <TopicRow key={t.id} topic={t} lang={lang} done={!!completed[t.id]} onOpen={() => openTopic(t.id)} showMeta />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" aria-label={lang === 'ru' ? 'Класс' : 'Grade'} className="inline-flex p-1 rounded-2xl bg-surface border border-line overflow-x-auto max-w-full">
                {grades.map((g) => (
                  <button
                    key={g}
                    role="tab"
                    aria-selected={activeGrade === g}
                    onClick={() => setGrade(g)}
                    className={`shrink-0 h-10 px-3.5 rounded-xl text-[15px] transition-colors cursor-pointer ${activeGrade === g ? 'bg-accent text-[color:var(--sv-on-accent)] font-semibold' : 'text-ink-2 hover:text-ink'}`}
                  >
                    {gradeName(g, lang)}
                  </button>
                ))}
              </div>
              <span className="text-sm text-ink-2">
                {lang === 'ru' ? 'понято' : 'understood'} <strong className="text-ink">{gradeDone}</strong> {lang === 'ru' ? 'из' : 'of'} {gradeTopics.length} {lang === 'ru' ? 'тем' : 'topics'}
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {sections.map((s, si) => {
                const done = s.topics.filter((t) => completed[t.id]).length;
                return (
                  <div key={s.id} className="bg-surface border border-line rounded-3xl overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-accent-soft text-accent grid place-items-center font-mono text-sm font-semibold">{String(si + 1).padStart(2, '0')}</span>
                      <h2 className="font-serif font-bold text-[20px] tracking-[-0.02em] text-ink">{s.title[lang]}</h2>
                      <span className="ml-auto flex items-center gap-2.5 shrink-0">
                        <span className="hidden sm:block w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <span className="block h-full rounded-full bg-[#1FA35C]" style={{ width: `${(done / Math.max(1, s.topics.length)) * 100}%` }} />
                        </span>
                        <span className={`font-mono text-[13px] ${done ? 'text-[#1A8F50]' : 'text-ink-3'}`}>{done}/{s.topics.length}</span>
                      </span>
                    </div>
                    <div className="divide-y divide-line border-t border-line">
                      {s.topics.map((t) => (
                        <TopicRow key={t.id} topic={t} lang={lang} done={!!completed[t.id]} onOpen={() => openTopic(t.id)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Dedicated 3D labs */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif font-bold text-[28px] tracking-[-0.02em] text-ink">{lang === 'ru' ? '3D-лаборатории' : '3D labs'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 anim-stagger">
          {LABS_3D.map((lab) => (
            <button
              key={lab.mode}
              onClick={() => onLaunchSimulation(lab.mode)}
              className="group text-left bg-surface border border-line hover:border-line-strong rounded-3xl overflow-hidden transition-[border-color,transform] cursor-pointer active:scale-[0.98]"
            >
              <div className="lab-stage relative h-32 flex items-center justify-center text-[#EDEDED] text-lg !rounded-none">
                <div className="absolute inset-0 tech-grid opacity-60" />
                <Formula tex={lab.tex} className="relative transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <SubjectTag subject={lab.subject} lang={lang} />
                <h3 className="mt-1.5 font-serif font-bold text-lg tracking-[-0.01em] text-ink">{lab.title[lang]}</h3>
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
    <button onClick={onOpen} className="group w-full text-left px-5 sm:px-6 py-3.5 flex items-center gap-4 hover:bg-muted transition-colors cursor-pointer">
      <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${done ? 'bg-[#1FA35C] border-[#1FA35C]' : 'border-line-strong'}`}>
        {done && <Check className="w-3 h-3" color="#fff" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-ink truncate">{topic.title[lang]}</span>
        <span className="block text-xs text-ink-3 truncate">
          {showMeta && `${SUBJECT_META[topic.subject].label[lang]} · ${topic.grade} ${lang === 'ru' ? 'кл.' : 'gr.'} · `}
          {topic.points.map((p) => p.title[lang]).join(' · ')}
        </span>
      </span>
      {kind && (
        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${kind === '3d' ? 'bg-accent-soft text-accent' : 'bg-muted text-ink-2'}`}>
          {kind === '3d' && <Box className="w-3 h-3" strokeWidth={2} />}
          {kind === '3d' ? '3D' : lang === 'ru' ? 'модель' : 'model'}
        </span>
      )}
      <ArrowRight className="shrink-0 w-4 h-4 text-ink-3 transition-[color,transform] group-hover:text-accent group-hover:translate-x-0.5" strokeWidth={2} />
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

  const section = sectionsFor(topic.subject, topic.grade).find((s) => s.id === topic.sectionId);
  const { completed } = useProgress();
  const chapterDone = section ? section.topics.filter((t) => completed[t.id]).length : 0;
  const formulaRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      <nav className="flex items-center gap-2 text-sm text-ink-2 min-w-0" aria-label={lang === 'ru' ? 'Путь' : 'Breadcrumb'}>
        <Button variant="ghost" className="shrink-0 font-semibold" onPress={() => onBack()}>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          {lang === 'ru' ? 'Учебник' : 'Textbook'}
        </Button>
        <span className="text-ink-3">/</span>
        <span className="shrink-0">{SUBJECT_META[topic.subject].label[lang]}, {gradeName(topic.grade, lang)}</span>
        {section && (
          <>
            <span className="text-ink-3">/</span>
            <span className="truncate">{section.title[lang]}</span>
          </>
        )}
      </nav>

      <div className="flex flex-wrap items-start gap-8">
        {/* the chapter */}
        {section && (
          <aside className="hidden xl:flex flex-col gap-3 w-[250px] shrink-0 sticky top-20" aria-label={lang === 'ru' ? 'Глава' : 'Chapter'}>
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-ink-2">{section.title[lang]}</span>
            <span className="h-1.5 rounded-full bg-line overflow-hidden">
              <span className="block h-full rounded-full bg-[#1FA35C] transition-[width] duration-500" style={{ width: `${(chapterDone / Math.max(1, section.topics.length)) * 100}%` }} />
            </span>
            <span className="text-[13px] text-ink-2">
              {lang === 'ru' ? `Понято ${chapterDone} из ${section.topics.length}` : `Understood ${chapterDone} of ${section.topics.length}`}
            </span>
            <ol className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto soft-scroll">
              {section.topics.map((t) => {
                const here = t.id === topic.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => onOpen(t.id)}
                      aria-current={here ? 'page' : undefined}
                      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${here ? 'bg-surface border border-line text-ink font-semibold' : 'text-ink-2 hover:bg-muted hover:text-ink'}`}
                    >
                      {completed[t.id] ? (
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#1A8F50]" strokeWidth={2.6} />
                      ) : (
                        <span className={`w-4 h-4 mt-0.5 shrink-0 rounded-full border-2 ${here ? 'border-accent' : 'border-line-strong'}`} />
                      )}
                      <span className="leading-snug">{t.title[lang]}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>
        )}

        {/* the lesson */}
        <article className="flex-[999_1_560px] min-w-0 flex flex-col gap-7">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-line text-ink">
                <span className={`w-2 h-2 rounded-full ${SUBJECT_META[topic.subject].dot}`} />
                {SUBJECT_META[topic.subject].label[lang]} · {gradeName(topic.grade, lang)}
              </span>
              {topic.sim && (
                <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent">{simKind(topic.sim) === '3d' ? (lang === 'ru' ? '3D-модель' : '3D model') : lang === 'ru' ? 'Живая модель' : 'Live model'}</span>
              )}
              {isCompleted && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1FA35C]/15 text-[#1A8F50]"><Check className="w-3.5 h-3.5" strokeWidth={2.6} />{lang === 'ru' ? 'Понято' : 'Understood'}</span>}
            </div>
            <h1 className="font-serif font-extrabold text-[32px] sm:text-[44px] leading-[1.06] tracking-[-0.035em] text-ink">{topic.title[lang]}</h1>
            <p className="text-[19px] sm:text-xl leading-relaxed text-ink-2 max-w-3xl">{topic.intro[lang]}</p>
          </header>

          {topic.sim && (
            <div ref={modelRef}>
              <SimView sim={topic.sim} title={topic.title[lang]} formula={topic.formula} lang={lang} onLaunchSimulation={onLaunchSimulation} />
            </div>
          )}

          {slides && (
            <Suspense fallback={null}>
              <PresentationModal topic={topic} lang={lang} formulaEl={formulaRef.current} modelEl={modelRef.current} onClose={() => setSlides(false)} />
            </Suspense>
          )}

          <section className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-[26px] tracking-[-0.02em] text-ink">{lang === 'ru' ? 'Разбираем по шагам' : 'Step by step'}</h2>
            <ol className="flex flex-col gap-5 anim-stagger">
              {topic.points.map((p, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-accent-soft text-accent grid place-items-center font-bold">{i + 1}</span>
                  <div className="min-w-0 flex flex-col gap-1.5 pt-1">
                    <h3 className="font-serif font-bold text-[19px] tracking-[-0.01em] text-ink">{p.title[lang]}</h3>
                    <p className="text-[17px] leading-relaxed text-ink-2">{p.text[lang]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {topic.formula && (
            <section aria-label={lang === 'ru' ? 'Главная формула' : 'Key formula'} className="rounded-3xl border-2 border-accent bg-surface p-6 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-accent">{lang === 'ru' ? 'Главная формула' : 'Key formula'}</span>
              <div ref={formulaRef} className="max-w-full overflow-x-auto text-ink text-xl">
                <Formula tex={topic.formula} display />
              </div>
            </section>
          )}

          <TopicQuiz key={topic.id} topic={topic} lang={lang} onOpen={onOpen} />

          <nav className="grid sm:grid-cols-2 gap-3" aria-label={lang === 'ru' ? 'Соседние темы' : 'Nearby topics'}>
            {prev ? (
              <button onClick={() => onOpen(prev.id)} className="group text-left p-5 rounded-2xl border border-line bg-surface hover:border-line-strong transition-colors cursor-pointer">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3"><ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />{lang === 'ru' ? 'Предыдущая тема' : 'Previous topic'}</span>
                <span className="mt-1 block font-semibold text-ink">{prev.title[lang]}</span>
              </button>
            ) : <span />}
            {next && (
              <button onClick={() => onOpen(next.id)} className="group text-right p-5 rounded-2xl border border-line bg-surface hover:border-line-strong transition-colors cursor-pointer">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">{lang === 'ru' ? 'Следующая тема' : 'Next topic'}<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} /></span>
                <span className="mt-1 block font-semibold text-ink">{next.title[lang]}</span>
              </button>
            )}
          </nav>
        </article>

        {/* actions */}
        <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-3 lg:sticky lg:top-20" aria-label={lang === 'ru' ? 'Действия' : 'Actions'}>
          <button
            onClick={() => onToggleCompleted()}
            aria-pressed={isCompleted}
            className={`h-13 py-3.5 rounded-2xl text-base font-semibold inline-flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-[0.97] cursor-pointer ${isCompleted ? 'bg-[#1FA35C]/15 text-[#1A8F50]' : 'bg-[#1FA35C] text-white hover:brightness-105'}`}
          >
            <Check className="w-5 h-5" strokeWidth={2.6} />
            {isCompleted ? (lang === 'ru' ? 'Понято' : 'Understood') : lang === 'ru' ? 'Я понял' : 'I get it'}
          </button>
          <button onClick={() => setSlides(true)} className="h-12 rounded-2xl border border-line bg-surface text-[15px] font-semibold text-ink inline-flex items-center justify-center gap-2 hover:border-line-strong transition-[border-color,transform] active:scale-[0.97] cursor-pointer">
            <Presentation className="w-4 h-4" strokeWidth={2} />
            {lang === 'ru' ? 'Презентация' : 'Slides'}
          </button>
          {onAskMentor && (
            <div className="mt-1 rounded-3xl border border-line bg-surface p-5 flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 font-semibold text-ink">
                <span className="w-7 h-7 rounded-lg bg-accent grid place-items-center text-[color:var(--sv-on-accent)]"><Sparkles className="w-4 h-4" strokeWidth={2} /></span>
                {lang === 'ru' ? 'Наставник' : 'Mentor'}
              </span>
              <span className="text-sm leading-relaxed text-ink-2">
                {lang === 'ru' ? 'Спроси про эту тему — наставник видит, что сейчас на экране.' : 'Ask about this topic: the mentor sees what is on screen.'}
              </span>
              <Button className="font-semibold" onPress={() => onAskMentor(topic.id, topic.title[lang])}>
                {lang === 'ru' ? 'Спросить' : 'Ask'}
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

/** "Check yourself": a short quiz built from the topic's own sub-topics; passing marks the topic as understood */
const TopicQuiz: React.FC<{ topic: Topic; lang: Lang; onOpen: (id: string) => void }> = ({ topic, lang, onOpen }) => {
  const [attempt, setAttempt] = useState<number | null>(null);
  const { quiz } = useProgress();
  const best = quiz[topic.id];
  if (topic.points.length < 2) return null;
  if (attempt === null) {
    return (
      <section className="rounded-3xl bg-[#0E1024] text-[#F4F6FF] p-6 sm:p-7 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-serif font-bold text-[24px] tracking-[-0.02em]">{lang === 'ru' ? 'Проверь себя' : 'Check yourself'}</h2>
          <p className="text-[15px] text-[#B4BBD9]">
            {best
              ? lang === 'ru'
                ? `Лучший результат: ${best.best} из ${best.total}`
                : `Best score: ${best.best} of ${best.total}`
              : lang === 'ru'
                ? `${questionsForTopic(topic, 10, 0).length} вопросов на закрепление. 75% верных — тема засчитана.`
                : `${questionsForTopic(topic, 10, 0).length} questions to lock it in. 75% correct passes the topic.`}
          </p>
        </div>
        <button onClick={() => setAttempt(0)} className="h-12 px-6 rounded-xl bg-[#5B4BFF] hover:bg-[#4A3BEB] text-white font-semibold transition-[background-color,transform] active:scale-[0.97] cursor-pointer">
          {best ? (lang === 'ru' ? 'Пройти ещё раз' : 'Retake') : lang === 'ru' ? 'Начать тест' : 'Start the quiz'}
        </button>
      </section>
    );
  }
  return (
    <section className="bg-surface border border-line rounded-3xl p-5 sm:p-6">
      <h2 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{lang === 'ru' ? 'Проверь себя' : 'Check yourself'}</h2>
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
    </section>
  );
};
