import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { clamp01, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentLeverProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×360): a beam on a fulcrum with a load hanging on each side
const FX = 400;
const FY = 150;
const PPM = 80; // pixels per metre along the beam
const HALF = 4; // m each side
const MAX_TILT = (16 * Math.PI) / 180;
const G = 9.8;
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentLever: React.FC<MomentLeverProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [m1, setM1] = useState(30);
  const [l1, setL1] = useState(2);
  const [m2, setM2] = useState(15);
  const [l2, setL2] = useState(3);

  const live = useRef({ m1, l1, m2, l2, lang });
  live.current = { m1, l1, m2, l2, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { th: 0, om: 0, sw1: 0, sv1: 0, sw2: 0, sv2: 0, prevOm: 0 };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const M1 = L.m1 * G * L.l1;
      const M2 = L.m2 * G * L.l2;
      const net = M1 - M2; // positive turns the left side down

      // the beam: I·θ'' = net torque · cos θ − damping; it rests on the ground at ±16°
      const I = L.m1 * L.l1 * L.l1 + L.m2 * L.l2 * L.l2 + 40;
      if (still) s.th = Math.abs(net) < 5 ? 0 : -Math.sign(net) * MAX_TILT;
      else {
        const acc = ((-net * Math.cos(s.th)) / I) * 0.9 - 1.6 * s.om;
        s.om += acc * dt;
        s.th += s.om * dt;
        if (Math.abs(s.th) > MAX_TILT) {
          s.th = Math.sign(s.th) * MAX_TILT;
          s.om = -s.om * 0.25; // a small knock on the ground
        }
        // the loads swing a little when the beam jerks
        const kick = (s.om - s.prevOm) / Math.max(dt, 1e-3);
        s.prevOm = s.om;
        for (const k of [1, 2] as const) {
          const key = k === 1 ? 'sw1' : 'sw2';
          const vk = k === 1 ? 'sv1' : 'sv2';
          s[vk] += (-18 * s[key] - 1.8 * s[vk] - kick * 0.02) * dt;
          s[key] += s[vk] * dt;
        }
      }

      drawStage(ctx, w, h, { x: FX, y: FY });

      // ground and the fulcrum
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(FX - 70, FY + 98, 140, 10, 5);
      ctx.fill();
      const fg = ctx.createLinearGradient(FX - 30, 0, FX + 30, 0);
      fg.addColorStop(0, '#4A5068');
      fg.addColorStop(0.5, '#A8B0C6');
      fg.addColorStop(1, '#3A4058');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(FX, FY + 6);
      ctx.lineTo(FX - 34, FY + 98);
      ctx.lineTo(FX + 34, FY + 98);
      ctx.closePath();
      ctx.fill();

      // the beam with metre marks
      const cos = Math.cos(s.th);
      const sin = Math.sin(s.th);
      const at = (d: number) => [FX + d * PPM * cos, FY + d * PPM * sin] as const; // d < 0 is the left side
      const balanced = Math.abs(net) < 5;
      ctx.save();
      ctx.translate(FX, FY);
      ctx.rotate(s.th);
      const bg = ctx.createLinearGradient(0, -9, 0, 9);
      bg.addColorStop(0, '#E9D2A6');
      bg.addColorStop(0.5, '#C9A26A');
      bg.addColorStop(1, '#8C6A3C');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(-HALF * PPM - 10, -8, HALF * PPM * 2 + 20, 16, 6);
      ctx.fill();
      for (let d = -HALF; d <= HALF; d++) {
        ctx.fillStyle = 'rgba(60,40,20,0.5)';
        ctx.fillRect(d * PPM - 0.75, -8, 1.5, d === 0 ? 16 : 7);
      }
      ctx.restore();
      if (balanced) glow(ctx, FX, FY, 200, '80,220,140', 0.18);

      // loads: ropes from the beam and a weight whose size follows its mass
      const load = (d: number, m: number, swing: number, col: string) => {
        const [ax, ay] = at(d);
        const rope = 44;
        const bx = ax + Math.sin(swing) * rope;
        const by = ay + Math.cos(swing) * rope;
        ctx.strokeStyle = 'rgba(230,236,250,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        const sz = 18 + Math.cbrt(m) * 9;
        const g = ctx.createLinearGradient(bx - sz / 2, 0, bx + sz / 2, 0);
        g.addColorStop(0, `${col}AA`);
        g.addColorStop(0.45, col);
        g.addColorStop(1, `${col}88`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(bx - sz / 2, by, sz, sz * 0.9, 6);
        ctx.fill();
        ctx.fillStyle = '#0B0E18';
        ctx.font = `800 12px ${STAGE.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m} ${ru ? 'кг' : 'kg'}`, bx, by + sz * 0.45);
        // the arm, measured along the beam
        const [mx, my] = at(d / 2);
        pill(ctx, mx, my - 26, `l = ${fmt(Math.abs(d), 1, ru)} ${ru ? 'м' : 'm'}`, col);
      };
      load(-L.l1, L.m1, s.sw1, '#9B8CFF');
      load(L.l2, L.m2, s.sw2, '#5FDDFF');

      // the two moments as arcs round the fulcrum: the bigger one wins
      const arc = (dir: 1 | -1, M: number, col: string) => {
        const span = 0.25 + clamp01(M / 1200) * 1.6;
        const r = 46;
        const a0 = -Math.PI / 2;
        ctx.strokeStyle = col;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(FX, FY, r, a0, a0 - dir * span, dir === 1);
        ctx.stroke();
        const ae = a0 - dir * span;
        const ex = FX + r * Math.cos(ae);
        const ey = FY + r * Math.sin(ae);
        const tx = -Math.sin(ae) * -dir;
        const ty = Math.cos(ae) * -dir;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(ex + tx * 9, ey + ty * 9);
        ctx.lineTo(ex - ty * 6, ey + tx * 6);
        ctx.lineTo(ex + ty * 6, ey - tx * 6);
        ctx.closePath();
        ctx.fill();
      };
      arc(1, M1, '#9B8CFF');
      arc(-1, M2, '#5FDDFF');

      pill(
        ctx,
        FX,
        34,
        balanced ? (ru ? 'равновесие: F₁·l₁ = F₂·l₂' : 'balance: F₁·l₁ = F₂·l₂') : net > 0 ? (ru ? 'перевешивает левая сторона' : 'the left side wins') : ru ? 'перевешивает правая сторона' : 'the right side wins',
        balanced ? '#6FE3A0' : STAGE.ink,
      );
      void t;
    });
  }, []);

  const ru = lang === 'ru';
  const M1 = m1 * G * l1;
  const M2 = m2 * G * l2;
  const balanced = Math.abs(M1 - M2) < 5;
  return (
    <SimShell
      badge={ru ? '7 класс · Физика' : 'Grade 7 · Physics'}
      formula="F₁ · l₁ = F₂ · l₂"
      title={ru ? 'Рычаг: выигрыш в силе — проигрыш в расстоянии' : 'The lever: gain in force, loss in distance'}
      readouts={[
        { label: ru ? 'Момент слева' : 'Left moment', value: `${Math.round(M1)} ${ru ? 'Н·м' : 'N·m'}`, color: '#6E54E0' },
        { label: ru ? 'Момент справа' : 'Right moment', value: `${Math.round(M2)} ${ru ? 'Н·м' : 'N·m'}`, color: '#1E88C8' },
        { label: ru ? 'Итог' : 'Result', value: balanced ? (ru ? 'равновесие' : 'balance') : M1 > M2 ? (ru ? 'влево' : 'left down') : ru ? 'вправо' : 'right down', color: balanced ? '#1A8F50' : undefined },
      ]}
      controls={[
        { label: ru ? 'Масса слева' : 'Left mass', value: `${m1} ${ru ? 'кг' : 'kg'}`, color: '#6E54E0', input: <RangeSlider value={m1} onChange={setM1} min={5} max={60} step={5} /> },
        { label: ru ? 'Плечо слева' : 'Left arm', value: `${fmt(l1, 1, ru)} ${ru ? 'м' : 'm'}`, color: '#6E54E0', input: <RangeSlider value={l1} onChange={setL1} min={0.5} max={4} step={0.5} /> },
        { label: ru ? 'Масса справа' : 'Right mass', value: `${m2} ${ru ? 'кг' : 'kg'}`, color: '#1E88C8', input: <RangeSlider value={m2} onChange={setM2} min={5} max={60} step={5} /> },
        { label: ru ? 'Плечо справа' : 'Right arm', value: `${fmt(l2, 1, ru)} ${ru ? 'м' : 'm'}`, color: '#1E88C8', input: <RangeSlider value={l2} onChange={setL2} min={0.5} max={4} step={0.5} /> },
      ]}
      insight={{
        title: ru ? 'Попробуй уравновесить' : 'Try to balance it',
        text: ru
          ? '30 кг на плече 2 м уравновешивают 15 кг на плече 4 м: вдвое меньший груз на вдвое длинном плече. Так ломом поднимают тяжёлый камень — но длинный конец приходится опускать на большее расстояние.'
          : '30 kg at 2 m balances 15 kg at 4 m: half the load on twice the arm. That is how a crowbar lifts a heavy stone, but the long end has to move further.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={360} className="block w-full h-auto" aria-label={ru ? 'Рычаг на опоре с двумя грузами' : 'A lever on a fulcrum with two loads'} />
    </SimShell>
  );
};
