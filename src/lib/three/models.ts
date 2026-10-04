import type { PartInfo } from './ThreeStage';

export type ModelId = 'skeleton' | 'heart' | 'organs' | 'brain' | 'fish' | 'fox';

const i = (ru: string, en: string, tRu: string, tEn: string): PartInfo => ({ title: { ru, en }, text: { ru: tRu, en: tEn } });

export interface Hotspot {
  /** position in the model's normalised space (model fitted to a height of 3 units, base at y = 0) */
  pos: [number, number, number];
  info: PartInfo;
  /** project the marker onto the model surface: cast from +x ('side') or from above ('top') */
  snap?: 'side' | 'top';
}

export interface ModelConfig {
  id: ModelId;
  url: string;
  title: { ru: string; en: string };
  intro: { ru: string; en: string };
  /** info for named mesh nodes in the GLB */
  parts: Record<string, PartInfo>;
  hotspots?: Hotspot[];
  /** fit size: the model's largest dimension is scaled to this */
  fit?: number;
  credit: string;
  explodable?: boolean;
  /** camera direction multipliers (× largest size), default a 3/4 view */
  view?: [number, number, number];
}

const BP3D = 'BodyParts3D, © The Database Center for Life Science, CC BY 4.0';

export const MODELS: Record<ModelId, ModelConfig> = {
  skeleton: {
    id: 'skeleton',
    url: '/models/skeleton.glb',
    title: { ru: 'Скелет человека', en: 'Human skeleton' },
    intro: {
      ru: 'Настоящая анатомическая модель по данным томографии: 206 костей, собранных в отделы. Нажимай на отделы, раздвигай их и прячь лишние.',
      en: 'A real anatomical model built from scan data: 206 bones grouped into regions. Tap a region, spread them apart or hide the rest.',
    },
    parts: {
      skull: i('Череп', 'Skull', '23 кости. Мозговой отдел защищает мозг, лицевой образует лицо. Подвижна только нижняя челюсть.', '23 bones. The cranium protects the brain; the face bones shape the face. Only the lower jaw moves.'),
      vertebral_column: i('Позвоночник', 'Spine', '33–34 позвонка: 7 шейных, 12 грудных, 5 поясничных, крестец и копчик. Четыре изгиба работают как пружина.', '33–34 vertebrae: 7 neck, 12 chest, 5 lower back, plus sacrum and coccyx. Four curves act as a spring.'),
      rib_cage: i('Грудная клетка', 'Rib cage', '12 пар рёбер и грудина. Защищает сердце и лёгкие и двигается при дыхании.', '12 pairs of ribs and the breastbone. It guards heart and lungs and moves as you breathe.'),
      pectoral_girdle: i('Плечевой пояс', 'Shoulder girdle', 'Ключицы и лопатки соединяют руки с туловищем и дают плечу огромную подвижность.', 'Collarbones and shoulder blades attach the arms and give the shoulder its huge range.'),
      upper_limbs: i('Верхние конечности', 'Arms', 'Плечевая кость, лучевая и локтевая, 27 костей кисти. Противопоставленный большой палец позволяет брать мелкие предметы.', 'Humerus, radius and ulna, plus 27 hand bones. The opposable thumb lets us grip small things.'),
      pelvis: i('Тазовый пояс', 'Pelvis', 'Тазовые кости и крестец образуют чашу, которая держит органы и переносит вес на ноги.', 'Hip bones and sacrum form a bowl that holds organs and passes weight to the legs.'),
      lower_limbs: i('Нижние конечности', 'Legs', 'Бедренная кость — самая длинная и прочная в теле. Свод стопы смягчает каждый шаг.', 'The femur is the body’s longest, strongest bone. The arch of the foot cushions each step.'),
    },
    fit: 3.2,
    credit: BP3D,
    explodable: true,
  },
  heart: {
    id: 'heart',
    url: '/models/heart.glb',
    title: { ru: 'Сердце человека', en: 'Human heart' },
    intro: {
      ru: 'Анатомическая модель сердца с камерами и крупными сосудами. Включи «рентген», чтобы увидеть стенки желудочков.',
      en: 'An anatomical heart with its chambers and great vessels. Switch on X-ray to see the ventricle walls.',
    },
    parts: {
      left_ventricle: i('Левый желудочек', 'Left ventricle', 'Самая мощная камера: стенка до 1,5 см. Гонит кровь в аорту и по всему телу.', 'The strongest chamber, with walls up to 1.5 cm. It pumps blood into the aorta and round the body.'),
      right_ventricle: i('Правый желудочек', 'Right ventricle', 'Отправляет венозную кровь в лёгкие по малому кругу.', 'Sends venous blood to the lungs through the pulmonary circuit.'),
      left_atrium: i('Левое предсердие', 'Left atrium', 'Принимает кровь, богатую кислородом, из лёгочных вен.', 'Receives oxygen-rich blood from the pulmonary veins.'),
      right_atrium: i('Правое предсердие', 'Right atrium', 'Принимает кровь от всего тела по полым венам. Здесь же водитель ритма сердца.', 'Receives blood from the body via the venae cavae and holds the heart’s pacemaker.'),
      aorta: i('Аорта', 'Aorta', 'Самая крупная артерия, диаметр около 3 см. Начало большого круга кровообращения.', 'The largest artery, about 3 cm wide: the start of the systemic circuit.'),
      pulmonary_trunk: i('Лёгочный ствол', 'Pulmonary trunk', 'Несёт венозную кровь от правого желудочка к лёгким.', 'Carries venous blood from the right ventricle to the lungs.'),
      veins: i('Полые вены', 'Venae cavae', 'Возвращают кровь от тела в правое предсердие.', 'Return blood from the body to the right atrium.'),
      heart_other: i('Стенки и клапаны', 'Walls and valves', 'Миокард, перегородки и фиброзный скелет сердца, к которому крепятся клапаны.', 'Myocardium, septa and the fibrous skeleton that anchors the valves.'),
    },
    fit: 2.6,
    credit: BP3D,
    explodable: true,
  },
  organs: {
    id: 'organs',
    url: '/models/organs.glb',
    title: { ru: 'Внутренние органы', en: 'Internal organs' },
    intro: {
      ru: 'Органы грудной и брюшной полости на своих местах. Скрывай системы и раздвигай органы, чтобы увидеть, что за чем лежит.',
      en: 'Chest and abdominal organs in place. Hide systems and spread organs apart to see what lies behind what.',
    },
    parts: {
      brain: i('Головной мозг', 'Brain', 'Около 1,4 кг и 86 миллиардов нейронов. Потребляет 20% энергии тела.', 'About 1.4 kg and 86 billion neurons, using 20% of the body’s energy.'),
      lungs: i('Лёгкие', 'Lungs', 'Правое из трёх долей, левое из двух — чтобы уступить место сердцу. 700 млн альвеол.', 'The right lung has three lobes, the left two to make room for the heart. 700 million alveoli.'),
      trachea: i('Трахея и бронхи', 'Trachea and bronchi', 'Хрящевые кольца не дают трубке спадаться при вдохе.', 'Rings of cartilage stop the airway collapsing as you breathe in.'),
      heart: i('Сердце', 'Heart', 'Мышечный насос размером с кулак между лёгкими.', 'A fist-sized muscular pump between the lungs.'),
      esophagus: i('Пищевод', 'Oesophagus', 'Мышечная трубка ~25 см. Проталкивает пищу волнами сокращений.', 'A ~25 cm muscular tube that pushes food down in waves.'),
      liver: i('Печень', 'Liver', 'Самая крупная железа (1,5 кг). Обезвреживает яды, хранит гликоген, вырабатывает желчь.', 'The largest gland (1.5 kg). It neutralises toxins, stores glycogen and makes bile.'),
      gallbladder: i('Желчный пузырь', 'Gallbladder', 'Копит желчь и выпускает её в кишечник, когда приходит жирная пища.', 'Stores bile and releases it when fatty food arrives.'),
      stomach: i('Желудок', 'Stomach', 'Соляная кислота и пепсин начинают переваривать белки. Объём до 1,5 л.', 'Hydrochloric acid and pepsin start digesting protein. Holds up to 1.5 L.'),
      pancreas: i('Поджелудочная железа', 'Pancreas', 'Выделяет пищеварительные ферменты и гормон инсулин.', 'Releases digestive enzymes and the hormone insulin.'),
      small_intestine: i('Тонкий кишечник', 'Small intestine', '5–6 метров. Ворсинки увеличивают площадь всасывания до 30 м².', '5–6 metres long; villi raise its absorbing surface to 30 m².'),
      large_intestine: i('Толстый кишечник', 'Large intestine', 'Всасывает воду и формирует каловые массы. Здесь живут полезные бактерии.', 'Absorbs water and forms faeces. Helpful bacteria live here.'),
      kidneys: i('Почки', 'Kidneys', 'Миллион нефронов в каждой фильтрует 1500 литров крови в сутки.', 'A million nephrons each filter 1,500 litres of blood a day.'),
      bladder: i('Мочевой пузырь и мочеточники', 'Bladder and ureters', 'Мочеточники несут мочу от почек, пузырь копит до 0,5 л.', 'Ureters carry urine from the kidneys; the bladder holds up to 0.5 L.'),
      spinal_cord: i('Спинной мозг', 'Spinal cord', 'Проводит сигналы между мозгом и телом и замыкает рефлексы.', 'Carries signals between brain and body and runs reflexes.'),
    },
    fit: 3.2,
    credit: BP3D,
    explodable: true,
  },
  brain: {
    id: 'brain',
    url: '/models/brain.glb',
    title: { ru: 'Головной мозг', en: 'The brain' },
    intro: {
      ru: 'Модель мозга с полушариями, мозжечком, стволом и желудочками. В режиме «рентген» видны полости с ликвором.',
      en: 'A brain with its hemispheres, cerebellum, stem and ventricles. X-ray mode reveals the fluid-filled cavities.',
    },
    parts: {
      cerebrum: i('Большие полушария', 'Cerebrum', 'Кора толщиной 2–4 мм отвечает за мышление, речь, движения и ощущения.', 'The 2–4 mm cortex handles thinking, speech, movement and sensation.'),
      cerebellum: i('Мозжечок', 'Cerebellum', 'Координирует движения и равновесие. В нём больше нейронов, чем во всём остальном мозге.', 'Coordinates movement and balance, and holds more neurons than the rest of the brain.'),
      brainstem: i('Ствол мозга', 'Brainstem', 'Продолговатый мозг, мост и средний мозг: дыхание, сердцебиение, глотание.', 'Medulla, pons and midbrain: breathing, heartbeat, swallowing.'),
      ventricles: i('Желудочки мозга', 'Ventricles', 'Полости со спинномозговой жидкостью, которая питает и защищает мозг.', 'Cavities of cerebrospinal fluid that nourish and cushion the brain.'),
    },
    fit: 2.4,
    credit: BP3D,
    explodable: true,
  },
  fish: {
    id: 'fish',
    url: '/models/fish.glb',
    title: { ru: 'Рыба (баррамунди)', en: 'Fish (barramundi)' },
    intro: {
      ru: 'Модель костной рыбы. Нажимай на светящиеся точки — они показывают, как рыба приспособлена к жизни в воде.',
      en: 'A bony fish. Tap the glowing points to see how a fish is adapted to life in water.',
    },
    parts: {
      BarramundiFish: i('Костная рыба', 'Bony fish', 'Обтекаемое тело, чешуя со слизью и плавники — всё уменьшает сопротивление воды.', 'A streamlined body, slimy scales and fins all cut water resistance.'),
    },
    hotspots: [
      { pos: [0, 0.62, 1.45], snap: 'side', info: i('Рот', 'Mouth', 'Хищник: втягивает добычу вместе с водой за доли секунды.', 'A predator that sucks prey in with water in a split second.') },
      { pos: [0, 0.82, 1.18], snap: 'side', info: i('Глаз', 'Eye', 'Без век: роговицу постоянно омывает вода.', 'No eyelids: water keeps the cornea moist.') },
      { pos: [0, 0.62, 0.85], snap: 'side', info: i('Жаберная крышка', 'Gill cover', 'Под ней жабры: вода проходит через них, и кровь забирает растворённый кислород.', 'The gills lie beneath: water flows through and blood takes up dissolved oxygen.') },
      { pos: [0, 1.3, 0.1], snap: 'top', info: i('Спинной плавник', 'Dorsal fin', 'Колючие лучи защищают от хищников и не дают рыбе крениться.', 'Spiny rays deter predators and keep the fish upright.') },
      { pos: [0, 0.45, 0.6], snap: 'side', info: i('Грудной плавник', 'Pectoral fin', 'Работает как руль: поворот, торможение, зависание.', 'Acts as a rudder for turning, braking and hovering.') },
      { pos: [0, 0.72, -0.2], snap: 'side', info: i('Боковая линия', 'Lateral line', 'Ряд чувствительных чешуй ощущает течение и движение рядом — «шестое чувство» рыб.', 'A row of sensitive scales feels currents and nearby movement, a fish’s sixth sense.') },
      { pos: [0, 0.78, -1.28], snap: 'side', info: i('Хвостовой плавник', 'Tail fin', 'Главный двигатель: рыба толкается от воды взмахами хвоста.', 'The main engine: the fish pushes off the water with tail strokes.') },
    ],
    fit: 3,
    view: [0.95, 0.15, 0.35],
    credit: 'Barramundi Fish, Khronos glTF Sample Assets, CC0',
  },
  fox: {
    id: 'fox',
    url: '/models/fox.glb',
    title: { ru: 'Лисица — хищное млекопитающее', en: 'Fox, a carnivorous mammal' },
    intro: {
      ru: 'Модель с анимацией: лиса осматривается, идёт и бежит. Останавливай и перематывай движение, чтобы рассмотреть работу ног.',
      en: 'An animated model: the fox looks around, walks and runs. Pause and scrub the motion to study how the legs move.',
    },
    parts: {
      fox: i('Обыкновенная лисица', 'Red fox', 'Отряд хищные. Шерсть, теплокровность, острые клыки и превосходный слух — охотится даже под снегом.', 'Order Carnivora. Fur, warm blood, sharp canines and superb hearing: it even hunts under snow.'),
    },
    fit: 2.6,
    view: [1.0, 0.25, 0.7],
    credit: 'Fox: model PixelMannen (CC0), rig & animation tomkranis (CC BY 4.0), glTF conversion AsoboStudio & scurest (CC BY 4.0)',
  },
};
