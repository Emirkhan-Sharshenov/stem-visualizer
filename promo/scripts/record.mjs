// Records real interactions with the site for the promo clips, frame by frame.
// The page runs on a virtual clock (performance.now, Date.now, requestAnimationFrame and timers are
// replaced), so every captured frame is exactly 1/30 s apart however slowly Chrome renders 3D in headless
// mode. Phone viewport 432×768 CSS px at 2.5× → 1080×1920 frames, touch taps.
// Output: public/rec/<clip>/NNNNN.jpg + manifest.json { fps, frames, taps:[{f,x,y,kind}], marks:{name:frame} }
// usage: node scripts/record.mjs [clip ...]   (site must be served at BASE)
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE || 'http://localhost:4173';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = 432;
const H = 768;
const DSF = 2.5;
const FPS = 30;
const OUT = path.resolve('public/rec');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** installed before any page script: a clock we advance by hand */
const VIRTUAL_TIME = () => {
  let now = 0;
  const dateStart = Date.now();
  const raf = new Map();
  const timers = new Map();
  let id = 0;
  performance.now = () => now;
  Date.now = () => dateStart + now;
  window.requestAnimationFrame = (cb) => {
    raf.set(++id, cb);
    return id;
  };
  window.cancelAnimationFrame = (i) => raf.delete(i);
  window.setTimeout = (fn, ms = 0, ...a) => {
    timers.set(++id, { at: now + Math.max(0, ms || 0), fn, a });
    return id;
  };
  window.clearTimeout = (i) => timers.delete(i);
  window.setInterval = (fn, ms = 0, ...a) => {
    timers.set(++id, { at: now + Math.max(1, ms || 0), fn, a, every: Math.max(1, ms || 0) });
    return id;
  };
  window.clearInterval = (i) => timers.delete(i);
  window.__advance = (ms) => {
    const target = now + ms;
    // fire timers in order up to the target time
    for (let guard = 0; guard < 500; guard++) {
      let next = null;
      for (const [i, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [i, t];
      if (!next) break;
      const [i, t] = next;
      now = Math.max(now, t.at);
      if (t.every) t.at += t.every;
      else timers.delete(i);
      try {
        typeof t.fn === 'function' ? t.fn(...t.a) : 0;
      } catch (e) {
        console.error(e);
      }
    }
    now = target;
    const cbs = [...raf.values()];
    raf.clear();
    for (const cb of cbs) {
      try {
        cb(now);
      } catch (e) {
        console.error(e);
      }
    }
  };
};

async function record(name, url, script) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [`--force-device-scale-factor=${DSF}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--lang=ru-RU'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: DSF, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(VIRTUAL_TIME);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('lang', 'ru');
    } catch {}
    // CSS transitions run on real time; switch them off so frames stay consistent
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '*,*::before,*::after{transition:none!important;scroll-behavior:auto!important}';
      document.head.appendChild(s);
    });
  });
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // let the app load: advance the clock in real time for a few seconds
  for (let i = 0; i < 120; i++) {
    await page.evaluate(() => window.__advance(33));
    await sleep(33);
  }

  const dir = path.join(OUT, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let frame = 0;
  const taps = [];
  const marks = {};

  /** advance one frame and capture it */
  const shot = async () => {
    await page.evaluate((ms) => window.__advance(ms), 1000 / FPS);
    await page.screenshot({ path: path.join(dir, String(frame).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 86 });
    frame++;
  };
  const frames = async (sec) => {
    for (let i = 0; i < Math.round(sec * FPS); i++) await shot();
  };
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
  const scrollY = () => page.evaluate(() => window.scrollY);
  const animateScroll = async (to, sec) => {
    const from = await scrollY();
    const n = Math.max(1, Math.round(sec * FPS));
    for (let i = 1; i <= n; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), from + (to - from) * ease(i / n));
      await shot();
    }
  };
  const rectOf = async (finder, arg) =>
    page.evaluate(
      (src, a) => {
        // eslint-disable-next-line no-new-func
        const el = new Function('a', src)(a);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, h: r.height, w: r.width, left: r.left };
      },
      finder,
      arg,
    );
  const byText = `const {text, scope, exact} = a; const els = [...document.querySelectorAll((scope || 'main') + ' button, ' + (scope || 'main') + ' a')]; return els.find(e => exact ? e.innerText.trim() === text : e.innerText.includes(text));`;

  const h = {
    page,
    mark: (k) => (marks[k] = frame),
    sleep: (ms) => frames(ms / 1000),
    /** let the page load in real time without recording (a clean cut instead of a white flash) */
    async settle(ms) {
      for (let i = 0; i < ms / 33; i++) {
        await page.evaluate(() => window.__advance(33));
        await sleep(33);
      }
    },
    /** tap without waiting, then load quietly */
    async tapAndLoad(text, opts, ms = 2500) {
      await h.tap(text, { ...opts, after: 0 });
      await h.settle(ms);
    },
    async reveal(finder, arg, at = 0.35, ms = 700) {
      const r = await rectOf(finder, arg);
      if (!r) throw new Error('not found: ' + JSON.stringify(arg));
      const y = await scrollY();
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      await animateScroll(Math.min(max, Math.max(0, y + r.top - H * at)), ms / 1000);
    },
    async scrollBy(dy, ms = 700) {
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      await animateScroll(Math.min(max, Math.max(0, (await scrollY()) + dy)), ms / 1000);
    },
    async scrollTo(y, ms = 700) {
      await animateScroll(y, ms / 1000);
    },
    async tapAt(x, y, after = 500) {
      taps.push({ f: frame, x, y, kind: 'tap' });
      await page.touchscreen.tap(x, y);
      await frames(after / 1000);
    },
    async tap(text, opts = {}) {
      const arg = { text, scope: opts.scope, exact: opts.exact };
      // chips in a sideways-scrolling row: bring the button into the row's view first
      await page.evaluate(
        (src, a) => {
          // eslint-disable-next-line no-new-func
          const el = new Function('a', src)(a);
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.left >= 8 && r.right <= innerWidth - 8) return;
          let p = el.parentElement;
          while (p && p.scrollWidth <= p.clientWidth) p = p.parentElement;
          if (p) p.scrollLeft += r.left - (innerWidth / 2 - r.width / 2);
        },
        byText,
        arg,
      );
      await frames(0.2);
      let r = await rectOf(byText, arg);
      if (!r) throw new Error('no button: ' + text);
      if (r.top < 60 || r.top + r.h > H - 70) {
        await h.reveal(byText, arg, opts.at ?? 0.5);
        r = await rectOf(byText, arg);
      }
      await frames(0.15);
      await h.tapAt(r.x, r.y, opts.after ?? 600);
    },
    rect: (src, arg) => rectOf(src, arg),
    async drag(x1, y1, x2, y2, ms = 900) {
      const n = Math.max(2, Math.round((ms / 1000) * FPS));
      taps.push({ f: frame, x: x1, y: y1, kind: 'down' });
      await page.touchscreen.touchStart(x1, y1);
      for (let i = 1; i <= n; i++) {
        const k = ease(i / n);
        const x = x1 + (x2 - x1) * k;
        const y = y1 + (y2 - y1) * k;
        await page.touchscreen.touchMove(x, y);
        taps.push({ f: frame, x, y, kind: 'move' });
        await shot();
      }
      await page.touchscreen.touchEnd();
      taps.push({ f: frame, x: x2, y: y2, kind: 'up' });
    },
    async setRange(index, value) {
      const r = await page.evaluate(
        (i, v) => {
          const el = document.querySelectorAll('main input[type=range]')[i];
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          set.call(el, String(v));
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          const b = el.getBoundingClientRect();
          const k = (v - Number(el.min)) / (Number(el.max) - Number(el.min));
          return { x: b.left + b.width * k, y: b.top + b.height / 2 };
        },
        index,
        value,
      );
      taps.push({ f: frame, x: r.x, y: r.y, kind: 'tap' });
      await frames(0.5);
    },
  };

  const t0 = Date.now();
  try {
    await script(h);
  } finally {
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ name, fps: FPS, w: W, h: H, frames: frame, taps, marks }, null, 1));
    console.log(`${name}: ${frame} frames (${(frame / FPS).toFixed(1)} s) in ${((Date.now() - t0) / 1000).toFixed(0)} s, marks ${Object.keys(marks).join(',')}`);
    await browser.close();
  }
}

const CLIPS = {
  // a tour: landing → textbook topic with a live model → labs and builders
  async overview() {
    await record('overview', '/', async (h) => {
      h.mark('start');
      await h.sleep(1500);
      await h.scrollBy(520, 1400);
      await h.scrollBy(520, 1400);
      h.mark('open');
      await h.scrollTo(0, 900);
      await h.tapAndLoad('Открыть учебник', { scope: 'body' });
      await h.sleep(600);
      h.mark('textbook');
      await h.tap('Состав ядра', { after: 0 }).catch(async () => {
        await h.tap('Что изучает физика', { after: 0 });
      });
      await h.sleep(2600);
      h.mark('topic');
      await h.scrollBy(380, 2200);
      h.mark('labs');
      await h.tapAndLoad('Лаборатории', { scope: 'nav.fixed', exact: true });
      await h.sleep(600);
      await h.scrollBy(260, 1500);
      await h.scrollBy(900, 1600);
      h.mark('end');
      await h.sleep(800);
    });
  },

  // launch satellites at the first and second cosmic velocity
  async space() {
    await record('space', '/#/app?lab=space3d', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.05, 900);
      h.mark('start');
      await h.sleep(1500);
      await h.tap('v₁ =', { at: 0.75, after: 400 });
      await h.tap('Запустить', { exact: true, at: 0.8, after: 300 });
      h.mark('v1');
      await h.reveal(canvas, null, 0.05, 900);
      await h.sleep(4200);
      await h.tap('v₂ =', { at: 0.75, after: 400 });
      await h.tap('Запустить', { exact: true, at: 0.8, after: 300 });
      h.mark('v2');
      await h.reveal(canvas, null, 0.05, 900);
      await h.sleep(4500);
      h.mark('end');
    });
  },

  // "golden rain" and a blue precipitate, with the equation in the log
  async chem() {
    await record('chem', '/#/app?lab=chemlab', async (h) => {
      h.mark('start');
      await h.sleep(800);
      await h.tap('Pb(NO₃)₂', { exact: true, at: 0.45, after: 700 });
      await h.tap('KI', { exact: true, after: 700 });
      await h.tap('KI', { exact: true, after: 300 });
      h.mark('gold');
      await h.reveal(`return document.querySelector('main canvas')`, null, 0.12, 900);
      await h.sleep(3200);
      h.mark('equation');
      await h.reveal(`return [...document.querySelectorAll('main h3')].find(e => e.innerText.includes('ЖУРНАЛ') || e.innerText.includes('Журнал'))`, null, 0.1, 900);
      await h.sleep(2600);
      h.mark('blue');
      await h.scrollTo(0, 700);
      await h.tap('Вылить', { after: 400 }).catch(() => {});
      await h.scrollTo(0, 600);
      await h.tap('CuSO₄', { exact: true, at: 0.45, after: 600 });
      await h.tap('NaOH', { exact: true, after: 600 });
      await h.tap('NaOH', { exact: true, after: 300 });
      await h.reveal(`return document.querySelector('main canvas')`, null, 0.12, 900);
      await h.sleep(3000);
      h.mark('end');
    });
  },

  // refraction → prism rainbow → a lens image that changes as the object moves
  async optics() {
    await record('optics', '/#/app?lab=optics', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.32, 900);
      h.mark('start');
      await h.sleep(1600);
      await h.scrollTo(0, 600);
      await h.tap('Призма и спектр', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.32, 800);
      h.mark('prism');
      await h.sleep(2600);
      await h.scrollTo(0, 600);
      await h.tap('Собирающая линза', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.32, 800);
      h.mark('lens');
      await h.sleep(1200);
      const c = await h.rect(canvas);
      // the object arrow sits at x = 14 of a 100-wide bench, its middle at y = 28 of 60
      const sx = c.w / 100;
      const ox = c.left + 14 * sx;
      const oy = c.top + c.h * (28 / 60);
      await h.drag(ox, oy, c.left + 42 * sx, oy, 2600, 40);
      h.mark('magnifier');
      await h.sleep(1600);
      await h.drag(c.left + 42 * sx, oy, c.left + 20 * sx, oy, 1600, 30);
      await h.sleep(1200);
      h.mark('end');
    });
  },

  // switch the lamp off and on, then remove one of two parallel lamps
  async circuit() {
    await record('circuit', '/#/app?lab=circuits', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.3, 900);
      h.mark('start');
      await h.sleep(1500);
      let c = await h.rect(canvas);
      const cell = c.w / 9;
      const at = (gx, gy) => [c.left + (gx + 0.5) * cell, c.top + (gy + 0.5) * cell];
      // switch sits on h:5,1 → between dots (5,1) and (6,1)
      let [x, y] = at(5.5, 1);
      await h.tapAt(x, y, 1400);
      h.mark('off');
      await h.tapAt(x, y, 1400);
      h.mark('on');
      await h.scrollTo(0, 600);
      await h.tap('Параллельное соединение', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.3, 800);
      h.mark('parallel');
      await h.sleep(2200);
      await h.tap('Удалить', { exact: true, at: 0.2, after: 300 });
      await h.reveal(canvas, null, 0.3, 700);
      c = await h.rect(canvas);
      // first lamp is on v:4,2 → between (4,2) and (4,3)
      [x, y] = at(4, 2.5);
      await h.tapAt(x, y, 2600);
      h.mark('removed');
      await h.sleep(1200);
      h.mark('end');
    });
  },
};

const want = process.argv.slice(2);
for (const [k, fn] of Object.entries(CLIPS)) {
  if (want.length && !want.includes(k)) continue;
  await fn();
}
