import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Zap, Play, RotateCcw, Activity } from 'lucide-react';

interface MomentNeuronActionPotentialProps {
  lang: 'ru' | 'en';
}

export const MomentNeuronActionPotential: React.FC<MomentNeuronActionPotentialProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [impulseProgress, setImpulseProgress] = useState<number>(0); // 0 to 1
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  const membranePotentialMv = isFiring
    ? impulseProgress < 0.3
      ? -70 + (impulseProgress / 0.3) * 100 // -70 to +30 mV
      : impulseProgress < 0.6
      ? 30 - ((impulseProgress - 0.3) / 0.3) * 115 // +30 to -85 mV
      : -85 + ((impulseProgress - 0.6) / 0.4) * 15 // repolarize to -70
    : -70;

  useEffect(() => {
    let animId: number;
    if (isFiring) {
      const step = () => {
        setImpulseProgress((prev) => {
          if (prev >= 1.0) {
            setIsFiring(false);
            return 0;
          }
          return prev + 0.008 * speedMultiplier;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isFiring, speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);

    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, w, h);

    const somaX = 130;
    const somaY = h / 2 - 20;
    const axonEndX = w - 180;

    // 1. Draw Dendrites branching from Soma
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    const dendrites = [
      { x1: somaX - 40, y1: somaY - 10, x2: somaX - 90, y2: somaY - 60 },
      { x1: somaX - 35, y1: somaY + 15, x2: somaX - 100, y2: somaY + 40 },
      { x1: somaX - 20, y1: somaY - 35, x2: somaX - 50, y2: somaY - 90 },
      { x1: somaX - 10, y1: somaY + 35, x2: somaX - 30, y2: somaY + 80 },
    ];
    dendrites.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.stroke();
    });

    // 2. Draw Neuron Cell Body (Soma)
    const somaGrad = ctx.createRadialGradient(somaX, somaY, 5, somaX, somaY, 45);
    somaGrad.addColorStop(0, '#818cf8');
    somaGrad.addColorStop(1, '#4338ca');
    ctx.fillStyle = somaGrad;
    ctx.beginPath();
    ctx.arc(somaX, somaY, 42, 0, Math.PI * 2);
    ctx.fill();

    // Nucleus inside soma
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(somaX - 5, somaY, 14, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Axon Cable
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(somaX + 35, somaY);
    ctx.lineTo(axonEndX, somaY);
    ctx.stroke();

    // 4. Draw Myelin Sheath segments & Nodes of Ranvier
    const numSegments = 5;
    const segW = (axonEndX - (somaX + 50)) / numSegments;
    for (let i = 0; i < numSegments; i++) {
      const segX = somaX + 50 + i * segW + 6;
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(segX, somaY - 14, segW - 12, 28, [6]);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Synaptic Terminal Button (Right end)
    const synX = axonEndX + 35;
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.ellipse(synX, somaY, 35, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Next Dendrite Membrane (Postsynaptic target on far right)
    const postX = w - 40;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(postX, somaY, 70, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();

    // 6. Action Potential Pulse Sweeping Along Axon
    if (isFiring) {
      const currentPulseX = somaX + 35 + impulseProgress * (synX - somaX);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(currentPulseX, somaY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // When pulse reaches synapse, vesicles release neurotransmitters!
      if (impulseProgress > 0.75) {
        const synProgress = (impulseProgress - 0.75) / 0.25;
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 14; i++) {
          const nx = synX + 20 + synProgress * 45 + (Math.sin(i) * 10);
          const ny = somaY - 25 + i * 4;
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 7. Oscilloscope Graph at Bottom
    const graphX = 80;
    const graphY = h - 75;
    const graphW = w - 160;
    const graphH = 50;

    ctx.fillStyle = '#17181B';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = '#34363C';
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // -70 mV baseline
    const baseLineY = graphY + graphH * 0.75;
    ctx.strokeStyle = '#4A4D55';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(graphX, baseLineY);
    ctx.lineTo(graphX + graphW, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Action potential spike wave curve
    ctx.strokeStyle = isFiring ? '#22c55e' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(graphX, baseLineY);
    for (let x = 0; x < graphW; x += 3) {
      const frac = x / graphW;
      let yVal = baseLineY;
      if (frac < 0.2) yVal = baseLineY;
      else if (frac < 0.4) yVal = baseLineY - ((frac - 0.2) / 0.2) * 35; // Depolarization to +30mV
      else if (frac < 0.6) yVal = baseLineY - 35 + ((frac - 0.4) / 0.2) * 45; // Repolarization & Hyperpolarization
      else yVal = baseLineY;
      ctx.lineTo(graphX + x, yVal);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'ru' ? 'ТЕЛО НЕЙРОНА (СОМА)' : 'NEURON SOMA', somaX, somaY - 55);

    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'ru' ? 'МИЕЛИНОВАЯ ОБОЛОЧКА (ИЗОЛЯЦИЯ)' : 'MYELIN SHEATH (INSULATION)', (somaX + axonEndX) / 2, somaY - 26);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(lang === 'ru' ? 'СИНАПС (20 нм)' : 'SYNAPSE (20 nm)', synX + 25, somaY - 55);
    ctx.fillText(lang === 'ru' ? 'Выброс медиатора' : 'Neurotransmitters', synX + 25, somaY + 55);
  }, [impulseProgress, isFiring, membranePotentialMv, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
              {lang === 'ru' ? '8–9 Класс • Биология' : 'Grade 8-9 • Biology'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Нервный импульс: Потенциал действия и синапс' : 'Action Potential & Synaptic Cleft'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Как мысль летит по нерву: скачок натрия Na⁺ и выброс медиатора в синапс' : 'How Thoughts Travel: Sodium Na⁺ Influx & Neurotransmitter Release'}
          </h3>
        </div>

        {/* Live Millivolts Gauge */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ЗАРЯД МЕМБРАНЫ' : 'MEMBRANE POTENTIAL'}</span>
            <span className={`font-bold text-sm ${membranePotentialMv > 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
              {membranePotentialMv.toFixed(0)} мВ
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'СОСТОЯНИЕ' : 'STATE'}</span>
            <span className="font-bold text-emerald-400">
              {membranePotentialMv > 0
                ? (lang === 'ru' ? 'Деполяризация (Na⁺ внутрь)' : 'Depolarization')
                : (lang === 'ru' ? 'Покой (-70 мВ)' : 'Resting (-70 mV)')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Trigger Button & Speed */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => {
            setImpulseProgress(0);
            setIsFiring(true);
          }}
          disabled={isFiring}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            isFiring
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-yellow-500/20'
          }`}
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>{lang === 'ru' ? 'СГЕНЕРИРОВАТЬ НЕРВНЫЙ ИМПУЛЬС (100 м/с)' : 'TRIGGER ACTION POTENTIAL'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{lang === 'ru' ? 'Скорость:' : 'Speed:'}</span>
          <button
            onClick={() => setSpeedMultiplier(0.5)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${speedMultiplier === 0.5 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            0.5x
          </button>
          <button
            onClick={() => setSpeedMultiplier(1.0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${speedMultiplier === 1.0 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            1.0x
          </button>
          <button
            onClick={() => setSpeedMultiplier(2.0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${speedMultiplier === 2.0 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            2.0x
          </button>
        </div>
      </div>
    </div>
  );
};
