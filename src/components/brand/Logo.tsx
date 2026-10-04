import React from 'react';

interface LogoMarkProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

// "Projection" mark: a flat square (2D definition) extruded into a cube (3D mental model)
export const LogoMark: React.FC<LogoMarkProps> = ({ size = 28, animate = false, className = '' }) => {
  const stroke = size < 24 ? 7 : size < 40 ? 5 : 3.2;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={`${animate ? 'logo-animate' : ''} ${className}`}
    >
      <rect width="120" height="120" rx="26" fill="#2F5BFF" />
      <g stroke="#fff" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="46" y="28" width="46" height="46" rx="2" strokeOpacity="0.85" />
        <line className="logo-edge" x1="28" y1="46" x2="46" y2="28" />
        <line className="logo-edge" x1="74" y1="46" x2="92" y2="28" style={{ animationDelay: '80ms' }} />
        <line className="logo-edge" x1="74" y1="92" x2="92" y2="74" style={{ animationDelay: '160ms' }} />
        <rect x="28" y="46" width="46" height="46" rx="2" fill="#2F5BFF" />
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
  <span className="inline-flex items-center gap-2.5">
    <LogoMark size={size} animate={animate} />
    <span
      className={`font-sans font-medium tracking-[-0.01em] ${inverted ? 'text-[#EDEDED]' : 'text-ink'}`}
      style={{ fontSize: Math.round(size * 0.6) }}
    >
      STEM Visualizer
    </span>
  </span>
);
