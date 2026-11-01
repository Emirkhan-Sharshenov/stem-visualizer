import { hashStr, rng, shuffle, type Question } from '../quiz';
import { ortMathPart1, ortMathPart2 } from './math';
import type { OrtSectionId } from './sections';
import { PASSAGES, type Passage } from './reading';
import { ANALOGIES, COMPLETIONS, GRAMMAR, type Row } from './verbal';

/* A paper of the ORT main test (see sections.ts). Questions come out the same for the same seed, so a paper can be resumed. */

export interface OrtQuestion extends Question {
  /** the text the question is about, shown beside it */
  passage?: { title: string; text: string };
  /** what kind of task it is: picks the instruction shown above it */
  kind?: 'compare' | 'pick5' | 'analogy' | 'completion' | 'reading' | 'grammar';
}

function fromRow(row: Row, id: string, kind: OrtQuestion['kind'], r: () => number, prompt = row[0]): OrtQuestion {
  const answers = shuffle(row.slice(1, 5), r);
  return {
    id,
    topicId: '',
    kind,
    prompt: { ru: prompt, en: prompt },
    options: answers.map((a) => ({ ru: a, en: a })),
    correct: answers.indexOf(row[1]),
    explain: { ru: row[5], en: row[5] },
  };
}

function sample<V>(list: readonly V[], count: number, r: () => number): V[] {
  const out: V[] = [];
  while (out.length < count) out.push(...shuffle([...list], r));
  return out.slice(0, count);
}

function readingQuestions(seed: number, count: number, r: () => number): OrtQuestion[] {
  // whole texts, never a text without its questions: the last one gives up what doesn't fit
  const texts: Passage[] = shuffle(PASSAGES, r);
  const out: OrtQuestion[] = [];
  for (const p of texts) {
    if (out.length >= count) break;
    p.questions.slice(0, count - out.length).forEach((q, k) => {
      const question = fromRow(q, `ort-read-${seed}-${p.id}-${k}`, 'reading', r);
      out.push({ ...question, passage: { title: p.title, text: p.text } });
    });
  }
  return out;
}

export function ortSection(id: OrtSectionId, seed: number): OrtQuestion[] {
  const r = rng((seed ^ hashStr(id)) >>> 0);
  if (id === 'math') {
    const part1: OrtQuestion[] = ortMathPart1(seed).map((q) => ({ ...q, kind: 'compare' }));
    const part2: OrtQuestion[] = ortMathPart2(seed).map((q) => ({ ...q, kind: 'pick5' }));
    return [...part1, ...part2];
  }
  if (id === 'verbal') {
    const a = sample(ANALOGIES, 15, r).map((row, k) => fromRow(row, `ort-an-${seed}-${k}`, 'analogy', r));
    const c = sample(COMPLETIONS, 15, r).map((row, k) => fromRow(row, `ort-co-${seed}-${k}`, 'completion', r));
    return [...a, ...c];
  }
  if (id === 'reading') return readingQuestions(seed, 30, r);
  return sample(GRAMMAR, 30, r).map((row, k) => fromRow(row, `ort-gr-${seed}-${k}`, 'grammar', r));
}

export const ORT_KIND_HINT: Record<NonNullable<OrtQuestion['kind']>, { ru: string; en: string }> = {
  compare: { ru: 'Сравните величины в колонках А и Б. Если данных не хватает, выберите последний вариант.', en: 'Compare the quantities in columns A and B. If the information is not enough, pick the last option.' },
  pick5: { ru: 'Выберите один верный ответ из пяти.', en: 'Pick the one right answer out of five.' },
  analogy: { ru: 'Найдите пару слов, связанных так же, как пара-образец. Порядок слов важен.', en: 'Find the pair linked like the model pair. Word order matters.' },
  completion: { ru: 'Выберите слова, которые лучше всего подходят на место всех пропусков по порядку.', en: 'Pick the words that best fill all the gaps, in order.' },
  reading: { ru: 'Ответ прямо или косвенно содержится в тексте.', en: 'The answer is stated or implied in the text.' },
  grammar: { ru: 'Выберите верный вариант.', en: 'Pick the correct option.' },
};
