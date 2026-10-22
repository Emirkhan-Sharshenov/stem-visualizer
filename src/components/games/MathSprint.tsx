import { Button, Input } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { GameBar, GameOver, Lang, useCountdown } from './common';

/* Mental maths sprint: 60 seconds, examples get harder as the streak grows. */

const ROUND = 60;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** an example for a level: sums, differences, tables, division, squares, percents, negatives */
function example(level: number, lang: Lang): { q: string; a: number } {
  const kind = rnd(0, Math.min(6, 1 + Math.floor(level / 2)));
  const big = 10 + level * 8;
  switch (kind) {
    case 0: {
      const a = rnd(2, big);
      const b = rnd(2, big);
      return { q: `${a} + ${b}`, a: a + b };
    }
    case 1: {
      const a = rnd(10, big + 10);
      const b = rnd(2, a);
      return { q: `${a} − ${b}`, a: a - b };
    }
    case 2: {
      const a = rnd(2, 9 + Math.min(level, 6));
      const b = rnd(2, 9);
      return { q: `${a} × ${b}`, a: a * b };
    }
    case 3: {
      const b = rnd(2, 9);
      const a = b * rnd(2, 9 + Math.min(level, 6));
      return { q: `${a} : ${b}`, a: a / b };
    }
    case 4: {
      const a = rnd(2, 15 + Math.min(level, 10));
      return { q: `${a}²`, a: a * a };
    }
    case 5: {
      const p = [10, 20, 25, 50, 5, 75][rnd(0, 5)];
      const n = [20, 40, 60, 80, 100, 120, 200, 400][rnd(0, 7)];
      return { q: `${p}% ${lang === 'ru' ? 'от' : 'of'} ${n}`, a: (p * n) / 100 };
    }
    default: {
      const a = rnd(-20, 20);
      const b = rnd(-20, 20);
      return { q: `${a < 0 ? `(−${-a})` : a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`, a: a + b };
    }
  }
}

export const MathSprint: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [run, setRun] = useState(0);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [ex, setEx] = useState(() => example(0, lang));
  const [input, setInput] = useState('');
  const [state, setState] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [solved, setSolved] = useState(0);
  const field = useRef<HTMLInputElement>(null);
  const { left } = useCountdown(ROUND, !over, () => setOver(true));

  useEffect(() => field.current?.focus(), [ex, run]);

  const submit = (val = input) => {
    if (val.trim() === '' || val === '-') return;
    const ok = Number(val.replace(',', '.')) === ex.a;
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      setBest((b) => Math.max(b, s));
      setScore((x) => x + 1 + Math.floor(s / 5));
      setSolved((x) => x + 1);
      setState('right');
      setEx(example(Math.floor((solved + 1) / 3), lang));
    } else {
      setStreak(0);
      setState('wrong');
    }
    setInput('');
    setTimeout(() => setState('idle'), 350);
  };
  const press = (k: string) => {
    if (k === 'del') setInput((s) => s.slice(0, -1));
    else if (k === 'ok') submit();
    else if (k === '-') setInput((s) => (s.startsWith('-') ? s.slice(1) : '-' + s));
    else setInput((s) => (s.length < 6 ? s + k : s));
  };

  if (over)
    return (
      <GameOver
        lang={lang}
        id="sprint"
        score={score}
        xp={score * 1.5}
        lines={[L(`Решено примеров: ${solved}, лучшая серия: ${best}`, `Solved: ${solved}, best streak: ${best}`)]}
        onAgain={() => {
          setScore(0);
          setStreak(0);
          setBest(0);
          setSolved(0);
          setEx(example(0, lang));
          setOver(false);
          setRun(run + 1);
        }}
        onExit={onExit}
      />
    );

  return (
    <div key={run} className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <GameBar lang={lang} title={L('Устный счёт', 'Mental maths')} onExit={onExit} left={left} total={ROUND} score={score} extra={streak >= 3 ? <span className="text-sm font-medium text-[#F5A524]">🔥 ×{streak}</span> : null} />
      <div className={`rounded-2xl border-2 bg-surface p-6 flex flex-col items-center gap-4 transition-colors ${state === 'right' ? 'border-[#30A46C] bg-[#EAF6EF]' : state === 'wrong' ? 'border-[#E5484D] bg-[#FDF0EF] anim-wrong' : 'border-line'}`}>
        <div key={ex.q} className="font-serif text-5xl text-ink anim-q">{ex.q} = ?</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="w-full flex justify-center"
        >
          <Input
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9,.\-]/g, '').slice(0, 7))}
            inputMode="none"
            className="w-48 h-14 text-center font-mono text-3xl"
            aria-label={L('Ответ', 'Answer')}
          />
        </form>
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', 'del'].map((k) => (
            <Button variant="outline" size="lg" className="text-xl font-mono" key={k} type="button" onPress={() => press(k)}>
              {k === 'del' ? <Delete className="w-5 h-5" /> : k === '-' ? '±' : k}
            </Button>
          ))}
          <Button size="lg" className="col-span-3 text-base font-medium" type="button" onPress={() => press('ok')}>
            {L('Ответить', 'Answer')} ↵
          </Button>
        </div>
        <p className="text-xs text-ink-3">{L('Каждые 5 верных подряд — бонус. Ошибка обнуляет серию.', 'Every 5 in a row gives a bonus; a mistake resets the streak.')}</p>
      </div>
    </div>
  );
};

export default MathSprint;
