import type { Circle, Soldier, World } from './engine';

/* The campaign: each level teaches one family of graphs. `solution` is one formula that wins in a single shot
   (checked by levels.test); any other formula that hits every target counts just as well. */

export interface Level {
  id: string;
  title: { ru: string; en: string };
  goal: { ru: string; en: string };
  hint: { ru: string; en: string };
  topic: string;
  shooter: [number, number];
  targets: [number, number][];
  obstacles: Circle[];
  solution: string;
}

const c = (x: number, y: number, r: number): Circle => ({ x, y, r });

export const LEVELS: Level[] = [
  {
    id: 'flat',
    title: { ru: 'Прямой выстрел', en: 'Straight shot' },
    goal: { ru: 'Цель на той же высоте. Какая функция не меняется?', en: 'The target is level with you. Which function never changes?' },
    hint: { ru: 'Постоянная: y = 0 (или любое число).', en: 'A constant: y = 0 (or any number).' },
    topic: 'm7-function-concept',
    shooter: [-16, 0],
    targets: [[14, 0]],
    obstacles: [c(-1, 6, 2.5), c(-1, -6, 2.5)],
    solution: '0',
  },
  {
    id: 'slope',
    title: { ru: 'Наклон', en: 'Slope' },
    goal: { ru: 'Цель выше на 12 и дальше на 30.', en: 'The target is 12 higher and 30 further.' },
    hint: { ru: 'Прямая y = kx, где k = подъём / расстояние.', en: 'A line y = kx with k = rise / run.' },
    topic: 'm7-linear-function',
    shooter: [-16, -6],
    targets: [[14, 6]],
    obstacles: [c(-1, 5, 2.4), c(4, -6, 2.6)],
    solution: '0.4x',
  },
  {
    id: 'down',
    title: { ru: 'Под горку', en: 'Downhill' },
    goal: { ru: 'Цель ниже. Над серединой — скала.', en: 'The target is lower, with a rock over the middle.' },
    hint: { ru: 'Отрицательный наклон: y = −kx.', en: 'A negative slope: y = −kx.' },
    topic: 'm7-linear-function',
    shooter: [-16, 8],
    targets: [[16, -8]],
    obstacles: [c(0, 5, 3), c(8, -10, 2)],
    solution: '-0.5x',
  },
  {
    id: 'two',
    title: { ru: 'Два в ряд', en: 'Two in a row' },
    goal: { ru: 'Обе цели одним выстрелом.', en: 'Both targets with one shot.' },
    hint: { ru: 'Они на одной прямой со стрелком — найди её наклон.', en: 'They’re on one line with you — find its slope.' },
    topic: 'm7-linear-function',
    shooter: [-18, -8],
    targets: [[-6, -2], [10, 6]],
    obstacles: [c(2, -6, 2.5), c(-10, 4, 2.2)],
    solution: 'x/2',
  },
  {
    id: 'wall',
    title: { ru: 'Через стену', en: 'Over the wall' },
    goal: { ru: 'Прямо не пройти — нужна дуга.', en: 'No straight way through: you need an arc.' },
    hint: { ru: 'Парабола ветвями вниз: y = −a·x(x − 30).', en: 'A downward parabola: y = −a·x(x − 30).' },
    topic: 'm9-quadratic-function',
    shooter: [-16, -6],
    targets: [[14, -6]],
    obstacles: [c(-1, -6, 4), c(-1, 8, 2)],
    solution: '-0.04x(x-30)',
  },
  {
    id: 'pit',
    title: { ru: 'Яма', en: 'The pit' },
    goal: { ru: 'Одна цель внизу, другая вверху справа.', en: 'One target down below, one up on the right.' },
    hint: { ru: 'Модуль даёт «галочку»: y = |x − a| − a.', en: 'Absolute value makes a V: y = |x − a| − a.' },
    topic: 'm6-modulus',
    shooter: [-16, 4],
    targets: [[-6, -6], [6, 6]],
    obstacles: [c(-10, 6, 2.2), c(0, -8, 2)],
    solution: '|x-10|-10',
  },
  {
    id: 'slalom',
    title: { ru: 'Слалом', en: 'Slalom' },
    goal: { ru: 'Обойди три скалы змейкой.', en: 'Weave round three rocks.' },
    hint: { ru: 'Синус: y = A·sin(kx). Период подбери так, чтобы горбы приходились на просветы.', en: 'Sine: y = A·sin(kx). Pick the period so the humps fall in the gaps.' },
    topic: 'm10-trig-functions',
    shooter: [-18, 0],
    targets: [[18, 0]],
    obstacles: [c(-12, -2.5, 3.2), c(0, 2.5, 3.2), c(12, -2.5, 3.2)],
    solution: '4sin(pi*x/12)',
  },
  {
    id: 'root',
    title: { ru: 'Крутой старт', en: 'Steep start' },
    goal: { ru: 'Сначала резко вверх, потом всё положе.', en: 'Up steeply at first, then flatter and flatter.' },
    hint: { ru: 'Корень: y = a·√x.', en: 'Square root: y = a·√x.' },
    topic: 'm8-sqrt',
    shooter: [-16, -8],
    targets: [[0, 0], [16, 3.31]],
    obstacles: [c(-12, -6, 1.4), c(8, -3, 2.5)],
    solution: '2sqrt(x)',
  },
  {
    id: 'launch',
    title: { ru: 'Взлёт', en: 'Lift-off' },
    goal: { ru: 'Пролети низко под скалой и взмой к цели.', en: 'Fly low under the rock, then soar to the target.' },
    hint: { ru: 'Экспонента: y = e^(x/k) − 1 растёт всё быстрее.', en: 'Exponential: y = e^(x/k) − 1 grows faster and faster.' },
    topic: 'm11-exponential',
    shooter: [-18, -10],
    targets: [[14, 8]],
    obstacles: [c(0, -1, 3), c(-6, 6, 2.5)],
    solution: 'e^(x/10.87)-1',
  },
  {
    id: 'final',
    title: { ru: 'Финал', en: 'Finale' },
    goal: { ru: 'Три цели, любые функции, как можно меньше выстрелов.', en: 'Three targets, any functions, as few shots as you can.' },
    hint: { ru: 'Сначала подумай, какие две цели лежат на одной простой кривой.', en: 'First see which two targets lie on one simple curve.' },
    topic: 'm9-graph-transform',
    shooter: [-18, 0],
    targets: [[-4, 7], [6, -3], [16, 9]],
    obstacles: [c(-10, 3, 2), c(1, 3, 2.4), c(10, 4, 2.2), c(4, -9, 2)],
    solution: '0.5x',
  },
];

/** a level as a playing field: the shooter is blue soldier 0, the targets are red dummies */
export function levelWorld(l: Level): World {
  const soldiers: Soldier[] = [
    { id: 0, team: 0, x: l.shooter[0], y: l.shooter[1], alive: true, name: 'Ты' },
    ...l.targets.map(([x, y], i): Soldier => ({ id: 10 + i, team: 1, x, y, alive: true, name: `Цель ${i + 1}` })),
  ];
  return { obstacles: l.obstacles, holes: [], soldiers };
}
