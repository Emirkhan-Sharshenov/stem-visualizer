import React, { useEffect, useState } from 'react';
import { Segmented } from '../lab/LabUI';
import { CATEGORY_INFO, El, ELEMENTS_TABLE, shells, valence } from '../../lib/chem/periodic';

type Lang = 'ru' | 'en';
export type TableMode = 'category' | 'eneg' | 'metal' | 'trends';

const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * k);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

function cellColor(e: El, mode: TableMode) {
  if (mode === 'category') return CATEGORY_INFO[e.cat].color;
  if (mode === 'eneg') return e.en === null ? '#3A3D45' : mix('#2F5BFF', '#E5484D', (e.en - 0.7) / 3.3);
  if (mode === 'metal') return e.cat === 'nonmetal' || e.cat === 'halogen' || e.cat === 'noble' ? '#30A46C' : e.cat === 'metalloid' ? '#F5A524' : '#8FA4FF';
  // trends: metallic character grows down-left
  const k = ((e.col - 1) / 17) * 0.6 + (1 - (Math.min(e.period, 7) - 1) / 6) * 0.4;
  return mix('#8E4EC6', '#30A46C', k);
}

/** Bohr-style atom with orbiting electrons */
const AtomDiagram: React.FC<{ el: El }> = ({ el }) => {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const sh = shells(el.z);
  const size = 200;
  const c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
      <circle cx={c} cy={c} r={12} fill={CATEGORY_INFO[el.cat].color} />
      <text x={c} y={c + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#111214">
        +{el.z}
      </text>
      {sh.map((n, k) => {
        const r = 26 + k * (70 / Math.max(1, sh.length));
        return (
          <g key={k}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="#3A3D45" strokeWidth="1" />
            {Array.from({ length: n }, (_, i) => {
              const a = (i / n) * Math.PI * 2 + t * (0.9 - k * 0.15);
              return <circle key={i} cx={c + Math.cos(a) * r} cy={c + Math.sin(a) * r} r={3.2} fill={k === sh.length - 1 ? '#3DD6F5' : '#8FA4FF'} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

/** Interactive periodic table with category, electronegativity and metal/non-metal views */
export const PeriodicTable: React.FC<{ lang: Lang; mode?: TableMode }> = ({ lang, mode: initial = 'category' }) => {
  const [mode, setMode] = useState<TableMode>(initial);
  const [sel, setSel] = useState<El>(ELEMENTS_TABLE[5]);
  const v = valence(sel);
  return (
    <div className="flex flex-col gap-3 w-full">
      <Segmented<TableMode>
        value={mode}
        onChange={setMode}
        options={[
          { id: 'category', label: lang === 'ru' ? 'Семейства' : 'Families' },
          { id: 'metal', label: lang === 'ru' ? 'Металлы / неметаллы' : 'Metals / non-metals' },
          { id: 'eneg', label: lang === 'ru' ? 'Электроотрицательность' : 'Electronegativity' },
          { id: 'trends', label: lang === 'ru' ? 'Закономерности' : 'Trends' },
        ]}
      />
      <div className="lab-stage rounded-xl p-3 sm:p-4 overflow-x-auto">
        <div className="relative grid gap-[3px] min-w-[720px]" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(7, auto) 10px repeat(2, auto)' }}>
          {ELEMENTS_TABLE.map((e) => (
            <button
              key={e.z}
              onClick={() => setSel(e)}
              title={e.name[lang]}
              className={`relative aspect-square rounded-[5px] text-left px-1 py-0.5 cursor-pointer transition-transform hover:scale-110 hover:z-10 ${sel.z === e.z ? 'ring-2 ring-white z-10 scale-110' : ''}`}
              style={{ gridColumn: e.col, gridRow: e.row > 7 ? e.row + 1 : e.row, backgroundColor: cellColor(e, mode), color: '#111214' }}
            >
              <span className="block text-[8px] leading-none opacity-70">{e.z}</span>
              <span className="block text-center text-[13px] font-semibold leading-tight">{e.sym}</span>
              {mode === 'eneg' && e.en !== null && <span className="block text-center text-[7.5px] leading-none opacity-80">{e.en}</span>}
            </button>
          ))}
          {/* f-block markers */}
          <span className="text-[10px] text-[#8C8F98] flex items-center justify-center" style={{ gridColumn: 3, gridRow: 6 }}>
            57–71
          </span>
          <span className="text-[10px] text-[#8C8F98] flex items-center justify-center" style={{ gridColumn: 3, gridRow: 7 }}>
            89–103
          </span>
          {mode === 'trends' && (
            <div className="pointer-events-none absolute left-[22%] top-[2%] right-[2%] text-[12px] text-[#EDEDED] flex flex-col gap-1">
              <span>{lang === 'ru' ? '→ по периоду: радиус ↓, неметаллические свойства ↑, электроотрицательность ↑' : '→ across a period: radius ↓, non-metal character ↑, electronegativity ↑'}</span>
              <span>{lang === 'ru' ? '↓ по группе: радиус ↑, металлические свойства ↑' : '↓ down a group: radius ↑, metal character ↑'}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {mode === 'category' &&
            Object.entries(CATEGORY_INFO).map(([k, c]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[11.5px] text-[#B5B8C0]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                {c[lang]}
              </span>
            ))}
          {mode === 'metal' &&
            [
              ['#8FA4FF', lang === 'ru' ? 'металлы' : 'metals'],
              ['#F5A524', lang === 'ru' ? 'полуметаллы' : 'metalloids'],
              ['#30A46C', lang === 'ru' ? 'неметаллы' : 'non-metals'],
            ].map(([c, n]) => (
              <span key={n} className="inline-flex items-center gap-1.5 text-[11.5px] text-[#B5B8C0]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                {n}
              </span>
            ))}
          {mode === 'eneg' && <span className="text-[11.5px] text-[#B5B8C0]">{lang === 'ru' ? 'синий — низкая (металлы отдают электроны), красный — высокая (фтор — рекордсмен, 3,98)' : 'blue = low (metals give electrons away), red = high (fluorine holds the record, 3.98)'}</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-4xl text-ink">{sel.sym}</span>
            <div>
              <h3 className="font-serif text-lg text-ink leading-tight">{sel.name[lang]}</h3>
              <span className="text-xs text-ink-2">{CATEGORY_INFO[sel.cat][lang]}</span>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              [lang === 'ru' ? 'Порядковый номер Z' : 'Atomic number Z', sel.z],
              [lang === 'ru' ? 'Атомная масса' : 'Atomic mass', sel.mass],
              [lang === 'ru' ? 'Период' : 'Period', sel.period],
              [lang === 'ru' ? 'Группа' : 'Group', sel.group ?? (sel.cat === 'lanthanide' ? '3 (La–Lu)' : '3 (Ac–Lr)')],
              [lang === 'ru' ? 'Электроотрицательность' : 'Electronegativity', sel.en ?? '—'],
              [lang === 'ru' ? 'Электронов на внешнем уровне' : 'Outer-shell electrons', v ?? (lang === 'ru' ? '1–2 (d-элемент)' : '1–2 (d-block)')],
            ].map(([k, val]) => (
              <div key={String(k)} className="rounded-lg bg-muted px-3 py-2 min-w-0">
                <dt className="text-[11px] text-ink-2 truncate">{k}</dt>
                <dd className="font-mono text-ink">{val}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
            {lang === 'ru'
              ? `В ядре ${sel.z} протонов, вокруг — столько же электронов. Номер периода = число электронных слоёв (${sel.period}).${v ? ` Номер группы главной подгруппы = число внешних электронов (${v}).` : ''}`
              : `The nucleus holds ${sel.z} protons, with as many electrons around it. The period number = the number of electron shells (${sel.period}).${v ? ` For main groups, the group number gives the outer electrons (${v}).` : ''}`}
          </p>
        </div>
        <div className="bg-[#111214] rounded-xl p-3 flex flex-col items-center justify-center">
          <AtomDiagram key={sel.z} el={sel} />
          <span className="text-[11px] text-[#8C8F98] text-center">{lang === 'ru' ? 'электроны по слоям (упрощённо)' : 'electrons by shell (simplified)'}</span>
        </div>
      </div>
    </div>
  );
};
