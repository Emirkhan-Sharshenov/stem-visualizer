import React, { useEffect, useRef, useState } from 'react';
import { Formula } from './Formula';
import { InfoCard, Legend, Metric, Panel, PlayControls, Segmented, Slider, Tip } from './lab/LabUI';

interface MomentPhotosynthesisProps {
  lang: 'ru' | 'en';
}

type View = 'leaf' | 'chloroplast';
type Kind = 'photon' | 'co2' | 'o2' | 'h2o' | 'glucose' | 'atp' | 'nadph';
interface Info { title: { ru: string; en: string }; text: { ru: string; en: string } }

const C = {
  photon: '#F5C451',
  co2: '#A0A3AB',
  o2: '#FF8F8F',
  h2o: '#6FB1E8',
  glucose: '#F5A524',
  atp: '#F7D78A',
  nadph: '#B79CFF',
  leaf: '#2E8B57',
  leafLight: '#4CB07A',
  stroma: '#1F5A3A',
  thylakoid: '#58C47F',
};

const INFO: Record<string, Info> = {
  sun: { title: { ru: 'Свет', en: 'Light' }, text: { ru: 'Источник энергии. Хлорофилл поглощает красный и синий свет, а зелёный отражает — поэтому листья зелёные.', en: 'The energy source. Chlorophyll absorbs red and blue light and reflects green, which is why leaves look green.' } },
  photon: { title: { ru: 'Фотон', en: 'Photon' }, text: { ru: 'Порция света. Попадая в хлорофилл, выбивает электрон — с этого начинается световая фаза.', en: 'A packet of light. Absorbed by chlorophyll, it kicks out an electron and starts the light reactions.' } },
  leaf: { title: { ru: 'Лист', en: 'Leaf' }, text: { ru: 'В каждой клетке мякоти листа десятки хлоропластов. Лист плоский и широкий, чтобы ловить как можно больше света.', en: 'Every cell inside the leaf holds dozens of chloroplasts. Leaves are flat and wide to catch as much light as possible.' } },
  stoma: { title: { ru: 'Устьице', en: 'Stoma' }, text: { ru: 'Пора на нижней стороне листа. Через неё входит CO₂ и выходят O₂ и пар. В жару устьица закрываются, и фотосинтез замедляется.', en: 'A pore under the leaf. CO₂ comes in, O₂ and water vapour go out. In heat they close and photosynthesis slows.' } },
  co2: { title: { ru: 'Углекислый газ CO₂', en: 'Carbon dioxide CO₂' }, text: { ru: 'Источник углерода. Из шести молекул CO₂ растение собирает одну молекулу глюкозы.', en: 'The carbon source. Six CO₂ molecules become one glucose molecule.' } },
  o2: { title: { ru: 'Кислород O₂', en: 'Oxygen O₂' }, text: { ru: 'Побочный продукт: он получается из воды, а не из CO₂. Этим кислородом дышим мы.', en: 'A by-product made from water, not from CO₂. It’s the oxygen we breathe.' } },
  h2o: { title: { ru: 'Вода H₂O', en: 'Water H₂O' }, text: { ru: 'Поднимается от корней по сосудам. В тилакоидах свет расщепляет её на кислород, протоны и электроны.', en: 'Rises from the roots. In the thylakoids, light splits it into oxygen, protons and electrons.' } },
  glucose: { title: { ru: 'Глюкоза C₆H₁₂O₆', en: 'Glucose C₆H₁₂O₆' }, text: { ru: 'Сахар — запас энергии. Растение строит из неё крахмал и целлюлозу и отправляет по флоэме в корни и плоды.', en: 'Sugar, stored energy. The plant turns it into starch and cellulose and ships it through the phloem.' } },
  vein: { title: { ru: 'Жилки (ксилема и флоэма)', en: 'Veins (xylem and phloem)' }, text: { ru: 'По ксилеме вверх идёт вода, по флоэме вниз — сахар.', en: 'Xylem carries water up; phloem carries sugar down.' } },
  membrane: { title: { ru: 'Оболочка хлоропласта', en: 'Chloroplast envelope' }, text: { ru: 'Две мембраны, как у митохондрии. Хлоропласты когда-то тоже были свободными бактериями.', en: 'Two membranes, like a mitochondrion. Chloroplasts were once free-living bacteria too.' } },
  thylakoid: { title: { ru: 'Граны тилакоидов', en: 'Thylakoid grana' }, text: { ru: 'Стопки мембранных «монеток» с хлорофиллом. Здесь идёт световая фаза: свет расщепляет воду и заряжает ATP и NADPH.', en: 'Stacks of membrane coins full of chlorophyll. The light reactions happen here: light splits water and charges ATP and NADPH.' } },
  stroma: { title: { ru: 'Строма', en: 'Stroma' }, text: { ru: 'Жидкость вокруг тилакоидов. В ней идёт темновая фаза — цикл Кальвина.', en: 'The fluid around the thylakoids, where the Calvin cycle runs.' } },
  calvin: { title: { ru: 'Цикл Кальвина', en: 'Calvin cycle' }, text: { ru: 'Темновая фаза: фермент Рубиско цепляет CO₂, а энергия ATP и NADPH превращает его в сахар. Свет здесь не нужен напрямую, но без ATP и NADPH цикл встанет.', en: 'The dark reactions: the enzyme Rubisco grabs CO₂, and ATP and NADPH energy turns it into sugar. No light is used directly, but without ATP and NADPH the cycle stops.' } },
  atp: { title: { ru: 'ATP', en: 'ATP' }, text: { ru: 'Энергетическая «батарейка», заряженная светом в тилакоидах. Разряжается в цикле Кальвина.', en: 'An energy battery charged by light in the thylakoids and spent in the Calvin cycle.' } },
  nadph: { title: { ru: 'NADPH', en: 'NADPH' }, text: { ru: 'Переносчик электронов и водорода. Отдаёт их в цикле Кальвина, чтобы восстановить CO₂ до сахара.', en: 'Carries electrons and hydrogen to the Calvin cycle to reduce CO₂ into sugar.' } },
};

interface Particle {
  id: number;
  kind: Kind;
  t: number;
  dur: number;
  path: (t: number) => [number, number];
}

// Points along the leaf's lower edge, where the stomata sit
const bez = (p0: number[], p1: number[], p2: number[], p3: number[], t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const LEAF_BOTTOM = (t: number) => bez([680, 110], [640, 250], [480, 340], [300, 300], t);
const LEAF_MID = (t: number) => bez([300, 300], [420, 240], [560, 170], [680, 110], t);
const STOMATA = [0.35, 0.55, 0.75].map((t) => LEAF_BOTTOM(t));

const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ease = (t: number) => t * t * (3 - 2 * t);

export function photosynthesisRate(light: number, co2: number, temp: number) {
  const lf = light / (light + 25) / (100 / 125);
  const cf = co2 / (co2 + 20) / (100 / 120);
  let tf = Math.exp(-(((temp - 25) / 10) ** 2));
  if (temp > 38) tf *= Math.max(0, 1 - (temp - 38) / 8);
  const rate = Math.min(lf, cf) * tf;
  const limiting: 'light' | 'co2' | 'temp' = tf < Math.min(lf, cf) ? 'temp' : lf <= cf ? 'light' : 'co2';
  return { rate, lf, cf, tf, limiting };
}

export const MomentPhotosynthesis: React.FC<MomentPhotosynthesisProps> = ({ lang }) => {
  const [view, setView] = useState<View>('leaf');
  const [light, setLight] = useState(70);
  const [co2, setCo2] = useState(40);
  const [temp, setTemp] = useState(24);
  const [running, setRunning] = useState(true);
  const [selected, setSelected] = useState<Info | null>(null);
  const [, setFrame] = useState(0);
  const [glucose, setGlucose] = useState(0);
  const [cycleAngle, setCycleAngle] = useState(0);

  const particles = useRef<Particle[]>([]);
  const nextId = useRef(0);
  const spawnAcc = useRef<Record<Kind, number>>({ photon: 0, co2: 0, o2: 0, h2o: 0, glucose: 0, atp: 0, nadph: 0 });
  const sim = useRef({ light, co2, temp, running, view });
  sim.current = { light, co2, temp, running, view };

  const { rate, limiting } = photosynthesisRate(light, co2, temp);

  useEffect(() => {
    particles.current = [];
  }, [view]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const rnd = Math.random;

    const spawn = (kind: Kind, path: Particle['path'], dur: number) => {
      particles.current.push({ id: nextId.current++, kind, t: 0, dur, path });
    };

    const leafPaths: Partial<Record<Kind, () => Particle['path']>> = {
      photon: () => {
        const target = LEAF_MID(0.15 + rnd() * 0.8);
        const to: [number, number] = [target[0] + (rnd() - 0.5) * 40, target[1] - 10 - rnd() * 30];
        return (t) => lerp([110, 95], to, t);
      },
      co2: () => {
        const s = STOMATA[Math.floor(rnd() * 3)];
        const from: [number, number] = [s[0] + 60 + rnd() * 120, 440];
        return (t) => {
          const p = lerp(from, s, ease(t));
          return [p[0] + Math.sin(t * 9) * 4, p[1]];
        };
      },
      o2: () => {
        const s = STOMATA[Math.floor(rnd() * 3)];
        const to: [number, number] = [s[0] + 40 + rnd() * 140, 445];
        return (t) => {
          const p = lerp(s, to, t);
          return [p[0] + Math.sin(t * 7) * 6, p[1]];
        };
      },
      h2o: () => (t) => (t < 0.55 ? lerp([258, 450], [300, 300], t / 0.55) : LEAF_MID(((t - 0.55) / 0.45) * 0.9)),
      glucose: () => {
        const start = 0.4 + rnd() * 0.5;
        return (t) => (t < 0.5 ? LEAF_MID(start * (1 - t * 2)) : lerp([300, 300], [252, 452], (t - 0.5) / 0.5));
      },
    };

    const GRANA: [number, number][] = [[215, 215], [315, 250], [410, 200]];
    const CALVIN: [number, number] = [610, 230];
    const chloroPaths: Partial<Record<Kind, () => Particle['path']>> = {
      photon: () => {
        const g = GRANA[Math.floor(rnd() * 3)];
        const from: [number, number] = [g[0] - 120 + rnd() * 80, 0];
        return (t) => lerp(from, [g[0] + (rnd() - 0.5) * 6, g[1] - 30], t);
      },
      h2o: () => {
        const g = GRANA[Math.floor(rnd() * 3)];
        return (t) => lerp([60, 300 + rnd() * 2], [g[0], g[1] + 25], ease(t));
      },
      o2: () => {
        const g = GRANA[Math.floor(rnd() * 3)];
        return (t) => lerp([g[0], g[1] + 25], [40, 380], t);
      },
      atp: () => {
        const g = GRANA[Math.floor(rnd() * 3)];
        return (t) => {
          const p = lerp([g[0] + 30, g[1] - 10], [CALVIN[0] - 60, CALVIN[1] - 20], ease(t));
          return [p[0], p[1] - Math.sin(t * Math.PI) * 30];
        };
      },
      nadph: () => {
        const g = GRANA[Math.floor(rnd() * 3)];
        return (t) => {
          const p = lerp([g[0] + 30, g[1] + 10], [CALVIN[0] - 60, CALVIN[1] + 20], ease(t));
          return [p[0], p[1] + Math.sin(t * Math.PI) * 30];
        };
      },
      co2: () => (t) => lerp([780, 120 + rnd() * 40], [CALVIN[0] + 50, CALVIN[1] - 50], ease(t)),
      glucose: () => (t) => lerp([CALVIN[0] + 40, CALVIN[1] + 60], [760, 400], t),
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      if (!s.running) return;
      const { rate: r } = photosynthesisRate(s.light, s.co2, s.temp);
      const paths = s.view === 'leaf' ? leafPaths : chloroPaths;
      const rates: Record<Kind, number> = {
        photon: (s.light / 100) * 9,
        co2: (s.co2 / 100) * 2.2 + r * 2,
        o2: r * 4,
        h2o: 0.6 + r * 2.4,
        glucose: r * 1.2,
        atp: r * 3.5,
        nadph: r * 3.5,
      };
      (Object.keys(rates) as Kind[]).forEach((k) => {
        const make = paths[k];
        if (!make) return;
        spawnAcc.current[k] += rates[k] * dt;
        while (spawnAcc.current[k] >= 1) {
          spawnAcc.current[k] -= 1;
          spawn(k, make(), k === 'photon' ? 0.7 : k === 'h2o' ? 3.2 : k === 'glucose' ? 3 : 2.4);
        }
      });
      particles.current = particles.current.filter((p) => {
        p.t += dt / p.dur;
        if (p.t >= 1 && p.kind === 'glucose') setGlucose((g) => g + 1);
        return p.t < 1;
      });
      setCycleAngle((a) => a + dt * r * 90);
      setFrame((f) => (f + 1) % 1000000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pick = (key: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(INFO[key]);
  };
  const hit = 'cursor-pointer transition-opacity hover:opacity-80';

  const limitText = {
    light: { ru: 'Сейчас скорость ограничивает свет. Добавь освещения — и график пойдёт вверх.', en: 'Light is the limit right now. Add more and the rate climbs.' },
    co2: { ru: 'Сейчас скорость ограничивает CO₂. Сколько ни добавляй света, график упрётся в потолок.', en: 'CO₂ is the limit right now. More light won’t help — the curve hits a ceiling.' },
    temp: { ru: 'Сейчас мешает температура: ферменты цикла Кальвина работают медленно или уже разрушаются.', en: 'Temperature is the limit: the Calvin cycle enzymes are too slow or breaking down.' },
  }[limiting];

  const legend = (view === 'leaf' ? ['sun', 'photon', 'stoma', 'co2', 'o2', 'h2o', 'glucose'] : ['thylakoid', 'stroma', 'calvin', 'atp', 'nadph', 'co2', 'o2', 'h2o', 'glucose']).map((k) => ({
    info: INFO[k],
    color: ({ sun: C.photon, photon: C.photon, stoma: C.leafLight, co2: C.co2, o2: C.o2, h2o: C.h2o, glucose: C.glucose, thylakoid: C.thylakoid, stroma: C.stroma, calvin: '#8fd3a8', atp: C.atp, nadph: C.nadph } as Record<string, string>)[k],
  }));

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="lab-stage relative rounded-xl overflow-hidden" onClick={() => setSelected(null)}>
          <svg viewBox="0 0 800 450" className="block w-full h-auto">
            <defs>
              <radialGradient id="ps-sun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE9A8" />
                <stop offset="100%" stopColor="#F5A524" />
              </radialGradient>
              <linearGradient id="ps-leaf" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#23764A" />
                <stop offset="100%" stopColor="#4CB07A" />
              </linearGradient>
              <radialGradient id="ps-stroma" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#2A6B47" />
                <stop offset="100%" stopColor="#1A4A31" />
              </radialGradient>
            </defs>

            {view === 'leaf' ? (
              <g>
                {/* Ground */}
                <rect x="0" y="420" width="800" height="30" fill="#1C1A17" />
                {/* Sun */}
                <g className={hit} onClick={pick('sun')}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    const len = 14 + (light / 100) * 16;
                    return <line key={i} x1={90 + Math.cos(a) * 42} y1={80 + Math.sin(a) * 42} x2={90 + Math.cos(a) * (42 + len)} y2={80 + Math.sin(a) * (42 + len)} stroke="#F5C451" strokeWidth="3" strokeLinecap="round" opacity={0.3 + (light / 100) * 0.7} />;
                  })}
                  <circle cx="90" cy="80" r="34" fill="url(#ps-sun)" opacity={0.35 + (light / 100) * 0.65} />
                </g>
                {/* Stem */}
                <path d="M300 300 Q 280 370 252 450" stroke="#3F7A4F" strokeWidth="12" fill="none" strokeLinecap="round" className={hit} onClick={pick('vein')} />
                {/* Leaf */}
                <path d="M300 300 C 320 160, 520 90, 680 110 C 640 250, 480 340, 300 300 Z" fill="url(#ps-leaf)" stroke="#7FD19E" strokeWidth="1.5" className={hit} onClick={pick('leaf')} />
                <path d="M300 300 C 420 240, 560 170, 680 110" stroke="#A8E2BC" strokeWidth="3" fill="none" opacity="0.8" className={hit} onClick={pick('vein')} />
                {[0.3, 0.5, 0.7].map((t) => {
                  const [x, y] = LEAF_MID(t);
                  return (
                    <g key={t} opacity="0.55" className={hit} onClick={pick('vein')}>
                      <path d={`M${x} ${y} q 10 -50 40 -70`} stroke="#A8E2BC" strokeWidth="1.5" fill="none" />
                      <path d={`M${x} ${y} q 30 20 60 20`} stroke="#A8E2BC" strokeWidth="1.5" fill="none" />
                    </g>
                  );
                })}
                {/* Stomata */}
                {STOMATA.map(([x, y], i) => (
                  <g key={i} className={hit} onClick={pick('stoma')}>
                    <ellipse cx={x} cy={y + 2} rx="11" ry="6" fill="#1A4A31" stroke="#A8E2BC" strokeWidth="1.5" />
                    <ellipse cx={x} cy={y + 2} rx="5" ry={1 + (temp > 35 ? 0 : 2)} fill="#0E1A14" />
                  </g>
                ))}
                {/* Labels */}
                <text x="560" y="40" fill="#A0A3AB" fontSize="13" fontFamily="Inter">{lang === 'ru' ? 'Лист' : 'Leaf'}</text>
                <text x="785" y="438" textAnchor="end" fill="#A0A3AB" fontSize="13" fontFamily="Inter">{lang === 'ru' ? 'Воздух: CO₂ входит, O₂ выходит' : 'Air: CO₂ in, O₂ out'}</text>
                <text x="140" y="438" fill="#A0A3AB" fontSize="13" fontFamily="Inter">{lang === 'ru' ? 'Вода от корней' : 'Water from roots'}</text>
              </g>
            ) : (
              <g>
                {/* Chloroplast envelope */}
                <g className={hit} onClick={pick('membrane')}>
                  <ellipse cx="400" cy="225" rx="345" ry="180" fill="none" stroke="#7FD19E" strokeWidth="3" />
                </g>
                <ellipse cx="400" cy="225" rx="336" ry="171" fill="url(#ps-stroma)" stroke="#4CB07A" strokeWidth="2" className={hit} onClick={pick('stroma')} />
                {/* Stroma lamellae */}
                <path d="M215 215 L315 250 L410 200" stroke="#58C47F" strokeWidth="5" fill="none" opacity="0.7" />
                {/* Grana stacks */}
                {[[215, 215], [315, 250], [410, 200]].map(([x, y], gi) => (
                  <g key={gi} className={hit} onClick={pick('thylakoid')}>
                    {Array.from({ length: 6 }).map((_, k) => (
                      <rect key={k} x={x - 34} y={y - 30 + k * 11} width="68" height="9" rx="4.5" fill={k % 2 ? '#4FB872' : '#63CC86'} stroke="#2A6B47" strokeWidth="1" />
                    ))}
                  </g>
                ))}
                {/* Calvin cycle wheel */}
                <g className={hit} onClick={pick('calvin')} transform={`translate(610 230)`}>
                  <circle r="62" fill="#163D29" stroke="#8fd3a8" strokeWidth="1.5" strokeDasharray="4 5" />
                  <g transform={`rotate(${cycleAngle})`}>
                    {[0, 120, 240].map((a) => (
                      <path key={a} d="M 0 -50 A 50 50 0 0 1 43 -25" transform={`rotate(${a})`} stroke="#8fd3a8" strokeWidth="4" fill="none" strokeLinecap="round" markerEnd="" />
                    ))}
                    {[0, 120, 240].map((a) => (
                      <polygon key={`h${a}`} points="43,-25 34,-30 40,-17" transform={`rotate(${a})`} fill="#8fd3a8" />
                    ))}
                  </g>
                  <text y="-4" textAnchor="middle" fill="#DFF3E6" fontSize="13" fontFamily="Inter">{lang === 'ru' ? 'Цикл' : 'Calvin'}</text>
                  <text y="13" textAnchor="middle" fill="#DFF3E6" fontSize="13" fontFamily="Inter">{lang === 'ru' ? 'Кальвина' : 'cycle'}</text>
                </g>
                <text x="250" y="120" fill="#DFF3E6" fontSize="13" fontFamily="Inter" opacity="0.85">{lang === 'ru' ? 'Световая фаза (тилакоиды)' : 'Light reactions (thylakoids)'}</text>
                <text x="530" y="330" fill="#DFF3E6" fontSize="13" fontFamily="Inter" opacity="0.85">{lang === 'ru' ? 'Темновая фаза (строма)' : 'Dark reactions (stroma)'}</text>
              </g>
            )}

            {/* Particles */}
            {particles.current.map((p) => {
              const [x, y] = p.path(Math.min(1, p.t));
              const fade = p.t > 0.85 ? (1 - p.t) / 0.15 : Math.min(1, p.t * 6);
              const onClick = pick(p.kind);
              switch (p.kind) {
                case 'photon':
                  return <circle key={p.id} cx={x} cy={y} r="3.5" fill={C.photon} opacity={fade} className="cursor-pointer" onClick={onClick} />;
                case 'co2':
                  return (
                    <g key={p.id} transform={`translate(${x} ${y})`} opacity={fade} className="cursor-pointer" onClick={onClick}>
                      <circle cx="-7" r="4" fill="#E5484D" />
                      <circle r="4.5" fill="#55585F" />
                      <circle cx="7" r="4" fill="#E5484D" />
                    </g>
                  );
                case 'o2':
                  return (
                    <g key={p.id} transform={`translate(${x} ${y})`} opacity={fade} className="cursor-pointer" onClick={onClick}>
                      <circle cx="-3.5" r="4" fill={C.o2} />
                      <circle cx="3.5" r="4" fill={C.o2} />
                    </g>
                  );
                case 'h2o':
                  return <path key={p.id} d={`M${x} ${y - 6} q 5 6 0 9 q -5 -3 0 -9 z`} fill={C.h2o} opacity={fade} className="cursor-pointer" onClick={onClick} />;
                case 'glucose':
                  return <polygon key={p.id} points={Array.from({ length: 6 }, (_, k) => `${x + 7 * Math.cos((k * Math.PI) / 3)},${y + 7 * Math.sin((k * Math.PI) / 3)}`).join(' ')} fill={C.glucose} stroke="#FFE2A3" strokeWidth="1" opacity={fade} className="cursor-pointer" onClick={onClick} />;
                case 'atp':
                  return <rect key={p.id} x={x - 9} y={y - 5} width="18" height="10" rx="3" fill={C.atp} opacity={fade} className="cursor-pointer" onClick={onClick} />;
                case 'nadph':
                  return <rect key={p.id} x={x - 9} y={y - 5} width="18" height="10" rx="5" fill={C.nadph} opacity={fade} className="cursor-pointer" onClick={onClick} />;
              }
            })}
          </svg>

          <div className="pointer-events-none absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] font-mono text-[12px] text-[#EDEDED]">
            {lang === 'ru' ? 'скорость' : 'rate'} {Math.round(rate * 100)}%
          </div>
          <InfoCard lang={lang} info={selected} onClose={() => setSelected(null)} />
        </div>

        <div className="bg-surface border border-line rounded-xl px-4 py-3 overflow-x-auto text-ink text-center">
          <Formula tex={`6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} \\xrightarrow{\\text{${lang === 'ru' ? 'свет' : 'light'}}} \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2}`} display />
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <Panel>
          <Segmented<View>
            value={view}
            onChange={(v) => {
              setView(v);
              setSelected(null);
            }}
            options={[
              { id: 'leaf', label: lang === 'ru' ? 'Лист' : 'Leaf' },
              { id: 'chloroplast', label: lang === 'ru' ? 'Хлоропласт' : 'Chloroplast' },
            ]}
          />
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
            {view === 'leaf'
              ? lang === 'ru'
                ? 'Лист берёт три вещи: свет, воду от корней и CO₂ из воздуха через устьица. Отдаёт кислород в воздух и сахар — остальному растению.'
                : 'A leaf takes three things: light, water from the roots and CO₂ from the air through its stomata. It gives oxygen to the air and sugar to the rest of the plant.'
              : lang === 'ru'
                ? 'Внутри хлоропласта две фазы. В тилакоидах свет расщепляет воду и заряжает ATP и NADPH. В строме цикл Кальвина тратит их, чтобы превратить CO₂ в глюкозу.'
                : 'Inside the chloroplast there are two stages. In the thylakoids light splits water and charges ATP and NADPH. In the stroma the Calvin cycle spends them to turn CO₂ into glucose.'}
          </p>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4">
            <Slider label={lang === 'ru' ? 'Освещённость' : 'Light'} value={light} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setLight} />
            <Slider label={lang === 'ru' ? 'Концентрация CO₂' : 'CO₂ level'} value={co2} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setCo2} />
            <Slider label={lang === 'ru' ? 'Температура' : 'Temperature'} value={temp} min={0} max={50} step={1} format={(v) => `${v} °C`} onChange={setTemp} />
            <RateChart lang={lang} light={light} co2={co2} temp={temp} />
            <div className="grid grid-cols-2 gap-2">
              <Metric label={lang === 'ru' ? 'Пузырьков O₂/мин' : 'O₂ bubbles/min'} value={Math.round(rate * 42)} />
              <Metric label={lang === 'ru' ? 'Глюкозы собрано' : 'Glucose made'} value={glucose} />
            </div>
            <Tip lang={lang}>{limitText[lang]}</Tip>
            <PlayControls lang={lang} running={running} onToggle={() => setRunning((r) => !r)} />
          </div>
        </Panel>

        <Panel title={lang === 'ru' ? 'Что на экране' : 'On screen'}>
          <Legend lang={lang} items={legend} selectedTitle={selected?.title.en} onSelect={setSelected} />
        </Panel>
      </aside>
    </div>
  );
};

/** Rate vs light at the current CO₂ and temperature: shows where the curve flattens */
const RateChart: React.FC<{ lang: 'ru' | 'en'; light: number; co2: number; temp: number }> = ({ lang, light, co2, temp }) => {
  const W = 280;
  const H = 120;
  const pts = Array.from({ length: 51 }, (_, i) => {
    const L = i * 2;
    const r = photosynthesisRate(L, co2, temp).rate;
    return `${(L / 100) * W},${H - r * (H - 8)}`;
  }).join(' ');
  const cur = photosynthesisRate(light, co2, temp).rate;
  return (
    <figure>
      <svg viewBox={`-28 -6 ${W + 36} ${H + 28}`} className="w-full h-auto">
        <line x1="0" y1={H} x2={W} y2={H} stroke="#D6D4CE" />
        <line x1="0" y1="0" x2="0" y2={H} stroke="#D6D4CE" />
        <polyline points={pts} fill="none" stroke="#30A46C" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={(light / 100) * W} cy={H - cur * (H - 8)} r="5" fill="#2F5BFF" stroke="#fff" strokeWidth="2" />
        <text x={W / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="#6B6B6B" fontFamily="Inter">{lang === 'ru' ? 'освещённость' : 'light'}</text>
        <text x="-10" y={H / 2} textAnchor="middle" fontSize="11" fill="#6B6B6B" fontFamily="Inter" transform={`rotate(-90 -10 ${H / 2})`}>{lang === 'ru' ? 'скорость' : 'rate'}</text>
      </svg>
    </figure>
  );
};
