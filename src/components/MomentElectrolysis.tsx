import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Zap, Play, Pause, RotateCcw } from 'lucide-react';

interface MomentElectrolysisProps {
  lang: 'ru' | 'en';
}

interface Ion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'Cu' | 'Cl';
}

export const MomentElectrolysis: React.FC<MomentElectrolysisProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState<number>(6); // Volts
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copperMassMg, setCopperMassMg] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const { w, h } = fitCanvas(canvas, ctx);

    // Beaker dimensions
    const beakerX = 160;
    const beakerY = 100;
    const beakerW = w - 320;
    const beakerH = 200;

    // Electrodes
    const cathodeX = beakerX + 60; // Left: Cathode (-)
    const anodeX = beakerX + beakerW - 80; // Right: Anode (+)
    const electrodeW = 20;
    const electrodeTop = 60;
    const electrodeBottom = beakerY + beakerH - 20;

    // Generate ions
    const ions: Ion[] = [];
    for (let i = 0; i < 20; i++) {
      ions.push({
        x: beakerX + 30 + Math.random() * (beakerW - 60),
        y: beakerY + 30 + Math.random() * (beakerH - 60),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        type: i % 3 === 0 ? 'Cu' : 'Cl',
      });
    }

    // Chlorine gas bubbles
    const bubbles: { x: number; y: number; r: number }[] = [];

    const render = () => {
      animId = requestAnimationFrame(render);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // 1. Draw External Circuit Wires & Battery at top
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // From cathode to battery (-)
      ctx.moveTo(cathodeX + electrodeW / 2, electrodeTop);
      ctx.lineTo(cathodeX + electrodeW / 2, 35);
      ctx.lineTo(w / 2 - 30, 35);
      // From anode to battery (+)
      ctx.moveTo(anodeX + electrodeW / 2, electrodeTop);
      ctx.lineTo(anodeX + electrodeW / 2, 35);
      ctx.lineTo(w / 2 + 30, 35);
      ctx.stroke();

      // Battery in middle top
      ctx.fillStyle = '#26282D';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.fillRect(w / 2 - 30, 20, 60, 30);
      ctx.strokeRect(w / 2 - 30, 20, 60, 30);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('-', w / 2 - 20, 40);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('+', w / 2 + 12, 40);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(`${voltage}V`, w / 2 - 10, 40);

      // 2. Draw Beaker Solution (CuCl2 solution is light blue-green)
      ctx.fillStyle = 'rgba(14, 116, 144, 0.35)';
      ctx.fillRect(beakerX, beakerY + 20, beakerW, beakerH - 20);

      // Glass Beaker outline
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(beakerX - 5, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW + 5, beakerY);
      ctx.stroke();

      // 3. Draw Cathode (-) [Left - Graphite/Carbon rod]
      ctx.fillStyle = '#34363C';
      ctx.fillRect(cathodeX, electrodeTop, electrodeW, electrodeBottom - electrodeTop);

      // Copper deposition layer on cathode (reddish metallic layer)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cathodeX - 4, beakerY + 20, 4, electrodeBottom - (beakerY + 20));
      ctx.fillRect(cathodeX + electrodeW, beakerY + 20, 4, electrodeBottom - (beakerY + 20));

      // 4. Draw Anode (+) [Right - Graphite rod]
      ctx.fillStyle = '#34363C';
      ctx.fillRect(anodeX, electrodeTop, electrodeW, electrodeBottom - electrodeTop);

      // 5. Physics & Chemistry Update
      if (isPlaying) {
        // Drift field strength proportional to voltage
        const driftSpeed = voltage * 0.15;

        ions.forEach((ion) => {
          // Brownian random motion
          ion.x += ion.vx + (Math.random() - 0.5) * 0.5;
          ion.y += ion.vy + (Math.random() - 0.5) * 0.5;

          // Directed electric drift:
          // Cu2+ (positive cation) drifts to Cathode (-) on left
          if (ion.type === 'Cu') {
            ion.x -= driftSpeed;
            // When touches cathode, gets reduced and deposited
            if (ion.x <= cathodeX + electrodeW + 4 && ion.y > beakerY + 20) {
              ion.x = beakerX + 120 + Math.random() * (beakerW - 160);
              ion.y = beakerY + 40 + Math.random() * (beakerH - 60);
              setCopperMassMg((prev) => +(prev + 0.05).toFixed(2));
            }
          }
          // Cl- (negative anion) drifts to Anode (+) on right
          else {
            ion.x += driftSpeed;
            // When touches anode, gets oxidized to Cl2 gas
            if (ion.x >= anodeX - 4 && ion.y > beakerY + 20) {
              bubbles.push({ x: anodeX + Math.random() * electrodeW, y: ion.y, r: 3 + Math.random() * 3 });
              ion.x = beakerX + 40 + Math.random() * (beakerW - 160);
              ion.y = beakerY + 40 + Math.random() * (beakerH - 60);
            }
          }

          // Boundary bounce inside beaker
          if (ion.x < beakerX + 10) ion.x = beakerX + 15;
          if (ion.x > beakerX + beakerW - 10) ion.x = beakerX + beakerW - 15;
          if (ion.y < beakerY + 25) ion.y = beakerY + 30;
          if (ion.y > beakerY + beakerH - 10) ion.y = beakerY + beakerH - 15;
        });

        // Bubbles rising up from anode
        for (let i = bubbles.length - 1; i >= 0; i--) {
          bubbles[i].y -= 2.0;
          if (bubbles[i].y < beakerY + 15) {
            bubbles.splice(i, 1);
          }
        }
      }

      // 6. Draw Ions
      ions.forEach((ion) => {
        if (ion.type === 'Cu') {
          // Blue Cu2+ Cation
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(ion.x, ion.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0c4a6e';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Cu²⁺', ion.x, ion.y);
        } else {
          // Green Cl- Anion
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(ion.x, ion.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#14532d';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Cl⁻', ion.x, ion.y);
        }
      });

      // 7. Draw Chlorine Bubbles
      ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
      bubbles.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 8. Explicit Labels on Canvas
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ru' ? 'КАТОД (-)' : 'CATHODE (-)', cathodeX + electrodeW / 2, electrodeTop - 12);
      ctx.fillStyle = '#b45309';
      ctx.font = '10px monospace';
      ctx.fillText('Cu²⁺ + 2e⁻ → Cu⁰', cathodeX + electrodeW / 2, electrodeBottom + 18);
      ctx.fillText(lang === 'ru' ? '(Осадок чистой меди)' : '(Copper Coating)', cathodeX + electrodeW / 2, electrodeBottom + 30);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(lang === 'ru' ? 'АНОД (+)' : 'ANODE (+)', anodeX + electrodeW / 2, electrodeTop - 12);
      ctx.font = '10px monospace';
      ctx.fillText('2Cl⁻ - 2e⁻ → Cl₂↑', anodeX + electrodeW / 2, electrodeBottom + 18);
      ctx.fillText(lang === 'ru' ? '(Пузырьки хлора)' : '(Chlorine Gas)', anodeX + electrodeW / 2, electrodeBottom + 30);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [voltage, isPlaying, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-mono font-bold border border-amber-800">
              {lang === 'ru' ? '8–9 Класс • Химия' : 'Grade 8-9 • Chemistry'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Электролиз расплавов и растворов солей' : 'Electrolysis & Redox at Electrodes'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Электролиз CuCl₂: как электрический ток выбивает чистый металл из раствора' : 'Electrolysis: Current Extracting Pure Copper from Salt Solution'}
          </h3>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'НАПРЯЖЕНИЕ' : 'VOLTAGE'}</span>
            <span className="font-bold text-cyan-400 text-sm">{voltage} V</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ОСАЖДЕНО МЕДИ' : 'DEPOSITED COPPER'}</span>
            <span className="font-bold text-amber-400 text-sm">{copperMassMg.toFixed(2)} {lang === 'ru' ? 'мг' : 'mg'}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Voltage Slider */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 flex flex-col gap-1 w-full">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Напряжение источника тока:' : 'Electrolysis Voltage:'}</span>
            <span className="font-mono text-cyan-400 font-bold">{voltage} V</span>
          </div>
          <input
            type="range"
            min={1}
            max={18}
            step={1}
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            {lang === 'ru' ? 'Выше напряжение → мощнее электрическое поле → ионы Cu²⁺ и Cl⁻ мчатся к электродам быстрее!' : 'Higher voltage → stronger electric field → ions migrate to electrodes faster!'}
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
        >
          {isPlaying ? (lang === 'ru' ? 'Пауза' : 'Pause') : (lang === 'ru' ? 'Пуск' : 'Play')}
        </button>
      </div>
    </div>
  );
};
