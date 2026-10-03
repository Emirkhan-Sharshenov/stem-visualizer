import { ConceptItem, Milestone, PredictionChallenge } from '../types/stem';

export const CONCEPTS_LIST: ConceptItem[] = [
  {
    id: 's-orbital',
    category: 'chemistry',
    title: { en: 's-Orbital (ℓ = 0)', ru: 's-Орбиталь (ℓ = 0)' },
    subtitle: { en: 'Spherical electron density cloud', ru: 'Сферически симметричное электронное облако' },
    iconName: 'Atom',
    viewMode: 'orbitals',
    initialParams: { n: 1, l: 0, m: 0, orbitalType: '1s' },
    keywords: ['orbital', 's-orbital', 'spherical', 'quantum', 'орбиталь', 'сфера', 'квант', '1s', '2s'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'A 3D fluffy cloud around the nucleus', ru: 'Пушистое 3D-облако вокруг ядра' },
        content: {
          en: 'An electron is not a little billiard ball spinning on a track. Instead, it is spread out like a soft cloud. For an s-orbital, this cloud is a round sphere: the electron has an equal chance of being in any direction!',
          ru: 'Электрон — это не крошечный бильярдный шарик на рельсах. Он «размазан» в пространстве как облако. Для s-орбитали это облако идеально круглое: электрон с равной вероятностью может оказаться в любом направлении!'
        },
        visualCue: { en: 'Rotate the model — notice it looks identical from every angle.', ru: 'Вращай модель — заметь, что она выглядит одинаково со всех сторон.' }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Equal radial probability', ru: 'Одинаковая радиальная вероятность' },
        content: {
          en: 'Because orbital quantum number ℓ = 0, there is no preferred axis or direction. The electron probability density |ψ|² depends solely on distance r from the nucleus, not on angles θ or φ.',
          ru: 'Поскольку орбитальное квантовое число ℓ = 0, у орбитали нет выделенной оси. Плотность вероятности |ψ|² зависит только от расстояния r до центра ядра, но не зависит от углов θ и φ.'
        },
        visualCue: { en: 'Switch to "Probability Density" to see brightness peak near the center.', ru: 'Переключи на «Плотность вероятности», чтобы увидеть максимум яркости у центра.' }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Zero angular momentum & radial nodes', ru: 'Нулевой угловой момент и радиальные узлы' },
        content: {
          en: 'With ℓ = 0, orbital angular momentum L = √(ℓ(ℓ+1))ħ = 0. For 2s (n=2), a spherical radial node appears at r = 2a₀ where probability drops strictly to zero, separating two concentric shells.',
          ru: 'При ℓ = 0 угловой момент L = √(ℓ(ℓ+1))ħ = 0. Для 2s (n=2) появляется сферический радиальный узел на r = 2a₀, где волновая функция меняет знак, а вероятность нахождения электрона строго равна нулю.'
        },
        visualCue: { en: 'Select n=2 and toggle "Nodal Surfaces" to slice open the hollow internal shell.', ru: 'Выбери n=2 и включи «Узловые поверхности», чтобы увидеть скрытую внутреннюю сферу.' }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Exact Schrödinger solution & Y₀₀ harmonic', ru: 'Точное решение уравнения Шрёдингера и гармоника Y₀₀' },
        content: {
          en: 'The wavefunction factorizes into radial and angular parts: ψ₁₀₀(r,θ,φ) = R₁₀(r) Y₀₀(θ,φ). Since spherical harmonic Y₀₀ = 1/√(4π) is a constant scalar, the angular dependency vanishes completely.',
          ru: 'Волновая функция факторизуется: ψ₁₀₀(r,θ,φ) = R₁₀(r) Y₀₀(θ,φ). Так как сферическая гармоника Y₀₀ = 1/√(4π) является константой, угловая зависимость полностью исчезает.'
        },
        mathFormula: 'ψ_{1s}(r) = \\frac{1}{\\sqrt{\\pi a_0^3}} e^{-r/a_0}, \\quad Y_{0,0} = \\frac{1}{\\sqrt{4\\pi}}'
      }
    ]
  },
  {
    id: 'p-orbital',
    category: 'chemistry',
    title: { en: 'p-Orbital (ℓ = 1)', ru: 'p-Орбиталь (ℓ = 1)' },
    subtitle: { en: 'Dumbbell lobes with a planar node', ru: 'Гантелевидные лепестки с узловой плоскостью' },
    iconName: 'Shapes',
    viewMode: 'orbitals',
    initialParams: { n: 2, l: 1, m: 0, orbitalType: '2pz' },
    keywords: ['p-orbital', 'dumbbell', 'node', 'quantum', 'гантель', 'узел', 'лепестки', '2p'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'Like two balloons tied at the center', ru: 'Как два шарика, связанные в центре' },
        content: {
          en: 'A p-orbital looks like an hourglass or figure-8 dumbbell. The electron is most likely found in the top or bottom lobes, but NEVER right at the very center point where the nucleus sits!',
          ru: 'p-орбиталь похожа на объемную восьмёрку или песочные часы. Электрон чаще всего находится в верхней или нижней доле, но НИКОГДА в самой центральной точке, где находится ядро!'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Directional orientation along X, Y, or Z', ru: 'Ориентация вдоль осей X, Y или Z' },
        content: {
          en: 'There are three p-orbitals: px, py, and pz, oriented at 90° angles to each other. They allow atoms to form directional covalent bonds in specific geometry.',
          ru: 'Существуют три p-орбитали: px, py и pz, направленные перпендикулярно друг к другу под углом 90°. Именно они задают геометрию ковалентных связей в молекулах.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Wavefunction signs (+/-) and nodal plane', ru: 'Фазы волновой функции (+/-) и узловая плоскость' },
        content: {
          en: 'The two lobes have opposite mathematical phases (+ and -). The XY plane cutting through the center is a nodal plane where ψ = 0. When orbitals overlap with the same phase (+ with +), they constructively interfere to form a bonding orbital.',
          ru: 'Две лопасти имеют противоположные знаки волновой функции (+ и -). Плоскость XY в центре является узловой: в ней ψ = 0. При перекрывании одинаковых фаз (+ с +) образуется связывающая молекулярная орбиталь.'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Dipole angular momentum & Y₁₀(θ,φ)', ru: 'Дипольный момент количества движения и гармоника Y₁₀' },
        content: {
          en: 'With ℓ = 1, the angular solution is proportional to cos(θ) for m=0, yielding ψ₂₁₀ = R₂₁(r) √(3/4π) cos(θ). The z-axis projection corresponds to z = r cos(θ), proving the dumbbell symmetry.',
          ru: 'При ℓ = 1 угловое решение пропорционально cos(θ) для m=0: ψ₂₁₀ = R₂₁(r) √(3/4π) cos(θ). Так как z = r cos(θ), волновая функция прямо пропорциональна координате z.'
        },
        mathFormula: 'Y_{1,0}(\\theta,\\phi) = \\sqrt{\\frac{3}{4\\pi}} \\cos\\theta = \\sqrt{\\frac{3}{4\\pi}} \\frac{z}{r}'
      }
    ]
  },
  {
    id: 'h2o-deconstruction',
    category: 'chemistry',
    title: { en: 'Deconstruct H₂O', ru: 'Разбери молекулу воды (H₂O)' },
    subtitle: { en: 'From formula to lone pair repulsion & 104.5° bent shape', ru: 'От формулы к отталкиванию неподелённых пар и углу 104.5°' },
    iconName: 'Layers',
    viewMode: 'deconstruction',
    initialParams: { molecule: 'H2O' },
    keywords: ['water', 'h2o', 'deconstruct', 'hybridization', 'sp3', 'bent', 'вода', 'гибридизация', 'разбор'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'Why is water bent, not a straight stick?', ru: 'Почему вода согнута, а не прямая линия?' },
        content: {
          en: 'You might imagine H-O-H in a straight line. But oxygen has two invisible pairs of "shy" electrons that take up huge space, pushing the two hydrogens down into an angled shape!',
          ru: 'Кажется логичным нарисовать H-O-H по прямой линии. Но у кислорода есть две «невидимые» пары электронов, которые занимают много места и отталкивают атомы водорода вниз, сгибая молекулу под углом!'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'VSEPR Theory & Lone pairs', ru: 'Теория ОЭПВ и неподелённые пары' },
        content: {
          en: 'Oxygen has 8 electrons: 2 in inner core, 6 valence electrons. 2 form single bonds with H, leaving 2 non-bonding lone pairs. Negative charges repel each other, creating a tetrahedron.',
          ru: 'У кислорода 8 электронов: 2 на внутреннем уровне, 6 валентных. 2 электрона образуют связи с водородом, а 4 остаются в виде 2 неподелённых пар. Отрицательные заряды расталкиваются в форме тетраэдра.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'sp³ Hybridization & Angle Compression to 104.5°', ru: 'sp³-Гибридизация и сжатие угла до 104.5°' },
        content: {
          en: 'One 2s and three 2p orbitals hybridize into four sp³ orbitals. In a perfect tetrahedron (like CH₄), the angle is 109.5°. But lone pairs have greater electron cloud spread, compressing the H-O-H angle to 104.5°.',
          ru: 'Одна 2s и три 2p орбитали гибридизуются в 4 sp³-орбитали. В идеальном тетраэдре (как в метане CH₄) угол равен 109.5°. Но неподелённые пары сильнее отталкивают связывающие орбитали, сжимая угол до 104.5°.'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Molecular orbital theory & Dipole moment vector', ru: 'Метод МО и постоянный дипольный момент' },
        content: {
          en: 'The asymmetric C2v point group symmetry and strong electronegativity difference (Δχ = 1.24) give water a net dipole moment of 1.85 Debye, responsible for hydrogen bonding and high boiling point.',
          ru: 'Точечная группа симметрии C2v и разница электроотрицательностей (Δχ = 1.24) создают суммарный дипольный момент 1.85 Дебая, что обеспечивает водородные связи и жидкое состояние воды.'
        },
        mathFormula: '\\vec{\\mu}_{net} = 2 \\vec{\\mu}_{O-H} \\cos(104.5^\\circ / 2) \\approx 1.85 \\text{ D}'
      }
    ]
  },
  {
    id: 'gravity-field',
    category: 'physics',
    title: { en: 'Gravity & Inverse-Square Law', ru: 'Гравитация и закон обратных квадратов' },
    subtitle: { en: 'Feel how doubling distance cuts pull by 4x', ru: 'Почувствуй, почему удвоение расстояния ослабляет силу в 4 раза' },
    iconName: 'Orbit',
    viewMode: 'physics_gravity',
    initialParams: { m1: 50, m2: 20, r: 10 },
    keywords: ['gravity', 'newton', 'orbit', 'mass', 'distance', 'гравитация', 'ньютон', 'орбита', 'масса'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'Gravitational rubber band', ru: 'Гравитационная резинка Вселенной' },
        content: {
          en: 'Every object with mass pulls on every other object. Pulling planets apart weakens the pull very fast — if you take two steps away, the pull drops by four steps of weakness!',
          ru: 'Любое тело с массой притягивает другие тела. Отодвинь планету в 2 раза дальше — и притяжение ослабнет не в 2, а сразу в 4 раза!'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Inverse square geometry in 3D space', ru: 'Геометрия сферы: почему именно квадрат расстояния?' },
        content: {
          en: 'Gravitational flux spreads out over the surface area of a sphere: A = 4πr². As distance r doubles, the sphere area quadruples (2² = 4), so force per unit area drops by 1/4.',
          ru: 'Гравитационное поле равномерно распространяется по поверхности сферы: S = 4πr². При удвоении радиуса r площадь сферы увеличивается в 4 раза (2² = 4), поэтому плотность силы падает в 4 раза.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Orbital velocity & Escape velocity', ru: 'Круговая и вторая космическая скорость' },
        content: {
          en: 'For circular orbit, gravitational force equals centripetal force: G·M·m/r² = m·v²/r. Therefore v_orbital = √(G·M/r). If velocity exceeds √(2)·v_orbital, the object escapes forever on a parabola.',
          ru: 'Для устойчивой орбиты сила тяготения равна центростремительной: G·M·m/r² = m·v²/r. Отсюда v_круговая = √(G·M/r). Если разогнать объект в √2 раз быстрее, он навсегда покинет систему.'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Newtonian Potential & General Relativity Curvature', ru: 'Ньютоновский потенциал и искривление пространства-времени' },
        content: {
          en: 'In classical field theory, gravity satisfies Poisson equation ∇²Φ = 4πGρ. In General Relativity, mass does not "pull": it curves spacetime according to Einstein tensor G_μν = (8πG/c⁴) T_μν.',
          ru: 'В теории поля гравитация описывается уравнением Пуассона ∇²Φ = 4πGρ. В ОТО массы не «притягивают»: они искривляют пространство-время согласно уравнению Эйнштейна G_μν = (8πG/c⁴) T_μν.'
        },
        mathFormula: 'F = G \\frac{m_1 m_2}{r^2}, \\quad \\nabla^2 \\Phi = 4\\pi G \\rho'
      }
    ]
  },
  {
    id: 'solid-of-revolution',
    category: 'mathematics',
    title: { en: '2D ↔ 3D Solid of Revolution', ru: '2D ↔ 3D Тела вращения (Интегралы)' },
    subtitle: { en: 'Watch a 2D line spin into a 3D solid disc-by-disc', ru: 'Смотри, как 2D линия раскручивается в 3D объем диск за диском' },
    iconName: 'Rotate3d',
    viewMode: 'math_revolution',
    initialParams: { curve: 'sqrt', angle: 360, slices: 24 },
    keywords: ['revolution', 'integral', 'calculus', 'volume', 'dx', 'интеграл', 'тело вращения', 'объем'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'Like spinning a coin or potter wheel', ru: 'Как вращение монеты или гончарный круг' },
        content: {
          en: 'Spin a flat triangular flag fast enough, and your eyes see a 3D cone! Spin a curve around an axis, and it traces out a solid sculpture.',
          ru: 'Если быстро крутить плоский треугольный флажок на палочке, глаза видят объемный конус! Вращение плоской кривой рождает 3D тело.'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Stacking thin circular coins (dx)', ru: 'Стопка тонких круглых монет толщиной dx' },
        content: {
          en: 'Any solid of revolution can be sliced into thousands of flat circular coins. Each coin has radius r = f(x) and tiny thickness dx. The volume of one coin is dV = π·[f(x)]²·dx.',
          ru: 'Любое тело вращения можно разрезать на тысячи круглых плоских монет. Каждая монетка имеет радиус r = f(x) и толщину dx. Объём одной монетки dV = π·[f(x)]²·dx.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Definite integral as infinite limit', ru: 'Определённый интеграл как предел суммы Римана' },
        content: {
          en: 'Adding up all coins from x=a to x=b gives the definite integral V = π ∫ₐᵇ [f(x)]² dx. By dragging the slices slider, you can watch discrete Riemann sum converge to the exact continuous volume.',
          ru: 'Сумма всех монет от x=a до x=b даёт определённый интеграл V = π ∫ₐᵇ [f(x)]² dx. Двигая ползунок числа сечений, ты видишь, как сумма Римана сходится к точному объёму.'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Pappus-Guldinus theorem & Cylindrical shells', ru: 'Теорема Паппа-Гюльдена и метод цилиндрических оболочек' },
        content: {
          en: 'Volume is also given by V = 2π d_c A, where A is cross-sectional area and d_c is the distance traveled by the centroid. For rotation around the y-axis, the shell method integrates V = 2π ∫ x f(x) dx.',
          ru: 'Объем также равен V = 2π d_c A (теорема Гюльдена), где d_c — путь центра тяжести фигуры. При вращении вокруг оси Y метод оболочек дает формулу V = 2π ∫ x f(x) dx.'
        },
        mathFormula: 'V = \\pi \\int_{a}^{b} [f(x)]^2 \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n \\pi [f(x_i)]^2 \\Delta x'
      }
    ]
  },
  {
    id: 'vector-divergence',
    category: 'mathematics',
    title: { en: 'Vector Field & Divergence', ru: 'Векторные поля и Дивергенция (∇·F)' },
    subtitle: { en: 'Source vs Sink: See fluid flow and field divergence', ru: 'Источники и стоки: наглядный поток и расходимость поля' },
    iconName: 'Compass',
    viewMode: 'math_divergence',
    initialParams: { fieldType: 'source', particleCount: 150 },
    keywords: ['vector', 'divergence', 'curl', 'flux', 'field', 'вектор', 'дивергенция', 'поток', 'источник'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'A garden hose vs a bathtub drain', ru: 'Садовый шланг против слива в ванне' },
        content: {
          en: 'Imagine arrows showing where water flows. If arrows spray outward from a spot, that spot is a faucet (positive divergence). If water gets sucked in, it is a drain (negative divergence)!',
          ru: 'Представь стрелочки, показывающие движение воды. Если стрелки разлетаются во все стороны из одной точки — там бьёт фонтан (положительная дивергенция). Если всасываются внутрь — там слив (отрицательная дивергенция)!'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Net outgoing flux per unit box', ru: 'Баланс втекающего и вытекающего потока' },
        content: {
          en: 'Draw a tiny box in the field. Count how many vectors enter through the left and bottom, versus exit through the top and right. If more exits than enters, something inside is producing flux.',
          ru: 'Нарисуй маленький воображаемый кубик. Сравни поток, входящий внутрь, и поток, выходящий наружу. Если выходит больше, чем вошло — внутри кубика находится источник поля.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Partial derivative sum: ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z', ru: 'Сумма частных производных: ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z' },
        content: {
          en: 'Divergence measures local rate of expansion. In Cartesian coordinates, div F = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z. For an incompressible fluid (like water), div v = 0 everywhere except at sources/sinks.',
          ru: 'Дивергенция измеряет скорость локального расширения: div F = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z. Для несжимаемой жидкости div v = 0 во всех точках, кроме мест подачи и откачки.'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Gauss-Ostrogradsky Divergence Theorem', ru: 'Теорема Остроградского-Гаусса' },
        content: {
          en: 'The total flux passing through closed boundary surface ∂V equals the volume integral of divergence inside: ∯_∂V F · dA = ∭_V (∇ · F) dV. This connects local behavior to global flux in Maxwell equations.',
          ru: 'Суммарный поток через замкнутую поверхность ∂V равен интегралу от дивергенции по объёму: ∯_∂V F · dA = ∭_V (∇ · F) dV. Это связывает локальные дифференциальные законы с глобальными потоками.'
        },
        mathFormula: '\\nabla \\cdot \\vec{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z} = \\lim_{V \\to 0} \\frac{1}{V} \\oiint_{\\partial V} \\vec{F} \\cdot d\\vec{A}'
      }
    ]
  },
  {
    id: 'mitochondria-deep-dive',
    category: 'biology',
    title: { en: 'Deep Dive: Cell to Mitochondria to ATP', ru: 'Погружение: Клетка → Митохондрия → АТФ' },
    subtitle: { en: 'Zoom through scales from cell to nano-turbine rotor', ru: 'Масштабируйся от клетки до нано-турбины синтеза АТФ' },
    iconName: 'Activity',
    viewMode: 'biology_cell',
    initialParams: { zoomLevel: 'mitochondria' },
    keywords: ['cell', 'mitochondria', 'atp', 'biology', 'proton', 'клетка', 'митохондрия', 'атф', 'турбина'],
    tiers: [
      {
        level: 1,
        badge: { en: 'Beginner', ru: 'Новичок' },
        title: { en: 'The powerhouse of the cell', ru: 'Электростанция клетки' },
        content: {
          en: 'Mitochondria are tiny power plants inside your cells that turn food into chemical battery packets called ATP. You have trillions of them generating energy right now!',
          ru: 'Митохондрии — это крошечные электростанции внутри твоих клеток. Они превращают пищу и кислород в универсальные энергетические батарейки — молекулы АТФ!'
        }
      },
      {
        level: 2,
        badge: { en: 'School', ru: 'Школа' },
        title: { en: 'Double membrane and folded Cristae', ru: 'Двойная мембрана и складчатые кристы' },
        content: {
          en: 'Unlike other organelles, mitochondria have two membranes: a smooth outer wall and a deeply folded inner membrane (cristae). The folds maximize surface area to fit millions of energy pumps.',
          ru: 'В отличие от большинства органелл, у митохондрии две мембраны: гладкая внешняя и сильно складчатая внутренняя (кристы). Складки многократно увеличивают площадь для размещения ферментов.'
        }
      },
      {
        level: 3,
        badge: { en: 'Advanced', ru: 'Профи' },
        title: { en: 'Proton gradient & ATP Synthase rotary turbine', ru: 'Протонный градиент и вращающаяся турбина АТФ-синтазы' },
        content: {
          en: 'The electron transport chain pumps H+ protons into the intermembrane space. This creates an electrochemical dam. Protons rush back through ATP Synthase, physically spinning its rotor at up to 9,000 RPM to make ATP!',
          ru: 'Дыхательная цепь накачивает протоны H+ в межмембранное пространство, создавая «электрохимическую плотину». Протоны устремляются обратно через ротор фермента АТФ-синтазы, физически раскручивая нано-турбину до 9000 об/мин!'
        }
      },
      {
        level: 4,
        badge: { en: 'University', ru: 'Университет' },
        title: { en: 'Mitchell Chemiosmotic Hypothesis & Proton motive force', ru: 'Хемиосмотическая теория Митчелла и протон-движущая сила' },
        content: {
          en: 'Proton motive force Δp = Δψ - (2.3 RT/F) ΔpH comprises both electrical membrane potential (~150 mV) and chemical pH gradient. Translocation of ~3-4 H+ through the c-ring drives 120° conformational rotation of the γ-subunit.',
          ru: 'Протон-движущая сила Δp = Δψ - (2.3 RT/F) ΔpH объединяет мембранный потенциал (~150 мВ) и градиент pH. Прохождение 3–4 протонов через c-кольцо поворачивает γ-субъединицу на 120°, синтезируя 1 молекулу АТФ.'
        },
        mathFormula: '\\Delta p = \\Delta \\psi - \\frac{2.303 R T}{F} \\Delta \\text{pH}'
      }
    ]
  }
];

export const PREDICTION_CHALLENGES: PredictionChallenge[] = [
  {
    id: 'pred-p-orbital',
    topic: 'chemistry',
    question: {
      en: 'How will the electron cloud shape change if orbital quantum number ℓ changes from 0 to 1?',
      ru: 'Как изменится форма электронного облака, если квантовое число ℓ станет равным 1 вместо 0?'
    },
    options: [
      {
        id: 'opt1',
        text: { en: 'It becomes a larger sphere with double diameter', ru: 'Станет большей сферой с удвоенным диаметром' },
        isCorrect: false,
        explanation: {
          en: 'Spherical symmetry only holds when ℓ = 0. Increasing n increases radius, but changing ℓ changes angular shape!',
          ru: 'Сферическая симметрия сохраняется только при ℓ = 0. Увеличение n увеличивает радиус, а вот изменение ℓ меняет саму геометрию формы!'
        }
      },
      {
        id: 'opt2',
        text: { en: 'It splits into 2 opposite dumbbell lobes with a nodal plane (zero probability at nucleus)', ru: 'Разделится на 2 противоположные гантелевидные доли с узловой плоскостью в ядре' },
        isCorrect: true,
        explanation: {
          en: 'Exactly! ℓ = 1 introduces one angular node (ψ = 0 plane), generating the classic directional p-orbital dumbbell lobes.',
          ru: 'Именно так! ℓ = 1 вводит одну угловую узловую плоскость (ψ = 0), превращая сферу в классическую объемную гантель с двумя лепестками.'
        }
      },
      {
        id: 'opt3',
        text: { en: 'It forms a ring/torus like Saturn around the nucleus', ru: 'Образует кольцо (тор), как кольца Сатурна вокруг планеты' },
        isCorrect: false,
        explanation: {
          en: 'Ring-like doughnut shapes appear in d-orbitals (like 3dz²) with ℓ = 2, not in p-orbitals!',
          ru: 'Кольца-бублики появляются у d-орбиталей (например, 3dz²) при ℓ = 2, а не у p-орбиталей!'
        }
      }
    ],
    revealedModelParams: { n: 2, l: 1, m: 0, orbitalType: '2pz' }
  },
  {
    id: 'pred-gravity-distance',
    topic: 'physics',
    question: {
      en: 'What happens to the gravitational attraction force if the distance between two planets is doubled (r → 2r)?',
      ru: 'Что произойдёт с силой гравитационного притяжения, если расстояние между планетами увеличить в 2 раза?'
    },
    options: [
      {
        id: 'opt1',
        text: { en: 'It decreases by 2 times (half as strong)', ru: 'Она уменьшится ровно в 2 раза' },
        isCorrect: false,
        explanation: {
          en: 'Gravity does not follow a linear 1/r law! It spreads across a 3D spherical wavefront.',
          ru: 'Гравитация не подчиняется линейному закону 1/r! Её поле распределяется по поверхности 3D сферы.'
        }
      },
      {
        id: 'opt2',
        text: { en: 'It decreases by 4 times (1/4th of initial force)', ru: 'Она уменьшится в 4 раза (станет 1/4 от начальной)' },
        isCorrect: true,
        explanation: {
          en: 'Correct! By Newton inverse-square law F ∝ 1/r², (2)² = 4 in the denominator, so force drops 4-fold!',
          ru: 'Верно! По закону всемирного тяготения F ∝ 1/r², в знаменателе стоит (2)² = 4, то есть сила падает ровно вчетверо!'
        }
      },
      {
        id: 'opt3',
        text: { en: 'It drops to zero immediately beyond planetary radius', ru: 'Она сразу станет нулевой за пределами атмосферы' },
        isCorrect: false,
        explanation: {
          en: 'Gravity has infinite range; it decays smoothly with 1/r² but never abruptly hits zero.',
          ru: 'Гравитация имеет бесконечный радиус действия: она плавно затухает как 1/r², но нигде не обрывается до нуля.'
        }
      }
    ],
    revealedModelParams: { m1: 50, m2: 20, r: 20 }
  },
  {
    id: 'pred-water-angle',
    topic: 'chemistry',
    question: {
      en: 'Why is a water molecule (H₂O) bent at 104.5° instead of being completely linear at 180° like CO₂?',
      ru: 'Почему молекула воды H₂O изогнута под углом 104.5°, а не вытянута в прямую линию 180°, как CO₂?'
    },
    options: [
      {
        id: 'opt1',
        text: { en: 'Hydrogen atoms are positively charged and pull each other together', ru: 'Атомы водорода положительно заряжены и притягиваются друг к другу' },
        isCorrect: false,
        explanation: {
          en: 'Both hydrogen atoms carry partial positive charges (δ+), so they actually repel each other, not attract!',
          ru: 'Оба атома водорода имеют частичный положительный заряд (δ+), поэтому они отталкиваются, а не притягиваются!'
        }
      },
      {
        id: 'opt2',
        text: { en: 'Two non-bonding electron lone pairs on oxygen occupy space and push O-H bonds away', ru: 'Две неподелённые электронные пары кислорода расталкивают связи O–H' },
        isCorrect: true,
        explanation: {
          en: 'Spot on! Oxygen has 4 electron pairs in sp³ arrangement. The two lone pairs repel strongly, bending the bonds from 109.5° down to 104.5°.',
          ru: 'В яблочко! Кислород окружён 4 парами электронов в sp³-конфигурации. 2 неподелённые пары сильно отталкивают связи, сгибая угол со 109.5° до 104.5°.'
        }
      },
      {
        id: 'opt3',
        text: { en: 'Earth gravity pulls the heavier oxygen upward', ru: 'Гравитация Земли тянет более тяжелый кислород вверх' },
        isCorrect: false,
        explanation: {
          en: 'Gravitational forces on atomic scales are 10³⁶ times weaker than electromagnetic orbital repulsion!',
          ru: 'Гравитационные силы на масштабе молекул в 10³⁶ раз слабее электромагнитного отталкивания орбиталей!'
        }
      }
    ],
    revealedModelParams: { molecule: 'H2O' }
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'first_orbital',
    title: { en: 'Atomic Architect', ru: 'Атомный Архитектор' },
    description: { en: 'Explored your first 3D orbital cloud and rotated it in space', ru: 'Исследовал первое 3D-облако орбитали и покрутил его в пространстве' },
    icon: 'Atom',
    unlocked: true
  },
  {
    id: 'discovered_node',
    title: { en: 'Node Hunter', ru: 'Охотник за узлами' },
    description: { en: 'Discovered a radial or angular nodal surface where probability is zero', ru: 'Обнаружил радиальную или угловую узловую поверхность, где вероятность равна 0' },
    icon: 'Layers',
    unlocked: false
  },
  {
    id: 'predicted_correctly',
    title: { en: 'Mental Model Master', ru: 'Мастер Пространственной Интуиции' },
    description: { en: 'Correctly predicted the shape or physical outcome before simulation', ru: 'Верно предсказал форму или физический результат до запуска симуляции' },
    icon: 'Brain',
    unlocked: false
  },
  {
    id: 'deconstructed_water',
    title: { en: 'Molecular Anatomist', ru: 'Молекулярный Анатомист' },
    description: { en: 'Deconstructed H₂O down to electron orbitals and lone-pair repulsion', ru: 'Разобрал H₂O до атомных орбиталей и отталкивания неподелённых пар' },
    icon: 'Share2',
    unlocked: false
  },
  {
    id: 'broke_the_model',
    title: { en: 'Chaos Scientist', ru: 'Разрушитель Моделей' },
    description: { en: 'Intentionally pushed physical parameters into the instability zone', ru: 'Намеренно вывел физическую систему в зону нестабильности' },
    icon: 'Flame',
    unlocked: false
  },
  {
    id: 'dimension_walker',
    title: { en: 'Dimension Walker (2D → 3D)', ru: 'Межпространственный путник (2D → 3D)' },
    description: { en: 'Generated a 3D solid of revolution from an integration curve', ru: 'Построил 3D тело вращения из кривой интеграла' },
    icon: 'Rotate3d',
    unlocked: false
  }
];

export const KNOWLEDGE_GRAPH_NODES = [
  { id: 'quantum_n', label: { en: 'Quantum Numbers (n, ℓ, m)', ru: 'Квантовые числа' }, category: 'physics', x: 100, y: 120 },
  { id: 'orbitals', label: { en: 'Atomic Orbitals (s, p, d)', ru: 'Атомные орбитали' }, category: 'chemistry', x: 260, y: 120 },
  { id: 'nodes', label: { en: 'Nodal Surfaces (ψ=0)', ru: 'Узловые поверхности' }, category: 'physics', x: 260, y: 240 },
  { id: 'hybridization', label: { en: 'sp³ Hybridization', ru: 'Гибридизация орбиталей' }, category: 'chemistry', x: 440, y: 120 },
  { id: 'bonds', label: { en: 'Chemical Bonds (σ & π)', ru: 'Химические связи' }, category: 'chemistry', x: 620, y: 120 },
  { id: 'molecules', label: { en: 'Water Molecule (H₂O)', ru: 'Молекула воды' }, category: 'chemistry', x: 780, y: 120 },
  { id: 'dipole', label: { en: 'Dipole & Hydrogen Bonds', ru: 'Водородные связи' }, category: 'chemistry', x: 780, y: 250 },
  { id: 'cell', label: { en: 'Cell Cytoplasm & Membrane', ru: 'Клетка и цитоплазма' }, category: 'biology', x: 600, y: 350 },
  { id: 'mitochondria', label: { en: 'Mitochondria & Cristae', ru: 'Митохондрия и кристы' }, category: 'biology', x: 420, y: 350 },
  { id: 'atp', label: { en: 'ATP Synthase Rotor', ru: 'Ротор АТФ-синтазы' }, category: 'biology', x: 240, y: 350 },
  { id: 'vectors', label: { en: 'Vector Fields & Flux', ru: 'Векторные поля и поток' }, category: 'mathematics', x: 100, y: 250 }
];

export const KNOWLEDGE_GRAPH_LINKS = [
  { source: 'quantum_n', target: 'orbitals' },
  { source: 'orbitals', target: 'nodes' },
  { source: 'orbitals', target: 'hybridization' },
  { source: 'hybridization', target: 'bonds' },
  { source: 'bonds', target: 'molecules' },
  { source: 'molecules', target: 'dipole' },
  { source: 'dipole', target: 'cell' },
  { source: 'cell', target: 'mitochondria' },
  { source: 'mitochondria', target: 'atp' },
  { source: 'quantum_n', target: 'vectors' }
];
