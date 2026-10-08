import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Backdrop, COL, LogoMark, SANS, useFonts } from './ui';

/* Logo intro (4 s): particles in the three subject colours spiral in, a wireframe cube spins up
   and lands as the logo on the beat, then the wordmark and tagline. Sound: public/sting.wav
   (scripts/sting.mjs), whose impact lands on IMPACT. */

export const INTRO_LEN = 120;
const IMPACT = 42;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;

const PALETTE = [COL.physics, COL.chemistry, COL.biology, COL.accent2, '#FFFFFF'];
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const PARTICLES = Array.from({ length: 46 }, (_, i) => ({
  angle: rnd() * Math.PI * 2,
  dist: 0.75 + rnd() * 0.6,
  delay: rnd() * 14,
  size: 5 + rnd() * 9,
  color: PALETTE[i % PALETTE.length],
  spin: 1.4 + rnd() * 1.6,
}));

const Particles: React.FC<{ u: number }> = ({ u }) => {
  const f = useCurrentFrame();
  return (
    <>
      {PARTICLES.map((p, i) => {
        const t = interpolate(f, [p.delay, IMPACT - 2], [0, 1], clamp);
        const e = easeIn(t);
        const r = p.dist * u * (1 - e);
        const a = p.angle + p.spin * e;
        const op = interpolate(t, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);
        // short streak pointing along the motion
        const len = p.size * (1 + 5 * e);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.cos(a) * r,
              top: Math.sin(a) * r,
              width: len,
              height: p.size,
              marginLeft: -len / 2,
              marginTop: -p.size / 2,
              borderRadius: 99,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transform: `rotate(${a + Math.PI / 2 + 0.6}rad)`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};

/** wireframe cube spinning towards the logo's angle */
const Cube: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, IMPACT], [0, 1], clamp);
  const e = easeOut(t);
  const rx = -24 + (1 - e) * 540;
  const ry = -36 + (1 - e) * 720;
  const scale = interpolate(f, [0, IMPACT], [0.15, 1], { ...clamp, easing: easeOut });
  const op = interpolate(f, [0, 6, IMPACT, IMPACT + 5], [0, 1, 1, 0], clamp);
  const face = (transform: string) => (
    <div
      style={{
        position: 'absolute',
        width: s,
        height: s,
        left: -s / 2,
        top: -s / 2,
        border: `${Math.max(3, s * 0.045)}px solid #fff`,
        borderRadius: s * 0.04,
        background: 'rgba(47,91,255,0.16)',
        boxShadow: `0 0 ${s * 0.25}px ${COL.accent}AA, inset 0 0 ${s * 0.2}px ${COL.accent}88`,
        transform,
      }}
    />
  );
  return (
    <div style={{ position: 'absolute', perspective: s * 6, opacity: op }}>
      <div style={{ transformStyle: 'preserve-3d', transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {face(`translateZ(${s / 2}px)`)}
        {face(`rotateY(180deg) translateZ(${s / 2}px)`)}
        {face(`rotateY(90deg) translateZ(${s / 2}px)`)}
        {face(`rotateY(-90deg) translateZ(${s / 2}px)`)}
        {face(`rotateX(90deg) translateZ(${s / 2}px)`)}
        {face(`rotateX(-90deg) translateZ(${s / 2}px)`)}
      </div>
    </div>
  );
};

const Word: React.FC<{ text: string; from: number; size: number; color?: string; weight?: number }> = ({ text, from, size, color = COL.ink, weight = 800 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: 'inline-flex' }}>
      {[...text].map((ch, i) => {
        const s = spring({ frame: f - from - i * 1.6, fps, config: { damping: 15, stiffness: 170, mass: 0.6 } });
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.1 }}>
            <span style={{ display: 'inline-block', fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: '-0.035em', color, transform: `translateY(${(1 - s) * 105}%)`, opacity: s }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const Intro: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const u = Math.min(width, height);
  const tile = u * 0.3;
  const cy = height / 2 - u * 0.1;

  const pop = spring({ frame: f - IMPACT, fps, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const shake = f >= IMPACT && f < IMPACT + 8 ? Math.sin((f - IMPACT) * 2.6) * (1 - (f - IMPACT) / 8) * u * 0.008 : 0;
  const flash = interpolate(f, [IMPACT, IMPACT + 2, IMPACT + 14], [0, 0.4, 0], clamp);
  const ring = interpolate(f, [IMPACT, IMPACT + 26], [0, 1], { ...clamp, easing: easeOut });
  const ring2 = interpolate(f, [IMPACT + 4, IMPACT + 34], [0, 1], { ...clamp, easing: easeOut });
  const glint = interpolate(f, [IMPACT + 14, IMPACT + 32], [-1.2, 1.2], clamp);
  const orbit = interpolate(f, [IMPACT + 4, IMPACT + 24], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [INTRO_LEN - 10, INTRO_LEN], [1, 0], clamp);
  const drift = 1 + interpolate(f, [IMPACT, INTRO_LEN], [0, 0.04], clamp);
  const bgGlow = interpolate(f, [0, IMPACT, IMPACT + 20], [0.25, 0.5, 1], clamp);

  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Audio src={staticFile('sting.wav')} />
      <div style={{ position: 'absolute', inset: 0, opacity: bgGlow }}>
        <Backdrop hue={COL.accent} hue2="#8E4EC6" strength={1} />
      </div>

      <AbsoluteFill style={{ opacity: out, transform: `translate(${shake}px, ${shake * 0.6}px) scale(${drift})` }}>
        {/* everything centred on the logo */}
        <div style={{ position: 'absolute', left: width / 2, top: cy }}>
          <Particles u={u} />

          {/* shock waves */}
          {[ring, ring2].map((r, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: tile * 3.2,
                height: tile * 3.2,
                left: (-tile * 3.2) / 2,
                top: (-tile * 3.2) / 2,
                borderRadius: '50%',
                border: `${u * 0.006}px solid ${i ? COL.chemistry : COL.accent2}`,
                transform: `scale(${0.2 + r})`,
                opacity: r > 0 ? (1 - r) * 0.8 : 0,
              }}
            />
          ))}

          {/* electron orbits around the logo */}
          {[0, 60, -60].map((rot, i) => (
            <div key={i} style={{ position: 'absolute', transform: `rotate(${rot + f * 0.6}deg)`, opacity: orbit * 0.55 }}>
              <div
                style={{
                  position: 'absolute',
                  width: tile * 2.1 * orbit,
                  height: tile * 0.72 * orbit,
                  left: (-tile * 2.1 * orbit) / 2,
                  top: (-tile * 0.72 * orbit) / 2,
                  borderRadius: '50%',
                  border: `${u * 0.003}px solid ${[COL.physics, COL.chemistry, COL.biology][i]}`,
                }}
              />
              {/* electron */}
              <div
                style={{
                  position: 'absolute',
                  width: u * 0.018,
                  height: u * 0.018,
                  borderRadius: 99,
                  background: [COL.physics, COL.chemistry, COL.biology][i],
                  boxShadow: `0 0 ${u * 0.03}px ${[COL.physics, COL.chemistry, COL.biology][i]}`,
                  left: Math.cos(f / 9 + i * 2.1) * tile * 1.05 * orbit - u * 0.009,
                  top: Math.sin(f / 9 + i * 2.1) * tile * 0.36 * orbit - u * 0.009,
                }}
              />
            </div>
          ))}

          <Cube s={tile * 0.5} />

          {/* the logo tile */}
          <div
            style={{
              position: 'absolute',
              width: tile,
              height: tile,
              left: -tile / 2,
              top: -tile / 2,
              transform: `scale(${pop})`,
              borderRadius: tile * 0.22,
              overflow: 'hidden',
              boxShadow: `0 ${tile * 0.12}px ${tile * 0.5}px rgba(0,0,0,0.55), 0 0 ${tile * 0.6 * pop}px ${COL.accent}99`,
            }}
          >
            <LogoMark size={tile} draw={interpolate(f, [IMPACT, IMPACT + 18], [0, 1], clamp)} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.65) 50%, transparent 65%)',
                transform: `translateX(${glint * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* wordmark and tagline */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: cy + tile * 0.5 + u * 0.09, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u * 0.025 }}>
          <div style={{ display: 'flex', gap: u * 0.025, alignItems: 'baseline' }}>
            <Word text="STEM" from={IMPACT + 8} size={u * 0.105} />
            <Word text="Visualizer" from={IMPACT + 14} size={u * 0.105} color={COL.accent2} weight={700} />
          </div>
          <div style={{ display: 'flex', gap: u * 0.035, fontFamily: SANS, fontWeight: 600, fontSize: u * 0.04, color: '#C9CFDB' }}>
            {[
              ['Физика', COL.physics],
              ['Химия', COL.chemistry],
              ['Биология', COL.biology],
            ].map(([name, color], i) => {
              const s = spring({ frame: f - IMPACT - 34 - i * 5, fps, config: { damping: 16, stiffness: 140 } });
              return (
                <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: u * 0.013, opacity: s, transform: `translateY(${(1 - s) * u * 0.03}px)` }}>
                  <span style={{ width: u * 0.016, height: u * 0.016, borderRadius: 99, background: color, boxShadow: `0 0 ${u * 0.02}px ${color}` }} />
                  {name}
                </span>
              );
            })}
          </div>
        </div>

        {/* white flash on impact */}
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
