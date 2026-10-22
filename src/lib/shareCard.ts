import { useEffect, useState } from 'react';

/* Result cards for stories: a 1080×1920 picture drawn on a canvas, shared through the system sheet
   (Instagram, Telegram, WhatsApp…) or downloaded where sharing files is not supported. */

export interface CardData {
  /** small line on top, e.g. "Вызов дня · 22.10" */
  kicker: string;
  /** the big result, e.g. "9/10" */
  big: string;
  /** a line under the result, e.g. "за 48 с" */
  sub?: string;
  /** right and wrong answers, drawn as green and red squares */
  marks?: boolean[];
  /** a closing line, e.g. "Сможешь лучше?" */
  call?: string;
  color: string;
}

export const SITE = 'stem-visualizer.pages.dev';
const W = 1080;
const H = 1920;

const font = (weight: number, size: number) => `${weight} ${size}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** wraps text to the width and draws it centred; returns the y below the last line */
function wrap(g: CanvasRenderingContext2D, text: string, y: number, max: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) {
      g.fillText(line, W / 2, y);
      y += lh;
      line = w;
    } else line = t;
  }
  if (line) g.fillText(line, W / 2, y);
  return y + lh;
}

export async function drawCard(d: CardData): Promise<Blob> {
  await document.fonts?.ready;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  // night background with a glow of the game colour
  g.fillStyle = '#0A0D18';
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, 760, 40, W / 2, 760, 900);
  glow.addColorStop(0, d.color + 'AA');
  glow.addColorStop(0.45, d.color + '33');
  glow.addColorStop(1, '#0A0D1800');
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) g.fillRect(x - 2, y - 2, 4, 4);

  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  // brand
  roundRect(g, W / 2 - 48, 200, 96, 96, 26);
  g.fillStyle = '#2F5BFF';
  g.fill();
  g.strokeStyle = '#fff';
  g.lineWidth = 7;
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(W / 2, 222);
  g.lineTo(W / 2 + 26, 236);
  g.lineTo(W / 2 + 26, 262);
  g.lineTo(W / 2, 276);
  g.lineTo(W / 2 - 26, 262);
  g.lineTo(W / 2 - 26, 236);
  g.closePath();
  g.moveTo(W / 2 - 26, 236);
  g.lineTo(W / 2, 250);
  g.lineTo(W / 2 + 26, 236);
  g.moveTo(W / 2, 250);
  g.lineTo(W / 2, 276);
  g.stroke();
  g.fillStyle = '#fff';
  g.font = font(800, 52);
  g.fillText('STEM Visualizer', W / 2, 380);

  // kicker pill
  g.font = font(700, 40);
  const kw = g.measureText(d.kicker).width + 80;
  roundRect(g, (W - kw) / 2, 520, kw, 84, 42);
  g.fillStyle = d.color + '33';
  g.fill();
  g.strokeStyle = d.color;
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = '#fff';
  g.fillText(d.kicker, W / 2, 576);

  // the result
  g.font = font(900, d.big.length > 6 ? 200 : 280);
  g.fillStyle = '#fff';
  g.shadowColor = d.color;
  g.shadowBlur = 60;
  g.fillText(d.big, W / 2, 920);
  g.shadowBlur = 0;
  let y = 1010;
  if (d.sub) {
    g.font = font(600, 56);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    y = wrap(g, d.sub, y, 880, 70);
  }
  if (d.marks?.length) {
    const s = 64;
    const gap = 16;
    const per = Math.min(10, d.marks.length);
    const rows = Math.ceil(d.marks.length / per);
    const x0 = (W - (per * s + (per - 1) * gap)) / 2;
    y += 30;
    d.marks.forEach((ok, k) => {
      roundRect(g, x0 + (k % per) * (s + gap), y + Math.floor(k / per) * (s + gap), s, s, 14);
      g.fillStyle = ok ? '#30A46C' : '#E5484D';
      g.fill();
    });
    y += rows * (s + gap) + 40;
  }
  if (d.call) {
    g.font = font(800, 72);
    g.fillStyle = '#fff';
    wrap(g, d.call, Math.max(y + 80, 1480), 900, 88);
  }
  // footer link
  roundRect(g, 140, 1700, W - 280, 110, 55);
  g.fillStyle = '#2F5BFF';
  g.fill();
  g.font = font(800, 46);
  g.fillStyle = '#fff';
  g.fillText(SITE, W / 2, 1771);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), 'image/png'));
}

/** shares a card drawn beforehand (iPhone opens the share sheet only straight from a tap, so nothing slow may
    run before it); falls back to downloading the picture and copying the text */
export async function shareCard(blob: Blob, text: string, file = 'stem-result.png'): Promise<'shared' | 'saved'> {
  const png = new File([blob], file, { type: 'image/png' });
  if (navigator.canShare?.({ files: [png] })) {
    try {
      await navigator.share({ files: [png], text });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'shared';
    }
  }
  const url = URL.createObjectURL(png);
  const a = document.createElement('a');
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 60_000);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* the picture is saved anyway */
  }
  return 'saved';
}

/** draws the card as soon as the data is known, so a later tap can share it at once */
export function useCard(d: CardData | null): Blob | null {
  const key = d ? JSON.stringify(d) : '';
  const [blob, setBlob] = useState<{ key: string; blob: Blob } | null>(null);
  useEffect(() => {
    if (!d) return;
    let alive = true;
    drawCard(d).then((b) => alive && setBlob({ key, blob: b }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return blob && blob.key === key ? blob.blob : null;
}
