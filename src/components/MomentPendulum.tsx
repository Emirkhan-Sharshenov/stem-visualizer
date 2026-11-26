import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { clamp01, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentPendulumProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×380): a pendulum hung at the top left, energy bars on the right
const PX = 300;
const PY = 36;
const PPM = 150; // pixels per metre
const PLANETS = [
  { g: 9.8, ru: 'Земля', en: 'Earth' },
  { g: 1.62, ru: 'Луна', en: 'Moon' },
  { g: 24.8, ru: 'Юпитер', en: 'Jupiter' },
];
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentPendulum: React.FC<MomentPendulumProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(1.2); // m
  const [g, setG] = useState(9.8);
  const [air, setAir] = useState(false);
  const [shown, setShown] = useState({ measured: 0, angle: 0 });

  const live = useRef({ length, g, air, lang, dragging: false, dragAngle: 0 });
  live.current.length = length;
  live.current.g = g;
  live.current.air = air;
  live.current.lang = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { th: 0.5, om: 0, trail: [] as [number, number][], lastCross: -1, period: 0, time: 0, report: 0, prevTh: 0.5 };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 800, y: ((e.clientY - r.top) / r.height) * 380 };
    };
    const bob = () => {
      const Lp = live.current.length * PPM;
      return { x: PX + Lp * Math.sin(s.th), y: PY + Lp * Math.cos(s.th) };
    };
    const down = (e: PointerEvent) => {
      const p = local(e);
      const b = bob();
      if (Math.hypot(p.x - b.x, p.y - b.y) < 34) {
        live.current.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      }
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      if (live.current.dragging) live.current.dragAngle = Math.max(-1.5, Math.min(1.5, Math.atan2(p.x - PX, Math.max(1, p.y - PY))));
      else {
        const b = bob();
        canvas.style.cursor = Math.hypot(p.x - b.x, p.y - b.y) < 34 ? 'grab' : 'default';
      }
    };
    const up = () => {
      if (live.current.dragging) {
        live.current.dragging = false;
        s.om = 0;
        s.trail = [];
        s.lastCross = -1;
        canvas.style.cursor = 'grab';
      }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const stop = runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const Lv = live.current;
      const ru = Lv.lang === 'ru';
      const L = Lv.length;

      if (Lv.dragging) {
        s.th += (Lv.dragAngle - s.th) * Math.min(1, dt * 18);
        s.om = 0;
      } else if (!still) {
        // the full equation θ'' = −(g/L)·sin θ, in small steps so it stays accurate
        const steps = 4;
        const k = Lv.air ? 0.35 : 0;
        for (let i = 0; i < steps; i++) {
          const h2 = dt / steps;
          const acc = -(Lv.g / L) * Math.sin(s.th) - k * s.om;
          s.om += acc * h2;
          s.th += s.om * h2;
        }
        s.time += dt;
        // a stopwatch: the time between two passes through the bottom in the same direction
        if (s.prevTh < 0 && s.th >= 0) {
          if (s.lastCross >= 0) s.period = s.time - s.lastCross;
          s.lastCross = s.time;
        }
      }
      s.prevTh = s.th;

      const Lp = L * PPM;
      const bx = PX + Lp * Math.sin(s.th);
      const by = PY + Lp * Math.cos(s.th);
      if (!still && !Lv.dragging) {
        s.trail.push([bx, by]);
        if (s.trail.length > 40) s.trail.shift();
      }
      s.report += dt;
      if (s.report > 0.15) {
        s.report = 0;
        setShown({ measured: s.period, angle: (s.th * 180) / Math.PI });
      }

      drawStage(ctx, w, h, { x: PX, y: PY + Lp * 0.7 });

      // energy: zero of potential at the lowest point
      const v = s.om * L;
      const Ek = 0.5 * v * v;
      const Ep = Lv.g * L * (1 - Math.cos(s.th));
      const Emax = Math.max(1e-6, Ek + Ep, Lv.g * L * (1 - Math.cos(0.9)));

      // the swing arc and the trail
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(PX, PY, Lp, Math.PI / 2 - 1.5, Math.PI / 2 + 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PX, PY);
      ctx.lineTo(PX, PY + Lp + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      s.trail.forEach(([x, y], i) => {
        const a = (i / s.trail.length) * 0.5;
        ctx.fillStyle = `rgba(139,124,255,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 3 + (i / s.trail.length) * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // the mount
      const mg = ctx.createLinearGradient(PX - 60, 0, PX + 60, 0);
      mg.addColorStop(0, '#4A5068');
      mg.addColorStop(0.5, '#9AA2B8');
      mg.addColorStop(1, '#4A5068');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.roundRect(PX - 60, PY - 18, 120, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#C9CEDA';
      ctx.beginPath();
      ctx.arc(PX, PY, 5, 0, Math.PI * 2);
      ctx.fill();

      // the string and the bob, with a soft shadow on the "floor"
      ctx.strokeStyle = 'rgba(230,236,250,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(PX, PY);
      ctx.lineTo(bx, by);
      ctx.stroke();
      const sh = ctx.createRadialGradient(bx, h - 16, 2, bx, h - 16, 40);
      sh.addColorStop(0, 'rgba(0,0,0,0.4)');
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(bx - 40, h - 30, 80, 28);
      const speed = Math.abs(v);
      glow(ctx, bx, by, 50, '139,124,255', 0.25 + 0.3 * clamp01(speed / 3));
      const bg = ctx.createRadialGradient(bx - 7, by - 7, 2, bx, by, 22);
      bg.addColorStop(0, '#F2F0FF');
      bg.addColorStop(0.35, '#A99CFF');
      bg.addColorStop(1, '#4A3BEB');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by, 20, 0, Math.PI * 2);
      ctx.fill();

      // velocity: tangent to the arc, as long as the speed
      if (speed > 0.05 && !Lv.dragging) {
        const tx = Math.cos(s.th) * Math.sign(s.om);
        const ty = -Math.sin(s.th) * Math.sign(s.om);
        const len = 18 + speed * 34;
        const ex = bx + tx * (24 + len);
        const ey = by + ty * (24 + len);
        ctx.strokeStyle = '#3DD6FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx + tx * 24, by + ty * 24);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = '#3DD6FF';
        ctx.beginPath();
        ctx.moveTo(ex + tx * 8, ey + ty * 8);
        ctx.lineTo(ex - ty * 6, ey + tx * 6);
        ctx.lineTo(ex + ty * 6, ey - tx * 6);
        ctx.closePath();
        ctx.fill();
      }

      // energy bars: potential and kinetic trade places, the total stays put (without air)
      {
        const x0 = 600;
        const yb = 320;
        const hMax = 230;
        const bars: [string, number, string][] = [
          [ru ? 'E пот' : 'E pot', Ep / Emax, '#FFB45E'],
          [ru ? 'E кин' : 'E kin', Ek / Emax, '#3DD6FF'],
          [ru ? 'E полн' : 'E total', (Ep + Ek) / Emax, '#8B7CFF'],
        ];
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath();
        ctx.roundRect(x0 - 24, 40, 214, 316, 16);
        ctx.fill();
        bars.forEach(([name, f, col], i) => {
          const x = x0 + i * 60;
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.beginPath();
          ctx.roundRect(x, yb - hMax, 40, hMax, 8);
          ctx.fill();
          const hh = Math.max(2, clamp01(f) * hMax);
          const gg = ctx.createLinearGradient(0, yb - hh, 0, yb);
          gg.addColorStop(0, col);
          gg.addColorStop(1, `${col}66`);
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.roundRect(x, yb - hh, 40, hh, 8);
          ctx.fill();
          ctx.fillStyle = STAGE.soft;
          ctx.font = `600 11px ${STAGE.font}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(name, x + 20, yb + 18);
        });
      }

      if (Lv.dragging) pill(ctx, bx, by - 42, `${Math.round((s.th * 180) / Math.PI)}°`, STAGE.ink);
      else if (Math.abs(s.th) < 0.02 && Math.abs(s.om) < 0.05) pill(ctx, PX, PY + 34, ru ? 'оттяни грузик и отпусти' : 'pull the bob aside and let go', STAGE.soft);
    });

    return () => {
      stop();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  const ru = lang === 'ru';
  const Tformula = 2 * Math.PI * Math.sqrt(length / g);
  return (
    <SimShell
      badge={ru ? '9 класс · Физика' : 'Grade 9 · Physics'}
      formula="T = 2π√(L / g)"
      title={ru ? 'Математический маятник: период и превращения энергии' : 'A simple pendulum: the period and energy changing form'}
      actions={
        <>
          {PLANETS.map((p) => (
            <Button key={p.g} variant={g === p.g ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setG(p.g)}>
              {ru ? p.ru : p.en}
            </Button>
          ))}
          <Button variant={air ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setAir(!air)}>
            {ru ? 'Воздух' : 'Air'}
          </Button>
        </>
      }
      readouts={[
        { label: ru ? 'Период по формуле' : 'Period, formula', value: `${fmt(Tformula, 2, ru)} ${ru ? 'с' : 's'}`, color: '#4A3BEB' },
        { label: ru ? 'Измерено' : 'Measured', value: shown.measured ? `${fmt(shown.measured, 2, ru)} ${ru ? 'с' : 's'}` : '—', color: '#1A8F50' },
        { label: ru ? 'Угол' : 'Angle', value: `${Math.round(shown.angle)}°` },
        { label: 'g', value: `${fmt(g, 2, ru)} ${ru ? 'м/с²' : 'm/s²'}` },
      ]}
      controls={[
        {
          label: ru ? 'Длина нити L' : 'String length L',
          value: `${fmt(length, 2, ru)} ${ru ? 'м' : 'm'}`,
          color: '#4A3BEB',
          input: <RangeSlider value={length} onChange={(v) => setLength(v)} min={0.3} max={2} step={0.05} />,
          hint: ru
            ? 'Длиннее нить — медленнее качание: в 4 раза длиннее, вдвое дольше период. От массы грузика период не зависит.'
            : 'A longer string swings slower: four times longer, twice the period. The mass of the bob does not matter.',
        },
      ]}
      insight={{
        title: ru ? 'Попробуй' : 'Try this',
        text: ru
          ? 'Оттяни грузик на 10°, потом на 60°. При малых углах период совпадает с формулой, при больших — становится чуть длиннее: формула верна только для малых колебаний.'
          : 'Pull the bob to 10°, then to 60°. At small angles the period matches the formula; at large ones it gets a little longer: the formula holds only for small swings.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto touch-pan-y cursor-grab" aria-label={ru ? 'Маятник и столбики энергии' : 'A pendulum and energy bars'} />
    </SimShell>
  );
};
