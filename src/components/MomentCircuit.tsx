import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { approach, clamp01, drawStage, glow, mix, mixRgb, pill, runStage, seeded, stepParticles, STAGE, type Particle } from '../lib/stage';

interface MomentCircuitProps {
  lang: 'ru' | 'en';
}

// colour bands of a resistor: two digits and a multiplier (gold = ×0.1)
const BAND = ['#1B1B1F', '#7A4A2A', '#D93A3A', '#F08C2E', '#F2D03B', '#2FA36B', '#3A7BD5', '#8A5CD6', '#9AA0A6', '#EEEEEE'];
const GOLD = '#C9A64A';
const bandsFor = (r: number) => (r < 10 ? [BAND[r], BAND[0], GOLD] : [BAND[Math.floor(r / 10)], BAND[r % 10], BAND[0]]);

// the circuit in drawing units (the canvas is 800×320)
const X1 = 90;
const Y1 = 58;
const X2 = 710;
const Y2 = 262;
const R = 22;
const SWITCH_X = 300;
const BULB_X = 400;
const MID_Y = (Y1 + Y2) / 2;

/** points every ~2 units along the rounded loop, in the direction electrons drift (from − round to +) */
function loopPoints() {
  const pts: [number, number][] = [];
  const line = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 2));
    for (let i = 0; i < n; i++) pts.push([mix(ax, bx, i / n), mix(ay, by, i / n)]);
  };
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    const n = Math.max(2, Math.round((Math.abs(a1 - a0) * R) / 2));
    for (let i = 0; i < n; i++) {
      const a = mix(a0, a1, i / n);
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
  };
  line(X1, Y1 + R, X1, Y2 - R);
  arc(X1 + R, Y2 - R, Math.PI, Math.PI / 2);
  line(X1 + R, Y2, X2 - R, Y2);
  arc(X2 - R, Y2 - R, Math.PI / 2, 0);
  line(X2, Y2 - R, X2, Y1 + R);
  arc(X2 - R, Y1 + R, 0, -Math.PI / 2);
  line(X2 - R, Y1, X1 + R, Y1);
  arc(X1 + R, Y1 + R, -Math.PI / 2, -Math.PI);
  return pts;
}

const fmt = (x: number, d: number, lang: 'ru' | 'en') => (lang === 'ru' ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentCircuit: React.FC<MomentCircuitProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [resistance, setResistance] = useState<number>(6); // Ohms
  const [switchClosed, setSwitchClosed] = useState<boolean>(true);

  // Ohm's law: I = U / R
  const current = switchClosed ? voltage / Math.max(0.5, resistance) : 0;
  const power = current * voltage;

  // the drawing loop runs once and reads the latest values from here, so moving a slider never restarts it
  const live = useRef({ voltage, resistance, switchClosed, lang });
  live.current = { voltage, resistance, switchClosed, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pts = loopPoints();
    const N = 46;
    const sparks: Particle[] = [];
    const heatWisps: Particle[] = [];
    // eased state: everything the eye sees glides toward the physics
    const s = { I: 0, open: 0, bright: 0, heat: 0, drift: 0, wasClosed: live.current.switchClosed, wispClock: 0 };

    const at = (d: number) => {
      const i = ((Math.floor(d / 2) % pts.length) + pts.length) % pts.length;
      return pts[i];
    };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const { voltage: U, resistance: Rv, switchClosed: closed, lang: L } = live.current;
      const I = closed ? U / Math.max(0.5, Rv) : 0;
      const P = I * U;

      // a spark where the lever meets the contact whenever the switch changes
      if (closed !== s.wasClosed && !still) {
        for (let k = 0; k < 16; k++) {
          const a = -Math.PI * (0.15 + 0.7 * Math.random());
          const v = 80 + Math.random() * 160;
          sparks.push({ x: SWITCH_X + 22, y: Y1, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 0.25 + Math.random() * 0.3, seed: k });
        }
      }
      s.wasClosed = closed;

      s.I = approach(s.I, I, dt, 0.35);
      s.open = approach(s.open, closed ? 0 : 1, dt, 0.09);
      const brightTarget = clamp01(Math.log10(1 + P) / Math.log10(220));
      s.bright = approach(s.bright, brightTarget, dt, brightTarget > s.bright ? 0.12 : 0.3); // a filament warms fast, cools slower
      s.heat = approach(s.heat, clamp01(P / 160), dt, 1.4); // the resistor has thermal inertia
      const speed = (34 * s.I) / (1 + s.I / 7);
      if (!still) s.drift += speed * dt;

      drawStage(ctx, w, h, { x: BULB_X, y: Y2 - 60 });

      // the bulb lights the whole scene before anything else is drawn on top
      const bx = BULB_X;
      const by = Y2 - 46;
      glow(ctx, bx, by, 120 + 380 * s.bright, '255,176,92', 0.32 * s.bright);
      glow(ctx, X2, MID_Y, 140, '255,96,40', 0.22 * s.heat);

      // the wire: a dark casing with a core that brightens with the current
      const iGlow = clamp01(s.I / 6);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.roundRect(X1, Y1, X2 - X1, Y2 - Y1, R);
      ctx.strokeStyle = '#20273A';
      ctx.lineWidth = 11;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${mixRgb([58, 69, 96], [90, 200, 255], iGlow)},${0.55 + 0.35 * iGlow})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // electrons: thermal jitter always, a drift along the wire while the circuit is closed
      for (let k = 0; k < N; k++) {
        const base = (k / N) * pts.length * 2 + s.drift;
        const jig = still ? 0 : Math.sin(t * (5 + seeded(k) * 4) + seeded(k, 1) * 6.28) * 2.2;
        const [ex, ey] = at(base + jig);
        // hidden inside the battery and the bulb base
        if (Math.abs(ex - X1) < 4 && Math.abs(ey - MID_Y) < 52) continue;
        if (Math.abs(ey - Y2) < 4 && Math.abs(ex - bx) < 16) continue;
        const inRes = Math.abs(ex - X2) < 4 && Math.abs(ey - MID_Y) < 52;
        const a = inRes ? 0.55 : 1;
        if (speed > 6 && !still) {
          for (let tr = 1; tr <= 3; tr++) {
            const [tx, ty] = at(base - tr * speed * 0.035);
            ctx.fillStyle = `rgba(110,210,255,${(0.22 / tr) * a})`;
            ctx.beginPath();
            ctx.arc(tx, ty, 3 - tr * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = `rgba(130,220,255,${a})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 3.2, 0, Math.PI * 2);
        ctx.fill();
        glow(ctx, ex, ey, 10, '80,190,255', 0.35 * a);
      }

      // battery: a cylinder with a metal cap, standing on the left wire
      {
        const cx = X1;
        const top = MID_Y - 48;
        const bw = 44;
        const g = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
        g.addColorStop(0, '#18213A');
        g.addColorStop(0.45, '#33446E');
        g.addColorStop(1, '#141B2E');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(cx - bw / 2, top, bw, 96, 8);
        ctx.fill();
        ctx.fillStyle = 'rgba(61,214,255,0.9)';
        ctx.fillRect(cx - bw / 2, MID_Y - 12, bw, 24);
        ctx.fillStyle = '#06222C';
        ctx.font = `700 12px ${STAGE.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${U}V`, cx, MID_Y + 0.5);
        const cap = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
        cap.addColorStop(0, '#8C93A3');
        cap.addColorStop(0.5, '#E6E9F0');
        cap.addColorStop(1, '#7A8192');
        ctx.fillStyle = cap;
        ctx.beginPath();
        ctx.roundRect(cx - 10, top - 7, 20, 9, 3);
        ctx.fill();
        ctx.fillStyle = STAGE.ink;
        ctx.font = `700 15px ${STAGE.font}`;
        ctx.fillText('+', cx, top + 16);
        ctx.fillText('−', cx, top + 82);
      }

      // switch: two posts and a lever that swings open
      {
        const px = SWITCH_X - 22;
        const qx = SWITCH_X + 22;
        ctx.fillStyle = '#0E1220';
        ctx.fillRect(px + 4, Y1 - 8, qx - px - 8, 16);
        const ang = -0.62 * s.open;
        ctx.strokeStyle = closed ? '#E6E9F0' : '#C9CEDA';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(px, Y1);
        ctx.lineTo(px + 46 * Math.cos(ang), Y1 + 46 * Math.sin(ang));
        ctx.stroke();
        for (const x of [px, qx]) {
          const g = ctx.createRadialGradient(x - 2, Y1 - 2, 1, x, Y1, 8);
          g.addColorStop(0, '#F4F6FB');
          g.addColorStop(1, '#6E7586');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, Y1, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // resistor: a ceramic capsule with colour bands that heats up
      {
        const cx = X2;
        const rw = 30;
        const top = MID_Y - 50;
        const g = ctx.createLinearGradient(cx - rw / 2, 0, cx + rw / 2, 0);
        g.addColorStop(0, '#B39A70');
        g.addColorStop(0.45, '#F1E2C2');
        g.addColorStop(1, '#A68B5E');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(cx - rw / 2, top, rw, 100, 14);
        ctx.fill();
        const bands = bandsFor(Math.round(Rv));
        bands.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(cx - rw / 2, top + 22 + i * 16, rw, 8);
        });
        ctx.fillStyle = GOLD;
        ctx.fillRect(cx - rw / 2, top + 76, rw, 6);
        if (s.heat > 0.01) {
          ctx.fillStyle = `rgba(255,${Math.round(mix(140, 60, s.heat))},40,${0.6 * s.heat})`;
          ctx.beginPath();
          ctx.roundRect(cx - rw / 2, top, rw, 100, 14);
          ctx.fill();
          glow(ctx, cx, MID_Y, 46, '255,120,50', 0.45 * s.heat);
        }
        // heat rising off it
        if (!still) {
          s.wispClock += dt * s.heat * 14;
          while (s.wispClock > 1) {
            s.wispClock -= 1;
            heatWisps.push({ x: cx - 30 - Math.random() * 14, y: top + 20 + Math.random() * 60, vx: 0, vy: -26 - Math.random() * 18, life: 0, max: 1.4 + Math.random() * 0.6, seed: Math.random() * 6.28 });
          }
        }
      }

      // the bulb: glass, a coiled filament and a screw base on the bottom wire
      {
        const b = s.bright;
        ctx.fillStyle = '#0E1220';
        ctx.fillRect(bx - 16, Y2 - 7, 32, 14);
        const base = ctx.createLinearGradient(bx - 13, 0, bx + 13, 0);
        base.addColorStop(0, '#6E7586');
        base.addColorStop(0.5, '#DDE1EA');
        base.addColorStop(1, '#5E6576');
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.roundRect(bx - 13, Y2 - 22, 26, 22, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,46,60,0.7)';
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(bx - 13, Y2 - 18 + k * 6);
          ctx.lineTo(bx + 13, Y2 - 15 + k * 6);
          ctx.stroke();
        }
        glow(ctx, bx, by, 110, '255,214,140', 0.95 * b);
        const glass = ctx.createRadialGradient(bx - 8, by - 10, 2, bx, by, 30);
        glass.addColorStop(0, `rgba(255,248,225,${0.12 + 0.75 * b})`);
        glass.addColorStop(1, `rgba(255,200,120,${0.04 + 0.3 * b})`);
        ctx.fillStyle = glass;
        ctx.beginPath();
        ctx.arc(bx, by, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(230,236,250,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        const fil = b < 0.5 ? mixRgb([95, 100, 115], [255, 140, 50], b * 2) : mixRgb([255, 140, 50], [255, 244, 210], (b - 0.5) * 2);
        ctx.strokeStyle = `rgb(${fil})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by + 16);
        ctx.lineTo(bx - 7, by + 2);
        for (let k = 0; k <= 8; k++) ctx.lineTo(bx - 7 + k * 1.75, by + (k % 2 ? -4 : 2));
        ctx.lineTo(bx + 7, by + 16);
        ctx.stroke();
        // the white-hot core of a bright filament
        glow(ctx, bx, by, 34, '255,252,236', 0.9 * b * b);
        // a highlight on the glass
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 19, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();
      }

      // heat wisps and sparks
      stepParticles(heatWisps, dt);
      for (const p of heatWisps) {
        const k = p.life / p.max;
        ctx.strokeStyle = `rgba(255,196,150,${0.5 * Math.sin(Math.PI * k)})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const yy = p.y - j * 3;
          const xx = p.x + Math.sin(p.seed + t * 3 + j * 0.7) * 3;
          if (j === 0) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      stepParticles(sparks, dt, 420);
      for (const p of sparks) {
        const k = 1 - p.life / p.max;
        ctx.strokeStyle = `rgba(255,${Math.round(200 + 55 * k)},120,${k})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
        ctx.stroke();
      }
      glow(ctx, SWITCH_X + 22, Y1, 40, '255,210,120', sparks.length ? 0.5 : 0);

      // live readings next to the parts they describe
      pill(ctx, X1 + 36, MID_Y - 34, `U = ${U} ${L === 'ru' ? 'В' : 'V'}`, '#7FE3FF', 'left');
      pill(ctx, X2 - 34, MID_Y - 34, `R = ${Rv} ${L === 'ru' ? 'Ом' : 'Ω'}`, '#FFC46B', 'right');
      pill(ctx, BULB_X, Y2 - 102, `I = ${fmt(s.I, 2, L)} ${L === 'ru' ? 'А' : 'A'}  ·  P = ${fmt(s.I * s.I * Rv, 1, L)} ${L === 'ru' ? 'Вт' : 'W'}`, STAGE.ink);
      if (!closed) pill(ctx, SWITCH_X, Y1 + 30, L === 'ru' ? 'цепь разомкнута — тока нет' : 'circuit open — no current', '#FF8A9E');
      else if (P > 300) pill(ctx, X2 - 34, MID_Y + 66, L === 'ru' ? 'резистор перегревается' : 'the resistor overheats', '#FF8A6B', 'right');
    });
  }, []);

  const L = lang === 'ru';
  return (
    <SimShell
      badge={L ? '8 класс · Физика' : 'Grade 8 · Physics'}
      formula="I = U / R"
      title={L ? 'Электрическая цепь: электроны, сопротивление и тепло' : 'An electric circuit: electrons, resistance and heat'}
      actions={
        <Button variant="outline" size="sm" className="font-semibold" onPress={() => setSwitchClosed(!switchClosed)}>
          {switchClosed ? (L ? 'Разомкнуть ключ' : 'Open the switch') : L ? 'Замкнуть ключ' : 'Close the switch'}
        </Button>
      }
      readouts={[
        { label: L ? 'Напряжение' : 'Voltage', value: `${voltage} ${L ? 'В' : 'V'}`, color: '#22A8E0' },
        { label: L ? 'Сопротивление' : 'Resistance', value: `${resistance} ${L ? 'Ом' : 'Ω'}`, color: '#D9822B' },
        { label: L ? 'Ток' : 'Current', value: `${current.toFixed(2)} ${L ? 'А' : 'A'}`, color: '#1A8F50' },
        { label: L ? 'Мощность' : 'Power', value: `${power.toFixed(1)} ${L ? 'Вт' : 'W'}`, color: '#B7791F' },
      ]}
      controls={[
        {
          label: L ? 'Напряжение источника U' : 'Source voltage U',
          value: `${voltage} ${L ? 'В' : 'V'}`,
          color: '#22A8E0',
          input: <RangeSlider value={voltage} onChange={(v) => setVoltage(v)} min={1} max={36} step={1} />,
          hint: L ? 'Больше напряжение — сильнее поле толкает электроны, и лампа горит ярче.' : 'More voltage — a stronger field pushes the electrons and the bulb glows brighter.',
        },
        {
          label: L ? 'Сопротивление резистора R' : 'Resistance R',
          value: `${resistance} ${L ? 'Ом' : 'Ω'}`,
          color: '#D9822B',
          input: <RangeSlider value={resistance} onChange={(v) => setResistance(v)} min={1} max={20} step={1} />,
          hint: L ? 'Ионы решётки мешают электронам, и энергия уходит в тепло: резистор нагревается (Q = I²Rt).' : 'Lattice ions hinder the electrons and the energy turns into heat: the resistor warms up (Q = I²Rt).',
        },
      ]}
    >
      <canvas ref={canvasRef} width={800} height={320} className="block w-full h-auto" />
    </SimShell>
  );
};
