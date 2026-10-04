import type { SimEngineType, StemCategory, VisualMode } from '../../types/stem';
import type { ModelId } from '../../lib/three/models';
import type { SimId } from '../../components/sims/registry';
import type { MolId } from '../../components/chem/MoleculeLab';

export type L = { ru: string; en: string };

/** What a topic shows as its live demonstration */
export type SimRef =
  | { moment: VisualMode } // embeddable lab
  | { engine: SimEngineType } // physics canvas engine preset
  | { lab: VisualMode } // dedicated full-page 3D lab
  | { model: ModelId; focus?: string[] } // real 3D model, optionally emphasising parts
  | { process: SimId; mode?: string } // timeline-driven process simulation
  | { molecules: MolId[] } // real 3D molecules
  | { reactions: string[] }; // 3D reaction mechanisms with a timeline

export interface Point {
  title: L;
  text: L;
}

export interface Topic {
  id: string;
  subject: StemCategory;
  grade: number;
  sectionId: string;
  title: L;
  intro: L;
  points: Point[];
  formula?: string;
  sim?: SimRef;
  keywords: string[];
}

export interface Section {
  id: string;
  subject: StemCategory;
  grade: number;
  title: L;
  topics: Topic[];
}

/** Compact authoring shape: [ruTitle, enTitle, ruText, enText] per sub-topic */
export type PointTuple = [string, string, string, string];

export interface TopicInput {
  id: string;
  title: [string, string];
  intro: [string, string];
  points: PointTuple[];
  formula?: string;
  sim?: SimRef;
}

export function section(subject: StemCategory, grade: number, id: string, title: [string, string], topics: TopicInput[]): Section {
  const sectionId = `${subject}-${grade}-${id}`;
  return {
    id: sectionId,
    subject,
    grade,
    title: { ru: title[0], en: title[1] },
    topics: topics.map((t) => ({
      id: t.id,
      subject,
      grade,
      sectionId,
      title: { ru: t.title[0], en: t.title[1] },
      intro: { ru: t.intro[0], en: t.intro[1] },
      points: t.points.map(([tr, te, xr, xe]) => ({ title: { ru: tr, en: te }, text: { ru: xr, en: xe } })),
      formula: t.formula,
      sim: t.sim,
      keywords: [t.title[0], t.title[1], ...t.points.flatMap((p) => [p[0], p[1]])].map((k) => k.toLowerCase()),
    })),
  };
}
