import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MousePointer2, Pause, Play, Plus, RotateCcw, Rocket, Shuffle } from 'lucide-react';
import { Stage3D } from '../lab/Stage3D';
import type { PartInfo, ThreeStage } from '../../lib/three/ThreeStage';
import { Body, len, orbitAround, Sim, V3 } from './gravity';
import { EARTH_MU, EARTH_R, SCENES, SpaceScene } from './scenes';
import { progress } from '../../lib/progress';

type Lang = 'ru' | 'en';
const TRAIL = 900;
const fmt = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '∞');
const AU_KM_S = 4.74;

interface Visual {
  mesh: THREE.Mesh;
  glow?: THREE.Sprite;
  light?: THREE.PointLight;
  trail: THREE.Line;
  trailPos: Float32Array;
  count: number;
  label: HTMLDivElement;
}

let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/** procedural planet surfaces: continents for Earth-like planets, cloud bands for giants */
const texCache = new Map<string, THREE.Texture>();
function planetTexture(kind: 'earth' | 'bands' | 'rock', color: string) {
  const key = kind + color;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const noise = (x: number, y: number, seed: number) =>
    Math.sin(x * 3.1 + seed) * Math.cos(y * 2.3 + seed * 1.7) + 0.5 * Math.sin(x * 7.3 + y * 5.1 + seed * 2.3) + 0.25 * Math.sin(x * 15.7 - y * 11.3 + seed);
  const img = ctx.createImageData(512, 256);
  const base = new THREE.Color(color);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 512; x++) {
      const u = (x / 512) * Math.PI * 2;
      const v = (y / 256) * Math.PI;
      let r = base.r;
      let g = base.g;
      let b = base.b;
      if (kind === 'earth') {
        const n = noise(Math.cos(u) * 1.3, v * 1.2 + Math.sin(u), 3) + 0.4 * noise(u * 2, v * 2, 9);
        const polar = Math.abs(v - Math.PI / 2) > 1.25;
        if (polar) [r, g, b] = [0.92, 0.95, 0.98];
        else if (n > 0.55) [r, g, b] = n > 1.1 ? [0.55, 0.47, 0.35] : [0.22, 0.52, 0.25];
        else [r, g, b] = [0.12, 0.33 + n * 0.05, 0.68];
      } else if (kind === 'bands') {
        const k = 0.75 + 0.25 * Math.sin(v * 14 + 0.6 * Math.sin(u * 3 + v * 6));
        [r, g, b] = [r * k, g * k, b * k];
      } else {
        const k = 0.8 + 0.2 * noise(u * 1.5, v * 1.5, 5);
        [r, g, b] = [r * k, g * k, b * k];
      }
      const i = (y * 512 + x) * 4;
      img.data[i] = r * 255;
      img.data[i + 1] = g * 255;
      img.data[i + 2] = b * 255;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

export const Space3D: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [sceneId, setSceneId] = useState('cosmic');
  const scene = SCENES.find((s) => s.id === sceneId)!;
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [trails, setTrails] = useState(true);
  const [adding, setAdding] = useState<null | 'planet' | 'moon' | 'star'>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [launchV, setLaunchV] = useState(7.8);
  const [log, setLog] = useState<string[]>([]);
  const [, setTick] = useState(0);
  const [info, setInfo] = useState<PartInfo | null>(null);

  const stageRef = useRef<ThreeStage | null>(null);
  const sim = useRef<Sim>(new Sim(scene.make()));
  const visuals = useRef(new Map<string, Visual>());
  const root = useRef(new THREE.Group());
  const labelsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ start: THREE.Vector3; arrow: THREE.ArrowHelper } | null>(null);
  const live = useRef({ running, speed, trails, adding, selected, scene });
  live.current = { running, speed, trails, adding, selected, scene };
  const ids = useRef(1);

  useEffect(() => progress.recordLab('sandbox-space3d'), []);

  /* ---------- visuals ---------- */

  const toScene = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]).divideScalar(live.current.scene.units.scale);

  const makeVisual = (b: Body): Visual => {
    const s = live.current.scene.units.scale;
    const r = Math.max(0.04, b.drawR / s);
    const kind = /Земля|Earth/.test(b.name) ? 'earth' : /Юпитер|Jupiter/.test(b.name) || b.drawR / s > 0.4 ? 'bands' : 'rock';
    const mat = b.star ? new THREE.MeshBasicMaterial({ color: b.color }) : new THREE.MeshStandardMaterial({ map: planetTexture(kind, b.color), roughness: 0.8, metalness: 0.02 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), mat);
    root.current.add(mesh);
    let glow: THREE.Sprite | undefined;
    let light: THREE.PointLight | undefined;
    if (b.star) {
      glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: b.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.setScalar(r * 7);
      root.current.add(glow);
      light = new THREE.PointLight(b.color, 3, 0, 0.6);
      root.current.add(light);
    }
    const trailPos = new Float32Array(TRAIL * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    geo.setDrawRange(0, 0);
    const trail = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: b.color, transparent: true, opacity: 0.55 }));
    trail.frustumCulled = false;
    root.current.add(trail);
    const label = document.createElement('div');
    label.className = 'absolute pointer-events-none text-[11px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white whitespace-nowrap -translate-x-1/2';
    label.textContent = b.name;
    labelsRef.current?.appendChild(label);
    return { mesh, glow, light, trail, trailPos, count: 0, label };
  };

  const dropVisual = (id: string) => {
    const v = visuals.current.get(id);
    if (!v) return;
    for (const o of [v.mesh, v.glow, v.light, v.trail]) if (o) root.current.remove(o);
    v.mesh.geometry.dispose();
    v.trail.geometry.dispose();
    v.label.remove();
    visuals.current.delete(id);
  };

  const rebuild = (s: SpaceScene) => {
    for (const id of [...visuals.current.keys()]) dropVisual(id);
    sim.current = new Sim(s.make());
    // follow something that orbits: the Moon, Earth in the Solar System, else the lightest body
    const bs = sim.current.bodies;
    const heaviest = bs.reduce((m, b) => (b.mu > m.mu ? b : m), bs[0]);
    const pick = bs.find((b) => b.id === 'moon') ?? bs.find((b) => b.id === 'earth' && b !== heaviest) ?? [...bs].filter((b) => !b.star && b !== heaviest).sort((x, y) => x.mu - y.mu)[0];
    setSelected(s.launch ? null : pick?.id ?? null);
    setLog([]);
    const st = stageRef.current;
    if (st) st.flyTo(s.camera, [0, 0, 0], 0.8);
  };

  const loadScene = (id: string) => {
    const s = SCENES.find((x) => x.id === id)!;
    setSceneId(id);
    live.current.scene = s;
    setAdding(null);
    rebuild(s);
  };

  /* ---------- the frame loop (called by the 3D stage) ---------- */

  const frame = (dt: number) => {
    const S = live.current;
    const sm = sim.current;
    if (S.running) {
      sm.step(Math.min(dt, 0.05) * S.scene.units.rate * S.speed);
      if (sm.events.length) {
        const names = new Map(sm.bodies.map((b) => [b.id, b.name]));
        const lines = sm.events.map((e) =>
          S.scene.launch && e.into === 'earth' ? L('Спутник упал на Землю: скорости не хватило.', 'The satellite fell back to Earth: not enough speed.') : L(`Столкновение: тело поглощено телом «${names.get(e.into) ?? e.into}».`, `Collision: a body merged into “${names.get(e.into) ?? e.into}”.`),
        );
        sm.events = [];
        setLog((l) => [...lines, ...l].slice(0, 6));
      }
    }
    // sync visuals with bodies
    const alive = new Set(sm.bodies.map((b) => b.id));
    for (const id of [...visuals.current.keys()]) if (!alive.has(id)) dropVisual(id);
    const cam = stageRef.current?.camera;
    const el = stageRef.current?.renderer.domElement;
    for (const b of sm.bodies) {
      let v = visuals.current.get(b.id);
      if (!v) {
        v = makeVisual(b);
        visuals.current.set(b.id, v);
      }
      const p = toScene(b.pos);
      v.mesh.position.copy(p);
      const r = Math.max(0.04, b.drawR / S.scene.units.scale);
      const g = v.mesh.geometry as THREE.SphereGeometry;
      if (Math.abs(g.parameters.radius - r) > 1e-3) {
        v.mesh.geometry.dispose();
        v.mesh.geometry = new THREE.SphereGeometry(r, 40, 28);
      }
      v.glow?.position.copy(p);
      v.light?.position.copy(p);
      v.mesh.scale.setScalar(S.selected === b.id ? 1.15 : 1);
      if (!b.star) v.mesh.rotation.y += dt * 0.3;
      // trail
      if (S.running) {
        const last = v.count ? new THREE.Vector3(v.trailPos[(v.count - 1) * 3], v.trailPos[(v.count - 1) * 3 + 1], v.trailPos[(v.count - 1) * 3 + 2]) : null;
        if (!last || last.distanceTo(p) > 0.03) {
          if (v.count >= TRAIL) {
            v.trailPos.copyWithin(0, 3);
            v.count--;
          }
          v.trailPos.set([p.x, p.y, p.z], v.count * 3);
          v.count++;
          v.trail.geometry.attributes.position.needsUpdate = true;
          v.trail.geometry.setDrawRange(0, v.count);
        }
      }
      v.trail.visible = S.trails;
      // label
      if (cam && el) {
        const q = p.clone().add(new THREE.Vector3(0, r * 1.6 + 0.08, 0)).project(cam);
        const show = q.z < 1 && Math.abs(q.x) < 1.1 && Math.abs(q.y) < 1.1;
        v.label.style.display = show ? 'block' : 'none';
        v.label.style.left = `${((q.x + 1) / 2) * el.clientWidth}px`;
        v.label.style.top = `${((1 - q.y) / 2) * el.clientHeight - 18}px`;
        v.label.style.outline = S.selected === b.id ? '1px solid #5B8CFF' : 'none';
      }
    }
  };

  /* ---------- pointer: select bodies, or add with a drag ---------- */

  const planeHit = (e: PointerEvent): THREE.Vector3 | null => {
    const st = stageRef.current;
    if (!st) return null;
    const rect = st.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, st.camera);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit) ? hit : null;
  };
  const pickBody = (e: PointerEvent): string | null => {
    const st = stageRef.current;
    if (!st) return null;
    const rect = st.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, st.camera);
    const meshes = [...visuals.current.entries()].map(([id, v]) => {
      v.mesh.userData.bodyId = id;
      return v.mesh;
    });
    const hit = ray.intersectObjects(meshes)[0];
    if (hit) return hit.object.userData.bodyId as string;
    // forgiving pick for tiny bodies: nearest on screen
    let best: string | null = null;
    let bestD = 18;
    for (const [id, v] of visuals.current) {
      const q = v.mesh.position.clone().project(st.camera);
      const d = Math.hypot(((q.x + 1) / 2) * rect.width - (e.clientX - rect.left), ((1 - q.y) / 2) * rect.height - (e.clientY - rect.top));
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    return best;
  };

  /** the body everything orbits: the heaviest one */
  const centre = () => sim.current.bodies.reduce((m, b) => (b.mu > m.mu ? b : m), sim.current.bodies[0]);

  const attachPointer = (st: ThreeStage) => {
    const el = st.renderer.domElement;
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      if (!live.current.adding) return;
      const p = planeHit(e);
      if (!p) return;
      st.controls.enabled = false;
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), p, 0.001, 0x5b8cff, 0.15, 0.1);
      root.current.add(arrow);
      dragRef.current = { start: p, arrow };
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const p = planeHit(e);
      if (!p) return;
      const v = p.clone().sub(d.start);
      if (v.length() > 1e-3) {
        d.arrow.setDirection(v.clone().normalize());
        d.arrow.setLength(v.length(), Math.min(0.25, v.length() * 0.3), Math.min(0.15, v.length() * 0.2));
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      const S = live.current;
      if (d) {
        const end = planeHit(e) ?? d.start;
        root.current.remove(d.arrow);
        dragRef.current = null;
        st.controls.enabled = true;
        const kind = S.adding!;
        const s = S.scene.units.scale;
        const pos: V3 = [d.start.x * s, 0, d.start.z * s];
        const c = centre();
        // drag length of half the distance to the centre ≈ a circular orbit
        const dist = Math.max(1e-6, len([pos[0] - c.pos[0], 0, pos[2] - c.pos[2]]));
        const vc = Math.sqrt(c.mu / dist);
        const drag = end.clone().sub(d.start).multiplyScalar(s);
        const k = drag.length() > 1e-9 ? vc / (dist * 0.5) : 0;
        const id = `n${ids.current++}`;
        const names = { planet: L('Планета', 'Planet'), moon: L('Спутник', 'Moon'), star: L('Звезда', 'Star') };
        const colors = ['#5FD39A', '#FF9E6B', '#B98CFF', '#6BC8FF', '#FFDF6B', '#FF7AB0'];
        const drawBase = s * 0.12;
        sim.current.bodies.push({
          id,
          name: `${names[kind]} ${ids.current - 1}`,
          mu: S.scene.addMu[kind],
          r: kind === 'star' ? drawBase * 0.5 : drawBase * 0.15,
          drawR: kind === 'star' ? drawBase * 1.6 : kind === 'planet' ? drawBase * 0.7 : drawBase * 0.45,
          color: kind === 'star' ? '#FFE9A8' : colors[ids.current % colors.length],
          pos,
          vel: [c.vel[0] + drag.x * k, 0, c.vel[2] + drag.z * k],
          star: kind === 'star',
        });
        setSelected(id);
        return;
      }
      // a click (not an orbit drag) selects a body
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) setSelected(pickBody(e));
      down = null;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
  };

  // refresh the side panel a few times a second
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);

  /* ---------- actions ---------- */

  const launch = () => {
    const id = `sat${ids.current++}`;
    const r0 = EARTH_R + 200;
    const ang = Math.random() * Math.PI * 2;
    sim.current.bodies.push({
      id,
      name: `${L('Спутник', 'Satellite')} ${(Math.round(launchV * 10) / 10).toString().replace('.', ',')} ${L('км/с', 'km/s')}`,
      mu: 0.001,
      r: 1,
      drawR: 380,
      color: launchV < 7.75 ? '#FF7A7A' : launchV < 7.85 ? '#5FD39A' : launchV < 10.95 ? '#FFD27A' : '#B98CFF',
      pos: [r0 * Math.cos(ang), 0, r0 * Math.sin(ang)],
      vel: [-launchV * Math.sin(ang), 0, launchV * Math.cos(ang)],
    });
    setSelected(id);
    setRunning(true);
  };
  const nudge = () => {
    for (const b of sim.current.bodies) b.vel = [b.vel[0] * (1 + (Math.random() - 0.5) * 0.02), b.vel[1], b.vel[2] * (1 + (Math.random() - 0.5) * 0.02)];
  };

  const sel = sim.current.bodies.find((b) => b.id === selected);
  const orb = sel ? orbitAround(sel, sim.current.bodies) : null;
  const U = scene.units;
  const spd = (v: number) => (U.speed.en === 'AU/yr' ? `${fmt(v * AU_KM_S, 1)} ${L('км/с', 'km/s')}` : `${fmt(v)} ${U.speed[lang]}`);
  const dst = (d: number) => (U.dist.en === 'km' ? `${Math.round(d).toLocaleString('ru-RU')} ${L('км', 'km')}` : `${fmt(d, 2)} ${U.dist[lang]}`);
  const per = (p: number) => {
    if (!Number.isFinite(p)) return '—';
    if (U.time.en === 's') return p > 2 * 86400 ? `${fmt(p / 86400, 1)} ${L('сут', 'd')}` : `${fmt(p / 60, 0)} ${L('мин', 'min')}`;
    if (U.time.en === 'yr') return p < 1 ? `${fmt(p * 365.25, 0)} ${L('сут', 'd')}` : `${fmt(p, 2)} ${L('лет', 'yr')}`;
    return fmt(p, 2);
  };
  const orbitKind = (o: NonNullable<typeof orb>) => (!o.bound ? L('улетает навсегда (гипербола)', 'escaping for good (hyperbola)') : o.e < 0.05 ? L('почти круговая', 'nearly circular') : L(`эллипс, e = ${fmt(o.e)}`, `ellipse, e = ${fmt(o.e)}`));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => loadScene(s.id)}
            className={`shrink-0 h-9 px-3.5 rounded-full text-sm border cursor-pointer ${sceneId === s.id ? 'bg-ink border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
            style={sceneId === s.id ? { color: '#fff' } : undefined}
          >
            {s.title[lang]}
          </button>
        ))}
      </div>
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{scene.laws[lang]}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{scene.hint[lang]}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <Stage3D
            lang={lang}
            className={`h-[420px] sm:h-[540px] rounded-xl border border-[#1F2126] ${adding ? 'cursor-crosshair' : ''}`}
            options={{ cameraPosition: scene.camera, minDistance: 1, maxDistance: 80 }}
            selected={info}
            onSelect={setInfo}
            onReady={(st) => {
              stageRef.current = st;
              st.scene.fog = null;
              st.scene.background = new THREE.Color('#05060A');
              // background stars
              const n = 1500;
              const pts = new Float32Array(n * 3);
              for (let i = 0; i < n; i++) {
                const u = Math.random() * 2 - 1;
                const a = Math.random() * Math.PI * 2;
                const r = 120 + Math.random() * 40;
                pts.set([r * Math.sqrt(1 - u * u) * Math.cos(a), r * u, r * Math.sqrt(1 - u * u) * Math.sin(a)], i * 3);
              }
              const sg = new THREE.BufferGeometry();
              sg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
              const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#C9D3FF', size: 0.35, sizeAttenuation: true }));
              st.scene.add(stars);
              const grid = new THREE.PolarGridHelper(14, 12, 8, 64, '#1A2240', '#121830');
              st.scene.add(grid);
              st.scene.add(new THREE.AmbientLight('#8090B0', 0.5));
              st.scene.add(root.current);
              const off = st.onUpdate((dt) => frame(dt));
              const offPtr = attachPointer(st);
              return () => {
                off();
                offPtr();
                for (const id of [...visuals.current.keys()]) dropVisual(id);
                st.scene.remove(root.current, stars, grid);
                sg.dispose();
                stageRef.current = null;
              };
            }}
          >
            <div ref={labelsRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
            {adding && <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#EDEDED]">{L('Нажми в плоскости и потяни — стрелка задаёт скорость', 'Press on the plane and drag: the arrow sets the speed')}</div>}
          </Stage3D>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setRunning(!running)} className="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? L('Пауза', 'Pause') : L('Пуск', 'Run')}
            </button>
            <button onClick={() => rebuild(scene)} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              {L('Сначала', 'Reset')}
            </button>
            <div className="flex p-0.5 rounded-lg bg-muted border border-line">
              {[0.25, 1, 4].map((k) => (
                <button key={k} onClick={() => setSpeed(k)} className={`h-8 px-2.5 rounded-md text-xs font-mono cursor-pointer ${speed === k ? 'bg-surface border border-line text-ink' : 'text-ink-2'}`}>
                  ×{String(k).replace('.', ',')}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
              <input type="checkbox" checked={trails} onChange={(e) => setTrails(e.target.checked)} className="w-4 h-4 accent-[#2F5BFF]" />
              {L('Следы орбит', 'Orbit trails')}
            </label>
            {sceneId === 'three' && (
              <button onClick={nudge} className="h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
                <Shuffle className="w-4 h-4" />
                {L('Толкнуть (±1%)', 'Nudge (±1%)')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAdding(null)}
              className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${!adding ? 'bg-accent border-accent' : 'bg-surface border-line text-ink hover:bg-muted'}`}
              style={!adding ? { color: '#fff' } : undefined}
            >
              <MousePointer2 className="w-4 h-4" />
              {L('Смотреть и выбирать', 'Look and select')}
            </button>
            {(['planet', 'moon', 'star'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setAdding(k)}
                className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-1.5 border cursor-pointer ${adding === k ? 'bg-accent border-accent' : 'bg-surface border-dashed border-line-strong text-ink hover:bg-muted'}`}
                style={adding === k ? { color: '#fff' } : undefined}
              >
                <Plus className="w-4 h-4" />
                {{ planet: L('Планета', 'Planet'), moon: L('Спутник', 'Moon'), star: L('Звезда', 'Star') }[k]}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-3">{L('Крути сцену мышкой или пальцем, колесо — приближение. Нажми на тело, чтобы увидеть его орбиту.', 'Drag to orbit, scroll to zoom. Click a body to see its orbit.')}</p>
        </div>

        <div className="flex flex-col gap-3">
          {scene.launch && (
            <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Запуск спутника', 'Launch a satellite')}</h3>
              <label className="flex flex-col gap-1">
                <span className="flex justify-between text-xs text-ink-2">
                  <span>{L('Скорость на высоте 200 км', 'Speed at 200 km')}</span>
                  <span className="font-mono text-ink">
                    {fmt(launchV, 1)} {L('км/с', 'km/s')}
                  </span>
                </span>
                <input type="range" min={5} max={13} step={0.1} value={launchV} onChange={(e) => setLaunchV(Number(e.target.value))} className="w-full accent-[#2F5BFF] cursor-pointer" />
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => setLaunchV(Math.round(Math.sqrt(EARTH_MU / (EARTH_R + 200)) * 10) / 10)} className="rounded-lg bg-muted px-2 py-1.5 text-left hover:bg-hover cursor-pointer">
                  v₁ = {fmt(Math.sqrt(EARTH_MU / (EARTH_R + 200)), 1)} {L('км/с', 'km/s')}
                  <span className="block text-ink-3">{L('круговая орбита', 'circular orbit')}</span>
                </button>
                <button onClick={() => setLaunchV(Math.round(Math.sqrt((2 * EARTH_MU) / (EARTH_R + 200)) * 10) / 10 + 0.1)} className="rounded-lg bg-muted px-2 py-1.5 text-left hover:bg-hover cursor-pointer">
                  v₂ = {fmt(Math.sqrt((2 * EARTH_MU) / (EARTH_R + 200)), 1)} {L('км/с', 'km/s')}
                  <span className="block text-ink-3">{L('улёт от Земли', 'escape from Earth')}</span>
                </button>
              </div>
              <button onClick={launch} className="h-10 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
                <Rocket className="w-4 h-4" />
                {L('Запустить', 'Launch')}
              </button>
              <p className="text-[11px] text-ink-3">{L('У самой поверхности Земли v₁ = 7,9 км/с и v₂ = 11,2 км/с — на высоте 200 км чуть меньше.', 'Right at the surface v₁ = 7.9 km/s and v₂ = 11.2 km/s; at 200 km a little less.')}</p>
            </div>
          )}

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Выбранное тело', 'Selected body')}</h3>
            {sel && orb ? (
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-ink font-medium">
                  <span className="w-3 h-3 rounded-full" style={{ background: sel.color }} />
                  {sel.name}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: L('Скорость', 'Speed'), v: spd(orb.speed) },
                    { k: L(`Расстояние до «${orb.center.name}»`, `Distance to “${orb.center.name}”`), v: dst(orb.dist) },
                    { k: L('Круговая скорость тут', 'Circular speed here'), v: spd(orb.vCirc) },
                    { k: L('Скорость убегания', 'Escape speed'), v: spd(orb.vEsc) },
                    { k: L('Период обращения', 'Orbital period'), v: per(orb.period) },
                  ].map((r) => (
                    <div key={r.k} className="rounded-lg bg-muted px-2.5 py-2">
                      <div className="text-[11px] text-ink-2">{r.k}</div>
                      <div className="font-mono text-ink text-[13px]">{r.v}</div>
                    </div>
                  ))}
                </div>
                <p className={`text-sm ${orb.bound ? 'text-ink' : 'text-[#CC2F35]'}`}>
                  {L('Орбита', 'Orbit')}: <b>{orbitKind(orb)}</b>
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-3">{L('Нажми на планету или спутник в сцене.', 'Click a planet or moon in the scene.')}</p>
            )}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Тела', 'Bodies')} · {sim.current.bodies.length}</h3>
            <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {sim.current.bodies.map((b) => (
                <li key={b.id}>
                  <button onClick={() => setSelected(b.id)} className={`w-full text-left px-2 py-1.5 rounded-md text-sm inline-flex items-center gap-2 cursor-pointer ${selected === b.id ? 'bg-accent-soft text-ink' : 'hover:bg-muted text-ink-2'}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
            {log.length > 0 && (
              <ul className="mt-3 pt-2 border-t border-line flex flex-col gap-1">
                {log.map((l, i) => (
                  <li key={i} className="text-xs text-[#B5651D]">
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Space3D;
