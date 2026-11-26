// Shared look for the canvas simulations: a lit stage instead of a flat fill, soft glows, smooth easing
// toward targets (so a slider move flows instead of jumping) and small particle effects.

export const STAGE = {
  base: '#0A0C14',
  mid: '#131A2C',
  grid: 'rgba(160, 176, 230, 0.06)',
  ink: '#E8ECFA',
  soft: '#97A1C4',
  font: '"Inter", "IBM Plex Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

/** a lit backdrop: a soft centre light, a faint dot grid and a vignette */
export function drawStage(ctx: CanvasRenderingContext2D, w: number, h: number, light?: { x: number; y: number }) {
  const lx = light?.x ?? w * 0.5;
  const ly = light?.y ?? h * 0.42;
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.75);
  g.addColorStop(0, STAGE.mid);
  g.addColorStop(1, STAGE.base);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = STAGE.grid;
  for (let y = 12; y < h; y += 24) for (let x = 12; x < w; x += 24) ctx.fillRect(x, y, 1.4, 1.4);
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

/** an additive soft light; colour as "r,g,b" */
export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  if (a <= 0.003 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.4, `rgba(${rgb},${a * 0.35})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  const op = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalCompositeOperation = op;
}

/** frame-rate independent easing of `cur` toward `target`; `tau` is the time to cover ~63% of the gap, in seconds */
export const approach = (cur: number, target: number, dt: number, tau: number) => cur + (target - cur) * (1 - Math.exp(-dt / Math.max(1e-3, tau)));

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** mixes two "r,g,b" colours */
export const mixRgb = (a: [number, number, number], b: [number, number, number], t: number) =>
  `${Math.round(mix(a[0], b[0], t))},${Math.round(mix(a[1], b[1], t))},${Math.round(mix(a[2], b[2], t))}`;

/** stable pseudo-random per index, for variety without flicker */
export const seeded = (i: number, k = 0) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** a rounded label pill drawn on the canvas */
export function pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, align: 'left' | 'center' | 'right' = 'center') {
  ctx.font = `600 12px ${STAGE.mono}`;
  const tw = ctx.measureText(text).width;
  const pw = tw + 18;
  const ph = 24;
  const px = align === 'center' ? x - pw / 2 : align === 'left' ? x : x - pw;
  ctx.fillStyle = 'rgba(12,15,26,0.82)';
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px, y - ph / 2, pw, ph, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, px + 9, y + 0.5);
}

/**
 * a light bulb standing on a wire at (x, baseY): screw base, glass, coiled filament and a glow that lights the
 * scene; `b` is the brightness 0…1
 */
export function drawBulb(ctx: CanvasRenderingContext2D, x: number, baseY: number, b: number, up = true) {
  const dir = up ? -1 : 1;
  const by = baseY + dir * 46;
  glow(ctx, x, by, 120 + 380 * b, '255,176,92', 0.3 * b);
  const base = ctx.createLinearGradient(x - 13, 0, x + 13, 0);
  base.addColorStop(0, '#6E7586');
  base.addColorStop(0.5, '#DDE1EA');
  base.addColorStop(1, '#5E6576');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.roundRect(x - 13, up ? baseY - 22 : baseY, 26, 22, 4);
  ctx.fill();
  glow(ctx, x, by, 110, '255,214,140', 0.95 * b);
  const glass = ctx.createRadialGradient(x - 8, by - 10, 2, x, by, 30);
  glass.addColorStop(0, `rgba(255,248,225,${0.12 + 0.75 * b})`);
  glass.addColorStop(1, `rgba(255,200,120,${0.04 + 0.3 * b})`);
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.arc(x, by, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,236,250,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const fil = b < 0.5 ? mixRgb([95, 100, 115], [255, 140, 50], b * 2) : mixRgb([255, 140, 50], [255, 244, 210], (b - 0.5) * 2);
  ctx.strokeStyle = `rgb(${fil})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 7, by - dir * 16);
  ctx.lineTo(x - 7, by + 2);
  for (let k = 0; k <= 8; k++) ctx.lineTo(x - 7 + k * 1.75, by + (k % 2 ? -4 : 2));
  ctx.lineTo(x + 7, by - dir * 16);
  ctx.stroke();
  glow(ctx, x, by, 34, '255,252,236', 0.9 * b * b);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, by, 19, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
}

/** points every ~2 units along a polyline, for things that travel along a wire */
export function samplePolyline(path: [number, number][], step = 2) {
  const pts: [number, number][] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i];
    const [bx, by] = path[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 0; k < n; k++) pts.push([mix(ax, bx, k / n), mix(ay, by, k / n)]);
  }
  pts.push(path[path.length - 1]);
  return pts;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  seed: number;
}

/** steps particles and drops the dead ones */
export function stepParticles(ps: Particle[], dt: number, gravity = 0) {
  for (const p of ps) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += gravity * dt;
    p.life += dt;
  }
  for (let i = ps.length - 1; i >= 0; i--) if (ps[i].life >= ps[i].max) ps.splice(i, 1);
}

/**
 * runs `draw(dt, t, still)` every frame while the canvas is on screen and pauses when it is scrolled away.
 * `still` is true when the viewer prefers reduced motion: values should then jump to their targets and nothing
 * should drift. Returns a cleanup function.
 */
export function runStage(canvas: HTMLCanvasElement, draw: (dt: number, t: number, still: boolean) => void) {
  const still = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let last = performance.now();
  let t = 0;
  let visible = true;
  const frame = (now: number) => {
    // a frame's timestamp can be a little older than performance.now() taken when the loop restarted
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    if (!still) t += dt;
    draw(still ? 10 : dt, t, still);
    if (visible) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
  io.observe(canvas);
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}
