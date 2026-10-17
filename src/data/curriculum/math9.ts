import { section } from './types';

const M = 'mathematics';

export const MATH_9 = [
  section(M, 9, 'alg-functions', ['Алгебра: функции и неравенства', 'Algebra: functions and inequalities'], [
    {
      id: 'm9-function',
      title: ['Функция. Область определения и свойства', 'Functions and their properties'],
      intro: ['Функция — правило, по которому каждому x ставится в соответствие ровно одно y. Её поведение видно по графику.', 'A function assigns exactly one y to every x; its behaviour shows on the graph.'],
      points: [
        ['Область определения и значений', 'Domain and range', 'Какие x можно подставлять и какие y получаются. Для y = √x: x ≥ 0, y ≥ 0.', 'Which x are allowed and which y come out; for y = √x both are ≥ 0.'],
        ['Нули и знаки', 'Zeros and signs', 'Нули — где график пересекает ось x; между ними функция сохраняет знак.', 'Zeros are where the graph crosses the x-axis; between them the sign stays the same.'],
        ['Возрастание и убывание', 'Increasing and decreasing', 'Возрастает, если большему x соответствует большее y.', 'Increasing means a larger x gives a larger y.'],
        ['Преобразования графиков', 'Transforming graphs', 'y = f(x) + b сдвигает график вверх, y = f(x − a) — вправо, y = kf(x) растягивает.', 'f(x) + b shifts up, f(x − a) shifts right, k·f(x) stretches.'],
      ],
      sim: { graph: 'quadratic' },
    },
    {
      id: 'm9-quadratic-function',
      title: ['Квадратичная функция', 'The quadratic function'],
      intro: ['График y = ax² + bx + c — парабола. Знак a определяет, куда смотрят ветви, а вершина — самую высокую или низкую точку.', 'y = ax² + bx + c is a parabola; the sign of a decides which way it opens, and the vertex is its highest or lowest point.'],
      points: [
        ['Вершина', 'Vertex', 'x₀ = −b / 2a, y₀ = f(x₀).', 'x₀ = −b / 2a, y₀ = f(x₀).'],
        ['Направление ветвей', 'Which way it opens', 'a > 0 — вверх, a < 0 — вниз.', 'a > 0 opens up, a < 0 opens down.'],
        ['Нули', 'Zeros', 'Корни уравнения ax² + bx + c = 0; их число зависит от дискриминанта.', 'The roots of ax² + bx + c = 0; how many depends on the discriminant.'],
        ['Применение', 'Uses', 'По параболе летит брошенный мяч, параболическую форму имеют антенны и фары.', 'A thrown ball flies along a parabola; dishes and headlights are parabolic.'],
      ],
      formula: 'y = ax^2 + bx + c, \\quad x_0 = -\\frac{b}{2a}',
      sim: { graph: 'quadratic' },
    },
    {
      id: 'm9-quadratic-inequality',
      title: ['Квадратные неравенства. Метод интервалов', 'Quadratic inequalities. Interval method'],
      intro: ['Чтобы решить ax² + bx + c > 0, смотрим, где парабола выше оси x. Метод интервалов работает и для более сложных выражений.', 'To solve ax² + bx + c > 0 see where the parabola lies above the x-axis; the interval method handles harder cases too.'],
      points: [
        ['Через параболу', 'With a parabola', 'Находим корни, рисуем схематично параболу и выбираем нужные промежутки.', 'Find the roots, sketch the parabola and pick the right intervals.'],
        ['Метод интервалов', 'Interval method', 'Отмечаем нули множителей на прямой и расставляем знаки справа налево, чередуя их.', 'Mark the zeros of the factors on the line and assign signs right to left, alternating.'],
        ['Пример', 'Example', 'x² − 5x + 6 < 0 ⇔ (x − 2)(x − 3) < 0 ⇔ 2 < x < 3.', 'x² − 5x + 6 < 0 ⇔ (x − 2)(x − 3) < 0 ⇔ 2 < x < 3.'],
      ],
      formula: '(x - x_1)(x - x_2) < 0 \\;\\Leftrightarrow\\; x_1 < x < x_2',
      sim: { graph: 'inequality' },
    },
    {
      id: 'm9-systems-nonlinear',
      title: ['Системы нелинейных уравнений', 'Nonlinear systems'],
      intro: ['Если в системе есть квадраты или произведения неизвестных, её решают подстановкой или сложением, а наглядно — пересечением графиков.', 'Systems with squares or products of unknowns are solved by substitution or elimination, and pictured as crossing graphs.'],
      points: [
        ['Подстановка', 'Substitution', '{x + y = 5; xy = 6}: y = 5 − x ⇒ x(5 − x) = 6 ⇒ (2; 3) и (3; 2).', '{x + y = 5, xy = 6}: y = 5 − x ⇒ x(5 − x) = 6 ⇒ (2, 3) and (3, 2).'],
        ['Графически', 'Graphically', 'Окружность и прямая могут иметь 0, 1 или 2 общие точки.', 'A circle and a line can share 0, 1 or 2 points.'],
        ['Задачи', 'Word problems', 'Площадь и периметр прямоугольника дают систему с xy и x + y.', 'A rectangle’s area and perimeter give a system with xy and x + y.'],
      ],
      sim: { graph: 'system' },
    },
  ]),
  section(M, 9, 'alg-sequences', ['Алгебра: прогрессии, комбинаторика, вероятность', 'Algebra: sequences, counting, probability'], [
    {
      id: 'm9-arithmetic',
      title: ['Арифметическая прогрессия', 'Arithmetic progression'],
      intro: ['Каждый следующий член получается прибавлением одного и того же числа d — разности прогрессии.', 'Each term is the previous one plus the same number d, the common difference.'],
      points: [
        ['n-й член', 'nth term', 'aₙ = a₁ + (n − 1)d.', 'aₙ = a₁ + (n − 1)d.'],
        ['Сумма', 'Sum', 'Sₙ = (a₁ + aₙ) · n / 2. Так юный Гаусс сложил числа от 1 до 100: 101 · 50 = 5050.', 'Sₙ = (a₁ + aₙ) · n / 2, which is how young Gauss added 1 to 100: 101 · 50 = 5050.'],
        ['Характеристическое свойство', 'Middle term', 'Каждый член — среднее арифметическое соседей.', 'Each term is the average of its neighbours.'],
      ],
      formula: 'a_n = a_1 + (n - 1)d, \\quad S_n = \\frac{a_1 + a_n}{2} \\cdot n',
      sim: { graph: 'sequence' },
    },
    {
      id: 'm9-geometric',
      title: ['Геометрическая прогрессия', 'Geometric progression'],
      intro: ['Каждый следующий член получается умножением на одно и то же число q — знаменатель прогрессии. Так растут вклады, бактерии и слухи.', 'Each term is the previous one times the same number q, the common ratio: savings, bacteria and rumours grow like this.'],
      points: [
        ['n-й член', 'nth term', 'bₙ = b₁ · qⁿ⁻¹.', 'bₙ = b₁ · qⁿ⁻¹.'],
        ['Сумма', 'Sum', 'Sₙ = b₁(qⁿ − 1)/(q − 1), q ≠ 1.', 'Sₙ = b₁(qⁿ − 1)/(q − 1), q ≠ 1.'],
        ['Бесконечно убывающая', 'Infinite decreasing', 'При |q| < 1 сумма всех членов конечна: S = b₁ / (1 − q). 1 + 1/2 + 1/4 + … = 2.', 'For |q| < 1 the infinite sum is finite: S = b₁ / (1 − q); 1 + 1/2 + 1/4 + … = 2.'],
      ],
      formula: 'b_n = b_1 q^{n-1}, \\quad S = \\frac{b_1}{1 - q}',
      sim: { graph: 'sequence' },
    },
    {
      id: 'm9-combinatorics',
      title: ['Комбинаторика', 'Combinatorics'],
      intro: ['Комбинаторика отвечает на вопрос «сколькими способами?». Главный инструмент — правило умножения.', 'Combinatorics answers “in how many ways?”, and its main tool is the multiplication rule.'],
      points: [
        ['Правило умножения', 'Multiplication rule', '3 футболки и 4 брюк дают 3 · 4 = 12 комплектов.', '3 shirts and 4 trousers make 3 · 4 = 12 outfits.'],
        ['Перестановки', 'Permutations', 'Число способов расставить n предметов: n! = 1 · 2 · … · n. 5 книг на полке — 120 способов.', 'n objects can be ordered in n! = 1 · 2 · … · n ways: 5 books, 120 ways.'],
        ['Размещения и сочетания', 'Arrangements and combinations', 'Aₙᵏ = n!/(n − k)! — порядок важен; Cₙᵏ = n!/(k!(n − k)!) — порядок не важен.', 'Aₙᵏ = n!/(n − k)! when order matters; Cₙᵏ = n!/(k!(n − k)!) when it doesn’t.'],
      ],
      formula: 'C_n^k = \\frac{n!}{k!\\,(n - k)!}',
    },
    {
      id: 'm9-probability',
      title: ['Вероятность случайного события', 'Probability of an event'],
      intro: ['Вероятность показывает, насколько событие ожидаемо, числом от 0 (невозможно) до 1 (наверняка).', 'Probability measures how likely an event is, from 0 (impossible) to 1 (certain).'],
      points: [
        ['Классическое определение', 'Classical definition', 'P = m / n — благоприятные исходы делим на все равновозможные. Выпадение чётного на кубике: 3/6 = 1/2.', 'P = m / n: favourable outcomes over all equally likely ones. An even number on a die: 3/6 = 1/2.'],
        ['Противоположное событие', 'Complement', 'P(не A) = 1 − P(A).', 'P(not A) = 1 − P(A).'],
        ['Частота', 'Relative frequency', 'При большом числе опытов доля успехов приближается к вероятности.', 'Over many trials the share of successes approaches the probability.'],
      ],
      formula: 'P(A) = \\frac{m}{n}',
      sim: { graph: 'dice' },
    },
  ]),
  section(M, 9, 'geo-vectors', ['Геометрия: векторы, координаты, решение треугольников', 'Geometry: vectors, coordinates, solving triangles'], [
    {
      id: 'm9-vectors',
      title: ['Векторы', 'Vectors'],
      intro: ['Вектор — направленный отрезок: у него есть длина и направление. Перемещение, скорость и сила — векторные величины.', 'A vector is a directed segment with a length and a direction; displacement, velocity and force are vectors.'],
      points: [
        ['Сложение', 'Adding', 'Правило треугольника: конец первого вектора соединяем с началом второго. Правило параллелограмма даёт то же самое.', 'Triangle rule: put the second vector at the end of the first; the parallelogram rule gives the same result.'],
        ['Умножение на число', 'Multiplying by a number', 'Длина умножается на |k|, направление сохраняется при k > 0 и меняется при k < 0.', 'The length is multiplied by |k|; the direction stays for k > 0 and flips for k < 0.'],
        ['Координаты вектора', 'Components', 'AB = (x₂ − x₁; y₂ − y₁), длина |a| = √(x² + y²).', 'AB = (x₂ − x₁, y₂ − y₁), length |a| = √(x² + y²).'],
        ['Скалярное произведение', 'Dot product', 'a · b = |a||b|cos φ = x₁x₂ + y₁y₂; равно нулю для перпендикулярных векторов.', 'a · b = |a||b|cos φ = x₁x₂ + y₁y₂, zero for perpendicular vectors.'],
      ],
      formula: '\\vec a \\cdot \\vec b = |\\vec a||\\vec b|\\cos\\varphi',
      sim: { geom: 'vectors' },
    },
    {
      id: 'm9-coordinates',
      title: ['Метод координат', 'Coordinate geometry'],
      intro: ['С координатами геометрические задачи превращаются в вычисления.', 'Coordinates turn geometry problems into calculations.'],
      points: [
        ['Расстояние между точками', 'Distance between points', 'd = √((x₂ − x₁)² + (y₂ − y₁)²) — это теорема Пифагора.', 'd = √((x₂ − x₁)² + (y₂ − y₁)²), which is Pythagoras.'],
        ['Середина отрезка', 'Midpoint', 'M((x₁ + x₂)/2; (y₁ + y₂)/2).', 'M((x₁ + x₂)/2, (y₁ + y₂)/2).'],
        ['Уравнение окружности', 'Equation of a circle', '(x − a)² + (y − b)² = R² — центр (a; b), радиус R.', '(x − a)² + (y − b)² = R²: centre (a, b), radius R.'],
      ],
      formula: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
      sim: { geom: 'coords' },
    },
    {
      id: 'm9-sine-cosine-law',
      title: ['Теоремы синусов и косинусов', 'The sine and cosine rules'],
      intro: ['Эти теоремы позволяют найти любые стороны и углы произвольного треугольника, а не только прямоугольного.', 'These rules find any side or angle of any triangle, not just a right one.'],
      points: [
        ['Теорема косинусов', 'Cosine rule', 'c² = a² + b² − 2ab cos C. При C = 90° превращается в теорему Пифагора.', 'c² = a² + b² − 2ab cos C, which becomes Pythagoras when C = 90°.'],
        ['Теорема синусов', 'Sine rule', 'a / sin A = b / sin B = c / sin C = 2R.', 'a / sin A = b / sin B = c / sin C = 2R.'],
        ['Площадь через синус', 'Area with sine', 'S = ½ ab sin C.', 'S = ½ ab sin C.'],
      ],
      formula: 'c^2 = a^2 + b^2 - 2ab\\cos C, \\quad \\frac{a}{\\sin A} = 2R',
      sim: { geom: 'triangle' },
    },
    {
      id: 'm9-regular-polygons',
      title: ['Правильные многоугольники. Длина окружности и площадь круга', 'Regular polygons. Circles'],
      intro: ['У правильного многоугольника все стороны и углы равны. Чем больше у него сторон, тем ближе он к окружности — так Архимед оценил число π.', 'A regular polygon has equal sides and angles; the more sides, the closer it gets to a circle, which is how Archimedes estimated π.'],
      points: [
        ['Угол правильного n-угольника', 'Interior angle', '180°(n − 2)/n: у шестиугольника 120°.', '180°(n − 2)/n: a hexagon has 120°.'],
        ['Длина дуги', 'Arc length', 'l = πRα / 180° для дуги в α градусов.', 'l = πRα / 180° for an arc of α degrees.'],
        ['Площадь сектора', 'Sector area', 'S = πR²α / 360°.', 'S = πR²α / 360°.'],
      ],
      formula: 'l = \\frac{\\pi R \\alpha}{180^\\circ}, \\quad S_{\\text{сект}} = \\frac{\\pi R^2 \\alpha}{360^\\circ}',
      sim: { geom: 'polygon' },
    },
    {
      id: 'm9-motions',
      title: ['Движения: симметрия, поворот, параллельный перенос', 'Isometries: reflection, rotation, translation'],
      intro: ['Движение переводит фигуру в равную ей, сохраняя расстояния. Симметрия встречается в природе, архитектуре и орнаментах.', 'An isometry moves a figure without changing distances; symmetry is everywhere in nature, buildings and ornaments.'],
      points: [
        ['Осевая симметрия', 'Reflection', 'Точка переходит в зеркальную относительно прямой.', 'A point goes to its mirror image in a line.'],
        ['Центральная симметрия и поворот', 'Point symmetry and rotation', 'Центральная симметрия — поворот на 180° вокруг точки.', 'Point symmetry is a rotation by 180° about a point.'],
        ['Параллельный перенос', 'Translation', 'Все точки сдвигаются на один и тот же вектор.', 'Every point moves by the same vector.'],
      ],
      sim: { geom: 'symmetry' },
    },
  ]),
];
