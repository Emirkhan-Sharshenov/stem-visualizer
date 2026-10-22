import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, RotateCcw } from 'lucide-react';
import { chargeLabel, commonA, configTex, ELEMENTS, shells, TASKS } from './atom';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
const P = '#E5484D';
const N = '#9AA0AA';
const E = '#5B8CFF';
const R = [64, 100, 136, 172];

// short-form table positions [period, group] for Z = 1…20
const POS: [number, number][] = [
  [1, 1], [1, 8],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8],
  [4, 1], [4, 2],
];

const Counter: React.FC<{ label: string; color: string; value: number; max: number; onChange: (v: number) => void }> = ({ label, color, value, max, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
    <span className="text-sm text-ink flex-1">{label}</span>
    <Button variant="outline" isIconOnly size="sm" className="w-8" onPress={() => onChange(Math.max(0, value - 1))} isDisabled={value <= 0} aria-label="−">
      <Minus className="w-4 h-4" />
    </Button>
    <span className="w-8 text-center font-mono text-lg text-ink">{value}</span>
    <Button variant="outline" isIconOnly size="sm" className="w-8" onPress={() => onChange(Math.min(max, value + 1))} isDisabled={value >= max} aria-label="+">
      <Plus className="w-4 h-4" />
    </Button>
  </div>
);

export const AtomLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [p, setP] = useState(6);
  const [n, setN] = useState(6);
  const [e, setE] = useState(6);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => progress.recordLab('sandbox-atom'), []);
  useEffect(() => {
    const hit = TASKS.filter((t) => t.check(p, n, e) && !done.includes(t.id));
    if (hit.length) setDone((d) => [...d, ...hit.map((t) => t.id)]);
  }, [p, n, e, done]);

  const el = ELEMENTS[p - 1];
  const A = p + n;
  const q = p - e;
  const sh = shells(e);
  const stable = el ? el.stable.includes(A) : false;

  // nucleons packed in a sunflower spiral, protons and neutrons evenly mixed
  const nucleons = useMemo(() => {
    const total = p + n;
    const out: { x: number; y: number; proton: boolean }[] = [];
    let pp = 0;
    for (let i = 0; i < total; i++) {
      const proton = pp < p && (n === 0 || pp / p <= (i - pp) / Math.max(n, 1));
      if (proton) pp++;
      const r = 6.2 * Math.sqrt(i + 0.5);
      const a = i * 2.39996;
      out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, proton });
    }
    // draw the outer ones first so the centre sits on top
    return out.reverse();
  }, [p, n]);

  const isotopeName = el
    ? p === 1 && A <= 3
      ? [L('протий', 'protium'), L('дейтерий', 'deuterium'), L('тритий', 'tritium')][A - 1]
      : `${lang === 'ru' ? el.ru.toLowerCase() : el.en.toLowerCase()}-${A}`
    : '';
  const kind = q === 0 ? L('нейтральный атом', 'neutral atom') : q > 0 ? L('катион (положительный ион)', 'cation (positive ion)') : L('анион (отрицательный ион)', 'anion (negative ion)');
  const outer = sh.length ? sh[sh.length - 1] : 0;
  const fullOuter = sh.length && (sh.length === 1 ? outer === 2 : outer === 8);

  const setElement = (z: number) => {
    const x = ELEMENTS[z - 1];
    setP(z);
    setN(commonA(x) - z);
    setE(z);
  };

  useScreenDetail(
    'lab',
    `Собрано: ${p} протонов, ${n} нейтронов, ${e} электронов. ${el ? `Элемент ${el.ru} (${el.sym}), A = ${A}, заряд ${q === 0 ? '0' : q > 0 ? '+' + q : q}, ${stable ? 'стабильный' : 'нестабильный'} изотоп, электроны по слоям: ${sh.join(', ')}.` : 'Протонов нет — это не элемент.'}`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Строение атома: протоны, нейтроны, электроны', 'Atomic structure: protons, neutrons, electrons')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('Число протонов задаёт элемент, нейтроны меняют только массу (изотопы), а лишние или недостающие электроны превращают атом в ион.', 'The number of protons decides the element, neutrons only change the mass (isotopes), and extra or missing electrons turn the atom into an ion.')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#1F2126] bg-[#0B0D12] flex justify-center relative overflow-hidden">
            <svg viewBox="-200 -200 400 400" className="w-full max-w-[460px]" aria-label={L('Модель атома', 'Atom model')}>
              <defs>
                <radialGradient id="glowN">
                  <stop offset="0" stopColor="#E5484D" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#E5484D" stopOpacity="0" />
                </radialGradient>
              </defs>
              {R.map((r, i) => (
                <circle key={r} r={r} fill="none" stroke={i < sh.length ? '#5B8CFF' : '#2A2E38'} strokeOpacity={i < sh.length ? 0.45 : 0.6} strokeDasharray={i < sh.length ? undefined : '3 5'} />
              ))}
              {p + n > 0 && <circle r={6.2 * Math.sqrt(p + n) + 18} fill="url(#glowN)" />}
              {nucleons.map((u, i) => (
                <g key={i} transform={`translate(${u.x} ${u.y})`}>
                  <circle r="6.6" fill={u.proton ? P : N} stroke="#0B0D12" strokeWidth="1" />
                  {u.proton && (
                    <text y="2.6" fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">
                      +
                    </text>
                  )}
                </g>
              ))}
              {sh.map((count, s) => (
                <g key={s} style={{ transformBox: 'view-box', transformOrigin: '0 0', animation: `atomSpin ${14 + s * 7}s linear infinite` }}>
                  {Array.from({ length: count }, (_, k) => {
                    const a = (k / count) * Math.PI * 2 + s * 0.4;
                    return <circle key={k} cx={Math.cos(a) * R[s]} cy={Math.sin(a) * R[s]} r="6" fill={E} stroke="#C9D7FF" strokeWidth="1.2" />;
                  })}
                </g>
              ))}
            </svg>
            <span className="absolute left-3 bottom-2 text-[11px]" style={{ color: '#8C8F98' }}>
              {L('Размеры не в масштабе: ядро в 100 000 раз меньше атома', 'Not to scale: the nucleus is 100,000 times smaller than the atom')}
            </span>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5">
            <Counter label={L('Протоны', 'Protons')} color={P} value={p} max={20} onChange={setP} />
            <Counter label={L('Нейтроны', 'Neutrons')} color={N} value={n} max={28} onChange={setN} />
            <Counter label={L('Электроны', 'Electrons')} color={E} value={e} max={20} onChange={setE} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" className="text-sm" onPress={() => setE(p)}>
                {L('Сделать нейтральным', 'Make it neutral')}
              </Button>
              {el && (
                <Button variant="outline" className="text-sm" onPress={() => setN(commonA(el) - p)}>
                  {L('Самый частый изотоп', 'Most common isotope')}
                </Button>
              )}
              <Button variant="outline" className="text-sm" onPress={() => {
                  setP(0);
                  setN(0);
                  setE(0);
                }}>
                <RotateCcw className="w-4 h-4" />
                {L('Пусто', 'Empty')}
              </Button>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Первые 20 элементов — нажми, чтобы собрать', 'First 20 elements: tap to build')}</h3>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 32 }, (_, i) => {
                const per = Math.floor(i / 8) + 1;
                const grp = (i % 8) + 1;
                const z = POS.findIndex(([a, b]) => a === per && b === grp) + 1;
                if (!z) return <div key={i} />;
                const x = ELEMENTS[z - 1];
                return (
                  <button key={i} onClick={() => setElement(z)} className={`aspect-square rounded-md border text-center leading-none flex flex-col items-center justify-center cursor-pointer transition-colors ${z === p ? 'bg-accent border-accent' : 'bg-paper border-line hover:border-accent'}`} style={z === p ? { color: '#fff' } : undefined}>
                    <span className="text-[9px] opacity-70">{z}</span>
                    <span className="text-sm font-semibold">{x.sym}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex gap-4 items-center">
            <div className="w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center shrink-0" style={{ borderColor: el ? '#2F5BFF' : '#E5E5E0' }}>
              <span className="text-[11px] text-ink-3 self-start ml-2">{p || ''}</span>
              <span className="text-3xl font-semibold text-ink -mt-1">{el?.sym ?? '?'}</span>
              <span className="text-[10px] text-ink-3">{el?.mass ?? ''}</span>
            </div>
            <div className="min-w-0">
              <div className="text-lg font-medium text-ink">{el ? (lang === 'ru' ? el.ru : el.en) : L('Нет элемента', 'No element')}</div>
              <div className="text-sm text-ink-2">{el ? kind : L('Добавь хотя бы один протон', 'Add at least one proton')}</div>
              {el && (
                <div className="mt-1 text-[22px] text-ink">
                  <Formula tex={`{}^{${A}}_{${p}}\\mathrm{${el.sym}}${q ? `^{${chargeLabel(q).replace('−', '-')}}` : ''}`} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm flex flex-col gap-1.5">
            {[
              [L('Заряд ядра Z', 'Nuclear charge Z'), `+${p}`],
              [L('Массовое число A = p + n', 'Mass number A = p + n'), String(A)],
              [L('Заряд частицы', 'Overall charge'), q === 0 ? '0' : q > 0 ? `+${q}` : `−${-q}`],
              [L('Электроны по слоям', 'Electrons per shell'), sh.join(', ') || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-ink-2">{k}</span>
                <span className="font-mono text-ink">{v}</span>
              </div>
            ))}
            <div className="pt-1 overflow-x-auto">
              <Formula tex={configTex(e)} />
            </div>
          </div>

          {el && (
            <div className={`rounded-xl border p-4 text-sm ${stable ? 'bg-[#EEF8F2] border-[#BFE3CF]' : 'bg-[#FFF4F0] border-[#F6CBB9]'}`}>
              <b className={stable ? 'text-[#1E7A4C]' : 'text-[#B42318]'}>
                {stable ? L('Стабильный изотоп', 'Stable isotope') : L('Нестабильный изотоп', 'Unstable isotope')}
              </b>{' '}
              <span className="text-ink">— {isotopeName}.</span>{' '}
              <span className="text-ink-2">
                {stable
                  ? L(`Стабильные изотопы: ${el.stable.map((a) => `${el.sym}-${a}`).join(', ')}.`, `Stable isotopes: ${el.stable.map((a) => `${el.sym}-${a}`).join(', ')}.`)
                  : n < p - 1
                    ? L('Нейтронов слишком мало — протоны отталкиваются, ядро распадается.', 'Too few neutrons: the protons push each other apart and the nucleus decays.')
                    : L('Нейтронов слишком много — ядро радиоактивно и со временем распадётся.', 'Too many neutrons: the nucleus is radioactive and will decay.')}
              </span>
            </div>
          )}

          {e > 0 && (
            <div className="bg-surface border border-line rounded-xl p-4 text-sm text-ink-2">
              {fullOuter
                ? L('Внешний слой заполнен — как у инертного газа. Такая частица очень устойчива.', 'The outer shell is full, like a noble gas. Such a particle is very stable.')
                : L(`На внешнем слое ${outer} электрон(а). ${outer <= 3 ? 'Атому проще отдать их и стать катионом.' : 'Атому проще добрать электроны до 8 и стать анионом.'}`, `${outer} electron(s) in the outer shell. ${outer <= 3 ? 'It is easier to give them away and become a cation.' : 'It is easier to gain electrons up to 8 and become an anion.'}`)}
            </div>
          )}

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">
              {L('Задания', 'Tasks')} · {done.length}/{TASKS.length}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {TASKS.map((t) => {
                const ok = done.includes(t.id);
                return (
                  <li key={t.id} className={`flex items-center gap-2 text-sm ${ok ? 'text-ink-3 line-through' : 'text-ink'}`}>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${ok ? 'bg-[#30A46C] border-[#30A46C]' : 'border-line'}`}>{ok && <Check className="w-3 h-3" style={{ color: '#fff' }} strokeWidth={3} />}</span>
                    {L(t.ru, t.en)}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <style>{`@keyframes atomSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default AtomLab;
