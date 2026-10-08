import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Backdrop, COL, Kinetic, LogoMark, SANS, SERIF, useFonts } from './ui';
import overview from '../public/rec/overview/manifest.json';
import space from '../public/rec/space/manifest.json';
import chem from '../public/rec/chem/manifest.json';
import optics from '../public/rec/optics/manifest.json';
import circuit from '../public/rec/circuit/manifest.json';

/* Promo clips built from real screen recordings of the site (see scripts/record.mjs). */

interface Manifest {
  name: string;
  frames: number;
  w: number;
  h: number;
  taps: { f: number; x: number; y: number; kind: string }[];
  marks: Record<string, number>;
}
interface Caption {
  at: string;
  offset?: number;
  dur: number;
  text: string;
  hl?: string[];
}
interface Zoom {
  at: string;
  offset?: number;
  dur: number;
  scale: number;
  /** focus point in recording pixels (1080×1920) */
  x: number;
  y: number;
}
export interface ClipDef {
  id: string;
  rec: Manifest;
  hook: string;
  hookHl?: string[];
  color: string;
  color2: string;
  captions: Caption[];
  zooms: Zoom[];
  outro: string;
  musicFrom: number;
}

export const OUTRO = 90;
export const clipLength = (c: ClipDef) => c.rec.frames + OUTRO;

export const CLIPS: ClipDef[] = [
  {
    id: 'Overview',
    rec: overview as Manifest,
    hook: 'Учебник, который можно потрогать',
    hookHl: ['потрогать'],
    color: COL.accent,
    color2: '#8E4EC6',
    musicFrom: 0,
    captions: [
      { at: 'open', offset: -20, dur: 70, text: 'Физика, химия и биология с 5 по 11 класс', hl: ['5', '11'] },
      { at: 'textbook', offset: 10, dur: 90, text: '486 тем — коротко и понятно', hl: ['486'] },
      { at: 'topic', dur: 75, text: 'К каждой теме — живая модель', hl: ['живая'] },
      { at: 'labs', offset: 10, dur: 130, text: '60+ лабораторий и 8 конструкторов опытов', hl: ['60+', '8'] },
    ],
    zooms: [{ at: 'topic', offset: 40, dur: 70, scale: 1.18, x: 540, y: 1000 }],
    outro: 'Попробуй бесплатно',
  },
  {
    id: 'Space',
    rec: space as Manifest,
    hook: 'Почему спутник не падает на Землю?',
    hookHl: ['не', 'падает'],
    color: '#2F5BFF',
    color2: '#5FD39A',
    musicFrom: 120,
    captions: [
      { at: 'v1', offset: -10, dur: 150, text: '7,8 км/с — и он летит вокруг Земли', hl: ['7,8'] },
      { at: 'v2', offset: -10, dur: 140, text: '11,2 км/с — и он улетает навсегда', hl: ['11,2'] },
    ],
    zooms: [
      { at: 'v1', offset: 30, dur: 150, scale: 1.22, x: 540, y: 640 },
      { at: 'v2', offset: 30, dur: 150, scale: 1.22, x: 540, y: 640 },
    ],
    outro: 'Запусти свой спутник',
  },
  {
    id: 'Chemistry',
    rec: chem as Manifest,
    hook: 'Химия без лаборатории и без риска',
    hookHl: ['без'],
    color: '#30A46C',
    color2: '#F2C21B',
    musicFrom: 240,
    captions: [
      { at: 'gold', offset: -55, dur: 100, text: 'Смешиваем Pb(NO₃)₂ и KI…', hl: ['Pb(NO₃)₂', 'KI…'] },
      { at: 'gold', offset: 45, dur: 80, text: '…и идёт «золотой дождь»', hl: ['«золотой', 'дождь»'] },
      { at: 'equation', offset: 5, dur: 90, text: 'Уравнение реакции пишется само', hl: ['само'] },
      { at: 'blue', offset: 60, dur: 140, text: 'CuSO₄ + NaOH → голубой осадок', hl: ['голубой'] },
    ],
    zooms: [
      { at: 'gold', offset: 30, dur: 80, scale: 1.25, x: 540, y: 520 },
      { at: 'blue', offset: 120, dur: 110, scale: 1.25, x: 540, y: 520 },
    ],
    outro: 'Проведи свой опыт',
  },
  {
    id: 'Optics',
    rec: optics as Manifest,
    hook: 'Как из белого света получается радуга?',
    hookHl: ['радуга?'],
    color: '#AB8AFF',
    color2: '#FACC15',
    musicFrom: 360,
    captions: [
      { at: 'prism', offset: -10, dur: 110, text: 'Призма раскладывает свет на цвета', hl: ['цвета'] },
      { at: 'lens', offset: 0, dur: 100, text: 'Линза строит изображение предмета', hl: ['изображение'] },
      { at: 'magnifier', offset: -60, dur: 150, text: 'Ближе фокуса — увеличенное и мнимое. Так работает лупа', hl: ['лупа'] },
    ],
    zooms: [
      { at: 'prism', offset: 20, dur: 90, scale: 1.25, x: 540, y: 800 },
      { at: 'lens', offset: 30, dur: 200, scale: 1.2, x: 540, y: 800 },
    ],
    outro: 'Собери свою оптику',
  },
  {
    id: 'Circuit',
    rec: circuit as Manifest,
    hook: 'Электрическая цепь прямо в телефоне',
    hookHl: ['в', 'телефоне'],
    color: '#FFD60A',
    color2: '#2F5BFF',
    musicFrom: 480,
    captions: [
      { at: 'off', offset: -35, dur: 55, text: 'Разомкнул ключ — ток пропал', hl: ['пропал'] },
      { at: 'on', offset: -30, dur: 60, text: 'Замкнул — лампа горит', hl: ['горит'] },
      { at: 'parallel', offset: 0, dur: 110, text: 'Параллельное соединение', hl: ['Параллельное'] },
      { at: 'removed', offset: -75, dur: 110, text: 'Убрал одну лампу — вторая горит', hl: ['вторая'] },
    ],
    zooms: [
      { at: 'start', offset: 60, dur: 130, scale: 1.2, x: 540, y: 820 },
      { at: 'parallel', offset: 20, dur: 200, scale: 1.2, x: 540, y: 820 },
    ],
    outro: 'Собери свою схему',
  },
];

const markAt = (c: ClipDef, name: string, offset = 0) => (c.rec.marks[name] ?? 0) + offset;

/* ---------- pieces ---------- */

const PHONE_W = 860;
const PHONE_H = Math.round((PHONE_W * 1920) / 1080);
const PHONE_X = (1080 - PHONE_W) / 2;
const PHONE_Y = 1920 - PHONE_H - 60;

/** current zoom from the clip's zoom keyframes */
function zoomAt(c: ClipDef, f: number) {
  let s = 1;
  let fx = 540;
  let fy = 960;
  for (const z of c.zooms) {
    const a = markAt(c, z.at, z.offset);
    const k = interpolate(f, [a, a + 18, a + z.dur - 18, a + z.dur], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x) });
    if (k > 0) {
      s = 1 + (z.scale - 1) * k;
      fx = 540 + (z.x - 540) * k;
      fy = 960 + (z.y - 960) * k;
    }
  }
  return { s, fx, fy };
}

const Screen: React.FC<{ c: ClipDef }> = ({ c }) => {
  const f = useCurrentFrame();
  const rf = Math.min(c.rec.frames - 1, f);
  const { s, fx, fy } = zoomAt(c, f);
  const k = PHONE_W / 1080;
  // keep the focus point where it was on the phone while scaling around it
  const tx = (540 - fx) * (s - 1) * k;
  const ty = (960 - fy) * (s - 1) * k;
  const enter = spring({ frame: f, fps: 30, config: { damping: 18, stiffness: 90 } });
  const scaleR = 1080 / c.rec.w;
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_X,
        top: PHONE_Y,
        width: PHONE_W,
        height: PHONE_H,
        transform: `translate(${tx}px, ${ty + (1 - enter) * 300}px) scale(${s})`,
        transformOrigin: `${(fx / 1080) * 100}% ${(fy / 1920) * 100}%`,
        borderRadius: 64,
        overflow: 'hidden',
        border: '10px solid #15171C',
        boxShadow: `0 50px 140px rgba(0,0,0,0.7), 0 0 160px ${c.color}44`,
        background: '#fff',
        opacity: enter,
      }}
    >
      <Img src={staticFile(`rec/${c.rec.name}/${String(rf).padStart(5, '0')}.jpg`)} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* taps: a finger dot with a ripple */}
      {c.rec.taps
        .filter((t) => t.kind !== 'move' && f >= t.f - 6 && f < t.f + 22)
        .map((t, i) => {
          const d = f - t.f;
          const ripple = interpolate(d, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const dot = interpolate(d, [-6, 0, 10, 20], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const x = t.x * scaleR * k;
          const y = t.y * scaleR * k;
          return (
            <div key={i}>
              <div style={{ position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 99, border: `6px solid ${c.color}`, transform: `scale(${0.3 + ripple})`, opacity: (1 - ripple) * 0.9 }} />
              <div style={{ position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 99, background: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 18px rgba(0,0,0,0.35)', opacity: dot, transform: `scale(${0.8 + 0.2 * dot})` }} />
            </div>
          );
        })}
      {/* drags: the finger follows the path */}
      {(() => {
        const moves = c.rec.taps.filter((t) => t.kind === 'move' || t.kind === 'down' || t.kind === 'up');
        const near = moves.filter((t) => Math.abs(t.f - f) <= 1);
        if (!near.length) return null;
        const t = near[near.length - 1];
        return <div style={{ position: 'absolute', left: t.x * scaleR * k - 26, top: t.y * scaleR * k - 26, width: 52, height: 52, borderRadius: 99, background: 'rgba(255,255,255,0.85)', boxShadow: `0 0 0 8px ${c.color}66, 0 4px 18px rgba(0,0,0,0.35)` }} />;
      })()}
    </div>
  );
};

const Captions: React.FC<{ c: ClipDef }> = ({ c }) => {
  const f = useCurrentFrame();
  const hookOut = interpolate(f, [70, 84], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      {/* dark band behind the text */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: 'linear-gradient(#08090Cee 55%, #08090C00)' }} />
      {f < 86 && (
        <div style={{ position: 'absolute', left: 70, right: 70, top: 150, opacity: hookOut }}>
          <Kinetic text={c.hook} size={96} highlight={c.hookHl} stagger={3} />
        </div>
      )}
      {c.captions.map((cap, i) => {
        const a = markAt(c, cap.at, cap.offset);
        if (f < a || f > a + cap.dur) return null;
        const out = interpolate(f, [a + cap.dur - 10, a + cap.dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <Sequence key={i} from={a} durationInFrames={cap.dur} layout="none">
            <div style={{ position: 'absolute', left: 70, right: 70, top: 170, opacity: out }}>
              <Kinetic text={cap.text} size={78} serif={false} highlight={cap.hl} stagger={2} />
            </div>
          </Sequence>
        );
      })}
      {/* small brand tag */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: 30, fontWeight: 600, color: '#C9CFDB', opacity: f > 90 ? 1 : 0 }}>
        <LogoMark size={44} />
        STEM Visualizer
      </div>
    </>
  );
};

const Outro: React.FC<{ c: ClipDef }> = ({ c }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const pop2 = spring({ frame: f - 10, fps, config: { damping: 14, stiffness: 120 } });
  const pop3 = spring({ frame: f - 22, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: `rgba(8,9,12,${0.88 * Math.min(1, f / 10)})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
      <div style={{ transform: `scale(${pop})` }}>
        <LogoMark size={190} draw={Math.min(1, f / 25)} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 100, color: COL.ink, letterSpacing: '-0.02em', opacity: pop2, transform: `translateY(${(1 - pop2) * 40}px)` }}>{c.outro}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: pop3, transform: `translateY(${(1 - pop3) * 40}px)` }}>
        <div style={{ padding: '18px 36px', borderRadius: 999, background: '#5FD39A', color: '#08210F', fontFamily: SANS, fontWeight: 800, fontSize: 46 }}>Бесплатно</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: COL.accent2 }}>stem-visualizer.pages.dev</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#C9CFDB' }}>Ссылка в профиле ↑</div>
      </div>
    </AbsoluteFill>
  );
};

export const Clip: React.FC<{ id: string }> = ({ id }) => {
  useFonts();
  const c = CLIPS.find((x) => x.id === id)!;
  const total = clipLength(c);
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Backdrop hue={c.color} hue2={c.color2} strength={0.9} />
      <Audio
        src={staticFile('music.wav')}
        startFrom={c.musicFrom}
        volume={(f) => interpolate(f, [0, 12, total - 30, total], [0, 0.75, 0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      <Screen c={c} />
      <Captions c={c} />
      <Sequence from={c.rec.frames}>
        <Outro c={c} />
      </Sequence>
    </AbsoluteFill>
  );
};
