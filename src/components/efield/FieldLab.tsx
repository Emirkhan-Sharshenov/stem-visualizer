import { RangeSlider } from '../ui/RangeSlider';
import { Check } from '../ui/Check';
import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hand, Minus, Plus, RotateCcw, Trash2, Zap } from 'lucide-react';
import { Charge, coulomb, fieldAt, fieldLines, H, preset, PresetId, W } from './field';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
type Tool = 'move' | 'plus' | 'minus' | 'probe' | 'erase';
interface Probe {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: number[];
  done: boolean;
}

const POS = '#E5484D';
const NEG = '#3B6BFF';
const GX = 240;
const GY = 150;

const PRESETS: { id: PresetId; ru: string; en: string; textRu: string; textEn: string }[] = [
  { id: 'single', ru: 'Один заряд', en: 'One charge', textRu: 'Линии расходятся во все стороны, как лучи. Чем дальше от заряда, тем реже линии: поле слабеет как 1/r².', textEn: 'Lines spread out like rays. Further away they thin out: the field weakens as 1/r².' },
  { id: 'dipole', ru: 'Диполь', en: 'Dipole', textRu: 'Линии выходят из «+» и входят в «−». Так устроено поле молекулы воды и антенны.', textEn: 'Lines leave “+” and enter “−”. That is the field of a water molecule or an antenna.' },
  { id: 'like', ru: 'Два «+»', en: 'Two “+”', textRu: 'Одноимённые заряды отталкиваются: линии не пересекаются и между зарядами есть точка, где E = 0.', textEn: 'Like charges repel: lines never cross, and between the charges there is a point where E = 0.' },
  { id: 'capacitor', ru: 'Конденсатор', en: 'Capacitor', textRu: 'Между пластинами поле однородное: линии параллельны и идут с одинаковой густотой. Снаружи поле почти ноль.', textEn: 'Between the plates the field is uniform: parallel, evenly spaced lines. Outside it is almost zero.' },
  { id: 'quad', ru: 'Квадруполь', en: 'Quadrupole', textRu: 'Четыре заряда по углам. В центре поля нет, а линии изгибаются от «+» к соседним «−».', textEn: 'Four charges at the corners. No field in the centre; lines curve from each “+” to the neighbouring “−”.' },
];

const fmt = (v: number, d = 1) => {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(d)} М`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(d)} к`;
  return v.toFixed(a < 10 ? 2 : 0) + ' ';
};

export const FieldLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [charges, setCharges] = useState<Charge[]>(() => preset('dipole'));
  const [scene, setScene] = useState<PresetId | null>('dipole');
  const [tool, setTool] = useState<Tool>('move');
  const [mag, setMag] = useState(2);
  const [selected, setSelected] = useState<number | null>(null);
  const [show, setShow] = useState({ lines: true, potential: true, vectors: false });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const probes = useRef<Probe[]>([]);
  const drag = useRef<number | null>(null);
  const live = useRef({ charges, show, hover });
  live.current = { charges, show, hover };

  useEffect(() => progress.recordLab('sandbox-efield'), []);

  const lines = useMemo(() => (show.lines ? fieldLines(charges) : []), [charges, show.lines]);

  // potential map, redrawn only when the charges change
  const potential = useMemo(() => {
    const off = document.createElement('canvas');
    off.width = GX;
    off.height = GY;
    const ctx = off.getContext('2d')!;
    const img = ctx.createImageData(GX, GY);
    for (let j = 0; j < GY; j++)
      for (let i = 0; i < GX; i++) {
        const { phi } = fieldAt(charges, ((i + 0.5) / GX) * W, ((j + 0.5) / GY) * H);
        const t = Math.tanh(phi / 1500);
        // equipotential bands every 250 V
        const band = Math.abs(((phi / 250) % 1) + 1) % 1;
        const edge = Math.max(0, 1 - Math.min(band, 1 - band) / 0.07) * 0.16;
        const k = (i + j * GX) * 4;
        const base = [11, 13, 18];
        const col = t > 0 ? [229, 72, 77] : [59, 107, 255];
        const a = Math.min(1, Math.abs(t)) * 0.75;
        img.data[k] = base[0] + (col[0] - base[0]) * a + 255 * edge * Math.abs(t);
        img.data[k + 1] = base[1] + (col[1] - base[1]) * a + 255 * edge * Math.abs(t);
        img.data[k + 2] = base[2] + (col[2] - base[2]) * a + 255 * edge * Math.abs(t);
        img.data[k + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
    return off;
  }, [charges]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    // resizing clears the canvas, so only touch the size when it really changed (the loop restarts on every edit)
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(cv.clientWidth * dpr);
      const h = Math.round((cv.clientWidth * H * dpr) / W);
      if (cv.width !== w) cv.width = w;
      if (cv.height !== h) cv.height = h;
    });
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { charges: cs, show: sh, hover: hv } = live.current;
      // test charges drift along the field line through them (like a charge in oil: v ∥ E, faster where E is strong)
      for (const p of probes.current) {
        if (p.done) continue;
        for (let s = 0; s < 4; s++) {
          const f = fieldAt(cs, p.x, p.y);
          if (f.e === 0) break;
          const v = Math.min(14, 2 + Math.log10(1 + f.e / 300) * 4);
          p.vx = (f.ex / f.e) * v;
          p.vy = (f.ey / f.e) * v;
          p.x += p.vx * (dt / 4);
          p.y += p.vy * (dt / 4);
        }
        p.trail.push(p.x, p.y);
        if (p.trail.length > 1200) p.trail.splice(0, 2);
        if (p.x < -3 || p.y < -3 || p.x > W + 3 || p.y > H + 3 || cs.some((c) => c.q < 0 && Math.hypot(c.x - p.x, c.y - p.y) < 0.5)) p.done = true;
      }
      draw(cv, cs, sh, hv);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, potential]);

  function draw(cv: HTMLCanvasElement, cs: Charge[], sh: typeof show, hv: typeof hover) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const s = cv.width / W;
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = '#0B0D12';
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (sh.potential) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(potential, 0, 0, cv.width, cv.height);
    }
    // grid, 1 cm
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      ctx.moveTo(x * s, 0);
      ctx.lineTo(x * s, cv.height);
    }
    for (let y = 0; y <= H; y++) {
      ctx.moveTo(0, y * s);
      ctx.lineTo(cv.width, y * s);
    }
    ctx.stroke();
    if (sh.lines) {
      ctx.strokeStyle = 'rgba(235,240,255,0.72)';
      ctx.fillStyle = 'rgba(235,240,255,0.85)';
      ctx.lineWidth = 1.3 * dpr;
      for (const pts of lines) {
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, pts[i] * s, pts[i + 1] * s);
        ctx.stroke();
        // arrows show the direction of E
        const pos = cs.some((c) => c.q > 0);
        for (const at of [0.3, 0.7]) {
          const i = Math.floor((pts.length / 2) * at) * 2;
          if (i + 3 >= pts.length) continue;
          let ang = Math.atan2(pts[i + 3] - pts[i + 1], pts[i + 2] - pts[i]);
          if (!pos) ang += Math.PI;
          const x = pts[i] * s;
          const y = pts[i + 1] * s;
          const r = 5 * dpr;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
          ctx.lineTo(x + Math.cos(ang + 2.5) * r, y + Math.sin(ang + 2.5) * r);
          ctx.lineTo(x + Math.cos(ang - 2.5) * r, y + Math.sin(ang - 2.5) * r);
          ctx.fill();
        }
      }
    }
    if (sh.vectors) {
      for (let y = 1.25; y < H; y += 2.5)
        for (let x = 1.25; x < W; x += 2.5) {
          const f = fieldAt(cs, x, y);
          if (f.e === 0) continue;
          const len = Math.min(1.1, 0.25 + Math.log10(1 + f.e / 2000) * 0.35) * s;
          const ux = f.ex / f.e;
          const uy = f.ey / f.e;
          const x0 = x * s - (ux * len) / 2;
          const y0 = y * s - (uy * len) / 2;
          ctx.strokeStyle = 'rgba(255,214,10,0.85)';
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + ux * len, y0 + uy * len);
          ctx.lineTo(x0 + ux * len - (ux - uy * 0.5) * 5 * dpr, y0 + uy * len - (uy + ux * 0.5) * 5 * dpr);
          ctx.stroke();
        }
    }
    // test charges and their paths
    for (const p of probes.current) {
      ctx.strokeStyle = 'rgba(95,211,154,0.8)';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (let i = 0; i < p.trail.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.trail[i] * s, p.trail[i + 1] * s);
      ctx.stroke();
      if (!p.done) {
        ctx.fillStyle = '#5FD39A';
        ctx.beginPath();
        ctx.arc(p.x * s, p.y * s, 5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // charges
    for (const c of cs) {
      const r = Math.max(9 * dpr, (0.45 + 0.12 * Math.min(5, Math.abs(c.q))) * s);
      const col = c.q > 0 ? POS : NEG;
      const g = ctx.createRadialGradient(c.x * s, c.y * s, 0, c.x * s, c.y * s, r * 2.4);
      g.addColorStop(0, col + 'AA');
      g.addColorStop(1, col + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x * s, c.y * s, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(c.x * s, c.y * s, r, 0, Math.PI * 2);
      ctx.fill();
      if (c.id === selectedRef.current) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.font = `600 ${Math.round(r * 1.2)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? '+' : '−', c.x * s, c.y * s + r * 0.05);
    }
    // field arrow under the cursor
    if (hv) {
      const f = fieldAt(cs, hv.x, hv.y);
      if (f.e > 0) {
        const len = Math.min(3, 0.6 + Math.log10(1 + f.e / 1000)) * s;
        const ux = f.ex / f.e;
        const uy = f.ey / f.e;
        ctx.strokeStyle = '#FFD60A';
        ctx.fillStyle = '#FFD60A';
        ctx.lineWidth = 2.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(hv.x * s, hv.y * s);
        ctx.lineTo(hv.x * s + ux * len, hv.y * s + uy * len);
        ctx.stroke();
        const tx = hv.x * s + ux * len;
        const ty = hv.y * s + uy * len;
        const a = Math.atan2(uy, ux);
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(a) * 8 * dpr, ty + Math.sin(a) * 8 * dpr);
        ctx.lineTo(tx + Math.cos(a + 2.4) * 8 * dpr, ty + Math.sin(a + 2.4) * 8 * dpr);
        ctx.lineTo(tx + Math.cos(a - 2.4) * 8 * dpr, ty + Math.sin(a - 2.4) * 8 * dpr);
        ctx.fill();
      }
    }
  }

  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;

  const toWorld = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const nearest = (x: number, y: number) => {
    let best: Charge | null = null;
    let bd = Math.max(1.4, 40 / (canvas.current!.clientWidth / W));
    for (const c of charges) {
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    return best;
  };
  const change = (cs: Charge[]) => {
    setCharges(cs);
    setScene(null);
  };
  const onDown = (e: React.PointerEvent) => {
    const p = toWorld(e);
    const hit = nearest(p.x, p.y);
    if (tool === 'move') {
      setSelected(hit?.id ?? null);
      if (hit) {
        drag.current = hit.id;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    } else if (tool === 'erase') {
      if (hit) change(charges.filter((c) => c.id !== hit.id));
    } else if (tool === 'probe') {
      if (probes.current.length >= 8) probes.current.shift();
      probes.current.push({ x: p.x, y: p.y, vx: 0, vy: 0, trail: [p.x, p.y], done: false });
    } else if (charges.length < 24) {
      const id = Math.max(0, ...charges.map((c) => c.id)) + 1;
      change([...charges, { id, x: p.x, y: p.y, q: tool === 'plus' ? mag : -mag }]);
      setSelected(id);
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const p = toWorld(e);
    setHover(p);
    if (drag.current !== null) {
      const x = Math.max(0.5, Math.min(W - 0.5, p.x));
      const y = Math.max(0.5, Math.min(H - 0.5, p.y));
      change(charges.map((c) => (c.id === drag.current ? { ...c, x, y } : c)));
    }
  };
  const onUp = () => (drag.current = null);

  const sel = charges.find((c) => c.id === selected);
  const f = hover ? fieldAt(charges, hover.x, hover.y) : null;
  const info = PRESETS.find((p) => p.id === scene);
  const pair = charges.length === 2 ? coulomb(charges[0], charges[1]) : null;

  const btn = (on: boolean) => `h-9 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 cursor-pointer ${on ? 'bg-accent border-accent font-medium' : 'border-line bg-surface text-ink hover:bg-muted'}`;
  const TOOLS: { id: Tool; icon: React.ReactNode; ru: string; en: string }[] = [
    { id: 'move', icon: <Hand className="w-4 h-4" />, ru: 'Двигать', en: 'Move' },
    { id: 'plus', icon: <Plus className="w-4 h-4" />, ru: 'Заряд +', en: 'Charge +' },
    { id: 'minus', icon: <Minus className="w-4 h-4" />, ru: 'Заряд −', en: 'Charge −' },
    { id: 'probe', icon: <Zap className="w-4 h-4" />, ru: 'Пробный заряд', en: 'Test charge' },
    { id: 'erase', icon: <Trash2 className="w-4 h-4" />, ru: 'Удалить', en: 'Delete' },
  ];

  useScreenDetail(
    'lab',
    `Сцена: ${info ? info.ru : 'своя расстановка'}. Заряды (координаты в см, поле 40×25 см): ${charges.length ? charges.map((c) => `${c.q > 0 ? '+' : ''}${c.q} нКл в (${c.x.toFixed(1)}; ${c.y.toFixed(1)})`).join(', ') : 'нет'}. Инструмент: ${tool}. Показаны: ${[show.lines && 'силовые линии', show.potential && 'потенциал', show.vectors && 'векторы E'].filter(Boolean).join(', ') || 'ничего'}.`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Закон Кулона и напряжённость поля', 'Coulomb’s law and field strength')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {info
            ? L(info.textRu, info.textEn)
            : L('Ставь заряды и двигай их: линии поля и цвет потенциала пересчитываются сразу. Пробный заряд «+» полетит вдоль линий поля.', 'Place and move charges: field lines and potential update instantly. A “+” test charge flies along the field lines.')}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setCharges(preset(p.id));
              setScene(p.id);
              setSelected(null);
              probes.current = [];
            }}
            className={`h-9 px-3.5 rounded-full text-sm border whitespace-nowrap cursor-pointer ${scene === p.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={scene === p.id ? { color: '#fff', background: '#16171A' } : undefined}
          >
            {L(p.ru, p.en)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126] relative">
            <canvas ref={canvas} className="block w-full touch-none" style={{ cursor: tool === 'move' ? 'grab' : 'crosshair' }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => setHover(null)} />
            <span className="absolute left-2 bottom-2 text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/50" style={{ color: '#C9CFDB' }}>
              {L('клетка = 1 см', 'grid = 1 cm')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <Button key={t.id} size="sm" variant={tool === t.id ? 'primary' : 'outline'} onPress={() => setTool(t.id)}>
                {t.icon}
                {L(t.ru, t.en)}
              </Button>
            ))}
            <Button variant="outline" className="text-sm" onPress={() => {
                probes.current = [];
                change([]);
                setSelected(null);
              }}>
              <RotateCcw className="w-4 h-4" />
              {L('Очистить', 'Clear')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink-2">
            {(
              [
                ['lines', L('Силовые линии', 'Field lines')],
                ['potential', L('Потенциал (цвет)', 'Potential (colour)')],
                ['vectors', L('Векторы E', 'E vectors')],
              ] as const
            ).map(([k, label]) => (
              <Check checked={show[k]} onChange={(v) => setShow({ ...show, [k]: v })}>{label}</Check>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('В точке под курсором', 'Under the cursor')}</h3>
            {f ? (
              <div className="flex flex-col gap-1 font-mono text-sm text-ink">
                <div>E = {fmt(f.e)}{L('Н/Кл', 'N/C')}</div>
                <div>φ = {fmt(f.phi)}{L('В', 'V')}</div>
                <div className="text-ink-3 text-xs">x = {hover!.x.toFixed(1)} {L('см', 'cm')}, y = {hover!.y.toFixed(1)} {L('см', 'cm')}</div>
              </div>
            ) : (
              <p className="text-sm text-ink-3">{L('Наведи на поле — покажу напряжённость и потенциал. Жёлтая стрелка — направление E.', 'Hover over the field to see its strength and potential. The yellow arrow shows E.')}</p>
            )}
          </div>

          {(tool === 'plus' || tool === 'minus') && (
            <div className="bg-surface border border-line rounded-xl p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Величина нового заряда', 'New charge size')}</h3>
              <RangeSlider value={mag} onChange={(v) => setMag(v)} min={0.5} max={5} step={0.5} />
              <div className="text-sm font-mono text-ink">{mag} {L('нКл', 'nC')}</div>
            </div>
          )}

          {sel && tool === 'move' && (
            <div className="bg-surface border border-line rounded-xl p-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Выбранный заряд', 'Selected charge')}</h3>
              <RangeSlider value={sel.q} onChange={(v) => {
                  const q = v || (sel.q > 0 ? 0.5 : -0.5);
                  change(charges.map((c) => (c.id === sel.id ? { ...c, q } : c)));
                }} min={-5} max={5} step={0.5} />
              <div className="flex justify-between text-sm font-mono">
                <span style={{ color: sel.q > 0 ? POS : NEG }}>q = {sel.q > 0 ? '+' : ''}{sel.q} {L('нКл', 'nC')}</span>
                <Button variant="ghost" onPress={() => { change(charges.filter((c) => c.id !== sel.id)); setSelected(null); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                  {L('удалить', 'delete')}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Формулы', 'Formulas')}</h3>
            <div className="text-center overflow-x-auto">
              <Formula tex="F = k\,\frac{|q_1|\,|q_2|}{r^{2}}" display />
            </div>
            <div className="text-center overflow-x-auto">
              <Formula tex="E = \frac{F}{q} = k\,\frac{|q|}{r^{2}},\quad \varphi = k\,\frac{q}{r}" display />
            </div>
            <p className="text-xs text-ink-2">
              <Formula tex="k = 9 \cdot 10^{9}\ \text{Н·м}^2/\text{Кл}^2" />. {L('Поля нескольких зарядов складываются как векторы (принцип суперпозиции).', 'Fields of several charges add up as vectors (superposition).')}
            </p>
            {pair !== null && (
              <p className="text-sm text-ink">
                {L('Сила между зарядами', 'Force between the charges')}: <b className="font-mono">{(Math.abs(pair) * 1e6).toFixed(1)} {L('мкН', 'µN')}</b> · {pair > 0 ? L('отталкиваются', 'repel') : L('притягиваются', 'attract')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldLab;
