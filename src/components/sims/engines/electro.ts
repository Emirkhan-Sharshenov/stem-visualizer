import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, rrect, seg, SimDef, tag, TAU, text, tx, wave, wobble } from '../kit';

const ELECTRON = info('Электрон', 'Electron', 'Отрицательно заряженная частица, заряд −1,6·10⁻¹⁹ Кл. Именно электроны переходят при электризации и создают ток в металлах.', 'A negatively charged particle, −1.6·10⁻¹⁹ C. Electrons are what move during charging and carry current in metals.');

function charge(ctx: CanvasRenderingContext2D, x: number, y: number, sign: 1 | -1, r = 7) {
  ball(ctx, x, y, r, sign > 0 ? C.red : C.blue);
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x + r * 0.45, y);
  if (sign > 0) {
    ctx.moveTo(x, y - r * 0.45);
    ctx.lineTo(x, y + r * 0.45);
  }
  ctx.stroke();
}

/* ---------- electrostatics ---------- */

export const electrostatics: SimDef = {
  id: 'electrostatics',
  title: tx('Электростатика', 'Electrostatics'),
  modes: [
    { id: 'rub', label: tx('Электризация', 'Charging by friction') },
    { id: 'field', label: tx('Поле зарядов', 'Field of charges') },
    { id: 'conductor', label: tx('Проводник в поле', 'Conductor in a field') },
    { id: 'capacitor', label: tx('Конденсатор', 'Capacitor') },
  ],
  duration: (m) => (m === 'field' ? 10 : 12),
  loop: false,
  params: (m) =>
    m === 'field'
      ? [{ id: 'q2', label: tx('Второй заряд', 'Second charge'), min: -2, max: 2, step: 1, value: -1 }]
      : m === 'capacitor'
        ? [
            { id: 'eps', label: tx('Диэлектрик ε', 'Dielectric ε'), min: 1, max: 7, step: 1, value: 1 },
            { id: 'd', label: tx('Расстояние между пластинами', 'Plate gap'), min: 1, max: 4, step: 0.5, value: 2, unit: 'мм', digits: 1 },
          ]
        : [],
  stages: (m) =>
    m === 'rub'
      ? [
          { t: 0, label: tx('Нейтральны', 'Neutral'), text: tx('В палочке и шерсти поровну протонов и электронов — тела не заряжены.', 'The rod and the wool each have equal protons and electrons, so neither is charged.') },
          { t: 2, label: tx('Трение', 'Rubbing'), text: tx('При тесном контакте часть электронов переходит с шерсти на эбонит: он удерживает их сильнее.', 'In close contact some electrons jump from the wool to the ebonite, which holds them more tightly.') },
          { t: 7, label: tx('Заряжены', 'Charged'), text: tx('Палочка заряжена отрицательно (лишние электроны), шерсть — положительно (электронов не хватает). Заряд не создаётся — он перераспределяется.', 'The rod is now negative (extra electrons) and the wool positive (missing electrons). Charge isn’t created, only moved.') },
          { t: 9.5, label: tx('Притяжение', 'Attraction'), text: tx('Заряженная палочка притягивает лёгкие бумажки — даже незаряженные.', 'The charged rod attracts light bits of paper, even uncharged ones.') },
        ]
      : m === 'field'
        ? [
            { t: 0, label: tx('Силовые линии', 'Field lines'), text: tx('Линии выходят из «+» и входят в «−». Где линии гуще — поле сильнее.', 'Lines start on + and end on −. Where they crowd together the field is stronger.') },
            { t: 4, label: tx('Пробный заряд', 'Test charge'), text: tx('Маленький положительный заряд движется вдоль силовой линии — так направлена сила F = qE.', 'A small positive charge drifts along a field line, the direction of the force F = qE.') },
          ]
        : m === 'conductor'
          ? [
              { t: 0, label: tx('Внешнее поле', 'External field'), text: tx('Металлический шар вносят в однородное поле. В металле есть свободные электроны.', 'A metal ball is placed in a uniform field. The metal contains free electrons.') },
              { t: 2, label: tx('Разделение зарядов', 'Charges separate'), text: tx('Электроны смещаются против поля к одной стороне — на другой остаётся «+». Это электростатическая индукция.', 'Electrons shift against the field to one side, leaving + on the other. This is electrostatic induction.') },
              { t: 7, label: tx('Поле внутри = 0', 'Zero field inside'), text: tx('Поле зарядов на поверхности гасит внешнее: внутри проводника поля нет. На этом основана экранировка (клетка Фарадея).', 'The surface charges cancel the outside field, leaving no field inside the conductor. That’s how shielding (a Faraday cage) works.') },
            ]
          : [
              { t: 0, label: tx('Зарядка', 'Charging'), text: tx('Источник перекачивает электроны с одной пластины на другую. Напряжение на конденсаторе растёт.', 'The source pumps electrons from one plate to the other. The voltage across the capacitor rises.') },
              { t: 6, label: tx('Заряжен', 'Charged'), text: tx('Между пластинами — однородное поле, в нём запасена энергия W = CU²/2.', 'A uniform field fills the gap and stores energy W = CU²/2.') },
              { t: 8, label: tx('Ёмкость', 'Capacitance'), text: tx('C = εε₀S/d: диэлектрик и малый зазор увеличивают ёмкость — больше заряда при том же напряжении.', 'C = εε₀S/d: a dielectric and a smaller gap raise the capacitance, so more charge at the same voltage.') },
            ],
  metrics: ({ t, p, mode }) => {
    if (mode !== 'capacitor') return [];
    const S = 0.01;
    const Cc = (p.eps * 8.85e-12 * S) / (p.d / 1000);
    const U = 12 * (1 - Math.exp(-t / 1.5));
    return [
      { label: tx('Ёмкость', 'Capacitance'), value: `${(Cc * 1e12).toFixed(0)} пФ` },
      { label: tx('Напряжение', 'Voltage'), value: `${U.toFixed(1)} В` },
      { label: tx('Заряд', 'Charge'), value: `${(Cc * U * 1e9).toFixed(2)} нКл` },
      { label: tx('Энергия', 'Energy'), value: `${((Cc * U * U) / 2 * 1e9).toFixed(1)} нДж`, tone: 'good' },
    ];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'rub') {
      const rub = t > 2 && t < 7 ? Math.sin((t - 2) * 6) * 60 : 0;
      const transferred = Math.floor(ease(t, 2.2, 6.8) * 8);
      // ebonite rod
      const rodX = 260;
      const rodY = 220;
      const away = ease(t, 7, 8.5) * 220;
      const rx = rodX + away;
      rrect(ctx, rx, rodY, 360, 46, 23);
      ctx.fillStyle = '#2B2D33';
      ctx.fill();
      ctx.strokeStyle = '#4A4D55';
      ctx.stroke();
      f.hitRect(info('Эбонитовая палочка', 'Ebonite rod', 'Удерживает электроны сильнее шерсти, поэтому при трении забирает их и заряжается отрицательно.', 'Holds electrons more tightly than wool, so rubbing transfers them to it and it becomes negative.'), rx, rodY, 360, 46);
      // wool
      const wx = 300 + rub;
      const wy = 270;
      ctx.fillStyle = '#C9B48A';
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * TAU;
        const r = 54 + 6 * Math.sin(i * 3);
        ctx.lineTo(wx + Math.cos(a) * r * 1.2, wy + 46 + Math.sin(a) * r * 0.6);
      }
      ctx.closePath();
      ctx.fill();
      f.hit(info('Шерсть', 'Wool', 'Отдаёт часть электронов и заряжается положительно.', 'Gives up some electrons and becomes positive.'), wx, wy + 46, 50);
      // charges on rod: 8 pairs + transferred electrons
      for (let i = 0; i < 8; i++) {
        const x = rx + 30 + i * 40;
        charge(ctx, x, rodY + 14, 1, 6);
        charge(ctx, x + 14, rodY + 32, -1, 6);
      }
      for (let i = 0; i < 8; i++) {
        const done = i < transferred;
        const x0 = wx - 70 + (i % 4) * 46;
        const y0 = wy + 30 + Math.floor(i / 4) * 30;
        charge(ctx, x0, y0, 1, 6);
        const ex = done ? rx + 50 + i * 40 : x0 + 16;
        const ey = done ? rodY + 23 + (i % 2 ? -4 : 4) : y0 + 8;
        const fly = done ? ease(t, 2.2 + (i / 8) * 4.6, 2.2 + (i / 8) * 4.6 + 0.5) : 0;
        charge(ctx, lerp(x0 + 16, ex, fly), lerp(y0 + 8, ey, fly), -1, 6);
        if (i === 0) f.hit(ELECTRON, lerp(x0 + 16, ex, fly), lerp(y0 + 8, ey, fly), 8);
      }
      tag(ctx, `${L('палочка', 'rod')}: ${transferred > 0 ? '−' : ''}${transferred}e`, rx + 180, rodY - 26, { color: C.blue });
      tag(ctx, `${L('шерсть', 'wool')}: ${transferred > 0 ? '+' : ''}${transferred}e`, wx, wy + 120, { color: C.red });
      // paper bits jump up
      if (t > 8.5) {
        for (let i = 0; i < 7; i++) {
          const px = rx + 60 + i * 42;
          const lift = ease(t, 9.5 + i * 0.15, 10.2 + i * 0.15);
          const py = lerp(470, rodY + 56, lift) + (lift > 0.99 ? 0 : wobble(i, t, 4) * 2);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(hash(i) * 2);
          ctx.fillStyle = '#E8E4D8';
          ctx.fillRect(-7, -4, 14, 8);
          ctx.restore();
        }
        line(ctx, [[rx, 478], [rx + 360, 478]], '#4A4D55', 2);
      }
      return;
    }

    if (mode === 'field') {
      const q1 = { x: 350, y: 270, q: 1 };
      const q2 = { x: 610, y: 270, q: p.q2 };
      const qs = [q1, q2].filter((q) => q.q !== 0);
      const E = (x: number, y: number) => {
        let ex = 0;
        let ey = 0;
        qs.forEach((q) => {
          const dx = x - q.x;
          const dy = y - q.y;
          const r2 = dx * dx + dy * dy + 1;
          const r3 = r2 * Math.sqrt(r2);
          ex += (q.q * dx) / r3;
          ey += (q.q * dy) / r3;
        });
        return [ex, ey];
      };
      const grow = ease(t, 0, 3);
      // field lines traced from positive charges (or into negative)
      qs.forEach((q) => {
        const n = Math.round(16 * Math.abs(q.q));
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + 0.1;
          let x = q.x + Math.cos(a) * 14;
          let y = q.y + Math.sin(a) * 14;
          const dir = q.q > 0 ? 1 : -1;
          if (dir < 0 && qs.some((o) => o.q > 0)) continue; // drawn from the positive side
          const pts: [number, number][] = [[x, y]];
          const steps = Math.floor(260 * grow);
          for (let s = 0; s < steps; s++) {
            const [ex, ey] = E(x, y);
            const m = Math.hypot(ex, ey) || 1;
            x += (dir * ex * 4) / m;
            y += (dir * ey * 4) / m;
            pts.push([x, y]);
            if (x < 0 || x > w || y < 0 || y > h) break;
            if (qs.some((o) => o !== q && Math.hypot(x - o.x, y - o.y) < 12)) break;
          }
          line(ctx, pts, alpha(C.sky, 0.55), 1.5);
          const mid = pts[Math.floor(pts.length * 0.35)];
          const nxt = pts[Math.floor(pts.length * 0.35) + 1];
          if (mid && nxt) arrow(ctx, mid[0], mid[1], nxt[0] + (nxt[0] - mid[0]) * 2, nxt[1] + (nxt[1] - mid[1]) * 2, { color: alpha(C.sky, 0.7), width: 1.5, head: 7 });
        }
      });
      qs.forEach((q) => {
        charge(ctx, q.x, q.y, q.q > 0 ? 1 : -1, 16 + 3 * Math.abs(q.q));
        f.hit(info(q.q > 0 ? 'Положительный заряд' : 'Отрицательный заряд', q.q > 0 ? 'Positive charge' : 'Negative charge', 'Создаёт вокруг себя электрическое поле. E = kq/r² — поле слабеет с квадратом расстояния.', 'Creates an electric field around it. E = kq/r²: the field weakens with the square of the distance.'), q.x, q.y, 20);
      });
      // test charge drifting along the field
      if (t > 4) {
        let x = 350 + 30;
        let y = 270 - 40;
        const steps = Math.floor((t - 4) * 60);
        for (let s = 0; s < steps; s++) {
          const [ex, ey] = E(x, y);
          const m = Math.hypot(ex, ey) || 1;
          x += (ex * 2.5) / m;
          y += (ey * 2.5) / m;
          if (qs.some((o) => o.q < 0 && Math.hypot(x - o.x, y - o.y) < 22) || x < 10 || x > w - 10 || y < 10 || y > h - 10) break;
        }
        charge(ctx, x, y, 1, 7);
        f.hit(info('Пробный заряд', 'Test charge', 'Маленький положительный заряд, по силе на который судят о поле: E = F/q.', 'A small positive charge used to probe the field: E = F/q.'), x, y, 9);
      }
      tag(ctx, p.q2 > 0 ? L('одноимённые — отталкиваются', 'like charges repel') : p.q2 < 0 ? L('разноимённые — притягиваются', 'unlike charges attract') : L('один заряд', 'single charge'), 480, 40, { color: C.sky });
      return;
    }

    if (mode === 'conductor') {
      const cx = 480;
      const cy = 270;
      const R = 110;
      const sep = ease(t, 2, 6);
      // external field lines bending around the ball
      for (let i = 0; i < 9; i++) {
        const y0 = 70 + i * 50;
        const pts: [number, number][] = [];
        for (let x = 40; x <= w - 40; x += 6) {
          const dy = y0 - cy;
          const dx = x - cx;
          const r = Math.hypot(dx, dy);
          let y = y0;
          if (r < R + 60) y = y0 + Math.sign(dy || 1) * sep * Math.max(0, R + 60 - r) * 0.5 * (Math.abs(dy) < R ? 1 : 0.4);
          if (Math.hypot(x - cx, y - cy) < R && sep > 0.5) {
            pts.push([x, y]);
            line(ctx, pts.splice(0), alpha(C.sky, 0.45), 1.5);
            continue;
          }
          pts.push([x, y]);
        }
        line(ctx, pts, alpha(C.sky, 0.45), 1.5);
        arrow(ctx, 60, y0, 90, y0, { color: alpha(C.sky, 0.7), width: 1.5, head: 7 });
      }
      circle(ctx, cx, cy, R, '#3A3D45', '#8C8F98', 3);
      f.hit(info('Металлический шар', 'Metal ball', 'Свободные электроны внутри металла смещаются под действием поля, пока поле внутри не станет нулевым.', 'Free electrons inside the metal shift under the field until the field inside is zero.'), cx, cy, R);
      for (let i = 0; i < 14; i++) {
        const a = Math.PI / 2 + (i / 13 - 0.5) * Math.PI * 0.9;
        const ix = cx + Math.cos(a) * (R - 18) * 0.25 - 20 + hash(i) * 40;
        const iy = cy + (hash(i, 2) - 0.5) * 140;
        // electrons drift to the left side (against the field)
        const ex = lerp(ix, cx - (R - 14) * Math.cos((i / 13 - 0.5) * Math.PI * 0.9), sep);
        const ey = lerp(iy, cy + (R - 14) * Math.sin((i / 13 - 0.5) * Math.PI * 0.9), sep);
        charge(ctx, ex, ey, -1, 6);
        const px = lerp(ix + 14, cx + (R - 14) * Math.cos((i / 13 - 0.5) * Math.PI * 0.9), sep);
        charge(ctx, px, ey, 1, 6);
      }
      if (sep > 0.9) tag(ctx, 'E = 0', cx, cy, { color: C.green, size: 15 });
      return;
    }

    // capacitor
    const U = 1 - Math.exp(-t / 1.5);
    const gap = 40 + p.d * 30;
    const px1 = 480 - gap / 2;
    const px2 = 480 + gap / 2;
    const top = 120;
    const ph = 260;
    // dielectric slab
    if (p.eps > 1) {
      ctx.fillStyle = alpha(C.violet, 0.12 + p.eps * 0.03);
      ctx.fillRect(px1 + 6, top, gap - 12, ph);
      f.hitRect(info('Диэлектрик', 'Dielectric', `ε = ${p.eps}. Его молекулы поляризуются и ослабляют поле, позволяя накопить в ε раз больше заряда.`, `ε = ${p.eps}. Its molecules polarise and weaken the field, letting the plates hold ε times more charge.`), px1 + 6, top, gap - 12, ph);
    }
    [px1, px2].forEach((x, k) => {
      rrect(ctx, x - 6, top, 12, ph, 3);
      ctx.fillStyle = '#B5B8C0';
      ctx.fill();
      f.hitRect(info(k ? 'Отрицательная пластина' : 'Положительная пластина', k ? 'Negative plate' : 'Positive plate', 'Металлическая пластина. Заряды пластин равны по величине и противоположны по знаку.', 'A metal plate. The two plates carry equal and opposite charges.'), x - 6, top, 12, ph);
    });
    const nq = Math.round(U * 8 * Math.min(2.5, p.eps / p.d * 2) / 1.6);
    for (let i = 0; i < Math.min(14, nq); i++) {
      const y = top + 14 + (i * (ph - 28)) / 13;
      charge(ctx, px1 - 16, y, 1, 6);
      charge(ctx, px2 + 16, y, -1, 6);
    }
    // field lines between plates
    ctx.globalAlpha = U;
    for (let i = 0; i < 7; i++) {
      const y = top + 25 + i * 35;
      arrow(ctx, px1 + 8, y, px2 - 8, y, { color: alpha(C.sky, 0.8), width: 1.5, head: 7 });
    }
    ctx.globalAlpha = 1;
    // circuit with battery
    line(ctx, [[px1, top], [px1, 70], [420, 70]], '#8C8F98', 3);
    line(ctx, [[540, 70], [px2, 70], [px2, top]], '#8C8F98', 3);
    line(ctx, [[440, 50], [440, 90]], C.text, 3);
    line(ctx, [[455, 58], [455, 82]], C.text, 6);
    line(ctx, [[505, 50], [505, 90]], C.text, 3);
    line(ctx, [[520, 58], [520, 82]], C.text, 6);
    line(ctx, [[420, 70], [440, 70]], '#8C8F98', 3);
    line(ctx, [[520, 70], [540, 70]], '#8C8F98', 3);
    f.hitRect(info('Источник 12 В', '12 V source', 'Перекачивает электроны с левой пластины на правую, пока напряжение конденсатора не станет 12 В.', 'Pumps electrons from the left plate to the right until the capacitor reaches 12 V.'), 430, 45, 100, 50);
    // moving electrons in wires while charging
    const I = Math.exp(-t / 1.5);
    for (let i = 0; i < 6; i++) {
      const s = (t * 0.8 + i / 6) % 1;
      if (I < 0.05) break;
      const x = lerp(px1, 420, s);
      circle(ctx, x, 70, 3.5, alpha(C.blue, I));
      const x2 = lerp(540, px2, s);
      circle(ctx, x2, 70, 3.5, alpha(C.blue, I));
    }
    chart(ctx, {
      x: 640, y: 300, w: 290, h: 200, xMax: 12, yMax: 13, title: L('Напряжение U(t), В', 'Voltage U(t), V'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
      series: [{ color: C.green, fn: (x) => 12 * (1 - Math.exp(-x / 1.5)) }],
    });
  },
};

/* ---------- current in different media ---------- */

export const currentMedia: SimDef = {
  id: 'current_media',
  title: tx('Электрический ток в средах', 'Current in different media'),
  modes: [
    { id: 'metal', label: tx('Металлы', 'Metals') },
    { id: 'semi', label: tx('Полупроводники', 'Semiconductors') },
    { id: 'vacuum', label: tx('Вакуум', 'Vacuum') },
    { id: 'gas', label: tx('Газы', 'Gases') },
  ],
  duration: 12,
  params: (m) =>
    m === 'metal'
      ? [{ id: 'T', label: tx('Температура', 'Temperature'), min: 0, max: 600, step: 50, value: 20, unit: '°C' }]
      : m === 'semi'
        ? [{ id: 'T', label: tx('Температура', 'Temperature'), min: -50, max: 150, step: 25, value: 25, unit: '°C' }]
        : m === 'vacuum'
          ? [{ id: 'heat', label: tx('Накал катода', 'Cathode heating'), min: 0, max: 1, step: 0.1, value: 0.8, digits: 1 }]
          : [{ id: 'U', label: tx('Напряжение', 'Voltage'), min: 0, max: 1, step: 0.1, value: 0.6, digits: 1 }],
  stages: (m) =>
    m === 'metal'
      ? [
          { t: 0, label: tx('Электронный газ', 'Electron gas'), text: tx('Ионы металла стоят в узлах решётки, а между ними хаотично носятся свободные электроны.', 'Metal ions sit at lattice sites while free electrons dart around between them.') },
          { t: 3, label: tx('Поле включено', 'Field on'), text: tx('Электроны медленно дрейфуют против поля — это и есть ток. Скорость дрейфа — доли мм/с, а сигнал летит почти со скоростью света.', 'Electrons slowly drift against the field, and that drift is the current. It’s a fraction of a mm/s, yet the signal travels near light speed.') },
          { t: 7, label: tx('Сопротивление', 'Resistance'), text: tx('Электроны сталкиваются с колеблющимися ионами. Нагрей металл: ионы качаются сильнее, сопротивление растёт.', 'Electrons bump into vibrating ions. Heat the metal: the ions swing harder and resistance rises.') },
        ]
      : m === 'semi'
        ? [
            { t: 0, label: tx('Кремний', 'Silicon'), text: tx('Все электроны заняты в ковалентных связях — при низкой температуре кремний почти изолятор.', 'All electrons are tied up in covalent bonds, so cold silicon is nearly an insulator.') },
            { t: 3, label: tx('Пары', 'Pairs'), text: tx('Тепло вырывает электроны из связей; на их месте остаются «дырки» — положительные вакансии. Ток создают и те, и другие.', 'Heat frees electrons from bonds, leaving holes, positive vacancies. Both carry current.') },
            { t: 8, label: tx('Не как металл', 'Unlike metals'), text: tx('С ростом температуры носителей становится больше, и сопротивление полупроводника падает. На этом работают термисторы.', 'Warmer means more carriers, so a semiconductor’s resistance drops. Thermistors rely on this.') },
          ]
        : m === 'vacuum'
          ? [
              { t: 0, label: tx('Термоэмиссия', 'Thermionic emission'), text: tx('Нагретый катод испускает электроны — они «испаряются» из металла.', 'A heated cathode emits electrons; they “boil off” the metal.') },
              { t: 3, label: tx('Анод', 'Anode'), text: tx('Положительный анод притягивает электроны: в вакууме течёт ток. В обратную сторону — нет: это вакуумный диод.', 'The positive anode pulls the electrons across: current flows through the vacuum. Never the other way, so it’s a vacuum diode.') },
              { t: 8, label: tx('Применение', 'Uses'), text: tx('Электронные пучки — в старых кинескопах, рентгеновских трубках и электронных микроскопах.', 'Electron beams power old CRT screens, X-ray tubes and electron microscopes.') },
            ]
          : [
              { t: 0, label: tx('Газ — изолятор', 'Gas insulates'), text: tx('Молекулы газа нейтральны, носителей почти нет.', 'Gas molecules are neutral; there are almost no carriers.') },
              { t: 3, label: tx('Ионизация', 'Ionisation'), text: tx('Разогнанный полем электрон выбивает из молекулы ещё один — получается ион и два электрона.', 'A field-accelerated electron knocks another one out of a molecule, giving an ion and two electrons.') },
              { t: 6, label: tx('Лавина', 'Avalanche'), text: tx('Процесс нарастает лавиной — газ светится. Так горят молнии, неон и северное сияние. Сильно ионизированный газ — плазма.', 'The process snowballs and the gas glows: lightning, neon signs and auroras. A strongly ionised gas is plasma.') },
            ],
  metrics: ({ p, mode }) => {
    if (mode === 'metal') return [{ label: tx('Сопротивление (медь)', 'Resistance (copper)'), value: `${(1 + 0.0043 * (p.T - 20)).toFixed(2)} R₀` }];
    if (mode === 'semi') return [{ label: tx('Сопротивление (кремний)', 'Resistance (silicon)'), value: `${Math.exp(4000 * (1 / (p.T + 273) - 1 / 298)).toFixed(2)} R₀` }];
    return [];
  },
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const field = ease(t, 3, 4);
    if (mode === 'metal') {
      const x0 = 120;
      const y0 = 110;
      const cols = 12;
      const rows = 6;
      const dx = 64;
      const dy = 60;
      const amp = 2 + (p.T / 600) * 9;
      rrect(ctx, x0 - 40, y0 - 40, (cols - 1) * dx + 80, (rows - 1) * dy + 80, 14);
      ctx.fillStyle = '#1B1D22';
      ctx.fill();
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const id = r * 50 + c;
          ball(ctx, x0 + c * dx + wobble(id, t, 8) * amp, y0 + r * dy + wobble(id + 7, t, 8) * amp, 13, '#C77A3A');
        }
      f.hit(info('Ион решётки', 'Lattice ion', 'Положительный ион меди. Колеблется около узла: чем горячее, тем сильнее — и тем чаще мешает электронам.', 'A positive copper ion vibrating about its site. The hotter it is, the more it swings and gets in the electrons’ way.'), x0 + 3 * dx, y0 + 2 * dy, 14);
      const drift = field * (40 / (1 + 0.0043 * (p.T - 20) * 3));
      for (let i = 0; i < 60; i++) {
        const bx = hash(i) * ((cols - 1) * dx + 40);
        const by = hash(i, 1) * ((rows - 1) * dy + 40);
        const x = x0 - 20 + ((((bx - drift * t + wobble(i, t, 2.5) * 40) % 744) + 744) % 744);
        const y = y0 - 20 + by + wobble(i + 30, t, 2.5) * 20;
        circle(ctx, x, Math.max(y0 - 30, Math.min(y0 + (rows - 1) * dy + 30, y)), 4, C.cyan);
      }
      f.hit(ELECTRON, x0 + 5.5 * dx, y0 + 2.5 * dy, 30);
      if (field > 0) {
        arrow(ctx, 380, 480, 600, 480, { color: alpha(C.amber, field), width: 3 });
        tag(ctx, L('поле E', 'field E'), 640, 480, { color: C.amber });
        arrow(ctx, 600, 510, 380, 510, { color: alpha(C.cyan, field), width: 2 });
        tag(ctx, L('дрейф электронов', 'electron drift'), 300, 510, { color: C.cyan });
      }
      return;
    }
    if (mode === 'semi') {
      const x0 = 150;
      const y0 = 110;
      const cols = 10;
      const rows = 6;
      const dx = 74;
      const dy = 62;
      // bonds
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          if (c < cols - 1) line(ctx, [[x0 + c * dx, y0 + r * dy], [x0 + (c + 1) * dx, y0 + r * dy]], '#3A3D45', 4);
          if (r < rows - 1) line(ctx, [[x0 + c * dx, y0 + r * dy], [x0 + c * dx, y0 + (r + 1) * dy]], '#3A3D45', 4);
        }
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ball(ctx, x0 + c * dx, y0 + r * dy, 14, '#7E848E');
      f.hit(info('Атом кремния', 'Silicon atom', 'Четыре валентных электрона, каждый в паре с соседом — ковалентная связь.', 'Four valence electrons, each shared with a neighbour in a covalent bond.'), x0 + 2 * dx, y0 + 2 * dy, 15);
      const kT = clamp((p.T + 50) / 200);
      const pairs = Math.round(2 + kT * 14 * ease(t, 2, 5));
      for (let i = 0; i < pairs; i++) {
        const c = Math.floor(hash(i, 3) * (cols - 1));
        const r = Math.floor(hash(i, 4) * rows);
        const hx0 = x0 + c * dx + dx / 2;
        const hy = y0 + r * dy;
        // hole hops with the field, electron drifts against it
        const hop = field * ((t * 30 + i * 13) % 300);
        circle(ctx, hx0 + hop * 0.5 - 75, hy, 7, 'rgba(0,0,0,0)', C.red, 2.2);
        const ex = hx0 - hop + 40 + wobble(i, t, 3) * 15;
        const ey = hy + 30 + wobble(i + 9, t, 3) * 12;
        circle(ctx, ((ex - 100) % 700 + 700) % 700 + 100, ey, 5, C.cyan);
      }
      f.hit(info('Дырка', 'Hole', 'Место, откуда ушёл электрон. Соседний электрон перескакивает в неё — и дырка «движется» как положительный заряд.', 'The gap a freed electron leaves behind. A neighbouring electron hops in, so the hole moves like a positive charge.'), x0 + 4 * dx, y0 + 3 * dy, 30);
      tag(ctx, `${L('пар электрон–дырка', 'electron–hole pairs')}: ${pairs}`, 480, 40, { color: C.sky });
      return;
    }
    if (mode === 'vacuum') {
      // tube
      rrect(ctx, 140, 120, 680, 300, 140);
      ctx.fillStyle = alpha('#8FA4FF', 0.05);
      ctx.fill();
      ctx.strokeStyle = alpha('#B5B8C0', 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
      // cathode (glowing filament)
      const glow = p.heat;
      rrect(ctx, 230, 190, 24, 160, 6);
      ctx.fillStyle = `rgb(${Math.round(90 + 165 * glow)},${Math.round(60 + 90 * glow)},${Math.round(40)})`;
      ctx.fill();
      if (glow > 0.2) {
        ctx.shadowColor = C.orange;
        ctx.shadowBlur = 30 * glow;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      f.hitRect(info('Катод', 'Cathode', 'Нагретая нить. Чем горячее, тем больше электронов вылетает (термоэлектронная эмиссия).', 'A heated filament. The hotter it is, the more electrons fly out (thermionic emission).'), 230, 190, 24, 160);
      rrect(ctx, 700, 170, 26, 200, 4);
      ctx.fillStyle = '#8C8F98';
      ctx.fill();
      f.hitRect(info('Анод', 'Anode', 'Подключён к «+». Притягивает электроны — ток идёт только от катода к аноду.', 'Connected to +. It attracts the electrons, so current flows only from cathode to anode.'), 700, 170, 26, 200);
      const n = Math.round(40 * glow);
      for (let i = 0; i < n; i++) {
        const s = (t * 0.45 * (0.8 + hash(i) * 0.4) + hash(i, 1)) % 1;
        const on = ease(t, 3, 3.6);
        const x = lerp(256, on > 0 ? 698 : 300, s * (on > 0 ? 1 : 0.4));
        const y = 200 + hash(i, 2) * 140 + Math.sin(s * 6 + i) * 6;
        circle(ctx, x, y, 3.5, C.cyan);
      }
      text(ctx, '−', 242, 380, { size: 22, color: C.blue });
      text(ctx, '+', 713, 390, { size: 22, color: C.red });
      tag(ctx, L('вакуум', 'vacuum'), 480, 140, { color: C.dim });
      return;
    }
    // gas discharge
    rrect(ctx, 120, 160, 720, 220, 30);
    const avalanche = ease(t, 5, 9) * p.U;
    ctx.fillStyle = alpha(C.violet, 0.05 + avalanche * 0.35);
    ctx.fill();
    ctx.strokeStyle = alpha('#B5B8C0', 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    rrect(ctx, 130, 190, 16, 160, 4);
    ctx.fillStyle = '#8C8F98';
    ctx.fill();
    rrect(ctx, 814, 190, 16, 160, 4);
    ctx.fill();
    f.hitRect(info('Газоразрядная трубка', 'Discharge tube', 'Разреженный газ между электродами. При большом напряжении в нём начинается разряд — газ светится.', 'Thin gas between two electrodes. At high voltage a discharge starts and the gas glows.'), 300, 170, 360, 40);
    for (let i = 0; i < 30; i++) {
      const x = 180 + hash(i) * 600 + wobble(i, t, 1) * 8;
      const y = 200 + hash(i, 1) * 140 + wobble(i + 4, t, 1) * 8;
      const ionised = hash(i, 5) < ease(t, 3, 9) * p.U;
      ball(ctx, x, y, 10, ionised ? C.violet : '#5A5D66');
      if (ionised) text(ctx, '+', x, y, { size: 11, color: C.white });
      if (i === 0) f.hit(info(ionised ? 'Ион' : 'Молекула газа', ionised ? 'Ion' : 'Gas molecule', 'Потеряв электрон, молекула становится положительным ионом и летит к катоду.', 'Having lost an electron, the molecule becomes a positive ion and heads for the cathode.'), x, y, 12);
    }
    const ne = Math.round(3 + 50 * avalanche);
    for (let i = 0; i < ne; i++) {
      const s = (t * (0.5 + p.U * 0.6) + hash(i, 6)) % 1;
      const x = lerp(150, 810, s);
      const y = 200 + hash(i, 7) * 140;
      circle(ctx, x, y, 3, C.cyan);
    }
    if (avalanche > 0.3) {
      // little flashes
      for (let i = 0; i < 8; i++) {
        const fx = 200 + hash(i, Math.floor(t * 8)) * 560;
        const fy = 210 + hash(i + 3, Math.floor(t * 8)) * 120;
        circle(ctx, fx, fy, 10 * avalanche, alpha(C.violet, 0.4));
      }
    }
    tag(ctx, `${L('напряжение', 'voltage')}: ${(p.U * 100).toFixed(0)}%`, 480, 120, { color: C.amber });
  },
};

/* ---------- magnetism ---------- */

export const magnetism: SimDef = {
  id: 'magnetism',
  title: tx('Магнитное поле', 'Magnetic field'),
  modes: [
    { id: 'magnet', label: tx('Постоянный магнит', 'Bar magnet') },
    { id: 'earth', label: tx('Поле Земли', 'Earth’s field') },
    { id: 'lorentz', label: tx('Сила Лоренца', 'Lorentz force') },
    { id: 'domains', label: tx('Намагничивание', 'Magnetising') },
  ],
  duration: 12,
  loop: false,
  params: (m) =>
    m === 'lorentz'
      ? [
          { id: 'B', label: tx('Индукция B', 'Field B'), min: 0.5, max: 2, step: 0.25, value: 1, unit: 'Тл', digits: 2 },
          { id: 'v', label: tx('Скорость частицы', 'Particle speed'), min: 0.5, max: 2, step: 0.25, value: 1, unit: '×', digits: 2 },
          { id: 'q', label: tx('Знак заряда (−1 электрон, +1 протон)', 'Charge sign (−1 electron, +1 proton)'), min: -1, max: 1, step: 2, value: 1 },
        ]
      : m === 'domains'
        ? [{ id: 'H', label: tx('Внешнее поле катушки', 'Coil field'), min: 0, max: 1, step: 0.1, value: 0.8, digits: 1 }]
        : [],
  stages: (m) =>
    m === 'magnet'
      ? [
          { t: 0, label: tx('Опилки', 'Filings'), text: tx('Железные опилки выстраиваются вдоль невидимых линий поля.', 'Iron filings line up along the invisible field lines.') },
          { t: 4, label: tx('Компас', 'Compass'), text: tx('Стрелка компаса — маленький магнит. Её северный конец показывает направление поля: линии выходят из N и входят в S.', 'A compass needle is a tiny magnet. Its north end shows the field direction: lines leave N and enter S.') },
          { t: 9, label: tx('Полюса', 'Poles'), text: tx('Разрежь магнит — получишь два магнита. Отдельного полюса не бывает.', 'Cut a magnet and you get two magnets. A single pole never exists.') },
        ]
      : m === 'earth'
        ? [
            { t: 0, label: tx('Земля — магнит', 'Earth is a magnet'), text: tx('Токи в жидком внешнем ядре создают поле, похожее на поле полосового магнита.', 'Currents in the liquid outer core create a field like a bar magnet’s.') },
            { t: 4, label: tx('Полюса меняются местами', 'Swapped poles'), text: tx('Южный магнитный полюс находится у северного географического — поэтому стрелка компаса указывает на север.', 'The magnetic south pole sits near the geographic North Pole, which is why compasses point north.') },
            { t: 8, label: tx('Щит', 'Shield'), text: tx('Поле отклоняет частицы солнечного ветра. Возле полюсов они проникают в атмосферу — там сияния.', 'The field deflects solar-wind particles. Near the poles they reach the air and make auroras.') },
          ]
        : m === 'lorentz'
          ? [
              { t: 0, label: tx('Влёт в поле', 'Entering the field'), text: tx('Заряженная частица влетает в магнитное поле, направленное от нас (крестики).', 'A charged particle flies into a magnetic field pointing away from us (crosses).') },
              { t: 1.5, label: tx('Окружность', 'Circle'), text: tx('Сила Лоренца F = qvB перпендикулярна скорости: она не меняет быстроту, только поворачивает. Частица идёт по окружности r = mv/(qB).', 'The Lorentz force F = qvB is perpendicular to the velocity: it turns the particle without speeding it up. The path is a circle, r = mv/(qB).') },
              { t: 8, label: tx('Применение', 'Uses'), text: tx('Так работают масс-спектрометры, циклотроны и кинескопы. Смени знак заряда — направление поворота изменится.', 'Mass spectrometers, cyclotrons and CRTs work this way. Flip the charge sign and the turn reverses.') },
            ]
          : [
              { t: 0, label: tx('Домены', 'Domains'), text: tx('Ферромагнетик (железо) состоит из доменов — областей, намагниченных в разные стороны. В сумме поле ноль.', 'A ferromagnet (iron) is made of domains, regions magnetised in different directions that cancel out overall.') },
              { t: 3, label: tx('Внешнее поле', 'Outside field'), text: tx('В поле катушки домены поворачиваются по полю — вещество намагничивается и усиливает поле в тысячи раз.', 'In a coil’s field the domains swing into line: the material magnetises and boosts the field thousands of times.') },
              { t: 9, label: tx('Точка Кюри', 'Curie point'), text: tx('Нагрев выше 770 °C (для железа) разрушает порядок — магнит теряет свойства. Пара- и диамагнетики намагничиваются очень слабо.', 'Heating iron above 770 °C destroys the order and the magnet stops working. Para- and diamagnets magnetise only very weakly.') },
            ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const dipole = (x: number, y: number, cx: number, cy: number, m: number) => {
      // field of two poles separated vertically/horizontally (N at +x)
      const poles = [
        { x: cx + 90, y: cy, s: m },
        { x: cx - 90, y: cy, s: -m },
      ];
      let bx = 0;
      let by = 0;
      poles.forEach((q) => {
        const dx = x - q.x;
        const dy = y - q.y;
        const r2 = dx * dx + dy * dy + 30;
        const r3 = r2 * Math.sqrt(r2);
        bx += (q.s * dx) / r3;
        by += (q.s * dy) / r3;
      });
      return [bx, by];
    };
    if (mode === 'magnet' || mode === 'earth') {
      const cx = 480;
      const cy = 270;
      const earth = mode === 'earth';
      const grow = ease(t, 0, 4);
      // field lines
      for (let i = 0; i < 14; i++) {
        const a = -Math.PI / 2 + ((i + 0.5) / 14) * Math.PI;
        let x = cx + 90 + Math.cos(a) * 14;
        let y = cy + Math.sin(a) * 14;
        const pts: [number, number][] = [[x, y]];
        const steps = Math.floor(380 * grow);
        for (let s = 0; s < steps; s++) {
          const [bx, by] = dipole(x, y, cx, cy, 1);
          const m = Math.hypot(bx, by) || 1;
          x += (bx * 4) / m;
          y += (by * 4) / m;
          pts.push([x, y]);
          if (Math.hypot(x - (cx - 90), y - cy) < 12 || x < -50 || x > w + 50 || y < -50 || y > h + 50) break;
        }
        const col = earth ? alpha(C.cyan, 0.45) : alpha(C.sky, 0.5);
        line(ctx, pts, col, 1.5);
      }
      if (earth) {
        // planet rotated so geographic north is up: draw on a rotated frame
        ball(ctx, cx, cy, 110, '#2F6FB5');
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, TAU);
        ctx.clip();
        ctx.fillStyle = alpha('#30A46C', 0.75);
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(cx - 60 + hash(i) * 120, cy - 60 + hash(i, 1) * 120, 30 + hash(i, 2) * 30, 18 + hash(i, 3) * 20, hash(i, 4) * 3, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        circle(ctx, cx, cy, 40, alpha(C.amber, 0.5));
        f.hit(info('Ядро Земли', 'Earth’s core', 'Движение расплавленного железа во внешнем ядре — «геодинамо», источник магнитного поля.', 'Molten iron moving in the outer core, the geodynamo, generates the magnetic field.'), cx, cy, 40);
        tag(ctx, L('С (геогр.) — магнитный S', 'N (geogr.) = magnetic S'), cx - 90 - 10, cy - 130, { color: C.blue });
        tag(ctx, L('Ю (геогр.) — магнитный N', 'S (geogr.) = magnetic N'), cx + 90 + 10, cy + 130, { color: C.red });
        // solar wind particles deflected
        if (t > 7) {
          for (let i = 0; i < 12; i++) {
            const s = ((t - 7) * 0.4 + hash(i)) % 1;
            const y0 = 60 + hash(i, 1) * 420;
            const x = lerp(w - 20, cx + 200, s);
            const y = y0 + (y0 < cy ? -1 : 1) * s * s * 100;
            circle(ctx, x, y, 3, C.amber);
          }
          tag(ctx, L('солнечный ветер', 'solar wind'), w - 90, 40, { color: C.amber });
        }
      } else {
        rrect(ctx, cx - 110, cy - 26, 110, 52, 6);
        ctx.fillStyle = C.blue;
        ctx.fill();
        rrect(ctx, cx, cy - 26, 110, 52, 6);
        ctx.fillStyle = C.red;
        ctx.fill();
        text(ctx, 'S', cx - 70, cy, { size: 22, color: C.white, weight: 700 });
        text(ctx, 'N', cx + 70, cy, { size: 22, color: C.white, weight: 700 });
        f.hitRect(info('Полосовой магнит', 'Bar magnet', 'Сильнее всего поле у полюсов. Северный полюс (N) притягивает южный (S) другого магнита.', 'The field is strongest at the poles. Its north pole (N) attracts another magnet’s south pole (S).'), cx - 110, cy - 26, 220, 52);
        // filings
        for (let i = 0; i < 260; i++) {
          const x = 40 + hash(i) * (w - 80);
          const y = 30 + hash(i, 1) * (h - 60);
          if (Math.abs(x - cx) < 120 && Math.abs(y - cy) < 36) continue;
          const [bx, by] = dipole(x, y, cx, cy, 1);
          const a = lerp(hash(i, 2) * TAU, Math.atan2(by, bx), ease(t, 0.5 + hash(i, 3), 2.5 + hash(i, 3)));
          line(ctx, [[x - Math.cos(a) * 5, y - Math.sin(a) * 5], [x + Math.cos(a) * 5, y + Math.sin(a) * 5]], alpha('#B5B8C0', 0.55), 1.5);
        }
        // compass moving around the magnet
        if (t > 4) {
          const a = (t - 4) * 0.5;
          const kx = cx + Math.cos(a) * 220;
          const ky = cy + Math.sin(a) * 150;
          const [bx, by] = dipole(kx, ky, cx, cy, 1);
          const ang = Math.atan2(by, bx);
          circle(ctx, kx, ky, 24, '#1A1C21', '#8C8F98', 2);
          ctx.save();
          ctx.translate(kx, ky);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.closePath();
          ctx.fillStyle = C.red;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.closePath();
          ctx.fillStyle = '#D5D8DE';
          ctx.fill();
          ctx.restore();
          f.hit(info('Компас', 'Compass', 'Красный конец стрелки (N) показывает направление линий поля в этой точке.', 'The red (N) end of the needle shows the field direction at that point.'), kx, ky, 24);
        }
      }
      return;
    }
    if (mode === 'lorentz') {
      // B into the screen
      for (let x = 60; x < w; x += 60)
        for (let y = 50; y < h; y += 60) {
          ctx.strokeStyle = alpha(C.sky, 0.35);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 5, y - 5);
          ctx.lineTo(x + 5, y + 5);
          ctx.moveTo(x + 5, y - 5);
          ctx.lineTo(x - 5, y + 5);
          ctx.stroke();
        }
      tag(ctx, L('B — от нас (×)', 'B into the screen (×)'), 120, 30, { color: C.sky });
      const r = (110 * p.v) / p.B;
      const omega = (1.1 * p.B) / 1;
      const enter = 1.5;
      const x0 = 160;
      const y0 = 300;
      const sign = p.q;
      const pts: [number, number][] = [];
      let px = x0;
      let py = y0;
      let vx = 1;
      let vy = 0;
      for (let s = 0; s <= t; s += 0.02) {
        if (s < enter) {
          px = 60 + (x0 - 60) * (s / enter);
          py = y0;
        } else {
          const a = (s - enter) * omega;
          // centre above (proton, F = qv×B with B into screen → upward for +q moving right)
          px = x0 + r * Math.sin(a);
          py = y0 - sign * r * (1 - Math.cos(a));
          vx = Math.cos(a);
          vy = -sign * Math.sin(a);
        }
        pts.push([px, py]);
      }
      line(ctx, pts.slice(-400), alpha(sign > 0 ? C.red : C.cyan, 0.6), 2);
      charge(ctx, px, py, sign > 0 ? 1 : -1, 10);
      f.hit(info(sign > 0 ? 'Протон' : 'Электрон', sign > 0 ? 'Proton' : 'Electron', `Радиус окружности r = mv/(|q|B). Сейчас ≈ ${(r / 110).toFixed(2)} условных единиц.`, `Circle radius r = mv/(|q|B). Now ≈ ${(r / 110).toFixed(2)} arbitrary units.`), px, py, 12);
      if (t > enter) {
        arrow(ctx, px, py, px + vx * 60, py + vy * 60, { color: C.green, width: 3 });
        // the force always points to the centre of the circle
        const fx = (x0 - px) / r;
        const fy = (y0 - sign * r - py) / r;
        arrow(ctx, px, py, px + fx * 50, py + fy * 50, { color: C.amber, width: 3 });
        tag(ctx, 'v', px + vx * 72, py + vy * 72, { color: C.green });
        tag(ctx, 'F', px + fx * 64, py + fy * 64, { color: C.amber });
      }
      return;
    }
    // domains
    const H = p.H * ease(t, 3, 8);
    const cols = 8;
    const rows = 5;
    const cw = 80;
    const ch = 70;
    const x0 = 480 - (cols * cw) / 2;
    const y0 = 270 - (rows * ch) / 2;
    // coil around the sample
    for (let i = 0; i <= cols * 2; i++) {
      const x = x0 - 10 + i * (cw / 2) + 0;
      ctx.strokeStyle = alpha(C.amber, 0.3 + 0.7 * p.H * ease(t, 3, 4));
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, 270, 8, rows * ch / 2 + 20, 0, 0, TAU);
      ctx.stroke();
    }
    f.hitRect(info('Катушка', 'Coil', 'Ток в катушке создаёт внешнее поле H, которое поворачивает домены.', 'Current in the coil creates the outside field H that swings the domains.'), x0 - 20, y0 - 30, cols * cw + 40, 16);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const a0 = hash(r, c) * TAU;
        const target = 0; // along +x
        let da = ((target - a0 + Math.PI) % TAU + TAU) % TAU - Math.PI;
        const turn = clamp(H * 1.3 - hash(r, c, 3) * 0.3);
        const a = a0 + da * turn;
        const x = x0 + c * cw + cw / 2;
        const y = y0 + r * ch + ch / 2;
        rrect(ctx, x - cw / 2 + 2, y - ch / 2 + 2, cw - 4, ch - 4, 6);
        ctx.fillStyle = alpha(Math.cos(a) > 0.7 ? C.red : C.blue, 0.12 + 0.12 * Math.abs(Math.cos(a)));
        ctx.fill();
        arrow(ctx, x - Math.cos(a) * 24, y - Math.sin(a) * 24, x + Math.cos(a) * 24, y + Math.sin(a) * 24, { color: Math.cos(a) > 0.7 ? C.red : C.sky, width: 3, head: 9 });
        da = 0;
      }
    f.hit(info('Домен', 'Domain', 'Область размером ~0,01–1 мм, где магнитные моменты атомов направлены одинаково.', 'A region about 0.01–1 mm across where the atoms’ magnetic moments all point the same way.'), x0 + cw * 1.5, y0 + ch * 1.5, 30);
    const M = (() => {
      let s = 0;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const a0 = hash(r, c) * TAU;
          const da = ((0 - a0 + Math.PI) % TAU + TAU) % TAU - Math.PI;
          s += Math.cos(a0 + da * clamp(H * 1.3 - hash(r, c, 3) * 0.3));
        }
      return s / (rows * cols);
    })();
    tag(ctx, `${L('намагниченность', 'magnetisation')}: ${(M * 100).toFixed(0)}%`, 480, 500, { color: C.red, size: 13 });
  },
};

/* ---------- oscillating circuit and AC ---------- */

export const oscillations: SimDef = {
  id: 'lc_ac',
  title: tx('Электромагнитные колебания', 'Electromagnetic oscillations'),
  modes: [
    { id: 'lc', label: tx('Колебательный контур', 'LC circuit') },
    { id: 'self', label: tx('Самоиндукция', 'Self-induction') },
    { id: 'ac', label: tx('Переменный ток', 'Alternating current') },
  ],
  duration: (m) => (m === 'self' ? 10 : 16),
  params: (m) =>
    m === 'lc'
      ? [
          { id: 'L', label: tx('Индуктивность L', 'Inductance L'), min: 0.5, max: 3, step: 0.5, value: 1, unit: '×', digits: 1 },
          { id: 'C', label: tx('Ёмкость C', 'Capacitance C'), min: 0.5, max: 3, step: 0.5, value: 1, unit: '×', digits: 1 },
          { id: 'R', label: tx('Сопротивление (затухание)', 'Resistance (damping)'), min: 0, max: 0.3, step: 0.05, value: 0.05, digits: 2 },
        ]
      : m === 'ac'
        ? [{ id: 'f', label: tx('Частота', 'Frequency'), min: 0.1, max: 0.5, step: 0.05, value: 0.2, unit: '×', digits: 2 }]
        : [{ id: 'L', label: tx('Индуктивность катушки', 'Coil inductance'), min: 0.5, max: 3, step: 0.5, value: 1.5, unit: '×', digits: 1 }],
  stages: (m) =>
    m === 'lc'
      ? [
          { t: 0, label: tx('Заряжен конденсатор', 'Capacitor charged'), text: tx('Вся энергия — в электрическом поле конденсатора.', 'All the energy is in the capacitor’s electric field.') },
          { t: 1, label: tx('Ток растёт', 'Current builds'), text: tx('Конденсатор разряжается через катушку; самоиндукция не даёт току вырасти мгновенно. Энергия переходит в магнитное поле.', 'The capacitor discharges through the coil; self-induction stops the current jumping up at once. Energy moves into the magnetic field.') },
          { t: 4, label: tx('Перезарядка', 'Recharging'), text: tx('Ток по инерции продолжается и перезаряжает конденсатор в обратную сторону — и так снова и снова.', 'The current carries on and recharges the capacitor the other way, again and again.') },
          { t: 8, label: tx('Формула Томсона', 'Thomson’s formula'), text: tx('Период T = 2π√(LC). Сопротивление превращает энергию в тепло — колебания затухают.', 'The period is T = 2π√(LC). Resistance turns energy into heat, so the oscillations die away.') },
        ]
      : m === 'self'
        ? [
            { t: 0, label: tx('Замыкаем ключ', 'Switch on'), text: tx('Две одинаковые лампы: одна — через резистор, другая — через катушку с железным сердечником.', 'Two identical lamps: one through a resistor, the other through an iron-core coil.') },
            { t: 0.5, label: tx('Запаздывание', 'Delay'), text: tx('Лампа с катушкой загорается позже: растущий ток создаёт в катушке ЭДС самоиндукции, которая ему мешает.', 'The coil’s lamp lights later: the rising current induces an EMF in the coil that opposes it.') },
            { t: 5, label: tx('Размыкаем', 'Switch off'), text: tx('При разрыве цепи катушка «пытается» сохранить ток — возможна искра. Энергия поля W = LI²/2.', 'When the circuit breaks, the coil tries to keep the current going and a spark may jump. Field energy W = LI²/2.') },
          ]
        : [
            { t: 0, label: tx('Генератор', 'Generator'), text: tx('Рамка вращается в магнитном поле: магнитный поток через неё меняется, наводится ЭДС.', 'A loop spins in a magnetic field: the flux through it changes and an EMF is induced.') },
            { t: 4, label: tx('Синусоида', 'Sine wave'), text: tx('ЭДС меняется по синусу: e = E₀·sin(ωt). Ток в сети меняет направление 100 раз в секунду (50 Гц).', 'The EMF follows a sine: e = E₀·sin(ωt). Mains current reverses 100 times a second (50 Hz).') },
            { t: 10, label: tx('Действующее значение', 'RMS value'), text: tx('220 В в розетке — действующее значение. Амплитуда больше: 220·√2 ≈ 311 В.', 'The 220 V at a socket is the RMS value. The peak is higher: 220·√2 ≈ 311 V.') },
          ],
  metrics: ({ p, mode }) => (mode === 'lc' ? [{ label: tx('Период T = 2π√(LC)', 'Period T = 2π√(LC)'), value: `${(4 * Math.sqrt(p.L * p.C)).toFixed(2)} с` }] : []),
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'lc') {
      const T = 4 * Math.sqrt(p.L * p.C);
      const om = TAU / T;
      const damp = Math.exp(-p.R * t);
      const q = Math.cos(om * t) * damp;
      const i = -Math.sin(om * t) * damp;
      // circuit
      const cx = 140;
      const cy = 270;
      line(ctx, [[cx, 130], [cx, 410], [420, 410], [420, 130], [cx, 130]], '#4A4D55', 3);
      // capacitor (left)
      ctx.fillStyle = C.panel;
      ctx.fillRect(cx - 40, cy - 30, 80, 60);
      line(ctx, [[cx - 36, cy - 10], [cx + 36, cy - 10]], '#B5B8C0', 5);
      line(ctx, [[cx - 36, cy + 10], [cx + 36, cy + 10]], '#B5B8C0', 5);
      for (let k = 0; k < 5; k++) {
        const x = cx - 28 + k * 14;
        if (Math.abs(q) > 0.15) {
          text(ctx, q > 0 ? '+' : '−', x, cy - 22, { size: 13, color: q > 0 ? C.red : C.blue, weight: 700 });
          text(ctx, q > 0 ? '−' : '+', x, cy + 23, { size: 13, color: q > 0 ? C.blue : C.red, weight: 700 });
        }
        ctx.globalAlpha = Math.abs(q);
        arrow(ctx, x, q > 0 ? cy - 7 : cy + 7, x, q > 0 ? cy + 7 : cy - 7, { color: C.sky, width: 1.5, head: 5 });
        ctx.globalAlpha = 1;
      }
      f.hitRect(info('Конденсатор', 'Capacitor', 'Запасает энергию электрического поля W = q²/(2C).', 'Stores electric-field energy W = q²/(2C).'), cx - 40, cy - 30, 80, 60);
      // coil (right)
      ctx.fillStyle = C.panel;
      ctx.fillRect(390, cy - 70, 60, 140);
      for (let k = 0; k < 7; k++) {
        ctx.strokeStyle = '#C77A3A';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(420, cy - 60 + k * 20, 26, 8, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = Math.abs(i);
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = alpha(C.green, 0.7);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(420, cy, 50 + k * 22, 100 + k * 18, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      f.hitRect(info('Катушка', 'Coil', 'Запасает энергию магнитного поля W = LI²/2.', 'Stores magnetic-field energy W = LI²/2.'), 390, cy - 70, 60, 140);
      // moving charges along the wire
      for (let k = 0; k < 12; k++) {
        // charges slosh back and forth with the current
        const disp = (Math.cos(om * t) * damp - 1) * 0.08;
        const s = (((k / 12 + disp) % 1) + 1) % 1;
        const per = 2 * (280 + 280);
        let d = s * per;
        let x: number;
        let y: number;
        if (d < 280) [x, y] = [cx + d, 130];
        else if ((d -= 280) < 280) [x, y] = [420, 130 + d];
        else if ((d -= 280) < 280) [x, y] = [420 - d, 410];
        else [x, y] = [cx, 410 - (d - 280)];
        circle(ctx, x, y, 3.5, C.cyan);
      }
      // energy bars
      const We = q * q;
      const Wm = i * i;
      [{ v: We, c: C.sky, l: L('электрич.', 'electric') }, { v: Wm, c: C.green, l: L('магнитн.', 'magnetic') }].forEach((b, k) => {
        const bx = 500 + k * 70;
        rrect(ctx, bx, 120, 46, 200, 6);
        ctx.fillStyle = C.panel;
        ctx.fill();
        rrect(ctx, bx, 320 - b.v * 200, 46, b.v * 200, 6);
        ctx.fillStyle = b.c;
        ctx.fill();
        text(ctx, b.l, bx + 23, 338, { size: 11, color: C.dim });
      });
      text(ctx, 'W', 570, 104, { size: 12, color: C.dim });
      chart(ctx, {
        x: 650, y: 90, w: 290, h: 330, xMax: 16, yMin: -1.1, yMax: 1.1, title: L('q(t) и i(t)', 'q(t) and i(t)'), xLabel: 't', upTo: t, cursor: t,
        series: [
          { color: C.sky, label: 'q', fn: (x) => Math.cos(om * x) * Math.exp(-p.R * x) },
          { color: C.green, label: 'i', fn: (x) => -Math.sin(om * x) * Math.exp(-p.R * x) },
        ],
      });
      return;
    }
    if (mode === 'self') {
      const on = t < 5;
      const tau = 0.6 * p.L;
      const iR = on ? 1 : 0;
      const iL = on ? 1 - Math.exp(-t / tau) : Math.exp(-(t - 5) / (tau * 0.4)) * (1 - Math.exp(-5 / tau));
      const lamp = (x: number, y: number, k: number, label: string) => {
        if (k > 0.05) {
          const g = ctx.createRadialGradient(x, y, 5, x, y, 70);
          g.addColorStop(0, alpha(C.yellow, 0.7 * k));
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 70, 0, TAU);
          ctx.fill();
        }
        circle(ctx, x, y, 24, alpha(C.yellow, 0.1 + 0.8 * k), '#B5B8C0', 2);
        tag(ctx, label, x, y + 50, { color: C.dim, size: 11 });
      };
      line(ctx, [[120, 140], [120, 420], [840, 420]], '#4A4D55', 3);
      line(ctx, [[120, 140], [840, 140], [840, 420]], '#4A4D55', 3);
      line(ctx, [[480, 140], [480, 420]], '#4A4D55', 3);
      // battery + switch
      line(ctx, [[100, 260], [140, 260]], C.text, 3);
      line(ctx, [[108, 275], [132, 275]], C.text, 6);
      const sw = on ? 0 : -0.6;
      ctx.save();
      ctx.translate(120, 330);
      ctx.rotate(sw);
      line(ctx, [[0, 0], [0, 40]], C.amber, 4);
      ctx.restore();
      if (!on && t < 5.4) for (let k = 0; k < 4; k++) line(ctx, [[120, 370], [120 + (hash(k, Math.floor(t * 30)) - 0.5) * 30, 380 + hash(k + 2, Math.floor(t * 30)) * 20]], C.yellow, 2);
      // resistor branch
      rrect(ctx, 270, 128, 70, 24, 4);
      ctx.fillStyle = '#8C8F98';
      ctx.fill();
      lamp(400, 140, iR, L('через резистор', 'via resistor'));
      // coil branch
      for (let k = 0; k < 6; k++) {
        ctx.strokeStyle = '#C77A3A';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(600 + k * 16, 420, 9, 22, 0, 0, TAU);
        ctx.stroke();
      }
      f.hitRect(info('Катушка с сердечником', 'Iron-core coil', 'Большая индуктивность: при изменении тока в ней возникает ЭДС самоиндукции e = −L·ΔI/Δt.', 'High inductance: a changing current induces a self-EMF e = −L·ΔI/Δt.'), 585, 395, 110, 50);
      lamp(760, 420, iL, L('через катушку', 'via coil'));
      f.hit(info('Лампа', 'Lamp', 'Яркость показывает силу тока в ветви.', 'Its brightness shows the current in that branch.'), 760, 420, 26);
      chart(ctx, {
        x: 560, y: 190, w: 360, h: 190, xMax: 10, yMax: 1.15, title: L('Ток в ветвях', 'Branch currents'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
        series: [
          { color: C.amber, label: L('резистор', 'resistor'), fn: (x) => (x < 5 ? 1 : 0) },
          { color: C.green, label: L('катушка', 'coil'), fn: (x) => (x < 5 ? 1 - Math.exp(-x / tau) : Math.exp(-(x - 5) / (tau * 0.4)) * (1 - Math.exp(-5 / tau))) },
        ],
      });
      return;
    }
    // AC generator
    const om = TAU * p.f * 2;
    const a = om * t;
    const cx = 260;
    const cy = 260;
    rrect(ctx, cx - 210, cy - 90, 70, 180, 10);
    ctx.fillStyle = C.red;
    ctx.fill();
    rrect(ctx, cx + 140, cy - 90, 70, 180, 10);
    ctx.fillStyle = C.blue;
    ctx.fill();
    text(ctx, 'N', cx - 175, cy, { size: 22, color: C.white, weight: 700 });
    text(ctx, 'S', cx + 175, cy, { size: 22, color: C.white, weight: 700 });
    for (let k = 0; k < 5; k++) arrow(ctx, cx - 135, cy - 70 + k * 35, cx + 135, cy - 70 + k * 35, { color: alpha(C.sky, 0.3), width: 1.5, head: 6 });
    // rotating loop (projected)
    const wdt = Math.abs(Math.cos(a)) * 100;
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 5;
    ctx.strokeRect(cx - wdt / 2, cy - 80, wdt, 160);
    line(ctx, [[cx, cy + 80], [cx, cy + 140]], '#8C8F98', 3);
    f.hit(info('Вращающаяся рамка', 'Spinning loop', 'Магнитный поток Ф = B·S·cos(ωt) меняется — по закону Фарадея наводится ЭДС e = −ΔФ/Δt.', 'The flux Φ = B·S·cos(ωt) keeps changing, so by Faraday’s law an EMF e = −ΔΦ/Δt is induced.'), cx, cy, 60);
    // lamp brightness ~ |e|
    const e = Math.sin(a);
    const g = ctx.createRadialGradient(cx, cy + 190, 4, cx, cy + 190, 60);
    g.addColorStop(0, alpha(C.yellow, 0.8 * e * e));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy + 190, 60, 0, TAU);
    ctx.fill();
    circle(ctx, cx, cy + 190, 18, alpha(C.yellow, 0.15 + 0.7 * e * e), '#B5B8C0', 2);
    chart(ctx, {
      x: 520, y: 70, w: 410, h: 380, xMax: 16, yMin: -1.2, yMax: 1.2, title: L('ЭДС e(t) = E₀ sin ωt', 'EMF e(t) = E₀ sin ωt'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
      series: [
        { color: C.amber, label: 'e', fn: (x) => Math.sin(om * x) },
        { color: alpha(C.green, 0.7), label: L('действующее', 'RMS'), fn: () => 1 / Math.SQRT2, dash: [4, 4], width: 1.5 },
      ],
    });
  },
};

/* ---------- electromagnetic waves ---------- */

const BANDS = [
  { name: tx('Радио', 'Radio'), from: 0, to: 0.22, color: '#8E4EC6', use: tx('Связь, радио, ТВ, радиолокация.', 'Communication, radio, TV, radar.') },
  { name: tx('СВЧ', 'Microwave'), from: 0.22, to: 0.36, color: '#AB8AFF', use: tx('Микроволновки, Wi-Fi, мобильная связь.', 'Microwave ovens, Wi-Fi, mobile phones.') },
  { name: tx('ИК', 'Infrared'), from: 0.36, to: 0.5, color: '#E5484D', use: tx('Тепловое излучение, пульты, тепловизоры.', 'Heat radiation, remote controls, thermal cameras.') },
  { name: tx('Видимый', 'Visible'), from: 0.5, to: 0.58, color: '#FFD60A', use: tx('Единственный диапазон, который видит глаз: 380–780 нм.', 'The only band the eye sees: 380–780 nm.') },
  { name: tx('УФ', 'Ultraviolet'), from: 0.58, to: 0.7, color: '#5B8CFF', use: tx('Загар, обеззараживание, синтез витамина D.', 'Tanning, disinfection, vitamin D synthesis.') },
  { name: tx('Рентген', 'X-ray'), from: 0.7, to: 0.85, color: '#3DD6F5', use: tx('Медицина, досмотр багажа, кристаллография.', 'Medicine, baggage scanning, crystallography.') },
  { name: tx('Гамма', 'Gamma'), from: 0.85, to: 1, color: '#30A46C', use: tx('Ядерные процессы, лучевая терапия.', 'Nuclear processes, radiotherapy.') },
];

export const emWaves: SimDef = {
  id: 'em_waves',
  title: tx('Электромагнитные волны', 'Electromagnetic waves'),
  modes: [
    { id: 'wave', label: tx('Волна', 'The wave') },
    { id: 'radio', label: tx('Радиосвязь', 'Radio') },
    { id: 'spectrum', label: tx('Шкала волн', 'Spectrum') },
  ],
  duration: 12,
  params: (m) => (m === 'spectrum' ? [{ id: 'pos', label: tx('Положение на шкале', 'Position on the scale'), min: 0, max: 1, step: 0.02, value: 0.54, digits: 2 }] : m === 'wave' ? [{ id: 'lambda', label: tx('Длина волны', 'Wavelength'), min: 0.5, max: 2, step: 0.25, value: 1, unit: '×', digits: 2 }] : []),
  stages: (m) =>
    m === 'wave'
      ? [
          { t: 0, label: tx('Колеблющийся заряд', 'Oscillating charge'), text: tx('Заряд, колеблющийся в антенне, создаёт переменное электрическое поле.', 'A charge oscillating in an antenna creates a changing electric field.') },
          { t: 3, label: tx('Самоподдержание', 'Self-sustaining'), text: tx('Переменное E порождает переменное B, а оно — снова E. Поля «толкают» друг друга вперёд со скоростью света.', 'A changing E makes a changing B, which makes E again. The fields push each other forward at light speed.') },
          { t: 7, label: tx('Поперечная волна', 'Transverse wave'), text: tx('E ⟂ B ⟂ направлению движения. c = λ·ν ≈ 300 000 км/с в вакууме.', 'E ⟂ B ⟂ direction of travel. c = λ·ν ≈ 300,000 km/s in a vacuum.') },
        ]
      : m === 'radio'
        ? [
            { t: 0, label: tx('Звук → сигнал', 'Sound → signal'), text: tx('Микрофон превращает звук в слабый низкочастотный электрический сигнал.', 'A microphone turns sound into a weak low-frequency electrical signal.') },
            { t: 3, label: tx('Модуляция', 'Modulation'), text: tx('Сигнал «записывают» в высокочастотную несущую волну, меняя её амплитуду (АМ).', 'The signal is written onto a high-frequency carrier by varying its amplitude (AM).') },
            { t: 7, label: tx('Приём', 'Reception'), text: tx('Антенна приёмника ловит волну, контур настраивается на частоту, детектор выделяет звук.', 'The receiver’s antenna catches the wave, a tuned circuit picks the frequency and a detector recovers the sound.') },
          ]
        : [{ t: 0, label: tx('Шкала', 'The scale'), text: tx('Все эти волны — одной природы и летят со скоростью света. Отличаются длиной волны и энергией фотонов.', 'All these waves share one nature and travel at light speed. They differ in wavelength and photon energy.') }],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'wave') {
      const y0 = 280;
      const x0 = 150;
      const lam = 160 * p.lambda;
      const front = Math.min(w - 40, x0 + (t * 120));
      // pseudo-3D: E vertical, B along a slanted "depth" axis
      line(ctx, [[x0, y0], [w - 30, y0]], C.faint, 1.5);
      arrow(ctx, w - 60, y0, w - 25, y0, { color: C.dim, width: 1.5 });
      text(ctx, L('направление', 'direction'), w - 70, y0 + 20, { size: 11, color: C.dim });
      const ph = t * 6;
      const ptsE: [number, number][] = [];
      const ptsB: [number, number][] = [];
      for (let x = x0; x <= front; x += 3) {
        const s = Math.sin(((x - x0) / lam) * TAU - ph);
        ptsE.push([x, y0 - s * 110]);
        ptsB.push([x + s * 50, y0 + s * 50]);
        if ((Math.round(x - x0) % 18) < 3) {
          line(ctx, [[x, y0], [x, y0 - s * 110]], alpha(C.amber, 0.35), 1);
          line(ctx, [[x, y0], [x + s * 50, y0 + s * 50]], alpha(C.sky, 0.35), 1);
        }
      }
      line(ctx, ptsE, C.amber, 2.5);
      line(ctx, ptsB, C.sky, 2.5);
      tag(ctx, 'E', x0 + 40, y0 - 130, { color: C.amber });
      tag(ctx, 'B', x0 + 90, y0 + 80, { color: C.sky });
      // antenna
      line(ctx, [[x0 - 30, y0 - 90], [x0 - 30, y0 + 90]], '#B5B8C0', 5);
      charge(ctx, x0 - 30, y0 - Math.sin(ph) * 70, 1, 9);
      f.hit(info('Антенна', 'Antenna', 'Заряды в ней колеблются с частотой ν и излучают волну той же частоты.', 'Charges in it oscillate at frequency ν and radiate a wave of the same frequency.'), x0 - 30, y0, 30);
      f.hit(info('Электрическое поле E', 'Electric field E', 'Колеблется в вертикальной плоскости, синфазно с магнитным.', 'Oscillates in the vertical plane, in step with the magnetic field.'), x0 + lam * 0.25, y0 - 100, 20);
      // wavelength marker
      if (front > x0 + lam * 1.2) {
        line(ctx, [[x0 + lam * 0.25, y0 - 140], [x0 + lam * 1.25, y0 - 140]], C.green, 1.5);
        tag(ctx, 'λ', x0 + lam * 0.75, y0 - 140, { color: C.green });
      }
      return;
    }
    if (mode === 'radio') {
      const rows = [
        { y: 110, label: L('звук (сигнал)', 'sound (signal)'), color: C.green, fn: (x: number) => Math.sin(x * 0.02 - t * 2) * 0.8 },
        { y: 250, label: L('несущая', 'carrier'), color: C.sky, fn: (x: number) => Math.sin(x * 0.25 - t * 20) },
        { y: 400, label: L('модулированная (АМ)', 'modulated (AM)'), color: C.amber, fn: (x: number) => (0.55 + 0.45 * Math.sin(x * 0.02 - t * 2)) * Math.sin(x * 0.25 - t * 20) },
      ];
      rows.forEach((r, k) => {
        const show = ease(t, k * 3, k * 3 + 1.5);
        if (show <= 0) return;
        ctx.globalAlpha = show;
        const pts: [number, number][] = [];
        for (let x = 200; x <= 760; x += 2) pts.push([x, r.y - r.fn(x) * 46]);
        line(ctx, pts, r.color, 2);
        tag(ctx, r.label, 190, r.y - 60, { color: r.color, align: 'left' });
        ctx.globalAlpha = 1;
      });
      // envelope
      if (t > 6) {
        const pts: [number, number][] = [];
        for (let x = 200; x <= 760; x += 4) pts.push([x, 400 - (0.55 + 0.45 * Math.sin(x * 0.02 - t * 2)) * 46]);
        line(ctx, pts, alpha(C.green, 0.7), 1.5, [4, 4]);
      }
      // transmitter / receiver
      line(ctx, [[100, 470], [100, 330]], '#B5B8C0', 4);
      f.hit(info('Передатчик', 'Transmitter', 'Генерирует несущую частоту и модулирует её звуком.', 'Generates the carrier frequency and modulates it with sound.'), 100, 400, 30);
      line(ctx, [[860, 470], [860, 330]], '#B5B8C0', 4);
      f.hit(info('Приёмник', 'Receiver', 'Колебательный контур настраивается в резонанс с нужной станцией, детектор отделяет звук от несущей.', 'A tuned circuit resonates with the chosen station and a detector separates the sound from the carrier.'), 860, 400, 30);
      if (t > 7) for (let k = 0; k < 4; k++) {
        const r = ((t * 80 + k * 60) % 240);
        ctx.strokeStyle = alpha(C.amber, 0.5 * (1 - r / 240));
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(100, 330, r, -0.6, 0.6);
        ctx.stroke();
      }
      return;
    }
    // spectrum
    const x0 = 60;
    const x1 = 900;
    const y = 180;
    BANDS.forEach((b) => {
      const bx = lerp(x0, x1, b.from);
      const bw = lerp(x0, x1, b.to) - bx;
      if (b.name.en === 'Visible') {
        const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        ['#E5484D', '#F76B15', '#FFD60A', '#30A46C', '#5B8CFF', '#8E4EC6'].forEach((c, i) => g.addColorStop(i / 5, c));
        ctx.fillStyle = g;
      } else ctx.fillStyle = alpha(b.color, 0.35);
      ctx.fillRect(bx, y - 30, bw, 60);
      text(ctx, b.name[f.lang], bx + bw / 2, y + 48, { size: 12, color: C.text });
      f.hitRect(info(b.name.ru, b.name.en, b.use.ru, b.use.en), bx, y - 30, bw, 60);
    });
    text(ctx, L('длинные волны, малая энергия', 'long waves, low energy'), x0, y - 50, { size: 12, color: C.dim, align: 'left' });
    text(ctx, L('короткие волны, большая энергия', 'short waves, high energy'), x1, y - 50, { size: 12, color: C.dim, align: 'right' });
    // wave sample at chosen position
    const pos = p.pos;
    const lamPx = lerp(260, 6, pos);
    const band = BANDS.find((b) => pos >= b.from && pos <= b.to) ?? BANDS[0];
    const mx = lerp(x0, x1, pos);
    line(ctx, [[mx, y - 34], [mx, y + 34]], C.white, 2);
    wave(ctx, 80, 880, 360, 50, lamPx, t * 8, band.name.en === 'Visible' ? '#FFD60A' : band.color, 2.5);
    const lambdaM = Math.pow(10, lerp(3, -12, pos));
    tag(ctx, `${band.name[f.lang]}: λ ≈ ${formatLength(lambdaM, f.lang)}`, 480, 470, { color: band.color, size: 14 });
  },
};

function formatLength(m: number, lang: 'ru' | 'en') {
  const u = lang === 'ru' ? { km: 'км', m: 'м', cm: 'см', mm: 'мм', um: 'мкм', nm: 'нм', pm: 'пм' } : { km: 'km', m: 'm', cm: 'cm', mm: 'mm', um: 'µm', nm: 'nm', pm: 'pm' };
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ${u.km}`;
  if (m >= 1) return `${m.toFixed(1)} ${u.m}`;
  if (m >= 0.01) return `${(m * 100).toFixed(1)} ${u.cm}`;
  if (m >= 1e-3) return `${(m * 1000).toFixed(1)} ${u.mm}`;
  if (m >= 1e-6) return `${(m * 1e6).toFixed(1)} ${u.um}`;
  if (m >= 1e-9) return `${(m * 1e9).toFixed(0)} ${u.nm}`;
  return `${(m * 1e12).toFixed(1)} ${u.pm}`;
}
