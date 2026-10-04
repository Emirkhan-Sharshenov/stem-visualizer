import { section } from './types';

const P = 'physics';

export const PHYSICS_10 = [
  section(P, 10, 'kinematics', ['Кинематика', 'Kinematics'], [
    {
      id: 'p10-kin-basics',
      title: ['Основные понятия. Векторы', 'Basics. Vectors'],
      intro: [
        'Положение, перемещение, скорость и ускорение — векторы. С ними действуют по правилам геометрии, а не простой арифметики.',
        'Position, displacement, velocity and acceleration are vectors, combined by geometry rather than plain arithmetic.',
      ],
      points: [
        ['Системы отсчёта', 'Frames of reference', 'Тело отсчёта, оси и часы. Движение описывается по-разному в разных системах.', 'A reference body, axes and a clock. Motion looks different in different frames.'],
        ['Сложение векторов', 'Adding vectors', 'По правилу треугольника или параллелограмма. 3 км на восток + 4 км на север = 5 км по диагонали.', 'By the triangle or parallelogram rule: 3 km east + 4 km north = 5 km diagonally.'],
        ['Проекции', 'Projections', 'Вектор раскладывают на проекции по осям и складывают их отдельно.', 'Split vectors into axis projections and add those separately.'],
      ],
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p10-uniform',
      title: ['Равномерное движение. Сложение скоростей', 'Uniform motion. Adding velocities'],
      intro: [
        'При равномерном движении координата линейно зависит от времени. Скорость тела в разных системах отсчёта разная.',
        'In uniform motion the coordinate is linear in time. A body’s velocity differs between frames.',
      ],
      points: [
        ['Уравнение и графики', 'Equation and graphs', 'x = x₀ + vt; график x(t) — прямая, наклон — скорость.', 'x = x₀ + vt; x(t) is a line whose slope is the velocity.'],
        ['Относительность движения', 'Relativity of motion', 'v = v_отн + v_пер: лодка, плывущая поперёк реки, сносится течением.', 'v = v_rel + v_frame: a boat crossing a river drifts downstream.'],
      ],
      formula: '\\vec v = \\vec v_{отн} + \\vec v_{пер}',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p10-accelerated',
      title: ['Равноускоренное движение', 'Uniformly accelerated motion'],
      intro: [
        'Мгновенная скорость меняется равномерно. По графику скорости можно найти ускорение (наклон) и путь (площадь).',
        'Instantaneous velocity changes steadily. A velocity graph gives acceleration (slope) and distance (area).',
      ],
      points: [
        ['Мгновенная скорость', 'Instantaneous velocity', 'Скорость в данный момент — её показывает спидометр.', 'The velocity at a given instant, as a speedometer shows.'],
        ['Уравнения движения', 'Equations of motion', 'x = x₀ + v₀t + at²/2, v = v₀ + at.', 'x = x₀ + v₀t + at²/2, v = v₀ + at.'],
        ['Задачи по графикам', 'Problems from graphs', 'Площадь под v(t) — перемещение, наклон — ускорение.', 'The area under v(t) is displacement; its slope is acceleration.'],
      ],
      formula: 'x = x_0 + v_0 t + \\frac{a t^2}{2}',
      sim: { moment: 'moment_derivative' },
    },
    {
      id: 'p10-projectile',
      title: ['Свободное падение. Движение под углом', 'Free fall. Projectiles'],
      intro: [
        'Брошенное тело одновременно движется равномерно по горизонтали и равноускоренно по вертикали. Траектория — парабола.',
        'A thrown body moves uniformly sideways and with constant acceleration vertically. Its path is a parabola.',
      ],
      points: [
        ['Бросок горизонтально', 'Horizontal throw', 'x = v₀t, y = h − gt²/2. Время полёта зависит только от высоты.', 'x = v₀t, y = h − gt²/2. Flight time depends only on height.'],
        ['Бросок под углом', 'Angled throw', 'Дальность L = v₀² sin2α/g — максимальна при 45°. Высота H = v₀² sin²α/2g.', 'Range L = v₀² sin2α/g is greatest at 45°. Height H = v₀² sin²α/2g.'],
      ],
      formula: 'L = \\frac{v_0^2 \\sin 2\\alpha}{g}',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p10-circular',
      title: ['Движение по окружности', 'Circular motion'],
      intro: [
        'Точки вращающегося колеса проходят разный путь, но поворачиваются на один угол. Поэтому вводят угловую скорость.',
        'Points on a spinning wheel travel different distances but turn through the same angle, so we use angular velocity.',
      ],
      points: [
        ['Угловая и линейная скорость', 'Angular and linear speed', 'ω = φ/t, v = ωr: край колеса движется быстрее оси.', 'ω = φ/t, v = ωr: the rim moves faster than near the axle.'],
        ['Центростремительное ускорение', 'Centripetal acceleration', 'a = v²/r = ω²r.', 'a = v²/r = ω²r.'],
        ['Период и частота', 'Period and frequency', 'T = 2π/ω, ν = 1/T.', 'T = 2π/ω, ν = 1/T.'],
      ],
      formula: 'a = \\omega^2 r = \\frac{v^2}{r}',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'p10-rigid',
      title: ['Кинематика твёрдого тела', 'Rigid-body kinematics'],
      intro: [
        'Твёрдое тело может двигаться поступательно или вращаться. Любое сложное движение — их комбинация.',
        'A rigid body can translate or rotate. Any complex motion combines the two.',
      ],
      points: [
        ['Поступательное движение', 'Translation', 'Все точки движутся одинаково: кабина колеса обозрения остаётся вертикальной.', 'All points move identically: a Ferris wheel cabin stays upright.'],
        ['Вращательное движение', 'Rotation', 'Точки описывают окружности вокруг оси: колесо, лопасти вентилятора.', 'Points trace circles round an axis: a wheel, fan blades.'],
      ],
    },
  ]),

  section(P, 10, 'dynamics', ['Динамика', 'Dynamics'], [
    {
      id: 'p10-newton',
      title: ['Законы Ньютона. Принцип относительности Галилея', 'Newton’s laws. Galilean relativity'],
      intro: [
        'Во всех инерциальных системах отсчёта механические явления протекают одинаково. В каюте плывущего корабля нельзя понять, движется ли он.',
        'Mechanics works the same in every inertial frame. Inside a smoothly sailing ship’s cabin you can’t tell it’s moving.',
      ],
      points: [
        ['Принцип относительности', 'Relativity principle', 'Никаким опытом внутри системы нельзя определить, покоится она или движется равномерно.', 'No experiment inside a frame can tell rest from uniform motion.'],
        ['F = ma', 'F = ma', 'Равнодействующая всех сил определяет ускорение.', 'The net force sets the acceleration.'],
        ['Третий закон', 'Third law', 'Силы действия и противодействия приложены к разным телам и поэтому не компенсируют друг друга.', 'Action and reaction act on different bodies, so they don’t cancel.'],
      ],
      formula: '\\vec F = m\\vec a',
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p10-gravity-weight',
      title: ['Тяготение. Вес, перегрузки, невесомость', 'Gravity. Weight, g-forces, weightlessness'],
      intro: [
        'Вес зависит от ускорения опоры. В разгоняющемся вверх лифте ты тяжелее, в свободном падении — невесом.',
        'Weight depends on the support’s acceleration. You’re heavier in a lift accelerating up and weightless in free fall.',
      ],
      points: [
        ['Вес с ускорением', 'Weight under acceleration', 'P = m(g + a) при ускорении вверх, P = m(g − a) — вниз.', 'P = m(g + a) accelerating up, P = m(g − a) accelerating down.'],
        ['Перегрузки', 'g-forces', 'Отношение веса к mg. Лётчики выдерживают до 9g.', 'Weight divided by mg. Pilots withstand up to 9g.'],
        ['Космические скорости', 'Cosmic velocities', 'Первая 7,9 км/с — орбита, вторая 11,2 км/с — уйти от Земли навсегда.', 'First 7.9 km/s for orbit; second 11.2 km/s to escape Earth.'],
      ],
      formula: 'v_2 = \\sqrt{2 g R} \\approx 11{,}2\\ \\text{км/с}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p10-elastic',
      title: ['Сила упругости. Жёсткость', 'Elastic force. Stiffness'],
      intro: [
        'При малых деформациях сила упругости пропорциональна удлинению. Коэффициент — жёсткость — зависит от материала и формы.',
        'For small deformations the elastic force is proportional to the stretch; the stiffness depends on material and shape.',
      ],
      points: [
        ['Закон Гука', 'Hooke’s law', 'Fупр = kx. Для двух пружин последовательно жёсткость меньше, параллельно — больше.', 'F = kx. Two springs in series are softer; in parallel, stiffer.'],
      ],
      formula: 'F_{упр} = k x',
      sim: { engine: 'hooke_spring' },
    },
    {
      id: 'p10-friction',
      title: ['Сила трения. Коэффициент трения', 'Friction. The friction coefficient'],
      intro: [
        'Сила трения скольжения пропорциональна силе нормального давления и почти не зависит от площади.',
        'Sliding friction is proportional to the normal force and nearly independent of contact area.',
      ],
      points: [
        ['Коэффициент трения', 'Coefficient', 'Fтр = μN. Резина по асфальту μ ≈ 0,7, лёд по льду μ ≈ 0,03.', 'F = μN. Rubber on asphalt μ ≈ 0.7; ice on ice μ ≈ 0.03.'],
      ],
      formula: 'F_{тр} = \\mu N',
      sim: { engine: 'friction_dynamometer' },
    },
    {
      id: 'p10-applications',
      title: ['Применение законов Ньютона', 'Applying Newton’s laws'],
      intro: [
        'Любая задача динамики решается одинаково: рисуем силы, выбираем оси, записываем второй закон в проекциях.',
        'Every dynamics problem follows one recipe: draw the forces, choose axes, write the second law in components.',
      ],
      points: [
        ['Наклонная плоскость', 'Inclined plane', 'Силу тяжести раскладывают на mg sin α вдоль склона и mg cos α поперёк.', 'Split gravity into mg sin α along the slope and mg cos α across it.'],
        ['Связанные тела и блоки', 'Connected bodies and pulleys', 'Нить связывает ускорения тел: они одинаковы по модулю.', 'A string links the bodies’ accelerations: they’re equal in size.'],
        ['Движение по окружности', 'Circular motion', 'На повороте центростремительное ускорение даёт трение; на выпуклом мосту вес уменьшается.', 'On a bend friction provides centripetal acceleration; on a humpback bridge weight decreases.'],
      ],
      formula: 'm a = mg\\sin\\alpha - \\mu mg\\cos\\alpha',
      sim: { engine: 'friction_dynamometer' },
    },
  ]),

  section(P, 10, 'conservation', ['Законы сохранения в механике', 'Conservation laws'], [
    {
      id: 'p10-momentum',
      title: ['Импульс. Импульс силы', 'Momentum. Impulse'],
      intro: [
        'Изменение импульса тела равно импульсу силы. Поэтому мягкое приземление спасает: удар растягивается во времени, и сила меньше.',
        'A body’s change in momentum equals the impulse. A soft landing helps because the blow lasts longer, so the force is smaller.',
      ],
      points: [
        ['Импульс силы', 'Impulse', 'FΔt = Δp. Подушка безопасности увеличивает Δt.', 'FΔt = Δp. An airbag increases Δt.'],
        ['Закон сохранения импульса', 'Conservation', 'В замкнутой системе Σp = const.', 'In a closed system Σp = const.'],
        ['Реактивное движение', 'Jet propulsion', 'Скорость ракеты растёт, пока она выбрасывает газ.', 'A rocket speeds up as long as it ejects gas.'],
      ],
      formula: '\\vec F \\Delta t = \\Delta \\vec p',
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p10-work-power',
      title: ['Работа и мощность', 'Work and power'],
      intro: [
        'Работа силы зависит от угла между силой и перемещением. Работа силы тяжести не зависит от формы пути.',
        'A force’s work depends on the angle to the displacement. Gravity’s work doesn’t depend on the path.',
      ],
      points: [
        ['Работа силы', 'Work', 'A = Fs cos α.', 'A = Fs cos α.'],
        ['Работа силы тяжести, упругости, трения', 'Gravity, spring, friction', 'A_тяж = mg(h₁ − h₂), A_упр = k(x₁² − x₂²)/2, работа трения всегда отрицательна.', 'A_g = mg(h₁ − h₂), A_spring = k(x₁² − x₂²)/2, friction work is always negative.'],
        ['Мощность', 'Power', 'N = A/t = Fv.', 'N = A/t = Fv.'],
      ],
      formula: 'A = F s \\cos\\alpha',
    },
    {
      id: 'p10-energy',
      title: ['Энергия. Закон сохранения', 'Energy and its conservation'],
      intro: [
        'Работа равнодействующей меняет кинетическую энергию. Если действуют только сила тяжести и упругость, механическая энергия сохраняется.',
        'Net work changes kinetic energy. With only gravity and springs acting, mechanical energy is conserved.',
      ],
      points: [
        ['Теорема о кинетической энергии', 'Work–energy theorem', 'A = Eₖ₂ − Eₖ₁.', 'A = E_k2 − E_k1.'],
        ['Потенциальная энергия', 'Potential energy', 'Над Землёй Eₚ = mgh, у пружины Eₚ = kx²/2.', 'Above Earth E_p = mgh; for a spring E_p = kx²/2.'],
        ['Трение и энергия', 'Friction and energy', 'Трение уменьшает механическую энергию: она переходит во внутреннюю.', 'Friction lowers mechanical energy, turning it into internal energy.'],
      ],
      formula: 'E_k + E_p = \\text{const}',
      sim: { moment: 'moment_pendulum' },
    },
    {
      id: 'p10-collisions',
      title: ['Соударения', 'Collisions'],
      intro: [
        'В любом ударе сохраняется импульс. Кинетическая энергия сохраняется только в абсолютно упругом ударе.',
        'Momentum is conserved in every collision; kinetic energy only in a perfectly elastic one.',
      ],
      points: [
        ['Абсолютно упругий', 'Perfectly elastic', 'Бильярдные шары: одинаковые массы при лобовом ударе обмениваются скоростями.', 'Billiard balls of equal mass swap velocities in a head-on hit.'],
        ['Абсолютно неупругий', 'Perfectly inelastic', 'Тела слипаются и движутся вместе, часть энергии уходит в тепло и деформацию.', 'Bodies stick together; some energy turns into heat and deformation.'],
      ],
      sim: { moment: 'moment_collision' },
    },
  ]),

  section(P, 10, 'statics', ['Статика', 'Statics'], [
    {
      id: 'p10-equilibrium',
      title: ['Равновесие тел. Момент силы', 'Equilibrium. Moments'],
      intro: [
        'Тело в равновесии, если не начинает ни двигаться, ни вращаться. Для этого нужны два условия.',
        'A body is in equilibrium if it neither moves nor turns. That takes two conditions.',
      ],
      points: [
        ['Первое условие', 'First condition', 'ΣF = 0 — сумма сил равна нулю.', 'ΣF = 0: the forces sum to zero.'],
        ['Второе условие', 'Second condition', 'ΣM = 0 — сумма моментов относительно любой оси равна нулю.', 'ΣM = 0: moments about any axis sum to zero.'],
        ['Центр тяжести и виды равновесия', 'Centre of gravity and stability', 'Устойчивое, неустойчивое, безразличное. Чем ниже центр тяжести и шире опора, тем устойчивее.', 'Stable, unstable, neutral. A low centre of gravity and a wide base mean stability.'],
      ],
      formula: '\\sum \\vec F = 0, \\quad \\sum M = 0',
      sim: { moment: 'moment_lever' },
    },
    {
      id: 'p10-hydrostatics',
      title: ['Гидростатика', 'Hydrostatics'],
      intro: [
        'Давление в жидкости, закон Паскаля и закон Архимеда — продолжение статики для жидкостей и газов.',
        'Pressure in fluids, Pascal’s law and Archimedes’ principle extend statics to liquids and gases.',
      ],
      points: [
        ['Давление жидкости', 'Fluid pressure', 'p = p₀ + ρgh.', 'p = p₀ + ρgh.'],
        ['Закон Паскаля', 'Pascal’s law', 'Давление передаётся во все стороны одинаково.', 'Pressure is transmitted equally in all directions.'],
        ['Закон Архимеда', 'Archimedes’ principle', 'Fₐ = ρж gV.', 'F_b = ρ_liq gV.'],
      ],
      formula: 'F_A = \\rho_{ж} g V',
      sim: { engine: 'archimedes_buoyancy' },
    },
  ]),

  section(P, 10, 'mkt', ['Молекулярная физика', 'Molecular physics'], [
    {
      id: 'p10-mkt-basics',
      title: ['Основы МКТ', 'Kinetic theory basics'],
      intro: [
        'Три положения: вещество состоит из частиц, частицы хаотично движутся, частицы взаимодействуют. Всё это подтверждено опытом.',
        'Three ideas: matter is made of particles, the particles move randomly, and they interact. All are confirmed by experiment.',
      ],
      points: [
        ['Опытные доказательства', 'Evidence', 'Диффузия, броуновское движение, сжимаемость газов, слипание свинцовых цилиндров.', 'Diffusion, Brownian motion, gas compressibility, lead cylinders sticking.'],
        ['Масса и размер молекул', 'Mass and size', 'Молекула воды ~3·10⁻²⁶ кг и ~3·10⁻¹⁰ м.', 'A water molecule is ~3·10⁻²⁶ kg and ~3·10⁻¹⁰ m.'],
        ['Количество вещества', 'Amount of substance', 'ν = N/Nₐ = m/M. Nₐ = 6·10²³ моль⁻¹.', 'ν = N/N_A = m/M with N_A = 6·10²³ mol⁻¹.'],
        ['Силы взаимодействия', 'Intermolecular forces', 'На малых расстояниях — отталкивание, на больших — притяжение.', 'Repulsion at short range, attraction a little further out.'],
      ],
      formula: '\\nu = \\frac{m}{M} = \\frac{N}{N_A}',
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'p10-ideal-gas',
      title: ['Идеальный газ. Основное уравнение МКТ', 'Ideal gas. The kinetic equation'],
      intro: [
        'Идеальный газ — модель, где молекулы — точки, которые взаимодействуют только при ударах. Давление создают удары о стенки.',
        'An ideal gas is a model of point molecules that interact only by colliding. Their impacts on the walls make pressure.',
      ],
      points: [
        ['Модель', 'The model', 'Хорошо описывает разреженные газы при обычных условиях.', 'Describes thin gases at ordinary conditions well.'],
        ['Основное уравнение', 'The equation', 'p = ⅓m₀nv² — давление растёт с концентрацией и квадратом скорости.', 'p = ⅓m₀nv²: pressure grows with concentration and the square of speed.'],
      ],
      formula: 'p = \\frac{1}{3} m_0 n \\overline{v^2}',
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'p10-temperature',
      title: ['Температура. Шкала Кельвина', 'Temperature. The Kelvin scale'],
      intro: [
        'Температура — мера средней кинетической энергии молекул. При абсолютном нуле (−273 °C) движение молекул прекратилось бы.',
        'Temperature measures the average kinetic energy of molecules. At absolute zero (−273 °C) molecular motion would stop.',
      ],
      points: [
        ['Тепловое равновесие', 'Thermal equilibrium', 'Тела в контакте выравнивают температуру.', 'Bodies in contact even out their temperatures.'],
        ['Абсолютная температура', 'Absolute temperature', 'T = t + 273. Отрицательных кельвинов не бывает.', 'T = t + 273. There are no negative kelvins.'],
        ['Энергия молекул', 'Molecular energy', 'E = (3/2)kT, k = 1,38·10⁻²³ Дж/К — постоянная Больцмана.', 'E = (3/2)kT, with Boltzmann’s constant k = 1.38·10⁻²³ J/K.'],
        ['Опыт Штерна', 'Stern’s experiment', 'Измерил скорости атомов серебра — около 600 м/с, как и предсказывала теория.', 'Measured silver atoms at about 600 m/s, as theory predicted.'],
      ],
      formula: '\\overline{E} = \\frac{3}{2} k T',
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'p10-clapeyron',
      title: ['Уравнение состояния идеального газа', 'The ideal gas law'],
      intro: [
        'Давление, объём и температура газа связаны одним уравнением. Зная два параметра, можно найти третий.',
        'A gas’s pressure, volume and temperature are tied by one equation; knowing two gives the third.',
      ],
      points: [
        ['Менделеев–Клапейрон', 'Mendeleev–Clapeyron', 'pV = νRT, R = 8,31 Дж/(моль·К).', 'pV = νRT with R = 8.31 J/(mol·K).'],
        ['Уравнение Клапейрона', 'Clapeyron’s equation', 'pV/T = const для данной массы газа.', 'pV/T = const for a fixed amount of gas.'],
      ],
      formula: 'pV = \\nu R T',
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'p10-gas-laws',
      title: ['Газовые законы. Изопроцессы', 'Gas laws. Isoprocesses'],
      intro: [
        'Если один из параметров держать постоянным, связь двух других становится очень простой.',
        'Hold one variable fixed and the other two are related very simply.',
      ],
      points: [
        ['Изотермический (Бойль–Мариотт)', 'Isothermal (Boyle)', 'T = const: pV = const. Сжал вдвое — давление вдвое выше.', 'T fixed: pV = const. Halve the volume, double the pressure.'],
        ['Изобарный (Гей-Люссак)', 'Isobaric (Charles)', 'p = const: V/T = const. Нагретый газ расширяется.', 'p fixed: V/T = const. Heated gas expands.'],
        ['Изохорный (Шарль)', 'Isochoric (Gay-Lussac)', 'V = const: p/T = const. Баллон на солнце может взорваться.', 'V fixed: p/T = const. A canister in the sun can burst.'],
        ['Графики', 'Graphs', 'Изотерма в осях p–V — гипербола, изобара и изохора — прямые.', 'An isotherm on p–V is a hyperbola; isobars and isochores are straight lines.'],
      ],
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'p10-vapour',
      title: ['Насыщенный пар. Кипение. Влажность', 'Saturated vapour. Boiling. Humidity'],
      intro: [
        'Давление насыщенного пара не зависит от объёма, но быстро растёт с температурой. Когда оно сравняется с внешним, жидкость закипит.',
        'Saturated vapour pressure doesn’t depend on volume but climbs fast with temperature. When it matches outside pressure, the liquid boils.',
      ],
      points: [
        ['Насыщенный пар', 'Saturated vapour', 'Динамическое равновесие: сколько молекул вылетает из жидкости, столько возвращается.', 'Dynamic balance: as many molecules return to the liquid as leave it.'],
        ['Кипение', 'Boiling', 'Начинается, когда давление насыщенного пара в пузырьках равно внешнему.', 'Starts when vapour pressure in the bubbles equals the outside pressure.'],
        ['Влажность', 'Humidity', 'φ = p/pнас · 100%.', 'φ = p/p_sat · 100%.'],
      ],
      formula: '\\varphi = \\frac{p}{p_{нас}} \\cdot 100\\%',
      sim: { moment: 'moment_states' },
    },
    {
      id: 'p10-liquids-solids',
      title: ['Жидкости и твёрдые тела', 'Liquids and solids'],
      intro: [
        'Молекулы на поверхности жидкости тянутся внутрь — поверхность ведёт себя как натянутая плёнка. Твёрдые тела сопротивляются деформации.',
        'Molecules at a liquid’s surface are pulled inward, so the surface acts like a stretched film. Solids resist deformation.',
      ],
      points: [
        ['Поверхностное натяжение', 'Surface tension', 'Водомерка бегает по воде, капли стремятся стать шариками.', 'Pond skaters walk on water; drops pull into spheres.'],
        ['Смачивание и капиллярность', 'Wetting and capillarity', 'Высота подъёма в капилляре h = 2σ/(ρgr).', 'Capillary rise h = 2σ/(ρgr).'],
        ['Кристаллические и аморфные тела', 'Crystalline and amorphous', 'У кристаллов — порядок и точка плавления; стекло и смола размягчаются постепенно.', 'Crystals are ordered with a melting point; glass and resin soften gradually.'],
        ['Механическое напряжение и модуль Юнга', 'Stress and Young’s modulus', 'σ = F/S = Eε. Сталь в 200 раз жёстче резины.', 'σ = F/S = Eε. Steel is 200 times stiffer than rubber.'],
      ],
      formula: '\\sigma = E \\varepsilon',
    },
  ]),

  section(P, 10, 'thermo', ['Термодинамика', 'Thermodynamics'], [
    {
      id: 'p10-internal-energy',
      title: ['Внутренняя энергия идеального газа', 'Internal energy of a gas'],
      intro: [
        'Внутренняя энергия идеального газа — только кинетическая энергия молекул. Она зависит лишь от температуры.',
        'An ideal gas’s internal energy is just molecular kinetic energy, depending only on temperature.',
      ],
      points: [
        ['Формула', 'Formula', 'U = (3/2)νRT для одноатомного газа.', 'U = (3/2)νRT for a monatomic gas.'],
      ],
      formula: 'U = \\frac{3}{2} \\nu R T',
      sim: { engine: 'thermodynamics_first_law' },
    },
    {
      id: 'p10-gas-work',
      title: ['Работа газа. Количество теплоты', 'Work done by gas. Heat'],
      intro: [
        'Расширяясь, газ совершает работу. На графике p–V она равна площади под кривой процесса.',
        'An expanding gas does work, equal to the area under the process curve on a p–V graph.',
      ],
      points: [
        ['Работа газа', 'Work', 'A = pΔV при постоянном давлении.', 'A = pΔV at constant pressure.'],
        ['Теплоёмкость', 'Heat capacity', 'Q = cmΔt; при фазовых переходах Q = λm или Q = Lm.', 'Q = cmΔt; at phase changes Q = λm or Q = Lm.'],
        ['Тепловой баланс', 'Heat balance', 'Сумма всех теплот в изолированной системе равна нулю.', 'All heats in an isolated system sum to zero.'],
      ],
      formula: 'A = p \\Delta V',
      sim: { engine: 'thermodynamics_first_law' },
    },
    {
      id: 'p10-first-law',
      title: ['Первый закон термодинамики', 'The first law of thermodynamics'],
      intro: [
        'Теплота, переданная газу, идёт на изменение его внутренней энергии и на работу. Это закон сохранения энергии для тепловых процессов.',
        'Heat given to a gas goes into its internal energy and into work. It’s energy conservation for heat processes.',
      ],
      points: [
        ['Формула', 'Formula', 'Q = ΔU + A.', 'Q = ΔU + A.'],
        ['Изопроцессы', 'Isoprocesses', 'Изохорный: A = 0, вся теплота — в ΔU. Изотермический: ΔU = 0, вся теплота — в работу.', 'Isochoric: A = 0, so all heat goes to ΔU. Isothermal: ΔU = 0, so all heat becomes work.'],
        ['Адиабатный процесс', 'Adiabatic process', 'Без теплообмена: Q = 0. Быстро сжатый воздух нагревается (дизель).', 'No heat exchange: Q = 0. Quickly squeezed air heats up, as in a diesel.'],
      ],
      formula: 'Q = \\Delta U + A',
      sim: { engine: 'thermodynamics_first_law' },
    },
    {
      id: 'p10-second-law',
      title: ['Второй закон термодинамики', 'The second law'],
      intro: [
        'Тепло само по себе переходит только от горячего к холодному. Процессы в природе необратимы: разбитая чашка сама не соберётся.',
        'Heat flows by itself only from hot to cold. Natural processes are irreversible: a broken cup won’t reassemble.',
      ],
      points: [
        ['Необратимость', 'Irreversibility', 'Кофе остывает, но никогда сам не нагревается от воздуха комнаты.', 'Coffee cools but never warms itself from room air.'],
      ],
    },
    {
      id: 'p10-heat-engines',
      title: ['Тепловые двигатели. Цикл Карно', 'Heat engines. The Carnot cycle'],
      intro: [
        'Любой тепловой двигатель берёт тепло у нагревателя, часть превращает в работу, а остальное отдаёт холодильнику.',
        'Every heat engine takes heat from a hot source, turns part into work and dumps the rest into a cold sink.',
      ],
      points: [
        ['Принцип действия', 'How it works', 'Нагреватель, рабочее тело (газ, пар), холодильник (атмосфера).', 'A heater, a working body (gas, steam) and a cooler (the atmosphere).'],
        ['КПД', 'Efficiency', 'η = (Q₁ − Q₂)/Q₁.', 'η = (Q₁ − Q₂)/Q₁.'],
        ['Цикл Карно', 'Carnot cycle', 'Максимально возможный КПД: η = (T₁ − T₂)/T₁. Больше не может быть никогда.', 'The highest possible efficiency: η = (T₁ − T₂)/T₁. Nothing can beat it.'],
        ['Холодильные машины', 'Refrigerators', 'Работают наоборот: тратят работу, чтобы перекачать тепло от холодного к горячему.', 'Run backwards: they spend work to pump heat from cold to hot.'],
        ['Экология', 'Ecology', 'Выбросы CO₂ и тепловое загрязнение. Повышение КПД — главный путь к экономии топлива.', 'CO₂ and thermal pollution. Higher efficiency is the main way to save fuel.'],
      ],
      formula: '\\eta_{max} = \\frac{T_1 - T_2}{T_1}',
      sim: { engine: 'thermodynamics_first_law' },
    },
  ]),

  section(P, 10, 'electrostatics', ['Электростатика', 'Electrostatics'], [
    {
      id: 'p10-charge',
      title: ['Электрический заряд. Закон Кулона', 'Charge. Coulomb’s law'],
      intro: [
        'Заряд существует порциями, кратными заряду электрона, и сохраняется. Два точечных заряда взаимодействуют по закону Кулона.',
        'Charge comes in multiples of the electron’s and is conserved. Two point charges interact by Coulomb’s law.',
      ],
      points: [
        ['Элементарный заряд', 'Elementary charge', 'e = 1,6·10⁻¹⁹ Кл. Любой заряд кратен ему.', 'e = 1.6·10⁻¹⁹ C; every charge is a multiple of it.'],
        ['Закон сохранения заряда', 'Conservation of charge', 'В замкнутой системе алгебраическая сумма зарядов постоянна.', 'In a closed system the algebraic sum of charges is constant.'],
        ['Закон Кулона', 'Coulomb’s law', 'F = k|q₁q₂|/r², k = 9·10⁹ Н·м²/Кл². Та же «обратная квадратичная» зависимость, что и у тяготения.', 'F = k|q₁q₂|/r², k = 9·10⁹ N·m²/C², the same inverse-square law as gravity.'],
      ],
      formula: 'F = k \\frac{|q_1 q_2|}{r^2}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p10-field',
      title: ['Напряжённость поля. Суперпозиция', 'Field strength. Superposition'],
      intro: [
        'Напряжённость — сила, действующая на единичный положительный заряд. Поля нескольких зарядов просто складываются.',
        'Field strength is the force on a unit positive charge. Fields from several charges simply add.',
      ],
      points: [
        ['Напряжённость', 'Field strength', 'E = F/q; для точечного заряда E = kq/r².', 'E = F/q; for a point charge E = kq/r².'],
        ['Принцип суперпозиции', 'Superposition', 'E = E₁ + E₂ + … (векторно).', 'E = E₁ + E₂ + … (as vectors).'],
        ['Силовые линии', 'Field lines', 'Касательная к линии — направление E, густота — величина.', 'The tangent gives E’s direction, density its size.'],
      ],
      formula: 'E = k \\frac{q}{r^2}',
      sim: { lab: 'math_divergence' },
    },
    {
      id: 'p10-conductors',
      title: ['Проводники и диэлектрики в поле', 'Conductors and insulators in a field'],
      intro: [
        'Внутри проводника поле равно нулю: свободные заряды перераспределяются и гасят его. Диэлектрик лишь ослабляет поле.',
        'Inside a conductor the field is zero: free charges rearrange and cancel it. An insulator only weakens the field.',
      ],
      points: [
        ['Электростатическая защита', 'Shielding', 'Металлическая сетка (клетка Фарадея) защищает приборы. Поэтому в машине безопасно в грозу.', 'A metal mesh (Faraday cage) shields devices, which is why a car is safe in a thunderstorm.'],
        ['Поляризация диэлектриков', 'Polarisation', 'Молекулы поворачиваются в поле. Диэлектрическая проницаемость ε показывает, во сколько раз поле ослабло.', 'Molecules turn in the field. Permittivity ε shows how much it is weakened.'],
      ],
    },
    {
      id: 'p10-potential',
      title: ['Потенциал. Напряжение', 'Potential. Voltage'],
      intro: [
        'Поле совершает работу, перемещая заряд. Потенциал — энергетическая характеристика точки поля, напряжение — разность потенциалов.',
        'A field does work moving a charge. Potential describes a point’s energy; voltage is a potential difference.',
      ],
      points: [
        ['Потенциальная энергия заряда', 'Potential energy', 'W = qφ. Работа поля не зависит от формы пути.', 'W = qφ. The field’s work doesn’t depend on the path.'],
        ['Разность потенциалов', 'Potential difference', 'U = φ₁ − φ₂ = A/q.', 'U = φ₁ − φ₂ = A/q.'],
        ['Связь E и U', 'E and U', 'В однородном поле E = U/d.', 'In a uniform field E = U/d.'],
        ['Эквипотенциальные поверхности', 'Equipotentials', 'Поверхности равного потенциала, перпендикулярные силовым линиям.', 'Surfaces of equal potential, perpendicular to field lines.'],
      ],
      formula: 'E = \\frac{U}{d}',
    },
    {
      id: 'p10-capacitors',
      title: ['Конденсаторы', 'Capacitors'],
      intro: [
        'Конденсатор — две пластины, разделённые диэлектриком. Он накапливает заряд и энергию, как маленький мгновенный аккумулятор.',
        'A capacitor is two plates separated by an insulator. It stores charge and energy, like a tiny instant battery.',
      ],
      points: [
        ['Электроёмкость', 'Capacitance', 'C = q/U, в фарадах.', 'C = q/U, in farads.'],
        ['Плоский конденсатор', 'Parallel-plate capacitor', 'C = εε₀S/d — больше площадь и меньше зазор, больше ёмкость.', 'C = εε₀S/d: more area and a smaller gap mean more capacitance.'],
        ['Соединение', 'Combining', 'Параллельно ёмкости складываются, последовательно — складываются обратные величины.', 'In parallel capacitances add; in series their reciprocals add.'],
        ['Энергия', 'Energy', 'W = CU²/2. Вспышка фотоаппарата питается от конденсатора.', 'W = CU²/2. A camera flash runs on a capacitor.'],
      ],
      formula: 'C = \\frac{\\varepsilon\\varepsilon_0 S}{d}, \\quad W = \\frac{C U^2}{2}',
    },
  ]),

  section(P, 10, 'dc', ['Законы постоянного тока', 'Direct current'], [
    {
      id: 'p10-current-ohm',
      title: ['Ток. Закон Ома. Соединения', 'Current. Ohm’s law. Combinations'],
      intro: [
        'Закон Ома и правила соединений позволяют рассчитать любую цепь из резисторов.',
        'Ohm’s law and the combination rules let you analyse any resistor network.',
      ],
      points: [
        ['Сила тока', 'Current', 'I = Δq/Δt.', 'I = Δq/Δt.'],
        ['Закон Ома для участка', 'Ohm’s law', 'I = U/R.', 'I = U/R.'],
        ['Смешанное соединение', 'Mixed networks', 'Цепь упрощают по шагам: заменяют параллельные и последовательные группы одним резистором.', 'Simplify step by step, replacing series and parallel groups with single resistors.'],
      ],
      formula: 'I = \\frac{U}{R}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p10-joule',
      title: ['Работа и мощность. Закон Джоуля–Ленца', 'Work, power, Joule’s law'],
      intro: [
        'Ток выделяет теплоту, пропорциональную квадрату силы тока. На этом работают нагреватели и предохранители.',
        'Current releases heat proportional to its square, which drives heaters and fuses.',
      ],
      points: [
        ['Формулы', 'Formulas', 'A = UIt, P = UI = I²R = U²/R, Q = I²Rt.', 'A = UIt, P = UI = I²R = U²/R, Q = I²Rt.'],
      ],
      formula: 'Q = I^2 R t',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p10-emf',
      title: ['ЭДС. Закон Ома для полной цепи', 'EMF. Ohm’s law for a full circuit'],
      intro: [
        'Внутри источника сторонние силы разделяют заряды. Их работа на единицу заряда — ЭДС. Источник сам немного сопротивляется току.',
        'Inside a source non-electric forces separate charges; their work per unit charge is the EMF. The source has some internal resistance.',
      ],
      points: [
        ['Сторонние силы', 'Non-electric forces', 'Химические в батарейке, магнитные в генераторе.', 'Chemical in a battery, magnetic in a generator.'],
        ['Закон Ома для полной цепи', 'Full-circuit law', 'I = ε/(R + r).', 'I = ε/(R + r).'],
        ['Короткое замыкание', 'Short circuit', 'При R → 0 ток I = ε/r огромен — так разряжается и греется аккумулятор.', 'With R → 0 the current ε/r is huge, overheating the battery.'],
        ['Шунты и добавочные сопротивления', 'Shunts and multipliers', 'Шунт расширяет предел амперметра, добавочное сопротивление — вольтметра.', 'A shunt extends an ammeter’s range; a series resistor extends a voltmeter’s.'],
      ],
      formula: 'I = \\frac{\\varepsilon}{R + r}',
      sim: { moment: 'moment_circuit' },
    },
  ]),

  section(P, 10, 'media', ['Электрический ток в различных средах', 'Current in different media'], [
    {
      id: 'p10-metals',
      title: ['Ток в металлах', 'Current in metals'],
      intro: [
        'В металлах ток — движение свободных электронов. При нагревании сопротивление растёт, а у некоторых веществ при охлаждении исчезает совсем.',
        'In metals current is moving free electrons. Resistance rises with heat, and in some materials vanishes entirely when cold.',
      ],
      points: [
        ['Электронная проводимость', 'Electron conduction', 'Опыт Толмена–Стюарта доказал, что ток в металлах переносят электроны.', 'The Tolman–Stewart experiment proved electrons carry current in metals.'],
        ['Зависимость от температуры', 'Temperature dependence', 'R = R₀(1 + αt) — на этом работают термометры сопротивления.', 'R = R₀(1 + αt), used in resistance thermometers.'],
        ['Сверхпроводимость', 'Superconductivity', 'Ниже критической температуры сопротивление равно нулю. Применяют в МРТ и коллайдерах.', 'Below a critical temperature resistance is zero; used in MRI and colliders.'],
      ],
      formula: 'R = R_0 (1 + \\alpha t)',
    },
    {
      id: 'p10-semiconductors',
      title: ['Полупроводники', 'Semiconductors'],
      intro: [
        'В полупроводниках заряд переносят электроны и «дырки». Добавляя примеси, проводимостью можно управлять — на этом построена вся электроника.',
        'In semiconductors electrons and “holes” carry charge. Adding impurities controls conduction, the basis of all electronics.',
      ],
      points: [
        ['Собственная проводимость', 'Intrinsic conduction', 'При нагреве и освещении появляются свободные электроны и дырки.', 'Heat and light free up electrons and holes.'],
        ['n- и p-типы', 'n- and p-type', 'Донорная примесь даёт лишние электроны (n), акцепторная — дырки (p).', 'Donors add electrons (n); acceptors add holes (p).'],
        ['p–n-переход и диод', 'p–n junction and diode', 'Пропускает ток только в одну сторону.', 'Lets current through in one direction only.'],
        ['Транзистор', 'Transistor', 'Малый ток управляет большим. В процессоре — миллиарды транзисторов.', 'A small current controls a large one. A processor has billions.'],
      ],
    },
    {
      id: 'p10-vacuum',
      title: ['Ток в вакууме', 'Current in a vacuum'],
      intro: [
        'В вакууме нет носителей заряда. Их добывают нагревом катода — электроны «испаряются» из металла.',
        'A vacuum has no charge carriers, so a heated cathode boils electrons out of the metal.',
      ],
      points: [
        ['Термоэлектронная эмиссия', 'Thermionic emission', 'Раскалённый катод испускает электроны.', 'A hot cathode emits electrons.'],
        ['Вакуумный диод и ЭЛТ', 'Vacuum diode and CRT', 'Электронный пучок, отклоняемый полями, рисовал изображение в старых телевизорах.', 'An electron beam steered by fields drew pictures on old TV screens.'],
      ],
    },
    {
      id: 'p10-liquids',
      title: ['Ток в жидкостях. Электролиз', 'Current in liquids. Electrolysis'],
      intro: [
        'В растворах ток переносят ионы. На электродах они разряжаются, и выделяется вещество.',
        'In solutions ions carry current. At the electrodes they discharge and release substances.',
      ],
      points: [
        ['Законы Фарадея', 'Faraday’s laws', 'm = kIt — масса вещества пропорциональна прошедшему заряду.', 'm = kIt: the mass deposited is proportional to the charge passed.'],
        ['Применение', 'Uses', 'Получение алюминия, гальваническое покрытие, очистка меди.', 'Making aluminium, electroplating, refining copper.'],
      ],
      formula: 'm = k I t',
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'p10-gases',
      title: ['Ток в газах. Плазма', 'Current in gases. Plasma'],
      intro: [
        'Газ — изолятор, пока его не ионизировать. Тогда он проводит ток и светится: молния, неоновая вывеска, сварка.',
        'A gas insulates until ionised; then it conducts and glows: lightning, neon signs, welding arcs.',
      ],
      points: [
        ['Несамостоятельный и самостоятельный разряд', 'Non-self-sustained and self-sustained', 'Первый идёт только с внешним ионизатором, второй поддерживает себя сам.', 'The first needs an outside ioniser; the second sustains itself.'],
        ['Виды разрядов', 'Kinds of discharge', 'Тлеющий (лампы), искровой (молния), коронный (у проводов ЛЭП), дуговой (сварка).', 'Glow (lamps), spark (lightning), corona (near power lines), arc (welding).'],
        ['Плазма', 'Plasma', 'Сильно ионизированный газ — четвёртое состояние вещества. Из неё состоят звёзды.', 'A highly ionised gas, the fourth state of matter. Stars are made of it.'],
      ],
    },
  ]),
];
