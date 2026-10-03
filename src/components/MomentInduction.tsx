import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Zap, HelpCircle, Magnet, Lightbulb } from 'lucide-react';

interface MomentInductionProps {
  lang: 'ru' | 'en';
}

export const MomentInduction: React.FC<MomentInductionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnetX, setMagnetX] = useState<number>(140);
  const [isAutoOscillating, setIsAutoOscillating] = useState<boolean>(true);
  const [coilTurns, setCoilTurns] = useState<number>(4);

  const prevX = useRef<number>(magnetX);
  const [inducedVoltage, setInducedVoltage] = useState<number>(0);

  // Auto-oscillation loop
  useEffect(() => {
    let animId: number;
    let t = 0;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      if (isAutoOscillating) {
        t += 0.04;
        const newX = 280 + Math.sin(t) * 140;
        setMagnetX(newX);
      }
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isAutoOscillating]);

  // Compute EMF = - N * dPhi/dt based on velocity and position relative to coil
  useEffect(() => {
    const coilCenterX = 280;
    const dx = magnetX - prevX.current;
    prevX.current = magnetX;

    // Field gradient peaks when entering and exiting the coil edges
    const distToCoil = magnetX - coilCenterX;
    const fluxGradient = -Math.exp(-(distToCoil * distToCoil) / 2500) * (distToCoil / 40);
    const emf = -coilTurns * dx * fluxGradient * 0.45;

    setInducedVoltage(Math.max(-10, Math.min(10, emf)));
  }, [magnetX, coilTurns]);

  // Draw scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const coilY = 160;
    const coilCenterX = 280;

    ctx.fillStyle = '#060a18';
    ctx.fillRect(0, 0, w, h);

    // Draw Magnetic Field Lines from Magnet
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      ctx.beginPath();
      ctx.ellipse(magnetX, coilY, 90, Math.abs(i) * 30, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Bar Magnet (Red North, Blue South)
    const magW = 100;
    const magH = 34;
    const magTop = coilY - magH / 2;

    // North Pole (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(magnetX - magW / 2, magTop, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Fira Code';
    ctx.fillText('N', magnetX - magW / 4 - 4, coilY + 4);

    // South Pole (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(magnetX, magTop, magW / 2, magH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('S', magnetX + magW / 4 - 4, coilY + 4);

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(magnetX - magW / 2, magTop, magW, magH);

    // Draw Solenoid Coil (Copper Wire loops)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    for (let i = 0; i < coilTurns; i++) {
      const loopX = coilCenterX - 40 + i * 26;
      ctx.beginPath();
      ctx.ellipse(loopX, coilY, 12, 45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Wires connected to Voltmeter and Bulb
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;

    // Top wire to bulb
    ctx.beginPath();
    ctx.moveTo(coilCenterX - 40, coilY - 45);
    ctx.lineTo(coilCenterX - 40, 60);
    ctx.lineTo(coilCenterX + 160, 60);
    ctx.stroke();

    // Bottom wire to bulb
    ctx.beginPath();
    ctx.moveTo(coilCenterX + 40, coilY + 45);
    ctx.lineTo(coilCenterX + 40, 260);
    ctx.lineTo(coilCenterX + 160, 260);
    ctx.stroke();

    // Lightbulb at (coilCenterX + 160, 160)
    const bulbX = 490;
    const bulbY = 160;
    const brightness = Math.min(1.0, Math.abs(inducedVoltage) / 4);

    // Bulb glow
    if (brightness > 0.05) {
      const glow = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, 40 * brightness + 10);
      glow.addColorStop(0, '#fef08a');
      glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bulb glass
    ctx.fillStyle = brightness > 0.1 ? '#facc15' : '#334155';
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Voltmeter Dial at bottom left
    const meterX = 110;
    const meterY = 270;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(meterX, meterY, 40, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Dial needle
    const needleAngle = -Math.PI / 2 + (inducedVoltage / 10) * (Math.PI / 2.5);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(meterX, meterY);
    ctx.lineTo(meterX + Math.cos(needleAngle) * 32, meterY + Math.sin(needleAngle) * 32);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(meterX, meterY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [magnetX, coilTurns, inducedVoltage]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Magnet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Электромагнитная индукция Фарадея' : 'Faraday\'s Electromagnetic Induction'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  {lang === 'ru' ? '10-11 Класс' : 'Grade 10-11'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Ток рождается ТОЛЬКО в момент движения магнита: ℰ = -dΦ/dt' : 'Current flows ONLY when magnetic flux changes: ℰ = -dΦ/dt'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoOscillating(!isAutoOscillating)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoOscillating ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isAutoOscillating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoOscillating ? (lang === 'ru' ? 'Ручной режим' : 'Manual') : (lang === 'ru' ? 'Автоколебания' : 'Auto Oscillate')}</span>
            </button>
          </div>
        </div>

        {/* Live Gauges Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6">
            <span>
              {lang === 'ru' ? 'Индуцированная ЭДС ℰ:' : 'Induced EMF ℰ:'}{' '}
              <strong className={Math.abs(inducedVoltage) > 0.5 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {inducedVoltage.toFixed(2)} В
              </strong>
            </span>
            <span>
              {lang === 'ru' ? 'Число витков N:' : 'Coil Turns N:'} <strong className="text-cyan-400">{coilTurns}</strong>
            </span>
          </div>

          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            {Math.abs(inducedVoltage) > 1.5 ? (lang === 'ru' ? 'Лампа горит!' : 'Bulb Lit!') : (lang === 'ru' ? 'Лампа погасла' : 'Bulb Off')}
          </span>
        </div>

        {/* Canvas Display */}
        <div className="relative w-full h-[360px] flex items-center justify-center p-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={340}
            className="w-full h-full rounded-xl bg-slate-950"
          />

          <div className="absolute bottom-6 right-6 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs text-slate-300 max-w-sm shadow-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
              {lang === 'ru' ? 'СЕКРЕТ ИНДУКЦИИ' : 'INDUCTION SECRET'}
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              {lang === 'ru'
                ? 'Останови магнит внутри катушки: лампочка мгновенно погаснет! Электрический ток рождает не сам магнит, а СКОРОСТЬ изменения магнитного потока dΦ/dt.'
                : 'Stop the magnet inside the coil: the bulb goes out instantly! Electricity is generated not by the magnet itself, but by the RATE of change dΦ/dt.'}
            </p>
          </div>
        </div>

        {/* Sliders Bar */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Положение магнита X (Двигай мышью!)' : 'Magnet Position X'}</span>
              <span className="font-mono text-cyan-400 font-bold">{magnetX.toFixed(0)} px</span>
            </div>
            <input
              type="range"
              min="80"
              max="480"
              value={magnetX}
              onChange={(e) => {
                setIsAutoOscillating(false);
                setMagnetX(Number(e.target.value));
              }}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Количество витков катушки N' : 'Number of Coil Turns N'}</span>
              <span className="font-mono text-amber-400 font-bold">{coilTurns}</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={coilTurns}
              onChange={(e) => setCoilTurns(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Textbook Insight */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Опыт Фарадея (1831 год)' : 'Faraday\'s Experiment (1831)'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Майкл Фарадей 10 лет носил в кармане магнит и катушку, пытаясь «превратить магнетизм в электричество». Великое открытие заключалось в том, что покоящийся магнит ничего не создает: индуцированное электрическое поле рождается только тогда, когда магнитные линии прорезают витки провода!'
              : 'Michael Faraday discovered that a static magnet creates zero current. An induced electric field is born only when moving magnetic lines of flux cut across copper wire loops!'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 text-xs font-mono text-amber-300">
            <code>{"ℰ = -N · dΦ/dt"}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
