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

/** opts.desktop: a 1440×900 laptop screen at 1.5× instead of the phone */
async function record(name, url, script, init, opts = {}) {
  const W = opts.desktop ? 1440 : 432;
  const H = opts.desktop ? 900 : 768;
  const DSF = opts.desktop ? 1.5 : 2.5;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [`--force-device-scale-factor=${DSF}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--lang=ru-RU'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: DSF, isMobile: !opts.desktop, hasTouch: !opts.desktop },
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(VIRTUAL_TIME);
  if (init) await page.evaluateOnNewDocument(init.fn, init.arg);
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
      if (opts.desktop) {
        await page.mouse.move(x, y);
        await page.mouse.click(x, y);
      } else await page.touchscreen.tap(x, y);
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
    /** type into the focused field one character at a time, on camera */
    async type(text, cps = 14) {
      for (const ch of text) {
        await page.keyboard.type(ch);
        await frames(1 / cps);
      }
    },
    /** tap whatever element a finder returns */
    async tapEl(src, arg, after = 600) {
      const r = await rectOf(src, arg);
      if (!r) throw new Error('no element for tapEl');
      await h.tapAt(r.x, r.y, after);
    },
    async drag(x1, y1, x2, y2, ms = 900) {
      const n = Math.max(2, Math.round((ms / 1000) * FPS));
      taps.push({ f: frame, x: x1, y: y1, kind: 'down' });
      const pointer = opts.desktop
        ? { start: async (x, y) => (await page.mouse.move(x, y), page.mouse.down()), move: (x, y) => page.mouse.move(x, y), end: () => page.mouse.up() }
        : { start: (x, y) => page.touchscreen.touchStart(x, y), move: (x, y) => page.touchscreen.touchMove(x, y), end: () => page.touchscreen.touchEnd() };
      await pointer.start(x1, y1);
      for (let i = 1; i <= n; i++) {
        const k = ease(i / n);
        const x = x1 + (x2 - x1) * k;
        const y = y1 + (y2 - y1) * k;
        await pointer.move(x, y);
        taps.push({ f: frame, x, y, kind: 'move' });
        await shot();
      }
      await pointer.end();
      taps.push({ f: frame, x: x2, y: y2, kind: 'up' });
    },
    /** move a slider smoothly to a value, frame by frame, with a finger on it */
    async sweepRange(index, to, ms = 1200, scope = 'main') {
      const n = Math.max(2, Math.round((ms / 1000) * FPS));
      const from = await page.evaluate((i, sc) => Number(document.querySelectorAll(sc + ' input[type=range]')[i].value), index, scope);
      for (let k = 1; k <= n; k++) {
        const v = from + (to - from) * ease(k / n);
        const r = await page.evaluate(
          (i, v, sc) => {
            const el = document.querySelectorAll(sc + ' input[type=range]')[i];
            const step = Number(el.step) || 1;
            const val = Math.round(v / step) * step;
            const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            set.call(el, String(val));
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            const b = el.getBoundingClientRect();
            const kk = (val - Number(el.min)) / (Number(el.max) - Number(el.min));
            return { x: b.left + b.width * kk, y: b.top + b.height / 2 };
          },
          index,
          v,
          scope,
        );
        taps.push({ f: frame, x: r.x, y: r.y, kind: k === 1 ? 'down' : k === n ? 'up' : 'move' });
        await shot();
      }
    },
    /** click a button by its text without scrolling to it (it may be off screen) */
    async press(text, scope = 'main', exact = false) {
      const ok = await page.evaluate(
        (t, sc, ex) => {
          const el = [...document.querySelectorAll(sc + ' button')].find((b) => (ex ? b.innerText.trim() === t : b.innerText.includes(t)));
          el?.click();
          return !!el;
        },
        text,
        scope,
        exact,
      );
      if (!ok) throw new Error('no button: ' + text);
    },
    /** scroll an inner scroll box (a dialog, a side panel) smoothly */
    async scrollEl(src, dy, ms = 700) {
      const n = Math.max(1, Math.round((ms / 1000) * FPS));
      const from = await page.evaluate((s) => new Function(s)().scrollTop, src);
      for (let i = 1; i <= n; i++) {
        await page.evaluate((s, y) => (new Function(s)().scrollTop = y), src, from + dy * ease(i / n));
        await shot();
      }
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
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ name, fps: FPS, w: W, h: H, dsf: DSF, frames: frame, taps, marks }, null, 1));
    console.log(`${name}: ${frame} frames (${(frame / FPS).toFixed(1)} s) in ${((Date.now() - t0) / 1000).toFixed(0)} s, marks ${Object.keys(marks).join(',')}`);
    await browser.close();
  }
}


/** opens a textbook topic quietly (not recorded): subject chip → grade chip → topic */
async function openTopic(h, subject, grade, title) {
  for (const t of [subject, grade, title]) {
    const ok = await h.page.evaluate((t) => {
      const b = [...document.querySelectorAll('main button')].find((e) => e.innerText.trim().startsWith(t));
      b?.click();
      return !!b;
    }, t);
    if (!ok) throw new Error('no button: ' + t);
    await h.settle(1200);
  }
  await h.settle(2500);
}
const CANVAS = `return document.querySelector('main canvas')`;

const CLIPS = {

  /* ---------- third series ---------- */

  // three throws at 30°, 45° and 60°: 45° flies farthest, 30° and 60° land together
  async proj() {
    await record('proj', '/#/app?lab=projectile', async (h) => {
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(600);
      h.mark('start');
      await h.sleep(500);
      await h.sweepRange(1, 30, 900);
      await h.press('Бросить');
      h.mark('t30');
      await h.sleep(2600);
      await h.sweepRange(1, 60, 1000);
      await h.press('Бросить');
      h.mark('t60');
      await h.sleep(3700);
      await h.sweepRange(1, 45, 700);
      await h.press('Бросить');
      h.mark('t45');
      await h.sleep(3000);
      h.mark('end');
    });
  },

  // a function typed as in a notebook, then its parameters dragged live
  async plot() {
    await record('plot', '/#/app?lab=plotter', async (h) => {
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(600);
      h.mark('start');
      await h.sleep(400);
      await h.press('a*sin(b*x) + c');
      await h.sleep(900);
      h.mark('sin');
      await h.sweepRange(1, 3, 1400);
      await h.sweepRange(0, 3, 1200);
      await h.sweepRange(2, 1, 900);
      h.mark('cubic');
      await h.press('x^3 - 3x');
      await h.sleep(800);
      await h.page.evaluate(() => [...document.querySelectorAll('main label')].find((l) => l.innerText.includes('производную'))?.querySelector('input')?.click());
      h.mark('deriv');
      await h.sleep(2200);
      h.mark('end');
    });
  },

  // amylase: warm to 37 °C (fastest), then overheat until it denatures
  async enz() {
    await record('enz', '/#/app?lab=enzymes', async (h) => {
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(600);
      h.mark('start');
      await h.sleep(800);
      await h.sweepRange(2, 9, 900);
      await h.sweepRange(0, 37, 1300);
      h.mark('opt');
      await h.sleep(2200);
      await h.sweepRange(0, 75, 1600);
      h.mark('hot');
      await h.sleep(2600);
      h.mark('end');
    });
  },

  // zinc | copper: close the circuit, electrons run, then magnesium for a bigger voltage
  async galv() {
    await record('galv', '/#/app?lab=galvanic', async (h) => {
      await h.reveal(`return document.querySelector('main svg')`, null, 0.12, 10);
      await h.settle(600);
      h.mark('start');
      await h.sleep(700);
      await h.press('Замкнуть цепь');
      h.mark('closed');
      await h.sleep(3200);
      await h.page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => b.innerText.trim() === 'Mg')?.click());
      h.mark('mg');
      await h.sleep(2800);
      h.mark('end');
    });
  },

  // balance an equation: the coefficients are read from the game's own answer key
  async game() {
    const src = fs.readFileSync(path.resolve('../src/components/games/BalanceGame.tsx'), 'utf8');
    const KEY = {};
    for (const m of src.matchAll(/\[\[([^\]]*)\], \[([^\]]*)\], \[([^\]]*)\]\]/g)) {
      const list = (x) => x.split(',').map((t) => t.trim().replace(/'/g, ''));
      KEY[[...list(m[1]), '>', ...list(m[2])].join(' ')] = m[3].split(',').map(Number);
    }
    await record('game', '/#/app?lab=games', async (h) => {
      await h.page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => b.innerText.includes('Играть'))?.click());
      await h.settle(1500);
      h.mark('start');
      for (let round = 0; round < 3; round++) {
        await h.sleep(round ? 500 : 900);
        const formulas = await h.page.evaluate(() => {
          const plain = (t) => t.replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d))).replace(/^\d+/, '');
          const plus = [...document.querySelectorAll('main button')].filter((b) => b.getAttribute('aria-label') === '+');
          return plus.map((b) => plain(b.parentElement.innerText.replace(/[+−\n\s]/g, '')));
        });
        // the arrow sits between reactants and products: try every split against the key
        let coef = null;
        for (let k = 1; k < formulas.length && !coef; k++) coef = KEY[[...formulas.slice(0, k), '>', ...formulas.slice(k)].join(' ')] ?? null;
        if (!coef) throw new Error('unknown equation ' + formulas.join(' '));
        for (let i = 0; i < coef.length; i++)
          for (let n = 1; n < coef[i]; n++)
            await h.tapEl(`const p = [...document.querySelectorAll('main button')].filter(b => b.getAttribute('aria-label') === '+'); return p[a]`, i, 260);
        await h.sleep(250);
        await h.tap('Готово', { after: 900 });
        h.mark('solved' + round);
      }
      await h.sleep(600);
      h.mark('end');
    });
  },

  // incircle and circumcircle follow a vertex as it is dragged
  async geo() {
    await record('geo', '/#/app', async (h) => {
      await openTopic(h, 'Математика', '8 класс', 'Вписанная и описанная');
      const svg = `return [...document.querySelectorAll('main svg')].find(s => s.querySelectorAll('circle[r="8"]').length >= 3)`;
      await h.reveal(svg, null, 0.12, 10);
      await h.settle(500);
      h.mark('start');
      await h.sleep(700);
      const handle = (i) => h.rect(`const s = [...document.querySelectorAll('main svg')].find(s => s.querySelectorAll('circle[r="8"]').length >= 3); return [...s.querySelectorAll('circle[r="8"]')].sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top)[a]`, i);
      let c = await handle(0);
      await h.drag(c.x, c.y, c.x - 110, c.y + 40, 1500);
      h.mark('drag1');
      await h.sleep(300);
      c = await handle(0);
      await h.drag(c.x, c.y, c.x + 170, c.y - 30, 1700);
      await h.sleep(300);
      c = await handle(2);
      await h.drag(c.x, c.y, c.x - 60, c.y + 30, 1200);
      await h.sleep(900);
      h.mark('end');
    });
  },

  // graph transformations: shift right, up, stretch, then switch the base function
  async shift() {
    await record('shift', '/#/app', async (h) => {
      await openTopic(h, 'Математика', '9 класс', 'Преобразования графиков');
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(500);
      h.mark('start');
      await h.sleep(500);
      await h.sweepRange(2, -2, 1300);
      await h.sweepRange(3, 2, 1100);
      await h.sweepRange(1, 3, 1000);
      h.mark('sin');
      await h.sweepRange(0, 5, 700);
      await h.sweepRange(1, -2, 1300);
      await h.sleep(800);
      h.mark('end');
    });
  },

  // cube cross-sections: the plane slides, the section changes shape
  async cube() {
    await record('cube', '/#/app', async (h) => {
      await openTopic(h, 'Математика', '10 класс', 'Сечения многогранников');
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(800);
      h.mark('start');
      await h.sleep(500);
      await h.sweepRange(2, 0.15, 1300);
      await h.sweepRange(2, 0.85, 1700);
      h.mark('diag');
      await h.sweepRange(1, 2, 400);
      await h.sweepRange(2, 0.3, 1400);
      const c = await h.rect(CANVAS);
      await h.drag(c.x - 60, c.y, c.x + 90, c.y + 20, 1300);
      await h.sleep(600);
      h.mark('end');
    });
  },

  // a solid of revolution grows as the angle turns to 360°
  async spin() {
    await record('spin', '/#/app', async (h) => {
      await openTopic(h, 'Математика', '11 класс', 'Тела вращения');
      await h.reveal(CANVAS, null, 0.1, 10);
      await h.settle(800);
      await h.setRange(1, 20);
      await h.settle(300);
      h.mark('start');
      await h.sleep(400);
      await h.sweepRange(1, 360, 2400);
      h.mark('cone');
      await h.sweepRange(0, 3, 500);
      await h.sweepRange(1, 40, 600);
      await h.sweepRange(1, 360, 1800);
      h.mark('sphere');
      await h.sleep(900);
      h.mark('end');
    });
  },

  // the topic test: pick answers, see the feedback
  async quiz() {
    await record('quiz', '/#/app', async (h) => {
      await openTopic(h, 'Математика', '9 класс', 'Преобразования графиков');
      await h.reveal(`return [...document.querySelectorAll('main button')].find(b => b.innerText.includes('Начать тест'))`, null, 0.5, 10);
      await h.press('Начать тест');
      await h.settle(1200);
      await h.reveal(`return [...document.querySelectorAll('main h2, main h3, main p')].find(e => /вопрос/i.test(e.innerText)) || document.querySelector('main')`, null, 0.12, 10).catch(() => {});
      await h.settle(400);
      h.mark('start');
      await h.sleep(900);
      for (let q = 0; q < 2; q++) {
        // the right option comes from the quiz's own data on the button
        const opts = await h.page.evaluate(() => [...document.querySelectorAll('main button')].filter((b) => b.innerText.trim().length > 0 && b.getBoundingClientRect().height > 40 && !/тест|Далее|Следующ|Учебник|Презентация|наставника|понял/i.test(b.innerText)).length);
        if (!opts) break;
        await h.tapEl(`return [...document.querySelectorAll('main button')].filter(b => b.innerText.trim().length > 0 && b.getBoundingClientRect().height > 40 && !/тест|Далее|Следующ|Учебник|Презентация|наставника|понял/i.test(b.innerText))[a]`, q % 2, 1500);
        h.mark('a' + q);
        await h.page.evaluate(() => [...document.querySelectorAll('main button')].find((b) => /Далее|Следующий/.test(b.innerText))?.click());
        await h.sleep(500);
      }
      h.mark('end');
    });
  },

  // laptop: the presentation dialog, flipping through templates
  async deck() {
    await record(
      'deck',
      '/#/app',
      async (h) => {
        await openTopic(h, 'Биология', '8 класс', 'Сердце');
        await h.press('Презентация');
        await h.settle(7000);
        h.mark('start');
        await h.sleep(1200);
        const tile = (name) => `return [...document.querySelectorAll('[role=dialog] button')].find(b => b.lastElementChild?.textContent?.trim() === '${name}')`;
        for (const name of ['Журнал', 'Деловой', 'Карточки', 'Детский', 'Шаги', 'Наука']) {
          const r = await h.rect(tile(name));
          if (!r) continue;
          if (r.top < 120 || r.top + r.h > 820) {
            await h.scrollEl(`const el = [...document.querySelectorAll('[role=dialog] *')].find(e => e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.contains(new Function(${JSON.stringify(tile(name))})())); return el`, r.top - 420, 500);
          }
          await h.tapEl(tile(name), null, 1500);
          h.mark(name);
        }
        // flip through the slides of the last template
        for (let i = 0; i < 4; i++) {
          await h.page.keyboard.press('ArrowRight');
          await h.sleep(700);
        }
        h.mark('end');
      },
      null,
      { desktop: true },
    );
  },
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

  /* ---------- second series ---------- */

  // titration: fill to just before equivalence, then the drop that turns it pink
  async titr() {
    await record('titr', '/#/app?lab=titration', async (h) => {
      const flask = `return document.querySelector('main svg[aria-label]')`;
      await h.reveal(flask, null, 0.12, 700);
      h.mark('start');
      await h.sleep(600);
      for (let i = 0; i < 3; i++) await h.tap('+5 мл', { exact: true, after: 350 });
      await h.tap('+1 мл', { exact: true, after: 350 });
      await h.tap('+1 мл', { exact: true, after: 350 });
      await h.tap('+1 мл', { exact: true, after: 350 });
      await h.tap('+1 мл', { exact: true, after: 350 });
      await h.tap('+0.5 мл', { exact: true, after: 350 });
      await h.tap('+0.5 мл', { exact: true, after: 500 });
      await h.reveal(flask, null, 0.12, 500);
      h.mark('drop');
      await h.tap('1 капля', { exact: true, after: 1800 });
      h.mark('pink');
      await h.reveal(`return [...document.querySelectorAll('main h3')].find(e => /кривая/i.test(e.innerText))`, null, 0.2, 900);
      h.mark('curve');
      await h.sleep(2200);
      h.mark('end');
    });
  },

  // electric field: drag a charge, release test charges, then a capacitor
  async efield() {
    await record('efield', '/#/app?lab=efield', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.25, 700);
      h.mark('start');
      await h.sleep(800);
      let c = await h.rect(canvas);
      const P = (x, y) => [c.left + (x / 40) * c.w, c.top + (y / 25) * c.h];
      h.mark('drag');
      let [x1, y1] = P(14, 12.5);
      let [x2, y2] = P(17, 6);
      await h.drag(x1, y1, x2, y2, 1300);
      [x1, y1] = [x2, y2];
      [x2, y2] = P(12, 18);
      await h.drag(x1, y1, x2, y2, 1500);
      await h.sleep(500);
      await h.tap('Пробный заряд', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.25, 500);
      c = await h.rect(canvas);
      h.mark('probe');
      for (const [x, y] of [[15, 15], [10, 20], [16, 21], [9, 15]]) await h.tapAt(...P(x, y), 250);
      await h.sleep(2500);
      await h.tap('Конденсатор', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.25, 500);
      c = await h.rect(canvas);
      h.mark('cap');
      for (const [x, y] of [[13, 9], [20, 9], [27, 9]]) await h.tapAt(...P(x, y), 200);
      await h.sleep(2500);
      h.mark('end');
    });
  },

  // waves: drag a source, Young's slits, then a supersonic Doppler source
  async waves() {
    await record('waves', '/#/app?lab=waves', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.25, 700);
      h.mark('start');
      await h.sleep(1200);
      let c = await h.rect(canvas);
      const P = (x, y) => [c.left + (x / 40) * c.w, c.top + (y / 25) * c.h];
      h.mark('drag');
      const [x1, y1] = P(6, 9.5);
      const [x2, y2] = P(6, 5);
      await h.drag(x1, y1, x2, y2, 1600);
      await h.sleep(1500);
      await h.tap('Опыт Юнга (две щели)', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.25, 500);
      h.mark('young');
      await h.sleep(3000);
      await h.tap('Эффект Доплера', { exact: true, after: 300 });
      await h.reveal(canvas, null, 0.25, 500);
      h.mark('doppler');
      await h.sleep(2500);
      await h.setRange(1, 1.4);
      h.mark('mach');
      await h.sleep(7500);
      h.mark('end');
    });
  },

  // build an atom: Na → Na⁺, then carbon-14
  async atom() {
    await record('atom', '/#/app?lab=atom', async (h) => {
      const svg = `return document.querySelector('main svg[aria-label]')`;
      await h.reveal(svg, null, 0.08, 600);
      h.mark('start');
      await h.sleep(1500);
      await h.reveal(`return [...document.querySelectorAll('main button')].find(b => b.innerText.replace(/\\s/g,'') === '11Na')`, null, 0.6, 700);
      await h.tapEl(`return [...document.querySelectorAll('main button')].find(b => b.innerText.replace(/\\s/g,'') === '11Na')`, null, 300);
      await h.reveal(svg, null, 0.08, 700);
      h.mark('na');
      await h.sleep(1200);
      await h.reveal(`return document.querySelectorAll('main button[aria-label="−"]')[2]`, null, 0.55, 600);
      await h.tapEl(`return document.querySelectorAll('main button[aria-label="−"]')[2]`, null, 400);
      h.mark('ion');
      await h.reveal(`return [...document.querySelectorAll('main div')].find(d => d.innerText.startsWith('Натрий') && d.innerText.includes('катион'))`, null, 0.3, 800);
      await h.sleep(1800);
      await h.reveal(`return [...document.querySelectorAll('main button')].find(b => b.innerText.replace(/\\s/g,'') === '6C')`, null, 0.6, 700);
      await h.tapEl(`return [...document.querySelectorAll('main button')].find(b => b.innerText.replace(/\\s/g,'') === '6C')`, null, 300);
      await h.reveal(`return document.querySelectorAll('main button[aria-label="+"]')[1]`, null, 0.55, 600);
      h.mark('c14');
      await h.tapEl(`return document.querySelectorAll('main button[aria-label="+"]')[1]`, null, 350);
      await h.tapEl(`return document.querySelectorAll('main button[aria-label="+"]')[1]`, null, 600);
      await h.reveal(`return [...document.querySelectorAll('main div')].find(d => d.innerText.startsWith('Нестабильный изотоп'))`, null, 0.35, 800);
      await h.sleep(2000);
      h.mark('end');
    });
  },

  // kinetics: heat it up, then cool it down with a catalyst
  async kin() {
    await record('kin', '/#/app?lab=kinetics', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.1, 700);
      h.mark('start');
      await h.sleep(3500);
      h.mark('hot');
      await h.reveal(`return document.querySelectorAll('main input[type=range]')[0]`, null, 0.75, 500);
      await h.setRange(0, 6);
      await h.reveal(canvas, null, 0.1, 500);
      await h.sleep(3000);
      h.mark('cold');
      await h.reveal(`return document.querySelectorAll('main input[type=range]')[0]`, null, 0.75, 500);
      await h.setRange(0, 1.4);
      await h.tapEl(`return document.querySelector('main input[type=checkbox]')`, null, 300);
      await h.reveal(canvas, null, 0.1, 500);
      await h.sleep(3500);
      h.mark('end');
    });
  },

  // natural selection: generations on sooty bark, then the "you are the bird" game
  async sel() {
    await record('sel', '/#/app?lab=selection', async (h) => {
      const canvas = `return document.querySelector('main canvas')`;
      await h.reveal(canvas, null, 0.12, 600);
      h.mark('start');
      await h.sleep(2500);
      h.mark('bird');
      await h.tap('Ты — птица', { exact: true, at: 0.75, after: 200 });
      await h.reveal(canvas, null, 0.12, 400);
      // find the light (visible) moths on the canvas and peck them
      const light = await h.page.evaluate(() => {
        const cv = document.querySelector('main canvas');
        const ctx = cv.getContext('2d');
        const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
        const cells = new Map();
        const step = 3;
        for (let y = 0; y < cv.height; y += step)
          for (let x = 0; x < cv.width; x += step) {
            const i = (y * cv.width + x) * 4;
            if (data[i] > 215 && data[i + 1] > 210 && data[i + 2] > 190) {
              const key = Math.floor(x / 60) + ',' + Math.floor(y / 60);
              const c = cells.get(key) || { x: 0, y: 0, n: 0 };
              c.x += x;
              c.y += y;
              c.n++;
              cells.set(key, c);
            }
          }
        const r = cv.getBoundingClientRect();
        const k = r.width / cv.width;
        return [...cells.values()].filter((c) => c.n > 8).map((c) => ({ x: r.left + (c.x / c.n) * k, y: r.top + (c.y / c.n) * k }));
      });
      for (const m of light.slice(0, 10)) await h.tapAt(m.x, m.y, 280);
      await h.sleep(10500);
      // stronger predation so the change shows within a few generations
      await h.reveal(`return document.querySelectorAll('main input[type=range]')[0]`, null, 0.7, 500);
      await h.setRange(0, 0.85);
      h.mark('run');
      await h.tap('Смена поколений', { exact: true, at: 0.75, after: 200 });
      const running = await h.page.evaluate(() => [...document.querySelectorAll('main button')].some((b) => b.innerText.trim() === 'Пауза'));
      if (!running) await h.tap('Смена поколений', { exact: true, at: 0.75, after: 200 });
      await h.reveal(canvas, null, 0.12, 400);
      await h.sleep(9000);
      h.mark('graph');
      await h.reveal(`return [...document.querySelectorAll('main h3')].find(e => /доля тёмных/i.test(e.innerText))`, null, 0.25, 900);
      await h.sleep(6000);
      h.mark('end');
    });
  },

  // photosynthesis: bring the lamp closer, then a green filter
  async photo() {
    await record('photo', '/#/app?lab=photosynthesis', async (h) => {
      const svg = `return document.querySelector('main svg[aria-label]')`;
      await h.reveal(svg, null, 0.1, 600);
      h.mark('start');
      await h.sleep(2500);
      await h.reveal(`return document.querySelectorAll('main input[type=range]')[0]`, null, 0.8, 500);
      await h.setRange(0, 45);
      await h.reveal(svg, null, 0.1, 500);
      h.mark('far');
      await h.sleep(2500);
      await h.reveal(`return document.querySelectorAll('main input[type=range]')[0]`, null, 0.8, 500);
      await h.setRange(0, 10);
      await h.reveal(svg, null, 0.1, 500);
      h.mark('close');
      await h.sleep(3000);
      await h.tap('зелёный', { exact: true, at: 0.8, after: 300 });
      await h.reveal(svg, null, 0.1, 500);
      h.mark('green');
      await h.sleep(3000);
      h.mark('end');
    });
  },

  // the AI mentor solves a problem with proper formulas
  async mentor() {
    const answer = fs.readFileSync('scripts/mentor-answer.txt', 'utf8');
    await record(
      'mentor',
      '/#/app',
      async (h) => {
        h.mark('start');
        await h.sleep(500);
        await h.tap('Наставник', { scope: 'header', exact: true, after: 500 });
        await h.tapEl(`return document.querySelector('textarea')`, null, 200);
        h.mark('type');
        await h.type('Дай задачу на закон Ома и разбери решение');
        await h.sleep(300);
        await h.tapEl(`return document.querySelector('button[aria-label="Отправить"]')`, null, 0);
        h.mark('sent');
        await h.sleep(2200);
        h.mark('answer');
        const sc = `return [...document.querySelectorAll('div.overflow-y-auto')].find(d => d.scrollHeight > d.clientHeight)`;
        for (let i = 0; i < 4; i++) {
          await h.page.evaluate((src) => {
            const el = new Function(src)();
            if (el) el.scrollBy({ top: 150 });
          }, sc);
          await h.sleep(900);
        }
        h.mark('end');
        await h.sleep(800);
      },
      {
        fn: (text) => {
          const orig = window.fetch;
          window.fetch = (u, o) =>
            String(u).includes('mentor')
              ? new Promise((res) => setTimeout(() => res(new Response(JSON.stringify({ answer: text }), { headers: { 'Content-Type': 'application/json', 'X-Mentor-Left': '4' } })), 1500))
              : orig(u, o);
        },
        arg: answer,
      },
    );
  },

  // formula sheet: scroll, then search
  async formulas() {
    await record('formulas', '/#/app?lab=formulas', async (h) => {
      h.mark('start');
      await h.sleep(800);
      await h.scrollBy(600, 1600);
      await h.scrollBy(700, 1600);
      await h.scrollTo(0, 700);
      h.mark('search');
      await h.tapEl(`return document.querySelector('main input[placeholder]')`, null, 200);
      await h.type('импульс');
      await h.sleep(2200);
      h.mark('end');
    });
  },

  // the builders showcase on the labs page
  async labs() {
    await record('labs', '/#/app?lab=labs', async (h) => {
      await h.reveal(`return [...document.querySelectorAll('main h3')].find(e => e.innerText.includes('Космос'))`, null, 0.2, 10);
      h.mark('start');
      await h.sleep(600);
      for (let i = 0; i < 7; i++) await h.scrollBy(560, 900);
      h.mark('end');
      await h.sleep(400);
    });
  },
};

const want = process.argv.slice(2);
for (const [k, fn] of Object.entries(CLIPS)) {
  if (want.length && !want.includes(k)) continue;
  await fn();
}
