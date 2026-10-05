import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, Search } from 'lucide-react';
import { SECTIONS, Topic, topicById } from '../../data/curriculum';
import { useProgress } from '../../lib/progress';

type Lang = 'ru' | 'en';
const SUBJ = ['physics', 'chemistry', 'biology'] as const;
const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524' };
const NAME: Record<string, { ru: string; en: string }> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
};

/** hand-picked links where one subject explains another */
const CROSS: [string, string, { ru: string; en: string }][] = [
  ['c8-combustion', 'p8-fuel', { ru: 'энергия горения', en: 'energy of burning' }],
  ['c8-combustion', 'b6-respiration', { ru: 'окисление', en: 'oxidation' }],
  ['p7-diffusion', 'b5-cell-life', { ru: 'диффузия в клетке', en: 'diffusion in cells' }],
  ['p8-eye', 'b8-other-senses', { ru: 'оптика глаза', en: 'optics of the eye' }],
  ['p9-sound', 'b8-other-senses', { ru: 'слух', en: 'hearing' }],
  ['p8-lenses', 'p8-eye', { ru: 'линза', en: 'lens' }],
  ['p10-liquids', 'c11-electrolysis', { ru: 'электролиз', en: 'electrolysis' }],
  ['p8-atom-charge', 'c8-atom', { ru: 'строение атома', en: 'atomic structure' }],
  ['p11-nucleus', 'c11-atom-models', { ru: 'ядро', en: 'nucleus' }],
  ['p9-light-em', 'b6-photosynthesis', { ru: 'свет — энергия фотосинтеза', en: 'light powers photosynthesis' }],
  ['c9-catalysis', 'b10-enzymes', { ru: 'катализ', en: 'catalysis' }],
  ['c10-proteins', 'b10-proteins', { ru: 'белки', en: 'proteins' }],
  ['c10-carbohydrates', 'b10-carbs-lipids', { ru: 'углеводы', en: 'carbohydrates' }],
  ['c10-esters-fats', 'b10-carbs-lipids', { ru: 'жиры', en: 'fats' }],
  ['c8-water', 'b5-cell-chemistry', { ru: 'вода в клетке', en: 'water in cells' }],
  ['p7-atmosphere', 'b8-respiratory-organs', { ru: 'давление и вдох', en: 'pressure and breathing' }],
  ['p7-liquid-pressure', 'b8-vessels-circuits', { ru: 'давление крови', en: 'blood pressure' }],
  ['p8-radiation', 'c11-ecology', { ru: 'парниковый эффект', en: 'greenhouse effect' }],
  ['c11-ecology', 'b11-global-problems', { ru: 'климат', en: 'climate' }],
  ['p9-radioactivity', 'b11-hereditary-diseases', { ru: 'мутации от излучения', en: 'radiation mutations' }],
  ['c9-hydrocarbons', 'c10-oil-gas', { ru: 'углеводороды', en: 'hydrocarbons' }],
  ['p10-semiconductors', 'c9-silicon', { ru: 'кремний', en: 'silicon' }],
  ['b10-photosynthesis', 'c11-redox', { ru: 'окисление-восстановление', en: 'redox' }],
  ['b10-metabolism', 'p10-energy', { ru: 'закон сохранения энергии', en: 'energy conservation' }],
  ['p8-current', 'b8-nervous-structure', { ru: 'нервный импульс — ток', en: 'nerve impulse is a current' }],
  ['c9-biomolecules', 'b9-proteins-enzymes', { ru: 'биомолекулы', en: 'biomolecules' }],
];

interface Node {
  t: Topic;
  x: number;
  y: number;
  sectionIdx: number;
}

const GRADES = [5, 6, 7, 8, 9, 10, 11];
const BAND_H = 300;
const COL_W = 260;

function layout() {
  const nodes: Node[] = [];
  SUBJ.forEach((s, si) => {
    GRADES.forEach((g, gi) => {
      const secs = SECTIONS.filter((x) => x.subject === s && x.grade === g);
      const topics = secs.flatMap((sec, k) => sec.topics.map((t) => ({ t, k })));
      if (!topics.length) return;
      const cols = Math.max(4, Math.ceil(Math.sqrt(topics.length * 1.3)));
      const gap = Math.min(30, (COL_W - 40) / cols);
      topics.forEach(({ t, k }, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        nodes.push({ t, sectionIdx: k, x: gi * COL_W + 30 + c * gap + (r % 2) * (gap / 2), y: si * BAND_H + 60 + r * gap * 0.9 });
      });
    });
  });
  return nodes;
}

/** Zoomable map of the whole course with progress and cross-subject links */
export const CourseMap: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const nodes = useMemo(layout, []);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.t.id, n])), [nodes]);
  const links = useMemo(() => CROSS.filter(([a, b]) => byId.has(a) && byId.has(b)), [byId]);
  const { completed, quiz } = useProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const view = useRef({ x: 20, y: 34, k: 0.62 });
  const fitted = useRef(false);
  const fit = () => {
    const c = canvasRef.current;
    if (!c || !c.clientWidth) return;
    const k = Math.min((c.clientWidth - 40) / (GRADES.length * COL_W), (c.clientHeight - 50) / (SUBJ.length * BAND_H));
    view.current = { x: (c.clientWidth - GRADES.length * COL_W * k) / 2, y: 36, k };
  };
  const [hover, setHover] = useState<{ n: Node; px: number; py: number } | null>(null);
  const [focus, setFocus] = useState<string>('all');
  const [q, setQ] = useState('');
  const [, force] = useState(0);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const query = q.trim().toLowerCase();

  const draw = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== w * dpr) {
      c.width = w * dpr;
      c.height = h * dpr;
    }
    if (!fitted.current) {
      fit();
      fitted.current = true;
    }
    const { x: vx, y: vy, k } = view.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0E0F12';
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * vx, dpr * vy);
    // bands and grade columns
    SUBJ.forEach((s, si) => {
      ctx.fillStyle = si % 2 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.035)';
      ctx.fillRect(0, si * BAND_H, GRADES.length * COL_W, BAND_H);
      ctx.fillStyle = COLOR[s];
      ctx.font = '600 22px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(NAME[s][lang], 12, si * BAND_H + 32);
    });
    GRADES.forEach((g, gi) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(gi * COL_W, 0);
      ctx.lineTo(gi * COL_W, SUBJ.length * BAND_H);
      ctx.stroke();
      ctx.fillStyle = '#8C8F98';
      ctx.font = '500 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${g} ${L('класс', 'grade')}`, gi * COL_W + COL_W / 2, -12);
    });
    // section chains
    ctx.lineWidth = 1;
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1];
      const b = nodes[i];
      if (a.t.sectionId !== b.t.sectionId) continue;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // cross-subject links
    links.forEach(([ai, bi]) => {
      const a = byId.get(ai)!;
      const b = byId.get(bi)!;
      const dim = focus !== 'all' && a.t.subject !== focus && b.t.subject !== focus;
      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, COLOR[a.t.subject]);
      g.addColorStop(1, COLOR[b.t.subject]);
      ctx.strokeStyle = g;
      ctx.globalAlpha = dim ? 0.12 : 0.55;
      ctx.lineWidth = 1.6 / Math.sqrt(k);
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.15;
      const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.15;
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    });
    // topic nodes
    nodes.forEach((n) => {
      const done = completed[n.t.id];
      const col = COLOR[n.t.subject];
      const match = query.length >= 2 && n.t.title[lang].toLowerCase().includes(query);
      const dim = (focus !== 'all' && n.t.subject !== focus) || (query.length >= 2 && !match);
      ctx.globalAlpha = dim ? 0.18 : 1;
      if (done) {
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, match ? 9 : 6.5, 0, Math.PI * 2);
      ctx.fillStyle = done ? col : '#1A1C21';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = match ? '#FFFFFF' : col;
      ctx.stroke();
      if (quiz[n.t.id]?.best === quiz[n.t.id]?.total) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // labels appear when zoomed in
      if (k > 1.5 || match) {
        ctx.fillStyle = '#D5D8DE';
        ctx.font = `${11 / Math.min(k, 2.5) * 1.6}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.t.title[lang].slice(0, 26), n.x, n.y + 18);
      }
      ctx.globalAlpha = 1;
    });
  };

  useEffect(() => {
    draw();
  });

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  const toWorld = (px: number, py: number) => {
    const { x, y, k } = view.current;
    return { x: (px - x) / k, y: (py - y) / k };
  };
  const pick = (px: number, py: number) => {
    const p = toWorld(px, py);
    let best: Node | null = null;
    let bd = 14 / view.current.k + 6;
    nodes.forEach((n) => {
      const d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    });
    return best as Node | null;
  };

  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const zoomAt = (px: number, py: number, f: number) => {
    const v = view.current;
    const k = Math.max(0.3, Math.min(4, v.k * f));
    v.x = px - ((px - v.x) * k) / v.k;
    v.y = py - ((py - v.y) * k) / v.k;
    v.k = k;
    force((n) => n + 1);
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const total = nodes.length;
  const done = nodes.filter((n) => completed[n.t.id]).length;
  const hoverLinks = hover ? links.filter(([a, b]) => a === hover.n.t.id || b === hover.n.t.id) : [];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Карта курса', 'Course map')}</h1>
          <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">
            {L('Все темы с 5 по 11 класс. Пройденные светятся. Пунктир — связи между предметами: химия объясняет биологию, физика — химию.', 'Every topic from grade 5 to 11. Completed ones glow. Dashed lines link subjects: chemistry explains biology, physics explains chemistry.')}
          </p>
        </div>
        <div className="flex gap-3">
          {SUBJ.map((s) => {
            const all = nodes.filter((n) => n.t.subject === s);
            const d = all.filter((n) => completed[n.t.id]).length;
            return (
              <div key={s} className="rounded-xl bg-surface border border-line px-3 py-2 min-w-[96px]">
                <div className="text-[11px] text-ink-2">{NAME[s][lang]}</div>
                <div className="font-mono text-sm text-ink">
                  {d}/{all.length}
                </div>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${(d / all.length) * 100}%`, background: COLOR[s] }} />
                </div>
              </div>
            );
          })}
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...SUBJ] as string[]).map((s) => (
          <button
            key={s}
            onClick={() => setFocus(s)}
            className={`h-9 px-3.5 rounded-full text-sm border cursor-pointer ${focus === s ? 'border-transparent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={focus === s ? { background: '#16171A', color: '#fff' } : undefined}
          >
            {s === 'all' ? L('Все предметы', 'All subjects') : NAME[s][lang]}
          </button>
        ))}
        <label className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Найти тему на карте', 'Find a topic on the map')} className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface border border-line text-sm text-ink outline-none focus:border-accent" />
        </label>
      </div>
      <div ref={wrapRef} className="relative rounded-xl overflow-hidden border border-[#1F2126] h-[70vh] min-h-[460px]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, moved: false };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const r = canvasRef.current!.getBoundingClientRect();
            if (drag.current) {
              const dx = e.clientX - drag.current.x;
              const dy = e.clientY - drag.current.y;
              if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
              view.current.x += dx;
              view.current.y += dy;
              drag.current.x = e.clientX;
              drag.current.y = e.clientY;
              force((n) => n + 1);
              return;
            }
            const n = pick(e.clientX - r.left, e.clientY - r.top);
            setHover(n ? { n, px: e.clientX - r.left, py: e.clientY - r.top } : null);
          }}
          onPointerUp={(e) => {
            const wasDrag = drag.current?.moved;
            drag.current = null;
            if (wasDrag) return;
            const r = canvasRef.current!.getBoundingClientRect();
            const n = pick(e.clientX - r.left, e.clientY - r.top);
            if (n) onOpenTopic(n.t.id);
          }}
          onPointerLeave={() => setHover(null)}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {[
            { icon: <Plus className="w-4 h-4" />, f: () => zoomAt(300, 250, 1.3) },
            { icon: <Minus className="w-4 h-4" />, f: () => zoomAt(300, 250, 1 / 1.3) },
            {
              icon: <RotateCcw className="w-4 h-4" />,
              f: () => {
                fit();
                force((n) => n + 1);
              },
            },
          ].map((b, i) => (
            <button key={i} onClick={b.f} className="w-8 h-8 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[#B5B8C0] hover:text-white flex items-center justify-center cursor-pointer">
              {b.icon}
            </button>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#B5B8C0] flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {L('Пройдено', 'Done')}: <span className="font-mono text-[#EDEDED]">{done}/{total}</span>
          </span>
          <span>{L('колесо — масштаб, перетаскивание — сдвиг', 'wheel to zoom, drag to pan')}</span>
        </div>
        {hover && (
          <div className="pointer-events-none absolute z-10 max-w-[280px] px-3 py-2 rounded-lg bg-[#1A1C21] border border-[#2c2f36] text-[#EDEDED]" style={{ left: Math.min(hover.px + 14, (wrapRef.current?.clientWidth ?? 600) - 290), top: hover.py + 14 }}>
            <div className="text-[11px]" style={{ color: COLOR[hover.n.t.subject] }}>
              {NAME[hover.n.t.subject][lang]} · {hover.n.t.grade} {L('класс', 'grade')}
            </div>
            <div className="text-sm font-medium">{hover.n.t.title[lang]}</div>
            {completed[hover.n.t.id] && <div className="text-[11px] text-[#5FD39A]">✓ {L('пройдена', 'completed')}</div>}
            {hoverLinks.map(([a, b, why]) => {
              const other = topicById(a === hover.n.t.id ? b : a);
              return other ? (
                <div key={a + b} className="mt-1 text-[11.5px] text-[#B5B8C0]">
                  ↔ {other.title[lang]} <span className="text-[#8C8F98]">({why[lang]})</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMap;
