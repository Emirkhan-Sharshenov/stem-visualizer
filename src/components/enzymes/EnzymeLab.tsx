import { RangeSlider } from '../ui/RangeSlider';
import { Button, Tooltip } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, FlaskConical, RotateCcw, Thermometer } from 'lucide-react';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

/* Enzymes at work: activity against temperature, pH and the amount of substrate; overheating destroys the enzyme for good. */

type Lang = 'ru' | 'en';
interface Enzyme {
  id: string;
  ru: string;
  en: string;
  where: { ru: string; en: string };
  substrate: { ru: string; en: string };
  product: { ru: string; en: string };
  tOpt: number;
  phOpt: number;
  km: number;
  bubbles?: boolean;
}
const ENZYMES: Enzyme[] = [
  { id: 'amylase', ru: 'Амилаза слюны', en: 'Salivary amylase', where: { ru: 'ротовая полость', en: 'mouth' }, substrate: { ru: 'крахмал', en: 'starch' }, product: { ru: 'мальтоза', en: 'maltose' }, tOpt: 37, phOpt: 6.8, km: 2 },
  { id: 'pepsin', ru: 'Пепсин', en: 'Pepsin', where: { ru: 'желудок', en: 'stomach' }, substrate: { ru: 'белки', en: 'proteins' }, product: { ru: 'пептиды', en: 'peptides' }, tOpt: 37, phOpt: 2, km: 3 },
  { id: 'catalase', ru: 'Каталаза', en: 'Catalase', where: { ru: 'печень, картофель', en: 'liver, potato' }, substrate: { ru: 'пероксид водорода H₂O₂', en: 'hydrogen peroxide H₂O₂' }, product: { ru: 'вода и кислород', en: 'water and oxygen' }, tOpt: 37, phOpt: 7, km: 1.5, bubbles: true },
  { id: 'lipase', ru: 'Липаза поджелудочной', en: 'Pancreatic lipase', where: { ru: 'тонкий кишечник', en: 'small intestine' }, substrate: { ru: 'жиры', en: 'fats' }, product: { ru: 'глицерин и жирные кислоты', en: 'glycerol and fatty acids' }, tOpt: 37, phOpt: 8, km: 2.5 },
];

/** activity 0…1 from temperature: doubles every 10 °C up to the optimum, then the protein unfolds */
const fT = (T: number, opt: number) => (T <= opt ? Math.pow(2, (T - opt) / 10) : Math.max(0, 1 - ((T - opt) / 20) ** 2));
const fPH = (pH: number, opt: number) => Math.exp(-(((pH - opt) / 1.6) ** 2));
const n = (x: number, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ',');

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  done: boolean;
}

export const EnzymeLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [enz, setEnz] = useState(ENZYMES[0]);
  const [T, setT] = useState(25);
  const [pH, setPH] = useState(7);
  const [S, setS] = useState(5);
  const [dead, setDead] = useState(false);
  const [log, setLog] = useState<{ enz: string; T: number; pH: number; S: number; v: number }[]>([]);
  const [made, setMade] = useState(0);
  const hot = useRef(0);
  const tube = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);
  const bubbles = useRef<{ x: number; y: number; r: number }[]>([]);
  const live = useRef({ T, pH, S, enz, dead });
  live.current = { T, pH, S, enz, dead };

  useEffect(() => progress.recordLab('sandbox-enzymes'), []);

  const rate = (t = T, ph = pH, s = S, e = enz, d = dead) => (d ? 0 : fT(t, e.tOpt) * fPH(ph, e.phOpt) * (s / (e.km + s)));
  const v = rate();

  // a fresh tube with substrate molecules
  const refill = () => {
    parts.current = Array.from({ length: 60 }, () => ({ x: Math.random(), y: 0.25 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.004, done: false }));
    bubbles.current = [];
    setMade(0);
  };
  useEffect(refill, [enz]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { T: t, pH: ph, S: s, enz: e, dead: d } = live.current;
      // above 60 °C for more than a second and a half the enzyme is destroyed for good
      if (t >= 60) {
        hot.current += dt;
        if (hot.current > 1.5 && !d) setDead(true);
      } else hot.current = 0;
      const r = rate(t, ph, s, e, d);
      const ps = parts.current;
      const left = ps.filter((p) => !p.done);
      // how many molecules turn into product this frame
      let convert = r * dt * 6;
      while (convert > 0 && left.length) {
        if (Math.random() < Math.min(1, convert)) {
          const p = left.splice(Math.floor(Math.random() * left.length), 1)[0];
          p.done = true;
          if (e.bubbles) bubbles.current.push({ x: p.x, y: p.y, r: 2 + Math.random() * 3 });
          setMade((m) => m + 1);
        }
        convert -= 1;
      }
      const speed = 0.4 + Math.max(0, t) / 40;
      for (const p of ps) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0.04 || p.x > 0.96) p.vx *= -1;
        if (p.y < 0.22 || p.y > 0.97) p.vy *= -1;
      }
      bubbles.current = bubbles.current.map((b) => ({ ...b, y: b.y - 0.006 })).filter((b) => b.y > 0.18);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = () => {
    const cv = tube.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth * dpr;
    const H = cv.clientHeight * dpr;
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    const { T: t, dead: d, enz: e } = live.current;
    // the water bath colour follows the temperature
    const warm = Math.min(1, Math.max(0, t / 80));
    ctx.fillStyle = `rgb(${Math.round(210 + 45 * warm)}, ${Math.round(232 - 90 * warm)}, ${Math.round(255 - 160 * warm)})`;
    ctx.fillRect(0, 0, W, H);
    // the tube
    const tx = W * 0.2;
    const tw = W * 0.6;
    const ty = H * 0.08;
    const th = H * 0.86;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.strokeStyle = '#5A5D66';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, ty + th - tw / 2);
    ctx.arc(tx + tw / 2, ty + th - tw / 2, tw / 2, Math.PI, 0, true);
    ctx.lineTo(tx + tw, ty);
    ctx.fill();
    ctx.stroke();
    const PX = (x: number) => tx + x * tw;
    const PY = (y: number) => ty + y * (th - tw * 0.2);
    for (const p of parts.current) {
      ctx.fillStyle = p.done ? '#30A46C' : '#F5A524';
      ctx.beginPath();
      if (p.done) ctx.arc(PX(p.x), PY(p.y), 3.5 * dpr, 0, Math.PI * 2);
      else ctx.rect(PX(p.x) - 4 * dpr, PY(p.y) - 4 * dpr, 8 * dpr, 8 * dpr);
      ctx.fill();
    }
    // enzyme molecules: open "mouths" while active, crumpled when destroyed
    for (let i = 0; i < 5; i++) {
      const x = PX(0.15 + i * 0.18);
      const y = PY(0.5 + Math.sin(performance.now() / 600 + i) * 0.25);
      ctx.fillStyle = d ? '#9AA0AA' : '#8E4EC6';
      ctx.beginPath();
      if (d) ctx.ellipse(x, y, 9 * dpr, 5 * dpr, i, 0, Math.PI * 2);
      else {
        ctx.moveTo(x, y);
        ctx.arc(x, y, 10 * dpr, 0.5, Math.PI * 2 - 0.5);
      }
      ctx.fill();
    }
    if (e.bubbles)
      for (const b of bubbles.current) {
        ctx.strokeStyle = '#2F5BFF';
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(PX(b.x), PY(b.y), b.r * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
  };

  const curve = (f: (x: number) => number, x0: number, x1: number, cur: number, label: string, unit: string, color: string) => {
    const pts = Array.from({ length: 61 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / 60;
      return [x, f(x)] as const;
    });
    const W = 260;
    const H = 90;
    const P = (x: number, y: number) => `${((x - x0) / (x1 - x0)) * W},${H - y * (H - 8) - 4}`;
    return (
      <div className="rounded-xl border border-line bg-surface p-3">
        <div className="flex justify-between text-xs text-ink-2 mb-1">
          <span>{label}</span>
          <span className="font-mono">
            {x0}–{x1} {unit}
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[90px]">
          <polyline points={pts.map(([x, y]) => P(x, y)).join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
          <line x1={((cur - x0) / (x1 - x0)) * W} x2={((cur - x0) / (x1 - x0)) * W} y1="0" y2={H} stroke="#16171A" strokeDasharray="3 3" />
          <circle cx={((cur - x0) / (x1 - x0)) * W} cy={H - f(cur) * (H - 8) - 4} r="5" fill="#16171A" />
        </svg>
      </div>
    );
  };

  useScreenDetail('lab', `Лаборатория «Ферменты»: ${enz.ru} (оптимум ${enz.tOpt} °C, pH ${enz.phOpt}), сейчас ${T} °C, pH ${pH}, субстрат ${S}. Скорость ${Math.round(v * 100)}% от максимума.${dead ? ' Фермент денатурирован перегревом.' : ''}`);

  const slider = (label: React.ReactNode, value: number, set: (v: number) => void, min: number, max: number, step: number, unit: string, accent: string) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-ink-2">
        <span className="inline-flex items-center gap-1">{label}</span>
        <span className="font-mono text-ink">
          {n(value)} {unit}
        </span>
      </span>
      <RangeSlider value={value} onChange={(v) => set(v)} min={min} max={max} step={step} color={accent} />
    </label>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-5 items-start">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="grid sm:grid-cols-[260px_1fr] gap-3">
          <div className="relative rounded-xl overflow-hidden border border-line">
            <canvas ref={tube} className="block w-full h-[320px]" />
            {dead && <div className="absolute inset-x-3 bottom-3 rounded-lg bg-[#16171A]/85 text-white text-xs p-2 anim-page" style={{ color: '#fff' }}>{L('Перегрев: белок фермента необратимо разрушен (денатурация). Остуди — не поможет, нужна новая пробирка.', 'Overheated: the enzyme protein is destroyed for good. Cooling will not help; take a new tube.')}</div>}
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="text-xs text-ink-2">{L('Скорость реакции', 'Reaction rate')}</div>
              <div className="flex items-end gap-3">
                <span className="font-mono text-3xl text-ink">{Math.round(v * 100)}%</span>
                <span className="text-xs text-ink-3 mb-1">{L('от максимума', 'of maximum')}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${v * 100}%`, background: dead ? '#9AA0AA' : '#8E4EC6' }} />
              </div>
              <p className="mt-2 text-xs text-ink-2">
                {L('Продукта получено', 'Product made')}: <b className="text-ink font-mono">{made}</b> / 60 · <span className="inline-block w-2 h-2 bg-[#F5A524] align-middle" /> {enz.substrate[lang]} → <span className="inline-block w-2 h-2 rounded-full bg-[#30A46C] align-middle" /> {enz.product[lang]}
              </p>
            </div>
            {curve((t) => fT(t, enz.tOpt), 0, 80, T, L('Активность от температуры', 'Activity vs temperature'), '°C', '#E5484D')}
            {curve((p) => fPH(p, enz.phOpt), 1, 12, pH, L('Активность от pH', 'Activity vs pH'), 'pH', '#2F5BFF')}
          </div>
        </div>
        {log.length > 0 && (
          <div className="rounded-xl border border-line bg-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-2">
                <tr className="border-b border-line">
                  <th className="text-left p-2">{L('Фермент', 'Enzyme')}</th>
                  <th className="p-2">t, °C</th>
                  <th className="p-2">pH</th>
                  <th className="p-2">{L('Субстрат', 'Substrate')}</th>
                  <th className="p-2">{L('Скорость', 'Rate')}</th>
                </tr>
              </thead>
              <tbody>
                {log.map((r, i) => (
                  <tr key={i} className="border-b border-line last:border-0 font-mono text-center">
                    <td className="p-2 text-left font-sans">{r.enz}</td>
                    <td className="p-2">{r.T}</td>
                    <td className="p-2">{n(r.pH)}</td>
                    <td className="p-2">{r.S}</td>
                    <td className="p-2">{Math.round(r.v * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <aside className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <div className="grid grid-cols-2 gap-1.5">
          {ENZYMES.map((e) => (
            <button key={e.id} onClick={() => { setEnz(e); setDead(false); }} className={`text-left rounded-lg border p-2 cursor-pointer transition-colors ${enz.id === e.id ? 'border-accent bg-accent-soft' : 'border-line hover:bg-muted'}`}>
              <span className="block text-sm text-ink leading-tight">{lang === 'ru' ? e.ru : e.en}</span>
              <span className="block text-[11px] text-ink-3">{e.where[lang]}</span>
            </button>
          ))}
        </div>
        {slider(<><Thermometer className="w-3.5 h-3.5" /> {L('Температура', 'Temperature')}</>, T, setT, 0, 80, 1, '°C', '#E5484D')}
        {slider('pH', pH, setPH, 1, 12, 0.1, '', '#2F5BFF')}
        {slider(L('Концентрация субстрата', 'Substrate amount'), S, setS, 0, 20, 0.5, L('усл. ед.', 'units'), '#F5A524')}
        <div className="flex gap-2">
          <Button className="flex-1 text-sm font-medium" onPress={() => setLog([...log.slice(-9), { enz: lang === 'ru' ? enz.ru : enz.en, T, pH, S, v }])}>
            <ClipboardList className="w-4 h-4" /> {L('Записать замер', 'Record')}
          </Button>
          <Tooltip><Tooltip.Trigger><Button aria-label={L('Новая пробирка', 'New tube')} variant="outline" className="text-sm" onPress={() => { setDead(false); refill(); }}>
            <FlaskConical className="w-4 h-4" /> <RotateCcw className="w-3.5 h-3.5" />
          </Button></Tooltip.Trigger><Tooltip.Content>{L('Новая пробирка', 'New tube')}</Tooltip.Content></Tooltip>
        </div>
        <div className="border-t border-line pt-3 flex flex-col gap-2 text-sm text-ink-2">
          <p>
            <b className="text-ink">{lang === 'ru' ? enz.ru : enz.en}</b>: {L(`лучше всего работает при ${enz.tOpt} °C и pH ${n(enz.phOpt)}.`, `works best at ${enz.tOpt} °C and pH ${n(enz.phOpt)}.`)}
          </p>
          <div className="overflow-x-auto text-ink">
            <Formula tex={'v = V_{max}\\,\\frac{[S]}{K_m + [S]}'} display />
          </div>
          <p className="text-xs">{L('Чем больше субстрата, тем быстрее реакция — но только до насыщения: все «замки» фермента заняты. Опыт: найди оптимум каждого фермента и запиши замеры.', 'More substrate speeds the reaction up only until saturation, when every enzyme is busy. Try finding each optimum and record it.')}</p>
        </div>
      </aside>
    </div>
  );
};

export default EnzymeLab;
