import { section } from './types';

const P = 'physics';

export const PHYSICS_11 = [
  section(P, 11, 'magnetic', ['Магнитное поле', 'Magnetic field'], [
    {
      id: 'p11-b-field',
      title: ['Магнитное поле и его характеристики', 'The magnetic field'],
      intro: [
        'Токи взаимодействуют через магнитное поле: параллельные токи в одну сторону притягиваются, в разные — отталкиваются.',
        'Currents interact through the magnetic field: parallel currents in the same direction attract; opposite ones repel.',
      ],
      points: [
        ['Взаимодействие токов', 'Interacting currents', 'Опыт Ампера с двумя параллельными проводниками.', 'Ampère’s experiment with two parallel wires.'],
        ['Вектор магнитной индукции', 'Flux density vector', 'B показывает силу и направление поля; его направление — по северному концу стрелки компаса.', 'B gives the field’s strength and direction, along a compass needle’s north end.'],
        ['Линии индукции', 'Field lines', 'Всегда замкнуты: у магнитного поля нет «зарядов», с которых линии начинались бы.', 'Always closed: magnetism has no “charges” for lines to start from.'],
      ],
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p11-ampere',
      title: ['Сила Ампера', 'The Ampère force'],
      intro: [
        'На проводник с током в магнитном поле действует сила F = BIl sin α. Она приводит в движение все электромоторы.',
        'A current in a magnetic field feels F = BIl sin α. It drives every electric motor.',
      ],
      points: [
        ['Модуль и направление', 'Size and direction', 'Максимальна, когда ток перпендикулярен полю. Направление — по правилу левой руки.', 'Greatest when the current is perpendicular to the field; direction by the left-hand rule.'],
        ['Применение', 'Uses', 'Стрелочные амперметры, громкоговорители, электродвигатели.', 'Moving-coil meters, loudspeakers, motors.'],
      ],
      formula: 'F_A = B I l \\sin\\alpha',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p11-lorentz',
      title: ['Сила Лоренца', 'The Lorentz force'],
      intro: [
        'Магнитное поле действует на каждую движущуюся заряженную частицу и закручивает её по окружности.',
        'A magnetic field acts on every moving charge and bends it into a circle.',
      ],
      points: [
        ['Формула', 'Formula', 'F = qvB sin α. Сила перпендикулярна скорости и работы не совершает.', 'F = qvB sin α. It’s perpendicular to velocity and does no work.'],
        ['Радиус и период', 'Radius and period', 'r = mv/(qB), T = 2πm/(qB) — период не зависит от скорости.', 'r = mv/(qB), T = 2πm/(qB): the period doesn’t depend on speed.'],
        ['Масс-спектрограф и циклотрон', 'Mass spectrometer and cyclotron', 'По радиусу траектории разделяют изотопы; в циклотроне частицы разгоняют по спирали.', 'Path radius separates isotopes; a cyclotron spirals particles up to speed.'],
      ],
      formula: 'F_L = q v B \\sin\\alpha',
      sim: { engine: 'lorentz_ampere_force' },
    },
    {
      id: 'p11-magnetic-matter',
      title: ['Магнитные свойства вещества', 'Magnetic materials'],
      intro: [
        'Вещества по-разному реагируют на магнитное поле: одни чуть ослабляют его, другие чуть усиливают, третьи — в тысячи раз.',
        'Materials respond differently: some slightly weaken a field, some slightly strengthen it, some multiply it thousands of times.',
      ],
      points: [
        ['Диамагнетики', 'Diamagnets', 'Выталкиваются из поля: вода, медь. Лягушку можно левитировать в сильном поле.', 'Pushed out of the field: water, copper. A frog can float in a strong field.'],
        ['Парамагнетики', 'Paramagnets', 'Слабо втягиваются: алюминий, кислород.', 'Weakly pulled in: aluminium, oxygen.'],
        ['Ферромагнетики', 'Ferromagnets', 'Сильно намагничиваются: железо, никель, кобальт. Из них делают магниты и сердечники.', 'Strongly magnetised: iron, nickel, cobalt. Used for magnets and cores.'],
      ],
    },
  ]),

  section(P, 11, 'induction', ['Электромагнитная индукция', 'Electromagnetic induction'], [
    {
      id: 'p11-flux-law',
      title: ['Магнитный поток. Закон индукции', 'Flux. The induction law'],
      intro: [
        'ЭДС индукции равна скорости изменения магнитного потока через контур. Неважно, что меняется: поле, площадь или угол.',
        'The induced EMF equals the rate of change of flux through a loop, whether the field, area or angle changes.',
      ],
      points: [
        ['Открытие', 'Discovery', 'Фарадей, 1831: двигая магнит в катушке, получил ток.', 'Faraday, 1831: moving a magnet in a coil produced a current.'],
        ['Магнитный поток', 'Magnetic flux', 'Ф = BS cos α.', 'Φ = BS cos α.'],
        ['Закон индукции', 'Induction law', 'ε = −ΔФ/Δt.', 'ε = −ΔΦ/Δt.'],
        ['Правило Ленца', 'Lenz’s law', 'Индукционный ток противодействует причине своего появления. Поэтому магнит медленно падает в медной трубе.', 'The induced current opposes its cause, which is why a magnet falls slowly through a copper pipe.'],
      ],
      formula: '\\mathcal{E} = -\\frac{\\Delta \\Phi}{\\Delta t}',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p11-vortex',
      title: ['Вихревое поле. ЭДС в движущемся проводнике', 'Vortex field. EMF in a moving wire'],
      intro: [
        'Меняющееся магнитное поле порождает вихревое электрическое поле с замкнутыми линиями. В движущемся проводнике ЭДС возникает из-за силы Лоренца.',
        'A changing magnetic field creates a vortex electric field with closed lines. In a moving wire the EMF comes from the Lorentz force.',
      ],
      points: [
        ['Вихревое поле', 'Vortex field', 'Работает в трансформаторах и индукционных плитах.', 'At work in transformers and induction hobs.'],
        ['ЭДС в проводнике', 'EMF in a wire', 'ε = Bvl sin α.', 'ε = Bvl sin α.'],
      ],
      formula: '\\mathcal{E} = B v l \\sin\\alpha',
      sim: { moment: 'moment_induction' },
    },
    {
      id: 'p11-self-induction',
      title: ['Самоиндукция. Энергия поля', 'Self-induction. Field energy'],
      intro: [
        'Катушка сопротивляется изменению своего тока. В её магнитном поле запасена энергия.',
        'A coil resists changes to its own current and stores energy in its magnetic field.',
      ],
      points: [
        ['Индуктивность', 'Inductance', 'ε = −LΔI/Δt, L в генри.', 'ε = −LΔI/Δt, L in henries.'],
        ['Энергия магнитного поля', 'Magnetic energy', 'W = LI²/2.', 'W = LI²/2.'],
        ['Электромагнитное поле', 'Electromagnetic field', 'Электрическое и магнитное поля — две стороны одного поля, которые порождают друг друга.', 'Electric and magnetic fields are two faces of one field, each creating the other.'],
      ],
      formula: 'W = \\frac{L I^2}{2}',
    },
  ]),

  section(P, 11, 'mech-osc', ['Механические колебания', 'Mechanical oscillations'], [
    {
      id: 'p11-free-osc',
      title: ['Свободные колебания. Маятники', 'Free oscillations. Pendulums'],
      intro: [
        'Период пружинного маятника зависит от массы и жёсткости, математического — только от длины нити и g.',
        'A spring pendulum’s period depends on mass and stiffness; a simple pendulum’s only on length and g.',
      ],
      points: [
        ['Пружинный маятник', 'Spring pendulum', 'T = 2π√(m/k).', 'T = 2π√(m/k).'],
        ['Математический маятник', 'Simple pendulum', 'T = 2π√(l/g). По нему можно измерить g.', 'T = 2π√(l/g), which can be used to measure g.'],
      ],
      formula: 'T = 2\\pi\\sqrt{\\frac{m}{k}}',
      sim: { moment: 'moment_pendulum' },
    },
    {
      id: 'p11-harmonic',
      title: ['Гармонические колебания', 'Harmonic oscillations'],
      intro: [
        'Колебания, при которых координата меняется по закону косинуса. Их можно представить как проекцию точки, бегущей по окружности.',
        'Oscillations where the coordinate follows a cosine, like the shadow of a point running round a circle.',
      ],
      points: [
        ['Уравнение', 'Equation', 'x = A cos(ωt + φ₀).', 'x = A cos(ωt + φ₀).'],
        ['Характеристики', 'Quantities', 'Амплитуда A, период T, частота ν, циклическая частота ω = 2πν, фаза ωt + φ₀.', 'Amplitude A, period T, frequency ν, angular frequency ω = 2πν, phase ωt + φ₀.'],
        ['Превращения энергии', 'Energy exchange', 'Кинетическая и потенциальная энергии переходят друг в друга дважды за период.', 'Kinetic and potential energy swap twice per period.'],
      ],
      formula: 'x = A\\cos(\\omega t + \\varphi_0)',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'p11-resonance',
      title: ['Затухающие и вынужденные колебания. Резонанс', 'Damped and forced oscillations. Resonance'],
      intro: [
        'Резонанс — резкий рост амплитуды, когда частота внешней силы совпадает с собственной частотой системы.',
        'Resonance is a sharp rise in amplitude when the driving frequency matches the system’s natural frequency.',
      ],
      points: [
        ['Затухание', 'Damping', 'Из-за трения амплитуда убывает экспоненциально.', 'Friction makes the amplitude decay exponentially.'],
        ['Резонанс', 'Resonance', 'Чем меньше трение, тем острее и выше резонансный пик.', 'Less friction means a taller, sharper resonance peak.'],
      ],
      sim: { moment: 'moment_pendulum' },
    },
  ]),

  section(P, 11, 'em-osc', ['Электромагнитные колебания', 'Electromagnetic oscillations'], [
    {
      id: 'p11-lc',
      title: ['Колебательный контур. Формула Томсона', 'LC circuit. Thomson’s formula'],
      intro: [
        'Заряженный конденсатор разряжается через катушку, ток создаёт магнитное поле, а потом перезаряжает конденсатор. Энергия качается туда-обратно.',
        'A charged capacitor discharges through a coil; the current builds a magnetic field that then recharges the capacitor. Energy sloshes back and forth.',
      ],
      points: [
        ['Превращения энергии', 'Energy exchange', 'Энергия электрического поля конденсатора переходит в энергию магнитного поля катушки и обратно.', 'The capacitor’s electric energy turns into the coil’s magnetic energy and back.'],
        ['Формула Томсона', 'Thomson’s formula', 'T = 2π√(LC). Так настраивают радиоприёмник на станцию.', 'T = 2π√(LC), used to tune a radio to a station.'],
      ],
      formula: 'T = 2\\pi\\sqrt{L C}',
      sim: { engine: 'lc_circuit_thomson' },
    },
    {
      id: 'p11-ac',
      title: ['Переменный ток', 'Alternating current'],
      intro: [
        'Ток в розетке меняется по синусоиде 50 раз в секунду. Для расчётов используют действующие значения.',
        'Mains current follows a sine wave 50 times a second; calculations use effective values.',
      ],
      points: [
        ['Действующие значения', 'Effective values', 'I = Iₘ/√2, U = Uₘ/√2. 220 В в розетке — действующее, амплитуда ≈ 311 В.', 'I = Iₘ/√2, U = Uₘ/√2. Mains 220 V is effective; the peak is ≈ 311 V.'],
        ['Активное, ёмкостное, индуктивное сопротивление', 'Resistance, capacitive and inductive reactance', 'X_C = 1/(ωC), X_L = ωL — конденсатор пропускает высокие частоты, катушка — низкие.', 'X_C = 1/(ωC), X_L = ωL: capacitors pass high frequencies, coils low.'],
        ['Резонанс в цепи', 'Circuit resonance', 'При X_L = X_C ток максимален — так выделяют нужную радиостанцию.', 'When X_L = X_C the current peaks, picking out one radio station.'],
      ],
      formula: 'I_{д} = \\frac{I_m}{\\sqrt 2}',
    },
    {
      id: 'p11-generator',
      title: ['Генератор. Трансформатор. Электроэнергия', 'Generators. Transformers. Power grids'],
      intro: [
        'Электростанции вырабатывают ток генераторами, трансформаторы повышают напряжение для передачи и понижают для потребителей.',
        'Power stations generate current; transformers step voltage up for transmission and down for homes.',
      ],
      points: [
        ['Генератор', 'Generator', 'Ротор-электромагнит вращается внутри неподвижных обмоток статора.', 'An electromagnet rotor spins inside stationary stator windings.'],
        ['Коэффициент трансформации', 'Turns ratio', 'k = U₁/U₂ = N₁/N₂.', 'k = U₁/U₂ = N₁/N₂.'],
        ['Передача энергии', 'Transmission', 'Потери P = I²R, поэтому ЛЭП работают на сотнях киловольт.', 'Losses P = I²R, so lines run at hundreds of kilovolts.'],
      ],
      formula: 'k = \\frac{N_1}{N_2}',
      sim: { moment: 'moment_induction' },
    },
  ]),

  section(P, 11, 'waves', ['Механические и электромагнитные волны', 'Mechanical and electromagnetic waves'], [
    {
      id: 'p11-mech-waves',
      title: ['Механические волны. Звук', 'Mechanical waves. Sound'],
      intro: [
        'Волна переносит энергию без переноса вещества. Её описывает уравнение бегущей волны.',
        'A wave carries energy without carrying matter, described by the travelling-wave equation.',
      ],
      points: [
        ['Продольные и поперечные', 'Longitudinal and transverse', 'Поперечные — только в твёрдых телах и на поверхности жидкости, продольные — везде.', 'Transverse only in solids and on liquid surfaces; longitudinal everywhere.'],
        ['Уравнение волны', 'Wave equation', 'y = A cos(ω(t − x/v)).', 'y = A cos(ω(t − x/v)).'],
        ['Звуковые волны', 'Sound waves', 'Упругие волны частотой 16 Гц – 20 кГц.', 'Elastic waves from 16 Hz to 20 kHz.'],
      ],
      formula: 'v = \\lambda \\nu',
      sim: { moment: 'moment_doppler' },
    },
    {
      id: 'p11-em-waves',
      title: ['Электромагнитные волны', 'Electromagnetic waves'],
      intro: [
        'Максвелл предсказал, а Герц обнаружил волны электромагнитного поля, летящие со скоростью света.',
        'Maxwell predicted and Hertz detected electromagnetic waves travelling at light speed.',
      ],
      points: [
        ['Опыты Герца', 'Hertz’s experiments', 'Искра в одном контуре вызывала искру в другом — волна прошла через воздух.', 'A spark in one circuit triggered a spark in another: a wave crossed the air.'],
        ['Свойства', 'Properties', 'Отражение, преломление, интерференция, дифракция, поляризация — как у света.', 'Reflection, refraction, interference, diffraction, polarisation, just like light.'],
        ['Плотность потока излучения', 'Intensity', 'Энергия через 1 м² за 1 с, убывает как 1/r² от источника.', 'Energy per m² per second, falling as 1/r² from the source.'],
      ],
      formula: 'c = \\lambda \\nu = 3 \\cdot 10^8\\ \\text{м/с}',
      sim: { engine: 'wave_interference_diffraction' },
    },
    {
      id: 'p11-radio',
      title: ['Радио. Радиолокация. Связь', 'Radio, radar and communications'],
      intro: [
        'Чтобы передать звук, его «сажают» на высокочастотную несущую волну, а в приёмнике отделяют обратно.',
        'To send sound we load it onto a high-frequency carrier wave and strip it off again in the receiver.',
      ],
      points: [
        ['Изобретение радио', 'Invention', 'Попов и Маркони в 1895–1896 годах.', 'Popov and Marconi in 1895–1896.'],
        ['Модуляция и детектирование', 'Modulation and detection', 'Амплитуда или частота несущей меняется в такт звуку; детектор выделяет звук.', 'The carrier’s amplitude or frequency follows the sound; a detector recovers it.'],
        ['Радиолокация', 'Radar', 'По времени возврата отражённого импульса находят расстояние до самолёта.', 'The echo’s return time gives a plane’s distance.'],
        ['Телевидение и связь', 'TV and telecoms', 'Сотовая связь, Wi-Fi, спутниковое телевидение используют ЭМ-волны разных диапазонов.', 'Mobile, Wi-Fi and satellite TV use EM waves in different bands.'],
      ],
    },
  ]),

  section(P, 11, 'optics', ['Оптика', 'Optics'], [
    {
      id: 'p11-light-speed',
      title: ['Скорость света', 'The speed of light'],
      intro: [
        'Свет — самое быстрое в природе: 300 000 км/с. От Солнца до Земли он идёт 8 минут.',
        'Light is the fastest thing in nature: 300,000 km/s. It takes 8 minutes from the Sun to Earth.',
      ],
      points: [
        ['Измерения', 'Measurements', 'Рёмер — по спутникам Юпитера, Физо — вращающимся зубчатым колесом.', 'Rømer used Jupiter’s moons; Fizeau a spinning toothed wheel.'],
      ],
      formula: 'c \\approx 3\\cdot 10^8\\ \\text{м/с}',
    },
    {
      id: 'p11-geometric',
      title: ['Геометрическая оптика', 'Geometric optics'],
      intro: [
        'Свет описывают лучами, которые отражаются и преломляются по строгим законам.',
        'Light is described as rays that reflect and refract by strict laws.',
      ],
      points: [
        ['Закон отражения', 'Law of reflection', 'Угол отражения равен углу падения.', 'The angle of reflection equals the angle of incidence.'],
        ['Закон преломления', 'Law of refraction', 'n₁ sin α = n₂ sin γ.', 'n₁ sin α = n₂ sin γ.'],
        ['Полное внутреннее отражение', 'Total internal reflection', 'При угле больше предельного (sin α₀ = n₂/n₁) свет полностью отражается. На этом работает оптоволокно.', 'Beyond the critical angle (sin α₀ = n₂/n₁) light reflects completely, which makes fibre optics work.'],
      ],
      formula: 'n_1 \\sin\\alpha = n_2 \\sin\\gamma',
      sim: { moment: 'moment_optics' },
    },
    {
      id: 'p11-lenses',
      title: ['Линзы. Формула тонкой линзы', 'Lenses. The thin-lens formula'],
      intro: [
        'Формула линзы связывает расстояние до предмета, до изображения и фокусное расстояние.',
        'The lens formula links the object distance, image distance and focal length.',
      ],
      points: [
        ['Формула тонкой линзы', 'Thin-lens formula', '1/F = 1/d + 1/f.', '1/F = 1/d + 1/f.'],
        ['Увеличение', 'Magnification', 'Γ = f/d = H/h.', 'Γ = f/d = H/h.'],
        ['Оптические приборы', 'Instruments', 'Лупа, микроскоп, телескоп, фотоаппарат.', 'Magnifier, microscope, telescope, camera.'],
      ],
      formula: '\\frac{1}{F} = \\frac{1}{d} + \\frac{1}{f}',
      sim: { engine: 'lenses_ray_tracing' },
    },
    {
      id: 'p11-dispersion-interference',
      title: ['Дисперсия и интерференция', 'Dispersion and interference'],
      intro: [
        'Свет — волна. Две когерентные волны усиливают или гасят друг друга — поэтому мыльный пузырь переливается.',
        'Light is a wave. Two coherent waves reinforce or cancel each other, which is why soap bubbles shimmer.',
      ],
      points: [
        ['Дисперсия', 'Dispersion', 'Показатель преломления зависит от длины волны — призма раскладывает белый свет.', 'The refractive index depends on wavelength, so a prism splits white light.'],
        ['Условия интерференции', 'Interference conditions', 'Максимум, если разность хода Δ = kλ; минимум, если Δ = (2k + 1)λ/2.', 'A bright fringe when the path difference Δ = kλ; dark when Δ = (2k + 1)λ/2.'],
        ['Кольца Ньютона и тонкие плёнки', 'Newton’s rings and thin films', 'Радужные разводы на лужах бензина и пузырях.', 'Rainbow swirls on oil puddles and bubbles.'],
      ],
      formula: '\\Delta = k\\lambda',
      sim: { engine: 'wave_interference_diffraction' },
    },
    {
      id: 'p11-diffraction',
      title: ['Дифракция. Решётка. Поляризация', 'Diffraction. Gratings. Polarisation'],
      intro: [
        'Свет огибает препятствия, сравнимые с длиной волны. Дифракционная решётка раскладывает свет в яркий спектр.',
        'Light bends round obstacles comparable to its wavelength. A diffraction grating spreads light into a bright spectrum.',
      ],
      points: [
        ['Дифракция', 'Diffraction', 'Поэтому за узкой щелью видна не резкая полоса, а система полос.', 'That’s why a narrow slit gives a set of fringes, not one sharp line.'],
        ['Дифракционная решётка', 'Diffraction grating', 'd sin φ = kλ. Компакт-диск — тоже решётка.', 'd sin φ = kλ. A CD acts as one.'],
        ['Поляризация', 'Polarisation', 'Доказывает, что свет — поперечная волна. Поляроидные очки гасят блики.', 'Shows light is transverse. Polaroid glasses cut glare.'],
      ],
      formula: 'd \\sin\\varphi = k\\lambda',
      sim: { engine: 'wave_interference_diffraction' },
    },
    {
      id: 'p11-spectra',
      title: ['Излучения и спектры', 'Radiation and spectra'],
      intro: [
        'Тела излучают свет по разным причинам. По спектру можно узнать, из чего состоит источник.',
        'Bodies emit light for different reasons, and the spectrum reveals what the source is made of.',
      ],
      points: [
        ['Виды излучений', 'Kinds of emission', 'Тепловое (Солнце, лампа), электролюминесценция (светодиод), хемилюминесценция (светлячки).', 'Thermal (Sun, bulb), electroluminescence (LED), chemiluminescence (fireflies).'],
        ['Спектральные аппараты и анализ', 'Spectroscopes and analysis', 'Каждый элемент даёт свой набор линий — «отпечаток пальца».', 'Each element gives its own set of lines, like a fingerprint.'],
        ['Инфракрасное и ультрафиолетовое', 'Infrared and ultraviolet', 'ИК греет (тепловизор), УФ вызывает загар и убивает микробы.', 'IR warms (thermal cameras); UV tans skin and kills germs.'],
        ['Рентгеновские лучи', 'X-rays', 'Проходят через мягкие ткани и задерживаются костями.', 'Pass through soft tissue but are stopped by bone.'],
        ['Шкала ЭМ-излучений', 'EM spectrum', 'От радиоволн длиной в километры до гамма-лучей короче атомного ядра.', 'From kilometre-long radio waves to gamma rays smaller than a nucleus.'],
      ],
    },
  ]),

  section(P, 11, 'relativity', ['Основы специальной теории относительности', 'Special relativity'], [
    {
      id: 'p11-postulates',
      title: ['Постулаты СТО', 'Postulates of relativity'],
      intro: [
        'Эйнштейн исходил из двух утверждений: законы природы одинаковы во всех инерциальных системах, а скорость света не зависит от движения источника.',
        'Einstein started from two ideas: the laws of nature are the same in all inertial frames, and light speed doesn’t depend on the source’s motion.',
      ],
      points: [
        ['Принцип относительности', 'Principle of relativity', 'Обобщает принцип Галилея на все явления, включая свет.', 'Extends Galileo’s principle to everything, light included.'],
        ['Постоянство скорости света', 'Constant light speed', 'Свет фар летящей ракеты движется с той же скоростью c.', 'The headlights of a speeding rocket still shine at c.'],
        ['Относительность одновременности', 'Relativity of simultaneity', 'События, одновременные для одного наблюдателя, не одновременны для другого.', 'Events simultaneous for one observer aren’t for another.'],
      ],
      sim: { moment: 'moment_relativity' },
    },
    {
      id: 'p11-relativistic-effects',
      title: ['Релятивистские эффекты', 'Relativistic effects'],
      intro: [
        'При скоростях, близких к скорости света, время идёт медленнее, а длины сокращаются вдоль движения.',
        'Near light speed, time runs slower and lengths shrink along the motion.',
      ],
      points: [
        ['Замедление времени', 'Time dilation', 'Δt = Δt₀/√(1 − v²/c²). Мюоны из космоса долетают до Земли только благодаря этому.', 'Δt = Δt₀/√(1 − v²/c²). Cosmic muons reach Earth only because of it.'],
        ['Сокращение длины', 'Length contraction', 'l = l₀√(1 − v²/c²).', 'l = l₀√(1 − v²/c²).'],
        ['Сложение скоростей', 'Velocity addition', 'v = (v₁ + v₂)/(1 + v₁v₂/c²) — сумма никогда не превысит c.', 'v = (v₁ + v₂)/(1 + v₁v₂/c²), which never exceeds c.'],
      ],
      formula: '\\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - v^2/c^2}}',
      sim: { moment: 'moment_relativity' },
    },
    {
      id: 'p11-emc2',
      title: ['Связь массы и энергии', 'Mass and energy'],
      intro: [
        'Масса — это запасённая энергия. Даже покоящееся тело обладает огромной энергией покоя.',
        'Mass is stored energy. Even a body at rest has enormous rest energy.',
      ],
      points: [
        ['E = mc²', 'E = mc²', 'В 1 грамме вещества — 9·10¹³ Дж, как в атомной бомбе средней мощности.', 'One gram of matter holds 9·10¹³ J, as much as a mid-sized atomic bomb.'],
        ['Энергия покоя', 'Rest energy', 'Освобождается частично при ядерных реакциях и полностью — при аннигиляции.', 'Partly released in nuclear reactions and fully in annihilation.'],
      ],
      formula: 'E_0 = m c^2',
      sim: { moment: 'moment_relativity' },
    },
  ]),

  section(P, 11, 'quantum', ['Квантовая физика', 'Quantum physics'], [
    {
      id: 'p11-quanta',
      title: ['Световые кванты. Фотоэффект', 'Light quanta. The photoelectric effect'],
      intro: [
        'Свет поглощается и испускается порциями — квантами. Поэтому выбить электрон из металла может только достаточно «синий» свет, а не яркий.',
        'Light is absorbed and emitted in packets called quanta. That’s why only “blue enough” light, not bright light, knocks electrons out of metal.',
      ],
      points: [
        ['Гипотеза Планка', 'Planck’s hypothesis', 'E = hν, h = 6,63·10⁻³⁴ Дж·с.', 'E = hν with h = 6.63·10⁻³⁴ J·s.'],
        ['Опыты Столетова и законы фотоэффекта', 'Stoletov’s experiments', 'Число электронов растёт с яркостью, а их энергия — только с частотой света.', 'Electron number grows with brightness; their energy only with frequency.'],
        ['Уравнение Эйнштейна', 'Einstein’s equation', 'hν = A + Eₖ.', 'hν = A + E_k.'],
        ['Красная граница', 'Threshold frequency', 'ν_min = A/h: ниже неё фотоэффекта нет при любой яркости.', 'ν_min = A/h: below it there’s no effect at any brightness.'],
        ['Фотоэлементы', 'Photocells', 'Солнечные батареи, датчики освещённости, турникеты.', 'Solar panels, light sensors, turnstiles.'],
      ],
      formula: 'h\\nu = A + E_k',
      sim: { engine: 'photoelectric_effect' },
    },
    {
      id: 'p11-photons',
      title: ['Фотоны. Давление света. Дуализм', 'Photons. Light pressure. Duality'],
      intro: [
        'Фотон — частица света без массы покоя, но с энергией и импульсом. При этом свет остаётся и волной.',
        'A photon is a particle of light with no rest mass but with energy and momentum, and light is still a wave too.',
      ],
      points: [
        ['Энергия и импульс фотона', 'Photon energy and momentum', 'E = hν, p = h/λ.', 'E = hν, p = h/λ.'],
        ['Давление света', 'Light pressure', 'Лебедев измерил его в 1900 году. Солнечный парус использует его для полёта.', 'Lebedev measured it in 1900; solar sails use it to fly.'],
        ['Гипотеза де Бройля', 'De Broglie’s hypothesis', 'Любая частица — тоже волна: λ = h/(mv). Электронный микроскоп работает на волнах электронов.', 'Every particle is also a wave: λ = h/(mv). Electron microscopes use electron waves.'],
        ['Химическое действие света', 'Chemistry of light', 'Фотография, фотосинтез, загар — свет запускает химические реакции.', 'Photography, photosynthesis, tanning: light drives chemical reactions.'],
      ],
      formula: 'p = \\frac{h}{\\lambda}',
      sim: { engine: 'photoelectric_effect' },
    },
  ]),

  section(P, 11, 'atomic', ['Атомная физика', 'Atomic physics'], [
    {
      id: 'p11-bohr',
      title: ['Постулаты Бора', 'Bohr’s postulates'],
      intro: [
        'Резерфорд показал ядро, но не объяснил, почему электрон не падает на него. Бор предположил, что электрон живёт только на разрешённых орбитах.',
        'Rutherford found the nucleus but couldn’t explain why electrons don’t fall in. Bohr proposed that electrons live only on allowed orbits.',
      ],
      points: [
        ['Стационарные состояния', 'Stationary states', 'На разрешённых орбитах электрон не излучает.', 'On allowed orbits the electron doesn’t radiate.'],
        ['Испускание и поглощение', 'Emission and absorption', 'При переходе между уровнями излучается фотон hν = Eₖ − Eₙ — так возникают линии спектра.', 'Jumping between levels emits a photon hν = E_k − E_n, producing spectral lines.'],
        ['Атом водорода', 'Hydrogen atom', 'Eₙ = −13,6/n² эВ. Модель точно предсказала спектр водорода.', 'E_n = −13.6/n² eV, which predicted hydrogen’s spectrum exactly.'],
      ],
      formula: 'h\\nu = E_k - E_n',
      sim: { lab: 'orbitals' },
    },
    {
      id: 'p11-lasers',
      title: ['Лазеры', 'Lasers'],
      intro: [
        'Лазер усиливает свет за счёт вынужденного излучения: фотон заставляет возбуждённый атом испустить точно такой же фотон.',
        'A laser amplifies light by stimulated emission: one photon makes an excited atom emit an identical photon.',
      ],
      points: [
        ['Вынужденное излучение', 'Stimulated emission', 'Фотоны выходят одного цвета, в одну сторону и в одной фазе.', 'The photons share colour, direction and phase.'],
        ['Применение', 'Uses', 'Сканеры штрихкодов, хирургия глаза, резка металла, оптоволоконная связь.', 'Barcode scanners, eye surgery, metal cutting, fibre-optic links.'],
      ],
      sim: { engine: 'photoelectric_effect' },
    },
  ]),

  section(P, 11, 'nuclear', ['Физика атомного ядра', 'Nuclear physics'], [
    {
      id: 'p11-detection',
      title: ['Регистрация частиц. Радиоактивность', 'Detecting particles. Radioactivity'],
      intro: [
        'Ядерные излучения невидимы, но их выдают щелчки счётчиков и следы в камерах.',
        'Nuclear radiation is invisible, but counters click and chambers show tracks.',
      ],
      points: [
        ['Методы регистрации', 'Detection', 'Счётчик Гейгера, камера Вильсона, пузырьковая камера, фотоэмульсия.', 'Geiger counter, cloud chamber, bubble chamber, photographic emulsion.'],
        ['Виды излучений', 'Kinds of radiation', 'α — ядра гелия, β — электроны, γ — фотоны высокой энергии.', 'α are helium nuclei, β electrons, γ high-energy photons.'],
        ['Правила смещения', 'Displacement rules', 'α: A − 4, Z − 2; β⁻: Z + 1.', 'α: A − 4, Z − 2; β⁻: Z + 1.'],
      ],
      sim: { engine: 'rutherford_alpha_atom' },
    },
    {
      id: 'p11-decay-law',
      title: ['Закон радиоактивного распада', 'The decay law'],
      intro: [
        'Распад отдельного ядра непредсказуем, но для огромного числа ядер закон точен: каждые T₁/₂ остаётся половина.',
        'A single nucleus decays unpredictably, but for huge numbers the law is exact: half remain every T½.',
      ],
      points: [
        ['Формула', 'Formula', 'N = N₀·2^(−t/T).', 'N = N₀·2^(−t/T).'],
        ['Изотопы', 'Isotopes', 'Радиоактивные изотопы используют в медицине, датировке и как метки.', 'Radioisotopes are used in medicine, dating and as tracers.'],
      ],
      formula: 'N = N_0 \\cdot 2^{-t/T_{1/2}}',
      sim: { engine: 'radioactive_decay_halflife' },
    },
    {
      id: 'p11-nucleus',
      title: ['Строение ядра. Энергия связи', 'Nuclear structure. Binding energy'],
      intro: [
        'Ядро — протоны и нейтроны, скреплённые ядерными силами. Масса ядра меньше суммы масс нуклонов — разница стала энергией связи.',
        'A nucleus is protons and neutrons held by nuclear forces. Its mass is less than its parts; the difference became binding energy.',
      ],
      points: [
        ['Открытие нейтрона', 'Discovery of the neutron', 'Чедвик, 1932 — после этого появилась протонно-нейтронная модель.', 'Chadwick, 1932, which led to the proton–neutron model.'],
        ['Ядерные силы', 'Nuclear forces', 'В 100 раз сильнее электрических, но действуют лишь на 10⁻¹⁵ м.', '100 times stronger than electric forces but reaching only 10⁻¹⁵ m.'],
        ['Удельная энергия связи', 'Binding energy per nucleon', 'Максимальна у железа. Поэтому энергию дают и деление тяжёлых, и синтез лёгких ядер.', 'Highest for iron, so both splitting heavy nuclei and fusing light ones release energy.'],
      ],
      formula: 'E_{св} = \\Delta m\\, c^2',
    },
    {
      id: 'p11-reactions',
      title: ['Ядерные реакции. Деление. Реактор', 'Nuclear reactions. Fission. Reactors'],
      intro: [
        'При ядерной реакции сохраняются заряд и число нуклонов, а энергетический выход определяется изменением массы.',
        'Nuclear reactions conserve charge and nucleon number; the energy yield comes from the change in mass.',
      ],
      points: [
        ['Энергетический выход', 'Energy yield', 'Q = (m_исх − m_прод)c².', 'Q = (m_initial − m_products)c².'],
        ['Цепная реакция и критическая масса', 'Chain reaction and critical mass', 'Если урана слишком мало, нейтроны вылетают наружу и реакция гаснет.', 'With too little uranium, neutrons escape and the reaction dies out.'],
        ['Ядерный реактор', 'Reactor', 'Топливо, замедлитель, регулирующие стержни, теплоноситель, защита.', 'Fuel, moderator, control rods, coolant, shielding.'],
      ],
      formula: '{}^{235}\\mathrm{U} + n \\to {}^{141}\\mathrm{Ba} + {}^{92}\\mathrm{Kr} + 3n',
    },
    {
      id: 'p11-fusion-use',
      title: ['Термоядерный синтез. Применение и защита', 'Fusion. Uses and protection'],
      intro: [
        'Синтез лёгких ядер питает звёзды. Управляемый синтез — мечта энергетики: топливо из воды и почти нет отходов.',
        'Fusing light nuclei powers stars. Controlled fusion is energy’s dream: fuel from water and almost no waste.',
      ],
      points: [
        ['Управляемый синтез', 'Controlled fusion', 'Плазму в сотни миллионов градусов удерживают магнитным полем (токамак, ИТЭР).', 'Plasma at hundreds of millions of degrees is held by magnetic fields (tokamak, ITER).'],
        ['Применение ядерной энергии', 'Uses of nuclear energy', 'АЭС, ледоколы, космические аппараты, медицина.', 'Power plants, icebreakers, spacecraft, medicine.'],
        ['Доза и защита', 'Dose and protection', 'Доза в зивертах. Защищают время, расстояние и экраны.', 'Dose is measured in sieverts; protection is time, distance and shielding.'],
      ],
      formula: '{}^{2}\\mathrm{H} + {}^{3}\\mathrm{H} \\to {}^{4}\\mathrm{He} + n',
    },
  ]),

  section(P, 11, 'particles', ['Элементарные частицы', 'Elementary particles'], [
    {
      id: 'p11-particles',
      title: ['Классификация частиц. Кварки', 'Classifying particles. Quarks'],
      intro: [
        'Сотни частиц оказались построены из небольшого набора: шести кварков и шести лептонов.',
        'Hundreds of particles turned out to be built from a small set: six quarks and six leptons.',
      ],
      points: [
        ['Этапы развития', 'History', 'Электрон (1897), протон, нейтрон, позитрон, мюон, затем кварковая модель (1964).', 'Electron (1897), proton, neutron, positron, muon, then the quark model (1964).'],
        ['Лептоны и адроны', 'Leptons and hadrons', 'Лептоны (электрон, нейтрино) не участвуют в сильном взаимодействии, адроны (протон, нейтрон) — участвуют.', 'Leptons (electron, neutrino) don’t feel the strong force; hadrons (proton, neutron) do.'],
        ['Кварки', 'Quarks', 'Протон — два u-кварка и один d, нейтрон — один u и два d. Поодиночке кварки не встречаются.', 'A proton is uud, a neutron udd. Quarks are never found alone.'],
      ],
    },
    {
      id: 'p11-antiparticles',
      title: ['Античастицы. Фундаментальные взаимодействия', 'Antiparticles. Fundamental forces'],
      intro: [
        'У каждой частицы есть античастица. Всё многообразие сил в природе сводится к четырём взаимодействиям.',
        'Every particle has an antiparticle. All of nature’s forces boil down to four interactions.',
      ],
      points: [
        ['Позитрон и аннигиляция', 'Positron and annihilation', 'Электрон и позитрон при встрече исчезают, превращаясь в два гамма-кванта.', 'An electron and positron meet and vanish into two gamma rays.'],
        ['Четыре взаимодействия', 'Four interactions', 'Гравитационное, электромагнитное, сильное (держит ядро), слабое (β-распад).', 'Gravitational, electromagnetic, strong (holds nuclei), weak (beta decay).'],
      ],
      formula: 'e^- + e^+ \\to 2\\gamma',
    },
  ]),

  section(P, 11, 'astro', ['Астрофизика', 'Astrophysics'], [
    {
      id: 'p11-sky',
      title: ['Видимые движения небесных тел', 'Motions in the sky'],
      intro: [
        'Звёзды за ночь описывают круги вокруг Полярной звезды — это отражение вращения Земли.',
        'Overnight the stars circle the Pole Star, a reflection of Earth’s rotation.',
      ],
      points: [
        ['Небесная сфера', 'Celestial sphere', 'Воображаемая сфера, на которую проецируются светила. Координаты на ней похожи на широту и долготу.', 'An imaginary sphere onto which we project the stars, with coordinates like latitude and longitude.'],
        ['Созвездия', 'Constellations', '88 участков неба. Звёзды в созвездии могут быть очень далеко друг от друга.', '88 regions of sky. Stars in one constellation may be very far apart.'],
      ],
    },
    {
      id: 'p11-kepler',
      title: ['Законы Кеплера', 'Kepler’s laws'],
      intro: [
        'Кеплер по наблюдениям Тихо Браге вывел три закона движения планет, а Ньютон объяснил их тяготением.',
        'Kepler derived three laws of planetary motion from Tycho Brahe’s data; Newton explained them by gravity.',
      ],
      points: [
        ['Первый закон', 'First law', 'Планеты движутся по эллипсам, в одном из фокусов — Солнце.', 'Planets move in ellipses with the Sun at one focus.'],
        ['Второй закон', 'Second law', 'Радиус-вектор за равные времена заметает равные площади — у Солнца планета быстрее.', 'The radius sweeps equal areas in equal times, so a planet is faster near the Sun.'],
        ['Третий закон', 'Third law', 'T²/a³ = const для всех планет.', 'T²/a³ is the same for every planet.'],
      ],
      formula: '\\frac{T_1^2}{T_2^2} = \\frac{a_1^3}{a_2^3}',
      sim: { lab: 'physics_gravity' },
    },
    {
      id: 'p11-solar-system',
      title: ['Солнечная система. Солнце', 'The Solar System. The Sun'],
      intro: [
        'Солнце содержит 99,86% массы Солнечной системы. Его энергия рождается в ядре при синтезе гелия.',
        'The Sun holds 99.86% of the Solar System’s mass. Its energy comes from helium fusion in the core.',
      ],
      points: [
        ['Планеты', 'Planets', 'Земная группа и планеты-гиганты, а также малые тела — астероиды, кометы, карликовые планеты.', 'Rocky planets, giants and small bodies: asteroids, comets, dwarf planets.'],
        ['Строение Солнца', 'The Sun’s structure', 'Ядро (15 млн К), зоны переноса энергии, фотосфера (5800 К), корона.', 'Core (15 million K), energy-transport zones, photosphere (5800 K), corona.'],
        ['Солнечная активность', 'Solar activity', 'Пятна, вспышки, выбросы плазмы с циклом около 11 лет.', 'Sunspots, flares and plasma ejections on an ~11-year cycle.'],
      ],
    },
    {
      id: 'p11-stars',
      title: ['Звёзды. Диаграмма Герцшпрунга–Рассела', 'Stars. The Hertzsprung–Russell diagram'],
      intro: [
        'Если разместить звёзды по температуре и светимости, они ложатся не хаотично, а по полосам. Это ключ к их эволюции.',
        'Plot stars by temperature and luminosity and they fall into bands, not chaos. That’s the key to how they evolve.',
      ],
      points: [
        ['Характеристики звёзд', 'Stellar properties', 'Светимость, температура (цвет), масса, радиус.', 'Luminosity, temperature (colour), mass, radius.'],
        ['Главная последовательность', 'Main sequence', 'Большую часть жизни звезда проводит здесь, сжигая водород.', 'A star spends most of its life here, burning hydrogen.'],
        ['Конец звезды', 'A star’s end', 'Лёгкие — белые карлики, тяжёлые — нейтронные звёзды, самые массивные — чёрные дыры.', 'Light stars become white dwarfs, heavy ones neutron stars, the most massive black holes.'],
      ],
      sim: { engine: 'stellar_evolution_hr' },
    },
    {
      id: 'p11-galaxies-cosmology',
      title: ['Галактики. Большой взрыв', 'Galaxies. The Big Bang'],
      intro: [
        'Вселенная расширяется уже 13,8 млрд лет. Об этом говорят разбегание галактик и реликтовое излучение.',
        'The Universe has been expanding for 13.8 billion years, as receding galaxies and the cosmic background show.',
      ],
      points: [
        ['Млечный Путь', 'The Milky Way', 'Спиральная галактика диаметром ~100 000 световых лет; Солнце — на её окраине.', 'A spiral ~100,000 light-years across, with the Sun on its outskirts.'],
        ['Типы галактик', 'Types of galaxies', 'Спиральные, эллиптические, неправильные.', 'Spiral, elliptical, irregular.'],
        ['Закон Хаббла', 'Hubble’s law', 'v = Hr — чем дальше, тем быстрее удаляется.', 'v = Hr: the farther away, the faster it recedes.'],
        ['Реликтовое излучение', 'Cosmic microwave background', 'Остывший свет молодой Вселенной, 2,7 К — «эхо» Большого взрыва.', 'The cooled light of the young Universe at 2.7 K, the Big Bang’s echo.'],
      ],
      formula: 'v = H r',
    },
  ]),
];
