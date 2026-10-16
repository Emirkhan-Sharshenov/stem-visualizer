import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Backdrop, COL, LogoMark, SANS, SERIF, useFonts } from './ui';
import reels from './reels.json';
import voIndex from '../public/vo2/index.json';
import titr from '../public/rec/titr/manifest.json';
import efield from '../public/rec/efield/manifest.json';
import waves from '../public/rec/waves/manifest.json';
import atom from '../public/rec/atom/manifest.json';
import kin from '../public/rec/kin/manifest.json';
import sel from '../public/rec/sel/manifest.json';
import photo from '../public/rec/photo/manifest.json';
import mentor from '../public/rec/mentor/manifest.json';
import formulas from '../public/rec/formulas/manifest.json';
import labs from '../public/rec/labs/manifest.json';
import chem from '../public/rec/chem/manifest.json';
import space from '../public/rec/space/manifest.json';

/* Second series of reels: a voiced montage of real screen recordings. Every line of the voiceover
   is one shot; cuts land on the beat of public/music-reel.wav, captions light up word by word. */

interface Manifest {
  name: string;
  frames: number;
  w: number;
  taps: { f: number; x: number; y: number; kind: string }[];
  marks: Record<string, number>;
}
interface Beat {
  rec?: string;
  at?: string;
  offset?: number;
  speed?: number;
  say: string;
  hl?: string[];
  badge?: string;
  sfx?: [string, number][];
  countdown?: boolean;
  minDur?: number;
  cta?: string;
}
interface ReelSpec {
  color: string;
  color2: string;
  tag: string;
  beats: Beat[];
}
interface VoLine {
  lead: number;
  len: number;
  words: { w: string; s: number; e: number }[];
}

const RECS: Record<string, Manifest> = { titr, efield, waves, atom, kin, sel, photo, mentor, formulas, labs, chem, space } as unknown as Record<string, Manifest>;
const SPECS = (reels as unknown as { reels: Record<string, ReelSpec> }).reels;
const VO = voIndex as unknown as Record<string, VoLine[]>;

export const REEL_IDS = Object.keys(SPECS);
const BEAT = (60 / 128) * 30; // frames per beat of the soundtrack
const VOICE_IN = 3;

/** shot start frames and lengths, cut on the beat */
export function timeline(id: string) {
  const spec = SPECS[id];
  const vo = VO[id] ?? [];
  let beats = 0;
  const shots = spec.beats.map((b, i) => {
    const len = vo[i]?.len ?? 60;
    const want = b.cta ? Math.max(len + 24, 96) : Math.max(b.minDur ?? 0, len + VOICE_IN + 8);
    const n = Math.max(2, Math.ceil(want / BEAT));
    const from = Math.round(beats * BEAT);
    beats += n;
    return { from, dur: Math.round(beats * BEAT) - from, beat: b, vo: vo[i] };
  });
  return { shots, total: Math.round(beats * BEAT) };
}

export const reelLength = (id: string) => timeline(id).total;

/* ---------- phone with the recording ---------- */

const PW = 860;
const PH = Math.round((PW * 1920) / 1080);
const PX = (1080 - PW) / 2;
const PY = 210;

const Phone: React.FC<{ beat: Beat; index: number; dur: number; color: string; dim?: number }> = ({ beat, index, dur, color, dim = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rec = RECS[beat.rec!];
  const start = (rec.marks[beat.at ?? 'start'] ?? 0) + (beat.offset ?? 0);
  const speed = beat.speed ?? 1;
  const rf = Math.max(0, Math.min(rec.frames - 1, Math.round(start + f * speed)));
  // every cut punches in from a slight tilt, then drifts slowly
  const enter = spring({ frame: f, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
  const side = index % 2 ? -1 : 1;
  const rotY = (1 - enter) * 10 * side + Math.sin(f / 40) * 1.2;
  const rotX = (1 - enter) * -4 + Math.cos(f / 50) * 0.8;
  const scale = 1.07 - 0.07 * enter + (f / dur) * 0.035;
  const k = PW / (rec.w * 2.5);
  return (
    <div style={{ position: 'absolute', left: PX, top: PY, width: PW, height: PH, perspective: 2400 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
          borderRadius: 66,
          overflow: 'hidden',
          border: '10px solid #15171C',
          boxShadow: `0 60px 160px rgba(0,0,0,0.75), 0 0 180px ${color}55`,
          background: '#fff',
          position: 'relative',
        }}
      >
        <Img src={staticFile(`rec/${rec.name}/${String(rf).padStart(5, '0')}.jpg`)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {rec.taps
          .filter((t) => t.kind === 'tap' && rf >= t.f - 4 && rf < t.f + 20)
          .map((t, i) => {
            const d = rf - t.f;
            const ripple = interpolate(d, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const dot = interpolate(d, [-4, 0, 8, 18], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const x = t.x * 2.5 * k;
            const y = t.y * 2.5 * k;
            return (
              <div key={i}>
                <div style={{ position: 'absolute', left: x - 75, top: y - 75, width: 150, height: 150, borderRadius: 99, border: `7px solid ${color}`, transform: `scale(${0.3 + ripple})`, opacity: (1 - ripple) * 0.9 }} />
                <div style={{ position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: 99, background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 18px rgba(0,0,0,0.35)', opacity: dot }} />
              </div>
            );
          })}
        {(() => {
          const near = rec.taps.filter((t) => (t.kind === 'move' || t.kind === 'down') && Math.abs(t.f - rf) <= 1);
          if (!near.length) return null;
          const t = near[near.length - 1];
          return <div style={{ position: 'absolute', left: t.x * 2.5 * k - 28, top: t.y * 2.5 * k - 28, width: 56, height: 56, borderRadius: 99, background: 'rgba(255,255,255,0.9)', boxShadow: `0 0 0 10px ${color}66` }} />;
        })()}
        {dim > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(8,9,12,${dim})` }} />}
      </div>
    </div>
  );
};

/** taps inside a shot become little pops on the soundtrack */
const TapSounds: React.FC<{ beat: Beat; dur: number }> = ({ beat, dur }) => {
  const rec = RECS[beat.rec!];
  const start = (rec.marks[beat.at ?? 'start'] ?? 0) + (beat.offset ?? 0);
  const speed = beat.speed ?? 1;
  if (!speed) return null;
  const at = rec.taps.filter((t) => t.kind === 'tap' || t.kind === 'down').map((t) => Math.round((t.f - start) / speed)).filter((f) => f >= 0 && f < dur - 2);
  return (
    <>
      {at.map((f, i) => (
        <Sequence key={i} from={f} durationInFrames={8} layout="none">
          <Audio src={staticFile('sfx/pop.wav')} volume={0.32} />
        </Sequence>
      ))}
    </>
  );
};

/* ---------- captions: two or three words at a time, the spoken word lit up ---------- */

function chunks(say: string, words: VoLine['words']) {
  // map the TTS word timings back onto the written words (keeps punctuation and dashes)
  const tokens = say.split(/\s+/).filter(Boolean);
  const timed: { text: string; s: number; e: number }[] = [];
  let wi = 0;
  for (const tok of tokens) {
    if (!/[\p{L}\p{N}]/u.test(tok) || wi >= words.length) {
      if (timed.length) timed[timed.length - 1].text += ' ' + tok;
      continue;
    }
    timed.push({ text: tok, s: words[wi].s, e: words[wi].e });
    wi++;
  }
  const out: (typeof timed)[] = [];
  let cur: typeof timed = [];
  for (const t of timed) {
    cur.push(t);
    const len = cur.reduce((n, x) => n + x.text.length, 0);
    if (cur.length >= 3 || len > 16 || /[.,!?…:—]$/.test(t.text)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

const Captions: React.FC<{ beat: Beat; vo: VoLine; color: string }> = ({ beat, vo, color }) => {
  const f = useCurrentFrame() - VOICE_IN;
  const { fps } = useVideoConfig();
  const groups = chunks(beat.say, vo.words);
  const idx = groups.findIndex((g, i) => f >= g[0].s - 2 && (i === groups.length - 1 || f < groups[i + 1][0].s - 2));
  if (idx < 0) return null;
  const g = groups[idx];
  const pop = spring({ frame: f - (g[0].s - 2), fps, config: { damping: 13, stiffness: 220, mass: 0.5 } });
  const hl = (w: string) => (beat.hl ?? []).some((h) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').startsWith(h.toLowerCase()));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1300, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 34px', transform: `scale(${0.85 + 0.15 * pop})`, opacity: Math.min(1, pop * 1.5) }}>
      {g.map((w, i) => {
        const on = f >= w.s - 1;
        const speaking = f >= w.s - 1 && f < w.e + 2;
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 84,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: hl(w.text) ? '#FFD60A' : '#FFFFFF',
              opacity: on ? 1 : 0.55,
              WebkitTextStroke: '14px #0A0B0F',
              paintOrder: 'stroke fill',
              textShadow: speaking ? `0 0 30px ${color}` : '0 6px 24px rgba(0,0,0,0.5)',
              transform: speaking ? 'translateY(-4px) scale(1.06)' : 'none',
              display: 'inline-block',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- stickers, countdown, outro ---------- */

const Badge: React.FC<{ text: string; color: string; index: number }> = ({ text, color, index }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 10, fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
  const side = index % 2 ? 1 : -1;
  return (
    <div
      style={{
        position: 'absolute',
        top: 300,
        [side > 0 ? 'right' : 'left']: 40,
        padding: '18px 34px',
        borderRadius: 28,
        background: '#FFFFFF',
        color: '#0A0B0F',
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: 64,
        letterSpacing: '-0.02em',
        boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 0 8px ${color}`,
        transform: `rotate(${side * 5}deg) scale(${s})`,
        transformOrigin: side > 0 ? 'right center' : 'left center',
      }}
    >
      {text}
    </div>
  );
};

const Countdown: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = 3 - Math.floor((f - 20) / 26);
  if (f < 20 || n < 1) return null;
  const local = (f - 20) % 26;
  const s = spring({ frame: local, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 260, height: 260, borderRadius: 999, background: 'rgba(10,11,15,0.82)', border: `10px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, fontFamily: SANS, fontWeight: 900, fontSize: 170, color: '#fff' }}>{n}</div>
    </div>
  );
};

const Cta: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: f - d, fps, config: { damping: 13, stiffness: 130 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44, background: `rgba(8,9,12,${Math.min(0.8, f / 12)})` }}>
      <div style={{ transform: `scale(${p(0)}) rotate(${(1 - p(0)) * -20}deg)` }}>
        <LogoMark size={200} draw={Math.min(1, f / 22)} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 104, color: COL.ink, letterSpacing: '-0.02em', textAlign: 'center', padding: '0 60px', lineHeight: 1.05, opacity: p(8), transform: `translateY(${(1 - p(8)) * 50}px)` }}>{text}</div>
      <div style={{ padding: '20px 44px', borderRadius: 999, background: '#5FD39A', color: '#08210F', fontFamily: SANS, fontWeight: 900, fontSize: 54, opacity: p(18), transform: `scale(${p(18)})` }}>Бесплатно</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: COL.accent2, opacity: p(26) }}>stem-visualizer.pages.dev</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, color: '#C9CFDB', opacity: p(32), transform: `translateY(${Math.sin(f / 6) * 6}px)` }}>Ссылка в профиле ↑</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: color }} />
    </AbsoluteFill>
  );
};

/* ---------- the reel ---------- */

export const Reel2: React.FC<{ id: string }> = ({ id }) => {
  useFonts();
  const f = useCurrentFrame();
  const spec = SPECS[id];
  const { shots, total } = timeline(id);
  const music = (fr: number) => {
    const duck = shots.reduce((m, s) => {
      if (!s.vo) return m;
      const a = s.from + VOICE_IN;
      const b = a + s.vo.len;
      return Math.max(m, interpolate(fr, [a - 6, a, b, b + 8], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    }, 0);
    const fade = interpolate(fr, [0, 6, total - 36, total], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return fade * (0.36 - 0.24 * duck);
  };
  const lastFootage = [...shots].reverse().find((s) => s.beat.rec);
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Backdrop hue={spec.color} hue2={spec.color2} strength={1} />
      <Audio src={staticFile('music-reel.wav')} volume={music} />

      {shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          {s.beat.rec ? (
            <>
              <Phone beat={s.beat} index={i} dur={s.dur} color={spec.color} />
              {!s.beat.countdown && <TapSounds beat={s.beat} dur={s.dur} />}
            </>
          ) : (
            lastFootage && (
              <>
                <Sequence from={-1000} layout="none">
                  <Phone beat={{ ...lastFootage.beat, speed: 0, offset: (lastFootage.beat.offset ?? 0) + lastFootage.dur }} index={i} dur={s.dur} color={spec.color} dim={0.3} />
                </Sequence>
                <Cta text={s.beat.cta!} color={spec.color} />
              </>
            )
          )}
          {/* white flash on the cut */}
          {i > 0 && <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f - s.from, [0, 1, 5], [0.35, 0.25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), pointerEvents: 'none' }} />}
          {s.beat.badge && <Badge text={s.beat.badge} color={spec.color} index={i} />}
          {s.beat.countdown && <Countdown color={spec.color} />}
          {s.beat.countdown && [20, 46, 72].map((t) => (
            <Sequence key={t} from={t} durationInFrames={6} layout="none">
              <Audio src={staticFile('sfx/tick.wav')} volume={0.7} />
            </Sequence>
          ))}
          {s.vo && (
            <Sequence from={VOICE_IN} durationInFrames={s.vo.len + 6} layout="none">
              <Audio src={staticFile(`vo2/${id}-${i}.mp3`)} startFrom={s.vo.lead} volume={1} />
            </Sequence>
          )}
          {s.vo && !s.beat.cta && <Captions beat={s.beat} vo={s.vo} color={spec.color} />}
          {i > 0 && (
            <Sequence from={-2} durationInFrames={14} layout="none">
              <Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} />
            </Sequence>
          )}
          {s.beat.badge && (
            <Sequence from={10} durationInFrames={8} layout="none">
              <Audio src={staticFile('sfx/pop.wav')} volume={0.5} />
            </Sequence>
          )}
          {(s.beat.sfx ?? []).map(([name, at], k) => (
            <Sequence key={k} from={at} durationInFrames={40} layout="none">
              <Audio src={staticFile(`sfx/${name}.wav`)} volume={name === 'impact' ? 0.75 : 0.6} />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {/* top: brand + subject tag, and a progress bar that keeps people watching */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 10, background: 'rgba(255,255,255,0.12)' }}>
        <div style={{ height: '100%', width: `${(f / total) * 100}%`, background: spec.color }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <LogoMark size={56} />
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#EDEFF7' }}>STEM Visualizer</span>
        <span style={{ marginLeft: 6, padding: '8px 20px', borderRadius: 999, background: spec.color, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30 }}>{spec.tag}</span>
      </div>
    </AbsoluteFill>
  );
};
