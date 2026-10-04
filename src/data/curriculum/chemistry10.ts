import { section } from './types';

const C = 'chemistry';

export const CHEMISTRY_10 = [
  section(C, 10, 'theory', ['Теоретические основы органической химии', 'Foundations of organic chemistry'], [
    {
      id: 'c10-subject',
      title: ['Предмет органической химии', 'What organic chemistry studies'],
      intro: [
        'Органическая химия изучает соединения углерода. Когда-то считали, что их создаёт только живое, пока Вёлер в 1828 году не синтезировал мочевину.',
        'Organic chemistry studies carbon compounds. They were thought to come only from living things until Wöhler made urea in 1828.',
      ],
      points: [
        ['Отличия от неорганических', 'How they differ', 'Обычно ковалентные связи, низкие температуры плавления, горючесть, сложное строение.', 'Usually covalent, low-melting, flammable and structurally complex.'],
      ],
    },
    {
      id: 'c10-butlerov',
      title: ['Теория строения Бутлерова. Изомерия', 'Butlerov’s theory. Isomerism'],
      intro: [
        'Атомы в молекуле соединены в определённом порядке, и от этого порядка зависят свойства. Поэтому одна формула может описывать разные вещества.',
        'Atoms in a molecule are joined in a set order that decides its properties, so one formula can describe different substances.',
      ],
      points: [
        ['Основные положения', 'Main ideas', 'Углерод четырёхвалентен; атомы влияют друг на друга; строение можно установить химически.', 'Carbon is tetravalent; atoms influence each other; structure can be determined chemically.'],
        ['Структурная изомерия', 'Structural isomers', 'Изомеры скелета (бутан и изобутан), положения (пропанол-1 и -2), межклассовые (этанол и диметиловый эфир).', 'Skeletal (butane, isobutane), positional (1- and 2-propanol), functional (ethanol vs dimethyl ether).'],
        ['Пространственная изомерия', 'Stereoisomers', 'Цис- и транс-изомеры отличаются расположением групп относительно двойной связи.', 'Cis and trans isomers differ in how groups sit around a double bond.'],
      ],
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'c10-carbon-hybrid',
      title: ['Строение атома углерода. Гибридизация', 'The carbon atom. Hybridisation'],
      intro: [
        'Углерод смешивает свои орбитали, чтобы образовать одинаковые связи. Тип смешивания задаёт форму молекулы.',
        'Carbon mixes its orbitals to make identical bonds. The kind of mixing sets the molecule’s shape.',
      ],
      points: [
        ['sp³', 'sp³', 'Тетраэдр, угол 109,5°: метан и все алканы.', 'A tetrahedron at 109.5°: methane and all alkanes.'],
        ['sp²', 'sp²', 'Плоский треугольник, 120°: этилен, бензол.', 'A flat triangle at 120°: ethylene, benzene.'],
        ['sp', 'sp', 'Линия, 180°: ацетилен.', 'A straight line at 180°: acetylene.'],
        ['σ- и π-связи', 'σ and π bonds', 'σ — перекрывание по оси, прочная; π — боковое, слабее, легко рвётся при присоединении.', 'σ overlaps end-on and is strong; π overlaps sideways, is weaker and breaks easily in addition.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c10-classification',
      title: ['Классификация и номенклатура', 'Classification and naming'],
      intro: [
        'Органические вещества сортируют по скелету и по функциональным группам, а называют по правилам ИЮПАК.',
        'Organic compounds are sorted by skeleton and functional group and named by IUPAC rules.',
      ],
      points: [
        ['По строению скелета', 'By skeleton', 'Ациклические (цепи) и циклические (кольца), в том числе ароматические.', 'Acyclic (chains) and cyclic (rings), including aromatic.'],
        ['Функциональные группы', 'Functional groups', '−OH (спирты), −CHO (альдегиды), −COOH (кислоты), −NH₂ (амины).', '−OH (alcohols), −CHO (aldehydes), −COOH (acids), −NH₂ (amines).'],
        ['Номенклатура ИЮПАК', 'IUPAC naming', 'Находим главную цепь, нумеруем от ближайшего заместителя, добавляем суффикс класса: 2-метилбутан.', 'Find the main chain, number from the nearest substituent, add the class ending: 2-methylbutane.'],
      ],
    },
    {
      id: 'c10-reaction-types',
      title: ['Типы реакций в органике', 'Types of organic reactions'],
      intro: [
        'Органические реакции описывают по тому, что происходит с молекулой, и по тому, как рвутся связи.',
        'Organic reactions are described by what happens to the molecule and how bonds break.',
      ],
      points: [
        ['Замещение, присоединение, отщепление, изомеризация', 'Substitution, addition, elimination, isomerisation', 'Атом заменяется, присоединяется к кратной связи, отщепляется или молекула перестраивается.', 'An atom is swapped, added across a multiple bond, removed, or the molecule rearranges.'],
        ['Радикальный механизм', 'Radical mechanism', 'Связь рвётся пополам, образуя частицы с неспаренным электроном (хлорирование метана на свету).', 'A bond splits evenly into species with unpaired electrons, as in chlorinating methane in light.'],
        ['Ионный механизм', 'Ionic mechanism', 'Пара электронов уходит к одному атому, образуя ионы.', 'The electron pair goes to one atom, forming ions.'],
      ],
    },
  ]),

  section(C, 10, 'hydrocarbons', ['Углеводороды', 'Hydrocarbons'], [
    {
      id: 'c10-alkanes',
      title: ['Алканы', 'Alkanes'],
      intro: [
        'Алканы — насыщенные углеводороды CₙH₂ₙ₊₂ с одинарными связями. Это природный газ, бензин, парафин.',
        'Alkanes are saturated hydrocarbons CₙH₂ₙ₊₂ with single bonds: natural gas, petrol, paraffin wax.',
      ],
      points: [
        ['Гомологический ряд и изомерия', 'Homologous series and isomers', 'Метан, этан, пропан, бутан… Каждый следующий длиннее на CH₂.', 'Methane, ethane, propane, butane…, each one CH₂ longer.'],
        ['Физические свойства', 'Physical properties', 'C₁–C₄ — газы, C₅–C₁₅ — жидкости, дальше — твёрдые.', 'C₁–C₄ are gases, C₅–C₁₅ liquids, the rest solids.'],
        ['Галогенирование', 'Halogenation', 'Цепная реакция на свету: CH₄ + Cl₂ → CH₃Cl + HCl.', 'A chain reaction in light: CH₄ + Cl₂ → CH₃Cl + HCl.'],
        ['Горение, крекинг, изомеризация, дегидрирование', 'Combustion, cracking, isomerisation, dehydrogenation', 'Крекинг разрывает длинные молекулы на короткие — так из мазута получают бензин.', 'Cracking splits long molecules into short ones, turning heavy oil into petrol.'],
        ['Реакция Вюрца', 'Wurtz reaction', '2CH₃Cl + 2Na → C₂H₆ + 2NaCl — удлинение цепи.', '2CH₃Cl + 2Na → C₂H₆ + 2NaCl, lengthening the chain.'],
      ],
      formula: '\\mathrm{C_nH_{2n+2}}',
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c10-cycloalkanes',
      title: ['Циклоалканы', 'Cycloalkanes'],
      intro: [
        'Атомы углерода замкнуты в кольцо. Маленькие кольца напряжены и легко раскрываются, циклогексан устойчив.',
        'Carbon atoms close into a ring. Small rings are strained and open easily; cyclohexane is stable.',
      ],
      points: [
        ['Строение и свойства', 'Structure and properties', 'CₙH₂ₙ. Циклопропан присоединяет водород с раскрытием кольца.', 'CₙH₂ₙ. Cyclopropane adds hydrogen as its ring opens.'],
      ],
    },
    {
      id: 'c10-alkenes',
      title: ['Алкены', 'Alkenes'],
      intro: [
        'Алкены CₙH₂ₙ содержат двойную связь. π-связь легко рвётся, поэтому алкены активно присоединяют другие вещества.',
        'Alkenes CₙH₂ₙ have a double bond. The π bond breaks easily, so alkenes readily add other substances.',
      ],
      points: [
        ['Строение и изомерия', 'Structure and isomerism', 'sp²-гибридизация, плоское строение у двойной связи, цис-транс-изомерия.', 'sp² carbons, flat at the double bond, cis–trans isomerism.'],
        ['Правило Марковникова', 'Markovnikov’s rule', 'Водород присоединяется к более гидрированному атому углерода двойной связи.', 'Hydrogen adds to the double-bond carbon that already has more hydrogens.'],
        ['Реакция Вагнера', 'Wagner reaction', 'Окисление перманганатом даёт двухатомный спирт, фиолетовый раствор обесцвечивается.', 'Oxidation by permanganate gives a diol and decolourises the purple solution.'],
        ['Полимеризация', 'Polymerisation', 'Этилен → полиэтилен.', 'Ethylene → polyethylene.'],
        ['Качественные реакции', 'Tests', 'Обесцвечивание бромной воды и раствора KMnO₄.', 'Decolourising bromine water and KMnO₄ solution.'],
      ],
      formula: '\\mathrm{CH_2{=}CH_2} + \\mathrm{Br_2} \\to \\mathrm{CH_2Br{-}CH_2Br}',
    },
    {
      id: 'c10-dienes',
      title: ['Алкадиены. Каучук', 'Dienes. Rubber'],
      intro: [
        'Алкадиены имеют две двойные связи. Из них получают каучук, а из каучука — резину.',
        'Dienes have two double bonds. They make rubber, and rubber makes tyres.',
      ],
      points: [
        ['Сопряжённые диены', 'Conjugated dienes', 'Бутадиен-1,3: двойные связи через одну.', '1,3-butadiene: double bonds alternate with single ones.'],
        ['Натуральный и синтетический каучук', 'Natural and synthetic rubber', 'Натуральный — сок гевеи; синтетический впервые получил Лебедев из бутадиена.', 'Natural rubber is hevea sap; Lebedev first made synthetic rubber from butadiene.'],
        ['Вулканизация', 'Vulcanisation', 'Нагрев с серой сшивает цепи — каучук становится прочной резиной.', 'Heating with sulfur cross-links chains, turning rubber tough.'],
      ],
    },
    {
      id: 'c10-alkynes',
      title: ['Алкины', 'Alkynes'],
      intro: [
        'Алкины CₙH₂ₙ₋₂ содержат тройную связь. Ацетилен горит так жарко, что им режут металл.',
        'Alkynes CₙH₂ₙ₋₂ have a triple bond. Acetylene burns hot enough to cut metal.',
      ],
      points: [
        ['Присоединение', 'Addition', 'Присоединяют водород, галогены, воду в две ступени.', 'They add hydrogen, halogens and water in two steps.'],
        ['Реакция Кучерова', 'Kucherov reaction', 'Ацетилен + вода (соли ртути) → уксусный альдегид.', 'Acetylene + water (mercury salts) → acetaldehyde.'],
        ['Тримеризация', 'Trimerisation', 'Три молекулы ацетилена → бензол.', 'Three acetylenes → benzene.'],
        ['Кислотные свойства', 'Acidity', 'Водород у тройной связи замещается металлом: ацетилениды.', 'The hydrogen on a triple-bond carbon can be replaced by a metal, forming acetylides.'],
      ],
      formula: '3\\mathrm{C_2H_2} \\to \\mathrm{C_6H_6}',
    },
    {
      id: 'c10-arenes',
      title: ['Арены. Бензол', 'Arenes. Benzene'],
      intro: [
        'Бензол — плоское кольцо из шести атомов углерода с единым облаком из шести π-электронов. Поэтому он устойчив и предпочитает замещение.',
        'Benzene is a flat ring of six carbons sharing one cloud of six π electrons, so it’s stable and prefers substitution.',
      ],
      points: [
        ['Ароматичность', 'Aromaticity', 'Все связи в кольце одинаковые — не чередуются, как казалось Кекуле.', 'All ring bonds are identical, not alternating as Kekulé thought.'],
        ['Замещение', 'Substitution', 'Нитрование и галогенирование с катализатором: кольцо сохраняется.', 'Nitration and halogenation with a catalyst keep the ring intact.'],
        ['Присоединение', 'Addition', 'Идёт трудно: гидрирование до циклогексана при нагреве и давлении.', 'Hard to do: hydrogenating to cyclohexane needs heat and pressure.'],
        ['Толуол и ориентанты', 'Toluene and directing groups', 'Метильная группа направляет замещение в орто- и пара-положения.', 'A methyl group directs substitution to the ortho and para positions.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c10-oil-gas',
      title: ['Природные источники углеводородов', 'Natural sources of hydrocarbons'],
      intro: [
        'Природный газ, нефть и уголь — главные источники топлива и сырья для химической промышленности.',
        'Natural gas, oil and coal are the main sources of fuel and raw materials for industry.',
      ],
      points: [
        ['Природный и попутный газ', 'Natural and associated gas', 'В основном метан; попутный газ богаче пропаном и бутаном.', 'Mostly methane; associated gas is richer in propane and butane.'],
        ['Нефть и перегонка', 'Oil and distillation', 'Нефть разгоняют на фракции по температурам кипения: бензин, керосин, дизель, мазут.', 'Oil is split by boiling point into petrol, kerosene, diesel and fuel oil.'],
        ['Крекинг и риформинг', 'Cracking and reforming', 'Крекинг увеличивает выход бензина, риформинг повышает октановое число.', 'Cracking raises petrol yield; reforming raises octane number.'],
        ['Каменный уголь', 'Coal', 'Коксование даёт кокс для металлургии, каменноугольную смолу и газ.', 'Coking yields coke for steelmaking, coal tar and gas.'],
      ],
    },
  ]),

  section(C, 10, 'oxygen-organic', ['Кислородсодержащие соединения', 'Oxygen-containing compounds'], [
    {
      id: 'c10-alcohols',
      title: ['Спирты', 'Alcohols'],
      intro: [
        'Спирты содержат группу −OH. Между их молекулами возникают водородные связи, поэтому даже метанол — жидкость.',
        'Alcohols contain −OH. Hydrogen bonds between molecules make even methanol a liquid.',
      ],
      points: [
        ['Классификация и номенклатура', 'Types and naming', 'Одно- и многоатомные; суффикс -ол: этанол, пропанол-2.', 'Mono- and polyhydric; suffix -ol: ethanol, propan-2-ol.'],
        ['Свойства одноатомных', 'Monohydric reactions', 'С натрием выделяют водород, с HX дают галогеналканы, при дегидратации — алкены, при окислении — альдегиды.', 'With sodium they release hydrogen, with HX give haloalkanes, dehydrate to alkenes, oxidise to aldehydes.'],
        ['Многоатомные', 'Polyhydric', 'Этиленгликоль (антифриз), глицерин. Качественная реакция: с Cu(OH)₂ ярко-синий раствор.', 'Ethylene glycol (antifreeze), glycerol. Test: deep blue with Cu(OH)₂.'],
        ['Влияние на организм', 'Effects on the body', 'Метанол слепит и убивает даже в малых дозах, этанол разрушает печень и мозг.', 'Methanol blinds and kills in small doses; ethanol damages liver and brain.'],
      ],
      formula: '\\mathrm{C_2H_5OH}',
    },
    {
      id: 'c10-phenol',
      title: ['Фенол', 'Phenol'],
      intro: [
        'Фенол — группа −OH прямо на бензольном кольце. Кольцо и группа усиливают друг друга.',
        'Phenol is −OH attached straight to a benzene ring; ring and group strengthen each other.',
      ],
      points: [
        ['Кислотные свойства', 'Acidity', 'Сильнее спиртов: реагирует даже со щёлочью.', 'More acidic than alcohols: it even reacts with alkali.'],
        ['Реакции кольца', 'Ring reactions', 'С бромной водой мгновенно даёт белый осадок трибромфенола.', 'With bromine water it instantly gives white tribromophenol.'],
        ['Качественная реакция', 'Test', 'С FeCl₃ — фиолетовое окрашивание.', 'Turns violet with FeCl₃.'],
      ],
    },
    {
      id: 'c10-aldehydes',
      title: ['Альдегиды и кетоны', 'Aldehydes and ketones'],
      intro: [
        'Карбонильная группа C=O на конце цепи даёт альдегид, в середине — кетон.',
        'A C=O group at the chain’s end makes an aldehyde; in the middle, a ketone.',
      ],
      points: [
        ['Серебряное зеркало', 'Silver mirror', 'Альдегид восстанавливает серебро из аммиачного раствора — на стекле появляется зеркало.', 'An aldehyde reduces silver from ammoniacal solution, coating the glass in a mirror.'],
        ['Реакция с Cu(OH)₂', 'With Cu(OH)₂', 'При нагреве голубой осадок становится кирпично-красным Cu₂O.', 'When heated the blue precipitate turns brick-red Cu₂O.'],
        ['Восстановление', 'Reduction', 'Водородом до спиртов.', 'Hydrogen reduces them to alcohols.'],
        ['Формальдегид, ацетальдегид, ацетон', 'Formaldehyde, acetaldehyde, acetone', 'Формалин консервирует, ацетон — растворитель.', 'Formalin preserves; acetone is a solvent.'],
      ],
    },
    {
      id: 'c10-carboxylic',
      title: ['Карбоновые кислоты', 'Carboxylic acids'],
      intro: [
        'Группа −COOH отдаёт протон, поэтому вещество — кислота, хоть и слабая.',
        'The −COOH group gives up a proton, making the substance an acid, though a weak one.',
      ],
      points: [
        ['Номенклатура', 'Naming', 'Метановая (муравьиная), этановая (уксусная), высшие — пальмитиновая, стеариновая.', 'Methanoic (formic), ethanoic (acetic), and higher ones like palmitic and stearic.'],
        ['Кислотные свойства', 'Acidic reactions', 'Реагируют с металлами, оксидами, основаниями и карбонатами.', 'React with metals, oxides, bases and carbonates.'],
        ['Этерификация', 'Esterification', 'Кислота + спирт ⇄ сложный эфир + вода.', 'Acid + alcohol ⇄ ester + water.'],
      ],
      formula: '\\mathrm{CH_3COOH} + \\mathrm{C_2H_5OH} \\rightleftharpoons \\mathrm{CH_3COOC_2H_5} + \\mathrm{H_2O}',
    },
    {
      id: 'c10-esters-fats',
      title: ['Сложные эфиры и жиры', 'Esters and fats'],
      intro: [
        'Сложные эфиры пахнут фруктами, а жиры — это эфиры глицерина и высших кислот.',
        'Esters smell of fruit; fats are esters of glycerol and fatty acids.',
      ],
      points: [
        ['Гидролиз', 'Hydrolysis', 'Эфир с водой распадается обратно на кислоту и спирт.', 'Water splits an ester back into acid and alcohol.'],
        ['Омыление', 'Saponification', 'Жир + щёлочь → глицерин + мыло.', 'Fat + alkali → glycerol + soap.'],
        ['Гидрирование', 'Hydrogenation', 'Жидкое масло с водородом становится твёрдым маргарином.', 'Liquid oil plus hydrogen becomes solid margarine.'],
        ['Мыла и СМС', 'Soaps and detergents', 'Молекула мыла одним концом цепляет жир, другим — воду и уносит грязь.', 'A soap molecule grabs grease at one end and water at the other, carrying dirt away.'],
      ],
    },
    {
      id: 'c10-carbohydrates',
      title: ['Углеводы', 'Carbohydrates'],
      intro: [
        'Углеводы — основной источник энергии живого. От сладкой глюкозы до прочной целлюлозы.',
        'Carbohydrates are life’s main energy source, from sweet glucose to tough cellulose.',
      ],
      points: [
        ['Классификация', 'Types', 'Моносахариды (глюкоза, фруктоза), дисахариды (сахароза), полисахариды (крахмал, целлюлоза).', 'Monosaccharides (glucose, fructose), disaccharides (sucrose), polysaccharides (starch, cellulose).'],
        ['Глюкоза', 'Glucose', 'Одновременно альдегид и многоатомный спирт: даёт серебряное зеркало и синий раствор с Cu(OH)₂. При брожении — спирт.', 'Both aldehyde and polyol: gives a silver mirror and blue Cu(OH)₂. Fermentation gives alcohol.'],
        ['Крахмал и целлюлоза', 'Starch and cellulose', 'Обе — цепи из глюкозы, но связанные по-разному. Гидролиз даёт глюкозу.', 'Both are glucose chains, linked differently; hydrolysis gives glucose.'],
        ['Качественная реакция на крахмал', 'Starch test', 'Йод окрашивает крахмал в синий цвет.', 'Iodine turns starch blue.'],
      ],
      formula: '\\mathrm{C_6H_{12}O_6}',
      sim: { moment: 'moment_photosynthesis' },
    },
  ]),

  section(C, 10, 'nitrogen-organic', ['Азотсодержащие соединения', 'Nitrogen-containing compounds'], [
    {
      id: 'c10-amines',
      title: ['Амины. Анилин', 'Amines. Aniline'],
      intro: [
        'Амины — производные аммиака, где водород заменён углеводородными группами. Это органические основания.',
        'Amines are ammonia with hydrogens replaced by hydrocarbon groups: organic bases.',
      ],
      points: [
        ['Основные свойства', 'Basicity', 'Присоединяют протон, как аммиак, и образуют соли с кислотами.', 'Like ammonia they take a proton and form salts with acids.'],
        ['Анилин и реакция Зинина', 'Aniline and the Zinin reaction', 'Нитробензол восстанавливают до анилина — основы красителей.', 'Nitrobenzene is reduced to aniline, the basis of dyes.'],
      ],
    },
    {
      id: 'c10-amino-acids',
      title: ['Аминокислоты', 'Amino acids'],
      intro: [
        'В одной молекуле — кислотная группа −COOH и основная −NH₂. Из 20 аминокислот построены все белки.',
        'Each molecule holds an acidic −COOH and a basic −NH₂. All proteins are built from 20 amino acids.',
      ],
      points: [
        ['Амфотерность', 'Amphoterism', 'Реагируют и с кислотами, и со щелочами.', 'React with both acids and alkalis.'],
        ['Пептидная связь', 'Peptide bond', '−CO−NH− соединяет аминокислоты в цепь с выделением воды.', '−CO−NH− links amino acids into a chain, releasing water.'],
      ],
    },
    {
      id: 'c10-proteins',
      title: ['Белки', 'Proteins'],
      intro: [
        'Белок — длинная цепь аминокислот, свёрнутая в точную форму. От формы зависит, что белок умеет.',
        'A protein is a long amino-acid chain folded into a precise shape, and its shape decides what it does.',
      ],
      points: [
        ['Уровни структуры', 'Levels of structure', 'Первичная (порядок), вторичная (спираль, складки), третичная (клубок), четвертичная (несколько цепей).', 'Primary (sequence), secondary (helix, sheet), tertiary (fold), quaternary (several chains).'],
        ['Денатурация и гидролиз', 'Denaturation and hydrolysis', 'При нагреве форма разрушается (варёное яйцо); гидролиз разбирает белок на аминокислоты.', 'Heat destroys the shape (a boiled egg); hydrolysis breaks it into amino acids.'],
        ['Цветные реакции', 'Colour tests', 'Биуретовая — фиолетовая, ксантопротеиновая — жёлтая.', 'Biuret test turns violet; xanthoproteic yellow.'],
      ],
    },
    {
      id: 'c10-nucleic',
      title: ['Нуклеиновые кислоты', 'Nucleic acids'],
      intro: [
        'ДНК хранит наследственную информацию, РНК переносит её и строит белки. Обе — цепи из нуклеотидов.',
        'DNA stores hereditary information; RNA carries it and builds proteins. Both are chains of nucleotides.',
      ],
      points: [
        ['Строение', 'Structure', 'Нуклеотид = сахар + фосфат + азотистое основание.', 'A nucleotide is sugar + phosphate + nitrogenous base.'],
        ['ДНК и РНК', 'DNA and RNA', 'ДНК — двойная спираль с дезоксирибозой; РНК — одна цепь с рибозой и урацилом вместо тимина.', 'DNA is a double helix with deoxyribose; RNA a single strand with ribose and uracil instead of thymine.'],
      ],
      sim: { moment: 'moment_dna' },
    },
  ]),

  section(C, 10, 'polymers', ['Полимеры', 'Polymers'], [
    {
      id: 'c10-polymer-basics',
      title: ['Основные понятия. Получение полимеров', 'Polymer basics and synthesis'],
      intro: [
        'Полимер — гигантская молекула из тысяч повторяющихся звеньев. Их получают двумя способами.',
        'A polymer is a giant molecule of thousands of repeating units, made in two ways.',
      ],
      points: [
        ['Мономер и структурное звено', 'Monomer and repeat unit', 'Мономер — исходная молекула, звено — повторяющийся кусок, степень полимеризации — число звеньев.', 'The monomer is the starting molecule, the repeat unit the recurring piece, the degree of polymerisation the count.'],
        ['Полимеризация', 'Addition polymerisation', 'Мономеры сцепляются за счёт раскрытия двойных связей: этилен → полиэтилен.', 'Monomers join by opening double bonds: ethylene → polyethylene.'],
        ['Поликонденсация', 'Condensation polymerisation', 'Мономеры соединяются с выделением малых молекул (воды): капрон, лавсан.', 'Monomers join releasing small molecules (water): nylon, polyester.'],
      ],
      formula: 'n\\,\\mathrm{CH_2{=}CH_2} \\to (\\mathrm{-CH_2-CH_2-})_n',
    },
    {
      id: 'c10-plastics',
      title: ['Пластмассы, волокна, каучуки', 'Plastics, fibres and rubbers'],
      intro: [
        'Из полимеров делают почти всё: упаковку, одежду, шины, трубы.',
        'Polymers make almost everything: packaging, clothes, tyres, pipes.',
      ],
      points: [
        ['Термопласты и реактопласты', 'Thermoplastics and thermosets', 'Термопласты плавятся и перерабатываются, реактопласты при нагреве не размягчаются.', 'Thermoplastics melt and can be recycled; thermosets don’t soften when heated.'],
        ['Полиэтилен, полипропилен, ПВХ, полистирол', 'PE, PP, PVC, PS', 'Пакеты, контейнеры, трубы и окна, одноразовая посуда.', 'Bags, containers, pipes and window frames, disposable cups.'],
        ['Волокна', 'Fibres', 'Натуральные (хлопок, шерсть), искусственные (вискоза), синтетические (капрон, лавсан).', 'Natural (cotton, wool), artificial (viscose), synthetic (nylon, polyester).'],
        ['Каучуки', 'Rubbers', 'Натуральный и синтетический, после вулканизации — резина.', 'Natural and synthetic, vulcanised into rubber.'],
      ],
    },
  ]),

  section(C, 10, 'genetic', ['Генетическая связь органических веществ', 'Linking organic classes'], [
    {
      id: 'c10-chains',
      title: ['Цепочки превращений', 'Reaction chains'],
      intro: [
        'Классы органических веществ превращаются друг в друга. Зная цепочку, можно из нефти получить почти любое вещество.',
        'Organic classes turn into one another. With the right chain, almost anything can be made from oil.',
      ],
      points: [
        ['Главная цепочка', 'The key chain', 'Алкан → алкен → спирт → альдегид → кислота → сложный эфир.', 'Alkane → alkene → alcohol → aldehyde → acid → ester.'],
      ],
      formula: '\\mathrm{C_2H_6} \\to \\mathrm{C_2H_4} \\to \\mathrm{C_2H_5OH} \\to \\mathrm{CH_3CHO} \\to \\mathrm{CH_3COOH}',
    },
    {
      id: 'c10-formula-problems',
      title: ['Задачи на вывод формулы', 'Finding a molecular formula'],
      intro: [
        'По массовым долям элементов или продуктам сгорания можно восстановить формулу неизвестного вещества.',
        'From mass fractions or combustion products you can work out an unknown substance’s formula.',
      ],
      points: [
        ['Алгоритм', 'Method', 'Делим массовые доли на атомные массы, находим соотношение атомов, уточняем по молярной массе.', 'Divide mass fractions by atomic masses, find the atom ratio, then check against the molar mass.'],
      ],
    },
  ]),
];
