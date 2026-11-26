import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { approach, clamp01, drawBulb, drawStage, glow, mixRgb, pill, runStage, samplePolyline, STAGE } from '../lib/stage';

interface MomentInductionProps {
  lang: 'ru' | 'en';
}

// the scene in drawing units (the canvas is 800×340)
const CX = 340; // centre of the coil
const CY = 165; // the axis the magnet slides along
const RY = 56; // half-height of a turn
const MAG_W = 160;
const MAG_H = 42;
const X_MIN = 95;
const X_MAX = 600;
const AMP = 230;
const OMEGA = 1.3;
const GX = 700; // galvanometer
const BULB_X = 560;
const BOTTOM = 300;
const TOP = 40;

const loopXs = (n: number) => Array.from({ length: n }, (_, i) => CX + (i - (n - 1) / 2) * 22);
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentInduction: React.FC<MomentInductionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [auto, setAuto] = useState(true);
  const [turns, setTurns] = useState(4);
  const [shown, setShown] = useState({ x: CX, emf: 0 });

  const live = useRef({ auto, turns, lang, target: CX, dragging: false, grab: 0 });
  live.current.auto = auto;
  live.current.turns = turns;
  live.current.lang = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { x: CX, emf: 0, needle: 0, needleV: 0, bright: 0, q: 0, tAuto: 0, report: 0, wasAuto: true };

    // dragging the magnet straight on the stage
    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 800, y: ((e.clientY - r.top) / r.height) * 340 };
    };
    const down = (e: PointerEvent) => {
      const p = toLocal(e);
      if (Math.abs(p.x - s.x) < MAG_W / 2 + 12 && Math.abs(p.y - CY) < MAG_H / 2 + 16) {
        live.current.dragging = true;
        live.current.grab = p.x - s.x;
        live.current.target = s.x;
        setAuto(false);
        live.current.auto = false;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      }
    };
    const move = (e: PointerEvent) => {
      const p = toLocal(e);
      if (live.current.dragging) live.current.target = Math.max(X_MIN, Math.min(X_MAX, p.x - live.current.grab));
      else canvas.style.cursor = Math.abs(p.x - s.x) < MAG_W / 2 && Math.abs(p.y - CY) < MAG_H / 2 + 10 ? 'grab' : 'default';
    };
    const up = () => {
      live.current.dragging = false;
      canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const stop = runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const N = L.turns;

      // where the magnet should be: a smooth swing in auto mode, the finger or the slider otherwise
      if (L.auto && !s.wasAuto) s.tAuto = Math.asin(Math.max(-1, Math.min(1, (s.x - CX) / AMP))) / OMEGA;
      s.wasAuto = L.auto;
      if (L.auto && !still) s.tAuto += dt;
      const target = L.auto ? CX + AMP * Math.sin(OMEGA * s.tAuto) : L.target;
      const prevX = s.x;
      s.x = L.auto ? target : approach(s.x, target, dt, 0.06);
      const vx = still ? 0 : (s.x - prevX) / Math.max(dt, 1e-3);

      // Faraday: e = −N·dΦ/dt with the flux through the coil falling off away from its centre
      const d = (s.x - CX) / 75;
      const phi = Math.exp(-d * d);
      const dPhiDx = ((-2 * d) / 75) * phi;
      const emfNow = Math.max(-12, Math.min(12, -N * dPhiDx * vx * 0.33));
      s.emf = approach(s.emf, emfNow, dt, 0.05);
      // the needle has a little mass and swings in place
      const aim = Math.max(-1, Math.min(1, s.emf / 10)) * 1.05;
      if (still) s.needle = aim;
      else {
        s.needleV += (90 * (aim - s.needle) - 9 * s.needleV) * dt;
        s.needle += s.needleV * dt;
      }
      const bTarget = clamp01(Math.abs(s.emf) / 6);
      s.bright = approach(s.bright, bTarget, dt, bTarget > s.bright ? 0.08 : 0.22);
      if (!still) s.q += s.emf * 16 * dt;

      s.report += dt;
      if (s.report > 0.1) {
        s.report = 0;
        setShown({ x: s.x, emf: s.emf });
      }

      drawStage(ctx, w, h, { x: CX, y: CY });

      // field lines flowing out of N and round into S
      const mx = s.x;
      for (let i = 1; i <= 4; i++) {
        const rx = MAG_W / 2 + i * 24;
        const ry = 14 + i * 22;
        ctx.strokeStyle = `rgba(120,200,255,${0.32 - i * 0.05})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 9]);
        ctx.lineDashOffset = still ? 0 : -t * 28;
        ctx.beginPath();
        ctx.ellipse(mx, CY, rx, ry, 0, Math.PI, Math.PI * 2, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(mx, CY, rx, ry, 0, Math.PI, 0, true);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const xs = loopXs(N);
      const glowCopper = clamp01(Math.abs(s.emf) / 5);
      const copper = mixRgb([196, 122, 64], [255, 196, 120], glowCopper);
      // back halves of the turns, behind the magnet
      for (const lx of xs) {
        ctx.strokeStyle = 'rgba(120,70,40,0.9)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(lx, CY, 14, RY, 0, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.stroke();
      }

      // the circuit: coil → galvanometer → bulb → back to the coil
      const x0 = xs[0];
      const x1 = xs[xs.length - 1];
      const wire: [number, number][] = [[x0, CY - RY], [x0, TOP], [GX, TOP], [GX, BOTTOM], [x1, BOTTOM], [x1, CY + RY]];
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#20273A';
      ctx.lineWidth = 9;
      ctx.beginPath();
      wire.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.strokeStyle = `rgba(${mixRgb([58, 69, 96], [255, 196, 120], glowCopper)},0.85)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // charges drifting along the wire, both ways as the sign of e flips
      const pts = samplePolyline(wire);
      const M = 34;
      for (let k = 0; k < M; k++) {
        const idx = Math.floor((((k / M) * pts.length + s.q) % pts.length + pts.length) % pts.length);
        const [ex, ey] = pts[idx];
        if (Math.abs(ex - GX) < 4 && Math.abs(ey - (CY + 5)) < 46) continue;
        if (Math.abs(ey - BOTTOM) < 4 && Math.abs(ex - BULB_X) < 16) continue;
        const a = 0.25 + 0.75 * glowCopper;
        ctx.fillStyle = `rgba(255,214,150,${a})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // the magnet, with a soft shadow under it
      {
        const left = mx - MAG_W / 2;
        const top = CY - MAG_H / 2;
        const sh = ctx.createRadialGradient(mx, CY + MAG_H / 2 + 14, 4, mx, CY + MAG_H / 2 + 14, MAG_W * 0.6);
        sh.addColorStop(0, 'rgba(0,0,0,0.45)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh;
        ctx.fillRect(left - 40, CY + MAG_H / 2, MAG_W + 80, 30);
        const red = ctx.createLinearGradient(0, top, 0, top + MAG_H);
        red.addColorStop(0, '#FF7A7A');
        red.addColorStop(0.5, '#E5484D');
        red.addColorStop(1, '#A92A33');
        const blue = ctx.createLinearGradient(0, top, 0, top + MAG_H);
        blue.addColorStop(0, '#7FB2FF');
        blue.addColorStop(0.5, '#3A7BD5');
        blue.addColorStop(1, '#244F99');
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(left, top, MAG_W, MAG_H, 9);
        ctx.clip();
        ctx.fillStyle = red;
        ctx.fillRect(left, top, MAG_W / 2, MAG_H);
        ctx.fillStyle = blue;
        ctx.fillRect(mx, top, MAG_W / 2, MAG_H);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(left, top + 4, MAG_W, 5);
        ctx.restore();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `800 17px ${STAGE.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', mx - MAG_W / 4, CY + 1);
        ctx.fillText('S', mx + MAG_W / 4, CY + 1);
      }

      // front halves of the turns, over the magnet
      for (const lx of xs) {
        ctx.strokeStyle = `rgb(${copper})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(lx, CY, 14, RY, 0, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,220,0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(lx + 2, CY, 12, RY - 3, 0, -Math.PI / 3, Math.PI / 6);
        ctx.stroke();
        if (glowCopper > 0.05) glow(ctx, lx, CY, 40, '255,170,90', 0.12 * glowCopper);
      }

      // galvanometer: a dial on the right wire with a needle that has mass
      {
        const gy = CY + 5;
        const g = ctx.createRadialGradient(GX - 10, gy - 12, 4, GX, gy, 46);
        g.addColorStop(0, '#2A3352');
        g.addColorStop(1, '#141A2C');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(GX, gy, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let k = -5; k <= 5; k++) {
          const a = -Math.PI / 2 + (k / 5) * 1.05;
          const r0 = k % 5 === 0 ? 26 : 30;
          ctx.strokeStyle = k === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)';
          ctx.lineWidth = k % 5 === 0 ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(GX + Math.cos(a) * r0, gy + Math.sin(a) * r0);
          ctx.lineTo(GX + Math.cos(a) * 36, gy + Math.sin(a) * 36);
          ctx.stroke();
        }
        const na = -Math.PI / 2 + s.needle;
        ctx.strokeStyle = '#FF5C7A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(GX, gy);
        ctx.lineTo(GX + Math.cos(na) * 34, gy + Math.sin(na) * 34);
        ctx.stroke();
        ctx.fillStyle = '#E8ECFA';
        ctx.beginPath();
        ctx.arc(GX, gy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `700 12px ${STAGE.font}`;
        ctx.fillText('G', GX, gy + 20);
      }

      drawBulb(ctx, BULB_X, BOTTOM, s.bright);

      pill(ctx, GX, CY + 76, `ℰ = ${fmt(s.emf, 2, ru)} ${ru ? 'В' : 'V'}`, Math.abs(s.emf) > 0.3 ? '#FFC46B' : STAGE.soft);
      pill(ctx, CX, CY + RY + 28, ru ? `N = ${N} ${N === 1 ? 'виток' : N < 5 ? 'витка' : 'витков'}` : `N = ${N} turn${N === 1 ? '' : 's'}`, STAGE.ink);
      if (!L.auto && Math.abs(vx) < 4 && phi > 0.45) pill(ctx, CX, 82, ru ? 'магнит стоит — тока нет' : 'magnet at rest — no current', '#FF8A9E');
      else if (!L.auto && !L.dragging && Math.abs(vx) < 4) pill(ctx, CX, 82, ru ? 'потяни магнит мышью или пальцем' : 'drag the magnet', STAGE.soft);
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
  return (
    <SimShell
      badge={ru ? '9–11 класс · Физика' : 'Grades 9–11 · Physics'}
      formula="ℰ = −N · ΔΦ / Δt"
      title={ru ? 'Электромагнитная индукция: ток рождается только при движении' : 'Electromagnetic induction: current appears only while things move'}
      actions={
        <Button variant="outline" size="sm" className="font-semibold" onPress={() => setAuto(!auto)}>
          {auto ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          {auto ? (ru ? 'Остановить' : 'Stop') : ru ? 'Качать магнит' : 'Swing the magnet'}
        </Button>
      }
      readouts={[
        { label: ru ? 'ЭДС индукции' : 'Induced EMF', value: `${fmt(shown.emf, 2, ru)} ${ru ? 'В' : 'V'}`, color: '#D9822B' },
        { label: ru ? 'Витков' : 'Turns', value: String(turns), color: '#B7791F' },
        { label: ru ? 'Лампа' : 'Bulb', value: Math.abs(shown.emf) > 1.5 ? (ru ? 'горит' : 'on') : ru ? 'не горит' : 'off', color: Math.abs(shown.emf) > 1.5 ? '#1A8F50' : undefined },
      ]}
      controls={[
        {
          label: ru ? 'Положение магнита' : 'Magnet position',
          value: `${Math.round(shown.x - CX)}`,
          input: (
            <RangeSlider
              value={Math.round(shown.x)}
              onChange={(v) => {
                live.current.auto = false;
                live.current.target = v;
                setAuto(false);
              }}
              min={X_MIN}
              max={X_MAX}
            />
          ),
          hint: ru ? 'Двигай быстрее — ЭДС больше. Останови магнит внутри катушки — лампа гаснет.' : 'Move faster and the EMF grows. Stop the magnet inside the coil and the bulb goes out.',
        },
        {
          label: ru ? 'Число витков N' : 'Number of turns N',
          value: String(turns),
          color: '#B7791F',
          input: <RangeSlider value={turns} onChange={(v) => setTurns(v)} min={1} max={8} />,
          hint: ru ? 'Каждый виток добавляет свою ЭДС: вдвое больше витков — вдвое больше напряжение.' : 'Each turn adds its own EMF: twice the turns, twice the voltage.',
        },
      ]}
      insight={{
        title: ru ? 'Опыт Фарадея, 1831' : "Faraday's experiment, 1831",
        text: ru
          ? 'Покоящийся магнит тока не создаёт. Ток появляется, только пока меняется магнитный поток через витки — то есть пока магнит движется.'
          : 'A magnet at rest makes no current. Current flows only while the magnetic flux through the turns changes, that is while the magnet moves.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto touch-pan-y cursor-grab" aria-label={ru ? 'Магнит, катушка, гальванометр и лампа' : 'A magnet, a coil, a galvanometer and a bulb'} />
    </SimShell>
  );
};
