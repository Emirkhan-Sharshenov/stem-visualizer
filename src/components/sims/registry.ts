import type { SimDef } from './kit';
import { heatBalance, heatTransfer } from './engines/heat';
import { currentMedia, electrostatics, emWaves, magnetism, oscillations } from './engines/electro';
import { shadows, waveOptics } from './engines/light';
import { nuclear, nucleusStructure } from './engines/nuclear';
import { heatEngine, solarSystem, stars } from './engines/space';
import { blastFurnace, dissociation, kinetics, polymerization, separation, stoichiometry } from './engines/chem';
import { density, equilibrium, inertia, pressure, relativeMotion, weight, workPower } from './engines/mechanics';

/** All timeline-driven process simulations, by id */
export const SIMS = {
  heat_transfer: heatTransfer,
  heat_balance: heatBalance,
  pressure,
  work_power: workPower,
  equilibrium,
  weight,
  inertia,
  density,
  relative_motion: relativeMotion,
  electrostatics,
  current_media: currentMedia,
  magnetism,
  lc_ac: oscillations,
  em_waves: emWaves,
  shadows,
  wave_optics: waveOptics,
  nuclear,
  nucleus_structure: nucleusStructure,
  solar_system: solarSystem,
  stars,
  heat_engine: heatEngine,
  dissociation,
  kinetics,
  separation,
  polymerization,
  blast_furnace: blastFurnace,
  stoichiometry,
} satisfies Record<string, SimDef>;

export type SimId = keyof typeof SIMS;
