import React, { useEffect, useRef, useState } from 'react';
import { Check, Delete, X } from 'lucide-react';
import { GameBar, Lang } from './common';

/* Ten problems from a seed, and the screen that runs them. The duel and the daily challenge share both,
   so everyone who gets the same seed solves exactly the same problems. */

export const COUNT = 10;

/** a small seeded generator (mulberry32) */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ten problems that get harder: arithmetic, percents, powers, equations, physics and geometry one-liners */
export function problems(seed: number, lang: Lang): { q: string; a: number }[] {
  const r = rng(seed);
  const n = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const ru = lang === 'ru';
  const sup = '⁰¹²³⁴⁵';
  const make = (kind: number, v: number): { q: string; a: number } => {
    switch (kind) {
      case 0: {
        const a = n(12, 89), b = n(6, 49), x = n(6, 19), y = n(3, 9);
        return v === 0 ? { q: `${a} + ${b}`, a: a + b } : v === 1 ? { q: `${a + b} − ${b}`, a } : { q: `${x} × ${y}`, a: x * y };
      }
      case 1: {
        const p = [10, 15, 20, 25, 30, 40, 50, 75][n(0, 7)], x = [40, 60, 80, 120, 160, 200, 240, 360][n(0, 7)], k = n(11, 25);
        return v === 0 ? { q: `${p}% ${ru ? 'от' : 'of'} ${x}`, a: (p * x) / 100 } : { q: `${k}²`, a: k * k };
      }
      case 2: {
        const x = n(2, 12), k = n(2, 9), b = n(1, 30);
        return { q: `${k}x + ${b} = ${k * x + b},  x = ?`, a: x };
      }
      case 3: {
        const t = n(2, 6), s = n(3, 15) * t, m = n(2, 12), a = n(2, 5);
        return v === 0
          ? { q: ru ? `${s} м за ${t} с: v = ? м/с` : `${s} m in ${t} s: v = ? m/s`, a: s / t }
          : { q: ru ? `m = ${m} кг, a = ${a} м/с²: F = ? Н` : `m = ${m} kg, a = ${a} m/s²: F = ? N`, a: m * a };
      }
      case 4: {
        const [a, b, c] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]][n(0, 4)];
        const x = n(3, 8) * 10, y = n(2, 5) * 10;
        return v === 0
          ? { q: ru ? `Катеты ${a} и ${b}: гипотенуза = ?` : `Legs ${a} and ${b}: hypotenuse = ?`, a: c }
          : { q: ru ? `Углы треугольника ${x}° и ${y}°: третий = ?` : `Triangle angles ${x}° and ${y}°: third = ?`, a: 180 - x - y };
      }
      default: {
        const a = n(2, 5), b = n(2, 3);
        return { q: `${a}${sup[b]} + ${b}${sup[a]}`, a: a ** b + b ** a };
      }
    }
  };
  return [0, 0, 1, 1, 2, 2, 3, 3, 4, 5].map((kind) => make(kind, n(0, 2)));
}

/** runs the problems one answer each and reports which were right and how long it took */
export const ProblemRun: React.FC<{ lang: Lang; title: string; list: { q: string; a: number }[]; onExit: (marks: boolean[], secs: number) => void; onDone: (marks: boolean[], secs: number) => void }> = ({ lang, title, list, onExit, onDone }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [i, setI] = useState(0);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [t0] = useState(() => performance.now());
  const [now, setNow] = useState(t0);
  const field = useRef<HTMLInputElement>(null);
  const right = marks.filter(Boolean).length;

  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, []);
  useEffect(() => field.current?.focus(), [i]);

  const submit = () => {
    if (input.trim() === '' || input === '-' || marks.length === list.length) return;
    const ok = Math.abs(Number(input.replace(',', '.')) - list[i].a) < 1e-9;
    const m = [...marks, ok];
    setMarks(m);
    setFlash(ok ? 'right' : 'wrong');
    setTimeout(() => setFlash('idle'), 300);
    setInput('');
    if (i + 1 < list.length) setI(i + 1);
    else onDone(m, Math.round((performance.now() - t0) / 1000));
  };
  const press = (k: string) => {
    if (k === 'del') setInput((s) => s.slice(0, -1));
    else if (k === 'ok') submit();
    else if (k === '-') setInput((s) => (s.startsWith('-') ? s.slice(1) : '-' + s));
    else setInput((s) => (s.length < 6 ? s + k : s));
  };

  const p = list[i];
  const elapsed = Math.max(0, Math.round((now - t0) / 1000));
  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <GameBar lang={lang} title={title} onExit={() => onExit(marks, Math.round((performance.now() - t0) / 1000))} score={right} extra={<span className="font-mono text-sm text-ink-2">{i + 1}/{list.length} · {elapsed} {L('с', 's')}</span>} />
      <div className={`rounded-2xl border-2 bg-surface p-6 flex flex-col items-center gap-4 transition-colors ${flash === 'right' ? 'border-[#30A46C] bg-[#EAF6EF]' : flash === 'wrong' ? 'border-[#E5484D] bg-[#FDF0EF] anim-wrong' : 'border-line'}`}>
        <div className="flex gap-1">
          {list.map((_, k) => (
            <span key={k} className={`w-2 h-2 rounded-full ${k < i ? (marks[k] ? 'bg-[#30A46C]' : 'bg-[#E5484D]') : k === i ? 'bg-ink' : 'bg-muted'}`} />
          ))}
        </div>
        <div key={p.q} className="font-serif text-3xl sm:text-4xl text-ink text-center anim-q">{p.q}</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="w-full flex justify-center"
        >
          <input ref={field} value={input} onChange={(e) => setInput(e.target.value.replace(/[^0-9,.\-]/g, '').slice(0, 7))} inputMode="none" className="w-48 h-14 text-center font-mono text-3xl rounded-xl border border-line bg-paper outline-none focus:border-accent" aria-label={L('Ответ', 'Answer')} />
        </form>
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', 'del'].map((k) => (
            <button key={k} type="button" onClick={() => press(k)} className="h-12 rounded-xl border border-line bg-paper hover:bg-muted active:scale-95 transition-transform text-xl font-mono text-ink cursor-pointer flex items-center justify-center">
              {k === 'del' ? <Delete className="w-5 h-5" /> : k === '-' ? '±' : k}
            </button>
          ))}
          <button type="button" onClick={() => press('ok')} className="col-span-3 h-12 rounded-xl bg-accent hover:bg-accent-hover text-base font-medium cursor-pointer inline-flex items-center justify-center gap-1.5" style={{ color: '#fff' }}>
            {flash === 'wrong' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />} {L('Ответить', 'Answer')}
          </button>
        </div>
        <p className="text-xs text-ink-3">{L('Ответ можно дать один раз — потом сразу следующая задача.', 'One answer per problem, then the next one.')}</p>
      </div>
    </div>
  );
};

