import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hand, RotateCcw, Trash2 } from 'lucide-react';
import { Board, COLS, DEFAULTS, ends, LAMP_MAX_P, Part, PartType, ROWS, solve, Solution } from './solver';
import { CIRCUITS } from './presets';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
type Tool = 'hand' | 'delete' | PartType;

const NAMES: Record<PartType, { ru: string; en: string }> = {
  wire: { ru: 'Провод', en: 'Wire' },
  battery: { ru: 'Батарейка', en: 'Battery' },
  resistor: { ru: 'Резистор', en: 'Resistor' },
  lamp: { ru: 'Лампа', en: 'Lamp' },
  rheostat: { ru: 'Реостат', en: 'Rheostat' },
  switch: { ru: 'Ключ', en: 'Switch' },
  ammeter: { ru: 'Амперметр', en: 'Ammeter' },
  voltmeter: { ru: 'Вольтметр', en: 'Voltmeter' },
};
const TOOLS: PartType[] = ['wire', 'battery', 'resistor', 'lamp', 'rheostat', 'switch', 'ammeter', 'voltmeter'];

const num = (x: number, d = 2) => (Math.abs(x) < 5e-4 ? '0' : x.toFixed(d)).replace('.', ',');

/* ---------- drawing ---------- */

interface Geo {
  sp: number;
  dpr: number;
}
const dot = (g: Geo, x: number, y: number) => ({ x: (x + 0.5) * g.sp, y: (y + 0.5) * g.sp });

function drawBoard(
  ctx: CanvasRenderingContext2D,
  g: Geo,
  board: Board,
  sol: Solution,
  o: { lang: Lang; selected: string | null; hover: string | null; phase: Record<string, number>; electrons: boolean; t: number },
) {
  const W = COLS * g.sp;
  const H = ROWS * g.sp;
  const f = Math.max(10 * g.dpr, g.sp * 0.2);
  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, W, H);
  // breadboard dots
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++) {
      const p = dot(g, x, y);
      ctx.fillStyle = '#2C2F36';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, g.sp * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
  // hover slot
  if (o.hover && !board[o.hover]) {
    const [a, b] = ends(o.hover).map(([x, y]) => dot(g, x, y));
    ctx.strokeStyle = 'rgba(91,140,255,0.5)';
    ctx.lineWidth = g.sp * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const L = (ru: string, en: string) => (o.lang === 'ru' ? ru : en);
  const label = (s: string, x: number, y: number, color = '#EDEDED', bg = 'rgba(17,18,20,0.85)', size = f) => {
    ctx.font = `600 ${size}px Inter, system-ui, sans-serif`;
    const w = ctx.measureText(s).width;
    ctx.fillStyle = bg;
    ctx.fillRect(x - w / 2 - 3, y - size * 0.7, w + 6, size * 1.4);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  };

  for (const [key, part] of Object.entries(board)) {
    const [A, B] = ends(key).map(([x, y]) => dot(g, x, y));
    const res = sol.parts[key];
    const ang = Math.atan2(B.y - A.y, B.x - A.x);
    const len = g.sp;
    const sel = o.selected === key;
    const vertical = key.startsWith('v');
    ctx.save();
    ctx.translate(A.x, A.y);
    ctx.rotate(ang);
    const wireColor = sel ? '#5B8CFF' : '#B5B8C0';
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = Math.max(2, g.sp * 0.05);
    ctx.lineCap = 'round';
    const lead = (from: number, to: number) => {
      ctx.beginPath();
      ctx.moveTo(from, 0);
      ctx.lineTo(to, 0);
      ctx.stroke();
    };
    const m = len / 2;
    const P = res?.P ?? 0;
    switch (part.type) {
      case 'wire':
        lead(0, len);
        break;
      case 'battery': {
        const gap = len * 0.08;
        lead(0, m - gap);
        lead(m + gap, len);
        // long thin plate is "+"
        const plusX = part.dir === 1 ? m + gap : m - gap;
        const minusX = part.dir === 1 ? m - gap : m + gap;
        ctx.strokeStyle = sol.short ? (Math.sin(o.t * 20) > 0 ? '#E5484D' : '#FFD60A') : sel ? '#5B8CFF' : '#EDEDED';
        ctx.lineWidth = Math.max(2, g.sp * 0.04);
        ctx.beginPath();
        ctx.moveTo(plusX, -len * 0.22);
        ctx.lineTo(plusX, len * 0.22);
        ctx.stroke();
        ctx.lineWidth = Math.max(4, g.sp * 0.1);
        ctx.beginPath();
        ctx.moveTo(minusX, -len * 0.12);
        ctx.lineTo(minusX, len * 0.12);
        ctx.stroke();
        break;
      }
      case 'resistor':
      case 'rheostat': {
        const w = len * 0.5;
        const h = len * 0.2;
        lead(0, m - w / 2);
        lead(m + w / 2, len);
        // Joule heating: the body glows as power rises
        const heat = Math.min(1, P / 20);
        ctx.fillStyle = heat > 0.02 ? `rgba(247,107,21,${0.15 + heat * 0.75})` : '#1A1C21';
        ctx.fillRect(m - w / 2, -h / 2, w, h);
        ctx.strokeRect(m - w / 2, -h / 2, w, h);
        if (part.type === 'rheostat') {
          ctx.beginPath();
          ctx.moveTo(m - w * 0.45, h * 1.1);
          ctx.lineTo(m + w * 0.45, -h * 1.1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(m + w * 0.45, -h * 1.1);
          ctx.lineTo(m + w * 0.25, -h * 1.05);
          ctx.lineTo(m + w * 0.4, -h * 0.75);
          ctx.closePath();
          ctx.fillStyle = wireColor;
          ctx.fill();
        }
        break;
      }
      case 'lamp': {
        const r = len * 0.19;
        lead(0, m - r);
        lead(m + r, len);
        const bright = part.burnt ? 0 : Math.min(1, P / 6);
        if (bright > 0.02) {
          const gr = ctx.createRadialGradient(m, 0, r * 0.2, m, 0, r * (2 + bright * 2.5));
          gr.addColorStop(0, `rgba(255,214,10,${0.25 + bright * 0.7})`);
          gr.addColorStop(1, 'rgba(255,214,10,0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(m, 0, r * (2 + bright * 2.5), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = bright > 0.02 ? `rgba(255,230,120,${0.3 + bright * 0.7})` : '#1A1C21';
        ctx.beginPath();
        ctx.arc(m, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        const d = r * 0.7;
        if (part.burnt) {
          ctx.moveTo(m - d, -d);
          ctx.lineTo(m - d * 0.1, -d * 0.1);
          ctx.moveTo(m + d * 0.15, d * 0.15);
          ctx.lineTo(m + d, d);
        } else {
          ctx.moveTo(m - d, -d);
          ctx.lineTo(m + d, d);
          ctx.moveTo(m - d, d);
          ctx.lineTo(m + d, -d);
        }
        ctx.stroke();
        break;
      }
      case 'switch': {
        const a = m - len * 0.2;
        const b = m + len * 0.2;
        lead(0, a);
        lead(b, len);
        ctx.fillStyle = part.on ? '#30A46C' : '#E5484D';
        for (const x of [a, b]) {
          ctx.beginPath();
          ctx.arc(x, 0, g.sp * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
        const open = part.on ? -0.12 : -0.6;
        ctx.beginPath();
        ctx.moveTo(a, 0);
        ctx.lineTo(a + Math.cos(open) * (b - a) * 1.05, Math.sin(open) * (b - a) * 1.05);
        ctx.stroke();
        break;
      }
      case 'ammeter':
      case 'voltmeter': {
        const r = len * 0.2;
        lead(0, m - r);
        lead(m + r, len);
        ctx.fillStyle = '#1A1C21';
        ctx.beginPath();
        ctx.arc(m, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = part.type === 'ammeter' ? '#5B8CFF' : '#30A46C';
        ctx.stroke();
        break;
      }
    }
    ctx.restore();

    // upright texts
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const side = ends(key)[0][0] >= COLS / 2 ? -1 : 1;
    const off = (k: number) => (vertical ? { x: mid.x + g.sp * k * side, y: mid.y } : { x: mid.x, y: mid.y - g.sp * k });
    if (part.type === 'ammeter' || part.type === 'voltmeter') {
      ctx.fillStyle = part.type === 'ammeter' ? '#5B8CFF' : '#30A46C';
      ctx.font = `700 ${f * 1.05}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(part.type === 'ammeter' ? 'A' : 'V', mid.x, mid.y);
      const v = part.type === 'ammeter' ? `${num(Math.abs(res?.I ?? 0))} ${L('А', 'A')}` : `${num(Math.abs(res?.U ?? 0))} ${L('В', 'V')}`;
      const p = vertical ? off(0.62) : off(0.36);
      label(v, p.x, p.y, part.type === 'ammeter' ? '#8FA4FF' : '#5DD39E', 'rgba(17,18,20,0.9)', f * 0.95);
    } else if (part.type !== 'wire' && part.type !== 'switch') {
      const v = part.type === 'battery' ? `${num(part.emf, 1)} ${L('В', 'V')}` : `${num(part.R, part.R < 10 ? 1 : 0)} ${L('Ом', 'Ω')}`;
      const p = vertical ? off(0.55) : off(0.34);
      label(v, p.x, p.y, '#B5B8C0', 'rgba(17,18,20,0.75)', f * 0.85);
      if (part.type === 'battery') {
        const plus = part.dir === 1 ? B : A;
        const pp = { x: (mid.x + plus.x) / 2, y: (mid.y + plus.y) / 2 };
        label('+', pp.x + (vertical ? -g.sp * 0.22 * side : 0), pp.y + (vertical ? 0 : -g.sp * 0.2), '#E5484D', 'transparent', f);
      }
    }

    // moving charges
    const I = res?.I ?? 0;
    if (Math.abs(I) > 1e-3 && !(part.type === 'lamp' && part.burnt)) {
      const ph = o.phase[key] ?? 0;
      const n = 3;
      const sign = (I > 0 ? 1 : -1) * (o.electrons ? -1 : 1);
      ctx.fillStyle = o.electrons ? '#8FA4FF' : '#FFD60A';
      for (let i = 0; i < n; i++) {
        let k = (i / n + ph) % 1;
        if (sign < 0) k = 1 - k;
        const x = A.x + (B.x - A.x) * k;
        const y = A.y + (B.y - A.y) * k;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, g.sp * 0.045), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (sel) {
      ctx.strokeStyle = 'rgba(91,140,255,0.35)';
      ctx.lineWidth = g.sp * 0.32;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }> = ({ label, value, min, max, step, unit, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="flex justify-between text-xs text-ink-2">
      <span>{label}</span>
      <span className="font-mono text-ink">
        {num(value, step < 1 ? 1 : 0)} {unit}
      </span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" />
  </label>
);

/* ---------- component ---------- */

export const CircuitLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [presetId, setPresetId] = useState('simple');
  const preset = CIRCUITS.find((p) => p.id === presetId)!;
  const [board, setBoard] = useState<Board>(() => preset.make());
  const [selected, setSelected] = useState<string | null>(preset.focus ?? null);
  const [tool, setTool] = useState<Tool>('hand');
  const [electrons, setElectrons] = useState(false);
  const [burntMsg, setBurntMsg] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geo = useRef<Geo>({ sp: 60, dpr: 1 });
  const phase = useRef<Record<string, number>>({});
  const hover = useRef<string | null>(null);
  const wireFrom = useRef<[number, number] | null>(null);
  const sol = useMemo(() => solve(board), [board]);
  const solRef = useRef(sol);
  solRef.current = sol;
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => progress.recordLab('sandbox-circuits'), []);

  // lamps burn out when overloaded
  useEffect(() => {
    const over = Object.entries(board).filter(([k, p]) => p.type === 'lamp' && !p.burnt && (sol.parts[k]?.P ?? 0) > LAMP_MAX_P);
    if (!over.length) return;
    const t = setTimeout(() => {
      setBoard((b) => ({ ...b, ...Object.fromEntries(over.map(([k, p]) => [k, { ...p, burnt: true }])) }));
      setBurntMsg(true);
    }, 700);
    return () => clearTimeout(t);
  }, [board, sol]);

  const load = (id: string) => {
    const p = CIRCUITS.find((x) => x.id === id)!;
    setPresetId(id);
    setBoard(p.make());
    setSelected(p.focus ?? null);
    setTool('hand');
    setBurntMsg(false);
  };

  // size + animation
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const sp = (c.clientWidth * dpr) / COLS;
      c.width = Math.round(COLS * sp);
      c.height = Math.round(ROWS * sp);
      geo.current = { sp, dpr };
    });
    ro.observe(c);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = solRef.current;
      for (const [k, r] of Object.entries(s.parts)) {
        // charge speed grows with current (log scale so both mA and A are visible)
        const v = Math.min(2.2, Math.log10(1 + Math.abs(r.I) * 20) * 0.9);
        phase.current[k] = ((phase.current[k] ?? Math.random()) + v * dt) % 1;
      }
      const ctx = c.getContext('2d');
      if (ctx) drawBoard(ctx, geo.current, boardRef.current, s, { lang, selected, hover: hover.current, phase: phase.current, electrons, t: now / 1000 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lang, selected, electrons]);

  /* ---------- pointer ---------- */

  const gridPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    const sp = geo.current.sp;
    return { gx: ((e.clientX - r.left) * k) / sp - 0.5, gy: ((e.clientY - r.top) * k) / sp - 0.5 };
  };
  const nearestEdge = (gx: number, gy: number): string | null => {
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    // closer to a horizontal or a vertical grid line?
    const dh = Math.min(fy, 1 - fy);
    const dv = Math.min(fx, 1 - fx);
    if (dh < dv) {
      const y = Math.round(gy);
      const x = Math.floor(gx);
      if (x >= 0 && x < COLS - 1 && y >= 0 && y < ROWS && dh < 0.35) return `h:${x},${y}`;
    } else {
      const x = Math.round(gx);
      const y = Math.floor(gy);
      if (y >= 0 && y < ROWS - 1 && x >= 0 && x < COLS && dv < 0.35) return `v:${x},${y}`;
    }
    return null;
  };
  const nearDot = (gx: number, gy: number): [number, number] | null => {
    const x = Math.round(gx);
    const y = Math.round(gy);
    return Math.hypot(gx - x, gy - y) < 0.3 && x >= 0 && x < COLS && y >= 0 && y < ROWS ? [x, y] : null;
  };
  const edgeBetween = (a: [number, number], b: [number, number]) => {
    if (a[1] === b[1] && Math.abs(a[0] - b[0]) === 1) return `h:${Math.min(a[0], b[0])},${a[1]}`;
    if (a[0] === b[0] && Math.abs(a[1] - b[1]) === 1) return `v:${a[0]},${Math.min(a[1], b[1])}`;
    return null;
  };

  const place = (key: string, type: PartType) => setBoard((b) => ({ ...b, [key]: { ...DEFAULTS[type] } }));

  const onDown = (e: React.PointerEvent) => {
    const { gx, gy } = gridPos(e);
    if (tool === 'wire') {
      const d = nearDot(gx, gy);
      if (d) {
        wireFrom.current = d;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }
    }
    const key = nearestEdge(gx, gy);
    if (!key) {
      if (tool === 'hand') setSelected(null);
      return;
    }
    if (tool === 'delete') {
      setBoard((b) => {
        const n = { ...b };
        delete n[key];
        return n;
      });
      if (selected === key) setSelected(null);
      return;
    }
    if (tool === 'hand') {
      if (!board[key]) return setSelected(null);
      setSelected(key);
      if (board[key].type === 'switch') setBoard((b) => ({ ...b, [key]: { ...b[key], on: !b[key].on } }));
      return;
    }
    if (board[key]?.type === tool) {
      setSelected(key);
      return;
    }
    place(key, tool);
    setSelected(key);
  };

  const onMove = (e: React.PointerEvent) => {
    const { gx, gy } = gridPos(e);
    hover.current = tool !== 'hand' && tool !== 'delete' ? nearestEdge(gx, gy) : null;
    if (tool === 'wire' && wireFrom.current) {
      const d = nearDot(gx, gy);
      if (d && (d[0] !== wireFrom.current[0] || d[1] !== wireFrom.current[1])) {
        const k = edgeBetween(wireFrom.current, d);
        if (k) {
          if (!boardRef.current[k]) place(k, 'wire');
          wireFrom.current = d;
        }
      }
    }
  };
  const onUp = () => {
    wireFrom.current = null;
  };

  /* ---------- inspector ---------- */

  const part = selected ? board[selected] : undefined;
  const res = selected ? sol.parts[selected] : undefined;
  const set = (patch: Partial<Part>) => selected && setBoard((b) => ({ ...b, [selected]: { ...b[selected], ...patch } }));

  const batteries = Object.entries(board).filter(([, p]) => p.type === 'battery');
  const anyCurrent = Object.values(sol.parts).some((r) => Math.abs(r.I) > 1e-3);
  const status = sol.short
    ? { tone: 'bad', text: L('Короткое замыкание! Ток через батарейку огромный — так она быстро разрядится или сгорит.', 'Short circuit! A huge current flows through the battery: it will drain or overheat fast.') }
    : burntMsg
      ? { tone: 'bad', text: L('Лампа перегорела: мощность была больше допустимой. Выбери её и нажми «Заменить».', 'A lamp burnt out: the power was too high. Select it and press “Replace”.') }
      : batteries.length && !anyCurrent
        ? { tone: 'warn', text: L('Ток не идёт: цепь разомкнута. Проверь ключ и провода.', 'No current: the circuit is open. Check the switch and wires.') }
        : !batteries.length
          ? { tone: 'warn', text: L('В цепи нет источника тока — добавь батарейку.', 'There is no power source: add a battery.') }
          : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CIRCUITS.map((p) => (
          <button
            key={p.id}
            onClick={() => load(p.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-sm border cursor-pointer ${presetId === p.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={presetId === p.id ? { color: '#fff' } : undefined}
          >
            {p.title[lang]}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{preset.laws[lang]}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{preset.hint[lang]}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTool('hand')}
          className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${tool === 'hand' ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
          style={tool === 'hand' ? { color: '#fff' } : undefined}
        >
          <Hand className="w-4 h-4" />
          {L('Выбрать', 'Select')}
        </button>
        {TOOLS.map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`h-9 px-3 rounded-lg text-sm border cursor-pointer ${tool === t ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
            style={tool === t ? { color: '#fff' } : undefined}
          >
            {NAMES[t][lang]}
          </button>
        ))}
        <button
          onClick={() => setTool('delete')}
          className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${tool === 'delete' ? 'bg-[#E5484D] border-[#E5484D]' : 'bg-surface border-line text-ink hover:bg-muted'}`}
          style={tool === 'delete' ? { color: '#fff' } : undefined}
        >
          <Trash2 className="w-4 h-4" />
          {L('Удалить', 'Delete')}
        </button>
      </div>
      <p className="text-xs text-ink-3 -mt-2">
        {tool === 'hand'
          ? L('Нажми на деталь, чтобы изменить её. Нажатие на ключ замыкает и размыкает его.', 'Tap a part to change it. Tapping a switch opens and closes it.')
          : tool === 'delete'
            ? L('Нажми на деталь, чтобы убрать её.', 'Tap a part to remove it.')
            : tool === 'wire'
              ? L('Тяни от точки к точке — провод проложится сам. Или нажми между двумя точками.', 'Drag from dot to dot to lay a wire, or tap between two dots.')
              : L(`Нажми между двумя соседними точками, чтобы поставить: ${NAMES[tool].ru.toLowerCase()}.`, `Tap between two neighbouring dots to place a ${NAMES[tool].en.toLowerCase()}.`)}
      </p>

      <div className="rounded-xl overflow-hidden border border-[#1F2126]">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => (hover.current = null)}
          className={`block w-full touch-none select-none ${tool === 'hand' ? 'cursor-pointer' : 'cursor-crosshair'}`}
        />
      </div>

      {status && (
        <div className={`rounded-xl px-4 py-3 text-sm ${status.tone === 'bad' ? 'bg-[#FDF0EF] text-[#CC2F35]' : 'bg-[#FFF8E8] text-[#8A4B0F]'}`}>{status.text}</div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input type="checkbox" checked={electrons} onChange={(e) => setElectrons(e.target.checked)} className="w-4 h-4 accent-[#2F5BFF]" />
          {electrons ? L('Показаны электроны (движутся от − к +)', 'Showing electrons (− to +)') : L('Показать движение электронов вместо направления тока', 'Show electrons instead of current direction')}
        </label>
        <button onClick={() => load(presetId)} className="ml-auto h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
          <RotateCcw className="w-4 h-4" />
          {L('Сбросить схему', 'Reset circuit')}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 items-start">
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{L('Выбранная деталь', 'Selected part')}</h3>
          {part ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-ink">{NAMES[part.type][lang]}</div>
              {part.type === 'battery' && (
                <>
                  <Slider label={L('ЭДС ε', 'EMF ε')} value={part.emf} min={1.5} max={24} step={0.5} unit={L('В', 'V')} onChange={(emf) => set({ emf })} />
                  <Slider label={L('Внутреннее сопротивление r', 'Internal resistance r')} value={part.r} min={0} max={5} step={0.1} unit={L('Ом', 'Ω')} onChange={(r) => set({ r })} />
                  <button onClick={() => set({ dir: part.dir === 1 ? -1 : 1 })} className="self-start h-8 px-3 rounded-lg border border-line text-sm text-ink hover:bg-muted cursor-pointer">
                    {L('Перевернуть полюса', 'Flip polarity')}
                  </button>
                </>
              )}
              {(part.type === 'resistor' || part.type === 'lamp' || part.type === 'rheostat') && (
                <Slider
                  label={L('Сопротивление R', 'Resistance R')}
                  value={part.R}
                  min={part.type === 'rheostat' ? 0 : 1}
                  max={part.type === 'lamp' ? 30 : part.type === 'rheostat' ? 50 : 100}
                  step={part.type === 'rheostat' ? 0.5 : 1}
                  unit={L('Ом', 'Ω')}
                  onChange={(R) => set({ R })}
                />
              )}
              {part.type === 'lamp' && part.burnt && (
                <button
                  onClick={() => {
                    set({ burnt: false });
                    setBurntMsg(false);
                  }}
                  className="self-start h-8 px-3 rounded-lg bg-accent text-sm cursor-pointer"
                  style={{ color: '#fff' }}
                >
                  {L('Заменить лампу', 'Replace the lamp')}
                </button>
              )}
              {part.type === 'switch' && (
                <button onClick={() => set({ on: !part.on })} className="self-start h-8 px-3 rounded-lg border border-line text-sm text-ink hover:bg-muted cursor-pointer">
                  {part.on ? L('Разомкнуть', 'Open') : L('Замкнуть', 'Close')}
                </button>
              )}
              {part.type === 'voltmeter' && <p className="text-xs text-ink-3">{L('У вольтметра очень большое сопротивление — ток через него почти не идёт. Подключай его параллельно.', 'A voltmeter has a huge resistance, so almost no current flows through it. Connect it in parallel.')}</p>}
              {part.type === 'ammeter' && <p className="text-xs text-ink-3">{L('У амперметра почти нулевое сопротивление. Подключай его последовательно — параллельно он устроит короткое замыкание.', 'An ammeter has almost zero resistance. Put it in series; in parallel it shorts the circuit.')}</p>}
              <button
                onClick={() => {
                  setBoard((b) => {
                    const n = { ...b };
                    delete n[selected!];
                    return n;
                  });
                  setSelected(null);
                }}
                className="self-start text-xs text-[#CC2F35] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {L('Удалить', 'Delete')}
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink-3">{L('Нажми на деталь в схеме.', 'Tap a part in the circuit.')}</p>
          )}
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{L('Измерения', 'Readings')}</h3>
          {part && res && part.type !== 'wire' ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { k: L('Сила тока I', 'Current I'), v: `${num(Math.abs(res.I))} ${L('А', 'A')}` },
                { k: L('Напряжение U', 'Voltage U'), v: `${num(Math.abs(part.type === 'battery' ? res.U : res.U))} ${L('В', 'V')}` },
                ...(part.type === 'resistor' || part.type === 'lamp' || part.type === 'rheostat' ? [{ k: L('Сопротивление R = U/I', 'Resistance R = U/I'), v: `${num(part.R, 1)} ${L('Ом', 'Ω')}` }] : []),
                ...(part.type === 'battery'
                  ? [
                      { k: L('Отдаёт в цепь P = UI', 'Delivers P = UI'), v: `${num(Math.abs(res.U * res.I))} ${L('Вт', 'W')}` },
                      { k: L('Греется внутри I²r', 'Heats inside I²r'), v: `${num(res.P)} ${L('Вт', 'W')}` },
                    ]
                  : part.type !== 'ammeter' && part.type !== 'voltmeter' && part.type !== 'switch'
                    ? [{ k: L('Мощность P = I²R', 'Power P = I²R'), v: `${num(res.P)} ${L('Вт', 'W')}` }]
                    : []),
              ].map((r) => (
                <div key={r.k} className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-[11px] text-ink-2">{r.k}</div>
                  <div className="font-mono text-ink">{r.v}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-3">{L('Выбери деталь — покажу ток, напряжение и мощность.', 'Pick a part to see its current, voltage and power.')}</p>
          )}
          {batteries.length > 0 && (
            <p className="mt-3 text-xs text-ink-2">
              {L('Ток через источник', 'Source current')}: <span className="font-mono text-ink">{num(Math.abs(sol.parts[batteries[0][0]]?.I ?? 0))} {L('А', 'A')}</span>
              {' · '}
              {L('тепло за 1 мин во всей цепи', 'heat per minute in the circuit')}:{' '}
              <span className="font-mono text-ink">
                {num(Object.values(sol.parts).reduce((s, r) => s + r.P, 0) * 60, 0)} {L('Дж', 'J')}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitLab;
