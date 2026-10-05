import type { StemCategory } from '../../types/stem';
import { SimRef, Topic, TOPICS } from '../../data/curriculum';
import { SIMS, SimId } from '../sims/registry';
import { MOLECULE_DATA } from '../../lib/chem/moleculeData';
import { REACTIONS } from '../../lib/chem/reactions';
import { MODELS } from '../../lib/three/models';

type T2 = { ru: string; en: string };

export type LabKind = 'process' | 'model' | 'molecule' | 'reaction' | 'lattice' | 'table' | 'classic';

export interface LabItem {
  key: string;
  kind: LabKind;
  subject: StemCategory;
  title: T2;
  subtitle?: T2;
  sim: SimRef;
  topics: Topic[];
  is3d: boolean;
  /** extra searchable text */
  formula?: string;
}

const LATTICE_NAMES: Record<string, T2> = {
  nacl: { ru: 'Ионная решётка NaCl', en: 'Ionic lattice NaCl' },
  diamond: { ru: 'Алмаз — атомная решётка', en: 'Diamond: covalent network' },
  graphite: { ru: 'Графит — слоистая решётка', en: 'Graphite: layered lattice' },
  metal: { ru: 'Металлическая решётка', en: 'Metallic lattice' },
  molecular: { ru: 'Молекулярная решётка CO₂', en: 'Molecular lattice CO₂' },
};

const CLASSIC: Record<string, T2> = {
  moment_diffusion: { ru: 'Диффузия', en: 'Diffusion' },
  moment_lever: { ru: 'Рычаг', en: 'Lever' },
  moment_states: { ru: 'Агрегатные состояния', en: 'States of matter' },
  moment_optics: { ru: 'Линзы и лучи', en: 'Lenses and rays' },
  moment_collision: { ru: 'Удары и импульс', en: 'Collisions and momentum' },
  moment_induction: { ru: 'Электромагнитная индукция', en: 'Electromagnetic induction' },
  moment_relativity: { ru: 'Замедление времени', en: 'Time dilation' },
  moment_dna: { ru: 'ДНК и репликация', en: 'DNA and replication' },
  moment_circuit: { ru: 'Электрическая цепь', en: 'Electric circuit' },
  moment_chemical_bond: { ru: 'Химическая связь', en: 'Chemical bonds' },
  moment_pendulum: { ru: 'Маятник', en: 'Pendulum' },
  moment_photosynthesis: { ru: 'Фотосинтез', en: 'Photosynthesis' },
  moment_mendel: { ru: 'Законы Менделя', en: 'Mendel’s laws' },
  moment_pascal: { ru: 'Гидравлический пресс', en: 'Hydraulic press' },
  moment_doppler: { ru: 'Эффект Доплера', en: 'Doppler effect' },
  moment_electrolysis: { ru: 'Электролиз', en: 'Electrolysis' },
  moment_neuron: { ru: 'Нервный импульс', en: 'Nerve impulse' },
  kinematics_velocity: { ru: 'Кинематика: скорость и ускорение', en: 'Kinematics: velocity and acceleration' },
  hooke_spring: { ru: 'Закон Гука', en: 'Hooke’s law' },
  archimedes_buoyancy: { ru: 'Закон Архимеда', en: 'Archimedes’ principle' },
  lenses_ray_tracing: { ru: 'Построение в линзах', en: 'Ray tracing in lenses' },
  mkt_ideal_gas_laws: { ru: 'Газовые законы', en: 'Gas laws' },
  thermodynamics_first_law: { ru: 'Первый закон термодинамики', en: 'First law of thermodynamics' },
  photoelectric_effect: { ru: 'Фотоэффект', en: 'Photoelectric effect' },
  friction_dynamometer: { ru: 'Сила трения', en: 'Friction' },
  rutherford_alpha_atom: { ru: 'Опыт Резерфорда', en: 'Rutherford’s experiment' },
  biology_cell: { ru: 'Клетка изнутри (3D)', en: 'Inside the cell (3D)' },
  orbitals: { ru: 'Атомные орбитали (3D)', en: 'Atomic orbitals (3D)' },
};

const majority = (topics: Topic[]): StemCategory => {
  const c: Record<string, number> = {};
  topics.forEach((t) => (c[t.subject] = (c[t.subject] ?? 0) + 1));
  return (Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'physics') as StemCategory;
};

/** Every distinct simulation used anywhere in the textbook, with the topics that use it */
export function buildCatalog(): LabItem[] {
  const map = new Map<string, Omit<LabItem, 'subject'> & { topics: Topic[] }>();
  const add = (key: string, make: () => Omit<LabItem, 'subject' | 'topics'>, topic: Topic) => {
    const ex = map.get(key);
    if (ex) ex.topics.push(topic);
    else map.set(key, { ...make(), topics: [topic] });
  };
  TOPICS.forEach((t) => {
    const s = t.sim;
    if (!s || t.subject === 'mathematics') return;
    if ('process' in s) {
      const def = SIMS[s.process as SimId];
      const mode = s.mode ?? def.modes?.[0]?.id;
      const m = def.modes?.find((x) => x.id === mode);
      add(`p:${s.process}:${mode ?? ''}`, () => ({ key: `p:${s.process}:${mode ?? ''}`, kind: 'process', title: m && (def.modes?.length ?? 0) > 1 ? m.label : def.title, subtitle: m && (def.modes?.length ?? 0) > 1 ? def.title : undefined, sim: { process: s.process, mode }, is3d: false }), t);
    } else if ('model' in s) {
      add(`m:${s.model}`, () => ({ key: `m:${s.model}`, kind: 'model', title: MODELS[s.model].title, subtitle: { ru: '3D-модель', en: '3D model' }, sim: { model: s.model }, is3d: true }), t);
    } else if ('molecules' in s) {
      s.molecules.forEach((id) => {
        const d = MOLECULE_DATA[id];
        add(`mol:${id}`, () => ({ key: `mol:${id}`, kind: 'molecule', title: d.name, subtitle: { ru: '3D-молекула', en: '3D molecule' }, sim: { molecules: [id] }, is3d: true, formula: d.formula }), t);
      });
    } else if ('reactions' in s) {
      s.reactions.forEach((id) => {
        const r = REACTIONS.find((x) => x.id === id)!;
        add(`rx:${id}`, () => ({ key: `rx:${id}`, kind: 'reaction', title: r.name, subtitle: { ru: '3D-реакция', en: '3D reaction' }, sim: { reactions: [id] }, is3d: true, formula: r.equation }), t);
      });
    } else if ('lattices' in s) {
      s.lattices.forEach((id) => add(`lat:${id}`, () => ({ key: `lat:${id}`, kind: 'lattice', title: LATTICE_NAMES[id], subtitle: { ru: 'Кристаллическая решётка, 3D', en: 'Crystal lattice, 3D' }, sim: { lattices: [id] }, is3d: true }), t));
    } else if ('table' in s) {
      add('table', () => ({ key: 'table', kind: 'table', title: { ru: 'Таблица Менделеева', en: 'Periodic table' }, subtitle: { ru: 'Интерактивная', en: 'Interactive' }, sim: { table: 'category' }, is3d: false }), t);
    } else {
      const id = 'moment' in s ? s.moment : 'engine' in s ? s.engine : s.lab;
      const title = CLASSIC[id] ?? { ru: t.title.ru, en: t.title.en };
      add(`c:${id}`, () => ({ key: `c:${id}`, kind: 'classic', title, sim: s, is3d: 'lab' in s }), t);
    }
  });
  const chem: LabKind[] = ['molecule', 'reaction', 'lattice', 'table'];
  return [...map.values()].map((x) => ({ ...x, subject: chem.includes(x.kind) && x.topics.some((t) => t.subject === 'chemistry') ? 'chemistry' : majority(x.topics) }));
}
