import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/* Shared pieces of the vertical reels: the STEM Lab night stage, particles, easing helpers and the logo. */

export const CYAN = '#39E1FF';
export const VIOLET = '#7B5CFF';
export const INK = '#DDE6FF';
export const DIM = '#9AA7C7';
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/** 0 → 1 over `len` frames from `at` */
export const prog = (f: number, at: number, len: number) => ease(interpolate(f, [at, at + len], [0, 1], clamp));

/** a gentle spring entrance for an element, from `at` */
export function useIn(at: number) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping: 16, stiffness: 120 } });
}

/* ---------- background: slow particles, drawn from the frame number ---------- */
const DOTS = Array.from({ length: 90 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1080, y: r(2) * 1920, vx: (r(3) - 0.5) * 0.6, vy: (r(4) - 0.5) * 0.6, s: 2 + r(5) * 3, cyan: r(6) < 0.45 };
});
export const Particles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {DOTS.map((d, i) => (
        <circle key={i} cx={(d.x + d.vx * f + 1080) % 1080} cy={(d.y + d.vy * f + 1920) % 1920} r={d.s} fill={d.cyan ? CYAN : VIOLET} opacity={0.55} />
      ))}
    </svg>
  );
};

/** the night-lab stage: HeroUI's stem-lab-dark theme, gradient and particles, content centred */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill className="reel-root dark" data-theme="stem-lab-dark" style={{ background: 'radial-gradient(120% 70% at 50% 32%, #13204A 0%, #070B16 62%)' }}>
    <Particles />
    <AbsoluteFill style={{ padding: 90, alignItems: 'center', justifyContent: 'center', gap: 36, ...style }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div className="font-mono" style={{ fontSize: 30, letterSpacing: '0.1em', color: CYAN, ...style }}>
    {children}
  </div>
);

/** the site's cube logo on a cyan tile */
export const Logo: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 170, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.27, background: CYAN, display: 'grid', placeItems: 'center', boxShadow: '0 0 80px rgba(57,225,255,0.5)', ...style }}>
    <svg viewBox="0 0 120 120" width={size * 0.7} height={size * 0.7}>
      <g stroke="#04101E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="46" y="28" width="46" height="46" rx="2" />
        <line x1="28" y1="46" x2="46" y2="28" />
        <line x1="74" y1="46" x2="92" y2="28" />
        <line x1="74" y1="92" x2="92" y2="74" />
        <rect x="28" y="46" width="46" height="46" rx="2" fill={CYAN} />
      </g>
    </svg>
  </div>
);
