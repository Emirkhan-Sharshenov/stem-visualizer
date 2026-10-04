import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const FPS = 30;
export const BAR = (60 / 128) * 4 * FPS; // 56.25 frames
export const bar = (n: number) => Math.round(n * BAR);

export const COL = {
  bg: '#08090C',
  ink: '#F4F5F7',
  dim: '#9AA0AA',
  accent: '#2F5BFF',
  accent2: '#8FA4FF',
  physics: '#E5484D',
  chemistry: '#30A46C',
  biology: '#F5A524',
};

export const SANS = 'Inter, "Segoe UI", system-ui, sans-serif';
export const SERIF = 'Newsreader, Georgia, serif';

/** Waits for the web fonts before frames are captured */
export function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,400;6..72,600&display=block';
    document.head.appendChild(link);
    const done = () => continueRender(handle);
    link.onload = () => document.fonts.ready.then(done);
    link.onerror = done;
    const t = setTimeout(done, 8000);
    return () => clearTimeout(t);
  }, [handle]);
}

export const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });

export function usePop(delay = 0, damping = 14) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 140, mass: 0.7 } });
}

/** Animated background: drifting colour glows, faint grid and vignette */
export const Backdrop: React.FC<{ hue?: string; hue2?: string; strength?: number }> = ({ hue = COL.accent, hue2 = '#8E4EC6', strength = 1 }) => {
  const f = useCurrentFrame();
  const x1 = 30 + Math.sin(f / 70) * 18;
  const y1 = 25 + Math.cos(f / 90) * 12;
  const x2 = 70 + Math.cos(f / 80) * 16;
  const y2 = 78 + Math.sin(f / 60) * 10;
  return (
    <div style={{ position: 'absolute', inset: 0, background: COL.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${x1}% ${y1}%, ${hue}${Math.round(60 * strength).toString(16).padStart(2, '0')} 0%, transparent 45%), radial-gradient(circle at ${x2}% ${y2}%, ${hue2}${Math.round(50 * strength).toString(16).padStart(2, '0')} 0%, transparent 45%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -60,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: `translateY(${(f * 0.6) % 60}px)`,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
    </div>
  );
};

/** Word-by-word kinetic headline */
export const Kinetic: React.FC<{ text: string; delay?: number; size?: number; serif?: boolean; color?: string; highlight?: string[]; stagger?: number; align?: 'center' | 'left' }> = ({
  text,
  delay = 0,
  size = 92,
  serif = true,
  color = COL.ink,
  highlight = [],
  stagger = 3,
  align = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px`, fontFamily: serif ? SERIF : SANS, fontSize: size, lineHeight: 1.08, fontWeight: serif ? 500 : 700, letterSpacing: serif ? '-0.02em' : '-0.03em', color }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 16, stiffness: 160, mass: 0.6 } });
        const hl = highlight.some((h) => w.toLowerCase().startsWith(h.toLowerCase()));
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08 }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 110}%) rotate(${(1 - s) * 6}deg)`,
                opacity: s,
                color: hl ? COL.accent2 : color,
                fontStyle: hl && serif ? 'italic' : 'normal',
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Rounded chip label */
export const Chip: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = COL.accent2, size = 30, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: `${size * 0.35}px ${size * 0.7}px`,
      borderRadius: 999,
      border: `2px solid ${color}55`,
      background: 'rgba(20,22,28,0.85)',
      color: COL.ink,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: size,
      backdropFilter: 'blur(8px)',
      ...style,
    }}
  >
    <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: 99, background: color, boxShadow: `0 0 ${size * 0.6}px ${color}` }} />
    {children}
  </div>
);

export const LogoMark: React.FC<{ size: number; draw?: number }> = ({ size, draw = 1 }) => {
  const edge = (d: number) => ({ strokeDasharray: 30, strokeDashoffset: 30 * (1 - Math.max(0, Math.min(1, draw * 3 - d))) });
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <rect width="120" height="120" rx="26" fill={COL.accent} />
      <g stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="46" y="28" width="46" height="46" rx="2" strokeOpacity={0.85 * Math.min(1, draw * 2)} />
        <line x1="28" y1="46" x2="46" y2="28" style={edge(0)} />
        <line x1="74" y1="46" x2="92" y2="28" style={edge(0.4)} />
        <line x1="74" y1="92" x2="92" y2="74" style={edge(0.8)} />
        <rect x="28" y="46" width="46" height="46" rx="2" fill={COL.accent} />
      </g>
    </svg>
  );
};

/** Glass card that frames a simulation, with a soft glow */
export const Frame: React.FC<{ children: React.ReactNode; w: number; h: number; glow?: string; tilt?: number; style?: React.CSSProperties }> = ({ children, w, h, glow = COL.accent, tilt = 0, style }) => (
  <div style={{ perspective: 1600, ...style }}>
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 36,
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.09)',
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 120px ${glow}33`,
        background: '#111214',
        transform: `rotateX(${tilt * 0.6}deg) rotateY(${tilt}deg)`,
        position: 'relative',
      }}
    >
      {children}
    </div>
  </div>
);
