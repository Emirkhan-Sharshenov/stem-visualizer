import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Compass, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';

interface MomentOpticsProps {
  lang: 'ru' | 'en';
}

export const MomentOptics: React.FC<MomentOpticsProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angleDeg, setAngleDeg] = useState<number>(45); // 0 to 85 degrees
  const [n1, setN1] = useState<number>(1.0); // Air
  const [n2, setN2] = useState<number>(1.5); // Glass
  const [isReverse, setIsReverse] = useState<boolean>(false); // From dense to air

  // Calculate refraction angle by Snell's law: n1 sin(a) = n2 sin(b)
  const actualN1 = isReverse ? n2 : n1;
  const actualN2 = isReverse ? n1 : n2;

  const alphaRad = (angleDeg * Math.PI) / 180;
  const sinBeta = (actualN1 / actualN2) * Math.sin(alphaRad);
  const isTotalInternalReflection = sinBeta > 1.0;
  const betaRad = isTotalInternalReflection ? alphaRad : Math.asin(sinBeta);
  const betaDeg = isTotalInternalReflection ? angleDeg : (betaRad * 180) / Math.PI;

  // Critical angle if light travels from dense to rare
  const criticalAngleDeg = actualN1 > actualN2 ? (Math.asin(actualN2 / actualN1) * 180) / Math.PI : null;

  // Draw optics scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);
    const midY = h / 2;
    const midX = w / 2;

    // Clear
    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, w, h);

    // Medium 1 (Top half)
    ctx.fillStyle = isReverse ? 'rgba(56, 189, 248, 0.15)' : '#17181B';
    ctx.fillRect(0, 0, w, midY);

    // Medium 2 (Bottom half - denser)
    ctx.fillStyle = isReverse ? '#17181B' : 'rgba(56, 189, 248, 0.18)';
    ctx.fillRect(0, midY, w, midY);

    // Boundary interface line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Normal line (vertical dashed line)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Medium Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${lang === 'ru' ? 'Среда 1' : 'Medium 1'}: n = ${actualN1.toFixed(2)}`, 25, 35);
    ctx.fillText(`${lang === 'ru' ? 'Среда 2' : 'Medium 2'}: n = ${actualN2.toFixed(2)}`, 25, midY + 35);

    // Incident Ray (Incoming from top-left toward midX, midY)
    const rayLength = 220;
    const srcX = midX - Math.sin(alphaRad) * rayLength;
    const srcY = midY - Math.cos(alphaRad) * rayLength;

    // Glowing laser beam
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(srcX, srcY);
    ctx.lineTo(midX, midY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrow on incident ray
    const midIncX = (srcX + midX) / 2;
    const midIncY = (srcY + midY) / 2;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(midIncX, midIncY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Reflected Ray (always present, but bright when Total Internal Reflection)
    const reflX = midX + Math.sin(alphaRad) * rayLength;
    const reflY = midY - Math.cos(alphaRad) * rayLength;
    ctx.strokeStyle = isTotalInternalReflection ? '#f43f5e' : 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = isTotalInternalReflection ? 4 : 1.5;
    if (isTotalInternalReflection) {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(reflX, reflY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Refracted Ray into Medium 2 (if not total internal reflection)
    if (!isTotalInternalReflection) {
      const refrX = midX + Math.sin(betaRad) * rayLength;
      const refrY = midY + Math.cos(betaRad) * rayLength;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(refrX, refrY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw angle arcs
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 40, -Math.PI / 2 - alphaRad, -Math.PI / 2);
      ctx.stroke();

      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(midX, midY, 45, Math.PI / 2 - betaRad, Math.PI / 2);
      ctx.stroke();
    }
  }, [angleDeg, n1, n2, isReverse, alphaRad, betaRad, isTotalInternalReflection, actualN1, actualN2, lang]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Viewport */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Преломление света и закон Снеллиуса' : 'Light Refraction & Snell\'s Law'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {lang === 'ru' ? '7-8 Класс' : 'Grade 7-8'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Меняй угол падения и наблюдай преломление и полное внутреннее отражение' : 'Adjust incident angle and observe refraction and total internal reflection'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReverse(!isReverse)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            {isReverse
              ? (lang === 'ru' ? 'Направление: Стекло → Воздух' : 'Direction: Glass → Air')
              : (lang === 'ru' ? 'Направление: Воздух → Стекло' : 'Direction: Air → Glass')}
          </button>
        </div>

        {/* Live Gauges Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span>{lang === 'ru' ? 'Угол падения' : 'Angle of incidence'} α = <strong className="text-rose-400">{angleDeg}°</strong></span>
            <span>
              {lang === 'ru' ? 'Угол преломления' : 'Angle of refraction'} β ={' '}
              <strong className={isTotalInternalReflection ? 'text-amber-400' : 'text-cyan-400'}>
                {isTotalInternalReflection ? (lang === 'ru' ? 'НЕТ (Полное отражение!)' : 'None (Total Internal Reflection!)') : `${betaDeg.toFixed(1)}°`}
              </strong>
            </span>
          </div>

          {criticalAngleDeg && (
            <span className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              {lang === 'ru' ? 'Критический угол' : 'Critical Angle'}: {criticalAngleDeg.toFixed(1)}°
            </span>
          )}
        </div>

        {/* Canvas */}
        <div className="lab-stage relative w-full flex items-center justify-center p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={380}
            className="block w-full h-auto max-h-[480px] object-contain rounded-xl"
          />

          {isTotalInternalReflection && (
            <div className="absolute top-6 right-6 p-3 bg-amber-950/90 border border-amber-500/60 backdrop-blur-md rounded-xl text-xs text-amber-200 max-w-xs shadow-xl animate-pulse">
              <span className="font-bold font-mono">{lang === 'ru' ? 'ПОЛНОЕ ВНУТРЕННЕЕ ОТРАЖЕНИЕ!' : 'TOTAL INTERNAL REFLECTION!'}</span>
              <p className="text-[11px] mt-1">
                {lang === 'ru'
                  ? 'Свет не может выйти в воздух, потому что угол падения превысил критический. Луч на 100% отражается обратно! (Так работает оптоволоконный интернет).'
                  : 'Light cannot escape into the air. 100% of light is trapped and reflected back! This powers modern fiber-optic internet.'}
              </p>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Угол падения луча α' : 'Incident Angle α'}</span>
              <span className="font-mono text-rose-400 font-bold">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="85"
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Показатель преломления стекла n₂' : 'Refractive Index n₂'}</span>
              <span className="font-mono text-cyan-400 font-bold">{n2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.1"
              max="2.4"
              step="0.05"
              value={n2}
              onChange={(e) => setN2(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Textbook Insight */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Почему луч сгибается?' : 'Why does light bend?'}
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block mb-1">
              {lang === 'ru' ? 'АНАЛОГИЯ С КОЛЕСАМИ В ПЕСКЕ:' : 'THE LAWNMOWER ANALOGY:'}
            </span>
            {lang === 'ru'
              ? 'Свет сгибается не потому, что его что-то «ломает», а потому что в стекле фазовая скорость света МЕНЬШЕ, чем в воздухе (v = c/n). Край светового фронта, входящий в стекло первым, притормаживает — и луч плавно поворачивает!'
              : 'Light bends simply because it travels SLOWER in glass than in air (v = c/n). The side of the wavefront entering glass first decelerates, turning the entire beam!'}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs font-mono text-indigo-300">
            <code>n₁ · sin(α) = n₂ · sin(β)</code>
          </div>
        </div>
      </div>
    </div>
  );
};
