import { section } from './types';

const P = 'physics';

export const PHYSICS_8 = [
  section(P, 8, 'heat', ['Тепловые явления', 'Thermal phenomena'], [
    {
      id: 'p8-thermal-motion',
      title: ['Тепловое движение. Температура', 'Thermal motion. Temperature'],
      intro: [
        'Температура — мера того, насколько быстро в среднем движутся молекулы тела. Горячий чай отличается от холодного только скоростью молекул.',
        'Temperature measures how fast a body’s molecules move on average. Hot tea differs from cold tea only in molecular speed.',
      ],
      points: [
        ['Тепловое движение', 'Thermal motion', 'Беспорядочное движение молекул, которое не прекращается никогда. Чем оно быстрее, тем тело горячее.', 'The random, never-ending motion of molecules. The faster it is, the hotter the body.'],
        ['Термометры', 'Thermometers', 'Жидкость в трубке расширяется при нагреве: по высоте столбика читаем температуру.', 'Liquid in a tube expands when heated; the column’s height shows the temperature.'],
        ['Тепловое равновесие', 'Thermal equilibrium', 'Соприкасающиеся тела со временем приходят к одной температуре. Поэтому термометр нужно подержать.', 'Bodies in contact end up at the same temperature, which is why a thermometer needs time.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'p8-internal-energy',
      title: ['Внутренняя энергия', 'Internal energy'],
      intro: [
        'Внутренняя энергия — сумма энергии движения и взаимодействия всех молекул тела. Изменить её можно двумя способами.',
        'Internal energy is the total energy of motion and interaction of all a body’s molecules. There are two ways to change it.',
      ],
      points: [
        ['Совершение работы', 'Doing work', 'Потри ладони — они нагреются. Насос нагревается при накачке шины.', 'Rub your palms and they warm up. A bike pump heats up while inflating a tyre.'],
        ['Теплопередача', 'Heat transfer', 'Ложка в горячем чае нагревается без всякой работы — энергия переходит от горячего к холодному.', 'A spoon in hot tea warms with no work done: energy flows from hot to cold.'],
      ],
    },
    {
      id: 'p8-conduction',
      title: ['Теплопроводность', 'Conduction'],
      intro: [
        'Энергия передаётся от частицы к частице, сами частицы при этом не перемещаются. Металлы проводят тепло хорошо, воздух и дерево — плохо.',
        'Energy passes from particle to particle without the particles moving along. Metals conduct heat well; air and wood poorly.',
      ],
      points: [
        ['Хорошие проводники', 'Good conductors', 'Металлы: в них есть свободные электроны, которые быстро разносят энергию.', 'Metals: their free electrons carry energy quickly.'],
        ['Теплоизоляторы', 'Insulators', 'Воздух, шерсть, пенопласт. Шуба греет не сама — она удерживает слой воздуха.', 'Air, wool, foam. A fur coat doesn’t heat you; it traps a layer of air.'],
      ],
    },
    {
      id: 'p8-convection',
      title: ['Конвекция', 'Convection'],
      intro: [
        'В жидкостях и газах тёплые слои становятся легче и поднимаются, а холодные опускаются. Возникают потоки, которые переносят тепло.',
        'In liquids and gases, warm layers get lighter and rise while cold ones sink. The resulting currents carry heat.',
      ],
      points: [
        ['Естественная конвекция', 'Natural convection', 'Батарея греет комнату: тёплый воздух поднимается у неё и расходится под потолком.', 'A radiator warms a room: warm air rises beside it and spreads under the ceiling.'],
        ['Вынужденная конвекция', 'Forced convection', 'Потоки создаёт вентилятор или насос: фен, система охлаждения двигателя.', 'A fan or pump drives the flow: a hair dryer, an engine’s cooling system.'],
        ['Ветры', 'Winds', 'Днём суша нагревается быстрее моря, и дует бриз с моря на сушу.', 'By day land warms faster than sea, so a breeze blows from sea to land.'],
      ],
    },
    {
      id: 'p8-radiation',
      title: ['Излучение', 'Radiation'],
      intro: [
        'Тепло может передаваться даже через вакуум — невидимыми инфракрасными лучами. Так Солнце греет Землю.',
        'Heat can travel even through a vacuum, as invisible infrared rays. That’s how the Sun warms the Earth.',
      ],
      points: [
        ['Тёмные и светлые тела', 'Dark and light bodies', 'Тёмные тела лучше поглощают и излучают энергию, светлые — отражают. Летом носят светлое.', 'Dark bodies absorb and emit better; light ones reflect. That’s why we wear light colours in summer.'],
        ['Термос', 'Vacuum flask', 'Вакуум между стенками останавливает теплопроводность и конвекцию, а зеркальное покрытие — излучение.', 'Vacuum between the walls stops conduction and convection; the silvering blocks radiation.'],
      ],
    },
    {
      id: 'p8-heat-quantity',
      title: ['Количество теплоты. Теплоёмкость', 'Heat and specific heat'],
      intro: [
        'Количество теплоты — энергия, переданная при теплопередаче. Чтобы нагреть разные вещества на одинаковые градусы, нужно разное количество теплоты.',
        'Heat is the energy transferred by heat transfer. Heating different substances by the same amount takes different amounts of heat.',
      ],
      points: [
        ['Единицы', 'Units', 'Джоуль (Дж). Старая единица — калория: 1 кал ≈ 4,2 Дж.', 'The joule (J). The older calorie is about 4.2 J.'],
        ['Удельная теплоёмкость', 'Specific heat', 'Сколько теплоты нужно, чтобы нагреть 1 кг вещества на 1 °C. У воды — 4200 Дж/(кг·°C), одна из самых больших.', 'The heat to warm 1 kg by 1 °C. Water’s is 4200 J/(kg·°C), one of the highest.'],
        ['Формула', 'Formula', 'Q = cm(t₂ − t₁). Поэтому море нагревается и остывает медленнее суши.', 'Q = cm(t₂ − t₁). That’s why the sea warms and cools more slowly than land.'],
      ],
      formula: 'Q = c m (t_2 - t_1)',
    },
    {
      id: 'p8-fuel',
      title: ['Энергия топлива', 'Fuel energy'],
      intro: [
        'При сгорании топлива энергия связей молекул превращается во внутреннюю. Разное топливо даёт разную энергию с килограмма.',
        'Burning fuel turns the energy of molecular bonds into internal energy. Different fuels release different energy per kilogram.',
      ],
      points: [
        ['Удельная теплота сгорания', 'Specific heat of combustion', 'Энергия от полного сгорания 1 кг топлива. Дрова ≈ 10 МДж/кг, бензин ≈ 46 МДж/кг.', 'The energy from burning 1 kg completely. Wood ≈ 10 MJ/kg, petrol ≈ 46 MJ/kg.'],
        ['Формула', 'Formula', 'Q = qm.', 'Q = qm.'],
      ],
      formula: 'Q = q m',
    },
    {
      id: 'p8-heat-balance',
      title: ['Закон сохранения энергии в тепловых процессах', 'Conservation of energy in heat'],
      intro: [
        'Энергия не исчезает и не появляется из ниоткуда: сколько теплоты отдало горячее тело, столько получило холодное.',
        'Energy is never created or lost: the heat a hot body gives off is exactly what the cold one receives.',
      ],
      points: [
        ['Уравнение теплового баланса', 'Heat balance equation', 'Qотданное = Qполученное. Так находят температуру смеси горячей и холодной воды.', 'Q_given = Q_received. That’s how you find the temperature of mixed hot and cold water.'],
        ['Калориметр', 'Calorimeter', 'Сосуд с теплоизоляцией, чтобы энергия не уходила наружу во время опыта.', 'An insulated vessel so energy doesn’t escape during the experiment.'],
      ],
      formula: 'Q_{отд} = Q_{пол}',
    },
  ]),

  section(P, 8, 'phases', ['Изменение агрегатных состояний', 'Changes of state'], [
    {
      id: 'p8-melting',
      title: ['Плавление и отвердевание', 'Melting and freezing'],
      intro: [
        'При плавлении вся подводимая энергия идёт на разрушение кристаллической решётки, поэтому температура не меняется, пока весь лёд не растает.',
        'During melting all incoming energy breaks the crystal lattice, so the temperature stays put until all the ice has melted.',
      ],
      points: [
        ['Кристаллические тела', 'Crystalline solids', 'Атомы выстроены в правильную решётку. У таких тел есть точная температура плавления.', 'Atoms form a regular lattice, so such solids melt at a definite temperature.'],
        ['График плавления', 'Melting graph', 'Подъём, горизонтальная «полка» при 0 °C для льда, снова подъём. Полка — это плавление.', 'A rise, a flat plateau at 0 °C for ice, then another rise. The plateau is melting.'],
        ['Удельная теплота плавления', 'Specific latent heat of fusion', 'Q = λm. Для льда λ = 330 кДж/кг — растопить лёд труднее, чем нагреть воду на 80 °C.', 'Q = λm. For ice λ = 330 kJ/kg, more than heating water by 80 °C.'],
      ],
      formula: 'Q = \\lambda m',
      sim: { moment: 'moment_states' },
    },
    {
      id: 'p8-evaporation',
      title: ['Испарение и конденсация', 'Evaporation and condensation'],
      intro: [
        'Самые быстрые молекулы вырываются из жидкости, и она испаряется. Остаются медленные — поэтому жидкость охлаждается.',
        'The fastest molecules escape a liquid, so it evaporates. The slow ones stay behind, which cools the liquid.',
      ],
      points: [
        ['От чего зависит скорость испарения', 'What speeds it up', 'От температуры, площади поверхности, ветра и рода жидкости. Бельё сохнет быстрее на ветру.', 'Temperature, surface area, wind and the type of liquid. Laundry dries faster in wind.'],
        ['Охлаждение при испарении', 'Cooling by evaporation', 'Выходя из воды, мы мёрзнем: испаряющиеся капли уносят энергию.', 'We shiver leaving the water: evaporating drops carry energy away.'],
        ['Насыщенный пар', 'Saturated vapour', 'Пар над жидкостью в закрытом сосуде, когда испарение и конденсация уравновешены.', 'Vapour above a liquid in a closed vessel when evaporation and condensation balance.'],
        ['Конденсация', 'Condensation', 'Пар превращается в жидкость и отдаёт энергию: ожог паром сильнее, чем кипятком.', 'Vapour turns back to liquid and releases energy; a steam burn is worse than a boiling-water one.'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'p8-boiling',
      title: ['Кипение', 'Boiling'],
      intro: [
        'Кипение — бурное испарение по всему объёму: пузырьки пара растут внутри жидкости и всплывают.',
        'Boiling is vigorous evaporation throughout the liquid: vapour bubbles grow inside it and rise.',
      ],
      points: [
        ['Температура кипения', 'Boiling point', 'Пока вода кипит, температура постоянна — 100 °C при нормальном давлении.', 'While water boils its temperature is constant: 100 °C at normal pressure.'],
        ['Зависимость от давления', 'Pressure dependence', 'В горах давление ниже, вода кипит при ~70 °C, и мясо не сварить. В скороварке — наоборот.', 'In the mountains water boils at ~70 °C, too cool to cook meat; a pressure cooker does the opposite.'],
        ['Удельная теплота парообразования', 'Latent heat of vaporisation', 'Q = Lm. Для воды L = 2,3 МДж/кг — в 7 раз больше, чем для плавления льда.', 'Q = Lm. Water’s L = 2.3 MJ/kg, seven times its heat of fusion.'],
      ],
      formula: 'Q = L m',
      sim: { moment: 'moment_states' },
    },
    {
      id: 'p8-humidity',
      title: ['Влажность воздуха', 'Air humidity'],
      intro: [
        'В воздухе всегда есть водяной пар. Нам важно не сколько его, а насколько воздух близок к насыщению.',
        'Air always holds water vapour. What matters is how close the air is to saturation.',
      ],
      points: [
        ['Абсолютная влажность', 'Absolute humidity', 'Масса пара в 1 м³ воздуха, г/м³.', 'Mass of vapour in 1 m³ of air, g/m³.'],
        ['Относительная влажность', 'Relative humidity', 'Во сколько процентов пар близок к насыщению при этой температуре. Комфорт — 40–60%.', 'How close the vapour is to saturation at this temperature, in percent. Comfort is 40–60%.'],
        ['Точка росы', 'Dew point', 'Температура, при которой пар становится насыщенным и выпадает роса или туман.', 'The temperature at which vapour saturates and dew or fog forms.'],
        ['Гигрометр и психрометр', 'Hygrometer and psychrometer', 'Психрометр сравнивает сухой и влажный термометры: чем суше воздух, тем сильнее остывает влажный.', 'A psychrometer compares dry and wet thermometers: the drier the air, the more the wet one cools.'],
      ],
    },
    {
      id: 'p8-heat-engines',
      title: ['Тепловые двигатели', 'Heat engines'],
      intro: [
        'Тепловой двигатель превращает внутреннюю энергию топлива в механическую работу: расширяющийся газ толкает поршень или крутит турбину.',
        'A heat engine turns fuel’s internal energy into work: expanding gas pushes a piston or spins a turbine.',
      ],
      points: [
        ['Четыре такта ДВС', 'Four-stroke engine', 'Впуск, сжатие, рабочий ход, выпуск. Работу совершает только третий такт.', 'Intake, compression, power, exhaust. Only the third stroke does work.'],
        ['Паровая турбина', 'Steam turbine', 'Струя пара бьёт в лопатки и раскручивает вал. Так работают электростанции.', 'A jet of steam hits the blades and spins the shaft, as in power stations.'],
        ['КПД теплового двигателя', 'Efficiency', 'η = Aпол/Qзатр. У автомобиля ~25–35%: остальное уходит теплом.', 'η = A_useful/Q_spent. A car manages ~25–35%; the rest is lost as heat.'],
        ['Экология', 'Ecology', 'Выхлопы загрязняют воздух и усиливают парниковый эффект. Решения — электротранспорт и экономичные двигатели.', 'Exhaust pollutes the air and adds to the greenhouse effect. Solutions: electric transport and efficient engines.'],
      ],
      formula: '\\eta = \\frac{A_{пол}}{Q_{затр}} \\cdot 100\\%',
      sim: { engine: 'thermodynamics_first_law' },
    },
  ]),

  section(P, 8, 'electric', ['Электрические явления', 'Electricity'], [
    {
      id: 'p8-electrification',
      title: ['Электризация тел', 'Charging bodies'],
      intro: [
        'При трении электроны переходят с одного тела на другое: одно заряжается отрицательно, другое — положительно.',
        'Friction moves electrons from one body to another: one becomes negative, the other positive.',
      ],
      points: [
        ['Два рода зарядов', 'Two kinds of charge', 'Одноимённые заряды отталкиваются, разноимённые притягиваются.', 'Like charges repel; unlike charges attract.'],
        ['Электроскоп', 'Electroscope', 'Листочки получают одинаковый заряд и расходятся: чем больше заряд, тем шире.', 'Its leaves take the same charge and spread apart, wider for more charge.'],
        ['Проводники, диэлектрики, полупроводники', 'Conductors, insulators, semiconductors', 'Металлы проводят заряд, пластик и стекло — нет, кремний — в зависимости от условий.', 'Metals conduct charge, plastic and glass don’t, silicon depends on conditions.'],
      ],
    },
    {
      id: 'p8-electric-field',
      title: ['Электрическое поле', 'Electric field'],
      intro: [
        'Вокруг каждого заряда есть электрическое поле. Именно через него заряды действуют друг на друга на расстоянии.',
        'Every charge is surrounded by an electric field. That’s how charges act on each other at a distance.',
      ],
      points: [
        ['Действие поля', 'Field action', 'Чем ближе к заряду, тем сильнее поле. Наэлектризованная расчёска притягивает бумажки, не касаясь их.', 'The closer to the charge, the stronger the field. A charged comb picks up paper without touching it.'],
        ['Силовые линии', 'Field lines', 'Выходят из положительного заряда и входят в отрицательный.', 'They leave positive charges and enter negative ones.'],
      ],
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p8-atom-charge',
      title: ['Делимость заряда. Строение атома', 'Charge and the atom'],
      intro: [
        'Заряд нельзя делить бесконечно: есть наименьший заряд — заряд электрона. Атом нейтрален, потому что зарядов в ядре и в оболочке поровну.',
        'Charge can’t be split forever: the smallest is the electron’s charge. An atom is neutral because the nucleus and shell charges balance.',
      ],
      points: [
        ['Электрон', 'Electron', 'Частица с наименьшим отрицательным зарядом e = −1,6·10⁻¹⁹ Кл.', 'The particle with the smallest negative charge, e = −1.6·10⁻¹⁹ C.'],
        ['Строение атома', 'Atomic structure', 'В центре — положительное ядро из протонов и нейтронов, вокруг — электроны.', 'A positive nucleus of protons and neutrons in the centre, with electrons around it.'],
        ['Объяснение электризации', 'Why bodies charge', 'Тело, получившее лишние электроны, заряжено отрицательно; потерявшее — положительно.', 'A body with extra electrons is negative; one that lost some is positive.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'p8-current',
      title: ['Электрический ток. Источники тока', 'Electric current. Sources'],
      intro: [
        'Ток — упорядоченное движение заряженных частиц. Чтобы он шёл, нужны свободные заряды, замкнутая цепь и источник, который их «подталкивает».',
        'Current is the ordered flow of charged particles. It needs free charges, a closed circuit and a source to push them.',
      ],
      points: [
        ['Условия существования тока', 'Conditions for current', 'Свободные заряды, электрическое поле в проводнике и замкнутая цепь.', 'Free charges, an electric field in the conductor and a closed circuit.'],
        ['Гальванический элемент', 'Galvanic cell', 'Батарейка: химическая реакция разделяет заряды на полюсах.', 'A battery: a chemical reaction separates charges at the terminals.'],
        ['Аккумулятор', 'Rechargeable battery', 'Его можно зарядить снова, прогнав ток в обратную сторону.', 'It can be recharged by driving current backwards through it.'],
      ],
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-circuit',
      title: ['Электрическая цепь', 'Electric circuit'],
      intro: [
        'Цепь — источник, потребители, провода и ключ, соединённые так, чтобы ток мог пройти по кругу.',
        'A circuit is a source, loads, wires and a switch joined so current can flow round a loop.',
      ],
      points: [
        ['Условные обозначения', 'Circuit symbols', 'На схеме лампа — круг с крестом, резистор — прямоугольник, источник — длинная и короткая чёрточки.', 'A lamp is a circle with a cross, a resistor a rectangle, a cell a long and a short line.'],
        ['Направление тока', 'Current direction', 'Условно — от «+» к «−», хотя электроны в металле движутся наоборот.', 'By convention from + to −, though electrons in metals move the other way.'],
        ['Действия тока', 'Effects of current', 'Тепловое (чайник), химическое (электролиз), магнитное (электромагнит).', 'Heating (kettle), chemical (electrolysis), magnetic (electromagnet).'],
      ],
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-current-strength',
      title: ['Сила тока', 'Current'],
      intro: [
        'Сила тока показывает, какой заряд проходит через сечение проводника за секунду.',
        'Current tells how much charge passes through a wire’s cross-section each second.',
      ],
      points: [
        ['Формула и единица', 'Formula and unit', 'I = q/t, ампер (А). 1 А — это 1 кулон в секунду.', 'I = q/t, in amperes (A). 1 A is one coulomb per second.'],
        ['Амперметр', 'Ammeter', 'Включается последовательно, в разрыв цепи, чтобы через него шёл весь ток.', 'Connected in series, in a break in the circuit, so all the current flows through it.'],
      ],
      formula: 'I = \\frac{q}{t}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-voltage',
      title: ['Напряжение', 'Voltage'],
      intro: [
        'Напряжение показывает, какую работу совершает поле, перемещая единичный заряд. Это «напор», который гонит ток.',
        'Voltage is the work the field does moving a unit charge, the “pressure” that drives current.',
      ],
      points: [
        ['Вольт', 'The volt', 'Батарейка — 1,5 В, розетка — 220 В.', 'A battery is 1.5 V; a wall socket 220 V.'],
        ['Вольтметр', 'Voltmeter', 'Подключается параллельно участку, на котором измеряют напряжение.', 'Connected in parallel across the part being measured.'],
      ],
      formula: 'U = \\frac{A}{q}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-resistance',
      title: ['Электрическое сопротивление', 'Resistance'],
      intro: [
        'Электроны в металле сталкиваются с ионами решётки — это и есть сопротивление. Чем длиннее и тоньше провод, тем оно больше.',
        'Electrons in a metal collide with lattice ions: that’s resistance. Longer, thinner wires resist more.',
      ],
      points: [
        ['Причины сопротивления', 'Causes', 'Столкновения электронов с колеблющимися ионами. При нагреве их больше.', 'Electrons hitting vibrating ions; there are more collisions when hot.'],
        ['Удельное сопротивление', 'Resistivity', 'R = ρl/S. Медь — хороший проводник, нихром — плохой, поэтому из него делают нагреватели.', 'R = ρl/S. Copper conducts well; nichrome poorly, so heaters use it.'],
        ['Реостат', 'Rheostat', 'Меняет длину провода в цепи и тем самым силу тока: регулятор яркости, громкости.', 'Changes the wire length in the circuit and so the current: dimmers, volume knobs.'],
      ],
      formula: 'R = \\rho \\frac{l}{S}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-ohm',
      title: ['Закон Ома для участка цепи', 'Ohm’s law'],
      intro: [
        'Сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению. Главный закон всей электротехники.',
        'Current is proportional to voltage and inversely proportional to resistance. The key law of electrical engineering.',
      ],
      points: [
        ['Формула', 'Formula', 'I = U/R. Увеличишь напряжение вдвое — ток вырастет вдвое.', 'I = U/R. Double the voltage and the current doubles.'],
        ['Расчёты', 'Calculations', 'U = IR, R = U/I. Лампа 220 В, ток 0,5 А — сопротивление 440 Ом.', 'U = IR, R = U/I. A 220 V lamp drawing 0.5 A has 440 Ω.'],
      ],
      formula: 'I = \\frac{U}{R}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-connections',
      title: ['Последовательное и параллельное соединение', 'Series and parallel'],
      intro: [
        'Потребители можно соединить цепочкой или «лесенкой». От этого зависит, как делятся ток и напряжение.',
        'Loads can be wired in a chain or side by side. That decides how current and voltage are shared.',
      ],
      points: [
        ['Последовательное', 'Series', 'Ток одинаков, напряжения складываются, R = R₁ + R₂. Перегорит одна лампа — погаснут все.', 'Same current, voltages add, R = R₁ + R₂. One bulb fails, all go out.'],
        ['Параллельное', 'Parallel', 'Напряжение одинаково, токи складываются, 1/R = 1/R₁ + 1/R₂. Так подключены приборы в квартире.', 'Same voltage, currents add, 1/R = 1/R₁ + 1/R₂. Home appliances are wired this way.'],
      ],
      formula: 'R_{посл} = R_1 + R_2, \\quad \\frac{1}{R_{пар}} = \\frac{1}{R_1} + \\frac{1}{R_2}',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-power-current',
      title: ['Работа и мощность тока', 'Electrical work and power'],
      intro: [
        'Ток совершает работу: крутит мотор, греет чайник, светит лампой. За эту работу мы и платим по счётчику.',
        'Current does work: it turns motors, heats kettles, lights lamps. That’s what the electricity meter charges for.',
      ],
      points: [
        ['Формулы', 'Formulas', 'A = UIt, P = UI.', 'A = UIt, P = UI.'],
        ['Киловатт-час', 'Kilowatt-hour', 'Единица работы тока в быту: 1 кВт·ч = 3,6 МДж. Чайник 2 кВт за полчаса — 1 кВт·ч.', 'The household unit: 1 kWh = 3.6 MJ. A 2 kW kettle for half an hour uses 1 kWh.'],
      ],
      formula: 'P = U I',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-joule-lenz',
      title: ['Закон Джоуля–Ленца', 'Joule’s law'],
      intro: [
        'Проводник с током нагревается. Количество теплоты зависит от квадрата силы тока, поэтому большие токи так опасны.',
        'A current heats its conductor. The heat depends on the current squared, which is why large currents are dangerous.',
      ],
      points: [
        ['Формула', 'Formula', 'Q = I²Rt.', 'Q = I²Rt.'],
        ['Лампа накаливания', 'Incandescent lamp', 'Вольфрамовая нить раскаляется до 2500 °C и светится. Большая часть энергии уходит в тепло.', 'A tungsten filament glows at 2500 °C; most energy is lost as heat.'],
        ['Нагревательные приборы', 'Heaters', 'Утюг, плитка, обогреватель — спираль с большим сопротивлением.', 'Irons, hotplates, heaters: a high-resistance coil.'],
      ],
      formula: 'Q = I^2 R t',
      sim: { moment: 'moment_circuit' },
    },
    {
      id: 'p8-safety',
      title: ['Короткое замыкание. Предохранители', 'Short circuits and fuses'],
      intro: [
        'Если ток пойдёт в обход нагрузки, сопротивление станет почти нулевым, а ток — огромным. Провода раскалятся.',
        'If current bypasses the load, resistance drops to almost zero and the current soars. Wires overheat.',
      ],
      points: [
        ['Короткое замыкание', 'Short circuit', 'Причины: повреждённая изоляция, вода в розетке. Последствие — пожар.', 'Causes: damaged insulation, water in a socket. The result can be a fire.'],
        ['Предохранители', 'Fuses', 'Тонкая проволочка или автомат размыкает цепь, как только ток превысит норму.', 'A thin wire or circuit breaker opens the circuit as soon as current exceeds the limit.'],
      ],
    },
  ]),

  section(P, 8, 'magnetism', ['Электромагнитные явления', 'Electromagnetism'], [
    {
      id: 'p8-magnetic-field',
      title: ['Магнитное поле', 'Magnetic field'],
      intro: [
        'Вокруг магнитов и проводников с током есть магнитное поле. Его видно по железным опилкам: они выстраиваются вдоль магнитных линий.',
        'Magnets and current-carrying wires have a magnetic field. Iron filings reveal it by lining up along the field lines.',
      ],
      points: [
        ['Магнитные линии', 'Field lines', 'Выходят из северного полюса и входят в южный, нигде не обрываются.', 'They leave the north pole and enter the south, never breaking.'],
        ['Поле прямого тока', 'Field of a straight wire', 'Линии — концентрические окружности вокруг провода. Опыт Эрстеда: стрелка компаса поворачивается рядом с током.', 'Lines form circles round the wire. Ørsted saw a compass needle turn near a current.'],
        ['Поле катушки', 'Field of a coil', 'Катушка с током похожа на полосовой магнит: у неё есть северный и южный полюс.', 'A current-carrying coil acts like a bar magnet with north and south poles.'],
      ],
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p8-electromagnets',
      title: ['Электромагниты', 'Electromagnets'],
      intro: [
        'Катушка с железным сердечником превращается в сильный магнит, который можно включать и выключать.',
        'A coil with an iron core becomes a strong magnet you can switch on and off.',
      ],
      points: [
        ['Как усилить', 'Making it stronger', 'Больше витков, больше ток, железный сердечник.', 'More turns, more current, an iron core.'],
        ['Применение', 'Uses', 'Подъёмный кран на свалке металлолома, электрический звонок, реле.', 'Scrapyard cranes, doorbells, relays.'],
      ],
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p8-permanent-magnets',
      title: ['Постоянные магниты. Поле Земли', 'Permanent magnets. Earth’s field'],
      intro: [
        'Постоянный магнит сохраняет намагниченность долго. Сама Земля — огромный магнит, поэтому работает компас.',
        'A permanent magnet stays magnetised for a long time. The Earth itself is a huge magnet, which is why compasses work.',
      ],
      points: [
        ['Полюса и взаимодействие', 'Poles and interaction', 'Одноимённые полюса отталкиваются, разноимённые притягиваются. Разрежешь магнит — получишь два магнита.', 'Like poles repel, unlike attract. Cut a magnet and you get two magnets.'],
        ['Магнитное поле Земли', 'Earth’s magnetic field', 'Южный магнитный полюс Земли находится у северного географического.', 'Earth’s south magnetic pole lies near the geographic North Pole.'],
        ['Магнитные бури', 'Magnetic storms', 'Потоки частиц от Солнца возмущают поле Земли: сбоит связь, появляются полярные сияния.', 'Particles from the Sun disturb Earth’s field, disrupting radio and causing auroras.'],
      ],
    },
    {
      id: 'p8-motor',
      title: ['Действие поля на ток. Электродвигатель', 'Force on a current. Electric motor'],
      intro: [
        'Магнитное поле действует на проводник с током. Если рамку с током поместить между магнитами, она начнёт вращаться.',
        'A magnetic field pushes on a current. Put a current loop between magnets and it starts to turn.',
      ],
      points: [
        ['Сила на проводник', 'Force on a wire', 'Направление зависит от направления тока и поля. Сменишь ток — проводник отклонится в другую сторону.', 'The direction depends on current and field; reverse the current and the wire swings the other way.'],
        ['Электродвигатель', 'Electric motor', 'Ротор с обмоткой вращается в поле статора, а коллектор вовремя меняет направление тока.', 'A wound rotor spins in the stator’s field while a commutator flips the current at the right moment.'],
      ],
      sim: { moment: 'moment_induction' },
    },
  ]),

  section(P, 8, 'light', ['Световые явления', 'Light'], [
    {
      id: 'p8-light-sources',
      title: ['Источники света', 'Light sources'],
      intro: [
        'Тела, которые излучают свет сами, — источники света. Остальные мы видим, потому что они отражают чужой свет.',
        'Bodies that emit light themselves are light sources. We see everything else because it reflects light.',
      ],
      points: [
        ['Естественные', 'Natural', 'Солнце, звёзды, молния, светлячки.', 'The Sun, stars, lightning, fireflies.'],
        ['Искусственные', 'Artificial', 'Лампы накаливания, светодиоды, экраны.', 'Incandescent bulbs, LEDs, screens.'],
      ],
    },
    {
      id: 'p8-light-straight',
      title: ['Прямолинейное распространение. Тень', 'Straight-line travel. Shadows'],
      intro: [
        'В однородной среде свет идёт по прямой. Поэтому за непрозрачным предметом образуется тень.',
        'In a uniform medium light travels in straight lines, so an opaque object casts a shadow.',
      ],
      points: [
        ['Тень и полутень', 'Umbra and penumbra', 'От точечного источника — резкая тень. От большого — тень плюс размытая полутень.', 'A point source casts a sharp shadow; a large one adds a blurry penumbra.'],
        ['Затмения', 'Eclipses', 'Солнечное — Луна закрывает Солнце; лунное — Луна попадает в тень Земли.', 'Solar: the Moon blocks the Sun; lunar: the Moon enters Earth’s shadow.'],
      ],
    },
    {
      id: 'p8-reflection',
      title: ['Отражение света. Плоское зеркало', 'Reflection. Plane mirrors'],
      intro: [
        'Луч отражается от поверхности так, что угол отражения равен углу падения.',
        'A ray bounces off a surface so the angle of reflection equals the angle of incidence.',
      ],
      points: [
        ['Законы отражения', 'Laws of reflection', 'Падающий и отражённый лучи лежат в одной плоскости с перпендикуляром, α = β.', 'Incident and reflected rays lie in one plane with the normal, and α = β.'],
        ['Изображение в зеркале', 'Image in a mirror', 'Мнимое, прямое, того же размера, на таком же расстоянии за зеркалом.', 'Virtual, upright, same size, as far behind the mirror as the object is in front.'],
        ['Зеркальное и диффузное', 'Specular and diffuse', 'Гладкая поверхность отражает пучком, шероховатая — во все стороны. Поэтому видна бумага, но не стекло.', 'Smooth surfaces reflect a beam; rough ones scatter it everywhere. That’s why we see paper but not clean glass.'],
      ],
      sim: { moment: 'moment_optics' },
    },
    {
      id: 'p8-refraction',
      title: ['Преломление света', 'Refraction'],
      intro: [
        'На границе двух сред луч меняет направление, потому что в разных средах свет идёт с разной скоростью.',
        'At the boundary of two media a ray bends, because light travels at different speeds in them.',
      ],
      points: [
        ['Закономерности', 'Rules', 'Входя в более плотную оптически среду (из воздуха в воду), луч прижимается к перпендикуляру.', 'Entering an optically denser medium (air to water), the ray bends toward the normal.'],
        ['Показатель преломления', 'Refractive index', 'Во сколько раз свет в среде медленнее, чем в вакууме. Вода — 1,33, стекло — 1,5, алмаз — 2,4.', 'How many times slower light is in a medium than in vacuum: water 1.33, glass 1.5, diamond 2.4.'],
      ],
      sim: { moment: 'moment_optics' },
    },
    {
      id: 'p8-lenses',
      title: ['Линзы. Оптическая сила', 'Lenses. Optical power'],
      intro: [
        'Линза — прозрачное тело, ограниченное сферами. Выпуклая собирает лучи, вогнутая рассеивает.',
        'A lens is a transparent body bounded by spherical surfaces. A convex one converges rays; a concave one spreads them.',
      ],
      points: [
        ['Собирающие и рассеивающие', 'Converging and diverging', 'Собирающая толще в середине, рассеивающая — по краям.', 'Converging lenses are thicker in the middle, diverging ones at the edges.'],
        ['Фокус', 'Focus', 'Точка, где собираются параллельные лучи после собирающей линзы. Расстояние до неё — фокусное.', 'Where parallel rays meet after a converging lens; its distance is the focal length.'],
        ['Оптическая сила', 'Optical power', 'D = 1/F, в диоптриях. Очки «+2» — собирающая линза с F = 0,5 м.', 'D = 1/F, in dioptres. “+2” glasses are a converging lens with F = 0.5 m.'],
      ],
      formula: 'D = \\frac{1}{F}',
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'p8-lens-images',
      title: ['Изображения в линзах', 'Images in lenses'],
      intro: [
        'Чтобы построить изображение, достаточно двух лучей из трёх «удобных». Где они пересекутся — там изображение.',
        'Two of three “handy” rays are enough to locate an image: where they cross, the image forms.',
      ],
      points: [
        ['Три удобных луча', 'Three handy rays', 'Параллельный оси — через фокус; через центр — без преломления; через фокус — параллельно оси.', 'Parallel to the axis → through the focus; through the centre → straight on; through the focus → parallel.'],
        ['Виды изображений', 'Kinds of images', 'Действительное (можно поймать на экран) или мнимое; увеличенное или уменьшенное; прямое или перевёрнутое.', 'Real (can be caught on a screen) or virtual; enlarged or reduced; upright or inverted.'],
      ],
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'p8-optical-devices',
      title: ['Оптические приборы', 'Optical instruments'],
      intro: [
        'Фотоаппарат и проектор устроены одинаково: линза строит действительное изображение — уменьшенное на матрице или увеличенное на экране.',
        'Cameras and projectors work alike: a lens forms a real image, reduced on a sensor or enlarged on a screen.',
      ],
      points: [
        ['Фотоаппарат', 'Camera', 'Предмет дальше двойного фокуса — изображение уменьшенное и перевёрнутое.', 'The object is beyond twice the focal length, giving a small inverted image.'],
        ['Проектор', 'Projector', 'Слайд между фокусом и двойным фокусом — изображение увеличенное.', 'The slide sits between F and 2F, giving an enlarged image.'],
      ],
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'p8-eye',
      title: ['Глаз и зрение', 'The eye and vision'],
      intro: [
        'Глаз — живой фотоаппарат: хрусталик строит на сетчатке уменьшенное перевёрнутое изображение, а мозг «переворачивает» его обратно.',
        'The eye is a living camera: the lens forms a small inverted image on the retina, and the brain flips it back.',
      ],
      points: [
        ['Строение глаза', 'Structure', 'Роговица, зрачок, хрусталик, стекловидное тело, сетчатка с палочками и колбочками.', 'Cornea, pupil, lens, vitreous body, and a retina of rods and cones.'],
        ['Аккомодация', 'Accommodation', 'Мышцы меняют кривизну хрусталика, чтобы видеть резко и вдали, и вблизи.', 'Muscles change the lens’s curvature to focus near and far.'],
        ['Близорукость и дальнозоркость', 'Short and long sight', 'При близорукости изображение перед сетчаткой — нужны рассеивающие очки; при дальнозоркости — за ней, нужны собирающие.', 'Short sight focuses in front of the retina (diverging glasses); long sight behind it (converging).'],
      ],
      sim: { engine: 'lenses_ray_tracing' },
    },
  ]),
];
