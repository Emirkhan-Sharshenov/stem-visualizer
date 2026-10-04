import { section } from './types';

const B = 'biology';

export const BIOLOGY_9 = [
  section(B, 9, 'intro', ['Введение в общую биологию', 'Introduction to general biology'], [
    {
      id: 'b9-levels',
      title: ['Уровни организации живого', 'Levels of organisation'],
      intro: [
        'Живое устроено как матрёшка: молекулы складываются в клетки, клетки — в организмы, организмы — в экосистемы и биосферу.',
        'Life nests like a set of dolls: molecules build cells, cells organisms, organisms ecosystems and the biosphere.',
      ],
      points: [
        ['Семь уровней', 'Seven levels', 'Молекулярный, клеточный, тканевый, организменный, популяционно-видовой, экосистемный, биосферный.', 'Molecular, cellular, tissue, organism, population-species, ecosystem, biosphere.'],
        ['Свойства живых систем', 'Properties of living systems', 'Обмен веществ, самовоспроизведение, наследственность, изменчивость, саморегуляция.', 'Metabolism, self-reproduction, heredity, variation, self-regulation.'],
      ],
    },
  ]),

  section(B, 9, 'molecular', ['Молекулярный уровень', 'The molecular level'], [
    {
      id: 'b9-inorganic',
      title: ['Неорганические вещества. Углеводы и липиды', 'Inorganic substances. Carbohydrates and lipids'],
      intro: [
        'Вода — растворитель и транспорт клетки. Углеводы и жиры — топливо и строительный материал.',
        'Water is the cell’s solvent and transport. Carbohydrates and fats are fuel and building material.',
      ],
      points: [
        ['Вода и соли', 'Water and salts', 'Вода — 70% массы клетки; соли поддерживают кислотность и работу нервов.', 'Water is 70% of a cell; salts keep pH steady and nerves working.'],
        ['Углеводы', 'Carbohydrates', 'Глюкоза — быстрая энергия, крахмал и гликоген — запас, целлюлоза — опора.', 'Glucose gives quick energy, starch and glycogen store it, cellulose gives support.'],
        ['Липиды', 'Lipids', 'Жиры дают вдвое больше энергии, чем углеводы; фосфолипиды строят мембраны.', 'Fats give twice the energy of carbohydrates; phospholipids build membranes.'],
      ],
    },
    {
      id: 'b9-proteins-enzymes',
      title: ['Белки и ферменты', 'Proteins and enzymes'],
      intro: [
        'Белки — главные «работники» клетки. Ферменты — белки, которые ускоряют реакции в миллионы раз.',
        'Proteins are the cell’s main workers. Enzymes are proteins that speed reactions up millions of times.',
      ],
      points: [
        ['Строение', 'Structure', 'Цепочка из 20 видов аминокислот, свёрнутая в точную форму.', 'A chain of 20 kinds of amino acids folded into a precise shape.'],
        ['Функции', 'Functions', 'Строительная, ферментативная, транспортная (гемоглобин), защитная (антитела), сигнальная.', 'Structural, catalytic, transport (haemoglobin), defensive (antibodies), signalling.'],
        ['Ферменты', 'Enzymes', 'Работают по принципу «ключ — замок»: каждый ускоряет свою реакцию.', 'Work like a lock and key: each speeds up its own reaction.'],
      ],
    },
    {
      id: 'b9-nucleic-atp',
      title: ['ДНК, РНК, АТФ', 'DNA, RNA, ATP'],
      intro: [
        'ДНК хранит инструкцию, РНК её копирует и выполняет, АТФ даёт энергию для всего.',
        'DNA stores the instructions, RNA copies and carries them out, ATP powers everything.',
      ],
      points: [
        ['ДНК', 'DNA', 'Двойная спираль, A–T и G–C.', 'A double helix of A–T and G–C pairs.'],
        ['РНК', 'RNA', 'Одна цепь, урацил вместо тимина.', 'A single strand with uracil instead of thymine.'],
        ['АТФ', 'ATP', 'Универсальная «батарейка»: энергия запасена в связях фосфатов.', 'The universal battery, storing energy in phosphate bonds.'],
      ],
      sim: { moment: 'moment_dna' },
    },
  ]),

  section(B, 9, 'cellular', ['Клеточный уровень', 'The cellular level'], [
    {
      id: 'b9-cell-theory',
      title: ['Клеточная теория. Органоиды', 'Cell theory. Organelles'],
      intro: [
        'Все организмы состоят из клеток, и каждая клетка происходит от клетки. Внутри — органоиды, у каждого своя работа.',
        'All organisms are made of cells, and every cell comes from a cell. Inside, each organelle has its job.',
      ],
      points: [
        ['Клеточная теория', 'Cell theory', 'Шлейден и Шванн (1839), Вирхов: «каждая клетка из клетки».', 'Schleiden and Schwann (1839); Virchow: “every cell from a cell”.'],
        ['Органоиды', 'Organelles', 'Мембрана, ЭПС, комплекс Гольджи, лизосомы, митохондрии, пластиды, рибосомы, ядро.', 'Membrane, ER, Golgi, lysosomes, mitochondria, plastids, ribosomes, nucleus.'],
        ['Прокариоты и эукариоты', 'Prokaryotes and eukaryotes', 'У бактерий нет ядра и мембранных органоидов, у растений, грибов и животных — есть.', 'Bacteria lack a nucleus and membrane organelles; plants, fungi and animals have them.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b9-metabolism',
      title: ['Обмен веществ в клетке', 'Cell metabolism'],
      intro: [
        'Растения запасают энергию света в сахаре, а все клетки потом извлекают её при дыхании.',
        'Plants store light energy in sugar, and every cell later releases it by respiration.',
      ],
      points: [
        ['Фотосинтез', 'Photosynthesis', 'Свет + CO₂ + H₂O → глюкоза + O₂ в хлоропластах.', 'Light + CO₂ + H₂O → glucose + O₂ in chloroplasts.'],
        ['Энергетический обмен', 'Energy metabolism', 'В митохондриях глюкоза окисляется до CO₂ и воды, давая 38 АТФ.', 'In mitochondria glucose is oxidised to CO₂ and water, yielding 38 ATP.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b9-protein-synthesis',
      title: ['Биосинтез белка', 'Protein synthesis'],
      intro: [
        'Ген в ДНК — рецепт белка. Сначала рецепт копируется в иРНК, потом рибосома собирает по нему белок.',
        'A gene in DNA is a protein recipe. It’s copied into mRNA, then a ribosome builds the protein from it.',
      ],
      points: [
        ['Транскрипция', 'Transcription', 'В ядре по участку ДНК собирается иРНК.', 'In the nucleus mRNA is built on a stretch of DNA.'],
        ['Трансляция', 'Translation', 'Рибосома читает иРНК тройками (кодонами), тРНК приносят аминокислоты.', 'A ribosome reads mRNA in triplets (codons) while tRNAs bring amino acids.'],
      ],
      sim: { moment: 'moment_dna' },
    },
    {
      id: 'b9-mitosis',
      title: ['Деление клетки. Митоз', 'Cell division. Mitosis'],
      intro: [
        'Митоз даёт две клетки с точно такими же хромосомами, как у материнской. Так мы растём и заживляем раны.',
        'Mitosis makes two cells with exactly the same chromosomes as the parent. That’s how we grow and heal.',
      ],
      points: [
        ['Фазы митоза', 'Phases', 'Профаза, метафаза (хромосомы по экватору), анафаза (расходятся), телофаза.', 'Prophase, metaphase (chromosomes line up), anaphase (they separate), telophase.'],
      ],
    },
  ]),

  section(B, 9, 'organism', ['Организменный уровень', 'The organism level'], [
    {
      id: 'b9-reproduction',
      title: ['Размножение. Мейоз', 'Reproduction. Meiosis'],
      intro: [
        'При половом размножении потомок получает половину генов от каждого родителя — и становится уникальным.',
        'In sexual reproduction offspring get half their genes from each parent, making them unique.',
      ],
      points: [
        ['Бесполое и половое', 'Asexual and sexual', 'Бесполое быстрое, но даёт копии; половое — разнообразие.', 'Asexual is fast but makes copies; sexual brings variety.'],
        ['Мейоз', 'Meiosis', 'Два деления подряд: число хромосом уменьшается вдвое, образуются гаметы.', 'Two divisions in a row halve the chromosome number, making gametes.'],
        ['Оплодотворение', 'Fertilisation', 'Слияние гамет восстанавливает двойной набор хромосом.', 'Fusing gametes restores the double chromosome set.'],
      ],
    },
    {
      id: 'b9-ontogenesis',
      title: ['Онтогенез', 'Individual development'],
      intro: [
        'Индивидуальное развитие — от зиготы до смерти организма.',
        'Individual development runs from the zygote to the organism’s death.',
      ],
      points: [
        ['Эмбриональное развитие', 'Embryonic', 'Дробление, бластула, гаструла, закладка органов.', 'Cleavage, blastula, gastrula, organ formation.'],
        ['Постэмбриональное', 'Post-embryonic', 'Прямое (как у человека) или с превращением (как у лягушки и бабочки).', 'Direct (as in humans) or with metamorphosis (frogs, butterflies).'],
      ],
    },
    {
      id: 'b9-mendel',
      title: ['Законы Менделя', 'Mendel’s laws'],
      intro: [
        'Мендель скрещивал горох и открыл, что признаки передаются «порциями» — генами.',
        'Mendel crossed peas and found that traits pass on in units: genes.',
      ],
      points: [
        ['Моногибридное скрещивание', 'Monohybrid cross', 'Первое поколение единообразно, во втором — расщепление 3:1.', 'The first generation is uniform; the second splits 3:1.'],
        ['Дигибридное скрещивание', 'Dihybrid cross', 'Два признака наследуются независимо: 9:3:3:1.', 'Two traits are inherited independently: 9:3:3:1.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b9-linkage-sex',
      title: ['Сцепленное наследование. Генетика пола', 'Linkage. Sex genetics'],
      intro: [
        'Гены на одной хромосоме передаются вместе. Пол определяется парой половых хромосом.',
        'Genes on one chromosome travel together. Sex is set by a pair of sex chromosomes.',
      ],
      points: [
        ['Сцепленные гены', 'Linked genes', 'Морган показал, что они наследуются вместе, пока их не разделит кроссинговер.', 'Morgan showed they’re inherited together unless crossing over separates them.'],
        ['Генетика пола', 'Sex determination', 'XX — женский пол, XY — мужской. Пол ребёнка определяет сперматозоид.', 'XX is female, XY male. The sperm decides the child’s sex.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b9-variation',
      title: ['Изменчивость. Селекция', 'Variation. Breeding'],
      intro: [
        'Организмы одного вида различаются. Человек использует это, выводя новые сорта и породы.',
        'Members of a species differ, and people use this to breed new varieties.',
      ],
      points: [
        ['Модификационная', 'Modification', 'Ненаследуемая: загар, мышцы от тренировок.', 'Not inherited: a tan, muscles from training.'],
        ['Мутационная', 'Mutational', 'Изменения генов или хромосом, передаются потомкам.', 'Changes in genes or chromosomes, passed on to offspring.'],
        ['Комбинативная', 'Combinative', 'Новые сочетания генов родителей.', 'New combinations of parental genes.'],
        ['Селекция', 'Breeding', 'Отбор и гибридизация; Вавилов собрал крупнейшую коллекцию семян.', 'Selection and hybridisation; Vavilov built the world’s largest seed collection.'],
      ],
      sim: { moment: 'moment_gauss' },
    },
  ]),

  section(B, 9, 'population', ['Популяционно-видовой уровень', 'Populations and species'], [
    {
      id: 'b9-species-population',
      title: ['Вид и популяция', 'Species and population'],
      intro: [
        'Вид — организмы, которые похожи и дают плодовитое потомство. Популяция — часть вида, живущая на одной территории.',
        'A species is organisms that resemble each other and have fertile young. A population is part of a species living in one area.',
      ],
      points: [
        ['Критерии вида', 'Species criteria', 'Морфологический, генетический, экологический, географический и другие.', 'Morphological, genetic, ecological, geographical and more.'],
        ['Популяция', 'Population', 'Элементарная единица эволюции.', 'The basic unit of evolution.'],
      ],
    },
    {
      id: 'b9-darwin',
      title: ['Эволюционное учение Дарвина', 'Darwin’s theory'],
      intro: [
        'Особей рождается больше, чем выживает. Выживают и оставляют потомство наиболее приспособленные.',
        'More individuals are born than survive. The best-adapted survive and reproduce.',
      ],
      points: [
        ['Движущие силы', 'Driving forces', 'Наследственная изменчивость, борьба за существование, естественный отбор.', 'Heritable variation, the struggle for existence, natural selection.'],
        ['Видообразование', 'Speciation', 'Изоляция популяций и отбор постепенно создают новые виды.', 'Isolation and selection gradually create new species.'],
      ],
      sim: { moment: 'moment_gauss' },
    },
    {
      id: 'b9-evolution-results',
      title: ['Результаты эволюции. Происхождение жизни и человека', 'Results of evolution. Origins'],
      intro: [
        'Эволюция объясняет и многообразие видов, и их приспособленность, и происхождение самого человека.',
        'Evolution explains the diversity of species, their adaptations and the origin of humans themselves.',
      ],
      points: [
        ['Макроэволюция', 'Macroevolution', 'Появление крупных групп: классов, типов.', 'The rise of large groups: classes, phyla.'],
        ['Доказательства эволюции', 'Evidence', 'Окаменелости, сходство зародышей, гомологичные органы, ДНК.', 'Fossils, similar embryos, homologous organs, DNA.'],
        ['Происхождение жизни', 'Origin of life', 'Около 3,8 млрд лет назад в океане появились первые клетки.', 'The first cells appeared in the ocean about 3.8 billion years ago.'],
        ['Происхождение человека', 'Human origins', 'Общий предок с шимпанзе жил около 6–7 млн лет назад.', 'Our common ancestor with chimps lived 6–7 million years ago.'],
      ],
    },
  ]),

  section(B, 9, 'ecosystem', ['Экосистемный уровень', 'The ecosystem level'], [
    {
      id: 'b9-factors-ecosystem',
      title: ['Экологические факторы. Экосистема', 'Ecological factors. Ecosystems'],
      intro: [
        'Экосистема — сообщество живых организмов вместе с неживой средой, связанные потоком энергии.',
        'An ecosystem is a community of organisms with their non-living surroundings, linked by energy flow.',
      ],
      points: [
        ['Факторы и их действие', 'Factors', 'Каждый вид живёт в своих границах выносливости.', 'Each species lives within its tolerance range.'],
        ['Биоценоз и экосистема', 'Community and ecosystem', 'Лес, озеро, луг — естественные экосистемы.', 'Forests, lakes and meadows are natural ecosystems.'],
      ],
    },
    {
      id: 'b9-food-chains',
      title: ['Цепи питания. Экологические пирамиды', 'Food chains. Ecological pyramids'],
      intro: [
        'На каждом шаге цепи питания теряется около 90% энергии, поэтому хищников всегда меньше, чем травоядных.',
        'About 90% of energy is lost at each step of a food chain, so there are always fewer predators than herbivores.',
      ],
      points: [
        ['Трофические уровни', 'Trophic levels', 'Продуценты → консументы I, II, III порядка → редуценты.', 'Producers → primary, secondary, tertiary consumers → decomposers.'],
        ['Экологические пирамиды', 'Pyramids', 'Пирамиды чисел, биомассы и энергии сужаются кверху.', 'Pyramids of number, biomass and energy narrow toward the top.'],
      ],
    },
    {
      id: 'b9-succession',
      title: ['Смена экосистем. Агроэкосистемы', 'Succession. Farm ecosystems'],
      intro: [
        'Экосистемы меняются со временем. Поля и сады — искусственные экосистемы, которые без человека не выживут.',
        'Ecosystems change over time. Fields and orchards are artificial ecosystems that can’t survive without people.',
      ],
      points: [
        ['Сукцессии', 'Succession', 'Заросший пруд превращается в болото, а затем в лес.', 'An overgrown pond becomes a bog, then a forest.'],
        ['Агроэкосистемы', 'Agroecosystems', 'Мало видов, нужны удобрения и защита от вредителей.', 'Few species; they need fertiliser and pest control.'],
      ],
    },
  ]),

  section(B, 9, 'biosphere', ['Биосферный уровень', 'The biosphere'], [
    {
      id: 'b9-biosphere',
      title: ['Биосфера. Круговорот веществ', 'The biosphere. Nutrient cycles'],
      intro: [
        'Биосфера — оболочка Земли, населённая живым. Вернадский показал, что жизнь — мощная геологическая сила.',
        'The biosphere is Earth’s living layer. Vernadsky showed that life is a powerful geological force.',
      ],
      points: [
        ['Учение Вернадского', 'Vernadsky’s teaching', 'Живое вещество изменяет атмосферу, создаёт почву и горные породы.', 'Living matter reshapes the atmosphere and creates soil and rock.'],
        ['Круговорот веществ', 'Cycles', 'Углерод, азот и вода непрерывно переходят между живым и неживым.', 'Carbon, nitrogen and water cycle endlessly between living and non-living.'],
      ],
    },
    {
      id: 'b9-human-impact',
      title: ['Антропогенное воздействие. Охрана природы', 'Human impact. Conservation'],
      intro: [
        'Человек стал главной силой, меняющей биосферу. Без охраны природы мы рискуем разрушить собственный дом.',
        'People have become the main force changing the biosphere. Without conservation we risk wrecking our own home.',
      ],
      points: [
        ['Воздействие человека', 'Human impact', 'Вырубка лесов, загрязнение, изменение климата, исчезновение видов.', 'Deforestation, pollution, climate change, species loss.'],
        ['Охрана природы', 'Conservation', 'Заповедники, переработка отходов, чистая энергия.', 'Reserves, recycling, clean energy.'],
      ],
    },
  ]),
];
