/* The ORT main test, as the CEEATM brochure for 2025 sets it out: four sections, 150 tasks, 215 minutes, a strict time for
   each section and no way back to a closed one. */

export type OrtSectionId = 'math' | 'verbal' | 'reading' | 'grammar';
/** a section of a run: one of the main test's four, or a subject test (`subj:physics`), which runs the same way */
export type OrtRunSection = OrtSectionId | `subj:${string}`;

export interface OrtSectionMeta {
  id: OrtRunSection;
  ru: string;
  en: string;
  questions: number;
  minutes: number;
  dru: string;
  den: string;
}

export const ORT_SECTIONS: (OrtSectionMeta & { id: OrtSectionId })[] = [
  { id: 'math', ru: 'Математика', en: 'Maths', questions: 60, minutes: 90, dru: 'Сравнение величин и задачи с пятью вариантами. Без калькулятора.', den: 'Comparing quantities and five-option problems. No calculator.' },
  { id: 'verbal', ru: 'Аналогии и дополнение предложений', en: 'Analogies and sentence completion', questions: 30, minutes: 30, dru: 'Связи между словами и пропуски в предложениях.', den: 'Links between words and gaps in sentences. In Russian.' },
  { id: 'reading', ru: 'Чтение и понимание текста', en: 'Reading and understanding', questions: 30, minutes: 60, dru: 'Тексты и вопросы к ним: значение слов, точное понимание, выводы.', den: 'Texts with questions: word meaning, exact understanding, reasoning. In Russian.' },
  { id: 'grammar', ru: 'Практическая грамматика', en: 'Practical grammar', questions: 30, minutes: 35, dru: 'Правописание, формы слов, согласование и пунктуация.', den: 'Spelling, word forms, agreement and punctuation. In Russian.' },
];

/** subject tests in the CEEATM brochure for 2025: 40 tasks; 80 minutes, 60 for biology */
export const ORT_SUBJECTS: Record<string, { ru: string; en: string; minutes: number }> = {
  physics: { ru: 'Физика', en: 'Physics', minutes: 80 },
  chemistry: { ru: 'Химия', en: 'Chemistry', minutes: 80 },
  mathematics: { ru: 'Математика', en: 'Maths', minutes: 80 },
  biology: { ru: 'Биология', en: 'Biology', minutes: 60 },
};
export const SUBJECT_QUESTIONS = 40;

export function sectionMeta(id: OrtRunSection): OrtSectionMeta {
  const main = ORT_SECTIONS.find((s) => s.id === id);
  if (main) return main;
  const s = ORT_SUBJECTS[id.slice(5)] ?? ORT_SUBJECTS.physics;
  return { id, ru: `Предметный тест: ${s.ru}`, en: `Subject test: ${s.en}`, questions: SUBJECT_QUESTIONS, minutes: s.minutes, dru: 'Задания по школьной программе, в каждом один верный ответ.', den: 'Tasks on the school syllabus, one right answer each.' };
}

/** the section's number in the main test, as the answer sheet writes it */
export const ROMAN = ['I', 'II', 'III', 'IV'];

/** the top score of the main test and the mark needed to enter the university competition */
export const ORT_MAX = 245;
export const ORT_THRESHOLD = 110;
/** the real score is scaled and the scale is not published, so this is only a rough linear guide */
export const roughOrtScore = (right: number, total = 150) => Math.round((right / total) * ORT_MAX);

export interface OrtRunPlan {
  seed: number;
  sections: OrtRunSection[];
}

/** a test in progress: it runs for hours, so it survives a reload or a closed tab, and the clock keeps going */
export interface OrtRunState extends OrtRunPlan {
  at: number;
  phase: 'intro' | 'run' | 'done';
  deadline: number;
  picked: Record<string, (number | null)[]>;
  /** an answer on the sheet may be corrected once, as on the real answer sheet; this marks the corrected ones */
  changed?: Record<string, boolean[]>;
  startedAt: number;
}

const KEY = 'stem-ort-main-run';

export function ortLoadRun(): OrtRunState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrtRunState) : null;
  } catch {
    return null;
  }
}

export function ortStoreRun(state: OrtRunState | null) {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {
    // the test still runs, it just won't survive a reload
  }
}

export const ortSavedRun = (): OrtRunPlan | null => {
  const s = ortLoadRun();
  return s && s.phase !== 'done' ? { seed: s.seed, sections: s.sections } : null;
};
