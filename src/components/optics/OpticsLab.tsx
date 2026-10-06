import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hand, RotateCcw, Trash2 } from 'lucide-react';
import { COLOR_OF, curvedArc, Element, flatEnds, imageOf, isSource, Item, LightColor, nAt, polygon, trace, Trace, Vec } from './optics';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });
const W = 100;
const H = 60;
const fmt = (x: number, d = 1) => (Math.abs(x) < 0.05 && d <= 1 ? '0' : x.toFixed(d)).replace('.', ',');

interface Preset {
  id: string;
  title: T2;
  laws: T2;
  hint: T2;
  focus?: string;
  make: () => Item[];
}

const PRESETS: Preset[] = [
  {
    id: 'refraction',
    title: t('Преломление света', 'Refraction'),
    laws: t('Закон преломления: n₁ sin α = n₂ sin β', 'Snell’s law: n₁ sin α = n₂ sin β'),
    hint: t('Поверни лазер и смотри на углы. Отношение sin α / sin β всегда равно показателю преломления стекла. Часть света отражается — это тусклый луч.', 'Rotate the laser and watch the angles: sin α / sin β always equals the glass index. Some light reflects too: that is the faint ray.'),
    focus: 'L',
    make: () => [
      { id: 'L', kind: 'laser', x: 22, y: 8, angle: 60, color: 'red' },
      { id: 'B', kind: 'block', x: 55, y: 38, angle: 0, w: 60, h: 18, n: 1.5 },
    ],
  },
  {
    id: 'tir',
    title: t('Полное внутреннее отражение', 'Total internal reflection'),
    laws: t('Предельный угол: sin α₀ = 1/n', 'Critical angle: sin α₀ = 1/n'),
    hint: t('Луч входит в полукруг без преломления и падает на плоскую грань изнутри. Поворачивай лазер: когда угол станет больше α₀ ≈ 41,8°, свет перестанет выходить наружу.', 'The ray enters the half-disc unbent and hits the flat face from inside. Turn the laser: past α₀ ≈ 41.8° no light gets out.'),
    focus: 'L',
    make: () => [
      { id: 'S', kind: 'semi', x: 50, y: 26, angle: 90, r: 18, n: 1.5 },
      { id: 'L', kind: 'laser', x: 50 + 34 * Math.cos((60 * Math.PI) / 180), y: 26 + 34 * Math.sin((60 * Math.PI) / 180), angle: 240, color: 'green' },
    ],
  },
  {
    id: 'prism',
    title: t('Призма и спектр', 'Prism and spectrum'),
    laws: t('Дисперсия: n зависит от цвета', 'Dispersion: n depends on colour'),
    hint: t('Белый свет — смесь цветов. Фиолетовые лучи преломляются сильнее красных, поэтому призма раскладывает свет в радугу. Поверни призму.', 'White light is a mix of colours. Violet bends more than red, so the prism spreads light into a rainbow. Rotate the prism.'),
    focus: 'P',
    make: () => [
      { id: 'L', kind: 'laser', x: 8, y: 34, angle: -14, color: 'white' },
      { id: 'P', kind: 'prism', x: 45, y: 30, angle: 0, size: 26, n: 1.5 },
    ],
  },
  {
    id: 'convex',
    title: t('Собирающая линза', 'Converging lens'),
    laws: t('Формула тонкой линзы: 1/F = 1/d + 1/f', 'Thin lens formula: 1/F = 1/d + 1/f'),
    hint: t('Двигай предмет. Дальше 2F — изображение уменьшенное, между F и 2F — увеличенное, ближе F — мнимое и прямое (так работает лупа).', 'Move the object. Beyond 2F the image is smaller, between F and 2F bigger, inside F it is virtual and upright, like a magnifier.'),
    focus: 'O',
    make: () => [
      { id: 'O', kind: 'object', x: 14, y: 32, angle: 0, h: 8 },
      { id: 'Ln', kind: 'lens', x: 50, y: 32, angle: 0, h: 18, f: 15 },
    ],
  },
  {
    id: 'concave',
    title: t('Рассеивающая линза', 'Diverging lens'),
    laws: t('Изображение всегда мнимое, прямое, уменьшенное', 'The image is always virtual, upright and smaller'),
    hint: t('Лучи после линзы расходятся, а их продолжения (пунктир) сходятся в мнимом изображении. Где бы ни стоял предмет, изображение будет прямым и уменьшенным.', 'Rays spread after the lens; their extensions (dashed) meet at a virtual image. Wherever the object is, the image is upright and smaller.'),
    focus: 'O',
    make: () => [
      { id: 'O', kind: 'object', x: 18, y: 32, angle: 0, h: 9 },
      { id: 'Ln', kind: 'lens', x: 50, y: 32, angle: 0, h: 18, f: -15 },
    ],
  },
  {
    id: 'mirror',
    title: t('Плоское зеркало', 'Flat mirror'),
    laws: t('Закон отражения: угол падения равен углу отражения', 'Law of reflection: angle in = angle out'),
    hint: t('Поверни зеркало или лазер: угол отражения всегда равен углу падения. Добавь второе зеркало и построй перископ.', 'Rotate the mirror or the laser: the reflection angle always equals the incidence angle. Add a second mirror to make a periscope.'),
    focus: 'L',
    make: () => [
      { id: 'L', kind: 'laser', x: 10, y: 45, angle: -20, color: 'red' },
      { id: 'M', kind: 'mirror', x: 60, y: 22, angle: 110, h: 14 },
    ],
  },
  {
    id: 'spherical',
    title: t('Вогнутое зеркало', 'Concave mirror'),
    laws: t('Фокус сферического зеркала: F = R/2', 'Focus of a spherical mirror: F = R/2'),
    hint: t('Параллельные лучи после вогнутого зеркала собираются в фокусе на расстоянии R/2 — так работают фары и солнечные печи. Сделай R отрицательным — зеркало станет выпуклым и рассеет лучи.', 'Parallel rays meet at the focus, R/2 away: that is how headlights and solar cookers work. Make R negative for a convex mirror that spreads light.'),
    focus: 'M',
    make: () => [
      { id: 'B', kind: 'beam', x: 8, y: 30, angle: 0, color: 'blue', w: 24, rays: 9 },
      { id: 'M', kind: 'curved', x: 85, y: 30, angle: 180, h: 16, R: 50 },
    ],
  },
  {
    id: 'fiber',
    title: t('Световод', 'Optical fibre'),
    laws: t('Полное внутреннее отражение в оптоволокне', 'Total internal reflection in a fibre'),
    hint: t('Луч много раз отражается от стенок изнутри и не выходит наружу — так интернет идёт по оптоволокну. Увеличь угол лазера, и свет начнёт «вытекать».', 'The ray bounces off the walls from inside and stays in, which is how internet signals travel through fibre. Steepen the laser and light starts to leak.'),
    focus: 'L',
    make: () => [
      { id: 'F', kind: 'block', x: 55, y: 30, angle: 0, w: 80, h: 7, n: 1.5 },
      { id: 'L', kind: 'laser', x: 5, y: 26, angle: 12, color: 'green' },
    ],
  },
  {
    id: 'empty',
    title: t('Пустой стол', 'Empty bench'),
    laws: t('Собери свою оптическую схему', 'Build your own optical setup'),
    hint: t('Добавляй лазеры, лампы, линзы, зеркала и стёкла. Перетаскивай их, а круглой ручкой поворачивай.', 'Add lasers, lamps, lenses, mirrors and glass. Drag them around and turn them with the round handle.'),
    make: () => [],
  },
];

const ADD: { kind: Item['kind']; ru: string; en: string }[] = [
  { kind: 'laser', ru: 'Лазер', en: 'Laser' },
  { kind: 'beam', ru: 'Пучок', en: 'Beam' },
  { kind: 'lamp', ru: 'Лампа', en: 'Lamp' },
  { kind: 'object', ru: 'Предмет', en: 'Object' },
  { kind: 'lens', ru: 'Линза', en: 'Lens' },
  { kind: 'mirror', ru: 'Зеркало', en: 'Mirror' },
  { kind: 'curved', ru: 'Сферич. зеркало', en: 'Curved mirror' },
  { kind: 'block', ru: 'Стекло', en: 'Glass block' },
  { kind: 'prism', ru: 'Призма', en: 'Prism' },
  { kind: 'semi', ru: 'Полукруг', en: 'Half-disc' },
];

function fresh(kind: Item['kind'], id: string): Item {
  const x = 50;
  const y = 30;
  switch (kind) {
    case 'laser':
      return { id, kind, x: 15, y, angle: 0, color: 'red' };
    case 'beam':
      return { id, kind, x: 12, y, angle: 0, color: 'green', w: 16, rays: 7 };
    case 'lamp':
      return { id, kind, x: 20, y, angle: 0, color: 'white', rays: 36 };
    case 'object':
      return { id, kind, x: 20, y: 34, angle: 0, h: 8 };
    case 'lens':
      return { id, kind, x, y, angle: 0, h: 16, f: 15 };
    case 'mirror':
      return { id, kind, x: 70, y, angle: 180, h: 12 };
    case 'curved':
      return { id, kind, x: 80, y, angle: 180, h: 14, R: 40 };
    case 'block':
      return { id, kind, x, y, angle: 0, w: 24, h: 14, n: 1.5 };
    case 'prism':
      return { id, kind, x, y, angle: 0, size: 22, n: 1.5 };
    case 'semi':
      return { id, kind, x, y, angle: 0, r: 14, n: 1.5 };
  }
}

/* ---------- geometry helpers for picking ---------- */

const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
function segDist(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const k = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - a.x - dx * k, p.y - a.y - dy * k);
}
function inPoly(p: Vec, pts: Vec[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function hits(it: Item, p: Vec): boolean {
  switch (it.kind) {
    case 'lens':
    case 'mirror': {
      const [a, b] = flatEnds(it);
      return segDist(p, a, b) < 2.5;
    }
    case 'curved':
      return dist(p, it) < Math.max(4, it.h * 0.6);
    case 'block':
    case 'prism':
      return inPoly(p, polygon(it));
    case 'semi':
      return dist(p, it) < it.r;
    case 'object':
      return Math.abs(p.x - it.x) < 2.5 && p.y < it.y + 1 && p.y > it.y - it.h - 1;
    default:
      return dist(p, it) < 3.5;
  }
}
/** where the rotate handle sits */
function handle(it: Item): Vec {
  const r = it.kind === 'lens' || it.kind === 'mirror' || it.kind === 'curved' ? it.h + 4 : it.kind === 'block' ? Math.max(it.w, it.h) / 2 + 4 : it.kind === 'prism' ? it.size * 0.6 + 3 : it.kind === 'semi' ? it.r + 4 : 8;
  const a = ((it.kind === 'lens' || it.kind === 'mirror' ? it.angle + 90 : it.angle) * Math.PI) / 180;
  return { x: it.x + Math.cos(a) * r, y: it.y + Math.sin(a) * r };
}

/* ---------- drawing ---------- */

function draw(ctx: CanvasRenderingContext2D, s: number, items: Item[], tr: Trace, sel: string | null, focusSrc: string | null, lang: Lang, dpr: number) {
  const P = (p: Vec) => ({ x: p.x * s, y: p.y * s });
  const w = W * s;
  const h = H * s;
  const f = Math.max(11 * dpr, s * 1.6);
  ctx.fillStyle = '#0B0C0E';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#17191D';
  ctx.lineWidth = 1;
  for (let x = 10; x < W; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x * s, 0);
    ctx.lineTo(x * s, h);
    ctx.stroke();
  }
  for (let y = 10; y < H; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y * s);
    ctx.lineTo(w, y * s);
    ctx.stroke();
  }
  ctx.fillStyle = '#3A3D45';
  ctx.font = `${f * 0.75}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(lang === 'ru' ? '1 клетка = 10 см' : '1 square = 10 cm', 6 * dpr, 6 * dpr);

  const label = (str: string, x: number, y: number, color: string) => {
    ctx.font = `600 ${f * 0.85}px Inter, system-ui, sans-serif`;
    const tw = ctx.measureText(str).width;
    ctx.fillStyle = 'rgba(11,12,14,0.8)';
    ctx.fillRect(x - tw / 2 - 3, y - f * 0.6, tw + 6, f * 1.2);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  };

  // optical axes, focal points
  for (const it of items) {
    if (it.kind !== 'lens' && it.kind !== 'curved') continue;
    const a = (it.angle * Math.PI) / 180;
    const u = { x: Math.cos(a), y: Math.sin(a) };
    ctx.setLineDash([4 * dpr, 6 * dpr]);
    ctx.strokeStyle = '#2C2F36';
    ctx.beginPath();
    ctx.moveTo((it.x - u.x * 200) * s, (it.y - u.y * 200) * s);
    ctx.lineTo((it.x + u.x * 200) * s, (it.y + u.y * 200) * s);
    ctx.stroke();
    ctx.setLineDash([]);
    const F = it.kind === 'lens' ? Math.abs(it.f) : it.R / 2;
    const marks = it.kind === 'lens' ? [-2, -1, 1, 2] : [1, 2];
    for (const k of marks) {
      const q = P({ x: it.x + u.x * F * k, y: it.y + u.y * F * k });
      ctx.fillStyle = '#8C8F98';
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${f * 0.75}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(Math.abs(k) === 2 ? '2F' : 'F', q.x, q.y + 4 * dpr);
    }
  }

  // rays (additive, so colours mix into white)
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const r of tr.rays) {
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = r.alpha;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(r.a.x * s, r.a.y * s);
    ctx.lineTo(r.b.x * s, r.b.y * s);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // elements
  for (const it of items) {
    const isSel = sel === it.id;
    const stroke = isSel ? '#5B8CFF' : '#B5B8C0';
    ctx.lineWidth = (isSel ? 2.5 : 1.8) * dpr;
    ctx.strokeStyle = stroke;
    switch (it.kind) {
      case 'block':
      case 'prism': {
        const pts = polygon(it).map(P);
        ctx.fillStyle = 'rgba(120,170,255,0.14)';
        ctx.beginPath();
        pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const c = P(it);
        label(`n = ${fmt(it.n, 2)}`, c.x, c.y, '#8FA4FF');
        break;
      }
      case 'semi': {
        const c = P(it);
        const a = (it.angle * Math.PI) / 180;
        ctx.fillStyle = 'rgba(120,170,255,0.14)';
        ctx.beginPath();
        ctx.arc(c.x, c.y, it.r * s, a - Math.PI / 2, a + Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        label(`n = ${fmt(it.n, 2)}`, c.x + Math.cos(a) * it.r * s * 0.5, c.y + Math.sin(a) * it.r * s * 0.5, '#8FA4FF');
        break;
      }
      case 'lens': {
        const [a, b] = flatEnds(it).map(P);
        const ax = (it.angle * Math.PI) / 180;
        const bulge = (it.f > 0 ? 1 : -1) * Math.min(it.h * 0.25, 3) * s;
        const nx = Math.cos(ax);
        const ny = Math.sin(ax);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        ctx.fillStyle = 'rgba(120,170,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mid.x + nx * bulge * 2, mid.y + ny * bulge * 2, b.x, b.y);
        ctx.quadraticCurveTo(mid.x - nx * bulge * 2, mid.y - ny * bulge * 2, a.x, a.y);
        ctx.fill();
        ctx.stroke();
        // arrow tips (textbook symbol)
        for (const [end, dir] of [
          [a, -1],
          [b, 1],
        ] as const) {
          const tx = (b.x - a.x) / Math.hypot(b.x - a.x, b.y - a.y);
          const ty = (b.y - a.y) / Math.hypot(b.x - a.x, b.y - a.y);
          const k = it.f > 0 ? dir : -dir;
          const hs = 1.6 * s;
          ctx.beginPath();
          ctx.moveTo(end.x - nx * hs - tx * hs * k, end.y - ny * hs - ty * hs * k);
          ctx.lineTo(end.x, end.y);
          ctx.lineTo(end.x + nx * hs - tx * hs * k, end.y + ny * hs - ty * hs * k);
          ctx.stroke();
        }
        label(`F = ${fmt(it.f, 0)} см`, mid.x, Math.max(a.y, b.y) + f * 1.2, '#8FA4FF');
        break;
      }
      case 'mirror': {
        const [a, b] = flatEnds(it).map(P);
        ctx.lineWidth = 3 * dpr;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        // hatching on the back
        const ax = ((it.angle + 180) * Math.PI) / 180;
        ctx.lineWidth = 1 * dpr;
        for (let k = 0; k <= 10; k++) {
          const x = a.x + ((b.x - a.x) * k) / 10;
          const y = a.y + ((b.y - a.y) * k) / 10;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(ax + 0.6) * s * 1.5, y + Math.sin(ax + 0.6) * s * 1.5);
          ctx.stroke();
        }
        break;
      }
      case 'curved': {
        const { c, r, from, to } = curvedArc(it);
        ctx.lineWidth = 3 * dpr;
        ctx.beginPath();
        ctx.arc(c.x * s, c.y * s, r * s, from, to);
        ctx.stroke();
        label(`R = ${fmt(it.R, 0)} см`, it.x * s, (it.y + it.h) * s + f * 1.2, '#8FA4FF');
        break;
      }
      case 'laser': {
        const c = P(it);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((it.angle * Math.PI) / 180);
        ctx.fillStyle = '#2C2F36';
        ctx.fillRect(-4 * s, -1.2 * s, 4.4 * s, 2.4 * s);
        ctx.strokeRect(-4 * s, -1.2 * s, 4.4 * s, 2.4 * s);
        ctx.fillStyle = it.color === 'white' ? '#FFFFFF' : COLOR_OF[it.color].color;
        ctx.fillRect(-0.2 * s, -0.5 * s, 0.8 * s, 1 * s);
        ctx.restore();
        break;
      }
      case 'beam': {
        const a = ((it.angle + 90) * Math.PI) / 180;
        const c = P(it);
        ctx.lineWidth = 4 * dpr;
        ctx.beginPath();
        ctx.moveTo(c.x - Math.cos(a) * (it.w / 2) * s, c.y - Math.sin(a) * (it.w / 2) * s);
        ctx.lineTo(c.x + Math.cos(a) * (it.w / 2) * s, c.y + Math.sin(a) * (it.w / 2) * s);
        ctx.stroke();
        break;
      }
      case 'lamp': {
        const c = P(it);
        ctx.fillStyle = '#FFE47A';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'object': {
        const b = P(it);
        const tp = P({ x: it.x, y: it.y - it.h });
        ctx.strokeStyle = isSel ? '#5B8CFF' : '#FFD60A';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 3 * dpr;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(tp.x, tp.y + 1.2 * s * Math.sign(it.h));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tp.x, tp.y);
        ctx.lineTo(tp.x - 1.1 * s, tp.y + 1.8 * s * Math.sign(it.h));
        ctx.lineTo(tp.x + 1.1 * s, tp.y + 1.8 * s * Math.sign(it.h));
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
    if (isSel) {
      const hd = P(handle(it));
      const c = P(it);
      ctx.strokeStyle = 'rgba(91,140,255,0.6)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(hd.x, hd.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#5B8CFF';
      ctx.beginPath();
      ctx.arc(hd.x, hd.y, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // images formed by lenses / curved mirrors
  const obj = items.find((i) => i.kind === 'object');
  const opt = items.find((i): i is Element & { kind: 'lens' | 'curved' } => i.kind === 'lens' || i.kind === 'curved');
  if (obj && obj.kind === 'object' && opt) {
    const im = imageOf(obj, opt);
    if (im) {
      const b = P(im.base);
      const tp = P(im.tip);
      ctx.strokeStyle = im.real ? '#F76B15' : 'rgba(247,107,21,0.85)';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 3 * dpr;
      ctx.setLineDash(im.real ? [] : [6 * dpr, 5 * dpr]);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(tp.x, tp.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const dir = Math.sign(tp.y - b.y) || 1;
      ctx.beginPath();
      ctx.moveTo(tp.x, tp.y);
      ctx.lineTo(tp.x - 1.1 * s, tp.y - 1.8 * s * dir);
      ctx.lineTo(tp.x + 1.1 * s, tp.y - 1.8 * s * dir);
      ctx.closePath();
      ctx.fill();
      if (!im.real) {
        // backward extensions of the outgoing rays meet at the virtual image
        ctx.strokeStyle = 'rgba(255,214,10,0.45)';
        ctx.lineWidth = 1.2 * dpr;
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        for (const e of tr.events.filter((e) => e.source === obj.id && (e.kind === 'lens' || e.kind === 'reflect'))) {
          const q = P(e.p);
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(tp.x, tp.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      label(lang === 'ru' ? (im.real ? 'изображение' : 'мнимое изображение') : im.real ? 'image' : 'virtual image', tp.x, tp.y - f * 1.2 * dir, '#F76B15');
    }
  }

  // normals and angles for the followed source
  const evs = tr.events.filter((e) => e.source === focusSrc && e.kind !== 'lens').slice(0, 3);
  for (const e of evs) {
    const q = P(e.p);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(q.x - e.n.x * 7 * s, q.y - e.n.y * 7 * s);
    ctx.lineTo(q.x + e.n.x * 7 * s, q.y + e.n.y * 7 * s);
    ctx.stroke();
    ctx.setLineDash([]);
    const txt = e.kind === 'refract' ? `α ${fmt(e.inDeg)}° · β ${fmt(e.outDeg!)}°` : e.kind === 'tir' ? `${fmt(e.inDeg)}° — ${lang === 'ru' ? 'ПВО' : 'TIR'}` : `${fmt(e.inDeg)}° = ${fmt(e.outDeg!)}°`;
    label(txt, q.x + e.n.x * 9 * s, q.y + e.n.y * 9 * s, e.kind === 'tir' ? '#F76B15' : '#EDEDED');
  }
}

/* ---------- component ---------- */

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit?: string; digits?: number; onChange: (v: number) => void }> = ({ label, value, min, max, step, unit, digits = 0, onChange }) => (
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

export const OpticsLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [presetId, setPresetId] = useState('refraction');
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const [items, setItems] = useState<Item[]>(() => preset.make());
  const [selected, setSelected] = useState<string | null>(preset.focus ?? null);
  const [del, setDel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = useRef({ s: 8, dpr: 1 });
  const drag = useRef<{ id: string; mode: 'move' | 'rotate'; dx: number; dy: number } | null>(null);
  const ids = useRef(1);
  const tr = useMemo(() => trace(items), [items]);
  const focusSrc = useMemo(() => {
    const sel = items.find((i) => i.id === selected);
    if (sel && isSource(sel)) return sel.id;
    return items.find((i) => i.kind === 'laser')?.id ?? null;
  }, [items, selected]);

  useEffect(() => progress.recordLab('sandbox-optics'), []);

  const load = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setItems(p.make());
    setSelected(p.focus ?? null);
    setDel(false);
  };

  const redraw = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (ctx) draw(ctx, scale.current.s, items, tr, selected, focusSrc, lang, scale.current.dpr);
  };
  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;
  useEffect(redraw, [items, tr, selected, focusSrc, lang]);
  // size
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const s = (c.clientWidth * dpr) / W;
      c.width = Math.round(W * s);
      c.height = Math.round(H * s);
      scale.current = { s, dpr };
      redrawRef.current();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const local = (e: React.PointerEvent): Vec => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const update = (id: string, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? ({ ...i, ...patch } as Item) : i)));

  const onDown = (e: React.PointerEvent) => {
    const p = local(e);
    const sel = items.find((i) => i.id === selected);
    if (sel && !del && dist(p, handle(sel)) < 3) {
      drag.current = { id: sel.id, mode: 'rotate', dx: 0, dy: 0 };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }
    const hit = [...items].reverse().find((i) => hits(i, p));
    if (del) {
      if (hit) setItems((l) => l.filter((i) => i.id !== hit.id));
      return;
    }
    setSelected(hit?.id ?? null);
    if (hit) {
      drag.current = { id: hit.id, mode: 'move', dx: p.x - hit.x, dy: p.y - hit.y };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = local(e);
    const it = items.find((i) => i.id === d.id);
    if (!it) return;
    if (d.mode === 'move') update(d.id, { x: Math.max(1, Math.min(W - 1, p.x - d.dx)), y: Math.max(1, Math.min(H - 1, p.y - d.dy)) });
    else {
      let a = (Math.atan2(p.y - it.y, p.x - it.x) * 180) / Math.PI;
      if (it.kind === 'lens' || it.kind === 'mirror') a -= 90;
      update(d.id, { angle: Math.round(a) });
    }
  };
  const onUp = () => (drag.current = null);

  const add = (kind: Item['kind']) => {
    const id = `${kind}${ids.current++}`;
    setItems((l) => [...l, fresh(kind, id)]);
    setSelected(id);
    setDel(false);
  };

  const sel = items.find((i) => i.id === selected);
  const opt = items.find((i) => i.kind === 'lens' || i.kind === 'curved');
  const obj = items.find((i) => i.kind === 'object');
  const im = obj && obj.kind === 'object' && opt && (opt.kind === 'lens' || opt.kind === 'curved') ? imageOf(obj, opt) : null;
  const evs = tr.events.filter((e) => e.source === focusSrc && e.kind !== 'lens').slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => load(p.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-sm border cursor-pointer ${presetId === p.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={presetId === p.id ? { color: '#fff' } : undefined}
          >
            {p.title[lang]}
          </button>
        ))}
      </div>
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{preset.laws[lang]}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{preset.hint[lang]}</p>
      </div>

      <div className="rounded-xl overflow-hidden border border-[#1F2126]">
        <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className={`block w-full touch-none select-none ${del ? 'cursor-crosshair' : 'cursor-grab'}`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDel(false)}
          className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${!del ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
          style={!del ? { color: '#fff' } : undefined}
        >
          <Hand className="w-4 h-4" />
          {L('Двигать', 'Move')}
        </button>
        <button
          onClick={() => setDel(!del)}
          className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${del ? 'bg-[#E5484D] border-[#E5484D]' : 'bg-surface border-line text-ink hover:bg-muted'}`}
          style={del ? { color: '#fff' } : undefined}
        >
          <Trash2 className="w-4 h-4" />
          {L('Удалить', 'Delete')}
        </button>
        <span className="w-px h-9 bg-line mx-1" />
        {ADD.map((a) => (
          <button key={a.kind} onClick={() => add(a.kind)} className="h-9 px-3 rounded-lg text-sm border border-dashed border-line-strong bg-surface text-ink hover:bg-muted cursor-pointer">
            + {a[lang]}
          </button>
        ))}
        <button onClick={() => load(presetId)} className="ml-auto h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
          <RotateCcw className="w-4 h-4" />
          {L('Сбросить', 'Reset')}
        </button>
      </div>
      <p className="text-xs text-ink-3 -mt-2">{L('Перетаскивай предметы. Синей круглой ручкой у выбранного предмета его можно поворачивать.', 'Drag things around. Turn the selected one with its round blue handle.')}</p>

      <div className="grid md:grid-cols-2 gap-3 items-start">
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{L('Выбранный предмет', 'Selected')}</h3>
          {sel ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-ink">{ADD.find((a) => a.kind === sel.kind)?.[lang]}</div>
              {sel.kind !== 'object' && <Slider label={L('Поворот', 'Rotation')} value={sel.angle} min={-180} max={180} step={1} unit="°" onChange={(angle) => update(sel.id, { angle })} />}
              {(sel.kind === 'laser' || sel.kind === 'beam' || sel.kind === 'lamp') && (
                <div className="flex flex-wrap gap-1.5">
                  {(['red', 'green', 'blue', 'white'] as LightColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => update(sel.id, { color: c })}
                      className={`h-8 px-2.5 rounded-md text-xs border cursor-pointer ${sel.color === c ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-2'}`}
                    >
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ background: c === 'white' ? 'linear-gradient(90deg,#8B5CF6,#22C55E,#FACC15,#EF4444)' : COLOR_OF[c].color }} />
                      {{ red: L('Красный', 'Red'), green: L('Зелёный', 'Green'), blue: L('Синий', 'Blue'), white: L('Белый', 'White') }[c]}
                    </button>
                  ))}
                </div>
              )}
              {sel.kind === 'beam' && <Slider label={L('Ширина пучка', 'Beam width')} value={sel.w} min={2} max={40} step={1} unit={L('см', 'cm')} onChange={(w) => update(sel.id, { w })} />}
              {sel.kind === 'object' && <Slider label={L('Высота предмета', 'Object height')} value={sel.h} min={2} max={16} step={0.5} unit={L('см', 'cm')} digits={1} onChange={(h) => update(sel.id, { h })} />}
              {sel.kind === 'lens' && (
                <>
                  <Slider label={L('Фокусное расстояние F (− рассеивающая)', 'Focal length F (− diverging)')} value={sel.f} min={-40} max={40} step={1} unit={L('см', 'cm')} onChange={(f) => update(sel.id, { f: Math.abs(f) < 3 ? (f < 0 ? -3 : 3) : f })} />
                  <p className="text-xs text-ink-3">
                    {L('Оптическая сила', 'Optical power')} D = 1/F = <span className="font-mono text-ink">{fmt(100 / sel.f, 1)} {L('дптр', 'dpt')}</span>
                  </p>
                </>
              )}
              {sel.kind === 'curved' && <Slider label={L('Радиус R (− выпуклое)', 'Radius R (− convex)')} value={sel.R} min={-80} max={80} step={1} unit={L('см', 'cm')} onChange={(R) => update(sel.id, { R: Math.abs(R) < 10 ? (R < 0 ? -10 : 10) : R })} />}
              {(sel.kind === 'lens' || sel.kind === 'mirror' || sel.kind === 'curved') && <Slider label={L('Размер', 'Size')} value={sel.h} min={4} max={25} step={1} unit={L('см', 'cm')} onChange={(h) => update(sel.id, { h })} />}
              {(sel.kind === 'block' || sel.kind === 'prism' || sel.kind === 'semi') && (
                <>
                  <Slider label={L('Показатель преломления n', 'Refractive index n')} value={sel.n} min={1} max={2.5} step={0.01} digits={2} onChange={(n) => update(sel.id, { n })} />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { n: 1.33, ru: 'Вода', en: 'Water' },
                      { n: 1.5, ru: 'Стекло', en: 'Glass' },
                      { n: 2.42, ru: 'Алмаз', en: 'Diamond' },
                    ].map((m) => (
                      <button key={m.ru} onClick={() => update(sel.id, { n: m.n })} className="h-7 px-2 rounded-md text-xs border border-line text-ink-2 hover:text-ink cursor-pointer">
                        {m[lang]} {fmt(m.n, 2)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {sel.kind === 'block' && <Slider label={L('Длина', 'Length')} value={sel.w} min={4} max={90} step={1} unit={L('см', 'cm')} onChange={(w) => update(sel.id, { w })} />}
              {sel.kind === 'block' && <Slider label={L('Толщина', 'Thickness')} value={sel.h} min={2} max={40} step={1} unit={L('см', 'cm')} onChange={(h) => update(sel.id, { h })} />}
              {sel.kind === 'prism' && <Slider label={L('Размер', 'Size')} value={sel.size} min={8} max={40} step={1} unit={L('см', 'cm')} onChange={(size) => update(sel.id, { size })} />}
              {sel.kind === 'semi' && <Slider label={L('Радиус', 'Radius')} value={sel.r} min={5} max={28} step={1} unit={L('см', 'cm')} onChange={(r) => update(sel.id, { r })} />}
            </div>
          ) : (
            <p className="text-sm text-ink-3">{L('Нажми на предмет на столе.', 'Tap something on the bench.')}</p>
          )}
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{L('Измерения', 'Readings')}</h3>
          {im ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: L('Предмет d', 'Object d'), v: `${fmt(im.d)} см` },
                  { k: L('Фокус F', 'Focus F'), v: `${fmt(im.f)} см` },
                  { k: L('Изображение f', 'Image f'), v: `${fmt(Math.abs(im.di))} см` },
                ].map((r) => (
                  <div key={r.k} className="rounded-lg bg-muted px-2.5 py-2">
                    <div className="text-[11px] text-ink-2">{r.k}</div>
                    <div className="font-mono text-ink">{r.v}</div>
                  </div>
                ))}
              </div>
              <p className="text-ink">
                {L('Изображение', 'The image is')}: <b>{im.real ? L('действительное', 'real') : L('мнимое', 'virtual')}</b>, <b>{Math.abs(im.m) > 1.02 ? L('увеличенное', 'magnified') : Math.abs(im.m) < 0.98 ? L('уменьшенное', 'reduced') : L('равное', 'same size')}</b>, <b>{im.m < 0 ? L('перевёрнутое', 'inverted') : L('прямое', 'upright')}</b>.
              </p>
              <p className="text-ink-2">
                {L('Увеличение', 'Magnification')} Γ = f/d = <span className="font-mono text-ink">{fmt(Math.abs(im.m), 2)}</span>
              </p>
              <p className="text-xs text-ink-3 font-mono">
                1/F = 1/d {im.real ? '+' : '−'} 1/f → 1/{fmt(im.f)} = 1/{fmt(im.d)} {im.real ? '+' : '−'} 1/{fmt(Math.abs(im.di))}
              </p>
            </div>
          ) : evs.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {evs.map((e, i) => (
                <li key={i} className="rounded-lg bg-muted px-3 py-2">
                  {e.kind === 'refract' ? (
                    <>
                      <div className="text-ink">
                        {L('Преломление', 'Refraction')}: α = <span className="font-mono">{fmt(e.inDeg)}°</span>, β = <span className="font-mono">{fmt(e.outDeg!)}°</span>
                      </div>
                      <div className="text-xs text-ink-2">
                        n₁ = {fmt(e.n1, 2)} → n₂ = {fmt(e.n2, 2)} · sin α / sin β = <span className="font-mono text-ink">{fmt(Math.sin((e.inDeg * Math.PI) / 180) / Math.max(1e-6, Math.sin((e.outDeg! * Math.PI) / 180)), 2)}</span>
                      </div>
                    </>
                  ) : e.kind === 'tir' ? (
                    <>
                      <div className="text-[#CC2F35]">{L('Полное внутреннее отражение', 'Total internal reflection')}</div>
                      <div className="text-xs text-ink-2">
                        α = {fmt(e.inDeg)}° {'>'} α₀ = arcsin(1/{fmt(e.n1, 2)}) = <span className="font-mono text-ink">{fmt((Math.asin(1 / e.n1) * 180) / Math.PI)}°</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-ink">
                      {L('Отражение', 'Reflection')}: {L('угол падения', 'incidence')} <span className="font-mono">{fmt(e.inDeg)}°</span> = {L('угол отражения', 'reflection')} <span className="font-mono">{fmt(e.outDeg!)}°</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-3">{L('Направь луч на стекло или зеркало — здесь появятся углы. Поставь предмет перед линзой — появится изображение.', 'Aim a ray at glass or a mirror to see the angles, or put an object before a lens to get its image.')}</p>
          )}
          {focusSrc && items.find((i) => i.id === focusSrc && i.kind === 'laser' && i.color !== 'white') && (
            <p className="mt-2 text-[11px] text-ink-3">
              {L('Для этого цвета у стекла n чуть отличается от 1,50: ', 'For this colour the glass index differs a little from 1.50: ')}
              n = {fmt(nAt(1.5, COLOR_OF[(items.find((i) => i.id === focusSrc) as { color: Exclude<LightColor, 'white'> }).color].nm), 3)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpticsLab;
