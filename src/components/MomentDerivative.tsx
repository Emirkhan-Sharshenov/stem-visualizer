import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { approach, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentDerivativeProps {
  lang: 'ru' | 'en';
}

type Fn = 'sq' | 'cubic' | 'sin';
const FNS: Record<Fn, { f: (x: number) => number; d: (x: number) => number; tex: string; dtex: string; y: [number, number]; dy: [number, number] }> = {
  sq: { f: (x) => x * x, d: (x) => 2 * x, tex: 'f(x) = x²', dtex: "f′(x) = 2x", y: [-1, 9], dy: [-6.5, 6.5] },
  cubic: { f: (x) => x * x * x - 3 * x, d: (x) => 3 * x * x - 3, tex: 'f(x) = x³ − 3x', dtex: "f′(x) = 3x² − 3", y: [-5, 5], dy: [-4, 24] },
  sin: { f: (x) => Math.sin(1.6 * x), d: (x) => 1.6 * Math.cos(1.6 * x), tex: 'f(x) = sin 1,6x', dtex: "f′(x) = 1,6·cos 1,6x", y: [-1.6, 1.6], dy: [-2, 2] },
};
// the scene (canvas 800×380): the function on top, its derivative being drawn underneath
const X0 = 60;
const X1 = 740;
const XMIN = -3;
const XMAX = 3;
const TOP: [number, number] = [22, 222];
const BOT: [number, number] = [262, 362];
const fmt = (x: number, ru: boolean) => (ru ? x.toFixed(2).replace('.', ',') : x.toFixed(2));

export const MomentDerivative: React.FC<MomentDerivativeProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fn, setFn] = useState<Fn>('cubic');
  const [h, setH] = useState(1.2);
  const [auto, setAuto] = useState(true);
  const [shown, setShown] = useState({ x: 0, slope: 0, sec: 0 });

  const live = useRef({ fn, h, auto, lang, dragging: false, dragX: 0 });
  live.current.fn = fn;
  live.current.h = h;
  live.current.auto = auto;
  live.current.lang = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { x: -2.4, dir: 1, hh: live.current.h, trace: [] as [number, number][], fn: live.current.fn, report: 0 };
    const px = (x: number) => X0 + ((x - XMIN) / (XMAX - XMIN)) * (X1 - X0);
    const xOfPx = (p: number) => XMIN + ((p - X0) / (X1 - X0)) * (XMAX - XMIN);
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 800;
    };
    const down = (e: PointerEvent) => {
      live.current.dragging = true;
      live.current.dragX = Math.max(XMIN + 0.05, Math.min(XMAX - 0.05, xOfPx(local(e))));
      setAuto(false);
      live.current.auto = false;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (live.current.dragging) live.current.dragX = Math.max(XMIN + 0.05, Math.min(XMAX - 0.05, xOfPx(local(e))));
    };
    const up = () => (live.current.dragging = false);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const stop = runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const F = FNS[L.fn];
      if (s.fn !== L.fn) {
        s.fn = L.fn;
        s.trace = [];
      }
      if (L.dragging) s.x = approach(s.x, L.dragX, dt, 0.05);
      else if (L.auto && !still) {
        s.x += s.dir * 0.75 * dt;
        if (s.x > XMAX - 0.1) {
          s.dir = -1;
        } else if (s.x < XMIN + 0.1) {
          s.dir = 1;
          s.trace = [];
        }
      }
      s.hh = approach(s.hh, L.h, dt, still ? 0.001 : 0.15);
      const x = s.x;
      const slope = F.d(x);
      const x2 = Math.min(XMAX, x + s.hh);
      const sec = (F.f(x2) - F.f(x)) / Math.max(1e-6, x2 - x);
      // the derivative graph is drawn by the moving point itself
      if (!s.trace.length || Math.abs(s.trace[s.trace.length - 1][0] - x) > 0.01) {
        s.trace.push([x, slope]);
        if (s.trace.length > 800) s.trace.shift();
      }
      s.report += dt;
      if (s.report > 0.1) {
        s.report = 0;
        setShown({ x, slope, sec });
      }

      drawStage(ctx, w, h, { x: px(x), y: 120 });
      const py = (y: number) => TOP[1] - ((y - F.y[0]) / (F.y[1] - F.y[0])) * (TOP[1] - TOP[0]);
      const pdy = (y: number) => BOT[1] - ((y - F.dy[0]) / (F.dy[1] - F.dy[0])) * (BOT[1] - BOT[0]);

      // axes
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X0, py(0));
      ctx.lineTo(X1, py(0));
      ctx.moveTo(px(0), TOP[0]);
      ctx.lineTo(px(0), TOP[1]);
      ctx.moveTo(X0, pdy(0));
      ctx.lineTo(X1, pdy(0));
      ctx.moveTo(px(0), BOT[0]);
      ctx.lineTo(px(0), BOT[1]);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(X0, BOT[0], X1 - X0, BOT[1] - BOT[0]);

      // the function
      ctx.strokeStyle = '#E8ECFA';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const xx = XMIN + (i / 240) * (XMAX - XMIN);
        const yy = Math.max(TOP[0] - 10, Math.min(TOP[1] + 10, py(F.f(xx))));
        if (i) ctx.lineTo(px(xx), yy);
        else ctx.moveTo(px(xx), yy);
      }
      ctx.stroke();

      // the secant through x and x + h: as h shrinks it turns into the tangent
      const ext = 1.4;
      ctx.strokeStyle = 'rgba(255,180,94,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(px(x - ext), py(F.f(x) - sec * ext));
      ctx.lineTo(px(x2 + ext), py(F.f(x) + sec * (x2 - x + ext)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFB45E';
      ctx.beginPath();
      ctx.arc(px(x2), py(F.f(x2)), 5, 0, Math.PI * 2);
      ctx.fill();

      // the tangent
      ctx.strokeStyle = '#8B7CFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px(x - ext), py(F.f(x) - slope * ext));
      ctx.lineTo(px(x + ext), py(F.f(x) + slope * ext));
      ctx.stroke();
      glow(ctx, px(x), py(F.f(x)), 26, '139,124,255', 0.7);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px(x), py(F.f(x)), 6, 0, Math.PI * 2);
      ctx.fill();

      // the derivative graph, traced, with the same point dropped down to it
      ctx.strokeStyle = '#8B7CFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      s.trace.forEach(([tx, ty], i) => (i ? ctx.lineTo(px(tx), pdy(ty)) : ctx.moveTo(px(tx), pdy(ty))));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(139,124,255,0.4)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(px(x), py(F.f(x)));
      ctx.lineTo(px(x), pdy(slope));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px(x), pdy(slope), 4.5, 0, Math.PI * 2);
      ctx.fill();

      pill(ctx, X0 + 4, TOP[0] + 12, F.tex, STAGE.ink, 'left');
      pill(ctx, X0 + 4, BOT[0] + 12, ru ? `${F.dtex} — наклон касательной` : `${F.dtex}: the tangent's slope`, '#B3A9FF', 'left');
      const flat = Math.abs(slope) < 0.08;
      pill(ctx, px(x), Math.max(TOP[0] + 14, py(F.f(x)) - 30), flat ? (ru ? 'касательная горизонтальна: f′ = 0' : 'flat tangent: f′ = 0') : `${ru ? 'наклон' : 'slope'} ${fmt(slope, ru)}`, flat ? '#6FE3A0' : '#B3A9FF');
    });

    return () => {
      stop();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  const ru = lang === 'ru';
  return (
    <SimShell
      badge={ru ? '10–11 класс · Алгебра' : 'Grades 10–11 · Algebra'}
      formula="f′(x) = lim (f(x+h) − f(x)) / h"
      title={ru ? 'Производная — это наклон касательной' : 'The derivative is the slope of the tangent'}
      actions={
        <>
          {(['sq', 'cubic', 'sin'] as Fn[]).map((k) => (
            <Button key={k} variant={fn === k ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setFn(k)}>
              {k === 'sq' ? 'x²' : k === 'cubic' ? 'x³ − 3x' : 'sin'}
            </Button>
          ))}
          <Button variant="outline" size="sm" isIconOnly aria-label={auto ? (ru ? 'Остановить' : 'Stop') : ru ? 'Пуск' : 'Play'} onPress={() => setAuto(!auto)}>
            {auto ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          </Button>
        </>
      }
      readouts={[
        { label: 'x', value: fmt(shown.x, ru) },
        { label: ru ? 'Наклон касательной' : 'Tangent slope', value: fmt(shown.slope, ru), color: '#4A3BEB' },
        { label: ru ? 'Наклон секущей' : 'Secant slope', value: fmt(shown.sec, ru), color: '#B7791F' },
      ]}
      controls={[
        {
          label: ru ? 'Шаг h до второй точки' : 'Step h to the second point',
          value: fmt(h, ru),
          color: '#B7791F',
          input: <RangeSlider value={h} onChange={setH} min={0.02} max={2} step={0.02} />,
          hint: ru
            ? 'Уменьшай h: оранжевая секущая прижимается к фиолетовой касательной. Это и есть предел, через который определяют производную. Точку можно тянуть по графику.'
            : 'Shrink h: the orange secant closes onto the violet tangent. That limit is how the derivative is defined. You can drag the point along the graph.',
        },
      ]}
      insight={{
        title: ru ? 'Физический смысл' : 'What it means in physics',
        text: ru
          ? 'Если f — координата тела от времени, то наклон касательной — его скорость в этот момент. Там, где касательная горизонтальна, тело на миг останавливается: это вершины и впадины графика.'
          : 'If f is position over time, the tangent’s slope is the velocity at that instant. Where the tangent is flat the body stops for a moment: at the peaks and troughs.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto touch-pan-y cursor-ew-resize" aria-label={ru ? 'График функции с касательной и график её производной' : 'A function with its tangent and the graph of its derivative'} />
    </SimShell>
  );
};
