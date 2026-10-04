import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Dna, Play, Pause, RotateCcw, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

interface MomentDnaCellProps {
  lang: 'ru' | 'en';
}

export const MomentDnaCell: React.FC<MomentDnaCellProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isUnzipped, setIsUnzipped] = useState<boolean>(false); // Unzipping during replication
  const [helixSpeed, setHelixSpeed] = useState<number>(1.0);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const basePairs = [
      { b1: 'A', b2: 'T', c1: '#38bdf8', c2: '#f43f5e' },
      { b1: 'G', b2: 'C', c1: '#10b981', c2: '#f59e0b' },
      { b1: 'T', b2: 'A', c1: '#f43f5e', c2: '#38bdf8' },
      { b1: 'C', b2: 'G', c1: '#f59e0b', c2: '#10b981' },
      { b1: 'A', b2: 'T', c1: '#38bdf8', c2: '#f43f5e' },
      { b1: 'G', b2: 'C', c1: '#10b981', c2: '#f59e0b' },
      { b1: 'C', b2: 'G', c1: '#f59e0b', c2: '#10b981' },
      { b1: 'T', b2: 'A', c1: '#f43f5e', c2: '#38bdf8' },
    ];

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      if (isPlaying) {
        t += 0.03 * helixSpeed;
      }

      const centerY = h / 2;
      const stepX = 55;
      const amplitude = isUnzipped ? 65 : 45;

      // Draw Sugar-Phosphate Backbones
      ctx.lineWidth = 3;

      // Strand 1
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      for (let x = 40; x < w - 40; x += 5) {
        const angle = (x * 0.02) + t;
        const y = centerY + Math.sin(angle) * amplitude - (isUnzipped && x > w / 2 ? 30 : 0);
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Strand 2
      ctx.strokeStyle = '#9333ea';
      ctx.beginPath();
      for (let x = 40; x < w - 40; x += 5) {
        const angle = (x * 0.02) + t + Math.PI;
        const y = centerY + Math.sin(angle) * amplitude + (isUnzipped && x > w / 2 ? 30 : 0);
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Rungs / Base Pairs (A-T and G-C)
      for (let i = 0; i < 10; i++) {
        const x = 60 + i * stepX;
        const angle = (x * 0.02) + t;
        const y1 = centerY + Math.sin(angle) * amplitude - (isUnzipped && x > w / 2 ? 30 : 0);
        const y2 = centerY + Math.sin(angle + Math.PI) * amplitude + (isUnzipped && x > w / 2 ? 30 : 0);

        const pair = basePairs[i % basePairs.length];
        const midY = (y1 + y2) / 2;

        if (isUnzipped && x > w / 2) {
          // Unzipped / Broken hydrogen bonds during replication!
          // Top half rung
          ctx.strokeStyle = pair.c1;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y1 + (midY - y1) * 0.6);
          ctx.stroke();

          // Bottom half rung
          ctx.strokeStyle = pair.c2;
          ctx.beginPath();
          ctx.moveTo(x, y2);
          ctx.lineTo(x, y2 + (midY - y2) * 0.6);
          ctx.stroke();

          // Letters
          ctx.fillStyle = pair.c1;
          ctx.font = 'bold 11px Fira Code';
          ctx.fillText(pair.b1, x - 4, y1 + (midY - y1) * 0.5);

          ctx.fillStyle = pair.c2;
          ctx.fillText(pair.b2, x - 4, y2 + (midY - y2) * 0.5);
        } else {
          // Intact base pair connected by hydrogen bonds
          ctx.strokeStyle = pair.c1;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, midY);
          ctx.stroke();

          ctx.strokeStyle = pair.c2;
          ctx.beginPath();
          ctx.moveTo(x, midY);
          ctx.lineTo(x, y2);
          ctx.stroke();

          // Hydrogen bond dots in center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, midY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Letter badges
          ctx.fillStyle = pair.c1;
          ctx.font = 'bold 11px Fira Code';
          ctx.fillText(pair.b1, x - 4, (y1 + midY) / 2);

          ctx.fillStyle = pair.c2;
          ctx.fillText(pair.b2, x - 4, (y2 + midY) / 2);
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isUnzipped, helixSpeed]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dna className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'ДНК: Двойная спираль и комплементарность' : 'DNA Double Helix & Complementary Pairing'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {lang === 'ru' ? '9-10 Класс' : 'Grade 9-10'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Аденин всегда с Тимином (A-T), Гуанин всегда с Цитозином (G-C)' : 'Adenine pairs with Thymine (A-T), Guanine pairs with Cytosine (G-C)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUnzipped(!isUnzipped)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isUnzipped
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isUnzipped ? (lang === 'ru' ? 'Соединить цепи' : 'Re-anneal Strands') : (lang === 'ru' ? 'Расплести (Репликация)' : 'Unzip (Replication)')}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nucleotide Color Legend Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
              <strong>A</strong> (Аденин)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <strong>T</strong> (Тимин)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <strong>G</strong> (Гуанин)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <strong>C</strong> (Цитозин)
            </span>
          </div>

          <span className="text-slate-400 text-[11px]">
            {lang === 'ru' ? '2 водородные связи у A=T • 3 связи у G≡C' : '2 H-bonds for A=T • 3 H-bonds for G≡C'}
          </span>
        </div>

        {/* Canvas Display */}
        <div className="lab-stage relative w-full flex items-center justify-center p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={340}
            className="block w-full h-auto max-h-[480px] object-contain rounded-xl"
          />

          <div className="absolute bottom-6 left-6 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs text-slate-300 max-w-sm shadow-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
              {lang === 'ru' ? 'ПРИНЦИП КОМПЛЕМЕНТАРНОСТИ' : 'COMPLEMENTARITY RULE'}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {lang === 'ru'
                ? 'Благодаря идеальному пространственному соответствию, зная последовательность одной цепи, клетка безошибочно достраивает вторую цепь!'
                : 'Because of exact spatial geometry, knowing one strand allows the cell to synthesize the matching second strand with zero errors!'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs">
          <div className="flex justify-between text-slate-300 mb-1">
            <span>{lang === 'ru' ? 'Скорость вращения спирали' : 'Helix Rotation Speed'}</span>
            <span className="font-mono text-emerald-400 font-bold">{helixSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={helixSpeed}
            onChange={(e) => setHelixSpeed(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Textbook Insight */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Открытие Уотсона и Крика (1953)' : 'Watson & Crick Discovery'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Главная гениальность структуры ДНК — в том, что водородные связи между парами достаточно прочны, чтобы удерживать генетический код стабильным, но при этом легко «расстегиваются» как застежка-молния ферментом хеликазой для копирования генов!'
              : 'DNA’s genius lies in its hydrogen bonds: strong enough to safeguard genetic blueprints, yet easily unzipped like a jacket zipper by helicase enzymes during replication!'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs font-mono text-emerald-300">
            <code>A = T, \quad G \equiv C</code>
          </div>
        </div>
      </div>
    </div>
  );
};
