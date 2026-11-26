import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { approach, clamp01, drawStage, glow, pill, runStage, seeded, STAGE } from '../lib/stage';

interface MomentPascalHydraulicsProps {
  lang: 'ru' | 'en';
}

// a hydraulic press (canvas 800×380): a narrow cylinder on the left, a wide one on the right, joined below
const SX = 150; // centre of the small cylinder
const LX = 560; // centre of the large one
const BASE = 330; // the bottom of the cylinders
const TOP0 = 230; // the resting level of both pistons
const CAR_KG = 1200;
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentPascalHydraulics: React.FC<MomentPascalHydraulicsProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [force, setForce] = useState(150); // N on the small piston
  const [ratio, setRatio] = useState(100); // S2 / S1
  const live = useRef({ force, ratio, lang });
  live.current = { force, ratio, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { lift: 0, pulse: 0 };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const S1 = 0.001; // m²
      const S2 = S1 * L.ratio;
      const p = L.force / S1; // Pa, the same everywhere in the liquid
      const F2 = p * S2;
      const weight = CAR_KG * 9.8;
      // the car rises only while the big piston's force beats its weight; volume moves across: S1·Δh1 = S2·Δh2
      const target = F2 > weight ? 50 : 0;
      s.lift = approach(s.lift, target, dt, still ? 0.001 : 1.2);
      const smallDrop = s.lift * L.ratio * 0.012; // drawn shrunk: the real small stroke is ratio times longer
      if (!still) s.pulse += dt;

      drawStage(ctx, w, h, { x: 360, y: 240 });
      const sw = 34;
      const lw = 34 + Math.sqrt(L.ratio) * 14;
      const sTop = TOP0 + Math.min(80, smallDrop);
      const lTop = TOP0 - s.lift;
      const pr = clamp01(p / 400000);

      // the liquid: one body, coloured by its pressure
      const liquid = `rgba(${Math.round(60 + 140 * pr)},${Math.round(150 - 40 * pr)},${Math.round(255 - 60 * pr)},0.55)`;
      ctx.fillStyle = liquid;
      ctx.fillRect(SX - sw / 2, sTop, sw, BASE - sTop);
      ctx.fillRect(LX - lw / 2, lTop, lw, BASE - lTop);
      ctx.fillRect(SX - sw / 2, BASE - 30, LX - SX, 30);
      // particles drifting through the pipe
      for (let i = 0; i < 26; i++) {
        const u = (seeded(i) + t * 0.05 * (s.lift > 1 && s.lift < 49 ? 4 : 0.6)) % 1;
        const x = SX + u * (LX - SX);
        const y = BASE - 8 - seeded(i, 2) * 18;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // cylinder walls
      ctx.strokeStyle = 'rgba(210,220,255,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(SX - sw / 2, 60);
      ctx.lineTo(SX - sw / 2, BASE);
      ctx.lineTo(LX + lw / 2, BASE);
      ctx.lineTo(LX + lw / 2, 60);
      ctx.moveTo(SX + sw / 2, 60);
      ctx.lineTo(SX + sw / 2, BASE - 30);
      ctx.lineTo(LX - lw / 2, BASE - 30);
      ctx.lineTo(LX - lw / 2, 60);
      ctx.stroke();

      // Pascal: the same pressure pushes on every wall, the arrows all match
      const al = 8 + pr * 22;
      const beat = 0.6 + 0.4 * Math.sin(s.pulse * 5);
      ctx.strokeStyle = `rgba(255,214,120,${0.4 + 0.5 * pr * beat})`;
      ctx.lineWidth = 2;
      const arrow = (x: number, y: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * al, y + dy * al);
        ctx.stroke();
      };
      for (const y of [BASE - 60, BASE - 100]) {
        if (y > sTop + 10) {
          arrow(SX - sw / 2 + 4, y, -1, 0);
          arrow(SX + sw / 2 - 4, y, 1, 0);
        }
        if (y > lTop + 10) {
          arrow(LX - lw / 2 + 4, y, -1, 0);
          arrow(LX + lw / 2 - 4, y, 1, 0);
        }
      }
      for (let x = SX + 40; x < LX - lw / 2; x += 60) arrow(x, BASE - 4, 0, 1);

      // pistons
      const piston = (cx: number, top: number, wid: number) => {
        const g = ctx.createLinearGradient(cx - wid / 2, 0, cx + wid / 2, 0);
        g.addColorStop(0, '#6E7586');
        g.addColorStop(0.5, '#DDE1EA');
        g.addColorStop(1, '#5E6576');
        ctx.fillStyle = g;
        ctx.fillRect(cx - wid / 2 + 2, top - 14, wid - 4, 14);
        ctx.fillRect(cx - 4, top - 60, 8, 46);
      };
      piston(SX, sTop, sw);
      piston(LX, lTop, lw);

      // the hand's force on the small piston
      const fl = 20 + Math.min(70, L.force / 6);
      ctx.strokeStyle = '#8B7CFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(SX, sTop - 60 - fl);
      ctx.lineTo(SX, sTop - 66);
      ctx.stroke();
      ctx.fillStyle = '#8B7CFF';
      ctx.beginPath();
      ctx.moveTo(SX, sTop - 60);
      ctx.lineTo(SX - 7, sTop - 70);
      ctx.lineTo(SX + 7, sTop - 70);
      ctx.closePath();
      ctx.fill();
      pill(ctx, SX + 30, sTop - 80, `F₁ = ${Math.round(L.force)} ${ru ? 'Н' : 'N'}`, '#B3A9FF', 'left');

      // the car on the big piston
      {
        const cy = lTop - 60;
        const cw = 150;
        glow(ctx, LX, cy, 90, '95,221,255', F2 > weight ? 0.25 : 0);
        ctx.fillStyle = '#5FDDFF';
        ctx.beginPath();
        ctx.roundRect(LX - cw / 2, cy - 30, cw, 30, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(LX - cw / 4, cy - 52, cw / 2, 26, 8);
        ctx.fill();
        ctx.fillStyle = 'rgba(11,14,24,0.6)';
        ctx.fillRect(LX - cw / 4 + 8, cy - 46, cw / 2 - 16, 14);
        ctx.fillStyle = '#1B1F2C';
        for (const wx of [LX - cw / 3, LX + cw / 3]) {
          ctx.beginPath();
          ctx.arc(wx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        pill(ctx, LX, cy - 74, `F₂ = ${Math.round(F2)} ${ru ? 'Н' : 'N'} · ${ru ? 'машина' : 'car'} ${Math.round(weight)} ${ru ? 'Н' : 'N'}`, F2 > weight ? '#6FE3A0' : '#FF8A9E');
      }

      pill(ctx, 360, BASE + 30, `p = F₁/S₁ = ${fmt(p / 1000, 0, ru)} ${ru ? 'кПа — одинаково везде' : 'kPa — the same everywhere'}`, '#FFD678');
    });
  }, []);

  const ru = lang === 'ru';
  const F2 = (force / 0.001) * 0.001 * ratio;
  const weight = CAR_KG * 9.8;
  const minF = Math.ceil(weight / ratio);
  return (
    <SimShell
      badge={ru ? '7 класс · Физика' : 'Grade 7 · Physics'}
      formula="F₂ / F₁ = S₂ / S₁"
      title={ru ? 'Гидравлический пресс: человек поднимает машину' : 'The hydraulic press: one person lifts a car'}
      readouts={[
        { label: ru ? 'Сила рукой' : 'Hand force', value: `${force} ${ru ? 'Н' : 'N'}`, color: '#6E54E0' },
        { label: ru ? 'Сила на большом' : 'Force on the big piston', value: `${Math.round(F2)} ${ru ? 'Н' : 'N'}`, color: '#1E88C8' },
        { label: ru ? 'Выигрыш в силе' : 'Force gain', value: `×${ratio}` },
        { label: ru ? 'Нужно минимум' : 'Needed at least', value: `${minF} ${ru ? 'Н' : 'N'}`, color: F2 >= weight ? '#1A8F50' : '#D9534F' },
      ]}
      controls={[
        { label: ru ? 'Сила на малый поршень F₁' : 'Force on the small piston F₁', value: `${force} ${ru ? 'Н' : 'N'}`, color: '#6E54E0', input: <RangeSlider value={force} onChange={setForce} min={10} max={400} step={10} /> },
        {
          label: ru ? 'Во сколько раз больше площадь S₂ / S₁' : 'Area ratio S₂ / S₁',
          value: `×${ratio}`,
          color: '#1E88C8',
          input: <RangeSlider value={ratio} onChange={setRatio} min={10} max={200} step={10} />,
          hint: ru ? 'Давление p = F/S передаётся во все стороны одинаково, поэтому на большой поршень действует во столько раз большая сила, во сколько больше его площадь.' : 'Pressure p = F/S passes equally in every direction, so the big piston feels as many times more force as its area is larger.',
        },
      ]}
      insight={{
        title: ru ? 'Где подвох' : 'The catch',
        text: ru
          ? 'Объём жидкости не меняется: если большой поршень поднялся на 1 см, малый опустился на целых S₂/S₁ сантиметров. Выигрываем в силе — проигрываем в расстоянии, работа та же.'
          : 'The liquid’s volume stays the same: if the big piston rises 1 cm, the small one goes down S₂/S₁ cm. We gain in force and lose in distance; the work is the same.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Гидравлический пресс поднимает машину' : 'A hydraulic press lifting a car'} />
    </SimShell>
  );
};
