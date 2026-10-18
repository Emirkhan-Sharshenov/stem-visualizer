import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Play, RotateCcw, Trash2 } from 'lucide-react';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

/* A ball thrown at an angle: speed, angle, launch height, gravity of different worlds and air drag. */

type Lang = 'ru' | 'en';
const PLANETS = [
  { id: 'earth', ru: 'Земля', en: 'Earth', g: 9.81 },
  { id: 'moon', ru: 'Луна', en: 'Moon', g: 1.62 },
  { id: 'mars', ru: 'Марс', en: 'Mars', g: 3.71 },
  { id: 'jupiter', ru: 'Юпитер', en: 'Jupiter', g: 24.8 },
];
const COLORS = ['#2F5BFF', '#E5484D', '#30A46C', '#F5A524', '#8E4EC6'];
const n = (x: number, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ',');

interface Shot {
  pts: [number, number][];
  color: string;
  label: string;
  range: number;
  top: number;
  time: number;
}

/** numeric flight: drag force k·v² opposite to the velocity (k per unit mass) */
function fly(v0: number, deg: number, h0: number, g: number, k: number) {
  const a = (deg * Math.PI) / 180;
  let x = 0;
  let y = h0;
  let vx = v0 * Math.cos(a);
  let vy = v0 * Math.sin(a);
  let t = 0;
  let top = h0;
  const dt = 0.002;
  const pts: [number, number][] = [[0, h0]];
  while (t < 200) {
    const v = Math.hypot(vx, vy);
    vx += -k * v * vx * dt;
    vy += (-g - k * v * vy) * dt;
    const nx = x + vx * dt;
    const ny = y + vy * dt;
    t += dt;
    if (ny < 0) {
      // land exactly on the ground
      const f = y / (y - ny);
      x += (nx - x) * f;
      y = 0;
      pts.push([x, 0]);
      break;
    }
    x = nx;
    y = ny;
    top = Math.max(top, y);
    if (Math.round(t / dt) % 10 === 0) pts.push([x, y]);
  }
  return { pts, range: x, top, time: t };
}

export const ProjectileLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [v0, setV0] = useState(20);
  const [deg, setDeg] = useState(45);
  const [h0, setH0] = useState(0);
  const [planet, setPlanet] = useState(PLANETS[0]);
  const [drag, setDrag] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [flying, setFlying] = useState<{ shot: Shot; start: number } | null>(null);
  const [target, setTarget] = useState<{ x: number; w: number } | null>(null);
  const [score, setScore] = useState({ hits: 0, tries: 0 });
  const [verdict, setVerdict] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [now, setNow] = useState(0);

  useEffect(() => progress.recordLab('sandbox-projectile'), []);

  const k = drag ? 0.012 : 0;
  const preview = useMemo(() => fly(v0, deg, h0, planet.g, k), [v0, deg, h0, planet, k]);
  const a = (deg * Math.PI) / 180;
  const ideal = useMemo(() => {
    const vy = v0 * Math.sin(a);
    const t = (vy + Math.sqrt(vy * vy + 2 * planet.g * h0)) / planet.g;
    return { time: t, range: v0 * Math.cos(a) * t, top: h0 + (vy * vy) / (2 * planet.g) };
  }, [v0, a, h0, planet]);

  // the view fits every trajectory and the target
  const view = useMemo(() => {
    const xs = [preview.range, ...shots.map((s) => s.range), target ? target.x + target.w : 0, 10];
    const ys = [preview.top, ...shots.map((s) => s.top), 5];
    const W = Math.max(...xs) * 1.12;
    const H = Math.max(Math.max(...ys) * 1.25, W * 0.28);
    return { W, H };
  }, [preview, shots, target]);

  const launch = () => {
    const f = fly(v0, deg, h0, planet.g, k);
    const shot: Shot = { ...f, color: COLORS[shots.length % COLORS.length], label: `${v0} м/с · ${deg}°${h0 ? ` · ${h0} м` : ''}${drag ? ' · воздух' : ''}` };
    setFlying({ shot, start: performance.now() });
    setVerdict(null);
  };

  // animate the ball in real time (sped up for long flights)
  useEffect(() => {
    if (!flying) return;
    let raf = 0;
    const tick = () => {
      const speed = Math.max(1, flying.shot.time / 4);
      const t = ((performance.now() - flying.start) / 1000) * speed;
      setNow(t);
      if (t >= flying.shot.time) {
        setShots((s) => [...s.slice(-4), flying.shot]);
        if (target) {
          const hit = flying.shot.range >= target.x && flying.shot.range <= target.x + target.w;
          setScore((sc) => ({ hits: sc.hits + (hit ? 1 : 0), tries: sc.tries + 1 }));
          const miss = flying.shot.range < target.x ? target.x - flying.shot.range : flying.shot.range - target.x - target.w;
          setVerdict(hit ? L('Попадание! 🎯', 'Hit! 🎯') : flying.shot.range < target.x ? L(`Недолёт на ${n(miss)} м`, `Short by ${n(miss)} m`) : L(`Перелёт на ${n(miss)} м`, `Over by ${n(miss)} m`));
          if (hit) progress.recordGame('projectile-target', score.hits + 1, 3);
        }
        setFlying(null);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flying]);

  const newTarget = () => {
    const maxRange = (40 * 40) / planet.g;
    setTarget({ x: Math.round((0.2 + Math.random() * 0.6) * Math.min(maxRange, 120)), w: 3 });
    setVerdict(null);
  };

  // drawing
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const Wpx = cv.clientWidth * dpr;
    const Hpx = cv.clientHeight * dpr;
    cv.width = Wpx;
    cv.height = Hpx;
    const ctx = cv.getContext('2d')!;
    const pad = 36 * dpr;
    const sx = (Wpx - 2 * pad) / view.W;
    const sy = (Hpx - 2 * pad) / view.H;
    const s = Math.min(sx, sy);
    const X = (x: number) => pad + x * s;
    const Y = (y: number) => Hpx - pad - y * s;
    // sky and ground
    const sky = ctx.createLinearGradient(0, 0, 0, Hpx);
    sky.addColorStop(0, planet.id === 'moon' ? '#1B1D24' : planet.id === 'mars' ? '#F3D9C7' : planet.id === 'jupiter' ? '#F4E6CF' : '#EAF2FF');
    sky.addColorStop(1, planet.id === 'moon' ? '#2A2D36' : '#FFFFFF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, Wpx, Hpx);
    ctx.fillStyle = planet.id === 'moon' ? '#8C8F98' : planet.id === 'mars' ? '#C1663A' : planet.id === 'jupiter' ? '#C9A26B' : '#7BBF6A';
    ctx.fillRect(0, Y(0), Wpx, Hpx - Y(0));
    // distance marks
    const step = view.W > 200 ? 50 : view.W > 80 ? 20 : view.W > 30 ? 10 : 5;
    ctx.fillStyle = planet.id === 'moon' ? '#D6D8DE' : '#3D4048';
    ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`;
    for (let x = 0; x <= view.W; x += step) {
      ctx.fillRect(X(x), Y(0), dpr, 6 * dpr);
      ctx.fillText(`${x} м`, X(x) + 3 * dpr, Y(0) + 16 * dpr);
    }
    // tower
    if (h0 > 0) {
      ctx.fillStyle = '#9AA0AA';
      ctx.fillRect(X(-1.2), Y(h0), (1.2 * s), h0 * s);
    }
    // target
    if (target) {
      ctx.fillStyle = '#E5484D';
      ctx.fillRect(X(target.x), Y(0) - 5 * dpr, target.w * s, 10 * dpr);
      ctx.fillStyle = '#fff';
      ctx.fillRect(X(target.x + target.w / 3), Y(0) - 5 * dpr, (target.w / 3) * s, 10 * dpr);
      ctx.font = `600 ${18 * dpr}px system-ui`;
      ctx.fillText('🎯', X(target.x + target.w / 2) - 10 * dpr, Y(0) - 12 * dpr);
    }
    const path = (pts: [number, number][], color: string, width: number, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * dpr;
      ctx.setLineDash(dash.map((d) => d * dpr));
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
      ctx.stroke();
      ctx.setLineDash([]);
    };
    // aim preview, old shots, the flying ball
    if (!flying) path(preview.pts, '#16171A55', 1.5, [6, 6]);
    shots.forEach((sh) => {
      path(sh.pts, sh.color, 2.5);
      ctx.fillStyle = sh.color;
      ctx.beginPath();
      ctx.arc(X(sh.range), Y(0), 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    });
    // launcher pointing along the angle
    ctx.strokeStyle = '#16171A';
    ctx.lineWidth = 6 * dpr;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(X(0), Y(h0));
    ctx.lineTo(X(0) + Math.cos(a) * 28 * dpr, Y(h0) - Math.sin(a) * 28 * dpr);
    ctx.stroke();
    ctx.lineCap = 'butt';
    if (flying) {
      const sh = flying.shot;
      const i = Math.min(sh.pts.length - 1, Math.floor((now / sh.time) * (sh.pts.length - 1)));
      path(sh.pts.slice(0, i + 1), sh.color, 2.5);
      const [bx, by] = sh.pts[i];
      ctx.fillStyle = sh.color;
      ctx.beginPath();
      ctx.arc(X(bx), Y(by), 7 * dpr, 0, Math.PI * 2);
      ctx.fill();
      // velocity components
      if (i > 0) {
        const [px, py] = sh.pts[i - 1];
        const vx = bx - px;
        const vy = by - py;
        const m = 26 * dpr / Math.max(1e-6, Math.hypot(vx, vy));
        ctx.strokeStyle = '#16171A';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(X(bx), Y(by));
        ctx.lineTo(X(bx) + vx * m, Y(by) - vy * m);
        ctx.stroke();
      }
    }
  }, [view, preview, shots, flying, now, target, h0, a, planet]);

  useScreenDetail('lab', `Лаборатория «Бросок под углом»: v0 = ${v0} м/с, угол ${deg}°, высота ${h0} м, ${planet.ru} (g = ${planet.g}), сопротивление воздуха ${drag ? 'включено' : 'выключено'}. Дальность ≈ ${n(preview.range)} м, высота ≈ ${n(preview.top)} м.${target ? ` Цель на ${target.x} м.` : ''}`);

  const slider = (label: string, value: number, set: (v: number) => void, min: number, max: number, step: number, unit: string) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink">
          {value} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" disabled={!!flying} />
    </label>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="relative rounded-xl overflow-hidden border border-line">
          <canvas ref={canvas} className="block w-full h-[340px] md:h-[420px]" />
          {verdict && <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-surface/95 border border-line shadow-md text-sm font-medium text-ink anim-score">{verdict}</div>}
          {target && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-surface/90 border border-line text-xs text-ink-2">
              {L('Попаданий', 'Hits')}: <b className="text-ink">{score.hits}</b> / {score.tries}
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {[
            [L('Дальность', 'Range'), `${n(flying || !shots.length ? preview.range : shots[shots.length - 1].range)} м`],
            [L('Наибольшая высота', 'Max height'), `${n(preview.top)} м`],
            [L('Время полёта', 'Flight time'), `${n(preview.time, 2)} с`],
          ].map(([k2, v]) => (
            <div key={k2} className="rounded-xl border border-line bg-surface p-3">
              <div className="text-xs text-ink-2">{k2}</div>
              <div className="font-mono text-lg text-ink">{v}</div>
            </div>
          ))}
        </div>
        {shots.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {shots.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-line bg-surface text-ink-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.label} → <b className="text-ink">{n(s.range)} м</b>
              </span>
            ))}
          </div>
        )}
      </div>
      <aside className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        {slider(L('Начальная скорость v₀', 'Launch speed v₀'), v0, setV0, 5, 40, 1, 'м/с')}
        {slider(L('Угол броска α', 'Angle α'), deg, setDeg, 5, 85, 1, '°')}
        {slider(L('Высота над землёй', 'Launch height'), h0, setH0, 0, 30, 1, 'м')}
        <div className="flex flex-wrap gap-1.5">
          {PLANETS.map((p) => (
            <button key={p.id} onClick={() => setPlanet(p)} className={`h-8 px-3 rounded-full text-xs border cursor-pointer ${planet.id === p.id ? 'bg-ink text-white border-ink' : 'border-line text-ink-2 hover:text-ink'}`} style={planet.id === p.id ? { color: '#fff', background: '#16171A' } : undefined}>
              {lang === 'ru' ? p.ru : p.en} · {p.g}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={drag} onChange={(e) => setDrag(e.target.checked)} className="accent-[#2F5BFF]" />
          {L('Сопротивление воздуха', 'Air drag')}
        </label>
        <div className="flex gap-2">
          <button onClick={launch} disabled={!!flying} className="flex-1 h-10 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60" style={{ color: '#fff' }}>
            <Play className="w-4 h-4" /> {L('Бросить', 'Launch')}
          </button>
          <button onClick={() => setShots([])} title={L('Стереть траектории', 'Clear')} className="w-10 h-10 rounded-lg border border-line hover:bg-muted inline-flex items-center justify-center cursor-pointer">
            <Trash2 className="w-4 h-4 text-ink-2" />
          </button>
        </div>
        <button onClick={target ? () => { setTarget(null); setScore({ hits: 0, tries: 0 }); } : newTarget} className="h-9 rounded-lg border border-line hover:bg-muted text-sm text-ink inline-flex items-center justify-center gap-1.5 cursor-pointer">
          {target ? <RotateCcw className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
          {target ? L('Убрать цель', 'Remove target') : L('Игра: попади в цель', 'Game: hit the target')}
        </button>
        {target && (
          <button onClick={newTarget} className="text-xs text-accent hover:underline cursor-pointer self-start">
            {L('Новая цель', 'New target')}
          </button>
        )}
        <div className="border-t border-line pt-3 flex flex-col gap-2 text-sm text-ink-2">
          <div className="overflow-x-auto text-ink">
            <Formula tex={'L = \\frac{v_0^2 \\sin 2\\alpha}{g}, \\quad H = \\frac{v_0^2 \\sin^2\\alpha}{2g}'} display />
          </div>
          <p>{L('Без воздуха и с земли дальше всего летит под 45°, а углы 30° и 60° дают одну и ту же дальность.', 'Without air and from the ground, 45° goes furthest, and 30° and 60° land at the same spot.')}</p>
          {!drag && <p className="text-xs text-ink-3">{L(`По формуле: L = ${n(ideal.range)} м, H = ${n(ideal.top)} м, t = ${n(ideal.time, 2)} с.`, `By formula: L = ${n(ideal.range)} m, H = ${n(ideal.top)} m, t = ${n(ideal.time, 2)} s.`)}</p>}
          {drag && <p className="text-xs text-ink-3">{L('С воздухом траектория уже не парабола: спуск круче подъёма, а лучший угол меньше 45°.', 'With air the path is no longer a parabola: the fall is steeper and the best angle is below 45°.')}</p>}
        </div>
      </aside>
    </div>
  );
};

export default ProjectileLab;
