import { alpha, arrow, backdrop, ball, C, chart, circle, clamp, ease, hash, info, lerp, line, mixColor, rrect, SimDef, Stage, tag, TAU, text, tx, wobble } from '../kit';

/* ================= cell division ================= */

const PAIR_COLORS = [
  ['#E5484D', '#F59BA0'], // long pair: maternal / paternal
  ['#3F6FE0', '#8FB0FF'], // short pair
];

/** one chromatid as a rounded rod centred at (x, y) */
function rod(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, color: string, width = 9, tip?: string) {
  const dx = (Math.cos(ang) * len) / 2;
  const dy = (Math.sin(ang) * len) / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x - dx, y - dy);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  if (tip) {
    // crossed-over end segment
    ctx.strokeStyle = tip;
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.45, y + dy * 0.45);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

/** replicated chromosome: two sister chromatids joined at the centromere (X shape) */
function xChrom(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, color: string, split = 0, tips?: [string?, string?]) {
  const spread = 0.28 + split * 0.6;
  rod(ctx, x, y, ang + Math.PI / 2 - spread, len, color, 8, tips?.[0]);
  rod(ctx, x, y, ang + Math.PI / 2 + spread, len, color, 8, tips?.[1]);
  circle(ctx, x, y, 4.5, '#FFE58F');
}

function cellBody(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 10, x, y, Math.max(rx, ry));
  g.addColorStop(0, 'rgba(120,200,170,0.22)');
  g.addColorStop(1, 'rgba(60,150,120,0.12)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = alpha('#5FD3B0', 0.8);
  ctx.lineWidth = 3;
  ctx.stroke();
}

function nucleusRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (a <= 0.02) return;
  ctx.strokeStyle = alpha('#AB8AFF', 0.8 * a);
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = alpha('#AB8AFF', 0.07 * a);
  ctx.fill();
}

function chromatin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, a: number, doubled: number) {
  if (a <= 0.02) return;
  for (let i = 0; i < 4; i++) {
    const col = PAIR_COLORS[i >> 1][i & 1];
    for (let copy = 0; copy < 1 + (doubled > 0.5 ? 1 : 0); copy++) {
      ctx.strokeStyle = alpha(col, 0.6 * a);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s <= 30; s++) {
        const u = s / 30;
        const ang = hash(i, copy) * TAU + u * 5 + Math.sin(t * 0.8 + i) * 0.2;
        const rr = r * 0.75 * (0.2 + 0.8 * Math.abs(Math.sin(u * 3 + i + copy)));
        const px = x + Math.cos(ang) * rr + copy * 3;
        const py = y + Math.sin(ang) * rr;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
}

function spindle(ctx: CanvasRenderingContext2D, p1: [number, number], p2: [number, number], targets: [number, number][], a: number) {
  if (a <= 0.02) return;
  [p1, p2].forEach((p) => {
    circle(ctx, p[0], p[1], 6, alpha('#FFE58F', a));
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * TAU;
      line(ctx, [p, [p[0] + Math.cos(ang) * 16, p[1] + Math.sin(ang) * 16]], alpha('#FFE58F', 0.5 * a), 1);
    }
    targets.forEach((tg) => line(ctx, [p, tg], alpha('#D5D8DE', 0.35 * a), 1));
  });
}

const MITOSIS: Stage[] = [
  { t: 0, label: tx('Интерфаза', 'Interphase'), text: tx('Клетка растёт и удваивает ДНК (период S): каждая хромосома копирует себя. Набор 2n2c → 2n4c.', 'The cell grows and copies its DNA (S phase): every chromosome duplicates. 2n2c → 2n4c.') },
  { t: 3, label: tx('Профаза', 'Prophase'), text: tx('Хромосомы спирализуются и становятся видны — из двух сестринских хроматид. Ядерная оболочка исчезает, центриоли расходятся и строят веретено деления.', 'Chromosomes coil up and become visible as two sister chromatids. The nuclear envelope breaks down; centrioles move apart and build the spindle.') },
  { t: 5, label: tx('Метафаза', 'Metaphase'), text: tx('Хромосомы выстраиваются по экватору клетки, нити веретена крепятся к центромерам. Лучший момент, чтобы посчитать хромосомы.', 'Chromosomes line up on the cell’s equator with spindle fibres attached to their centromeres. The best moment to count them.') },
  { t: 7, label: tx('Анафаза', 'Anaphase'), text: tx('Центромеры разделяются, и сестринские хроматиды расходятся к противоположным полюсам.', 'Centromeres split and sister chromatids are pulled to opposite poles.') },
  { t: 9, label: tx('Телофаза', 'Telophase'), text: tx('Вокруг хромосом снова формируются ядра, хромосомы раскручиваются. Цитоплазма делится (цитокинез).', 'Nuclei re-form round each set and the chromosomes uncoil. The cytoplasm divides (cytokinesis).') },
  { t: 12, label: tx('Две клетки', 'Two cells'), text: tx('Получились две клетки с тем же набором хромосом 2n, что у материнской, — генетически одинаковые. Так растёт организм и заживают раны.', 'Two cells with the same 2n chromosome set as the parent, genetically identical. This is how bodies grow and wounds heal.') },
];

const MEIOSIS: Stage[] = [
  { t: 0, label: tx('Интерфаза', 'Interphase'), text: tx('ДНК удваивается, как перед митозом.', 'DNA is copied, as before mitosis.') },
  { t: 2, label: tx('Профаза I', 'Prophase I'), text: tx('Гомологичные хромосомы (от мамы и от папы) сближаются попарно — конъюгация — и обмениваются участками: кроссинговер.', 'Homologous chromosomes (one from each parent) pair up, called synapsis, and swap segments: crossing over.') },
  { t: 4.5, label: tx('Метафаза I', 'Metaphase I'), text: tx('По экватору выстраиваются пары гомологов (биваленты).', 'Pairs of homologues (bivalents) line up on the equator.') },
  { t: 6, label: tx('Анафаза I', 'Anaphase I'), text: tx('К полюсам расходятся целые гомологичные хромосомы — случайно, независимо для каждой пары. Набор уменьшается вдвое: редукционное деление.', 'Whole homologous chromosomes go to the poles, randomly for each pair. The set is halved: the reduction division.') },
  { t: 7.5, label: tx('Телофаза I', 'Telophase I'), text: tx('Две клетки с гаплоидным набором n2c — у каждой хромосомы ещё по две хроматиды.', 'Two cells with a haploid n2c set; each chromosome still has two chromatids.') },
  { t: 9, label: tx('Мейоз II', 'Meiosis II'), text: tx('Второе деление идёт как митоз: хромосомы встают на экватор, хроматиды расходятся.', 'The second division runs like mitosis: chromosomes line up and the chromatids separate.') },
  { t: 12.5, label: tx('Четыре гаметы', 'Four gametes'), text: tx('Итог — 4 гаплоидные клетки (nc), все генетически разные: кроссинговер + случайное расхождение. Отсюда разнообразие потомков.', 'The result: 4 haploid cells (nc), all genetically different thanks to crossing over and random assortment. Hence the variety of offspring.') },
];

const EMBRYO: Stage[] = [
  { t: 0, label: tx('Оплодотворение', 'Fertilisation'), text: tx('Сперматозоид (n) сливается с яйцеклеткой (n) — образуется зигота с диплоидным набором 2n.', 'A sperm (n) fuses with an egg (n), forming a diploid zygote (2n).') },
  { t: 3, label: tx('Дробление', 'Cleavage'), text: tx('Зигота делится митозом: 2, 4, 8, 16 клеток. Клетки (бластомеры) не растут — становятся всё мельче.', 'The zygote divides by mitosis into 2, 4, 8, 16 cells. The blastomeres don’t grow, so they get smaller each time.') },
  { t: 7, label: tx('Бластула', 'Blastula'), text: tx('Клетки образуют полый шар — бластулу — со стенкой в один слой.', 'The cells form a hollow ball, the blastula, with a wall one cell thick.') },
  { t: 10, label: tx('Гаструла', 'Gastrula'), text: tx('Стенка впячивается внутрь: появляются зародышевые листки — эктодерма (кожа, нервы) и энтодерма (кишечник); позже мезодерма (мышцы, кровь, кости).', 'The wall folds inward, forming germ layers: ectoderm (skin, nerves) and endoderm (gut); later mesoderm (muscle, blood, bone).') },
];

export const cellDivision: SimDef = {
  id: 'cell_division',
  title: tx('Деление клетки', 'Cell division'),
  modes: [
    { id: 'mitosis', label: tx('Митоз', 'Mitosis') },
    { id: 'meiosis', label: tx('Мейоз', 'Meiosis') },
    { id: 'embryo', label: tx('Развитие зародыша', 'Embryo development') },
  ],
  duration: (m) => (m === 'mitosis' ? 14 : m === 'meiosis' ? 16 : 14),
  loop: false,
  stages: (m) => (m === 'mitosis' ? MITOSIS : m === 'meiosis' ? MEIOSIS : EMBRYO),
  metrics: ({ t, mode }) => {
    if (mode === 'mitosis') return [{ label: tx('Набор', 'Set'), value: t < 1.5 ? '2n2c' : t < 7 ? '2n4c' : t < 12 ? '4n4c → 2×2n2c' : '2 × 2n2c' }];
    if (mode === 'meiosis') return [{ label: tx('Набор', 'Set'), value: t < 1.5 ? '2n2c' : t < 7.5 ? '2n4c' : t < 12.5 ? '2 × n2c' : '4 × nc' }];
    const cells = t < 3 ? 1 : Math.min(64, Math.pow(2, Math.floor((t - 3) / 0.9) + 1));
    return [{ label: tx('Число клеток', 'Cells'), value: t < 7 ? String(cells) : '≈ 64–128' }];
  },
  draw(f) {
    const { ctx, w, h, t, mode, L } = f;
    backdrop(ctx, w, h);
    const cx = 480;
    const cy = 270;
    if (mode === 'mitosis') {
      // cell bodies
      const cut = ease(t, 9.5, 12);
      if (cut < 0.01) cellBody(ctx, cx, cy, 230 + ease(t, 6, 9) * 30, 170 - ease(t, 6, 9) * 10);
      else {
        const off = cut * 175;
        cellBody(ctx, cx - off, cy, 260 - cut * 90, 160 - cut * 20);
        cellBody(ctx, cx + off, cy, 260 - cut * 90, 160 - cut * 20);
      }
      f.hitRect(info('Клетка', 'Cell', 'Соматическая клетка тела с диплоидным набором 2n (здесь 2n = 4).', 'A body cell with a diploid 2n set (here 2n = 4).'), cx - 200, cy - 160, 60, 40);
      const condense = ease(t, 3, 4.5);
      const env = 1 - ease(t, 4, 5);
      const envBack = ease(t, 10, 11.5);
      nucleusRing(ctx, cx, cy, 90, env);
      chromatin(ctx, cx, cy, 90, t, 1 - condense, seg01(t, 1.5, 3));
      // poles and spindle
      const poleA: [number, number] = [cx - lerp(30, 200, ease(t, 3.5, 5)), cy];
      const poleB: [number, number] = [cx + lerp(30, 200, ease(t, 3.5, 5)), cy];
      const chromPos: [number, number][] = [];
      for (let i = 0; i < 4; i++) {
        const pair = i >> 1;
        const col = PAIR_COLORS[pair][i & 1];
        const len = pair === 0 ? 62 : 38;
        const px = cx + (hash(i, 1) - 0.5) * 90;
        const py = cy + (hash(i, 2) - 0.5) * 90;
        const ex = cx;
        const ey = cy - 105 + i * 70;
        const m = ease(t, 5, 6.5);
        const x = lerp(px, ex, m);
        const y = lerp(py, ey, m);
        chromPos.push([x, y]);
        if (t < 7) {
          ctx.globalAlpha = condense;
          xChrom(ctx, x, y, lerp(hash(i, 3) * 3, 0, m), len, col);
          ctx.globalAlpha = 1;
          if (i === 0 && condense > 0.5) f.hit(info('Хромосома', 'Chromosome', 'Две сестринские хроматиды — точные копии ДНК, соединённые центромерой (жёлтая точка).', 'Two sister chromatids, exact DNA copies joined at the centromere (yellow dot).'), x, y, 30);
        } else {
          const a = ease(t, 7, 9);
          const d = a * 170;
          const decond = 1 - ease(t, 10.5, 12);
          ctx.globalAlpha = decond;
          // arms trail behind the centromere as the chromatids are pulled
          rod(ctx, x - d + Math.sin(0.9 * a) * len * 0.35, y, Math.PI / 2 - 0.9 * a * (1 - ease(t, 10, 11.5)), len, col, 8);
          rod(ctx, x + d - Math.sin(0.9 * a) * len * 0.35, y, Math.PI / 2 + 0.9 * a * (1 - ease(t, 10, 11.5)), len, col, 8);
          circle(ctx, x - d, y, 4, '#FFE58F');
          circle(ctx, x + d, y, 4, '#FFE58F');
          ctx.globalAlpha = 1;
          if (i === 0) f.hit(info('Хроматида', 'Chromatid', 'После разделения каждая хроматида становится самостоятельной хромосомой.', 'Once separated, each chromatid becomes a chromosome in its own right.'), x - d, y, 20);
        }
      }
      spindle(ctx, poleA, poleB, chromPos.map(([x, y]) => [x - (t > 7 ? ease(t, 7, 9) * 170 : 0), y]), ease(t, 3.5, 5) * (1 - ease(t, 9.5, 11)));
      if (t > 9.5) {
        nucleusRing(ctx, cx - 170, cy, 75, envBack);
        nucleusRing(ctx, cx + 170, cy, 75, envBack);
        chromatin(ctx, cx - 170, cy, 70, t, envBack, 0);
        chromatin(ctx, cx + 170, cy, 70, t, envBack, 0);
      }
      if (t > 4.5 && t < 7) {
        line(ctx, [[cx, cy - 170], [cx, cy + 170]], alpha('#FFFFFF', 0.25), 1, [6, 6]);
        tag(ctx, L('экватор', 'equator'), cx, cy - 185, { color: C.dim });
      }
      return;
    }

    if (mode === 'meiosis') {
      const div1 = ease(t, 7.5, 9);
      const div2 = ease(t, 12.5, 14);
      // cells
      if (div1 < 0.01) cellBody(ctx, cx, cy, 240, 170);
      else if (div2 < 0.01) {
        cellBody(ctx, cx - 210 * div1, cy, 240 - 120 * div1, 170 - 30 * div1);
        cellBody(ctx, cx + 210 * div1, cy, 240 - 120 * div1, 170 - 30 * div1);
      } else
        [-1, 1].forEach((sx) =>
          [-1, 1].forEach((sy) => cellBody(ctx, cx + sx * 210, cy + sy * 120 * div2, 120 - 35 * div2, 140 - 70 * div2)),
        );
      const condense = ease(t, 2, 3);
      nucleusRing(ctx, cx, cy, 95, 1 - ease(t, 3, 4));
      chromatin(ctx, cx, cy, 95, t, 1 - condense, seg01(t, 0.5, 2));
      const cross = ease(t, 3.4, 4.4);
      // which homologue goes left in meiosis I (random assortment, fixed here)
      const leftHomolog = [0, 1];
      const pos: [number, number][] = [];
      for (let pair = 0; pair < 2; pair++) {
        for (let hm = 0; hm < 2; hm++) {
          const col = PAIR_COLORS[pair][hm];
          const other = PAIR_COLORS[pair][1 - hm];
          const len = pair === 0 ? 62 : 38;
          // start scattered, then pair up side by side (synapsis)
          const sx = cx + (hash(pair, hm) - 0.5) * 120;
          const sy = cy + (hash(pair, hm, 2) - 0.5) * 110;
          const pairY = cy - 60 + pair * 120;
          const synX = cx + (hm ? 12 : -12);
          const meta = ease(t, 4.5, 5.8);
          const goLeft = hm === leftHomolog[pair];
          const metaX = cx + (goLeft ? -22 : 22);
          let x = lerp(lerp(sx, synX, ease(t, 2.4, 3.4)), metaX, meta);
          let y = lerp(sy, pairY, ease(t, 2.4, 3.4));
          // anaphase I: whole chromosomes to the poles, then follow their cell
          const a1 = ease(t, 6, 7.5);
          x += (goLeft ? -1 : 1) * (a1 * 180 + div1 * 30);
          // meiosis II: line up vertically, then chromatids split up/down
          const m2 = ease(t, 9, 10.5);
          const cellX = cx + (goLeft ? -210 : 210);
          x = lerp(x, cellX, m2);
          y = lerp(y, cy - 40 + pair * 80, m2);
          const a2 = ease(t, 10.5, 12.5);
          const tips: [string?, string?] = cross > 0.5 ? [undefined, other] : [undefined, undefined];
          if (a2 < 0.02) {
            ctx.globalAlpha = condense;
            xChrom(ctx, x, y, m2 > 0.5 ? Math.PI / 2 : 0, len, col, 0, tips);
            ctx.globalAlpha = 1;
            pos.push([x, y]);
            if (pair === 0 && hm === 0 && condense > 0.5)
              f.hit(
                cross > 0.5
                  ? info('Хромосома после кроссинговера', 'Chromosome after crossing over', 'Кончик одной хроматиды теперь от гомологичной хромосомы — новое сочетание генов.', 'The tip of one chromatid now comes from the homologous chromosome: a new mix of genes.')
                  : info('Гомологичная хромосома', 'Homologous chromosome', 'Одна из пары: одна получена от матери, другая — от отца. Несут одни и те же гены.', 'One of a pair, one from the mother and one from the father, carrying the same genes.'),
                x,
                y,
                30,
              );
          } else {
            // chromatids to top and bottom of each cell, then into the four gametes
            const d = a2 * 90 + div2 * 30;
            rod(ctx, x, y - d, 0, len, col, 8);
            rod(ctx, x, y + d, 0, len, col, 8, cross > 0.5 ? other : undefined);
            circle(ctx, x, y - d, 4, '#FFE58F');
            circle(ctx, x, y + d, 4, '#FFE58F');
          }
        }
      }
      if (t > 3.3 && t < 4.6) tag(ctx, L('кроссинговер!', 'crossing over!'), cx, cy - 150, { color: C.amber, size: 13 });
      if (t > 13.5) [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => tag(ctx, 'n', cx + sx * 300, cy + sy * 150, { color: C.green })));
      return;
    }

    // embryo: fertilisation → cleavage → blastula → gastrula
    if (t < 3) {
      ball(ctx, cx, cy, 130, '#E8C4A0');
      ctx.strokeStyle = alpha('#FFFFFF', 0.4);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 138, 0, TAU);
      ctx.stroke();
      f.hit(info('Яйцеклетка', 'Egg cell', 'Крупная неподвижная клетка с запасом питательных веществ, гаплоидная (n).', 'A large, still cell with stored nutrients; haploid (n).'), cx, cy, 130);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.4;
        const k = i === 0 ? ease(t, 0, 2) : ease(t, 0, 2) * 0.8;
        const sx = cx + Math.cos(a) * lerp(420, i === 0 ? 140 : 170, k);
        const sy = cy + Math.sin(a) * lerp(420, i === 0 ? 140 : 170, k);
        ball(ctx, sx, sy, 7, '#D5D8DE');
        const tail: [number, number][] = [];
        for (let s = 0; s < 14; s++) tail.push([sx + Math.cos(a) * s * 4 + Math.sin(t * 12 + s) * 3, sy + Math.sin(a) * s * 4 + Math.cos(t * 12 + s) * 3]);
        line(ctx, tail, '#D5D8DE', 1.5);
        if (i === 0) f.hit(info('Сперматозоид', 'Sperm', 'Подвижная мужская гамета (n). Внутрь проникает только один.', 'The motile male gamete (n). Only one gets in.'), sx, sy, 12);
      }
      if (t > 2) {
        ctx.strokeStyle = alpha(C.yellow, ease(t, 2, 2.5));
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 145, 0, TAU);
        ctx.stroke();
        tag(ctx, L('оболочка оплодотворения', 'fertilisation membrane'), cx, cy - 170, { color: C.yellow });
      }
      return;
    }
    if (t < 7) {
      const gen = Math.min(5, Math.floor((t - 3) / 0.8) + 1);
      const n = Math.pow(2, gen);
      const r = 130;
      const cellR = (r / Math.sqrt(n)) * 1.05;
      for (let i = 0; i < n; i++) {
        // golden-angle packing inside the ball
        const a = i * 2.39996;
        const rr = Math.sqrt((i + 0.5) / n) * (r - cellR * 0.8);
        ball(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, cellR, mixColor('#E8C4A0', '#D9A77A', hash(i)));
      }
      f.hit(info('Бластомеры', 'Blastomeres', 'Клетки дробящегося зародыша. Общий размер не меняется — клетки мельчают.', 'The cells of the cleaving embryo. Total size stays the same, so the cells get smaller.'), cx, cy, 130);
      tag(ctx, `${n} ${L('клеток', 'cells')}`, cx, cy + 170, { color: C.amber });
      return;
    }
    // blastula then gastrula (cross-section)
    const inv = ease(t, 10, 13);
    const n = 40;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      // bottom cells fold inward during gastrulation
      const bottom = Math.max(0, Math.sin(a)); // 1 at bottom
      const r = 130 - inv * bottom * bottom * 150;
      const x = cx + Math.cos(a) * 130 * (1 - inv * bottom * 0.25);
      const y = cy + Math.sin(a) * r;
      const endo = bottom > 0.5 && inv > 0.3;
      ball(ctx, x, y, 13, endo ? '#F5A524' : '#5FD3B0');
    }
    if (inv < 0.3) tag(ctx, L('бластоцель (полость)', 'blastocoel (cavity)'), cx, cy, { color: C.dim });
    else {
      tag(ctx, L('эктодерма', 'ectoderm'), cx - 200, cy - 110, { color: '#5FD3B0' });
      tag(ctx, L('энтодерма', 'endoderm'), cx, cy - 20, { color: C.amber });
      tag(ctx, L('первичный рот', 'blastopore'), cx, cy + 150, { color: C.text });
    }
    f.hit(info('Зародыш', 'Embryo', 'Из эктодермы разовьются кожа и нервная система, из энтодермы — кишечник, лёгкие, печень.', 'Ectoderm becomes skin and the nervous system; endoderm becomes the gut, lungs and liver.'), cx, cy - 130, 20);
  },
};

const seg01 = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/* ================= ecosystems ================= */

const LEVELS = [
  { n: tx('Растения', 'Plants'), role: tx('продуценты', 'producers'), color: '#30A46C', kj: 10000, t: tx('Создают органику из CO₂ и воды на свету — основа любой экосистемы.', 'Build organic matter from CO₂ and water using light: the base of every ecosystem.') },
  { n: tx('Заяц', 'Hare'), role: tx('консумент I', 'primary consumer'), color: '#C9A06A', kj: 1000, t: tx('Растительноядное животное. Усваивает около 10% энергии растений.', 'A plant eater. Keeps about 10% of the plants’ energy.') },
  { n: tx('Лиса', 'Fox'), role: tx('консумент II', 'secondary consumer'), color: '#F76B15', kj: 100, t: tx('Хищник. Большая часть энергии уходит на дыхание и тепло.', 'A predator. Most energy goes on breathing and body heat.') },
  { n: tx('Беркут', 'Golden eagle'), role: tx('консумент III', 'tertiary consumer'), color: '#8C6A4A', kj: 10, t: tx('Высший хищник. Поэтому хищников мало, а цепи редко длиннее 4–5 звеньев.', 'A top predator. That’s why predators are few and chains rarely exceed 4–5 links.') },
];

function lotka(p: Record<string, number>, tEnd: number) {
  // hares H, lynx L
  let H = 40;
  let Ly = 9;
  const a = 0.55 * p.birth;
  const b = 0.028;
  const c = 0.5;
  const d = 0.011 * p.hunt;
  const dt = 0.02;
  const pts: [number, number, number][] = [[0, H, Ly]];
  for (let t = 0; t < tEnd; t += dt) {
    const dH = a * H - b * H * Ly;
    const dL = d * H * Ly - c * Ly;
    H = Math.max(0.5, H + dH * dt);
    Ly = Math.max(0.2, Ly + dL * dt);
    pts.push([t + dt, H, Ly]);
  }
  return pts;
}
const lotkaCache = new Map<string, [number, number, number][]>();
const lotkaFor = (p: Record<string, number>) => {
  const key = `${p.birth}|${p.hunt}`;
  if (!lotkaCache.has(key)) lotkaCache.set(key, lotka(p, 30));
  return lotkaCache.get(key)!;
};

export const ecosystem: SimDef = {
  id: 'ecosystem',
  title: tx('Экосистема', 'Ecosystem'),
  modes: [
    { id: 'chain', label: tx('Цепь питания', 'Food chain') },
    { id: 'predator', label: tx('Хищник — жертва', 'Predator–prey') },
    { id: 'population', label: tx('Рост популяции', 'Population growth') },
    { id: 'succession', label: tx('Сукцессия', 'Succession') },
    { id: 'carbon', label: tx('Круговорот углерода', 'Carbon cycle') },
    { id: 'tolerance', label: tx('Фактор и оптимум', 'Factors and optimum') },
  ],
  duration: (m) => (m === 'predator' ? 30 : m === 'succession' ? 16 : m === 'carbon' ? 12 : 12),
  loop: false,
  params: (m) =>
    m === 'predator'
      ? [
          { id: 'birth', label: tx('Размножение зайцев', 'Hare birth rate'), min: 0.6, max: 1.4, step: 0.1, value: 1, digits: 1, unit: '×' },
          { id: 'hunt', label: tx('Успешность охоты рысей', 'Lynx hunting success'), min: 0.6, max: 1.4, step: 0.1, value: 1, digits: 1, unit: '×' },
        ]
      : m === 'population'
        ? [{ id: 'K', label: tx('Ёмкость среды (ресурсы)', 'Carrying capacity'), min: 100, max: 500, step: 50, value: 300 }]
        : m === 'tolerance'
          ? [{ id: 'T', label: tx('Температура воды', 'Water temperature'), min: 0, max: 40, step: 1, value: 20, unit: '°C' }]
          : [],
  stages: (m) =>
    m === 'chain'
      ? [
          { t: 0, label: tx('Продуценты', 'Producers'), text: tx('Растения запасают энергию Солнца в органических веществах.', 'Plants store the Sun’s energy in organic matter.') },
          { t: 3, label: tx('Передача', 'Transfer'), text: tx('По цепи питания на следующий уровень переходит лишь ~10% энергии (правило Линдемана). Остальное — на дыхание, движение, тепло.', 'Only ~10% of the energy passes to the next level (Lindeman’s rule). The rest goes on breathing, movement and heat.') },
          { t: 8, label: tx('Пирамида', 'Pyramid'), text: tx('Поэтому получается экологическая пирамида: 10 000 кДж растений прокормят всего 10 кДж беркута.', 'Hence the ecological pyramid: 10,000 kJ of plants feed just 10 kJ of eagle.') },
        ]
      : m === 'predator'
        ? [
            { t: 0, label: tx('Много зайцев', 'Plenty of hares'), text: tx('Корма для рысей много — их численность растёт.', 'Lynx have plenty of food, so their numbers grow.') },
            { t: 6, label: tx('Хищники догоняют', 'Predators catch up'), text: tx('Рысей стало много — зайцев съедают, их число падает. Затем от голода сокращаются рыси.', 'With many lynx, hares are eaten and decline. Then the starving lynx decline too.') },
            { t: 14, label: tx('Циклы', 'Cycles'), text: tx('Численности колеблются со сдвигом: пик хищников отстаёт от пика жертв. Так было с зайцами и рысями в Канаде (данные за 100 лет).', 'Numbers oscillate out of step: predator peaks lag behind prey peaks, as seen in a century of Canadian hare and lynx data.') },
          ]
        : m === 'population'
          ? [
              { t: 0, label: tx('Экспонента', 'Exponential'), text: tx('Без ограничений популяция растёт всё быстрее — J-образная кривая.', 'Without limits a population grows faster and faster: a J-shaped curve.') },
              { t: 5, label: tx('Ограничения', 'Limits'), text: tx('Пищи и места не хватает, растёт конкуренция и смертность — рост замедляется.', 'Food and space run short, competition and deaths rise, and growth slows.') },
              { t: 9, label: tx('Ёмкость среды', 'Carrying capacity'), text: tx('Популяция выходит на плато K — столько особей среда может прокормить: S-образная (логистическая) кривая.', 'The population levels off at K, as many as the habitat can support: an S-shaped (logistic) curve.') },
            ]
          : m === 'succession'
            ? [
                { t: 0, label: tx('Голая скала', 'Bare rock'), text: tx('После извержения или отступления ледника — только камень.', 'After an eruption or a retreating glacier there’s only rock.') },
                { t: 2, label: tx('Лишайники', 'Lichens'), text: tx('Пионеры — лишайники — разрушают камень и образуют первую почву.', 'Pioneer lichens break down the rock and make the first soil.') },
                { t: 5, label: tx('Травы', 'Grasses'), text: tx('Мхи, затем травы обогащают почву органикой.', 'Mosses, then grasses enrich the soil with organic matter.') },
                { t: 8, label: tx('Кустарники и берёзы', 'Shrubs and birches'), text: tx('Светолюбивые деревья растут быстро, но затеняют почву.', 'Light-loving trees grow fast but shade the ground.') },
                { t: 12, label: tx('Климакс', 'Climax'), text: tx('В тени вырастают ели и дубы — устойчивое климаксное сообщество. Весь процесс (первичная сукцессия) занимает сотни лет.', 'Spruce and oak grow up in the shade: a stable climax community. Primary succession takes centuries.') },
              ]
            : m === 'carbon'
              ? [
                  { t: 0, label: tx('Атмосфера', 'Atmosphere'), text: tx('В воздухе 0,04% CO₂ — главный резервуар углерода для живых.', 'Air holds 0.04% CO₂, life’s main carbon reservoir.') },
                  { t: 2, label: tx('Фотосинтез', 'Photosynthesis'), text: tx('Растения связывают CO₂ в органику.', 'Plants fix CO₂ into organic matter.') },
                  { t: 5, label: tx('Дыхание и разложение', 'Respiration and decay'), text: tx('Животные, растения и грибы при дыхании и разложении возвращают CO₂.', 'Animals, plants and fungi return CO₂ by breathing and decay.') },
                  { t: 8, label: tx('Сжигание топлива', 'Burning fuel'), text: tx('Люди сжигают уголь, нефть и газ — углерод, запасённый миллионы лет, быстро уходит в атмосферу. Это усиливает парниковый эффект.', 'People burn coal, oil and gas, quickly releasing carbon stored over millions of years. This strengthens the greenhouse effect.') },
                ]
              : [
                  { t: 0, label: tx('Оптимум', 'Optimum'), text: tx('У каждого вида есть оптимальное значение фактора — там жизнедеятельность максимальна.', 'Each species has an optimal value of a factor where it thrives most.') },
                  { t: 4, label: tx('Пределы', 'Limits'), text: tx('Ближе к границам — зона угнетения, за пределами выносливости организм гибнет. Меняй температуру ползунком.', 'Near the edges is the stress zone; beyond the tolerance limits the organism dies. Change the temperature with the slider.') },
                ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'chain') {
      LEVELS.forEach((lv, i) => {
        const x = 110 + i * 150;
        const y = 150;
        const show = ease(t, i * 1.2, i * 1.2 + 1);
        ctx.globalAlpha = show;
        circle(ctx, x, y, 46, alpha(lv.color, 0.25), lv.color, 2.5);
        text(ctx, lv.n[f.lang], x, y - 6, { size: 14, weight: 600 });
        text(ctx, lv.role[f.lang], x, y + 14, { size: 10.5, color: C.dim });
        f.hit(info(lv.n.ru, lv.n.en, lv.t.ru, lv.t.en), x, y, 46);
        if (i > 0) {
          arrow(ctx, x - 150 + 50, y, x - 52, y, { color: alpha(C.amber, 0.9), width: 2 + (3 - i) });
          tag(ctx, '10%', x - 75, y - 26, { color: C.amber, size: 11 });
          // heat loss arrows
          arrow(ctx, x - 75, y + 10, x - 75, y + 60, { color: alpha(C.red, 0.6), width: 1.5 });
        }
        ctx.globalAlpha = 1;
      });
      tag(ctx, L('90% — тепло, дыхание, движение', '90% lost as heat, breathing, movement'), 330, 240, { color: C.red, size: 11 });
      // energy particles flowing
      for (let k = 0; k < 18; k++) {
        const s = (t * 0.25 + k / 18) % 1;
        const seg = Math.floor(s * 3);
        const u = s * 3 - seg;
        if (seg >= Math.min(3, Math.floor(t / 1.2))) continue;
        if (hash(k, seg) > Math.pow(0.4, seg)) continue;
        circle(ctx, 160 + seg * 150 + u * 50, 150, 4, C.yellow);
      }
      // pyramid
      const grow = ease(t, 7, 10);
      LEVELS.forEach((lv, i) => {
        const wdt = (300 - i * 70) * grow;
        const y = 470 - i * 46;
        rrect(ctx, 760 - wdt / 2, y - 20, wdt, 40, 4);
        ctx.fillStyle = alpha(lv.color, 0.6);
        ctx.fill();
        if (grow > 0.6) text(ctx, `${lv.kj.toLocaleString(f.lang === 'ru' ? 'ru-RU' : 'en-US')} ${L('кДж', 'kJ')}`, 760, y, { size: 12, color: C.white });
      });
      if (grow > 0.5) text(ctx, L('пирамида энергии', 'energy pyramid'), 760, 280, { size: 13, color: C.dim });
      return;
    }
    if (mode === 'predator') {
      const pts = lotkaFor(p);
      const idx = Math.min(pts.length - 1, Math.round(t / 0.02));
      const [, H, Ly] = pts[idx];
      // field with animals
      rrect(ctx, 30, 40, 400, 460, 14);
      ctx.fillStyle = '#1B2A1E';
      ctx.fill();
      const nh = Math.round(Math.min(80, H));
      const nl = Math.round(Math.min(30, Ly));
      for (let i = 0; i < nh; i++) {
        const x = 50 + hash(i, 1) * 360 + wobble(i, t, 1.2) * 8;
        const y = 60 + hash(i, 2) * 420 + wobble(i + 5, t, 1.2) * 8;
        ball(ctx, x, y, 6, '#C9B48A');
        circle(ctx, x - 2, y - 7, 2.5, '#C9B48A');
        circle(ctx, x + 2, y - 7, 2.5, '#C9B48A');
      }
      for (let i = 0; i < nl; i++) {
        const x = 50 + hash(i, 7) * 360 + wobble(i + 30, t, 1.6) * 14;
        const y = 60 + hash(i, 8) * 420 + wobble(i + 40, t, 1.6) * 14;
        ball(ctx, x, y, 9, '#D9733B');
      }
      f.hit(info('Зайцы', 'Hares', 'Жертвы: быстро размножаются, их численность ограничивают хищники и корм.', 'The prey: they breed fast and are held back by predators and food.'), 230, 270, 60);
      chart(ctx, {
        x: 460, y: 40, w: 470, h: 460, xMax: 30, yMax: 160, title: L('Численность', 'Population'), xLabel: L('годы', 'years'), upTo: t, cursor: t,
        series: [
          { color: '#C9B48A', label: L('зайцы', 'hares'), points: pts.filter((_, i) => i % 10 === 0).map(([x, y]) => [x, y] as [number, number]) },
          { color: '#D9733B', label: L('рыси ×4', 'lynx ×4'), points: pts.filter((_, i) => i % 10 === 0).map(([x, , l]) => [x, l * 4] as [number, number]) },
        ],
      });
      return;
    }
    if (mode === 'population') {
      const r = 0.6;
      const N0 = 5;
      const logi = (x: number) => p.K / (1 + ((p.K - N0) / N0) * Math.exp(-r * x));
      const expo = (x: number) => N0 * Math.exp(r * x);
      const N = logi(t);
      rrect(ctx, 30, 40, 400, 460, 14);
      ctx.fillStyle = '#16211A';
      ctx.fill();
      for (let i = 0; i < Math.min(500, Math.round(N)); i++) circle(ctx, 45 + hash(i, 3) * 370, 55 + hash(i, 4) * 430, 3.5, alpha('#8BD450', 0.85));
      f.hitRect(info('Популяция', 'Population', 'Особи одного вида на общей территории. Рост ограничен ресурсами.', 'Individuals of one species sharing an area. Their growth is limited by resources.'), 30, 40, 400, 460);
      tag(ctx, `N = ${Math.round(N)}`, 230, 30, { color: C.lime, size: 13 });
      chart(ctx, {
        x: 460, y: 40, w: 470, h: 460, xMax: 12, yMax: 520, title: L('Численность N(t)', 'Population N(t)'), xLabel: L('время', 'time'), upTo: t, cursor: t,
        series: [
          { color: alpha(C.red, 0.7), label: L('J: без ограничений', 'J: unlimited'), fn: expo, dash: [5, 4] },
          { color: C.lime, label: L('S: с ограничениями', 'S: limited'), fn: logi },
          { color: alpha(C.sky, 0.6), label: 'K', fn: () => p.K, dash: [3, 3], width: 1.5 },
        ],
      });
      return;
    }
    if (mode === 'succession') {
      const ground = 430;
      // sky gets a little greener with time
      ctx.fillStyle = '#0E1512';
      ctx.fillRect(0, 0, w, ground);
      const soil = ease(t, 2, 12) * 40;
      ctx.fillStyle = '#5A5D66';
      ctx.fillRect(0, ground, w, h - ground);
      ctx.fillStyle = '#4A3A26';
      ctx.fillRect(0, ground - soil * 0.2, w, soil);
      for (let i = 0; i < 30; i++) {
        const x = 20 + i * 31;
        const lich = ease(t, 2 + hash(i) * 2, 3 + hash(i) * 2) * (1 - ease(t, 7, 10));
        if (lich > 0) circle(ctx, x, ground - 2, 6 * lich, alpha('#C9D86A', 0.9));
        const grass = ease(t, 5 + hash(i, 1) * 2, 6 + hash(i, 1) * 2) * (1 - ease(t, 13, 15) * 0.6);
        if (grass > 0) for (let k = -1; k <= 1; k++) line(ctx, [[x + k * 4, ground], [x + k * 7, ground - 26 * grass]], '#5FB04A', 2);
      }
      for (let i = 0; i < 8; i++) {
        const x = 60 + i * 120 + hash(i, 3) * 40;
        const shrub = ease(t, 8 + hash(i) * 1.5, 9.5 + hash(i) * 1.5);
        if (shrub > 0 && i % 2) circle(ctx, x, ground - 22 * shrub, 26 * shrub, '#3F7A3A');
        const birch = ease(t, 9 + hash(i, 2) * 2, 11 + hash(i, 2) * 2) * (1 - ease(t, 14, 16) * (i % 3 === 0 ? 0 : 0.7));
        if (birch > 0 && i % 2 === 0) {
          line(ctx, [[x, ground], [x, ground - 150 * birch]], '#E8E4D8', 6);
          circle(ctx, x, ground - 160 * birch, 40 * birch, alpha('#8BD450', 0.85));
        }
        const spruce = ease(t, 12 + hash(i, 4) * 2, 15 + hash(i, 4));
        if (spruce > 0 && i % 3 !== 0) {
          const sx = x + 50;
          ctx.fillStyle = '#1F5A33';
          for (let k = 0; k < 4; k++) {
            ctx.beginPath();
            ctx.moveTo(sx, ground - 220 * spruce + k * 40 * spruce);
            ctx.lineTo(sx - (25 + k * 12) * spruce, ground - 140 * spruce + k * 40 * spruce);
            ctx.lineTo(sx + (25 + k * 12) * spruce, ground - 140 * spruce + k * 40 * spruce);
            ctx.closePath();
            ctx.fill();
          }
          line(ctx, [[sx, ground], [sx, ground - 30 * spruce]], '#5A3A1E', 6);
        }
      }
      f.hitRect(info('Почва', 'Soil', 'Создаётся живыми организмами: лишайники и отмершие растения превращают камень в плодородный слой.', 'Made by living things: lichens and dead plants turn rock into a fertile layer.'), 0, ground - 10, w, 30);
      const years = Math.round(ease(t, 0, 16) * 500);
      tag(ctx, `≈ ${years} ${L('лет', 'years')}`, 480, 30, { color: C.sky, size: 13 });
      return;
    }
    if (mode === 'carbon') {
      const nodes = {
        air: [480, 70] as [number, number],
        plant: [200, 300] as [number, number],
        animal: [460, 330] as [number, number],
        soil: [330, 470] as [number, number],
        fuel: [700, 470] as [number, number],
        factory: [760, 300] as [number, number],
        ocean: [880, 170] as [number, number],
      };
      const flows: { from: keyof typeof nodes; to: keyof typeof nodes; at: number; label: string; color: string }[] = [
        { from: 'air', to: 'plant', at: 2, label: L('фотосинтез', 'photosynthesis'), color: C.green },
        { from: 'plant', to: 'animal', at: 3.5, label: L('питание', 'feeding'), color: C.amber },
        { from: 'plant', to: 'air', at: 5, label: L('дыхание', 'respiration'), color: C.sky },
        { from: 'animal', to: 'air', at: 5, label: L('дыхание', 'respiration'), color: C.sky },
        { from: 'animal', to: 'soil', at: 6, label: L('отмирание', 'death'), color: C.dim },
        { from: 'soil', to: 'air', at: 6.5, label: L('разложение', 'decay'), color: C.violet },
        { from: 'soil', to: 'fuel', at: 7.5, label: L('миллионы лет', 'millions of years'), color: C.brown },
        { from: 'fuel', to: 'factory', at: 8, label: L('добыча', 'extraction'), color: C.brown },
        { from: 'factory', to: 'air', at: 8.5, label: L('сжигание', 'burning'), color: C.red },
        { from: 'air', to: 'ocean', at: 9.5, label: L('растворение', 'dissolving'), color: C.cyan },
      ];
      flows.forEach((fl) => {
        const a = ease(t, fl.at, fl.at + 0.8);
        if (a <= 0) return;
        const [x1, y1] = nodes[fl.from];
        const [x2, y2] = nodes[fl.to];
        const off = fl.from === 'plant' && fl.to === 'air' ? 30 : fl.from === 'animal' && fl.to === 'air' ? -10 : 0;
        ctx.globalAlpha = a;
        arrow(ctx, x1 + off, y1 + (y2 > y1 ? 40 : -40), x2 + off, y2 + (y2 > y1 ? -40 : 40), { color: alpha(fl.color, 0.8), width: 2 });
        for (let k = 0; k < 3; k++) {
          const s = (t * 0.4 + k / 3) % 1;
          circle(ctx, lerp(x1 + off, x2 + off, s), lerp(y1 + (y2 > y1 ? 40 : -40), y2 + (y2 > y1 ? -40 : 40), s), 3.5, fl.color);
        }
        tag(ctx, fl.label, (x1 + x2) / 2 + off + 20, (y1 + y2) / 2, { color: fl.color, size: 10.5 });
        ctx.globalAlpha = 1;
      });
      const names: Record<keyof typeof nodes, [string, string]> = {
        air: [L('CO₂ в атмосфере', 'CO₂ in the air'), C.sky],
        plant: [L('растения', 'plants'), C.green],
        animal: [L('животные', 'animals'), C.amber],
        soil: [L('почва, остатки', 'soil, remains'), C.brown],
        fuel: [L('уголь, нефть, газ', 'coal, oil, gas'), '#8C8F98'],
        factory: [L('транспорт, ТЭС', 'cars, power plants'), C.red],
        ocean: [L('океан', 'ocean'), C.cyan],
      };
      (Object.keys(nodes) as (keyof typeof nodes)[]).forEach((k) => {
        const [x, y] = nodes[k];
        rrect(ctx, x - 70, y - 26, 140, 52, 12);
        ctx.fillStyle = C.panel;
        ctx.fill();
        ctx.strokeStyle = names[k][1];
        ctx.lineWidth = 2;
        ctx.stroke();
        text(ctx, names[k][0], x, y, { size: 12.5 });
        f.hitRect(info(names[k][0], names[k][0], k === 'fuel' ? 'Ископаемое топливо — углерод древних растений, захороненный миллионы лет назад.' : k === 'ocean' ? 'Океан поглощает около четверти выбросов CO₂ — и закисляется.' : 'Резервуар углерода в круговороте веществ.', k === 'fuel' ? 'Fossil fuel is the carbon of ancient plants buried millions of years ago.' : k === 'ocean' ? 'The ocean absorbs about a quarter of CO₂ emissions and becomes more acidic.' : 'A carbon store in the cycle of matter.'), x - 70, y - 26, 140, 52);
      });
      return;
    }
    // tolerance curve with a fish
    const T = p.T;
    const act = (x: number) => Math.exp(-(((x - 20) / 7) ** 2));
    const a = act(T);
    const g = chart(ctx, {
      x: 420, y: 40, w: 510, h: 460, xMax: 40, yMax: 1.1, title: L('Жизнедеятельность', 'Activity'), xLabel: '°C',
      series: [{ color: C.green, fn: act, width: 3 }],
    });
    ctx.fillStyle = alpha(C.green, 0.12);
    ctx.fillRect(g.X(14), g.py, g.X(26) - g.X(14), g.ph);
    ctx.fillStyle = alpha(C.red, 0.1);
    ctx.fillRect(g.px, g.py, g.X(6) - g.px, g.ph);
    ctx.fillRect(g.X(34), g.py, g.px + g.pw - g.X(34), g.ph);
    text(ctx, L('оптимум', 'optimum'), g.X(20), g.py + 30, { size: 12, color: C.green });
    text(ctx, L('гибель', 'death'), g.X(3), g.py + 30, { size: 11, color: C.red });
    text(ctx, L('гибель', 'death'), g.X(37), g.py + 30, { size: 11, color: C.red });
    circle(ctx, g.X(T), g.Y(a), 7, C.amber, C.white, 2);
    // aquarium
    rrect(ctx, 30, 120, 360, 280, 12);
    ctx.fillStyle = mixColor('#1B4F8A', '#8A3B1B', T / 40);
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;
    const speed = 0.3 + a * 2.5;
    const fx = 210 + Math.sin(t * speed) * 120 * (0.3 + a);
    const fy = 260 + Math.sin(t * speed * 1.7) * 40 * a + (a < 0.1 ? 90 : 0);
    const dir = Math.cos(t * speed) > 0 ? 1 : -1;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(dir, a < 0.1 ? -1 : 1);
    ctx.fillStyle = '#F5A524';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 16, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(-52, -16);
    ctx.lineTo(-52, 16);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 18, -4, 3.5, '#111214');
    ctx.restore();
    f.hit(info('Рыба', 'Fish', 'Холоднокровное животное: температура воды напрямую влияет на скорость обмена веществ.', 'A cold-blooded animal: water temperature directly sets its metabolic rate.'), fx, fy, 30);
    tag(ctx, a > 0.6 ? L('оптимум — активна', 'optimum: active') : a > 0.1 ? L('угнетение', 'stressed') : L('за пределом выносливости', 'beyond tolerance'), 210, 90, { color: a > 0.6 ? C.green : a > 0.1 ? C.amber : C.red });
  },
};
