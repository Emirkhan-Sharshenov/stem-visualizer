import type { Body, Units, V3 } from './gravity';

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export interface SpaceScene {
  id: string;
  title: T2;
  laws: T2;
  hint: T2;
  units: Units;
  /** camera position in scene units */
  camera: V3;
  /** μ of a newly added "planet" and "moon" in this scene */
  addMu: { planet: number; moon: number; star: number };
  /** shows the launch panel (cosmic velocities) */
  launch?: boolean;
  make: () => Body[];
}

const KM: Units = { dist: t('км', 'km'), time: t('с', 's'), speed: t('км/с', 'km/s'), scale: 2000, rate: 400 };
const AU: Units = { dist: t('а.е.', 'AU'), time: t('лет', 'yr'), speed: t('а.е./год', 'AU/yr'), scale: 1, rate: 0.25 };
const UNIT: Units = { dist: t('у.е.', 'u'), time: t('у.е.', 'u'), speed: t('у.е.', 'u'), scale: 0.35, rate: 0.6 };

export const EARTH_MU = 398600;
export const EARTH_R = 6371;

const circ = (mu: number, r: number) => Math.sqrt(mu / r);

export const SCENES: SpaceScene[] = [
  {
    id: 'cosmic',
    title: t('Космические скорости', 'Cosmic velocities'),
    laws: t('Первая и вторая космические скорости: v₁ = √(GM/R), v₂ = √2 · v₁', 'First and second cosmic velocities: v₁ = √(GM/R), v₂ = √2 · v₁'),
    hint: t('Запусти спутник с высоты 200 км. Медленнее 7,8 км/с — упадёт на Землю, ровно 7,8 — круговая орбита, быстрее — эллипс, а от 11 км/с — улетит навсегда. Это мысленный опыт Ньютона с пушкой на горе.', 'Launch a satellite from 200 km up. Slower than 7.8 km/s it falls back, exactly 7.8 gives a circle, faster an ellipse, and from 11 km/s it escapes for good: Newton’s cannon thought experiment.'),
    units: KM,
    camera: [0, 9, 13],
    addMu: { planet: 0.001, moon: 0.001, star: EARTH_MU },
    launch: true,
    make: () => [{ id: 'earth', name: 'Земля', mu: EARTH_MU, r: EARTH_R, drawR: EARTH_R, color: '#3E7BD6', pos: [0, 0, 0], vel: [0, 0, 0], fixed: true }],
  },
  {
    id: 'moon',
    title: t('Земля и Луна', 'Earth and Moon'),
    laws: t('Закон всемирного тяготения: F = GMm/r²', 'Law of gravitation: F = GMm/r²'),
    hint: t('Луна обходит Землю за 27,3 суток. Земля тоже чуть-чуть качается: они вращаются вокруг общего центра масс. Добавь вторую луну и посмотри, как они мешают друг другу.', 'The Moon goes round in 27.3 days. The Earth wobbles a little too, as both circle their common centre of mass. Add a second moon and watch them tug at each other.'),
    units: { ...KM, scale: 40000, rate: 86400 * 1.2 },
    camera: [0, 12, 18],
    addMu: { planet: 4903, moon: 4903, star: EARTH_MU },
    make: () => {
      const d = 384400;
      const v = circ(EARTH_MU + 4903, d);
      return [
        { id: 'earth', name: 'Земля', mu: EARTH_MU, r: EARTH_R, drawR: 18000, color: '#3E7BD6', pos: [0, 0, 0], vel: [0, 0, (-v * 4903) / (EARTH_MU + 4903)] },
        { id: 'moon', name: 'Луна', mu: 4903, r: 1737, drawR: 9000, color: '#C8CCD2', pos: [d, 0, 0], vel: [0, 0, (v * EARTH_MU) / (EARTH_MU + 4903)] },
      ];
    },
  },
  {
    id: 'solar',
    title: t('Солнечная система', 'Solar System'),
    laws: t('Законы Кеплера: T² ~ a³', 'Kepler’s laws: T² ~ a³'),
    hint: t('Чем дальше планета, тем медленнее она движется и тем длиннее её год: квадрат периода растёт как куб расстояния (третий закон Кеплера). Планеты увеличены, иначе их не было бы видно.', 'The farther a planet, the slower it moves and the longer its year: the period squared grows as the distance cubed (Kepler’s 3rd law). Planets are enlarged so you can see them.'),
    units: AU,
    camera: [0, 9, 12],
    addMu: { planet: 0.0001, moon: 0.000001, star: 4 * Math.PI ** 2 },
    make: () => {
      const SUN = 4 * Math.PI ** 2;
      const p = (id: string, name: string, a: number, mu: number, drawR: number, color: string, phase: number): Body => {
        const v = circ(SUN, a);
        return { id, name, mu, r: 0.0003, drawR, color, pos: [a * Math.cos(phase), 0, a * Math.sin(phase)], vel: [-v * Math.sin(phase), 0, v * Math.cos(phase)] };
      };
      return [
        { id: 'sun', name: 'Солнце', mu: SUN, r: 0.005, drawR: 0.25, color: '#FFC94A', pos: [0, 0, 0], vel: [0, 0, 0], fixed: true, star: true },
        p('mercury', 'Меркурий', 0.387, SUN * 1.66e-7, 0.05, '#B5A99A', 0.3),
        p('venus', 'Венера', 0.723, SUN * 2.45e-6, 0.08, '#E8C27A', 2.1),
        p('earth', 'Земля', 1, SUN * 3.0e-6, 0.09, '#3E7BD6', 4),
        p('mars', 'Марс', 1.524, SUN * 3.2e-7, 0.07, '#D2603A', 5.4),
        p('jupiter', 'Юпитер', 5.2, SUN * 9.55e-4, 0.18, '#D8B48A', 1.2),
      ];
    },
  },
  {
    id: 'binary',
    title: t('Двойная звезда', 'Binary star'),
    laws: t('Центр масс системы: m₁r₁ = m₂r₂', 'Centre of mass: m₁r₁ = m₂r₂'),
    hint: t('Две звезды кружат вокруг общего центра масс. Планета далеко снаружи обходит сразу обе — как Татуин из «Звёздных войн». Сделай одну звезду тяжелее и посмотри, как сместится центр.', 'Two stars circle their common centre of mass, and a planet far outside orbits both, like Tatooine. Make one star heavier and see the centre shift.'),
    units: { ...AU, rate: 0.15 },
    camera: [0, 10, 12],
    addMu: { planet: 0.0001, moon: 0.000001, star: 4 * Math.PI ** 2 },
    make: () => {
      const M = 4 * Math.PI ** 2;
      const d = 1.2;
      const v = circ(2 * M, d) / 2;
      const vp = circ(2 * M, 5);
      return [
        { id: 'a', name: 'Звезда A', mu: M, r: 0.01, drawR: 0.22, color: '#FFD27A', pos: [d / 2, 0, 0], vel: [0, 0, v], star: true },
        { id: 'b', name: 'Звезда B', mu: M, r: 0.01, drawR: 0.22, color: '#8FB4FF', pos: [-d / 2, 0, 0], vel: [0, 0, -v], star: true },
        { id: 'p', name: 'Планета', mu: M * 3e-6, r: 0.0003, drawR: 0.09, color: '#5FD39A', pos: [0, 0, 5], vel: [-vp, 0, 0] },
      ];
    },
  },
  {
    id: 'three',
    title: t('Задача трёх тел', 'Three-body problem'),
    laws: t('Хаос: малое изменение — совсем другое будущее', 'Chaos: a tiny change, a completely different future'),
    hint: t('Три одинаковых тела летают по «восьмёрке» — одно из редких устойчивых решений. Нажми «Толкнуть»: крошечное изменение скорости, и через минуту движение станет хаотичным. Поэтому три тела нельзя рассчитать одной формулой.', 'Three equal bodies follow a figure-eight, one of the rare stable solutions. Press “Nudge”: a tiny change in speed and within a minute the motion turns chaotic, which is why no single formula solves three bodies.'),
    units: UNIT,
    camera: [0, 7, 7],
    addMu: { planet: 0.3, moon: 0.05, star: 1 },
    make: () => {
      const p1: V3 = [-0.97000436, 0, 0.24308753];
      const v3: V3 = [-0.93240737, 0, -0.86473146];
      return [
        { id: 'a', name: 'A', mu: 1, r: 0.01, drawR: 0.06, color: '#FF7A7A', pos: p1, vel: [-v3[0] / 2, 0, -v3[2] / 2] },
        { id: 'b', name: 'B', mu: 1, r: 0.01, drawR: 0.06, color: '#7AB8FF', pos: [-p1[0], 0, -p1[2]], vel: [-v3[0] / 2, 0, -v3[2] / 2] },
        { id: 'c', name: 'C', mu: 1, r: 0.01, drawR: 0.06, color: '#FFE07A', pos: [0, 0, 0], vel: v3 },
      ];
    },
  },
  {
    id: 'empty',
    title: t('Свой космос', 'Your own space'),
    laws: t('Собери свою систему', 'Build your own system'),
    hint: t('Включи «Добавить тело», нажми в пространстве, куда поставить, и потяни — длина стрелки задаёт скорость. Если тянуть примерно на половину расстояния до звезды, получится почти круговая орбита.', 'Turn on “Add a body”, click where to put it and drag: the arrow sets the speed. Dragging about half the distance to the star gives a nearly circular orbit.'),
    units: AU,
    camera: [0, 10, 10],
    addMu: { planet: 0.0003, moon: 0.000003, star: 4 * Math.PI ** 2 },
    make: () => [{ id: 'sun', name: 'Звезда', mu: 4 * Math.PI ** 2, r: 0.02, drawR: 0.22, color: '#FFC94A', pos: [0, 0, 0], vel: [0, 0, 0], star: true }],
  },
];
