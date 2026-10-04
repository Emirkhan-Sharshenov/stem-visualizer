import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Stage3D } from './Stage3D';
import { Panel, Slider, Toggle } from './LabUI';
import { Timeline, useTimeline } from './Timeline';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { MODELS, ModelId } from '../../lib/three/models';

interface ModelLabProps {
  lang: 'ru' | 'en';
  model: ModelId;
  /** part names to emphasise; the rest fade back */
  focus?: string[];
  compact?: boolean;
}

interface PartEntry {
  name: string;
  info: PartInfo;
  color: string;
  object: THREE.Object3D;
  home: THREE.Vector3;
  dir: THREE.Vector3;
  materials: THREE.MeshStandardMaterial[];
}

const loader = new GLTFLoader();

/** Box to frame: the focused parts if any, otherwise the whole model */
function frameBox(root: THREE.Object3D, entries: PartEntry[], focus?: string[]) {
  const box = new THREE.Box3();
  const focused = focus?.length ? entries.filter((e) => focus.includes(e.name)) : [];
  if (focused.length) focused.forEach((e) => box.expandByObject(e.object));
  else box.setFromObject(root);
  return box;
}

/** Camera placement that fits a box in view from the configured direction */
function framing(stage: ThreeStage, box: THREE.Box3, view: [number, number, number] = [0.55, 0.35, 1.05]) {
  const size = box.getSize(new THREE.Vector3());
  const target = box.getCenter(new THREE.Vector3());
  const cam = stage.camera;
  const halfV = THREE.MathUtils.degToRad(cam.fov / 2);
  const halfH = Math.atan(Math.tan(halfV) * cam.aspect);
  const r = size.length() / 2;
  const dist = Math.max(r / Math.sin(halfV), r / Math.sin(halfH)) * 0.82;
  const dir = new THREE.Vector3(...view).normalize();
  return { pos: target.clone().addScaledVector(dir, dist), target };
}

export const ModelLab: React.FC<ModelLabProps> = ({ lang, model, focus, compact = false }) => {
  const cfg = MODELS[model];
  const [selected, setSelected] = useState<PartInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [parts, setParts] = useState<PartEntry[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [explode, setExplode] = useState(0);
  const [xray, setXray] = useState(false);
  const [rotate, setRotate] = useState(!compact);
  const [clips, setClips] = useState<THREE.AnimationClip[]>([]);
  const [clipIndex, setClipIndex] = useState(0);

  const stageRef = useRef<ThreeStage | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const settings = useRef({ explode, rotate });
  settings.current = { explode, rotate };

  const duration = clips[clipIndex]?.duration ?? 1;
  const tl = useTimeline(duration, { autoplay: true });

  const onReady = (stage: ThreeStage) => {
    stageRef.current = stage;
    const root = new THREE.Group();
    stage.scene.add(root);
    rootRef.current = root;
    let disposed = false;

    loader.load(
      cfg.url,
      (gltf) => {
        if (disposed) return;
        const scene = gltf.scene;
        // Fit: largest dimension → cfg.fit, centred on x/z, standing on y = 0
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const s = (cfg.fit ?? 3) / Math.max(size.x, size.y, size.z);
        scene.scale.setScalar(s);
        const centre = box.getCenter(new THREE.Vector3());
        scene.position.set(-centre.x * s, -box.min.y * s, -centre.z * s);
        root.add(scene);
        root.updateMatrixWorld(true);

        const modelCentre = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
        const entries: PartEntry[] = [];
        const keys = Object.keys(cfg.parts);
        const single = keys.length === 1 ? keys[0] : null;
        const nodes: THREE.Object3D[] = single ? [scene] : keys.map((k) => scene.getObjectByName(k)).filter(Boolean) as THREE.Object3D[];

        nodes.forEach((node) => {
          const name = single ?? node.name;
          const materials: THREE.MeshStandardMaterial[] = [];
          node.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            const m = (mesh.material as THREE.MeshStandardMaterial).clone();
            m.side = THREE.DoubleSide;
            mesh.material = m;
            materials.push(m);
          });
          node.userData.info = cfg.parts[name];
          const c = new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
          const dir = c.sub(modelCentre);
          // Explode direction in the node's parent space, scaled so parts spread evenly
          const parentScale = node.parent ? node.parent.getWorldScale(new THREE.Vector3()).x : 1;
          entries.push({
            name,
            info: cfg.parts[name],
            color: `#${materials[0]?.color.getHexString() ?? '8c8f98'}`,
            object: node,
            home: node.position.clone(),
            dir: dir.divideScalar(parentScale || 1),
            materials,
          });
        });

        // Hotspots: glowing markers that open an info card
        const hotspots: THREE.Object3D[] = [];
        const ray = new THREE.Raycaster();
        (cfg.hotspots ?? []).forEach((h) => {
          const pos = new THREE.Vector3(...h.pos);
          if (h.snap) {
            // Land the marker on the actual surface instead of trusting hand-typed coordinates
            const from = h.snap === 'side' ? new THREE.Vector3(10, pos.y, pos.z) : new THREE.Vector3(pos.x, 10, pos.z);
            const dir = h.snap === 'side' ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(0, -1, 0);
            ray.set(root.localToWorld(from), dir);
            const hit = ray.intersectObject(scene, true)[0];
            if (hit) pos.copy(root.worldToLocal(hit.point.clone()));
          }
          const g = new THREE.Group();
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshStandardMaterial({ color: '#2F5BFF', emissive: '#2F5BFF', emissiveIntensity: 0.8 }));
          const halo = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: '#8fa4ff', transparent: true, opacity: 0.25, depthWrite: false }));
          g.add(dot, halo);
          g.position.copy(pos);
          g.userData.info = h.info;
          g.userData.halo = halo;
          root.add(g);
          hotspots.push(g);
        });

        if (gltf.animations.length) {
          mixerRef.current = new THREE.AnimationMixer(scene);
          setClips(gltf.animations);
        }

        stage.setPickable([...entries.map((e) => e.object), ...hotspots]);
        const view = framing(stage, frameBox(root, entries, focus), cfg.view);
        stage.camera.position.copy(view.pos);
        stage.controls.target.copy(view.target);
        stage.controls.update();
        setParts(entries);
        setLoading(false);

        stage.onUpdate((dt, elapsed) => {
          const st = settings.current;
          if (st.rotate) root.rotation.y += dt * 0.25;
          entries.forEach((e) => e.object.position.copy(e.home).addScaledVector(e.dir, st.explode * 0.7));
          hotspots.forEach((hs, k) => (hs.userData.halo as THREE.Mesh).scale.setScalar(1 + 0.25 * Math.sin(elapsed * 3 + k)));
          if (mixerRef.current) mixerRef.current.setTime(tl.timeRef.current);
        });
      },
      undefined,
      () => {
        setFailed(true);
        setLoading(false);
      },
    );
    return () => {
      disposed = true;
    };
  };

  // Switch animation clip
  useEffect(() => {
    const mixer = mixerRef.current;
    const clip = clips[clipIndex];
    if (!mixer || !clip) return;
    actionRef.current?.stop();
    const action = mixer.clipAction(clip);
    action.play();
    actionRef.current = action;
    tl.seek(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips, clipIndex]);

  // Visibility, x-ray and focus
  useEffect(() => {
    parts.forEach((p) => {
      p.object.visible = !hidden[p.name];
      const dim = focus && focus.length > 0 && !focus.includes(p.name);
      p.materials.forEach((m) => {
        const transparent = xray || !!dim;
        m.transparent = transparent;
        m.opacity = xray ? 0.28 : dim ? 0.18 : 1;
        m.depthWrite = !transparent;
        m.needsUpdate = true;
      });
    });
  }, [parts, hidden, xray, focus]);

  const visibleCount = useMemo(() => parts.filter((p) => !hidden[p.name]).length, [parts, hidden]);

  return (
    <div className={compact ? 'flex flex-col gap-3 w-full' : 'grid lg:grid-cols-[1fr_320px] gap-4 w-full'}>
      <div className="flex flex-col gap-3">
        <Stage3D
          lang={lang}
          className={`${compact ? 'h-[380px] sm:h-[440px]' : 'h-[440px] sm:h-[560px]'} rounded-xl`}
          options={{ cameraPosition: [3, 2.5, 5], minDistance: 0.6, maxDistance: 14 }}
          onReady={onReady}
          onReset={(s) => {
            if (!rootRef.current) return;
            const view = framing(s, frameBox(rootRef.current, parts, focus), cfg.view);
            s.flyTo(view.pos.toArray() as [number, number, number], view.target.toArray() as [number, number, number]);
          }}
          selected={selected}
          onSelect={setSelected}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-[#B5B8C0]">
              <Loader2 className="w-4 h-4 animate-spin" />
              {lang === 'ru' ? 'Загружаем модель…' : 'Loading the model…'}
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-[#FF8F8F]">
              {lang === 'ru' ? 'Не удалось загрузить модель. Проверь подключение.' : 'Couldn’t load the model. Check your connection.'}
            </div>
          )}
          <div className="pointer-events-none absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED]">
            {cfg.title[lang]}
          </div>
        </Stage3D>
        {clips.length > 0 && (
          <Timeline
            lang={lang}
            tl={tl}
            step={0.1}
            marks={clips.length > 1 ? undefined : []}
          />
        )}
        {clips.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {clips.map((c, k) => (
              <button
                key={c.name}
                onClick={() => setClipIndex(k)}
                className={`h-8 px-3 rounded-full text-sm border cursor-pointer transition-colors ${k === clipIndex ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-ink-2 hover:text-ink'}`}
              >
                {({ Survey: { ru: 'Осматривается', en: 'Looking around' }, Walk: { ru: 'Шаг', en: 'Walk' }, Run: { ru: 'Бег', en: 'Run' } } as Record<string, { ru: string; en: string }>)[c.name]?.[lang] ?? c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!compact ? (
        <aside className="flex flex-col gap-4">
          <Panel>
            <h2 className="font-serif text-xl text-ink">{cfg.title[lang]}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{cfg.intro[lang]}</p>
          </Panel>
          <Controls lang={lang} cfg={cfg} explode={explode} setExplode={setExplode} xray={xray} setXray={setXray} rotate={rotate} setRotate={setRotate} />
          {parts.length > 1 && (
            <PartsList lang={lang} parts={parts} hidden={hidden} setHidden={setHidden} selected={selected} onSelect={setSelected} visibleCount={visibleCount} />
          )}
          <p className="text-[11.5px] leading-relaxed text-ink-3">{cfg.credit}</p>
        </aside>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <Controls lang={lang} cfg={cfg} explode={explode} setExplode={setExplode} xray={xray} setXray={setXray} rotate={rotate} setRotate={setRotate} />
          {parts.length > 1 && (
            <PartsList lang={lang} parts={parts} hidden={hidden} setHidden={setHidden} selected={selected} onSelect={setSelected} visibleCount={visibleCount} />
          )}
          <p className="sm:col-span-2 text-[11.5px] text-ink-3">{cfg.credit}</p>
        </div>
      )}
    </div>
  );
};

const Controls: React.FC<{
  lang: 'ru' | 'en';
  cfg: (typeof MODELS)[ModelId];
  explode: number;
  setExplode: (v: number) => void;
  xray: boolean;
  setXray: (v: boolean) => void;
  rotate: boolean;
  setRotate: (v: boolean) => void;
}> = ({ lang, cfg, explode, setExplode, xray, setXray, rotate, setRotate }) => (
  <Panel>
    <div className="flex flex-col gap-4">
      {cfg.explodable && (
        <Slider label={lang === 'ru' ? 'Разнести части' : 'Spread parts'} value={explode} min={0} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={setExplode} />
      )}
      <Toggle label={lang === 'ru' ? 'Рентген' : 'X-ray'} checked={xray} onChange={setXray} />
      <Toggle label={lang === 'ru' ? 'Вращение' : 'Auto-rotate'} checked={rotate} onChange={setRotate} />
    </div>
  </Panel>
);

const PartsList: React.FC<{
  lang: 'ru' | 'en';
  parts: PartEntry[];
  hidden: Record<string, boolean>;
  setHidden: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selected: PartInfo | null;
  onSelect: (i: PartInfo) => void;
  visibleCount: number;
}> = ({ lang, parts, hidden, setHidden, selected, onSelect, visibleCount }) => (
  <Panel title={`${lang === 'ru' ? 'Части' : 'Parts'} · ${visibleCount}/${parts.length}`}>
    <ul className="flex flex-col">
      {parts.map((p) => (
        <li key={p.name} className="flex items-center gap-1">
          <button
            onClick={() => onSelect(p.info)}
            className={`flex-1 flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md text-left text-sm transition-colors cursor-pointer ${
              selected?.title.en === p.info.title.en ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-muted hover:text-ink'
            } ${hidden[p.name] ? 'opacity-50' : ''}`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            {p.info.title[lang]}
          </button>
          <button
            onClick={() => setHidden((h) => ({ ...h, [p.name]: !h[p.name] }))}
            aria-label={hidden[p.name] ? (lang === 'ru' ? 'Показать' : 'Show') : lang === 'ru' ? 'Скрыть' : 'Hide'}
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-3 hover:text-ink hover:bg-muted cursor-pointer"
          >
            {hidden[p.name] ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
          </button>
        </li>
      ))}
    </ul>
  </Panel>
);
