import { section } from './types';

const C = 'chemistry';

export const CHEMISTRY_9 = [
  section(C, 9, 'dissociation', ['Электролитическая диссоциация', 'Electrolytic dissociation'], [
    {
      id: 'c9-electrolytes',
      title: ['Электролиты и неэлектролиты', 'Electrolytes and non-electrolytes'],
      intro: [
        'Растворы одних веществ проводят ток, других — нет. Проводят те, что распадаются в воде на ионы.',
        'Some solutions conduct electricity and some don’t. The ones that conduct break into ions in water.',
      ],
      points: [
        ['Электролиты', 'Electrolytes', 'Соли, кислоты, щёлочи: раствор соли зажигает лампочку в приборе.', 'Salts, acids, alkalis: salt water lights the test bulb.'],
        ['Неэлектролиты', 'Non-electrolytes', 'Сахар, спирт, кислород: молекулы не распадаются на ионы.', 'Sugar, alcohol, oxygen: their molecules don’t split into ions.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c9-mechanism',
      title: ['Механизм диссоциации', 'How dissociation works'],
      intro: [
        'Полярные молекулы воды окружают ионы и растаскивают кристалл на части. Каждый ион оказывается в «шубке» из воды.',
        'Polar water molecules surround the ions and pull the crystal apart, wrapping each ion in a “coat” of water.',
      ],
      points: [
        ['Ионная связь', 'Ionic compounds', 'NaCl: ионы уже есть в кристалле, вода их только разделяет.', 'NaCl: the ions already exist in the crystal; water just separates them.'],
        ['Ковалентная полярная связь', 'Polar covalent compounds', 'HCl: вода сначала превращает полярную связь в ионную, потом разрывает.', 'HCl: water first turns the polar bond ionic, then breaks it.'],
        ['Гидратация ионов', 'Hydration', 'Ионы окружены молекулами воды; поэтому медный купорос в растворе голубой.', 'Ions are surrounded by water molecules, which is why copper sulfate solution is blue.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c9-degree',
      title: ['Степень диссоциации. Сильные и слабые электролиты', 'Degree of dissociation'],
      intro: [
        'Не все молекулы распадаются на ионы. Доля распавшихся — степень диссоциации α.',
        'Not every molecule splits into ions. The share that does is the degree of dissociation, α.',
      ],
      points: [
        ['Сильные электролиты', 'Strong electrolytes', 'α близка к 100%: растворимые соли, щёлочи, HCl, H₂SO₄, HNO₃.', 'α near 100%: soluble salts, alkalis, HCl, H₂SO₄, HNO₃.'],
        ['Слабые электролиты', 'Weak electrolytes', 'α мала: уксусная кислота, H₂S, NH₃·H₂O, вода.', 'α is small: acetic acid, H₂S, NH₃·H₂O, water.'],
      ],
      formula: '\\alpha = \\frac{N_{дисс}}{N_{общ}}',
    },
    {
      id: 'c9-acids-bases-salts',
      title: ['Диссоциация кислот, оснований и солей', 'Dissociation of acids, bases and salts'],
      intro: [
        'Теория электролитической диссоциации даёт новые определения: кислота даёт ионы H⁺, основание — OH⁻.',
        'Dissociation theory gives new definitions: an acid releases H⁺ ions, a base OH⁻.',
      ],
      points: [
        ['Кислоты', 'Acids', 'HCl → H⁺ + Cl⁻. Именно H⁺ делает раствор кислым.', 'HCl → H⁺ + Cl⁻. The H⁺ makes the solution acidic.'],
        ['Основания', 'Bases', 'NaOH → Na⁺ + OH⁻.', 'NaOH → Na⁺ + OH⁻.'],
        ['Соли', 'Salts', 'Na₂SO₄ → 2Na⁺ + SO₄²⁻.', 'Na₂SO₄ → 2Na⁺ + SO₄²⁻.'],
        ['Ступенчатая диссоциация', 'Stepwise dissociation', 'Многоосновные кислоты отщепляют H⁺ по одному: H₃PO₄ → H⁺ + H₂PO₄⁻ → …', 'Polyprotic acids lose H⁺ one at a time: H₃PO₄ → H⁺ + H₂PO₄⁻ → …'],
      ],
      formula: '\\mathrm{H_2SO_4} \\to 2\\mathrm{H^+} + \\mathrm{SO_4^{2-}}',
    },
    {
      id: 'c9-ion-exchange',
      title: ['Реакции ионного обмена', 'Ion-exchange reactions'],
      intro: [
        'В растворах реагируют не молекулы, а ионы. Реакция идёт до конца, только если ионы «уходят» из раствора.',
        'In solution it’s the ions, not molecules, that react. A reaction goes to completion only if ions leave the solution.',
      ],
      points: [
        ['Условия протекания до конца', 'When it goes to completion', 'Образуется осадок, газ или вода.', 'A precipitate, a gas or water forms.'],
        ['Полные и сокращённые уравнения', 'Full and net ionic equations', 'Ионы-«зрители» сокращают: Ba²⁺ + SO₄²⁻ → BaSO₄↓.', 'Spectator ions cancel: Ba²⁺ + SO₄²⁻ → BaSO₄↓.'],
        ['Таблица растворимости', 'Solubility table', 'По ней видно, выпадет ли осадок: Р — растворимо, Н — нет, М — мало.', 'Shows whether a precipitate forms: soluble, insoluble or slightly soluble.'],
      ],
      formula: '\\mathrm{Ba^{2+}} + \\mathrm{SO_4^{2-}} \\to \\mathrm{BaSO_4}\\downarrow',
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c9-ted-classes',
      title: ['Свойства классов с точки зрения ТЭД', 'Classes through dissociation theory'],
      intro: [
        'Общие свойства кислот объясняются ионами H⁺, щелочей — ионами OH⁻. Поэтому все кислоты кислые, а все щёлочи мылкие.',
        'Acids share properties because of H⁺, alkalis because of OH⁻. That’s why all acids are sour and all alkalis soapy.',
      ],
      points: [
        ['Нейтрализация', 'Neutralisation', 'H⁺ + OH⁻ → H₂O — суть любой реакции кислоты со щёлочью.', 'H⁺ + OH⁻ → H₂O is the heart of every acid–alkali reaction.'],
      ],
      formula: '\\mathrm{H^+} + \\mathrm{OH^-} \\to \\mathrm{H_2O}',
    },
    {
      id: 'c9-hydrolysis',
      title: ['Гидролиз солей', 'Salt hydrolysis'],
      intro: [
        'Вода реагирует с ионами слабых кислот и оснований, и раствор соли становится кислым или щелочным.',
        'Water reacts with ions from weak acids and bases, making a salt solution acidic or alkaline.',
      ],
      points: [
        ['Типы солей', 'Kinds of salts', 'Сильное основание + слабая кислота (Na₂CO₃) — среда щелочная. Слабое основание + сильная кислота (ZnCl₂) — кислая.', 'Strong base + weak acid (Na₂CO₃): alkaline. Weak base + strong acid (ZnCl₂): acidic.'],
        ['Без гидролиза', 'No hydrolysis', 'Сильное основание + сильная кислота (NaCl) — среда нейтральная.', 'Strong base + strong acid (NaCl): neutral.'],
        ['Среда раствора', 'pH of the solution', 'Определяют индикатором: раствор соды окрашивает фенолфталеин в малиновый.', 'Found with an indicator: soda solution turns phenolphthalein pink.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
  ]),

  section(C, 9, 'reactions', ['Химические реакции', 'Chemical reactions'], [
    {
      id: 'c9-classification',
      title: ['Классификация реакций', 'Classifying reactions'],
      intro: [
        'Одну и ту же реакцию можно описать по разным признакам: составу, теплоте, обратимости, катализатору, изменению степеней окисления.',
        'One reaction can be classed several ways: by composition, heat, reversibility, catalyst, or change in oxidation states.',
      ],
      points: [
        ['По числу и составу веществ', 'By composition', 'Соединение, разложение, замещение, обмен.', 'Combination, decomposition, displacement, exchange.'],
        ['По тепловому эффекту', 'By heat', 'Экзотермические выделяют тепло (горение), эндотермические поглощают (разложение известняка).', 'Exothermic release heat (burning); endothermic absorb it (decomposing limestone).'],
        ['Обратимые и необратимые', 'Reversible and irreversible', 'Обратимые идут в обе стороны одновременно: N₂ + 3H₂ ⇄ 2NH₃.', 'Reversible ones run both ways at once: N₂ + 3H₂ ⇄ 2NH₃.'],
        ['Каталитические', 'Catalytic', 'Идут с участием катализатора: разложение H₂O₂ с MnO₂.', 'Need a catalyst: H₂O₂ decomposing with MnO₂.'],
        ['ОВР и без изменения степеней', 'Redox or not', 'В ОВР степени окисления меняются, в реакциях обмена — нет.', 'Redox changes oxidation states; exchange reactions don’t.'],
      ],
    },
    {
      id: 'c9-rate',
      title: ['Скорость химической реакции', 'Reaction rate'],
      intro: [
        'Скорость реакции — изменение концентрации за единицу времени. Её можно ускорить или замедлить.',
        'Reaction rate is the change in concentration per unit time, and it can be sped up or slowed down.',
      ],
      points: [
        ['Природа веществ', 'Nature of reactants', 'Калий реагирует с водой бурно, магний — едва заметно.', 'Potassium reacts with water violently, magnesium barely.'],
        ['Концентрация', 'Concentration', 'Чем больше частиц, тем чаще они сталкиваются.', 'More particles means more collisions.'],
        ['Температура', 'Temperature', 'Нагрев на 10 °C ускоряет реакцию в 2–4 раза. Поэтому продукты хранят в холодильнике.', 'Heating by 10 °C speeds it up 2–4 times, which is why we refrigerate food.'],
        ['Площадь соприкосновения', 'Surface area', 'Порошок реагирует быстрее куска: мучная пыль может взорваться.', 'Powder reacts faster than lumps: flour dust can explode.'],
      ],
      sim: { moment: 'moment_states' },
    },
    {
      id: 'c9-catalysis',
      title: ['Катализ', 'Catalysis'],
      intro: [
        'Катализатор ускоряет реакцию, но сам не расходуется. Ингибитор — наоборот, замедляет.',
        'A catalyst speeds up a reaction without being used up. An inhibitor slows it down.',
      ],
      points: [
        ['Катализаторы', 'Catalysts', 'MnO₂ для H₂O₂, платина в автомобильном нейтрализаторе выхлопа.', 'MnO₂ for H₂O₂, platinum in a car’s catalytic converter.'],
        ['Ингибиторы', 'Inhibitors', 'Защищают металл от коррозии, продукты от порчи.', 'Protect metal from corrosion and food from spoiling.'],
        ['Ферменты', 'Enzymes', 'Биологические катализаторы: слюна расщепляет крахмал за секунды.', 'Biological catalysts: saliva breaks down starch in seconds.'],
      ],
    },
    {
      id: 'c9-equilibrium',
      title: ['Химическое равновесие', 'Chemical equilibrium'],
      intro: [
        'В обратимой реакции прямая и обратная реакции идут с равной скоростью — состав смеси перестаёт меняться.',
        'In a reversible reaction the forward and back rates become equal, so the mixture stops changing.',
      ],
      points: [
        ['Принцип Ле Шателье', 'Le Chatelier’s principle', 'Система сопротивляется внешнему воздействию: добавили реагент — равновесие сместится к продуктам.', 'A system resists change: add a reactant and equilibrium shifts toward products.'],
        ['Смещение равновесия', 'Shifting equilibrium', 'Нагрев смещает в сторону эндотермической реакции, давление — в сторону меньшего числа молекул газа.', 'Heating favours the endothermic side; pressure favours fewer gas molecules.'],
      ],
      formula: '\\mathrm{N_2} + 3\\mathrm{H_2} \\rightleftharpoons 2\\mathrm{NH_3} + Q',
    },
  ]),

  section(C, 9, 'nonmetals', ['Неметаллы', 'Non-metals'], [
    {
      id: 'c9-nonmetals-general',
      title: ['Общая характеристика неметаллов', 'Non-metals overview'],
      intro: [
        'Неметаллы собраны в правом верхнем углу таблицы. Их атомы охотно принимают электроны.',
        'Non-metals sit in the top-right of the table. Their atoms readily accept electrons.',
      ],
      points: [
        ['Положение и строение атомов', 'Position and structure', 'Много внешних электронов (4–8), малый радиус.', 'Many outer electrons (4–8) and a small radius.'],
        ['Аллотропия', 'Allotropy', 'Один элемент — разные вещества: O₂ и O₃, алмаз и графит, белый и красный фосфор.', 'One element, different substances: O₂ and O₃, diamond and graphite, white and red phosphorus.'],
      ],
    },
    {
      id: 'c9-halogens',
      title: ['Галогены. Хлор', 'Halogens. Chlorine'],
      intro: [
        'Галогены — самые активные неметаллы. Хлор убивает микробы, поэтому им обеззараживают воду.',
        'Halogens are the most reactive non-metals. Chlorine kills germs, so it’s used to disinfect water.',
      ],
      points: [
        ['Общая характеристика', 'Overview', 'Семь внешних электронов, степень окисления −1. Активность падает от фтора к йоду.', 'Seven outer electrons, oxidation state −1. Reactivity falls from fluorine to iodine.'],
        ['Хлор', 'Chlorine', 'Жёлто-зелёный ядовитый газ. Получают электролизом раствора NaCl.', 'A poisonous yellow-green gas, made by electrolysing brine.'],
        ['Хлороводород и соляная кислота', 'Hydrogen chloride and hydrochloric acid', 'HCl в воде даёт соляную кислоту — она есть и в нашем желудке.', 'HCl in water makes hydrochloric acid, also found in our stomach.'],
        ['Качественная реакция', 'Test', 'Ag⁺ + Cl⁻ → AgCl↓ — белый творожистый осадок.', 'Ag⁺ + Cl⁻ → AgCl↓, a white curdy precipitate.'],
        ['Фтор, бром, йод', 'Fluorine, bromine, iodine', 'Фтор — в зубной пасте, бром — жидкость, йод — антисептик и нужен щитовидной железе.', 'Fluoride is in toothpaste, bromine is a liquid, iodine is an antiseptic and vital for the thyroid.'],
      ],
      formula: '\\mathrm{Ag^+} + \\mathrm{Cl^-} \\to \\mathrm{AgCl}\\downarrow',
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c9-sulfur',
      title: ['Сера и её соединения', 'Sulfur and its compounds'],
      intro: [
        'Сера — жёлтое вещество с множеством соединений: от тухлого запаха сероводорода до серной кислоты — «хлеба химической промышленности».',
        'Sulfur is a yellow solid with many compounds, from foul-smelling hydrogen sulfide to sulfuric acid, the “bread of the chemical industry”.',
      ],
      points: [
        ['Аллотропия и свойства', 'Allotropes and properties', 'Ромбическая, моноклинная, пластическая сера. Горит синим пламенем: S + O₂ → SO₂.', 'Rhombic, monoclinic and plastic sulfur. Burns with a blue flame: S + O₂ → SO₂.'],
        ['Сероводород и сульфиды', 'H₂S and sulfides', 'Газ с запахом тухлых яиц, ядовит. Сульфиды — руды металлов.', 'A toxic gas smelling of rotten eggs. Sulfides are metal ores.'],
        ['SO₂ и сернистая кислота', 'SO₂ and sulfurous acid', 'Вызывает кислотные дожди; соли — сульфиты.', 'Causes acid rain; its salts are sulfites.'],
        ['SO₃ и серная кислота', 'SO₃ and sulfuric acid', 'Концентрированная обугливает сахар и пассивирует железо; производят контактным способом.', 'Concentrated acid chars sugar and passivates iron; made by the contact process.'],
        ['Качественная реакция на сульфат-ион', 'Sulfate test', 'Ba²⁺ + SO₄²⁻ → BaSO₄↓ — белый осадок.', 'Ba²⁺ + SO₄²⁻ → BaSO₄↓, a white precipitate.'],
      ],
      formula: '2\\mathrm{SO_2} + \\mathrm{O_2} \\rightleftharpoons 2\\mathrm{SO_3}',
    },
    {
      id: 'c9-nitrogen',
      title: ['Азот и его соединения', 'Nitrogen and its compounds'],
      intro: [
        'Азот — основа воздуха и белков. Сам он инертен, но его соединения — от аммиака до азотной кислоты — очень активны.',
        'Nitrogen makes up most of the air and all proteins. Itself inert, its compounds from ammonia to nitric acid are very reactive.',
      ],
      points: [
        ['Свойства азота', 'Nitrogen', 'Тройная связь N≡N очень прочная, поэтому азот малоактивен.', 'The N≡N triple bond is very strong, so nitrogen is unreactive.'],
        ['Аммиак', 'Ammonia', 'NH₃ — газ с резким запахом (нашатырь). Получают синтезом из N₂ и H₂ под давлением.', 'NH₃, a pungent gas (smelling salts), made from N₂ and H₂ under pressure.'],
        ['Соли аммония', 'Ammonium salts', 'Качественная реакция: со щёлочью при нагреве выделяется аммиак.', 'Test: heated with alkali they release ammonia.'],
        ['Оксиды азота', 'Nitrogen oxides', 'NO₂ — бурый «лисий хвост» выхлопов.', 'NO₂ is the brown “fox tail” of exhaust.'],
        ['Азотная кислота и нитраты', 'Nitric acid and nitrates', 'Сильный окислитель: с металлами водород не выделяет. Нитраты — удобрения.', 'A strong oxidiser that releases no hydrogen with metals. Nitrates are fertilisers.'],
      ],
      formula: '\\mathrm{N_2} + 3\\mathrm{H_2} \\rightleftharpoons 2\\mathrm{NH_3}',
    },
    {
      id: 'c9-phosphorus',
      title: ['Фосфор', 'Phosphorus'],
      intro: [
        'Фосфор нужен для костей, ДНК и АТФ, а фосфаты — главное удобрение после азота.',
        'Phosphorus is needed for bones, DNA and ATP; phosphates are the key fertiliser after nitrogen.',
      ],
      points: [
        ['Аллотропия', 'Allotropes', 'Белый фосфор светится в темноте и ядовит, красный — безопасен (спичечные коробки).', 'White phosphorus glows and is toxic; red is safe (matchboxes).'],
        ['P₂O₅ и фосфорная кислота', 'P₂O₅ and phosphoric acid', 'H₃PO₄ — средней силы, есть в газировке.', 'H₃PO₄ is moderately strong and found in fizzy drinks.'],
        ['Минеральные удобрения', 'Fertilisers', 'Азотные, фосфорные, калийные — три главных элемента питания растений.', 'Nitrogen, phosphorus and potassium: the three main plant nutrients.'],
      ],
    },
    {
      id: 'c9-carbon',
      title: ['Углерод и его соединения', 'Carbon and its compounds'],
      intro: [
        'Углерод образует самые разные вещества: от мягкого графита до твёрдого алмаза — и основу всей органики.',
        'Carbon forms wildly different substances, from soft graphite to hard diamond, and is the basis of organic chemistry.',
      ],
      points: [
        ['Аллотропия', 'Allotropes', 'Алмаз, графит, фуллерен, графен — разное расположение одних и тех же атомов.', 'Diamond, graphite, fullerene, graphene: the same atoms arranged differently.'],
        ['Адсорбция', 'Adsorption', 'Активированный уголь удерживает на поверхности газы и примеси — так работают противогазы и фильтры.', 'Activated charcoal holds gases and impurities on its surface, as in gas masks and filters.'],
        ['CO и CO₂', 'CO and CO₂', 'Угарный газ ядовит, связывает гемоглобин; углекислый — продукт дыхания и горения.', 'Carbon monoxide is toxic, binding haemoglobin; CO₂ is a product of breathing and burning.'],
        ['Карбонаты', 'Carbonates', 'Мел, мрамор, сода. Качественная реакция: с кислотой «вскипают» от CO₂.', 'Chalk, marble, soda. Test: they fizz with acid, releasing CO₂.'],
        ['Круговорот углерода', 'Carbon cycle', 'Растения забирают CO₂, животные и горение возвращают его в воздух.', 'Plants take in CO₂; animals and burning return it to the air.'],
      ],
      formula: '\\mathrm{CaCO_3} + 2\\mathrm{HCl} \\to \\mathrm{CaCl_2} + \\mathrm{H_2O} + \\mathrm{CO_2}\\uparrow',
    },
    {
      id: 'c9-silicon',
      title: ['Кремний. Силикатная промышленность', 'Silicon. The silicate industry'],
      intro: [
        'Кремний — второй по распространённости элемент коры. Из его соединений делают стекло, цемент, керамику и микросхемы.',
        'Silicon is the second most common element in the crust. Its compounds give us glass, cement, ceramics and chips.',
      ],
      points: [
        ['Кремний', 'Silicon', 'Полупроводник — основа электроники и солнечных батарей.', 'A semiconductor, the basis of electronics and solar panels.'],
        ['Оксид и кислота', 'Oxide and acid', 'SiO₂ — песок и кварц. Кремниевая кислота нерастворима, её соли — силикаты.', 'SiO₂ is sand and quartz. Silicic acid is insoluble; its salts are silicates.'],
        ['Стекло, цемент, керамика', 'Glass, cement, ceramics', 'Стекло — сплав песка, соды и известняка; цемент — обожжённые глина и известняк.', 'Glass is fused sand, soda and limestone; cement is fired clay and limestone.'],
      ],
    },
  ]),

  section(C, 9, 'metals', ['Металлы', 'Metals'], [
    {
      id: 'c9-metals-general',
      title: ['Общая характеристика металлов', 'Metals overview'],
      intro: [
        'Металлов в таблице больше 80%. Их атомы легко отдают внешние электроны — отсюда и все свойства.',
        'Over 80% of elements are metals. Their atoms easily give up outer electrons, and that explains all their properties.',
      ],
      points: [
        ['Положение и строение', 'Position and structure', 'Мало внешних электронов (1–3), большой радиус.', 'Few outer electrons (1–3) and a large radius.'],
        ['Металлическая связь и свойства', 'Metallic bond and properties', 'Блеск, ковкость, тепло- и электропроводность.', 'Lustre, malleability, conduction of heat and electricity.'],
        ['Ряд напряжений', 'Activity series', 'Li K Ca Na Mg Al Zn Fe … H … Cu Ag Au: левые вытесняют правые из растворов солей.', 'Li K Ca Na Mg Al Zn Fe … H … Cu Ag Au: each displaces those to its right from salt solutions.'],
      ],
    },
    {
      id: 'c9-metallurgy',
      title: ['Получение металлов. Сплавы. Коррозия', 'Making metals. Alloys. Corrosion'],
      intro: [
        'Металлы добывают из руд, восстанавливая их. Чтобы улучшить свойства, их сплавляют, а от ржавчины защищают.',
        'Metals are extracted by reducing their ores, improved by alloying and protected from rust.',
      ],
      points: [
        ['Пирометаллургия', 'Pyrometallurgy', 'Восстановление при высокой температуре углём или CO: так получают железо.', 'Reduction with coal or CO at high temperature, as for iron.'],
        ['Гидрометаллургия', 'Hydrometallurgy', 'Растворение руды и вытеснение металла из раствора.', 'Dissolving the ore and displacing the metal from solution.'],
        ['Электрометаллургия', 'Electrometallurgy', 'Электролиз расплавов: так получают алюминий и натрий.', 'Electrolysing melts, as for aluminium and sodium.'],
        ['Сплавы', 'Alloys', 'Сталь, бронза, латунь, дюралюминий — прочнее и полезнее чистых металлов.', 'Steel, bronze, brass, duralumin: stronger and more useful than pure metals.'],
        ['Коррозия и защита', 'Corrosion and protection', 'Краска, смазка, оцинковка, нержавеющие сплавы.', 'Paint, grease, galvanising, stainless alloys.'],
      ],
      sim: { moment: 'moment_electrolysis' },
    },
    {
      id: 'c9-alkali',
      title: ['Щелочные и щёлочноземельные металлы', 'Alkali and alkaline-earth metals'],
      intro: [
        'Натрий и калий режутся ножом и хранятся под керосином. Кальций и магний активны меньше, но тоже важны.',
        'Sodium and potassium cut with a knife and are stored under kerosene. Calcium and magnesium are less reactive but just as important.',
      ],
      points: [
        ['Натрий и калий', 'Sodium and potassium', 'Бурно реагируют с водой. NaCl — пищевая соль, KNO₃ — удобрение.', 'React violently with water. NaCl is table salt, KNO₃ fertiliser.'],
        ['Кальций и магний', 'Calcium and magnesium', 'Кальций — в костях и меле, магний — в хлорофилле.', 'Calcium is in bones and chalk; magnesium in chlorophyll.'],
        ['Жёсткость воды', 'Hard water', 'Ионы Ca²⁺ и Mg²⁺ дают накипь. Устраняют кипячением, содой или ионообменными фильтрами.', 'Ca²⁺ and Mg²⁺ cause limescale; removed by boiling, soda or ion-exchange filters.'],
      ],
    },
    {
      id: 'c9-aluminium',
      title: ['Алюминий', 'Aluminium'],
      intro: [
        'Алюминий лёгкий и не ржавеет, хотя очень активен: его защищает тонкая плёнка оксида.',
        'Aluminium is light and doesn’t rust, despite being reactive: a thin oxide film protects it.',
      ],
      points: [
        ['Амфотерность', 'Amphoterism', 'Al₂O₃ и Al(OH)₃ реагируют и с кислотами, и со щелочами.', 'Al₂O₃ and Al(OH)₃ react with acids and alkalis alike.'],
        ['Применение', 'Uses', 'Самолёты, провода, банки, фольга.', 'Aircraft, power cables, cans, foil.'],
      ],
    },
    {
      id: 'c9-iron',
      title: ['Железо. Чугун и сталь', 'Iron. Cast iron and steel'],
      intro: [
        'Железо — главный металл цивилизации. Оно образует соединения в двух степенях окисления: +2 и +3.',
        'Iron is civilisation’s main metal, forming compounds in two oxidation states, +2 and +3.',
      ],
      points: [
        ['Свойства', 'Properties', 'Притягивается магнитом, ржавеет во влажном воздухе.', 'Magnetic, and rusts in moist air.'],
        ['Fe²⁺ и Fe³⁺', 'Fe²⁺ and Fe³⁺', 'Fe(OH)₂ — зеленоватый, Fe(OH)₃ — бурый. Качественные реакции: красная кровяная соль даёт синий осадок с Fe²⁺, роданид — кроваво-красный цвет с Fe³⁺.', 'Fe(OH)₂ is greenish, Fe(OH)₃ brown. Tests: ferricyanide gives a blue precipitate with Fe²⁺; thiocyanate turns blood-red with Fe³⁺.'],
        ['Чугун и сталь', 'Cast iron and steel', 'Чугун — больше 2% углерода, хрупкий; сталь — меньше 2%, прочная и упругая.', 'Cast iron has over 2% carbon and is brittle; steel under 2% and is tough.'],
      ],
    },
  ]),

  section(C, 9, 'organic-intro', ['Начальные сведения об органических веществах', 'Introduction to organic chemistry'], [
    {
      id: 'c9-organic-features',
      title: ['Особенности органических веществ', 'What makes a substance organic'],
      intro: [
        'Органические вещества — соединения углерода. Их миллионы, потому что атомы углерода соединяются в цепи и кольца.',
        'Organic substances are carbon compounds. There are millions because carbon atoms link into chains and rings.',
      ],
      points: [
        ['Теория строения Бутлерова', 'Butlerov’s theory', 'Свойства зависят не только от состава, но и от порядка соединения атомов.', 'Properties depend not just on composition but on how atoms are linked.'],
      ],
      sim: { moment: 'moment_chemical_bond' },
    },
    {
      id: 'c9-hydrocarbons',
      title: ['Углеводороды', 'Hydrocarbons'],
      intro: [
        'Углеводороды — вещества только из углерода и водорода. Это природный газ, нефть, бензин.',
        'Hydrocarbons contain only carbon and hydrogen: natural gas, oil, petrol.',
      ],
      points: [
        ['Предельные', 'Saturated', 'Метан CH₄, этан C₂H₆ — только одинарные связи, горят и используются как топливо.', 'Methane CH₄ and ethane C₂H₆: single bonds only, burned as fuel.'],
        ['Непредельные', 'Unsaturated', 'Этилен C₂H₄ (двойная связь) и ацетилен C₂H₂ (тройная) — активнее, обесцвечивают бромную воду.', 'Ethylene C₂H₄ (double bond) and acetylene C₂H₂ (triple) are more reactive and decolourise bromine water.'],
      ],
      sim: { lab: 'deconstruction' },
    },
    {
      id: 'c9-alcohols-acids',
      title: ['Спирты и карбоновые кислоты', 'Alcohols and carboxylic acids'],
      intro: [
        'Добавь к углеводороду группу −OH — получится спирт, группу −COOH — кислота.',
        'Add an −OH group to a hydrocarbon to get an alcohol, a −COOH group to get an acid.',
      ],
      points: [
        ['Метанол, этанол, глицерин', 'Methanol, ethanol, glycerol', 'Метанол ядовит, этанол — в напитках и антисептиках, глицерин — в кремах.', 'Methanol is poisonous, ethanol is in drinks and sanitisers, glycerol in creams.'],
        ['Уксусная кислота', 'Acetic acid', 'CH₃COOH — слабая кислота, в разбавленном виде — пищевой уксус.', 'CH₃COOH is a weak acid; diluted, it’s vinegar.'],
      ],
    },
    {
      id: 'c9-biomolecules',
      title: ['Жиры, углеводы, белки. Полимеры', 'Fats, carbohydrates, proteins. Polymers'],
      intro: [
        'Из органических веществ построены живые организмы и множество материалов вокруг нас.',
        'Living things and many everyday materials are built from organic substances.',
      ],
      points: [
        ['Жиры', 'Fats', 'Запас энергии и строительный материал клеточных мембран.', 'Energy stores and building material for cell membranes.'],
        ['Углеводы', 'Carbohydrates', 'Глюкоза — топливо клеток, крахмал — запас у растений, целлюлоза — стенки клеток.', 'Glucose fuels cells, starch is plants’ store, cellulose builds cell walls.'],
        ['Белки', 'Proteins', 'Ферменты, мышцы, антитела — всё это белки.', 'Enzymes, muscles and antibodies are all proteins.'],
        ['Полиэтилен', 'Polyethylene', 'Тысячи молекул этилена, сцепленные в цепь: пакеты и плёнки.', 'Thousands of ethylene molecules linked into chains: bags and films.'],
      ],
      sim: { moment: 'moment_dna' },
    },
  ]),
];
