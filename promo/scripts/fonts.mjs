// Saves the Google Fonts used by the videos (Inter, Newsreader; Cyrillic + Latin) into public/fonts,
// so renders never depend on the network or Chrome's cache.
// usage: node scripts/fonts.mjs
import fs from 'fs';

const CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=block';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
fs.mkdirSync('public/fonts', { recursive: true });
let css = await (await fetch(CSS, { headers: { 'User-Agent': UA } })).text();
// keep only the cyrillic and latin blocks
const blocks = css.split('/* ').filter((b) => /^(cyrillic|latin) \*\//.test(b));
let out = '';
let n = 0;
for (const b of blocks) {
  const url = b.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const name = `f${n++}.woff2`;
  fs.writeFileSync(`public/fonts/${name}`, Buffer.from(await (await fetch(url)).arrayBuffer()));
  out += '/* ' + b.replace(url, name);
}
fs.writeFileSync('public/fonts/fonts.css', out);
console.log(n, 'font files');
