import { alpha, backdrop, ball, C, circle, clamp, ease, info, lerp, line, rrect, SimDef, spectrumColor, tag, TAU, text, tx } from '../kit';

/* ---------- straight-line propagation: shadows and eclipses ---------- */

export const shadows: SimDef = {
  id: 'shadows',
  title: tx('Прямолинейное распространение света', 'Light travels in straight lines'),
  modes: [
    { id: 'point', label: tx('Точечный источник', 'Point source') },
    { id: 'wide', label: tx('Протяжённый источник', 'Extended source') },
    { id: 'eclipse', label: tx('Затмения', 'Eclipses') },
  ],
  duration: 12,
  params: (m) => (m === 'eclipse' ? [] : [{ id: 'd', label: tx('Расстояние до предмета', 'Distance to the object'), min: 0.3, max: 0.8, step: 0.05, value: 0.5, digits: 2 }]),
  stages: (m) =>
    m === 'point'
      ? [
          { t: 0, label: tx('Лучи', 'Rays'), text: tx('В однородной среде свет идёт по прямым — лучам.', 'In a uniform medium light travels in straight lines, called rays.') },
          { t: 4, label: tx('Тень', 'Shadow'), text: tx('Непрозрачный предмет перекрывает лучи — за ним резкая тень. Её форма повторяет контур предмета.', 'An opaque object blocks the rays, leaving a sharp shadow behind it that copies the object’s outline.') },
        ]
      : m === 'wide'
        ? [
            { t: 0, label: tx('Большая лампа', 'A big lamp'), text: tx('Каждая точка широкого источника даёт свою тень.', 'Every point of a wide source casts its own shadow.') },
            { t: 4, label: tx('Полутень', 'Penumbra'), text: tx('Куда не попадает свет ни от одной точки — тень; куда от части точек — полутень.', 'Where no point of the source reaches is the umbra; where only some points reach is the penumbra.') },
          ]
        : [
            { t: 0, label: tx('Лунное затмение', 'Lunar eclipse'), text: tx('Луна заходит в тень Земли и становится медно-красной: её освещает только свет, преломлённый атмосферой Земли.', 'The Moon enters Earth’s shadow and turns coppery red, lit only by light bent through Earth’s atmosphere.') },
            { t: 6, label: tx('Солнечное затмение', 'Solar eclipse'), text: tx('Луна оказывается между Солнцем и Землёй. Где на Землю падает тень Луны — полное затмение, в полутени — частное.', 'The Moon passes between the Sun and Earth. Inside the Moon’s shadow the eclipse is total; in the penumbra it is partial.') },
          ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode !== 'eclipse') {
      const sx = 120;
      const sy = 270;
      const half = mode === 'wide' ? 60 : 3;
      const ox = lerp(sx, 760, p.d);
      const oy = 270;
      const r = 48;
      const sc = 820;
      // light source
      if (mode === 'wide') {
        rrect(ctx, sx - 12, sy - half, 24, half * 2, 10);
        ctx.fillStyle = '#FFE58F';
        ctx.shadowColor = C.yellow;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else ball(ctx, sx, sy, 12, '#FFE58F', 1.5);
      f.hit(info(mode === 'wide' ? 'Протяжённый источник' : 'Точечный источник', mode === 'wide' ? 'Extended source' : 'Point source', mode === 'wide' ? 'Размеры источника сравнимы с расстоянием до предмета — тени размытые.' : 'Размеры малы по сравнению с расстояниями — тень резкая.', mode === 'wide' ? 'The source is large compared with the distances, so shadows are soft.' : 'The source is tiny compared with the distances, so the shadow is sharp.'), sx, sy, 20);
      // screen with lit area and shadows
      const proj = (y0: number, yy: number) => y0 + ((yy - y0) * (sc - sx)) / (ox - sx);
      const umbraTop = proj(sy + half, oy - r);
      const umbraBot = proj(sy - half, oy + r);
      const penTop = proj(sy - half, oy - r);
      const penBot = proj(sy + half, oy + r);
      const show = ease(t, 0, 3);
      // rays
      ctx.globalAlpha = show;
      const ends = mode === 'wide' ? [sy - half, sy + half] : [sy];
      ends.forEach((ey) => {
        [oy - r, oy + r].forEach((yy) => line(ctx, [[sx, ey], [sc, proj(ey, yy)]], alpha('#FFE58F', 0.5), 1.5));
        for (let k = -4; k <= 4; k++) {
          const yy = oy + k * 40;
          if (Math.abs(yy - oy) <= r) continue;
          line(ctx, [[sx, ey], [sc, proj(ey, yy)]], alpha('#FFE58F', 0.18), 1);
        }
      });
      ctx.globalAlpha = 1;
      // screen
      ctx.fillStyle = alpha('#FFE58F', 0.85);
      ctx.fillRect(sc, 40, 14, 460);
      const shade = ease(t, 3, 5);
      if (mode === 'wide' && umbraTop < umbraBot) {
        ctx.fillStyle = alpha('#555044', shade);
        ctx.fillRect(sc, Math.min(penTop, umbraTop), 14, Math.abs(penBot - penTop));
        ctx.fillStyle = alpha('#111214', shade);
        ctx.fillRect(sc, umbraTop, 14, umbraBot - umbraTop);
        if (shade > 0.5) {
          tag(ctx, L('полутень', 'penumbra'), sc - 16, Math.min(penTop, umbraTop) + 10, { color: C.amber, align: 'right' });
          tag(ctx, L('тень', 'umbra'), sc - 16, (umbraTop + umbraBot) / 2, { color: C.text, align: 'right' });
        }
      } else if (mode === 'wide') {
        ctx.fillStyle = alpha('#555044', shade);
        ctx.fillRect(sc, Math.min(penTop, penBot), 14, Math.abs(penBot - penTop));
        if (shade > 0.5) tag(ctx, L('только полутень', 'penumbra only'), sc - 16, oy, { color: C.amber, align: 'right' });
      } else {
        ctx.fillStyle = alpha('#111214', shade);
        ctx.fillRect(sc, proj(sy, oy - r), 14, proj(sy, oy + r) - proj(sy, oy - r));
        if (shade > 0.5) tag(ctx, L('тень', 'shadow'), sc - 16, oy, { color: C.text, align: 'right' });
      }
      f.hitRect(info('Экран', 'Screen', 'Размер тени зависит от расстояний: чем ближе предмет к источнику, тем больше тень.', 'The shadow’s size depends on the distances: the closer the object to the source, the bigger the shadow.'), sc, 40, 14, 460);
      ball(ctx, ox, oy, r, '#5A5D66');
      f.hit(info('Непрозрачный шар', 'Opaque ball', 'Не пропускает свет. Двигай ползунок — и тень изменится.', 'Lets no light through. Move the slider and the shadow changes.'), ox, oy, r);
      return;
    }
    // eclipses: Sun – Earth – Moon geometry (not to scale)
    const solar = t >= 6;
    const k = solar ? ease(t, 6, 11) : ease(t, 0, 5);
    const sunX = 90;
    const sunY = 270;
    const g = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150);
    g.addColorStop(0, '#FFF3B0');
    g.addColorStop(0.4, '#F5A524');
    g.addColorStop(1, 'rgba(245,165,36,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 150, 0, TAU);
    ctx.fill();
    ball(ctx, sunX, sunY, 70, '#F5A524');
    f.hit(info('Солнце', 'Sun', 'В 400 раз больше Луны и в 400 раз дальше — поэтому на небе они почти одного размера.', '400 times bigger than the Moon and 400 times farther away, so in the sky they look almost the same size.'), sunX, sunY, 70);
    if (!solar) {
      const ex = 560;
      ball(ctx, ex, 270, 60, '#2F6FB5');
      // Earth's shadow cone
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.moveTo(ex, 210);
      ctx.lineTo(930, 250);
      ctx.lineTo(930, 290);
      ctx.lineTo(ex, 330);
      ctx.fill();
      ctx.fillStyle = 'rgba(40,30,20,0.35)';
      ctx.beginPath();
      ctx.moveTo(ex, 210);
      ctx.lineTo(930, 170);
      ctx.lineTo(930, 370);
      ctx.lineTo(ex, 330);
      ctx.fill();
      f.hit(info('Земля', 'Earth', 'Отбрасывает в космос конус тени длиной ~1,4 млн км.', 'Casts a cone of shadow about 1.4 million km long into space.'), ex, 270, 60);
      const my = lerp(120, 420, k);
      const inShadow = clamp(1 - Math.abs(my - 270) / 40);
      ball(ctx, 820, my, 22, inShadow > 0.3 ? '#A0482A' : '#C9CDD3');
      f.hit(info('Луна', 'Moon', 'Светит отражённым солнечным светом. В тени Земли красная из-за света, преломлённого атмосферой.', 'Shines by reflected sunlight. In Earth’s shadow it turns red from light bent through the atmosphere.'), 820, my, 24);
      tag(ctx, L('Солнце — Земля — Луна', 'Sun – Earth – Moon'), 480, 40, { color: C.sky });
      return;
    }
    const mx = 520;
    const my = lerp(150, 390, k);
    ball(ctx, mx, my, 22, '#8C8F98');
    // Moon shadow cone toward Earth
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.moveTo(mx, my - 22);
    ctx.lineTo(820, my + (270 - my) * 0.3 - 4);
    ctx.lineTo(820, my + (270 - my) * 0.3 + 4);
    ctx.lineTo(mx, my + 22);
    ctx.fill();
    f.hit(info('Луна', 'Moon', 'Закрывает Солнце для той части Земли, куда падает её тень (полоса шириной до ~270 км).', 'Hides the Sun from the part of Earth its shadow falls on, a strip up to ~270 km wide.'), mx, my, 24);
    ball(ctx, 840, 270, 70, '#2F6FB5');
    const spot = my + (270 - my) * 0.3;
    if (Math.abs(spot - 270) < 66) circle(ctx, 772 + Math.abs(spot - 270) * 0.3, spot, 7, 'rgba(0,0,0,0.85)');
    f.hit(info('Земля', 'Earth', 'Из пятна тени видно полное затмение: днём темнеет и видна солнечная корона.', 'From inside the shadow spot you see a total eclipse: it goes dark by day and the corona appears.'), 840, 270, 70);
    tag(ctx, L('Солнце — Луна — Земля', 'Sun – Moon – Earth'), 480, 40, { color: C.sky });
  },
};

/* ---------- wave optics ---------- */

export const waveOptics: SimDef = {
  id: 'wave_optics',
  title: tx('Волновая оптика', 'Wave optics'),
  modes: [
    { id: 'dispersion', label: tx('Дисперсия', 'Dispersion') },
    { id: 'interference', label: tx('Интерференция', 'Interference') },
    { id: 'grating', label: tx('Решётка', 'Grating') },
    { id: 'polar', label: tx('Поляризация', 'Polarisation') },
    { id: 'spectra', label: tx('Спектры', 'Spectra') },
  ],
  duration: 12,
  params: (m) =>
    m === 'interference'
      ? [
          { id: 'nm', label: tx('Длина волны', 'Wavelength'), min: 400, max: 700, step: 10, value: 600, unit: 'нм' },
          { id: 'd', label: tx('Расстояние между щелями', 'Slit spacing'), min: 0.5, max: 2, step: 0.1, value: 1, unit: '×', digits: 1 },
        ]
      : m === 'grating'
        ? [{ id: 'period', label: tx('Период решётки', 'Grating period'), min: 1, max: 4, step: 0.25, value: 2, unit: 'мкм', digits: 2 }]
        : m === 'polar'
          ? [{ id: 'angle', label: tx('Угол анализатора', 'Analyser angle'), min: 0, max: 90, step: 5, value: 30, unit: '°' }]
          : m === 'spectra'
            ? [{ id: 'el', label: tx('Газ: 0 — водород, 1 — натрий, 2 — неон', 'Gas: 0 hydrogen, 1 sodium, 2 neon'), min: 0, max: 2, step: 1, value: 0 }]
            : [],
  stages: (m) =>
    m === 'dispersion'
      ? [
          { t: 0, label: tx('Белый луч', 'White beam'), text: tx('Белый свет — смесь всех цветов.', 'White light is a mix of all colours.') },
          { t: 3, label: tx('Призма', 'Prism'), text: tx('Показатель преломления стекла зависит от длины волны: фиолетовый преломляется сильнее красного.', 'Glass’s refractive index depends on wavelength: violet bends more than red.') },
          { t: 6, label: tx('Спектр', 'Spectrum'), text: tx('Получается радуга: КОЖЗГСФ. Ньютон показал, что вторая призма снова собирает цвета в белый.', 'Out comes a rainbow, ROYGBIV. Newton showed a second prism can merge the colours back into white.') },
        ]
      : m === 'interference'
        ? [
            { t: 0, label: tx('Две щели', 'Two slits'), text: tx('Свет из одной лампы проходит через две узкие щели — получаются два когерентных источника.', 'Light from one lamp passes two narrow slits, giving two coherent sources.') },
            { t: 3, label: tx('Наложение', 'Overlap'), text: tx('Где гребень встречает гребень — усиление (светлая полоса); где гребень встречает впадину — гашение (тёмная).', 'Crest on crest adds up (bright fringe); crest on trough cancels (dark fringe).') },
            { t: 7, label: tx('Условие', 'Condition'), text: tx('Максимум при разности хода Δ = kλ, минимум при Δ = (2k+1)λ/2. Это опыт Юнга — доказательство волновой природы света.', 'Bright where the path difference Δ = kλ, dark where Δ = (2k+1)λ/2. Young’s experiment proved light is a wave.') },
          ]
        : m === 'grating'
          ? [
              { t: 0, label: tx('Решётка', 'Grating'), text: tx('Тысячи щелей на миллиметр. Белый свет после решётки раскладывается в спектры.', 'Thousands of slits per millimetre. White light spreads into spectra after the grating.') },
              { t: 4, label: tx('Формула', 'Formula'), text: tx('d·sin φ = kλ: чем больше длина волны, тем сильнее отклонение — красный дальше фиолетового (наоборот, чем у призмы).', 'd·sin φ = kλ: longer waves bend more, so red lands farther than violet (the reverse of a prism).') },
            ]
          : m === 'polar'
            ? [
                { t: 0, label: tx('Естественный свет', 'Natural light'), text: tx('Колебания вектора E идут во всех направлениях поперёк луча.', 'The E-vector vibrates in every direction across the beam.') },
                { t: 3, label: tx('Поляризатор', 'Polariser'), text: tx('Пропускает только колебания в одной плоскости — свет стал поляризованным, яркость уменьшилась вдвое.', 'Passes vibrations in one plane only: the light is polarised and half as bright.') },
                { t: 6, label: tx('Анализатор', 'Analyser'), text: tx('Второй фильтр пропускает I = I₀cos²φ (закон Малюса). При 90° — темнота. Это доказывает: свет — поперечная волна.', 'A second filter passes I = I₀cos²φ (Malus’s law). At 90° it goes dark, proving light is a transverse wave.') },
              ]
            : [
                { t: 0, label: tx('Сплошной спектр', 'Continuous spectrum'), text: tx('Раскалённые твёрдые тела и жидкости дают сплошную радугу.', 'Hot solids and liquids give an unbroken rainbow.') },
                { t: 4, label: tx('Линейчатый', 'Line spectrum'), text: tx('Разреженный газ светит только определёнными цветами — у каждого элемента свой «штрихкод».', 'A thin glowing gas emits only certain colours: each element has its own barcode.') },
                { t: 8, label: tx('Поглощение', 'Absorption'), text: tx('Холодный газ поглощает те же линии. По тёмным линиям в спектре Солнца узнали его состав (и открыли гелий).', 'A cool gas absorbs the same lines. Dark lines in sunlight revealed the Sun’s make-up, and helium was discovered there.') },
              ],
  draw(f) {
    const { ctx, w, h, t, p, mode, L } = f;
    backdrop(ctx, w, h);
    if (mode === 'dispersion') {
      const px = 430;
      const py = 300;
      ctx.beginPath();
      ctx.moveTo(px, py - 140);
      ctx.lineTo(px - 120, py + 80);
      ctx.lineTo(px + 120, py + 80);
      ctx.closePath();
      ctx.fillStyle = alpha('#BFD8FF', 0.15);
      ctx.fill();
      ctx.strokeStyle = alpha('#BFD8FF', 0.6);
      ctx.lineWidth = 2;
      ctx.stroke();
      f.hit(info('Стеклянная призма', 'Glass prism', 'Преломляет свет дважды: на входе и на выходе. Разные цвета — под разными углами.', 'Bends light twice, going in and coming out, by a different angle for each colour.'), px, py, 60);
      const beam = ease(t, 0, 2.5);
      const entry: [number, number] = [px - 62, py - 28];
      line(ctx, [[60, 330], [lerp(60, entry[0], beam), lerp(330, entry[1], beam)]], '#FFFFFF', 4);
      if (t > 2.5) {
        const k = ease(t, 2.5, 4.5);
        for (let i = 0; i < 7; i++) {
          const nm = 700 - i * 50;
          const exit: [number, number] = [px + 50 + i * 3, py - 30 + i * 8];
          line(ctx, [entry, [lerp(entry[0], exit[0], k), lerp(entry[1], exit[1], k)]], spectrumColor(nm), 2);
          if (t > 4.5) {
            const k2 = ease(t, 4.5, 7);
            const end: [number, number] = [880, 210 + i * 34];
            line(ctx, [exit, [lerp(exit[0], end[0], k2), lerp(exit[1], end[1], k2)]], spectrumColor(nm), 3);
          }
        }
      }
      if (t > 7) {
        const names = L('К О Ж З Г С Ф', 'R O Y G B I V').split(' ');
        names.forEach((n, i) => text(ctx, n, 905, 210 + i * 34, { size: 13, color: spectrumColor(700 - i * 50) }));
        f.hitRect(info('Спектр', 'Spectrum', 'Красный (≈700 нм) отклоняется меньше всего, фиолетовый (≈400 нм) — больше всего.', 'Red (≈700 nm) bends the least and violet (≈400 nm) the most.'), 870, 190, 50, 240);
      }
      return;
    }
    if (mode === 'interference') {
      const sx = 230;
      const s1 = 270 - 40 * p.d;
      const s2 = 270 + 40 * p.d;
      const lam = 0.06 * p.nm; // px
      const col = spectrumColor(p.nm);
      // incoming plane wave
      for (let x = 40; x < sx; x += lam) {
        const xx = x + ((t * 40) % lam);
        if (xx < sx) line(ctx, [[xx, 120], [xx, 420]], alpha(col, 0.35), 2);
      }
      line(ctx, [[sx, 40], [sx, s1 - 6]], '#8C8F98', 6);
      line(ctx, [[sx, s1 + 6], [sx, s2 - 6]], '#8C8F98', 6);
      line(ctx, [[sx, s2 + 6], [sx, 500]], '#8C8F98', 6);
      f.hit(info('Две щели', 'Two slits', 'Каждая щель — новый источник круговых волн (принцип Гюйгенса), колеблющихся в одной фазе.', 'Each slit becomes a new source of circular waves (Huygens’ principle), in step with the other.'), sx, 270, 20);
      // circular wavefronts
      const spread = ease(t, 1, 5) * 640;
      [s1, s2].forEach((sy) => {
        for (let r = ((t * 40) % lam); r < spread; r += lam) {
          ctx.strokeStyle = alpha(col, 0.28 * (1 - r / 700));
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, r, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        }
      });
      // screen intensity
      const scx = 880;
      if (spread > scx - sx) {
        const vis = ease(t, 5, 6.5);
        for (let y = 40; y < 500; y += 2) {
          const d1 = Math.hypot(scx - sx, y - s1);
          const d2 = Math.hypot(scx - sx, y - s2);
          const I = Math.cos((Math.PI * (d1 - d2)) / lam) ** 2;
          ctx.fillStyle = col.replace('rgb(', 'rgba(').replace(')', `,${(I * vis).toFixed(3)})`);
          ctx.fillRect(scx, y, 30, 2);
          if (y % 4 === 0) {
            const bx = scx - 10 - I * 60 * vis;
            ctx.fillStyle = alpha('#FFFFFF', 0.5 * vis);
            ctx.fillRect(bx, y, 1.5, 2);
          }
        }
        f.hitRect(info('Интерференционная картина', 'Interference pattern', 'Чередование светлых и тёмных полос. Ширина полосы ∝ λL/d — больше для красного света и близких щелей.', 'Alternating bright and dark fringes. Fringe width ∝ λL/d, so wider for red light and closer slits.'), scx, 40, 30, 460);
      }
      return;
    }
    if (mode === 'grating') {
      const gx = 300;
      line(ctx, [[60, 270], [gx, 270]], '#FFFFFF', 4);
      for (let y = 150; y <= 390; y += 6) line(ctx, [[gx, y], [gx, y + 3]], '#B5B8C0', 3);
      f.hit(info('Дифракционная решётка', 'Diffraction grating', `Период d = ${p.period} мкм (${Math.round(1000 / p.period)} штрихов на мм).`, `Period d = ${p.period} µm (${Math.round(1000 / p.period)} lines per mm).`), gx, 270, 30);
      const grow = ease(t, 1, 4);
      const L0 = 560;
      line(ctx, [[gx, 270], [gx + L0 * grow, 270]], '#FFFFFF', 3);
      [1, 2].forEach((k) => {
        for (let nm = 400; nm <= 700; nm += 25) {
          const s = (k * nm * 1e-3) / p.period;
          if (s >= 1) continue;
          const phi = Math.asin(s);
          [-1, 1].forEach((sg) => {
            const ex = gx + L0 * grow;
            const ey = 270 + sg * Math.tan(phi) * L0 * grow;
            if (Math.abs(ey - 270) > 250) return;
            line(ctx, [[gx, 270], [ex, ey]], alpha(spectrumColor(nm), 0.55), 1.5);
            circle(ctx, ex, ey, 3, spectrumColor(nm));
          });
        }
      });
      if (grow > 0.9) {
        tag(ctx, L('k = 0 (белый)', 'k = 0 (white)'), gx + L0 + 30, 270, { color: C.text, align: 'left' });
        tag(ctx, 'k = 1', gx + L0 + 30, 270 - Math.tan(Math.asin(0.55 / p.period)) * L0, { color: C.sky, align: 'left' });
      }
      return;
    }
    if (mode === 'polar') {
      const y0 = 270;
      const p1 = 360;
      const p2 = 620;
      const phi = (p.angle * Math.PI) / 180;
      const arrive = ease(t, 0, 2);
      // unpolarised light: arrows in many directions
      for (let x = 60; x < p1 - 20; x += 50) {
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI + t;
          line(ctx, [[x - Math.cos(a) * 26, y0 - Math.sin(a) * 26], [x + Math.cos(a) * 26, y0 + Math.sin(a) * 26]], alpha(C.yellow, 0.5 * arrive), 2);
        }
      }
      const polariser = (x: number, ang: number, name: string) => {
        ctx.save();
        ctx.translate(x, y0);
        rrect(ctx, -12, -110, 24, 220, 6);
        ctx.fillStyle = alpha('#8FA4FF', 0.15);
        ctx.fill();
        ctx.strokeStyle = alpha('#8FA4FF', 0.7);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.rotate(ang);
        for (let k = -4; k <= 4; k++) line(ctx, [[k * 5, -90], [k * 5, 90]], alpha('#8FA4FF', 0.25), 1);
        line(ctx, [[0, -100], [0, 100]], C.sky, 2.5);
        ctx.restore();
        tag(ctx, name, x, y0 + 140, { color: C.sky });
      };
      polariser(p1, 0, L('поляризатор', 'polariser'));
      polariser(p2, phi, L('анализатор', 'analyser'));
      f.hit(info('Поляризатор', 'Polariser', 'Пропускает колебания E только вдоль своей оси (синяя черта).', 'Passes E-vibrations only along its axis (the blue line).'), p1, y0, 40);
      f.hit(info('Анализатор', 'Analyser', `Ось повёрнута на ${p.angle}°. Проходит cos²φ = ${(Math.cos(phi) ** 2 * 100).toFixed(0)}% света.`, `Axis turned by ${p.angle}°. It passes cos²φ = ${(Math.cos(phi) ** 2 * 100).toFixed(0)}% of the light.`), p2, y0, 40);
      const mid = ease(t, 2, 3.5);
      for (let x = p1 + 50; x < p2 - 20; x += 50) {
        const s = Math.sin(t * 6 + x * 0.05);
        line(ctx, [[x, y0], [x, y0 - s * 40 * mid]], alpha(C.yellow, 0.8), 3);
      }
      const out = ease(t, 5, 6.5);
      const I = Math.cos(phi) ** 2;
      for (let x = p2 + 50; x < 900; x += 50) {
        const s = Math.sin(t * 6 + x * 0.05) * Math.cos(phi) * 40 * out;
        line(ctx, [[x, y0], [x + Math.sin(phi) * s, y0 - Math.cos(phi) * s]], alpha(C.yellow, 0.8), 3);
      }
      const g = ctx.createRadialGradient(910, y0, 2, 910, y0, 50);
      g.addColorStop(0, alpha(C.yellow, 0.8 * I * out));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(910, y0, 50, 0, TAU);
      ctx.fill();
      tag(ctx, `I = I₀·cos²${p.angle}° = ${(I * 100).toFixed(0)}%`, 760, 80, { color: C.yellow, size: 13 });
      return;
    }
    // spectra
    const LINES: Record<number, number[]> = { 0: [410, 434, 486, 656], 1: [589, 589.6], 2: [585, 588, 594, 597, 603, 607, 609, 614, 616, 621, 626, 633, 638, 640, 650, 659, 667, 671, 692, 703] };
    const lines = LINES[p.el] ?? LINES[0];
    const name = [L('водород', 'hydrogen'), L('натрий', 'sodium'), L('неон', 'neon')][p.el];
    const band = (y: number, kind: 'cont' | 'emit' | 'abs', label: string, vis: number) => {
      if (vis <= 0) return;
      ctx.globalAlpha = vis;
      const x0 = 120;
      const x1 = 860;
      const X = (nm: number) => lerp(x0, x1, (nm - 380) / 400);
      for (let nm = 380; nm < 780; nm += 1) {
        ctx.fillStyle = kind === 'emit' ? '#0B0C0E' : spectrumColor(nm);
        ctx.fillRect(X(nm), y, X(nm + 1) - X(nm) + 0.5, 70);
      }
      if (kind !== 'cont') lines.forEach((nm) => {
        ctx.fillStyle = kind === 'emit' ? spectrumColor(nm) : '#0B0C0E';
        ctx.fillRect(X(nm) - 1.5, y, 3, 70);
        if (kind === 'emit') {
          ctx.shadowColor = spectrumColor(nm);
          ctx.shadowBlur = 10;
          ctx.fillRect(X(nm) - 1, y, 2, 70);
          ctx.shadowBlur = 0;
        }
      });
      rrect(ctx, x0, y, x1 - x0, 70, 4);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      tag(ctx, label, x0, y - 16, { color: C.text, align: 'left' });
      f.hitRect(
        kind === 'cont'
          ? info('Сплошной спектр', 'Continuous spectrum', 'Даёт раскалённое тело: нить лампы, Солнце (без учёта линий поглощения).', 'From a hot dense body: a lamp filament, the Sun (ignoring absorption lines).')
          : kind === 'emit'
            ? info('Спектр испускания', 'Emission spectrum', 'Атомы излучают фотоны строго определённой энергии — при переходе электрона на нижний уровень (постулаты Бора).', 'Atoms emit photons of exact energies as electrons drop to lower levels (Bohr’s postulates).')
            : info('Спектр поглощения', 'Absorption spectrum', 'Холодный газ поглощает те же длины волн, которые сам испускал бы в горячем состоянии.', 'A cool gas absorbs exactly the wavelengths it would emit when hot.'),
        x0, y, x1 - x0, 70,
      );
      ctx.globalAlpha = 1;
    };
    band(80, 'cont', L('сплошной (раскалённая нить)', 'continuous (hot filament)'), ease(t, 0, 1));
    band(230, 'emit', `${L('испускания', 'emission')}: ${name}`, ease(t, 4, 5));
    band(380, 'abs', `${L('поглощения', 'absorption')}: ${name}`, ease(t, 8, 9));
    text(ctx, '400', 120 + 740 * 0.05, 470, { size: 11, color: C.dim });
    text(ctx, '700 ' + L('нм', 'nm'), 120 + 740 * 0.8, 470, { size: 11, color: C.dim });
  },
};
