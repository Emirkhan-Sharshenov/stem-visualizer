import { section } from './types';

const A = 'astronomy';

export const ASTRONOMY_11 = [
  section(A, 11, 'sky', ['Небо и время', 'The sky and time'], [
    {
      id: 'a11-what',
      title: ['Что изучает астрономия', 'What astronomy studies'],
      intro: [
        'Астрономия — наука о небесных телах и Вселенной в целом: из чего они состоят, как движутся, рождаются и умирают.',
        'Astronomy is the science of celestial bodies and the Universe as a whole: what they are made of, how they move, form and die.',
      ],
      points: [
        ['Масштабы', 'Scales', 'До Луны свет летит 1,3 с, до Солнца — 8 минут, до ближайшей звезды — 4,2 года, до соседней галактики Андромеды — 2,5 млн лет.', 'Light takes 1.3 s to reach the Moon, 8 minutes from the Sun, 4.2 years from the nearest star and 2.5 million years from the Andromeda galaxy.'],
        ['Единицы расстояния', 'Distance units', 'Астрономическая единица (а. е.) — 150 млн км, расстояние Земля–Солнце. Световой год — 9,46·10¹² км. Парсек — 3,26 светового года.', 'The astronomical unit (au) is 150 million km, the Earth–Sun distance. A light year is 9.46·10¹² km; a parsec is 3.26 light years.'],
        ['Как узнают о звёздах', 'How we learn about stars', 'Почти всё знание приносит свет: по нему определяют температуру, состав, скорость и расстояние.', 'Nearly everything comes from light: it tells us temperature, composition, speed and distance.'],
      ],
      sim: { lab: 'space3d' },
    },
    {
      id: 'a11-sphere',
      title: ['Небесная сфера и созвездия', 'The celestial sphere and constellations'],
      intro: [
        'Звёзды так далеки, что кажутся приколотыми к огромному шару вокруг Земли — небесной сфере. Она как будто вращается за сутки.',
        'Stars are so far away that they seem pinned to a huge sphere around the Earth — the celestial sphere, which appears to turn once a day.',
      ],
      points: [
        ['Созвездия', 'Constellations', 'Небо поделено на 88 созвездий — участков с границами, как страны на карте. Звёзды созвездия на самом деле бывают на совсем разных расстояниях.', 'The sky is split into 88 constellations — regions with borders, like countries. Their stars can be at very different distances.'],
        ['Полярная звезда', 'The Pole Star', 'Ось вращения Земли смотрит почти на Полярную звезду, поэтому она стоит на месте, а остальное небо вращается вокруг неё.', 'Earth’s axis points almost at Polaris, so it stays put while the rest of the sky turns around it.'],
        ['Высота полюса мира', 'Height of the celestial pole', 'Высота Полярной звезды над горизонтом равна географической широте места наблюдения.', 'The altitude of Polaris above the horizon equals the observer’s latitude.'],
      ],
      formula: 'h_{P} = \\varphi',
    },
    {
      id: 'a11-ecliptic',
      title: ['Видимое движение Солнца и смена сезонов', 'The Sun’s path and the seasons'],
      intro: [
        'За год Солнце проходит по небу большой круг — эклиптику. Времена года меняются не из-за расстояния до Солнца, а из-за наклона земной оси на 23,4°.',
        'Over a year the Sun traces a great circle, the ecliptic. Seasons come not from the distance to the Sun but from the 23.4° tilt of Earth’s axis.',
      ],
      points: [
        ['Наклон оси', 'Axial tilt', 'Летом наше полушарие повёрнуто к Солнцу: лучи падают круче и греют сильнее, день длиннее.', 'In summer our hemisphere leans towards the Sun: rays fall more steeply and heat more, and days are longer.'],
        ['Равноденствия и солнцестояния', 'Equinoxes and solstices', '20–21 марта и 22–23 сентября день равен ночи; 21–22 июня — самый длинный день, 21–22 декабря — самый короткий.', 'Around 20 March and 22 September day equals night; around 21 June is the longest day and 21 December the shortest.'],
        ['Высота Солнца в полдень', 'Noon altitude of the Sun', 'h = 90° − φ + δ, где δ — склонение Солнца: от +23,4° летом до −23,4° зимой.', 'h = 90° − φ + δ, where the Sun’s declination δ runs from +23.4° in summer to −23.4° in winter.'],
      ],
      formula: 'h = 90^\\circ - \\varphi + \\delta',
      sim: { process: 'solar_system' },
    },
    {
      id: 'a11-moon',
      title: ['Луна: фазы и затмения', 'The Moon: phases and eclipses'],
      intro: [
        'Луна светит отражённым солнечным светом. Фаза зависит от того, какую часть освещённой половины мы видим с Земли.',
        'The Moon shines by reflected sunlight. Its phase depends on how much of the lit half we see from Earth.',
      ],
      points: [
        ['Фазы', 'Phases', 'Новолуние → первая четверть → полнолуние → последняя четверть, полный цикл — 29,5 суток.', 'New moon → first quarter → full moon → last quarter; the cycle takes 29.5 days.'],
        ['Солнечное затмение', 'Solar eclipse', 'Луна закрывает Солнце; бывает только в новолуние и видно с узкой полосы на Земле.', 'The Moon covers the Sun; it happens only at new moon and is seen from a narrow strip of Earth.'],
        ['Лунное затмение', 'Lunar eclipse', 'Луна входит в тень Земли и становится медно-красной; бывает в полнолуние и видно со всей ночной стороны.', 'The Moon enters Earth’s shadow and turns copper-red; it happens at full moon and is seen from the whole night side.'],
      ],
      sim: { lab: 'space3d' },
    },
    {
      id: 'a11-time',
      title: ['Время и календарь', 'Time and the calendar'],
      intro: [
        'Сутки, месяц и год пришли с неба: вращение Земли, обращение Луны и движение Земли вокруг Солнца.',
        'The day, month and year come from the sky: Earth’s spin, the Moon’s orbit and Earth’s path around the Sun.',
      ],
      points: [
        ['Звёздные и солнечные сутки', 'Sidereal and solar day', 'Относительно звёзд Земля оборачивается за 23 ч 56 мин; солнечные сутки на 4 минуты длиннее, потому что Земля за день сдвигается по орбите.', 'Relative to the stars Earth turns in 23 h 56 min; the solar day is 4 minutes longer because Earth moves along its orbit meanwhile.'],
        ['Високосный год', 'Leap year', 'Год длится 365,2422 суток, поэтому каждый четвёртый год добавляют 29 февраля, а три раза за 400 лет — нет.', 'A year is 365.2422 days, so every fourth year gets 29 February, except three times in 400 years.'],
        ['Часовые пояса', 'Time zones', 'Земля поворачивается на 15° за час, поэтому Земля поделена на 24 пояса.', 'Earth turns 15° an hour, so it is divided into 24 time zones.'],
      ],
    },
  ]),
  section(A, 11, 'solar', ['Солнечная система', 'The Solar System'], [
    {
      id: 'a11-kepler',
      title: ['Законы Кеплера', 'Kepler’s laws'],
      intro: [
        'Кеплер по наблюдениям Тихо Браге вывел три закона движения планет, а Ньютон потом объяснил их тяготением.',
        'From Tycho Brahe’s observations Kepler found three laws of planetary motion, later explained by Newton’s gravity.',
      ],
      points: [
        ['Первый закон', 'First law', 'Планеты движутся по эллипсам, в одном из фокусов которых — Солнце.', 'Planets move on ellipses with the Sun at one focus.'],
        ['Второй закон', 'Second law', 'Радиус-вектор планеты за равные времена заметает равные площади: у Солнца планета движется быстрее.', 'A planet’s radius sweeps equal areas in equal times: it moves faster near the Sun.'],
        ['Третий закон', 'Third law', 'Квадраты периодов обращения относятся как кубы больших полуосей: T² ∝ a³. Для планет в годах и а. е. T² = a³.', 'Squares of orbital periods go as cubes of semi-major axes: T² ∝ a³; in years and au, T² = a³.'],
      ],
      formula: '\\frac{T_1^2}{T_2^2} = \\frac{a_1^3}{a_2^3}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'a11-gravity',
      title: ['Закон тяготения и масса планет', 'Gravity and planetary masses'],
      intro: [
        'Зная период спутника и радиус его орбиты, можно «взвесить» планету или звезду — так узнали массы Солнца и Юпитера.',
        'From a satellite’s period and orbit radius you can “weigh” a planet or star — that is how the masses of the Sun and Jupiter were found.',
      ],
      points: [
        ['Уточнённый третий закон', 'Kepler’s third law refined', 'T² = 4π²a³ / (G(M + m)) — в нём уже есть масса центрального тела.', 'T² = 4π²a³ / (G(M + m)) — it contains the central mass.'],
        ['Первая космическая скорость', 'Orbital speed', 'v = √(GM/R): у Земли 7,9 км/с — с такой скоростью спутник летит по кругу у поверхности.', 'v = √(GM/R): 7.9 km/s at Earth’s surface for a circular orbit.'],
        ['Вторая космическая', 'Escape speed', 'v = √(2GM/R): 11,2 км/с, чтобы навсегда улететь от Земли.', 'v = √(2GM/R): 11.2 km/s to leave Earth for good.'],
      ],
      formula: 'T^2 = \\frac{4\\pi^2 a^3}{G M}',
      sim: { engine: 'circular_orbit_satellites' },
    },
    {
      id: 'a11-planets',
      title: ['Планеты земной группы и планеты-гиганты', 'Terrestrial and giant planets'],
      intro: [
        'Восемь планет делятся на две семьи: маленькие каменные у Солнца и огромные газовые и ледяные дальше от него.',
        'The eight planets form two families: small rocky ones near the Sun and huge gas and ice giants further out.',
      ],
      points: [
        ['Земная группа', 'Terrestrial planets', 'Меркурий, Венера, Земля, Марс: твёрдая поверхность, высокая плотность, мало спутников.', 'Mercury, Venus, Earth, Mars: solid surfaces, high density, few moons.'],
        ['Планеты-гиганты', 'Giant planets', 'Юпитер, Сатурн, Уран, Нептун: водород и гелий, кольца и десятки спутников, нет твёрдой поверхности.', 'Jupiter, Saturn, Uranus, Neptune: hydrogen and helium, rings and dozens of moons, no solid surface.'],
        ['Почему так вышло', 'Why', 'Близко к молодому Солнцу было жарко, и уцелели только камень и металл; дальше за «линией снега» замерзали лёд и газ.', 'Near the young Sun it was hot and only rock and metal survived; beyond the “snow line” ice and gas could collect.'],
      ],
      sim: { process: 'solar_system' },
    },
    {
      id: 'a11-small',
      title: ['Малые тела: астероиды, кометы, метеоры', 'Small bodies: asteroids, comets, meteors'],
      intro: [
        'Кроме планет, вокруг Солнца летают миллионы малых тел — остатки строительного материала Солнечной системы.',
        'Besides planets, millions of small bodies orbit the Sun — leftovers from the building of the Solar System.',
      ],
      points: [
        ['Астероиды', 'Asteroids', 'Каменные и металлические глыбы, больше всего их в поясе между Марсом и Юпитером.', 'Rocky and metal chunks, most of them in the belt between Mars and Jupiter.'],
        ['Кометы', 'Comets', 'Ледяные ядра с дальних окраин. У Солнца лёд испаряется, и солнечный ветер выдувает хвост — всегда от Солнца.', 'Icy nuclei from the outer edges. Near the Sun the ice boils off and the solar wind blows a tail, always pointing away from the Sun.'],
        ['Метеоры и метеориты', 'Meteors and meteorites', '«Падающая звезда» — песчинка, сгорающая в атмосфере. Долетевший до земли кусок называют метеоритом.', 'A “shooting star” is a grain burning up in the air; a piece that reaches the ground is a meteorite.'],
      ],
    },
  ]),
  section(A, 11, 'stars', ['Солнце и звёзды', 'The Sun and stars'], [
    {
      id: 'a11-sun',
      title: ['Солнце — ближайшая звезда', 'The Sun, our nearest star'],
      intro: [
        'Солнце — раскалённый газовый шар в 109 раз больше Земли. Его энергия рождается в ядре, где водород превращается в гелий.',
        'The Sun is a hot ball of gas 109 times wider than Earth. Its energy is made in the core, where hydrogen turns into helium.',
      ],
      points: [
        ['Термоядерный синтез', 'Fusion', 'Четыре ядра водорода превращаются в одно ядро гелия; потерянная масса уходит в энергию по E = mc².', 'Four hydrogen nuclei become one helium nucleus; the lost mass becomes energy by E = mc².'],
        ['Строение', 'Structure', 'Ядро (15 млн К) → зона излучения → зона конвекции → фотосфера (5800 К) → корона (миллионы К).', 'Core (15 million K) → radiative zone → convective zone → photosphere (5800 K) → corona (millions of K).'],
        ['Солнечная активность', 'Solar activity', 'Пятна, вспышки и выбросы плазмы следуют 11-летнему циклу и вызывают полярные сияния и магнитные бури.', 'Spots, flares and plasma ejections follow an 11-year cycle and cause auroras and magnetic storms.'],
      ],
      formula: '4\\,{}^1\\mathrm{H} \\to {}^4\\mathrm{He} + 2e^+ + 2\\nu + E',
      sim: { engine: 'nuclear_fusion_sun' },
    },
    {
      id: 'a11-star-props',
      title: ['Звёзды: расстояние, светимость, цвет', 'Stars: distance, luminosity, colour'],
      intro: [
        'Звёзды различаются по светимости в миллиарды раз, а по цвету можно узнать их температуру.',
        'Stars differ in luminosity by billions of times, and their colour tells their temperature.',
      ],
      points: [
        ['Параллакс', 'Parallax', 'За полгода Земля смещается на 2 а. е., и близкая звезда чуть сдвигается на фоне далёких: d (пк) = 1 / p″.', 'In half a year Earth moves 2 au and a nearby star shifts against distant ones: d (pc) = 1 / p″.'],
        ['Звёздная величина', 'Magnitude', 'Чем больше величина, тем слабее звезда; разница в 5 величин — это в 100 раз по яркости.', 'The larger the magnitude, the fainter the star; 5 magnitudes is a factor of 100 in brightness.'],
        ['Цвет и температура', 'Colour and temperature', 'Красные звёзды — около 3000 К, жёлтые как Солнце — 6000 К, голубые — 20 000 К и выше (закон Вина).', 'Red stars are about 3000 K, yellow like the Sun 6000 K, blue 20 000 K and more (Wien’s law).'],
      ],
      formula: 'd = \\frac{1}{p}',
      sim: { engine: 'stellar_evolution_hr' },
    },
    {
      id: 'a11-hr',
      title: ['Диаграмма Герцшпрунга — Рассела', 'The Hertzsprung–Russell diagram'],
      intro: [
        'Если расставить звёзды по температуре и светимости, они не разбросаны как попало, а собираются в несколько полос.',
        'Plot stars by temperature and luminosity and they don’t scatter at random: they gather in a few bands.',
      ],
      points: [
        ['Главная последовательность', 'Main sequence', 'Там 90% звёзд, включая Солнце: они спокойно жгут водород в ядре. Чем массивнее звезда, тем она горячее и ярче.', '90% of stars, the Sun included, sit there quietly burning hydrogen; the more massive, the hotter and brighter.'],
        ['Гиганты и сверхгиганты', 'Giants and supergiants', 'Вверху справа — холодные, но огромные звёзды, раздувшиеся в конце жизни.', 'Top right: cool but enormous stars that have swollen late in life.'],
        ['Белые карлики', 'White dwarfs', 'Внизу слева — горячие, но маленькие остатки звёзд размером с Землю.', 'Bottom left: hot but tiny stellar remnants the size of Earth.'],
      ],
      sim: { engine: 'stellar_evolution_hr' },
    },
    {
      id: 'a11-evolution',
      title: ['Жизнь и смерть звёзд', 'The life and death of stars'],
      intro: [
        'Судьбу звезды решает её масса: лёгкие тихо остывают, тяжёлые взрываются и оставляют нейтронные звёзды и чёрные дыры.',
        'A star’s mass decides its fate: light ones cool quietly, heavy ones explode and leave neutron stars and black holes.',
      ],
      points: [
        ['Рождение', 'Birth', 'Звёзды рождаются в холодных облаках газа и пыли, которые сжимаются под собственным тяготением.', 'Stars are born in cold clouds of gas and dust that collapse under their own gravity.'],
        ['Звёзды как Солнце', 'Sun-like stars', 'Через ~10 млрд лет станет красным гигантом, сбросит оболочку (планетарная туманность) и останется белым карликом.', 'After ~10 billion years it becomes a red giant, sheds its envelope as a planetary nebula and leaves a white dwarf.'],
        ['Массивные звёзды', 'Massive stars', 'Вспыхивают сверхновой; ядро сжимается в нейтронную звезду или, если масса больше ~3 солнечных, в чёрную дыру.', 'They explode as supernovae; the core collapses into a neutron star or, above ~3 solar masses, a black hole.'],
      ],
      sim: { engine: 'stellar_evolution_hr' },
    },
  ]),
  section(A, 11, 'universe', ['Галактики и Вселенная', 'Galaxies and the Universe'], [
    {
      id: 'a11-milky-way',
      title: ['Наша Галактика — Млечный Путь', 'Our Galaxy, the Milky Way'],
      intro: [
        'Солнце — одна из 100–400 млрд звёзд спиральной галактики диаметром около 100 000 световых лет.',
        'The Sun is one of 100–400 billion stars in a spiral galaxy about 100 000 light years across.',
      ],
      points: [
        ['Где мы', 'Where we are', 'Солнце лежит в диске, в 26 000 световых лет от центра, и облетает его за 230 млн лет.', 'The Sun lies in the disc, 26 000 light years from the centre, and orbits it every 230 million years.'],
        ['Центр', 'The centre', 'В центре — сверхмассивная чёрная дыра Стрелец A* массой 4 млн Солнц; её сфотографировали в 2022 году.', 'At the centre is the supermassive black hole Sagittarius A*, 4 million solar masses, imaged in 2022.'],
        ['Тёмная материя', 'Dark matter', 'Звёзды на краю вращаются слишком быстро — значит, есть невидимая масса, которой в 5 раз больше обычной.', 'Stars at the edge orbit too fast, so there is invisible mass about five times the ordinary matter.'],
      ],
    },
    {
      id: 'a11-galaxies',
      title: ['Галактики и закон Хаббла', 'Galaxies and Hubble’s law'],
      intro: [
        'Почти все галактики удаляются от нас, и тем быстрее, чем они дальше. Это значит, что Вселенная расширяется.',
        'Nearly all galaxies move away from us, faster the further they are. The Universe is expanding.',
      ],
      points: [
        ['Виды галактик', 'Types of galaxies', 'Спиральные, эллиптические и неправильные; в видимой Вселенной их около двух триллионов.', 'Spiral, elliptical and irregular; the observable Universe holds about two trillion.'],
        ['Красное смещение', 'Redshift', 'Свет удаляющейся галактики растянут к красному концу спектра — как гудок уезжающей машины звучит ниже (эффект Доплера).', 'Light from a receding galaxy is stretched to the red end, like a departing car’s horn sounding lower (Doppler effect).'],
        ['Закон Хаббла', 'Hubble’s law', 'v = H₀·r, где H₀ ≈ 70 км/с на мегапарсек.', 'v = H₀·r, with H₀ ≈ 70 km/s per megaparsec.'],
      ],
      formula: 'v = H_0 r',
      sim: { moment: 'moment_doppler' },
    },
    {
      id: 'a11-big-bang',
      title: ['Большой взрыв и возраст Вселенной', 'The Big Bang and the age of the Universe'],
      intro: [
        'Если прокрутить расширение назад, всё вещество окажется сжатым в горячую плотную точку 13,8 млрд лет назад.',
        'Run the expansion backwards and all matter is squeezed into a hot dense state 13.8 billion years ago.',
      ],
      points: [
        ['Реликтовое излучение', 'Cosmic microwave background', 'Остывший свет горячей молодой Вселенной приходит со всех сторон, сейчас его температура 2,7 К.', 'The cooled light of the hot young Universe arrives from every direction, now at 2.7 K.'],
        ['Первые атомы', 'First atoms', 'Через 3 минуты образовались ядра водорода и гелия, через 380 000 лет — первые атомы, и Вселенная стала прозрачной.', 'After 3 minutes hydrogen and helium nuclei formed; after 380 000 years the first atoms, and the Universe became transparent.'],
        ['Тёмная энергия', 'Dark energy', 'Расширение ускоряется; причину называют тёмной энергией — это около 68% всего содержимого Вселенной.', 'The expansion is speeding up; the cause is called dark energy, about 68% of the Universe’s content.'],
      ],
      formula: 't \\approx \\frac{1}{H_0}',
      sim: { engine: 'universe_solar_stars' },
    },
    {
      id: 'a11-exoplanets',
      title: ['Экзопланеты и поиск жизни', 'Exoplanets and the search for life'],
      intro: [
        'Сегодня известно больше 5500 планет у других звёзд. Некоторые находятся в «зоне жизни», где может быть жидкая вода.',
        'More than 5500 planets around other stars are known today; some lie in the “habitable zone” where liquid water could exist.',
      ],
      points: [
        ['Метод транзитов', 'Transit method', 'Когда планета проходит перед звездой, её блеск чуть падает; по глубине провала узнают размер планеты.', 'When a planet crosses its star, the star dims slightly; the dip’s depth gives the planet’s size.'],
        ['Метод лучевых скоростей', 'Radial velocity', 'Планета раскачивает звезду, и линии её спектра то краснеют, то синеют.', 'The planet wobbles its star, so the star’s spectral lines shift red and blue in turn.'],
        ['Зона жизни', 'Habitable zone', 'Расстояние, на котором планете не слишком жарко и не слишком холодно для жидкой воды.', 'The distance at which a planet is neither too hot nor too cold for liquid water.'],
      ],
    },
  ]),
];
