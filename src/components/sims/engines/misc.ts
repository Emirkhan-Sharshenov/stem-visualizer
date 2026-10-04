import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, tag, TAU, text, tx, wobble } from '../kit';

/* ================= everyday physics: measuring, humidity, fuses ================= */

export const everyday: SimDef = {
  id: 'everyday',
  title: tx('Физика вокруг нас', 'Everyday physics'),
  modes: [
    { id: 'measure', label: tx('Измерения', 'Measuring') },
    { id: 'humidity', label: tx('Влажность', 'Humidity') },
    { id: 'fuse', label: tx('Предохранитель', 'Fuse') },
  ],
  duration: 12,
  loop: false,
  params: (m) =>
    m === 'measure'
      ? [{ id: 'div', label: tx('Цена деления мензурки', 'Cylinder scale division'), min: 1, max: 10, step: 1, value: 5, unit: 'мл' }]
      : m === 'humidity'
        ? [{ id: 'rh', label: tx('Относительная влажность', 'Relative humidity'), min: 20, max: 100, step: 5, value: 60, unit: '%' }]
        : [{ id: 'load', label: tx('Число включённых приборов', 'Appliances switched on'), min: 1, max: 6, step: 1, value: 3 }],
  stages: (m) =>
    m === 'measure'
      ? [
          { t: 0, label: tx('Цена деления', 'Scale division'), text: tx('Цена деления = (разность двух ближайших чисел шкалы) / (число делений между ними).', 'Scale division = (difference between two nearby numbers) / (number of divisions between them).') },
          { t: 4, label: tx('Отсчёт', 'Reading'), text: tx('Глаз — на уровне нижнего края мениска. Иначе ошибка параллакса.', 'Keep your eye level with the bottom of the meniscus, or you get a parallax error.') },
          { t: 8, label: tx('Погрешность', 'Uncertainty'), text: tx('Погрешность ≈ половина цены деления: результат записывают как V = (V₀ ± ΔV). Чем мельче деления, тем точнее.', 'The uncertainty is about half a division: write V = (V₀ ± ΔV). Finer divisions mean more precision.') },
        ]
      : m === 'humidity'
        ? [
            { t: 0, label: tx('Пар в воздухе', 'Vapour in air'), text: tx('В воздухе всегда есть водяной пар. Относительная влажность φ — насколько пар близок к насыщению.', 'Air always holds water vapour. Relative humidity φ tells how close it is to saturation.') },
            { t: 4, label: tx('Охлаждение', 'Cooling'), text: tx('При охлаждении воздух становится насыщенным — точка росы. Ниже неё пар конденсируется: роса, туман, запотевшее стекло.', 'As air cools it reaches saturation, the dew point. Below that vapour condenses into dew, fog or a misted glass.') },
            { t: 8, label: tx('Психрометр', 'Psychrometer'), text: tx('Влажный термометр охлаждается испарением. Чем суше воздух, тем больше разница показаний двух термометров.', 'The wet bulb cools by evaporation. The drier the air, the bigger the gap between the two thermometers.') },
          ]
        : [
            { t: 0, label: tx('Нагрузка', 'Load'), text: tx('Приборы в квартире включены параллельно: их токи складываются.', 'Household appliances are wired in parallel, so their currents add up.') },
            { t: 4, label: tx('Перегрузка', 'Overload'), text: tx('Слишком большой ток сильно нагревает провода (Q = I²Rt) — опасность пожара.', 'Too much current heats the wires strongly (Q = I²Rt), risking fire.') },
            { t: 7, label: tx('Предохранитель', 'Fuse'), text: tx('Тонкая проволочка предохранителя (или автомат) плавится первой и размыкает цепь. При коротком замыкании ток огромный — защита срабатывает мгновенно.', 'The thin fuse wire (or circuit breaker) melts first and breaks the circuit. A short circuit draws a huge current, so protection trips instantly.') },
          ],
  metrics: ({ p, mode }) => {
    if (mode === 'measure') return [{ label: tx('Результат', 'Result'), value: `${Math.round(37 / p.div) * p.div} ± ${p.div / 2} мл` }];
    if (mode === 'humidity') {
      const T = 22;
      const dew = dewPoint(T, p.rh);
      return [
        { label: tx('Точка росы', 'Dew point'), value: `${dew.toFixed(1)} °C` },
        { label: tx('Влажный термометр', 'Wet bulb'), value: `${(T - (100 - p.rh) * 0.12).toFixed(1)} °C` },
      ];
    }
    const I = p.load * 4.5;
    return [
      { label: tx('Общий ток', 'Total current'), value: `${I.toFixed(1)} А`, tone: I > 16 ? 'bad' : 'good' },
      { label: tx('Предохранитель', 'Fuse rating'), value: '16 А' },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'measure') {
      const x0 = 380;
      const top = 70;
      const bottom = 480;
      const ml = (v: number) => bottom - (v / 100) * (bottom - top - 20);
      rrect(ctx, x0, top, 120, bottom - top + 10, 14);
      ctx.strokeStyle = alpha('#D5D8DE', 0.8);
      ctx.lineWidth = 3;
      ctx.stroke();
      const fill = 37 * ease(t, 0, 2);
      ctx.fillStyle = alpha('#5B9CFF', 0.4);
      ctx.fillRect(x0 + 3, ml(fill), 114, bottom - ml(fill) + 6);
      // meniscus
      ctx.strokeStyle = '#8FC1FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + 3, ml(fill) - 6);
      ctx.quadraticCurveTo(x0 + 60, ml(fill) + 6, x0 + 117, ml(fill) - 6);
      ctx.stroke();
      for (let v = 0; v <= 100; v += p.div) {
        const y = ml(v);
        const major = v % 10 === 0;
        line(ctx, [[x0 + 120, y], [x0 + (major ? 96 : 106), y]], '#D5D8DE', major ? 1.6 : 1);
        if (major) text(ctx, String(v), x0 + 138, y, { size: 11, color: C.dim, align: 'left' });
      }
      f.hitRect(info('Мензурка', 'Measuring cylinder', `Цена деления ${p.div} мл: между «0» и «10» — ${10 / p.div} делений.`, `Each division is ${p.div} ml: ${10 / p.div} divisions between “0” and “10”.`), x0, top, 120, bottom - top);
      // eye positions
      const eyeY = ml(fill) + 2;
      const eyes = [
        { y: eyeY - 80, ok: false },
        { y: eyeY, ok: true },
        { y: eyeY + 80, ok: false },
      ];
      eyes.forEach((e, i) => {
        if (t < 4 + i * 0.5) return;
        ctx.fillStyle = e.ok ? C.green : C.red;
        ctx.beginPath();
        ctx.ellipse(220, e.y, 18, 10, 0, 0, TAU);
        ctx.fill();
        circle(ctx, 224, e.y, 5, '#111214');
        line(ctx, [[240, e.y], [x0 + 60, ml(fill)]], alpha(e.ok ? C.green : C.red, 0.7), 1.5, [5, 4]);
        tag(ctx, e.ok ? L('верно', 'correct') : L('ошибка', 'error'), 150, e.y, { color: e.ok ? C.green : C.red, size: 11 });
      });
      if (t > 8) tag(ctx, `V = ${Math.round(37 / p.div) * p.div} ± ${p.div / 2} ${L('мл', 'ml')}`, 720, 260, { color: C.amber, size: 16 });
      return;
    }
    if (mode === 'humidity') {
      const T = 22;
      const dew = dewPoint(T, p.rh);
      // a glass cooling down
      const cool = lerp(T, 2, ease(t, 3, 9));
      const fog = clamp((dew - cool) / 4);
      rrect(ctx, 200, 150, 160, 260, 14);
      ctx.fillStyle = alpha('#9BD0F5', 0.15);
      ctx.fill();
      ctx.strokeStyle = alpha('#D5D8DE', 0.8);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = alpha('#5B9CFF', 0.35 + 0.3 * ease(t, 3, 9));
      ctx.fillRect(203, 220, 154, 187);
      for (let i = 0; i < 6 * ease(t, 3, 5); i++) {
        rrect(ctx, 220 + hash(i) * 110, 230 + hash(i, 1) * 140, 24, 24, 4);
        ctx.fillStyle = alpha('#E8F4FF', 0.7);
        ctx.fill();
      }
      for (let i = 0; i < Math.round(fog * 50); i++) circle(ctx, 200 + hash(i, 2) * 160, 160 + hash(i, 3) * 240, 2 + hash(i, 4) * 2.5, alpha('#BFE0FF', 0.85));
      f.hitRect(info('Стакан со льдом', 'Glass of ice water', 'Стенка охлаждает соседний воздух. Ниже точки росы на ней оседают капли.', 'The wall chills the air next to it; below the dew point, droplets form.'), 200, 150, 160, 260);
      tag(ctx, `${L('стенка', 'wall')}: ${cool.toFixed(1)} °C`, 280, 120, { color: cool < dew ? C.cyan : C.text });
      // vapour molecules in room air
      for (let i = 0; i < Math.round(p.rh * 0.8); i++) circle(ctx, 430 + hash(i, 5) * 180 + wobble(i, t, 1) * 8, 120 + hash(i, 6) * 300 + wobble(i + 2, t, 1) * 8, 3, alpha('#8FC1FF', 0.7));
      tag(ctx, `φ = ${p.rh}%`, 520, 90, { color: C.sky });
      // psychrometer
      const wet = T - (100 - p.rh) * 0.12;
      [
        { x: 720, v: T, n: L('сухой', 'dry') },
        { x: 820, v: wet, n: L('влажный', 'wet') },
      ].forEach((th, i) => {
        rrect(ctx, th.x - 7, 120, 14, 300, 7);
        ctx.fillStyle = '#2A2D33';
        ctx.fill();
        const lvl = (th.v / 40) * 280;
        rrect(ctx, th.x - 3, 420 - lvl, 6, lvl, 3);
        ctx.fillStyle = C.red;
        ctx.fill();
        circle(ctx, th.x, 426, 12, C.red);
        if (i === 1) for (let k = 0; k < 5; k++) line(ctx, [[th.x - 10 + k * 5, 430], [th.x - 10 + k * 5, 470]], alpha('#E8E4D8', 0.8), 2);
        text(ctx, `${th.v.toFixed(1)}°`, th.x, 100, { size: 13, mono: true });
        text(ctx, th.n, th.x, 490, { size: 12, color: C.dim });
      });
      f.hitRect(info('Психрометр', 'Psychrometer', 'Два термометра: у влажного шарик обёрнут мокрой тканью. По разнице показаний и таблице находят влажность.', 'Two thermometers, one with a wet wick. The difference plus a table gives the humidity.'), 700, 110, 140, 380);
      return;
    }
    // fuse
    const I = p.load * 4.5;
    const over = I > 16;
    const blow = over ? ease(t, 5, 7) : 0;
    const on = blow < 1;
    // panel & wires
    line(ctx, [[80, 120], [880, 120]], on ? mixColor('#B5B8C0', '#F76B15', clamp((I - 10) / 15) * ease(t, 2, 5)) : '#4A4D55', 6);
    line(ctx, [[80, 420], [880, 420]], '#4A4D55', 6);
    line(ctx, [[80, 120], [80, 420]], '#4A4D55', 6);
    rrect(ctx, 60, 230, 40, 80, 6);
    ctx.fillStyle = '#2A2D33';
    ctx.fill();
    text(ctx, '220 В', 80, 330, { size: 11, color: C.dim });
    // fuse element
    rrect(ctx, 140, 100, 90, 40, 8);
    ctx.fillStyle = '#E8E4D8';
    ctx.fill();
    if (blow < 0.5) line(ctx, [[150, 120], [220, 120]], mixColor('#8C8F98', '#FFD60A', blow * 2 + (over ? ease(t, 3, 5) * 0.5 : 0)), 2);
    else {
      line(ctx, [[150, 120], [175, 118]], '#8C8F98', 2);
      line(ctx, [[196, 122], [220, 120]], '#8C8F98', 2);
      if (blow < 0.9) for (let k = 0; k < 6; k++) circle(ctx, 185 + (hash(k, Math.floor(t * 20)) - 0.5) * 30, 120 + (hash(k + 3, Math.floor(t * 20)) - 0.5) * 30, 2, C.yellow);
    }
    f.hitRect(info('Предохранитель', 'Fuse', 'Рассчитан на 16 А. При большем токе проволочка плавится и цепь размыкается.', 'Rated 16 A. Above that the wire melts and the circuit opens.'), 140, 100, 90, 40);
    const names = [L('чайник', 'kettle'), L('утюг', 'iron'), L('обогреватель', 'heater'), L('микроволновка', 'microwave'), L('пылесос', 'vacuum'), L('фен', 'hair dryer')];
    for (let i = 0; i < 6; i++) {
      const x = 300 + i * 100;
      const active = i < p.load;
      line(ctx, [[x, 120], [x, 230]], active ? '#B5B8C0' : '#3A3D45', 3);
      line(ctx, [[x, 330], [x, 420]], active ? '#B5B8C0' : '#3A3D45', 3);
      rrect(ctx, x - 40, 230, 80, 100, 10);
      ctx.fillStyle = active && on ? alpha(C.amber, 0.25) : C.panel;
      ctx.fill();
      ctx.strokeStyle = active && on ? C.amber : C.line;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, names[i], x, 280, { size: 11.5, color: active ? C.text : C.faint });
      if (active && on) for (let k = 0; k < 3; k++) circle(ctx, x, lerp(130, 225, ((t * 0.8 + k / 3) % 1)), 3, C.cyan);
    }
    if (over && t > 3 && t < 5.5) tag(ctx, L('провода перегреваются!', 'wires overheating!'), 500, 70, { color: C.red, size: 13 });
    if (blow >= 1) tag(ctx, L('цепь разомкнута — пожара не будет', 'circuit open: no fire'), 500, 70, { color: C.green, size: 13 });
    tag(ctx, `I = ${p.load} × 4,5 = ${I.toFixed(1)} ${L('А', 'A')}`, 500, 480, { color: over ? C.red : C.green, size: 14 });
  },
};

function dewPoint(T: number, rh: number) {
  const a = 17.27;
  const b = 237.7;
  const g = (a * T) / (b + T) + Math.log(rh / 100);
  return (b * g) / (a - g);
}

/* ================= chemistry: genetic links and qualitative tests ================= */

const CHAINS = {
  metal: [
    { f: 'Ca', n: tx('металл', 'metal'), c: '#B7BCC6' },
    { f: 'CaO', n: tx('основный оксид', 'basic oxide'), c: '#E8C77A' },
    { f: 'Ca(OH)₂', n: tx('основание', 'base'), c: '#5B8CFF' },
    { f: 'CaCO₃', n: tx('соль', 'salt'), c: '#F2F4F7' },
  ],
  nonmetal: [
    { f: 'S', n: tx('неметалл', 'non-metal'), c: '#F5C842' },
    { f: 'SO₂', n: tx('кислотный оксид', 'acidic oxide'), c: '#B5B8C0' },
    { f: 'H₂SO₃', n: tx('кислота', 'acid'), c: '#E5484D' },
    { f: 'Na₂SO₃', n: tx('соль', 'salt'), c: '#F2F4F7' },
  ],
  organic: [
    { f: 'CH₄', n: tx('алкан', 'alkane'), c: '#737985' },
    { f: 'C₂H₂', n: tx('алкин', 'alkyne'), c: '#8FA4FF' },
    { f: 'CH₃CHO', n: tx('альдегид', 'aldehyde'), c: '#F5A524' },
    { f: 'CH₃COOH', n: tx('кислота', 'acid'), c: '#E5484D' },
    { f: 'CH₃COOC₂H₅', n: tx('сложный эфир', 'ester'), c: '#30A46C' },
  ],
};
const STEPS = {
  metal: ['2Ca + O₂ → 2CaO', 'CaO + H₂O → Ca(OH)₂', 'Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O'],
  nonmetal: ['S + O₂ → SO₂', 'SO₂ + H₂O ⇌ H₂SO₃', 'H₂SO₃ + 2NaOH → Na₂SO₃ + 2H₂O'],
  organic: ['2CH₄ →(1500 °C) C₂H₂ + 3H₂', 'C₂H₂ + H₂O →(Hg²⁺) CH₃CHO', '2CH₃CHO + O₂ → 2CH₃COOH', 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O'],
};

const TESTS = [
  { ion: 'Cl⁻', reagent: 'Ag⁺ (AgNO₃)', result: tx('белый творожистый осадок AgCl', 'white curdy AgCl precipitate'), color: '#F2F4F7', kind: 'ppt' },
  { ion: 'SO₄²⁻', reagent: 'Ba²⁺ (BaCl₂)', result: tx('белый осадок BaSO₄', 'white BaSO₄ precipitate'), color: '#FFFFFF', kind: 'ppt' },
  { ion: 'CO₃²⁻', reagent: 'H⁺ (HCl)', result: tx('«вскипание» — пузырьки CO₂', 'fizzing: CO₂ bubbles'), color: '#D5D8DE', kind: 'gas' },
  { ion: 'Fe³⁺', reagent: 'OH⁻ (NaOH)', result: tx('бурый осадок Fe(OH)₃', 'rust-brown Fe(OH)₃ precipitate'), color: '#A0522D', kind: 'ppt' },
  { ion: 'Cu²⁺', reagent: 'OH⁻ (NaOH)', result: tx('голубой осадок Cu(OH)₂', 'blue Cu(OH)₂ precipitate'), color: '#4FA3E0', kind: 'ppt' },
  { ion: 'NH₄⁺', reagent: 'OH⁻ + нагрев', result: tx('запах аммиака, влажная лакмусовая бумажка синеет', 'ammonia smell; damp litmus turns blue'), color: '#D5D8DE', kind: 'gas' },
];

export const chemLinks: SimDef = {
  id: 'chem_links',
  title: tx('Связи между классами веществ', 'Links between classes'),
  modes: [
    { id: 'metal', label: tx('Металл → соль', 'Metal → salt') },
    { id: 'nonmetal', label: tx('Неметалл → соль', 'Non-metal → salt') },
    { id: 'organic', label: tx('Органическая цепочка', 'Organic chain') },
    { id: 'tests', label: tx('Качественные реакции', 'Ion tests') },
  ],
  duration: (m) => (m === 'tests' ? 14 : m === 'organic' ? 13 : 10),
  loop: false,
  stages: (m) =>
    m === 'tests'
      ? [
          { t: 0, label: tx('Распознавание ионов', 'Identifying ions'), text: tx('Качественная реакция даёт заметный признак: осадок, газ, цвет или запах.', 'A qualitative test gives a visible sign: a precipitate, gas, colour or smell.') },
          { t: 4, label: tx('Добавляем реактив', 'Adding the reagent'), text: tx('В каждую пробирку капают реактив на определяемый ион.', 'Each tube gets the reagent for the ion being tested.') },
          { t: 9, label: tx('Признаки', 'Signs'), text: tx('Нажми на пробирку, чтобы прочитать уравнение реакции.', 'Tap a tube to read its reaction equation.') },
        ]
      : [
          { t: 0, label: tx('Генетическая связь', 'Genetic link'), text: tx('Вещества разных классов можно превращать друг в друга — так видно их родство.', 'Substances of different classes can be turned into one another, showing how they’re related.') },
          { t: 2, label: tx('Превращения', 'Conversions'), text: tx('Каждая стрелка — реакция. Наблюдай за уравнениями.', 'Each arrow is a reaction. Watch the equations.') },
        ],
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode !== 'tests') {
      const chain = CHAINS[mode as keyof typeof CHAINS];
      const steps = STEPS[mode as keyof typeof STEPS];
      const n = chain.length;
      const gap = (w - 120) / (n - 1);
      chain.forEach((s, i) => {
        const x = 60 + i * gap;
        const y = 200;
        const show = ease(t, i * 2.2, i * 2.2 + 1);
        ctx.globalAlpha = 0.25 + 0.75 * show;
        rrect(ctx, x - 70, y - 50, 140, 100, 16);
        ctx.fillStyle = alpha(s.c, 0.18);
        ctx.fill();
        ctx.strokeStyle = s.c;
        ctx.lineWidth = 2;
        ctx.stroke();
        text(ctx, s.f, x, y - 10, { size: 18, weight: 700, mono: true });
        text(ctx, s.n[f.lang], x, y + 22, { size: 12, color: C.dim });
        ctx.globalAlpha = 1;
        f.hitRect(info(s.f, s.f, s.n.ru, s.n.en), x - 70, y - 50, 140, 100);
        if (i < n - 1) {
          const k = ease(t, i * 2.2 + 1, i * 2.2 + 2);
          if (k > 0) {
            arrow(ctx, x + 72, y, x + 72 + (gap - 144) * k, y, { color: C.amber, width: 2.5 });
            ctx.globalAlpha = k;
            tag(ctx, steps[i], x + gap / 2, 330 + (i % 2) * 50, { color: C.amber, size: 12.5 });
            line(ctx, [[x + gap / 2, y + 8], [x + gap / 2, 318 + (i % 2) * 50]], alpha(C.amber, 0.4), 1, [3, 3]);
            ctx.globalAlpha = 1;
          }
        }
      });
      if (mode !== 'organic' && t > 7) tag(ctx, L('металл → основный оксид → основание → соль ← кислота ← кислотный оксид ← неметалл', 'metal → basic oxide → base → salt ← acid ← acidic oxide ← non-metal'), 480, 470, { color: C.sky, size: 12 });
      return;
    }
    TESTS.forEach((ts, i) => {
      const x = 110 + i * 150;
      const y = 150;
      const drop = ease(t, 4 + i * 0.6, 4.6 + i * 0.6);
      const result = ease(t, 4.8 + i * 0.6, 6.5 + i * 0.6);
      rrect(ctx, x - 26, y, 52, 250, 24);
      ctx.fillStyle = alpha('#5B9CFF', 0.12);
      ctx.fill();
      ctx.strokeStyle = alpha('#D5D8DE', 0.8);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = alpha(i === 4 ? '#4FA3E0' : i === 3 ? '#E8A33A' : '#5B9CFF', 0.25);
      rrect(ctx, x - 23, y + 110, 46, 137, 22);
      ctx.fill();
      // pipette drop
      if (drop > 0 && drop < 1) circle(ctx, x, lerp(y - 40, y + 110, drop), 5, alpha('#D5D8DE', 0.9));
      if (result > 0) {
        if (ts.kind === 'ppt') {
          for (let k = 0; k < 30; k++) {
            const fall = clamp(result * 1.4 - hash(k, i) * 0.4);
            circle(ctx, x - 18 + hash(k, i + 1) * 36, lerp(y + 120, y + 236 - hash(k, i + 2) * 22, fall), 3, alpha(ts.color, 0.95));
          }
        } else
          for (let k = 0; k < 10; k++) {
            const s = ((t - 5) * 0.6 + k / 10) % 1;
            circle(ctx, x - 14 + hash(k, i) * 28, lerp(y + 240, y + 110, s), 3 + s * 2, undefined, alpha('#FFFFFF', 0.8 * (1 - s)), 1.5);
          }
      }
      text(ctx, ts.ion, x, y - 20, { size: 16, weight: 700 });
      text(ctx, ts.reagent, x, y + 275, { size: 11, color: C.dim });
      f.hitRect(info(`${ts.ion} + ${ts.reagent}`, `${ts.ion} + ${ts.reagent}`, ts.result.ru, ts.result.en), x - 26, y, 52, 250);
      if (t > 9) {
        ctx.save();
        ctx.translate(x, y + 320);
        text(ctx, ts.result[f.lang].split(' ').slice(0, 2).join(' '), 0, 0, { size: 10.5, color: C.amber });
        ctx.restore();
      }
    });
  },
};

/* ================= greenhouse effect ================= */

export const greenhouse: SimDef = {
  id: 'greenhouse',
  title: tx('Парниковый эффект', 'Greenhouse effect'),
  duration: 16,
  loop: false,
  params: [{ id: 'co2', label: tx('CO₂ в атмосфере', 'Atmospheric CO₂'), min: 280, max: 800, step: 20, value: 420, unit: 'ppm' }],
  stages: [
    { t: 0, label: tx('Солнечный свет', 'Sunlight'), text: tx('Видимый свет Солнца проходит сквозь атмосферу и нагревает поверхность.', 'Visible sunlight passes through the atmosphere and warms the surface.') },
    { t: 4, label: tx('Тепловое излучение', 'Heat radiation'), text: tx('Тёплая Земля излучает инфракрасные лучи обратно в космос.', 'The warm Earth radiates infrared back toward space.') },
    { t: 7, label: tx('Парниковые газы', 'Greenhouse gases'), text: tx('CO₂, метан и пар поглощают часть ИК-лучей и излучают обратно вниз — как одеяло. Без этого на Земле было бы −18 °C.', 'CO₂, methane and water vapour absorb some infrared and send it back down like a blanket. Without it Earth would be −18 °C.') },
    { t: 11, label: tx('Человек', 'Humans'), text: tx('Сжигание топлива и вырубка лесов подняли CO₂ с 280 до 420 ppm — средняя температура выросла на ~1,2 °C. Последствия: таяние льдов, засухи, подъём океана.', 'Burning fuel and cutting forests raised CO₂ from 280 to 420 ppm and the average temperature by ~1.2 °C, bringing melting ice, droughts and rising seas.') },
  ],
  metrics: ({ p }) => [{ label: tx('Средняя температура', 'Average temperature'), value: `${(14 + 3 * Math.log2(p.co2 / 280) - 1.8).toFixed(1)} °C`, tone: p.co2 > 450 ? 'bad' : 'good' }],
  draw(f) {
    const { ctx, w, h, t, p, L } = f;
    ctx.fillStyle = '#07080B';
    ctx.fillRect(0, 0, w, h);
    // atmosphere band
    const thick = (p.co2 - 280) / 520;
    const g = ctx.createLinearGradient(0, 120, 0, 380);
    g.addColorStop(0, alpha('#5B8CFF', 0.05));
    g.addColorStop(1, alpha(mixColor('#5B8CFF', '#F5A524', thick), 0.18 + thick * 0.2));
    ctx.fillStyle = g;
    ctx.fillRect(0, 120, w, 300);
    f.hitRect(info('Атмосфера', 'Atmosphere', 'Пропускает видимый свет, но частично задерживает инфракрасный — из-за CO₂, CH₄, H₂O.', 'Lets visible light through but traps some infrared because of CO₂, CH₄ and H₂O.'), 0, 140, 120, 40);
    for (let i = 0; i < Math.round(20 + thick * 60); i++) {
      const x = hash(i) * w + wobble(i, t, 0.6) * 10;
      const y = 140 + hash(i, 1) * 240;
      ball(ctx, x - 5, y, 3, '#E5484D');
      ball(ctx, x, y, 3.5, '#737985');
      ball(ctx, x + 5, y, 3, '#E5484D');
    }
    // ground
    const temp = clamp(thick * 1.2 + ease(t, 2, 6) * 0.3);
    ctx.fillStyle = mixColor('#2E5A3A', '#8A5A2A', temp);
    ctx.fillRect(0, 420, w, h - 420);
    f.hitRect(info('Поверхность Земли', 'Earth’s surface', 'Нагревается солнечным светом и излучает тепло (ИК).', 'Warmed by sunlight, it radiates heat (infrared).'), 0, 420, w, 120);
    ball(ctx, 860, 50, 34, '#F5C842', 1);
    // incoming sunlight
    for (let k = 0; k < 6; k++) {
      const s = ((t * 0.5 + k / 6) % 1) * ease(t, 0, 1);
      const x0 = 820 - k * 110;
      const x = lerp(x0, x0 - 160, s);
      const y = lerp(60, 420, s);
      line(ctx, [[lerp(x0, x0 - 160, Math.max(0, s - 0.12)), lerp(60, 420, Math.max(0, s - 0.12))], [x, y]], C.yellow, 3);
    }
    // outgoing IR: some escape, some come back
    if (t > 4)
      for (let k = 0; k < 8; k++) {
        const s = ((t - 4) * 0.4 + k / 8) % 1;
        const x = 80 + k * 105;
        const trapped = hash(k) < 0.25 + thick * 0.6 && t > 7;
        let y: number;
        if (!trapped) y = lerp(420, 0, s);
        else y = s < 0.5 ? lerp(420, 230, s * 2) : lerp(230, 420, (s - 0.5) * 2);
        const len = 22;
        const pts: [number, number][] = [];
        for (let q = 0; q <= len; q += 2) pts.push([x + Math.sin(q * 0.6 + t * 10) * 5, y + (trapped && s > 0.5 ? -q : q)]);
        line(ctx, pts, trapped ? C.red : alpha(C.orange, 0.8), 2.5);
      }
    tag(ctx, L('видимый свет', 'visible light'), 760, 110, { color: C.yellow });
    if (t > 4) tag(ctx, L('ИК: уходит в космос', 'IR: escapes to space'), 140, 40, { color: C.orange });
    if (t > 7) tag(ctx, L('ИК: возвращается к Земле', 'IR: sent back to Earth'), 420, 260, { color: C.red });
    tag(ctx, `CO₂: ${p.co2} ppm`, 120, 470, { color: C.text, size: 13 });
  },
};

/* ================= organisms: anatomy gallery ================= */

type Part = { x: number; y: number; r: number; i: ReturnType<typeof info> };

function labelParts(f: Parameters<SimDef['draw']>[0], parts: Part[], show: number) {
  parts.forEach((p, k) => {
    f.hit(p.i, p.x, p.y, p.r);
    if (show > k / parts.length) {
      circle(f.ctx, p.x, p.y, 4, C.white);
    }
  });
}

export const organisms: SimDef = {
  id: 'organisms',
  title: tx('Строение организмов', 'Inside organisms'),
  modes: [
    { id: 'fungi', label: tx('Гриб', 'Mushroom') },
    { id: 'hydra', label: tx('Гидра', 'Hydra') },
    { id: 'worms', label: tx('Черви-паразиты', 'Parasitic worms') },
    { id: 'mollusc', label: tx('Моллюск', 'Mollusc') },
    { id: 'arthropods', label: tx('Членистоногие', 'Arthropods') },
    { id: 'reptile', label: tx('Рептилия', 'Reptile') },
    { id: 'bird', label: tx('Птица', 'Bird') },
    { id: 'plants', label: tx('Двудольные и однодольные', 'Dicots and monocots') },
    { id: 'shoots', label: tx('Видоизменённые побеги', 'Modified shoots') },
  ],
  duration: 12,
  stages: (m) => {
    const T: Record<string, [string, string, string, string][]> = {
      fungi: [
        ['Грибница', 'Mycelium', 'Тело гриба — грибница из тонких нитей (гиф) в почве. Шляпка с ножкой — лишь плодовое тело.', 'The fungus is really the mycelium, a web of thin threads (hyphae) in the soil. The cap and stalk are just the fruiting body.'],
        ['Споры', 'Spores', 'Под шляпкой — пластинки или трубочки со спорами. Ветер разносит миллиарды спор.', 'Gills or tubes under the cap hold spores; the wind carries billions away.'],
        ['Микориза', 'Mycorrhiza', 'Грибница оплетает корни деревьев: гриб даёт воду и минералы, дерево — сахара. Это симбиоз.', 'The mycelium wraps tree roots: the fungus gives water and minerals, the tree gives sugars. That’s symbiosis.'],
      ],
      hydra: [
        ['Два слоя', 'Two layers', 'Тело гидры — мешок из двух слоёв клеток (эктодерма и энтодерма) с кишечной полостью.', 'A hydra is a sac of two cell layers (ectoderm and endoderm) around a gut cavity.'],
        ['Охота', 'Hunting', 'Стрекательные клетки на щупальцах выстреливают ядовитую нить и парализуют добычу.', 'Stinging cells on the tentacles fire venomous threads that paralyse prey.'],
        ['Регенерация', 'Regeneration', 'Гидра восстанавливает целое тело даже из маленького кусочка; размножается почкованием.', 'A hydra can regrow from a tiny piece and reproduces by budding.'],
      ],
      worms: [
        ['Хозяева', 'Hosts', 'Бычий цепень: личинки (финны) живут в мышцах коровы — промежуточного хозяина.', 'The beef tapeworm: larvae (cysts) live in cattle muscle, the intermediate host.'],
        ['Заражение', 'Infection', 'Человек заражается, съев плохо прожаренное мясо. Аскарида — через немытые руки и овощи.', 'People are infected by undercooked meat. Roundworms spread by unwashed hands and vegetables.'],
        ['Профилактика', 'Prevention', 'Мойте руки и овощи, прожаривайте мясо, пейте кипячёную воду.', 'Wash hands and vegetables, cook meat well, drink boiled water.'],
      ],
      mollusc: [
        ['Раковина', 'Shell', 'Мягкое тело улитки защищено раковиной, которую выделяет мантия.', 'The snail’s soft body is protected by a shell made by the mantle.'],
        ['Нога и тёрка', 'Foot and radula', 'Мускулистая нога скользит по слизи; тёрка (радула) соскребает пищу.', 'A muscular foot glides on slime; a rasping radula scrapes up food.'],
        ['Дыхание', 'Breathing', 'Прудовик дышит лёгким — складкой мантии, беззубка — жабрами.', 'Pond snails breathe with a lung, a fold of the mantle; mussels use gills.'],
      ],
      arthropods: [
        ['Хитин', 'Chitin', 'Наружный скелет из хитина и членистые конечности. Чтобы расти, нужно линять.', 'A chitin exoskeleton and jointed legs. To grow they must moult.'],
        ['Рак', 'Crayfish', 'Ракообразные: головогрудь и брюшко, 2 пары усиков, дышат жабрами.', 'Crustaceans: a cephalothorax and abdomen, 2 pairs of antennae, gills.'],
        ['Паук', 'Spider', 'Паукообразные: 4 пары ходильных ног, нет усиков, паутинные бородавки.', 'Arachnids: 4 pairs of walking legs, no antennae, spinnerets.'],
      ],
      reptile: [
        ['Сухая кожа', 'Dry skin', 'Роговые чешуи защищают от высыхания — рептилии полностью перешли на сушу.', 'Horny scales stop drying out, so reptiles live fully on land.'],
        ['Яйцо', 'Egg', 'Яйцо с плотной оболочкой и запасом воды и питания — развитие без водоёма.', 'An egg with a tough shell, water and food lets young develop away from water.'],
        ['Холоднокровность', 'Cold-blooded', 'Температура тела зависит от среды — ящерица греется на солнце.', 'Body temperature follows the surroundings, so lizards bask in the sun.'],
      ],
      bird: [
        ['Полёт', 'Flight', 'Крыло — видоизменённая передняя конечность с маховыми перьями. Взмах вниз создаёт подъёмную силу.', 'The wing is a modified forelimb with flight feathers. The downstroke makes lift.'],
        ['Лёгкость', 'Lightness', 'Полые кости, нет зубов, киль для мощных грудных мышц.', 'Hollow bones, no teeth, and a keel for the big flight muscles.'],
        ['Двойное дыхание', 'Double breathing', 'Воздушные мешки позволяют лёгким получать свежий воздух и на вдохе, и на выдохе. Теплокровность, 4-камерное сердце.', 'Air sacs give the lungs fresh air on both breathing in and out. Warm-blooded, 4-chambered heart.'],
      ],
      plants: [
        ['Семя', 'Seed', 'Двудольные — две семядоли, однодольные — одна.', 'Dicots have two seed leaves, monocots one.'],
        ['Корень и лист', 'Root and leaf', 'Двудольные: стержневой корень, сетчатое жилкование. Однодольные: мочковатый корень, параллельное жилкование.', 'Dicots: a taproot and net veins. Monocots: fibrous roots and parallel veins.'],
        ['Примеры', 'Examples', 'Двудольные: фасоль, роза, подсолнечник. Однодольные: пшеница, кукуруза, лук, тюльпан.', 'Dicots: bean, rose, sunflower. Monocots: wheat, maize, onion, tulip.'],
      ],
      shoots: [
        ['Клубень', 'Tuber', 'Картофель — подземный побег: «глазки» — это почки.', 'A potato is an underground shoot; its “eyes” are buds.'],
        ['Луковица', 'Bulb', 'Луковица: укороченный стебель (донце) и сочные листья-чешуи с запасом.', 'A bulb: a short stem (basal plate) with fleshy storage leaves.'],
        ['Корневище', 'Rhizome', 'Корневище пырея — горизонтальный подземный стебель с почками; поэтому сорняк так трудно вывести.', 'Couch grass rhizomes are horizontal underground stems with buds, which is why the weed is so hard to remove.'],
      ],
    };
    return (T[m] ?? []).map(([ru, en, tr, te], i) => ({ t: i * 4, label: tx(ru, en), text: tx(tr, te) }));
  },
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    const show = ease(t, 0, 4);
    if (mode === 'fungi') {
      ctx.fillStyle = '#3A2A1E';
      ctx.fillRect(0, 330, w, h - 330);
      // mycelium threads
      ctx.strokeStyle = alpha('#F2E8D0', 0.6);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        let x = 480;
        let y = 350;
        ctx.moveTo(x, y);
        for (let s = 0; s < 8; s++) {
          x += (hash(i, s) - 0.5) * 70;
          y += hash(i, s + 9) * 22;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // tree roots for mycorrhiza
      if (t > 8) for (let k = 0; k < 4; k++) line(ctx, [[820, 330], [700 + k * 50, 500]], alpha('#8C6A4A', ease(t, 8, 9)), 6);
      // stalk and cap
      rrect(ctx, 465, 210, 30, 130, 10);
      ctx.fillStyle = '#F2E8D0';
      ctx.fill();
      ctx.fillStyle = '#A0522D';
      ctx.beginPath();
      ctx.ellipse(480, 210, 120, 70, 0, Math.PI, 0);
      ctx.fill();
      for (let k = -8; k <= 8; k++) line(ctx, [[480 + k * 13, 212], [480 + k * 5, 222]], '#E8D0B0', 2);
      if (t > 4)
        for (let i = 0; i < 30; i++) {
          const s = ((t - 4) * 0.25 + hash(i)) % 1;
          circle(ctx, 400 + hash(i, 1) * 160 + s * 200, 225 + s * 60 - s * s * 200, 2, alpha('#E8D0B0', 1 - s));
        }
      labelParts(f, [
        { x: 480, y: 170, r: 40, i: info('Шляпка', 'Cap', 'Часть плодового тела; снизу — пластинки или трубочки со спорами.', 'Part of the fruiting body; underneath are spore-bearing gills or tubes.') },
        { x: 480, y: 280, r: 20, i: info('Ножка', 'Stalk', 'Поднимает шляпку, чтобы споры разлетались дальше.', 'Lifts the cap so the spores spread further.') },
        { x: 540, y: 420, r: 50, i: info('Грибница (мицелий)', 'Mycelium', 'Настоящее тело гриба: питается, всасывая органику (гетеротроф).', 'The real body of the fungus, absorbing organic matter (a heterotroph).') },
        { x: 760, y: 420, r: 40, i: info('Корни дерева', 'Tree roots', 'Микориза — взаимовыгодный союз гриба и растения.', 'Mycorrhiza, a mutually helpful partnership of fungus and plant.') },
      ], show);
      return;
    }
    if (mode === 'hydra') {
      const cx = 480;
      // body
      ctx.fillStyle = alpha('#8BD450', 0.35);
      ctx.strokeStyle = '#8BD450';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 50, 470);
      ctx.quadraticCurveTo(cx - 70, 300, cx - 40, 200);
      ctx.lineTo(cx + 40, 200);
      ctx.quadraticCurveTo(cx + 70, 300, cx + 50, 470);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = alpha('#111214', 0.7);
      ctx.beginPath();
      ctx.ellipse(cx, 330, 22, 110, 0, 0, TAU);
      ctx.fill();
      // tentacles with prey
      for (let k = 0; k < 6; k++) {
        const base = cx - 35 + k * 14;
        const pts: [number, number][] = [];
        for (let s = 0; s <= 1; s += 0.05) pts.push([base + (k - 2.5) * s * 60 + Math.sin(t * 2 + k + s * 4) * 10, 200 - s * 150]);
        line(ctx, pts, '#8BD450', 4);
        for (let q = 4; q < pts.length; q += 4) circle(ctx, pts[q][0], pts[q][1], 2.5, '#F5F0DC');
      }
      const catchK = ease(t, 4, 7);
      const px = lerp(720, cx, ease(t, 7, 10));
      const py = lerp(80 + Math.sin(t * 3) * 20 * (1 - catchK), 300, ease(t, 7, 10));
      ball(ctx, catchK > 0.9 ? px : 720 - catchK * 160, catchK > 0.9 ? py : 90, 10, '#C97A4A');
      if (t > 4 && t < 6) line(ctx, [[cx + 60, 70], [720 - catchK * 160, 90]], alpha(C.yellow, 0.8), 1.5);
      // bud
      const bud = ease(t, 8, 12);
      ctx.fillStyle = alpha('#8BD450', 0.4);
      ctx.beginPath();
      ctx.ellipse(cx + 55 + bud * 25, 380, 12 + bud * 18, 8 + bud * 10, -0.6, 0, TAU);
      ctx.fill();
      labelParts(f, [
        { x: cx, y: 120, r: 40, i: info('Щупальца', 'Tentacles', 'Ловят добычу и подносят ко рту.', 'Catch prey and bring it to the mouth.') },
        { x: cx + 30, y: 90, r: 14, i: info('Стрекательные клетки', 'Stinging cells', 'Выстреливают нить с ядом — у медуз они обжигают даже человека.', 'Fire a venomous thread; in jellyfish they can even sting people.') },
        { x: cx, y: 330, r: 30, i: info('Кишечная полость', 'Gut cavity', 'Пища переваривается здесь, непереваренное выходит через рот.', 'Food is digested here; waste goes back out through the mouth.') },
        { x: cx + 70, y: 380, r: 20, i: info('Почка', 'Bud', 'Бесполое размножение: на теле вырастает новая маленькая гидра.', 'Asexual reproduction: a new little hydra grows on the body.') },
      ], show);
      return;
    }
    if (mode === 'worms') {
      // life cycle of beef tapeworm: human → eggs → cow → cysts → human
      const nodes = [
        { x: 200, y: 140, n: L('человек (основной хозяин)', 'human (main host)') },
        { x: 760, y: 140, n: L('яйца на траве', 'eggs on grass') },
        { x: 760, y: 410, n: L('корова (промежуточный)', 'cow (intermediate)') },
        { x: 200, y: 410, n: L('финны в мясе', 'cysts in meat') },
      ];
      nodes.forEach((nd, i) => {
        rrect(ctx, nd.x - 110, nd.y - 34, 220, 68, 14);
        ctx.fillStyle = C.panel;
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.stroke();
        text(ctx, nd.n, nd.x, nd.y, { size: 12.5 });
        const nx = nodes[(i + 1) % 4];
        const k = ease(t, i * 2, i * 2 + 1.5);
        if (k > 0) arrow(ctx, nd.x + (nx.x - nd.x) * 0.3, nd.y + (nx.y - nd.y) * 0.3, nd.x + (nx.x - nd.x) * (0.3 + 0.4 * k), nd.y + (nx.y - nd.y) * (0.3 + 0.4 * k), { color: C.amber, width: 2.5 });
      });
      // tapeworm drawing in the middle
      const pts: [number, number][] = [];
      for (let s = 0; s <= 1; s += 0.01) pts.push([300 + s * 360 + Math.sin(s * 12 + t) * 6, 275 + Math.sin(s * 8 + t * 0.7) * 30]);
      for (let k = 0; k < pts.length - 1; k += 3) line(ctx, [pts[k], pts[k + 1]], '#F2E8D0', 6 + (k / pts.length) * 8);
      f.hit(info('Бычий цепень', 'Beef tapeworm', 'Плоский червь до 10 м: головка с присосками и тысячи члеников с яйцами. Пищеварительной системы нет — всасывает пищу всей поверхностью.', 'A flatworm up to 10 m: a head with suckers and thousands of egg-filled segments. No gut; it absorbs food through its whole surface.'), 480, 275, 50);
      nodes.forEach((nd, i) => f.hitRect(info(nd.n, nd.n, ['Взрослый червь живёт в кишечнике человека.', 'Членики с яйцами выходят наружу.', 'Корова проглатывает яйца с травой; личинки попадают в мышцы.', 'Человек ест плохо прожаренное мясо с финнами.'][i], ['The adult worm lives in the human gut.', 'Egg-filled segments leave the body.', 'A cow swallows eggs with grass; larvae settle in its muscles.', 'A person eats undercooked meat with cysts.'][i]), nd.x - 110, nd.y - 34, 220, 68));
      return;
    }
    if (mode === 'mollusc') {
      const x = 380 + ((t * 18) % 200);
      // trail
      ctx.fillStyle = alpha('#9BD0F5', 0.2);
      ctx.fillRect(100, 420, x - 100, 10);
      line(ctx, [[80, 432], [880, 432]], '#4A4D55', 3);
      // foot & body
      ctx.fillStyle = '#C9A88A';
      ctx.beginPath();
      ctx.moveTo(x - 160, 425);
      ctx.quadraticCurveTo(x, 405 + Math.sin(t * 4) * 4, x + 110, 420);
      ctx.quadraticCurveTo(x + 150, 380, x + 120, 360);
      ctx.lineTo(x - 140, 400);
      ctx.closePath();
      ctx.fill();
      line(ctx, [[x + 115, 365], [x + 150, 315]], '#C9A88A', 5);
      line(ctx, [[x + 105, 368], [x + 125, 320]], '#C9A88A', 4);
      circle(ctx, x + 150, 313, 5, '#111214');
      // shell spiral
      ctx.strokeStyle = '#8C5A2E';
      ctx.fillStyle = '#C08A4A';
      ctx.beginPath();
      ctx.arc(x - 40, 320, 90, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let a = 0; a < TAU * 3; a += 0.05) {
        const r = 85 - a * 4.4;
        const px = x - 40 + Math.cos(a) * r;
        const py = 320 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      labelParts(f, [
        { x: x - 40, y: 320, r: 60, i: info('Раковина', 'Shell', 'Из извести; растёт вместе с моллюском, выделяется мантией.', 'Made of lime; it grows with the animal and is secreted by the mantle.') },
        { x: x - 20, y: 415, r: 22, i: info('Нога', 'Foot', 'Мускулистая подошва: волны сокращений двигают улитку по слою слизи.', 'A muscular sole; waves of contraction move the snail on a layer of slime.') },
        { x: x + 150, y: 313, r: 12, i: info('Глаза на щупальцах', 'Eyes on tentacles', 'У виноградной улитки глаза на концах длинных щупалец.', 'The garden snail’s eyes sit on the tips of long tentacles.') },
      ], show);
      return;
    }
    if (mode === 'arthropods') {
      // crayfish (left) and spider (right)
      const cx = 280;
      const cy = 280;
      ctx.fillStyle = '#B5552B';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, 36, 0, 0, TAU);
      ctx.fill();
      for (let k = 0; k < 6; k++) {
        rrect(ctx, cx + 60 + k * 22, cy - 22 + k * 2, 22, 44 - k * 4, 6);
        ctx.fill();
      }
      for (const d of [-1, 1]) {
        line(ctx, [[cx - 60, cy + d * 10], [cx - 120, cy + d * 40]], '#B5552B', 7);
        ctx.beginPath();
        ctx.ellipse(cx - 140, cy + d * 50, 26, 12, d * 0.4, 0, TAU);
        ctx.fill();
        for (let k = 0; k < 4; k++) line(ctx, [[cx - 20 + k * 22, cy + d * 30], [cx - 30 + k * 26 + Math.sin(t * 6 + k) * 4, cy + d * 75]], '#B5552B', 4);
        line(ctx, [[cx - 65, cy + d * 5], [cx - 190, cy + d * 90 + Math.sin(t * 2) * 6]], '#B5552B', 2);
      }
      // spider
      const sx = 700;
      const sy = 280;
      // eight legs: four on each side, fanned front to back, knees raised
      for (let k = 0; k < 4; k++)
        for (const d of [-1, 1]) {
          const fan = (k - 1.5) * 0.55;
          const step = Math.sin(t * 5 + k * 1.3 + (d > 0 ? 0 : Math.PI)) * 0.08;
          const kx = sx - 30 + Math.sin(fan + step) * 60 - 10;
          const ky = sy + d * 55;
          const fx = sx - 30 + Math.sin(fan * 1.6 + step) * 120 - 10;
          const fy = sy + d * 110;
          line(ctx, [[sx - 30, sy + d * 8], [kx, ky - d * 20], [fx, fy]], '#8A7660', 4);
        }
      ball(ctx, sx + 40, sy, 46, '#6A5A4A');
      ball(ctx, sx - 30, sy, 30, '#7A6A58');
      for (let k = 0; k < 5; k++) circle(ctx, sx + 30 + (k % 2) * 20, sy - 20 + k * 10, 4, alpha('#F2F4F7', 0.8));
      // web thread
      line(ctx, [[sx + 85, sy + 10], [sx + 160, sy + 120 + Math.sin(t) * 10]], alpha('#F2F4F7', 0.7), 1);
      labelParts(f, [
        { x: cx, y: cy, r: 40, i: info('Головогрудь рака', 'Crayfish cephalothorax', 'Покрыта панцирем; внутри — жабры, сердце, желудок.', 'Covered by a shell, holding the gills, heart and stomach.') },
        { x: cx - 140, y: cy - 50, r: 22, i: info('Клешни', 'Claws', 'Видоизменённая первая пара ходильных ног — для защиты и захвата пищи.', 'The modified first pair of walking legs, for defence and grabbing food.') },
        { x: cx - 190, y: cy - 90, r: 18, i: info('Усики', 'Antennae', 'Органы осязания и обоняния. У ракообразных 2 пары.', 'Organs of touch and smell; crustaceans have 2 pairs.') },
        { x: sx + 40, y: sy, r: 40, i: info('Брюшко паука', 'Spider abdomen', 'Паутинные железы и бородавки; дышит лёгочными мешками и трахеями.', 'Silk glands and spinnerets; breathes with book lungs and tracheae.') },
        { x: sx - 30, y: sy, r: 26, i: info('Головогрудь паука', 'Spider cephalothorax', '4 пары ног, хелицеры с ядом. Пищеварение наружное.', '4 pairs of legs and venomous chelicerae. Digestion happens outside the body.') },
      ], show);
      tag(ctx, L('речной рак', 'crayfish'), cx, 470, { color: C.text });
      tag(ctx, L('паук-крестовик', 'garden spider'), sx, 470, { color: C.text });
      return;
    }
    if (mode === 'reptile') {
      // lizard basking + egg cross-section
      ball(ctx, 860, 60, 30, '#F5C842', 1);
      line(ctx, [[0, 360], [w, 360]], '#5A4A3A', 40);
      const lx = 260;
      ctx.fillStyle = '#5FA84C';
      ctx.beginPath();
      ctx.ellipse(lx, 320, 90, 22, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lx + 105, 312, 30, 16, -0.1, 0, TAU);
      ctx.fill();
      const tail: [number, number][] = [];
      for (let s = 0; s <= 1; s += 0.05) tail.push([lx - 85 - s * 170, 322 + Math.sin(s * 5 + t) * 8 * s]);
      line(ctx, tail, '#5FA84C', 12);
      for (const [dx, d] of [[50, 1], [-50, 1], [50, -1], [-50, -1]] as const) line(ctx, [[lx + dx, 320], [lx + dx + 20, 320 + d * 34]], '#5FA84C', 6);
      for (let i = 0; i < 30; i++) circle(ctx, lx - 80 + (i % 10) * 18, 310 + Math.floor(i / 10) * 9, 3, alpha('#3E7A34', 0.8));
      circle(ctx, lx + 120, 306, 3.5, '#111214');
      const warm = ease(t, 8, 12);
      tag(ctx, `${L('тело', 'body')}: ${(15 + 18 * warm).toFixed(0)} °C`, lx, 250, { color: mixColor('#5B8CFF', '#F5A524', warm) });
      // egg
      const ex = 700;
      ctx.fillStyle = '#F2EADA';
      ctx.beginPath();
      ctx.ellipse(ex, 230, 110, 140, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = alpha('#F5C842', 0.8);
      ctx.beginPath();
      ctx.ellipse(ex, 260, 60, 55, 0, 0, TAU);
      ctx.fill();
      const grow = ease(t, 4, 8);
      ctx.fillStyle = '#7FC36A';
      ctx.beginPath();
      ctx.ellipse(ex - 10, 200, 20 + grow * 25, 12 + grow * 15, 0.3, 0, TAU);
      ctx.fill();
      labelParts(f, [
        { x: lx, y: 320, r: 50, i: info('Ящерица', 'Lizard', 'Роговая чешуя, дышит только лёгкими, трёхкамерное сердце с неполной перегородкой.', 'Horny scales, breathes only with lungs, a three-chambered heart with a partial septum.') },
        { x: ex, y: 100, r: 30, i: info('Скорлупа', 'Shell', 'Кожистая или известковая — защищает от высыхания, пропускает воздух.', 'Leathery or chalky; it stops drying and lets air through.') },
        { x: ex, y: 270, r: 40, i: info('Желток', 'Yolk', 'Запас питания для зародыша.', 'The embryo’s food supply.') },
        { x: ex - 10, y: 200, r: 24, i: info('Зародыш', 'Embryo', 'Развивается в зародышевых оболочках (амнион) — «свой маленький водоём».', 'Develops inside membranes (the amnion), its own little pond.') },
      ], show);
      return;
    }
    if (mode === 'bird') {
      const flap = Math.sin(t * 5);
      const bx = 480;
      const by = 250 + flap * 10;
      ctx.fillStyle = '#5B6FD8';
      ctx.beginPath();
      ctx.ellipse(bx, by, 90, 40, 0, 0, TAU);
      ctx.fill();
      ball(ctx, bx + 100, by - 20, 30, '#5B6FD8');
      ctx.fillStyle = '#F5A524';
      ctx.beginPath();
      ctx.moveTo(bx + 125, by - 25);
      ctx.lineTo(bx + 165, by - 15);
      ctx.lineTo(bx + 125, by - 10);
      ctx.fill();
      circle(ctx, bx + 108, by - 28, 5, '#111214');
      for (const d of [-1, 1]) {
        ctx.fillStyle = d < 0 ? '#4A5AC0' : '#6A7FE8';
        ctx.beginPath();
        ctx.moveTo(bx - 20, by - 10);
        ctx.quadraticCurveTo(bx - 80, by - 10 - flap * 160 * d * 0.5 - 60, bx - 200, by - flap * 140 - 40);
        ctx.lineTo(bx + 30, by - 10);
        ctx.fill();
      }
      ctx.fillStyle = '#4A5AC0';
      ctx.beginPath();
      ctx.moveTo(bx - 85, by);
      ctx.lineTo(bx - 160, by - 25);
      ctx.lineTo(bx - 160, by + 25);
      ctx.fill();
      // lift arrow on downstroke
      if (flap < 0) arrow(ctx, bx, by - 50, bx, by - 50 - (-flap) * 70, { color: C.green, width: 3 });
      // air sacs view
      if (t > 8) {
        const k = 0.5 + 0.5 * Math.sin(t * 2);
        rrect(ctx, 640, 360, 290, 160, 14);
        ctx.fillStyle = C.panel;
        ctx.fill();
        ball(ctx, 740, 440, 28, '#E5484D');
        circle(ctx, 690, 440, 22 + k * 10, alpha('#8FC1FF', 0.45));
        circle(ctx, 800, 440, 22 + (1 - k) * 10, alpha('#8FC1FF', 0.45));
        text(ctx, L('лёгкие и воздушные мешки', 'lungs and air sacs'), 785, 380, { size: 11.5, color: C.dim });
      }
      labelParts(f, [
        { x: bx - 120, y: by - 70 - flap * 70, r: 40, i: info('Крыло', 'Wing', 'Видоизменённая передняя конечность. Маховые перья создают подъёмную силу.', 'A modified forelimb; flight feathers produce lift.') },
        { x: bx, y: by, r: 40, i: info('Киль и мышцы', 'Keel and muscles', 'Грудные мышцы — до 25% массы птицы; крепятся к килю грудины.', 'Flight muscles, up to 25% of body mass, attach to the breastbone keel.') },
        { x: bx + 145, y: by - 17, r: 16, i: info('Клюв', 'Beak', 'Роговой, без зубов — легче голова. Пищу перетирает мускулистый желудок.', 'Horny and toothless to keep the head light; a muscular gizzard grinds food.') },
      ], show);
      return;
    }
    if (mode === 'plants') {
      const cols = [
        { x: 250, n: L('Двудольные', 'Dicots'), dicot: true },
        { x: 710, n: L('Однодольные', 'Monocots'), dicot: false },
      ];
      cols.forEach((c) => {
        text(ctx, c.n, c.x, 40, { size: 18, weight: 700 });
        // seed
        ctx.fillStyle = '#C99A5B';
        ctx.beginPath();
        ctx.ellipse(c.x - 120, 130, 40, 26, 0, 0, TAU);
        ctx.fill();
        if (c.dicot) line(ctx, [[c.x - 120, 106], [c.x - 120, 154]], '#8A6234', 2);
        else {
          ctx.fillStyle = '#F2E8C0';
          ctx.beginPath();
          ctx.ellipse(c.x - 110, 130, 26, 20, 0, 0, TAU);
          ctx.fill();
        }
        text(ctx, c.dicot ? L('2 семядоли', '2 cotyledons') : L('1 семядоля + эндосперм', '1 cotyledon + endosperm'), c.x - 120, 175, { size: 11, color: C.dim });
        // leaf venation
        ctx.save();
        ctx.translate(c.x + 70, 130);
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        if (c.dicot) ctx.ellipse(0, 0, 70, 40, 0, 0, TAU);
        else ctx.ellipse(0, 0, 90, 18, 0, 0, TAU);
        ctx.fill();
        if (c.dicot) {
          line(ctx, [[-65, 0], [65, 0]], '#1E5A2A', 2);
          for (let k = -3; k <= 3; k++) {
            line(ctx, [[k * 16, 0], [k * 16 + 14, -26]], '#1E5A2A', 1.2);
            line(ctx, [[k * 16, 0], [k * 16 + 14, 26]], '#1E5A2A', 1.2);
          }
        } else for (let k = -2; k <= 2; k++) line(ctx, [[-85, k * 5], [85, k * 5]], '#1E5A2A', 1.2);
        ctx.restore();
        text(ctx, c.dicot ? L('сетчатое жилкование', 'net veins') : L('параллельное', 'parallel veins'), c.x + 70, 190, { size: 11, color: C.dim });
        // roots
        const ry = 250;
        if (c.dicot) {
          line(ctx, [[c.x, ry], [c.x, ry + 220]], '#E8DCC0', 6);
          for (let k = 0; k < 8; k++) line(ctx, [[c.x, ry + 30 + k * 22], [c.x + (k % 2 ? 1 : -1) * (60 - k * 5), ry + 50 + k * 22]], '#E8DCC0', 2);
        } else for (let k = 0; k < 14; k++) line(ctx, [[c.x, ry], [c.x + (k - 6.5) * 14, ry + 130 + hash(k) * 70]], '#E8DCC0', 2);
        text(ctx, c.dicot ? L('стержневой корень', 'taproot') : L('мочковатый корень', 'fibrous roots'), c.x, ry + 245, { size: 11, color: C.dim });
        f.hitRect(info(c.dicot ? 'Двудольные' : 'Однодольные', c.dicot ? 'Dicots' : 'Monocots', c.dicot ? 'Две семядоли, стержневой корень, сетчатые жилки, цветки из 4–5 частей. Фасоль, роза, картофель.' : 'Одна семядоля, мочковатый корень, параллельные жилки, цветки из 3 частей. Злаки, лилии, лук.', c.dicot ? 'Two cotyledons, a taproot, net veins, flower parts in 4s or 5s. Bean, rose, potato.' : 'One cotyledon, fibrous roots, parallel veins, flower parts in 3s. Grasses, lilies, onion.'), c.x - 200, 20, 400, 40);
      });
      line(ctx, [[480, 60], [480, 520]], C.line, 1, [5, 5]);
      return;
    }
    // modified shoots
    ctx.fillStyle = '#3A2A1E';
    ctx.fillRect(0, 200, w, h - 200);
    // potato
    ctx.fillStyle = '#C9A06A';
    ctx.beginPath();
    ctx.ellipse(170, 330, 80, 55, 0.2, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 6; k++) circle(ctx, 130 + hash(k) * 90, 300 + hash(k, 1) * 60, 4, '#7A5A34');
    line(ctx, [[170, 275], [170, 200], [160, 120]], '#5FA84C', 5);
    const sprout = ease(t, 0, 4);
    if (sprout > 0) line(ctx, [[215, 310], [215 + sprout * 30, 290 - sprout * 30]], '#C9E8A0', 3);
    // onion
    const ox = 480;
    ctx.fillStyle = '#C97A8A';
    ctx.beginPath();
    ctx.moveTo(ox, 250);
    ctx.quadraticCurveTo(ox - 90, 330, ox - 40, 400);
    ctx.lineTo(ox + 40, 400);
    ctx.quadraticCurveTo(ox + 90, 330, ox, 250);
    ctx.fill();
    for (let k = 1; k < 4; k++) {
      ctx.strokeStyle = alpha('#F2D0D8', 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, 260 + k * 10);
      ctx.quadraticCurveTo(ox - 90 + k * 20, 330, ox - 40 + k * 10, 398);
      ctx.moveTo(ox, 260 + k * 10);
      ctx.quadraticCurveTo(ox + 90 - k * 20, 330, ox + 40 - k * 10, 398);
      ctx.stroke();
    }
    rrect(ctx, ox - 45, 398, 90, 14, 4);
    ctx.fillStyle = '#E8D0B0';
    ctx.fill();
    for (let k = 0; k < 10; k++) line(ctx, [[ox - 40 + k * 9, 412], [ox - 50 + k * 11, 470]], '#E8DCC0', 1.5);
    for (let k = -1; k <= 1; k++) line(ctx, [[ox, 250], [ox + k * 20, 120]], '#5FA84C', 5);
    // rhizome
    const rx = 680;
    line(ctx, [[rx, 290], [rx + 240, 300]], '#D9C29A', 10);
    for (let k = 0; k < 4; k++) {
      const x = rx + 30 + k * 60;
      const up = ease(t, 8 + k * 0.5, 10 + k * 0.5);
      line(ctx, [[x, 292], [x, 292 - up * 150]], '#5FA84C', 3);
      for (let r = 0; r < 4; r++) line(ctx, [[x, 300], [x - 15 + r * 10, 340]], '#E8DCC0', 1.2);
    }
    labelParts(f, [
      { x: 170, y: 330, r: 50, i: info('Клубень картофеля', 'Potato tuber', 'Утолщённый подземный побег с запасом крахмала. «Глазки» — почки, из них растут ростки.', 'A swollen underground shoot full of starch. The “eyes” are buds that sprout.') },
      { x: 480, y: 330, r: 50, i: info('Луковица', 'Bulb', 'Донце — стебель, сочные чешуи — листья с запасом.', 'The basal plate is the stem; the fleshy scales are storage leaves.') },
      { x: 800, y: 296, r: 40, i: info('Корневище', 'Rhizome', 'Отличается от корня почками и узлами. Пырей, ландыш, ирис.', 'Unlike a root, it has buds and nodes. Couch grass, lily of the valley, iris.') },
    ], show);
  },
};
