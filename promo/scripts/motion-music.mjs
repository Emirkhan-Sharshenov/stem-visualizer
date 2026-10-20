// Soundtracks for the third series of motion videos (royalty-free, synthesised): public/music-<name>.wav
// usage: node scripts/motion-music.mjs <trailer|slides|labs|math>
// Each track has its own tempo and chords: intro with a riser, the drop, a breakdown without drums
// (a breath before the last act), a second drop and a short outro.
import { writeFileSync } from 'node:fs';

const PRESETS = {
  // cinematic and warm: Dm – B♭ – F – C
  trailer: { bpm: 110, bars: 34, breakdown: [18, 20], chords: [[62, 65, 69], [58, 62, 65], [57, 60, 65], [55, 60, 64]], roots: [38, 34, 41, 36], seed: 3 },
  // bright, major: C – G – Am – F
  slides: { bpm: 122, bars: 24, breakdown: [12, 13], chords: [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], roots: [36, 43, 45, 41], seed: 11 },
  // energetic: Am – F – C – G
  labs: { bpm: 128, bars: 26, breakdown: [13, 14], chords: [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]], roots: [45, 41, 48, 43], seed: 7 },
  // curious, floating: Em – C – G – D
  math: { bpm: 118, bars: 24, breakdown: [12, 13], chords: [[64, 67, 71], [60, 64, 67], [62, 67, 71], [62, 66, 69]], roots: [40, 36, 43, 38], seed: 5 },
};
const NAME = process.argv[2] || 'trailer';
const P = PRESETS[NAME];
const SR = 44100;
const BPM = P.bpm;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS = P.bars;
const LEN = Math.ceil((BARS * BAR + 2.5) * SR);
const L = new Float32Array(LEN);
const R = new Float32Array(LEN);

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = P.seed;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(t0, buf, gain = 1, pan = 0) {
  const s = Math.floor(t0 * SR);
  const gl = gain * Math.min(1, 1 - pan);
  const gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && s + i < LEN; i++) {
    if (s + i < 0) continue;
    L[s + i] += buf[i] * gl;
    R[s + i] += buf[i] * gr;
  }
}

/* ---------- instruments ---------- */

function kick() {
  const n = Math.floor(0.45 * SR);
  const b = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 48 + 120 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    b[i] = Math.sin(ph) * Math.exp(-t * 7) + (t < 0.004 ? rnd() * 0.4 : 0);
  }
  return b;
}

function clap() {
  const n = Math.floor(0.3 * SR);
  const b = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const burst = t < 0.03 ? 0.6 + 0.4 * Math.sin(t * 900) : 1;
    const x = rnd();
    lp += 0.45 * (x - lp);
    b[i] = (x - lp) * Math.exp(-t * 18) * burst;
  }
  return b;
}

function hat(open = false) {
  const n = Math.floor((open ? 0.25 : 0.06) * SR);
  const b = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = rnd();
    b[i] = (x - prev) * Math.exp(-t * (open ? 14 : 60));
    prev = x;
  }
  return b;
}

/** detuned saw pad with a slow low-pass filter */
function pad(notes, dur, bright = 0.08) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  const phs = notes.flatMap(() => [0, 0, 0]);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    notes.forEach((m, k) => {
      [-0.12, 0, 0.12].forEach((d, j) => {
        const idx = k * 3 + j;
        phs[idx] = (phs[idx] + midi(m + d) / SR) % 1;
        s += phs[idx] * 2 - 1;
      });
    });
    s /= notes.length * 3;
    lp += bright * (s - lp);
    const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.4);
    b[i] = lp * env;
  }
  return b;
}

function bass(m, dur) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph = (ph + midi(m) / SR) % 1;
    const saw = ph * 2 - 1;
    const sub = Math.sin(ph * 2 * Math.PI);
    lp += 0.06 * (saw - lp);
    b[i] = (lp * 0.6 + sub * 0.7) * Math.min(1, t / 0.005) * Math.exp(-t * 3) * Math.min(1, (dur - t) / 0.01);
  }
  return b;
}

function pluck(m, dur = 0.3) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph = (ph + midi(m) / SR) % 1;
    const tri = 1 - 4 * Math.abs(ph - 0.5);
    const sq = ph < 0.5 ? 1 : -1;
    b[i] = (tri * 0.7 + sq * 0.15 * Math.exp(-t * 30)) * Math.exp(-t * 9);
  }
  return b;
}

function riser(dur) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const x = rnd();
    lp += (0.02 + 0.5 * k * k) * (x - lp);
    b[i] = lp * k * k;
  }
  return b;
}

function impact() {
  const n = Math.floor(2.2 * SR);
  const b = new Float32Array(n);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (35 + 60 * Math.exp(-t * 6))) / SR;
    const x = rnd();
    lp += 0.2 * (x - lp);
    b[i] = Math.sin(ph) * Math.exp(-t * 2.2) * 0.9 + lp * Math.exp(-t * 3.5) * 0.5;
  }
  return b;
}

/* ---------- arrangement ---------- */

const CHORDS = P.chords;
const ROOTS = P.roots;
const K = kick();
const CL = clap();
const HC = hat();
const HO = hat(true);
const [B0, B1] = P.breakdown;

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const ci = bar % 4;
  const intro = bar < 1;
  const brk = bar >= B0 && bar <= B1;
  const outro = bar >= BARS - 1;
  const drums = !intro && !brk && !outro;
  add(t0, pad(CHORDS[ci].map((n) => n + 12), BAR + 0.3, intro ? 0.035 : 0.07), intro ? 0.22 : brk ? 0.32 : outro ? 0.25 : 0.2, 0);
  const notes = [...CHORDS[ci], CHORDS[ci][0] + 12].map((n) => n + 12);
  for (let st = 0; st < 16; st++) {
    if ((outro || brk) && st % 2) continue;
    const vel = intro ? 0.07 : brk ? 0.09 : 0.11;
    add(t0 + st * (BEAT / 4), pluck(notes[(st * 3) % 4] + (st % 8 === 7 ? 12 : 0)), vel, st % 2 ? 0.35 : -0.35);
  }
  if (drums) {
    for (let bt = 0; bt < 4; bt++) {
      add(t0 + bt * BEAT, K, 0.95);
      if (bt % 2 === 1) add(t0 + bt * BEAT, CL, 0.32);
      for (let h = 0; h < 4; h++) add(t0 + bt * BEAT + h * (BEAT / 4), HC, h === 2 ? 0.18 : 0.09, 0.2);
      add(t0 + bt * BEAT + BEAT / 2, HO, 0.07, -0.2);
      add(t0 + bt * BEAT + BEAT / 2, bass(ROOTS[ci], BEAT / 2 - 0.01), 0.55);
      add(t0 + bt * BEAT + BEAT * 0.75, bass(ROOTS[ci] + (bt === 3 ? 12 : 0), BEAT / 4 - 0.01), 0.35);
    }
  }
}

// intro riser into the first drop, a second riser at the end of the breakdown
add(0, riser(BAR), 0.5);
for (let i = 0; i < 8; i++) add(BAR / 2 + i * (BAR / 16), CL, 0.08 + (i / 8) * 0.25);
add(BAR, impact(), 0.9);
add(B1 * BAR, riser(BAR), 0.55);
for (let i = 0; i < 16; i++) add(B1 * BAR + i * (BAR / 16), CL, 0.05 + (i / 16) * 0.3);
add((B1 + 1) * BAR, impact(), 0.9);
add((BARS - 1) * BAR, impact(), 0.7);
for (const fb of [4, 8, 12, 16, 24, 28]) if (fb < B0 - 1 || (fb > B1 + 1 && fb < BARS - 2)) for (let i = 0; i < 8; i++) add(fb * BAR - BAR / 2 + i * (BAR / 16), CL, 0.13);

/* ---------- master: soft clip + normalise + 16-bit WAV ---------- */

let peak = 0;
for (let i = 0; i < LEN; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.92 / peak;
const data = Buffer.alloc(LEN * 4);
for (let i = 0; i < LEN; i++) {
  const fade = Math.min(1, (LEN - i) / (SR * 1.2));
  data.writeInt16LE(Math.round(L[i] * gain * fade * 32767), i * 4);
  data.writeInt16LE(Math.round(R[i] * gain * fade * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);
writeFileSync(new URL(`../public/music-${NAME}.wav`, import.meta.url), Buffer.concat([header, data]));
console.log(`music-${NAME}.wav: ${(LEN / SR).toFixed(1)} s, bar = ${BAR.toFixed(3)} s`);
