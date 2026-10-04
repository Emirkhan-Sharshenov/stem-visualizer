import { section } from './types';

const B = 'biology';

export const BIOLOGY_6 = [
  section(B, 6, 'structure', ['Строение покрытосеменных растений', 'Structure of flowering plants'], [
    {
      id: 'b6-seed',
      title: ['Семя', 'The seed'],
      intro: [
        'Семя — «упакованное» растение: зародыш с запасом пищи в защитной кожуре.',
        'A seed is a packed-up plant: an embryo with a food store inside a protective coat.',
      ],
      points: [
        ['Двудольные', 'Dicots', 'Фасоль: кожура, зародыш с двумя мясистыми семядолями, где лежит запас пищи.', 'Bean: a seed coat and an embryo with two fleshy seed leaves holding the food.'],
        ['Однодольные', 'Monocots', 'Пшеница: одна семядоля, а запас питательных веществ — в эндосперме.', 'Wheat: one seed leaf, with food stored in the endosperm.'],
        ['Зародыш', 'Embryo', 'Корешок, стебелёк, почечка и семядоли — будущее растение в миниатюре.', 'Root, stem, bud and seed leaves: the future plant in miniature.'],
      ],
    },
    {
      id: 'b6-root',
      title: ['Корень', 'The root'],
      intro: [
        'Корень удерживает растение в почве и всасывает воду с минеральными солями.',
        'The root anchors the plant and absorbs water and mineral salts.',
      ],
      points: [
        ['Виды корней', 'Kinds of roots', 'Главный растёт из зародыша, боковые — от главного, придаточные — от стебля.', 'The main root grows from the embryo, lateral roots from it, adventitious ones from the stem.'],
        ['Корневые системы', 'Root systems', 'Стержневая (одуванчик, двудольные) и мочковатая (пшеница, однодольные).', 'Taproot (dandelion, dicots) and fibrous (wheat, monocots).'],
        ['Зоны корня', 'Root zones', 'Деления, роста, всасывания (с корневыми волосками), проведения. Кончик защищён корневым чехликом.', 'Division, elongation, absorption (with root hairs) and conduction. A root cap protects the tip.'],
        ['Видоизменения корней', 'Modified roots', 'Корнеплоды (морковь), корневые клубни (георгин), воздушные корни (орхидеи).', 'Taproots (carrot), root tubers (dahlia), aerial roots (orchids).'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'b6-shoot',
      title: ['Побег. Почки', 'Shoots. Buds'],
      intro: [
        'Побег — стебель с листьями и почками. Из почек развиваются новые побеги и цветки.',
        'A shoot is a stem with leaves and buds. Buds grow into new shoots and flowers.',
      ],
      points: [
        ['Строение побега', 'Shoot structure', 'Узлы (где лист), междоузлия, пазухи листьев.', 'Nodes (where leaves grow), internodes, leaf axils.'],
        ['Вегетативные и генеративные почки', 'Leaf and flower buds', 'Из вегетативных — побег с листьями, из генеративных — цветок.', 'Leaf buds make leafy shoots; flower buds make flowers.'],
        ['Верхушечные и пазушные', 'Terminal and axillary', 'Верхушечная удлиняет побег, пазушные дают ветвление.', 'The terminal bud lengthens the shoot; axillary buds make branches.'],
      ],
    },
    {
      id: 'b6-leaf',
      title: ['Лист', 'The leaf'],
      intro: [
        'Лист — фабрика фотосинтеза. Его форма и строение помогают ловить свет и газы.',
        'The leaf is the photosynthesis factory, shaped to catch light and gases.',
      ],
      points: [
        ['Внешнее строение', 'External structure', 'Листовая пластинка и черешок; простые (берёза) и сложные (рябина) листья.', 'Blade and stalk; simple (birch) and compound (rowan) leaves.'],
        ['Жилкование и листорасположение', 'Venation and arrangement', 'Сетчатое у двудольных, параллельное и дуговое у однодольных. Листья расположены очерёдно, супротивно или мутовкой.', 'Net veins in dicots, parallel or arched in monocots. Leaves are alternate, opposite or whorled.'],
        ['Клеточное строение', 'Inside a leaf', 'Кожица с устьицами, мякоть с хлоропластами, жилки с сосудами.', 'Skin with stomata, chloroplast-filled tissue, veins with vessels.'],
        ['Видоизменения листьев', 'Modified leaves', 'Колючки кактуса, усики гороха, ловушки росянки.', 'Cactus spines, pea tendrils, sundew traps.'],
      ],
      sim: { moment: 'moment_photosynthesis' },
    },
    {
      id: 'b6-stem',
      title: ['Стебель', 'The stem'],
      intro: [
        'Стебель несёт листья к свету и связывает корень с листьями двусторонним «транспортом».',
        'The stem lifts leaves to the light and links root and leaves with two-way transport.',
      ],
      points: [
        ['Внутреннее строение', 'Inner structure', 'Кора (с лубом), камбий, древесина (с сосудами), сердцевина.', 'Bark (with phloem), cambium, wood (with vessels), pith.'],
        ['Годичные кольца', 'Growth rings', 'Камбий каждый год откладывает слой древесины: по кольцам узнают возраст дерева.', 'Cambium adds a layer of wood each year, so rings show a tree’s age.'],
      ],
    },
    {
      id: 'b6-modified-shoots',
      title: ['Видоизменённые побеги', 'Modified shoots'],
      intro: [
        'Некоторые побеги прячутся под землёй и служат кладовой или способом размножения.',
        'Some shoots hide underground as food stores or a way to reproduce.',
      ],
      points: [
        ['Корневище', 'Rhizome', 'Подземный стебель пырея и ландыша с почками.', 'An underground stem with buds, as in couch grass and lily of the valley.'],
        ['Клубень', 'Tuber', 'Картофель — утолщённый побег с «глазками»-почками.', 'A potato is a swollen shoot whose “eyes” are buds.'],
        ['Луковица', 'Bulb', 'Короткий стебель-донце с сочными листьями-чешуями.', 'A short stem plate wrapped in fleshy scale leaves.'],
      ],
    },
    {
      id: 'b6-flower',
      title: ['Цветок', 'The flower'],
      intro: [
        'Цветок — укороченный побег для полового размножения. Из него разовьются плоды и семена.',
        'A flower is a shortened shoot for sexual reproduction that becomes fruit and seeds.',
      ],
      points: [
        ['Строение цветка', 'Parts', 'Цветоножка, цветоложе, чашечка, венчик, тычинки (пыльца) и пестик (завязь с семязачатками).', 'Stalk, receptacle, sepals, petals, stamens (pollen) and pistil (ovary with ovules).'],
        ['Околоцветник', 'Perianth', 'Чашечка и венчик вместе; простой — если они не различаются (тюльпан).', 'Sepals and petals together; simple if they look alike (tulip).'],
        ['Однодомные и двудомные', 'Monoecious and dioecious', 'У кукурузы мужские и женские цветки на одном растении, у тополя — на разных.', 'Maize has male and female flowers on one plant; poplar on separate plants.'],
      ],
    },
    {
      id: 'b6-inflorescences',
      title: ['Соцветия', 'Inflorescences'],
      intro: [
        'Мелкие цветки, собранные в соцветие, заметнее для насекомых и опыляются лучше.',
        'Small flowers grouped together are easier for insects to spot and pollinate.',
      ],
      points: [
        ['Простые', 'Simple', 'Кисть (черёмуха), колос (подорожник), зонтик (вишня), корзинка (подсолнух), головка (клевер), початок (кукуруза), щиток (груша).', 'Raceme (bird cherry), spike (plantain), umbel (cherry), head (sunflower), capitulum (clover), spadix (maize), corymb (pear).'],
        ['Сложные', 'Compound', 'Сложный колос (пшеница), сложный зонтик (морковь), метёлка (сирень).', 'Compound spike (wheat), compound umbel (carrot), panicle (lilac).'],
      ],
    },
    {
      id: 'b6-fruits',
      title: ['Плоды', 'Fruits'],
      intro: [
        'Плод развивается из завязи и защищает семена, а потом помогает им разлететься.',
        'A fruit develops from the ovary, protects the seeds and then helps them spread.',
      ],
      points: [
        ['Классификация', 'Types', 'Сухие (боб, коробочка, орех) и сочные (ягода, яблоко, костянка); одно- и многосемянные.', 'Dry (pod, capsule, nut) and fleshy (berry, apple, drupe); one- or many-seeded.'],
        ['Распространение', 'Dispersal', 'Ветром (одуванчик), животными (репейник, ягоды), водой (кокос), самостоятельно (недотрога).', 'By wind (dandelion), animals (burrs, berries), water (coconut) or self-launching (touch-me-not).'],
      ],
    },
  ]),

  section(B, 6, 'plant-life', ['Жизнь растений', 'How plants live'], [
    {
      id: 'b6-mineral-nutrition',
      title: ['Минеральное питание', 'Mineral nutrition'],
      intro: [
        'Растение берёт из почвы воду и соли азота, фосфора, калия. Без них оно чахнет даже на свету.',
        'Plants take water and nitrogen, phosphorus and potassium salts from the soil. Without them they wilt even in light.',
      ],
      points: [
        ['Роль корня', 'The root’s job', 'Корневые волоски всасывают раствор солей.', 'Root hairs absorb the salt solution.'],
        ['Удобрения', 'Fertilisers', 'Органические (навоз, компост) и минеральные (азотные, фосфорные, калийные).', 'Organic (manure, compost) and mineral (nitrogen, phosphate, potash).'],
      ],
    },
    {
      id: 'b6-photosynthesis',
      title: ['Фотосинтез', 'Photosynthesis'],
      intro: [
        'В листьях на свету из углекислого газа и воды образуются органические вещества и кислород.',
        'In leaves, light turns carbon dioxide and water into organic matter and oxygen.',
      ],
      points: [
        ['Условия', 'Conditions', 'Свет, хлорофилл, CO₂, вода, тепло.', 'Light, chlorophyll, CO₂, water and warmth.'],
        ['Исходные вещества и продукты', 'Inputs and outputs', 'CO₂ + H₂O → глюкоза + O₂.', 'CO₂ + H₂O → glucose + O₂.'],
        ['Значение и роль хлорофилла', 'Why it matters', 'Источник пищи и кислорода для всей жизни на Земле. Хлорофилл улавливает свет.', 'The source of food and oxygen for all life. Chlorophyll captures the light.'],
      ],
      formula: '6\\mathrm{CO_2} + 6\\mathrm{H_2O} \\to \\mathrm{C_6H_{12}O_6} + 6\\mathrm{O_2}',
      sim: { moment: 'moment_photosynthesis' },
    },
    {
      id: 'b6-respiration',
      title: ['Дыхание растений', 'Plant respiration'],
      intro: [
        'Растения дышат круглые сутки: поглощают кислород и выделяют CO₂, получая энергию из сахара.',
        'Plants breathe day and night, taking in oxygen and giving off CO₂ to release energy from sugar.',
      ],
      points: [
        ['Дыхание и фотосинтез', 'Respiration vs photosynthesis', 'Днём фотосинтез сильнее дыхания, ночью идёт только дыхание.', 'By day photosynthesis outpaces respiration; at night only respiration runs.'],
      ],
    },
    {
      id: 'b6-transpiration',
      title: ['Испарение воды. Листопад', 'Transpiration. Leaf fall'],
      intro: [
        'Листья испаряют воду через устьица — это охлаждает растение и тянет воду от корней вверх.',
        'Leaves evaporate water through stomata, cooling the plant and pulling water up from the roots.',
      ],
      points: [
        ['Роль устьиц', 'Stomata', 'Открываются и закрываются, регулируя испарение и газообмен.', 'They open and close to control water loss and gas exchange.'],
        ['Листопад', 'Leaf fall', 'Зимой воду из мёрзлой почвы не взять, и деревья сбрасывают листья, чтобы не засохнуть.', 'In winter water can’t be drawn from frozen soil, so trees drop leaves to avoid drying out.'],
      ],
      sim: { moment: 'moment_photosynthesis' },
    },
    {
      id: 'b6-transport',
      title: ['Передвижение веществ', 'Transport in plants'],
      intro: [
        'По растению идут два потока: вода с солями вверх, органические вещества вниз.',
        'Two streams run through a plant: water and salts up, organic matter down.',
      ],
      points: [
        ['Восходящий ток', 'Upward stream', 'По сосудам древесины — от корней к листьям.', 'Through wood vessels from roots to leaves.'],
        ['Нисходящий ток', 'Downward stream', 'По ситовидным трубкам луба — от листьев к корням и плодам.', 'Through phloem sieve tubes from leaves to roots and fruits.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'b6-germination',
      title: ['Прорастание семян', 'Germination'],
      intro: [
        'Семя может годами лежать «спящим», пока не наступят подходящие условия.',
        'A seed can lie dormant for years until conditions are right.',
      ],
      points: [
        ['Условия прорастания', 'Conditions', 'Вода, воздух и тепло. Свет большинству семян не нужен.', 'Water, air and warmth. Most seeds don’t need light.'],
        ['Глубина посева', 'Sowing depth', 'Мелкие семена сеют мельче — им хватит запаса пищи, только чтобы выбраться к свету.', 'Small seeds go shallower: their food store only lasts until they reach light.'],
      ],
    },
    {
      id: 'b6-reproduction',
      title: ['Размножение растений', 'Plant reproduction'],
      intro: [
        'Растения размножаются частями тела или семенами, которые появляются после опыления и оплодотворения.',
        'Plants reproduce from body parts or from seeds made after pollination and fertilisation.',
      ],
      points: [
        ['Бесполое и половое', 'Asexual and sexual', 'Бесполое даёт копии родителя, половое — новые сочетания признаков.', 'Asexual gives copies of the parent; sexual gives new combinations.'],
        ['Опыление', 'Pollination', 'Насекомыми, ветром, самоопыление, искусственное (человек кисточкой).', 'By insects, wind, self-pollination or by hand with a brush.'],
        ['Двойное оплодотворение', 'Double fertilisation', 'Открыто Навашиным: один спермий даёт зародыш, другой — эндосперм.', 'Found by Navashin: one sperm makes the embryo, the other the endosperm.'],
        ['Вегетативное размножение', 'Vegetative propagation', 'Черенками, отводками, клубнями, прививкой.', 'Cuttings, layering, tubers, grafting.'],
      ],
    },
    {
      id: 'b6-growth',
      title: ['Рост и развитие растений', 'Growth and development'],
      intro: [
        'Растения растут всю жизнь, и их развитие зависит от света, тепла, воды и питания.',
        'Plants grow throughout life, and their development depends on light, heat, water and nutrients.',
      ],
      points: [
        ['Зависимость от условий', 'Environmental effects', 'В темноте росток вытягивается и бледнеет, при засухе мельчают листья.', 'In the dark a shoot stretches and pales; in drought leaves stay small.'],
      ],
    },
  ]),

  section(B, 6, 'classification', ['Классификация растений', 'Classifying plants'], [
    {
      id: 'b6-systematics',
      title: ['Систематика', 'Taxonomy'],
      intro: [
        'Чтобы не запутаться в сотнях тысяч видов, растения раскладывают по «полочкам» — систематическим группам.',
        'To keep hundreds of thousands of species in order, plants are sorted into nested groups.',
      ],
      points: [
        ['Систематические категории', 'Ranks', 'Вид → род → семейство → класс → отдел → царство.', 'Species → genus → family → class → division → kingdom.'],
        ['Двойное название', 'Binomial names', 'Род и вид: шиповник майский — Rosa majalis.', 'Genus plus species: Rosa majalis.'],
      ],
    },
    {
      id: 'b6-dicots',
      title: ['Класс Двудольные', 'Dicots'],
      intro: [
        'Две семядоли, сетчатое жилкование, стержневая корневая система, цветки из 4–5 частей.',
        'Two seed leaves, net veins, a taproot, flower parts in fours or fives.',
      ],
      points: [
        ['Крестоцветные', 'Mustard family', 'Капуста, редис: четыре лепестка крестом.', 'Cabbage, radish: four petals in a cross.'],
        ['Розоцветные', 'Rose family', 'Яблоня, шиповник, клубника.', 'Apple, dog rose, strawberry.'],
        ['Бобовые', 'Legume family', 'Горох, фасоль: на корнях клубеньки с бактериями, обогащающими почву азотом.', 'Pea, bean: root nodules with bacteria that add nitrogen to the soil.'],
        ['Паслёновые', 'Nightshade family', 'Картофель, томат, перец.', 'Potato, tomato, pepper.'],
        ['Сложноцветные', 'Daisy family', 'Подсолнечник, ромашка: соцветие-корзинка.', 'Sunflower, daisy: a flower-head inflorescence.'],
      ],
    },
    {
      id: 'b6-monocots',
      title: ['Класс Однодольные', 'Monocots'],
      intro: [
        'Одна семядоля, параллельное жилкование, мочковатые корни, цветки из 3 частей.',
        'One seed leaf, parallel veins, fibrous roots, flower parts in threes.',
      ],
      points: [
        ['Злаки', 'Grasses', 'Пшеница, рис, кукуруза — главная пища человечества.', 'Wheat, rice, maize: humanity’s staple foods.'],
        ['Лилейные', 'Lily family', 'Тюльпан, лук, чеснок.', 'Tulip, onion, garlic.'],
      ],
    },
    {
      id: 'b6-crops',
      title: ['Культурные растения', 'Crop plants'],
      intro: [
        'Человек тысячелетиями отбирал лучшие растения и вывел сорта, которых нет в дикой природе.',
        'For millennia people selected the best plants, breeding varieties not found in the wild.',
      ],
      points: [
        ['Важнейшие культуры', 'Key crops', 'Зерновые, овощные, плодовые, технические (хлопчатник, лён), кормовые.', 'Grains, vegetables, fruit, industrial crops (cotton, flax) and fodder.'],
      ],
    },
  ]),

  section(B, 6, 'communities', ['Природные сообщества', 'Plant communities'], [
    {
      id: 'b6-plant-communities',
      title: ['Растительные сообщества', 'Plant communities'],
      intro: [
        'Растения живут не поодиночке, а сообществами: лес, луг, степь. В них каждый занимает своё место.',
        'Plants live in communities like forest, meadow and steppe, where each has its place.',
      ],
      points: [
        ['Ярусность', 'Layers', 'В лесу: деревья, подлесок, кустарнички и травы, мхи. Каждый ярус приспособлен к своему свету.', 'In a forest: trees, understorey, shrubs and herbs, mosses, each adapted to its light.'],
        ['Смена сообществ', 'Succession', 'После пожара сначала растут травы, потом берёза, а через десятилетия — ель.', 'After a fire grasses come first, then birch, and decades later spruce.'],
      ],
    },
    {
      id: 'b6-plant-protection',
      title: ['Охрана растений', 'Protecting plants'],
      intro: [
        'Многие растения стали редкими из-за сбора и разрушения мест обитания.',
        'Many plants have become rare through picking and habitat loss.',
      ],
      points: [
        ['Как помочь', 'How to help', 'Не рвать редкие цветы, не вытаптывать, сажать деревья. Тюльпан Грейга в Кыргызстане охраняется.', 'Don’t pick rare flowers or trample them, and plant trees. Greig’s tulip is protected in Kyrgyzstan.'],
      ],
    },
  ]),
];
