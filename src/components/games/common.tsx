import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Image, RotateCcw, Timer, Trophy, Zap } from 'lucide-react';
import { Confetti } from '../fx/Confetti';
import { progress, useProgress } from '../../lib/progress';
import { SITE, shareCard, useCard } from '../../lib/shareCard';

/** names and colours for the story picture of each game */
const STORY: Record<string, { ru: string; en: string; color: string }> = {
  sprint: { ru: 'Устный счёт', en: 'Mental maths', color: '#2F5BFF' },
  balance: { ru: 'Уравняй реакцию', en: 'Balance the equation', color: '#30A46C' },
  elements: { ru: 'Охота на элементы', en: 'Element hunt', color: '#E5484D' },
  cards: { ru: 'Карточки формул', en: 'Formula cards', color: '#0EA5A4' },
};

export type Lang = 'ru' | 'en';

/** a countdown in seconds that stops at zero and calls onEnd once */
export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    if (!running) return;
    // every run starts from the full time
    const started = performance.now();
    const base = seconds;
    setLeft(seconds);
    const id = setInterval(() => {
      const l = Math.max(0, base - (performance.now() - started) / 1000);
      setLeft(l);
      if (l <= 0) {
        clearInterval(id);
        end.current();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return { left, reset: () => setLeft(seconds) };
}

export const GameBar: React.FC<{ lang: Lang; title: string; onExit: () => void; left?: number; total?: number; score: number; extra?: React.ReactNode }> = ({ lang, title, onExit, left, total, score, extra }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3">
      <button onClick={onExit} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> {lang === 'ru' ? 'Все игры' : 'All games'}
      </button>
      <h2 className="font-serif text-xl text-ink ml-1 hidden sm:block">{title}</h2>
      <div className="ml-auto flex items-center gap-2">
        {extra}
        {left !== undefined && (
          <span className={`inline-flex items-center gap-1 h-8 px-3 rounded-full border font-mono text-sm ${left < 10 ? 'border-[#E5484D] text-[#CC2F35] animate-pulse' : 'border-line text-ink'}`}>
            <Timer className="w-4 h-4" /> {Math.ceil(left)}
          </span>
        )}
        <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-ink font-mono text-sm" style={{ color: '#fff', background: '#16171A' }}>
          <Zap className="w-4 h-4" /> {score}
        </span>
      </div>
    </div>
    {left !== undefined && total && (
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-100 ease-linear" style={{ width: `${(left / total) * 100}%` }} />
      </div>
    )}
  </div>
);

/** the results card: saves the record and gives XP once */
export const GameOver: React.FC<{ lang: Lang; id: string; score: number; xp: number; lines?: string[]; onAgain: () => void; onExit: () => void }> = ({ lang, id, score, xp, lines = [], onAgain, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const p = useProgress();
  const [before] = useState(() => p.games?.[id] ?? 0);
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    progress.recordGame(id, score, xp);
  }, [id, score, xp]);
  const record = score > before && score > 0;
  const kind = STORY[id] ?? (id.startsWith('memory') ? { ru: 'Мемо: формулы', en: 'Memory: formulas', color: '#8E4EC6' } : null);
  const card = useCard(kind ? { kicker: kind[lang], big: String(score), sub: record ? L('Новый рекорд!', 'New record!') : lines[0], call: L('Побьёшь мой рекорд?', 'Can you beat it?'), color: kind.color } : null);
  const story = () => card && kind && shareCard(card, L(`${kind.ru} в STEM Visualizer: ${score} очков. Побьёшь? https://${SITE}/#/app?lab=games`, `${kind.en} in STEM Visualizer: ${score} points. Can you beat it? https://${SITE}/#/app?lab=games`), `stem-${id}.png`);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-3 anim-page">
      {record && <Confetti count={48} />}
      <Trophy className={`w-10 h-10 ${record ? 'text-[#F5A524]' : 'text-ink-3'}`} />
      <div className="font-serif text-5xl text-ink">
        <span className="anim-score">{score}</span>
      </div>
      <p className="text-ink-2">{record ? L('Новый рекорд!', 'New record!') : L(`Рекорд: ${Math.max(before, score)}`, `Best: ${Math.max(before, score)}`)}</p>
      {lines.map((l) => (
        <p key={l} className="text-sm text-ink-2">
          {l}
        </p>
      ))}
      <p className="text-sm text-[#1E7A4C] font-medium">+{Math.min(60, Math.round(xp)) + (record && before > 0 ? 5 : 0)} XP</p>
      <div className="flex gap-2 mt-2">
        <button onClick={onAgain} className="h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
          <RotateCcw className="w-4 h-4" /> {L('Ещё раз', 'Play again')}
        </button>
        <button onClick={onExit} className="h-11 px-5 rounded-lg border border-line hover:bg-muted text-sm text-ink cursor-pointer">
          {L('Другие игры', 'Other games')}
        </button>
      </div>
      {kind && (
        <button onClick={story} disabled={!card} className="h-10 px-4 rounded-lg text-sm font-medium text-ink-2 hover:text-ink hover:bg-muted inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <Image className="w-4 h-4" /> {L('Картинка результата в сторис', 'Result picture for stories')}
        </button>
      )}
    </div>
  );
};

export const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
