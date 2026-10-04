import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Compass, Play, Pause, RotateCcw } from 'lucide-react';

interface MomentTrigCircleProps {
  lang: 'ru' | 'en';
}

export const MomentTrigCircle: React.FC<MomentTrigCircleProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angleDeg, setAngleDeg] = useState<number>(45); // degrees
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);

  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(cosVal) > 0.001 ? Math.tan(angleRad) : 999;

  useEffect(() => {
    let animId: number;
    if (isAutoSpin) {
      const step = () => {
        setAngleDeg((prev) => (prev + 1) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoSpin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);

    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, w, h);

    const circleCenterX = 180;
    const circleCenterY = h / 2;
    const R = 100; // unit circle radius

    // 1. Draw Axes for Unit Circle
    ctx.strokeStyle = '#26282D';
    ctx.lineWidth = 1;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(30, circleCenterY);
    ctx.lineTo(330, circleCenterY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(circleCenterX, 30);
    ctx.lineTo(circleCenterX, h - 30);
    ctx.stroke();

    // Circle Body
    ctx.strokeStyle = '#34363C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, R, 0, Math.PI * 2);
    ctx.stroke();

    // Point coordinates on unit circle
    // Standard canvas Y is inverted: positive Y is down, so we subtract
    const px = circleCenterX + R * Math.cos(angleRad);
    const py = circleCenterY - R * Math.sin(angleRad);

    // Right Triangle Projections
    // Cosine (adjacent horizontal, in blue)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(circleCenterX, circleCenterY);
    ctx.lineTo(px, circleCenterY);
    ctx.stroke();

    // Sine (opposite vertical, in green)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, circleCenterY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Hypotenuse (radius R = 1, in yellow)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circleCenterX, circleCenterY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Arc for angle theta
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, 30, -angleRad, 0, false);
    ctx.stroke();

    // Circle point
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Real-time Sine Wave Projection on the Right
    const waveStartX = 380;
    const waveEndX = w - 40;
    const waveW = waveEndX - waveStartX;

    // Wave horizontal axis
    ctx.strokeStyle = '#26282D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(waveStartX, circleCenterY);
    ctx.lineTo(waveEndX, circleCenterY);
    ctx.stroke();

    // Projection dashed line from circle point to wave
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(waveStartX, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the continuous Sine Wave
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < waveW; x += 2) {
      const a = (x / waveW) * Math.PI * 4; // 2 full periods
      const y = circleCenterY - R * Math.sin(a);
      if (x === 0) ctx.moveTo(waveStartX + x, y);
      else ctx.lineTo(waveStartX + x, y);
    }
    ctx.stroke();

    // Highlight current angle position on the wave
    const waveCurrentX = waveStartX + ((angleRad % (Math.PI * 4)) / (Math.PI * 4)) * waveW;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(waveCurrentX, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Labels & Text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('cos θ', circleCenterX + (R * Math.cos(angleRad)) / 2 - 15, circleCenterY + 18);
    ctx.fillText('sin θ', px + 8, circleCenterY - (R * Math.sin(angleRad)) / 2);
    ctx.fillText('R = 1', (circleCenterX + px) / 2 - 10, (circleCenterY + py) / 2 - 10);
    ctx.fillText('y = sin(x)', waveStartX + 10, 45);
  }, [angleDeg, angleRad]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 font-mono font-bold border border-purple-800">
              {lang === 'ru' ? '9–10 Класс • Алгебра & Геометрия' : 'Grade 9-10 • Geometry & Trig'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Тригонометрический круг: sin²θ + cos²θ = 1' : 'Unit Circle: sin²θ + cos²θ = 1'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Единичный круг: почему синус и косинус — это просто проекции точки' : 'Unit Circle: Why Sine & Cosine are Simple Shadow Projections'}
          </h3>
        </div>

        {/* Live Trigonometric Values */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'УГОЛ θ' : 'ANGLE θ'}</span>
            <span className="font-bold text-yellow-400">{angleDeg}°</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">sin(θ)</span>
            <span className="font-bold text-emerald-400">{sinVal.toFixed(3)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">cos(θ)</span>
            <span className="font-bold text-cyan-400">{cosVal.toFixed(3)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">tan(θ)</span>
            <span className="font-bold text-purple-400">{Math.abs(tanVal) > 50 ? '∞' : tanVal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Angle Slider & Auto-Spin */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 flex flex-col gap-1 w-full">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Вращение угла (0° — 360°):' : 'Angle Rotation (0° - 360°):'}</span>
            <span className="font-mono text-yellow-400 font-bold">{angleDeg}° ({angleRad.toFixed(2)} rad)</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={angleDeg}
            onChange={(e) => {
              setIsAutoSpin(false);
              setAngleDeg(Number(e.target.value));
            }}
            className="w-full accent-yellow-400 cursor-pointer"
          />
        </div>

        <button
          onClick={() => setIsAutoSpin(!isAutoSpin)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isAutoSpin
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {isAutoSpin ? (lang === 'ru' ? 'Пауза вращения' : 'Pause Spin') : (lang === 'ru' ? 'Непрерывное вращение' : 'Continuous Spin')}
        </button>
      </div>
    </div>
  );
};
