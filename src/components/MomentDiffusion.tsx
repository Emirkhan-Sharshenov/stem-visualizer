import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentDiffusionProps {
  lang: 'ru' | 'en';
  /** kept for the lab page that passes it; the moment itself unlocks nothing */
  onUnlockMilestone?: (id: string) => void;
}

// two vessels side by side (canvas 800×380): cold water on the left, hot on the right
const VESSELS = [
  { x0: 24, x1: 388, T: 10, D: 45, tint: '90,160,255' },
  { x0: 412, x1: 776, T: 80, D: 207, tint: '255,140,80' },
];
const VY0 = 34;
const VY1 = 292;
const N_DYE = 170;
const N_WATER = 70;
const gauss = () => Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(2 * Math.PI * Math.random());

interface Box {
  dye: [number, number][];
  water: [number, number, number, number][];
  grain: [number, number];
  trail: [number, number][];
}

export const MomentDiffusion: React.FC<MomentDiffusionProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [drop, setDrop] = useState(0);
  const [shown, setShown] = useState({ t: 0, cold: 0, hot: 0 });

  const live = useRef({ playing, speed, lang });
  live.current = { playing, speed, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const cy = (VY0 + VY1) / 2;
    const boxes: Box[] = VESSELS.map((v) => {
      const cx = (v.x0 + v.x1) / 2;
      return {
        dye: Array.from({ length: N_DYE }, () => [cx + gauss() * 5, cy + gauss() * 5] as [number, number]),
        water: Array.from({ length: N_WATER }, () => {
          const a = Math.random() * Math.PI * 2;
          const sp = 40 * Math.sqrt((v.T + 273) / 283);
          return [v.x0 + 10 + Math.random() * (v.x1 - v.x0 - 20), VY0 + 10 + Math.random() * (VY1 - VY0 - 20), Math.cos(a) * sp, Math.sin(a) * sp] as [number, number, number, number];
        }),
        grain: [cx + 70, cy - 60] as [number, number],
        trail: [],
      };
    });
    const s = { t: 0, splash: 0, report: 0 };
    const spread = (b: Box, v: (typeof VESSELS)[number]) => {
      const cx = (v.x0 + v.x1) / 2;
      let sum = 0;
      for (const [x, y] of b.dye) sum += (x - cx) ** 2 + (y - cy) ** 2;
      return Math.sqrt(sum / b.dye.length / 2);
    };

    return runStage(canvas, (dtRaw, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const run = L.playing && !still;
      const dt = dtRaw * L.speed;

      if (run) {
        s.t += dt;
        s.splash += dtRaw;
        VESSELS.forEach((v, i) => {
          const b = boxes[i];
          // Brownian steps: each one √(2D·dt) in size, so the spot grows as √t
          const step = Math.sqrt(2 * v.D * dt);
          for (const p of b.dye) {
            p[0] += gauss() * step;
            p[1] += gauss() * step;
            if (p[0] < v.x0 + 6) p[0] = 2 * (v.x0 + 6) - p[0];
            if (p[0] > v.x1 - 6) p[0] = 2 * (v.x1 - 6) - p[0];
            if (p[1] < VY0 + 6) p[1] = 2 * (VY0 + 6) - p[1];
            if (p[1] > VY1 - 6) p[1] = 2 * (VY1 - 6) - p[1];
          }
          const gs = Math.sqrt(2 * (v.D / 5) * dt);
          b.grain[0] = Math.max(v.x0 + 14, Math.min(v.x1 - 14, b.grain[0] + gauss() * gs));
          b.grain[1] = Math.max(VY0 + 14, Math.min(VY1 - 14, b.grain[1] + gauss() * gs));
          b.trail.push([b.grain[0], b.grain[1]]);
          if (b.trail.length > 240) b.trail.shift();
          for (const m of b.water) {
            m[0] += m[2] * dt;
            m[1] += m[3] * dt;
            if (m[0] < v.x0 + 4 || m[0] > v.x1 - 4) m[2] *= -1;
            if (m[1] < VY0 + 4 || m[1] > VY1 - 4) m[3] *= -1;
            if (Math.random() < 0.6 * dt) {
              const a = Math.random() * Math.PI * 2;
              const sp = Math.hypot(m[2], m[3]);
              m[2] = Math.cos(a) * sp;
              m[3] = Math.sin(a) * sp;
            }
          }
        });
      }
      s.report += dtRaw;
      if (s.report > 0.2) {
        s.report = 0;
        setShown({ t: s.t, cold: spread(boxes[0], VESSELS[0]), hot: spread(boxes[1], VESSELS[1]) });
      }

      drawStage(ctx, w, h);
      VESSELS.forEach((v, i) => {
        const b = boxes[i];
        const cx = (v.x0 + v.x1) / 2;
        // water, tinted by its temperature
        const wg = ctx.createLinearGradient(0, VY0, 0, VY1);
        wg.addColorStop(0, `rgba(${v.tint},0.06)`);
        wg.addColorStop(1, `rgba(${v.tint},0.14)`);
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.roundRect(v.x0, VY0, v.x1 - v.x0, VY1 - VY0, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,220,255,0.28)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // water molecules: fast and tiny
        ctx.fillStyle = `rgba(${v.tint},0.45)`;
        for (const [x, y] of b.water) {
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        // the dye, drawn as a soft cloud plus its particles
        ctx.globalCompositeOperation = 'lighter';
        for (const [x, y] of b.dye) {
          const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
          g.addColorStop(0, 'rgba(190,110,255,0.22)');
          g.addColorStop(1, 'rgba(190,110,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - 9, y - 9, 18, 18);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(225,190,255,0.9)';
        for (const [x, y] of b.dye) {
          ctx.beginPath();
          ctx.arc(x, y, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
        // a drop splash for the first moment
        if (s.splash < 0.8) {
          const k = s.splash / 0.8;
          ctx.strokeStyle = `rgba(225,190,255,${0.7 * (1 - k)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 8 + k * 50, 0, Math.PI * 2);
          ctx.stroke();
        }
        // a pollen grain shaken by the invisible molecules, with its zig-zag path
        ctx.strokeStyle = 'rgba(255,214,120,0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        b.trail.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        glow(ctx, b.grain[0], b.grain[1], 22, '255,200,110', 0.5);
        const gg = ctx.createRadialGradient(b.grain[0] - 3, b.grain[1] - 3, 1, b.grain[0], b.grain[1], 9);
        gg.addColorStop(0, '#FFF1C4');
        gg.addColorStop(1, '#D99A2B');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(b.grain[0], b.grain[1], 8, 0, Math.PI * 2);
        ctx.fill();

        // the concentration across the vessel: it starts as a spike and flattens out
        const bins = 36;
        const hist = new Array(bins).fill(0);
        for (const [x] of b.dye) hist[Math.max(0, Math.min(bins - 1, Math.floor(((x - v.x0) / (v.x1 - v.x0)) * bins)))]++;
        const peak = Math.max(...hist, 1);
        const base = 368;
        ctx.beginPath();
        ctx.moveTo(v.x0, base);
        hist.forEach((c, k) => {
          const x = v.x0 + ((k + 0.5) / bins) * (v.x1 - v.x0);
          ctx.lineTo(x, base - (c / Math.max(peak, N_DYE * 0.12)) * 56);
        });
        ctx.lineTo(v.x1, base);
        ctx.closePath();
        const pg = ctx.createLinearGradient(0, base - 56, 0, base);
        pg.addColorStop(0, 'rgba(190,110,255,0.7)');
        pg.addColorStop(1, 'rgba(190,110,255,0.08)');
        ctx.fillStyle = pg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(v.x0, base);
        ctx.lineTo(v.x1, base);
        ctx.stroke();

        pill(ctx, cx, VY0 + 18, `${v.T} °C · ${i ? (ru ? 'горячая' : 'hot') : ru ? 'холодная' : 'cold'}`, i ? '#FFB37A' : '#8FC4FF');
      });
      ctx.fillStyle = STAGE.soft;
      ctx.font = `500 11px ${STAGE.font}`;
      ctx.textAlign = 'left';
      ctx.fillText(ru ? 'концентрация краски поперёк сосуда' : 'dye concentration across the vessel', 26, 312);
    });
  }, [drop]);

  const ru = lang === 'ru';
  const ratio = shown.cold > 8 ? shown.hot / shown.cold : 0;
  return (
    <SimShell
      badge={ru ? '7 класс · Физика' : 'Grade 7 · Physics'}
      formula="σ = √(2Dt),  D ∝ T / η"
      title={ru ? 'Диффузия: в горячей воде краска расходится быстрее' : 'Diffusion: dye spreads faster in hot water'}
      actions={
        <>
          <Button variant="outline" size="sm" isIconOnly aria-label={playing ? (ru ? 'Пауза' : 'Pause') : ru ? 'Пуск' : 'Play'} onPress={() => setPlaying(!playing)}>
            {playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          </Button>
          <Button variant="outline" size="sm" className="font-semibold" onPress={() => setDrop((d) => d + 1)}>
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            {ru ? 'Капнуть снова' : 'New drop'}
          </Button>
        </>
      }
      readouts={[
        { label: ru ? 'Прошло' : 'Elapsed', value: `${Math.floor(shown.t)} ${ru ? 'с' : 's'}` },
        { label: ru ? 'Пятно в холодной' : 'Spot, cold', value: `${Math.round(shown.cold)}`, color: '#2B7BD6' },
        { label: ru ? 'Пятно в горячей' : 'Spot, hot', value: `${Math.round(shown.hot)}`, color: '#D9822B' },
        { label: ru ? 'Горячая быстрее в' : 'Hot is faster by', value: ratio ? `×${(ratio).toFixed(1).replace('.', ru ? ',' : '.')}` : '—', color: '#4A3BEB' },
      ]}
      controls={[
        {
          label: ru ? 'Скорость времени' : 'Time speed',
          value: `×${speed}`,
          input: <RangeSlider value={speed} onChange={(v) => setSpeed(v)} min={0.5} max={4} step={0.5} />,
          hint: ru
            ? 'Пятно растёт как √t: чтобы стать вдвое шире, ему нужно вчетверо больше времени. В горячей воде молекулы бьют чаще и сильнее, а вода менее вязкая — поэтому быстрее.'
            : 'The spot grows as √t: to get twice as wide it needs four times longer. In hot water the molecules hit harder and more often, and the water is less viscous, so it is faster.',
        },
      ]}
      insight={{
        title: ru ? 'Жёлтая пылинка' : 'The yellow grain',
        text: ru
          ? 'Это броуновское движение: пылинку толкают со всех сторон невидимые молекулы воды, и она дрожит по случайной ломаной. Сама краска расходится так же — без всякого перемешивания.'
          : 'This is Brownian motion: invisible water molecules knock the grain from every side and it jitters along a random zig-zag. The dye spreads the same way, with no stirring at all.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Два сосуда с водой, холодной и горячей, в которые капнули краску' : 'Two vessels of water, cold and hot, with a drop of dye in each'} />
    </SimShell>
  );
};
