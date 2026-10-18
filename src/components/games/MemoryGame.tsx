import React, { useEffect, useMemo, useState } from 'react';
import type { StemCategory } from '../../types/stem';
import { SECTIONS } from '../../data/curriculum';
import { Formula } from '../Formula';
import { GameBar, GameOver, Lang, shuffle } from './common';

/* Memory: find the pairs "formula ↔ what it is". Fewer flips and less time give more points. */

const SUBJ: { id: StemCategory; ru: string; en: string; color: string }[] = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
  { id: 'mathematics', ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
];
const PAIRS = 6;

interface Card {
  key: string;
  pair: number;
  kind: 'formula' | 'name';
  text: string;
}

export const MemoryGame: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [subject, setSubject] = useState<StemCategory | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState(0);
  const [secs, setSecs] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);

  const pool = useMemo(
    () =>
      subject
        ? SECTIONS.filter((s) => s.subject === subject)
            .flatMap((s) => s.topics)
            .filter((t) => t.formula && t.formula.length < 60)
        : [],
    [subject],
  );

  const deal = (subj: StemCategory) => {
    setSubject(subj);
    const topics = shuffle(SECTIONS.filter((s) => s.subject === subj).flatMap((s) => s.topics).filter((t) => t.formula && t.formula.length < 60));
    // one formula per title, so two cards never look the same
    const seen = new Set<string>();
    const picked = topics.filter((t) => (seen.has(t.formula!) || seen.has(t.title.ru) ? false : (seen.add(t.formula!), seen.add(t.title.ru), true))).slice(0, PAIRS);
    setDeck(shuffle(picked.flatMap((t, i) => [{ key: `f${i}`, pair: i, kind: 'formula' as const, text: t.formula! }, { key: `n${i}`, pair: i, kind: 'name' as const, text: t.title[lang] }])));
    setOpen([]);
    setFound(new Set());
    setMoves(0);
    setStart(performance.now());
    setSecs(0);
  };

  const done = deck.length > 0 && found.size === deck.length / 2;
  useEffect(() => {
    if (!start || done) return;
    const id = setInterval(() => setSecs(Math.floor((performance.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, [start, done]);

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.has(deck[i].pair)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].pair === deck[b].pair) {
        setTimeout(() => {
          setFound((f) => new Set([...f, deck[a].pair]));
          setOpen([]);
        }, 350);
      } else {
        setWrong(next);
        setTimeout(() => {
          setOpen([]);
          setWrong([]);
        }, 900);
      }
    }
  };

  if (!subject)
    return (
      <div className="flex flex-col gap-4">
        <GameBar lang={lang} title={L('Мемо: формулы', 'Memory: formulas')} onExit={onExit} score={0} />
        <div className="rounded-2xl border border-line bg-surface p-6 flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl text-ink">{L('Выбери предмет', 'Pick a subject')}</p>
          <p className="text-sm text-ink-2 max-w-md">{L('Переворачивай карточки и находи пары: формула и тема, к которой она относится.', 'Flip cards and match each formula with its topic.')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUBJ.map((s) => (
              <button key={s.id} onClick={() => deal(s.id)} className="h-11 px-5 rounded-full text-sm font-medium cursor-pointer transition-transform hover:-translate-y-0.5" style={{ background: s.color, color: '#fff' }}>
                {s[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  const score = Math.max(10, 120 - Math.max(0, moves - PAIRS) * 8 - Math.floor(secs / 2));
  if (done)
    return (
      <GameOver
        lang={lang}
        id={`memory-${subject}`}
        score={score}
        xp={score / 4}
        lines={[L(`Ходов: ${moves}, время: ${secs} с`, `Moves: ${moves}, time: ${secs} s`)]}
        onAgain={() => deal(subject)}
        onExit={onExit}
      />
    );

  const color = SUBJ.find((s) => s.id === subject)!.color;
  return (
    <div className="flex flex-col gap-4">
      <GameBar
        lang={lang}
        title={L('Мемо: формулы', 'Memory: formulas')}
        onExit={onExit}
        score={found.size}
        extra={<span className="text-sm text-ink-2 font-mono">{L('ходы', 'moves')} {moves} · {secs} с</span>}
      />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5" style={{ perspective: 900 }}>
        {deck.map((c, i) => {
          const shown = open.includes(i) || found.has(c.pair);
          const isFound = found.has(c.pair);
          return (
            <button key={c.key} onClick={() => flip(i)} className={`relative h-28 sm:h-32 cursor-pointer ${wrong.includes(i) ? 'anim-wrong' : ''}`} style={{ transformStyle: 'preserve-3d' }} aria-label={shown ? c.text : L('карточка', 'card')}>
              <div className="absolute inset-0 transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: shown ? 'rotateY(180deg)' : 'none' }}>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center text-3xl font-serif shadow-sm" style={{ backfaceVisibility: 'hidden', background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#fff' }}>
                  ?
                </div>
                <div
                  className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center p-2 text-center ${isFound ? 'border-[#30A46C] bg-[#EAF6EF]' : 'border-line bg-surface'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {c.kind === 'formula' ? (
                    <span className="text-ink text-[15px] overflow-hidden max-w-full">
                      <Formula tex={c.text} />
                    </span>
                  ) : (
                    <span className="text-sm text-ink leading-snug">{c.text}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {pool.length < PAIRS && <p className="text-sm text-ink-3">{L('Для этого предмета мало формул.', 'Not many formulas for this subject.')}</p>}
    </div>
  );
};

export default MemoryGame;
