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
  return { w, h };
}

export function logicalHeight(canvas: HTMLCanvasElement) {
  return Number(canvas.dataset.h || canvas.height);
}
