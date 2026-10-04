// Generates the promo soundtrack (royalty-free, synthesised from scratch): public/music.wav
// 128 BPM, A minor, 16 bars ≈ 30 s. Intro (bars 0–3) → drop at bar 4 → outro hit at bar 14.
import { writeFileSync } from 'node:fs';

const SR = 44100;
const BPM = 128;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS = 16;
const LEN = Math.ceil((BARS * BAR + 1.5) * SR);
const L = new Float32Array(LEN);
const R = new Float32Array(LEN);

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = 7;
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

// Am – F – C – G (A minor)
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [55, 60, 64],
  [55, 59, 62],
];
const ROOTS = [45, 41, 48, 43];
const K = kick();
const CL = clap();
const HC = hat();
const HO = hat(true);

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const ci = bar % 4;
  const main = bar >= 4 && bar < 14;
  const outro = bar >= 14;
  // pads: quiet and dark in the intro, brighter after the drop
  add(t0, pad(CHORDS[ci].map((n) => n + 12), BAR + 0.3, bar < 4 ? 0.035 : 0.07), bar < 4 ? 0.22 : outro ? 0.25 : 0.2, 0);
  // arpeggio
  if (bar >= 2) {
    const notes = [...CHORDS[ci], CHORDS[ci][0] + 12].map((n) => n + 12);
    for (let s = 0; s < 16; s++) {
      if (outro && bar === 15 && s > 8) break;
      const vel = bar < 4 ? 0.06 + 0.02 * (bar - 2) : 0.11;
      add(t0 + s * (BEAT / 4), pluck(notes[(s * 3) % 4] + (s % 8 === 7 ? 12 : 0)), vel, s % 2 ? 0.35 : -0.35);
    }
  }
  if (main) {
    for (let b = 0; b < 4; b++) {
      add(t0 + b * BEAT, K, 0.95);
      if (b % 2 === 1) add(t0 + b * BEAT, CL, 0.32);
      for (let h = 0; h < 4; h++) add(t0 + b * BEAT + h * (BEAT / 4), HC, h === 2 ? 0.18 : 0.09, 0.2);
      add(t0 + b * BEAT + BEAT / 2, HO, 0.07, -0.2);
      // pumping bass on the off-eighths
      add(t0 + b * BEAT + BEAT / 2, bass(ROOTS[ci], BEAT / 2 - 0.01), 0.55);
      add(t0 + b * BEAT + BEAT * 0.75, bass(ROOTS[ci] + (b === 3 ? 12 : 0), BEAT / 4 - 0.01), 0.35);
    }
  }
}

// build-up into the drop (bars 2–3): riser + snare roll
add(2 * BAR, riser(2 * BAR), 0.5);
for (let i = 0; i < 16; i++) add(3 * BAR + i * (BAR / 16), CL, 0.08 + (i / 16) * 0.25);
add(4 * BAR, impact(), 0.9);
// small fill before the stats section and the final hit
for (let i = 0; i < 8; i++) add(11 * BAR + BAR / 2 + i * (BAR / 16), CL, 0.15);
add(14 * BAR, impact(), 0.85);
add(14 * BAR, K, 1);

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
writeFileSync(new URL('../public/music.wav', import.meta.url), Buffer.concat([header, data]));
console.log(`music.wav: ${(LEN / SR).toFixed(1)} s, bar = ${BAR.toFixed(3)} s`);
