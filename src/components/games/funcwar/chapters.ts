import type { Circle, Ending, Soldier, World } from './engine';

/* "Бой функций": the advanced-graphs guide. Each chapter is one technique, a small field to try it on and
   example formulas whose outcome is checked by levels.test (a hit, or the instructive way it fails).
   Chapters 1–2 are free; the rest come with Pro. It teaches skill — it gives no in-game advantage. */

export interface Example { src: string; expect: 'hit' | Ending; ru: string; en: string }
export interface Chapter {
  id: string;
  title: { ru: string; en: string };
  idea: { ru: string; en: string };
  body: { ru: string[]; en: string[] };
  formula?: string;
  shooter: [number, number];
  targets: [number, number][];
  obstacles: Circle[];
  examples: Example[];
  free?: boolean;
}

const c = (x: number, y: number, r: number): Circle => ({ x, y, r });

export const CHAPTERS: Chapter[] = [
  {
    id: 'aim',
    free: true,
    title: { ru: 'Прицел через точку', en: 'Aiming through a point' },
    idea: { ru: 'Прямая y = kx попадёт в любую точку, если k = подъём ÷ расстояние.', en: 'A line y = kx hits any point if k = rise ÷ run.' },
    body: {
      ru: [
        'Нажми на цель на поле — прицел покажет её координаты относительно тебя, например x = 25, y = 10.',
        'Тогда k = y / x = 10 / 25 = 0,4. Формула y = 0,4x проходит ровно через цель.',
        'Ошибка в k даже на 0,1 на расстоянии 25 — это промах на 2,5 клетки. Считай, а не угадывай.',
      ],
      en: [
        'Tap the target: the sight shows it relative to you, e.g. x = 25, y = 10.',
        'Then k = y / x = 10 / 25 = 0.4, and y = 0.4x passes right through it.',
        'Being off by 0.1 at a distance of 25 misses by 2.5 squares. Work it out; don’t guess.',
      ],
    },
    formula: 'k = \\dfrac{\\Delta y}{\\Delta x}',
    shooter: [-15, -5],
    targets: [[10, 5]],
    obstacles: [c(-2, 6, 2.5)],
    examples: [
      { src: '0.4x', expect: 'hit', ru: 'k = 10/25 — точно в цель', en: 'k = 10/25: dead on' },
      { src: '0.5x', expect: 'edge', ru: 'k на 0,1 больше — снаряд уходит выше', en: 'k 0.1 too big: it sails over' },
    ],
  },
  {
    id: 'arc',
    free: true,
    title: { ru: 'Дуга через стену', en: 'An arc over a wall' },
    idea: { ru: 'Парабола y = −a·x(x − d) стартует у тебя и возвращается на ту же высоту через d клеток.', en: 'The parabola y = −a·x(x − d) starts at you and comes back to your height d squares ahead.' },
    body: {
      ru: [
        'Корни параболы — x = 0 (ты) и x = d (цель на той же высоте). Значит, d — расстояние до цели.',
        'Высота дуги в середине равна a·(d/2)². Подбирай a так, чтобы вершина была выше препятствия.',
        'Слишком маленькое a — снаряд чиркнет по скале, слишком большое — улетит за верхний край.',
      ],
      en: [
        'Its roots are x = 0 (you) and x = d (a target at your height), so d is the distance to the target.',
        'The peak height is a·(d/2)². Pick a so the peak clears the rock.',
        'Too small an a scrapes the rock; too large flies off the top.',
      ],
    },
    formula: 'y = -a\\,x\\,(x-d)',
    shooter: [-15, -5],
    targets: [[15, -5]],
    obstacles: [c(0, -5, 3.5)],
    examples: [
      { src: '-0.02x(x-30)', expect: 'hit', ru: 'вершина 4,5 — над скалой', en: 'a peak of 4.5 clears the rock' },
      { src: '-0.01x(x-30)', expect: 'obstacle', ru: 'вершина 2,25 — врезается в скалу', en: 'a peak of 2.25 hits the rock' },
    ],
  },
  {
    id: 'bump',
    title: { ru: 'Горб: колокол Гаусса', en: 'A bump: the Gaussian bell' },
    idea: { ru: 'y = A·e^(−((x−c)/w)²) — ровно, горб высотой A в точке c, снова ровно.', en: 'y = A·e^(−((x−c)/w)²) is flat, a bump of height A at c, then flat again.' },
    body: {
      ru: [
        'В отличие от параболы, колокол не трогает траекторию вдали от c: до и после горба снаряд летит ровно.',
        'c — где перепрыгнуть препятствие, A — насколько высоко, w — ширина горба (чем больше, тем шире).',
        'Горб удобно добавлять к любой другой формуле, чтобы перешагнуть одну скалу и не сбить прицел.',
      ],
      en: [
        'Unlike a parabola, the bell leaves the path alone away from c: flat before and after the bump.',
        'c is where to hop, A how high, w how wide.',
        'Add a bump to any formula to step over one rock without spoiling the aim.',
      ],
    },
    formula: 'y = A\\,e^{-\\left(\\frac{x-c}{w}\\right)^2}',
    shooter: [-15, 0],
    targets: [[15, 0]],
    obstacles: [c(0, 0, 2)],
    examples: [
      { src: '5e^(-((x-15)/4)^2)', expect: 'hit', ru: 'горб высотой 5 над скалой, дальше ровно', en: 'a bump of 5 over the rock, flat after' },
      { src: '5e^(-(x-15)^2)', expect: 'obstacle', ru: 'слишком узкий горб (w = 1) — задевает край скалы', en: 'too narrow (w = 1): it clips the rock’s edge' },
    ],
  },
  {
    id: 'step',
    title: { ru: 'Ступенька: гиперболический тангенс', en: 'A step: hyperbolic tangent' },
    idea: { ru: 'y = H·(1 + th((x−c)/w))/2 — лететь низко, подняться на H и лететь ровно на новой высоте.', en: 'y = H·(1 + tanh((x−c)/w))/2: fly low, climb by H, then fly level up there.' },
    body: {
      ru: [
        'th плавно переходит от −1 к +1, поэтому выражение поднимает траекторию с 0 до H около точки c.',
        'Это лучший способ попасть в цель на уступе за препятствием: после подъёма высота почти не меняется.',
        'w задаёт крутизну: маленькое w — резкий подъём, большое — пологий.',
      ],
      en: [
        'tanh slides from −1 to +1, so this lifts the path from 0 to H around c.',
        'The best way onto a ledge behind a rock: after the climb the height barely changes.',
        'w sets how steep: small w climbs sharply, large w gently.',
      ],
    },
    formula: 'y = \\tfrac{H}{2}\\left(1 + \\tanh\\tfrac{x-c}{w}\\right)',
    shooter: [-15, -6],
    targets: [[12, 4]],
    obstacles: [c(5, -6, 4), c(7, 1.6, 1.2), c(-8, 3, 2)],
    examples: [
      { src: '5(1+th((x-12)/2))', expect: 'hit', ru: 'подъём на 10 у x = 12, дальше ровно', en: 'climbs 10 at x = 12, then level' },
      { src: '0.37x', expect: 'obstacle', ru: 'прямая на ту же цель упирается в скалу', en: 'a straight line at it hits the rock' },
    ],
  },
  {
    id: 'sum',
    title: { ru: 'Сложение графиков', en: 'Adding graphs' },
    idea: { ru: 'Прицел + обход: прямая ведёт в цель, а добавленный горб перепрыгивает скалу на пути.', en: 'Aim + detour: a line aims at the target, and an added bump hops the rock on the way.' },
    body: {
      ru: [
        'Сумма функций складывает их высоты в каждой точке. Прямая 0,3x попадает в цель, но на пути скала.',
        'Добавляем горб 4·e^(−((x−14)/3)²): у скалы он поднимает снаряд на 4, а у цели почти равен нулю.',
        'Так собираются сложные траектории: одна часть целится, другие обходят препятствия.',
      ],
      en: [
        'A sum adds heights point by point. The line 0.3x hits the target, but a rock is in the way.',
        'Add the bump 4·e^(−((x−14)/3)²): it lifts the shot by 4 at the rock and is almost zero at the target.',
        'That’s how complex paths are built: one part aims, the others dodge.',
      ],
    },
    formula: 'y = kx + A\\,e^{-\\left(\\frac{x-c}{w}\\right)^2}',
    shooter: [-15, -6],
    targets: [[13, 2.4]],
    obstacles: [c(-1, -1.8, 1.8)],
    examples: [
      { src: '0.3x + 4e^(-((x-14)/3)^2)', expect: 'hit', ru: 'прямая + горб над скалой', en: 'line + a bump over the rock' },
      { src: '0.3x', expect: 'obstacle', ru: 'без горба — прямо в скалу', en: 'without the bump: into the rock' },
    ],
  },
  {
    id: 'weave',
    title: { ru: 'Змейка: синус и его период', en: 'Weaving: sine and its period' },
    idea: { ru: 'A·sin(πx/L) пересекает ось каждые L клеток. Подбери L так, чтобы горбы приходились на просветы.', en: 'A·sin(πx/L) crosses the axis every L squares. Choose L so the humps land in the gaps.' },
    body: {
      ru: [
        'Скалы стоят через 12 клеток то сверху, то снизу. Значит, нужен синус с полупериодом 12: sin(πx/12).',
        'Амплитуда A — как далеко уходить от оси. Цель на оси через 36 клеток — ровно три полупериода, синус там снова 0.',
        'Неверный период сдвигает горбы — и снаряд врезается в скалу.',
      ],
      en: [
        'Rocks sit every 12 squares, alternating above and below, so use a half-period of 12: sin(πx/12).',
        'A is how far to swing. The target on the axis 36 squares away is three half-periods: the sine is 0 again.',
        'The wrong period shifts the humps into a rock.',
      ],
    },
    formula: 'y = A \\sin\\frac{\\pi x}{L}',
    shooter: [-18, 0],
    targets: [[18, 0]],
    obstacles: [c(-12, -2.5, 3.2), c(0, 2.5, 3.2), c(12, -2.5, 3.2)],
    examples: [
      { src: '4sin(pi*x/12)', expect: 'hit', ru: 'период совпал со скалами', en: 'the period matches the rocks' },
      { src: '4sin(pi*x/10)', expect: 'obstacle', ru: 'период короче — горб попадает в скалу', en: 'a shorter period: a hump hits a rock' },
    ],
  },
  {
    id: 'traps',
    title: { ru: 'Ловушки: разрывы и края', en: 'Traps: breaks and edges' },
    idea: { ru: 'Снаряд гибнет на разрыве графика, вне области определения и за краем поля. Насыщающие функции спасают.', en: 'A shot dies at a break, outside the domain and off the field. Saturating functions save you.' },
    body: {
      ru: [
        'Где у графика скачок — например, у целой части floor(x/5) каждые 5 клеток, — выстрел обрывается.',
        '1/(x − 10) и экспонента так быстро уходят вверх или вниз, что снаряд вылетает за край поля раньше цели.',
        'arctg (atan) растёт, но никогда не выше π/2: 8·atan(x/5) поднимается и выравнивается — снаряд не уйдёт за край.',
      ],
      en: [
        'Where the graph jumps — like floor(x/5) every 5 squares — the shot ends.',
        '1/(x − 10) and exponentials race off so fast that the shot leaves the field before the target.',
        'atan rises but never past π/2: 8·atan(x/5) climbs and levels off, so the shot stays on the field.',
      ],
    },
    formula: '8\\arctan\\frac{x}{5} < 4\\pi',
    shooter: [-15, -5],
    targets: [[10, 6]],
    obstacles: [c(0, 9, 2)],
    examples: [
      { src: '8atan(x/5)', expect: 'hit', ru: 'поднялся и выровнялся — в цель', en: 'climbs, levels off, hits' },
      { src: 'floor(x/5)', expect: 'jump', ru: 'скачок у x = 5 — выстрел оборвался', en: 'a jump at x = 5 ends the shot' },
      { src: '1/(x-10)', expect: 'edge', ru: 'у x = 10 ушла в бесконечность — за край', en: 'races to infinity at x = 10: off the field' },
      { src: 'e^(x/3)-1', expect: 'edge', ru: 'экспонента ушла за край', en: 'the exponential leaves the field' },
    ],
  },
  {
    id: 'two',
    title: { ru: 'Две цели одной параболой', en: 'Two targets with one parabola' },
    idea: { ru: 'y = ax² + bx проходит через тебя и через любые две точки — нужно решить систему из двух уравнений.', en: 'y = ax² + bx passes through you and any two points: solve two equations.' },
    body: {
      ru: [
        'Цели относительно тебя: (10; 8) и (24; 2). Подставляем: 100a + 10b = 8 и 576a + 24b = 2.',
        'Из первого b = 0,8 − 10a, во втором получаем 336a = −17,2, то есть a ≈ −0,0512 и b ≈ 1,312.',
        'Одна формула — два попадания. Так же через три точки строят кубическую параболу.',
      ],
      en: [
        'Targets relative to you: (10, 8) and (24, 2). Plug in: 100a + 10b = 8 and 576a + 24b = 2.',
        'From the first b = 0.8 − 10a; the second gives 336a = −17.2, so a ≈ −0.0512, b ≈ 1.312.',
        'One formula, two hits. Three points give a cubic the same way.',
      ],
    },
    formula: '\\begin{cases} 100a + 10b = 8 \\\\ 576a + 24b = 2 \\end{cases}',
    shooter: [-16, -4],
    targets: [[-6, 4], [8, -2]],
    obstacles: [c(-1, -6, 2.5)],
    examples: [{ src: '-0.0512x^2+1.312x', expect: 'hit', ru: 'обе цели одним выстрелом', en: 'both targets in one shot' }],
  },
  {
    id: 'tactics',
    title: { ru: 'Тактика: кратеры и укрытия', en: 'Tactics: craters and cover' },
    idea: { ru: 'Каждый промах выгрызает кратер. Можно прорыть проход — а соперник может разрушить твоё укрытие.', en: 'Every miss bites a crater. You can dig a tunnel — and the enemy can wreck your cover.' },
    body: {
      ru: [
        'Если обойти скалу трудно, стреляй сквозь неё: два-три выстрела y = 0 прорывают туннель.',
        'Укрытие работает в обе стороны: стоишь за скалой — сложнее попасть в тебя, но и тебе сложнее стрелять.',
        'Осторожно со своими: снаряд, пролетевший через союзника, отнимает у него жизнь.',
      ],
      en: [
        'If a rock is hard to curve round, shoot through it: two or three y = 0 shots dig a tunnel.',
        'Cover cuts both ways: behind a rock you’re harder to hit, and it’s harder to shoot.',
        'Mind your team: a shot through an ally costs them a life.',
      ],
    },
    shooter: [-15, 0],
    targets: [[12, 0]],
    obstacles: [c(-7, 0, 1.6)],
    examples: [{ src: '0', expect: 'obstacle', ru: 'жми несколько раз — туннель растёт', en: 'press a few times: the tunnel grows' }],
  },
];

export function chapterWorld(ch: Chapter): World {
  const soldiers: Soldier[] = [
    { id: 0, team: 0, x: ch.shooter[0], y: ch.shooter[1], alive: true, name: 'Ты' },
    ...ch.targets.map(([x, y], i): Soldier => ({ id: 10 + i, team: 1, x, y, alive: true, name: `Цель ${i + 1}` })),
  ];
  return { obstacles: ch.obstacles, holes: [], soldiers };
}
