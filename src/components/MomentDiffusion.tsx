import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, Zap, HelpCircle } from 'lucide-react';

interface MomentDiffusionProps {
  lang: 'ru' | 'en';
  onUnlockMilestone?: (id: string) => void;
}

export const MomentDiffusion: React.FC<MomentDiffusionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [timeScale, setTimeScale] = useState<number>(1.0); // 0.1x, 0.5x, 1x, 2x
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [collisionCount, setCollisionCount] = useState<number>(0);
  const [showWaterMolecules, setShowWaterMolecules] = useState<boolean>(true);
  const [showTraces, setShowTraces] = useState<boolean>(true);

  // Particles state ref so animation loop runs butter-smooth at 60 FPS
  const simState = useRef<{
    dyeParticles: { x: number; y: number; vx: number; vy: number; radius: number; trail: { x: number; y: number }[] }[];
    waterMolecules: { x: number; y: number; vx: number; vy: number; radius: number }[];
    totalCollisions: number;
  }>({
    dyeParticles: [],
    waterMolecules: [],
    totalCollisions: 0
  });

  // Initialize particles
  const initSimulation = () => {
    const dye: any[] = [];
    // Start with a concentrated drop of dye particles in center-left
    for (let i = 0; i < 18; i++) {
      dye.push({
        x: 180 + (Math.random() - 0.5) * 45,
        y: 180 + (Math.random() - 0.5) * 45,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 8,
        trail: []
      });
    }

    const water: any[] = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      water.push({
        x: Math.random() * 560 + 20,
        y: Math.random() * 340 + 20,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 3.5
      });
    }

    simState.current = {
      dyeParticles: dye,
      waterMolecules: water,
      totalCollisions: 0
    };
    setCollisionCount(0);
  };

  useEffect(() => {
    initSimulation();
  }, []);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#060a18';
      ctx.fillRect(0, 0, w, h);

      // Subtle container beaker outline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      const state = simState.current;
      const speedMultiplier = (Math.sqrt(temperature / 300)) * (timeScale) * (isPlaying ? 1 : 0);

      // Update and draw water molecules
      if (isPlaying) {
        state.waterMolecules.forEach((wm) => {
          wm.x += wm.vx * speedMultiplier;
          wm.y += wm.vy * speedMultiplier;

          // Bounce walls
          if (wm.x < 15 || wm.x > w - 15) wm.vx *= -1;
          if (wm.y < 15 || wm.y > h - 15) wm.vy *= -1;
        });

        // Update dye particles and check collisions with water molecules
        state.dyeParticles.forEach((dp) => {
          dp.x += dp.vx * timeScale;
          dp.y += dp.vy * timeScale;

          // Damping drag
          dp.vx *= 0.985;
          dp.vy *= 0.985;

          // Bounce walls
          if (dp.x < 25) { dp.x = 25; dp.vx *= -1; }
          if (dp.x > w - 25) { dp.x = w - 25; dp.vx *= -1; }
          if (dp.y < 25) { dp.y = 25; dp.vy *= -1; }
          if (dp.y > h - 25) { dp.y = h - 25; dp.vy *= -1; }

          // Collision with water molecules (Brownian kicks)
          state.waterMolecules.forEach((wm) => {
            const dx = dp.x - wm.x;
            const dy = dp.y - wm.y;
            const dist = Math.hypot(dx, dy);
            if (dist < dp.radius + wm.radius) {
              state.totalCollisions++;
              // Momentum transfer
              const angle = Math.atan2(dy, dx);
              const kick = 0.25 * speedMultiplier;
              dp.vx += Math.cos(angle) * kick;
              dp.vy += Math.sin(angle) * kick;
              wm.vx -= Math.cos(angle) * 1.5;
              wm.vy -= Math.sin(angle) * 1.5;
            }
          });

          // Record trail
          if (showTraces && Math.random() < 0.3) {
            dp.trail.push({ x: dp.x, y: dp.y });
            if (dp.trail.length > 25) dp.trail.shift();
          }
        });
      }

      // Draw trails
      if (showTraces) {
        state.dyeParticles.forEach((dp) => {
          if (dp.trail.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(dp.trail[0].x, dp.trail[0].y);
          for (let i = 1; i < dp.trail.length; i++) {
            ctx.lineTo(dp.trail[i].x, dp.trail[i].y);
          }
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // Draw water molecules (small cyan circles)
      if (showWaterMolecules) {
        ctx.fillStyle = '#38bdf8';
        state.waterMolecules.forEach((wm) => {
          ctx.beginPath();
          ctx.arc(wm.x, wm.y, wm.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw dye particles (large glowing magenta drops)
      state.dyeParticles.forEach((dp) => {
        // Outer glow
        const grad = ctx.createRadialGradient(dp.x, dp.y, 2, dp.x, dp.y, dp.radius * 2);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.7, 'rgba(219, 39, 119, 0.6)');
        grad.addColorStop(1, 'rgba(219, 39, 119, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid core
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update collision counter state periodically
      if (state.totalCollisions % 10 === 0) {
        setCollisionCount(state.totalCollisions);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [temperature, timeScale, isPlaying, showWaterMolecules, showTraces]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Симуляция момента: Броуновские удары и Диффузия' : 'Moment Simulation: Brownian Kicks & Diffusion'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800">
                  {lang === 'ru' ? '5-6 Класс' : 'Grade 5-6'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Посмотри в замедленной съемке: невидимые молекулы воды толкают тяжелую каплю краски!' : 'Slow down time to watch water molecules bombard the dye drop!'}
              </p>
            </div>
          </div>

          {/* Controls: Play/Pause & Reset */}
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
              onClick={initSimulation}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title={lang === 'ru' ? 'Капнуть краску заново' : 'Reset drop'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Time Scale Bar (Slow-Mo 0.1x, 0.5x, 1x, 2x) */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">{lang === 'ru' ? 'Скорость времени:' : 'Time Scale:'}</span>
            {[
              { val: 0.1, label: '0.1x (Slow-Mo)' },
              { val: 0.5, label: '0.5x' },
              { val: 1.0, label: '1.0x (Реал)' },
              { val: 2.0, label: '2.0x' },
            ].map((ts) => (
              <button
                key={ts.val}
                onClick={() => setTimeScale(ts.val)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  timeScale === ts.val
                    ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ts.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>{lang === 'ru' ? 'Ударов молекул:' : 'Micro-collisions:'} <strong className="text-pink-400">{collisionCount}</strong></span>
          </div>
        </div>

        {/* 2D Canvas Mount */}
        <div className="relative w-full h-[400px] flex items-center justify-center p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={380}
            className="w-full h-full rounded-xl bg-slate-950"
          />

          {/* Floating live moment prompt */}
          <div className="absolute bottom-6 left-6 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs text-slate-300 max-w-sm shadow-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono font-bold text-pink-400">
              {lang === 'ru' ? 'ЧТО ПРОИСХОДИТ В ЭТУ СЕКУНДУ?' : 'WHAT HAPPENS IN THIS INSTANT?'}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {lang === 'ru'
                ? 'Каждая розовая частица красителя испытывает до миллиона хаотичных микроударов молекул воды в секунду, из-за чего капля медленно расползается по всему стакану.'
                : 'Each pink dye particle receives millions of random water molecule impacts per second, creating a macroscopic spreading effect.'}
            </p>
          </div>
        </div>

        {/* Sliders bar: Temperature */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Температура воды T (Кельвины)' : 'Water Temperature T (Kelvin)'}</span>
              <span className="font-mono text-cyan-400 font-bold">
                {temperature} K ({temperature - 273}°C — {temperature < 320 ? (lang === 'ru' ? 'Холодная' : 'Cold') : (lang === 'ru' ? 'Кипяток' : 'Hot')})
              </span>
            </div>
            <input
              type="range"
              min="275"
              max="373"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showWaterMolecules}
                onChange={(e) => setShowWaterMolecules(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              {lang === 'ru' ? 'Показать молекулы воды' : 'Show Water Molecules'}
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showTraces}
                onChange={(e) => setShowTraces(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              {lang === 'ru' ? 'Траектории частиц' : 'Show Particle Trails'}
            </label>
          </div>
        </div>
      </div>

      {/* Textbook Insight Side Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Объяснение для 5-6 класса' : 'Explanation for Middle School'}
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
                {lang === 'ru' ? 'ЧТО ПИШУТ В УЧЕБНИКЕ:' : 'IN THE TEXTBOOK:'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {lang === 'ru'
                  ? '«Диффузия — взаимное проникновение соприкасающихся веществ вследствие теплового движения молекул».'
                  : '"Diffusion is the intermingling of substances by natural movement of particles."'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50">
              <div className="text-[10px] font-mono uppercase font-bold text-indigo-300 mb-1">
                {lang === 'ru' ? 'ПРЕДСТАВЬ НА ПАЛЬЦАХ:' : 'INTUITIVE ANALOGY:'}
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                {lang === 'ru'
                  ? 'В горячем кипятке молекулы несутся с бешеной скоростью сотен метров в секунду! Они яростно пинают частицы красителя во все стороны, поэтому чай заваривается мгновенно.'
                  : 'In boiling water, molecules sprint at hundreds of meters per second, violently kicking the dye particles apart in seconds!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
