import type { Circle, Ending, Soldier, World } from './engine';

/* "Бой функций": the guide. One chapter per family of functions (and two on tactics): what the function is, the
   shape of its graph, what each parameter does, where it is defined, how to use it in battle and the usual
   mistakes; then a field with example shots and sliders that redraw the path as a parameter moves.
   Example outcomes are checked by levels.test. Access: 'free' for everyone, 'trial' also during the free week,
   'pro' with Pro. The guide teaches; it gives no in-game advantage. */

type L = { ru: string; en: string };
export interface Example { src: string; expect: 'hit' | Ending; ru: string; en: string }
export interface Param { key: string; label: L; min: number; max: number; step: number; value: number }
export interface Chapter {
  id: string;
  access: 'free' | 'trial' | 'pro';
  title: L;
  idea: L;
  /** what the function is and how its graph looks */
  about: { ru: string[]; en: string[] };
  /** what each parameter does: [name, ru, en] */
  params: [string, string, string][];
  /** how to use it in battle */
  battle: { ru: string[]; en: string[] };
  /** the usual mistakes */
  mistakes: { ru: string[]; en: string[] };
  formula?: string;
  /** a formula with {keys} and sliders for them; the path redraws as they move */
  play?: { template: string; params: Param[] };
  shooter: [number, number];
  targets: [number, number][];
  obstacles: Circle[];
  examples: Example[];
}

const c = (x: number, y: number, r: number): Circle => ({ x, y, r });
const p = (key: string, ru: string, en: string, min: number, max: number, step: number, value: number): Param => ({ key, label: { ru, en }, min, max, step, value });

export const CHAPTERS: Chapter[] = [
  {
    id: 'line',
    access: 'free',
    title: { ru: 'Прямая y = kx', en: 'The line y = kx' },
    idea: { ru: 'Прямая попадёт в любую точку, если k = подъём ÷ расстояние.', en: 'A line hits any point if k = rise ÷ run.' },
    about: {
      ru: [
        'Линейная функция y = kx — это прямая через начало координат. В игре начало координат — ты сам: x отсчитывается вперёд от стрелка, y — вверх от него.',
        'Число k называют угловым коэффициентом. Оно показывает, на сколько клеток прямая поднимается за одну клетку вперёд. k = 0,5 — на полклетки вверх за каждую клетку, k = −1 — на клетку вниз.',
        'Слагаемое +b в игре ничего не меняет: график всегда сдвигается так, чтобы начинаться у стрелка. Поэтому y = 0,4x и y = 0,4x + 7 летят одинаково.',
      ],
      en: [
        'y = kx is a line through the origin, and in the game the origin is you: x runs ahead of the shooter, y up from them.',
        'k is the slope: how many squares the line climbs per square ahead. k = 0.5 climbs half a square per square, k = −1 drops one.',
        'A +b does nothing here: the graph is always shifted to start at the shooter, so y = 0.4x and y = 0.4x + 7 fly the same.',
      ],
    },
    params: [['k', 'наклон: k > 0 — вверх, k < 0 — вниз, k = 0 — ровно вперёд', 'slope: k > 0 up, k < 0 down, k = 0 straight ahead']],
    battle: {
      ru: ['Нажми на цель — прицел покажет её координаты относительно тебя, например x = 25, y = 10.', 'Тогда k = y ÷ x = 10 ÷ 25 = 0,4, и y = 0,4x проходит ровно через цель.'],
      en: ['Tap the target: the sight shows it relative to you, e.g. x = 25, y = 10.', 'Then k = y ÷ x = 10 ÷ 25 = 0.4, and y = 0.4x passes right through it.'],
    },
    mistakes: {
      ru: ['Перепутать x и y: k = 25 ÷ 10 = 2,5 улетит вверх.', 'Ошибка в k на 0,1 на расстоянии 25 — промах на 2,5 клетки. Считай, а не угадывай.'],
      en: ['Swapping x and y: k = 25 ÷ 10 = 2.5 flies off the top.', 'Off by 0.1 at a distance of 25 misses by 2.5 squares. Work it out.'],
    },
    formula: 'k = \\dfrac{\\Delta y}{\\Delta x}',
    play: { template: '{k}x', params: [p('k', 'Наклон k', 'Slope k', -1, 1, 0.05, 0.2)] },
    shooter: [-15, -5],
    targets: [[10, 5]],
    obstacles: [c(-2, 6, 2.5)],
    examples: [
      { src: '0.4x', expect: 'hit', ru: 'k = 10/25 — точно в цель', en: 'k = 10/25: dead on' },
      { src: '0.5x', expect: 'edge', ru: 'k на 0,1 больше — уходит выше', en: 'k 0.1 too big: it sails over' },
    ],
  },
  {
    id: 'arc',
    access: 'free',
    title: { ru: 'Парабола через корни', en: 'A parabola by its roots' },
    idea: { ru: 'y = −a·x(x − d) стартует у тебя и возвращается на ту же высоту через d клеток.', en: 'y = −a·x(x − d) starts at you and returns to your height d squares ahead.' },
    about: {
      ru: [
        'Квадратичная функция — это парабола. Если записать её через корни, y = −a·x(x − d), сразу видно, где график пересекает ось: в x = 0 (это ты) и в x = d.',
        'Знак минус перед a разворачивает ветви вниз, и получается дуга, как у брошенного мяча. Вершина дуги — ровно посередине, в x = d/2.',
        'Высота вершины равна a·(d/2)². При d = 30 и a = 0,02 это 0,02 · 15² = 4,5 клетки.',
      ],
      en: [
        'A quadratic is a parabola. Written by its roots, y = −a·x(x − d), you see where it meets the axis: x = 0 (you) and x = d.',
        'The minus turns the branches down into an arc like a thrown ball; the peak is halfway, at x = d/2.',
        'The peak height is a·(d/2)²: with d = 30 and a = 0.02 that is 4.5 squares.',
      ],
    },
    params: [
      ['d', 'где дуга снова на твоей высоте — ставь расстояние до цели', 'where the arc is back at your height: the distance to the target'],
      ['a', 'насколько высокая дуга: вершина = a·(d/2)²', 'how high: the peak is a·(d/2)²'],
    ],
    battle: {
      ru: ['Цель на твоей высоте за стеной: d = расстояние до цели, a подбери, чтобы вершина была выше стены.'],
      en: ['A target at your height behind a wall: d = its distance, a so the peak clears the wall.'],
    },
    mistakes: {
      ru: ['Слишком маленькое a — чиркнет по скале.', 'Слишком большое a — улетит за верхний край поля (он на 12 клеток выше центра).'],
      en: ['Too small an a scrapes the rock.', 'Too big flies off the top of the field.'],
    },
    formula: 'y = -a\\,x\\,(x-d)',
    play: { template: '-{a}x(x-{d})', params: [p('a', 'Высота a', 'Height a', 0.005, 0.06, 0.005, 0.01), p('d', 'Корень d', 'Root d', 10, 40, 1, 30)] },
    shooter: [-15, -5],
    targets: [[15, -5]],
    obstacles: [c(0, -5, 3.5)],
    examples: [
      { src: '-0.02x(x-30)', expect: 'hit', ru: 'вершина 4,5 — над скалой', en: 'a peak of 4.5 clears the rock' },
      { src: '-0.01x(x-30)', expect: 'obstacle', ru: 'вершина 2,25 — врезается в скалу', en: 'a peak of 2.25 hits the rock' },
    ],
  },
  {
    id: 'vertex',
    access: 'trial',
    title: { ru: 'Парабола через вершину', en: 'A parabola by its vertex' },
    idea: { ru: 'y = −a(x − h)² + a·h² — вершина в точке (h; a·h²). Ставь вершину прямо в цель.', en: 'y = −a(x − h)² + a·h² has its peak at (h, a·h²). Put the peak on the target.' },
    about: {
      ru: [
        'Вершинная форма параболы: y = −a(x − h)² + k. Здесь (h; k) — вершина, самая высокая точка дуги.',
        'Чтобы дуга начиналась у тебя (в x = 0, y = 0), нужно k = a·h². Подставь x = 0: −a·h² + a·h² = 0.',
        'Удобно, когда цель стоит на самом верху дуги: тогда h — расстояние до цели, а a·h² — её высота, и a = высота ÷ h².',
      ],
      en: [
        'The vertex form is y = −a(x − h)² + k, with (h, k) the peak.',
        'For the arc to start at you (x = 0, y = 0) you need k = a·h²: at x = 0, −a·h² + a·h² = 0.',
        'Handy when the target sits at the top: h is its distance, a·h² its height, so a = height ÷ h².',
      ],
    },
    params: [
      ['h', 'где вершина (расстояние вперёд)', 'where the peak is (distance ahead)'],
      ['a', 'крутизна; высота вершины a·h²', 'steepness; the peak height is a·h²'],
    ],
    battle: {
      ru: ['Цель выше тебя на 9 и дальше на 15: h = 15, a = 9 ÷ 15² = 0,04. Формула: −0,04(x − 15)² + 9.'],
      en: ['A target 9 up and 15 ahead: h = 15, a = 9 ÷ 225 = 0.04, so −0.04(x − 15)² + 9.'],
    },
    mistakes: {
      ru: ['Забыть «+ a·h²» — дуга начнётся не у тебя, а игра всё равно её сдвинет, и вершина окажется не там.'],
      en: ['Dropping “+ a·h²”: the game shifts the curve anyway and the peak lands elsewhere.'],
    },
    formula: 'y = -a\\,(x-h)^2 + a h^2',
    play: { template: '-{a}(x-{h})^2+{a}*{h}^2', params: [p('h', 'Вершина h', 'Peak h', 5, 25, 1, 12), p('a', 'Крутизна a', 'Steepness a', 0.01, 0.08, 0.005, 0.03)] },
    shooter: [-15, -6],
    targets: [[0, 3]],
    obstacles: [c(0, -4, 2)],
    examples: [
      { src: '-0.04(x-15)^2+9', expect: 'hit', ru: 'вершина ровно в цели', en: 'the peak right on the target' },
      { src: '-0.03(x-15)^2+6.75', expect: 'edge', ru: 'вершина на 2,25 ниже — мимо', en: 'the peak 2.25 lower: a miss' },
    ],
  },
  {
    id: 'abs',
    access: 'trial',
    title: { ru: 'Модуль: излом', en: 'Absolute value: a kink' },
    idea: { ru: 'y = |x − c| − c — вниз до x = c, потом так же вверх. Две цели на «галочке».', en: 'y = |x − c| − c runs down to x = c, then back up: two targets on a V.' },
    about: {
      ru: [
        'Модуль |x| — расстояние от числа до нуля, он всегда ≥ 0. График |x| — «галочка» с изломом в нуле.',
        '|x − c| сдвигает излом в точку x = c. А «− c» опускает график так, чтобы он начинался у тебя: при x = 0 получается |−c| − c = 0.',
        'Наклон обеих ветвей равен 1 (45°). Чтобы сделать круче или положе, умножь: k·|x − c| − k·c.',
      ],
      en: [
        '|x| is the distance to zero, never negative; its graph is a V with the kink at 0.',
        '|x − c| moves the kink to x = c, and “− c” drops it so it starts at you: |−c| − c = 0 at x = 0.',
        'Both arms have slope 1; scale with k·|x − c| − k·c for steeper or flatter.',
      ],
    },
    params: [['c', 'где излом: сначала вниз на c, потом вверх', 'where the kink is: down by c, then up']],
    battle: { ru: ['Одна цель внизу, вторая вверху справа — модуль заденет обе, а прямая только одну.'], en: ['One target low, one high on the right: the V gets both, a line only one.'] },
    mistakes: { ru: ['Писать |x| − c без сдвига: излом останется у тебя под ногами.'], en: ['Writing |x| − c without the shift keeps the kink under your feet.'] },
    formula: 'y = |x - c| - c',
    play: { template: '|x-{c}|-{c}', params: [p('c', 'Излом c', 'Kink c', 2, 20, 1, 6)] },
    shooter: [-16, 4],
    targets: [[-6, -6], [6, 6]],
    obstacles: [c(-10, 6, 2.2), c(0, -8, 2)],
    examples: [
      { src: '|x-10|-10', expect: 'hit', ru: 'излом в цели — обе цели', en: 'kink on the target: both hit' },
      { src: '-x', expect: 'edge', ru: 'прямая берёт только первую', en: 'a line gets only the first' },
    ],
  },
  {
    id: 'root',
    access: 'trial',
    title: { ru: 'Корень: резкий старт', en: 'Square root: a fast start' },
    idea: { ru: 'y = a·√x — круто вверх в начале, потом всё положе.', en: 'y = a·√x climbs steeply first, then flatter and flatter.' },
    about: {
      ru: [
        'Квадратный корень √x — число, которое в квадрате даёт x. √4 = 2, √16 = 4, √100 = 10.',
        'Корень определён только для x ≥ 0. В игре x — расстояние вперёд, оно всегда ≥ 0, так что это не мешает.',
        'График растёт всё медленнее: чтобы корень вырос вдвое, x нужно увеличить вчетверо. Поэтому у начала он круче любой прямой, а вдали почти ровный.',
      ],
      en: [
        '√x is the number whose square is x: √4 = 2, √16 = 4, √100 = 10.',
        'It is defined for x ≥ 0 only; in the game x is the distance ahead, so that is fine.',
        'It grows ever slower: doubling √x needs four times the x. Steeper than any line at first, nearly flat later.',
      ],
    },
    params: [['a', 'масштаб: на расстоянии 25 высота 5a', 'scale: at a distance of 25 the height is 5a']],
    battle: { ru: ['Скала прямо перед тобой и чуть выше: корень сразу подскакивает и проходит над ней, а дальше летит почти ровно.'], en: ['A rock just ahead and a bit up: the root jumps over it, then flies nearly level.'] },
    mistakes: { ru: ['Писать √(x − 5): при x < 5 корень не определён, и выстрел оборвётся сразу.'], en: ['√(x − 5) is undefined for x < 5, so the shot dies at once.'] },
    formula: 'y = a\\sqrt{x}',
    play: { template: '{a}sqrt(x)', params: [p('a', 'Масштаб a', 'Scale a', 0.5, 3, 0.1, 1.2)] },
    shooter: [-16, -8],
    targets: [[0, 0], [16, 3.31]],
    obstacles: [c(-12, -6, 1.4), c(8, -3, 2.5)],
    examples: [
      { src: '2sqrt(x)', expect: 'hit', ru: 'обе цели на одной кривой', en: 'both targets on one curve' },
      { src: '0.5x', expect: 'obstacle', ru: 'прямая упирается в скалу', en: 'a line hits the rock' },
    ],
  },
  {
    id: 'exp',
    access: 'pro',
    title: { ru: 'Экспонента: взлёт', en: 'The exponential: lift-off' },
    idea: { ru: 'y = e^(x/k) − 1 — почти ровно, а потом всё быстрее вверх.', en: 'y = e^(x/k) − 1: nearly flat, then up faster and faster.' },
    about: {
      ru: [
        'Экспонента eˣ, где e ≈ 2,718, растёт так, что за каждый одинаковый шаг умножается на одно и то же число. Это рост «как у вирусов и процентов в банке».',
        'e^(x/k) увеличивается в e раз каждые k клеток. «− 1» нужно, чтобы график начинался у тебя: e⁰ − 1 = 0.',
        'С минусом в показателе, e^(−x/k), график, наоборот, затухает к нулю. Это пригодится в главе про затухающие волны.',
      ],
      en: [
        'eˣ with e ≈ 2.718 multiplies by the same factor every equal step — growth like compound interest.',
        'e^(x/k) grows e-fold every k squares; “− 1” makes it start at you: e⁰ − 1 = 0.',
        'With a minus, e^(−x/k) decays to zero — useful for damped waves.',
      ],
    },
    params: [['k', 'длина разгона: чем больше k, тем позже взлёт', 'run-up: the bigger k, the later the climb']],
    battle: { ru: ['Пролететь низко под скалой и резко взмыть к высокой цели.'], en: ['Fly low under a rock, then soar to a high target.'] },
    mistakes: { ru: ['Маленькое k — экспонента вылетает за край поля раньше цели.'], en: ['A small k leaves the field before the target.'] },
    formula: 'y = e^{x/k} - 1',
    play: { template: 'e^(x/{k})-1', params: [p('k', 'Разгон k', 'Run-up k', 4, 16, 0.5, 9)] },
    shooter: [-18, -10],
    targets: [[14, 8]],
    obstacles: [c(0, -1, 3), c(-6, 6, 2.5)],
    examples: [
      { src: 'e^(x/10.87)-1', expect: 'hit', ru: 'низко под скалой и вверх', en: 'low under the rock, then up' },
      { src: '0.5625x', expect: 'obstacle', ru: 'прямая — в скалу', en: 'a line: into the rock' },
    ],
  },
  {
    id: 'log',
    access: 'pro',
    title: { ru: 'Логарифм: быстро и плавно', en: 'The logarithm: quick, then gentle' },
    idea: { ru: 'y = a·ln(1 + x/k) — как корень, только ещё положе вдали.', en: 'y = a·ln(1 + x/k): like a root, even flatter far away.' },
    about: {
      ru: [
        'Натуральный логарифм ln x — обратная к экспоненте функция: ln(eˣ) = x. Он отвечает на вопрос «в какую степень возвести e, чтобы получить x».',
        'ln определён только для положительных чисел, поэтому пишем ln(1 + x/k): при x ≥ 0 под логарифмом всегда ≥ 1, а ln 1 = 0 — график начинается у тебя.',
        'Логарифм растёт очень медленно: чтобы он вырос на 1, аргумент нужно умножить на e. Вблизи стрелка он круто поднимается, дальше почти ровный.',
      ],
      en: [
        'ln x is the inverse of eˣ: ln(eˣ) = x — the power to raise e to.',
        'It needs positive input, hence ln(1 + x/k): the argument is ≥ 1 and ln 1 = 0, so it starts at you.',
        'It grows very slowly: +1 needs the argument multiplied by e. Steep near you, almost level later.',
      ],
    },
    params: [['a', 'общая высота', 'overall height'], ['k', 'где кончается крутой участок', 'where the steep part ends']],
    battle: { ru: ['Скала низко на пути прямой: логарифм быстро набирает высоту и дальше летит почти горизонтально.'], en: ['A low rock on the line: ln gains height fast, then flies almost level.'] },
    mistakes: { ru: ['Писать ln x без «1 +»: ln 0 не существует, выстрел оборвётся сразу.'], en: ['ln x without “1 +”: ln 0 does not exist, the shot dies at once.'] },
    formula: 'y = a\\ln\\!\\left(1+\\frac{x}{k}\\right)',
    play: { template: '{a}ln(1+x/{k})', params: [p('a', 'Высота a', 'Height a', 1, 5, 0.5, 2), p('k', 'Изгиб k', 'Bend k', 1, 8, 0.5, 3)] },
    shooter: [-16, -6],
    targets: [[14, 1.19]],
    obstacles: [c(-8, -4.5, 1.5), c(4, 7, 2)],
    examples: [
      { src: '3ln(1+x/3)', expect: 'hit', ru: 'быстро вверх над скалой', en: 'up fast over the rock' },
      { src: '0.24x', expect: 'obstacle', ru: 'прямая — в скалу', en: 'a line: into the rock' },
    ],
  },
  {
    id: 'sine',
    access: 'pro',
    title: { ru: 'Синус: змейка', en: 'Sine: weaving' },
    idea: { ru: 'A·sin(πx/L) пересекает ось каждые L клеток. Подбери L под просветы между скалами.', en: 'A·sin(πx/L) crosses the axis every L squares; match L to the gaps.' },
    about: {
      ru: [
        'Синус — периодическая функция: её график повторяется волнами и не выходит за пределы от −1 до 1.',
        'A·sin(…) растягивает волну по высоте: она колеблется от −A до A. Это амплитуда.',
        'sin(πx/L) равен нулю при x = 0, L, 2L, … — то есть полуволна длиной L. Полная волна (период) — 2L.',
      ],
      en: [
        'Sine is periodic: its graph repeats in waves and stays between −1 and 1.',
        'A·sin(…) stretches it to swing from −A to A — the amplitude.',
        'sin(πx/L) is zero at x = 0, L, 2L, …: a half-wave L long, a full period 2L.',
      ],
    },
    params: [['A', 'амплитуда: насколько далеко от оси', 'amplitude: how far from the axis'], ['L', 'длина полуволны', 'half-wave length']],
    battle: { ru: ['Скалы через 12 клеток то сверху, то снизу — нужна полуволна 12: 4·sin(πx/12).'], en: ['Rocks every 12 squares, alternating: a half-wave of 12, 4·sin(πx/12).'] },
    mistakes: { ru: ['Неверный период сдвигает горбы прямо в скалу.', 'Писать sin x вместо sin(πx/L): у sin x полуволна равна π ≈ 3,14 клетки — это очень мелкая волна.'], en: ['The wrong period moves humps into rocks.', 'sin x has a half-wave of π ≈ 3.14 squares: very tight.'] },
    formula: 'y = A \\sin\\frac{\\pi x}{L}',
    play: { template: '{A}sin(pi*x/{L})', params: [p('A', 'Амплитуда A', 'Amplitude A', 1, 8, 0.5, 3), p('L', 'Полуволна L', 'Half-wave L', 4, 20, 1, 9)] },
    shooter: [-18, 0],
    targets: [[18, 0]],
    obstacles: [c(-12, -2.5, 3.2), c(0, 2.5, 3.2), c(12, -2.5, 3.2)],
    examples: [
      { src: '4sin(pi*x/12)', expect: 'hit', ru: 'период совпал со скалами', en: 'the period matches the rocks' },
      { src: '4sin(pi*x/10)', expect: 'obstacle', ru: 'короче — горб в скалу', en: 'shorter: a hump hits a rock' },
    ],
  },
  {
    id: 'damped',
    access: 'pro',
    title: { ru: 'Затухающая волна', en: 'A damped wave' },
    idea: { ru: 'A·e^(−x/k)·sin(πx/L) — волна, которая с каждым горбом всё ниже.', en: 'A·e^(−x/k)·sin(πx/L): a wave that shrinks with every hump.' },
    about: {
      ru: [
        'Произведение функций перемножает их значения в каждой точке. Синус даёт волну, а e^(−x/k) — множитель, который плавно убывает от 1 к 0.',
        'Получается волна, у которой амплитуда тает: так затухают качели и звук гитарной струны.',
        'Нули остаются там же, где у синуса, — в x = L, 2L, … Меняется только высота горбов.',
      ],
      en: [
        'A product multiplies values point by point: sine makes the wave, e^(−x/k) fades from 1 to 0.',
        'The result is a wave whose amplitude melts away, like a swing or a plucked string.',
        'The zeros stay where the sine has them; only the humps shrink.',
      ],
    },
    params: [['A', 'высота первого горба', 'height of the first hump'], ['k', 'как быстро затухает', 'how fast it fades'], ['L', 'длина полуволны', 'half-wave length']],
    battle: { ru: ['Сначала нужен высокий горб, а дальше скала там, куда достал бы обычный синус: затухание опускает следующие горбы.'], en: ['A tall first hump, then a rock where a plain sine would reach: damping lowers the later humps.'] },
    mistakes: { ru: ['Слишком большое k — затухания почти нет, и волна ведёт себя как обычный синус.'], en: ['Too big a k barely damps: it acts like a plain sine.'] },
    formula: 'y = A\\,e^{-x/k}\\sin\\frac{\\pi x}{L}',
    play: { template: '{A}e^(-x/{k})sin(pi*x/{L})', params: [p('A', 'Высота A', 'Height A', 2, 9, 0.5, 6), p('k', 'Затухание k', 'Damping k', 5, 40, 1, 15), p('L', 'Полуволна L', 'Half-wave L', 6, 18, 1, 12)] },
    shooter: [-18, 0],
    targets: [[18, 0]],
    obstacles: [c(12, 5.5, 1.5), c(0, -6, 2)],
    examples: [
      { src: '6e^(-x/15)sin(pi*x/12)', expect: 'hit', ru: 'горбы тают — проходит под скалой', en: 'the humps shrink: under the rock' },
      { src: '6sin(pi*x/12)', expect: 'obstacle', ru: 'без затухания — в скалу', en: 'undamped: into the rock' },
    ],
  },
  {
    id: 'bump',
    access: 'pro',
    title: { ru: 'Колокол Гаусса: горб', en: 'The Gaussian bell: a bump' },
    idea: { ru: 'A·e^(−((x−c)/w)²) — ровно, горб высотой A в точке c, снова ровно.', en: 'A·e^(−((x−c)/w)²): flat, a bump of A at c, flat again.' },
    about: {
      ru: [
        'Колокол Гаусса знаком по графику нормального распределения: так распределены рост людей и ошибки измерений.',
        'Вдали от точки c он почти равен нулю, поэтому не трогает траекторию до и после горба — в отличие от параболы.',
        'Ширина горба — около 2w по каждую сторону от c. На расстоянии w от центра высота уже 37% от A.',
      ],
      en: [
        'The Gaussian bell is the normal-distribution curve, like heights or measurement errors.',
        'Away from c it is nearly zero, so it leaves the path alone before and after — unlike a parabola.',
        'It is about 2w wide on each side; at w from the centre it is already 37% of A.',
      ],
    },
    params: [['A', 'высота горба', 'bump height'], ['c', 'где горб', 'where the bump is'], ['w', 'ширина', 'width']],
    battle: { ru: ['Перешагнуть одну скалу, не сбив прицел: добавь горб к любой формуле.'], en: ['Step over one rock without spoiling the aim: add a bump to any formula.'] },
    mistakes: { ru: ['Слишком узкий горб (маленькое w) задевает края скалы.'], en: ['Too narrow a bump (small w) clips the rock’s edges.'] },
    formula: 'y = A\\,e^{-\\left(\\frac{x-c}{w}\\right)^2}',
    play: { template: '{A}e^(-((x-{c})/{w})^2)', params: [p('A', 'Высота A', 'Height A', 1, 8, 0.5, 3), p('c', 'Центр c', 'Centre c', 5, 25, 1, 15), p('w', 'Ширина w', 'Width w', 1, 8, 0.5, 2)] },
    shooter: [-15, 0],
    targets: [[15, 0]],
    obstacles: [c(0, 0, 2)],
    examples: [
      { src: '5e^(-((x-15)/4)^2)', expect: 'hit', ru: 'горб над скалой, дальше ровно', en: 'a bump over the rock, flat after' },
      { src: '5e^(-(x-15)^2)', expect: 'obstacle', ru: 'w = 1 — слишком узко', en: 'w = 1: too narrow' },
    ],
  },
  {
    id: 'step',
    access: 'pro',
    title: { ru: 'Ступенька: гиперболический тангенс', en: 'A step: hyperbolic tangent' },
    idea: { ru: 'H·(1 + th((x−c)/w))/2 — лететь низко, подняться на H и лететь ровно.', en: 'H·(1 + tanh((x−c)/w))/2: low, climb by H, then level.' },
    about: {
      ru: [
        'Гиперболический тангенс th x плавно переходит от −1 (слева) к +1 (справа), а в нуле равен 0. Это «сглаженная ступенька».',
        '(1 + th(…))/2 переходит от 0 к 1, а умножение на H — от 0 к H. Переход происходит около x = c.',
        'Если c много больше w, то в начале график почти точно 0 — снаряд стартует ровно.',
      ],
      en: [
        'tanh x slides smoothly from −1 to +1 and is 0 at 0: a smoothed step.',
        '(1 + tanh(…))/2 goes 0 → 1, times H goes 0 → H, around x = c.',
        'With c much bigger than w the start is almost exactly 0: the shot leaves level.',
      ],
    },
    params: [['H', 'высота ступеньки', 'step height'], ['c', 'где подъём', 'where it climbs'], ['w', 'крутизна подъёма', 'how steep']],
    battle: { ru: ['Цель на уступе за скалой: после подъёма высота почти не меняется.'], en: ['A target on a ledge behind a rock: after the climb the height barely changes.'] },
    mistakes: { ru: ['Слишком большое w — подъём такой пологий, что не успевает до цели.'], en: ['Too big a w climbs too slowly to reach the target in time.'] },
    formula: 'y = \\tfrac{H}{2}\\left(1 + \\tanh\\tfrac{x-c}{w}\\right)',
    play: { template: '{H}/2*(1+th((x-{c})/{w}))', params: [p('H', 'Высота H', 'Height H', 2, 14, 1, 6), p('c', 'Подъём c', 'Climb c', 4, 24, 1, 10), p('w', 'Крутизна w', 'Steepness w', 0.5, 6, 0.5, 2)] },
    shooter: [-15, -6],
    targets: [[12, 4]],
    obstacles: [c(5, -6, 4), c(7, 1.6, 1.2), c(-8, 3, 2)],
    examples: [
      { src: '5(1+th((x-12)/2))', expect: 'hit', ru: 'подъём на 10 у x = 12', en: 'climbs 10 at x = 12' },
      { src: '0.37x', expect: 'obstacle', ru: 'прямая — в скалу', en: 'a line: into the rock' },
    ],
  },
  {
    id: 'atan',
    access: 'pro',
    title: { ru: 'Насыщение: арктангенс', en: 'Saturation: arctangent' },
    idea: { ru: 'A·arctg(x/k) поднимается и выравнивается — никогда не уйдёт за край.', en: 'A·atan(x/k) climbs and levels off: it never leaves the field.' },
    about: {
      ru: [
        'Арктангенс arctg x (в формуле — atan) растёт, но никогда не превышает π/2 ≈ 1,57. Такие функции называют «насыщающимися».',
        'Поэтому A·arctg(x/k) не поднимется выше A·π/2: при A = 8 это примерно 12,6.',
        'k задаёт, как быстро наступает насыщение: при x = k значение уже A·π/4 — половина максимума.',
      ],
      en: [
        'atan x grows but never passes π/2 ≈ 1.57: a saturating function.',
        'So A·atan(x/k) never goes above A·π/2 — about 12.6 for A = 8.',
        'k sets how soon it saturates: at x = k it is already half the maximum.',
      ],
    },
    params: [['A', 'предельная высота A·π/2', 'ceiling A·π/2'], ['k', 'как быстро выходит на предел', 'how quickly it levels off']],
    battle: { ru: ['Цель высоко и далеко: экспонента улетит за край, а арктангенс выйдет на нужную высоту и останется на ней.'], en: ['A high, far target: the exponential leaves the field, atan reaches the height and stays there.'] },
    mistakes: { ru: ['Если A·π/2 меньше высоты цели — не долетит никогда.'], en: ['If A·π/2 is below the target, it never gets there.'] },
    formula: 'y = A\\arctan\\frac{x}{k} < A\\frac{\\pi}{2}',
    play: { template: '{A}atan(x/{k})', params: [p('A', 'Высота A', 'Height A', 1, 10, 0.5, 5), p('k', 'Изгиб k', 'Bend k', 1, 12, 0.5, 5)] },
    shooter: [-15, -5],
    targets: [[10, 6]],
    obstacles: [c(0, 9, 2)],
    examples: [
      { src: '8atan(x/5)', expect: 'hit', ru: 'поднялся, выровнялся — в цель', en: 'climbs, levels off, hits' },
      { src: 'e^(x/3)-1', expect: 'edge', ru: 'экспонента ушла за край', en: 'the exponential leaves the field' },
    ],
  },
  {
    id: 'sum',
    access: 'pro',
    title: { ru: 'Сложение графиков', en: 'Adding graphs' },
    idea: { ru: 'Прицел + обход: прямая ведёт в цель, а горб перепрыгивает скалу на пути.', en: 'Aim + detour: a line aims, a bump hops the rock.' },
    about: {
      ru: [
        'Сумма функций складывает их значения в каждой точке: (f + g)(x) = f(x) + g(x).',
        'Так одна часть формулы целится (прямая), а другая обходит препятствие (горб) — и они не мешают друг другу, если горб узкий.',
        'Это главный приём сложных траекторий: собирать формулу из деталей, как из конструктора.',
      ],
      en: [
        'A sum adds values point by point: (f + g)(x) = f(x) + g(x).',
        'One part aims (a line), another dodges (a bump), and they don’t interfere if the bump is narrow.',
        'That is how complex paths are built: assemble the formula from parts.',
      ],
    },
    params: [['k', 'наклон прицела', 'the aiming slope'], ['A', 'высота горба', 'bump height']],
    battle: { ru: ['Прямая 0,3x попадает в цель, но на пути скала. Добавь 4·e^(−((x−14)/3)²): у скалы +4, у цели почти 0.'], en: ['0.3x hits the target but a rock is in the way; add 4·e^(−((x−14)/3)²): +4 at the rock, ~0 at the target.'] },
    mistakes: { ru: ['Широкий горб сдвигает и попадание в цель — держи его узким и далеко от цели.'], en: ['A wide bump spoils the aim too: keep it narrow and away from the target.'] },
    formula: 'y = kx + A\\,e^{-\\left(\\frac{x-c}{w}\\right)^2}',
    play: { template: '{k}x+{A}e^(-((x-14)/3)^2)', params: [p('k', 'Наклон k', 'Slope k', 0, 0.6, 0.02, 0.3), p('A', 'Горб A', 'Bump A', 0, 7, 0.5, 2)] },
    shooter: [-15, -6],
    targets: [[13, 2.4]],
    obstacles: [c(-1, -1.8, 1.8)],
    examples: [
      { src: '0.3x + 4e^(-((x-14)/3)^2)', expect: 'hit', ru: 'прямая + горб', en: 'line + bump' },
      { src: '0.3x', expect: 'obstacle', ru: 'без горба — в скалу', en: 'without the bump: the rock' },
    ],
  },
  {
    id: 'two',
    access: 'pro',
    title: { ru: 'Две цели одной параболой', en: 'Two targets, one parabola' },
    idea: { ru: 'y = ax² + bx через две точки — это система двух уравнений.', en: 'y = ax² + bx through two points is two equations.' },
    about: {
      ru: [
        'Парабола y = ax² + bx уже проходит через тебя (при x = 0 она равна 0). Остаются два неизвестных — a и b, значит, её можно провести ещё через две любые точки.',
        'Подставь координаты целей вместо x и y — получишь два линейных уравнения. Реши систему подстановкой.',
        'Так же через три точки проводят кубическую параболу ax³ + bx² + cx — три уравнения.',
      ],
      en: [
        'y = ax² + bx already passes through you; with two unknowns it fits any two more points.',
        'Put the targets’ coordinates in for x and y: two linear equations to solve.',
        'Three points need a cubic ax³ + bx² + cx: three equations.',
      ],
    },
    params: [['a', 'изгиб', 'curvature'], ['b', 'наклон у старта', 'slope at the start']],
    battle: { ru: ['Цели (10; 8) и (24; 2): 100a + 10b = 8 и 576a + 24b = 2. Отсюда a ≈ −0,0512, b ≈ 1,312.'], en: ['Targets (10, 8) and (24, 2): 100a + 10b = 8, 576a + 24b = 2, so a ≈ −0.0512, b ≈ 1.312.'] },
    mistakes: { ru: ['Округлять a слишком грубо: −0,05 вместо −0,0512 на расстоянии 24 смещает на 0,7 клетки — уже промах.'], en: ['Rounding a to −0.05 shifts it 0.7 squares at 24: a miss.'] },
    formula: '\\begin{cases} 100a + 10b = 8 \\\\ 576a + 24b = 2 \\end{cases}',
    play: { template: '{a}x^2+{b}x', params: [p('a', 'Изгиб a', 'Curvature a', -0.1, 0.02, 0.0004, -0.04), p('b', 'Наклон b', 'Slope b', 0, 2, 0.02, 1.1)] },
    shooter: [-16, -4],
    targets: [[-6, 4], [8, -2]],
    obstacles: [c(-1, -6, 2.5)],
    examples: [{ src: '-0.0512x^2+1.312x', expect: 'hit', ru: 'обе цели одним выстрелом', en: 'both in one shot' }],
  },
  {
    id: 'traps',
    access: 'pro',
    title: { ru: 'Ловушки: разрывы и область определения', en: 'Traps: breaks and domains' },
    idea: { ru: 'Снаряд гибнет на скачке графика, вне области определения и за краем поля.', en: 'A shot dies at a jump, outside the domain and off the field.' },
    about: {
      ru: [
        'Область определения — все x, при которых формула имеет смысл. Корень из отрицательного числа, логарифм нуля, деление на ноль — вне её.',
        'Если формула не определена уже в x = 0 (например, √(x − 5)), выстрел обрывается сразу.',
        'Скачок — место, где график «прыгает»: целая часть floor(x/5) подскакивает на 1 каждые 5 клеток. На скачке снаряд разрывается.',
        '1/(x − 10) у x = 10 улетает в бесконечность — на деле снаряд просто вылетает за край поля.',
      ],
      en: [
        'The domain is every x where the formula makes sense; roots of negatives, ln 0 and division by zero are outside it.',
        'If it is undefined already at x = 0 (like √(x − 5)), the shot ends at once.',
        'A jump is where the graph leaps: floor(x/5) steps up every 5 squares, and the shot breaks there.',
        '1/(x − 10) races to infinity at 10: in practice the shot leaves the field.',
      ],
    },
    params: [],
    battle: { ru: ['Перед выстрелом проверь: определена ли формула при x = 0 и нет ли деления на выражение, которое станет нулём.'], en: ['Before firing, check it is defined at x = 0 and nothing you divide by turns zero.'] },
    mistakes: { ru: ['tg x тоже рвётся: у x = π/2 ≈ 1,57 он уходит в бесконечность.'], en: ['tan x breaks too, at x = π/2 ≈ 1.57.'] },
    shooter: [-15, -5],
    targets: [[10, 6]],
    obstacles: [c(0, 9, 2)],
    examples: [
      { src: 'floor(x/5)', expect: 'jump', ru: 'скачок у x = 5', en: 'a jump at x = 5' },
      { src: '1/(x-10)', expect: 'edge', ru: 'в бесконечность — за край', en: 'to infinity: off the field' },
      { src: 'sqrt(x-5)', expect: 'undefined', ru: 'не определена в x = 0', en: 'undefined at x = 0' },
    ],
  },
  {
    id: 'tactics',
    access: 'pro',
    title: { ru: 'Тактика: кратеры и укрытия', en: 'Tactics: craters and cover' },
    idea: { ru: 'Каждый промах выгрызает кратер: можно прорыть проход — и соперник может разрушить твоё укрытие.', en: 'Every miss bites a crater: dig a tunnel — and the enemy can wreck your cover.' },
    about: {
      ru: [
        'Скала, в которую попал снаряд, теряет круглый кусок радиусом около клетки.',
        'Если обойти скалу трудно, стреляй сквозь неё: два-три выстрела y = 0 прорывают туннель.',
        'Укрытие работает в обе стороны: за скалой в тебя сложнее попасть, но и тебе сложнее стрелять.',
      ],
      en: [
        'A rock that is hit loses a round chunk about a square across.',
        'If curving round is hard, shoot through: two or three y = 0 shots dig a tunnel.',
        'Cover cuts both ways: harder to hit you, harder for you to shoot.',
      ],
    },
    params: [],
    battle: { ru: ['В дуэли с тремя жизнями иногда выгоднее разрушить укрытие соперника, чем пытаться обойти его сложной формулой.'], en: ['With three lives it can pay to wreck the enemy’s cover rather than curve round it.'] },
    mistakes: { ru: ['Снаряд, пролетевший через союзника, отнимает у него жизнь — проверяй, кто стоит на пути.'], en: ['A shot through an ally costs them a life: check who is in the way.'] },
    shooter: [-15, 0],
    targets: [[12, 0]],
    obstacles: [c(-7, 0, 1.6)],
    examples: [{ src: '0', expect: 'obstacle', ru: 'жми несколько раз — туннель растёт', en: 'press a few times: the tunnel grows' }],
  },
];

/** a template with the sliders' values put in */
export const fillTemplate = (t: string, values: Record<string, number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(Math.round(values[k] * 10000) / 10000));

export function chapterWorld(ch: Chapter): World {
  const soldiers: Soldier[] = [
    { id: 0, team: 0, x: ch.shooter[0], y: ch.shooter[1], alive: true, name: 'Ты' },
    ...ch.targets.map(([x, y], i): Soldier => ({ id: 10 + i, team: 1, x, y, alive: true, name: `Цель ${i + 1}` })),
  ];
  return { obstacles: ch.obstacles, holes: [], soldiers };
}
