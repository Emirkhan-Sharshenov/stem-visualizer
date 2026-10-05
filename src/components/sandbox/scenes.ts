import type { Body, Laws, Scene } from './physics';
import { inclinePoints, PULLEY_R, ropePath } from './physics';

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export const EARTH: Laws = { g: 9.8, friction: true, groundMu: 0.3, air: false, airK: 0.6, e: 0.4 };

export const COLORS = ['#5B8CFF', '#F5A524', '#30A46C', '#E5484D', '#AB8AFF', '#3DD6F5'];

export const block = (id: string, x: number, y: number, m: number, color = COLORS[0], o: Partial<Body> = {}): Body => ({
  id,
  kind: 'block',
  x,
  y,
  vx: 0,
  vy: 0,
  m,
  r: 0.25 + Math.min(0.2, m * 0.03),
  color,
  F: 0,
  Fdeg: 0,
  trace: false,
  ...o,
});
export const ball = (id: string, x: number, y: number, m: number, color = COLORS[1], o: Partial<Body> = {}): Body => ({ ...block(id, x, y, m, color, o), kind: 'ball', r: 0.2 + Math.min(0.15, m * 0.03), ...o });

export interface Preset {
  id: string;
  title: T2;
  /** what this experiment combines */
  laws: T2;
  /** what to try */
  hint: T2;
  /** which body to follow by default */
  focus?: string;
  make: () => Scene;
}

/** a point on an incline's slope, lifted by r along the normal */
function onSlope(x: number, w: number, deg: number, k: number, r: number) {
  const a = (deg * Math.PI) / 180;
  const [p0, , p2] = inclinePoints({ id: '', kind: 'incline', x, w, deg, flip: false, mu: 0 });
  return { x: p0.x + (p2.x - p0.x) * k - Math.sin(a) * r, y: p0.y + (p2.y - p0.y) * k + Math.cos(a) * r };
}

export const PRESETS: Preset[] = [
  {
    id: 'incline',
    title: t('Брусок на наклонной плоскости', 'Block on an incline'),
    laws: t('Тяготение + реакция опоры + трение', 'Gravity + normal force + friction'),
    hint: t('Увеличивай угол, пока брусок не сдвинется. Он поедет, когда tg α станет больше μ. Сравни ускорение с формулой a = g(sin α − μ cos α).', 'Raise the angle until the block slips: it moves once tan α exceeds μ. Compare the acceleration with a = g(sin α − μ cos α).'),
    focus: 'A',
    make: () => {
      const b = block('A', 0, 0, 2);
      Object.assign(b, onSlope(2, 7, 25, 0.82, b.r));
      return { W: 12, H: 6, bodies: [b], anchors: [], solids: [{ id: 'S1', kind: 'incline', x: 2, w: 7, deg: 25, flip: false, mu: 0.5 }], links: [], laws: { ...EARTH } };
    },
  },
  {
    id: 'atwood',
    title: t('Машина Атвуда', 'Atwood machine'),
    laws: t('Тяготение + натяжение нити + второй закон Ньютона', 'Gravity + rope tension + Newton’s 2nd law'),
    hint: t('Грузы связаны нитью, поэтому движутся с одним ускорением a = g(m₁ − m₂)/(m₁ + m₂). Сделай массы равными — что будет?', 'The masses share one acceleration a = g(m₁ − m₂)/(m₁ + m₂). Make them equal: what happens?'),
    focus: 'A',
    make: () => {
      const P = { id: 'P', kind: 'pulley' as const, x: 6, y: 5.4 };
      const A = block('A', 6 - PULLEY_R, 2.6, 3, COLORS[0]);
      const B = block('B', 6 + PULLEY_R, 3.4, 2, COLORS[1]);
      const L = ropePath(A, B, P);
      return { W: 12, H: 6, bodies: [A, B], anchors: [P], solids: [], links: [{ id: 'R1', kind: 'rope', a: 'A', b: 'B', via: 'P', L }], laws: { ...EARTH } };
    },
  },
  {
    id: 'table',
    title: t('Брусок на столе и груз на нити', 'Block on a table pulled by a hanging mass'),
    laws: t('Тяготение + трение + натяжение нити', 'Gravity + friction + rope tension'),
    hint: t('Груз тянет брусок через блок, а трение мешает. Найди, при какой массе груза брусок сдвинется: m₂g > μm₁g.', 'The hanging mass pulls the block through the pulley and friction resists. Find the mass that starts it moving: m₂g > μm₁g.'),
    focus: 'A',
    make: () => {
      const A = block('A', 2.5, 0, 2, COLORS[0]);
      A.y = 3 + A.r;
      const P = { id: 'P', kind: 'pulley' as const, x: 7.25, y: A.y };
      const B = block('B', 7.25 + PULLEY_R, 1.9, 1, COLORS[1]);
      const L = ropePath(A, B, P);
      return {
        W: 12,
        H: 6,
        bodies: [A, B],
        anchors: [P],
        solids: [{ id: 'S1', kind: 'table', x: 1, w: 6, h: 3, mu: 0.3 }],
        links: [{ id: 'R1', kind: 'rope', a: 'A', b: 'B', via: 'P', L }],
        laws: { ...EARTH },
      };
    },
  },
  {
    id: 'spring',
    title: t('Груз на пружине', 'Mass on a spring'),
    laws: t('Закон Гука + тяготение + сопротивление воздуха', 'Hooke’s law + gravity + air resistance'),
    hint: t('Период T = 2π√(m/k) не зависит от того, как сильно оттянуть груз. Включи сопротивление воздуха — колебания затухнут, энергия уйдёт в тепло.', 'The period T = 2π√(m/k) does not depend on how far you pull. Turn on air resistance: the swing dies out as energy turns into heat.'),
    focus: 'A',
    make: () => {
      const H = { id: 'H', kind: 'hook' as const, x: 6, y: 5.6 };
      const A = block('A', 6, 2.4, 1, COLORS[2]);
      return { W: 12, H: 6, bodies: [A], anchors: [H], solids: [], links: [{ id: 'K1', kind: 'spring', a: 'H', b: 'A', k: 40, L0: 1.8 }], laws: { ...EARTH } };
    },
  },
  {
    id: 'pendulum',
    title: t('Маятник', 'Pendulum'),
    laws: t('Тяготение + натяжение нити + сохранение энергии', 'Gravity + tension + conservation of energy'),
    hint: t('Смотри на столбики энергии: потенциальная переходит в кинетическую и обратно, а сумма не меняется. Период T = 2π√(L/g) — проверь на Луне.', 'Watch the energy bars: potential turns into kinetic and back while the total stays put. T = 2π√(L/g): try it on the Moon.'),
    focus: 'A',
    make: () => {
      const H = { id: 'H', kind: 'hook' as const, x: 6, y: 5.6 };
      const L = 3;
      const a = (40 * Math.PI) / 180;
      const A = ball('A', 6 + L * Math.sin(a), 5.6 - L * Math.cos(a), 1, COLORS[1], { trace: true });
      return { W: 12, H: 6, bodies: [A], anchors: [H], solids: [], links: [{ id: 'R1', kind: 'rope', a: 'H', b: 'A', L }], laws: { ...EARTH, friction: false } };
    },
  },
  {
    id: 'collision',
    title: t('Столкновение тележек', 'Colliding carts'),
    laws: t('Закон сохранения импульса + упругость удара', 'Conservation of momentum + elasticity'),
    hint: t('Импульс системы до и после удара одинаковый при любом ударе. А энергия сохраняется только при упругом (e = 1). Поставь e = 0 — тележки поедут вместе.', 'Total momentum is the same before and after any collision; energy is kept only when it is elastic (e = 1). Set e = 0 and the carts move off together.'),
    focus: 'A',
    make: () => {
      const A = block('A', 2, 0, 1, COLORS[0], { vx: 4 });
      A.y = A.r;
      const B = block('B', 7, 0, 3, COLORS[3]);
      B.y = B.r;
      return { W: 12, H: 6, bodies: [A, B], anchors: [], solids: [], links: [], laws: { ...EARTH, friction: false, e: 1 } };
    },
  },
  {
    id: 'projectile',
    title: t('Бросок под углом', 'Projectile'),
    laws: t('Тяготение + сопротивление воздуха', 'Gravity + air resistance'),
    hint: t('Без воздуха дальше всего летит тело, брошенное под 45°. Включи сопротивление — траектория станет несимметричной, а дальность меньше. Тело можно бросить мышкой.', 'Without air, 45° throws farthest. Add air resistance: the path turns lopsided and shorter. You can also throw with the mouse.'),
    focus: 'A',
    make: () => {
      const a = (50 * Math.PI) / 180;
      const A = ball('A', 0.6, 0.6, 0.5, COLORS[1], { vx: 9 * Math.cos(a), vy: 9 * Math.sin(a), trace: true });
      return { W: 14, H: 6, bodies: [A], anchors: [], solids: [], links: [], laws: { ...EARTH, e: 0.3 } };
    },
  },
  {
    id: 'empty',
    title: t('Пустой стол', 'Empty bench'),
    laws: t('Собери свой опыт', 'Build your own experiment'),
    hint: t('Добавь тела, наклонную плоскость, стол, блоки и крючки, соедини их нитями и пружинами. Тела можно таскать и бросать мышкой.', 'Add bodies, inclines, tables, pulleys and hooks, then connect them with ropes and springs. Drag and throw bodies with the mouse.'),
    make: () => ({ W: 12, H: 6, bodies: [], anchors: [], solids: [], links: [], laws: { ...EARTH } }),
  },
];
