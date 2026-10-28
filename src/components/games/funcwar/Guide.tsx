import { Button, Card, Input } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Crown, Flame, Lock, RotateCcw } from 'lucide-react';
import { usePlan } from '../../../lib/plan';
import { Formula } from '../../Formula';
import type { Lang } from '../common';
import { applyShot, compile, fly, FormulaError, type Pt, type World } from './engine';
import { Field } from './FuncWar';
import { CHAPTERS, chapterWorld, type Chapter } from './chapters';
import { loadSaved } from './looks';

/* The advanced-graphs guide for "Бой функций": a technique per chapter, with a live field to try it on.
   Chapters 1–2 are free; the rest come with Pro. Knowledge only — it gives no in-game edge. */

const ChapterView: React.FC<{ lang: Lang; ch: Chapter; n: number; locked: boolean }> = ({ lang, ch, n, locked }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [world, setWorld] = useState<World>(() => chapterWorld(ch));
  const [flying, setFlying] = useState<{ path: Pt[]; team: 0 | 1; upto: number } | null>(null);
  const [blast, setBlast] = useState<{ at: Pt; age: number; team: 0 | 1 } | null>(null);
  const [trails, setTrails] = useState<{ path: Pt[]; team: 0 | 1 }[]>([]);
  const [measure, setMeasure] = useState<Pt | null>(null);
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [saved] = useState(loadSaved);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fire = (formula: string) => {
    if (flying) return;
    let f: (x: number) => number;
    try {
      f = compile(formula);
    } catch (e) {
      setError(e instanceof FormulaError ? (lang === 'ru' ? e.ru : e.en) : String(e));
      return;
    }
    setError('');
    setMeasure(null);
    // the targets stand back up for every try, so examples can be compared; craters stay
    const fresh = { ...world, soldiers: chapterWorld(ch).soldiers };
    const shot = fly(fresh, fresh.soldiers[0], f);
    const total = shot.path.length;
    const dur = Math.min(1400, 300 + total * 2);
    const t0 = performance.now();
    const step = () => {
      const a = Math.min(1, (performance.now() - t0) / dur);
      setFlying({ path: shot.path, team: 0, upto: Math.ceil(a * total) });
      if (a < 1) {
        raf.current = requestAnimationFrame(step);
        return;
      }
      setFlying(null);
      setTrails((t) => [...t.slice(-3), { path: shot.path, team: 0 }]);
      setWorld(applyShot(fresh, shot));
      const b0 = performance.now();
      const fade = () => {
        const age = (performance.now() - b0) / 500;
        setBlast(age < 1 ? { at: shot.impact, age, team: 0 } : null);
        if (age < 1) raf.current = requestAnimationFrame(fade);
      };
      raf.current = requestAnimationFrame(fade);
    };
    raf.current = requestAnimationFrame(step);
  };

  const reset = () => {
    setWorld(chapterWorld(ch));
    setTrails([]);
  };

  return (
    <article className="flex flex-col gap-4">
      <header>
        <div className="font-mono text-xs text-ink-3">{L(`Глава ${n}`, `Chapter ${n}`)}</div>
        <h2 className="font-serif text-2xl text-ink">{ch.title[lang]}</h2>
        <p className="mt-2 text-[15px] text-ink border-l-2 border-accent pl-3">{ch.idea[lang]}</p>
      </header>
      {locked ? (
        <Card className="p-6">
          <Card.Content className="flex flex-col items-center text-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#FFF4DA] text-[#B5651D] flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </span>
            <p className="text-ink">{L('Эта глава — в Pro.', 'This chapter is part of Pro.')}</p>
            <p className="text-sm text-ink-2 max-w-md">{L('Pro даёт знания, а не преимущество: в бою все равны, гайд лишь учит видеть в функции траекторию.', 'Pro gives knowledge, not an edge: everyone fights on equal terms, the guide only teaches you to see a path in a function.')}</p>
            <Button className="text-sm font-medium" onPress={() => window.dispatchEvent(new Event('open-pro'))}>
              <Crown className="w-4 h-4" /> {L('Открыть Pro', 'Get Pro')}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-2 text-[15px] text-ink-2 leading-relaxed">
            {ch.body[lang].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {ch.formula && (
            <div className="py-2 text-ink text-lg overflow-x-auto">
              <Formula tex={ch.formula} display />
            </div>
          )}
          <Field world={world} active={flying ? null : world.soldiers[0]} trails={trails} flying={flying} blast={blast} onMeasure={setMeasure} measure={measure} lang={lang} looks={[saved.look, { ...saved.look, color: saved.look.color === 'coral' ? 'cyan' : 'coral', hat: 'none' }]} themeId={saved.theme} />
          <div className="flex flex-wrap gap-2">
            {ch.examples.map((ex) => (
              <button
                key={ex.src}
                type="button"
                onClick={() => fire(ex.src)}
                disabled={!!flying}
                className="text-left px-3 py-2 rounded-xl border border-line bg-surface hover:border-accent cursor-pointer disabled:opacity-50"
              >
                <span className="block font-mono text-sm text-ink">y = {ex.src}</span>
                <span className="block text-xs text-ink-3">{ex[lang]}</span>
              </button>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), fire(src))}>
            <span className="self-center font-mono text-ink-2">y =</span>
            <Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder={L('попробуй свою формулу', 'try your own formula')} aria-label={L('Своя формула', 'Your formula')} className="flex-1 min-w-0 font-mono" autoComplete="off" spellCheck={false} />
            <Button type="submit" className="text-sm font-medium" isDisabled={!!flying || !src.trim()}>
              <Flame className="w-4 h-4" /> {L('Огонь', 'Fire')}
            </Button>
            <Button isIconOnly variant="ghost" aria-label={L('Сбросить поле', 'Reset the field')} onPress={reset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </form>
          {error && <p className="text-sm text-[#CC2F35]">{error}</p>}
        </>
      )}
    </article>
  );
};

export const Guide: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const [i, setI] = useState(0);
  const ch = CHAPTERS[i];
  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
      </Button>
      <header>
        <h1 className="font-serif text-3xl text-ink inline-flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-accent" /> {L('Гайд: продвинутые графики', 'Guide: advanced graphs')}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{L('Как собирать траектории из функций и выигрывать. Первые две главы бесплатно.', 'How to build paths out of functions and win. The first two chapters are free.')}</p>
      </header>
      <div className="grid lg:grid-cols-[240px_1fr] gap-5 items-start">
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0" aria-label={L('Главы', 'Chapters')}>
          {CHAPTERS.map((c, k) => {
            const locked = !c.free && !plan.pro;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setI(k)}
                className={`shrink-0 text-left px-3 py-2 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2 ${k === i ? 'bg-accent-soft text-ink font-medium' : 'text-ink-2 hover:bg-muted'}`}
              >
                <span className="font-mono text-xs text-ink-3">{k + 1}</span>
                <span className="flex-1">{c.title[lang]}</span>
                {locked && <Lock className="w-3.5 h-3.5 text-ink-3" />}
              </button>
            );
          })}
        </nav>
        <ChapterView key={ch.id} lang={lang} ch={ch} n={i + 1} locked={!ch.free && !plan.pro} />
      </div>
    </div>
  );
};

export default Guide;
