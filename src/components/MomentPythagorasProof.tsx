import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, pill, runStage, STAGE } from '../lib/stage';

interface MomentPythagorasProofProps {
  lang: 'ru' | 'en';
}

type V = [number, number];
// each triangle: right-angle corner R, the end of its a-leg A, the end of its b-leg B
type Tri = [V, V, V];
const COLS = ['#9B8CFF', '#5FDDFF', '#FFB45E', '#6FE3A0'];

/** the two classic arrangements inside a square of side a + b */
function layouts(a: number, b: number): [Tri[], Tri[]] {
  const S = a + b;
  const one: Tri[] = [
    [[0, 0], [a, 0], [0, b]],
    [[S, 0], [S, a], [a, 0]],
    [[S, S], [b, S], [S, a]],
    [[0, S], [0, b], [b, S]],
  ];
  const two: Tri[] = [
    [[0, a], [a, a], [0, S]],
    [[a, 0], [a, a], [S, 0]],
    [[S, a], [S, 0], [a, a]],
    [[a, S], [0, S], [a, a]],
  ];
  return [one, two];
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const MomentPythagorasProof: React.FC<MomentPythagorasProofProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [target, setTarget] = useState(0);
  const live = useRef({ a, b, target, lang });
  live.current = { a, b, target, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { k: 0 };

    return runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const dir = L.target - s.k;
      s.k = still ? L.target : Math.abs(dir) < 0.001 ? L.target : s.k + Math.sign(dir) * Math.min(Math.abs(dir), dt / 1.6);
      const e = ease(s.k);
      const S = L.a + L.b;
      const unit = 300 / S;
      const ox = 250 - (S * unit) / 2;
      const oy = 30;
      const P = (p: V): V => [ox + p[0] * unit, oy + p[1] * unit];

      drawStage(ctx, w, h, { x: 250, y: 180 });
      // the big square and the uncovered regions
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(ox, oy, S * unit, S * unit);
      ctx.fill();
      ctx.stroke();
      // c² shows where the triangles leave a tilted square; a² and b² where they pair up
      const cSq: V[] = [[L.a, 0], [S, L.a], [L.b, S], [0, L.b]];
      ctx.fillStyle = `rgba(139,124,255,${0.35 * (1 - e)})`;
      ctx.beginPath();
      cSq.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p))));
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(95,221,255,${0.3 * e})`;
      ctx.fillRect(ox, oy, L.a * unit, L.a * unit);
      ctx.fillStyle = `rgba(255,180,94,${0.3 * e})`;
      ctx.fillRect(ox + L.a * unit, oy + L.a * unit, L.b * unit, L.b * unit);

      // the triangles move as rigid cards: slide, turn, and flip over when they must
      const [one, two] = layouts(L.a, L.b);
      for (let i = 0; i < 4; i++) {
        const [r1, a1, b1] = one[i];
        const [r2, a2, b2] = two[i];
        const ang = (r: V, p: V) => Math.atan2(p[1] - r[1], p[0] - r[0]);
        const hand = (r: V, p: V, q: V) => Math.sign((p[0] - r[0]) * (q[1] - r[1]) - (p[1] - r[1]) * (q[0] - r[0]));
        let t1 = ang(r1, a1);
        let t2 = ang(r2, a2);
        while (t2 - t1 > Math.PI) t2 -= Math.PI * 2;
        while (t1 - t2 > Math.PI) t2 += Math.PI * 2;
        const th = t1 + (t2 - t1) * e;
        const hd = hand(r1, a1, b1) * (1 - e) + hand(r2, a2, b2) * e;
        const R: V = [r1[0] + (r2[0] - r1[0]) * e, r1[1] + (r2[1] - r1[1]) * e];
        const A: V = [R[0] + Math.cos(th) * L.a, R[1] + Math.sin(th) * L.a];
        const B: V = [R[0] - Math.sin(th) * L.b * hd, R[1] + Math.cos(th) * L.b * hd];
        ctx.fillStyle = COLS[i];
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.moveTo(...P(R));
        ctx.lineTo(...P(A));
        ctx.lineTo(...P(B));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(11,14,24,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // labels for the free areas
      if (e < 0.3) {
        const c = Math.sqrt(L.a * L.a + L.b * L.b);
        pill(ctx, ...P([S / 2, S / 2]), `c² = ${Math.round(c * c * 100) / 100}`, '#C9C2FF');
      }
      if (e > 0.7) {
        pill(ctx, ...P([L.a / 2, L.a / 2]), `a² = ${L.a * L.a}`, '#9FEAFF');
        pill(ctx, ...P([L.a + L.b / 2, L.a + L.b / 2]), `b² = ${L.b * L.b}`, '#FFD0A0');
      }

      // the conclusion on the right
      ctx.fillStyle = STAGE.ink;
      ctx.font = `700 22px ${STAGE.font}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(ru ? 'Треугольники те же,' : 'Same four triangles,', 470, 120);
      ctx.fillText(ru ? 'квадрат тот же —' : 'same big square,', 470, 152);
      ctx.fillText(ru ? 'значит и свободное' : 'so the uncovered', 470, 184);
      ctx.fillText(ru ? 'место одинаково:' : 'area is the same:', 470, 216);
      ctx.fillStyle = '#B3A9FF';
      ctx.font = `800 30px ${STAGE.font}`;
      ctx.fillText('a² + b² = c²', 470, 268);
    });
  }, []);

  const ru = lang === 'ru';
  const c = Math.sqrt(a * a + b * b);
  const num = (x: number) => (ru ? String(Math.round(x * 100) / 100).replace('.', ',') : String(Math.round(x * 100) / 100));
  return (
    <SimShell
      badge={ru ? '8 класс · Геометрия' : 'Grade 8 · Geometry'}
      formula="a² + b² = c²"
      title={ru ? 'Теорема Пифагора: доказательство перестановкой' : "Pythagoras' theorem: a proof by rearranging"}
      actions={
        <Button size="sm" className="font-semibold" onPress={() => setTarget(target ? 0 : 1)}>
          <Shuffle className="w-4 h-4" strokeWidth={2} />
          {ru ? 'Переставить треугольники' : 'Rearrange the triangles'}
        </Button>
      }
      readouts={[
        { label: 'a²', value: num(a * a), color: '#1E88C8' },
        { label: 'b²', value: num(b * b), color: '#B7791F' },
        { label: 'a² + b²', value: num(a * a + b * b), color: '#4A3BEB' },
        { label: 'c', value: num(c), color: '#4A3BEB' },
      ]}
      controls={[
        { label: ru ? 'Катет a' : 'Leg a', value: String(a), color: '#1E88C8', input: <RangeSlider value={a} onChange={setA} min={1} max={6} /> },
        { label: ru ? 'Катет b' : 'Leg b', value: String(b), color: '#B7791F', input: <RangeSlider value={b} onChange={setB} min={1} max={6} />, hint: ru ? 'Меняй катеты — доказательство работает для любого прямоугольного треугольника.' : 'Change the legs: the proof works for any right triangle.' },
      ]}
      insight={{
        title: ru ? 'Проверка на практике' : 'A practical check',
        text: ru
          ? 'Строители так проверяют прямой угол: отмеряют 3 и 4 метра по сторонам — если между концами ровно 5 метров, угол прямой. 3² + 4² = 9 + 16 = 25 = 5².'
          : 'Builders check a right angle this way: measure 3 m and 4 m along the sides; if the ends are exactly 5 m apart, the angle is right. 3² + 4² = 9 + 16 = 25 = 5².',
      }}
    >
      <canvas ref={canvasRef} width={800} height={360} className="block w-full h-auto" aria-label={ru ? 'Четыре треугольника в квадрате переставляются' : 'Four triangles rearranged inside a square'} />
    </SimShell>
  );
};
