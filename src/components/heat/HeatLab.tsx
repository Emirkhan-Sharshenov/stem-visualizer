import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Body, equilibrium, fmt, fmtJ, Kind, makeBody, stages, state, SUBST } from './heat';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; digits?: number; onChange: (v: number) => void }> = ({ label, value, min, max, step, unit, digits = 1, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="flex justify-between text-xs text-ink-2">
      <span>{label}</span>
      <span className="font-mono text-ink">
        {fmt(value, digits)} {unit}
      </span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" />
  </label>
);

/* ---------- vessel drawing (shared) ---------- */

function drawVessel(ctx: CanvasRenderingContext2D, w: number, h: number, bodies: Body[], o: { flame: number; t: number; dpr: number; lang: Lang; tempC: number }) {
  const { dpr } = o;
  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, w, h);
  const bx = w * 0.28;
  const bw = w * 0.36;
  const top = h * 0.12;
  const bottom = h * (o.flame > 0 ? 0.72 : 0.88);
  const bh = bottom - top;
  const f = Math.max(11 * dpr, w / 48);

  // burner and flame
  if (o.flame > 0) {
    ctx.fillStyle = '#2C2F36';
    ctx.fillRect(bx + bw * 0.3, h * 0.86, bw * 0.4, h * 0.1);
    ctx.fillRect(bx - 6 * dpr, bottom + 6 * dpr, bw + 12 * dpr, 4 * dpr);
    const fh = h * 0.05 + h * 0.07 * o.flame;
    for (let i = 0; i < 3; i++) {
      const wob = Math.sin(o.t * 12 + i * 2) * 3 * dpr;
      const g = ctx.createRadialGradient(bx + bw / 2 + wob, h * 0.86, 2, bx + bw / 2, h * 0.86 - fh / 2, fh);
      g.addColorStop(0, 'rgba(120,170,255,0.95)');
      g.addColorStop(0.4, 'rgba(255,170,60,0.75)');
      g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(bx + bw / 2 + wob, h * 0.86 - fh / 2, bw * 0.12 * (1 - i * 0.2), fh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const water = bodies.filter((b) => b.kind === 'water');
  const metals = bodies.filter((b) => b.kind !== 'water');
  let liquidKg = 0;
  let iceKg = 0;
  let steamKg = 0;
  for (const b of water) {
    const s = state(b);
    liquidKg += s.liquid * b.m;
    iceKg += s.ice * b.m;
    steamKg += s.steam * b.m;
  }
  const scaleKg = Math.max(1.2, water.reduce((s, b) => s + b.m, 0) * 1.25);
  const level = bottom - (liquidKg / scaleKg) * bh;
  // liquid
  if (liquidKg > 1e-4) {
    const warm = Math.max(0, Math.min(1, o.tempC / 100));
    ctx.fillStyle = `rgba(${Math.round(70 + 50 * warm)},${Math.round(140 - 20 * warm)},${Math.round(230 - 60 * warm)},0.45)`;
    ctx.fillRect(bx, level, bw, bottom - level);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(bx, level);
    ctx.lineTo(bx + bw, level);
    ctx.stroke();
  }
  // ice cubes float (or sit if there is no water)
  const cubes = Math.min(12, Math.ceil(iceKg / 0.08));
  const side = Math.min(bw / 4, Math.max(10 * dpr, Math.cbrt(iceKg / Math.max(1, cubes)) * bw * 0.9));
  for (let i = 0; i < cubes; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = bx + 6 * dpr + col * (bw - 12 * dpr) / 4 + Math.sin(o.t + i) * 2 * dpr;
    const yBase = liquidKg > 0.01 ? level - side * 0.2 : bottom - side;
    const y = yBase - row * side * 0.9 + (liquidKg > 0.01 ? Math.sin(o.t * 1.5 + i) * 1.5 * dpr : 0);
    ctx.fillStyle = 'rgba(220,240,255,0.85)';
    ctx.strokeStyle = 'rgba(160,200,240,0.9)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.roundRect(x, y, side, side, 3 * dpr);
    ctx.fill();
    ctx.stroke();
  }
  // metal blocks on the bottom
  metals.forEach((b, i) => {
    const s = Math.min(bw / 3, Math.max(14 * dpr, Math.cbrt(b.m / SUBST[b.kind].density) * bw * 2.2));
    const x = bx + 8 * dpr + i * (s + 6 * dpr);
    const T = state(b).T;
    ctx.fillStyle = SUBST[b.kind].color;
    ctx.fillRect(x, bottom - s, s, s);
    if (T > 100) {
      ctx.fillStyle = `rgba(255,80,20,${Math.min(0.6, (T - 100) / 400)})`;
      ctx.fillRect(x, bottom - s, s, s);
    }
  });
  // boiling bubbles and steam
  const tempNow = o.tempC;
  if (liquidKg > 0.01 && tempNow > 70) {
    const n = tempNow >= 99.9 ? 26 : Math.round((tempNow - 70) / 3);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2 * dpr;
    for (let i = 0; i < n; i++) {
      const ph = (o.t * (0.6 + (i % 5) * 0.15) + i * 0.37) % 1;
      const x = bx + ((i * 53) % 100) / 100 * bw;
      const y = bottom - ph * (bottom - level);
      ctx.beginPath();
      ctx.arc(x, y, (1.5 + (i % 3)) * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (tempNow >= 99.9 || steamKg > 0) {
    for (let i = 0; i < 8; i++) {
      const ph = (o.t * 0.4 + i / 8) % 1;
      ctx.fillStyle = `rgba(230,235,245,${0.25 * (1 - ph)})`;
      ctx.beginPath();
      ctx.arc(bx + bw * (0.2 + (i % 4) * 0.2) + Math.sin(o.t + i) * 8 * dpr, top - ph * top * 0.9, (8 + ph * 18) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // glass
  ctx.strokeStyle = 'rgba(220,230,240,0.75)';
  ctx.lineWidth = 3 * dpr;
  ctx.beginPath();
  ctx.moveTo(bx, top);
  ctx.lineTo(bx, bottom);
  ctx.lineTo(bx + bw, bottom);
  ctx.lineTo(bx + bw, top);
  ctx.stroke();

  // thermometer
  const tx = bx + bw + w * 0.1;
  const tTop = top;
  const tBot = bottom - 10 * dpr;
  const Tmin = -40;
  const Tmax = 140;
  ctx.fillStyle = '#1A1C21';
  ctx.strokeStyle = '#4A4D55';
  ctx.lineWidth = 1.5 * dpr;
  ctx.beginPath();
  ctx.roundRect(tx - 6 * dpr, tTop, 12 * dpr, tBot - tTop, 6 * dpr);
  ctx.fill();
  ctx.stroke();
  const y = (T: number) => tBot - ((Math.max(Tmin, Math.min(Tmax, T)) - Tmin) / (Tmax - Tmin)) * (tBot - tTop);
  ctx.fillStyle = tempNow < 0 ? '#5B8CFF' : '#E5484D';
  ctx.fillRect(tx - 3 * dpr, y(tempNow), 6 * dpr, tBot - y(tempNow));
  ctx.beginPath();
  ctx.arc(tx, tBot + 4 * dpr, 9 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8C8F98';
  ctx.font = `${f * 0.7}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (const T of [-40, 0, 50, 100, 140]) {
    ctx.fillRect(tx + 7 * dpr, y(T), 6 * dpr, 1.5 * dpr);
    ctx.fillText(`${T}°`, tx + 16 * dpr, y(T));
  }
  ctx.fillStyle = '#EDEDED';
  ctx.font = `700 ${f * 1.2}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${fmt(tempNow, 1)} °C`, tx, tTop - 16 * dpr);
  // contents
  ctx.font = `${f * 0.8}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = '#B5B8C0';
  ctx.textAlign = 'left';
  const L = (ru: string, en: string) => (o.lang === 'ru' ? ru : en);
  const lines = [iceKg > 1e-4 ? `${L('лёд', 'ice')} ${fmt(iceKg, 3)} ${L('кг', 'kg')}` : '', liquidKg > 1e-4 ? `${L('вода', 'water')} ${fmt(liquidKg, 3)} ${L('кг', 'kg')}` : '', steamKg > 1e-4 ? `${L('пар', 'steam')} ${fmt(steamKg, 3)} ${L('кг', 'kg')}` : ''].filter(Boolean);
  lines.forEach((s, i) => ctx.fillText(s, 10 * dpr, top + i * f * 1.3));
}

/* ---------- heating curve ---------- */

const Curve: React.FC<{ data: { t: number; T: number }[]; lang: Lang }> = ({ data, lang }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    const w = c.width;
    const h = c.height;
    const pad = 34 * dpr;
    ctx.clearRect(0, 0, w, h);
    const tMax = Math.max(60, data[data.length - 1]?.t ?? 60);
    const Tlo = Math.min(-20, ...data.map((d) => d.T));
    const Thi = Math.max(110, ...data.map((d) => d.T));
    const X = (t: number) => pad + (t / tMax) * (w - pad - 8 * dpr);
    const Y = (T: number) => h - pad - ((T - Tlo) / (Thi - Tlo)) * (h - pad - 10 * dpr);
    ctx.strokeStyle = '#E5E5E0';
    ctx.fillStyle = '#8A8A85';
    ctx.font = `${10 * dpr}px Inter, system-ui, sans-serif`;
    ctx.lineWidth = dpr;
    for (const T of [0, 100]) {
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath();
      ctx.moveTo(pad, Y(T));
      ctx.lineTo(w, Y(T));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(`${T} °C`, 2 * dpr, Y(T) + 3 * dpr);
    }
    ctx.beginPath();
    ctx.moveTo(pad, 4);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w, h - pad);
    ctx.stroke();
    ctx.fillText(lang === 'ru' ? 't, мин' : 't, min', w - 40 * dpr, h - pad + 16 * dpr);
    for (let k = 0; k <= 4; k++) {
      const tt = (tMax * k) / 4;
      ctx.fillText(fmt(tt / 60, 1), X(tt) - 6 * dpr, h - pad + 14 * dpr);
    }
    if (data.length < 2) return;
    ctx.strokeStyle = '#E5484D';
    ctx.lineWidth = 2.5 * dpr;
    ctx.beginPath();
    data.forEach((d, i) => (i ? ctx.lineTo(X(d.t), Y(d.T)) : ctx.moveTo(X(d.t), Y(d.T))));
    ctx.stroke();
  }, [data, lang]);
  return <canvas ref={ref} className="w-full h-48 block" />;
};

/* ---------- heating mode ---------- */

const Heating: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [kind, setKind] = useState<Kind>('water');
  const [m, setM] = useState(0.5);
  const [T0, setT0] = useState(-20);
  const [P, setP] = useState(1000);
  const [speed, setSpeed] = useState(30);
  const [run, setRun] = useState(false);
  const [body, setBody] = useState<Body>(() => makeBody('b', 'water', 0.5, -20));
  const [curve, setCurve] = useState<{ t: number; T: number }[]>([{ t: 0, T: -20 }]);
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ body, run, P, speed, time });
  live.current = { body, run, P, speed, time };

  const reset = (k = kind, mm = m, t0 = T0) => {
    const b = makeBody('b', k, mm, t0);
    setBody(b);
    setCurve([{ t: 0, T: t0 }]);
    setTime(0);
    setRun(false);
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientWidth * 0.6 * dpr);
    });
    ro.observe(c);
    let raf = 0;
    let last = performance.now();
    let ui = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = live.current;
      if (s.run) {
        const sim = dt * s.speed;
        const nb = { ...s.body, H: s.body.H + s.P * sim };
        live.current.body = nb;
        live.current.time = s.time + sim;
        ui += dt;
        if (ui > 0.15) {
          ui = 0;
          const st = state(nb);
          setBody(nb);
          setTime(live.current.time);
          setCurve((cv) => [...cv, { t: live.current.time, T: st.T }]);
          if (st.T > 160 || (nb.kind !== 'water' && st.T > 300)) setRun(false);
        }
      }
      const ctx = c.getContext('2d');
      if (ctx) drawVessel(ctx, c.width, c.height, [live.current.body], { flame: s.run ? s.P / 3000 : 0.15, t: now / 1000, dpr: window.devicePixelRatio || 1, lang, tempC: state(live.current.body).T });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lang]);

  const st = state(body);
  const H0 = makeBody('x', kind, m, T0).H;
  const stg = stages(kind, m, H0, body.H);
  const phase = kind !== 'water' ? L('нагревание', 'heating') : st.T < 0 ? L('нагревается лёд', 'ice warming') : st.T === 0 ? L('лёд плавится — температура не меняется!', 'ice melting: temperature stays put!') : st.T < 100 ? L('нагревается вода', 'water warming') : st.T === 100 ? L('вода кипит — температура не меняется!', 'water boiling: temperature stays put!') : L('нагревается пар', 'steam heating');

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl overflow-hidden border border-[#1F2126]">
          <canvas ref={canvasRef} className="block w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setRun(!run)} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
            {run ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {run ? L('Выключить горелку', 'Burner off') : L('Включить горелку', 'Burner on')}
          </button>
          <button onClick={() => reset()} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            {L('Сначала', 'Reset')}
          </button>
          <div className="flex p-0.5 rounded-lg bg-muted border border-line">
            {[10, 30, 100].map((k) => (
              <button key={k} onClick={() => setSpeed(k)} className={`h-8 px-2.5 rounded-md text-xs font-mono cursor-pointer ${speed === k ? 'bg-surface border border-line text-ink' : 'text-ink-2'}`}>
                ×{k}
              </button>
            ))}
          </div>
          <span className="text-sm text-ink-2">
            {L('Время', 'Time')}: <span className="font-mono text-ink">{fmt(time / 60, 1)} {L('мин', 'min')}</span>
          </span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-1">{L('График нагревания', 'Heating curve')}</h3>
          <p className="text-xs text-ink-3 mb-2">{L('Горизонтальные участки — плавление и кипение: тепло идёт на смену состояния, а не на нагрев.', 'Flat parts are melting and boiling: the heat changes the state, not the temperature.')}</p>
          <Curve data={curve} lang={lang} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Опыт', 'Setup')}</h3>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SUBST) as Kind[]).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setKind(k);
                  const t0 = k === 'water' ? T0 : 20;
                  if (k !== 'water') setT0(20);
                  reset(k, m, t0);
                }}
                className={`h-8 px-2.5 rounded-md text-xs border cursor-pointer ${kind === k ? 'bg-accent border-accent' : 'bg-surface border-line text-ink-2'}`}
                style={kind === k ? { color: '#fff' } : undefined}
              >
                {SUBST[k].name[lang]}
              </button>
            ))}
          </div>
          <Slider label={L('Масса m', 'Mass m')} value={m} min={0.1} max={2} step={0.1} unit={L('кг', 'kg')} onChange={(v) => { setM(v); reset(kind, v, T0); }} />
          <Slider label={L('Начальная температура', 'Start temperature')} value={T0} min={kind === 'water' ? -40 : 0} max={kind === 'water' ? 90 : 100} step={1} unit="°C" digits={0} onChange={(v) => { setT0(v); reset(kind, m, v); }} />
          <Slider label={L('Мощность горелки P', 'Burner power P')} value={P} min={200} max={3000} step={100} unit={L('Вт', 'W')} digits={0} onChange={setP} />
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Измерения', 'Readings')}</h3>
          <div className="text-sm text-accent font-medium">{phase}</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted px-3 py-2">
              <div className="text-[11px] text-ink-2">{L('Температура', 'Temperature')}</div>
              <div className="font-mono text-ink">{fmt(st.T, 1)} °C</div>
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <div className="text-[11px] text-ink-2">{L('Получено тепла Q = Pt', 'Heat received Q = Pt')}</div>
              <div className="font-mono text-ink">{fmtJ(body.H - H0)}</div>
            </div>
          </div>
          {stg.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {stg.map((s, i) => (
                <li key={i} className="rounded-lg bg-muted px-3 py-2 text-xs">
                  <div className="flex justify-between text-ink">
                    <span>{s.name[lang]}</span>
                    <span className="font-mono">{fmtJ(s.Q)}</span>
                  </div>
                  <div className="font-mono text-ink-2">{s.formula}</div>
                </li>
              ))}
            </ul>
          )}
          {kind === 'water' && <p className="mt-2 text-[11px] text-ink-3">c льда = 2100, c воды = 4200 Дж/(кг·°C); λ = 3,3·10⁵ Дж/кг; L = 2,3·10⁶ Дж/кг</p>}
        </div>
      </div>
    </div>
  );
};

/* ---------- calorimeter mode ---------- */

interface Draft {
  kind: Kind;
  ice: boolean;
  m: number;
  T: number;
}

const Calorimeter: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [items, setItems] = useState<{ id: string; d: Draft }[]>([
    { id: 'a', d: { kind: 'water', ice: false, m: 1, T: 80 } },
    { id: 'b', d: { kind: 'water', ice: true, m: 0.5, T: 0 } },
  ]);
  const [draft, setDraft] = useState<Draft>({ kind: 'Cu', ice: false, m: 0.5, T: 200 });
  const [mixed, setMixed] = useState(false);
  const [anim, setAnim] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ids = useRef(1);

  const bodies = useMemo(() => items.map((it) => makeBody(it.id, it.d.kind, it.d.m, it.d.ice ? Math.min(0, it.d.T) : it.d.kind === 'water' ? Math.max(0, it.d.T) : it.d.T, it.d.kind === 'water' && !it.d.ice)), [items]);
  const eq = useMemo(() => (bodies.length ? equilibrium(bodies) : null), [bodies]);
  const shown = useMemo(() => {
    if (!eq || !mixed) return bodies;
    // animate from the separate bodies to equilibrium
    return bodies.map((b, i) => ({ ...b, H: b.H + (eq.after[i].H - b.H) * anim }));
  }, [bodies, eq, mixed, anim]);
  const shownT = mixed && eq ? (anim >= 1 ? eq.T : bodies.reduce((s, b) => s + state(b).T * b.m, 0) / Math.max(1e-6, bodies.reduce((s, b) => s + b.m, 0)) * (1 - anim) + eq.T * anim) : NaN;

  useEffect(() => {
    if (!mixed) return;
    setAnim(0);
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 2500);
      setAnim(k);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mixed, items]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientWidth * 0.55 * dpr);
    });
    ro.observe(c);
    let raf = 0;
    const loop = (now: number) => {
      const ctx = c.getContext('2d');
      const list = shownRef.current;
      const water = list.filter((b) => b.kind === 'water');
      const T = Number.isFinite(shownTRef.current) ? shownTRef.current : water.length ? state(water[0]).T : list.length ? state(list[0]).T : 20;
      if (ctx) drawVessel(ctx, c.width, c.height, list, { flame: 0, t: now / 1000, dpr: window.devicePixelRatio || 1, lang, tempC: T });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lang]);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const shownTRef = useRef(shownT);
  shownTRef.current = shownT;

  const name = (d: Draft) => (d.kind === 'water' ? (d.ice ? L('Лёд', 'Ice') : L('Вода', 'Water')) : SUBST[d.kind].name[lang]);
  const after = eq?.after ?? [];
  const totalIce = after.reduce((s, b) => s + (b.kind === 'water' ? state(b).ice * b.m : 0), 0);
  const startIce = bodies.reduce((s, b) => s + (b.kind === 'water' ? state(b).ice * b.m : 0), 0);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl overflow-hidden border border-[#1F2126]">
          <canvas ref={canvasRef} className="block w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setMixed(true)} disabled={mixed || !items.length} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
            {L('Смешать и подождать', 'Mix and wait')}
          </button>
          <button onClick={() => setMixed(false)} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            {L('До смешивания', 'Before mixing')}
          </button>
        </div>
        {mixed && eq && anim >= 1 && (
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Уравнение теплового баланса', 'Heat balance')}</h3>
            <p className="text-sm text-ink">
              {L('Установилась температура', 'Final temperature')} <b className="font-mono">{fmt(eq.T, 2)} °C</b>
              {startIce > 1e-4 && (totalIce > 1e-4 ? L(`, растаяло ${fmt(startIce - totalIce, 3)} кг льда из ${fmt(startIce, 3)}`, `; ${fmt(startIce - totalIce, 3)} of ${fmt(startIce, 3)} kg of ice melted`) : L(', весь лёд растаял', '; all the ice melted'))}
              {startIce < 1e-4 && totalIce > 1e-4 ? L(`, замёрзло ${fmt(totalIce, 3)} кг воды`, `; ${fmt(totalIce, 3)} kg of water froze`) : ''}.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {bodies.map((b, i) => {
                const q = after[i].H - b.H;
                return (
                  <li key={b.id} className="rounded-lg bg-muted px-3 py-2 text-xs">
                    <div className="flex justify-between text-ink">
                      <span>
                        {name(items[i].d)}, {fmt(b.m, 2)} {L('кг', 'kg')}: {q >= 0 ? L('получило', 'gained') : L('отдало', 'gave off')}
                      </span>
                      <span className={`font-mono ${q >= 0 ? 'text-[#CC2F35]' : 'text-[#2D6CC5]'}`}>{fmtJ(Math.abs(q))}</span>
                    </div>
                    {stages(b.kind, b.m, b.H, after[i].H).map((s, k) => (
                      <div key={k} className="font-mono text-ink-2">
                        {s.name[lang]}: {s.formula}
                      </div>
                    ))}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-ink-2">
              {L('Сумма', 'Sum')}: Q₁ + Q₂ + … = <span className="font-mono text-ink">{fmtJ(bodies.reduce((s, b, i) => s + after[i].H - b.H, 0))}</span> — {L('тепло не теряется, только переходит от горячих тел к холодным.', 'no heat is lost, it only flows from hot bodies to cold ones.')}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('В калориметре', 'In the calorimeter')}</h3>
          {items.length === 0 && <p className="text-sm text-ink-3">{L('Пусто — добавь тела ниже.', 'Empty: add bodies below.')}</p>}
          <ul className="flex flex-col gap-1.5">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2 text-ink">
                  <span className="w-3 h-3 rounded-sm" style={{ background: it.d.kind === 'water' ? (it.d.ice ? '#DCEFFF' : '#5BA4E6') : SUBST[it.d.kind].color }} />
                  {name(it.d)} · {fmt(it.d.m, 2)} {L('кг', 'kg')} · {fmt(it.d.T, 0)} °C
                </span>
                <button onClick={() => { setItems((l) => l.filter((x) => x.id !== it.id)); setMixed(false); }} className="text-ink-3 hover:text-[#CC2F35] cursor-pointer" aria-label={L('Убрать', 'Remove')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Добавить тело', 'Add a body')}</h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { kind: 'water' as Kind, ice: false, ru: 'Вода', en: 'Water' },
              { kind: 'water' as Kind, ice: true, ru: 'Лёд', en: 'Ice' },
              ...(['Cu', 'Fe', 'Al', 'Pb'] as Kind[]).map((k) => ({ kind: k, ice: false, ru: SUBST[k].name.ru, en: SUBST[k].name.en })),
            ].map((o) => {
              const on = draft.kind === o.kind && draft.ice === o.ice;
              return (
                <button
                  key={o.ru}
                  onClick={() => setDraft({ kind: o.kind, ice: o.ice, m: draft.m, T: o.ice ? -10 : o.kind === 'water' ? 20 : 100 })}
                  className={`h-8 px-2.5 rounded-md text-xs border cursor-pointer ${on ? 'bg-accent border-accent' : 'bg-surface border-line text-ink-2'}`}
                  style={on ? { color: '#fff' } : undefined}
                >
                  {lang === 'ru' ? o.ru : o.en}
                </button>
              );
            })}
          </div>
          <Slider label={L('Масса', 'Mass')} value={draft.m} min={0.05} max={2} step={0.05} unit={L('кг', 'kg')} digits={2} onChange={(m) => setDraft({ ...draft, m })} />
          <Slider
            label={L('Температура', 'Temperature')}
            value={draft.T}
            min={draft.kind === 'water' ? (draft.ice ? -40 : 0) : -20}
            max={draft.kind === 'water' ? (draft.ice ? 0 : 100) : 400}
            step={1}
            unit="°C"
            digits={0}
            onChange={(T) => setDraft({ ...draft, T })}
          />
          <button
            onClick={() => {
              setItems((l) => [...l, { id: `n${ids.current++}`, d: { ...draft } }]);
              setMixed(false);
            }}
            className="h-9 rounded-lg border border-dashed border-line-strong text-sm text-ink inline-flex items-center justify-center gap-1.5 hover:bg-muted cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {L('Положить в калориметр', 'Put it in')}
          </button>
          <p className="text-[11px] text-ink-3">c: {(['Cu', 'Fe', 'Al', 'Pb'] as Kind[]).map((k) => `${SUBST[k].name[lang].toLowerCase()} ${SUBST[k].c}`).join(', ')} {L('Дж/(кг·°C)', 'J/(kg·°C)')}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------- page ---------- */

export const HeatLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [tab, setTab] = useState<'heat' | 'cal'>('heat');
  useEffect(() => progress.recordLab('sandbox-heat'), []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex p-1 rounded-lg bg-muted border border-line self-start">
        {(
          [
            ['heat', L('Нагревание и смена состояний', 'Heating and changes of state')],
            ['cal', L('Калориметр: смешивание', 'Calorimeter: mixing')],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`h-9 px-4 rounded-md text-sm cursor-pointer ${tab === id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{tab === 'heat' ? L('Q = cmΔt, Q = λm, Q = Lm', 'Q = cmΔt, Q = λm, Q = Lm') : L('Уравнение теплового баланса: Q₁ + Q₂ + … = 0', 'Heat balance: Q₁ + Q₂ + … = 0')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {tab === 'heat'
            ? L('Нагрей лёд горелкой и смотри на график: пока лёд тает или вода кипит, температура стоит на месте — всё тепло уходит на смену агрегатного состояния.', 'Heat ice with the burner and watch the graph: while ice melts or water boils, the temperature stands still because all the heat goes into changing state.')
            : L('Положи в калориметр горячую воду, лёд или нагретый металл и смешай. Горячие тела отдают тепло, холодные получают — пока температуры не сравняются.', 'Put hot water, ice or a heated metal in the calorimeter and mix. Hot bodies give heat, cold ones take it, until the temperatures even out.')}
        </p>
      </div>
      {tab === 'heat' ? <Heating lang={lang} /> : <Calorimeter lang={lang} />}
    </div>
  );
};

export default HeatLab;
