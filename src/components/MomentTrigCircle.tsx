import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { approach, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentTrigCircleProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×380): the unit circle on the left, sine and cosine unrolled on the right
const CX = 190;
const CY = 190;
const R = 130;
const GX0 = 360;
const GX1 = 780;
const SIN = '#8B7CFF';
const COS = '#3DD6FF';

// exact values at the angles school asks about
const EXACT: Record<number, [string, string]> = {
  0: ['0', '1'], 30: ['1/2', '√3/2'], 45: ['√2/2', '√2/2'], 60: ['√3/2', '1/2'], 90: ['1', '0'],
  120: ['√3/2', '−1/2'], 135: ['√2/2', '−√2/2'], 150: ['1/2', '−√3/2'], 180: ['0', '−1'],
  210: ['−1/2', '−√3/2'], 225: ['−√2/2', '−√2/2'], 240: ['−√3/2', '−1/2'], 270: ['−1', '0'],
  300: ['−√3/2', '1/2'], 315: ['−√2/2', '√2/2'], 330: ['−1/2', '√3/2'], 360: ['0', '1'],
};
const RAD: Record<number, string> = { 0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π', 210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2', 300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π' };
const fmt = (x: number, ru: boolean) => (ru ? x.toFixed(3).replace('.', ',') : x.toFixed(3));

export const MomentTrigCircle: React.FC<MomentTrigCircleProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deg, setDeg] = useState(45);
  const [spin, setSpin] = useState(false);
  const [shown, setShown] = useState(45);

  const live = useRef({ deg, spin, lang, dragging: false, dragTh: 0, fromSlider: 0 });
  live.current.spin = spin;
  live.current.lang = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { th: (45 * Math.PI) / 180, report: 0, lastSlider: live.current.fromSlider };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 800, y: ((e.clientY - r.top) / r.height) * 380 };
    };
    const angleAt = (p: { x: number; y: number }) => {
      const a = Math.atan2(-(p.y - CY), p.x - CX);
      return a < 0 ? a + Math.PI * 2 : a;
    };
    const down = (e: PointerEvent) => {
      const p = local(e);
      if (Math.abs(Math.hypot(p.x - CX, p.y - CY) - R) < 40) {
        live.current.dragging = true;
        live.current.dragTh = angleAt(p);
        setSpin(false);
        live.current.spin = false;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      if (live.current.dragging) {
        let a = angleAt(p);
        // snap gently to the special angles
        const d = (a * 180) / Math.PI;
        const near = Math.round(d / 15) * 15;
        if (Math.abs(d - near) < 2.5 && EXACT[near % 360] !== undefined) a = (near * Math.PI) / 180;
        live.current.dragTh = a;
      }
      canvas.style.cursor = live.current.dragging ? 'grabbing' : Math.abs(Math.hypot(p.x - CX, p.y - CY) - R) < 40 ? 'grab' : 'default';
    };
    const up = () => {
      live.current.dragging = false;
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const stop = runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';

      // where the angle should be: the finger, the slider, or a steady spin
      if (L.dragging) {
        let target = L.dragTh;
        if (target - s.th > Math.PI) target -= Math.PI * 2;
        if (s.th - target > Math.PI) target += Math.PI * 2;
        s.th = approach(s.th, target, dt, 0.05);
      } else if (L.spin && !still) s.th += 0.7 * dt;
      else {
        const target = (L.deg * Math.PI) / 180;
        if (s.lastSlider !== L.fromSlider) s.th = approach(s.th, target, dt, still ? 0.001 : 0.12);
        if (Math.abs(s.th - target) < 1e-3) s.lastSlider = L.fromSlider;
      }
      s.th = ((s.th % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const th = s.th;
      const sn = Math.sin(th);
      const cs = Math.cos(th);
      s.report += dt;
      if (s.report > 0.08) {
        s.report = 0;
        setShown((th * 180) / Math.PI);
      }

      drawStage(ctx, w, h, { x: CX, y: CY });
      const px = CX + R * cs;
      const py = CY - R * sn;

      // axes and the circle
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX - R - 24, CY);
      ctx.lineTo(GX1, CY);
      ctx.moveTo(CX, CY - R - 24);
      ctx.lineTo(CX, CY + R + 24);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,210,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.stroke();
      // ticks at the special angles
      for (const d of Object.keys(EXACT).map(Number)) {
        const a = (d * Math.PI) / 180;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(CX + R * Math.cos(a), CY - R * Math.sin(a), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // the swept angle
      ctx.fillStyle = 'rgba(139,124,255,0.14)';
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, 0, -th, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,140,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CX, CY, 30, 0, -th, true);
      ctx.stroke();

      // the radius, and its two shadows: cos on the x-axis, sin straight up
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.strokeStyle = COS;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(px, CY);
      ctx.stroke();
      ctx.strokeStyle = SIN;
      ctx.beginPath();
      ctx.moveTo(px, CY);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // the graphs: the full curves faint, the part already travelled bright
      const xOf = (a: number) => GX0 + (a / (Math.PI * 2)) * (GX1 - GX0);
      for (const [fn, col, alpha] of [[Math.cos, COS, 0.45], [Math.sin, SIN, 1]] as const) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const a = (i / 120) * Math.PI * 2;
          const y = CY - R * fn(a);
          if (i) ctx.lineTo(xOf(a), y);
          else ctx.moveTo(xOf(a), y);
        }
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3;
        ctx.beginPath();
        const n = Math.max(1, Math.round((th / (Math.PI * 2)) * 120));
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * th;
          const y = CY - R * fn(a);
          if (i) ctx.lineTo(xOf(a), y);
          else ctx.moveTo(xOf(a), y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // π marks under the graph
      ctx.fillStyle = STAGE.soft;
      ctx.font = `500 11px ${STAGE.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ['π/2', 'π', '3π/2', '2π'].forEach((lab, i) => ctx.fillText(lab, xOf(((i + 1) * Math.PI) / 2), CY + R + 8));

      // the link: the height of the point is the height of the sine graph
      const gx = xOf(th);
      const gy = CY - R * sn;
      ctx.strokeStyle = 'rgba(139,124,255,0.55)';
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      glow(ctx, gx, gy, 18, '139,124,255', 0.7);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(gx, gy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // the point itself
      glow(ctx, px, py, 30, '255,255,255', 0.35);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = SIN;
      ctx.lineWidth = 3;
      ctx.stroke();

      // labels on the shadows
      const d = Math.round((th * 180) / Math.PI);
      const ex = EXACT[d % 360 === 0 && d !== 0 ? 360 : d];
      pill(ctx, CX + (R * cs) / 2, CY + (sn >= 0 ? 18 : -18), `cos = ${ex ? ex[1] : fmt(cs, ru)}`, COS);
      pill(ctx, px + (cs >= 0 ? 12 : -12), CY - (R * sn) / 2, `sin = ${ex ? ex[0] : fmt(sn, ru)}`, '#B3A9FF', cs >= 0 ? 'left' : 'right');
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
  const d = Math.round(shown) % 360;
  const th = (shown * Math.PI) / 180;
  return (
    <SimShell
      badge={ru ? '9–10 класс · Алгебра' : 'Grades 9–10 · Algebra'}
      formula="sin²θ + cos²θ = 1"
      title={ru ? 'Единичная окружность: синус и косинус — это тени точки' : 'The unit circle: sine and cosine are the shadows of a point'}
      actions={
        <Button variant={spin ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setSpin(!spin)}>
          {spin ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          {spin ? (ru ? 'Остановить' : 'Stop') : ru ? 'Вращать' : 'Spin'}
        </Button>
      }
      readouts={[
        { label: ru ? 'Угол' : 'Angle', value: `${d}° = ${RAD[d] ?? (ru ? th.toFixed(2).replace('.', ',') : th.toFixed(2))}`, color: '#B7791F' },
        { label: 'sin θ', value: EXACT[d]?.[0] ?? fmt(Math.sin(th), ru), color: '#4A3BEB' },
        { label: 'cos θ', value: EXACT[d]?.[1] ?? fmt(Math.cos(th), ru), color: '#1E88C8' },
        { label: 'sin² + cos²', value: '1', color: '#1A8F50' },
      ]}
      controls={[
        {
          label: ru ? 'Угол θ' : 'Angle θ',
          value: `${d}°`,
          color: '#B7791F',
          input: (
            <RangeSlider
              value={d}
              onChange={(v) => {
                setSpin(false);
                setDeg(v);
                live.current.spin = false;
                live.current.deg = v;
                live.current.fromSlider++;
              }}
              min={0}
              max={360}
              step={5}
            />
          ),
          hint: ru
            ? 'Или тяни точку по окружности: у 30°, 45°, 60° и других «красивых» углов она прилипает и показывает точные значения.'
            : 'Or drag the point round the circle: at 30°, 45°, 60° and the other special angles it snaps and shows exact values.',
        },
      ]}
      insight={{
        title: ru ? 'Почему синус — волна' : 'Why the sine is a wave',
        text: ru
          ? 'Высота точки на окружности и есть синус. Пока точка бежит по кругу, её высота поднимается и опускается — справа это разворачивается в синусоиду. Тень на горизонтальной оси — косинус.'
          : 'The height of the point on the circle is the sine. As the point runs round, its height rises and falls, and on the right that unrolls into a sine wave. Its shadow on the horizontal axis is the cosine.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto touch-pan-y" aria-label={ru ? 'Единичная окружность и графики синуса и косинуса' : 'The unit circle with sine and cosine graphs'} />
    </SimShell>
  );
};
