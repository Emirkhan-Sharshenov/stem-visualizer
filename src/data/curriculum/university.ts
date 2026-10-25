import { section, UNI } from './types';

/* First-year university topics, one step after grade 11 (shown as "ВУЗ"). Each links to an existing lab
   where one fits, so the step from school maths and physics to university stays visual. */

export const PHYSICS_UNI = [
  section('physics', UNI, 'mechanics-uni', ['Механика и колебания', 'Mechanics and oscillations'], [
    {
      id: 'pu-calculus-kinematics',
      title: ['Кинематика через производные', 'Kinematics with calculus'],
      intro: [
        'В вузе скорость и ускорение — это производные координаты по времени, а путь — интеграл от скорости. Школьные формулы получаются из них как частный случай.',
        'At university velocity and acceleration are derivatives of position, and distance is the integral of velocity; the school formulas follow as special cases.',
      ],
      points: [
        ['Производная', 'Derivative', 'v = dx/dt, a = dv/dt = d²x/dt². При a = const интегрирование даёт x = x₀ + v₀t + at²/2.', 'v = dx/dt, a = dv/dt = d²x/dt². For constant a, integrating gives x = x₀ + v₀t + at²/2.'],
        ['Векторы', 'Vectors', 'Движение в пространстве описывают радиус-вектором r(t); скорость направлена по касательной к траектории.', 'Motion in space is described by the position vector r(t); velocity is tangent to the path.'],
        ['Криволинейное движение', 'Curved motion', 'Ускорение раскладывают на касательное dv/dt и нормальное v²/R.', 'Acceleration splits into tangential dv/dt and normal v²/R parts.'],
      ],
      formula: '\\vec v = \\frac{d\\vec r}{dt},\\quad \\vec a = \\frac{d^2\\vec r}{dt^2}',
      sim: { moment: 'moment_derivative' },
    },
    {
      id: 'pu-oscillator',
      title: ['Гармонический осциллятор и резонанс', 'The harmonic oscillator and resonance'],
      intro: [
        'Груз на пружине, маятник, LC-контур и атомы в кристалле описываются одним уравнением x″ + ω₀²x = 0.',
        'A mass on a spring, a pendulum, an LC circuit and atoms in a crystal all obey x″ + ω₀²x = 0.',
      ],
      points: [
        ['Решение', 'Solution', 'x = A cos(ω₀t + φ), где ω₀ = √(k/m). Период не зависит от амплитуды.', 'x = A cos(ω₀t + φ) with ω₀ = √(k/m); the period doesn’t depend on amplitude.'],
        ['Затухание', 'Damping', 'С трением x″ + 2βx′ + ω₀²x = 0: амплитуда спадает как e^(−βt).', 'With friction x″ + 2βx′ + ω₀²x = 0 and the amplitude decays as e^(−βt).'],
        ['Резонанс', 'Resonance', 'При внешней силе с частотой, близкой к ω₀, амплитуда резко растёт — так рушились мосты и так настраивают радио.', 'Driven near ω₀ the amplitude soars — how bridges have failed and radios are tuned.'],
      ],
      formula: '\\ddot x + 2\\beta\\dot x + \\omega_0^2 x = 0',
      sim: { engine: 'pendulum_resonance' },
    },
    {
      id: 'pu-relativity',
      title: ['Специальная теория относительности', 'Special relativity'],
      intro: [
        'Скорость света одинакова для всех наблюдателей. Из этого следует, что время и длина зависят от того, кто и как движется.',
        'The speed of light is the same for every observer, so time and length depend on who is moving and how.',
      ],
      points: [
        ['Преобразования Лоренца', 'Lorentz transformations', 'x′ = γ(x − vt), t′ = γ(t − vx/c²), где γ = 1/√(1 − v²/c²).', 'x′ = γ(x − vt), t′ = γ(t − vx/c²) with γ = 1/√(1 − v²/c²).'],
        ['Замедление времени', 'Time dilation', 'Движущиеся часы идут медленнее в γ раз: мюоны из атмосферы долетают до земли только благодаря этому.', 'Moving clocks run slow by γ: atmospheric muons reach the ground only because of it.'],
        ['Энергия и масса', 'Energy and mass', 'E² = (pc)² + (mc²)²; у покоящейся частицы E = mc².', 'E² = (pc)² + (mc²)²; at rest E = mc².'],
      ],
      formula: '\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}',
      sim: { moment: 'moment_relativity' },
    },
  ]),
  section('physics', UNI, 'fields-uni', ['Поля и квантовая физика', 'Fields and quantum physics'], [
    {
      id: 'pu-gauss',
      title: ['Теорема Гаусса', 'Gauss’s law'],
      intro: [
        'Поток электрического поля через любую замкнутую поверхность равен заряду внутри, делённому на ε₀. Так легко находят поле шара, нити и плоскости.',
        'The electric flux through any closed surface equals the enclosed charge over ε₀; it quickly gives the field of a sphere, a line or a plane.',
      ],
      points: [
        ['Поток', 'Flux', 'Сколько силовых линий пересекает поверхность: Φ = ∮E·dS.', 'How many field lines cross a surface: Φ = ∮E·dS.'],
        ['Дивергенция', 'Divergence', 'В дифференциальной форме div E = ρ/ε₀: заряды — это источники поля.', 'In differential form div E = ρ/ε₀: charges are the field’s sources.'],
        ['Пример', 'Example', 'Поле бесконечной плоскости E = σ/(2ε₀) не зависит от расстояния до неё.', 'An infinite plane’s field E = σ/(2ε₀) doesn’t depend on distance.'],
      ],
      formula: '\\oint \\vec E\\cdot d\\vec S = \\frac{Q}{\\varepsilon_0}',
      sim: { lab: 'math_divergence' },
    },
    {
      id: 'pu-maxwell',
      title: ['Уравнения Максвелла', 'Maxwell’s equations'],
      intro: [
        'Четыре уравнения описывают всё электричество и магнетизм и предсказывают электромагнитные волны, летящие со скоростью света.',
        'Four equations describe all of electricity and magnetism and predict electromagnetic waves travelling at light speed.',
      ],
      points: [
        ['Источники', 'Sources', 'div E = ρ/ε₀ — заряды рождают электрическое поле; div B = 0 — магнитных зарядов нет.', 'div E = ρ/ε₀: charges make E; div B = 0: there are no magnetic charges.'],
        ['Вихри', 'Curls', 'rot E = −∂B/∂t — индукция Фарадея; rot B = μ₀j + μ₀ε₀∂E/∂t — токи и меняющееся E рождают B.', 'curl E = −∂B/∂t (Faraday); curl B = μ₀j + μ₀ε₀∂E/∂t: currents and changing E make B.'],
        ['Свет', 'Light', 'Из уравнений следует волна со скоростью c = 1/√(ε₀μ₀) — это и есть свет.', 'They give a wave moving at c = 1/√(ε₀μ₀) — light itself.'],
      ],
      formula: '\\nabla\\times\\vec E = -\\frac{\\partial \\vec B}{\\partial t}',
      sim: { process: 'em_waves' },
    },
    {
      id: 'pu-schrodinger',
      title: ['Уравнение Шрёдингера', 'The Schrödinger equation'],
      intro: [
        'В квантовой механике частицу описывает волновая функция ψ; |ψ|² — вероятность найти её в данной точке.',
        'In quantum mechanics a particle is described by a wave function ψ; |ψ|² is the probability of finding it at a point.',
      ],
      points: [
        ['Частица в яме', 'Particle in a box', 'Энергия квантуется: Eₙ = n²h²/(8mL²). Чем уже яма, тем больше энергия — поэтому атомы устойчивы.', 'Energy is quantised: Eₙ = n²h²/(8mL²); the narrower the box, the higher the energy — why atoms are stable.'],
        ['Туннельный эффект', 'Tunnelling', 'Частица может пройти сквозь барьер, который классически не преодолеть; на этом работают флеш-память и альфа-распад.', 'A particle can pass a barrier it classically couldn’t; flash memory and alpha decay rely on it.'],
        ['Принцип неопределённости', 'Uncertainty principle', 'Δx·Δp ≥ ħ/2: нельзя одновременно точно знать координату и импульс.', 'Δx·Δp ≥ ħ/2: position and momentum can’t both be known exactly.'],
      ],
      formula: '-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2} + U\\psi = E\\psi',
      sim: { lab: 'orbitals' },
    },
    {
      id: 'pu-entropy',
      title: ['Энтропия и второй закон термодинамики', 'Entropy and the second law'],
      intro: [
        'Энтропия измеряет число способов устроить систему изнутри. В замкнутой системе она не убывает — поэтому тепло само течёт от горячего к холодному.',
        'Entropy counts the ways a system can be arranged inside; in an isolated system it never decreases — so heat flows from hot to cold.',
      ],
      points: [
        ['Определение', 'Definition', 'dS = δQ/T; по Больцману S = k ln W, где W — число микросостояний.', 'dS = δQ/T; Boltzmann’s S = k ln W, with W the number of microstates.'],
        ['Цикл Карно', 'Carnot cycle', 'Наибольший КПД тепловой машины η = 1 − T₂/T₁ — его нельзя превзойти.', 'The best possible engine efficiency is η = 1 − T₂/T₁.'],
        ['Стрела времени', 'Arrow of time', 'Рост энтропии отличает прошлое от будущего: разбитая чашка сама не склеивается.', 'Growing entropy separates past from future: a broken cup doesn’t reassemble.'],
      ],
      formula: 'S = k \\ln W',
      sim: { engine: 'heat_engines_carnot' },
    },
  ]),
];

export const MATH_UNI = [
  section('mathematics', UNI, 'analysis', ['Математический анализ', 'Calculus'], [
    {
      id: 'mu-limits',
      title: ['Пределы и непрерывность', 'Limits and continuity'],
      intro: [
        'Предел — значение, к которому функция приближается, когда аргумент подходит к точке. На нём строится весь анализ.',
        'A limit is the value a function approaches as its argument nears a point; all of calculus is built on it.',
      ],
      points: [
        ['Определение ε–δ', 'ε–δ definition', 'lim f(x) = A, если для любого ε > 0 найдётся δ > 0, что |f(x) − A| < ε при |x − a| < δ.', 'lim f(x) = A if for every ε > 0 there is δ > 0 with |f(x) − A| < ε whenever |x − a| < δ.'],
        ['Замечательные пределы', 'Notable limits', 'sin x / x → 1 при x → 0; (1 + 1/n)ⁿ → e ≈ 2,718.', 'sin x / x → 1 as x → 0; (1 + 1/n)ⁿ → e ≈ 2.718.'],
        ['Непрерывность', 'Continuity', 'Функция непрерывна, если предел в точке равен значению в ней — график рисуется без отрыва карандаша.', 'A function is continuous where its limit equals its value — the graph is drawn without lifting the pen.'],
      ],
      formula: '\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1',
      sim: { graph: 'sin' },
    },
    {
      id: 'mu-taylor',
      title: ['Ряд Тейлора', 'Taylor series'],
      intro: [
        'Почти любую гладкую функцию можно приблизить многочленом — так калькулятор считает синус и экспоненту.',
        'Almost any smooth function can be approximated by a polynomial — how a calculator computes sine and exp.',
      ],
      points: [
        ['Формула', 'Formula', 'f(x) = f(a) + f′(a)(x − a) + f″(a)(x − a)²/2! + …', 'f(x) = f(a) + f′(a)(x − a) + f″(a)(x − a)²/2! + …'],
        ['Примеры', 'Examples', 'eˣ = 1 + x + x²/2! + x³/3! + …; sin x = x − x³/3! + x⁵/5! − …', 'eˣ = 1 + x + x²/2! + x³/3! + …; sin x = x − x³/3! + x⁵/5! − …'],
        ['Зачем', 'Why', 'Около точки хватает двух-трёх членов: sin x ≈ x при малых углах — так упрощают маятник.', 'Near the point two or three terms suffice: sin x ≈ x for small angles, which simplifies the pendulum.'],
      ],
      formula: 'e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!}',
      sim: { graph: 'exp' },
    },
    {
      id: 'mu-integrals',
      title: ['Определённый интеграл и его приложения', 'The definite integral and its uses'],
      intro: [
        'Интеграл — сумма бесконечно малых кусочков. Им находят площади, объёмы, работу силы и массу неоднородного тела.',
        'An integral is a sum of infinitely small pieces; it gives areas, volumes, work and the mass of uneven bodies.',
      ],
      points: [
        ['Формула Ньютона — Лейбница', 'Fundamental theorem', '∫ₐᵇ f(x)dx = F(b) − F(a), где F′ = f.', '∫ₐᵇ f(x)dx = F(b) − F(a), where F′ = f.'],
        ['Объём тела вращения', 'Volume of revolution', 'V = π∫ₐᵇ f(x)² dx — сумма тонких дисков.', 'V = π∫ₐᵇ f(x)² dx — a sum of thin discs.'],
        ['Несобственные интегралы', 'Improper integrals', 'Интеграл до бесконечности может быть конечным: ∫₁^∞ dx/x² = 1.', 'An integral to infinity can be finite: ∫₁^∞ dx/x² = 1.'],
      ],
      formula: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
      sim: { lab: 'math_revolution' },
    },
    {
      id: 'mu-ode',
      title: ['Дифференциальные уравнения', 'Differential equations'],
      intro: [
        'Уравнение, где неизвестна функция и в него входят её производные. Ими описывают рост населения, остывание, колебания и радиоактивный распад.',
        'An equation for an unknown function involving its derivatives; it describes population growth, cooling, oscillations and decay.',
      ],
      points: [
        ['Экспоненциальный рост', 'Exponential growth', 'y′ = ky даёт y = y₀e^(kt): распад при k < 0, рост при k > 0.', 'y′ = ky gives y = y₀e^(kt): decay for k < 0, growth for k > 0.'],
        ['Разделение переменных', 'Separation of variables', 'dy/g(y) = f(x)dx, затем интегрируют обе части.', 'dy/g(y) = f(x)dx, then integrate both sides.'],
        ['Второй порядок', 'Second order', 'y″ + ω²y = 0 — уравнение колебаний с решением y = A cos(ωx + φ).', 'y″ + ω²y = 0 — the oscillation equation, solved by y = A cos(ωx + φ).'],
      ],
      formula: '\\frac{dy}{dt} = ky \\Rightarrow y = y_0 e^{kt}',
      sim: { graph: 'exp' },
    },
  ]),
  section('mathematics', UNI, 'algebra-uni', ['Линейная алгебра и вероятность', 'Linear algebra and probability'], [
    {
      id: 'mu-matrices',
      title: ['Матрицы и определители', 'Matrices and determinants'],
      intro: [
        'Матрица — таблица чисел, которая описывает линейное преобразование: поворот, растяжение, отражение. Системы уравнений решают через матрицы.',
        'A matrix is a table of numbers describing a linear map — rotation, stretch, reflection; systems of equations are solved with matrices.',
      ],
      points: [
        ['Умножение', 'Multiplication', 'Строка на столбец; AB ≠ BA — порядок преобразований важен.', 'Row times column; AB ≠ BA, so the order of transformations matters.'],
        ['Определитель', 'Determinant', 'Во сколько раз преобразование меняет площадь (объём). det = 0 — плоскость сплющилась, обратной матрицы нет.', 'How much a map scales area (volume); det = 0 means space is flattened and there is no inverse.'],
        ['Системы уравнений', 'Linear systems', 'Ax = b решается как x = A⁻¹b или методом Гаусса.', 'Ax = b is solved as x = A⁻¹b or by Gaussian elimination.'],
      ],
      formula: '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc',
    },
    {
      id: 'mu-eigen',
      title: ['Собственные векторы и значения', 'Eigenvectors and eigenvalues'],
      intro: [
        'Собственный вектор при преобразовании не поворачивается, а только растягивается в λ раз. На этом работают поиск Google и анализ колебаний.',
        'An eigenvector isn’t turned by a map, only stretched by λ; Google’s ranking and vibration analysis rely on it.',
      ],
      points: [
        ['Уравнение', 'Equation', 'Av = λv; λ находят из det(A − λE) = 0.', 'Av = λv; find λ from det(A − λI) = 0.'],
        ['Смысл', 'Meaning', 'Это «естественные оси» преобразования: в них матрица становится диагональной.', 'They are the map’s natural axes: in them the matrix becomes diagonal.'],
        ['Применения', 'Uses', 'Главные оси инерции, собственные частоты моста, метод главных компонент в анализе данных.', 'Principal axes of inertia, a bridge’s natural frequencies, principal component analysis.'],
      ],
      formula: 'A\\vec v = \\lambda \\vec v',
    },
    {
      id: 'mu-complex',
      title: ['Комплексные числа', 'Complex numbers'],
      intro: [
        'Добавив число i, у которого i² = −1, получаем числа a + bi — точки плоскости. Умножение на них — это поворот и растяжение.',
        'Adding i with i² = −1 gives numbers a + bi — points of a plane; multiplying by them rotates and stretches.',
      ],
      points: [
        ['Тригонометрическая форма', 'Polar form', 'z = r(cos φ + i sin φ); при умножении модули перемножаются, а углы складываются.', 'z = r(cos φ + i sin φ); multiplying multiplies moduli and adds angles.'],
        ['Формула Эйлера', 'Euler’s formula', 'e^(iφ) = cos φ + i sin φ; при φ = π получается e^(iπ) + 1 = 0.', 'e^(iφ) = cos φ + i sin φ; at φ = π, e^(iπ) + 1 = 0.'],
        ['Где нужны', 'Where used', 'Переменный ток, сигналы и квантовая механика удобнее всего считаются в комплексных числах.', 'AC circuits, signals and quantum mechanics are easiest in complex numbers.'],
      ],
      formula: 'e^{i\\varphi} = \\cos\\varphi + i\\sin\\varphi',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'mu-probability',
      title: ['Случайные величины и нормальное распределение', 'Random variables and the normal distribution'],
      intro: [
        'Сумма многих случайных влияний почти всегда даёт колокол Гаусса — так распределены рост людей, ошибки измерений и баллы экзамена.',
        'The sum of many random effects almost always gives Gauss’s bell — heights, measurement errors and exam scores.',
      ],
      points: [
        ['Матожидание и дисперсия', 'Mean and variance', 'M(X) — среднее значение, D(X) — средний квадрат отклонения от него; σ = √D.', 'E(X) is the average; Var(X) the mean squared deviation; σ = √Var.'],
        ['Правило трёх сигм', 'Three-sigma rule', '68% значений лежат в пределах ±σ, 95% — в ±2σ, 99,7% — в ±3σ.', '68% of values lie within ±σ, 95% within ±2σ, 99.7% within ±3σ.'],
        ['Центральная предельная теорема', 'Central limit theorem', 'Сумма большого числа независимых величин распределена почти нормально, каким бы ни было исходное распределение.', 'A sum of many independent variables is nearly normal, whatever the original distribution.'],
      ],
      formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
      sim: { engine: 'galton_normal_distribution' },
    },
  ]),
];

export const CHEMISTRY_UNI = [
  section('chemistry', UNI, 'physchem', ['Физическая химия', 'Physical chemistry'], [
    {
      id: 'cu-quantum',
      title: ['Квантовые числа и орбитали', 'Quantum numbers and orbitals'],
      intro: [
        'Электрон в атоме описывают четыре квантовых числа; орбиталь — область, где его вероятнее всего найти.',
        'An electron in an atom has four quantum numbers; an orbital is where it is most likely to be found.',
      ],
      points: [
        ['n, ℓ, m, s', 'n, ℓ, m, s', 'n — уровень, ℓ — форма (s, p, d, f), m — ориентация, s — спин ±½.', 'n is the level, ℓ the shape (s, p, d, f), m the orientation, s the spin ±½.'],
        ['Принцип Паули и правило Хунда', 'Pauli and Hund', 'На орбитали не больше двух электронов с разными спинами; одинаковые орбитали заполняются сначала по одному.', 'At most two electrons per orbital with opposite spins; equal orbitals fill singly first.'],
        ['Энергия уровней', 'Level energies', 'В водороде Eₙ = −13,6 эВ / n²; переходы между уровнями дают линии спектра.', 'In hydrogen Eₙ = −13.6 eV / n²; jumps between levels give spectral lines.'],
      ],
      formula: 'E_n = -\\frac{13.6\\ \\mathrm{eV}}{n^2}',
      sim: { lab: 'orbitals' },
    },
    {
      id: 'cu-hybrid',
      title: ['Гибридизация и форма молекул', 'Hybridisation and molecular shape'],
      intro: [
        'Атомные орбитали смешиваются в гибридные, и это задаёт углы между связями: 180°, 120° или 109,5°.',
        'Atomic orbitals mix into hybrids that fix bond angles at 180°, 120° or 109.5°.',
      ],
      points: [
        ['sp, sp², sp³', 'sp, sp², sp³', 'sp — линейная молекула (CO₂), sp² — плоский треугольник (BF₃), sp³ — тетраэдр (CH₄).', 'sp is linear (CO₂), sp² trigonal planar (BF₃), sp³ tetrahedral (CH₄).'],
        ['Теория ОЭПВО', 'VSEPR', 'Электронные пары отталкиваются и расходятся как можно дальше; неподелённые пары сжимают угол — у воды 104,5°.', 'Electron pairs repel and spread out; lone pairs squeeze angles — water’s is 104.5°.'],
        ['σ- и π-связи', 'σ and π bonds', 'Одинарная связь — σ, в двойной добавляется π, в тройной — две π.', 'A single bond is σ; a double adds a π; a triple adds two.'],
      ],
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'cu-gibbs',
      title: ['Энтальпия, энтропия и энергия Гиббса', 'Enthalpy, entropy and Gibbs energy'],
      intro: [
        'Пойдёт ли реакция сама, решает энергия Гиббса: ΔG = ΔH − TΔS. Если ΔG < 0, реакция возможна.',
        'Whether a reaction runs by itself is decided by the Gibbs energy ΔG = ΔH − TΔS; ΔG < 0 means it can.',
      ],
      points: [
        ['Энтальпия', 'Enthalpy', 'ΔH < 0 — тепло выделяется (горение), ΔH > 0 — поглощается (разложение карбонатов).', 'ΔH < 0 releases heat (burning); ΔH > 0 absorbs it (decomposing carbonates).'],
        ['Закон Гесса', 'Hess’s law', 'Тепловой эффект не зависит от пути: его считают по энтальпиям образования веществ.', 'The heat of a reaction doesn’t depend on the route; compute it from enthalpies of formation.'],
        ['Роль температуры', 'Role of temperature', 'Реакции с ростом энтропии (ΔS > 0) становятся выгоднее при нагреве.', 'Reactions that raise entropy (ΔS > 0) become more favourable when heated.'],
      ],
      formula: '\\Delta G = \\Delta H - T\\Delta S',
      sim: { engine: 'thermodynamics_first_law' },
    },
    {
      id: 'cu-kinetics',
      title: ['Скорость реакции и уравнение Аррениуса', 'Reaction rate and the Arrhenius equation'],
      intro: [
        'Скорость реакции зависит от концентраций и резко растёт с температурой: молекулам нужно преодолеть энергию активации.',
        'Rate depends on concentrations and rises sharply with temperature, since molecules must clear an activation energy.',
      ],
      points: [
        ['Порядок реакции', 'Reaction order', 'v = k[A]^m[B]^n; показатели находят опытом, а не по коэффициентам уравнения.', 'v = k[A]^m[B]^n; the exponents come from experiment, not from the equation’s coefficients.'],
        ['Уравнение Аррениуса', 'Arrhenius equation', 'k = A·e^(−Eₐ/RT): нагрев на 10° часто ускоряет реакцию в 2–4 раза.', 'k = A·e^(−Eₐ/RT): 10° of heating often speeds a reaction 2–4 times.'],
        ['Катализ', 'Catalysis', 'Катализатор открывает путь с меньшей Eₐ и сам не расходуется.', 'A catalyst opens a path with lower Eₐ and isn’t used up.'],
      ],
      formula: 'k = A e^{-E_a/(RT)}',
      sim: { lab: 'kinetics' },
    },
    {
      id: 'cu-nernst',
      title: ['Электродные потенциалы и уравнение Нернста', 'Electrode potentials and the Nernst equation'],
      intro: [
        'Напряжение гальванического элемента зависит от того, какие металлы взяты, и от концентраций растворов.',
        'A cell’s voltage depends on which metals are used and on the solution concentrations.',
      ],
      points: [
        ['ЭДС элемента', 'Cell EMF', 'E = E(катода) − E(анода); для медно-цинкового элемента около 1,1 В.', 'E = E(cathode) − E(anode); about 1.1 V for a copper–zinc cell.'],
        ['Уравнение Нернста', 'Nernst equation', 'E = E° + (0,059/n)·lg[Ox]/[Red] при 25 °C.', 'E = E° + (0.059/n)·log[Ox]/[Red] at 25 °C.'],
        ['Связь с ΔG', 'Link to ΔG', 'ΔG = −nFE: положительная ЭДС значит, что реакция идёт сама.', 'ΔG = −nFE: a positive EMF means the reaction runs by itself.'],
      ],
      formula: 'E = E^\\circ + \\frac{0.059}{n}\\lg\\frac{[\\mathrm{Ox}]}{[\\mathrm{Red}]}',
      sim: { lab: 'galvanic' },
    },
  ]),
];

export const BIOLOGY_UNI = [
  section('biology', UNI, 'molbio', ['Молекулярная биология и биохимия', 'Molecular biology and biochemistry'], [
    {
      id: 'bu-dogma',
      title: ['Центральная догма: ДНК → РНК → белок', 'The central dogma: DNA → RNA → protein'],
      intro: [
        'Информация течёт от ДНК к РНК при транскрипции и от РНК к белку при трансляции.',
        'Information flows from DNA to RNA in transcription and from RNA to protein in translation.',
      ],
      points: [
        ['Транскрипция', 'Transcription', 'РНК-полимераза строит мРНК по одной цепи ДНК; у эукариот из неё вырезают интроны (сплайсинг).', 'RNA polymerase builds mRNA from one DNA strand; in eukaryotes introns are spliced out.'],
        ['Трансляция', 'Translation', 'Рибосома читает мРНК по три нуклеотида (кодон), тРНК приносят нужные аминокислоты.', 'The ribosome reads mRNA three bases (a codon) at a time; tRNAs bring matching amino acids.'],
        ['Генетический код', 'Genetic code', '64 кодона кодируют 20 аминокислот и сигналы «стоп»; код почти одинаков у всех живых существ.', '64 codons encode 20 amino acids and stop signals; the code is nearly universal.'],
      ],
      sim: { moment: 'moment_dna' },
    },
    {
      id: 'bu-enzymes',
      title: ['Кинетика ферментов', 'Enzyme kinetics'],
      intro: [
        'Ферменты ускоряют реакции в миллионы раз. Скорость растёт с концентрацией субстрата, но упирается в предел, когда все ферменты заняты.',
        'Enzymes speed reactions millions of times; the rate rises with substrate but levels off when every enzyme is busy.',
      ],
      points: [
        ['Уравнение Михаэлиса — Ментен', 'Michaelis–Menten', 'v = Vmax[S] / (Km + [S]); Km — концентрация, при которой скорость равна половине максимальной.', 'v = Vmax[S] / (Km + [S]); Km is the substrate level giving half the maximum rate.'],
        ['Ингибиторы', 'Inhibitors', 'Конкурентные занимают активный центр и повышают Km; неконкурентные снижают Vmax. Так работают многие лекарства.', 'Competitive ones block the active site and raise Km; non-competitive ones lower Vmax. Many drugs work this way.'],
        ['Температура и pH', 'Temperature and pH', 'У каждого фермента есть оптимум; при перегреве белок денатурирует.', 'Each enzyme has an optimum; overheating denatures the protein.'],
      ],
      formula: 'v = \\frac{V_{max}[S]}{K_m + [S]}',
      sim: { lab: 'enzymes' },
    },
    {
      id: 'bu-membrane',
      title: ['Мембранный потенциал и нервный импульс', 'Membrane potential and the nerve impulse'],
      intro: [
        'Насосы и каналы мембраны держат внутри клетки заряд около −70 мВ. Быстрое открытие каналов даёт потенциал действия — нервный импульс.',
        'Membrane pumps and channels keep the inside at about −70 mV; a quick opening of channels makes an action potential, the nerve impulse.',
      ],
      points: [
        ['Na⁺/K⁺-насос', 'Na⁺/K⁺ pump', 'За один цикл выкачивает 3 Na⁺ и закачивает 2 K⁺, тратя одну молекулу АТФ.', 'Each cycle pumps out 3 Na⁺ and in 2 K⁺ for one ATP.'],
        ['Уравнение Нернста', 'Nernst equation', 'Равновесный потенциал иона E = (RT/zF)·ln([снаружи]/[внутри]).', 'An ion’s equilibrium potential is E = (RT/zF)·ln([out]/[in]).'],
        ['Потенциал действия', 'Action potential', 'Вход Na⁺ поднимает потенциал до +30 мВ, выход K⁺ возвращает его — всё за 1–2 мс.', 'Na⁺ rushing in lifts it to +30 mV, K⁺ leaving brings it back — all in 1–2 ms.'],
      ],
      formula: 'E = \\frac{RT}{zF}\\ln\\frac{[C]_{out}}{[C]_{in}}',
      sim: { moment: 'moment_neuron' },
    },
  ]),
  section('biology', UNI, 'popbio', ['Популяции и эволюция', 'Populations and evolution'], [
    {
      id: 'bu-hardy',
      title: ['Закон Харди — Вайнберга', 'The Hardy–Weinberg law'],
      intro: [
        'В большой популяции без отбора, мутаций и миграций частоты аллелей не меняются из поколения в поколение.',
        'In a large population without selection, mutation or migration, allele frequencies stay the same across generations.',
      ],
      points: [
        ['Формула', 'Formula', 'p + q = 1 и p² + 2pq + q² = 1, где p и q — частоты двух аллелей.', 'p + q = 1 and p² + 2pq + q² = 1, with p and q the two allele frequencies.'],
        ['Носители', 'Carriers', 'Если болеет 1 из 10 000 (q² = 0,0001), то q = 0,01, а носителей 2pq ≈ 2%.', 'If 1 in 10 000 is affected (q² = 0.0001), q = 0.01 and carriers 2pq ≈ 2%.'],
        ['Когда нарушается', 'When it breaks', 'Отбор, дрейф генов в малых популяциях и мутации сдвигают частоты — это и есть эволюция.', 'Selection, drift in small populations and mutation shift frequencies — that is evolution.'],
      ],
      formula: 'p^2 + 2pq + q^2 = 1',
      sim: { lab: 'selection' },
    },
    {
      id: 'bu-lotka',
      title: ['Модель «хищник — жертва»', 'The predator–prey model'],
      intro: [
        'Численности хищников и жертв колеблются со сдвигом: зайцев становится больше — растёт число рысей, рысей много — зайцев меньше.',
        'Predator and prey numbers oscillate out of step: more hares lead to more lynx, many lynx to fewer hares.',
      ],
      points: [
        ['Уравнения Лотки — Вольтерры', 'Lotka–Volterra equations', 'dx/dt = αx − βxy, dy/dt = δxy − γy, где x — жертвы, y — хищники.', 'dx/dt = αx − βxy, dy/dt = δxy − γy, with x prey and y predators.'],
        ['Циклы', 'Cycles', 'Пик хищников отстаёт от пика жертв; это видно в данных о шкурках зайцев и рысей за сто лет.', 'Predator peaks lag prey peaks, as in a century of hare and lynx fur records.'],
        ['Логистический рост', 'Logistic growth', 'Без хищников рост ограничен ёмкостью среды K: dN/dt = rN(1 − N/K).', 'Without predators growth is capped by capacity K: dN/dt = rN(1 − N/K).'],
      ],
      formula: '\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)',
      sim: { lab: 'ecosystem' },
    },
    {
      id: 'bu-photosynthesis-biochem',
      title: ['Биохимия фотосинтеза', 'The biochemistry of photosynthesis'],
      intro: [
        'Световые реакции превращают энергию света в АТФ и НАДФН, а цикл Кальвина тратит их, чтобы собрать сахар из CO₂.',
        'Light reactions turn light into ATP and NADPH; the Calvin cycle spends them to build sugar from CO₂.',
      ],
      points: [
        ['Фотосистемы', 'Photosystems', 'ФС II расщепляет воду и выделяет O₂, ФС I восстанавливает НАДФ⁺; между ними ток электронов качает протоны.', 'PS II splits water and releases O₂; PS I reduces NADP⁺; electron flow between them pumps protons.'],
        ['АТФ-синтаза', 'ATP synthase', 'Протоны возвращаются через белковую турбину, которая вращается и собирает АТФ.', 'Protons flow back through a protein turbine that spins and makes ATP.'],
        ['Рубиско', 'Rubisco', 'Фермент цикла Кальвина, связывающий CO₂, — самый распространённый белок на Земле.', 'The Calvin cycle enzyme that fixes CO₂ is the most abundant protein on Earth.'],
      ],
      formula: '6CO_2 + 6H_2O \\xrightarrow{h\\nu} C_6H_{12}O_6 + 6O_2',
      sim: { lab: 'photosynthesis' },
    },
  ]),
];

export const ASTRONOMY_UNI = [
  section('astronomy', UNI, 'astrophysics', ['Астрофизика и космология', 'Astrophysics and cosmology'], [
    {
      id: 'au-stellar-structure',
      title: ['Строение звёзд', 'Stellar structure'],
      intro: [
        'Звезда держится равновесием: тяготение сжимает её, а давление горячего газа и излучения распирает.',
        'A star holds by balance: gravity squeezes it while the pressure of hot gas and radiation pushes out.',
      ],
      points: [
        ['Гидростатическое равновесие', 'Hydrostatic equilibrium', 'dP/dr = −Gm(r)ρ/r²: давление растёт к центру ровно настолько, чтобы держать вес верхних слоёв.', 'dP/dr = −Gm(r)ρ/r²: pressure rises inwards just enough to hold up the layers above.'],
        ['Закон Стефана — Больцмана', 'Stefan–Boltzmann law', 'Светимость L = 4πR²σT⁴: вдвое горячее — в 16 раз ярче при том же размере.', 'Luminosity L = 4πR²σT⁴: twice as hot means 16 times brighter at the same size.'],
        ['Время жизни', 'Lifetime', 'L ∝ M^3,5, поэтому массивные звёзды сгорают за миллионы лет, а красные карлики живут триллионы.', 'L ∝ M^3.5, so massive stars burn out in millions of years while red dwarfs last trillions.'],
      ],
      formula: 'L = 4\\pi R^2 \\sigma T^4',
      sim: { engine: 'stellar_evolution_hr' },
    },
    {
      id: 'au-black-holes',
      title: ['Чёрные дыры', 'Black holes'],
      intro: [
        'Если сжать массу под радиус Шварцшильда, вторая космическая скорость превысит скорость света, и наружу не выйдет даже свет.',
        'Squeeze a mass inside its Schwarzschild radius and the escape speed exceeds light speed: not even light gets out.',
      ],
      points: [
        ['Радиус Шварцшильда', 'Schwarzschild radius', 'r = 2GM/c²: для Земли это 9 мм, для Солнца — 3 км.', 'r = 2GM/c²: 9 mm for Earth, 3 km for the Sun.'],
        ['Замедление времени', 'Time dilation', 'Вблизи горизонта время для далёкого наблюдателя почти останавливается.', 'Near the horizon time almost stops for a distant observer.'],
        ['Гравитационные волны', 'Gravitational waves', 'Слияние двух чёрных дыр в 2015 году впервые зарегистрировал детектор LIGO.', 'The merger of two black holes was first detected by LIGO in 2015.'],
      ],
      formula: 'r_s = \\frac{2GM}{c^2}',
      sim: { moment: 'moment_relativity' },
    },
    {
      id: 'au-cosmology',
      title: ['Расширяющаяся Вселенная', 'The expanding Universe'],
      intro: [
        'Общая теория относительности описывает Вселенную как пространство, которое растягивается само; галактики не летят сквозь него, а уносятся вместе с ним.',
        'General relativity describes the Universe as space that stretches itself; galaxies don’t fly through it but are carried along.',
      ],
      points: [
        ['Масштабный фактор', 'Scale factor', 'Расстояния растут пропорционально a(t); красное смещение 1 + z = a(сейчас)/a(тогда).', 'Distances grow with a(t); redshift is 1 + z = a(now)/a(then).'],
        ['Уравнение Фридмана', 'Friedmann equation', 'H² = 8πGρ/3 − k/a²: скорость расширения задаёт плотность вещества и энергии.', 'H² = 8πGρ/3 − k/a²: density sets the expansion rate.'],
        ['Состав Вселенной', 'What it’s made of', 'Обычное вещество — около 5%, тёмная материя — 27%, тёмная энергия — 68%.', 'Ordinary matter about 5%, dark matter 27%, dark energy 68%.'],
      ],
      formula: 'H^2 = \\frac{8\\pi G}{3}\\rho - \\frac{k}{a^2}',
      sim: { engine: 'universe_solar_stars' },
    },
  ]),
];
