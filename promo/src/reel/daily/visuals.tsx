import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, CYAN, DIM, INK, VIOLET } from '../kit';

/* The live models of the daily problems. Each draws itself from `solve` (0 while the problem is read,
   rising to 1 as the solution is spoken) and the frame number for idle motion. */

export interface VisualProps {
  solve: number;
}

const MONO = 'IBM Plex Mono, monospace';
const DISPLAY = 'Unbounded, sans-serif';
const AMBER = '#FFD65A';
const after = (s: number, a: number, b: number) => interpolate(s, [a, b], [0, 1], clamp);

const Tag: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number }> = ({ x, y, children, color = INK, size = 34, anchor = 'middle', opacity = 1 }) => (
  <text x={x} y={y} fill={color} fontSize={size} fontFamily={MONO} textAnchor={anchor} opacity={opacity}>
    {children}
  </text>
);

/* 1. a ball thrown straight up: height ruler and the energy bars trading places */
export const BallUp: React.FC<VisualProps> = ({ solve }) => {
  const h = 20 * (1 - Math.pow(1 - solve, 2)); // slows down on the way up
  const y = 500 - h * 21;
  const done = after(solve, 0.92, 1);
  const ek = 1 - h / 20;
  return (
    <svg viewBox="0 0 900 560" width="100%">
      <line x1="60" y1="520" x2="840" y2="520" stroke="#2C3B5E" strokeWidth="6" />
      {[0, 5, 10, 15, 20].map((m) => (
        <g key={m}>
          <line x1="120" y1={500 - m * 21} x2="150" y2={500 - m * 21} stroke={DIM} strokeWidth="4" />
          <Tag x={105} y={510 - m * 21} size={26} anchor="end" color={DIM}>{m}</Tag>
        </g>
      ))}
      <line x1="150" y1="80" x2="150" y2="500" stroke={DIM} strokeWidth="4" />
      <line x1="200" y1="80" x2="640" y2="80" stroke={CYAN} strokeWidth="4" strokeDasharray="14 12" opacity={0.35 + done * 0.65} />
      <Tag x={630} y={66} anchor="end" color={CYAN} size={36}>{done > 0.5 ? 'h = 20 м' : 'h = ?'}</Tag>
      {solve < 0.05 && (
        <g>
          <line x1="400" y1="440" x2="400" y2="300" stroke={AMBER} strokeWidth="8" />
          <polygon points="400,280 384,312 416,312" fill={AMBER} />
          <Tag x={430} y={330} anchor="start" color={AMBER}>v₀ = 20 м/с</Tag>
        </g>
      )}
      <circle cx="400" cy={y - 10} r="34" fill={CYAN} />
      <circle cx="390" cy={y - 20} r="9" fill="#fff" opacity="0.7" />
      {/* energy bars */}
      {[
        ['Eк', ek, AMBER],
        ['Eп', 1 - ek, VIOLET],
      ].map(([label, v, c], i) => (
        <g key={label as string}>
          <rect x={700 + i * 80} y="140" width="56" height="360" rx="10" fill="#0F1729" stroke="#2C3B5E" strokeWidth="4" />
          <rect x={700 + i * 80} y={500 - 360 * (v as number)} width="56" height={360 * (v as number)} rx="10" fill={c as string} />
          <Tag x={728 + i * 80} y={548} size={30}>{label}</Tag>
        </g>
      ))}
    </svg>
  );
};

/* 2. two 6 Ω resistors in parallel, current split between the branches */
export const Parallel: React.FC<VisualProps> = ({ solve }) => {
  const f = useCurrentFrame();
  const lit = after(solve, 0, 0.3);
  const done = after(solve, 0.7, 0.85);
  const path = (y: number) => `M 140 ${y} L 760 ${y}`;
  return (
    <svg viewBox="0 0 900 560" width="100%">
      {/* trunk */}
      <path d="M 140 160 L 140 400 M 760 160 L 760 400 M 140 280 L 60 280 L 60 500 L 840 500 L 840 280 L 760 280" fill="none" stroke="#2C3B5E" strokeWidth="10" strokeLinejoin="round" />
      <rect x="30" y="360" width="60" height="80" rx="10" fill="#0F1729" stroke={INK} strokeWidth="5" />
      <Tag x={60} y={412} size={28}>U</Tag>
      {[160, 400].map((y, i) => (
        <g key={y}>
          <path d={path(y)} fill="none" stroke="#2C3B5E" strokeWidth="10" />
          <path d={path(y)} fill="none" stroke={CYAN} strokeWidth="10" strokeDasharray="22 34" strokeDashoffset={-f * 4 - i * 20} opacity={0.3 + lit * 0.7} />
          <rect x="370" y={y - 46} width="160" height="92" rx="14" fill="#0F1729" stroke={INK} strokeWidth="6" />
          <Tag x={450} y={y + 12} size={36}>6 Ω</Tag>
        </g>
      ))}
      <Tag x={450} y={292} color={done > 0.5 ? CYAN : DIM} size={done > 0.5 ? 44 : 34}>{done > 0.5 ? 'R = 3 Ω' : 'R = ?'}</Tag>
    </svg>
  );
};

/* 3. 200 g of solution as twenty 10 g blocks; 15 % of them are salt */
export const Salt: React.FC<VisualProps> = ({ solve }) => {
  const pick = after(solve, 0.35, 0.75);
  const done = after(solve, 0.85, 1);
  return (
    <svg viewBox="0 0 900 560" width="100%">
      {/* beaker */}
      <path d="M 70 90 L 70 470 Q 70 520 120 520 L 280 520 Q 330 520 330 470 L 330 90" fill="none" stroke={INK} strokeWidth="6" />
      <rect x="76" y="200" width="248" height="314" rx="30" fill={CYAN} opacity="0.28" />
      <Tag x={200} y={160} size={30}>200 г</Tag>
      <Tag x={200} y={370} size={40} color={INK}>15 %</Tag>
      {/* the blocks */}
      {Array.from({ length: 20 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const salt = i < 3;
        return (
          <rect
            key={i}
            x={400 + col * 92}
            y={120 + row * 92 - (salt ? pick * 30 : 0)}
            width="76"
            height="76"
            rx="12"
            fill={salt ? (pick > 0.1 ? '#F4F5F7' : '#1B2A4A') : '#1B2A4A'}
            stroke={salt && pick > 0.1 ? CYAN : '#2C3B5E'}
            strokeWidth="4"
          />
        );
      })}
      <Tag x={630} y={520} size={30} color={DIM}>1 блок = 10 г</Tag>
      <Tag x={630} y={80} size={40} color={CYAN} opacity={done}>соль: 3 × 10 = 30 г</Tag>
    </svg>
  );
};

/* 4. a train covering 200 m in 10 s */
export const Train: React.FC<VisualProps> = ({ solve }) => {
  const run = after(solve, 0.45, 1);
  const x = 60 + run * 580;
  const conv = after(solve, 0.05, 0.3);
  return (
    <svg viewBox="0 0 900 560" width="100%">
      <Tag x={450} y={70} size={38} color={conv > 0.5 ? CYAN : INK}>{conv > 0.5 ? '72 км/ч = 20 м/с' : 'v = 72 км/ч'}</Tag>
      {/* the train */}
      <g transform={`translate(${x}, 210)`}>
        <rect x="0" y="0" width="200" height="110" rx="26" fill={CYAN} />
        <rect x="150" y="18" width="40" height="40" rx="8" fill="#04101E" />
        {[20, 75].map((wx) => (
          <rect key={wx} x={wx} y="22" width="40" height="34" rx="6" fill="#04101E" opacity="0.8" />
        ))}
        {[40, 160].map((cx) => (
          <circle key={cx} cx={cx} cy="120" r="18" fill="#0F1729" stroke={INK} strokeWidth="5" />
        ))}
      </g>
      <line x1="40" y1="350" x2="880" y2="350" stroke="#2C3B5E" strokeWidth="8" />
      {/* distance ruler, measured from the nose */}
      {[0, 50, 100, 150, 200].map((m) => (
        <g key={m}>
          <line x1={260 + m * 2.9} y1="390" x2={260 + m * 2.9} y2="420" stroke={DIM} strokeWidth="4" />
          <Tag x={260 + m * 2.9} y={460} size={28} color={DIM}>{m}</Tag>
        </g>
      ))}
      <line x1="260" y1="405" x2={260 + run * 580} y2="405" stroke={CYAN} strokeWidth="8" />
      <Tag x={450} y={530} size={40} color={run > 0.98 ? CYAN : INK}>{`t = ${(run * 10).toFixed(1).replace('.', ',')} с · s = ${Math.round(run * 200)} м`}</Tag>
    </svg>
  );
};

/* 5. a 6-8-10 right triangle with the squares on its sides */
export const Pythagoras: React.FC<VisualProps> = ({ solve }) => {
  const legs = after(solve, 0.05, 0.4);
  const hyp = after(solve, 0.45, 0.75);
  const done = after(solve, 0.85, 1);
  const A = [300, 150], B = [540, 330], C = [720, 90], D = [480, -90];
  return (
    <svg viewBox="40 -130 820 740" width="100%">
      <rect x="120" y="150" width="180" height="180" fill={AMBER} opacity={0.12 + legs * 0.5} stroke={AMBER} strokeWidth="4" />
      <rect x="300" y="330" width="240" height="240" fill={VIOLET} opacity={0.12 + legs * 0.5} stroke={VIOLET} strokeWidth="4" />
      <polygon points={[A, B, C, D].map((p) => p.join(',')).join(' ')} fill={CYAN} opacity={0.08 + hyp * 0.45} stroke={CYAN} strokeWidth="4" />
      <polygon points="300,150 540,330 300,330" fill="#0F1729" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <polyline points="300,300 330,300 330,330" fill="none" stroke={INK} strokeWidth="4" />
      <Tag x={318} y={262} anchor="start" size={44}>6</Tag>
      <Tag x={430} y={318} size={44}>8</Tag>
      <Tag x={445} y={225} size={44} color={CYAN}>{done > 0.5 ? '10' : '?'}</Tag>
      <Tag x={210} y={252} size={38} color={AMBER} opacity={legs}>36</Tag>
      <Tag x={420} y={470} size={38} color={VIOLET} opacity={legs}>64</Tag>
      <Tag x={510} y={30} size={40} color={CYAN} opacity={hyp}>100</Tag>
    </svg>
  );
};

/* 6. a 2 cm cube on the scales, and which metal has that density */
export const Cube: React.FC<VisualProps> = ({ solve }) => {
  const vol = after(solve, 0.05, 0.3);
  const rho = after(solve, 0.55, 0.8);
  const pick = after(solve, 0.85, 1);
  const metals: [string, string][] = [
    ['Алюминий', '2,7'],
    ['Железо', '7,8'],
    ['Медь', '8,9'],
  ];
  return (
    <svg viewBox="0 0 900 560" width="100%">
      {/* the cube */}
      <g transform="translate(90, 120)">
        <polygon points="0,80 80,0 240,0 160,80" fill="#B9C4D6" />
        <polygon points="160,80 240,0 240,160 160,240" fill="#7D8AA3" />
        <rect x="0" y="80" width="160" height="160" fill="#A3AEC2" />
        <Tag x={80} y={290} size={32}>a = 2 см</Tag>
        <Tag x={80} y={170} size={30} color="#04101E" opacity={vol}>8 см³</Tag>
      </g>
      {/* scales */}
      <rect x="60" y="440" width="320" height="70" rx="16" fill="#0F1729" stroke="#2C3B5E" strokeWidth="5" />
      <Tag x={220} y={488} size={36} color={CYAN}>21,6 г</Tag>
      {/* densities */}
      <Tag x={660} y={70} size={34} color={rho > 0.5 ? CYAN : DIM}>{rho > 0.5 ? 'ρ = 2,7 г/см³' : 'ρ = ?'}</Tag>
      {metals.map(([name, d], i) => {
        const on = i === 0 && pick > 0.5;
        return (
          <g key={name}>
            <rect x="470" y={120 + i * 120} width="380" height="96" rx="18" fill={on ? 'rgba(57,225,255,0.18)' : '#0F1729'} stroke={on ? CYAN : '#2C3B5E'} strokeWidth="5" />
            <text x="500" y={180 + i * 120} fill={INK} fontSize="34" fontFamily={DISPLAY}>{name}</text>
            <Tag x={830} y={180 + i * 120} size={34} anchor="end" color={on ? CYAN : DIM}>{d}</Tag>
          </g>
        );
      })}
    </svg>
  );
};

/* 7. a skier on the snow: weight pressing on the area of the skis */
export const Skier: React.FC<VisualProps> = ({ solve }) => {
  const force = after(solve, 0.05, 0.3);
  const area = after(solve, 0.35, 0.6);
  const done = after(solve, 0.85, 1);
  return (
    <svg viewBox="0 0 900 560" width="100%">
      <rect x="0" y="420" width="900" height="140" fill="#E8F1FF" opacity="0.12" />
      <line x1="0" y1="420" x2="900" y2="420" stroke="#E8F1FF" strokeWidth="4" opacity="0.6" />
      {/* skis, glowing as the area comes in */}
      <rect x="170" y="396" width="560" height="22" rx="11" fill={area > 0.1 ? CYAN : INK} opacity={0.7 + area * 0.3} />
      <rect x="170" y="400" width="560" height="40" rx="11" fill={CYAN} opacity={area * 0.25} />
      <Tag x={450} y={480} size={34} color={CYAN} opacity={area}>S = 0,3 м²</Tag>
      {/* the skier */}
      <g stroke={INK} strokeWidth="14" strokeLinecap="round" fill="none">
        <line x1="450" y1="250" x2="420" y2="396" />
        <line x1="450" y1="250" x2="480" y2="396" />
        <line x1="450" y1="250" x2="450" y2="150" />
        <line x1="450" y1="180" x2="380" y2="250" />
        <line x1="450" y1="180" x2="520" y2="250" />
      </g>
      <circle cx="450" cy="115" r="34" fill={INK} />
      <Tag x={590} y={150} size={32} anchor="start">60 кг</Tag>
      {/* the weight */}
      <g opacity={force}>
        <line x1="640" y1="200" x2="640" y2="360" stroke={AMBER} strokeWidth="10" />
        <polygon points="640,384 620,346 660,346" fill={AMBER} />
        <Tag x={660} y={290} size={34} anchor="start" color={AMBER}>F = 600 Н</Tag>
      </g>
      <Tag x={450} y={60} size={42} color={done > 0.5 ? CYAN : DIM}>{done > 0.5 ? 'p = 2000 Па' : 'p = ?'}</Tag>
    </svg>
  );
};
