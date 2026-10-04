import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Zap, Play, Pause, RotateCcw, AlertTriangle, Lightbulb } from 'lucide-react';

interface MomentCircuitProps {
  lang: 'ru' | 'en';
}

export const MomentCircuit: React.FC<MomentCircuitProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [resistance, setResistance] = useState<number>(6); // Ohms
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [switchClosed, setSwitchClosed] = useState<boolean>(true);

  // Ohm's law: I = U / R
  const current = switchClosed ? voltage / Math.max(0.5, resistance) : 0;
  const power = current * voltage; // Watts (brightness / heat)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let electronOffset = 0;

    // Fixed wire circuit layout
    const paddingX = 80;
    const paddingY = 60;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      const x1 = paddingX;
      const y1 = paddingY;
      const x2 = w - paddingX;
      const y2 = h - paddingY;

      // Draw Circuit Wires
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#34363C';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // Top wire (battery to switch to resistor)
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);
      // Right wire (resistor down to bulb)
      ctx.lineTo(x2, y2);
      // Bottom wire (bulb back to battery)
      ctx.lineTo(x1, y2);
      // Left wire (closing circuit through battery)
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Battery on Left side (x1, middle)
      const batY = (y1 + y2) / 2;
      ctx.fillStyle = '#26282D';
      ctx.fillRect(x1 - 20, batY - 35, 40, 70);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1 - 20, batY - 35, 40, 70);

      // Battery plates
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x1 - 10, batY - 42, 20, 8); // + terminal
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', x1, batY - 18);
      ctx.fillText('-', x1, batY + 28);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${voltage}V`, x1, batY + 4);

      // Switch on Top wire
      const switchX = (x1 + x2) * 0.35;
      ctx.fillStyle = '#111214';
      ctx.fillRect(switchX - 25, y1 - 10, 50, 20); // clear wire under switch
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(switchX - 20, y1, 5, 0, Math.PI * 2);
      ctx.arc(switchX + 20, y1, 5, 0, Math.PI * 2);
      ctx.fill();

      // Switch lever
      ctx.lineWidth = 4;
      ctx.strokeStyle = switchClosed ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(switchX - 20, y1);
      if (switchClosed) {
        ctx.lineTo(switchX + 20, y1);
      } else {
        ctx.lineTo(switchX + 15, y1 - 25);
      }
      ctx.stroke();

      // Resistor on Right wire
      const resY = (y1 + y2) / 2;
      ctx.fillStyle = '#111214';
      ctx.fillRect(x2 - 12, resY - 35, 24, 70);
      ctx.fillStyle = '#26282D';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(x2 - 16, resY - 30, 32, 60);
      ctx.strokeRect(x2 - 16, resY - 30, 32, 60);

      // Resistor stripes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x2 - 14, resY - 20, 28, 4);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x2 - 14, resY - 8, 28, 4);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x2 - 14, resY + 4, 28, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(`${resistance}Ω`, x2, resY + 22);

      // Light Bulb on Bottom wire
      const bulbX = (x1 + x2) / 2;
      ctx.fillStyle = '#111214';
      ctx.fillRect(bulbX - 25, y2 - 10, 50, 20);

      // Bulb glow
      if (switchClosed && current > 0.05) {
        const glowRadius = Math.min(60, 15 + power * 1.5);
        const glowGrad = ctx.createRadialGradient(bulbX, y2, 5, bulbX, y2, glowRadius);
        glowGrad.addColorStop(0, `rgba(250, 204, 21, ${Math.min(0.9, 0.2 + current * 0.15)})`);
        glowGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(bulbX, y2, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bulb glass & filament
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bulbX, y2, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = switchClosed && current > 0.1 ? '#fef08a' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bulbX - 6, y2 + 6);
      ctx.lineTo(bulbX, y2 - 6);
      ctx.lineTo(bulbX + 6, y2 + 6);
      ctx.stroke();

      // Electron Drift Animation
      if (switchClosed && current > 0.01) {
        if (isPlaying) {
          electronOffset += current * 1.2;
        }

        // Circuit perimeter total length
        const totalPerimeter = 2 * (x2 - x1) + 2 * (y2 - y1);
        const numElectrons = 36;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;

        for (let i = 0; i < numElectrons; i++) {
          const dist = ((i * (totalPerimeter / numElectrons) + electronOffset) % totalPerimeter + totalPerimeter) % totalPerimeter;
          let ex = x1;
          let ey = y1;

          // Wire traversal order (counter-clockwise: electrons move from negative to positive)
          const seg1 = y2 - y1; // left wire down
          const seg2 = seg1 + (x2 - x1); // bottom wire right
          const seg3 = seg2 + (y2 - y1); // right wire up
          const seg4 = seg3 + (x2 - x1); // top wire left

          if (dist < seg1) {
            // Down on left
            ex = x1;
            ey = y1 + dist;
          } else if (dist < seg2) {
            // Right on bottom
            ex = x1 + (dist - seg1);
            ey = y2;
          } else if (dist < seg3) {
            // Up on right
            ex = x2;
            ey = y2 - (dist - seg2);
          } else {
            // Left on top
            ex = x2 - (dist - seg3);
            ey = y1;
          }

          ctx.beginPath();
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [voltage, resistance, switchClosed, isPlaying, current, power]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              {lang === 'ru' ? '8 Класс • Физика' : 'Grade 8 • Physics'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Закон Ома: I = U / R' : "Ohm's Law: I = V / R"}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Электрическая цепь: движение электронов и сопротивление' : 'Electric Circuit: Electron Drift & Resistance'}
          </h3>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono block">{lang === 'ru' ? 'НАПРЯЖЕНИЕ (U)' : 'VOLTAGE (V)'}</span>
            <span className="text-sm font-mono font-bold text-cyan-400">{voltage} V</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono block">{lang === 'ru' ? 'СОПРОТИВЛЕНИЕ (R)' : 'RESISTANCE (R)'}</span>
            <span className="text-sm font-mono font-bold text-amber-400">{resistance} Ω</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono block">{lang === 'ru' ? 'ТОК (I)' : 'CURRENT (I)'}</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{current.toFixed(2)} A</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-mono block">{lang === 'ru' ? 'МОЩНОСТЬ (P)' : 'POWER (P)'}</span>
            <span className="text-sm font-mono font-bold text-yellow-400">{power.toFixed(1)} W</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="block w-full h-auto max-h-[480px] object-contain" />
        
        {/* Switch toggle overlay button */}
        <button
          onClick={() => setSwitchClosed(!switchClosed)}
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            switchClosed
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {switchClosed ? (lang === 'ru' ? 'Ключ замкнут (Ток течет)' : 'Switch Closed') : (lang === 'ru' ? 'Ключ разомкнут (Цепь разорвана)' : 'Switch Open')}
        </button>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Напряжение источника (U):' : 'Source Voltage (V):'}</span>
            <span className="font-mono text-cyan-400 font-bold">{voltage} V</span>
          </div>
          <input
            type="range"
            min={1}
            max={36}
            step={1}
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            {lang === 'ru' ? 'Увеличивает разность потенциалов — электрическое поле толкает электроны быстрее!' : 'Increases potential difference — pushing electrons with greater electric field!'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Сопротивление резистора (R):' : 'Resistance (R):'}</span>
            <span className="font-mono text-amber-400 font-bold">{resistance} Ω</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            {lang === 'ru' ? 'Ионы решетки мешают движению электронов, превращая энергию движения в тепло (Q = I²Rt)' : 'Lattice ions obstruct electron flow, converting drift kinetic energy into Joule heating (Q = I²Rt)'}
          </span>
        </div>
      </div>
    </div>
  );
};
