import { section } from './types';

const C = 'chemistry';

export const CHEMISTRY_8 = [
  section(C, 8, 'basics', ['Первоначальные химические понятия', 'Basic chemical ideas'], [
    {
      id: 'c8-subject',
      title: ['Предмет химии', 'What chemistry studies'],
      intro: [
        'Химия изучает вещества, их свойства и превращения одних веществ в другие. Она объясняет, почему ржавеет гвоздь и как из нефти делают пластик.',
        'Chemistry studies substances, their properties and how they turn into one another. It explains why nails rust and how plastic is made from oil.',
      ],
      points: [
        ['Вещества и материалы', 'Substances and materials', 'Вещество — то, из чего состоит тело (железо, вода). Материал — вещество или смесь, из которой делают вещи (сталь, бетон).', 'A substance is what a body is made of (iron, water); a material is what things are made from (steel, concrete).'],
        ['Химия в жизни человека', 'Chemistry in daily life', 'Лекарства, удобрения, краски, топливо, бытовая химия — всё это продукты химии.', 'Medicines, fertilisers, paints, fuels and cleaners are all chemistry’s products.'],
        ['Методы познания', 'Methods', 'Наблюдение, эксперимент и измерение — так же, как в физике, но с акцентом на превращения веществ.', 'Observation, experiment and measurement, as in physics, but focused on how substances change.'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'c8-lab-safety',
      title: ['Правила работы в лаборатории', 'Laboratory rules'],
      intro: [
        'Химические опыты безопасны, если соблюдать правила. Главное — знать, что ты делаешь, и не пробовать вещества на вкус.',
        'Chemistry experiments are safe when you follow the rules. Above all, know what you’re doing and never taste anything.',
      ],
      points: [
        ['Техника безопасности', 'Safety rules', 'Работай в очках, не нюхай вещества прямо из пробирки — направляй запах ладонью. Кислоту льют в воду, а не наоборот.', 'Wear goggles, waft smells toward you rather than sniffing. Pour acid into water, never the reverse.'],
        ['Лабораторная посуда', 'Glassware', 'Пробирки, колбы, химические стаканы, мерный цилиндр, воронка, фарфоровая чашка.', 'Test tubes, flasks, beakers, measuring cylinders, funnels, evaporating dishes.'],
        ['Нагревательные приборы', 'Heating', 'Спиртовку зажигают спичкой и гасят колпачком. Пробирку греют в верхней части пламени, направив отверстие от людей.', 'Light a spirit lamp with a match and put it out with the cap. Heat a tube in the top of the flame, pointed away from people.'],
      ],
    },
    {
      id: 'c8-properties',
      title: ['Вещества и их свойства', 'Substances and properties'],
      intro: [
        'Каждое вещество узнают по набору свойств, как человека по внешности. Свойства бывают физические и химические.',
        'Every substance is recognised by its set of properties, like a person by their looks. Properties can be physical or chemical.',
      ],
      points: [
        ['Физические свойства', 'Physical properties', 'Агрегатное состояние, цвет, запах, плотность, температура плавления и кипения, растворимость.', 'State, colour, smell, density, melting and boiling points, solubility.'],
        ['Чистые вещества', 'Pure substances', 'Состоят из частиц одного вида и имеют постоянные свойства: дистиллированная вода кипит ровно при 100 °C.', 'Made of one kind of particle with fixed properties: distilled water boils at exactly 100 °C.'],
        ['Однородные и неоднородные смеси', 'Homogeneous and heterogeneous mixtures', 'В однородных частиц не видно (раствор сахара, воздух), в неоднородных — видно (песок с водой, молоко под микроскопом).', 'In homogeneous ones you can’t see the parts (sugar water, air); in heterogeneous ones you can (sand in water).'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'c8-separation',
      title: ['Способы разделения смесей', 'Separating mixtures'],
      intro: [
        'Смесь разделяют, используя различия в свойствах её компонентов: плотности, размере частиц, температуре кипения, магнитности.',
        'Mixtures are separated by differences in their parts’ properties: density, particle size, boiling point, magnetism.',
      ],
      points: [
        ['Отстаивание', 'Settling', 'Тяжёлые частицы оседают на дно, лёгкие всплывают. Так отделяют песок от воды.', 'Heavy particles sink and light ones float, separating sand from water.'],
        ['Фильтрование', 'Filtering', 'Фильтр пропускает раствор и задерживает нерастворимые частицы.', 'A filter lets the solution through and holds back insoluble bits.'],
        ['Выпаривание и кристаллизация', 'Evaporation and crystallisation', 'Вода испаряется, растворённая соль остаётся в виде кристаллов.', 'Water evaporates and dissolved salt is left as crystals.'],
        ['Дистилляция', 'Distillation', 'Жидкость кипятят, пар охлаждают и собирают чистым. Так получают дистиллированную воду.', 'Boil the liquid, cool the vapour and collect it pure, as with distilled water.'],
        ['Действие магнитом', 'Magnetic separation', 'Магнит вытаскивает железные опилки из смеси с серой.', 'A magnet pulls iron filings out of a mix with sulfur.'],
      ],
    },
    {
      id: 'c8-phenomena',
      title: ['Физические и химические явления', 'Physical and chemical changes'],
      intro: [
        'При физическом явлении вещество остаётся тем же (лёд тает), при химическом образуется новое вещество (дерево горит).',
        'In a physical change the substance stays the same (ice melts); in a chemical one a new substance forms (wood burns).',
      ],
      points: [
        ['Признаки реакций', 'Signs of a reaction', 'Выделение газа, выпадение осадка, изменение цвета или запаха, выделение тепла и света.', 'Gas given off, a precipitate, a change of colour or smell, heat and light.'],
        ['Условия начала реакции', 'Starting a reaction', 'Соприкосновение веществ, иногда нагревание (спичку нужно чиркнуть).', 'The substances must touch; some also need heating (a match must be struck).'],
        ['Условия протекания', 'Keeping it going', 'Некоторые реакции идут сами после запуска (горение), другим нужно постоянное нагревание.', 'Some reactions keep going once started (burning); others need constant heating.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-atoms-molecules',
      title: ['Атомно-молекулярное учение', 'Atoms and molecules'],
      intro: [
        'Вещества состоят из молекул, молекулы — из атомов. При физических явлениях молекулы сохраняются, при химических — перестраиваются.',
        'Substances are made of molecules, and molecules of atoms. Physical changes keep molecules intact; chemical ones rearrange them.',
      ],
      points: [
        ['Атомы и молекулы', 'Atoms and molecules', 'Атом — мельчайшая частица элемента; молекула — мельчайшая частица вещества, сохраняющая его свойства.', 'An atom is the smallest particle of an element; a molecule the smallest particle of a substance that keeps its properties.'],
        ['Молекулярное строение', 'Molecular substances', 'Вода, кислород, сахар: молекулы слабо связаны друг с другом, поэтому эти вещества легкоплавкие.', 'Water, oxygen, sugar: molecules are loosely held, so they melt easily.'],
        ['Немолекулярное строение', 'Non-molecular substances', 'Соль, алмаз, металлы: атомы или ионы связаны в огромную решётку — тугоплавкие и твёрдые.', 'Salt, diamond, metals: atoms or ions form a giant lattice, hard and high-melting.'],
      ],
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'c8-elements',
      title: ['Химические элементы', 'Chemical elements'],
      intro: [
        'Химический элемент — вид атомов с одинаковым зарядом ядра. Сейчас известно 118 элементов, и у каждого есть символ.',
        'An element is one kind of atom with a fixed nuclear charge. There are 118 known, each with a symbol.',
      ],
      points: [
        ['Знаки элементов', 'Element symbols', 'Первая буква латинского названия: H — водород, O — кислород, Fe — железо (ferrum).', 'From the Latin name: H hydrogen, O oxygen, Fe iron (ferrum).'],
        ['Простые и сложные вещества', 'Elements and compounds', 'Простые — из атомов одного элемента (O₂, Fe), сложные — из разных (H₂O, NaCl).', 'Simple substances have one element (O₂, Fe); compounds several (H₂O, NaCl).'],
        ['Металлы и неметаллы', 'Metals and non-metals', 'Металлы блестят, проводят ток и куются; неметаллы — чаще газы или хрупкие вещества.', 'Metals shine, conduct and can be hammered; non-metals are usually gases or brittle solids.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c8-masses',
      title: ['Масса атомов и молекул', 'Atomic and molecular mass'],
      intro: [
        'Массы атомов крошечные, поэтому их сравнивают с 1/12 массы атома углерода. Так получают относительные массы без единиц.',
        'Atoms are tiny, so their masses are compared with 1/12 of a carbon atom, giving unitless relative masses.',
      ],
      points: [
        ['Относительная атомная масса', 'Relative atomic mass', 'Ar берут из таблицы Менделеева: Ar(O) = 16, Ar(H) = 1.', 'Ar comes from the periodic table: Ar(O) = 16, Ar(H) = 1.'],
        ['Относительная молекулярная масса', 'Relative molecular mass', 'Mr — сумма Ar всех атомов: Mr(H₂O) = 2·1 + 16 = 18.', 'Mr adds up all the Ar values: Mr(H₂O) = 2·1 + 16 = 18.'],
        ['Массовая доля элемента', 'Mass fraction', 'w = n·Ar/Mr. В воде кислорода 16/18 ≈ 89%.', 'w = n·Ar/Mr. Water is 16/18 ≈ 89% oxygen.'],
      ],
      formula: 'w(\\text{Э}) = \\frac{n \\cdot A_r(\\text{Э})}{M_r} \\cdot 100\\%',
    },
    {
      id: 'c8-formulas-valence',
      title: ['Химические формулы и валентность', 'Formulas and valence'],
      intro: [
        'Каждое чистое вещество имеет постоянный состав. Валентность показывает, сколько связей образует атом, и помогает составлять формулы.',
        'Every pure substance has a fixed composition. Valence shows how many bonds an atom forms and helps write formulas.',
      ],
      points: [
        ['Закон постоянства состава', 'Law of constant composition', 'Вода из реки и из лаборатории — всегда H₂O.', 'Water from a river or a lab is always H₂O.'],
        ['Определение валентности', 'Finding valence', 'По формуле: валентность водорода I, кислорода II. В H₂S сера двухвалентна.', 'From the formula: hydrogen is I, oxygen II, so sulfur in H₂S is II.'],
        ['Составление формул', 'Writing formulas', 'Находим наименьшее общее кратное валентностей: Al(III) и O(II) → НОК 6 → Al₂O₃.', 'Use the lowest common multiple of valences: Al(III) and O(II) → 6 → Al₂O₃.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-equations',
      title: ['Химические уравнения', 'Chemical equations'],
      intro: [
        'Масса веществ до реакции равна массе после — атомы не исчезают, а только перегруппировываются. Поэтому уравнения уравнивают.',
        'Mass before a reaction equals mass after: atoms aren’t lost, just rearranged. That’s why equations are balanced.',
      ],
      points: [
        ['Закон сохранения массы', 'Conservation of mass', 'Открыт Ломоносовым (1748) и Лавуазье (1789) взвешиванием запаянных сосудов.', 'Found by Lomonosov (1748) and Lavoisier (1789) by weighing sealed vessels.'],
        ['Расстановка коэффициентов', 'Balancing', 'Число атомов каждого элемента слева и справа должно совпасть: 2H₂ + O₂ → 2H₂O.', 'Each element’s atoms must match on both sides: 2H₂ + O₂ → 2H₂O.'],
      ],
      formula: '2\\mathrm{H_2} + \\mathrm{O_2} \\to 2\\mathrm{H_2O}',
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-reaction-types',
      title: ['Типы химических реакций', 'Types of reactions'],
      intro: [
        'По числу и составу веществ все реакции делят на четыре типа.',
        'By the number and makeup of substances, reactions fall into four types.',
      ],
      points: [
        ['Соединение', 'Combination', 'Из нескольких веществ — одно: 2Mg + O₂ → 2MgO.', 'Several substances make one: 2Mg + O₂ → 2MgO.'],
        ['Разложение', 'Decomposition', 'Из одного — несколько: 2H₂O → 2H₂ + O₂.', 'One makes several: 2H₂O → 2H₂ + O₂.'],
        ['Замещение', 'Displacement', 'Простое вещество вытесняет атом из сложного: Fe + CuSO₄ → FeSO₄ + Cu.', 'An element pushes another out of a compound: Fe + CuSO₄ → FeSO₄ + Cu.'],
        ['Обмен', 'Exchange', 'Два сложных вещества обмениваются частями: NaOH + HCl → NaCl + H₂O.', 'Two compounds swap parts: NaOH + HCl → NaCl + H₂O.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-mole',
      title: ['Количество вещества', 'Amount of substance'],
      intro: [
        'Атомы считают не штуками, а «пачками» — молями. В одном моле 6·10²³ частиц, и его масса в граммах равна Mr.',
        'Atoms are counted in batches called moles. One mole holds 6·10²³ particles and weighs Mr grams.',
      ],
      points: [
        ['Моль и число Авогадро', 'The mole and Avogadro’s number', 'Nₐ = 6,02·10²³ моль⁻¹. Стакан воды — около 10 моль.', 'N_A = 6.02·10²³ mol⁻¹. A glass of water is about 10 mol.'],
        ['Молярная масса', 'Molar mass', 'M = m/ν, г/моль; численно равна Mr. M(H₂O) = 18 г/моль.', 'M = m/ν in g/mol, numerically equal to Mr. M(H₂O) = 18 g/mol.'],
        ['Молярный объём газов', 'Molar volume', 'При нормальных условиях 1 моль любого газа занимает 22,4 л.', 'At standard conditions one mole of any gas fills 22.4 L.'],
        ['Закон Авогадро и плотность газов', 'Avogadro’s law and gas density', 'В равных объёмах газов — равное число молекул. D = M₁/M₂ показывает, во сколько раз один газ тяжелее другого.', 'Equal gas volumes hold equal numbers of molecules. D = M₁/M₂ shows how much heavier one gas is.'],
        ['Расчёты по уравнениям', 'Calculations', 'Коэффициенты в уравнении — это соотношение молей. 2 моль H₂ дают 2 моль воды.', 'Equation coefficients are mole ratios: 2 mol H₂ make 2 mol water.'],
      ],
      formula: '\\nu = \\frac{m}{M} = \\frac{V}{V_m} = \\frac{N}{N_A}',
    },
  ]),

  section(C, 8, 'oxygen', ['Кислород. Горение', 'Oxygen. Combustion'], [
    {
      id: 'c8-oxygen',
      title: ['Кислород', 'Oxygen'],
      intro: [
        'Кислород — самый распространённый элемент на Земле. Без него невозможны дыхание и горение.',
        'Oxygen is the most abundant element on Earth. Breathing and burning are impossible without it.',
      ],
      points: [
        ['Нахождение в природе', 'Occurrence', '21% воздуха, 89% массы воды, почти половина земной коры.', '21% of air, 89% of water by mass, nearly half the Earth’s crust.'],
        ['Получение в лаборатории', 'Lab preparation', 'Разложением KMnO₄ при нагревании, H₂O₂ с катализатором MnO₂ или KClO₃.', 'Heating KMnO₄, or decomposing H₂O₂ with MnO₂, or KClO₃.'],
        ['Получение в промышленности', 'Industrial production', 'Сжижают воздух и разделяют по температурам кипения.', 'Air is liquefied and separated by boiling point.'],
        ['Физические свойства и собирание', 'Properties and collection', 'Газ без цвета и запаха, чуть тяжелее воздуха. Собирают вытеснением воздуха (сосуд вверх дном нельзя) или воды.', 'Colourless, odourless, slightly heavier than air. Collected by displacing air (mouth up) or water.'],
        ['Химические свойства', 'Chemical properties', 'Окисляет металлы, неметаллы и сложные вещества: S + O₂ → SO₂, CH₄ + 2O₂ → CO₂ + 2H₂O.', 'Oxidises metals, non-metals and compounds: S + O₂ → SO₂, CH₄ + 2O₂ → CO₂ + 2H₂O.'],
        ['Применение и круговорот', 'Uses and cycle', 'Медицина, сварка, металлургия. Растения выделяют кислород, животные его потребляют.', 'Medicine, welding, steelmaking. Plants release oxygen; animals use it up.'],
      ],
      formula: '2\\mathrm{KMnO_4} \\xrightarrow{t} \\mathrm{K_2MnO_4} + \\mathrm{MnO_2} + \\mathrm{O_2}\\uparrow',
    },
    {
      id: 'c8-oxides',
      title: ['Оксиды', 'Oxides'],
      intro: [
        'Оксид — соединение элемента с кислородом, где кислород двухвалентен. Ржавчина, песок, углекислый газ — всё это оксиды.',
        'An oxide is an element bonded to oxygen, with oxygen in valence II. Rust, sand and carbon dioxide are all oxides.',
      ],
      points: [
        ['Состав', 'Composition', 'Два элемента, один из которых кислород: CaO, SO₂, Fe₂O₃.', 'Two elements, one of them oxygen: CaO, SO₂, Fe₂O₃.'],
        ['Номенклатура', 'Naming', '«Оксид» + название элемента в родительном падеже + валентность: Fe₂O₃ — оксид железа(III).', '“Element oxide” plus the valence: Fe₂O₃ is iron(III) oxide.'],
      ],
    },
    {
      id: 'c8-combustion',
      title: ['Горение. Медленное окисление', 'Combustion. Slow oxidation'],
      intro: [
        'Горение — быстрая реакция с кислородом, при которой выделяются тепло и свет. Ржавление и дыхание — медленное окисление.',
        'Combustion is a fast reaction with oxygen giving heat and light. Rusting and breathing are slow oxidation.',
      ],
      points: [
        ['Условия горения', 'Fire triangle', 'Нужны горючее вещество, кислород и температура воспламенения. Убери одно — огонь погаснет.', 'You need fuel, oxygen and ignition temperature. Remove one and the fire goes out.'],
        ['Тепловой эффект', 'Heat of reaction', 'Термохимическое уравнение показывает теплоту: C + O₂ → CO₂ + 394 кДж.', 'A thermochemical equation shows the heat: C + O₂ → CO₂ + 394 kJ.'],
        ['Топливо', 'Fuels', 'Дрова, уголь, газ, бензин — запасы энергии, освобождаемые горением.', 'Wood, coal, gas, petrol: stored energy released by burning.'],
        ['Тушение пожаров', 'Fighting fires', 'Песок и пена перекрывают кислород, вода охлаждает. Горящий бензин водой не тушат — он всплывает.', 'Sand and foam cut off oxygen; water cools. Never pour water on burning petrol — it floats.'],
      ],
      formula: '\\mathrm{C} + \\mathrm{O_2} \\to \\mathrm{CO_2} + 394\\ \\text{кДж}',
    },
    {
      id: 'c8-air',
      title: ['Воздух', 'Air'],
      intro: [
        'Воздух — смесь газов: азот, кислород, аргон, углекислый газ и водяной пар.',
        'Air is a mixture of gases: nitrogen, oxygen, argon, carbon dioxide and water vapour.',
      ],
      points: [
        ['Состав воздуха', 'Composition', 'Азот 78%, кислород 21%, аргон 0,9%, CO₂ 0,04%.', 'Nitrogen 78%, oxygen 21%, argon 0.9%, CO₂ 0.04%.'],
        ['Охрана воздуха', 'Protecting the air', 'Выхлопы и заводы выбрасывают оксиды серы и азота, пыль. Помогают фильтры и чистая энергетика.', 'Exhaust and factories emit sulfur and nitrogen oxides and dust. Filters and clean energy help.'],
      ],
    },
    {
      id: 'c8-ozone',
      title: ['Озон. Аллотропия кислорода', 'Ozone. Allotropes of oxygen'],
      intro: [
        'Один элемент может образовать несколько простых веществ — это аллотропия. Кислород существует как O₂ и озон O₃.',
        'One element can form several simple substances: allotropy. Oxygen exists as O₂ and as ozone, O₃.',
      ],
      points: [
        ['Озон', 'Ozone', 'Голубоватый газ с запахом «после грозы», сильный окислитель.', 'A bluish gas that smells “after a thunderstorm”, a strong oxidiser.'],
        ['Озоновый слой', 'Ozone layer', 'На высоте 20–30 км задерживает опасный ультрафиолет. Фреоны его разрушали, их запретили.', 'At 20–30 km it blocks harmful UV. Freons damaged it and were banned.'],
      ],
    },
  ]),

  section(C, 8, 'hydrogen', ['Водород', 'Hydrogen'], [
    {
      id: 'c8-hydrogen-obtain',
      title: ['Водород в природе. Получение', 'Hydrogen. Occurrence and preparation'],
      intro: [
        'Водород — самый лёгкий и самый распространённый элемент во Вселенной. На Земле он почти весь связан в воде.',
        'Hydrogen is the lightest and most common element in the Universe. On Earth nearly all of it is locked in water.',
      ],
      points: [
        ['Нахождение в природе', 'Occurrence', 'Звёзды на 70% состоят из водорода; на Земле — вода, нефть, живые организмы.', 'Stars are 70% hydrogen; on Earth it’s in water, oil and living things.'],
        ['В лаборатории', 'In the lab', 'Металл + кислота: Zn + 2HCl → ZnCl₂ + H₂↑. Прибор Киппа даёт газ по требованию.', 'Metal plus acid: Zn + 2HCl → ZnCl₂ + H₂↑. A Kipp apparatus supplies gas on demand.'],
        ['В промышленности', 'In industry', 'Из природного газа с паром или электролизом воды.', 'From natural gas and steam, or by electrolysing water.'],
      ],
      formula: '\\mathrm{Zn} + 2\\mathrm{HCl} \\to \\mathrm{ZnCl_2} + \\mathrm{H_2}\\uparrow',
    },
    {
      id: 'c8-hydrogen-props',
      title: ['Свойства и применение водорода', 'Hydrogen’s properties and uses'],
      intro: [
        'Водород в 14 раз легче воздуха и хорошо горит. Он отнимает кислород у оксидов, восстанавливая металлы.',
        'Hydrogen is 14 times lighter than air and burns well. It strips oxygen from oxides, freeing metals.',
      ],
      points: [
        ['Физические свойства', 'Physical properties', 'Газ без цвета и запаха, почти не растворим в воде. Собирают, держа пробирку вверх дном.', 'Colourless, odourless, barely soluble. Collected in an upside-down tube.'],
        ['Гремучий газ', 'Oxyhydrogen', 'Смесь 2:1 с кислородом взрывается. Перед поджиганием водород проверяют на чистоту.', 'A 2:1 mix with oxygen explodes, so hydrogen is tested for purity before lighting.'],
        ['Реакции с хлором и серой', 'With chlorine and sulfur', 'H₂ + Cl₂ → 2HCl, H₂ + S → H₂S.', 'H₂ + Cl₂ → 2HCl, H₂ + S → H₂S.'],
        ['Восстановление металлов', 'Reducing metals', 'CuO + H₂ → Cu + H₂O — чёрный порошок становится красной медью.', 'CuO + H₂ → Cu + H₂O: black powder turns into red copper.'],
        ['Экологичное топливо', 'Clean fuel', 'При сгорании даёт только воду. Водородные автомобили уже ездят.', 'Burns to nothing but water. Hydrogen cars already exist.'],
      ],
      formula: '\\mathrm{CuO} + \\mathrm{H_2} \\xrightarrow{t} \\mathrm{Cu} + \\mathrm{H_2O}',
    },
  ]),

  section(C, 8, 'water', ['Вода. Растворы', 'Water. Solutions'], [
    {
      id: 'c8-water',
      title: ['Вода', 'Water'],
      intro: [
        'Вода — самое удивительное вещество: при охлаждении она расширяется, лёд плавает, а растворяет она почти всё.',
        'Water is remarkable: it expands as it freezes, ice floats, and it dissolves almost anything.',
      ],
      points: [
        ['Состав: анализ и синтез', 'Composition', 'Электролиз разлагает воду на 2 объёма H₂ и 1 объём O₂; сжигание водорода снова даёт воду.', 'Electrolysis splits water into 2 volumes H₂ and 1 O₂; burning hydrogen makes water again.'],
        ['Строение молекулы', 'The molecule', 'Угловая молекула (104,5°), полярная: на кислороде частичный минус, на водородах — плюс.', 'Bent (104.5°) and polar: oxygen slightly negative, hydrogens slightly positive.'],
        ['Физические свойства', 'Physical properties', 'Наибольшая плотность при +4 °C, огромная теплоёмкость.', 'Densest at +4 °C, with a huge heat capacity.'],
        ['Химические свойства', 'Chemical properties', 'С активными металлами даёт щёлочь и водород; с оксидами металлов — основания, с оксидами неметаллов — кислоты.', 'With active metals it forms alkali and hydrogen; with metal oxides bases, with non-metal oxides acids.'],
        ['Очистка воды', 'Water treatment', 'Отстаивание, фильтрование, хлорирование или озонирование.', 'Settling, filtering, chlorination or ozonation.'],
      ],
      formula: '2\\mathrm{Na} + 2\\mathrm{H_2O} \\to 2\\mathrm{NaOH} + \\mathrm{H_2}\\uparrow',
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'c8-solutions',
      title: ['Растворы. Растворимость', 'Solutions. Solubility'],
      intro: [
        'Раствор — однородная смесь растворителя и растворённого вещества. Сколько вещества может раствориться, зависит от температуры.',
        'A solution is a uniform mix of solvent and solute. How much can dissolve depends on temperature.',
      ],
      points: [
        ['Растворимость', 'Solubility', 'Сколько граммов вещества растворяется в 100 г воды. Хорошо растворимые, малорастворимые, нерастворимые.', 'Grams of substance per 100 g of water: soluble, sparingly soluble, insoluble.'],
        ['Кривые растворимости', 'Solubility curves', 'Для большинства солей растворимость растёт с температурой, для газов — падает.', 'Most salts dissolve better when hot; gases dissolve worse.'],
        ['Насыщенные и ненасыщенные', 'Saturated and unsaturated', 'В насыщенном растворе вещество больше не растворяется при этой температуре.', 'A saturated solution can’t dissolve any more at that temperature.'],
        ['Массовая доля', 'Mass fraction', 'w = m(вещества)/m(раствора)·100%. 10 г соли в 90 г воды — 10%-ный раствор.', 'w = m(solute)/m(solution)·100%. 10 g salt in 90 g water is 10%.'],
        ['Кристаллогидраты', 'Hydrates', 'Кристаллы с включённой водой: медный купорос CuSO₄·5H₂O синий, а безводный — белый.', 'Crystals containing water: blue CuSO₄·5H₂O turns white when dried.'],
      ],
      formula: 'w = \\frac{m_{в-ва}}{m_{р-ра}} \\cdot 100\\%',
      sim: { moment: 'moment_diffusion' },
    },
  ]),

  section(C, 8, 'classes', ['Основные классы неорганических соединений', 'Classes of inorganic compounds'], [
    {
      id: 'c8-oxides-classes',
      title: ['Оксиды: классификация и свойства', 'Oxides: types and properties'],
      intro: [
        'Оксиды делят по тому, с чем они реагируют: с кислотами, со щелочами, с тем и другим или ни с чем.',
        'Oxides are grouped by what they react with: acids, alkalis, both, or neither.',
      ],
      points: [
        ['Основные', 'Basic', 'Оксиды металлов I–II валентности: Na₂O, CaO. Реагируют с кислотами.', 'Oxides of metals in valence I–II: Na₂O, CaO. React with acids.'],
        ['Кислотные', 'Acidic', 'Оксиды неметаллов: CO₂, SO₃, P₂O₅. Реагируют со щелочами, с водой дают кислоты.', 'Non-metal oxides: CO₂, SO₃, P₂O₅. React with alkalis and give acids with water.'],
        ['Амфотерные', 'Amphoteric', 'ZnO, Al₂O₃ — реагируют и с кислотами, и со щелочами.', 'ZnO, Al₂O₃ react with both acids and alkalis.'],
        ['Несолеобразующие', 'Neutral', 'CO, NO, N₂O — солей не образуют.', 'CO, NO, N₂O form no salts.'],
        ['Получение', 'Preparation', 'Горение простых и сложных веществ, разложение оснований, кислот и солей.', 'Burning elements and compounds, decomposing bases, acids and salts.'],
      ],
    },
    {
      id: 'c8-bases',
      title: ['Основания', 'Bases'],
      intro: [
        'Основание — металл и одна или несколько гидроксогрупп OH. Растворимые основания называют щелочами.',
        'A base is a metal with one or more OH groups. Soluble bases are called alkalis.',
      ],
      points: [
        ['Щёлочи и нерастворимые', 'Alkalis and insoluble bases', 'NaOH, KOH, Ca(OH)₂ растворимы; Cu(OH)₂, Fe(OH)₃ — нет.', 'NaOH, KOH, Ca(OH)₂ dissolve; Cu(OH)₂, Fe(OH)₃ don’t.'],
        ['Химические свойства', 'Reactions', 'С кислотами (нейтрализация), с кислотными оксидами, с солями. Нерастворимые при нагреве разлагаются: Cu(OH)₂ → CuO + H₂O.', 'With acids (neutralisation), acidic oxides and salts. Insoluble ones decompose when heated: Cu(OH)₂ → CuO + H₂O.'],
        ['Индикаторы', 'Indicators', 'Фенолфталеин в щёлочи малиновый, лакмус — синий, метилоранж — жёлтый.', 'Phenolphthalein turns pink in alkali, litmus blue, methyl orange yellow.'],
      ],
      formula: '\\mathrm{NaOH} + \\mathrm{HCl} \\to \\mathrm{NaCl} + \\mathrm{H_2O}',
    },
    {
      id: 'c8-acids',
      title: ['Кислоты', 'Acids'],
      intro: [
        'Кислота — атомы водорода, способные замещаться металлом, и кислотный остаток. Кислоты кислые на вкус и меняют цвет индикаторов.',
        'An acid is hydrogen atoms that a metal can replace, plus an acid residue. Acids taste sour and change indicator colours.',
      ],
      points: [
        ['Классификация', 'Classification', 'Кислородсодержащие (H₂SO₄) и бескислородные (HCl); одно-, двух- и трёхосновные по числу H.', 'Oxyacids (H₂SO₄) and binary acids (HCl); mono-, di- and tribasic by the number of H.'],
        ['С металлами', 'With metals', 'Металлы левее водорода в ряду активности вытесняют его: Zn + H₂SO₄ → ZnSO₄ + H₂. Медь — нет.', 'Metals left of hydrogen in the activity series displace it: Zn + H₂SO₄ → ZnSO₄ + H₂. Copper doesn’t.'],
        ['С оксидами, основаниями, солями', 'With oxides, bases, salts', 'CuO + 2HCl → CuCl₂ + H₂O; реакция с солью идёт, если выпадает осадок или выделяется газ.', 'CuO + 2HCl → CuCl₂ + H₂O; with a salt it goes if a precipitate or gas forms.'],
      ],
      formula: '\\mathrm{Zn} + \\mathrm{H_2SO_4} \\to \\mathrm{ZnSO_4} + \\mathrm{H_2}\\uparrow',
    },
    {
      id: 'c8-salts',
      title: ['Соли', 'Salts'],
      intro: [
        'Соль — металл и кислотный остаток. Поваренная соль, мел, медный купорос — всё это соли.',
        'A salt is a metal with an acid residue. Table salt, chalk and copper sulfate are all salts.',
      ],
      points: [
        ['Средние, кислые, основные', 'Normal, acid, basic', 'NaCl — средняя, NaHCO₃ (сода) — кислая, (CuOH)₂CO₃ (малахит) — основная.', 'NaCl is normal, NaHCO₃ (baking soda) acid, (CuOH)₂CO₃ (malachite) basic.'],
        ['Номенклатура', 'Naming', 'Название остатка + металл: сульфат натрия, хлорид кальция, нитрат серебра.', 'Residue plus metal: sodium sulfate, calcium chloride, silver nitrate.'],
        ['Химические свойства', 'Reactions', 'С металлами, кислотами, щелочами и другими солями.', 'With metals, acids, alkalis and other salts.'],
        ['Способы получения', 'Preparation', 'Металл + кислота, оксид + кислота, нейтрализация, металл + неметалл.', 'Metal + acid, oxide + acid, neutralisation, metal + non-metal.'],
      ],
    },
    {
      id: 'c8-amphoteric',
      title: ['Амфотерность', 'Amphoterism'],
      intro: [
        'Некоторые оксиды и гидроксиды ведут себя как основания с кислотами и как кислоты со щелочами.',
        'Some oxides and hydroxides act as bases toward acids and as acids toward alkalis.',
      ],
      points: [
        ['Цинк и алюминий', 'Zinc and aluminium', 'Zn(OH)₂ + 2HCl → ZnCl₂ + 2H₂O и Zn(OH)₂ + 2NaOH → Na₂[Zn(OH)₄].', 'Zn(OH)₂ + 2HCl → ZnCl₂ + 2H₂O and Zn(OH)₂ + 2NaOH → Na₂[Zn(OH)₄].'],
      ],
    },
    {
      id: 'c8-genetic-link',
      title: ['Генетическая связь классов', 'How the classes connect'],
      intro: [
        'Классы веществ превращаются друг в друга по цепочкам. Зная цепочку, можно получить нужное вещество.',
        'Classes of substances turn into each other along chains. Know the chain and you can make what you need.',
      ],
      points: [
        ['Ряд металла', 'The metal chain', 'Металл → основный оксид → основание → соль: Ca → CaO → Ca(OH)₂ → CaCl₂.', 'Metal → basic oxide → base → salt: Ca → CaO → Ca(OH)₂ → CaCl₂.'],
        ['Ряд неметалла', 'The non-metal chain', 'Неметалл → кислотный оксид → кислота → соль: S → SO₂ → H₂SO₃ → Na₂SO₃.', 'Non-metal → acidic oxide → acid → salt: S → SO₂ → H₂SO₃ → Na₂SO₃.'],
      ],
    },
  ]),

  section(C, 8, 'periodic', ['Периодический закон и строение атома', 'The periodic law and atomic structure'], [
    {
      id: 'c8-families',
      title: ['Классификация элементов', 'Families of elements'],
      intro: [
        'Ещё до Менделеева химики заметили, что элементы собираются в семейства с похожими свойствами.',
        'Before Mendeleev, chemists noticed elements group into families with similar properties.',
      ],
      points: [
        ['Щелочные металлы', 'Alkali metals', 'Li, Na, K — мягкие, бурно реагируют с водой, образуя щёлочи.', 'Li, Na, K: soft, reacting violently with water to form alkalis.'],
        ['Галогены', 'Halogens', 'F, Cl, Br, I — активные неметаллы, «рождающие соли».', 'F, Cl, Br, I: reactive non-metals, the “salt-formers”.'],
        ['Инертные газы', 'Noble gases', 'He, Ne, Ar — почти ни с чем не реагируют.', 'He, Ne, Ar: they barely react with anything.'],
      ],
    },
    {
      id: 'c8-periodic-law',
      title: ['Периодический закон. Таблица Менделеева', 'The periodic law and table'],
      intro: [
        'Менделеев расположил элементы по массе и увидел, что свойства повторяются периодически. Он даже оставил клетки для неоткрытых элементов.',
        'Mendeleev ordered elements by mass and saw their properties repeat. He even left gaps for undiscovered elements.',
      ],
      points: [
        ['Периодический закон', 'Periodic law', 'Свойства элементов периодически зависят от заряда ядра атома.', 'Element properties depend periodically on nuclear charge.'],
        ['Периоды', 'Periods', 'Горизонтальные ряды: малые (1–3) и большие (4–7).', 'Horizontal rows: short (1–3) and long (4–7).'],
        ['Группы и подгруппы', 'Groups and subgroups', 'Вертикальные столбцы. Главные подгруппы — s- и p-элементы, побочные — d-элементы.', 'Vertical columns. Main subgroups hold s- and p-elements; secondary ones d-elements.'],
      ],
    },
    {
      id: 'c8-atom',
      title: ['Строение атома', 'Atomic structure'],
      intro: [
        'Атом — ядро из протонов и нейтронов и электронная оболочка. Номер элемента равен числу протонов.',
        'An atom is a nucleus of protons and neutrons plus an electron shell. The atomic number is the number of protons.',
      ],
      points: [
        ['Ядро', 'Nucleus', 'Протоны (+1) и нейтроны (0). Число нейтронов = A − Z.', 'Protons (+1) and neutrons (0). Neutrons = A − Z.'],
        ['Электронная оболочка', 'Electron shell', 'Число электронов равно числу протонов — атом нейтрален.', 'Electrons equal protons, so the atom is neutral.'],
        ['Изотопы', 'Isotopes', 'Атомы одного элемента с разным числом нейтронов: ³⁵Cl и ³⁷Cl.', 'Atoms of one element with different neutron counts: ³⁵Cl and ³⁷Cl.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c8-electrons',
      title: ['Электроны в атоме', 'Electrons in the atom'],
      intro: [
        'Электроны располагаются по энергетическим уровням и подуровням. От внешних электронов зависят химические свойства.',
        'Electrons sit in energy levels and sublevels. The outer ones decide chemical behaviour.',
      ],
      points: [
        ['Уровни и подуровни', 'Levels and sublevels', 'Число уровней = номер периода. Подуровни s, p, d, f.', 'Number of levels = period number. Sublevels s, p, d, f.'],
        ['Электронные формулы', 'Electron configurations', 'Натрий: 1s² 2s² 2p⁶ 3s¹ — один внешний электрон, поэтому валентность I.', 'Sodium: 1s² 2s² 2p⁶ 3s¹, one outer electron, so valence I.'],
        ['Графические схемы', 'Orbital diagrams', 'Клеточки-орбитали со стрелками-электронами: не больше двух в клетке, с противоположными спинами.', 'Boxes for orbitals with arrows for electrons: at most two per box, with opposite spins.'],
      ],
      sim: { lab: 'orbitals' },
    },
    {
      id: 'c8-trends',
      title: ['Закономерности в таблице', 'Trends in the table'],
      intro: [
        'Положение элемента в таблице говорит о его свойствах заранее, без опытов.',
        'An element’s place in the table predicts its properties before any experiment.',
      ],
      points: [
        ['Радиус атома', 'Atomic radius', 'В периоде слева направо уменьшается, в группе сверху вниз растёт.', 'Shrinks left to right across a period, grows down a group.'],
        ['Металлические свойства', 'Metallic character', 'Усиливаются вниз по группе и справа налево. Самый активный металл — франций, неметалл — фтор.', 'Increase down a group and right to left. The most reactive metal is francium, non-metal fluorine.'],
        ['Характеристика элемента', 'Describing an element', 'По положению: число протонов, электронов, уровней, валентность, металл или неметалл, формула оксида.', 'From its position: protons, electrons, levels, valence, metal or non-metal, oxide formula.'],
      ],
    },
  ]),

  section(C, 8, 'bonding', ['Химическая связь. ОВР', 'Chemical bonding. Redox'], [
    {
      id: 'c8-electronegativity',
      title: ['Электроотрицательность', 'Electronegativity'],
      intro: [
        'Электроотрицательность — способность атома притягивать к себе электроны связи. Самый «жадный» — фтор.',
        'Electronegativity is an atom’s pull on bonding electrons. Fluorine is the greediest.',
      ],
      points: [
        ['Ряд ЭО', 'The scale', 'F > O > N > Cl > … > H > … > Na. Разница ЭО определяет тип связи.', 'F > O > N > Cl > … > H > … > Na. The difference decides the bond type.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-covalent',
      title: ['Ковалентная связь', 'Covalent bond'],
      intro: [
        'Атомы неметаллов делят пару электронов на двоих. Если атомы одинаковые — пара посередине, если разные — смещена к более электроотрицательному.',
        'Non-metal atoms share an electron pair. Identical atoms share it equally; different ones pull it toward the more electronegative atom.',
      ],
      points: [
        ['Неполярная', 'Non-polar', 'H₂, O₂, Cl₂ — электроны поровну.', 'H₂, O₂, Cl₂: electrons shared equally.'],
        ['Полярная', 'Polar', 'HCl, H₂O — пара смещена, на атомах частичные заряды δ+ и δ−.', 'HCl, H₂O: the pair is pulled aside, leaving partial charges δ+ and δ−.'],
        ['Электронные и структурные формулы', 'Electron and structural formulas', 'Точки показывают электроны, чёрточка — общую пару: H–Cl.', 'Dots show electrons; a dash shows a shared pair: H–Cl.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-ionic-metallic',
      title: ['Ионная и металлическая связь', 'Ionic and metallic bonds'],
      intro: [
        'Если разница ЭО большая, электрон переходит полностью и образуются ионы. В металлах электроны общие для всего куска.',
        'With a big electronegativity gap an electron transfers fully, making ions. In metals electrons are shared by the whole piece.',
      ],
      points: [
        ['Ионная связь', 'Ionic bond', 'Na отдаёт электрон Cl: Na⁺ и Cl⁻ притягиваются. Так устроена поваренная соль.', 'Na gives an electron to Cl: Na⁺ and Cl⁻ attract. That’s table salt.'],
        ['Металлическая связь', 'Metallic bond', 'Положительные ионы в «электронном газе». Отсюда блеск, ковкость и проводимость.', 'Positive ions in an “electron gas”, giving shine, malleability and conductivity.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c8-lattices',
      title: ['Кристаллические решётки', 'Crystal lattices'],
      intro: [
        'По тому, что сидит в узлах решётки, предсказывают свойства вещества: твёрдость, температуру плавления, растворимость.',
        'What sits at the lattice points predicts hardness, melting point and solubility.',
      ],
      points: [
        ['Атомные', 'Atomic', 'Алмаз, кварц — очень твёрдые и тугоплавкие.', 'Diamond, quartz: very hard and high-melting.'],
        ['Молекулярные', 'Molecular', 'Лёд, сахар, йод — легкоплавкие, летучие.', 'Ice, sugar, iodine: low-melting and volatile.'],
        ['Ионные', 'Ionic', 'Соли — твёрдые, хрупкие, растворы и расплавы проводят ток.', 'Salts: hard, brittle, conducting when dissolved or molten.'],
        ['Металлические', 'Metallic', 'Металлы — пластичные, блестящие, проводят ток и тепло.', 'Metals: malleable, shiny, conducting heat and electricity.'],
      ],
    },
    {
      id: 'c8-oxidation-state',
      title: ['Степень окисления', 'Oxidation state'],
      intro: [
        'Степень окисления — условный заряд атома, если бы все связи были ионными. Помогает следить за электронами в реакциях.',
        'An oxidation state is the charge an atom would have if every bond were ionic. It helps track electrons in reactions.',
      ],
      points: [
        ['Правила', 'Rules', 'В простых веществах — 0. Кислород обычно −2, водород +1, щелочные металлы +1. Сумма в молекуле — 0.', 'Elements are 0. Oxygen is usually −2, hydrogen +1, alkali metals +1. A molecule sums to 0.'],
        ['Пример', 'Example', 'В H₂SO₄: 2·(+1) + x + 4·(−2) = 0, значит сера +6.', 'In H₂SO₄: 2·(+1) + x + 4·(−2) = 0, so sulfur is +6.'],
      ],
    },
    {
      id: 'c8-redox',
      title: ['Окислительно-восстановительные реакции', 'Redox reactions'],
      intro: [
        'В ОВР одни атомы отдают электроны, другие принимают. Сколько отдано, столько и принято — на этом строится метод электронного баланса.',
        'In redox reactions some atoms give electrons and others take them. Given equals taken, which is the basis of electron balancing.',
      ],
      points: [
        ['Окислитель и восстановитель', 'Oxidiser and reducer', 'Восстановитель отдаёт электроны, окислитель принимает.', 'The reducing agent gives electrons; the oxidising agent takes them.'],
        ['Окисление и восстановление', 'Oxidation and reduction', 'Окисление — отдача электронов (степень растёт), восстановление — приём (степень падает).', 'Oxidation is losing electrons (state rises); reduction is gaining (state falls).'],
        ['Электронный баланс', 'Electron balance', 'Уравниваем число отданных и принятых электронов, затем расставляем коэффициенты.', 'Match electrons lost and gained, then set the coefficients.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
  ]),
];
