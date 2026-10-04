import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, tag, TAU, text, tx } from '../kit';
import { flame } from './heat';

function starfield(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, n = 160) {
  ctx.fillStyle = '#07080B';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(i, 3) * 2) + hash(i, 4) * TAU);
    circle(ctx, hash(i) * w, hash(i, 1) * h, 0.6 + hash(i, 2) * 1.2, alpha('#FFFFFF', 0.25 + 0.5 * tw));
  }
}

/* ---------- solar system ---------- */

const PLANETS = [
  { n: tx('Меркурий', 'Mercury'), a: 0.39, r: 4, c: '#A8A29E', d: tx('Ближайшая к Солнцу, без атмосферы: днём +430 °C, ночью −180 °C.', 'Closest to the Sun, no atmosphere: +430 °C by day, −180 °C at night.') },
  { n: tx('Венера', 'Venus'), a: 0.72, r: 7, c: '#E8C77A', d: tx('Самая горячая планета (+465 °C) из-за парникового эффекта плотной CO₂-атмосферы.', 'The hottest planet (+465 °C) thanks to the greenhouse effect of its thick CO₂ air.') },
  { n: tx('Земля', 'Earth'), a: 1, r: 7.5, c: '#3B82F6', d: tx('Единственная известная планета с жизнью и жидкой водой на поверхности.', 'The only known planet with life and liquid surface water.') },
  { n: tx('Марс', 'Mars'), a: 1.52, r: 5, c: '#D9622B', d: tx('Красная из-за оксида железа. Высочайший вулкан — Олимп, 22 км.', 'Red from iron oxide. Home to the tallest volcano, Olympus Mons, 22 km.') },
  { n: tx('Юпитер', 'Jupiter'), a: 2.6, r: 16, c: '#D8B38A', d: tx('Газовый гигант, в 318 раз массивнее Земли. Большое Красное Пятно — шторм больше Земли.', 'A gas giant 318 times Earth’s mass. The Great Red Spot is a storm bigger than Earth.') },
  { n: tx('Сатурн', 'Saturn'), a: 3.4, r: 13, c: '#E8D29A', d: tx('Кольца из льда и камней шириной ~280 000 км и толщиной меньше километра.', 'Rings of ice and rock about 280,000 km wide yet under a kilometre thick.') },
  { n: tx('Уран', 'Uranus'), a: 4.1, r: 10, c: '#8FD3E0', d: tx('Ледяной гигант, вращается «лёжа на боку»: ось наклонена на 98°.', 'An ice giant spinning on its side, its axis tilted 98°.') },
  { n: tx('Нептун', 'Neptune'), a: 4.7, r: 10, c: '#4C6FE0', d: tx('Самые сильные ветры в Солнечной системе — до 2000 км/ч.', 'The fastest winds in the Solar System, up to 2,000 km/h.') },
];
// real semi-major axes for periods (AU)
const REAL_A = [0.39, 0.72, 1, 1.52, 5.2, 9.58, 19.2, 30.1];

export const solarSystem: SimDef = {
  id: 'solar_system',
  title: tx('Солнечная система и небо', 'The Solar System and the sky'),
  modes: [
    { id: 'orbits', label: tx('Планеты', 'Planets') },
    { id: 'kepler', label: tx('Законы Кеплера', 'Kepler’s laws') },
    { id: 'moon', label: tx('Фазы Луны', 'Moon phases') },
    { id: 'seasons', label: tx('Времена года', 'Seasons') },
  ],
  duration: (m) => (m === 'orbits' ? 30 : m === 'kepler' ? 12 : m === 'moon' ? 16 : 16),
  params: (m) => (m === 'orbits' ? [{ id: 'speed', label: tx('Лет за секунду', 'Years per second'), min: 0.1, max: 2, step: 0.1, value: 0.4, digits: 1 }] : m === 'kepler' ? [{ id: 'e', label: tx('Эксцентриситет орбиты', 'Orbit eccentricity'), min: 0, max: 0.7, step: 0.05, value: 0.5, digits: 2 }] : []),
  stages: (m) =>
    m === 'orbits'
      ? [
          { t: 0, label: tx('8 планет', '8 planets'), text: tx('Четыре каменистые планеты земной группы и четыре гиганта. Все обходят Солнце в одну сторону почти в одной плоскости.', 'Four rocky inner planets and four giants. All orbit the Sun the same way in almost the same plane.') },
          { t: 6, label: tx('Периоды', 'Periods'), text: tx('Чем дальше планета, тем медленнее она движется и тем длиннее её год: у Нептуна — 165 земных лет.', 'The farther a planet, the slower it moves and the longer its year: Neptune’s is 165 Earth years.') },
        ]
      : m === 'kepler'
        ? [
            { t: 0, label: tx('1-й закон', '1st law'), text: tx('Планеты движутся по эллипсам, в одном из фокусов которых — Солнце.', 'Planets move in ellipses with the Sun at one focus.') },
            { t: 4, label: tx('2-й закон', '2nd law'), text: tx('Радиус-вектор заметает равные площади за равное время: у Солнца планета летит быстрее.', 'The line to the Sun sweeps equal areas in equal times, so the planet speeds up near the Sun.') },
            { t: 8, label: tx('3-й закон', '3rd law'), text: tx('T² / a³ одинаково для всех планет. Позже Ньютон вывел это из закона всемирного тяготения.', 'T²/a³ is the same for every planet. Newton later derived this from his law of gravitation.') },
          ]
        : m === 'moon'
          ? [
              { t: 0, label: tx('Новолуние', 'New moon'), text: tx('Луна между Землёй и Солнцем: освещённая сторона отвёрнута от нас.', 'The Moon sits between Earth and the Sun; its lit side faces away from us.') },
              { t: 4, label: tx('Первая четверть', 'First quarter'), text: tx('Видна правая половина диска (в Северном полушарии). Луна растёт.', 'The right half is lit (in the northern hemisphere). The Moon is waxing.') },
              { t: 8, label: tx('Полнолуние', 'Full moon'), text: tx('Земля между Солнцем и Луной — видим весь освещённый диск.', 'Earth is between the Sun and the Moon, so we see the whole lit face.') },
              { t: 12, label: tx('Последняя четверть', 'Last quarter'), text: tx('Луна убывает. Полный цикл фаз — 29,5 суток (синодический месяц).', 'The Moon wanes. A full cycle of phases takes 29.5 days (the synodic month).') },
            ]
          : [
              { t: 0, label: tx('Наклон оси', 'Tilted axis'), text: tx('Ось Земли наклонена на 23,5° и всегда смотрит в одну точку неба (на Полярную звезду).', 'Earth’s axis is tilted 23.5° and always points at the same spot in the sky, near Polaris.') },
              { t: 4, label: tx('Лето на севере', 'Northern summer'), text: tx('Северное полушарие наклонено к Солнцу: лучи падают отвеснее, день длиннее — тепло.', 'The northern hemisphere leans toward the Sun: rays hit more steeply and days are longer, so it’s warm.') },
              { t: 12, label: tx('Зима на севере', 'Northern winter'), text: tx('Через полгода наклон «от Солнца»: лучи скользят, день короткий. Расстояние до Солнца почти ни при чём!', 'Half a year later it leans away: the rays glance off and days are short. Distance to the Sun barely matters!') },
            ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    starfield(ctx, w, h, t);
    const cx = 480;
    const cy = 270;
    if (mode === 'orbits') {
      const years = t * p.speed;
      const sg = ctx.createRadialGradient(cx, cy, 5, cx, cy, 60);
      sg.addColorStop(0, '#FFF3B0');
      sg.addColorStop(0.5, '#F5A524');
      sg.addColorStop(1, 'rgba(245,165,36,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, TAU);
      ctx.fill();
      ball(ctx, cx, cy, 22, '#F5A524');
      f.hit(info('Солнце', 'Sun', 'Звезда — жёлтый карлик. В нём 99,86% массы всей Солнечной системы.', 'A yellow dwarf star holding 99.86% of the Solar System’s mass.'), cx, cy, 24);
      PLANETS.forEach((pl, i) => {
        const R = 40 + pl.a * 48;
        ctx.strokeStyle = alpha('#FFFFFF', 0.08);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R, R * 0.92, 0, 0, TAU);
        ctx.stroke();
        const period = Math.pow(REAL_A[i], 1.5);
        const a = (years / period) * TAU + hash(i) * TAU;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R * 0.92;
        if (i === 5) {
          ctx.strokeStyle = alpha('#E8D29A', 0.7);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(x, y, pl.r * 1.9, pl.r * 0.6, -0.3, 0, TAU);
          ctx.stroke();
        }
        ball(ctx, x, y, pl.r, pl.c);
        f.hit(info(pl.n.ru, pl.n.en, `${pl.d.ru} Год = ${period.toFixed(period < 2 ? 2 : 0)} земных лет.`, `${pl.d.en} Year = ${period.toFixed(period < 2 ? 2 : 0)} Earth years.`), x, y, Math.max(8, pl.r));
      });
      tag(ctx, `${L('прошло', 'elapsed')}: ${years.toFixed(1)} ${L('земных лет', 'Earth years')}`, 20, 30, { color: C.sky, align: 'left' });
      text(ctx, L('расстояния сжаты, размеры увеличены', 'distances squeezed, sizes enlarged'), w - 20, h - 20, { size: 11, color: C.dim, align: 'right' });
      return;
    }
    if (mode === 'kepler') {
      const e = p.e;
      const a = 300;
      const b = a * Math.sqrt(1 - e * e);
      const c = a * e;
      const ox = cx;
      const sx = ox - c; // Sun at the left focus
      ctx.strokeStyle = alpha('#FFFFFF', 0.25);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ox, cy, a, b, 0, 0, TAU);
      ctx.stroke();
      ball(ctx, sx, cy, 18, '#F5A524', 1);
      f.hit(info('Солнце в фокусе', 'Sun at a focus', 'Солнце не в центре эллипса, а в одном из фокусов.', 'The Sun isn’t at the centre of the ellipse but at a focus.'), sx, cy, 20);
      circle(ctx, ox + c, cy, 3, alpha('#FFFFFF', 0.4));
      // solve Kepler's equation for the position at time t
      const T = 6;
      const posAt = (tt: number) => {
        const M = (tt / T) * TAU;
        let E = M;
        for (let k = 0; k < 8; k++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        return [ox - a * Math.cos(E), cy + b * Math.sin(E)] as [number, number];
      };
      // equal-area sectors
      if (t > 4) {
        [0, 1.5, 3, 4.5].forEach((st, k) => {
          ctx.fillStyle = alpha([C.sky, C.green, C.amber, C.pink][k], 0.25);
          ctx.beginPath();
          ctx.moveTo(sx, cy);
          for (let s = st; s <= st + 0.6; s += 0.02) {
            const [x, y] = posAt(s);
            ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        });
        tag(ctx, L('площади равны, время одно — 0,6 с', 'equal areas, equal time (0.6 s)'), cx, 40, { color: C.sky });
      }
      const [px, py] = posAt(t);
      line(ctx, [[sx, cy], [px, py]], alpha('#FFFFFF', 0.5), 1.5);
      ball(ctx, px, py, 10, '#3B82F6');
      const [nx, ny] = posAt(t + 0.05);
      const v = Math.hypot(nx - px, ny - py);
      arrow(ctx, px, py, px + (nx - px) * 4, py + (ny - py) * 4, { color: C.green, width: 2.5 });
      f.hit(info('Планета', 'Planet', 'В перигелии (ближе к Солнцу) скорость максимальна, в афелии — минимальна.', 'At perihelion (closest to the Sun) it moves fastest; at aphelion slowest.'), px, py, 12);
      tag(ctx, `v ≈ ${(v * 2).toFixed(0)}`, px, py - 28, { color: C.green });
      return;
    }
    if (mode === 'moon') {
      // top view: Sun far left, Earth centre, Moon orbiting; inset shows what we see
      const ex = 360;
      const ang = (t / 16) * TAU + Math.PI; // start at new moon (Moon toward the Sun)
      for (let y = 40; y < 500; y += 40) arrow(ctx, 20, y, 90, y, { color: alpha(C.yellow, 0.5), width: 2 });
      tag(ctx, L('свет Солнца', 'sunlight'), 60, 20, { color: C.yellow });
      ball(ctx, ex, cy, 34, '#3B82F6');
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.arc(ex, cy, 34, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      f.hit(info('Земля', 'Earth', 'Мы смотрим на Луну отсюда и видим ту часть её освещённой половины, что повёрнута к нам.', 'We watch from here and see whichever part of the Moon’s lit half faces us.'), ex, cy, 34);
      ctx.strokeStyle = alpha('#FFFFFF', 0.15);
      ctx.beginPath();
      ctx.arc(ex, cy, 170, 0, TAU);
      ctx.stroke();
      const mx = ex + Math.cos(ang) * 170;
      const my = cy + Math.sin(ang) * 170;
      ball(ctx, mx, my, 16, '#C9CDD3');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.arc(mx, my, 16, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      f.hit(info('Луна', 'Moon', 'Всегда освещена наполовину — со стороны Солнца. Меняется лишь то, сколько освещённой части видно с Земли.', 'Always half lit, on the Sun’s side. Only how much of that half we see from Earth changes.'), mx, my, 18);
      // view from Earth
      const vx = 760;
      rrect(ctx, vx - 120, 130, 240, 280, 14);
      ctx.fillStyle = 'rgba(26,28,33,0.9)';
      ctx.fill();
      text(ctx, L('вид с Земли', 'seen from Earth'), vx, 152, { size: 12, color: C.dim });
      const R = 80;
      const phase = ((ang - Math.PI) / TAU + 1) % 1; // 0 new, .5 full
      circle(ctx, vx, 280, R, '#1C1E22');
      ctx.save();
      ctx.beginPath();
      ctx.arc(vx, 280, R, 0, TAU);
      ctx.clip();
      // lit part: half disc + ellipse terminator
      const k = Math.cos(phase * TAU); // 1 new, -1 full
      const waxing = phase < 0.5;
      ctx.fillStyle = '#D9DCE1';
      ctx.beginPath();
      ctx.arc(vx, 280, R, -Math.PI / 2, Math.PI / 2, !waxing);
      ctx.ellipse(vx, 280, Math.abs(k) * R, R, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
      ctx.fill();
      ctx.restore();
      const names = [L('новолуние', 'new moon'), L('растущий серп', 'waxing crescent'), L('первая четверть', 'first quarter'), L('растущая', 'waxing gibbous'), L('полнолуние', 'full moon'), L('убывающая', 'waning gibbous'), L('последняя четверть', 'last quarter'), L('убывающий серп', 'waning crescent')];
      tag(ctx, names[Math.round(phase * 8) % 8], vx, 390, { color: C.text });
      return;
    }
    // seasons
    const ang = (t / 16) * TAU; // t=4 → summer solstice position
    const sunX = cx;
    ball(ctx, sunX, cy, 34, '#F5A524', 1.2);
    ctx.strokeStyle = alpha('#FFFFFF', 0.15);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 360, 150, 0, 0, TAU);
    ctx.stroke();
    const exx = cx + Math.cos(ang + Math.PI / 2) * 360;
    const eyy = cy + Math.sin(ang + Math.PI / 2) * 150;
    const tilt = (23.5 * Math.PI) / 180;
    const R = 36;
    ball(ctx, exx, eyy, R, '#3B82F6');
    // night side (away from the Sun)
    const toSun = Math.atan2(cy - eyy, sunX - exx);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(exx, eyy, R, toSun + Math.PI / 2, toSun + (3 * Math.PI) / 2);
    ctx.fill();
    // axis always tilted the same way (to the right in this view)
    line(ctx, [[exx - Math.sin(tilt) * 54, eyy + Math.cos(tilt) * 54], [exx + Math.sin(tilt) * 54, eyy - Math.cos(tilt) * 54]], C.white, 2);
    text(ctx, 'N', exx + Math.sin(tilt) * 64, eyy - Math.cos(tilt) * 64, { size: 12, color: C.white });
    f.hit(info('Земля', 'Earth', 'Ось наклонена на 23,5° и сохраняет направление весь год.', 'The axis is tilted 23.5° and keeps its direction all year.'), exx, eyy, R);
    // which hemisphere leans to the Sun: sun is to the left when exx > cx
    const northSummer = Math.sin(tilt) * (sunX - exx) > 0;
    const strength = Math.abs(sunX - exx) / 360;
    tag(ctx, strength < 0.25 ? L('равноденствие', 'equinox') : northSummer ? L('лето в Северном полушарии', 'northern summer') : L('зима в Северном полушарии', 'northern winter'), cx, 470, { color: northSummer ? C.amber : C.sky, size: 13 });
  },
};

/* ---------- stars and the universe ---------- */

export const stars: SimDef = {
  id: 'stars',
  title: tx('Звёзды и Вселенная', 'Stars and the Universe'),
  modes: [
    { id: 'hr', label: tx('Диаграмма Г–Р', 'H–R diagram') },
    { id: 'life', label: tx('Жизнь звезды', 'Life of a star') },
    { id: 'expansion', label: tx('Расширение', 'Expansion') },
  ],
  duration: (m) => (m === 'life' ? 18 : 12),
  loop: false,
  params: (m) => (m === 'life' ? [{ id: 'mass', label: tx('Масса звезды', 'Star mass'), min: 0.5, max: 25, step: 0.5, value: 1, unit: 'M☉', digits: 1 }] : []),
  stages: (m) =>
    m === 'hr'
      ? [
          { t: 0, label: tx('Звёзды на графике', 'Stars on a chart'), text: tx('По горизонтали — температура (горячие слева, голубые), по вертикали — светимость.', 'Across: temperature (hot blue ones on the left). Up: luminosity.') },
          { t: 4, label: tx('Главная последовательность', 'Main sequence'), text: tx('90% звёзд, включая Солнце, лежат на диагонали: в их ядрах горит водород.', '90% of stars, the Sun included, sit on this diagonal, burning hydrogen in their cores.') },
          { t: 8, label: tx('Гиганты и карлики', 'Giants and dwarfs'), text: tx('Вверху справа — холодные, но огромные гиганты; внизу слева — горячие крошечные белые карлики.', 'Top right: cool but huge giants. Bottom left: hot, tiny white dwarfs.') },
        ]
      : m === 'life'
        ? [
            { t: 0, label: tx('Туманность', 'Nebula'), text: tx('Облако газа и пыли сжимается под действием тяготения.', 'A cloud of gas and dust contracts under gravity.') },
            { t: 3, label: tx('Звезда', 'Star'), text: tx('Ядро разогревается до 10 млн K — начинается синтез водорода в гелий. Звезда стабильна миллиарды лет.', 'The core reaches 10 million K and hydrogen starts fusing into helium. The star stays stable for billions of years.') },
            { t: 9, label: tx('Гигант', 'Giant'), text: tx('Водород в ядре кончился — звезда раздувается в красного гиганта (или сверхгиганта, если массивная).', 'Core hydrogen runs out and the star swells into a red giant, or a supergiant if massive.') },
            { t: 13, label: tx('Финал', 'The end'), text: tx('Звёзды как Солнце сбрасывают оболочку и становятся белыми карликами; массивные взрываются сверхновой и оставляют нейтронную звезду или чёрную дыру.', 'Sun-like stars shed their shells and become white dwarfs; massive ones explode as supernovae, leaving a neutron star or black hole.') },
          ]
        : [
            { t: 0, label: tx('Галактики', 'Galaxies'), text: tx('Галактики разбросаны по Вселенной.', 'Galaxies are scattered through the Universe.') },
            { t: 3, label: tx('Разбегание', 'Receding'), text: tx('Пространство расширяется: дальние галактики удаляются быстрее (закон Хаббла v = H·r).', 'Space is expanding: farther galaxies recede faster (Hubble’s law v = H·r).') },
            { t: 8, label: tx('Большой взрыв', 'Big Bang'), text: tx('Если «отмотать» расширение назад, всё сходится в одну точку ~13,8 млрд лет назад. Перемотай шкалу влево!', 'Run the expansion backwards and everything meets about 13.8 billion years ago. Drag the timeline back!') },
          ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    if (mode === 'hr') {
      backdrop(ctx, w, h);
      const g = chart(ctx, { x: 60, y: 30, w: 840, h: 480, xMax: 1, yMax: 1, series: [], title: L('светимость ↑   температура ←', 'luminosity ↑   temperature ←') });
      const X = (temp: number) => g.px + (1 - (Math.log10(temp) - 3.4) / (4.6 - 3.4)) * g.pw;
      const Y = (lum: number) => g.py + g.ph - ((Math.log10(lum) + 4) / 10) * g.ph;
      const col = (temp: number) => (temp > 10000 ? '#9BB0FF' : temp > 7000 ? '#CAD7FF' : temp > 5500 ? '#FFF4E8' : temp > 4000 ? '#FFD2A1' : '#FFB56C');
      const show = ease(t, 0, 3);
      for (let i = 0; i < 160; i++) {
        let temp: number;
        let lum: number;
        const r = hash(i, 9);
        if (r < 0.75) {
          temp = Math.pow(10, 3.45 + hash(i) * 1.1);
          lum = Math.pow(10, (Math.log10(temp) - 3.76) * 7 + (hash(i, 1) - 0.5) * 0.6);
        } else if (r < 0.9) {
          temp = Math.pow(10, 3.5 + hash(i) * 0.25);
          lum = Math.pow(10, 1.5 + hash(i, 1) * 3.5);
        } else {
          temp = Math.pow(10, 3.9 + hash(i) * 0.5);
          lum = Math.pow(10, -3.5 + hash(i, 1) * 1.5);
        }
        if (hash(i, 5) > show) continue;
        const size = clamp(1.5 + Math.log10(lum) * 0.6, 1.5, 6);
        circle(ctx, X(temp), Y(lum), size, col(temp));
      }
      const groups = [
        { x: X(5000), y: Y(10), r: 160, n: info('Главная последовательность', 'Main sequence', 'Звёзды, сжигающие водород. Чем массивнее звезда, тем она горячее, ярче и короче живёт.', 'Stars burning hydrogen. More massive ones are hotter, brighter and shorter-lived.'), when: 4, label: L('главная последовательность', 'main sequence'), lx: X(9000), ly: Y(100) },
        { x: X(4200), y: Y(1e3), r: 60, n: info('Красные гиганты', 'Red giants', 'Состарившиеся звёзды размером в десятки–сотни Солнц.', 'Ageing stars tens to hundreds of times the Sun’s size.'), when: 8, label: L('гиганты', 'giants'), lx: X(3800), ly: Y(1e4) },
        { x: X(12000), y: Y(0.001), r: 50, n: info('Белые карлики', 'White dwarfs', 'Остывающие ядра умерших звёзд размером с Землю; чайная ложка их вещества весит тонны.', 'Cooling cores of dead stars the size of Earth; a teaspoon weighs tonnes.'), when: 8, label: L('белые карлики', 'white dwarfs'), lx: X(12000), ly: Y(0.0001) },
      ];
      groups.forEach((gr) => {
        f.hit(gr.n, gr.x, gr.y, gr.r);
        if (t > gr.when) tag(ctx, gr.label, gr.lx, gr.ly, { color: C.sky });
      });
      const sx = X(5778);
      const sy = Y(1);
      circle(ctx, sx, sy, 7, '#FFE58F', '#FFFFFF', 2);
      tag(ctx, L('Солнце', 'Sun'), sx + 40, sy, { color: C.amber });
      f.hit(info('Солнце', 'Sun', 'Температура поверхности 5800 K, возраст 4,6 млрд лет — середина жизни.', 'Surface temperature 5800 K, age 4.6 billion years: middle-aged.'), sx, sy, 10);
      return;
    }
    starfield(ctx, w, h, t, 120);
    if (mode === 'life') {
      const cx = 400;
      const cy = 270;
      const big = p.mass > 8;
      if (t < 3) {
        const k = ease(t, 0, 3);
        for (let i = 0; i < 220; i++) {
          const a = hash(i) * TAU + t * 0.3 * (1 - hash(i, 1));
          const r = lerp(60 + hash(i, 1) * 220, 10 + hash(i, 1) * 20, k);
          circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, 2, alpha(i % 3 ? '#B07AFF' : '#FF7A9A', 0.5));
        }
        f.hit(info('Туманность', 'Nebula', 'Холодное облако водорода и гелия с примесью пыли — звёздная колыбель.', 'A cold cloud of hydrogen and helium with dust: a stellar nursery.'), cx, cy, 120);
        return;
      }
      let R: number;
      let color: string;
      let name: string;
      if (t < 9) {
        R = 26 + p.mass * 1.6;
        color = p.mass > 3 ? '#9BB0FF' : p.mass > 1.3 ? '#FFFFFF' : p.mass > 0.8 ? '#FFE58F' : '#FFB56C';
        name = L('главная последовательность', 'main sequence');
      } else if (t < 13) {
        const k = ease(t, 9, 12);
        R = lerp(26 + p.mass * 1.6, big ? 190 : 140, k);
        color = mixColor('#FFE58F', '#E5484D', k);
        name = big ? L('красный сверхгигант', 'red supergiant') : L('красный гигант', 'red giant');
      } else {
        const k = ease(t, 13, 14.5);
        if (big) {
          // supernova flash then remnant
          R = k < 1 ? lerp(190, 260, k) : 10;
          color = k < 1 ? '#FFFFFF' : p.mass > 20 ? '#000000' : '#9BB0FF';
          name = k < 1 ? L('сверхновая!', 'supernova!') : p.mass > 20 ? L('чёрная дыра', 'black hole') : L('нейтронная звезда', 'neutron star');
          if (k >= 1) {
            for (let i = 0; i < 80; i++) {
              const a = hash(i) * TAU;
              const r = 40 + (t - 14.5) * 40 * (0.5 + hash(i, 1));
              circle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.5, alpha(i % 2 ? '#FF7A59' : '#8FA4FF', clamp(1 - (t - 14.5) / 4)));
            }
            if (p.mass > 20) circle(ctx, cx, cy, 18, '#000000', alpha('#F5A524', 0.8), 3);
          }
        } else {
          R = lerp(140, 8, k);
          color = mixColor('#E5484D', '#FFFFFF', k);
          name = L('белый карлик + планетарная туманность', 'white dwarf + planetary nebula');
          if (k > 0.3) {
            ctx.strokeStyle = alpha('#3DD6F5', 0.5 * k);
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 60 + (t - 13) * 30, 40 + (t - 13) * 22, 0.4, 0, TAU);
            ctx.stroke();
          }
        }
      }
      const g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.8);
      g.addColorStop(0, alpha(color.startsWith('#') ? color : '#FFFFFF', 0.5));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.8, 0, TAU);
      ctx.fill();
      if (color !== '#000000') ball(ctx, cx, cy, R, color.startsWith('#') ? color : '#FF8866');
      f.hit(info('Звезда', 'Star', `Масса ${p.mass} M☉. ${p.mass > 8 ? 'Массивные звёзды живут миллионы лет и взрываются.' : 'Лёгкие звёзды живут миллиарды лет и угасают спокойно.'}`, `Mass ${p.mass} M☉. ${p.mass > 8 ? 'Massive stars live millions of years and explode.' : 'Light stars live billions of years and fade quietly.'}`), cx, cy, Math.max(20, R));
      tag(ctx, name, 780, 80, { color: C.amber, size: 13 });
      const life = 10 * Math.pow(p.mass, -2.5);
      tag(ctx, `${L('жизнь', 'lifetime')} ≈ ${life >= 1 ? life.toFixed(1) + L(' млрд лет', ' bn yr') : (life * 1000).toFixed(0) + L(' млн лет', ' Myr')}`, 780, 120, { color: C.sky });
      return;
    }
    // expansion
    const scale = 0.15 + ease(t, 0, 12) * 1.1;
    const cx = 480;
    const cy = 270;
    for (let i = 0; i < 60; i++) {
      const gx = (hash(i) - 0.5) * 700;
      const gy = (hash(i, 1) - 0.5) * 420;
      const x = cx + gx * scale;
      const y = cy + gy * scale;
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(hash(i, 2) * 3);
      ctx.fillStyle = alpha(i % 4 ? '#CAD7FF' : '#FFD2A1', 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7 + hash(i, 3) * 6, 3 + hash(i, 4) * 3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (i < 6 && t > 3) arrow(ctx, x, y, x + gx * 0.12, y + gy * 0.12, { color: alpha(C.red, 0.7), width: 1.5, head: 6 });
    }
    ball(ctx, cx, cy, 6, '#FFE58F');
    tag(ctx, L('Млечный Путь', 'Milky Way'), cx, cy - 22, { color: C.amber });
    f.hit(info('Наша Галактика', 'Our Galaxy', 'Млечный Путь — спиральная галактика из ~200 млрд звёзд. Удаление не значит, что мы в центре: из любой галактики картина та же.', 'The Milky Way is a spiral of ~200 billion stars. Others receding doesn’t put us at the centre: every galaxy sees the same.'), cx, cy, 14);
    tag(ctx, `${L('масштаб Вселенной', 'scale of the Universe')}: ${(scale * 100 / 1.25).toFixed(0)}%`, 20, 30, { color: C.sky, align: 'left' });
    if (scale < 0.25) {
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 120);
      g.addColorStop(0, alpha('#FFFFFF', 0.6 * (1 - scale * 4)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, TAU);
      ctx.fill();
    }
  },
};

/* ---------- heat engine (4-stroke) ---------- */

export const heatEngine: SimDef = {
  id: 'heat_engine',
  title: tx('Тепловой двигатель', 'Heat engine'),
  modes: [
    { id: 'ice', label: tx('Двигатель внутреннего сгорания', 'Internal combustion engine') },
    { id: 'cycle', label: tx('Схема и КПД', 'Diagram and efficiency') },
  ],
  duration: 12,
  params: (m) =>
    m === 'cycle'
      ? [
          { id: 'T1', label: tx('Температура нагревателя', 'Hot reservoir'), min: 400, max: 2000, step: 50, value: 900, unit: 'K' },
          { id: 'T2', label: tx('Температура холодильника', 'Cold reservoir'), min: 250, max: 400, step: 10, value: 300, unit: 'K' },
        ]
      : [],
  stages: (m) =>
    m === 'ice'
      ? [
          { t: 0, label: tx('Впуск', 'Intake'), text: tx('Поршень идёт вниз, впускной клапан открыт — цилиндр заполняется смесью бензина и воздуха.', 'The piston moves down with the inlet valve open, filling the cylinder with petrol–air mixture.') },
          { t: 3, label: tx('Сжатие', 'Compression'), text: tx('Клапаны закрыты, поршень сжимает смесь — она нагревается.', 'Valves shut, the piston squeezes the mixture and it heats up.') },
          { t: 6, label: tx('Рабочий ход', 'Power stroke'), text: tx('Искра свечи поджигает смесь. Горячие газы расширяются и толкают поршень — единственный такт, где совершается работа.', 'The spark plug ignites the mixture. Hot gases expand and push the piston down: the only stroke that does work.') },
          { t: 9, label: tx('Выпуск', 'Exhaust'), text: tx('Поршень выталкивает отработанные газы через выпускной клапан. Затем цикл повторяется.', 'The piston pushes the spent gases out through the exhaust valve, and the cycle repeats.') },
        ]
      : [
          { t: 0, label: tx('Нагреватель', 'Hot reservoir'), text: tx('Рабочее тело (газ) получает от нагревателя теплоту Q₁ — при сгорании топлива: Q = qm.', 'The working gas takes heat Q₁ from the hot reservoir, burning fuel: Q = qm.') },
          { t: 4, label: tx('Работа', 'Work'), text: tx('Часть энергии превращается в механическую работу A = Q₁ − Q₂.', 'Part of the energy becomes mechanical work A = Q₁ − Q₂.') },
          { t: 8, label: tx('Холодильник', 'Cold reservoir'), text: tx('Остаток Q₂ неизбежно уходит в холодильник (атмосферу). Максимальный КПД (Карно) η = 1 − T₂/T₁ — второй закон термодинамики.', 'The rest, Q₂, must go to the cold reservoir (the air). The best possible (Carnot) efficiency is η = 1 − T₂/T₁: the second law of thermodynamics.') },
        ],
  metrics: ({ p, mode }) => (mode === 'cycle' ? [{ label: tx('КПД Карно', 'Carnot efficiency'), value: `${((1 - p.T2 / p.T1) * 100).toFixed(0)} %`, tone: 'good' }, { label: tx('Реальный ДВС', 'Real engine'), value: '25–40 %' }] : []),
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'ice') {
      // one stroke = 3 s at 1×; the timeline position picks the stroke
      const phase = (t / 12) * 4; // 0..4 strokes
      const stroke = Math.min(3, Math.floor(phase));
      const sp = phase - stroke;
      const crank = (phase * Math.PI) % TAU; // 0 at top
      const cx = 360;
      const top = 90;
      const cw = 180;
      const ch = 220;
      const R = 60;
      const rod = 220;
      const crankY = top + ch + 120;
      const pinX = cx + Math.sin(crank) * R;
      const pinY = crankY - Math.cos(crank) * R;
      const pistonY = pinY - Math.sqrt(rod * rod - (pinX - cx) ** 2);
      // gas colour per stroke
      const gas = [alpha('#5B8CFF', 0.35), alpha('#8E4EC6', 0.35 + 0.3 * sp), alpha('#F76B15', 0.7 - 0.4 * sp), alpha('#5A5D66', 0.6 - 0.4 * sp)][stroke];
      // cylinder
      ctx.fillStyle = gas;
      ctx.fillRect(cx - cw / 2, top, cw, pistonY - top - 30);
      if (stroke === 2 && sp < 0.2) {
        const g = ctx.createRadialGradient(cx, top + 20, 2, cx, top + 20, 120);
        g.addColorStop(0, alpha(C.yellow, 1 - sp * 5));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - cw / 2, top, cw, pistonY - top - 30);
      }
      for (let i = 0; i < 24; i++) {
        const speed = stroke === 2 ? 4 : 1.5;
        const x = cx - cw / 2 + 10 + hash(i) * (cw - 20) + Math.sin(t * speed * 3 + i) * 6;
        const y = top + 8 + hash(i, 1) * Math.max(10, pistonY - top - 48);
        circle(ctx, x, y, 3, stroke === 2 ? C.orange : stroke === 3 ? '#8C8F98' : C.sky);
      }
      ctx.strokeStyle = '#8C8F98';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2 - 4, top + ch);
      ctx.lineTo(cx - cw / 2 - 4, top - 4);
      ctx.lineTo(cx + cw / 2 + 4, top - 4);
      ctx.lineTo(cx + cw / 2 + 4, top + ch);
      ctx.stroke();
      f.hitRect(info('Цилиндр', 'Cylinder', 'Здесь сгорает топливо. Внутренняя энергия газов превращается в механическую работу.', 'Fuel burns here. The gases’ internal energy becomes mechanical work.'), cx - cw / 2, top, cw, 40);
      // valves
      const inOpen = stroke === 0 ? Math.sin(sp * Math.PI) : 0;
      const exOpen = stroke === 3 ? Math.sin(sp * Math.PI) : 0;
      [[-50, inOpen, C.blue, L('впуск', 'inlet')], [50, exOpen, '#8C8F98', L('выпуск', 'exhaust')]].forEach(([dx, o, c, n]) => {
        const vx = cx + (dx as number);
        line(ctx, [[vx, top - 60], [vx, top - 4 + (o as number) * 22]], '#B5B8C0', 4);
        line(ctx, [[vx - 18, top - 4 + (o as number) * 22], [vx + 18, top - 4 + (o as number) * 22]], '#B5B8C0', 6);
        tag(ctx, n as string, vx, top - 74, { color: (o as number) > 0.1 ? (c as string) : C.dim, size: 11 });
      });
      f.hit(info('Клапаны', 'Valves', 'Открываются кулачковым валом в нужный момент: впускной — на впуске, выпускной — на выпуске.', 'A camshaft opens them at the right moment: inlet on intake, exhaust on exhaust.'), cx - 50, top - 30, 18);
      // spark plug
      line(ctx, [[cx, top - 50], [cx, top + 4]], '#E8E4D8', 6);
      if (stroke === 2 && sp < 0.1) for (let k = 0; k < 5; k++) line(ctx, [[cx, top + 6], [cx + (hash(k, Math.floor(t * 40)) - 0.5) * 30, top + 14 + hash(k + 1, Math.floor(t * 40)) * 16]], C.yellow, 2);
      f.hit(info('Свеча зажигания', 'Spark plug', 'Даёт искру в конце сжатия и поджигает смесь.', 'Sparks at the end of compression and ignites the mixture.'), cx, top - 20, 12);
      // piston + rod + crank
      rrect(ctx, cx - cw / 2 + 4, pistonY - 30, cw - 8, 50, 6);
      ctx.fillStyle = '#9EA4AE';
      ctx.fill();
      f.hitRect(info('Поршень', 'Piston', 'Двигается вверх-вниз; через шатун вращает коленчатый вал.', 'Slides up and down, turning the crankshaft through the connecting rod.'), cx - cw / 2 + 4, pistonY - 30, cw - 8, 50);
      line(ctx, [[cx, pistonY], [pinX, pinY]], '#B5B8C0', 10);
      circle(ctx, cx, crankY, R + 14, '#23262C', '#4A4D55', 3);
      line(ctx, [[cx, crankY], [pinX, pinY]], '#8C8F98', 14);
      circle(ctx, pinX, pinY, 8, '#D5D8DE');
      circle(ctx, cx, crankY, 9, '#D5D8DE');
      f.hit(info('Коленчатый вал', 'Crankshaft', 'Превращает движение поршня во вращение. Маховик по инерции проводит поршень через три «холостых» такта.', 'Turns the piston’s motion into rotation. A flywheel carries it through the three non-power strokes.'), cx, crankY, R);
      // stroke indicator
      const names = [L('1. Впуск', '1. Intake'), L('2. Сжатие', '2. Compression'), L('3. Рабочий ход', '3. Power'), L('4. Выпуск', '4. Exhaust')];
      names.forEach((n, i) => tag(ctx, n, 700, 140 + i * 50, { color: i === stroke ? [C.blue, C.violet, C.orange, C.dim][i] : C.faint, size: i === stroke ? 15 : 13 }));
      return;
    }
    // energy flow diagram
    const eta = 1 - p.T2 / p.T1;
    const flow = ease(t, 0, 3);
    rrect(ctx, 330, 50, 300, 80, 12);
    ctx.fillStyle = alpha(C.red, 0.3);
    ctx.fill();
    text(ctx, `${L('нагреватель', 'hot reservoir')}  T₁ = ${p.T1} K`, 480, 90, { size: 15 });
    flame(ctx, 480, 48, 16, t);
    f.hitRect(info('Нагреватель', 'Hot reservoir', 'Источник теплоты — сгорающее топливо или пар высокой температуры.', 'The heat source: burning fuel or high-temperature steam.'), 330, 50, 300, 80);
    rrect(ctx, 400, 220, 160, 100, 50);
    ctx.fillStyle = '#23262C';
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.stroke();
    text(ctx, L('рабочее тело', 'working gas'), 480, 270, { size: 14 });
    f.hitRect(info('Рабочее тело', 'Working substance', 'Газ или пар, который расширяется и совершает работу.', 'The gas or steam that expands and does the work.'), 400, 220, 160, 100);
    rrect(ctx, 330, 410, 300, 80, 12);
    ctx.fillStyle = alpha(C.blue, 0.3);
    ctx.fill();
    text(ctx, `${L('холодильник', 'cold reservoir')}  T₂ = ${p.T2} K`, 480, 450, { size: 15 });
    f.hitRect(info('Холодильник', 'Cold reservoir', 'Чаще всего — атмосфера. Без холодильника тепловой двигатель работать не может.', 'Usually the atmosphere. A heat engine can’t run without one.'), 330, 410, 300, 80);
    const wQ1 = 60 * flow;
    arrow(ctx, 480, 130, 480, 218, { color: C.red, width: Math.max(2, wQ1 * 0.6) });
    tag(ctx, 'Q₁ = 100%', 560, 175, { color: C.red });
    const work = ease(t, 4, 6);
    arrow(ctx, 562, 270, 562 + 260 * work, 270, { color: C.green, width: Math.max(2, 36 * eta * work) });
    if (work > 0.5) tag(ctx, `A = ${(eta * 100).toFixed(0)}%`, 760, 240, { color: C.green, size: 14 });
    const cold = ease(t, 8, 10);
    arrow(ctx, 480, 322, 480, 322 + 86 * cold, { color: C.blue, width: Math.max(2, 36 * (1 - eta) * cold) });
    if (cold > 0.5) tag(ctx, `Q₂ = ${((1 - eta) * 100).toFixed(0)}%`, 400, 368, { color: C.blue });
  },
};
