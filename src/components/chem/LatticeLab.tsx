import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Stage3D } from '../lab/Stage3D';
import { Toggle } from '../lab/LabUI';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { atomMesh, Bond, disposeGroup } from '../../lib/chem/build3d';
import { element } from '../../lib/chem/elements';
import { MOLECULE_DATA } from '../../lib/chem/moleculeData';

type T2 = { ru: string; en: string };
export type LatticeId = 'nacl' | 'diamond' | 'graphite' | 'metal' | 'molecular';

const LATTICES: Record<LatticeId, { name: T2; kind: T2; text: T2; props: T2 }> = {
  nacl: {
    name: { ru: 'Хлорид натрия NaCl', en: 'Sodium chloride NaCl' },
    kind: { ru: 'Ионная решётка', en: 'Ionic lattice' },
    text: { ru: 'В узлах чередуются ионы Na⁺ и Cl⁻; каждый окружён шестью ионами противоположного знака. Молекул NaCl в кристалле нет!', en: 'Na⁺ and Cl⁻ ions alternate at the lattice points, each surrounded by six of the opposite charge. There are no NaCl molecules in the crystal!' },
    props: { ru: 'Твёрдые, тугоплавкие (801 °C), хрупкие; расплавы и растворы проводят ток.', en: 'Hard, high-melting (801 °C), brittle; melts and solutions conduct electricity.' },
  },
  diamond: {
    name: { ru: 'Алмаз C', en: 'Diamond C' },
    kind: { ru: 'Атомная решётка', en: 'Covalent network' },
    text: { ru: 'Каждый атом углерода связан ковалентно с четырьмя соседями по вершинам тетраэдра (sp³). Весь кристалл — одна гигантская молекула.', en: 'Each carbon is covalently bonded to four neighbours at the corners of a tetrahedron (sp³). The whole crystal is one giant molecule.' },
    props: { ru: 'Самое твёрдое природное вещество, не проводит ток, плавится выше 3500 °C.', en: 'The hardest natural substance; doesn’t conduct; melts above 3500 °C.' },
  },
  graphite: {
    name: { ru: 'Графит C', en: 'Graphite C' },
    kind: { ru: 'Слоистая атомная решётка', en: 'Layered covalent lattice' },
    text: { ru: 'Плоские слои из шестиугольников (sp²). Внутри слоя связи прочные, между слоями — слабые: слои легко скользят.', en: 'Flat sheets of hexagons (sp²). Bonds within a sheet are strong; between sheets they’re weak, so sheets slide easily.' },
    props: { ru: 'Мягкий (грифель карандаша), проводит ток благодаря подвижным π-электронам. Алмаз и графит — аллотропные модификации углерода.', en: 'Soft (pencil lead) and conducts thanks to mobile π electrons. Diamond and graphite are allotropes of carbon.' },
  },
  metal: {
    name: { ru: 'Медь Cu', en: 'Copper Cu' },
    kind: { ru: 'Металлическая решётка', en: 'Metallic lattice' },
    text: { ru: 'Катионы металла в узлах плотной упаковки, между ними — «электронный газ» из обобществлённых электронов.', en: 'Metal cations sit in a close-packed lattice, surrounded by an “electron gas” of shared electrons.' },
    props: { ru: 'Блеск, ковкость, высокая тепло- и электропроводность.', en: 'Lustre, malleability, high thermal and electrical conductivity.' },
  },
  molecular: {
    name: { ru: 'Сухой лёд CO₂', en: 'Dry ice CO₂' },
    kind: { ru: 'Молекулярная решётка', en: 'Molecular lattice' },
    text: { ru: 'В узлах — целые молекулы CO₂, связанные слабыми межмолекулярными силами.', en: 'Whole CO₂ molecules sit at the lattice points, held by weak intermolecular forces.' },
    props: { ru: 'Легкоплавкие и летучие: сухой лёд возгоняется уже при −78 °C. Так же устроены лёд, йод, сахар.', en: 'Low-melting and volatile: dry ice sublimes at −78 °C. Ice, iodine and sugar are built the same way.' },
  },
};

function buildLattice(id: LatticeId, showBonds: boolean) {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const add = (sym: string, p: THREE.Vector3, info: PartInfo, scale = 1) => {
    const m = atomMesh(sym, 'sticks');
    m.scale.multiplyScalar(scale);
    m.position.copy(p);
    m.userData.info = info;
    group.add(m);
    pickables.push(m);
    return m;
  };
  const bond = (a: THREE.Vector3, b: THREE.Vector3, color?: string, r = 0.07) => {
    if (!showBonds) return;
    const bo = new Bond(1, color);
    bo.update(a, b, 1, r);
    group.add(bo.group);
  };
  const ion = (sym: string, charge: string): PartInfo => ({
    title: { ru: `Ион ${sym}${charge}`, en: `${sym}${charge} ion` },
    text: { ru: `${element(sym).name.ru}: ${charge.includes('+') ? 'отдал электрон' : 'принял электрон'}. Удерживается электростатическим притяжением к соседям.`, en: `${element(sym).name.en}: it ${charge.includes('+') ? 'lost' : 'gained'} an electron and is held by electrostatic attraction to its neighbours.` },
  });
  if (id === 'nacl') {
    const a = 1.4;
    const n = 4;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) {
          const p = new THREE.Vector3(i - (n - 1) / 2, j - (n - 1) / 2, k - (n - 1) / 2).multiplyScalar(a);
          const na = (i + j + k) % 2 === 0;
          add(na ? 'Na' : 'Cl', p, na ? ion('Na', '⁺') : ion('Cl', '⁻'), na ? 0.55 : 0.85);
          if (i < n - 1) bond(p, p.clone().add(new THREE.Vector3(a, 0, 0)), '#5A5D66', 0.04);
          if (j < n - 1) bond(p, p.clone().add(new THREE.Vector3(0, a, 0)), '#5A5D66', 0.04);
          if (k < n - 1) bond(p, p.clone().add(new THREE.Vector3(0, 0, a)), '#5A5D66', 0.04);
        }
  } else if (id === 'diamond' || id === 'metal') {
    // fcc points (+ tetrahedral basis for diamond)
    const a = id === 'diamond' ? 2.6 : 2.2;
    const base = [
      [0, 0, 0],
      [0.5, 0.5, 0],
      [0.5, 0, 0.5],
      [0, 0.5, 0.5],
    ];
    const pts: THREE.Vector3[] = [];
    const cells = 2;
    for (let i = 0; i < cells; i++)
      for (let j = 0; j < cells; j++)
        for (let k = 0; k < cells; k++)
          base.forEach(([x, y, z]) => {
            pts.push(new THREE.Vector3(i + x, j + y, k + z));
            if (id === 'diamond') pts.push(new THREE.Vector3(i + x + 0.25, j + y + 0.25, k + z + 0.25));
          });
    // close the outer faces
    for (let i = 0; i <= cells; i++)
      for (let j = 0; j <= cells; j++)
        for (let k = 0; k <= cells; k++) if (i === cells || j === cells || k === cells) pts.push(new THREE.Vector3(i, j, k));
    const off = new THREE.Vector3(cells / 2, cells / 2, cells / 2);
    const uniq: THREE.Vector3[] = [];
    pts.forEach((p) => {
      if (p.x > cells + 1e-6 || p.y > cells + 1e-6 || p.z > cells + 1e-6) return;
      if (!uniq.some((q) => q.distanceToSquared(p) < 1e-6)) uniq.push(p);
    });
    const world = uniq.map((p) => p.clone().sub(off).multiplyScalar(a));
    const info: PartInfo =
      id === 'diamond'
        ? { title: { ru: 'Атом углерода', en: 'Carbon atom' }, text: { ru: 'Четыре ковалентные связи по 0,154 нм, углы 109,5°.', en: 'Four covalent bonds of 0.154 nm at 109.5°.' } }
        : { title: { ru: 'Катион меди Cu²⁺', en: 'Copper cation' }, text: { ru: 'Отдал валентные электроны в общий «электронный газ».', en: 'Gave its valence electrons to the shared electron gas.' } };
    world.forEach((p) => add(id === 'diamond' ? 'C' : 'Cu', p, info, id === 'diamond' ? 0.9 : 1.35));
    if (id === 'diamond') {
      const lim = (a * Math.sqrt(3)) / 4 + 0.05;
      for (let i = 0; i < world.length; i++) for (let j = i + 1; j < world.length; j++) if (world[i].distanceTo(world[j]) < lim) bond(world[i], world[j], '#9AA0AA', 0.08);
    } else {
      // free electrons drifting between the ions
      const eMat = new THREE.MeshBasicMaterial({ color: '#3DD6F5' });
      for (let i = 0; i < 70; i++) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), eMat);
        e.position.set((Math.random() - 0.5) * a * cells, (Math.random() - 0.5) * a * cells, (Math.random() - 0.5) * a * cells);
        e.userData.v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.2);
        e.userData.electron = true;
        e.userData.info = { title: { ru: 'Свободный электрон', en: 'Free electron' }, text: { ru: 'Обобществлённые электроны свободно движутся по всему кристаллу — поэтому металлы проводят ток и тепло.', en: 'Shared electrons roam through the whole crystal, which is why metals conduct electricity and heat.' } };
        group.add(e);
      }
    }
  } else if (id === 'graphite') {
    const d = 1.42;
    const layerGap = 3.35 * 0.6;
    for (let L = 0; L < 3; L++) {
      const pts: THREE.Vector3[] = [];
      const shift = L % 2 ? d : 0;
      for (let i = -3; i <= 3; i++)
        for (let j = -3; j <= 3; j++) {
          const cx = i * d * Math.sqrt(3) + (j % 2 ? (d * Math.sqrt(3)) / 2 : 0) + shift;
          const cz = j * d * 1.5;
          [0, 1].forEach((s) => {
            const p = new THREE.Vector3(cx, (L - 1) * layerGap, cz + (s ? d : 0));
            if (Math.abs(p.x) < 5 && Math.abs(p.z) < 5) pts.push(p);
          });
        }
      pts.forEach((p) => add('C', p, { title: { ru: 'Атом углерода (слой)', en: 'Carbon atom (layer)' }, text: { ru: 'Три прочные связи в плоскости слоя, четвёртый электрон — в общем π-облаке слоя.', en: 'Three strong bonds in the sheet; the fourth electron joins the sheet’s shared π cloud.' } }, 0.75));
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (pts[i].distanceTo(pts[j]) < d + 0.05) bond(pts[i], pts[j], '#9AA0AA', 0.07);
    }
  } else {
    // molecular: CO2 molecules on fcc points
    const mol = MOLECULE_DATA.co2;
    const a = 3.6;
    const base = [
      [0, 0, 0],
      [0.5, 0.5, 0],
      [0.5, 0, 0.5],
      [0, 0.5, 0.5],
    ];
    const dirs = [new THREE.Vector3(1, 1, 1), new THREE.Vector3(-1, -1, 1), new THREE.Vector3(-1, 1, -1), new THREE.Vector3(1, -1, -1)].map((v) => v.normalize());
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        for (let k = 0; k < 2; k++)
          base.forEach(([x, y, z], b) => {
            const c = new THREE.Vector3(i + x - 0.75, j + y - 0.75, k + z - 0.75).multiplyScalar(a);
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dirs[b]);
            const pos = mol.atoms.map(([, px, py, pz]) => new THREE.Vector3(px, py, pz).applyQuaternion(q).add(c));
            mol.atoms.forEach(([sym], n) =>
              add(sym, pos[n], { title: { ru: 'Молекула CO₂', en: 'CO₂ molecule' }, text: { ru: 'Внутри молекулы — прочные ковалентные связи, между молекулами — слабые силы Ван-дер-Ваальса.', en: 'Strong covalent bonds inside the molecule; weak van der Waals forces between molecules.' } }, 0.9),
            );
            mol.bonds.forEach(([x2, y2, o]) => {
              const bo = new Bond(o);
              bo.update(pos[x2], pos[y2]);
              group.add(bo.group);
            });
          });
  }
  return { group, pickables };
}

/** Crystal lattices in 3D: ionic, covalent network, layered, metallic and molecular */
export const LatticeLab: React.FC<{ lang: 'ru' | 'en'; ids: LatticeId[] }> = ({ lang, ids }) => {
  const [current, setCurrent] = useState<LatticeId>(ids[0]);
  const [bonds, setBonds] = useState(true);
  const [rotate, setRotate] = useState(true);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const stageRef = useRef<ThreeStage | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rotateRef = useRef(rotate);
  rotateRef.current = rotate;
  const [ready, setReady] = useState(false);
  const L = LATTICES[current];

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    setReady(true);
    return stage.onUpdate((dt) => {
      const g = groupRef.current;
      if (!g) return;
      if (rotateRef.current) g.rotation.y += dt * 0.2;
      g.children.forEach((o) => {
        if (!o.userData.electron) return;
        o.position.addScaledVector(o.userData.v as THREE.Vector3, dt);
        (['x', 'y', 'z'] as const).forEach((ax) => {
          if (Math.abs(o.position[ax]) > 2.3) (o.userData.v as THREE.Vector3)[ax] *= -1;
        });
      });
    });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (groupRef.current) {
      stage.scene.remove(groupRef.current);
      disposeGroup(groupRef.current);
    }
    const b = buildLattice(current, bonds);
    groupRef.current = b.group;
    stage.scene.add(b.group);
    stage.setPickable(b.pickables);
    const size = new THREE.Box3().setFromObject(b.group).getSize(new THREE.Vector3()).length();
    stage.flyTo([size * 0.45, size * 0.35, size * 0.8], [0, 0, 0], 0.8);
  }, [current, bonds, ready]);

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
              {LATTICES[id].kind[lang]}
            </button>
          ))}
        </div>
      )}
      <Stage3D
        lang={lang}
        className="h-[380px] sm:h-[460px] rounded-xl"
        options={{ cameraPosition: [7, 5, 10], minDistance: 3, maxDistance: 40 }}
        onReady={onReady}
        onReset={(s) => {
          const size = groupRef.current ? new THREE.Box3().setFromObject(groupRef.current).getSize(new THREE.Vector3()).length() : 12;
          s.flyTo([size * 0.45, size * 0.35, size * 0.8], [0, 0, 0]);
        }}
        selected={selected}
        onSelect={setSelected}
      >
        <span className="pointer-events-none absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED]">{L.name[lang]}</span>
      </Stage3D>
      <div className="grid md:grid-cols-[1fr_260px] gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <h3 className="font-serif text-lg text-ink">{L.kind[lang]}</h3>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{L.text[lang]}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink">
            <span className="text-accent font-medium">{lang === 'ru' ? 'Свойства: ' : 'Properties: '}</span>
            {L.props[lang]}
          </p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
          <Toggle label={lang === 'ru' ? 'Показывать связи' : 'Show bonds'} checked={bonds} onChange={setBonds} />
          <Toggle label={lang === 'ru' ? 'Вращение' : 'Auto-rotate'} checked={rotate} onChange={setRotate} />
        </div>
      </div>
    </div>
  );
};
