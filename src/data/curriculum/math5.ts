import { section } from './types';

const M = 'mathematics';

export const MATH_5 = [
  section(M, 5, 'natural', ['Натуральные числа', 'Natural numbers'], [
    {
      id: 'm5-natural',
      title: ['Натуральные числа и шкалы', 'Natural numbers and scales'],
      intro: ['Натуральные числа — это числа, которыми считают предметы: 1, 2, 3… Их удобно изображать точками на координатном луче.', 'Natural numbers are the counting numbers 1, 2, 3… They are handy to show as points on a number ray.'],
      points: [
        ['Десятичная запись', 'Decimal notation', 'Любое число записывают десятью цифрами; значение цифры зависит от разряда: в числе 352 тройка означает 3 сотни.', 'Any number is written with ten digits; a digit’s value depends on its place: in 352 the 3 means three hundreds.'],
        ['Координатный луч', 'Number ray', 'Луч с началом в 0 и единичным отрезком. Чем правее точка, тем больше число.', 'A ray starting at 0 with a unit length. The further right a point is, the larger the number.'],
        ['Сравнение и округление', 'Comparing and rounding', 'Сравнивают по старшим разрядам. Округляя до десятков, смотрят на цифру единиц: 0–4 — вниз, 5–9 — вверх.', 'Compare from the highest place. To round to tens look at the units: 0–4 round down, 5–9 round up.'],
      ],
      sim: { graph: 'number-line' },
    },
    {
      id: 'm5-operations',
      title: ['Сложение, вычитание, умножение и деление', 'The four operations'],
      intro: ['Четыре арифметических действия подчиняются законам, которые помогают считать быстро и без ошибок.', 'The four operations follow laws that help you calculate quickly and without mistakes.'],
      points: [
        ['Переместительный и сочетательный законы', 'Commutative and associative laws', 'a + b = b + a, (a + b) + c = a + (b + c); то же для умножения. Поэтому 25 · 7 · 4 = 25 · 4 · 7 = 700.', 'a + b = b + a, (a + b) + c = a + (b + c), and the same for multiplication, so 25 · 7 · 4 = 25 · 4 · 7 = 700.'],
        ['Распределительный закон', 'Distributive law', 'a(b + c) = ab + ac. Удобно: 17 · 102 = 17 · 100 + 17 · 2 = 1734.', 'a(b + c) = ab + ac. Handy: 17 · 102 = 1700 + 34 = 1734.'],
        ['Деление с остатком', 'Division with remainder', 'a = b · q + r, где 0 ≤ r < b. Например, 47 = 6 · 7 + 5.', 'a = b · q + r with 0 ≤ r < b. E.g. 47 = 6 · 7 + 5.'],
        ['Порядок действий', 'Order of operations', 'Сначала скобки, потом степени, затем умножение и деление слева направо, в конце сложение и вычитание.', 'Brackets first, then powers, then multiplication and division left to right, then addition and subtraction.'],
      ],
      formula: 'a(b + c) = ab + ac',
    },
    {
      id: 'm5-powers-expr',
      title: ['Степень числа. Числовые и буквенные выражения', 'Powers and expressions'],
      intro: ['Квадрат и куб числа — короткая запись произведения одинаковых множителей. Буквенные выражения позволяют записать правило для любых чисел сразу.', 'Squares and cubes are short for products of equal factors. Expressions with letters state a rule for any numbers at once.'],
      points: [
        ['Квадрат и куб', 'Square and cube', 'a² = a · a, a³ = a · a · a. Например, 5² = 25, 2³ = 8.', 'a² = a · a, a³ = a · a · a, e.g. 5² = 25 and 2³ = 8.'],
        ['Значение выражения', 'Evaluating an expression', 'Подставляем числа вместо букв: при a = 3 значение 2a + 1 равно 7.', 'Substitute numbers for letters: when a = 3, 2a + 1 equals 7.'],
        ['Формулы', 'Formulas', 'Путь s = v · t, периметр прямоугольника P = 2(a + b) — это буквенные выражения.', 'Distance s = v · t and the perimeter P = 2(a + b) are expressions with letters.'],
      ],
      formula: 'a^2 = a \\cdot a, \\quad a^3 = a \\cdot a \\cdot a',
    },
    {
      id: 'm5-equations',
      title: ['Простейшие уравнения', 'Simple equations'],
      intro: ['Уравнение — равенство с неизвестным. Решить его — найти все значения неизвестного, при которых равенство верно.', 'An equation is an equality with an unknown. Solving it means finding every value that makes it true.'],
      points: [
        ['Неизвестное слагаемое', 'Unknown addend', 'x + 15 = 40 ⇒ x = 40 − 15 = 25.', 'x + 15 = 40 ⇒ x = 40 − 15 = 25.'],
        ['Неизвестный множитель', 'Unknown factor', '7x = 56 ⇒ x = 56 : 7 = 8.', '7x = 56 ⇒ x = 56 ÷ 7 = 8.'],
        ['Проверка', 'Checking', 'Подставь найденный корень в уравнение: обе части должны совпасть.', 'Substitute the root back: both sides must match.'],
      ],
      formula: 'x + 15 = 40 \\;\\Rightarrow\\; x = 25',
    },
  ]),
  section(M, 5, 'fractions', ['Обыкновенные дроби', 'Fractions'], [
    {
      id: 'm5-fractions',
      title: ['Доли и обыкновенные дроби', 'Parts and fractions'],
      intro: ['Дробь m/n показывает, что целое разделили на n равных долей и взяли m из них.', 'A fraction m/n means a whole is split into n equal parts and m of them are taken.'],
      points: [
        ['Числитель и знаменатель', 'Numerator and denominator', 'Знаменатель — на сколько частей делим, числитель — сколько частей берём.', 'The denominator tells how many parts, the numerator how many are taken.'],
        ['Правильные и неправильные', 'Proper and improper', 'Если числитель меньше знаменателя, дробь меньше 1 (правильная). Иначе — неправильная: 7/4 = 1 3/4.', 'If the numerator is smaller the fraction is below 1 (proper); otherwise improper: 7/4 = 1 3/4.'],
        ['Дробь и деление', 'Fraction as division', 'a : b = a/b. Поэтому 3/4 — это 3 : 4 = 0,75.', 'a ÷ b = a/b, so 3/4 is 3 ÷ 4 = 0.75.'],
      ],
      formula: '\\frac{m}{n}',
      sim: { geom: 'fraction-pie' },
    },
    {
      id: 'm5-fraction-ops',
      title: ['Сложение и вычитание дробей с одинаковыми знаменателями', 'Adding fractions with the same denominator'],
      intro: ['Когда доли одинаковые, их просто считают: складывают числители, а знаменатель оставляют.', 'When the parts are the same size you just count them: add numerators, keep the denominator.'],
      points: [
        ['Правило', 'The rule', '3/8 + 2/8 = 5/8; 7/9 − 4/9 = 3/9 = 1/3.', '3/8 + 2/8 = 5/8; 7/9 − 4/9 = 3/9 = 1/3.'],
        ['Смешанные числа', 'Mixed numbers', 'Целые части складывают отдельно, дробные — отдельно: 2 1/5 + 1 3/5 = 3 4/5.', 'Add whole parts and fractional parts separately: 2 1/5 + 1 3/5 = 3 4/5.'],
        ['Частая ошибка', 'A common mistake', 'Нельзя складывать знаменатели: 1/4 + 1/4 = 2/4, а не 2/8.', 'Never add the denominators: 1/4 + 1/4 = 2/4, not 2/8.'],
      ],
      formula: '\\frac{a}{n} + \\frac{b}{n} = \\frac{a + b}{n}',
    },
  ]),
  section(M, 5, 'decimals', ['Десятичные дроби и проценты', 'Decimals and percentages'], [
    {
      id: 'm5-decimals',
      title: ['Десятичные дроби', 'Decimals'],
      intro: ['Десятичная дробь — другая запись дроби со знаменателем 10, 100, 1000…: 0,7 = 7/10, 2,35 = 235/100.', 'A decimal is another way to write a fraction over 10, 100, 1000…: 0.7 = 7/10, 2.35 = 235/100.'],
      points: [
        ['Сравнение', 'Comparing', 'Уравниваем число знаков после запятой: 0,5 и 0,48 → 0,50 > 0,48.', 'Pad to the same number of decimal places: 0.5 and 0.48 → 0.50 > 0.48.'],
        ['Сложение и вычитание', 'Adding and subtracting', 'Пишем запятую под запятой и складываем поразрядно.', 'Line up the decimal points and add place by place.'],
        ['Умножение и деление', 'Multiplying and dividing', 'Умножаем как целые и отделяем запятой столько знаков, сколько их в обоих множителях вместе. При делении на 10, 100 запятая сдвигается влево.', 'Multiply as whole numbers, then mark off as many decimal places as both factors have together. Dividing by 10, 100 moves the point left.'],
      ],
      formula: '2{,}35 = \\frac{235}{100}',
      sim: { graph: 'number-line' },
    },
    {
      id: 'm5-percent',
      title: ['Проценты', 'Percentages'],
      intro: ['Процент — сотая часть числа. Проценты удобны, чтобы сравнивать доли: скидки, оценки, рост цен.', 'A percent is one hundredth of a number. Percentages make shares easy to compare: discounts, marks, price rises.'],
      points: [
        ['Процент от числа', 'Percent of a number', 'Чтобы найти p% от a, умножаем a на p/100: 15% от 240 = 240 · 0,15 = 36.', 'To find p% of a multiply a by p/100: 15% of 240 = 240 · 0.15 = 36.'],
        ['Число по его проценту', 'A number from its percent', 'Если 20% числа равны 30, то всё число 30 : 0,2 = 150.', 'If 20% of a number is 30, the number is 30 ÷ 0.2 = 150.'],
        ['Сколько процентов', 'What percent', 'Делим часть на целое и умножаем на 100%: 12 из 48 — это 25%.', 'Divide the part by the whole and multiply by 100%: 12 of 48 is 25%.'],
      ],
      formula: 'p\\% \\text{ от } a = a \\cdot \\frac{p}{100}',
      sim: { geom: 'percent-grid' },
    },
  ]),
  section(M, 5, 'geometry', ['Наглядная геометрия', 'Basic geometry'], [
    {
      id: 'm5-lines-angles',
      title: ['Отрезок, луч, прямая. Углы', 'Segments, rays, lines. Angles'],
      intro: ['Из точек и прямых строится вся геометрия. Угол — две полупрямые с общим началом; его меряют транспортиром в градусах.', 'All of geometry is built from points and lines. An angle is two rays from one point, measured in degrees with a protractor.'],
      points: [
        ['Отрезок, луч, прямая', 'Segment, ray, line', 'Отрезок имеет два конца, луч — один, прямая бесконечна в обе стороны.', 'A segment has two ends, a ray one, a line none: it goes on both ways.'],
        ['Виды углов', 'Kinds of angles', 'Острый — меньше 90°, прямой — 90°, тупой — от 90° до 180°, развёрнутый — 180°.', 'Acute is under 90°, right is 90°, obtuse is between 90° and 180°, straight is 180°.'],
        ['Биссектриса', 'Bisector', 'Луч, который делит угол пополам.', 'A ray that splits an angle in half.'],
      ],
      sim: { geom: 'angles' },
    },
    {
      id: 'm5-areas',
      title: ['Площадь прямоугольника. Периметр', 'Area and perimeter of a rectangle'],
      intro: ['Периметр — длина границы фигуры, площадь — сколько единичных квадратиков в ней помещается.', 'Perimeter is the length of a shape’s boundary; area is how many unit squares fit inside.'],
      points: [
        ['Прямоугольник', 'Rectangle', 'S = a · b, P = 2(a + b). Для квадрата S = a², P = 4a.', 'S = a · b and P = 2(a + b); for a square S = a² and P = 4a.'],
        ['Единицы площади', 'Units of area', '1 м² = 100 дм² = 10 000 см², 1 га = 10 000 м², 1 ар (сотка) = 100 м².', '1 m² = 100 dm² = 10 000 cm², 1 ha = 10 000 m².'],
        ['Равные фигуры', 'Equal figures', 'Фигуры, совпадающие при наложении, имеют равные площади. Площадь фигуры равна сумме площадей её частей.', 'Shapes that match when overlaid have equal areas; a shape’s area is the sum of its parts.'],
      ],
      formula: 'S = a \\cdot b, \\quad P = 2(a + b)',
      sim: { geom: 'rectangle' },
    },
    {
      id: 'm5-volume',
      title: ['Прямоугольный параллелепипед. Объём', 'Cuboid and volume'],
      intro: ['Коробка, кирпич, комната — всё это прямоугольные параллелепипеды. У них 6 граней, 12 рёбер и 8 вершин.', 'A box, a brick, a room are cuboids: 6 faces, 12 edges and 8 vertices.'],
      points: [
        ['Объём', 'Volume', 'V = a · b · c. Для куба V = a³.', 'V = a · b · c; for a cube V = a³.'],
        ['Единицы объёма', 'Units of volume', '1 л = 1 дм³ = 1000 см³, 1 м³ = 1000 л.', '1 L = 1 dm³ = 1000 cm³, 1 m³ = 1000 L.'],
        ['Площадь поверхности', 'Surface area', 'S = 2(ab + bc + ac) — сумма площадей шести граней.', 'S = 2(ab + bc + ac), the six faces together.'],
      ],
      formula: 'V = a \\cdot b \\cdot c',
      sim: { solid: 'cuboid' },
    },
  ]),
];
