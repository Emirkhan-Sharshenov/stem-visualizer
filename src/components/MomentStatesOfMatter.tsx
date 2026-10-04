import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, RotateCcw, Flame, Snowflake, Wind, HelpCircle } from 'lucide-react';

interface MomentStatesOfMatterProps {
  lang: 'ru' | 'en';
}

export const MomentStatesOfMatter: React.FC<MomentStatesOfMatterProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState<number>(0); // -30 to 120 °C
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const stateType = temperature < 0 ? 'solid' : temperature <= 100 ? 'liquid' : 'gas';

  // Molecular ensemble state
  const particlesRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    originX: number;
    originY: number;
    radius: number;
  }[]>([]);

  // Init grid of molecules
  useEffect(() => {
    const pts: any[] = [];
    const rows = 6;
    const cols = 12;
    const startX = 110;
    const startY = 120;
    const spacingX = 35;
    const spacingY = 32;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = startX + c * spacingX + (r % 2 === 1 ? spacingX * 0.5 : 0);
        const oy = startY + r * spacingY;
        pts.push({
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
          originX: ox,
          originY: oy,
          radius: 7
        });
      }
    }
    particlesRef.current = pts;
  }, []);

  // Simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      // Clear with dark chamber background
      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // Draw container walls
      ctx.strokeStyle = '#34363C';
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, w - 30, h - 30);

      const pts = particlesRef.current;
      const thermalSpeed = Math.max(0.4, Math.sqrt(Math.max(1, temperature + 40)) * 0.35);

      if (isPlaying) {
        pts.forEach((p) => {
          if (temperature < 0) {
            // Solid ice: harmonic oscillation around crystal lattice positions
            const dx = p.originX - p.x;
            const dy = p.originY - p.y;
            p.vx += dx * 0.15 + (Math.random() - 0.5) * thermalSpeed * 0.3;
            p.vy += dy * 0.15 + (Math.random() - 0.5) * thermalSpeed * 0.3;
            p.vx *= 0.85;
            p.vy *= 0.85;
            p.x += p.vx * timeScale;
            p.y += p.vy * timeScale;
          } else if (temperature <= 100) {
            // Liquid: gravity pull down, soft repulsion, flowing past
            p.vy += 0.08; // gravity
            p.vx += (Math.random() - 0.5) * thermalSpeed * 0.4;
            p.vy += (Math.random() - 0.5) * thermalSpeed * 0.4;
            p.vx *= 0.94;
            p.vy *= 0.94;

            p.x += p.vx * timeScale;
            p.y += p.vy * timeScale;

            // Liquid bounds
            if (p.x < 30) { p.x = 30; p.vx *= -0.5; }
            if (p.x > w - 30) { p.x = w - 30; p.vx *= -0.5; }
            if (p.y > h - 30) { p.y = h - 30; p.vy *= -0.5; }
            if (p.y < 120) { p.vy += 0.1; }
          } else {
            // Gas / Steam: high speed, isotropic expansion, bounces everywhere!
            p.vx += (Math.random() - 0.5) * 0.6;
            p.vy += (Math.random() - 0.5) * 0.6;
            p.x += p.vx * thermalSpeed * 0.9 * timeScale;
            p.y += p.vy * thermalSpeed * 0.9 * timeScale;

            if (p.x < 25) { p.x = 25; p.vx *= -1; }
            if (p.x > w - 25) { p.x = w - 25; p.vx *= -1; }
            if (p.y < 25) { p.y = 25; p.vy *= -1; }
            if (p.y > h - 25) { p.y = h - 25; p.vy *= -1; }
          }
        });
      }

      // Draw hydrogen bond links when solid or liquid
      if (temperature < 50) {
        ctx.strokeStyle = temperature < 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = temperature < 0 ? 2 : 1;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (dist < 42) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw molecules (Oxygen red + 2 small white Hydrogens for authentic H2O)
      pts.forEach((p) => {
        // Oxygen central atom
        ctx.fillStyle = temperature < 0 ? '#38bdf8' : temperature <= 100 ? '#0284c7' : '#f97316';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2 Hydrogen ears
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(p.x - 5, p.y - 4, 3, 0, Math.PI * 2);
        ctx.arc(p.x + 5, p.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [temperature, timeScale, isPlaying]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {temperature < 0 ? <Snowflake className="w-5 h-5" /> : temperature <= 100 ? <Flame className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Агрегатные состояния: Лёд → Вода → Пар' : 'States of Matter: Ice → Water → Steam'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {lang === 'ru' ? '7-8 Класс' : 'Grade 7-8'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Смотри, как плавятся водородные связи между молекулами H₂O' : 'Watch hydrogen bonds rupture as temperature crosses phase boundaries'}
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
          </div>
        </div>

        {/* Phase State Indicators Bar */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {[
              { id: -20, label: lang === 'ru' ? 'Лёд (-20°C)' : 'Ice (-20°C)', active: stateType === 'solid' },
              { id: 25, label: lang === 'ru' ? 'Вода (25°C)' : 'Water (25°C)', active: stateType === 'liquid' },
              { id: 115, label: lang === 'ru' ? 'Пар (115°C)' : 'Steam (115°C)', active: stateType === 'gas' },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setTemperature(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  p.active
                    ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="font-mono text-cyan-400 font-bold text-sm">
            {temperature}°C
          </span>
        </div>

        {/* Canvas Display */}
        <div className="lab-stage relative w-full flex items-center justify-center p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={380}
            className="block w-full h-auto max-h-[480px] object-contain rounded-xl"
          />

          <div className="absolute bottom-6 left-6 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs text-slate-300 max-w-sm shadow-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
              {stateType === 'solid' && (lang === 'ru' ? 'ТВЕРДОЕ ТЕЛО (ЛЕД)' : 'SOLID (ICE)')}
              {stateType === 'liquid' && (lang === 'ru' ? 'ЖИДКОСТЬ (ВОДА)' : 'LIQUID (WATER)')}
              {stateType === 'gas' && (lang === 'ru' ? 'ГАЗ (ВОДЯНОЙ ПАР)' : 'GAS (STEAM)')}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {stateType === 'solid' && (lang === 'ru' ? 'Молекулы заперты в ячейках кристаллической решетки и только дрожат на месте.' : 'Molecules locked in crystal lattice positions, oscillating in place.')}
              {stateType === 'liquid' && (lang === 'ru' ? 'Связи непрерывно рвутся и возникают вновь — молекулы текут и скользят друг по другу.' : 'Bonds continuously rupture and re-form, letting molecules slip past one another.')}
              {stateType === 'gas' && (lang === 'ru' ? 'Энергия тепла полностью разорвала связи: молекулы со сверхзвуковой скоростью летают по всему объему!' : 'Thermal kinetic energy completely breaks intermolecular bonds: molecules fly freely!')}
            </p>
          </div>
        </div>

        {/* Temperature slider */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs">
          <div className="flex justify-between text-slate-300 mb-1">
            <span>{lang === 'ru' ? 'Температура нагревателя T (°C)' : 'Heater Temperature T (°C)'}</span>
            <span className="font-mono text-cyan-400 font-bold">{temperature}°C</span>
          </div>
          <input
            type="range"
            min="-30"
            max="125"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
          />
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
              {lang === 'ru' ? 'Урок: Фазовые переходы' : 'Lesson: Phase Transitions'}
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
              {lang === 'ru' ? 'ГЛАВНАЯ ОШИБКА ШКОЛЬНИКОВ:' : 'COMMON STUDENT MISCONCEPTION:'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ru'
                ? '«Молекулы в паре горячие, а во льду холодные? Молекула H₂O расширяется?» НЕТ! Сама молекула H₂O в кипятке и во льду абсолютно одинакова. Меняется только расстояние и характер движения!'
                : 'Molecules do not melt or shrink! An H₂O molecule in steam is identical to one in an iceberg. Only intermolecular bonding and velocities change.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
