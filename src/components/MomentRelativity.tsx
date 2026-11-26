import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentRelativityProps {
  lang: 'ru' | 'en';
}

// light clocks (canvas 800×380): one at rest on top, one flying past below
const H = 90; // distance between the mirrors, px
const C = 150; // the speed of light in the drawing, px/s
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentRelativity: React.FC<MomentRelativityProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [beta, setBeta] = useState(0.8);
  const [ticks, setTicks] = useState({ rest: 0, moving: 0 });
  const live = useRef({ beta, lang });
  live.current = { beta, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { t: 0, x: 120, trail: [] as [number, number][], restTicks: 0, moveTicks: 0, lastBeta: live.current.beta, report: 0 };

    return runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const b = L.beta;
      const gamma = 1 / Math.sqrt(1 - b * b);
      if (b !== s.lastBeta) {
        s.lastBeta = b;
        s.t = 0;
        s.x = 120;
        s.trail = [];
        s.restTicks = 0;
        s.moveTicks = 0;
      }
      if (!still) s.t += dt;
      const v = b * C;
      // the moving clock: its photon runs diagonally at speed c, so one tick takes γ times longer
      const tickRest = (2 * H) / C;
      const tickMove = tickRest * gamma;
      const restPhase = (s.t % tickRest) / tickRest;
      const movePhase = (s.t % tickMove) / tickMove;
      const restCount = Math.floor(s.t / tickRest);
      const moveCount = Math.floor(s.t / tickMove);
      s.x = 120 + ((v * s.t) % 560);
      if (s.x < 125) s.trail = [];

      s.report += dt;
      if (s.report > 0.1) {
        s.report = 0;
        setTicks({ rest: restCount, moving: moveCount });
      }

      drawStage(ctx, w, h);
      // stars streaming past
      for (let i = 0; i < 40; i++) {
        const sx = (((i * 137) % 800) - ((s.t * v * 0.5) % 800) + 800) % 800;
        const sy = (i * 71) % 380;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(sx, sy, 1.5 + b * 6, 1.2);
      }

      const clock = (cx: number, top: number, phase: number, count: number, label: string, contract: number) => {
        const yBot = top + H;
        const bounce = phase < 0.5 ? phase * 2 : 2 - phase * 2; // 0 at the bottom mirror, 1 at the top
        const py = yBot - bounce * H;
        // the ship body, shorter along the motion by 1/γ
        const sw = 120 / contract;
        ctx.fillStyle = 'rgba(160,170,210,0.12)';
        ctx.strokeStyle = 'rgba(200,210,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - sw / 2, top - 16, sw, H + 32, 14);
        ctx.fill();
        ctx.stroke();
        for (const y of [top, yBot]) {
          const g = ctx.createLinearGradient(0, y - 3, 0, y + 3);
          g.addColorStop(0, '#F2F4FA');
          g.addColorStop(1, '#8A92A6');
          ctx.fillStyle = g;
          ctx.fillRect(cx - 30 / contract, y - 3, 60 / contract, 6);
        }
        glow(ctx, cx, py, 22, '255,230,120', 0.9);
        ctx.fillStyle = '#FFF3B0';
        ctx.beginPath();
        ctx.arc(cx, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        pill(ctx, cx, top - 34, `${label}: ${count}`, STAGE.ink);
        return py;
      };

      // the clock at rest
      clock(150, 52, restPhase, restCount, ru ? 'часы в покое, тиков' : 'clock at rest, ticks', 1);
      ctx.fillStyle = STAGE.soft;
      ctx.font = `500 12px ${STAGE.font}`;
      ctx.textAlign = 'left';
      ctx.fillText(ru ? 'фотон летит вверх-вниз: путь 2h' : 'the photon goes up and down: path 2h', 230, 100);

      // the moving clock, with the photon's zig-zag drawn as seen from outside
      const py = clock(s.x, 232, movePhase, moveCount, ru ? 'летящие часы' : 'moving clock', gamma);
      s.trail.push([s.x, py]);
      if (s.trail.length > 400) s.trail.shift();
      ctx.strokeStyle = 'rgba(255,230,120,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      s.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      if (b > 0.02) {
        ctx.strokeStyle = '#3DD6FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s.x + 70 / gamma, 222);
        ctx.lineTo(s.x + 70 / gamma + b * 60, 222);
        ctx.stroke();
      }
      pill(ctx, 680, 352, `γ = ${fmt(gamma, 2, ru)}`, '#FFC46B');
    });
  }, []);

  const ru = lang === 'ru';
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return (
    <SimShell
      badge={ru ? '11 класс · Физика' : 'Grade 11 · Physics'}
      formula="Δt = γ·Δt₀,  γ = 1 / √(1 − v²/c²)"
      title={ru ? 'Световые часы: почему движущееся время идёт медленнее' : 'Light clocks: why moving time runs slow'}
      readouts={[
        { label: ru ? 'Скорость' : 'Speed', value: `${fmt(beta, 2, ru)} c`, color: '#1E88C8' },
        { label: 'γ', value: fmt(gamma, 2, ru), color: '#B7791F' },
        { label: ru ? 'Тиков в покое' : 'Ticks at rest', value: String(ticks.rest) },
        { label: ru ? 'Тиков в полёте' : 'Ticks in flight', value: String(ticks.moving), color: '#4A3BEB' },
      ]}
      controls={[
        {
          label: ru ? 'Скорость корабля v / c' : 'Ship speed v / c',
          value: `${fmt(beta, 2, ru)} c`,
          color: '#1E88C8',
          input: <RangeSlider value={beta} onChange={setBeta} min={0} max={0.98} step={0.02} />,
          hint: ru
            ? 'Свет в обоих часах летит с одной скоростью c. Снаружи видно, что в летящих часах фотону приходится бежать по диагонали — длиннее, и тик занимает в γ раз больше времени. При 0,87c время идёт вдвое медленнее.'
            : 'Light in both clocks moves at the same speed c. From outside, the photon in the moving clock runs a longer diagonal, so each tick takes γ times longer. At 0.87c time runs half as fast.',
        },
      ]}
      insight={{
        title: ru ? 'Это не фокус часов' : 'It is not a trick of the clocks',
        text: ru
          ? 'Замедляется всё: пульс космонавта, распад частиц, старение. Мюоны из космических лучей живут всего 2 мкс, но долетают до Земли — потому что летят почти со скоростью света. А корабль при этом ещё и сокращается в длину в те же γ раз.'
          : 'Everything slows: an astronaut’s pulse, particle decay, ageing. Cosmic-ray muons live just 2 μs yet reach the ground because they fly near light speed. And the ship also shrinks along its motion by the same γ.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Двое световых часов: в покое и в полёте' : 'Two light clocks: at rest and in flight'} />
    </SimShell>
  );
};
