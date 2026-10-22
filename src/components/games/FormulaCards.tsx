import { Button } from '@heroui/react';
import React, { useMemo, useState } from 'react';
import { Eye, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { StemCategory } from '../../types/stem';
import { SECTIONS } from '../../data/curriculum';
import { Formula } from '../Formula';
import { GameBar, GameOver, Lang, shuffle } from './common';

/* Formula cards with spaced repetition (Leitner boxes): a remembered card comes back later and later,
   a forgotten one returns to box 1 and shows up again today. The boxes live on this device. */

const SUBJ: { id: StemCategory; ru: string; en: string; color: string }[] = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
  { id: 'mathematics', ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
];
const SESSION = 10;
const DAY = 86_400_000;
/** how long a card rests in each box before it is due again */
const REST = [0, 10 * 60_000, DAY, 3 * DAY, 7 * DAY, 16 * DAY];
const KEY = 'stem-cards-v1';

type Boxes = Record<string, { box: number; due: number }>;
const loadBoxes = (): Boxes => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
};
const saveBoxes = (b: Boxes) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* private mode: the session still works */
  }
};

const cardsOf = (subject: StemCategory) => {
  const seen = new Set<string>();
  return SECTIONS.filter((s) => s.subject === subject)
    .flatMap((s) => s.topics.map((t) => ({ t, section: s })))
    .filter(({ t }) => t.formula && t.formula.length < 90 && !seen.has(t.formula) && (seen.add(t.formula), true));
};

export const FormulaCards: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [boxes, setBoxes] = useState<Boxes>(loadBoxes);
  const [subject, setSubject] = useState<StemCategory | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [shown, setShown] = useState(false);
  const [right, setRight] = useState(0);
  const [seen, setSeen] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [over, setOver] = useState(false);
  const [run, setRun] = useState(0);

  const stats = useMemo(() => {
    const now = Date.now();
    return Object.fromEntries(
      SUBJ.map((s) => {
        const all = cardsOf(s.id);
        const due = all.filter(({ t }) => boxes[t.id] && boxes[t.id].due <= now).length;
        const learnt = all.filter(({ t }) => (boxes[t.id]?.box ?? 0) >= 4).length;
        return [s.id, { total: all.length, due, learnt }];
      }),
    ) as Record<StemCategory, { total: number; due: number; learnt: number }>;
  }, [boxes]);

  const start = (subj: StemCategory) => {
    const now = Date.now();
    const all = cardsOf(subj);
    // what is due first, then new cards, then the ones resting the longest
    const due = shuffle(all.filter(({ t }) => boxes[t.id] && boxes[t.id].due <= now));
    const fresh = shuffle(all.filter(({ t }) => !boxes[t.id]));
    const rest = all.filter(({ t }) => boxes[t.id] && boxes[t.id].due > now).sort((a, b) => boxes[a.t.id].due - boxes[b.t.id].due);
    setSubject(subj);
    setQueue([...due, ...fresh, ...rest].slice(0, SESSION).map(({ t }) => t.id));
    setShown(false);
    setRight(0);
    setSeen(0);
    setMissed(new Set());
    setOver(false);
    setRun((r) => r + 1);
  };

  const grade = (ok: boolean) => {
    const id = queue[0];
    const box = ok ? Math.min(5, (boxes[id]?.box ?? 0) + 1) : 1;
    const next = { ...boxes, [id]: { box, due: Date.now() + REST[box] } };
    setBoxes(next);
    saveBoxes(next);
    // the score counts each card once, on its first try
    if (!missed.has(id)) {
      setSeen((n) => n + 1);
      if (ok) setRight((n) => n + 1);
      else setMissed(new Set(missed).add(id));
    }
    // a forgotten card comes back at the end of this session
    const q = ok || queue.length === 1 ? queue.slice(1) : [...queue.slice(1), id];
    setQueue(q);
    setShown(false);
    if (!q.length) setOver(true);
  };

  if (over && subject)
    return (
      <GameOver
        lang={lang}
        id="cards"
        score={right}
        xp={right * 3}
        lines={[
          L(`Вспомнил с первого раза: ${right} из ${seen}`, `Recalled first time: ${right} of ${seen}`),
          L(`Выучено (5+ дней в памяти): ${stats[subject].learnt} из ${stats[subject].total}`, `Learnt (5+ days): ${stats[subject].learnt} of ${stats[subject].total}`),
        ]}
        onAgain={() => start(subject)}
        onExit={onExit}
      />
    );

  if (!subject || !queue.length)
    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
        <GameBar lang={lang} title={L('Карточки формул', 'Formula cards')} onExit={onExit} score={0} />
        <p className="text-ink-2 text-sm">{L('Видишь тему — вспомни формулу, потом переверни карточку. То, что помнишь, вернётся через день, три, неделю. Забытое — сегодня же.', 'See the topic, recall the formula, then flip the card. What you remember comes back in a day, three, a week; what you forget comes back today.')}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {SUBJ.map((s) => {
            const st = stats[s.id];
            return (
              <button key={s.id} onClick={() => start(s.id)} className="lift text-left rounded-xl border border-line bg-surface p-4 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="font-medium text-ink">{s[lang]}</span>
                  {st.due > 0 && <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: s.color + '22', color: s.color }}>{L(`повторить: ${st.due}`, `due: ${st.due}`)}</span>}
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${st.total ? (st.learnt / st.total) * 100 : 0}%`, background: s.color }} />
                </div>
                <div className="mt-1.5 text-xs text-ink-3">{L(`выучено ${st.learnt} из ${st.total}`, `learnt ${st.learnt} of ${st.total}`)}</div>
              </button>
            );
          })}
        </div>
      </div>
    );

  const card = cardsOf(subject).find(({ t }) => t.id === queue[0])!;
  const color = SUBJ.find((s) => s.id === subject)!.color;
  const box = boxes[card.t.id]?.box ?? 0;
  return (
    <div key={run} className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <GameBar lang={lang} title={L('Карточки формул', 'Formula cards')} onExit={onExit} score={right} extra={<span className="text-sm text-ink-3 font-mono">{queue.length}</span>} />
      <div key={card.t.id + seen} className="rounded-2xl border-2 bg-surface p-6 sm:p-8 min-h-[300px] flex flex-col items-center justify-center text-center gap-4 anim-q" style={{ borderColor: shown ? color : undefined }}>
        <div className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color }}>
          {card.section.title[lang]} · {box ? L(`коробка ${box} из 5`, `box ${box} of 5`) : L('новая', 'new')}
        </div>
        <h3 className="font-serif text-3xl text-ink leading-tight">{card.t.title[lang]}</h3>
        {shown ? (
          <div className="text-2xl text-ink py-2 max-w-full overflow-x-auto anim-page">
            <Formula tex={card.t.formula!} display />
          </div>
        ) : (
          <p className="text-ink-3 text-sm">{L('Вспомни формулу, потом проверь себя', 'Recall the formula, then check')}</p>
        )}
      </div>
      {shown ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" size="lg" className="font-medium" onPress={() => grade(false)}>
            <ThumbsDown className="w-4 h-4" /> {L('Не вспомнил', 'Forgot')}
          </Button>
          <Button size="lg" className="font-medium" onPress={() => grade(true)}>
            <ThumbsUp className="w-4 h-4" /> {L('Помню', 'Knew it')}
          </Button>
        </div>
      ) : (
        <Button size="lg" className="font-medium" onPress={() => setShown(true)}>
          <Eye className="w-4 h-4" /> {L('Показать формулу', 'Show formula')}
        </Button>
      )}
      <Button variant="ghost" className="self-center text-sm" onPress={() => setSubject(null)}>
        <RotateCcw className="w-3.5 h-3.5" /> {L('Другой предмет', 'Another subject')}
      </Button>
    </div>
  );
};

export default FormulaCards;
