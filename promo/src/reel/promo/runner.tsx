import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Button, Chip } from '@heroui/react';
import { useFonts } from '../../ui';
import { clamp, CYAN, DIM, INK, Logo, Stage, useIn } from '../kit';
import type { Pt, World } from '../../../../src/components/games/funcwar/engine';
import '../reel.css';

/* Feature promos: a reel is a list of beats, one spoken line each. Until the voice is recorded the beats run on
   their planned length and the line shows as a caption; `voice` later swaps the planned lengths for the take's. */

export interface Beat {
  /** the spoken line, also the caption */
  line: string;
  frames: number;
  scene: React.FC<{ len: number }>;
  /** the scene already shows its words big on screen */
  noCaption?: boolean;
}

export const reelLength = (beats: Beat[]) => beats.reduce((a, b) => a + b.frames, 0);

const Caption: React.FC<{ text: string; len: number }> = ({ text, len }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, len - 6, len], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170 }}>
      <div className="reel-root" style={{ background: 'transparent', maxWidth: 900, textAlign: 'center', fontSize: 46, fontWeight: 600, lineHeight: 1.25, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.85)', opacity: o }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const FeatureReel: React.FC<{ beats: Beat[]; voice?: string }> = ({ beats, voice }) => {
  useFonts();
  const total = reelLength(beats);
  let at = 0;
  const starts = beats.map((b) => ((at += b.frames), at - b.frames));
  return (
    <AbsoluteFill style={{ background: '#070B16' }}>
      {beats.map((b, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={b.frames}>
          <b.scene len={b.frames} />
          {!b.noCaption && <Caption text={b.line} len={b.frames} />}
        </Sequence>
      ))}
      {voice && (
        <Sequence from={6}>
          <Audio src={staticFile(voice)} />
        </Sequence>
      )}
      <Audio src={staticFile('music-labs.wav')} volume={(f) => interpolate(f, [0, 10, total - 30, total], [0, voice ? 0.14 : 0.3, voice ? 0.14 : 0.3, 0], clamp)} />
      {starts.slice(1).map((s) => (
        <Sequence key={s} from={s - 4} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- shared pieces ---------------- */

export const Hook: React.FC<{ top: string; accent: string; chip: string }> = ({ top, accent, chip }) => {
  const f = useCurrentFrame();
  const b = useIn(10);
  return (
    <Stage style={{ gap: 40 }}>
      <Chip className="reel-chip" color="accent" variant="soft" size="lg">
        <Chip.Label className="reel-chip-label">{chip}</Chip.Label>
      </Chip>
      <div className="font-display" style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.05, color: INK, textAlign: 'center', letterSpacing: '-0.02em' }}>
        {top}
      </div>
      <div className="font-display" style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.05, color: CYAN, textAlign: 'center', textShadow: '0 0 50px rgba(57,225,255,0.5)', opacity: b, transform: `scale(${0.9 + b * 0.1 + 0.01 * Math.sin(f / 5)})` }}>
        {accent}
      </div>
    </Stage>
  );
};

export const Cta: React.FC<{ title: string; button: string; note: string }> = ({ title, button, note }) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(14);
  return (
    <Stage>
      <Logo style={{ opacity: a, transform: `scale(${0.7 + a * 0.3})` }} />
      <div className="font-display" style={{ fontSize: 72, fontWeight: 700, color: INK, textAlign: 'center', lineHeight: 1.1, opacity: a }}>
        {title}
      </div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px) scale(${1 + 0.03 * Math.sin(f / 6)})`, marginTop: 30 }}>
        <Button size="lg" className="font-semibold" style={{ height: 120, padding: '0 70px', fontSize: 46, boxShadow: '0 0 50px rgba(57,225,255,0.5)' }}>
          {button}
        </Button>
      </div>
      <Chip className="reel-chip" color="accent" variant="soft" size="lg" style={{ opacity: b }}>
        <Chip.Label className="reel-chip-label">{note}</Chip.Label>
      </Chip>
    </Stage>
  );
};

/** a formula being typed into the game's input */
export const Typed: React.FC<{ text: string; from: number; perChar?: number }> = ({ text, from, perChar = 2 }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((f - from) / perChar)));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%', padding: '22px 30px', borderRadius: 26, background: '#0F1729', border: '2px solid #24345A' }}>
      <span className="font-mono" style={{ fontSize: 46, color: DIM, whiteSpace: 'nowrap' }}>y =</span>
      <span className="font-mono" style={{ fontSize: text.length > 18 ? 38 : 50, color: INK, whiteSpace: 'nowrap' }}>
        {text.slice(0, n)}
        <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: CYAN }}>|</span>
      </span>
    </div>
  );
};

/* ---------------- the battlefield, drawn as SVG from the game's own engine ---------------- */

const W = 40;
const H = 24;
const RED = '#FF5A5F';

export const FieldSvg: React.FC<{
  world: World;
  shots?: { path: Pt[]; upto: number; color?: string }[];
  hp?: Record<number, number>;
  dead?: number[];
  style?: React.CSSProperties;
}> = ({ world, shots = [], hp = {}, dead = [], style }) => {
  const sx = (x: number) => x + W / 2;
  const sy = (y: number) => H / 2 - y;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', borderRadius: 26, border: '2px solid #24345A', background: '#0A1122', ...style }}>
      {Array.from({ length: W + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i} y1={0} x2={i} y2={H} stroke={i === W / 2 ? '#2A3C66' : i % 5 === 0 ? '#1A2846' : '#121C33'} strokeWidth={0.06} />
      ))}
      {Array.from({ length: H + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i} x2={W} y2={i} stroke={i === H / 2 ? '#2A3C66' : i % 5 === 0 ? '#1A2846' : '#121C33'} strokeWidth={0.06} />
      ))}
      <defs>
        <radialGradient id="rock" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3A4D78" />
          <stop offset="100%" stopColor="#22304F" />
        </radialGradient>
      </defs>
      {world.obstacles.map((o, i) => (
        <circle key={`o${i}`} cx={sx(o.x)} cy={sy(o.y)} r={o.r} fill="url(#rock)" />
      ))}
      {world.holes.map((h, i) => (
        <circle key={`c${i}`} cx={sx(h.x)} cy={sy(h.y)} r={h.r} fill="#0A1122" />
      ))}
      {shots.map((s, i) => {
        const pts = s.path.slice(0, Math.max(1, s.upto));
        const head = pts[pts.length - 1];
        return (
          <g key={`s${i}`}>
            <polyline points={pts.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="none" stroke={s.color ?? CYAN} strokeWidth={0.22} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 0.4px ${s.color ?? CYAN})` }} />
            {s.upto < s.path.length && <circle cx={sx(head.x)} cy={sy(head.y)} r={0.32} fill="#fff" />}
          </g>
        );
      })}
      {world.soldiers.map((s) => {
        const c = s.team === 0 ? CYAN : RED;
        if (dead.includes(s.id))
          return (
            <g key={s.id} stroke="#5B6884" strokeWidth={0.18}>
              <line x1={sx(s.x) - 0.6} y1={sy(s.y) - 0.6} x2={sx(s.x) + 0.6} y2={sy(s.y) + 0.6} />
              <line x1={sx(s.x) + 0.6} y1={sy(s.y) - 0.6} x2={sx(s.x) - 0.6} y2={sy(s.y) + 0.6} />
            </g>
          );
        const lives = hp[s.id];
        return (
          <g key={s.id}>
            <circle cx={sx(s.x)} cy={sy(s.y)} r={0.6} fill={c} />
            <circle cx={sx(s.x) + (s.team === 0 ? 0.21 : -0.21)} cy={sy(s.y) - 0.12} r={0.13} fill="#04101E" />
            {lives !== undefined &&
              [0, 1, 2].map((k) => <circle key={k} cx={sx(s.x) + (k - 1) * 0.42} cy={sy(s.y) + 1.05} r={0.15} fill={k < lives ? '#FF5A7A' : '#2C3B5E'} />)}
          </g>
        );
      })}
    </svg>
  );
};

/** how far along a shot is, 0 → full path, between two frames */
export const upto = (f: number, from: number, len: number, path: Pt[]) => Math.ceil(interpolate(f, [from, from + len], [0, path.length], clamp));
