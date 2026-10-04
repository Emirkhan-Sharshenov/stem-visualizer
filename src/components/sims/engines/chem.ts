import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, tag, TAU, text, tx, wobble } from '../kit';
import { flame } from './heat';

/* ---------- shared drawing ---------- */

function beaker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number, liquid: string) {
  ctx.fillStyle = liquid;
  ctx.fillRect(x + 3, y + h - level, w - 6, level - 3);
  ctx.strokeStyle = alpha('#D5D8DE', 0.8);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x, y + 6);
  ctx.lineTo(x, y + h - 8);
  ctx.quadraticCurveTo(x, y + h, x + 8, y + h);
  ctx.lineTo(x + w - 8, y + h);
  ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - 8);
  ctx.lineTo(x + w, y + 6);
  ctx.lineTo(x + w + 6, y);
  ctx.stroke();
  for (let i = 1; i <= 4; i++) line(ctx, [[x + w - 22, y + h - (h * i) / 5], [x + w - 6, y + h - (h * i) / 5]], alpha('#D5D8DE', 0.4), 1);
}

/** a water molecule drawn as a small V: O red, H white, angle in radians */
function water(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, s = 1) {
  const r = 6 * s;
  ball(ctx, x, y, r, '#E5484D');
  for (const d of [-0.9, 0.9]) ball(ctx, x + Math.cos(ang + d) * r * 1.5, y + Math.sin(ang + d) * r * 1.5, r * 0.6, '#F2F4F7');
}

function ionBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, label: string) {
  ball(ctx, x, y, r, color);
  text(ctx, label, x, y + 0.5, { size: Math.max(9, r * 0.75), color: '#FFFFFF', weight: 700 });
}

/* ---------- electrolytic dissociation and pH ---------- */

const INDICATORS = [
  { name: tx('Лакмус', 'Litmus'), at: (ph: number) => (ph < 5 ? '#E5484D' : ph > 8 ? '#3F6FE0' : '#8E4EC6') },
  { name: tx('Фенолфталеин', 'Phenolphthalein'), at: (ph: number) => (ph < 8.2 ? 'rgba(255,255,255,0.08)' : ph < 10 ? '#E86AAE' : '#C2187A') },
  { name: tx('Метилоранж', 'Methyl orange'), at: (ph: number) => (ph < 3.1 ? '#E5484D' : ph < 4.4 ? '#F76B15' : '#F5C842') },
];

export const dissociation: SimDef = {
  id: 'dissociation',
  title: tx('Электролитическая диссоциация', 'Electrolytic dissociation'),
  modes: [
    { id: 'dissolve', label: tx('Растворение соли', 'Dissolving salt') },
    { id: 'strength', label: tx('Сильные и слабые', 'Strong and weak') },
    { id: 'ph', label: tx('pH и индикаторы', 'pH and indicators') },
  ],
  duration: (m) => (m === 'dissolve' ? 14 : m === 'strength' ? 10 : 10),
  loop: false,
  params: (m) =>
    m === 'strength'
      ? [{ id: 'alpha', label: tx('Степень диссоциации α', 'Degree of dissociation α'), min: 0.02, max: 1, step: 0.02, value: 0.1, digits: 2 }]
      : m === 'ph'
        ? [{ id: 'ph', label: tx('pH раствора', 'Solution pH'), min: 0, max: 14, step: 0.5, value: 3, digits: 1 }]
        : [],
  stages: (m) =>
    m === 'dissolve'
      ? [
          { t: 0, label: tx('Кристалл в воде', 'Crystal in water'), text: tx('Кристалл NaCl в воде. Молекулы воды полярны: на кислороде частичный «−», на водородах «+».', 'An NaCl crystal in water. Water molecules are polar: δ− on the oxygen, δ+ on the hydrogens.') },
          { t: 2, label: tx('Ориентация', 'Orientation'), text: tx('Вода поворачивается к ионам: кислородом к Na⁺, водородами к Cl⁻.', 'Water turns toward the ions: oxygen to Na⁺, hydrogens to Cl⁻.') },
          { t: 5, label: tx('Отрыв ионов', 'Ions pulled off'), text: tx('Диполи воды вырывают ионы из решётки. Каждый ион окружается «шубой» из молекул воды — гидратируется.', 'Water dipoles tug ions out of the lattice. Each ion gets a coat of water molecules: it is hydrated.') },
          { t: 11, label: tx('Раствор', 'Solution'), text: tx('NaCl → Na⁺ + Cl⁻. Свободные ионы делают раствор проводником тока — это электролит.', 'NaCl → Na⁺ + Cl⁻. Free ions make the solution conduct electricity: it is an electrolyte.') },
        ]
      : m === 'strength'
        ? [
            { t: 0, label: tx('Молекулы кислоты', 'Acid molecules'), text: tx('В воду добавили кислоту HA.', 'An acid HA is added to water.') },
            { t: 3, label: tx('Распад на ионы', 'Splitting into ions'), text: tx('Часть молекул распадается: HA ⇌ H⁺ + A⁻. Доля распавшихся — степень диссоциации α.', 'Some molecules split: HA ⇌ H⁺ + A⁻. The fraction that splits is the degree of dissociation α.') },
            { t: 6, label: tx('Сила электролита', 'Electrolyte strength'), text: tx('Сильные (HCl, NaOH, соли) распадаются почти нацело, слабые (уксусная кислота, NH₃·H₂O) — на несколько %. Лампочка горит ярче при большем α.', 'Strong ones (HCl, NaOH, salts) split almost completely; weak ones (acetic acid, NH₃·H₂O) only a few %. The bulb glows brighter for higher α.') },
          ]
        : [
            { t: 0, label: tx('Ионы H⁺ и OH⁻', 'H⁺ and OH⁻ ions'), text: tx('Кислотность определяют ионы H⁺: pH = −lg[H⁺]. В нейтральной воде [H⁺] = [OH⁻] = 10⁻⁷ моль/л, pH = 7.', 'Acidity comes from H⁺ ions: pH = −log[H⁺]. In neutral water [H⁺] = [OH⁻] = 10⁻⁷ mol/L, so pH = 7.') },
            { t: 4, label: tx('Индикаторы', 'Indicators'), text: tx('Индикаторы меняют цвет в зависимости от pH. Сдвинь ползунок — посмотри, как меняются цвета.', 'Indicators change colour with pH. Move the slider and watch the colours change.') },
          ],
  metrics: ({ p, mode }) =>
    mode === 'ph'
      ? [
          { label: tx('[H⁺], моль/л', '[H⁺], mol/L'), value: `10^${(-p.ph).toFixed(1)}` },
          { label: tx('Среда', 'Medium'), value: p.ph < 6.5 ? 'кислая · acidic' : p.ph > 7.5 ? 'щелочная · alkaline' : 'нейтральная · neutral', tone: p.ph < 6.5 ? 'bad' : p.ph > 7.5 ? undefined : 'good' },
        ]
      : mode === 'strength'
        ? [{ label: tx('Степень диссоциации', 'Degree of dissociation'), value: `${(p.alpha * 100).toFixed(0)} %` }, { label: tx('Электролит', 'Electrolyte'), value: p.alpha > 0.3 ? 'сильный · strong' : 'слабый · weak' }]
        : [],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'dissolve') {
      beaker(ctx, 200, 70, 560, 420, 380, alpha('#2F6FB5', 0.18));
      f.hitRect(info('Вода', 'Water', 'Полярный растворитель: молекулы — диполи.', 'A polar solvent whose molecules are dipoles.'), 210, 120, 540, 40);
      // crystal 4x4 at the bottom centre; ions leave one by one
      const ions: { x: number; y: number; na: boolean; leave: number }[] = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 6; c++) ions.push({ x: 380 + c * 34, y: 460 - r * 34, na: (r + c) % 2 === 0, leave: 5 + (3 - r) * 1.2 + hash(r, c) * 1.5 + (c === 0 || c === 5 ? 0 : 0.8) });
      ions.forEach((ion, i) => {
        const k = ease(t, ion.leave, ion.leave + 2.5);
        const tx0 = 240 + hash(i, 4) * 480;
        const ty0 = 150 + hash(i, 5) * 260;
        const x = lerp(ion.x, tx0 + wobble(i, t, 1) * 12, k);
        const y = lerp(ion.y, ty0 + wobble(i + 9, t, 1) * 12, k);
        // hydration shell
        if (k > 0.2)
          for (let s = 0; s < 5; s++) {
            const a = (s / 5) * TAU + t * 0.3 + i;
            const rr = (ion.na ? 22 : 26) * k;
            const wx = x + Math.cos(a) * rr;
            const wy = y + Math.sin(a) * rr;
            // oxygen faces Na⁺, hydrogens face Cl⁻
            water(ctx, wx, wy, ion.na ? a : a + Math.PI, 0.7);
          }
        ionBall(ctx, x, y, ion.na ? 11 : 15, ion.na ? '#AB6CF0' : '#3CC46A', ion.na ? 'Na⁺' : 'Cl⁻');
        if (i === 0) f.hit(info('Ион Na⁺', 'Na⁺ ion', 'Окружён молекулами воды, повёрнутыми к нему отрицательным кислородом.', 'Surrounded by water molecules turned toward it with their negative oxygen.'), x, y, 12);
        if (i === 1) f.hit(info('Ион Cl⁻', 'Cl⁻ ion', 'Окружён молекулами воды, повёрнутыми к нему положительными водородами.', 'Surrounded by water molecules turned toward it with their positive hydrogens.'), x, y, 15);
      });
      // free water molecules
      for (let i = 0; i < 40; i++) {
        const x = 230 + hash(i, 11) * 500 + wobble(i, t, 1.5) * 10;
        const y = 140 + hash(i, 12) * 260 + wobble(i + 3, t, 1.5) * 10;
        water(ctx, x, y, hash(i, 13) * TAU + t * (hash(i, 14) - 0.5), 0.8);
      }
      f.hit(info('Молекула воды', 'Water molecule', 'H₂O — диполь: на кислороде частичный отрицательный заряд, на водородах — положительный.', 'H₂O is a dipole: the oxygen carries a partial negative charge, the hydrogens a partial positive one.'), 230 + hash(0, 11) * 500, 140 + hash(0, 12) * 260, 10);
      // conductivity bulb
      const lit = ease(t, 8, 12);
      const g = ctx.createRadialGradient(860, 120, 4, 860, 120, 60);
      g.addColorStop(0, alpha(C.yellow, 0.8 * lit));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(860, 120, 60, 0, TAU);
      ctx.fill();
      circle(ctx, 860, 120, 20, alpha(C.yellow, 0.1 + 0.8 * lit), '#B5B8C0', 2);
      line(ctx, [[860, 140], [860, 200], [740, 200], [740, 250]], '#8C8F98', 2);
      f.hit(info('Лампочка-тестер', 'Conductivity tester', 'Загорается, когда в растворе появляются свободные ионы.', 'Lights up when free ions appear in the solution.'), 860, 120, 22);
      return;
    }
    if (mode === 'strength') {
      beaker(ctx, 150, 70, 520, 420, 380, alpha('#2F6FB5', 0.16));
      const n = 30;
      for (let i = 0; i < n; i++) {
        const x = 200 + (i % 6) * 80 + wobble(i, t, 1) * 14;
        const y = 170 + Math.floor(i / 6) * 62 + wobble(i + 4, t, 1) * 12;
        const split = hash(i, 21) < p.alpha ? ease(t, 3 + hash(i, 22) * 2, 4 + hash(i, 22) * 2) : 0;
        // dynamic equilibrium: some ions recombine while others split
        const d = split * 26;
        if (split < 0.5) {
          ball(ctx, x - 7 + d * 0.5, y, 8, '#F2F4F7');
          ionBall(ctx, x + 8 + d * 0.5, y, 12, '#F5A524', 'A');
          if (i === 0) f.hit(info('Молекула HA', 'HA molecule', 'Нераспавшаяся молекула кислоты — ток не проводит.', 'An undissociated acid molecule; it doesn’t carry current.'), x, y, 14);
        } else {
          ionBall(ctx, x - d, y - 6, 8, '#E5484D', 'H⁺');
          ionBall(ctx, x + d, y + 6, 12, '#F5A524', 'A⁻');
          if (i === 0 || hash(i, 21) < 0.02) f.hit(info('Ионы H⁺ и A⁻', 'H⁺ and A⁻ ions', 'Продукты диссоциации — переносят заряд.', 'The dissociation products; they carry charge.'), x, y, 18);
        }
      }
      const lit = p.alpha * ease(t, 4, 6);
      const g = ctx.createRadialGradient(800, 160, 4, 800, 160, 90);
      g.addColorStop(0, alpha(C.yellow, 0.9 * lit));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(800, 160, 90, 0, TAU);
      ctx.fill();
      circle(ctx, 800, 160, 26, alpha(C.yellow, 0.1 + 0.85 * lit), '#B5B8C0', 2);
      tag(ctx, `α = ${(p.alpha * 100).toFixed(0)}%`, 800, 230, { color: C.amber, size: 14 });
      tag(ctx, p.alpha > 0.3 ? L('сильный электролит', 'strong electrolyte') : L('слабый электролит', 'weak electrolyte'), 800, 270, { color: p.alpha > 0.3 ? C.green : C.sky });
      return;
    }
    // pH scale
    const ph = p.ph;
    for (let i = 0; i <= 14; i++) {
      const x = 80 + i * 57;
      const col = i < 7 ? mixColor('#E5484D', '#F5C842', i / 7) : mixColor('#30A46C', '#3F6FE0', (i - 7) / 7);
      rrect(ctx, x - 26, 40, 52, 44, 6);
      ctx.fillStyle = col;
      ctx.fill();
      text(ctx, String(i), x, 62, { size: 15, color: '#111214', weight: 700 });
    }
    const mx = 80 + ph * 57;
    circle(ctx, mx, 100, 7, C.white);
    tag(ctx, L('кислая', 'acidic'), 160, 120, { color: C.red });
    tag(ctx, L('нейтральная', 'neutral'), 479, 120, { color: C.green });
    tag(ctx, L('щелочная', 'alkaline'), 800, 120, { color: C.blue });
    f.hitRect(info('Шкала pH', 'pH scale', 'Желудочный сок ≈ 1–2, лимон ≈ 2,5, кофе ≈ 5, кровь ≈ 7,4, мыло ≈ 10, нашатырь ≈ 11.', 'Stomach acid ≈ 1–2, lemon ≈ 2.5, coffee ≈ 5, blood ≈ 7.4, soap ≈ 10, ammonia solution ≈ 11.'), 54, 40, 852, 44);
    // three test tubes with indicators
    const show = ease(t, 4, 5.5);
    INDICATORS.forEach((ind, i) => {
      const x = 180 + i * 150;
      rrect(ctx, x - 24, 170, 48, 250, 22);
      ctx.strokeStyle = alpha('#D5D8DE', 0.8);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = show > 0 ? ind.at(ph) : alpha('#2F6FB5', 0.2);
      ctx.globalAlpha = 0.25 + 0.75 * show;
      rrect(ctx, x - 21, 250, 42, 167, 20);
      ctx.fill();
      ctx.globalAlpha = 1;
      text(ctx, ind.name[f.lang], x, 445, { size: 12, color: C.dim });
      f.hitRect(info(ind.name.ru, ind.name.en, 'Индикатор — слабая органическая кислота или основание, у которой молекула и ион окрашены по-разному.', 'An indicator is a weak organic acid or base whose molecule and ion have different colours.'), x - 24, 170, 48, 250);
    });
    // particle view of H+ / OH-
    rrect(ctx, 640, 170, 280, 250, 12);
    ctx.fillStyle = C.panel;
    ctx.fill();
    const nH = Math.round(clamp((7 - ph) / 7) * 24 + 2);
    const nOH = Math.round(clamp((ph - 7) / 7) * 24 + 2);
    for (let i = 0; i < nH; i++) ionBall(ctx, 660 + hash(i, 31) * 240 + wobble(i, t, 1) * 6, 190 + hash(i, 32) * 210, 9, '#E5484D', 'H⁺');
    for (let i = 0; i < nOH; i++) ionBall(ctx, 660 + hash(i, 33) * 240 + wobble(i + 7, t, 1) * 6, 190 + hash(i, 34) * 210, 11, '#3F6FE0', 'OH⁻');
    text(ctx, L('ионы в растворе (условно)', 'ions in solution (schematic)'), 780, 440, { size: 11.5, color: C.dim });
  },
};

/* ---------- reaction rate and chemical equilibrium ---------- */

export const kinetics: SimDef = {
  id: 'kinetics',
  title: tx('Скорость реакции и равновесие', 'Reaction rate and equilibrium'),
  modes: [
    { id: 'rate', label: tx('Скорость', 'Rate') },
    { id: 'equilibrium', label: tx('Равновесие', 'Equilibrium') },
  ],
  duration: 14,
  loop: false,
  params: (m) =>
    m === 'rate'
      ? [
          { id: 'T', label: tx('Температура', 'Temperature'), min: 20, max: 80, step: 10, value: 30, unit: '°C' },
          { id: 'c', label: tx('Концентрация', 'Concentration'), min: 0.5, max: 2, step: 0.25, value: 1, unit: '×', digits: 2 },
          { id: 'cat', label: tx('Катализатор (0 — нет, 1 — есть)', 'Catalyst (0 no, 1 yes)'), min: 0, max: 1, step: 1, value: 0 },
        ]
      : [
          { id: 'T', label: tx('Температура (реакция экзотермическая)', 'Temperature (reaction is exothermic)'), min: 0, max: 2, step: 1, value: 1 },
          { id: 'add', label: tx('Добавить исходное вещество на 7-й секунде', 'Add more reactant at t = 7 s'), min: 0, max: 1, step: 1, value: 1 },
        ],
  stages: (m) =>
    m === 'rate'
      ? [
          { t: 0, label: tx('Столкновения', 'Collisions'), text: tx('Реагируют только частицы, которые столкнулись с энергией выше энергии активации.', 'Only particles that collide with more than the activation energy react.') },
          { t: 4, label: tx('Влияние условий', 'Conditions'), text: tx('Выше температура — быстрее частицы и больше удачных ударов (правило Вант-Гоффа: +10 °C → в 2–4 раза быстрее). Выше концентрация — чаще столкновения. Катализатор снижает барьер.', 'Higher temperature means faster particles and more successful hits (van ’t Hoff: +10 °C → 2–4× faster). Higher concentration means more collisions. A catalyst lowers the barrier.') },
          { t: 10, label: tx('Замедление', 'Slowing down'), text: tx('Реагенты расходуются — скорость падает. Скорость = изменение концентрации за единицу времени.', 'Reactants get used up, so the rate drops. Rate = change in concentration per unit time.') },
        ]
      : [
          { t: 0, label: tx('Прямая реакция', 'Forward reaction'), text: tx('A ⇌ B. Сначала есть только A — идёт прямая реакция.', 'A ⇌ B. At first there is only A, so the forward reaction runs.') },
          { t: 3, label: tx('Обратная реакция', 'Reverse reaction'), text: tx('Накапливается B — ускоряется обратная реакция B → A.', 'As B builds up, the reverse reaction B → A speeds up.') },
          { t: 5.5, label: tx('Равновесие', 'Equilibrium'), text: tx('Скорости сравнялись: концентрации не меняются, но частицы продолжают превращаться — равновесие динамическое.', 'The rates are equal: concentrations stop changing, yet particles keep converting. The equilibrium is dynamic.') },
          { t: 7, label: tx('Ле Шателье', 'Le Chatelier'), text: tx('Добавили A — система «сопротивляется»: равновесие смещается вправо, пока не установится новое.', 'Add more A and the system pushes back: the equilibrium shifts right until a new balance forms.') },
        ],
  metrics: ({ t, p, mode }) => {
    if (mode === 'rate') {
      const k = rateK(p);
      return [
        { label: tx('Константа скорости (отн.)', 'Rate constant (rel.)'), value: `${(k / rateK({ T: 30, c: 1, cat: 0 })).toFixed(1)}×` },
        { label: tx('Осталось реагента', 'Reactant left'), value: `${(Math.exp(-k * t) * 100).toFixed(0)} %` },
      ];
    }
    const e = eqState(p, t);
    return [
      { label: tx('[A]', '[A]'), value: e.A.toFixed(2) },
      { label: tx('[B]', '[B]'), value: e.B.toFixed(2) },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const box = { x: 40, y: 40, w: 520, h: 460 };
    rrect(ctx, box.x, box.y, box.w, box.h, 14);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // deterministic bouncing particles (triangle wave in x and y)
    const pos = (i: number, speed: number) => {
      const tri = (v: number) => 1 - Math.abs(((v % 2) + 2) % 2 - 1);
      return [box.x + 14 + tri(hash(i) * 2 + t * speed * (0.1 + hash(i, 1) * 0.08)) * (box.w - 28), box.y + 14 + tri(hash(i, 2) * 2 + t * speed * (0.08 + hash(i, 3) * 0.08)) * (box.h - 28)];
    };
    if (mode === 'rate') {
      const k = rateK(p);
      const speed = 0.6 + (p.T - 20) / 40;
      const n = Math.round(40 * p.c);
      for (let i = 0; i < n; i++) {
        const tr = -Math.log(1 - hash(i, 9)) / k; // reaction moment of this pair
        const done = t > tr;
        const [x, y] = pos(i, speed);
        if (!done) {
          ball(ctx, x - 6, y, 7, '#3F6FE0');
          ball(ctx, x + 6, y, 7, '#F5A524');
        } else {
          ball(ctx, x, y, 9, '#30A46C');
          if (t - tr < 0.4) circle(ctx, x, y, 9 + (t - tr) * 50, undefined, alpha(C.yellow, 1 - (t - tr) / 0.4), 2);
        }
        if (i === 0) f.hit(done ? info('Продукт', 'Product', 'Частицы прореагировали.', 'These particles have reacted.') : info('Реагенты', 'Reactants', 'Ещё не прореагировали: ждут удачного столкновения.', 'Not yet reacted: waiting for a successful collision.'), x, y, 12);
      }
      if (p.cat) {
        rrect(ctx, box.x + 160, box.y + box.h - 30, 200, 18, 6);
        ctx.fillStyle = alpha('#8C8F98', 0.6);
        ctx.fill();
        text(ctx, L('катализатор', 'catalyst'), box.x + 260, box.y + box.h - 21, { size: 11, color: C.white });
      }
      chart(ctx, {
        x: 590, y: 40, w: 340, h: 300, xMax: 14, yMax: 1.05, title: L('Концентрация реагента', 'Reactant concentration'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
        series: [
          { color: C.blue, label: L('сейчас', 'now'), fn: (x) => Math.exp(-k * x) },
          { color: alpha('#8C8F98', 0.6), label: L('30 °C без катализатора', '30 °C, no catalyst'), fn: (x) => Math.exp(-rateK({ T: 30, c: 1, cat: 0 }) * x), dash: [4, 4], width: 1.5 },
        ],
      });
      // energy barrier mini-diagram
      const bx = 600;
      const by = 360;
      rrect(ctx, bx - 10, by, 340, 140, 10);
      ctx.fillStyle = C.panel;
      ctx.fill();
      const barrier = p.cat ? 40 : 80;
      const path: [number, number][] = [];
      for (let s = 0; s <= 1; s += 0.02) path.push([bx + 20 + s * 300, by + 100 - Math.sin(s * Math.PI) * barrier - s * 20]);
      line(ctx, path, C.sky, 2);
      text(ctx, L('энергия активации', 'activation energy'), bx + 170, by + 18, { size: 11, color: C.dim });
      return;
    }
    const e = eqState(p, t);
    const n = 60;
    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i, 1);
      const total = i < 40 || (p.add && t > 7) ? 1 : 0;
      if (!total) continue;
      // dynamic equilibrium: the share of B matches [B], but which particles are B keeps changing
      const fracB = e.B / (e.A + e.B);
      const isB = (hash(i, 40) + t * 0.06) % 1 < fracB;
      if (isB) ball(ctx, x, y, 9, C.green);
      else ball(ctx, x, y, 9, C.blue);
      if (i === 0) f.hit(isB ? info('Частица B', 'Particle B', 'Продукт. Может снова превратиться в A.', 'The product. It can turn back into A.') : info('Частица A', 'Particle A', 'Исходное вещество.', 'The starting substance.'), x, y, 11);
    }
    if (p.add && t > 6.6 && t < 7.6) tag(ctx, L('+ добавили A', '+ added A'), box.x + box.w / 2, box.y + 30, { color: C.blue, size: 14 });
    chart(ctx, {
      x: 590, y: 40, w: 340, h: 460, xMax: 14, yMax: 1.6, title: L('Концентрации', 'Concentrations'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
      series: [
        { color: C.blue, label: '[A]', fn: (x) => eqState(p, x).A },
        { color: C.green, label: '[B]', fn: (x) => eqState(p, x).B },
      ],
    });
  },
};

function rateK(p: Record<string, number>) {
  // van 't Hoff ×2.5 per 10 °C; catalyst ×4
  return 0.12 * Math.pow(2.5, (p.T - 30) / 10) * (p.cat ? 4 : 1) * (0.6 + 0.4 * (p.c ?? 1));
}

function eqState(p: Record<string, number>, t: number) {
  // A ⇌ B, exothermic forward: heating favours A
  const kf = [0.6, 0.45, 0.3][p.T] ?? 0.45;
  const kb = [0.15, 0.25, 0.4][p.T] ?? 0.25;
  const K = kf / (kf + kb);
  const relax = (A0: number, B0: number, dt: number) => {
    const tot = A0 + B0;
    const Beq = tot * K;
    const B = Beq + (B0 - Beq) * Math.exp(-(kf + kb) * dt);
    return { A: tot - B, B };
  };
  if (!p.add || t < 7) return relax(1, 0, t);
  const s7 = relax(1, 0, 7);
  return relax(s7.A + 0.5, s7.B, t - 7);
}

/* ---------- separating mixtures ---------- */

export const separation: SimDef = {
  id: 'separation',
  title: tx('Разделение смесей', 'Separating mixtures'),
  modes: [
    { id: 'filter', label: tx('Фильтрование', 'Filtering') },
    { id: 'evaporate', label: tx('Выпаривание', 'Evaporation') },
    { id: 'distill', label: tx('Перегонка', 'Distillation') },
    { id: 'magnet', label: tx('Магнит', 'Magnet') },
  ],
  duration: 12,
  loop: false,
  stages: (m) =>
    m === 'filter'
      ? [
          { t: 0, label: tx('Мутная вода', 'Muddy water'), text: tx('Смесь воды с песком и глиной — неоднородная.', 'Water with sand and clay is a heterogeneous mixture.') },
          { t: 2, label: tx('Фильтр', 'Filter'), text: tx('Поры бумажного фильтра пропускают воду и растворённые вещества, но задерживают твёрдые частицы.', 'The filter paper’s pores let water and dissolved substances through but stop solid particles.') },
          { t: 8, label: tx('Фильтрат', 'Filtrate'), text: tx('В стакане — прозрачный фильтрат, песок остался на фильтре. Растворённую соль фильтр не задержит!', 'The beaker holds a clear filtrate; the sand stays on the filter. Dissolved salt would get through!') },
        ]
      : m === 'evaporate'
        ? [
            { t: 0, label: tx('Раствор соли', 'Salt solution'), text: tx('Соль растворена — фильтр её не отделит. Однородная смесь.', 'The salt is dissolved, so filtering won’t separate it. A homogeneous mixture.') },
            { t: 2, label: tx('Нагрев', 'Heating'), text: tx('Вода испаряется, а соль остаётся — её температура кипения гораздо выше.', 'The water evaporates while the salt stays: its boiling point is far higher.') },
            { t: 8, label: tx('Кристаллы', 'Crystals'), text: tx('В чашке остаются кристаллы соли. Так соль добывают из морской воды.', 'Salt crystals remain in the dish. That’s how salt is made from seawater.') },
          ]
        : m === 'distill'
          ? [
              { t: 0, label: tx('Кипение', 'Boiling'), text: tx('Смесь нагревают; первой кипит жидкость с меньшей температурой кипения.', 'The mixture is heated; the liquid with the lower boiling point boils first.') },
              { t: 3, label: tx('Холодильник', 'Condenser'), text: tx('Пар идёт по трубке, окружённой холодной водой, и конденсируется.', 'The vapour passes through a tube cooled by running water and condenses.') },
              { t: 6, label: tx('Дистиллят', 'Distillate'), text: tx('В приёмник капает чистая жидкость. Так получают дистиллированную воду и разделяют нефть на фракции.', 'Pure liquid drips into the receiver. That’s how distilled water is made and crude oil split into fractions.') },
            ]
          : [
              { t: 0, label: tx('Смесь порошков', 'Powder mix'), text: tx('Железные опилки перемешаны с серой.', 'Iron filings are mixed with sulfur.') },
              { t: 2, label: tx('Магнит', 'Magnet'), text: tx('Магнит притягивает железо, сера остаётся — у компонентов смеси сохраняются свои свойства.', 'The magnet pulls out the iron and the sulfur stays: each part of a mixture keeps its own properties.') },
              { t: 8, label: tx('Смесь или вещество?', 'Mixture or compound?'), text: tx('Если нагреть смесь, получится сульфид железа FeS — новое вещество, которое магнит уже не разделит.', 'Heat the mixture and you get iron sulfide FeS, a new substance a magnet can no longer separate.') },
            ],
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'filter') {
      // funnel
      ctx.fillStyle = alpha('#E8E4D8', 0.85);
      ctx.beginPath();
      ctx.moveTo(380, 120);
      ctx.lineTo(580, 120);
      ctx.lineTo(480, 270);
      ctx.closePath();
      ctx.fill();
      f.hit(info('Бумажный фильтр', 'Filter paper', 'Сложенная конусом бумага с микроскопическими порами.', 'Paper folded into a cone with microscopic pores.'), 480, 170, 40);
      line(ctx, [[370, 110], [480, 280], [590, 110]], '#B5B8C0', 3);
      line(ctx, [[480, 280], [480, 360]], '#B5B8C0', 6);
      // pouring
      const pour = ease(t, 0.5, 7);
      const sand = ease(t, 1, 8);
      ctx.fillStyle = alpha('#8A6A3A', 0.6 * (1 - pour * 0.6));
      ctx.beginPath();
      ctx.moveTo(400, 130);
      ctx.lineTo(560, 130);
      ctx.lineTo(480, 250);
      ctx.closePath();
      if (pour > 0 && pour < 1) ctx.fill();
      for (let i = 0; i < 40; i++) {
        const x = 440 + hash(i) * 80;
        const y = lerp(140 + hash(i, 1) * 60, 205 + hash(i, 2) * 40 - Math.abs(x - 480) * 0.8, sand);
        circle(ctx, x, y, 3.5, '#C9A86A');
      }
      // drops
      for (let i = 0; i < 4; i++) {
        const s = (t * 1.2 + i / 4) % 1;
        if (t > 2 && t < 9) circle(ctx, 480, lerp(360, 470 - ease(t, 2, 9) * 90, s), 4, alpha('#8FC1FF', 0.9));
      }
      beaker(ctx, 410, 380, 140, 120, 10 + ease(t, 2, 9) * 90, alpha('#5B9CFF', 0.35));
      f.hitRect(info('Фильтрат', 'Filtrate', 'Прошедшая через фильтр прозрачная жидкость.', 'The clear liquid that passed through the filter.'), 410, 420, 140, 80);
      // muddy beaker pouring in
      ctx.save();
      ctx.translate(250, 120);
      ctx.rotate(-0.8 * (pour > 0 && pour < 1 ? 1 : pour >= 1 ? 0.3 : 0));
      beaker(ctx, -60, -40, 110, 130, 90 * (1 - pour), alpha('#8A6A3A', 0.7));
      ctx.restore();
      return;
    }
    if (mode === 'evaporate') {
      const k = ease(t, 2, 9);
      flame(ctx, 480, 450, 34, t, ease(t, 1, 2));
      line(ctx, [[400, 380], [560, 380]], '#8C8F98', 4);
      ctx.fillStyle = '#D5D8DE';
      ctx.beginPath();
      ctx.ellipse(480, 360, 110, 34, 0, 0, Math.PI);
      ctx.fill();
      f.hit(info('Фарфоровая чашка', 'Evaporating dish', 'Выдерживает сильный нагрев.', 'Withstands strong heating.'), 480, 375, 30);
      ctx.fillStyle = alpha('#5B9CFF', 0.5);
      ctx.beginPath();
      ctx.ellipse(480, 360, 100 * (1 - k * 0.7), 22 * (1 - k * 0.8), 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 30; i++) {
        const s = (t * 0.5 + hash(i)) % 1;
        if (t < 2 || k > 0.98) continue;
        circle(ctx, 400 + hash(i, 1) * 160 + Math.sin(s * 8 + i) * 8, 340 - s * 220, 4 + s * 6, alpha('#D5D8DE', 0.35 * (1 - s)));
      }
      if (k > 0.5)
        for (let i = 0; i < 26; i++) {
          const x = 410 + hash(i, 5) * 140;
          const y = 360 + (hash(i, 6) - 0.5) * 20;
          ctx.fillStyle = alpha('#FFFFFF', ease(t, 6 + hash(i) * 2, 8 + hash(i) * 2));
          ctx.fillRect(x - 4, y - 4, 8, 8);
        }
      tag(ctx, L('пар (вода)', 'steam (water)'), 600, 160, { color: C.sky });
      if (k > 0.7) tag(ctx, L('кристаллы NaCl', 'NaCl crystals'), 480, 300, { color: C.text });
      return;
    }
    if (mode === 'distill') {
      // flask
      const boil = ease(t, 0.5, 2);
      flame(ctx, 200, 470, 30, t, 1);
      circle(ctx, 200, 360, 80, alpha('#5B9CFF', 0.3), '#D5D8DE', 3);
      line(ctx, [[200, 280], [200, 200], [300, 200]], '#D5D8DE', 8);
      f.hit(info('Колба Вюрца', 'Distilling flask', 'В ней кипит смесь. Термометр у отвода показывает температуру пара.', 'The mixture boils here; a thermometer at the side arm shows the vapour temperature.'), 200, 360, 80);
      for (let i = 0; i < 14; i++) {
        const s = (t * 0.8 + hash(i)) % 1;
        circle(ctx, 150 + hash(i, 1) * 100, 420 - s * 80, 3 + s * 3, alpha('#FFFFFF', 0.5 * boil * (1 - s)));
      }
      // condenser
      ctx.save();
      ctx.translate(300, 200);
      ctx.rotate(0.35);
      rrect(ctx, 0, -26, 380, 52, 20);
      ctx.fillStyle = alpha('#3F6FE0', 0.25);
      ctx.fill();
      ctx.strokeStyle = '#D5D8DE';
      ctx.lineWidth = 2;
      ctx.stroke();
      line(ctx, [[0, 0], [380, 0]], '#D5D8DE', 6);
      // vapour then droplets travelling along
      for (let i = 0; i < 8; i++) {
        const s = (t * 0.25 + i / 8) % 1;
        if (t < 3) continue;
        circle(ctx, s * 380, 0, s < 0.5 ? 4 : 3, s < 0.5 ? alpha('#FFFFFF', 0.6) : '#8FC1FF');
      }
      ctx.restore();
      f.hit(info('Холодильник', 'Condenser', 'Снаружи течёт холодная вода (снизу вверх) — пар внутри охлаждается и превращается в жидкость.', 'Cold water flows round the outside (bottom to top), cooling the vapour back into liquid.'), 480, 265, 40);
      arrow(ctx, 640, 360, 640, 320, { color: C.blue, width: 2 });
      text(ctx, L('холодная вода', 'cold water'), 640, 380, { size: 11, color: C.blue });
      // receiver
      const fill = ease(t, 6, 12);
      for (let i = 0; i < 3; i++) {
        const s = (t * 1.3 + i / 3) % 1;
        if (t > 5) circle(ctx, 660, lerp(335, 440 - fill * 50, s), 4, '#8FC1FF');
      }
      beaker(ctx, 610, 380, 110, 110, 6 + fill * 60, alpha('#8FC1FF', 0.6));
      f.hitRect(info('Приёмник', 'Receiver', 'Сюда стекает дистиллят — чистая жидкость.', 'The distillate, a pure liquid, collects here.'), 610, 380, 110, 110);
      return;
    }
    // magnet
    const lift = ease(t, 2, 7);
    ctx.fillStyle = '#5C4A2E';
    ctx.beginPath();
    ctx.ellipse(480, 430, 220, 40, 0, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 160; i++) {
      const isFe = i % 2 === 0;
      const x0 = 300 + hash(i) * 360;
      const y0 = 420 + (hash(i, 1) - 0.5) * 50;
      if (!isFe) {
        circle(ctx, x0, y0, 3.5, '#F5C842');
        continue;
      }
      const tx2 = 440 + hash(i, 2) * 80;
      const ty2 = 240 + hash(i, 3) * 26;
      const k = ease(t, 2 + hash(i, 4) * 3, 3 + hash(i, 4) * 3);
      ctx.fillStyle = '#6B7080';
      ctx.fillRect(lerp(x0, tx2, k) - 3, lerp(y0, ty2, k) - 1.5, 6, 3);
    }
    f.hit(info('Сера', 'Sulfur', 'Жёлтый порошок, магнитом не притягивается.', 'A yellow powder that magnets ignore.'), 360, 430, 30);
    // horseshoe magnet
    const my = lerp(120, 170, lift);
    ctx.lineWidth = 34;
    ctx.strokeStyle = C.red;
    ctx.beginPath();
    ctx.arc(480, my, 50, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = C.red;
    ctx.fillRect(413, my, 34, 60);
    ctx.fillStyle = C.blue;
    ctx.fillRect(513, my, 34, 60);
    ctx.fillStyle = '#B5B8C0';
    ctx.fillRect(413, my + 60, 34, 14);
    ctx.fillRect(513, my + 60, 34, 14);
    f.hit(info('Магнит', 'Magnet', 'Притягивает железо — так отделяют металлолом и очищают руду.', 'Attracts iron; used to sort scrap metal and clean ore.'), 480, my + 30, 50);
  },
};

/* ---------- polymers ---------- */

export const polymerization: SimDef = {
  id: 'polymerization',
  title: tx('Полимеризация', 'Polymerisation'),
  modes: [
    { id: 'addition', label: tx('Полимеризация этилена', 'Ethene polymerisation') },
    { id: 'peptide', label: tx('Пептидная связь', 'Peptide bond') },
  ],
  duration: 14,
  loop: false,
  stages: (m) =>
    m === 'addition'
      ? [
          { t: 0, label: tx('Мономеры', 'Monomers'), text: tx('Молекулы этилена CH₂=CH₂ с двойной связью — мономеры.', 'Ethene molecules CH₂=CH₂ with a double bond are the monomers.') },
          { t: 2, label: tx('Раскрытие связи', 'Opening the bond'), text: tx('Инициатор раскрывает π-связь; каждая молекула присоединяется к растущей цепи.', 'An initiator opens the π bond and each molecule joins the growing chain.') },
          { t: 9, label: tx('Полиэтилен', 'Polyethylene'), text: tx('nCH₂=CH₂ → (–CH₂–CH₂–)ₙ. Повторяющийся кусочек — структурное звено, n — степень полимеризации (тысячи).', 'nCH₂=CH₂ → (–CH₂–CH₂–)ₙ. The repeating piece is the structural unit; n, the degree of polymerisation, runs into thousands.') },
        ]
      : [
          { t: 0, label: tx('Аминокислоты', 'Amino acids'), text: tx('У каждой аминокислоты есть аминогруппа –NH₂ и карбоксильная группа –COOH.', 'Each amino acid has an –NH₂ amino group and a –COOH carboxyl group.') },
          { t: 3, label: tx('Конденсация', 'Condensation'), text: tx('–COOH одной и –NH₂ другой соединяются, выделяя молекулу воды. Возникает пептидная связь –CO–NH–.', '–COOH of one and –NH₂ of the next join, giving off a water molecule. A peptide bond –CO–NH– forms.') },
          { t: 9, label: tx('Белок', 'Protein'), text: tx('Так в рибосомах собираются белки из 20 видов аминокислот. Последовательность — первичная структура белка.', 'Ribosomes build proteins from 20 kinds of amino acids this way. The sequence is the protein’s primary structure.') },
        ],
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'addition') {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const join = ease(t, 2 + i * 0.75, 2.6 + i * 0.75);
        const fx = 100 + hash(i) * 760;
        const fy = 90 + hash(i, 1) * 120 + (i % 2) * 260;
        const cx = 120 + i * 90;
        const cy = 300;
        const x = lerp(fx + wobble(i, t, 1) * 10, cx, join);
        const y = lerp(fy + wobble(i + 5, t, 1) * 10, cy, join);
        // two carbons with hydrogens
        const c1: [number, number] = [x - 18, y];
        const c2: [number, number] = [x + 18, y];
        if (join < 0.99) {
          line(ctx, [[c1[0], c1[1] - 3], [c2[0], c2[1] - 3]], '#C9CDD3', 3);
          line(ctx, [[c1[0], c1[1] + 3], [c2[0], c2[1] + 3]], alpha('#C9CDD3', 1 - join), 3);
        } else line(ctx, [c1, c2], '#C9CDD3', 3);
        for (const [cx2, sgn] of [[c1[0], -1], [c2[0], 1]] as const) {
          line(ctx, [[cx2, y], [cx2 + sgn * 8, y - 26]], '#C9CDD3', 2);
          line(ctx, [[cx2, y], [cx2 + sgn * 8, y + 26]], '#C9CDD3', 2);
          ball(ctx, cx2 + sgn * 8, y - 26, 6, '#F2F4F7');
          ball(ctx, cx2 + sgn * 8, y + 26, 6, '#F2F4F7');
        }
        ball(ctx, c1[0], c1[1], 10, '#737985');
        ball(ctx, c2[0], c2[1], 10, '#737985');
        if (i > 0 && join > 0.99) line(ctx, [[c1[0] - 36, cy], [c1[0] - 10, cy]], C.amber, 3);
        if (i === 0) f.hit(info('Этилен (мономер)', 'Ethene (monomer)', 'Двойная связь C=C раскрывается, и молекула присоединяется к цепи.', 'Its C=C double bond opens and the molecule joins the chain.'), x, y, 26);
      }
      if (t > 9) {
        tag(ctx, '(–CH₂–CH₂–)ₙ', 480, 420, { color: C.amber, size: 16 });
        ctx.strokeStyle = alpha(C.sky, 0.7);
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(192, 260, 92, 80);
        ctx.setLineDash([]);
        tag(ctx, L('структурное звено', 'repeat unit'), 238, 240, { color: C.sky });
      }
      return;
    }
    // peptide bond formation
    const n = 4;
    const COL = ['#F5A524', '#30A46C', '#8E4EC6', '#E5484D'];
    const names = ['Gly', 'Ala', 'Ser', 'Cys'];
    for (let i = 0; i < n; i++) {
      const join = i === 0 ? 1 : ease(t, 3 + (i - 1) * 2, 4 + (i - 1) * 2);
      const x = lerp(140 + i * 210, 220 + i * 170, join);
      const y = lerp(150 + (i % 2) * 220, 280, join);
      rrect(ctx, x - 50, y - 30, 100, 60, 14);
      ctx.fillStyle = alpha(COL[i], 0.25);
      ctx.fill();
      ctx.strokeStyle = COL[i];
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, names[i], x, y - 8, { size: 15, color: C.text, weight: 600 });
      text(ctx, i === 0 ? 'H₂N–…–COOH' : join > 0.99 ? '–NH–…–CO–' : 'H₂N–…–COOH', x, y + 12, { size: 10.5, color: C.dim, mono: true });
      f.hitRect(info(`Аминокислота ${names[i]}`, `Amino acid ${names[i]}`, 'Остаток аминокислоты в цепи. Боковые радикалы определяют свойства белка.', 'An amino-acid residue in the chain. Side groups decide the protein’s properties.'), x - 50, y - 30, 100, 60);
      if (i > 0) {
        if (join > 0.99) {
          line(ctx, [[x - 120, 280], [x - 50, 280]], C.amber, 4);
          tag(ctx, '–CO–NH–', x - 85, 250, { color: C.amber, size: 11 });
        }
        // water molecule leaves
        const wk = ease(t, 3.8 + (i - 1) * 2, 6 + (i - 1) * 2);
        if (wk > 0 && wk < 1) {
          const wx = x - 85;
          const wy = 280 + wk * 180;
          ball(ctx, wx, wy, 9, '#E5484D');
          ball(ctx, wx - 11, wy + 7, 6, '#F2F4F7');
          ball(ctx, wx + 11, wy + 7, 6, '#F2F4F7');
          tag(ctx, 'H₂O', wx + 40, wy, { color: C.sky, size: 11 });
        }
      }
    }
    f.hit(info('Пептидная связь', 'Peptide bond', 'Связь –CO–NH– между остатками аминокислот. При её образовании выделяется вода, при гидролизе — расходуется.', 'The –CO–NH– link between amino-acid residues. Forming it releases water; hydrolysis uses water up.'), 305, 280, 20);
  },
};

/* ---------- blast furnace ---------- */

export const blastFurnace: SimDef = {
  id: 'blast_furnace',
  title: tx('Доменная печь', 'Blast furnace'),
  duration: 14,
  stages: [
    { t: 0, label: tx('Загрузка', 'Charging'), text: tx('Сверху загружают шихту: железную руду (Fe₂O₃), кокс (C) и флюс (известняк).', 'The charge goes in at the top: iron ore (Fe₂O₃), coke (C) and flux (limestone).') },
    { t: 3, label: tx('Дутьё', 'Hot blast'), text: tx('Снизу подают горячий воздух. Кокс сгорает: C + O₂ → CO₂, затем CO₂ + C → 2CO. Температура до 2000 °C.', 'Hot air is blown in at the bottom. Coke burns: C + O₂ → CO₂, then CO₂ + C → 2CO. Up to 2000 °C.') },
    { t: 7, label: tx('Восстановление', 'Reduction'), text: tx('Угарный газ поднимается и восстанавливает железо: Fe₂O₃ + 3CO → 2Fe + 3CO₂. CO — восстановитель.', 'Carbon monoxide rises and reduces the iron: Fe₂O₃ + 3CO → 2Fe + 3CO₂. CO is the reducing agent.') },
    { t: 11, label: tx('Чугун и шлак', 'Pig iron and slag'), text: tx('Внизу скапливается жидкий чугун (Fe + 2–4% C), сверху — лёгкий шлак. Из чугуна, выжигая лишний углерод, получают сталь.', 'Liquid pig iron (Fe + 2–4% C) collects at the bottom with light slag on top. Burning off excess carbon turns pig iron into steel.') },
  ],
  draw(f) {
    const { ctx, w, h, t, L } = f;
    backdrop(ctx, w, h);
    const cx = 380;
    const shape: [number, number][] = [[cx - 70, 40], [cx + 70, 40], [cx + 150, 300], [cx + 120, 420], [cx + 120, 500], [cx - 120, 500], [cx - 120, 420], [cx - 150, 300]];
    ctx.beginPath();
    shape.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 40, 0, 500);
    g.addColorStop(0, '#2A2D33');
    g.addColorStop(0.6, '#5A2A18');
    g.addColorStop(1, '#C2410C');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#8C8F98';
    ctx.lineWidth = 5;
    ctx.stroke();
    // descending charge
    for (let i = 0; i < 60; i++) {
      const s = (t * 0.06 + hash(i)) % 1;
      const y = 60 + s * 300;
      const half = 70 + (y - 40) * 0.3;
      const x = cx + (hash(i, 1) - 0.5) * 1.6 * half;
      const kind = i % 3;
      if (kind === 0) circle(ctx, x, y, 6, '#8B3A2A');
      else if (kind === 1) circle(ctx, x, y, 6, '#1E2024', '#4A4D55', 1);
      else circle(ctx, x, y, 5, '#D5D8DE');
    }
    // rising CO
    for (let i = 0; i < 40; i++) {
      const s = (t * 0.2 + hash(i, 5)) % 1;
      const y = 420 - s * 360;
      const x = cx + (hash(i, 6) - 0.5) * 160 + Math.sin(s * 10 + i) * 10;
      circle(ctx, x, y, 3.5, alpha(s < 0.5 ? '#9BE7FF' : '#B5B8C0', 0.7));
    }
    // molten iron and slag
    const fill = ease(t, 6, 13);
    ctx.fillStyle = '#FF7A1A';
    ctx.fillRect(cx - 117, 500 - 40 * fill, 234, 40 * fill);
    ctx.fillStyle = '#C9A86A';
    ctx.fillRect(cx - 117, 500 - 40 * fill - 14 * fill, 234, 14 * fill);
    // tuyeres (hot blast)
    [cx - 150, cx + 150].forEach((x, k) => {
      const d = k ? -1 : 1;
      arrow(ctx, x - d * 60, 420, x - d * 4, 420, { color: C.orange, width: 4 });
    });
    tag(ctx, L('горячий воздух', 'hot air'), cx - 230, 395, { color: C.orange });
    tag(ctx, L('шихта: руда, кокс, флюс', 'charge: ore, coke, flux'), cx, 20, { color: C.text });
    tag(ctx, L('чугун', 'pig iron'), cx + 190, 488, { color: '#FF7A1A' });
    tag(ctx, L('шлак', 'slag'), cx + 180, 455, { color: '#C9A86A' });
    f.hit(info('Руда Fe₂O₃', 'Ore Fe₂O₃', 'Красный железняк — оксид железа(III).', 'Haematite, iron(III) oxide.'), cx, 100, 40);
    f.hit(info('Угарный газ CO', 'Carbon monoxide CO', 'Главный восстановитель в домне: отнимает кислород у оксидов железа.', 'The furnace’s main reducing agent: it strips oxygen from iron oxides.'), cx, 300, 50);
    f.hitRect(info('Жидкий чугун', 'Molten pig iron', 'Сплав железа с 2–4% углерода. Твёрдый и хрупкий; для стали углерод выжигают.', 'Iron with 2–4% carbon. Hard and brittle; for steel the carbon is burned off.'), cx - 117, 460, 234, 40);
    // reactions panel
    const rx = [
      { y: 120, s: 'C + O₂ → CO₂', at: 3 },
      { y: 170, s: 'CO₂ + C → 2CO', at: 4 },
      { y: 220, s: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂', at: 7 },
      { y: 270, s: 'CaCO₃ → CaO + CO₂', at: 9 },
      { y: 320, s: 'CaO + SiO₂ → CaSiO₃ (' + L('шлак', 'slag') + ')', at: 10 },
    ];
    rx.forEach((r) => {
      ctx.globalAlpha = ease(t, r.at, r.at + 0.8);
      tag(ctx, r.s, 600, r.y, { color: C.amber, align: 'left', size: 13 });
      ctx.globalAlpha = 1;
    });
  },
};

/* ---------- amount of substance and concentration ---------- */

export const stoichiometry: SimDef = {
  id: 'stoichiometry',
  title: tx('Моль и концентрация', 'Moles and concentration'),
  modes: [
    { id: 'mole', label: tx('Один моль', 'One mole') },
    { id: 'conc', label: tx('Концентрация', 'Concentration') },
  ],
  duration: 10,
  loop: false,
  params: (m) =>
    m === 'conc'
      ? [
          { id: 'm', label: tx('Масса соли', 'Mass of salt'), min: 5, max: 60, step: 5, value: 20, unit: 'г' },
          { id: 'V', label: tx('Масса воды', 'Mass of water'), min: 50, max: 300, step: 25, value: 180, unit: 'г' },
        ]
      : [],
  stages: (m) =>
    m === 'mole'
      ? [
          { t: 0, label: tx('Счёт частиц', 'Counting particles'), text: tx('Атомы слишком малы, чтобы считать их поштучно. Химики считают «пачками» — молями.', 'Atoms are too small to count one by one, so chemists count in batches called moles.') },
          { t: 3, label: tx('Число Авогадро', 'Avogadro’s number'), text: tx('1 моль = 6,02·10²³ частиц. Масса моля в граммах равна относительной молекулярной массе: M(H₂O) = 18 г/моль.', '1 mole = 6.02·10²³ particles. A mole’s mass in grams equals the relative molecular mass: M(H₂O) = 18 g/mol.') },
          { t: 6, label: tx('Молярный объём', 'Molar volume'), text: tx('Любой газ при н.у. (0 °C, 1 атм): 1 моль занимает 22,4 л. n = m / M = V / Vm = N / Nₐ.', 'Any gas at STP (0 °C, 1 atm): 1 mole fills 22.4 L. n = m / M = V / Vm = N / Nₐ.') },
        ]
      : [
          { t: 0, label: tx('Раствор', 'Solution'), text: tx('Растворяем соль в воде.', 'We dissolve salt in water.') },
          { t: 3, label: tx('Массовая доля', 'Mass fraction'), text: tx('ω = m(вещества) / m(раствора) · 100%. Измени массы и посмотри на цвет и число частиц.', 'ω = m(solute) / m(solution) × 100%. Change the masses and watch the colour and particle count.') },
        ],
  metrics: ({ p, mode }) =>
    mode === 'conc'
      ? [
          { label: tx('Массовая доля ω', 'Mass fraction ω'), value: `${((p.m / (p.m + p.V)) * 100).toFixed(1)} %`, tone: 'good' },
          { label: tx('Количество соли', 'Amount of salt'), value: `${(p.m / 58.5).toFixed(2)} моль` },
        ]
      : [],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'mole') {
      const items = [
        { x: 170, label: L('вода H₂O', 'water H₂O'), mass: '18 г', vol: '18 мл', c: '#5B9CFF', kind: 'liquid' },
        { x: 400, label: L('соль NaCl', 'salt NaCl'), mass: '58,5 г', vol: L('≈ 2 ст. ложки', '≈ 2 tbsp'), c: '#F2F4F7', kind: 'solid' },
        { x: 630, label: L('железо Fe', 'iron Fe'), mass: '56 г', vol: '7,1 см³', c: '#8C93A0', kind: 'solid' },
        { x: 850, label: L('газ (любой)', 'any gas'), mass: L('—', '—'), vol: '22,4 л', c: '#9BE7FF', kind: 'gas' },
      ];
      items.forEach((it, i) => {
        const show = ease(t, i * 0.6, i * 0.6 + 1);
        ctx.globalAlpha = show;
        if (it.kind === 'liquid') beaker(ctx, it.x - 50, 240, 100, 140, 40, alpha(it.c, 0.6));
        else if (it.kind === 'solid') {
          ctx.fillStyle = it.c;
          ctx.beginPath();
          ctx.ellipse(it.x, 370, 50, 14, 0, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(it.x - 45, 370);
          ctx.quadraticCurveTo(it.x, 300, it.x + 45, 370);
          ctx.fill();
        } else {
          const size = 120 * ease(t, 6, 7.5);
          ctx.strokeStyle = alpha(it.c, 0.8);
          ctx.lineWidth = 2;
          ctx.strokeRect(it.x - size / 2, 380 - size, size, size);
          for (let k = 0; k < 20; k++) circle(ctx, it.x - size / 2 + hash(k, i) * size, 380 - hash(k, i + 1) * size, 2.5, alpha(it.c, 0.8));
        }
        text(ctx, it.label, it.x, 420, { size: 13 });
        if (t > 3) tag(ctx, it.mass, it.x, 450, { color: C.amber, size: 12 });
        if (t > 6) tag(ctx, it.vol, it.x, 485, { color: C.sky, size: 12 });
        ctx.globalAlpha = 1;
        f.hit(info(it.label, it.label, `В каждой порции — одинаковое число частиц: 6,02·10²³.`, `Each portion holds the same number of particles: 6.02·10²³.`), it.x, 340, 50);
      });
      if (t > 3) tag(ctx, 'Nₐ = 6,02·10²³ ' + L('частиц в каждой порции', 'particles in each portion'), 480, 140, { color: C.green, size: 15 });
      return;
    }
    const frac = p.m / (p.m + p.V);
    const level = 120 + (p.V / 300) * 230;
    beaker(ctx, 300, 80, 360, 420, level, alpha(mixColor('#2F6FB5', '#8FA4FF', frac * 3), 0.25 + frac * 1.5));
    const n = Math.round(p.m * 2 * ease(t, 0, 3));
    for (let i = 0; i < n; i++) {
      const x = 320 + hash(i) * 320 + wobble(i, t, 1) * 6;
      const y = 500 - level + 20 + hash(i, 1) * (level - 40) + wobble(i + 3, t, 1) * 6;
      ionBall(ctx, x, y, i % 2 ? 7 : 9, i % 2 ? '#AB6CF0' : '#3CC46A', '');
    }
    f.hitRect(info('Раствор', 'Solution', 'Растворитель (вода) + растворённое вещество (соль). m(раствора) = m(соли) + m(воды).', 'Solvent (water) + solute (salt). m(solution) = m(salt) + m(water).'), 300, 500 - level, 360, level);
    tag(ctx, `ω = ${p.m} / (${p.m} + ${p.V}) = ${(frac * 100).toFixed(1)}%`, 480, 50, { color: C.green, size: 14 });
  },
};
