import { section } from './types';

const M = 'mathematics';

export const MATH_8 = [
  section(M, 8, 'alg-roots', ['Алгебра: дроби, корни, квадратные уравнения', 'Algebra: fractions, roots, quadratics'], [
    {
      id: 'm8-rational-fractions',
      title: ['Рациональные дроби', 'Rational expressions'],
      intro: ['Дробь, в числителе и знаменателе которой многочлены. С ней действуют так же, как с обычной дробью, но помнят: знаменатель не может быть нулём.', 'A fraction with polynomials on top and bottom. Work with it like an ordinary fraction, but the denominator can never be zero.'],
      points: [
        ['Допустимые значения', 'Allowed values', 'В дроби (x + 1)/(x − 3) нельзя брать x = 3.', 'In (x + 1)/(x − 3), x cannot be 3.'],
        ['Сокращение', 'Simplifying', 'Сначала раскладываем на множители: (x² − 9)/(x + 3) = x − 3.', 'Factor first: (x² − 9)/(x + 3) = x − 3.'],
        ['Сложение', 'Adding', 'Приводим к общему знаменателю, как обычные дроби.', 'Use a common denominator, just like ordinary fractions.'],
      ],
      formula: '\\frac{x^2 - 9}{x + 3} = x - 3, \\; x \\ne -3',
      sim: { graph: 'hyperbola' },
    },
    {
      id: 'm8-sqrt',
      title: ['Квадратные корни', 'Square roots'],
      intro: ['Арифметический квадратный корень из a — неотрицательное число, квадрат которого равен a: √49 = 7.', 'The square root of a is the non-negative number whose square is a: √49 = 7.'],
      points: [
        ['Свойства', 'Properties', '√(ab) = √a · √b, √(a/b) = √a / √b, √(a²) = |a|.', '√(ab) = √a · √b, √(a/b) = √a / √b, √(a²) = |a|.'],
        ['Вынесение из-под корня', 'Simplifying roots', '√50 = √(25 · 2) = 5√2.', '√50 = √(25 · 2) = 5√2.'],
        ['Иррациональные числа', 'Irrational numbers', '√2, π — бесконечные непериодические дроби; их нельзя записать как m/n.', '√2 and π are endless non-repeating decimals that cannot be written as m/n.'],
        ['График', 'The graph', 'y = √x — ветвь параболы, лежащая на боку.', 'y = √x is half a parabola lying on its side.'],
      ],
      formula: '\\sqrt{ab} = \\sqrt{a}\\cdot\\sqrt{b}, \\quad \\sqrt{a^2} = |a|',
      sim: { graph: 'sqrt' },
    },
    {
      id: 'm8-quadratic',
      title: ['Квадратные уравнения. Дискриминант', 'Quadratic equations. The discriminant'],
      intro: ['Уравнение ax² + bx + c = 0 (a ≠ 0). Сколько у него корней и какие они, решает дискриминант D = b² − 4ac.', 'The equation ax² + bx + c = 0 (a ≠ 0). The discriminant D = b² − 4ac tells how many roots there are and what they are.'],
      points: [
        ['Формула корней', 'The formula', 'x = (−b ± √D) / 2a.', 'x = (−b ± √D) / 2a.'],
        ['Число корней', 'How many roots', 'D > 0 — два корня, D = 0 — один, D < 0 — действительных корней нет.', 'D > 0: two roots; D = 0: one; D < 0: no real roots.'],
        ['Неполные уравнения', 'Incomplete equations', 'x² − 9 = 0 ⇒ x = ±3; x² − 5x = 0 ⇒ x(x − 5) = 0 ⇒ x = 0 или 5.', 'x² − 9 = 0 ⇒ x = ±3; x² − 5x = 0 ⇒ x = 0 or 5.'],
      ],
      formula: 'D = b^2 - 4ac, \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}',
      sim: { graph: 'quadratic' },
    },
    {
      id: 'm8-vieta',
      title: ['Теорема Виета', 'Vieta’s formulas'],
      intro: ['Корни приведённого уравнения x² + px + q = 0 связаны с коэффициентами: их сумма равна −p, произведение равно q.', 'The roots of x² + px + q = 0 are tied to the coefficients: their sum is −p and their product is q.'],
      points: [
        ['Подбор корней', 'Guessing roots', 'x² − 7x + 12 = 0: сумма 7, произведение 12 ⇒ корни 3 и 4.', 'x² − 7x + 12 = 0: sum 7, product 12 ⇒ roots 3 and 4.'],
        ['Разложение на множители', 'Factoring', 'ax² + bx + c = a(x − x₁)(x − x₂).', 'ax² + bx + c = a(x − x₁)(x − x₂).'],
        ['Проверка', 'Checking', 'Найденные по формуле корни удобно проверить по Виету.', 'Use Vieta to check roots found with the formula.'],
      ],
      formula: 'x_1 + x_2 = -p, \\quad x_1 x_2 = q',
      sim: { graph: 'quadratic' },
    },
    {
      id: 'm8-inequalities',
      title: ['Линейные неравенства и их системы', 'Linear inequalities'],
      intro: ['Неравенство решают почти как уравнение, но с одним важным правилом про знак.', 'Solve an inequality almost like an equation, with one important rule about the sign.'],
      points: [
        ['Главное правило', 'The key rule', 'При умножении или делении на отрицательное число знак неравенства меняется: −2x < 6 ⇒ x > −3.', 'Multiplying or dividing by a negative flips the sign: −2x < 6 ⇒ x > −3.'],
        ['Числовые промежутки', 'Intervals', 'Ответ записывают промежутком: x > −3 — это (−3; +∞).', 'Write the answer as an interval: x > −3 is (−3, +∞).'],
        ['Системы', 'Systems', 'Решение системы — общая часть решений каждого неравенства.', 'A system’s solution is the overlap of the individual solutions.'],
      ],
      formula: '-2x < 6 \\;\\Rightarrow\\; x > -3',
      sim: { graph: 'number-line' },
    },
    {
      id: 'm8-integer-powers',
      title: ['Степень с целым показателем. Стандартный вид числа', 'Integer exponents. Scientific notation'],
      intro: ['Отрицательная степень — это дробь: a⁻ⁿ = 1/aⁿ. Она позволяет коротко записывать очень маленькие и очень большие числа.', 'A negative power is a fraction: a⁻ⁿ = 1/aⁿ, which lets us write tiny and huge numbers briefly.'],
      points: [
        ['Нулевая степень', 'Zero power', 'a⁰ = 1 при a ≠ 0.', 'a⁰ = 1 for a ≠ 0.'],
        ['Стандартный вид', 'Scientific notation', 'a · 10ⁿ, где 1 ≤ a < 10: 0,00052 = 5,2 · 10⁻⁴; масса Земли ≈ 6 · 10²⁴ кг.', 'a · 10ⁿ with 1 ≤ a < 10: 0.00052 = 5.2 · 10⁻⁴; Earth’s mass ≈ 6 · 10²⁴ kg.'],
        ['Свойства', 'Rules', 'Все свойства степеней верны и для целых показателей.', 'All the power rules hold for integer exponents too.'],
      ],
      formula: 'a^{-n} = \\frac{1}{a^n}, \\quad a^0 = 1',
    },
    {
      id: 'm8-statistics',
      title: ['Элементы статистики', 'Basic statistics'],
      intro: ['Статистика описывает набор данных несколькими числами: где его «центр» и насколько он разбросан.', 'Statistics sums up a data set with a few numbers: where its centre is and how spread out it is.'],
      points: [
        ['Среднее арифметическое', 'Mean', 'Сумма значений, делённая на их количество.', 'The sum of the values divided by how many there are.'],
        ['Медиана', 'Median', 'Среднее значение упорядоченного ряда (или полусумма двух средних).', 'The middle value of the ordered list (or the mean of the two middle ones).'],
        ['Мода и размах', 'Mode and range', 'Мода — самое частое значение, размах — разница между наибольшим и наименьшим.', 'The mode is the most frequent value; the range is the largest minus the smallest.'],
      ],
      formula: '\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}',
      sim: { moment: 'moment_gauss' },
    },
  ]),
  section(M, 8, 'geo-quadrilaterals', ['Геометрия: четырёхугольники и площади', 'Geometry: quadrilaterals and areas'], [
    {
      id: 'm8-quadrilaterals',
      title: ['Параллелограмм, прямоугольник, ромб, квадрат', 'Parallelogram, rectangle, rhombus, square'],
      intro: ['Все эти фигуры — параллелограммы: их противоположные стороны параллельны. Каждая следующая получает новые свойства.', 'All of these are parallelograms with opposite sides parallel; each adds properties of its own.'],
      points: [
        ['Параллелограмм', 'Parallelogram', 'Противоположные стороны и углы равны, диагонали делятся точкой пересечения пополам.', 'Opposite sides and angles are equal; the diagonals bisect each other.'],
        ['Прямоугольник и ромб', 'Rectangle and rhombus', 'У прямоугольника диагонали равны, у ромба — перпендикулярны и делят углы пополам.', 'A rectangle’s diagonals are equal; a rhombus’s are perpendicular and bisect its angles.'],
        ['Квадрат', 'Square', 'И прямоугольник, и ромб одновременно.', 'Both a rectangle and a rhombus.'],
        ['Сумма углов', 'Angle sum', 'У любого выпуклого четырёхугольника 360°, у n-угольника — 180°(n − 2).', 'Any convex quadrilateral has 360°; an n-gon has 180°(n − 2).'],
      ],
      formula: '180^\\circ (n - 2)',
      sim: { geom: 'quadrilateral' },
    },
    {
      id: 'm8-trapezoid',
      title: ['Трапеция. Средняя линия', 'Trapezoid. Midline'],
      intro: ['У трапеции параллельны только две стороны — основания. Отрезок, соединяющий середины боковых сторон, называется средней линией.', 'A trapezoid has just two parallel sides, the bases. The segment joining the midpoints of the legs is the midline.'],
      points: [
        ['Средняя линия трапеции', 'Trapezoid midline', 'Параллельна основаниям и равна их полусумме: (a + b)/2.', 'Parallel to the bases and equal to their average (a + b)/2.'],
        ['Средняя линия треугольника', 'Triangle midline', 'Параллельна стороне и равна её половине.', 'Parallel to a side and half its length.'],
        ['Равнобедренная трапеция', 'Isosceles trapezoid', 'Боковые стороны равны, углы при основании равны, диагонали равны.', 'Equal legs, equal base angles and equal diagonals.'],
      ],
      formula: 'm = \\frac{a + b}{2}',
      sim: { geom: 'quadrilateral' },
    },
    {
      id: 'm8-areas',
      title: ['Площади многоугольников', 'Areas of polygons'],
      intro: ['Площади основных фигур выводятся из площади прямоугольника: параллелограмм перекраивается в прямоугольник, треугольник — половина параллелограмма.', 'All the basic area formulas come from the rectangle: a parallelogram rearranges into one, and a triangle is half a parallelogram.'],
      points: [
        ['Параллелограмм', 'Parallelogram', 'S = a · h.', 'S = a · h.'],
        ['Треугольник', 'Triangle', 'S = a · h / 2; у прямоугольного — половина произведения катетов.', 'S = a · h / 2; for a right triangle, half the product of the legs.'],
        ['Трапеция', 'Trapezoid', 'S = (a + b)/2 · h.', 'S = (a + b)/2 · h.'],
        ['Ромб', 'Rhombus', 'S = d₁ · d₂ / 2.', 'S = d₁ · d₂ / 2.'],
      ],
      formula: 'S_{\\triangle} = \\frac{1}{2} a h, \\quad S_{\\text{трап}} = \\frac{a + b}{2} h',
      sim: { geom: 'triangle-area' },
    },
    {
      id: 'm8-pythagoras',
      title: ['Теорема Пифагора', 'Pythagoras’ theorem'],
      intro: ['В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов. Это одна из самых полезных теорем всей математики.', 'In a right triangle the square on the hypotenuse equals the sum of the squares on the legs: one of the most useful theorems in all of maths.'],
      points: [
        ['Формула', 'The formula', 'c² = a² + b². Катеты 3 и 4 — гипотенуза 5.', 'c² = a² + b²; legs 3 and 4 give a hypotenuse of 5.'],
        ['Обратная теорема', 'The converse', 'Если c² = a² + b², треугольник прямоугольный — так строители проверяют прямой угол верёвкой 3–4–5.', 'If c² = a² + b² the triangle is right-angled, which is how builders check right angles with a 3–4–5 rope.'],
        ['Пифагоровы тройки', 'Pythagorean triples', '3, 4, 5; 5, 12, 13; 8, 15, 17.', '3, 4, 5; 5, 12, 13; 8, 15, 17.'],
      ],
      formula: 'c^2 = a^2 + b^2',
      sim: { moment: 'moment_pythagoras' },
    },
  ]),
  section(M, 8, 'geo-similarity', ['Геометрия: подобие и окружность', 'Geometry: similarity and the circle'], [
    {
      id: 'm8-similar',
      title: ['Подобные треугольники', 'Similar triangles'],
      intro: ['Подобные треугольники имеют одинаковую форму, но разный размер: их углы равны, а стороны пропорциональны.', 'Similar triangles have the same shape at different sizes: equal angles and proportional sides.'],
      points: [
        ['Признаки подобия', 'Tests', 'По двум углам; по двум сторонам и углу между ними; по трём сторонам.', 'Two angles; two sides in proportion with the included angle; three sides in proportion.'],
        ['Коэффициент подобия', 'Scale factor', 'Если стороны отличаются в k раз, площади отличаются в k² раз.', 'If the sides differ by k, the areas differ by k².'],
        ['Применение', 'Uses', 'Так по тени измеряют высоту дерева или здания.', 'This is how a shadow gives the height of a tree or a building.'],
      ],
      formula: '\\frac{S_1}{S_2} = k^2',
      sim: { geom: 'similar' },
    },
    {
      id: 'm8-trig-acute',
      title: ['Синус, косинус и тангенс острого угла', 'Sine, cosine and tangent of an acute angle'],
      intro: ['В прямоугольном треугольнике отношения сторон зависят только от острого угла. Их назвали синусом, косинусом и тангенсом.', 'In a right triangle the ratios of the sides depend only on the acute angle: sine, cosine and tangent.'],
      points: [
        ['Определения', 'Definitions', 'sin α = противолежащий катет / гипотенуза, cos α = прилежащий / гипотенуза, tg α = противолежащий / прилежащий.', 'sin α = opposite / hypotenuse, cos α = adjacent / hypotenuse, tan α = opposite / adjacent.'],
        ['Основное тождество', 'The key identity', 'sin²α + cos²α = 1.', 'sin²α + cos²α = 1.'],
        ['Табличные значения', 'Key values', 'sin 30° = 1/2, cos 60° = 1/2, sin 45° = cos 45° = √2/2, tg 45° = 1.', 'sin 30° = 1/2, cos 60° = 1/2, sin 45° = cos 45° = √2/2, tan 45° = 1.'],
      ],
      formula: '\\sin\\alpha = \\frac{a}{c}, \\; \\cos\\alpha = \\frac{b}{c}, \\; \\operatorname{tg}\\alpha = \\frac{a}{b}',
      sim: { geom: 'right-trig' },
    },
    {
      id: 'm8-circle-angles',
      title: ['Окружность: касательная, центральный и вписанный углы', 'Circle: tangents, central and inscribed angles'],
      intro: ['Углы, связанные с окружностью, измеряются дугами, на которые они опираются.', 'Angles linked to a circle are measured by the arcs they stand on.'],
      points: [
        ['Касательная', 'Tangent', 'Касается окружности в одной точке и перпендикулярна радиусу в этой точке.', 'Touches the circle at one point and is perpendicular to the radius there.'],
        ['Центральный угол', 'Central angle', 'Равен дуге, на которую опирается.', 'Equals the arc it stands on.'],
        ['Вписанный угол', 'Inscribed angle', 'Равен половине дуги. Вписанный угол, опирающийся на диаметр, — прямой.', 'Is half the arc; one standing on a diameter is a right angle.'],
      ],
      formula: '\\angle_{\\text{впис}} = \\frac{1}{2} \\angle_{\\text{центр}}',
      sim: { geom: 'circle-angles' },
    },
    {
      id: 'm8-inscribed-circles',
      title: ['Вписанная и описанная окружности', 'Inscribed and circumscribed circles'],
      intro: ['В любой треугольник можно вписать окружность и около любого треугольника можно описать окружность.', 'Every triangle has a circle inside it touching all sides, and a circle through all its vertices.'],
      points: [
        ['Вписанная', 'Incircle', 'Центр — точка пересечения биссектрис.', 'Its centre is where the bisectors meet.'],
        ['Описанная', 'Circumcircle', 'Центр — точка пересечения серединных перпендикуляров к сторонам. У прямоугольного треугольника он в середине гипотенузы.', 'Its centre is where the perpendicular bisectors meet; for a right triangle, the midpoint of the hypotenuse.'],
        ['Четырёхугольники', 'Quadrilaterals', 'Вписать окружность можно, если суммы противоположных сторон равны; описать — если сумма противоположных углов 180°.', 'A circle fits inside if opposite sides add up equally; one passes through the vertices if opposite angles add to 180°.'],
      ],
      sim: { geom: 'circle-angles' },
    },
  ]),
];
