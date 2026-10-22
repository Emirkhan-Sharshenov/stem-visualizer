import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

/* Ripple tank. Every scene is a sum of circular waves from point sources (Huygens), so each pixel
   stores the complex amplitude C + iS once, and a frame is just h = C·cos ωt + S·sin ωt. */

type Lang = 'ru' | 'en';
type Scene = 'two' | 'single' | 'slit' | 'double' | 'doppler';

const W = 40;
const H = 25;
const GX = 240;
const GY = 150;
const BARRIER = 11; // slit scenes: barrier position, cm
const SPEED = 6; // wave speed, cm/s (slow so you can follow the crests)

interface Src {
  x: number;
  y: number;
  a: number;
  ph: number;
}

const SCENES: { id: Scene; ru: string; en: string }[] = [
  { id: 'two', ru: 'Два источника', en: 'Two sources' },
  { id: 'double', ru: 'Опыт Юнга (две щели)', en: 'Young’s double slit' },
  { id: 'slit', ru: 'Дифракция на щели', en: 'Single-slit diffraction' },
  { id: 'single', ru: 'Один источник', en: 'One source' },
  { id: 'doppler', ru: 'Эффект Доплера', en: 'Doppler effect' },
];

/** Huygens sources across an opening of width a centred at y */
function opening(y: number, a: number, lambda: number): Src[] {
  const n = Math.max(1, Math.min(18, Math.round((a / lambda) * 4)));
  return Array.from({ length: n }, (_, i) => ({ x: BARRIER, y: y - a / 2 + (a * (i + 0.5)) / n, a: 1.6 / n, ph: 0 }));
}

function sourcesFor(scene: Scene, p: { lambda: number; d: number; a: number; anti: boolean }, two: { y1: number; y2: number; x: number }): Src[] {
  if (scene === 'single') return [{ x: two.x, y: H / 2, a: 1, ph: 0 }];
  if (scene === 'two') return [{ x: two.x, y: two.y1, a: 1, ph: 0 }, { x: two.x, y: two.y2, a: 1, ph: p.anti ? Math.PI : 0 }];
  if (scene === 'slit') return opening(H / 2, p.a, p.lambda);
  if (scene === 'double') return [...opening(H / 2 - p.d / 2, Math.min(p.a, p.d * 0.8), p.lambda), ...opening(H / 2 + p.d / 2, Math.min(p.a, p.d * 0.8), p.lambda)];
  return [];
}

export const WaveLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [scene, setScene] = useState<Scene>('two');
  const [lambda, setLambda] = useState(2.5);
  const [d, setD] = useState(6);
  const [a, setA] = useState(1);
  const [anti, setAnti] = useState(false);
  const [beta, setBeta] = useState(0.5);
  const [intensity, setIntensity] = useState(false);
  const [run, setRun] = useState(true);
  const [pos, setPos] = useState({ x: 6, y1: 12.5 - 3, y2: 12.5 + 3 });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<'y1' | 'y2' | 'x' | null>(null);
  const time = useRef(0);

  useEffect(() => progress.recordLab('sandbox-waves'), []);
  useEffect(() => setPos((p) => ({ ...p, y1: H / 2 - d / 2, y2: H / 2 + d / 2 })), [d]);

  const k = (2 * Math.PI) / lambda;
  const slits = scene === 'slit' || scene === 'double';
  const srcs = useMemo(() => sourcesFor(scene, { lambda, d, a, anti }, pos), [scene, lambda, d, a, anti, pos]);

  // complex amplitude per pixel, plus the brightest value for scaling
  const field = useMemo(() => {
    const C = new Float32Array(GX * GY);
    const S = new Float32Array(GX * GY);
    if (scene === 'doppler') return { C, S, max: 1, screen: new Float32Array(GY) };
    let max = 0;
    for (let j = 0; j < GY; j++) {
      const y = ((j + 0.5) / GY) * H;
      for (let i = 0; i < GX; i++) {
        const x = ((i + 0.5) / GX) * W;
        let c = 0;
        let s = 0;
        if (slits && x < BARRIER) {
          // plane wave coming from the left
          c = Math.cos(k * x);
          s = Math.sin(k * x);
        } else if (!slits || x > BARRIER) {
          for (const q of srcs) {
            const r = Math.hypot(x - q.x, y - q.y) + 0.15;
            const amp = q.a / Math.sqrt(r);
            c += amp * Math.cos(k * r + q.ph);
            s += amp * Math.sin(k * r + q.ph);
          }
        }
        C[i + j * GX] = c;
        S[i + j * GX] = s;
        if (x > (slits ? BARRIER + 3 : 3)) max = Math.max(max, Math.hypot(c, s));
      }
    }
    // intensity on the screen (right edge), time-averaged
    const screen = new Float32Array(GY);
    for (let j = 0; j < GY; j++) {
      const i = GX - 3;
      screen[j] = C[i + j * GX] ** 2 + S[i + j * GX] ** 2;
    }
    return { C, S, max: max || 1, screen };
  }, [srcs, k, scene, slits]);

  const live = useRef({ field, run, scene, intensity, beta, lambda, k, slits, a, d, hover });
  live.current = { field, run, scene, intensity, beta, lambda, k, slits, a, d, hover };

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const img = new ImageData(GX, GY);
    const off = document.createElement('canvas');
    off.width = GX;
    off.height = GY;
    const octx = off.getContext('2d')!;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round((cv.clientWidth * H * dpr) / W);
    });
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const st = live.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (st.run) time.current += dt;
      const ctx = cv.getContext('2d');
      if (ctx) {
        const s = cv.width / W;
        const dpr = window.devicePixelRatio || 1;
        if (st.scene === 'doppler') drawDoppler(ctx, cv, s, dpr, st.beta, st.lambda, time.current);
        else {
          const w = (2 * Math.PI * SPEED) / st.lambda;
          const cw = Math.cos(w * time.current);
          const sw = Math.sin(w * time.current);
          const { C, S, max } = st.field;
          for (let p = 0; p < GX * GY; p++) {
            let v: number;
            if (st.intensity) v = Math.min(1, (2.5 * (C[p] ** 2 + S[p] ** 2)) / (max * max)) * 2 - 1;
            else v = Math.tanh((1.8 * (C[p] * cw + S[p] * sw)) / max);
            // deep blue troughs → cyan → white crests
            const t = (v + 1) / 2;
            img.data[p * 4] = 8 + 200 * t * t;
            img.data[p * 4 + 1] = 20 + 210 * t;
            img.data[p * 4 + 2] = 48 + 200 * Math.sqrt(t);
            img.data[p * 4 + 3] = 255;
          }
          octx.putImageData(img, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(off, 0, 0, cv.width, cv.height);
          if (st.slits) drawBarrier(ctx, s, cv.height, st.scene, st.a, st.d);
          drawScreen(ctx, cv, st.field.screen, dpr);
        }
        // sources
        if (st.scene === 'two' || st.scene === 'single')
          for (const q of sourcesFor(st.scene, { lambda: st.lambda, d: st.d, a: st.a, anti: false }, posRef.current)) {
            ctx.fillStyle = '#FFD60A';
            ctx.beginPath();
            ctx.arc(q.x * s, q.y * s, 6 * dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#08090C';
            ctx.lineWidth = 2 * dpr;
            ctx.stroke();
          }
        if (st.hover && st.scene === 'two') {
          ctx.strokeStyle = 'rgba(255,214,10,0.7)';
          ctx.setLineDash([5 * dpr, 5 * dpr]);
          ctx.lineWidth = 1.5 * dpr;
          for (const y of [posRef.current.y1, posRef.current.y2]) {
            ctx.beginPath();
            ctx.moveTo(posRef.current.x * s, y * s);
            ctx.lineTo(st.hover.x * s, st.hover.y * s);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const posRef = useRef(pos);
  posRef.current = pos;

  const toWorld = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onDown = (e: React.PointerEvent) => {
    if (scene !== 'two' && scene !== 'single') return;
    const p = toWorld(e);
    const near = (y: number) => Math.hypot(p.x - pos.x, p.y - y) < 1.5;
    drag.current = scene === 'two' ? (near(pos.y1) ? 'y1' : near(pos.y2) ? 'y2' : null) : near(H / 2) ? 'x' : null;
    if (drag.current) (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const p = toWorld(e);
    setHover(p);
    if (!drag.current) return;
    const x = Math.max(1, Math.min(W / 2, p.x));
    const y = Math.max(1, Math.min(H - 1, p.y));
    if (drag.current === 'x') setPos({ ...pos, x });
    else setPos({ ...pos, x, [drag.current]: y });
  };

  // path difference readout for two sources
  let path: { r1: number; r2: number; m: number } | null = null;
  if (hover && scene === 'two') {
    const r1 = Math.hypot(hover.x - pos.x, hover.y - pos.y1);
    const r2 = Math.hypot(hover.x - pos.x, hover.y - pos.y2);
    path = { r1, r2, m: Math.abs(r1 - r2) / lambda };
  }
  const frac = path ? path.m % 1 : 0;
  const isMax = path ? (anti ? Math.abs(frac - 0.5) < 0.15 : frac < 0.15 || frac > 0.85) : false;
  const isMin = path ? (anti ? frac < 0.15 || frac > 0.85 : Math.abs(frac - 0.5) < 0.15) : false;

  const TEXT: Record<Scene, [string, string]> = {
    two: ['Две волны складываются. Где гребень встречает гребень — волна вдвое выше (максимум), где гребень встречает впадину — вода стоит (минимум). Перетаскивай источники.', 'Two waves add up. Crest on crest makes a double wave (maximum); crest on trough cancels out (minimum). Drag the sources.'],
    double: ['Свет проходит через две узкие щели и на экране получаются полосы — так Томас Юнг в 1801 году доказал, что свет — волна. Справа график освещённости экрана.', 'Light passing two narrow slits paints stripes on the screen; that is how Thomas Young proved in 1801 that light is a wave. The graph on the right is the brightness on the screen.'],
    slit: ['Волна огибает края щели — это дифракция. Чем уже щель по сравнению с длиной волны, тем сильнее волна расходится в стороны.', 'The wave bends round the edges of the slit: diffraction. The narrower the slit compared with the wavelength, the more the wave spreads.'],
    single: ['Круговые волны расходятся от источника. Расстояние между соседними гребнями — длина волны λ.', 'Circular waves spread from the source. The distance between neighbouring crests is the wavelength λ.'],
    doppler: ['Источник движется — гребни впереди сжимаются (звук выше), а позади растягиваются (звук ниже). Так меняется гудок проезжающей машины. Быстрее звука — появляется конус Маха (звуковой удар).', 'A moving source squeezes the crests in front (higher pitch) and stretches them behind (lower pitch), like a passing car’s horn. Faster than the waves, a Mach cone appears (sonic boom).'],
  };

  const slider = (label: string, value: number, min: number, max: number, step: number, unit: string, on: (v: number) => void) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => on(Number(e.target.value))} className="w-full accent-accent cursor-pointer" />
    </label>
  );

  const fFront = 1 / (1 - beta);
  const fBack = 1 / (1 + beta);

  useScreenDetail(
    'lab',
    `Сцена: ${SCENES.find((x) => x.id === scene)?.ru}. λ = ${lambda} см${scene === 'two' || scene === 'double' ? `, расстояние между ${scene === 'two' ? 'источниками' : 'щелями'} d = ${d} см` : ''}${scene === 'slit' || scene === 'double' ? `, ширина щели ${a} см` : ''}${scene === 'two' && anti ? ', источники в противофазе' : ''}${scene === 'doppler' ? `, скорость источника = ${beta} скорости волны${beta >= 1 ? ' (быстрее волны — конус Маха)' : ''}` : ''}. Режим показа: ${intensity ? 'интенсивность' : 'волны'}.`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Интерференция, дифракция и эффект Доплера', 'Interference, diffraction and the Doppler effect')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{L(...TEXT[scene])}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setScene(s.id);
              if (s.id === 'slit') setA(3);
              if (s.id === 'double') {
                setA(1);
                setD(5);
              }
            }}
            className={`h-9 px-3.5 rounded-full text-sm border whitespace-nowrap cursor-pointer ${scene === s.id ? 'border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={scene === s.id ? { color: '#fff', background: '#16171A' } : undefined}
          >
            {L(s.ru, s.en)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126] relative">
            <canvas ref={canvas} className="block w-full touch-none" style={{ cursor: scene === 'two' || scene === 'single' ? 'grab' : 'default' }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerLeave={() => setHover(null)} />
            {scene !== 'doppler' && (
              <span className="absolute right-2 top-2 text-[11px] px-1.5 py-0.5 rounded bg-black/50" style={{ color: '#C9CFDB' }}>
                {L('экран: яркость', 'screen: brightness')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setRun(!run)} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
              {run ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {run ? L('Пауза', 'Pause') : L('Пуск', 'Run')}
            </button>
            {scene !== 'doppler' && (
              <div className="flex p-0.5 rounded-lg bg-muted border border-line text-sm">
                {[false, true].map((v) => (
                  <button key={String(v)} onClick={() => setIntensity(v)} className={`h-8 px-3 rounded-md cursor-pointer ${intensity === v ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2'}`}>
                    {v ? L('Интенсивность', 'Intensity') : L('Волны', 'Waves')}
                  </button>
                ))}
              </div>
            )}
            {scene === 'two' && (
              <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer ml-1">
                <input type="checkbox" checked={anti} onChange={(e) => setAnti(e.target.checked)} className="w-4 h-4 accent-accent" />
                {L('Источники в противофазе', 'Sources in antiphase')}
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Параметры', 'Settings')}</h3>
            {slider(L('Длина волны λ', 'Wavelength λ'), lambda, 1, 5, 0.1, L('см', 'cm'), setLambda)}
            {(scene === 'two' || scene === 'double') && slider(L('Расстояние между ' + (scene === 'two' ? 'источниками' : 'щелями') + ' d', 'Separation d'), d, 1, 14, 0.5, L('см', 'cm'), setD)}
            {(scene === 'slit' || scene === 'double') && slider(L('Ширина щели', 'Slit width'), a, 0.5, scene === 'slit' ? 10 : 3, 0.5, L('см', 'cm'), setA)}
            {scene === 'doppler' && slider(L('Скорость источника v / скорость волны', 'Source speed v / wave speed'), beta, 0, 1.6, 0.05, '', setBeta)}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2">
            {scene === 'two' && (
              <>
                <div className="text-center overflow-x-auto">
                  <Formula tex={anti ? '\\Delta d = \\left(m + \\tfrac{1}{2}\\right)\\lambda \\;\\text{— максимум}' : '\\Delta d = m\\lambda \\;\\text{— максимум}'} display />
                </div>
                <div className="text-center overflow-x-auto">
                  <Formula tex={anti ? '\\Delta d = m\\lambda \\;\\text{— минимум}' : '\\Delta d = \\left(m + \\tfrac{1}{2}\\right)\\lambda \\;\\text{— минимум}'} display />
                </div>
                {path ? (
                  <div className="font-mono text-sm text-ink flex flex-col gap-0.5">
                    <span>
                      Δd = |{path.r1.toFixed(1)} − {path.r2.toFixed(1)}| = {Math.abs(path.r1 - path.r2).toFixed(2)} {L('см', 'cm')}
                    </span>
                    <span>
                      Δd / λ = {path.m.toFixed(2)}
                      {isMax && <b className="ml-2 font-sans" style={{ color: '#1E7A4C' }}>{L('максимум', 'maximum')}</b>}
                      {isMin && <b className="ml-2 font-sans" style={{ color: '#B42318' }}>{L('минимум', 'minimum')}</b>}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-ink-3">{L('Наведи на точку — посчитаю разность хода.', 'Hover over a point to get the path difference.')}</p>
                )}
              </>
            )}
            {scene === 'double' && (
              <>
                <div className="text-center overflow-x-auto">
                  <Formula tex="d \sin\theta = m\lambda" display />
                </div>
                <p className="text-xs text-ink-2">{L('Чем больше λ и меньше d, тем шире полосы. Попробуй сблизить щели.', 'Longer λ and smaller d give wider fringes. Try moving the slits closer.')}</p>
              </>
            )}
            {scene === 'slit' && (
              <>
                <div className="text-center overflow-x-auto">
                  <Formula tex="a \sin\theta = m\lambda \;\text{— тёмные полосы}" display />
                </div>
                <p className="text-xs text-ink-2">{L('Сделай щель уже длины волны — волна разойдётся почти полукругом.', 'Make the slit narrower than the wavelength and the wave spreads out almost as a half circle.')}</p>
              </>
            )}
            {scene === 'single' && (
              <div className="text-center overflow-x-auto">
                <Formula tex="v = \lambda \nu = \frac{\lambda}{T}" display />
              </div>
            )}
            {scene === 'doppler' && (
              <>
                <div className="text-center overflow-x-auto">
                  <Formula tex="\nu' = \nu \cdot \frac{v_{\text{волны}}}{v_{\text{волны}} \mp v_{\text{ист}}}" display />
                </div>
                {beta < 1 ? (
                  <p className="text-sm text-ink">
                    {L('Впереди частота', 'Ahead the frequency is')} <b className="font-mono">×{fFront.toFixed(2)}</b>, {L('позади', 'behind')} <b className="font-mono">×{fBack.toFixed(2)}</b>
                  </p>
                ) : (
                  <p className="text-sm text-ink">
                    {L('Источник быстрее волны: конус Маха, ', 'Faster than the waves: a Mach cone, ')}
                    <Formula tex={`\\sin\\alpha = \\frac{1}{${beta.toFixed(2)}}`} />, α = {((Math.asin(Math.min(1, 1 / beta)) * 180) / Math.PI).toFixed(0)}°
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function drawBarrier(ctx: CanvasRenderingContext2D, s: number, h: number, scene: Scene, a: number, d: number) {
  ctx.fillStyle = '#2C2F36';
  const x = BARRIER * s - 0.3 * s;
  const gaps = scene === 'slit' ? [[H / 2 - a / 2, H / 2 + a / 2]] : [-1, 1].map((k) => [H / 2 + (k * d) / 2 - Math.min(a, d * 0.8) / 2, H / 2 + (k * d) / 2 + Math.min(a, d * 0.8) / 2]);
  let y = 0;
  for (const [g0, g1] of gaps.sort((p, q) => p[0] - q[0])) {
    ctx.fillRect(x, y * s, 0.6 * s, g0 * s - y * s);
    y = g1;
  }
  ctx.fillRect(x, y * s, 0.6 * s, h - y * s);
}

/** brightness on the screen at the right edge */
function drawScreen(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, screen: Float32Array, dpr: number) {
  const max = Math.max(...screen) || 1;
  const x0 = cv.width - 70 * dpr;
  ctx.fillStyle = 'rgba(8,9,12,0.55)';
  ctx.fillRect(x0, 0, 70 * dpr, cv.height);
  ctx.strokeStyle = '#FFD60A';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  for (let j = 0; j < screen.length; j++) {
    const y = ((j + 0.5) / screen.length) * cv.height;
    const x = x0 + 6 * dpr + (screen[j] / max) * 58 * dpr;
    if (j) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
}

/** crests emitted by a moving source: each one is a circle around the point where it was emitted */
function drawDoppler(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, s: number, dpr: number, beta: number, lambda: number, t: number) {
  ctx.fillStyle = '#081426';
  ctx.fillRect(0, 0, cv.width, cv.height);
  const T = lambda / SPEED;
  const v = beta * SPEED;
  // one pass of the source across the tank, then start over
  const span = v > 0.2 ? (W - 2) / v + 1.5 : 12;
  const tt = t % span;
  const sx = (when: number) => 4 + v * when;
  const y = H / 2;
  for (let n = Math.floor(tt / T); n >= 0; n--) {
    const te = n * T;
    const r = SPEED * (tt - te);
    if (r > W * 1.5) break;
    ctx.strokeStyle = `rgba(140,200,255,${Math.max(0.15, 0.9 - r / (W * 1.4))})`;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(sx(te) * s, y * s, r * s, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#FFD60A';
  ctx.beginPath();
  ctx.arc(sx(tt) * s, y * s, 7 * dpr, 0, Math.PI * 2);
  ctx.fill();
  // observers in front and behind, with the pitch they hear
  const sub = beta < 1;
  for (const [ox, f] of [[W - 2.2, 1 / (1 - beta)], [1.6, 1 / (1 + beta)]] as const) {
    const cx = ox * s;
    const cy = (y + 3.2) * s;
    ctx.fillStyle = '#C9D3FF';
    ctx.beginPath();
    ctx.arc(cx, cy - 1.1 * s, 0.45 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx - 0.45 * s, cy - 0.55 * s, 0.9 * s, 1.4 * s, 0.3 * s);
    ctx.fill();
    ctx.font = `600 ${12 * dpr}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(sub || ox < W / 2 ? `ν × ${f.toFixed(2)}` : '—', cx, cy + 2 * s);
  }
}

export default WaveLab;
