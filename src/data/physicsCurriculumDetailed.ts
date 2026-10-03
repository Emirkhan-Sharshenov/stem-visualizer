import { TextbookLesson } from '../types/stem';

export const DETAILED_PHYSICS_CURRICULUM: TextbookLesson[] = [
  // =========================================================================
  // 7 КЛАСС — ФИЗИКА (ПОЛНАЯ ПРОГРАММА)
  // =========================================================================
  {
    id: 'p7_intro_science',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Introduction', ru: 'Введение' },
    title: { en: 'What Physics Studies: Physical Phenomena', ru: 'Что изучает физика: Физические явления' },
    subtitle: { en: 'Mechanical, thermal, electrical, magnetic, and optical phenomena in nature', ru: 'Механические, тепловые, электрические, магнитные и световые явления' },
    textbookDefinition: {
      en: 'Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force.',
      ru: 'Физика — наука о природе, изучающая свойства и строение материи, формы её движения и изменения, общие закономерности явлений природы.'
    },
    studentConfusion: {
      en: 'Students think physics is just memorizing dry formulas, not realizing it explains literally everything you touch and see.',
      ru: 'Школьники думают, что физика — это просто скучные формулы из учебника, не осознавая, что физика объясняет каждый шаг, свет лампы и полет мяча.'
    },
    lifeAnalogy: {
      en: 'Watching a movie behind the scenes: physics shows the hidden machinery, invisible cables, and pulleys that make the universe operate.',
      ru: 'Закулисье театра: зритель видит парящего героя, а физика показывает невидимые тросы, противовесы и законы рычага, которые держат всю сцену.'
    },
    momentObservation: {
      en: 'Observe the interactive physical field simulator: tune speed and wave scale to explore fundamental oscillations of matter!',
      ru: 'Наблюдай за физическим полем в реальном времени: регулируй скорость и масштаб фундаментальных колебаний материи!'
    },
    viewMode: 'moment_universal',
    simEngineType: 'measurement_error',
    keywords: ['physics', 'science', 'phenomena', 'введение', 'явления', 'природа']
  },
  {
    id: 'p7_measurement_error',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Introduction', ru: 'Введение' },
    title: { en: 'Measurements & Instrument Scale Error', ru: 'Измерения физических величин, цена деления и погрешность' },
    subtitle: { en: 'Why no measurement in the universe can be 100% exact', ru: 'Почему ни один прибор в мире не может измерить величину абсолютно точно' },
    textbookDefinition: {
      en: 'Every physical measurement has an inherent uncertainty. The instrument scale interval is the value between two adjacent marks, and absolute error is typically half the smallest division: A = a ± Δa.',
      ru: 'Цена деления прибора — значение наименьшего деления шкалы. Абсолютная погрешность измерений обычно принимается равной половине цены деления шкалы: A = a ± Δa.'
    },
    studentConfusion: {
      en: 'Students believe a ruler gives the "exact" truth, forgetting the tick mark itself has physical width and eyes have parallax.',
      ru: 'Школьники верят, что линейка показывает «идеальную истину», забывая, что сама черточка деления имеет толщину, а глаз смотрит под углом.'
    },
    lifeAnalogy: {
      en: 'Measuring sugar with a tablespoon vs a micro-gram laboratory scale: smaller ticks give narrower uncertainty intervals.',
      ru: 'Взвешивание соли на кухонных весах (с точностью до 1 грамма) и в ювелирной лаборатории (до 0.001 грамма): погрешность сжимается, но никогда не равна строгому нулю!'
    },
    momentObservation: {
      en: 'Zoom into the vernier scale: align the parallax lines to read the fraction and observe the ±Δ uncertainty interval!',
      ru: 'Приблизь шкалу штангенциркуля: совмещай риски делений и следи за интервалом абсолютной погрешности ±Δ!'
    },
    formula: 'A = a \\pm \\Delta a, \\quad \\Delta a = \\frac{\\text{Ц.Д.}}{2}',
    viewMode: 'moment_universal',
    simEngineType: 'measurement_error',
    keywords: ['measurement', 'scale', 'error', 'измерение', 'цена деления', 'погрешность']
  },
  {
    id: 'p7_states_of_matter',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Structure of Matter', ru: 'Строение вещества' },
    title: { en: 'Three States of Matter: Ice → Water → Steam', ru: 'Строение вещества: Три агрегатных состояния' },
    subtitle: { en: 'Hexagonal crystal lattice vs flowing liquid vs frantic gas', ru: 'Жесткая кристаллическая решетка, текучая жидкость и летающий газ' },
    textbookDefinition: {
      en: 'Solids maintain shape and volume; liquids maintain volume but take the container shape; gases fill the entire available volume without fixed shape.',
      ru: 'Вещество существует в твердом, жидком и газообразном состояниях. В твердых телах молекулы совершают колебания около узлов решетки, в жидкостях перескакивают, в газах свободно летают.'
    },
    studentConfusion: {
      en: 'Do the water molecules themselves melt? No! H₂O molecules remain completely identical; only the intermolecular binding bonds snap!',
      ru: 'Плавятся ли сами молекулы воды? Нет! Сама молекула H₂O остается абсолютно той же — рушатся только связующие «мостики» между ними.'
    },
    lifeAnalogy: {
      en: 'Solid = students sitting in classroom desks; Liquid = students walking in school hallways; Gas = kids running wildly across an open stadium.',
      ru: 'Твердое тело — ученики сидят за партами. Жидкость — перемена в коридоре: все ходят и скользят мимо друг друга. Газ — спринтерский забег по полю.'
    },
    momentObservation: {
      en: 'Heat ice past 0°C: watch thermal vibrations shatter the hexagonal crystal grid, collapsing into fluid water particles!',
      ru: 'Нагрей кристаллическую решетку выше 0°C: смотри, как бешеная дрожь молекул ломает гексагональную сетку льда в текучую воду!'
    },
    viewMode: 'moment_states',
    simEngineType: 'states_of_matter',
    keywords: ['states', 'solid', 'liquid', 'gas', 'агрегатные', 'лед', 'вода', 'пар']
  },
  {
    id: 'p7_motion_speed',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Body Interactions', ru: 'Взаимодействие тел' },
    title: { en: 'Mechanical Motion & Velocity (v = s / t)', ru: 'Механическое движение: Скорость, путь и время' },
    subtitle: { en: 'Why speedometer reading is a vector and path is a scalar', ru: 'Почему путь — это длина траектории, а скорость всегда имеет стрелку направления' },
    textbookDefinition: {
      en: 'Mechanical motion is the change in position of a body relative to other reference bodies over time. Velocity in uniform motion is the ratio of path to time: v = s / t.',
      ru: 'Механическое движение — изменение положения тела в пространстве относительно других тел с течением времени. Скорость равномерного прямолинейного движения: v = s / t.'
    },
    studentConfusion: {
      en: 'Students confuse scalar path (kilometers on odometer) with vector displacement (straight line from start to finish).',
      ru: 'Школьники путают путь (сколько бензина сжег по извилистой дороге) и перемещение (прямая стрелка от старта до финиша).'
    },
    lifeAnalogy: {
      en: 'Running 400m around an athletic track: your odometer ran 400 meters, but your displacement is exactly 0 because you ended where you started!',
      ru: 'Пробежка 400 метров по круговому стадиону: счетчик шагов показывает 400 м, но перемещение равно строго 0, ведь ты вернулся в точку старта!'
    },
    momentObservation: {
      en: 'Adjust acceleration slider: watch the green velocity vector stretch instantly in front of the vehicle as tick marks fly by!',
      ru: 'Двигай ползунок скорости: смотри, как зеленая стрелка вектора мгновенно вытягивается перед машинкой по мере разгона!'
    },
    formula: 'v = \\frac{s}{t}, \\quad s = v \\cdot t',
    viewMode: 'moment_universal',
    simEngineType: 'kinematics_velocity',
    keywords: ['speed', 'velocity', 'motion', 'path', 'скорость', 'путь', 'время', 'движение']
  },
  {
    id: 'p7_inertia_density',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Body Interactions', ru: 'Взаимодействие тел' },
    title: { en: 'Inertia, Mass & Density (ρ = m / V)', ru: 'Инерция, масса и плотность вещества (ρ = m / V)' },
    subtitle: { en: 'Why a 1-liter bottle of mercury weighs 13.6 kg while 1 liter of water weighs 1 kg', ru: 'Почему литр ртути весит 13.6 кг, а литр воды — всего 1 кг' },
    textbookDefinition: {
      en: 'Density is a scalar physical quantity defined as mass per unit volume of a substance: ρ = m / V. Inertia is the property of a body to resist changes in its state of motion.',
      ru: 'Плотность — физическая величина, равная отношению массы тела к его объему: ρ = m / V. Инертность — свойство тела сохранять неизменным состояние покоя или движения.'
    },
    studentConfusion: {
      en: 'What is heavier: 1 kg of iron or 1 kg of cotton? They weigh the same 1 kg, but iron has vast density and tiny volume!',
      ru: '«Что тяжелее: килограмм железа или килограмм ваты?» Они весят одинаково, но плотность железа огромна, поэтому его объем — маленький кубик, а ваты — огромный мешок!'
    },
    lifeAnalogy: {
      en: 'A crowded subway car: packing 200 people into one car vs 10 people in the same car represents high vs low density.',
      ru: 'Вагон метро в час пик (200 человек набились вплотную — огромная плотность) и пустой ночной вагон (3 человека — разреженное вещество).'
    },
    momentObservation: {
      en: 'Place equal-volume cubes of gold, iron, and wood on balance scales: watch the high-density gold cube tilt the balance violently!',
      ru: 'Положи одинаковые по объему кубики дерева, железа и золота на чаши весов: кубик золота с плотностью 19300 кг/м³ мгновенно перевесит!'
    },
    formula: '\\rho = \\frac{m}{V}, \\quad m = \\rho \\cdot V',
    viewMode: 'moment_universal',
    simEngineType: 'inertia_density',
    keywords: ['density', 'mass', 'inertia', 'плотность', 'масса', 'инерция']
  },
  {
    id: 'p7_hooke_law',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Body Interactions', ru: 'Взаимодействие тел' },
    title: { en: 'Hooke\'s Law & Spring Elastic Force', ru: 'Сила упругости и закон Гука (F = -k·Δx)' },
    subtitle: { en: 'Why doubling spring stretch requires exactly double pull force', ru: 'Почему пружина сопротивляется тем сильнее, чем сильнее её растягиваешь' },
    textbookDefinition: {
      en: 'Hooke\'s law states that the strain of an elastic material is proportional to the applied stress: F_elastic = -k · Δx, where k is spring rigidity.',
      ru: 'Закон Гука: сила упругости, возникающая при деформации тела, прямо пропорциональна величине этой деформации: F_упр = -k · Δx.'
    },
    studentConfusion: {
      en: 'Why is there a minus sign in F = -k·Δx? Because the restoring force points in the exact OPPOSITE direction of stretch!',
      ru: 'Зачем в формуле минус? Потому что сила упругости направлена ВСЕГДА ПРОТИВ растяжения — она стремится вернуть тело назад!'
    },
    lifeAnalogy: {
      en: 'Pulling a bowstring or a slingshot: pull back 5 cm feels light; pull back 20 cm requires all your muscles.',
      ru: 'Натягивание тетивы лука или рогатки: чуть-чуть оттянуть легко, а чтобы растянуть до предела, нужно навалиться всем телом!'
    },
    momentObservation: {
      en: 'Drag the stretch slider: watch the spring coils widen and the red restoring force vector grow in direct linear proportion!',
      ru: 'Растягивай пружину ползунком: витки раздвигаются, а красный вектор возвращающей силы упругости линейно растет в обратную сторону!'
    },
    formula: 'F_{\\text{упр}} = -k \\Delta x',
    viewMode: 'moment_universal',
    simEngineType: 'hooke_spring',
    keywords: ['hooke', 'spring', 'elastic', 'гук', 'пружина', 'упругость', 'деформация']
  },
  {
    id: 'p7_pascal_vessels',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Pressure in Fluids', ru: 'Давление жидкостей и газов' },
    title: { en: 'Pascal\'s Law & Communicating Vessels', ru: 'Закон Паскаля и сообщающиеся сосуды' },
    subtitle: { en: 'Why tea in a teapot spout always levels with tea inside the pot', ru: 'Почему чай в узком носике чайника всегда стоит на той же высоте, что и в пузатом кувшине' },
    textbookDefinition: {
      en: 'In communicating vessels of any shape, homogeneous liquid rests at the exact same level because hydrostatic pressure depends only on depth h: p = ρgh.',
      ru: 'В сообщающихся сосудах любой формы свободные поверхности однородной покоящейся жидкости устанавливаются на одном уровне: p = ρgh.'
    },
    studentConfusion: {
      en: 'Students think a wide fat vessel should "push harder" and force liquid higher in the narrow spout. But depth h alone determines pressure!',
      ru: 'Кажется, что широкий кувшин содержит больше воды и должен выдавить жидкость из тонкого носика вверх. Но давление зависит ТОЛЬКО от высоты столба h, а не от массы!'
    },
    lifeAnalogy: {
      en: 'Water towers supplying entire city neighborhoods: water in 9th floor taps flows because the tower tank sits higher up on the hill.',
      ru: 'Водонапорная башня: вода сама самотеком поднимается на 9-й этаж городских домов, потому что бак башни расположен выше крыш!'
    },
    momentObservation: {
      en: 'Tilt the U-vessel left and right: watch the fluid surface automatically self-level to a razor-sharp horizontal plane across all tubes!',
      ru: 'Наклоняй сообщающиеся сосуды разной толщины: уровень жидкости мгновенно выравнивается по единой горизонтальной линии!'
    },
    formula: 'p = \\rho g h, \\quad h_1 = h_2',
    viewMode: 'moment_pascal',
    simEngineType: 'pascal_vessels',
    keywords: ['pascal', 'vessels', 'hydrostatic', 'паскаль', 'сосуды', 'давление', 'уровень']
  },
  {
    id: 'p7_barometer_atmosphere',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Pressure in Fluids', ru: 'Давление жидкостей и газов' },
    title: { en: 'Atmospheric Pressure & Torricelli Barometer', ru: 'Атмосферное давление и опыт Торричелли (760 мм рт. ст.)' },
    subtitle: { en: 'You carry a weight of 10 tons of air on your body right now', ru: 'На твои плечи прямо сейчас давит 10 тонн воздуха — почему мы не расплющены?' },
    textbookDefinition: {
      en: 'Atmospheric pressure is caused by the gravitational attraction of the planet on the atmospheric gases. Normal atmospheric pressure balances a 760 mm column of mercury: 101,325 Pa.',
      ru: 'Атмосферное давление создается гравитационным притяжением воздушной оболочки к Земле. Нормальное атмосферное давление уравновешивает столб ртути высотой 760 мм (101.3 кПа).'
    },
    studentConfusion: {
      en: 'Why doesn’t the atmosphere crush human bones? Because our internal fluid and blood pressure pushes outward with the exact same 101 kPa!',
      ru: 'Почему нас не сплющивает давлением в 10 тонн? Потому что жидкости и газы внутри наших клеток давят наружу с точно такой же силой в 101 кПа!'
    },
    lifeAnalogy: {
      en: 'Drinking through a straw: you do not "pull" the juice up; your mouth creates low pressure, and the atmosphere literally pushes the juice up from outside!',
      ru: 'Питье сока через трубочку: ты не «тянешь» сок силой мысли; ты создаешь вакуум во рту, и атмосферное давление снаружи силой заталкивает сок в соломинку!'
    },
    momentObservation: {
      en: 'Invert the mercury tube into the dish: watch the mercury column drop to exactly 760 mm, leaving Torricelli vacuum at the closed top!',
      ru: 'Опусти запаянную трубку со ртутью в чашу: столб замирает ровно на 760 мм, оставляя сверху торричеллиеву пустоту (чистый вакуум)!'
    },
    formula: 'p_{\\text{атм}} = \\rho_{\\text{Hg}} g h = 760 \\text{ мм рт. ст.} \\approx 101325 \\text{ Па}',
    viewMode: 'moment_universal',
    simEngineType: 'barometer_atmosphere',
    keywords: ['atmosphere', 'barometer', 'torricelli', 'pressure', 'атмосфера', 'барометр', 'торричелли', 'давление']
  },
  {
    id: 'p7_archimedes_buoyancy',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Pressure in Fluids', ru: 'Давление жидкостей и газов' },
    title: { en: 'Archimedes\' Principle & Ship Flotation', ru: 'Закон Архимеда: Плавание тел и воздухоплавание' },
    subtitle: { en: 'Why a tiny iron nail sinks, but a 100,000-ton steel cruise ship floats', ru: 'Почему гвоздь мгновенно идет на дно, а гигантский стальной лайнер парит на волнах' },
    textbookDefinition: {
      en: 'Any body submerged in fluid experiences an upward buoyant force equal to the weight of fluid displaced: F_buoyant = ρ_fluid · g · V_submerged.',
      ru: 'На тело, погруженное в жидкость или газ, действует выталкивающая сила, направленная вертикально вверх и равная весу вытесненной жидкости: F_арх = ρ_ж · g · V_погр.'
    },
    studentConfusion: {
      en: 'Does buoyancy depend on the body’s mass? No! Buoyancy depends ONLY on the fluid density and submerged volume!',
      ru: 'Зависит ли сила Архимеда от того, из чего сделан предмет? Нет! Архимеду важен ТОЛЬКО объем вытесненной воды и плотность самой жидкости!'
    },
    lifeAnalogy: {
      en: 'Pushing a large inflated beach ball underwater in a pool: it kicks back up violently because it displaces 20 liters of heavy water.',
      ru: 'Попробуй утопить большой надувной мяч в бассейне: он выпрыгивает как ракета, потому что вытесняет 20 кг тяжелой воды!'
    },
    momentObservation: {
      en: 'Change body density from 600 (wood) to 2700 (aluminum): watch the wood float serenely while aluminum plunges to the floor!',
      ru: 'Меняй плотность тела: дерево (600 кг/м³) всплывает на поверхность, а кусок алюминия (2700 кг/м³) стремительно тонет на дно!'
    },
    formula: 'F_{\\text{арх}} = \\rho_{\\text{ж}} g V_{\\text{погр}}',
    viewMode: 'moment_universal',
    simEngineType: 'archimedes_buoyancy',
    keywords: ['archimedes', 'buoyancy', 'flotation', 'архимед', 'плавание', 'выталкивающая сила']
  },
  {
    id: 'p7_simple_machines_levers',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Work, Power & Energy', ru: 'Работа и мощность. Энергия' },
    title: { en: 'Simple Machines: Levers, Pulleys & Inclined Plane', ru: 'Простые механизмы: Рычаг, блоки и наклонная плоскость' },
    subtitle: { en: 'How ancient Egyptians built pyramids using inclined ramps and pulleys', ru: 'Как поднять тонну груза усилием детской руки' },
    textbookDefinition: {
      en: 'Simple machines alter the magnitude or direction of a force. A movable pulley yields a 2x force gain. The golden rule: gain in force equals loss in distance.',
      ru: 'Простые механизмы дают выигрыш в силе или меняют её направление. Подвижный блок дает выигрыш в силе в 2 раза. Золотое правило: во сколько раз выигрываем в силе, во столько проигрываем в расстоянии.'
    },
    studentConfusion: {
      en: 'Does a movable pulley do extra work for free? No, mechanical work A = F·s remains completely invariant!',
      ru: 'Дает ли блок выигрыш в работе? Нет! Работа A = F·s остается неизменной: тянешь веревку в 2 раза легче, но вытягиваешь в 2 раза больше длины!'
    },
    lifeAnalogy: {
      en: 'Walking up a steep mountain: a straight climb is exhausting; walking along a zig-zag switchback ramp takes 3x the distance but 1/3 the leg effort.',
      ru: 'Подъем в гору: карабкаться по отвесному склону тяжело; идти по пологому серпантину наклонной плоскости втрое дольше, но ноги не устают!'
    },
    momentObservation: {
      en: 'Tug the rope of the 2-pulley tackle system: watch the 500 N weight rise smoothly with only 250 N tension applied!',
      ru: 'Тяни трос полиспаста с подвижным блоком: груз весом 500 Н легко поднимается вверх усилием натяжения всего в 250 Н!'
    },
    formula: 'F_1 L_1 = F_2 L_2, \\quad F = \\frac{P}{2}',
    viewMode: 'moment_lever',
    simEngineType: 'levers_pulleys',
    keywords: ['lever', 'pulley', 'machines', 'рычаг', 'блок', 'наклонная плоскость', 'простые механизмы']
  },

  // =========================================================================
  // 8 КЛАСС — ФИЗИКА (ПОЛНАЯ ПРОГРАММА)
  // =========================================================================
  {
    id: 'p8_heat_conduction_convection',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Thermal Phenomena', ru: 'Тепловые явления' },
    title: { en: 'Heat Transfer: Conduction, Convection & Radiation', ru: 'Виды теплопередачи: Теплопроводность, конвекция, излучение' },
    subtitle: { en: 'Why heating radiators are placed under windows, not on ceilings', ru: 'Почему батареи всегда ставят у пола под окном, а не на потолке' },
    textbookDefinition: {
      en: 'Heat transfer occurs via conduction (molecular collisions in solids), convection (bulk fluid/gas circulation driven by buoyancy), and thermal radiation (electromagnetic waves).',
      ru: 'Теплопередача осуществляется тремя путями: теплопроводность (перенос энергии без переноса вещества), конвекция (перенос тепла струями жидкости или газа) и излучение.'
    },
    studentConfusion: {
      en: 'Does a wool winter coat create heat? No! A coat produces zero heat; it just traps stagnant air pockets preventing conduction and convection!',
      ru: 'Греет ли шуба человека? Шуба не выделяет ни одного джоуля тепла! Она лишь задерживает воздух в ворсинках, блокируя уход тепла от тела.'
    },
    lifeAnalogy: {
      en: 'Passing a bucket of water down a human chain (conduction) vs one runner carrying the bucket (convection) vs spraying water with a cannon (radiation).',
      ru: 'Тушение пожара: передавать ведра из рук в руки по цепочке (теплопроводность), бежать бегом с ведром (конвекция) или запустить струю из брандспойта (излучение)!'
    },
    momentObservation: {
      en: 'Watch thermal color plumes: warm red air expands, becomes less dense and floats upward, while cold blue air sinks downward!',
      ru: 'Смотри на тепловые конвекционные потоки: теплый красный воздух расширяется, теряет плотность и всплывает под потолок!'
    },
    viewMode: 'moment_universal',
    simEngineType: 'heat_convection_conduction',
    keywords: ['convection', 'conduction', 'radiation', 'heat', 'конвекция', 'теплопроводность', 'излучение', 'теплота']
  },
  {
    id: 'p8_specific_heat_calorimetry',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Thermal Phenomena', ru: 'Тепловые явления' },
    title: { en: 'Quantity of Heat & Specific Heat Capacity (Q = c·m·Δt)', ru: 'Количество теплоты и удельная теплоемкость (Q = cmΔt)' },
    subtitle: { en: 'Why ocean water warms up so slowly in summer and cools slowly in winter', ru: 'Почему море прогревается только к концу лета и держит тепло всю осень' },
    textbookDefinition: {
      en: 'Specific heat capacity c is the amount of heat energy required to raise the temperature of 1 kg of a substance by 1 Kelvin: Q = c · m · Δt.',
      ru: 'Удельная теплоемкость c показывает, какое количество теплоты необходимо передать 1 кг вещества для нагревания на 1°C: Q = c · m · (t₂ - t₁).'
    },
    studentConfusion: {
      en: 'Why does hot sand on the beach burn your feet while sea water right next to it feels refreshingly cold under identical sunshine? Water has 5x higher specific heat capacity!',
      ru: 'Почему песок на пляже раскален, а вода рядом прохладная, хотя солнце светит одинаково? Потому что у воды гигантская теплоемкость (4200 Дж/кг·°C) против песка (800)!'
    },
    lifeAnalogy: {
      en: 'A massive sponge absorbing liters of water without dripping vs a piece of dry cardboard that soaks through instantly.',
      ru: 'Огромная губка (вода), которая может впитать ведро воды, пока нагреется на 1 градус, против сухой тряпочки (железо или песок), которая накаляется мгновенно.'
    },
    momentObservation: {
      en: 'Apply 1000 Joules to equal masses of water and iron: watch the iron temperature shoot up to 80°C while water barely rises by 5°C!',
      ru: 'Передай 1000 Дж тепла воде и железу: термометр в куске железа взлетит до 80°C, а в воде поднимется всего на пару делений!'
    },
    formula: 'Q = c m (t_2 - t_1), \\quad c_{\\text{H}_2\\text{O}} = 4200 \\text{ Дж/(кг}\\cdot\\text{°C)}',
    viewMode: 'moment_universal',
    simEngineType: 'specific_heat_calorimetry',
    keywords: ['calorimetry', 'specific heat', 'energy', 'теплоемкость', 'джоуль', 'калориметр', 'нагревание']
  },
  {
    id: 'p8_heat_engines_ice',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Phase Transitions', ru: 'Агрегатные состояния вещества' },
    title: { en: 'Internal Combustion Engine: 4 Strokes & Efficiency', ru: 'Тепловые двигатели: Четыре такта ДВС и КПД' },
    subtitle: { en: 'Intake, Compression, Power Stroke (Spark), and Exhaust in automobile engines', ru: 'Впуск, сжатие, рабочий ход (искра) и выпуск в цилиндре автомобиля' },
    textbookDefinition: {
      en: 'A heat engine converts thermal energy into mechanical work by cyclic expansion of hot gas. Thermal efficiency is the ratio of useful work to heat supplied: η = (Q₁ - Q₂) / Q₁.',
      ru: 'Тепловой двигатель превращает внутреннюю энергию топлива в механическую работу. КПД теплового двигателя: η = (Q₁ - Q₂) / Q₁ · 100%.'
    },
    studentConfusion: {
      en: 'Why can’t a car engine have 100% efficiency? Because thermodynamics forbids turning all heat into work without dumping waste heat into a cooler!',
      ru: 'Почему КПД двигателя автомобиля всего 25–35%? Потому что законы физики запрещают превратить всё тепло в работу: часть тепла неизбежно улетает в выхлопную трубу!'
    },
    lifeAnalogy: {
      en: 'A waterfall driving a water mill: you need both a high cliff (hot source) and a river below (cool sink) for water to flow through.',
      ru: 'Мельничное водяное колесо: вода крутит лопасти только тогда, когда есть перепад высоты между верхним прудом (нагреватель) и нижним ручьем (холодильник).'
    },
    momentObservation: {
      en: 'Cycle through the 4 engine strokes: watch the fuel ignite on stroke 3, driving the piston down with huge expanding gas pressure!',
      ru: 'Следи за тактами ДВС: на третьем такте свеча зажигания выбивает искру, взрыв газов толкает поршень вниз, вращая коленвал!'
    },
    formula: '\\eta = \\frac{A_{\\text{пол}}}{Q_1} = \\frac{Q_1 - Q_2}{Q_1}',
    viewMode: 'moment_universal',
    simEngineType: 'heat_engines_carnot',
    keywords: ['engine', 'internal combustion', 'efficiency', 'двс', 'двигатель', 'кпд', 'цилиндр', 'искра']
  },
  {
    id: 'p8_circuit_ohm_parallel',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Electrical Phenomena', ru: 'Электрические явления' },
    title: { en: 'Series & Parallel Circuits: Resistance & Short Circuit', ru: 'Последовательное и параллельное соединение проводников' },
    subtitle: { en: 'Why one burnt bulb in old Christmas lights turned off the entire tree', ru: 'Почему при перегорании одной лампочки в старой гирлянде гаснет вся елка' },
    textbookDefinition: {
      en: 'In series: I = I₁ = I₂, R_total = R₁ + R₂. In parallel: U = U₁ = U₂, 1/R_total = 1/R₁ + 1/R₂. Parallel connection ensures independent device operation.',
      ru: 'При последовательном соединении ток одинаков, сопротивления складываются. При параллельном соединении одинаково напряжение, а общая проводимость растет: 1/R = 1/R₁ + 1/R₂.'
    },
    studentConfusion: {
      en: 'Why does adding more parallel resistors REDUCE total resistance? Because you add more parallel traffic lanes for electrons!',
      ru: 'Почему при параллельном подключении общее сопротивление падает? Представь шлагбаумы на платной трассе: открыли еще 3 шлагбаума — пробка рассосалась в разы быстрее!'
    },
    lifeAnalogy: {
      en: 'Single lane country road (series) vs multi-lane highway toll booths (parallel): more open booths means cars flow with less resistance.',
      ru: 'Одна узкая дверь (последовательно — все толпятся цепочкой) и три широких выхода из кинозала (параллельно — поток людей устремляется свободно).'
    },
    momentObservation: {
      en: 'Toggle switch between Series and Parallel: watch parallel light bulbs shine at maximum brightness while series bulbs dim to a weak glow!',
      ru: 'Переключай схему с последовательной на параллельную: в параллельной обе лампы светят в полную яркость, а в последовательной тускло мерцают!'
    },
    formula: 'R_{\\text{посл}} = R_1 + R_2, \\quad \\frac{1}{R_{\\text{пар}}} = \\frac{1}{R_1} + \\frac{1}{R_2}',
    viewMode: 'moment_circuit',
    simEngineType: 'series_parallel_circuits',
    keywords: ['series', 'parallel', 'resistors', 'circuit', 'последовательное', 'параллельное', 'цепь', 'сопротивление']
  },
  {
    id: 'p8_lenses_ray_tracing',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Optical Phenomena', ru: 'Световые явления' },
    title: { en: 'Convex & Concave Lenses: Ray Tracing & Vision', ru: 'Линзы: Оптическая сила, фокус и построение изображений' },
    subtitle: { en: 'How reading glasses and smartphone camera lenses focus light onto sensors', ru: 'Как линзы очков исправляют близорукость и дальнозоркость' },
    textbookDefinition: {
      en: 'Thin lens formula relates focal length F, object distance d, and image distance f: 1/F = 1/d + 1/f. Optical power in diopters is D = 1 / F.',
      ru: 'Формула тонкой линзы: 1/F = 1/d + 1/f. Оптическая сила линзы D измеряется в диоптриях (дптр) и равна обратному фокусному расстоянию: D = 1 / F.'
    },
    studentConfusion: {
      en: 'What is a "real" vs "virtual" image? A real image can be projected onto a paper screen; a virtual image exists only in your eye’s optics.',
      ru: 'Чем действительное изображение отличается от мнимого? Действительное изображение можно спроецировать на лист бумаги (как в кинотеатре), а мнимое видно только в зеркале.'
    },
    lifeAnalogy: {
      en: 'Burning a dry leaf with a magnifying glass on a sunny day: all parallel rays converge into one pinpoint focus spot of intense heat.',
      ru: 'Выжигание лупой на деревяшке солнечным зайчиком: все параллельные лучи солнца линза сводит в одну ослепительно горячую точку фокуса F!'
    },
    momentObservation: {
      en: 'Drag the candle beyond 2F: watch the green rays converge behind the lens into a crisp, inverted real image on the screen!',
      ru: 'Двигай предмет дальше двойного фокуса 2F: смотри, как лучи сходятся за линзой в перевернутое действительное изображение!'
    },
    formula: '\\frac{1}{F} = \\frac{1}{d} + \\frac{1}{f}, \\quad D = \\frac{1}{F}',
    viewMode: 'moment_universal',
    simEngineType: 'lenses_ray_tracing',
    keywords: ['lens', 'optics', 'focus', 'diopters', 'линза', 'фокус', 'оптическая сила', 'изображение']
  },

  // =========================================================================
  // 9 КЛАСС — ФИЗИКА (ПОЛНАЯ ПРОГРАММА)
  // =========================================================================
  {
    id: 'p9_newton_freefall_gravity',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Laws of Motion & Mechanics', ru: 'Законы движения и взаимодействия' },
    title: { en: 'Newton\'s Laws & Galileo\'s Vacuum Freefall', ru: 'Законы Ньютона, ускорение свободного падения (g = 9.8 м/с²)' },
    subtitle: { en: 'Why a bowling ball and a feather drop at the exact same rate in vacuum', ru: 'Почему в вакууме пушинка и тяжелая свинцовая гиря падают с одной скоростью' },
    textbookDefinition: {
      en: 'In vacuum, all bodies fall with identical gravitational acceleration g = 9.8 m/s², regardless of mass, because inertial mass equals gravitational mass: m·a = G(M·m)/R² => a = g.',
      ru: 'В вакууме все тела независимо от массы падают с одинаковым ускорением свободного падения g = 9.8 м/с², поскольку гравитационная масса строго равна инертной массе.'
    },
    studentConfusion: {
      en: 'Why doesn’t the heavy ball drop faster? Earth pulls it with more force (mg), but it has proportionally more inertia resisting acceleration, so a = F/m = g!',
      ru: '«Тяжелый шар Земля притягивает сильнее?» Да, но у него ровно во столько же раз больше инертность, мешающая разгону. Масса m сокращается!'
    },
    lifeAnalogy: {
      en: 'Apollo 15 on the Moon: astronaut David Scott dropped a falcon feather and a hammer simultaneously; they hit the lunar dust at the exact same instant.',
      ru: 'Эксперимент на Луне: астронавт одновременно отпустил молоток и соколиное перо в безвоздушном пространстве — они коснулись пыли секунда в секунду!'
    },
    momentObservation: {
      en: 'Switch on Vacuum Chamber: watch the feather and steel anvil drop in perfect synchronization side-by-side!',
      ru: 'Включи откачку воздуха: перо и пудовая гиря падают плечом к плечу с единым ускорением свободного падения!'
    },
    formula: 'F = m a, \\quad g = G \\frac{M_{\\text{Земли}}}{R^2} \\approx 9.8 \\text{ м/с}^2',
    viewMode: 'moment_collision',
    simEngineType: 'newton_laws_freefall',
    keywords: ['newton', 'freefall', 'gravity', 'ньютон', 'свободное падение', 'тяжесть', 'ускорение']
  },
  {
    id: 'p9_circular_satellites',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Laws of Motion & Mechanics', ru: 'Законы движения и взаимодействия' },
    title: { en: 'Circular Motion & 1st Cosmic Velocity (7.9 km/s)', ru: 'Движение по окружности и искусственные спутники Земли' },
    subtitle: { en: 'Why satellites never hit Earth: they are constantly falling past the horizon', ru: 'Почему спутники не падают на Землю: они падают мимо горизонта' },
    textbookDefinition: {
      en: 'A satellite in circular orbit experiences centripetal acceleration provided entirely by gravity: v₁ = √(G·M/R) ≈ 7.9 km/s for low Earth orbit.',
      ru: 'Первая космическая скорость — скорость, которую необходимо придать телу, чтобы оно вышло на круговую орбиту спутника Земли: v₁ = √(GM/R) = 7.9 км/с.'
    },
    studentConfusion: {
      en: 'Is there zero gravity on the ISS? No! Gravity on the ISS is 90% of Earth’s surface; the astronauts float because they and the station are in perpetual free fall!',
      ru: 'На МКС нет гравитации? Гравитация на высоте орбиты составляет 90% от земной! Космонавты парят, потому что вместе со станцией непрерывно падают мимо кривизны Земли!'
    },
    lifeAnalogy: {
      en: 'Newton\'s Cannon on a mountain: shoot a cannonball faster and faster; at 7.9 km/s the ball\'s trajectory curves at the exact same rate as the spherical Earth curves beneath it.',
      ru: 'Пушка Ньютона на высокой горе: стреляй из пушки все быстрее. При 7.9 км/с ядро за каждую секунду опускается на 5 метров, но Земля под ним искривляется ровно на те же 5 метров!'
    },
    momentObservation: {
      en: 'Launch satellite at 7.9 km/s: watch the orbit lock into a stable circular track around planet Earth!',
      ru: 'Запусти спутник со скоростью 7.9 км/с: снаряд замкнется на устойчивую круговую орбиту, бесконечно огибая планету!'
    },
    formula: 'v_1 = \\sqrt{\\frac{GM}{R}} \\approx 7.9 \\text{ км/с}, \\quad a_n = \\frac{v^2}{R}',
    viewMode: 'physics_gravity',
    simEngineType: 'circular_orbit_satellites',
    keywords: ['satellite', 'cosmic', 'orbit', 'gravity', 'спутник', 'космическая скорость', 'орбита']
  },
  {
    id: 'p9_momentum_rocket',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Laws of Motion & Mechanics', ru: 'Законы движения и взаимодействия' },
    title: { en: 'Law of Conservation of Momentum & Rocket Propulsion', ru: 'Закон сохранения импульса и реактивное движение ракет' },
    subtitle: { en: 'How rockets accelerate in deep empty space where there is nothing to push against', ru: 'От чего отталкивается ракета в пустом космосе, где нет воздуха' },
    textbookDefinition: {
      en: 'In a closed system, total momentum remains constant: m₁v₁ + m₂v₂ = const. Rocket propulsion is driven by high-speed ejection of exhaust gas momentum.',
      ru: 'Закон сохранения импульса: в замкнутой системе векторная сумма импульсов всех тел сохраняется постоянной: m_ракеты · v_ракеты = - m_газа · v_газа.'
    },
    studentConfusion: {
      en: 'Students think rockets push against air. In reality, a rocket accelerates even faster in vacuum because there is zero air resistance!',
      ru: '«Ракета отталкивается от воздуха?» Нет! Ракета отталкивается от СВОИХ СОБСТВЕННЫХ выхлопных газов, выбрасываемых из сопла с бешеной скоростью!'
    },
    lifeAnalogy: {
      en: 'Standing on a frictionless skateboard and throwing a 10 kg medicine ball forward: throwing the ball pushes you flying backwards.',
      ru: 'Стоя на роликах, бросить вперед тяжелый камень: камень летит вперед, а ты с силой откатываешься назад.'
    },
    momentObservation: {
      en: 'Hit rocket ignition: watch trillions of burning fuel molecules blast downward, propelling the spacecraft upward into the cosmos!',
      ru: 'Нажми зажигание: тонны горячих газов с ревом вырываются вниз из сопла, разгоняя ракету вверх в открытый космос!'
    },
    formula: 'm_{\\text{р}} \\vec{v}_{\\text{р}} + m_{\\text{г}} \\vec{v}_{\\text{г}} = 0',
    viewMode: 'moment_collision',
    simEngineType: 'momentum_rocket_recoil',
    keywords: ['momentum', 'rocket', 'recoil', 'импульс', 'ракета', 'реактивное движение']
  },
  {
    id: 'p9_nuclear_fission_reactor',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Atomic & Nuclear Physics', ru: 'Строение атома и ядра' },
    title: { en: 'Nuclear Fission of Uranium-235 & Chain Reaction', ru: 'Деление ядер урана, цепная реакция и атомный реактор' },
    subtitle: { en: 'How a single stray neutron splits an atom releasing 200 MeV of energy', ru: 'Как попадание одного нейтрона разрывает ядро урана на осколки с выделением миллионов вольт' },
    textbookDefinition: {
      en: 'When a U-235 nucleus absorbs a slow neutron, it deforms into an unstable compound nucleus, splitting into two fission fragments and releasing 2-3 neutrons plus ~200 MeV of energy.',
      ru: 'Деление ядра урана-235 происходит при захвате теплового нейтрона: ядро раскалывается на два радиоактивных осколка (барием и криптоном), высвобождая 2-3 нейтрона и колоссальную энергию связи.'
    },
    studentConfusion: {
      en: 'Why is atomic energy so vastly greater than chemical burning? Nuclear forces are millions of times stronger than chemical electron bonds!',
      ru: 'Почему 1 таблетка урана заменяет эшелон угля? Потому что ядерные силы связи протонов в миллион раз мощнее химических связей электронов!'
    },
    lifeAnalogy: {
      en: 'A room filled with mousetraps, each loaded with two ping-pong balls: drop one ball in, and thousands trigger in a cascading chain reaction!',
      ru: 'Комната, пол которой уставлен мышеловками с шариками для пинг-понга: брось один шарик — и комната взорвется цепным шквалом!'
    },
    momentObservation: {
      en: 'Fire a slow neutron into the Uranium nucleus: watch the nucleus oscillate like a liquid droplet, tear in half, and fling 3 fast neutrons into neighboring atoms!',
      ru: 'Запусти нейтрон в ядро ²³⁵U: капля ядра колеблется, рвется пополам и выстреливает 3 нейтрона, порождая цепную реакцию деления!'
    },
    formula: '^{235}_{92}\\text{U} + ^1_0n \\rightarrow ^{144}_{56}\\text{Ba} + ^{89}_{36}\\text{Kr} + 3 ^1_0n + 200 \\text{ МэВ}',
    viewMode: 'moment_universal',
    simEngineType: 'nuclear_fission_reactor',
    keywords: ['fission', 'uranium', 'nuclear', 'chain reaction', 'уран', 'деление', 'цепная реакция', 'ядро']
  },

  // =========================================================================
  // 10 КЛАСС — ФИЗИКА (ПОЛНАЯ ПРОГРАММА)
  // =========================================================================
  {
    id: 'p10_mkt_ideal_gas_laws',
    grade: 'grade_10',
    category: 'physics',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Molecular Physics & Gases', ru: 'Молекулярная физика' },
    title: { en: 'Mendeleev–Clapeyron Equation & Isoprocesses', ru: 'Уравнение Менделеева–Клапейрона и изопроцессы (pV = νRT)' },
    subtitle: { en: 'Isothermal (Boyle-Mariotte), Isobaric (Gay-Lussac), and Isochoric (Charles)', ru: 'Изотермический, изобарный и изохорный процессы в газах' },
    textbookDefinition: {
      en: 'State of an ideal gas is described by pV = (m/M)RT. An isoprocess is a thermodynamic process in which one parameter remains strictly constant: T=const, p=const, or V=const.',
      ru: 'Уравнение состояния идеального газа связывает давление, объем и температуру: pV = (m/M)RT = νRT. Изопроцессы — термодинамические процессы при одном постоянном параметре.'
    },
    studentConfusion: {
      en: 'What is absolute zero (-273.15°C)? It is the temperature where molecular thermal kinetic motion stops completely; pressure drops to absolute zero!',
      ru: 'Что такое абсолютный ноль (0 К = -273.15°C)? Это точка, где тепловое движение молекул замирает полностью — давление падает до абсолютного нуля!'
    },
    lifeAnalogy: {
      en: 'Inflating a basketball in a heated room and leaving it outside in freezing winter: the ball shrinks and softens because cold gas molecules strike the walls with less velocity.',
      ru: 'Накачать баскетбольный мяч в теплой квартире и вынести на мороз: мяч сдуется и станет мягким, потому что замерзшие молекулы бьют о стенки слабее!'
    },
    momentObservation: {
      en: 'Compress piston at constant Temperature: watch pressure double on the gauge as the volume is cut in half along the hyperbolic isotherm!',
      ru: 'Сжимай поршень при T=const: смотри, как уменьшение объема в 2 раза приводит к удвоению давления на манометре строго по гиперболе Бойля–Мариотта!'
    },
    formula: 'p V = \\nu R T, \\quad p_1 V_1 = p_2 V_2 \\; (T = \\text{const})',
    viewMode: 'moment_universal',
    simEngineType: 'mkt_ideal_gas_laws',
    keywords: ['gas', 'mendeleev', 'isotherm', 'isobar', 'газ', 'менделеев', 'изопроцессы', 'давление']
  },
  {
    id: 'p10_thermodynamics_first_law',
    grade: 'grade_10',
    category: 'physics',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Thermodynamics', ru: 'Термодинамика' },
    title: { en: 'First Law of Thermodynamics & Carnot Cycle', ru: 'Первый закон термодинамики и цикл Карно (Q = ΔU + A)' },
    subtitle: { en: 'Why perpetual motion machines of the first and second kind are mathematically impossible', ru: 'Почему невозможно создать вечный двигатель' },
    textbookDefinition: {
      en: 'The first law of thermodynamics states: Q = ΔU + A, where heat supplied goes into changing internal energy and work done by gas. Carnot cycle yields maximum theoretical efficiency: η = 1 - T₂/T₁.',
      ru: 'Первый закон термодинамики: количество теплоты, переданное системе, идет на изменение её внутренней энергии и на совершение системой работы: Q = ΔU + A. Цикл Карно дает максимальный КПД: η = (T₁ - T₂)/T₁.'
    },
    studentConfusion: {
      en: 'What is an adiabatic process? A process with zero heat exchange with the outside (Q=0), like aerosol spraying cooling the can instantly!',
      ru: 'Что такое адиабатный процесс? Процесс без теплообмена (Q=0). Когда ты нажимаешь баллончик с дезодорантом, газ расширяется за счет внутренней энергии и баллон мгновенно леденеет!'
    },
    lifeAnalogy: {
      en: 'Your monthly salary budget: Income (Q) = Money saved in bank (ΔU) + Money spent on goods (Work A). You cannot spend what you didn\'t earn!',
      ru: 'Твой бюджет: Зарплата (Q) = то, что отложил в копилку (ΔU) + то, что потратил на покупки (Работа A). Нельзя совершить работу без источника тепла!'
    },
    momentObservation: {
      en: 'Trace the 4 curves of the Carnot cycle in P-V coordinates: watch heat flow in from Hot Reservoir T₁ and exhaust into Cold Sink T₂!',
      ru: 'Пройди цикл Карно на P-V диаграмме: увидишь, как газ берет тепло у нагревателя T₁, совершает полезную работу в виде площади петли и отдает Q₂ холодильнику!'
    },
    formula: 'Q = \\Delta U + A, \\quad \\eta_{\\text{Карно}} = \\frac{T_1 - T_2}{T_1}',
    viewMode: 'moment_universal',
    simEngineType: 'thermodynamics_first_law',
    keywords: ['thermodynamics', 'carnot', 'work', 'energy', 'термодинамика', 'карно', 'первый закон', 'работа газа']
  },
  {
    id: 'p10_capacitors_coulomb',
    grade: 'grade_10',
    category: 'physics',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Electrostatics', ru: 'Электростатика' },
    title: { en: 'Coulomb\'s Law, Electric Potential & Capacitors', ru: 'Закон Кулона, потенциал и энергия плоского конденсатора' },
    subtitle: { en: 'How capacitors store electrostatic energy in smartphone flashes and defibrillators', ru: 'Как конденсаторы накапливают энергию в фотовспышках и дефибрилляторах' },
    textbookDefinition: {
      en: 'Capacitance measures stored electric charge per unit potential difference: C = ε·ε₀·S / d. The energy stored in the electric field is W = (C·U²) / 2.',
      ru: 'Электроемкость плоского конденсатора: C = εε₀S / d. Энергия электрического поля заряженного конденсатора: W = CU² / 2.'
    },
    studentConfusion: {
      en: 'Does current flow straight THROUGH a capacitor’s plates? No! An insulator dielectric sits between plates; charges pile up on opposite plates creating an intense electric field!',
      ru: 'Течет ли ток СКВОЗЬ конденсатор? Нет! Между пластинами диэлектрик; электроны накапливаются на одной пластине, создавая электрическое поле огромной плотности!'
    },
    lifeAnalogy: {
      en: 'A flexible rubber diaphragm across a water pipe: pumping water stretches the membrane; release the valve and it snaps back discharging all energy in a millisecond.',
      ru: 'Резиновая мембрана в трубе с водой: насос натягивает резину, накапливая упругую энергию. Открываешь клапан — и мембрана мгновенно выплескивает накопленную мощь (как фотовспышка)!'
    },
    momentObservation: {
      en: 'Pull capacitor plates closer together (decrease d): watch capacitance C spike up and electric field lines become intensely dense!',
      ru: 'Сближай обкладки конденсатора: уменьшение расстояния d взвинчивает емкость C, а поле между пластинами накапливает колоссальную энергию!'
    },
    formula: 'F = k \\frac{|q_1 q_2|}{r^2}, \\quad C = \\frac{\\varepsilon \\varepsilon_0 S}{d}, \\quad W = \\frac{C U^2}{2}',
    viewMode: 'moment_universal',
    simEngineType: 'coulomb_capacitors',
    keywords: ['coulomb', 'capacitor', 'potential', 'кулон', 'конденсатор', 'емкость', 'электростатика']
  },

  // =========================================================================
  // 11 КЛАСС — ФИЗИКА (ПОЛНАЯ ПРОГРАММА)
  // =========================================================================
  {
    id: 'p11_lorentz_force_cyclotron',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Magnetic Field & Electrodynamics', ru: 'Магнитное поле и электродинамика' },
    title: { en: 'Lorentz Force & Charged Particle Deflection', ru: 'Сила Лоренца: Движение заряда в магнитном поле' },
    subtitle: { en: 'How Earth\'s magnetic field deflects solar wind causing Northern Lights', ru: 'Почему электроны закручиваются в кольца и как рождаются полярные сияния' },
    textbookDefinition: {
      en: 'The Lorentz force acts on a moving electric charge in a magnetic field: F_L = q · v · B · sin(α). Because it is perpendicular to velocity, it does zero work and acts as centripetal force: R = mv / (qB).',
      ru: 'Сила Лоренца действует на движущийся заряд в магнитном поле: F_Л = qvB sin α. Поскольку сила Лоренца всегда перпендикулярна скорости, она не совершает работы, а искривляет траекторию заряда по окружности радиуса R = mv / (qB).'
    },
    studentConfusion: {
      en: 'Can a magnetic field speed up an electron? Never! The magnetic Lorentz force only bends the direction; it can never change the kinetic energy or scalar speed of a charge!',
      ru: 'Может ли магнитное поле ускорить электрон по величине? Никогда! Сила Лоренца направлена строго под 90° к скорости — она меняет ТОЛЬКО направление полета, закручивая в спираль!'
    },
    lifeAnalogy: {
      en: 'Whirling a ball tied to a string: the string tension pulls inward at 90°, steering the ball in circles without speeding it up.',
      ru: 'Шарик на веревке, который ты крутишь над головой: веревка тянет строго вбок, заставляя шарик кружить по кругу, но не меняя модуль скорости.'
    },
    momentObservation: {
      en: 'Shoot an electron into a perpendicular magnetic field: watch the Lorentz force twist its straight path into a glowing cyclotron circle of radius R!',
      ru: 'Впусти электрон в магнитное поле: сила Лоренца скручивает прямую линию в светящуюся циклотронную окружность радиусом R = mv / (qB)!'
    },
    formula: 'F_L = q v B \\sin\\alpha, \\quad R = \\frac{m v}{q B}',
    viewMode: 'moment_universal',
    simEngineType: 'lorentz_ampere_force',
    keywords: ['lorentz', 'magnetic', 'charge', 'cyclotron', 'лоренц', 'магнитное поле', 'заряд', 'циклотрон']
  },
  {
    id: 'p11_thomson_lc_circuit',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Oscillations & Waves', ru: 'Колебания и волны' },
    title: { en: 'LC Oscillating Tank Circuit & Thomson Formula', ru: 'Колебательный контур и формула Томсона (T = 2π√LC)' },
    subtitle: { en: 'Exchange of electric energy in capacitor and magnetic energy in coil', ru: 'Перекачка электрической энергии конденсатора в магнитное поле катушки' },
    textbookDefinition: {
      en: 'An LC circuit consists of an inductor L and capacitor C. Electric oscillations occur with natural period T = 2π√(LC), continually exchanging energy: CU²/2 ↔ LI²/2.',
      ru: 'Колебательный контур — цепь из конденсатора C и катушки индуктивности L. Период свободных электромагнитных колебаний определяется формулой Томсона: T = 2π√(LC).'
    },
    studentConfusion: {
      en: 'Why doesn’t the current stop when capacitor voltage drops to zero? The coil\'s self-induction opposes current change, forcing charges to keep flowing!',
      ru: 'Почему ток не останавливается, когда конденсатор разрядился в ноль? Катушка индуктивности обладает электрической «инерцией» (самоиндукция) — ток продолжает течь по инерции!'
    },
    lifeAnalogy: {
      en: 'A child on a playground swing: high point = fully charged capacitor (100% potential); lowest point with max speed = max coil current (100% magnetic).',
      ru: 'Качели: в верхней точке скорость ноль (вся энергия в заряде конденсатора CU²/2). В нижней точке высота ноль, а скорость бешеная (ток катушки LI²/2)!'
    },
    momentObservation: {
      en: 'Watch the dual energy gauges oscillate in antiphase: as capacitor voltage zeroes out, inductor current surges to peak, driving RF oscillations!',
      ru: 'Следи за индикаторами энергии: конденсатор разряжается в ноль — в этот миг ток в катушке бьет в максимум, генерируя радиоволну!'
    },
    formula: 'T = 2\\pi \\sqrt{L C}, \\quad W_{\\text{полн}} = \\frac{C U^2}{2} + \\frac{L I^2}{2} = \\text{const}',
    viewMode: 'moment_universal',
    simEngineType: 'lc_circuit_thomson',
    keywords: ['lc circuit', 'thomson', 'frequency', 'inductor', 'колебательный контур', 'томсон', 'индуктивность', 'радио']
  },
  {
    id: 'p11_wave_optics_diffraction',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Wave Optics', ru: 'Волновая оптика' },
    title: { en: 'Wave Optics: Interference & Diffraction Grating', ru: 'Волновая оптика: Интерференция и дифракционная решетка' },
    subtitle: { en: 'Why butterfly wings and CDs shimmer with iridescent rainbow colors', ru: 'Почему крылья бабочек и CD-диски переливаются всеми цветами радуги' },
    textbookDefinition: {
      en: 'Interference is the superposition of coherent waves producing alternating dark and bright fringes. Diffraction grating conditions for principal maxima: d · sin(φ) = k · λ.',
      ru: 'Интерференция — наложение когерентных световых волн с перераспределением интенсивности в пространстве. Дифракционная решетка: d · sin(φ) = k · λ.'
    },
    studentConfusion: {
      en: 'Can light + light equal complete darkness? Yes! When two identical wave peaks meet troughs in destructive interference, they cancel out into pitch black!',
      ru: 'Может ли свет плюс свет дать полную темноту? Да! Если гребень одной световой волны накладывается на впадину другой, они взаимно гасят друг друга в ноль!'
    },
    lifeAnalogy: {
      en: 'Two stones dropped into a calm pond: where their circular ripples meet, tall waves double in height while flat spots cancel into smooth water.',
      ru: 'Два камня, брошенные в тихий пруд: там, где гребни волн встречаются, вырастают двойные волны, а там, где гребень встречает впадину — вода абсолютно гладкая!'
    },
    momentObservation: {
      en: 'Shine red laser through double slits: watch alternating bright interference stripes and dark cancellation bands appear on the screen!',
      ru: 'Пропусти лазерный луч через дифракционную решетку: на экране вспыхнет ряд ярких спектральных максимумов d·sin φ = kλ!'
    },
    formula: 'd \\sin\\varphi = k \\lambda, \\quad \\Delta d = k \\lambda \\; (\\text{max})',
    viewMode: 'moment_universal',
    simEngineType: 'wave_interference_diffraction',
    keywords: ['interference', 'diffraction', 'coherent', 'интерференция', 'дифракция', 'длина волны', 'решетка']
  },
  {
    id: 'p11_photoelectric_quanta',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Quantum Physics', ru: 'Квантовая физика' },
    title: { en: 'Photoelectric Effect & Einstein\'s Photons (hν = A + Ek)', ru: 'Фотоэффект и кванты света Эйнштейна (hν = A + E_кин)' },
    subtitle: { en: 'Why dim blue light knocks out electrons while blinding red light does nothing', ru: 'Почему тусклый синий луч выбивает ток, а слепящий красный прожектор бессилен' },
    textbookDefinition: {
      en: 'Einstein’s photoelectric equation states that a single photon of energy hν imparts its energy to one electron: hν = A_work + (mv²)/2. Below threshold frequency ν₀, no emission occurs.',
      ru: 'Уравнение Эйнштейна для фотоэффекта: энергия поглощенного кванта света идет на совершение работы выхода электрона и сообщение ему кинетической энергии: hν = A_вых + mv²/2.'
    },
    studentConfusion: {
      en: 'Classical physics thought brighter light should pump more energy. But energy depends ONLY on frequency ν (color), not beam brightness!',
      ru: 'Классическая физика думала: сделаем красный свет ярче — электроны вылетят. Но квант неделим: если частота кванта меньше работы выхода, даже триллион фотонов бессильны!'
    },
    lifeAnalogy: {
      en: 'Vending machine requiring a 50-cent coin: throwing in 1,000 1-cent pennies does not unlock the snack; you need the exact quantum denomination coin.',
      ru: 'Торговый автомат, принимающий монету в 50 рублей: можно кинуть 1000 жеваных бумажек по 1 рублю — автомат не откроется. Нужна именно одна полновесная монета hν!'
    },
    momentObservation: {
      en: 'Dial photon wavelength from red to UV: watch the exact moment electrons break free and fly upward when energy exceeds work function A!',
      ru: 'Переведи ползунок из красной зоны в ультрафиолет: в момент превышения работы выхода A металл начинает испускать поток летящих фотоэлектронов!'
    },
    formula: 'h \\nu = A_{\\text{вых}} + \\frac{m v^2}{2}, \\quad \\nu_0 = \\frac{A_{\\text{вых}}}{h}',
    viewMode: 'moment_universal',
    simEngineType: 'photoelectric_effect',
    keywords: ['photoelectric', 'photon', 'einstein', 'quanta', 'фотоэффект', 'фотон', 'эйнштейн', 'квант']
  },
  {
    id: 'p11_radioactive_decay',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Nuclear Physics', ru: 'Ядерная физика' },
    title: { en: 'Radioactive Decay Law & Half-Life (T₁/₂)', ru: 'Закон радиоактивного распада и период полураспада (T₁/₂)' },
    subtitle: { en: 'How carbon-14 dating accurately determines the age of dinosaur bones', ru: 'Как радиоуглеродный анализ определяет возраст древнейших артефактов' },
    textbookDefinition: {
      en: 'The law of radioactive decay describes the statistical decay of unstable atomic nuclei: N(t) = N₀ · 2^(-t / T₁/₂), where T₁/₂ is half-life.',
      ru: 'Закон радиоактивного распада: за период полураспада T₁/₂ распадается ровно половина первоначального числа радиоактивных ядер: N(t) = N₀ · 2^(-t / T₁/₂).'
    },
    studentConfusion: {
      en: 'Can we predict when a specific individual atom will decay? Never! Quantum decay is strictly probabilistic; only the statistical half of the population is predictable.',
      ru: 'Можно ли узнать, в какую секунду распадется конкретный атом? Нет! Распад случаен, но статистика миллиардов атомов подчиняется строжайшей экспоненте!'
    },
    lifeAnalogy: {
      en: 'Flipping 1,000 coins: remove every coin that lands Tails. After 1 flip, ~500 remain; after 2 flips, ~250 remain; after 3 flips, ~125 remain.',
      ru: 'Бросание 1000 монеток: убери все, что выпали решкой. После 1-го броска останется 500, после 2-го — 250, после 3-го — 125. Период полураспада равен ровно 1 броску!'
    },
    momentObservation: {
      en: 'Fast-forward time steps of T₁/₂: watch the glowing parent isotope count drop by half at each interval, carving the exact exponential curve!',
      ru: 'Перематывай время шагами периода T₁/₂: наблюдай, как число светящихся ядер уменьшается ровно вдвое каждый интервал!'
    },
    formula: 'N(t) = N_0 \\cdot 2^{-\\frac{t}{T_{1/2}}} = N_0 e^{-\\lambda t}',
    viewMode: 'moment_universal',
    simEngineType: 'radioactive_decay_halflife',
    keywords: ['radioactivity', 'halflife', 'decay', 'радиоактивность', 'полураспад', 'изотоп', 'распад']
  },
  {
    id: 'p11_stellar_evolution_universe',
    grade: 'grade_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Astrophysics & Universe', ru: 'Астрофизика и Вселенная' },
    title: { en: 'Stellar Evolution & Hertzsprung–Russell Diagram', ru: 'Эволюция звёзд и диаграмма Герцшпрунга–Рассела' },
    subtitle: { en: 'From protostar nebula to Main Sequence, Red Giant, and Supernova Black Hole', ru: 'От газового облака к Солнцу, красному гиганту и черной дыре' },
    textbookDefinition: {
      en: 'The Hertzsprung–Russell diagram plots stellar luminosity versus spectral temperature. A star’s mass dictates its life cycle: low mass ends as white dwarf, high mass undergoes core-collapse supernova into neutron star or black hole.',
      ru: 'Диаграмма Герцшпрунга–Рассела связывает светимость и температуру звезд. Звезды проводят 90% жизни на Главной последовательности, сжигая водород в гелий, после чего превращаются в красных гигантов, белых карликов или взрываются сверхновыми.'
    },
    studentConfusion: {
      en: 'Why do massive stars live SHORTER lives even though they have way more fuel? Because immense gravitational pressure burns fuel millions of times faster!',
      ru: 'Почему гигантские звезды живут всего миллионы лет, а карлики — триллионы? Потому что чудовищная гравитация гиганта сжигает водород в миллионы раз яростнее!'
    },
    lifeAnalogy: {
      en: 'A campfire vs a stick of dynamite: both contain chemical fuel, but dynamite consumes all its energy in a millisecond blast.',
      ru: 'Тлеющий костер из толстого бревна (горит всю ночь — карлик) и бочка с бензином (сгорает в ослепительной вспышке за 3 секунды — сверхновая).'
    },
    momentObservation: {
      en: 'Trace the lifecycle track on the HR diagram: watch our Sun swell into a red giant engulfing inner planets, then gently puff off into a glowing white dwarf!',
      ru: 'Отследи трек на диаграмме Герцшпрунга–Рассела: посмотри, как через 5 млрд лет Солнце раздуется в красного гиганта, а затем сожмется в белый карлик!'
    },
    formula: 'L = 4\\pi R^2 \\sigma T^4, \\quad v = H \\cdot r',
    viewMode: 'moment_universal',
    simEngineType: 'stellar_evolution_hr',
    keywords: ['astrophysics', 'stars', 'hertzsprung', 'supernova', 'астрофизика', 'звезды', 'герцшпрунг', 'сверхновая']
  }
];
