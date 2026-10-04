import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, Rocket, HelpCircle, Clock, Zap } from 'lucide-react';

interface MomentRelativityProps {
  lang: 'ru' | 'en';
}

export const MomentRelativity: React.FC<MomentRelativityProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [velocityFraction, setVelocityFraction] = useState<number>(0.85); // 0 to 0.99 c
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Lorentz factor gamma = 1 / sqrt(1 - v^2/c^2)
  const gamma = 1 / Math.sqrt(Math.max(0.001, 1 - velocityFraction * velocityFraction));

  // Running clocks (Earth vs Rocket)
  const [earthTime, setEarthTime] = useState<number>(0);
  const [rocketTime, setRocketTime] = useState<number>(0);

  // Clock progression
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEarthTime((e) => e + 0.1);
      setRocketTime((r) => r + 0.1 / gamma);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, gamma]);

  // Canvas visual animation of light clock photon trajectory
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 37 + (isPlaying ? t * 2 : 0)) % w;
        const sy = (i * 73) % h;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (isPlaying) t += 0.8;

      // Two visual frames:
      // Left Frame: Inside Rocket (Observer moving with rocket)
      // Right Frame: Outside on Earth (Stationary observer watching rocket pass)
      const dividerX = w / 2;
      ctx.strokeStyle = '#26282D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dividerX, 0);
      ctx.lineTo(dividerX, h);
      ctx.stroke();

      // Titles
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(lang === 'ru' ? 'СИСТЕМА КОСМОНАВТА (Внутри корабля)' : 'ASTRONAUT FRAME (Inside Rocket)', 30, 30);
      ctx.fillText(lang === 'ru' ? 'СИСТЕМА ЗЕМЛИ (Внешний наблюдатель)' : 'EARTH FRAME (Stationary Observer)', dividerX + 30, 30);

      // Top and bottom mirrors in rocket frame
      const mirrorH = 140;
      const mirrorTop = 90;
      const mirrorBottom = mirrorTop + mirrorH;

      // Draw inside rocket light clock
      const rocketClockX = 140;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(rocketClockX - 30, mirrorTop - 4, 60, 8);
      ctx.fillRect(rocketClockX - 30, mirrorBottom - 4, 60, 8);

      // Photon bouncing purely vertical inside rocket
      const cycle1 = (t * 0.08) % 2;
      const photon1Y = cycle1 <= 1
        ? mirrorTop + cycle1 * mirrorH
        : mirrorBottom - (cycle1 - 1) * mirrorH;

      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(rocketClockX, photon1Y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Vertical path dashed line
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(rocketClockX, mirrorTop);
      ctx.lineTo(rocketClockX, mirrorBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Earth observer view: Rocket moving forward at velocity v!
      const earthBaseX = dividerX + 40;
      const dxTravel = (t * velocityFraction * 2.2) % (w / 2 - 80);
      const currentShipX = earthBaseX + dxTravel;

      // Mirrors moving with ship
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(currentShipX - 30, mirrorTop - 4, 60, 8);
      ctx.fillRect(currentShipX - 30, mirrorBottom - 4, 60, 8);

      // Photon follows diagonal hypotenuse trajectory!
      const cycle2 = (t * 0.08 / gamma) % 2;
      const photon2Y = cycle2 <= 1
        ? mirrorTop + cycle2 * mirrorH
        : mirrorBottom - (cycle2 - 1) * mirrorH;

      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(currentShipX, photon2Y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Diagonal path trail
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(earthBaseX, mirrorTop);
      ctx.lineTo(currentShipX, photon2Y);
      ctx.stroke();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [velocityFraction, isPlaying, gamma, lang]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Rocket className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Релятивистское замедление времени (СТО)' : 'Special Relativity: Time Dilation'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  {lang === 'ru' ? '10-11 Класс' : 'Grade 10-11'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Световые часы Эйнштейна: почему движущиеся часы тикают медленнее' : 'Einstein\'s Light Clock: Why moving clocks tick slower'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? (lang === 'ru' ? 'Пауза' : 'Pause') : (lang === 'ru' ? 'Пуск' : 'Play')}</span>
          </button>
        </div>

        {/* Live Gauges Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-6">
            <span>
              {lang === 'ru' ? 'Земные часы Δt:' : 'Earth Clock Δt:'}{' '}
              <strong className="text-cyan-400">{earthTime.toFixed(1)} сек</strong>
            </span>
            <span>
              {lang === 'ru' ? 'Часы космонавта Δt₀:' : 'Rocket Clock Δt₀:'}{' '}
              <strong className="text-rose-400">{rocketTime.toFixed(1)} сек</strong>
            </span>
          </div>

          <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40 font-bold">
            Фактор Лоренца γ = {gamma.toFixed(2)}x
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
            <span className="text-[10px] uppercase font-mono font-bold text-rose-400">
              {lang === 'ru' ? 'СУТЬ ГЕОМЕТРИИ ЭЙНШТЕЙНА' : 'EINSTEIN GEOMETRY'}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {lang === 'ru'
                ? 'Для покоящегося наблюдателя фотон летит не вертикально, а по длинной диагонали (гипотенузе прямоугольного треугольника). Так как скорость света c постоянна, пролет длинного пути занимает больше земных секунд!'
                : 'To Earth, the photon travels along a longer diagonal hypotenuse path. Since the speed of light c is invariant, this longer path takes more Earth seconds!'}
            </p>
          </div>
        </div>

        {/* Velocity Slider */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs">
          <div className="flex justify-between text-slate-300 mb-1">
            <span>{lang === 'ru' ? 'Скорость ракеты v (в долях от скорости света c)' : 'Rocket Speed v (% of c)'}</span>
            <span className="font-mono text-rose-400 font-bold">{(velocityFraction * 100).toFixed(0)}% c ({(velocityFraction * 299792).toFixed(0)} км/с)</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.99"
            step="0.01"
            value={velocityFraction}
            onChange={(e) => setVelocityFraction(Number(e.target.value))}
            className="w-full accent-rose-400 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Textbook Insight */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Теорема Пифагора рождает СТО' : 'Pythagoras yields Relativity'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Формула замедления времени выводится прямо из школьной теоремы Пифагора! Катет — это высота часов L = c·Δt₀, второй катет — путь поезда v·Δt, а гипотенуза — путь света c·Δt: (c·Δt)² = (c·Δt₀)² + (v·Δt)². Отсюда сразу получается фактор Лоренца γ!'
              : 'Time dilation is derived directly from the Pythagorean theorem! Leg 1 is mirror height c·Δt₀, leg 2 is rocket motion v·Δt, and the hypotenuse is light distance c·Δt.'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/40 text-xs font-mono text-rose-300">
            <code>{"Δt = Δt₀ / √(1 - v²/c²)"}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
