import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COL, LogoMark, SANS, SERIF, useFonts } from './ui';
import voIndex from '../public/vo3/index.json';
import slidesIndex from '../public/slides/index.json';
import proj from '../public/rec/proj/manifest.json';
import plot from '../public/rec/plot/manifest.json';
import enz from '../public/rec/enz/manifest.json';
import galv from '../public/rec/galv/manifest.json';
import game from '../public/rec/game/manifest.json';
import geo from '../public/rec/geo/manifest.json';
import shift from '../public/rec/shift/manifest.json';
import cube from '../public/rec/cube/manifest.json';
import spin from '../public/rec/spin/manifest.json';
import quiz from '../public/rec/quiz/manifest.json';
import deck from '../public/rec/deck/manifest.json';

/* Third series: motion-design videos. A designed scene for every line of the Qwen3-TTS voiceover,
   cut on the beat of the video's own soundtrack, and a different transition into every scene. */

interface Manifest {
  name: string;
  frames: number;
  w: number;
  h: number;
  dsf?: number;
  taps: { f: number; x: number; y: number; kind: string }[];
  marks: Record<string, number>;
}
interface VoLine {
  file: string;
  len: number;
  words: { w: string; s: number; e: number }[];
}
const RECS = { proj, plot, enz, galv, game, geo, shift, cube, spin, quiz, deck } as unknown as Record<string, Manifest>;
const VO = voIndex as unknown as Record<string, VoLine[]>;
const SLIDES = slidesIndex as { name: string; shots: string[] }[];

type Trans = 'cut' | 'iris' | 'wipe' | 'slide' | 'blinds' | 'zoom' | 'glitch' | 'flip' | 'split' | 'rise';
type SceneKind = 'hook' | 'logo' | 'phone' | 'duo' | 'trio' | 'laptop' | 'counter' | 'fan' | 'mosaic' | 'carousel' | 'wall' | 'cta' | 'stopwatch';

interface Scene {
  kind: SceneKind;
  trans: Trans;
  /** recording(s) and where to start in them */
  rec?: string;
  at?: string;
  speed?: number;
  recs?: { rec: string; at?: string; speed?: number }[];
  /** zoom into part of the recording: centre (0–1) and scale */
  zoom?: { x: number; y: number; s: number };
  kicker?: string;
  title?: string;
  big?: string;
  sub?: string;
  callouts?: { at: number; text: string; x: number; y: number }[];
  minDur?: number;
  /** the line is already written big on screen: no subtitles */
  noCap?: boolean;
}
interface Video {
  id: string;
  music: string;
  bpm: number;
  color: string;
  color2: string;
  caps: string[];
  scenes: Scene[];
}

const VIDEOS: Video[] = [
  {
    id: 'Trailer',
    music: 'music-trailer.wav',
    bpm: 110,
    color: COL.accent,
    color2: '#8E4EC6',
    caps: [
      'Формулу можно выучить. А можно увидеть.',
      'STEM Visualizer. Физика, химия, биология и математика в живых моделях.',
      'Запусти снаряд и посмотри, как угол меняет траекторию.',
      'Пиши любую функцию, и график строится сразу.',
      'Вся школьная математика. 128 тем, и у каждой своя модель.',
      'Презентация к уроку за одну минуту.',
      'Играй, готовься к ОРТ и следи за прогрессом.',
      'Понимать, а не заучивать. STEM Visualizer.',
    ],
    scenes: [
      { kind: 'hook', trans: 'cut', big: 'Формулу можно выучить.', sub: 'А можно увидеть.', noCap: true },
      { kind: 'logo', trans: 'iris', title: 'STEM Visualizer', sub: 'Физика · Химия · Биология · Математика' },
      { kind: 'phone', trans: 'wipe', rec: 'proj', at: 'start', speed: 1.15, kicker: 'Физика · новая лаборатория', title: 'Бросок под углом', callouts: [{ at: 45, text: '30° → 35,3 м', x: 0, y: 0 }, { at: 95, text: '60° → 35,3 м', x: 0, y: 1 }, { at: 150, text: '45° → 40,7 м 🏆', x: 0, y: 2 }] },
      { kind: 'phone', trans: 'slide', rec: 'plot', at: 'start', kicker: 'Математика · графопостроитель', title: 'y = a·sin(bx) + c', callouts: [{ at: 30, text: 'нули и экстремумы — сами', x: 0, y: 0 }, { at: 90, text: 'производная одним касанием', x: 0, y: 1 }] },
      { kind: 'trio', trans: 'zoom', recs: [{ rec: 'geo', at: 'start' }, { rec: 'cube', at: 'start' }, { rec: 'spin', at: 'start' }], big: '128', sub: 'тем по математике · 5–11 класс' },
      { kind: 'laptop', trans: 'blinds', rec: 'deck', at: 'start', speed: 1.4, kicker: 'Для учителей', title: '22 шаблона презентаций' },
      { kind: 'duo', trans: 'glitch', recs: [{ rec: 'game', at: 'start', speed: 1.2 }, { rec: 'quiz', at: 'start' }], kicker: 'Игры · тесты ОРТ · рейтинг', title: '+XP за каждую тему' },
      { kind: 'cta', trans: 'flip', title: 'Понимать, а не заучивать.', minDur: 150, noCap: true },
    ],
  },
  {
    id: 'Slides',
    music: 'music-slides.wav',
    bpm: 122,
    color: '#F5A524',
    color2: '#E5484D',
    caps: [
      'Презентация к уроку за одну минуту.',
      'Выбираешь тему, и слайды уже готовы.',
      '22 шаблона. И это не просто другие цвета.',
      'У каждого слайда свой макет.',
      'Фото, схемы, формулы и тест в конце.',
      'Скачиваешь и открываешь в PowerPoint. Ссылка в профиле.',
    ],
    scenes: [
      { kind: 'stopwatch', trans: 'cut', big: '1:00', sub: 'презентация к уроку' },
      { kind: 'laptop', trans: 'iris', rec: 'deck', at: 'start', speed: 1.5, kicker: 'Тема «Сердце» · 8 класс', title: 'Слайды уже готовы' },
      { kind: 'fan', trans: 'wipe', big: '22', sub: 'шаблона' },
      { kind: 'mosaic', trans: 'split', title: 'Свой макет у каждого слайда' },
      { kind: 'carousel', trans: 'zoom', title: 'Фото · схемы · формулы · тест' },
      { kind: 'cta', trans: 'rise', title: 'Открывается в PowerPoint', sub: '.pptx', minDur: 120, noCap: true },
    ],
  },
  {
    id: 'Labs',
    music: 'music-labs.wav',
    bpm: 128,
    color: '#30A46C',
    color2: COL.accent,
    caps: [
      'Четыре новые лаборатории.',
      'Угол 45°, и снаряд летит дальше всех.',
      'Нагрей фермент чуть сильнее, и реакция остановится.',
      'Цинк и медь. Электроны бегут по проводу.',
      'А ещё игры. Собери реакцию, пока не кончилось время.',
      'Учёба, от которой не хочется сбежать. Ссылка в профиле.',
    ],
    scenes: [
      { kind: 'wall', trans: 'cut', recs: [{ rec: 'proj', at: 't60' }, { rec: 'plot', at: 'sin' }, { rec: 'enz', at: 'opt' }, { rec: 'galv', at: 'closed' }], big: '4', sub: 'новые лаборатории', noCap: true },
      { kind: 'phone', trans: 'slide', rec: 'proj', at: 't30', speed: 1.3, kicker: 'Физика', title: 'Бросок под углом', zoom: { x: 0.5, y: 0.3, s: 1.25 }, callouts: [{ at: 20, text: '30° → 35,3 м', x: 0, y: 0 }, { at: 70, text: '60° → 35,3 м', x: 1, y: 1 }, { at: 120, text: '45° → 40,7 м', x: 0, y: 2 }] },
      { kind: 'phone', trans: 'iris', rec: 'enz', at: 'start', speed: 1.25, kicker: 'Биология', title: 'Ферменты', zoom: { x: 0.5, y: 0.33, s: 1.3 }, callouts: [{ at: 50, text: '37 °C — максимум', x: 1, y: 0 }, { at: 135, text: '75 °C — денатурация', x: 0, y: 1 }] },
      { kind: 'phone', trans: 'blinds', rec: 'galv', at: 'start', kicker: 'Химия', title: 'Гальванический элемент', zoom: { x: 0.5, y: 0.3, s: 1.2 }, callouts: [{ at: 25, text: 'Zn → Cu: 1,10 В', x: 0, y: 0 }, { at: 115, text: 'Mg → Cu: 2,71 В', x: 1, y: 1 }] },
      { kind: 'phone', trans: 'glitch', rec: 'game', at: 'start', speed: 1.1, kicker: 'Игры', title: 'Уравняй реакцию', zoom: { x: 0.5, y: 0.25, s: 1.35 }, callouts: [{ at: 40, text: '+10 XP', x: 1, y: 0 }, { at: 100, text: '+10 XP', x: 0, y: 1 }] },
      { kind: 'cta', trans: 'flip', title: 'Учёба, от которой не хочется сбежать', minDur: 110, noCap: true },
    ],
  },
  {
    id: 'Math',
    music: 'music-math.wav',
    bpm: 118,
    color: '#8E4EC6',
    color2: COL.accent,
    caps: [
      'Вся математика с 5 по 11 класс.',
      'Тяни вершину, и треугольник перестраивается вместе с окружностью.',
      'Графики двигаются прямо у тебя на глазах.',
      'Сечения куба и тела вращения в 3D.',
      'И задачи на каждую тему, как на ОРТ.',
      'Геометрию надо видеть. Ссылка в профиле.',
    ],
    scenes: [
      { kind: 'counter', trans: 'cut', big: '128', sub: 'тем · 5–11 класс' },
      { kind: 'phone', trans: 'zoom', rec: 'geo', at: 'start', kicker: 'Геометрия · 8 класс', title: 'Вписанная и описанная окружности', zoom: { x: 0.5, y: 0.28, s: 1.3 } },
      { kind: 'phone', trans: 'wipe', rec: 'shift', at: 'start', kicker: 'Алгебра · 9 класс', title: 'y = k·f(x − m) + n', zoom: { x: 0.5, y: 0.35, s: 1.15 } },
      { kind: 'duo', trans: 'split', recs: [{ rec: 'cube', at: 'start', speed: 1.2 }, { rec: 'spin', at: 'start', speed: 1.1 }], kicker: 'Стереометрия · 10–11 класс', title: 'Крути в 3D' },
      { kind: 'phone', trans: 'slide', rec: 'quiz', at: 'start', speed: 0.9, kicker: 'Практикум', title: 'Задачи как на ОРТ', zoom: { x: 0.5, y: 0.45, s: 1.15 } },
      { kind: 'cta', trans: 'iris', title: 'Геометрию надо видеть', minDur: 110, noCap: true },
    ],
  },
];

/* ---------- timing ---------- */

const VOICE_IN = 6;
const OVER = 14; // frames the next scene overlaps the previous one while it transitions in

export function timeline(v: Video) {
  const beat = 1800 / v.bpm;
  const vo = VO[v.id] ?? [];
  let t = 0;
  const scenes = v.scenes.map((sc, i) => {
    const len = vo[i]?.len ?? 60;
    const want = Math.max(sc.minDur ?? 0, len + VOICE_IN + 16);
    const dur = Math.round(Math.ceil(want / beat) * beat);
    const from = t;
    t += dur;
    return { sc, i, from, dur, vo: vo[i], cap: v.caps[i] };
  });
  return { scenes, total: t + 20, beat };
}
export const MOTION_IDS = VIDEOS.map((v) => v.id);
export const motionLength = (id: string) => timeline(VIDEOS.find((v) => v.id === id)!).total;

/* ---------- helpers ---------- */

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const prog = (f: number, a: number, b: number) => easeOut(interpolate(f, [a, b], [0, 1], clamp));
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
function useSpring(delay = 0, damping = 15, stiffness = 150) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, stiffness, mass: 0.7 } });
}
function useWide() {
  const { width, height } = useVideoConfig();
  return { wide: width > height, W: width, H: height };
}

/* ---------- backdrop: deep gradient, drifting glow blobs, dotted grid, film grain ---------- */

const Backdrop: React.FC<{ c1: string; c2: string; light?: boolean }> = ({ c1, c2, light }) => {
  const f = useCurrentFrame();
  const x1 = 25 + Math.sin(f / 60) * 15;
  const y1 = 20 + Math.cos(f / 75) * 10;
  const x2 = 75 + Math.cos(f / 70) * 14;
  const y2 = 80 + Math.sin(f / 55) * 9;
  const base = light ? '#F4F1EA' : '#07080B';
  return (
    <AbsoluteFill style={{ background: base, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x1}% ${y1}%, ${c1}${light ? '30' : '55'} 0%, transparent 42%), radial-gradient(circle at ${x2}% ${y2}%, ${c2}${light ? '28' : '48'} 0%, transparent 45%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${light ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.07)'} 1.5px, transparent 1.6px)`,
          backgroundSize: '44px 44px',
          transform: `translate(${(f * 0.35) % 44}px, ${(f * 0.5) % 44}px)`,
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)', opacity: light ? 0.25 : 1 }} />
    </AbsoluteFill>
  );
};

/* ---------- recordings ---------- */

const RecView: React.FC<{ rec: string; at?: string; speed?: number; w: number; color: string; zoom?: Scene['zoom']; offset?: number }> = ({ rec: id, at = 'start', speed = 1, w, color, zoom, offset = 0 }) => {
  const f = useCurrentFrame();
  const rec = RECS[id];
  const dsf = rec.dsf ?? 2.5;
  const h = (w * rec.h) / rec.w;
  const start = (rec.marks[at] ?? 0) + offset;
  const rf = Math.max(0, Math.min(rec.frames - 1, Math.round(start + f * speed)));
  const k = w / rec.w;
  // a slow push-in towards the interesting part
  const z = zoom ? 1 + (zoom.s - 1) * (0.75 + 0.25 * prog(f, 0, 120)) : 1 + 0.03 * prog(f, 0, 150);
  const ox = zoom ? zoom.x * 100 : 50;
  const oy = zoom ? zoom.y * 100 : 40;
  const near = rec.taps.filter((t) => (t.kind === 'move' || t.kind === 'down') && Math.abs(t.f - rf) <= 1);
  const drag = near[near.length - 1];
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }}>
        <Img src={staticFile(`rec/${rec.name}/${String(rf).padStart(5, '0')}.jpg`)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {rec.taps
          .filter((t) => t.kind === 'tap' && rf >= t.f - 3 && rf < t.f + 18)
          .map((t, i) => {
            const d = rf - t.f;
            const r = interpolate(d, [0, 18], [0, 1], clamp);
            const dot = interpolate(d, [-3, 0, 8, 18], [0, 1, 1, 0], clamp);
            return (
              <div key={i}>
                <div style={{ position: 'absolute', left: t.x * k - 60, top: t.y * k - 60, width: 120, height: 120, borderRadius: 99, border: `6px solid ${color}`, transform: `scale(${0.3 + r})`, opacity: (1 - r) * 0.9 }} />
                <div style={{ position: 'absolute', left: t.x * k - 24, top: t.y * k - 24, width: 48, height: 48, borderRadius: 99, background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 18px rgba(0,0,0,0.35)', opacity: dot }} />
              </div>
            );
          })}
        {drag && <div style={{ position: 'absolute', left: drag.x * k - 24, top: drag.y * k - 24, width: 48, height: 48, borderRadius: 99, background: 'rgba(255,255,255,0.92)', boxShadow: `0 0 0 10px ${color}66, 0 6px 20px rgba(0,0,0,0.3)` }} />}
      </div>
      {dsf < 2 && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />}
    </div>
  );
};

/** phone body around a recording */
const Phone: React.FC<{ w: number; color: string; children: React.ReactNode; tiltY?: number; tiltX?: number; style?: React.CSSProperties }> = ({ w, color, children, tiltY = 0, tiltX = 0, style }) => (
  <div style={{ perspective: 2600, ...style }}>
    <div
      style={{
        borderRadius: w * 0.085,
        padding: w * 0.022,
        background: 'linear-gradient(145deg, #2A2D35, #0E0F13)',
        boxShadow: `0 ${w * 0.08}px ${w * 0.22}px rgba(0,0,0,0.6), 0 0 ${w * 0.25}px ${color}55, inset 0 0 0 2px rgba(255,255,255,0.08)`,
        transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
      }}
    >
      <div style={{ borderRadius: w * 0.068, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  </div>
);

/** laptop: screen with a thin bezel and a base */
const Laptop: React.FC<{ w: number; color: string; children: React.ReactNode; tilt?: number }> = ({ w, color, children, tilt = 0 }) => (
  <div style={{ perspective: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ transform: `rotateX(${tilt}deg)`, transformOrigin: '50% 100%' }}>
      <div style={{ padding: w * 0.018, paddingBottom: w * 0.025, borderRadius: w * 0.025, background: 'linear-gradient(160deg, #2B2E36, #121318)', boxShadow: `0 ${w * 0.05}px ${w * 0.12}px rgba(0,0,0,0.6), 0 0 ${w * 0.15}px ${color}44` }}>
        <div style={{ borderRadius: w * 0.008, overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
    <div style={{ width: w * 1.16, height: w * 0.028, background: 'linear-gradient(180deg, #3A3D46, #17181D)', borderRadius: `0 0 ${w * 0.04}px ${w * 0.04}px`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
  </div>
);

/* ---------- text pieces ---------- */

const Words: React.FC<{ text: string; size: number; delay?: number; color?: string; serif?: boolean; weight?: number; align?: 'center' | 'left'; accent?: string; stagger?: number; italicLast?: boolean }> = ({
  text,
  size,
  delay = 0,
  color = COL.ink,
  serif = false,
  weight = 800,
  align = 'center',
  accent,
  stagger = 3,
  italicLast,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.24}px`, fontFamily: serif ? SERIF : SANS, fontSize: size, lineHeight: 1.05, fontWeight: serif ? 500 : weight, letterSpacing: serif ? '-0.02em' : '-0.035em', color }}>
      {words.map((w, i) => {
        const s = spring({ frame: f - delay - i * stagger, fps, config: { damping: 15, stiffness: 170, mass: 0.6 } });
        const last = italicLast && i === words.length - 1;
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.1, marginBottom: -size * 0.06 }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 105}%)`, opacity: Math.min(1, s * 1.4), color: last && accent ? accent : undefined, fontStyle: last ? 'italic' : 'normal', fontFamily: last ? SERIF : undefined, fontWeight: last ? 500 : undefined }}>
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const Kicker: React.FC<{ text: string; color: string; delay?: number; size?: number }> = ({ text, color, delay = 4, size = 30 }) => {
  const s = useSpring(delay, 14, 180);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.36}px ${size * 0.75}px`, borderRadius: 999, background: 'rgba(16,18,24,0.78)', border: `2px solid ${color}66`, color: COL.ink, fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '0.01em', transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 20}px)`, opacity: s, backdropFilter: 'blur(10px)' }}>
      <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: 99, background: color, boxShadow: `0 0 ${size}px ${color}` }} />
      {text}
    </div>
  );
};

const Callout: React.FC<{ text: string; color: string; delay: number; side: number; size: number }> = ({ text, color, delay, side, size }) => {
  const s = useSpring(delay, 11, 220);
  const f = useCurrentFrame();
  if (f < delay) return null;
  return (
    <div style={{ display: 'inline-block', padding: `${size * 0.4}px ${size * 0.8}px`, borderRadius: size * 0.6, background: side ? '#fff' : color, color: side ? '#0B0C10' : '#fff', fontFamily: SANS, fontWeight: 800, fontSize: size, boxShadow: `0 18px 50px rgba(0,0,0,0.45), 0 0 0 4px ${color}44`, transform: `scale(${s}) rotate(${(side ? 3 : -3) * s}deg)`, transformOrigin: side ? '0% 50%' : '100% 50%', whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
};

/* ---------- captions: the line split into short groups, the spoken word lit ---------- */

function timedCaption(cap: string, vo?: VoLine) {
  const tokens = cap.split(/\s+/).filter(Boolean);
  if (!vo || !vo.words.length) return tokens.map((t, i) => ({ text: t, s: i * 8, e: i * 8 + 8 }));
  const ws = vo.words;
  if (ws.length === tokens.length) return tokens.map((t, i) => ({ text: t, s: ws[i].s, e: ws[i].e }));
  // different word counts (numbers, names): spread the caption over the spoken span by length
  const a = ws[0].s;
  const b = ws[ws.length - 1].e;
  const total = tokens.reduce((n, t) => n + t.length + 1, 0);
  let acc = 0;
  return tokens.map((t) => {
    const s = a + ((b - a) * acc) / total;
    acc += t.length + 1;
    return { text: t, s, e: a + ((b - a) * acc) / total };
  });
}

const Captions: React.FC<{ cap: string; vo?: VoLine; color: string }> = ({ cap, vo, color }) => {
  const f = useCurrentFrame() - VOICE_IN;
  const { fps } = useVideoConfig();
  const { wide } = useWide();
  const timed = timedCaption(cap, vo);
  const groups: (typeof timed)[] = [];
  let cur: typeof timed = [];
  for (const t of timed) {
    cur.push(t);
    const len = cur.reduce((n, x) => n + x.text.length, 0);
    if (cur.length >= (wide ? 5 : 3) || len > (wide ? 30 : 17) || /[.,!?:]$/.test(t.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  const idx = groups.findIndex((g, i) => f >= g[0].s - 3 && (i === groups.length - 1 || f < groups[i + 1][0].s - 3));
  if (idx < 0) return null;
  const g = groups[idx];
  const last = g[g.length - 1];
  if (idx === groups.length - 1 && f > last.e + 22) return null;
  const pop = spring({ frame: f - (g[0].s - 3), fps, config: { damping: 12, stiffness: 240, mass: 0.5 } });
  const size = wide ? 54 : 76;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: wide ? 64 : 360, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.26}px`, maxWidth: wide ? 1500 : 940, transform: `scale(${0.85 + 0.15 * pop})`, opacity: pop }}>
        {g.map((w, i) => {
          const on = f >= w.s - 1;
          return (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.15, letterSpacing: '-0.02em', color: on ? '#fff' : 'rgba(255,255,255,0.45)', textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.6)', WebkitTextStroke: `${wide ? 2 : 3}px rgba(0,0,0,0.65)`, paintOrder: 'stroke fill', position: 'relative' }}>
              {on && f < w.e + 4 && <span style={{ position: 'absolute', left: -10, right: -10, top: '12%', bottom: '8%', background: color, borderRadius: 14, zIndex: -1, opacity: 0.9 }} />}
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- transitions ---------- */

const TransIn: React.FC<{ type: Trans; color: string; children: React.ReactNode }> = ({ type, color, children }) => {
  const f = useCurrentFrame();
  const { W, H } = useWide();
  const k = prog(f, 0, OVER);
  const lin = interpolate(f, [0, OVER], [0, 1], clamp);
  let style: React.CSSProperties = {};
  let extra: React.ReactNode = null;
  switch (type) {
    case 'iris':
      style = { clipPath: `circle(${k * 75}% at 50% 50%)` };
      extra = <div style={{ position: 'absolute', left: '50%', top: '50%', width: k * Math.hypot(W, H) * 1.5, height: k * Math.hypot(W, H) * 1.5, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `${14 * (1 - lin) + 2}px solid ${color}`, opacity: 1 - lin }} />;
      break;
    case 'wipe': {
      const x = k * 140 - 20;
      style = { clipPath: `polygon(0 0, ${x + 20}% 0, ${x}% 100%, 0 100%)` };
      extra = <div style={{ position: 'absolute', inset: 0, background: color, clipPath: `polygon(${x + 20}% 0, ${x + 26}% 0, ${x + 6}% 100%, ${x}% 100%)`, opacity: lin < 1 ? 1 : 0 }} />;
      break;
    }
    case 'slide':
      style = { transform: `translateX(${(1 - k) * 100}%) skewX(${(1 - k) * -10}deg)`, filter: `blur(${(1 - k) * 12}px)` };
      break;
    case 'blinds': {
      const n = 7;
      const step = W / n;
      style = { WebkitMaskImage: `repeating-linear-gradient(90deg, #000 0, #000 ${k * step}px, transparent ${k * step}px, transparent ${step}px)`, maskImage: `repeating-linear-gradient(90deg, #000 0, #000 ${k * step}px, transparent ${k * step}px, transparent ${step}px)` };
      if (lin >= 1) style = {};
      break;
    }
    case 'zoom':
      style = { transform: `scale(${0.55 + 0.45 * k})`, opacity: Math.min(1, lin * 1.8), filter: `blur(${(1 - k) * 18}px)`, borderRadius: (1 - k) * 80, overflow: 'hidden' };
      break;
    case 'glitch': {
      const g = f < 9;
      const j = g ? (rnd(f * 7) - 0.5) * 80 : 0;
      style = { transform: `translateX(${j}px)`, opacity: f < 3 ? (f % 2 ? 1 : 0.3) : 1, filter: g ? `drop-shadow(${-12 + f}px 0 0 rgba(255,0,80,0.8)) drop-shadow(${12 - f}px 0 0 rgba(0,220,255,0.8)) hue-rotate(${f * 25}deg)` : undefined };
      if (g)
        extra = (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: rnd(f * 3 + i) * H, height: 8 + rnd(f + i * 5) * 40, background: i % 2 ? color : '#fff', opacity: 0.55, mixBlendMode: 'screen', transform: `translateX(${(rnd(i + f) - 0.5) * 200}px)` }} />
            ))}
          </>
        );
      break;
    }
    case 'flip':
      style = { transform: `perspective(2400px) rotateY(${(1 - k) * 85}deg)`, transformOrigin: '0% 50%', opacity: Math.min(1, lin * 3) };
      break;
    case 'split':
      style = { clipPath: `inset(${(1 - k) * 50}% 0 ${(1 - k) * 50}% 0)` };
      extra = (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${(1 - k) * 50}%`, height: 6, background: color, opacity: 1 - lin, transform: 'translateY(-3px)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(1 - k) * 50}%`, height: 6, background: color, opacity: 1 - lin, transform: 'translateY(3px)' }} />
        </>
      );
      break;
    case 'rise':
      style = { transform: `translateY(${(1 - k) * 100}%)`, borderRadius: `${(1 - k) * 120}px ${(1 - k) * 120}px 0 0`, overflow: 'hidden' };
      break;
    default:
      break;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {extra}
    </AbsoluteFill>
  );
};

/** the outgoing scene drifts and dims while the next one comes in */
const TransOut: React.FC<{ dur: number; next?: Trans; children: React.ReactNode }> = ({ dur, next, children }) => {
  const f = useCurrentFrame();
  const k = prog(f, dur, dur + OVER);
  let style: React.CSSProperties = {};
  if (next === 'zoom') style = { transform: `scale(${1 + 0.5 * k})`, filter: `blur(${k * 14}px)`, opacity: 1 - k };
  else if (next === 'slide') style = { transform: `translateX(${-k * 40}%)`, filter: `blur(${k * 8}px)` };
  else if (next === 'rise') style = { transform: `translateY(${-k * 18}%) scale(${1 - 0.1 * k})`, filter: `brightness(${1 - 0.6 * k})` };
  else if (next === 'flip') style = { transform: `perspective(2400px) rotateY(${-k * 60}deg)`, transformOrigin: '100% 50%', opacity: 1 - k * 0.8 };
  else if (next && next !== 'cut') style = { transform: `scale(${1 + 0.06 * k})`, filter: `brightness(${1 - 0.5 * k})` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

/* ---------- scenes ---------- */

interface SceneProps {
  sc: Scene;
  dur: number;
  c1: string;
  c2: string;
}

/** hook: formulas float in, then the line lands */
const HookScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide, W, H } = useWide();
  const glyphs = ['E = mc²', 'F = ma', 'a² + b² = c²', 'v = s / t', 'pH = −lg[H⁺]', 'sin²α + cos²α = 1', 'U = IR', 'C₆H₁₂O₆', 'S = πr²', 'p = mv', 'Q = cmΔt', 'y = kx + b'];
  const burst = prog(f, 38, 60);
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      {glyphs.map((g, i) => {
        const a = (i / glyphs.length) * Math.PI * 2 + f / 140;
        const r = (wide ? 520 : 430) + rnd(i) * 160;
        const x = W / 2 + Math.cos(a) * r * (1 + burst * 0.9);
        const y = H / 2 + Math.sin(a) * r * (wide ? 0.55 : 1.15) * (1 + burst * 0.9);
        const op = prog(f, i * 2, i * 2 + 12) * (0.75 - 0.5 * burst);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${(rnd(i + 3) - 0.5) * 20}deg)`, fontFamily: SERIF, fontStyle: 'italic', fontSize: 38 + rnd(i + 9) * 26, color: i % 3 ? COL.dim : c1, opacity: op, whiteSpace: 'nowrap', filter: `blur(${burst * 4}px)` }}>
            {g}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: wide ? 160 : 70, flexDirection: 'column', gap: 30 }}>
        <Words text={sc.big!} size={wide ? 128 : 112} delay={4} />
        <Words text={sc.sub!} size={wide ? 128 : 112} delay={36} serif accent={c1} italicLast color={COL.ink} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** logo builds itself, the subjects orbit it */
const LogoScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const s = useSpring(0, 12, 120);
  const subjects = [
    ['Физика', COL.physics],
    ['Химия', COL.chemistry],
    ['Биология', COL.biology],
    ['Математика', '#8E4EC6'],
  ];
  const R = wide ? 400 : 360;
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', width: R * 2 * (0.6 + i * 0.25), height: R * 2 * (0.6 + i * 0.25) * (wide ? 0.62 : 1), borderRadius: '50%', border: `2px solid rgba(255,255,255,${0.1 - i * 0.025})`, transform: `scale(${prog(f, i * 4, 30 + i * 4)}) rotate(${f * (i % 2 ? 0.2 : -0.2)}deg)` }} />
        ))}
        {subjects.map(([name, col], i) => {
          const a = (i / 4) * Math.PI * 2 + f / 70;
          const p = prog(f, 12 + i * 5, 32 + i * 5);
          return (
            <div key={name} style={{ position: 'absolute', transform: `translate(${Math.cos(a) * R * p}px, ${Math.sin(a) * R * (wide ? 0.55 : 0.9) * p}px) scale(${p})` }}>
              <Kicker text={name} color={col} delay={12 + i * 5} size={wide ? 30 : 34} />
            </div>
          );
        })}
        <div style={{ transform: `scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * -30}deg)`, filter: `drop-shadow(0 0 60px ${c1}aa)` }}>
          <LogoMark size={wide ? 190 : 220} draw={prog(f, 0, 30)} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: wide ? 210 : 600 }}>
        <Words text={sc.title!} size={wide ? 104 : 110} delay={10} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** one phone with the recording; title and live callouts beside or above it */
const PhoneScene: React.FC<SceneProps & { side?: number }> = ({ sc, c1, c2, dur }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const s = useSpring(0, 16, 120);
  const pw = wide ? 420 : 620;
  const tilt = (1 - s) * 18 + Math.sin(f / 45) * 2;
  const float = Math.sin(f / 30) * 8;
  const phone = (
    <Phone w={pw} color={c1} tiltY={wide ? -12 + tilt : tilt * 0.6} tiltX={wide ? 4 : 3}>
      <RecView rec={sc.rec!} at={sc.at} speed={sc.speed} w={pw - pw * 0.044} color={c1} zoom={sc.zoom} />
    </Phone>
  );
  const callouts = (sc.callouts ?? []).map((c, i) => (
    <div key={i} style={{ marginTop: 18, alignSelf: wide ? 'flex-start' : c.x ? 'flex-end' : 'flex-start' }}>
      <Callout text={c.text} color={c1} delay={c.at} side={c.x} size={wide ? 40 : 38} />
    </div>
  ));
  const out = prog(f, dur - 6, dur + OVER);
  if (wide)
    return (
      <AbsoluteFill>
        <Backdrop c1={c1} c2={c2} />
        <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120, paddingBottom: 60 }}>
          <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 26, transform: `translateX(${-out * 60}px)` }}>
            {sc.kicker && <div><Kicker text={sc.kicker} color={c1} /></div>}
            <Words text={sc.title!} size={92} delay={6} align="left" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>{callouts}</div>
          </div>
          <div style={{ transform: `translateY(${(1 - s) * 400 + float}px)` }}>{phone}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 130 }}>
        {sc.kicker && <Kicker text={sc.kicker} color={c1} />}
        <div style={{ marginTop: 22, padding: '0 60px' }}>
          <Words text={sc.title!} size={sc.title!.length > 24 ? 62 : 80} delay={6} />
        </div>
        <div style={{ marginTop: 34, transform: `translateY(${(1 - s) * 700 + float}px)` }}>{phone}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: '0 40px', justifyContent: 'center', paddingTop: 140 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 120 }}>{callouts}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** two phones, staggered, opposite tilts */
const DuoScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const pw = wide ? 340 : 440;
  const recs = sc.recs!;
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: wide ? 60 : 150 }}>
        {sc.kicker && <Kicker text={sc.kicker} color={c1} />}
        <div style={{ marginTop: 18 }}>
          <Words text={sc.title!} size={wide ? 76 : 84} delay={6} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wide ? 90 : 0, paddingTop: wide ? 160 : 120 }}>
        {recs.map((r, i) => {
          const s = spring({ frame: f - i * 6, fps: 30, config: { damping: 15, stiffness: 120, mass: 0.8 } });
          const dir = i ? 1 : -1;
          return (
            <div key={i} style={{ transform: `translate(${(1 - s) * dir * 700 + (wide ? 0 : dir * -20)}px, ${(wide ? 0 : i ? 140 : -40) + Math.sin(f / 28 + i) * 10}px) rotate(${dir * (wide ? 4 : 5)}deg)`, zIndex: i }}>
              <Phone w={pw} color={i ? c2 : c1} tiltY={dir * -10}>
                <RecView rec={r.rec} at={r.at} speed={r.speed} w={pw * 0.956} color={c1} />
              </Phone>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** three phones in a fan with a big counter */
const TrioScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const pw = wide ? 330 : 420;
  const n = Math.round(interpolate(f, [4, 40], [0, Number(sc.big)], { ...clamp, easing: easeOut }));
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: wide ? 'flex-start' : 'center', justifyContent: wide ? 'center' : 'flex-start', paddingLeft: wide ? 140 : 0, paddingTop: wide ? 0 : 140 }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: wide ? 300 : 260, lineHeight: 0.9, letterSpacing: '-0.06em', color: '#fff', textShadow: `0 0 80px ${c1}` }}>{n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: wide ? 46 : 46, color: COL.dim, marginTop: 12, opacity: prog(f, 20, 34) }}>{sc.sub}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: wide ? 'flex-end' : 'center', paddingRight: wide ? 120 : 0, paddingTop: wide ? 0 : 420 }}>
        {sc.recs!.map((r, i) => {
          const s = spring({ frame: f - 6 - i * 5, fps: 30, config: { damping: 14, stiffness: 120, mass: 0.8 } });
          const rot = (i - 1) * 12 * s;
          return (
            <div key={i} style={{ margin: wide ? '0 -40px' : '0 -70px', transform: `translateY(${(1 - s) * 900 + Math.abs(i - 1) * 60}px) rotate(${rot}deg)`, zIndex: i === 1 ? 2 : 1, transformOrigin: '50% 120%' }}>
              <Phone w={pw} color={c1}>
                <RecView rec={r.rec} at={r.at} speed={r.speed} w={pw * 0.956} color={c1} zoom={{ x: 0.5, y: 0.3, s: 1.25 }} />
              </Phone>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** laptop with the presentation dialog; template slides fly past behind it */
const LaptopScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const s = useSpring(0, 16, 110);
  const lw = wide ? 960 : 1000;
  const rec = RECS[sc.rec!];
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      {SLIDES.slice(0, 12).map((t, i) => {
        const lane = i % 4;
        const x = ((f * (2 + lane * 0.6) + i * 410) % 2600) - 400;
        return <Img key={i} src={staticFile(`slides/${t.shots[0]}`)} style={{ position: 'absolute', left: wide ? x : -x + 1600, top: (wide ? 40 : 120) + lane * (wide ? 260 : 460), width: wide ? 340 : 380, borderRadius: 10, opacity: 0.22, transform: `rotate(${(rnd(i) - 0.5) * 10}deg)` }} />;
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: wide ? 34 : 50, paddingBottom: wide ? 90 : 160 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          {sc.kicker && <Kicker text={sc.kicker} color={c1} />}
          <Words text={sc.title!} size={wide ? 70 : 84} delay={6} />
        </div>
        <div style={{ transform: `translateY(${(1 - s) * 500}px) scale(${0.85 + 0.15 * s})` }}>
          <Laptop w={lw} color={c1} tilt={(1 - s) * 30}>
            <div style={{ width: lw, height: (lw * rec.h) / rec.w }}>
              <RecView rec={sc.rec!} at={sc.at} speed={sc.speed} w={lw} color={c1} zoom={wide ? undefined : { x: 0.55, y: 0.45, s: 1.12 }} />
            </div>
          </Laptop>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** stopwatch: a ring sweeps a full minute in a second and a half */
const StopwatchScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const sweep = interpolate(f, [6, 52], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  const secs = Math.round(sweep * 60);
  const R = 330;
  const C = 2 * Math.PI * R;
  const s = useSpring(0, 12, 140);
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 260 }}>
        <svg width={800} height={800} style={{ transform: `scale(${s}) rotate(-90deg)` }}>
          <circle cx={400} cy={400} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={34} />
          <circle cx={400} cy={400} r={R} fill="none" stroke={c1} strokeWidth={34} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - sweep)} style={{ filter: `drop-shadow(0 0 24px ${c1})` }} />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r1 = R + 50;
            const r2 = R + (i % 5 ? 62 : 80);
            return <line key={i} x1={400 + Math.cos(a) * r1} y1={400 + Math.sin(a) * r1} x2={400 + Math.cos(a) * r2} y2={400 + Math.sin(a) * r2} stroke={i / 60 <= sweep ? c1 : 'rgba(255,255,255,0.2)'} strokeWidth={i % 5 ? 3 : 6} />;
          })}
        </svg>
        <div style={{ position: 'absolute', fontFamily: SANS, fontWeight: 900, fontSize: 210, letterSpacing: '-0.05em', color: '#fff', paddingBottom: 260 }}>
          {secs === 60 ? '1:00' : `0:${String(secs).padStart(2, '0')}`}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 560 }}>
        <Words text={sc.sub!} size={84} delay={30} serif italicLast accent={c1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a deck of template title slides fans out while the counter runs to 22 */
const FanScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const n = SLIDES.length;
  const shown = Math.min(n, Math.floor(interpolate(f, [4, 52], [1, n + 0.99], clamp)));
  const w = wide ? 620 : 640;
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: wide ? 50 : 170 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 260, lineHeight: 1, letterSpacing: '-0.06em', color: '#fff', textShadow: `0 0 60px ${c1}` }}>{shown}</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, color: c1 }}>{sc.sub}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: wide ? 260 : 520 }}>
        {SLIDES.slice(0, shown).map((t, i) => {
          const local = f - (4 + (i * 48) / n);
          const s = spring({ frame: local, fps: 30, config: { damping: 14, stiffness: 160, mass: 0.6 } });
          const settle = prog(f, 64, 100);
          // first a stack that flips through, then the fan opens
          const ang = (i - (n - 1) / 2) * (wide ? 6.5 : 5.5) * settle;
          const top = i === shown - 1 && settle < 0.1;
          return (
            <Img
              key={i}
              src={staticFile(`slides/${t.shots[0]}`)}
              style={{
                position: 'absolute',
                width: w,
                borderRadius: 14,
                boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
                transformOrigin: '50% 260%',
                transform: `translateY(${(1 - s) * 900}px) rotate(${ang + (1 - s) * 30}deg) scale(${top ? 1.04 : 1})`,
                border: top ? `4px solid ${c1}` : '4px solid transparent',
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: wide ? 330 : 470 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '8px 22px', borderRadius: 14, opacity: f < 60 ? 1 : 0 }}>{SLIDES[Math.max(0, shown - 1)].name}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** the same topic in four layouts, assembling into a grid like tiles */
const MosaicScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const picks = [1, 4, 7, 9, 12, 15, 18, 21].map((k) => SLIDES[k % SLIDES.length].shots[1] ?? SLIDES[k % SLIDES.length].shots[0]);
  const cols = 2;
  const w = wide ? 520 : 470;
  const h = (w * 9) / 16;
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} light />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: wide ? 40 : 150 }}>
        <Words text={sc.title!} size={wide ? 72 : 80} delay={4} color="#121318" />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: wide ? 120 : 260 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${wide ? 4 : cols}, ${w}px)`, gap: 22 }}>
          {picks.slice(0, wide ? 8 : 8).map((src, i) => {
            const d = 6 + i * 4;
            const s = spring({ frame: f - d, fps: 30, config: { damping: 13, stiffness: 150, mass: 0.6 } });
            const flip = interpolate(s, [0, 1], [90, 0]);
            return (
              <div key={i} style={{ width: w, height: h, perspective: 1200 }}>
                <Img src={staticFile(`slides/${src}`)} style={{ width: w, height: h, borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', transform: `rotateX(${i % 2 ? flip : -flip}deg) rotateY(${i % 3 ? flip * 0.4 : 0}deg)`, opacity: Math.min(1, s * 2) }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a 3D carousel of slide types: photo, model, key points, quiz */
const CarouselScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const items = [SLIDES[0].shots[0], SLIDES[4].shots[2], SLIDES[9].shots[3], SLIDES[2].shots[1], SLIDES[14].shots[0], SLIDES[6].shots[3], SLIDES[17].shots[2], SLIDES[11].shots[1]].filter(Boolean);
  const n = items.length;
  const w = wide ? 620 : 700;
  const R = w * 1.25;
  const rot = interpolate(f, [0, 30, 200], [-60, 0, 120], { extrapolateRight: 'extend' });
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: wide ? 60 : 200 }}>
        <Words text={sc.title!} size={wide ? 70 : 70} delay={4} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 2600, paddingTop: wide ? 120 : 120 }}>
        <div style={{ position: 'relative', width: w, height: (w * 9) / 16, transformStyle: 'preserve-3d', transform: `translateZ(${-R}px) rotateX(-6deg) rotateY(${-rot}deg)` }}>
          {items.map((src, i) => (
            <Img key={i} src={staticFile(`slides/${src}`)} style={{ position: 'absolute', inset: 0, width: w, borderRadius: 14, transform: `rotateY(${(i * 360) / n}deg) translateZ(${R}px)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', backfaceVisibility: 'hidden' }} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a 2×2 wall of recordings, tiles flip in one by one around a big number */
const WallScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const tw = wide ? 300 : 440;
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 220 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${wide ? 4 : 2}, ${tw}px)`, gap: 30, perspective: 2000 }}>
          {sc.recs!.map((r, i) => {
            const s = spring({ frame: f - 4 - i * 6, fps: 30, config: { damping: 14, stiffness: 140, mass: 0.7 } });
            return (
              <div key={i} style={{ borderRadius: 34, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 3px ${[COL.physics, '#8E4EC6', COL.biology, COL.chemistry][i]}`, transform: `rotateY(${(1 - s) * 100}deg) scale(${0.7 + 0.3 * s})`, opacity: s > 0.05 ? 1 : 0 }}>
                <div style={{ height: tw * 1.15, overflow: 'hidden' }}>
                  <RecView rec={r.rec} at={r.at} speed={r.speed} w={tw} color={c1} zoom={{ x: 0.5, y: 0.2, s: 1.3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 220 }}>
        <div style={{ transform: `scale(${prog(f, 24, 40)})`, width: 300, height: 300, borderRadius: 999, background: c1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 220, color: '#fff', boxShadow: `0 0 0 16px rgba(7,8,11,0.85), 0 0 120px ${c1}` }}>{sc.big}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: wide ? 80 : 300 }}>
        <Words text={sc.sub!} size={wide ? 80 : 100} delay={30} serif italicLast accent={c1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a counter in front of a field of topic tiles */
const CounterScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [4, 46], [0, Number(sc.big)], { ...clamp, easing: easeOut }));
  const glyphs = ['△', '∫', 'π', '√', '∑', '○', 'x²', 'sin', '∠', '□', 'log', '%', '≈', '∞', '⊥', '∥'];
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      {Array.from({ length: 48 }, (_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const p = prog(f, i * 0.8, i * 0.8 + 14);
        return (
          <div key={i} style={{ position: 'absolute', left: 30 + col * 175, top: 120 + row * 210 + Math.sin(f / 30 + i) * 6, width: 150, height: 150, borderRadius: 30, border: '2px solid rgba(255,255,255,0.08)', background: i % 7 === 0 ? `${c1}44` : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 64, color: i % 7 === 0 ? '#fff' : 'rgba(255,255,255,0.35)', transform: `scale(${p})`, opacity: p }}>
            {glyphs[i % glyphs.length]}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 200 }}>
        <div style={{ padding: '30px 70px', borderRadius: 60, background: 'rgba(7,8,11,0.85)', backdropFilter: 'blur(12px)', boxShadow: `0 0 0 3px ${c1}, 0 0 140px ${c1}88`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: '-0.06em', color: '#fff' }}>{n}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: COL.dim }}>{sc.sub}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** end card: logo, line, address, button */
const CtaScene: React.FC<SceneProps> = ({ sc, c1, c2 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  const s = useSpring(4, 11, 130);
  const btn = useSpring(28, 10, 200);
  const pulse = 1 + Math.max(0, Math.sin((f - 40) / 6)) * 0.03 * (f > 40 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Backdrop c1={c1} c2={c2} />
      {sc.sub && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: wide ? 320 : 820 }}>
          <div style={{ width: 210, height: 260, borderRadius: 22, background: 'linear-gradient(160deg, #D24726, #B7361A)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 30, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: '#fff', transform: `translateY(${(1 - s) * -600}px) rotate(${(1 - s) * -25}deg)` }}>{sc.sub}</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: wide ? 34 : 44, paddingBottom: wide ? 40 : 180, paddingTop: sc.sub && !wide ? 260 : 0 }}>
        <div style={{ transform: `scale(${s})`, filter: `drop-shadow(0 0 50px ${c1}99)` }}>
          <LogoMark size={wide ? 150 : 180} draw={prog(f, 0, 26)} />
        </div>
        <div style={{ padding: wide ? '0 200px' : '0 70px' }}>
          <Words text={sc.title!} size={wide ? 96 : 92} delay={10} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wide ? 46 : 50, color: COL.accent2, opacity: prog(f, 22, 34), letterSpacing: '-0.01em' }}>stem-visualizer.pages.dev</div>
        {!wide && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: COL.dim, opacity: prog(f, 40, 52) }}>Ссылка в профиле ↑</div>}
        <div style={{ transform: `scale(${btn * pulse})`, padding: wide ? '22px 54px' : '26px 60px', borderRadius: 999, background: c1, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: wide ? 40 : 46, boxShadow: `0 20px 60px ${c1}88` }}>Попробовать бесплатно →</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: Record<SceneKind, React.FC<SceneProps>> = {
  hook: HookScene,
  logo: LogoScene,
  phone: PhoneScene,
  duo: DuoScene,
  trio: TrioScene,
  laptop: LaptopScene,
  counter: CounterScene,
  fan: FanScene,
  mosaic: MosaicScene,
  carousel: CarouselScene,
  wall: WallScene,
  cta: CtaScene,
  stopwatch: StopwatchScene,
};

/* ---------- progress bar and corner badge ---------- */

const Chrome: React.FC<{ total: number; c1: string }> = ({ total, c1 }) => {
  const f = useCurrentFrame();
  const { wide } = useWide();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${(f / total) * 100}%`, background: c1, boxShadow: `0 0 18px ${c1}` }} />
      {wide && (
        <div style={{ position: 'absolute', right: 46, top: 40, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.85 }}>
          <LogoMark size={44} />
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#fff' }}>STEM Visualizer</span>
        </div>
      )}
    </>
  );
};

/* ---------- the video ---------- */

export const Motion: React.FC<{ id: string }> = ({ id }) => {
  useFonts();
  const v = VIDEOS.find((x) => x.id === id)!;
  const { scenes, total, beat } = timeline(v);
  const frame = useCurrentFrame();
  // the music drop lands on the first cut
  const bar = beat * 4;
  const musicFrom = Math.round(scenes[1] ? scenes[1].from - bar : 0);
  const voiceAt = (fr: number) => scenes.some((s) => s.vo && fr >= s.from + VOICE_IN - 4 && fr < s.from + VOICE_IN + s.vo.len + 4);
  const music = (fr: number) => {
    const g = frame >= total - 40 ? interpolate(frame, [total - 40, total], [1, 0], clamp) : 1;
    return (voiceAt(fr + musicFrom) ? 0.16 : 0.42) * g;
  };
  return (
    <AbsoluteFill style={{ background: '#07080B' }}>
      {scenes.map((s, i) => {
        const Comp = SCENES[s.sc.kind];
        const next = scenes[i + 1]?.sc.trans;
        const from = Math.max(0, s.from - (i ? OVER : 0));
        const lead = s.from - from;
        return (
          <Sequence key={i} from={from} durationInFrames={lead + s.dur + OVER}>
            <TransIn type={i ? s.sc.trans : 'cut'} color={v.color}>
              <Sequence from={lead} layout="none">
                <TransOut dur={s.dur} next={next}>
                  <Comp sc={s.sc} dur={s.dur} c1={i % 2 && s.sc.kind === 'phone' ? v.color2 : v.color} c2={i % 2 ? v.color : v.color2} />
                </TransOut>
              </Sequence>
            </TransIn>
          </Sequence>
        );
      })}
      {scenes.map((s, i) => !s.sc.noCap && (
        <Sequence key={`c${i}`} from={s.from} durationInFrames={s.dur}>
          <Captions cap={s.cap} vo={s.vo} color={v.color} />
        </Sequence>
      ))}
      <Chrome total={total} c1={v.color} />

      {/* sound */}
      {musicFrom >= 0 ? (
        <Sequence from={musicFrom}>
          <Audio src={staticFile(v.music)} volume={music} />
        </Sequence>
      ) : (
        <Audio src={staticFile(v.music)} startFrom={-musicFrom} volume={music} />
      )}
      {scenes.map((s, i) => (
        <React.Fragment key={`a${i}`}>
          {s.vo && (
            <Sequence from={s.from + VOICE_IN} durationInFrames={s.vo.len + 10}>
              <Audio src={staticFile(`vo3/${s.vo.file}`)} volume={1} />
            </Sequence>
          )}
          {i > 0 && s.sc.trans !== 'cut' && (
            <Sequence from={Math.max(0, s.from - OVER)} durationInFrames={30}>
              <Audio src={staticFile(s.sc.trans === 'glitch' ? 'sfx/tick.wav' : 'sfx/whoosh.wav')} volume={0.35} />
            </Sequence>
          )}
          {(s.sc.kind === 'logo' || s.sc.kind === 'cta' || s.sc.kind === 'counter' || s.sc.kind === 'wall') && (
            <Sequence from={s.from + 4} durationInFrames={60}>
              <Audio src={staticFile('sfx/impact.wav')} volume={0.4} />
            </Sequence>
          )}
          {(s.sc.callouts ?? []).map((c, k) => (
            <Sequence key={k} from={s.from + c.at} durationInFrames={12}>
              <Audio src={staticFile('sfx/pop.wav')} volume={0.4} />
            </Sequence>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
