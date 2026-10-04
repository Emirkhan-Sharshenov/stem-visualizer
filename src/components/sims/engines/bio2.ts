import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, tag, TAU, text, tx, wobble } from '../kit';

/* ================= blood ================= */

function rbc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number, color = '#D93A3A') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(ang * 1.7)));
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  g.addColorStop(0, mixColor(color, '#000000', 0.25));
  g.addColorStop(0.55, color);
  g.addColorStop(1, mixColor(color, '#FFFFFF', 0.15));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function wbc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, i = 0) {
  ctx.fillStyle = alpha('#E8E4F5', 0.9);
  ctx.beginPath();
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * TAU;
    const rr = r * (1 + 0.08 * Math.sin(a * 5 + t * 2 + i));
    if (k === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
  // lobed nucleus
  for (let k = 0; k < 3; k++) circle(ctx, x - r * 0.3 + k * r * 0.3, y + Math.sin(k * 2) * r * 0.15, r * 0.28, '#7E57C2');
}

function bacterium(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, s = 1, color = '#8BD450') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  rrect(ctx, -14 * s, -6 * s, 28 * s, 12 * s, 6 * s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function antibody(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  line(ctx, [[0, 8 * s], [0, 0], [-6 * s, -8 * s]], '#FFD60A', 2.5);
  line(ctx, [[0, 0], [6 * s, -8 * s]], '#FFD60A', 2.5);
  ctx.restore();
}

const GROUPS = ['O (I)', 'A (II)', 'B (III)', 'AB (IV)'];
const ANTIGENS = [[], ['A'], ['B'], ['A', 'B']];
const PLASMA_AB = [['α', 'β'], ['β'], ['α'], []];
const compatible = (donor: number, recipient: number) => ANTIGENS[donor].every((a) => !PLASMA_AB[recipient].includes(a === 'A' ? 'α' : 'β'));

export const blood: SimDef = {
  id: 'blood',
  title: tx('Кровь', 'Blood'),
  modes: [
    { id: 'composition', label: tx('Состав', 'Composition') },
    { id: 'clotting', label: tx('Свёртывание', 'Clotting') },
    { id: 'immunity', label: tx('Иммунитет', 'Immunity') },
    { id: 'groups', label: tx('Группы крови', 'Blood groups') },
  ],
  duration: (m) => (m === 'composition' ? 10 : m === 'groups' ? 8 : 12),
  loop: false,
  params: (m) =>
    m === 'groups'
      ? [
          { id: 'donor', label: tx('Донор: 0 — O, 1 — A, 2 — B, 3 — AB', 'Donor: 0 O, 1 A, 2 B, 3 AB'), min: 0, max: 3, step: 1, value: 1 },
          { id: 'rec', label: tx('Реципиент: 0 — O, 1 — A, 2 — B, 3 — AB', 'Recipient: 0 O, 1 A, 2 B, 3 AB'), min: 0, max: 3, step: 1, value: 2 },
        ]
      : [],
  stages: (m) =>
    m === 'composition'
      ? [
          { t: 0, label: tx('Ток крови', 'Blood flow'), text: tx('Кровь — жидкая соединительная ткань: плазма и форменные элементы.', 'Blood is a liquid connective tissue: plasma plus formed elements.') },
          { t: 4, label: tx('Центрифуга', 'Centrifuge'), text: tx('Если отстоять кровь, она расслоится: ~55% плазмы (вода, белки, соли, глюкоза) и ~45% клеток, почти все — эритроциты.', 'Left to settle, blood separates: ~55% plasma (water, proteins, salts, glucose) and ~45% cells, almost all red cells.') },
        ]
      : m === 'clotting'
        ? [
            { t: 0, label: tx('Сосуд цел', 'Intact vessel'), text: tx('Кровь течёт внутри сосуда.', 'Blood flows inside the vessel.') },
            { t: 1.5, label: tx('Повреждение', 'Injury'), text: tx('Стенка повреждена — кровь вытекает.', 'The wall is damaged and blood leaks out.') },
            { t: 3, label: tx('Тромбоциты', 'Platelets'), text: tx('Тромбоциты прилипают к краям раны и друг к другу — образуется пробка.', 'Platelets stick to the wound edges and to each other, forming a plug.') },
            { t: 6, label: tx('Фибрин', 'Fibrin'), text: tx('Растворимый белок фибриноген превращается в нити фибрина (нужны Ca²⁺ и витамин K). Сеть задерживает эритроциты — тромб закрывает рану.', 'Soluble fibrinogen turns into fibrin threads (needing Ca²⁺ and vitamin K). The mesh traps red cells and the clot seals the wound.') },
          ]
        : m === 'immunity'
          ? [
              { t: 0, label: tx('Вторжение', 'Invasion'), text: tx('В ткани попали бактерии и начали размножаться.', 'Bacteria get into the tissue and start multiplying.') },
              { t: 2, label: tx('Фагоцитоз', 'Phagocytosis'), text: tx('Лейкоциты-фагоциты выходят из сосуда, догоняют бактерий и поглощают их (открыл И. И. Мечников).', 'Phagocytic white cells leave the vessel, chase the bacteria and engulf them (discovered by Ilya Mechnikov).') },
              { t: 7, label: tx('Антитела', 'Antibodies'), text: tx('Лимфоциты вырабатывают антитела — белки, которые точно «узнают» чужие антигены и склеивают микробов. Остаются клетки памяти — иммунитет.', 'Lymphocytes make antibodies, proteins that recognise foreign antigens exactly and clump microbes together. Memory cells remain: that’s immunity.') },
            ]
          : [
              { t: 0, label: tx('Антигены и антитела', 'Antigens and antibodies'), text: tx('На эритроцитах могут быть антигены A и B, в плазме — антитела α и β. Одноимённые (A + α) не встречаются у одного человека.', 'Red cells may carry antigens A and B; plasma may carry antibodies α and β. Matching pairs (A + α) never occur in one person.') },
              { t: 3, label: tx('Переливание', 'Transfusion'), text: tx('Если антиген донора встречает одноимённое антитело реципиента — эритроциты склеиваются (агглютинация). Это смертельно опасно!', 'If a donor antigen meets the matching recipient antibody, red cells clump (agglutination). This is life-threatening!') },
            ],
  metrics: ({ p, mode }) =>
    mode === 'groups'
      ? [
          { label: tx('Донор → реципиент', 'Donor → recipient'), value: `${GROUPS[p.donor]} → ${GROUPS[p.rec]}` },
          { label: tx('Совместимость', 'Compatible?'), value: compatible(p.donor, p.rec) ? 'да · yes' : 'нет · no', tone: compatible(p.donor, p.rec) ? 'good' : 'bad' },
        ]
      : [],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    const vessel = (top: number, bot: number, gapX = -1, gap = 0) => {
      ctx.fillStyle = alpha('#F5C842', 0.12);
      ctx.fillRect(0, top, w, bot - top);
      ctx.fillStyle = '#B8576A';
      ctx.fillRect(0, top - 14, w, 14);
      if (gapX < 0) ctx.fillRect(0, bot, w, 14);
      else {
        ctx.fillRect(0, bot, gapX - gap / 2, 14);
        ctx.fillRect(gapX + gap / 2, bot, w - gapX - gap / 2, 14);
      }
    };
    if (mode === 'composition') {
      const sep = ease(t, 4, 6);
      vessel(120, 360);
      f.hitRect(info('Плазма', 'Plasma', '90% вода; белки (альбумины, фибриноген, антитела), глюкоза, соли, гормоны.', '90% water, plus proteins (albumins, fibrinogen, antibodies), glucose, salts and hormones.'), 0, 125, 80, 30);
      for (let i = 0; i < 70; i++) {
        const x = ((hash(i) * w + t * 90 * (0.8 + hash(i, 1) * 0.4)) % (w + 40)) - 20;
        const y = 140 + hash(i, 2) * 200;
        rbc(ctx, x, y, 14, hash(i, 3) * 3 + t * (hash(i, 4) - 0.5));
      }
      f.hit(info('Эритроцит', 'Red blood cell', 'Двояковогнутый диск без ядра, заполнен гемоглобином — переносит O₂ и CO₂. Живёт ~120 дней. 4–5 млн в 1 мм³.', 'A biconcave disc with no nucleus, packed with haemoglobin to carry O₂ and CO₂. Lives ~120 days; 4–5 million per mm³.'), ((hash(0) * w + t * 90 * (0.8 + hash(0, 1) * 0.4)) % (w + 40)) - 20, 140 + hash(0, 2) * 200, 16);
      for (let i = 0; i < 3; i++) {
        const x = ((hash(i, 9) * w + t * 60) % (w + 60)) - 30;
        wbc(ctx, x, 180 + i * 70, 22, t, i);
        if (i === 0) f.hit(info('Лейкоцит', 'White blood cell', 'Крупная клетка с ядром. Защищает от инфекций: поглощает микробов, вырабатывает антитела. 4–9 тыс. в 1 мм³.', 'A large cell with a nucleus that fights infection by engulfing microbes and making antibodies. 4,000–9,000 per mm³.'), x, 180, 24);
      }
      for (let i = 0; i < 30; i++) {
        const x = ((hash(i, 11) * w + t * 100) % (w + 20)) - 10;
        circle(ctx, x, 140 + hash(i, 12) * 200, 3.5, '#F2D27A');
        if (i === 0) f.hit(info('Тромбоцит', 'Platelet', 'Кровяная пластинка — участвует в свёртывании крови.', 'A blood platelet, involved in clotting.'), x, 140 + hash(i, 12) * 200, 8);
      }
      // test tube
      if (sep > 0) {
        ctx.globalAlpha = sep;
        const tx0 = 800;
        rrect(ctx, tx0, 380, 60, 140, 26);
        ctx.fillStyle = '#16181C';
        ctx.fill();
        ctx.fillStyle = '#F2D27A';
        ctx.fillRect(tx0 + 4, 395, 52, 66);
        ctx.fillStyle = '#EDEDED';
        ctx.fillRect(tx0 + 4, 461, 52, 4);
        ctx.fillStyle = '#8E1F1F';
        ctx.fillRect(tx0 + 4, 465, 52, 50);
        text(ctx, '55%', tx0 - 30, 428, { size: 12, color: '#F2D27A' });
        text(ctx, '45%', tx0 - 30, 490, { size: 12, color: '#D93A3A' });
        ctx.globalAlpha = 1;
      }
      return;
    }
    if (mode === 'clotting') {
      const gapX = 480;
      const gap = 120 * ease(t, 1.5, 2.2);
      vessel(120, 330, gapX, gap);
      const plug = ease(t, 3, 6);
      const fib = ease(t, 6, 9.5);
      for (let i = 0; i < 60; i++) {
        let x = ((hash(i) * w + t * 80 * (1 - plug * 0.7)) % (w + 40)) - 20;
        let y = 140 + hash(i, 2) * 180;
        // leaking cells drift out of the wound
        if (gap > 0 && hash(i, 7) < 0.25) {
          const leak = clamp((t - 1.8 - hash(i, 8) * 1.5) / 3);
          x = lerp(x, gapX + (hash(i, 9) - 0.5) * 120, leak);
          y = lerp(y, 360 + hash(i, 10) * 120, leak);
        }
        rbc(ctx, x, y, 13, hash(i, 3) * 3);
      }
      // platelets gather at the gap
      for (let i = 0; i < 26; i++) {
        const k = ease(t, 2.8 + hash(i) * 2, 3.6 + hash(i) * 2);
        const x = lerp(hash(i, 1) * w, gapX + (hash(i, 2) - 0.5) * gap * 0.9, k);
        const y = lerp(150 + hash(i, 3) * 160, 330 + (hash(i, 4) - 0.5) * 18, k);
        circle(ctx, x, y, 5, '#F2D27A');
      }
      f.hit(info('Тромбоцитарная пробка', 'Platelet plug', 'Первая «заплатка»: тромбоциты склеиваются и выделяют вещества, запускающие свёртывание.', 'The first patch: platelets stick together and release substances that start clotting.'), gapX, 330, 30);
      // fibrin mesh
      if (fib > 0) {
        ctx.strokeStyle = alpha('#F5F0DC', 0.8 * fib);
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 26; i++) {
          ctx.beginPath();
          ctx.moveTo(gapX - gap / 2 + hash(i) * gap, 300 + hash(i, 1) * 80);
          ctx.lineTo(gapX - gap / 2 + hash(i, 2) * gap, 300 + hash(i, 3) * 80);
          ctx.stroke();
        }
        for (let i = 0; i < 8; i++) rbc(ctx, gapX - gap / 2 + 10 + hash(i, 5) * (gap - 20), 320 + hash(i, 6) * 50, 11, i);
        f.hit(info('Нити фибрина', 'Fibrin threads', 'Нерастворимый белок. Его сеть удерживает клетки крови — получается сгусток.', 'An insoluble protein whose mesh holds blood cells, forming a clot.'), gapX, 350, 40);
      }
      tag(ctx, L('рана', 'wound'), gapX, 480, { color: C.red });
      return;
    }
    if (mode === 'immunity') {
      vessel(40, 140);
      ctx.fillStyle = '#1E1A1C';
      ctx.fillRect(0, 154, w, h - 154);
      f.hitRect(info('Ткань', 'Tissue', 'Сюда проникли микробы через ранку.', 'Microbes got in here through a small wound.'), 0, 470, 120, 60);
      const bac: { x: number; y: number; eaten: number; tagged: number }[] = [];
      for (let i = 0; i < 16; i++) {
        const born = i < 6 ? 0 : 0.8 + (i - 6) * 0.15;
        if (t < born) continue;
        const x = 300 + hash(i, 1) * 560 + wobble(i, t, 0.8) * 10;
        const y = 220 + hash(i, 2) * 280 + wobble(i + 3, t, 0.8) * 10;
        bac.push({ x, y, eaten: i < 9 ? ease(t, 3 + i * 0.45, 3.6 + i * 0.45) : 0, tagged: i >= 9 ? ease(t, 8 + (i - 9) * 0.3, 9 + (i - 9) * 0.3) : 0 });
      }
      // phagocytes chase their targets
      for (let k = 0; k < 2; k++) {
        const targets = bac.filter((_, i) => i % 2 === k && i < 9);
        let px = 200 + k * 200;
        let py = 120;
        const emerge = ease(t, 1.5, 3);
        py = lerp(120, 240 + k * 120, emerge);
        const current = targets.find((b) => b.eaten < 1);
        if (current && t > 3) {
          px = lerp(px, current.x, 0.6 + 0.4 * current.eaten);
          py = lerp(py, current.y, 0.6 + 0.4 * current.eaten);
        } else if (!current && t > 3) {
          px = targets.length ? targets[targets.length - 1].x : px;
          py = targets.length ? targets[targets.length - 1].y : py;
        }
        wbc(ctx, px, py, 30, t, k);
        f.hit(info('Фагоцит', 'Phagocyte', 'Лейкоцит, способный поглощать и переваривать микробов. Протискивается сквозь стенки капилляров.', 'A white cell that engulfs and digests microbes. It squeezes through capillary walls.'), px, py, 30);
      }
      bac.forEach((b, i) => {
        if (b.eaten >= 1) return;
        ctx.globalAlpha = 1 - b.eaten;
        bacterium(ctx, b.x, b.y, i + t * 0.3, 1 - b.eaten * 0.5);
        ctx.globalAlpha = 1;
        if (b.tagged > 0)
          for (let a = 0; a < 4; a++) {
            const ang = (a / 4) * TAU;
            antibody(ctx, b.x + Math.cos(ang) * (16 + 30 * (1 - b.tagged)), b.y + Math.sin(ang) * (16 + 30 * (1 - b.tagged)), ang + Math.PI / 2, 0.9);
          }
        if (i === 0) f.hit(info('Бактерия', 'Bacterium', 'Возбудитель инфекции. Её поверхностные молекулы — антигены — иммунная система распознаёт как чужие.', 'The germ. Its surface molecules, antigens, are recognised as foreign by the immune system.'), b.x, b.y, 16);
      });
      if (t > 7) {
        const lx = 120;
        const ly = 380;
        ball(ctx, lx, ly, 22, '#8FA4FF');
        circle(ctx, lx, ly, 15, '#5B6FD8');
        f.hit(info('B-лимфоцит', 'B lymphocyte', 'Вырабатывает антитела, точно подходящие к антигену как ключ к замку.', 'Makes antibodies that fit the antigen like a key in a lock.'), lx, ly, 24);
        for (let i = 0; i < 10; i++) {
          const s = ((t - 7) * 0.5 + i / 10) % 1;
          antibody(ctx, lerp(lx + 20, 700, s) + Math.sin(s * 10 + i) * 20, ly + (hash(i) - 0.5) * 200 * s, s * 6, 1);
        }
      }
      return;
    }
    // blood groups
    const donor = p.donor;
    const rec = p.rec;
    const ok = compatible(donor, rec);
    const mixK = ease(t, 3, 5);
    const clump = ok ? 0 : ease(t, 4.5, 7);
    const drawCell = (x: number, y: number, ag: string[]) => {
      rbc(ctx, x, y, 16, 0.3);
      ag.forEach((a, k) => {
        for (let j = 0; j < 3; j++) {
          const ang = (j / 3) * TAU + k * 0.5;
          const ax = x + Math.cos(ang) * 18;
          const ay = y + Math.sin(ang) * 12;
          if (a === 'A') {
            ctx.fillStyle = '#F5C842';
            ctx.beginPath();
            ctx.moveTo(ax, ay - 4);
            ctx.lineTo(ax - 4, ay + 3);
            ctx.lineTo(ax + 4, ay + 3);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillStyle = '#3DD6F5';
            ctx.fillRect(ax - 3, ay - 3, 6, 6);
          }
        }
      });
    };
    // donor tube
    text(ctx, `${L('донор', 'donor')}: ${GROUPS[donor]}`, 200, 60, { size: 14 });
    text(ctx, `${L('реципиент', 'recipient')}: ${GROUPS[rec]}`, 760, 60, { size: 14 });
    for (let i = 0; i < 12; i++) {
      const sx = 120 + (i % 4) * 50;
      const sy = 120 + Math.floor(i / 4) * 50;
      const tx2 = 600 + (i % 4) * 60;
      const ty2 = 140 + Math.floor(i / 4) * 70;
      // clumping pulls donor cells together into a few lumps
      const lump = [640, 820][i % 2];
      const lx = lerp(tx2, lump + (hash(i) - 0.5) * 40, clump);
      const ly = lerp(ty2, 260 + (hash(i, 1) - 0.5) * 40, clump);
      drawCell(lerp(sx, lx, mixK), lerp(sy, ly, mixK), ANTIGENS[donor]);
      if (i === 0) f.hit(info('Эритроцит донора', 'Donor red cell', ANTIGENS[donor].length ? `Несёт антигены: ${ANTIGENS[donor].join(', ')}.` : 'Антигенов A и B нет — поэтому O(I) называют универсальным донором.', ANTIGENS[donor].length ? `Carries antigens: ${ANTIGENS[donor].join(', ')}.` : 'No A or B antigens, which is why O is the universal donor.'), lerp(sx, lx, mixK), lerp(sy, ly, mixK), 18);
    }
    // recipient plasma antibodies
    PLASMA_AB[rec].forEach((ab, k) => {
      for (let i = 0; i < 6; i++) {
        const x = 600 + hash(i, k) * 260;
        const y = 350 + hash(i, k + 3) * 120;
        antibody(ctx, x + wobble(i, t, 1) * 5, y, hash(i) * 3, 1.3);
        text(ctx, ab, x + 12, y - 10, { size: 11, color: '#FFD60A' });
      }
    });
    f.hitRect(info('Плазма реципиента', 'Recipient plasma', PLASMA_AB[rec].length ? `Содержит антитела ${PLASMA_AB[rec].join(' и ')}.` : 'Антител нет — AB(IV) называют универсальным реципиентом.', PLASMA_AB[rec].length ? `Contains antibodies ${PLASMA_AB[rec].join(' and ')}.` : 'No antibodies, which is why AB is the universal recipient.'), 580, 330, 300, 160);
    if (t > 5) tag(ctx, ok ? L('совместимо — клетки не склеиваются', 'compatible: no clumping') : L('агглютинация! переливать нельзя', 'agglutination! do not transfuse'), 480, 500, { color: ok ? C.green : C.red, size: 14 });
  },
};

/* ================= plants ================= */

function soil(ctx: CanvasRenderingContext2D, w: number, y: number, h: number) {
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, '#4A3424');
  g.addColorStop(1, '#2A1E16');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, h - y);
  for (let i = 0; i < 120; i++) circle(ctx, hash(i) * w, y + 10 + hash(i, 1) * (h - y), 1.5 + hash(i, 2) * 2, alpha('#7A5A3A', 0.6));
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, color = '#4CAF50') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.35, len, 0);
  ctx.quadraticCurveTo(len * 0.5, len * 0.35, 0, 0);
  ctx.fill();
  line(ctx, [[0, 0], [len * 0.9, 0]], alpha('#1E5A2A', 0.8), 1.2);
  ctx.restore();
}

export const plantLife: SimDef = {
  id: 'plant_life',
  title: tx('Жизнь растения', 'Plant life'),
  modes: [
    { id: 'germination', label: tx('Прорастание', 'Germination') },
    { id: 'flower', label: tx('Цветок и плод', 'Flower and fruit') },
    { id: 'transport', label: tx('Вода и минералы', 'Water and minerals') },
    { id: 'respiration', label: tx('Дыхание', 'Respiration') },
  ],
  duration: (m) => (m === 'respiration' ? 16 : 14),
  loop: false,
  params: (m) => (m === 'transport' ? [{ id: 'light', label: tx('Солнце и сухой воздух (испарение)', 'Sun and dry air (evaporation)'), min: 0.2, max: 1.5, step: 0.1, value: 1, digits: 1, unit: '×' }] : []),
  stages: (m) =>
    m === 'germination'
      ? [
          { t: 0, label: tx('Набухание', 'Swelling'), text: tx('Семя впитывает воду и набухает. Для прорастания нужны вода, тепло и воздух (кислород для дыхания).', 'The seed soaks up water and swells. Germination needs water, warmth and air (oxygen for respiration).') },
          { t: 2.5, label: tx('Корешок', 'Root'), text: tx('Первым из семени выходит зародышевый корешок — он закрепляет растение и начинает всасывать воду.', 'The embryonic root comes out first, anchoring the plant and starting to take up water.') },
          { t: 5.5, label: tx('Стебелёк', 'Shoot'), text: tx('Стебелёк выносит семядоли к свету. Пока нет листьев, проросток питается запасами семени.', 'The shoot lifts the cotyledons into the light. Until leaves appear, the seedling lives on the seed’s stores.') },
          { t: 9, label: tx('Листья', 'Leaves'), text: tx('Появляются настоящие листья — растение начинает фотосинтез и растёт само.', 'True leaves appear; the plant starts photosynthesising and grows on its own.') },
        ]
      : m === 'flower'
        ? [
            { t: 0, label: tx('Строение цветка', 'Flower parts'), text: tx('Нажимай на части: чашелистики, лепестки, тычинки (пыльца) и пестик (рыльце, столбик, завязь с семязачатками).', 'Tap the parts: sepals, petals, stamens (pollen) and pistil (stigma, style, ovary with ovules).') },
            { t: 3, label: tx('Опыление', 'Pollination'), text: tx('Пчела переносит пыльцу с тычинок на рыльце пестика.', 'A bee carries pollen from the stamens to the stigma.') },
            { t: 6, label: tx('Оплодотворение', 'Fertilisation'), text: tx('Пыльцевая трубка прорастает к семязачатку. У цветковых — двойное оплодотворение (Навашин): один спермий + яйцеклетка = зародыш, второй + центральная клетка = эндосперм.', 'A pollen tube grows down to the ovule. Flowering plants have double fertilisation (Navashin): one sperm + egg = embryo, the other + central cell = endosperm.') },
            { t: 9.5, label: tx('Плод', 'Fruit'), text: tx('Лепестки опадают, завязь разрастается в плод, семязачатки — в семена.', 'The petals drop, the ovary swells into a fruit and the ovules become seeds.') },
          ]
        : m === 'transport'
          ? [
              { t: 0, label: tx('Корневые волоски', 'Root hairs'), text: tx('Корневые волоски всасывают воду с растворёнными минеральными солями.', 'Root hairs absorb water with dissolved mineral salts.') },
              { t: 3, label: tx('Ксилема', 'Xylem'), text: tx('Вода поднимается по сосудам древесины (восходящий ток) — её тянет испарение с листьев и толкает корневое давление.', 'Water rises through the wood vessels (the upward stream), pulled by evaporation from leaves and pushed by root pressure.') },
              { t: 6, label: tx('Испарение', 'Transpiration'), text: tx('Через устьица листа вода испаряется — растение охлаждается. Сильнее солнце и суше воздух — быстрее ток.', 'Water evaporates through the leaf’s stomata, cooling the plant. More sun and drier air mean a faster flow.') },
              { t: 9, label: tx('Флоэма', 'Phloem'), text: tx('Сахара, созданные в листьях, идут вниз по ситовидным трубкам луба (нисходящий ток) — к корням и плодам.', 'Sugars made in the leaves travel down the sieve tubes of the phloem (the downward stream) to roots and fruits.') },
            ]
          : [
              { t: 0, label: tx('День', 'Day'), text: tx('Днём идут оба процесса, но фотосинтез сильнее дыхания: растение выделяет O₂ и поглощает CO₂.', 'By day both processes run, but photosynthesis outpaces respiration: the plant gives out O₂ and takes in CO₂.') },
              { t: 8, label: tx('Ночь', 'Night'), text: tx('Ночью света нет — только дыхание: растение поглощает O₂ и выделяет CO₂, как животные. Поэтому много цветов в спальне — не лучшая идея.', 'At night there is no light, only respiration: the plant takes in O₂ and gives out CO₂, just like animals. That’s why a bedroom full of plants isn’t ideal.') },
            ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'germination') {
      const gy = 260;
      ctx.fillStyle = '#0E1418';
      ctx.fillRect(0, 0, w, gy);
      soil(ctx, w, gy, h);
      const sx = 480;
      const sy = 330;
      const swell = 1 + 0.25 * ease(t, 0, 2.5);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(swell, swell);
      ctx.fillStyle = '#C99A5B';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 20, -0.3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#8A6234';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      f.hit(info('Семя (фасоль)', 'Seed (bean)', 'Кожура + зародыш (корешок, стебелёк, почечка, две семядоли с запасом питательных веществ).', 'A seed coat around the embryo: root, shoot, bud and two cotyledons full of food.'), sx, sy, 32);
      // water drops being absorbed
      for (let i = 0; i < 8; i++) {
        const s = ease(t, i * 0.25, 1.5 + i * 0.25);
        const a = (i / 8) * TAU;
        if (s < 1) circle(ctx, sx + Math.cos(a) * lerp(90, 30, s), sy + Math.sin(a) * lerp(70, 20, s), 4, alpha('#5B9CFF', 1 - s));
      }
      // root
      const root = ease(t, 2.5, 9);
      if (root > 0) {
        const pts: [number, number][] = [];
        for (let s = 0; s <= root; s += 0.02) pts.push([sx + 10 + Math.sin(s * 4) * 10, sy + 15 + s * 190]);
        line(ctx, pts, '#E8DCC0', 5);
        // side roots
        for (let k = 0; k < 6; k++) {
          const s = 0.3 + k * 0.1;
          if (s > root) break;
          const y = sy + 15 + s * 190;
          const len = (root - s) * 90;
          const dir = k % 2 ? 1 : -1;
          line(ctx, [[sx + 10 + Math.sin(s * 4) * 10, y], [sx + 10 + dir * len, y + len * 0.4]], '#E8DCC0', 2);
        }
        f.hit(info('Корень', 'Root', 'Растёт вниз (положительный геотропизм), всасывает воду и минеральные вещества.', 'Grows down (positive gravitropism) and absorbs water and minerals.'), sx + 10, sy + 15 + root * 150, 20);
      }
      // shoot with hook, then cotyledons and leaves
      const shoot = ease(t, 5.5, 10);
      if (shoot > 0) {
        const top = sy - 10 - shoot * 230;
        const hook = 1 - ease(t, 8, 9.5);
        line(ctx, [[sx - 5, sy - 10], [sx - 5, top + 20 * hook]], '#7CC36A', 6);
        if (hook > 0.05) {
          ctx.strokeStyle = '#7CC36A';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(sx - 20, top + 20 * hook, 15, 0, Math.PI * hook, true);
          ctx.stroke();
        }
        const open = ease(t, 8.5, 10);
        if (open > 0) {
          leaf(ctx, sx - 5, top, Math.PI + 0.3 - open * 0.3, 40, '#A6C96A');
          leaf(ctx, sx - 5, top, -0.3 + open * 0.3, 40, '#A6C96A');
        }
        const leaves = ease(t, 10, 13);
        if (leaves > 0) {
          line(ctx, [[sx - 5, top], [sx - 5, top - 50 * leaves]], '#7CC36A', 4);
          leaf(ctx, sx - 5, top - 50 * leaves, -Math.PI / 2 - 0.6, 60 * leaves);
          leaf(ctx, sx - 5, top - 50 * leaves, -Math.PI / 2 + 0.6, 60 * leaves);
        }
        f.hit(info('Проросток', 'Seedling', 'Стебелёк изогнут крючком, чтобы не повредить почечку, пробиваясь сквозь почву.', 'The shoot is hooked so the tender bud isn’t damaged pushing through the soil.'), sx - 5, top, 24);
      }
      // sun
      ball(ctx, 840, 70, 32, '#F5C842', 1);
      return;
    }
    if (mode === 'flower') {
      const cx = 400;
      const cy = 300;
      const fall = ease(t, 9.5, 11);
      const fruit = ease(t, 10, 13.5);
      // stem
      line(ctx, [[cx, cy + 40], [cx, 540]], '#4C9A3F', 10);
      leaf(ctx, cx, 470, -0.4, 90);
      // sepals
      for (let k = 0; k < 5; k++) leaf(ctx, cx, cy + 30, Math.PI / 2 + (k - 2) * 0.5, 50, '#5FA84C');
      f.hit(info('Чашелистики', 'Sepals', 'Зелёные листочки чашечки защищают бутон.', 'The green sepals protect the bud.'), cx + 40, cy + 60, 14);
      // petals
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU - Math.PI / 2;
        const drop = fall * (0.5 + hash(k) * 0.5);
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 30 + drop * (hash(k, 1) - 0.5) * 200, cy + Math.sin(a) * 30 + drop * 240);
        ctx.rotate(a + drop * 3);
        ctx.globalAlpha = 1 - drop * 0.7;
        ctx.fillStyle = '#F07AA0';
        ctx.beginPath();
        ctx.ellipse(70, 0, 75, 34, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      f.hit(info('Лепестки', 'Petals', 'Яркий венчик и нектар привлекают насекомых-опылителей.', 'The bright corolla and nectar attract pollinating insects.'), cx + 110, cy, 30);
      // pistil / ovary
      const ovR = 22 + fruit * 70;
      ball(ctx, cx, cy + 10, ovR, fruit > 0.3 ? mixColor('#8BD450', '#E5484D', fruit) : '#8BD450');
      if (fruit < 0.4) {
        line(ctx, [[cx, cy - 10], [cx, cy - 90]], '#A6D96A', 7);
        circle(ctx, cx, cy - 95, 11, '#D7E86A');
        f.hit(info('Рыльце пестика', 'Stigma', 'Липкое — улавливает пыльцу.', 'Sticky, so it catches pollen.'), cx, cy - 95, 12);
      }
      for (let k = 0; k < 3; k++) circle(ctx, cx - 10 + k * 10, cy + 10, 4 + fruit * 6, fruit > 0.5 ? '#6B4A2A' : '#F2F4F7');
      f.hit(info(fruit > 0.5 ? 'Плод с семенами' : 'Завязь', fruit > 0.5 ? 'Fruit with seeds' : 'Ovary', fruit > 0.5 ? 'Плод развивается из завязи, семена — из семязачатков.' : 'Нижняя часть пестика; внутри — семязачатки с яйцеклетками.', fruit > 0.5 ? 'The fruit grows from the ovary and the seeds from the ovules.' : 'The base of the pistil, holding ovules with egg cells.'), cx, cy + 10, ovR);
      // stamens
      if (fall < 0.8)
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU - Math.PI / 2 + 0.3;
          const ax = cx + Math.cos(a) * 70;
          const ay = cy + Math.sin(a) * 70 - 20;
          line(ctx, [[cx + Math.cos(a) * 20, cy], [ax, ay]], '#F2E8C0', 2.5);
          ctx.fillStyle = '#F5C842';
          ctx.beginPath();
          ctx.ellipse(ax, ay, 9, 5, a, 0, TAU);
          ctx.fill();
          if (k === 1) f.hit(info('Тычинка', 'Stamen', 'Тычиночная нить и пыльник, в котором созревает пыльца (мужские гаметофиты).', 'A filament and an anther, where pollen (the male gametophytes) ripens.'), ax, ay, 12);
        }
      // bee path
      if (t > 2.5 && t < 7) {
        const k = ease(t, 2.5, 6.5);
        const bx = lerp(820, cx + 60, Math.min(1, k * 1.6)) + (k > 0.6 ? lerp(0, -60, (k - 0.6) / 0.4) : 0);
        const by = lerp(80, cy - 60, Math.min(1, k * 1.6)) + Math.sin(t * 9) * 6 - (k > 0.6 ? (k - 0.6) * 60 : 0);
        ctx.fillStyle = '#F5C842';
        ctx.beginPath();
        ctx.ellipse(bx, by, 16, 10, 0, 0, TAU);
        ctx.fill();
        for (let s = -1; s <= 1; s++) line(ctx, [[bx + s * 6, by - 9], [bx + s * 6, by + 9]], '#111214', 3);
        ctx.fillStyle = alpha('#FFFFFF', 0.6);
        ctx.beginPath();
        ctx.ellipse(bx - 4, by - 14 + Math.sin(t * 40) * 3, 10, 6, -0.4, 0, TAU);
        ctx.fill();
        for (let i = 0; i < 6; i++) circle(ctx, bx + (hash(i) - 0.5) * 20, by + 8 + hash(i, 1) * 6, 2, '#F5C842');
        f.hit(info('Пчела', 'Bee', 'Насекомое-опылитель: на волосках тела переносит пыльцу.', 'A pollinator that carries pollen on its body hairs.'), bx, by, 18);
      }
      // pollen tube
      const tube = ease(t, 6, 9);
      if (tube > 0 && fruit < 0.4) {
        line(ctx, [[cx + 3, cy - 95], [cx + 3, lerp(cy - 95, cy + 5, tube)]], '#F5C842', 2);
        circle(ctx, cx + 3, lerp(cy - 95, cy + 5, tube), 3.5, '#FFE58F');
        tag(ctx, L('пыльцевая трубка', 'pollen tube'), cx + 120, cy - 60, { color: C.amber });
      }
      return;
    }
    if (mode === 'transport') {
      const gy = 380;
      ctx.fillStyle = '#0E1418';
      ctx.fillRect(0, 0, w, gy);
      soil(ctx, w, gy, h);
      const sx = 480;
      line(ctx, [[sx, gy + 120], [sx, 120]], '#6B8F4E', 18);
      for (let k = 0; k < 4; k++) leaf(ctx, sx, 140 + k * 50, k % 2 ? -0.5 : Math.PI + 0.5, 120, '#4CAF50');
      for (let k = 0; k < 8; k++) line(ctx, [[sx, gy + 20 + k * 12], [sx + (k % 2 ? 1 : -1) * (80 + k * 10), gy + 60 + k * 14]], '#E8DCC0', 2);
      f.hitRect(info('Стебель', 'Stem', 'Внутри — древесина (ксилема) с сосудами для воды и луб (флоэма) с ситовидными трубками для сахаров.', 'Inside are the wood (xylem) with water vessels and the bast (phloem) with sieve tubes for sugars.'), sx - 9, 200, 18, 160);
      const speed = 0.25 * p.light;
      // xylem water up (left half of stem)
      for (let i = 0; i < 16; i++) {
        const s = (t * speed + i / 16) % 1;
        const y = lerp(gy + 110, 130, s);
        circle(ctx, sx - 4, y, 3.5, '#5B9CFF');
      }
      // minerals from soil to roots
      for (let i = 0; i < 14; i++) {
        const s = (t * 0.2 + i / 14) % 1;
        const a = hash(i) > 0.5 ? 1 : -1;
        circle(ctx, sx + a * lerp(220, 20, s), gy + 60 + hash(i, 1) * 80 * (1 - s), 3, hash(i, 2) > 0.5 ? '#5B9CFF' : '#F5C842');
      }
      // phloem sugar down (right half)
      if (t > 9)
        for (let i = 0; i < 10; i++) {
          const s = (t * 0.15 + i / 10) % 1;
          circle(ctx, sx + 5, lerp(150, gy + 100, s), 3.5, C.orange);
        }
      // transpiration vapour from leaves
      if (t > 6)
        for (let i = 0; i < 20; i++) {
          const s = ((t - 6) * 0.35 * p.light + hash(i)) % 1;
          const lx = sx + (hash(i, 1) > 0.5 ? 1 : -1) * (40 + hash(i, 2) * 80);
          circle(ctx, lx + Math.sin(s * 6 + i) * 6, 160 + hash(i, 3) * 150 - s * 120, 2.5 + s * 3, alpha('#D5D8DE', 0.6 * (1 - s)));
        }
      ball(ctx, 840, 70, 30 + p.light * 6, '#F5C842', p.light);
      tag(ctx, L('восходящий ток: вода + минералы', 'upward: water + minerals'), 160, 250, { color: C.blue });
      if (t > 9) tag(ctx, L('нисходящий ток: сахара', 'downward: sugars'), 780, 300, { color: C.orange });
      tag(ctx, L('корневые волоски', 'root hairs'), 200, gy + 140, { color: '#E8DCC0' });
      f.hit(info('Устьица', 'Stomata', 'Поры в кожице листа: через них испаряется вода и проходят газы.', 'Pores in the leaf skin through which water evaporates and gases pass.'), sx + 90, 200, 30);
      return;
    }
    // day / night gas exchange
    const day = t < 8;
    const k = day ? 1 - ease(t, 6.5, 8) : ease(t, 14.5, 16);
    ctx.fillStyle = mixColor('#0A0E1A', '#1B3550', k);
    ctx.fillRect(0, 0, w, h);
    if (day) ball(ctx, lerp(100, 860, t / 8), 120 - Math.sin((t / 8) * Math.PI) * 60, 34, '#F5C842', 1);
    else {
      ball(ctx, lerp(100, 860, (t - 8) / 8), 110 - Math.sin(((t - 8) / 8) * Math.PI) * 50, 24, '#D5D8DE');
      for (let i = 0; i < 40; i++) circle(ctx, hash(i) * w, hash(i, 1) * 220, 1.2, alpha('#FFFFFF', 0.6));
    }
    leaf(ctx, 300, 330, -0.15, 360, '#3E9A4A');
    f.hit(info('Лист', 'Leaf', 'Дышит круглые сутки, а фотосинтезирует только на свету.', 'Respires day and night but photosynthesises only in light.'), 480, 320, 60);
    const photo = day ? Math.sin((t / 8) * Math.PI) : 0;
    const resp = 0.25;
    const flows = [
      { label: 'O₂', out: photo > resp, mag: Math.abs(photo - resp), color: '#5B9CFF' },
      { label: 'CO₂', out: !(photo > resp), mag: Math.abs(photo - resp), color: '#B5B8C0' },
    ];
    flows.forEach((fl, i) => {
      for (let n = 0; n < Math.round(3 + fl.mag * 8); n++) {
        const s = (t * 0.5 + n / 8 + i * 0.5) % 1;
        const x0 = 380 + n * 30 + i * 15;
        const y0 = 320;
        const y = fl.out ? lerp(y0 - 20, y0 - 150, s) : lerp(y0 - 150, y0 - 20, s);
        text(ctx, fl.label, x0, y, { size: 12, color: alpha(fl.color, 1 - Math.abs(s - 0.5)), weight: 600 });
      }
      tag(ctx, `${fl.label}: ${fl.out ? L('выделяется', 'released') : L('поглощается', 'taken in')}`, 160 + i * 220, 470, { color: fl.color });
    });
    chart(ctx, {
      x: 640, y: 380, w: 300, h: 140, xMax: 16, yMin: -0.4, yMax: 1, title: L('Выделение O₂ (баланс)', 'Net O₂ release'), upTo: t, cursor: t,
      series: [{ color: C.green, fn: (x) => (x < 8 ? Math.sin((x / 8) * Math.PI) : 0) - 0.25 }],
    });
  },
};

/* ================= microbes ================= */

export const microbes: SimDef = {
  id: 'microbes',
  title: tx('Микроорганизмы', 'Microorganisms'),
  modes: [
    { id: 'bacteria', label: tx('Бактерии', 'Bacteria') },
    { id: 'euglena', label: tx('Эвглена', 'Euglena') },
    { id: 'paramecium', label: tx('Инфузория', 'Paramecium') },
    { id: 'virus', label: tx('Вирус', 'Virus') },
  ],
  duration: (m) => (m === 'bacteria' ? 12 : 12),
  loop: false,
  params: (m) => (m === 'bacteria' ? [{ id: 'gen', label: tx('Время деления', 'Division time'), min: 1, max: 3, step: 0.5, value: 2, unit: 'с', digits: 1 }] : []),
  stages: (m) =>
    m === 'bacteria'
      ? [
          { t: 0, label: tx('Прокариоты', 'Prokaryotes'), text: tx('У бактерии нет ядра: ДНК — кольцевая хромосома прямо в цитоплазме. Есть клеточная стенка, иногда жгутики.', 'A bacterium has no nucleus: its DNA is a ring in the cytoplasm. It has a cell wall and sometimes flagella.') },
          { t: 2, label: tx('Деление надвое', 'Binary fission'), text: tx('В хороших условиях бактерия делится каждые ~20 минут. Число растёт в геометрической прогрессии: 1, 2, 4, 8…', 'In good conditions a bacterium divides every ~20 minutes, so numbers double: 1, 2, 4, 8…') },
          { t: 8, label: tx('Колония', 'Colony'), text: tx('За сутки одна клетка дала бы астрономическое потомство — его ограничивают пища, место и отходы. При плохих условиях образуются споры.', 'In a day one cell could have astronomical offspring; food, space and waste stop it. In bad conditions they form spores.') },
        ]
      : m === 'euglena'
        ? [
            { t: 0, label: tx('Эвглена зелёная', 'Green euglena'), text: tx('Одноклеточный организм: на свету фотосинтезирует хлоропластами, в темноте питается готовой органикой — миксотроф.', 'A single cell that photosynthesises with chloroplasts in light and eats organic matter in the dark: a mixotroph.') },
            { t: 4, label: tx('К свету', 'Toward light'), text: tx('Светочувствительный глазок помогает найти свет, жгутик тянет клетку вперёд.', 'A light-sensitive eyespot finds the light and the flagellum pulls the cell forward.') },
          ]
        : m === 'paramecium'
          ? [
              { t: 0, label: tx('Инфузория-туфелька', 'Slipper animalcule'), text: tx('Клетка покрыта ресничками — они бьют согласованно, и туфелька плывёт, вращаясь.', 'The cell is covered in cilia that beat together, so it swims while spinning.') },
              { t: 4, label: tx('Питание', 'Feeding'), text: tx('Через клеточный рот бактерии попадают в пищеварительные вакуоли. Сократительные вакуоли (звёздочки) выкачивают лишнюю воду.', 'Bacteria enter the cell mouth into food vacuoles. Star-shaped contractile vacuoles pump out excess water.') },
              { t: 8, label: tx('Два ядра', 'Two nuclei'), text: tx('Большое ядро управляет жизнью клетки, малое — участвует в половом процессе (конъюгации).', 'The large nucleus runs the cell; the small one takes part in sexual exchange (conjugation).') },
            ]
          : [
              { t: 0, label: tx('Прикрепление', 'Attachment'), text: tx('Вирус — не клетка: белковая оболочка и нуклеиновая кислота. Сам размножаться не может — только в клетке-хозяине.', 'A virus isn’t a cell: just a protein coat and nucleic acid. It can only multiply inside a host cell.') },
              { t: 2.5, label: tx('Проникновение', 'Entry'), text: tx('Вирус впрыскивает свою ДНК/РНК в клетку.', 'The virus injects its DNA or RNA into the cell.') },
              { t: 5, label: tx('Сборка', 'Assembly'), text: tx('Клетка, подчиняясь вирусным генам, строит сотни новых вирусов.', 'Following the viral genes, the cell builds hundreds of new viruses.') },
              { t: 8.5, label: tx('Выход', 'Release'), text: tx('Клетка разрушается, вирусы заражают соседей. Против вирусов антибиотики не работают — нужны вакцины и противовирусные препараты.', 'The cell bursts and the viruses infect neighbours. Antibiotics don’t work on viruses; vaccines and antivirals do.') },
            ],
  metrics: ({ t, p, mode }) => (mode === 'bacteria' ? [{ label: tx('Число бактерий', 'Bacteria count'), value: String(Math.pow(2, Math.floor(Math.max(0, t - 1) / p.gen))) }] : []),
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'bacteria') {
      const gens = Math.floor(Math.max(0, t - 1) / p.gen);
      const phase = (Math.max(0, t - 1) % p.gen) / p.gen;
      const n = Math.pow(2, Math.min(gens, 7));
      const size = Math.max(0.35, 1.6 / Math.sqrt(n) + 0.2);
      for (let i = 0; i < n; i++) {
        const a = i * 2.39996;
        const r = Math.sqrt(i + 0.5) * 34 * size;
        const x = 300 + Math.cos(a) * r;
        const y = 280 + Math.sin(a) * r * 0.85;
        const split = gens < 7 ? ease(phase, 0.6, 1) : 0;
        const ang = hash(i) * 3;
        const len = 46 * size * (1 + 0.4 * ease(phase, 0, 0.6));
        for (const sgn of split > 0.05 ? [-1, 1] : [0]) {
          const ox = Math.cos(ang) * sgn * split * len * 0.35;
          const oy = Math.sin(ang) * sgn * split * len * 0.35;
          ctx.save();
          ctx.translate(x + ox, y + oy);
          ctx.rotate(ang);
          const l = split > 0.05 ? len * 0.55 : len;
          rrect(ctx, -l / 2, -11 * size, l, 22 * size, 11 * size);
          ctx.fillStyle = '#5FB04A';
          ctx.fill();
          ctx.strokeStyle = '#A6D96A';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = alpha('#FFD60A', 0.8);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(0, 0, l * 0.22, 5 * size, 0, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        if (i === 0) f.hit(info('Бактерия', 'Bacterium', 'Клеточная стенка, мембрана, цитоплазма, кольцевая ДНК (жёлтое кольцо), рибосомы. Ядра нет.', 'Cell wall, membrane, cytoplasm, ring DNA (yellow loop) and ribosomes. No nucleus.'), x, y, 24 * size);
      }
      chart(ctx, {
        x: 600, y: 60, w: 330, h: 420, xMax: 12, yMax: 140, title: L('Число бактерий', 'Number of bacteria'), xLabel: L('t, с', 't, s'), upTo: t, cursor: t,
        series: [{ color: C.green, fn: (x) => Math.pow(2, Math.floor(Math.max(0, x - 1) / p.gen)) }],
      });
      return;
    }
    if (mode === 'euglena') {
      const g = ctx.createRadialGradient(880, 80, 10, 880, 80, 300);
      g.addColorStop(0, alpha('#FFE58F', 0.5));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      f.hit(info('Свет', 'Light', 'Эвглена плывёт к свету (фототаксис).', 'The euglena swims toward light (phototaxis).'), 880, 80, 40);
      const k = ease(t, 3, 12);
      const ex = lerp(260, 640, k);
      const ey = lerp(380, 220, k) + Math.sin(t * 3) * 8;
      const ang = Math.atan2(220 - 380, 640 - 260);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang + Math.sin(t * 6) * 0.08);
      ctx.fillStyle = alpha('#7FD38A', 0.35);
      ctx.strokeStyle = '#7FD38A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 130, 46, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = '#2E9A48';
        ctx.beginPath();
        ctx.ellipse(-70 + i * 17, (hash(i) - 0.5) * 40, 10, 6, hash(i, 1) * 3, 0, TAU);
        ctx.fill();
      }
      circle(ctx, -10, 0, 18, alpha('#AB8AFF', 0.7));
      circle(ctx, 100, -14, 7, '#E5484D');
      const fl: [number, number][] = [];
      for (let s = 0; s <= 1; s += 0.03) fl.push([125 + s * 130, Math.sin(s * 10 - t * 14) * 14 * s]);
      line(ctx, fl, '#C9E8A0', 2.5);
      ctx.restore();
      const rot = (x: number, y: number): [number, number] => [ex + x * Math.cos(ang) - y * Math.sin(ang), ey + x * Math.sin(ang) + y * Math.cos(ang)];
      f.hit(info('Хлоропласты', 'Chloroplasts', 'Здесь на свету идёт фотосинтез.', 'Where photosynthesis happens in light.'), ...rot(-60, 10), 20);
      f.hit(info('Ядро', 'Nucleus', 'Хранит наследственную информацию.', 'Holds the hereditary information.'), ...rot(-10, 0), 18);
      f.hit(info('Светочувствительный глазок', 'Eyespot', 'Красное пятнышко — «чувствует» направление света.', 'A red spot that senses the direction of light.'), ...rot(100, -14), 10);
      f.hit(info('Жгутик', 'Flagellum', 'Вращаясь, ввинчивает клетку в воду.', 'Whips round and screws the cell through the water.'), ...rot(200, 0), 20);
      return;
    }
    if (mode === 'paramecium') {
      const cx = 460 + Math.sin(t * 0.4) * 60;
      const cy = 270;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 0.5) * 0.15);
      ctx.fillStyle = alpha('#B9D4F0', 0.25);
      ctx.strokeStyle = '#B9D4F0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 220, 95, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // cilia
      for (let i = 0; i < 80; i++) {
        const a = (i / 80) * TAU;
        const bx = Math.cos(a) * 220;
        const by = Math.sin(a) * 95;
        const beat = Math.sin(t * 10 - i * 0.5) * 0.5;
        line(ctx, [[bx, by], [bx + Math.cos(a + beat) * 12, by + Math.sin(a + beat) * 12]], alpha('#D5E6F8', 0.7), 1.2);
      }
      // oral groove
      ctx.strokeStyle = alpha('#D5E6F8', 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-40, 90);
      ctx.quadraticCurveTo(10, 30, 40, 10);
      ctx.stroke();
      // nuclei
      ctx.fillStyle = alpha('#AB8AFF', 0.75);
      ctx.beginPath();
      ctx.ellipse(-20, -15, 46, 28, 0.3, 0, TAU);
      ctx.fill();
      circle(ctx, 30, -30, 9, '#7E57C2');
      // food vacuoles moving along
      for (let i = 0; i < 5; i++) {
        const s = (t * 0.08 + i / 5) % 1;
        circle(ctx, lerp(40, -160, s), Math.sin(s * 6) * 40, 13, alpha('#F5A524', 0.6), '#F5A524', 1.5);
      }
      // contractile vacuoles pulsing
      [-140, 140].forEach((x, k) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + k * Math.PI);
        circle(ctx, x, -10, 10 + pulse * 10, alpha('#5B9CFF', 0.5));
        for (let r = 0; r < 6; r++) {
          const a = (r / 6) * TAU;
          line(ctx, [[x + Math.cos(a) * 14, -10 + Math.sin(a) * 14], [x + Math.cos(a) * 36, -10 + Math.sin(a) * 36]], alpha('#5B9CFF', 0.5 + 0.5 * (1 - pulse)), 2);
        }
      });
      ctx.restore();
      f.hit(info('Реснички', 'Cilia', 'Тысячи коротких выростов — органоиды движения.', 'Thousands of short hairs used for movement.'), cx + 200, cy - 60, 24);
      f.hit(info('Большое ядро', 'Macronucleus', 'Управляет обменом веществ.', 'Runs the metabolism.'), cx - 20, cy - 15, 30);
      f.hit(info('Малое ядро', 'Micronucleus', 'Участвует в половом процессе — конъюгации.', 'Takes part in the sexual process, conjugation.'), cx + 30, cy - 30, 12);
      f.hit(info('Пищеварительная вакуоль', 'Food vacuole', 'Пузырёк, в котором переваривается пища; непереваренное выходит через порошицу.', 'A bubble where food is digested; waste leaves through the anal pore.'), cx - 80, cy + 20, 16);
      f.hit(info('Сократительная вакуоль', 'Contractile vacuole', 'Выкачивает избыток воды, иначе клетка в пресной воде лопнула бы.', 'Pumps out excess water, or the cell would burst in fresh water.'), cx - 140, cy - 10, 20);
      return;
    }
    // virus cycle
    const cell = { x: 520, y: 300, r: 210 };
    ctx.fillStyle = alpha('#5FD3B0', 0.1);
    ctx.strokeStyle = '#5FD3B0';
    ctx.lineWidth = 3;
    const burst = ease(t, 8.5, 9.5);
    ctx.setLineDash(burst > 0 ? [10 + burst * 10, burst * 30] : []);
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, cell.r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    circle(ctx, cell.x + 40, cell.y + 30, 60, alpha('#AB8AFF', 0.25 * (1 - burst)), alpha('#AB8AFF', 0.6 * (1 - burst)), 2);
    f.hit(info('Клетка-хозяин', 'Host cell', 'Её рибосомы и ресурсы вирус использует для своего размножения.', 'The virus hijacks its ribosomes and resources to multiply.'), cell.x + 40, cell.y + 30, 60);
    const phage = (x: number, y: number, ang: number, s = 1, empty = false) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.scale(s, s);
      ctx.fillStyle = empty ? alpha('#E8A0F5', 0.35) : '#E8A0F5';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) ctx.lineTo(Math.cos((k / 6) * TAU) * 16, -30 + Math.sin((k / 6) * TAU) * 16);
      ctx.closePath();
      ctx.fill();
      line(ctx, [[0, -14], [0, 14]], '#C9B4D9', 5);
      for (const d of [-1, 1]) {
        line(ctx, [[0, 14], [d * 12, 26]], '#C9B4D9', 2);
        line(ctx, [[0, 14], [d * 5, 28]], '#C9B4D9', 2);
      }
      ctx.restore();
    };
    const ax = cell.x - cell.r * 0.7;
    const ay = cell.y - cell.r * 0.71 - 26;
    const arrive = ease(t, 0, 2.5);
    if (burst < 1) phage(lerp(ax - 200, ax, arrive), lerp(ay - 120, ay, arrive), 0.78, 1.4, t > 3.5);
    f.hit(info('Бактериофаг', 'Bacteriophage', 'Вирус бактерий: головка с ДНК, хвостовой отросток и нити для прикрепления.', 'A virus of bacteria: a head holding DNA, a tail and fibres to attach.'), ax, ay, 30);
    const inj = ease(t, 2.5, 4.5);
    if (inj > 0 && t < 5.5) {
      const pts: [number, number][] = [];
      for (let s = 0; s <= inj; s += 0.05) pts.push([ax + 30 + s * 120 + Math.sin(s * 12) * 8, ay + 40 + s * 110]);
      line(ctx, pts, '#FFD60A', 2.5);
      if (inj > 0.5) tag(ctx, L('ДНК вируса', 'viral DNA'), ax + 170, ay + 130, { color: C.yellow });
    }
    // new viruses assemble
    const nNew = Math.floor(ease(t, 5, 8.5) * 14);
    for (let i = 0; i < nNew; i++) {
      const a = hash(i) * TAU;
      const r = 40 + hash(i, 1) * 120;
      const rx = cell.x + Math.cos(a) * r;
      const ry = cell.y + Math.sin(a) * r;
      const out = burst * (220 + hash(i, 2) * 200);
      phage(rx + Math.cos(a) * out, ry + Math.sin(a) * out, a + Math.PI / 2 + Math.sin(t + i) * 0.3, 0.75);
    }
    if (nNew > 0) tag(ctx, `${L('новых вирусов', 'new viruses')}: ${nNew * 20}+`, cell.x, 60, { color: C.pink });
  },
};
