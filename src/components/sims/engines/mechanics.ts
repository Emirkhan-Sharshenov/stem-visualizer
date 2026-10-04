import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, rrect, seg, SimDef, tag, TAU, text, tx, wobble } from '../kit';

const G = 9.8;

function ground(ctx: CanvasRenderingContext2D, y: number, w: number, color = '#2A2D33') {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, w, 4);
  ctx.strokeStyle = alpha('#8C8F98', 0.25);
  ctx.lineWidth = 1;
  for (let x = -20; x < w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + 14, y + 4);
    ctx.stroke();
  }
}

function waterBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number, color = '#2F6FB5') {
  const g = ctx.createLinearGradient(0, level, 0, y + h);
  g.addColorStop(0, alpha(color, 0.55));
  g.addColorStop(1, alpha(color, 0.85));
  ctx.fillStyle = g;
  ctx.fillRect(x, level, w, y + h - level);
  ctx.strokeStyle = '#8C8F98';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 1.5, y);
  ctx.lineTo(x - 1.5, y + h + 1.5);
  ctx.lineTo(x + w + 1.5, y + h + 1.5);
  ctx.lineTo(x + w + 1.5, y);
  ctx.stroke();
}

/* ---------- pressure ---------- */

const LIQUIDS = [
  { rho: 800, name: tx('масло', 'oil'), color: '#C9A227' },
  { rho: 1000, name: tx('вода', 'water'), color: '#2F6FB5' },
  { rho: 1260, name: tx('глицерин', 'glycerol'), color: '#7FA8C9' },
];
const liquidFor = (rho: number) => LIQUIDS.reduce((a, b) => (Math.abs(b.rho - rho) < Math.abs(a.rho - rho) ? b : a));

export const pressure: SimDef = {
  id: 'pressure',
  title: tx('Давление', 'Pressure'),
  modes: [
    { id: 'solid', label: tx('Твёрдые тела', 'Solids') },
    { id: 'liquid', label: tx('Жидкость', 'Liquid') },
    { id: 'manometer', label: tx('Манометр', 'Manometer') },
    { id: 'atmosphere', label: tx('Атмосфера', 'Atmosphere') },
  ],
  duration: (m) => (m === 'solid' ? 14 : m === 'atmosphere' ? 12 : 12),
  loop: false,
  params: (m) =>
    m === 'solid'
      ? [{ id: 'm', label: tx('Масса бруска', 'Brick mass'), min: 1, max: 6, step: 0.5, value: 3, unit: 'кг', digits: 1 }]
      : m === 'liquid'
        ? [
            { id: 'rho', label: tx('Плотность жидкости', 'Liquid density'), min: 800, max: 1260, step: 230, value: 1000, unit: 'кг/м³' },
            { id: 'H', label: tx('Высота столба', 'Column height'), min: 0.2, max: 0.5, step: 0.05, value: 0.4, unit: 'м', digits: 2 },
          ]
        : m === 'manometer'
          ? [{ id: 'rho', label: tx('Плотность жидкости в сосуде', 'Liquid density in the tank'), min: 800, max: 1260, step: 230, value: 1000, unit: 'кг/м³' }]
          : [{ id: 'alt', label: tx('Высота над морем', 'Altitude'), min: 0, max: 5000, step: 250, value: 0, unit: 'м' }],
  stages: (m) =>
    m === 'solid'
      ? [
          { t: 0, label: tx('Плашмя', 'Lying flat'), text: tx('Вес бруска распределён по большой площади — давление маленькое, песок почти не продавливается.', 'The weight is spread over a large area, so the pressure is low and the sand barely dents.') },
          { t: 5, label: tx('На ребре', 'On its side'), text: tx('Вес тот же, площадь меньше — давление растёт: p = F / S.', 'Same weight, smaller area: pressure rises, p = F / S.') },
          { t: 9.5, label: tx('Стоя', 'Upright'), text: tx('Самая маленькая опора — самое большое давление. Поэтому ножи точат, а у лыж широкая опора.', 'Smallest footprint, biggest pressure. That’s why knives are sharpened and skis are wide.') },
        ]
      : m === 'liquid'
        ? [
            { t: 0, label: tx('Столб жидкости', 'Liquid column'), text: tx('Верхние слои давят на нижние своим весом. Чем глубже, тем больше над точкой жидкости.', 'Upper layers press on lower ones with their weight. The deeper you go, the more liquid sits above.') },
            { t: 2, label: tx('Отверстия открыты', 'Holes open'), text: tx('Струя из нижнего отверстия бьёт дальше всех: давление растёт с глубиной, p = ρgh.', 'The lowest jet shoots farthest: pressure grows with depth, p = ρgh.') },
            { t: 7, label: tx('Во все стороны', 'In all directions'), text: tx('На одной глубине жидкость давит одинаково во все стороны — и на дно, и на стенки (закон Паскаля).', 'At one depth a liquid pushes equally in every direction, on the bottom and the walls alike (Pascal’s law).') },
          ]
        : m === 'manometer'
          ? [
              { t: 0, label: tx('Датчик у поверхности', 'Probe at the surface'), text: tx('Плёнка коробочки соединена трубкой с U-образным манометром. Уровни в коленах равны.', 'The probe’s membrane is linked by a tube to a U-tube manometer. Both levels are equal.') },
              { t: 2, label: tx('Погружение', 'Going down'), text: tx('Чем глубже коробочка, тем сильнее вода прогибает плёнку и тем больше разница уровней в манометре.', 'The deeper the probe, the more water pushes the membrane in and the bigger the level difference.') },
              { t: 9, label: tx('Отсчёт', 'Reading'), text: tx('Разность уровней Δh показывает давление: p = ρ_м·g·Δh. Так работают и медицинские тонометры.', 'The level difference Δh gives the pressure: p = ρ·g·Δh. Blood-pressure meters work the same way.') },
            ]
          : [
              { t: 0, label: tx('Опыт Торричелли', 'Torricelli’s experiment'), text: tx('Трубку длиной 1 м заполняют ртутью и опрокидывают в чашку со ртутью.', 'A 1 m tube is filled with mercury and turned upside down into a dish of mercury.') },
              { t: 3, label: tx('Столб опускается', 'Column drops'), text: tx('Ртуть вытекает, пока вес столба не уравновесит давление воздуха на поверхность в чашке.', 'Mercury flows out until the column’s weight balances the air pressing on the dish.') },
              { t: 7, label: tx('760 мм', '760 mm'), text: tx('У моря столб ≈ 760 мм — это нормальное атмосферное давление ≈ 101 кПа. Над ртутью — пустота («торричеллиева»).', 'At sea level it settles at about 760 mm, normal atmospheric pressure (≈ 101 kPa). Above the mercury is a vacuum.') },
              { t: 9.5, label: tx('Высота', 'Altitude'), text: tx('Поднимись выше: воздуха над тобой меньше, давление падает — примерно на 1 мм рт. ст. каждые 12 м.', 'Go higher: less air above you, so pressure drops, about 1 mmHg every 12 m.') },
            ],
  metrics: ({ t, p, mode }) => {
    if (mode === 'solid') {
      const S = solidArea(t);
      const F = p.m * G;
      return [
        { label: tx('Сила (вес)', 'Force (weight)'), value: `${F.toFixed(1)} Н` },
        { label: tx('Площадь опоры', 'Contact area'), value: `${(S * 1e4).toFixed(0)} см²` },
        { label: tx('Давление', 'Pressure'), value: `${(F / S).toFixed(0)} Па`, tone: 'bad' },
      ];
    }
    if (mode === 'liquid') {
      const hd = p.H * 0.85;
      return [
        { label: tx('Давление у дна', 'Pressure at the bottom'), value: `${(p.rho * G * hd / 1000).toFixed(2)} кПа` },
        { label: tx('На глубине H/2', 'At depth H/2'), value: `${(p.rho * G * (hd / 2) / 1000).toFixed(2)} кПа` },
      ];
    }
    if (mode === 'manometer') {
      const d = 0.3 * ease(t, 2, 9);
      return [
        { label: tx('Глубина', 'Depth'), value: `${(d * 100).toFixed(0)} см` },
        { label: tx('Давление воды', 'Water pressure'), value: `${(p.rho * G * d).toFixed(0)} Па` },
      ];
    }
    const mm = 760 * Math.exp(-p.alt / 8400);
    return [
      { label: tx('Высота столба', 'Column height'), value: `${mm.toFixed(0)} мм рт. ст.` },
      { label: tx('Давление', 'Pressure'), value: `${(mm * 0.1333).toFixed(1)} кПа` },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'solid') {
      // three poses over time
      const pose = t < 5 ? 0 : t < 9.5 ? 1 : 2;
      const dims = [
        [240, 60],
        [120, 60],
        [60, 120],
      ];
      const k = pose === 0 ? 0 : pose === 1 ? ease(t, 5, 6) : ease(t, 9.5, 10.5);
      const from = dims[Math.max(0, pose - 1)];
      const to = dims[pose];
      const bw = lerp(from[0], to[0], k);
      const bh = lerp(from[1], to[1], k);
      const S = solidArea(t);
      const pr = (p.m * G) / S;
      const sink = clamp(pr / 2500) * 46 * ease(t - (pose === 0 ? 0 : pose === 1 ? 5 : 9.5), 0.8, 3.5);
      const sandY = 360;
      // sand bed with dent
      ctx.fillStyle = '#5C4A2E';
      ctx.beginPath();
      ctx.moveTo(140, sandY);
      ctx.lineTo(480 - bw / 2 - 20, sandY);
      ctx.quadraticCurveTo(480 - bw / 2, sandY + sink, 480 - bw / 2 + 6, sandY + sink);
      ctx.lineTo(480 + bw / 2 - 6, sandY + sink);
      ctx.quadraticCurveTo(480 + bw / 2, sandY + sink, 480 + bw / 2 + 20, sandY);
      ctx.lineTo(820, sandY);
      ctx.lineTo(820, 470);
      ctx.lineTo(140, 470);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 160; i++) circle(ctx, 140 + hash(i) * 680, sandY + 10 + hash(i, 1) * 95, 1.5, alpha('#C9A86A', 0.5));
      f.hitRect(info('Песок', 'Sand', 'Чем больше давление, тем глубже вдавливается брусок.', 'The bigger the pressure, the deeper the brick sinks.'), 140, sandY + 5, 680, 100);
      // brick
      const bx = 480 - bw / 2;
      const by = sandY + sink - bh;
      rrect(ctx, bx, by, bw, bh, 4);
      ctx.fillStyle = '#B5552B';
      ctx.fill();
      ctx.strokeStyle = '#7A3A1C';
      ctx.lineWidth = 2;
      ctx.stroke();
      f.hitRect(info('Брусок', 'Brick', 'Его вес F = mg не меняется — меняется только площадь опоры S.', 'Its weight F = mg stays the same; only the contact area S changes.'), bx, by, bw, bh);
      arrow(ctx, 480, by + bh / 2, 480, by + bh / 2 + 70, { color: C.amber, width: 3 });
      tag(ctx, `F = ${(p.m * G).toFixed(0)} ${L('Н', 'N')}`, 480 + 60, by + bh / 2 + 50, { color: C.amber });
      // pressure arrows under the brick
      const n = Math.max(2, Math.round(bw / 30));
      for (let i = 0; i < n; i++) {
        const x = bx + (i + 0.5) * (bw / n);
        arrow(ctx, x, sandY + sink + 4, x, sandY + sink + 10 + clamp(pr / 2500) * 40, { color: alpha(C.red, 0.8), width: 2, head: 6 });
      }
      tag(ctx, `p = ${pr.toFixed(0)} ${L('Па', 'Pa')}`, 480, 500, { color: C.red, size: 14 });
      return;
    }

    if (mode === 'liquid') {
      const liq = liquidFor(p.rho);
      const vx = 300;
      const vy = 70;
      const vw = 150;
      const vh = 360;
      const level = vy + vh - (p.H / 0.5) * vh * 0.9;
      waterBox(ctx, vx, vy, vw, vh, level, liq.color);
      f.hitRect(info('Сосуд с жидкостью', 'Vessel of liquid', `Сейчас: ${liq.name.ru}, ρ = ${liq.rho} кг/м³. Уровень поддерживается постоянным.`, `Now: ${liq.name.en}, ρ = ${liq.rho} kg/m³. The level is kept constant.`), vx, level, vw, 60);
      const floorY = vy + vh;
      ground(ctx, floorY + 70, w);
      // holes and jets
      const holes = [0.25, 0.5, 0.8];
      holes.forEach((u, i) => {
        const hy = lerp(level, floorY, u);
        const depth = (hy - level) / (vh * 0.9 / 0.5); // metres
        const v = Math.sqrt(2 * G * Math.max(0, depth));
        const open = ease(t, 2, 2.6);
        circle(ctx, vx + vw + 1, hy, 4, '#111214', '#8C8F98');
        if (open > 0) {
          const pts: [number, number][] = [];
          const scale = 260;
          for (let s = 0; s < 1; s += 0.01) {
            const tt = s * 0.5;
            const x = vx + vw + v * tt * scale * open;
            const y = hy + 0.5 * G * tt * tt * scale;
            // compare jets over the same drop below each hole: the deeper hole squirts faster and farther
            if (y > hy + 120) break;
            pts.push([x, y]);
          }
          line(ctx, pts, alpha(liq.color, 0.9), 5);
          // droplets
          for (let d = 0; d < 6; d++) {
            const ph = (t * 1.6 + d / 6) % 1;
            const pt = pts[Math.floor(ph * (pts.length - 1))];
            if (pt) circle(ctx, pt[0], pt[1], 2.5, alpha('#BFD8FF', 0.8));
          }
        }
        // pressure arrows on the walls (equal in all directions)
        const len = 8 + depth * 120;
        arrow(ctx, vx + 20, hy, vx + 20 - len * 0.5, hy, { color: alpha(C.red, 0.7), width: 2, head: 6 });
        f.hit(info(`Отверстие ${i + 1}`, `Hole ${i + 1}`, `Глубина ${(depth * 100).toFixed(0)} см. Давление p = ρgh = ${(p.rho * G * depth).toFixed(0)} Па.`, `Depth ${(depth * 100).toFixed(0)} cm. Pressure p = ρgh = ${(p.rho * G * depth).toFixed(0)} Pa.`), vx + vw + 1, hy, 10);
        tag(ctx, `${(p.rho * G * depth / 1000).toFixed(1)} ${L('кПа', 'kPa')}`, vx - 70, hy, { color: C.red, size: 11 });
      });
      // bottom arrows
      for (let i = 0; i < 4; i++) arrow(ctx, vx + 25 + i * 33, floorY - 30, vx + 25 + i * 33, floorY - 6, { color: alpha(C.red, 0.7), width: 2, head: 6 });
      chart(ctx, {
        x: 640, y: 80, w: 290, h: 220, xMax: 0.5, yMax: 6.5,
        title: L('p от глубины', 'p vs depth'), xLabel: L('h, м', 'h, m'), yLabel: L('кПа', 'kPa'),
        series: LIQUIDS.map((l) => ({ color: l.color, label: l.name[f.lang], fn: (x: number) => (l.rho * G * x) / 1000, width: l === liq ? 3 : 1.5 })),
      });
      return;
    }

    if (mode === 'manometer') {
      const liq = liquidFor(p.rho);
      const tx0 = 120;
      const ty = 120;
      const tw = 330;
      const th = 340;
      const level = ty + 30;
      waterBox(ctx, tx0, ty, tw, th, level, liq.color);
      const depth = 0.3 * ease(t, 2, 9); // m
      const scale = 900; // px per m
      const py = level + depth * scale;
      // probe box with membrane
      const bulge = depth * 26 * (p.rho / 1000);
      rrect(ctx, tx0 + 140, py - 6, 50, 34, 5);
      ctx.fillStyle = '#3A3D45';
      ctx.fill();
      ctx.strokeStyle = C.pink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx0 + 140, py + 28);
      ctx.quadraticCurveTo(tx0 + 165, py + 28 - bulge, tx0 + 190, py + 28);
      ctx.stroke();
      f.hit(info('Датчик с плёнкой', 'Membrane probe', 'Резиновая плёнка прогибается под давлением воды и сжимает воздух в трубке.', 'The rubber membrane bends under water pressure and squeezes the air in the tube.'), tx0 + 165, py + 12, 26);
      // tube to manometer
      line(ctx, [[tx0 + 165, py - 6], [tx0 + 165, 70], [640, 70], [640, 200]], '#B5B8C0', 4);
      // U-tube
      const ux = 640;
      const uw = 100;
      const base = 420;
      const dh = depth * scale * (p.rho / 1000) * 0.5; // px each side
      const mid = 300;
      ctx.strokeStyle = '#B5B8C0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ux - 12, 200);
      ctx.lineTo(ux - 12, base);
      ctx.arc(ux + uw / 2, base, uw / 2 + 12, Math.PI, 0, true);
      ctx.lineTo(ux + uw + 12, 160);
      ctx.moveTo(ux + 12, 200);
      ctx.lineTo(ux + 12, base);
      ctx.arc(ux + uw / 2, base, uw / 2 - 12, Math.PI, 0, true);
      ctx.lineTo(ux + uw - 12, 160);
      ctx.stroke();
      ctx.fillStyle = alpha(C.red, 0.75);
      ctx.fillRect(ux - 10, mid + dh, 20, base - mid - dh);
      ctx.fillRect(ux + uw - 10, mid - dh, 20, base - mid + dh);
      ctx.beginPath();
      ctx.arc(ux + uw / 2, base, uw / 2, Math.PI, 0, true);
      ctx.lineWidth = 20;
      ctx.strokeStyle = alpha(C.red, 0.75);
      ctx.stroke();
      f.hitRect(info('U-образный манометр', 'U-tube manometer', 'Жидкость в коленах смещается: разница уровней Δh пропорциональна давлению.', 'The liquid shifts between the arms: the level difference Δh is proportional to pressure.'), ux - 14, mid - 60, uw + 28, 160);
      // scale + delta
      for (let i = -6; i <= 6; i++) line(ctx, [[ux + uw + 22, mid + i * 14], [ux + uw + (i % 2 ? 28 : 34), mid + i * 14]], C.dim, 1);
      if (dh > 4) {
        line(ctx, [[ux - 20, mid + dh], [ux + uw + 20, mid + dh]], alpha(C.sky, 0.6), 1, [3, 3]);
        line(ctx, [[ux - 20, mid - dh], [ux + uw + 20, mid - dh]], alpha(C.sky, 0.6), 1, [3, 3]);
        arrow(ctx, ux + uw + 60, mid + dh, ux + uw + 60, mid - dh, { color: C.sky, width: 2, head: 6 });
        tag(ctx, 'Δh', ux + uw + 86, mid, { color: C.sky });
      }
      tag(ctx, `${L('глубина', 'depth')} ${(depth * 100).toFixed(0)} ${L('см', 'cm')}`, tx0 + tw / 2, ty - 30, { color: C.text });
      return;
    }

    // atmosphere: Torricelli
    const mm = 760 * Math.exp(-p.alt / 8400);
    const scale = 0.42; // px per mm
    const dishY = 440;
    const tubeX = 330;
    const fill = ease(t, 0, 1.5);
    const flip = ease(t, 1.5, 3);
    const drop = ease(t, 3, 6.5);
    const col = lerp(1000, mm, drop) * scale;
    // dish
    rrect(ctx, tubeX - 120, dishY - 30, 240, 50, 10);
    ctx.fillStyle = '#22252A';
    ctx.fill();
    ctx.fillStyle = '#9EA4AE';
    ctx.fillRect(tubeX - 112, dishY - 18, 224, 30);
    f.hitRect(info('Чашка со ртутью', 'Dish of mercury', 'Воздух давит на открытую поверхность ртути в чашке и удерживает столб в трубке.', 'Air presses on the open mercury in the dish and holds the column up in the tube.'), tubeX - 112, dishY - 18, 224, 30);
    // tube (rotates during flip)
    ctx.save();
    ctx.translate(tubeX, dishY - 6);
    ctx.rotate(Math.PI * (1 - flip));
    const tl = 1000 * scale;
    ctx.strokeStyle = '#D5D8DE';
    ctx.lineWidth = 3;
    rrect(ctx, -12, -tl, 24, tl, 10);
    ctx.stroke();
    const mercury = flip < 1 ? tl * fill : col;
    const g = ctx.createLinearGradient(-10, 0, 10, 0);
    g.addColorStop(0, '#7E848E');
    g.addColorStop(0.5, '#E3E6EA');
    g.addColorStop(1, '#7E848E');
    ctx.fillStyle = g;
    ctx.fillRect(-9, -mercury, 18, mercury);
    ctx.restore();
    f.hitRect(info('Столб ртути', 'Mercury column', 'Его давление ρgh равно атмосферному. Ртуть в 13,6 раза плотнее воды — водяной столб был бы ≈ 10 м.', 'Its pressure ρgh equals atmospheric pressure. Mercury is 13.6× denser than water; a water column would be about 10 m.'), tubeX - 12, dishY - 6 - col, 24, col);
    if (drop > 0.2) {
      tag(ctx, L('пустота', 'vacuum'), tubeX + 70, dishY - 6 - col - 40, { color: C.dim });
      line(ctx, [[tubeX + 20, dishY - 6 - col], [tubeX + 70, dishY - 6 - col]], alpha(C.sky, 0.7), 1, [3, 3]);
      line(ctx, [[tubeX + 20, dishY - 18], [tubeX + 70, dishY - 18]], alpha(C.sky, 0.7), 1, [3, 3]);
      arrow(ctx, tubeX + 60, dishY - 18, tubeX + 60, dishY - 6 - col, { color: C.sky, width: 2, head: 7 });
      tag(ctx, `${mm.toFixed(0)} ${L('мм', 'mm')}`, tubeX + 110, dishY - 6 - col / 2, { color: C.sky, size: 14 });
    }
    // air pressure arrows on the dish
    for (let i = 0; i < 5; i++) {
      const x = tubeX - 100 + i * 50;
      if (Math.abs(x - tubeX) < 25) continue;
      const a = 0.4 + 0.6 * (mm / 760);
      arrow(ctx, x, dishY - 90, x, dishY - 26, { color: alpha(C.cyan, a), width: 2.5 });
    }
    // altitude column of air on the right
    const ax = 640;
    rrect(ctx, ax, 60, 220, 400, 12);
    ctx.fillStyle = C.panel;
    ctx.fill();
    for (let i = 0; i < 140; i++) {
      const hy = hash(i) ** 0.6; // more molecules low down
      const y = 450 - (1 - hy) * 380;
      circle(ctx, ax + 12 + hash(i, 5) * 196 + wobble(i, t, 2) * 3, y + wobble(i + 3, t, 2) * 3, 2.2, alpha(C.cyan, 0.7));
    }
    const yMe = 450 - (p.alt / 9000) * 380;
    tag(ctx, `${L('ты здесь', 'you are here')}: ${p.alt} ${L('м', 'm')}`, ax + 110, yMe, { color: C.amber });
    text(ctx, L('воздуха меньше с высотой', 'less air the higher you go'), ax + 110, 44, { size: 12, color: C.dim });
    f.hitRect(info('Атмосфера', 'Atmosphere', 'Воздух сжат собственным весом: внизу он плотнее. Половина массы атмосферы — ниже 5,5 км.', 'Air is squeezed by its own weight, so it’s denser at the bottom. Half the atmosphere’s mass lies below 5.5 km.'), ax, 60, 220, 400);
  },
};

function solidArea(t: number) {
  // brick 24 × 12 × 6 cm
  const areas = [0.24 * 0.12, 0.24 * 0.06, 0.12 * 0.06];
  if (t < 5) return areas[0];
  if (t < 9.5) return lerp(areas[0], areas[1], ease(t, 5, 6));
  return lerp(areas[1], areas[2], ease(t, 9.5, 10.5));
}

/* ---------- work, power, efficiency ---------- */

export const workPower: SimDef = {
  id: 'work_power',
  title: tx('Работа, мощность, КПД', 'Work, power, efficiency'),
  modes: [
    { id: 'lift', label: tx('Подъём груза', 'Lifting') },
    { id: 'incline', label: tx('Наклонная плоскость', 'Inclined plane') },
  ],
  duration: (m, p) => (m === 'lift' ? Math.max(4, p.time) + 3 : 10),
  loop: false,
  params: (m) =>
    m === 'lift'
      ? [
          { id: 'm', label: tx('Масса груза', 'Load mass'), min: 50, max: 500, step: 50, value: 200, unit: 'кг' },
          { id: 'time', label: tx('Время подъёма', 'Lifting time'), min: 2, max: 12, step: 1, value: 6, unit: 'с' },
        ]
      : [
          { id: 'angle', label: tx('Угол наклона', 'Slope angle'), min: 10, max: 50, step: 5, value: 25, unit: '°' },
          { id: 'mu', label: tx('Трение', 'Friction'), min: 0, max: 0.5, step: 0.05, value: 0.2, digits: 2 },
        ],
  stages: (m, p) =>
    m === 'lift'
      ? [
          { t: 0, label: tx('Старт', 'Start'), text: tx('Кран поднимает груз на 10 м равномерно. Сила тяги равна весу: F = mg.', 'The crane lifts the load 10 m at constant speed. The pull equals the weight: F = mg.') },
          { t: 1, label: tx('Работа', 'Work'), text: tx('Работа A = F·s: сила, умноженная на путь вдоль силы. Она не зависит от того, быстро или медленно поднимают.', 'Work A = F·s: force times distance along the force. It doesn’t depend on how fast you lift.') },
          { t: Math.max(4, p.time) + 1, label: tx('Мощность', 'Power'), text: tx('Мощность N = A / t — работа за секунду. Тот же груз быстрее — значит мощнее двигатель.', 'Power N = A / t is work per second. The same load lifted faster needs a more powerful motor.') },
        ]
      : [
          { t: 0, label: tx('Простой механизм', 'Simple machine'), text: tx('Груз 10 кг втаскивают на высоту 1 м по наклонной плоскости.', 'A 10 kg load is pulled up a 1 m height along a ramp.') },
          { t: 2, label: tx('Выигрыш в силе', 'Less force'), text: tx('Тянуть легче, чем поднимать вертикально, но путь длиннее: выигрыша в работе нет («золотое правило механики»).', 'Pulling is easier than lifting straight up, but the path is longer: there’s no gain in work (the golden rule of mechanics).') },
          { t: 7, label: tx('КПД', 'Efficiency'), text: tx('Часть работы уходит на трение. КПД η = A_полезная / A_затраченная · 100% всегда меньше 100%.', 'Some work is lost to friction. Efficiency η = useful work / total work × 100% is always under 100%.') },
        ],
  metrics: ({ t, p, mode }) => {
    if (mode === 'lift') {
      const k = clamp((t - 1) / p.time);
      const A = p.m * G * 10 * k;
      return [
        { label: tx('Высота', 'Height'), value: `${(10 * k).toFixed(1)} м` },
        { label: tx('Работа', 'Work'), value: `${(A / 1000).toFixed(1)} кДж` },
        { label: tx('Мощность', 'Power'), value: `${((p.m * G * 10) / p.time / 1000).toFixed(2)} кВт`, tone: 'good' },
      ];
    }
    const r = incline(p);
    return [
      { label: tx('Сила тяги', 'Pulling force'), value: `${r.F.toFixed(0)} Н` },
      { label: tx('Вес груза', 'Load weight'), value: `${(10 * G).toFixed(0)} Н` },
      { label: tx('Полезная / затраченная', 'Useful / total'), value: `${r.Au.toFixed(0)} / ${r.Az.toFixed(0)} Дж` },
      { label: tx('КПД', 'Efficiency'), value: `${(r.eta * 100).toFixed(0)} %`, tone: r.eta > 0.7 ? 'good' : 'bad' },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'lift') {
      const k = clamp((t - 1) / p.time);
      const gy = 470;
      ground(ctx, gy, w);
      // crane
      ctx.fillStyle = '#F5A524';
      ctx.fillRect(170, 70, 22, gy - 70);
      for (let y = 80; y < gy; y += 30) line(ctx, [[170, y], [192, y + 30]], '#B97A10', 2);
      ctx.fillRect(120, 64, 420, 16);
      ctx.fillStyle = '#3A3D45';
      ctx.fillRect(120, 80, 50, 40);
      f.hitRect(info('Кран', 'Crane', 'Двигатель крана совершает работу, поднимая груз. Его мощность — работа за секунду.', 'The crane’s motor does work lifting the load. Its power is the work per second.'), 120, 64, 420, 56);
      const scale = 32;
      const ly = gy - 40 - 10 * scale * k;
      line(ctx, [[460, 80], [460, ly - 30]], '#B5B8C0', 2);
      const lw = 40 + p.m / 10;
      rrect(ctx, 460 - lw / 2, ly - 30, lw, 60, 6);
      ctx.fillStyle = '#4A6FA5';
      ctx.fill();
      text(ctx, `${p.m} ${L('кг', 'kg')}`, 460, ly, { size: 13, color: C.white });
      f.hitRect(info('Груз', 'Load', `Вес ${(p.m * G).toFixed(0)} Н. Чтобы поднять его на 10 м, нужно совершить работу ${(p.m * G * 10 / 1000).toFixed(1)} кДж.`, `Weight ${(p.m * G).toFixed(0)} N. Lifting it 10 m takes ${(p.m * G * 10 / 1000).toFixed(1)} kJ of work.`), 460 - lw / 2, ly - 30, lw, 60);
      arrow(ctx, 520, ly + 10, 520, ly - 50, { color: C.green, width: 3 });
      tag(ctx, 'F', 538, ly - 40, { color: C.green });
      arrow(ctx, 400, ly - 10, 400, ly + 50, { color: C.amber, width: 3 });
      tag(ctx, 'mg', 378, ly + 40, { color: C.amber });
      // height ruler
      for (let i = 0; i <= 10; i++) {
        const y = gy - 40 - i * scale;
        line(ctx, [[580, y], [i % 5 ? 590 : 598, y]], C.dim, 1);
        if (i % 5 === 0) text(ctx, `${i} ${L('м', 'm')}`, 606, y, { size: 11, color: C.dim, align: 'left' });
      }
      chart(ctx, {
        x: 660, y: 70, w: 270, h: 200, xMax: p.time + 2, yMax: p.m * G * 10 / 1000 * 1.1,
        title: L('Работа A(t), кДж', 'Work A(t), kJ'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
        series: [{ color: C.green, fn: (x) => (p.m * G * 10 * clamp((x - 1) / p.time)) / 1000 }],
      });
      text(ctx, L('наклон графика = мощность', 'slope of the graph = power'), 795, 290, { size: 12, color: C.dim });
      return;
    }
    // inclined plane
    const r = incline(p);
    const a = (p.angle * Math.PI) / 180;
    const H = 230;
    const x0 = 140;
    const y0 = 440;
    const len = H / Math.sin(a);
    const x1 = x0 + Math.cos(a) * len;
    const y1 = y0 - H;
    ctx.fillStyle = '#2A2D33';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(Math.min(x1, 900), y1);
    ctx.lineTo(Math.min(x1, 900), y0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4A4D55';
    ctx.stroke();
    f.hit(info('Наклонная плоскость', 'Inclined plane', 'Простой механизм: даёт выигрыш в силе во столько раз, во сколько длина больше высоты (без трения).', 'A simple machine: cuts the force by the ratio of length to height (without friction).'), (x0 + x1) / 2 + 40, (y0 + y1) / 2 + 40, 30);
    ground(ctx, y0, w);
    const k = ease(t, 1, 8);
    const bx = lerp(x0 + 30, x1 - 40, k);
    const by = lerp(y0, y1, (bx - x0) / (x1 - x0));
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-a);
    rrect(ctx, -26, -44, 52, 44, 5);
    ctx.fillStyle = '#4A6FA5';
    ctx.fill();
    text(ctx, L('10 кг', '10 kg'), 0, -22, { size: 12, color: C.white });
    arrow(ctx, 30, -22, 30 + r.F * 0.9, -22, { color: C.green, width: 3 });
    if (p.mu > 0) arrow(ctx, -30, -4, -30 - r.Ff * 0.9, -4, { color: C.red, width: 2.5 });
    ctx.restore();
    arrow(ctx, bx, by - 20, bx, by + 50, { color: C.amber, width: 2.5 });
    tag(ctx, `F = ${r.F.toFixed(0)} ${L('Н', 'N')}`, bx + 90, by - 80, { color: C.green });
    if (p.mu > 0) tag(ctx, `${L('трение', 'friction')} ${r.Ff.toFixed(0)} ${L('Н', 'N')}`, bx - 60, by + 20, { color: C.red });
    tag(ctx, `mg = ${(10 * G).toFixed(0)} ${L('Н', 'N')}`, bx + 50, by + 60, { color: C.amber });
    f.hit(info('Груз', 'Load', 'Сила тяги F = mg·sinα + μmg·cosα при равномерном движении.', 'At steady speed the pull is F = mg·sinα + μmg·cosα.'), bx, by - 24, 30);
    // h and l labels
    line(ctx, [[Math.min(x1, 900) + 14, y0], [Math.min(x1, 900) + 14, y1]], alpha(C.sky, 0.6), 1.5, [4, 4]);
    tag(ctx, 'h = 1 м', Math.min(x1, 880) - 10, (y0 + y1) / 2, { color: C.sky, align: 'right' });
    // energy bars
    const bars = [
      { label: L('полезная', 'useful'), v: r.Au * k, c: C.green },
      { label: L('затраченная', 'total'), v: r.Az * k, c: C.amber },
    ];
    bars.forEach((b, i) => {
      const bx2 = 680 + i * 120;
      rrect(ctx, bx2, 80, 70, 200, 8);
      ctx.fillStyle = C.panel;
      ctx.fill();
      const hh = (b.v / 250) * 200;
      rrect(ctx, bx2, 280 - hh, 70, hh, 8);
      ctx.fillStyle = b.c;
      ctx.fill();
      text(ctx, b.label, bx2 + 35, 296, { size: 12, color: C.dim });
      text(ctx, `${b.v.toFixed(0)} ${L('Дж', 'J')}`, bx2 + 35, 66, { size: 12, mono: true });
    });
    tag(ctx, `η = ${(r.eta * 100).toFixed(0)}%`, 775, 330, { color: r.eta > 0.7 ? C.green : C.red, size: 15 });
  },
};

function incline(p: Record<string, number>) {
  const a = (p.angle * Math.PI) / 180;
  const m = 10;
  const Fg = m * G * Math.sin(a);
  const Ff = p.mu * m * G * Math.cos(a);
  const F = Fg + Ff;
  const l = 1 / Math.sin(a);
  const Au = m * G * 1;
  const Az = F * l;
  return { F, Ff, Au, Az, eta: Au / Az };
}

/* ---------- equilibrium and centre of gravity ---------- */

export const equilibrium: SimDef = {
  id: 'equilibrium',
  title: tx('Центр тяжести и равновесие', 'Centre of gravity and balance'),
  modes: [
    { id: 'kinds', label: tx('Виды равновесия', 'Kinds of balance') },
    { id: 'tipping', label: tx('Опрокидывание', 'Tipping over') },
  ],
  duration: 12,
  loop: false,
  params: (m) => (m === 'tipping' ? [{ id: 'hw', label: tx('Высота / ширина тела', 'Height / width'), min: 0.6, max: 3, step: 0.2, value: 1.8, digits: 1 }] : []),
  stages: (m) =>
    m === 'kinds'
      ? [
          { t: 0, label: tx('Покой', 'At rest'), text: tx('Три шарика в равновесии: в ямке, на вершине горки и на ровном столе.', 'Three balls at rest: in a dip, on top of a hill and on a flat table.') },
          { t: 2, label: tx('Толчок', 'A nudge'), text: tx('Слегка толкаем каждый шарик в сторону.', 'Each ball gets a small push sideways.') },
          { t: 3, label: tx('Результат', 'Outcome'), text: tx('В ямке шарик возвращается (устойчивое), с горки скатывается (неустойчивое), на столе остаётся в новом месте (безразличное).', 'In the dip it comes back (stable), on the hill it rolls off (unstable), on the table it stays put (neutral).') },
        ]
      : [
          { t: 0, label: tx('Наклон', 'Tilting'), text: tx('Медленно наклоняем тело вокруг нижнего ребра. Отвес из центра тяжести показывает, куда «давит» вес.', 'We slowly tilt the body around its bottom edge. A plumb line from the centre of gravity shows where the weight acts.') },
          { t: 5, label: tx('Граница', 'Tipping point'), text: tx('Пока отвес внутри площади опоры, тело возвращается. Как только вышел за ребро — опрокидывается.', 'While the line stays inside the base, the body rocks back. Once it passes the edge, over it goes.') },
          { t: 9, label: tx('Вывод', 'Takeaway'), text: tx('Низкое и широкое тело устойчивее высокого и узкого. Поэтому у кранов противовесы, а у ламп тяжёлые основания.', 'Low, wide objects are steadier than tall, narrow ones. That’s why cranes have counterweights and lamps have heavy bases.') },
        ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'kinds') {
      const cols = [
        { cx: 170, label: L('устойчивое', 'stable'), color: C.green },
        { cx: 480, label: L('неустойчивое', 'unstable'), color: C.red },
        { cx: 790, label: L('безразличное', 'neutral'), color: C.amber },
      ];
      // bowl
      const bowl = (x: number) => 330 + ((x - 170) / 110) ** 2 * 60;
      const hill = (x: number) => 330 - Math.max(0, 1 - ((x - 480) / 120) ** 2) * 80 + 80;
      ctx.strokeStyle = '#4A4D55';
      ctx.lineWidth = 4;
      line(ctx, Array.from({ length: 50 }, (_, i) => [60 + i * 4.5, bowl(60 + i * 4.5)] as [number, number]), '#6B6F78', 4);
      line(ctx, Array.from({ length: 60 }, (_, i) => [340 + i * 4.8, hill(340 + i * 4.8)] as [number, number]), '#6B6F78', 4);
      line(ctx, [[680, 410], [900, 410]], '#6B6F78', 4);
      // stable: damped oscillation
      const s1 = t < 2 ? 0 : Math.sin((t - 2) * 3) * Math.exp(-(t - 2) * 0.5) * 60;
      ball(ctx, 170 + s1, bowl(170 + s1) - 18, 16, C.green);
      // unstable: rolls away accelerating
      const d = t < 2 ? 0 : Math.min(260, 4 * (Math.exp((t - 2) * 1.1) - 1));
      const ux = 480 + d;
      ball(ctx, Math.min(ux, 700), (ux < 600 ? hill(ux) : 410) - 18, 16, C.red);
      // neutral: moves a bit and stops
      const nx = 790 + (t < 2 ? 0 : 50 * (1 - Math.exp(-(t - 2) * 1.5)));
      ball(ctx, nx, 410 - 18, 16, C.amber);
      cols.forEach((c, i) => {
        tag(ctx, c.label, c.cx, 470, { color: c.color, size: 13 });
        if (t > 2 && t < 2.6) arrow(ctx, c.cx - 50, [bowl(170), hill(480), 410][i] - 60, c.cx - 10, [bowl(170), hill(480), 410][i] - 60, { color: C.text, width: 2 });
      });
      f.hit(info('Устойчивое равновесие', 'Stable balance', 'При отклонении возникает сила, возвращающая тело назад. Центр тяжести в самой низкой точке.', 'When nudged, a force pulls the body back. Its centre of gravity is at the lowest point.'), 170 + s1, bowl(170 + s1) - 18, 18);
      f.hit(info('Неустойчивое равновесие', 'Unstable balance', 'Малейшее отклонение — и тело уходит всё дальше. Центр тяжести в самой высокой точке.', 'The slightest nudge and the body moves further away. Its centre of gravity is at the highest point.'), Math.min(ux, 700), (ux < 600 ? hill(ux) : 410) - 18, 18);
      f.hit(info('Безразличное равновесие', 'Neutral balance', 'В любом новом положении тело снова в равновесии: высота центра тяжести не меняется.', 'In any new position the body is still balanced: the height of its centre of gravity doesn’t change.'), nx, 392, 18);
      return;
    }
    // tipping box
    const bw = 120;
    const bh = bw * p.hw;
    const pivotX = 520;
    const pivotY = 430;
    const crit = Math.atan(bw / bh); // tipping angle
    const tiltTarget = ease(t, 0.5, 6) * 0.95; // radians, ~54°
    let ang = Math.min(tiltTarget, crit);
    if (tiltTarget > crit) {
      // passes the edge → falls over
      const tf = t - (0.5 + 5.5 * (crit / 0.95));
      ang = Math.min(Math.PI / 2, crit + Math.max(0, tf) ** 2 * 1.4);
    }
    ground(ctx, pivotY, w);
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(ang);
    rrect(ctx, -bw, -bh, bw, bh, 6);
    ctx.fillStyle = '#4A6FA5';
    ctx.fill();
    ctx.strokeStyle = '#7FA0D0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    // centre of gravity
    const cgx = pivotX + Math.cos(ang) * (-bw / 2) - Math.sin(ang) * (-bh / 2);
    const cgy = pivotY + Math.sin(ang) * (-bw / 2) + Math.cos(ang) * (-bh / 2);
    circle(ctx, cgx, cgy, 7, C.amber, '#111214', 2);
    line(ctx, [[cgx, cgy], [cgx, pivotY]], C.amber, 2, [5, 4]);
    arrow(ctx, cgx, cgy, cgx, cgy + 60, { color: C.amber, width: 3 });
    f.hit(info('Центр тяжести', 'Centre of gravity', 'Точка приложения силы тяжести. Если отвес из неё выходит за площадь опоры — тело опрокидывается.', 'Where gravity acts. If the plumb line from it leaves the base, the body tips over.'), cgx, cgy, 10);
    // base region (the support edge = pivot)
    const inside = cgx < pivotX;
    tag(ctx, inside ? L('отвес внутри опоры — вернётся', 'line inside the base: rocks back') : L('отвес за краем — опрокинется!', 'line past the edge: tips over!'), pivotX - 40, 70, { color: inside ? C.green : C.red, size: 13 });
    circle(ctx, pivotX, pivotY, 5, C.red);
    tag(ctx, `${L('угол', 'angle')} ${((Math.min(ang, Math.PI / 2) * 180) / Math.PI).toFixed(0)}° / ${L('критический', 'critical')} ${((crit * 180) / Math.PI).toFixed(0)}°`, 220, 120, { color: C.sky });
  },
};

/* ---------- weight and weightlessness ---------- */

const elevatorAcc = (t: number) => (t < 2 ? 0 : t < 4 ? 2.5 : t < 7 ? 0 : t < 9 ? -2.5 : t < 10 ? 0 : t < 13 ? -G : 0);

export const weight: SimDef = {
  id: 'weight',
  title: tx('Вес тела в лифте', 'Weight in a lift'),
  duration: 14,
  loop: false,
  params: [{ id: 'm', label: tx('Масса человека', 'Person’s mass'), min: 30, max: 90, step: 5, value: 50, unit: 'кг' }],
  stages: [
    { t: 0, label: tx('Покой', 'At rest'), text: tx('Весы показывают вес P = mg: с такой силой человек давит на опору.', 'The scale reads the weight P = mg, the force with which the person presses on the floor.') },
    { t: 2, label: tx('Разгон вверх', 'Speeding up'), text: tx('Ускорение вверх: P = m(g + a) — вес больше, «вдавливает в пол». Это перегрузка.', 'Accelerating upward: P = m(g + a), heavier than usual, pressed into the floor. That’s g-force.') },
    { t: 4, label: tx('Равномерно', 'Steady'), text: tx('Скорость постоянна — вес снова mg, хотя лифт едет.', 'Constant speed: the weight is back to mg even though the lift is moving.') },
    { t: 7, label: tx('Торможение', 'Slowing down'), text: tx('Ускорение вниз: P = m(g − a) — вес меньше силы тяжести.', 'Accelerating downward: P = m(g − a), lighter than gravity.') },
    { t: 10, label: tx('Свободное падение', 'Free fall'), text: tx('Если трос оборвался, a = g и P = 0 — невесомость. Сила тяжести есть, а веса нет! Так живут космонавты на орбите.', 'If the cable snaps, a = g and P = 0: weightlessness. Gravity still acts but there’s no weight, which is how astronauts live in orbit.') },
  ],
  metrics: ({ t, p }) => {
    const P = p.m * (G + elevatorAcc(t));
    return [
      { label: tx('Сила тяжести mg', 'Gravity mg'), value: `${(p.m * G).toFixed(0)} Н` },
      { label: tx('Вес P', 'Weight P'), value: `${P.toFixed(0)} Н`, tone: P < p.m * G - 1 ? 'good' : P > p.m * G + 1 ? 'bad' : undefined },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, L } = f;
    backdrop(ctx, w, h);
    const a = elevatorAcc(t);
    const P = p.m * (G + a);
    // shaft
    rrect(ctx, 150, 20, 260, 500, 8);
    ctx.fillStyle = '#16181C';
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.stroke();
    // cab position: integrate roughly for display (piecewise)
    const pos = cabPos(t);
    const cy = 340 - pos * 22;
    if (t < 10) line(ctx, [[280, 20], [280, cy - 120]], '#8C8F98', 2);
    rrect(ctx, 180, cy - 120, 200, 210, 8);
    ctx.fillStyle = '#23262C';
    ctx.fill();
    ctx.strokeStyle = '#4A4D55';
    ctx.lineWidth = 2;
    ctx.stroke();
    f.hitRect(info('Кабина лифта', 'Lift cab', 'Движется с ускорением a. Вес зависит от ускорения, а не от скорости.', 'Moves with acceleration a. Weight depends on acceleration, not speed.'), 180, cy - 120, 200, 40);
    // person (floats in free fall)
    const float = t > 10 && t < 13 ? Math.sin((t - 10) * 1.2) * 14 + 12 : 0;
    const py = cy + 70 - float;
    const squash = 1 - clamp((P - p.m * G) / (p.m * G)) * 0.06;
    ctx.save();
    ctx.translate(280, py);
    ctx.scale(1, squash);
    circle(ctx, 0, -120, 14, '#E8C4A0');
    rrect(ctx, -16, -104, 32, 56, 10);
    ctx.fillStyle = '#5B8CFF';
    ctx.fill();
    line(ctx, [[-8, -48], [-10, -2]], '#3A4A6A', 7);
    line(ctx, [[8, -48], [10, -2]], '#3A4A6A', 7);
    line(ctx, [[-16, -96], [-28, -64 - (float ? 30 : 0)]], '#5B8CFF', 6);
    line(ctx, [[16, -96], [28, -64 - (float ? 30 : 0)]], '#5B8CFF', 6);
    ctx.restore();
    f.hit(info('Человек', 'Person', `Масса ${p.m} кг не меняется никогда. Меняется вес — сила давления на опору.`, `Mass ${p.m} kg never changes. What changes is weight, the force on the support.`), 280, py - 80, 40);
    // scale
    rrect(ctx, 240, cy + 72, 80, 14, 4);
    ctx.fillStyle = '#B5B8C0';
    ctx.fill();
    f.hitRect(info('Весы', 'Scale', 'Показывают вес — силу, с которой тело давит на них.', 'They show weight, the force the body presses on them with.'), 240, cy + 72, 80, 14);
    tag(ctx, `${P.toFixed(0)} ${L('Н', 'N')}`, 280, cy + 104, { color: P < 1 ? C.cyan : C.text, size: 13 });
    // acceleration arrow
    if (Math.abs(a) > 0.1) arrow(ctx, 430, 260, 430, 260 - Math.sign(a) * Math.min(100, Math.abs(a) * 10), { color: C.violet, width: 3 });
    tag(ctx, `a = ${a.toFixed(1)}`, 470, 200, { color: C.violet });
    chart(ctx, {
      x: 520, y: 60, w: 410, h: 300, xMax: 14, yMax: p.m * (G + 3), title: L('Показания весов P(t), Н', 'Scale reading P(t), N'),
      xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
      series: [
        { color: C.green, label: L('вес', 'weight'), fn: (x) => p.m * (G + elevatorAcc(x)) },
        { color: alpha(C.amber, 0.6), label: 'mg', fn: () => p.m * G, dash: [4, 4], width: 1.5 },
      ],
    });
    if (t > 10 && t < 13) tag(ctx, L('НЕВЕСОМОСТЬ', 'WEIGHTLESS'), 725, 410, { color: C.cyan, size: 16 });
  },
};

function cabPos(t: number) {
  // displacement for display only (m)
  let v = 0;
  let x = 0;
  const dt = 0.05;
  for (let s = 0; s < t; s += dt) {
    const a = elevatorAcc(s);
    v += (s > 10 && s < 13 ? -G * 0.15 : a) * dt;
    if (s >= 13) v = 0;
    x += v * dt;
  }
  return x;
}

/* ---------- inertia ---------- */

export const inertia: SimDef = {
  id: 'inertia',
  title: tx('Инерция', 'Inertia'),
  modes: [
    { id: 'stop', label: tx('Резкая остановка', 'Sudden stop') },
    { id: 'start', label: tx('Резкий старт', 'Sudden start') },
  ],
  duration: 9,
  loop: false,
  params: [{ id: 'mu', label: tx('Трение кубика о тележку', 'Block–cart friction'), min: 0.05, max: 0.6, step: 0.05, value: 0.15, digits: 2 }],
  stages: (m) =>
    m === 'stop'
      ? [
          { t: 0, label: tx('Едем вместе', 'Moving together'), text: tx('Тележка и кубик движутся с одинаковой скоростью.', 'The cart and the block move at the same speed.') },
          { t: 3, label: tx('Удар', 'Impact'), text: tx('Тележка упёрлась в стену и мгновенно остановилась. На кубик стена не действует.', 'The cart hits the wall and stops dead. The wall doesn’t act on the block.') },
          { t: 3.3, label: tx('Инерция', 'Inertia'), text: tx('Кубик продолжает ехать вперёд, пока его не остановит трение. Так пассажиров бросает вперёд при торможении — пристёгивайтесь!', 'The block keeps going until friction stops it. That’s why passengers lurch forward when a car brakes: buckle up!') },
        ]
      : [
          { t: 0, label: tx('Покой', 'At rest'), text: tx('Кубик спокойно стоит на тележке.', 'The block sits still on the cart.') },
          { t: 2, label: tx('Рывок', 'Jerk'), text: tx('Тележку резко дёргают вперёд. Кубик стремится сохранить покой и отстаёт — съезжает назад относительно тележки.', 'The cart is yanked forward. The block tends to stay at rest and lags behind, sliding back along the cart.') },
          { t: 5, label: tx('Вывод', 'Takeaway'), text: tx('Тело сохраняет скорость, пока на него не подействуют другие тела. Чем больше масса, тем больше инертность.', 'A body keeps its velocity until other bodies act on it. The bigger the mass, the bigger the inertia.') },
        ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const gy = 400;
    ground(ctx, gy, w);
    const v0 = 160; // px/s
    let cartX: number;
    let blockRel: number; // block offset on the cart (px)
    const decel = p.mu * 400;
    if (mode === 'stop') {
      const tc = 3;
      cartX = 100 + v0 * Math.min(t, tc);
      const ts = Math.max(0, t - tc);
      const tStop = v0 / decel;
      const s = ts < tStop ? v0 * ts - 0.5 * decel * ts * ts : (v0 * v0) / (2 * decel);
      blockRel = s;
      rrect(ctx, 100 + v0 * tc + 210, gy - 160, 30, 160, 4);
      ctx.fillStyle = '#4A4D55';
      ctx.fill();
      f.hitRect(info('Стена', 'Wall', 'Действует только на тележку — останавливает её.', 'Acts only on the cart and stops it.'), 100 + v0 * tc + 210, gy - 160, 30, 160);
    } else {
      const tc = 2;
      const acc = 300;
      const ts = Math.max(0, t - tc);
      cartX = 120 + 0.5 * acc * ts * ts * (ts < 2.4 ? 1 : 0) + (ts >= 2.4 ? 0.5 * acc * 2.4 * 2.4 + acc * 2.4 * (ts - 2.4) : 0);
      cartX = Math.min(cartX, 560);
      // block slips back relative to cart while friction can't keep up
      const slip = Math.max(0, acc - decel);
      blockRel = -Math.min(150, 0.5 * slip * Math.min(ts, 1.4) ** 2);
    }
    // cart
    rrect(ctx, cartX, gy - 70, 210, 40, 6);
    ctx.fillStyle = '#F5A524';
    ctx.fill();
    circle(ctx, cartX + 40, gy - 18, 18, '#2A2D33', '#8C8F98', 3);
    circle(ctx, cartX + 170, gy - 18, 18, '#2A2D33', '#8C8F98', 3);
    f.hitRect(info('Тележка', 'Cart', 'Её скорость меняют внешние тела: стена или рука.', 'Outside bodies, a wall or a hand, change its speed.'), cartX, gy - 70, 210, 40);
    // block
    const bx = cartX + 80 + blockRel;
    const onCart = bx > cartX - 30 && bx < cartX + 190;
    const by = onCart ? gy - 120 : gy - 120 + Math.min(70, ((bx - cartX - 190) / 40) ** 2 * 10);
    rrect(ctx, bx, by, 50, 50, 5);
    ctx.fillStyle = '#5B8CFF';
    ctx.fill();
    f.hitRect(info('Кубик', 'Block', 'Сохраняет свою скорость по инерции; изменить её может только сила трения о тележку.', 'Keeps its velocity by inertia; only friction with the cart can change it.'), bx, by, 50, 50);
    tag(ctx, L('кубик сохраняет скорость', 'the block keeps its speed'), 480, 80, { color: C.sky });
  },
};

/* ---------- density ---------- */

const MATERIALS = [
  { name: tx('Пробка', 'Cork'), rho: 240, color: '#C9A06A' },
  { name: tx('Дерево (сосна)', 'Wood (pine)'), rho: 500, color: '#A0703C' },
  { name: tx('Лёд', 'Ice'), rho: 900, color: '#BFE3F5' },
  { name: tx('Алюминий', 'Aluminium'), rho: 2700, color: '#C3C8D0' },
  { name: tx('Железо', 'Iron'), rho: 7800, color: '#7E848E' },
];

export const density: SimDef = {
  id: 'density',
  title: tx('Плотность вещества', 'Density'),
  duration: 14,
  loop: false,
  stages: [
    { t: 0, label: tx('Равные объёмы', 'Equal volumes'), text: tx('Пять кубиков одинакового объёма — 1000 см³, но из разных веществ.', 'Five cubes of the same volume, 1000 cm³, made of different materials.') },
    { t: 2, label: tx('Взвешиваем', 'Weighing'), text: tx('Массы очень разные: плотность ρ = m / V показывает массу 1 м³ вещества.', 'Their masses differ a lot: density ρ = m / V is the mass of 1 m³ of material.') },
    { t: 7, label: tx('В воду', 'Into water'), text: tx('Тела плотнее воды (1000 кг/м³) тонут, менее плотные — плавают. Лёд плавает, погрузившись на 9/10.', 'Bodies denser than water (1000 kg/m³) sink, less dense ones float. Ice floats about 9/10 submerged.') },
  ],
  draw(f) {
    const { ctx, w, h, t, L } = f;
    backdrop(ctx, w, h);
    const gy = 470;
    const waterTop = 300;
    const intoWater = ease(t, 7, 9);
    // tank appears
    ctx.globalAlpha = intoWater;
    waterBox(ctx, 90, 220, 780, gy - 220, waterTop);
    ctx.globalAlpha = 1;
    MATERIALS.forEach((m, i) => {
      const x = 150 + i * 160;
      const size = 70;
      // weighing: a spring balance stretched by mass
      const mass = m.rho / 1000; // kg for 1 dm³
      const weigh = ease(t, 2, 4);
      const stretch = weigh * (1 - intoWater) * Math.min(1, mass / 8) * 70;
      let y = 90 + stretch;
      if (intoWater > 0) {
        const sub = Math.min(1, m.rho / 1000); // submerged fraction when floating
        const floatY = waterTop - size * (1 - sub);
        const sinkY = gy - size;
        const target = m.rho > 1000 ? sinkY : floatY;
        y = lerp(90 + Math.min(1, mass / 8) * 70, target, ease(t, 8, 11));
        if (m.rho <= 1000) y += Math.sin(t * 2 + i) * 2 * ease(t, 10, 11);
      }
      if (intoWater < 1) {
        ctx.globalAlpha = 1 - intoWater;
        line(ctx, [[x + size / 2, 30], [x + size / 2, y]], '#8C8F98', 2);
        // spring
        ctx.strokeStyle = '#B5B8C0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 0; k <= 20; k++) {
          const yy = 40 + (k / 20) * (y - 50);
          const xx = x + size / 2 + (k % 2 ? 7 : -7);
          if (k === 0) ctx.moveTo(x + size / 2, yy);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      rrect(ctx, x, y, size, size, 6);
      ctx.fillStyle = m.color;
      ctx.fill();
      ctx.strokeStyle = alpha('#000000', 0.3);
      ctx.stroke();
      f.hitRect(info(m.name.ru, m.name.en, `ρ = ${m.rho} кг/м³. Масса кубика 1 дм³ = ${(m.rho / 1000).toFixed(2)} кг. ${m.rho > 1000 ? 'Плотнее воды — тонет.' : 'Легче воды — плавает.'}`, `ρ = ${m.rho} kg/m³. A 1 dm³ cube has a mass of ${(m.rho / 1000).toFixed(2)} kg. ${m.rho > 1000 ? 'Denser than water, so it sinks.' : 'Less dense than water, so it floats.'}`), x, y, size, size);
      tag(ctx, m.name[f.lang], x + size / 2, 512, { color: C.text, size: 11.5 });
      if (t > 2.5 && intoWater < 0.5) tag(ctx, `${(m.rho / 1000).toFixed(2)} ${L('кг', 'kg')}`, x + size / 2, y + size + 20, { color: C.amber, size: 12 });
      if (intoWater > 0.5) tag(ctx, `${m.rho}`, x + size / 2, Math.max(y - 16, 236), { color: m.rho > 1000 ? C.red : C.green, size: 11 });
    });
    if (intoWater > 0.5) text(ctx, L('вода: 1000 кг/м³', 'water: 1000 kg/m³'), 860, 286, { size: 12, color: C.sky, align: 'right' });
  },
};

/* ---------- relative motion ---------- */

export const relativeMotion: SimDef = {
  id: 'relative_motion',
  title: tx('Относительность движения', 'Relative motion'),
  modes: [
    { id: 'river', label: tx('Лодка на реке', 'Boat on a river') },
    { id: 'wheel', label: tx('Катящееся колесо', 'Rolling wheel') },
  ],
  duration: 10,
  params: (m) =>
    m === 'river'
      ? [
          { id: 'vb', label: tx('Скорость лодки относительно воды', 'Boat speed in water'), min: 1, max: 4, step: 0.5, value: 2, unit: 'м/с', digits: 1 },
          { id: 'vr', label: tx('Скорость течения', 'Current speed'), min: 0, max: 3, step: 0.5, value: 1.5, unit: 'м/с', digits: 1 },
          { id: 'frame', label: tx('Система отсчёта: 0 — берег, 1 — вода', 'Frame: 0 = bank, 1 = water'), min: 0, max: 1, step: 1, value: 0 },
        ]
      : [{ id: 'frame', label: tx('Система отсчёта: 0 — дорога, 1 — ось колеса', 'Frame: 0 = road, 1 = axle'), min: 0, max: 1, step: 1, value: 0 }],
  stages: (m) =>
    m === 'river'
      ? [
          { t: 0, label: tx('Переправа', 'Crossing'), text: tx('Лодка гребёт поперёк реки, а течение сносит её вниз.', 'The boat rows straight across while the current carries it downstream.') },
          { t: 4, label: tx('Сложение скоростей', 'Adding velocities'), text: tx('Скорость относительно берега = скорость относительно воды + скорость течения (векторно): v = v₁ + v₂.', 'Velocity relative to the bank = velocity relative to the water + current velocity, added as vectors: v = v₁ + v₂.') },
          { t: 7, label: tx('Другая система', 'Another frame'), text: tx('Переключи систему отсчёта на «воду»: для плывущего бревна лодка движется строго поперёк. Траектория зависит от наблюдателя.', 'Switch the frame to the water: to a floating log the boat goes straight across. The path depends on the observer.') },
        ]
      : [
          { t: 0, label: tx('Качение', 'Rolling'), text: tx('Колесо катится без проскальзывания: каждая точка вращается вокруг оси, а ось движется вперёд.', 'The wheel rolls without slipping: every point turns round the axle while the axle moves forward.') },
          { t: 4, label: tx('Скорости точек', 'Point velocities'), text: tx('Относительно дороги верхняя точка летит со скоростью 2v, а нижняя на миг покоится.', 'Relative to the road the top point moves at 2v while the bottom point is momentarily at rest.') },
          { t: 7, label: tx('Циклоида', 'Cycloid'), text: tx('Точка обода рисует циклоиду. В системе оси колеса та же точка просто ходит по кругу.', 'A rim point traces a cycloid. In the axle’s frame the same point just goes round in a circle.') },
        ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'river') {
      const top = 120;
      const bot = 420;
      const sc = 22; // px per m
      ctx.fillStyle = '#2B3A24';
      ctx.fillRect(0, 60, w, top - 60);
      ctx.fillRect(0, bot, w, 80);
      ctx.fillStyle = alpha('#2F6FB5', 0.5);
      ctx.fillRect(0, top, w, bot - top);
      f.hitRect(info('Река', 'River', 'Вода движется относительно берега со скоростью течения.', 'The water moves relative to the bank at the current’s speed.'), 0, top + 100, 80, 100);
      const water = p.frame === 1 ? 0 : p.vr; // water speed seen in the chosen frame
      const bank = p.frame === 1 ? -p.vr : 0;
      // ripples move with the water
      for (let i = 0; i < 40; i++) {
        const x = ((hash(i) * w + water * sc * t) % w + w) % w;
        const y = top + 20 + hash(i, 1) * (bot - top - 40);
        line(ctx, [[x, y], [x + 18, y]], alpha('#BFD8FF', 0.35), 2);
      }
      // trees on banks move with the bank
      for (let i = 0; i < 10; i++) {
        const x = ((i * 110 + bank * sc * t) % (w + 110) + w + 110) % (w + 110) - 40;
        circle(ctx, x, 86, 16, '#2F6B3A');
        circle(ctx, x + 30, bot + 40, 16, '#2F6B3A');
      }
      const crossT = (bot - top - 60) / (p.vb * sc);
      const tt = t % (crossT + 1.5);
      const k = Math.min(tt, crossT);
      const bx = 160 + water * sc * k;
      const by = bot - 40 - p.vb * sc * k;
      // trail
      const pts: [number, number][] = [];
      for (let s = 0; s <= k; s += 0.1) pts.push([160 + water * sc * s, bot - 40 - p.vb * sc * s]);
      line(ctx, pts, alpha(C.amber, 0.7), 2, [6, 5]);
      ctx.save();
      ctx.translate(bx, by);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.quadraticCurveTo(12, 0, 8, 20);
      ctx.lineTo(-8, 20);
      ctx.quadraticCurveTo(-12, 0, 0, -22);
      ctx.fillStyle = '#E8D7A3';
      ctx.fill();
      ctx.restore();
      f.hit(info('Лодка', 'Boat', `Гребёт со скоростью ${p.vb} м/с относительно воды. Относительно берега: ${Math.hypot(p.vb, p.vr).toFixed(1)} м/с.`, `Rows at ${p.vb} m/s relative to the water. Relative to the bank: ${Math.hypot(p.vb, p.vr).toFixed(1)} m/s.`), bx, by, 22);
      // velocity triangle
      const vs = 26;
      arrow(ctx, bx + 30, by, bx + 30, by - p.vb * vs, { color: C.green, width: 3 });
      if (water > 0) {
        arrow(ctx, bx + 30, by - p.vb * vs, bx + 30 + water * vs, by - p.vb * vs, { color: C.cyan, width: 3 });
        arrow(ctx, bx + 30, by, bx + 30 + water * vs, by - p.vb * vs, { color: C.amber, width: 3 });
      }
      tag(ctx, L('v₁ — лодки относительно воды', 'v₁ boat vs water'), 20, 30, { color: C.green, align: 'left' });
      tag(ctx, L('v₂ — течения', 'v₂ current'), 290, 30, { color: C.cyan, align: 'left' });
      tag(ctx, L('v — относительно берега', 'v relative to bank'), 430, 30, { color: C.amber, align: 'left' });
      tag(ctx, p.frame === 1 ? L('смотрим с бревна, плывущего по течению', 'viewed from a drifting log') : L('смотрим с берега', 'viewed from the bank'), w - 20, 30, { color: C.sky, align: 'right' });
      return;
    }
    // rolling wheel
    const R = 80;
    const v = 70; // px/s
    const gy = 420;
    ground(ctx, gy, w);
    const travel = (v * t) % 700;
    const axleX = p.frame === 1 ? 480 : 140 + travel;
    const ang = (v * t) / R;
    const shift = p.frame === 1 ? -travel : 0;
    // cycloid trace of the red point (in road frame)
    const trace: [number, number][] = [];
    const t0 = t - travel / v;
    for (let s = t0; s <= t; s += 0.03) {
      const a = (v * s) / R;
      const cx = p.frame === 1 ? 480 : 140 + v * (s - t0);
      trace.push([cx - R * Math.sin(a), gy - R + R * Math.cos(a)]);
    }
    line(ctx, trace, alpha(C.red, 0.6), 2, [5, 4]);
    // road marks move in axle frame
    for (let i = 0; i < 14; i++) {
      const x = (((i * 80 + shift) % 1120) + 1120) % 1120 - 80;
      line(ctx, [[x, gy + 30], [x + 30, gy + 30]], C.faint, 3);
    }
    circle(ctx, axleX, gy - R, R, '#23262C', '#8C8F98', 6);
    for (let k = 0; k < 6; k++) {
      const a = ang + (k / 6) * TAU;
      line(ctx, [[axleX, gy - R], [axleX - R * Math.sin(a), gy - R + R * Math.cos(a)]], '#4A4D55', 2);
    }
    circle(ctx, axleX, gy - R, 8, '#8C8F98');
    const rx = axleX - R * Math.sin(ang);
    const ry = gy - R + R * Math.cos(ang);
    circle(ctx, rx, ry, 8, C.red);
    f.hit(info('Точка обода', 'Rim point', 'Относительно дороги рисует циклоиду, относительно оси — окружность.', 'Traces a cycloid relative to the road and a circle relative to the axle.'), rx, ry, 10);
    // velocity vectors of top, axle, bottom
    const vv = 0.9;
    if (p.frame === 0) {
      arrow(ctx, axleX, gy - 2 * R, axleX + 2 * v * vv, gy - 2 * R, { color: C.green, width: 3 });
      arrow(ctx, axleX, gy - R, axleX + v * vv, gy - R, { color: C.green, width: 3 });
      circle(ctx, axleX, gy, 5, C.green);
      tag(ctx, '2v', axleX + 2 * v * vv + 22, gy - 2 * R, { color: C.green });
      tag(ctx, 'v', axleX + v * vv + 18, gy - R, { color: C.green });
      tag(ctx, '0', axleX + 22, gy - 8, { color: C.green });
    } else {
      arrow(ctx, axleX, gy - 2 * R, axleX + v * vv, gy - 2 * R, { color: C.green, width: 3 });
      arrow(ctx, axleX, gy, axleX - v * vv, gy, { color: C.green, width: 3 });
      tag(ctx, 'v', axleX + v * vv + 16, gy - 2 * R, { color: C.green });
      tag(ctx, '−v', axleX - v * vv - 20, gy, { color: C.green });
    }
    tag(ctx, p.frame === 1 ? L('система отсчёта оси колеса', 'axle frame') : L('система отсчёта дороги', 'road frame'), w - 20, 40, { color: C.sky, align: 'right' });
  },
};
