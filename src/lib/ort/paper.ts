import { hashStr, ortExam, rng, shuffle, type Question } from '../quiz';
import { ortMathFigures, ortMathPart1, ortMathPart2 } from './math';
import { SUBJECT_QUESTIONS, type OrtRunSection } from './sections';
import { PASSAGES, type Passage } from './reading';
import { ANALOGIES, COMPLETIONS, GRAMMAR, type Row } from './verbal';

/* A paper of the ORT main test (see sections.ts). Questions come out the same for the same seed, so a paper can be resumed. */

export type OrtKind = 'compare' | 'pick5' | 'analogy' | 'completion' | 'reading' | 'grammar';

export interface OrtQuestion extends Question {
  /** what kind of task it is: picks the instruction shown above it */
  kind?: OrtKind;
}

function fromRow(row: Row, id: string, kind: OrtKind, r: () => number, prompt = row[0]): OrtQuestion {
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

/** a subject test: the site's own tasks on the syllabus, four or five options each, as on the real test. The guide says
    the real test checks how knowledge is applied rather than recalled, so two thirds are calculation problems where the
    subject has them, and the rest come from the topic questions */
function subjectTest(subject: string, seed: number): OrtQuestion[] {
  const out: OrtQuestion[] = [];
  const seen = new Set<string>();
  const add = (format: 'problems' | 'full', upTo: number) => {
    for (let k = 0; k < 8 && out.length < upTo; k++)
      for (const q of ortExam(subject, seed + k * 7919, format)) {
        if (out.length >= upTo || q.options.length < 4 || q.options.length > 5 || seen.has(q.prompt.ru)) continue;
        seen.add(q.prompt.ru);
        out.push(q);
      }
  };
  add('problems', Math.round((SUBJECT_QUESTIONS * 2) / 3));
  add('full', SUBJECT_QUESTIONS);
  return out;
}

export function ortSection(id: OrtRunSection, seed: number): OrtQuestion[] {
  if (id.startsWith('subj:')) return subjectTest(id.slice(5), seed);
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

export const ORT_KIND_HINT: Record<OrtKind, { ru: string; en: string }> = {
  compare: { ru: 'Сравните величины в колонках А и Б. Если данных не хватает, выберите последний вариант.', en: 'Compare the quantities in columns A and B. If the information is not enough, pick the last option.' },
  pick5: { ru: 'Выберите один верный ответ из пяти.', en: 'Pick the one right answer out of five.' },
  analogy: { ru: 'Найдите пару слов, связанных так же, как пара-образец. Порядок слов важен.', en: 'Find the pair linked like the model pair. Word order matters.' },
  completion: { ru: 'Выберите слова, которые лучше всего подходят на место всех пропусков по порядку.', en: 'Pick the words that best fill all the gaps, in order.' },
  reading: { ru: 'Ответ прямо или косвенно содержится в тексте.', en: 'The answer is stated or implied in the text.' },
  grammar: { ru: 'Выберите верный вариант.', en: 'Pick the correct option.' },
};

/* ---------------- practice by task type ---------------- */

export type OrtDrill = 'compare' | 'pick5' | 'figure' | 'analogy' | 'completion' | 'reading' | 'grammar';

/** each kind of task with how to tackle it: the advice is ours, built on what the official guide asks of the applicant */
export const ORT_DRILLS: { id: OrtDrill; ru: string; en: string; tips: string[] }[] = [
  {
    id: 'compare',
    ru: 'Сравнение величин',
    en: 'Comparing quantities',
    tips: [
      'Не считай до конца, если можно сравнить сразу: упрощай обе колонки одинаково — прибавляй, вычитай, дели на одно и то же положительное число.',
      'Если в колонках есть буквы, подставь крайние случаи: 0, 1, отрицательное число, дробь. Если ответ меняется — это «определить нельзя».',
      'Если в обеих колонках только числа, «определить нельзя» не бывает: одно число всегда больше другого или равно ему.',
    ],
  },
  {
    id: 'pick5',
    ru: 'Задачи с пятью ответами',
    en: 'Five-option problems',
    tips: [
      'Сначала оцени ответ примерно: варианты часто отличаются в разы, и лишние отпадают сразу.',
      'Можно идти от ответов: подставь варианты в условие и проверь, какой подходит.',
      'Неверные варианты собраны из типичных ошибок — среднее вместо средней скорости, процент от другого числа. Получив ответ, проверь, что посчитал именно то, что спрашивают.',
    ],
  },
  {
    id: 'figure',
    ru: 'Рисунки, графики и диаграммы',
    en: 'Drawings, graphs and charts',
    tips: [
      'Перенеси все данные на рисунок в черновике: равные стороны, известные углы, параллельные прямые.',
      'Ищи правило, а не мерь: сумма углов треугольника, внешний угол, вписанный угол, теорема Пифагора.',
      'На диаграмме сначала прочитай подписи и единицы. Процент изменения считают от старого значения.',
    ],
  },
  {
    id: 'analogy',
    ru: 'Аналогии',
    en: 'Analogies',
    tips: [
      'Составь короткое предложение о паре-образце: «пекарь делает хлеб». Подставь в него каждую пару ответа.',
      'Порядок слов важен: «целое : часть» не то же, что «часть : целое».',
      'Если подходят две пары, уточни предложение: кто, что, для чего, в какой степени.',
    ],
  },
  {
    id: 'completion',
    ru: 'Дополнение предложений',
    en: 'Sentence completion',
    tips: [
      'Найди слова-связки: «но», «хотя», «несмотря на» меняют смысл на противоположный, «поэтому», «так как» — продолжают его.',
      'Сначала придумай слово сам, потом ищи близкий по смыслу вариант.',
      'Если пропусков два, отбрасывай вариант, как только одно его слово не подходит.',
    ],
  },
  {
    id: 'reading',
    ru: 'Чтение и понимание',
    en: 'Reading',
    tips: [
      'Сначала прочитай вопрос, потом найди место в тексте, к которому он относится.',
      'Верный ответ подтверждается текстом. Вариант может быть правдой в жизни, но неверным для этого текста.',
      'Значение слова определяй по контексту: подставь вариант на место слова и перечитай предложение.',
    ],
  },
  {
    id: 'grammar',
    ru: 'Практическая грамматика',
    en: 'Practical grammar',
    tips: [
      'Проверяй по правилу, а не на слух: н/нн, пре-/при-, ё/о после шипящих, «не» с разными частями речи.',
      'В предложениях с деепричастием действие должно относиться к подлежащему.',
      'Запятая перед «и» нужна, если «и» соединяет две основы с подлежащим и сказуемым.',
    ],
  },
];

/** ten tasks of one kind for practice */
export function ortDrill(drill: OrtDrill, seed: number, count = 10): OrtQuestion[] {
  const r = rng((seed ^ hashStr(`drill-${drill}`)) >>> 0);
  if (drill === 'compare') return ortMathPart1(seed, count).map((q) => ({ ...q, kind: 'compare' }));
  if (drill === 'pick5') return ortMathPart2(seed, count).map((q) => ({ ...q, kind: 'pick5' }));
  if (drill === 'figure') {
    const f = ortMathFigures(seed, count);
    return [...f.compare.map((q): OrtQuestion => ({ ...q, kind: 'compare' })), ...f.pick5.map((q): OrtQuestion => ({ ...q, kind: 'pick5' }))];
  }
  if (drill === 'analogy') return sample(ANALOGIES, count, r).map((row, k) => fromRow(row, `ort-dan-${seed}-${k}`, 'analogy', r));
  if (drill === 'completion') return sample(COMPLETIONS, count, r).map((row, k) => fromRow(row, `ort-dco-${seed}-${k}`, 'completion', r));
  if (drill === 'grammar') return sample(GRAMMAR, count, r).map((row, k) => fromRow(row, `ort-dgr-${seed}-${k}`, 'grammar', r));
  // reading: one whole text with all its questions
  const p = pick1(PASSAGES, r);
  return p.questions.map((q, k) => ({ ...fromRow(q, `ort-dread-${seed}-${p.id}-${k}`, 'reading', r), passage: { title: p.title, text: p.text } }));
}

const pick1 = <V,>(list: readonly V[], r: () => number) => list[Math.floor(r() * list.length)];

/** which drill trains a task: used to point from a weak spot in the results to practice */
export const drillOf = (q: OrtQuestion): OrtDrill => (q.figure ? 'figure' : (q.kind ?? 'pick5'));
