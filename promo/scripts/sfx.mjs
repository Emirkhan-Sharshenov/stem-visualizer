// Synthesises the editing sound effects (royalty-free) into public/sfx/*.wav:
// whoosh (cuts), pop (taps), impact (big moments), tick (countdown), ding (reveal).
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 44100;
let seed = 5;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function wav(name, ch) {
  const n = ch[0].length;
  let peak = 0;
  for (const c of ch) for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(c[i]));
  const gain = 0.9 / (peak || 1);
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(ch[0][i] * gain * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(ch[1][i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(`../public/sfx/${name}.wav`, import.meta.url), buf);
}

const make = (sec, fn) => {
  const n = Math.floor(sec * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [l, r] = fn(i / SR, i / n);
    L[i] = l;
    R[i] = r;
  }
  return [L, R];
};

mkdirSync(new URL('../public/sfx/', import.meta.url), { recursive: true });

// whoosh: band-passed noise sweeping up then down, panning across
{
  let lp1 = 0;
  let lp2 = 0;
  wav(
    'whoosh',
    make(0.45, (t, k) => {
      const env = Math.sin(Math.PI * Math.min(1, k * 1.15)) ** 2;
      const cut = 0.03 + 0.35 * Math.sin(Math.PI * k);
      const x = rnd();
      lp1 += cut * (x - lp1);
      lp2 += cut * 0.5 * (lp1 - lp2);
      const s = (lp1 - lp2) * env * 2.2;
      return [s * (1 - k * 0.7), s * (0.3 + k * 0.7)];
    }),
  );
}

// pop: a short pitched blip for taps
wav(
  'pop',
  make(0.12, (t) => {
    const f = 900 * Math.exp(-t * 25) + 300;
    const s = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 45);
    return [s, s];
  }),
);

// impact: sub drop + noise burst
{
  let ph = 0;
  let lp = 0;
  wav(
    'impact',
    make(1.4, (t) => {
      ph += (2 * Math.PI * (40 + 110 * Math.exp(-t * 14))) / SR;
      lp += 0.25 * (rnd() - lp);
      const s = Math.tanh(1.8 * Math.sin(ph)) * Math.exp(-t * 3) + lp * Math.exp(-t * 9) * 0.8;
      return [s, s];
    }),
  );
}

// tick: woodblock-like click for the countdown
wav(
  'tick',
  make(0.09, (t) => {
    const s = (Math.sin(2 * Math.PI * 1800 * t) + 0.5 * Math.sin(2 * Math.PI * 2700 * t)) * Math.exp(-t * 70);
    return [s, s];
  }),
);

// ding: bright two-note chime for a reveal
wav(
  'ding',
  make(1.2, (t) => {
    const a = Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 4);
    const b = t > 0.09 ? Math.sin(2 * Math.PI * 1975.5 * (t - 0.09)) * Math.exp(-(t - 0.09) * 4) : 0;
    const s = (a + b * 0.8) * Math.min(1, t / 0.002);
    return [s, s * 0.95];
  }),
);

console.log('sfx: whoosh, pop, impact, tick, ding');
