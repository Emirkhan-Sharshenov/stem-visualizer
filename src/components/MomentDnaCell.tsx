import React, { useMemo, useRef, useState } from 'react';
import { Stage3D } from './lab/Stage3D';
import { Legend, Metric, Panel, PlayControls, Segmented, Slider, Tip, Toggle } from './lab/LabUI';
import type { PartInfo, ThreeStage } from '../lib/three/ThreeStage';
import { Base, BASE_COLOR, buildDna, DnaModel, DnaState, HELICASE_INFO, NEW_STRAND, OLD_STRAND, PAIR, POLYMERASE_INFO } from '../lib/three/dnaModel';

interface MomentDnaCellProps {
  lang: 'ru' | 'en';
}

type Mode = DnaState['mode'];

const BASE_NAMES: Record<Base, { ru: string; en: string }> = {
  A: { ru: 'Аденин', en: 'Adenine' },
  T: { ru: 'Тимин', en: 'Thymine' },
  G: { ru: 'Гуанин', en: 'Guanine' },
  C: { ru: 'Цитозин', en: 'Cytosine' },
};

const STRAND_INFO: Record<'old' | 'new', PartInfo> = {
  old: { title: { ru: 'Исходная цепь', en: 'Original strand' }, text: { ru: 'Старая цепь служит шаблоном. После репликации она остаётся в одной из дочерних молекул.', en: 'The old strand serves as a template and ends up in one of the daughter molecules.' } },
  new: { title: { ru: 'Новая цепь', en: 'New strand' }, text: { ru: 'Собрана полимеразой по шаблону. Каждая дочерняя ДНК — одна старая цепь плюс одна новая: это и есть полуконсервативная репликация.', en: 'Built by polymerase on the template. Each daughter DNA is one old strand plus one new one: semiconservative replication.' } },
};

export const MomentDnaCell: React.FC<MomentDnaCellProps> = ({ lang }) => {
  const [mode, setMode] = useState<Mode>('helix');
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showBonds, setShowBonds] = useState(true);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const modelRef = useRef<DnaModel | null>(null);
  const stateRef = useRef<DnaState>({ mode, running, speed, showBonds });
  stateRef.current = { mode, running, speed, showBonds };

  const sequence = useMemo(() => 'ATGCGTACCTAGGCATTCGAGCTA'.split('') as Base[], []);
  const counts = useMemo(() => {
    const all = [...sequence, ...sequence.map((b) => PAIR[b])];
    const c = { A: 0, T: 0, G: 0, C: 0 } as Record<Base, number>;
    all.forEach((b) => c[b]++);
    return { c, gc: Math.round(((c.G + c.C) / all.length) * 100) };
  }, [sequence]);

  const onReady = (stage: ThreeStage) => {
    const model = buildDna();
    modelRef.current = model;
    stage.scene.add(model.group);
    stage.setPickable(model.pickables);
    return stage.onUpdate((dt) => model.update(dt, stateRef.current));
  };

  const legend = [
    ...(['A', 'T', 'G', 'C'] as Base[]).map((b) => ({
      color: BASE_COLOR[b],
      info: { title: { ru: `${BASE_NAMES[b].ru} (${b})`, en: `${BASE_NAMES[b].en} (${b})` }, text: { ru: `Пара: ${b} — ${PAIR[b]}. ${b === 'G' || b === 'C' ? 'Три' : 'Две'} водородные связи.`, en: `Pairs ${b}–${PAIR[b]} with ${b === 'G' || b === 'C' ? 'three' : 'two'} hydrogen bonds.` } },
    })),
    { color: OLD_STRAND, info: STRAND_INFO.old },
    ...(mode === 'replication'
      ? [
          { color: NEW_STRAND, info: STRAND_INFO.new },
          { color: '#F07AA0', info: HELICASE_INFO },
          { color: '#30A46C', info: POLYMERASE_INFO },
        ]
      : []),
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-4 w-full">
      <div className="flex flex-col gap-3">
        <Stage3D
          lang={lang}
          className="h-[400px] sm:h-[480px] rounded-xl"
          options={{ cameraPosition: [0, 1.2, 9.5], minDistance: 3, maxDistance: 16 }}
          onReady={onReady}
          onReset={(s) => s.flyTo([0, 1.2, 9.5], [0, 0, 0])}
          selected={selected}
          onSelect={setSelected}
        >
          <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            {(['A', 'T', 'G', 'C'] as Base[]).map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED] inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BASE_COLOR[b] }} />
                <span className="font-mono">{b}</span>
                <span className="hidden sm:inline text-[#A0A3AB]">{BASE_NAMES[b][lang]}</span>
              </span>
            ))}
          </div>
        </Stage3D>

        {/* Sequence strip: what the cell actually reads */}
        <div className="bg-surface border border-line rounded-xl px-4 py-3 overflow-x-auto">
          <div className="flex flex-col gap-1 font-mono text-[13px] min-w-max">
            {[sequence, sequence.map((b) => PAIR[b])].map((strand, s) => (
              <div key={s} className="flex items-center gap-[3px]">
                <span className="w-8 text-ink-3 text-xs">{s === 0 ? '5′' : '3′'}</span>
                {strand.map((b, i) => (
                  <span key={i} className="w-5 h-5 rounded flex items-center justify-center text-[11px]" style={{ backgroundColor: BASE_COLOR[b], color: "#fff" }}>
                    {b}
                  </span>
                ))}
                <span className="w-8 text-right text-ink-3 text-xs">{s === 0 ? '3′' : '5′'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <Panel>
          <Segmented<Mode>
            value={mode}
            onChange={(m) => {
              setMode(m);
              modelRef.current?.reset();
              setSelected(null);
            }}
            options={[
              { id: 'helix', label: lang === 'ru' ? 'Двойная спираль' : 'Double helix' },
              { id: 'replication', label: lang === 'ru' ? 'Репликация' : 'Replication' },
            ]}
          />
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
            {mode === 'helix'
              ? lang === 'ru'
                ? 'Две цепи закручены друг вокруг друга. Снаружи — «перила» из сахара и фосфата, внутри — ступеньки-пары оснований: A всегда напротив T, G — напротив C.'
                : 'Two strands wind around each other. Outside are sugar-phosphate rails, inside are base-pair rungs: A always faces T, and G faces C.'
              : lang === 'ru'
                ? 'Хеликаза (розовое кольцо) расплетает цепи. Полимеразы (зелёные) достраивают к каждой старой цепи новую: верхнюю целиком, нижнюю — кусками.'
                : 'Helicase (pink ring) unzips the strands. Polymerases (green) build a new strand onto each old one: the top continuously, the bottom in pieces.'}
          </p>
          <div className="mt-4">
            <Tip lang={lang}>
              {mode === 'helix'
                ? lang === 'ru'
                  ? 'Нажми на любую цветную ступеньку и посмотри, сколько у неё водородных связей.'
                  : 'Tap any coloured rung and see how many hydrogen bonds it has.'
                : lang === 'ru'
                  ? 'Сравни цвета дочерних молекул: в каждой одна серая (старая) и одна бирюзовая (новая) цепь.'
                  : 'Compare the daughters: each has one grey (old) and one teal (new) strand.'}
            </Tip>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4">
            <PlayControls lang={lang} running={running} onToggle={() => setRunning((r) => !r)} onReset={mode === 'replication' ? () => modelRef.current?.reset() : undefined} />
            <Slider label={lang === 'ru' ? 'Скорость' : 'Speed'} value={speed} min={0.25} max={2.5} step={0.25} format={(v) => `${v}×`} onChange={setSpeed} />
            <Toggle label={lang === 'ru' ? 'Водородные связи' : 'Hydrogen bonds'} checked={showBonds} onChange={setShowBonds} />
          </div>
        </Panel>

        <Panel title={lang === 'ru' ? 'Правило Чаргаффа' : 'Chargaff’s rule'}>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="A / T" value={`${counts.c.A} / ${counts.c.T}`} tone="good" />
            <Metric label="G / C" value={`${counts.c.G} / ${counts.c.C}`} tone="good" />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
            {lang === 'ru'
              ? `В двойной ДНК аденина ровно столько же, сколько тимина, а гуанина — сколько цитозина. Доля G + C здесь ${counts.gc}%.`
              : `In double-stranded DNA there’s exactly as much A as T, and as much G as C. G + C here is ${counts.gc}%.`}
          </p>
        </Panel>

        <Panel title={lang === 'ru' ? 'Что на экране' : 'On screen'}>
          <Legend lang={lang} items={legend} selectedTitle={selected?.title.en} onSelect={setSelected} />
        </Panel>
      </aside>
    </div>
  );
};
