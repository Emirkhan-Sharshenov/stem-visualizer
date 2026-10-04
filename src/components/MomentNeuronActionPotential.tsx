import React, { useEffect, useRef, useState } from 'react';
import { InfoCard, Legend, Metric, Panel, Segmented, Slider, Tip, Toggle } from './lab/LabUI';

interface MomentNeuronActionPotentialProps {
  lang: 'ru' | 'en';
}

type View = 'neuron' | 'membrane';
interface Info { title: { ru: string; en: string }; text: { ru: string; en: string } }

const REST = -70;
const THRESHOLD = -55;
const AXON_START = 228;
const AXON_END = 640;
const AXON_Y = 200;
const NODE_SPACING = 69;
const ELECTRODE_X = 434;
const MS_PER_SECOND = 2.6; // simulation slowed so a 1 ms spike is visible
const UNMYELINATED_PX_PER_MS = 45;
const MYELIN_MS_PER_NODE = 0.35;
const REFRACTORY_MS = 3.5;

const INFO: Record<string, Info> = {
  dendrite: { title: { ru: 'Дендриты', en: 'Dendrites' }, text: { ru: 'Ветвистые «антенны». Принимают сигналы от тысяч других нейронов и передают их к телу клетки.', en: 'Branching antennae that collect signals from thousands of other neurons and pass them to the cell body.' } },
  soma: { title: { ru: 'Тело нейрона', en: 'Cell body (soma)' }, text: { ru: 'Здесь ядро и вся «фабрика» клетки. Сюда сходятся сигналы с дендритов и складываются.', en: 'Holds the nucleus and the cell’s machinery. Signals from the dendrites add up here.' } },
  hillock: { title: { ru: 'Аксонный холмик', en: 'Axon hillock' }, text: { ru: 'Точка принятия решения. Если заряд здесь поднимется выше порога −55 мВ, родится импульс. Если нет — ничего не произойдёт.', en: 'The decision point. If the charge here passes the −55 mV threshold, a spike is born. If not, nothing happens.' } },
  myelin: { title: { ru: 'Миелиновая оболочка', en: 'Myelin sheath' }, text: { ru: 'Жировая изоляция из клеток-помощников. Импульс перепрыгивает под ней от перехвата к перехвату — до 100 м/с.', en: 'Fatty insulation from helper cells. The signal jumps beneath it from node to node, up to 100 m/s.' } },
  node: { title: { ru: 'Перехват Ранвье', en: 'Node of Ranvier' }, text: { ru: 'Промежуток без миелина, где густо сидят натриевые каналы. Именно здесь импульс «перезаряжается».', en: 'A gap in the myelin packed with sodium channels, where the signal is regenerated.' } },
  axon: { title: { ru: 'Аксон', en: 'Axon' }, text: { ru: 'Длинный «провод» нейрона. У человека бывает длиной больше метра — от спинного мозга до пальцев ног.', en: 'The neuron’s long cable. In humans some are over a metre long, from the spinal cord to the toes.' } },
  terminal: { title: { ru: 'Окончания аксона', en: 'Axon terminals' }, text: { ru: 'Когда импульс доходит сюда, кальций запускает выброс медиатора из пузырьков в синаптическую щель.', en: 'When the spike arrives, calcium triggers vesicles to release neurotransmitter into the synaptic cleft.' } },
  synapse: { title: { ru: 'Синапс', en: 'Synapse' }, text: { ru: 'Щель шириной около 20 нм между нейронами. Электрический сигнал превращается в химический и обратно.', en: 'A gap about 20 nm wide between neurons, where the electrical signal turns chemical and back again.' } },
  vesicle: { title: { ru: 'Пузырёк с медиатором', en: 'Synaptic vesicle' }, text: { ru: 'Капсула с тысячами молекул медиатора, например ацетилхолина или дофамина.', en: 'A capsule holding thousands of neurotransmitter molecules such as acetylcholine or dopamine.' } },
  receptor: { title: { ru: 'Рецепторы', en: 'Receptors' }, text: { ru: 'Белки на следующем нейроне. Медиатор садится на них, как ключ в замок, и открывает каналы.', en: 'Proteins on the next neuron. The neurotransmitter fits like a key and opens channels.' } },
  electrode: { title: { ru: 'Электрод', en: 'Electrode' }, text: { ru: 'Измеряет заряд мембраны в этой точке. Его показания и рисует осциллограф под схемой.', en: 'Measures the membrane charge here. The oscilloscope below plots its readings.' } },
  na: { title: { ru: 'Натриевый канал Na⁺', en: 'Sodium channel Na⁺' }, text: { ru: 'Открывается первым, когда заряд доходит до порога. Na⁺ врывается внутрь, и мембрана перезаряжается до +30 мВ.', en: 'Opens first when the threshold is reached. Na⁺ rushes in and flips the membrane to +30 mV.' } },
  k: { title: { ru: 'Калиевый канал K⁺', en: 'Potassium channel K⁺' }, text: { ru: 'Открывается с задержкой. K⁺ выходит наружу и возвращает заряд вниз — даже чуть ниже покоя.', en: 'Opens with a delay. K⁺ flows out and brings the charge back down, even slightly below rest.' } },
  pump: { title: { ru: 'Na⁺/K⁺-насос', en: 'Na⁺/K⁺ pump' }, text: { ru: 'Тратит ATP: выкачивает 3 Na⁺ наружу и закачивает 2 K⁺ внутрь. Так он держит заряд покоя −70 мВ.', en: 'Spends ATP to push 3 Na⁺ out and pull 2 K⁺ in, keeping the resting charge at −70 mV.' } },
  naIon: { title: { ru: 'Ион натрия Na⁺', en: 'Sodium ion Na⁺' }, text: { ru: 'Снаружи клетки натрия примерно в 10 раз больше, чем внутри.', en: 'There’s about 10 times more sodium outside the cell than inside.' } },
  kIon: { title: { ru: 'Ион калия K⁺', en: 'Potassium ion K⁺' }, text: { ru: 'Внутри клетки калия примерно в 30 раз больше, чем снаружи.', en: 'There’s about 30 times more potassium inside the cell than outside.' } },
};

// Membrane voltage t ms after the spike is triggered at a point
function spike(t: number) {
  if (t < 0) return REST;
  if (t < 0.5) return THRESHOLD + (35 - THRESHOLD) * Math.sin((t / 0.5) * (Math.PI / 2));
  if (t < 1.5) return 35 - 115 * ((1 - Math.cos(((t - 0.5) / 1.0) * Math.PI)) / 2);
  if (t < 4) return -80 + 10 * ((t - 1.5) / 2.5);
  return REST;
}

function voltageColor(v: number) {
  // rest: cool grey-blue → threshold: amber → peak: red
  const k = Math.max(0, Math.min(1, (v - REST) / (35 - REST)));
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  if (v < REST) return `rgb(${lerp(107, 80, (REST - v) / 10)},${lerp(122, 110, (REST - v) / 10)},${lerp(153, 210, (REST - v) / 10)})`;
  if (k < 0.3) return `rgb(${lerp(107, 245, k / 0.3)},${lerp(122, 196, k / 0.3)},${lerp(153, 81, k / 0.3)})`;
  return `rgb(${lerp(245, 255, (k - 0.3) / 0.7)},${lerp(196, 107, (k - 0.3) / 0.7)},${lerp(81, 107, (k - 0.3) / 0.7)})`;
}

interface Sim {
  time: number; // ms
  fireAt: number | null; // ms when the spike started at the hillock
  stimAt: number | null;
  stimStrength: number;
  trace: number[];
  synapseAt: number | null;
}

export const MomentNeuronActionPotential: React.FC<MomentNeuronActionPotentialProps> = ({ lang }) => {
  const [view, setView] = useState<View>('neuron');
  const [stimulus, setStimulus] = useState(22);
  const [myelin, setMyelin] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<Info | null>(null);
  const [, setFrame] = useState(0);
  const [lastResult, setLastResult] = useState<'fired' | 'weak' | 'refractory' | null>(null);

  const sim = useRef<Sim>({ time: 0, fireAt: null, stimAt: null, stimStrength: 0, trace: [], synapseAt: null });
  const settings = useRef({ myelin, speed });
  settings.current = { myelin, speed };

  const arrival = (x: number, isMyelin: boolean) => {
    const d = Math.max(0, x - AXON_START);
    return isMyelin ? Math.floor(d / NODE_SPACING) * MYELIN_MS_PER_NODE + (d % NODE_SPACING) * 0.0004 : d / UNMYELINATED_PX_PER_MS;
  };

  // Voltage at any point along the neuron at the current time
  const voltageAt = (x: number) => {
    const s = sim.current;
    let v = REST;
    if (s.stimAt !== null && x < AXON_START + 10) {
      // Graded potential spreading from the soma, fading with time and distance
      const dt = s.time - s.stimAt;
      if (dt >= 0) v = Math.max(v, REST + s.stimStrength * Math.exp(-dt / 1.6) * Math.exp(-Math.abs(x - 150) / 260));
    }
    if (s.fireAt !== null) {
      const t = s.time - s.fireAt - arrival(x, settings.current.myelin);
      if (x >= AXON_START - 30) v = t >= 0 && t < 4 ? spike(t) : v;
    }
    return v;
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      s.time += dtReal * MS_PER_SECOND * settings.current.speed;
      s.trace.push(voltageAt(ELECTRODE_X));
      if (s.trace.length > 360) s.trace.shift();
      // Spike reaches the terminals → release transmitter
      if (s.fireAt !== null && s.synapseAt === null && s.time - s.fireAt >= arrival(AXON_END, settings.current.myelin)) s.synapseAt = s.time;
      if (s.synapseAt !== null && s.time - s.synapseAt > 6) s.synapseAt = null;
      setFrame((f) => (f + 1) % 1000000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stimulate = () => {
    const s = sim.current;
    if (s.fireAt !== null && s.time - s.fireAt < REFRACTORY_MS) {
      setLastResult('refractory');
      return;
    }
    s.stimAt = s.time;
    s.stimStrength = stimulus;
    s.synapseAt = null;
    if (REST + stimulus >= THRESHOLD) {
      s.fireAt = s.time + 0.3;
      setLastResult('fired');
    } else {
      setLastResult('weak');
    }
  };

  const s = sim.current;
  const vElectrode = voltageAt(ELECTRODE_X);
  const prev = s.trace.length > 3 ? s.trace[s.trace.length - 4] : REST;
  const phase =
    vElectrode > THRESHOLD && vElectrode > prev ? 'depol' : vElectrode > -69 && vElectrode < prev ? 'repol' : vElectrode < -71 ? 'hyper' : vElectrode > REST + 1 ? 'graded' : 'rest';
  const phaseLabel = {
    rest: { ru: 'Покой', en: 'Resting' },
    graded: { ru: 'Слабое возбуждение', en: 'Graded potential' },
    depol: { ru: 'Деполяризация: Na⁺ входит', en: 'Depolarisation: Na⁺ in' },
    repol: { ru: 'Реполяризация: K⁺ выходит', en: 'Repolarisation: K⁺ out' },
    hyper: { ru: 'Гиперполяризация', en: 'Hyperpolarisation' },
  }[phase];

  const pick = (key: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(INFO[key]);
  };
  const hit = 'cursor-pointer transition-opacity hover:opacity-80';

  const resultText = lastResult && {
    fired: { ru: 'Порог пройден — импульс побежал по аксону. Сила стимула больше не важна: спайк всегда одинаковый.', en: 'Threshold crossed: the spike runs down the axon. A stronger push wouldn’t make it bigger.' },
    weak: { ru: 'Слишком слабо: заряд не дошёл до −55 мВ и угас прямо у тела клетки. Импульса нет.', en: 'Too weak: the charge never reached −55 mV and faded near the cell body. No spike.' },
    refractory: { ru: 'Рефрактерный период: каналы Na⁺ ещё «отдыхают», новый импульс пока невозможен.', en: 'Refractory period: Na⁺ channels are still resetting, so no new spike yet.' },
  }[lastResult];

  const legend = (view === 'neuron'
    ? ['dendrite', 'soma', 'hillock', 'axon', 'myelin', 'node', 'terminal', 'synapse', 'electrode']
    : ['na', 'k', 'pump', 'naIon', 'kIon']
  ).map((k) => ({
    info: INFO[k],
    color: ({ dendrite: '#8E7CF0', soma: '#8E7CF0', hillock: '#B79CFF', axon: '#6B7A99', myelin: '#E8DCC0', node: '#F5C451', terminal: '#F07AA0', synapse: '#F07AA0', electrode: '#A0A3AB', na: '#F5A524', k: '#B79CFF', pump: '#30A46C', naIon: '#F5A524', kIon: '#B79CFF' } as Record<string, string>)[k],
  }));

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="lab-stage relative rounded-xl overflow-hidden" onClick={() => setSelected(null)}>
          {view === 'neuron' ? (
            <NeuronView lang={lang} voltageAt={voltageAt} myelin={myelin} synapseT={s.synapseAt === null ? null : s.time - s.synapseAt} pick={pick} hit={hit} />
          ) : (
            <MembraneView lang={lang} v={vElectrode} rising={vElectrode > prev} time={s.time} pick={pick} hit={hit} />
          )}
          <div className="pointer-events-none absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] font-mono text-[12px]" style={{ color: voltageColor(vElectrode) }}>
            {Math.round(vElectrode)} {lang === 'ru' ? 'мВ' : 'mV'}
          </div>
          <InfoCard lang={lang} info={selected} onClose={() => setSelected(null)} />
        </div>

        <Oscilloscope lang={lang} trace={s.trace} />
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
              { id: 'neuron', label: lang === 'ru' ? 'Нейрон' : 'Neuron' },
              { id: 'membrane', label: lang === 'ru' ? 'Мембрана вблизи' : 'Membrane close-up' },
            ]}
          />
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
            {view === 'neuron'
              ? lang === 'ru'
                ? 'Нажми «Стимулировать». Если заряд у аксонного холмика пройдёт порог, по аксону побежит импульс, а в синапсе выбросится медиатор.'
                : 'Press “Stimulate”. If the charge at the axon hillock passes the threshold, a spike runs down the axon and the synapse releases transmitter.'
              : lang === 'ru'
                ? 'Участок мембраны под электродом. Смотри, как сначала открываются оранжевые каналы Na⁺, а потом фиолетовые K⁺ — и как меняются знаки заряда.'
                : 'The patch of membrane under the electrode. Watch the orange Na⁺ channels open first, then the purple K⁺ ones, and the charges flip.'}
          </p>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4">
            <Slider label={lang === 'ru' ? 'Сила стимула' : 'Stimulus strength'} value={stimulus} min={0} max={30} step={1} format={(v) => `+${v} ${lang === 'ru' ? 'мВ' : 'mV'}`} onChange={setStimulus} />
            <button
              onClick={stimulate}
              className="h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Стимулировать' : 'Stimulate'}
            </button>
            {resultText && <Tip lang={lang}>{resultText[lang]}</Tip>}
            <Toggle label={lang === 'ru' ? 'Миелиновая оболочка' : 'Myelin sheath'} checked={myelin} onChange={setMyelin} />
            <Slider label={lang === 'ru' ? 'Замедление' : 'Playback speed'} value={speed} min={0.25} max={2} step={0.25} format={(v) => `${v}×`} onChange={setSpeed} />
            <div className="grid grid-cols-2 gap-2">
              <Metric label={lang === 'ru' ? 'Состояние' : 'State'} value={<span className="text-[13px] font-sans">{phaseLabel[lang]}</span>} />
              <Metric label={lang === 'ru' ? 'Скорость импульса' : 'Conduction'} value={myelin ? (lang === 'ru' ? '~100 м/с' : '~100 m/s') : (lang === 'ru' ? '~1 м/с' : '~1 m/s')} />
            </div>
          </div>
        </Panel>

        <Panel title={lang === 'ru' ? 'Что на экране' : 'On screen'}>
          <Legend lang={lang} items={legend} selectedTitle={selected?.title.en} onSelect={setSelected} />
        </Panel>
      </aside>
    </div>
  );
};

/* ───────────── Whole neuron ───────────── */

const NeuronView: React.FC<{
  lang: 'ru' | 'en';
  voltageAt: (x: number) => number;
  myelin: boolean;
  synapseT: number | null;
  pick: (k: string) => (e: React.MouseEvent) => void;
  hit: string;
}> = ({ lang, voltageAt, myelin, synapseT, pick, hit }) => {
  const segments = Array.from({ length: Math.ceil((AXON_END - AXON_START) / 4) }, (_, i) => AXON_START + i * 4);
  const nodes = Array.from({ length: Math.floor((AXON_END - AXON_START) / NODE_SPACING) + 1 }, (_, k) => AXON_START + k * NODE_SPACING);
  const somaV = voltageAt(150);
  const terminalV = voltageAt(AXON_END);
  const released = synapseT !== null;
  const glow = (v: number) => Math.max(0, Math.min(1, (v - THRESHOLD) / 60));

  return (
    <svg viewBox="0 0 800 432" className="block w-full h-auto">
      {/* Dendrites */}
      <g className={hit} onClick={pick('dendrite')} stroke="#8E7CF0" strokeLinecap="round" fill="none">
        {[[-1.0, 1], [-0.45, 0.8], [0.15, 1], [0.7, 0.85], [1.25, 1], [2.6, 0.9], [3.2, 0.8], [-2.4, 0.9]].map(([a, l], i) => {
          const x1 = 150 + Math.cos(a + Math.PI) * 44, y1 = 200 + Math.sin(a + Math.PI) * 44;
          const x2 = 150 + Math.cos(a + Math.PI) * 110 * l, y2 = 200 + Math.sin(a + Math.PI) * 110 * l;
          return (
            <g key={i}>
              <path d={`M${x1} ${y1} Q ${(x1 + x2) / 2 + 12} ${(y1 + y2) / 2 - 10} ${x2} ${y2}`} strokeWidth="7" />
              <path d={`M${x2} ${y2} l ${Math.cos(a + Math.PI + 0.5) * 30} ${Math.sin(a + Math.PI + 0.5) * 30}`} strokeWidth="4" />
              <path d={`M${x2} ${y2} l ${Math.cos(a + Math.PI - 0.5) * 26} ${Math.sin(a + Math.PI - 0.5) * 26}`} strokeWidth="4" />
            </g>
          );
        })}
      </g>
      {/* Soma */}
      <g className={hit} onClick={pick('soma')}>
        <circle cx="150" cy="200" r="48" fill="#6B5BD6" stroke={voltageColor(somaV)} strokeWidth={2 + glow(somaV + 15) * 4} />
        <circle cx="146" cy="196" r="17" fill="#3F3496" />
        <circle cx="150" cy="192" r="5" fill="#8E7CF0" />
      </g>
      {/* Hillock */}
      <path d={`M196 184 L ${AXON_START} 194 L ${AXON_START} 206 L 196 216 Z`} fill="#B79CFF" className={hit} onClick={pick('hillock')} />

      {/* Axon core coloured by local voltage */}
      <g className={hit} onClick={pick('axon')}>
        {segments.map((x) => (
          <rect key={x} x={x} y={AXON_Y - 6} width="4.6" height="12" fill={voltageColor(voltageAt(x))} />
        ))}
      </g>
      {/* Myelin and nodes */}
      {myelin &&
        nodes.slice(0, -1).map((x, k) => (
          <g key={x}>
            <rect x={x + 6} y={AXON_Y - 15} width={NODE_SPACING - 12} height="30" rx="14" fill="#E8DCC0" opacity="0.9" className={hit} onClick={pick('myelin')} />
            {k > 0 && <circle cx={x} cy={AXON_Y} r={6 + glow(voltageAt(x)) * 5} fill={voltageColor(voltageAt(x))} className={hit} onClick={pick('node')} />}
          </g>
        ))}

      {/* Terminals */}
      <g className={hit} onClick={pick('terminal')}>
        {[[690, 150], [705, 200], [690, 250]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${AXON_END} ${AXON_Y} Q ${AXON_END + 25} ${(AXON_Y + y) / 2} ${x - 10} ${y}`} stroke={voltageColor(terminalV)} strokeWidth="5" fill="none" />
            <circle cx={x} cy={y} r="11" fill="#F07AA0" stroke={released ? '#FFD1DF' : 'none'} strokeWidth="3" />
          </g>
        ))}
      </g>
      {/* Next neuron's dendrite */}
      <path d="M760 110 Q 735 200 760 290" stroke="#8E7CF0" strokeWidth="14" fill="none" strokeLinecap="round" className={hit} onClick={pick('dendrite')} opacity={released ? 1 : 0.75} />

      {/* Electrode */}
      <g className={hit} onClick={pick('electrode')}>
        <line x1={ELECTRODE_X} y1="120" x2={ELECTRODE_X} y2={AXON_Y - 17} stroke="#C9CCD3" strokeWidth="2" />
        <rect x={ELECTRODE_X - 9} y="100" width="18" height="22" rx="3" fill="#55585F" />
        <text x={ELECTRODE_X} y="92" textAnchor="middle" fontSize="12" fill="#A0A3AB" fontFamily="Inter">{lang === 'ru' ? 'электрод' : 'electrode'}</text>
      </g>

      {/* Synapse close-up */}
      <g className={hit} onClick={pick('synapse')}>
        <line x1="700" y1="262" x2="640" y2="300" stroke="#55585F" strokeDasharray="3 4" />
        <circle cx="580" cy="340" r="68" fill="#17181B" stroke="#55585F" />
        <clipPath id="syn-clip">
          <circle cx="580" cy="340" r="67" />
        </clipPath>
        <g clipPath="url(#syn-clip)">
          <path d="M512 300 Q 580 330 648 300 L 648 272 L 512 272 Z" fill="#F07AA0" opacity="0.85" />
          <path d="M512 372 Q 580 352 648 372 L 648 410 L 512 410 Z" fill="#8E7CF0" opacity="0.85" />
          {[[556, 296], [580, 290], [604, 296]].map(([x, y], i) => {
            const fuse = released ? Math.min(1, synapseT! / 0.8) : 0;
            return <circle key={i} cx={x} cy={y + fuse * 16} r={8 - fuse * 3} fill="#FFD1DF" stroke="#C9567E" onClick={pick('vesicle')} />;
          })}
          {[548, 566, 584, 602, 620].map((x) => (
            <rect key={x} x={x - 4} y="358" width="8" height="8" rx="2" fill="#30A46C" onClick={pick('receptor')} />
          ))}
          {released &&
            Array.from({ length: 18 }).map((_, i) => {
              const t = Math.min(1, Math.max(0, (synapseT! - 0.6 - (i % 6) * 0.1) / 1.6));
              const x = 548 + (i * 37) % 76;
              return t > 0 && t < 1 ? <circle key={i} cx={x + Math.sin(i + t * 6) * 4} cy={312 + t * 46} r="2.6" fill="#FFE08A" /> : null;
            })}
        </g>
        <text x="580" y="426" textAnchor="middle" fontSize="12" fill="#A0A3AB" fontFamily="Inter">{lang === 'ru' ? 'синапс крупно' : 'synapse close-up'}</text>
      </g>

      <text x="150" y="330" textAnchor="middle" fontSize="12" fill="#A0A3AB" fontFamily="Inter">{lang === 'ru' ? 'тело и дендриты' : 'soma and dendrites'}</text>
    </svg>
  );
};

/* ───────────── Membrane close-up ───────────── */

const MembraneView: React.FC<{
  lang: 'ru' | 'en';
  v: number;
  rising: boolean;
  time: number;
  pick: (k: string) => (e: React.MouseEvent) => void;
  hit: string;
}> = ({ lang, v, rising, time, pick, hit }) => {
  const naOpen = v > THRESHOLD && rising && v < 30;
  const kOpen = !rising && v > -78 && v < 30 && v !== REST;
  const flipped = v > 0;
  const naX = [180, 420];
  const kX = [300, 540];
  const pumpX = 660;
  const ions = Array.from({ length: 40 }, (_, i) => i);

  return (
    <svg viewBox="0 0 800 420" className="block w-full h-auto">
      <text x="24" y="34" fontSize="13" fill="#A0A3AB" fontFamily="Inter">{lang === 'ru' ? 'Снаружи клетки' : 'Outside the cell'}</text>
      <text x="24" y="404" fontSize="13" fill="#A0A3AB" fontFamily="Inter">{lang === 'ru' ? 'Внутри аксона' : 'Inside the axon'}</text>

      {/* Background ions: Na⁺ mostly outside, K⁺ mostly inside */}
      {ions.map((i) => {
        const outside = i < 26;
        const isNa = outside ? i % 5 !== 0 : i % 5 === 0;
        const x = 40 + ((i * 97) % 720) + Math.sin(time * 1.3 + i) * 6;
        const y = outside ? 60 + ((i * 53) % 90) + Math.cos(time * 1.1 + i) * 5 : 280 + ((i * 41) % 90) + Math.cos(time + i) * 5;
        return <Ion key={i} x={x} y={y} na={isNa} onClick={pick(isNa ? 'naIon' : 'kIon')} />;
      })}

      {/* Lipid bilayer */}
      {Array.from({ length: 40 }).map((_, i) => (
        <g key={i}>
          <circle cx={10 + i * 20} cy="180" r="8" fill="#6FB1E8" />
          <line x1={7 + i * 20} y1="188" x2={7 + i * 20} y2="208" stroke="#E8D9B0" strokeWidth="2" />
          <line x1={13 + i * 20} y1="188" x2={13 + i * 20} y2="208" stroke="#E8D9B0" strokeWidth="2" />
          <line x1={7 + i * 20} y1="212" x2={7 + i * 20} y2="232" stroke="#E8D9B0" strokeWidth="2" />
          <line x1={13 + i * 20} y1="212" x2={13 + i * 20} y2="232" stroke="#E8D9B0" strokeWidth="2" />
          <circle cx={10 + i * 20} cy="240" r="8" fill="#6FB1E8" />
        </g>
      ))}

      {/* Charge signs flip during the spike */}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} fontFamily="Inter" fontSize="16" fontWeight="600">
          <text x={60 + i * 62} y="160" textAnchor="middle" fill={flipped ? '#6FB1E8' : '#FF8F8F'}>{flipped ? '−' : '+'}</text>
          <text x={60 + i * 62} y="270" textAnchor="middle" fill={flipped ? '#FF8F8F' : '#6FB1E8'}>{flipped ? '+' : '−'}</text>
        </g>
      ))}

      {/* Sodium channels */}
      {naX.map((x) => (
        <Channel key={x} x={x} color="#F5A524" open={naOpen} label="Na⁺" onClick={pick('na')} hit={hit} flowIn time={time} />
      ))}
      {/* Potassium channels */}
      {kX.map((x) => (
        <Channel key={x} x={x} color="#B79CFF" open={kOpen} label="K⁺" onClick={pick('k')} hit={hit} flowIn={false} time={time} />
      ))}
      {/* Na⁺/K⁺ pump */}
      <g className={hit} onClick={pick('pump')}>
        <rect x={pumpX - 28} y="160" width="56" height="100" rx="18" fill="#30A46C" />
        <text x={pumpX} y="214" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Inter">ATP</text>
        {[0, 1, 2].map((k) => {
          const t = ((time * 0.35 + k / 3) % 1);
          return <Ion key={`pn${k}`} x={pumpX - 10 + k * 10} y={250 - t * 140} na small />;
        })}
        {[0, 1].map((k) => {
          const t = ((time * 0.35 + k / 2 + 0.25) % 1);
          return <Ion key={`pk${k}`} x={pumpX + 14} y={150 + t * 140} na={false} small />;
        })}
      </g>
    </svg>
  );
};

const Ion: React.FC<{ x: number; y: number; na: boolean; small?: boolean; onClick?: (e: React.MouseEvent) => void }> = ({ x, y, na, small, onClick }) => (
  <g transform={`translate(${x} ${y})`} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
    <circle r={small ? 5 : 8} fill={na ? '#F5A524' : '#B79CFF'} />
    {!small && (
      <text y="3.5" textAnchor="middle" fontSize="8.5" fill="#17181B" fontFamily="Inter" fontWeight="600">
        {na ? 'Na' : 'K'}
      </text>
    )}
  </g>
);

const Channel: React.FC<{ x: number; color: string; open: boolean; label: string; onClick: (e: React.MouseEvent) => void; hit: string; flowIn: boolean; time: number }> = ({ x, color, open, label, onClick, hit, flowIn, time }) => {
  const gap = open ? 14 : 2;
  return (
    <g className={hit} onClick={onClick}>
      <rect x={x - 18 - gap / 2} y="164" width="18" height="92" rx="7" fill={color} />
      <rect x={x + gap / 2} y="164" width="18" height="92" rx="7" fill={color} />
      <text x={x} y="154" textAnchor="middle" fontSize="12" fill={color} fontFamily="Inter">{label}</text>
      {open &&
        [0, 1, 2].map((k) => {
          const t = (time * 1.6 + k / 3) % 1;
          const y = flowIn ? 120 + t * 180 : 300 - t * 180;
          return <Ion key={k} x={x + Math.sin(t * 8 + k) * 3} y={y} na={flowIn} small />;
        })}
    </g>
  );
};

/* ───────────── Oscilloscope ───────────── */

const Oscilloscope: React.FC<{ lang: 'ru' | 'en'; trace: number[] }> = ({ lang, trace }) => {
  const W = 720;
  const H = 150;
  const y = (v: number) => H - ((v + 90) / 130) * H;
  const pts = trace.map((v, i) => `${(i / 359) * W},${y(v)}`).join(' ');
  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3">
      <div className="flex items-center justify-between text-xs text-ink-2">
        <span className="font-medium uppercase tracking-[0.05em]">{lang === 'ru' ? 'Осциллограф: заряд под электродом' : 'Oscilloscope: charge at the electrode'}</span>
        <span className="font-mono">{lang === 'ru' ? 'мВ' : 'mV'}</span>
      </div>
      <svg viewBox={`-40 -8 ${W + 48} ${H + 16}`} className="mt-2 w-full h-auto">
        {[30, 0, THRESHOLD, REST, -80].map((v) => (
          <g key={v}>
            <line x1="0" y1={y(v)} x2={W} y2={y(v)} stroke={v === THRESHOLD ? '#F5A524' : '#E8E6E1'} strokeDasharray={v === THRESHOLD ? '5 4' : undefined} />
            <text x="-6" y={y(v) + 4} textAnchor="end" fontSize="11" fill={v === THRESHOLD ? '#B97300' : '#8C8C88'} fontFamily="JetBrains Mono">{v}</text>
          </g>
        ))}
        <text x={W - 4} y={y(THRESHOLD) - 6} textAnchor="end" fontSize="11" fill="#B97300" fontFamily="Inter">{lang === 'ru' ? 'порог' : 'threshold'}</text>
        <polyline points={pts} fill="none" stroke="#2F5BFF" strokeWidth="2.25" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
