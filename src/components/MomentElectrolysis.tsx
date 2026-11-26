import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { approach, clamp01, drawStage, glow, pill, runStage, samplePolyline, STAGE, stepParticles, type Particle } from '../lib/stage';

interface MomentElectrolysisProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×380): a battery on top, a beaker of CuCl₂ solution, a cathode on the left and an anode on the right
const BX0 = 150;
const BX1 = 650;
const SURF = 142; // the surface of the solution
const BY1 = 350;
const CATH = 236; // centre of the cathode (−)
const ANOD = 564; // centre of the anode (+)
const EW = 22;
const E_TOP = 92;
const E_BOT = 322;
const U_DEC = 1.4; // decomposition voltage of CuCl₂, below it nothing happens
const R_CELL = 2; // Ω
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

interface Ion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cu: boolean;
}

export const MomentElectrolysis: React.FC<MomentElectrolysisProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState(6);
  const [playing, setPlaying] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [shown, setShown] = useState({ I: 0, mg: 0, t: 0 });

  const live = useRef({ voltage, playing, lang });
  live.current = { voltage, playing, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const inBulk = (): [number, number] => [CATH + 40 + Math.random() * (ANOD - CATH - 80), SURF + 18 + Math.random() * (BY1 - SURF - 36)];
    const ions: Ion[] = Array.from({ length: 36 }, (_, i) => {
      const [x, y] = inBulk();
      return { x, y, vx: 0, vy: 0, cu: i % 3 === 0 };
    });
    const bubbles: (Particle & { r: number })[] = [];
    const flashes: Particle[] = [];
    const deposits: number[] = [];
    const wire = samplePolyline([[ANOD, E_TOP], [ANOD, 40], [430, 40], [370, 40], [CATH, 40], [CATH, E_TOP]]);
    const s = { I: 0, mg: 0, time: 0, conc: 1, q: 0, report: 0 };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const run = L.playing && !still;
      const over = Math.max(0, L.voltage - U_DEC);
      s.I = approach(s.I, over / R_CELL, dt, 0.3);
      if (run) {
        s.time += dt;
        // Faraday: m = I·t·M / (z·F), copper M = 63.5 g/mol, z = 2
        s.mg += ((s.I * dt * 63.5) / (2 * 96485)) * 1000;
        s.q += s.I * 22 * dt;
      }
      s.report += dt;
      if (s.report > 0.15) {
        s.report = 0;
        setShown({ I: s.I, mg: s.mg, t: s.time });
      }

      // ions: random thermal motion plus a drift in the field, Cu²⁺ to the cathode, Cl⁻ to the anode
      if (run) {
        const drift = 16 * over;
        const rt = Math.sqrt(dt);
        for (const ion of ions) {
          ion.vx += (Math.random() - 0.5) * 260 * rt + (ion.cu ? -drift : drift) * 2.2 * dt;
          ion.vy += (Math.random() - 0.5) * 260 * rt;
          ion.vx *= 1 - 2.2 * dt;
          ion.vy *= 1 - 2.2 * dt;
          ion.x += ion.vx * dt;
          ion.y += ion.vy * dt;
          if (ion.y < SURF + 12) { ion.y = SURF + 12; ion.vy = Math.abs(ion.vy); }
          if (ion.y > BY1 - 10) { ion.y = BY1 - 10; ion.vy = -Math.abs(ion.vy); }
          const atCath = ion.x < CATH + EW / 2 + 7 && ion.y < E_BOT;
          const atAnod = ion.x > ANOD - EW / 2 - 7 && ion.y < E_BOT;
          if (over > 0 && ion.cu && atCath) {
            // Cu²⁺ + 2e⁻ → Cu: it takes two electrons and sticks to the cathode
            deposits.push(ion.y);
            flashes.push({ x: CATH + EW / 2 + 3, y: ion.y, vx: 0, vy: 0, life: 0, max: 0.35, seed: 0 });
            s.conc = Math.max(0.35, s.conc - 0.003);
            [ion.x, ion.y] = inBulk();
          } else if (over > 0 && !ion.cu && atAnod) {
            // 2Cl⁻ − 2e⁻ → Cl₂: gas bubbles grow on the anode and rise
            bubbles.push({ x: ANOD - EW / 2 - 5, y: ion.y, vx: 0, vy: -20, life: 0, max: 6, seed: Math.random() * 6.28, r: 2 + Math.random() * 2 });
            flashes.push({ x: ANOD - EW / 2 - 3, y: ion.y, vx: 0, vy: 0, life: 0, max: 0.35, seed: 1 });
            [ion.x, ion.y] = inBulk();
          } else {
            if (ion.x < CATH + EW / 2 + 6) { ion.x = CATH + EW / 2 + 6; ion.vx = Math.abs(ion.vx); }
            if (ion.x > ANOD - EW / 2 - 6) { ion.x = ANOD - EW / 2 - 6; ion.vx = -Math.abs(ion.vx); }
          }
        }
        for (const b of bubbles) {
          b.r = Math.min(7, b.r + 3 * dt);
          b.vy -= 40 * dt;
          b.x += Math.sin(b.seed + t * 5) * 12 * dt - 6 * dt;
        }
        stepParticles(bubbles, dt);
        for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].y < SURF + 2) bubbles.splice(i, 1);
        stepParticles(flashes, dt);
      }

      drawStage(ctx, w, h, { x: (BX0 + BX1) / 2, y: 220 });

      // wires and the battery, electrons running from the anode round to the cathode
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#20273A';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(CATH, E_TOP);
      ctx.lineTo(CATH, 40);
      ctx.lineTo(ANOD, 40);
      ctx.lineTo(ANOD, E_TOP);
      ctx.stroke();
      const iGlow = clamp01(s.I / 4);
      ctx.strokeStyle = `rgba(${Math.round(58 + 30 * iGlow)},${Math.round(69 + 130 * iGlow)},${Math.round(96 + 159 * iGlow)},0.9)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      if (s.I > 0.02) {
        for (let k = 0; k < 18; k++) {
          const idx = Math.floor(((k / 18) * wire.length + s.q) % wire.length);
          const [ex, ey] = wire[idx];
          if (ex > 362 && ex < 438) continue;
          ctx.fillStyle = `rgba(130,220,255,${0.4 + 0.6 * iGlow})`;
          ctx.beginPath();
          ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      {
        const g = ctx.createLinearGradient(0, 24, 0, 56);
        g.addColorStop(0, '#33446E');
        g.addColorStop(1, '#18213A');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(362, 24, 76, 32, 8);
        ctx.fill();
        ctx.fillStyle = 'rgba(61,214,255,0.9)';
        ctx.fillRect(362, 34, 76, 12);
        ctx.fillStyle = '#06222C';
        ctx.font = `700 11px ${STAGE.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${fmt(L.voltage, 1, ru)} ${ru ? 'В' : 'V'}`, 400, 40.5);
        ctx.fillStyle = STAGE.ink;
        ctx.font = `700 14px ${STAGE.font}`;
        ctx.fillText('−', 352, 40);
        ctx.fillText('+', 448, 40);
      }

      // the solution: blue from Cu²⁺, paler as copper leaves it
      const sol = ctx.createLinearGradient(0, SURF, 0, BY1);
      sol.addColorStop(0, `rgba(40,150,220,${0.16 * s.conc + 0.04})`);
      sol.addColorStop(1, `rgba(30,110,200,${0.3 * s.conc + 0.05})`);
      ctx.fillStyle = sol;
      ctx.fillRect(BX0, SURF, BX1 - BX0, BY1 - SURF);
      ctx.strokeStyle = 'rgba(160,210,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = BX0; x <= BX1; x += 8) {
        const y = SURF + Math.sin(x * 0.05 + t * 1.6) * 1.2;
        if (x === BX0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // electrodes: graphite rods; copper grows on the cathode
      for (const [cx, label] of [[CATH, ru ? 'катод −' : 'cathode −'], [ANOD, ru ? 'анод +' : 'anode +']] as const) {
        const g = ctx.createLinearGradient(cx - EW / 2, 0, cx + EW / 2, 0);
        g.addColorStop(0, '#2B2F38');
        g.addColorStop(0.45, '#5A606E');
        g.addColorStop(1, '#22252D');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(cx - EW / 2, E_TOP, EW, E_BOT - E_TOP, 4);
        ctx.fill();
        pill(ctx, cx, E_TOP - 22 + (cx === CATH ? 0 : 0), label, cx === CATH ? '#7FE3FF' : '#FFC46B');
      }
      const layer = Math.min(8, 1 + deposits.length * 0.03);
      const cu = ctx.createLinearGradient(CATH + EW / 2, 0, CATH + EW / 2 + layer, 0);
      cu.addColorStop(0, '#B8652F');
      cu.addColorStop(0.5, '#F0A56A');
      cu.addColorStop(1, '#C4733C');
      ctx.fillStyle = cu;
      ctx.fillRect(CATH + EW / 2, SURF + 4, layer, E_BOT - SURF - 4);
      ctx.fillStyle = '#E08A4E';
      for (const y of deposits.slice(-160)) {
        ctx.beginPath();
        ctx.arc(CATH + EW / 2 + layer, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ions
      for (const ion of ions) {
        const col = ion.cu ? ['#FFB37A', '#D9732F'] : ['#B8F27A', '#4FB33A'];
        const g = ctx.createRadialGradient(ion.x - 2, ion.y - 2, 1, ion.x, ion.y, ion.cu ? 8 : 7);
        g.addColorStop(0, col[0]);
        g.addColorStop(1, col[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, ion.cu ? 7.5 : 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0B0E18';
        ctx.font = `800 8px ${STAGE.font}`;
        ctx.fillText(ion.cu ? '2+' : '−', ion.x, ion.y + 0.5);
      }

      // Cl₂ bubbles and reaction flashes
      for (const b of bubbles) {
        ctx.strokeStyle = 'rgba(210,255,150,0.7)';
        ctx.fillStyle = 'rgba(190,240,120,0.18)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      for (const f of flashes) glow(ctx, f.x, f.y, 16, f.seed ? '200,255,140' : '255,200,140', 0.8 * (1 - f.life / f.max));

      // the glass
      ctx.strokeStyle = 'rgba(200,220,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(BX0, 118);
      ctx.lineTo(BX0, BY1);
      ctx.lineTo(BX1, BY1);
      ctx.lineTo(BX1, 118);
      ctx.stroke();

      pill(ctx, (BX0 + BX1) / 2, BY1 + 16, over > 0 ? (ru ? 'Cu²⁺ + 2e⁻ → Cu      2Cl⁻ − 2e⁻ → Cl₂↑' : 'Cu²⁺ + 2e⁻ → Cu      2Cl⁻ − 2e⁻ → Cl₂↑') : ru ? `меньше ${fmt(U_DEC, 1, true)} В — раствор не разлагается` : `below ${U_DEC} V the solution does not decompose`, over > 0 ? STAGE.ink : '#FF8A9E');
    });
  }, [resetKey]);

  const ru = lang === 'ru';
  return (
    <SimShell
      badge={ru ? 'Химия · Физика' : 'Chemistry · Physics'}
      formula="m = I·t·M / (z·F)"
      title={ru ? 'Электролиз раствора CuCl₂: ток выделяет медь и хлор' : 'Electrolysis of CuCl₂ solution: current frees copper and chlorine'}
      actions={
        <>
          <Button variant="outline" size="sm" isIconOnly aria-label={playing ? (ru ? 'Пауза' : 'Pause') : ru ? 'Пуск' : 'Play'} onPress={() => setPlaying(!playing)}>
            {playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          </Button>
          <Button variant="outline" size="sm" className="font-semibold" onPress={() => setResetKey((k) => k + 1)}>
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            {ru ? 'Заново' : 'Restart'}
          </Button>
        </>
      }
      readouts={[
        { label: ru ? 'Напряжение' : 'Voltage', value: `${fmt(voltage, 1, ru)} ${ru ? 'В' : 'V'}`, color: '#22A8E0' },
        { label: ru ? 'Ток' : 'Current', value: `${fmt(shown.I, 2, ru)} ${ru ? 'А' : 'A'}`, color: '#1A8F50' },
        { label: ru ? 'Меди на катоде' : 'Copper on the cathode', value: `${fmt(shown.mg, 2, ru)} ${ru ? 'мг' : 'mg'}`, color: '#C46A2B' },
        { label: ru ? 'Время' : 'Time', value: `${Math.floor(shown.t)} ${ru ? 'с' : 's'}` },
      ]}
      controls={[
        {
          label: ru ? 'Напряжение источника' : 'Source voltage',
          value: `${fmt(voltage, 1, ru)} ${ru ? 'В' : 'V'}`,
          color: '#22A8E0',
          input: <RangeSlider value={voltage} onChange={(v) => setVoltage(v)} min={0} max={12} step={0.5} />,
          hint: ru
            ? 'Ниже 1,4 В ионы только бродят. Выше — Cu²⁺ плывут к катоду и оседают медью, Cl⁻ отдают электроны на аноде и уходят пузырьками хлора.'
            : 'Below 1.4 V the ions only wander. Above it Cu²⁺ swim to the cathode and plate out as copper, while Cl⁻ give up electrons at the anode and leave as chlorine bubbles.',
        },
      ]}
      insight={{
        title: ru ? 'Закон Фарадея' : "Faraday's law",
        text: ru
          ? 'Масса меди растёт пропорционально току и времени: вдвое больше ток — вдвое быстрее растёт слой на катоде. А раствор при этом бледнеет: ионов Cu²⁺ в нём всё меньше.'
          : 'The copper grows in proportion to current and time: double the current and the layer grows twice as fast. Meanwhile the solution pales as Cu²⁺ ions run out.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Стакан с раствором хлорида меди, катод, анод и батарея' : 'A beaker of copper chloride solution with a cathode, an anode and a battery'} />
    </SimShell>
  );
};
