import React, { lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import type { VisualMode } from '../types/stem';
import type { SimRef } from '../data/curriculum';
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

// Heavy labs load on demand so the textbook opens fast
const SimById = lazy(() => import('./sims/SimById'));
const MoleculeLab = lazy(() => import('./chem/MoleculeLab').then((m) => ({ default: m.MoleculeLab })));
const ReactionLab = lazy(() => import('./chem/ReactionLab').then((m) => ({ default: m.ReactionLab })));
const LatticeLab = lazy(() => import('./chem/LatticeLab').then((m) => ({ default: m.LatticeLab })));
const PeriodicTable = lazy(() => import('./chem/PeriodicTable').then((m) => ({ default: m.PeriodicTable })));
const ModelLab = lazy(() => import('./lab/ModelLab').then((m) => ({ default: m.ModelLab })));

export interface SimViewProps {
  sim: SimRef;
  lang: Lang;
  /** used by the classic physics lab for its header */
  title?: string;
  formula?: string;
  onLaunchSimulation?: (mode: VisualMode) => void;
}

/** Renders any kind of simulation reference: 2D process, 3D model, molecules, reactions, lattices, table or a classic lab */
export const SimView: React.FC<SimViewProps> = (props) => (
  <Suspense fallback={<div className="lab-stage rounded-xl h-[380px] flex items-center justify-center text-sm text-[#8C8F98]">{props.lang === 'ru' ? 'Загружаем симуляцию…' : 'Loading the simulation…'}</div>}>
    <SimInner {...props} />
  </Suspense>
);

const SimInner: React.FC<SimViewProps> = ({ sim, title, formula, lang, onLaunchSimulation }) => {
  if ('lab' in sim) {
    return (
      <div className="lab-stage relative rounded-xl overflow-hidden px-6 py-14 flex flex-col items-center text-center gap-4">
        <div className="absolute inset-0 tech-grid opacity-60" />
        <p className="relative font-serif text-xl text-[#EDEDED]">{lang === 'ru' ? 'Эта тема разбирается в 3D-лаборатории' : 'This topic has a 3D lab'}</p>
        <button
          onClick={() => onLaunchSimulation?.(sim.lab)}
          className="relative inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {lang === 'ru' ? 'Открыть 3D-лабораторию' : 'Open the 3D lab'}
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  }
  if ('model' in sim) {
    return <ModelLab key={sim.model + (sim.focus ?? []).join()} lang={lang} model={sim.model} focus={sim.focus} compact />;
  }
  if ('molecules' in sim) return <MoleculeLab key={sim.molecules.join()} lang={lang} ids={sim.molecules} />;
  if ('table' in sim) return <PeriodicTable key={sim.table} lang={lang} mode={sim.table} />;
  if ('lattices' in sim) return <LatticeLab key={sim.lattices.join()} lang={lang} ids={sim.lattices} />;
  if ('reactions' in sim) return <ReactionLab key={sim.reactions.join()} lang={lang} ids={sim.reactions} />;
  if ('process' in sim) {
    return <SimById key={sim.process + (sim.mode ?? '')} lang={lang} id={sim.process} mode={sim.mode} />;
  }
  if ('engine' in sim) {
    return <PhysicsLaboratoryEngine engineType={sim.engine} title={title ?? ""} formula={formula} lang={lang} />;
  }
  switch (sim.moment) {
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
    default: return null;
  }
};
