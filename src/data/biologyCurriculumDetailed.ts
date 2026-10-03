import { TextbookLesson } from '../types/stem';

export const DETAILED_BIOLOGY_CURRICULUM: TextbookLesson[] = [
  // =========================================================================
  // 5–6 КЛАСС — БОТАНИКА И БАКТЕРИИ
  // =========================================================================
  {
    id: 'bio5_cell_structure',
    grade: 'grade_5_6',
    category: 'biology',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    chapter: { en: 'Cellular Basis of Life', ru: 'Клеточное строение организмов' },
    title: { en: 'Plant Cell Anatomy: Cell Wall, Vacuole, Chloroplasts', ru: 'Строение растительной клетки: Оболочка, вакуоль и пластиды' },
    subtitle: { en: 'Why plant cells are rigid boxes and how green chloroplasts work', ru: 'Целлюлозная клеточная стенка, клеточный сок и пигмент хлорофилл' },
    textbookDefinition: {
      en: 'The cell is the basic structural and functional unit of life. Plant cells possess a rigid cellulose cell wall, large central vacuole with cell sap, and chloroplasts for photosynthesis.',
      ru: 'Клетка — элементарная живая система, основа строения и жизнедеятельности всех организмов. Растительная клетка отличается от животной наличием прочной клеточной стенки из целлюлозы, пластид (хлоропластов) и крупной центральной вакуоли.'
    },
    studentConfusion: {
      en: 'Children confuse animal and plant cells, not understanding why plants do not have skeletons to stand upright.',
      ru: 'Дети не понимают, почему деревья стоят прямо без костей: прочная целлюлозная стенка каждой из миллиардов клеток работает как микроскопический кирпичик в кладке!'
    },
    lifeAnalogy: {
      en: 'A cardboard box (cell wall) with a water balloon inside (vacuole). When balloon is inflated with water, box is rock hard (turgor).',
      ru: 'Надутый водяной шарик внутри картонной коробки: пока вакуоль полна воды, клетка упругая (тургор). Если полива нет — шарик сдувается и растение вянет!'
    },
    momentObservation: {
      en: 'Zoom into Elodea leaf under light microscope: watch green chloroplasts stream along cytoplasmic currents.',
      ru: 'Приблизь лист элодеи под микроскопом: зеленые диски хлоропластов плавно скользят по кругу в потоках цитоплазмы (циклоз)!'
    },
    viewMode: 'moment_photosynthesis',
    keywords: ['cell', 'plant cell', 'chloroplast', 'vacuole', 'клетка', 'вакуоль', 'хлоропласт', 'тургор']
  },
  {
    id: 'bio5_photosynthesis_light',
    grade: 'grade_5_6',
    category: 'biology',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    chapter: { en: 'Plant Life and Organs', ru: 'Жизнедеятельность растений' },
    title: { en: 'Photosynthesis: How Plants Eat Sunlight', ru: 'Фотосинтез: Как зеленый лист создает пищу из света и воды' },
    subtitle: { en: 'Sunlight energy splits water into oxygen and produces sweet glucose', ru: 'Световая и темновая фазы, роль устьиц в газообмене и значение для всей планеты' },
    textbookDefinition: {
      en: 'Photosynthesis is the synthesis of organic compounds from carbon dioxide and water using light energy absorbed by chlorophyll, with oxygen released as a byproduct.',
      ru: 'Фотосинтез — процесс образования органических веществ (сахаров) из углекислого газа и воды на свету при участии хлорофилла с выделением кислорода: 6CO₂ + 6H₂O + свет → C₆H₁₂O₆ + 6O₂.'
    },
    studentConfusion: {
      en: 'Students think soil is the "food" that enters plant leaves. 95% of a tree\'s dry mass comes from the AIR (CO₂)!',
      ru: 'Школьники думают, что дерево «ест землю». В реальности 95% массы гигантского дуба взято прямо из ВОЗДУХА — из невидимого газа CO₂!'
    },
    lifeAnalogy: {
      en: 'Solar-powered 3D printer: catches sunbeams, sucks in air and water, and prints wood, apples, and leaves.',
      ru: 'Солнечная фабрика: лист улавливает кванты света как солнечная батарея и сшивает невидимые молекулы углекислого газа в сладкую глюкозу и прочную древесину!'
    },
    momentObservation: {
      en: 'Adjust light intensity in simulator: watch photons trigger water photolysis and burst of oxygen bubbles.',
      ru: 'Двигай ползунок освещенности: смотри, как кванты света разбивают молекулы воды и тилакоиды выбрасывают пузырьки кислорода O₂!'
    },
    formula: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} + h\\nu \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    viewMode: 'moment_photosynthesis',
    keywords: ['photosynthesis', 'chlorophyll', 'leaf', 'glucose', 'фотосинтез', 'лист', 'кислород', 'глюкоза']
  },
  {
    id: 'bio6_root_water_transport',
    grade: 'grade_5_6',
    category: 'biology',
    gradeBadge: { en: 'Grade 5-6', ru: '5-6 Класс' },
    chapter: { en: 'Plant Organs and Nutrition', ru: 'Органы растений: Корень и минеральное питание' },
    title: { en: 'Root Zones and Root Pressure: Osmotic Water Pump', ru: 'Зоны корня и корневые волоски: Как вода поднимается на 100 метров' },
    subtitle: { en: 'Root cap, elongation zone, root hairs osmosis, and xylem vascular bundles', ru: 'Корневой чехлик, всасывание растворов солей, сосуды ксилемы и капиллярный подъем' },
    textbookDefinition: {
      en: 'Root hairs are specialized epidermal cell outgrowths absorbing water and dissolved minerals by osmosis. Root pressure and transpiration suction pull xylem sap upwards to the leaves.',
      ru: 'Корневые волоски — микроскопические выросты клеток кожицы корня, многократно увеличивающие площадь всасывания. За счет осмотического давления и транспирации (испарения воды листьями) вода поднимается по сосудам ксилемы на высоту столетних деревьев.'
    },
    studentConfusion: {
      en: 'How can a redwood tree pump tons of water up 100 meters without a mechanical heart pump?',
      ru: 'Как секвойя качает тонны воды на высоту 30-этажного дома без мотора? За счет испарения воды с листьев (тяга сверху) и осмоса в корнях (давление снизу)!'
    },
    lifeAnalogy: {
      en: 'Drinking through a straw: leaf transpiration sucks liquid up from the straw, while roots act as continuous fluid suppliers.',
      ru: 'Пить сок через соломинку: солнце испаряет воду из кроны, создавая отрицательное давление, и непрерывная водяная нить всасывается из земли!'
    },
    momentObservation: {
      en: 'Trace water molecules entering root hairs via osmosis and surging up through xylem vessels.',
      ru: 'Наблюдай за движением синих молекул воды: через мембрану корневого волоска они устремляются в сосуды древесины под действием градиента осмоса!'
    },
    viewMode: 'moment_diffusion',
    keywords: ['root', 'osmosis', 'xylem', 'transpiration', 'корень', 'корневые волоски', 'ксилема', 'осмос']
  },

  // =========================================================================
  // 7 КЛАСС — ЗООЛОГИЯ (ЖИВОТНЫЕ)
  // =========================================================================
  {
    id: 'bio7_protozoa_amoeba',
    grade: 'grade_7',
    category: 'biology',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Protozoa and Invertebrates', ru: 'Подцарство Простейшие (Одноклеточные)' },
    title: { en: 'Amoeba and Paramecium: Organelles of a Single Cell', ru: 'Амёба обыкновенная и Инфузория-туфелька: Целый организм в одной клетке' },
    subtitle: { en: 'Pseudopodia phagocytosis, cilia locomotion, and contractile vacuole osmoregulation', ru: 'Ложноножки, фагоцитоз, реснички, клеточный рот и сократительная вакуоль' },
    textbookDefinition: {
      en: 'Protozoa are single-celled eukaryotic organisms displaying all functions of an independent animal: movement, digestion, excretion, respiration, and irritability.',
      ru: 'Простейшие — животные, тело которых состоит из одной клетки, выполняющей функции целостного организма. Амёба передвигается ложноножками и захватывает пищу фагоцитозом, а инфузория плавает тысячами согласованно бьющих ресничек.'
    },
    studentConfusion: {
      en: 'Why doesn\'t a freshwater amoeba pop like a balloon from incoming water? (Contractile vacuole pumps excess water out).',
      ru: 'Почему пресноводная амёба не лопается от притока воды по закону осмоса? Её спасает сократительная вакуоль — маленький насос, который пульсирует и выбрасывает лишнюю воду!'
    },
    lifeAnalogy: {
      en: 'A submarine with a bilge pump: water continuously leaks in, so the pump must keep ejecting water to stay afloat.',
      ru: 'Трюмный насос на лодке: пресная вода непрерывно засасывается внутрь клетки, и сократительная вакуоль каждые 20 секунд сжимается и откачивает воду наружу.'
    },
    momentObservation: {
      en: 'Watch amoeba pseudopodia flow around a food bacterium, sealing it into a digestive vacuole.',
      ru: 'Посмотри на фагоцитоз: цитоплазма амёбы обтекает бактерию двумя ложноножками, смыкается и переваривает её ферментами!'
    },
    viewMode: 'biology_cell',
    keywords: ['amoeba', 'paramecium', 'protozoa', 'phagocytosis', 'амёба', 'инфузория', 'простейшие', 'фагоцитоз']
  },
  {
    id: 'bio7_arthropods_insects',
    grade: 'grade_7',
    category: 'biology',
    gradeBadge: { en: 'Grade 7', ru: '7 Класс' },
    chapter: { en: 'Arthropods', ru: 'Тип Членистоногие' },
    title: { en: 'Arthropods: Chitinous Exoskeleton and Insect Metamorphosis', ru: 'Членистоногие: Хитиновый панцирь и превращения насекомых' },
    subtitle: { en: 'Crustaceans, arachnids, insects; complete vs incomplete metamorphosis', ru: 'Линька, фасеточные глаза, дыхание трахеями, стадии яйцо-личинка-куколка-имаго' },
    textbookDefinition: {
      en: 'Arthropods are bilateral coelomate animals with segmented bodies, jointed appendages, and an external chitinous cuticle acting as exoskeleton and protective armor.',
      ru: 'Членистоногие — самый многочисленный тип животных на Земле (>1 млн видов). Характеризуются наружным хитиновым скелетом, членистыми конечностями и сегментированным телом. Рост возможен только во время линьки.'
    },
    studentConfusion: {
      en: 'Why do spiders and crabs have to shed their skin to grow?',
      ru: 'Почему раки и жуки линяют? Хитиновый панцирь — как рыцарские доспехи: он прочный, но не растягивается. Чтобы вырасти, животное сбрасывает старый панцирь и быстро надувается, пока новый мягкий!'
    },
    lifeAnalogy: {
      en: 'Outgrowing children\'s clothes: when tight shoes start squeezing feet, you must discard them to step into a bigger size.',
      ru: 'Тесная обувь: когда нога вырастает, в старом ботинке ходить нельзя — его надо снять. Во время линьки краб совершенно беззащитен, как желе!'
    },
    momentObservation: {
      en: 'Observe caterpillar tissue deconstruction inside chrysalis, rebuilding into butterfly wings.',
      ru: 'Метаморфоз в куколке: тело гусеницы практически полностью растворяется ферментами в питательную кашицу, из которой имагинальные диски собирают бабочку!'
    },
    viewMode: 'moment_states',
    keywords: ['arthropods', 'insects', 'chitin', 'metamorphosis', 'членистоногие', 'насекомые', 'хитин', 'линька']
  },

  // =========================================================================
  // 8 КЛАСС — АНАТОМИЯ И ФИЗИОЛОГИЯ ЧЕЛОВЕКА
  // =========================================================================
  {
    id: 'bio8_heart_circulation',
    grade: 'grade_8',
    category: 'biology',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Circulatory System', ru: 'Кровеносная система человека' },
    title: { en: 'Human Heart and Two Circulatory Loops', ru: 'Строение сердца и два круга кровообращения' },
    subtitle: { en: 'Atria, ventricles, heart valves, pulmonary and systemic loops', ru: 'Четырехкамерное сердце, автоматия синусового узла, систола и диастола, давление в артериях' },
    textbookDefinition: {
      en: 'The human circulatory system is closed and four-chambered. The systemic circuit pumps oxygenated blood from left ventricle to all organs. The pulmonary circuit pumps deoxygenated blood from right ventricle to lungs.',
      ru: 'Кровеносная система человека замкнутая, с 4-камерным сердцем. Большой круг кровообращения начинается в левом желудочке и снабжает кислородом все тело. Малый (легочный) круг начинается в правом желудочке и обогащает кровь кислородом в альвеолах легких.'
    },
    studentConfusion: {
      en: 'Students confuse pulmonary artery with systemic arteries: pulmonary artery carries deoxygenated (blue) blood!',
      ru: 'Главная путаница: школьники считают, что «в артериях всегда течет алая артериальная кровь». Но в легочной артерии течет венозная кровь к легким!'
    },
    lifeAnalogy: {
      en: 'A double-piston water filtration engine: left side delivers fresh water to city homes; right side pushes wastewater through water treatment filters.',
      ru: 'Насосная станция города: левый насос качает чистую родниковую воду во все дома (большой круг), а правый насос отправляет использованную воду на станцию очистки и аэрации (легкие)!'
    },
    momentObservation: {
      en: 'Watch ventricular systole: mitral valve slams shut (Lub sound), aortic valve opens, ejecting blood under 120 mmHg surge.',
      ru: 'Момент систолы желудочков: створчатые клапаны с хлопком закрываются («Тук»), полулунные распахиваются, и пульсовая волна 120 мм рт. ст. летит по аорте!'
    },
    viewMode: 'moment_pascal',
    keywords: ['heart', 'circulation', 'artery', 'vein', 'ventricle', 'сердце', 'кровообращение', 'желудочек', 'аорта']
  },
  {
    id: 'bio8_neuron_action_potential',
    grade: 'grade_8',
    category: 'biology',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Nervous System', ru: 'Нервная система и нейроны' },
    title: { en: 'Neuron and Action Potential: Synaptic Transmission', ru: 'Нейрон, потенциал действия и синапс: Передача нервного импульса' },
    subtitle: { en: 'Dendrites, axon with myelin sheath, sodium-potassium channels, neurotransmitters', ru: 'Мембранный потенциал покоя (-70 мВ), деполяризация Na⁺/K⁺ и выброс медиатора в синаптическую щель' },
    textbookDefinition: {
      en: 'A neuron is the excitable electrical cell of the nervous system. Nerve impulses travel as waves of membrane depolarization (action potentials) via voltage-gated Na⁺/K⁺ ion channels, triggering neurotransmitter release across synapses.',
      ru: 'Нейрон — структурно-функциональная единица нервной системы. Нервный импульс представляет собой распространяющуюся волну перезарядки мембраны (потенциал действия), вызванную быстрым током ионов Na⁺ внутрь клетки и K⁺ наружу.'
    },
    studentConfusion: {
      en: 'Students think electricity flows through nerves like copper wire. It is actually a biochemical cascade of crossing ions!',
      ru: 'Школьники думают, что по нерву бегут электроны как по проводу. Нет! Нервный импульс — это поперечное перепрыгивание ионов Na⁺ и K⁺ через мембрану клетки!'
    },
    lifeAnalogy: {
      en: 'A row of falling dominoes: each tile knocking the next is like an opening ion channel down the axon.',
      ru: 'Падающие костяшки домино: толкнул первую — и волна падений сама бежит со скоростью 120 м/с до конца нервного волокна!'
    },
    momentObservation: {
      en: 'Click "Trigger Impulse" in simulator: watch green depolarization spark sprint down the myelin axon and release neurotransmitter bubbles into synapse.',
      ru: 'Запусти импульс в симуляторе нейрона: смотри, как зеленый фронт перезарядки мембраны добегает до синапса и пузырьки медиатора устремляются к соседней клетке!'
    },
    formula: '\\text{Потенциал покоя} = -70 \\text{ мВ}, \\quad \\text{Пик деполяризации} = +30 \\text{ мВ}',
    viewMode: 'moment_neuron',
    keywords: ['neuron', 'action potential', 'synapse', 'myelin', 'нейрон', 'синапс', 'потенциал действия', 'медиатор']
  },
  {
    id: 'bio8_kidney_nephron',
    grade: 'grade_8',
    category: 'biology',
    gradeBadge: { en: 'Grade 8', ru: '8 Класс' },
    chapter: { en: 'Excretory System', ru: 'Выделительная система' },
    title: { en: 'Nephron and Kidney Ultrafiltration: Primary vs Secondary Urine', ru: 'Нефрон почки: Ультрафильтрация и реабсорбция мочи' },
    subtitle: { en: 'Bowman capsule, glomerulus, Loop of Henle, reabsorbing 178 liters of water daily', ru: 'Клубочковая фильтрация крови, первичная моча (180 л/сутки) и вторичная моча (1.5 л/сутки)' },
    textbookDefinition: {
      en: 'The nephron is the microscopic functional unit of the kidney. Glomerular pressure forces protein-free plasma into Bowman\'s capsule as primary urine (180 L/day). Tubules reabsorb 99% of water, glucose, and ions, producing 1.5 L of secondary urine.',
      ru: 'Нефрон — структурная единица почки (~1 миллион в каждой почке). В капсуле клубочка под давлением фильтруется первичная моча (180 л в день), содержащая воду, глюкозу и аминокислоты. В извитых канальцах полезные вещества всасываются обратно в кровь (реабсорбция).'
    },
    studentConfusion: {
      en: 'Students are shocked that our kidneys filter 180 liters of liquid a day, not understanding that 99% is reabsorbed back into the blood.',
      ru: 'Дети удивляются: «Откуда в человеке 180 литров мочи в день?!». Они не понимают, что один и тот же объем крови проходит через почки сотни раз, и 178.5 литров возвращаются обратно в вены!'
    },
    lifeAnalogy: {
      en: 'Emptying your entire backpack onto the floor to clean it, then putting back everything useful and throwing away only the candy wrappers.',
      ru: 'Генеральная уборка в рюкзаке: сначала высыпать на пол абсолютно все вещи (фильтрация), а потом сложить обратно учебники, ключи и деньги, выбросив только мусор (реабсорбция)!'
    },
    momentObservation: {
      en: 'Observe red blood cells retained in glomerulus capillary while water and urea squeeze into nephron lumen.',
      ru: 'Посмотри на клубочек нефрона: крупные белки и эритроциты остаются в крови, а молекулы мочевины и лишней соли уходят в почечные канальцы!'
    },
    viewMode: 'moment_diffusion',
    keywords: ['kidney', 'nephron', 'filtration', 'urine', 'почка', 'нефрон', 'фильтрация', 'реабсорбция']
  },

  // =========================================================================
  // 9–11 КЛАСС — МОЛЕКУЛЯРНАЯ И ОБЩАЯ БИОЛОГИЯ
  // =========================================================================
  {
    id: 'bio9_dna_replication_fork',
    grade: 'grade_9',
    category: 'biology',
    gradeBadge: { en: 'Grade 9-10', ru: '9-10 Класс' },
    chapter: { en: 'Molecular Genetics', ru: 'Основы генетики и молекулярной биологии' },
    title: { en: 'DNA Double Helix: Chargaff Rules and Semiconservative Replication', ru: 'Строение молекулы ДНК: Правило Чаргаффа и репликация' },
    subtitle: { en: 'Adenine-Thymine, Guanine-Cytosine, DNA polymerase synthesis at replication fork', ru: 'Антипараллельные цепи 5\'→3\', водородные связи, фермент ДНК-полимераза' },
    textbookDefinition: {
      en: 'DNA is a double-stranded right-handed helix. Semiconservative replication unzips the parent strands, each acting as a template for a newly synthesized complementary daughter strand.',
      ru: 'ДНК — двойная правозакрученная спираль из дезоксирибонуклеотидов. Принцип комплементарности (Чаргафф): Аденин соединяется с Тимином двумя водородными связями (A=T), Гуанин с Цитозином — тремя (G≡C). Репликация полуконсервативна.'
    },
    studentConfusion: {
      en: 'Students memorize letters A, T, G, C, without realizing they are physical 3D lock-and-key puzzle pieces.',
      ru: 'Ученики воспринимают буквы А, Т, Г, Ц абстрактно. Но это реальные 3D-детали пазла: две связи у A-T и три связи у G-C подходят друг к другу с точностью до десятой доли нанометра!'
    },
    lifeAnalogy: {
      en: 'Zipper on a jacket: unzipping splits the teeth, and an automated machine builds a matching new half on each exposed side.',
      ru: 'Застежка-молния: расстегнули куртку на две половинки, и специальный станок мгновенно пришивает к каждой половинке новую пару зубчиков — получаются две одинаковые куртки!'
    },
    momentObservation: {
      en: 'Hit "Unzip" in simulation: watch hydrogen bonds snap as the replication bubble opens, with polymerase assembling matching nucleotides.',
      ru: 'Нажми «Расплести» в симуляторе ДНК: водородные связи рвутся и свободные нуклеотиды притягиваются к матрице строго по закону комплементарности!'
    },
    formula: 'A = T \\quad (2 \\text{ связи}), \\quad G \\equiv C \\quad (3 \\text{ связи}), \\quad \\frac{A+G}{T+C} = 1',
    viewMode: 'moment_dna',
    keywords: ['dna', 'replication', 'chargaff', 'nucleotides', 'днк', 'репликация', 'комплементарность', 'чаргафф']
  },
  {
    id: 'bio9_mendel_inheritance',
    grade: 'grade_9',
    category: 'biology',
    gradeBadge: { en: 'Grade 9-10', ru: '9-10 Класс' },
    chapter: { en: 'Classical Genetics', ru: 'Законы наследственности Менделя' },
    title: { en: 'Mendel\'s Laws: Monohybrid Cross and Punnett Square (3:1 Ratio)', ru: 'Законы Менделя: Моногибридное скрещивание и решетка Пеннета' },
    subtitle: { en: 'Alleles, dominant and recessive traits, genotype vs phenotype', ru: 'Закон единообразия гибридов (F₁), закон расщепления 3:1 (F₂) и закон чистоты гамет' },
    textbookDefinition: {
      en: 'Mendel\'s Second Law (Law of Segregation): when crossing F₁ heterozygotes (Aa × Aa), traits segregate in a 3:1 ratio by phenotype (75% dominant, 25% recessive) and 1:2:1 by genotype.',
      ru: 'Второй закон Менделя (расщепление): при скрещивании гетерозиготных гибридов первого поколения во втором поколении наблюдается расщепление по фенотипу 3:1 (75% доминантных, 25% рецессивных) и по генотипу 1AA : 2Aa : 1aa.'
    },
    studentConfusion: {
      en: 'Why do two brown-eyed parents have a blue-eyed child? (Both carry hidden recessive "a" allele).',
      ru: 'Как у двух кареглазых родителей рождается голубоглазый ребенок? Если оба родителя гетерозиготны (Aa), с вероятностью 25% ребенок получит рецессивный ген «a» от обоих!'
    },
    lifeAnalogy: {
      en: 'Flipping two coins at once: 25% Heads-Heads, 50% Heads-Tails, 25% Tails-Tails. The math of genetics is pure probability.',
      ru: 'Подбрасывание двух монеток одновременно: Орел-Орел (25%), Орел-Решка (50%), Решка-Решка (25%). Рецессивный признак — это две решки подряд!'
    },
    momentObservation: {
      en: 'Toggle parent alleles in Punnett simulator: watch flower colors recalculate with exact 3:1 ratio.',
      ru: 'Переключай аллели родителей Aa × Aa в симуляторе: смотри, как в решетке Пеннета 1 из 4 цветков окрашивается в белый цвет (aa)!'
    },
    formula: 'Aa \\times Aa \\rightarrow 1AA : 2Aa : 1aa \\quad (3 : 1 \\text{ по фенотипу})',
    viewMode: 'moment_mendel',
    keywords: ['mendel', 'genetics', 'punnett', 'alleles', 'dominant', 'мендель', 'генетика', 'пеннет', 'доминантный', 'рецессивный']
  },
  {
    id: 'bio10_protein_synthesis',
    grade: 'grade_10',
    category: 'biology',
    gradeBadge: { en: 'Grade 10', ru: '10 Класс' },
    chapter: { en: 'Cellular Biochemistry', ru: 'Биосинтез белка в клетке' },
    title: { en: 'Protein Biosynthesis: Transcription and Translation on Ribosome', ru: 'Биосинтез белка: Транскрипция, иРНК и трансляция на рибосоме' },
    subtitle: { en: 'How a 3-letter codon code converts genetic information into working protein machines', ru: 'Генетический код (триплетность, вырожденность), транспортные РНК и пептидная связь' },
    textbookDefinition: {
      en: 'Protein synthesis proceeds in two steps: Transcription in nucleus copies DNA code into mRNA; Translation in cytoplasm uses ribosomes and tRNA anticodons to link amino acids in exact sequence.',
      ru: 'Биосинтез белка включает два этапа: транскрипцию (синтез матричной иРНК по матрице ДНК в ядре) и трансляцию (считывание кодонов иРНК рибосомой с последовательным присоединением аминокислот тРНК).'
    },
    studentConfusion: {
      en: 'Students confuse transcription (DNA→RNA) with translation (RNA→Protein).',
      ru: 'Школьники путают транскрипцию (переписывание ДНК в РНК на том же языке нуклеотидов) и трансляцию (перевод с языка нуклеотидов на язык 20 аминокислот белка).'
    },
    lifeAnalogy: {
      en: 'Transcription is photocopying a recipe from a master library book; translation is the chef baking the cake following those copied instructions.',
      ru: 'Транскрипция — снять ксерокопию с чертежа в архиве. Трансляция — рабочий на станке (рибосома) собирает по этой копии сложный мотор из деталей (аминокислот)!'
    },
    momentObservation: {
      en: 'Watch ribosome ratchet along mRNA codon by codon (AUG start), snapping peptide bonds together.',
      ru: 'Наблюдай шаг рибосомы по иРНК: триплет за триплетом рибосома щелкает кодонами и наращивает полипептидную цепь белка со скоростью 20 аминокислот в секунду!'
    },
    formula: '\\text{ДНК} \\xrightarrow{\\text{транскрипция}} \\text{иРНК} \\xrightarrow{\\text{трансляция}} \\text{Белок}',
    viewMode: 'moment_dna',
    keywords: ['transcription', 'translation', 'ribosome', 'codon', 'транскрипция', 'трансляция', 'рибосома', 'триплет']
  },
  {
    id: 'bio11_darwin_evolution_selection',
    grade: 'grade_11',
    category: 'biology',
    gradeBadge: { en: 'Grade 11', ru: '11 Класс' },
    chapter: { en: 'Evolutionary Biology', ru: 'Эволюционное учение' },
    title: { en: 'Darwin\'s Theory of Evolution: Natural Selection and Adaptation', ru: 'Эволюционная теория Дарвина: Движущие силы и Естественный отбор' },
    subtitle: { en: 'Inherited variation, struggle for existence, survival of the fittest', ru: 'Мутации, половой процесс, формы естественного отбора (движущий, стабилизирующий, дизруптивный)' },
    textbookDefinition: {
      en: 'Natural selection is the differential survival and reproduction of individuals due to differences in phenotype. It is a key mechanism of evolution, driving adaptation of populations to their environments.',
      ru: 'Естественный отбор — основной направляющий фактор эволюции, заключающийся в преимущественном выживании и оставлении потомства особями, обладающими полезными в данных условиях признаками.'
    },
    studentConfusion: {
      en: 'Lamarckian misconception: students think giraffes stretched their necks to reach tall trees and passed stretched necks to offspring.',
      ru: 'Заблуждение Ламарка: школьники думают, что жираф «тянул шею при жизни, и она вытянулась». Нет! Рождались жирафы с разной длиной шеи (мутации), и короткошеие просто погибали от голода в засуху!'
    },
    lifeAnalogy: {
      en: 'Industrial melanism in peppered moths: when soot darkened birch trunks during Industrial Revolution, white moths were eaten by birds while dark moths thrived.',
      ru: 'Березовая пяденица в Англии: когда дым заводов покрыл деревья сажей, белых бабочек склевали птицы, а редкие темные мутанты стали незаметными и дали 98% потомства!'
    },
    momentObservation: {
      en: 'Run population simulation: shift predator vision, watch moth camouflage color frequency adapt over 50 generations.',
      ru: 'Запусти эволюционную симуляцию популяции: измени цвет фона и наблюдай, как за 20 поколений частота полезного аллеля вырастает с 2% до 98%!'
    },
    viewMode: 'moment_gauss',
    keywords: ['evolution', 'natural selection', 'darwin', 'adaptation', 'эволюция', 'естественный отбор', 'дарвин', 'приспособленность']
  }
];
