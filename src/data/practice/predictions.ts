import type { SimId } from '../../components/sims/registry';

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export interface Prediction {
  id: string;
  subject: 'physics' | 'chemistry' | 'biology';
  grade: number;
  /** topic to read more */
  topicId: string;
  sim: SimId;
  mode?: string;
  params?: Record<string, number>;
  question: T2;
  options: T2[];
  correct: number;
  explain: T2;
}

export const PREDICTIONS: Prediction[] = [
  {
    id: 'jets', subject: 'physics', grade: 7, topicId: 'p7-liquid-pressure', sim: 'pressure', mode: 'liquid',
    question: t('В стенке сосуда три отверстия. Из какого струя ударит сильнее всего?', 'A vessel has three holes. Which one squirts hardest?'),
    options: [t('Из верхнего', 'The top one'), t('Из среднего', 'The middle one'), t('Из нижнего', 'The bottom one'), t('Одинаково', 'All the same')],
    correct: 2,
    explain: t('Давление растёт с глубиной (p = ρgh): внизу над отверстием больше всего жидкости.', 'Pressure grows with depth (p = ρgh): the most liquid presses above the bottom hole.'),
  },
  {
    id: 'pins', subject: 'physics', grade: 8, topicId: 'p8-conduction', sim: 'heat_transfer', mode: 'conduction',
    question: t('Гвоздики прикреплены воском к металлическому стержню. Какой отпадёт первым, если нагреть один конец?', 'Pins are stuck with wax to a rod heated at one end. Which drops first?'),
    options: [t('Ближний к огню', 'The one nearest the flame'), t('Средний', 'The middle one'), t('Дальний', 'The far one'), t('Все сразу', 'All at once')],
    correct: 0,
    explain: t('Тепло передаётся от частицы к частице постепенно — ближние участки нагреваются раньше.', 'Heat passes from particle to particle gradually, so nearer parts warm up first.'),
  },
  {
    id: 'freefall', subject: 'physics', grade: 7, topicId: 'p7-weight', sim: 'weight',
    question: t('Трос лифта оборвался, лифт падает свободно. Что покажут весы под человеком?', 'The lift cable snaps and the cab falls freely. What does the scale read?'),
    options: [t('Больше, чем обычно', 'More than usual'), t('Как обычно, mg', 'As usual, mg'), t('Ноль', 'Zero'), t('Отрицательное число', 'A negative number')],
    correct: 2,
    explain: t('В свободном падении человек и весы падают вместе с ускорением g — давить на опору нечем: невесомость.', 'In free fall person and scale drop together at g, so nothing presses on the scale: weightlessness.'),
  },
  {
    id: 'sink', subject: 'physics', grade: 7, topicId: 'p7-density', sim: 'density',
    question: t('Пять кубиков одного объёма бросают в воду. Какие утонут?', 'Five cubes of equal volume go into water. Which sink?'),
    options: [t('Пробка и дерево', 'Cork and wood'), t('Только лёд', 'Only ice'), t('Алюминий и железо', 'Aluminium and iron'), t('Все пять', 'All five')],
    correct: 2,
    explain: t('Тонет то, что плотнее воды (1000 кг/м³): алюминий 2700, железо 7800. Лёд (900) плавает.', 'Whatever is denser than water (1000 kg/m³) sinks: aluminium 2700, iron 7800. Ice (900) floats.'),
  },
  {
    id: 'cans', subject: 'physics', grade: 8, topicId: 'p8-radiation', sim: 'heat_transfer', mode: 'radiation',
    question: t('Тёмный и блестящий сосуды стоят под одной лампой. Какой нагреется сильнее?', 'A dark can and a shiny can sit under the same lamp. Which gets hotter?'),
    options: [t('Тёмный', 'The dark one'), t('Блестящий', 'The shiny one'), t('Одинаково', 'The same')],
    correct: 0,
    explain: t('Тёмная поверхность поглощает почти всё излучение, блестящая — отражает.', 'A dark surface absorbs almost all radiation; a shiny one reflects it.'),
  },
  {
    id: 'tip', subject: 'physics', grade: 7, topicId: 'p7-center-mass', sim: 'equilibrium', mode: 'tipping', params: { hw: 2.6 },
    question: t('Высокий узкий брусок медленно наклоняют. Опрокинется ли он до 50°?', 'A tall narrow block is slowly tilted. Will it tip over before 50°?'),
    options: [t('Да, раньше', 'Yes, earlier'), t('Нет, выдержит', 'No, it will hold')],
    correct: 0,
    explain: t('У высокого тела центр тяжести высоко — отвес выходит за край опоры уже при ~21°.', 'A tall body’s centre of gravity is high, so the plumb line passes the edge at about 21°.'),
  },
  {
    id: 'cart', subject: 'physics', grade: 7, topicId: 'p7-inertia', sim: 'inertia', mode: 'stop',
    question: t('Тележка с кубиком врезается в стену. Что сделает кубик?', 'A cart carrying a block hits a wall. What does the block do?'),
    options: [t('Остановится вместе с тележкой', 'Stops with the cart'), t('Продолжит ехать вперёд', 'Keeps sliding forward'), t('Отскочит назад', 'Bounces back')],
    correct: 1,
    explain: t('Инерция: стена действует только на тележку, кубик сохраняет скорость, пока его не остановит трение.', 'Inertia: the wall acts only on the cart; the block keeps its speed until friction stops it.'),
  },
  {
    id: 'lorentz', subject: 'physics', grade: 11, topicId: 'p11-lorentz', sim: 'magnetism', mode: 'lorentz', params: { q: -1 },
    question: t('Электрон влетает в магнитное поле, направленное от нас. Куда он повернёт?', 'An electron enters a magnetic field pointing away from us. Which way does it turn?'),
    options: [t('Вверх', 'Up'), t('Вниз', 'Down'), t('Полетит прямо', 'Straight on')],
    correct: 1,
    explain: t('Сила Лоренца перпендикулярна скорости. Для отрицательного заряда она направлена в противоположную сторону, чем для протона.', 'The Lorentz force is perpendicular to velocity; for a negative charge it points opposite to a proton’s.'),
  },
  {
    id: 'halflife', subject: 'physics', grade: 9, topicId: 'p9-radiation-bio', sim: 'nuclear', mode: 'decay',
    question: t('Было 400 радиоактивных ядер. Сколько примерно останется через два периода полураспада?', 'There are 400 radioactive nuclei. About how many remain after two half-lives?'),
    options: [t('200', '200'), t('100', '100'), t('0', '0'), t('300', '300')],
    correct: 1,
    explain: t('Каждый период — половина: 400 → 200 → 100.', 'Each half-life halves it: 400 → 200 → 100.'),
  },
  {
    id: 'polar', subject: 'physics', grade: 11, topicId: 'p11-diffraction', sim: 'wave_optics', mode: 'polar', params: { angle: 90 },
    question: t('Два поляроида повернули друг относительно друга на 90°. Что увидим?', 'Two polarisers are crossed at 90°. What do we see?'),
    options: [t('Яркий свет', 'Bright light'), t('Половину яркости', 'Half brightness'), t('Темноту', 'Darkness')],
    correct: 2,
    explain: t('Закон Малюса: I = I₀cos²90° = 0. Свет — поперечная волна.', 'Malus’s law: I = I₀cos²90° = 0. Light is a transverse wave.'),
  },
  {
    id: 'kepler', subject: 'physics', grade: 11, topicId: 'p11-solar-system', sim: 'solar_system', mode: 'kepler',
    question: t('Где планета движется по орбите быстрее?', 'Where does a planet move fastest along its orbit?'),
    options: [t('Ближе к Солнцу', 'Closest to the Sun'), t('Дальше от Солнца', 'Farthest from the Sun'), t('Везде одинаково', 'Equally everywhere')],
    correct: 0,
    explain: t('Второй закон Кеплера: за равное время заметаются равные площади — у Солнца путь длиннее.', 'Kepler’s second law: equal areas in equal times, so near the Sun it covers more path.'),
  },
  {
    id: 'penumbra', subject: 'physics', grade: 8, topicId: 'p8-light-straight', sim: 'shadows', mode: 'wide',
    question: t('Шар освещают большой лампой. Что будет на экране за ним?', 'A ball is lit by a large lamp. What appears on the screen behind it?'),
    options: [t('Резкая тень', 'A sharp shadow'), t('Тень и полутень', 'Umbra and penumbra'), t('Тени не будет', 'No shadow')],
    correct: 1,
    explain: t('От протяжённого источника часть точек экрана освещена лишь частью лампы — это полутень.', 'With a wide source some points get light from only part of the lamp: that’s the penumbra.'),
  },
  {
    id: 'mix', subject: 'physics', grade: 8, topicId: 'p8-heat-balance', sim: 'heat_balance',
    question: t('Брусок 100 °C опустили в воду 20 °C. Какой будет общая температура?', 'A 100 °C block goes into 20 °C water. What is the final temperature?'),
    options: [t('100 °C', '100 °C'), t('60 °C — ровно посередине', '60 °C, exactly halfway'), t('Немного выше 20 °C', 'A little above 20 °C'), t('Ниже 20 °C', 'Below 20 °C')],
    correct: 2,
    explain: t('У воды огромная теплоёмкость и её больше по массе — она почти не нагревается.', 'Water has a huge heat capacity and more mass, so it barely warms.'),
  },
  {
    id: 'charges', subject: 'physics', grade: 10, topicId: 'p10-potential', sim: 'electrostatics', mode: 'field', params: { q2: 1 },
    question: t('Как ведут себя силовые линии двух одинаковых положительных зарядов?', 'How do the field lines of two equal positive charges behave?'),
    options: [t('Соединяют заряды', 'They join the charges'), t('Расходятся, отталкиваясь', 'They spread apart, repelling'), t('Поля нет', 'There is no field')],
    correct: 1,
    explain: t('Одноимённые заряды отталкиваются: линии не соединяются, между зарядами — область слабого поля.', 'Like charges repel: the lines don’t connect, and the field is weak between them.'),
  },
  {
    id: 'rate', subject: 'chemistry', grade: 9, topicId: 'c9-catalysis', sim: 'kinetics', mode: 'rate', params: { T: 80 },
    question: t('Температуру подняли с 30 до 80 °C. Как изменится скорость реакции?', 'The temperature rises from 30 to 80 °C. How does the rate change?'),
    options: [t('Замедлится', 'It slows down'), t('Не изменится', 'No change'), t('Вырастет примерно вдвое', 'About doubles'), t('Вырастет в десятки раз', 'Grows tens of times')],
    correct: 3,
    explain: t('Правило Вант-Гоффа: +10 °C → в 2–4 раза. +50 °C — это 2,5⁵ ≈ 100 раз.', 'Van ’t Hoff’s rule: +10 °C → 2–4×. +50 °C is about 2.5⁵ ≈ 100×.'),
  },
  {
    id: 'blood', subject: 'biology', grade: 8, topicId: 'b8-blood-groups', sim: 'blood', mode: 'groups', params: { donor: 1, rec: 0 },
    question: t('Можно ли перелить кровь группы A(II) человеку с группой O(I)?', 'Can blood of group A be given to someone with group O?'),
    options: [t('Да', 'Yes'), t('Нет', 'No')],
    correct: 1,
    explain: t('В плазме O(I) есть антитела α — они склеят эритроциты с антигеном A.', 'Group O plasma has α antibodies that clump red cells carrying antigen A.'),
  },
  {
    id: 'pyramid', subject: 'biology', grade: 9, topicId: 'b9-food-chains', sim: 'ecosystem', mode: 'chain',
    question: t('Какая доля энергии растений дойдёт до лисы (третий уровень цепи)?', 'What share of the plants’ energy reaches the fox (the third level)?'),
    options: [t('Около 50%', 'About 50%'), t('Около 10%', 'About 10%'), t('Около 1%', 'About 1%'), t('Вся', 'All of it')],
    correct: 2,
    explain: t('На каждый уровень переходит ~10%: 10% от 10% = 1%.', 'About 10% passes each level: 10% of 10% = 1%.'),
  },
  {
    id: 'moths', subject: 'biology', grade: 11, topicId: 'b11-adaptations', sim: 'evolution', mode: 'selection', params: { soot: 0.9 },
    question: t('Кора берёз закопчена. Какие бабочки станут большинством через поколения?', 'Birch bark is covered in soot. Which moths become the majority over generations?'),
    options: [t('Светлые', 'Light ones'), t('Тёмные', 'Dark ones'), t('Поровну', 'Equal numbers')],
    correct: 1,
    explain: t('Птицы чаще замечают светлых на тёмной коре — отбор сохраняет тёмных.', 'Birds spot light moths on dark bark more often, so selection favours the dark ones.'),
  },
  {
    id: 'meiosis', subject: 'biology', grade: 10, topicId: 'b10-meiosis', sim: 'cell_division', mode: 'meiosis',
    question: t('Сколько клеток получится из одной в конце мейоза?', 'How many cells come from one at the end of meiosis?'),
    options: [t('2', '2'), t('4', '4'), t('8', '8'), t('1', '1')],
    correct: 1,
    explain: t('Два деления подряд: 1 → 2 → 4 гаплоидные клетки.', 'Two divisions in a row: 1 → 2 → 4 haploid cells.'),
  },
  {
    id: 'night', subject: 'biology', grade: 6, topicId: 'b6-respiration', sim: 'plant_life', mode: 'respiration',
    question: t('Что выделяет растение ночью?', 'What does a plant give off at night?'),
    options: [t('Кислород', 'Oxygen'), t('Углекислый газ', 'Carbon dioxide'), t('Ничего', 'Nothing')],
    correct: 1,
    explain: t('Без света фотосинтеза нет, остаётся только дыхание: O₂ поглощается, CO₂ выделяется.', 'Without light there’s no photosynthesis, only respiration: O₂ in, CO₂ out.'),
  },
];
