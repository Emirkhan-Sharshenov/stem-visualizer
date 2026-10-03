import React, { useState } from 'react';
import { HelpCircle, RotateCcw, Scale, Zap } from 'lucide-react';

interface MomentLeverProps {
  lang: 'ru' | 'en';
}

export const MomentLever: React.FC<MomentLeverProps> = ({ lang }) => {
  const [m1, setM1] = useState<number>(30); // kg
  const [l1, setL1] = useState<number>(2.0); // meters
  const [m2, setM2] = useState<number>(15); // kg
  const [l2, setL2] = useState<number>(4.0); // meters

  // Torque / Moment of force
  const g = 9.8;
  const torque1 = m1 * g * l1;
  const torque2 = m2 * g * l2;
  const netTorque = torque1 - torque2;

  // Visual tilt angle (capped between -20 and +20 degrees)
  const tiltAngle = Math.max(-18, Math.min(18, (netTorque / 150) * 12));
  const isBalanced = Math.abs(netTorque) < 5;

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Simulation Stage */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'ru' ? 'Рычаг Архимеда: Правило моментов' : 'The Lever Rule: Torque Equilibrium'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  {lang === 'ru' ? '5-6 Класс' : 'Grade 5-6'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'F₁ · L₁ = F₂ · L₂ — «Дайте мне точку опоры, и я переверну Землю»' : 'F₁ · L₁ = F₂ · L₂ — Give me a place to stand and I will move the Earth'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setM1(30); setL1(2); setM2(15); setL2(4); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Сброс' : 'Reset'}</span>
          </button>
        </div>

        {/* Live Gauges Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6">
            <span>
              {lang === 'ru' ? 'Момент слева M₁:' : 'Left Torque M₁:'}{' '}
              <strong className="text-cyan-400">{torque1.toFixed(0)} Н·м</strong>
            </span>
            <span>
              {lang === 'ru' ? 'Момент справа M₂:' : 'Right Torque M₂:'}{' '}
              <strong className="text-amber-400">{torque2.toFixed(0)} Н·м</strong>
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded font-bold ${
            isBalanced ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
          }`}>
            {isBalanced ? (lang === 'ru' ? '⚖️ РАВНОВЕСИЕ!' : '⚖️ BALANCED!') : (lang === 'ru' ? 'НЕТ РАВНОВЕСИЯ' : 'UNBALANCED')}
          </span>
        </div>

        {/* Visual Lever SVG Scene */}
        <div className="relative w-full h-[380px] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 600 340">
            {/* Ground */}
            <line x1="40" y1="280" x2="560" y2="280" stroke="#334155" strokeWidth="4" />

            {/* Fulcrum Pivot Triangle */}
            <polygon points="300,210 275,280 325,280" fill="#475569" stroke="#64748b" strokeWidth="2" />
            <circle cx="300" cy="210" r="5" fill="#f8fafc" />

            {/* Tilting Beam Group */}
            <g transform={`rotate(${tiltAngle} 300 210)`}>
              {/* Wooden beam */}
              <rect x="60" y="202" width="480" height="16" rx="4" fill="#92400e" stroke="#b45309" strokeWidth="2" />

              {/* Pivot center indicator */}
              <line x1="300" y1="195" x2="300" y2="225" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="3 3" />

              {/* Left Weight */}
              {(() => {
                const posX = 300 - l1 * 45;
                const size = Math.max(24, Math.min(55, Math.sqrt(m1) * 7));
                return (
                  <g>
                    <rect
                      x={posX - size / 2}
                      y={202 - size}
                      width={size}
                      height={size}
                      rx="6"
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    <text
                      x={posX}
                      y={202 - size / 2 + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="Fira Code, monospace"
                    >
                      {m1}kg
                    </text>
                    {/* Distance arrow */}
                    <line x1="300" y1="185" x2={posX} y2="185" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x={(300 + posX) / 2} y="178" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="Fira Code">
                      L₁ = {l1}m
                    </text>
                  </g>
                );
              })()}

              {/* Right Weight */}
              {(() => {
                const posX = 300 + l2 * 45;
                const size = Math.max(24, Math.min(55, Math.sqrt(m2) * 7));
                return (
                  <g>
                    <rect
                      x={posX - size / 2}
                      y={202 - size}
                      width={size}
                      height={size}
                      rx="6"
                      fill="#d97706"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <text
                      x={posX}
                      y={202 - size / 2 + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="Fira Code, monospace"
                    >
                      {m2}kg
                    </text>
                    {/* Distance arrow */}
                    <line x1="300" y1="185" x2={posX} y2="185" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x={(300 + posX) / 2} y="178" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="Fira Code">
                      L₂ = {l2}m
                    </text>
                  </g>
                );
              })()}
            </g>
          </svg>
        </div>

        {/* Sliders Grid */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Масса слева M₁' : 'Left Mass M₁'}</span>
              <span className="font-mono text-cyan-400 font-bold">{m1} kg</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={m1}
              onChange={(e) => setM1(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Плечо слева L₁' : 'Left Arm L₁'}</span>
              <span className="font-mono text-cyan-400 font-bold">{l1} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={l1}
              onChange={(e) => setL1(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Масса справа M₂' : 'Right Mass M₂'}</span>
              <span className="font-mono text-amber-400 font-bold">{m2} kg</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Плечо справа L₂' : 'Right Arm L₂'}</span>
              <span className="font-mono text-amber-400 font-bold">{l2} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={l2}
              onChange={(e) => setL2(Number(e.target.value))}
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
              {lang === 'ru' ? 'В чем золотое правило механики?' : 'Golden Rule of Mechanics'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Рычаг дает выигрыш в силе ровно во столько раз, во сколько раз длиннее плечо! Если твое плечо в 4 раза длиннее, ты сможешь поднять груз в 4 раза тяжелее себя. Но при этом придется пройти в 4 раза больший путь.'
              : 'A lever multiplies force by the ratio of lever arm lengths. An arm 4 times longer lets you lift 4 times your weight, but you must move through 4 times the distance!'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 text-xs font-mono text-amber-300">
            <code>F₁ · L₁ = F₂ · L₂</code>
          </div>
        </div>
      </div>
    </div>
  );
};
