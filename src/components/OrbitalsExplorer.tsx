import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitalRenderStyle, OrbitalType, ExplanationLevel } from '../types/stem';
import { CONCEPTS_LIST } from '../data/concepts';
import { Pause, Play } from 'lucide-react';
import { Stage3D } from './lab/Stage3D';
import { Formula } from './Formula';
import type { PartInfo, ThreeStage } from '../lib/three/ThreeStage';
import { sampleOrbital } from '../lib/orbitals';

interface OrbitalsExplorerProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onOpenPrediction: (challengeId: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

const ORBITALS: { type: OrbitalType; n: number; l: number; m: number; label: string; tex: string; text: { ru: string; en: string } }[] = [
  { type: '1s', n: 1, l: 0, m: 0, label: '1s', tex: '\\psi_{1s} \\propto e^{-r}', text: { ru: 'Сфера без узлов. Электрон чаще всего рядом с ядром, а плотность плавно спадает наружу.', en: 'A sphere with no nodes. The electron is most often near the nucleus, and density fades smoothly outward.' } },
  { type: '2s', n: 2, l: 0, m: 0, label: '2s', tex: '\\psi_{2s} \\propto (2-r)\\,e^{-r/2}', text: { ru: 'Тоже сфера, но внутри неё есть узловая сфера радиусом 2a₀: внутри и снаружи от неё знак ψ разный.', en: 'Also a sphere, but with a nodal sphere at r = 2a₀ inside: ψ has opposite signs on either side of it.' } },
  { type: '2pz', n: 2, l: 1, m: 0, label: '2p_z', tex: '\\psi_{2p_z} \\propto z\\,e^{-r/2}', text: { ru: 'Две доли вдоль оси z с разными знаками ψ. Между ними плоскость xy, где электрона не бывает никогда.', en: 'Two lobes along z with opposite signs of ψ. Between them lies the xy plane, where the electron is never found.' } },
  { type: '2px', n: 2, l: 1, m: 1, label: '2p_x', tex: '\\psi_{2p_x} \\propto x\\,e^{-r/2}', text: { ru: 'Та же гантель, но повёрнутая вдоль x. Три p-орбитали смотрят вдоль трёх осей и задают углы химических связей.', en: 'The same dumbbell, turned along x. The three p orbitals point along the three axes and set the angles of chemical bonds.' } },
  { type: '3dz2', n: 3, l: 2, m: 0, label: '3d_{z²}', tex: '\\psi \\propto (3z^2-r^2)\\,e^{-r/3}', text: { ru: 'Две доли вдоль z и «бублик» вокруг ядра. Узловые поверхности здесь — два конуса.', en: 'Two lobes along z and a doughnut around the nucleus. The nodal surfaces are two cones.' } },
  { type: '3dxy', n: 3, l: 2, m: -2, label: '3d_{xy}', tex: '\\psi \\propto xy\\,e^{-r/3}', text: { ru: 'Четыре лепестка между осями x и y. Узлы — плоскости xz и yz.', en: 'Four petals between the x and y axes. The nodes are the xz and yz planes.' } },
  { type: '4f', n: 4, l: 3, m: 0, label: '4f_{z³}', tex: '\\psi \\propto z(5z^2-3r^2)\\,e^{-r/4}', text: { ru: 'Шесть областей вдоль z, разделённых плоскостью и двумя конусами — три узловые поверхности, потому что ℓ = 3.', en: 'Six regions along z, split by a plane and two cones: three nodal surfaces, because ℓ = 3.' } },
];

const STYLES: { id: OrbitalRenderStyle; label: { ru: string; en: string } }[] = [
  { id: 'density', label: { ru: 'Плотность', en: 'Density' } },
  { id: 'phase', label: { ru: 'Фаза ±', en: 'Phase ±' } },
  { id: 'nodes', label: { ru: 'Узлы', en: 'Nodes' } },
  { id: 'slice', label: { ru: 'Срез', en: 'Slice' } },
  { id: 'dots', label: { ru: 'Точки', en: 'Dots' } },
];

const POS = new THREE.Color('#5B7CFF');
const NEG = new THREE.Color('#F5A524');
const LOW = new THREE.Color('#3B4CA8');
const HIGH = new THREE.Color('#B9C6FF');
const DIM = new THREE.Color('#3A3F52');

const info = (ru: string, en: string, tRu: string, tEn: string): PartInfo => ({ title: { ru, en }, text: { ru: tRu, en: tEn } });

const NUCLEUS_INFO = info('Ядро (протон)', 'Nucleus (a proton)', 'В 100 000 раз меньше облака. Если бы атом был стадионом, ядро было бы горошиной в центре поля.', 'About 100,000 times smaller than the cloud. If the atom were a stadium, the nucleus would be a pea at the centre spot.');
const NODE_INFO = info('Узловая поверхность', 'Nodal surface', 'Здесь ψ = 0, значит вероятность найти электрон ровно ноль. Число таких поверхностей равно n − 1.', 'Here ψ = 0, so the chance of finding the electron is exactly zero. There are n − 1 such surfaces.');
const AXES_INFO = info('Оси координат', 'Coordinate axes', 'Красная — x, зелёная — y (в физике это z), синяя — z. Ориентация орбитали задаётся магнитным числом m.', 'Red is x, green is up (z in physics), blue is the third axis. The magnetic number m sets the orbital’s orientation.');

function nodalSurfaces(type: OrbitalType, scale: number): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  const material = () => new THREE.MeshStandardMaterial({ color: '#B79CFF', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, emissive: '#2a1f55' });
  const plane = (rotate: (m: THREE.Mesh) => void) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(2.9, 64), material());
    rotate(m);
    out.push(m);
  };
  const cone = (theta: number, up: boolean) => {
    const h = 2.6;
    const geo = new THREE.ConeGeometry(h * Math.tan(theta), h, 64, 1, true);
    const m = new THREE.Mesh(geo, material());
    m.position.y = up ? h / 2 : -h / 2;
    if (up) m.rotation.x = Math.PI;
    out.push(m);
  };
  if (type === '2s') out.push(new THREE.Mesh(new THREE.SphereGeometry(2 * scale, 48, 32), material()));
  if (type === '2pz') plane((m) => (m.rotation.x = Math.PI / 2));
  if (type === '2px') plane((m) => (m.rotation.y = Math.PI / 2));
  if (type === '3dz2') {
    const t = Math.acos(1 / Math.sqrt(3));
    cone(t, true);
    cone(t, false);
  }
  if (type === '3dxy') {
    plane((m) => (m.rotation.y = Math.PI / 2));
    plane(() => undefined);
  }
  if (type === '4f') {
    plane((m) => (m.rotation.x = Math.PI / 2));
    const t = Math.acos(Math.sqrt(3 / 5));
    cone(t, true);
    cone(t, false);
  }
  out.forEach((o) => (o.userData.info = NODE_INFO));
  return out;
}

export const OrbitalsExplorer: React.FC<OrbitalsExplorerProps> = ({ lang, onUnlockMilestone, onOpenPrediction, onSelectConceptForMentor }) => {
  const [orbitalType, setOrbitalType] = useState<OrbitalType>('2pz');
  const [renderStyle, setRenderStyle] = useState<OrbitalRenderStyle>('density');
  const [isRotating, setIsRotating] = useState(true);
  const [sliceZ, setSliceZ] = useState(0);
  const [particleDensity, setParticleDensity] = useState(9000);
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(2);
  const [showNucleus, setShowNucleus] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [selected, setSelected] = useState<PartInfo | null>(null);

  const stageRef = useRef<ThreeStage | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const nucleusRef = useRef<THREE.Object3D | null>(null);
  const axesRef = useRef<THREE.Object3D | null>(null);
  const contentRef = useRef<THREE.Group | null>(null);
  const fadeRef = useRef<{ incoming: THREE.Group | null; outgoing: THREE.Group[] }>({ incoming: null, outgoing: [] });
  const rotatingRef = useRef(isRotating);
  rotatingRef.current = isRotating;

  const orbital = ORBITALS.find((o) => o.type === orbitalType)!;
  const conceptData = orbital.l === 0 ? CONCEPTS_LIST.find((c) => c.id === 's-orbital')! : CONCEPTS_LIST.find((c) => c.id === 'p-orbital')!;

  useEffect(() => {
    onSelectConceptForMentor('orbitals', { n: orbital.n, l: orbital.l, m: orbital.m, orbitalType, renderStyle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbitalType, renderStyle]);

  useEffect(() => {
    onUnlockMilestone('first_orbital');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (renderStyle === 'nodes') onUnlockMilestone('discovered_node');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderStyle]);

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    const root = new THREE.Group();
    stage.scene.add(root);
    rootRef.current = root;

    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshStandardMaterial({ color: '#FF5A5F', emissive: '#7a1418', roughness: 0.3 }));
    nucleus.userData.info = NUCLEUS_INFO;
    root.add(nucleus);
    nucleusRef.current = nucleus;

    const axes = new THREE.Group();
    const axisLine = (to: THREE.Vector3, color: string) => {
      const geo = new THREE.BufferGeometry().setFromPoints([to.clone().negate(), to]);
      axes.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })));
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 12), new THREE.MeshStandardMaterial({ color }));
      tip.position.copy(to);
      tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().normalize());
      axes.add(tip);
    };
    axisLine(new THREE.Vector3(3.3, 0, 0), '#E5484D');
    axisLine(new THREE.Vector3(0, 3.3, 0), '#30A46C');
    axisLine(new THREE.Vector3(0, 0, 3.3), '#5B7CFF');
    axes.userData.info = AXES_INFO;
    root.add(axes);
    axesRef.current = axes;

    return stage.onUpdate((dt) => {
      if (rotatingRef.current) root.rotation.y += dt * 0.22;
      // Crossfade between orbitals
      const f = fadeRef.current;
      const step = dt / 0.45;
      if (f.incoming) {
        let done = true;
        f.incoming.traverse((o) => {
          const m = (o as THREE.Points).material as THREE.Material & { opacity: number; userData: { target?: number } };
          if (m && 'opacity' in m && m.userData.target !== undefined) {
            m.opacity = Math.min(m.userData.target, m.opacity + step * m.userData.target);
            if (m.opacity < m.userData.target) done = false;
          }
        });
        if (done) f.incoming = null;
      }
      f.outgoing = f.outgoing.filter((g) => {
        let alive = false;
        g.traverse((o) => {
          const m = (o as THREE.Points).material as THREE.Material & { opacity: number };
          if (m && 'opacity' in m) {
            m.opacity = Math.max(0, m.opacity - step);
            if (m.opacity > 0) alive = true;
          }
        });
        if (!alive) {
          root.remove(g);
          g.traverse((o) => {
            const mesh = o as THREE.Mesh;
            mesh.geometry?.dispose();
            (mesh.material as THREE.Material | undefined)?.dispose();
          });
        }
        return alive;
      });
    });
  };

  // Rebuild the cloud when the orbital or how it's drawn changes
  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    const sample = sampleOrbital(orbitalType, particleDensity);
    const group = new THREE.Group();
    const positions: number[] = [];
    const colors: number[] = [];
    const sliceWidth = 0.09;
    const c = new THREE.Color();
    for (let i = 0; i < sample.count; i++) {
      const x = sample.positions[i * 3], y = sample.positions[i * 3 + 1], z = sample.positions[i * 3 + 2];
      if (renderStyle === 'slice' && Math.abs(y - sliceZ) > sliceWidth) continue;
      const sign = sample.signs[i];
      const d = Math.sqrt(sample.density[i]);
      if (renderStyle === 'phase' || renderStyle === 'slice') c.copy(sign > 0 ? POS : NEG);
      else if (renderStyle === 'nodes') c.copy(DIM);
      else if (renderStyle === 'dots') c.set('#DDE3FF');
      else c.copy(LOW).lerp(HIGH, d);
      positions.push(x, y, z);
      colors.push(c.r, c.g, c.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const additive = renderStyle === 'density';
    const targetOpacity = renderStyle === 'nodes' ? 0.5 : additive ? 0.85 : 0.9;
    const material = new THREE.PointsMaterial({
      size: renderStyle === 'dots' ? 0.024 : renderStyle === 'slice' ? 0.05 : 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    material.userData.target = targetOpacity;
    group.add(new THREE.Points(geo, material));

    // Invisible proxy so the cloud itself can be clicked
    const proxy = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), new THREE.MeshBasicMaterial({ visible: false }));
    proxy.userData.info = { title: { ru: `Орбиталь ${orbital.label.replace(/[_{}]/g, '')}`, en: `${orbital.label.replace(/[_{}]/g, '')} orbital` }, text: orbital.text } satisfies PartInfo;
    proxy.userData.shell = true;
    group.add(proxy);

    const nodes = renderStyle === 'nodes' || renderStyle === 'phase' ? nodalSurfaces(orbitalType, sample.scale) : [];
    nodes.forEach((n) => {
      const m = n as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.userData.target = renderStyle === 'nodes' ? 0.35 : 0.1;
      mat.opacity = 0;
      group.add(n);
    });

    if (renderStyle === 'slice') {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: '#8fa4ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      (plane.material as THREE.Material).userData.target = 0.08;
      plane.rotation.x = Math.PI / 2;
      plane.position.y = sliceZ;
      group.add(plane);
    }

    root.add(group);
    const fade = fadeRef.current;
    if (contentRef.current) fade.outgoing.push(contentRef.current);
    fade.incoming = group;
    contentRef.current = group;
    stage.setPickable([group, ...(nucleusRef.current ? [nucleusRef.current] : []), ...(axesRef.current ? [axesRef.current] : [])]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbitalType, renderStyle, particleDensity, sliceZ, stageRef.current]);

  useEffect(() => {
    if (nucleusRef.current) nucleusRef.current.visible = showNucleus;
    if (axesRef.current) axesRef.current.visible = showAxes;
  }, [showNucleus, showAxes]);

  const tier = conceptData.tiers.find((t) => t.level === explanationLevel)!;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
            <span className="w-2 h-2 rounded-full bg-chemistry" />
            {lang === 'ru' ? 'Химия · 10–11 класс' : 'Chemistry · grades 10–11'}
          </div>
          <h1 className="mt-1.5 font-serif text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-ink">
            {lang === 'ru' ? 'Атомные орбитали и форма облака' : 'Atomic orbitals and the shape of the cloud'}
          </h1>
        </div>
        <div className="flex p-1 rounded-lg bg-muted border border-line overflow-x-auto">
          {ORBITALS.map((o) => (
            <button
              key={o.type}
              onClick={() => setOrbitalType(o.type)}
              className={`shrink-0 h-9 px-3 rounded-md text-sm transition-colors cursor-pointer ${
                orbitalType === o.type ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <Formula tex={o.label.replace('²', '^2').replace('³', '^3')} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className="flex flex-col gap-3">
          <Stage3D
            lang={lang}
            className="h-[440px] sm:h-[540px] rounded-xl"
            options={{ cameraPosition: [4.6, 3, 6.4], minDistance: 2.5, maxDistance: 16 }}
            onReady={onReady}
            onReset={(s) => s.flyTo([4.6, 3, 6.4], [0, 0, 0])}
            selected={selected}
            onSelect={setSelected}
          >
            <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] font-mono text-[12px] text-[#EDEDED]">
                n = {orbital.n}, ℓ = {orbital.l}, m = {orbital.m}
              </span>
              {renderStyle === 'phase' && (
                <span className="px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#B5B8C0] inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5B7CFF]" />ψ &gt; 0</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F5A524]" />ψ &lt; 0</span>
                </span>
              )}
            </div>
          </Stage3D>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 rounded-lg bg-muted border border-line overflow-x-auto">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setRenderStyle(s.id)}
                  className={`shrink-0 h-8 px-3 rounded-md text-sm transition-colors cursor-pointer ${
                    renderStyle === s.id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {s.label[lang]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsRotating((r) => !r)}
              className="h-9 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-sm text-ink inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Play className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {isRotating ? (lang === 'ru' ? 'Остановить' : 'Stop') : lang === 'ru' ? 'Вращать' : 'Rotate'}
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="bg-surface border border-line rounded-xl p-5">
            <h2 className="font-serif text-xl text-ink">
              {lang === 'ru' ? 'Орбиталь' : 'Orbital'} <Formula tex={orbital.label.replace('²', '^2').replace('³', '^3')} />
            </h2>
            <div className="mt-3 px-3 py-2 rounded-lg bg-muted text-ink overflow-x-auto">
              <Formula tex={orbital.tex} />
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{orbital.text[lang]}</p>
            <button
              onClick={() => onOpenPrediction('pred-p-orbital')}
              className="mt-4 w-full h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Сначала представь' : 'Predict first'}
            </button>
          </section>

          <section className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
            {renderStyle === 'slice' && (
              <Slider label={lang === 'ru' ? 'Высота среза' : 'Slice height'} value={sliceZ} min={-2.4} max={2.4} step={0.1} format={(v) => v.toFixed(1)} onChange={setSliceZ} />
            )}
            <Slider label={lang === 'ru' ? 'Точек в облаке' : 'Points in the cloud'} value={particleDensity} min={2000} max={16000} step={1000} format={(v) => v.toLocaleString(lang)} onChange={setParticleDensity} />
            <div className="flex flex-col gap-2">
              <Toggle label={lang === 'ru' ? 'Ядро' : 'Nucleus'} checked={showNucleus} onChange={setShowNucleus} />
              <Toggle label={lang === 'ru' ? 'Оси координат' : 'Axes'} checked={showAxes} onChange={setShowAxes} />
            </div>
          </section>

          <section className="bg-surface border border-line rounded-xl p-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{lang === 'ru' ? 'Объяснение' : 'Explanation'}</h3>
            <div className="mt-3 grid grid-cols-4 p-1 rounded-lg bg-muted border border-line">
              {([1, 2, 3, 4] as ExplanationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExplanationLevel(lvl)}
                  className={`h-8 rounded-md text-[12.5px] truncate px-1 transition-colors cursor-pointer ${
                    explanationLevel === lvl ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {conceptData.tiers.find((t) => t.level === lvl)!.badge[lang]}
                </button>
              ))}
            </div>
            <h4 className="mt-4 font-serif text-lg text-ink">{tier.title[lang]}</h4>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{tier.content[lang]}</p>
            {tier.visualCue && <p className="mt-3 text-[13.5px] leading-relaxed text-ink bg-muted rounded-lg px-3 py-2">{tier.visualCue[lang]}</p>}
            {tier.mathFormula && (
              <div className="mt-3 overflow-x-auto py-1 text-ink">
                <Formula tex={tier.mathFormula} />
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }> = ({ label, value, min, max, step, format, onChange }) => (
  <div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink">{label}</span>
      <span className="font-mono text-ink">{format(value)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[#2F5BFF] cursor-pointer" />
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between text-sm text-ink cursor-pointer">
    {label}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-accent' : 'bg-line-strong'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  </label>
);
