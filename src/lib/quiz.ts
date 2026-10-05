import { sectionsFor, Topic, TOPICS } from '../data/curriculum';

export interface Question {
  id: string;
  topicId: string;
  prompt: { ru: string; en: string };
  options: { ru: string; en: string }[];
  correct: number;
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

const hashStr = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

function shuffle<T>(arr: T[], rand: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** plausible wrong answers, nearest first: the same section, then the same subject and grade */
function poolsFor(topic: Topic) {
  const secs = sectionsFor(topic.subject, topic.grade);
  const sibling = secs.find((s) => s.id === topic.sectionId)?.topics.filter((t) => t.id !== topic.id).flatMap((t) => t.points) ?? [];
  const grade = secs.filter((s) => s.id !== topic.sectionId).flatMap((s) => s.topics).flatMap((t) => t.points);
  return [sibling, grade];
}

/**
 * Builds questions from a topic's own sub-topics:
 * "what is true about X?" (pick the description) and "which concept is described?" (pick the title).
 */
export function questionsForTopic(topic: Topic, count = 4, salt = 0): Question[] {
  const rand = rng(hashStr(topic.id) + salt * 977);
  const [sibling, grade] = poolsFor(topic);
  const own = shuffle(topic.points, rand).slice(0, count);
  return own.map((pt, i) => {
    const describe = i % 2 === 0;
    const differs = (x: { title: { ru: string }; text: { ru: string } }) => (describe ? x.text.ru !== pt.text.ru : x.title.ru !== pt.title.ru);
    // nearest distractors first (same topic, then same section): those are the tricky ones
    const tiers = [topic.points.filter((x) => x !== pt), sibling, grade].map((tier) => shuffle(tier.filter(differs), rand));
    const sameTopic = tiers[0].slice(0, 1);
    const others = [...sameTopic, ...tiers[1], ...tiers[0].slice(1), ...tiers[2]];
    const wrong = others.slice(0, 3).map((x) => (describe ? x.text : x.title));
    const right = describe ? pt.text : pt.title;
    const options = shuffle([right, ...wrong], rand);
    return {
      id: `${topic.id}:${i}:${salt}`,
      topicId: topic.id,
      prompt: describe
        ? { ru: `Что верно про «${pt.title.ru}»?`, en: `What is true about “${pt.title.en}”?` }
        : { ru: `О чём идёт речь: «${pt.text.ru}»`, en: `What is described: “${pt.text.en}”` },
      options,
      correct: options.indexOf(right),
    };
  });
}

/** mixed practice test across topics of a subject (and optional grade range) */
export function practiceTest(subject: string | 'all', grades: [number, number], count: number, seed: number): Question[] {
  const rand = rng(seed);
  const topics = TOPICS.filter((t) => (subject === 'all' ? t.subject !== 'mathematics' : t.subject === subject) && t.grade >= grades[0] && t.grade <= grades[1] && t.points.length >= 2);
  const picked = shuffle(topics, rand).slice(0, count);
  return picked.map((t, i) => questionsForTopic(t, 1, seed + i)[0]).filter(Boolean);
}
