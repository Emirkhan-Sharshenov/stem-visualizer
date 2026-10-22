import { RangeSlider } from '../ui/RangeSlider';
import { Button, Tooltip } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Power, RotateCcw } from 'lucide-react';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

/* A galvanic cell from any two metals: the more active one dissolves, electrons run through the wire, the voltage follows Nernst. */

type Lang = 'ru' | 'en';
interface Metal {
  sym: string;
  ru: string;
  en: string;
  e0: number;
  z: number;
  color: string;
  ion: string;
  solution: string;
}
const METALS: Metal[] = [
  { sym: 'Mg', ru: 'Магний', en: 'Magnesium', e0: -2.37, z: 2, color: '#C9CCD2', ion: 'Mg²⁺', solution: '#EEF1F5' },
  { sym: 'Al', ru: 'Алюминий', en: 'Aluminium', e0: -1.66, z: 3, color: '#D6D9DE', ion: 'Al³⁺', solution: '#F0F2F5' },
  { sym: 'Zn', ru: 'Цинк', en: 'Zinc', e0: -0.76, z: 2, color: '#A9B1BC', ion: 'Zn²⁺', solution: '#EEF2F6' },
  { sym: 'Fe', ru: 'Железо', en: 'Iron', e0: -0.44, z: 2, color: '#7C7F86', ion: 'Fe²⁺', solution: '#E4F0DD' },
  { sym: 'Ni', ru: 'Никель', en: 'Nickel', e0: -0.25, z: 2, color: '#B4AE9C', ion: 'Ni²⁺', solution: '#D7F0DC' },
  { sym: 'Sn', ru: 'Олово', en: 'Tin', e0: -0.14, z: 2, color: '#C7C7C2', ion: 'Sn²⁺', solution: '#F1F1EE' },
  { sym: 'Pb', ru: 'Свинец', en: 'Lead', e0: -0.13, z: 2, color: '#6F7380', ion: 'Pb²⁺', solution: '#EEEFF3' },
  { sym: 'Cu', ru: 'Медь', en: 'Copper', e0: 0.34, z: 2, color: '#C26A3A', ion: 'Cu²⁺', solution: '#CFE6FA' },
  { sym: 'Ag', ru: 'Серебро', en: 'Silver', e0: 0.8, z: 1, color: '#D9DCE2', ion: 'Ag⁺', solution: '#F4F6F8' },
  { sym: 'Au', ru: 'Золото', en: 'Gold', e0: 1.5, z: 3, color: '#E1B53F', ion: 'Au³⁺', solution: '#FBF4D6' },
];
const n = (x: number, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const coef = (k: number) => (k === 1 ? '' : String(k));

/** Nernst for a metal electrode at 25 °C */
const eOf = (m: Metal, c: number) => m.e0 + (0.0592 / m.z) * Math.log10(Math.max(1e-6, c));

export const GalvanicLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [left, setLeft] = useState(METALS[2]);
  const [right, setRight] = useState(METALS[7]);
  const [c0, setC0] = useState({ l: 1, r: 1 });
  const [conc, setConc] = useState({ l: 1, r: 1 });
  const [closed, setClosed] = useState(false);
  const [charge, setCharge] = useState(0); // passed charge, arbitrary units
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => progress.recordLab('sandbox-galvanic'), []);
  useEffect(() => {
    setConc({ ...c0 });
    setCharge(0);
  }, [left, right, c0]);

  const eL = eOf(left, conc.l);
  const eR = eOf(right, conc.r);
  const anodeLeft = eL < eR;
  const anode = anodeLeft ? left : right;
  const cathode = anodeLeft ? right : left;
  const emf = Math.abs(eR - eL);

  // while the circuit is closed the cell runs down: the anode solution gets stronger, the cathode one weaker
  useEffect(() => {
    if (!closed) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setT((x) => x + dt);
      setConc((c) => {
        const flow = emf > 0.005 ? 0.02 * dt * Math.min(1, emf) : 0;
        const da = flow / anode.z;
        const dc = flow / cathode.z;
        return anodeLeft ? { l: Math.min(3, c.l + da), r: Math.max(0.0005, c.r - dc) } : { l: Math.max(0.0005, c.l - dc), r: Math.min(3, c.r + da) };
      });
      setCharge((q) => q + (emf > 0.005 ? dt * emf : 0));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [closed, emf, anode, cathode, anodeLeft]);

  // balanced overall reaction: electrons given and taken must match
  const reaction = useMemo(() => {
    if (anode.sym === cathode.sym) return L('Одинаковые металлы: работает только разница концентраций (концентрационный элемент).', 'Same metal: only the concentration difference drives it (a concentration cell).');
    const k = (anode.z * cathode.z) / gcd(anode.z, cathode.z);
    const a = k / anode.z;
    const c = k / cathode.z;
    return `${coef(a)}${anode.sym} + ${coef(c)}${cathode.ion} → ${coef(a)}${anode.ion} + ${coef(c)}${cathode.sym}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anode, cathode, lang]);

  const wear = Math.min(0.6, charge * 0.05); // how much of the anode has dissolved
  useScreenDetail('lab', `Гальванический элемент: ${left.ru} (${n(conc.l, 3)} М) и ${right.ru} (${n(conc.r, 3)} М). Анод — ${anode.ru}, катод — ${cathode.ru}, ЭДС ${n(emf)} В. Цепь ${closed ? 'замкнута' : 'разомкнута'}.`);

  const electrode = (m: Metal, x: number, isAnode: boolean) => {
    const w = isAnode ? 26 * (1 - wear) : 26 + Math.min(14, charge * 1.2);
    return (
      <g>
        <rect x={x - w / 2} y={70} width={w} height={150} rx={3} fill={m.color} stroke="#16171A" strokeOpacity="0.4" />
        {!isAnode && charge > 0.2 && <rect x={x - w / 2} y={150} width={w} height={70} rx={3} fill={cathode.color} opacity={0.9} />}
        <text x={x} y={62} textAnchor="middle" fontSize="15" fontWeight="700" fill="#16171A">{m.sym}</text>
        <text x={x} y={248} textAnchor="middle" fontSize="12" fontWeight="700" fill={isAnode ? '#E5484D' : '#2F5BFF'}>
          {isAnode ? L('анод (−)', 'anode (−)') : L('катод (+)', 'cathode (+)')}
        </text>
      </g>
    );
  };
  const xA = anodeLeft ? 150 : 450;
  const xC = anodeLeft ? 450 : 150;
  const flowOn = closed && emf > 0.005;

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-5 items-start">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="rounded-xl border border-line bg-[#FCFCFA] overflow-hidden">
          <svg viewBox="0 0 600 300" className="block w-full h-auto">
            {/* beakers with solutions */}
            {[
              [150, left, conc.l],
              [450, right, conc.r],
            ].map(([x, m, c]) => (
              <g key={x as number}>
                <rect x={(x as number) - 90} y={130} width={180} height={140} rx={10} fill={(m as Metal).solution} stroke="#5A5D66" strokeWidth="2" />
                <text x={(x as number) - 80} y={288} fontSize="11" fill="#5A5D66">
                  {(m as Metal).ion} · {n(c as number, 3)} М
                </text>
              </g>
            ))}
            {/* salt bridge */}
            <path d="M 215 175 L 215 105 Q 215 92 228 92 L 372 92 Q 385 92 385 105 L 385 175" fill="none" stroke="#E9DFC6" strokeWidth="18" strokeLinecap="round" />
            <text x={300} y={84} textAnchor="middle" fontSize="11" fill="#7C7263">{L('солевой мостик KNO₃', 'salt bridge KNO₃')}</text>
            {/* wire and voltmeter */}
            <path d={`M ${xA} 70 L ${xA} 30 L ${xC} 30 L ${xC} 70`} fill="none" stroke={closed ? '#16171A' : '#B9BCC4'} strokeWidth="3" strokeDasharray={closed ? undefined : '8 6'} />
            <circle cx={300} cy={30} r={24} fill="#fff" stroke="#16171A" strokeWidth="2" />
            <text x={300} y={27} textAnchor="middle" fontSize="13" fontWeight="700" fill="#16171A">{closed ? n(emf) : '—'}</text>
            <text x={300} y={41} textAnchor="middle" fontSize="10" fill="#5A5D66">V</text>
            {electrode(left, 150, anodeLeft)}
            {electrode(right, 450, !anodeLeft)}
            {/* moving electrons along the wire, from the anode to the cathode */}
            {flowOn &&
              Array.from({ length: 8 }, (_, i) => {
                const len = 40 + Math.abs(xC - xA) + 40;
                const s = ((t * 120 + i * (len / 8)) % len);
                let x = xA;
                let y = 70 - s;
                if (s > 40) {
                  y = 30;
                  x = xA + Math.sign(xC - xA) * Math.min(Math.abs(xC - xA), s - 40);
                }
                if (s > 40 + Math.abs(xC - xA)) {
                  x = xC;
                  y = 30 + (s - 40 - Math.abs(xC - xA));
                }
                if (Math.abs(x - 300) < 24 && y === 30) return null;
                return <circle key={i} cx={x} cy={y} r={4} fill="#2F5BFF" />;
              })}
            {/* ions leaving the anode and settling on the cathode */}
            {flowOn &&
              Array.from({ length: 5 }, (_, i) => {
                const ph = (t * 0.6 + i / 5) % 1;
                return (
                  <g key={i}>
                    <circle cx={xA + (anodeLeft ? 1 : -1) * (16 + ph * 50)} cy={160 + i * 18} r={5} fill="#E5484D" opacity={1 - ph} />
                    <circle cx={xC + (anodeLeft ? -1 : 1) * (66 - ph * 50)} cy={160 + i * 18} r={5} fill="#30A46C" opacity={ph} />
                  </g>
                );
              })}
          </svg>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="text-xs text-ink-2">{L('ЭДС элемента', 'Cell voltage')}</div>
            <div className="font-mono text-2xl text-ink">{n(emf)} В</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="text-xs text-ink-2">{L('Анод: окисление', 'Anode: oxidation')}</div>
            <div className="font-mono text-sm text-[#CC2F35]">{anode.sym} − {anode.z}e⁻ → {anode.ion}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="text-xs text-ink-2">{L('Катод: восстановление', 'Cathode: reduction')}</div>
            <div className="font-mono text-sm text-[#2F5BFF]">{cathode.ion} + {cathode.z}e⁻ → {cathode.sym}</div>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3 text-sm">
          <span className="text-ink-2">{L('Суммарная реакция', 'Overall reaction')}: </span>
          <span className="font-mono text-ink">{reaction}</span>
        </div>
      </div>
      <aside className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        {[
          [L('Левый электрод', 'Left electrode'), left, setLeft, 'l'],
          [L('Правый электрод', 'Right electrode'), right, setRight, 'r'],
        ].map(([label, cur, set, side]) => (
          <div key={side as string} className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-2">{label as string}</span>
            <div className="flex flex-wrap gap-1">
              {METALS.map((m) => (
                <Button aria-label={`${lang === 'ru' ? m.ru : m.en}, E° = ${m.e0} В`} variant="outline" className={`w-10 text-sm font-medium ${(cur as Metal).sym === m.sym ? 'text-accent' : 'text-ink'}`} key={m.sym} onPress={() => (set as (m: Metal) => void)(m)}>
                  {m.sym}
                </Button>
              ))}
            </div>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between text-[11px] text-ink-3">
                <span>{L('концентрация ионов', 'ion concentration')}</span>
                <span className="font-mono">{n(c0[side as 'l' | 'r'], 3)} М</span>
              </span>
              <RangeSlider value={Math.log10(c0[side as 'l' | 'r'])} onChange={(v) => setC0({ ...c0, [side as string]: 10 ** v })} min={-3} max={0} step={0.1} color="#30A46C" />
            </label>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant={closed ? 'outline' : 'primary'} className="flex-1 text-sm font-medium" onPress={() => setClosed(!closed)} style={closed ? undefined : { color: '#fff' }}>
            <Power className="w-4 h-4" /> {closed ? L('Разомкнуть цепь', 'Open the circuit') : L('Замкнуть цепь', 'Close the circuit')}
          </Button>
          <Tooltip><Tooltip.Trigger><Button aria-label={L('Свежий элемент', 'Fresh cell')} variant="outline" isIconOnly className="w-10" onPress={() => { setConc({ ...c0 }); setCharge(0); }}>
            <RotateCcw className="w-4 h-4 text-ink-2" />
          </Button></Tooltip.Trigger><Tooltip.Content>{L('Свежий элемент', 'Fresh cell')}</Tooltip.Content></Tooltip>
        </div>
        <div className="border-t border-line pt-3 flex flex-col gap-2 text-sm text-ink-2">
          <div className="overflow-x-auto text-ink">
            <Formula tex={'E = E^\\circ_{\\text{кат}} - E^\\circ_{\\text{ан}}, \\quad E = E^\\circ + \\frac{0{,}059}{z}\\lg[M^{z+}]'} display />
          </div>
          <p>{L('Анодом становится более активный металл (левее в ряду напряжений) — он растворяется. Электроны идут по проводу к катоду, где ионы превращаются в металл.', 'The more active metal becomes the anode and dissolves. Electrons run through the wire to the cathode, where ions turn into metal.')}</p>
          <p className="text-xs">{L('Замкни цепь и подожди: концентрации меняются, напряжение падает — так «садится» батарейка.', 'Close the circuit and wait: concentrations change and the voltage drops, that is how a battery runs down.')}</p>
        </div>
      </aside>
    </div>
  );
};

export default GalvanicLab;
