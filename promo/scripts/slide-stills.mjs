// Stills of the presentation preview for every template: title slide plus a few inner slides,
// for the motion reels. Output: public/slides/<n>-<slide>.jpg and public/slides/index.json
// usage: node scripts/slide-stills.mjs   (site must be served at BASE)
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = path.resolve('public/slides');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--lang=ru-RU', '--hide-scrollbars'],
  defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => localStorage.setItem('lang', 'ru'));
await page.goto(BASE + '/#/app', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(2500);
for (const t of ['Биология', '8 класс', 'Сердце']) {
  await page.evaluate((t) => [...document.querySelectorAll('main button')].find((b) => b.innerText.trim().startsWith(t))?.click(), t);
  await sleep(1500);
}
await sleep(2500);
await page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => b.innerText.includes('Презентация'))?.click());
await sleep(9000);
await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => b.innerText.includes('Показать все'))?.click());
await sleep(800);

// the big preview: the widest 16:9 box in the dialog
const preview = async () =>
  page.evaluateHandle(() => {
    const boxes = [...document.querySelectorAll('[role=dialog] section div')].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 500 && Math.abs(r.width / r.height - 16 / 9) < 0.05;
    });
    return boxes.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
  });
const thumbs = () =>
  page.evaluate(
    () =>
      [...document.querySelectorAll('[role=dialog] section button')].filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 60 && r.width < 320 && Math.abs(r.width / r.height - 16 / 9) < 0.25;
      }).length,
  );
const showSlide = (i) =>
  page.evaluate((i) => {
    const t = [...document.querySelectorAll('[role=dialog] section button')].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 60 && r.width < 320 && Math.abs(r.width / r.height - 16 / 9) < 0.25;
    });
    t[i]?.click();
  }, i);

const names = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] aside button')].map((b) => b.lastElementChild?.textContent?.trim()).filter((n) => n && n.length < 20));
const tiles = names.filter((n, i) => names.indexOf(n) === i);
console.log('templates:', tiles.length, tiles.join(', '));
const index = [];
const SLIDES = [0, 2, 5, 6];
for (const [k, name] of tiles.entries()) {
  await page.evaluate((n) => [...document.querySelectorAll('[role=dialog] aside button')].find((b) => b.lastElementChild?.textContent?.trim() === n)?.click(), name);
  await sleep(1800);
  const n = await thumbs();
  const shots = [];
  for (const s of SLIDES.filter((s) => s < n)) {
    await showSlide(s);
    await sleep(900);
    const el = await preview();
    const file = `${k}-${s}.jpg`;
    await el.asElement().screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 90 });
    shots.push(file);
  }
  index.push({ name, shots });
  console.log(name, shots.length);
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
await browser.close();
