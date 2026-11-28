import { KY } from '../i18n/ky';

/* Kyrgyz as a layer over the Russian interface: the app renders in Russian and every text node (and placeholder,
   title, aria-label) found in the dictionary is swapped for its Kyrgyz version. Anything not translated yet stays
   Russian, which every ORT taker reads. Switching back restores the originals. */

export type UiLang = 'ru' | 'ky' | 'en';
const ATTRS = ['placeholder', 'title', 'aria-label'] as const;
const orig = new WeakMap<Node, string>();
let observer: MutationObserver | null = null;
let busy = false;
// the hand-made lines first; the machine translation of everything else loads only when Kyrgyz is picked
let DICT: Record<string, string> = KY;
let loading: Promise<void> | null = null;
const loadAuto = () =>
  (loading ??= import('../i18n/ky-auto.json').then((m) => {
    DICT = { ...(m.default as Record<string, string>), ...KY };
    seen.clear();
  }));

// text built at run time ("Опыт · Гипотеза", "7 класс", "понято 3 из 39") is translated piece by piece
const PARTS = /(\s[·—–|/]\s|,\s|:\s|\s*\(|\)\s*|[+\-−]?\d+(?:[.,]\d+)*\s*%?)/;
const tr = (s: string | null) => {
  if (!s) return null;
  const k = s.trim();
  if (!k || !/[А-Яа-яЁё]/.test(k)) return null;
  const v = DICT[k];
  if (v) return s.replace(k, v);
  let hit = false;
  const out = k
    .split(PARTS)
    .map((p) => {
      const t = p && DICT[p.trim()];
      if (!t) return p;
      hit = true;
      return p.replace(p.trim(), t);
    })
    .join('');
  return hit ? s.replace(k, out) : null;
};

// what the layer itself last wrote into a node, so its own change is never translated a second time
const written = new WeakMap<Node, string>();
function translateText(n: Text) {
  if (written.get(n) === n.data) return;
  const v = tr(n.data);
  if (v && v !== n.data) {
    orig.set(n, n.data);
    written.set(n, v);
    n.data = v;
  }
}
function translateEl(el: Element) {
  for (const a of ATTRS) {
    const cur = el.getAttribute(a);
    // already ours: setting it again would fire the observer forever
    if (cur === null || cur === el.getAttribute(`data-ky-${a}`)) continue;
    const v = tr(cur);
    if (v && v !== cur) {
      el.setAttribute(`data-ru-${a}`, cur);
      el.setAttribute(`data-ky-${a}`, v);
      el.setAttribute(a, v);
    }
  }
}
function walk(root: Node) {
  if (root.nodeType === 3) return translateText(root as Text);
  if (root.nodeType !== 1) return;
  const el = root as Element;
  if (el.closest('script,style,textarea,[contenteditable="true"],[data-no-ky]')) return;
  translateEl(el);
  const it = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = it.nextNode(); n; n = it.nextNode()) {
    if (n.nodeType === 3) translateText(n as Text);
    else translateEl(n as Element);
  }
}

/* Labels drawn on canvases (simulation stages, charts, certificates) never reach the DOM, so while Kyrgyz is on the
   2D context's text calls translate their string first; measureText too, so layouts that size boxes by text fit. */
type Ctx = CanvasRenderingContext2D;
const P = CanvasRenderingContext2D.prototype;
const native = { fillText: P.fillText, strokeText: P.strokeText, measureText: P.measureText };
const seen = new Map<string, string>();
const trCanvas = (s: unknown) => {
  if (typeof s !== 'string') return s as string;
  let v = seen.get(s);
  if (v === undefined) {
    v = tr(s) ?? s;
    if (seen.size > 5000) seen.clear();
    seen.set(s, v);
  }
  return v;
};
function patchCanvas(on: boolean) {
  if (on) {
    P.fillText = function (this: Ctx, t: string, x: number, y: number, w?: number) {
      return w === undefined ? native.fillText.call(this, trCanvas(t), x, y) : native.fillText.call(this, trCanvas(t), x, y, w);
    };
    P.strokeText = function (this: Ctx, t: string, x: number, y: number, w?: number) {
      return w === undefined ? native.strokeText.call(this, trCanvas(t), x, y) : native.strokeText.call(this, trCanvas(t), x, y, w);
    };
    P.measureText = function (this: Ctx, t: string) {
      return native.measureText.call(this, trCanvas(t));
    };
  } else Object.assign(P, native);
  seen.clear();
}

export function setKyrgyz(on: boolean) {
  document.documentElement.lang = on ? 'ky' : document.documentElement.lang === 'ky' ? 'ru' : document.documentElement.lang;
  if (on !== !!observer) patchCanvas(on);
  if (on && !observer) {
    walk(document.body);
    loadAuto().then(() => observer && walk(document.body));
    observer = new MutationObserver((ms) => {
      if (busy) return;
      busy = true;
      for (const m of ms) {
        if (m.type === 'characterData') translateText(m.target as Text);
        else if (m.type === 'attributes') translateEl(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
      observer?.takeRecords();
      busy = false;
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  } else if (!on && observer) {
    observer.disconnect();
    observer = null;
    const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = it.nextNode(); n; n = it.nextNode()) {
      const o = orig.get(n);
      if (o !== undefined) (n as Text).data = o;
    }
    for (const a of ATTRS) document.querySelectorAll(`[data-ru-${a}]`).forEach((el) => {
      el.setAttribute(a, el.getAttribute(`data-ru-${a}`)!);
      el.removeAttribute(`data-ru-${a}`);
      el.removeAttribute(`data-ky-${a}`);
    });
  }
}

/** ru → ky → en → ru; the label shows the language the button switches to */
export const nextLang = (l: UiLang): UiLang => (l === 'ru' ? 'ky' : l === 'ky' ? 'en' : 'ru');
export function readUiLang(): UiLang {
  try {
    const v = localStorage.getItem('lang');
    return v === 'en' || v === 'ky' ? v : 'ru';
  } catch {
    return 'ru';
  }
}
export const langLabel = () => ({ ru: 'КЫР', ky: 'EN', en: 'РУС' })[readUiLang()];
export const setUiLang = (l: UiLang) => window.dispatchEvent(new CustomEvent<UiLang>('set-lang', { detail: l }));
