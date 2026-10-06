import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { indicatorColor, METAL_COLOR, REAGENTS, reagent, Reagent, ReagentKind } from './data';
import { Beaker, empty, GAS_INFO, ionText, liquidColor, MAX_ML, pH, pour, pretty, tick } from './engine';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

const GROUPS: { kind: ReagentKind; title: T2; color: string }[] = [
  { kind: 'acid', title: t('Кислоты', 'Acids'), color: '#E5484D' },
  { kind: 'base', title: t('Щёлочи', 'Alkalis'), color: '#5B8CFF' },
  { kind: 'salt', title: t('Соли', 'Salts'), color: '#30A46C' },
  { kind: 'metal', title: t('Металлы', 'Metals'), color: '#8C8F98' },
  { kind: 'oxide', title: t('Оксиды', 'Oxides'), color: '#A0703C' },
  { kind: 'indicator', title: t('Индикаторы', 'Indicators'), color: '#AB8AFF' },
  { kind: 'water', title: t('Вода', 'Water'), color: '#3DD6F5' },
];

interface Goal {
  id: string;
  title: T2;
  hint: T2;
  done: (b: Beaker, seen: Set<string>) => boolean;
}
const logHas = (b: Beaker, s: string) => b.log.some((e) => (e.molecular ?? '').includes(s) || (e.ionic ?? '').includes(s));
const GOALS: Goal[] = [
  { id: 'blue', title: t('Получи голубой осадок', 'Make a blue precipitate'), hint: t('Нужна соль меди и щёлочь.', 'You need a copper salt and an alkali.'), done: (b) => logHas(b, 'Cu(OH)₂↓') },
  { id: 'co2', title: t('Докажи, что в соде есть карбонат-ион', 'Prove soda contains carbonate'), hint: t('Карбонаты «вскипают» от кислоты.', 'Carbonates fizz with acid.'), done: (b) => logHas(b, 'CO₂↑') },
  { id: 'neutral', title: t('Обесцветь малиновый фенолфталеин', 'Make crimson phenolphthalein colourless'), hint: t('Щёлочь + фенолфталеин, потом кислоту понемногу.', 'Alkali + phenolphthalein, then acid bit by bit.'), done: (b, seen) => seen.has('crimson') && b.indicator === 'phenol' && pH(b) < 8.2 },
  { id: 'h2', title: t('Получи водород', 'Make hydrogen'), hint: t('Металл левее водорода в ряду активности + кислота.', 'A metal above hydrogen + acid.'), done: (b) => logHas(b, 'H₂↑') },
  { id: 'gold', title: t('Устрой «золотой дождь»', 'Make “golden rain”'), hint: t('Нитрат свинца и иодид калия.', 'Lead nitrate and potassium iodide.'), done: (b) => logHas(b, 'PbI₂↓') },
  { id: 'copper', title: t('Покрой железо медью', 'Coat iron with copper'), hint: t('Более активный металл вытесняет менее активный из соли.', 'A more active metal pushes a less active one out of its salt.'), done: (b) => logHas(b, 'Fe + Cu²⁺') },
  { id: 'amph', title: t('Получи осадок и растворь его щёлочью', 'Make a precipitate and dissolve it with alkali'), hint: t('Амфотерные гидроксиды: алюминия и цинка.', 'Amphoteric hydroxides: aluminium and zinc.'), done: (b) => b.log.some((e) => e.ionic?.includes('[Al(OH)₄]') || e.ionic?.includes('[Zn(OH)₄]')) },
  { id: 'chloride', title: t('Найди хлорид-ион', 'Detect chloride ions'), hint: t('Качественная реакция — с нитратом серебра.', 'The test uses silver nitrate.'), done: (b) => logHas(b, 'AgCl↓') },
  { id: 'sulfate', title: t('Найди сульфат-ион', 'Detect sulfate ions'), hint: t('Качественная реакция — с ионами бария.', 'The test uses barium ions.'), done: (b) => logHas(b, 'BaSO₄↓') },
  { id: 'ammonia', title: t('Получи аммиак', 'Make ammonia'), hint: t('Соль аммония + щёлочь.', 'An ammonium salt + alkali.'), done: (b) => logHas(b, 'NH₃↑') },
];

/* ---------- beaker drawing ---------- */

interface Particle {
  x: number;
  y: number;
  vy: number;
  r: number;
  color: string;
  settled: boolean;
}
interface Bubble {
  x: number;
  y: number;
  r: number;
  v: number;
  color: string;
}

function drawBeaker(ctx: CanvasRenderingContext2D, w: number, h: number, b: Beaker, parts: Particle[], bubbles: Bubble[], pourFx: { color: string; until: number } | null, now: number, lang: Lang, dpr: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, w, h);
  const bx = w * 0.3;
  const bw = w * 0.4;
  const top = h * 0.14;
  const bottom = h * 0.9;
  const bh = bottom - top;
  const f = Math.max(11 * dpr, w / 50);

  // pouring stream
  if (pourFx && now < pourFx.until) {
    const k = (pourFx.until - now) / 500;
    ctx.strokeStyle = pourFx.color;
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.lineWidth = 6 * dpr;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.55, 0);
    ctx.lineTo(bx + bw * 0.5, bottom - (b.ml / MAX_ML) * bh);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // liquid
  const level = bottom - (b.ml / MAX_ML) * bh;
  if (b.ml > 0) {
    const lc = liquidColor(b);
    ctx.fillStyle = 'rgba(158,201,240,0.16)';
    ctx.fillRect(bx, level, bw, bottom - level);
    if (lc.alpha > 0) {
      ctx.globalAlpha = lc.alpha;
      ctx.fillStyle = lc.color;
      ctx.fillRect(bx, level, bw, bottom - level);
      ctx.globalAlpha = 1;
    }
    if (b.indicator) {
      const ic = indicatorColor(b.indicator, pH(b));
      if (ic.color !== 'transparent') {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = ic.color;
        ctx.fillRect(bx, level, bw, bottom - level);
        ctx.globalAlpha = 1;
      }
    }
    // surface
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(bx, level);
    ctx.lineTo(bx + bw, level);
    ctx.stroke();
  }

  // solids at the bottom: metals and oxides
  const pieces = Object.entries(b.pieces);
  pieces.forEach(([id, mol], i) => {
    const r = reagent(id);
    const n = Math.min(4, Math.max(1, Math.round(mol / 0.0025)));
    for (let k = 0; k < n; k++) {
      const x = bx + bw * (0.18 + ((i * 3 + k) % 9) * 0.08);
      const y = bottom - 7 * dpr;
      if (r.kind === 'metal') {
        const coat = b.coated[id];
        ctx.fillStyle = coat ? (coat === 'Cu' ? '#B5562A' : '#E3E5E8') : METAL_COLOR[r.metal!];
        ctx.fillRect(x - 9 * dpr, y - 6 * dpr, 18 * dpr, 12 * dpr);
      } else {
        ctx.fillStyle = r.oxide!.color;
        ctx.beginPath();
        ctx.ellipse(x, y + 2 * dpr, 12 * dpr, 6 * dpr, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // precipitate particles
  for (const p of parts) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // bubbles
  for (const q of bubbles) {
    ctx.strokeStyle = q.color;
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // brown NO2 cloud
  if ((b.gas.NO2 ?? 0) > 0.05) {
    const a = Math.min(0.6, b.gas.NO2 / 4);
    const g = ctx.createRadialGradient(bx + bw / 2, top - 10 * dpr, 5, bx + bw / 2, top - 10 * dpr, bw * 0.7);
    g.addColorStop(0, `rgba(150,70,25,${a})`);
    g.addColorStop(1, 'rgba(150,70,25,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - bw * 0.3, 0, bw * 1.6, top + bh * 0.3);
  }

  // glass
  ctx.strokeStyle = 'rgba(220,230,240,0.75)';
  ctx.lineWidth = 3 * dpr;
  ctx.beginPath();
  ctx.moveTo(bx - 8 * dpr, top);
  ctx.lineTo(bx, top + 6 * dpr);
  ctx.lineTo(bx, bottom);
  ctx.quadraticCurveTo(bx, bottom + 6 * dpr, bx + 8 * dpr, bottom + 6 * dpr);
  ctx.lineTo(bx + bw - 8 * dpr, bottom + 6 * dpr);
  ctx.quadraticCurveTo(bx + bw, bottom + 6 * dpr, bx + bw, bottom);
  ctx.lineTo(bx + bw, top);
  ctx.stroke();
  // scale
  ctx.fillStyle = 'rgba(220,230,240,0.55)';
  ctx.font = `${f * 0.7}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let ml = 50; ml <= MAX_ML; ml += 50) {
    const y = bottom - (ml / MAX_ML) * bh;
    ctx.fillRect(bx + 4 * dpr, y, 14 * dpr, 1.5 * dpr);
    ctx.fillText(`${ml}`, bx + 22 * dpr, y);
  }

  // thermometer
  const tx = bx + bw + w * 0.09;
  const tTop = top + 10 * dpr;
  const tBot = bottom - 10 * dpr;
  ctx.fillStyle = '#1A1C21';
  ctx.strokeStyle = '#4A4D55';
  ctx.lineWidth = 1.5 * dpr;
  ctx.beginPath();
  ctx.roundRect(tx - 6 * dpr, tTop, 12 * dpr, tBot - tTop, 6 * dpr);
  ctx.fill();
  ctx.stroke();
  const temp = Math.max(0, Math.min(80, b.tempC));
  const ty = tBot - ((temp - 0) / 80) * (tBot - tTop);
  ctx.fillStyle = '#E5484D';
  ctx.fillRect(tx - 3 * dpr, ty, 6 * dpr, tBot - ty);
  ctx.beginPath();
  ctx.arc(tx, tBot + 4 * dpr, 9 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#EDEDED';
  ctx.font = `600 ${f}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${b.tempC.toFixed(1).replace('.', ',')} °C`, tx, tTop - 14 * dpr);

  // pH meter
  const px = bx - w * 0.14;
  const p = pH(b);
  ctx.fillStyle = '#1A1C21';
  ctx.strokeStyle = '#4A4D55';
  ctx.beginPath();
  ctx.roundRect(px - 44 * dpr, top + 10 * dpr, 88 * dpr, 52 * dpr, 8 * dpr);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8C8F98';
  ctx.font = `${f * 0.75}px Inter, system-ui, sans-serif`;
  ctx.fillText('pH', px, top + 24 * dpr);
  ctx.fillStyle = b.ml ? (p < 6.5 ? '#FF6B6B' : p > 7.5 ? '#6B9BFF' : '#5DD39E') : '#4A4D55';
  ctx.font = `700 ${f * 1.5}px Inter, system-ui, sans-serif`;
  ctx.fillText(b.ml ? p.toFixed(1).replace('.', ',') : '—', px, top + 45 * dpr);
  if (b.ml) {
    ctx.fillStyle = '#8C8F98';
    ctx.font = `${f * 0.75}px Inter, system-ui, sans-serif`;
    ctx.fillText(p < 6.5 ? (lang === 'ru' ? 'кислая' : 'acidic') : p > 7.5 ? (lang === 'ru' ? 'щелочная' : 'alkaline') : lang === 'ru' ? 'нейтральная' : 'neutral', px, top + 74 * dpr);
  }
  ctx.fillStyle = '#8C8F98';
  ctx.font = `${f * 0.8}px Inter, system-ui, sans-serif`;
  ctx.fillText(`${b.ml} ${lang === 'ru' ? 'мл' : 'mL'}`, bx + bw / 2, bottom + 22 * dpr);
}

/* ---------- component ---------- */

export const ChemLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [beaker, setBeaker] = useState<Beaker>(empty);
  const [history, setHistory] = useState<Beaker[]>([]);
  const [goalsDone, setGoalsDone] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);
  const bubbles = useRef<Bubble[]>([]);
  const pourFx = useRef<{ color: string; until: number } | null>(null);
  const bRef = useRef(beaker);
  bRef.current = beaker;

  useEffect(() => progress.recordLab('sandbox-chemistry'), []);

  // keep the precipitate particles in step with the amount of solid
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const w = c.width;
    const h = c.height;
    const bx = w * 0.3;
    const bw = w * 0.4;
    const bottom = h * 0.9;
    const level = bottom - (beaker.ml / MAX_ML) * (h * 0.76);
    const dpr = window.devicePixelRatio || 1;
    const want: Record<string, number> = {};
    for (const s of Object.values(beaker.solids)) want[s.info.color] = Math.min(260, (want[s.info.color] ?? 0) + Math.round((s.mol / 0.005) * 70));
    const have: Record<string, Particle[]> = {};
    for (const p of parts.current) (have[p.color] ??= []).push(p);
    const next: Particle[] = [];
    for (const [color, n] of Object.entries(want)) {
      const list = have[color] ?? [];
      next.push(...list.slice(0, n));
      for (let i = list.length; i < n; i++) next.push({ x: bx + 10 * dpr + Math.random() * (bw - 20 * dpr), y: level + Math.random() * (bottom - level) * 0.4, vy: 0, r: (1.5 + Math.random() * 1.8) * dpr, color, settled: false });
    }
    parts.current = next;
  }, [beaker.solids, beaker.ml]);

  // animation: settling solids, bubbles, cooling
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientWidth * 0.62 * dpr);
    });
    ro.observe(c);
    let raf = 0;
    let last = performance.now();
    let coolClock = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = window.devicePixelRatio || 1;
      const w = c.width;
      const h = c.height;
      const bx = w * 0.3;
      const bw = w * 0.4;
      const bottom = h * 0.9;
      const b = bRef.current;
      const level = bottom - (b.ml / MAX_ML) * (h * 0.76);
      // particles fall and pile up
      const settledByCol: Record<number, number> = {};
      for (const p of parts.current) {
        const col = Math.round(p.x / (4 * dpr));
        if (!p.settled) {
          p.vy = Math.min(p.vy + 40 * dpr * dt, 60 * dpr);
          p.y += p.vy * dt;
          const floor = bottom - (settledByCol[col] ?? 0) - p.r;
          if (p.y >= floor) {
            p.y = floor;
            p.settled = true;
          }
        }
        if (p.settled) settledByCol[col] = (settledByCol[col] ?? 0) + p.r * 0.9;
      }
      // bubbles from the bottom while a gas is coming off
      const gasTotal = Object.entries(b.gas).filter(([k]) => k !== 'NO2').reduce((s, [, g]) => s + g, 0) + (b.gas.NO2 ?? 0) * 0.5;
      if (b.ml > 0 && gasTotal > 0.02 && Math.random() < Math.min(0.9, gasTotal * 0.25)) {
        const gasKey = Object.entries(b.gas).sort((a, z) => z[1] - a[1])[0]?.[0];
        bubbles.current.push({ x: bx + 15 * dpr + Math.random() * (bw - 30 * dpr), y: bottom - 6 * dpr, r: (1.5 + Math.random() * 3) * dpr, v: (40 + Math.random() * 50) * dpr, color: GAS_INFO[gasKey]?.color ?? 'rgba(255,255,255,0.7)' });
      }
      bubbles.current = bubbles.current.filter((q) => {
        q.y -= q.v * dt;
        q.x += Math.sin(q.y / 9) * 0.3 * dpr;
        return q.y > level;
      });
      coolClock += dt;
      if (coolClock > 0.25) {
        const next = tick(b, coolClock);
        coolClock = 0;
        if (next !== b) setBeaker(next);
      }
      const ctx = c.getContext('2d');
      if (ctx) drawBeaker(ctx, w, h, bRef.current, parts.current, bubbles.current, pourFx.current, now, lang, dpr);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lang]);

  const add = (r: Reagent) => {
    const next = pour(beaker, r.id);
    setHistory((h) => [...h.slice(-30), beaker]);
    setBeaker(next);
    if (r.kind !== 'metal' && r.kind !== 'oxide') pourFx.current = { color: r.color ?? 'rgba(170,210,245,0.8)', until: performance.now() + 500 };
    if (next.indicator === 'phenol' && pH(next) >= 8.2) seen.current.add('crimson');
    const done = GOALS.filter((g) => !goalsDone.has(g.id) && g.done(next, seen.current)).map((g) => g.id);
    if (done.length) setGoalsDone((s) => new Set([...s, ...done]));
  };
  const emptyIt = () => {
    setHistory((h) => [...h.slice(-30), beaker]);
    setBeaker(empty());
    parts.current = [];
    bubbles.current = [];
    seen.current = new Set();
  };
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setBeaker(prev);
    parts.current = [];
  };

  const contents = useMemo(() => {
    const L2 = beaker.ml / 1000;
    return Object.entries(beaker.ions)
      .filter(([, n]) => n > 1e-7)
      .sort((a, b) => b[1] - a[1])
      .map(([id, n]) => ({ id, c: L2 ? n / L2 : 0 }));
  }, [beaker]);
  const ph = pH(beaker);
  const ind = beaker.indicator ? indicatorColor(beaker.indicator, ph) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 items-start">
        {/* shelf */}
        <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-3 lg:max-h-[640px] lg:overflow-y-auto">
          {GROUPS.map((g) => (
            <div key={g.kind}>
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-ink-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                {g.title[lang]}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REAGENTS.filter((r) => r.kind === g.kind).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => add(r)}
                    title={r.name[lang]}
                    className="h-8 px-2.5 rounded-lg border border-line bg-surface hover:border-accent hover:bg-accent-soft text-[13px] text-ink cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {r.color && <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />}
                    <span className="font-mono">{pretty(r.formula)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-ink-3">{L('Раствор — 10 мл, 0,5 моль/л. Металл или оксид — кусочек 0,005 моль. Наведи на кнопку, чтобы увидеть название.', 'A solution pour is 10 mL at 0.5 mol/L; a metal or oxide piece is 0.005 mol. Hover a button for its name.')}</p>
        </div>

        {/* beaker */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126]">
            <canvas ref={canvasRef} className="block w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={undo} disabled={!history.length} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted disabled:opacity-40 cursor-pointer">
              <Undo2 className="w-4 h-4" />
              {L('Отменить', 'Undo')}
            </button>
            <button onClick={emptyIt} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <Trash2 className="w-4 h-4" />
              {L('Вылить', 'Empty')}
            </button>
            {ind && (
              <span className="text-sm text-ink-2 inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-line" style={{ background: ind.color === 'transparent' ? '#fff' : ind.color }} />
                {reagent(beaker.indicator!).name[lang]}: {ind.name[lang]}
              </span>
            )}
            {Object.entries(beaker.gas)
              .filter(([, g]) => g > 0.05)
              .map(([k]) => (
                <span key={k} className="text-xs px-2 py-1 rounded-full bg-muted text-ink-2">
                  ↑ {GAS_INFO[k]?.name[lang] ?? k}
                </span>
              ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 items-start">
            <div className="bg-surface border border-line rounded-xl p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Журнал опыта', 'Lab log')}</h3>
              {beaker.log.length === 0 ? (
                <p className="text-sm text-ink-3">{L('Налей что-нибудь из склянок слева. Здесь появятся наблюдения и уравнения реакций.', 'Pour something from the shelf. Observations and equations will appear here.')}</p>
              ) : (
                <ul className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {beaker.log.map((e) => (
                    <li key={e.id} className={`rounded-lg px-3 py-2 text-sm ${e.tone === 'react' ? 'bg-accent-soft' : e.tone === 'warn' ? 'bg-[#FFF8E8]' : 'bg-muted'}`}>
                      <div className={e.tone === 'react' ? 'text-ink' : 'text-ink-2'}>{e.text[lang]}</div>
                      {e.molecular && <div className="mt-1 font-mono text-[13px] text-ink">{e.molecular}</div>}
                      {e.ionic && (
                        <div className="font-mono text-[12.5px] text-ink-2">
                          {L('сокр. ионное:', 'net ionic:')} {e.ionic}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-surface border border-line rounded-xl p-4">
                <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Что в стакане', 'In the beaker')}</h3>
                {beaker.ml === 0 && !Object.keys(beaker.pieces).length ? (
                  <p className="text-sm text-ink-3">{L('Пусто.', 'Empty.')}</p>
                ) : (
                  <div className="flex flex-col gap-1.5 text-sm">
                    {contents.map((c) => (
                      <div key={c.id} className="flex justify-between">
                        <span className="font-mono text-ink">{ionText(c.id)}</span>
                        <span className="font-mono text-ink-2">{c.c.toFixed(3).replace('.', ',')} {L('моль/л', 'mol/L')}</span>
                      </div>
                    ))}
                    {Object.entries(beaker.solids).map(([f, s]) => (
                      <div key={f} className="flex justify-between">
                        <span className="inline-flex items-center gap-1.5 text-ink">
                          <span className="w-2.5 h-2.5 rounded-full border border-line" style={{ background: s.info.color }} />
                          <span className="font-mono">{pretty(f)}↓</span>
                        </span>
                        <span className="text-ink-2 text-xs">{s.info.look[lang]}</span>
                      </div>
                    ))}
                    {Object.entries(beaker.pieces).map(([id, mol]) => (
                      <div key={id} className="flex justify-between">
                        <span className="font-mono text-ink">{pretty(reagent(id).formula)}</span>
                        <span className="text-ink-2 text-xs">
                          {L('не растворилось', 'undissolved')}: {(mol * 1000).toFixed(1).replace('.', ',')} {L('ммоль', 'mmol')}
                          {beaker.coated[id] ? ` · ${L('покрыт', 'coated with')} ${beaker.coated[id]}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-surface border border-line rounded-xl p-4">
                <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">
                  {L('Задания', 'Challenges')} · {goalsDone.size}/{GOALS.length}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {GOALS.map((g) => {
                    const ok = goalsDone.has(g.id);
                    return (
                      <li key={g.id} className="flex items-start gap-2 text-sm">
                        <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${ok ? 'bg-[#30A46C] border-[#30A46C]' : 'border-line-strong'}`}>{ok && <Check className="w-3 h-3" style={{ color: '#fff' }} strokeWidth={3} />}</span>
                        <span>
                          <span className={ok ? 'text-ink-3 line-through' : 'text-ink'}>{g.title[lang]}</span>
                          {!ok && <span className="block text-xs text-ink-3">{g.hint[lang]}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {goalsDone.size > 0 && (
                  <button onClick={() => setGoalsDone(new Set())} className="mt-2 text-xs text-ink-3 hover:text-ink inline-flex items-center gap-1 cursor-pointer">
                    <RotateCcw className="w-3 h-3" />
                    {L('Начать задания заново', 'Reset challenges')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemLab;
