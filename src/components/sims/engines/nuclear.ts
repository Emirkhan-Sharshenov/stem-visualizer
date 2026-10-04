import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, rrect, SimDef, tag, TAU, text, tx, wave, wobble } from '../kit';

/* ---------- nucleus drawing ---------- */

function nucleus(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, r: number, seed = 0, glow = 0) {
  // packed protons (red) and neutrons (grey) in a rough sphere
  const k = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + seed;
    const rr = Math.sqrt((i + 0.5) / n) * r;
    ball(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, Math.max(3.5, (r / k) * 1.25), hash(i, seed) < 0.45 ? C.red : '#9EA4AE', i === 0 ? glow : 0);
  }
}

/* ---------- radioactivity, decay law, fission, fusion ---------- */

const HALF = 3; // seconds per half-life on the timeline

export const nuclear: SimDef = {
  id: 'nuclear',
  title: tx('Ядерная физика', 'Nuclear physics'),
  modes: [
    { id: 'decay', label: tx('Распад', 'Decay law') },
    { id: 'kinds', label: tx('α, β, γ', 'α, β, γ') },
    { id: 'fission', label: tx('Деление', 'Fission') },
    { id: 'fusion', label: tx('Синтез', 'Fusion') },
  ],
  duration: (m) => (m === 'decay' ? 15 : m === 'kinds' ? 12 : m === 'fission' ? 10 : 10),
  loop: false,
  params: (m) => (m === 'fission' ? [{ id: 'mod', label: tx('Регулирующие стержни (поглощают нейтроны)', 'Control rods (absorb neutrons)'), min: 0, max: 1, step: 0.1, value: 0.3, digits: 1 }] : []),
  stages: (m) =>
    m === 'decay'
      ? [
          { t: 0, label: tx('400 ядер', '400 nuclei'), text: tx('Каждое ядро распадается случайно — нельзя предсказать, какое и когда.', 'Each nucleus decays at random: there’s no telling which one, or when.') },
          { t: HALF, label: tx('T½', 'T½'), text: tx('Но за период полураспада распадается ровно половина — закон работает для множества ядер.', 'Yet in one half-life exactly half decay: the law works for large numbers of nuclei.') },
          { t: 2 * HALF, label: tx('2·T½', '2·T½'), text: tx('Осталась четверть. N = N₀·2^(−t/T). Для йода-131 T = 8 суток, для урана-238 — 4,5 млрд лет.', 'A quarter remains. N = N₀·2^(−t/T). Iodine-131 has T = 8 days; uranium-238 has 4.5 billion years.') },
          { t: 4 * HALF, label: tx('4·T½', '4·T½'), text: tx('Осталось 1/16. На этом основан радиоуглеродный метод датирования находок.', 'Only 1/16 left. Radiocarbon dating of finds relies on this.') },
        ]
      : m === 'kinds'
        ? [
            { t: 0, label: tx('α-распад', 'α decay'), text: tx('Ядро выбрасывает ядро гелия ⁴₂He: заряд уменьшается на 2, масса на 4. Останавливается листом бумаги.', 'The nucleus throws out a helium nucleus ⁴₂He: charge drops by 2 and mass by 4. A sheet of paper stops it.') },
            { t: 4, label: tx('β-распад', 'β decay'), text: tx('Нейтрон превращается в протон и вылетает электрон: заряд ядра +1. Задерживается алюминием в несколько мм.', 'A neutron turns into a proton and an electron flies out: the nuclear charge goes up by 1. A few mm of aluminium stops it.') },
            { t: 8, label: tx('γ-излучение', 'γ rays'), text: tx('Возбуждённое ядро сбрасывает энергию фотоном. Проникает дальше всех — нужен толстый слой свинца или бетона.', 'An excited nucleus sheds energy as a photon. It penetrates furthest and needs thick lead or concrete.') },
          ]
        : m === 'fission'
          ? [
              { t: 0, label: tx('Нейтрон', 'Neutron'), text: tx('Медленный нейтрон попадает в ядро урана-235.', 'A slow neutron hits a uranium-235 nucleus.') },
              { t: 1.2, label: tx('Деление', 'Splitting'), text: tx('Ядро вытягивается и раскалывается на два осколка, выбрасывая 2–3 нейтрона и ~200 МэВ энергии.', 'The nucleus stretches and splits into two fragments, releasing 2–3 neutrons and about 200 MeV.') },
              { t: 3, label: tx('Цепная реакция', 'Chain reaction'), text: tx('Новые нейтроны делят соседние ядра — реакция разрастается. В реакторе стержни поглощают лишние нейтроны и держат k = 1.', 'The new neutrons split more nuclei and the reaction grows. In a reactor, control rods soak up spare neutrons to hold k = 1.') },
            ]
          : [
              { t: 0, label: tx('Дейтерий и тритий', 'Deuterium and tritium'), text: tx('Ядра одноимённо заряжены и отталкиваются. Чтобы сблизиться, нужны миллионы градусов.', 'The nuclei are both positive and repel. Getting them close takes millions of degrees.') },
              { t: 3, label: tx('Слияние', 'Fusion'), text: tx('На расстоянии ~10⁻¹⁵ м включаются ядерные силы — ядра сливаются в гелий.', 'At about 10⁻¹⁵ m the nuclear force takes over and they merge into helium.') },
              { t: 5, label: tx('Энергия', 'Energy'), text: tx('Масса продуктов меньше на Δm, выделяется E = Δmc² = 17,6 МэВ. Так светят звёзды; на Земле это пытаются повторить в токамаках.', 'The products weigh Δm less, releasing E = Δmc² = 17.6 MeV. Stars shine this way, and tokamaks try to do it on Earth.') },
            ],
  metrics: ({ t, mode }) => {
    if (mode !== 'decay') return [];
    const left = countLeft(t);
    return [
      { label: tx('Осталось ядер', 'Nuclei left'), value: `${left} / 400` },
      { label: tx('Теория N₀·2^(−t/T)', 'Theory N₀·2^(−t/T)'), value: `${(400 * Math.pow(2, -t / HALF)).toFixed(0)}` },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'decay') {
      for (let i = 0; i < 400; i++) {
        const x = 70 + (i % 20) * 22;
        const y = 70 + Math.floor(i / 20) * 22;
        const td = decayTime(i);
        const decayed = t >= td;
        circle(ctx, x, y, 7.5, decayed ? '#3A3D45' : C.amber);
        if (!decayed && td - t < 0.15) circle(ctx, x, y, 12, alpha(C.yellow, 0.4));
        if (decayed && t - td < 0.4) circle(ctx, x, y, 7.5 + (t - td) * 30, undefined, alpha(C.green, 1 - (t - td) / 0.4), 2);
      }
      f.hitRect(info('Радиоактивные ядра', 'Radioactive nuclei', 'Жёлтые — ещё не распались, серые — уже распались (превратились в другие ядра).', 'Yellow ones haven’t decayed yet; grey ones have turned into other nuclei.'), 60, 60, 440, 440);
      chart(ctx, {
        x: 540, y: 70, w: 390, h: 400, xMax: 15, yMax: 420, title: L('Число ядер N(t)', 'Number of nuclei N(t)'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
        series: [
          { color: alpha(C.sky, 0.7), label: L('теория', 'theory'), fn: (x) => 400 * Math.pow(2, -x / HALF), dash: [5, 4] },
          { color: C.amber, label: L('опыт', 'experiment'), fn: (x) => countLeft(x) },
        ],
      });
      return;
    }
    if (mode === 'kinds') {
      const kind = t < 4 ? 0 : t < 8 ? 1 : 2;
      const lt = t - kind * 4;
      const nx = 160;
      const ny = 270;
      nucleus(ctx, nx, ny, 40, 46, kind, lt < 0.6 ? 1.5 : 0);
      f.hit(info('Радиоактивное ядро', 'Radioactive nucleus', 'Нестабильное ядро, которое самопроизвольно испускает частицы или кванты.', 'An unstable nucleus that spontaneously emits particles or rays.'), nx, ny, 48);
      // barriers: paper, aluminium, lead
      const bars = [
        { x: 430, wdt: 6, c: '#E8E4D8', n: L('бумага', 'paper') },
        { x: 590, wdt: 16, c: '#B5B8C0', n: L('алюминий', 'aluminium') },
        { x: 760, wdt: 50, c: '#5A5D66', n: L('свинец', 'lead') },
      ];
      bars.forEach((b) => {
        rrect(ctx, b.x, 120, b.wdt, 300, 2);
        ctx.fillStyle = b.c;
        ctx.fill();
        text(ctx, b.n, b.x + b.wdt / 2, 440, { size: 12, color: C.dim });
      });
      const stopX = [430, 590, 760][kind];
      const x = Math.min(stopX - 4, nx + 60 + lt * 220);
      const label = ['α', 'β', 'γ'][kind];
      const col = [C.amber, C.cyan, C.green][kind];
      if (kind === 0) {
        ball(ctx, x, ny - 6, 8, C.red);
        ball(ctx, x + 10, ny + 4, 8, '#9EA4AE');
        ball(ctx, x, ny + 8, 8, '#9EA4AE');
        ball(ctx, x + 10, ny - 8, 8, C.red);
      } else if (kind === 1) ball(ctx, x, ny, 6, C.cyan, 1);
      else wave(ctx, Math.max(nx + 60, x - 80), x, ny, 10, 16, t * 20, C.green, 2.5);
      tag(ctx, label, x, ny - 40, { color: col, size: 14 });
      f.hit(
        [info('α-частица', 'Alpha particle', 'Ядро гелия: 2 протона + 2 нейтрона. Сильно ионизирует, но пробег в воздухе — всего несколько см.', 'A helium nucleus: 2 protons + 2 neutrons. Strongly ionising but travels only a few cm in air.'),
          info('β-частица', 'Beta particle', 'Быстрый электрон, рождённый в ядре при превращении нейтрона в протон.', 'A fast electron born in the nucleus when a neutron turns into a proton.'),
          info('γ-квант', 'Gamma ray', 'Фотон очень высокой энергии, электромагнитное излучение без заряда и массы покоя.', 'A very high-energy photon: electromagnetic radiation with no charge or rest mass.')][kind],
        x, ny, 16,
      );
      tag(ctx, [L('α: ²²⁶Ra → ²²²Rn + ⁴He', 'α: ²²⁶Ra → ²²²Rn + ⁴He'), L('β: ¹⁴C → ¹⁴N + e⁻', 'β: ¹⁴C → ¹⁴N + e⁻'), L('γ: ядро* → ядро + γ', 'γ: nucleus* → nucleus + γ')][kind], 480, 60, { color: col, size: 14 });
      return;
    }
    if (mode === 'fission') {
      // first event, then a chain grid
      const ux = 300;
      const uy = 270;
      if (t < 3) {
        const nx = lerp(40, ux - 50, ease(t, 0, 1));
        if (t < 1.1) ball(ctx, nx, uy, 7, '#D5D8DE');
        const split = ease(t, 1.1, 2.2);
        if (split <= 0) {
          nucleus(ctx, ux, uy, 90, 60, 1);
        } else {
          const stretch = 1 + split * 0.6;
          if (split < 0.4) {
            ctx.save();
            ctx.translate(ux, uy);
            ctx.scale(stretch, 1 / stretch);
            nucleus(ctx, 0, 0, 90, 60, 1);
            ctx.restore();
          } else {
            const d = (split - 0.4) * 300;
            nucleus(ctx, ux - 30 - d, uy - d * 0.4, 50, 44, 2);
            nucleus(ctx, ux + 30 + d, uy + d * 0.4, 40, 40, 3);
            for (let k = 0; k < 3; k++) {
              const a = -0.6 + k * 0.9;
              ball(ctx, ux + Math.cos(a) * d * 1.6, uy + Math.sin(a) * d * 1.6 - 40, 7, '#D5D8DE');
            }
            circle(ctx, ux, uy, d * 1.2, undefined, alpha(C.yellow, clamp(1 - d / 180)), 3);
          }
        }
        f.hit(info('Уран-235', 'Uranium-235', '92 протона и 143 нейтрона. Захватив медленный нейтрон, делится на два ядра-осколка (например, барий и криптон).', '92 protons and 143 neutrons. After capturing a slow neutron it splits into two fragments, such as barium and krypton.'), ux, uy, 60);
        tag(ctx, '²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n + 200 МэВ', 480, 470, { color: C.amber });
        return;
      }
      // chain reaction on a grid of nuclei
      const cols = 16;
      const rows = 9;
      const sp = 50;
      const x0 = 480 - ((cols - 1) * sp) / 2;
      const y0 = 70;
      const k = 3 * (1 - p.mod) * 0.9 + 0.1; // multiplication factor
      const gen = Math.floor((t - 3) / 0.8);
      const prog = ((t - 3) % 0.8) / 0.8;
      const split = new Set<number>();
      let frontier = [Math.floor(rows / 2) * cols + Math.floor(cols / 2)];
      split.add(frontier[0]);
      const history: number[][] = [frontier];
      for (let g = 0; g < gen; g++) {
        const next: number[] = [];
        frontier.forEach((id, j) => {
          const children = Math.floor(k + hash(id, g, j));
          for (let c = 0; c < children; c++) {
            const r = Math.floor(id / cols) + Math.round((hash(id, c, 9) - 0.5) * 3);
            const cc = (id % cols) + Math.round((hash(id, c, 10) - 0.5) * 3);
            const nid = r * cols + cc;
            if (r >= 0 && r < rows && cc >= 0 && cc < cols && !split.has(nid)) {
              split.add(nid);
              next.push(nid);
            }
          }
        });
        frontier = next;
        history.push(next);
      }
      for (let i = 0; i < cols * rows; i++) {
        const x = x0 + (i % cols) * sp;
        const y = y0 + Math.floor(i / cols) * sp;
        const s = split.has(i);
        if (s) {
          circle(ctx, x - 7, y, 8, alpha(C.orange, 0.8));
          circle(ctx, x + 7, y, 7, alpha(C.amber, 0.8));
        } else ball(ctx, x, y, 12, '#6B7080');
      }
      const lastGen = history[history.length - 1];
      lastGen.forEach((id) => circle(ctx, x0 + (id % cols) * sp, y0 + Math.floor(id / cols) * sp, 10 + prog * 40, undefined, alpha(C.yellow, 1 - prog), 2));
      f.hitRect(info('Ядра урана', 'Uranium nuclei', 'Серые — целые, оранжевые пары — уже поделившиеся ядра (осколки).', 'Grey ones are whole; orange pairs are nuclei that have already split.'), x0 - 20, y0 - 20, (cols - 1) * sp + 40, (rows - 1) * sp + 40);
      // control rods
      for (let r = 0; r < 4; r++) {
        const rx = x0 + sp * 1.5 + r * sp * 4;
        const depth = p.mod * (rows * sp);
        rrect(ctx, rx - 5, 40, 10, depth, 3);
        ctx.fillStyle = '#2B2D33';
        ctx.fill();
        ctx.strokeStyle = '#8C8F98';
        ctx.stroke();
      }
      tag(ctx, `${L('поделилось', 'split')}: ${split.size}  ·  k ≈ ${k.toFixed(2)}`, 480, 510, { color: k > 1.05 ? C.red : k < 0.95 ? C.sky : C.green, size: 13 });
      return;
    }
    // fusion D + T
    const meet = ease(t, 0, 3);
    const fuse = ease(t, 3, 3.6);
    const cx = 480;
    const cy = 260;
    if (fuse < 1) {
      const dx = lerp(-330, -22, meet) * (1 - fuse);
      ctx.globalAlpha = 1 - fuse * 0.5;
      ball(ctx, cx + dx - 8, cy, 13, C.red);
      ball(ctx, cx + dx + 8, cy, 13, '#9EA4AE');
      ball(ctx, cx - dx - 12, cy - 6, 13, C.red);
      ball(ctx, cx - dx + 6, cy + 8, 13, '#9EA4AE');
      ball(ctx, cx - dx + 6, cy - 12, 13, '#9EA4AE');
      ctx.globalAlpha = 1;
      tag(ctx, L('дейтерий ²H', 'deuterium ²H'), cx + dx, cy - 50, { color: C.sky });
      tag(ctx, L('тритий ³H', 'tritium ³H'), cx - dx, cy - 50, { color: C.sky });
      if (meet < 0.95) {
        arrow(ctx, cx + dx + 30, cy + 40, cx + dx - 10, cy + 40, { color: alpha(C.red, 0.7), width: 2 });
        arrow(ctx, cx - dx - 30, cy + 40, cx - dx + 10, cy + 40, { color: alpha(C.red, 0.7), width: 2 });
        tag(ctx, L('кулоновское отталкивание', 'Coulomb repulsion'), cx, cy + 80, { color: C.red });
      }
    }
    if (fuse > 0) {
      const d = ease(t, 3.6, 7) * 300;
      circle(ctx, cx, cy, 20 + d * 0.8, undefined, alpha(C.yellow, clamp(1 - d / 300)), 4);
      ball(ctx, cx - d * 0.35 - 8, cy - 8, 12, C.red);
      ball(ctx, cx - d * 0.35 + 8, cy + 8, 12, C.red);
      ball(ctx, cx - d * 0.35 + 8, cy - 8, 12, '#9EA4AE');
      ball(ctx, cx - d * 0.35 - 8, cy + 8, 12, '#9EA4AE');
      ball(ctx, cx + d, cy + d * 0.15, 9, '#D5D8DE');
      if (d > 40) {
        tag(ctx, L('гелий ⁴He', 'helium ⁴He'), cx - d * 0.35, cy - 46, { color: C.amber });
        tag(ctx, L('нейтрон', 'neutron'), cx + d, cy + d * 0.15 - 30, { color: C.text });
      }
      f.hit(info('Ядро гелия', 'Helium nucleus', 'Продукт синтеза. Энергия связи на нуклон у гелия гораздо выше, чем у водорода, — отсюда выделение энергии.', 'The fusion product. Helium’s binding energy per nucleon is much higher than hydrogen’s, hence the energy release.'), cx - d * 0.35, cy, 24);
    }
    tag(ctx, '²H + ³H → ⁴He + n + 17,6 МэВ', 480, 470, { color: C.amber, size: 14 });
  },
};

/** each nucleus has a fixed random decay moment, so the picture is the same when rewound */
function decayTime(i: number) {
  return (-Math.log(1 - hash(i, 77)) * HALF) / Math.LN2;
}
function countLeft(t: number) {
  let n = 0;
  for (let i = 0; i < 400; i++) if (decayTime(i) > t) n++;
  return n;
}

/* ---------- binding energy & particles (static explorer with timeline highlight) ---------- */

export const nucleusStructure: SimDef = {
  id: 'nucleus_structure',
  title: tx('Ядро и частицы', 'Nucleus and particles'),
  modes: [
    { id: 'binding', label: tx('Энергия связи', 'Binding energy') },
    { id: 'quarks', label: tx('Кварки', 'Quarks') },
    { id: 'anti', label: tx('Аннигиляция', 'Annihilation') },
  ],
  duration: 10,
  loop: false,
  stages: (m) =>
    m === 'binding'
      ? [
          { t: 0, label: tx('Нуклоны', 'Nucleons'), text: tx('Ядро состоит из протонов и нейтронов, их держат ядерные силы — самые сильные, но короткодействующие.', 'A nucleus is made of protons and neutrons held by the nuclear force, the strongest but shortest-ranged.') },
          { t: 3, label: tx('Дефект масс', 'Mass defect'), text: tx('Масса ядра меньше суммы масс нуклонов. Разница Δm·c² — энергия связи.', 'A nucleus weighs less than its nucleons separately. The difference Δm·c² is the binding energy.') },
          { t: 6, label: tx('Кривая', 'The curve'), text: tx('Максимум у железа. Лёгкие ядра выгодно сливать, тяжёлые — делить: оба процесса выделяют энергию.', 'It peaks at iron. Light nuclei release energy by fusing, heavy ones by splitting.') },
        ]
      : m === 'quarks'
        ? [
            { t: 0, label: tx('Протон', 'Proton'), text: tx('Протон = два u-кварка (+2/3) и один d-кварк (−1/3): заряд +1.', 'A proton is two up quarks (+2/3) and one down quark (−1/3): charge +1.') },
            { t: 4, label: tx('Нейтрон', 'Neutron'), text: tx('Нейтрон = u + d + d: заряд 0. Кварки связаны глюонами и поодиночке не встречаются.', 'A neutron is u + d + d: charge 0. Gluons bind the quarks, which are never found alone.') },
          ]
        : [
            { t: 0, label: tx('Электрон и позитрон', 'Electron and positron'), text: tx('Позитрон — античастица электрона: та же масса, противоположный заряд.', 'The positron is the electron’s antiparticle: same mass, opposite charge.') },
            { t: 4, label: tx('Аннигиляция', 'Annihilation'), text: tx('При встрече они исчезают, превращаясь в два γ-кванта: вся масса переходит в энергию E = mc². Используется в ПЭТ-томографии.', 'When they meet they vanish into two gamma rays: all the mass becomes energy, E = mc². PET scanners use this.') },
          ],
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'binding') {
      const A = [1, 2, 3, 4, 6, 7, 12, 16, 20, 40, 56, 80, 100, 120, 140, 160, 180, 200, 238];
      const E = [0, 1.1, 2.6, 7.07, 5.3, 5.6, 7.68, 7.98, 8.03, 8.55, 8.79, 8.71, 8.6, 8.5, 8.4, 8.25, 8.1, 7.95, 7.57];
      const g = chart(ctx, {
        x: 420, y: 60, w: 510, h: 420, xMax: 240, yMax: 9.5, title: L('Удельная энергия связи, МэВ/нуклон', 'Binding energy per nucleon, MeV'), xLabel: L('массовое число A', 'mass number A'),
        upTo: lerp(0, 240, ease(t, 0.5, 6)),
        series: [{ color: C.amber, points: A.map((a, i) => [a, E[i]] as [number, number]), width: 3 }],
      });
      if (t > 6) {
        circle(ctx, g.X(56), g.Y(8.79), 6, C.red);
        tag(ctx, 'Fe-56', g.X(56), g.Y(8.79) - 20, { color: C.red });
        arrow(ctx, g.X(10), g.Y(4), g.X(45), g.Y(7.5), { color: C.green, width: 2 });
        tag(ctx, L('синтез', 'fusion'), g.X(20), g.Y(3.2), { color: C.green });
        arrow(ctx, g.X(230), g.Y(6.6), g.X(120), g.Y(7.9), { color: C.orange, width: 2 });
        tag(ctx, L('деление', 'fission'), g.X(200), g.Y(6.0), { color: C.orange });
      }
      // a helium nucleus vs separate nucleons on a balance
      const sep = 1 - ease(t, 0.5, 2.5);
      const parts: [number, number, string][] = [[-1, -1, C.red], [1, -1, '#9EA4AE'], [-1, 1, '#9EA4AE'], [1, 1, C.red]];
      parts.forEach(([a, b, c]) => ball(ctx, 200 + a * (11 + sep * 50), 220 + b * (11 + sep * 50), 13, c));
      tag(ctx, '⁴He', 200, 320, { color: C.amber });
      if (t > 3) {
        tag(ctx, `m(⁴He) < 2m(p) + 2m(n)`, 200, 380, { color: C.sky });
        tag(ctx, `Δm·c² ≈ 28 ${L('МэВ', 'MeV')}`, 200, 420, { color: C.amber });
      }
      f.hit(info('Ядро гелия-4', 'Helium-4 nucleus', 'Очень прочное ядро: энергия связи 28,3 МэВ, около 7 МэВ на нуклон.', 'A very tightly bound nucleus: 28.3 MeV of binding energy, about 7 MeV per nucleon.'), 200, 220, 40);
      return;
    }
    if (mode === 'quarks') {
      const neutron = t >= 4;
      const cx = 480;
      const cy = 270;
      circle(ctx, cx, cy, 170, alpha(neutron ? '#9EA4AE' : C.red, 0.1), alpha(neutron ? '#9EA4AE' : C.red, 0.6), 2);
      const q = neutron ? ['u', 'd', 'd'] : ['u', 'u', 'd'];
      const pos = q.map((_, i) => {
        const a = (i / 3) * TAU + t * 0.6;
        return [cx + Math.cos(a) * 80 + wobble(i, t, 2) * 8, cy + Math.sin(a) * 80 + wobble(i + 5, t, 2) * 8] as [number, number];
      });
      // gluon springs
      for (let i = 0; i < 3; i++) {
        const [x1, y1] = pos[i];
        const [x2, y2] = pos[(i + 1) % 3];
        const pts: [number, number][] = [];
        for (let s = 0; s <= 1; s += 0.02) {
          const x = lerp(x1, x2, s);
          const y = lerp(y1, y2, s);
          const nx = -(y2 - y1);
          const ny = x2 - x1;
          const m = Math.hypot(nx, ny);
          const o = Math.sin(s * 40 + t * 8) * 6;
          pts.push([x + (nx / m) * o, y + (ny / m) * o]);
        }
        line(ctx, pts, alpha(C.yellow, 0.6), 1.5);
      }
      const COL = [C.red, C.green, C.blue];
      q.forEach((name, i) => {
        ball(ctx, pos[i][0], pos[i][1], 30, COL[i]);
        text(ctx, name, pos[i][0], pos[i][1] - 3, { size: 20, color: C.white, weight: 700 });
        text(ctx, name === 'u' ? '+2/3' : '−1/3', pos[i][0], pos[i][1] + 16, { size: 11, color: C.white });
        f.hit(info(name === 'u' ? 'u-кварк' : 'd-кварк', name === 'u' ? 'Up quark' : 'Down quark', name === 'u' ? 'Заряд +2/3 e. Вместе с d-кварком строит всё обычное вещество.' : 'Заряд −1/3 e.', name === 'u' ? 'Charge +2/3 e. With the down quark it builds all ordinary matter.' : 'Charge −1/3 e.'), pos[i][0], pos[i][1], 30);
      });
      tag(ctx, neutron ? L('нейтрон: заряд 0', 'neutron: charge 0') : L('протон: заряд +1', 'proton: charge +1'), cx, 60, { color: C.sky, size: 14 });
      tag(ctx, L('жёлтые пружинки — глюоны', 'yellow springs are gluons'), cx, 490, { color: C.yellow });
      return;
    }
    // annihilation
    const k = ease(t, 0, 4);
    const cx = 480;
    const cy = 270;
    if (t < 4.1) {
      ball(ctx, lerp(120, cx - 10, k), cy, 14, C.blue, 0.5);
      text(ctx, '−', lerp(120, cx - 10, k), cy, { size: 16, color: C.white, weight: 700 });
      ball(ctx, lerp(840, cx + 10, k), cy, 14, C.pink, 0.5);
      text(ctx, '+', lerp(840, cx + 10, k), cy, { size: 16, color: C.white, weight: 700 });
      tag(ctx, L('электрон e⁻', 'electron e⁻'), lerp(120, cx - 10, k), cy - 40, { color: C.blue });
      tag(ctx, L('позитрон e⁺', 'positron e⁺'), lerp(840, cx + 10, k), cy - 40, { color: C.pink });
    } else {
      const d = (t - 4) * 160;
      circle(ctx, cx, cy, 10 + d * 0.3, undefined, alpha(C.yellow, clamp(1 - d / 300)), 3);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.9);
      wave(ctx, 10, d, 0, 8, 18, t * 20, C.green, 2.5);
      wave(ctx, -d, -10, 0, 8, 18, t * 20, C.green, 2.5);
      ctx.restore();
      tag(ctx, 'γ', cx + Math.cos(-0.9) * d, cy + Math.sin(-0.9) * d - 20, { color: C.green });
      tag(ctx, 'γ', cx - Math.cos(-0.9) * d, cy - Math.sin(-0.9) * d + 20, { color: C.green });
      tag(ctx, 'e⁻ + e⁺ → 2γ  (2 × 511 кэВ)', cx, 470, { color: C.amber, size: 14 });
    }
  },
};
