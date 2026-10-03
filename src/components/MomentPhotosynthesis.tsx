import React, { useEffect, useRef, useState } from 'react';
import { Sun, Droplets, Wind, Sparkles, Play, Pause } from 'lucide-react';

interface MomentPhotosynthesisProps {
  lang: 'ru' | 'en';
}

export const MomentPhotosynthesis: React.FC<MomentPhotosynthesisProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightIntensity, setLightIntensity] = useState<number>(80); // %
  const [co2Level, setCo2Level] = useState<number>(60); // %
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Photosynthesis reaction rate
  const reactionRate = (lightIntensity / 100) * (co2Level / 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, w, h);

      if (isPlaying) {
        t += 0.03 * (0.5 + reactionRate);
      }

      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Draw Chloroplast Body (Oval with double membrane)
      const rx = 240;
      const ry = 130;

      // Outer membrane
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Stroma fill (green interior)
      const stromaGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, rx);
      stromaGrad.addColorStop(0, '#064e3b');
      stromaGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = stromaGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx - 3, ry - 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Thylakoid Stacks (Grana - coin stacks)
      const granaPositions = [
        { x: centerX - 120, y: centerY - 20, stacks: 4 },
        { x: centerX - 40, y: centerY + 10, stacks: 5 },
        { x: centerX + 50, y: centerY - 25, stacks: 4 },
        { x: centerX + 130, y: centerY + 15, stacks: 3 },
      ];

      granaPositions.forEach((g) => {
        for (let s = 0; s < g.stacks; s++) {
          const sy = g.y + s * 14;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.ellipse(g.x, sy, 28, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // 3. Incoming Sunlight Photons (Yellow particles stream from top-left)
      const photonCount = Math.floor((lightIntensity / 100) * 12);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      for (let i = 0; i < photonCount; i++) {
        const offset = (t * 60 + i * 40) % 260;
        const px = 60 + offset * 0.8;
        const py = 20 + offset * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 4. Incoming H2O (Blue water molecules entering)
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 6; i++) {
        const offset = (t * 40 + i * 35) % 180;
        const wx = centerX - 180 + offset * 0.6;
        const wy = h - 30 - offset * 0.3;
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Outgoing Oxygen O2 Bubbles (Exiting top)
      ctx.fillStyle = '#6ee7b7';
      for (let i = 0; i < Math.floor(reactionRate * 8); i++) {
        const offset = (t * 50 + i * 30) % 160;
        const ox = centerX - 60 + Math.sin(t + i) * 20;
        const oy = centerY - 40 - offset * 0.7;
        ctx.beginPath();
        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Calvin Cycle (CO2 -> Glucose C6H12O6 in Stroma)
      const calvinX = centerX + 110;
      const calvinY = centerY - 10;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(calvinX, calvinY, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Glucose molecules formed (sparkling hexagons)
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Глюкоза (C₆H₁₂O₆)', calvinX - 45, calvinY + 60);

      // Reaction summary formula inside
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('6CO₂ + 6H₂O + Свет → C₆H₁₂O₆ + 6O₂', centerX, h - 25);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [lightIntensity, co2Level, reactionRate, isPlaying]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
              {lang === 'ru' ? '6–7 Класс • Биология' : 'Grade 6-7 • Biology'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Хлоропласт: световая и темновая фазы' : 'Chloroplast: Light & Dark Reactions'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Фотосинтез: как растение превращает свет и воду в сахар и кислород' : 'Photosynthesis: Turning Sunlight & Water into Sugar & Oxygen'}
          </h3>
        </div>

        {/* Reaction rate badge */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'СКОРОСТЬ СИНТЕЗА' : 'SYNTHESIS RATE'}</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{(reactionRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="w-full h-full block" />
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              {lang === 'ru' ? 'Интенсивность света (Фотоны):' : 'Light Intensity (Photons):'}
            </span>
            <span className="font-mono text-yellow-400 font-bold">{lightIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={lightIntensity}
            onChange={(e) => setLightIntensity(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'ru' ? 'Концентрация CO₂ в воздухе:' : 'CO₂ Air Concentration:'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{co2Level}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={co2Level}
            onChange={(e) => setCo2Level(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
