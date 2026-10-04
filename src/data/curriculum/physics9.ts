import { section } from './types';

const P = 'physics';

export const PHYSICS_9 = [
  section(P, 9, 'motion', ['Законы взаимодействия и движения тел', 'Laws of motion and interaction'], [
    {
      id: 'p9-kinematics-basics',
      title: ['Основы кинематики', 'Kinematics basics'],
      intro: [
        'Кинематика описывает движение, не спрашивая о его причинах: где тело, куда и как быстро оно движется.',
        'Kinematics describes motion without asking why: where a body is, where it goes and how fast.',
      ],
      points: [
        ['Материальная точка', 'Point particle', 'Тело, размерами которого можно пренебречь. Самолёт на карте маршрута — точка, а в ангаре — нет.', 'A body whose size we can ignore. A plane on a route map is a point; in a hangar it isn’t.'],
        ['Система отсчёта', 'Frame of reference', 'Тело отсчёта, связанные с ним оси координат и часы.', 'A reference body with attached axes and a clock.'],
        ['Перемещение', 'Displacement', 'Вектор из начальной точки в конечную. Пробежал круг на стадионе — путь 400 м, перемещение 0.', 'The vector from start to finish. One lap of a track: distance 400 m, displacement 0.'],
        ['Проекция и координата', 'Projection and coordinate', 'Проекция вектора на ось — число со знаком. Координата меняется на величину проекции перемещения.', 'A vector’s projection on an axis is a signed number; the coordinate changes by the displacement’s projection.'],
      ],
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p9-uniform',
      title: ['Прямолинейное равномерное движение', 'Uniform straight-line motion'],
      intro: [
        'Тело за любые равные промежутки времени совершает одинаковые перемещения. Координата растёт линейно.',
        'A body covers equal displacements in equal times; its coordinate grows linearly.',
      ],
      points: [
        ['Уравнение движения', 'Equation of motion', 'x = x₀ + vₓt.', 'x = x₀ + vₓt.'],
        ['Графики', 'Graphs', 'x(t) — прямая с наклоном vₓ; vₓ(t) — горизонтальная прямая.', 'x(t) is a straight line with slope vₓ; vₓ(t) is horizontal.'],
      ],
      formula: 'x = x_0 + v_x t',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p9-accelerated',
      title: ['Равноускоренное движение', 'Uniform acceleration'],
      intro: [
        'Скорость меняется на одинаковую величину за каждую секунду. Так разгоняется автомобиль и падает камень.',
        'Velocity changes by the same amount every second, like a car speeding up or a falling stone.',
      ],
      points: [
        ['Ускорение', 'Acceleration', 'a = (v − v₀)/t, в м/с². Показывает, как быстро меняется скорость.', 'a = (v − v₀)/t in m/s², how quickly velocity changes.'],
        ['Скорость', 'Velocity', 'v = v₀ + at.', 'v = v₀ + at.'],
        ['Перемещение', 'Displacement', 's = v₀t + at²/2 или без времени: s = (v² − v₀²)/2a — так считают тормозной путь.', 's = v₀t + at²/2, or without time s = (v² − v₀²)/2a, used for braking distance.'],
        ['Графики v(t) и s(t)', 'Graphs v(t) and s(t)', 'v(t) — наклонная прямая, s(t) — парабола. Площадь под v(t) — перемещение.', 'v(t) is a sloped line, s(t) a parabola. The area under v(t) is displacement.'],
      ],
      formula: 's = v_0 t + \\frac{a t^2}{2}',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p9-relative',
      title: ['Относительность движения', 'Relative motion'],
      intro: [
        'Скорость и траектория зависят от системы отсчёта. Капли дождя падают вертикально, но из окна поезда кажутся косыми.',
        'Velocity and path depend on the frame. Rain falls vertically but looks slanted from a train window.',
      ],
      points: [
        ['Закон сложения скоростей', 'Velocity addition', 'v = v₁ + v₂ (векторно): пассажир идёт по вагону 1 м/с, поезд едет 20 м/с — относительно земли 21 м/с.', 'v = v₁ + v₂ (as vectors): walk 1 m/s along a 20 m/s train and you move 21 m/s relative to the ground.'],
      ],
      formula: '\\vec v = \\vec v_1 + \\vec v_2',
    },
    {
      id: 'p9-newton',
      title: ['Законы Ньютона', 'Newton’s laws'],
      intro: [
        'Три закона Ньютона объясняют любое механическое движение: от брошенного мяча до полёта к Луне.',
        'Newton’s three laws explain all mechanical motion, from a thrown ball to a trip to the Moon.',
      ],
      points: [
        ['Инерциальные системы', 'Inertial frames', 'Системы, где тело без воздействий движется равномерно. Разгоняющийся автобус — не такая система.', 'Frames where an undisturbed body moves uniformly. An accelerating bus isn’t one.'],
        ['Первый закон', 'First law', 'Если силы скомпенсированы, тело покоится или движется равномерно и прямолинейно.', 'With balanced forces a body stays at rest or moves uniformly in a straight line.'],
        ['Второй закон', 'Second law', 'F = ma: ускорение пропорционально силе и обратно пропорционально массе.', 'F = ma: acceleration is proportional to force and inversely to mass.'],
        ['Третий закон', 'Third law', 'Тела действуют друг на друга с равными по модулю и противоположными силами. Ты толкаешь стену — стена толкает тебя.', 'Bodies push each other with equal and opposite forces. Push a wall and it pushes you back.'],
      ],
      formula: '\\vec F = m \\vec a',
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p9-freefall',
      title: ['Свободное падение', 'Free fall'],
      intro: [
        'Без сопротивления воздуха все тела падают с одинаковым ускорением g ≈ 9,8 м/с². В вакуумной трубке перо и монета падают вместе.',
        'Without air resistance everything falls with the same acceleration g ≈ 9.8 m/s². In a vacuum tube a feather and a coin fall together.',
      ],
      points: [
        ['Ускорение свободного падения', 'Gravitational acceleration', 'g не зависит от массы тела, но немного меняется с широтой и высотой.', 'g doesn’t depend on mass but varies slightly with latitude and altitude.'],
        ['Бросок вверх', 'Throwing upward', 'Скорость уменьшается на 9,8 м/с каждую секунду, в верхней точке равна нулю. Время подъёма равно времени падения.', 'Speed falls by 9.8 m/s each second and is zero at the top. Time up equals time down.'],
      ],
      formula: 'h = \\frac{g t^2}{2}',
      sim: { engine: 'kinematics_velocity' },
    },
    {
      id: 'p9-gravitation',
      title: ['Закон всемирного тяготения', 'Universal gravitation'],
      intro: [
        'Любые два тела притягиваются с силой, пропорциональной их массам и обратно пропорциональной квадрату расстояния.',
        'Any two bodies attract with a force proportional to their masses and inversely proportional to the square of the distance.',
      ],
      points: [
        ['Формула', 'Formula', 'F = Gm₁m₂/r², где G = 6,67·10⁻¹¹ Н·м²/кг². Удвоишь расстояние — сила ослабнет вчетверо.', 'F = Gm₁m₂/r², G = 6.67·10⁻¹¹ N·m²/kg². Double the distance and the force drops fourfold.'],
        ['g на других планетах', 'g on other planets', 'g = GM/R². На Марсе 3,7 м/с², на Юпитере 24,8 м/с².', 'g = GM/R². Mars: 3.7 m/s²; Jupiter: 24.8 m/s².'],
      ],
      formula: 'F = G \\frac{m_1 m_2}{r^2}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p9-circular',
      title: ['Движение по окружности', 'Circular motion'],
      intro: [
        'Даже при постоянной по модулю скорости движение по кругу — ускоренное: направление скорости всё время меняется.',
        'Even at constant speed, moving in a circle is accelerated motion: the direction keeps changing.',
      ],
      points: [
        ['Центростремительное ускорение', 'Centripetal acceleration', 'a = v²/r, направлено к центру. Его создаёт сила: натяжение нити, трение шин, тяготение.', 'a = v²/r toward the centre, provided by a force: string tension, tyre friction, gravity.'],
        ['Период и частота', 'Period and frequency', 'T — время одного оборота, ν = 1/T — число оборотов в секунду. v = 2πr/T.', 'T is the time per turn, ν = 1/T turns per second; v = 2πr/T.'],
      ],
      formula: 'a = \\frac{v^2}{r}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p9-satellites',
      title: ['Искусственные спутники Земли', 'Artificial satellites'],
      intro: [
        'Спутник всё время падает на Землю, но летит вбок так быстро, что промахивается. Это и есть орбита.',
        'A satellite is always falling toward Earth, but moves sideways so fast it keeps missing. That’s an orbit.',
      ],
      points: [
        ['Первая космическая скорость', 'First cosmic velocity', 'v = √(gR) ≈ 7,9 км/с — минимальная скорость для круговой орбиты у поверхности.', 'v = √(gR) ≈ 7.9 km/s, the minimum speed for a low circular orbit.'],
        ['Применение', 'Uses', 'Связь, навигация GPS, прогноз погоды, наблюдение за Землёй.', 'Communications, GPS, weather forecasting, Earth observation.'],
      ],
      formula: 'v_1 = \\sqrt{g R} \\approx 7{,}9\\ \\text{км/с}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p9-momentum',
      title: ['Импульс. Закон сохранения импульса', 'Momentum and its conservation'],
      intro: [
        'Импульс — произведение массы на скорость. В замкнутой системе суммарный импульс тел не меняется, что бы между ними ни происходило.',
        'Momentum is mass times velocity. In a closed system total momentum never changes, whatever happens inside.',
      ],
      points: [
        ['Импульс тела', 'Momentum', 'p = mv, вектор, направлен как скорость.', 'p = mv, a vector along the velocity.'],
        ['Закон сохранения', 'Conservation', 'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′.', 'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′.'],
        ['Упругий и неупругий удар', 'Elastic and inelastic collisions', 'При упругом тела разлетаются и кинетическая энергия сохраняется; при неупругом — слипаются, часть энергии уходит в тепло.', 'Elastic: bodies bounce apart and keep their kinetic energy. Inelastic: they stick, losing some energy as heat.'],
      ],
      formula: '\\vec p = m \\vec v',
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p9-rocket',
      title: ['Реактивное движение', 'Jet propulsion'],
      intro: [
        'Ракета отбрасывает газы назад и по закону сохранения импульса получает импульс вперёд. Ей не нужно отталкиваться от воздуха.',
        'A rocket throws gas backward and, by conservation of momentum, gains momentum forward. It doesn’t need air to push against.',
      ],
      points: [
        ['Принцип', 'Principle', 'Отдача ружья и воздушный шарик, выпускающий воздух, — тоже реактивное движение.', 'A gun’s recoil and a deflating balloon are jet propulsion too.'],
        ['Освоение космоса', 'Space exploration', 'Циолковский рассчитал многоступенчатую ракету; Гагарин полетел в 1961 году.', 'Tsiolkovsky designed the multistage rocket; Gagarin flew in 1961.'],
      ],
      sim: { moment: 'moment_collision' },
    },
    {
      id: 'p9-energy',
      title: ['Энергия. Закон сохранения механической энергии', 'Energy and its conservation'],
      intro: [
        'Если нет трения, сумма кинетической и потенциальной энергии остаётся постоянной. Энергия лишь переходит из одного вида в другой.',
        'Without friction, kinetic plus potential energy stays constant. Energy only changes form.',
      ],
      points: [
        ['Работа силы', 'Work of a force', 'A = Fs·cos α. Сила, перпендикулярная перемещению, работы не совершает.', 'A = Fs·cos α. A force perpendicular to motion does no work.'],
        ['Кинетическая и потенциальная', 'Kinetic and potential', 'Eₖ = mv²/2, Eₚ = mgh.', 'E_k = mv²/2, E_p = mgh.'],
        ['Закон сохранения', 'Conservation law', 'Eₖ + Eₚ = const. Американские горки разгоняются под горку и замедляются на подъёме.', 'E_k + E_p = const. A roller coaster speeds up downhill and slows climbing.'],
      ],
      formula: 'E_k + E_p = \\text{const}',
      sim: { moment: 'moment_pendulum' },
    },
  ]),

  section(P, 9, 'oscillations', ['Механические колебания и волны. Звук', 'Oscillations, waves and sound'], [
    {
      id: 'p9-oscillations',
      title: ['Колебательное движение', 'Oscillation'],
      intro: [
        'Колебания — движения, которые повторяются через равные промежутки времени: качели, струна, сердце.',
        'Oscillations are motions that repeat at equal intervals: a swing, a string, a heartbeat.',
      ],
      points: [
        ['Свободные колебания', 'Free oscillations', 'Возникают после толчка за счёт внутренних сил системы.', 'Start after a push, driven by the system’s own forces.'],
        ['Маятники', 'Pendulums', 'Пружинный — груз на пружине; математический — грузик на длинной нити.', 'A spring pendulum is a mass on a spring; a simple pendulum a bob on a long string.'],
      ],
      sim: { moment: 'moment_pendulum' },
    },
    {
      id: 'p9-oscillation-quantities',
      title: ['Величины, описывающие колебания', 'Describing oscillations'],
      intro: [
        'Любое колебание описывается четырьмя величинами: размахом, временем одного цикла, числом циклов в секунду и фазой.',
        'Every oscillation is described by four quantities: size, cycle time, cycles per second and phase.',
      ],
      points: [
        ['Амплитуда', 'Amplitude', 'Наибольшее отклонение от положения равновесия.', 'The largest displacement from equilibrium.'],
        ['Период и частота', 'Period and frequency', 'T — время одного колебания; ν = 1/T, герцы. Маятника: T = 2π√(l/g) — не зависит от массы.', 'T is the time per cycle; ν = 1/T in hertz. A pendulum’s T = 2π√(l/g) doesn’t depend on mass.'],
        ['Фаза', 'Phase', 'Показывает, в какой точке цикла находится тело в данный момент.', 'Shows where in its cycle the body is right now.'],
      ],
      formula: 'T = 2\\pi \\sqrt{\\frac{l}{g}}',
      sim: { moment: 'moment_pendulum' },
    },
    {
      id: 'p9-harmonic',
      title: ['Гармонические колебания', 'Harmonic oscillations'],
      intro: [
        'Самые простые колебания: координата меняется по синусу или косинусу. Их график — синусоида.',
        'The simplest oscillations: position follows a sine or cosine, so the graph is a sine wave.',
      ],
      points: [
        ['График колебаний', 'Graph', 'По синусоиде видно амплитуду (высота) и период (расстояние между гребнями).', 'A sine graph shows amplitude (height) and period (distance between crests).'],
      ],
      formula: 'x = A \\cos(\\omega t)',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'p9-damped-resonance',
      title: ['Затухающие и вынужденные колебания. Резонанс', 'Damping, forcing and resonance'],
      intro: [
        'Трение гасит колебания. Но если раскачивать систему в такт её собственной частоте, амплитуда резко растёт — это резонанс.',
        'Friction damps oscillations. Push a system in step with its natural frequency, though, and the amplitude soars: resonance.',
      ],
      points: [
        ['Затухающие колебания', 'Damped oscillations', 'Амплитуда постепенно уменьшается — энергия уходит на трение.', 'The amplitude shrinks as energy goes to friction.'],
        ['Вынужденные колебания', 'Forced oscillations', 'Идут под действием периодической внешней силы, с её частотой.', 'Driven by a periodic outside force, at its frequency.'],
        ['Польза и вред резонанса', 'Good and bad resonance', 'Помогает раскачать качели и настроить радио; разрушал мосты, когда солдаты шагали в ногу.', 'Helps pump a swing and tune a radio; has broken bridges when soldiers marched in step.'],
      ],
      sim: { moment: 'moment_pendulum' },
    },
    {
      id: 'p9-waves',
      title: ['Механические волны', 'Mechanical waves'],
      intro: [
        'Волна — колебания, распространяющиеся в среде. Переносится энергия, а частицы среды лишь колеблются на месте.',
        'A wave is an oscillation travelling through a medium. Energy moves on; the particles only oscillate in place.',
      ],
      points: [
        ['Поперечные волны', 'Transverse waves', 'Частицы колеблются поперёк направления волны — волна на верёвке.', 'Particles move across the wave’s direction, like a wave on a rope.'],
        ['Продольные волны', 'Longitudinal waves', 'Частицы колеблются вдоль — сжатия и разрежения, как звук.', 'Particles move along it in compressions and rarefactions, like sound.'],
        ['Длина и скорость волны', 'Wavelength and speed', 'λ — расстояние между соседними гребнями; v = λν.', 'λ is the distance between crests; v = λν.'],
      ],
      formula: 'v = \\lambda \\nu',
      sim: { moment: 'moment_doppler' },
    },
    {
      id: 'p9-sound',
      title: ['Звук', 'Sound'],
      intro: [
        'Звук — продольная волна в воздухе, воде или твёрдом теле. В вакууме звука нет: в космосе взрывы беззвучны.',
        'Sound is a longitudinal wave in air, water or solids. There’s no sound in a vacuum: explosions in space are silent.',
      ],
      points: [
        ['Источники звука', 'Sources', 'Колеблющиеся тела: струна, голосовые связки, мембрана динамика.', 'Vibrating bodies: strings, vocal cords, speaker cones.'],
        ['Высота, громкость, тембр', 'Pitch, loudness, timbre', 'Высота зависит от частоты, громкость — от амплитуды, тембр — от набора обертонов.', 'Pitch follows frequency, loudness amplitude, timbre the mix of overtones.'],
        ['Скорость звука', 'Speed of sound', 'В воздухе ~340 м/с, в воде ~1500 м/с, в стали ~5000 м/с.', 'About 340 m/s in air, 1500 m/s in water, 5000 m/s in steel.'],
        ['Эхо', 'Echo', 'Отражённый звук. Летучие мыши и эхолоты по эху находят препятствия.', 'Reflected sound. Bats and sonar locate obstacles by echoes.'],
        ['Инфразвук и ультразвук', 'Infra- and ultrasound', 'Ниже 16 Гц и выше 20 000 Гц — мы их не слышим. Ультразвуком делают УЗИ.', 'Below 16 Hz and above 20,000 Hz we can’t hear. Ultrasound is used for scans.'],
      ],
      sim: { moment: 'moment_doppler' },
    },
  ]),

  section(P, 9, 'em-field', ['Электромагнитное поле', 'Electromagnetic field'], [
    {
      id: 'p9-magnetic-field',
      title: ['Магнитное поле. Правило буравчика', 'Magnetic field. Right-hand grip rule'],
      intro: [
        'Магнитное поле создают движущиеся заряды. Его направление вокруг тока определяют правилом буравчика.',
        'Moving charges create magnetic fields. The right-hand grip rule gives the field’s direction around a current.',
      ],
      points: [
        ['Однородное и неоднородное поле', 'Uniform and non-uniform fields', 'Внутри длинной катушки линии параллельны — поле однородное; у полюса магнита сгущаются — неоднородное.', 'Inside a long coil the lines are parallel (uniform); near a magnet’s pole they bunch up (non-uniform).'],
        ['Правило буравчика', 'Grip rule', 'Если буравчик вкручивать по току, вращение ручки покажет направление линий поля.', 'Screw a corkscrew along the current and the handle turns the way the field lines go.'],
      ],
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p9-ampere',
      title: ['Сила Ампера. Индукция поля', 'Ampère force. Field strength'],
      intro: [
        'На проводник с током в магнитном поле действует сила Ампера. Её направление находят правилом левой руки.',
        'A current in a magnetic field feels the Ampère force; the left-hand rule gives its direction.',
      ],
      points: [
        ['Правило левой руки', 'Left-hand rule', 'Линии поля входят в ладонь, четыре пальца — по току, большой палец покажет силу.', 'Field lines into the palm, four fingers along the current, the thumb shows the force.'],
        ['Магнитная индукция', 'Magnetic flux density', 'Характеристика силы поля B, единица — тесла (Тл). F = BIl.', 'B describes field strength, in teslas (T). F = BIl.'],
        ['Магнитный поток', 'Magnetic flux', 'Ф = BS cos α — «сколько линий» пронизывает контур, в веберах.', 'Φ = BS cos α, “how many lines” pass through a loop, in webers.'],
      ],
      formula: 'F_A = B I l \\sin\\alpha',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p9-induction',
      title: ['Электромагнитная индукция', 'Electromagnetic induction'],
      intro: [
        'При изменении магнитного потока через контур в нём возникает ток. Так работают все генераторы электростанций.',
        'Changing the magnetic flux through a loop induces a current. Every power-station generator works this way.',
      ],
      points: [
        ['Опыты Фарадея', 'Faraday’s experiments', 'Магнит, движущийся в катушке, вызывает ток; неподвижный — нет.', 'A magnet moving in a coil induces current; a still one doesn’t.'],
        ['Правило Ленца', 'Lenz’s law', 'Индукционный ток своим полем мешает изменению, которое его вызвало.', 'The induced current’s field opposes the change that caused it.'],
        ['Самоиндукция', 'Self-induction', 'Ток в катушке сам противится своему изменению: при выключении проскакивает искра.', 'A coil resists changes in its own current, which is why switches spark.'],
      ],
      formula: '\\mathcal{E} = -\\frac{\\Delta\\Phi}{\\Delta t}',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p9-ac',
      title: ['Переменный ток. Трансформатор', 'Alternating current. Transformers'],
      intro: [
        'Генератор даёт ток, который 50 раз в секунду меняет направление. Трансформатор повышает или понижает его напряжение.',
        'A generator gives current that reverses 50 times a second. A transformer steps its voltage up or down.',
      ],
      points: [
        ['Генератор', 'Generator', 'Рамка вращается в магнитном поле, поток через неё меняется — возникает переменная ЭДС.', 'A loop spins in a magnetic field; the changing flux produces an alternating EMF.'],
        ['Трансформатор', 'Transformer', 'Две катушки на общем сердечнике. U₁/U₂ = N₁/N₂.', 'Two coils on one core. U₁/U₂ = N₁/N₂.'],
        ['Передача электроэнергии', 'Power transmission', 'По ЛЭП передают ток высокого напряжения: при малом токе меньше потери на нагрев.', 'Power lines use high voltage: a small current means less heating loss.'],
      ],
      formula: '\\frac{U_1}{U_2} = \\frac{N_1}{N_2}',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p9-em-waves',
      title: ['Электромагнитные волны', 'Electromagnetic waves'],
      intro: [
        'Переменное электрическое поле порождает магнитное, а то — снова электрическое. Так рождается волна, летящая со скоростью света.',
        'A changing electric field creates a magnetic one, which creates an electric one again. That’s a wave travelling at light speed.',
      ],
      points: [
        ['Шкала ЭМ-волн', 'The EM spectrum', 'Радиоволны, микроволны, инфракрасное, видимый свет, ультрафиолет, рентген, гамма-лучи — от длинных к коротким.', 'Radio, microwaves, infrared, visible light, ultraviolet, X-rays, gamma rays, from long to short.'],
        ['Колебательный контур', 'Oscillating circuit', 'Конденсатор и катушка обмениваются энергией и создают электромагнитные колебания.', 'A capacitor and coil trade energy back and forth, making EM oscillations.'],
        ['Радиосвязь', 'Radio', 'Антенна излучает волну, на которую «нагружен» звук или изображение; приёмник выделяет его обратно.', 'An antenna sends a wave carrying sound or images; a receiver extracts them again.'],
      ],
      formula: 'c = \\lambda \\nu',
      sim: { moment: 'moment_doppler' },
    },
    {
      id: 'p9-light-em',
      title: ['Свет как ЭМ-волна. Дисперсия. Спектры', 'Light as an EM wave. Dispersion. Spectra'],
      intro: [
        'Видимый свет — узкий участок шкалы ЭМ-волн. Белый свет — смесь цветов, и призма разделяет их.',
        'Visible light is a narrow band of EM waves. White light is a mix of colours that a prism separates.',
      ],
      points: [
        ['Преломление и дисперсия', 'Refraction and dispersion', 'Разные цвета преломляются по-разному: фиолетовый сильнее красного. Так получается радуга.', 'Colours bend by different amounts, violet more than red. That makes rainbows.'],
        ['Цвет тел', 'Colour of objects', 'Красное яблоко отражает красный свет и поглощает остальной.', 'A red apple reflects red light and absorbs the rest.'],
        ['Сплошной и линейчатый спектры', 'Continuous and line spectra', 'Раскалённые тела дают сплошной спектр, газы — отдельные линии, по которым узнают вещество.', 'Hot solids give a continuous spectrum; gases give lines that identify them.'],
        ['Спектральный анализ', 'Spectral analysis', 'По линиям спектра узнали состав Солнца и звёзд, не долетая до них.', 'Spectral lines revealed what the Sun and stars are made of without visiting them.'],
      ],
      sim: { moment: 'moment_optics' },
    },
  ]),

  section(P, 9, 'nucleus', ['Строение атома и атомного ядра', 'The atom and the nucleus'], [
    {
      id: 'p9-radioactivity',
      title: ['Радиоактивность', 'Radioactivity'],
      intro: [
        'Некоторые ядра сами по себе распадаются и испускают излучение. Беккерель открыл это случайно — по засвеченной фотопластинке.',
        'Some nuclei break down on their own and emit radiation. Becquerel found it by chance on a fogged photographic plate.',
      ],
      points: [
        ['α-излучение', 'Alpha radiation', 'Ядра гелия. Задерживаются листом бумаги.', 'Helium nuclei, stopped by a sheet of paper.'],
        ['β-излучение', 'Beta radiation', 'Быстрые электроны. Задерживаются алюминиевой пластинкой.', 'Fast electrons, stopped by aluminium foil.'],
        ['γ-излучение', 'Gamma radiation', 'Жёсткие ЭМ-волны. Ослабляются только толстым слоем свинца или бетона.', 'High-energy EM waves, weakened only by thick lead or concrete.'],
      ],
      sim: { engine: 'rutherford_alpha_atom' },
    },
    {
      id: 'p9-rutherford',
      title: ['Опыт Резерфорда. Планетарная модель', 'Rutherford’s experiment. The planetary model'],
      intro: [
        'Альфа-частицы почти все пролетали сквозь золотую фольгу, но редкие отскакивали назад. Значит, вся масса атома собрана в крошечном ядре.',
        'Almost all alpha particles passed through gold foil, but a few bounced back. So the atom’s mass sits in a tiny nucleus.',
      ],
      points: [
        ['Результат опыта', 'Result', 'Атом почти пустой: ядро в 100 000 раз меньше атома.', 'The atom is almost empty: the nucleus is 100,000 times smaller.'],
        ['Планетарная модель', 'Planetary model', 'Электроны движутся вокруг положительного ядра, как планеты вокруг Солнца.', 'Electrons circle a positive nucleus like planets round the Sun.'],
      ],
      sim: { engine: 'rutherford_alpha_atom' },
    },
    {
      id: 'p9-decay-rules',
      title: ['Радиоактивные превращения. Регистрация частиц', 'Nuclear transformations. Detecting particles'],
      intro: [
        'При распаде одно ядро превращается в другое. Сами частицы невидимы, но оставляют следы в приборах.',
        'In decay one nucleus turns into another. The particles are invisible but leave traces in detectors.',
      ],
      points: [
        ['Правила смещения', 'Displacement rules', 'α-распад: заряд −2, масса −4. β-распад: заряд +1, масса не меняется.', 'Alpha decay: charge −2, mass −4. Beta decay: charge +1, mass unchanged.'],
        ['Счётчик Гейгера', 'Geiger counter', 'Частица вызывает разряд в газе — счётчик щёлкает.', 'A particle triggers a discharge in gas, and the counter clicks.'],
        ['Камера Вильсона и пузырьковая камера', 'Cloud and bubble chambers', 'Частица оставляет след из капелек или пузырьков, как самолёт — инверсионный след.', 'A particle leaves a trail of droplets or bubbles, like a plane’s contrail.'],
      ],
      formula: '{}^{A}_{Z}X \\to {}^{A-4}_{Z-2}Y + {}^{4}_{2}\\mathrm{He}',
    },
    {
      id: 'p9-nucleus',
      title: ['Состав ядра. Изотопы. Ядерные силы', 'The nucleus. Isotopes. Nuclear forces'],
      intro: [
        'Ядро состоит из протонов и нейтронов. Их держат вместе ядерные силы — самые мощные в природе, но действующие на крошечном расстоянии.',
        'The nucleus is made of protons and neutrons, held by nuclear forces: the strongest in nature, but very short-ranged.',
      ],
      points: [
        ['Открытие протона и нейтрона', 'Discovering proton and neutron', 'Протон открыл Резерфорд (1919), нейтрон — Чедвик (1932).', 'Rutherford found the proton (1919), Chadwick the neutron (1932).'],
        ['Массовое и зарядовое числа', 'Mass and atomic numbers', 'Z — число протонов, A — протоны плюс нейтроны.', 'Z is the number of protons; A protons plus neutrons.'],
        ['Изотопы', 'Isotopes', 'Ядра одного элемента с разным числом нейтронов: ¹²C и ¹⁴C.', 'Nuclei of one element with different neutron counts, like ¹²C and ¹⁴C.'],
        ['Энергия связи и дефект масс', 'Binding energy and mass defect', 'Ядро легче суммы своих частиц. «Недостающая» масса — это энергия связи: E = Δm·c².', 'A nucleus is lighter than its parts. The missing mass is binding energy: E = Δm·c².'],
      ],
      formula: 'E_{св} = \\Delta m\\, c^2',
      sim: { lab: 'orbitals' },
    },
    {
      id: 'p9-fission',
      title: ['Деление урана. Ядерный реактор', 'Uranium fission. Nuclear reactors'],
      intro: [
        'Нейтрон раскалывает ядро урана на две части, выделяется энергия и ещё 2–3 нейтрона, которые раскалывают следующие ядра.',
        'A neutron splits a uranium nucleus in two, releasing energy and 2–3 more neutrons that split further nuclei.',
      ],
      points: [
        ['Цепная реакция', 'Chain reaction', 'Если каждый нейтрон вызывает новое деление, реакция лавинообразно нарастает.', 'If each neutron triggers another fission, the reaction snowballs.'],
        ['Ядерный реактор', 'Reactor', 'Регулирующие стержни поглощают лишние нейтроны и держат реакцию под контролем.', 'Control rods absorb spare neutrons to keep the reaction steady.'],
        ['Атомная энергетика', 'Nuclear power', 'Мало топлива и нет выбросов CO₂, но нужны защита и хранение отходов.', 'Little fuel and no CO₂, but it needs shielding and waste storage.'],
      ],
    },
    {
      id: 'p9-radiation-bio',
      title: ['Действие радиации. Период полураспада', 'Radiation effects. Half-life'],
      intro: [
        'Излучение повреждает клетки и ДНК. Радиоактивные ядра распадаются случайно, но в среднем за определённое время распадается ровно половина.',
        'Radiation damages cells and DNA. Nuclei decay at random, yet half of them always decay within a set time.',
      ],
      points: [
        ['Дозиметрия', 'Dosimetry', 'Дозиметр измеряет полученную дозу. Защита: время, расстояние, экран.', 'A dosimeter measures dose. Protection means less time, more distance, shielding.'],
        ['Период полураспада', 'Half-life', 'За время T₁/₂ распадается половина ядер. У ¹⁴C — 5730 лет, поэтому по нему датируют находки.', 'Half the nuclei decay in T½. Carbon-14’s is 5730 years, used to date finds.'],
      ],
      formula: 'N = N_0 \\cdot 2^{-t/T_{1/2}}',
    },
    {
      id: 'p9-fusion',
      title: ['Термоядерная реакция', 'Fusion'],
      intro: [
        'При огромной температуре лёгкие ядра сливаются в более тяжёлые и выделяют ещё больше энергии, чем при делении. Так светит Солнце.',
        'At enormous temperatures light nuclei fuse into heavier ones, releasing even more energy than fission. That’s how the Sun shines.',
      ],
      points: [
        ['Синтез гелия', 'Making helium', 'Четыре ядра водорода превращаются в одно ядро гелия.', 'Four hydrogen nuclei become one helium nucleus.'],
        ['Условия', 'Conditions', 'Миллионы градусов, чтобы ядра преодолели электрическое отталкивание.', 'Millions of degrees so nuclei can overcome electric repulsion.'],
      ],
    },
  ]),

  section(P, 9, 'universe', ['Строение и эволюция Вселенной', 'The Universe'], [
    {
      id: 'p9-solar-system',
      title: ['Солнечная система', 'The Solar System'],
      intro: [
        'Солнце и всё, что вокруг него обращается: 8 планет, их спутники, астероиды и кометы. Всё это возникло из газопылевого облака 4,6 млрд лет назад.',
        'The Sun and everything orbiting it: 8 planets, their moons, asteroids and comets, born from a cloud of gas and dust 4.6 billion years ago.',
      ],
      points: [
        ['Планеты земной группы', 'Rocky planets', 'Меркурий, Венера, Земля, Марс — небольшие, каменные, плотные.', 'Mercury, Venus, Earth, Mars: small, rocky and dense.'],
        ['Планеты-гиганты', 'Giant planets', 'Юпитер, Сатурн, Уран, Нептун — газовые и ледяные, с кольцами и множеством спутников.', 'Jupiter, Saturn, Uranus, Neptune: gas and ice giants with rings and many moons.'],
        ['Малые тела', 'Small bodies', 'Астероиды, кометы с хвостами из газа, метеоры — «падающие звёзды».', 'Asteroids, comets with gas tails, meteors or “shooting stars”.'],
      ],
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p9-sun-stars',
      title: ['Солнце и звёзды', 'The Sun and stars'],
      intro: [
        'Солнце — обычная звезда: раскалённый шар газа, в недрах которого идут термоядерные реакции.',
        'The Sun is an ordinary star: a ball of hot gas with fusion reactions in its core.',
      ],
      points: [
        ['Строение Солнца', 'The Sun’s structure', 'Ядро, зона излучения, конвективная зона, фотосфера, корона.', 'Core, radiative zone, convective zone, photosphere, corona.'],
        ['Эволюция звёзд', 'Stellar evolution', 'Звезда рождается из облака, живёт за счёт синтеза и умирает белым карликом, нейтронной звездой или чёрной дырой.', 'A star forms from a cloud, lives by fusion and dies as a white dwarf, neutron star or black hole.'],
      ],
    },
    {
      id: 'p9-galaxies',
      title: ['Галактики. Расширение Вселенной', 'Galaxies. The expanding Universe'],
      intro: [
        'Звёзды собраны в галактики. Наша — Млечный Путь, в ней сотни миллиардов звёзд. Галактики разбегаются друг от друга.',
        'Stars gather into galaxies. Ours, the Milky Way, holds hundreds of billions. Galaxies are flying apart.',
      ],
      points: [
        ['Галактики', 'Galaxies', 'Спиральные, эллиптические и неправильные. Ближайшая крупная — Туманность Андромеды.', 'Spiral, elliptical and irregular. The nearest big one is Andromeda.'],
        ['Закон Хаббла', 'Hubble’s law', 'Чем дальше галактика, тем быстрее она удаляется: v = H·r. Вселенная расширяется.', 'The farther a galaxy, the faster it recedes: v = H·r. The Universe is expanding.'],
      ],
      formula: 'v = H r',
    },
  ]),
];
