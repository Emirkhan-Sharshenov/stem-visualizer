// Synthesises the logo-intro sound (royalty-free): public/sting.wav
// Riser → impact on frame 42 (1.4 s, IMPACT in src/Intro.tsx) → bell notes under the wordmark and tagline.
import { writeFileSync } from 'node:fs';

const SR = 44100;
const LEN = Math.ceil(4.1 * SR);
const L = new Float32Array(LEN);
const R = new Float32Array(LEN);
const HIT = 42 / 30;

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = 3;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(t0, buf, gain = 1, pan = 0) {
  const s = Math.floor(t0 * SR);
  for (let i = 0; i < buf.length && s + i < LEN; i++) {
    if (s + i < 0) continue;
    L[s + i] += buf[i] * gain * Math.min(1, 1 - pan);
    R[s + i] += buf[i] * gain * Math.min(1, 1 + pan);
  }
}

// rising filtered noise plus a pitch sweep, ending right at the hit
function riser() {
  const n = Math.floor(HIT * SR);
  const b = new Float32Array(n);
  let lp = 0;
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const cut = 0.02 + 0.5 * t * t;
    lp += cut * (rnd() - lp);
    ph += (2 * Math.PI * (180 + 900 * t * t)) / SR;
    b[i] = (lp * 1.6 + Math.sin(ph) * 0.18) * Math.pow(t, 2.2);
  }
  return b;
}

function boom() {
  const n = Math.floor(2.2 * SR);
  const b = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (44 + 110 * Math.exp(-t * 18))) / SR;
    b[i] = Math.tanh(1.6 * Math.sin(ph)) * Math.exp(-t * 2.6) + (t < 0.006 ? rnd() * 0.8 : 0);
  }
  return b;
}

function crash() {
  const n = Math.floor(1.6 * SR);
  const b = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = rnd();
    lp += 0.25 * (x - lp);
    b[i] = (x - lp) * Math.exp(-t * 3.2);
  }
  return b;
}

// warm detuned pad that swells after the hit
function pad(notes, dur) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let x = 0;
    for (const m of notes) for (const d of [-0.12, 0.12]) x += ((((t * midi(m + d)) % 1) + 1) % 1) * 2 - 1;
    lp += 0.06 * (x / notes.length / 2 - lp);
    b[i] = lp * Math.min(1, t / 0.04) * Math.exp(-t * 1.1);
  }
  return b;
}

function bell(note, dur = 1.4) {
  const n = Math.floor(dur * SR);
  const b = new Float32Array(n);
  const f = midi(note);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    b[i] = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6) + 0.15 * Math.sin(2 * Math.PI * f * 3.98 * t) * Math.exp(-t * 9)) * Math.exp(-t * 3.4) * Math.min(1, t / 0.003);
  }
  return b;
}

add(0, riser(), 0.55);
add(HIT, boom(), 0.9);
add(HIT, crash(), 0.28, 0.15);
add(HIT, pad([45, 52, 57, 60, 64, 71], 2.7), 0.55);
// wordmark letters (frames 50–66) and the three tagline words (frames 76, 81, 86)
[[50, 76, -0.4], [54, 81, 0.4], [58, 83, -0.2], [62, 88, 0.3]].forEach(([fr, m, p]) => add(fr / 30, bell(m), 0.16, p));
[[76, 81, -0.5], [81, 84, 0], [86, 88, 0.5]].forEach(([fr, m, p]) => add(fr / 30, bell(m, 1.2), 0.12, p));

// small stereo room: a few feedback delays
for (const [ch, delays] of [[L, [0.031, 0.047, 0.071]], [R, [0.037, 0.053, 0.067]]]) {
  const dry = Float32Array.from(ch);
  for (const d of delays) {
    const k = Math.floor(d * SR);
    const tail = new Float32Array(LEN);
    for (let i = k; i < LEN; i++) tail[i] = dry[i - k] * 0.5 + tail[i - k] * 0.55;
    for (let i = 0; i < LEN; i++) ch[i] += tail[i] * 0.12;
  }
}

// fade out the last 0.4 s, normalise to -1 dBFS
for (let i = 0; i < LEN; i++) {
  const g = Math.min(1, (LEN - i) / (0.4 * SR));
  L[i] *= g;
  R[i] *= g;
}
let peak = 0;
for (let i = 0; i < LEN; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.89 / peak;

const buf = Buffer.alloc(44 + LEN * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + LEN * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(LEN * 4, 40);
for (let i = 0; i < LEN; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync('public/sting.wav', buf);
console.log(`public/sting.wav ${(LEN / SR).toFixed(1)} s`);
