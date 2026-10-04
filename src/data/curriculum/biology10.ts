import { section } from './types';

const B = 'biology';

export const BIOLOGY_10 = [
  section(B, 10, 'intro', ['Введение', 'Introduction'], [
    {
      id: 'b10-biology-science',
      title: ['Биология как наука. Признаки живого', 'Biology as a science. Signs of life'],
      intro: [
        'Современная биология опирается на точные методы: от микроскопии до чтения геномов.',
        'Modern biology relies on precise methods, from microscopy to reading genomes.',
      ],
      points: [
        ['Методы биологии', 'Methods', 'Наблюдение, эксперимент, моделирование, генетический анализ.', 'Observation, experiment, modelling, genetic analysis.'],
        ['Признаки живого', 'Signs of life', 'Единство химического состава, обмен веществ, самовоспроизведение, раздражимость, развитие.', 'Shared chemistry, metabolism, self-reproduction, responsiveness, development.'],
        ['Уровни организации', 'Levels of organisation', 'От молекулы до биосферы — каждый уровень изучает свой раздел биологии.', 'From molecule to biosphere, each level has its own branch of biology.'],
      ],
    },
  ]),

  section(B, 10, 'chemistry', ['Химический состав клетки', 'Chemistry of the cell'], [
    {
      id: 'b10-inorganic',
      title: ['Неорганические вещества', 'Inorganic substances'],
      intro: [
        'В клетке более 80 химических элементов, но 98% массы дают всего четыре: O, C, H, N.',
        'A cell holds over 80 elements, but 98% of its mass is just four: O, C, H and N.',
      ],
      points: [
        ['Макро- и микроэлементы', 'Macro- and microelements', 'Макро: O, C, H, N, P, S, Ca, K. Микро: Fe, I, Zn, Cu — нужны в крошечных дозах.', 'Macro: O, C, H, N, P, S, Ca, K. Micro: Fe, I, Zn, Cu in tiny amounts.'],
        ['Вода', 'Water', 'Полярный растворитель, высокая теплоёмкость, участвует в реакциях.', 'A polar solvent with high heat capacity that takes part in reactions.'],
        ['Соли и буферность', 'Salts and buffering', 'Буферные системы удерживают pH клетки постоянным.', 'Buffers keep the cell’s pH steady.'],
      ],
    },
    {
      id: 'b10-carbs-lipids',
      title: ['Углеводы и липиды', 'Carbohydrates and lipids'],
      intro: [
        'Углеводы и липиды — энергия и строительный материал клетки.',
        'Carbohydrates and lipids are the cell’s energy and building material.',
      ],
      points: [
        ['Моно-, ди- и полисахариды', 'Mono-, di- and polysaccharides', 'Глюкоза и рибоза; сахароза и лактоза; крахмал, гликоген, целлюлоза, хитин.', 'Glucose and ribose; sucrose and lactose; starch, glycogen, cellulose, chitin.'],
        ['Жиры', 'Fats', 'Запас энергии и теплоизоляция.', 'Energy stores and insulation.'],
        ['Фосфолипиды и стероиды', 'Phospholipids and steroids', 'Фосфолипиды образуют мембраны, стероиды — гормоны и холестерин.', 'Phospholipids form membranes; steroids include hormones and cholesterol.'],
      ],
    },
    {
      id: 'b10-proteins',
      title: ['Белки', 'Proteins'],
      intro: [
        'Белки — полимеры из аминокислот. Их форма определяет функцию, а форма задаётся последовательностью.',
        'Proteins are amino-acid polymers. Shape sets function, and sequence sets shape.',
      ],
      points: [
        ['Аминокислоты и пептидная связь', 'Amino acids and peptide bonds', '20 видов аминокислот соединяются связью −CO−NH−.', '20 kinds of amino acid joined by −CO−NH− bonds.'],
        ['Четыре уровня структуры', 'Four levels of structure', 'Первичная, вторичная (α-спираль, β-слой), третичная (глобула), четвертичная (гемоглобин из 4 цепей).', 'Primary, secondary (α-helix, β-sheet), tertiary (globule), quaternary (haemoglobin’s four chains).'],
        ['Денатурация', 'Denaturation', 'Разрушение формы при нагреве или в кислоте; иногда обратима.', 'Loss of shape with heat or acid; sometimes reversible.'],
        ['Функции', 'Functions', 'Каталитическая, структурная, транспортная, защитная, двигательная, сигнальная, энергетическая.', 'Catalytic, structural, transport, defensive, motor, signalling, energy.'],
      ],
    },
    {
      id: 'b10-enzymes',
      title: ['Ферменты', 'Enzymes'],
      intro: [
        'Без ферментов реакции в клетке шли бы годами. Каждый фермент подходит к своему веществу, как ключ к замку.',
        'Without enzymes cell reactions would take years. Each enzyme fits its substrate like a key in a lock.',
      ],
      points: [
        ['Строение', 'Structure', 'Белок с активным центром; некоторым нужны витамины-коферменты.', 'A protein with an active site; some need vitamin coenzymes.'],
        ['Механизм действия', 'Mechanism', 'Фермент связывает субстрат и снижает энергию активации реакции.', 'The enzyme binds the substrate and lowers the activation energy.'],
        ['Специфичность', 'Specificity', 'Амилаза расщепляет крахмал, но не трогает белок.', 'Amylase breaks down starch but leaves protein alone.'],
      ],
    },
    {
      id: 'b10-nucleic',
      title: ['Нуклеиновые кислоты', 'Nucleic acids'],
      intro: [
        'ДНК — двойная спираль, где основания соединены строго попарно. Это позволяет точно копировать информацию.',
        'DNA is a double helix whose bases pair strictly, which allows information to be copied exactly.',
      ],
      points: [
        ['Нуклеотиды', 'Nucleotides', 'Азотистое основание + сахар + фосфат.', 'Base + sugar + phosphate.'],
        ['Комплементарность. Правило Чаргаффа', 'Complementarity. Chargaff’s rule', 'A = T, G = C: в любой ДНК аденина столько же, сколько тимина.', 'A = T, G = C: any DNA has as much adenine as thymine.'],
        ['Виды РНК', 'Kinds of RNA', 'иРНК — копия гена, тРНК — подвозит аминокислоты, рРНК — основа рибосом.', 'mRNA copies a gene, tRNA ferries amino acids, rRNA forms ribosomes.'],
      ],
      sim: { moment: 'moment_dna' },
    },
    {
      id: 'b10-atp',
      title: ['АТФ', 'ATP'],
      intro: [
        'АТФ — энергетическая «валюта» клетки. Отщепив один фосфат, клетка получает порцию энергии.',
        'ATP is the cell’s energy currency. Splitting off one phosphate releases a packet of energy.',
      ],
      points: [
        ['Строение', 'Structure', 'Аденин + рибоза + три остатка фосфорной кислоты.', 'Adenine + ribose + three phosphate groups.'],
        ['Макроэргические связи', 'High-energy bonds', 'Связи между фосфатами при разрыве дают ~40 кДж/моль.', 'Breaking the bonds between phosphates gives ~40 kJ/mol.'],
      ],
      formula: '\\mathrm{ATP} + \\mathrm{H_2O} \\to \\mathrm{ADP} + \\mathrm{P_i} + 40\\ \\text{кДж}',
      sim: { lab: 'biology_cell' },
    },
  ]),

  section(B, 10, 'cell', ['Строение клетки', 'Cell structure'], [
    {
      id: 'b10-cell-theory',
      title: ['Клеточная теория. Методы изучения клетки', 'Cell theory. Studying cells'],
      intro: [
        'Клеточная теория — одно из величайших обобщений биологии. Её подтвердили световой и электронный микроскопы.',
        'Cell theory is one of biology’s great generalisations, confirmed by light and electron microscopes.',
      ],
      points: [
        ['Шлейден, Шванн, Вирхов', 'Schleiden, Schwann, Virchow', 'Все организмы из клеток; клетка из клетки.', 'All organisms are cells; every cell comes from a cell.'],
        ['Современные положения', 'Modern principles', 'Клетка — единица строения, функций и развития; клетки сходны по составу.', 'The cell is the unit of structure, function and development; cells share their chemistry.'],
        ['Методы', 'Methods', 'Микроскопия, центрифугирование, меченые атомы.', 'Microscopy, centrifugation, isotope tracers.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b10-membrane',
      title: ['Клеточная мембрана. Транспорт', 'Cell membrane. Transport'],
      intro: [
        'Мембрана — подвижный слой липидов с плавающими в нём белками. Она решает, что войдёт в клетку.',
        'The membrane is a fluid lipid layer with floating proteins that decides what enters the cell.',
      ],
      points: [
        ['Жидкостно-мозаичная модель', 'Fluid mosaic model', 'Двойной слой фосфолипидов и белки, похожие на «мозаику».', 'A phospholipid bilayer with proteins set in it like a mosaic.'],
        ['Пассивный транспорт', 'Passive transport', 'Диффузия по градиенту концентрации, без затрат энергии.', 'Diffusion down a concentration gradient, using no energy.'],
        ['Активный транспорт', 'Active transport', 'Против градиента, с затратой АТФ: натрий-калиевый насос.', 'Against the gradient using ATP: the sodium–potassium pump.'],
        ['Эндо- и экзоцитоз', 'Endo- and exocytosis', 'Мембрана обволакивает частицы, втягивая или выбрасывая их.', 'The membrane wraps particles to take them in or push them out.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
    {
      id: 'b10-organelles',
      title: ['Органоиды клетки', 'Organelles'],
      intro: [
        'Клетка похожа на город: у каждого органоида своя профессия.',
        'A cell is like a city where each organelle has a profession.',
      ],
      points: [
        ['Цитоплазма и цитоскелет', 'Cytoplasm and cytoskeleton', 'Каркас из белковых трубочек и нитей держит форму и двигает органоиды.', 'A scaffold of protein tubes and filaments holds shape and moves organelles.'],
        ['Одномембранные', 'Single-membrane', 'ЭПС (синтез), комплекс Гольджи (упаковка), лизосомы (переваривание), вакуоли.', 'ER (synthesis), Golgi (packaging), lysosomes (digestion), vacuoles.'],
        ['Двумембранные', 'Double-membrane', 'Митохондрии (энергия) и пластиды (фотосинтез) — имеют свою ДНК.', 'Mitochondria (energy) and plastids (photosynthesis) have their own DNA.'],
        ['Немембранные', 'Non-membrane', 'Рибосомы, клеточный центр, реснички и жгутики.', 'Ribosomes, centrosome, cilia and flagella.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b10-nucleus-chromosomes',
      title: ['Ядро. Хромосомы', 'Nucleus. Chromosomes'],
      intro: [
        'Ядро — хранилище ДНК. Перед делением ДНК плотно упаковывается в хромосомы.',
        'The nucleus stores DNA, which packs tightly into chromosomes before division.',
      ],
      points: [
        ['Строение ядра', 'Nucleus', 'Ядерная оболочка с порами, ядрышко, хроматин.', 'A porous nuclear envelope, nucleolus and chromatin.'],
        ['Строение хромосомы', 'Chromosome structure', 'Две хроматиды, соединённые центромерой.', 'Two chromatids joined at a centromere.'],
        ['Кариотип', 'Karyotype', 'У человека 46 хромосом: диплоидный набор 2n в клетках тела, гаплоидный n = 23 в гаметах.', 'Humans have 46: a diploid set 2n in body cells, haploid n = 23 in gametes.'],
      ],
    },
    {
      id: 'b10-cell-types',
      title: ['Клетки разных организмов. Вирусы', 'Kinds of cells. Viruses'],
      intro: [
        'Клетки бывают безъядерными и ядерными, а вирусы вообще не являются клетками.',
        'Cells can lack a nucleus or have one, and viruses aren’t cells at all.',
      ],
      points: [
        ['Прокариоты и эукариоты', 'Prokaryotes and eukaryotes', 'У бактерий кольцевая ДНК в цитоплазме, у эукариот — ядро.', 'Bacteria have circular DNA in the cytoplasm; eukaryotes a nucleus.'],
        ['Растительная, животная, грибная', 'Plant, animal, fungal', 'Растения: целлюлоза, пластиды, большая вакуоль. Грибы: хитин, гликоген. Животные: без стенки.', 'Plants: cellulose, plastids, a big vacuole. Fungi: chitin, glycogen. Animals: no wall.'],
        ['Вирусы', 'Viruses', 'ДНК или РНК в белковой оболочке; размножаются только внутри клетки.', 'DNA or RNA in a protein coat, reproducing only inside cells.'],
        ['Бактериофаги', 'Bacteriophages', 'Вирусы бактерий, похожие на «посадочный модуль».', 'Viruses of bacteria that look like landing craft.'],
        ['Вирусные болезни', 'Viral diseases', 'ВИЧ, грипп, COVID-19. Защита — вакцинация и гигиена.', 'HIV, flu, COVID-19. Protection: vaccination and hygiene.'],
      ],
    },
  ]),

  section(B, 10, 'metabolism', ['Обмен веществ и энергии в клетке', 'Metabolism in the cell'], [
    {
      id: 'b10-metabolism',
      title: ['Метаболизм', 'Metabolism'],
      intro: [
        'Клетка одновременно строит сложные вещества и разрушает их. Эти процессы связаны через АТФ.',
        'A cell builds complex substances and breaks them down at once, the two linked through ATP.',
      ],
      points: [
        ['Ассимиляция', 'Anabolism', 'Синтез с затратой энергии: белки, полисахариды.', 'Synthesis that uses energy: proteins, polysaccharides.'],
        ['Диссимиляция', 'Catabolism', 'Распад с выделением энергии.', 'Breakdown that releases energy.'],
      ],
    },
    {
      id: 'b10-energy-metabolism',
      title: ['Энергетический обмен', 'Energy metabolism'],
      intro: [
        'Глюкоза окисляется в три этапа, и каждый даёт свою порцию АТФ.',
        'Glucose is oxidised in three stages, each yielding its own share of ATP.',
      ],
      points: [
        ['Подготовительный этап', 'Preparation', 'В пищеварительной системе полимеры распадаются на мономеры.', 'In digestion, polymers break into monomers.'],
        ['Гликолиз', 'Glycolysis', 'В цитоплазме без кислорода: глюкоза → 2 пирувата + 2 АТФ.', 'In the cytoplasm without oxygen: glucose → 2 pyruvate + 2 ATP.'],
        ['Кислородный этап', 'Aerobic stage', 'В митохондриях: цикл Кребса и дыхательная цепь дают ещё 36 АТФ.', 'In mitochondria: the Krebs cycle and respiratory chain yield another 36 ATP.'],
        ['Брожение', 'Fermentation', 'Без кислорода пируват превращается в молочную кислоту или спирт.', 'Without oxygen, pyruvate becomes lactic acid or alcohol.'],
      ],
      formula: '\\mathrm{C_6H_{12}O_6} + 6\\mathrm{O_2} \\to 6\\mathrm{CO_2} + 6\\mathrm{H_2O} + 38\\,\\mathrm{ATP}',
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b10-photosynthesis',
      title: ['Фотосинтез', 'Photosynthesis'],
      intro: [
        'Фотосинтез идёт в две фазы: световая ловит энергию, темновая строит из неё сахар.',
        'Photosynthesis has two stages: the light stage captures energy, the dark stage builds sugar with it.',
      ],
      points: [
        ['Световая фаза', 'Light stage', 'В тилакоидах: фотолиз воды, выделение O₂, синтез АТФ и НАДФ·Н.', 'In thylakoids: water is split, O₂ released, ATP and NADPH made.'],
        ['Темновая фаза', 'Dark stage', 'В строме: цикл Кальвина фиксирует CO₂ в глюкозу.', 'In the stroma: the Calvin cycle fixes CO₂ into glucose.'],
        ['Значение', 'Importance', 'Кислород в атмосфере, пища для всех, запасы угля и нефти.', 'Oxygen in the air, food for all, coal and oil reserves.'],
      ],
      sim: { moment: 'moment_photosynthesis' },
    },
    {
      id: 'b10-chemosynthesis',
      title: ['Хемосинтез', 'Chemosynthesis'],
      intro: [
        'Некоторые бактерии строят органику без света, используя энергию окисления неорганических веществ.',
        'Some bacteria build organic matter without light, using energy from oxidising inorganic substances.',
      ],
      points: [
        ['Хемосинтетики', 'Chemosynthesisers', 'Нитрифицирующие, серо- и железобактерии. Открыты Виноградским.', 'Nitrifying, sulfur and iron bacteria, discovered by Winogradsky.'],
      ],
    },
    {
      id: 'b10-protein-synthesis',
      title: ['Биосинтез белка', 'Protein synthesis'],
      intro: [
        'Генетический код — словарь, по которому тройки нуклеотидов переводятся в аминокислоты.',
        'The genetic code is the dictionary that translates nucleotide triplets into amino acids.',
      ],
      points: [
        ['Свойства кода', 'Properties of the code', 'Триплетный, однозначный, вырожденный, универсальный для всех организмов.', 'Triplet, unambiguous, redundant and universal across life.'],
        ['Транскрипция', 'Transcription', 'РНК-полимераза строит иРНК по одной цепи ДНК.', 'RNA polymerase builds mRNA from one DNA strand.'],
        ['Трансляция', 'Translation', 'Рибосома связывает аминокислоты в порядке кодонов.', 'The ribosome links amino acids in codon order.'],
        ['Регуляция транскрипции', 'Regulation', 'Гены включаются, когда нужен их белок, — поэтому клетки разных тканей различаются.', 'Genes switch on when their protein is needed, which is why tissues differ.'],
      ],
      sim: { moment: 'moment_dna' },
    },
    {
      id: 'b10-replication',
      title: ['Репликация ДНК', 'DNA replication'],
      intro: [
        'Перед делением клетка удваивает ДНК так, что каждая новая молекула содержит одну старую и одну новую цепь.',
        'Before dividing, a cell doubles its DNA so each new molecule has one old and one new strand.',
      ],
      points: [
        ['Полуконсервативность', 'Semiconservative', 'Каждая цепь служит матрицей для новой.', 'Each strand is a template for a new one.'],
        ['Ферменты', 'Enzymes', 'Хеликаза расплетает, ДНК-полимераза строит, лигаза сшивает фрагменты Оказаки.', 'Helicase unzips, DNA polymerase builds, ligase joins Okazaki fragments.'],
      ],
      sim: { moment: 'moment_dna' },
    },
  ]),

  section(B, 10, 'reproduction', ['Размножение и развитие организмов', 'Reproduction and development'], [
    {
      id: 'b10-cell-cycle',
      title: ['Жизненный цикл клетки. Митоз', 'The cell cycle. Mitosis'],
      intro: [
        'Большую часть жизни клетка готовится к делению, а само деление занимает около часа.',
        'A cell spends most of its life preparing to divide; division itself takes about an hour.',
      ],
      points: [
        ['Интерфаза', 'Interphase', 'Рост клетки и удвоение ДНК.', 'The cell grows and doubles its DNA.'],
        ['Фазы митоза', 'Phases of mitosis', 'Профаза, метафаза, анафаза, телофаза.', 'Prophase, metaphase, anaphase, telophase.'],
        ['Значение', 'Significance', 'Рост, регенерация, бесполое размножение; дочерние клетки генетически идентичны.', 'Growth, repair and asexual reproduction; daughter cells are genetically identical.'],
        ['Амитоз', 'Amitosis', 'Прямое деление ядра перетяжкой, без хромосом.', 'Direct division of the nucleus by pinching, without chromosomes.'],
      ],
    },
    {
      id: 'b10-asexual',
      title: ['Бесполое размножение', 'Asexual reproduction'],
      intro: [
        'Один родитель — много одинаковых потомков. Быстро, но без разнообразия.',
        'One parent, many identical offspring: fast but without variety.',
      ],
      points: [
        ['Способы', 'Ways', 'Деление (бактерии), почкование (гидра, дрожжи), спорообразование (грибы, мхи), вегетативное (растения).', 'Fission (bacteria), budding (hydra, yeast), spores (fungi, mosses), vegetative (plants).'],
        ['Клонирование', 'Cloning', 'Получение генетически идентичной копии; овечка Долли, 1996.', 'Making a genetically identical copy, like Dolly the sheep in 1996.'],
      ],
    },
    {
      id: 'b10-meiosis',
      title: ['Мейоз. Гаметогенез', 'Meiosis. Gametogenesis'],
      intro: [
        'Мейоз превращает одну диплоидную клетку в четыре гаплоидные, и каждая уникальна.',
        'Meiosis turns one diploid cell into four haploid ones, each unique.',
      ],
      points: [
        ['Фазы мейоза', 'Phases', 'Два деления подряд без удвоения ДНК между ними.', 'Two divisions in a row with no DNA copying between them.'],
        ['Кроссинговер', 'Crossing over', 'Гомологичные хромосомы обмениваются участками — источник разнообразия.', 'Homologous chromosomes swap segments, a source of variety.'],
        ['Сперматогенез и оогенез', 'Spermatogenesis and oogenesis', 'Из одной клетки — 4 сперматозоида или 1 яйцеклетка и 3 полярных тельца.', 'One cell gives 4 sperm, or 1 egg and 3 polar bodies.'],
      ],
    },
    {
      id: 'b10-fertilisation',
      title: ['Оплодотворение', 'Fertilisation'],
      intro: [
        'Слияние гамет восстанавливает диплоидный набор и объединяет гены двух родителей.',
        'Fusing gametes restores the diploid set and combines two parents’ genes.',
      ],
      points: [
        ['У животных', 'In animals', 'Наружное (рыбы, лягушки) и внутреннее (рептилии, птицы, млекопитающие).', 'External (fish, frogs) and internal (reptiles, birds, mammals).'],
        ['Двойное оплодотворение', 'Double fertilisation', 'У цветковых один спермий — с яйцеклеткой, второй — с центральной клеткой (эндосперм).', 'In flowering plants one sperm joins the egg, the other the central cell (endosperm).'],
        ['Партеногенез', 'Parthenogenesis', 'Развитие из неоплодотворённой яйцеклетки: тли, трутни пчёл.', 'Development from an unfertilised egg: aphids, drone bees.'],
      ],
    },
    {
      id: 'b10-ontogenesis',
      title: ['Онтогенез', 'Ontogeny'],
      intro: [
        'Из одной зиготы развивается организм с триллионами клеток разных типов.',
        'A single zygote develops into an organism with trillions of cells of many types.',
      ],
      points: [
        ['Эмбриогенез', 'Embryogenesis', 'Дробление → бластула → гаструла → органогенез.', 'Cleavage → blastula → gastrula → organogenesis.'],
        ['Зародышевые листки', 'Germ layers', 'Эктодерма (кожа, нервы), энтодерма (кишечник), мезодерма (мышцы, кости, кровь).', 'Ectoderm (skin, nerves), endoderm (gut), mesoderm (muscle, bone, blood).'],
        ['Постэмбриональное развитие', 'After the embryo', 'Прямое или непрямое (с метаморфозом).', 'Direct or indirect (with metamorphosis).'],
        ['Старение и влияние среды', 'Ageing and environment', 'Алкоголь, никотин и радиация нарушают развитие зародыша.', 'Alcohol, nicotine and radiation disrupt embryo development.'],
      ],
    },
  ]),

  section(B, 10, 'genetics', ['Основы генетики', 'Genetics'], [
    {
      id: 'b10-genetics-terms',
      title: ['Основные понятия генетики', 'Key terms'],
      intro: [
        'Генетика изучает наследственность и изменчивость. Её язык — гены, аллели, генотипы.',
        'Genetics studies heredity and variation, and its language is genes, alleles and genotypes.',
      ],
      points: [
        ['Ген, аллель', 'Gene, allele', 'Ген — участок ДНК, аллели — его варианты (жёлтый и зелёный цвет горошин).', 'A gene is a stretch of DNA; alleles are its versions (yellow or green peas).'],
        ['Генотип и фенотип', 'Genotype and phenotype', 'Генотип — набор генов, фенотип — видимые признаки.', 'Genotype is the set of genes; phenotype the visible traits.'],
        ['Гомо- и гетерозигота', 'Homo- and heterozygote', 'AA или aa — гомозигота, Aa — гетерозигота.', 'AA or aa is homozygous; Aa heterozygous.'],
        ['Доминантность и рецессивность', 'Dominant and recessive', 'Доминантный аллель проявляется и в гетерозиготе, рецессивный — только в паре aa.', 'A dominant allele shows even in Aa; a recessive one only in aa.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b10-mendel-laws',
      title: ['Законы Менделя', 'Mendel’s laws'],
      intro: [
        'Гибридологический метод Менделя: скрещивать чистые линии и считать потомков по признакам.',
        'Mendel’s method: cross pure lines and count the offspring by trait.',
      ],
      points: [
        ['Закон единообразия', 'Law of uniformity', 'AA × aa → все Aa.', 'AA × aa → all Aa.'],
        ['Закон расщепления', 'Law of segregation', 'Aa × Aa → 3:1 по фенотипу, 1:2:1 по генотипу.', 'Aa × Aa → 3:1 by phenotype, 1:2:1 by genotype.'],
        ['Неполное доминирование', 'Incomplete dominance', 'У ночной красавицы красный × белый = розовый.', 'In four-o’clocks red × white = pink.'],
        ['Анализирующее скрещивание', 'Test cross', 'Скрещивают с aa, чтобы узнать, AA или Aa у особи.', 'Cross with aa to tell whether an individual is AA or Aa.'],
        ['Дигибридное скрещивание', 'Dihybrid cross', 'Независимое наследование: 9:3:3:1.', 'Independent assortment: 9:3:3:1.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b10-morgan',
      title: ['Хромосомная теория. Генетика пола', 'Chromosome theory. Sex genetics'],
      intro: [
        'Морган на мушках-дрозофилах показал, что гены лежат в хромосомах линейно.',
        'Morgan used fruit flies to show genes lie in a line on chromosomes.',
      ],
      points: [
        ['Сцепленное наследование', 'Linkage', 'Гены одной хромосомы наследуются вместе.', 'Genes on one chromosome are inherited together.'],
        ['Кроссинговер и карты', 'Crossing over and maps', 'Чем дальше гены, тем чаще их разделяет кроссинговер — так строят генетические карты.', 'The farther apart genes are, the more often crossing over splits them, which lets us map them.'],
        ['Сцепленное с полом', 'Sex-linked traits', 'Гемофилия и дальтонизм — гены в X-хромосоме, поэтому чаще у мужчин.', 'Haemophilia and colour blindness sit on the X chromosome, so they’re commoner in men.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
    {
      id: 'b10-gene-interaction',
      title: ['Взаимодействие генов. Задачи', 'Gene interaction. Problems'],
      intro: [
        'Генотип — не набор отдельных генов, а система, где гены влияют друг на друга.',
        'The genotype isn’t a list of separate genes but a system where genes affect each other.',
      ],
      points: [
        ['Аллельные взаимодействия', 'Allelic', 'Полное и неполное доминирование, кодоминирование (группа крови AB).', 'Complete and incomplete dominance, codominance (blood group AB).'],
        ['Неаллельные', 'Non-allelic', 'Комплементарность, эпистаз, полимерия (цвет кожи).', 'Complementation, epistasis, polygenes (skin colour).'],
        ['Решение задач', 'Solving problems', 'Записать генотипы родителей, гаметы, решётку Пеннета, расщепление.', 'Write parent genotypes, gametes, a Punnett square and the ratios.'],
      ],
      sim: { moment: 'moment_mendel' },
    },
  ]),
];
