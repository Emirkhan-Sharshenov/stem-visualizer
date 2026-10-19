import { section } from './types';

const M = 'mathematics';

export const MATH_7 = [
  section(M, 7, 'alg-expressions', ['Алгебра: выражения и уравнения', 'Algebra: expressions and equations'], [
    {
      id: 'm7-expressions',
      title: ['Выражения и тождества', 'Expressions and identities'],
      intro: ['Тождество — равенство, верное при любых значениях букв. Тождественные преобразования меняют вид выражения, но не его значение.', 'An identity holds for every value of the letters. Identity transformations change how an expression looks, never its value.'],
      points: [
        ['Подобные слагаемые', 'Like terms', 'У них одинаковая буквенная часть: 4xy и −xy. Приводим: 4xy − xy = 3xy.', 'They share the letter part: 4xy and −xy combine to 3xy.'],
        ['Раскрытие скобок', 'Opening brackets', '3(2a − b) − (a + 4b) = 6a − 3b − a − 4b = 5a − 7b.', '3(2a − b) − (a + 4b) = 5a − 7b.'],
        ['Доказательство тождеств', 'Proving identities', 'Преобразуем одну часть, пока она не совпадёт с другой.', 'Transform one side until it matches the other.'],
      ],
      formula: 'a(b - c) = ab - ac',
      sim: { geom: 'distributive' },
    },
    {
      id: 'm7-linear-equation',
      title: ['Линейное уравнение с одной переменной', 'Linear equations in one variable'],
      intro: ['Уравнение вида ax = b. Почти любое уравнение без степеней приводится к нему переносом и упрощением.', 'An equation of the form ax = b. Almost any equation without powers comes down to it after moving and simplifying.'],
      points: [
        ['Сколько корней', 'How many roots', 'Если a ≠ 0 — один корень x = b/a. Если a = 0 и b ≠ 0 — корней нет. Если a = b = 0 — корень любое число.', 'If a ≠ 0 there is one root x = b/a; if a = 0 and b ≠ 0 there is none; if both are 0 any number works.'],
        ['Решение задач', 'Word problems', 'Обозначаем неизвестное через x, составляем уравнение по условию и решаем.', 'Call the unknown x, write an equation from the story, and solve it.'],
        ['Пример', 'Example', 'В двух классах 58 учеников, в одном на 4 больше: x + (x + 4) = 58 ⇒ x = 27.', 'Two classes have 58 pupils, one has 4 more: x + (x + 4) = 58 ⇒ x = 27.'],
      ],
      formula: 'ax = b \\;\\Rightarrow\\; x = \\frac{b}{a}, \\; a \\ne 0',
      sim: { graph: 'linear' },
    },
    {
      id: 'm7-linear-function',
      title: ['Линейная функция и её график', 'The linear function'],
      intro: ['Функция y = kx + b задаёт прямую. Коэффициент k отвечает за наклон, а b — за точку пересечения с осью y.', 'y = kx + b draws a straight line: k sets the slope and b where it crosses the y-axis.'],
      points: [
        ['Угловой коэффициент', 'Slope', 'k > 0 — прямая идёт вверх, k < 0 — вниз, k = 0 — горизонтальна. Чем больше |k|, тем круче.', 'k > 0 rises, k < 0 falls, k = 0 is flat; the larger |k|, the steeper.'],
        ['Построение', 'Plotting', 'Достаточно двух точек: при x = 0 и при ещё одном удобном x.', 'Two points are enough: at x = 0 and at one more handy x.'],
        ['Параллельные прямые', 'Parallel lines', 'Графики y = kx + b₁ и y = kx + b₂ параллельны — у них одинаковый k.', 'y = kx + b₁ and y = kx + b₂ are parallel: same k.'],
      ],
      formula: 'y = kx + b',
      sim: { graph: 'linear' },
    },
    {
      id: 'm7-powers',
      title: ['Степень с натуральным показателем', 'Powers with natural exponents'],
      intro: ['aⁿ — произведение n одинаковых множителей a. Свойства степеней превращают громоздкие вычисления в сложение показателей.', 'aⁿ is the product of n factors a. The rules of powers turn bulky calculations into adding exponents.'],
      points: [
        ['Умножение и деление', 'Multiplying and dividing', 'aᵐ · aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ.', 'aᵐ · aⁿ = aᵐ⁺ⁿ and aᵐ ÷ aⁿ = aᵐ⁻ⁿ.'],
        ['Степень степени', 'Power of a power', '(aᵐ)ⁿ = aᵐⁿ, (ab)ⁿ = aⁿbⁿ.', '(aᵐ)ⁿ = aᵐⁿ and (ab)ⁿ = aⁿbⁿ.'],
        ['Знак', 'Sign', 'Отрицательное число в чётной степени положительно: (−2)⁴ = 16, в нечётной — отрицательно: (−2)³ = −8.', 'A negative to an even power is positive ((−2)⁴ = 16), to an odd power negative ((−2)³ = −8).'],
      ],
      formula: 'a^m \\cdot a^n = a^{m+n}, \\quad (a^m)^n = a^{mn}',
      sim: { graph: 'power' },
    },
    {
      id: 'm7-polynomials',
      title: ['Одночлены и многочлены', 'Monomials and polynomials'],
      intro: ['Одночлен — произведение чисел и букв (3a²b), многочлен — сумма одночленов. С ними работают как с числами: складывают, вычитают, умножают.', 'A monomial is a product of numbers and letters (3a²b); a polynomial is a sum of monomials, added and multiplied like numbers.'],
      points: [
        ['Стандартный вид', 'Standard form', 'Одночлен записывают с числовым коэффициентом впереди: −2x³y.', 'Write a monomial with its coefficient first: −2x³y.'],
        ['Умножение многочленов', 'Multiplying polynomials', 'Каждый член первого умножаем на каждый член второго: (a + 2)(a − 3) = a² − a − 6.', 'Multiply every term by every term: (a + 2)(a − 3) = a² − a − 6.'],
        ['Вынесение множителя', 'Factoring out', 'Общий множитель выносим за скобки: 6x² − 9x = 3x(2x − 3).', 'Take the common factor outside: 6x² − 9x = 3x(2x − 3).'],
      ],
      formula: '(a + b)(c + d) = ac + ad + bc + bd',
      sim: { geom: 'distributive' },
    },
    {
      id: 'm7-short-mult',
      title: ['Формулы сокращённого умножения', 'Special products'],
      intro: ['Три формулы, которые экономят время и помогают раскладывать на множители.', 'Three formulas that save time and help with factoring.'],
      points: [
        ['Квадрат суммы и разности', 'Square of a sum or difference', '(a ± b)² = a² ± 2ab + b². Например, 51² = (50 + 1)² = 2601.', '(a ± b)² = a² ± 2ab + b², e.g. 51² = (50 + 1)² = 2601.'],
        ['Разность квадратов', 'Difference of squares', 'a² − b² = (a − b)(a + b). 49 · 51 = 50² − 1 = 2499.', 'a² − b² = (a − b)(a + b); 49 · 51 = 50² − 1 = 2499.'],
        ['Сумма и разность кубов', 'Sum and difference of cubes', 'a³ ± b³ = (a ± b)(a² ∓ ab + b²).', 'a³ ± b³ = (a ± b)(a² ∓ ab + b²).'],
      ],
      formula: '(a + b)^2 = a^2 + 2ab + b^2, \\quad a^2 - b^2 = (a - b)(a + b)',
      sim: { geom: 'square-of-sum' },
    },
    {
      id: 'm7-systems',
      title: ['Системы линейных уравнений', 'Systems of linear equations'],
      intro: ['Два уравнения с двумя неизвестными. Решение — пара чисел, подходящая обоим; на графике это точка пересечения двух прямых.', 'Two equations in two unknowns. A solution is a pair that fits both: where the two lines cross.'],
      points: [
        ['Способ подстановки', 'Substitution', 'Выражаем одну переменную из одного уравнения и подставляем в другое.', 'Express one variable from one equation and substitute it into the other.'],
        ['Способ сложения', 'Elimination', 'Складываем уравнения так, чтобы одна переменная исчезла: (x + y = 7) + (x − y = 1) ⇒ 2x = 8.', 'Add the equations so one variable cancels: (x + y = 7) + (x − y = 1) ⇒ 2x = 8.'],
        ['Число решений', 'How many solutions', 'Прямые пересекаются — одно решение; параллельны — ни одного; совпадают — бесконечно много.', 'Crossing lines: one; parallel: none; the same line: infinitely many.'],
      ],
      formula: '\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}',
      sim: { graph: 'system' },
    },
    {
      id: 'm7-monomials',
      title: ['Одночлены', 'Monomials'],
      intro: ['Одночлен — произведение чисел, переменных и их степеней: 3a²b. Его приводят к стандартному виду.', 'A monomial is a product of numbers, variables and powers, like 3a²b, written in standard form.'],
      points: [
        ['Стандартный вид', 'Standard form', 'Сначала числовой множитель, затем буквы со степенями: 2a · 3ab = 6a²b.', 'The number first, then letters with powers: 2a · 3ab = 6a²b.'],
        ['Степень одночлена', 'Degree', 'Сумма показателей всех переменных: у 6a²b степень 3.', 'The sum of the exponents: 6a²b has degree 3.'],
        ['Умножение', 'Multiplying', 'Коэффициенты перемножаем, показатели одинаковых букв складываем.', 'Multiply the numbers, add the exponents of equal letters.'],
      ],
      formula: '2a \\cdot 3ab = 6a^2b',
      sim: { geom: 'distributive' },
    },
    {
      id: 'm7-factoring',
      title: ['Разложение многочленов на множители', 'Factoring polynomials'],
      intro: ['Разложить на множители — записать многочлен произведением. Это упрощает дроби и решает уравнения.', 'To factor is to write a polynomial as a product, which simplifies fractions and solves equations.'],
      points: [
        ['Общий множитель', 'Common factor', '6x² − 9x = 3x(2x − 3).', '6x² − 9x = 3x(2x − 3).'],
        ['Группировка', 'Grouping', 'ax + ay + bx + by = a(x + y) + b(x + y) = (x + y)(a + b).', 'ax + ay + bx + by = (x + y)(a + b).'],
        ['Формулы', 'Formulas', 'x² − 25 = (x − 5)(x + 5); x² + 6x + 9 = (x + 3)².', 'x² − 25 = (x − 5)(x + 5); x² + 6x + 9 = (x + 3)².'],
      ],
      formula: 'a^2 - b^2 = (a - b)(a + b)',
      sim: { geom: 'diff-squares' },
    },
    {
      id: 'm7-function-concept',
      title: ['Функция. Область определения и значения', 'Functions, domain and range'],
      intro: ['Функция — правило, по которому каждому x соответствует ровно одно y. Её задают формулой, таблицей или графиком.', 'A function gives exactly one y for each x, by a formula, a table or a graph.'],
      points: [
        ['Аргумент и значение', 'Input and output', 'x — аргумент (независимая переменная), y = f(x) — значение функции.', 'x is the input, y = f(x) the output.'],
        ['Область определения', 'Domain', 'Все x, при которых формула имеет смысл: у √x это x ≥ 0, у 1/x — x ≠ 0.', 'All x where the formula makes sense: x ≥ 0 for √x, x ≠ 0 for 1/x.'],
        ['График', 'Graph', 'Все точки (x; f(x)). Вертикальная прямая пересекает график функции не больше одного раза.', 'All points (x, f(x)); a vertical line meets it at most once.'],
      ],
      formula: 'y = f(x)',
      sim: { graph: 'sqrt' },
    },
  ]),
  section(M, 7, 'geo-basics', ['Геометрия: начальные сведения и треугольники', 'Geometry: basics and triangles'], [
    {
      id: 'm7-geo-angles',
      title: ['Смежные и вертикальные углы', 'Adjacent and vertical angles'],
      intro: ['Геометрия начинается с точек, прямых и углов. Две пересекающиеся прямые образуют четыре угла, которые связаны простыми правилами.', 'Geometry starts with points, lines and angles. Two crossing lines make four angles linked by simple rules.'],
      points: [
        ['Смежные углы', 'Adjacent angles', 'У них общая сторона, а две другие образуют прямую; в сумме 180°.', 'They share a side and the other two sides form a line; together they make 180°.'],
        ['Вертикальные углы', 'Vertical angles', 'Стороны одного — продолжения сторон другого. Вертикальные углы равны.', 'One angle’s sides extend the other’s. Vertical angles are equal.'],
        ['Перпендикуляр', 'Perpendicular', 'Прямые, пересекающиеся под прямым углом, перпендикулярны: a ⊥ b.', 'Lines crossing at a right angle are perpendicular: a ⊥ b.'],
      ],
      formula: '\\alpha + \\beta = 180^\\circ',
      sim: { geom: 'angles' },
    },
    {
      id: 'm7-triangle-equality',
      title: ['Признаки равенства треугольников', 'Congruent triangles'],
      intro: ['Чтобы доказать, что два треугольника равны, не нужно проверять все шесть элементов — хватает трёх подходящих.', 'To prove two triangles congruent you don’t check all six parts: three suitable ones are enough.'],
      points: [
        ['Первый признак', 'SAS', 'По двум сторонам и углу между ними.', 'Two sides and the angle between them.'],
        ['Второй признак', 'ASA', 'По стороне и двум прилежащим к ней углам.', 'A side and the two angles next to it.'],
        ['Третий признак', 'SSS', 'По трём сторонам. Поэтому треугольник — «жёсткая» фигура, его используют в фермах и мостах.', 'Three sides. That’s why triangles are rigid and used in bridges and trusses.'],
      ],
      sim: { geom: 'triangle' },
    },
    {
      id: 'm7-isosceles',
      title: ['Равнобедренный треугольник. Медиана, биссектриса, высота', 'Isosceles triangle. Median, bisector, altitude'],
      intro: ['У равнобедренного треугольника две стороны равны. Его углы при основании тоже равны, а три важных отрезка из вершины совпадают.', 'An isosceles triangle has two equal sides; its base angles are equal and three key segments from the apex coincide.'],
      points: [
        ['Медиана', 'Median', 'Соединяет вершину с серединой противоположной стороны.', 'Joins a vertex to the midpoint of the opposite side.'],
        ['Биссектриса и высота', 'Bisector and altitude', 'Биссектриса делит угол пополам, высота — перпендикуляр из вершины к противоположной стороне.', 'A bisector halves the angle; an altitude is the perpendicular from a vertex to the opposite side.'],
        ['Свойство', 'The property', 'В равнобедренном треугольнике медиана к основанию является и биссектрисой, и высотой.', 'In an isosceles triangle the median to the base is also the bisector and the altitude.'],
      ],
      sim: { geom: 'triangle-lines' },
    },
    {
      id: 'm7-parallel',
      title: ['Параллельные прямые', 'Parallel lines'],
      intro: ['Параллельные прямые не пересекаются. Если их пересечь третьей прямой (секущей), образуются пары углов с особыми свойствами.', 'Parallel lines never meet. A third line (a transversal) crossing them makes pairs of angles with special properties.'],
      points: [
        ['Накрест лежащие углы', 'Alternate angles', 'При параллельных прямых равны.', 'Equal when the lines are parallel.'],
        ['Соответственные углы', 'Corresponding angles', 'Равны.', 'Equal.'],
        ['Односторонние углы', 'Co-interior angles', 'В сумме 180°. И наоборот: если это выполняется, прямые параллельны.', 'Add up to 180°, and conversely this makes the lines parallel.'],
        ['Аксиома параллельных', 'Parallel postulate', 'Через точку вне прямой проходит ровно одна прямая, параллельная данной.', 'Through a point off a line there is exactly one parallel.'],
      ],
      sim: { geom: 'parallel' },
    },
    {
      id: 'm7-angle-sum',
      title: ['Сумма углов треугольника', 'Angle sum of a triangle'],
      intro: ['В любом треугольнике сумма углов равна 180° — это следствие свойств параллельных прямых.', 'Every triangle’s angles add up to 180°, a consequence of parallel lines.'],
      points: [
        ['Внешний угол', 'Exterior angle', 'Равен сумме двух внутренних углов, не смежных с ним.', 'Equals the sum of the two interior angles not next to it.'],
        ['Виды треугольников', 'Kinds of triangles', 'Остроугольный, прямоугольный (есть угол 90°), тупоугольный (есть угол больше 90°).', 'Acute, right (one 90° angle) and obtuse (one angle over 90°).'],
        ['Неравенство треугольника', 'Triangle inequality', 'Каждая сторона меньше суммы двух других: из отрезков 2, 3 и 7 треугольник не сложить.', 'Each side is shorter than the other two together: 2, 3 and 7 make no triangle.'],
        ['Против большей стороны', 'Opposite the larger side', 'Лежит больший угол.', 'Lies the larger angle.'],
      ],
      formula: '\\angle A + \\angle B + \\angle C = 180^\\circ',
      sim: { geom: 'triangle' },
    },
    {
      id: 'm7-right-triangle',
      title: ['Прямоугольный треугольник', 'The right triangle'],
      intro: ['Стороны прямоугольного треугольника называются катетами и гипотенузой. У него есть свои признаки равенства и полезные свойства.', 'A right triangle has two legs and a hypotenuse, with its own congruence tests and useful properties.'],
      points: [
        ['Острые углы', 'Acute angles', 'Их сумма 90°.', 'They add up to 90°.'],
        ['Катет против 30°', 'The leg opposite 30°', 'Равен половине гипотенузы.', 'Is half the hypotenuse.'],
        ['Признаки равенства', 'Congruence tests', 'По гипотенузе и катету, по гипотенузе и острому углу.', 'By hypotenuse and a leg, or hypotenuse and an acute angle.'],
      ],
      sim: { geom: 'right-trig' },
    },
    {
      id: 'm7-triangle-inequality',
      title: ['Неравенство треугольника', 'The triangle inequality'],
      intro: ['Не из любых трёх отрезков можно сложить треугольник: каждая сторона должна быть меньше суммы двух других.', 'Not every three sticks make a triangle: each side must be shorter than the other two together.'],
      points: [
        ['Правило', 'The rule', 'a < b + c, b < a + c, c < a + b. Достаточно проверить самую длинную сторону.', 'a < b + c, b < a + c, c < a + b; checking the longest side is enough.'],
        ['Почему', 'Why', 'Прямая — кратчайший путь: идти через третью вершину всегда дальше.', 'A straight line is shortest; going via the third vertex is always longer.'],
        ['Стороны и углы', 'Sides and angles', 'Против большей стороны лежит больший угол.', 'The larger side faces the larger angle.'],
      ],
      formula: 'c < a + b',
      sim: { geom: 'tri-ineq' },
    },
    {
      id: 'm7-circle-construct',
      title: ['Окружность. Построения циркулем и линейкой', 'Circles and compass constructions'],
      intro: ['Окружность — все точки на одном расстоянии от центра. С циркулем и линейкой строят середину отрезка, биссектрису, перпендикуляр.', 'A circle is every point at one distance from the centre; with compass and ruler we build midpoints, bisectors and perpendiculars.'],
      points: [
        ['Элементы', 'Parts', 'Радиус, диаметр (два радиуса), хорда — отрезок между точками окружности.', 'Radius, diameter (two radii), chord: a segment between two points of the circle.'],
        ['Середина отрезка', 'Midpoint', 'Две дуги одного радиуса из концов отрезка; прямая через их пересечения делит отрезок пополам.', 'Two equal arcs from the ends; the line through their crossings halves the segment.'],
        ['Касательная', 'Tangent', 'Прямая с одной общей точкой с окружностью; она перпендикулярна радиусу.', 'A line touching at one point, perpendicular to the radius.'],
      ],
      formula: 'd = 2r',
      sim: { geom: 'chord-tangent' },
    },
  ]),
];
