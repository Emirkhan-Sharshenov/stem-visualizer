import { Button, Card, Input } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, BookOpen, Crown, Flame, Lock, RotateCcw, Swords, SlidersHorizontal } from 'lucide-react';
import { usePlan } from '../../../lib/plan';
import { Formula } from '../../Formula';
import { RangeSlider } from '../../ui/RangeSlider';
import type { Lang } from '../common';
import { applyShot, compile, fly, FormulaError, type Pt, type World } from './engine';
import { Field } from './FuncWar';
import { CHAPTERS, chapterWorld, fillTemplate, type Chapter } from './chapters';
import { loadSaved } from './looks';

/* The guide to "Бой функций": one chapter per family of functions, each with what the function is, its
   parameters, how to use it in battle, the usual mistakes, a field with example shots and sliders that redraw
   the path live. Free: chapters 1–2; the free week: up to chapter 5; Pro: all. Knowledge only — no in-game edge. */

type Access = 'free' | 'trial' | 'pro';
const allowed = (ch: Chapter, level: Access) => ch.access === 'free' || (ch.access === 'trial' && level !== 'free') || level === 'pro';

const OUTCOME = (end: string, hit: boolean, lang: Lang) =>
  hit
    ? lang === 'ru' ? '✓ попадание' : '✓ hit'
    : ({ obstacle: ['в скалу', 'into rock'], edge: ['за край поля', 'off the field'], jump: ['скачок графика', 'a jump in the graph'], undefined: ['не определена', 'undefined'], range: ['мимо', 'a miss'] } as Record<string, [string, string]>)[end]?.[lang === 'ru' ? 0 : 1] ?? end;

const Section: React.FC<{ icon: React.ReactNode; title: string; items: string[] }> = ({ icon, title, items }) =>
  items.length ? (
    <section>
      <h3 className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
        {icon} {title}
      </h3>
      <div className="mt-1.5 flex flex-col gap-1.5 text-[15px] text-ink-2 leading-relaxed">
        {items.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
    </section>
  ) : null;

const ChapterView: React.FC<{ lang: Lang; ch: Chapter; n: number; locked: Access | null }> = ({ lang, ch, n, locked }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [world, setWorld] = useState<World>(() => chapterWorld(ch));
  const [flying, setFlying] = useState<{ path: Pt[]; team: 0 | 1; upto: number } | null>(null);
  const [blast, setBlast] = useState<{ at: Pt; age: number; team: 0 | 1 } | null>(null);
  const [trails, setTrails] = useState<{ path: Pt[]; team: 0 | 1 }[]>([]);
  const [measure, setMeasure] = useState<Pt | null>(null);
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(ch.play?.params.map((q) => [q.key, q.value]) ?? []));
  const [saved] = useState(loadSaved);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fresh = () => ({ ...world, soldiers: chapterWorld(ch).soldiers });
  // the slider formula's path, redrawn live (it is not fired, so nothing breaks)
  const preview = useMemo(() => {
    if (!ch.play) return null;
    const formula = fillTemplate(ch.play.template, values);
    try {
      const w = fresh();
      const shot = fly(w, w.soldiers[0], compile(formula));
      const hit = w.soldiers.filter((s) => s.team === 1).every((s) => shot.killed.includes(s.id));
      return { formula, shot, hit };
    } catch {
      return null;
    }
  }, [values, world]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const w = fresh();
    const shot = fly(w, w.soldiers[0], f);
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
      setWorld(applyShot(w, shot));
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
  const looks = useMemo(() => [saved.look, { ...saved.look, color: saved.look.color === 'coral' ? 'cyan' : 'coral', hat: 'none' as const }] as [typeof saved.look, typeof saved.look], [saved]);

  return (
    <article className="flex flex-col gap-4">
      <header>
        <div className="font-mono text-xs text-ink-3">{L(`Урок ${n} из ${CHAPTERS.length}`, `Lesson ${n} of ${CHAPTERS.length}`)}</div>
        <h2 className="font-serif text-2xl text-ink">{ch.title[lang]}</h2>
        <p className="mt-2 text-[15px] text-ink border-l-2 border-accent pl-3">{ch.idea[lang]}</p>
      </header>
      {locked ? (
        <Card className="p-6">
          <Card.Content className="flex flex-col items-center text-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#FFF4DA] text-[#B5651D] flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </span>
            <p className="text-ink">{locked === 'trial' ? L('Этот урок — в полном Pro. В пробную неделю открыты уроки 1–5.', 'This lesson is in full Pro; the free week opens lessons 1–5.') : L('Этот урок — в Pro.', 'This lesson is part of Pro.')}</p>
            <p className="text-sm text-ink-2 max-w-md">{L('Pro даёт знания, а не преимущество: в бою все равны, гайд лишь учит видеть в функции траекторию.', 'Pro gives knowledge, not an edge: everyone fights on equal terms; the guide teaches you to see a path in a function.')}</p>
            <Button className="text-sm font-medium" onPress={() => window.dispatchEvent(new Event('open-pro'))}>
              <Crown className="w-4 h-4" /> {L('Открыть Pro', 'Get Pro')}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Section icon={<BookOpen className="w-4 h-4 text-accent" />} title={L('Что это за функция', 'What this function is')} items={ch.about[lang]} />
          {ch.formula && (
            <div className="py-1 text-ink text-lg overflow-x-auto">
              <Formula tex={ch.formula} display />
            </div>
          )}
          {ch.params.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-ink">{L('Параметры', 'Parameters')}</h3>
              <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
                {ch.params.map(([name, ru, en]) => (
                  <React.Fragment key={name}>
                    <dt className="font-mono text-accent">{name}</dt>
                    <dd className="text-ink-2">{lang === 'ru' ? ru : en}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          )}
          <Section icon={<Swords className="w-4 h-4 text-accent" />} title={L('Как применять в бою', 'In battle')} items={ch.battle[lang]} />
          <Section icon={<AlertTriangle className="w-4 h-4 text-[#F76B15]" />} title={L('Частые ошибки', 'Common mistakes')} items={ch.mistakes[lang]} />

          <Field
            world={world}
            active={flying ? null : world.soldiers[0]}
            trails={trails}
            preview={preview && !flying ? preview.shot.path : undefined}
            flying={flying}
            blast={blast}
            onMeasure={setMeasure}
            measure={measure}
            lang={lang}
            looks={looks}
            themeId={saved.theme}
          />

          {ch.play && preview && (
            <Card className="p-4">
              <Card.Content className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-accent" /> {L('Покрути параметры', 'Play with the parameters')}
                  </span>
                  <span className={`text-sm ${preview.hit ? 'text-[#1E7A4C]' : 'text-ink-3'}`}>{OUTCOME(preview.shot.end, preview.hit, lang)}</span>
                </div>
                <div className="font-mono text-sm text-ink break-all">y = {preview.formula}</div>
                {ch.play.params.map((q) => (
                  <label key={q.key} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-ink-2">{q.label[lang]}</span>
                    <RangeSlider value={values[q.key]} onChange={(v) => setValues((s) => ({ ...s, [q.key]: v }))} min={q.min} max={q.max} step={q.step} aria-label={q.label[lang]} />
                    <span className="w-14 text-right font-mono text-ink">{String(Math.round(values[q.key] * 10000) / 10000).replace('.', lang === 'ru' ? ',' : '.')}</span>
                  </label>
                ))}
                <Button variant="outline" size="sm" className="self-start text-xs" onPress={() => fire(preview.formula)} isDisabled={!!flying}>
                  <Flame className="w-4 h-4" /> {L('Выстрелить этой формулой', 'Fire this formula')}
                </Button>
              </Card.Content>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            {ch.examples.map((ex) => (
              <button key={ex.src} type="button" onClick={() => fire(ex.src)} disabled={!!flying} className="text-left px-3 py-2 rounded-xl border border-line bg-surface hover:border-accent cursor-pointer disabled:opacity-50">
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
  const level: Access = plan.pro && !plan.trial ? 'pro' : plan.trial ? 'trial' : 'free';
  const [i, setI] = useState(0);
  const ch = CHAPTERS[i];
  const free = CHAPTERS.filter((c) => c.access === 'free').length;
  const trial = CHAPTERS.filter((c) => c.access !== 'pro').length;
  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
      </Button>
      <header>
        <h1 className="font-serif text-3xl text-ink inline-flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-accent" /> {L('Гайд по функциям', 'The function guide')}
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          {L(
            `${CHAPTERS.length} уроков: каждая функция — что это, как выглядит график, что делают параметры и как с ней выигрывать. Бесплатно — ${free} урока, в пробную неделю — ${trial}, в Pro — все.`,
            `${CHAPTERS.length} lessons: each function — what it is, its graph, its parameters and how to win with it. Free: ${free}; the free week: ${trial}; Pro: all.`,
          )}
        </p>
      </header>
      <div className="grid lg:grid-cols-[250px_1fr] gap-5 items-start">
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 lg:sticky lg:top-20" aria-label={L('Уроки', 'Lessons')}>
          {CHAPTERS.map((c, k) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setI(k)}
              className={`shrink-0 text-left px-3 py-2 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2 ${k === i ? 'bg-accent-soft text-ink font-medium' : 'text-ink-2 hover:bg-muted'}`}
            >
              <span className="font-mono text-xs text-ink-3 w-5">{k + 1}</span>
              <span className="flex-1">{c.title[lang]}</span>
              {!allowed(c, level) && <Lock className="w-3.5 h-3.5 text-ink-3" />}
            </button>
          ))}
        </nav>
        <ChapterView key={ch.id} lang={lang} ch={ch} n={i + 1} locked={allowed(ch, level) ? null : level === 'trial' ? 'trial' : 'pro'} />
      </div>
    </div>
  );
};

export default Guide;
