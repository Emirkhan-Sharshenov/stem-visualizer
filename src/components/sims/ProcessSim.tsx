import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { fitCanvas } from '../../lib/canvas';
import type { PartInfo } from '../../lib/three/ThreeStage';
import { InfoCard, Metric, Segmented, Slider } from '../lab/LabUI';
import { Timeline, useTimeline } from '../lab/Timeline';
import { alpha, C, Frame, Lang, setFontScale, SimDef, Stage, tag } from './kit';

interface Hit {
  info: PartInfo;
  x: number;
  y: number;
  r?: number;
  w?: number;
  h?: number;
}

const W = 960;
const H = 540;

/**
 * Host for a timeline-driven 2D process: canvas stage, play/pause/rewind with stage marks,
 * mode switch, parameter sliders, live metrics and clickable parts with info cards.
 */
export const ProcessSim: React.FC<{
  lang: Lang;
  sim: SimDef;
  mode?: string;
  /** start paused (used by predict-then-check challenges) */
  autoplay?: boolean;
  /** initial parameter values */
  initialParams?: Record<string, number>;
  /** hide mode switch and sliders */
  locked?: boolean;
}> = ({ lang, sim, mode: initialMode, autoplay = true, initialParams, locked = false }) => {
  const [mode, setMode] = useState(initialMode ?? sim.modes?.[0]?.id ?? 'default');
  const paramDefs = useMemo(() => (typeof sim.params === 'function' ? sim.params(mode) : sim.params ?? []), [sim, mode]);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(initialParams ?? {}).map(([k, v]) => [`${initialMode ?? sim.modes?.[0]?.id ?? 'default'}:${k}`, v])),
  );
  const p = useMemo(() => Object.fromEntries(paramDefs.map((d) => [d.id, values[`${mode}:${d.id}`] ?? d.value])), [paramDefs, values, mode]);
  const duration = typeof sim.duration === 'function' ? sim.duration(mode, p) : sim.duration;
  const stages: Stage[] = useMemo(() => (typeof sim.stages === 'function' ? sim.stages(mode, p) : sim.stages ?? []), [sim, mode, p]);
  const tl = useTimeline(duration, { loop: sim.loop ?? true, autoplay });
  const [selected, setSelected] = useState<PartInfo | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hitsRef = useRef<Hit[]>([]);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const live = useRef({ p, mode, lang, selected });
  live.current = { p, mode, lang, selected };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const { w, h } = fitCanvas(canvas, ctx);
      const st = live.current;
      const hits: Hit[] = [];
      // canvas shown narrower than its 960px drawing size: enlarge labels to stay legible
      const shown = canvas.clientWidth || W;
      setFontScale(Math.min(1.9, Math.max(1, (W / shown) * 0.62)));
      const f: Frame = {
        ctx,
        w,
        h,
        t: tl.timeRef.current,
        p: st.p,
        mode: st.mode,
        lang: st.lang,
        L: (ru, en) => (st.lang === 'ru' ? ru : en),
        hit: (info, x, y, r) => hits.push({ info, x, y, r }),
        hitRect: (info, x, y, ww, hh) => hits.push({ info, x, y, w: ww, h: hh }),
      };
      ctx.save();
      sim.draw(f);
      ctx.restore();
      hitsRef.current = hits;

      // Hover / selection ring with the part's name
      const hv = hoverRef.current;
      const over = hv ? findHit(hits, hv.x, hv.y) : null;
      const sel = st.selected ? hits.find((x) => x.info.title.en === st.selected!.title.en) : null;
      [sel, over].forEach((hh, k) => {
        if (!hh) return;
        ctx.strokeStyle = alpha(C.sky, k === 0 ? 0.95 : 0.6);
        ctx.lineWidth = 2;
        ctx.setLineDash(k === 0 ? [] : [4, 3]);
        ctx.beginPath();
        if (hh.r !== undefined) ctx.arc(hh.x, hh.y, hh.r + 4, 0, Math.PI * 2);
        else ctx.rect(hh.x - 3, hh.y - 3, hh.w! + 6, hh.h! + 6);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      if (over) {
        const ty = over.r !== undefined ? over.y - over.r - 18 : over.y - 16;
        tag(ctx, over.info.title[st.lang], over.x + (over.w ?? 0) / 2, Math.max(14, ty), { color: C.sky });
      }
      canvas.style.cursor = over ? 'pointer' : 'default';
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sim, tl.timeRef]);

  const toLogical = (e: React.PointerEvent | React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const switchMode = (m: string) => {
    setMode(m);
    setSelected(null);
    tl.seek(0);
    tl.play();
  };

  const active = [...stages].reverse().find((s) => tl.time >= s.t);
  const metrics = sim.metrics?.({ t: tl.time, p, mode }) ?? [];
  const tip = sim.tip?.(mode);

  return (
    <div className="flex flex-col gap-3 w-full">
      {!locked && sim.modes && sim.modes.length > 1 && (
        <Segmented value={mode} onChange={switchMode} options={sim.modes.map((m) => ({ id: m.id, label: m.label[lang] }))} />
      )}
      <div ref={stageRef} className="lab-stage relative rounded-xl overflow-hidden border border-[#1F2126] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full h-auto max-h-screen object-contain touch-none select-none"
          onPointerMove={(e) => (hoverRef.current = toLogical(e))}
          onPointerLeave={() => (hoverRef.current = null)}
          onClick={(e) => {
            const pt = toLogical(e);
            const hh = findHit(hitsRef.current, pt.x, pt.y);
            setSelected(hh ? hh.info : null);
          }}
        />
        <span className="pointer-events-none absolute top-3 left-3 px-2 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED]">
          {sim.title[lang]}
        </span>
        <button
          onClick={() => {
            const el = stageRef.current;
            if (!el) return;
            if (document.fullscreenElement) document.exitFullscreen?.();
            else el.requestFullscreen?.().catch(() => undefined);
          }}
          aria-label={lang === 'ru' ? 'Во весь экран' : 'Full screen'}
          title={lang === 'ru' ? 'Во весь экран' : 'Full screen'}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[#B5B8C0] hover:text-white flex items-center justify-center cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <InfoCard lang={lang} info={selected} onClose={() => setSelected(null)} />
      </div>

      <Timeline lang={lang} tl={tl} marks={locked ? [] : stages} />

      {!locked && active?.text && (
        <p className="text-[14.5px] leading-relaxed text-ink bg-surface border border-line rounded-xl px-4 py-3">
          <span className="font-medium text-accent">{active.label[lang]}. </span>
          {active.text[lang]}
        </p>
      )}

      {!locked && (paramDefs.length > 0 || metrics.length > 0) && (
        <div className="grid md:grid-cols-2 gap-3">
          {paramDefs.length > 0 && (
            <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-4">
              {paramDefs.map((d) => (
                <Slider
                  key={mode + d.id}
                  label={d.label[lang]}
                  value={p[d.id]}
                  min={d.min}
                  max={d.max}
                  step={d.step}
                  format={(v) => `${v.toFixed(d.digits ?? (d.step < 1 ? String(d.step).split('.')[1]?.length ?? 1 : 0))}${d.unit ? ` ${d.unit}` : ''}`}
                  onChange={(v) => setValues((s) => ({ ...s, [`${mode}:${d.id}`]: v }))}
                />
              ))}
            </div>
          )}
          {metrics.length > 0 && (
            <div className={`grid grid-cols-2 gap-2 content-start ${paramDefs.length === 0 ? 'md:col-span-2 sm:grid-cols-4' : ''}`}>
              {metrics.map((m) => (
                <Metric key={m.label.en} label={m.label[lang]} value={m.value} tone={m.tone} />
              ))}
            </div>
          )}
        </div>
      )}

      {!locked && tip && (
        <p className="text-[13.5px] leading-relaxed text-ink bg-muted rounded-lg px-3 py-2">
          <span className="text-accent font-medium">{lang === 'ru' ? 'Обрати внимание: ' : 'Notice: '}</span>
          {tip[lang]}
        </p>
      )}
    </div>
  );
};

function findHit(hits: Hit[], x: number, y: number): Hit | null {
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    if (h.r !== undefined ? Math.hypot(x - h.x, y - h.y) <= h.r + 4 : x >= h.x && x <= h.x + h.w! && y >= h.y && y <= h.y + h.h!) return h;
  }
  return null;
}
