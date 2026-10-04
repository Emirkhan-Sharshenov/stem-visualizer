import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Stage3D } from '../lab/Stage3D';
import { Timeline, TimelineMark, useTimeline } from '../lab/Timeline';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { reactionById, SPECIES } from '../../lib/chem/reactions';
import { buildReaction, ReactionScene, RT } from '../../lib/chem/reactionScene';
import { element } from '../../lib/chem/elements';

type Lang = 'ru' | 'en';

const stagesFor = (notes?: { collide?: { ru: string; en: string }; rearrange?: { ru: string; en: string }; products?: { ru: string; en: string } }): (TimelineMark & { text: { ru: string; en: string } })[] => [
  { t: 0, label: { ru: 'Сближение', en: 'Approach' }, text: { ru: 'Молекулы движутся хаотично и приближаются друг к другу. Реакция возможна только при столкновении.', en: 'Molecules move about at random and approach each other. A reaction can only happen when they collide.' } },
  { t: RT.meet, label: { ru: 'Столкновение', en: 'Collision' }, text: notes?.collide ?? { ru: 'Столкновение достаточно энергичное: энергия частиц превышает энергию активации.', en: 'The collision is energetic enough: the particles have more than the activation energy.' } },
  { t: RT.breakStart, label: { ru: 'Разрыв связей', en: 'Bonds break' }, text: notes?.rearrange ?? { ru: 'Старые химические связи ослабевают и рвутся — на это энергия затрачивается.', en: 'The old chemical bonds weaken and break, which takes energy.' } },
  { t: RT.formStart, label: { ru: 'Новые связи', en: 'New bonds' }, text: { ru: 'Атомы перегруппировываются и образуют новые связи (жёлтые) — при этом энергия выделяется. Атомы не исчезают и не появляются: закон сохранения массы.', en: 'The atoms regroup and form new bonds (yellow), which releases energy. No atom appears or disappears: conservation of mass.' } },
  { t: RT.apart, label: { ru: 'Продукты', en: 'Products' }, text: notes?.products ?? { ru: 'Готовые молекулы продуктов расходятся.', en: 'The finished product molecules move apart.' } },
];

/** 3D chemical reactions with play / pause / rewind: bonds breaking, atoms regrouping, electrons moving */
export const ReactionLab: React.FC<{ lang: Lang; ids: string[] }> = ({ lang, ids }) => {
  const [current, setCurrent] = useState(ids[0]);
  const rx = reactionById(current);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const tl = useTimeline(RT.duration, { loop: false });
  const stageRef = useRef<ThreeStage | null>(null);
  const sceneRef = useRef<ReactionScene | null>(null);
  const [ready, setReady] = useState(false);
  const stages = useMemo(() => stagesFor(rx.notes), [rx]);

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    setReady(true);
    return stage.onUpdate(() => sceneRef.current?.update(tl.timeRef.current));
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (sceneRef.current) {
      stage.scene.remove(sceneRef.current.group);
      sceneRef.current.dispose();
    }
    const sc = buildReaction(rx);
    sceneRef.current = sc;
    stage.scene.add(sc.group);
    stage.setPickable(sc.pickables);
    const d = Math.max(7, sc.radius * 1.15);
    stage.flyTo([d * 0.2, d * 0.25, d], [0, 0, 0], 0.8);
    tl.seek(0);
    tl.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rx, ready]);

  const active = [...stages].reverse().find((s) => tl.time >= s.t);
  const elementsUsed = useMemo(() => {
    const set = new Set<string>();
    rx.reactants.forEach((k) => SPECIES[k].atoms.forEach(([s]) => set.add(s)));
    return [...set];
  }, [rx]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {ids.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id) => (
            <button
              key={id}
              onClick={() => {
                setCurrent(id);
                setSelected(null);
              }}
              className={`h-8 px-3 rounded-lg text-sm border transition-colors cursor-pointer ${
                id === current ? 'bg-accent text-white border-accent' : 'bg-surface border-line text-ink-2 hover:text-ink hover:border-line-strong'
              }`}
              style={id === current ? { color: '#fff' } : undefined}
            >
              {reactionById(id).name[lang]}
            </button>
          ))}
        </div>
      )}

      <Stage3D
        lang={lang}
        className="h-[380px] sm:h-[460px] rounded-xl"
        options={{ cameraPosition: [2, 3, 12], minDistance: 3, maxDistance: 40 }}
        onReady={onReady}
        onReset={(s) => {
          const d = Math.max(7, (sceneRef.current?.radius ?? 6) * 1.15);
          s.flyTo([d * 0.2, d * 0.25, d], [0, 0, 0]);
        }}
        selected={selected}
        onSelect={setSelected}
      >
        <div className="pointer-events-none absolute top-3 left-3 right-14 z-10 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[13px] text-[#EDEDED] font-mono">{rx.equation}</span>
          {elementsUsed.map((s) => (
            <span key={s} className="px-2 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED] inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: element(s).color }} />
              {s}
            </span>
          ))}
        </div>
      </Stage3D>

      <Timeline lang={lang} tl={tl} marks={stages} step={0.25} />

      {active && (
        <p className="text-[14.5px] leading-relaxed text-ink bg-surface border border-line rounded-xl px-4 py-3">
          <span className="font-medium text-accent">{active.label[lang]}. </span>
          {active.text[lang]}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex flex-wrap gap-1.5">
            {rx.kinds.map((k) => (
              <span key={k.en} className="px-2 py-0.5 rounded-full bg-muted text-xs text-ink-2">
                {k[lang]}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-2">{rx.about[lang]}</p>
          {rx.catalyst && (
            <p className="mt-2 text-[13.5px] text-ink">
              <span className="text-ink-2">{lang === 'ru' ? 'Условия / катализатор: ' : 'Conditions / catalyst: '}</span>
              {rx.catalyst[lang]}
            </p>
          )}
          {rx.oxidation && (
            <table className="mt-3 w-full text-[13px]">
              <tbody>
                {rx.oxidation.map((o) => (
                  <tr key={o.sym} className="border-t border-line">
                    <td className="py-1.5 font-mono text-ink">{o.sym}</td>
                    <td className="py-1.5 font-mono text-ink">
                      {o.from} → {o.to}
                    </td>
                    <td className={`py-1.5 text-right ${o.role === 'ox' ? 'text-[#CC2F35]' : 'text-[#1E7A4C]'}`}>
                      {o.role === 'ox' ? (lang === 'ru' ? 'окисляется · восстановитель' : 'oxidised · reducing agent') : lang === 'ru' ? 'восстанавливается · окислитель' : 'reduced · oxidising agent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <EnergyDiagram lang={lang} dH={rx.dH} barrier={rx.barrier} catalysed={!!rx.catalyst} t={tl.time} />
      </div>
    </div>
  );
};

/** Energy profile with the current moment marked; catalysed reactions show the lowered barrier too */
const EnergyDiagram: React.FC<{ lang: Lang; dH: number; barrier: number; catalysed: boolean; t: number }> = ({ lang, dH, barrier, catalysed, t }) => {
  const W = 320;
  const H = 170;
  const exo = dH < 0;
  const yR = exo ? 60 : 120;
  const yP = exo ? 120 : 60;
  const peak = Math.min(yR, yP) - 20 - barrier * 30;
  const peakCat = Math.min(yR, yP) - 8 - barrier * 12;
  const curve = (pk: number) => `M20 ${yR} L80 ${yR} C120 ${yR} 130 ${pk} 160 ${pk} C190 ${pk} 200 ${yP} 240 ${yP} L300 ${yP}`;
  // map time to x along the reaction coordinate
  const k = Math.max(0, Math.min(1, (t - 2) / 4));
  const x = 80 + k * 160;
  const yAt = (xx: number) => {
    if (xx <= 160) {
      const u = (xx - 80) / 80;
      return yR + (peak - yR) * (u * u * (3 - 2 * u));
    }
    const u = (xx - 160) / 80;
    return peak + (yP - peak) * (u * u * (3 - 2 * u));
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Энергия' : 'Energy'}</h4>
        <span className={`font-mono text-sm ${exo ? 'text-[#CC2F35]' : 'text-accent'}`}>
          ΔH = {dH > 0 ? '+' : ''}
          {dH} {lang === 'ru' ? 'кДж' : 'kJ'}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2">
        <line x1="14" y1="10" x2="14" y2={H - 10} stroke="var(--color-line-strong, #C9CBD1)" />
        <text x="18" y="16" fontSize="10" fill="#8C8F98">E</text>
        {catalysed && <path d={curve(peakCat)} fill="none" stroke="#30A46C" strokeWidth="2" strokeDasharray="4 4" />}
        <path d={curve(peak)} fill="none" stroke="#2F5BFF" strokeWidth="2.5" />
        <line x1="150" y1={peak} x2="150" y2={yR} stroke="#8C8F98" strokeDasharray="3 3" />
        <text x="104" y={(peak + yR) / 2} fontSize="10" fill="#5A5D66">Eₐ</text>
        <text x="22" y={yR - 6} fontSize="10" fill="#5A5D66">{lang === 'ru' ? 'реагенты' : 'reactants'}</text>
        <text x="250" y={yP - 6} fontSize="10" fill="#5A5D66">{lang === 'ru' ? 'продукты' : 'products'}</text>
        <circle cx={x} cy={yAt(x)} r="6" fill="#F5A524" stroke="#fff" strokeWidth="2" />
      </svg>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
        {exo
          ? lang === 'ru'
            ? 'Экзотермическая: у продуктов энергии меньше, разница выделяется теплом.'
            : 'Exothermic: the products hold less energy and the difference is released as heat.'
          : lang === 'ru'
            ? 'Эндотермическая: энергию нужно постоянно подводить.'
            : 'Endothermic: energy has to be supplied.'}
        {catalysed && (lang === 'ru' ? ' Зелёный пунктир — путь с катализатором: барьер ниже.' : ' The green dashed path is with a catalyst: a lower barrier.')}
      </p>
    </div>
  );
};
