import { section } from './types';

const B = 'biology';

export const BIOLOGY_5 = [
  section(B, 5, 'intro', ['Биология — наука о живом', 'Biology: the science of life'], [
    {
      id: 'b5-what-biology',
      title: ['Что изучает биология', 'What biology studies'],
      intro: [
        'Биология изучает всё живое: от бактерий до китов. У неё много разделов, и каждый отвечает на свои вопросы.',
        'Biology studies every living thing, from bacteria to whales. It has many branches, each with its own questions.',
      ],
      points: [
        ['Биологические науки', 'Branches', 'Ботаника — растения, зоология — животные, анатомия — строение тела, микробиология — микробы, экология — связи с природой.', 'Botany studies plants, zoology animals, anatomy body structure, microbiology microbes, ecology links with nature.'],
        ['Значение биологии', 'Why it matters', 'Медицина, сельское хозяйство, охрана природы и производство продуктов опираются на биологию.', 'Medicine, farming, conservation and food production all rely on biology.'],
      ],
    },
    {
      id: 'b5-methods',
      title: ['Методы изучения природы', 'How nature is studied'],
      intro: [
        'Учёные-биологи наблюдают, ставят опыты, измеряют, описывают и сравнивают. Так из догадок получаются знания.',
        'Biologists observe, experiment, measure, describe and compare. That’s how guesses become knowledge.',
      ],
      points: [
        ['Наблюдение и описание', 'Observation and description', 'Следить за птицами у кормушки и записывать, кто и когда прилетает.', 'Watching birds at a feeder and noting who comes when.'],
        ['Эксперимент', 'Experiment', 'Поставить два ростка — на свет и в темноту — и сравнить.', 'Put one seedling in light and one in the dark and compare.'],
        ['Измерение и сравнение', 'Measuring and comparing', 'Линейка, весы, термометр помогают сравнивать точно, а не «на глаз».', 'Rulers, scales and thermometers make comparisons precise.'],
      ],
    },
    {
      id: 'b5-microscope',
      title: ['Увеличительные приборы', 'Magnifying instruments'],
      intro: [
        'Клетки слишком малы для глаза. Лупа увеличивает в 2–20 раз, микроскоп — в сотни и тысячи.',
        'Cells are too small to see. A magnifier enlarges 2–20 times, a microscope hundreds or thousands.',
      ],
      points: [
        ['Лупа', 'Magnifier', 'Одна собирающая линза в оправе.', 'A single converging lens in a frame.'],
        ['Световой микроскоп', 'Light microscope', 'Окуляр, объектив, тубус, предметный столик, зеркало или лампа, винты настройки. Увеличение = окуляр × объектив.', 'Eyepiece, objective, tube, stage, mirror or lamp, focus knobs. Magnification = eyepiece × objective.'],
        ['Правила работы', 'Using it', 'Начинать с малого увеличения, опускать объектив сбоку, наводить резкость винтом вверх.', 'Start at low power, lower the objective while watching from the side, focus by turning upward.'],
      ],
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'b5-signs-of-life',
      title: ['Признаки живого', 'Signs of life'],
      intro: [
        'Живое отличается от неживого набором признаков. Кристалл растёт, но не дышит и не размножается.',
        'Living things share a set of features. A crystal grows but doesn’t breathe or reproduce.',
      ],
      points: [
        ['Клеточное строение', 'Made of cells', 'Все организмы состоят из клеток.', 'All organisms are made of cells.'],
        ['Питание, дыхание, обмен веществ', 'Feeding, breathing, metabolism', 'Организм получает вещества и энергию и избавляется от лишнего.', 'An organism takes in matter and energy and gets rid of waste.'],
        ['Рост, развитие, размножение', 'Growth, development, reproduction', 'Из семени вырастает дерево, которое даёт новые семена.', 'A seed grows into a tree that makes new seeds.'],
        ['Раздражимость', 'Responsiveness', 'Реакция на свет, тепло, прикосновение: мимоза складывает листья.', 'Reacting to light, heat, touch: a mimosa folds its leaves.'],
      ],
    },
  ]),

  section(B, 5, 'cell', ['Клетка — основа строения и жизнедеятельности', 'The cell'], [
    {
      id: 'b5-cell-structure',
      title: ['Строение клетки', 'Cell structure'],
      intro: [
        'Клетка — мельчайшая живая единица. У растений и животных она устроена похоже, но есть важные отличия.',
        'The cell is the smallest living unit. Plant and animal cells are alike but differ in key ways.',
      ],
      points: [
        ['Мембрана и клеточная стенка', 'Membrane and cell wall', 'Мембрана есть у всех клеток; у растений снаружи ещё прочная стенка из целлюлозы.', 'Every cell has a membrane; plants add a tough cellulose wall outside it.'],
        ['Цитоплазма и ядро', 'Cytoplasm and nucleus', 'Цитоплазма — внутренняя среда, ядро хранит наследственную информацию.', 'Cytoplasm is the inner fluid; the nucleus holds hereditary information.'],
        ['Вакуоли', 'Vacuoles', 'Пузыри с клеточным соком; у растений одна огромная центральная вакуоль.', 'Sacs of cell sap; plants have one huge central vacuole.'],
        ['Пластиды', 'Plastids', 'Хлоропласты (зелёные), хромопласты (жёлтые, красные), лейкопласты (бесцветные, запасают крахмал).', 'Chloroplasts (green), chromoplasts (yellow, red), leucoplasts (colourless, store starch).'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b5-cell-chemistry',
      title: ['Химический состав клетки', 'What cells are made of'],
      intro: [
        'Клетка на 70–80% состоит из воды. Остальное — соли и органические вещества: белки, жиры, углеводы.',
        'A cell is 70–80% water. The rest is salts and organic substances: proteins, fats and carbohydrates.',
      ],
      points: [
        ['Неорганические вещества', 'Inorganic substances', 'Вода растворяет вещества и переносит их, минеральные соли нужны для костей и нервов.', 'Water dissolves and carries substances; mineral salts are needed for bones and nerves.'],
        ['Органические вещества', 'Organic substances', 'Белки строят клетку, жиры и углеводы дают энергию. Крахмал находят каплей йода — синеет.', 'Proteins build the cell; fats and carbohydrates give energy. Iodine turns starch blue.'],
      ],
    },
    {
      id: 'b5-cell-life',
      title: ['Жизнедеятельность клетки. Ткани', 'Cell life. Tissues'],
      intro: [
        'Клетка питается, дышит, растёт и делится. Похожие клетки, выполняющие общую работу, образуют ткань.',
        'A cell feeds, breathes, grows and divides. Similar cells doing one job form a tissue.',
      ],
      points: [
        ['Рост клетки', 'Growth', 'Клетка увеличивается в размерах, накапливая вещества.', 'A cell gets bigger as it stores substances.'],
        ['Деление клетки', 'Division', 'Сначала делится ядро, потом цитоплазма: из одной клетки — две.', 'First the nucleus divides, then the cytoplasm: one cell becomes two.'],
        ['Ткань', 'Tissue', 'У растений — покровная, проводящая, основная; у животных — эпителий, мышцы, нервы, соединительная ткань.', 'Plants have covering, conducting and ground tissue; animals epithelium, muscle, nerve and connective tissue.'],
      ],
      sim: { lab: 'biology_cell' },
    },
  ]),

  section(B, 5, 'kingdoms', ['Многообразие организмов', 'Diversity of life'], [
    {
      id: 'b5-kingdoms',
      title: ['Царства живой природы', 'Kingdoms of life'],
      intro: [
        'Всё живое делят на царства: бактерии, грибы, растения и животные. Вирусы стоят особняком — они не имеют клеток.',
        'Life is split into kingdoms: bacteria, fungi, plants and animals. Viruses stand apart, with no cells.',
      ],
      points: [
        ['Бактерии', 'Bacteria', 'Одноклеточные без ядра.', 'Single cells without a nucleus.'],
        ['Грибы', 'Fungi', 'Питаются готовыми веществами, но растут как растения.', 'Feed on ready-made matter but grow like plants.'],
        ['Растения', 'Plants', 'Сами создают органические вещества из света.', 'Make their own food from light.'],
        ['Животные', 'Animals', 'Питаются готовыми веществами и чаще всего двигаются.', 'Eat other organisms and usually move.'],
      ],
    },
    {
      id: 'b5-bacteria',
      title: ['Бактерии', 'Bacteria'],
      intro: [
        'Бактерии — самые древние и многочисленные живые существа. Большинство из них полезны.',
        'Bacteria are the oldest and most numerous living things, and most are helpful.',
      ],
      points: [
        ['Строение и жизнедеятельность', 'Structure and life', 'Клетка без ядра, размножается делением каждые 20 минут. В плохих условиях образует спору.', 'A cell without a nucleus that divides every 20 minutes and forms a spore in bad times.'],
        ['Роль в природе и жизни человека', 'Role', 'Разлагают остатки, создают почву; дают кефир, йогурт, сыр.', 'Break down remains and build soil; give us kefir, yoghurt and cheese.'],
        ['Болезнетворные бактерии', 'Disease-causing bacteria', 'Вызывают ангину, туберкулёз, холеру. Защита — гигиена, прививки, антибиотики.', 'Cause strep throat, tuberculosis, cholera. Protection: hygiene, vaccines, antibiotics.'],
      ],
    },
    {
      id: 'b5-fungi',
      title: ['Грибы', 'Fungi'],
      intro: [
        'Гриб — это не только шляпка. Основная часть — грибница из тонких нитей, скрытая в почве.',
        'A fungus is more than its cap: most of it is a hidden network of fine threads in the soil.',
      ],
      points: [
        ['Общая характеристика', 'Overview', 'Тело из нитей-гиф, клеточная стенка из хитина, питаются готовыми веществами.', 'Bodies of hyphae with chitin walls, feeding on ready-made matter.'],
        ['Шляпочные грибы', 'Mushrooms', 'Съедобные (белый, подосиновик) и ядовитые (бледная поганка, мухомор). Незнакомые грибы не собирают.', 'Edible (porcini, aspen bolete) and poisonous (death cap, fly agaric). Never pick unknown ones.'],
        ['Плесень и дрожжи', 'Moulds and yeast', 'Пеницилл даёт антибиотик пенициллин, дрожжи поднимают тесто.', 'Penicillium gives penicillin; yeast raises dough.'],
        ['Грибы-паразиты', 'Parasitic fungi', 'Головня и спорынья вредят злакам, трутовики разрушают деревья.', 'Smut and ergot damage grain; bracket fungi rot trees.'],
      ],
    },
    {
      id: 'b5-plants',
      title: ['Растения. Лишайники', 'Plants. Lichens'],
      intro: [
        'Растения создают органические вещества и кислород для всей планеты. Лишайник — союз гриба и водоросли.',
        'Plants make organic matter and oxygen for the whole planet. A lichen is a partnership of a fungus and an alga.',
      ],
      points: [
        ['Общая характеристика', 'Overview', 'Хлорофилл, фотосинтез, клеточная стенка из целлюлозы, неограниченный рост.', 'Chlorophyll, photosynthesis, cellulose walls, lifelong growth.'],
        ['Группы растений', 'Plant groups', 'Водоросли, мхи, папоротники, голосеменные (сосна), покрытосеменные (цветковые).', 'Algae, mosses, ferns, gymnosperms (pine) and flowering plants.'],
        ['Лишайники', 'Lichens', 'Гриб даёт воду и защиту, водоросль — питание. Растут на камнях и показывают чистоту воздуха.', 'The fungus gives water and shelter, the alga food. They grow on rocks and signal clean air.'],
      ],
      sim: { moment: 'moment_photosynthesis' },
    },
    {
      id: 'b5-animals',
      title: ['Животные', 'Animals'],
      intro: [
        'Животные питаются готовой пищей, большинство активно двигается. Их миллионы видов.',
        'Animals eat ready-made food and most move actively. There are millions of species.',
      ],
      points: [
        ['Простейшие', 'Protists', 'Одноклеточные: амёба, инфузория.', 'Single-celled: amoebas, ciliates.'],
        ['Беспозвоночные', 'Invertebrates', 'Черви, моллюски, насекомые, пауки — без позвоночника.', 'Worms, molluscs, insects and spiders: no backbone.'],
        ['Позвоночные', 'Vertebrates', 'Рыбы, земноводные, пресмыкающиеся, птицы, млекопитающие.', 'Fish, amphibians, reptiles, birds and mammals.'],
      ],
    },
  ]),

  section(B, 5, 'habitats', ['Среды обитания организмов', 'Habitats'], [
    {
      id: 'b5-environments',
      title: ['Среды жизни', 'Living environments'],
      intro: [
        'Организмы живут в четырёх средах, и каждая требует своих приспособлений.',
        'Organisms live in four environments, each needing its own adaptations.',
      ],
      points: [
        ['Водная', 'Water', 'Плотная, мало кислорода и света на глубине. Обтекаемое тело, жабры.', 'Dense, with little oxygen or light at depth. Streamlined bodies, gills.'],
        ['Наземно-воздушная', 'Land and air', 'Много света и кислорода, но резкие перепады температуры. Лёгкие, прочный скелет.', 'Plenty of light and oxygen but sharp temperature swings. Lungs, a strong skeleton.'],
        ['Почвенная', 'Soil', 'Темно и тесно. Крот и дождевой червь роют ходы.', 'Dark and cramped. Moles and earthworms dig tunnels.'],
        ['Организменная', 'Inside organisms', 'Паразиты живут внутри других организмов.', 'Parasites live inside other organisms.'],
      ],
    },
    {
      id: 'b5-factors',
      title: ['Экологические факторы', 'Ecological factors'],
      intro: [
        'На организм действуют условия неживой природы, другие организмы и человек.',
        'Organisms are affected by non-living conditions, other organisms and people.',
      ],
      points: [
        ['Абиотические', 'Abiotic', 'Свет, температура, влажность, ветер.', 'Light, temperature, humidity, wind.'],
        ['Биотические', 'Biotic', 'Соседи, хищники, паразиты, конкуренты.', 'Neighbours, predators, parasites, competitors.'],
        ['Антропогенные', 'Human', 'Вырубка лесов, распашка, загрязнение, строительство.', 'Logging, ploughing, pollution, construction.'],
      ],
    },
    {
      id: 'b5-communities',
      title: ['Природные сообщества. Цепи питания', 'Communities. Food chains'],
      intro: [
        'Организмы связаны в цепи питания: каждый кого-то ест и кому-то служит пищей.',
        'Organisms are linked in food chains: each eats something and is eaten by something.',
      ],
      points: [
        ['Производители', 'Producers', 'Растения создают органику из света.', 'Plants make organic matter from light.'],
        ['Потребители', 'Consumers', 'Травоядные и хищники: трава → заяц → лиса.', 'Herbivores and predators: grass → hare → fox.'],
        ['Разрушители', 'Decomposers', 'Бактерии и грибы разлагают остатки в минеральные вещества для растений.', 'Bacteria and fungi break remains into minerals for plants.'],
        ['Природные зоны Земли', 'Earth’s natural zones', 'Тундра, тайга, степь, пустыня, тропический лес — у каждой свои сообщества.', 'Tundra, taiga, steppe, desert, rainforest, each with its own communities.'],
      ],
    },
  ]),

  section(B, 5, 'human', ['Человек на Земле', 'Humans on Earth'], [
    {
      id: 'b5-human-origin',
      title: ['Появление человека. Влияние на природу', 'Human origins. Our impact'],
      intro: [
        'Человек появился в Африке около 300 тысяч лет назад и быстро изменил облик всей планеты.',
        'Humans appeared in Africa about 300,000 years ago and quickly changed the face of the planet.',
      ],
      points: [
        ['Появление человека', 'Origins', 'Использование огня, орудий и речи отличило человека от предков.', 'Fire, tools and language set humans apart from their ancestors.'],
        ['Влияние на природу', 'Impact', 'Земледелие, города, промышленность — и вместе с ними исчезновение многих видов.', 'Farming, cities and industry, and with them the loss of many species.'],
      ],
    },
    {
      id: 'b5-conservation',
      title: ['Охрана природы. Здоровье', 'Conservation. Health'],
      intro: [
        'Чтобы сохранить природу, создают заповедники и Красные книги. Беречь здоровье — тоже часть отношения к природе.',
        'Nature reserves and Red Data Books protect nature. Looking after your health is part of the same care.',
      ],
      points: [
        ['Красная книга', 'Red Data Book', 'Список редких и исчезающих видов, которые охраняются законом. В Кыргызстане — снежный барс, архар.', 'A list of rare and endangered species protected by law, including the snow leopard and argali in Kyrgyzstan.'],
        ['Заповедники и нацпарки', 'Reserves and national parks', 'Иссык-Кульский, Сары-Челекский заповедники, Ала-Арча.', 'Issyk-Kul and Sary-Chelek reserves, Ala-Archa park.'],
        ['Здоровье и безопасность', 'Health and safety', 'Режим дня, движение, питание; осторожность с незнакомыми растениями, грибами и животными.', 'Routine, exercise, diet; care with unknown plants, mushrooms and animals.'],
      ],
    },
  ]),
];
