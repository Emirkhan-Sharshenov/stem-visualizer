import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { fitCanvas } from '../lib/canvas';
import { clamp01, drawStage, glow, mixRgb, pill, runStage, seeded, STAGE } from '../lib/stage';

interface MomentStatesOfMatterProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×380): a glass vessel on a heater on the left, the heating curve on the right
const VX0 = 50;
const VX1 = 510;
const VY0 = 36;
const VY1 = 330;
const ROWS = 5;
const COLS = 14;
const SP = 30;
// energy bookkeeping in "degrees": melting and boiling each take a fixed amount of heat while T stands still
const MELT = 60;
const BOIL = 100;
const tempOf = (E: number) => (E < 0 ? E : E < MELT ? 0 : E < MELT + 100 ? E - MELT : E < MELT + 100 + BOIL ? 100 : E - MELT - BOIL);
const energyOf = (T: number) => (T < 0 ? T : T <= 100 ? T + MELT : T + MELT + BOIL);

interface Mol {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  a: number;
  va: number;
  meltAt: number;
  boilAt: number;
}

export const MomentStatesOfMatter: React.FC<MomentStatesOfMatterProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heater, setHeater] = useState(-20);
  const [playing, setPlaying] = useState(true);
  const [shown, setShown] = useState({ T: -20, phase: 'solid' as 'solid' | 'melting' | 'liquid' | 'boiling' | 'gas' });

  const live = useRef({ heater, playing, lang });
  live.current = { heater, playing, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // ice lattice at the bottom of the vessel; the top layers melt first
    const mols: Mol[] = [];
    const left = (VX0 + VX1) / 2 - ((COLS - 1) * SP) / 2;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = mols.length;
        const ox = left + c * SP + (r % 2 ? SP / 2 - 6 : 0);
        const oy = VY1 - 14 - r * (SP * 0.86);
        mols.push({ x: ox, y: oy, vx: 0, vy: 0, ox, oy, a: (c + r) % 2 ? 0.5 : -0.5, va: 0, meltAt: 0.55 * seeded(i) + 0.45 * (1 - (r + 1) / ROWS), boilAt: seeded(i, 7) });
      }
    // normalise thresholds to 0…1
    const mMax = Math.max(...mols.map((m) => m.meltAt));
    mols.forEach((m) => (m.meltAt /= mMax));

    const s = { E: energyOf(live.current.heater), hist: [] as number[], histClock: 0, report: 0 };

    return runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const run = L.playing && !still;

      // heat flows from the heater into the water, faster when the gap is bigger
      const T0 = tempOf(s.E);
      if (still) s.E = energyOf(L.heater);
      else if (run) s.E += Math.max(-70, Math.min(70, 0.7 * (L.heater - T0))) * dt;
      const T = tempOf(s.E);
      const melt = clamp01(s.E / MELT);
      const boil = clamp01((s.E - MELT - 100) / BOIL);
      const phase = s.E < 0 ? 'solid' : s.E < MELT ? 'melting' : s.E < MELT + 100 ? 'liquid' : s.E < MELT + 100 + BOIL ? 'boiling' : 'gas';

      if (run) {
        s.histClock += dt;
        if (s.histClock > 0.2) {
          s.histClock = 0;
          s.hist.push(T);
          if (s.hist.length > 110) s.hist.shift();
        }
      }
      s.report += dt;
      if (s.report > 0.15) {
        s.report = 0;
        setShown({ T, phase });
      }

      // physics: a solid springs round its lattice site, a liquid slides under gravity and sticks, a gas flies
      const kick = Math.sqrt(Math.max(1, T + 45));
      // random thermal kicks scale with √dt so the jiggle is the same at any frame rate
      const rt = Math.sqrt(dt);
      const mode = (m: Mol) => (m.boilAt < boil ? 2 : m.meltAt < melt ? 1 : 0);
      if (run) {
        for (const m of mols) {
          const md = mode(m);
          if (md === 0) {
            m.vx += (220 * (m.ox - m.x) - 16 * m.vx) * dt + (Math.random() - 0.5) * kick * 120 * rt;
            m.vy += (220 * (m.oy - m.y) - 16 * m.vy) * dt + (Math.random() - 0.5) * kick * 120 * rt;
            m.va += (-m.va * 6 + (Math.random() - 0.5) * 4) * dt;
          } else if (md === 1) {
            m.vy += 260 * dt;
            m.vx += (Math.random() - 0.5) * kick * 50 * rt;
            m.vy += (Math.random() - 0.5) * kick * 50 * rt;
            m.vx *= 1 - 3 * dt;
            m.vy *= 1 - 3 * dt;
            m.va += ((Math.random() - 0.5) * 30 - m.va * 2) * dt;
          } else {
            const sp = Math.hypot(m.vx, m.vy) || 1;
            const want = 120 + 2.4 * (T + 40);
            m.vx += (m.vx / sp) * (want - sp) * 1.5 * dt + (Math.random() - 0.5) * 320 * rt;
            m.vy += (m.vy / sp) * (want - sp) * 1.5 * dt + (Math.random() - 0.5) * 320 * rt - 30 * dt;
            m.va += ((Math.random() - 0.5) * 60 - m.va) * dt;
          }
        }
      }

      // neighbours push apart when too close; solids and liquids also hold together (hydrogen bonds)
      const bonds: [number, number, number][] = [];
      for (let i = 0; i < mols.length; i++) {
        const a = mols[i];
        const ma = mode(a);
        for (let j = i + 1; j < mols.length; j++) {
          const b = mols[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 900) continue;
          const d = Math.sqrt(d2) || 0.01;
          const mb = mode(b);
          if (run && d < 17) {
            const f = (17 - d) * 70 * dt;
            a.vx -= (dx / d) * f;
            a.vy -= (dy / d) * f;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
          } else if (run && ma === 1 && mb === 1 && d < 28) {
            const f = (d - 17) * 10 * dt;
            a.vx += (dx / d) * f;
            a.vy += (dy / d) * f;
            b.vx -= (dx / d) * f;
            b.vy -= (dy / d) * f;
          }
          if (ma < 2 && mb < 2 && d < 30) bonds.push([i, j, ma === 0 && mb === 0 ? 0.42 : 0.16 * (1 - (d - 17) / 13)]);
        }
      }
      if (run) {
        for (const m of mols) {
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.a += m.va * dt;
          if (!Number.isFinite(m.x + m.y + m.vx + m.vy + m.a)) Object.assign(m, { x: m.ox, y: m.oy, vx: 0, vy: 0, a: 0, va: 0 });
          const md = mode(m);
          const bounce = md === 2 ? -1 : -0.4;
          if (m.x < VX0 + 10) { m.x = VX0 + 10; m.vx *= bounce; }
          if (m.x > VX1 - 10) { m.x = VX1 - 10; m.vx *= bounce; }
          if (m.y > VY1 - 10) { m.y = VY1 - 10; m.vy *= bounce; }
          if (m.y < VY0 + 10) { m.y = VY0 + 10; m.vy *= md === 2 ? -1 : 0; }
        }
      }

      drawStage(ctx, w, h, { x: (VX0 + VX1) / 2, y: VY1 });

      // the heater: glows red while heating, frosts blue while cooling
      const push = L.heater - T;
      const hot = clamp01(push / 60);
      const cold = clamp01(-push / 60);
      glow(ctx, (VX0 + VX1) / 2, VY1 + 30, 260, '255,110,40', 0.35 * hot);
      glow(ctx, (VX0 + VX1) / 2, VY1 + 30, 260, '90,170,255', 0.3 * cold);
      ctx.fillStyle = `rgb(${mixRgb(mixRgb([40, 46, 64], [255, 110, 40], hot).split(',').map(Number) as [number, number, number], [110, 180, 255], cold)})`;
      ctx.beginPath();
      ctx.roundRect(VX0 - 6, VY1 + 8, VX1 - VX0 + 12, 12, 6);
      ctx.fill();

      // water level tint and the glass
      ctx.fillStyle = 'rgba(80,160,255,0.05)';
      ctx.fillRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
      for (const [i, j, a] of bonds) {
        ctx.strokeStyle = `rgba(120,200,255,${a})`;
        ctx.lineWidth = a > 0.3 ? 1.6 : 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(mols[i].x, mols[i].y);
        ctx.lineTo(mols[j].x, mols[j].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // molecules: an oxygen and two hydrogens at 104.5°, coloured by how fast they move
      for (const m of mols) {
        const sp = Math.hypot(m.vx, m.vy);
        const heat = clamp01(sp / 420 + (T + 30) / 400);
        const col = mixRgb([90, 170, 255], [255, 120, 60], heat);
        const ha = 0.91;
        for (const sgn of [-1, 1]) {
          const hx = m.x + Math.cos(m.a + Math.PI / 2 + sgn * ha) * 9;
          const hy = m.y + Math.sin(m.a + Math.PI / 2 + sgn * ha) * 9;
          ctx.fillStyle = '#EEF2FB';
          ctx.beginPath();
          ctx.arc(hx, hy, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
        const g = ctx.createRadialGradient(m.x - 2.5, m.y - 2.5, 1, m.x, m.y, 8);
        g.addColorStop(0, `rgb(${mixRgb([255, 255, 255], col.split(',').map(Number) as [number, number, number], 0.55)})`);
        g.addColorStop(1, `rgb(${col})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // glass walls with a highlight
      ctx.strokeStyle = 'rgba(200,220,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(VX0, VY0 - 6);
      ctx.lineTo(VX0, VY1);
      ctx.lineTo(VX1, VY1);
      ctx.lineTo(VX1, VY0 - 6);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(VX0 + 8, VY0 + 10);
      ctx.lineTo(VX0 + 8, VY1 - 40);
      ctx.stroke();

      const label = {
        solid: ru ? 'лёд: молекулы дрожат на местах' : 'ice: molecules shake in place',
        melting: ru ? 'плавится: T стоит на 0 °C' : 'melting: T stays at 0 °C',
        liquid: ru ? 'вода: связи рвутся и возникают' : 'water: bonds break and re-form',
        boiling: ru ? 'кипит: T стоит на 100 °C' : 'boiling: T stays at 100 °C',
        gas: ru ? 'пар: молекулы летают свободно' : 'steam: molecules fly free',
      }[phase];
      pill(ctx, (VX0 + VX1) / 2, VY0 + 20, label, phase === 'melting' || phase === 'boiling' ? '#FFC46B' : STAGE.ink);

      // the heating curve: temperature over the last ~20 s, with its two plateaus
      {
        const gx0 = 560;
        const gx1 = 772;
        const gy0 = 52;
        const gy1 = 300;
        const yOf = (v: number) => gy1 - ((v + 35) / 165) * (gy1 - gy0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath();
        ctx.roundRect(gx0 - 14, gy0 - 30, gx1 - gx0 + 28, gy1 - gy0 + 62, 16);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `600 12px ${STAGE.font}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(ru ? 'Температура воды T(t)' : 'Water temperature T(t)', gx0, gy0 - 10);
        ctx.setLineDash([4, 5]);
        for (const v of [0, 100]) {
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx0, yOf(v));
          ctx.lineTo(gx1, yOf(v));
          ctx.stroke();
          ctx.fillStyle = STAGE.soft;
          ctx.font = `500 11px ${STAGE.mono}`;
          ctx.fillText(`${v}°`, gx1 - 26, yOf(v) - 5);
        }
        ctx.setLineDash([]);
        const hs = s.hist.length ? s.hist : [T];
        ctx.strokeStyle = '#8B7CFF';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        hs.forEach((v, i) => {
          const x = gx1 - (hs.length - 1 - i) * ((gx1 - gx0) / 110);
          if (i === 0) ctx.moveTo(x, yOf(v));
          else ctx.lineTo(x, yOf(v));
        });
        ctx.stroke();
        const lastY = yOf(hs[hs.length - 1]);
        glow(ctx, gx1, lastY, 18, '139,124,255', 0.6);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(gx1, lastY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = STAGE.soft;
        ctx.font = `500 11px ${STAGE.font}`;
        ctx.fillText(ru ? 'время →' : 'time →', gx0, gy1 + 22);
      }
    });
  }, []);

  const ru = lang === 'ru';
  const phaseName = {
    solid: ru ? 'лёд' : 'ice',
    melting: ru ? 'тает' : 'melting',
    liquid: ru ? 'вода' : 'water',
    boiling: ru ? 'кипит' : 'boiling',
    gas: ru ? 'пар' : 'steam',
  }[shown.phase];
  const preset = (t: number, label: string) => (
    <Button variant={Math.abs(heater - t) < 1 ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setHeater(t)}>
      {label}
    </Button>
  );
  return (
    <SimShell
      badge={ru ? '7–8 класс · Физика' : 'Grades 7–8 · Physics'}
      formula={ru ? 'Q = λm,  Q = Lm' : 'Q = λm,  Q = Lm'}
      title={ru ? 'Агрегатные состояния: лёд → вода → пар' : 'States of matter: ice → water → steam'}
      actions={
        <>
          {preset(-20, ru ? 'Лёд −20°' : 'Ice −20°')}
          {preset(40, ru ? 'Вода 40°' : 'Water 40°')}
          {preset(120, ru ? 'Пар 120°' : 'Steam 120°')}
          <Button variant="outline" size="sm" isIconOnly aria-label={playing ? (ru ? 'Пауза' : 'Pause') : ru ? 'Пуск' : 'Play'} onPress={() => setPlaying(!playing)}>
            {playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4" strokeWidth={2} />}
          </Button>
        </>
      }
      readouts={[
        { label: ru ? 'Температура воды' : 'Water temperature', value: `${Math.round(shown.T)} °C`, color: shown.T < 0 ? '#22A8E0' : shown.T > 99 ? '#D9822B' : '#4A3BEB' },
        { label: ru ? 'Нагреватель' : 'Heater', value: `${heater} °C`, color: heater > shown.T ? '#D9822B' : '#22A8E0' },
        { label: ru ? 'Состояние' : 'State', value: phaseName, color: shown.phase === 'melting' || shown.phase === 'boiling' ? '#B7791F' : undefined },
      ]}
      controls={[
        {
          label: ru ? 'Температура нагревателя' : 'Heater temperature',
          value: `${heater} °C`,
          color: heater >= 0 ? '#D9822B' : '#22A8E0',
          input: <RangeSlider value={heater} onChange={(v) => setHeater(v)} min={-30} max={130} />,
          hint: ru
            ? 'Тепло передаётся не сразу: следи за графиком. При 0 °C и 100 °C температура стоит, пока идёт переход — тепло уходит на разрыв связей.'
            : 'Heat takes time to flow: watch the graph. At 0 °C and 100 °C the temperature stands still during the change: the heat goes into breaking bonds.',
        },
      ]}
      insight={{
        title: ru ? 'Частая ошибка' : 'Common mistake',
        text: ru
          ? 'Молекула H₂O во льду, в воде и в паре одна и та же. Меняется только то, как далеко молекулы друг от друга и как быстро они движутся.'
          : 'An H₂O molecule is the same in ice, water and steam. Only how far apart the molecules are and how fast they move changes.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Молекулы воды в сосуде на нагревателе и график температуры' : 'Water molecules in a vessel on a heater, and a temperature graph'} />
    </SimShell>
  );
};
