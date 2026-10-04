import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas, logicalHeight } from '../lib/canvas';
import { Volume2, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

interface MomentDopplerWaveProps {
  lang: 'ru' | 'en';
}

interface Wavefront {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export const MomentDopplerWave: React.FC<MomentDopplerWaveProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceSpeed, setSourceSpeed] = useState<number>(1.2); // v / v_sound (Mach number 0 to 1.8)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sourceX = 100;
    const sourceY = logicalHeight(canvas) / 2;
    const waveSpeed = 2.0; // speed of sound
    const waves: Wavefront[] = [];
    let tick = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      if (isPlaying) {
        tick++;
        // Move source to the right
        sourceX += sourceSpeed * waveSpeed;
        if (sourceX > w - 80) {
          sourceX = 80;
          waves.length = 0; // reset ripples
        }

        // Emit new circular wave every 12 frames
        if (tick % 12 === 0) {
          waves.push({
            x: sourceX,
            y: sourceY,
            radius: 4,
            alpha: 1.0,
          });
        }

        // Expand existing waves at speed of sound
        for (let i = waves.length - 1; i >= 0; i--) {
          waves[i].radius += waveSpeed;
          waves[i].alpha -= 0.003;
          if (waves[i].alpha <= 0) {
            waves.splice(i, 1);
          }
        }
      }

      // 1. Draw Wavefronts
      ctx.lineWidth = 1.8;
      waves.forEach((wave) => {
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, wave.alpha)})`;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 2. Draw Mach Shockwave Cone if supersonic (sourceSpeed >= 1.0)
      if (sourceSpeed >= 1.0) {
        const machAngle = Math.asin(1.0 / sourceSpeed);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        const coneLen = 350;
        // Upper cone ray
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(sourceX - coneLen * Math.cos(machAngle), sourceY - coneLen * Math.sin(machAngle));
        // Lower cone ray
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(sourceX - coneLen * Math.cos(machAngle), sourceY + coneLen * Math.sin(machAngle));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(lang === 'ru' ? 'УДАРНАЯ ВОЛНА МАХА (Сверхзвук!)' : 'MACH SHOCK CONE (Supersonic!)', sourceX - 180, sourceY - 70);
      }

      // 3. Observers (Front Observer A and Back Observer B)
      const obsAY = sourceY;
      const obsAX = w - 50;
      const obsBX = 50;
      const obsBY = sourceY;

      // Observer A (Right)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(obsAX, obsAY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ru' ? 'Слушатель А' : 'Observer A', obsAX, obsAY + 22);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(lang === 'ru' ? 'Высокий тон ' : 'High Pitch ', obsAX, obsAY + 34);

      // Observer B (Left)
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(obsBX, obsBY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(lang === 'ru' ? 'Слушатель Б' : 'Observer B', obsBX, obsBY + 22);
      ctx.fillStyle = '#a855f7';
      ctx.fillText(lang === 'ru' ? 'Низкий тон ' : 'Low Pitch ', obsBX, obsBY + 34);

      // 4. Moving Sound Source (Ambulance / Siren)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(sourceX - 16, sourceY - 10, 32, 20, [4]);
      ctx.fill();
      // Flashing siren light
      ctx.fillStyle = tick % 10 > 5 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(sourceX, sourceY - 14, 5, 0, Math.PI * 2);
      ctx.fill();

      // Velocity Vector Arrow
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(sourceX + sourceSpeed * 25, sourceY);
      ctx.stroke();

      // Clear Callout labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      if (sourceX < w - 200) {
        ctx.fillText(lang === 'ru' ? 'Сжатые гребни (λ\' < λ, f\' > f)' : 'Compressed waves (λ\' < λ, f\' > f)', sourceX + 80, sourceY - 30);
      }
      if (sourceX > 180) {
        ctx.fillText(lang === 'ru' ? 'Растянутые гребни (λ\' > λ, f\' < f)' : 'Stretched waves (λ\' > λ, f\' < f)', sourceX - 100, sourceY + 45);
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [sourceSpeed, isPlaying, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              {lang === 'ru' ? '9 Класс • Физика' : 'Grade 9 • Physics'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Эффект Допплера: f\' = f₀ · v / (v ∓ vₛ)' : "Doppler Effect: f' = f₀ · v / (v ∓ vₛ)"}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Эффект Допплера: почему сирена скорой помощи меняет тон при приближении' : 'Doppler Effect: Why Sirens Change Pitch as They Rush By'}
          </h3>
        </div>

        {/* Mach Indicator */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ЧИСЛО МАХА (v / v_звука)' : 'MACH NUMBER'}</span>
            <span className={`font-bold text-sm ${sourceSpeed >= 1.0 ? 'text-rose-400' : 'text-cyan-400'}`}>
              M = {sourceSpeed.toFixed(2)} {sourceSpeed >= 1.0 ? (lang === 'ru' ? '(Сверхзвук!)' : '(Supersonic!)') : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Speed Slider */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 flex flex-col gap-1 w-full">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Скорость источника звука (v_s):' : 'Sound Source Velocity (v_s):'}</span>
            <span className="font-mono text-yellow-400 font-bold">
              {sourceSpeed === 0 ? (lang === 'ru' ? 'Покой (0 м/с)' : 'Rest') : `${sourceSpeed.toFixed(2)} × Скорости звука`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1.8}
            step={0.05}
            value={sourceSpeed}
            onChange={(e) => setSourceSpeed(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{lang === 'ru' ? '0.0 (Стоит на месте)' : '0.0 (At rest)'}</span>
            <span>{lang === 'ru' ? '1.0 (Звуковой барьер)' : '1.0 (Sound barrier)'}</span>
            <span>{lang === 'ru' ? '1.8 (Сверхзвуковой конус Маха)' : '1.8 (Supersonic Mach cone)'}</span>
          </div>
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
