import { section } from './types';

const M = 'mathematics';

export const MATH_6 = [
  section(M, 6, 'divisibility', ['Делимость чисел', 'Divisibility'], [
    {
      id: 'm6-divisibility',
      title: ['Делители и кратные. Признаки делимости', 'Divisors, multiples and divisibility tests'],
      intro: ['Делитель числа — число, на которое оно делится без остатка; кратное — число, которое делится на данное.', 'A divisor divides a number without remainder; a multiple is a number that the given one divides.'],
      points: [
        ['На 2, 5 и 10', 'By 2, 5 and 10', 'На 2 — последняя цифра чётная; на 5 — 0 или 5; на 10 — 0.', 'By 2: the last digit is even; by 5: it is 0 or 5; by 10: it is 0.'],
        ['На 3 и 9', 'By 3 and 9', 'Сумма цифр делится на 3 (на 9). 4518: 4 + 5 + 1 + 8 = 18 — делится и на 3, и на 9.', 'The digit sum divides by 3 (by 9). 4518: 4 + 5 + 1 + 8 = 18, so by both.'],
        ['Простые и составные', 'Prime and composite', 'Простое число имеет ровно два делителя: 2, 3, 5, 7, 11… Составное раскладывается на простые множители: 60 = 2² · 3 · 5.', 'A prime has exactly two divisors: 2, 3, 5, 7, 11… A composite splits into primes: 60 = 2² · 3 · 5.'],
      ],
      formula: '60 = 2^2 \\cdot 3 \\cdot 5',
    },
    {
      id: 'm6-gcd-lcm',
      title: ['НОД и НОК', 'GCD and LCM'],
      intro: ['Наибольший общий делитель нужен, чтобы сокращать дроби, наименьшее общее кратное — чтобы приводить их к общему знаменателю.', 'The greatest common divisor simplifies fractions; the least common multiple finds a common denominator.'],
      points: [
        ['НОД', 'GCD', 'Берём общие простые множители в наименьших степенях: НОД(24; 36) = 2² · 3 = 12.', 'Take the shared prime factors at the lowest powers: GCD(24, 36) = 2² · 3 = 12.'],
        ['НОК', 'LCM', 'Берём все простые множители в наибольших степенях: НОК(24; 36) = 2³ · 3² = 72.', 'Take all prime factors at the highest powers: LCM(24, 36) = 2³ · 3² = 72.'],
        ['Связь', 'The link', 'НОД(a; b) · НОК(a; b) = a · b. Взаимно простые числа имеют НОД = 1.', 'GCD · LCM = a · b. Coprime numbers have GCD 1.'],
      ],
      formula: '\\text{НОД}(a, b) \\cdot \\text{НОК}(a, b) = a \\cdot b',
    },
  ]),
  section(M, 6, 'fractions', ['Действия с обыкновенными дробями', 'Operations with fractions'], [
    {
      id: 'm6-fraction-property',
      title: ['Основное свойство дроби. Сокращение', 'The basic property. Simplifying'],
      intro: ['Если числитель и знаменатель умножить или разделить на одно и то же число, дробь не изменится.', 'Multiplying or dividing the top and bottom by the same number keeps a fraction’s value.'],
      points: [
        ['Сокращение', 'Simplifying', 'Делим на НОД: 18/24 = 3/4.', 'Divide by the GCD: 18/24 = 3/4.'],
        ['Общий знаменатель', 'Common denominator', 'Им служит НОК знаменателей: 5/6 и 3/8 → 20/24 и 9/24.', 'Use the LCM of the denominators: 5/6 and 3/8 → 20/24 and 9/24.'],
        ['Сравнение дробей', 'Comparing fractions', 'Приводим к общему знаменателю и сравниваем числители.', 'Bring to a common denominator and compare numerators.'],
      ],
      formula: '\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k}',
      sim: { geom: 'fraction-pie' },
    },
    {
      id: 'm6-fraction-add',
      title: ['Сложение и вычитание дробей', 'Adding and subtracting fractions'],
      intro: ['Сложить можно только одинаковые доли. Поэтому сначала дроби приводят к общему знаменателю.', 'Only equal parts can be added, so first bring the fractions to a common denominator.'],
      points: [
        ['Правило', 'The rule', '1/3 + 1/4 = 4/12 + 3/12 = 7/12.', '1/3 + 1/4 = 4/12 + 3/12 = 7/12.'],
        ['Ловушка', 'The trap', '1/2 + 1/3 ≠ 2/5! Половина и треть — почти целая пицца (5/6), а 2/5 меньше половины.', '1/2 + 1/3 ≠ 2/5! Half plus a third is nearly a whole pizza (5/6), but 2/5 is under half.'],
        ['Смешанные числа', 'Mixed numbers', 'При вычитании можно «занять» единицу: 3 1/4 − 1 3/4 = 2 5/4 − 1 3/4 = 1 2/4 = 1 1/2.', 'When subtracting you may borrow a whole: 3 1/4 − 1 3/4 = 2 5/4 − 1 3/4 = 1 1/2.'],
      ],
      formula: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
      sim: { geom: 'fraction-pie' },
    },
    {
      id: 'm6-fraction-mult',
      title: ['Умножение и деление дробей', 'Multiplying and dividing fractions'],
      intro: ['Умножают дроби «прямо»: числитель на числитель, знаменатель на знаменатель. Деление — это умножение на перевёрнутую дробь.', 'Multiply straight across; dividing is multiplying by the flipped fraction.'],
      points: [
        ['Умножение', 'Multiplying', '2/3 · 9/10 = 18/30 = 3/5. Удобно сокращать до умножения.', '2/3 · 9/10 = 18/30 = 3/5; cancel before multiplying.'],
        ['Взаимно обратные числа', 'Reciprocals', 'Их произведение равно 1: 3/7 и 7/3.', 'Their product is 1: 3/7 and 7/3.'],
        ['Деление', 'Dividing', '3/4 : 3/8 = 3/4 · 8/3 = 2.', '3/4 ÷ 3/8 = 3/4 · 8/3 = 2.'],
        ['Дробь от числа', 'A fraction of a number', 'Чтобы найти 2/5 от 30, умножаем: 30 · 2/5 = 12.', 'To find 2/5 of 30 multiply: 30 · 2/5 = 12.'],
      ],
      formula: '\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}',
    },
  ]),
  section(M, 6, 'ratios', ['Отношения и пропорции', 'Ratios and proportions'], [
    {
      id: 'm6-ratio',
      title: ['Отношения и пропорции', 'Ratios and proportions'],
      intro: ['Отношение показывает, во сколько раз одно число больше другого или какую часть оно составляет. Пропорция — равенство двух отношений.', 'A ratio shows how many times larger one number is, or what part it makes. A proportion is an equality of two ratios.'],
      points: [
        ['Основное свойство', 'The key property', 'В пропорции a : b = c : d произведение крайних равно произведению средних: ad = bc.', 'In a : b = c : d the product of the extremes equals that of the means: ad = bc.'],
        ['Неизвестный член', 'An unknown term', 'x : 6 = 10 : 15 ⇒ x = 6 · 10 / 15 = 4.', 'x : 6 = 10 : 15 ⇒ x = 6 · 10 / 15 = 4.'],
        ['Масштаб', 'Scale', 'Масштаб 1 : 50 000 — 1 см на карте означает 500 м на местности.', 'A 1 : 50 000 scale means 1 cm on the map is 500 m on the ground.'],
      ],
      formula: '\\frac{a}{b} = \\frac{c}{d} \\;\\Rightarrow\\; ad = bc',
    },
    {
      id: 'm6-proportional',
      title: ['Прямая и обратная пропорциональность', 'Direct and inverse proportion'],
      intro: ['Если одна величина растёт во столько же раз, во сколько растёт другая, — это прямая пропорциональность. Если одна растёт, а другая во столько же раз уменьшается — обратная.', 'If one quantity grows as many times as the other, that’s direct proportion; if one grows while the other shrinks by the same factor, it’s inverse.'],
      points: [
        ['Прямая', 'Direct', 'Стоимость и количество товара: вдвое больше тетрадей — вдвое больше денег. y = kx.', 'Cost and quantity: twice the notebooks cost twice as much. y = kx.'],
        ['Обратная', 'Inverse', 'Скорость и время на один путь: вдвое быстрее — вдвое меньше времени. y = k/x.', 'Speed and time for a fixed trip: twice as fast takes half the time. y = k/x.'],
        ['Решение задач', 'Solving problems', 'Составляем пропорцию; для обратной зависимости одно из отношений переворачиваем.', 'Write a proportion; for inverse dependence flip one of the ratios.'],
      ],
      formula: 'y = kx, \\quad y = \\frac{k}{x}',
      sim: { graph: 'proportional' },
    },
  ]),
  section(M, 6, 'rational', ['Положительные и отрицательные числа', 'Positive and negative numbers'], [
    {
      id: 'm6-integers',
      title: ['Отрицательные числа. Модуль', 'Negative numbers. Absolute value'],
      intro: ['Отрицательные числа нужны, чтобы описать температуру ниже нуля, долг или высоту ниже уровня моря. На прямой они лежат левее нуля.', 'Negative numbers describe frost, debts or depths below sea level. On the line they sit left of zero.'],
      points: [
        ['Противоположные числа', 'Opposites', '3 и −3 отстоят от нуля на одинаковое расстояние в разные стороны.', '3 and −3 are the same distance from zero on opposite sides.'],
        ['Модуль', 'Absolute value', '|a| — расстояние от нуля до точки: |−7| = 7, |7| = 7.', '|a| is the distance from zero: |−7| = 7, |7| = 7.'],
        ['Сравнение', 'Comparing', 'Из двух отрицательных больше то, у которого модуль меньше: −2 > −5.', 'Of two negatives the one with the smaller absolute value is larger: −2 > −5.'],
      ],
      formula: '|a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases}',
      sim: { graph: 'number-line' },
    },
    {
      id: 'm6-signed-ops',
      title: ['Действия с положительными и отрицательными числами', 'Arithmetic with signed numbers'],
      intro: ['Сложение и умножение чисел с разными знаками подчиняются простым правилам, которые удобно представить как движение по прямой.', 'Adding and multiplying signed numbers follow simple rules you can picture as moves along a line.'],
      points: [
        ['Сложение', 'Adding', 'Одинаковые знаки — складываем модули: −3 + (−4) = −7. Разные — вычитаем меньший модуль из большего и берём знак большего: −8 + 5 = −3.', 'Same signs: add the absolute values (−3 + (−4) = −7). Different signs: subtract the smaller from the larger and keep its sign (−8 + 5 = −3).'],
        ['Вычитание', 'Subtracting', 'a − b = a + (−b): 4 − 9 = 4 + (−9) = −5.', 'a − b = a + (−b): 4 − 9 = −5.'],
        ['Умножение и деление', 'Multiplying and dividing', 'Минус на минус даёт плюс, минус на плюс — минус: (−6) · (−2) = 12, (−6) : 2 = −3.', 'Minus times minus is plus, minus times plus is minus: (−6)(−2) = 12, (−6) ÷ 2 = −3.'],
      ],
      formula: '(-a)\\cdot(-b) = ab',
      sim: { graph: 'number-line' },
    },
    {
      id: 'm6-linear-equations',
      title: ['Решение уравнений', 'Solving equations'],
      intro: ['Чтобы решить уравнение, переносим слагаемые с неизвестным в одну часть, а числа — в другую, меняя знак при переносе.', 'Move the terms with the unknown to one side and numbers to the other, changing sign as they cross.'],
      points: [
        ['Перенос слагаемых', 'Moving terms', '5x − 7 = 2x + 8 ⇒ 5x − 2x = 8 + 7 ⇒ 3x = 15 ⇒ x = 5.', '5x − 7 = 2x + 8 ⇒ 3x = 15 ⇒ x = 5.'],
        ['Раскрытие скобок', 'Opening brackets', 'Если перед скобкой минус, знаки внутри меняются: −(x − 3) = −x + 3.', 'A minus before a bracket flips the signs inside: −(x − 3) = −x + 3.'],
        ['Подобные слагаемые', 'Like terms', 'Складываем их коэффициенты: 3a + 5a − a = 7a.', 'Add their coefficients: 3a + 5a − a = 7a.'],
      ],
      formula: 'ax = b \\;\\Rightarrow\\; x = \\frac{b}{a}',
    },
  ]),
  section(M, 6, 'plane', ['Координатная плоскость и окружность', 'The coordinate plane and the circle'], [
    {
      id: 'm6-coordinates',
      title: ['Координатная плоскость', 'The coordinate plane'],
      intro: ['Две перпендикулярные оси x и y задают адрес каждой точки — пару чисел (x; y).', 'Two perpendicular axes give every point an address: a pair (x, y).'],
      points: [
        ['Координаты точки', 'A point’s coordinates', 'Сначала абсцисса x (по горизонтали), потом ордината y (по вертикали): A(3; −2).', 'First the abscissa x (across), then the ordinate y (up): A(3, −2).'],
        ['Четверти', 'Quadrants', 'Оси делят плоскость на 4 четверти; в I обе координаты положительны, в III — обе отрицательны.', 'The axes split the plane into four quadrants; in I both coordinates are positive, in III both negative.'],
        ['Графики зависимостей', 'Graphs', 'По точкам строят график: например, температуру по часам суток.', 'Plotting points gives a graph, e.g. temperature through the day.'],
      ],
      sim: { geom: 'coords' },
    },
    {
      id: 'm6-circle',
      title: ['Длина окружности и площадь круга', 'Circumference and area of a circle'],
      intro: ['Отношение длины любой окружности к её диаметру одинаково и равно числу π ≈ 3,14.', 'Every circle’s circumference divided by its diameter gives the same number, π ≈ 3.14.'],
      points: [
        ['Длина окружности', 'Circumference', 'C = 2πr = πd.', 'C = 2πr = πd.'],
        ['Площадь круга', 'Area of a disc', 'S = πr². Круг радиусом 10 см имеет площадь ≈ 314 см².', 'S = πr²; a disc of radius 10 cm has about 314 cm².'],
        ['Шар и сфера', 'Ball and sphere', 'Сфера — поверхность, все точки которой на одном расстоянии от центра; шар — всё, что внутри.', 'A sphere is the surface of points equally far from the centre; a ball is everything inside.'],
      ],
      formula: 'C = 2\\pi r, \\quad S = \\pi r^2',
      sim: { geom: 'circle' },
    },
  ]),
];
