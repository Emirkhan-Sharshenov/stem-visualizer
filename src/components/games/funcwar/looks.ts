/* "Бой функций" cosmetics: how a side looks and how the field is painted. Purely visual — nothing here changes
   a shot, a hit box or a turn, so nobody can buy an advantage. Many items are earned by playing
   (campaign stars, ranked wins); the rest come with Pro. */

export type Unlock = { kind: 'free' } | { kind: 'stars'; n: number } | { kind: 'wins'; n: number } | { kind: 'pro' };
interface Item { id: string; ru: string; en: string; unlock: Unlock }

export const COLORS: (Item & { hex: string })[] = [
  { id: 'cyan', ru: 'Неон', en: 'Neon', hex: '#39E1FF', unlock: { kind: 'free' } },
  { id: 'coral', ru: 'Коралл', en: 'Coral', hex: '#FF5A5F', unlock: { kind: 'free' } },
  { id: 'lime', ru: 'Лайм', en: 'Lime', hex: '#9BE15D', unlock: { kind: 'free' } },
  { id: 'amber', ru: 'Янтарь', en: 'Amber', hex: '#FFC24B', unlock: { kind: 'free' } },
  { id: 'violet', ru: 'Фиалка', en: 'Violet', hex: '#A78BFA', unlock: { kind: 'stars', n: 6 } },
  { id: 'pink', ru: 'Фуксия', en: 'Fuchsia', hex: '#FF6AD5', unlock: { kind: 'stars', n: 12 } },
  { id: 'mint', ru: 'Мята', en: 'Mint', hex: '#4FF0C0', unlock: { kind: 'wins', n: 3 } },
  { id: 'white', ru: 'Снег', en: 'Snow', hex: '#F4F7FF', unlock: { kind: 'wins', n: 10 } },
  { id: 'orange', ru: 'Апельсин', en: 'Orange', hex: '#FF8A3D', unlock: { kind: 'pro' } },
  { id: 'sky', ru: 'Небо', en: 'Sky', hex: '#5AA8FF', unlock: { kind: 'pro' } },
  { id: 'gold', ru: 'Золото', en: 'Gold', hex: '#E8C15A', unlock: { kind: 'pro' } },
  { id: 'ruby', ru: 'Рубин', en: 'Ruby', hex: '#E0245E', unlock: { kind: 'pro' } },
  { id: 'teal', ru: 'Бирюза', en: 'Teal', hex: '#14B8A6', unlock: { kind: 'pro' } },
  { id: 'lavender', ru: 'Лаванда', en: 'Lavender', hex: '#C4B5FD', unlock: { kind: 'pro' } },
];

export type TrailId = 'solid' | 'dashed' | 'dots' | 'neon' | 'comet' | 'sparks' | 'rainbow' | 'chalk';
export const TRAILS: (Item & { id: TrailId })[] = [
  { id: 'solid', ru: 'Линия', en: 'Line', unlock: { kind: 'free' } },
  { id: 'dashed', ru: 'Пунктир', en: 'Dashed', unlock: { kind: 'free' } },
  { id: 'dots', ru: 'Точки', en: 'Dots', unlock: { kind: 'stars', n: 9 } },
  { id: 'neon', ru: 'Двойной неон', en: 'Double neon', unlock: { kind: 'wins', n: 5 } },
  { id: 'comet', ru: 'Комета', en: 'Comet', unlock: { kind: 'pro' } },
  { id: 'sparks', ru: 'Искры', en: 'Sparks', unlock: { kind: 'pro' } },
  { id: 'rainbow', ru: 'Радуга', en: 'Rainbow', unlock: { kind: 'pro' } },
  { id: 'chalk', ru: 'Мел', en: 'Chalk', unlock: { kind: 'stars', n: 20 } },
];

export type BodyId = 'circle' | 'square' | 'diamond' | 'hex' | 'star' | 'blob';
export const BODIES: (Item & { id: BodyId })[] = [
  { id: 'circle', ru: 'Шар', en: 'Ball', unlock: { kind: 'free' } },
  { id: 'square', ru: 'Куб', en: 'Cube', unlock: { kind: 'free' } },
  { id: 'diamond', ru: 'Ромб', en: 'Diamond', unlock: { kind: 'stars', n: 3 } },
  { id: 'hex', ru: 'Соты', en: 'Hex', unlock: { kind: 'wins', n: 1 } },
  { id: 'star', ru: 'Звезда', en: 'Star', unlock: { kind: 'pro' } },
  { id: 'blob', ru: 'Капля', en: 'Blob', unlock: { kind: 'pro' } },
];

export type HatId = 'none' | 'cap' | 'crown' | 'horns' | 'halo' | 'antenna' | 'wizard' | 'headphones' | 'bow' | 'tophat' | 'grad';
export const HATS: (Item & { id: HatId })[] = [
  { id: 'none', ru: 'Без шапки', en: 'None', unlock: { kind: 'free' } },
  { id: 'cap', ru: 'Кепка', en: 'Cap', unlock: { kind: 'free' } },
  { id: 'grad', ru: 'Шапка выпускника', en: 'Grad cap', unlock: { kind: 'stars', n: 15 } },
  { id: 'antenna', ru: 'Антенна', en: 'Antenna', unlock: { kind: 'stars', n: 4 } },
  { id: 'headphones', ru: 'Наушники', en: 'Headphones', unlock: { kind: 'wins', n: 2 } },
  { id: 'horns', ru: 'Рожки', en: 'Horns', unlock: { kind: 'wins', n: 7 } },
  { id: 'crown', ru: 'Корона', en: 'Crown', unlock: { kind: 'pro' } },
  { id: 'halo', ru: 'Нимб', en: 'Halo', unlock: { kind: 'pro' } },
  { id: 'wizard', ru: 'Колпак мага', en: 'Wizard hat', unlock: { kind: 'pro' } },
  { id: 'bow', ru: 'Бантик', en: 'Bow', unlock: { kind: 'pro' } },
  { id: 'tophat', ru: 'Цилиндр', en: 'Top hat', unlock: { kind: 'pro' } },
];

export type EyesId = 'dot' | 'smile' | 'glasses' | 'angry' | 'cyclops' | 'shades';
export const EYES: (Item & { id: EyesId })[] = [
  { id: 'dot', ru: 'Глазок', en: 'Dot', unlock: { kind: 'free' } },
  { id: 'smile', ru: 'Улыбка', en: 'Smile', unlock: { kind: 'free' } },
  { id: 'angry', ru: 'Суровый', en: 'Stern', unlock: { kind: 'stars', n: 10 } },
  { id: 'cyclops', ru: 'Циклоп', en: 'Cyclops', unlock: { kind: 'wins', n: 4 } },
  { id: 'glasses', ru: 'Очки', en: 'Glasses', unlock: { kind: 'pro' } },
  { id: 'shades', ru: 'Тёмные очки', en: 'Shades', unlock: { kind: 'pro' } },
];

export type BlastId = 'ring' | 'star' | 'confetti' | 'pixels' | 'hearts' | 'shock';
export const BLASTS: (Item & { id: BlastId })[] = [
  { id: 'ring', ru: 'Кольцо', en: 'Ring', unlock: { kind: 'free' } },
  { id: 'shock', ru: 'Ударная волна', en: 'Shockwave', unlock: { kind: 'stars', n: 18 } },
  { id: 'star', ru: 'Звёздочка', en: 'Starburst', unlock: { kind: 'wins', n: 6 } },
  { id: 'confetti', ru: 'Конфетти', en: 'Confetti', unlock: { kind: 'pro' } },
  { id: 'pixels', ru: 'Пиксели', en: 'Pixels', unlock: { kind: 'pro' } },
  { id: 'hearts', ru: 'Сердечки', en: 'Hearts', unlock: { kind: 'pro' } },
];

export type ThemeId = 'lab' | 'blueprint' | 'chalk' | 'notebook' | 'space' | 'terminal' | 'sunset';
export interface Theme extends Item { id: ThemeId; bg: string; grid: string; grid5: string; axis: string; rock: [string, string]; text: string }
export const THEMES: Theme[] = [
  { id: 'lab', ru: 'Ночная лаборатория', en: 'Night lab', bg: '#0A1122', grid: '#121C33', grid5: '#1A2846', axis: '#2A3C66', rock: ['#3A4D78', '#22304F'], text: '#9AA7C7', unlock: { kind: 'free' } },
  { id: 'notebook', ru: 'Тетрадь в клетку', en: 'Squared paper', bg: '#FBFAF4', grid: '#DCE6F2', grid5: '#C3D3E8', axis: '#8FA6C4', rock: ['#C9C2B0', '#A79F8B'], text: '#5B6B82', unlock: { kind: 'free' } },
  { id: 'blueprint', ru: 'Чертёж', en: 'Blueprint', bg: '#0E3A6B', grid: '#1A4A80', grid5: '#2A5D96', axis: '#7FB2E5', rock: ['#3C6FA6', '#1F4F86'], text: '#BFD9F5', unlock: { kind: 'stars', n: 8 } },
  { id: 'chalk', ru: 'Школьная доска', en: 'Chalkboard', bg: '#1F3B2D', grid: '#29483A', grid5: '#33574A', axis: '#8DB49F', rock: ['#5C7A6B', '#3F5C4E'], text: '#D6E6DC', unlock: { kind: 'wins', n: 3 } },
  { id: 'space', ru: 'Космос', en: 'Deep space', bg: '#05040F', grid: '#0D0B22', grid5: '#17143A', axis: '#3A3478', rock: ['#5B4E8F', '#2E2659'], text: '#B8B0E8', unlock: { kind: 'pro' } },
  { id: 'terminal', ru: 'Ретро-терминал', en: 'Retro terminal', bg: '#020A02', grid: '#06200A', grid5: '#0A3312', axis: '#1E7A2E', rock: ['#1F5C2A', '#0F3A18'], text: '#5BFF7A', unlock: { kind: 'pro' } },
  { id: 'sunset', ru: 'Закат', en: 'Sunset', bg: '#2A1030', grid: '#3A1840', grid5: '#4A2250', axis: '#B0577A', rock: ['#7A3E6E', '#4E2348'], text: '#FFC9DD', unlock: { kind: 'pro' } },
];

export interface Look { color: string; trail: TrailId; body: BodyId; hat: HatId; eyes: EyesId; blast: BlastId }
export const DEFAULT_LOOKS: [Look, Look] = [
  { color: 'cyan', trail: 'solid', body: 'circle', hat: 'none', eyes: 'dot', blast: 'ring' },
  { color: 'coral', trail: 'solid', body: 'circle', hat: 'none', eyes: 'dot', blast: 'ring' },
];

export const colorHex = (id: string) => COLORS.find((c) => c.id === id)?.hex ?? '#39E1FF';
export const theme = (id: string | undefined) => THEMES.find((t) => t.id === id) ?? THEMES[0];

/* ---------------- unlocks and storage ---------------- */

export interface Progress { stars: number; wins: number; pro: boolean }
export const unlocked = (u: Unlock, p: Progress) =>
  u.kind === 'free' || (u.kind === 'stars' && p.stars >= u.n) || (u.kind === 'wins' && p.wins >= u.n) || (u.kind === 'pro' && p.pro);
export const unlockText = (u: Unlock, lang: 'ru' | 'en') =>
  u.kind === 'stars' ? (lang === 'ru' ? `★ ${u.n} в кампании` : `★ ${u.n} in the campaign`) : u.kind === 'wins' ? (lang === 'ru' ? `${u.n} побед в рейтинге` : `${u.n} ranked wins`) : u.kind === 'pro' ? 'Pro' : '';

const KEY = 'stem-funcwar-look';
export interface Saved { look: Look; theme: ThemeId }
export function loadSaved(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null') as Saved | null;
    if (s?.look) return { look: { ...DEFAULT_LOOKS[0], ...s.look }, theme: s.theme ?? 'lab' };
  } catch {
    // fall back to the defaults
  }
  return { look: DEFAULT_LOOKS[0], theme: 'lab' };
}
export function storeSaved(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // the look just won't be remembered
  }
}

/** a saved look, with anything no longer earned (say, Pro ended) swapped for the default */
export function allowedLook(look: Look, p: Progress): Look {
  const ok = <T extends { id: string; unlock: Unlock }>(list: T[], id: string, def: string) => (list.some((i) => i.id === id && unlocked(i.unlock, p)) ? id : def);
  return {
    color: ok(COLORS, look.color, DEFAULT_LOOKS[0].color),
    trail: ok(TRAILS, look.trail, 'solid') as TrailId,
    body: ok(BODIES, look.body, 'circle') as BodyId,
    hat: ok(HATS, look.hat, 'none') as HatId,
    eyes: ok(EYES, look.eyes, 'dot') as EyesId,
    blast: ok(BLASTS, look.blast, 'ring') as BlastId,
  };
}

/* ---------------- drawing ---------------- */

type G = CanvasRenderingContext2D;

export function drawTrail(g: G, pts: { x: number; y: number }[], look: Look, alpha: number, t: number) {
  if (pts.length < 2) return;
  const c = colorHex(look.color);
  const line = (width: number, stroke: string, dash: number[] = []) => {
    g.setLineDash(dash);
    g.strokeStyle = stroke;
    g.lineWidth = width;
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.stroke();
    g.setLineDash([]);
  };
  g.save();
  g.globalAlpha = alpha;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  switch (look.trail) {
    case 'dashed':
      line(2.5, c, [10, 7]);
      break;
    case 'dots':
      g.fillStyle = c;
      pts.forEach((p, i) => i % 4 === 0 && (g.beginPath(), g.arc(p.x, p.y, 2.2, 0, Math.PI * 2), g.fill()));
      break;
    case 'neon':
      g.shadowColor = c;
      g.shadowBlur = 14;
      line(6, `${c}55`);
      line(2, '#ffffff');
      break;
    case 'comet':
      for (let i = 1; i < pts.length; i++) {
        const k = i / pts.length;
        g.strokeStyle = c;
        g.globalAlpha = alpha * (0.15 + 0.85 * k);
        g.lineWidth = 1 + 5 * k;
        g.beginPath();
        g.moveTo(pts[i - 1].x, pts[i - 1].y);
        g.lineTo(pts[i].x, pts[i].y);
        g.stroke();
      }
      break;
    case 'sparks':
      line(2, c);
      pts.forEach((p, i) => {
        if (i % 6) return;
        const s = Math.sin(i * 12.9898 + t / 90) * 43758.5453;
        const j = s - Math.floor(s);
        g.fillStyle = j > 0.5 ? '#FFFFFF' : c;
        g.beginPath();
        g.arc(p.x + (j - 0.5) * 8, p.y + (0.5 - j) * 8, 1.3 + j * 1.5, 0, Math.PI * 2);
        g.fill();
      });
      break;
    case 'rainbow':
      for (let i = 1; i < pts.length; i++) {
        g.strokeStyle = `hsl(${(i * 3 + t / 10) % 360}, 90%, 62%)`;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(pts[i - 1].x, pts[i - 1].y);
        g.lineTo(pts[i].x, pts[i].y);
        g.stroke();
      }
      break;
    case 'chalk':
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = c;
        g.globalAlpha = alpha * 0.45;
        g.lineWidth = 1.6;
        g.beginPath();
        pts.forEach((p, i) => (i ? g.lineTo(p.x + Math.sin(i * 1.7 + k) * 0.9, p.y + Math.cos(i * 2.3 + k) * 0.9) : g.moveTo(p.x, p.y)));
        g.stroke();
      }
      break;
    default:
      line(2.5, c);
  }
  g.restore();
}

function shape(g: G, body: BodyId, x: number, y: number, r: number) {
  g.beginPath();
  if (body === 'square') g.roundRect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, r * 0.3);
  else if (body === 'diamond') {
    g.moveTo(x, y - r * 1.15);
    g.lineTo(x + r * 1.05, y);
    g.lineTo(x, y + r * 1.15);
    g.lineTo(x - r * 1.05, y);
    g.closePath();
  } else if (body === 'hex') {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05);
    }
    g.closePath();
  } else if (body === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.6 : r * 1.25;
      g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
  } else if (body === 'blob') {
    g.moveTo(x, y - r * 1.25);
    g.bezierCurveTo(x + r * 1.3, y - r * 0.2, x + r * 1.0, y + r, x, y + r);
    g.bezierCurveTo(x - r * 1.0, y + r, x - r * 1.3, y - r * 0.2, x, y - r * 1.25);
  } else g.arc(x, y, r, 0, Math.PI * 2);
}

function hat(g: G, id: HatId, x: number, y: number, r: number, c: string) {
  const top = y - r;
  g.save();
  g.lineWidth = 1.6;
  switch (id) {
    case 'cap':
      g.fillStyle = '#E5484D';
      g.beginPath();
      g.arc(x, top + 1, r * 0.75, Math.PI, 0);
      g.fill();
      g.fillRect(x, top - 1, r * 1.1, 2.5);
      break;
    case 'grad':
      g.fillStyle = '#16171A';
      g.beginPath();
      g.moveTo(x - r * 1.1, top - 1);
      g.lineTo(x, top - r * 0.45);
      g.lineTo(x + r * 1.1, top - 1);
      g.lineTo(x, top + r * 0.35);
      g.closePath();
      g.fill();
      g.strokeStyle = '#FFC24B';
      g.beginPath();
      g.moveTo(x + r * 0.6, top - 0.5);
      g.lineTo(x + r * 0.75, top + r * 0.6);
      g.stroke();
      break;
    case 'crown':
      g.fillStyle = '#FFC24B';
      g.beginPath();
      g.moveTo(x - r * 0.8, top + 1);
      g.lineTo(x - r * 0.8, top - r * 0.55);
      g.lineTo(x - r * 0.4, top - r * 0.2);
      g.lineTo(x, top - r * 0.75);
      g.lineTo(x + r * 0.4, top - r * 0.2);
      g.lineTo(x + r * 0.8, top - r * 0.55);
      g.lineTo(x + r * 0.8, top + 1);
      g.closePath();
      g.fill();
      break;
    case 'horns':
      g.fillStyle = '#E8E1D0';
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(x + s * r * 0.35, top + r * 0.2);
        g.quadraticCurveTo(x + s * r * 1.0, top - r * 0.2, x + s * r * 0.9, top - r * 0.8);
        g.lineTo(x + s * r * 0.65, top + r * 0.1);
        g.fill();
      }
      break;
    case 'halo':
      g.strokeStyle = '#FFE08A';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(x, top - r * 0.45, r * 0.75, r * 0.22, 0, 0, Math.PI * 2);
      g.stroke();
      break;
    case 'antenna':
      g.strokeStyle = c;
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x + r * 0.3, top - r * 0.85);
      g.stroke();
      g.fillStyle = '#FF5A7A';
      g.beginPath();
      g.arc(x + r * 0.3, top - r * 0.9, 2.4, 0, Math.PI * 2);
      g.fill();
      break;
    case 'wizard':
      g.fillStyle = '#6D4BD8';
      g.beginPath();
      g.moveTo(x - r * 0.85, top + r * 0.15);
      g.lineTo(x + r * 0.2, top - r * 1.4);
      g.lineTo(x + r * 0.85, top + r * 0.15);
      g.closePath();
      g.fill();
      g.fillStyle = '#FFE08A';
      g.beginPath();
      g.arc(x, top - r * 0.35, 1.6, 0, Math.PI * 2);
      g.fill();
      break;
    case 'headphones':
      g.strokeStyle = '#16171A';
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(x, y, r * 1.12, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
      g.fillStyle = '#16171A';
      g.fillRect(x - r * 1.25, y - r * 0.35, r * 0.4, r * 0.7);
      g.fillRect(x + r * 0.85, y - r * 0.35, r * 0.4, r * 0.7);
      break;
    case 'bow':
      g.fillStyle = '#FF6AD5';
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x - r * 0.7, top - r * 0.4);
      g.lineTo(x - r * 0.7, top + r * 0.3);
      g.closePath();
      g.moveTo(x, top);
      g.lineTo(x + r * 0.7, top - r * 0.4);
      g.lineTo(x + r * 0.7, top + r * 0.3);
      g.closePath();
      g.fill();
      break;
    case 'tophat':
      g.fillStyle = '#16171A';
      g.fillRect(x - r * 0.95, top - 1, r * 1.9, 2.5);
      g.fillRect(x - r * 0.6, top - r * 1.05, r * 1.2, r * 1.05);
      g.fillStyle = '#E5484D';
      g.fillRect(x - r * 0.6, top - r * 0.3, r * 1.2, 2);
      break;
    default:
  }
  g.restore();
}

function eyes(g: G, id: EyesId, x: number, y: number, r: number, dir: number) {
  const ex = x + dir * r * 0.35;
  const ey = y - r * 0.15;
  g.save();
  g.fillStyle = '#04101E';
  g.strokeStyle = '#04101E';
  g.lineWidth = 1.4;
  switch (id) {
    case 'smile':
      g.beginPath();
      g.arc(ex, ey - r * 0.05, r * 0.16, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(x + dir * r * 0.15, y + r * 0.15, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
      break;
    case 'angry':
      g.beginPath();
      g.arc(ex, ey, r * 0.16, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(ex - dir * r * 0.3, ey - r * 0.4);
      g.lineTo(ex + dir * r * 0.25, ey - r * 0.2);
      g.stroke();
      break;
    case 'cyclops':
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      g.arc(x, ey, r * 0.38, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#04101E';
      g.beginPath();
      g.arc(x + dir * r * 0.12, ey, r * 0.18, 0, Math.PI * 2);
      g.fill();
      break;
    case 'glasses':
      g.lineWidth = 1.6;
      for (const s of [-0.3, 0.3]) {
        g.beginPath();
        g.arc(x + dir * r * 0.15 + s * r, ey, r * 0.22, 0, Math.PI * 2);
        g.stroke();
      }
      break;
    case 'shades':
      g.beginPath();
      g.roundRect(x - r * 0.55 + dir * r * 0.15, ey - r * 0.2, r * 1.1, r * 0.36, r * 0.1);
      g.fill();
      break;
    default:
      g.beginPath();
      g.arc(ex, ey, r * 0.22, 0, Math.PI * 2);
      g.fill();
  }
  g.restore();
}

/** one soldier in its look; dir = 1 faces right */
export function drawSoldier(g: G, x: number, y: number, r: number, look: Look, dir: number, hp?: number) {
  const c = colorHex(look.color);
  g.fillStyle = c;
  shape(g, look.body, x, y, r);
  g.fill();
  eyes(g, look.eyes, x, y, r, dir);
  hat(g, look.hat, x, y, r, c);
  if (hp !== undefined)
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i < hp ? '#FF5A7A' : 'rgba(128,140,170,0.45)';
      g.beginPath();
      g.arc(x + (i - 1) * 7, y + r + 7, 2.6, 0, Math.PI * 2);
      g.fill();
    }
}

/** the burst where a shot ended; age runs 0 → 1 */
export function drawBlast(g: G, x: number, y: number, k: number, age: number, look: Look) {
  const c = colorHex(look.color);
  const a = Math.min(1, age);
  g.save();
  g.globalAlpha = 1 - a;
  switch (look.blast) {
    case 'shock':
      for (const m of [1, 0.6]) {
        g.strokeStyle = m === 1 ? c : '#FFFFFF';
        g.lineWidth = 3 * m;
        g.beginPath();
        g.arc(x, y, (0.3 + a * 2.2 * m) * k, 0, Math.PI * 2);
        g.stroke();
      }
      break;
    case 'star':
      g.strokeStyle = '#FFD65A';
      g.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const an = (i * Math.PI) / 4;
        g.beginPath();
        g.moveTo(x + Math.cos(an) * a * 0.4 * k, y + Math.sin(an) * a * 0.4 * k);
        g.lineTo(x + Math.cos(an) * (0.3 + a * 1.6) * k, y + Math.sin(an) * (0.3 + a * 1.6) * k);
        g.stroke();
      }
      break;
    case 'confetti':
    case 'pixels':
    case 'hearts':
      for (let i = 0; i < 14; i++) {
        const an = i * 2.399;
        const d = (0.3 + a * 1.8) * k * (0.6 + ((i * 37) % 10) / 25);
        const px = x + Math.cos(an) * d;
        const py = y + Math.sin(an) * d + a * a * k;
        g.fillStyle = look.blast === 'confetti' ? `hsl(${i * 47}, 90%, 62%)` : look.blast === 'hearts' ? '#FF5A7A' : i % 2 ? c : '#FFFFFF';
        if (look.blast === 'hearts') {
          g.font = `${8 + (i % 3) * 3}px sans-serif`;
          g.fillText('♥', px, py);
        } else if (look.blast === 'pixels') g.fillRect(px - 2.5, py - 2.5, 5, 5);
        else {
          g.save();
          g.translate(px, py);
          g.rotate(an + a * 6);
          g.fillRect(-3, -1.5, 6, 3);
          g.restore();
        }
      }
      break;
    default:
      g.strokeStyle = '#FFD65A';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(x, y, (0.4 + a * 1.4) * k, 0, Math.PI * 2);
      g.stroke();
  }
  g.restore();
}
