// Cuts one ElevenLabs take (all 8 lines read in a row) into public/voice/01–08.mp3
// usage: node scripts/split-voice.mjs <file.mp3> "0-3.03,3.36-6.54,…"
import { execFileSync } from 'child_process';
const [file, spans] = process.argv.slice(2);
spans.split(',').forEach((span, i) => {
  const [a, b] = span.split('-').map(Number);
  const start = Math.max(0, a - 0.04);
  const dur = b - a + 0.16;
  const out = `public/voice/${String(i + 1).padStart(2, '0')}.mp3`;
  execFileSync('npx', ['remotion', 'ffmpeg', '-v', 'error', '-y', '-ss', start.toFixed(3), '-t', dur.toFixed(3), '-i', file,
    '-c:a', 'libmp3lame', '-b:a', '192k', out], { stdio: 'inherit', shell: true });
  console.log(out, dur.toFixed(2), 's');
});
