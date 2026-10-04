import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play } from 'lucide-react';
import { Stage3D } from './lab/Stage3D';
import type { PartInfo, ThreeStage } from '../lib/three/ThreeStage';
import { BioModel, buildAtpSynthase, buildCell, buildMembrane, buildMitochondrion } from '../lib/three/bioModels';

interface BiologyDeepZoomProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export type BioScaleLevel = 'cell' | 'mitochondria' | 'membrane' | 'atp_rotor';

const LEVELS: { id: BioScaleLevel; scale: string; label: { ru: string; en: string }; title: { ru: string; en: string }; text: { ru: string; en: string }; tip: { ru: string; en: string } }[] = [
  {
    id: 'cell',
    scale: '≈ 20 µm',
    label: { ru: 'Клетка', en: 'Cell' },
    title: { ru: 'Животная клетка', en: 'An animal cell' },
    text: {
      ru: 'Внутри мембраны работает целый завод: ядро хранит инструкции, ЭПС и Гольджи собирают и рассылают белки, а митохондрии дают энергию.',
      en: 'Inside the membrane runs a whole factory: the nucleus keeps the instructions, the ER and Golgi build and ship proteins, and mitochondria supply energy.',
    },
    tip: { ru: 'Нажми на любую оранжевую митохондрию и приблизь её.', en: 'Tap any orange mitochondrion and zoom in.' },
  },
  {
    id: 'mitochondria',
    scale: '≈ 2 µm',
    label: { ru: 'Митохондрия', en: 'Mitochondrion' },
    title: { ru: 'Митохондрия', en: 'The mitochondrion' },
    text: {
      ru: 'Две мембраны: гладкая снаружи и складчатая внутри. Складки — кристы — дают место тысячам белковых машин, которые делают АТФ.',
      en: 'Two membranes: smooth outside, folded inside. The folds, called cristae, make room for thousands of protein machines that make ATP.',
    },
    tip: { ru: 'Нажми на красную складку-кристу, чтобы увидеть её мембрану.', en: 'Tap a red crista to see its membrane up close.' },
  },
  {
    id: 'membrane',
    scale: '≈ 30 nm',
    label: { ru: 'Мембрана', en: 'Membrane' },
    title: { ru: 'Дыхательная цепь', en: 'The respiratory chain' },
    text: {
      ru: 'Комплексы I, III и IV используют энергию электронов, чтобы выкачивать протоны наверх. Наверху их скапливается много, и они стремятся вернуться — через АТФ-синтазу.',
      en: 'Complexes I, III and IV use electron energy to pump protons upward. They pile up above and push to get back, through ATP synthase.',
    },
    tip: { ru: 'Уменьши градиент и посмотри, как замедляется поток через синтазу.', en: 'Lower the gradient and watch the flow through the synthase slow down.' },
  },
  {
    id: 'atp_rotor',
    scale: '≈ 10 nm',
    label: { ru: 'АТФ-синтаза', en: 'ATP synthase' },
    title: { ru: 'АТФ-синтаза — настоящий мотор', en: 'ATP synthase, a real motor' },
    text: {
      ru: 'Протоны проходят через кольцо c и вращают его вместе с осью γ. Ось по очереди сжимает три синие β-субъединицы, и каждая выпускает молекулу АТФ.',
      en: 'Protons pass through the c-ring and turn it together with the γ shaft. The shaft squeezes the three blue β subunits in turn, and each releases an ATP.',
    },
    tip: { ru: 'Поставь градиент на 0 — мотор встанет, и АТФ перестанет появляться.', en: 'Set the gradient to 0: the motor stops and no more ATP appears.' },
  },
];

interface LegendItem {
  info: PartInfo;
  color: string;
}

function legendOf(model: BioModel): LegendItem[] {
  const seen = new Map<string, LegendItem>();
  model.pickables.forEach((o) => {
    const info = o.userData.info as PartInfo | undefined;
    if (!info || seen.has(info.title.en)) return;
    let color = '#8C8F98';
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (color === '#8C8F98' && m && 'color' in m) color = `#${m.color.getHexString()}`;
    });
    seen.set(info.title.en, { info, color });
  });
  return [...seen.values()];
}

export const BiologyDeepZoom: React.FC<BiologyDeepZoomProps> = ({ lang, onSelectConceptForMentor }) => {
  const [level, setLevel] = useState<BioScaleLevel>('cell');
  const [gradient, setGradient] = useState(70);
  const [running, setRunning] = useState(true);
  const [atpCount, setAtpCount] = useState(0);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const [legends, setLegends] = useState<Record<BioScaleLevel, LegendItem[]>>({ cell: [], mitochondria: [], membrane: [], atp_rotor: [] });
  const [fading, setFading] = useState(false);

  const stageRef = useRef<ThreeStage | null>(null);
  const modelsRef = useRef<Record<BioScaleLevel, BioModel> | null>(null);
  const simRef = useRef({ gradient: 0.7, running: true, level: 'cell' as BioScaleLevel });
  const atpRef = useRef(0);

  simRef.current.gradient = gradient / 100;
  simRef.current.running = running;

  useEffect(() => {
    onSelectConceptForMentor('mitochondria', { scaleLevel: level, protonGradient: gradient });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, gradient]);

  // Batch ATP counter updates so React doesn't re-render every frame
  useEffect(() => {
    const id = setInterval(() => setAtpCount(atpRef.current), 250);
    return () => clearInterval(id);
  }, []);

  const showLevel = (next: BioScaleLevel, animate = true) => {
    const stage = stageRef.current;
    const models = modelsRef.current;
    if (!stage || !models) return;
    const apply = () => {
      (Object.keys(models) as BioScaleLevel[]).forEach((id) => (models[id].group.visible = id === next));
      stage.setPickable(models[next].pickables);
      const { position, target } = models[next].camera;
      if (animate) {
        // Start slightly closer and pull back, which reads as arriving at a new scale
        stage.camera.position.set(position[0] * 0.55, position[1] * 0.55, position[2] * 0.55);
        stage.controls.target.set(...target);
        stage.flyTo(position, target, 1.2);
      } else {
        stage.camera.position.set(...position);
        stage.controls.target.set(...target);
      }
      simRef.current.level = next;
    };
    if (!animate) return apply();
    setFading(true);
    setTimeout(() => {
      apply();
      setFading(false);
    }, 220);
  };

  const goTo = (next: BioScaleLevel) => {
    setSelected(null);
    setLevel(next);
    showLevel(next);
  };

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    const models: Record<BioScaleLevel, BioModel> = {
      cell: buildCell(),
      mitochondria: buildMitochondrion(),
      membrane: buildMembrane(),
      atp_rotor: buildAtpSynthase(() => {
        atpRef.current += 1;
      }),
    };
    modelsRef.current = models;
    Object.values(models).forEach((m) => stage.scene.add(m.group));
    setLegends({
      cell: legendOf(models.cell),
      mitochondria: legendOf(models.mitochondria),
      membrane: legendOf(models.membrane),
      atp_rotor: legendOf(models.atp_rotor),
    });
    showLevel('cell', false);
    return stage.onUpdate((dt, elapsed) => {
      const sim = simRef.current;
      models[sim.level].update(dt, elapsed, sim);
    });
  };

  const current = LEVELS.find((l) => l.id === level)!;
  const levelIndex = LEVELS.findIndex((l) => l.id === level);
  const legend = useMemo(() => legends[level], [legends, level]);
  const showGradient = level === 'membrane' || level === 'atp_rotor';

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header + scale stepper */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
            <span className="w-2 h-2 rounded-full bg-biology" />
            {lang === 'ru' ? 'Биология · 9–11 класс' : 'Biology · grades 9–11'}
          </div>
          <h1 className="mt-1.5 font-serif text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-ink">
            {lang === 'ru' ? 'Откуда клетка берёт энергию' : 'Where a cell gets its energy'}
          </h1>
        </div>
        <div className="flex p-1 rounded-lg bg-muted border border-line overflow-x-auto">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => l.id !== level && goTo(l.id)}
              className={`shrink-0 h-9 px-3 rounded-md text-sm inline-flex items-center gap-2 transition-colors cursor-pointer ${
                level === l.id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <span className="font-mono text-xs text-ink-3">{i + 1}</span>
              {l.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <Stage3D
          lang={lang}
          className="h-[440px] sm:h-[540px] rounded-xl"
          options={{ minDistance: 1.5, maxDistance: 22 }}
          onReady={onReady}
          onGoTo={(g) => goTo(g as BioScaleLevel)}
          onReset={() => showLevel(level)}
          selected={selected}
          onSelect={setSelected}
        >
          {/* Fade between scales */}
          <div className={`pointer-events-none absolute inset-0 z-10 bg-stage transition-opacity duration-200 ${fading ? 'opacity-100' : 'opacity-0'}`} />

          <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] font-mono text-[12px] text-[#EDEDED]">{current.scale}</span>
            <span className="hidden sm:inline px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#A0A3AB]">
              {levelIndex + 1} / {LEVELS.length} · {current.label[lang]}
            </span>
          </div>

          {showGradient && (
            <>
              <span className="pointer-events-none absolute top-14 left-3 z-10 text-[11px] uppercase tracking-[0.06em] text-[#FF8F8F]">
                {lang === 'ru' ? 'Межмембранное пространство · много H⁺' : 'Intermembrane space · lots of H⁺'}
              </span>
              <span className="pointer-events-none absolute bottom-14 left-3 z-10 text-[11px] uppercase tracking-[0.06em] text-[#8C8F98]">
                {lang === 'ru' ? 'Матрикс · мало H⁺' : 'Matrix · few H⁺'}
              </span>
            </>
          )}
        </Stage3D>

        {/* Side panel */}
        <aside className="flex flex-col gap-4">
          <section className="bg-surface border border-line rounded-xl p-5">
            <h2 className="font-serif text-xl text-ink">{current.title[lang]}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{current.text[lang]}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink bg-muted rounded-lg px-3 py-2">
              <span className="text-accent font-medium">{lang === 'ru' ? 'Попробуй: ' : 'Try: '}</span>
              {current.tip[lang]}
            </p>
          </section>

          {showGradient && (
            <section className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{lang === 'ru' ? 'Протонный градиент' : 'Proton gradient'}</span>
                  <span className="font-mono text-ink">{gradient}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={gradient}
                  onChange={(e) => setGradient(Number(e.target.value))}
                  className="mt-2 w-full accent-[#2F5BFF] cursor-pointer"
                />
              </div>
              {level === 'atp_rotor' && (
                <div className="grid grid-cols-2 gap-3">
                  <Metric label={lang === 'ru' ? 'Собрано АТФ' : 'ATP made'} value={String(atpCount)} />
                  <Metric label={lang === 'ru' ? 'Скорость' : 'Speed'} value={`${Math.round(gradient * 1.5)} ${lang === 'ru' ? 'об/с' : 'rev/s'}`} />
                </div>
              )}
              {level === 'atp_rotor' && (
                <p className="text-[12.5px] leading-relaxed text-ink-3">
                  {lang === 'ru'
                    ? 'В живой клетке ротор делает до 150 оборотов в секунду. Здесь он замедлен, чтобы было видно каждый шаг.'
                    : 'In a living cell the rotor turns up to 150 times a second. It’s slowed down here so you can see every step.'}
                </p>
              )}
            </section>
          )}

          <section className="bg-surface border border-line rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Что на экране' : 'On screen'}</h3>
              <button
                onClick={() => setRunning((r) => !r)}
                className="h-8 px-2.5 rounded-md border border-line bg-surface hover:bg-muted text-sm text-ink inline-flex items-center gap-1.5 cursor-pointer"
              >
                {running ? <Pause className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Play className="w-3.5 h-3.5" strokeWidth={1.75} />}
                {running ? (lang === 'ru' ? 'Пауза' : 'Pause') : lang === 'ru' ? 'Пуск' : 'Play'}
              </button>
            </div>
            <ul className="mt-3 flex flex-col">
              {legend.map((item) => (
                <li key={item.info.title.en}>
                  <button
                    onClick={() => setSelected(item.info)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md text-left text-sm transition-colors cursor-pointer ${
                      selected?.title.en === item.info.title.en ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-muted hover:text-ink'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    {item.info.title[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-muted px-3 py-2">
    <div className="text-xs text-ink-2">{label}</div>
    <div className="mt-0.5 font-mono text-lg text-ink">{value}</div>
  </div>
);
