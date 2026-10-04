import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, tag, TAU, text, tx, wave, wobble } from '../kit';

/* ================= evolution ================= */

const ERAS = [
  { from: 4600, to: 2500, n: tx('Архей', 'Archean'), c: '#6B4A6A', ev: tx('Первые клетки-прокариоты (~3,8 млрд лет), цианобактерии начинают выделять O₂.', 'The first prokaryotic cells (~3.8 bn years); cyanobacteria start releasing O₂.') },
  { from: 2500, to: 541, n: tx('Протерозой', 'Proterozoic'), c: '#4A5A8A', ev: tx('Кислородная революция, первые эукариоты и многоклеточные.', 'The oxygen revolution, the first eukaryotes and multicellular life.') },
  { from: 541, to: 252, n: tx('Палеозой', 'Palaeozoic'), c: '#3A7A5A', ev: tx('Кембрийский взрыв, рыбы, выход растений и животных на сушу, папоротниковые леса, земноводные и первые рептилии.', 'The Cambrian explosion, fish, plants and animals move onto land, fern forests, amphibians and early reptiles.') },
  { from: 252, to: 66, n: tx('Мезозой', 'Mesozoic'), c: '#8A7A3A', ev: tx('Эра динозавров. Появляются млекопитающие, птицы и цветковые растения. Заканчивается падением астероида.', 'The age of dinosaurs. Mammals, birds and flowering plants appear. It ends with an asteroid impact.') },
  { from: 66, to: 0, n: tx('Кайнозой', 'Cenozoic'), c: '#B5552B', ev: tx('Расцвет млекопитающих и птиц, травяные степи; ~300 тыс. лет назад — человек разумный.', 'Mammals and birds flourish, grasslands spread; Homo sapiens appears ~300,000 years ago.') },
];

const HUMANS = [
  { n: tx('Австралопитек', 'Australopithecus'), age: tx('4–2 млн лет', '4–2 Myr'), brain: 450, h: 120, t: tx('Прямохождение, но мозг как у шимпанзе. Орудий почти не делал.', 'Walked upright with a chimp-sized brain and made few tools.') },
  { n: tx('Человек умелый', 'Homo habilis'), age: tx('2,4–1,4 млн лет', '2.4–1.4 Myr'), brain: 650, h: 130, t: tx('Первые каменные орудия (галечная культура).', 'The first stone tools (pebble culture).') },
  { n: tx('Человек прямоходящий', 'Homo erectus'), age: tx('1,9 млн — 100 тыс. лет', '1.9 Myr–100 kyr'), brain: 950, h: 160, t: tx('Использовал огонь, расселился из Африки по Евразии.', 'Used fire and spread from Africa across Eurasia.') },
  { n: tx('Неандерталец', 'Neanderthal'), age: tx('400–40 тыс. лет', '400–40 kyr'), brain: 1450, h: 162, t: tx('Крупный мозг, хоронил умерших, жил в ледниковой Европе. Родственный нам вид.', 'A large brain; buried the dead and lived in Ice Age Europe. A sister species to ours.') },
  { n: tx('Человек разумный', 'Homo sapiens'), age: tx('300 тыс. лет — сейчас', '300 kyr–now'), brain: 1350, h: 172, t: tx('Членораздельная речь, искусство, сложные орудия, культура.', 'Articulate speech, art, complex tools and culture.') },
];

function moth(ctx: CanvasRenderingContext2D, x: number, y: number, dark: boolean, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = dark ? '#2A2622' : '#E8E1D0';
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(d * 12, -2, 14, 9, d * 0.4, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(d * 9, 7, 8, 6, d * 0.6, 0, TAU);
    ctx.fill();
  }
  if (!dark) for (let i = 0; i < 6; i++) circle(ctx, (hash(i) - 0.5) * 30, (hash(i, 1) - 0.5) * 14, 1.2, '#3A3530');
  ctx.fillStyle = '#4A4038';
  ctx.fillRect(-2, -8, 4, 18);
  ctx.restore();
}

export const evolution: SimDef = {
  id: 'evolution',
  title: tx('Эволюция', 'Evolution'),
  modes: [
    { id: 'selection', label: tx('Естественный отбор', 'Natural selection') },
    { id: 'history', label: tx('История Земли', 'Earth’s history') },
    { id: 'humans', label: tx('Антропогенез', 'Human evolution') },
    { id: 'origin', label: tx('Происхождение жизни', 'Origin of life') },
  ],
  duration: (m) => (m === 'selection' ? 16 : m === 'history' ? 16 : m === 'humans' ? 15 : 12),
  loop: false,
  params: (m) => (m === 'selection' ? [{ id: 'soot', label: tx('Копоть на коре (загрязнение)', 'Soot on the bark (pollution)'), min: 0, max: 1, step: 0.1, value: 0.9, digits: 1 }] : []),
  stages: (m) =>
    m === 'selection'
      ? [
          { t: 0, label: tx('Изменчивость', 'Variation'), text: tx('В популяции берёзовой пяденицы есть светлые и тёмные бабочки — это наследственная изменчивость.', 'The peppered moth population has light and dark forms: inherited variation.') },
          { t: 3, label: tx('Борьба за существование', 'Struggle for existence'), text: tx('Птицы склёвывают заметных бабочек. На закопчённой коре заметнее светлые, на чистой — тёмные.', 'Birds eat the moths they can see. On sooty bark the light ones stand out; on clean bark, the dark ones.') },
          { t: 8, label: tx('Отбор', 'Selection'), text: tx('Выжившие оставляют потомство — из поколения в поколение доля выгодной окраски растёт. Так в Англии XIX века почти все пяденицы стали тёмными (индустриальный меланизм).', 'Survivors breed, so the helpful colour spreads over the generations. In 19th-century England almost all moths turned dark (industrial melanism).') },
          { t: 13, label: tx('Обратный процесс', 'Reversal'), text: tx('Когда воздух очистили, светлые снова стали большинством. Отбор не «целенаправлен» — он сохраняет то, что выгодно сейчас.', 'Once the air was cleaned, light moths became the majority again. Selection has no goal; it keeps whatever helps right now.') },
        ]
      : m === 'history'
        ? [
            { t: 0, label: tx('4,6 млрд лет', '4.6 bn years'), text: tx('Земля образовалась ~4,6 млрд лет назад. Нажимай на эры шкалы.', 'Earth formed about 4.6 billion years ago. Tap the eras on the scale.') },
            { t: 8, label: tx('Масштаб', 'Scale'), text: tx('Если сжать историю Земли в сутки, человек появится за 6 секунд до полуночи.', 'Squeeze Earth’s history into a day and humans appear 6 seconds before midnight.') },
          ]
        : m === 'humans'
          ? [
              { t: 0, label: tx('Общий предок', 'Common ancestor'), text: tx('Человек и шимпанзе произошли от общего предка ~6–7 млн лет назад.', 'Humans and chimpanzees share an ancestor from ~6–7 million years ago.') },
              { t: 3, label: tx('Прямохождение', 'Upright walking'), text: tx('Сначала появилось прямохождение, освободившее руки, — и лишь потом рос мозг.', 'Upright walking came first, freeing the hands; the brain grew later.') },
              { t: 9, label: tx('Социальные факторы', 'Social factors'), text: tx('Труд, речь, совместная охота и огонь ускорили развитие мозга и культуры (биологические + социальные факторы антропогенеза).', 'Labour, speech, group hunting and fire sped up brain and cultural development (biological + social drivers).') },
            ]
          : [
              { t: 0, label: tx('Первичная атмосфера', 'Early atmosphere'), text: tx('Гипотеза Опарина–Холдейна: в древней атмосфере не было O₂, но были CH₄, NH₃, H₂, пары воды.', 'The Oparin–Haldane hypothesis: the early air had no O₂ but did have CH₄, NH₃, H₂ and water vapour.') },
              { t: 3, label: tx('Опыт Миллера', 'Miller’s experiment'), text: tx('В 1953 г. Миллер пропускал через такую смесь электрические разряды («молнии»).', 'In 1953 Miller passed electric sparks (“lightning”) through such a mixture.') },
              { t: 7, label: tx('Аминокислоты', 'Amino acids'), text: tx('Через неделю в воде нашлись аминокислоты — «кирпичики» белков. Органика могла возникнуть из неорганики без участия живого.', 'A week later the water held amino acids, the building blocks of proteins. Organic matter could arise from inorganic matter without life.') },
            ],
  metrics: ({ t, p, mode }) => {
    if (mode !== 'selection') return [];
    const d = darkShare(p.soot, t);
    return [
      { label: tx('Тёмных бабочек', 'Dark moths'), value: `${(d * 100).toFixed(0)} %` },
      { label: tx('Поколение', 'Generation'), value: String(Math.floor(t / 1.2)) },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'selection') {
      // tree trunk colour depends on soot
      const bark = mixColor('#D8D2C2', '#3A3530', p.soot);
      rrect(ctx, 60, 20, 440, 500, 30);
      ctx.fillStyle = bark;
      ctx.fill();
      for (let i = 0; i < 40; i++) line(ctx, [[80 + hash(i) * 400, 30 + hash(i, 1) * 480], [100 + hash(i) * 400, 40 + hash(i, 1) * 480]], alpha(p.soot > 0.5 ? '#1E1A16' : '#8A8270', 0.6), 3);
      f.hitRect(info('Кора берёзы', 'Birch bark', 'Фон, на котором бабочка отдыхает днём. Его цвет определяет, кого заметит птица.', 'The background where moths rest by day. Its colour decides which ones a bird spots.'), 60, 20, 440, 40);
      const d = darkShare(p.soot, t);
      const n = 26;
      for (let i = 0; i < n; i++) {
        const dark = hash(i, 5) < d;
        const x = 100 + hash(i, 1) * 360;
        const y = 50 + hash(i, 2) * 440;
        // the visible ones get eaten each generation (they flicker out and are replaced)
        const visible = dark ? p.soot < 0.5 : p.soot >= 0.5;
        const g = (t / 1.2) % 1;
        const eaten = visible && hash(i, Math.floor(t / 1.2)) < 0.35 ? ease(g, 0.4, 0.7) : 0;
        ctx.globalAlpha = 1 - eaten;
        moth(ctx, x, y, dark);
        ctx.globalAlpha = 1;
        if (i === 0) f.hit(info(dark ? 'Тёмная форма' : 'Светлая форма', dark ? 'Dark form' : 'Light form', 'Окраска передаётся по наследству (определяется геном).', 'The colour is inherited (set by a gene).'), x, y, 18);
      }
      // bird
      const bx = 280 + Math.sin(t * 1.3) * 180;
      const by = 260 + Math.cos(t * 0.9) * 180;
      ctx.fillStyle = '#5A3A2A';
      ctx.beginPath();
      ctx.ellipse(bx, by, 18, 11, 0, 0, TAU);
      ctx.fill();
      line(ctx, [[bx - 6, by], [bx - 28, by - 14 - Math.sin(t * 14) * 10]], '#5A3A2A', 5);
      line(ctx, [[bx + 6, by], [bx + 28, by - 14 - Math.sin(t * 14) * 10]], '#5A3A2A', 5);
      f.hit(info('Птица', 'Bird', 'Фактор отбора: склёвывает заметных бабочек.', 'The selecting agent: it picks off the moths it can see.'), bx, by, 20);
      chart(ctx, {
        x: 540, y: 40, w: 390, h: 460, xMax: 16, yMax: 1, title: L('Доля тёмных бабочек', 'Share of dark moths'), xLabel: L('поколения', 'generations'), upTo: t, cursor: t,
        series: [{ color: '#B5B8C0', fn: (x) => darkShare(p.soot, x), width: 3 }],
      });
      return;
    }
    if (mode === 'history') {
      // spiral time scale
      const cx = 330;
      const cy = 280;
      const total = 4600;
      const k = ease(t, 0, 12);
      ERAS.forEach((era) => {
        const a0 = (1 - era.from / total) * TAU * 2.5;
        const a1 = (1 - era.to / total) * TAU * 2.5;
        const shown = Math.min(a1, k * TAU * 2.5);
        if (shown <= a0) return;
        ctx.strokeStyle = era.c;
        ctx.lineWidth = 26;
        ctx.beginPath();
        for (let a = a0; a <= shown; a += 0.02) {
          const r = 40 + a * 13;
          const x = cx + Math.cos(a - Math.PI / 2) * r;
          const y = cy + Math.sin(a - Math.PI / 2) * r;
          if (a === a0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const am = (a0 + Math.min(a1, shown)) / 2;
        const rm = 40 + am * 13;
        f.hit(info(era.n.ru, era.n.en, `${era.from}–${era.to} млн лет назад. ${era.ev.ru}`, `${era.from}–${era.to} million years ago. ${era.ev.en}`), cx + Math.cos(am - Math.PI / 2) * rm, cy + Math.sin(am - Math.PI / 2) * rm, 18);
      });
      // legend list
      ERAS.forEach((era, i) => {
        const y = 80 + i * 76;
        const on = k * total >= total - era.from;
        ctx.globalAlpha = on ? 1 : 0.3;
        rrect(ctx, 640, y - 26, 290, 60, 10);
        ctx.fillStyle = alpha(era.c, 0.35);
        ctx.fill();
        text(ctx, era.n[f.lang], 656, y - 8, { size: 14, align: 'left', weight: 600 });
        text(ctx, `${era.from}–${era.to} ${L('млн лет', 'Myr')}`, 656, y + 14, { size: 11, align: 'left', color: C.dim });
        ctx.globalAlpha = 1;
        f.hitRect(info(era.n.ru, era.n.en, era.ev.ru, era.ev.en), 640, y - 26, 290, 60);
      });
      const now = Math.round(total * (1 - k));
      tag(ctx, `${now} ${L('млн лет назад', 'million years ago')}`, cx, 30, { color: C.amber, size: 13 });
      return;
    }
    if (mode === 'humans') {
      const ground = 470;
      line(ctx, [[30, ground], [930, ground]], '#4A4D55', 2);
      HUMANS.forEach((hm, i) => {
        const show = ease(t, i * 2.6, i * 2.6 + 1.5);
        if (show <= 0) return;
        const x = 120 + i * 180;
        const hh = hm.h * 1.6;
        const stoop = 0.35 * (1 - i / 4);
        ctx.globalAlpha = show;
        // simple silhouette
        const head = 12 + hm.brain / 140;
        const top = ground - hh;
        ctx.save();
        ctx.translate(x, ground);
        ctx.rotate(stoop * 0.5);
        ctx.fillStyle = '#C99A6A';
        rrect(ctx, -12, -hh + head * 2, 24, hh * 0.45, 10);
        ctx.fill();
        line(ctx, [[-6, -hh * 0.5], [-10, 0]], '#C99A6A', 9);
        line(ctx, [[6, -hh * 0.5], [10, 0]], '#C99A6A', 9);
        line(ctx, [[-10, -hh + head * 2 + 10], [-18 - stoop * 30, -hh * 0.45]], '#C99A6A', 7);
        ball(ctx, 0 + stoop * 20, -hh + head, head, '#C99A6A');
        ctx.restore();
        text(ctx, hm.n[f.lang], x, ground + 22, { size: 12, weight: 600 });
        text(ctx, hm.age[f.lang], x, ground + 40, { size: 10.5, color: C.dim });
        tag(ctx, `${hm.brain} см³`, x, top - 22, { color: C.sky, size: 11 });
        ctx.globalAlpha = 1;
        f.hit(info(hm.n.ru, hm.n.en, `${hm.age.ru}. Мозг ~${hm.brain} см³. ${hm.t.ru}`, `${hm.age.en}. Brain ~${hm.brain} cm³. ${hm.t.en}`), x, ground - hh / 2, 40);
      });
      return;
    }
    // Miller–Urey apparatus
    const spark = t > 3 && t < 9 && Math.floor(t * 8) % 3 === 0;
    circle(ctx, 640, 160, 90, alpha('#8FA4FF', 0.08), '#D5D8DE', 2.5);
    text(ctx, 'CH₄  NH₃  H₂  H₂O', 640, 160, { size: 14, color: C.sky });
    f.hit(info('Колба с «атмосферой»', '“Atmosphere” flask', 'Смесь газов, похожая на древнюю атмосферу Земли.', 'A gas mix like Earth’s early atmosphere.'), 640, 160, 90);
    line(ctx, [[600, 120], [620, 150]], '#B5B8C0', 3);
    line(ctx, [[680, 120], [660, 150]], '#B5B8C0', 3);
    if (spark) {
      const pts: [number, number][] = [[622, 152]];
      for (let i = 1; i < 6; i++) pts.push([622 + i * 7, 152 + (hash(i, Math.floor(t * 8)) - 0.5) * 14]);
      line(ctx, pts, C.yellow, 2.5);
    }
    tag(ctx, L('электроды: «молнии»', 'electrodes: “lightning”'), 640, 50, { color: C.yellow });
    // boiling flask
    circle(ctx, 260, 400, 70, alpha('#2F6FB5', 0.35), '#D5D8DE', 2.5);
    const orange = ease(t, 6, 11);
    ctx.fillStyle = alpha(mixColor('#2F6FB5', '#C97A2A', orange), 0.6);
    ctx.beginPath();
    ctx.arc(260, 400, 66, 0, Math.PI);
    ctx.fill();
    f.hit(info('«Первичный океан»', '“Primordial ocean”', 'Кипящая вода. Со временем в ней накапливаются органические вещества — она буреет.', 'Boiling water. Organic compounds build up and turn it brown.'), 260, 400, 70);
    ctx.strokeStyle = '#B5B8C0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(260, 330);
    ctx.lineTo(260, 160);
    ctx.lineTo(550, 160);
    ctx.moveTo(730, 160);
    ctx.lineTo(820, 160);
    ctx.lineTo(820, 400);
    ctx.lineTo(330, 400);
    ctx.stroke();
    rrect(ctx, 800, 220, 40, 120, 14);
    ctx.fillStyle = alpha('#3F6FE0', 0.3);
    ctx.fill();
    text(ctx, L('охлаждение', 'cooling'), 870, 280, { size: 11, color: C.blue, align: 'left' });
    // flowing particles
    for (let i = 0; i < 10; i++) {
      const s = (t * 0.12 + i / 10) % 1;
      const pathLen = 170 + 290 + 90 + 240 + 490;
      let d = s * pathLen;
      let x: number;
      let y: number;
      if (d < 170) [x, y] = [260, 330 - d];
      else if ((d -= 170) < 290) [x, y] = [260 + d, 160];
      else if ((d -= 290) < 90) [x, y] = [730 + d, 160];
      else if ((d -= 90) < 240) [x, y] = [820, 160 + d];
      else [x, y] = [820 - (d - 240), 400];
      circle(ctx, x, y, 4, t > 7 && i % 3 === 0 ? C.amber : alpha('#D5D8DE', 0.8));
    }
    if (t > 7) tag(ctx, L('аминокислоты: глицин, аланин…', 'amino acids: glycine, alanine…'), 260, 500, { color: C.amber, size: 13 });
    flameSmall(ctx, 260, 490, t);
  },
};

function flameSmall(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  for (let i = 0; i < 3; i++) {
    const hgt = 24 * (1 - i * 0.25) * (1 + 0.1 * Math.sin(t * 12 + i));
    ctx.fillStyle = [alpha('#F76B15', 0.85), alpha('#F5A524', 0.9), alpha('#FFE58F', 0.95)][i];
    ctx.beginPath();
    ctx.moveTo(x - 10 + i * 3, y);
    ctx.quadraticCurveTo(x, y - hgt * 1.6, x + 10 - i * 3, y);
    ctx.fill();
  }
}

function darkShare(soot: number, t: number) {
  // replicator dynamics: dark form fitness advantage depends on soot
  const s = (soot - 0.5) * 1.6;
  const gens = t / 1.2;
  const p0 = 0.05;
  const logit = Math.log(p0 / (1 - p0)) + s * gens;
  return 1 / (1 + Math.exp(-logit));
}

/* ================= enzymes and energy ================= */

export const enzymes: SimDef = {
  id: 'enzymes',
  title: tx('Ферменты и энергия клетки', 'Enzymes and cell energy'),
  modes: [
    { id: 'lock', label: tx('Ключ и замок', 'Lock and key') },
    { id: 'activity', label: tx('Температура и pH', 'Temperature and pH') },
    { id: 'atp', label: tx('Цикл АТФ', 'ATP cycle') },
  ],
  duration: 12,
  params: (m) =>
    m === 'activity'
      ? [
          { id: 'T', label: tx('Температура', 'Temperature'), min: 0, max: 70, step: 1, value: 37, unit: '°C' },
          { id: 'ph', label: tx('pH среды', 'pH'), min: 1, max: 12, step: 0.5, value: 7, digits: 1 },
        ]
      : m === 'lock'
        ? [{ id: 'inhib', label: tx('Ингибитор (0 — нет, 1 — есть)', 'Inhibitor (0 no, 1 yes)'), min: 0, max: 1, step: 1, value: 0 }]
        : [],
  stages: (m) =>
    m === 'lock'
      ? [
          { t: 0, label: tx('Фермент', 'Enzyme'), text: tx('Фермент — белок-катализатор. У него есть активный центр строго определённой формы.', 'An enzyme is a protein catalyst with an active site of a precise shape.') },
          { t: 2, label: tx('Комплекс', 'Complex'), text: tx('Подходящий субстрат входит в активный центр как ключ в замок — образуется фермент-субстратный комплекс.', 'The matching substrate fits the active site like a key in a lock, forming an enzyme–substrate complex.') },
          { t: 4, label: tx('Продукты', 'Products'), text: tx('Субстрат расщепляется, продукты уходят, а фермент свободен и готов к новой работе — тысячи раз в секунду.', 'The substrate splits, the products leave, and the enzyme is free to work again, thousands of times a second.') },
        ]
      : m === 'activity'
        ? [{ t: 0, label: tx('Оптимум', 'Optimum'), text: tx('Ферменты человека работают лучше всего при 37 °C. При нагреве выше ~45 °C белок денатурирует — разрушается форма активного центра. Пепсин желудка любит pH ≈ 2, ферменты кишечника — pH ≈ 8.', 'Human enzymes work best at 37 °C. Above ~45 °C the protein denatures and the active site loses its shape. Stomach pepsin likes pH ≈ 2; gut enzymes pH ≈ 8.') }]
        : [
            { t: 0, label: tx('АТФ', 'ATP'), text: tx('АТФ — аденин + рибоза + три фосфата. Связи между фосфатами богаты энергией.', 'ATP is adenine + ribose + three phosphates. The bonds between phosphates hold a lot of energy.') },
            { t: 3, label: tx('Расход', 'Use'), text: tx('Отщепление фосфата: АТФ → АДФ + Ф + 40 кДж. Эта энергия идёт на сокращение мышц, синтез, транспорт.', 'Splitting off a phosphate: ATP → ADP + P + 40 kJ, powering muscles, synthesis and transport.') },
            { t: 7, label: tx('Восстановление', 'Recharge'), text: tx('В митохондриях энергия окисления глюкозы снова «заряжает» АДФ до АТФ. Человек за сутки перерабатывает свою массу АТФ!', 'In mitochondria, energy from oxidising glucose recharges ADP into ATP. A person recycles their own body weight of ATP daily!') },
          ],
  metrics: ({ p, mode }) => (mode === 'activity' ? [{ label: tx('Активность', 'Activity'), value: `${(activity(p.T, p.ph) * 100).toFixed(0)} %` }] : []),
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const enzyme = (x: number, y: number, open = 1) => {
      ctx.fillStyle = '#3F6FE0';
      ctx.beginPath();
      ctx.moveTo(x - 120, y + 60);
      ctx.quadraticCurveTo(x - 140, y - 60, x - 60, y - 60);
      ctx.lineTo(x - 40, y - 60);
      // active site notch (triangle + square)
      ctx.lineTo(x - 30, y - 60 + 40 * open);
      ctx.lineTo(x + 30, y - 60 + 40 * open);
      ctx.lineTo(x + 40, y - 60);
      ctx.lineTo(x + 60, y - 60);
      ctx.quadraticCurveTo(x + 140, y - 60, x + 120, y + 60);
      ctx.closePath();
      ctx.fill();
    };
    if (mode === 'lock') {
      const cx = 480;
      const cy = 320;
      const cyc = t % 6;
      enzyme(cx, cy);
      f.hit(info('Фермент', 'Enzyme', 'Белок с активным центром. Ускоряет реакцию в миллионы раз и сам не расходуется.', 'A protein with an active site. It speeds a reaction up millions of times and isn’t used up.'), cx, cy + 20, 70);
      f.hit(info('Активный центр', 'Active site', 'Углубление особой формы — подходит только «свой» субстрат (специфичность).', 'A pocket of a special shape that only the right substrate fits (specificity).'), cx, cy - 45, 26);
      if (p.inhib) {
        // competitive inhibitor sits in the site
        rrect(ctx, cx - 28, cy - 62, 56, 38, 4);
        ctx.fillStyle = '#E5484D';
        ctx.fill();
        tag(ctx, L('ингибитор занял центр', 'inhibitor blocks the site'), cx, cy - 110, { color: C.red });
        const sx = cx + Math.sin(t) * 200;
        rrect(ctx, sx - 30, 90 + Math.cos(t * 1.3) * 20, 60, 36, 4);
        ctx.fillStyle = '#F5A524';
        ctx.fill();
        f.hit(info('Ингибитор', 'Inhibitor', 'Вещество, похожее на субстрат: занимает активный центр и останавливает работу фермента. Так действуют многие лекарства и яды.', 'A substrate look-alike that occupies the active site and stops the enzyme. Many drugs and poisons work this way.'), cx, cy - 43, 26);
        return;
      }
      const approach = ease(cyc, 0, 2);
      const split = ease(cyc, 3, 4.5);
      const sy = lerp(80, cy - 43, approach);
      // substrate: two joined pieces
      const left = cx - 15 - split * 160;
      const right = cx + 15 + split * 160;
      const py = sy - split * 120;
      rrect(ctx, left - 15, py - 18, 30, 36, 4);
      ctx.fillStyle = '#F5A524';
      ctx.fill();
      rrect(ctx, right - 15, py - 18, 30, 36, 4);
      ctx.fill();
      if (split < 0.05) line(ctx, [[left + 15, py], [right - 15, py]], '#F5A524', 6);
      f.hit(split > 0.5 ? info('Продукты', 'Products', 'Субстрат расщеплён на две молекулы.', 'The substrate is split into two molecules.') : info('Субстрат', 'Substrate', 'Вещество, на которое действует фермент (например, крахмал для амилазы).', 'The molecule the enzyme acts on (e.g. starch for amylase).'), cx, py, 30);
      if (cyc > 2 && cyc < 3.2) circle(ctx, cx, cy - 43, 40 + (cyc - 2) * 20, undefined, alpha(C.yellow, 1 - (cyc - 2)), 2);
      return;
    }
    if (mode === 'activity') {
      const a = activity(p.T, p.ph);
      const g1 = chart(ctx, { x: 520, y: 30, w: 410, h: 230, xMax: 70, yMax: 1.1, title: L('Активность от температуры', 'Activity vs temperature'), xLabel: '°C', series: [{ color: C.amber, fn: (x) => activity(x, 7), width: 2.5 }] });
      circle(ctx, g1.X(p.T), g1.Y(activity(p.T, 7)), 6, C.white);
      const g2 = chart(ctx, { x: 520, y: 280, w: 410, h: 230, xMax: 14, yMax: 1.1, title: L('Активность от pH (амилаза слюны)', 'Activity vs pH (salivary amylase)'), xLabel: 'pH', series: [{ color: C.green, fn: (x) => activity(37, x), width: 2.5 }] });
      circle(ctx, g2.X(p.ph), g2.Y(activity(37, p.ph)), 6, C.white);
      // enzyme shape deforms when denatured
      const den = clamp((p.T - 45) / 15) + clamp((Math.abs(p.ph - 7) - 3) / 3);
      ctx.save();
      ctx.translate(250, 320);
      ctx.rotate(Math.sin(t * (1 + p.T / 20)) * 0.05 * (p.T / 37));
      ctx.scale(1 + den * 0.2, 1 - den * 0.25);
      enzyme(0, 0, 1 - clamp(den));
      ctx.restore();
      f.hit(info('Фермент', 'Enzyme', den > 0.5 ? 'Денатурирован: форма активного центра разрушена, фермент не работает (как белок сваренного яйца).' : 'Работает: активный центр сохранил форму.', den > 0.5 ? 'Denatured: the active site lost its shape and no longer works (like boiled egg white).' : 'Working: the active site keeps its shape.'), 250, 340, 80);
      // reaction rate as products appearing
      for (let i = 0; i < Math.round(a * 30); i++) circle(ctx, 100 + hash(i) * 300, 90 + hash(i, 1) * 120 + wobble(i, t, 1) * 5, 5, C.amber);
      tag(ctx, `${L('активность', 'activity')}: ${(a * 100).toFixed(0)}%`, 250, 470, { color: a > 0.6 ? C.green : a > 0.2 ? C.amber : C.red, size: 14 });
      return;
    }
    // ATP cycle
    const cx = 480;
    const cy = 280;
    const phase = (t % 12) / 12;
    const spent = phase < 0.5 ? ease(phase, 0.15, 0.4) : 1 - ease(phase, 0.6, 0.9);
    // adenine + ribose
    rrect(ctx, cx - 260, cy - 30, 90, 60, 10);
    ctx.fillStyle = '#3F6FE0';
    ctx.fill();
    text(ctx, L('аденин', 'adenine'), cx - 215, cy, { size: 12, color: C.white });
    ctx.fillStyle = '#30A46C';
    ctx.beginPath();
    for (let k = 0; k < 5; k++) ctx.lineTo(cx - 130 + Math.cos((k / 5) * TAU - Math.PI / 2) * 36, cy + Math.sin((k / 5) * TAU - Math.PI / 2) * 36);
    ctx.closePath();
    ctx.fill();
    text(ctx, L('рибоза', 'ribose'), cx - 130, cy + 2, { size: 11, color: C.white });
    line(ctx, [[cx - 170, cy], [cx - 166, cy]], C.white, 3);
    f.hit(info('Аденин и рибоза', 'Adenine and ribose', 'Азотистое основание и сахар — та же основа, что у нуклеотидов РНК.', 'A nitrogen base and a sugar, the same core as RNA nucleotides.'), cx - 180, cy, 50);
    for (let k = 0; k < 3; k++) {
      const off = k === 2 ? spent * 220 : 0;
      const x = cx - 50 + k * 80 + off;
      const y = cy - (k === 2 ? spent * 60 : 0);
      if (k > 0 && !(k === 2 && spent > 0.1)) {
        line(ctx, [[x - 80 + 28, cy - 4], [x - 28, cy - 4]], k === 0 ? '#D5D8DE' : C.amber, 3);
        line(ctx, [[x - 80 + 28, cy + 4], [x - 28, cy + 4]], k === 0 ? '#D5D8DE' : C.amber, 3);
      }
      if (k === 0) line(ctx, [[cx - 94, cy], [x - 28, cy]], '#D5D8DE', 3);
      ball(ctx, x, y, 28, '#F5A524');
      text(ctx, 'P', x, y, { size: 16, color: '#111214', weight: 700 });
      if (k === 2) f.hit(info('Концевой фосфат', 'Terminal phosphate', 'Его отщепление даёт ~40 кДж/моль энергии (макроэргическая связь).', 'Splitting it off releases ~40 kJ/mol (a high-energy bond).'), x, y, 28);
    }
    tag(ctx, spent > 0.5 ? 'АДФ + Ф' : 'АТФ', cx, 120, { color: C.amber, size: 16 });
    if (phase > 0.25 && phase < 0.5) {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        const r = 40 + ((t * 60) % 60);
        line(ctx, [[cx + 110 + Math.cos(a) * 30, cy + Math.sin(a) * 30], [cx + 110 + Math.cos(a) * r, cy + Math.sin(a) * r]], alpha(C.yellow, 0.8), 2);
      }
      tag(ctx, L('энергия → мышцы, синтез, транспорт', 'energy → muscles, synthesis, transport'), cx + 110, cy + 140, { color: C.yellow });
    }
    if (phase > 0.6 && phase < 0.9) {
      rrect(ctx, 720, 380, 190, 100, 50);
      ctx.fillStyle = alpha('#E5484D', 0.3);
      ctx.fill();
      text(ctx, L('митохондрия', 'mitochondrion'), 815, 430, { size: 13 });
      arrow(ctx, 760, 380, cx + 200, cy + 40, { color: C.green, width: 2.5 });
      tag(ctx, L('энергия окисления глюкозы', 'energy from glucose'), 815, 500, { color: C.green });
    }
  },
};

function activity(T: number, ph: number) {
  const temp = T < 37 ? Math.pow(2, (T - 37) / 10) : Math.max(0, 1 - Math.pow((T - 37) / 18, 2));
  const phK = Math.exp(-(((ph - 7) / 2) ** 2));
  return clamp(temp * phK);
}

/* ================= the human body: skin, sleep, hormones, hearing ================= */

export const bodySystems: SimDef = {
  id: 'body_systems',
  title: tx('Регуляция организма', 'Body regulation'),
  modes: [
    { id: 'skin', label: tx('Кожа и терморегуляция', 'Skin and temperature') },
    { id: 'insulin', label: tx('Гормоны: инсулин', 'Hormones: insulin') },
    { id: 'sleep', label: tx('Сон', 'Sleep') },
    { id: 'hearing', label: tx('Слух', 'Hearing') },
  ],
  duration: (m) => (m === 'sleep' ? 16 : 12),
  loop: false,
  params: (m) =>
    m === 'skin'
      ? [{ id: 'T', label: tx('Температура воздуха', 'Air temperature'), min: -10, max: 40, step: 1, value: 32, unit: '°C' }]
      : m === 'insulin'
        ? [{ id: 'diabetes', label: tx('Инсулина: 1 — норма, 0 — диабет I типа', 'Insulin: 1 normal, 0 type 1 diabetes'), min: 0, max: 1, step: 1, value: 1 }]
        : m === 'hearing'
          ? [{ id: 'freq', label: tx('Частота звука', 'Sound frequency'), min: 20, max: 20000, step: 20, value: 1000, unit: 'Гц' }]
          : [],
  stages: (m) =>
    m === 'skin'
      ? [
          { t: 0, label: tx('Слои кожи', 'Skin layers'), text: tx('Эпидермис (защита, ороговевает), дерма (сосуды, нервы, железы, волосы), подкожная клетчатка (жир — теплоизоляция и запас).', 'Epidermis (protection, keratinises), dermis (vessels, nerves, glands, hair) and the fatty hypodermis (insulation and reserves).') },
          { t: 4, label: tx('Жарко', 'Hot'), text: tx('В жару сосуды расширяются (кожа краснеет, отдаёт тепло), потовые железы выделяют пот — испарение охлаждает.', 'In the heat vessels widen (skin reddens and loses heat) and sweat glands release sweat; evaporation cools.') },
          { t: 8, label: tx('Холодно', 'Cold'), text: tx('На холоде сосуды сужаются (кожа бледнеет), «гусиная кожа» — мышцы поднимают волосы, дрожь даёт тепло. Сдвинь температуру.', 'In the cold vessels narrow (skin goes pale), goosebumps raise hairs, and shivering makes heat. Move the temperature.') },
        ]
      : m === 'insulin'
        ? [
            { t: 0, label: tx('Еда', 'A meal'), text: tx('После еды глюкоза всасывается в кровь — её уровень растёт.', 'After a meal glucose is absorbed into the blood and its level rises.') },
            { t: 2, label: tx('Инсулин', 'Insulin'), text: tx('Поджелудочная железа выделяет инсулин. Он «открывает» клетки для глюкозы, а печень запасает её в виде гликогена.', 'The pancreas releases insulin, which lets cells take in glucose; the liver stores it as glycogen.') },
            { t: 6, label: tx('Обратная связь', 'Feedback'), text: tx('Глюкоза вернулась к норме (~5 ммоль/л) — выделение инсулина падает. Это отрицательная обратная связь. При диабете I типа инсулина нет — сахар остаётся высоким.', 'Glucose returns to normal (~5 mmol/L) and insulin release falls: negative feedback. In type 1 diabetes there’s no insulin, so sugar stays high.') },
          ]
        : m === 'sleep'
          ? [
              { t: 0, label: tx('Засыпание', 'Falling asleep'), text: tx('Ночь — это 4–6 циклов по ~90 минут.', 'A night is 4–6 cycles of about 90 minutes.') },
              { t: 2, label: tx('Медленный сон', 'Deep sleep'), text: tx('Глубокий медленный сон — восстановление тела, рост, укрепление памяти.', 'Deep slow-wave sleep restores the body, supports growth and strengthens memory.') },
              { t: 5, label: tx('Быстрый сон', 'REM sleep'), text: tx('Быстрый (REM) сон: глаза двигаются, мозг активен, снятся сны. Под утро REM-фазы длиннее. Школьнику нужно 9–10 часов сна.', 'REM sleep: eyes dart, the brain is active and we dream. REM phases lengthen toward morning. Teenagers need 9–10 hours.') },
            ]
          : [
              { t: 0, label: tx('Звуковая волна', 'Sound wave'), text: tx('Звук — колебания воздуха. Ушная раковина собирает их в слуховой проход.', 'Sound is air vibrating. The outer ear funnels it into the ear canal.') },
              { t: 3, label: tx('Среднее ухо', 'Middle ear'), text: tx('Барабанная перепонка колеблется, косточки (молоточек, наковальня, стремечко) усиливают колебания в ~20 раз.', 'The eardrum vibrates and the ossicles (hammer, anvil, stirrup) amplify it about 20-fold.') },
              { t: 6, label: tx('Улитка', 'Cochlea'), text: tx('В улитке жидкость колеблет волосковые клетки — рецепторы. Высокие частоты ловит начало улитки, низкие — вершина. Сигнал идёт по слуховому нерву в височную долю.', 'In the cochlea, fluid moves hair cells, the receptors. High pitches register at the base and low at the tip. The auditory nerve carries the signal to the temporal lobe.') },
            ],
  metrics: ({ t, p, mode }) =>
    mode === 'insulin'
      ? [{ label: tx('Глюкоза крови', 'Blood glucose'), value: `${glucose(t, p.diabetes).toFixed(1)} ммоль/л`, tone: glucose(t, p.diabetes) > 7.8 ? 'bad' : 'good' }]
      : mode === 'skin'
        ? [{ label: tx('Температура тела', 'Body temperature'), value: '36,6 °C', tone: 'good' }]
        : [],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'skin') {
      const hot = clamp((p.T - 20) / 15);
      const cold = clamp((10 - p.T) / 15);
      // layers
      ctx.fillStyle = '#E8C4A0';
      ctx.fillRect(60, 120, 840, 50);
      ctx.fillStyle = '#D99A7A';
      ctx.fillRect(60, 170, 840, 200);
      ctx.fillStyle = '#F2E2A8';
      ctx.fillRect(60, 370, 840, 120);
      for (let i = 0; i < 30; i++) circle(ctx, 80 + hash(i) * 800, 390 + hash(i, 1) * 90, 12 + hash(i, 2) * 8, alpha('#FFF2C0', 0.7), alpha('#C9B07A', 0.6), 1);
      f.hitRect(info('Эпидермис', 'Epidermis', 'Наружный слой: клетки постоянно делятся внизу и отмирают сверху. Меланин защищает от УФ.', 'The outer layer: cells divide below and die off at the top. Melanin guards against UV.'), 60, 120, 840, 50);
      f.hitRect(info('Дерма', 'Dermis', 'Собственно кожа: сосуды, нервные окончания (рецепторы), потовые и сальные железы, волосяные луковицы.', 'The true skin: vessels, nerve endings, sweat and oil glands and hair roots.'), 60, 170, 840, 60);
      f.hitRect(info('Подкожная жировая клетчатка', 'Subcutaneous fat', 'Теплоизоляция, амортизация, запас энергии.', 'Insulation, cushioning and an energy store.'), 60, 370, 840, 120);
      // blood vessel width responds to temperature
      const vw = 8 + hot * 10 - cold * 5;
      line(ctx, [[60, 300], [900, 300]], mixColor('#B83A3A', '#E5484D', hot), vw);
      f.hit(info('Кровеносный сосуд', 'Blood vessel', 'Расширяется в жару (больше тепла отдаётся) и сужается на холоде.', 'Widens in heat to lose warmth and narrows in the cold.'), 480, 300, 14);
      // sweat gland
      ctx.strokeStyle = '#7FB3D5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(300, 120);
      ctx.lineTo(300, 330);
      ctx.stroke();
      for (let k = 0; k < 4; k++) circle(ctx, 300 + Math.cos(k * 1.6) * 14, 340 + Math.sin(k * 1.6) * 10, 9, undefined, '#7FB3D5', 3);
      f.hit(info('Потовая железа', 'Sweat gland', 'Выделяет пот: вода испаряется и уносит тепло. За жаркий день — до нескольких литров.', 'Releases sweat; as the water evaporates it carries heat away. Several litres on a hot day.'), 300, 340, 20);
      if (hot > 0.1)
        for (let k = 0; k < 6; k++) {
          const s = (t * 0.5 * hot + k / 6) % 1;
          circle(ctx, 300 + Math.sin(k) * 10, lerp(120, 40, s), 5, alpha('#9BD0F5', 1 - s));
        }
      // hair with erector muscle
      const up = cold;
      ctx.save();
      ctx.translate(600, 240);
      ctx.rotate(-0.6 + up * 0.55);
      line(ctx, [[0, 0], [0, -200]], '#5A3A2A', 4);
      ctx.restore();
      ctx.fillStyle = '#7A3A2A';
      ctx.beginPath();
      ctx.ellipse(600, 245, 14, 20, 0, 0, TAU);
      ctx.fill();
      line(ctx, [[600, 230], [650, 180]], up > 0.3 ? C.red : '#B86A6A', 4);
      f.hit(info('Волос и мышца', 'Hair and muscle', 'На холоде мышца сокращается и поднимает волос — «гусиная кожа».', 'In the cold a tiny muscle pulls the hair upright: goosebumps.'), 600, 240, 20);
      // receptors
      circle(ctx, 780, 200, 10, '#F5C842');
      f.hit(info('Рецепторы', 'Receptors', 'Нервные окончания чувствуют тепло, холод, прикосновение, боль.', 'Nerve endings sense heat, cold, touch and pain.'), 780, 200, 12);
      // shivering
      if (cold > 0.3) tag(ctx, L('дрожь — мышцы вырабатывают тепло', 'shivering: muscles make heat'), 480, 80, { color: C.sky });
      if (hot > 0.3) tag(ctx, L('потоотделение и расширение сосудов', 'sweating and widened vessels'), 480, 80, { color: C.orange });
      return;
    }
    if (mode === 'insulin') {
      const g = glucose(t, p.diabetes);
      const ins = p.diabetes ? insulinLevel(t) : 0;
      // pancreas
      ctx.fillStyle = '#E8B07A';
      ctx.beginPath();
      ctx.ellipse(200, 380, 120, 40, -0.2, 0, TAU);
      ctx.fill();
      f.hit(info('Поджелудочная железа', 'Pancreas', 'Островки Лангерганса выделяют инсулин (снижает сахар) и глюкагон (повышает).', 'Its islets of Langerhans release insulin (lowers sugar) and glucagon (raises it).'), 200, 380, 60);
      // blood vessel
      ctx.fillStyle = alpha('#B83A3A', 0.35);
      ctx.fillRect(40, 180, 460, 90);
      for (let i = 0; i < Math.round(g * 5); i++) {
        const x = 50 + ((hash(i) * 440 + t * 60) % 440);
        ctx.fillStyle = '#F5F0DC';
        ctx.beginPath();
        for (let k = 0; k < 6; k++) ctx.lineTo(x + Math.cos((k / 6) * TAU) * 6, 200 + hash(i, 1) * 50 + Math.sin((k / 6) * TAU) * 6);
        ctx.fill();
      }
      f.hitRect(info('Глюкоза в крови', 'Blood glucose', 'Норма натощак — 3,3–5,5 ммоль/л.', 'Normal fasting level is 3.3–5.5 mmol/L.'), 40, 180, 460, 90);
      for (let i = 0; i < Math.round(ins * 14); i++) {
        const s = (t * 0.3 + i / 14) % 1;
        circle(ctx, lerp(200, 100 + hash(i) * 380, s), lerp(340, 200 + hash(i, 2) * 60, s), 4, C.cyan);
      }
      tag(ctx, L('инсулин', 'insulin'), 330, 330, { color: C.cyan });
      chart(ctx, {
        x: 540, y: 40, w: 390, h: 460, xMax: 12, yMax: 14, title: L('Глюкоза крови, ммоль/л', 'Blood glucose, mmol/L'), xLabel: L('часы', 'hours'), upTo: t, cursor: t,
        series: [
          { color: C.amber, label: L('глюкоза', 'glucose'), fn: (x) => glucose(x, p.diabetes) },
          { color: C.cyan, label: L('инсулин', 'insulin'), fn: (x) => (p.diabetes ? insulinLevel(x) * 10 : 0) },
          { color: alpha(C.green, 0.6), label: L('норма', 'normal'), fn: () => 5.5, dash: [4, 4], width: 1.5 },
        ],
      });
      return;
    }
    if (mode === 'sleep') {
      const stages = (x: number) => {
        // hypnogram: 0 awake, 1 REM, 2 light, 3 deep
        const c = (x % 4) / 4;
        const cycle = Math.floor(x / 4);
        const deepMax = cycle < 2 ? 3 : 2;
        if (c < 0.2) return 2;
        if (c < 0.5) return deepMax;
        if (c < 0.65) return 2;
        if (c < 0.8 + cycle * 0.04) return 1;
        return 2;
      };
      const g = chart(ctx, {
        x: 40, y: 220, w: 890, h: 290, xMax: 16, yMin: 0, yMax: 3.4, title: L('Гипнограмма (сутки сжаты: 1 с ≈ 30 мин)', 'Hypnogram (1 s ≈ 30 min)'), upTo: t, cursor: t,
        series: [{ color: C.violet, points: Array.from({ length: 321 }, (_, i) => [i * 0.05, 3.2 - stages(i * 0.05)] as [number, number]), width: 2.5 }],
      });
      [[L('бодрствование', 'awake'), 3.2], [L('быстрый (REM)', 'REM'), 2.2], [L('поверхностный', 'light'), 1.2], [L('глубокий', 'deep'), 0.2]].forEach(([n, v]) => text(ctx, n as string, g.px + 8, g.Y(v as number) - 10, { size: 10.5, color: C.dim, align: 'left' }));
      // sleeping person
      const st = stages(t);
      rrect(ctx, 300, 120, 360, 60, 20);
      ctx.fillStyle = '#2A3A5A';
      ctx.fill();
      ball(ctx, 330, 130, 24, '#E8C4A0');
      if (st === 1) {
        line(ctx, [[322 + Math.sin(t * 20) * 3, 126], [330 + Math.sin(t * 20) * 3, 126]], '#3A2A1A', 2);
        tag(ctx, L('сон со сновидениями', 'dreaming'), 480, 80, { color: C.violet });
      } else text(ctx, 'z z z', 380 + Math.sin(t) * 6, 90 - (t * 20) % 30, { size: 16, color: alpha('#8FA4FF', 0.8) });
      f.hit(info('Спящий', 'Sleeper', 'Во сне мозг не «выключается»: он сортирует впечатления и закрепляет память.', 'The brain doesn’t switch off in sleep; it sorts the day’s impressions and consolidates memory.'), 480, 150, 40);
      return;
    }
    // hearing
    const freq = p.freq;
    const lam = clamp(1 - Math.log10(freq / 20) / 3, 0.05, 1) * 120 + 15;
    wave(ctx, 20, 230, 270, 30 * ease(t, 0, 1), lam, t * 10, C.sky, 2.5);
    tag(ctx, `${freq} ${L('Гц', 'Hz')}`, 110, 220, { color: C.sky });
    // outer ear + canal
    ctx.strokeStyle = '#E8C4A0';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(250, 270, 70, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();
    ctx.fillStyle = '#3A2A28';
    ctx.fillRect(250, 255, 140, 30);
    f.hit(info('Наружное ухо', 'Outer ear', 'Ушная раковина и слуховой проход собирают и проводят звук.', 'The pinna and ear canal collect and channel sound.'), 250, 270, 40);
    // eardrum
    const drum = Math.sin(t * Math.min(40, freq / 50)) * 6 * ease(t, 2, 3);
    line(ctx, [[392 + drum, 235], [392 + drum, 305]], '#F2C0A0', 4);
    f.hit(info('Барабанная перепонка', 'Eardrum', 'Тонкая перепонка колеблется в такт звуку.', 'A thin membrane that vibrates with the sound.'), 392, 270, 16);
    // ossicles
    const o = drum * 0.6;
    ball(ctx, 420 + o, 255, 10, '#E8E4D8');
    ball(ctx, 445 + o, 270, 9, '#E8E4D8');
    ball(ctx, 470 + o, 285, 8, '#E8E4D8');
    line(ctx, [[420 + o, 255], [470 + o, 285]], '#E8E4D8', 4);
    f.hit(info('Слуховые косточки', 'Ossicles', 'Молоточек, наковальня и стремечко — самые маленькие кости тела; усиливают колебания.', 'Hammer, anvil and stirrup, the body’s smallest bones, amplify the vibrations.'), 445, 270, 26);
    // cochlea (spiral) with resonance place
    const cx = 620;
    const cy = 280;
    const place = clamp(Math.log10(freq / 20) / 3); // 1 = base (high), 0 = apex (low)
    for (let a = 0; a < TAU * 2.5; a += 0.05) {
      const r = 110 - a * 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const pos = 1 - a / (TAU * 2.5);
      const active = Math.exp(-(((pos - place) / 0.08) ** 2)) * ease(t, 5, 6.5);
      circle(ctx, x, y, 7 + active * 6, mixColor('#8E4EC6', '#FFD60A', active));
    }
    f.hit(info('Улитка', 'Cochlea', 'Спиральный канал внутреннего уха с рецепторами — волосковыми клетками. Ухо человека слышит 20–20 000 Гц.', 'The spiral inner-ear tube lined with hair-cell receptors. Humans hear 20–20,000 Hz.'), cx, cy, 80);
    // auditory nerve
    if (t > 7) {
      line(ctx, [[cx + 100, cy + 20], [900, 200]], C.yellow, 3);
      for (let k = 0; k < 4; k++) {
        const s = ((t - 7) * 0.8 + k / 4) % 1;
        circle(ctx, lerp(cx + 100, 900, s), lerp(cy + 20, 200, s), 5, C.yellow);
      }
      tag(ctx, L('слуховой нерв → мозг', 'auditory nerve → brain'), 820, 170, { color: C.yellow });
    }
  },
};

function glucose(t: number, insulin: number) {
  const meal = 7 * (ease(t, 0.5, 2.5) - (insulin ? ease(t, 2.5, 7) * 0.95 : ease(t, 3, 12) * 0.1));
  return 5 + meal;
}
function insulinLevel(t: number) {
  return ease(t, 1.2, 3) * (1 - ease(t, 5, 8));
}

/* ================= metamorphosis and worm movement ================= */

export const development: SimDef = {
  id: 'development',
  title: tx('Развитие животных', 'Animal development'),
  modes: [
    { id: 'butterfly', label: tx('Бабочка', 'Butterfly') },
    { id: 'frog', label: tx('Лягушка', 'Frog') },
    { id: 'worm', label: tx('Дождевой червь', 'Earthworm') },
  ],
  duration: 14,
  loop: false,
  stages: (m) =>
    m === 'butterfly'
      ? [
          { t: 0, label: tx('Яйцо', 'Egg'), text: tx('Бабочка откладывает яйца на кормовое растение.', 'The butterfly lays eggs on a food plant.') },
          { t: 2.5, label: tx('Гусеница', 'Caterpillar'), text: tx('Личинка (гусеница) только ест и растёт, несколько раз линяя.', 'The larva (caterpillar) just eats and grows, moulting several times.') },
          { t: 6.5, label: tx('Куколка', 'Pupa'), text: tx('В куколке тело гусеницы перестраивается почти полностью.', 'Inside the pupa the caterpillar’s body is almost completely rebuilt.') },
          { t: 10, label: tx('Бабочка', 'Butterfly'), text: tx('Взрослая бабочка — имаго. Это полное превращение: личинка не похожа на взрослое. У кузнечиков — неполное (нет стадии куколки).', 'The adult, or imago. This is complete metamorphosis: the larva looks nothing like the adult. Grasshoppers have incomplete metamorphosis, with no pupa.') },
        ]
      : m === 'frog'
        ? [
            { t: 0, label: tx('Икра', 'Spawn'), text: tx('Земноводные размножаются в воде: икра без защитных оболочек.', 'Amphibians breed in water; the eggs lack protective shells.') },
            { t: 2.5, label: tx('Головастик', 'Tadpole'), text: tx('Головастик похож на рыбу: жабры, хвост, двухкамерное сердце, боковая линия.', 'The tadpole is fish-like: gills, a tail, a two-chambered heart and a lateral line.') },
            { t: 6.5, label: tx('Лапы', 'Legs'), text: tx('Появляются задние, затем передние лапы, развиваются лёгкие.', 'First the hind legs, then the front legs appear, and lungs develop.') },
            { t: 10, label: tx('Лягушка', 'Frog'), text: tx('Хвост рассасывается — лягушка выходит на сушу. Сходство головастика с рыбой — довод в пользу происхождения земноводных от рыб.', 'The tail is absorbed and the frog moves onto land. The tadpole’s fish-likeness is evidence that amphibians came from fish.') },
          ]
        : [
            { t: 0, label: tx('Сегменты', 'Segments'), text: tx('Тело кольчатого червя состоит из одинаковых сегментов, на каждом — щетинки.', 'An annelid’s body is made of identical segments, each with bristles.') },
            { t: 3, label: tx('Перистальтика', 'Peristalsis'), text: tx('Кольцевые мышцы сжимают сегменты (тело вытягивается), продольные — укорачивают. Волна сокращений бежит от головы к хвосту.', 'Circular muscles squeeze segments (the body stretches) and longitudinal muscles shorten them. A wave runs from head to tail.') },
            { t: 8, label: tx('Почва', 'Soil'), text: tx('Щетинки цепляются за почву. Черви рыхлят и удобряют почву — Дарвин назвал их главными пахарями Земли.', 'The bristles grip the soil. Worms loosen and enrich the soil; Darwin called them Earth’s chief ploughmen.') },
          ],
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'butterfly') {
      line(ctx, [[60, 330], [900, 330]], '#3A6A2A', 8);
      for (let k = 0; k < 6; k++) {
        const x = 100 + k * 150;
        ctx.fillStyle = '#4C9A3F';
        ctx.beginPath();
        ctx.ellipse(x, 300, 60, 22, -0.3, 0, TAU);
        ctx.fill();
      }
      if (t < 2.5) {
        for (let i = 0; i < 5; i++) ball(ctx, 400 + i * 16, 286, 6, '#F2E8C0');
        f.hit(info('Яйца', 'Eggs', 'Крошечные яйца приклеены к листу.', 'Tiny eggs glued to a leaf.'), 430, 286, 30);
      } else if (t < 6.5) {
        const grow = ease(t, 2.5, 6);
        const n = 10;
        const len = 60 + grow * 160;
        const x0 = 300 + ((t - 2.5) * 40) % 200;
        for (let i = 0; i < n; i++) {
          const x = x0 + (i / n) * len;
          const y = 300 - Math.abs(Math.sin(t * 3 + i * 0.6)) * 10;
          ball(ctx, x, y, 8 + grow * 8, i % 2 ? '#7CC36A' : '#A6D96A');
        }
        ball(ctx, x0 + len + 8, 296, 10 + grow * 8, '#3A6A2A');
        f.hit(info('Гусеница', 'Caterpillar', 'Грызущий ротовой аппарат, растёт в тысячи раз.', 'Chewing mouthparts; it grows thousands of times bigger.'), x0 + len / 2, 300, 40);
      } else if (t < 10) {
        line(ctx, [[480, 330], [480, 360]], '#8C6A4A', 2);
        ctx.fillStyle = mixColor('#7CC36A', '#8C6A4A', ease(t, 6.5, 8));
        ctx.beginPath();
        ctx.ellipse(480, 410, 26, 52, 0, 0, TAU);
        ctx.fill();
        f.hit(info('Куколка', 'Pupa', 'Неподвижна снаружи, но внутри идёт полная перестройка органов.', 'Still on the outside, but inside the organs are rebuilt completely.'), 480, 410, 40);
      } else {
        const fly = ease(t, 11, 14);
        const bx = lerp(480, 760, fly);
        const by = lerp(420, 120, fly) + Math.sin(t * 4) * 10;
        const flap = Math.abs(Math.sin(t * 8));
        for (const d of [-1, 1]) {
          ctx.fillStyle = '#F5A524';
          ctx.beginPath();
          ctx.ellipse(bx + d * 40 * (0.4 + flap * 0.6), by - 14, 42 * (0.4 + flap * 0.6), 30, d * 0.4, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#E5484D';
          ctx.beginPath();
          ctx.ellipse(bx + d * 28 * (0.4 + flap * 0.6), by + 22, 26 * (0.4 + flap * 0.6), 20, d * 0.6, 0, TAU);
          ctx.fill();
        }
        rrect(ctx, bx - 5, by - 34, 10, 70, 5);
        ctx.fillStyle = '#2A2622';
        ctx.fill();
        f.hit(info('Имаго', 'Imago', 'Взрослая бабочка с сосущим хоботком питается нектаром и откладывает яйца.', 'The adult sips nectar through a coiled proboscis and lays eggs.'), bx, by, 50);
      }
      const names = [L('яйцо', 'egg'), L('личинка', 'larva'), L('куколка', 'pupa'), L('имаго', 'adult')];
      names.forEach((n, i) => tag(ctx, n, 160 + i * 210, 500, { color: t >= [0, 2.5, 6.5, 10][i] && t < [2.5, 6.5, 10, 99][i] ? C.amber : C.faint, size: 13 }));
      return;
    }
    if (mode === 'frog') {
      ctx.fillStyle = alpha('#2F6FB5', 0.3);
      ctx.fillRect(0, 200, w, h - 200);
      f.hitRect(info('Пруд', 'Pond', 'Развитие земноводных связано с водой.', 'Amphibian development depends on water.'), 0, 480, 100, 40);
      const x = 480;
      const y = 340;
      if (t < 2.5) {
        for (let i = 0; i < 20; i++) {
          circle(ctx, x - 60 + hash(i) * 120, y - 30 + hash(i, 1) * 60, 12, alpha('#D5E8F5', 0.4), alpha('#D5E8F5', 0.6), 1);
          circle(ctx, x - 60 + hash(i) * 120, y - 30 + hash(i, 1) * 60, 4, '#1E2024');
        }
        f.hit(info('Икра', 'Spawn', 'Икринки в студенистой оболочке.', 'Eggs in a jelly coat.'), x, y, 50);
      } else {
        const k = ease(t, 2.5, 13);
        const legsBack = ease(t, 6.5, 8.5);
        const legsFront = ease(t, 8, 10);
        const tail = 1 - ease(t, 10, 12.5);
        const bodyR = 22 + k * 30;
        const sx = x + Math.sin(t * 2) * 60 * tail;
        const sy = lerp(y, 220, ease(t, 11.5, 13.5));
        // tail
        if (tail > 0.02) {
          const pts: [number, number][] = [];
          for (let s = 0; s <= 1; s += 0.05) pts.push([sx - bodyR - s * 90 * tail, sy + Math.sin(t * 10 - s * 6) * 10 * s]);
          line(ctx, pts, '#4A5A3A', 10 * tail);
        }
        if (legsBack > 0) {
          line(ctx, [[sx - bodyR * 0.6, sy + bodyR * 0.6], [sx - bodyR * 1.4, sy + bodyR * (0.6 + legsBack)]], '#5FA84C', 8);
          line(ctx, [[sx - bodyR * 0.6, sy - bodyR * 0.6], [sx - bodyR * 1.4, sy - bodyR * (0.6 + legsBack)]], '#5FA84C', 8);
        }
        if (legsFront > 0) {
          line(ctx, [[sx + bodyR * 0.5, sy + bodyR * 0.6], [sx + bodyR * 1.0, sy + bodyR * (0.6 + legsFront * 0.6)]], '#5FA84C', 6);
          line(ctx, [[sx + bodyR * 0.5, sy - bodyR * 0.6], [sx + bodyR * 1.0, sy - bodyR * (0.6 + legsFront * 0.6)]], '#5FA84C', 6);
        }
        ball(ctx, sx, sy, bodyR, mixColor('#4A5A3A', '#5FA84C', k));
        circle(ctx, sx + bodyR * 0.6, sy - bodyR * 0.5, 4 + k * 3, '#111214');
        if (t < 6.5) for (let g = 0; g < 3; g++) line(ctx, [[sx + bodyR * 0.2, sy + bodyR * 0.8], [sx + bodyR * 0.2 + g * 6, sy + bodyR * 1.2]], '#D96A6A', 2);
        f.hit(t < 10 ? info('Головастик', 'Tadpole', 'Дышит жабрами, плавает хвостом — как рыба.', 'Breathes with gills and swims with a tail, like a fish.') : info('Лягушка', 'Frog', 'Дышит лёгкими и кожей, трёхкамерное сердце.', 'Breathes through lungs and skin, with a three-chambered heart.'), sx, sy, bodyR + 10);
      }
      return;
    }
    // earthworm peristalsis
    ctx.fillStyle = '#3A2A1E';
    ctx.fillRect(0, 300, w, h - 300);
    for (let i = 0; i < 80; i++) circle(ctx, hash(i) * w, 310 + hash(i, 1) * 220, 2 + hash(i, 2) * 3, alpha('#6A4A2E', 0.7));
    const n = 30;
    const base = 120 + ((t * 25) % 300);
    let x = base;
    for (let i = n - 1; i >= 0; i--) {
      const phase = Math.sin(t * 3 + i * 0.45);
      const seg = 18 + phase * 6; // stretched (thin) vs contracted (thick)
      const r = 14 - phase * 4;
      x += seg;
      ball(ctx, x, 290, r, i === n - 1 ? '#D98A8A' : i === 8 ? '#E8A0A0' : '#C97070');
      if (i % 3 === 0) {
        line(ctx, [[x, 290 + r], [x - 4, 290 + r + 5]], '#8A5A5A', 1.5);
      }
    }
    f.hit(info('Дождевой червь', 'Earthworm', 'Кольчатый червь: замкнутая кровеносная система, брюшная нервная цепочка, дышит кожей.', 'An annelid with a closed circulatory system, a ventral nerve cord and skin breathing.'), base + 200, 290, 30);
    f.hit(info('Поясок', 'Clitellum', 'Утолщение, образующее кокон для яиц. Черви — гермафродиты.', 'A thickened band that forms the egg cocoon. Worms are hermaphrodites.'), base + 22 * 22, 290, 18);
    tag(ctx, L('волна сокращений', 'contraction wave'), 480, 230, { color: C.pink });
  },
};
