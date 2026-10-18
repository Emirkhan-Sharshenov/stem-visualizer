import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SLIDE_ICONS, IconName } from './slideIcons';
import type { Img, Photo } from './presentation';

/*
 * Pictures for presentations: free-licence images from Wikipedia (with author and licence for the credit line)
 * and large subject icons drawn from the icon set.
 */

type Lang = 'ru' | 'en';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => ok(i);
    i.onerror = fail;
    i.src = src;
  });

/** draws the picture into a canvas no larger than max px, so the .pptx stays small */
function shrink(img: HTMLImageElement, max: number, photo: boolean): Img {
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k);
  const h = Math.round(img.naturalHeight * k);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  if (!photo) {
    // diagrams are often transparent: give them a white sheet so they read on any theme
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);
  return { data: photo ? c.toDataURL('image/jpeg', 0.86) : c.toDataURL('image/png'), w, h };
}

const stripHtml = (s: string) => {
  const d = document.createElement('div');
  d.innerHTML = s;
  return (d.textContent ?? '').replace(/\s+/g, ' ').trim();
};

export interface PhotoCandidate {
  name: string;
  url: string;
  page: string;
}

/** lead pictures of the best-matching Wikipedia articles; only the top results, which stay on topic */
export async function findPhotos(queries: string[], lang: Lang): Promise<PhotoCandidate[]> {
  const host = `https://${lang}.wikipedia.org/w/api.php`;
  const seen = new Set<string>();
  const out: PhotoCandidate[] = [];
  for (const q of queries) {
    const u = `${host}?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=4&prop=pageimages&piprop=thumbnail|name&pithumbsize=1400&pilicense=free`;
    const r = await fetch(u).then((x) => x.json()).catch(() => null);
    const pages = Object.values((r?.query?.pages ?? {}) as Record<string, { index: number; title: string; pageimage?: string; thumbnail?: { source: string; width: number; height: number } }>).sort((a, b) => a.index - b.index);
    for (const p of pages.slice(0, 3)) {
      const t = p.thumbnail;
      if (!t || !p.pageimage || seen.has(p.pageimage)) continue;
      // skip animations, tiny pictures and articles about films, books and people with the same name
      if (/\.gif$/i.test(p.pageimage) || Math.max(t.width, t.height) < 400 || /\((фильм|роман|песня|альбом|значения|film|novel|song|album|disambiguation)\)/i.test(p.title)) continue;
      seen.add(p.pageimage);
      out.push({ name: p.pageimage, url: t.source, page: p.title });
    }
    if (out.length >= 4) break;
  }
  return out;
}

/** downloads chosen candidates and adds the credit line required by their licence */
export async function loadPhotos(cands: PhotoCandidate[], lang: Lang): Promise<Photo[]> {
  if (!cands.length) return [];
  const host = `https://${lang}.wikipedia.org/w/api.php`;
  const meta = await fetch(`${host}?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&titles=${encodeURIComponent(cands.map((c) => `File:${c.name}`).join('|'))}`)
    .then((x) => x.json())
    .catch(() => null);
  const byName = new Map<string, { artist: string; license: string }>();
  for (const p of Object.values((meta?.query?.pages ?? {}) as Record<string, { title: string; imageinfo?: { extmetadata?: Record<string, { value: string }> }[] }>)) {
    const m = p.imageinfo?.[0]?.extmetadata ?? {};
    byName.set(p.title.replace(/^[^:]+:/, '').replace(/ /g, '_'), { artist: stripHtml(m.Artist?.value ?? ''), license: stripHtml(m.LicenseShortName?.value ?? '') });
  }
  const res = await Promise.all(
    cands.map(async (c) => {
      try {
        const photo = /\.jpe?g$/i.test(c.name);
        const img = await loadImage(c.url);
        const info = byName.get(c.name.replace(/ /g, '_'));
        const who = info?.artist && info.artist.length < 60 ? info.artist : '';
        const credit = [lang === 'ru' ? 'Изображение: Википедия' : 'Image: Wikipedia', who, info?.license].filter(Boolean).join(' · ');
        return { ...shrink(img, 1400, photo), credit, photo } as Photo;
      } catch {
        return null;
      }
    }),
  );
  return res.filter((x): x is Photo => !!x);
}

const iconCache = new Map<string, Img>();

/** a large icon as a PNG in the accent colour */
export async function iconImage(name: IconName, color: string): Promise<Img> {
  const key = `${name}:${color}`;
  const hit = iconCache.get(key);
  if (hit) return hit;
  const svg = renderToStaticMarkup(createElement(SLIDE_ICONS[name], { size: 512, color: `#${color}`, strokeWidth: 1.4 }));
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.includes('xmlns') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'))}`);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  c.getContext('2d')!.drawImage(img, 0, 0, 512, 512);
  const out = { data: c.toDataURL('image/png'), w: 512, h: 512 };
  iconCache.set(key, out);
  return out;
}
