import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

export type KinMode = 'uniform' | 'accel' | 'frames';

interface MomentKinematicsProps {
  lang: 'ru' | 'en';
  mode?: KinMode;
}

// the scene (canvas 800×380): a road on top, the graphs x(t) and v(t) underneath
const RX0 = 50;
const RX1 = 750;
const ROAD_M = 100; // metres shown on the road
const PPM = (RX1 - RX0) / ROAD_M;
const RY = 92; // the middle of the road
const T_MAX = 10; // s
const A_COL = '#9B8CFF';
const B_COL = '#5FDDFF';
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentKinematics: React.FC<MomentKinematicsProps> = ({ lang, mode: initial = 'uniform' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<KinMode>(initial);
  const [v1, setV1] = useState(initial === 'accel' ? 0 : 6);
  const [acc, setAcc] = useState(1.6);
  const [v2, setV2] = useState(9);
  const [rideA, setRideA] = useState(false);
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState({ t: 0, x: 0, v: 0, xb: 0 });

  const live = useRef({ mode, v1, acc, v2, rideA, lang });
  live.current = { mode, v1, acc, v2, rideA, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { t: 0, hold: 0, report: 0, camera: 0 };

    return runStage(canvas, (dt, _tt, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const accel = L.mode === 'accel' ? L.acc : 0;
      const xA = (t: number) => 10 + L.v1 * t + (accel * t * t) / 2;
      const vA = (t: number) => L.v1 + accel * t;
      const xB = (t: number) => 2 + L.v2 * t;
      const two = L.mode === 'frames';

      // time runs to the end of the road or T_MAX, rests a moment, then starts again
      const ended = s.t >= T_MAX || xA(s.t) > ROAD_M + 5 || xA(s.t) < -5;
      if (!still) {
        if (ended) {
          s.hold += dt;
          if (s.hold > 1.6) {
            s.t = 0;
            s.hold = 0;
          }
        } else s.t = Math.min(T_MAX, s.t + dt);
      } else s.t = 4;
      const t = s.t;
      // in the frame of car A the road and car B move instead
      const cam = two && L.rideA ? xA(t) - 30 : 0;
      s.camera = cam;
      const sx = (x: number) => RX0 + (x - cam) * PPM;

      s.report += dt;
      if (s.report > 0.1) {
        s.report = 0;
        setShown({ t, x: xA(t), v: vA(t), xb: xB(t) });
      }

      drawStage(ctx, w, h, { x: 400, y: RY });

      // the road with posts every 10 m; they slide past when we ride in car A
      ctx.fillStyle = '#1C2133';
      ctx.fillRect(0, RY - 34, w, 68);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([18, 14]);
      ctx.lineDashOffset = cam * PPM;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, RY);
      ctx.lineTo(w, RY);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let m = Math.floor(cam / 10) * 10 - 10; m <= cam + ROAD_M + 20; m += 10) {
        const x = sx(m);
        if (x < -20 || x > w + 20) continue;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x - 1, RY - 50, 2, 14);
        ctx.fillStyle = STAGE.soft;
        ctx.font = `500 10px ${STAGE.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`${m} ${ru ? 'м' : 'm'}`, x, RY - 54);
      }

      // a mark every second: equal gaps for steady speed, growing gaps when speeding up
      for (let k = 1; k <= Math.floor(t); k++) {
        const x = sx(xA(k));
        ctx.fillStyle = 'rgba(155,140,255,0.8)';
        ctx.beginPath();
        ctx.arc(x, RY + 26, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `500 9px ${STAGE.mono}`;
        ctx.fillText(`${k}${ru ? 'с' : 's'}`, x, RY + 42);
      }

      const car = (x: number, y: number, col: string, v: number, label: string) => {
        const cx = sx(x);
        glow(ctx, cx, y, 34, col === A_COL ? '155,140,255' : '95,221,255', 0.35);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(cx - 24, y - 12, 48, 18, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx - 12, y - 22, 26, 12, 5);
        ctx.fill();
        ctx.fillStyle = 'rgba(11,14,24,0.55)';
        ctx.fillRect(cx - 8, y - 19, 18, 7);
        for (const wx of [cx - 13, cx + 13]) {
          const ang = (x - cam) / 0.35;
          ctx.fillStyle = '#0E1220';
          ctx.beginPath();
          ctx.arc(wx, y + 7, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9AA2B8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wx, y + 7);
          ctx.lineTo(wx + Math.cos(ang) * 5, y + 7 + Math.sin(ang) * 5);
          ctx.stroke();
        }
        pill(ctx, cx, y - 38, `${label}${fmt(v, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, col);
      };
      if (two) car(xB(t), RY - 12, B_COL, L.rideA ? L.v2 - vA(t) : L.v2, 'B: ');
      car(xA(t), two ? RY + 14 : RY + 2, A_COL, two && L.rideA ? 0 : vA(t), two ? 'A: ' : '');

      // graphs: position on the left, velocity on the right (with the area under it = distance)
      const graph = (gx: number, gw: number, title: string, f: (t: number) => number, ymin: number, ymax: number, col: string, area: boolean, f2?: (t: number) => number) => {
        const gy0 = 190;
        const gy1 = 350;
        const X = (tt: number) => gx + (tt / T_MAX) * gw;
        const Y = (v: number) => gy1 - ((v - ymin) / (ymax - ymin)) * (gy1 - gy0);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(gx, gy0, gw, gy1 - gy0);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, gy0);
        ctx.lineTo(gx, gy1);
        ctx.lineTo(gx + gw, gy1);
        ctx.stroke();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `600 12px ${STAGE.font}`;
        ctx.textAlign = 'left';
        ctx.fillText(title, gx + 6, gy0 + 16);
        ctx.font = `500 10px ${STAGE.mono}`;
        ctx.fillText(ru ? 't, с' : 't, s', gx + gw - 26, gy1 + 14);
        const n = Math.max(2, Math.round((t / T_MAX) * 100));
        if (area) {
          ctx.fillStyle = 'rgba(155,140,255,0.18)';
          ctx.beginPath();
          ctx.moveTo(X(0), Y(Math.max(ymin, 0)));
          for (let i = 0; i <= n; i++) ctx.lineTo(X((i / n) * t), Y(f((i / n) * t)));
          ctx.lineTo(X(t), Y(Math.max(ymin, 0)));
          ctx.closePath();
          ctx.fill();
        }
        for (const [fn, c] of [[f, col], ...(f2 ? [[f2, B_COL]] : [])] as [(t: number) => number, string][]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let i = 0; i <= n; i++) {
            const tt = (i / n) * t;
            const y = Math.max(gy0, Math.min(gy1, Y(fn(tt))));
            if (i) ctx.lineTo(X(tt), y);
            else ctx.moveTo(X(tt), y);
          }
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(X(t), Math.max(gy0, Math.min(gy1, Y(fn(t)))), 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      const relX = (tt: number) => xB(tt) - xA(tt);
      graph(50, 330, two && L.rideA ? (ru ? 'x(t) из машины A' : 'x(t) seen from car A') : ru ? 'x(t), м' : 'x(t), m', two && L.rideA ? (tt) => 0 : xA, two && L.rideA ? -60 : 0, 110, A_COL, false, two ? (L.rideA ? relX : xB) : undefined);
      graph(420, 330, two ? (ru ? 'v(t), м/с' : 'v(t), m/s') : ru ? 'v(t), м/с — площадь = путь' : 'v(t), m/s — area = distance', two && L.rideA ? () => 0 : vA, two ? -16 : 0, 18, A_COL, !two, two ? (L.rideA ? () => L.v2 - L.v1 : () => L.v2) : undefined);
    });
  }, [run]);

  const ru = lang === 'ru';
  const restart = () => setRun((r) => r + 1);
  const pick = (m: KinMode, label: string) => (
    <Button
      variant={mode === m ? 'primary' : 'outline'}
      size="sm"
      className="font-semibold"
      onPress={() => {
        setMode(m);
        if (m === 'accel') setV1(0);
        else if (v1 === 0) setV1(6);
        restart();
      }}
    >
      {label}
    </Button>
  );
  const s = (v: number, set: (x: number) => void, min: number, max: number, step: number) => (
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
      badge={ru ? '7–10 класс · Физика' : 'Grades 7–10 · Physics'}
      formula={mode === 'accel' ? 'x = v₀t + at²/2' : mode === 'frames' ? 'v₂′ = v₂ − v₁' : 'x = x₀ + vt'}
      title={ru ? 'Кинематика: путь, скорость и графики движения' : 'Kinematics: distance, speed and motion graphs'}
      actions={
        <>
          {pick('uniform', ru ? 'Равномерное' : 'Steady')}
          {pick('accel', ru ? 'С ускорением' : 'Accelerating')}
          {pick('frames', ru ? 'Две машины' : 'Two cars')}
          {mode === 'frames' && (
            <Button variant={rideA ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setRideA(!rideA)}>
              {ru ? 'Сесть в машину A' : 'Ride in car A'}
            </Button>
          )}
          <Button variant="outline" size="sm" isIconOnly aria-label={ru ? 'Заново' : 'Again'} onPress={restart}>
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
          </Button>
        </>
      }
      readouts={[
        { label: ru ? 'Время' : 'Time', value: `${fmt(shown.t, 1, ru)} ${ru ? 'с' : 's'}` },
        { label: ru ? 'Координата A' : 'Position of A', value: `${fmt(shown.x, 1, ru)} ${ru ? 'м' : 'm'}`, color: '#6E54E0' },
        { label: ru ? 'Скорость A' : 'Speed of A', value: `${fmt(shown.v, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#6E54E0' },
        mode === 'frames'
          ? { label: ru ? 'B относительно A' : 'B relative to A', value: `${fmt(v2 - v1, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#1E88C8' }
          : { label: ru ? 'Путь' : 'Distance', value: `${fmt(Math.max(0, shown.x - 10), 1, ru)} ${ru ? 'м' : 'm'}`, color: '#B7791F' },
      ]}
      controls={[
        { label: mode === 'accel' ? (ru ? 'Начальная скорость v₀' : 'Starting speed v₀') : ru ? 'Скорость машины A' : 'Speed of car A', value: `${fmt(v1, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#6E54E0', input: s(v1, setV1, mode === 'frames' ? 0 : -4, 12, 0.5) },
        ...(mode === 'accel'
          ? [{ label: ru ? 'Ускорение a' : 'Acceleration a', value: `${fmt(acc, 1, ru)} ${ru ? 'м/с²' : 'm/s²'}`, color: '#B7791F', input: s(acc, setAcc, -2, 3, 0.2), hint: ru ? 'Каждую секунду скорость растёт на a — метки на дороге расходятся всё шире, график x(t) загибается вверх.' : 'Each second the speed grows by a: the marks spread wider and x(t) curves upward.' }]
          : []),
        ...(mode === 'frames'
          ? [{ label: ru ? 'Скорость машины B' : 'Speed of car B', value: `${fmt(v2, 1, ru)} ${ru ? 'м/с' : 'm/s'}`, color: '#1E88C8', input: s(v2, setV2, -6, 14, 0.5), hint: ru ? 'Сядь в машину A: она «стоит», а дорога едет назад. B обгоняет со скоростью v₂ − v₁, а встречная (отрицательная v₂) летит на тебя со скоростью v₁ + |v₂|.' : 'Ride in car A: it “stands still” and the road moves back. B overtakes at v₂ − v₁; an oncoming car (negative v₂) rushes at you at v₁ + |v₂|.' }]
          : []),
      ]}
      insight={{
        title: ru ? 'Как читать графики' : 'How to read the graphs',
        text: ru
          ? 'Наклон графика x(t) — это скорость: круче линия, быстрее едем. Площадь под графиком v(t) — пройденный путь. При равномерном движении x(t) — прямая, а v(t) — горизонталь.'
          : 'The slope of x(t) is the speed: the steeper, the faster. The area under v(t) is the distance travelled. In steady motion x(t) is a straight line and v(t) is flat.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Машина на дороге и графики координаты и скорости' : 'A car on a road with position and velocity graphs'} />
    </SimShell>
  );
};
