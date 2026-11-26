import React from 'react';

interface LogoMarkProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

// The brand colours stay the same in both themes
const TILE = '#5B4BFF';
const CUT = '#3DD6FF';

/**
 * "Cutaway" mark: an isometric cube with its front corner taken out, a model opened up to look inside.
 * Every face is its own layer so the mark can be animated: the faces settle in from their own sides,
 * then the corner block lifts away and reveals the inside (see .logo-animate in index.css).
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ size = 28, animate = false, className = '' }) => {
  // small sizes drop the hairline gaps between faces, which would only blur at 16 px
  const gap = size < 24 ? 0 : 3;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className={`logo-mark ${animate ? 'logo-animate' : ''} ${className}`}>
      <rect className="logo-tile" width="120" height="120" rx="28" fill={TILE} />
      <g stroke={TILE} strokeWidth={gap} strokeLinejoin="round">
        {/* the inside, seen through the cut */}
        <path d="M60 81 76.5 71.5 60 62 43.5 71.5Z" fill="#FFFFFF" />
        <path d="M76.5 52.5 60 43 60 62 76.5 71.5Z" fill="#FFFFFF" fillOpacity="0.62" />
        <path d="M43.5 52.5 60 43 60 62 43.5 71.5Z" fill={CUT} />
        {/* the three outer faces */}
        <path className="logo-face logo-face-top" d="M93 43 60 24 27 43 43.5 52.5 60 43 76.5 52.5Z" fill="#FFFFFF" />
        <path className="logo-face logo-face-left" d="M60 81 43.5 71.5 43.5 52.5 27 43 27 81 60 100Z" fill="#FFFFFF" fillOpacity="0.62" />
        <path className="logo-face logo-face-right" d="M76.5 52.5 93 43 93 81 60 100 60 81 76.5 71.5Z" fill={CUT} />
        {/* the corner block that lifts out; at rest it is gone */}
        {animate && (
          <g className="logo-corner">
            <path d="M60 62 76.5 52.5 60 43 43.5 52.5Z" fill="#FFFFFF" />
            <path d="M60 62 43.5 52.5 43.5 71.5 60 81Z" fill="#DCD8FF" />
            <path d="M60 62 76.5 52.5 76.5 71.5 60 81Z" fill={CUT} />
          </g>
        )}
      </g>
    </svg>
  );
};

interface LogoProps {
  size?: number;
  inverted?: boolean;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, inverted = false, animate = false }) => (
  <span className="logo inline-flex items-center gap-2.5">
    <LogoMark size={size} animate={animate} />
    <span className={`font-serif font-extrabold tracking-[-0.03em] ${inverted ? 'text-[#F4F6FF]' : 'text-ink'}`} style={{ fontSize: Math.round(size * 0.62) }}>
      STEM <span className={`font-medium ${inverted ? 'text-[#9AA3C7]' : 'text-ink-2'}`}>Visualizer</span>
    </span>
  </span>
);
