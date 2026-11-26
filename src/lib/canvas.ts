import { drawStage } from './stage';

// Canvases keep a fixed logical drawing size (their width/height attributes),
// but render at device pixel ratio so lines stay crisp, and scale with CSS
// without distorting the aspect ratio.
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  if (!canvas.dataset.w) {
    canvas.dataset.w = String(canvas.width);
    canvas.dataset.h = String(canvas.height);
  }
  const w = Number(canvas.dataset.w);
  const h = Number(canvas.dataset.h);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  litBackdrop(ctx, w, h);
  return { w, h };
}

export function logicalHeight(canvas: HTMLCanvasElement) {
  return Number(canvas.dataset.h || canvas.height);
}

/** relative luminance of a "#rrggbb" or "rgb(a)(…)" colour, or -1 if it is not a plain colour */
function luminance(style: string | CanvasGradient | CanvasPattern) {
  if (typeof style !== 'string') return -1;
  let r: number, g: number, b: number;
  if (style[0] === '#' && style.length === 7) {
    r = parseInt(style.slice(1, 3), 16);
    g = parseInt(style.slice(3, 5), 16);
    b = parseInt(style.slice(5, 7), 16);
  } else {
    const m = style.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
    if (!m || (m[4] !== undefined && Number(m[4]) < 0.95)) return -1;
    [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  }
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Every simulation used to start its frame by filling the whole canvas with one flat dark colour.
 * Wherever that happens, the lit stage is drawn instead (a soft centre light, a faint dot grid and a vignette),
 * so all canvases share the same look without each one being rewritten. Light or partial fills pass through.
 */
function litBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const c = ctx as CanvasRenderingContext2D & { __stage?: { w: number; h: number } };
  if (c.__stage) {
    c.__stage.w = w;
    c.__stage.h = h;
    return;
  }
  c.__stage = { w, h };
  const plain = ctx.fillRect.bind(ctx);
  let inside = false;
  ctx.fillRect = (x: number, y: number, rw: number, rh: number) => {
    const st = c.__stage!;
    const full = x <= 0.5 && y <= 0.5 && rw >= st.w - 1 && rh >= st.h - 1;
    if (!inside && full) {
      const l = luminance(ctx.fillStyle);
      if (l >= 0 && l < 0.13) {
        inside = true;
        const saved = ctx.fillStyle;
        try {
          drawStage(ctx, st.w, st.h);
        } finally {
          ctx.fillStyle = saved;
          inside = false;
        }
        return;
      }
    }
    plain(x, y, rw, rh);
  };
}
