import React, { useEffect, useRef, useState } from 'react';
import { Flame, Pause, Play, Plus, RotateCcw, Target } from 'lucide-react';
import { BURROWS, DEFAULTS, GH, GW, makeWorld, Params, step, World } from './eco';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
const COL = { grass: '#30A46C', rabbit: '#5B8CFF', fox: '#F76B15' };

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; left: string; right: string; onChange: (v: number) => void }> = ({ label, value, min, max, step: st, left, right, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-ink-2">{label}</span>
    <input type="range" min={min} max={max} step={st} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" />
    <span className="flex justify-between text-[11px] text-ink-3">
      <span>{left}</span>
      <span>{right}</span>
    </span>
  </label>
);

function drawField(ctx: CanvasRenderingContext2D, w: World, cw: number, ch: number, burrows: number, dpr: number) {
  const s = cw / GW;
  ctx.fillStyle = '#2A2118';
  ctx.fillRect(0, 0, cw, ch);
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      const g = w.grass[y * GW + x];
      ctx.fillStyle = `rgb(${Math.round(70 - 30 * g)},${Math.round(60 + 110 * g)},${Math.round(35 + 20 * g)})`;
      ctx.fillRect(x * s, y * s, s + 0.5, s + 0.5);
    }
  for (const b of BURROWS.slice(0, burrows)) {
    ctx.fillStyle = 'rgba(40,25,10,0.85)';
    ctx.beginPath();
    ctx.ellipse(b.x * s, b.y * s, s * 1.2, s * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#E8ECF2';
  for (const a of w.rabbits) {
    ctx.beginPath();
    ctx.arc(a.x * s, a.y * s, Math.max(1.6 * dpr, s * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }
  for (const f of w.foxes) {
    const ang = Math.atan2(f.dy, f.dx);
    const r = Math.max(3 * dpr, s * 0.8);
    ctx.fillStyle = COL.fox;
    ctx.beginPath();
    ctx.moveTo(f.x * s + Math.cos(ang) * r, f.y * s + Math.sin(ang) * r);
    ctx.lineTo(f.x * s + Math.cos(ang + 2.5) * r * 0.8, f.y * s + Math.sin(ang + 2.5) * r * 0.8);
    ctx.lineTo(f.x * s + Math.cos(ang - 2.5) * r * 0.8, f.y * s + Math.sin(ang - 2.5) * r * 0.8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGraph(ctx: CanvasRenderingContext2D, w: World, cw: number, ch: number, dpr: number, lang: Lang) {
  ctx.clearRect(0, 0, cw, ch);
  const h = w.history;
  ctx.strokeStyle = '#E5E5E0';
  ctx.lineWidth = dpr;
  ctx.beginPath();
  ctx.moveTo(0, ch - 1);
  ctx.lineTo(cw, ch - 1);
  ctx.stroke();
  if (h.length < 2) return;
  const maxR = Math.max(50, ...h.map((d) => d.rabbits));
  const maxF = Math.max(10, ...h.map((d) => d.foxes));
  const X = (i: number) => (i / (h.length - 1)) * cw;
  const line = (vals: number[], max: number, color: string, wd: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = wd * dpr;
    ctx.beginPath();
    vals.forEach((v, i) => {
      const y = ch - 4 * dpr - (v / max) * (ch - 18 * dpr);
      if (i) ctx.lineTo(X(i), y);
      else ctx.moveTo(X(i), y);
    });
    ctx.stroke();
  };
  line(h.map((d) => d.grass), 1, 'rgba(48,164,108,0.6)', 1.5);
  line(h.map((d) => d.rabbits), maxR, COL.rabbit, 2.2);
  line(h.map((d) => d.foxes), maxF, COL.fox, 2.2);
  ctx.font = `${10 * dpr}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = COL.rabbit;
  ctx.fillText(`${lang === 'ru' ? 'зайцы' : 'rabbits'} (${lang === 'ru' ? 'макс' : 'max'} ${maxR})`, 6 * dpr, 12 * dpr);
  ctx.fillStyle = COL.fox;
  ctx.fillText(`${lang === 'ru' ? 'лисы' : 'foxes'} (${lang === 'ru' ? 'макс' : 'max'} ${maxF})`, 140 * dpr, 12 * dpr);
  ctx.fillStyle = COL.grass;
  ctx.fillText(lang === 'ru' ? 'трава' : 'grass', 260 * dpr, 12 * dpr);
}

export const EcoLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [run, setRun] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [, setTick] = useState(0);
  const world = useRef<World>(makeWorld());
  const field = useRef<HTMLCanvasElement>(null);
  const graph = useRef<HTMLCanvasElement>(null);
  const live = useRef({ params, run, speed });
  live.current = { params, run, speed };

  useEffect(() => progress.recordLab('sandbox-ecosystem'), []);

  useEffect(() => {
    const fc = field.current;
    const gc = graph.current;
    if (!fc || !gc) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      fc.width = Math.round(fc.clientWidth * dpr);
      fc.height = Math.round((fc.clientWidth * GH * dpr) / GW);
      gc.width = Math.round(gc.clientWidth * dpr);
      gc.height = Math.round(gc.clientHeight * dpr);
    });
    ro.observe(fc);
    ro.observe(gc);
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const s = live.current;
      if (s.run) for (let i = 0; i < s.speed; i++) step(world.current, s.params);
      const dpr = window.devicePixelRatio || 1;
      const fctx = fc.getContext('2d');
      if (fctx) drawField(fctx, world.current, fc.width, fc.height, s.params.burrows, dpr);
      if (++frame % 6 === 0) {
        const gctx = gc.getContext('2d');
        if (gctx) drawGraph(gctx, world.current, gc.width, gc.height, dpr, lang);
        setTick((n) => n + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lang]);

  const w = world.current;
  const set = (patch: Partial<Params>) => setParams((p) => ({ ...p, ...patch }));
  const event = (kind: 'rabbits' | 'foxes' | 'hunt' | 'fire') => {
    const ww = world.current;
    const r = ww.rand;
    if (kind === 'rabbits') for (let i = 0; i < 25; i++) ww.rabbits.push({ x: r() * GW, y: r() * GH, e: 6, age: 0, dx: 0, dy: 0 });
    if (kind === 'foxes') for (let i = 0; i < 6; i++) ww.foxes.push({ x: r() * GW, y: r() * GH, e: 14, age: 0, dx: 0, dy: 0 });
    if (kind === 'hunt') ww.foxes = ww.foxes.filter(() => r() < 0.5);
    if (kind === 'fire') {
      const cx = r() * GW;
      for (let i = 0; i < ww.grass.length; i++) if (Math.abs((i % GW) - cx) < GW / 4) ww.grass[i] = 0;
      ww.rabbits = ww.rabbits.filter((a) => Math.abs(a.x - cx) >= GW / 4 || r() < 0.5);
    }
  };

  // biomass pyramid (rough masses: grass per cell 0.5 kg, rabbit 2 kg, fox 6 kg)
  let grassKg = 0;
  for (let i = 0; i < w.grass.length; i++) grassKg += w.grass[i] * 0.5;
  const levels = [
    { name: L('Лисы — консументы II порядка', 'Foxes: secondary consumers'), kg: w.foxes.length * 6, color: COL.fox, n: w.foxes.length },
    { name: L('Зайцы — консументы I порядка', 'Rabbits: primary consumers'), kg: w.rabbits.length * 2, color: COL.rabbit, n: w.rabbits.length },
    { name: L('Трава — продуценты', 'Grass: producers'), kg: grassKg, color: COL.grass, n: null },
  ];
  const maxKg = Math.max(...levels.map((l) => l.kg), 1);
  const eff1 = w.flow.grassEaten > 0 ? (w.flow.rabbitGot > 0 ? (w.flow.foxGot / w.flow.rabbitGot) * 100 : 0) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Цепь питания: трава → заяц → лиса. Колебания численности хищника и жертвы', 'Food chain: grass → rabbit → fox. Predator–prey cycles')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L(
            'Каждый заяц и лиса живут сами по себе: едят, тратят энергию, размножаются и умирают. Смотри на график: сначала растёт число зайцев, за ними — лис, лисы съедают зайцев, а потом сами голодают. Так в природе колеблется численность рысей и зайцев.',
            'Every rabbit and fox lives on its own: eats, spends energy, breeds and dies. Watch the graph: rabbits boom, then foxes, foxes eat the rabbits and then starve. That is how lynx and hare numbers swing in nature.',
          )}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126]">
            <canvas ref={field} className="block w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setRun(!run)} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
              {run ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {run ? L('Пауза', 'Pause') : L('Пуск', 'Run')}
            </button>
            <button
              onClick={() => {
                world.current = makeWorld();
                setParams(DEFAULTS);
              }}
              className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {L('Заново', 'Restart')}
            </button>
            <div className="flex p-0.5 rounded-lg bg-muted border border-line">
              {[1, 2, 5].map((k) => (
                <button key={k} onClick={() => setSpeed(k)} className={`h-8 px-2.5 rounded-md text-xs font-mono cursor-pointer ${speed === k ? 'bg-surface border border-line text-ink' : 'text-ink-2'}`}>
                  ×{k}
                </button>
              ))}
            </div>
            <span className="text-sm text-ink-2 ml-auto">
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: '#E8ECF2', border: '1px solid #ccc' }} />
              {L('зайцы', 'rabbits')} <b className="font-mono text-ink">{w.rabbits.length}</b> ·{' '}
              <span className="inline-block w-2.5 h-2.5 mr-1 align-middle" style={{ background: COL.fox, clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }} />
              {L('лисы', 'foxes')} <b className="font-mono text-ink">{w.foxes.length}</b>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => event('rabbits')} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <Plus className="w-4 h-4" />
              {L('Выпустить 25 зайцев', 'Release 25 rabbits')}
            </button>
            <button onClick={() => event('foxes')} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <Plus className="w-4 h-4" />
              {L('Выпустить 6 лис', 'Release 6 foxes')}
            </button>
            <button onClick={() => event('hunt')} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <Target className="w-4 h-4" />
              {L('Охота на лис (−50%)', 'Fox hunt (−50%)')}
            </button>
            <button onClick={() => event('fire')} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <Flame className="w-4 h-4" />
              {L('Степной пожар', 'Wildfire')}
            </button>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Численность популяций', 'Population sizes')}</h3>
            <canvas ref={graph} className="w-full h-40 block" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Условия', 'Conditions')}</h3>
            <Slider label={L('Рост травы', 'Grass growth')} value={params.grow} min={0.003} max={0.025} step={0.001} left={L('засуха', 'drought')} right={L('дожди', 'rainy')} onChange={(grow) => set({ grow })} />
            <Slider label={L('Ловкость лис', 'Fox hunting skill')} value={params.foxCatch} min={0.1} max={0.9} step={0.05} left={L('неуклюжие', 'clumsy')} right={L('ловкие', 'skilled')} onChange={(foxCatch) => set({ foxCatch })} />
            <Slider label={L('Норы-укрытия для зайцев', 'Rabbit burrows')} value={params.burrows} min={0} max={16} step={1} left="0" right="16" onChange={(burrows) => set({ burrows })} />
            <Slider label={L('Плодовитость зайцев', 'Rabbit fertility')} value={20 - params.rabbitBreed} min={4} max={14} step={1} left={L('низкая', 'low')} right={L('высокая', 'high')} onChange={(v) => set({ rabbitBreed: 20 - v })} />
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{L('Пирамида биомассы', 'Biomass pyramid')}</h3>
            <div className="flex flex-col items-center gap-1">
              {levels.map((l) => (
                <div key={l.name} className="w-full flex flex-col items-center">
                  <div className="h-7 rounded-md flex items-center justify-center text-[11px] font-mono transition-all" style={{ width: `${Math.max(8, Math.sqrt(l.kg / maxKg) * 100)}%`, background: l.color, color: '#fff' }}>
                    {Math.round(l.kg)} {L('кг', 'kg')}
                  </div>
                  <div className="text-[11px] text-ink-2 mt-0.5 mb-1">{l.name}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-2">
              {L('На каждом уровне биомассы меньше: большая часть энергии тратится на жизнь и уходит в тепло. В природе на следующий уровень переходит около 10% энергии (правило Линдемана).', 'Each level holds less biomass: most energy is spent on living and lost as heat. In nature about 10% passes to the next level (Lindeman’s rule).')}
              {eff1 > 0 && L(` В этой модели лисам досталось ${Math.round(eff1)}% энергии, полученной зайцами.`, ` In this model foxes got ${Math.round(eff1)}% of the energy rabbits took in.`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoLab;
