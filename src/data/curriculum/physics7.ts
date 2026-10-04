import { section } from './types';

const P = 'physics';

export const PHYSICS_7 = [
  section(P, 7, 'intro', ['Введение', 'Introduction'], [
    {
      id: 'p7-what-physics',
      title: ['Что изучает физика', 'What physics studies'],
      intro: [
        'Физика — наука о самых общих законах природы: как движутся тела, откуда берётся тепло, почему светит лампа и звучит струна. На этих законах держится вся техника вокруг нас.',
        'Physics is the science of nature’s most general laws: how bodies move, where heat comes from, why a lamp glows and a string sounds. All the technology around us rests on these laws.',
      ],
      points: [
        ['Механические явления', 'Mechanical phenomena', 'Движение и взаимодействие тел: падение яблока, полёт мяча, качание маятника.', 'Motion and interaction of bodies: a falling apple, a flying ball, a swinging pendulum.'],
        ['Тепловые явления', 'Thermal phenomena', 'Нагревание, охлаждение, плавление, кипение. Их причина — движение молекул.', 'Heating, cooling, melting, boiling. They all come from the motion of molecules.'],
        ['Электрические и магнитные явления', 'Electric and magnetic phenomena', 'Молния, ток в проводах, притяжение магнита. Их объединяет электрический заряд.', 'Lightning, current in wires, a magnet’s pull. Electric charge links them all.'],
        ['Световые и звуковые явления', 'Light and sound', 'Отражение в зеркале, радуга, эхо. Свет и звук — это волны.', 'Mirror reflections, rainbows, echoes. Light and sound are waves.'],
        ['Физика и техника', 'Physics and technology', 'Двигатель, телефон, холодильник, спутник — каждое устройство придумано на основе открытого физического закона.', 'Engines, phones, fridges, satellites: each device grew out of a discovered physical law.'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'p7-methods',
      title: ['Методы физики', 'Methods of physics'],
      intro: [
        'Физик не верит на слово. Он наблюдает, выдвигает догадку, проверяет её опытом и только потом строит теорию, которая предсказывает новое.',
        'A physicist takes nothing on faith. They observe, make a guess, test it by experiment, and only then build a theory that predicts something new.',
      ],
      points: [
        ['Наблюдение', 'Observation', 'Внимательно смотрим на явление в природе, ничего не меняя. Например, замечаем, что тяжёлые и лёгкие тела падают почти одинаково.', 'We watch a phenomenon without changing anything, e.g. noticing heavy and light bodies fall almost the same way.'],
        ['Опыт (эксперимент)', 'Experiment', 'Создаём условия специально и меняем по одному параметру, чтобы понять, от чего зависит результат.', 'We set up conditions on purpose and change one thing at a time to see what the result depends on.'],
        ['Гипотеза', 'Hypothesis', 'Научная догадка, которую можно проверить опытом и, возможно, опровергнуть.', 'A scientific guess that experiment can test and possibly disprove.'],
        ['Теория', 'Theory', 'Система законов, которая объясняет множество фактов и предсказывает новые. Теорию принимают, пока опыт её не опроверг.', 'A system of laws that explains many facts and predicts new ones. It stands until an experiment disproves it.'],
      ],
    },
    {
      id: 'p7-quantities',
      title: ['Физические величины и единицы', 'Physical quantities and units'],
      intro: [
        'Чтобы сравнивать и вычислять, свойства тел выражают числом с единицей измерения. Учёные всего мира договорились о единой системе СИ.',
        'To compare and calculate, we express properties as a number with a unit. Scientists worldwide agreed on one system, the SI.',
      ],
      points: [
        ['Физическая величина', 'Physical quantity', 'Свойство, которое можно измерить: длина, масса, время, температура. Записывается как число и единица: 5 м.', 'A measurable property: length, mass, time, temperature. Written as number plus unit: 5 m.'],
        ['Система СИ', 'The SI system', 'Основные единицы: метр (длина), килограмм (масса), секунда (время), кельвин (температура), ампер (сила тока).', 'Base units: metre (length), kilogram (mass), second (time), kelvin (temperature), ampere (current).'],
        ['Кратные приставки', 'Multiplying prefixes', 'кило- = 1000, мега- = 1 000 000. Например, 3 км = 3000 м.', 'kilo- = 1000, mega- = 1,000,000. For example, 3 km = 3000 m.'],
        ['Дольные приставки', 'Dividing prefixes', 'милли- = 0,001, микро- = 0,000 001. Например, 5 мм = 0,005 м.', 'milli- = 0.001, micro- = 0.000001. For example, 5 mm = 0.005 m.'],
      ],
    },
    {
      id: 'p7-measurement',
      title: ['Измерения и погрешность', 'Measurement and error'],
      intro: [
        'Любое измерение неточно. Важно уметь найти цену деления прибора и честно указать, насколько мы можем ошибиться.',
        'Every measurement is imprecise. The key is to find an instrument’s scale division and honestly state how far off we might be.',
      ],
      points: [
        ['Измерительные приборы', 'Measuring instruments', 'Линейка, мензурка, термометр, секундомер. У каждого есть шкала и пределы измерения.', 'Ruler, measuring cylinder, thermometer, stopwatch. Each has a scale and a range.'],
        ['Цена деления', 'Scale division', 'Берём два соседних подписанных штриха, вычитаем их значения и делим на число промежутков между ними.', 'Take two neighbouring labelled marks, subtract their values and divide by the number of gaps between them.'],
        ['Погрешность измерения', 'Measurement error', 'Обычно равна половине цены деления. Результат пишут так: L = (12,5 ± 0,5) см.', 'Usually half a scale division. Write the result as L = (12.5 ± 0.5) cm.'],
        ['Точность', 'Precision', 'Чем меньше цена деления, тем точнее прибор. Поэтому толщину волоса меряют микрометром, а не линейкой.', 'The smaller the division, the more precise the instrument. That’s why hair is measured with a micrometer, not a ruler.'],
      ],
      formula: 'C = \\frac{a - b}{n}, \\quad \\Delta = \\frac{C}{2}',
      sim: { engine: 'measurement_error' },
    },
  ]),

  section(P, 7, 'matter', ['Первоначальные сведения о строении вещества', 'Structure of matter'], [
    {
      id: 'p7-molecules',
      title: ['Молекулы и атомы', 'Molecules and atoms'],
      intro: [
        'Все вещества состоят из крошечных частиц — молекул, а молекулы из атомов. Между ними есть промежутки, поэтому тела сжимаются и расширяются.',
        'All substances are made of tiny particles, molecules, which are built from atoms. There are gaps between them, so bodies can shrink and expand.',
      ],
      points: [
        ['Размеры молекул', 'Size of molecules', 'Молекула воды примерно в 3·10⁻¹⁰ м. Если увеличить яблоко до размеров Земли, молекулы станут размером с яблоко.', 'A water molecule is about 3·10⁻¹⁰ m. Blow an apple up to Earth’s size and its molecules would be apple-sized.'],
        ['Атомы', 'Atoms', 'Мельчайшие частицы химического элемента. Молекула воды — два атома водорода и один атом кислорода.', 'The smallest particles of an element. A water molecule is two hydrogen atoms and one oxygen atom.'],
        ['Промежутки между молекулами', 'Gaps between molecules', 'Поэтому рельсы удлиняются на жаре, а спирт с водой при смешивании дают меньший объём, чем сумма.', 'That’s why rails grow longer in heat and alcohol plus water gives less volume than the sum.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'p7-diffusion',
      title: ['Движение молекул. Диффузия', 'Molecular motion. Diffusion'],
      intro: [
        'Молекулы непрерывно и беспорядочно движутся. Поэтому вещества сами перемешиваются — это диффузия. Чем горячее, тем быстрее.',
        'Molecules move constantly and randomly, so substances mix on their own. That’s diffusion, and it speeds up with heat.',
      ],
      points: [
        ['Диффузия в газах', 'Diffusion in gases', 'Запах духов за минуты расходится по комнате: молекулы газа летят быстро и далеко друг от друга.', 'Perfume fills a room in minutes: gas molecules are fast and far apart.'],
        ['Диффузия в жидкостях', 'Diffusion in liquids', 'Капля чернил окрашивает стакан воды за часы — молекулы жидкости плотнее и сталкиваются чаще.', 'An ink drop colours a glass of water in hours: liquid molecules are packed tighter and collide more.'],
        ['Диффузия в твёрдых телах', 'Diffusion in solids', 'Идёт годами: прижатые пластины золота и свинца за 5 лет проникают друг в друга на миллиметр.', 'Takes years: gold and lead plates pressed together mingle by about a millimetre in 5 years.'],
        ['Зависимость от температуры', 'Effect of temperature', 'Чай в кипятке заваривается за секунды, в холодной воде — часами: при нагреве молекулы движутся быстрее.', 'Tea brews in seconds in boiling water and in hours in cold: hot molecules move faster.'],
        ['Броуновское движение', 'Brownian motion', 'Крупинки краски в воде хаотично дёргаются, потому что их со всех сторон толкают невидимые молекулы.', 'Paint grains in water jiggle randomly because invisible molecules hit them from every side.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'p7-interaction',
      title: ['Взаимодействие молекул', 'Molecular forces'],
      intro: [
        'Молекулы одновременно притягиваются и отталкиваются. На близком расстоянии побеждает отталкивание, чуть дальше — притяжение. Поэтому тела не рассыпаются и не сжимаются в точку.',
        'Molecules attract and repel at the same time. Very close, repulsion wins; a bit further, attraction. That’s why bodies neither fall apart nor collapse.',
      ],
      points: [
        ['Притяжение', 'Attraction', 'Два гладких свинцовых цилиндра, прижатые срезами, слипаются так, что держат гирю.', 'Two smooth lead cylinders pressed together stick hard enough to hold a weight.'],
        ['Отталкивание', 'Repulsion', 'Жидкости и твёрдые тела почти невозможно сжать: молекулы отталкиваются при сближении.', 'Liquids and solids are almost incompressible: molecules repel when pushed closer.'],
        ['Смачивание', 'Wetting', 'Если молекулы жидкости сильнее притягиваются к поверхности, чем друг к другу, капля растекается (вода на стекле). Если слабее — собирается в шарик (вода на жирной коже).', 'If liquid molecules cling to a surface more than to each other, a drop spreads (water on glass); if less, it beads up (water on greasy skin).'],
        ['Капиллярность', 'Capillarity', 'Смачивающая жидкость поднимается по узким трубкам. Так вода идёт вверх по салфетке и по стеблю растения.', 'A wetting liquid climbs narrow tubes, which is how water rises up a napkin or a plant stem.'],
      ],
    },
    {
      id: 'p7-three-states',
      title: ['Три состояния вещества', 'Three states of matter'],
      intro: [
        'Одно и то же вещество бывает твёрдым, жидким и газообразным. Молекулы при этом одинаковые — меняется только их расположение и движение.',
        'The same substance can be solid, liquid or gas. The molecules stay the same; only their arrangement and motion change.',
      ],
      points: [
        ['Твёрдое тело', 'Solid', 'Молекулы колеблются около мест в кристаллической решётке. Тело сохраняет форму и объём.', 'Molecules vibrate around fixed places in a lattice. The body keeps its shape and volume.'],
        ['Жидкость', 'Liquid', 'Молекулы рядом, но перескакивают с места на место. Сохраняет объём, но принимает форму сосуда.', 'Molecules are close but hop around. It keeps its volume but takes the container’s shape.'],
        ['Газ', 'Gas', 'Молекулы далеко друг от друга и летят свободно. Газ занимает весь предоставленный объём.', 'Molecules are far apart and fly freely. A gas fills whatever volume it’s given.'],
      ],
      sim: { moment: 'moment_states' },
    },
  ]),

  section(P, 7, 'interaction', ['Взаимодействие тел', 'Interaction of bodies'], [
    {
      id: 'p7-motion',
      title: ['Механическое движение', 'Mechanical motion'],
      intro: [
        'Механическое движение — изменение положения тела относительно других тел со временем. Без тела отсчёта нельзя сказать, движется ли что-то.',
        'Mechanical motion is a change of a body’s position relative to other bodies over time. Without a reference body you can’t say whether something moves.',
      ],
      points: [
        ['Траектория и путь', 'Path and distance', 'Траектория — линия, по которой движется тело. Путь — её длина.', 'The trajectory is the line a body follows; the distance is its length.'],
        ['Относительность движения', 'Relativity of motion', 'Пассажир неподвижен относительно вагона, но движется относительно перрона.', 'A passenger is still relative to the carriage but moving relative to the platform.'],
        ['Тело отсчёта', 'Reference body', 'Тело, относительно которого мы описываем движение: Земля, вагон, Солнце.', 'The body we describe motion against: the Earth, a carriage, the Sun.'],
      ],
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p7-speed',
      title: ['Скорость. Равномерное и неравномерное движение', 'Speed. Uniform and non-uniform motion'],
      intro: [
        'Скорость показывает, какой путь тело проходит за единицу времени. Если за равные промежутки путь одинаков — движение равномерное.',
        'Speed tells how much distance a body covers per unit time. If equal distances take equal times, the motion is uniform.',
      ],
      points: [
        ['Равномерное движение', 'Uniform motion', 'Скорость постоянна: эскалатор, поезд на прямом участке.', 'Constant speed: an escalator, a train on a straight stretch.'],
        ['Неравномерное движение', 'Non-uniform motion', 'Скорость меняется: автобус в городе разгоняется и тормозит.', 'Speed changes: a city bus speeds up and brakes.'],
        ['Единицы скорости', 'Units of speed', 'В СИ — м/с. Чтобы перевести км/ч в м/с, делим на 3,6: 72 км/ч = 20 м/с.', 'The SI unit is m/s. To convert km/h to m/s, divide by 3.6: 72 km/h = 20 m/s.'],
        ['Средняя скорость', 'Average speed', 'Весь путь делим на всё время. Это не среднее арифметическое скоростей!', 'Total distance over total time. It is not the average of the speeds!'],
      ],
      formula: 'v = \\frac{s}{t}, \\quad v_{ср} = \\frac{s_{весь}}{t_{всё}}',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p7-distance-time',
      title: ['Расчёт пути и времени. Графики', 'Distance and time. Graphs'],
      intro: [
        'Зная скорость, можно найти путь и время. А график показывает движение целиком — одним взглядом.',
        'Knowing the speed, you can find distance and time. A graph shows the whole motion at a glance.',
      ],
      points: [
        ['Путь и время', 'Distance and time', 's = v·t, t = s/v. Велосипедист со скоростью 5 м/с за 60 с проедет 300 м.', 's = v·t, t = s/v. A cyclist at 5 m/s covers 300 m in 60 s.'],
        ['График пути', 'Distance graph', 'При равномерном движении — прямая из начала координат. Чем круче, тем больше скорость.', 'For uniform motion it’s a straight line from the origin. The steeper, the faster.'],
        ['График скорости', 'Speed graph', 'Горизонтальная линия. Площадь под ней равна пройденному пути.', 'A horizontal line. The area under it equals the distance travelled.'],
      ],
      formula: 's = v t',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p7-inertia',
      title: ['Инерция', 'Inertia'],
      intro: [
        'Тело сохраняет свою скорость, пока на него не подействуют другие тела. Это явление называют инерцией.',
        'A body keeps its velocity until other bodies act on it. This is called inertia.',
      ],
      points: [
        ['Примеры инерции', 'Examples', 'При резком торможении пассажиры наклоняются вперёд: их тела продолжают двигаться.', 'When a bus brakes hard, passengers lurch forward: their bodies keep moving.'],
        ['Почему всё останавливается', 'Why things stop', 'Шайба на льду катится долго, на асфальте — недолго. Останавливает её трение, а не «усталость».', 'A puck slides far on ice and briefly on asphalt. Friction stops it, not “tiredness”.'],
        ['Ремни безопасности', 'Seat belts', 'Они нужны именно из-за инерции: в аварии тело продолжает лететь вперёд.', 'They exist because of inertia: in a crash your body keeps flying forward.'],
      ],
      sim: { engine: 'inertia_density' },
    },
    {
      id: 'p7-mass',
      title: ['Взаимодействие тел. Масса', 'Interaction. Mass'],
      intro: [
        'При взаимодействии оба тела меняют скорость. Тело, которое меняет скорость меньше, — более инертное, у него больше масса.',
        'When bodies interact, both change speed. The one whose speed changes less is more inert: it has more mass.',
      ],
      points: [
        ['Взаимодействие', 'Interaction', 'Лодка отталкивает человека, а человек — лодку: действие всегда взаимно.', 'A boat pushes a person and the person pushes the boat: action is always mutual.'],
        ['Масса', 'Mass', 'Мера инертности тела. Чем больше масса, тем труднее разогнать или остановить тело.', 'A measure of inertia. The more mass, the harder to speed a body up or stop it.'],
        ['Единицы массы', 'Units of mass', 'Килограмм (кг). Также тонна (1000 кг), грамм (0,001 кг), миллиграмм.', 'The kilogram (kg); also the tonne (1000 kg), gram (0.001 kg), milligram.'],
        ['Измерение массы на весах', 'Weighing', 'Рычажные весы сравнивают массу тела с массой гирь: при равновесии они равны.', 'A balance compares a body with known weights: at balance the masses are equal.'],
      ],
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p7-density',
      title: ['Плотность вещества', 'Density'],
      intro: [
        'Плотность показывает, какая масса вещества помещается в единице объёма. Именно поэтому литр ртути весит 13,6 кг, а литр воды — 1 кг.',
        'Density is the mass of a substance per unit volume. That’s why a litre of mercury weighs 13.6 kg and a litre of water 1 kg.',
      ],
      points: [
        ['Формула плотности', 'Density formula', 'ρ = m/V. Единица — кг/м³. Вода: 1000 кг/м³, железо: 7800 кг/м³.', 'ρ = m/V in kg/m³. Water: 1000 kg/m³, iron: 7800 kg/m³.'],
        ['Таблицы плотностей', 'Density tables', 'По плотности можно узнать вещество: золото тяжелее свинца того же объёма.', 'Density identifies a substance: gold is heavier than the same volume of lead.'],
        ['Расчёт массы и объёма', 'Finding mass and volume', 'm = ρV, V = m/ρ. Масса 2 м³ бетона: 2300·2 = 4600 кг.', 'm = ρV, V = m/ρ. Two cubic metres of concrete weigh 2300·2 = 4600 kg.'],
      ],
      formula: '\\rho = \\frac{m}{V}',
      sim: { engine: 'inertia_density' },
    },
    {
      id: 'p7-force',
      title: ['Сила', 'Force'],
      intro: [
        'Сила — мера действия одного тела на другое. Она меняет скорость тела или деформирует его. У силы есть величина и направление.',
        'Force measures how one body acts on another. It changes a body’s speed or deforms it. Force has size and direction.',
      ],
      points: [
        ['Сила как мера взаимодействия', 'Force as interaction', 'Ракетка действует на мяч силой и меняет его скорость.', 'A racket pushes the ball with a force and changes its speed.'],
        ['Изображение силы вектором', 'Force as a vector', 'Рисуют стрелкой: длина — величина, направление — куда действует, начало — точка приложения.', 'Drawn as an arrow: length is size, direction is where it acts, the tail is where it’s applied.'],
        ['Единица силы', 'Unit of force', 'Ньютон (Н). Примерно с такой силой яблоко массой 100 г давит на ладонь.', 'The newton (N), about how hard a 100 g apple presses on your palm.'],
      ],
    },
    {
      id: 'p7-gravity',
      title: ['Сила тяжести', 'Gravity'],
      intro: [
        'Все тела притягиваются друг к другу. Сила, с которой Земля притягивает тела, называется силой тяжести.',
        'All bodies attract each other. The force with which the Earth pulls on bodies is called gravity.',
      ],
      points: [
        ['Явление тяготения', 'Gravitation', 'Луна обращается вокруг Земли, а Земля вокруг Солнца из-за всемирного тяготения.', 'The Moon orbits the Earth and the Earth orbits the Sun because of universal gravitation.'],
        ['Формула силы тяжести', 'Gravity formula', 'F = mg, где g ≈ 9,8 Н/кг. На Луне g в 6 раз меньше — там ты весишь в 6 раз меньше.', 'F = mg with g ≈ 9.8 N/kg. On the Moon g is 6 times smaller, so you weigh 6 times less.'],
        ['Направление', 'Direction', 'Сила тяжести всегда направлена к центру Земли — «вниз» в любой точке планеты.', 'Gravity always points to the Earth’s centre, “down” anywhere on the planet.'],
      ],
      formula: 'F_{тяж} = m g',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p7-elastic',
      title: ['Сила упругости. Закон Гука', 'Elastic force. Hooke’s law'],
      intro: [
        'Деформированное тело стремится вернуть форму и давит на то, что его деформирует. Чем сильнее растянута пружина, тем сильнее она тянет назад.',
        'A deformed body tries to regain its shape and pushes back. The more a spring is stretched, the harder it pulls back.',
      ],
      points: [
        ['Упругая деформация', 'Elastic deformation', 'После снятия нагрузки тело полностью восстанавливает форму: пружина, мяч, линейка.', 'The body fully recovers once the load is gone: a spring, a ball, a ruler.'],
        ['Пластическая деформация', 'Plastic deformation', 'Форма не восстанавливается: пластилин, смятая жесть.', 'The shape doesn’t recover: plasticine, crumpled tin.'],
        ['Закон Гука', 'Hooke’s law', 'F = k·Δx: сила упругости пропорциональна удлинению. k — жёсткость пружины.', 'F = k·Δx: the elastic force is proportional to the stretch; k is the spring stiffness.'],
      ],
      formula: 'F_{упр} = k\\,\\Delta x',
      sim: { engine: 'hooke_spring' },
    },
    {
      id: 'p7-weight',
      title: ['Вес тела. Невесомость', 'Weight. Weightlessness'],
      intro: [
        'Вес — сила, с которой тело давит на опору или тянет подвес. Его часто путают с силой тяжести, но это разные силы.',
        'Weight is the force with which a body presses on a support or pulls a hanger. It’s often confused with gravity, but they’re different forces.',
      ],
      points: [
        ['Отличие веса от силы тяжести', 'Weight vs gravity', 'Сила тяжести приложена к телу, а вес — к опоре. В покое они равны: P = mg.', 'Gravity acts on the body; weight acts on the support. At rest they’re equal: P = mg.'],
        ['Невесомость', 'Weightlessness', 'Если опора падает вместе с телом (лифт с оборванным тросом, МКС на орбите), тело на неё не давит: вес равен нулю.', 'If the support falls with the body (a free-falling lift, the ISS in orbit), the body doesn’t press on it: weight is zero.'],
      ],
      formula: 'P = m g',
    },
    {
      id: 'p7-dynamometer',
      title: ['Динамометр. Сложение сил', 'Dynamometer. Adding forces'],
      intro: [
        'Силу измеряют динамометром — пружиной со шкалой. Если на тело действует несколько сил, их можно заменить одной — равнодействующей.',
        'Force is measured with a dynamometer, a spring with a scale. Several forces on a body can be replaced by one: the resultant.',
      ],
      points: [
        ['Динамометр', 'Dynamometer', 'Чем больше сила, тем сильнее растягивается пружина. Шкала проградуирована в ньютонах.', 'The bigger the force, the more the spring stretches. The scale reads newtons.'],
        ['Силы в одну сторону', 'Forces in one direction', 'Равнодействующая равна сумме: R = F₁ + F₂.', 'The resultant is the sum: R = F₁ + F₂.'],
        ['Силы в разные стороны', 'Opposing forces', 'Равнодействующая равна разности и направлена в сторону большей силы. Если силы равны — тело в равновесии.', 'The resultant is the difference, pointing toward the larger force. Equal forces mean equilibrium.'],
      ],
      sim: { engine: 'friction_dynamometer' },
    },
    {
      id: 'p7-friction',
      title: ['Сила трения', 'Friction'],
      intro: [
        'Трение мешает телам скользить друг по другу. Оно возникает из-за шероховатостей поверхностей и притяжения молекул.',
        'Friction resists bodies sliding over each other. It comes from surface roughness and molecular attraction.',
      ],
      points: [
        ['Трение покоя', 'Static friction', 'Не даёт шкафу сдвинуться, пока толкаешь слабо. Именно оно позволяет нам ходить.', 'Keeps a wardrobe still while you push gently. It’s what lets us walk.'],
        ['Трение скольжения', 'Sliding friction', 'Действует, когда тело скользит: санки по снегу, тормозящие колёса.', 'Acts when a body slides: a sled on snow, skidding wheels.'],
        ['Трение качения', 'Rolling friction', 'Во много раз меньше трения скольжения — поэтому придумали колесо и подшипники.', 'Many times smaller than sliding friction, which is why we invented wheels and bearings.'],
        ['Как уменьшить и увеличить', 'Reducing and increasing', 'Уменьшают смазкой и подшипниками; увеличивают песком на льду и протектором шин.', 'Reduce with lubricant and bearings; increase with sand on ice and tyre treads.'],
      ],
      formula: 'F_{тр} = \\mu N',
      sim: { engine: 'friction_dynamometer' },
    },
  ]),

  section(P, 7, 'pressure', ['Давление твёрдых тел, жидкостей и газов', 'Pressure in solids, liquids and gases'], [
    {
      id: 'p7-pressure',
      title: ['Давление', 'Pressure'],
      intro: [
        'Давление — сила, приходящаяся на единицу площади. Одна и та же сила давит слабо на большую площадь и сильно на маленькую.',
        'Pressure is force per unit area. The same force presses gently on a large area and hard on a small one.',
      ],
      points: [
        ['Формула и единицы', 'Formula and units', 'p = F/S. Единица — паскаль: 1 Па = 1 Н/м².', 'p = F/S, measured in pascals: 1 Pa = 1 N/m².'],
        ['Как уменьшить давление', 'Reducing pressure', 'Увеличить площадь: лыжи, гусеницы трактора, широкие лямки рюкзака.', 'Increase the area: skis, tractor tracks, wide backpack straps.'],
        ['Как увеличить давление', 'Increasing pressure', 'Уменьшить площадь: острый нож, игла, кнопка.', 'Reduce the area: a sharp knife, a needle, a pin.'],
      ],
      formula: 'p = \\frac{F}{S}',
    },
    {
      id: 'p7-gas-pressure',
      title: ['Давление газа', 'Gas pressure'],
      intro: [
        'Газ давит на стенки сосуда, потому что миллиарды молекул непрерывно ударяются о них.',
        'A gas presses on its container because billions of molecules keep hitting the walls.',
      ],
      points: [
        ['Объяснение через молекулы', 'Molecular explanation', 'Каждый удар молекулы крошечный, но их так много, что получается заметная сила.', 'Each hit is tiny, but there are so many that they add up to a noticeable force.'],
        ['Зависимость от объёма', 'Effect of volume', 'Сжали газ — молекулы чаще бьют о стенки, давление растёт (насос, шприц).', 'Squeeze a gas and molecules hit the walls more often, so pressure rises (pump, syringe).'],
        ['Зависимость от температуры', 'Effect of temperature', 'Нагрели — молекулы быстрее и бьют сильнее. Поэтому баллоны нельзя держать у огня.', 'Heat it and molecules move faster and hit harder. That’s why gas cans must stay away from fire.'],
      ],
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'p7-pascal',
      title: ['Закон Паскаля', 'Pascal’s law'],
      intro: [
        'Давление, производимое на жидкость или газ, передаётся без изменения в каждую точку во всех направлениях.',
        'Pressure applied to a liquid or gas is passed on unchanged to every point and in every direction.',
      ],
      points: [
        ['Передача давления', 'Transmitting pressure', 'Надави на воздушный шарик — он раздувается во все стороны, а не только туда, где давишь.', 'Squeeze a balloon and it bulges everywhere, not just where you press.'],
        ['Шар Паскаля', 'Pascal’s sphere', 'Из шара с дырочками при нажатии на поршень вода бьёт одинаковыми струями во все стороны.', 'Press the piston of a holed sphere and water spurts equally in every direction.'],
      ],
      sim: { moment: 'moment_pascal' },
    },
    {
      id: 'p7-liquid-pressure',
      title: ['Давление в жидкости', 'Pressure in liquids'],
      intro: [
        'Под действием силы тяжести верхние слои жидкости давят на нижние. Чем глубже, тем больше давление.',
        'Gravity makes the upper layers of a liquid press on the lower ones. The deeper, the higher the pressure.',
      ],
      points: [
        ['Формула', 'Formula', 'p = ρgh. На глубине 10 м вода давит с силой ~100 000 Па — как вся атмосфера.', 'p = ρgh. At 10 m, water presses ~100,000 Pa, as much as the whole atmosphere.'],
        ['Давление на дно и стенки', 'On the bottom and walls', 'Зависит только от высоты столба и плотности, а не от формы сосуда (гидростатический парадокс).', 'Depends only on depth and density, not on the vessel’s shape (the hydrostatic paradox).'],
      ],
      formula: 'p = \\rho g h',
      sim: { engine: 'pascal_vessels' },
    },
    {
      id: 'p7-communicating',
      title: ['Сообщающиеся сосуды', 'Communicating vessels'],
      intro: [
        'В соединённых сосудах однородная жидкость устанавливается на одном уровне, какой бы формы они ни были.',
        'In connected vessels, a liquid settles at the same level whatever their shapes.',
      ],
      points: [
        ['Чайник', 'Kettle', 'Носик чайника — сообщающийся сосуд: если он ниже края, чай не нальёшь доверху.', 'A spout is a communicating vessel: if it’s lower than the rim, you can’t fill to the top.'],
        ['Водопровод и водонапорная башня', 'Water supply', 'Вода из башни поднимается в дома ниже её уровня без насоса.', 'Water from a tower reaches homes below its level without a pump.'],
        ['Шлюзы', 'Locks', 'Камеры шлюза выравнивают уровни, чтобы корабли проходили через плотину.', 'Lock chambers equalise levels so ships can pass a dam.'],
      ],
      sim: { moment: 'moment_pascal' },
    },
    {
      id: 'p7-atmosphere',
      title: ['Атмосферное давление', 'Atmospheric pressure'],
      intro: [
        'Воздух имеет вес. Слой атмосферы в сотни километров давит на всё вокруг с силой около 10 тонн на каждый квадратный метр.',
        'Air has weight. The atmosphere, hundreds of kilometres thick, presses on everything with about 10 tonnes per square metre.',
      ],
      points: [
        ['Вес воздуха', 'Weight of air', 'Литр воздуха весит около 1,3 г. Шар до и после откачки воздуха весит по-разному.', 'A litre of air weighs about 1.3 g. A flask weighs differently before and after pumping it out.'],
        ['Опыт Торричелли', 'Torricelli’s experiment', 'Атмосфера удерживает столб ртути высотой 760 мм — это нормальное давление.', 'The atmosphere holds up a 760 mm column of mercury, which is normal pressure.'],
        ['Барометр-анероид', 'Aneroid barometer', 'Гофрированная коробочка без воздуха сжимается при росте давления и двигает стрелку.', 'A sealed corrugated box squeezes as pressure rises and moves a pointer.'],
        ['Давление и высота', 'Pressure and altitude', 'Каждые ~12 м подъёма давление падает на 1 мм рт. ст. На Эвересте оно втрое ниже.', 'Pressure drops about 1 mmHg per 12 m of climb; on Everest it’s a third of sea level.'],
      ],
      formula: 'p_0 \\approx 760\\ \\text{мм рт. ст.} \\approx 101\\,325\\ \\text{Па}',
      sim: { engine: 'barometer_atmosphere' },
    },
    {
      id: 'p7-manometer-pump',
      title: ['Манометры и насосы', 'Pressure gauges and pumps'],
      intro: [
        'Манометр измеряет давление больше или меньше атмосферного. Насосы используют атмосферное давление, чтобы поднимать воду.',
        'A pressure gauge measures pressure above or below atmospheric. Pumps use atmospheric pressure to lift water.',
      ],
      points: [
        ['Жидкостный манометр', 'Liquid manometer', 'U-образная трубка: разница уровней жидкости показывает разницу давлений.', 'A U-tube: the difference in levels shows the difference in pressures.'],
        ['Металлический манометр', 'Bourdon gauge', 'Изогнутая трубка разгибается при росте давления и двигает стрелку — так проверяют давление в шинах.', 'A curved tube straightens as pressure rises and moves a needle, like a tyre gauge.'],
        ['Поршневой насос', 'Piston pump', 'Поршень поднимается, под ним остаётся пустота, и атмосфера заталкивает туда воду. Так можно поднять воду максимум на ~10 м.', 'The piston rises leaving a void, and the atmosphere pushes water in. This can lift water at most ~10 m.'],
      ],
    },
    {
      id: 'p7-hydraulic',
      title: ['Гидравлический пресс', 'Hydraulic press'],
      intro: [
        'Два поршня разной площади соединены жидкостью. Давление одинаково, а сила больше там, где площадь больше.',
        'Two pistons of different areas share a liquid. The pressure is the same, but the force is bigger where the area is bigger.',
      ],
      points: [
        ['Выигрыш в силе', 'Force gain', 'F₂/F₁ = S₂/S₁. Если большой поршень в 100 раз шире, он даст в 100 раз большую силу.', 'F₂/F₁ = S₂/S₁. A piston 100 times larger gives 100 times the force.'],
        ['Применение', 'Uses', 'Домкрат, тормоза автомобиля, экскаватор, пресс для отжима масла.', 'Car jacks, brakes, excavators, oil presses.'],
        ['Проигрыш в пути', 'Distance trade-off', 'Малый поршень приходится двигать во столько же раз дальше — работа не выигрывается.', 'The small piston must travel as many times farther, so no work is gained.'],
      ],
      formula: '\\frac{F_2}{F_1} = \\frac{S_2}{S_1}',
      sim: { moment: 'moment_pascal' },
    },
    {
      id: 'p7-archimedes',
      title: ['Архимедова сила', 'Buoyant force'],
      intro: [
        'Жидкость и газ выталкивают погружённое тело вверх. Выталкивающая сила равна весу вытесненной жидкости.',
        'Liquids and gases push a submerged body upward. The buoyant force equals the weight of the displaced fluid.',
      ],
      points: [
        ['Откуда берётся сила', 'Where it comes from', 'Снизу на тело давит более глубокий слой, чем сверху. Разница давлений и толкает вверх.', 'The liquid below is deeper than above, so it presses harder. That pressure difference pushes up.'],
        ['Формула', 'Formula', 'Fₐ = ρж·g·Vт — зависит от плотности жидкости и объёма тела, но не от его массы.', 'F_b = ρ_liq·g·V — depends on liquid density and body volume, not on the body’s mass.'],
      ],
      formula: 'F_A = \\rho_{ж}\\, g\\, V_{т}',
      sim: { engine: 'archimedes_buoyancy' },
    },
    {
      id: 'p7-floating',
      title: ['Плавание тел и судов', 'Floating bodies and ships'],
      intro: [
        'Тело плавает, если архимедова сила уравновешивает силу тяжести. Это сводится к сравнению плотностей тела и жидкости.',
        'A body floats when buoyancy balances gravity. It comes down to comparing the densities of body and liquid.',
      ],
      points: [
        ['Условия плавания', 'Floating conditions', 'ρт < ρж — всплывает; ρт = ρж — плавает внутри; ρт > ρж — тонет.', 'ρ_body < ρ_liquid floats up; equal floats inside; greater sinks.'],
        ['Плавание судов', 'Ships', 'Стальной корабль плавает, потому что его корпус полый: средняя плотность меньше плотности воды.', 'A steel ship floats because its hull is hollow: its average density is less than water’s.'],
        ['Водоизмещение и ватерлиния', 'Displacement and waterline', 'Водоизмещение — вес вытесненной воды, равный весу судна с грузом. Ватерлиния — допустимая осадка.', 'Displacement is the weight of water pushed aside, equal to the loaded ship’s weight. The waterline marks the safe draught.'],
      ],
      sim: { engine: 'archimedes_buoyancy' },
    },
    {
      id: 'p7-balloons',
      title: ['Воздухоплавание', 'Aeronautics'],
      intro: [
        'Архимедова сила действует и в воздухе. Шар взлетает, если он легче вытесненного им воздуха.',
        'Buoyancy works in air too. A balloon rises if it’s lighter than the air it displaces.',
      ],
      points: [
        ['Воздушные шары', 'Balloons', 'Наполнены гелием или горячим воздухом — они менее плотные, чем окружающий воздух.', 'Filled with helium or hot air, both less dense than the surrounding air.'],
        ['Подъёмная сила', 'Lift', 'Разность архимедовой силы и веса шара с оболочкой. С высотой воздух редеет, и шар перестаёт подниматься.', 'Buoyancy minus the weight of the balloon and envelope. Air thins with height, so the balloon stops rising.'],
      ],
      sim: { engine: 'archimedes_buoyancy' },
    },
  ]),

  section(P, 7, 'work', ['Работа и мощность. Энергия', 'Work, power and energy'], [
    {
      id: 'p7-work',
      title: ['Механическая работа', 'Mechanical work'],
      intro: [
        'Работа совершается, когда сила перемещает тело. Держать тяжёлую сумку на месте утомительно, но работы в физическом смысле нет.',
        'Work is done when a force moves a body. Holding a heavy bag still is tiring, but no work is done in the physics sense.',
      ],
      points: [
        ['Формула работы', 'Work formula', 'A = F·s, если сила направлена вдоль движения.', 'A = F·s when the force acts along the motion.'],
        ['Джоуль', 'The joule', '1 Дж — работа силы 1 Н на пути 1 м. Поднять яблоко на метр — примерно 1 Дж.', '1 J is a force of 1 N over 1 m. Lifting an apple by a metre takes about 1 J.'],
      ],
      formula: 'A = F s',
      sim: { engine: 'work_power' },
    },
    {
      id: 'p7-power',
      title: ['Мощность', 'Power'],
      intro: [
        'Мощность показывает, как быстро совершается работа. Лифт и лестница поднимают тебя на одну высоту, но лифт мощнее.',
        'Power shows how fast work is done. A lift and the stairs raise you equally, but the lift is more powerful.',
      ],
      points: [
        ['Формула мощности', 'Power formula', 'N = A/t.', 'N = A/t.'],
        ['Ватт', 'The watt', '1 Вт = 1 Дж/с. Человек развивает около 100 Вт, автомобиль — около 100 000 Вт.', '1 W = 1 J/s. A person manages about 100 W, a car about 100,000 W.'],
      ],
      formula: 'N = \\frac{A}{t}',
      sim: { engine: 'work_power' },
    },
    {
      id: 'p7-lever',
      title: ['Рычаг. Момент силы', 'Lever. Moment of force'],
      intro: [
        'Рычаг — твёрдое тело, которое вращается вокруг опоры. Он позволяет маленькой силой поднять большой груз, если её плечо длиннее.',
        'A lever is a rigid body turning about a pivot. It lets a small force lift a big load if its arm is longer.',
      ],
      points: [
        ['Плечо силы', 'Lever arm', 'Кратчайшее расстояние от опоры до линии действия силы.', 'The shortest distance from the pivot to the force’s line of action.'],
        ['Условие равновесия', 'Balance condition', 'F₁·l₁ = F₂·l₂: силы обратно пропорциональны плечам.', 'F₁·l₁ = F₂·l₂: forces are inversely proportional to their arms.'],
        ['Момент силы', 'Moment of force', 'M = F·l — вращающее действие силы. Рычаг в равновесии, если моменты по и против часовой стрелки равны.', 'M = F·l, the turning effect of a force. A lever balances when clockwise and anticlockwise moments are equal.'],
      ],
      formula: 'F_1 l_1 = F_2 l_2',
      sim: { moment: 'moment_lever' },
    },
    {
      id: 'p7-pulleys',
      title: ['Блоки, наклонная плоскость, ворот', 'Pulleys, inclined plane, windlass'],
      intro: [
        'Простые механизмы меняют величину или направление силы. Все они — разновидности рычага или наклонной плоскости.',
        'Simple machines change the size or direction of a force. All are variants of the lever or the inclined plane.',
      ],
      points: [
        ['Неподвижный блок', 'Fixed pulley', 'Выигрыша в силе нет, но меняет направление: тянем вниз — груз идёт вверх.', 'No force gain, but it changes direction: pull down, the load goes up.'],
        ['Подвижный блок', 'Movable pulley', 'Даёт выигрыш в силе в 2 раза, но верёвку тянем вдвое дальше.', 'Halves the force, but you pull twice as much rope.'],
        ['Наклонная плоскость', 'Inclined plane', 'Чем положе пандус, тем меньше сила, но длиннее путь.', 'The gentler the ramp, the smaller the force and the longer the path.'],
        ['Ворот', 'Windlass', 'Рукоятка колодца — рычаг: длинная ручка и узкий вал дают выигрыш в силе.', 'A well handle is a lever: a long crank on a thin axle multiplies force.'],
      ],
      sim: { moment: 'moment_lever' },
    },
    {
      id: 'p7-golden-rule',
      title: ['«Золотое правило» механики', 'The golden rule of mechanics'],
      intro: [
        'Ни один механизм не даёт выигрыша в работе: во сколько раз выигрываем в силе, во столько же раз проигрываем в пути.',
        'No machine gains work: whatever you gain in force, you lose in distance by the same factor.',
      ],
      points: [
        ['Сила и путь', 'Force and distance', 'Подвижный блок: сила вдвое меньше, путь вдвое больше, работа та же.', 'A movable pulley halves the force, doubles the distance, and the work stays the same.'],
      ],
      formula: 'F_1 s_1 = F_2 s_2',
      sim: { moment: 'moment_lever' },
    },
    {
      id: 'p7-center-mass',
      title: ['Центр тяжести. Виды равновесия', 'Centre of gravity. Equilibrium'],
      intro: [
        'Центр тяжести — точка, через которую проходит равнодействующая сил тяжести всех частей тела. От её положения зависит, устоит ли тело.',
        'The centre of gravity is where the combined pull of gravity on every part acts. Its position decides whether a body stays upright.',
      ],
      points: [
        ['Устойчивое равновесие', 'Stable', 'Выведенное из равновесия тело возвращается обратно: шарик в ямке, неваляшка.', 'A nudged body returns: a ball in a dip, a roly-poly toy.'],
        ['Неустойчивое равновесие', 'Unstable', 'Малейший толчок — и тело уходит: шарик на вершине горки, карандаш на острие.', 'The slightest push sends it away: a ball on a hilltop, a pencil on its tip.'],
        ['Безразличное равновесие', 'Neutral', 'В любом положении тело остаётся в равновесии: шар на ровном столе.', 'The body balances in any position: a ball on a flat table.'],
      ],
    },
    {
      id: 'p7-efficiency',
      title: ['КПД механизма', 'Efficiency'],
      intro: [
        'На практике часть работы уходит на трение и подъём самого механизма. КПД показывает, какая доля работы полезна.',
        'In practice some work goes to friction and lifting the machine itself. Efficiency shows what share of the work is useful.',
      ],
      points: [
        ['Полезная и полная работа', 'Useful vs total work', 'Полезная — подъём груза. Полная — всё, что мы затратили.', 'Useful work lifts the load; total work is everything we put in.'],
        ['Формула КПД', 'Efficiency formula', 'η = Aпол/Aзатр·100%. КПД всегда меньше 100%.', 'η = A_useful/A_total·100%, always under 100%.'],
      ],
      formula: '\\eta = \\frac{A_{пол}}{A_{затр}} \\cdot 100\\%',
      sim: { engine: 'work_power' },
    },
    {
      id: 'p7-energy',
      title: ['Энергия: кинетическая и потенциальная', 'Kinetic and potential energy'],
      intro: [
        'Энергия — способность тела совершить работу. Движущееся тело обладает кинетической энергией, поднятое или сжатое — потенциальной.',
        'Energy is a body’s ability to do work. A moving body has kinetic energy; a raised or compressed one has potential energy.',
      ],
      points: [
        ['Потенциальная энергия', 'Potential energy', 'Eₚ = mgh: чем выше и тяжелее тело, тем больше энергии запасено.', 'E_p = mgh: higher and heavier means more stored energy.'],
        ['Кинетическая энергия', 'Kinetic energy', 'Eₖ = mv²/2: при удвоении скорости энергия растёт вчетверо — поэтому превышение скорости так опасно.', 'E_k = mv²/2: double the speed and energy quadruples, which is why speeding is so dangerous.'],
        ['Превращения энергии', 'Energy conversion', 'Маятник: внизу вся энергия кинетическая, в крайней точке — потенциальная. Полная энергия сохраняется.', 'A pendulum: at the bottom all energy is kinetic, at the end all potential. The total is conserved.'],
      ],
      formula: 'E_p = mgh, \\quad E_k = \\frac{mv^2}{2}',
      sim: { moment: 'moment_pendulum' },
    },
  ]),
];
