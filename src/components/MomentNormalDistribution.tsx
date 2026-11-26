import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentNormalDistributionProps {
  lang: 'ru' | 'en';
}

// a Galton board (canvas 800×380): balls bounce left or right on every peg and pile up into a bell
const TOPX = 400;
const TOPY = 34;
const ROW = 17;
const GAP = 24;
const BOTTOM = 372;

interface Ball {
  prog: number; // rows travelled
  path: number[]; // 0 left, 1 right at each peg
  y: number;
  vy: number;
  landed: boolean;
}

export const MomentNormalDistribution: React.FC<MomentNormalDistributionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rows, setRows] = useState(12);
  const [p, setP] = useState(0.5);
  const [rate, setRate] = useState(14);
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState({ n: 0, mean: 0, sd: 0 });

  const live = useRef({ p, rate, lang });
  live.current = { p, rate, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const N = rows;
    const bins = new Array(N + 1).fill(0);
    const balls: Ball[] = [];
    const s = { clock: 0, total: 0, report: 0 };
    const binTop = TOPY + N * ROW + 22;
    const xAt = (rights: number, k: number) => TOPX + (rights - k / 2) * GAP;

    return runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';

      if (!still && s.total < 2000) {
        s.clock += dt * L.rate;
        while (s.clock > 1) {
          s.clock -= 1;
          balls.push({ prog: 0, path: Array.from({ length: N }, () => (Math.random() < L.p ? 1 : 0)), y: 0, vy: 0, landed: false });
        }
      }
      if (!still) {
        for (const b of balls) {
          if (b.prog < N) b.prog = Math.min(N, b.prog + dt * 9);
          else if (!b.landed) {
            b.vy += 900 * dt;
            b.y += b.vy * dt;
            const k = b.path.reduce((a, c) => a + c, 0);
            // a ball lands on top of its column and is counted there
            const stackTop = BOTTOM - (bins[k] / Math.max(...bins, 1)) * (BOTTOM - binTop) * 0.95;
            if (binTop + b.y > stackTop - 4) {
              b.landed = true;
              bins[k]++;
              s.total++;
            }
          }
        }
        for (let i = balls.length - 1; i >= 0; i--) if (balls[i].landed) balls.splice(i, 1);
      }

      s.report += dt;
      if (s.report > 0.2) {
        s.report = 0;
        const tot = bins.reduce((a, c) => a + c, 0) || 1;
        const mean = bins.reduce((a, c, i) => a + c * i, 0) / tot;
        const sd = Math.sqrt(bins.reduce((a, c, i) => a + c * (i - mean) ** 2, 0) / tot);
        setShown({ n: s.total, mean, sd });
      }

      drawStage(ctx, w, h, { x: TOPX, y: 200 });

      // the funnel and the pegs
      ctx.fillStyle = 'rgba(200,210,255,0.55)';
      for (let k = 0; k < N; k++) {
        for (let j = 0; j <= k; j++) {
          ctx.beginPath();
          ctx.arc(xAt(j, k), TOPY + k * ROW + 8, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // bins: a column per possible number of right turns, and the bell curve the theory predicts
      const max = Math.max(...bins, 1);
      const colH = BOTTOM - binTop;
      const tot = bins.reduce((a, c) => a + c, 0);
      for (let k = 0; k <= N; k++) {
        const x = xAt(k, N);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - GAP / 2, binTop);
        ctx.lineTo(x - GAP / 2, BOTTOM);
        ctx.stroke();
        const hh = (bins[k] / max) * colH * 0.95;
        const g = ctx.createLinearGradient(0, BOTTOM - hh, 0, BOTTOM);
        g.addColorStop(0, '#9B8CFF');
        g.addColorStop(1, '#5B4BFF');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x - GAP / 2 + 2, BOTTOM - hh, GAP - 4, hh, 4);
        ctx.fill();
      }
      if (tot > 20) {
        // binomial → normal: mean N·p, spread √(N·p·(1−p))
        const mu = N * L.p;
        const sig = Math.sqrt(N * L.p * (1 - L.p)) || 0.3;
        ctx.strokeStyle = '#FFD25E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const k = -0.5 + (i / 200) * (N + 1);
          const dens = (tot / (sig * Math.sqrt(2 * Math.PI))) * Math.exp(-((k - mu) ** 2) / (2 * sig * sig));
          const x = xAt(k, N);
          const y = BOTTOM - (dens / max) * colH * 0.95;
          if (i) ctx.lineTo(x, Math.max(binTop - 10, y));
          else ctx.moveTo(x, Math.max(binTop - 10, y));
        }
        ctx.stroke();
      }

      // the balls in flight, hopping from peg to peg
      for (const b of balls) {
        let x: number;
        let y: number;
        if (b.prog < N) {
          const k = Math.floor(b.prog);
          const f = b.prog - k;
          const r0 = b.path.slice(0, k).reduce((a, c) => a + c, 0);
          const ease = f * f * (3 - 2 * f);
          x = xAt(r0, k) + (xAt(r0 + b.path[k], k + 1) - xAt(r0, k)) * ease;
          y = TOPY + (k + f) * ROW - Math.sin(Math.PI * f) * 6;
        } else {
          const r = b.path.reduce((a, c) => a + c, 0);
          x = xAt(r, N);
          y = binTop + b.y;
        }
        glow(ctx, x, y, 10, '255,214,140', 0.5);
        ctx.fillStyle = '#FFE3A3';
        ctx.beginPath();
        ctx.arc(x, y, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }

      pill(ctx, 120, 40, ru ? `шариков: ${s.total}` : `balls: ${s.total}`, STAGE.ink);
      if (tot > 20) pill(ctx, 680, 40, ru ? 'жёлтая — кривая Гаусса' : 'yellow: the Gauss curve', '#FFD25E');
    });
  }, [rows, run]);

  const ru = lang === 'ru';
  const f = (x: number) => (ru ? x.toFixed(2).replace('.', ',') : x.toFixed(2));
  return (
    <SimShell
      badge={ru ? '9–11 класс · Биология · Математика' : 'Grades 9–11 · Biology · Maths'}
      formula="σ = √(n·p·(1 − p))"
      title={ru ? 'Нормальное распределение: много мелких случайностей дают колокол' : 'The normal distribution: many small chances make a bell'}
      actions={
        <Button variant="outline" size="sm" className="font-semibold" onPress={() => setRun((r) => r + 1)}>
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          {ru ? 'Заново' : 'Again'}
        </Button>
      }
      readouts={[
        { label: ru ? 'Шариков' : 'Balls', value: String(shown.n) },
        { label: ru ? 'Среднее' : 'Mean', value: f(shown.mean), color: '#4A3BEB' },
        { label: ru ? 'Разброс σ' : 'Spread σ', value: f(shown.sd), color: '#B7791F' },
        { label: ru ? 'По теории σ' : 'Theory σ', value: f(Math.sqrt(rows * p * (1 - p))), color: '#B7791F' },
      ]}
      controls={[
        { label: ru ? 'Рядов гвоздей' : 'Rows of pegs', value: String(rows), input: <RangeSlider value={rows} onChange={setRows} min={4} max={16} />, hint: ru ? 'Больше рядов — больше случайных «толчков», колокол шире.' : 'More rows mean more random nudges and a wider bell.' },
        { label: ru ? 'Вероятность вправо' : 'Chance to go right', value: f(p), color: '#4A3BEB', input: <RangeSlider value={p} onChange={setP} min={0.2} max={0.8} step={0.05} />, hint: ru ? 'Сдвинь от 0,5 — горка уедет вбок, но форма останется колоколом.' : 'Move it off 0.5: the pile shifts aside but keeps its bell shape.' },
        { label: ru ? 'Шариков в секунду' : 'Balls per second', value: String(rate), input: <RangeSlider value={rate} onChange={setRate} min={2} max={60} step={2} /> },
      ]}
      insight={{
        title: ru ? 'Почему рост людей — колокол' : 'Why human height is a bell',
        text: ru
          ? 'Рост, масса, урожайность зависят от множества мелких генов и условий, и каждый чуть тянет вверх или вниз — как гвоздь толкает шарик влево или вправо. Сумма многих мелких случайностей всегда даёт такой колокол.'
          : 'Height, weight and yield depend on many small genes and conditions, each nudging up or down like a peg nudges a ball. The sum of many small chances always makes this bell.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Доска Гальтона: шарики падают через гвозди в лотки' : 'A Galton board: balls fall through pegs into bins'} />
    </SimShell>
  );
};
