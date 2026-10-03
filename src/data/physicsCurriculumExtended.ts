import { TextbookLesson } from '../types/stem';

export const EXTENDED_PHYSICS_CURRICULUM: TextbookLesson[] = [
  // =========================================================================
  // 7 КЛАСС — ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ
  // =========================================================================
  {
    id: 'p7_friction_dynamometer',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Forces and Motion', ru: 'Взаимодействие тел' },
    title: { en: 'Friction Force & Dynamometer: Static and Kinetic Friction', ru: 'Сила трения и динамометр: Трение покоя, скольжения и качения' },
    subtitle: { en: 'Why we cannot walk on ice and how wheels defeat friction (F = μN)', ru: 'Коэффициент трения μ, прижимающая сила реакции опоры N и смазка' },
    textbookDefinition: {
      en: 'Friction is the force resisting the relative motion of solid surfaces. Friction force is directly proportional to normal force: F_friction = μ · N, independent of contact surface area.',
      ru: 'Сила трения возникает при соприкосновении поверхностей и направлена противоположно относительному движению: F_тр = μ · N, где μ — коэффициент трения, N — сила нормального давления.'
    },
    studentConfusion: {
      en: 'Students think widening the contact area increases friction. In classical physics, F_friction is independent of surface area because pressure drops proportionally!',
      ru: 'Школьники думают: чем шире брусок, тем больше трение. Но при той же массе бруска сила трения скольжения НЕ зависит от площади граней!'
    },
    lifeAnalogy: {
      en: 'Microscopic velcro: even polished glass looks like jagged mountain ranges under an electron microscope; dragging surfaces means shearing those micro-peaks.',
      ru: 'Микроскопическая липучка: даже полированный стол под микроскопом — это острые скалы. Трение — это зацепление и срубание микронеровностей двух тел!'
    },
    momentObservation: {
      en: 'Pull block with spring dynamometer: see force rise to peak static friction, then drop slightly into steady kinetic slide.',
      ru: 'Тяни брусок динамометром: стрелка натягивается до пика (трение покоя), а затем срывается в чуть меньшее трение скольжения!'
    },
    formula: 'F_{\\text{тр}} = \\mu N, \\quad N = mg',
    viewMode: 'moment_universal',
    simEngineType: 'friction_dynamometer',
    keywords: ['friction', 'dynamometer', 'normal force', 'трение', 'динамометр', 'сила трения', 'скольжение']
  },
  {
    id: 'p7_hydraulic_press',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Pressure in Fluids', ru: 'Давление жидкостей и газов' },
    title: { en: 'Hydraulic Press: Pascal\'s Power Multiplier', ru: 'Гидравлический пресс: Выигрыш в силе по закону Паскаля' },
    subtitle: { en: 'How a child pressing with 10 Newtons can lift a 10,000 N truck', ru: 'Отношение сил равно отношению площадей поршней: F₂ / F₁ = S₂ / S₁' },
    textbookDefinition: {
      en: 'A hydraulic press uses liquid pressure transmission. Pressure applied to small piston S₁ is transmitted undiminished to large piston S₂: p = F₁/S₁ = F₂/S₂ ⇒ F₂ = F₁ · (S₂/S₁).',
      ru: 'Гидравлический пресс состоит из двух сообщающихся цилиндров разного диаметра с поршнями. Давление в несжимаемой жидкости одинаково во всех точках, поэтому сила на большом поршне во столько же раз больше, во сколько раз его площадь больше площади малого поршня: F₂ / F₁ = S₂ / S₁.'
    },
    studentConfusion: {
      en: 'Do we get free energy from nowhere? No! The small piston must travel 100 times further down to lift the truck 1 cm up (Golden Rule of Mechanics)!',
      ru: 'Школьники думают: «Мы получили бесплатную силу из ниоткуда!». Нет: выигрывая в силе в 100 раз, мы ровно во 100 раз проигрываем в расстоянии (золотое правило механики)!'
    },
    lifeAnalogy: {
      en: 'Car hydraulic brakes: your light foot tap on the brake pedal effortlessly clamps heavy steel pads onto spinning wheels at 100 km/h.',
      ru: 'Гидравлические тормоза автомобиля: легкое нажатие ступни на педаль тормоза передается через тормозную жидкость и намертво зажимает колодками стальные диски колес!'
    },
    momentObservation: {
      en: 'Push the small piston down 10 cm in simulator: watch the massive truck on the wide piston rise smoothly by 1 mm.',
      ru: 'Опусти узкий поршень на 10 см вниз: жидкость перетечет в широкий цилиндр и плавно поднимет многотонный грузовик на 1 мм!'
    },
    formula: '\\frac{F_2}{F_1} = \\frac{S_2}{S_1}, \\quad A_1 = A_2',
    viewMode: 'moment_pascal',
    simEngineType: 'hydraulic_press',
    keywords: ['hydraulic', 'press', 'pascal', 'piston', 'гидравлический пресс', 'поршень', 'паскаль', 'выигрыш в силе']
  },
  {
    id: 'p7_work_power_efficiency',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Work and Energy', ru: 'Работа и мощность. Энергия' },
    title: { en: 'Mechanical Work and Power: The Golden Rule of Mechanics', ru: 'Механическая работа и мощность: «Золотое правило» механики и КПД' },
    subtitle: { en: 'Work A = F·s, Power N = A/t, and why no machine can ever give an advantage in work', ru: 'Джоули, Ватты, блоки, наклонная плоскость и коэффициент полезного действия (КПД < 100%)' },
    textbookDefinition: {
      en: 'Mechanical work is performed when a force moves a body: A = F · s. Power is the rate of doing work: N = A / t. The Golden Rule of Mechanics states: no simple mechanism gives a gain in work; gain in force comes with proportional loss in distance.',
      ru: 'Механическая работа совершается только тогда, когда на тело действует сила и тело перемещается: A = F · s (Джоуль). Мощность — скорость совершения работы: N = A / t (Ватт). «Золотое правило» механики: ни один механизм не дает выигрыша в работе — во сколько раз выигрываем в силе, во столько раз проигрываем в расстоянии.'
    },
    studentConfusion: {
      en: 'If you hold a 50 kg barbell motionless overhead for 1 hour, is physical work performed? ZERO physical work (distance s = 0)!',
      ru: 'Школьник держит 50 кг штангу над головой и обливается потом: совершается ли механическая работа? Физическая работа равна НУЛЮ, потому что перемещение s = 0!'
    },
    lifeAnalogy: {
      en: 'Ramping up a mountain serpentine road: driving around serpentine is 10 times longer, but engine needs 10 times less hill-climb force.',
      ru: 'Серпантин в горах: круто в лоб на гору машина въехать не может — не хватает силы тяги. Дорога-серпантин в 10 раз длиннее, но сила подъема в 10 раз меньше!'
    },
    momentObservation: {
      en: 'Pull weight up inclined plane: compare direct lifting work F·h with ramp pulling force F_ramp·L.',
      ru: 'Подними груз по наклонной плоскости: сила натяжения веревки падает в 3 раза, но длина веревки вытягивается ровно в 3 раза — работа A неизменна!'
    },
    formula: 'A = F s, \\quad N = \\frac{A}{t} = F v, \\quad \\eta = \\frac{A_{\\text{полезн}}}{A_{\\text{полн}}} \\cdot 100\\%',
    viewMode: 'moment_lever',
    simEngineType: 'work_power',
    keywords: ['work', 'power', 'efficiency', 'joule', 'watt', 'работа', 'мощность', 'КПД', 'золотое правило']
  },
  {
    id: 'p7_kinetic_potential_energy',
    grade: 'grade_7',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Work and Energy', ru: 'Работа и мощность. Энергия' },
    title: { en: 'Kinetic and Potential Energy: Roller Coaster Conversion', ru: 'Кинетическая и потенциальная энергия: Закон сохранения энергии' },
    subtitle: { en: 'Energy of motion (mv²/2) trading with energy of height (mgh)', ru: 'Американские горки, свободное падение и полная механическая энергия E = Ek + Ep' },
    textbookDefinition: {
      en: 'Potential energy is the energy of position (Ep = mgh). Kinetic energy is the energy of motion (Ek = mv²/2). In a closed conservative system, total mechanical energy is conserved: E = Ek + Ep = const.',
      ru: 'Потенциальная энергия тела, поднятого над землей: E_п = mgh. Кинетическая энергия движущегося тела: E_к = mv²/2. В замкнутой системе при отсутствии трения полная механическая энергия остается постоянной: E = E_к + E_п = const.'
    },
    studentConfusion: {
      en: 'Why is doubling your car speed (2x) quadrupling (4x) the braking distance? Because kinetic energy depends on speed SQUARED (v²)!',
      ru: 'Почему при превышении скорости в 2 раза тормозной путь машины вырастает в 4 РАЗА?! Потому что кинетическая энергия зависит от квадрата скорости v²!'
    },
    lifeAnalogy: {
      en: 'Roller coaster ride: at highest peak, speed is zero and potential energy is max; at lowest drop, height is zero and kinetic speed is maximum.',
      ru: 'Американские горки: на самой вершине вагончик замирает (максимум Ep), а на дне мчится со свистом ветра (вся Ep перешла в Ek)!'
    },
    momentObservation: {
      en: 'Track energy bars on pendulum: watch green kinetic bar and red potential bar trade values smoothly at 60 FPS.',
      ru: 'Смотри на столбики энергий в симуляторе маятника: красный столбик Ep и зеленый Ek непрерывно переливаются друг в друга, сохраняя общую сумму!'
    },
    formula: 'E_{\\text{пот}} = mgh, \\quad E_{\\text{кин}} = \\frac{m v^2}{2}, \\quad E = E_{\\text{пот}} + E_{\\text{кин}} = \\text{const}',
    viewMode: 'moment_pendulum',
    simEngineType: 'kinetic_potential_energy',
    keywords: ['kinetic', 'potential', 'energy', 'conservation', 'энергия', 'кинетическая', 'потенциальная', 'сохранение энергии']
  },

  // =========================================================================
  // 8 КЛАСС — ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ
  // =========================================================================
  {
    id: 'p8_melting_crystallization',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Phase Transitions', ru: 'Агрегатные состояния вещества' },
    title: { en: 'Melting and Crystallization: Constant Temperature Plateau', ru: 'Плавление и кристаллизация: Удельная теплота плавления (λ)' },
    subtitle: { en: 'Why an ice-water mixture stays at exactly 0°C until the very last crystal melts', ru: 'График зависимости температуры от времени, разрушение кристаллической решетки (Q = λm)' },
    textbookDefinition: {
      en: 'Melting occurs at a fixed temperature called melting point. During the phase change, heat energy goes entirely into breaking the crystal lattice, so temperature remains strictly constant: Q = λ · m.',
      ru: 'Плавление — переход вещества из твердого состояния в жидкое. Температура кристаллического тела при плавлении НЕ меняется, пока все вещество не расплавится: все поступающее тепло Q = λ · m идет на разрыв кристаллической решетки.'
    },
    studentConfusion: {
      en: 'Students think if you keep heating an ice pot on a stove, the temperature must keep rising. It stays rock-locked at 0°C!',
      ru: 'Школьники уверены: «Если костер греет котелок со льдом, градусник должен расти!». Градусник намертво стоит на 0°C, пока не растает последняя льдинка!'
    },
    lifeAnalogy: {
      en: 'Buying tickets to enter an amusement park: money (heat) is spent paying the entry fee (breaking bonds) before anyone can start running inside.',
      ru: 'Оплата входного билета: сначала все деньги (теплота) уходят на то, чтобы расцепить руки солдат в строю (кристаллическую решетку). Только когда строй распался на толпу (жидкость), температура может снова расти!'
    },
    momentObservation: {
      en: 'Watch thermometer on heating graph: horizontal flat line at 0°C while ice molecules break loose into liquid water.',
      ru: 'Смотри на горизонтальную полку на графике: пламя горелки горит, но температура застыла на 0°C — идет скрытое поглощение энергии плавления!'
    },
    formula: 'Q = \\lambda m, \\quad t_{\\text{пл}} = \\text{const}',
    viewMode: 'moment_states',
    simEngineType: 'states_of_matter',
    keywords: ['melting', 'crystallization', 'latent heat', 'плавление', 'кристаллизация', 'удельная теплота плавления']
  },
  {
    id: 'p8_evaporation_boiling_humidity',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Phase Transitions', ru: 'Агрегатные состояния вещества' },
    title: { en: 'Evaporation and Boiling: Saturated Vapor and Humidity', ru: 'Испарение и кипение: Насыщенный пар и влажность воздуха' },
    subtitle: { en: 'Why water boils at 70°C on Mount Everest and cooling effect of sweat', ru: 'Испарение с поверхности при любой температуре, кипение по всему объему, психрометр' },
    textbookDefinition: {
      en: 'Evaporation is vaporization from liquid surface at any temperature. Boiling is intense vaporization throughout the whole liquid volume occurring when saturated vapor pressure equals external atmospheric pressure: Q = L · m.',
      ru: 'Испарение происходит с открытой поверхности жидкости при любой температуре. Кипение — бурное парообразование по всему объему, наступающее при температуре, когда давление насыщенного пара пузырьков сравнивается с внешним атмосферным давлением: Q = L · m.'
    },
    studentConfusion: {
      en: 'Why does sweating cool your body? (Fastest, highest-energy molecules fly away first, leaving slower, cooler molecules behind!).',
      ru: 'Почему испарение пота охлаждает кожу в жару? Потому что жидкость покидают САМЫЕ быстрые и горячие молекулы, а оставшиеся молекулы в среднем становятся холоднее!'
    },
    lifeAnalogy: {
      en: 'High jumpers leaving a room: if the top 10 tallest people leave the room, the average height of everyone left immediately drops.',
      ru: 'Отбор в баскетбольной команде: если самые высокие игроки покинут зал, средний рост оставшихся людей мгновенно уменьшится. Так и температура жидкости падает при испарении!'
    },
    momentObservation: {
      en: 'Lower atmospheric pressure in chamber: watch water boil vigorously at room temperature (+25°C) without any burner!',
      ru: 'Откачай воздух насосом из колбы: при комнатном тепле 25°C вода вдруг закипает ключом без всякого огня, доказывая закон равенства давлений!'
    },
    formula: 'Q = L m, \\quad \\varphi = \\frac{p}{p_{\\text{нас}}} \\cdot 100\\%',
    viewMode: 'moment_states',
    simEngineType: 'states_of_matter',
    keywords: ['evaporation', 'boiling', 'humidity', 'испарение', 'кипение', 'влажность', 'насыщенный пар']
  },
  {
    id: 'p8_electrostatics_charges_field',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Electrical Phenomena', ru: 'Электрические явления' },
    title: { en: 'Static Electricity & Charges: Like Repels, Opposite Attracts', ru: 'Электризация тел, два рода зарядов и закон сохранения заряда' },
    subtitle: { en: 'Why rubbing a balloon on your hair sticks it to the wall (electrons transfer)', ru: 'Электроскоп, элементарный заряд e = 1.6·10⁻¹⁹ Кл, электрическое поле' },
    textbookDefinition: {
      en: 'There are two types of electric charges: positive (+) and negative (-). Like charges repel; opposite charges attract. Electric charge is conserved in an isolated system: Σq = const.',
      ru: 'Существует два рода электрических зарядов: положительные (на стекле) и отрицательные (на эбоните). Одноименные заряды отталкиваются, разноименные притягиваются. Закон сохранения заряда: в замкнутой системе алгебраическая сумма зарядов остается неизменной: Σq = const.'
    },
    studentConfusion: {
      en: 'Students think rubbing creates new charges. Rubbing only TRANSFERS existing electrons from one material to another!',
      ru: 'Школьники думают, что трение «рождает» заряд. Нет! Трение лишь сдирает электроны с атомов шерсти и переносит их на воздушный шарик!'
    },
    lifeAnalogy: {
      en: 'Static cling socks coming out of dryer: tumbling stripped electrons, creating attractive electric fields between fabrics.',
      ru: 'Носки после сушилки: шерсть и синтетика наэлектризовались и прилипают друг к другу, демонстрируя кулоновское притяжение разноименных зарядов.'
    },
    momentObservation: {
      en: 'Bring charged rod near electroscope: watch two light aluminum leaves spread apart as like charges repel.',
      ru: 'Поднеси заряженную палочку к электроскопу: легкие лепестки фольги мгновенно расходятся в стороны, отталкиваясь друг от друга!'
    },
    formula: 'F = k \\frac{|q_1 q_2|}{r^2}, \\quad e = 1.6 \\cdot 10^{-19} \\text{ Кл}',
    viewMode: 'moment_circuit',
    simEngineType: 'electrostatic_charges',
    keywords: ['static electricity', 'charge', 'electroscope', 'электризация', 'заряд', 'электроскоп', 'кулон']
  },
  {
    id: 'p8_joule_heating_fuses',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Electrical Phenomena', ru: 'Электрические явления' },
    title: { en: 'Joule–Lenz Law & Short Circuit: Electric Power and Fuses', ru: 'Работа и мощность тока: Закон Джоуля–Ленца, короткое замыкание и предохранители' },
    subtitle: { en: 'Why wires overheat when overloaded: Q = I² · R · t and circuit breaker safety', ru: 'Тепловое действие тока, мощность P = UI = I²R, автоматические выключатели' },
    textbookDefinition: {
      en: 'The Joule–Lenz law states that the heat released by an electric current in a conductor is directly proportional to the square of current, resistance, and time: Q = I² · R · t.',
      ru: 'Закон Джоуля–Ленца: количество теплоты, выделяемое проводником с током, пропорционально квадрату силы тока, сопротивлению проводника и времени прохождения тока: Q = I² · R · t.'
    },
    studentConfusion: {
      en: 'Why is short circuit so dangerous? If resistance drops to near zero (R ≈ 0), current I = U/R spikes to hundreds of amperes, causing explosive heating Q ∝ I²!',
      ru: 'Почему короткое замыкание приводит к пожару? При замыкании оголенных проводов сопротивление R стремится к нулю, ток взлетает до сотен ампер, а тепло Q растет в КВАДРАТЕ тока!'
    },
    lifeAnalogy: {
      en: 'Water flowing through a narrow pipe with rough pebbles: electrons bumping violently into wire atoms shake them, turning kinetic drift into heat.',
      ru: 'Толпа людей бежит через узкий коридор с колоннами: люди непрерывно врезаются в колонны (атомы металла), и от ударов весь коридор раскаляется!'
    },
    momentObservation: {
      en: 'Drop resistance R to 0.1 Ohm in simulator: see current gauge peg to maximum red warning and fuse wire melt instantly.',
      ru: 'Уменьши сопротивление в цепи до нуля: амперметр зашкаливает, тонкая проволочка предохранителя мгновенно перегорает и спасает дом от пожара!'
    },
    formula: 'Q = I^2 R t = \\frac{U^2}{R} t, \\quad P = U I = I^2 R',
    viewMode: 'moment_circuit',
    simEngineType: 'joule_heating',
    keywords: ['joule', 'lenz', 'heating', 'short circuit', 'fuse', 'джоуль ленц', 'короткое замыкание', 'предохранитель', 'мощность тока']
  },
  {
    id: 'p8_magnetic_field_electromagnet',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Electromagnetic Phenomena', ru: 'Электромагнитные явления' },
    title: { en: 'Magnetic Field of Current & Electromagnets: Right-Hand Rule', ru: 'Магнитное поле тока и электромагниты: Правило правой руки' },
    subtitle: { en: 'Oersted’s compass needle discovery and lifting scrap metal with coils', ru: 'Силовые линии магнитного поля, соленоид с железным сердечником, электродвигатель' },
    textbookDefinition: {
      en: 'An electric current generates a magnetic field around its conductor. An electromagnet is a coil of wire with a soft iron core that becomes strongly magnetized when current flows.',
      ru: 'Вокруг любого проводника с током существует магнитное поле (опыт Эрстеда). Электромагнит — катушка с железным сердечником внутри, магнитное поле которой можно включать и регулировать силой тока.'
    },
    studentConfusion: {
      en: 'Students confuse static electricity with magnetism. Electricity involves stationary or moving charges; magnetic field is produced ONLY by moving charges (current)!',
      ru: 'Школьники путают электричество и магнетизм. Неподвижный заряд создает только электрическое поле. Но как только заряд побежал (ток) — вокруг него вспыхивает магнитное поле!'
    },
    lifeAnalogy: {
      en: 'Industrial crane in a junkyard: turn the switch on, crane lifts a 2-ton car by pure magnetism; turn switch off, car drops into crusher.',
      ru: 'Кран на свалке металлолома: нажал кнопку — электромагнит поднял стальной автомобиль; выключил ток — машина с грохотом отпустилась!'
    },
    momentObservation: {
      en: 'Flip switch in circuit: watch compass needles around the wire snap into concentric circular field lines.',
      ru: 'Замкни ключ цепи: стрелки компасов вокруг прямого провода мгновенно выстраиваются в идеальные концентрические кольца!'
    },
    formula: 'B = \\mu \\mu_0 n I',
    viewMode: 'moment_induction',
    simEngineType: 'magnetic_field_current',
    keywords: ['magnet', 'electromagnet', 'oersted', 'compass', 'магнитное поле', 'электромагнит', 'эрстед', 'соленоид']
  },
  {
    id: 'p8_light_reflection_mirrors',
    grade: 'grade_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Light Phenomena', ru: 'Световые явления' },
    title: { en: 'Law of Light Reflection and Plane Mirror Image', ru: 'Закон отражения света и плоское зеркало: Угол падения равен углу отражения' },
    subtitle: { en: 'Why your mirror image is virtual, erect, and identical in size', ru: 'Угол падения α = углу отражения β, мнимое изображение за зеркалом' },
    textbookDefinition: {
      en: 'The incident ray, reflected ray, and normal to the reflecting surface lie in one plane. The angle of incidence equals the angle of reflection: α = β. A plane mirror forms an erect, virtual image at the same distance behind the mirror as the object in front.',
      ru: 'Закон отражения: луч падающий, луч отраженный и перпендикуляр к границе раздела сред в точке падения лежат в одной плоскости. Угол отражения равен углу падения: α = β. Изображение в плоском зеркале мнимое, прямое и равновесное по расстоянию.'
    },
    studentConfusion: {
      en: 'Students measure the angle from the mirror surface instead of from the normal perpendicular line!',
      ru: 'Частая ошибка: школьники отмеряют угол падения от самой зеркальной плоскости. Угол ВСЕГДА измеряется от перпендикуляра к зеркалу!'
    },
    lifeAnalogy: {
      en: 'Bouncing a tennis ball off a smooth wall: throw it at 30° to the wall, it bounces off at the exact same 30° angle on the other side.',
      ru: 'Отскок бильярдного шара от гладкого борта: угол влета шара строго равен углу его отскока в противоположную сторону!'
    },
    momentObservation: {
      en: 'Rotate incoming laser angle from 10° to 75°: watch reflected green beam mirror the incident trajectory with mathematical precision.',
      ru: 'Поворачивай лазерный луч к зеркалу: смотри, как отраженный луч послушно следует за ним, сохраняя точное равенство углов α = β!'
    },
    formula: '\\alpha = \\beta, \\quad d_{\\text{предмета}} = d_{\\text{изображения}}',
    viewMode: 'moment_optics',
    simEngineType: 'light_reflection_mirror',
    keywords: ['reflection', 'mirror', 'incident ray', 'normal', 'отражение', 'зеркало', 'угол падения', 'оптика']
  },

  // =========================================================================
  // 9 КЛАСС — ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ
  // =========================================================================
  {
    id: 'p9_newton_three_laws_full',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Newton\'s Laws of Motion', ru: 'Законы взаимодействия и движения тел' },
    title: { en: 'Newton\'s Three Laws: Inertia, Force (F = ma), and Action-Reaction', ru: 'Три закона Ньютона: Закон инерции, основной закон динамики F = ma и закон действия-противодействия' },
    subtitle: { en: 'The bedrock of classical mechanics governing everyday motion', ru: 'Первый закон (инерциальные системы), второй закон F = ma, третий закон F₁ = -F₂' },
    textbookDefinition: {
      en: '1st Law: A body remains at rest or uniform motion unless acted upon by a net force. 2nd Law: Acceleration is proportional to net force and inversely to mass: a = F/m. 3rd Law: For every action, there is an equal and opposite reaction: F₁₂ = -F₂₁.',
      ru: '1-й закон: существуют инерциальные системы отсчета, в которых тело сохраняет покой или равномерное движение, если на него не действуют силы. 2-й закон: ускорение прямо пропорционально силе и обратно пропорционально массе: a = F / m. 3-й закон: тела действуют друг на друга с силами, равными по модулю и противоположными по направлению: F₁ = -F₂.'
    },
    studentConfusion: {
      en: 'If 3rd Law forces are equal and opposite, why don\'t they cancel out? Because they act on TWO DIFFERENT bodies!',
      ru: '«Если действие равно противодействию, почему тела вообще двигаются?». Потому что эти две силы приложены к РАЗНЫМ телам (нога толкает Землю, а Земля толкает человека вперед)!'
    },
    lifeAnalogy: {
      en: 'Stepping off a boat onto a dock: you push the boat backward with your foot, and the boat pushes you forward onto the dock.',
      ru: 'Прыжок с лодки на берег: ты толкаешь лодку назад, а лодка толкает тебя вперед. Лодка уплывает назад, а ты приземляешься на причал!'
    },
    momentObservation: {
      en: 'Fire rocket thruster in simulator: watch expelled gas rush left with force -F while rocket accelerates right with force +F.',
      ru: 'Включи реактивный двигатель в симуляторе: ракета с силой выбрасывает раскаленный газ назад, а реактивная сила толкает ракету к звездам!'
    },
    formula: 'F_{\\text{равн}} = m a, \\quad \\vec{F}_1 = -\\vec{F}_2',
    viewMode: 'moment_collision',
    simEngineType: 'newton_laws_freefall',
    keywords: ['newton', 'laws of motion', 'inertia', 'force', 'ньютон', 'законы ньютона', 'динамика', 'ускорение']
  },
  {
    id: 'p9_sound_waves_doppler_echo',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Mechanical Oscillations and Waves', ru: 'Механические колебания и волны. Звук' },
    title: { en: 'Sound Waves, Speed of Sound, Echo, and Doppler Pitch Shift', ru: 'Звуковые волны, скорость звука, эхо и эффект Доплера' },
    subtitle: { en: 'Why an approaching ambulance siren sounds higher in pitch and drops as it passes', ru: 'Продольные волны сжатия воздуха, отражение звука (эхолокация) и сжатие волновых фронтов' },
    textbookDefinition: {
      en: 'Sound is a longitudinal mechanical wave of air compression and rarefaction. Pitch corresponds to frequency (Hz); loudness to amplitude (dB). Doppler effect: observed frequency f\' increases when source approaches and decreases when receding.',
      ru: 'Звук — продольная механическая упругая волна в воздухе (сжатия и разрежения). Высота тона определяется частотой колебаний ν (Гц), громкость — амплитудой. Эффект Доплера: при приближении источника частота звука растет (высокий свист), при удалении — падает (низкий гул).'
    },
    studentConfusion: {
      en: 'Does sound travel in empty space vacuum? NEVER! Sound requires physical matter (atoms) to transmit vibrations.',
      ru: 'Школьники верят голливудским фильмам со взрывами в космосе. В вакууме царит абсолютная тишина — там нет молекул, чтобы передать звуковую волну!'
    },
    lifeAnalogy: {
      en: 'Throwing rocks into water from a moving speedboat: waves bunch up tightly ahead of the boat and stretch far apart behind it.',
      ru: 'Катер, бросающий волны на ходу: впереди катера круги волн набегают друг на друга плотной стопкой (высокая частота), а сзади отстают (низкая частота)!'
    },
    momentObservation: {
      en: 'Accelerate moving sound source in Doppler simulator: watch circular wavefronts bunch together ahead of the siren.',
      ru: 'Запусти симулятор эффекта Доплера: смотри, как перед мчащейся машиной скорой помощи волны сжимаются в синие плотные гребни высокой частоты!'
    },
    formula: 'v = \\lambda \\nu, \\quad f\' = f_0 \\frac{v}{v \\pm v_s}',
    viewMode: 'moment_doppler',
    simEngineType: 'waves_sound_doppler',
    keywords: ['sound', 'waves', 'doppler', 'echo', 'frequency', 'звук', 'доплер', 'эхо', 'частота', 'скорость звука']
  },
  {
    id: 'p9_electromagnetic_induction_lenz',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Electromagnetic Field', ru: 'Электромагнитное поле' },
    title: { en: 'Faraday\'s Law of Electromagnetic Induction & Lenz\'s Rule', ru: 'Электромагнитная индукция Фарадея и правило Ленца' },
    subtitle: { en: 'How all generators and power plants turn mechanical rotation into electricity', ru: 'Магнитный поток Φ = B·S·cos α, ЭДС индукции Ei = -ΔΦ/Δt, генераторы тока' },
    textbookDefinition: {
      en: 'Faraday’s law: an electromotive force (EMF) is induced in any closed circuit whenever the magnetic flux through the circuit changes: Ei = -dΦ/dt. Lenz’s rule: the induced current opposes the flux change that produced it.',
      ru: 'Закон Фарадея: в замкнутом проводящем контуре возникает индукционный электрический ток при всяком изменении магнитного потока через площадь контура: Ei = -ΔΦ / Δt. Правило Ленца: индукционный ток всегда препятствует причине, его порождающей.'
    },
    studentConfusion: {
      en: 'Does holding a strong magnet still inside a coil produce current? ZERO! Only MOTION (changing flux ΔΦ/Δt) creates voltage!',
      ru: 'Если засунуть самый мощный неодимовый магнит внутрь катушки и держать неподвижно — потечет ли ток? НОЛЬ тока! Ток рождается ТОЛЬКО в момент движения (изменения потока)!'
    },
    lifeAnalogy: {
      en: 'Bicycle dynamo generator: spinning the wheel rotates a magnet inside a copper coil, lighting the headlamp without any battery.',
      ru: 'Динамо-машина на велосипеде: крутишь педали — магнит вращается внутри катушки, и фара ярко светит без всяких батареек!'
    },
    momentObservation: {
      en: 'Plunge north pole of magnet into coil: see galvanometer needle jump left; pull magnet out, needle swings right.',
      ru: 'Вдвигай полосовой магнит в катушку в симуляторе: стрелка гальванометра отклоняется, а витки катушки светятся наведенным индукционным током!'
    },
    formula: '\\mathcal{E}_i = -\\frac{\\Delta \\Phi}{\\Delta t}, \\quad \\Phi = B S \\cos \\alpha',
    viewMode: 'moment_induction',
    simEngineType: 'faraday_induction_lenz',
    keywords: ['induction', 'faraday', 'lenz', 'magnetic flux', 'индукция', 'фарадей', 'ленц', 'магнитный поток']
  }
];
