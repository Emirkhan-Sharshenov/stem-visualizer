import { Button, Card } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Crown, Lock, Palette } from 'lucide-react';
import { usePlan } from '../../../lib/plan';
import { useSession } from '../../../lib/supabase';
import { fwMe } from '../../../lib/fwRating';
import type { Lang } from '../common';
import { compile, fly, type World } from './engine';
import { Field } from './FuncWar';
import {
  allowedLook, BLASTS, BODIES, COLORS, DEFAULT_LOOKS, drawBlast, drawSoldier, drawTrail, EYES, HATS, loadSaved, storeSaved, THEMES, TRAILS,
  unlocked, unlockText, type Look, type Progress, type Saved, type ThemeId, type Unlock,
} from './looks';

/* "Мастерская": dress up your soldiers and pick a battlefield. Looks only — the rules ignore all of it. */

type Tab = 'color' | 'trail' | 'body' | 'hat' | 'eyes' | 'blast' | 'theme';
const STAR_KEY = 'stem-funcwar-stars';
const campaignStars = () => {
  try {
    return Object.values(JSON.parse(localStorage.getItem(STAR_KEY) || '{}') as Record<string, number>).reduce((a, b) => a + b, 0);
  } catch {
    return 0;
  }
};

const PREVIEW: World = {
  obstacles: [{ x: 0, y: 1, r: 3 }],
  holes: [{ x: -2.4, y: 2.6, r: 1.1 }],
  soldiers: [
    { id: 0, team: 0, x: -13, y: -3, alive: true, name: '', hp: 3 },
    { id: 10, team: 1, x: 13, y: -3, alive: true, name: '', hp: 2 },
  ],
};
const PREVIEW_PATH = fly(PREVIEW, PREVIEW.soldiers[0], compile('-0.06x(x-26)')).path;

/** a tiny drawing of one item, so the tiles show what they give */
const Swatch: React.FC<{ draw: (g: CanvasRenderingContext2D, w: number, h: number) => void; bg: string; sig: string }> = ({ draw, bg, sig }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = 72 * dpr;
    cv.height = 48 * dpr;
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = bg;
    g.fillRect(0, 0, 72, 48);
    draw(g, 72, 48);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, bg]);
  return <canvas ref={ref} style={{ width: 72, height: 48 }} className="rounded-lg" aria-hidden="true" />;
};

/** the looping sample shot, in its own component so its 60 fps state doesn't re-render the item grid */
const Preview: React.FC<{ lang: Lang; look: Look; themeId: ThemeId }> = ({ lang, look, themeId }) => {
  const [upto, setUpto] = useState(0);
  const [blastAge, setBlastAge] = useState<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const t = ((performance.now() - t0) / 2600) % 1;
      if (t < 0.6) {
        setUpto(Math.ceil((t / 0.6) * PREVIEW_PATH.length));
        setBlastAge(null);
      } else {
        setUpto(PREVIEW_PATH.length);
        setBlastAge((t - 0.6) / 0.3);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const looks = useMemo((): [Look, Look] => [look, DEFAULT_LOOKS[1].color === look.color ? { ...DEFAULT_LOOKS[1], color: 'cyan' } : DEFAULT_LOOKS[1]], [look]);
  return (
    <Field
      world={PREVIEW}
      active={null}
      trails={[]}
      flying={{ path: PREVIEW_PATH, team: 0, upto }}
      blast={blastAge !== null ? { at: PREVIEW_PATH[PREVIEW_PATH.length - 1], age: blastAge, team: 0 } : null}
      lang={lang}
      looks={looks}
      themeId={themeId}
    />
  );
};

export const Workshop: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const { user } = useSession();
  const [wins, setWins] = useState(0);
  const [tab, setTab] = useState<Tab>('color');
  const progress: Progress = useMemo(() => ({ stars: campaignStars(), wins, pro: plan.pro }), [wins, plan.pro]);
  const [saved, setSaved] = useState<Saved>(loadSaved);
  useEffect(() => {
    if (user) fwMe().then((m) => setWins(m?.wins ?? 0)).catch(() => {});
  }, [user]);
  // drop anything no longer earned (a Pro item after Pro ended)
  useEffect(() => {
    if (plan.loading) return;
    setSaved((s) => ({ look: allowedLook(s.look, progress), theme: THEMES.some((t) => t.id === s.theme && unlocked(t.unlock, progress)) ? s.theme : 'lab' }));
  }, [progress, plan.loading]);
  useEffect(() => storeSaved(saved), [saved]);

  const look = saved.look;
  const bg = THEMES.find((t) => t.id === saved.theme)!.bg;
  const set = (patch: Partial<Look>) => setSaved((s) => ({ ...s, look: { ...s.look, ...patch } }));

  const tile = (key: string, title: string, u: Unlock, selected: boolean, onPick: () => void, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, tileBg = bg) => {
    const open = unlocked(u, progress);
    return (
      <button
        key={key}
        type="button"
        onClick={() => (open ? onPick() : u.kind === 'pro' ? window.dispatchEvent(new Event('open-pro')) : undefined)}
        className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center cursor-pointer transition-colors ${selected ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'} ${open ? '' : 'opacity-70'}`}
        aria-pressed={selected}
      >
        <Swatch draw={draw} bg={tileBg} sig={`${key}|${JSON.stringify(look)}`} />
        <span className="text-xs text-ink leading-tight">{title}</span>
        {!open && (
          <span className={`absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 h-5 rounded-full text-[10px] font-medium ${u.kind === 'pro' ? 'bg-[#FFF4DA] text-[#B5651D]' : 'bg-muted text-ink-2'}`}>
            {u.kind === 'pro' ? <Crown className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {unlockText(u, lang)}
          </span>
        )}
      </button>
    );
  };

  const soldierAt = (l: Look) => (g: CanvasRenderingContext2D, w: number, h: number) => drawSoldier(g, w / 2, h / 2 + 4, 11, l, 1);
  const TABS: { id: Tab; ru: string; en: string }[] = [
    { id: 'color', ru: 'Цвет', en: 'Colour' },
    { id: 'trail', ru: 'След', en: 'Trail' },
    { id: 'body', ru: 'Боец', en: 'Body' },
    { id: 'hat', ru: 'Шапка', en: 'Hat' },
    { id: 'eyes', ru: 'Лицо', en: 'Face' },
    { id: 'blast', ru: 'Взрыв', en: 'Blast' },
    { id: 'theme', ru: 'Поле', en: 'Field' },
  ];
  const count = (list: { unlock: Unlock }[]) => `${list.filter((i) => unlocked(i.unlock, progress)).length}/${list.length}`;
  const listFor: Record<Tab, { unlock: Unlock }[]> = { color: COLORS, trail: TRAILS, body: BODIES, hat: HATS, eyes: EYES, blast: BLASTS, theme: THEMES };

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
      </Button>
      <header>
        <h1 className="font-serif text-3xl text-ink inline-flex items-center gap-2">
          <Palette className="w-7 h-7 text-accent" /> {L('Мастерская', 'Workshop')}
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          {L('Только внешний вид: ни один предмет не меняет полёт снаряда, попадания и ходы. Многое открывается звёздами кампании и победами в рейтинге, остальное — с Pro.', 'Looks only: nothing here changes a shot, a hit or a turn. Much of it unlocks with campaign stars and ranked wins; the rest comes with Pro.')}
        </p>
        <p className="mt-1 text-xs text-ink-3">{L(`У тебя: ★ ${progress.stars} в кампании · ${progress.wins} побед в рейтинге${progress.pro ? ' · Pro' : ''}`, `You have: ★ ${progress.stars} campaign stars · ${progress.wins} ranked wins${progress.pro ? ' · Pro' : ''}`)}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4 items-start">
        <div className="lg:sticky lg:top-20">
          <Preview lang={lang} look={look} themeId={saved.theme} />
        </div>
        <Card className="p-4">
          <Card.Content className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((t) => (
                <Button key={t.id} size="sm" variant={tab === t.id ? 'primary' : 'outline'} className="text-xs" onPress={() => setTab(t.id)} aria-pressed={tab === t.id}>
                  {lang === 'ru' ? t.ru : t.en} <span className="opacity-70 font-mono">{count(listFor[t.id])}</span>
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tab === 'color' &&
                COLORS.map((c) => tile(c.id, lang === 'ru' ? c.ru : c.en, c.unlock, look.color === c.id, () => set({ color: c.id }), soldierAt({ ...look, color: c.id })))}
              {tab === 'trail' &&
                TRAILS.map((t) =>
                  tile(t.id, lang === 'ru' ? t.ru : t.en, t.unlock, look.trail === t.id, () => set({ trail: t.id }), (g, w, h) =>
                    drawTrail(g, Array.from({ length: 40 }, (_, i) => ({ x: 6 + (i / 39) * (w - 12), y: h / 2 + Math.sin(i / 6) * 12 })), { ...look, trail: t.id }, 1, 0),
                  ),
                )}
              {tab === 'body' && BODIES.map((b) => tile(b.id, lang === 'ru' ? b.ru : b.en, b.unlock, look.body === b.id, () => set({ body: b.id }), soldierAt({ ...look, body: b.id })))}
              {tab === 'hat' && HATS.map((h) => tile(h.id, lang === 'ru' ? h.ru : h.en, h.unlock, look.hat === h.id, () => set({ hat: h.id }), soldierAt({ ...look, hat: h.id })))}
              {tab === 'eyes' && EYES.map((e) => tile(e.id, lang === 'ru' ? e.ru : e.en, e.unlock, look.eyes === e.id, () => set({ eyes: e.id }), soldierAt({ ...look, eyes: e.id })))}
              {tab === 'blast' &&
                BLASTS.map((b) => tile(b.id, lang === 'ru' ? b.ru : b.en, b.unlock, look.blast === b.id, () => set({ blast: b.id }), (g, w, h) => drawBlast(g, w / 2, h / 2, 9, 0.45, { ...look, blast: b.id })))}
              {tab === 'theme' &&
                THEMES.map((t) =>
                  tile(t.id, lang === 'ru' ? t.ru : t.en, t.unlock, saved.theme === t.id, () => setSaved((s) => ({ ...s, theme: t.id as ThemeId })), (g, w, h) => {
                    g.strokeStyle = t.grid5;
                    for (let x = 0; x < w; x += 9) (g.beginPath(), g.moveTo(x, 0), g.lineTo(x, h), g.stroke());
                    for (let y = 0; y < h; y += 9) (g.beginPath(), g.moveTo(0, y), g.lineTo(w, y), g.stroke());
                    g.fillStyle = t.rock[0];
                    g.beginPath();
                    g.arc(w * 0.62, h * 0.55, 11, 0, Math.PI * 2);
                    g.fill();
                  }, t.bg),
                )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Workshop;
