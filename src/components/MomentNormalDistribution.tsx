import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

interface MomentNormalDistributionProps {
  lang: 'ru' | 'en';
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  isLanded: boolean;
}

export const MomentNormalDistribution: React.FC<MomentNormalDistributionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [totalBalls, setTotalBalls] = useState<number>(0);

  const numBins = 15;
  const binsRef = useRef<number[]>(new Array(numBins).fill(0));
  const ballsRef = useRef<Ball[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const { w, h } = fitCanvas(canvas, ctx);

    const pegRows = 8;
    const pegSpacingY = 16;
    const pegSpacingX = 22;
    const funnelX = w / 2;
    const funnelY = 40;

    const binBottom = h - 25;
    const binW = (pegRows * pegSpacingX * 2) / numBins;
    const binStartX = funnelX - (numBins * binW) / 2;

    const render = () => {
      animId = requestAnimationFrame(render);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // 1. Spawn new balls from funnel
      if (isPlaying) {
        tick++;
        if (tick % 4 === 0 && ballsRef.current.length < 60) {
          ballsRef.current.push({
            x: funnelX + (Math.random() - 0.5) * 4,
            y: funnelY,
            vx: 0,
            vy: 2.0,
            row: 0,
            isLanded: false,
          });
          setTotalBalls((prev) => prev + 1);
        }

        // Update balls physics
        for (let i = ballsRef.current.length - 1; i >= 0; i--) {
          const ball = ballsRef.current[i];
          ball.y += ball.vy;
          ball.x += ball.vx;
          ball.vy += 0.15; // gravity

          // Peg collisions
          const rowIdx = Math.floor((ball.y - funnelY) / pegSpacingY);
          if (rowIdx > ball.row && rowIdx <= pegRows) {
            ball.row = rowIdx;
            // 50% chance to deflect left or right
            ball.vx = (Math.random() < 0.5 ? -1 : 1) * 1.2;
            ball.vy = 1.0;
          }

          // Land in bins
          if (ball.y >= binBottom - 60) {
            const binIdx = Math.floor((ball.x - binStartX) / binW);
            if (binIdx >= 0 && binIdx < numBins) {
              binsRef.current[binIdx]++;
            }
            ballsRef.current.splice(i, 1);
          }
        }
      }

      // 2. Draw Pegs (Triangle matrix)
      ctx.fillStyle = '#64748b';
      for (let r = 1; r <= pegRows; r++) {
        const py = funnelY + r * pegSpacingY;
        const countInRow = r + 1;
        const rowStartX = funnelX - (countInRow - 1) * (pegSpacingX / 2);
        for (let c = 0; c < countInRow; c++) {
          const px = rowStartX + c * pegSpacingX;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Bins & Accumulated Histogram Columns
      const maxColH = 80;
      const maxBinVal = Math.max(1, ...binsRef.current);

      for (let b = 0; b < numBins; b++) {
        const bx = binStartX + b * binW;
        const colHeight = (binsRef.current[b] / maxBinVal) * maxColH;

        // Histogram bar
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 1, binBottom - colHeight, binW - 2, colHeight);

        // Bin vertical separator walls
        ctx.strokeStyle = '#34363C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, binBottom - 85);
        ctx.lineTo(bx, binBottom);
        ctx.stroke();
      }

      // 4. Theoretical Gaussian Bell Curve Overlay (Smooth green line)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const meanBin = numBins / 2;
      const sigma = 2.2;
      for (let x = 0; x < numBins * binW; x += 3) {
        const binF = x / binW;
        const gauss = Math.exp(-Math.pow(binF - meanBin, 2) / (2 * sigma * sigma));
        const gy = binBottom - gauss * maxColH;
        if (x === 0) ctx.moveTo(binStartX + x, gy);
        else ctx.lineTo(binStartX + x, gy);
      }
      ctx.stroke();

      // 5. Draw Falling Balls
      ctx.fillStyle = '#f59e0b';
      ballsRef.current.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Labels and Gaussian Markers
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ru' ? 'Кривая Гаусса (Нормальное распределение)' : 'Gaussian Normal Bell Curve', funnelX, binBottom - 95);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(lang === 'ru' ? 'Воронка (p = 0.5 влево, 0.5 вправо)' : 'Funnel (p = 0.5 left/right)', funnelX, funnelY - 14);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, lang]);

  const handleReset = () => {
    binsRef.current = new Array(numBins).fill(0);
    ballsRef.current = [];
    setTotalBalls(0);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 font-mono font-bold border border-purple-800">
              {lang === 'ru' ? '10–11 Класс • Теория вероятностей' : 'Grade 10-11 • Probability'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Доска Гальтона: Нормальное распределение Гаусса' : 'Galton Board: Gaussian Normal Curve'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Доска Гальтона: как из хаотичных падений шариков рождается строгий колокол вероятности' : 'Galton Board: Order from Chaos (Binomial → Normal)'}
          </h3>
        </div>

        {/* Live Counter */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ВСЕГО ШАРИКОВ' : 'TOTAL BALLS'}</span>
            <span className="font-bold text-yellow-400 text-sm">{totalBalls}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title={lang === 'ru' ? 'Сброс' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Probability Rules Callout */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5">
        <span className="font-bold text-cyan-400 block">
          {lang === 'ru' ? 'Центральная предельная теорема на пальцах:' : 'Central Limit Theorem in action:'}
        </span>
        <p className="leading-relaxed">
          {lang === 'ru'
            ? 'Каждый шарик делает случайный выбор 50/50 на каждом гвоздике. Шанс все время падать вправо — мизерный (0.5⁸ ≈ 0.4%). Большинство шариков блуждают то влево, то вправо, скапливаясь ровно по центру, формируя знаменитый колокол Гаусса!'
            : 'Each ball makes a 50/50 decision at every peg. The odds of deflecting right every time is tiny (0.5⁸ ≈ 0.4%). Most balls balance lefts and rights, clustering in the center to form the Gaussian Bell Curve!'}
        </p>
      </div>
    </div>
  );
};
