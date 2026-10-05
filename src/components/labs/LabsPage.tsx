import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Atom, Bone, Box, FlaskConical, Grid3x3, Hexagon, Play, Search, Table2 } from 'lucide-react';
import type { StemCategory, VisualMode } from '../../types/stem';
import { buildCatalog, LabItem } from './catalog';
import { SIMS, SimId } from '../sims/registry';
import { ball, Frame } from '../sims/kit';
import { MOLECULE_DATA } from '../../lib/chem/moleculeData';
import { element } from '../../lib/chem/elements';
import { SimView } from '../SimView';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
type Filter = 'all' | StemCategory | '3d';

const SUBJECT: Record<string, { ru: string; en: string; color: string }> = {
  physics: { ru: 'Физика', en: 'Physics', color: '#E5484D' },
  chemistry: { ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  biology: { ru: 'Биология', en: 'Biology', color: '#F5A524' },
  mathematics: { ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
};

/** Live preview: draws a 2D engine frame, animates while hovered */
const ProcessThumb: React.FC<{ item: LabItem; hover: boolean }> = ({ item, hover }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !visible || !('process' in item.sim)) return;
    const sim = SIMS[item.sim.process as SimId];
    const mode = item.sim.mode ?? sim.modes?.[0]?.id ?? 'default';
    const defs = typeof sim.params === 'function' ? sim.params(mode) : sim.params ?? [];
    const p = Object.fromEntries(defs.map((d) => [d.id, d.value]));
    const dur = typeof sim.duration === 'function' ? sim.duration(mode, p) : sim.duration;
    const draw = (t: number) => {
      ctx.setTransform(c.width / 960, 0, 0, c.width / 960, 0, 0);
      const f: Frame = { ctx, w: 960, h: 540, t, p, mode, lang: 'ru', L: (ru) => ru, hit: () => undefined, hitRect: () => undefined };
      ctx.save();
      try {
        sim.draw(f);
      } catch {
        // a preview must never break the gallery
      }
      ctx.restore();
    };
    let t = dur * 0.55;
    draw(t);
    if (!hover) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      t = (t + (now - last) / 1000) % dur;
      last = now;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, hover, item]);
  return <canvas ref={ref} width={480} height={270} className="w-full h-full object-cover" />;
};

/** Molecule preview: atoms projected and depth-sorted */
const MoleculeThumb: React.FC<{ id: string }> = ({ id }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const d = MOLECULE_DATA[id as keyof typeof MOLECULE_DATA];
    ctx.fillStyle = '#111214';
    ctx.fillRect(0, 0, c.width, c.height);
    const a = 0.6;
    const pts = d.atoms.map(([s, x, y, z]) => ({ s, x: x * Math.cos(a) - z * Math.sin(a), y, z: x * Math.sin(a) + z * Math.cos(a) }));
    const cx = pts.reduce((m, p) => m + p.x, 0) / pts.length;
    const cy = pts.reduce((m, p) => m + p.y, 0) / pts.length;
    const span = Math.max(2, ...pts.map((p) => Math.max(Math.abs(p.x - cx), Math.abs(p.y - cy) * 1.6)));
    const k = (c.height * 0.38) / span;
    const X = (p: { x: number }) => c.width / 2 + (p.x - cx) * k;
    const Y = (p: { y: number }) => c.height / 2 - (p.y - cy) * k;
    ctx.strokeStyle = '#8C8F98';
    ctx.lineWidth = Math.max(2, k * 0.12);
    d.bonds.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(X(pts[i]), Y(pts[i]));
      ctx.lineTo(X(pts[j]), Y(pts[j]));
      ctx.stroke();
    });
    [...pts].sort((p, q) => p.z - q.z).forEach((p) => ball(ctx, X(p), Y(p), element(p.s).r * k * 1.1, element(p.s).color));
  }, [id]);
  return <canvas ref={ref} width={480} height={270} className="w-full h-full object-cover" />;
};

const ORDER = ['process', 'molecule', 'reaction', 'model', 'lattice', 'table', 'classic'];

const KIND_ICON: Record<string, React.ReactNode> = {
  model: <Bone className="w-12 h-12" strokeWidth={1.25} />,
  reaction: <FlaskConical className="w-12 h-12" strokeWidth={1.25} />,
  lattice: <Grid3x3 className="w-12 h-12" strokeWidth={1.25} />,
  table: <Table2 className="w-12 h-12" strokeWidth={1.25} />,
  classic: <Atom className="w-12 h-12" strokeWidth={1.25} />,
};

const Thumb: React.FC<{ item: LabItem; hover: boolean; lang: Lang }> = ({ item, hover, lang }) => {
  if (item.kind === 'process') return <ProcessThumb item={item} hover={hover} />;
  if (item.kind === 'molecule' && 'molecules' in item.sim) return <MoleculeThumb id={item.sim.molecules[0]} />;
  const color = SUBJECT[item.subject].color;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: `radial-gradient(circle at 50% 40%, ${color}40, #111214 70%)`, color: '#EDEDED' }}>
      <span className={`transition-transform duration-500 ${hover ? 'scale-110 rotate-6' : ''}`}>{KIND_ICON[item.kind] ?? <Hexagon className="w-12 h-12" strokeWidth={1.25} />}</span>
      {item.formula && <span className="px-3 font-mono text-xs text-[#B5B8C0] text-center line-clamp-1">{item.formula}</span>}
      {!item.formula && item.subtitle && <span className="text-xs text-[#B5B8C0]">{item.subtitle[lang]}</span>}
    </div>
  );
};

const Card: React.FC<{ item: LabItem; lang: Lang; onOpen: () => void }> = ({ item, lang, onOpen }) => {
  const [hover, setHover] = useState(false);
  const s = SUBJECT[item.subject];
  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group text-left bg-surface border border-line rounded-xl overflow-hidden hover:border-line-strong hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative aspect-video bg-[#111214] overflow-hidden">
        <Thumb item={item} hover={hover} lang={lang} />
        {item.is3d && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1A1C21]/90 text-[11px] text-[#EDEDED]">
            <Box className="w-3 h-3" strokeWidth={2} />
            3D
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-lg" style={{ color: '#fff' }}>
            <Play className="w-5 h-5 ml-0.5" strokeWidth={2} />
          </span>
        </span>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          {s[lang]}
          {item.subtitle && item.kind === 'process' && <span className="truncate">· {item.subtitle[lang]}</span>}
        </div>
        <h3 className="mt-1 text-[15px] font-medium text-ink leading-snug line-clamp-2">{item.title[lang]}</h3>
        <p className="mt-1 text-xs text-ink-3">
          {item.topics.length} {lang === 'ru' ? (item.topics.length === 1 ? 'тема' : item.topics.length < 5 ? 'темы' : 'тем') : item.topics.length === 1 ? 'topic' : 'topics'}
        </p>
      </div>
    </button>
  );
};

/** Gallery of every simulation and 3D model in the course */
export const LabsPage: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void; onLaunchSimulation: (m: VisualMode) => void }> = ({ lang, onOpenTopic, onLaunchSimulation }) => {
  const items = useMemo(() => buildCatalog(), []);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<LabItem | null>(null);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((it) => (filter === 'all' ? true : filter === '3d' ? it.is3d : it.subject === filter))
      .filter((it) => !query || it.title[lang].toLowerCase().includes(query) || it.formula?.toLowerCase().includes(query) || it.topics.some((t) => t.title[lang].toLowerCase().includes(query)))
      .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || b.topics.length - a.topics.length);
  }, [items, filter, q, lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (open) progress.recordLab(open.key);
  }, [open]);

  if (open) {
    const s = SUBJECT[open.subject];
    return (
      <div className="flex flex-col gap-5">
        <button onClick={() => setOpen(null)} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Все лаборатории', 'All labs')}
        </button>
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s[lang]}
            {open.subtitle && <span className="normal-case tracking-normal text-ink-3">· {open.subtitle[lang]}</span>}
          </span>
          <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">{open.title[lang]}</h1>
        </div>
        <SimView sim={open.sim} lang={lang} title={open.title[lang]} onLaunchSimulation={onLaunchSimulation} />
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Где это изучают', 'Where it’s taught')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {open.topics.map((t) => (
              <button key={t.id} onClick={() => onOpenTopic(t.id)} className="px-3 py-1.5 rounded-lg bg-surface border border-line hover:border-accent text-sm text-ink cursor-pointer">
                {t.title[lang]} <span className="text-ink-3">· {t.grade} {L('кл.', 'gr.')}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const count = (f: Filter) => items.filter((it) => (f === 'all' ? true : f === '3d' ? it.is3d : it.subject === f)).length;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Лаборатории', 'Labs')}</h1>
          <p className="mt-1 text-[15px] text-ink-2">{L(`${items.length} симуляций и 3D-моделей. Наведи — оживёт, нажми — открой.`, `${items.length} simulations and 3D models. Hover to animate, click to open.`)}</p>
        </div>
        <label className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Найти: ДНК, линза, аммиак…', 'Find: DNA, lens, ammonia…')} className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface border border-line text-sm text-ink outline-none focus:border-accent" />
        </label>
      </header>
      <div className="grid lg:grid-cols-2 gap-4">
      <button
        onClick={() => onLaunchSimulation('sandbox')}
        className="group text-left rounded-xl overflow-hidden border border-[#1F2126] bg-[#111214] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer grid sm:grid-cols-[1fr_auto] items-center"
      >
        <div className="p-5 sm:p-6">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2F5BFF] text-[11px] font-medium" style={{ color: '#fff' }}>
            {L('Новое', 'New')}
          </span>
          <h2 className="mt-2 font-serif text-[26px] leading-tight" style={{ color: '#EDEDED' }}>
            {L('Конструктор опытов по механике', 'Mechanics experiment builder')}
          </h2>
          <p className="mt-1 text-[14.5px] max-w-2xl" style={{ color: '#8C8F98' }}>
            {L('Собери свой опыт из брусков, наклонных плоскостей, блоков, нитей и пружин. Тяготение, трение, закон Гука и сохранение энергии работают вместе — смотри силы и энергию в реальном времени.', 'Build experiments from blocks, inclines, pulleys, ropes and springs. Gravity, friction, Hooke’s law and energy conservation all act together, with live forces and energy.')}
          </p>
        </div>
        <svg viewBox="0 0 220 120" className="hidden xl:block w-44 h-28 mr-5 shrink-0" aria-hidden>
          <path d="M10 110 L150 110 L150 40 Z" fill="#23262C" stroke="#4A4D55" />
          <g transform="translate(92 66) rotate(-26.6)">
            <rect x="-14" y="-14" width="28" height="28" rx="3" fill="#5B8CFF" />
          </g>
          <line x1="104" y1="60" x2="170" y2="27" stroke="#D9C9A3" strokeWidth="2" />
          <circle cx="175" cy="30" r="8" fill="#2C2F36" stroke="#B5B8C0" strokeWidth="2" />
          <line x1="183" y1="30" x2="183" y2="72" stroke="#D9C9A3" strokeWidth="2" />
          <rect x="172" y="72" width="22" height="22" rx="3" fill="#F5A524" />
          <line x1="92" y1="66" x2="92" y2="100" stroke="#E5484D" strokeWidth="3" className="group-hover:opacity-100 opacity-70" />
          <line x1="92" y1="66" x2="78" y2="38" stroke="#30A46C" strokeWidth="3" className="group-hover:opacity-100 opacity-70" />
        </svg>
      </button>
      <button
        onClick={() => onLaunchSimulation('circuits')}
        className="group text-left rounded-xl overflow-hidden border border-[#1F2126] bg-[#111214] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer grid sm:grid-cols-[1fr_auto] items-center"
      >
        <div className="p-5 sm:p-6">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2F5BFF] text-[11px] font-medium" style={{ color: '#fff' }}>
            {L('Новое', 'New')}
          </span>
          <h2 className="mt-2 font-serif text-[26px] leading-tight" style={{ color: '#EDEDED' }}>
            {L('Конструктор электрических цепей', 'Circuit builder')}
          </h2>
          <p className="mt-1 text-[14.5px] max-w-2xl" style={{ color: '#8C8F98' }}>
            {L('Батарейки, резисторы, лампы, реостаты, ключи, амперметры и вольтметры. Закон Ома, правила Кирхгофа и закон Джоуля–Ленца — лампы светятся, а резисторы греются по-настоящему.', 'Batteries, resistors, lamps, rheostats, switches and meters. Ohm’s law, Kirchhoff’s rules and Joule heating, with lamps that really glow.')}
          </p>
        </div>
        <svg viewBox="0 0 220 120" className="hidden xl:block w-44 h-28 mr-5 shrink-0" aria-hidden>
          <path d="M30 30 H190 V95 H30 Z" fill="none" stroke="#B5B8C0" strokeWidth="2.5" />
          <rect x="18" y="52" width="24" height="10" fill="#111214" />
          <line x1="22" y1="50" x2="38" y2="50" stroke="#EDEDED" strokeWidth="2" />
          <line x1="25" y1="62" x2="35" y2="62" stroke="#EDEDED" strokeWidth="5" />
          <circle cx="190" cy="62" r="22" fill="rgba(255,214,10,0.25)" className="group-hover:opacity-100 opacity-70" />
          <circle cx="190" cy="62" r="11" fill="#FFE47A" stroke="#B5B8C0" strokeWidth="2.5" />
          <rect x="88" y="88" width="36" height="14" fill="#1A1C21" stroke="#B5B8C0" strokeWidth="2.5" />
          <circle cx="110" cy="30" r="11" fill="#1A1C21" stroke="#5B8CFF" strokeWidth="2.5" />
          <text x="110" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5B8CFF">A</text>
          <circle cx="60" cy="30" r="3.5" fill="#FFD60A" />
          <circle cx="150" cy="95" r="3.5" fill="#FFD60A" />
        </svg>
      </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['all', '3d', 'physics', 'chemistry', 'biology'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 px-3.5 rounded-full text-sm border transition-colors cursor-pointer ${filter === f ? 'bg-ink text-paper border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={filter === f ? { color: '#fff', background: '#16171A' } : undefined}
          >
            {f === 'all' ? L('Все', 'All') : f === '3d' ? '3D' : SUBJECT[f][lang]} <span className="opacity-60 font-mono text-xs">{count(f)}</span>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {shown.map((it) => (
          <Card key={it.key} item={it} lang={lang} onOpen={() => setOpen(it)} />
        ))}
      </div>
      {shown.length === 0 && <p className="text-ink-2">{L('Ничего не нашлось.', 'Nothing found.')}</p>}
    </div>
  );
};

export default LabsPage;
