// Checks that every ElevenLabs line fits its slot in the reel: `npm run voice:check`
import { execSync } from 'child_process';
import fs from 'fs';

const FPS = 30;
const bar = (n) => Math.round(n * (60 / 128) * 4 * FPS);
const END = 945;
// same start frames as VOICE_AT in src/Reel.tsx
const AT = [8, bar(2) + 10, bar(4) + 8, bar(6) + 6, bar(8) + 6, bar(10) + 4, bar(12) + 4, bar(14) + 6];

let bad = 0;
AT.forEach((at, i) => {
  const name = `${String(i + 1).padStart(2, '0')}.mp3`;
  const file = `public/voice/${name}`;
  const slot = ((AT[i + 1] ?? END) - at) / FPS - 0.15;
  if (!fs.existsSync(file)) return console.log(`${name}  —  нет файла (слот ${slot.toFixed(1)} с)`);
  const secs = Number(execSync(`npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`, { encoding: 'utf8' }).trim());
  const ok = secs <= slot;
  if (!ok) bad++;
  console.log(`${name}  ${secs.toFixed(2)} с из ${slot.toFixed(1)} с  ${ok ? '✓' : `✗ длиннее на ${(secs - slot).toFixed(2)} с`}`);
});
console.log(bad ? `\n${bad} фраз(ы) не помещаются: обрежь тишину в начале/конце или перегенерируй (Speed не выше 1.05).` : '\nВсё помещается.');
