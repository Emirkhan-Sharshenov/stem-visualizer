import { inclinePoints, PULLEY_R, ropeExit, ropePath, Vec, World } from './physics';

/* Canvas renderer for the mechanics sandbox (dark stage like the other labs). */

export const FORCE_STYLE: Record<string, { color: string; ru: string; en: string }> = {
  gravity: { color: '#E5484D', ru: 'mg', en: 'mg' },
  normal: { color: '#30A46C', ru: 'N', en: 'N' },
  friction: { color: '#F76B15', ru: 'Fтр', en: 'Ffr' },
  tension: { color: '#AB8AFF', ru: 'T', en: 'T' },
  spring: { color: '#3DD6F5', ru: 'Fупр', en: 'Fsp' },
  push: { color: '#FFD60A', ru: 'F', en: 'F' },
  drag: { color: '#8C8F98', ru: 'Fсопр', en: 'Fdrag' },
};

export interface View {
  /** px per metre */
  s: number;
  /** canvas size in px */
  w: number;
  h: number;
  /** world point at the bottom-left corner of the canvas (the camera) */
  ox: number;
  oy: number;
}

export const toPx = (vw: View, p: Vec) => ({ x: (p.x - vw.ox) * vw.s, y: vw.h - (p.y - vw.oy) * vw.s });
export const toWorld = (vw: View, x: number, y: number): Vec => ({ x: x / vw.s + vw.ox, y: (vw.h - y) / vw.s + vw.oy });

export interface DrawOpts {
  lang: 'ru' | 'en';
  selected: string | null;
  pending: string[];
  pointer: Vec | null;
  showForces: boolean;
  showVelocity: boolean;
  /** body id → angle in radians (blocks lie flat on slopes) */
  tilt: Record<string, number>;
  font: number;
}

function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, w: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2) return;
  const head = Math.min(w * 4.5, L * 0.45);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(a) * head * 0.7, y2 - Math.sin(a) * head * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.4) * head, y2 - Math.sin(a - 0.4) * head);
  ctx.lineTo(x2 - Math.cos(a + 0.4) * head, y2 - Math.sin(a + 0.4) * head);
  ctx.closePath();
  ctx.fill();
}

function label(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string, font: number, bg = 'rgba(17,18,20,0.75)') {
  ctx.font = `600 ${font}px Inter, system-ui, sans-serif`;
  const w = ctx.measureText(s).width;
  ctx.fillStyle = bg;
  ctx.fillRect(x - w / 2 - 3, y - font * 0.75, w + 6, font * 1.35);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y - font * 0.05);
}

export function drawWorld(ctx: CanvasRenderingContext2D, world: World, vw: View, o: DrawOpts) {
  const { scene } = world;
  const P = (p: Vec) => toPx(vw, p);
  const s = vw.s;
  const f = o.font;

  // background and metre grid
  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, vw.w, vw.h);
  ctx.strokeStyle = '#1C1E23';
  ctx.lineWidth = 1;
  for (let x = Math.ceil(vw.ox); x < vw.ox + vw.w / s; x++) {
    const px = P({ x, y: 0 }).x;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, P({ x: 0, y: 0 }).y);
    ctx.stroke();
  }
  for (let y = 1; y <= scene.H; y++) {
    const py = P({ x: 0, y }).y;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(vw.w, py);
    ctx.stroke();
  }
  ctx.fillStyle = '#4A4D55';
  ctx.font = `${f * 0.8}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(o.lang === 'ru' ? '1 клетка = 1 м' : '1 square = 1 m', 8, 8 + f * 1.6);

  // ground
  const g0 = P({ x: 0, y: 0 }).y;
  ctx.fillStyle = '#1A1C21';
  ctx.fillRect(0, g0, vw.w, vw.h - g0);
  ctx.strokeStyle = '#3A3D45';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, g0);
  ctx.lineTo(vw.w, g0);
  ctx.stroke();
  ctx.strokeStyle = '#2C2F36';
  ctx.lineWidth = 1;
  for (let x = -20; x < vw.w; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, g0 + 12);
    ctx.lineTo(x + 10, g0 + 2);
    ctx.stroke();
  }

  // outside the room
  ctx.fillStyle = '#0B0C0E';
  const lw = P({ x: 0, y: 0 }).x;
  const rw = P({ x: scene.W, y: 0 }).x;
  if (lw > 0) ctx.fillRect(0, 0, lw, vw.h);
  if (rw < vw.w) ctx.fillRect(rw, 0, vw.w - rw, vw.h);

  // solids
  for (const so of scene.solids) {
    const sel = o.selected === so.id;
    ctx.fillStyle = '#23262C';
    ctx.strokeStyle = sel ? '#5B8CFF' : '#4A4D55';
    ctx.lineWidth = sel ? 2.5 : 1.5;
    if (so.kind === 'incline') {
      const pts = inclinePoints(so).map(P);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // angle mark at the bottom corner
      const corner = so.flip ? pts[1] : pts[0];
      const a = (so.deg * Math.PI) / 180;
      ctx.strokeStyle = '#8C8F98';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (so.flip) ctx.arc(corner.x, corner.y, s * 0.8, Math.PI, Math.PI + a);
      else ctx.arc(corner.x, corner.y, s * 0.8, -a, 0);
      ctx.stroke();
      label(ctx, `${Math.round(so.deg)}°`, corner.x + (so.flip ? -1 : 1) * s * 1.25, corner.y - s * 0.22, '#EDEDED', f * 0.9);
      label(ctx, `μ = ${so.mu.toFixed(2)}`, (pts[0].x + pts[1].x) / 2, corner.y + f * 1.1, '#8C8F98', f * 0.8, 'transparent');
    } else {
      const tl = P({ x: so.x, y: so.h });
      const thick = Math.max(6, s * 0.14);
      ctx.fillRect(tl.x, tl.y, so.w * s, thick);
      ctx.strokeRect(tl.x, tl.y, so.w * s, thick);
      ctx.fillStyle = '#2C2F36';
      const legW = Math.max(4, s * 0.1);
      ctx.fillRect(tl.x + s * 0.2, tl.y + thick, legW, g0 - tl.y - thick);
      ctx.fillRect(tl.x + so.w * s - s * 0.2 - legW, tl.y + thick, legW, g0 - tl.y - thick);
      label(ctx, `μ = ${so.mu.toFixed(2)}`, tl.x + (so.w * s) / 2, tl.y + thick + f * 1.1, '#8C8F98', f * 0.8, 'transparent');
    }
  }

  // anchors (hooks hang from the ceiling, pulleys sit on a bracket)
  for (const a of scene.anchors) {
    const p = P(a);
    const sel = o.selected === a.id || o.pending.includes(a.id);
    ctx.strokeStyle = '#4A4D55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, 0);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (a.kind === 'pulley') {
      ctx.fillStyle = '#2C2F36';
      ctx.strokeStyle = sel ? '#5B8CFF' : '#B5B8C0';
      ctx.lineWidth = sel ? 3 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, PULLEY_R * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#B5B8C0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, PULLEY_R * s * 0.2), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = sel ? '#5B8CFF' : '#B5B8C0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(4, s * 0.07), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // links
  for (const l of scene.links) {
    const pa = world.point(l.a);
    const pb = world.point(l.b);
    if (!pa || !pb) continue;
    const sel = o.selected === l.id;
    if (l.kind === 'rope') {
      const pv = l.via ? world.point(l.via) : null;
      const slack = ropePath(pa, pb, pv) < l.L - 0.03;
      ctx.strokeStyle = sel ? '#5B8CFF' : '#D9C9A3';
      ctx.lineWidth = sel ? 3 : 2;
      ctx.setLineDash(slack ? [5, 5] : []);
      ctx.beginPath();
      if (pv) {
        const ea = P(ropeExit(pv, pa));
        const eb = P(ropeExit(pv, pb));
        const c = P(pv);
        ctx.moveTo(P(pa).x, P(pa).y);
        ctx.lineTo(ea.x, ea.y);
        // over the top of the wheel
        if (Math.abs(ea.x - c.x) > 0.5 && Math.abs(eb.x - c.x) > 0.5) {
          const a1 = Math.atan2(ea.y - c.y, ea.x - c.x);
          const a2 = Math.atan2(eb.y - c.y, eb.x - c.x);
          ctx.arc(c.x, c.y, PULLEY_R * s, a1, a2, ea.x > eb.x);
        } else ctx.lineTo(eb.x, eb.y);
        ctx.lineTo(P(pb).x, P(pb).y);
      } else {
        ctx.moveTo(P(pa).x, P(pa).y);
        ctx.lineTo(P(pb).x, P(pb).y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // zig-zag spring
      const A = P(pa);
      const B = P(pb);
      const d = Math.hypot(B.x - A.x, B.y - A.y) || 1;
      const ux = (B.x - A.x) / d;
      const uy = (B.y - A.y) / d;
      const n = 12;
      const amp = Math.max(5, s * 0.12);
      ctx.strokeStyle = sel ? '#5B8CFF' : '#3DD6F5';
      ctx.lineWidth = sel ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      const lead = Math.min(d * 0.12, s * 0.2);
      ctx.lineTo(A.x + ux * lead, A.y + uy * lead);
      for (let i = 1; i < n; i++) {
        const k = lead + ((d - 2 * lead) * i) / n;
        const side = i % 2 ? 1 : -1;
        ctx.lineTo(A.x + ux * k - uy * amp * side, A.y + uy * k + ux * amp * side);
      }
      ctx.lineTo(B.x - ux * lead, B.y - uy * lead);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }

  // traces
  for (const b of scene.bodies) {
    const tr = world.traces[b.id];
    if (!b.trace || !tr?.length) continue;
    ctx.fillStyle = b.color;
    tr.forEach((p, i) => {
      if (i % 2) return;
      const q = P(p);
      ctx.globalAlpha = 0.25 + (0.5 * i) / tr.length;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // bodies
  for (const b of scene.bodies) {
    const p = P(b);
    const r = b.r * s;
    const sel = o.selected === b.id || o.pending.includes(b.id);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (b.kind === 'block') {
      ctx.rotate(-(o.tilt[b.id] ?? 0));
      const grad = ctx.createLinearGradient(0, -r, 0, r);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, shade(b.color, -0.25));
      ctx.fillStyle = grad;
      roundRect(ctx, -r, -r, 2 * r, 2 * r, Math.max(3, r * 0.15));
      ctx.fill();
      ctx.lineWidth = sel ? 3 : 1;
      ctx.strokeStyle = sel ? '#FFFFFF' : shade(b.color, -0.4);
      ctx.stroke();
    } else {
      const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      grad.addColorStop(0, shade(b.color, 0.35));
      grad.addColorStop(1, b.color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = sel ? 3 : 0;
      ctx.strokeStyle = '#FFFFFF';
      if (sel) ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#111214';
    ctx.font = `700 ${Math.max(9, Math.min(f, r * 0.75))}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${+b.m.toFixed(2)} ${o.lang === 'ru' ? 'кг' : 'kg'}`, p.x, p.y);
  }

  // force arrows: the heaviest weight is drawn ~1.1 m long
  if (o.showForces) {
    const maxW = Math.max(1, ...scene.bodies.map((b) => b.m * Math.max(scene.laws.g, 1)));
    const k = (1.1 * s) / maxW;
    for (const b of scene.bodies) {
      const F = world.forces[b.id];
      if (!F) continue;
      const p = P(b);
      const focus = !o.selected || o.selected === b.id;
      for (const [key, st] of Object.entries(FORCE_STYLE)) {
        const vec = F[key as keyof typeof F];
        const mag = Math.hypot(vec.x, vec.y);
        if (mag < 0.05) continue;
        const ex = p.x + vec.x * k;
        const ey = p.y - vec.y * k;
        ctx.globalAlpha = focus ? 1 : 0.35;
        arrow(ctx, p.x, p.y, ex, ey, st.color, Math.max(2, s * 0.035));
        if (focus) label(ctx, st[o.lang], ex + (vec.x / mag) * f * 1.1, ey - (vec.y / mag) * f * 1.1, st.color, f * 0.85);
        ctx.globalAlpha = 1;
      }
    }
  }
  if (o.showVelocity) {
    for (const b of scene.bodies) {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < 0.05) continue;
      const p = P(b);
      const k = s * 0.25;
      arrow(ctx, p.x, p.y, p.x + b.vx * k, p.y - b.vy * k, '#FFFFFF', Math.max(1.5, s * 0.025));
      label(ctx, 'v', p.x + b.vx * k + (b.vx / sp) * f, p.y - b.vy * k - (b.vy / sp) * f, '#FFFFFF', f * 0.85);
    }
  }

  // a connection being made
  if (o.pending.length && o.pointer) {
    const from = world.point(o.pending[o.pending.length - 1]);
    if (from) {
      const a = P(from);
      const b = P(o.pointer);
      ctx.strokeStyle = '#5B8CFF';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // clock
  label(ctx, `t = ${world.t.toFixed(2)} ${o.lang === 'ru' ? 'с' : 's'}`, 8 + f * 3.2, 8 + f * 0.7, '#EDEDED', f);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => Math.round(k < 0 ? x * (1 + k) : x + (255 - x) * k));
  return `rgb(${c.join(',')})`;
}
