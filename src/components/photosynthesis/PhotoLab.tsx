import { RangeSlider } from '../ui/RangeSlider';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Timer, Trash2 } from 'lucide-react';
import { COLOR_HEX, Conditions, factors, illuminance, LightColor, limiting, MAX_BUBBLES, rate } from './photo';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
type Axis = 'd' | 'co2' | 't';
interface Row extends Conditions {
  bubbles: number;
}

const MEASURE_MS = 6000; // one "minute" of measuring, sped up

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
}

export const PhotoLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [c, setC] = useState<Conditions>({ d: 20, color: 'white', co2: 0.5, t: 22 });
  const [rows, setRows] = useState<Row[]>([]);
  const [measuring, setMeasuring] = useState<{ start: number; count: number } | null>(null);
  const [axis, setAxis] = useState<Axis>('d');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const live = useRef({ c, measuring });
  live.current = { c, measuring };

  useEffect(() => progress.recordLab('sandbox-photosynthesis'), []);

  // bubbles leave the cut stem at the current rate (shown 10× faster than real time)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const perSec = (rate(live.current.c) * MAX_BUBBLES) / 6;
      acc += perSec * dt * (0.6 + Math.random() * 0.8);
      let born = 0;
      while (acc >= 1) {
        acc -= 1;
        born++;
      }
      if (born && live.current.measuring) setMeasuring((m) => m && { ...m, count: m.count + born });
      setBubbles((bs) => [
        ...bs.map((b) => ({ ...b, y: b.y - b.vy * dt, x: b.x + Math.sin(b.y / 9) * 0.3 })).filter((b) => b.y > 60),
        ...Array.from({ length: born }, () => ({ x: 236 + (Math.random() - 0.5) * 4, y: 162, r: 2 + Math.random() * 2.5, vy: 55 + Math.random() * 25 })),
      ]);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // finish a measurement
  useEffect(() => {
    if (!measuring) return;
    const id = setTimeout(() => {
      // read the count now: by the time an updater runs, the measurement is already cleared
      const row = { ...live.current.c, bubbles: live.current.measuring?.count ?? 0 };
      setRows((r) => [...r, row].slice(-12));
      setMeasuring(null);
    }, MEASURE_MS - (performance.now() - measuring.start));
    return () => clearTimeout(id);
  }, [measuring?.start]); // eslint-disable-line react-hooks/exhaustive-deps

  const f = factors(c);
  const r = rate(c);
  const lim = limiting(c);
  const lampX = 20 + ((c.d - 10) / 40) * 110; // further left = further away
  const light = COLOR_HEX[c.color];
  const progressPct = measuring ? Math.min(1, (performance.now() - measuring.start) / MEASURE_MS) : 0;

  const LIM_TEXT = {
    light: L('Сейчас мало света: придвинь лампу.', 'Light is limiting now: move the lamp closer.'),
    co2: L('Сейчас не хватает CO₂: добавь соды NaHCO₃.', 'CO₂ is limiting now: add baking soda (NaHCO₃).'),
    temp: c.t > 30 ? L('Слишком жарко: ферменты разрушаются (денатурация).', 'Too hot: the enzymes are breaking down (denaturing).') : L('Слишком холодно: ферменты работают медленно.', 'Too cold: the enzymes work slowly.'),
  };

  // chart of the measurements against the chosen variable
  const pts = rows.map((row) => [axis === 'd' ? row.d : axis === 'co2' ? row.co2 : row.t, row.bubbles] as [number, number]);
  const range: Record<Axis, [number, number]> = { d: [10, 50], co2: [0, 2], t: [0, 50] };
  const [x0, x1] = range[axis];
  const CW = 300;
  const CH = 170;
  const PX = (v: number) => 34 + ((v - x0) / (x1 - x0)) * (CW - 44);
  const PY = (v: number) => 10 + (1 - v / MAX_BUBBLES) * (CH - 34);

  const slider = (label: string, value: number, min: number, max: number, step: number, unit: string, on: (v: number) => void) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-ink-2">
        <span>{label}</span>
        <span className="font-mono text-ink">
          {value} {unit}
        </span>
      </span>
      <RangeSlider value={value} onChange={(v) => on(v)} min={min} max={max} step={step} />
    </label>
  );

  useScreenDetail(
    'lab',
    `Условия: лампа на ${c.d} см, свет ${c.color}, NaHCO₃ ${c.co2}%, вода ${c.t} °C. Скорость ≈ ${Math.round(r * MAX_BUBBLES)} пузырьков/мин. Факторы (доля от максимума): свет ${Math.round(f.light * 100)}%, CO₂ ${Math.round(f.co2 * 100)}%, температура ${Math.round(f.temp * 100)}%; ограничивает: ${lim ?? 'ничего'}. Измерений в журнале: ${rows.length}.`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Фотосинтез: от чего зависит его скорость', 'Photosynthesis: what controls its rate')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('Веточка элодеи в воде на свету выделяет кислород — пузырьки. Чем быстрее фотосинтез, тем чаще они идут. Меняй свет, CO₂ и температуру, измеряй число пузырьков за минуту и строй график, как в настоящей лабораторной.', 'A sprig of pondweed in water gives off oxygen bubbles in the light. The faster photosynthesis goes, the more bubbles. Change light, CO₂ and temperature, count bubbles per minute and plot them, as in a real lab.')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#1F2126] bg-[#0F1115] overflow-hidden">
            <svg viewBox="0 0 400 250" className="w-full" aria-label={L('Элодея под лампой', 'Pondweed under a lamp')}>
              <defs>
                <linearGradient id="beam" x1="0" x2="1">
                  <stop offset="0" stopColor={light} stopOpacity={0.55 * illuminance(c.d) + 0.08} />
                  <stop offset="1" stopColor={light} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7FB8E6" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#3E7BB6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* ruler */}
              <line x1="20" x2="200" y1="236" y2="236" stroke="#3A3F4A" />
              {[50, 40, 30, 20, 10].map((d) => {
                const x = 20 + ((d - 10) / 40) * 110;
                const xx = 150 - (x - 20);
                return (
                  <g key={d}>
                    <line x1={xx} x2={xx} y1="232" y2="240" stroke="#3A3F4A" />
                    <text x={xx} y="249" fontSize="8" textAnchor="middle" fill="#6B7180">
                      {d}
                    </text>
                  </g>
                );
              })}
              {/* light beam */}
              <polygon points={`${150 - (lampX - 20) + 14},${110} 320,60 320,220 ${150 - (lampX - 20) + 14},${150}`} fill="url(#beam)" />
              {/* lamp */}
              <g transform={`translate(${150 - (lampX - 20)} 130)`}>
                <rect x="-22" y="-26" width="18" height="52" rx="4" fill="#2C2F36" />
                <path d="M-4 -26 L14 -34 L14 34 L-4 26 Z" fill="#4A4F5A" />
                <ellipse cx="14" cy="0" rx="4" ry="32" fill={light} />
                <line x1="-13" y1="26" x2="-13" y2="104" stroke="#2C2F36" strokeWidth="4" />
              </g>
              {/* beaker */}
              <rect x="190" y="60" width="96" height="170" rx="6" fill="url(#water)" stroke="#9AA3B2" strokeWidth="2" />
              {/* test tube */}
              <rect x="222" y="40" width="28" height="160" rx="12" fill="#0E2A44" fillOpacity="0.55" stroke="#C9D3E0" strokeWidth="1.5" />
              {/* elodea */}
              <g stroke="#2E8B57" strokeWidth="2.5" fill="#3DAA6A">
                <path d="M236 196 C 234 185, 238 175, 236 162" fill="none" />
                {[190, 182, 174, 167].map((y, i) => (
                  <g key={y}>
                    <ellipse cx={236 - 7} cy={y} rx="7" ry="2.6" transform={`rotate(${-25 + i * 4} ${236} ${y})`} />
                    <ellipse cx={236 + 7} cy={y - 2} rx="7" ry="2.6" transform={`rotate(${25 - i * 4} ${236} ${y - 2})`} />
                  </g>
                ))}
              </g>
              {bubbles.map((b, i) => (
                <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#FFFFFF" fillOpacity="0.35" stroke="#FFFFFF" strokeWidth="1.1" />
              ))}
              {/* thermometer */}
              <rect x="300" y="70" width="8" height="120" rx="4" fill="#E8ECF2" fillOpacity="0.15" stroke="#9AA3B2" />
              <rect x="302" y={70 + 116 * (1 - c.t / 50)} width="4" height={116 * (c.t / 50) + 2} rx="2" fill="#E5484D" />
              <circle cx="304" cy="194" r="7" fill="#E5484D" />
              <text x="316" y="80" fontSize="11" fill="#C9CFDB" fontFamily="JetBrains Mono, monospace">
                {c.t}°C
              </text>
              <text x="316" y="110" fontSize="10" fill="#8C8F98">
                NaHCO₃
              </text>
              <text x="316" y="124" fontSize="11" fill="#C9CFDB" fontFamily="JetBrains Mono, monospace">
                {c.co2}%
              </text>
              <text x="20" y="20" fontSize="11" fill="#C9CFDB">
                {L('расстояние до лампы, см', 'lamp distance, cm')}
              </text>
              {measuring && (
                <g>
                  <rect x="290" y="14" width="100" height="26" rx="6" fill="#2F5BFF" />
                  <text x="340" y="31" fontSize="12" textAnchor="middle" fill="#fff" fontFamily="JetBrains Mono, monospace">
                    {measuring.count} · {Math.round(progressPct * 60)} {L('с', 's')}
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button className="text-sm font-medium" onPress={() => setMeasuring({ start: performance.now(), count: 0 })} isDisabled={!!measuring}>
              <Timer className="w-4 h-4" />
              {measuring ? L('Считаем пузырьки…', 'Counting bubbles…') : L('Измерить за 1 минуту', 'Measure for 1 minute')}
            </Button>
            <span className="text-sm text-ink-2">
              {L('Скорость сейчас', 'Rate now')}: <b className="font-mono text-ink">≈ {Math.round(r * MAX_BUBBLES)}</b> {L('пузырьков/мин', 'bubbles/min')}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Журнал измерений', 'Measurements')}</h3>
                {rows.length > 0 && (
                  <Button variant="ghost" onPress={() => setRows([])} aria-label={L('Очистить', 'Clear')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {rows.length === 0 ? (
                <p className="text-sm text-ink-3">{L('Пока пусто. Измерь при разных условиях — например, лампа на 10, 20, 30 и 40 см.', 'Empty so far. Measure under different conditions, e.g. the lamp at 10, 20, 30 and 40 cm.')}</p>
              ) : (
                <table className="w-full text-xs font-mono">
                  <thead className="text-ink-3">
                    <tr>
                      <th className="text-left font-normal">d, {L('см', 'cm')}</th>
                      <th className="text-left font-normal">{L('свет', 'light')}</th>
                      <th className="text-left font-normal">CO₂</th>
                      <th className="text-left font-normal">t</th>
                      <th className="text-right font-normal">{L('пуз/мин', 'bub/min')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink">
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.d}</td>
                        <td>
                          <span className="inline-block w-2.5 h-2.5 rounded-full align-middle" style={{ background: COLOR_HEX[row.color], border: '1px solid #ccc' }} />
                        </td>
                        <td>{row.co2}%</td>
                        <td>{row.t}°</td>
                        <td className="text-right font-semibold">{row.bubbles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex p-0.5 rounded-lg bg-muted border border-line text-xs mb-2">
                {(
                  [
                    ['d', L('Расстояние', 'Distance')],
                    ['co2', 'CO₂'],
                    ['t', L('Температура', 'Temperature')],
                  ] as const
                ).map(([k, label]) => (
                  <Button variant={axis === k ? 'outline' : 'ghost'} size="sm" className={`flex-1 ${axis === k ? 'font-medium' : ''}`} key={k} onPress={() => setAxis(k)}>
                    {label}
                  </Button>
                ))}
              </div>
              <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full">
                {[0, 30, 60].map((v) => (
                  <g key={v}>
                    <line x1={34} x2={CW - 10} y1={PY(v)} y2={PY(v)} stroke="#EEEEEA" />
                    <text x={28} y={PY(v) + 3} fontSize="9" textAnchor="end" fill="#8C8F98">
                      {v}
                    </text>
                  </g>
                ))}
                {[x0, (x0 + x1) / 2, x1].map((v) => (
                  <text key={v} x={PX(v)} y={CH - 12} fontSize="9" textAnchor="middle" fill="#8C8F98">
                    {v}
                    {axis === 'd' ? ' см' : axis === 'co2' ? '%' : '°'}
                  </text>
                ))}
                {[...pts]
                  .sort((a, b) => a[0] - b[0])
                  .map(([x, y], i, arr) => (i ? <line key={'l' + i} x1={PX(arr[i - 1][0])} y1={PY(arr[i - 1][1])} x2={PX(x)} y2={PY(y)} stroke="#30A46C" strokeWidth="1.5" /> : null))}
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={PX(x)} cy={PY(y)} r="4" fill="#30A46C" />
                ))}
              </svg>
              <p className="text-[11px] text-ink-3">{L('Меняй только одно условие за раз — иначе график ничего не покажет.', 'Change one condition at a time, or the graph shows nothing.')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Условия опыта', 'Conditions')}</h3>
            {slider(L('Расстояние до лампы', 'Lamp distance'), c.d, 10, 50, 5, L('см', 'cm'), (d) => setC({ ...c, d }))}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-ink-2">{L('Светофильтр', 'Light filter')}</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['white', 'red', 'blue', 'green'] as LightColor[]).map((col) => (
                  <button key={col} onClick={() => setC({ ...c, color: col })} className={`h-8 rounded-lg border text-xs cursor-pointer ${c.color === col ? 'border-accent ring-2 ring-accent/30' : 'border-line'}`} style={{ background: COLOR_HEX[col] + '55' }}>
                    {{ white: L('белый', 'white'), red: L('красный', 'red'), blue: L('синий', 'blue'), green: L('зелёный', 'green') }[col]}
                  </button>
                ))}
              </div>
            </div>
            {slider(L('Сода NaHCO₃ (источник CO₂)', 'Baking soda NaHCO₃ (CO₂ source)'), c.co2, 0, 2, 0.1, '%', (co2) => setC({ ...c, co2: Math.round(co2 * 10) / 10 }))}
            {slider(L('Температура воды', 'Water temperature'), c.t, 0, 50, 1, '°C', (t) => setC({ ...c, t }))}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Что ограничивает скорость', 'What limits the rate')}</h3>
            {(
              [
                ['light', L('Свет', 'Light'), f.light, '#F5A524'],
                ['co2', 'CO₂', f.co2, '#5B8CFF'],
                ['temp', L('Температура (ферменты)', 'Temperature (enzymes)'), f.temp, '#E5484D'],
              ] as const
            ).map(([k, label, v, color]) => (
              <div key={k}>
                <div className="flex justify-between text-xs">
                  <span className={lim === k ? 'font-semibold text-ink' : 'text-ink-2'}>
                    {label}
                    {lim === k && ` — ${L('ограничивает', 'limiting')}`}
                  </span>
                  <span className="font-mono text-ink-3">{Math.round(v * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(v * 100)}%`, background: color }} />
                </div>
              </div>
            ))}
            <p className="text-sm text-ink mt-1">{lim ? LIM_TEXT[lim] : L('Все условия близки к лучшим — скорость почти максимальная.', 'Everything is near its best: the rate is close to maximum.')}</p>
            {c.color === 'green' && <p className="text-xs text-ink-2">{L('Зелёный свет хлорофилл почти не поглощает, а отражает — поэтому листья зелёные.', 'Chlorophyll barely absorbs green light, it reflects it; that is why leaves look green.')}</p>}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm text-ink-2 flex flex-col gap-2">
            <div className="text-center overflow-x-auto text-ink">
              <Formula tex="6\mathrm{CO_2} + 6\mathrm{H_2O} \xrightarrow{\text{свет, хлорофилл}} \mathrm{C_6H_{12}O_6} + 6\mathrm{O_2}" display />
            </div>
            <p>{L('Освещённость падает как 1/d²: отодвинь лампу вдвое — света станет в 4 раза меньше.', 'Illuminance falls as 1/d²: move the lamp twice as far and the light drops 4 times.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoLab;
