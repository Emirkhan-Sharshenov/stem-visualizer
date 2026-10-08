import React, { lazy, Suspense, useState, useEffect } from 'react';
import { VisualMode, Milestone } from './types/stem';
import { INITIAL_MILESTONES } from './data/concepts';
import { Navbar } from './components/Navbar';
import { TextbookReader } from './components/TextbookReader';
import { MomentDiffusion } from './components/MomentDiffusion';
import { MomentLever } from './components/MomentLever';
import { MomentStatesOfMatter } from './components/MomentStatesOfMatter';
import { MomentOptics } from './components/MomentOptics';
import { MomentCollision } from './components/MomentCollision';
import { MomentInduction } from './components/MomentInduction';
import { MomentRelativity } from './components/MomentRelativity';
import { MomentDnaCell } from './components/MomentDnaCell';
import { MomentCircuit } from './components/MomentCircuit';
import { MomentChemicalBond } from './components/MomentChemicalBond';
import { MomentPendulum } from './components/MomentPendulum';
import { MomentTrigCircle } from './components/MomentTrigCircle';
import { MomentDerivative } from './components/MomentDerivative';
import { MomentPhotosynthesis } from './components/MomentPhotosynthesis';
import { MomentMendel } from './components/MomentMendel';
import { MomentPascalHydraulics } from './components/MomentPascalHydraulics';
import { MomentDopplerWave } from './components/MomentDopplerWave';
import { MomentElectrolysis } from './components/MomentElectrolysis';
import { MomentNeuronActionPotential } from './components/MomentNeuronActionPotential';
import { MomentPythagorasProof } from './components/MomentPythagorasProof';
import { MomentNormalDistribution } from './components/MomentNormalDistribution';
import { PhysicsLaboratoryEngine } from './components/PhysicsLaboratoryEngine';
import { OrbitalsExplorer } from './components/OrbitalsExplorer';
import { DeconstructionExplorer } from './components/DeconstructionExplorer';
import { GravityCoulombExplorer } from './components/GravityCoulombExplorer';
import { Math2D3DExplorer } from './components/Math2D3DExplorer';
import { BiologyDeepZoom } from './components/BiologyDeepZoom';
import { BreakTheModel } from './components/BreakTheModel';
import { KnowledgeMap } from './components/KnowledgeMap';
import { PredictFirstModal } from './components/PredictFirstModal';
import { VisualMentor } from './components/VisualMentor';
import { MilestonesModal } from './components/MilestonesModal';
import { SearchModal } from './components/SearchModal';
import { progress } from './lib/progress';

// New sections load on demand
const LabsPage = lazy(() => import('./components/labs/LabsPage'));
const PracticePage = lazy(() => import('./components/practice/PracticePage'));
const CourseMap = lazy(() => import('./components/map/CourseMap'));
const ProgressPage = lazy(() => import('./components/progress/ProgressPage'));
const ProPage = lazy(() => import('./components/pro/ProPage'));
const TeacherPage = lazy(() => import('./components/teacher/TeacherPage'));
const MechanicsSandbox = lazy(() => import('./components/sandbox/MechanicsSandbox'));
const CircuitLab = lazy(() => import('./components/circuit/CircuitLab'));
const OpticsLab = lazy(() => import('./components/optics/OpticsLab'));
const ChemLab = lazy(() => import('./components/chemlab/ChemLab'));
const GeneticsLab = lazy(() => import('./components/genetics/GeneticsLab'));
const HeatLab = lazy(() => import('./components/heat/HeatLab'));
const EcoLab = lazy(() => import('./components/eco/EcoLab'));
const MoleculeBuilder = lazy(() => import('./components/molbuilder/MoleculeBuilder'));
const Space3D = lazy(() => import('./components/space3d/Space3D'));
const PageFallback = () => <div className="h-[60vh] rounded-xl bg-muted animate-pulse" />;

const SUBJECT_DOT: Record<string, string> = {
  physics: 'bg-physics',
  chemistry: 'bg-chemistry',
  biology: 'bg-biology',
  mathematics: 'bg-math',
};

type Crumb = { subject: keyof typeof SUBJECT_DOT; title: { ru: string; en: string } };

const LAB_CRUMBS: Partial<Record<VisualMode, Crumb>> = {
  orbitals: { subject: 'chemistry', title: { ru: 'Атомные орбитали', en: 'Atomic orbitals' } },
  deconstruction: { subject: 'chemistry', title: { ru: 'Разбор молекулы H₂O', en: 'Deconstructing H₂O' } },
  physics_gravity: { subject: 'physics', title: { ru: 'Гравитация и закон Кулона', en: 'Gravity and Coulomb’s law' } },
  math_revolution: { subject: 'mathematics', title: { ru: 'Интегралы 2D ↔ 3D', en: 'Integrals 2D ↔ 3D' } },
  math_divergence: { subject: 'mathematics', title: { ru: 'Дивергенция векторного поля', en: 'Divergence of a vector field' } },
  biology_cell: { subject: 'biology', title: { ru: 'Клетка и синтез АТФ', en: 'The cell and ATP synthesis' } },
  break_model: { subject: 'physics', title: { ru: 'Сломай модель', en: 'Break the model' } },
  knowledge_map: { subject: 'mathematics', title: { ru: 'Карта понятий', en: 'Knowledge map' } },
  moment_diffusion: { subject: 'physics', title: { ru: 'Диффузия', en: 'Diffusion' } },
  moment_lever: { subject: 'physics', title: { ru: 'Рычаг', en: 'Lever' } },
  moment_states: { subject: 'physics', title: { ru: 'Агрегатные состояния', en: 'States of matter' } },
  moment_optics: { subject: 'physics', title: { ru: 'Оптика', en: 'Optics' } },
  moment_collision: { subject: 'physics', title: { ru: 'Удар Ньютона', en: 'Newton’s collisions' } },
  moment_induction: { subject: 'physics', title: { ru: 'Индукция Фарадея', en: 'Faraday induction' } },
  moment_relativity: { subject: 'physics', title: { ru: 'Время Эйнштейна', en: 'Einstein’s time' } },
  moment_dna: { subject: 'biology', title: { ru: 'ДНК и клетка', en: 'DNA and the cell' } },
  moment_circuit: { subject: 'physics', title: { ru: 'Электрическая цепь', en: 'Electric circuit' } },
  moment_chemical_bond: { subject: 'chemistry', title: { ru: 'Химическая связь', en: 'Chemical bonds' } },
  moment_pendulum: { subject: 'physics', title: { ru: 'Маятник', en: 'Pendulum' } },
  moment_trig_circle: { subject: 'mathematics', title: { ru: 'Тригонометрический круг', en: 'Unit circle' } },
  moment_derivative: { subject: 'mathematics', title: { ru: 'Производная', en: 'Derivative' } },
  moment_photosynthesis: { subject: 'biology', title: { ru: 'Фотосинтез', en: 'Photosynthesis' } },
  moment_mendel: { subject: 'biology', title: { ru: 'Законы Менделя', en: 'Mendel’s laws' } },
  moment_pascal: { subject: 'physics', title: { ru: 'Гидравлика Паскаля', en: 'Pascal’s hydraulics' } },
  moment_doppler: { subject: 'physics', title: { ru: 'Эффект Доплера', en: 'Doppler effect' } },
  moment_electrolysis: { subject: 'chemistry', title: { ru: 'Электролиз', en: 'Electrolysis' } },
  moment_neuron: { subject: 'biology', title: { ru: 'Потенциал действия нейрона', en: 'Neuron action potential' } },
  moment_pythagoras: { subject: 'mathematics', title: { ru: 'Теорема Пифагора', en: 'Pythagorean theorem' } },
  moment_gauss: { subject: 'mathematics', title: { ru: 'Нормальное распределение', en: 'Normal distribution' } },
  moment_universal: { subject: 'physics', title: { ru: 'Физическая лаборатория', en: 'Physics lab' } },
};

interface AppProps {
  lang: 'ru' | 'en';
  setLang: (lang: 'ru' | 'en') => void;
}

export default function App({ lang, setLang }: AppProps) {
  // deep links like #/app?lab=chemlab open a section directly (handy for social posts)
  const LINKABLE: VisualMode[] = ['textbook', 'labs', 'practice', 'course_map', 'progress', 'pro', 'sandbox', 'circuits', 'optics', 'heat', 'chemlab', 'molbuilder', 'genetics', 'ecosystem', 'space3d', 'classes', 'teacher'];
  const [currentMode, setCurrentMode] = useState<VisualMode>(() => {
    const lab = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('lab') as VisualMode | null;
    return lab && LINKABLE.includes(lab) ? lab : 'textbook';
  });
  // keep the address in sync so the current section can be shared
  useEffect(() => {
    if (!LINKABLE.includes(currentMode)) return;
    const next = currentMode === 'textbook' ? '#/app' : `#/app?lab=${currentMode}`;
    if (window.location.hash !== next) history.replaceState(null, '', next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode]);
  const [textbookKey, setTextbookKey] = useState(0);
  const [pendingTopic, setPendingTopic] = useState<string | undefined>(undefined);

  useEffect(() => progress.touch(), []);

  // "Pro" buttons anywhere (mentor limit, locked blocks) open the plans page
  useEffect(() => {
    const open = () => {
      setCurrentMode('pro');
      window.scrollTo(0, 0);
    };
    window.addEventListener('open-pro', open);
    return () => window.removeEventListener('open-pro', open);
  }, []);

  // welcome note after confirming the e-mail or signing in with Google
  const [welcome, setWelcome] = useState(false);
  useEffect(() => {
    const check = () => {
      if (sessionStorage.getItem('authNotice') === '"welcome"') {
        sessionStorage.removeItem('authNotice');
        setWelcome(true);
        setTimeout(() => setWelcome(false), 6000);
      }
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  /** jump to a topic from labs, practice, the map or progress */
  const openTopic = (id: string) => {
    setPendingTopic(id);
    setTextbookKey((k) => k + 1);
    setCurrentMode('textbook');
    window.scrollTo(0, 0);
  };
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState<boolean>(false);
  const [isMentorOpen, setIsMentorOpen] = useState<boolean>(false);
  const [activePredictionChallenge, setActivePredictionChallenge] = useState<string | null>(null);

  // Active mentor context
  const [mentorContext, setMentorContext] = useState<{ topic: string; state: any }>({
    topic: 'orbitals',
    state: {}
  });

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMilestonesOpen(false);
        setIsMentorOpen(false);
        setActivePredictionChallenge(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUnlockMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unlocked: true } : m))
    );
  };

  const handleSelectConceptForMentor = (topic: string, state: any) => {
    setMentorContext({ topic, state });
  };

  const handleSelectFromSearch = (mode: VisualMode) => {
    setCurrentMode(mode);
  };

  const unlockedMilestonesCount = milestones.filter((m) => m.unlocked).length;

  const crumb = currentMode !== 'textbook' ? LAB_CRUMBS[currentMode] : undefined;

  return (
    <div className="lab-light page-light min-h-screen flex flex-col font-sans pb-14 lg:pb-0">
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          if (mode === 'textbook') {
            setPendingTopic(undefined);
            setTextbookKey((k) => k + 1);
          }
          setCurrentMode(mode);
          window.scrollTo(0, 0);
        }}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {crumb && (
          <nav className="flex items-center gap-2 text-sm text-ink-2 min-w-0">
            <button onClick={() => { setTextbookKey((k) => k + 1); setCurrentMode('textbook'); }} className="hover:text-ink cursor-pointer shrink-0">
              {lang === 'ru' ? 'Учебник' : 'Textbook'}
            </button>
            <span className="text-ink-3">/</span>
            <span className={`w-2 h-2 rounded-full shrink-0 ${SUBJECT_DOT[crumb.subject]}`} />
            <span className="text-ink truncate">{crumb.title[lang]}</span>
          </nav>
        )}

        {/* View Routing */}
        <div className="flex-1 w-full">
          {currentMode === 'textbook' && (
            <TextbookReader
              key={textbookKey}
              lang={lang}
              initialTopicId={pendingTopic}
              onLaunchSimulation={(mode) => setCurrentMode(mode)}
              onAskMentor={(topic, question) => {
                setMentorContext({ topic, state: { question } });
                setIsMentorOpen(true);
              }}
            />
          )}

          <Suspense fallback={<PageFallback />}>
            {currentMode === 'labs' && <LabsPage lang={lang} onOpenTopic={openTopic} onLaunchSimulation={(mode) => setCurrentMode(mode)} />}
            {currentMode === 'practice' && <PracticePage lang={lang} onOpenTopic={openTopic} />}
            {currentMode === 'course_map' && <CourseMap lang={lang} onOpenTopic={openTopic} />}
            {currentMode === 'progress' && <ProgressPage lang={lang} onOpenTopic={openTopic} />}
            {currentMode === 'sandbox' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Физика · конструктор опытов' : 'Physics · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Механика: собери свой опыт' : 'Mechanics: build your own experiment'}</h1>
                </div>
                <MechanicsSandbox lang={lang} />
              </div>
            )}
            {currentMode === 'circuits' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Физика · конструктор опытов' : 'Physics · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Электрические цепи: собери свою схему' : 'Circuits: build your own'}</h1>
                </div>
                <CircuitLab lang={lang} />
              </div>
            )}
            {currentMode === 'optics' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Физика · конструктор опытов' : 'Physics · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Оптика: лучи, линзы и зеркала' : 'Optics: rays, lenses and mirrors'}</h1>
                </div>
                <OpticsLab lang={lang} />
              </div>
            )}
            {currentMode === 'chemlab' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Химия · конструктор опытов' : 'Chemistry · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Химическая лаборатория' : 'Chemistry lab'}</h1>
                </div>
                <ChemLab lang={lang} />
              </div>
            )}
            {currentMode === 'genetics' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Биология · конструктор опытов' : 'Biology · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Генетика: скрещивания' : 'Genetics: crosses'}</h1>
                </div>
                <GeneticsLab lang={lang} />
              </div>
            )}
            {currentMode === 'heat' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Физика · конструктор опытов' : 'Physics · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Тепловые процессы' : 'Heat processes'}</h1>
                </div>
                <HeatLab lang={lang} />
              </div>
            )}
            {currentMode === 'ecosystem' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Биология · конструктор опытов' : 'Biology · experiment builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Экосистема: хищники и жертвы' : 'Ecosystem: predators and prey'}</h1>
                </div>
                <EcoLab lang={lang} />
              </div>
            )}
            {currentMode === 'molbuilder' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Химия · 3D-конструктор' : 'Chemistry · 3D builder'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Конструктор молекул в 3D' : '3D molecule builder'}</h1>
                </div>
                <MoleculeBuilder lang={lang} />
              </div>
            )}
            {currentMode === 'space3d' && (
              <div className="flex flex-col gap-5">
                <button onClick={() => setCurrentMode('labs')} className="self-start text-sm text-ink-2 hover:text-ink cursor-pointer">
                  ← {lang === 'ru' ? 'Все лаборатории' : 'All labs'}
                </button>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Физика · 3D-песочница' : 'Physics · 3D sandbox'}</span>
                  <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{lang === 'ru' ? 'Космос: гравитация в 3D' : 'Space: gravity in 3D'}</h1>
                </div>
                <Space3D lang={lang} />
              </div>
            )}
            {currentMode === 'pro' && <ProPage lang={lang} onNavigate={(m) => setCurrentMode(m)} />}
            {(currentMode === 'teacher' || currentMode === 'classes') && (
              <TeacherPage key={currentMode} lang={lang} onOpenTopic={openTopic} initialTab={currentMode === 'teacher' ? 'teacher' : 'student'} />
            )}
          </Suspense>

          {currentMode === 'moment_diffusion' && (
            <MomentDiffusion
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
            />
          )}

          {currentMode === 'moment_lever' && (
            <MomentLever lang={lang} />
          )}

          {currentMode === 'moment_states' && (
            <MomentStatesOfMatter lang={lang} />
          )}

          {currentMode === 'moment_optics' && (
            <MomentOptics lang={lang} />
          )}

          {currentMode === 'moment_collision' && (
            <MomentCollision lang={lang} />
          )}

          {currentMode === 'moment_induction' && (
            <MomentInduction lang={lang} />
          )}

          {currentMode === 'moment_relativity' && (
            <MomentRelativity lang={lang} />
          )}

          {currentMode === 'moment_dna' && (
            <MomentDnaCell lang={lang} />
          )}

          {currentMode === 'moment_circuit' && (
            <MomentCircuit lang={lang} />
          )}

          {currentMode === 'moment_chemical_bond' && (
            <MomentChemicalBond lang={lang} />
          )}

          {currentMode === 'moment_pendulum' && (
            <MomentPendulum lang={lang} />
          )}

          {currentMode === 'moment_trig_circle' && (
            <MomentTrigCircle lang={lang} />
          )}

          {currentMode === 'moment_derivative' && (
            <MomentDerivative lang={lang} />
          )}

          {currentMode === 'moment_photosynthesis' && (
            <MomentPhotosynthesis lang={lang} />
          )}

          {currentMode === 'moment_mendel' && (
            <MomentMendel lang={lang} />
          )}

          {currentMode === 'moment_pascal' && (
            <MomentPascalHydraulics lang={lang} />
          )}

          {currentMode === 'moment_doppler' && (
            <MomentDopplerWave lang={lang} />
          )}

          {currentMode === 'moment_electrolysis' && (
            <MomentElectrolysis lang={lang} />
          )}

          {currentMode === 'moment_neuron' && (
            <MomentNeuronActionPotential lang={lang} />
          )}

          {currentMode === 'moment_pythagoras' && (
            <MomentPythagorasProof lang={lang} />
          )}

          {currentMode === 'moment_gauss' && (
            <MomentNormalDistribution lang={lang} />
          )}

          {currentMode === 'moment_universal' && (
            <PhysicsLaboratoryEngine
              engineType="kinematics_velocity"
              title={lang === 'ru' ? 'Физическая лаборатория момента (7–11 классы)' : 'Physics Moment Laboratory (Grades 7-11)'}
              formula="F = ma, \quad p = \rho g h, \quad E = mc^2"
              lang={lang}
            />
          )}

          {currentMode === 'orbitals' && (
            <OrbitalsExplorer
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
              onOpenPrediction={(id) => setActivePredictionChallenge(id)}
              onSelectConceptForMentor={handleSelectConceptForMentor}
            />
          )}

          {currentMode === 'deconstruction' && (
            <DeconstructionExplorer
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
              onSelectConceptForMentor={handleSelectConceptForMentor}
            />
          )}

          {currentMode === 'physics_gravity' && (
            <GravityCoulombExplorer
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
              onSelectConceptForMentor={handleSelectConceptForMentor}
            />
          )}

          {(currentMode === 'math_revolution' || currentMode === 'math_divergence') && (
            <Math2D3DExplorer
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
              onSelectConceptForMentor={handleSelectConceptForMentor}
            />
          )}

          {currentMode === 'biology_cell' && (
            <BiologyDeepZoom
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
              onSelectConceptForMentor={handleSelectConceptForMentor}
            />
          )}

          {currentMode === 'break_model' && (
            <BreakTheModel
              lang={lang}
              onUnlockMilestone={handleUnlockMilestone}
            />
          )}

          {currentMode === 'knowledge_map' && (
            <KnowledgeMap
              lang={lang}
              onNavigateToConcept={setCurrentMode}
            />
          )}
        </div>
      </main>

      <footer className="w-full border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-ink-3">
          <span>STEM Visualizer — {lang === 'ru' ? 'научно-образовательная лаборатория' : 'a science education lab'}</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="/privacy" className="hover:text-ink">{lang === 'ru' ? 'Конфиденциальность' : 'Privacy'}</a>
            <a href="/terms" className="hover:text-ink">{lang === 'ru' ? 'Условия' : 'Terms'}</a>
            <a href="#/credits" className="hover:text-ink">{lang === 'ru' ? 'О проекте и источники' : 'About and sources'}</a>
          </span>
        </div>
      </footer>

      {/* Predict First Modal */}
      {activePredictionChallenge && (
        <PredictFirstModal
          challengeId={activePredictionChallenge}
          lang={lang}
          onClose={() => setActivePredictionChallenge(null)}
          onApplyRevealedParams={() => setCurrentMode('orbitals')}
          onUnlockMilestone={handleUnlockMilestone}
        />
      )}

      {welcome && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-[#16171A] shadow-2xl text-sm" style={{ color: '#fff' }}>
          {lang === 'ru' ? '👋 Добро пожаловать! Почта подтверждена, прогресс теперь сохраняется в аккаунте.' : '👋 Welcome! Your email is confirmed and progress now saves to your account.'}
        </div>
      )}

      {/* Discoveries / Milestones Modal */}
      {isMilestonesOpen && (
        <MilestonesModal
          milestones={milestones}
          lang={lang}
          onClose={() => setIsMilestonesOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          lang={lang}
          onClose={() => setIsSearchOpen(false)}
          onOpenTopic={openTopic}
        />
      )}

      {/* AI Visual Mentor Drawer */}
      <VisualMentor
        lang={lang}
        currentTopic={mentorContext.topic}
        currentState={mentorContext.state}
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
      />
    </div>
  );
}
