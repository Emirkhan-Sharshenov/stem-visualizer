import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentCollisionProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×380): a track with two carts, momentum and energy bars underneath
const PPM = 64; // pixels per metre
const X0 = 40;
const TRACK = 11.25; // m
const TY = 170; // the rail
const K = 6000; // stiffness of the bumpers, N/m
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));
const widthOf = (m: number) => 0.55 + 0.17 * m; // a heavier cart is bigger, m

export const MomentCollision: React.FC<MomentCollisionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [m1, setM1] = useState(2);
  const [v1, setV1] = useState(3);
  const [m2, setM2] = useState(1);
  const [v2, setV2] = useState(-2);
  const [e, setE] = useState(1);
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState({ p: 0, ek: 0, ek0: 0, hit: false });

  const live = useRef({ m1, v1, m2, v2, e, lang });
  live.current = { m1, v1, m2, v2, e, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const start = () => ({ x1: 2.2, x2: 8.6, u1: live.current.v1, u2: live.current.v2, stuck: false, hit: false, after: 0, force: 0, d: 0, wait: 0 });
    let s = start();
    let report = 0;

    return runStage(canvas, (dtRaw, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const w1 = widthOf(L.m1);
      const w2 = widthOf(L.m2);

      // slow motion around the impact, so the squeeze can be seen
      const gap = s.x2 - w2 / 2 - (s.x1 + w1 / 2);
      const slow = s.stuck ? 1 : gap < 0.6 && gap > -0.3 && (s.u1 - s.u2 > 0 || s.force > 0) ? 0.12 : 1;
      const dt = still ? 0 : dtRaw * slow;
      const steps = 30;
      s.force = 0;
      for (let i = 0; i < steps; i++) {
        const h2 = dt / steps;
        const g2 = s.x2 - w2 / 2 - (s.x1 + w1 / 2);
        if (s.stuck) {
          // perfectly inelastic: they move off together
        } else if (g2 < 0) {
          if (!s.hit) s.hit = true;
          if (L.e < 0.05) {
            const vc = (L.m1 * s.u1 + L.m2 * s.u2) / (L.m1 + L.m2);
            s.u1 = vc;
            s.u2 = vc;
            s.stuck = true;
          } else {
            // a spring with a damper: the damping is chosen so the bounce returns e of the closing speed
            const mu = (L.m1 * L.m2) / (L.m1 + L.m2);
            const ln = Math.log(L.e);
            const zeta = -ln / Math.sqrt(Math.PI * Math.PI + ln * ln);
            const c = 2 * zeta * Math.sqrt(K * mu);
            const F = Math.max(0, K * -g2 + c * (s.u1 - s.u2));
            s.u1 -= (F / L.m1) * h2;
            s.u2 += (F / L.m2) * h2;
            s.force = Math.max(s.force, F);
          }
        }
        s.x1 += s.u1 * h2;
        s.x2 += s.u2 * h2;
      }
      s.d = Math.max(0, -(s.x2 - w2 / 2 - (s.x1 + w1 / 2)));
      if (s.hit) s.after += dtRaw;
      // replay once both are gone, or a little while after the hit
      const off = (x: number) => x < -1 || x > TRACK + 1;
      if (!still && ((off(s.x1) && off(s.x2)) || s.after > 3.2 || (!s.hit && Math.abs(L.v1 - L.v2) < 1e-6 && (s.wait += dtRaw) > 4))) s = start();

      const p = L.m1 * s.u1 + L.m2 * s.u2;
      const ek = 0.5 * L.m1 * s.u1 * s.u1 + 0.5 * L.m2 * s.u2 * s.u2;
      const ek0 = 0.5 * L.m1 * L.v1 * L.v1 + 0.5 * L.m2 * L.v2 * L.v2;
      report += dtRaw;
      if (report > 0.12) {
        report = 0;
        setShown({ p, ek, ek0, hit: s.hit });
      }

      drawStage(ctx, w, h, { x: 400, y: TY });

      // the rail
      const rail = ctx.createLinearGradient(0, TY + 32, 0, TY + 42);
      rail.addColorStop(0, '#9AA2B8');
      rail.addColorStop(1, '#3A4058');
      ctx.fillStyle = rail;
      ctx.fillRect(X0 - 10, TY + 32, TRACK * PPM + 20, 8);
      for (let m = 0; m <= TRACK; m += 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(X0 + m * PPM - 0.5, TY + 44, 1, 6);
      }

      // carts: bodies squash at the bumper, wheels roll
      const cart = (x: number, wm: number, m: number, u: number, col: string, side: 1 | -1, label: string) => {
        const wpx = wm * PPM - s.d * PPM * 0.5;
        const hpx = 34 + m * 5;
        const cx = X0 + x * PPM - (side * s.d * PPM) / 4;
        const left = cx - wpx / 2;
        const top = TY + 22 - hpx;
        const sh = ctx.createRadialGradient(cx, TY + 40, 4, cx, TY + 40, wpx);
        sh.addColorStop(0, 'rgba(0,0,0,0.45)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh;
        ctx.fillRect(cx - wpx, TY + 30, wpx * 2, 16);
        const g = ctx.createLinearGradient(0, top, 0, top + hpx);
        g.addColorStop(0, col);
        g.addColorStop(1, `${col}99`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(left, top, wpx, hpx, 9);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(left + 6, top + 5, wpx - 12, 4);
        ctx.fillStyle = '#0B0E18';
        ctx.font = `800 13px ${STAGE.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, top + hpx / 2 + 2);
        for (const wx of [left + 14, left + wpx - 14]) {
          const ang = (x * PPM) / 9;
          ctx.fillStyle = '#1B1F2C';
          ctx.beginPath();
          ctx.arc(wx, TY + 26, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9AA2B8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(wx, TY + 26);
          ctx.lineTo(wx + Math.cos(ang) * 7, TY + 26 + Math.sin(ang) * 7);
          ctx.stroke();
        }
        // velocity arrow
        if (Math.abs(u) > 0.02) {
          const len = u * 26;
          const ay = top - 16;
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, ay);
          ctx.lineTo(cx + len, ay);
          ctx.stroke();
          const d = Math.sign(len);
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(cx + len + d * 8, ay);
          ctx.lineTo(cx + len, ay - 6);
          ctx.lineTo(cx + len, ay + 6);
          ctx.closePath();
          ctx.fill();
          pill(ctx, cx, ay - 20, `${fmt(u, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, col);
        }
        return { cx, left, right: left + wpx, top, hpx };
      };
      const c1 = cart(s.x1, w1, L.m1, s.u1, '#9B8CFF', 1, `${fmt(L.m1, 1, ru)} ${ru ? 'кг' : 'kg'}`);
      const c2 = cart(s.x2, w2, L.m2, s.u2, '#5FDDFF', -1, `${fmt(L.m2, 1, ru)} ${ru ? 'кг' : 'kg'}`);

      // during contact: two equal and opposite forces
      if (s.force > 1) {
        const fy = Math.min(c1.top, c2.top) + 18;
        const mid = (c1.right + c2.left) / 2;
        const len = Math.min(90, 14 + s.force / 60);
        glow(ctx, mid, TY + 5, 50, '255,120,100', 0.5);
        for (const d of [-1, 1]) {
          ctx.strokeStyle = '#FF6B6B';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(mid, fy - 40);
          ctx.lineTo(mid + d * len, fy - 40);
          ctx.stroke();
          ctx.fillStyle = '#FF6B6B';
          ctx.beginPath();
          ctx.moveTo(mid + d * (len + 9), fy - 40);
          ctx.lineTo(mid + d * len, fy - 46);
          ctx.lineTo(mid + d * len, fy - 34);
          ctx.closePath();
          ctx.fill();
        }
        pill(ctx, mid, fy - 64, ru ? 'F₁₂ = −F₂₁' : 'F₁₂ = −F₂₁', '#FF8A8A');
      }
      if (slow < 1) pill(ctx, 400, 24, ru ? 'замедленная съёмка' : 'slow motion', STAGE.soft);
      if (s.stuck) pill(ctx, (c1.cx + c2.cx) / 2, TY + 74, ru ? 'слиплись и едут вместе' : 'stuck, moving together', '#FFC46B');

      // momentum and energy bars: momentum always conserved, energy only in an elastic hit
      const p0 = L.m1 * L.v1 + L.m2 * L.v2;
      const scale = Math.max(Math.abs(L.m1 * L.v1), Math.abs(L.m2 * L.v2), Math.abs(p0), 1);
      const bar = (y: number, label: string, val: number, max: number, col: string, ref?: number) => {
        const zx = 400;
        const half = 300;
        ctx.fillStyle = STAGE.soft;
        ctx.font = `600 11px ${STAGE.font}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, zx - half - 10, y);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(zx - half, y - 6, half * 2, 12);
        ctx.fillStyle = col;
        const wv = (val / max) * half;
        ctx.fillRect(Math.min(zx, zx + wv), y - 6, Math.abs(wv), 12);
        if (ref !== undefined) {
          ctx.fillStyle = '#FFD25E';
          ctx.fillRect(zx + (ref / max) * half - 1, y - 10, 2, 20);
        }
      };
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(399.5, 250, 1, 112);
      bar(262, 'p₁', L.m1 * s.u1, scale, '#9B8CFF');
      bar(284, 'p₂', L.m2 * s.u2, scale, '#5FDDFF');
      bar(306, ru ? 'Σp' : 'Σp', p, scale, '#E8ECFA', p0);
      const ekMax = Math.max(ek0, 1);
      bar(336, ru ? 'Eк' : 'KE', ek, ekMax, '#FFB45E', ek0);
      ctx.textAlign = 'left';
      ctx.fillStyle = STAGE.soft;
      ctx.fillText(ru ? 'жёлтая черта — значение до удара' : 'the yellow mark is the value before the hit', 100, 358);
    });
  }, [run]);

  const ru = lang === 'ru';
  const lost = shown.hit && shown.ek0 > 0 ? Math.max(0, 1 - shown.ek / shown.ek0) : 0;
  const restart = () => setRun((r) => r + 1);
  const slider = (v: number, set: (x: number) => void, min: number, max: number, step: number) => (
    <RangeSlider
      value={v}
      onChange={(x) => {
        set(x);
        restart();
      }}
      min={min}
      max={max}
      step={step}
    />
  );
  return (
    <SimShell
      badge={ru ? '9–10 класс · Физика' : 'Grades 9–10 · Physics'}
      formula="m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′"
      title={ru ? 'Соударение тележек: импульс сохраняется всегда' : 'Colliding carts: momentum is always conserved'}
      actions={
        <Button variant="outline" size="sm" className="font-semibold" onPress={restart}>
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          {ru ? 'Заново' : 'Again'}
        </Button>
      }
      readouts={[
        { label: ru ? 'Импульс системы' : 'Total momentum', value: `${fmt(shown.p, 2, ru)} ${ru ? 'кг·м/с' : 'kg·m/s'}`, color: '#4A3BEB' },
        { label: ru ? 'Кинетическая энергия' : 'Kinetic energy', value: `${fmt(shown.ek, 1, ru)} ${ru ? 'Дж' : 'J'}`, color: '#B7791F' },
        { label: ru ? 'Ушло в тепло' : 'Lost to heat', value: `${Math.round(lost * 100)}%`, color: lost > 0.02 ? '#D9534F' : '#1A8F50' },
        { label: ru ? 'Удар' : 'Collision', value: e >= 0.97 ? (ru ? 'упругий' : 'elastic') : e < 0.05 ? (ru ? 'неупругий' : 'inelastic') : ru ? 'частично' : 'partial' },
      ]}
      controls={[
        { label: ru ? 'Масса левой m₁' : 'Left mass m₁', value: `${fmt(m1, 1, ru)} ${ru ? 'кг' : 'kg'}`, color: '#6E54E0', input: slider(m1, setM1, 0.5, 5, 0.5) },
        { label: ru ? 'Скорость левой v₁' : 'Left speed v₁', value: `${fmt(v1, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#6E54E0', input: slider(v1, setV1, -2, 5, 0.5) },
        { label: ru ? 'Масса правой m₂' : 'Right mass m₂', value: `${fmt(m2, 1, ru)} ${ru ? 'кг' : 'kg'}`, color: '#1E88C8', input: slider(m2, setM2, 0.5, 5, 0.5) },
        { label: ru ? 'Скорость правой v₂' : 'Right speed v₂', value: `${fmt(v2, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#1E88C8', input: slider(v2, setV2, -5, 2, 0.5) },
        {
          label: ru ? 'Упругость удара' : 'Bounciness',
          value: e < 0.05 ? (ru ? 'слипаются' : 'stick') : `${Math.round(e * 100)}%`,
          input: slider(e, setE, 0, 1, 0.05),
          hint: ru ? '100% — как бильярдные шары, 0 — как пластилин. Импульс сохраняется в обоих случаях, а энергия — только при упругом.' : '100% is like billiard balls, 0 like clay. Momentum is kept either way; energy only when the hit is elastic.',
        },
      ]}
      insight={{
        title: ru ? 'Третий закон Ньютона' : "Newton's third law",
        text: ru
          ? 'В момент удара тележки давят друг на друга с равными силами в противоположные стороны — даже если одна в пять раз тяжелее. Поэтому сколько импульса потеряла одна, столько получила другая.'
          : 'At impact the carts push on each other with equal and opposite forces, even if one is five times heavier. So whatever momentum one loses, the other gains.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Две тележки на рельсах сталкиваются; внизу столбики импульсов и энергии' : 'Two carts collide on a track; momentum and energy bars below'} />
    </SimShell>
  );
};
