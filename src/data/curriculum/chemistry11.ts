import { section } from './types';

const C = 'chemistry';

export const CHEMISTRY_11 = [
  section(C, 11, 'atom', ['Строение атома', 'Atomic structure'], [
    {
      id: 'c11-atom-models',
      title: ['Модели атома', 'Models of the atom'],
      intro: [
        'Представления об атоме менялись вместе с опытами: от «пудинга с изюмом» до квантовых облаков.',
        'Ideas about the atom changed with each experiment, from a “plum pudding” to quantum clouds.',
      ],
      points: [
        ['Томсон', 'Thomson', 'Положительный шар с вкраплёнными электронами.', 'A positive sphere studded with electrons.'],
        ['Резерфорд', 'Rutherford', 'Крошечное тяжёлое ядро и электроны вокруг.', 'A tiny heavy nucleus with electrons around it.'],
        ['Бор', 'Bohr', 'Электроны только на разрешённых орбитах, переходы дают спектры.', 'Electrons only on allowed orbits; jumps produce spectra.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c11-quantum-numbers',
      title: ['Квантовые числа. Орбитали', 'Quantum numbers. Orbitals'],
      intro: [
        'Состояние электрона описывают четыре квантовых числа. Орбиталь — область, где электрон бывает чаще всего.',
        'Four quantum numbers describe an electron. An orbital is the region where it’s most often found.',
      ],
      points: [
        ['n, ℓ, m, s', 'n, ℓ, m, s', 'n — уровень и размер, ℓ — форма, m — ориентация, s — спин.', 'n gives level and size, ℓ shape, m orientation, s spin.'],
        ['Орбитали s, p, d, f', 's, p, d, f orbitals', 's — сфера, p — гантель, d — четыре лепестка, f — ещё сложнее.', 's is a sphere, p a dumbbell, d four lobes, f more complex still.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c11-filling',
      title: ['Заполнение орбиталей', 'Filling orbitals'],
      intro: [
        'Электроны заполняют орбитали по трём правилам — от низкой энергии к высокой.',
        'Electrons fill orbitals by three rules, from low energy to high.',
      ],
      points: [
        ['Принцип Паули', 'Pauli principle', 'В одной орбитали не больше двух электронов с противоположными спинами.', 'At most two electrons per orbital, with opposite spins.'],
        ['Правило Хунда', 'Hund’s rule', 'В подуровне электроны сначала занимают орбитали по одному.', 'Electrons fill a sublevel’s orbitals singly first.'],
        ['Правило Клечковского', 'Klechkovsky’s rule', 'Сначала заполняется подуровень с меньшей суммой n + ℓ: 4s раньше 3d.', 'The sublevel with smaller n + ℓ fills first: 4s before 3d.'],
        ['Провал электрона', 'Electron “drop”', 'У Cr и Cu один 4s-электрон переходит на 3d: наполовину или полностью заполненный d-подуровень устойчивее.', 'In Cr and Cu a 4s electron moves to 3d, since half- or fully-filled d is more stable.'],
      ],
      sim: { lab: 'break_model' },
    },
    {
      id: 'c11-periodic-law',
      title: ['Периодический закон', 'The periodic law'],
      intro: [
        'Сегодня закон формулируют через заряд ядра, и он объясняется повторением строения внешних электронных слоёв.',
        'Today the law is stated by nuclear charge and explained by the repeating structure of outer electron shells.',
      ],
      points: [
        ['Современная формулировка', 'Modern statement', 'Свойства элементов периодически зависят от заряда ядра их атомов.', 'Element properties depend periodically on nuclear charge.'],
        ['Значение закона', 'Significance', 'Позволил предсказать новые элементы и их свойства — галлий, скандий, германий.', 'It predicted new elements and their properties: gallium, scandium, germanium.'],
      ],
    },
  ]),

  section(C, 11, 'matter', ['Строение вещества', 'Structure of matter'], [
    {
      id: 'c11-bonds',
      title: ['Химическая связь', 'Chemical bonds'],
      intro: [
        'Все виды связи — результат того, как атомы делят или передают электроны.',
        'Every bond type comes from how atoms share or transfer electrons.',
      ],
      points: [
        ['Обменный механизм', 'Shared-pair mechanism', 'Каждый атом даёт по одному электрону в общую пару.', 'Each atom puts one electron into the shared pair.'],
        ['Донорно-акцепторный механизм', 'Dative mechanism', 'Один атом даёт целую пару, другой — пустую орбиталь: NH₄⁺.', 'One atom gives a whole pair, the other an empty orbital: NH₄⁺.'],
        ['Ионная, металлическая, водородная', 'Ionic, metallic, hydrogen', 'Водородная связь между молекулами воды поднимает её температуру кипения до 100 °C.', 'Hydrogen bonds between water molecules raise its boiling point to 100 °C.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c11-bond-props',
      title: ['Свойства ковалентной связи. Геометрия молекул', 'Covalent bond properties. Molecular shape'],
      intro: [
        'Ковалентная связь направлена в пространстве, поэтому у молекул есть форма. Её определяет гибридизация.',
        'Covalent bonds point in specific directions, so molecules have shapes set by hybridisation.',
      ],
      points: [
        ['Длина и энергия', 'Length and energy', 'Чем короче связь, тем она прочнее: C≡C прочнее C=C и C−C.', 'Shorter bonds are stronger: C≡C beats C=C and C−C.'],
        ['Направленность и насыщаемость', 'Direction and saturation', 'Атом образует ограниченное число связей под определёнными углами.', 'An atom forms a limited number of bonds at set angles.'],
        ['Гибридизация и форма', 'Hybridisation and shape', 'CH₄ — тетраэдр, BF₃ — треугольник, CO₂ — линия, H₂O — угол из-за неподелённых пар.', 'CH₄ is tetrahedral, BF₃ trigonal, CO₂ linear, H₂O bent because of lone pairs.'],
      ],
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'c11-states',
      title: ['Агрегатные состояния. Аморфные и кристаллические', 'States of matter. Amorphous and crystalline'],
      intro: [
        'Свойства вещества в разных состояниях зависят от того, насколько упорядочены частицы.',
        'A substance’s properties in each state depend on how ordered its particles are.',
      ],
      points: [
        ['Газы, жидкости, твёрдые', 'Gases, liquids, solids', 'От полного беспорядка к строгой решётке.', 'From total disorder to a strict lattice.'],
        ['Аморфные и кристаллические', 'Amorphous and crystalline', 'Кристаллы плавятся при одной температуре, аморфные (стекло) размягчаются постепенно.', 'Crystals melt at one temperature; amorphous solids like glass soften gradually.'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'c11-dispersions',
      title: ['Чистые вещества, смеси, дисперсные системы', 'Pure substances, mixtures, dispersions'],
      intro: [
        'Дисперсная система — частицы одного вещества, распределённые в другом. Размер частиц решает, как она выглядит.',
        'A dispersion is particles of one substance spread through another; particle size decides how it looks.',
      ],
      points: [
        ['Коллоиды, золи, гели', 'Colloids, sols, gels', 'Частицы 1–100 нм. Желе — гель, кровь и молоко — коллоиды.', 'Particles of 1–100 nm. Jelly is a gel; blood and milk are colloids.'],
        ['Эффект Тиндаля', 'Tyndall effect', 'Луч света виден в коллоидном растворе, как луч прожектора в тумане.', 'A light beam shows up in a colloid, like a searchlight in fog.'],
        ['Суспензии, эмульсии, аэрозоли', 'Suspensions, emulsions, aerosols', 'Глина в воде, майонез, туман и дым.', 'Clay in water, mayonnaise, fog and smoke.'],
      ],
    },
    {
      id: 'c11-concentration',
      title: ['Способы выражения концентрации', 'Expressing concentration'],
      intro: [
        'Концентрацию выражают по-разному в зависимости от задачи: долей массы или числом молей в литре.',
        'Concentration is expressed differently for different tasks: as a mass fraction or as moles per litre.',
      ],
      points: [
        ['Массовая доля', 'Mass fraction', 'w = m(в-ва)/m(р-ра).', 'w = m(solute)/m(solution).'],
        ['Молярная концентрация', 'Molarity', 'c = ν/V, моль/л.', 'c = ν/V in mol/L.'],
      ],
      formula: 'c = \\frac{\\nu}{V}',
    },
  ]),

  section(C, 11, 'reactions', ['Химические реакции', 'Chemical reactions'], [
    {
      id: 'c11-classification',
      title: ['Классификация реакций', 'Classifying reactions'],
      intro: [
        'Каждую реакцию можно описать сразу по многим признакам — это помогает предсказать её условия и продукты.',
        'Each reaction can be described by many criteria at once, which helps predict its conditions and products.',
      ],
      points: [
        ['Полная классификация', 'Full classification', 'По составу, тепловому эффекту, обратимости, фазам (гомо- и гетерогенные), катализатору, механизму, изменению степеней окисления.', 'By composition, heat, reversibility, phases (homo- and heterogeneous), catalyst, mechanism and oxidation-state change.'],
      ],
    },
    {
      id: 'c11-thermochemistry',
      title: ['Термохимия', 'Thermochemistry'],
      intro: [
        'Теплота реакции зависит только от начальных и конечных веществ, но не от пути.',
        'A reaction’s heat depends only on the start and end substances, not on the route.',
      ],
      points: [
        ['Тепловой эффект', 'Heat of reaction', 'Q > 0 — экзотермическая, Q < 0 — эндотермическая.', 'Q > 0 is exothermic, Q < 0 endothermic.'],
        ['Закон Гесса', 'Hess’s law', 'Теплоту трудной реакции можно сложить из теплот простых.', 'The heat of a hard reaction can be summed from easier ones.'],
      ],
    },
    {
      id: 'c11-kinetics',
      title: ['Скорость реакции. Катализ', 'Reaction rate. Catalysis'],
      intro: [
        'Скорость реакции количественно описывают законы — их выводят из столкновений частиц.',
        'Reaction rates follow quantitative laws derived from particle collisions.',
      ],
      points: [
        ['Закон действующих масс', 'Rate law', 'v = k·c(A)·c(B): скорость пропорциональна произведению концентраций.', 'v = k·c(A)·c(B): rate is proportional to the product of concentrations.'],
        ['Правило Вант-Гоффа', 'Van ’t Hoff rule', 'Нагрев на 10 °C ускоряет реакцию в 2–4 раза.', 'Heating by 10 °C speeds a reaction 2–4 times.'],
        ['Гомогенный и гетерогенный катализ', 'Homogeneous and heterogeneous catalysis', 'Катализатор в той же фазе (раствор) или в другой (платина для газов).', 'The catalyst in the same phase (solution) or a different one (platinum for gases).'],
      ],
      formula: 'v_2 = v_1 \\cdot \\gamma^{\\frac{t_2 - t_1}{10}}',
      sim: { moment: 'moment_states' },
    },
    {
      id: 'c11-equilibrium',
      title: ['Химическое равновесие', 'Chemical equilibrium'],
      intro: [
        'При равновесии реакция не останавливается — прямая и обратная идут с равной скоростью.',
        'At equilibrium the reaction doesn’t stop: forward and back run at equal rates.',
      ],
      points: [
        ['Константа равновесия', 'Equilibrium constant', 'K = [C][D]/([A][B]) — чем больше, тем полнее идёт реакция.', 'K = [C][D]/([A][B]); the larger it is, the further the reaction goes.'],
        ['Принцип Ле Шателье', 'Le Chatelier’s principle', 'Концентрация, давление и температура смещают равновесие в сторону, ослабляющую воздействие. Так подбирают условия синтеза аммиака.', 'Concentration, pressure and temperature shift equilibrium to offset the change, which is how ammonia synthesis is tuned.'],
      ],
    },
    {
      id: 'c11-ph',
      title: ['Электролитическая диссоциация. pH', 'Dissociation. pH'],
      intro: [
        'Даже чистая вода чуть-чуть распадается на ионы. Кислотность раствора удобно выражать числом pH.',
        'Even pure water splits slightly into ions. Acidity is conveniently expressed as pH.',
      ],
      points: [
        ['Ионное произведение воды', 'Ionic product of water', '[H⁺][OH⁻] = 10⁻¹⁴.', '[H⁺][OH⁻] = 10⁻¹⁴.'],
        ['Водородный показатель', 'pH', 'pH = −lg[H⁺]. 7 — нейтрально, меньше — кислая среда, больше — щелочная. Желудок ~2, кровь ~7,4.', 'pH = −log[H⁺]. 7 is neutral, lower acidic, higher alkaline. Stomach ~2, blood ~7.4.'],
      ],
      formula: '\\mathrm{pH} = -\\lg[\\mathrm{H^+}]',
    },
    {
      id: 'c11-hydrolysis',
      title: ['Гидролиз', 'Hydrolysis'],
      intro: [
        'Гидролиз — разложение веществ водой. Он идёт и в пробирке, и в нашем организме при переваривании пищи.',
        'Hydrolysis is breaking substances down with water, both in a test tube and in our digestion.',
      ],
      points: [
        ['Неорганические вещества', 'Inorganic', 'Соли слабых кислот или оснований меняют pH раствора.', 'Salts of weak acids or bases shift a solution’s pH.'],
        ['Органические вещества', 'Organic', 'Гидролиз эфиров, жиров, крахмала, белков.', 'Hydrolysis of esters, fats, starch and proteins.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c11-redox',
      title: ['ОВР. Влияние среды', 'Redox. Effect of the medium'],
      intro: [
        'Одни и те же вещества дают разные продукты в зависимости от среды раствора.',
        'The same reactants give different products depending on the solution’s acidity.',
      ],
      points: [
        ['Метод электронного баланса', 'Electron balance', 'Число отданных и принятых электронов уравнивается.', 'Electrons given and taken must balance.'],
        ['KMnO₄ в разных средах', 'KMnO₄ in different media', 'В кислой среде Mn⁺⁷ → Mn²⁺ (обесцвечивание), в нейтральной → MnO₂ (бурый осадок), в щелочной → MnO₄²⁻ (зелёный раствор).', 'Acidic: Mn⁺⁷ → Mn²⁺ (colourless); neutral → MnO₂ (brown precipitate); alkaline → MnO₄²⁻ (green).'],
      ],
    },
    {
      id: 'c11-electrolysis',
      title: ['Электролиз', 'Electrolysis'],
      intro: [
        'Электрический ток заставляет идти реакции, которые сами не идут. На катоде ионы получают электроны, на аноде — отдают.',
        'Current drives reactions that wouldn’t happen on their own. Ions gain electrons at the cathode and lose them at the anode.',
      ],
      points: [
        ['Расплавы и растворы', 'Melts and solutions', 'Из расплава NaCl получают натрий, из раствора — водород и щёлочь.', 'Molten NaCl gives sodium; a solution gives hydrogen and alkali.'],
        ['Процессы на электродах', 'Electrode processes', 'Активные металлы на катоде не восстанавливаются — вместо них выделяется водород из воды.', 'Active metals don’t form at the cathode; hydrogen from water does instead.'],
        ['Применение', 'Uses', 'Алюминий, хлор, гальванопокрытия, очистка металлов.', 'Aluminium, chlorine, electroplating, metal refining.'],
      ],
      formula: '\\mathrm{Cu^{2+}} + 2e^- \\to \\mathrm{Cu}',
      sim: { moment: 'moment_electrolysis' },
    },
  ]),

  section(C, 11, 'substances', ['Вещества и их свойства', 'Substances and their properties'], [
    {
      id: 'c11-metals',
      title: ['Металлы', 'Metals'],
      intro: [
        'Металлы — восстановители. Их активность показывает ряд напряжений, а свойства соединений зависят от степени окисления.',
        'Metals are reducing agents. The activity series shows their reactivity; their compounds depend on oxidation state.',
      ],
      points: [
        ['Кислоты-окислители', 'Oxidising acids', 'Концентрированные H₂SO₄ и HNO₃ реагируют даже с медью, но водород не выделяют.', 'Concentrated H₂SO₄ and HNO₃ attack even copper but release no hydrogen.'],
        ['Побочные подгруппы', 'Transition metals', 'Медь, цинк, хром, марганец, железо — цветные соединения, переменная валентность.', 'Copper, zinc, chromium, manganese, iron: coloured compounds and variable valence.'],
        ['Оксиды и гидроксиды', 'Oxides and hydroxides', 'С ростом степени окисления свойства меняются от основных к кислотным: CrO — основный, Cr₂O₃ — амфотерный, CrO₃ — кислотный.', 'As the oxidation state rises, character shifts basic → acidic: CrO basic, Cr₂O₃ amphoteric, CrO₃ acidic.'],
        ['Химическая и электрохимическая коррозия', 'Chemical and electrochemical corrosion', 'Во влажном воздухе более активный металл разрушается, защищая соседа.', 'In damp air the more active metal corrodes, protecting its neighbour.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c11-nonmetals',
      title: ['Неметаллы', 'Non-metals'],
      intro: [
        'Неметаллы бывают и окислителями, и восстановителями, в зависимости от партнёра.',
        'Non-metals can be oxidisers or reducers, depending on the partner.',
      ],
      points: [
        ['Окислительно-восстановительные свойства', 'Redox behaviour', 'Фтор — только окислитель, сера и азот — в зависимости от реакции.', 'Fluorine only oxidises; sulfur and nitrogen do either.'],
        ['Водородные соединения, оксиды, кислоты', 'Hydrides, oxides, oxyacids', 'Кислотность водородных соединений растёт вниз по группе: HF < HCl < HBr < HI.', 'Acidity of hydrides rises down a group: HF < HCl < HBr < HI.'],
        ['Благородные газы', 'Noble gases', 'Почти инертны, но ксенон образует фториды.', 'Nearly inert, though xenon forms fluorides.'],
      ],
    },
    {
      id: 'c11-classes',
      title: ['Классы соединений: общий взгляд', 'Classes of compounds overview'],
      intro: [
        'Неорганические и органические вещества подчиняются одним законам: кислоты остаются кислотами, основания — основаниями.',
        'Inorganic and organic compounds obey the same rules: acids are acids and bases are bases.',
      ],
      points: [
        ['Кислоты', 'Acids', 'Неорганические (HCl) и органические (CH₃COOH).', 'Inorganic (HCl) and organic (CH₃COOH).'],
        ['Основания', 'Bases', 'Неорганические (NaOH) и органические (амины).', 'Inorganic (NaOH) and organic (amines).'],
        ['Амфотерные соединения', 'Amphoteric compounds', 'Al(OH)₃ и аминокислоты.', 'Al(OH)₃ and amino acids.'],
        ['Соли', 'Salts', 'Средние, кислые, основные, комплексные (K₃[Fe(CN)₆]).', 'Normal, acid, basic and complex (K₃[Fe(CN)₆]).'],
      ],
    },
    {
      id: 'c11-genetic',
      title: ['Генетическая связь', 'Genetic links'],
      intro: [
        'Граница между неорганикой и органикой условна: из угля и воды можно получить метан, а из него — любые органические вещества.',
        'The line between inorganic and organic is blurry: coal and water make methane, and methane makes anything organic.',
      ],
      points: [
        ['Пример цепочки', 'Example chain', 'CaC₂ → C₂H₂ → CH₃CHO → CH₃COOH → (CH₃COO)₂Ca.', 'CaC₂ → C₂H₂ → CH₃CHO → CH₃COOH → (CH₃COO)₂Ca.'],
      ],
    },
  ]),

  section(C, 11, 'life', ['Химия и жизнь', 'Chemistry and life'], [
    {
      id: 'c11-industry',
      title: ['Химическое производство', 'Chemical industry'],
      intro: [
        'Промышленность использует те же законы, что и учебник: равновесие, катализ, противоток, повторное использование сырья.',
        'Industry uses textbook laws: equilibrium, catalysis, counter-flow and recycling of raw materials.',
      ],
      points: [
        ['Производство серной кислоты', 'Sulfuric acid', 'S → SO₂ → SO₃ (катализатор V₂O₅) → H₂SO₄.', 'S → SO₂ → SO₃ (V₂O₅ catalyst) → H₂SO₄.'],
        ['Синтез аммиака', 'Ammonia synthesis', 'N₂ + 3H₂ ⇄ 2NH₃ при 450 °C, 300 атм, катализатор — железо.', 'N₂ + 3H₂ ⇄ 2NH₃ at 450 °C, 300 atm, iron catalyst.'],
        ['Металлургия', 'Metallurgy', 'Доменная печь, электролиз, гидрометаллургия.', 'Blast furnaces, electrolysis, hydrometallurgy.'],
      ],
    },
    {
      id: 'c11-household',
      title: ['Химия в быту', 'Chemistry at home'],
      intro: [
        'Лекарства, моющие средства и пищевые добавки — прикладная химия, с которой мы сталкиваемся каждый день.',
        'Medicines, cleaners and food additives are applied chemistry we meet every day.',
      ],
      points: [
        ['Лекарства', 'Medicines', 'Аспирин, антибиотики, вакцины. Доза решает, лекарство это или яд.', 'Aspirin, antibiotics, vaccines. The dose makes the medicine or the poison.'],
        ['Бытовая химия', 'Household chemicals', 'Кислотные и щелочные средства нельзя смешивать, особенно с хлорсодержащими.', 'Never mix acidic and alkaline cleaners, especially with bleach.'],
        ['Пищевые добавки', 'Food additives', 'Коды E: консерванты, красители, загустители.', 'E-numbers: preservatives, colours, thickeners.'],
      ],
    },
    {
      id: 'c11-ecology',
      title: ['Химия и экология', 'Chemistry and the environment'],
      intro: [
        'Химия загрязняла природу, но она же учит её очищать и производить без вреда.',
        'Chemistry has polluted nature, but it also teaches how to clean it and produce without harm.',
      ],
      points: [
        ['Загрязнение среды', 'Pollution', 'Тяжёлые металлы, пластик, кислотные дожди.', 'Heavy metals, plastic, acid rain.'],
        ['«Зелёная химия»', 'Green chemistry', 'Реакции без вредных растворителей и отходов, возобновляемое сырьё.', 'Reactions without toxic solvents or waste, using renewable feedstocks.'],
      ],
    },
    {
      id: 'c11-qualitative',
      title: ['Качественные реакции', 'Qualitative tests'],
      intro: [
        'Сводная таблица реакций, по которым узнают ионы и вещества с первого взгляда.',
        'A summary of reactions that identify ions and substances at a glance.',
      ],
      points: [
        ['Неорганические ионы', 'Inorganic ions', 'Cl⁻ + Ag⁺ — белый осадок; SO₄²⁻ + Ba²⁺ — белый; CO₃²⁻ + H⁺ — газ; Fe³⁺ + SCN⁻ — красный; NH₄⁺ + OH⁻ — запах аммиака.', 'Cl⁻ + Ag⁺ white precipitate; SO₄²⁻ + Ba²⁺ white; CO₃²⁻ + H⁺ gas; Fe³⁺ + SCN⁻ red; NH₄⁺ + OH⁻ smell of ammonia.'],
        ['Органические вещества', 'Organic substances', 'Алкены — бромная вода; многоатомные спирты — Cu(OH)₂; фенол — FeCl₃; альдегиды — серебряное зеркало; крахмал — йод; белки — биуретовая.', 'Alkenes: bromine water; polyols: Cu(OH)₂; phenol: FeCl₃; aldehydes: silver mirror; starch: iodine; proteins: biuret.'],
      ],
    },
  ]),
];
