import { section } from './types';

const B = 'biology';

export const BIOLOGY_11 = [
  section(B, 11, 'variation', ['Изменчивость', 'Variation'], [
    {
      id: 'b11-modification',
      title: ['Модификационная изменчивость', 'Modification variation'],
      intro: [
        'Один и тот же генотип даёт разные признаки в разных условиях. Но пределы этих изменений заданы генами.',
        'The same genotype gives different traits in different conditions, but genes set the limits.',
      ],
      points: [
        ['Норма реакции', 'Range of reaction', 'Рост и вес сильно зависят от питания, цвет глаз — почти нет.', 'Height and weight depend a lot on diet; eye colour hardly at all.'],
        ['Вариационный ряд и кривая', 'Variation series and curve', 'Если измерить длину сотни колосьев, большинство будет средними: получится колоколообразная кривая.', 'Measure a hundred ears of wheat and most are average, forming a bell curve.'],
      ],
      sim: { moment: 'moment_gauss' },
    },
    {
      id: 'b11-combinative-mutational',
      title: ['Комбинативная и мутационная изменчивость', 'Combinative and mutational variation'],
      intro: [
        'Новые сочетания генов дают разнообразие в каждом поколении, а мутации создают совершенно новые гены.',
        'New gene combinations bring variety every generation, while mutations create brand-new genes.',
      ],
      points: [
        ['Комбинативная', 'Combinative', 'Кроссинговер, независимое расхождение хромосом, случайная встреча гамет.', 'Crossing over, independent assortment, random fertilisation.'],
        ['Генные мутации', 'Gene mutations', 'Изменение нуклеотидов внутри гена.', 'Changes to nucleotides within a gene.'],
        ['Хромосомные и геномные', 'Chromosomal and genomic', 'Перестройки хромосом или изменение их числа; полиплоидия у растений даёт крупные сорта.', 'Rearranged chromosomes or changed numbers; polyploidy gives large crop varieties.'],
        ['Мутагены', 'Mutagens', 'Радиация, некоторые химические вещества, вирусы.', 'Radiation, some chemicals, viruses.'],
      ],
      sim: { moment: 'moment_dna' },
    },
    {
      id: 'b11-vavilov-cytoplasm',
      title: ['Закон гомологических рядов. Цитоплазматическая наследственность', 'Homologous series. Cytoplasmic inheritance'],
      intro: [
        'Близкие виды изменяются сходным образом, а некоторые гены наследуются не через ядро.',
        'Related species vary in similar ways, and some genes are inherited outside the nucleus.',
      ],
      points: [
        ['Закон Вавилова', 'Vavilov’s law', 'Если у пшеницы есть безостые формы, их стоит искать и у ячменя.', 'If wheat has awnless forms, look for them in barley too.'],
        ['ДНК митохондрий и пластид', 'Mitochondrial and plastid DNA', 'Передаётся только по материнской линии.', 'Passed down only through the mother.'],
      ],
    },
  ]),

  section(B, 11, 'human-genetics', ['Генетика человека', 'Human genetics'], [
    {
      id: 'b11-human-methods',
      title: ['Методы изучения генетики человека', 'Methods of human genetics'],
      intro: [
        'На людях нельзя ставить скрещивания, поэтому генетики используют особые методы.',
        'We can’t do breeding experiments on people, so geneticists use special methods.',
      ],
      points: [
        ['Генеалогический', 'Pedigree', 'Родословная показывает, как признак передаётся в семье.', 'A family tree shows how a trait passes down.'],
        ['Близнецовый', 'Twin', 'Сравнение однояйцевых и разнояйцевых близнецов отделяет гены от среды.', 'Comparing identical and fraternal twins separates genes from environment.'],
        ['Цитогенетический, биохимический, популяционный', 'Cytogenetic, biochemical, population', 'Изучение хромосом, обмена веществ и частот генов в популяциях.', 'Studying chromosomes, metabolism and gene frequencies in populations.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b11-hereditary-diseases',
      title: ['Наследственные болезни. Консультирование', 'Hereditary diseases. Counselling'],
      intro: [
        'Многие болезни передаются по наследству. Ранняя диагностика позволяет помочь вовремя.',
        'Many diseases are inherited. Early diagnosis means help can come in time.',
      ],
      points: [
        ['Генные', 'Gene disorders', 'Фенилкетонурия: при ранней диете ребёнок развивается нормально.', 'Phenylketonuria: with an early diet the child develops normally.'],
        ['Хромосомные', 'Chromosomal', 'Синдром Дауна (лишняя 21-я), Тёрнера (X0), Клайнфельтера (XXY).', 'Down syndrome (extra 21), Turner (X0), Klinefelter (XXY).'],
        ['Медико-генетическое консультирование', 'Genetic counselling', 'Оценивает риск для будущих детей.', 'Estimates the risk for future children.'],
      ],
    },
  ]),

  section(B, 11, 'breeding', ['Селекция и биотехнология', 'Breeding and biotechnology'], [
    {
      id: 'b11-vavilov-centres',
      title: ['Центры происхождения культурных растений', 'Centres of crop origin'],
      intro: [
        'Вавилов нашёл места, где культурные растения были одомашнены и где их разнообразие наибольшее.',
        'Vavilov identified where crops were first domesticated and where their diversity is greatest.',
      ],
      points: [
        ['Центры', 'Centres', 'Например, Среднеазиатский — родина пшеницы, гороха, лука, яблони.', 'For example the Central Asian centre, home of wheat, peas, onions and apples.'],
      ],
    },
    {
      id: 'b11-breeding-methods',
      title: ['Методы селекции', 'Breeding methods'],
      intro: [
        'Селекция создаёт сорта и породы с нужными свойствами.',
        'Breeding creates varieties and breeds with useful traits.',
      ],
      points: [
        ['Отбор', 'Selection', 'Массовый — по внешнему виду, индивидуальный — по потомству.', 'Mass selection by appearance, individual selection by offspring.'],
        ['Гибридизация', 'Hybridisation', 'Близкородственная закрепляет признаки, отдалённая (мул, тритикале) объединяет виды.', 'Inbreeding fixes traits; wide crosses (mule, triticale) combine species.'],
        ['Гетерозис, полиплоидия, мутагенез', 'Heterosis, polyploidy, mutagenesis', 'Гибриды первого поколения мощнее родителей; полиплоиды крупнее; мутагены дают новые формы.', 'First-generation hybrids outgrow their parents; polyploids are bigger; mutagens create new forms.'],
        ['Растения, животные, микроорганизмы', 'Plants, animals, microbes', 'Сорта пшеницы, породы овец, штаммы бактерий для лекарств.', 'Wheat varieties, sheep breeds, bacterial strains for medicines.'],
      ],
    },
    {
      id: 'b11-biotech',
      title: ['Биотехнология', 'Biotechnology'],
      intro: [
        'Учёные научились переносить гены между организмами и выращивать ткани вне тела.',
        'Scientists can move genes between organisms and grow tissues outside the body.',
      ],
      points: [
        ['Генная инженерия', 'Genetic engineering', 'Ген человеческого инсулина вставлен в бактерию — так получают лекарство для диабетиков.', 'The human insulin gene put into bacteria makes medicine for diabetics.'],
        ['Клеточная инженерия', 'Cell engineering', 'Выращивание клеток и тканей, слияние клеток.', 'Growing cells and tissues, fusing cells.'],
        ['Клонирование и ГМО', 'Cloning and GMOs', 'Клон — генетическая копия; ГМО — организм с перенесённым геном.', 'A clone is a genetic copy; a GMO has a transferred gene.'],
        ['Этические проблемы', 'Ethics', 'Клонирование человека запрещено; безопасность ГМО строго проверяют.', 'Human cloning is banned; GMO safety is closely tested.'],
      ],
      sim: { moment: 'moment_dna' },
    },
  ]),

  section(B, 11, 'evolution', ['Эволюция', 'Evolution'], [
    {
      id: 'b11-history',
      title: ['История эволюционных идей. Теория Дарвина', 'History of evolution. Darwin'],
      intro: [
        'Линней упорядочил виды, Ламарк предположил их изменение, Дарвин объяснил механизм — естественный отбор.',
        'Linnaeus ordered species, Lamarck suggested they change, and Darwin explained how: natural selection.',
      ],
      points: [
        ['Линней, Ламарк, Кювье', 'Linnaeus, Lamarck, Cuvier', 'Систематика, первая теория эволюции, катастрофизм.', 'Taxonomy, the first theory of evolution, catastrophism.'],
        ['Предпосылки теории Дарвина', 'Darwin’s background', 'Кругосветное путешествие на «Бигле», успехи селекции.', 'His voyage on the Beagle and breeders’ successes.'],
        ['Искусственный и естественный отбор', 'Artificial and natural selection', 'Человек отбирает нужное ему, природа — приспособленное.', 'People choose what they want; nature picks what fits.'],
        ['Борьба за существование', 'Struggle for existence', 'Внутривидовая, межвидовая и с условиями среды.', 'Within species, between species and against the environment.'],
      ],
      sim: { moment: 'moment_gauss' },
    },
    {
      id: 'b11-species-population',
      title: ['Вид и популяция', 'Species and population'],
      intro: [
        'Вид состоит из популяций, и эволюция начинается с изменения генофонда популяции.',
        'A species is made of populations, and evolution starts with changes to a population’s gene pool.',
      ],
      points: [
        ['Критерии и структура вида', 'Species criteria and structure', 'Вид распадается на подвиды и популяции.', 'A species divides into subspecies and populations.'],
        ['Генофонд', 'Gene pool', 'Совокупность всех генов популяции.', 'All the genes in a population.'],
      ],
    },
    {
      id: 'b11-synthetic',
      title: ['Синтетическая теория эволюции', 'Modern synthesis'],
      intro: [
        'Современная теория соединила Дарвина и генетику: эволюцию двигают мутации, отбор и случай.',
        'The modern theory joins Darwin with genetics: mutation, selection and chance drive evolution.',
      ],
      points: [
        ['Элементарные факторы', 'Elementary factors', 'Мутации, популяционные волны, дрейф генов, изоляция, естественный отбор.', 'Mutation, population waves, genetic drift, isolation and natural selection.'],
        ['Формы отбора', 'Forms of selection', 'Движущий (сдвигает признак), стабилизирующий (сохраняет среднее), разрывающий (раскалывает на две группы).', 'Directional (shifts a trait), stabilising (keeps the average), disruptive (splits into two groups).'],
      ],
      sim: { moment: 'moment_gauss' },
    },
    {
      id: 'b11-adaptations',
      title: ['Адаптации. Видообразование', 'Adaptations. Speciation'],
      intro: [
        'Приспособления появляются в результате отбора, но они всегда относительны.',
        'Adaptations arise through selection, but they are always relative.',
      ],
      points: [
        ['Типы приспособлений', 'Kinds of adaptation', 'Покровительственная окраска, мимикрия (муха под осу), предупреждающая окраска.', 'Camouflage, mimicry (a fly looking like a wasp), warning colours.'],
        ['Относительность', 'Relativity', 'Белый заяц незаметен зимой, но виден, если снег сошёл раньше.', 'A white hare hides in winter but stands out if snow melts early.'],
        ['Видообразование', 'Speciation', 'Географическое (горы, реки разделяют популяции) и экологическое (разные места кормёжки).', 'Geographic (mountains or rivers split populations) and ecological (different feeding places).'],
      ],
    },
    {
      id: 'b11-evidence',
      title: ['Доказательства и направления эволюции', 'Evidence and paths of evolution'],
      intro: [
        'Эволюцию подтверждают окаменелости, анатомия, зародыши, география и ДНК.',
        'Fossils, anatomy, embryos, geography and DNA all confirm evolution.',
      ],
      points: [
        ['Микро- и макроэволюция', 'Micro- and macroevolution', 'Изменения внутри вида и появление крупных групп.', 'Change within species and the rise of major groups.'],
        ['Сравнительно-анатомические', 'Comparative anatomy', 'Гомологичные органы (рука и крыло), аналогичные (крыло бабочки и птицы), рудименты (аппендикс), атавизмы (хвост у человека).', 'Homologous organs (arm and wing), analogous ones (butterfly and bird wings), vestiges (appendix), atavisms (a human tail).'],
        ['Молекулярные', 'Molecular', 'Чем ближе родство, тем больше сходство ДНК: у человека и шимпанзе ~98%.', 'The closer the kinship, the more similar the DNA: humans and chimps share ~98%.'],
        ['Направления (Северцов)', 'Paths (Severtsov)', 'Ароморфоз (крупное усложнение), идиоадаптация (частное приспособление), общая дегенерация (упрощение у паразитов).', 'Aromorphosis (major advance), idioadaptation (specific adaptation), degeneration (simplification in parasites).'],
        ['Биологический прогресс и регресс', 'Progress and regress', 'Процветание вида или сокращение его численности и ареала.', 'A species thriving or shrinking in numbers and range.'],
      ],
    },
  ]),

  section(B, 11, 'origin', ['Происхождение и развитие жизни', 'Origin and history of life'], [
    {
      id: 'b11-origin-hypotheses',
      title: ['Гипотезы происхождения жизни', 'Theories of life’s origin'],
      intro: [
        'Как из неживого возникло живое — один из главных вопросов науки.',
        'How life arose from non-life is one of science’s great questions.',
      ],
      points: [
        ['Основные гипотезы', 'Main hypotheses', 'Креационизм, самозарождение (опровергнуто Пастером), панспермия, биохимическая эволюция.', 'Creationism, spontaneous generation (disproved by Pasteur), panspermia, biochemical evolution.'],
        ['Теория Опарина–Холдейна', 'Oparin–Haldane theory', 'В первичном океане из простых веществ образовались органические, затем коацерватные капли.', 'In the early ocean simple substances formed organic ones, then coacervate droplets.'],
        ['Опыт Миллера', 'Miller’s experiment', 'Искры в смеси газов дали аминокислоты — первое подтверждение теории.', 'Sparks in a gas mixture made amino acids, the first support for the theory.'],
      ],
    },
    {
      id: 'b11-cell-evolution',
      title: ['Эволюция клетки', 'Evolution of the cell'],
      intro: [
        'Первыми были прокариоты. Эукариоты появились, когда одни клетки поселились внутри других.',
        'Prokaryotes came first. Eukaryotes arose when some cells began living inside others.',
      ],
      points: [
        ['Прокариоты и эукариоты', 'Prokaryotes and eukaryotes', 'Бактерии ~3,5 млрд лет назад, эукариоты ~2 млрд.', 'Bacteria ~3.5 billion years ago, eukaryotes ~2 billion.'],
        ['Симбиотическая теория', 'Endosymbiosis', 'Митохондрии и хлоропласты — бывшие бактерии: у них своя ДНК и рибосомы.', 'Mitochondria and chloroplasts were once bacteria, with their own DNA and ribosomes.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b11-earth-history',
      title: ['История Земли', 'Earth’s history'],
      intro: [
        'Историю жизни делят на эры и периоды по окаменелостям в слоях горных пород.',
        'Life’s history is split into eras and periods by fossils in rock layers.',
      ],
      points: [
        ['Эры', 'Eras', 'Архей, протерозой (одноклеточные и первые многоклеточные), палеозой (рыбы, выход на сушу), мезозой (динозавры), кайнозой (млекопитающие, человек).', 'Archean, Proterozoic (single cells, first multicellular life), Palaeozoic (fish, life on land), Mesozoic (dinosaurs), Cenozoic (mammals, humans).'],
        ['Основные ароморфозы', 'Major advances', 'Фотосинтез, многоклеточность, позвоночник, семя, теплокровность.', 'Photosynthesis, multicellularity, the backbone, the seed, warm blood.'],
        ['Развитие растений и животных', 'Plants and animals', 'Растения: водоросли → мхи → папоротники → голосеменные → цветковые.', 'Plants: algae → mosses → ferns → gymnosperms → flowering plants.'],
      ],
    },
  ]),

  section(B, 11, 'anthropogenesis', ['Происхождение человека', 'Human evolution'], [
    {
      id: 'b11-human-place',
      title: ['Место человека в природе. Доказательства родства', 'Our place in nature. Evidence of kinship'],
      intro: [
        'Человек — примат, близкий родственник человекообразных обезьян.',
        'Humans are primates, close relatives of the great apes.',
      ],
      points: [
        ['Систематическое положение', 'Classification', 'Отряд приматы, семейство гоминиды, вид Homo sapiens.', 'Order primates, family hominids, species Homo sapiens.'],
        ['Доказательства', 'Evidence', 'Сходство строения, групп крови, ДНК, рудименты (копчик).', 'Shared anatomy, blood groups and DNA; vestiges like the tailbone.'],
      ],
    },
    {
      id: 'b11-human-stages',
      title: ['Движущие силы и этапы антропогенеза', 'Drivers and stages of human evolution'],
      intro: [
        'Эволюцию человека двигали и биологические факторы, и труд, речь, общество.',
        'Human evolution was driven by biology and also by work, speech and society.',
      ],
      points: [
        ['Факторы', 'Factors', 'Биологические (мутации, отбор) и социальные (труд, речь, жизнь в группе).', 'Biological (mutation, selection) and social (work, speech, group life).'],
        ['Этапы', 'Stages', 'Австралопитек → человек умелый → человек прямоходящий → неандерталец → кроманьонец.', 'Australopithecus → Homo habilis → Homo erectus → Neanderthal → Cro-Magnon.'],
        ['Расы и единство вида', 'Races and one species', 'Различия внешности — приспособления к климату; все люди — один вид.', 'Differences in appearance are climate adaptations; all people are one species.'],
      ],
    },
  ]),

  section(B, 11, 'ecology', ['Экология', 'Ecology'], [
    {
      id: 'b11-eco-factors',
      title: ['Экологические факторы', 'Ecological factors'],
      intro: [
        'Каждый вид лучше всего чувствует себя в своём оптимуме, а жизнь ограничивает тот фактор, которого меньше всего.',
        'Every species thrives at its optimum, and life is limited by whatever factor is scarcest.',
      ],
      points: [
        ['Абиотические, биотические, антропогенные', 'Abiotic, biotic, human', 'Неживая среда, другие организмы, деятельность человека.', 'Non-living surroundings, other organisms, human activity.'],
        ['Закон оптимума и Либиха', 'Optimum and Liebig’s law', 'Урожай ограничивает тот элемент питания, которого не хватает, даже если остальных в избытке.', 'Yield is limited by the scarcest nutrient, even if others are plentiful.'],
        ['Фотопериодизм и биоритмы', 'Photoperiodism and biorhythms', 'Длина дня управляет цветением и перелётами; у людей — суточные ритмы сна.', 'Day length controls flowering and migration; in people, the daily sleep rhythm.'],
      ],
    },
    {
      id: 'b11-populations',
      title: ['Популяция', 'Populations'],
      intro: [
        'У популяции есть свои характеристики: численность, плотность, структура, динамика.',
        'A population has its own features: size, density, structure and dynamics.',
      ],
      points: [
        ['Численность и плотность', 'Size and density', 'Сколько особей и на какой площади.', 'How many individuals and over what area.'],
        ['Возрастная и половая структура', 'Age and sex structure', 'Много молодых — популяция растёт, много старых — сокращается.', 'Many young means growth; many old means decline.'],
        ['Динамика', 'Dynamics', 'Колебания численности зайцев и рысей повторяются циклами.', 'Hare and lynx numbers rise and fall in cycles.'],
      ],
      sim: { moment: 'moment_gauss' },
    },
    {
      id: 'b11-biotic',
      title: ['Биотические отношения', 'Biotic relationships'],
      intro: [
        'Виды взаимодействуют: конкурируют, охотятся, паразитируют или помогают друг другу.',
        'Species interact: they compete, hunt, parasitise or help each other.',
      ],
      points: [
        ['Конкуренция', 'Competition', 'За пищу, свет, территорию.', 'For food, light, territory.'],
        ['Хищничество и паразитизм', 'Predation and parasitism', 'Хищник убивает жертву, паразит живёт за счёт хозяина долго.', 'A predator kills prey; a parasite lives off its host for a long time.'],
        ['Симбиоз', 'Symbiosis', 'Мутуализм (лишайник, клубеньковые бактерии), комменсализм (рыба-прилипала).', 'Mutualism (lichens, root-nodule bacteria), commensalism (remora fish).'],
      ],
    },
    {
      id: 'b11-ecosystem',
      title: ['Экосистема. Пищевые цепи', 'Ecosystems. Food webs'],
      intro: [
        'Экосистема держится на потоке энергии от Солнца и круговороте веществ.',
        'An ecosystem runs on energy flowing from the Sun and on cycling matter.',
      ],
      points: [
        ['Биогеоценоз', 'Biogeocoenosis', 'Сообщество плюс почва, вода, климат на однородном участке.', 'A community plus soil, water and climate on a uniform patch.'],
        ['Продуценты, консументы, редуценты', 'Producers, consumers, decomposers', 'Создают, потребляют и разлагают органику.', 'Make, eat and break down organic matter.'],
        ['Пастбищные и детритные цепи', 'Grazing and detrital chains', 'Начинаются с живых растений или с мёртвой органики.', 'Start from living plants or from dead matter.'],
        ['Правило 10%', 'The 10% rule', 'На следующий уровень переходит около 10% энергии — поэтому цепи короткие.', 'About 10% of energy passes to the next level, which keeps chains short.'],
      ],
    },
    {
      id: 'b11-stability',
      title: ['Устойчивость экосистем. Агроэкосистемы', 'Ecosystem stability. Farmland'],
      intro: [
        'Чем больше видов и связей, тем устойчивее экосистема.',
        'The more species and links, the more stable the ecosystem.',
      ],
      points: [
        ['Саморегуляция', 'Self-regulation', 'Численность хищников и жертв уравновешивает друг друга.', 'Predator and prey numbers keep each other in check.'],
        ['Сукцессии', 'Succession', 'Последовательная смена сообществ до устойчивого состояния.', 'Communities replace one another until a stable state is reached.'],
        ['Агроэкосистемы', 'Agroecosystems', 'Малое число видов, неустойчивы без человека, нужны удобрения.', 'Few species, unstable without people, needing fertiliser.'],
      ],
    },
  ]),

  section(B, 11, 'biosphere', ['Биосфера', 'The biosphere'], [
    {
      id: 'b11-vernadsky',
      title: ['Учение Вернадского', 'Vernadsky’s teaching'],
      intro: [
        'Биосфера — область, где существует жизнь: от глубин океана до высоты 20 км.',
        'The biosphere is wherever life exists, from the ocean deeps to 20 km up.',
      ],
      points: [
        ['Границы биосферы', 'Boundaries', 'Нижняя часть атмосферы, вся гидросфера, верхняя часть литосферы.', 'The lower atmosphere, the whole hydrosphere, the upper lithosphere.'],
        ['Виды вещества', 'Kinds of matter', 'Живое (организмы), косное (горы), биогенное (уголь, нефть), биокосное (почва).', 'Living (organisms), inert (rock), biogenic (coal, oil), bio-inert (soil).'],
        ['Функции живого вещества', 'Functions of living matter', 'Газовая, концентрационная, окислительно-восстановительная.', 'Gas exchange, concentration, oxidation–reduction.'],
      ],
    },
    {
      id: 'b11-cycles',
      title: ['Круговороты веществ', 'Biogeochemical cycles'],
      intro: [
        'Атомы вечны: один и тот же углерод побывал в динозавре, дереве и в тебе.',
        'Atoms are recycled forever: the same carbon has been in a dinosaur, a tree and you.',
      ],
      points: [
        ['Вода', 'Water', 'Испарение, облака, осадки, реки.', 'Evaporation, clouds, rain, rivers.'],
        ['Углерод и кислород', 'Carbon and oxygen', 'Фотосинтез и дыхание сменяют друг друга.', 'Photosynthesis and respiration balance each other.'],
        ['Азот', 'Nitrogen', 'Бактерии связывают азот воздуха и возвращают его обратно.', 'Bacteria fix nitrogen from the air and later release it back.'],
      ],
    },
    {
      id: 'b11-global-problems',
      title: ['Ноосфера. Глобальные проблемы. Охрана природы', 'The noosphere. Global problems. Conservation'],
      intro: [
        'Вернадский предсказал ноосферу — время, когда разум человека станет главной силой на Земле и должен будет её беречь.',
        'Vernadsky foresaw the noosphere, when human reason becomes Earth’s main force and must look after it.',
      ],
      points: [
        ['Глобальные проблемы', 'Global problems', 'Парниковый эффект, озоновые дыры, кислотные дожди, загрязнение, обезлесение, потеря биоразнообразия.', 'Greenhouse effect, ozone holes, acid rain, pollution, deforestation, biodiversity loss.'],
        ['Рациональное природопользование', 'Wise use of resources', 'Брать у природы столько, сколько она успевает восстановить.', 'Take only what nature can replace.'],
        ['Устойчивое развитие', 'Sustainable development', 'Удовлетворять потребности сегодня, не отнимая шанс у будущих поколений.', 'Meet today’s needs without robbing future generations.'],
      ],
    },
  ]),
];
