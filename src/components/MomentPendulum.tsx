import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

interface MomentPendulumProps {
  lang: 'ru' | 'en';
}

export const MomentPendulum: React.FC<MomentPendulumProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState<number>(180); // pendulum length in px
  const [gravity, setGravity] = useState<number>(9.8); // m/s2
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [damping, setDamping] = useState<number>(0.001); // air resistance

  // Pendulum physical state
  const stateRef = useRef({
    theta: Math.PI / 4, // initial angle 45 deg
    omega: 0, // angular velocity
    alpha: 0, // angular acceleration
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      const pivotX = w / 2;
      const pivotY = 50;

      const state = stateRef.current;

      if (isPlaying) {
        // Physics update (Euler-Cromer integration)
        // alpha = - (g / L) * sin(theta) - damping * omega
        const gEff = (gravity * 300) / length;
        state.alpha = -gEff * Math.sin(state.theta) - damping * state.omega;
        state.omega += state.alpha * 0.016;
        state.theta += state.omega * 0.016;
      }

      const bobX = pivotX + length * Math.sin(state.theta);
      const bobY = pivotY + length * Math.cos(state.theta);

      // Energy calculations
      // h = L * (1 - cos(theta))
      const bobH = length * (1 - Math.cos(state.theta));
      const potEnergy = bobH / length; // 0 to 1
      const kinEnergy = Math.max(0, Math.min(1, 0.5 * Math.pow(state.omega * (length / 100), 2) / 3));

      // Draw Pivot Mount & Ceiling
      ctx.fillStyle = '#34363C';
      ctx.fillRect(pivotX - 60, pivotY - 12, 120, 12);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      // Trajectory Arc
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, length, Math.PI / 2 - 0.9, Math.PI / 2 + 0.9);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pendulum Rod
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Pendulum Bob
      const bobRadius = 20;
      const bobGrad = ctx.createRadialGradient(bobX - 5, bobY - 5, 2, bobX, bobY, bobRadius);
      bobGrad.addColorStop(0, '#38bdf8');
      bobGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity Vector Arrow
      const vScale = 15;
      const vx = -Math.cos(state.theta) * state.omega * vScale;
      const vy = Math.sin(state.theta) * state.omega * vScale;
      if (Math.abs(state.omega) > 0.1) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(bobX + vx, bobY + vy);
        ctx.stroke();
      }

      // Energy Bar Graphs in Left Corner
      const barX = 40;
      const barY = 60;
      const barW = 18;
      const maxBarH = 140;

      // Potential Energy Bar
      const hPot = Math.min(maxBarH, potEnergy * maxBarH * 1.5);
      ctx.fillStyle = '#26282D';
      ctx.fillRect(barX, barY, barW, maxBarH);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX, barY + maxBarH - hPot, barW, hPot);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(lang === 'ru' ? 'E_пот' : 'E_pot', barX + 1, barY + maxBarH + 16);

      // Kinetic Energy Bar
      const hKin = Math.min(maxBarH, kinEnergy * maxBarH * 1.5);
      ctx.fillStyle = '#26282D';
      ctx.fillRect(barX + 35, barY, barW, maxBarH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(barX + 35, barY + maxBarH - hKin, barW, hKin);
      ctx.fillText(lang === 'ru' ? 'E_кин' : 'E_kin', barX + 36, barY + maxBarH + 16);

      // Total Energy Label
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px monospace';
      ctx.fillText(lang === 'ru' ? 'E_полн = E_пот + E_кин = const' : 'E_total = E_pot + E_kin = const', barX, barY - 15);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [length, gravity, damping, isPlaying, lang]);

  const handleReset = () => {
    stateRef.current.theta = Math.PI / 4;
    stateRef.current.omega = 0;
    stateRef.current.alpha = 0;
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              {lang === 'ru' ? '9 Класс • Физика' : 'Grade 9 • Physics'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Механические колебания: T = 2π√(L/g)' : 'Harmonic Oscillations: T = 2π√(L/g)'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Математический маятник: превращение кинетической энергии в потенциальную' : 'Simple Pendulum: Kinetic vs Potential Energy Barter'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Длина нити (L):' : 'String Length (L):'}</span>
            <span className="font-mono text-cyan-400 font-bold">{(length / 100).toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min={80}
            max={220}
            step={5}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Гравитация (g):' : 'Gravity (g):'}</span>
            <span className="font-mono text-emerald-400 font-bold">{gravity} m/s²</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGravity(9.8)}
              className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer border ${gravity === 9.8 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              {lang === 'ru' ? 'Земля (9.8)' : 'Earth (9.8)'}
            </button>
            <button
              onClick={() => setGravity(1.62)}
              className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer border ${gravity === 1.62 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              {lang === 'ru' ? 'Луна (1.62)' : 'Moon (1.62)'}
            </button>
            <button
              onClick={() => setGravity(24.79)}
              className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer border ${gravity === 24.79 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              {lang === 'ru' ? 'Юпитер (24.8)' : 'Jupiter (24.8)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
