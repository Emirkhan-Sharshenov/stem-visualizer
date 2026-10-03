import { TextbookLesson } from '../types/stem';

export const DETAILED_CHEMISTRY_CURRICULUM: TextbookLesson[] = [
  // =========================================================================
  // 8 КЛАСС — ХИМИЯ
  // =========================================================================
  {
    id: 'ch8_intro_matter',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Subject of Chemistry: Substances and Materials', ru: 'Предмет химии: Вещества и материалы' },
    subtitle: { en: 'Difference between physical bodies and the chemical substances they consist of', ru: 'Различие между физическими телами и веществами, из которых они состоят' },
    textbookDefinition: {
      en: 'Chemistry is the science of substances, their properties, structure, and the transformations of substances resulting from chemical reactions.',
      ru: 'Химия — наука о веществах, их свойствах, строении и превращениях одних веществ в другие в результате химических реакций.'
    },
    studentConfusion: {
      en: 'Confusing a physical object (nail, glass cup) with the substance (iron Fe, silica SiO₂).',
      ru: 'Школьники путают физическое тело (гвоздь, стакан, ложка) и само вещество (железо Fe, диоксид кремния SiO₂, алюминий Al).'
    },
    lifeAnalogy: {
      en: 'A glass, a window pane, and a lens are different objects, but made of the exact same chemical substance — glass (SiO₂).',
      ru: 'Гвоздь, сковорода и корабельный якорь — совершенно разные предметы, но все они сделаны из одного и того же вещества — железа.'
    },
    momentObservation: {
      en: 'Observe the crystalline lattice vs molecular disorder under the chemical microscope.',
      ru: 'Наблюдай структуру кристаллической решетки и молекулярного строения вещества.'
    },
    formula: '\\text{Вещество} \\rightarrow \\text{Свойства} \\rightarrow \\text{Применение}',
    viewMode: 'moment_states',
    keywords: ['chemistry', 'substance', 'matter', 'химия', 'вещество', 'материал', 'предмет']
  },
  {
    id: 'ch8_pure_mixtures',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Pure Substances and Mixtures: Separation Methods', ru: 'Чистые вещества и смеси: Способы разделения смесей' },
    subtitle: { en: 'Filtration, evaporation, distillation, and magnetic separation in practice', ru: 'Фильтрование, выпаривание, кристаллизация, дистилляция и действие магнитом' },
    textbookDefinition: {
      en: 'A pure substance consists of identical particles and possesses constant physical properties. A mixture consists of two or more substances retaining their individual chemical properties.',
      ru: 'Чистое вещество обладает постоянными физическими свойствами. Смесь состоит из двух или более веществ, сохраняющих свои индивидуальные свойства, и может быть разделена физическими методами.'
    },
    studentConfusion: {
      en: 'Students think sea water or tap water is "pure water", not realizing it is a solution of salts.',
      ru: 'Школьники думают, что прозрачная вода из-под крана — «чистое вещество», забывая, что в ней растворены соли кальция, магния и газы.'
    },
    lifeAnalogy: {
      en: 'Tea with sugar: sugar dissolved without reaction; boiling away the water leaves pure sugar crystals behind.',
      ru: 'Чай с сахаром: сахар не превратился в новое вещество, а распределился между молекулами воды. Если выпарить воду, сахар снова осядет кристаллами!'
    },
    momentObservation: {
      en: 'Watch salt water evaporate: water molecules vaporize into gas while ionic NaCl lattice precipitates.',
      ru: 'Смотри, как при выпаривании раствора молекулы H₂O улетают паром, а ионы Na⁺ и Cl⁻ кристаллизуются в решетку поваренной соли!'
    },
    viewMode: 'moment_states',
    keywords: ['mixture', 'pure', 'filtration', 'distillation', 'смеси', 'чистые вещества', 'фильтрование', 'выпаривание']
  },
  {
    id: 'ch8_physical_chemical_phenomena',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Physical and Chemical Phenomena: Signs of Reaction', ru: 'Физические и химические явления: Признаки химических реакций' },
    subtitle: { en: 'Gas evolution, precipitate formation, color change, and heat release', ru: 'Выделение газа, выпадение осадка, изменение цвета, выделение тепла и света' },
    textbookDefinition: {
      en: 'Physical phenomena change only the state or shape without altering molecular composition. Chemical reactions result in the formation of new substances with new properties.',
      ru: 'При физических явлениях состав веществ не меняется, меняется лишь агрегатное состояние или форма. При химических реакциях разрушаются старые связи и образуются новые вещества.'
    },
    studentConfusion: {
      en: 'Thinking that boiling water is a chemical reaction because bubbles appear (it is phase change H₂O liquid to H₂O gas).',
      ru: 'Школьники путают кипение воды (физическое явление: пар — это та же H₂O) с выделением водорода при реакции кислоты с цинком (химическое явление).'
    },
    lifeAnalogy: {
      en: 'Melting chocolate is physical (cool it down and it is chocolate again). Baking a cake is chemical (you cannot unbake flour and eggs).',
      ru: 'Растопить шоколад — физическое явление (остынет — станет прежним шоколадом). А вот испечь пирог или сжечь спичку — химическое (назад в муку и яйца не вернуть)!'
    },
    momentObservation: {
      en: 'Watch zinc react with hydrochloric acid: bubbling effervescence of H₂ gas and heat release.',
      ru: 'В момент опускания цинка в соляную кислоту: электроны переходят к ионам водорода, и выделяются пузырьки H₂ с шипением!'
    },
    formula: '\\text{Zn} + 2\\text{HCl} \\rightarrow \\text{ZnCl}_2 + \\text{H}_2\\uparrow + Q',
    viewMode: 'moment_chemical_bond',
    keywords: ['chemical', 'physical', 'reaction', 'signs', 'явления', 'признаки реакции', 'осадок', 'газ']
  },
  {
    id: 'ch8_atoms_molecules_elements',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Atoms, Molecules, and Chemical Elements', ru: 'Атомно-молекулярное учение: Простые и сложные вещества' },
    subtitle: { en: 'Chemical symbols, metals and nonmetals, allotropy', ru: 'Знаки химических элементов, металлы и неметаллы' },
    textbookDefinition: {
      en: 'An atom is the smallest chemically indivisible particle of matter. A molecule is the smallest particle of a substance that retains its chemical properties. A chemical element is a type of atom with the same nuclear charge.',
      ru: 'Атом — мельчайшая химически неделимая частица вещества. Молекула — мельчайшая частица вещества, сохраняющая его химические свойства. Химический элемент — вид атомов с одинаковым зарядом ядра.'
    },
    studentConfusion: {
      en: 'Confusing an atom with a molecule (e.g. oxygen atom O vs oxygen gas molecule O₂).',
      ru: 'Ученики путают атом кислорода O (одиночный шарик) и молекулу газа кислорода O₂ (два атома, крепко связанных ковалентной связью).'
    },
    lifeAnalogy: {
      en: 'Lego bricks: individual colored studs are chemical elements/atoms; assembled toys are molecules.',
      ru: 'Конструктор Lego: отдельные кубики — это атомы химических элементов. Когда кубики сцеплены в модель машины — это молекула сложного вещества.'
    },
    momentObservation: {
      en: 'Examine two hydrogen atoms and one oxygen atom snapping together into bent H₂O geometry.',
      ru: 'Наблюдай, как два атома водорода делят электроны с кислородом, образуя угловую молекулу воды H₂O!'
    },
    formula: '2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['atoms', 'molecules', 'elements', 'атомы', 'молекулы', 'элементы', 'простые', 'сложные']
  },
  {
    id: 'ch8_atomic_molecular_mass',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Atomic and Molecular Mass (Ar and Mr): Mass Fraction', ru: 'Относительная атомная (Ar) и молекулярная (Mr) масса: Массовая доля' },
    subtitle: { en: 'Why carbon-12 unit is used and how to compute percentage of element', ru: 'Углеродная единица, расчет Mr и массовая доля элемента w в соединении' },
    textbookDefinition: {
      en: 'Relative atomic mass Ar is the ratio of an atom\'s mass to 1/12 of the mass of a carbon-12 atom. Relative molecular mass Mr is the sum of relative atomic masses of all atoms in the formula.',
      ru: 'Относительная атомная масса Ar — безразмерная величина, равная отношению массы атома к 1/12 массы атома углерода-12. Молекулярная масса Mr — сумма атомных масс всех атомов в формуле вещества.'
    },
    studentConfusion: {
      en: 'Confusing grams with dimensionless atomic mass units (amu).',
      ru: 'Школьники забывают, что масса одного атома в граммах чудовищно мала (~10⁻²⁴ г), поэтому химики используют удобную относительную шкалу Ar.'
    },
    lifeAnalogy: {
      en: 'Measuring weights in bags of flour: if standard bag is 1 kg, an item weighing 18 kg is 18 standard units.',
      ru: 'Вместо того чтобы называть массу слона в миллиграммах (5 000 000 000 мг), мы говорим 5 тонн. Так и в химии: вместо 2.99·10⁻²³ г для воды говорят Mr(H₂O) = 18.'
    },
    momentObservation: {
      en: 'Calculate H₂O: Ar(H)=1, Ar(O)=16, Mr = 2*1 + 16 = 18. Mass fraction of O is 16/18 = 88.9%.',
      ru: 'Расчет воды: H₂O = 1·2 + 16 = 18. Доля кислорода по массе: w(O) = 16 / 18 = 88.9% массы океанов!'
    },
    formula: 'M_r = \\sum A_{r,i}, \\quad w(\\text{X}) = \\frac{n \\cdot A_r(\\text{X})}{M_r} \\cdot 100\\%',
    viewMode: 'moment_chemical_bond',
    keywords: ['atomic mass', 'molecular mass', 'mass fraction', 'Ar', 'Mr', 'массовая доля']
  },
  {
    id: 'ch8_valence_formulas',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Valence of Elements: Composing Chemical Formulas', ru: 'Валентность элементов: Составление формул по валентности' },
    subtitle: { en: 'Constant and variable valence, finding lowest common multiple', ru: 'Постоянная и переменная валентность, метод наименьшего общего кратного (НОК)' },
    textbookDefinition: {
      en: 'Valence is the capacity of an atom of a given element to attach or replace a certain number of atoms of another element (primarily hydrogen with valence I).',
      ru: 'Валентность — свойство атомов химического элемента присоединять определенное число атомов других элементов. За единицу валентности принята валентность атома водорода (I).'
    },
    studentConfusion: {
      en: 'Why do formulas have indices like Al₂O₃ instead of just AlO?',
      ru: 'Почему оксид алюминия пишется Al₂O₃, а не просто AlO? Школьники забывают уравнять общее число валентных связей.'
    },
    lifeAnalogy: {
      en: 'Atoms have "hands": Hydrogen has 1 hand, Oxygen has 2 hands, Aluminum has 3 hands. All hands must shake hands in pairs!',
      ru: 'Руки атомов: у водорода 1 рука, у кислорода 2 руки, у алюминия 3 руки. Чтобы никто не остался со свободной рукой, 2 алюминия (6 рук) держат 3 кислорода (6 рук) — получается Al₂O₃!'
    },
    momentObservation: {
      en: 'Watch the valency bonds snap: Al(III) and O(II) have LCM = 6, producing formula Al₂O₃.',
      ru: 'Соединение Al(III) и O(II): НОК(3, 2) = 6. Делим: 6:3 = 2 атома Al, 6:2 = 3 атома O. Получаем Al₂O₃!'
    },
    formula: '\\text{НОК}(\\text{вал}_1, \\text{вал}_2) \\Rightarrow \\text{Индекс} = \\frac{\\text{НОК}}{\\text{Валентность}}',
    viewMode: 'moment_chemical_bond',
    keywords: ['valence', 'chemical formula', 'валентность', 'формулы', 'индексы', 'НОК']
  },
  {
    id: 'ch8_conservation_equations',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Law of Conservation of Mass: Balancing Equations', ru: 'Закон сохранения массы веществ: Расстановка коэффициентов' },
    subtitle: { en: 'Lomonosov and Lavoisier discovery: atoms do not vanish into nothing', ru: 'Закон Ломоносова–Лавуазье и алгоритм расстановки коэффициентов' },
    textbookDefinition: {
      en: 'The mass of all substances entering into a chemical reaction equals the total mass of all substances produced by the reaction: atoms are rearranged, never created or destroyed.',
      ru: 'Масса веществ, вступивших в химическую реакцию, равна массе веществ, получившихся в результате её. Атомы не возникают из ниоткуда и не исчезают бесследно, они лишь перегруппировываются.'
    },
    studentConfusion: {
      en: 'Students change chemical indices (subscripts) instead of placing stoichiometric coefficients in front.',
      ru: 'Главная ошибка: ученики меняют маленькие циферки индексов внутри молекулы (делают H₂O₂ вместо H₂O), вместо того чтобы ставить большие коэффициенты перед всей молекулой!'
    },
    lifeAnalogy: {
      en: 'Baking bicycles: 2 wheels + 1 frame = 1 bike. If you have 8 wheels, you need 4 frames to make 4 bikes.',
      ru: 'Сборка велосипедов: 2 колеса + 1 рама = 1 велосипед. Нельзя сделать велосипед с тремя колесами просто так — нужно уравнять число деталей слева и справа: 4Fe + 3O₂ = 2Fe₂O₃!'
    },
    momentObservation: {
      en: 'Balance Fe + O₂ → Fe₂O₃: count iron atoms (4) and oxygen atoms (6) on both sides of reaction balance.',
      ru: 'Смотри на весы реакции: слева 4 атома железа и 6 атомов кислорода (3O₂), справа 2 молекулы Fe₂O₃ — стрелка весов строго горизонтальна!'
    },
    formula: 'm_{\\text{исх}} = m_{\\text{прод}}, \\quad 4\\text{Fe} + 3\\text{O}_2 = 2\\text{Fe}_2\\text{O}_3',
    viewMode: 'moment_chemical_bond',
    keywords: ['conservation of mass', 'balancing', 'coefficients', 'закон сохранения массы', 'коэффициенты', 'уравнения']
  },
  {
    id: 'ch8_reaction_types',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Initial Chemical Concepts', ru: 'Первоначальные химические понятия' },
    title: { en: 'Four Types of Chemical Reactions', ru: 'Типы химических реакций: Соединение, разложение, замещение, обмен' },
    subtitle: { en: 'Classification by number and composition of reacting substances', ru: 'Классификация реакций по числу и составу исходных и конечных веществ' },
    textbookDefinition: {
      en: 'Synthesis (A+B→AB), Decomposition (AB→A+B), Single displacement (A+BC→AC+B), and Double displacement (AB+CD→AD+CB).',
      ru: 'Реакции соединения (из нескольких простых получается одно сложное), разложения (из одного сложного — несколько новых), замещения (атомы простого замещают атомы в сложном) и обмена (два сложных обмениваются составными частями).'
    },
    studentConfusion: {
      en: 'Confusing single replacement with double replacement.',
      ru: 'Школьники путают реакцию замещения (участвует простое вещество: Zn + 2HCl → ZnCl₂ + H₂) и реакцию обмена (два сложных вещества: NaOH + HCl → NaCl + H₂O).'
    },
    lifeAnalogy: {
      en: 'Dance partners: Synthesis (two dancers pair up), Decomposition (duo splits), Single displacement (new dancer replaces one), Double displacement (couples swap partners).',
      ru: 'Танцевальная площадка: соединение — два одиночки встали в пару; разложение — пара разошлась; замещение — один танцор вытеснил другого; обмен — две пары поменялись партнерами!'
    },
    momentObservation: {
      en: 'Interactive reaction builder: watch atoms recombine according to the 4 classic reaction schemes.',
      ru: 'Интерактивная схема перегруппировки: смотри, как ионы меняются местами в реакции обмена с выпадением белого осадка BaSO₄!'
    },
    formula: '\\text{A} + \\text{B} \\rightarrow \\text{AB}, \\quad \\text{AB} + \\text{CD} \\rightarrow \\text{AD} + \\text{CB}',
    viewMode: 'moment_chemical_bond',
    keywords: ['reaction types', 'synthesis', 'decomposition', 'replacement', 'типы реакций', 'соединение', 'разложение', 'замещение', 'обмен']
  },
  {
    id: 'ch8_mole_avogadro',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Amount of Substance', ru: 'Количество вещества' },
    title: { en: 'The Mole Concept and Avogadro\'s Number: Molar Mass', ru: 'Моль, число Авогадро и молярная масса: Молярный объем газов' },
    subtitle: { en: 'Why 1 mole of any ideal gas occupies 22.4 liters at STP', ru: 'Связь микромира атомов и макромира весов: n = m / M, Vm = 22.4 л/моль' },
    textbookDefinition: {
      en: 'The mole is the amount of substance containing exactly 6.022 × 10²³ elementary entities (Avogadro\'s constant). Molar volume of any ideal gas at standard temperature and pressure (STP) equals 22.4 L/mol.',
      ru: 'Моль — количество вещества, содержащее столько же структурных единиц (молекул или атомов), сколько атомов содержится в 12 граммах углерода-12: N_A = 6.022·10²³ моль⁻¹. Молярный объем газов при н.у. Vm = 22.4 л/моль.'
    },
    studentConfusion: {
      en: 'Students cannot fathom how 18 grams of water can hold 600 sextillion molecules.',
      ru: 'Школьникам трудно представить число Авогадро 6·10²³. Но 1 моль воды — это всего лишь один глоток (18 миллилитров), и в этом глотке 602 200 000 000 000 000 000 000 молекул!'
    },
    lifeAnalogy: {
      en: 'A "dozen" means 12 eggs. A "ream" means 500 sheets. A "mole" means 6.022 × 10²³ molecules.',
      ru: 'Слово «дюжина» означает 12 штук (яиц). Слово «пачка» — 500 листов бумаги. Слово «моль» — это просто химическая пачка из 6.022·10²³ микрочастиц!'
    },
    momentObservation: {
      en: 'See 1 mole of helium gas expand into a standard cube of 22.4 liters at 0°C and 1 atm.',
      ru: 'Наблюдай куб объемом 22.4 литра: при нормальных условиях ровно 1 моль любого газа (H₂, O₂, CO₂) занимает именно этот объем!'
    },
    formula: 'n = \\frac{m}{M} = \\frac{N}{N_A} = \\frac{V}{V_m}, \\quad V_m = 22.4 \\text{ л/моль}',
    viewMode: 'moment_states',
    keywords: ['mole', 'avogadro', 'molar mass', 'molar volume', 'моль', 'авогадро', 'молярная масса', 'молярный объем', '22.4']
  },
  {
    id: 'ch8_oxygen_combustion',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Oxygen and Oxides', ru: 'Кислород. Оксиды. Горение' },
    title: { en: 'Oxygen: Preparation, Properties, and Combustion', ru: 'Кислород: Получение в лаборатории, оксиды и горение' },
    subtitle: { en: 'Decomposition of KMnO₄/H₂O₂, rapid combustion vs slow oxidation', ru: 'Лабораторные способы получения (KMnO₄, H₂O₂), катализаторы, условия горения' },
    textbookDefinition: {
      en: 'Oxygen (O₂) is a colorless, odorless diatomic gas supporting combustion and respiration. Combustion is a fast oxidation reaction accompanied by heat and light.',
      ru: 'Кислород O₂ — бесцветный газ без запаха, поддерживающий дыхание и горение. Горение — быстрая окислительно-восстановительная реакция, протекающая с выделением большого количества тепла и света.'
    },
    studentConfusion: {
      en: 'Confusing slow oxidation (rusting iron, decay) with flaming combustion.',
      ru: 'Школьники думают, что окисление — это всегда открытый огонь. Но ржавление гвоздя — это то же самое окисление кислородом, только медленное!'
    },
    lifeAnalogy: {
      en: 'Blowing on charcoal in a campfire: more oxygen accelerates chemical combustion rate dramatically.',
      ru: 'Раздувание углей в костре: приток чистого кислорода O₂ заставляет тлеющую лучинку вспыхнуть ярким пламенем за долю секунды!'
    },
    momentObservation: {
      en: 'Observe glow in pure oxygen: charcoal sparks and iron wire burns with blinding incandescent shower.',
      ru: 'Опусти раскаленную стальную проволоку в колбу с чистым кислородом: железо сгорает снопом ослепительных искр Fe₃O₄!'
    },
    formula: '2\\text{KMnO}_4 \\xrightarrow{t} \\text{K}_2\\text{MnO}_4 + \\text{MnO}_2 + \\text{O}_2\\uparrow',
    viewMode: 'moment_chemical_bond',
    keywords: ['oxygen', 'combustion', 'oxides', 'oxidation', 'кислород', 'горение', 'оксиды', 'окисление']
  },
  {
    id: 'ch8_hydrogen_acids',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Hydrogen', ru: 'Водород' },
    title: { en: 'Hydrogen: The Lightest Gas and Clean Fuel', ru: 'Водород: Получение в аппарате Киппа, свойства и гремучий газ' },
    subtitle: { en: 'Reaction of metals with acids, explosive mixture 2H₂ + O₂, reduction of metal oxides', ru: 'Получение из цинка и кислоты (Zn + 2HCl), гремучая смесь, экологическое топливо' },
    textbookDefinition: {
      en: 'Hydrogen (H₂) is the lightest known gas in the universe. It exhibits strong reducing properties and reacts explosively with oxygen in a 2:1 volume ratio forming water.',
      ru: 'Водород H₂ — самый легкий газ во Вселенной (в 14.5 раз легче воздуха). Является мощным восстановителем металлов из их оксидов. Смесь 2 объемов H₂ и 1 объема O₂ называется гремучим газом.'
    },
    studentConfusion: {
      en: 'Why test hydrogen with an upside-down test tube (because H₂ is lighter than air and escapes upwards).',
      ru: 'Почему пробирку для сбора водорода держат дном вверх? Потому что водород в 14.5 раз легче воздуха и мгновенно улетает вверх, вытесняя воздух!'
    },
    lifeAnalogy: {
      en: 'Hydrogen fuel cell buses: exhaust pipe drips pure drinking water with zero carbon soot!',
      ru: 'Водородный двигатель будущего: машина сжигает чистый водород H₂, а из выхлопной трубы капает чистейшая питьевая вода H₂O!'
    },
    momentObservation: {
      en: 'Watch copper oxide reduced by hydrogen stream: black CuO turns into shiny pink metallic copper Cu.',
      ru: 'Пропусти водород над черным порошком CuO при нагревании: кислород уходит с образованием воды, и порошок вспыхивает розовым металлом Cu!'
    },
    formula: '\\text{CuO} + \\text{H}_2 \\xrightarrow{t} \\text{Cu} + \\text{H}_2\\text{O}, \\quad 2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['hydrogen', 'reduction', 'water', 'водород', 'аппарат киппа', 'гремучий газ', 'восстановление']
  },
  {
    id: 'ch8_water_solutions_solubility',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Water and Solutions', ru: 'Вода. Растворы' },
    title: { en: 'Water as Universal Solvent: Saturated Solutions', ru: 'Вода и растворы: Растворимость веществ и массовая доля' },
    subtitle: { en: 'Polar H₂O dipole, solubility curves, saturated and supersaturated solutions', ru: 'Дипольное строение молекулы воды, кривые растворимости, насыщенные растворы' },
    textbookDefinition: {
      en: 'A solution is a homogeneous system consisting of two or more components (solvent and solute) and their interaction products. Saturated solution holds maximum solute at given temperature.',
      ru: 'Раствор — однородная (гомогенная) система переменного состава, состоящая из растворителя, растворенного вещества и продуктов их взаимодействия. Насыщенный раствор — раствор, в котором данное вещество больше не растворяется при данной температуре.'
    },
    studentConfusion: {
      en: 'Confusing mass fraction w (%) with solubility in grams per 100g of water.',
      ru: 'Ученики путают растворимость (сколько грамм растворяется в 100 г воды) и массовую долю w (отношение массы вещества ко всей массе раствора).'
    },
    lifeAnalogy: {
      en: 'Seawater vs table sugar tea: when you pour too much sugar, extra grains stay at bottom — solution is saturated.',
      ru: 'Сладкий чай: первые 2 ложки сахара растворяются полностью, но если насыпать 10 ложек — лишний сахар осядет на дно: раствор стал насыщенным!'
    },
    momentObservation: {
      en: 'Observe water dipoles surround Na⁺ and Cl⁻ ions, ripping the ionic crystal apart into hydrated ions.',
      ru: 'Посмотри, как полярные молекулы воды поворачиваются кислородом к Na⁺ и водородом к Cl⁻, вырывая ионы из кристалла соли!'
    },
    formula: 'w = \\frac{m_{\\text{вещ}}}{m_{\\text{раствора}}} \\cdot 100\\%, \\quad m_{\\text{раствора}} = m_{\\text{вещ}} + m_{\\text{воды}}',
    viewMode: 'moment_electrolysis',
    keywords: ['water', 'solution', 'solubility', 'saturated', 'вода', 'растворы', 'растворимость', 'массовая доля']
  },
  {
    id: 'ch8_inorganic_classes',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Main Classes of Inorganic Compounds', ru: 'Основные классы неорганических соединений' },
    title: { en: 'Oxides, Bases, Acids, and Salts: Genetic Relationships', ru: 'Четыре класса неорганики: Оксиды, Основания, Кислоты и Соли' },
    subtitle: { en: 'Classification, nomenclature, and the genetic link between metal and nonmetal lines', ru: 'Классификация, индикаторы (лакмус, фенолфталеин) и реакции нейтрализации' },
    textbookDefinition: {
      en: 'Oxides (E_xO_y), Bases (M(OH)_n), Acids (H_nR), and Salts (M_xR_y). Neutralization is the reaction between acid and base yielding salt and water: Acid + Base → Salt + H₂O.',
      ru: 'Четыре кита неорганической химии: Оксиды (элемент + кислород), Основания (металл + гидроксид OH⁻), Кислоты (водород H⁺ + кислотный остаток) и Соли (металл + кислотный остаток). Реакция нейтрализации: Кислота + Основание = Соль + Вода.'
    },
    studentConfusion: {
      en: 'Students get lost memorizing reactions instead of following the generic rule: Metal oxide + Acid → Salt + Water.',
      ru: 'Школьники пытаются механически зубрить сотни реакций, вместо понимания общего принципа: основное реагирует с кислотным, давая соль!'
    },
    lifeAnalogy: {
      en: 'Acid and alkaline are like North and South poles of magnets: opposite chemical characters attract and neutralize each other.',
      ru: 'Кислота (уксус, лимон) и щелочь (мыло, сода) — противоположности. При смешивании они нейтрализуют друг друга, превращаясь в нейтральную соленую воду!'
    },
    momentObservation: {
      en: 'Add alkali to pink phenolphthalein then titrate with acid: color instantly switches from bright crimson to crystal clear.',
      ru: 'Капни щелочь в фенолфталеин — раствор становится малиновым! Добавь кислоты — цвет мгновенно исчезает: прошла нейтрализация!'
    },
    formula: '\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['oxides', 'bases', 'acids', 'salts', 'neutralization', 'оксиды', 'основания', 'кислоты', 'соли', 'нейтрализация']
  },
  {
    id: 'ch8_periodic_table_structure',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Periodic Law and Atomic Structure', ru: 'Периодический закон и строение атома' },
    title: { en: 'Mendeleev\'s Periodic Law: Atomic Radii and Electronegativity', ru: 'Периодический закон Менделеева и электронное строение атомов' },
    subtitle: { en: 'Periods, groups, valence electron shells, and periodic trends', ru: 'Физический смысл порядкового номера, периода, группы и изменение свойств элементов' },
    textbookDefinition: {
      en: 'The properties of chemical elements and their compounds are in periodic dependence on their atomic nuclear charge Z (number of protons).',
      ru: 'Свойства химических элементов и образуемых ими простых и сложных веществ находятся в периодической зависимости от заряда атомных ядер (порядкового номера Z).'
    },
    studentConfusion: {
      en: 'Why do properties repeat in periods? Students do not connect rows with electron shells.',
      ru: 'Почему свойства повторяются волнами? Потому что номер периода — это число электронных слоев, а номер группы — число электронов на внешнем слое!'
    },
    lifeAnalogy: {
      en: 'Days of the week or octaves on a piano: every 8th note is the same musical tone (Do, Re, Mi...), but at a higher pitch octave.',
      ru: 'Октавы на пианино или дни недели: каждый седьмой день — воскресенье. Так и элементы: через каждые 8 элементов снова идет щелочной металл, а за ним галоген!'
    },
    momentObservation: {
      en: 'Move across Period 3: Na → Mg → Al → Si → P → S → Cl → Ar: watch atomic radius shrink and electronegativity soar!',
      ru: 'Пройди по 3-му периоду от натрия к хлору: радиус атома сжимается от притяжения ядра, а способность отбирать чужие электроны растет до максимума!'
    },
    formula: 'Z = N(p^+) = N(e^-), \\quad N(n^0) = A - Z',
    viewMode: 'moment_chemical_bond',
    keywords: ['periodic law', 'mendeleev', 'atomic radius', 'electronegativity', 'периодический закон', 'менделеев', 'радиус атома', 'электроотрицательность']
  },
  {
    id: 'ch8_chemical_bonding_types',
    grade: 'grade_8',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Chemical Bonding', ru: 'Строение вещества и химическая связь' },
    title: { en: 'Covalent, Ionic, and Metallic Bonding', ru: 'Ковалентная (полярная и неполярная), ионная и металлическая связь' },
    subtitle: { en: 'Shared electron pairs, dipole shifts, and electrostatic crystal lattices', ru: 'Общие электронные пары, перетягивание плотности и кристаллическая решетка' },
    textbookDefinition: {
      en: 'Chemical bonding is the interaction that holds atoms or ions together into molecules or crystals, driven by the desire to attain an octet valence shell (2 or 8 electrons).',
      ru: 'Химическая связь — совокупность сил взаимодействия атомов, приводящая к образованию устойчивых молекул или кристаллов за счет образования завершенного внешнего электронного слоя.'
    },
    studentConfusion: {
      en: 'Confusing covalent polar bond (HCl) with ionic bond (NaCl).',
      ru: 'В чем разница между HCl и NaCl? В HCl хлор лишь сдвинул электронную пару к себе (ковалентная полярная), а в NaCl натрий полностью отдал электрон хлору (ионная связь)!'
    },
    lifeAnalogy: {
      en: 'Two kids sharing a toy equally (covalent nonpolar), stronger kid pulling it closer (polar), or taking it completely away (ionic).',
      ru: 'Два ребенка играют с мячом: держат вдвоем посередине (ковалентная неполярная H-H); более сильный тянет мяч ближе к себе (полярная H-Cl); один отобрал мяч насовсем (ионная Na⁺Cl⁻)!'
    },
    momentObservation: {
      en: 'Launch interactive chemical bond lab: toggle nonpolar, polar, and ionic modes to see electron density clouds warp.',
      ru: 'Запусти симулятор химической связи: переключай режимы и наблюдай, как электронное облако стягивается к более электроотрицательному атому!'
    },
    formula: '\\text{H}:\\text{H} \\quad (\\text{непол.}), \\quad \\text{H}^{\\delta+}:\\text{Cl}^{\\delta-} \\quad (\\text{пол.}), \\quad \\text{Na}^+[\\text{:Cl:}]^- \\quad (\\text{ион.})',
    viewMode: 'moment_chemical_bond',
    keywords: ['covalent', 'ionic', 'metallic', 'bonding', 'ковалентная', 'ионная', 'металлическая', 'связь']
  },

  // =========================================================================
  // 9 КЛАСС — ХИМИЯ
  // =========================================================================
  {
    id: 'ch9_electrolytic_dissociation',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Chemical Reactions in Solutions', ru: 'Химические реакции в растворах' },
    title: { en: 'Electrolytic Dissociation: Cations and Anions', ru: 'Теория электролитической диссоциации (ТЭД): Электролиты' },
    subtitle: { en: 'Why salt water conducts electricity but sugar water does not', ru: 'Распад веществ на ионы под действием полярных молекул воды: сильные и слабые электролиты' },
    textbookDefinition: {
      en: 'Electrolytic dissociation is the breakdown of electrolytes into hydrated ions when dissolved in water or melted, enabling electric current conduction.',
      ru: 'Электролитическая диссоциация — процесс распада электролита на положительные (катионы) и отрицательные (анионы) ионы под действием полярных молекул растворителя или при расплавлении.'
    },
    studentConfusion: {
      en: 'Students think electricity breaks the salt apart. In reality, water dissolves it into ions first; voltage only directs their drift.',
      ru: 'Школьники думают, что ток разрывает соль на ионы. Нет! Вода уже разорвала кристалл на ионы при растворении, а ток просто заставляет их плыть к электродам!'
    },
    lifeAnalogy: {
      en: 'Water acts like a mediator separating arguing friends so they can walk around freely as independent charged entities.',
      ru: 'Молекулы воды как толпа миротворцев окружают кристалл соли со всех сторон и разводят Na⁺ и Cl⁻ в разные стороны, надевая на каждый ион «водную шубу» (гидратацию)!'
    },
    momentObservation: {
      en: 'Watch light bulb ignite when electrodes touch NaCl solution: blue cations drift right, yellow anions drift left.',
      ru: 'Опусти электроды в сухую соль — лампочка не горит. Налей воды — ионы оживают, лампочка вспыхивает ярким светом!'
    },
    formula: '\\text{NaCl} \\xrightarrow{\\text{H}_2\\text{O}} \\text{Na}^+ + \\text{Cl}^-, \\quad \\text{H}_2\\text{SO}_4 \\rightarrow 2\\text{H}^+ + \\text{SO}_4^{2-}',
    viewMode: 'moment_electrolysis',
    keywords: ['dissociation', 'electrolyte', 'ions', 'cations', 'anions', 'диссоциация', 'электролиты', 'катионы', 'анионы']
  },
  {
    id: 'ch9_ion_exchange_reactions',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Chemical Reactions in Solutions', ru: 'Химические реакции в растворах' },
    title: { en: 'Ion Exchange Reactions: Complete and Net Ionic Equations', ru: 'Реакции ионного обмена (РИО): Условия необратимости' },
    subtitle: { en: 'When reactions go to completion: precipitate, gas, or weak electrolyte (water)', ru: 'Полные и сокращенные ионные уравнения, таблица растворимости' },
    textbookDefinition: {
      en: 'Ion exchange reactions occur between electrolyte solutions without changing oxidation states. They go to completion if precipitate (↓), gas (↑), or weak electrolyte (H₂O) forms.',
      ru: 'Реакции ионного обмена протекают до конца только тогда, когда ионы связываются друг с другом, уходя из раствора в виде осадка (↓), газа (↑) или слабого электролита (H₂O).'
    },
    studentConfusion: {
      en: 'Why do spectator ions get crossed out in net ionic equations?',
      ru: 'Зачем зачеркивать ионы в сокращенном уравнении? Потому что они как зрители на стадионе: плавали до реакции и точно так же плавают после, не участвуя в образовании осадка!'
    },
    lifeAnalogy: {
      en: 'Two couples arriving at a party: if John and Mary fall in love and leave together (precipitate), the whole dynamic of the room permanently changes.',
      ru: 'Смешиваем растворы BaCl₂ и Na₂SO₄: ионы Ba²⁺ и SO₄²⁻ намертво притягиваются и падают белым камнем на дно. А Na⁺ и Cl⁻ просто остаются в воде!'
    },
    momentObservation: {
      en: 'Mix Ba²⁺ and SO₄²⁻: watch the instant precipitation of heavy white BaSO₄ crystal flakes.',
      ru: 'Смешивание растворов: сокращенное ионное уравнение Ba²⁺ + SO₄²⁻ = BaSO₄↓ наглядно показывает единственный настоящий химический процесс!'
    },
    formula: '\\text{Ba}^{2+} + \\text{SO}_4^{2-} \\rightarrow \\text{BaSO}_4\\downarrow, \\quad \\text{H}^+ + \\text{OH}^- \\rightarrow \\text{H}_2\\text{O}',
    viewMode: 'moment_electrolysis',
    keywords: ['ion exchange', 'net ionic equation', 'precipitate', 'РИО', 'ионные уравнения', 'осадок', 'газ']
  },
  {
    id: 'ch9_redox_reactions',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Redox Processes', ru: 'Окислительно-восстановительные реакции (ОВР)' },
    title: { en: 'Redox Reactions: Electron Balance and Oxidation States', ru: 'Окислительно-восстановительные реакции (ОВР): Метод электронного баланса' },
    subtitle: { en: 'Oxidizing agent gains electrons, reducing agent loses electrons', ru: 'Окислитель (грабитель электронов) и восстановитель (щедрый донор электронов)' },
    textbookDefinition: {
      en: 'Redox reactions involve changes in oxidation states of elements resulting from the transfer of electrons from a reducing agent (which oxidizes) to an oxidizing agent (which reduces).',
      ru: 'ОВР — реакции, протекающие с изменением степеней окисления атомов за счет перехода электронов от восстановителя (отдающего e⁻) к окислителю (принимающему e⁻).'
    },
    studentConfusion: {
      en: 'Students get confused why "reduction" means GAINING electrons (because electron has negative charge, reducing the oxidation number!).',
      ru: 'Почему «восстановление» — это ПРИЕМ электронов? Потому что электрон заряжен отрицательно (-1), и когда атом берет электрон, его степень окисления падает вниз (уменьшается)!'
    },
    lifeAnalogy: {
      en: 'Financial transaction: the buyer gives money (reducer loses electrons), the seller takes money (oxidizer gains electrons). One cannot happen without the other!',
      ru: 'Банковский перевод: восстановитель отдает деньги со счета, а окислитель их принимает. Нельзя отдать электроны в пустоту — рядом обязан быть тот, кто их примет!'
    },
    momentObservation: {
      en: 'Watch copper strip placed in AgNO₃: shiny silver needles grow on copper while solution turns deep blue with Cu²⁺.',
      ru: 'Опусти медную проволоку в раствор нитрата серебра: Cu отдает 2 электрона ионам Ag⁺, и проволока мгновенно обрастает сверкающими кристаллами чистого серебра!'
    },
    formula: '\\text{Cu}^0 - 2e^- \\rightarrow \\text{Cu}^{2+} \\quad (\\text{восстановитель}), \\quad \\text{Ag}^+ + 1e^- \\rightarrow \\text{Ag}^0 \\quad (\\text{окислитель})',
    viewMode: 'moment_electrolysis',
    keywords: ['redox', 'oxidation state', 'electron balance', 'ОВР', 'окислитель', 'восстановитель', 'степень окисления']
  },
  {
    id: 'ch9_halogens_chlorine',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Nonmetals and their Compounds', ru: 'Неметаллы и их соединения' },
    title: { en: 'Halogens: Chlorine, Fluorine, Bromine, and Iodine', ru: 'Галогены: Хлор, бром, иод и их водородные соединения' },
    subtitle: { en: 'Group VIIA elements, extreme oxidizing power, displacement of halides', ru: 'Типичные неметаллы (ns²np⁵), соляная кислота и качественные реакции на галогенид-ионы' },
    textbookDefinition: {
      en: 'Halogens (salt-formers) are elements of Group 17 with 7 valence electrons. They eagerly gain 1 electron to complete their octet, being the most active nonmetals.',
      ru: 'Галогены («рождающие соли») — элементы VIIA группы (F, Cl, Br, I). На внешнем слое имеют 7 электронов, поэтому проявляют сильнейшие окислительные свойства, присоединяя 1 электрон.'
    },
    studentConfusion: {
      en: 'Which halogen displaces which? (Higher in group = stronger oxidizer: F₂ > Cl₂ > Br₂ > I₂).',
      ru: 'Кто кого вытесняет? Более активный вышестоящий галоген вытесняет нижестоящий из растворов солей: Cl₂ выбивает Br⁻ и I⁻!'
    },
    lifeAnalogy: {
      en: 'Fluorine and chlorine are like hungry vacuum cleaners for stray electrons: they rip electrons even from water or glass.',
      ru: 'Фтор и хлор — как сверхмощные магниты для электронов: им не хватает ровно одной частицы до идеальной оболочки благородного газа!'
    },
    momentObservation: {
      en: 'Bubble chlorine gas through colorless KI solution: yellow-brown iodine I₂ instantly precipitates.',
      ru: 'Пропусти желто-зеленый газ хлор Cl₂ через прозрачный раствор KI: раствор мгновенно темнеет до бурого цвета от выделившегося иода I₂!'
    },
    formula: '\\text{Cl}_2 + 2\\text{KBr} \\rightarrow 2\\text{KCl} + \\text{Br}_2',
    viewMode: 'moment_electrolysis',
    keywords: ['halogens', 'chlorine', 'bromine', 'iodine', 'галогены', 'хлор', 'бром', 'иод']
  },
  {
    id: 'ch9_sulfur_sulfuric_acid',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Nonmetals and their Compounds', ru: 'Неметаллы и их соединения' },
    title: { en: 'Sulfur and Sulfuric Acid: Production and Properties', ru: 'Сера и Серная кислота: Контактный способ получения и свойства' },
    subtitle: { en: 'Allotropy of sulfur, sulfur dioxide SO₂, oleum, and concentrated H₂SO₄ as oxidizer', ru: 'Свойства разбавленной и концентрированной H₂SO₄, качественная реакция на сульфат-ион (Ba²⁺)' },
    textbookDefinition: {
      en: 'Sulfuric acid (H₂SO₄) is the "blood of chemical industry". Dilute H₂SO₄ acts as a strong typical acid, while concentrated H₂SO₄ is a powerful oxidizer reacting even with copper.',
      ru: 'Серная кислота H₂SO₄ — важнейший продукт химической промышленности («хлеб химии»). Разбавленная реагирует с металлами до водорода с выделением H₂, а концентрированная окисляет даже медь с выделением SO₂.'
    },
    studentConfusion: {
      en: 'Rule: "Never pour water into acid!" Why? (Extreme heat of hydration causes dangerous boiling splatters).',
      ru: 'Золотое правило безопасности: «Лей кислоту в воду, а не наоборот!». Если капнуть воду в плотную тяжелую кислоту, капля мгновенно вскипает и разбрызгивает едкую кислоту в глаза!'
    },
    lifeAnalogy: {
      en: 'Concentrated sulfuric acid thirstily strips water molecules right out of paper or sugar, instantly turning white sugar into a black column of pure carbon foam!',
      ru: 'Обугливание сахара: концентрированная серная кислота настолько жадно выдирает элементы воды из молекулы сахара C₁₂H₂₂O₁₁, что сахар на глазах вспучивается черным углем!'
    },
    momentObservation: {
      en: 'Pour conc. H₂SO₄ over sugar: vigorous dehydration creates rising steaming tower of black carbon.',
      ru: 'Наблюдай реакцию Cu + 2H₂SO₄ (конц): выделяется газ SO₂ с резким запахом спичек, а раствор окрашивается в лазурный цвет сульфата меди!'
    },
    formula: '\\text{Cu} + 2\\text{H}_2\\text{SO}_4 \\text{ (конц)} \\xrightarrow{t} \\text{CuSO}_4 + \\text{SO}_2\\uparrow + 2\\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['sulfur', 'sulfuric acid', 'oleum', 'сера', 'серная кислота', 'сульфат', 'окисление']
  },
  {
    id: 'ch9_metals_corrosion',
    grade: 'grade_9',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 9', ru: '9 Класс' },
    chapter: { en: 'Metals', ru: 'Металлы и их сплавы' },
    title: { en: 'Metals and Electrochemical Series: Corrosion Protection', ru: 'Общие свойства металлов и Электрохимический ряд напряжений: Коррозия' },
    subtitle: { en: 'Metallic lattice, electron sea, reaction with water and acids, sacrificial anode', ru: 'Электропроводность, пластичность, ряд активности металлов Бекетова и защита от ржавления' },
    textbookDefinition: {
      en: 'Metals share a common crystalline structure with delocalized valence electrons ("electron gas"). The electrochemical activity series determines whether a metal can displace hydrogen from acids or other metals from salt solutions.',
      ru: 'Металлы обладают металлической кристаллической решеткой с обобществленным электронным газом. В ряду активности металлов (Li, K, Na, Mg, Al, Zn, Fe, Ni, Sn, Pb, H₂, Cu, Ag, Pt, Au) металлы до водорода вытесняют H₂ из разбавленных кислот.'
    },
    studentConfusion: {
      en: 'Why doesn\'t copper react with hydrochloric acid? (Because Cu is located after hydrogen in the activity series).',
      ru: 'Почему медь не реагирует с соляной кислотой? Потому что медь в ряду Бекетова стоит правее водорода и её восстановительной силы недостаточно, чтобы отдать электрон протону H⁺!'
    },
    lifeAnalogy: {
      en: 'Zinc sacrificial protectors on ship hulls: zinc corrodes first, sacrificing itself to keep the steel hull intact.',
      ru: 'Протекторная защита кораблей: к стальному корпусу прикручивают пластины цинка. Цинк активнее железа, поэтому морская вода разрушает цинк, а обшивка корабля годами остается целой!'
    },
    momentObservation: {
      en: 'Drop magnesium vs copper into HCl: magnesium erupts in vigorous bubbling while copper sits untouched.',
      ru: 'Опусти кусочек магния в кислоту: бурная реакция с шипением и вылетом водорода! А рядом медь — лежит без единого пузырька, доказывая закон ряда активности.'
    },
    formula: '\\text{Mg} + 2\\text{HCl} \\rightarrow \\text{MgCl}_2 + \\text{H}_2\\uparrow, \\quad \\text{Cu} + \\text{HCl} \\rightarrow \\varnothing',
    viewMode: 'moment_electrolysis',
    keywords: ['metals', 'activity series', 'corrosion', 'sacrificial', 'металлы', 'ряд напряжений', 'коррозия', 'сплавы']
  },

  // =========================================================================
  // 10 КЛАСС — ОРГАНИЧЕСКАЯ ХИМИЯ
  // =========================================================================
  {
    id: 'ch10_butlerov_hydrocarbons',
    grade: 'grade_10',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Organic Chemistry: Fundamentals', ru: 'Теория строения органических соединений' },
    title: { en: 'Butlerov\'s Theory of Chemical Structure: Isomerism', ru: 'Теория химического строения Бутлерова: Изомерия' },
    subtitle: { en: 'Carbon tetravalency, sp³ hybridization, structural and spatial isomers', ru: 'Четырехвалентность углерода, прямые и разветвленные цепи, изомеры C₄H₁₀' },
    textbookDefinition: {
      en: 'Butlerov\'s theory states: atoms in organic molecules are linked in an exact sequence according to their valence; the properties of substances depend not only on what atoms are present, but also on how they are connected.',
      ru: 'Положения теории Бутлерова: 1) Атомы в молекулах соединены друг с другом в строгой химической последовательности согласно их валентности (углерод всегда четырехвалентен). 2) Свойства веществ зависят не только от качественного и количественного состава, но и от порядка соединения атомов (изомерия).'
    },
    studentConfusion: {
      en: 'How can two completely different substances have the exact same chemical formula C₂H₆O?',
      ru: 'Как могут два вещества иметь одинаковую формулу C₂H₆O, но одно — медицинский спирт (жидкость), а другое — диметиловый эфир (газ)? Потому что порядок атомов разный: C-C-O-H против C-O-C!'
    },
    lifeAnalogy: {
      en: 'Anagram words: "LISTEN" and "SILENT" have the exact same letters, but totally different meanings because the letters are arranged differently.',
      ru: 'Слова-анаграммы: «КОТ» и «ТОК» состоят из одних и тех же трех букв, но означают пушистого зверя или электрический разряд! Так же и изомеры в органике.'
    },
    momentObservation: {
      en: 'Rotate butane vs isobutane: same formula C₄H₁₀, but boiling points differ by 11 degrees due to chain branching.',
      ru: 'Сравни бутан (прямая цепочка, кипит при 0°C) и изобутан (разветвленная цепочка, кипит при -11°C): пространственная форма определяет силу сцепления молекул!'
    },
    formula: '\\text{C}_4\\text{H}_{10}: \\quad \\text{CH}_3\\text{-CH}_2\\text{-CH}_2\\text{-CH}_3 \\quad \\text{vs} \\quad \\text{CH}_3\\text{-CH(CH}_3\\text{)-CH}_3',
    viewMode: 'moment_chemical_bond',
    keywords: ['butlerov', 'organic', 'isomerism', 'hybridization', 'бутлеров', 'органика', 'изомерия', 'углеводороды']
  },
  {
    id: 'ch10_alkanes_alkenes_alkynes',
    grade: 'grade_10',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Hydrocarbons', ru: 'Углеводороды' },
    title: { en: 'Alkanes, Alkenes, and Alkynes: Saturated vs Unsaturated', ru: 'Предельные и непредельные углеводороды: Алканы, алкены и алкины' },
    subtitle: { en: 'Single σ-bonds vs double/triple π-bonds, bromine water decolorization', ru: 'Гомологические ряды (метан, этилен, ацетилен), реакции замещения и присоединения' },
    textbookDefinition: {
      en: 'Alkanes (C_nH_{2n+2}) contain only single σ-bonds and undergo substitution. Alkenes (C_nH_{2n}) and alkynes (C_nH_{2n-2}) have double and triple bonds with weak π-electrons, readily undergoing addition reactions.',
      ru: 'Алканы — предельные углеводороды с одинарными прочными σ-связями (реакции радикального замещения). Алкены и алкины содержат кратные связи с подвижными π-электронами, мгновенно вступая в реакции присоединения (обесцвечивание бромной воды).'
    },
    studentConfusion: {
      en: 'Why is ethylene so much more chemically reactive than ethane?',
      ru: 'Почему этан (газ) инертен, а этилен реагирует моментально? Потому что вторая π-связь непрочная, она легко раскрывается как застежка-липучка, присоединяя бром или воду!'
    },
    lifeAnalogy: {
      en: 'Handshake: a single handshake (σ-bond) is secure; trying to shake with both hands and feet (double/triple bond) leaves bonds stressed and easy to break by newcomers.',
      ru: 'Одинарная связь — как рукопожатие двумя пальцами. Двойная связь — напряженная поза, вторая «рука» так и ждет, чтобы расцепиться и схватить бром!'
    },
    momentObservation: {
      en: 'Bubble ethylene gas into orange bromine water: solution turns clear within seconds as Br adds across double bond.',
      ru: 'Пропусти этилен C₂H₄ через оранжевую бромную воду: раствор на глазах становится прозрачным как слеза — качественная реакция на кратную связь!'
    },
    formula: '\\text{CH}_2=\\text{CH}_2 + \\text{Br}_2 \\rightarrow \\text{CH}_2\\text{Br-CH}_2\\text{Br}',
    viewMode: 'moment_chemical_bond',
    keywords: ['alkanes', 'alkenes', 'alkynes', 'double bond', 'алканы', 'алкены', 'алкины', 'кратная связь', 'этилен']
  },
  {
    id: 'ch10_benzene_aromatic',
    grade: 'grade_10',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Hydrocarbons', ru: 'Ароматические углеводороды (Арены)' },
    title: { en: 'Benzene: Aromatic π-Electron Sextet and Kekulé Ring', ru: 'Бензол и арены: Ароматическое кольцо и сопряженный π-секстет' },
    subtitle: { en: 'Why benzene resists addition reactions despite having 6 unsaturations', ru: 'Особая стабильность ароматического кольца, кольцо Кекюле, реакции электрофильного замещения' },
    textbookDefinition: {
      en: 'Benzene (C₆H₆) has a flat hexagonal ring of 6 sp² carbon atoms with delocalized cyclical π-electron system of 6 electrons obeying Hückel\'s (4n+2) aromaticity rule.',
      ru: 'Бензол C₆H₆ — простейший ароматический углеводород. Все 6 атомов углерода находятся в sp²-гибридизации в одной плоскости, образуя единое круговое делокализованное электронное облако (ароматический секстет).'
    },
    studentConfusion: {
      en: 'Students think benzene has 3 alternating single and 3 double bonds (Kekulé formula). In reality, all 6 C-C bond lengths are identical (0.140 nm)!',
      ru: 'Школьники думают, что в бензоле чередуются одинарные и двойные связи. Но в реальности все 6 связей абсолютно одинаковы по длине — электроны размазаны по всему кольцу!'
    },
    lifeAnalogy: {
      en: 'A roundabout merry-go-round: electrons do not belong to individual atom pairs, but race around the circle like cars on a racetrack ring.',
      ru: 'Круговой хоровод: шесть человек взялись за руки и кружатся так быстро, что их руки сливаются в один непрерывный светящийся обруч!'
    },
    momentObservation: {
      en: 'Visualize the donut-shaped electron clouds above and below the flat hexagonal carbon skeleton.',
      ru: 'Посмотри на 3D модель бензола: два электромагнитных «бублика» электронной плотности парят сверху и снизу шестиугольного кольца!'
    },
    formula: '\\text{C}_6\\text{H}_6 + \\text{HNO}_3 \\xrightarrow{\\text{H}_2\\text{SO}_4} \\text{C}_6\\text{H}_5\\text{NO}_2 + \\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['benzene', 'aromatic', 'kekule', 'huckel', 'бензол', 'арены', 'ароматичность']
  },
  {
    id: 'ch10_alcohols_esters_polymers',
    grade: 'grade_10',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Oxygen and Nitrogen Organic Compounds', ru: 'Кислород- и азотсодержащие органические соединения' },
    title: { en: 'Alcohols, Carboxylic Acids, Esters, and Polymers', ru: 'Спирты, Карбоновые кислоты, Сложные эфиры, Белки и Полимеры' },
    subtitle: { en: 'Hydrogen bonding in ethanol, esterification smell of fruits, peptide bonds in proteins', ru: 'Функциональные группы (-OH, -COOH, -NH₂), запахи сложных эфиров, полимеризация полиэтилена' },
    textbookDefinition: {
      en: 'Functional groups dictate chemical families. Esterification (Acid + Alcohol ⇄ Ester + H₂O) produces fragrances. Polycondensation of amino acids via peptide bonds (-CO-NH-) builds protein machines.',
      ru: 'Свойства органических молекул определяются функциональными группами: гидроксил (-OH), карбоксил (-COOH), аминогруппа (-NH₂). Реакция этерификации дает сложные эфиры (ароматы фруктов), а сцепка аминокислот пептидной связью создает белки жизни.'
    },
    studentConfusion: {
      en: 'Why ethanol is liquid while ethane is gas (hydrogen bonds between -OH groups).',
      ru: 'Почему этан C₂H₆ — летучий газ, а этанол C₂H₅OH — тяжелая жидкость? Из-за водородных связей между группами -OH молекулы спирта держатся друг за друга как магниты!'
    },
    lifeAnalogy: {
      en: 'Esters give pineapple, pear, and strawberry candies their signature flavor; plastics are repeating freight train cars linked together.',
      ru: 'Аромат груши «Дюшес» или банана — это сложный эфир из спирта и кислоты. А полиэтиленовый пакет — это миллион молекул этилена, сцепленных в бесконечный товарный поезд!'
    },
    momentObservation: {
      en: 'Watch acetic acid and ethanol condense: water splits out, leaving ethyl acetate fruit aroma.',
      ru: 'Смотри на реакцию этерификации: CH₃COOH + C₂H₅OH ⇄ CH₃COOC₂H₅ + H₂O — отщепляется капля воды и рождается аромат спелых яблок!'
    },
    formula: '\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\xrightleftharpoons{\\text{H}^+} \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}',
    viewMode: 'moment_chemical_bond',
    keywords: ['alcohols', 'acids', 'esters', 'polymers', 'proteins', 'спирты', 'кислоты', 'эфиры', 'белки', 'полимеры']
  },

  // =========================================================================
  // 11 КЛАСС — ОБЩАЯ ХИМИЯ
  // =========================================================================
  {
    id: 'ch11_reaction_kinetics_equilibrium',
    grade: 'grade_11',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Chemical Kinetics and Equilibrium', ru: 'Химическая кинетика и равновесие' },
    title: { en: 'Reaction Rate, Catalysis, and Le Chatelier\'s Principle', ru: 'Скорость химических реакций, катализ и Принцип Ле Шателье' },
    subtitle: { en: 'Activation energy, temperature coefficient, and shifting dynamic equilibrium', ru: 'Правило Вант-Гоффа, катализаторы и смещение равновесия при изменении давления, температуры и концентрации' },
    textbookDefinition: {
      en: 'Reaction rate depends on reactant concentrations, temperature, surface area, and catalysts. Le Chatelier\'s Principle: If an external stress is applied to a dynamic equilibrium system, the system shifts to counteract that stress.',
      ru: 'Скорость реакции — изменение концентрации реагирующих веществ в единицу времени. Принцип Ле Шателье: если на систему, находящуюся в устойчивом химическом равновесии, оказать внешнее воздействие (изменить T, p или концентрацию), равновесие сместится в сторону, ослабляющую это воздействие.'
    },
    studentConfusion: {
      en: 'Students think a catalyst changes the equilibrium yield. A catalyst only speeds up both forward and reverse rates equally without shifting equilibrium!',
      ru: 'Главное заблуждение: катализатор НЕ увеличивает выход продукта! Он лишь ускоряет достижение равновесия, снижая барьер энергии активации.'
    },
    lifeAnalogy: {
      en: 'Le Chatelier principle is like an economic market or stubborn human: push it to the right, and it pushes back to the left to restore balance.',
      ru: 'Принцип упрямца: охладишь равновесную смесь — она сместится в сторону выделения тепла (экзотермическую), чтобы согреться! Сожмешь давлением — сместится туда, где меньше молекул газа!'
    },
    momentObservation: {
      en: 'Ammonia synthesis N₂ + 3H₂ ⇄ 2NH₃ + Q: increase pressure to shift equilibrium towards product (4 volumes become 2 volumes).',
      ru: 'Синтез аммиака: подними давление со 100 до 300 атм — равновесие сдвинется вправо (из 4 объемов газа получается 2 объема), и выход аммиака удвоится!'
    },
    formula: '\\text{N}_2(\\text{г}) + 3\\text{H}_2(\\text{г}) \\xrightleftharpoons{} 2\\text{NH}_3(\\text{г}) + 92 \\text{ кДж}',
    viewMode: 'moment_states',
    keywords: ['kinetics', 'equilibrium', 'le chatelier', 'catalyst', 'кинетика', 'равновесие', 'ле шателье', 'катализ']
  },
  {
    id: 'ch11_hydrolysis_salts',
    grade: 'grade_11',
    category: 'chemistry',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Solutions and Hydrolysis', ru: 'Растворы и гидролиз солей' },
    title: { en: 'Hydrolysis of Salts and Solution pH', ru: 'Гидролиз солей: Катионный, анионный и определение pH' },
    subtitle: { en: 'Why table salt solution is neutral, baking soda is basic, and zinc chloride is acidic', ru: 'Взаимодействие ионов соли с водой с образованием слабого электролита, среда раствора' },
    textbookDefinition: {
      en: 'Salt hydrolysis is the reaction of salt ions with water molecules leading to the formation of a weak electrolyte and shifting the pH balance of the solution away from neutrality (pH ≠ 7).',
      ru: 'Гидролиз соли — реакция обменного взаимодействия ионов соли с молекулами воды, приводящая к образованию малодиссоциирующего соединения и изменению кислотности среды (pH < 7 или pH > 7).'
    },
    studentConfusion: {
      en: 'Why does a salt made of no acid and base turn litmus red? (Hydrolysis by cation produces excess H⁺ ions).',
      ru: 'Почему раствор соли CuCl₂ щиплет как кислота и красит лакмус в красный цвет? Потому что катион Cu²⁺ связывает ионы OH⁻ из воды, оставляя свободные кислотные протоны H⁺!'
    },
    lifeAnalogy: {
      en: 'A tug-of-war between weak and strong: the strong parent acid or base dictates the final chemical personality of the salt solution.',
      ru: 'Правило силы: чья сила — того и среда! Соль слабой кислоты и сильного основания (сода Na₂CO₃) имеет щелочную среду (pH > 7), потому что сильный натрий побеждает!'
    },
    momentObservation: {
      en: 'Dip pH meter into AlCl₃ solution: read pH = 3.2 (acidic) due to Al³⁺ + H₂O ⇄ AlOH²⁺ + H⁺.',
      ru: 'Опусти pH-метр в раствор хлорида железа FeCl₃: прибор показывает pH 2.8 — среда сильнокислая из-за гидролиза катиона Fe³⁺!'
    },
    formula: '\\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O} \\xrightleftharpoons{} \\text{CH}_3\\text{COOH} + \\text{OH}^- \\quad (\\text{pH} > 7)',
    viewMode: 'moment_electrolysis',
    keywords: ['hydrolysis', 'salts', 'pH', 'litmus', 'гидролиз', 'соли', 'кислотность', 'среда']
  }
];
