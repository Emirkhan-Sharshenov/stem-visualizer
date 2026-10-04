import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Compass, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

interface MomentPythagorasProofProps {
  lang: 'ru' | 'en';
}

export const MomentPythagorasProof: React.FC<MomentPythagorasProofProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [legA, setLegA] = useState<number>(3); // 3 units
  const [legB, setLegB] = useState<number>(4); // 4 units
  const [morphFrac, setMorphFrac] = useState<number>(0); // 0 (original separate squares) to 1 (merged in c^2)

  const hypC = Math.sqrt(legA * legA + legB * legB);
  const areaA = legA * legA;
  const areaB = legB * legB;
  const areaC = hypC * hypC;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);

    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, w, h);

    const scale = 24; // px per unit
    const originX = w / 2 - 30;
    const originY = h / 2 + 50;

    const aPx = legA * scale;
    const bPx = legB * scale;

    // Triangle vertices:
    // Right angle at (originX, originY)
    // Vertex 1: (originX, originY - aPx)
    // Vertex 2: (originX + bPx, originY)
    const pRight = { x: originX, y: originY };
    const pTop = { x: originX, y: originY - aPx };
    const pBase = { x: originX + bPx, y: originY };

    // 1. Draw Right Triangle
    ctx.fillStyle = '#26282D';
    ctx.beginPath();
    ctx.moveTo(pRight.x, pRight.y);
    ctx.lineTo(pTop.x, pTop.y);
    ctx.lineTo(pBase.x, pBase.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right angle square marker
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(originX, originY - 14, 14, 14);

    // 2. Draw Square on Leg A (Left)
    // Interpolate position based on morphFrac
    const aSquareX = originX - aPx * (1 - morphFrac * 0.7);
    const aSquareY = originY - aPx;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(aSquareX, aSquareY, aPx, aPx);
    ctx.strokeRect(aSquareX, aSquareY, aPx, aPx);

    // 3. Draw Square on Leg B (Bottom)
    const bSquareX = originX;
    const bSquareY = originY + bPx * (1 - morphFrac * 0.7) - bPx;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.strokeStyle = '#f59e0b';
    ctx.fillRect(bSquareX, originY, bPx, bPx);
    ctx.strokeRect(bSquareX, originY, bPx, bPx);

    // 4. Draw Square on Hypotenuse C (Slanted)
    // Vector from pTop to pBase
    const dx = pBase.x - pTop.x;
    const dy = pBase.y - pTop.y;
    // Normal vector pointing outward
    const nx = -dy;
    const ny = dx;

    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pBase.x, pBase.y);
    ctx.lineTo(pBase.x + nx, pBase.y + ny);
    ctx.lineTo(pTop.x + nx, pTop.y + ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Grid tiles inside Square C if morphFrac > 0.5
    if (morphFrac > 0.4) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(lang === 'ru' ? 'Площадь c² = a² + b²' : 'Area c² = a² + b²', (pTop.x + pBase.x + nx) / 2 - 40, (pTop.y + pBase.y + ny) / 2);
    }

    // 5. On-Screen Callout Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`a = ${legA}`, originX - aPx / 2, originY - aPx / 2 + 5);
    ctx.fillText(`a² = ${areaA}`, aSquareX + aPx / 2, aSquareY + aPx / 2 + 5);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`b = ${legB}`, originX + bPx / 2, originY + 16);
    ctx.fillText(`b² = ${areaB}`, bSquareX + bPx / 2, originY + bPx / 2 + 5);

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`c = ${hypC.toFixed(1)}`, (pTop.x + pBase.x) / 2 + 15, (pTop.y + pBase.y) / 2 - 10);
  }, [legA, legB, morphFrac, areaA, areaB, hypC, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 font-mono font-bold border border-purple-800">
              {lang === 'ru' ? '8 Класс • Геометрия' : 'Grade 8 • Geometry'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Теорема Пифагора: a² + b² = c²' : 'Pythagorean Theorem: a² + b² = c²'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Геометрическое доказательство: переливание площадей квадратов катетов в гипотенузу' : 'Geometric Proof: Water/Square Flow from Legs to Hypotenuse'}
          </h3>
        </div>

        {/* Live Equation Badge */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-cyan-400 font-bold">{areaA}</span>
          <span className="text-slate-500">+</span>
          <span className="text-amber-400 font-bold">{areaB}</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-400 font-bold text-sm">{areaC.toFixed(0)}</span>
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
            <span className="text-slate-400">{lang === 'ru' ? 'Длина катета a:' : 'Leg a length:'}</span>
            <span className="font-mono text-cyan-400 font-bold">{legA}</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={legA}
            onChange={(e) => setLegA(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Длина катета b:' : 'Leg b length:'}</span>
            <span className="font-mono text-amber-400 font-bold">{legB}</span>
          </div>
          <input
            type="range"
            min={2}
            max={7}
            step={1}
            value={legB}
            onChange={(e) => setLegB(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{lang === 'ru' ? 'Перекладывание площадей:' : 'Square Area Transfer:'}</span>
            <span className="font-mono text-emerald-400 font-bold">{(morphFrac * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={morphFrac}
            onChange={(e) => setMorphFrac(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
