import React, { useEffect, useRef, useState } from 'react';
import { Compass, Play, Pause, RotateCcw } from 'lucide-react';

interface MomentDerivativeProps {
  lang: 'ru' | 'en';
}

export const MomentDerivative: React.FC<MomentDerivativeProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [xPoint, setXPoint] = useState<number>(2.0); // point x where derivative is taken
  const [deltaX, setDeltaX] = useState<number>(1.5); // step size Δx shrinking to 0
  const [selectedFunction, setSelectedFunction] = useState<'parabola' | 'cubic' | 'sine'>('parabola');

  // Mathematical functions
  const f = (x: number) => {
    if (selectedFunction === 'parabola') return 0.25 * x * x;
    if (selectedFunction === 'cubic') return 0.08 * (x * x * x) - 0.2 * x;
    return Math.sin(x) * 1.5 + 2;
  };

  const fPrimeExact = (x: number) => {
    if (selectedFunction === 'parabola') return 0.5 * x;
    if (selectedFunction === 'cubic') return 0.24 * (x * x) - 0.2;
    return 1.5 * Math.cos(x);
  };

  const y1 = f(xPoint);
  const y2 = f(xPoint + deltaX);
  const secantSlope = (y2 - y1) / deltaX;
  const tangentSlope = fPrimeExact(xPoint);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, w, h);

    const originX = 120;
    const originY = h - 60;
    const scaleX = 70;
    const scaleY = 45;

    const toCanvasX = (x: number) => originX + x * scaleX;
    const toCanvasY = (y: number) => originY - y * scaleY;

    // Draw Coordinate Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // X axis
    ctx.beginPath();
    ctx.moveTo(30, originY);
    ctx.lineTo(w - 30, originY);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX, h - 20);
    ctx.stroke();

    // Draw Function Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = -0.5; x <= 8.5; x += 0.05) {
      const cx = toCanvasX(x);
      const cy = toCanvasY(f(x));
      if (x === -0.5) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Key points (x, f(x)) and (x + Δx, f(x + Δx))
    const cx1 = toCanvasX(xPoint);
    const cy1 = toCanvasY(y1);
    const cx2 = toCanvasX(xPoint + deltaX);
    const cy2 = toCanvasY(y2);

    // Delta X / Delta Y Triangle (Secant slope step)
    ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
    ctx.fillRect(cx1, Math.min(cy1, cy2), cx2 - cx1, Math.abs(cy2 - cy1));

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Horizontal Δx line
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy1);
    ctx.stroke();

    // Vertical Δy line
    ctx.beginPath();
    ctx.moveTo(cx2, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Secant Line (through both points, extending across canvas)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const secLineXStart = xPoint - 2;
    const secLineXEnd = xPoint + deltaX + 2;
    ctx.moveTo(toCanvasX(secLineXStart), toCanvasY(y1 + secantSlope * (secLineXStart - xPoint)));
    ctx.lineTo(toCanvasX(secLineXEnd), toCanvasY(y1 + secantSlope * (secLineXEnd - xPoint)));
    ctx.stroke();

    // Draw Exact Tangent Line (dashed cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const tanXStart = xPoint - 2.5;
    const tanXEnd = xPoint + 2.5;
    ctx.moveTo(toCanvasX(tanXStart), toCanvasY(y1 + tangentSlope * (tanXStart - xPoint)));
    ctx.lineTo(toCanvasX(tanXEnd), toCanvasY(y1 + tangentSlope * (tanXEnd - xPoint)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Point 1: (x, f(x))
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(cx1, cy1, 6, 0, Math.PI * 2);
    ctx.fill();

    // Point 2: (x + Δx, f(x + Δx))
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx2, cy2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    ctx.fillText('Δx', (cx1 + cx2) / 2 - 8, cy1 + 16);
    ctx.fillText('Δy', cx2 + 8, (cy1 + cy2) / 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('A(x, f(x))', cx1 - 25, cy1 - 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('B(x+Δx)', cx2 + 10, cy2 - 10);
  }, [xPoint, deltaX, selectedFunction, y1, y2, secantSlope, tangentSlope]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 font-mono font-bold border border-purple-800">
              {lang === 'ru' ? '10–11 Класс • Математика' : 'Grade 10-11 • Calculus'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Производная: f\'(x) = lim (Δy / Δx) при Δx → 0' : "Derivative: f'(x) = lim (Δy / Δx) as Δx → 0"}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Смысл производной: как секущая превращается в касательную' : 'Geometrical Meaning: How Secant Morphs into Tangent'}
          </h3>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">ШАГ Δx</span>
            <span className={`font-bold ${deltaX < 0.1 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {deltaX.toFixed(3)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'НАКЛОН СЕКУЩЕЙ (Δy/Δx)' : 'SECANT SLOPE (Δy/Δx)'}</span>
            <span className="font-bold text-amber-400">{secantSlope.toFixed(3)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ИСТИННАЯ ПРОИЗВОДНАЯ f\'(x)' : 'EXACT DERIVATIVE f\'(x)'}</span>
            <span className="font-bold text-cyan-400">{tangentSlope.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="w-full h-full block" />
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              {lang === 'ru' ? 'Устремить Δx к 0 (Секущая → Касательная):' : 'Shrink Δx toward 0 (Secant → Tangent):'}
            </span>
            <span className="font-mono text-emerald-400 font-bold">{deltaX.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.01}
            max={3.0}
            step={0.01}
            value={deltaX}
            onChange={(e) => setDeltaX(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Δx → 0 (Мгновенная скорость)</span>
            <span>Δx = 3.0 (Средняя скорость за отрезок)</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Положение точки x:' : 'Position of point x:'}</span>
            <span className="font-mono text-cyan-400 font-bold">x = {xPoint.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5.5}
            step={0.1}
            value={xPoint}
            onChange={(e) => setXPoint(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
