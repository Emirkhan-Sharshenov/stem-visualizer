import { Section, sectionsFor, Topic, TOPICS } from '../data/curriculum';
import { problemQuestion, problemsForTopic } from './problems';

type T2 = { ru: string; en: string };

export interface Option extends T2 {
  /** option is a TeX formula */
  tex?: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  prompt: T2;
  options: Option[];
  correct: number;
  /** worked solution shown after answering */
  explain?: T2;
}

/** small deterministic RNG so a quiz is stable between renders */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const hashStr = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

export function shuffle<T>(arr: T[], rand: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Point = Topic['points'][number];

/** plausible wrong answers, nearest first: the same section, then the same subject and grade */
function neighbours(topic: Topic) {
  const secs = sectionsFor(topic.subject, topic.grade);
  const section = secs.find((s) => s.id === topic.sectionId);
  const siblingTopics = section?.topics.filter((t) => t.id !== topic.id) ?? [];
  const gradeTopics = secs.filter((s) => s.id !== topic.sectionId).flatMap((s) => s.topics);
  return { siblingTopics, gradeTopics, sibling: siblingTopics.flatMap((t) => t.points), grade: gradeTopics.flatMap((t) => t.points) };
}

const TRUE: T2 = { ru: 'Верно', en: 'True' };
const FALSE: T2 = { ru: 'Неверно', en: 'False' };

/**
 * 4–10 questions per topic, built from its own sub-topics so they always match the lesson:
 * pick the description, name the concept, true/false, odd one out, which topic, and the formula.
 */
export function questionsForTopic(topic: Topic, max = 10, salt = 0): Question[] {
  const rand = rng(hashStr(topic.id) + salt * 977);
  const n = neighbours(topic);
  const pts = topic.points;
  const qs: Question[] = [];
  const add = (prompt: T2, right: Option, wrong: Option[]) => {
    const uniq = wrong.filter((w, i) => w.ru !== right.ru && wrong.findIndex((x) => x.ru === w.ru) === i).slice(0, 3);
    if (uniq.length < 1) return;
    const options = shuffle([right, ...uniq], rand);
    qs.push({ id: `${topic.id}:${qs.length}:${salt}`, topicId: topic.id, prompt, options, correct: options.indexOf(right) });
  };
  const nearest = (pt: Point, key: 'title' | 'text') => {
    const tiers = [pts.filter((x) => x !== pt), n.sibling, n.grade].map((tier) => shuffle(tier.filter((x) => x[key].ru !== pt[key].ru), rand));
    return [...tiers[0].slice(0, 1), ...tiers[1], ...tiers[0].slice(1), ...tiers[2]].map((x) => x[key]);
  };

  // 1–2. every point: "what is true about X" and "what is described"
  shuffle(pts, rand).forEach((pt, i) => {
    if (i % 2 === 0) add({ ru: `Что верно про «${pt.title.ru}»?`, en: `What is true about “${pt.title.en}”?` }, pt.text, nearest(pt, 'text'));
    else add({ ru: `О чём идёт речь: «${pt.text.ru}»`, en: `What is described: “${pt.text.en}”` }, pt.title, nearest(pt, 'title'));
  });

  // 3. true / false: the statement is either right or borrows another point's description
  shuffle(pts, rand)
    .slice(0, 2)
    .forEach((pt, i) => {
      const truthful = (hashStr(pt.title.ru) + i + salt) % 2 === 0;
      const other = nearest(pt, 'text')[0];
      const claim = truthful || !other ? pt.text : other;
      add(
        { ru: `Верно ли: «${pt.title.ru}» — ${claim.ru}`, en: `True or false: “${pt.title.en}” — ${claim.en}` },
        truthful || !other ? TRUE : FALSE,
        [truthful || !other ? FALSE : TRUE],
      );
    });

  // 4. odd one out among the topic's sub-topics
  if (pts.length >= 3) {
    const own = shuffle(pts, rand).slice(0, 3).map((p) => p.title);
    const stranger = shuffle(n.grade.length ? n.grade : n.sibling, rand).find((p) => !pts.some((x) => x.title.ru === p.title.ru));
    if (stranger) {
      const options = shuffle([...own, stranger.title], rand);
      qs.push({ id: `${topic.id}:odd:${salt}`, topicId: topic.id, prompt: { ru: `Что НЕ относится к теме «${topic.title.ru}»?`, en: `Which does NOT belong to “${topic.title.en}”?` }, options, correct: options.indexOf(stranger.title) });
    }
  }

  // 5. which topic is this about (uses the intro)
  const otherTopics = shuffle(n.siblingTopics.length >= 3 ? n.siblingTopics : [...n.siblingTopics, ...n.gradeTopics], rand).slice(0, 3);
  if (otherTopics.length)
    add({ ru: `К какой теме относится: «${topic.intro.ru}»`, en: `Which topic is this: “${topic.intro.en}”` }, topic.title, otherTopics.map((t) => t.title));

  // 6. the topic's formula
  if (topic.formula) {
    const others = shuffle(
      TOPICS.filter((t) => t.subject === topic.subject && t.formula && t.formula !== topic.formula && t.id !== topic.id),
      rand,
    ).slice(0, 3);
    if (others.length >= 2)
      add(
        { ru: `Какая формула относится к теме «${topic.title.ru}»?`, en: `Which formula belongs to “${topic.title.en}”?` },
        { ru: topic.formula, en: topic.formula, tex: true },
        others.map((t) => ({ ru: t.formula!, en: t.formula!, tex: true })),
      );
  }

  // short topics: top up with the opposite true/false statements and reversed questions
  for (let k = 0; qs.length < 4 && k < pts.length * 2; k++) {
    const pt = pts[k % pts.length];
    if (k < pts.length) {
      const other = nearest(pt, 'text')[0];
      if (!other) continue;
      add({ ru: `Верно ли: «${pt.title.ru}» — ${other.ru}`, en: `True or false: “${pt.title.en}” — ${other.en}` }, FALSE, [TRUE]);
    } else add({ ru: `Верно ли: «${pt.title.ru}» — ${pt.text.ru}`, en: `True or false: “${pt.title.en}” — ${pt.text.en}` }, TRUE, [FALSE]);
  }

  // calculation problems with fresh numbers for topics that have them (up to 2 per quiz)
  const probs = problemsForTopic(topic.id).flatMap((g, i) => [problemQuestion(g, hashStr(topic.id) + salt * 31 + i), problemQuestion(g, hashStr(topic.id) + salt * 31 + i + 101)]);
  const chosen = shuffle(probs, rand).slice(0, 2);

  // mix the types but keep the count between 4 and the limit
  const text = shuffle(qs, rand).slice(0, Math.max(4 - chosen.length, Math.min(max - chosen.length, qs.length)));
  return shuffle([...text, ...chosen], rand);
}

/** mixed practice test across topics of a subject and grade range */
export function practiceTest(subject: string | 'all', grades: [number, number], count: number, seed: number): Question[] {
  const rand = rng(seed);
  const topics = TOPICS.filter((t) => (subject === 'all' || t.subject === subject) && t.grade >= grades[0] && t.grade <= grades[1] && t.points.length >= 2);
  const picked = shuffle(topics, rand).slice(0, count);
  return picked
    .map((t, i) => {
      // every third question is a calculation problem when the topic has one
      const gens = problemsForTopic(t.id);
      if (i % 3 === 2 && gens.length) return problemQuestion(gens[i % gens.length], seed + i);
      return shuffle(questionsForTopic(t, 10, seed + i), rand)[0];
    })
    .filter(Boolean);
}

/** a test over one section: two questions from each of its topics */
export function sectionTest(section: Section, seed: number, perTopic = 2): Question[] {
  const rand = rng(seed + hashStr(section.id));
  return shuffle(
    section.topics.filter((t) => t.points.length >= 2).flatMap((t, i) => shuffle(questionsForTopic(t, 10, seed + i), rand).slice(0, perTopic)),
    rand,
  ).slice(0, 25);
}

export const todayKey = () => new Date().toISOString().slice(0, 10);

/** three questions of the day, one per subject, the same for everyone on a given date */
export function dailyQuestions(date = todayKey()): Question[] {
  const seed = hashStr(date);
  const rand = rng(seed);
  return (['physics', 'chemistry', 'biology'] as const).map((s, i) => {
    const pool = TOPICS.filter((t) => t.subject === s && t.points.length >= 2);
    const topic = pool[Math.floor(rand() * pool.length)];
    return shuffle(questionsForTopic(topic, 10, seed + i), rand)[0];
  });
}

/** mock exam modelled on the ORT subject test: 40 questions from grades 7–11, about a third are calculations */
export const ORT = { questions: 40, minutes: 60 };
export function ortExam(subject: string, seed: number): Question[] {
  return practiceTest(subject, [7, 11], ORT.questions, seed);
}
