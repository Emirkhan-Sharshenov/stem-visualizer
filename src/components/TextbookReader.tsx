import React, { useState } from 'react';
import { TEXTBOOK_LESSONS } from '../data/textbookCurriculum';
import { SchoolGrade, StemCategory, VisualMode } from '../types/stem';
import { BookOpen, ArrowRight, Lightbulb, Search, Atom, Dna, Compass, Sparkles, CheckCircle2, Check, HelpCircle, Award, MessageSquare, Maximize2 } from 'lucide-react';
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

interface TextbookReaderProps {
  lang: 'ru' | 'en';
  onLaunchSimulation: (mode: VisualMode) => void;
  onAskMentor?: (topic: string, question: string) => void;
}

export const TextbookReader: React.FC<TextbookReaderProps> = ({ lang, onLaunchSimulation, onAskMentor }) => {
  const [selectedCategory, setSelectedCategory] = useState<StemCategory | 'all'>('physics');
  const [selectedGrade, setSelectedGrade] = useState<SchoolGrade>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(TEXTBOOK_LESSONS[0].id);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // Subject tabs
  const subjectTabs: { id: StemCategory | 'all'; label: { en: string; ru: string }; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: { en: 'All Subjects (5–11)', ru: '📚 Все предметы (5–11)' }, icon: <BookOpen className="w-4 h-4" />, color: 'text-indigo-400' },
    { id: 'physics', label: { en: 'Physics (7–11)', ru: '⚛️ Физика (7–11 кл)' }, icon: <Atom className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'chemistry', label: { en: 'Chemistry (8–11)', ru: '🧪 Химия (8–11 кл)' }, icon: <Sparkles className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'biology', label: { en: 'Biology (6–11)', ru: '🧬 Биология (6–11 кл)' }, icon: <Dna className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'mathematics', label: { en: 'Mathematics (5–11)', ru: '📐 Математика (5–11 кл)' }, icon: <Compass className="w-4 h-4" />, color: 'text-purple-400' },
  ];

  // Specific Grade filter options
  const gradeFilters: { id: SchoolGrade; label: { en: string; ru: string } }[] = [
    { id: 'all', label: { en: 'All Grades', ru: '📚 Все классы' } },
    { id: 'grade_7', label: { en: 'Grade 7', ru: '7 Класс' } },
    { id: 'grade_8', label: { en: 'Grade 8', ru: '8 Класс' } },
    { id: 'grade_9', label: { en: 'Grade 9', ru: '9 Класс' } },
    { id: 'grade_10', label: { en: 'Grade 10', ru: '10 Класс' } },
    { id: 'grade_11', label: { en: 'Grade 11', ru: '11 Класс' } },
    { id: 'grade_5_6', label: { en: 'Grades 5–6', ru: '5–6 Класс' } },
  ];

  // Filtering
  const filteredLessons = TEXTBOOK_LESSONS.filter((lesson) => {
    if (selectedCategory !== 'all' && lesson.category !== selectedCategory) return false;
    if (selectedGrade !== 'all') {
      if (lesson.grade !== selectedGrade) {
        if (selectedGrade === 'grade_7' && lesson.grade === 'grade_7_8') return true;
        if (selectedGrade === 'grade_8' && lesson.grade === 'grade_7_8') return true;
        if (selectedGrade === 'grade_10' && lesson.grade === 'grade_10_11') return true;
        if (selectedGrade === 'grade_11' && lesson.grade === 'grade_10_11') return true;
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lesson.title[lang].toLowerCase().includes(q);
      const matchSubtitle = lesson.subtitle[lang].toLowerCase().includes(q);
      const matchChapter = lesson.chapter ? lesson.chapter[lang].toLowerCase().includes(q) : false;
      const matchKeyword = lesson.keywords.some((k) => k.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchChapter && !matchKeyword) return false;
    }
    return true;
  });

  const activeLesson = TEXTBOOK_LESSONS.find((l) => l.id === selectedLessonId) || filteredLessons[0] || TEXTBOOK_LESSONS[0];

  const toggleLessonComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedLessons).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Top Controls: Subject Tabs & Grade Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Школьный STEM-учебник по физике и естественным наукам (5–11 классы)' : 'School STEM Curriculum by Subject (Grades 5-11)'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold">
                  {filteredLessons.length} {lang === 'ru' ? 'тем' : 'topics'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru'
                  ? 'Каждая тема школьной программы: от сухого параграфа — к интерактивной симуляции момента с подписями!'
                  : 'Every single curriculum topic: from textbook definition to interactive real-time simulation with clear labels!'}
              </p>
            </div>
          </div>

          {/* Quick search input & Progress */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ru' ? 'Освоено:' : 'Mastered:'}</span>
              <span className="font-mono font-bold text-emerald-400">{completedCount} / {TEXTBOOK_LESSONS.length}</span>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск любой темы 7-11 кл...' : 'Search any topic 7-11...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Primary Subject Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {subjectTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold scale-105'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label[lang]}</span>
            </button>
          ))}
        </div>

        {/* Specific Grade Buttons (7, 8, 9, 10, 11) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono uppercase text-slate-500 font-bold mr-1">
            {lang === 'ru' ? 'Класс обучения:' : 'Class Grade:'}
          </span>
          {gradeFilters.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedGrade === g.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {g.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Reader & Inspector */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Lesson Directory List */}
        <div className="w-full lg:w-88 flex flex-col gap-2 max-h-[820px] overflow-y-auto pr-1">
          {filteredLessons.map((item) => {
            const isCompleted = !!completedLessons[item.id];
            return (
              <div
                key={item.id}
                onClick={() => setSelectedLessonId(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                  activeLesson.id === item.id
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg text-white'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                      {item.gradeBadge[lang]}
                    </span>
                    {item.chapter && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 truncate max-w-[110px]">
                        {item.chapter[lang]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                      {item.category === 'physics' ? '⚛️' : item.category === 'chemistry' ? '🧪' : item.category === 'biology' ? '🧬' : '📐'}
                    </span>
                    <button
                      onClick={(e) => toggleLessonComplete(item.id, e)}
                      title={isCompleted ? (lang === 'ru' ? 'Пройдено' : 'Completed') : (lang === 'ru' ? 'Отметить как пройденное' : 'Mark as done')}
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'border-slate-700 hover:border-slate-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{item.title[lang]}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.subtitle[lang]}</p>
              </div>
            );
          })}

          {filteredLessons.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              {lang === 'ru' ? 'Нет тем по выбранным фильтрам' : 'No topics found for current filters'}
            </div>
          )}
        </div>

        {/* Right Column: Full Lesson View & Embedded Live Simulation */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
          {/* Active Lesson Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800">
                  {activeLesson.gradeBadge[lang]}
                </span>
                {activeLesson.chapter && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 font-mono border border-slate-800">
                    {activeLesson.chapter[lang]}
                  </span>
                )}
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                  {activeLesson.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{activeLesson.title[lang]}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeLesson.subtitle[lang]}</p>
            </div>

            {/* Launch Simulation Button & Ask Mentor */}
            <div className="flex items-center gap-2">
              {onAskMentor && (
                <button
                  onClick={() => onAskMentor(activeLesson.id, activeLesson.title[lang])}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'ru' ? 'Спросить ментора' : 'Ask Mentor'}</span>
                </button>
              )}
              <button
                onClick={() => onLaunchSimulation(activeLesson.viewMode)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>{lang === 'ru' ? 'РАЗВЕРНУТЬ НА ПОЛНЫЙ ЭКРАН' : 'LAUNCH FULLSCREEN LAB'}</span>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* EMBEDDED LIVE SIMULATION VIEWER DIRECTLY IN LESSON */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/60 shadow-2xl">
            {activeLesson.viewMode === 'moment_circuit' ? (
              <MomentCircuit lang={lang} />
            ) : activeLesson.viewMode === 'moment_chemical_bond' ? (
              <MomentChemicalBond lang={lang} />
            ) : activeLesson.viewMode === 'moment_photosynthesis' ? (
              <MomentPhotosynthesis lang={lang} />
            ) : activeLesson.viewMode === 'moment_mendel' ? (
              <MomentMendel lang={lang} />
            ) : activeLesson.viewMode === 'moment_pendulum' ? (
              <MomentPendulum lang={lang} />
            ) : activeLesson.viewMode === 'moment_trig_circle' ? (
              <MomentTrigCircle lang={lang} />
            ) : activeLesson.viewMode === 'moment_derivative' ? (
              <MomentDerivative lang={lang} />
            ) : activeLesson.viewMode === 'moment_pascal' ? (
              <MomentPascalHydraulics lang={lang} />
            ) : activeLesson.viewMode === 'moment_doppler' ? (
              <MomentDopplerWave lang={lang} />
            ) : activeLesson.viewMode === 'moment_electrolysis' ? (
              <MomentElectrolysis lang={lang} />
            ) : activeLesson.viewMode === 'moment_neuron' ? (
              <MomentNeuronActionPotential lang={lang} />
            ) : activeLesson.viewMode === 'moment_pythagoras' ? (
              <MomentPythagorasProof lang={lang} />
            ) : activeLesson.viewMode === 'moment_gauss' ? (
              <MomentNormalDistribution lang={lang} />
            ) : activeLesson.viewMode === 'moment_dna' ? (
              <MomentDnaCell lang={lang} />
            ) : activeLesson.viewMode === 'moment_diffusion' ? (
              <MomentDiffusion lang={lang} />
            ) : activeLesson.viewMode === 'moment_states' ? (
              <MomentStatesOfMatter lang={lang} />
            ) : activeLesson.viewMode === 'moment_optics' ? (
              <MomentOptics lang={lang} />
            ) : activeLesson.viewMode === 'moment_lever' ? (
              <MomentLever lang={lang} />
            ) : activeLesson.viewMode === 'moment_collision' ? (
              <MomentCollision lang={lang} />
            ) : activeLesson.viewMode === 'moment_induction' ? (
              <MomentInduction lang={lang} />
            ) : activeLesson.viewMode === 'moment_relativity' ? (
              <MomentRelativity lang={lang} />
            ) : (
              <PhysicsLaboratoryEngine
                engineType={activeLesson.simEngineType || 'kinematics_velocity'}
                title={activeLesson.title[lang]}
                formula={activeLesson.formula}
                lang={lang}
              />
            )}
          </div>

          {/* Lesson Content Sections */}
          <div className="flex flex-col gap-4">
            {/* 1. Formal Textbook Definition */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <span>📖</span> {lang === 'ru' ? 'ЧТО ПИШУТ В ШКОЛЬНОМ УЧЕБНИКЕ (ОПРЕДЕЛЕНИЕ):' : 'STANDARD TEXTBOOK DEFINITION:'}
              </span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                «{activeLesson.textbookDefinition[lang]}»
              </p>
            </div>

            {/* 2. Student Confusion */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-rose-400 flex items-center gap-1.5">
                <span>🤯</span> {lang === 'ru' ? 'В ЧЕМ ЗАТЫК ШКОЛЬНИКА (ПОЧЕМУ ТРУДНО ПРЕДСТАВИТЬ):' : 'WHY STUDENTS GET CONFUSED:'}
              </span>
              <p className="text-xs text-rose-200 leading-relaxed">
                {activeLesson.studentConfusion[lang]}
              </p>
            </div>

            {/* 3. Intuitive Life Analogy */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                {lang === 'ru' ? 'ПРЕДСТАВЬ НА ПАЛЬЦАХ (ЖИВАЯ АНАЛОГИЯ):' : 'INTUITIVE REAL-LIFE ANALOGY:'}
              </span>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                {activeLesson.lifeAnalogy[lang]}
              </p>
            </div>

            {/* 4. Moment Observation */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                <span>⏱️</span> {lang === 'ru' ? 'ЧТО ПРОИСХОДИТ В ТОЧНЫЙ МОМЕНТ СИМУЛЯЦИИ:' : 'WHAT TO WATCH IN THE SIMULATION MOMENT:'}
              </span>
              <p className="text-xs text-cyan-100 leading-relaxed">
                {activeLesson.momentObservation[lang]}
              </p>
            </div>

            {/* Formula snippet */}
            {activeLesson.formula && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-sans block mb-1">
                  {lang === 'ru' ? 'ФОРМУЛА / ЗАКОН:' : 'MATHEMATICAL / CHEMICAL LAW:'}
                </span>
                <code>{activeLesson.formula}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
