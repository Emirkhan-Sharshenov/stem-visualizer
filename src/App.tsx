import React, { useState, useEffect } from 'react';
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
import { Sparkles, Brain, Compass, BookOpen, Layers, Award } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [currentMode, setCurrentMode] = useState<VisualMode>('textbook');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Global Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ru' ? 'en' : 'ru')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        unlockedMilestonesCount={unlockedMilestonesCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 flex flex-col gap-6">
        {/* Welcome & Philosophy Subheader */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-slate-800/80 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Brain className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? '«Я понимаю определение, но не могу представить, что это значит»' : '"I understand the definition, but cannot picture what it means"'}</span>
              </h1>
              <p className="text-xs text-slate-400">
                {lang === 'ru'
                  ? 'Интерактивная 3D лаборатория: визуализация + взаимодействие + проверка пространственного понимания'
                  : 'Interactive 3D laboratory: visualization + tactile manipulation + predictive mental modeling'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePredictionChallenge('pred-p-orbital')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Тест «Сначала представь»' : 'Predict First Mode'}</span>
            </button>
            <button
              onClick={() => setCurrentMode('break_model')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{lang === 'ru' ? 'Сломай модель' : 'Break the Model'}</span>
            </button>
          </div>
        </div>

        {/* Back to Textbook Navigation Bar when inside a simulation */}
        {currentMode !== 'textbook' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentMode('textbook')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30 transition-all cursor-pointer"
            >
              <span>←</span>
              <span>{lang === 'ru' ? 'Вернуться к STEM-учебнику (5–11 классы)' : 'Back to STEM Textbook (Grades 5-11)'}</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500">
              {lang === 'ru' ? 'Интерактивная лаборатория момента' : 'Real-time Moment Laboratory'}
            </span>
          </div>
        )}

        {/* View Routing */}
        <div className="flex-1 w-full">
          {currentMode === 'textbook' && (
            <TextbookReader
              lang={lang}
              onLaunchSimulation={(mode) => setCurrentMode(mode)}
              onAskMentor={(topic, question) => {
                setMentorContext({ topic, state: { question } });
                setIsMentorOpen(true);
              }}
            />
          )}

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

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>STEM Visualizer • {lang === 'ru' ? 'От абстракции к ментальной модели' : 'From Abstract Definition to Mental Model'}</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Physics • Chemistry • Biology • Mathematics</span>
            <span className="font-mono text-cyan-500">WebGL 60FPS</span>
          </div>
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
          onSelectConcept={handleSelectFromSearch}
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
