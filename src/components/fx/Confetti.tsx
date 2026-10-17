import React, { useMemo } from 'react';

const COLORS = ['#2F5BFF', '#30A46C', '#F5A524', '#E5484D', '#8E4EC6'];

/** a short burst of falling confetti over the parent (which must be position: relative) */
export const Confetti: React.FC<{ count?: number }> = ({ count = 36 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        bg: COLORS[i % COLORS.length],
        dx: `${(Math.random() - 0.5) * 160}px`,
        rot: `${(Math.random() - 0.5) * 900}deg`,
        dur: `${1.4 + Math.random() * 1.2}s`,
        delay: `${Math.random() * 0.25}s`,
        round: Math.random() < 0.3,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: p.left, background: p.bg, borderRadius: p.round ? '50%' : undefined, ['--dx' as string]: p.dx, ['--rot' as string]: p.rot, ['--dur' as string]: p.dur, ['--delay' as string]: p.delay } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
