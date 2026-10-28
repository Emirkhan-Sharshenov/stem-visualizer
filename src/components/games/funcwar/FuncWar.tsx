import { Button, Card, Input } from '@heroui/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, BookOpen, Crosshair, Flame, Lightbulb, Lock, Palette, RotateCcw, Star, Swords, Users } from 'lucide-react';
import { progress } from '../../../lib/progress';
import { Confetti } from '../../fx/Confetti';
import type { Lang } from '../common';
import { applyShot, botMove, compile, fly, FormulaError, H, randomWorld, type Pt, type Shot, type Soldier, type World, W, SOLDIER_R } from './engine';
import { LEVELS, levelWorld, type Level } from './levels';
import { colorHex, DEFAULT_LOOKS, drawBlast, drawSoldier, drawTrail, loadSaved, theme, type Look, type ThemeId } from './looks';
import { OnlineDuel } from './OnlineDuel';
import { Ranked, RankedCard } from './Ranked';
import { Workshop } from './Workshop';
import { Guide } from './Guide';

/* "Бой функций": an artillery duel where shots fly along the graphs of functions the players type.
   Our twists on Graphwar: a campaign that teaches one family of graphs per level, rock that crumbles into
   craters, formulas written in the shooter's own coordinates (so both sides use the same maths), and a
   tap-to-measure sight that shows where a point is relative to the shooter. */

const CAMPAIGN_KEY = 'stem-funcwar-stars';
const readStars = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || '{}');
  } catch {
    return {};
  }
};
const saveStars = (s: Record<string, number>) => {
  try {
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(s));
  } catch {
    // stars just won't be remembered on this device
  }
};
const starsFor = (shots: number) => (shots <= 1 ? 3 : shots <= 2 ? 2 : 1);

type Mode = { kind: 'campaign'; level: number } | { kind: 'bot'; level: 0 | 1 | 2; seed: number; perSide?: number; lives?: number } | { kind: 'local'; seed: number } | { kind: 'online'; seed: number; perSide: number };

/** an online duel as the battle sees it: which side is mine, who opens, and the wire for shots */
export interface Online {
  me: 0 | 1;
  first: 0 | 1;
  sendShot: (src: string) => void;
  onShot: (cb: (src: string) => void) => () => void;
  peerGone: boolean;
  /** the opponent's chosen look, if they sent one */
  peerLook?: Look;
}
const TURN_SECONDS = 60;
interface Log { team: 0 | 1; name: string; src: string; note: string }

/* ---------------- the battlefield canvas ---------------- */

export const Field: React.FC<{
  world: World;
  active: Soldier | null;
  trails: { path: Pt[]; team: 0 | 1 }[];
  flying: { path: Pt[]; team: 0 | 1; upto: number } | null;
  blast: { at: Pt; age: number; team: 0 | 1 } | null;
  onMeasure?: (p: Pt | null) => void;
  measure?: Pt | null;
  lang: Lang;
  /** how each side looks: [blue side, red side] */
  looks?: [Look, Look];
  themeId?: ThemeId;
}> = ({ world, active, trails, flying, blast, onMeasure, measure = null, lang, looks = DEFAULT_LOOKS, themeId = 'lab' }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 480 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setSize({ w, h: Math.round((w * H) / W) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const th = theme(themeId);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size.w * dpr;
    cv.height = size.h * dpr;
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = size.w / W;
    const X = (x: number) => (x + W / 2) * k;
    const Y = (y: number) => (H / 2 - y) * k;
    const P = (p: Pt) => ({ x: X(p.x), y: Y(p.y) });
    const now = performance.now();

    // the paper and its unit grid, in the chosen theme
    g.fillStyle = th.bg;
    g.fillRect(0, 0, size.w, size.h);
    if (th.id === 'space')
      for (let i = 0; i < 70; i++) {
        const s = Math.sin(i * 91.7) * 43758.5453;
        const f = s - Math.floor(s);
        g.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * Math.abs(Math.sin(now / 900 + i))})`;
        g.fillRect(f * size.w, ((i * 0.6180339) % 1) * size.h, 1.5, 1.5);
      }
    g.lineWidth = 1;
    for (let x = -W / 2; x <= W / 2; x++) {
      g.strokeStyle = x === 0 ? th.axis : x % 5 === 0 ? th.grid5 : th.grid;
      g.beginPath();
      g.moveTo(X(x), 0);
      g.lineTo(X(x), size.h);
      g.stroke();
    }
    for (let y = -H / 2; y <= H / 2; y++) {
      g.strokeStyle = y === 0 ? th.axis : y % 5 === 0 ? th.grid5 : th.grid;
      g.beginPath();
      g.moveTo(0, Y(y));
      g.lineTo(size.w, Y(y));
      g.stroke();
    }

    // the active shooter's own axes: x forward, ticks every 5 — the coordinates the formula is written in
    if (active && active.alive && !flying) {
      const dir = active.team === 0 ? 1 : -1;
      const c = colorHex(looks[active.team].color);
      g.strokeStyle = `${c}88`;
      g.setLineDash([6, 6]);
      g.beginPath();
      g.moveTo(X(active.x), Y(active.y));
      g.lineTo(X(active.x + dir * W), Y(active.y));
      g.moveTo(X(active.x), 0);
      g.lineTo(X(active.x), size.h);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = th.text;
      g.font = `${Math.max(9, k * 0.45)}px IBM Plex Mono, monospace`;
      g.textAlign = 'center';
      for (let t = 5; t < W; t += 5) {
        const x = active.x + dir * t;
        if (Math.abs(x) > W / 2) break;
        g.fillRect(X(x) - 0.5, Y(active.y) - 4, 1, 8);
        g.fillText(String(t), X(x), Y(active.y) + 14);
      }
    }

    // rock, then craters bitten out of it
    for (const o of world.obstacles) {
      const grad = g.createRadialGradient(X(o.x - o.r * 0.3), Y(o.y + o.r * 0.3), 0, X(o.x), Y(o.y), o.r * k);
      grad.addColorStop(0, th.rock[0]);
      grad.addColorStop(1, th.rock[1]);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(X(o.x), Y(o.y), o.r * k, 0, Math.PI * 2);
      g.fill();
    }
    for (const h of world.holes) {
      g.fillStyle = th.bg;
      g.beginPath();
      g.arc(X(h.x), Y(h.y), h.r * k, 0, Math.PI * 2);
      g.fill();
    }

    // earlier shots, faint; the shot in flight, bright, with a white head
    for (const t of trails) drawTrail(g, t.path.map(P), looks[t.team], 0.3, now);
    if (flying) {
      const pts = flying.path.slice(0, Math.max(1, flying.upto)).map(P);
      drawTrail(g, pts, looks[flying.team], 1, now);
      const head = pts[pts.length - 1];
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
      g.fill();
    }

    // soldiers
    for (const s of world.soldiers) {
      const r = SOLDIER_R * k;
      if (!s.alive) {
        g.strokeStyle = th.text;
        g.globalAlpha = 0.6;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(X(s.x) - r, Y(s.y) - r);
        g.lineTo(X(s.x) + r, Y(s.y) + r);
        g.moveTo(X(s.x) + r, Y(s.y) - r);
        g.lineTo(X(s.x) - r, Y(s.y) + r);
        g.stroke();
        g.globalAlpha = 1;
        continue;
      }
      if (active && s.id === active.id && !flying) {
        g.strokeStyle = colorHex(looks[s.team].color);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(X(s.x), Y(s.y), r + 7 + 2 * Math.sin(now / 200), 0, Math.PI * 2);
        g.stroke();
      }
      drawSoldier(g, X(s.x), Y(s.y), r, looks[s.team], s.team === 0 ? 1 : -1, s.hp);
    }

    if (blast) drawBlast(g, X(blast.at.x), Y(blast.at.y), k, blast.age, looks[blast.team]);

    // the sight: a tapped point in the shooter's coordinates
    if (measure && active) {
      const dir = active.team === 0 ? 1 : -1;
      const lx = (measure.x - active.x) * dir;
      const ly = measure.y - active.y;
      g.strokeStyle = '#FFD65A';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(X(measure.x), Y(measure.y), 6, 0, Math.PI * 2);
      g.moveTo(X(measure.x) - 10, Y(measure.y));
      g.lineTo(X(measure.x) + 10, Y(measure.y));
      g.moveTo(X(measure.x), Y(measure.y) - 10);
      g.lineTo(X(measure.x), Y(measure.y) + 10);
      g.stroke();
      const label = `x = ${lx.toFixed(1)}, y = ${ly.toFixed(1)}`.replace(/\./g, lang === 'ru' ? ',' : '.');
      g.font = '12px IBM Plex Mono, monospace';
      const tw = g.measureText(label).width + 12;
      const bx = Math.min(size.w - tw - 4, Math.max(4, X(measure.x) + 10));
      const by = Math.max(4, Y(measure.y) - 28);
      g.fillStyle = 'rgba(4, 16, 30, 0.9)';
      g.fillRect(bx, by, tw, 20);
      g.fillStyle = '#FFD65A';
      g.textAlign = 'left';
      g.fillText(label, bx + 6, by + 14);
    }
  }, [world, active, trails, flying, blast, measure, size, lang, looks, themeId]);

  const toWorld = (e: React.PointerEvent): Pt => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W - W / 2, y: H / 2 - ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div ref={wrap} className="w-full">
      <canvas
        ref={ref}
        style={{ width: size.w, height: size.h }}
        className="block rounded-xl border border-line touch-none cursor-crosshair"
        onPointerDown={(e) => onMeasure?.(toWorld(e))}
        onPointerMove={(e) => e.pointerType === 'mouse' && onMeasure?.(toWorld(e))}
        onPointerLeave={(e) => e.pointerType === 'mouse' && onMeasure?.(null)}
        role="img"
        aria-label={lang === 'ru' ? 'Поле боя: координатная плоскость с препятствиями и бойцами' : 'Battlefield: a coordinate plane with rocks and soldiers'}
      />
    </div>
  );
};

/* ---------------- one game ---------------- */

const KEYS = ['x', '^', '(', ')', '/', 'sin(', 'cos(', 'sqrt(', '|', 'pi', 'e^('];

export const Battle: React.FC<{
  lang: Lang;
  mode: Mode;
  onExit: () => void;
  onNext?: () => void;
  onRestart?: () => void;
  online?: Online;
  /** a heading in place of the mode's own */
  title?: string;
  /** called once when the game ends, with whether the local player won (rated games report it) */
  onResult?: (won: boolean) => void;
  /** shown on the result card, e.g. the rating change */
  resultNote?: React.ReactNode;
}> = ({ lang, mode, onExit, onNext, onRestart, online, title, onResult, resultNote }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const level: Level | null = mode.kind === 'campaign' ? LEVELS[mode.level] : null;
  const [world, setWorld] = useState<World>(() => (level ? levelWorld(level) : mode.kind === 'online' ? randomWorld(mode.seed, mode.perSide, 9, 3) : mode.kind === 'bot' ? randomWorld(mode.seed, mode.perSide ?? 2, 9, mode.lives) : randomWorld(mode.kind === 'campaign' ? 1 : mode.seed)));
  const [turnId, setTurnId] = useState(() => (online ? world.soldiers.find((s) => s.team === online.first)! : world.soldiers[0]).id);
  // shots taken by each side so far: picks which soldier of a side is next, the same on both screens
  const taken = useRef<[number, number]>([0, 0]);
  const [turnStart, setTurnStart] = useState(() => performance.now());
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [trails, setTrails] = useState<{ path: Pt[]; team: 0 | 1 }[]>([]);
  const [flying, setFlying] = useState<{ path: Pt[]; team: 0 | 1; upto: number } | null>(null);
  const [blast, setBlast] = useState<{ at: Pt; age: number; team: 0 | 1 } | null>(null);
  const [measure, setMeasure] = useState<Pt | null>(null);
  const [log, setLog] = useState<Log[]>([]);
  const [shots, setShots] = useState(0);
  const [winner, setWinner] = useState<0 | 1 | null>(null);
  const [hint, setHint] = useState(false);
  const [thinking, setThinking] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [, tick] = useState(0);

  const shooter = world.soldiers.find((s) => s.id === turnId) ?? null;
  const isBotTurn = mode.kind === 'bot' && shooter?.team === 1;
  const isRemoteTurn = !!online && shooter?.team !== online.me;
  const waiting = isBotTurn || isRemoteTurn;
  // my side wears my saved look; the other side its own (online) or the default, never in my colour
  const [saved] = useState(loadSaved);
  const looks = useMemo((): [Look, Look] => {
    const mine = online ? online.me : 0;
    let other: Look = online?.peerLook ?? DEFAULT_LOOKS[1 - mine];
    if (other.color === saved.look.color) other = { ...other, color: saved.look.color === 'coral' ? 'cyan' : 'coral' };
    return mine === 0 ? [saved.look, other] : [other, saved.look];
  }, [online, online?.peerLook, saved]);
  const teamColor = (t: 0 | 1) => colorHex(looks[t].color);
  const shooterRef = useRef(shooter);
  shooterRef.current = shooter;

  // the active ring breathes
  useEffect(() => {
    if (flying || winner !== null) return;
    const id = setInterval(() => tick((n) => n + 1), 80);
    return () => clearInterval(id);
  }, [flying, winner]);

  /** the next soldier to shoot: the other side's next living soldier, in order */
  const nextTurn = useCallback((w: World, after: Soldier): number | null => {
    if (mode.kind === 'campaign') return w.soldiers[0].alive ? w.soldiers[0].id : null;
    const other = (1 - after.team) as 0 | 1;
    const side = w.soldiers.filter((s) => s.team === other && s.alive);
    if (!side.length) return null;
    return side[taken.current[other] % side.length].id;
  }, [mode.kind]);

  const reported = useRef(false);
  const finish = useCallback((w: World, team: 0 | 1, shotCount: number) => {
    setWinner(team);
    if (onResult && !reported.current) {
      reported.current = true;
      onResult(team === (online ? online.me : 0));
    }
    if (mode.kind === 'campaign' && team === 0) {
      const all = readStars();
      const st = starsFor(shotCount);
      const before = all[level!.id] ?? 0;
      if (st > before) saveStars({ ...all, [level!.id]: st });
      const total = Object.values({ ...all, [level!.id]: Math.max(st, before) }).reduce((a, b) => a + b, 0);
      progress.recordGame('funcwar', total, before ? 5 : 10 + st * 5);
    } else if (mode.kind === 'bot' && team === 0) {
      progress.recordGame('funcwar', 0, 15 + mode.level * 15);
    } else if (online && team === online.me) {
      progress.recordGame('funcwar', 0, 40);
    }
  }, [mode, level, online, onResult]);

  const fire = useCallback((formula: string, who: Soldier, remote = false) => {
    let f: (x: number) => number;
    try {
      f = compile(formula);
    } catch (e) {
      setError(e instanceof FormulaError ? (lang === 'ru' ? e.ru : e.en) : String(e));
      return;
    }
    setError('');
    setMeasure(null);
    if (online && !remote) online.sendShot(formula);
    taken.current[who.team]++;
    const shot: Shot = fly(world, who, f);
    const n = shots + (who.team === 0 ? 1 : 0);
    if (who.team === 0) setShots(n);
    // animate the path, then apply the result
    const total = shot.path.length;
    const dur = Math.min(1600, 300 + total * 2.2);
    const t0 = performance.now();
    const step = () => {
      const a = Math.min(1, (performance.now() - t0) / dur);
      setFlying({ path: shot.path, team: who.team, upto: Math.ceil(a * total) });
      if (a < 1) return requestAnimationFrame(step);
      const after = applyShot(world, shot);
      setFlying(null);
      setTrails((tr) => [...tr.slice(-5), { path: shot.path, team: who.team }]);
      setBlast({ at: shot.impact, age: 0, team: who.team });
      const b0 = performance.now();
      const fade = () => {
        const age = (performance.now() - b0) / 500;
        setBlast(age < 1 ? { at: shot.impact, age, team: who.team } : null);
        if (age < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
      const kills = shot.killed.map((id) => {
        const s = after.soldiers.find((x) => x.id === id)!;
        return s.alive && s.hp !== undefined ? `${s.name} −1❤` : `✕ ${s.name}`;
      });
      const why = { obstacle: L('в скалу', 'into rock'), edge: L('за край поля', 'off the field'), jump: L('разрыв графика', 'a break in the graph'), undefined: L('функция не определена', 'undefined value'), range: L('слишком далеко', 'too far') }[shot.end];
      setLog((l) => [{ team: who.team, name: who.name, src: formula, note: kills.length ? kills.join(', ') : why }, ...l].slice(0, 8));
      setWorld(after);
      const alive = (t: 0 | 1) => after.soldiers.some((s) => s.team === t && s.alive);
      if (!alive(1)) return finish(after, 0, n);
      if (!alive(0)) return finish(after, 1, n);
      const next = nextTurn(after, who);
      if (next === null) return finish(after, who.team, n);
      setTurnId(next);
      setTurnStart(performance.now());
      setSrc('');
    };
    requestAnimationFrame(step);
  }, [world, shots, lang, finish, nextTurn, online]);

  // the bot plays its turn after a short think
  useEffect(() => {
    if (!isBotTurn || flying || winner !== null || !shooter || mode.kind !== 'bot') return;
    setThinking(true);
    const id = setTimeout(() => {
      const formula = botMove(world, shooter, mode.level, mode.seed + log.length * 7919);
      setSrc(formula);
      setThinking(false);
      setTimeout(() => fire(formula, shooter), 500);
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBotTurn, turnId, flying, winner]);

  useEffect(() => {
    if (!online) return;
    return online.onShot((formula) => {
      const who = shooterRef.current;
      if (who && who.team !== online.me) fire(formula, who, true);
    });
  }, [online, fire]);

  const left = online && winner === null && !flying ? Math.max(0, TURN_SECONDS - (performance.now() - turnStart) / 1000) : null;
  // out of time on my turn: the shot goes straight ahead, y = 0
  useEffect(() => {
    if (left === 0 && online && shooter && shooter.team === online.me && !flying) fire('0', shooter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left === 0]);

  const insert = (k: string) => {
    const el = input.current;
    const at = el?.selectionStart ?? src.length;
    const next = src.slice(0, at) + k + src.slice(el?.selectionEnd ?? at);
    setSrc(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + k.length, at + k.length);
    });
  };

  const turnLabel = !shooter
    ? ''
    : online
      ? shooter.team === online.me
        ? L(`Твой ход · ${shooter.name}`, `Your turn · ${shooter.name}`)
        : L(`Ход соперника · ${shooter.name}`, `Opponent’s turn · ${shooter.name}`)
      : mode.kind === 'campaign'
      ? L('Твой выстрел', 'Your shot')
      : mode.kind === 'bot'
        ? shooter.team === 0
          ? L(`Твой ход · ${shooter.name}`, `Your turn · ${shooter.name}`)
          : L(`Ход бота · ${shooter.name}`, `Bot’s turn · ${shooter.name}`)
        : L(`Ходит ${shooter.team === 0 ? 'синий' : 'красный'} · ${shooter.name}`, `${shooter.team === 0 ? 'Blue' : 'Red'} to move · ${shooter.name}`);

  const won = online ? winner === online.me : winner === 0 || (mode.kind === 'local' && winner !== null);
  const stars = level && winner === 0 ? starsFor(shots) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" className="text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
        </Button>
        <h2 className="font-serif text-xl text-ink">{title ?? (level ? `${mode.kind === 'campaign' ? mode.level + 1 : ''}. ${level.title[lang]}` : mode.kind === 'bot' ? L('Против бота', 'Versus bot') : online ? L(`Дуэль ${world.soldiers.length / 2} на ${world.soldiers.length / 2}`, `Duel ${world.soldiers.length / 2} v ${world.soldiers.length / 2}`) : L('Вдвоём', 'Two players'))}</h2>
        {online && <span className="inline-flex items-center gap-1.5 text-xs text-ink-2"><span className="w-2 h-2 rounded-full" style={{ background: teamColor(online.me) }} />{online.me === 0 ? L('ты за синих', 'you are blue') : L('ты за красных', 'you are red')}</span>}
        <span className="ml-auto font-mono text-xs text-ink-3">{level ? L(`выстрелов: ${shots}`, `shots: ${shots}`) : ''}</span>
      </div>

      {level && (
        <p className="text-sm text-ink-2">
          {level.goal[lang]}{' '}
          <button type="button" onClick={() => setHint((h) => !h)} className="inline-flex items-center gap-1 text-accent hover:underline cursor-pointer">
            <Lightbulb className="w-3.5 h-3.5" /> {L('подсказка', 'hint')}
          </button>
          {hint && <span className="block mt-1 text-ink">{level.hint[lang]}</span>}
        </p>
      )}

      <Field world={world} active={winner === null ? shooter : null} trails={trails} flying={flying} blast={blast} onMeasure={setMeasure} measure={measure} lang={lang} looks={looks} themeId={saved.theme} />
      <p className="text-xs text-ink-3 -mt-1">
        {L('Наведи или нажми на поле — увидишь координаты точки относительно стрелка. x — расстояние вперёд от него, y — высота над ним.', 'Hover or tap the field to see a point in the shooter’s coordinates: x is the distance ahead, y the height above.')}
      </p>

      {winner === null ? (
        <Card className="p-4">
          <Card.Content className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: teamColor(shooter?.team ?? 0) }} />
              <span className="font-medium text-ink">{turnLabel}</span>
              {thinking && <span className="text-ink-3">{L('думает…', 'thinking…')}</span>}
              {left !== null && <span className={`ml-auto font-mono text-xs ${left < 10 ? 'text-[#CC2F35]' : 'text-ink-3'}`}>{Math.ceil(left)} {L('с', 's')}</span>}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (shooter && !flying && !waiting) fire(src, shooter);
              }}
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="font-mono text-ink-2 shrink-0">y =</span>
                <Input
                  ref={input}
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder={L('например 0,5x или 3sin(x/2)', 'e.g. 0.5x or 3sin(x/2)')}
                  aria-label={L('Функция выстрела', 'Shot function')}
                  className="flex-1 min-w-0 font-mono"
                  disabled={!!flying || waiting}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
              <Button type="submit" size="lg" className="text-sm font-medium" isDisabled={!!flying || waiting || !src.trim()}>
                <Flame className="w-4 h-4" /> {L('Огонь', 'Fire')}
              </Button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {KEYS.map((k) => (
                <button key={k} type="button" onClick={() => insert(k)} disabled={!!flying || waiting} className="h-8 min-w-9 px-2.5 rounded-lg border border-line bg-muted font-mono text-sm text-ink hover:border-accent cursor-pointer disabled:opacity-40">
                  {k}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-[#CC2F35]">{error}</p>}
            {online?.peerGone && <p className="text-sm text-[#CC2F35]">{L('Соперник отключился. Подожди немного — может, вернётся.', 'Your opponent disconnected. Wait a little, they may come back.')}</p>}
          </Card.Content>
        </Card>
      ) : (
        <Card className="p-6 relative overflow-hidden">
          {won && <Confetti count={40} />}
          <Card.Content className="flex flex-col items-center text-center gap-2">
            <div className="font-serif text-3xl text-ink">
              {mode.kind === 'local' ? L(`Победил ${winner === 0 ? 'синий' : 'красный'}!`, `${winner === 0 ? 'Blue' : 'Red'} wins!`) : online ? (won ? L('Победа!', 'Victory!') : L('Соперник победил', 'Your opponent won')) : winner === 0 ? L('Победа!', 'Victory!') : L('Бот победил', 'The bot won')}
            </div>
            {level && (
              <div className="flex gap-1" aria-label={L(`${stars} из 3 звёзд`, `${stars} of 3 stars`)}>
                {[1, 2, 3].map((i) => (
                  <Star key={i} className={`w-8 h-8 ${i <= stars ? 'text-[#F5A524] fill-[#F5A524]' : 'text-ink-3'}`} />
                ))}
              </div>
            )}
            {level && <p className="text-sm text-ink-2">{L(`Выстрелов: ${shots}. Три звезды — за победу с одного выстрела.`, `Shots: ${shots}. Three stars for a one-shot win.`)}</p>}
            {resultNote && <div className="text-sm text-ink">{resultNote}</div>}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {onNext && winner === 0 && (
                <Button size="lg" className="text-sm font-medium" onPress={onNext}>
                  {L('Следующий уровень →', 'Next level →')}
                </Button>
              )}
              {onRestart ? (
                <Button variant="outline" size="lg" className="text-sm" onPress={onRestart}>
                  <RotateCcw className="w-4 h-4" /> {online ? L('Реванш', 'Rematch') : L('Ещё раз', 'Again')}
                </Button>
              ) : (
                online && <p className="w-full text-sm text-ink-3">{L('Реванш запускает тот, кто создал дуэль.', 'The duel’s creator can start a rematch.')}</p>
              )}
              {level && (
                <Button variant="ghost" size="lg" className="text-sm" onPress={() => window.dispatchEvent(new CustomEvent('open-topic', { detail: level.topic }))}>
                  <BookOpen className="w-4 h-4" /> {L('Тема в учебнике', 'Topic in the textbook')}
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {log.length > 0 && (
        <div className="flex flex-col gap-1 text-sm">
          {log.map((l, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: teamColor(l.team) }} />
              <span className="text-ink-3 shrink-0">{l.name}:</span>
              <span className="font-mono text-ink truncate">y = {l.src}</span>
              <span className="text-ink-3 shrink-0 ml-auto">{l.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- menu ---------------- */

export const FuncWar: React.FC<{ lang: Lang; onExit: () => void; join?: string | null }> = ({ lang, onExit, join }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [mode, setMode] = useState<Mode | null>(null);
  // a duel link (?fw=12345) opens straight into that room; 'host' opens a new one
  const [duel, setDuel] = useState<string | null>(join && /^\d{5}$/.test(join) ? join : null);
  const [round, setRound] = useState(0);
  const stars = useMemo(readStars, [mode]);
  const unlocked = (i: number) => i === 0 || (stars[LEVELS[i - 1].id] ?? 0) > 0;
  const seed = () => Math.floor(Math.random() * 1e9);

  const [ranked, setRanked] = useState(false);
  const [screen, setScreen] = useState<'workshop' | 'guide' | null>(null);
  if (screen === 'workshop') return <Workshop lang={lang} onExit={() => setScreen(null)} />;
  if (screen === 'guide') return <Guide lang={lang} onExit={() => setScreen(null)} />;
  if (ranked) return <Ranked lang={lang} onExit={() => setRanked(false)} />;
  if (duel) return <OnlineDuel lang={lang} join={duel === 'host' ? undefined : duel} onExit={() => setDuel(null)} />;

  if (mode)
    return (
      <Battle
        key={round}
        lang={lang}
        mode={mode}
        onExit={() => setMode(null)}
        onRestart={() => {
          if (mode.kind !== 'campaign') setMode({ ...mode, seed: seed() });
          setRound((r) => r + 1);
        }}
        onNext={mode.kind === 'campaign' && mode.level < LEVELS.length - 1 ? () => (setMode({ kind: 'campaign', level: mode.level + 1 }), setRound((r) => r + 1)) : undefined}
      />
    );

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-sm" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" /> {L('Все игры', 'All games')}
        </Button>
      </div>
      <header>
        <h1 className="font-serif text-[34px] leading-tight text-ink inline-flex items-center gap-2">
          <Crosshair className="w-8 h-8 text-accent" /> {L('Бой функций', 'Function Wars')}
        </h1>
        <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">
          {L('Снаряд летит по графику функции, которую ты впишешь. Обогни скалы и попади в соперника. Промах выбивает в скале кратер — укрытия рушатся.', 'Your shot flies along the graph of the function you type. Curve round the rocks and hit the enemy; a miss blasts a crater, so cover crumbles.')}
        </p>
      </header>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-ink">{L('Кампания: от прямой до экспоненты', 'Campaign: from lines to exponentials')}</h2>
          <span className="text-sm text-ink-3 inline-flex items-center gap-1">
            <Star className="w-4 h-4 text-[#F5A524] fill-[#F5A524]" /> {totalStars}/{LEVELS.length * 3}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LEVELS.map((l, i) => {
            const open = unlocked(i);
            const st = stars[l.id] ?? 0;
            return (
              <button
                key={l.id}
                type="button"
                disabled={!open}
                onClick={() => setMode({ kind: 'campaign', level: i })}
                className="text-left p-3 rounded-xl border border-line bg-surface hover:border-accent transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-3">{i + 1}</span>
                  {open ? (
                    <span className="flex">
                      {[1, 2, 3].map((k) => (
                        <Star key={k} className={`w-3.5 h-3.5 ${k <= st ? 'text-[#F5A524] fill-[#F5A524]' : 'text-ink-3'}`} />
                      ))}
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-ink-3" />
                  )}
                </div>
                <div className="mt-1 text-sm font-medium text-ink leading-tight">{l.title[lang]}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        <button type="button" onClick={() => setScreen('workshop')} className="text-left p-4 rounded-2xl border border-line bg-surface hover:border-accent cursor-pointer flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0"><Palette className="w-5 h-5" /></span>
          <span>
            <span className="block font-medium text-ink">{L('Мастерская', 'Workshop')}</span>
            <span className="block text-sm text-ink-2">{L('Цвета, следы, шапки, лица, взрывы и поля — только внешний вид', 'Colours, trails, hats, faces, blasts and fields — looks only')}</span>
          </span>
        </button>
        <button type="button" onClick={() => setScreen('guide')} className="text-left p-4 rounded-2xl border border-line bg-surface hover:border-accent cursor-pointer flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-[#FFF4DA] text-[#B5651D] flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5" /></span>
          <span>
            <span className="block font-medium text-ink">{L('Гайд: продвинутые графики', 'Guide: advanced graphs')}</span>
            <span className="block text-sm text-ink-2">{L('Колокол Гаусса, ступенька th, сумма графиков, две цели одной параболой. 2 главы бесплатно, 9 с Pro', 'Gaussian bumps, tanh steps, adding graphs, two targets with one parabola. 2 chapters free, 9 with Pro')}</span>
          </span>
        </button>
      </div>

      <RankedCard lang={lang} onPlay={() => setRanked(true)} />

      <Card className="p-5">
        <Card.Content className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2">
              <Swords className="w-5 h-5 text-accent" /> {L('Дуэль по ссылке', 'Duel by link')}
            </h2>
            <p className="mt-1 text-sm text-ink-2">{L('1 на 1, 2 на 2 или 3 на 3 с другом онлайн. У каждого бойца 3 жизни, а первым стреляет тот, кто быстрее решит задачу на функцию.', '1 v 1, 2 v 2 or 3 v 3 with a friend online. Every soldier has 3 lives, and whoever solves a function question first shoots first.')}</p>
          </div>
          <Button size="lg" className="text-sm font-medium" onPress={() => setDuel('host')}>
            {L('Создать дуэль', 'Create a duel')}
          </Button>
        </Card.Content>
      </Card>

      <section className="grid sm:grid-cols-2 gap-3">
        <Card className="p-5">
          <Card.Content className="flex flex-col gap-3">
            <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" /> {L('Против бота', 'Versus the bot')}
            </h2>
            <p className="text-sm text-ink-2">{L('Двое на двое на случайном поле. Бот тоже пишет функции — и показывает какие.', 'Two on two on a random field. The bot writes functions too, and shows you which.')}</p>
            <div className="flex flex-wrap gap-2">
              {([0, 1, 2] as const).map((lv) => (
                <Button key={lv} variant={lv === 1 ? 'primary' : 'outline'} className="text-sm" onPress={() => setMode({ kind: 'bot', level: lv, seed: seed() })}>
                  {[L('Новичок', 'Rookie'), L('Боец', 'Fighter'), L('Профи', 'Pro')][lv]}
                </Button>
              ))}
            </div>
          </Card.Content>
        </Card>
        <Card className="p-5">
          <Card.Content className="flex flex-col gap-3">
            <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> {L('Вдвоём на одном устройстве', 'Two players, one device')}
            </h2>
            <p className="text-sm text-ink-2">{L('Синие против красных, ходите по очереди. Отлично для урока на проекторе.', 'Blue against red, taking turns. Great on a classroom projector.')}</p>
            <Button variant="outline" className="text-sm self-start" onPress={() => setMode({ kind: 'local', seed: seed() })}>
              {L('Начать бой', 'Start the battle')}
            </Button>
          </Card.Content>
        </Card>
      </section>

      <Card className="p-5">
        <Card.Content className="text-sm text-ink-2 flex flex-col gap-1.5">
          <h3 className="font-medium text-ink">{L('Как писать функции', 'How to write functions')}</h3>
          <p>{L('Пиши как в тетради: 2x, 0,5x², x^3, 3sin(x/2), |x−4|, sqrt(x), e^(x/5), (x+1)(x−3).', 'Write it like in your notebook: 2x, 0.5x², x^3, 3sin(x/2), |x−4|, sqrt(x), e^(x/5), (x+1)(x−3).')}</p>
          <p>{L('График сдвигается так, чтобы начинаться у стрелка. x — это расстояние вперёд от него, y — высота над ним, так что одна и та же формула работает за любую сторону.', 'The graph is shifted to start at the shooter: x is the distance ahead of them, y the height above, so one formula works for either side.')}</p>
          <p>{L('Выстрел останавливается в скале, за краем поля, на разрыве графика (например, у tg x) и там, где функция не определена.', 'A shot stops in rock, off the field, at a break in the graph (like tan x) and where the function is undefined.')}</p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default FuncWar;
