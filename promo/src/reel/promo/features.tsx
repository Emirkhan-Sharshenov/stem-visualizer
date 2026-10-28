import React, { useLayoutEffect, useRef } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Button, Card, Chip, ProgressBar } from '@heroui/react';
import { clamp, CYAN, DIM, INK, Mono, prog, Stage, useIn } from '../kit';
import { applyShot, compile, fly, type World } from '../../../../src/components/games/funcwar/engine';
import { LEVELS, levelWorld } from '../../../../src/components/games/funcwar/levels';
import { DEFAULT_LOOKS, drawSoldier, HATS, COLORS, type Look } from '../../../../src/components/games/funcwar/looks';
import { Cta, FeatureReel, FieldSvg, Hook, Typed, upto, withVoice, type Beat } from './runner';
import VOICE from './voice.json';

const RED = '#FF5A5F';
const GREEN = '#3DD68C';

/* ======================= 1. «Бой функций» ======================= */

const WALL: World = {
  obstacles: [{ x: 0, y: -4, r: 3.5 }, { x: -6, y: 6, r: 2 }, { x: 9, y: 7, r: 2.2 }],
  holes: [],
  soldiers: [
    { id: 0, team: 0, x: -15, y: -4, alive: true, name: '' },
    { id: 10, team: 1, x: 15, y: -4, alive: true, name: '', hp: 3 },
  ],
};
const STRAIGHT = fly(WALL, WALL.soldiers[0], compile('0'));
const WALL2 = applyShot(WALL, STRAIGHT);
const ARC = fly(WALL2, WALL2.soldiers[0], compile('-0.04x(x-30)'));
const SLALOM = levelWorld(LEVELS.find((l) => l.id === 'slalom')!);
const WEAVE = fly(SLALOM, SLALOM.soldiers[0], compile('4sin(pi*x/12)'));

const FieldScene: React.FC<{ formula: string; children: (f: number) => React.ReactNode; note?: (f: number) => React.ReactNode }> = ({ formula, children, note }) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  return (
    <Stage style={{ padding: '140px 70px 300px', gap: 36 }}>
      <div style={{ width: '100%', opacity: a }}>
        <Typed text={formula} from={6} perChar={2} />
      </div>
      <div style={{ width: '100%', opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>{children(f)}</div>
      {note && <div style={{ minHeight: 70 }}>{note(f)}</div>}
    </Stage>
  );
};

const Straight: React.FC = () => (
  <FieldScene formula="0">{(f) => <FieldSvg world={f > 80 ? WALL2 : WALL} shots={[{ path: STRAIGHT.path, upto: upto(f, 40, 40, STRAIGHT.path) }]} hp={{ 10: 3 }} />}</FieldScene>
);
const Arc: React.FC = () => (
  <FieldScene
    formula="−0,04x(x − 30)"
    note={(f) =>
      f > 95 && (
        <Chip className="reel-chip" size="lg" variant="soft" style={{ background: `${RED}2E`, color: RED, transform: `scale(${prog(f, 95, 8)})` }}>
          <Chip.Label className="reel-chip-label">Попадание! −1 ❤</Chip.Label>
        </Chip>
      )
    }
  >
    {(f) => <FieldSvg world={WALL2} shots={[{ path: ARC.path, upto: upto(f, 50, 45, ARC.path) }]} hp={{ 10: f > 95 ? 2 : 3 }} />}
  </FieldScene>
);
const Weave: React.FC = () => <FieldScene formula="4sin(πx/12)">{(f) => <FieldSvg world={SLALOM} shots={[{ path: WEAVE.path, upto: upto(f, 40, 55, WEAVE.path) }]} dead={f > 95 ? [10] : []} />}</FieldScene>;

const Campaign: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage style={{ gap: 30 }}>
      <Mono style={{ fontSize: 34 }}>КАМПАНИЯ · 10 УРОВНЕЙ</Mono>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, width: '100%' }}>
        {LEVELS.map((l, i) => {
          const s = prog(f, 8 + i * 7, 8);
          const stars = Math.min(3, Math.max(0, Math.floor((f - 20 - i * 7) / 6)));
          return (
            <Card key={l.id} style={{ padding: '18px 24px', opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
              <Card.Content style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 34, color: INK, whiteSpace: 'nowrap' }}>
                  <span className="font-mono" style={{ color: DIM, marginRight: 12 }}>{i + 1}</span>
                  {l.title.ru}
                </span>
                <span style={{ fontSize: 30, color: '#F5A524', whiteSpace: 'nowrap' }}>{'★'.repeat(stars)}<span style={{ color: '#2C3B5E' }}>{'★'.repeat(3 - stars)}</span></span>
              </Card.Content>
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

const ModeCards: React.FC<{ items: [string, string][] }> = ({ items }) => (
  <Stage style={{ gap: 28 }}>
    {items.map(([t, d], i) => (
      <ModeCard key={t} i={i} title={t} text={d} />
    ))}
  </Stage>
);
const ModeCard: React.FC<{ i: number; title: string; text: string }> = ({ i, title, text }) => {
  const s = useIn(6 + i * 12);
  return (
    <Card style={{ width: '100%', padding: '34px 40px', opacity: s, transform: `translateX(${(1 - s) * 120}px)` }}>
      <Card.Content>
        <div className="font-display" style={{ fontSize: 54, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ marginTop: 8, fontSize: 36, color: DIM }}>{text}</div>
      </Card.Content>
    </Card>
  );
};

export const GAME_BEATS: Beat[] = [
  { line: 'Попади в соперника… формулой.', frames: 75, noCaption: true, scene: () => <Hook top="Попади в соперника" accent="формулой" chip="Новая игра · Бой функций" /> },
  { line: 'Пишешь функцию — снаряд летит по её графику.', frames: 130, scene: Straight },
  { line: 'Скала мешает? Возьми параболу.', frames: 140, scene: Arc },
  { line: 'Синус обходит скалы змейкой.', frames: 130, scene: Weave },
  { line: 'Десять уровней: от прямой до экспоненты.', frames: 110, scene: Campaign },
  {
    line: 'Бой с ботом, дуэль с другом и рейтинг.',
    frames: 105,
    scene: () => <ModeCards items={[['Против бота', 'Три уровня сложности'], ['Дуэль по ссылке', '1 на 1, 2 на 2, 3 на 3'], ['Рейтинг', 'Таблица лидеров']]} />,
  },
  { line: 'Играй бесплатно на STEM Visualizer. Ссылка в профиле.', frames: 100, noCaption: true, scene: () => <Cta title="Бой функций" button="Играть бесплатно" note="Ссылка в профиле" /> },
];

/* ======================= 2. «Дуэль с другом» ======================= */

const DuelLink: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const pick = Math.floor(f / 25) % 3;
  return (
    <Stage style={{ gap: 40 }}>
      <Card style={{ width: '100%', padding: 36, opacity: a }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Mono style={{ fontSize: 30 }}>ССЫЛКА НА ДУЭЛЬ</Mono>
          <div className="font-mono" style={{ fontSize: 34, color: INK, padding: '18px 22px', borderRadius: 18, background: '#0A1122', border: '2px solid #24345A' }}>…/#/app?lab=games&fw=48213</div>
          <Button size="lg" style={{ height: 100, fontSize: 40, alignSelf: 'flex-start', padding: '0 50px' }}>Отправить другу</Button>
        </Card.Content>
      </Card>
      <div style={{ display: 'flex', gap: 18 }}>
        {['1 на 1', '2 на 2', '3 на 3'].map((t, i) => (
          <Chip key={t} className="reel-chip" size="lg" color="accent" variant={i === pick ? 'primary' : 'soft'}>
            <Chip.Label className="reel-chip-label" style={{ fontSize: 40 }}>{t}</Chip.Label>
          </Chip>
        ))}
      </div>
    </Stage>
  );
};

const Race: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const typed = f > 50;
  const won = f > 70;
  return (
    <Stage style={{ gap: 36 }}>
      <Mono style={{ fontSize: 32 }}>КТО ПЕРВЫМ РЕШИТ — ТОТ СТРЕЛЯЕТ ПЕРВЫМ</Mono>
      <Card style={{ width: '100%', padding: 40, opacity: a }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontSize: 52, color: INK, lineHeight: 1.3 }}>y = 2x + 5. Чему равен y при x = 0?</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div className="font-mono" style={{ flex: 1, fontSize: 52, padding: '18px 26px', borderRadius: 20, border: `2px solid ${won ? GREEN : '#24345A'}`, background: '#0A1122', color: INK }}>{typed ? '5' : ''}<span style={{ color: CYAN, opacity: Math.floor(f / 8) % 2 }}>|</span></div>
            <Button size="lg" style={{ height: 100, fontSize: 40, padding: '0 40px' }}>Ответить</Button>
          </div>
          {won && <div style={{ fontSize: 50, fontWeight: 600, color: GREEN, transform: `scale(${prog(f, 70, 8)})`, transformOrigin: 'left' }}>Ты первый! Стреляешь первым.</div>}
        </Card.Content>
      </Card>
    </Stage>
  );
};

const DUEL: World = {
  obstacles: [{ x: -2, y: 1, r: 3 }, { x: 6, y: -6, r: 2.4 }, { x: -8, y: -7, r: 2 }],
  holes: [],
  soldiers: [
    { id: 0, team: 0, x: -16, y: -2, alive: true, name: '', hp: 3 },
    { id: 1, team: 0, x: -13, y: 6, alive: true, name: '', hp: 3 },
    { id: 10, team: 1, x: 15, y: 3, alive: true, name: '', hp: 3 },
    { id: 11, team: 1, x: 13, y: -8, alive: true, name: '', hp: 3 },
  ],
};
// aim at the enemy (k = 5/31) and hop the rock on the way with a Gaussian bump
const DUEL_HIT = fly(DUEL, DUEL.soldiers[0], compile('0.1613x + 6e^(-((x-14)/3)^2)'));
const Battle: React.FC = () => (
  <FieldScene formula="0,1613x + 6e^(−((x−14)/3)²)">
    {(f) => (
      <FieldSvg
        world={DUEL}
        shots={[{ path: DUEL_HIT.path, upto: upto(f, 45, 45, DUEL_HIT.path) }]}
        hp={{ 0: 3, 1: 3, 10: f > 90 && DUEL_HIT.killed.includes(10) ? 2 : 3, 11: 3 }}
      />
    )}
  </FieldScene>
);

const Rating: React.FC = () => {
  const f = useCurrentFrame();
  const me = Math.round(interpolate(f, [30, 70], [1000, 1024], clamp));
  const rows: [string, number, boolean][] = [
    ['Аружан', 1186, false],
    ['Тимур', 1092, false],
    ['Ты', me, true],
    ['Ислам', 1003, false],
  ];
  return (
    <Stage style={{ gap: 26 }}>
      <Mono style={{ fontSize: 34 }}>РЕЙТИНГ · БОЙ ФУНКЦИЙ</Mono>
      {rows.map(([n, r, mine], i) => {
        const s = useIn(4 + i * 8); // eslint-disable-line react-hooks/rules-of-hooks
        return (
          <Card key={n} style={{ width: '100%', padding: '26px 34px', opacity: s, background: mine ? 'rgba(57,225,255,0.14)' : undefined, border: mine ? `2px solid ${CYAN}` : undefined }}>
            <Card.Content style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <span style={{ fontSize: 44, width: 60 }}>{['🥇', '🥈', '🥉', '4'][i]}</span>
              <span style={{ flex: 1, fontSize: 46, color: INK }}>{n}</span>
              {mine && f > 70 && <span className="font-mono" style={{ fontSize: 40, color: GREEN }}>+24</span>}
              <span className="font-mono" style={{ fontSize: 50, color: INK }}>{r}</span>
            </Card.Content>
          </Card>
        );
      })}
    </Stage>
  );
};

/** a soldier drawn by the game's own cosmetics code */
const Dressed: React.FC<{ look: Look; size: number }> = ({ look, size }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.clearRect(0, 0, size, size);
    drawSoldier(g, size / 2, size / 2 + size * 0.08, size * 0.26, look, 1);
  });
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} />;
};
const Workshop: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 16);
  const look: Look = { ...DEFAULT_LOOKS[0], color: COLORS[k % COLORS.length].id, hat: HATS[(k * 3 + 1) % HATS.length].id, eyes: (['dot', 'smile', 'glasses', 'shades', 'cyclops'] as const)[k % 5], body: (['circle', 'square', 'diamond', 'hex', 'star', 'blob'] as const)[k % 6] };
  return (
    <Stage style={{ gap: 30 }}>
      <Mono style={{ fontSize: 34 }}>МАСТЕРСКАЯ</Mono>
      <Dressed look={look} size={520} />
      <Chip className="reel-chip" size="lg" color="accent" variant="soft">
        <Chip.Label className="reel-chip-label">58 предметов · только внешний вид</Chip.Label>
      </Chip>
    </Stage>
  );
};

export const DUEL_BEATS: Beat[] = [
  { line: 'Дуэль на формулах — с другом.', frames: 75, noCaption: true, scene: () => <Hook top="Дуэль на формулах" accent="с другом" chip="Бой функций · онлайн" /> },
  { line: 'Отправь ссылку и выбери: один на один, два на два или три на три.', frames: 115, scene: DuelLink },
  { line: 'Кто первым решит задачу — тот стреляет первым.', frames: 115, scene: Race },
  { line: 'У каждого бойца три жизни.', frames: 120, scene: Battle },
  { line: 'Побеждай — и поднимайся в рейтинге.', frames: 105, scene: Rating },
  { line: 'А в мастерской — шапки, следы и поля. Только для красоты.', frames: 120, scene: Workshop },
  { line: 'Бой функций на STEM Visualizer. Ссылка в профиле.', frames: 100, noCaption: true, scene: () => <Cta title="Бой функций" button="Позвать друга" note="Ссылка в профиле" /> },
];

/* ======================= 3. «Контрольная за минуту» ======================= */

const Settings: React.FC = () => {
  const f = useCurrentFrame();
  const variants = Math.min(4, 1 + Math.floor(Math.max(0, f - 40) / 12));
  const rows: [string, string][] = [
    ['Предмет', 'Физика · 8 класс'],
    ['Разделы', 'Давление, Работа и мощность'],
    ['Заданий', '10'],
    ['Вариантов', String(variants)],
  ];
  return (
    <Stage style={{ gap: 30 }}>
      <Card style={{ width: '100%', padding: 40 }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {rows.map(([k, v], i) => {
            const s = prog(f, 4 + i * 8, 10);
            return (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 42, opacity: s }}>
                <span style={{ color: DIM }}>{k}</span>
                <span className="font-mono" style={{ color: k === 'Вариантов' ? CYAN : INK }}>{v}</span>
              </div>
            );
          })}
        </Card.Content>
      </Card>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
        {['С выбором', 'Поле для ответа', 'С решением'].map((t, i) => (
          <Chip key={t} className="reel-chip" size="lg" color="accent" variant={f > 60 + i * 10 ? 'primary' : 'soft'}>
            <Chip.Label className="reel-chip-label">{t}</Chip.Label>
          </Chip>
        ))}
      </div>
    </Stage>
  );
};

const Sheet: React.FC<{ title: string; lines?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ title, lines = 9, style, children }) => (
  <div style={{ width: 560, background: '#fff', borderRadius: 10, padding: '30px 34px', color: '#111', boxShadow: '0 18px 50px rgba(0,0,0,0.45)', ...style }}>
    <div style={{ borderBottom: '3px solid #2F5BFF', paddingBottom: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: '#2F5BFF' }}>Контрольная работа</span>
      <span style={{ fontSize: 24, color: '#444' }}>{title}</span>
    </div>
    {children ??
      Array.from({ length: lines }, (_, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, color: '#2F5BFF', fontSize: 22 }}>{i + 1}.</span>
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, borderRadius: 5, background: '#D9DCE3', width: `${70 + ((i * 37) % 30)}%` }} />
            <div style={{ height: 10, borderRadius: 5, background: '#ECEEF2', width: `${40 + ((i * 53) % 40)}%`, marginTop: 8 }} />
          </div>
        </div>
      ))}
  </div>
);

const Fan: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <div style={{ position: 'relative', width: 900, height: 1000 }}>
        {[0, 1, 2, 3].map((i) => {
          const s = prog(f, 6 + i * 10, 18);
          const rot = (i - 1.5) * 7 * s;
          return (
            <div key={i} style={{ position: 'absolute', left: 170, top: 60, transform: `translateX(${(i - 1.5) * 90 * s}px) rotate(${rot}deg)`, transformOrigin: 'bottom center', opacity: interpolate(f, [6 + i * 10, 12 + i * 10], [0, 1], clamp) }}>
              <Sheet title={`Вариант ${i + 1}`} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Kinds: React.FC = () => {
  const a = useIn(0);
  return (
    <Stage>
      <div style={{ opacity: a, transform: `scale(${0.92 + a * 0.08})` }}>
        <Sheet title="Вариант 2" style={{ width: 900, padding: '40px 46px' }}>
          <div style={{ fontSize: 30, lineHeight: 1.45 }}>
            <div><b style={{ color: '#2F5BFF' }}>1.</b> Каким прибором измеряют давление? <span style={{ color: '#777', fontSize: 24 }}>(1 б.)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', margin: '6px 0 22px 34px' }}>
              <span>А) барометром</span><span>Б) динамометром</span><span>В) термометром</span><span>Г) ареометром</span>
            </div>
            <div><b style={{ color: '#2F5BFF' }}>2.</b> Сила 600 Н действует на площадь 0,3 м². Найди давление. <span style={{ color: '#777', fontSize: 24 }}>(1 б.)</span></div>
            <div style={{ margin: '10px 0 22px 34px' }}>Ответ: <span style={{ display: 'inline-block', width: 260, height: 40, border: '2px solid #555', borderRadius: 6, verticalAlign: 'middle' }} /></div>
            <div><b style={{ color: '#2F5BFF' }}>3.</b> Какую работу совершает кран, поднимая 500 кг на 12 м? Запиши решение. <span style={{ color: '#777', fontSize: 24 }}>(2 б.)</span></div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 40, borderBottom: '2px solid #ccc', marginLeft: 34 }} />
            ))}
          </div>
        </Sheet>
      </div>
    </Stage>
  );
};

const Key: React.FC = () => {
  const a = useIn(0);
  return (
    <Stage>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
        <Sheet title="Ответы для учителя" style={{ width: 860 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px', fontSize: 30 }}>
            {['Вариант 1', 'Вариант 2'].map((v, j) => (
              <div key={v}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{v}</div>
                {['А', '2000 Па', '60 кДж', 'В', '45 Вт', 'Б'].map((ans, i) => (
                  <div key={i}>{i + 1}. <b>{j ? ['Б', '1500 Па', '72 кДж', 'А', '30 Вт', 'Г'][i] : ans}</b></div>
                ))}
              </div>
            ))}
          </div>
        </Sheet>
      </div>
    </Stage>
  );
};

const Print: React.FC = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [30, 34, 40], [1, 0.94, 1], clamp);
  const pdf = prog(f, 44, 14);
  return (
    <Stage style={{ gap: 50 }}>
      <Button size="lg" className="font-semibold" style={{ height: 130, padding: '0 70px', fontSize: 48, transform: `scale(${press})`, boxShadow: f > 30 ? '0 0 0 12px rgba(57,225,255,0.25)' : undefined }}>
        🖨 Печать / PDF
      </Button>
      <div style={{ opacity: pdf, transform: `translateY(${(1 - pdf) * 60}px)`, display: 'flex', gap: 30 }}>
        {['kontrolnaya-8A.pdf', '4 варианта · ключи'].map((t) => (
          <Chip key={t} className="reel-chip" size="lg" color="success" variant="soft">
            <Chip.Label className="reel-chip-label">{t}</Chip.Label>
          </Chip>
        ))}
      </div>
    </Stage>
  );
};

export const TESTS_BEATS: Beat[] = [
  { line: 'Контрольная в четырёх вариантах — за минуту.', frames: 80, noCaption: true, scene: () => <Hook top="Контрольная" accent="в 4 вариантах — за минуту" chip="Для учителей" /> },
  { line: 'Выбери класс, темы и сколько нужно вариантов.', frames: 120, scene: Settings },
  { line: 'Те же темы — в каждом варианте свои числа.', frames: 115, scene: Fan },
  { line: 'Задания с выбором, полем для ответа и полным решением.', frames: 120, scene: Kinds },
  { line: 'Ключи для проверки — сразу.', frames: 90, scene: Key },
  { line: 'Печатай или сохрани в PDF.', frames: 90, scene: Print },
  { line: 'Конструктор контрольных на STEM Visualizer. Ссылка в профиле.', frames: 100, noCaption: true, scene: () => <Cta title="Конструктор контрольных" button="Попробовать" note="До 8 вариантов · тариф «Учитель»" /> },
];

/* ======================= 4. «Пробный ЕГЭ и ОГЭ» ======================= */

const ExamPick: React.FC = () => {
  const f = useCurrentFrame();
  const card = useIn(40);
  return (
    <Stage style={{ gap: 36 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {['ОРТ', 'ОГЭ', 'ЕГЭ'].map((t, i) => (
          <Chip key={t} className="reel-chip" size="lg" color="accent" variant={(f > 20 && i === 2) || (f <= 20 && i === Math.floor(f / 8) % 3) ? 'primary' : 'soft'}>
            <Chip.Label className="reel-chip-label" style={{ fontSize: 44 }}>{t}</Chip.Label>
          </Chip>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {['Математика', 'Физика', 'Химия', 'Биология'].map((t, i) => (
          <Chip key={t} className="reel-chip" size="lg" variant={i === 1 ? 'primary' : 'soft'} color="accent">
            <Chip.Label className="reel-chip-label">{t}</Chip.Label>
          </Chip>
        ))}
      </div>
      <Card style={{ width: '100%', padding: 40, opacity: card, transform: `translateY(${(1 - card) * 50}px)` }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="font-display" style={{ fontSize: 58, fontWeight: 700, color: INK }}>Пробный ЕГЭ · Физика</div>
          <div style={{ fontSize: 42, color: DIM }}>26 заданий · 235 минут</div>
          <div style={{ fontSize: 34, color: DIM }}>Часть 1 — теория · Часть 2 — задачи</div>
        </Card.Content>
      </Card>
    </Stage>
  );
};

const ExamQuestion: React.FC = () => {
  const f = useCurrentFrame();
  const secs = 3 * 3600 + 54 * 60 + 12 - Math.floor(f / 30);
  const t = `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const pick = f > 60 ? 2 : -1;
  return (
    <Stage style={{ gap: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Mono style={{ fontSize: 32 }}>ЗАДАНИЕ 14 ИЗ 26</Mono>
        <span className="font-mono" style={{ fontSize: 40, color: INK }}>⏱ {t}</span>
      </div>
      <Card style={{ width: '100%', padding: 40 }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ fontSize: 46, color: INK, lineHeight: 1.3 }}>Магнитный поток через контур изменился на 0,6 Вб за 0,2 с. Найди ЭДС индукции.</div>
          {['0,12 В', '1,2 В', '3 В', '30 В'].map((o, i) => (
            <div key={o} style={{ fontSize: 42, padding: '20px 26px', borderRadius: 20, border: `2px solid ${i === pick ? CYAN : '#24345A'}`, background: i === pick ? 'rgba(57,225,255,0.14)' : '#0A1122', color: INK }}>
              {['А', 'Б', 'В', 'Г'][i]}) {o}
            </div>
          ))}
        </Card.Content>
      </Card>
    </Stage>
  );
};

const ExamResult: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [8, 50], [0, 78], clamp));
  return (
    <Stage style={{ gap: 34 }}>
      <Mono style={{ fontSize: 34 }}>РЕЗУЛЬТАТ</Mono>
      <div className="font-display" style={{ fontSize: 220, fontWeight: 700, color: CYAN, textShadow: '0 0 60px rgba(57,225,255,0.5)' }}>{v}%</div>
      <div style={{ width: '100%' }}>
        <ProgressBar aria-label="Результат" value={v} size="lg">
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
      <Card style={{ width: '100%', padding: 36, opacity: prog(f, 55, 12) }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 38, color: DIM }}>Подтянуть:</div>
          {['Электромагнитная индукция', 'Геометрическая оптика', 'Ядерные реакции'].map((t) => (
            <div key={t} style={{ fontSize: 42, color: INK }}>→ {t}</div>
          ))}
        </Card.Content>
      </Card>
    </Stage>
  );
};

const Shuffle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage style={{ gap: 30 }}>
      {[0, 1, 2].map((i) => {
        const s = prog(f, 4 + i * 10, 12);
        return (
          <Card key={i} style={{ width: '100%', padding: '30px 38px', opacity: s, transform: `translateX(${(1 - s) * (i % 2 ? -140 : 140)}px)` }}>
            <Card.Content style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-display" style={{ fontSize: 46, fontWeight: 700, color: INK }}>Вариант {[7, 8, 9][i]}</span>
              <span style={{ fontSize: 36, color: DIM }}>{['сегодня', 'завтра', 'через неделю'][i]}</span>
            </Card.Content>
          </Card>
        );
      })}
    </Stage>
  );
};

export const EXAM_BEATS: Beat[] = [
  { line: 'До экзамена меньше, чем кажется.', frames: 80, noCaption: true, scene: () => <Hook top="До экзамена" accent="меньше, чем кажется" chip="ЕГЭ · ОГЭ · ОРТ" /> },
  { line: 'Пробный ЕГЭ и ОГЭ: столько же заданий и времени, как на экзамене.', frames: 125, scene: ExamPick },
  { line: 'Решай на время — как в настоящий день экзамена.', frames: 115, scene: ExamQuestion },
  { line: 'В конце — результат и темы, которые нужно подтянуть.', frames: 120, scene: ExamResult },
  { line: 'Каждый раз — новый вариант.', frames: 85, scene: Shuffle },
  { line: 'Пробные экзамены на STEM Visualizer. Неделя Pro — бесплатно.', frames: 105, noCaption: true, scene: () => <Cta title="Пробные экзамены" button="Неделя Pro бесплатно" note="Ссылка в профиле" /> },
];

/** one composition per reel; the scenes are functions, so they live here rather than in (JSON) props */
const SPANS = VOICE as unknown as Record<string, [number, number][]>;
const make = (id: string, beats: Beat[], take: string) => {
  const timed = withVoice(beats, SPANS[take]);
  const component: React.FC = () => <FeatureReel beats={timed} voice={SPANS[take] ? `vo7/${take}.mp3` : undefined} />;
  return { id, beats: timed, component };
};
export const FEATURES: { id: string; beats: Beat[]; component: React.FC }[] = [
  make('PromoGame', GAME_BEATS, 'promo-game'),
  make('PromoDuel', DUEL_BEATS, 'promo-duel'),
  make('PromoTests', TESTS_BEATS, 'promo-tests'),
  make('PromoExams', EXAM_BEATS, 'promo-exams'),
];
