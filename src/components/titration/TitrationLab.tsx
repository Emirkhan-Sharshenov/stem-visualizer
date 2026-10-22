import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Droplet, Pause, Play, RotateCcw, Target } from 'lucide-react';
import { AnalyteId, ANALYTES, INDICATORS, IndicatorId, pH, solutionColor } from './titration';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';

const VA = 20; // mL of analyte in the flask (pipette)
const CT = 0.1; // titrant, mol/L
const BURETTE = 50; // mL
const DROP = 0.05; // mL

const randomConc = () => Math.round((0.06 + Math.random() * 0.09) * 1000) / 1000;

export const TitrationLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [analyteId, setAnalyteId] = useState<AnalyteId>('HCl');
  const [indicatorId, setIndicatorId] = useState<IndicatorId>('phenolphthalein');
  const [ca, setCa] = useState(0.1);
  const [task, setTask] = useState<number | null>(null);
  const [vt, setVt] = useState(0);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [flow, setFlow] = useState(false);
  const [rate, setRate] = useState(1);
  const [theory, setTheory] = useState(false);
  const [guess, setGuess] = useState('');
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const [flash, setFlash] = useState(0);
  const [dropKey, setDropKey] = useState(0);
  const an = ANALYTES.find((a) => a.id === analyteId)!;
  const ind = INDICATORS.find((i) => i.id === indicatorId)!;
  const conc = task ?? ca;
  const ph = pH(an, conc, VA, CT, vt);
  const veq = (conc * VA) / CT;

  useEffect(() => progress.recordLab('sandbox-titration'), []);

  const reset = (keepTask = false) => {
    setVt(0);
    setPoints([]);
    setFlow(false);
    setVerdict(null);
    setGuess('');
    if (!keepTask) setTask(null);
  };
  useEffect(() => reset(true), [analyteId, ca, task]); // eslint-disable-line react-hooks/exhaustive-deps

  const vtRef = useRef(vt);
  vtRef.current = vt;
  const add = (ml: number) => {
    const next = Math.min(BURETTE, Math.round((vtRef.current + ml) * 1000) / 1000);
    vtRef.current = next;
    setVt(next);
    setPoints((p) => [...p, [next, pH(an, conc, VA, CT, next)]]);
    setDropKey((k) => k + 1);
    setFlash(1);
  };

  // open stopcock: a steady stream of drops
  const live = useRef({ rate, add });
  live.current = { rate, add };
  useEffect(() => {
    if (!flow) return;
    const id = setInterval(() => live.current.add(DROP * live.current.rate * 2), 100);
    return () => clearInterval(id);
  }, [flow]);
  useEffect(() => {
    if (vt >= BURETTE) setFlow(false);
  }, [vt]);
  // a drop of titrant briefly colours the spot where it lands
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(0), 450);
    return () => clearTimeout(id);
  }, [flash, dropKey]);

  const curve = useMemo(() => Array.from({ length: 201 }, (_, i) => [(i / 200) * BURETTE, pH(an, conc, VA, CT, (i / 200) * BURETTE)] as [number, number]), [an, conc]);

  // chart geometry
  const CW = 520;
  const CH = 300;
  const PX = (v: number) => 40 + (v / BURETTE) * (CW - 56);
  const PY = (p: number) => 12 + ((14 - p) / 14) * (CH - 40);
  const path = (pts: [number, number][]) => pts.map(([v, p], i) => `${i ? 'L' : 'M'}${PX(v).toFixed(1)},${PY(p).toFixed(1)}`).join(' ');

  const color = solutionColor(ind, ph);
  const spot = solutionColor(ind, pH(an, conc, VA, CT, vt + 1.5));
  const level = 1 - vt / BURETTE;
  const passed = vt >= veq;

  const weak = an.K < 1;
  const explain = an.kind === 'acid'
    ? weak
      ? L('Слабая кислота: в точке эквивалентности получается соль CH₃COONa, она гидролизуется — среда щелочная (pH ≈ 8,7). Поэтому нужен фенолфталеин. На половине пути pH = pKa = 4,75.', 'Weak acid: at equivalence the salt CH₃COONa hydrolyses, so the solution is basic (pH ≈ 8.7). Use phenolphthalein. Halfway, pH = pKa = 4.75.')
      : L('Сильная кислота и сильное основание: в точке эквивалентности только NaCl и вода, pH = 7. Возле неё pH прыгает на 6 единиц от одной капли — это «скачок титрования».', 'Strong acid and strong base: at equivalence there is only NaCl and water, pH = 7. Near it a single drop moves pH by 6 units: the titration jump.')
    : weak
      ? L('Слабое основание: соль NH₄Cl в точке эквивалентности даёт кислую среду (pH ≈ 5,3). Подходит метиловый оранжевый.', 'Weak base: the salt NH₄Cl makes the solution acidic at equivalence (pH ≈ 5.3). Use methyl orange.')
      : L('Сильное основание титруем соляной кислотой: в точке эквивалентности pH = 7, скачок от 10 до 4.', 'A strong base titrated with HCl: pH = 7 at equivalence, with a jump from 10 to 4.');

  const check = () => {
    const g = parseFloat(guess.replace(',', '.'));
    if (!task || !isFinite(g)) return;
    setVerdict(Math.abs(g - task) / task <= 0.03);
  };

  const sel = 'h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink cursor-pointer max-w-full';

  useScreenDetail(
    'lab',
    `Состояние опыта: в колбе ${VA} мл — ${an.name.ru}${task !== null ? ' НЕИЗВЕСТНОЙ концентрации (ученик решает задачу «найди c» — саму концентрацию и объём эквивалентности не называй, помогай методом)' : `, c = ${ca} моль/л`}. Титрант: 0,1 М ${an.titrant.name.ru}. Индикатор: ${ind.name.ru} (переход при pH ${ind.range[0]}–${ind.range[1]}). Добавлено ${vt.toFixed(2)} мл, pH = ${ph.toFixed(2)}.${task === null ? (passed ? ` Точка эквивалентности пройдена (${veq.toFixed(1)} мл).` : ' До точки эквивалентности ещё не дошли.') : ''}`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Кислотно-основное титрование', 'Acid–base titration')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('Капай раствор из бюретки в колбу и следи за цветом индикатора и графиком pH. Момент, когда кислоты и щёлочи поровну, — точка эквивалентности. По объёму, который ушёл, находят концентрацию.', 'Drip the solution from the burette and watch the indicator and the pH curve. When acid and base are in equal amounts you reach the equivalence point; the volume used gives the concentration.')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select className={sel} value={analyteId} onChange={(e) => setAnalyteId(e.target.value as AnalyteId)}>
          {ANALYTES.map((a) => (
            <option key={a.id} value={a.id}>
              {L('В колбе: ', 'Flask: ')}
              {a.name[lang]}
            </option>
          ))}
        </select>
        <select className={sel} value={indicatorId} onChange={(e) => setIndicatorId(e.target.value as IndicatorId)}>
          {INDICATORS.map((i) => (
            <option key={i.id} value={i.id}>
              {L('Индикатор: ', 'Indicator: ')}
              {i.name[lang]}
            </option>
          ))}
        </select>
        {task === null ? (
          <select className={sel} value={ca} onChange={(e) => setCa(Number(e.target.value))}>
            {[0.05, 0.1, 0.15, 0.2].map((c) => (
              <option key={c} value={c}>
                c = {c} {L('моль/л', 'mol/L')}
              </option>
            ))}
          </select>
        ) : (
          <span className="h-9 px-3 rounded-lg bg-[#FFF4DA] text-[#8A4B0F] text-sm inline-flex items-center">c = ? {L('моль/л', 'mol/L')}</span>
        )}
        <button
          onClick={() => setTask(task === null ? randomConc() : null)}
          className={`h-9 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 cursor-pointer ${task !== null ? 'bg-[#FFE7B3] border-[#F3D9A4] text-[#8A4B0F]' : 'border-line bg-surface text-ink hover:bg-muted'}`}
        >
          <Target className="w-4 h-4" />
          {task === null ? L('Задача: неизвестная концентрация', 'Task: unknown concentration') : L('Выйти из задачи', 'Leave the task')}
        </button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4 items-start">
        {/* burette and flask */}
        <div className="rounded-xl border border-[#1F2126] bg-[#0F1115] p-3 flex justify-center">
          <svg viewBox="0 0 240 420" className="w-full max-w-[160px] lg:max-w-[240px]" aria-label={L('Бюретка и колба', 'Burette and flask')}>
            <defs>
              <clipPath id="flask">
                <path d="M100 250 V290 L52 384 Q46 398 62 398 H178 Q194 398 188 384 L140 290 V250 Z" />
              </clipPath>
              <linearGradient id="glass" x1="0" x2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.03" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            {/* stand */}
            <rect x="196" y="10" width="6" height="400" rx="2" fill="#2C2F36" />
            <rect x="120" y="60" width="80" height="6" rx="2" fill="#2C2F36" />
            {/* burette */}
            <rect x="112" y="10" width="16" height="200" rx="3" fill="url(#glass)" stroke="#8A8F99" strokeWidth="1.2" />
            <rect x="114" y={12 + (1 - level) * 196} width="12" height={level * 196} fill={an.kind === 'acid' ? '#9CC7FF' : '#C9F2D9'} opacity="0.55" />
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line x1="112" x2={i % 2 ? 118 : 121} y1={12 + i * 19.6} y2={12 + i * 19.6} stroke="#C9CFDB" strokeWidth="0.8" />
                {i % 2 === 0 && (
                  <text x="106" y={15 + i * 19.6} fontSize="8" fill="#8C8F98" textAnchor="end" fontFamily="JetBrains Mono, monospace">
                    {i * 5}
                  </text>
                )}
              </g>
            ))}
            <rect x="108" y="212" width="24" height="9" rx="2" fill={flow ? '#30A46C' : '#5B5F68'} />
            <path d="M117 221 H123 L121 240 H119 Z" fill="url(#glass)" stroke="#8A8F99" strokeWidth="1" />
            {/* falling drop */}
            <circle key={dropKey} cx="120" cy="244" r="3" fill={an.kind === 'acid' ? '#9CC7FF' : '#C9F2D9'} className="animate-[drop_0.45s_ease-in_forwards]" />
            {/* flask */}
            <g clipPath="url(#flask)">
              <rect x="40" y="330" width="160" height="80" fill="#DCEBF5" opacity="0.22" />
              <rect x="40" y="330" width="160" height="80" fill={color} style={{ transition: 'fill 0.4s' }} />
              <ellipse cx="120" cy="336" rx="22" ry="7" fill={spot} opacity={flash ? 0.9 : 0} style={{ transition: 'opacity 0.45s' }} />
            </g>
            <path d="M100 250 V290 L52 384 Q46 398 62 398 H178 Q194 398 188 384 L140 290 V250" fill="url(#glass)" stroke="#B5B8C0" strokeWidth="2" />
            <rect x="96" y="246" width="48" height="6" rx="2" fill="#B5B8C0" />
            {/* stirrer */}
            <rect x="50" y="402" width="140" height="12" rx="3" fill="#2C2F36" />
            <text x="120" y="320" fontSize="11" fill="#C9CFDB" textAnchor="middle" fontFamily="Inter, sans-serif">
              {VA} {L('мл', 'mL')}
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="grid grid-cols-3 gap-2">
            {[
              [L('Добавлено', 'Added'), `${vt.toFixed(2)} ${L('мл', 'mL')}`],
              ['pH', ph.toFixed(2)],
              [L('Среда', 'Medium'), ph < 6.5 ? L('кислая', 'acidic') : ph > 7.5 ? L('щелочная', 'basic') : L('нейтральная', 'neutral')],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface border border-line rounded-xl px-3 py-2">
                <div className="text-[11px] text-ink-3">{k}</div>
                <div className="font-mono text-base sm:text-lg text-ink truncate">{v}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => add(DROP)} disabled={vt >= BURETTE} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer disabled:opacity-50">
              <Droplet className="w-4 h-4" />
              {L('1 капля', '1 drop')}
            </button>
            {[0.5, 1, 5].map((ml) => (
              <button key={ml} onClick={() => add(ml)} disabled={vt >= BURETTE} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink hover:bg-muted cursor-pointer disabled:opacity-50">
                +{ml} {L('мл', 'mL')}
              </button>
            ))}
            <button onClick={() => setFlow(!flow)} disabled={vt >= BURETTE} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50" style={{ color: '#fff' }}>
              {flow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {flow ? L('Закрыть кран', 'Close tap') : L('Открыть кран', 'Open tap')}
            </button>
            <button onClick={() => reset(true)} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              {L('Заново', 'Restart')}
            </button>
          </div>
          <label className="flex items-center gap-3 text-xs text-ink-2">
            {L('Скорость крана', 'Tap speed')}
            <input type="range" min={0.2} max={4} step={0.2} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="flex-1 max-w-[200px] accent-accent cursor-pointer" />
          </label>

          <div className="bg-surface border border-line rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Кривая титрования', 'Titration curve')}</h3>
              <label className="inline-flex items-center gap-1.5 text-xs text-ink-2 cursor-pointer">
                <input type="checkbox" checked={theory} onChange={(e) => setTheory(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
                {L('теория', 'theory')}
              </label>
            </div>
            <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full">
              {/* indicator range */}
              <rect x={40} width={CW - 56} y={PY(ind.range[1])} height={PY(ind.range[0]) - PY(ind.range[1])} fill="#2F5BFF" opacity="0.07" />
              {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((p) => (
                <g key={p}>
                  <line x1={40} x2={CW - 16} y1={PY(p)} y2={PY(p)} stroke={p === 7 ? '#C9CDD3' : '#EEEEEA'} strokeDasharray={p === 7 ? '4 4' : undefined} />
                  <text x={34} y={PY(p) + 3} fontSize="10" textAnchor="end" fill="#8C8F98" fontFamily="JetBrains Mono, monospace">
                    {p}
                  </text>
                </g>
              ))}
              {[0, 10, 20, 30, 40, 50].map((v) => (
                <text key={v} x={PX(v)} y={CH - 12} fontSize="10" textAnchor="middle" fill="#8C8F98" fontFamily="JetBrains Mono, monospace">
                  {v}
                </text>
              ))}
              <text x={CW - 16} y={CH - 1} fontSize="10" textAnchor="end" fill="#8C8F98">
                V({an.titrant.tex.replace(/\\mathrm\{|\}/g, '')}), {L('мл', 'mL')}
              </text>
              {theory && <path d={path(curve)} fill="none" stroke="#B5B8C0" strokeWidth="1.5" strokeDasharray="4 4" />}
              {points.length > 0 && <path d={path([[0, pH(an, conc, VA, CT, 0)], ...points])} fill="none" stroke="#2F5BFF" strokeWidth="2.5" />}
              {points.map(([v, p], i) => (i % Math.max(1, Math.floor(points.length / 60)) === 0 ? <circle key={i} cx={PX(v)} cy={PY(p)} r="2.2" fill="#2F5BFF" /> : null))}
              {passed && task === null && (
                <g>
                  <line x1={PX(veq)} x2={PX(veq)} y1={12} y2={CH - 28} stroke="#30A46C" strokeDasharray="3 3" />
                  <circle cx={PX(veq)} cy={PY(pH(an, conc, VA, CT, veq))} r="5" fill="#30A46C" />
                  <text x={PX(veq) + 7} y={PY(pH(an, conc, VA, CT, veq)) - 6} fontSize="11" fill="#1E7A4C" fontWeight="600">
                    {L('точка эквивалентности', 'equivalence point')} · {veq.toFixed(1)} {L('мл', 'mL')}
                  </text>
                </g>
              )}
              <circle cx={PX(vt)} cy={PY(ph)} r="5" fill="#fff" stroke="#2F5BFF" strokeWidth="2.5" />
            </svg>
            <p className="text-[11px] text-ink-3 mt-1">{L(`Синяя полоса — где ${ind.name.ru.toLowerCase()} меняет цвет (pH ${ind.range[0]}–${ind.range[1]}).`, `Blue band: where ${ind.name.en.toLowerCase()} changes colour (pH ${ind.range[0]}–${ind.range[1]}).`)}</p>
          </div>

          {task !== null && (
            <div className="bg-[#FFF8E8] border border-[#F3D9A4] rounded-xl p-4 flex flex-col gap-2">
              <p className="text-sm text-ink">
                {L(`В колбе ${VA} мл раствора неизвестной концентрации. Оттитруй его до смены окраски индикатора и найди c.`, `The flask holds ${VA} mL of unknown concentration. Titrate to the colour change and find c.`)}
              </p>
              <div className="text-center overflow-x-auto">
                <Formula tex={`c_{\\text{кисл}} \\cdot V_{\\text{кисл}} = c_{\\text{щел}} \\cdot V_{\\text{щел}}`} display />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="0,100" inputMode="decimal" className="h-9 w-28 rounded-lg border border-line bg-surface px-3 text-sm font-mono text-ink outline-none focus:border-accent" />
                <span className="text-sm text-ink-2">{L('моль/л', 'mol/L')}</span>
                <button onClick={check} className="h-9 px-3 rounded-lg bg-accent text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
                  <Check className="w-4 h-4" />
                  {L('Проверить', 'Check')}
                </button>
              </div>
              {verdict !== null && (
                <p className={`text-sm font-medium ${verdict ? 'text-[#1E7A4C]' : 'text-[#B42318]'}`}>
                  {verdict
                    ? L(`Верно! c = ${task.toFixed(3)} моль/л (эквивалентность при ${veq.toFixed(2)} мл).`, `Correct! c = ${task.toFixed(3)} mol/L (equivalence at ${veq.toFixed(2)} mL).`)
                    : L('Пока не то. Найди объём, при котором меняется цвет, и подставь в формулу.', 'Not yet. Find the volume where the colour changes and use the formula.')}
                </p>
              )}
            </div>
          )}

          <div className="bg-surface border border-line rounded-xl p-4 text-sm text-ink-2 flex flex-col gap-2">
            <div className="text-center overflow-x-auto text-ink">
              <Formula tex={`${an.tex} + ${an.titrant.tex} \\rightarrow ${an.kind === 'acid' ? (weak ? '\\mathrm{CH_3COONa}' : '\\mathrm{NaCl}') : weak ? '\\mathrm{NH_4Cl}' : '\\mathrm{NaCl}'} + \\mathrm{H_2O}`} display />
            </div>
            <p>{explain}</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes drop { from { transform: translateY(0); opacity: 1 } to { transform: translateY(90px); opacity: 0 } }`}</style>
    </div>
  );
};

export default TitrationLab;
