import React, { useEffect, useMemo, useState } from 'react';
import { TEXTBOOK_LESSONS } from '../data/textbookCurriculum';
import { SchoolGrade, StemCategory, TextbookLesson, VisualMode } from '../types/stem';
import { ArrowLeft, ArrowRight, Check, Search, X } from 'lucide-react';
import { Formula } from './Formula';
import { PhysicsLaboratoryEngine } from './PhysicsLaboratoryEngine';
import { MomentCircuit } from './MomentCircuit';
import { MomentChemicalBond } from './MomentChemicalBond';
import { MomentPendulum } from './MomentPendulum';
import { MomentTrigCircle } from './MomentTrigCircle';
import { MomentDerivative } from './MomentDerivative';
import { MomentPhotosynthesis } from './MomentPhotosynthesis';
import { MomentMendel } from './MomentMendel';
import { MomentPascalHydraulics } from './MomentPascalHydraulics';
import { MomentDopplerWave } from './MomentDopplerWave';
import { MomentElectrolysis } from './MomentElectrolysis';
import { MomentNeuronActionPotential } from './MomentNeuronActionPotential';
import { MomentPythagorasProof } from './MomentPythagorasProof';
import { MomentNormalDistribution } from './MomentNormalDistribution';
import { MomentDnaCell } from './MomentDnaCell';
import { MomentDiffusion } from './MomentDiffusion';
import { MomentStatesOfMatter } from './MomentStatesOfMatter';
import { MomentOptics } from './MomentOptics';
import { MomentLever } from './MomentLever';
import { MomentCollision } from './MomentCollision';
import { MomentInduction } from './MomentInduction';
import { MomentRelativity } from './MomentRelativity';

type Lang = 'ru' | 'en';

interface TextbookReaderProps {
  lang: Lang;
  onLaunchSimulation: (mode: VisualMode) => void;
  onAskMentor?: (topic: string, question: string) => void;
}

const SUBJECTS: { id: StemCategory; dot: string; label: { ru: string; en: string } }[] = [
  { id: 'physics', dot: 'bg-physics', label: { ru: 'Физика', en: 'Physics' } },
  { id: 'chemistry', dot: 'bg-chemistry', label: { ru: 'Химия', en: 'Chemistry' } },
  { id: 'biology', dot: 'bg-biology', label: { ru: 'Биология', en: 'Biology' } },
  { id: 'mathematics', dot: 'bg-math', label: { ru: 'Математика', en: 'Math' } },
];
const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map((s) => [s.id, s])) as Record<StemCategory, (typeof SUBJECTS)[number]>;

const GRADES: { id: SchoolGrade; label: string }[] = [
  { id: 'all', label: '' },
  { id: 'grade_5_6', label: '5–6' },
  { id: 'grade_7', label: '7' },
  { id: 'grade_8', label: '8' },
  { id: 'grade_9', label: '9' },
  { id: 'grade_10', label: '10' },
  { id: 'grade_11', label: '11' },
];

// Lessons whose model lives in a dedicated full-page 3D lab rather than an embeddable moment
const DEDICATED_LABS: VisualMode[] = ['orbitals', 'deconstruction', 'physics_gravity', 'math_revolution', 'math_divergence', 'biology_cell', 'break_model'];

const LABS_3D: { mode: VisualMode; subject: StemCategory; tex: string; title: { ru: string; en: string }; text: { ru: string; en: string } }[] = [
  { mode: 'orbitals', subject: 'chemistry', tex: '|\\psi_{n\\ell m}(r,\\theta,\\varphi)|^2', title: { ru: 'Атомные орбитали', en: 'Atomic orbitals' }, text: { ru: 'Форма электронного облака при разных n, ℓ, m', en: 'Electron cloud shapes for different n, ℓ, m' } },
  { mode: 'deconstruction', subject: 'chemistry', tex: '\\angle\\mathrm{HOH} = 104.5^\\circ', title: { ru: 'Разбор молекулы H₂O', en: 'Deconstructing H₂O' }, text: { ru: 'От атомов до гибридизации, шаг за шагом', en: 'From atoms to hybridization, step by step' } },
  { mode: 'physics_gravity', subject: 'physics', tex: 'F = G\\frac{m_1 m_2}{r^2}', title: { ru: 'Гравитация и Кулон', en: 'Gravity and Coulomb' }, text: { ru: 'Почему сила падает как 1/r²', en: 'Why force falls off as 1/r²' } },
  { mode: 'math_revolution', subject: 'mathematics', tex: 'V = \\pi\\int_a^b f(x)^2\\,dx', title: { ru: 'Интегралы 2D ↔ 3D', en: 'Integrals 2D ↔ 3D' }, text: { ru: 'Тело вращения из тонких дисков', en: 'A solid of revolution from thin discs' } },
  { mode: 'math_divergence', subject: 'mathematics', tex: '\\nabla\\cdot\\vec F', title: { ru: 'Дивергенция', en: 'Divergence' }, text: { ru: 'Источники и стоки векторного поля', en: 'Sources and sinks of a vector field' } },
  { mode: 'biology_cell', subject: 'biology', tex: '\\mathrm{ADP} + P_i \\to \\mathrm{ATP}', title: { ru: 'Клетка и АТФ', en: 'The cell and ATP' }, text: { ru: 'Как работает молекулярная турбина', en: 'How the molecular turbine works' } },
];

function matchesGrade(lesson: TextbookLesson, grade: SchoolGrade) {
  if (grade === 'all' || lesson.grade === grade) return true;
  if ((grade === 'grade_7' || grade === 'grade_8') && lesson.grade === 'grade_7_8') return true;
  if ((grade === 'grade_10' || grade === 'grade_11') && lesson.grade === 'grade_10_11') return true;
  return false;
}

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

export const TextbookReader: React.FC<TextbookReaderProps> = ({ lang, onLaunchSimulation, onAskMentor }) => {
  const [subject, setSubject] = useState<StemCategory | 'all'>('all');
  const [grade, setGrade] = useState<SchoolGrade>('all');
  const [query, setQuery] = useState('');
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [lastLessonId, setLastLessonId] = useState<string | null>(() => readStored('lastLesson', null));
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => readStored('completedLessons', {}));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEXTBOOK_LESSONS.filter((lesson) => {
      if (subject !== 'all' && lesson.category !== subject) return false;
      if (!matchesGrade(lesson, grade)) return false;
      if (!q) return true;
      return (
        lesson.title[lang].toLowerCase().includes(q) ||
        lesson.subtitle[lang].toLowerCase().includes(q) ||
        (lesson.chapter?.[lang].toLowerCase().includes(q) ?? false) ||
        lesson.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [subject, grade, query, lang]);

  const openLesson = (id: string) => {
    setOpenLessonId(id);
    setLastLessonId(id);
    writeStored('lastLesson', id);
    window.scrollTo(0, 0);
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeStored('completedLessons', next);
      return next;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const openIndex = openLessonId ? filtered.findIndex((l) => l.id === openLessonId) : -1;
  const openLessonData = openLessonId ? TEXTBOOK_LESSONS.find((l) => l.id === openLessonId) : undefined;

  if (openLessonData) {
    const list = openIndex >= 0 ? filtered : TEXTBOOK_LESSONS;
    const index = list.findIndex((l) => l.id === openLessonData.id);
    return (
      <LessonView
        lesson={openLessonData}
        lang={lang}
        prev={index > 0 ? list[index - 1] : undefined}
        next={index < list.length - 1 ? list[index + 1] : undefined}
        isCompleted={!!completed[openLessonData.id]}
        onToggleCompleted={() => toggleCompleted(openLessonData.id)}
        onBack={() => setOpenLessonId(null)}
        onOpen={openLesson}
        onLaunchSimulation={onLaunchSimulation}
        onAskMentor={onAskMentor}
      />
    );
  }

  const lastLesson = lastLessonId ? TEXTBOOK_LESSONS.find((l) => l.id === lastLessonId) : undefined;

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Header */}
      <section className="flex flex-col gap-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {lang === 'ru' ? 'Учебник · 5–11 классы' : 'Textbook · grades 5–11'}
        </div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em] text-ink">
          {lang === 'ru' ? 'Понимать, а не заучивать' : 'Understand, don’t memorize'}
        </h1>
        <p className="font-serif text-lg text-ink-2 leading-relaxed">
          {lang === 'ru'
            ? 'Каждая тема школьной программы: определение из учебника, живая модель и то, на что смотреть.'
            : 'Every curriculum topic: the textbook definition, a live model, and what to look for.'}
        </p>
      </section>

      {/* Continue */}
      {lastLesson && (
        <section className="bg-surface border border-line rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted font-medium text-ink-2">
                {lang === 'ru' ? 'Ты остановился здесь' : 'You stopped here'}
              </span>
              <SubjectTag subject={lastLesson.category} lang={lang} />
              <span className="text-ink-3">{lastLesson.gradeBadge[lang]}</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-ink">{lastLesson.title[lang]}</h2>
            {lastLesson.formula && (
              <div className="mt-2 inline-block max-w-full overflow-x-auto px-2.5 py-1 rounded-md bg-muted text-ink-2 text-sm">
                <Formula tex={lastLesson.formula} />
              </div>
            )}
          </div>
          <button
            onClick={() => openLesson(lastLesson.id)}
            className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Продолжить' : 'Continue'}
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </section>
      )}

      {/* Dedicated 3D labs */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl text-ink">{lang === 'ru' ? '3D-лаборатории' : '3D labs'}</h2>
          <span className="text-sm text-ink-3">{lang === 'ru' ? 'Большие модели для глубокого погружения' : 'Large models for a deep dive'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LABS_3D.map((lab) => (
            <button
              key={lab.mode}
              onClick={() => onLaunchSimulation(lab.mode)}
              className="group text-left bg-surface border border-line hover:border-line-strong rounded-xl overflow-hidden transition-colors cursor-pointer"
            >
              <div className="lab-stage relative h-28 flex items-center justify-center text-[#EDEDED] text-lg !rounded-none">
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

      {/* Filters */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-ink">{lang === 'ru' ? 'Все темы' : 'All topics'}</h2>
            <p className="mt-1 text-sm text-ink-2">
              <span className="font-mono">{filtered.length}</span> {lang === 'ru' ? 'тем' : 'topics'}
              <span className="mx-2 text-ink-3">·</span>
              {lang === 'ru' ? 'понято' : 'understood'} <span className="font-mono text-ink">{completedCount}</span>
            </p>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ru' ? 'Найти тему' : 'Find a topic'}
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

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="inline-flex self-start p-1 rounded-lg bg-muted border border-line overflow-x-auto max-w-full">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrade(g.id)}
                className={`shrink-0 h-8 px-3 rounded-md text-sm transition-colors cursor-pointer ${
                  grade === g.id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {g.id === 'all' ? (lang === 'ru' ? 'Все классы' : 'All grades') : g.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:ml-auto">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(subject === s.id ? 'all' : s.id)}
                className={`shrink-0 inline-flex items-center gap-2 h-8 px-3 rounded-full border text-sm transition-colors cursor-pointer ${
                  subject === s.id ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-2 hover:text-ink hover:border-line-strong'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                {s.label[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} lang={lang} completed={!!completed[lesson.id]} onOpen={() => openLesson(lesson.id)} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="font-serif text-xl text-ink">{lang === 'ru' ? 'Таких тем пока нет' : 'No topics match yet'}</p>
            <p className="mt-2 text-sm text-ink-2">{lang === 'ru' ? 'Попробуй другой класс или предмет.' : 'Try another grade or subject.'}</p>
          </div>
        )}
      </section>
    </div>
  );
};

const SubjectTag: React.FC<{ subject: StemCategory; lang: Lang }> = ({ subject, lang }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.04em] text-ink-2">
    <span className={`w-2 h-2 rounded-full ${SUBJECT_BY_ID[subject].dot}`} />
    {SUBJECT_BY_ID[subject].label[lang]}
  </span>
);

const LessonCard: React.FC<{ lesson: TextbookLesson; lang: Lang; completed: boolean; onOpen: () => void }> = ({ lesson, lang, completed, onOpen }) => (
  <button
    onClick={onOpen}
    className="group text-left bg-surface border border-line hover:border-line-strong rounded-xl p-4 flex flex-col transition-colors cursor-pointer"
  >
    <div className="h-24 rounded-lg bg-paper border border-line flex items-center justify-center px-3 overflow-hidden text-ink-2">
      {lesson.formula ? (
        <Formula tex={lesson.formula} className="text-[15px] whitespace-nowrap" />
      ) : (
        <span className="font-serif italic text-ink-3">{lesson.chapter?.[lang] ?? SUBJECT_BY_ID[lesson.category].label[lang]}</span>
      )}
    </div>
    <div className="mt-4 flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.04em] text-ink-2 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${SUBJECT_BY_ID[lesson.category].dot}`} />
        <span className="truncate">{SUBJECT_BY_ID[lesson.category].label[lang]} · {lesson.gradeBadge[lang]}</span>
      </span>
      {completed && (
        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-chemistry">
          <Check className="w-3.5 h-3.5" strokeWidth={2} />
          {lang === 'ru' ? 'Понято' : 'Got it'}
        </span>
      )}
    </div>
    <h3 className="mt-1.5 font-serif text-lg leading-snug text-ink">{lesson.title[lang]}</h3>
    <p className="mt-1 text-sm text-ink-2 leading-relaxed line-clamp-2">{lesson.subtitle[lang]}</p>
    <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm text-accent">
      {lang === 'ru' ? 'Открыть' : 'Open'}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
    </span>
  </button>
);

interface LessonViewProps {
  lesson: TextbookLesson;
  lang: Lang;
  prev?: TextbookLesson;
  next?: TextbookLesson;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onBack: () => void;
  onOpen: (id: string) => void;
  onLaunchSimulation: (mode: VisualMode) => void;
  onAskMentor?: (topic: string, question: string) => void;
}

const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  lang,
  prev,
  next,
  isCompleted,
  onToggleCompleted,
  onBack,
  onOpen,
  onLaunchSimulation,
  onAskMentor,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lesson.id]);

  const isDedicated = DEDICATED_LABS.includes(lesson.viewMode);

  return (
    <article className="flex flex-col gap-6 w-full">
      <nav className="flex items-center gap-2 text-sm text-ink-2 min-w-0">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer shrink-0">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {lang === 'ru' ? 'Учебник' : 'Textbook'}
        </button>
        <span className="text-ink-3">/</span>
        <span className="shrink-0">{SUBJECT_BY_ID[lesson.category].label[lang]}</span>
        {lesson.chapter && (
          <>
            <span className="text-ink-3">/</span>
            <span className="truncate">{lesson.chapter[lang]}</span>
          </>
        )}
      </nav>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <SubjectTag subject={lesson.category} lang={lang} />
            <span className="text-xs font-mono text-ink-3">{lesson.gradeBadge[lang]}</span>
          </div>
          <h1 className="mt-2 font-serif text-[30px] sm:text-[36px] leading-tight tracking-[-0.02em] text-ink">{lesson.title[lang]}</h1>
          <p className="mt-2 font-serif text-lg text-ink-2 leading-relaxed">{lesson.subtitle[lang]}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {onAskMentor && (
            <button
              onClick={() => onAskMentor(lesson.id, lesson.title[lang])}
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

      {/* Simulation */}
      {isDedicated ? (
        <div className="lab-stage relative rounded-xl overflow-hidden px-6 py-14 sm:py-20 flex flex-col items-center text-center gap-4">
          <div className="absolute inset-0 tech-grid opacity-60" />
          {lesson.formula && <Formula tex={lesson.formula} display className="relative text-[#EDEDED] text-lg" />}
          <p className="relative max-w-md text-sm text-[#A0A3AB]">
            {lang === 'ru' ? 'Эта тема разбирается в отдельной 3D-лаборатории.' : 'This topic lives in a dedicated 3D lab.'}
          </p>
          <button
            onClick={() => onLaunchSimulation(lesson.viewMode)}
            className="relative inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Открыть 3D-лабораторию' : 'Open the 3D lab'}
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="w-full">
          <LessonSimulation lesson={lesson} lang={lang} />
        </div>
      )}

      {/* Editorial notes */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Note label={lang === 'ru' ? 'В учебнике' : 'In the textbook'}>
          <p className="font-serif text-lg leading-relaxed text-ink">«{lesson.textbookDefinition[lang]}»</p>
          {lesson.formula && (
            <div className="mt-4 overflow-x-auto py-1 text-ink">
              <Formula tex={lesson.formula} display />
            </div>
          )}
        </Note>
        <Note label={lang === 'ru' ? 'Почему трудно представить' : 'Why it’s hard to picture'} dot="bg-physics">
          <p className="text-[15px] leading-relaxed text-ink-2">{lesson.studentConfusion[lang]}</p>
        </Note>
        <Note label={lang === 'ru' ? 'Представь на пальцах' : 'Picture it'} dot="bg-biology">
          <p className="text-[15px] leading-relaxed text-ink-2">{lesson.lifeAnalogy[lang]}</p>
        </Note>
        <Note label={lang === 'ru' ? 'На что смотреть в модели' : 'What to watch in the model'} dot="bg-accent">
          <p className="text-[15px] leading-relaxed text-ink-2">{lesson.momentObservation[lang]}</p>
        </Note>
      </div>

      {/* Prev / next */}
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

const Note: React.FC<{ label: string; dot?: string; children: React.ReactNode }> = ({ label, dot = 'bg-ink-3', children }) => (
  <section className="bg-surface border border-line rounded-xl p-5">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

const LessonSimulation: React.FC<{ lesson: TextbookLesson; lang: Lang }> = ({ lesson, lang }) => {
  switch (lesson.viewMode) {
    case 'moment_circuit': return <MomentCircuit lang={lang} />;
    case 'moment_chemical_bond': return <MomentChemicalBond lang={lang} />;
    case 'moment_photosynthesis': return <MomentPhotosynthesis lang={lang} />;
    case 'moment_mendel': return <MomentMendel lang={lang} />;
    case 'moment_pendulum': return <MomentPendulum lang={lang} />;
    case 'moment_trig_circle': return <MomentTrigCircle lang={lang} />;
    case 'moment_derivative': return <MomentDerivative lang={lang} />;
    case 'moment_pascal': return <MomentPascalHydraulics lang={lang} />;
    case 'moment_doppler': return <MomentDopplerWave lang={lang} />;
    case 'moment_electrolysis': return <MomentElectrolysis lang={lang} />;
    case 'moment_neuron': return <MomentNeuronActionPotential lang={lang} />;
    case 'moment_pythagoras': return <MomentPythagorasProof lang={lang} />;
    case 'moment_gauss': return <MomentNormalDistribution lang={lang} />;
    case 'moment_dna': return <MomentDnaCell lang={lang} />;
    case 'moment_diffusion': return <MomentDiffusion lang={lang} />;
    case 'moment_states': return <MomentStatesOfMatter lang={lang} />;
    case 'moment_optics': return <MomentOptics lang={lang} />;
    case 'moment_lever': return <MomentLever lang={lang} />;
    case 'moment_collision': return <MomentCollision lang={lang} />;
    case 'moment_induction': return <MomentInduction lang={lang} />;
    case 'moment_relativity': return <MomentRelativity lang={lang} />;
    default:
      return (
        <PhysicsLaboratoryEngine
          engineType={lesson.simEngineType || 'kinematics_velocity'}
          title={lesson.title[lang]}
          formula={lesson.formula}
          lang={lang}
        />
      );
  }
};
