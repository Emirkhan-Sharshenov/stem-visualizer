import { TextbookLesson } from '../types/stem';
import { DETAILED_PHYSICS_CURRICULUM } from './physicsCurriculumDetailed';
import { EXTENDED_PHYSICS_CURRICULUM } from './physicsCurriculumExtended';
import { DETAILED_CHEMISTRY_CURRICULUM } from './chemistryCurriculumDetailed';
import { DETAILED_BIOLOGY_CURRICULUM } from './biologyCurriculumDetailed';
import { DETAILED_MATH_CURRICULUM } from './mathCurriculumDetailed';

export const TEXTBOOK_LESSONS: TextbookLesson[] = [
  ...DETAILED_PHYSICS_CURRICULUM,
  ...EXTENDED_PHYSICS_CURRICULUM,
  ...DETAILED_CHEMISTRY_CURRICULUM,
  ...DETAILED_BIOLOGY_CURRICULUM,
  ...DETAILED_MATH_CURRICULUM,
  // =========================================================================
  // ДОПОЛНИТЕЛЬНЫЕ И ДРУГИЕ ПРЕДМЕТЫ (CHEMISTRY, BIOLOGY, MATH)
  // =========================================================================
  {
    id: 'lesson_diffusion',
    grade: 'grade_5_6',
    category: 'physics',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    title: { en: 'Diffusion & Brownian Motion', ru: 'Диффузия и броуновское движение' },
    subtitle: { en: 'Why tea spreads in hot water faster than in cold', ru: 'Почему чай заваривается в кипятке за секунды, а в холодной воде еле-еле' },
    textbookDefinition: {
      en: 'Diffusion is the spontaneous mixing of substances caused by the random thermal motion of their constituent molecules.',
      ru: 'Диффузия — явление взаимного проникновения молекул одного вещества между молекулами другого, обусловленное их непрерывным беспорядочным тепловым движением.'
    },
    studentConfusion: {
      en: 'In books, it just says "molecules move". But why does sugar disappear, and why do things mix without anyone stirring?',
      ru: 'В учебнике пишут: «молекулы движутся». Но ребёнок не видит молекул и не понимает, кто их толкает и почему в горячем чае всё происходит в разы быстрее.'
    },
    lifeAnalogy: {
      en: 'Imagine 100 blindfolded kids jumping in a gym. If you spray perfume in the corner, they randomly bump into scent particles, spreading them everywhere.',
      ru: 'Представь спортзал с сотней прыгающих мячей. Чем выше температура — тем сильнее и быстрее они отскакивают от стен и толкают всё вокруг!'
    },
    momentObservation: {
      en: 'In this simulation moment: Watch individual water molecules collide into the heavy dye particle thousands of times per second. Slow down time to 0.1x to see each hit!',
      ru: 'В этот момент симуляции: Тысячи невидимых молекул воды непрерывно бомбардируют каплю красителя. Замедли время до 0.1x — увидишь каждый микроудар!'
    },
    viewMode: 'moment_diffusion',
    keywords: ['diffusion', 'brownian', 'molecules', 'temperature', 'диффузия', 'броуновское', 'молекулы', 'температура']
  },
  {
    id: 'lesson_lever',
    grade: 'grade_5_6',
    category: 'physics',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    title: { en: 'Simple Machines: The Lever Rule', ru: 'Простые механизмы: Рычаг Архимеда' },
    subtitle: { en: 'How a child can lift an elephant', ru: 'Как маленький ребёнок может поднять огромный камень или взрослого' },
    textbookDefinition: {
      en: 'A lever is in equilibrium when the clockwise moment of force equals the counterclockwise moment: F₁ · L₁ = F₂ · L₂.',
      ru: 'Рычаг находится в равновесии тогда, когда силы, действующие на него, обратно пропорциональны плечам этих сил: F₁ · L₁ = F₂ · L₂.'
    },
    studentConfusion: {
      en: 'Why does moving further from the pivot make heavy weights feel weightless? What is "lever arm"?',
      ru: 'Почему, если отодвинуться дальше от оси качелей, даже тяжелый папа легко поднимается вверх? Что такое «плечо силы»?'
    },
    lifeAnalogy: {
      en: 'Opening a door: pushing near the hinge is almost impossible; pushing near the handle requires one finger!',
      ru: 'Вспомни тяжелую дверь: если толкать её около петель, с места не сдвинешь. А за ручку с самого края — толкаешь одним пальцем!'
    },
    momentObservation: {
      en: 'In this simulation moment: Change distance L₁ and watch the force gauge balance out in real time!',
      ru: 'В этот момент симуляции: Меняй длину плеча L₁ и смотри, как стрелка динамометра мгновенно уравновешивает груз!'
    },
    formula: 'F_1 \\cdot L_1 = F_2 \\cdot L_2',
    viewMode: 'moment_lever',
    keywords: ['lever', 'archimedes', 'force', 'moment', 'рычаг', 'архимед', 'плечо', 'момент']
  },
  {
    id: 'lesson_states_of_matter',
    grade: 'grade_7_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 7-8', ru: '7-8 Класс' },
    title: { en: 'States of Matter: Ice → Water → Steam', ru: 'Агрегатные состояния: Лёд → Вода → Пар' },
    subtitle: { en: 'What actually breaks when ice melts into water?', ru: 'Что физически происходит с кристаллической решеткой при плавлении?' },
    textbookDefinition: {
      en: 'Solid, liquid, and gaseous states differ in the arrangement, motion, and interaction energy of their constituent particles.',
      ru: 'Вещество может находиться в трех агрегатных состояниях: твердом, жидком и газообразном, различающихся расположением и характером движения молекул.'
    },
    studentConfusion: {
      en: 'Are the molecules themselves melting? No! The molecules stay identical H₂O — only their binding bonds break!',
      ru: 'Школьники часто думают, что плавится сама молекула. Но молекула H₂O остается абсолютно той же! Рвутся только связи между ними.'
    },
    lifeAnalogy: {
      en: 'Solid = kids holding hands tightly in formation; Liquid = crowded dance floor slipping past each other; Gas = people running at top speed across a field.',
      ru: 'Твердое тело — дети крепко держатся за руки шеренгой. Жидкость — дискотека, где все толкаются и скользят. Газ — игроки в регби, с бешеной скоростью разлетающиеся по полю.'
    },
    momentObservation: {
      en: 'Heat up the lattice to 0°C and watch the rigid hexagonal crystal grid shake violently and collapse into flowing liquid!',
      ru: 'Нагрей лед до 0°C: посмотри в замедленной съемке, как жесткая шестиугольная решетка начинает бешено дрожать и рассыпается в текучую воду!'
    },
    viewMode: 'moment_states',
    keywords: ['ice', 'water', 'steam', 'crystal', 'states', 'лед', 'вода', 'пар', 'фазовый переход', 'агрегатные']
  },
  {
    id: 'lesson_optics_refraction',
    grade: 'grade_7_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 7-8', ru: '7-8 Класс' },
    title: { en: 'Light Refraction & Snell\'s Law', ru: 'Преломление света и закон Снеллиуса' },
    subtitle: { en: 'Why a pencil looks broken in a glass of water', ru: 'Почему карандаш кажется сломанным в стакане воды' },
    textbookDefinition: {
      en: 'The ratio of the sine of the angle of incidence to the sine of the angle of refraction equals the ratio of phase velocities: sin(α)/sin(β) = n₂/n₁.',
      ru: 'Отношение синуса угла падения к синусу угла преломления есть величина постоянная для двух данных сред: sin(α) / sin(β) = n₂ / n₁.'
    },
    studentConfusion: {
      en: 'Why does light bend? Does it get squeezed by the glass?',
      ru: 'Почему луч вообще сгибается на границе? Стекло его физически преломляет или свет «устает»?'
    },
    lifeAnalogy: {
      en: 'A lawnmower rolling from smooth pavement into thick sand at an angle: the wheel hitting sand first slows down, pivoting the entire mower!',
      ru: 'Тележка, съезжающая с асфальта на вязкий песок под углом: колесо, которое первым попало в песок, замедляется, и вся тележка резко поворачивает!'
    },
    momentObservation: {
      en: 'Watch the wavefront strike the optical boundary. Drag the incident angle slider and observe total internal reflection at critical angle!',
      ru: 'Наблюдай за волновым фронтом в момент касания границы сред. Меняй угол и поймай угол полного внутреннего отражения!'
    },
    formula: 'n_1 \\sin\\alpha = n_2 \\sin\\beta',
    viewMode: 'moment_optics',
    keywords: ['optics', 'refraction', 'snell', 'light', 'оптика', 'преломление', 'снеллиус', 'луч', 'свет']
  },
  {
    id: 'lesson_circuit_ohm',
    grade: 'grade_7_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    title: { en: 'Electric Circuit & Ohm\'s Law', ru: 'Электрический ток и Закон Ома (I = U / R)' },
    subtitle: { en: 'Visualizing moving electrons, potential drop and resistor heat', ru: 'Как электроны продираются сквозь кристаллическую решетку проводника' },
    textbookDefinition: {
      en: 'Current is directly proportional to voltage and inversely proportional to resistance: I = U / R.',
      ru: 'Сила тока на участке цепи прямо пропорциональна напряжению на концах этого участка и обратно пропорциональна его сопротивлению: I = U / R.'
    },
    studentConfusion: {
      en: 'Are electrons consumed like fuel? No! The same number of electrons come out of the bulb as entered; only their energy is spent as light & heat!',
      ru: 'Дети часто думают, что электроны «сгорают» в лампочке, как бензин. Нет! Сколько электронов влетело в спираль, столько же и вылетело — тратится только их потенциальная энергия!'
    },
    lifeAnalogy: {
      en: 'A water pipe with a pump: Voltage is water pressure from the pump; Resistance is a section stuffed with gravel; Current is liters of water per second.',
      ru: 'Водопровод с насосом: Напряжение (U) — это напор насоса. Сопротивление (R) — сужение трубы или гравий. Сила тока (I) — сколько литров воды протекает в секунду.'
    },
    momentObservation: {
      en: 'Drag the Resistance slider up: watch the speed of drift electrons slow down immediately and the filament bulb dim in real time!',
      ru: 'Увеличь сопротивление с 2 до 15 Ом: смотри, как скорость дрейфа синих электронов падает, а нить накала тускнеет!'
    },
    formula: 'I = \\frac{U}{R}, \\quad P = I \\cdot U = I^2 R',
    viewMode: 'moment_circuit',
    keywords: ['circuit', 'ohm', 'voltage', 'current', 'ток', 'напряжение', 'ом', 'сопротивление']
  },
  {
    id: 'lesson_newton_collision',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    title: { en: 'Newton\'s 2nd & 3rd Laws: Elastic Collision', ru: 'Законы Ньютона: Упругий удар и импульс' },
    subtitle: { en: 'What happens in the exact microsecond of impact?', ru: 'Что происходит в точную микросекунду столкновения двух тел?' },
    textbookDefinition: {
      en: 'The rate of change of momentum equals the net external force: F = dp/dt. Action equals reaction: F₁₂ = -F₂₁.',
      ru: 'Ускорение тела прямо пропорционально силе и обратно пропорционально массе: a = F/m. Силы взаимодействия двух тел равны по модулю и противоположны по направлению.'
    },
    studentConfusion: {
      en: 'If a massive truck hits a tiny mosquito, did they really push each other with the EXACT same force? Yes!',
      ru: '«Неужели комар бьет грузовик с ТОЧНО ТАКОЙ ЖЕ силой, как грузовик комара?» Да! Силы абсолютно равны, но из-за крошечной массы комара его ускорение чудовищно.'
    },
    lifeAnalogy: {
      en: 'Two ice skaters on slippery ice: if an adult pushes a child, both slide backwards, but the child flies back much faster.',
      ru: 'Два фигуриста на скользком льду: взрослый отталкивает ребенка. Оба разъезжаются в разные стороны, но легкий ребенок летит втрое быстрее!'
    },
    momentObservation: {
      en: 'Hit Slow-Motion 0.1x: Watch the kinetic energy compress into elastic spring energy at peak impact, then violently propel bodies apart!',
      ru: 'Включи замедление 0.1x: смотри, как кинетическая энергия в момент соударения переходит в сжатие пружины, а затем отталкивает тележки назад!'
    },
    formula: '\\vec{F}_{12} = -\\vec{F}_{21}, \\quad m_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
    viewMode: 'moment_collision',
    keywords: ['collision', 'newton', 'momentum', 'elastic', 'столкновение', 'ньютон', 'импульс', 'удар']
  },
  {
    id: 'lesson_gravity_newton',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    title: { en: 'Law of Universal Gravitation', ru: 'Закон всемирного тяготения' },
    subtitle: { en: 'Why doubling distance cuts pull by 4x, not 2x', ru: 'Почему удвоение расстояния ослабляет силу притяжения вчетверо, а не вдвое' },
    textbookDefinition: {
      en: 'Every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of distance.',
      ru: 'Сила гравитационного притяжения двух тел прямо пропорциональна произведению их масс и обратно пропорциональна квадрату расстояния между ними: F = G·(m₁·m₂)/r².'
    },
    studentConfusion: {
      en: 'Students forget the squared term (r²) and imagine a linear rubber band.',
      ru: 'Школьники часто забывают про квадрат (r²) и думают, что гравитация натягивается как линейная резинка.'
    },
    lifeAnalogy: {
      en: 'Shining a flashlight on a wall: at double distance, the light beam covers 4 times the area, so brightness per spot drops by 1/4.',
      ru: 'Свет фонарика на стене: если отойти в 2 раза дальше, световое пятно занимает в 4 раза большую площадь, поэтому яркость падает в 4 раза!'
    },
    momentObservation: {
      en: 'Change r from 10 to 20 with the slider and watch the green vector arrow shrink to 1/4th length instantly!',
      ru: 'Передвинь ползунок расстояния с 10 до 20: векторная стрелка силы сократится ровно в 4 раза на твоих глазах!'
    },
    formula: 'F = G \\frac{m_1 m_2}{r^2}',
    viewMode: 'physics_gravity',
    keywords: ['gravity', 'newton', 'orbit', 'mass', 'гравитация', 'ньютон', 'масса', 'расстояние']
  },
  {
    id: 'lesson_pendulum_harmonic',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    title: { en: 'Mechanical Oscillations: Simple Pendulum', ru: 'Колебания: Математический маятник' },
    subtitle: { en: 'Perpetual trade between kinetic and potential energy', ru: 'Вечный обмен между кинетической и потенциальной энергией' },
    textbookDefinition: {
      en: 'A mathematical pendulum undergoes simple harmonic motion with period T = 2π√(L/g) for small angular displacements.',
      ru: 'Период малых колебаний математического маятника зависит только от длины нити L и ускорения свободного падения g: T = 2π√(L/g).'
    },
    studentConfusion: {
      en: 'Does a heavy lead bob swing faster than a light wooden bob? No! Mass cancels out completely in Galileo’s equation.',
      ru: '«Тяжелый металлический шарик будет качаться быстрее деревянного?» Нет! Период колебаний ВООБЩЕ не зависит от массы груза.'
    },
    lifeAnalogy: {
      en: 'A skateboarder in a halfpipe: at the highest point, speed is zero (100% potential energy); at the bottom, potential is zero and speed is maximum (100% kinetic energy).',
      ru: 'Скейтбордист в рампе: в наивысшей точке скорость замирает в ноль (вся энергия потенциальная). В нижней точке высота ноль, а скорость максимальная!'
    },
    momentObservation: {
      en: 'Watch the real-time energy bars: as E_pot drops to zero at the bottom, E_kin surges to maximum, keeping E_total perfectly constant!',
      ru: 'Следи за шкалами энергии: в нижней точке E_пот падает в ноль, а E_кин взлетает до максимума, сохраняя полную сумму постоянной!'
    },
    formula: 'T = 2\\pi \\sqrt{\\frac{L}{g}}, \\quad E = E_{\\text{пот}} + E_{\\text{кин}} = \\text{const}',
    viewMode: 'moment_pendulum',
    keywords: ['pendulum', 'oscillation', 'period', 'energy', 'маятник', 'колебания', 'период', 'энергия']
  },
  {
    id: 'lesson_electromagnetic_induction',
    grade: 'grade_10_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Faraday\'s Electromagnetic Induction', ru: 'Электромагнитная индукция Фарадея' },
    subtitle: { en: 'How moving a simple magnet through copper wires creates electricity', ru: 'Как движение обычного магнита внутри катушки рождает электрический ток' },
    textbookDefinition: {
      en: 'Electromotive force induced in any closed circuit is equal to the negative time rate of change of magnetic flux through the circuit: ℰ = -dΦ/dt.',
      ru: 'ЭДС индукции в замкнутом проводящем контуре пропорциональна скорости изменения магнитного потока через поверхность, ограниченную этим контуром: ℰ = -dΦ/dt.'
    },
    studentConfusion: {
      en: 'If a magnet just sits inside the coil, does it make current? No! Only MOVEMENT (change in flux dΦ/dt) creates current.',
      ru: 'Школьники часто думают: «раз магнит сильный, ток уже должен течь». Нет! Если магнит неподвижен — тока ноль. Ток рождается только в момент ДВИЖЕНИЯ!'
    },
    lifeAnalogy: {
      en: 'A wind turbine: calm air produces zero megawatts; only rushing air blowing past the blades spins the generator.',
      ru: 'Ветрогенератор: стоячий воздух дает ноль энергии. Только пролетающий сквозь лопасти ветер заставляет электроны бежать по проводам!'
    },
    momentObservation: {
      en: 'In this simulation moment: Move the bar magnet into the coil. Watch the magnetic field lines cross the copper turns, lighting up the bulb proportional to speed!',
      ru: 'В этот момент симуляции: Двигай магнит сквозь катушку. Чем быстрее он летит — тем ярче вспыхивает лампочка и сильнее отклоняется стрелка вольтметра!'
    },
    formula: '\\mathcal{E} = -N \\frac{d\\Phi}{dt}',
    viewMode: 'moment_induction',
    keywords: ['induction', 'faraday', 'magnet', 'flux', 'индукция', 'фарадей', 'магнит', 'катушка', 'ток']
  },
  {
    id: 'lesson_relativity_time',
    grade: 'grade_10_11',
    category: 'physics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Special Relativity: Time Dilation', ru: 'Теория относительности: Замедление времени' },
    subtitle: { en: 'Why time literally ticks slower for someone traveling near speed of light', ru: 'Почему часы космонавта на околосветовой скорости тикают медленнее, чем на Земле' },
    textbookDefinition: {
      en: 'Time interval Δt measured by an observer in relative motion is dilated by the Lorentz factor: Δt = Δt₀ / √(1 - v²/c²).',
      ru: 'Время в движущейся системе отсчета течет медленнее с точки зрения покоящегося наблюдателя в соответствии с формулой Лоренца: Δt = Δt₀ / √(1 - v²/c²).'
    },
    studentConfusion: {
      en: 'Is the clock broken, or is time itself actually slowing down? Time itself stretches because the speed of light c is absolute!',
      ru: '«Часы просто ломаются от тряски?» Нет! Само пространство и время деформируются, потому что скорость света c абсолютна для всех.'
    },
    lifeAnalogy: {
      en: 'Light clock in a train: for someone inside, a photon bounces straight up and down. For someone on the platform, the photon traces a long diagonal zigzag path!',
      ru: 'Световые часы в вагоне: пассажир видит, как фотон прыгает строго вверх-вниз. А стоящий на перроне видит длинную наклонную диагональ!'
    },
    momentObservation: {
      en: 'Accelerate the rocket from 0 to 0.99c: Compare the passenger’s clock with Earth’s clock in real-time side-by-side simulation!',
      ru: 'Разгони ракету до 0.99c: посмотри на световой луч внутри движущегося корабля и сравни ход часов космонавта и земных часов!'
    },
    formula: '\\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - v^2/c^2}}',
    viewMode: 'moment_relativity',
    keywords: ['relativity', 'einstein', 'time dilation', 'lorentz', 'относительность', 'эйнштейн', 'замедление времени', 'свет']
  },

  // =========================================================================
  // 🧪 ХИМИЯ (CHEMISTRY) — 7–11 КЛАССЫ
  // =========================================================================
  {
    id: 'lesson_chemical_bonds',
    grade: 'grade_7_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8-9', ru: '8-9 Класс' },
    title: { en: 'Chemical Bonding: Covalent & Ionic', ru: 'Химическая связь: Ковалентная и Ионная' },
    subtitle: { en: 'Sharing electrons equally vs total electron theft', ru: 'Братский союз двух атомов против дерзкой кражи электрона' },
    textbookDefinition: {
      en: 'A chemical bond is the physical phenomenon of chemical substances being held together by attraction between atoms or ions, formed by sharing or transferring valence electrons.',
      ru: 'Химическая связь — совокупность сил взаимодействия между атомами, приводящая к образованию устойчивых молекул или кристаллических решеток за счет обобществления или перехода электронов.'
    },
    studentConfusion: {
      en: 'What is the actual difference between covalent and ionic? Why doesn’t table salt have single molecules?',
      ru: 'В чем разница между ковалентной и ионной связью? Почему молекулы поваренной соли NaCl в твердом виде не существует, а есть единая бесконечная кристаллическая решетка?'
    },
    lifeAnalogy: {
      en: 'Covalent = two kids sharing a single bicycle together. Ionic = one kid giving their bike away, so now they stick together like opposite magnets (+ and -).',
      ru: 'Ковалентная — два друга катаются на одном велосипеде по очереди (общий электрон). Ионная — один подарил велосипед другому навсегда, стал плюсом, а второй минусом, и теперь они притягиваются!'
    },
    momentObservation: {
      en: 'Switch between H₂ (nonpolar sharing), HCl (polar shift), and NaCl (full electron transfer into Na⁺ and Cl⁻ with cubic salt grid attraction)!',
      ru: 'Переключай: неполярная H₂ (симметричное облако), полярная HCl (смещение к хлору) и ионная NaCl (натрий отдает электрон хлору, образуя Na⁺ и Cl⁻)!'
    },
    formula: '\\text{H}\\cdot + \\cdot\\text{H} \\rightarrow \\text{H}:\\text{H}, \\quad \\text{Na} + \\text{Cl} \\rightarrow \\text{Na}^+ + \\text{Cl}^-',
    viewMode: 'moment_chemical_bond',
    keywords: ['bonding', 'covalent', 'ionic', 'electrons', 'связь', 'ковалентная', 'ионная', 'электроны']
  },
  {
    id: 'lesson_orbitals_quantum',
    grade: 'grade_10_11',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Atomic Orbitals & Quantum Numbers (s, p, d, f)', ru: 'Атомные орбитали и квантовые числа (s, p, d, f)' },
    subtitle: { en: 'Why electrons are clouds, not billiard balls on railway tracks', ru: 'Почему электроны — это объемные облака вероятности, а не шарики на орбитах' },
    textbookDefinition: {
      en: 'An atomic orbital is a mathematical wavefunction describing the wave-like behavior of an electron in an atom, where |ψ|² represents probability density.',
      ru: 'Атомная орбиталь — это одноэлектронная волновая функция ψ, квадрат модуля которой |ψ|² определяет плотность вероятности нахождения электрона в данной точке пространства.'
    },
    studentConfusion: {
      en: 'Schoolchildren imagine planet Bohr orbits and cannot visualize where the electron actually is.',
      ru: 'Школьники представляют орбиту как проволочное кольцо Бора и не понимают, как электрон может «быть размазан» в пространстве и иметь узлы с нулевой вероятностью.'
    },
    lifeAnalogy: {
      en: 'A helicopter propeller spinning at 3000 RPM: you cannot say where the blade is right now, but you see a translucent solid disk of probability!',
      ru: 'Вращающийся на полной скорости пропеллер вертолета: ты не можешь ткнуть пальцем, где лопасть прямо сейчас, но видишь полупрозрачный объемный диск вероятности!'
    },
    momentObservation: {
      en: 'Switch between 1s sphere and 2pz dumbbell: watch the nodal plane appear in the center where electron probability drops to strict zero!',
      ru: 'Переключи со сферы 1s на гантель 2pz: увидишь, как через центр ядра проходит узловая плоскость с нулевой вероятностью нахождения электрона!'
    },
    formula: '\\hat{H}\\psi = E\\psi, \\quad |\\psi(r,\\theta,\\phi)|^2',
    viewMode: 'orbitals',
    keywords: ['orbital', 'quantum', 'schrodinger', 'node', 'орбиталь', 'квант', 'шрёдингер', 'узел']
  },
  {
    id: 'lesson_deconstruct_h2o',
    grade: 'grade_10_11',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Molecular Geometry: Deconstruct H₂O', ru: 'Анатомия молекулы: Почему вода согнута под 104.5°' },
    subtitle: { en: 'From sp³ hybridization to lone pair electron repulsion', ru: 'От смешивания орбиталей до взаимного расталкивания неподеленных пар' },
    textbookDefinition: {
      en: 'Water molecule has a bent geometry (C2v) with a bond angle of 104.5° due to tetrahedral sp³ hybridization compressed by two non-bonding electron pairs.',
      ru: 'Молекула воды имеет угловую форму с углом 104.5° вследствие sp³-гибридизации валентных орбиталей кислорода и отталкивания двух неподеленных электронных пар.'
    },
    studentConfusion: {
      en: 'Why isn’t H-O-H straight (180°) like CO₂? Where are the invisible electrons pushing it down?',
      ru: 'Почему вода согнута, а углекислый газ O=C=O абсолютно прямой? Где прячутся «невидимые» электроны?'
    },
    lifeAnalogy: {
      en: 'Trying to hold 4 large inflated balloons tied together: they naturally push away into a 3D tripod tetrahedron.',
      ru: 'Четыре надутых воздушных шарика, связанные в один узел: они сами расталкиваются в стороны и выстраиваются в форму объемного тетраэдра!'
    },
    momentObservation: {
      en: 'Step through the 6 deconstruction phases or hit "Force 180°" to watch the lone pairs repel the hydrogens back to 104.5°!',
      ru: 'Пройди 6 шагов деконструкции или нажми «Распрямить в 180°»: увидишь, как электронные пары пружинят и возвращают угол 104.5°!'
    },
    formula: '\\text{Angle} = 104.5^\\circ, \\quad \\vec{\\mu} \\approx 1.85 \\text{ D}',
    viewMode: 'deconstruction',
    keywords: ['water', 'hybridization', 'sp3', 'bent', 'vsepr', 'вода', 'гибридизация', 'неподеленные пары']
  },
  {
    id: 'lesson_pauli_exclusion',
    grade: 'grade_10_11',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Pauli Exclusion Principle & Spin', ru: 'Принцип запрета Паули и спин электрона' },
    subtitle: { en: 'Why matter doesn’t collapse into infinite density', ru: 'Почему атомы не сжимаются в точку и электроны не падают на ядро' },
    textbookDefinition: {
      en: 'No two identical fermions can occupy the same quantum state simultaneously: each must possess a unique set of quantum numbers (n, ℓ, m, s).',
      ru: 'В квантовой системе два одинаковых фермиона не могут одновременно находиться в одном и том же квантовом состоянии: в одной ячейке может быть максимум 2 электрона с противоположными спинами (↑ и ↓).'
    },
    studentConfusion: {
      en: 'Why can’t 3 electrons fit into the 1s box? What is "spin" — is the electron literally a spinning top?',
      ru: 'Почему в первую ячейку нельзя запихать 3 или 4 электрона? Что такое спин?'
    },
    lifeAnalogy: {
      en: 'Reserved theatre seats: one ticket per seat. A quantum state is a single seat with exact row, seat number, and orientation.',
      ru: 'Места в купе поезда: на одной полке может лежать только один человек. Электроны — это пассажиры, которые не выносят одинаковых билетов!'
    },
    momentObservation: {
      en: 'In Sandbox mode: Try dragging a 3rd electron into the 1s cell — watch the system reject it with an alarm sound!',
      ru: 'В режиме «Сломай модель»: Попробуй поместить третий электрон в ячейку 1s — система выдаст ошибку и вытолкнет его!'
    },
    viewMode: 'break_model',
    keywords: ['pauli', 'spin', 'exclusion', 'fermions', 'паули', 'спин', 'запрет', 'электрон']
  },

  // =========================================================================
  // 🧬 БИОЛОГИЯ (BIOLOGY) — 5–11 КЛАССЫ
  // =========================================================================
  {
    id: 'lesson_photosynthesis',
    grade: 'grade_5_6',
    category: 'biology',
    gradeBadge: { en: 'Grade 6-7', ru: '6-7 Класс' },
    title: { en: 'Photosynthesis in Plant Chloroplasts', ru: 'Фотосинтез: Фабрика сахара в хлоропласте' },
    subtitle: { en: 'How green leaves capture sunlight photons to split water into oxygen', ru: 'Как обычный зелёный лист ловит кванты света и расщепляет воду на кислород' },
    textbookDefinition: {
      en: 'Photosynthesis is the process by which green plants and certain organisms use sunlight to synthesize nutrients from carbon dioxide and water, releasing oxygen: 6CO₂ + 6H₂O + hν → C₆H₁₂O₆ + 6O₂.',
      ru: 'Фотосинтез — процесс синтеза органических соединений (глюкозы) из неорганических (CO₂ и H₂O) с использованием энергии солнечного света при участии хлорофилла: 6CO₂ + 6H₂O + свет → C₆H₁₂O₆ + 6O₂.'
    },
    studentConfusion: {
      en: 'Students think plants "breathe CO2 and exhale O2 like lungs". But oxygen is just a byproduct of splitting water!',
      ru: 'Школьники думают, что растение «вдыхает CO2 и выдыхает кислород». На самом деле кислород — это просто «выхлоп» от расщепления молекулы воды H₂O для добычи электронов!'
    },
    lifeAnalogy: {
      en: 'A solar-powered bakery: sunlight powers the mixer, flour (CO₂) and water (H₂O) bake into bread (glucose), while steam/oxygen is vented out the roof.',
      ru: 'Солнечная пекарня: свет дает электричество, мука (углекислый газ) и вода замешиваются в каравай хлеба (глюкозу), а лишний пар (кислород) улетает в окно.'
    },
    momentObservation: {
      en: 'Increase the light intensity slider: watch streams of yellow photons bombard the thylakoid grana, accelerating the release of green O₂ bubbles!',
      ru: 'Увеличь ползунок света: потоки фотонов обрушатся на граны тилакоидов, ускоряя выделение пузырьков кислорода O₂ и синтез глюкозы!'
    },
    formula: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    viewMode: 'moment_photosynthesis',
    keywords: ['photosynthesis', 'chloroplast', 'chlorophyll', 'glucose', 'oxygen', 'фотосинтез', 'хлоропласт', 'глюкоза', 'кислород']
  },
  {
    id: 'lesson_dna_helix',
    grade: 'grade_9',
    category: 'biology',
    gradeBadge: { en: 'Grade 9-10', ru: '9-10 Класс' },
    title: { en: 'DNA Structure & Base Complementarity', ru: 'Строение ДНК и комплементарность' },
    subtitle: { en: 'How a 2-meter long molecule encodes your entire body', ru: 'Как двухметровая молекула внутри клетки хранит весь чертёж твоего организма' },
    textbookDefinition: {
      en: 'DNA is a double-stranded macromolecule consisting of complementary antiparallel nucleotide chains linked by hydrogen bonds (A=T, G≡C).',
      ru: 'ДНК — биополимер, состоящий из двух комплементарных антипараллельных полинуклеотидных цепей, соединенных водородными связями между аденином и тимином (A=T), гуанином и цитозином (G≡C).'
    },
    studentConfusion: {
      en: 'Students memorize A-T and G-C as letters, without realizing they are physical 3D puzzle pieces that fit only one way!',
      ru: 'Ученики зазубривают буквы А, Т, Г, Ц, не понимая, что это объемные 3D детальки лего, которые подходят друг к другу по форме и числу водородных связей.'
    },
    lifeAnalogy: {
      en: 'A lock and key, or a zipper on a jacket: teeth mesh only in one exact alignment.',
      ru: 'Застежка-молния на куртке: зубчики цепляются друг за друга только в строгом порядке, а при копировании молния легко расстегивается!'
    },
    momentObservation: {
      en: 'Hit "Unzip (Replication)": Watch the hydrogen bonds uncouple as the double helix separates into two template strands!',
      ru: 'Нажми «Расплести (Репликация)»: посмотри, как водородные связи разъединяются, и спираль превращается в две матрицы для копирования!'
    },
    formula: 'A = T \\quad (2 \\text{ H-bonds}), \\quad G \\equiv C \\quad (3 \\text{ H-bonds})',
    viewMode: 'moment_dna',
    keywords: ['dna', 'nucleotide', 'adenine', 'thymine', 'replication', 'днк', 'аденин', 'тимин', 'гуанин', 'цитозин', 'комплементарность']
  },
  {
    id: 'lesson_mendel_genetics',
    grade: 'grade_9',
    category: 'biology',
    gradeBadge: { en: 'Grade 9-10', ru: '9-10 Класс' },
    title: { en: 'Mendel\'s Laws & Punnett Square', ru: 'Генетика Менделя и Решетка Пеннета' },
    subtitle: { en: 'Why brown-eyed parents can have a blue-eyed child (3:1 ratio)', ru: 'Почему у кареглазых родителей может родиться голубоглазый малыш' },
    textbookDefinition: {
      en: 'The law of segregation states that allele pairs separate during gamete formation and randomly unite at fertilization, yielding a 3:1 phenotypic ratio in monohybrid crosses (Aa × Aa).',
      ru: 'Закон расщепления (второй закон Менделя): при скрещивании двух гетерозиготных потомков первого поколения во втором поколении наблюдается расщепление по фенотипу в соотношении 3:1, по генотипу 1:2:1.'
    },
    studentConfusion: {
      en: 'Students confuse genotype (DNA letters) with phenotype (what you physically see).',
      ru: 'Школьники путают генотип (скрытые гены) и фенотип (внешний вид). Если ген рецессивный, он может дремать в ДНК поколениями!'
    },
    lifeAnalogy: {
      en: 'Flipping two coins at the same time: HH (25%), HT (50%), TT (25%). If Tails is recessive, 75% show Heads and 25% show Tails.',
      ru: 'Подбрасывание двух монеток: Орел-Орел (25%), Орел-Решка (50%), Решка-Решка (25%). Если решка — рецессивный признак, она проявится ровно в 1 из 4 случаев!'
    },
    momentObservation: {
      en: 'Toggle mother and father alleles between A and a: watch the Punnett square recalculate flower colors and probability instantly!',
      ru: 'Переключай аллели родителей Aa × Aa: смотри, как в решетке Пеннета 1 из 4 цветков становится белым (aa), доказывая закон 3:1!'
    },
    formula: 'Aa \\times Aa \\rightarrow 1AA : 2Aa : 1aa \\quad (3\\text{ dominant} : 1\\text{ recessive})',
    viewMode: 'moment_mendel',
    keywords: ['mendel', 'genetics', 'punnett', 'allele', 'dominant', 'recessive', 'мендель', 'генетика', 'пеннет', 'доминант', 'рецессив']
  },
  {
    id: 'lesson_mitochondria_atp',
    grade: 'grade_10_11',
    category: 'biology',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Cellular Bioenergetics: ATP Synthase Turbine', ru: 'Биоэнергетика: Нано-турбина АТФ-синтазы' },
    subtitle: { en: 'The rotary motor inside your cells spinning at 9,000 RPM right now', ru: 'Настоящий механический электромотор внутри твоих клеток' },
    textbookDefinition: {
      en: 'ATP synthase is a rotary enzyme that catalyzes the synthesis of ATP from ADP and phosphate, driven by the proton electrochemical gradient.',
      ru: 'АТФ-синтаза — ферментный комплекс, осуществляющий фосфорилирование АДФ до АТФ за счет энергии протонного градиента на внутренней мембране митохондрий.'
    },
    studentConfusion: {
      en: 'Biology books show static drawings. Students don\'t realize this is an actual physical spinning motor with stator and rotor!',
      ru: 'В учебниках биологии это скучные цветные шарики. Ученики не осознают, что это реальный механический мотор с ротором и статором!'
    },
    lifeAnalogy: {
      en: 'A hydroelectric dam: water stored high up rushes through water turbines, physically turning the generator to power a city.',
      ru: 'Плотина гидроэлектростанции: вода, накопленная сверху, с силой падает вниз и крутит водяную турбину, зажигая огни города!'
    },
    momentObservation: {
      en: 'Adjust the H+ proton gradient slider: watch the central c-ring rotor spin faster and synthesize ATP molecules in real time!',
      ru: 'Меняй протонный градиент H+: ротор начинает бешено крутиться и синтезировать молекулы АТФ прямо на твоих глазах!'
    },
    formula: '\\Delta p = \\Delta\\psi - 60\\Delta\\text{pH}',
    viewMode: 'biology_cell',
    keywords: ['mitochondria', 'atp', 'synthase', 'proton', 'митохондрия', 'атф', 'синтаза', 'протон']
  },

  // =========================================================================
  // 📐 МАТЕМАТИКА (MATHEMATICS) — 5–11 КЛАССЫ
  // =========================================================================
  {
    id: 'lesson_trig_circle',
    grade: 'grade_9',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 9-10', ru: '9-10 Класс' },
    title: { en: 'Trigonometric Unit Circle (sin, cos, tan)', ru: 'Единичный круг и тригонометрия' },
    subtitle: { en: 'Why sine and cosine are just vertical and horizontal shadows', ru: 'Почему синус и косинус — это просто тени вращающейся точки' },
    textbookDefinition: {
      en: 'The trigonometric circle is a circle of unit radius (R = 1) centered at the origin, where for angle θ, x = cos(θ) and y = sin(θ).',
      ru: 'Тригонометрический круг — окружность единичного радиуса с центром в начале координат, где для любого угла θ абсцисса точки равна cos(θ), а ордината равна sin(θ).'
    },
    studentConfusion: {
      en: 'Students memorize huge tables of numbers (sin 30° = 1/2) without seeing that it is simply the height of a point on a clock face!',
      ru: 'Школьники мучительно зубрят таблицы синусов, не понимая, что синус — это просто высота точки над полом, а косинус — ее расстояние от центральной стены!'
    },
    lifeAnalogy: {
      en: 'A Ferris wheel with a searchlight: as you go around, your shadow on the ground is Cosine, and your shadow on the vertical wall is Sine.',
      ru: 'Колесо обозрения в темноте: фонарик светит сверху — твоя тень на земле бегает влево-вправо (косинус). Фонарик светит сбоку — тень на стене бегает вверх-вниз (синус)!'
    },
    momentObservation: {
      en: 'Rotate the angle slider: watch the green vertical bar stretch and shrink, drawing the continuous smooth sine wave on the right graph!',
      ru: 'Крути угол от 0° до 360°: смотри, как зеленая вертикальная стрелка синуса синхронно вычерчивает волну синусоиды справа!'
    },
    formula: '\\sin^2\\theta + \\cos^2\\theta = 1, \\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
    viewMode: 'moment_trig_circle',
    keywords: ['trigonometry', 'sine', 'cosine', 'circle', 'angle', 'тригонометрия', 'синус', 'косинус', 'единичный круг']
  },
  {
    id: 'lesson_derivative_tangent',
    grade: 'grade_10_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Geometrical Meaning of the Derivative', ru: 'Геометрический смысл производной' },
    subtitle: { en: 'How a secant line collapses into an exact tangent line as Δx → 0', ru: 'Как секущая прямая превращается в касательную при стремлении Δx к нулю' },
    textbookDefinition: {
      en: 'The derivative of a function at a point is the limit of the ratio of the increment of the function to the increment of the argument as Δx → 0: f\'(x) = lim Δy/Δx = tan(α).',
      ru: 'Геометрический смысл производной: значение производной функции в точке x равно угловому коэффициенту (тангенсу угла наклона) касательной к графику функции в этой точке: f\'(x) = k = tg(α).'
    },
    studentConfusion: {
      en: 'What is instantaneous speed? If time interval is zero, isn’t 0/0 undefined? Yes, that’s why calculus invented limits!',
      ru: '«Что такое мгновенная скорость? Если машина едет в данный миг, то расстояние ноль и время ноль, а 0/0 делить нельзя!» Именно поэтому Ньютон и Лейбниц создали пределы!'
    },
    lifeAnalogy: {
      en: 'A car speedometer: your average speed over 2 hours is 60 km/h, but the speedometer tells you the exact tangent speed right this split millisecond.',
      ru: 'Спидометр в автомобиле: средняя скорость за всю поездку может быть 60 км/ч, но спидометр показывает мгновенный наклон касательной ровно в эту долю секунды!'
    },
    momentObservation: {
      en: 'Slide Δx down to 0.01: watch point B slide towards point A, turning the chunky secant slope into the exact smooth cyan tangent line!',
      ru: 'Устреми Δx к нулю ползунком: точка B съедется с точкой A, и наклон секущей Δy/Δx станет точнейшим значением производной f\'(x)!'
    },
    formula: 'f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x} = k = \\tan\\alpha',
    viewMode: 'moment_derivative',
    keywords: ['derivative', 'tangent', 'secant', 'limit', 'calculus', 'производная', 'касательная', 'секущая', 'предел']
  },
  {
    id: 'lesson_calculus_solids',
    grade: 'grade_10_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Calculus: 2D Curve to 3D Solid of Revolution', ru: 'Матанализ: Интеграл как объем 3D тела вращения' },
    subtitle: { en: 'How summing infinite paper-thin coins dx gives exact 3D volume', ru: 'Как сумма бесконечно тонких круглых монеток dx рождает объем сложнейших тел' },
    textbookDefinition: {
      en: 'The volume of a solid generated by rotating the region under y = f(x) about the x-axis is V = π ∫ [f(x)]² dx.',
      ru: 'Объем тела, образованного вращением вокруг оси Ox криволинейной трапеции, равен определенному интегралу: V = π ∫ [f(x)]² dx.'
    },
    studentConfusion: {
      en: 'What is dx? Why does the integral sign look like an elongated S? It stands for Summa!',
      ru: 'Что такое dx? Почему знак интеграла похож на букву S? Потому что это латинская Summa — сложение миллионов тонких слоев!'
    },
    lifeAnalogy: {
      en: 'A stack of sliced cucumber or coins: each slice has radius r and tiny thickness dx. The whole cucumber volume is just the sum of slices!',
      ru: 'Стопка нарезанных тонких кружочков колбасы или огурца: каждый кружок имеет радиус r и толщину dx. Объем целого огурца — это сумма всех кружков!'
    },
    momentObservation: {
      en: 'Rotate the slider from 0° to 360° and watch flat 2D lines spin into a tactile 3D vase or cone disc-by-disc!',
      ru: 'Крути угол от 0° до 360°: увидишь, как плоский 2D график раскручивается в 3D объем диск за диском!'
    },
    formula: 'V = \\pi \\int_{a}^{b} [f(x)]^2 \\, dx',
    viewMode: 'math_revolution',
    keywords: ['calculus', 'integral', 'revolution', 'volume', 'dx', 'интеграл', 'тело вращения', 'объем', 'диски']
  },
  {
    id: 'lesson_divergence_vector',
    grade: 'grade_10_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Vector Fields & Divergence (∇ · F)', ru: 'Векторные поля и Дивергенция (∇ · F)' },
    subtitle: { en: 'Understanding sources, sinks, and fluid expansion without terrifying formulas', ru: 'Как понять истоки и стоки поля без зубрежки частных производных' },
    textbookDefinition: {
      en: 'Divergence is a vector operator that measures the magnitude of a vector field source or sink at a given point: div F = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z.',
      ru: 'Дивергенция дифференциального векторного поля — скалярное поле, характеризующее плотность входящих или выходящих потоков поля через бесконечно малую окрестность точки.'
    },
    studentConfusion: {
      en: 'Formulas look like dry partial derivatives. But divergence simply answers: "Is water bubbling up from here, or draining away?"',
      ru: 'Формула пугает частными производными, но на самом деле дивергенция просто отвечает на вопрос: «В этой точке бьет родник (div > 0) или утекает в слив (div < 0)?»'
    },
    lifeAnalogy: {
      en: 'A garden sprinkler sprays water outward everywhere (div > 0); a kitchen sink drain sucks water in (div < 0).',
      ru: 'Садовый распылитель воды: струи летят во все стороны (дивергенция > 0); воронка в ванне: вода уходит в одну точку (дивергенция < 0).'
    },
    momentObservation: {
      en: 'Switch between Source and Sink: Watch floating test particles disperse outward or converge into the center vortex!',
      ru: 'Переключай «Источник» и «Сток»: наблюдай, как частицы разлетаются из центра или затягиваются внутрь воронки!'
    },
    formula: '\\nabla \\cdot \\vec{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}',
    viewMode: 'math_divergence',
    keywords: ['divergence', 'vector', 'flux', 'field', 'дивергенция', 'вектор', 'поле', 'поток', 'источник', 'сток']
  },

  // --- ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ ПО ФИЗИКЕ ---
  {
    id: 'lesson_pascal_press',
    grade: 'grade_7_8',
    category: 'physics',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    title: { en: 'Pascal\'s Law & Hydraulic Press', ru: 'Закон Паскаля и Гидравлический пресс' },
    subtitle: { en: 'How a 10 kg force can lift a 1200 kg automobile', ru: 'Как силой в 10 кг поднять автомобиль массой 1200 кг' },
    textbookDefinition: {
      en: 'Pressure applied to an enclosed fluid is transmitted undiminished to every portion of the fluid and the walls of the vessel: p = F₁/S₁ = F₂/S₂.',
      ru: 'Давление, производимое на жидкость или газ, передается в любую точку без изменений во всех направлениях: p = F₁ / S₁ = F₂ / S₂.'
    },
    studentConfusion: {
      en: 'Is energy created out of nowhere? No! You gain force by exactly the same factor as you lose distance (Golden Rule of Mechanics).',
      ru: 'Школьники думают: «это же вечный двигатель, сила берется из ниоткуда!» Нет! Выигрыш в силе ровно компенсируется проигрышем в расстоянии.'
    },
    lifeAnalogy: {
      en: 'A toothpaste tube: squeezing at the very bottom instantly squirts paste out the top cap because pressure travels through the paste equally.',
      ru: 'Тюбик зубной пасты: сдави его в самом низу — паста мгновенно полезет из горлышка, потому что давление передается по всей пасте одинаково!'
    },
    momentObservation: {
      en: 'Push the small piston down 40 mm with 100 N: watch the large piston lift the 1.2-ton red car with 1000 N force!',
      ru: 'Надави на малый поршень: смотри, как давление жидкости поднимает платформу с тяжелой красной машиной силой 1000 Н!'
    },
    formula: '\\frac{F_2}{F_1} = \\frac{S_2}{S_1}, \\quad p = \\frac{F}{S} = \\text{const}',
    viewMode: 'moment_pascal',
    keywords: ['pascal', 'hydraulics', 'pressure', 'piston', 'паскаль', 'пресс', 'давление', 'поршень']
  },
  {
    id: 'lesson_doppler_effect',
    grade: 'grade_9',
    category: 'physics',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    title: { en: 'Doppler Effect & Supersonic Mach Shockwave', ru: 'Эффект Допплера и сверхзвуковой барьер' },
    subtitle: { en: 'Why a passing race car pitch drops from high to low', ru: 'Почему звук мотора приближающейся машины резкий и высокий, а удаляющейся — низкий' },
    textbookDefinition: {
      en: 'The Doppler effect is the change in frequency of a wave in relation to an observer who is moving relative to the wave source.',
      ru: 'Эффект Допплера — изменение частоты и длины волн, регистрируемых приёмником, вызванное движением источника волн относительно приёмника.'
    },
    studentConfusion: {
      en: 'Does the car horn itself change pitch? No! The siren emits identical sound; only the ripples get bunched together in front of the moving car!',
      ru: '«Сирена машины сама меняет тональность?» Нет! Сирена гудит абсолютно одинаково, но из-за движения гребни волн спереди сминаются в гармошку!'
    },
    lifeAnalogy: {
      en: 'A swimmer in a pool: swimming forward while splashing water sends compressed waves in front, and spaced-out lazy ripples behind.',
      ru: 'Пловец в бассейне: плывя вперед и шлепая ладонью по воде, он догоняет свои передние волны, сгущая их, а сзади оставляет длинные волны.'
    },
    momentObservation: {
      en: 'Accelerate the source to Mach 1.4: watch the circular waves bunch up into a violent red Mach shockwave cone!',
      ru: 'Разгони источник до 1.4 Маха: увидишь, как круговые волны смыкаются в острый красный конус сверхзвуковой ударной волны!'
    },
    formula: 'f\' = f_0 \\frac{v}{v \\mp v_s}, \\quad \\sin\\theta = \\frac{1}{M}',
    viewMode: 'moment_doppler',
    keywords: ['doppler', 'sound', 'mach', 'frequency', 'допплер', 'звук', 'мах', 'частота', 'волна']
  },

  // --- ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ ПО ХИМИИ ---
  {
    id: 'lesson_electrolysis_redox',
    grade: 'grade_7_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8-9', ru: '8-9 Класс' },
    title: { en: 'Electrolysis of Salt Solutions (CuCl₂)', ru: 'Электролиз растворов солей (CuCl₂)' },
    subtitle: { en: 'Extracting pure copper metal from water using electricity', ru: 'Как электрический ток оседает блестящую чистую медь на электроде' },
    textbookDefinition: {
      en: 'Electrolysis is a technique that uses direct electric current (DC) to drive an otherwise non-spontaneous chemical reaction, reducing cations at the cathode and oxidizing anions at the anode.',
      ru: 'Электролиз — совокупность процессов электрохимического окисления на аноде и восстановления на катоде при прохождении постоянного электрического тока через раствор или расплав электролита.'
    },
    studentConfusion: {
      en: 'Why don’t copper ions just sit still? Because the electric field pushes positives to negative (-) cathode and negatives to positive (+) anode!',
      ru: 'Школьники не понимают, почему металл осаждается именно на одном электроде, а газ выделяется на другом.'
    },
    lifeAnalogy: {
      en: 'Airport baggage claim: the conveyor belt carries bags (+ ions) to the right gate, and luggage handlers (- ions) to the other side.',
      ru: 'Турникеты на входе и выходе стадиона: болельщики с синими билетами идут строго налево, а с зелеными — строго направо под действием указателей!'
    },
    momentObservation: {
      en: 'Increase voltage to 12V: watch blue Cu²⁺ cations rush to the negative cathode, coating it in red copper, while green chlorine gas bubbles vigorously at the anode!',
      ru: 'Увеличь напряжение до 12В: синие ионы Cu²⁺ помчатся к катоду, наращивая слой меди, а на аноде закипят пузырьки хлора Cl₂!'
    },
    formula: '\\text{Катод (-): } \\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu}^0, \\quad \\text{Анод (+): } 2\\text{Cl}^- - 2e^- \\rightarrow \\text{Cl}_2\\uparrow',
    viewMode: 'moment_electrolysis',
    keywords: ['electrolysis', 'cathode', 'anode', 'copper', 'ion', 'электролиз', 'катод', 'анод', 'медь', 'ион']
  },

  // --- ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ ПО БИОЛОГИИ ---
  {
    id: 'lesson_neuron_synapse',
    grade: 'grade_7_8',
    category: 'biology',
    gradeBadge: { en: 'Grade 8-9', ru: '8-9 Класс' },
    title: { en: 'Neuron & Synaptic Transmission', ru: 'Нейрон, аксон и передача через синапс' },
    subtitle: { en: 'How a nerve impulse travels at 100 m/s and crosses a 20 nm chemical gap', ru: 'Как нервный импульс мчится со скоростью 100 м/с и перепрыгивает синаптическую щель' },
    textbookDefinition: {
      en: 'An action potential is a rapid sequence of changes in the membrane potential from -70 mV to +30 mV, propagated along an axon to trigger neurotransmitter release at synapses.',
      ru: 'Потенциал действия — быстрое колебание мембранного потенциала (от -70 мВ до +30 мВ), распространяющееся по мембране клетки в виде нервного импульса с последующим выбросом нейромедиатора в синапс.'
    },
    studentConfusion: {
      en: 'Is the nerve an electric copper wire? No! It is an ionic chemical wave where sodium and potassium ions pour in and out through micro-gates.',
      ru: '«Нерв — это медный проводок с током?» Нет! Это ионная цепочка домино: открываются ворота, натрий Na⁺ врывается внутрь клетки, меняя заряд мембраны.'
    },
    lifeAnalogy: {
      en: 'Stadium wave: people don\'t run around the stadium track; they just stand up and sit down in place, yet the wave travels around the whole stadium!',
      ru: 'Волна болельщиков на трибуне стадиона: люди не бегают по кругу, они просто встают и садятся на месте, но сама волна мчится по всему стадиону!'
    },
    momentObservation: {
      en: 'Click "Trigger Action Potential": watch the yellow electrical spike rush along the axon to the synapse, triggering chemical neurotransmitter bubbles!',
      ru: 'Нажми «Сгенерировать импульс»: посмотри, как вспышка потенциала действия (+30 мВ) пролетает по аксону и выбивает пузырьки медиатора в синапс!'
    },
    formula: '\\Delta V_{\\text{мембр}} = -70 \\text{ mV} \\rightarrow +30 \\text{ mV}',
    viewMode: 'moment_neuron',
    keywords: ['neuron', 'axon', 'synapse', 'action potential', 'нейрон', 'аксон', 'синапс', 'потенциал действия']
  },

  // --- ДОПОЛНИТЕЛЬНЫЕ ТЕМЫ ПО МАТЕМАТИКЕ ---
  {
    id: 'lesson_pythagoras_proof',
    grade: 'grade_7_8',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    title: { en: 'Geometric Proof of Pythagorean Theorem', ru: 'Геометрическое доказательство теоремы Пифагора' },
    subtitle: { en: 'Why square on hypotenuse always equals sum of squares on legs', ru: 'Почему площадь квадрата на гипотенузе в точности равна сумме двух других квадратов' },
    textbookDefinition: {
      en: 'In any right-angled triangle, the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares whose sides are the two legs: a² + b² = c².',
      ru: 'В прямоугольном треугольнике квадрат длины гипотенузы равен сумме квадратов длин катетов: a² + b² = c².'
    },
    studentConfusion: {
      en: 'Students memorize the formula like a magic incantation without understanding that a², b², c² are actual physical square areas!',
      ru: 'Школьники зубрят a² + b² = c² как буквы, не понимая, что это РЕАЛЬНЫЕ площади геометрических квадратов, построенных на сторонах!'
    },
    lifeAnalogy: {
      en: 'Square water tanks: fill tanks a² and b² with water, open the valves — the water will fill tank c² right to the exact brim!',
      ru: 'Квадратные аквариумы: наполни водой аквариумы на катетах a² и b², открой краны — вся эта вода до последней капли без остатка заполнит аквариум c²!'
    },
    momentObservation: {
      en: 'Change legs to a=3 and b=4: watch areas 9 and 16 physically slide and assemble into the perfect square of area 25 on hypotenuse c=5!',
      ru: 'Выстави катеты a=3 и b=4: смотри, как квадраты площадями 9 и 16 перекладываются в совершенный квадрат площадью 25 на гипотенузе c=5!'
    },
    formula: 'a^2 + b^2 = c^2, \\quad c = \\sqrt{a^2 + b^2}',
    viewMode: 'moment_pythagoras',
    keywords: ['pythagoras', 'triangle', 'hypotenuse', 'square', 'пифагор', 'катет', 'гипотенуза', 'квадрат']
  },
  {
    id: 'lesson_galton_normal_distribution',
    grade: 'grade_10_11',
    category: 'mathematics',
    gradeBadge: { en: 'Grade 10-11', ru: '10-11 Класс' },
    title: { en: 'Galton Board & Normal Distribution (Gaussian Curve)', ru: 'Доска Гальтона и Нормальное распределение Гаусса' },
    subtitle: { en: 'How independent random 50/50 bounces inevitably form a perfect bell curve', ru: 'Как хаотичные броски шариков неизбежно порождают колокол вероятности' },
    textbookDefinition: {
      en: 'The normal distribution is a continuous probability distribution symmetric about the mean, showing that data near the mean are more frequent in occurrence than data far from the mean.',
      ru: 'Нормальное распределение (закон Гаусса) — распределение вероятностей, подчиняющееся центральной предельной теореме: сумма большого числа независимых случайных величин имеет нормальное распределение.'
    },
    studentConfusion: {
      en: 'Why do balls accumulate in the center, instead of spreading out flat across all bins? Because center paths have vastly more combinations!',
      ru: 'Почему шарики не падают ровным слоем, а кучкуются в центре? Потому что путей, ведущих в центр, в десятки раз больше, чем путей в крайние колонки!'
    },
    lifeAnalogy: {
      en: 'Human heights: most people are near average height (~175 cm); very few people are 140 cm or 210 cm, forming the exact same bell curve.',
      ru: 'Рост людей в городе: большинство людей среднего роста (170–180 см). Людей ростом 140 см или 210 см единицы — их распределение образует точно такой же колокол Гаусса!'
    },
    momentObservation: {
      en: 'Watch 60 balls cascade through the peg lattice: at each peg, a 50/50 deflection slowly sculpts the green Gaussian bell envelope!',
      ru: 'Смотри, как десятки шариков отскакивают от гвоздиков 50/50: прямо на твоих глазах хаос упорядочивается в гладкий колокол Гаусса!'
    },
    formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
    viewMode: 'moment_gauss',
    keywords: ['gauss', 'galton', 'probability', 'normal', 'distribution', 'гаусс', 'гальтон', 'вероятность', 'распределение', 'колокол']
  }
];
