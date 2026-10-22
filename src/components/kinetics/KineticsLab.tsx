import { Check } from '../ui/Check';
import { RangeSlider } from '../ui/RangeSlider';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { BOX_H, count, EA, EA_CAT, makeWorld, Params, Q, R_BIG, R_SMALL, spawn, step, World } from './kinetics';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
const COL = { a: '#E5484D', b: '#3B6BFF', ab: '#A35BE0' };
const MAX_W = 600;

export const KineticsLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [params, setParams] = useState<Params>({ T: 3, catalyst: false, width: MAX_W });
  const [run, setRun] = useState(true);
  const [, setTick] = useState(0);
  const world = useRef<World>(makeWorld(params));
  const box = useRef<HTMLCanvasElement>(null);
  const graph = useRef<HTMLCanvasElement>(null);
  const rates = useRef({ fwd: 0, back: 0, t: performance.now(), f0: 0, b0: 0 });
  const live = useRef({ params, run });
  live.current = { params, run };

  useEffect(() => progress.recordLab('sandbox-kinetics'), []);

  useEffect(() => {
    const bc = box.current;
    const gc = graph.current;
    if (!bc || !gc) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      bc.width = Math.round(bc.clientWidth * dpr);
      bc.height = Math.round((bc.clientWidth * BOX_H * dpr) / MAX_W);
      gc.width = Math.round(gc.clientWidth * dpr);
      gc.height = Math.round(gc.clientHeight * dpr);
    });
    ro.observe(bc);
    ro.observe(gc);
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const { params: p, run: r } = live.current;
      const w = world.current;
      if (r) for (let i = 0; i < 3; i++) step(w, p);
      const dpr = window.devicePixelRatio || 1;
      drawBox(bc, w, p, dpr);
      if (++frame % 8 === 0) {
        drawGraph(gc, w, dpr);
        const now = performance.now();
        const rr = rates.current;
        if (now - rr.t > 1000) {
          rr.fwd = ((w.fwd - rr.f0) * 1000) / (now - rr.t);
          rr.back = ((w.back - rr.b0) * 1000) / (now - rr.t);
          rr.f0 = w.fwd;
          rr.b0 = w.back;
          rr.t = now;
        }
        setTick((n) => n + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const set = (patch: Partial<Params>) => {
    const next = { ...params, ...patch };
    // squeezing the box: pull particles inside the new wall
    if (patch.width !== undefined) for (const q of world.current.ps) q.x = Math.min(q.x, next.width - R_BIG);
    setParams(next);
  };
  const c = count(world.current);
  // concentrations per unit area so that changing the volume shows up in K
  const area = (params.width * BOX_H) / (MAX_W * BOX_H);
  const K = c.a && c.b ? ((c.ab / area) / ((c.a / area) * (c.b / area))) * 10 : null;
  const kelvin = Math.round(params.T * 150);
  const r = rates.current;

  useScreenDetail(
    'lab',
    `Температура ${kelvin} K, объём сосуда ${Math.round((params.width / MAX_W) * 100)}%, катализатор ${params.catalyst ? 'добавлен' : 'нет'}. Сейчас молекул: A ${c.a}, B ${c.b}, AB ${c.ab}. Скорость прямой реакции ${r.fwd.toFixed(1)}/с, обратной ${r.back.toFixed(1)}/с. Реакция экзотермическая.`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Скорость реакции и химическое равновесие', 'Reaction rate and chemical equilibrium')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('Молекулы A и B летают и сталкиваются. Реагирует только удачное столкновение — с энергией выше энергии активации. Продукт AB может распасться обратно, и скоро скорости прямой и обратной реакции сравняются: это равновесие.', 'A and B molecules fly around and collide. Only a collision with enough energy (above the activation energy) reacts. AB can fall apart again, and soon the forward and reverse rates match: that is equilibrium.')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126] bg-[#0B0D12]">
            <canvas ref={box} className="block w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="text-sm font-medium" onPress={() => setRun(!run)}>
              {run ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {run ? L('Пауза', 'Pause') : L('Пуск', 'Run')}
            </Button>
            {(
              [
                [0, 'A', COL.a],
                [1, 'B', COL.b],
                [2, 'AB', COL.ab],
              ] as const
            ).map(([t, name, color]) => (
              <Button variant="outline" className="text-sm" key={name} onPress={() => spawn(world.current, t, 20, params)}>
                <Plus className="w-4 h-4" />
                20 <b style={{ color }}>{name}</b>
              </Button>
            ))}
            <Button variant="outline" className="text-sm" onPress={() => {
                const p = { T: 3, catalyst: false, width: MAX_W };
                world.current = makeWorld(p);
                setParams(p);
              }}>
              <RotateCcw className="w-4 h-4" />
              {L('Заново', 'Restart')}
            </Button>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Число молекул', 'Molecule count')}</h3>
              <span className="text-sm font-mono">
                <b style={{ color: COL.a }}>A {c.a}</b> · <b style={{ color: COL.b }}>B {c.b}</b> · <b style={{ color: COL.ab }}>AB {c.ab}</b>
              </span>
            </div>
            <canvas ref={graph} className="w-full h-36 block" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Условия', 'Conditions')}</h3>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                {L('Температура', 'Temperature')} <span className="font-mono text-ink">{kelvin} K</span>
              </span>
              <RangeSlider value={params.T} onChange={(v) => set({ T: v })} min={1.2} max={6} step={0.1} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                {L('Объём сосуда (давление)', 'Vessel volume (pressure)')} <span className="font-mono text-ink">{Math.round((params.width / MAX_W) * 100)}%</span>
              </span>
              <RangeSlider value={params.width} onChange={(v) => set({ width: v })} min={200} max={MAX_W} step={10} />
            </label>
            <Check checked={params.catalyst} onChange={(v) => set({ catalyst: v })}>{L('Добавить катализатор', 'Add a catalyst')}</Check>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm flex flex-col gap-1.5">
            <div className="text-center overflow-x-auto mb-1">
              <Formula tex={`\\mathrm{A + B \\rightleftharpoons AB} + Q`} display />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">{L('Прямая реакция', 'Forward')}</span>
              <span className="font-mono text-ink">{r.fwd.toFixed(1)} {L('/с', '/s')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">{L('Обратная реакция', 'Reverse')}</span>
              <span className="font-mono text-ink">{r.back.toFixed(1)} {L('/с', '/s')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">
                <Formula tex="K = \frac{[\mathrm{AB}]}{[\mathrm{A}]\,[\mathrm{B}]}" />
              </span>
              <span className="font-mono text-ink self-center">{K === null ? '—' : K.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink-3 mt-1">{Math.abs(r.fwd - r.back) < Math.max(1.5, r.fwd * 0.3) && r.fwd > 0 ? L('Скорости почти равны — система в равновесии.', 'The rates are nearly equal: the system is at equilibrium.') : L('Скорости ещё не сравнялись — равновесие устанавливается.', 'The rates are not equal yet: equilibrium is being reached.')}</p>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Энергетическая диаграмма', 'Energy diagram')}</h3>
            <svg viewBox="0 0 280 150" className="w-full">
              <line x1="20" y1="10" x2="20" y2="140" stroke="#C9CDD3" />
              <text x="6" y="14" fontSize="10" fill="#8C8F98">E</text>
              <path d={`M20 70 H70 C 110 70, 110 ${70 - EA * 11}, 140 ${70 - EA * 11} C 170 ${70 - EA * 11}, 170 ${70 + Q * 7}, 210 ${70 + Q * 7} H270`} fill="none" stroke="#16171A" strokeWidth="2" />
              {params.catalyst && <path d={`M20 70 H70 C 110 70, 110 ${70 - EA_CAT * 11}, 140 ${70 - EA_CAT * 11} C 170 ${70 - EA_CAT * 11}, 170 ${70 + Q * 7}, 210 ${70 + Q * 7} H270`} fill="none" stroke="#30A46C" strokeWidth="2" strokeDasharray="5 4" />}
              <line x1="140" y1="70" x2="140" y2={70 - EA * 11} stroke="#E5484D" strokeDasharray="3 3" />
              <text x="146" y={70 - EA * 5} fontSize="10" fill="#E5484D">Eₐ</text>
              <text x="30" y="64" fontSize="10" fill="#16171A">A + B</text>
              <text x="230" y={64 + Q * 7} fontSize="10" fill="#16171A">AB</text>
              <text x="200" y="40" fontSize="10" fill="#8C8F98">{L('ход реакции →', 'reaction →')}</text>
              {params.catalyst && (
                <text x="74" y="140" fontSize="10" fill="#1E7A4C">
                  {L('с катализатором Eₐ ниже', 'catalyst: lower Eₐ')}
                </text>
              )}
            </svg>
            <p className="text-xs text-ink-2 mt-1">
              {L('Реакция экзотермическая: при нагревании равновесие смещается влево, при сжатии — вправо (в сторону меньшего числа молекул). Катализатор ускоряет обе реакции и не смещает равновесие.', 'The reaction is exothermic: heating shifts equilibrium to the left, compressing shifts it to the right (fewer molecules). A catalyst speeds up both directions and does not move the equilibrium.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function drawBox(cv: HTMLCanvasElement, w: World, p: Params, dpr: number) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const s = cv.width / MAX_W;
  ctx.fillStyle = '#0B0D12';
  ctx.fillRect(0, 0, cv.width, cv.height);
  // the part of the vessel cut off by the piston
  ctx.fillStyle = '#1A1D24';
  ctx.fillRect(p.width * s, 0, cv.width - p.width * s, cv.height);
  ctx.fillStyle = '#5B5F68';
  ctx.fillRect(p.width * s, 0, 6 * dpr, cv.height);
  // warm tint for hot, cold tint for cold
  const heat = (p.T - 3) / 3;
  if (Math.abs(heat) > 0.05) {
    ctx.fillStyle = heat > 0 ? `rgba(229,72,77,${0.12 * heat})` : `rgba(59,107,255,${-0.12 * heat})`;
    ctx.fillRect(0, 0, p.width * s, cv.height);
  }
  for (const q of w.ps) {
    if (q.t === 2) {
      const a = Math.atan2(q.vy, q.vx);
      const dx = Math.cos(a) * 4 * s;
      const dy = Math.sin(a) * 4 * s;
      ctx.fillStyle = COL.a;
      ctx.beginPath();
      ctx.arc(q.x * s - dx, q.y * s - dy, R_SMALL * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COL.b;
      ctx.beginPath();
      ctx.arc(q.x * s + dx, q.y * s + dy, R_SMALL * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COL.ab;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(q.x * s, q.y * s, R_BIG * s + 3 * dpr, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = q.t === 0 ? COL.a : COL.b;
      ctx.beginPath();
      ctx.arc(q.x * s, q.y * s, R_SMALL * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGraph(cv: HTMLCanvasElement, w: World, dpr: number) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, cv.width, cv.height);
  const h = w.history;
  if (h.length < 2) return;
  const max = Math.max(20, ...h.map((d) => Math.max(d.a, d.b, d.ab)));
  const X = (i: number) => (i / 299) * cv.width;
  const line = (vals: number[], color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    vals.forEach((v, i) => {
      const y = cv.height - 4 * dpr - (v / max) * (cv.height - 10 * dpr);
      if (i) ctx.lineTo(X(i), y);
      else ctx.moveTo(X(i), y);
    });
    ctx.stroke();
  };
  line(h.map((d) => d.a), COL.a);
  line(h.map((d) => d.b), COL.b);
  line(h.map((d) => d.ab), COL.ab);
}

export default KineticsLab;
