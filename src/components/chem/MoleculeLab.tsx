import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Stage3D } from '../lab/Stage3D';
import { Segmented, Toggle } from '../lab/LabUI';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { MOLECULE_DATA } from '../../lib/chem/moleculeData';
import { buildMolecule, disposeGroup, Style } from '../../lib/chem/build3d';
import { element } from '../../lib/chem/elements';

export type MolId = keyof typeof MOLECULE_DATA;

const BOND_WORD = { ru: ['', 'одинарная', 'двойная', 'тройная'], en: ['', 'single', 'double', 'triple'] };

/** Real 3D molecules (PubChem conformers): rotate, switch ball-and-stick / space-filling, tap atoms */
export const MoleculeLab: React.FC<{ lang: 'ru' | 'en'; ids: MolId[] }> = ({ lang, ids }) => {
  const [current, setCurrent] = useState<MolId>(ids[0]);
  const [style, setStyle] = useState<Style>('sticks');
  const [rotate, setRotate] = useState(true);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const stageRef = useRef<ThreeStage | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rotateRef = useRef(rotate);
  rotateRef.current = rotate;
  const [ready, setReady] = useState(false);
  const mol = MOLECULE_DATA[current];

  const composition = useMemo(() => {
    const c: Record<string, number> = {};
    mol.atoms.forEach(([s]) => (c[s] = (c[s] ?? 0) + 1));
    return Object.entries(c);
  }, [mol]);

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    setReady(true);
    return stage.onUpdate((dt) => {
      if (rotateRef.current && groupRef.current) groupRef.current.rotation.y += dt * 0.35;
    });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (groupRef.current) {
      stage.scene.remove(groupRef.current);
      disposeGroup(groupRef.current);
    }
    const built = buildMolecule(mol.atoms, mol.bonds, style, (i, sym, n) => {
      const orders = mol.bonds.filter(([a, b]) => a === i || b === i).map(([, , o]) => o);
      const kinds = [...new Set(orders)].map((o) => BOND_WORD[lang][o]).filter(Boolean);
      return {
        title: { ru: `${element(sym).name.ru} (${sym})`, en: `${element(sym).name.en} (${sym})` },
        text: {
          ru: `${element(sym).text.ru} Здесь: ${n} ${n === 1 ? 'связь' : n < 5 ? 'связи' : 'связей'}${kinds.length ? ` (${kinds.join(', ')})` : ''}.`,
          en: `${element(sym).text.en} Here: ${n} bond${n === 1 ? '' : 's'}${kinds.length ? ` (${kinds.join(', ')})` : ''}.`,
        },
      };
    });
    groupRef.current = built.group;
    stage.scene.add(built.group);
    stage.setPickable(built.meshes);
    const d = Math.max(4.5, (built.radius + (style === 'spheres' ? 1.2 : 0)) * 2.6);
    stage.flyTo([d * 0.35, d * 0.25, d], [0, 0, 0], 0.8);
  }, [mol, style, ready, lang]);

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
              {MOLECULE_DATA[id].name[lang]}
            </button>
          ))}
        </div>
      )}
      <Stage3D
        lang={lang}
        className="h-[380px] sm:h-[460px] rounded-xl"
        options={{ cameraPosition: [2, 1.5, 7], minDistance: 1.5, maxDistance: 40 }}
        onReady={onReady}
        onReset={(s) => {
          const r = groupRef.current ? new THREE.Box3().setFromObject(groupRef.current).getSize(new THREE.Vector3()).length() : 6;
          s.flyTo([r * 0.45, r * 0.3, r * 1.3], [0, 0, 0]);
        }}
        selected={selected}
        onSelect={setSelected}
      >
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          <span className="px-2 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED]">
            {mol.name[lang]} · <span className="font-mono">{mol.formula}</span>
          </span>
        </div>
      </Stage3D>

      <div className="grid md:grid-cols-[1fr_300px] gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-lg text-ink">{mol.name[lang]}</h3>
            <span className="font-mono text-sm text-ink-2">{mol.formula}</span>
          </div>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{mol.text[lang]}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {composition.map(([s, n]) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs text-ink">
                <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: element(s).color }} />
                {element(s).name[lang]} × {n}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
          <Segmented<Style>
            value={style}
            onChange={setStyle}
            options={[
              { id: 'sticks', label: lang === 'ru' ? 'Шаростержневая' : 'Ball & stick' },
              { id: 'spheres', label: lang === 'ru' ? 'Объёмная' : 'Space-filling' },
            ]}
          />
          <Toggle label={lang === 'ru' ? 'Вращение' : 'Auto-rotate'} checked={rotate} onChange={setRotate} />
          <p className="text-[11px] text-ink-3">PubChem CID {mol.cid} · {lang === 'ru' ? 'общественное достояние' : 'public domain'}</p>
        </div>
      </div>
    </div>
  );
};
