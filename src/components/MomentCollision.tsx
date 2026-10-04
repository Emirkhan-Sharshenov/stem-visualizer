import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, RotateCcw, FastForward, HelpCircle, Zap } from 'lucide-react';

interface MomentCollisionProps {
  lang: 'ru' | 'en';
}

export const MomentCollision: React.FC<MomentCollisionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [m1, setM1] = useState<number>(2.0); // kg
  const [v1, setV1] = useState<number>(3.0); // m/s
  const [m2, setM2] = useState<number>(1.0); // kg
  const [v2, setV2] = useState<number>(-2.0); // m/s
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoSlowMo, setAutoSlowMo] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(1.0);

  // Dynamic simulation physics state
  const cartsRef = useRef<{
    c1: { x: number; vx: number; radius: number };
    c2: { x: number; vx: number; radius: number };
    inImpact: boolean;
    impactForce: number;
  }>({
    c1: { x: 140, vx: 3.0, radius: 24 },
    c2: { x: 440, vx: -2.0, radius: 20 },
    inImpact: false,
    impactForce: 0
  });

  const resetCarts = () => {
    cartsRef.current = {
      c1: { x: 140, vx: v1, radius: Math.sqrt(m1) * 16 },
      c2: { x: 440, vx: v2, radius: Math.sqrt(m2) * 16 },
      inImpact: false,
      impactForce: 0
    };
  };

  useEffect(() => {
    resetCarts();
  }, [m1, v1, m2, v2]);

  // Momentum calculation
  const pTotal = m1 * v1 + m2 * v2;

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);
      const trackY = 240;

      // Dark track background
      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // Air track base
      ctx.fillStyle = '#26282D';
      ctx.fillRect(20, trackY, w - 40, 20);
      ctx.strokeStyle = '#4A4D55';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, trackY, w - 40, 20);

      // Track millimeter marks
      ctx.strokeStyle = '#34363C';
      ctx.lineWidth = 1;
      for (let x = 40; x < w - 40; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, trackY);
        ctx.lineTo(x, trackY + 8);
        ctx.stroke();
      }

      const { c1, c2 } = cartsRef.current;
      const dist = c2.x - c1.x;
      const minDist = c1.radius + c2.radius;

      // Check collision
      let currentScale = timeScale;
      if (dist <= minDist + 2) {
        cartsRef.current.inImpact = true;
        if (autoSlowMo) {
          currentScale = 0.15; // Automatic dramatic slow-motion during impact microsecond!
        }

        // Elastic 1D collision formula
        const u1 = c1.vx;
        const u2 = c2.vx;
        const newV1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
        const newV2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);

        c1.vx = newV1;
        c2.vx = newV2;
        cartsRef.current.impactForce = Math.abs(newV1 - u1) * m1 * 40;
      } else {
        cartsRef.current.inImpact = false;
        cartsRef.current.impactForce = 0;
      }

      if (isPlaying) {
        c1.x += c1.vx * currentScale;
        c2.x += c2.vx * currentScale;

        // Bounce track ends
        if (c1.x < 50) { c1.x = 50; c1.vx *= -1; }
        if (c2.x > w - 50) { c2.x = w - 50; c2.vx *= -1; }
      }

      // Draw Cart 1 (Blue)
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c1.x - c1.radius, trackY - c1.radius * 1.5, c1.radius * 2, c1.radius * 1.5, 6);
      ctx.fill();
      ctx.stroke();

      // Cart 1 Wheels
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(c1.x - c1.radius * 0.5, trackY, 5, 0, Math.PI * 2);
      ctx.arc(c1.x + c1.radius * 0.5, trackY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Velocity Arrow for Cart 1
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c1.x, trackY - c1.radius * 1.8);
      ctx.lineTo(c1.x + c1.vx * 15, trackY - c1.radius * 1.8);
      ctx.stroke();

      // Draw Cart 2 (Amber)
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c2.x - c2.radius, trackY - c2.radius * 1.5, c2.radius * 2, c2.radius * 1.5, 6);
      ctx.fill();
      ctx.stroke();

      // Cart 2 Wheels
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(c2.x - c2.radius * 0.5, trackY, 5, 0, Math.PI * 2);
      ctx.arc(c2.x + c2.radius * 0.5, trackY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Velocity Arrow for Cart 2
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c2.x, trackY - c2.radius * 1.8);
      ctx.lineTo(c2.x + c2.vx * 15, trackY - c2.radius * 1.8);
      ctx.stroke();

      // Impact Shockwave & Newton's 3rd Law Equal Force Vectors F12 = -F21
      if (cartsRef.current.inImpact) {
        const midX = (c1.x + c2.x) / 2;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(midX, trackY - 20, 28, 0, Math.PI * 2);
        ctx.stroke();

        // Equal and opposite force vectors
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px Fira Code';
        ctx.fillText('F₁₂ (on 1)', c1.x - 30, trackY - 60);
        ctx.fillText('F₂₁ = -F₁₂', c2.x + 5, trackY - 60);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [m1, m2, isPlaying, timeScale, autoSlowMo]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Упругий удар: Законы Ньютона и импульс' : 'Elastic Collision & Newton\'s Laws'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {lang === 'ru' ? '9 Класс' : 'Grade 9'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Замедленная съемка микросекунды удара: действие равно противодействию' : 'Slow-mo impact microsecond: Action equals reaction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? (lang === 'ru' ? 'Пауза' : 'Pause') : (lang === 'ru' ? 'Пуск' : 'Play')}</span>
            </button>

            <button
              onClick={resetCarts}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Momentum Conservation Gauge */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6">
            <span>
              {lang === 'ru' ? 'Суммарный импульс P = m₁v₁ + m₂v₂:' : 'Total Momentum P = m₁v₁ + m₂v₂:'}{' '}
              <strong className="text-emerald-400">{pTotal.toFixed(2)} кг·м/с</strong>
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white font-sans text-xs">
            <input
              type="checkbox"
              checked={autoSlowMo}
              onChange={(e) => setAutoSlowMo(e.target.checked)}
              className="rounded accent-cyan-400"
            />
            {lang === 'ru' ? 'Авто-замедление в момент удара' : 'Auto Slow-Mo at Impact'}
          </label>
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
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
              {lang === 'ru' ? 'МОМЕНТ СОУДАРЕНИЯ' : 'MOMENT OF IMPACT'}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {lang === 'ru'
                ? 'Силы F₁₂ и F₂₁ в точности равны в каждую микросекунду соприкосновения! Если тело легкое, равная сила дает ему гигантское ускорение a = F/m.'
                : 'Forces F₁₂ and F₂₁ are strictly equal at every microsecond. A lighter mass experiences much higher acceleration a = F/m.'}
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Масса M₁' : 'Mass M₁'}</span>
              <span className="font-mono text-cyan-400 font-bold">{m1} kg</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={m1}
              onChange={(e) => setM1(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Скорость V₁' : 'Speed V₁'}</span>
              <span className="font-mono text-cyan-400 font-bold">{v1} m/s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.5"
              value={v1}
              onChange={(e) => setV1(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Масса M₂' : 'Mass M₂'}</span>
              <span className="font-mono text-amber-400 font-bold">{m2} kg</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Скорость V₂' : 'Speed V₂'}</span>
              <span className="font-mono text-amber-400 font-bold">{v2} m/s</span>
            </div>
            <input
              type="range"
              min="-6.0"
              max="-0.5"
              step="0.5"
              value={v2}
              onChange={(e) => setV2(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Textbook Insight */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? '3-й закон Ньютона в деталях' : 'Newton\'s 3rd Law in Detail'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Силы всегда рождаются парами! Невозможно толкнуть стену, не будучи оттолкнутым стеной с абсолютно такой же силой. При соударении двух тел суммарный импульс замкнутой системы остается неизменным до и после удара.'
              : 'Forces always come in pairs. You cannot push a wall without the wall pushing you back with the exact same force. Total system momentum is strictly conserved.'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs font-mono text-cyan-300">
            <code>{"F₁₂ = -F₂₁,  m₁v₁ + m₂v₂ = const"}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
