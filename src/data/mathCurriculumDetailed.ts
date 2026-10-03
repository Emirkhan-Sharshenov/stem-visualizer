import { TextbookLesson } from '../types/stem';

export const DETAILED_MATH_CURRICULUM: TextbookLesson[] = [
  // =========================================================================
  // 5–6 КЛАСС — АРИФМЕТИКА И НАГЛЯДНАЯ ГЕОМЕТРИЯ
  // =========================================================================
  {
    id: 'math5_fractions_slices',
    grade: 'grade_5_6',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    chapter: { en: 'Fractions and Proportions', ru: 'Обыкновенные дроби и пропорции' },
    title: { en: 'Fractions and Common Denominator: Pizza Slices', ru: 'Обыкновенные дроби: Сложение и приведение к общему знаменателю' },
    subtitle: { en: 'Why you cannot add 1/3 and 1/4 without slicing into 12 pieces', ru: 'Числитель и знаменатель, основное свойство дроби и наглядная геометрия пиццы' },
    textbookDefinition: {
      en: 'A fraction represents a part of a whole. To add fractions with different denominators, they must be converted to an equivalent form with a common denominator (LCM of denominators).',
      ru: 'Обыкновенная дробь m/n показывает, на сколько равных долей разделена единица (знаменатель n) и сколько таких долей взято (числитель m). Чтобы сложить дроби с разными знаменателями, их приводят к общему знаменателю (НОК).'
    },
    studentConfusion: {
      en: 'Classic mistake: adding top and bottom directly: 1/2 + 1/3 = 2/5 (which is less than half!).',
      ru: 'Классическая ошибка пятиклассника: складывать числители и знаменатели (1/2 + 1/3 = 2/5). Но половина пиццы плюс треть — это почти целая пицца (5/6), а 2/5 — это меньше половины!'
    },
    lifeAnalogy: {
      en: 'Currencies: you cannot add 1 Euro and 1 Dollar directly; you must convert both into Cents first.',
      ru: 'Разные валюты: нельзя сложить 1 доллар и 1 рубль и сказать «у меня 2 монеты». Нужно перевести обе валюты в копейки (общий знаменатель)!'
    },
    momentObservation: {
      en: 'Watch circle slice into 12 equal sectors: 1/3 becomes 4/12 and 1/4 becomes 3/12, summing to 7/12.',
      ru: 'Наблюдай нарезку круглой пиццы на 12 равных кусочков: 1/3 = 4 кусочка, 1/4 = 3 кусочка. Складываем кусочки одинакового размера: 4/12 + 3/12 = 7/12!'
    },
    formula: '\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}',
    viewMode: 'moment_lever',
    keywords: ['fractions', 'denominator', 'numerator', 'дроби', 'знаменатель', 'числитель', 'общий знаменатель']
  },
  {
    id: 'math6_negative_numbers_axis',
    grade: 'grade_5_6',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    chapter: { en: 'Rational Numbers', ru: 'Положительные и отрицательные числа' },
    title: { en: 'Negative Numbers and Coordinate Line: Why Minus Times Minus is Plus', ru: 'Отрицательные числа и координатная прямая: Почему минус на минус дает плюс' },
    subtitle: { en: 'Thermometer below zero, debts, and geometric reversals on the number line', ru: 'Модуль числа, перемещение по координатной оси и геометрический смысл знака' },
    textbookDefinition: {
      en: 'Negative numbers lie to the left of zero on the real number line. Multiplication by -1 represents a 180° geometric rotation (reversal of direction), hence (-1) × (-1) = +1.',
      ru: 'Отрицательные числа лежат левее нуля на координатной прямой. Умножение на -1 геометрически означает разворот направления на 180 градусов. Поэтому разворот разворота возвращает исходное положительное направление: (-a) · (-b) = +ab.'
    },
    studentConfusion: {
      en: 'Why does multiplying two negative debts create positive wealth?',
      ru: 'Почему умножение двух отрицательных чисел дает плюс? Школьникам кажется парадоксальным, что «долг умножить на долг» становится богатством.'
    },
    lifeAnalogy: {
      en: 'Video rewinding: a person walking backwards (-1 speed) in a video played in reverse (-1 time) appears to walk forward (+1)!',
      ru: 'Перемотка видео назад: человек идет спиной назад (отрицательная скорость -1). Включи видеозапись задом наперед (отрицательное время -1) — на экране человек идет вперед (+1)!'
    },
    momentObservation: {
      en: 'Watch coordinate pointer flip across zero origin: each minus sign rotates vector by 180°.',
      ru: 'Смотри на стрелку на координатной оси: знак «минус» переворачивает стрелку влево на 180°. Второй «минус» снова переворачивает её на 180° — прямо в сторону плюса!'
    },
    formula: '(-a) \\cdot (-b) = +ab, \\quad -(-x) = x',
    viewMode: 'moment_trig_circle',
    keywords: ['negative numbers', 'coordinate axis', 'minus times minus', 'отрицательные числа', 'координатная прямая', 'минус на минус']
  },

  // =========================================================================
  // 7–9 КЛАСС — АЛГЕБРА И ПЛАНИМЕТРИЯ
  // =========================================================================
  {
    id: 'math7_linear_equations_slope',
    grade: 'grade_7',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Linear Functions and Equations', ru: 'Линейная функция и её график' },
    title: { en: 'Linear Function y = kx + b: Slope and Intercept', ru: 'Линейная функция y = kx + b: Угловой коэффициент k и сдвиг b' },
    subtitle: { en: 'How a simple line predicts speed, costs, and steepness', ru: 'Геометрический смысл k (тангенс угла наклона) и свободного члена b (точка пересечения с осью Y)' },
    textbookDefinition: {
      en: 'A linear function is a polynomial of degree 1: y = kx + b. The slope k determines steepness and direction; b is the y-intercept where line crosses the ordinate axis.',
      ru: 'Линейная функция — функция вида y = kx + b. Коэффициент k называется угловым коэффициентом прямой и равен тангенсу угла наклона к оси Ox. Число b — ордината точки пересечения графика с осью Oy.'
    },
    studentConfusion: {
      en: 'Students forget what happens when k is negative (the line slides downward from left to right).',
      ru: 'Школьники забывают: если k > 0 — прямая идет в гору (возрастает); если k < 0 — прямая спускается под гору (убывает); если k = 0 — горизонтальная линия.'
    },
    lifeAnalogy: {
      en: 'Taxi fare: starting price $5 (intercept b) plus $2 per kilometer (slope k). Total = 2x + 5.',
      ru: 'Тариф такси: 100 рублей за посадку (это b) плюс 25 рублей за каждый километр пути x (это k). Итоговая стоимость поездки: y = 25x + 100.'
    },
    momentObservation: {
      en: 'Drag slope slider k from -3 to +3: watch line rotate like a seesaw around point (0, b).',
      ru: 'Меняй коэффициент k от -3 до +3: прямая плавно поворачивается вокруг точки (0, b), наглядно демонстрируя крутизну подъема!'
    },
    formula: 'y = kx + b, \\quad k = \\tan \\alpha = \\frac{\\Delta y}{\\Delta x}',
    viewMode: 'moment_derivative',
    keywords: ['linear function', 'slope', 'intercept', 'линейная функция', 'угловой коэффициент', 'прямая', 'график']
  },
  {
    id: 'math8_pythagorean_theorem',
    grade: 'grade_8',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Right Triangles', ru: 'Теорема Пифагора и метрические соотношения' },
    title: { en: 'Pythagorean Theorem: a² + b² = c² Visual Proof', ru: 'Теорема Пифагора: a² + b² = c² и геометрическое доказательство' },
    subtitle: { en: 'Square of hypotenuse equals the sum of squares of the legs', ru: 'Египетский треугольник (3:4:5), переливание жидкостей в квадратах и доказательство без единого слова' },
    textbookDefinition: {
      en: 'In any right-angled triangle, the area of the square whose side is the hypotenuse (c) is equal to the sum of the areas of the squares on the other two legs (a and b): a² + b² = c².',
      ru: 'В прямоугольном треугольнике квадрат длины гипотенузы равен сумме квадратов длин катетов: a² + b² = c². Геометрически площадь квадрата, построенного на гипотенузе, равна сумме площадей квадратов на катетах.'
    },
    studentConfusion: {
      en: 'Students memorize formulas without realizing it is a physical statement about 2D surface areas!',
      ru: 'Ученики воспринимают a² + b² = c² как абстрактную формулу с буквами, не понимая, что это реальные геометрические квадраты из бумаги или воды!'
    },
    lifeAnalogy: {
      en: 'Water transfer demonstration: water filling square a² and square b² drains completely to fill square c² to the brim.',
      ru: 'Вращающееся колесо с водой: синяя жидкость из двух маленьких квадратных отсеков a² и b² полностью переливается и до краев заполняет большой квадрат c²!'
    },
    momentObservation: {
      en: 'Open interactive Pythagoras simulator: drag leg lengths a and b, see squares a² and b² rearrange into c².',
      ru: 'Запусти симулятор теоремы Пифагора: двигай ползунки катетов a и b и смотри, как сумма площадей двух квадратов точно равна квадрату гипотенузы!'
    },
    formula: 'a^2 + b^2 = c^2, \\quad c = \\sqrt{a^2 + b^2}',
    viewMode: 'moment_pythagoras',
    keywords: ['pythagoras', 'hypotenuse', 'triangle', 'square', 'пифагор', 'гипотенуза', 'катеты', 'теорема пифагора']
  },
  {
    id: 'math8_quadratic_equations_parabola',
    grade: 'grade_8',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Quadratic Equations', ru: 'Квадратные уравнения и парабола' },
    title: { en: 'Quadratic Equations: Discriminant D = b² - 4ac and Parabola Roots', ru: 'Квадратные уравнения: Дискриминант D = b² - 4ac и корни параболы' },
    subtitle: { en: 'Why D > 0 gives two roots, D = 0 gives one touchpoint, and D < 0 has no real roots', ru: 'Формула корней, теорема Виета и пересечение параболы y = ax² + bx + c с осью Ox' },
    textbookDefinition: {
      en: 'A quadratic equation is ax² + bx + c = 0 (a ≠ 0). The discriminant D = b² - 4ac determines the number of real roots: if D > 0 (2 roots), D = 0 (1 root), D < 0 (no real roots).',
      ru: 'Квадратное уравнение ax² + bx + c = 0. Дискриминант D = b² - 4ac показывает число действительных корней: D > 0 — два корня; D = 0 — один корень (вершина параболы касается оси Ox); D < 0 — корней нет (парабола висит в воздухе).'
    },
    studentConfusion: {
      en: 'Why can\'t you take square root of negative discriminant in real numbers? (No real number squared is negative).',
      ru: 'Почему при D < 0 нет корней? Потому что квадрат любого вещественного числа неотрицателен, и извлечь √(-16) среди обычных чисел невозможно!'
    },
    lifeAnalogy: {
      en: 'Trajectory of a thrown basketball: the ball traces a parabola arching over the ground (c crosses roots when hitting floor).',
      ru: 'Полет баскетбольного мяча: мяч летит по идеальной параболе, а корни уравнения — это две точки, где траектория мяча пересекает линию пола!'
    },
    momentObservation: {
      en: 'Shift parabola up and down: see roots collide into one vertex at D = 0 and vanish into complex plane when lifted above axis.',
      ru: 'Поднимай параболу вверх: смотри, как два корня сближаются, сливаются в один при D=0, а затем парабола отрывается от земли (D < 0)!'
    },
    formula: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad D = b^2 - 4ac',
    viewMode: 'moment_derivative',
    keywords: ['quadratic', 'discriminant', 'parabola', 'roots', 'квадратное уравнение', 'дискриминант', 'парабола', 'корни']
  },
  {
    id: 'math9_trig_ratios_triangle',
    grade: 'grade_9',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Trigonometry in Geometry', ru: 'Тригонометрические функции острого угла' },
    title: { en: 'Sine, Cosine, and Tangent: Ratios of Right Triangle Sides', ru: 'Синус, косинус и тангенс: Отношения сторон прямоугольного треугольника' },
    subtitle: { en: 'Opposite over hypotenuse, adjacent over hypotenuse, opposite over adjacent', ru: 'Основное тригонометрическое тождество sin²α + cos²α = 1 и значения для углов 30°, 45°, 60°' },
    textbookDefinition: {
      en: 'In a right triangle: sin(α) = opposite / hypotenuse; cos(α) = adjacent / hypotenuse; tan(α) = opposite / adjacent. By Pythagoras: sin²(α) + cos²(α) = 1.',
      ru: 'Синусом острого угла прямоугольного треугольника называется отношение противолежащего катета к гипотенузе. Косинусом — прилежащего к гипотенузе. Тангенсом — противолежащего к прилежащему. Основное тождество: sin²α + cos²α = 1.'
    },
    studentConfusion: {
      en: 'Students forget which leg is "opposite" vs "adjacent" when triangle is turned on its side.',
      ru: 'Школьники путают прилежащий и противолежащий катеты, если треугольник повернут. «Прилежащий» лежит рядом с твоим углом, «противолежащий» лежит напротив!'
    },
    lifeAnalogy: {
      en: 'Measuring tree height by shadow length: know your angle of sun elevation α and shadow length, and tree height = shadow · tan(α)!',
      ru: 'Измерение высоты дерева по его тени: измерь длину тени шагами, посмотри на верхушку дерева под углом α, и высота дерева = тень · tg(α) без всякой лестницы!'
    },
    momentObservation: {
      en: 'Change angle α from 0° to 90°: see sine grow from 0 to 1 while cosine shrinks from 1 to 0.',
      ru: 'Увеличивай угол α от 0° до 90°: наблюдай, как синус растет от 0 до 1, а косинус сжимается от 1 до 0, сохраняя сумму квадратов строго равной 1!'
    },
    formula: '\\sin \\alpha = \\frac{a}{c}, \\quad \\cos \\alpha = \\frac{b}{c}, \\quad \\sin^2 \\alpha + \\cos^2 \\alpha = 1',
    viewMode: 'moment_trig_circle',
    keywords: ['sine', 'cosine', 'tangent', 'trigonometry', 'синус', 'косинус', 'тангенс', 'тригонометрия']
  },

  // =========================================================================
  // 10–11 КЛАСС — АЛГЕБРА И НАЧАЛА АНАЛИЗА
  // =========================================================================
  {
    id: 'math10_unit_trig_circle',
    grade: 'grade_10',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Trigonometric Functions', ru: 'Тригонометрические функции числового аргумента' },
    title: { en: 'The Unit Circle: Extending Angles to 360° and Radians', ru: 'Единичная окружность: Синус, косинус и радианы' },
    subtitle: { en: 'Why angles can be greater than 90°, negative angles, and continuous sine wave', ru: 'Радианная мера угла (π = 180°), проекция точки на оси X и Y, вращение радиус-вектора' },
    textbookDefinition: {
      en: 'The unit circle is a circle of radius R = 1 centered at origin. For any angle θ, the coordinate of the point on circle is (cos θ, sin θ). This extends trigonometry to all real numbers (-∞, +∞).',
      ru: 'Единичная тригонометрическая окружность имеет радиус R = 1. Координаты любой точки на окружности равны: x = cos α, y = sin α. Это позволяет определить синус и косинус для любых углов (больше 360° и отрицательных).'
    },
    studentConfusion: {
      en: 'Why can sine be negative? (Because y-coordinate goes below x-axis in quadrants III and IV).',
      ru: 'Почему синус может быть отрицательным, если в 8 классе стороны треугольника всегда положительны? Потому что на окружности синус — это координата Y, а ниже оси Ox координата Y отрицательна!'
    },
    lifeAnalogy: {
      en: 'A Ferris wheel: your height above ground oscillates up and down as a smooth sine wave as wheel turns.',
      ru: 'Колесо обозрения: ты садишься в кабинку и крутишься по кругу. Твоя высота над землей в каждый момент времени — это чистая синусоида!'
    },
    momentObservation: {
      en: 'Rotate ray on circle in simulator: trace the green horizontal cosine and red vertical sine projecting onto continuous wave graph.',
      ru: 'Крути радиус-вектор в симуляторе тригонометрического круга: смотри, как проекция на ось Y разворачивается в бесконечную синусоиду!'
    },
    formula: 'x = \\cos \\alpha, \\quad y = \\sin \\alpha, \\quad 2\\pi \\text{ рад} = 360^\\circ',
    viewMode: 'moment_trig_circle',
    keywords: ['unit circle', 'radians', 'sine wave', 'тригонометрический круг', 'радианы', 'синусоида']
  },
  {
    id: 'math10_derivative_tangent',
    grade: 'grade_10',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Differential Calculus', ru: 'Производная и её применение' },
    title: { en: 'The Derivative: Geometric Meaning of Tangent Slope', ru: 'Производная: Геометрический смысл касательной и мгновенная скорость' },
    subtitle: { en: 'Secant line zooming into tangent as Δx shrinks to zero: limit of Δy / Δx', ru: 'Приращение функции Δy и аргумента Δx, угол наклона касательной k = f\'(x₀) = tan α' },
    textbookDefinition: {
      en: 'The derivative f\'(x) is the limit of the ratio of function increment to argument increment as Δx → 0. Geometrically, it equals the slope of the tangent line to the graph at point x₀.',
      ru: 'Производная функции f\'(x₀) — предел отношения приращения функции к приращению аргумента при Δx стремящемся к нулю. Геометрический смысл производной: угловой коэффициент касательной к графику в точке x₀ равен значению производной в этой точке: k = f\'(x₀) = tg α.'
    },
    studentConfusion: {
      en: 'Dividing by zero misconception: Δx approaches 0, but is never strictly zero during the limit process.',
      ru: 'Школьники боятся деления на ноль: «Если Δx = 0, то мы делим 0 на 0!». Но предел — это не деление на ноль, а наблюдение за тем, к какому числу стремится дробь при бесконечном приближении точек!'
    },
    lifeAnalogy: {
      en: 'Car speedometer: average speed over a 2-hour trip is 60 km/h, but the speedometer at a specific second shows instantaneous speed = derivative of position with respect to time!',
      ru: 'Спидометр в автомобиле: средняя скорость за 2 часа поездки — 60 км/ч. Но стрелка спидометра в точную секунду обгона показывает мгновенную скорость (производную пути по времени v = s\'(t))!'
    },
    momentObservation: {
      en: 'Shrink Δx slider from 2.0 to 0.01 in simulator: watch the secant line snap onto the tangent line.',
      ru: 'Уменьшай ползунок Δx в симуляторе производной: смотри, как секущая прямая сливается с касательной и отношение Δy/Δx застывает на точном значении производной!'
    },
    formula: 'f\'(x_0) = \\lim_{\\Delta x \\rightarrow 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x} = \\tan \\alpha',
    viewMode: 'moment_derivative',
    keywords: ['derivative', 'tangent', 'limit', 'instantaneous speed', 'производная', 'касательная', 'предел', 'мгновенная скорость']
  },
  {
    id: 'math11_integral_area',
    grade: 'grade_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Integral Calculus', ru: 'Первообразная и определенный интеграл' },
    title: { en: 'Definite Integral: Area of Curved Trapezoid and Riemann Sums', ru: 'Определенный интеграл: Площадь криволинейной трапеции и формула Ньютона–Лейбница' },
    subtitle: { en: 'Summing infinitely thin rectangles under a curve to find exact area and volume', ru: 'Интегральные суммы Римана, формула Ньютона–Лейбница ∫ f(x)dx = F(b) - F(a)' },
    textbookDefinition: {
      en: 'The definite integral of f(x) from a to b represents the net signed area bounded by the curve, x-axis, and lines x=a, x=b. By the Fundamental Theorem of Calculus, it equals F(b) - F(a).',
      ru: 'Определенный интеграл функции f(x) от a до b равен площади криволинейной трапеции под графиком функции. По формуле Ньютона–Лейбница интеграл вычисляется через разность значений первообразной: ∫[a..b] f(x)dx = F(b) - F(a).'
    },
    studentConfusion: {
      en: 'Why are derivatives and integrals opposite operations? (Differentiating breaks into rates; integrating accumulates rates into total).',
      ru: 'Почему производная и интеграл — обратные операции? Производная берет пройденный путь и находит скорость. Интеграл берет график скорости и считает общий пройденный путь!'
    },
    lifeAnalogy: {
      en: 'Filling a bathtub with uneven faucet flow: measuring flow rate at each second is derivative; the total water accumulated in the tub is the integral.',
      ru: 'Наполнение ванны водой с переменным напором: стрелка расходомера в каждую секунду — производная; общий объем налитой в ванну воды к концу купания — интеграл!'
    },
    momentObservation: {
      en: 'Increase number of Riemann rectangles from 4 to 200: see stepped stair-step rectangles smooth out into exact curved area.',
      ru: 'Увеличивай число полосок Римана с 4 до 200: ступенчатая лесенка прямоугольников идеально сглаживается в точную площадь под кривой!'
    },
    formula: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
    viewMode: 'math_revolution',
    keywords: ['integral', 'antiderivative', 'riemann sum', 'area', 'интеграл', 'первообразная', 'площадь', 'ньютон лейбниц']
  },
  {
    id: 'math11_gauss_normal_distribution',
    grade: 'grade_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Probability and Statistics', ru: 'Теория вероятностей и математическая статистика' },
    title: { en: 'Normal Distribution and Galton Board: Central Limit Theorem', ru: 'Нормальное распределение Гаусса: Доска Гальтона и колоколообразная кривая' },
    subtitle: { en: 'Why random independent events always converge to the bell curve', ru: 'Математическое ожидание μ, стандартное отклонение σ и правило трех сигм (68% - 95% - 99.7%)' },
    textbookDefinition: {
      en: 'The normal (Gaussian) distribution is a continuous probability distribution symmetric about the mean. By the Central Limit Theorem, the sum of many independent random variables tends toward a normal distribution.',
      ru: 'Нормальное распределение (закон Гаусса) — симметричное колоколообразное распределение вероятностей. Центральная предельная теорема гласит: сумма множества независимых случайных величин всегда стремится к нормальному закону.'
    },
    studentConfusion: {
      en: 'Why do human heights, test scores, and measurement errors all form the exact same bell curve?',
      ru: 'Почему рост людей, ошибки приборов и броски дротиков ложатся в одну и ту же форму колокола? Потому что каждый результат — это сумма сотен крошечных случайных факторов!'
    },
    lifeAnalogy: {
      en: 'Galton Board: balls bouncing off pegs 50/50 left or right. Even though each bounce is random, 1,000 balls form an immaculate symmetric bell curve every time!',
      ru: 'Доска Гальтона: тысячи шариков падают сквозь штырьки, отскакивая влево или вправо с вероятностью 50%. Каждый шарик падает случайно, но вместе они выстраивают идеальный холм Гаусса!'
    },
    momentObservation: {
      en: 'Drop 500 marbles through peg pins in simulator: watch the histogram bins build up the smooth Gaussian bell curve.',
      ru: 'Спусти 500 шариков в симуляторе Гальтона: смотри, как внизу вырастает классическая колоколообразная кривая Гаусса!'
    },
    formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}, \\quad P(|x - \\mu| < 3\\sigma) = 99.7\\%',
    viewMode: 'moment_gauss',
    keywords: ['normal distribution', 'gauss', 'galton', 'probability', 'нормальное распределение', 'гаусс', 'гальтон', 'вероятность']
  }
];
