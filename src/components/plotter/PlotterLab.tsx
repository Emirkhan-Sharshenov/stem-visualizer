import { Check } from '../ui/Check';
import { RangeSlider } from '../ui/RangeSlider';
import { Button, Input } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { compile, Fn } from './expr';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

/* Graph plotter: type any formula in x, move the a, b, c sliders, see zeros, extrema and intersections. */

type Lang = 'ru' | 'en';
const COLORS = ['#2F5BFF', '#E5484D', '#30A46C'];
const PRESETS = ['a*x^2 + b*x + c', 'a*sin(b*x) + c', 'a/x', 'a*e^(b*x)', 'sqrt(x)', '|x|', 'ln(x)', 'x^3 - 3x', 'a*x + b', 'tg(x)'];
const n = (x: number, d = 2) => (Math.abs(x) < 1e-9 ? '0' : (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ','));

interface Line {
  src: string;
  on: boolean;
}

/** zeros of f on [x0, x1]: sign changes refined by bisection, without the jumps of 1/x or tg x */
function roots(f: (x: number) => number, x0: number, x1: number, steps = 800) {
  const out: number[] = [];
  let px = x0;
  let py = f(px);
  for (let i = 1; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const y = f(x);
    if (Number.isFinite(py) && Number.isFinite(y) && (py === 0 || py * y < 0)) {
      let a = px;
      let b = x;
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
      }
      const r = (a + b) / 2;
      // a real zero, not a pole where the sign flips through infinity
      if (Math.abs(f(r)) < 1e-3 * Math.max(1, Math.abs(py), Math.abs(y)) && !out.some((o) => Math.abs(o - r) < (x1 - x0) / steps)) out.push(r);
    }
    px = x;
    py = y;
  }
  return out;
}

export const PlotterLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [lines, setLines] = useState<Line[]>([
    { src: 'a*x^2 + b*x + c', on: true },
    { src: 'x + 1', on: false },
    { src: 'sin(x)', on: false },
  ]);
  const [prm, setPrm] = useState({ a: 1, b: -2, c: -3 });
  const [view, setView] = useState({ cx: 0, cy: 0, scale: 40 }); // px per unit
  const [deriv, setDeriv] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 460 });

  useEffect(() => progress.recordLab('sandbox-plotter'), []);
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ro = new ResizeObserver(() => setSize({ w: cv.clientWidth, h: cv.clientHeight }));
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  const compiled = useMemo(
    () =>
      lines.map((l) => {
        try {
          return { fn: compile(l.src) as Fn, err: null as string | null };
        } catch (e) {
          return { fn: null, err: (e as Error).message };
        }
      }),
    [lines],
  );
  const fx = (i: number) => (x: number) => {
    const f = compiled[i].fn;
    return f ? f({ x, ...prm }) : NaN;
  };

  const xMin = view.cx - size.w / 2 / view.scale;
  const xMax = view.cx + size.w / 2 / view.scale;

  // facts about the first visible function
  const main = lines.findIndex((l, i) => l.on && compiled[i].fn);
  const facts = useMemo(() => {
    if (main < 0) return null;
    const f = fx(main);
    const zs = roots(f, xMin, xMax);
    const d = (x: number) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4;
    const ex = roots(d, xMin, xMax, 600).map((x) => ({ x, y: f(x), kind: (f(x + 1e-3) + f(x - 1e-3)) / 2 > f(x) ? 'min' : 'max' }));
    const second = lines.findIndex((l, i) => i !== main && l.on && compiled[i].fn);
    const cross = second >= 0 ? roots((x) => f(x) - fx(second)(x), xMin, xMax).map((x) => ({ x, y: f(x) })) : [];
    return { zs, ex: ex.filter((e) => Number.isFinite(e.y)), cross, y0: f(0) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, compiled, prm, xMin, xMax, lines]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size.w * dpr;
    cv.height = size.h * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const X = (x: number) => size.w / 2 + (x - view.cx) * view.scale;
    const Y = (y: number) => size.h / 2 - (y - view.cy) * view.scale;
    ctx.fillStyle = '#FCFCFA';
    ctx.fillRect(0, 0, size.w, size.h);
    // grid with a step that suits the zoom
    const raw = 80 / view.scale;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
    ctx.font = '11px Inter, system-ui, sans-serif';
    for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
      ctx.strokeStyle = Math.abs(x) < step / 2 ? '#16171A' : '#ECECE7';
      ctx.lineWidth = Math.abs(x) < step / 2 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(X(x), 0);
      ctx.lineTo(X(x), size.h);
      ctx.stroke();
      if (Math.abs(x) > step / 2) {
        ctx.fillStyle = '#8C8F98';
        ctx.fillText(n(x, 3), X(x) + 3, Math.min(size.h - 4, Math.max(12, Y(0) + 14)));
      }
    }
    const yMin = view.cy - size.h / 2 / view.scale;
    const yMax = view.cy + size.h / 2 / view.scale;
    for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
      ctx.strokeStyle = Math.abs(y) < step / 2 ? '#16171A' : '#ECECE7';
      ctx.lineWidth = Math.abs(y) < step / 2 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, Y(y));
      ctx.lineTo(size.w, Y(y));
      ctx.stroke();
      if (Math.abs(y) > step / 2) {
        ctx.fillStyle = '#8C8F98';
        ctx.fillText(n(y, 3), Math.min(size.w - 30, Math.max(3, X(0) + 4)), Y(y) - 3);
      }
    }
    const plot = (f: (x: number) => number, color: string, width: number, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      let pen = false;
      let prev = NaN;
      for (let px = 0; px <= size.w; px += 1) {
        const x = xMin + px / view.scale;
        const y = f(x);
        const py = Y(y);
        // break the line at gaps and at poles like 1/x
        if (!Number.isFinite(y) || Math.abs(py) > 1e5 || (pen && Math.abs(py - prev) > size.h * 1.5)) {
          pen = false;
          prev = py;
          continue;
        }
        if (pen) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
        pen = true;
        prev = py;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    lines.forEach((l, i) => l.on && compiled[i].fn && plot(fx(i), COLORS[i], 3));
    if (deriv && main >= 0) {
      const f = fx(main);
      plot((x) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4, COLORS[main], 1.5, [6, 5]);
    }
    const dot = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(X(x), Y(y), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    if (facts) {
      facts.zs.forEach((z) => dot(z, 0, '#16171A'));
      facts.ex.forEach((e) => dot(e.x, e.y, '#F5A524'));
      facts.cross.forEach((c) => dot(c.x, c.y, '#8E4EC6'));
    }
    if (hover && main >= 0) {
      const y = fx(main)(hover.x);
      if (Number.isFinite(y)) {
        ctx.strokeStyle = '#9AA0AA';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(X(hover.x), 0);
        ctx.lineTo(X(hover.x), size.h);
        ctx.stroke();
        ctx.setLineDash([]);
        dot(hover.x, y, COLORS[main]);
        ctx.fillStyle = '#16171A';
        ctx.font = '600 12px Inter, system-ui, sans-serif';
        ctx.fillText(`(${n(hover.x)}; ${n(y)})`, X(hover.x) + 8, Y(y) - 8);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, compiled, prm, view, size, deriv, facts, hover]);

  const toWorld = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: view.cx + (e.clientX - r.left - size.w / 2) / view.scale, y: view.cy - (e.clientY - r.top - size.h / 2) / view.scale };
  };
  const zoom = (k: number) => setView((v) => ({ ...v, scale: Math.max(4, Math.min(600, v.scale * k)) }));
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    cv.addEventListener('wheel', onWheel, { passive: false });
    return () => cv.removeEventListener('wheel', onWheel);
  }, []);

  const uses = (ch: string) => lines.some((l, i) => l.on && compiled[i].fn && new RegExp(`(^|[^a-z])${ch}([^a-z]|$)`).test(l.src.toLowerCase().replace(/[^a-z]+/g, ' ')));
  useScreenDetail('lab', `Графопостроитель: ${lines.filter((l) => l.on).map((l) => `y = ${l.src}`).join('; ')}; a = ${prm.a}, b = ${prm.b}, c = ${prm.c}.${facts ? ` Нули: ${facts.zs.map((z) => n(z)).join(', ') || 'нет'}.` : ''}`);

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-5 items-start">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="relative rounded-xl overflow-hidden border border-line">
          <canvas
            ref={canvas}
            className="block w-full h-[360px] md:h-[460px] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
            }}
            onPointerMove={(e) => {
              if (drag.current) {
                const d = drag.current;
                setView((v) => ({ ...v, cx: d.cx - (e.clientX - d.x) / v.scale, cy: d.cy + (e.clientY - d.y) / v.scale }));
              } else setHover(toWorld(e));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => {
              drag.current = null;
              setHover(null);
            }}
          />
          <div className="absolute right-3 top-3 flex flex-col gap-1">
            {[
              [<Plus key="p" className="w-4 h-4" />, () => zoom(1.4)],
              [<Minus key="m" className="w-4 h-4" />, () => zoom(1 / 1.4)],
              [<RotateCcw key="r" className="w-4 h-4" />, () => setView({ cx: 0, cy: 0, scale: 40 })],
            ].map(([icon, fn], i) => (
              <Button variant="outline" isIconOnly size="sm" className="w-8" key={i} onPress={fn as () => void}>
                {icon as React.ReactNode}
              </Button>
            ))}
          </div>
        </div>
        {facts && (
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-xs text-ink-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16171A]" /> {L('Нули функции', 'Zeros')}</div>
              <div className="font-mono text-ink">{facts.zs.length ? facts.zs.slice(0, 5).map((z) => n(z)).join('; ') : L('на экране нет', 'none in view')}</div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-xs text-ink-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F5A524]" /> {L('Экстремумы', 'Extrema')}</div>
              <div className="font-mono text-ink text-[13px]">{facts.ex.length ? facts.ex.slice(0, 3).map((e) => `${e.kind} (${n(e.x)}; ${n(e.y)})`).join(' ') : L('на экране нет', 'none in view')}</div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-xs text-ink-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8E4EC6]" /> {L('Пересечения графиков', 'Intersections')}</div>
              <div className="font-mono text-ink text-[13px]">{facts.cross.length ? facts.cross.slice(0, 3).map((c) => `(${n(c.x)}; ${n(c.y)})`).join(' ') : L('включи второй график', 'turn on a second graph')}</div>
            </div>
          </div>
        )}
        <p className="text-xs text-ink-3">{L('Тяни график мышкой, колесо — масштаб. Наведи — увидишь координаты точки.', 'Drag to move, wheel to zoom, hover to read a point.')}</p>
      </div>
      <aside className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        {lines.map((l, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={l.on} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, on: e.target.checked } : x)))} style={{ accentColor: COLORS[i] }} />
              <span className="font-mono text-sm" style={{ color: COLORS[i] }}>y =</span>
              <Input
                value={l.src}
                onChange={(e) => setLines(lines.map((x, j) => (j === i ? { src: e.target.value, on: true } : x)))}
                className={`flex-1 min-w-0 h-9 px-2.5 rounded-lg border bg-paper font-mono text-sm outline-none focus:border-accent ${compiled[i].err ? 'border-[#E5484D]' : 'border-line'}`}
                spellCheck={false}
              />
            </div>
            {compiled[i].err && <span className="text-xs text-[#CC2F35] ml-6">{L('Ошибка', 'Error')}: {compiled[i].err}</span>}
          </div>
        ))}
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <Button variant="outline" size="sm" className="text-xs font-mono" key={p} onPress={() => setLines([{ src: p, on: true }, ...lines.slice(1)])}>
              {p}
            </Button>
          ))}
        </div>
        {(['a', 'b', 'c'] as const).map((k) => (
          <label key={k} className={`flex flex-col gap-1 ${uses(k) ? '' : 'opacity-50'}`}>
            <span className="flex justify-between text-xs text-ink-2">
              <span className="font-mono">{k}</span>
              <span className="font-mono text-ink">{n(prm[k])}</span>
            </span>
            <RangeSlider value={prm[k]} onChange={(v) => setPrm({ ...prm, [k]: v })} min={-5} max={5} step={0.1} color="#8E4EC6" />
          </label>
        ))}
        <Check checked={deriv} onChange={(v) => setDeriv(v)}>{L('Показать производную (пунктир)', 'Show the derivative (dashed)')}</Check>
        <p className="text-xs text-ink-3 border-t border-line pt-3">
          {L('Можно писать как в тетради: 2x, x², 3(x+1), sin x, √x, |x|, e^x, ln x, π.', 'Write as in a notebook: 2x, x², 3(x+1), sin x, √x, |x|, e^x, ln x, π.')}
        </p>
      </aside>
    </div>
  );
};

export default PlotterLab;
