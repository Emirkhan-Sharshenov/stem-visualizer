// Machine-translates every Russian string in src/ into Kyrgyz with Azure Translator (free F0 tier: 2M chars/month)
// and keeps them in src/i18n/ky-auto.json. Only strings not yet in the file are sent, so re-running after new
// content costs only the new text. Hand-made lines in src/i18n/ky.ts win over these on the page.
//   node scripts/translate-ky.mjs          translate what is missing
//   node scripts/translate-ky.mjs --dry    only count what would be sent
//   node scripts/translate-ky.mjs --dump todo.json   list what is missing, for the local GPU translator
// Needs AZURE_TRANSLATOR_KEY (and AZURE_TRANSLATOR_REGION unless the resource is global) in .env.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const OUT = path.join(ROOT, 'src/i18n/ky-auto.json');
const dry = process.argv.includes('--dry');
const CYR = /[А-Яа-яЁё]/;

const env = Object.fromEntries(
  (fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8') : '')
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const KEY = process.env.AZURE_TRANSLATOR_KEY || env.AZURE_TRANSLATOR_KEY;
const REGION = process.env.AZURE_TRANSLATOR_REGION || env.AZURE_TRANSLATOR_REGION;

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return files(p);
    return /\.(ts|tsx)$/.test(d.name) && !/[\\/]i18n[\\/]ky/.test(p) ? [p] : [];
  });
}
const unesc = (s) => s.replace(/\\n/g, '\n').replace(/\\(['"`\\])/g, '$1').replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

// every string the code holds. The Vite dev server (npm run dev, port 3000) compiles TSX to plain JS first, so JSX
// text with apostrophes comes out as ordinary quoted strings; a small scanner then reads string literals and the
// fixed parts of template literals, skipping comments and regex literals.
const DEV = process.env.KY_DEV || 'http://localhost:3000';
const found = new Set();
const add = (s) => {
  s = s.replace(/\s+/g, ' ').trim();
  if (s && CYR.test(s)) found.add(s);
};
const BS = String.fromCharCode(92);
function scan(code) {
  let i = 0;
  let prev = '';
  const readQuoted = (q) => {
    let j = i + 1;
    let raw = '';
    while (j < code.length && code[j] !== q) {
      if (code[j] === BS) {
        raw += code[j] + code[j + 1];
        j += 2;
      } else raw += code[j++];
    }
    i = j + 1;
    return unesc(raw);
  };
  const normal = (stopAtBrace) => {
    let depth = 0;
    while (i < code.length) {
      const c = code[i];
      const n = code[i + 1];
      if (c === '/' && n === '/') {
        while (i < code.length && code[i] !== '\n') i++;
      } else if (c === '/' && n === '*') {
        i = code.indexOf('*/', i + 2);
        i = i < 0 ? code.length : i + 2;
      } else if (c === '/' && (prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev))) {
        // a regex literal
        let j = i + 1;
        let cls = false;
        while (j < code.length && (cls || code[j] !== '/') && code[j] !== '\n') {
          if (code[j] === BS) j++;
          else if (code[j] === '[') cls = true;
          else if (code[j] === ']') cls = false;
          j++;
        }
        i = j + 1;
        prev = ')';
      } else if (c === '"' || c === "'") {
        add(readQuoted(c));
        prev = ')';
      } else if (c === '`') {
        i++;
        let part = '';
        while (i < code.length && code[i] !== '`') {
          if (code[i] === BS) {
            part += code[i + 1];
            i += 2;
          } else if (code[i] === '$' && code[i + 1] === '{') {
            add(part);
            part = '';
            i += 2;
            prev = '{';
            normal(true);
          } else part += code[i++];
        }
        add(part);
        i++;
        prev = ')';
      } else {
        if (c === '{') depth++;
        if (c === '}') {
          if (stopAtBrace && depth === 0) {
            i++;
            return;
          }
          depth--;
        }
        if (!/\s/.test(c)) prev = /[\w$)\]]/.test(c) ? ')' : c;
        i++;
      }
    }
  };
  normal(false);
}
for (const f of files(path.join(ROOT, 'src'))) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const res = await fetch(`${DEV}/${rel}`).catch(() => null);
  if (!res || !res.ok) {
    console.error(`skipped ${rel}: start the dev server (npm run dev)`);
    continue;
  }
  scan((await res.text()).replace(/\/\/# sourceMappingURL=.*$/m, ''));
}

const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const todo = [...found].filter((s) => s && !(s in done));
const chars = todo.reduce((a, s) => a + s.length, 0);
console.log(`${found.size} Russian strings, ${Object.keys(done).length} already translated, ${todo.length} to send (${chars.toLocaleString()} characters)`);
if (dry) process.exit(0);
// --dump file.json: write what is missing for the local translator (scripts/translate-ky-local.py)
const dumpAt = process.argv.indexOf('--dump');
if (dumpAt > 0) {
  fs.writeFileSync(process.argv[dumpAt + 1], JSON.stringify(todo));
  console.log(`Wrote ${todo.length} strings to ${process.argv[dumpAt + 1]}`);
  process.exit(0);
}
if (!KEY) {
  console.error('No AZURE_TRANSLATOR_KEY in .env');
  process.exit(1);
}

const save = () => fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(done).sort(([a], [b]) => a.localeCompare(b))), null, 0).replace(/","/g, '",\n"'));
// a request may carry up to 1000 items and 50,000 characters; stay well under
let batch = [];
let size = 0;
let sent = 0;
async function flush() {
  if (!batch.length) return;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=ru&to=ky&textType=plain', {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': KEY, ...(REGION ? { 'Ocp-Apim-Subscription-Region': REGION } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(batch.map((Text) => ({ Text }))),
    });
    if (res.ok) {
      const out = await res.json();
      out.forEach((r, i) => (done[batch[i]] = r.translations[0].text));
      break;
    }
    const body = await res.text();
    // 429: the free tier throttles to about 33,300 characters a minute
    if ((res.status === 429 || res.status >= 500) && attempt < 8) {
      await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
      continue;
    }
    save();
    console.error(`Azure ${res.status}: ${body}`);
    process.exit(1);
  }
  sent += size;
  process.stdout.write(`\r${sent.toLocaleString()} / ${chars.toLocaleString()} characters`);
  save();
  batch = [];
  size = 0;
}
for (const s of todo) {
  if (batch.length >= 100 || size + s.length > 9000) await flush();
  batch.push(s);
  size += s.length;
}
await flush();
console.log(`\nSaved ${Object.keys(done).length} translations to src/i18n/ky-auto.json`);
