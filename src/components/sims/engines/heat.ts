import { alpha, arrow, ball, C, chart, circle, clamp, backdrop, ease, hash, info, lerp, line, mixColor, rrect, seg, SimDef, tag, TAU, text, tx, wave, wobble } from '../kit';

/* ---------- shared bits ---------- */

/** colour of matter by temperature 0 (cold) … 1 (hot) */
export const heatColor = (k: number) => (k < 0.5 ? mixColor('#5B8CFF', '#F5A524', k * 2) : mixColor('#F5A524', '#E5484D', (k - 0.5) * 2));

export function flame(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, power = 1) {
  if (power <= 0.02) return;
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.28;
    const fl = 1 + 0.08 * Math.sin(t * 13 + i * 2) + 0.05 * Math.sin(t * 23 + i);
    const hgt = s * 1.6 * k * fl * power;
    const wid = s * 0.55 * k;
    ctx.beginPath();
    ctx.moveTo(x - wid, y);
    ctx.quadraticCurveTo(x - wid * 1.1, y - hgt * 0.45, x + Math.sin(t * 7 + i) * wid * 0.15, y - hgt);
    ctx.quadraticCurveTo(x + wid * 1.1, y - hgt * 0.45, x + wid, y);
    ctx.closePath();
    ctx.fillStyle = [alpha('#F76B15', 0.85), alpha('#F5A524', 0.9), alpha('#FFE58F', 0.95)][i];
    ctx.fill();
  }
  circle(ctx, x, y - s * 0.15, s * 0.22, alpha('#5B8CFF', 0.7));
}

function erfc(x: number) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

const FLAME = info('Пламя горелки', 'Burner flame', 'Источник тепла: частицы горячих газов сталкиваются с веществом и передают ему энергию.', 'The heat source: hot gas particles collide with matter and hand it energy.');

/* ---------- heat transfer: conduction, convection, radiation ---------- */

export const heatTransfer: SimDef = {
  id: 'heat_transfer',
  title: tx('Виды теплопередачи', 'Ways heat travels'),
  modes: [
    { id: 'conduction', label: tx('Теплопроводность', 'Conduction') },
    { id: 'convection', label: tx('Конвекция', 'Convection') },
    { id: 'radiation', label: tx('Излучение', 'Radiation') },
  ],
  duration: (m) => (m === 'conduction' ? 24 : m === 'convection' ? 18 : 16),
  loop: false,
  params: (m) =>
    m === 'conduction'
      ? [{ id: 'k', label: tx('Теплопроводность материала', 'Material conductivity'), min: 0.3, max: 2, step: 0.1, value: 1, digits: 1, unit: '×' }]
      : m === 'radiation'
        ? [{ id: 'sun', label: tx('Мощность источника', 'Source power'), min: 0.4, max: 1.6, step: 0.1, value: 1, digits: 1, unit: '×' }]
        : [{ id: 'power', label: tx('Мощность горелки', 'Burner power'), min: 0.4, max: 1.6, step: 0.1, value: 1, digits: 1, unit: '×' }],
  stages: (m) =>
    m === 'conduction'
      ? [
          { t: 0, label: tx('Нагрев', 'Heating'), text: tx('Пламя раскачивает частицы левого конца стержня: они колеблются сильнее и быстрее.', 'The flame shakes the particles at the left end: they vibrate harder and faster.') },
          { t: 2, label: tx('Воск плавится', 'Wax melts'), text: tx('Гвоздики на воске отпадают по очереди: ближние раньше, дальние позже.', 'Pins stuck on with wax drop one by one: nearest first, farthest last.') },
          { t: 7, label: tx('Передача', 'Passing on'), text: tx('Частицы сами не перемещаются вдоль стержня — они толкают соседей, и энергия передаётся по цепочке.', 'Particles don’t travel along the rod; they jostle their neighbours, passing energy down the chain.') },
          { t: 19, label: tx('Прогрев', 'Warmed through'), text: tx('Чем лучше вещество проводит тепло (медь лучше стали, сталь лучше стекла), тем быстрее прогрев. Поменяй материал.', 'The better the conductor (copper beats steel, steel beats glass), the faster this happens. Change the material.') },
        ]
      : m === 'convection'
        ? [
            { t: 0, label: tx('Нагрев снизу', 'Heated from below'), text: tx('Нижний слой воды нагревается, расширяется и становится легче окружающей воды.', 'The bottom layer warms, expands and becomes lighter than the water around it.') },
            { t: 3, label: tx('Подъём', 'Rising'), text: tx('Тёплая вода всплывает (архимедова сила), а холодная, более плотная, опускается на её место.', 'Warm water floats up (buoyancy) while cold, denser water sinks to take its place.') },
            { t: 8, label: tx('Круговорот', 'Circulation'), text: tx('Возникают устойчивые потоки — конвекционные ячейки. Так перемешивается и прогревается вся вода.', 'Steady currents form, called convection cells, and they mix and warm all the water.') },
            { t: 14, label: tx('Где ещё', 'Where else'), text: tx('Батарея у пола, ветер у моря, течения в мантии Земли — всё это конвекция. В твёрдых телах и в невесомости её нет.', 'A radiator by the floor, sea breezes, currents in Earth’s mantle are all convection. It can’t happen in solids or in weightlessness.') },
          ]
        : [
            { t: 0, label: tx('Излучение', 'Emission'), text: tx('Любое нагретое тело испускает электромагнитные волны, в основном инфракрасные.', 'Every warm body emits electromagnetic waves, mostly infrared.') },
            { t: 3, label: tx('Через пустоту', 'Through vacuum'), text: tx('Волнам не нужно вещество: так тепло Солнца доходит до Земли через космос.', 'The waves need no matter: that’s how the Sun’s heat crosses empty space to Earth.') },
            { t: 6, label: tx('Поглощение', 'Absorption'), text: tx('Тёмная поверхность поглощает почти всё излучение и греется быстрее. Светлая и блестящая — отражает.', 'A dark surface absorbs almost all the radiation and heats faster. A light, shiny one reflects it.') },
          ],
  metrics: ({ t, p, mode }) => {
    if (mode === 'conduction') {
      const a = 0.04 * p.k;
      const farEnd = t > 0 ? erfc(1 / (2 * Math.sqrt(a * t))) : 0;
      const fallen = [0.2, 0.4, 0.6, 0.8, 1].filter((u) => t > ((u * u) / (4 * a * 0.2275)) * 0.7 + 0.8).length;
      return [
        { label: tx('Температура дальнего конца', 'Far-end temperature'), value: `${Math.round(20 + 380 * farEnd)} °C` },
        { label: tx('Упало гвоздиков', 'Pins dropped'), value: `${fallen} / 5` },
      ];
    }
    if (mode === 'radiation') {
      const k = p.sun;
      const black = 20 + 30 * k * (1 - Math.exp(-Math.max(0, t - 3) / 6));
      const white = 20 + 9 * k * (1 - Math.exp(-Math.max(0, t - 3) / 6));
      return [
        { label: tx('Тёмный сосуд', 'Dark can'), value: `${black.toFixed(1)} °C`, tone: 'bad' },
        { label: tx('Блестящий сосуд', 'Shiny can'), value: `${white.toFixed(1)} °C` },
      ];
    }
    const warm = ease(t, 0, 10) * p.power;
    return [{ label: tx('Средняя температура воды', 'Average water temperature'), value: `${(18 + 40 * warm * (0.4 + 0.6 * seg(t, 0, 18))).toFixed(0)} °C` }];
  },
  tip: (m) =>
    m === 'conduction'
      ? tx('Поставь проводимость 0.3 (стекло) и 2 (медь): сравни, когда упадёт последний гвоздик.', 'Try conductivity 0.3 (glass) and 2 (copper): compare when the last pin drops.')
      : m === 'convection'
        ? tx('Тёплые частицы — оранжевые, холодные — синие. Следи, куда движется каждая.', 'Warm particles are orange, cold ones blue. Follow where each goes.')
        : tx('Сравни температуры двух сосудов внизу: одинаковый источник — разный результат.', 'Compare the two cans’ temperatures below: same source, different result.'),
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'conduction') {
      const x0 = 190;
      const x1 = 830;
      const y = 250;
      const a = 0.04 * p.k;
      const T = (u: number) => (t <= 0 ? (u < 0.02 ? 1 : 0) : erfc(u / (2 * Math.sqrt(a * t))));
      // stand + burner
      rrect(ctx, 150, 346, 80, 16, 4);
      ctx.fillStyle = '#2A2D33';
      ctx.fill();
      flame(ctx, 190, 344, 36, t, ease(t, 0, 0.6));
      f.hit(FLAME, 190, 316, 30);
      // rod body
      rrect(ctx, x0 - 20, y - 34, x1 - x0 + 40, 68, 12);
      ctx.fillStyle = '#23262C';
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.stroke();
      // atoms
      const cols = 26;
      for (let r = 0; r < 3; r++) {
        for (let i = 0; i < cols; i++) {
          const u = i / (cols - 1);
          const k = clamp(T(u));
          const amp = 1.2 + 6 * k;
          const id = r * 100 + i;
          const ax = lerp(x0, x1, u) + wobble(id, t, 6 + 10 * k) * amp;
          const ay = y - 20 + r * 20 + wobble(id + 50, t, 6 + 10 * k) * amp;
          ball(ctx, ax, ay, 7, heatColor(k));
        }
      }
      f.hit(info('Частицы металла', 'Metal particles', 'Колеблются около своих мест. Чем горячее участок, тем сильнее размах колебаний.', 'They vibrate about fixed places; the hotter the spot, the bigger the swing.'), lerp(x0, x1, 0.5), y, 30);
      // wax pins
      [0.2, 0.4, 0.6, 0.8, 1].forEach((u, i) => {
        const px = lerp(x0, x1, u);
        // time the wax at u reaches the melting point
        const tm = (u * u) / (4 * a * 0.2275) * 0.7;
        const fall = clamp((t - tm) / 0.8);
        const py = y + 44 + 120 * fall * fall;
        ctx.globalAlpha = 1 - 0.85 * fall;
        circle(ctx, px, y + 38, 6 * (1 - fall), '#E8D7A3');
        line(ctx, [[px, py], [px, py + 34]], '#B5B8C0', 3);
        circle(ctx, px, py, 4, '#B5B8C0');
        ctx.globalAlpha = 1;
        if (fall < 1) f.hit(info('Гвоздик на воске', 'Pin on wax', 'Отпадает, когда воск под ним нагреется до плавления (~60 °C).', 'Drops off when the wax under it melts (~60 °C).'), px, y + 52, 14);
        text(ctx, `${i + 1}`, px, y + 200, { size: 11, color: C.dim });
      });
      text(ctx, L('нагрев', 'heat'), x0, y - 56, { size: 12, color: C.amber });
      arrow(ctx, x0 + 40, y - 56, x1 - 40, y - 56, { color: alpha(C.amber, 0.5 + 0.5 * ease(t, 0, 3)), width: 2, dash: [6, 6] });
      // temperature scale
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        ctx.fillStyle = heatColor(clamp(T(u)));
        ctx.fillRect(lerp(x0, x1, u) - 8, 470, 17, 10);
      }
      text(ctx, L('температура вдоль стержня', 'temperature along the rod'), (x0 + x1) / 2, 496, { size: 12, color: C.dim });
      return;
    }

    if (mode === 'convection') {
      const bx = 280;
      const by = 110;
      const bw = 400;
      const bh = 300;
      const power = p.power;
      flame(ctx, 400, by + bh + 52, 30, t, ease(t, 0, 0.6) * power);
      flame(ctx, 560, by + bh + 52, 30, t + 1, ease(t, 0, 0.6) * power);
      f.hit(FLAME, 480, by + bh + 30, 40);
      rrect(ctx, 360, by + bh + 52, 240, 14, 4);
      ctx.fillStyle = '#2A2D33';
      ctx.fill();
      // water
      const warm = ease(t, 0, 10) * Math.min(1, power);
      const wg = ctx.createLinearGradient(0, by, 0, by + bh);
      wg.addColorStop(0, alpha('#1B4F8A', 0.55));
      wg.addColorStop(1, alpha('#8A3B1B', 0.25 + 0.4 * warm));
      ctx.fillStyle = wg;
      ctx.fillRect(bx, by + 20, bw, bh - 20);
      f.hitRect(info('Вода', 'Water', 'Жидкость: её частицы могут перемещаться, поэтому тёплые слои переносят энергию сами.', 'A liquid: its particles can move, so warm layers carry the energy themselves.'), bx + 10, by + 30, bw - 20, 60);
      // pot walls
      ctx.strokeStyle = '#8C8F98';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by);
      ctx.lineTo(bx - 3, by + bh + 3);
      ctx.lineTo(bx + bw + 3, by + bh + 3);
      ctx.lineTo(bx + bw + 3, by);
      ctx.stroke();
      // particles along two convection cells
      const flow = Math.max(0, t - 1.5) * 0.12 * power; // phase advance around the cell
      const strength = ease(t, 1, 6);
      for (let i = 0; i < 90; i++) {
        const cell = i % 2;
        const ring = 0.35 + 0.6 * hash(i, 7);
        const ph = hash(i, 3) + flow * (cell ? -1 : 1) * (1.1 - ring * 0.4);
        const ang = ph * TAU;
        const cx = bx + bw * (cell ? 0.75 : 0.25);
        const cy = by + 20 + (bh - 20) / 2;
        const rx = (bw / 4 - 16) * ring;
        const ry = ((bh - 20) / 2 - 16) * ring;
        // at rest the particles just jiggle around their spot
        const restX = bx + 20 + hash(i, 1) * (bw - 40);
        const restY = by + 36 + hash(i, 2) * (bh - 60);
        const fx = cx + Math.cos(ang) * rx;
        const fy = cy + Math.sin(ang) * ry;
        const x = lerp(restX, fx, strength) + wobble(i, t, 3) * 3;
        const y = lerp(restY, fy, strength) + wobble(i + 9, t, 3) * 3;
        // warm near the bottom (flame side), cooling as it rises
        const hot = clamp((y - by) / bh) * ease(t, 0, 4) * Math.min(1.2, power);
        ball(ctx, x, y, 5, heatColor(clamp(hot * 0.95 + warm * 0.15)));
      }
      // flow arrows
      if (strength > 0.2) {
        ctx.globalAlpha = strength;
        [0.25, 0.75].forEach((u, k) => {
          const cx = bx + bw * u;
          const dir = k ? -1 : 1;
          arrow(ctx, cx + dir * 70, by + bh - 50, cx + dir * 70, by + 80, { color: alpha(C.orange, 0.8), width: 2.5 });
          arrow(ctx, cx - dir * 70, by + 80, cx - dir * 70, by + bh - 50, { color: alpha(C.blue, 0.8), width: 2.5 });
        });
        ctx.globalAlpha = 1;
        tag(ctx, L('тёплая вода поднимается', 'warm water rises'), bx + bw / 2, by + bh - 24, { color: C.orange });
        tag(ctx, L('холодная опускается', 'cold water sinks'), bx + bw + 100, by + 80, { color: C.blue });
      }
      return;
    }

    // radiation
    const k = p.sun;
    const sx = 150;
    const sy = 230;
    const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 110);
    sg.addColorStop(0, '#FFF3B0');
    sg.addColorStop(0.35, '#F5A524');
    sg.addColorStop(1, 'rgba(245,165,36,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, 110, 0, TAU);
    ctx.fill();
    ball(ctx, sx, sy, 48, '#F5A524');
    f.hit(info('Источник излучения', 'Radiation source', 'Горячее тело (Солнце, лампа, костёр) излучает инфракрасные и видимые волны во все стороны.', 'A hot body (the Sun, a lamp, a fire) radiates infrared and visible waves in all directions.'), sx, sy, 50);
    text(ctx, L('вакуум — вещества нет', 'vacuum, no matter'), 470, 70, { size: 12, color: C.dim });
    // wave packets travelling to the cans
    const targets = [[690, 210], [690, 370]];
    for (let n = 0; n < 8; n++) {
      const start = n * 0.7;
      if (t < start) continue;
      const prog = ((t - start) * 0.35 * (0.8 + 0.2 * k)) % 1;
      const [tx2, ty2] = targets[n % 2];
      const x = lerp(sx + 60, tx2 - 40, prog);
      const y = lerp(sy, ty2, prog);
      const ang = Math.atan2(ty2 - sy, tx2 - sx - 60);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.9 * Math.sin(prog * Math.PI);
      wave(ctx, -40, 40, 0, 7, 20, t * 8, '#FF7A59', 2.5);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // cans
    const heat = (absorb: number) => clamp(absorb * k * (1 - Math.exp(-Math.max(0, t - 3) / 6)));
    [
      { y: 210, color: '#1E2024', stroke: '#4A4D55', a: 1, name: info('Тёмный сосуд', 'Dark can', 'Чёрная матовая поверхность поглощает почти всё падающее излучение — нагревается сильнее.', 'A matt black surface absorbs almost all incoming radiation and heats up more.') },
      { y: 370, color: '#D9DCE1', stroke: '#FFFFFF', a: 0.3, name: info('Блестящий сосуд', 'Shiny can', 'Светлая блестящая поверхность отражает большую часть излучения — нагревается слабее.', 'A light, shiny surface reflects most of the radiation and heats up less.') },
    ].forEach((c) => {
      const hk = heat(c.a);
      rrect(ctx, 690, c.y - 50, 90, 100, 10);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      f.hitRect(c.name, 690, c.y - 50, 90, 100);
      if (c.a < 1 && t > 3) {
        // reflected rays
        const pr = ((t * 0.6) % 1);
        ctx.globalAlpha = 0.6 * (1 - pr);
        arrow(ctx, 680, c.y - 10, 680 - 120 * pr - 20, c.y + 40 + 60 * pr, { color: '#FF7A59', width: 2 });
        ctx.globalAlpha = 1;
      }
      // thermometer
      const tx0 = 830;
      rrect(ctx, tx0 - 6, c.y - 60, 12, 110, 6);
      ctx.fillStyle = '#2A2D33';
      ctx.fill();
      const lvl = 20 + 70 * hk;
      rrect(ctx, tx0 - 3, c.y + 46 - lvl, 6, lvl, 3);
      ctx.fillStyle = C.red;
      ctx.fill();
      circle(ctx, tx0, c.y + 52, 10, C.red);
      text(ctx, `${(20 + 30 * hk).toFixed(1)}°`, tx0 + 18, c.y - 50, { size: 12, color: C.text, align: 'left', mono: true });
    });
  },
};

/* ---------- heat balance in a calorimeter ---------- */

export const heatBalance: SimDef = {
  id: 'heat_balance',
  title: tx('Тепловой баланс в калориметре', 'Heat balance in a calorimeter'),
  duration: 16,
  loop: false,
  params: [
    { id: 'mw', label: tx('Масса воды', 'Water mass'), min: 0.1, max: 1, step: 0.05, value: 0.3, unit: 'кг', digits: 2 },
    { id: 'tm', label: tx('Температура металла', 'Metal temperature'), min: 60, max: 300, step: 10, value: 100, unit: '°C' },
    { id: 'c', label: tx('Удельная теплоёмкость металла', 'Metal specific heat'), min: 130, max: 900, step: 10, value: 400, unit: 'Дж/(кг·°C)' },
  ],
  stages: [
    { t: 0, label: tx('До опыта', 'Before'), text: tx('Нагретый брусок (0,2 кг) висит над холодной водой (20 °C) в калориметре — сосуде, почти не пропускающем тепло наружу.', 'A hot 0.2 kg block hangs over cold 20 °C water in a calorimeter, a vessel that hardly lets heat escape.') },
    { t: 2, label: tx('Погружение', 'Immersion'), text: tx('Брусок опускают в воду. Тепло всегда идёт от более горячего тела к более холодному.', 'The block goes into the water. Heat always flows from the hotter body to the colder one.') },
    { t: 4, label: tx('Обмен', 'Exchange'), text: tx('Металл остывает, вода нагревается. Сколько теплоты отдал металл — столько получила вода: Q отд = Q пол.', 'The metal cools and the water warms. The heat the metal gives equals the heat the water gets: Q lost = Q gained.') },
    { t: 12, label: tx('Равновесие', 'Equilibrium'), text: tx('Температуры сравнялись — теплообмен закончился. Q = c·m·Δt для каждого тела.', 'The temperatures are equal and the exchange stops. Q = c·m·Δt for each body.') },
  ],
  metrics: ({ t, p }) => {
    const s = solveBalance(p, t);
    return [
      { label: tx('Металл', 'Metal'), value: `${s.Tm.toFixed(1)} °C`, tone: 'bad' },
      { label: tx('Вода', 'Water'), value: `${s.Tw.toFixed(1)} °C` },
      { label: tx('Отдано теплоты', 'Heat given'), value: `${(s.Q / 1000).toFixed(2)} кДж` },
      { label: tx('Равновесная t', 'Final t'), value: `${s.Teq.toFixed(1)} °C`, tone: 'good' },
    ];
  },
  tip: () => tx('Увеличь массу воды: итоговая температура станет ближе к 20 °C — воде «нужно» больше теплоты.', 'Add more water: the final temperature moves toward 20 °C because more water needs more heat.'),
  draw(f) {
    const { ctx, w, h, t, p, L } = f;
    backdrop(ctx, w, h);
    const s = solveBalance(p, t);
    // calorimeter
    const cx = 250;
    const top = 200;
    const level = top + 110 - p.mw * 70;
    rrect(ctx, cx - 130, top, 260, 260, 16);
    ctx.fillStyle = '#1D2025';
    ctx.fill();
    ctx.strokeStyle = '#4A4D55';
    ctx.lineWidth = 3;
    ctx.stroke();
    rrect(ctx, cx - 112, top + 14, 224, 232, 12);
    ctx.fillStyle = '#16181C';
    ctx.fill();
    ctx.fillStyle = mixColor('#1B4F8A', '#B5552B', clamp((s.Tw - 20) / 80));
    ctx.globalAlpha = 0.7;
    ctx.fillRect(cx - 112, level, 224, top + 246 - level);
    ctx.globalAlpha = 1;
    f.hitRect(info('Вода', 'Water', 'Удельная теплоёмкость воды 4200 Дж/(кг·°C) — одна из самых больших: вода медленно греется и медленно остывает.', 'Water’s specific heat, 4200 J/(kg·°C), is among the highest: it warms and cools slowly.'), cx - 112, level, 224, 80);
    f.hitRect(info('Калориметр', 'Calorimeter', 'Двойные стенки с воздухом между ними почти не пропускают тепло наружу, поэтому вся энергия остаётся внутри.', 'Double walls with air between them barely let heat out, so all the energy stays inside.'), cx - 130, top + 200, 260, 60);
    // block
    const drop = ease(t, 2, 3.2);
    const by = lerp(90, level + 50, drop);
    line(ctx, [[cx, 30], [cx, by - 28]], '#8C8F98', 1.5);
    const bk = clamp((s.Tm - 20) / 280);
    rrect(ctx, cx - 36, by - 28, 72, 56, 6);
    ctx.fillStyle = mixColor('#6B6F78', '#E5484D', bk);
    ctx.fill();
    if (bk > 0.15) {
      ctx.shadowColor = C.red;
      ctx.shadowBlur = 20 * bk;
      ctx.strokeStyle = alpha(C.orange, bk);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    f.hitRect(info('Металлический брусок', 'Metal block', 'Масса 0,2 кг. Остывая, отдаёт теплоту Q = c·m·(t₁ − t).', 'Mass 0.2 kg. As it cools it gives off heat Q = c·m·(t₁ − t).'), cx - 36, by - 28, 72, 56);
    // heat arrows during exchange
    if (t > 3.2 && s.k < 0.97) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t;
        const r1 = 44;
        const r2 = 44 + 30 * ((t * 0.8 + i * 0.17) % 1);
        ctx.globalAlpha = (1 - s.k) * 0.8;
        arrow(ctx, cx + Math.cos(a) * r1, by + Math.sin(a) * r1 * 0.8, cx + Math.cos(a) * r2, by + Math.sin(a) * r2 * 0.8, { color: C.orange, width: 2, head: 6 });
      }
      ctx.globalAlpha = 1;
    }
    // thermometer readouts
    tag(ctx, `${L('металл', 'metal')} ${s.Tm.toFixed(0)}°`, cx - 70, 150, { color: C.red });
    tag(ctx, `${L('вода', 'water')} ${s.Tw.toFixed(0)}°`, cx + 70, 150, { color: C.blue });
    // graph
    const T0 = Math.max(p.tm, 40);
    chart(ctx, {
      x: 450, y: 90, w: 470, h: 360, xMax: 16, yMax: T0 + 10,
      title: L('Температура от времени', 'Temperature over time'),
      xLabel: L('t, с', 't, s'), yLabel: '°C', upTo: t, cursor: t,
      series: [
        { color: C.red, label: L('металл', 'metal'), fn: (x) => solveBalance(p, x).Tm },
        { color: C.blue, label: L('вода', 'water'), fn: (x) => solveBalance(p, x).Tw },
        { color: alpha(C.green, 0.6), label: L('равновесие', 'equilibrium'), fn: () => solveBalance(p, 0).Teq, dash: [4, 4], width: 1.5 },
      ],
    });
  },
};

function solveBalance(p: Record<string, number>, t: number) {
  const mm = 0.2;
  const cw = 4200;
  const Tw0 = 20;
  const Teq = (p.c * mm * p.tm + cw * p.mw * Tw0) / (p.c * mm + cw * p.mw);
  const k = t < 3 ? 0 : 1 - Math.exp(-(t - 3) / 2.2);
  const Tm = lerp(p.tm, Teq, k);
  const Tw = lerp(Tw0, Teq, k);
  return { Teq, Tm, Tw, k, Q: p.c * mm * (p.tm - Tm) };
}
