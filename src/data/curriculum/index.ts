import type { StemCategory, TextbookLesson } from '../../types/stem';
import { TEXTBOOK_LESSONS } from '../textbookCurriculum';
import type { Section, SimRef, Topic } from './types';
import { PROCESS_SIMS } from './processSims';
import { PHYSICS_7 } from './physics7';
import { PHYSICS_8 } from './physics8';
import { PHYSICS_9 } from './physics9';
import { PHYSICS_10 } from './physics10';
import { PHYSICS_11 } from './physics11';
import { CHEMISTRY_8 } from './chemistry8';
import { CHEMISTRY_9 } from './chemistry9';
import { CHEMISTRY_10 } from './chemistry10';
import { CHEMISTRY_11 } from './chemistry11';
import { BIOLOGY_5 } from './biology5';
import { BIOLOGY_6 } from './biology6';
import { BIOLOGY_7 } from './biology7';
import { BIOLOGY_8 } from './biology8';
import { BIOLOGY_9 } from './biology9';
import { BIOLOGY_10 } from './biology10';
import { BIOLOGY_11 } from './biology11';

export * from './types';

/** Newly authored curriculum, by subject and grade */
const AUTHORED: Section[] = [...PHYSICS_7, ...PHYSICS_8, ...PHYSICS_9, ...PHYSICS_10, ...PHYSICS_11, ...CHEMISTRY_8, ...CHEMISTRY_9, ...CHEMISTRY_10, ...CHEMISTRY_11, ...BIOLOGY_5, ...BIOLOGY_6, ...BIOLOGY_7, ...BIOLOGY_8, ...BIOLOGY_9, ...BIOLOGY_10, ...BIOLOGY_11];

export const SUBJECTS: StemCategory[] = ['physics', 'chemistry', 'biology', 'mathematics'];

const DEDICATED: string[] = ['orbitals', 'deconstruction', 'physics_gravity', 'math_revolution', 'math_divergence', 'biology_cell', 'break_model'];

function legacyGrade(g: TextbookLesson['grade']): number {
  const n = parseInt(g.replace('grade_', ''), 10);
  return Number.isNaN(n) ? 7 : n;
}

function legacySim(l: TextbookLesson): SimRef {
  if (DEDICATED.includes(l.viewMode)) return { lab: l.viewMode };
  if (l.viewMode === 'moment_universal') return { engine: l.simEngineType ?? 'kinematics_velocity' };
  return { moment: l.viewMode };
}

/** Older lessons, reshaped as topics, for subjects/grades not yet re-authored */
function legacySections(): Section[] {
  // Once a subject is re-authored, its old lessons are retired entirely
  const authoredSubjects = new Set(AUTHORED.map((s) => s.subject));
  const bySection = new Map<string, Section>();
  for (const l of TEXTBOOK_LESSONS) {
    const grade = legacyGrade(l.grade);
    if (authoredSubjects.has(l.category)) continue;
    const chapter = l.chapter ?? { ru: 'Разное', en: 'Other topics' };
    const id = `${l.category}-${grade}-legacy-${chapter.en}`;
    if (!bySection.has(id)) bySection.set(id, { id, subject: l.category, grade, title: chapter, topics: [] });
    const topic: Topic = {
      id: l.id,
      subject: l.category,
      grade,
      sectionId: id,
      title: l.title,
      intro: l.textbookDefinition,
      points: [
        { title: { ru: 'Почему трудно представить', en: 'Why it’s hard to picture' }, text: l.studentConfusion },
        { title: { ru: 'Представь на пальцах', en: 'Picture it' }, text: l.lifeAnalogy },
        { title: { ru: 'На что смотреть в модели', en: 'What to watch in the model' }, text: l.momentObservation },
      ],
      formula: l.formula,
      sim: legacySim(l),
      keywords: l.keywords,
    };
    bySection.get(id)!.topics.push(topic);
  }
  return [...bySection.values()];
}

// Engine presets the physics canvas engine really implements; others fall back to an unrelated
// demo, so those topics show no model until a proper engine exists
const SUPPORTED_ENGINES = new Set<string>([
  'kinematics_velocity', 'hooke_spring', 'archimedes_buoyancy', 'lenses_ray_tracing', 'mkt_ideal_gas_laws',
  'thermodynamics_first_law', 'photoelectric_effect', 'friction_dynamometer', 'rutherford_alpha_atom',
]);

const DIGESTIVE = ['esophagus', 'stomach', 'liver', 'gallbladder', 'pancreas', 'small_intestine', 'large_intestine'];

// Topics whose best demonstration is a real anatomical or animal model
const MODEL_SIMS: Record<string, SimRef> = {
  'b8-bones': { model: 'skeleton' },
  'b8-skeleton-parts': { model: 'skeleton' },
  'b8-muscles': { model: 'skeleton', focus: ['upper_limbs', 'lower_limbs'] },
  'b8-skeleton-health': { model: 'skeleton', focus: ['vertebral_column', 'lower_limbs'] },
  'b8-heart': { model: 'heart' },
  'b8-vessels-circuits': { model: 'heart', focus: ['aorta', 'pulmonary_trunk', 'veins'] },
  'b8-blood-flow': { model: 'heart' },
  'b8-heart-health': { model: 'heart' },
  'b8-respiratory-organs': { model: 'organs', focus: ['lungs', 'trachea'] },
  'b8-breathing-movements': { model: 'organs', focus: ['lungs', 'trachea'] },
  'b8-respiratory-health': { model: 'organs', focus: ['lungs', 'trachea'] },
  'b8-nutrients': { model: 'organs', focus: DIGESTIVE },
  'b8-digestive-organs': { model: 'organs', focus: DIGESTIVE },
  'b8-digestion-regulation': { model: 'organs', focus: DIGESTIVE },
  'b8-kidneys': { model: 'organs', focus: ['kidneys', 'bladder'] },
  'b8-nervous-structure': { model: 'organs', focus: ['brain', 'spinal_cord'] },
  'b8-spinal-cord': { model: 'organs', focus: ['spinal_cord', 'brain'] },
  'b8-brain': { model: 'brain' },
  'b8-glands': { model: 'organs', focus: ['brain', 'pancreas', 'kidneys'] },
  'b8-sciences': { model: 'organs' },
  'b7-fish': { model: 'fish' },
  'b7-chordates': { model: 'fish' },
  'b7-mammals': { model: 'fox' },
  'b7-evidence': { model: 'skeleton', focus: ['upper_limbs'] },
  'b5-animals': { model: 'fox' },
  'b11-human-place': { model: 'skeleton' },
};

function withValidSim(section: Section): Section {
  return {
    ...section,
    topics: section.topics.map((t) => {
      const override = MODEL_SIMS[t.id] ?? PROCESS_SIMS[t.id];
      if (override) return { ...t, sim: override };
      return t.sim && 'engine' in t.sim && !SUPPORTED_ENGINES.has(t.sim.engine) ? { ...t, sim: undefined } : t;
    }),
  };
}

export const SECTIONS: Section[] = [...AUTHORED, ...legacySections()].map(withValidSim);
export const TOPICS: Topic[] = SECTIONS.flatMap((s) => s.topics);

export function gradesFor(subject: StemCategory): number[] {
  return [...new Set(SECTIONS.filter((s) => s.subject === subject).map((s) => s.grade))].sort((a, b) => a - b);
}

export function sectionsFor(subject: StemCategory, grade: number): Section[] {
  return SECTIONS.filter((s) => s.subject === subject && s.grade === grade);
}

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
