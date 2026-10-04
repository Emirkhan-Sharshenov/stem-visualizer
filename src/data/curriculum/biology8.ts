import { section } from './types';

const B = 'biology';

export const BIOLOGY_8 = [
  section(B, 8, 'overview', ['Общий обзор организма', 'The human body: an overview'], [
    {
      id: 'b8-sciences',
      title: ['Науки о человеке. Место в природе', 'Human sciences. Our place in nature'],
      intro: [
        'Анатомия изучает строение тела, физиология — его работу, гигиена — как сохранить здоровье. Биологически человек — млекопитающее из отряда приматов.',
        'Anatomy studies the body’s structure, physiology how it works, hygiene how to keep it healthy. Biologically we’re mammals, order primates.',
      ],
      points: [
        ['Анатомия, физиология, гигиена', 'Anatomy, physiology, hygiene', 'Три взгляда на одно тело: из чего, как работает, как беречь.', 'Three views of one body: what it’s made of, how it works, how to care for it.'],
        ['Место в системе животного мира', 'Place among animals', 'Тип хордовые, класс млекопитающие, отряд приматы, вид Homo sapiens.', 'Chordates, mammals, primates, Homo sapiens.'],
      ],
    },
    {
      id: 'b8-cell-tissues',
      title: ['Клетка и ткани', 'Cells and tissues'],
      intro: [
        'В теле около 30 триллионов клеток более 200 типов. Похожие клетки образуют четыре вида тканей.',
        'The body has about 30 trillion cells of 200+ types, grouped into four kinds of tissue.',
      ],
      points: [
        ['Строение и деление клетки', 'Cell structure and division', 'Мембрана, цитоплазма, ядро, органоиды; клетки обновляются делением.', 'Membrane, cytoplasm, nucleus, organelles; cells renew by dividing.'],
        ['Эпителиальная', 'Epithelial', 'Покрывает тело и выстилает органы: кожа, слизистые.', 'Covers the body and lines organs: skin, mucous membranes.'],
        ['Соединительная', 'Connective', 'Кость, хрящ, кровь, жир — много межклеточного вещества.', 'Bone, cartilage, blood, fat: lots of material between cells.'],
        ['Мышечная', 'Muscle', 'Скелетная, сердечная, гладкая — способны сокращаться.', 'Skeletal, cardiac and smooth: they contract.'],
        ['Нервная', 'Nervous', 'Нейроны проводят сигналы, глия их поддерживает.', 'Neurons carry signals; glia support them.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b8-regulation',
      title: ['Органы, системы, регуляция', 'Organs, systems, regulation'],
      intro: [
        'Органы объединены в системы, а работу всех систем согласуют нервная и гуморальная регуляция.',
        'Organs form systems, and nervous and hormonal control coordinate them all.',
      ],
      points: [
        ['Нервная регуляция', 'Nervous control', 'Быстрая и точная — по нервам.', 'Fast and precise, through nerves.'],
        ['Гуморальная регуляция', 'Hormonal control', 'Медленнее и шире — гормонами через кровь.', 'Slower and broader, by hormones in the blood.'],
        ['Рефлекс и рефлекторная дуга', 'Reflex and reflex arc', 'Рецептор → чувствительный нейрон → мозг → двигательный нейрон → мышца. Отдёргивание руки от горячего.', 'Receptor → sensory neuron → CNS → motor neuron → muscle, as when you pull back from heat.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
  ]),

  section(B, 8, 'skeleton', ['Опорно-двигательная система', 'The musculoskeletal system'], [
    {
      id: 'b8-bones',
      title: ['Строение и состав костей', 'Bone structure'],
      intro: [
        'Кость — живая ткань: прочная как бетон и лёгкая. Органические вещества дают гибкость, минеральные — твёрдость.',
        'Bone is living tissue, strong as concrete yet light. Organic matter gives flexibility, minerals hardness.',
      ],
      points: [
        ['Органические и неорганические вещества', 'Organic and mineral parts', 'Прокалённая кость крошится, вымоченная в кислоте — гнётся узлом.', 'Burnt bone crumbles; acid-soaked bone bends into a knot.'],
        ['Рост костей', 'Bone growth', 'В длину — за счёт хрящевых зон у концов, в толщину — за счёт надкостницы.', 'In length from cartilage plates near the ends; in width from the periosteum.'],
        ['Виды костей', 'Types', 'Трубчатые (бедро), губчатые (позвонки), плоские (лопатка, кости черепа).', 'Long (femur), spongy (vertebrae), flat (shoulder blade, skull).'],
        ['Соединения костей', 'Joints', 'Неподвижные (череп), полуподвижные (позвонки), суставы (колено).', 'Fixed (skull), slightly movable (vertebrae), freely movable joints (knee).'],
      ],
    },
    {
      id: 'b8-skeleton-parts',
      title: ['Отделы скелета', 'Parts of the skeleton'],
      intro: [
        'Скелет взрослого — 206 костей. Он защищает органы, служит опорой и рычагами для мышц.',
        'An adult skeleton has 206 bones. It protects organs and provides support and levers for muscles.',
      ],
      points: [
        ['Череп', 'Skull', 'Мозговой отдел защищает мозг, лицевой образует лицо. Подвижна только нижняя челюсть.', 'The cranium guards the brain; the facial part shapes the face. Only the lower jaw moves.'],
        ['Скелет туловища', 'Trunk', 'Позвоночник с четырьмя изгибами-«амортизаторами», рёбра и грудина.', 'A spine with four shock-absorbing curves, ribs and the breastbone.'],
        ['Конечности и пояса', 'Limbs and girdles', 'Плечевой пояс (лопатки, ключицы) и тазовый пояс связывают руки и ноги с туловищем.', 'The shoulder girdle (shoulder blades, collarbones) and pelvic girdle attach limbs to the trunk.'],
      ],
    },
    {
      id: 'b8-muscles',
      title: ['Мышцы. Работа мышц', 'Muscles and how they work'],
      intro: [
        'Около 600 скелетных мышц двигают кости как рычаги. Мышцы умеют только тянуть, поэтому работают парами.',
        'About 600 skeletal muscles move bones like levers. Muscles can only pull, so they work in pairs.',
      ],
      points: [
        ['Строение мышцы', 'Structure', 'Пучки волокон, покрытые оболочкой и переходящие в сухожилия.', 'Bundles of fibres in a sheath, ending in tendons.'],
        ['Группы мышц', 'Muscle groups', 'Мышцы головы, шеи, туловища и конечностей; сгибатели и разгибатели.', 'Head, neck, trunk and limb muscles; flexors and extensors.'],
        ['Работа и утомление', 'Work and fatigue', 'При долгой нагрузке накапливаются продукты обмена — нужен отдых. Тренировки повышают выносливость.', 'Long effort builds up waste products and needs rest; training builds endurance.'],
      ],
      sim: { moment: 'moment_lever' },
    },
    {
      id: 'b8-skeleton-health',
      title: ['Здоровье опорно-двигательной системы', 'Bone and muscle health'],
      intro: [
        'Неправильная поза за партой и мало движения портят осанку и стопы. Травмы требуют правильной первой помощи.',
        'Bad posture at a desk and too little movement spoil the back and feet. Injuries need correct first aid.',
      ],
      points: [
        ['Осанка и плоскостопие', 'Posture and flat feet', 'Сидеть ровно, носить удобную обувь, делать зарядку.', 'Sit straight, wear good shoes, exercise.'],
        ['Переломы', 'Fractures', 'Обездвижить шиной, захватив два соседних сустава; при открытом — сначала остановить кровь.', 'Splint it, including the joints above and below; with an open fracture stop the bleeding first.'],
        ['Вывихи и растяжения', 'Dislocations and sprains', 'Холод и покой; вправлять вывих может только врач.', 'Cold and rest; only a doctor should reset a dislocation.'],
      ],
    },
  ]),

  section(B, 8, 'blood', ['Внутренняя среда организма. Кровь', 'Internal environment. Blood'], [
    {
      id: 'b8-internal-env',
      title: ['Компоненты внутренней среды', 'The internal environment'],
      intro: [
        'Клетки омываются жидкостями, которые поддерживают постоянство состава — гомеостаз.',
        'Cells are bathed in fluids that keep conditions steady: homeostasis.',
      ],
      points: [
        ['Кровь, тканевая жидкость, лимфа', 'Blood, tissue fluid, lymph', 'Из крови в капиллярах образуется тканевая жидкость, её излишки уходят в лимфу.', 'Blood in capillaries leaks tissue fluid; the excess drains into lymph.'],
      ],
    },
    {
      id: 'b8-blood-composition',
      title: ['Состав крови', 'What blood is made of'],
      intro: [
        'Кровь — жидкая ткань: плазма и форменные элементы.',
        'Blood is a liquid tissue of plasma and blood cells.',
      ],
      points: [
        ['Плазма', 'Plasma', '90% воды, белки, соли, глюкоза.', '90% water plus proteins, salts and glucose.'],
        ['Эритроциты', 'Red cells', 'Без ядра, с гемоглобином; переносят кислород. Их форма — двояковогнутый диск.', 'No nucleus, full of haemoglobin, carrying oxygen; shaped like biconcave discs.'],
        ['Лейкоциты', 'White cells', 'Защитники: уничтожают микробы.', 'Defenders that destroy germs.'],
        ['Тромбоциты', 'Platelets', 'Обломки клеток, запускают свёртывание.', 'Cell fragments that start clotting.'],
      ],
    },
    {
      id: 'b8-clotting-immunity',
      title: ['Свёртывание крови. Иммунитет', 'Clotting. Immunity'],
      intro: [
        'Тромбоциты закрывают рану сгустком, а иммунная система распознаёт и уничтожает чужаков.',
        'Platelets plug wounds with clots, and the immune system recognises and destroys invaders.',
      ],
      points: [
        ['Свёртывание', 'Clotting', 'Растворимый фибриноген превращается в нити фибрина, в которых застревают клетки.', 'Soluble fibrinogen turns into fibrin threads that trap cells.'],
        ['Фагоцитоз', 'Phagocytosis', 'Мечников открыл, что лейкоциты поглощают микробов.', 'Mechnikov found white cells engulf germs.'],
        ['Виды иммунитета', 'Kinds of immunity', 'Врождённый и приобретённый: после болезни или прививки.', 'Innate and acquired, after illness or vaccination.'],
        ['Вакцины и сыворотки', 'Vaccines and sera', 'Вакцина — ослабленный микроб, учит организм; сыворотка — готовые антитела.', 'A vaccine is a weakened germ that trains the body; a serum provides ready-made antibodies.'],
        ['СПИД', 'AIDS', 'ВИЧ разрушает клетки иммунитета. Защита — безопасное поведение.', 'HIV destroys immune cells. Protection is safe behaviour.'],
      ],
    },
    {
      id: 'b8-blood-groups',
      title: ['Группы крови', 'Blood groups'],
      intro: [
        'Кровь разных людей бывает несовместима. Перед переливанием обязательно проверяют группу и резус.',
        'Blood from different people can clash, so group and Rh are always checked before a transfusion.',
      ],
      points: [
        ['Четыре группы', 'Four groups', 'I (0), II (A), III (B), IV (AB) — по белкам на эритроцитах.', 'O, A, B and AB, by proteins on red cells.'],
        ['Резус-фактор', 'Rh factor', 'Белок есть у 85% людей (Rh+). Несовместимость важна при беременности.', 'Present in 85% of people (Rh+); a mismatch matters in pregnancy.'],
      ],
    },
  ]),

  section(B, 8, 'circulation', ['Кровообращение и лимфообращение', 'Circulation'], [
    {
      id: 'b8-heart',
      title: ['Сердце', 'The heart'],
      intro: [
        'Сердце — насос размером с кулак, который за жизнь сокращается около 3 миллиардов раз.',
        'The heart is a fist-sized pump that beats about 3 billion times in a lifetime.',
      ],
      points: [
        ['Строение', 'Structure', 'Четыре камеры: два предсердия, два желудочка. Левый желудочек толще — гонит кровь по всему телу.', 'Four chambers: two atria, two ventricles. The left ventricle is thicker, pumping to the whole body.'],
        ['Клапаны', 'Valves', 'Пропускают кровь только в одну сторону.', 'Let blood flow one way only.'],
        ['Сердечный цикл', 'Cardiac cycle', 'Сокращение предсердий (0,1 с), желудочков (0,3 с), общая пауза (0,4 с) — сердце отдыхает половину времени.', 'Atria contract (0.1 s), ventricles (0.3 s), then a pause (0.4 s): the heart rests half the time.'],
      ],
    },
    {
      id: 'b8-vessels-circuits',
      title: ['Сосуды. Круги кровообращения', 'Vessels. Circuits'],
      intro: [
        'Кровь идёт по замкнутым кругам: через лёгкие, чтобы забрать кислород, и через тело, чтобы его отдать.',
        'Blood travels in closed loops: through the lungs to pick up oxygen and through the body to deliver it.',
      ],
      points: [
        ['Артерии, вены, капилляры', 'Arteries, veins, capillaries', 'Артерии несут кровь от сердца, вены — к сердцу, в капиллярах идёт обмен веществ.', 'Arteries carry blood away from the heart, veins back to it; capillaries are where exchange happens.'],
        ['Малый круг', 'Pulmonary circuit', 'Правый желудочек → лёгкие → левое предсердие.', 'Right ventricle → lungs → left atrium.'],
        ['Большой круг', 'Systemic circuit', 'Левый желудочек → аорта → органы → правое предсердие.', 'Left ventricle → aorta → organs → right atrium.'],
      ],
    },
    {
      id: 'b8-blood-flow',
      title: ['Движение крови. Лимфа', 'Blood flow. Lymph'],
      intro: [
        'Кровь течёт из-за разницы давлений. Лимфатическая система возвращает жидкость и фильтрует её от микробов.',
        'Blood flows down a pressure gradient. The lymphatic system returns fluid and filters out germs.',
      ],
      points: [
        ['Давление и пульс', 'Pressure and pulse', 'Норма около 120/80 мм рт. ст.; пульс — толчки стенок артерий, 60–80 в минуту.', 'Normal about 120/80 mmHg; the pulse is arterial throbbing, 60–80 a minute.'],
        ['Регуляция сердца', 'Heart control', 'Нервы и адреналин учащают ритм, в покое он замедляется.', 'Nerves and adrenaline speed it up; at rest it slows.'],
        ['Лимфатическая система', 'Lymphatic system', 'Лимфоузлы задерживают микробов — поэтому они набухают при простуде.', 'Lymph nodes trap germs, which is why they swell with a cold.'],
      ],
    },
    {
      id: 'b8-heart-health',
      title: ['Здоровье сердца. Кровотечения', 'Heart health. Bleeding'],
      intro: [
        'Сердечно-сосудистые болезни — главная причина смертности. Их предупреждают движение и здоровое питание.',
        'Heart and vessel disease is the leading cause of death, prevented by exercise and a healthy diet.',
      ],
      points: [
        ['Гипертония и инфаркт', 'Hypertension and heart attack', 'Повышенное давление изнашивает сосуды; при инфаркте часть сердца остаётся без крови.', 'High pressure wears out vessels; in a heart attack part of the heart loses its blood supply.'],
        ['Артериальное кровотечение', 'Arterial bleeding', 'Алая кровь бьёт фонтаном — жгут выше раны, записка со временем.', 'Bright red spurting blood: a tourniquet above the wound with a note of the time.'],
        ['Венозное и капиллярное', 'Venous and capillary', 'Тёмная кровь течёт ровно — давящая повязка; капиллярное — обработать и забинтовать.', 'Dark steady blood: a pressure bandage. Capillary: clean and dress.'],
      ],
    },
  ]),

  section(B, 8, 'breathing', ['Дыхание', 'Breathing'], [
    {
      id: 'b8-respiratory-organs',
      title: ['Органы дыхания. Газообмен', 'Respiratory organs. Gas exchange'],
      intro: [
        'Воздух проходит путь от носа до крошечных пузырьков-альвеол, где кислород уходит в кровь.',
        'Air travels from the nose to tiny alveoli, where oxygen passes into the blood.',
      ],
      points: [
        ['Воздухоносные пути', 'Airways', 'Носовая полость (греет и чистит воздух), гортань (голос), трахея, бронхи.', 'Nasal cavity (warms and filters air), larynx (voice), trachea, bronchi.'],
        ['Лёгкие', 'Lungs', '700 миллионов альвеол, площадь поверхности как у теннисного корта.', '700 million alveoli with the surface area of a tennis court.'],
        ['Газообмен', 'Gas exchange', 'В лёгких O₂ уходит в кровь, CO₂ — из крови; в тканях — наоборот, путём диффузии.', 'In the lungs O₂ enters the blood and CO₂ leaves; in tissues the reverse, by diffusion.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
    {
      id: 'b8-breathing-movements',
      title: ['Дыхательные движения. Регуляция', 'Breathing movements. Control'],
      intro: [
        'Лёгкие не имеют мышц. Вдох делают диафрагма и межрёберные мышцы, расширяя грудную клетку.',
        'Lungs have no muscles. The diaphragm and rib muscles expand the chest to breathe in.',
      ],
      points: [
        ['Вдох и выдох', 'In and out', 'Диафрагма опускается — объём растёт, давление падает, воздух входит. При выдохе — наоборот.', 'The diaphragm drops, volume grows, pressure falls and air rushes in; breathing out reverses it.'],
        ['Жизненная ёмкость лёгких', 'Vital capacity', 'Наибольший объём выдоха после глубокого вдоха — 3–5 литров.', 'The biggest breath out after a deep breath in: 3–5 litres.'],
        ['Регуляция дыхания', 'Control', 'Центр в продолговатом мозге реагирует на CO₂ в крови.', 'A centre in the medulla responds to CO₂ in the blood.'],
      ],
      sim: { engine: 'mkt_ideal_gas_laws' },
    },
    {
      id: 'b8-respiratory-health',
      title: ['Болезни органов дыхания. Первая помощь', 'Respiratory health. First aid'],
      intro: [
        'Курение и пыль разрушают лёгкие. При остановке дыхания счёт идёт на минуты.',
        'Smoking and dust damage the lungs. When breathing stops, every minute counts.',
      ],
      points: [
        ['Заболевания', 'Diseases', 'ОРВИ, бронхит, пневмония, туберкулёз.', 'Colds, bronchitis, pneumonia, tuberculosis.'],
        ['Вред курения', 'Smoking', 'Смолы оседают в лёгких, повышают риск рака и болезней сердца.', 'Tar coats the lungs and raises the risk of cancer and heart disease.'],
        ['Искусственное дыхание и массаж сердца', 'Rescue breathing and CPR', '30 нажатий на грудину и 2 вдоха; вызвать скорую.', '30 chest compressions and 2 breaths; call an ambulance.'],
      ],
    },
  ]),

  section(B, 8, 'digestion', ['Пищеварение', 'Digestion'], [
    {
      id: 'b8-nutrients',
      title: ['Питание и питательные вещества', 'Food and nutrients'],
      intro: [
        'Пища — источник энергии и строительного материала. Пищеварение расщепляет её до простых молекул.',
        'Food supplies energy and building material. Digestion breaks it into simple molecules.',
      ],
      points: [
        ['Питательные вещества', 'Nutrients', 'Белки → аминокислоты, углеводы → глюкоза, жиры → глицерин и жирные кислоты.', 'Proteins → amino acids, carbohydrates → glucose, fats → glycerol and fatty acids.'],
      ],
    },
    {
      id: 'b8-digestive-organs',
      title: ['Органы пищеварения', 'Digestive organs'],
      intro: [
        'Пищеварительный тракт длиной около 8 метров: каждый отдел выполняет свою часть работы.',
        'The digestive tract is about 8 metres long, each part doing its share.',
      ],
      points: [
        ['Ротовая полость', 'Mouth', 'Зубы измельчают пищу, слюна начинает расщеплять крахмал.', 'Teeth grind food; saliva starts breaking down starch.'],
        ['Глотка и пищевод', 'Throat and oesophagus', 'Волны сокращений проталкивают комок пищи в желудок.', 'Waves of contraction push food into the stomach.'],
        ['Желудок', 'Stomach', 'Соляная кислота убивает микробы, пепсин расщепляет белки.', 'Hydrochloric acid kills germs; pepsin breaks down proteins.'],
        ['Кишечник', 'Intestines', 'В тонком — окончательное расщепление и всасывание ворсинками, в толстом — всасывание воды.', 'The small intestine finishes digestion and absorbs through villi; the large absorbs water.'],
        ['Печень и поджелудочная железа', 'Liver and pancreas', 'Желчь дробит жиры, поджелудочный сок содержит ферменты для всех веществ.', 'Bile emulsifies fats; pancreatic juice has enzymes for everything.'],
      ],
    },
    {
      id: 'b8-digestion-regulation',
      title: ['Регуляция пищеварения. Гигиена', 'Regulating digestion. Hygiene'],
      intro: [
        'Павлов показал, что сок выделяется ещё до еды — от вида и запаха пищи.',
        'Pavlov showed that digestive juices flow before eating, triggered by the sight and smell of food.',
      ],
      points: [
        ['Исследования Павлова', 'Pavlov’s research', 'Условные рефлексы слюноотделения у собак; Нобелевская премия 1904 года.', 'Conditioned salivary reflexes in dogs; the 1904 Nobel Prize.'],
        ['Кишечные инфекции', 'Gut infections', 'Дизентерия, сальмонеллёз — от грязных рук и испорченной пищи.', 'Dysentery and salmonella from dirty hands and spoiled food.'],
        ['Гельминтозы', 'Worm infections', 'Паразитические черви; профилактика — гигиена и термическая обработка.', 'Parasitic worms, prevented by hygiene and cooking food well.'],
      ],
    },
  ]),

  section(B, 8, 'metabolism', ['Обмен веществ и энергии', 'Metabolism and energy'], [
    {
      id: 'b8-metabolism-stages',
      title: ['Этапы обмена веществ', 'Stages of metabolism'],
      intro: [
        'Организм одновременно строит свои вещества и разрушает их, получая энергию.',
        'The body builds its own substances and breaks them down for energy at the same time.',
      ],
      points: [
        ['Пластический обмен', 'Anabolism', 'Синтез белков, жиров, углеводов для роста и обновления.', 'Making proteins, fats and carbohydrates for growth and repair.'],
        ['Энергетический обмен', 'Catabolism', 'Окисление веществ с выделением энергии в виде АТФ.', 'Oxidising substances to release energy as ATP.'],
        ['Обмен белков, жиров, углеводов', 'Proteins, fats, carbohydrates', 'Белки — стройматериал, углеводы — быстрая энергия, жиры — запас.', 'Proteins build, carbohydrates give quick energy, fats store it.'],
        ['Вода и минеральные соли', 'Water and minerals', 'Взрослому нужно около 2 литров воды в день.', 'An adult needs about 2 litres of water a day.'],
      ],
      sim: { lab: 'biology_cell' },
    },
    {
      id: 'b8-vitamins',
      title: ['Витамины', 'Vitamins'],
      intro: [
        'Витамины нужны в крошечных количествах, но без них нарушается работа ферментов.',
        'Vitamins are needed in tiny amounts, but enzymes fail without them.',
      ],
      points: [
        ['Авитаминозы', 'Deficiency diseases', 'Нет витамина C — цинга, D — рахит, A — «куриная слепота».', 'No vitamin C causes scurvy, no D rickets, no A night blindness.'],
      ],
    },
    {
      id: 'b8-energy',
      title: ['Энергетика организма', 'Energy needs'],
      intro: [
        'Энергия пищи должна покрывать затраты организма. Избыток откладывается в жир.',
        'Food energy must cover what the body spends; any surplus is stored as fat.',
      ],
      points: [
        ['Энерготраты и нормы питания', 'Energy use and diet', 'Школьнику нужно 2400–2800 ккал в день, больше при спорте.', 'A teenager needs 2400–2800 kcal a day, more with sport.'],
      ],
    },
  ]),

  section(B, 8, 'excretion', ['Выделение', 'Excretion'], [
    {
      id: 'b8-kidneys',
      title: ['Почки. Образование мочи', 'Kidneys. Making urine'],
      intro: [
        'Почки — фильтр крови: за сутки через них проходит 1500 литров крови, а мочи образуется всего 1,5 литра.',
        'Kidneys filter blood: 1,500 litres pass through daily, yet only 1.5 litres of urine are made.',
      ],
      points: [
        ['Органы выделения', 'Excretory organs', 'Почки, кожа, лёгкие, кишечник.', 'Kidneys, skin, lungs, intestines.'],
        ['Нефрон', 'Nephron', 'Структурная единица почки: капсула с клубочком капилляров и извитой каналец.', 'The kidney’s unit: a capsule round a capillary knot and a coiled tubule.'],
        ['Первичная и вторичная моча', 'Primary and final urine', 'В капсуле фильтруется 150 л первичной мочи, в канальцах всё полезное всасывается обратно.', '150 L of filtrate forms in the capsules; the tubules reabsorb everything useful.'],
        ['Заболевания почек', 'Kidney disease', 'Камни, воспаления; переохлаждение и солёная пища вредны.', 'Stones and inflammation; chills and salty food are harmful.'],
      ],
      sim: { moment: 'moment_diffusion' },
    },
  ]),

  section(B, 8, 'skin', ['Кожа', 'Skin'], [
    {
      id: 'b8-skin',
      title: ['Строение и функции кожи', 'Skin structure and functions'],
      intro: [
        'Кожа — самый большой орган тела: около 2 м² и 4 кг. Она защищает, охлаждает и чувствует.',
        'Skin is the body’s largest organ, about 2 m² and 4 kg. It protects, cools and senses.',
      ],
      points: [
        ['Слои кожи', 'Layers', 'Эпидермис (защита), дерма (сосуды, рецепторы, железы), подкожная клетчатка (жир).', 'Epidermis (protection), dermis (vessels, receptors, glands), subcutaneous fat.'],
        ['Терморегуляция', 'Temperature control', 'В жару сосуды расширяются и выделяется пот, в холод — сужаются.', 'In heat vessels widen and we sweat; in cold they narrow.'],
        ['Производные кожи', 'Skin appendages', 'Волосы, ногти, потовые и сальные железы.', 'Hair, nails, sweat and oil glands.'],
      ],
    },
    {
      id: 'b8-skin-care',
      title: ['Уход за кожей. Первая помощь', 'Skin care. First aid'],
      intro: [
        'Закаливание тренирует сосуды кожи. Ожоги и обморожения требуют правильной помощи.',
        'Hardening trains the skin’s vessels. Burns and frostbite need the right first aid.',
      ],
      points: [
        ['Закаливание', 'Hardening', 'Постепенно: воздушные ванны, обтирания, контрастный душ.', 'Gradually: air baths, rub-downs, contrast showers.'],
        ['Ожоги', 'Burns', 'Охладить проточной водой 10–20 минут, не вскрывать пузыри, не мазать маслом.', 'Cool under running water for 10–20 minutes, don’t burst blisters or apply oil.'],
        ['Обморожение и тепловой удар', 'Frostbite and heatstroke', 'Обмороженное согревать постепенно, не растирать снегом; при тепловом ударе — в тень и пить.', 'Warm frostbite slowly, never rub with snow; for heatstroke move to shade and drink.'],
      ],
    },
  ]),

  section(B, 8, 'endocrine', ['Эндокринная система', 'Endocrine system'], [
    {
      id: 'b8-glands',
      title: ['Железы и гормоны', 'Glands and hormones'],
      intro: [
        'Железы внутренней секреции выбрасывают гормоны прямо в кровь и управляют ростом, обменом веществ, настроением.',
        'Endocrine glands release hormones straight into the blood, controlling growth, metabolism and mood.',
      ],
      points: [
        ['Виды желёз', 'Kinds of glands', 'Внешней секреции (потовые) — через протоки, внутренней — в кровь, смешанной (поджелудочная) — и так, и так.', 'Exocrine glands (sweat) use ducts, endocrine ones secrete into blood, mixed ones (pancreas) do both.'],
        ['Гипофиз', 'Pituitary', 'Главная железа: управляет остальными и выделяет гормон роста.', 'The master gland, controlling others and making growth hormone.'],
        ['Щитовидная, надпочечники, поджелудочная', 'Thyroid, adrenals, pancreas', 'Тироксин регулирует обмен, адреналин готовит к опасности, инсулин снижает сахар в крови.', 'Thyroxine sets metabolism, adrenaline prepares for danger, insulin lowers blood sugar.'],
      ],
    },
    {
      id: 'b8-endocrine-disorders',
      title: ['Нарушения работы желёз', 'Endocrine disorders'],
      intro: [
        'И избыток, и недостаток гормонов вызывают болезни.',
        'Too much or too little of a hormone causes disease.',
      ],
      points: [
        ['Сахарный диабет', 'Diabetes', 'Не хватает инсулина — сахар в крови растёт.', 'Too little insulin raises blood sugar.'],
        ['Базедова болезнь', 'Graves’ disease', 'Избыток тироксина: худоба, раздражительность, выпученные глаза.', 'Excess thyroxine: weight loss, irritability, bulging eyes.'],
        ['Гигантизм и карликовость', 'Gigantism and dwarfism', 'Избыток или недостаток гормона роста в детстве.', 'Too much or too little growth hormone in childhood.'],
      ],
    },
  ]),

  section(B, 8, 'nervous', ['Нервная система', 'Nervous system'], [
    {
      id: 'b8-nervous-structure',
      title: ['Значение и строение нервной системы', 'Structure of the nervous system'],
      intro: [
        'Нервная система принимает сигналы, обрабатывает их и управляет всем телом за доли секунды.',
        'The nervous system takes in signals, processes them and controls the whole body in fractions of a second.',
      ],
      points: [
        ['Центральная и периферическая', 'Central and peripheral', 'ЦНС — головной и спинной мозг, периферическая — нервы и узлы.', 'The CNS is brain and spinal cord; the peripheral system is nerves and ganglia.'],
        ['Соматическая и вегетативная', 'Somatic and autonomic', 'Соматическая управляет мышцами по нашей воле, вегетативная — органами без неё.', 'Somatic controls voluntary muscles; autonomic runs organs automatically.'],
        ['Симпатическая и парасимпатическая', 'Sympathetic and parasympathetic', 'Первая мобилизует («бей или беги»), вторая успокаивает и восстанавливает.', 'The first mobilises (“fight or flight”); the second calms and restores.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
    {
      id: 'b8-spinal-cord',
      title: ['Спинной мозг', 'Spinal cord'],
      intro: [
        'Спинной мозг проводит сигналы между мозгом и телом и замыкает простые рефлексы.',
        'The spinal cord relays signals between brain and body and handles simple reflexes.',
      ],
      points: [
        ['Строение', 'Structure', 'Серое вещество (тела нейронов) в форме бабочки внутри, белое (проводящие пути) снаружи.', 'Butterfly-shaped grey matter (neuron bodies) inside, white matter (tracts) outside.'],
        ['Рефлексы', 'Reflexes', 'Коленный рефлекс замыкается в спинном мозге, без участия головного.', 'The knee-jerk reflex runs through the spinal cord without the brain.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
    {
      id: 'b8-brain',
      title: ['Головной мозг', 'The brain'],
      intro: [
        'В мозге 86 миллиардов нейронов. Каждый отдел отвечает за свои функции.',
        'The brain has 86 billion neurons, and each part has its own job.',
      ],
      points: [
        ['Продолговатый мозг и мост', 'Medulla and pons', 'Дыхание, сердцебиение, кашель, глотание.', 'Breathing, heartbeat, coughing, swallowing.'],
        ['Мозжечок', 'Cerebellum', 'Координация и равновесие.', 'Coordination and balance.'],
        ['Средний и промежуточный', 'Midbrain and diencephalon', 'Ориентировочные рефлексы; гипоталамус — голод, жажда, температура.', 'Orienting reflexes; the hypothalamus handles hunger, thirst and temperature.'],
        ['Большие полушария', 'Cerebral hemispheres', 'Кора с долями: лобная (мышление, речь), теменная (осязание), височная (слух), затылочная (зрение).', 'The cortex lobes: frontal (thinking, speech), parietal (touch), temporal (hearing), occipital (vision).'],
      ],
    },
  ]),

  section(B, 8, 'senses', ['Анализаторы (органы чувств)', 'Senses'], [
    {
      id: 'b8-analyser',
      title: ['Строение анализатора', 'How a sense works'],
      intro: [
        'Любой анализатор — это рецептор, нервный путь и участок коры. Видит не глаз, а мозг.',
        'Every sense has a receptor, a nerve pathway and a region of cortex. It’s the brain, not the eye, that sees.',
      ],
      points: [
        ['Три звена', 'Three links', 'Рецептор превращает раздражитель в нервный импульс, нерв проводит, кора анализирует.', 'The receptor turns a stimulus into a nerve signal, the nerve carries it, the cortex interprets it.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
    {
      id: 'b8-vision',
      title: ['Зрительный анализатор', 'Vision'],
      intro: [
        'Через зрение мы получаем до 80% информации о мире.',
        'Up to 80% of what we learn about the world comes through vision.',
      ],
      points: [
        ['Строение глаза', 'The eye', 'Роговица, зрачок, хрусталик, стекловидное тело, сетчатка с палочками (сумерки) и колбочками (цвет).', 'Cornea, pupil, lens, vitreous body, and a retina of rods (dim light) and cones (colour).'],
        ['Нарушения зрения', 'Vision problems', 'Близорукость, дальнозоркость, косоглазие.', 'Short sight, long sight, squint.'],
        ['Гигиена зрения', 'Eye care', 'Расстояние 30–35 см до книги, перерывы в работе за экраном, хорошее освещение.', 'Keep books 30–35 cm away, take screen breaks, use good light.'],
      ],
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'b8-hearing',
      title: ['Слуховой анализатор. Равновесие', 'Hearing. Balance'],
      intro: [
        'Ухо улавливает колебания воздуха и превращает их в нервные сигналы. В нём же находится орган равновесия.',
        'The ear catches air vibrations and turns them into nerve signals. It also holds the balance organ.',
      ],
      points: [
        ['Строение уха', 'The ear', 'Наружное (ушная раковина), среднее (барабанная перепонка и три косточки), внутреннее (улитка).', 'Outer (pinna), middle (eardrum and three ossicles), inner (cochlea).'],
        ['Орган равновесия', 'Balance organ', 'Полукружные каналы с жидкостью чувствуют повороты головы.', 'Fluid-filled semicircular canals sense head rotation.'],
      ],
      sim: { moment: 'moment_doppler' },
    },
    {
      id: 'b8-other-senses',
      title: ['Другие анализаторы', 'Other senses'],
      intro: [
        'Кроме зрения и слуха, мы чувствуем прикосновения, положение тела, запахи и вкус.',
        'Besides sight and hearing we sense touch, body position, smell and taste.',
      ],
      points: [
        ['Мышечное и кожное чувство', 'Muscle sense and touch', 'Мы знаем положение руки с закрытыми глазами; кожа чувствует давление, холод, тепло, боль.', 'We know where our hand is with eyes closed; skin senses pressure, cold, heat and pain.'],
        ['Обоняние и вкус', 'Smell and taste', 'Нос различает тысячи запахов, язык — сладкое, солёное, кислое, горькое и умами.', 'The nose tells thousands of smells; the tongue sweet, salty, sour, bitter and umami.'],
      ],
    },
  ]),

  section(B, 8, 'behaviour', ['Высшая нервная деятельность', 'Higher nervous activity'], [
    {
      id: 'b8-reflexes',
      title: ['Рефлексы', 'Reflexes'],
      intro: [
        'Безусловные рефлексы врождённые, условные вырабатываются в течение жизни — так мы учимся.',
        'Unconditioned reflexes are inborn; conditioned ones are learned through life, which is how we learn.',
      ],
      points: [
        ['Безусловные и условные', 'Unconditioned and conditioned', 'Сосательный рефлекс у младенца — безусловный; слюна при звуке звонка у собаки Павлова — условный.', 'A baby’s sucking is unconditioned; Pavlov’s dog salivating at a bell is conditioned.'],
        ['Сеченов и Павлов', 'Sechenov and Pavlov', 'Сеченов показал рефлекторную природу психики, Павлов изучил условные рефлексы.', 'Sechenov showed the mind is reflex-based; Pavlov studied conditioned reflexes.'],
        ['Торможение', 'Inhibition', 'Условный рефлекс угасает, если его не подкреплять.', 'A conditioned reflex fades if it isn’t reinforced.'],
      ],
      sim: { moment: 'moment_neuron' },
    },
    {
      id: 'b8-sleep',
      title: ['Сон', 'Sleep'],
      intro: [
        'Сон — не выключение мозга, а особая работа: мозг сортирует память и восстанавливается.',
        'Sleep isn’t the brain switching off; it’s special work sorting memories and recovering.',
      ],
      points: [
        ['Фазы сна', 'Stages of sleep', 'Медленный сон (глубокий отдых) и быстрый (сновидения), сменяются каждые ~90 минут.', 'Slow-wave sleep (deep rest) and REM (dreams) alternate every ~90 minutes.'],
      ],
    },
    {
      id: 'b8-mind',
      title: ['Психика и поведение. Здоровье', 'Mind, behaviour and health'],
      intro: [
        'Память, внимание, мышление и речь — функции коры. Темперамент врождённый, характер формируется воспитанием.',
        'Memory, attention, thinking and speech are cortex functions. Temperament is inborn; character is shaped by upbringing.',
      ],
      points: [
        ['Познавательные процессы', 'Cognition', 'Память бывает кратковременной и долговременной; внимание — произвольным и непроизвольным.', 'Memory is short- or long-term; attention voluntary or involuntary.'],
        ['Темперамент и характер', 'Temperament and character', 'Сангвиник, холерик, флегматик, меланхолик.', 'Sanguine, choleric, phlegmatic, melancholic.'],
        ['Эмоции, стресс, режим дня', 'Emotions, stress, routine', 'Сон 8–9 часов, движение и общение помогают справляться со стрессом.', '8–9 hours of sleep, exercise and friends help cope with stress.'],
      ],
    },
  ]),

  section(B, 8, 'reproduction', ['Размножение и развитие человека', 'Human reproduction and development'], [
    {
      id: 'b8-reproduction',
      title: ['Половая система. Оплодотворение', 'Reproductive system. Fertilisation'],
      intro: [
        'Новая жизнь начинается со слияния двух клеток — яйцеклетки и сперматозоида.',
        'New life starts when two cells, an egg and a sperm, fuse.',
      ],
      points: [
        ['Половая система', 'Reproductive system', 'Половые железы вырабатывают гаметы и гормоны.', 'Gonads produce gametes and hormones.'],
        ['Оплодотворение', 'Fertilisation', 'Происходит в маточной трубе; оплодотворённая яйцеклетка — зигота — начинает делиться.', 'Happens in the oviduct; the fertilised egg, the zygote, starts dividing.'],
      ],
    },
    {
      id: 'b8-development',
      title: ['Развитие организма. Здоровье', 'Development. Health'],
      intro: [
        'За 9 месяцев из одной клетки развивается ребёнок. Здоровье будущих детей зависит и от генов, и от поведения родителей.',
        'In 9 months a single cell becomes a baby. Future children’s health depends on genes and on the parents’ behaviour.',
      ],
      points: [
        ['Внутриутробное развитие', 'Before birth', 'Плод питается через плаценту; алкоголь и курение матери ему опасны.', 'The fetus feeds through the placenta; the mother’s drinking and smoking endanger it.'],
        ['Развитие после рождения', 'After birth', 'Младенчество, детство, подростковый возраст, зрелость, старость.', 'Infancy, childhood, adolescence, adulthood, old age.'],
        ['Наследственные болезни', 'Hereditary diseases', 'Передаются через гены; помогает медико-генетическое консультирование.', 'Passed on through genes; genetic counselling helps.'],
        ['ИППП', 'STIs', 'Инфекции, передающиеся половым путём; защита — ответственное поведение и медицинская помощь.', 'Sexually transmitted infections; protection is responsible behaviour and medical care.'],
      ],
    },
  ]),
];
