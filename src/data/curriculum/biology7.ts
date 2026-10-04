import { section } from './types';

const B = 'biology';

export const BIOLOGY_7 = [
  section(B, 7, 'general', ['Общие сведения о животных', 'Animals: an overview'], [
    {
      id: 'b7-zoology',
      title: ['Зоология. Отличия животных от растений', 'Zoology. Animals vs plants'],
      intro: [
        'Зоология изучает около 2 миллионов видов животных. Главное отличие от растений — способ питания.',
        'Zoology covers about 2 million animal species. The key difference from plants is how they feed.',
      ],
      points: [
        ['Питание', 'Feeding', 'Животные питаются готовыми органическими веществами, растения создают их сами.', 'Animals eat ready-made organic matter; plants make their own.'],
        ['Движение и рост', 'Movement and growth', 'Большинство животных подвижны и растут только до определённого возраста.', 'Most animals move and stop growing at a certain age.'],
        ['Клетка', 'Cells', 'Нет клеточной стенки и хлоропластов, запасное вещество — гликоген, а не крахмал.', 'No cell wall or chloroplasts; they store glycogen, not starch.'],
      ],
    },
    {
      id: 'b7-body-classification',
      title: ['Строение тела. Классификация', 'Body organisation. Classification'],
      intro: [
        'Тело животного построено по уровням: клетки → ткани → органы → системы органов → организм.',
        'An animal body is built in levels: cells → tissues → organs → organ systems → organism.',
      ],
      points: [
        ['Системы органов', 'Organ systems', 'Опорно-двигательная, пищеварительная, дыхательная, кровеносная, выделительная, нервная, половая.', 'Skeletal-muscular, digestive, respiratory, circulatory, excretory, nervous and reproductive.'],
        ['Систематические категории', 'Ranks', 'Вид → род → семейство → отряд → класс → тип → царство.', 'Species → genus → family → order → class → phylum → kingdom.'],
      ],
    },
  ]),

  section(B, 7, 'protists', ['Простейшие', 'Protists'], [
    {
      id: 'b7-protists-general',
      title: ['Общая характеристика простейших', 'Protists overview'],
      intro: [
        'Простейшие — целый организм в одной клетке: она сама питается, двигается, дышит и размножается.',
        'A protist is a whole organism in one cell that feeds, moves, breathes and reproduces on its own.',
      ],
      points: [
        ['Органоиды', 'Organelles', 'Сократительная вакуоль откачивает лишнюю воду, пищеварительная — переваривает пищу.', 'A contractile vacuole pumps out excess water; a food vacuole digests food.'],
        ['Цисты', 'Cysts', 'В плохих условиях простейшее покрывается плотной оболочкой и «засыпает».', 'In bad times a protist wraps itself in a tough coat and lies dormant.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b7-amoeba',
      title: ['Саркодовые. Амёба', 'Sarcodines. The amoeba'],
      intro: [
        'Амёба не имеет постоянной формы и двигается, перетекая на ложноножках.',
        'An amoeba has no fixed shape and moves by flowing on false feet.',
      ],
      points: [
        ['Передвижение и питание', 'Movement and feeding', 'Ложноножки обхватывают пищу — образуется пищеварительная вакуоль (фагоцитоз).', 'False feet wrap round food, forming a food vacuole (phagocytosis).'],
        ['Размножение', 'Reproduction', 'Делится надвое: сначала ядро, потом цитоплазма.', 'Splits in two: nucleus first, then cytoplasm.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b7-flagellates',
      title: ['Жгутиконосцы. Эвглена', 'Flagellates. Euglena'],
      intro: [
        'Эвглена зелёная — пограничный организм: на свету фотосинтезирует как растение, в темноте питается как животное.',
        'Green euglena sits on the border: it photosynthesises in light like a plant and feeds like an animal in the dark.',
      ],
      points: [
        ['Строение', 'Structure', 'Жгутик, светочувствительный глазок, хлоропласты.', 'A flagellum, a light-sensitive eyespot, chloroplasts.'],
        ['Колониальные формы', 'Colonies', 'Вольвокс — шар из тысяч клеток: шаг к многоклеточности.', 'Volvox is a ball of thousands of cells, a step toward multicellular life.'],
      ],
    },
    {
      id: 'b7-ciliates',
      title: ['Инфузории. Паразитические простейшие', 'Ciliates. Parasitic protists'],
      intro: [
        'Инфузория-туфелька — самое сложно устроенное простейшее. Некоторые простейшие — опасные паразиты.',
        'The slipper-shaped paramecium is the most complex protist. Some protists are dangerous parasites.',
      ],
      points: [
        ['Инфузория-туфелька', 'Paramecium', 'Покрыта ресничками, имеет «рот», два ядра, размножается и половым путём.', 'Covered in cilia, with a “mouth” and two nuclei; it can also reproduce sexually.'],
        ['Малярийный плазмодий', 'Malaria parasite', 'Переносится комаром, разрушает эритроциты.', 'Spread by mosquitoes, it destroys red blood cells.'],
        ['Дизентерийная амёба', 'Dysentery amoeba', 'Попадает с грязной водой и разрушает стенку кишечника.', 'Enters with dirty water and damages the gut wall.'],
        ['Значение простейших', 'Importance', 'Основа пищевых цепей в воде, образование мела и известняка.', 'The base of aquatic food chains; they formed chalk and limestone.'],
      ],
    },
  ]),

  section(B, 7, 'invertebrates', ['Многоклеточные беспозвоночные', 'Invertebrates'], [
    {
      id: 'b7-cnidarians',
      title: ['Кишечнополостные', 'Cnidarians'],
      intro: [
        'Первые многоклеточные с тканями. Тело — мешок с одним отверстием, вокруг которого щупальца.',
        'The first animals with tissues: a body sac with one opening ringed by tentacles.',
      ],
      points: [
        ['Гидра', 'Hydra', 'Лучевая симметрия, два слоя клеток, стрекательные клетки «выстреливают» ядом.', 'Radial symmetry, two cell layers, stinging cells that fire venom.'],
        ['Регенерация', 'Regeneration', 'Из кусочка гидры вырастает целая гидра.', 'A whole hydra regrows from a small piece.'],
        ['Медузы и коралловые полипы', 'Jellyfish and corals', 'Коралловые рифы — постройки из известковых скелетов миллионов полипов.', 'Coral reefs are built from the limestone skeletons of millions of polyps.'],
      ],
    },
    {
      id: 'b7-flatworms',
      title: ['Плоские черви', 'Flatworms'],
      intro: [
        'У плоских червей впервые появляются двусторонняя симметрия и органы. Многие — паразиты со сложным жизненным циклом.',
        'Flatworms are the first with bilateral symmetry and organs. Many are parasites with complex life cycles.',
      ],
      points: [
        ['Планария', 'Planarian', 'Свободноживущий червь, тоже умеет регенерировать.', 'A free-living worm that can also regenerate.'],
        ['Печёночный сосальщик и бычий цепень', 'Liver fluke and beef tapeworm', 'Паразитируют в печени и кишечнике, цепень достигает 10 м.', 'Live in the liver and gut; the tapeworm reaches 10 m.'],
        ['Смена хозяев', 'Changing hosts', 'Цепень живёт в корове (промежуточный хозяин) и в человеке (основной). Защита — хорошо прожаренное мясо.', 'The tapeworm lives in cattle (intermediate host) and humans (final host). Defence: well-cooked meat.'],
      ],
    },
    {
      id: 'b7-roundworms',
      title: ['Круглые черви', 'Roundworms'],
      intro: [
        'Тело круглое в сечении, есть сквозная пищеварительная система — рот и анальное отверстие.',
        'Round in cross-section, with a through-gut from mouth to anus.',
      ],
      points: [
        ['Аскарида и острица', 'Roundworm and pinworm', 'Паразиты кишечника человека, яйца попадают с немытыми руками и овощами.', 'Gut parasites; eggs enter on unwashed hands and vegetables.'],
        ['Профилактика', 'Prevention', 'Мыть руки, овощи, фрукты, кипятить воду.', 'Wash hands and produce, boil water.'],
      ],
    },
    {
      id: 'b7-annelids',
      title: ['Кольчатые черви', 'Segmented worms'],
      intro: [
        'Тело из колец-сегментов. Появляются замкнутая кровеносная система и брюшная нервная цепочка.',
        'A body of ring segments, with a closed circulatory system and a ventral nerve cord.',
      ],
      points: [
        ['Дождевой червь', 'Earthworm', 'Рыхлит и удобряет почву, дышит всей поверхностью кожи.', 'Loosens and enriches soil, breathing through its skin.'],
        ['Кровеносная система', 'Circulation', 'Спинной и брюшной сосуды, пульсирующие «сердца» — кольцевые сосуды.', 'Dorsal and ventral vessels with pulsing ring vessels as “hearts”.'],
        ['Многообразие', 'Diversity', 'Многощетинковые (нереис), малощетинковые (дождевой червь), пиявки (лечебная пиявка).', 'Polychaetes (ragworm), oligochaetes (earthworm), leeches (medicinal leech).'],
      ],
    },
    {
      id: 'b7-molluscs',
      title: ['Моллюски', 'Molluscs'],
      intro: [
        'Мягкотелые животные, часто с раковиной. От улитки до самого умного беспозвоночного — осьминога.',
        'Soft-bodied animals, often with shells, from snails to the cleverest invertebrate, the octopus.',
      ],
      points: [
        ['Строение', 'Structure', 'Тело, нога, мантия, которая выделяет раковину.', 'Body, foot and a mantle that makes the shell.'],
        ['Брюхоногие', 'Gastropods', 'Прудовик, слизень — ползают на ноге, у многих спиральная раковина.', 'Pond snail, slug: crawl on a foot, often with a spiral shell.'],
        ['Двустворчатые', 'Bivalves', 'Беззубка, мидия — фильтруют воду, некоторые образуют жемчуг.', 'Freshwater mussel, mussel: filter water, some make pearls.'],
        ['Головоногие', 'Cephalopods', 'Осьминог, кальмар — реактивное движение, крупный мозг, меняют цвет.', 'Octopus, squid: jet propulsion, big brains, colour change.'],
      ],
    },
    {
      id: 'b7-crustaceans-arachnids',
      title: ['Ракообразные и паукообразные', 'Crustaceans and arachnids'],
      intro: [
        'Членистоногие одеты в хитиновый наружный скелет и имеют членистые ноги. Это самый многочисленный тип животных.',
        'Arthropods wear a chitin exoskeleton and have jointed legs. They’re the largest animal phylum.',
      ],
      points: [
        ['Речной рак', 'Crayfish', 'Головогрудь и брюшко, 5 пар ходильных ног, дышит жабрами. Растёт, сбрасывая панцирь.', 'Cephalothorax and abdomen, 5 pairs of legs, gills. Grows by moulting.'],
        ['Паук-крестовик', 'Garden spider', '8 ног, паутинные бородавки, внекишечное пищеварение.', 'Eight legs, silk spinnerets, digestion outside the body.'],
        ['Клещи', 'Ticks', 'Энцефалитный клещ переносит опасный вирус. После леса нужно осматривать себя.', 'Ticks carry encephalitis virus, so check yourself after walking in woods.'],
      ],
    },
    {
      id: 'b7-insects',
      title: ['Насекомые', 'Insects'],
      intro: [
        'Насекомых больше, чем всех остальных животных вместе. У них три отдела тела, шесть ног и часто крылья.',
        'Insects outnumber all other animals combined. They have three body parts, six legs and often wings.',
      ],
      points: [
        ['Внешнее строение', 'External structure', 'Голова, грудь, брюшко; усики, сложные глаза, ротовой аппарат разного типа.', 'Head, thorax, abdomen; antennae, compound eyes, varied mouthparts.'],
        ['Внутреннее строение', 'Internal structure', 'Дыхание трахеями, незамкнутая кровеносная система.', 'Breathing through tracheae; an open circulatory system.'],
        ['Полное и неполное превращение', 'Complete and incomplete metamorphosis', 'Бабочка: яйцо → гусеница → куколка → бабочка. Кузнечик: яйцо → личинка, похожая на взрослого → взрослый.', 'Butterfly: egg → caterpillar → pupa → adult. Grasshopper: egg → nymph like the adult → adult.'],
        ['Отряды', 'Orders', 'Жесткокрылые (жуки), чешуекрылые (бабочки), перепончатокрылые (пчёлы), двукрылые (мухи).', 'Beetles, butterflies and moths, bees and wasps, true flies.'],
        ['Общественные насекомые', 'Social insects', 'Пчёлы, муравьи, термиты: семья с разделением труда.', 'Bees, ants, termites: colonies with division of labour.'],
        ['Вредители и переносчики', 'Pests and vectors', 'Колорадский жук, саранча, малярийный комар.', 'Colorado beetle, locusts, malaria mosquitoes.'],
      ],
    },
  ]),

  section(B, 7, 'chordates', ['Хордовые', 'Chordates'], [
    {
      id: 'b7-chordates',
      title: ['Общая характеристика хордовых', 'Chordates overview'],
      intro: [
        'У всех хордовых хотя бы на стадии зародыша есть хорда — упругий стержень вдоль спины. У позвоночных её сменяет позвоночник.',
        'Every chordate has a notochord, a flexible rod along the back, at least as an embryo. In vertebrates a spine replaces it.',
      ],
      points: [
        ['Три признака', 'Three hallmarks', 'Хорда, нервная трубка над ней, жаберные щели в глотке.', 'A notochord, a nerve tube above it, gill slits in the throat.'],
        ['Ланцетник', 'Lancelet', 'Хорда сохраняется всю жизнь — «живая модель» предка позвоночных.', 'Keeps its notochord for life, a living model of vertebrate ancestors.'],
      ],
    },
    {
      id: 'b7-fish',
      title: ['Рыбы', 'Fish'],
      intro: [
        'Рыбы — первые позвоночные, полностью приспособленные к жизни в воде.',
        'Fish were the first vertebrates, fully adapted to life in water.',
      ],
      points: [
        ['Внешнее строение', 'External features', 'Обтекаемое тело, чешуя со слизью, плавники, боковая линия чувствует течения.', 'Streamlined body, slimy scales, fins and a lateral line that senses currents.'],
        ['Внутреннее строение', 'Internal structure', 'Двухкамерное сердце, жабры, плавательный пузырь.', 'Two-chambered heart, gills, swim bladder.'],
        ['Размножение', 'Reproduction', 'Нерест: самка мечет икру, самец её оплодотворяет.', 'Spawning: the female lays eggs and the male fertilises them.'],
        ['Хрящевые и костные', 'Cartilaginous and bony', 'Акулы и скаты — хрящевые, окунь и карп — костные.', 'Sharks and rays are cartilaginous; perch and carp bony.'],
        ['Промысел и охрана', 'Fishing and conservation', 'Запреты в нерест, рыбоводные заводы. В Иссык-Куле охраняют эндемиков.', 'Spawning bans and hatcheries; Issyk-Kul protects its endemic fish.'],
      ],
    },
    {
      id: 'b7-amphibians',
      title: ['Земноводные', 'Amphibians'],
      intro: [
        'Земноводные первыми вышли на сушу, но размножаются всё ещё в воде.',
        'Amphibians were first onto land but still breed in water.',
      ],
      points: [
        ['Строение', 'Structure', 'Трёхкамерное сердце, лёгкие и дыхание влажной кожей.', 'Three-chambered heart, lungs and breathing through moist skin.'],
        ['Метаморфоз лягушки', 'Frog metamorphosis', 'Икра → головастик с жабрами и хвостом → лягушонок с лёгкими → лягушка.', 'Spawn → tadpole with gills and tail → froglet with lungs → frog.'],
        ['Хвостатые и бесхвостые', 'Tailed and tailless', 'Тритоны и саламандры против лягушек и жаб.', 'Newts and salamanders versus frogs and toads.'],
      ],
    },
    {
      id: 'b7-reptiles',
      title: ['Пресмыкающиеся', 'Reptiles'],
      intro: [
        'Пресмыкающиеся окончательно покорили сушу: сухая кожа с чешуёй и яйца в плотной оболочке.',
        'Reptiles truly conquered land: dry scaly skin and eggs with tough shells.',
      ],
      points: [
        ['Приспособления к суше', 'Land adaptations', 'Роговые чешуи защищают от высыхания, дышат только лёгкими.', 'Horny scales stop drying out; they breathe only with lungs.'],
        ['Размножение', 'Reproduction', 'Внутреннее оплодотворение, яйца с запасом воды и пищи.', 'Internal fertilisation; eggs carry their own water and food.'],
        ['Отряды', 'Groups', 'Чешуйчатые (ящерицы, змеи), черепахи, крокодилы.', 'Lizards and snakes, turtles, crocodiles.'],
        ['Древние рептилии', 'Ancient reptiles', 'Динозавры господствовали 160 млн лет и вымерли 66 млн лет назад.', 'Dinosaurs ruled for 160 million years and died out 66 million years ago.'],
      ],
    },
    {
      id: 'b7-birds',
      title: ['Птицы', 'Birds'],
      intro: [
        'Птицы — летающие теплокровные потомки динозавров. Всё в их теле подчинено полёту.',
        'Birds are flying, warm-blooded descendants of dinosaurs, with bodies built for flight.',
      ],
      points: [
        ['Приспособления к полёту', 'Built for flight', 'Перья, полые кости, киль для мышц, воздушные мешки и двойное дыхание.', 'Feathers, hollow bones, a keel for flight muscles, air sacs and double breathing.'],
        ['Теплокровность', 'Warm blood', 'Четырёхкамерное сердце и постоянная температура тела ~41 °C.', 'A four-chambered heart and a steady ~41 °C body temperature.'],
        ['Размножение', 'Reproduction', 'Гнёзда; выводковые птенцы (курица) сразу бегают, птенцовые (голубь) — беспомощны.', 'Nests; precocial chicks (hens) run at once, altricial ones (pigeons) are helpless.'],
        ['Перелёты', 'Migration', 'Осенью многие улетают на юг, ориентируясь по солнцу, звёздам и магнитному полю.', 'Many fly south in autumn, steering by sun, stars and magnetic field.'],
        ['Экологические группы', 'Ecological groups', 'Лесные, водоплавающие, хищные, степные.', 'Forest, water, birds of prey, steppe birds.'],
        ['Домашние птицы', 'Poultry', 'Куры, утки, гуси, индейки.', 'Chickens, ducks, geese, turkeys.'],
      ],
    },
    {
      id: 'b7-mammals',
      title: ['Млекопитающие', 'Mammals'],
      intro: [
        'Млекопитающие выкармливают детёнышей молоком, покрыты шерстью и имеют самый развитый мозг.',
        'Mammals feed their young on milk, have fur and the most developed brains.',
      ],
      points: [
        ['Общая характеристика', 'Features', 'Шерсть, потовые и сальные железы, дифференцированные зубы, диафрагма.', 'Fur, sweat and oil glands, specialised teeth, a diaphragm.'],
        ['Внутреннее строение', 'Internal structure', 'Четырёхкамерное сердце, крупный мозг с корой.', 'A four-chambered heart and a large brain with a cortex.'],
        ['Первозвери, сумчатые, плацентарные', 'Monotremes, marsupials, placentals', 'Утконос откладывает яйца, кенгуру вынашивает в сумке, остальные — в матке с плацентой.', 'The platypus lays eggs, the kangaroo carries young in a pouch, the rest in a womb with a placenta.'],
        ['Отряды', 'Orders', 'Насекомоядные, рукокрылые, грызуны, зайцеобразные, хищные, ластоногие, китообразные, парно- и непарнокопытные, приматы.', 'Insectivores, bats, rodents, rabbits, carnivores, seals, whales, even- and odd-toed ungulates, primates.'],
        ['Домашние млекопитающие', 'Domestic mammals', 'Лошадь, корова, овца, як — основа хозяйства в Кыргызстане.', 'Horses, cattle, sheep and yaks, the backbone of farming in Kyrgyzstan.'],
      ],
    },
  ]),

  section(B, 7, 'evolution', ['Эволюция животного мира', 'Evolution of animals'], [
    {
      id: 'b7-evidence',
      title: ['Доказательства эволюции', 'Evidence of evolution'],
      intro: [
        'Животные менялись миллионы лет. Об этом говорят окаменелости, развитие зародышей и сходство строения.',
        'Animals changed over millions of years, as fossils, embryo development and shared anatomy show.',
      ],
      points: [
        ['Палеонтологические', 'Fossils', 'Археоптерикс — переходная форма между пресмыкающимися и птицами.', 'Archaeopteryx is a transitional form between reptiles and birds.'],
        ['Эмбриологические', 'Embryological', 'Зародыши рыб, ящериц и людей на ранних стадиях очень похожи, у всех есть жаберные щели.', 'Early fish, lizard and human embryos look alike and all have gill slits.'],
        ['Сравнительно-анатомические', 'Comparative anatomy', 'Рука человека, крыло летучей мыши и ласт кита построены из тех же костей.', 'A human arm, a bat wing and a whale flipper share the same bones.'],
      ],
    },
    {
      id: 'b7-complexity',
      title: ['Усложнение строения. Охрана животных', 'Increasing complexity. Protecting animals'],
      intro: [
        'От простейших к млекопитающим системы органов становились всё сложнее и совершеннее.',
        'From protists to mammals, organ systems grew ever more complex and efficient.',
      ],
      points: [
        ['Эволюция систем органов', 'Evolution of organ systems', 'Сердце: нет у червей → двухкамерное у рыб → трёх- у земноводных → четырёхкамерное у птиц и зверей.', 'Heart: none in worms → two chambers in fish → three in amphibians → four in birds and mammals.'],
        ['Охрана животного мира', 'Wildlife protection', 'Заповедники, запрет охоты на редкие виды, разведение в неволе.', 'Reserves, hunting bans on rare species, captive breeding.'],
      ],
    },
  ]),
];
