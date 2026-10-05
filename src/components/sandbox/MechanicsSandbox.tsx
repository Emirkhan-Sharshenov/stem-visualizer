import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Anchor as AnchorIcon, Circle, Hand, Link2, Pause, Play, RotateCcw, Square, StepForward, Trash2, Triangle, Waves } from 'lucide-react';
import { Body, cloneScene, inclinePoints, Link, ropePath, Scene, Solid, Vec, World } from './physics';
import { ball, block, COLORS, PRESETS } from './scenes';
import { drawWorld, FORCE_STYLE, toWorld, View } from './draw';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
type Tool = 'hand' | 'rope' | 'spring' | 'delete';

const GRAVITY = [
  { g: 9.8, ru: 'Земля', en: 'Earth' },
  { g: 1.62, ru: 'Луна', en: 'Moon' },
  { g: 3.71, ru: 'Марс', en: 'Mars' },
  { g: 24.8, ru: 'Юпитер', en: 'Jupiter' },
  { g: 0, ru: 'Невесомость', en: 'Zero g' },
];

const fmt = (x: number, d = 2) => (Math.abs(x) < 0.005 ? '0' : x.toFixed(d)).replace('.', ',');

/* ---------- small form controls ---------- */

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit?: string; digits?: number; onChange: (v: number) => void }> = ({ label, value, min, max, step, unit, digits = 2, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="flex justify-between text-xs text-ink-2">
      <span>{label}</span>
      <span className="font-mono text-ink">
        {fmt(value, digits)} {unit}
      </span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" />
  </label>
);

const Check: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#2F5BFF]" />
    {label}
  </label>
);

const card = 'bg-surface border border-line rounded-xl p-4';
const h3 = 'text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3';

/* ---------- speed graph ---------- */

const Graph: React.FC<{ data: { t: number; v: number }[]; color: string }> = ({ data, color }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth * dpr;
    const h = c.clientHeight * dpr;
    c.width = w;
    c.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#E5E5E0';
    ctx.lineWidth = dpr;
    ctx.beginPath();
    ctx.moveTo(0, h - 1);
    ctx.lineTo(w, h - 1);
    ctx.stroke();
    if (data.length < 2) return;
    const t0 = data[0].t;
    const t1 = Math.max(t0 + 1, data[data.length - 1].t);
    const vmax = Math.max(0.5, ...data.map((d) => d.v)) * 1.15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = ((d.t - t0) / (t1 - t0)) * w;
      const y = h - (d.v / vmax) * (h - 4 * dpr) - 2 * dpr;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#8A8A85';
    ctx.font = `${10 * dpr}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${fmt(vmax / 1.15, 1)} м/с`, 4 * dpr, 12 * dpr);
  }, [data, color]);
  return <canvas ref={ref} className="w-full h-24 block" />;
};

/* ---------- main ---------- */

export const MechanicsSandbox: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [presetId, setPresetId] = useState('incline');
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const worldRef = useRef<World>(new World(preset.make()));
  const snapshot = useRef<Scene>(cloneScene(worldRef.current.scene));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tool, setTool] = useState<Tool>('hand');
  const [selected, setSelected] = useState<string | null>(preset.focus ?? null);
  const [pending, setPending] = useState<string[]>([]);
  const [showForces, setShowForces] = useState(true);
  const [showVelocity, setShowVelocity] = useState(false);
  const [, setTick] = useState(0);
  const [history, setHistory] = useState<{ t: number; v: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<View>({ s: 60, w: 720, h: 360, ox: 0, oy: -0.45 });
  /** visible width in metres: the whole room on wide screens, ~7 m on phones (the camera then follows) */
  const spanRef = useRef(12);
  const pointer = useRef<Vec | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const tilt = useRef<Record<string, number>>({});
  const runningRef = useRef(running);
  runningRef.current = running;
  const ids = useRef(100);
  const world = worldRef.current;
  const scene = world.scene;

  useEffect(() => progress.recordLab('sandbox-mechanics'), []);

  const refresh = () => setTick((n) => n + 1);

  /** after any edit while stopped: remember this as the starting state */
  const edited = useCallback(() => {
    const w = worldRef.current;
    if (!runningRef.current) {
      w.t = 0;
      w.traces = {};
      setHistory([]);
      snapshot.current = cloneScene(w.scene);
    }
    w.rebase();
    refresh();
  }, []);

  const load = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    worldRef.current = new World(p.make());
    snapshot.current = cloneScene(worldRef.current.scene);
    setPresetId(id);
    setSelected(p.focus ?? null);
    setPending([]);
    setRunning(false);
    setHistory([]);
    tilt.current = {};
  };

  const reset = () => {
    worldRef.current = new World(cloneScene(snapshot.current));
    setRunning(false);
    setHistory([]);
    tilt.current = {};
    refresh();
  };

  /* ---------- sizing and the animation loop ---------- */

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const sc = worldRef.current.scene;
      const dpr = window.devicePixelRatio || 1;
      const cssW = c.clientWidth;
      const span = cssW < 640 ? Math.min(sc.W, 7) : sc.W;
      spanRef.current = span;
      const s = (cssW * dpr) / span;
      c.width = Math.round(cssW * dpr);
      c.height = Math.round((sc.H + 0.45) * s);
      viewRef.current = { ...viewRef.current, s, w: c.width, h: c.height, oy: -0.45 };
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [presetId]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let uiClock = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = worldRef.current;
      if (runningRef.current) {
        acc += dt * speed;
        while (acc >= 1 / 120) {
          w.step(1 / 120, 6);
          acc -= 1 / 120;
        }
      } else if (!w.held) {
        // paused: still show the forces acting right now
        w.probe();
      }
      // blocks lie flat on whatever they rest on
      for (const b of w.scene.bodies) {
        const N = w.forces[b.id]?.normal;
        const target = N && Math.hypot(N.x, N.y) > 0.05 ? Math.atan2(N.y, N.x) - Math.PI / 2 : 0;
        const cur = tilt.current[b.id] ?? target;
        tilt.current[b.id] = cur + (target - cur) * 0.2;
      }
      // camera: on phones follow the selected body (or the middle of the scene)
      const span = spanRef.current;
      const W = w.scene.W;
      if (span >= W) viewRef.current.ox = 0;
      else {
        const sb = selected ? w.body(selected) : undefined;
        const xs = [...w.scene.bodies.map((b) => b.x), ...w.scene.anchors.map((a) => a.x), ...w.scene.solids.map((so) => so.x + so.w / 2)];
        const clampX = (x: number) => Math.max(0, Math.min(W - span, x));
        const cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : W / 2;
        let target = drag.current ? viewRef.current.ox : clampX(cx - span / 2);
        // keep the followed body in the frame
        if (sb && !drag.current) {
          if (sb.x < target + 0.8) target = sb.x - 0.8;
          if (sb.x > target + span - 0.8) target = sb.x - span + 0.8;
          target = clampX(target);
        }
        viewRef.current.ox += (target - viewRef.current.ox) * 0.15;
      }
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        const vw = viewRef.current;
        drawWorld(ctx, w, vw, {
          lang,
          selected,
          pending,
          pointer: pointer.current,
          showForces,
          showVelocity,
          tilt: tilt.current,
          font: Math.max(11 * (window.devicePixelRatio || 1), vw.w / 70),
        });
      }
      uiClock += dt;
      if (uiClock > 0.1) {
        uiClock = 0;
        refresh();
        if (runningRef.current && selected) {
          const b = w.body(selected);
          if (b) setHistory((hst) => [...hst.filter((d) => d.t > w.t - 10), { t: w.t, v: Math.hypot(b.vx, b.vy) }]);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lang, selected, pending, showForces, showVelocity, speed]);

  /* ---------- picking ---------- */

  const pick = (p: Vec): { id: string; type: 'body' | 'anchor' | 'solid' | 'link' } | null => {
    const w = worldRef.current;
    for (const b of [...w.scene.bodies].reverse()) if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 0.12) return { id: b.id, type: 'body' };
    for (const a of w.scene.anchors) if (Math.hypot(a.x - p.x, a.y - p.y) < 0.4) return { id: a.id, type: 'anchor' };
    for (const l of w.scene.links) {
      const a = w.point(l.a);
      const b = w.point(l.b);
      const v = l.kind === 'rope' && l.via ? w.point(l.via) : null;
      const pts = v && a && b ? [a, v, b] : a && b ? [a, b] : [];
      for (let i = 0; i + 1 < pts.length; i++) if (segDist(p, pts[i], pts[i + 1]) < 0.15) return { id: l.id, type: 'link' };
    }
    for (const s of w.scene.solids) {
      if (s.kind === 'incline' && inPoly(p, inclinePoints(s))) return { id: s.id, type: 'solid' };
      if (s.kind === 'table' && p.x > s.x && p.x < s.x + s.w && p.y > s.h - 0.25 && p.y < s.h + 0.1) return { id: s.id, type: 'solid' };
    }
    return null;
  };

  const local = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    return toWorld(viewRef.current, (e.clientX - r.left) * k, (e.clientY - r.top) * k);
  };

  const connect = (id: string) => {
    const w = worldRef.current;
    const isPulley = w.scene.anchors.some((a) => a.id === id && a.kind === 'pulley');
    const next = [...pending, id];
    if (tool === 'rope' && next.length === 2 && isPulley) return setPending(next);
    if (next.length < 2) return setPending(next);
    const [a, b, c] = next.length === 3 ? [next[0], next[2], next[1]] : [next[0], next[1], undefined];
    if (a === b) return setPending([]);
    const pa = w.point(a)!;
    const pb = w.point(b)!;
    const pv = c ? w.point(c) : null;
    const id2 = `${tool === 'rope' ? 'R' : 'K'}${ids.current++}`;
    const link: Link =
      tool === 'rope' ? { id: id2, kind: 'rope', a, b, via: c, L: ropePath(pa, pb, pv) } : { id: id2, kind: 'spring', a, b, k: 30, L0: Math.max(0.3, Math.hypot(pa.x - pb.x, pa.y - pb.y)) };
    w.scene.links.push(link);
    setPending([]);
    setSelected(id2);
    edited();
  };

  const remove = (id: string) => {
    const sc = worldRef.current.scene;
    sc.bodies = sc.bodies.filter((b) => b.id !== id);
    sc.anchors = sc.anchors.filter((a) => a.id !== id);
    sc.solids = sc.solids.filter((s) => s.id !== id);
    sc.links = sc.links.filter((l) => l.id !== id && l.a !== id && l.b !== id && (l.kind !== 'rope' || l.via !== id));
    if (selected === id) setSelected(null);
    edited();
  };

  const onDown = (e: React.PointerEvent) => {
    const p = local(e);
    pointer.current = p;
    const hit = pick(p);
    if (tool === 'delete') return hit && remove(hit.id);
    if (tool === 'rope' || tool === 'spring') {
      if (hit && (hit.type === 'body' || hit.type === 'anchor')) connect(hit.id);
      else setPending([]);
      return;
    }
    setSelected(hit?.id ?? null);
    if (!hit || hit.type === 'link') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const w = worldRef.current;
    const obj: { x: number; y?: number; h?: number } | undefined = w.body(hit.id) ?? w.scene.anchors.find((a) => a.id === hit.id) ?? w.scene.solids.find((s) => s.id === hit.id);
    if (!obj) return;
    drag.current = { id: hit.id, dx: p.x - obj.x, dy: p.y - (obj.y ?? (obj as { h: number }).h ?? 0) };
    if (hit.type === 'body') w.held = { id: hit.id, x: p.x - drag.current.dx, y: p.y - drag.current.dy };
  };

  const onMove = (e: React.PointerEvent) => {
    const p = local(e);
    pointer.current = p;
    const d = drag.current;
    if (!d) return;
    const w = worldRef.current;
    const x = p.x - d.dx;
    const y = p.y - d.dy;
    const b = w.body(d.id);
    if (b) {
      w.held = { id: b.id, x, y: Math.max(b.r, y) };
      if (!runningRef.current) {
        b.x = Math.max(b.r, Math.min(w.scene.W - b.r, x));
        b.y = Math.max(b.r, y);
        b.vx = b.vy = 0;
      }
      return;
    }
    const a = w.scene.anchors.find((q) => q.id === d.id);
    if (a) {
      a.x = Math.max(0.3, Math.min(w.scene.W - 0.3, x));
      a.y = Math.max(0.5, Math.min(w.scene.H, y));
      return;
    }
    const s = w.scene.solids.find((q) => q.id === d.id);
    if (s) {
      s.x = Math.max(0, Math.min(w.scene.W - s.w, x));
      if (s.kind === 'table') s.h = Math.max(0.6, Math.min(w.scene.H - 1, y));
    }
  };

  const onUp = () => {
    const w = worldRef.current;
    if (drag.current) {
      if (!runningRef.current) {
        // a moved body or anchor: ropes take the new geometry
        for (const l of w.scene.links) {
          if (l.kind !== 'rope') continue;
          const pa = w.point(l.a);
          const pb = w.point(l.b);
          if (pa && pb) l.L = ropePath(pa, pb, l.via ? w.point(l.via) : null);
        }
      }
      w.held = null;
      drag.current = null;
      edited();
    }
  };

  /* ---------- adding things ---------- */

  const add = (kind: 'block' | 'ball' | 'incline' | 'table' | 'pulley' | 'hook') => {
    const w = worldRef.current;
    const sc = w.scene;
    const id = `${kind[0].toUpperCase()}${ids.current++}`;
    const color = COLORS[sc.bodies.length % COLORS.length];
    if (kind === 'block' || kind === 'ball') {
      const label = String.fromCharCode(65 + (sc.bodies.length % 26));
      const bid = sc.bodies.some((b) => b.id === label) ? id : label;
      sc.bodies.push((kind === 'block' ? block : ball)(bid, sc.W / 2 + (Math.random() - 0.5) * 2, sc.H * 0.7, 1, color));
      setSelected(bid);
    } else if (kind === 'incline') {
      sc.solids.push({ id, kind: 'incline', x: 2, w: 5, deg: 30, flip: false, mu: 0.3 });
      setSelected(id);
    } else if (kind === 'table') {
      sc.solids.push({ id, kind: 'table', x: 2, w: 4, h: 2.5, mu: 0.3 });
      setSelected(id);
    } else {
      sc.anchors.push({ id, kind, x: sc.W * 0.7, y: sc.H - 0.6 });
      setSelected(id);
    }
    setTool('hand');
    edited();
  };

  /* ---------- derived ---------- */

  const stats = world.stats();
  const selBody = selected ? world.body(selected) : undefined;
  const selAnchor = selected ? scene.anchors.find((a) => a.id === selected) : undefined;
  const selSolid = selected ? scene.solids.find((s) => s.id === selected) : undefined;
  const selLink = selected ? scene.links.find((l) => l.id === selected) : undefined;
  const total = stats.kinetic + stats.potential + stats.elastic + stats.lost;
  const forceRows = useMemo(() => {
    if (!selBody) return [];
    const F = stats.forces[selBody.id];
    if (!F) return [];
    return Object.entries(FORCE_STYLE)
      .map(([k, st]) => {
        const v = F[k as keyof typeof F];
        return { k, st, mag: Math.hypot(v.x, v.y) };
      })
      .filter((r) => r.mag > 0.01);
  }, [selBody, stats.forces]);

  const setBody = (patch: Partial<Body>) => {
    if (!selBody) return;
    Object.assign(selBody, patch);
    if (patch.m !== undefined) selBody.r = selBody.kind === 'block' ? 0.25 + Math.min(0.2, selBody.m * 0.03) : 0.2 + Math.min(0.15, selBody.m * 0.03);
    edited();
  };
  const setSolid = (patch: Partial<Solid>) => {
    if (!selSolid) return;
    Object.assign(selSolid, patch);
    edited();
  };
  const setLink = (patch: Partial<Link>) => {
    if (!selLink) return;
    Object.assign(selLink, patch);
    edited();
  };
  const setLaws = (patch: Partial<Scene['laws']>) => {
    Object.assign(scene.laws, patch);
    edited();
  };

  const toolBtn = (id: Tool, icon: React.ReactNode, text: string) => (
    <button
      onClick={() => {
        setTool(id);
        setPending([]);
      }}
      className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${tool === id ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
      style={tool === id ? { color: '#fff' } : undefined}
    >
      {icon}
      {text}
    </button>
  );
  const addBtn = (kind: Parameters<typeof add>[0], icon: React.ReactNode, text: string) => (
    <button onClick={() => add(kind)} className="h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border border-dashed border-line-strong bg-surface text-ink hover:bg-muted cursor-pointer">
      {icon}
      {text}
    </button>
  );

  const toolHint =
    tool === 'rope'
      ? pending.length === 0
        ? L('Нить: нажми на первое тело или крючок.', 'Rope: tap the first body or hook.')
        : pending.length === 1
          ? L('Теперь на второе тело — или сначала на блок, чтобы перекинуть нить через него.', 'Now tap the second body, or a pulley first to run the rope over it.')
          : L('Нить идёт через блок. Нажми на второе тело.', 'The rope runs over the pulley. Tap the second body.')
      : tool === 'spring'
        ? pending.length === 0
          ? L('Пружина: нажми на первое тело или крючок.', 'Spring: tap the first body or hook.')
          : L('Теперь на второе.', 'Now the second one.')
        : tool === 'delete'
          ? L('Нажми на то, что нужно удалить.', 'Tap what you want to delete.')
          : L('Перетаскивай тела, блоки и плоскости. Во время опыта тело можно бросить.', 'Drag bodies, pulleys and inclines. While running you can throw a body.');

  return (
    <div className="flex flex-col gap-4">
      {/* presets */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => load(p.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-sm border cursor-pointer ${presetId === p.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={presetId === p.id ? { color: '#fff' } : undefined}
          >
            {p.title[lang]}
          </button>
        ))}
      </div>

      <div className={`${card} !py-3`}>
        <div className="text-xs font-medium text-accent">{preset.laws[lang]}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{preset.hint[lang]}</p>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            if (!running) {
              snapshot.current = world.t === 0 ? cloneScene(scene) : snapshot.current;
              world.rebase();
            }
            setRunning(!running);
          }}
          className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
          style={{ color: '#fff' }}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? L('Пауза', 'Pause') : L('Пуск', 'Run')}
        </button>
        <button onClick={() => { world.step(1 / 30, 8); refresh(); }} disabled={running} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted disabled:opacity-40 cursor-pointer" title={L('Шаг 1/30 с', 'Step 1/30 s')}>
          <StepForward className="w-4 h-4" />
        </button>
        <button onClick={reset} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
          <RotateCcw className="w-4 h-4" />
          {L('Сначала', 'Reset')}
        </button>
        <div className="flex p-0.5 rounded-lg bg-muted border border-line">
          {[0.25, 0.5, 1].map((k) => (
            <button key={k} onClick={() => setSpeed(k)} className={`h-8 px-2.5 rounded-md text-xs font-mono cursor-pointer ${speed === k ? 'bg-surface border border-line text-ink' : 'text-ink-2'}`}>
              ×{String(k).replace('.', ',')}
            </button>
          ))}
        </div>
        <span className="w-px h-6 bg-line mx-1" />
        <Check label={L('Силы', 'Forces')} checked={showForces} onChange={setShowForces} />
        <Check label={L('Скорость', 'Velocity')} checked={showVelocity} onChange={setShowVelocity} />
      </div>

      {/* stage */}
      <div className="rounded-xl overflow-hidden border border-[#1F2126]">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => (pointer.current = null)}
          className={`block w-full touch-none select-none ${tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
        />
      </div>

      {/* building tools */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {toolBtn('hand', <Hand className="w-4 h-4" />, L('Двигать', 'Move'))}
          {toolBtn('rope', <Link2 className="w-4 h-4" />, L('Нить', 'Rope'))}
          {toolBtn('spring', <Waves className="w-4 h-4" />, L('Пружина', 'Spring'))}
          {toolBtn('delete', <Trash2 className="w-4 h-4" />, L('Удалить', 'Delete'))}
          <span className="w-px h-9 bg-line mx-1" />
          {addBtn('block', <Square className="w-4 h-4" />, L('Брусок', 'Block'))}
          {addBtn('ball', <Circle className="w-4 h-4" />, L('Шар', 'Ball'))}
          {addBtn('incline', <Triangle className="w-4 h-4" />, L('Наклонная', 'Incline'))}
          {addBtn('table', <span className="w-4 text-center leading-none">▭</span>, L('Стол', 'Table'))}
          {addBtn('pulley', <span className="w-4 text-center leading-none">◎</span>, L('Блок', 'Pulley'))}
          {addBtn('hook', <AnchorIcon className="w-4 h-4" />, L('Крючок', 'Hook'))}
        </div>
        <p className="text-xs text-ink-3">{toolHint}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 items-start">
        {/* laws */}
        <div className={card}>
          <h3 className={h3}>{L('Законы', 'Laws')}</h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-xs text-ink-2 mb-1.5">{L('Тяготение', 'Gravity')}: <span className="font-mono text-ink">g = {fmt(scene.laws.g)} м/с²</span></div>
              <div className="flex flex-wrap gap-1.5">
                {GRAVITY.map((g) => (
                  <button key={g.ru} onClick={() => setLaws({ g: g.g })} className={`h-8 px-2.5 rounded-md text-xs border cursor-pointer ${scene.laws.g === g.g ? 'bg-accent border-accent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`} style={scene.laws.g === g.g ? { color: '#fff' } : undefined}>
                    {g[lang]}
                  </button>
                ))}
              </div>
            </div>
            <Check label={L('Трение', 'Friction')} checked={scene.laws.friction} onChange={(v) => setLaws({ friction: v })} />
            {scene.laws.friction && <Slider label={L('μ пола', 'Floor μ')} value={scene.laws.groundMu} min={0} max={1} step={0.05} onChange={(v) => setLaws({ groundMu: v })} />}
            <Check label={L('Сопротивление воздуха', 'Air resistance')} checked={scene.laws.air} onChange={(v) => setLaws({ air: v })} />
            {scene.laws.air && <Slider label={L('Сила сопротивления', 'Drag strength')} value={scene.laws.airK} min={0.05} max={3} step={0.05} onChange={(v) => setLaws({ airK: v })} />}
            <Slider label={L('Удары: 0 — неупругий, 1 — упругий', 'Impacts: 0 inelastic, 1 elastic')} value={scene.laws.e} min={0} max={1} step={0.05} onChange={(v) => setLaws({ e: v })} />
          </div>
        </div>

        {/* inspector */}
        <div className={card}>
          <h3 className={h3}>{L('Выбранный объект', 'Selected')}</h3>
          {selBody ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-ink">
                {selBody.kind === 'block' ? L('Брусок', 'Block') : L('Шар', 'Ball')} {selBody.id.length === 1 ? selBody.id : ''}
              </div>
              <Slider label={L('Масса', 'Mass')} value={selBody.m} min={0.1} max={10} step={0.1} unit={L('кг', 'kg')} digits={1} onChange={(m) => setBody({ m })} />
              <Slider label={L('Сила тяги F', 'Push F')} value={selBody.F} min={0} max={60} step={0.5} unit={L('Н', 'N')} digits={1} onChange={(F) => setBody({ F })} />
              {selBody.F > 0 && <Slider label={L('Направление тяги', 'Push direction')} value={selBody.Fdeg} min={-180} max={180} step={5} unit="°" digits={0} onChange={(Fdeg) => setBody({ Fdeg })} />}
              {!running && (
                <>
                  <Slider
                    label={L('Начальная скорость', 'Initial speed')}
                    value={Math.hypot(selBody.vx, selBody.vy)}
                    min={0}
                    max={20}
                    step={0.5}
                    unit={L('м/с', 'm/s')}
                    digits={1}
                    onChange={(sp) => {
                      const a = Math.atan2(selBody.vy, selBody.vx) || 0;
                      setBody({ vx: sp * Math.cos(a), vy: sp * Math.sin(a) });
                    }}
                  />
                  <Slider
                    label={L('Угол начальной скорости', 'Launch angle')}
                    value={Math.round((Math.atan2(selBody.vy, selBody.vx) * 180) / Math.PI) || 0}
                    min={-180}
                    max={180}
                    step={5}
                    unit="°"
                    digits={0}
                    onChange={(deg) => {
                      const sp = Math.hypot(selBody.vx, selBody.vy);
                      setBody({ vx: sp * Math.cos((deg * Math.PI) / 180), vy: sp * Math.sin((deg * Math.PI) / 180) });
                    }}
                  />
                </>
              )}
              <Check label={L('Рисовать траекторию', 'Draw the path')} checked={selBody.trace} onChange={(trace) => setBody({ trace })} />
            </div>
          ) : selSolid?.kind === 'incline' ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-ink">{L('Наклонная плоскость', 'Incline')}</div>
              <Slider label={L('Угол α', 'Angle α')} value={selSolid.deg} min={5} max={60} step={1} unit="°" digits={0} onChange={(deg) => setSolid({ deg })} />
              <Slider label={L('Коэффициент трения μ', 'Friction μ')} value={selSolid.mu} min={0} max={1} step={0.05} onChange={(mu) => setSolid({ mu })} />
              <Slider label={L('Длина основания', 'Base length')} value={selSolid.w} min={2} max={10} step={0.5} unit={L('м', 'm')} digits={1} onChange={(w) => setSolid({ w })} />
              <p className="text-xs text-ink-3">
                tg α = <span className="font-mono text-ink">{fmt(Math.tan((selSolid.deg * Math.PI) / 180))}</span> {Math.tan((selSolid.deg * Math.PI) / 180) > selSolid.mu ? '>' : '≤'} μ = <span className="font-mono text-ink">{fmt(selSolid.mu)}</span> —{' '}
                {Math.tan((selSolid.deg * Math.PI) / 180) > selSolid.mu ? L('брусок соскользнёт', 'the block slides') : L('брусок удержится', 'the block holds')}
              </p>
              <Check label={L('Зеркально', 'Mirror')} checked={selSolid.flip} onChange={(flip) => setSolid({ flip })} />
            </div>
          ) : selSolid?.kind === 'table' ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-ink">{L('Стол', 'Table')}</div>
              <Slider label={L('Высота', 'Height')} value={selSolid.h} min={0.6} max={5} step={0.1} unit={L('м', 'm')} digits={1} onChange={(h) => setSolid({ h })} />
              <Slider label={L('Длина', 'Length')} value={selSolid.w} min={1} max={10} step={0.5} unit={L('м', 'm')} digits={1} onChange={(w) => setSolid({ w })} />
              <Slider label={L('Коэффициент трения μ', 'Friction μ')} value={selSolid.mu} min={0} max={1} step={0.05} onChange={(mu) => setSolid({ mu })} />
            </div>
          ) : selLink?.kind === 'spring' ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-ink">{L('Пружина', 'Spring')}</div>
              <Slider label={L('Жёсткость k', 'Stiffness k')} value={selLink.k} min={2} max={300} step={1} unit={L('Н/м', 'N/m')} digits={0} onChange={(k) => setLink({ k })} />
              <Slider label={L('Длина без нагрузки', 'Rest length')} value={selLink.L0} min={0.3} max={5} step={0.1} unit={L('м', 'm')} digits={1} onChange={(L0) => setLink({ L0 })} />
            </div>
          ) : selLink?.kind === 'rope' ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-ink">{selLink.via ? L('Нить через блок', 'Rope over a pulley') : L('Нить', 'Rope')}</div>
              <Slider label={L('Длина', 'Length')} value={selLink.L} min={0.3} max={15} step={0.1} unit={L('м', 'm')} digits={1} onChange={(Lv) => setLink({ L: Lv })} />
              <p className="text-xs text-ink-3">
                {L('Натяжение', 'Tension')}: <span className="font-mono text-ink">{fmt(stats.ropeT[selLink.id] ?? 0, 1)} {L('Н', 'N')}</span>
              </p>
            </div>
          ) : selAnchor ? (
            <div className="text-sm text-ink">{selAnchor.kind === 'pulley' ? L('Блок — через него можно перекинуть нить.', 'Pulley: run a rope over it.') : L('Крючок — к нему можно привязать нить или пружину.', 'Hook: tie a rope or spring to it.')}</div>
          ) : (
            <p className="text-sm text-ink-3">{L('Нажми на тело, плоскость, нить или пружину, чтобы изменить их.', 'Tap a body, incline, rope or spring to change it.')}</p>
          )}
          {selected && (selBody || selSolid || selLink || selAnchor) && (
            <button onClick={() => remove(selected)} className="mt-4 text-xs text-[#CC2F35] hover:underline inline-flex items-center gap-1 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
              {L('Удалить', 'Delete')}
            </button>
          )}
        </div>

        {/* readouts */}
        <div className={card}>
          <h3 className={h3}>{L('Измерения', 'Readings')}</h3>
          {selBody ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-[11px] text-ink-2">{L('Скорость v', 'Speed v')}</div>
                  <div className="font-mono text-ink">{fmt(Math.hypot(selBody.vx, selBody.vy))} {L('м/с', 'm/s')}</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-[11px] text-ink-2">{L('Ускорение a', 'Acceleration a')}</div>
                  <div className="font-mono text-ink">{fmt(Math.hypot(stats.acc[selBody.id]?.x ?? 0, stats.acc[selBody.id]?.y ?? 0))} {L('м/с²', 'm/s²')}</div>
                </div>
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {forceRows.map((r) => (
                  <li key={r.k} className="flex justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.st.color }} />
                      {r.st[lang]}
                    </span>
                    <span className="font-mono text-ink">{fmt(r.mag, 1)} {L('Н', 'N')}</span>
                  </li>
                ))}
              </ul>
              <div>
                <div className="text-[11px] text-ink-2">{L('Скорость за последние 10 с', 'Speed, last 10 s')}</div>
                <Graph data={history} color={selBody.color} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-3">{L('Выбери тело, чтобы увидеть его силы и скорость.', 'Pick a body to see its forces and speed.')}</p>
          )}
          <div className="mt-4 pt-3 border-t border-line">
            <div className="flex justify-between text-[11px] text-ink-2 mb-2">
              <span>{L('Энергия системы', 'Energy of the system')}</span>
              <span className="font-mono">
                p = {fmt(Math.hypot(stats.px, stats.py))} {L('кг·м/с', 'kg·m/s')}
              </span>
            </div>
            {[
              { k: L('Кинетическая', 'Kinetic'), v: stats.kinetic, c: '#5B8CFF' },
              { k: L('Потенциальная', 'Potential'), v: stats.potential, c: '#30A46C' },
              { k: L('Пружины', 'Springs'), v: stats.elastic, c: '#3DD6F5' },
              { k: L('Ушло в тепло', 'Turned to heat'), v: stats.lost, c: '#F76B15' },
            ].map((r) => (
              <div key={r.k} className="flex items-center gap-2 text-xs mb-1">
                <span className="w-24 shrink-0 text-ink-2">{r.k}</span>
                <span className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${total > 0 ? Math.min(100, (r.v / total) * 100) : 0}%`, background: r.c }} />
                </span>
                <span className="w-16 text-right font-mono text-ink">{fmt(r.v, 1)} {L('Дж', 'J')}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs mt-1">
              <span className="text-ink-2">{L('Всего', 'Total')}</span>
              <span className="font-mono text-ink">{fmt(total, 1)} {L('Дж', 'J')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function segDist(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function inPoly(p: Vec, pts: Vec[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export default MechanicsSandbox;
