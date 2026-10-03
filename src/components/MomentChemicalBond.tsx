import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Layers, RotateCcw, Play, Pause } from 'lucide-react';

interface MomentChemicalBondProps {
  lang: 'ru' | 'en';
}

type BondMode = 'covalent_nonpolar' | 'covalent_polar' | 'ionic';

export const MomentChemicalBond: React.FC<MomentChemicalBondProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bondType, setBondType] = useState<BondMode>('covalent_nonpolar');
  const [interatomicDistance, setInteratomicDistance] = useState<number>(140); // distance in px
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, w, h);

      if (isPlaying) {
        t += 0.04;
      }

      const centerX = w / 2;
      const centerY = h / 2;

      const d = interatomicDistance;
      const x1 = centerX - d / 2;
      const x2 = centerX + d / 2;

      // 1. NONPOLAR COVALENT: H₂ (sharing equally)
      if (bondType === 'covalent_nonpolar') {
        // Draw overlapping electron clouds
        const overlap = Math.max(0, 160 - d);
        
        // Atom 1 Cloud
        const grad1 = ctx.createRadialGradient(x1, centerY, 5, x1, centerY, 80);
        grad1.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        grad1.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(x1, centerY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Atom 2 Cloud
        const grad2 = ctx.createRadialGradient(x2, centerY, 5, x2, centerY, 80);
        grad2.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        grad2.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x2, centerY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Concentrated shared electron pair in the middle
        if (d < 160) {
          const sharedGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
          sharedGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
          sharedGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = sharedGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shared orbiting electrons (lemniscate figure 8 or orbit)
        const orbitRadiusX = d / 2 + 10;
        const orbitRadiusY = 35;
        for (let i = 0; i < 2; i++) {
          const phase = t + i * Math.PI;
          const ex = centerX + Math.sin(phase) * orbitRadiusX;
          const ey = centerY + Math.sin(phase * 2) * orbitRadiusY * 0.7;

          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Nuclei
        // H1
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x1, centerY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('p⁺', x1, centerY);

        // H2
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x2, centerY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('p⁺', x2, centerY);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText('H', x1, centerY + 30);
        ctx.fillText('H', x2, centerY + 30);
        ctx.fillStyle = '#c084fc';
        ctx.fillText(lang === 'ru' ? 'Общая электронная пара (H:H)' : 'Shared Electron Pair (H:H)', centerX, centerY - 60);
      } 
      // 2. POLAR COVALENT: HCl (Chlorine pulls electron cloud)
      else if (bondType === 'covalent_polar') {
        // H cloud (smaller, depleted)
        const grad1 = ctx.createRadialGradient(x1, centerY, 5, x1, centerY, 50);
        grad1.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        grad1.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(x1, centerY, 50, 0, Math.PI * 2);
        ctx.fill();

        // Cl cloud (massive, electronegative)
        const grad2 = ctx.createRadialGradient(x2, centerY, 5, x2, centerY, 110);
        grad2.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
        grad2.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(x2, centerY, 110, 0, Math.PI * 2);
        ctx.fill();

        // Asymmetric electron pair shifted towards Chlorine
        const shiftX = centerX + d * 0.2;
        const sharedGrad = ctx.createRadialGradient(shiftX, centerY, 0, shiftX, centerY, 45);
        sharedGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
        sharedGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = sharedGrad;
        ctx.beginPath();
        ctx.arc(shiftX, centerY, 45, 0, Math.PI * 2);
        ctx.fill();

        // Two shared electrons orbiting skewed towards Cl
        for (let i = 0; i < 2; i++) {
          const phase = t + i * Math.PI;
          const ex = shiftX + Math.cos(phase) * 30;
          const ey = centerY + Math.sin(phase) * 25;

          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Nuclei
        // H nucleus
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x1, centerY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H⁺', x1, centerY);

        // Cl nucleus
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x2, centerY, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Cl', x2, centerY);

        // Partial charge tags
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('δ⁺', x1, centerY - 30);

        ctx.fillStyle = '#10b981';
        ctx.fillText('δ⁻', x2, centerY - 45);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(lang === 'ru' ? 'Смещение плотности к электроотрицательному хлору' : 'Density skewed toward electronegative Cl', centerX, centerY + 70);
      }
      // 3. IONIC BOND: Na⁺ and Cl⁻ (Electron fully transferred)
      else {
        // Complete transfer: Na lost electron completely (shrunk radius)
        // Na+ ion
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(x1, centerY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Na⁺', x1, centerY);

        // Cl- ion (expanded valence octet)
        const gradCl = ctx.createRadialGradient(x2, centerY, 10, x2, centerY, 60);
        gradCl.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradCl.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        ctx.fillStyle = gradCl;
        ctx.beginPath();
        ctx.arc(x2, centerY, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(x2, centerY, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Cl⁻', x2, centerY);

        // 8 valence electrons orbiting Cl-
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + t * 0.5;
          const ex = x2 + Math.cos(angle) * 45;
          const ey = centerY + Math.sin(angle) * 45;
          ctx.fillStyle = i === 0 ? '#fef08a' : '#38bdf8'; // highlight the stolen electron
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Electrostatic attraction field lines between Na+ and Cl-
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1 + 25, centerY);
        ctx.lineTo(x2 - 35, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(lang === 'ru' ? 'Кулоновское притяжение (+ и -)' : 'Coulomb Attraction (+ and -)', centerX, centerY - 25);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [bondType, interatomicDistance, isPlaying, lang]);

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-mono font-bold border border-amber-800">
              {lang === 'ru' ? '8–9 Класс • Химия' : 'Grade 8-9 • Chemistry'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Химическая связь и электронные пары' : 'Chemical Bonding & Electron Shells'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Анатомия связи: Ковалентная неполярная, полярная и ионная' : 'Bond Anatomy: Covalent Nonpolar, Polar & Ionic'}
          </h3>
        </div>

        {/* Bond Type Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setBondType('covalent_nonpolar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bondType === 'covalent_nonpolar'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ru' ? 'Ковалентная неполярная (H₂)' : 'Nonpolar Covalent (H₂)'}
          </button>
          <button
            onClick={() => setBondType('covalent_polar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bondType === 'covalent_polar'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ru' ? 'Ковалентная полярная (HCl)' : 'Polar Covalent (HCl)'}
          </button>
          <button
            onClick={() => setBondType('ionic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bondType === 'ionic'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ru' ? 'Ионная связь (Na⁺Cl⁻)' : 'Ionic Bond (Na⁺Cl⁻)'}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas ref={canvasRef} width={800} height={320} className="w-full h-full block" />
      </div>

      {/* Distance Slider */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{lang === 'ru' ? 'Межатомное расстояние (r):' : 'Interatomic Distance (r):'}</span>
          <span className="font-mono text-cyan-400 font-bold">{interatomicDistance} pm</span>
        </div>
        <input
          type="range"
          min={90}
          max={240}
          step={2}
          value={interatomicDistance}
          onChange={(e) => setInteratomicDistance(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{lang === 'ru' ? 'Сближение: перекрывание электронных облаков' : 'Closer: electron clouds overlap'}</span>
          <span>{lang === 'ru' ? 'Удаление: разрыв связи' : 'Farther: bond cleavage'}</span>
        </div>
      </div>
    </div>
  );
};
