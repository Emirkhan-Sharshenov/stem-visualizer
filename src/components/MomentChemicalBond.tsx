import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { approach, clamp01, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentChemicalBondProps {
  lang: 'ru' | 'en';
}

type BondMode = 'covalent_nonpolar' | 'covalent_polar' | 'ionic';

// bond length (pm, drawn 1 px per pm), bond energy (kJ/mol) and electronegativity difference
const BOND: Record<BondMode, { re: number; De: number; dchi: number; a: [string, string]; rgb: [string, string]; cloud: [number, number] }> = {
  covalent_nonpolar: { re: 74, De: 436, dchi: 0, a: ['H', 'H'], rgb: ['90,200,255', '90,200,255'], cloud: [36, 36] },
  covalent_polar: { re: 127, De: 431, dchi: 0.96, a: ['H', 'Cl'], rgb: ['90,200,255', '120,230,120'], cloud: [34, 62] },
  ionic: { re: 236, De: 410, dchi: 2.23, a: ['Na', 'Cl'], rgb: ['170,140,255', '120,230,120'], cloud: [34, 66] },
};
const MX = 280; // centre of the molecule
// drawing scale, px per pm: small molecules are drawn larger so they fill the stage (the numbers stay in pm)
const SCALE: Record<BondMode, number> = { covalent_nonpolar: 2.1, covalent_polar: 1.5, ionic: 1 };
const MY = 190;
const morse = (r: number, re: number) => {
  const e = Math.exp((-1.8 / re) * (r - re));
  return (1 - e) * (1 - e) - 1; // in units of the bond energy
};

export const MomentChemicalBond: React.FC<MomentChemicalBondProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<BondMode>('covalent_nonpolar');
  const [held, setHeld] = useState(false);
  const [target, setTarget] = useState(110);
  const [shown, setShown] = useState({ r: 110, E: 0 });

  const live = useRef({ mode, held, target, lang });
  live.current = { mode, held, target, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // start stretched and let go, so the bond rings and settles
    const s = { r: BOND.covalent_nonpolar.re * 1.6, v: 0, mode: 'covalent_nonpolar' as BondMode, transfer: 0, report: 0, phase: 0 };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const B = BOND[L.mode];
      if (s.mode !== L.mode) {
        s.mode = L.mode;
        s.r = B.re * 1.55;
        s.v = 0;
        s.transfer = 0;
      }

      // dynamics: held by the slider, or free on the Morse curve with a little damping and thermal jiggle
      const a = 1.8 / B.re;
      if (L.held || still) {
        s.r = approach(s.r, L.held ? L.target : B.re, dt, 0.08);
        s.v = 0;
      } else {
        const e = Math.exp(-a * (s.r - B.re));
        const force = -2 * a * (1 - e) * e; // −dV/dr, V in bond-energy units
        const K = 13.5 / (a * a);
        s.v += (force * K - 0.7 * s.v) * dt + (Math.random() - 0.5) * 30 * Math.sqrt(dt);
        s.r += s.v * dt;
        s.r = Math.max(B.re * 0.62, Math.min(B.re * 2.8, s.r));
      }
      if (!still) s.phase += dt * 4.2;
      s.transfer = L.mode === 'ionic' ? approach(s.transfer, 1, dt, still ? 0.001 : 0.35) : 0;
      const E = morse(s.r, B.re) * B.De;
      s.report += dt;
      if (s.report > 0.12) {
        s.report = 0;
        setShown({ r: s.r, E });
      }

      drawStage(ctx, w, h, { x: MX, y: MY });
      const sc = SCALE[L.mode];
      const R = s.r * sc; // the distance on screen
      const x1 = MX - R / 2;
      const x2 = MX + R / 2;
      const bound = clamp01(-morse(s.r, B.re)); // 1 at the bottom of the well, 0 when torn apart

      // electron clouds; the ionic sodium gives its outer electron away and shrinks
      const c1 = L.mode === 'ionic' ? B.cloud[0] * (1.9 - 0.9 * s.transfer) : B.cloud[0];
      const cs = Math.pow(sc, 0.7);
      glow(ctx, x1, MY, c1 * 1.7 * cs, B.rgb[0], 0.55);
      glow(ctx, x2, MY, B.cloud[1] * 1.6 * cs, B.rgb[1], 0.5);
      if (L.mode !== 'ionic') {
        // the shared pair piles up between the nuclei; in HCl it leans towards chlorine
        const lean = L.mode === 'covalent_polar' ? 0.22 : 0;
        glow(ctx, MX + lean * R, MY, 46 + 10 * bound, '170,150,255', 0.55 * bound);
      }

      // the bonding pair: two electrons tracing a figure of eight round both nuclei
      if (L.mode !== 'ionic') {
        const lean = L.mode === 'covalent_polar' ? 0.2 * R : 0;
        for (const ph of [0, Math.PI]) {
          const ang = s.phase + ph;
          const ex = MX + lean + (R / 2 + 20) * Math.sin(ang) * (bound * 0.85 + 0.15);
          const ey = MY + 26 * Math.sin(2 * ang);
          glow(ctx, ex, ey, 14, '200,190,255', 0.8);
          ctx.fillStyle = '#F4F2FF';
          ctx.beginPath();
          ctx.arc(ex, ey, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // the octet round Cl⁻, one electron arriving from Na
        for (let k = 0; k < 8; k++) {
          const ang = s.phase * 0.5 + (k / 8) * Math.PI * 2;
          let ex = x2 + Math.cos(ang) * 44;
          let ey = MY + Math.sin(ang) * 44;
          if (k === 0) {
            const fx = x1 + Math.cos(s.phase) * 40;
            const fy = MY + Math.sin(s.phase) * 40;
            ex = fx + (ex - fx) * s.transfer;
            ey = fy + (ey - fy) * s.transfer;
          }
          ctx.fillStyle = k === 0 ? '#FFE08A' : '#F4F2FF';
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Coulomb pull drawn as arrows towards each other
        if (s.transfer > 0.6) {
          const al = 0.6 * (s.transfer - 0.6) / 0.4;
          ctx.strokeStyle = `rgba(255,200,120,${al})`;
          ctx.lineWidth = 2;
          for (const [from, to] of [[x1 + 26, x1 + 58], [x2 - 26, x2 - 58]] as const) {
            ctx.beginPath();
            ctx.moveTo(from, MY + 62);
            ctx.lineTo(to, MY + 62);
            ctx.stroke();
            const d = Math.sign(to - from);
            ctx.beginPath();
            ctx.moveTo(to, MY + 62);
            ctx.lineTo(to - d * 7, MY + 57);
            ctx.lineTo(to - d * 7, MY + 67);
            ctx.closePath();
            ctx.fillStyle = `rgba(255,200,120,${al})`;
            ctx.fill();
          }
        }
      }

      // nuclei with their symbols and charges
      const charges: [string, string] = L.mode === 'covalent_polar' ? ['δ+', 'δ−'] : L.mode === 'ionic' && s.transfer > 0.5 ? ['+', '−'] : ['', ''];
      [[x1, B.a[0], B.rgb[0], charges[0]], [x2, B.a[1], B.rgb[1], charges[1]]].forEach(([x, sym, rgb, q]) => {
        const xx = x as number;
        const g = ctx.createRadialGradient(xx - 4, MY - 4, 1, xx, MY, 15);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(1, `rgb(${rgb})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(xx, MY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0B0E18';
        ctx.font = `800 12px ${STAGE.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sym as string, xx, MY + 0.5);
        if (q) {
          ctx.fillStyle = String(q).includes('+') ? '#FFC46B' : '#7FE3FF';
          ctx.font = `800 15px ${STAGE.font}`;
          ctx.fillText(q as string, xx, MY - 36);
        }
      });

      // bond length ruler
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x1, MY + 92);
      ctx.lineTo(x2, MY + 92);
      ctx.moveTo(x1, MY + 86);
      ctx.lineTo(x1, MY + 98);
      ctx.moveTo(x2, MY + 86);
      ctx.lineTo(x2, MY + 98);
      ctx.stroke();
      pill(ctx, MX, MY + 116, `r = ${Math.round(s.r)} ${ru ? 'пм' : 'pm'}`, STAGE.ink);
      if (bound < 0.15) pill(ctx, MX, 52, ru ? 'атомы слишком далеко — связь рвётся' : 'too far apart — the bond breaks', '#FF8A9E');
      else if (s.r < B.re * 0.8) pill(ctx, MX, 52, ru ? 'слишком близко — ядра отталкиваются' : 'too close — the nuclei repel', '#FF8A9E');

      // the energy curve with a dot for the present distance
      {
        const gx0 = 572;
        const gx1 = 776;
        const gy0 = 70;
        const gy1 = 320;
        const rMin = B.re * 0.62;
        const rMax = B.re * 2.8;
        const xOf = (r: number) => gx0 + ((r - rMin) / (rMax - rMin)) * (gx1 - gx0);
        const yOf = (v: number) => gy1 - ((Math.min(1.2, v) + 1.05) / 2.25) * (gy1 - gy0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath();
        ctx.roundRect(gx0 - 14, gy0 - 40, gx1 - gx0 + 28, gy1 - gy0 + 70, 16);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `600 12px ${STAGE.font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(ru ? 'Энергия от расстояния E(r)' : 'Energy vs distance E(r)', gx0, gy0 - 18);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(gx0, yOf(0));
        ctx.lineTo(gx1, yOf(0));
        ctx.moveTo(xOf(B.re), gy0);
        ctx.lineTo(xOf(B.re), gy1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#8B7CFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const r = rMin + (i / 80) * (rMax - rMin);
          const y = yOf(morse(r, B.re));
          if (i === 0) ctx.moveTo(xOf(r), y);
          else ctx.lineTo(xOf(r), y);
        }
        ctx.stroke();
        const px = xOf(s.r);
        const py = yOf(morse(s.r, B.re));
        glow(ctx, px, py, 20, '139,124,255', 0.7);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `500 11px ${STAGE.mono}`;
        ctx.fillText(`r₀ = ${B.re} ${ru ? 'пм' : 'pm'}`, xOf(B.re) + 5, gy1 + 16);
        ctx.fillText(`−${B.De} ${ru ? 'кДж/моль' : 'kJ/mol'}`, gx0, yOf(-1) + 16);
      }
    });
  }, []);

  const ru = lang === 'ru';
  const B = BOND[mode];
  const pick = (m: BondMode, label: string) => (
    <Button
      variant={mode === m ? 'primary' : 'outline'}
      size="sm"
      className="font-semibold"
      onPress={() => {
        setMode(m);
        setHeld(false);
        setTarget(Math.round(BOND[m].re * 1.5));
      }}
    >
      {label}
    </Button>
  );
  const typeName = { covalent_nonpolar: ru ? 'неполярная' : 'nonpolar', covalent_polar: ru ? 'полярная' : 'polar', ionic: ru ? 'ионная' : 'ionic' }[mode];
  return (
    <SimShell
      badge={ru ? '8–9 класс · Химия' : 'Grades 8–9 · Chemistry'}
      formula={ru ? 'Δχ: 0 → 0,96 → 2,23' : 'Δχ: 0 → 0.96 → 2.23'}
      title={ru ? 'Химическая связь: как атомы держатся вместе' : 'The chemical bond: how atoms hold together'}
      actions={
        <>
          {pick('covalent_nonpolar', 'H₂')}
          {pick('covalent_polar', 'HCl')}
          {pick('ionic', 'NaCl')}
        </>
      }
      readouts={[
        { label: ru ? 'Связь' : 'Bond', value: typeName },
        { label: ru ? 'Расстояние' : 'Distance', value: `${Math.round(shown.r)} ${ru ? 'пм' : 'pm'}`, color: '#4A3BEB' },
        { label: ru ? 'Энергия' : 'Energy', value: `${Math.round(shown.E)} ${ru ? 'кДж' : 'kJ'}`, color: shown.E < -0.5 * B.De ? '#1A8F50' : '#D9822B' },
        { label: 'Δχ', value: ru ? String(B.dchi).replace('.', ',') : String(B.dchi) },
      ]}
      controls={[
        {
          label: ru ? 'Растянуть или сжать связь' : 'Stretch or squeeze the bond',
          value: held ? `${target} ${ru ? 'пм' : 'pm'}` : ru ? 'атомы свободны' : 'atoms free',
          color: '#4A3BEB',
          input: (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <RangeSlider
                  value={target}
                  onChange={(v) => {
                    setTarget(v);
                    setHeld(true);
                  }}
                  min={Math.round(B.re * 0.62)}
                  max={Math.round(B.re * 2.8)}
                />
              </div>
              <Button size="sm" variant={held ? 'primary' : 'outline'} className="font-semibold shrink-0" isDisabled={!held} onPress={() => setHeld(false)}>
                {ru ? 'Отпустить' : 'Let go'}
              </Button>
            </div>
          ),
          hint: ru
            ? 'Растяни и отпусти: атомы закачаются и остановятся там, где энергия меньше всего, — это и есть длина связи.'
            : 'Stretch and let go: the atoms swing and settle where the energy is lowest. That is the bond length.',
        },
      ]}
      insight={{
        title: ru ? 'Главное' : 'The key idea',
        text: ru
          ? 'Чем больше разница электроотрицательностей Δχ, тем сильнее общая пара смещена к одному атому. При Δχ около 2 электрон переходит целиком — получаются ионы, и их держит кулоновское притяжение.'
          : 'The larger the electronegativity gap Δχ, the further the shared pair leans to one atom. Around Δχ ≈ 2 the electron moves over entirely: ions form and Coulomb attraction holds them.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Два атома, их электронные облака и график энергии связи' : 'Two atoms, their electron clouds and the bond energy curve'} />
    </SimShell>
  );
};
