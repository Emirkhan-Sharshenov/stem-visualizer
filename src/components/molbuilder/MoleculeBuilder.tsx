import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Minus, RotateCcw } from 'lucide-react';
import { Stage3D } from '../lab/Stage3D';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { atomInfo, atomMesh, Bond, disposeGroup } from '../../lib/chem/build3d';
import { analyse, CENTRAL, ligand, LIGANDS, PRESETS, Result } from './vsepr';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
const BOND_LEN: Record<number, number> = { 1: 1.45, 2: 1.3, 3: 1.2 };

/** build the 3D model for an analysis result */
function buildModel(center: string, ligs: string[], r: Result, showLP: boolean, showDipole: boolean) {
  const group = new THREE.Group();
  const c = atomMesh(center, 'sticks');
  c.scale.multiplyScalar(1.15);
  c.userData.info = atomInfo(center, { ru: `Центральный атом: ${CENTRAL[center].valence} валентных электронов.`, en: `Central atom: ${CENTRAL[center].valence} valence electrons.` });
  group.add(c);
  const pickable: THREE.Object3D[] = [c];
  if (!r.ok) return { group, pickable };
  ligs.forEach((id, i) => {
    const L = ligand(id);
    const d = new THREE.Vector3(...r.bonds[i]);
    const p = d.clone().multiplyScalar(BOND_LEN[L.order] + (L.atom === 'H' ? -0.2 : 0.1));
    const m = atomMesh(L.atom, 'sticks');
    m.position.copy(p);
    m.userData.info = atomInfo(L.atom, { ru: `Связь ${['', 'одинарная', 'двойная', 'тройная'][L.order]}.`, en: `${['', 'Single', 'Double', 'Triple'][L.order]} bond.` });
    group.add(m);
    pickable.push(m);
    const b = new Bond(L.order);
    b.update(new THREE.Vector3(), p);
    group.add(b.group);
  });
  if (showLP)
    r.lps.forEach((v, i) => {
      const radical = r.radical && i === r.lps.length - 1;
      const geo = new THREE.SphereGeometry(1, 24, 16);
      const mat = new THREE.MeshStandardMaterial({ color: radical ? '#F5A524' : '#C3A6FF', emissive: radical ? '#5A3A00' : '#3A2A70', transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.3 });
      const lobe = new THREE.Mesh(geo, mat);
      const d = new THREE.Vector3(...v);
      lobe.scale.set(0.42, radical ? 0.5 : 0.75, 0.42);
      lobe.position.copy(d.clone().multiplyScalar(radical ? 0.75 : 0.95));
      lobe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
      lobe.userData.info = {
        title: radical ? { ru: 'Неспаренный электрон', en: 'Unpaired electron' } : { ru: 'Неподелённая электронная пара', en: 'Lone pair' },
        text: radical
          ? { ru: 'Один электрон без пары — молекула является радикалом. Он тоже отталкивает связи.', en: 'A single unpaired electron makes this a radical; it also pushes the bonds.' }
          : { ru: 'Два электрона центрального атома, не участвующие в связях. Они отталкивают связи сильнее, чем связи друг друга, поэтому угол становится меньше.', en: 'Two electrons of the central atom not used in bonds. They push harder than bonds do, so the angle closes up.' },
      } satisfies PartInfo;
      group.add(lobe);
      pickable.push(lobe);
    });
  const dl = Math.hypot(...r.dipole);
  if (showDipole && r.polar && dl > 0) {
    const dir = new THREE.Vector3(...r.dipole).normalize();
    const arrow = new THREE.ArrowHelper(dir, dir.clone().multiplyScalar(-1.1), 2.2 + Math.min(1.2, dl * 0.5), 0x3dd6f5, 0.35, 0.22);
    group.add(arrow);
  }
  return { group, pickable };
}

export const MoleculeBuilder: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [center, setCenter] = useState('O');
  const [ligs, setLigs] = useState<string[]>(['H', 'H']);
  const [charge, setCharge] = useState(0);
  const [showLP, setShowLP] = useState(true);
  const [showDipole, setShowDipole] = useState(true);
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const stage = useRef<ThreeStage | null>(null);
  const current = useRef<THREE.Group | null>(null);
  const r = useMemo(() => analyse(center, ligs, charge), [center, ligs, charge]);

  useEffect(() => progress.recordLab('sandbox-molecules'), []);

  const rebuild = () => {
    const st = stage.current;
    if (!st) return;
    if (current.current) {
      st.scene.remove(current.current);
      disposeGroup(current.current);
    }
    const { group, pickable } = buildModel(center, ligs, r, showLP, showDipole);
    st.scene.add(group);
    st.setPickable(pickable);
    current.current = group;
  };
  const rebuildRef = useRef(rebuild);
  rebuildRef.current = rebuild;
  useEffect(rebuild, [center, ligs, r, showLP, showDipole]);

  const add = (id: string) => setLigs((l) => [...l, id]);
  const remove = () => setLigs((l) => l.slice(0, -1));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {PRESETS.map((p, i) => {
          const a = analyse(p.center, p.ligs, p.charge ?? 0);
          const on = p.center === center && p.ligs.join() === ligs.join() && (p.charge ?? 0) === charge;
          return (
            <button
              key={i}
              onClick={() => {
                setCenter(p.center);
                setLigs(p.ligs);
                setCharge(p.charge ?? 0);
                setSelected(null);
              }}
              className={`shrink-0 h-9 px-3 rounded-full text-sm border cursor-pointer font-mono ${on ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
              style={on ? { color: '#fff' } : undefined}
              title={a.name?.[lang]}
            >
              {a.formula}
            </button>
          );
        })}
      </div>
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Теория отталкивания электронных пар (VSEPR)', 'Valence-shell electron-pair repulsion (VSEPR)')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('Электронные пары вокруг центрального атома — и связи, и неподелённые пары (фиолетовые облака) — отталкиваются и расходятся как можно дальше. Отсюда и форма молекулы. Собери молекулу сам: выбери центральный атом и добавляй к нему атомы.', 'Electron pairs around the central atom, bonds and lone pairs (violet clouds) alike, push each other as far apart as they can. That sets the shape. Build one yourself: pick a central atom and attach atoms.')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <Stage3D
          lang={lang}
          className="h-[380px] sm:h-[460px] rounded-xl border border-[#1F2126]"
          options={{ cameraPosition: [0, 0.8, 5.2], minDistance: 2.5, maxDistance: 12 }}
          onReady={(st) => {
            stage.current = st;
            rebuildRef.current();
            // slow spin so the 3D shape reads at a glance
            const off = st.onUpdate((dt) => {
              if (current.current) current.current.rotation.y += dt * 0.25;
            });
            return () => {
              off();
              stage.current = null;
            };
          }}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-ink-2 mb-1.5">{L('Центральный атом', 'Central atom')}</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CENTRAL).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setCenter(a);
                      setSelected(null);
                    }}
                    className={`h-8 w-10 rounded-md text-sm font-mono border cursor-pointer ${center === a ? 'bg-accent border-accent' : 'bg-surface border-line text-ink'}`}
                    style={center === a ? { color: '#fff' } : undefined}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-ink-2 mb-1.5">{L('Присоединить', 'Attach')}</div>
              <div className="flex flex-wrap gap-1.5">
                {LIGANDS.map((l) => (
                  <button key={l.id} onClick={() => add(l.id)} disabled={ligs.length >= 6} className="h-8 px-2.5 rounded-md text-sm font-mono border border-line bg-surface text-ink hover:bg-muted disabled:opacity-40 cursor-pointer">
                    +{l.label}
                  </button>
                ))}
                <button onClick={remove} disabled={!ligs.length} className="h-8 px-2.5 rounded-md text-sm border border-line bg-surface text-ink hover:bg-muted disabled:opacity-40 cursor-pointer inline-flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" />
                  {L('убрать', 'remove')}
                </button>
                <button onClick={() => setLigs([])} className="h-8 px-2.5 rounded-md text-sm border border-line bg-surface text-ink-2 hover:bg-muted cursor-pointer inline-flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-2">{L('Заряд', 'Charge')}:</span>
              {[-1, 0, 1].map((q) => (
                <button key={q} onClick={() => setCharge(q)} className={`h-7 w-9 rounded-md text-sm font-mono border cursor-pointer ${charge === q ? 'bg-accent border-accent' : 'bg-surface border-line text-ink'}`} style={charge === q ? { color: '#fff' } : undefined}>
                  {q > 0 ? '+1' : q < 0 ? '−1' : '0'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showLP} onChange={(e) => setShowLP(e.target.checked)} className="w-4 h-4 accent-[#2F5BFF]" />
                {L('Неподелённые пары', 'Lone pairs')}
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showDipole} onChange={(e) => setShowDipole(e.target.checked)} className="w-4 h-4 accent-[#2F5BFF]" />
                {L('Дипольный момент', 'Dipole')}
              </label>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-2xl text-ink">{r.formula}</span>
              {r.name && <span className="text-sm text-ink-2">{r.name[lang]}</span>}
            </div>
            {r.ok ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {[
                  { k: L('Форма', 'Shape'), v: r.shape?.[lang] ?? '—' },
                  { k: L('Угол связи', 'Bond angle'), v: r.angle !== null ? `≈ ${Math.round(r.angle * 10) / 10}°`.replace('.', ',') : '—' },
                  { k: L('Гибридизация', 'Hybridisation'), v: r.hybrid },
                  { k: L('Электронных пар', 'Electron domains'), v: `${r.sn} (${L('связей', 'bonds')} ${ligs.length}, ${L('непод.', 'lone')} ${r.lonePairs}${r.radical ? ' + e' : ''})` },
                  { k: L('Полярность', 'Polarity'), v: r.polar ? L('полярная', 'polar') : L('неполярная', 'non-polar') },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg bg-muted px-3 py-2">
                    <div className="text-[11px] text-ink-2">{x.k}</div>
                    <div className="text-ink">{x.v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#CC2F35]">{r.error?.[lang]}</p>
            )}
            {r.ok && !r.polar && ligs.length > 1 && <p className="mt-2 text-xs text-ink-2">{L('Связи могут быть полярными, но из-за симметрии их диполи гасят друг друга.', 'The bonds may be polar, but symmetry makes their dipoles cancel.')}</p>}
            {r.ok && r.polar && <p className="mt-2 text-xs text-ink-2">{L('Голубая стрелка — суммарный диполь: в сторону более электроотрицательной части молекулы.', 'The blue arrow is the net dipole, towards the more electronegative side.')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoleculeBuilder;
