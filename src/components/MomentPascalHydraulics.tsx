import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { ArrowDown, ArrowUp, RefreshCw, HelpCircle, Info } from 'lucide-react';

interface MomentPascalHydraulicsProps {
  lang: 'ru' | 'en';
}

export const MomentPascalHydraulics: React.FC<MomentPascalHydraulicsProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [f1Force, setF1Force] = useState<number>(100); // Newtons applied by hand
  const [areaRatio, setAreaRatio] = useState<number>(10); // S2 / S1 (10x force multiplier)
  const [displacement, setDisplacement] = useState<number>(40); // px pushed down

  const s1Area = 10; // cm2
  const s2Area = s1Area * areaRatio; // cm2
  const f2LiftForce = f1Force * areaRatio; // Newtons
  const carMassKg = 1200;
  const gravityWeight = carMassKg * 9.8; // ~11760 N

  const pressureKPa = (f1Force / (s1Area * 0.0001)) / 1000; // kPa

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);

    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, w, h);

    // Vessel dimensions
    const groundY = h - 60;
    const pipeHeight = 35;

    // Cylinder 1 (Left - Narrow)
    const c1X = 140;
    const c1W = 60;
    const c1Top = 80;

    // Cylinder 2 (Right - Wide)
    const c2X = w - 240;
    const c2W = 160;
    const c2Top = 80;

    // Fluid levels
    const h1Offset = displacement; // moves down
    const h2Offset = displacement / areaRatio; // moves up by h1 / ratio

    const fluidY1 = 150 + h1Offset;
    const fluidY2 = 190 - h2Offset;

    // 1. Draw Liquid (Connected U-Tube)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    // Start at liquid surface 1
    ctx.moveTo(c1X, fluidY1);
    ctx.lineTo(c1X + c1W, fluidY1);
    ctx.lineTo(c1X + c1W, groundY - pipeHeight);
    ctx.lineTo(c2X, groundY - pipeHeight);
    ctx.lineTo(c2X, fluidY2);
    ctx.lineTo(c2X + c2W, fluidY2);
    ctx.lineTo(c2X + c2W, groundY);
    ctx.lineTo(c1X, groundY);
    ctx.closePath();
    ctx.fill();

    // Liquid glowing surface waves
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(c1X, fluidY1);
    ctx.lineTo(c1X + c1W, fluidY1);
    ctx.moveTo(c2X, fluidY2);
    ctx.lineTo(c2X + c2W, fluidY2);
    ctx.stroke();

    // 2. Draw Vessel Walls
    ctx.strokeStyle = '#4A4D55';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left tube left wall
    ctx.moveTo(c1X, c1Top);
    ctx.lineTo(c1X, groundY);
    ctx.lineTo(c2X + c2W, groundY);
    ctx.lineTo(c2X + c2W, c2Top);

    // Inner tube walls
    ctx.moveTo(c1X + c1W, c1Top);
    ctx.lineTo(c1X + c1W, groundY - pipeHeight);
    ctx.lineTo(c2X, groundY - pipeHeight);
    ctx.lineTo(c2X, c2Top);
    ctx.stroke();

    // 3. Draw Small Piston 1 (Left)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(c1X + 2, fluidY1 - 18, c1W - 4, 18);
    // Piston Rod 1
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(c1X + c1W / 2 - 4, fluidY1 - 70, 8, 55);

    // Downward Force Arrow F1
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(c1X + c1W / 2, fluidY1 - 95);
    ctx.lineTo(c1X + c1W / 2, fluidY1 - 72);
    ctx.stroke();
    // Arrow head
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(c1X + c1W / 2, fluidY1 - 65);
    ctx.lineTo(c1X + c1W / 2 - 8, fluidY1 - 75);
    ctx.lineTo(c1X + c1W / 2 + 8, fluidY1 - 75);
    ctx.fill();

    // 4. Draw Large Piston 2 (Right)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(c2X + 2, fluidY2 - 22, c2W - 4, 22);
    // Piston Rods 2
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(c2X + 30, fluidY2 - 50, 10, 30);
    ctx.fillRect(c2X + c2W - 40, fluidY2 - 50, 10, 30);
    // Platform
    ctx.fillStyle = '#34363C';
    ctx.fillRect(c2X - 10, fluidY2 - 60, c2W + 20, 12);

    // Car on Platform
    const carX = c2X + c2W / 2;
    const carY = fluidY2 - 60;
    // Car body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(carX - 60, carY - 26, 120, 26, [8, 8, 2, 2]);
    ctx.fill();
    // Car cabin
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.roundRect(carX - 35, carY - 48, 70, 24, [10, 10, 0, 0]);
    ctx.fill();
    // Car windows
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(carX - 28, carY - 44, 24, 16);
    ctx.fillRect(carX + 4, carY - 44, 24, 16);
    // Car wheels
    ctx.fillStyle = '#17181B';
    ctx.beginPath();
    ctx.arc(carX - 40, carY, 10, 0, Math.PI * 2);
    ctx.arc(carX + 40, carY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Upward Lift Force Arrow F2
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(carX, carY + 30);
    ctx.lineTo(carX, carY + 8);
    ctx.stroke();
    // Arrow head
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(carX, carY);
    ctx.lineTo(carX - 10, carY + 14);
    ctx.lineTo(carX + 10, carY + 14);
    ctx.fill();

    // Pressure distribution lines in liquid (Pascal's principle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    const midTubeY = groundY - pipeHeight / 2;
    ctx.beginPath();
    ctx.moveTo(c1X + c1W / 2, fluidY1);
    ctx.lineTo(c1X + c1W / 2, midTubeY);
    ctx.lineTo(c2X + c2W / 2, midTubeY);
    ctx.lineTo(c2X + c2W / 2, fluidY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Clear Labels on Canvas
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'ru' ? 'МАЛЫЙ ПОРШЕНЬ' : 'SMALL PISTON', c1X + c1W / 2, fluidY1 - 105);
    ctx.fillText(`S₁ = ${s1Area} см²`, c1X + c1W / 2, fluidY1 - 120);

    ctx.fillStyle = '#ef4444';
    ctx.fillText(`F₁ = ${f1Force} Н`, c1X + c1W / 2, fluidY1 + 35);

    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'ru' ? 'БОЛЬШОЙ ПОРШЕНЬ' : 'LARGE PISTON', carX, carY - 60);
    ctx.fillText(`S₂ = ${s2Area} см² (${areaRatio}x)`, carX, carY - 75);

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`F₂ = ${f2LiftForce.toFixed(0)} Н`, carX, fluidY2 + 45);

    // Liquid pressure badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      lang === 'ru'
        ? `Давление p = ${pressureKPa.toFixed(1)} кПа (передаётся во все точки одинаково)`
        : `Pressure p = ${pressureKPa.toFixed(1)} kPa (transmitted equally everywhere)`,
      w / 2,
      groundY + 22
    );
  }, [f1Force, areaRatio, displacement, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              {lang === 'ru' ? '7 Класс • Физика' : 'Grade 7 • Physics'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Закон Паскаля: p = F₁ / S₁ = F₂ / S₂' : "Pascal's Law: p = F₁ / S₁ = F₂ / S₂"}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Гидравлический пресс: как поднять тяжелую машину силой одной руки' : 'Hydraulic Press: Lifting a Heavy Car with One Hand'}
          </h3>
        </div>

        {/* Live Multiplier Badge */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ВЫИГРЫШ В СИЛЕ' : 'FORCE MULTIPLIER'}</span>
            <span className="font-bold text-emerald-400 text-sm">{areaRatio}× РАЗ</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'СИЛА ПОДЪЕМА F₂' : 'LIFT FORCE F₂'}</span>
            <span className="font-bold text-cyan-400 text-sm">{f2LiftForce.toFixed(0)} Н</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Сила нажатия рукой (F₁):' : 'Hand Push Force (F₁):'}</span>
            <span className="font-mono text-amber-400 font-bold">{f1Force} Н</span>
          </div>
          <input
            type="range"
            min={20}
            max={300}
            step={10}
            value={f1Force}
            onChange={(e) => setF1Force(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Отношение площадей (S₂ / S₁):' : 'Area Ratio (S₂ / S₁):'}</span>
            <span className="font-mono text-emerald-400 font-bold">{areaRatio}×</span>
          </div>
          <input
            type="range"
            min={2}
            max={25}
            step={1}
            value={areaRatio}
            onChange={(e) => setAreaRatio(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Ход малого поршня (h₁):' : 'Piston Stroke (h₁):'}</span>
            <span className="font-mono text-cyan-400 font-bold">{displacement} мм</span>
          </div>
          <input
            type="range"
            min={5}
            max={70}
            step={2}
            value={displacement}
            onChange={(e) => setDisplacement(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Golden Rule of Mechanics Callout */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300 mr-1.5">
            {lang === 'ru' ? 'Золотое правило механики:' : 'Golden Rule of Mechanics:'}
          </span>
          {lang === 'ru'
            ? `Выигрывая в силе в ${areaRatio} раз, мы ровно во столько же раз проигрываем в расстоянии! Чтобы поднять машину на 1 см, маленький поршень нужно вдавить на ${areaRatio} см.`
            : `Gaining ${areaRatio}x in force means losing ${areaRatio}x in distance! To lift the car 1 cm, you must push the small piston down ${areaRatio} cm.`}
        </div>
      </div>
    </div>
  );
};
