import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, Activity, Play, Pause, ChevronRight, Zap, RefreshCw } from 'lucide-react';

interface BiologyDeepZoomProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export type BioScaleLevel = 'cell' | 'mitochondria' | 'membrane' | 'atp_rotor';

export const BiologyDeepZoom: React.FC<BiologyDeepZoomProps> = ({
  lang,
  onUnlockMilestone,
  onSelectConceptForMentor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scaleLevel, setScaleLevel] = useState<BioScaleLevel>('mitochondria');
  const [protonGradient, setProtonGradient] = useState<number>(85); // 0-100%
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [atpProduced, setAtpProduced] = useState<number>(142);

  const levels: { id: BioScaleLevel; label: { en: string; ru: string }; scale: string }[] = [
    { id: 'cell', label: { en: '1. Whole Cell', ru: '1. Вся клетка' }, scale: '20 µm' },
    { id: 'mitochondria', label: { en: '2. Mitochondrion', ru: '2. Митохондрия' }, scale: '1.5 µm' },
    { id: 'membrane', label: { en: '3. Cristae Membrane', ru: '3. Кристы и мембрана' }, scale: '50 nm' },
    { id: 'atp_rotor', label: { en: '4. ATP Synthase Rotor', ru: '4. Ротор АТФ-синтазы' }, scale: '10 nm' },
  ];

  // Notify mentor
  useEffect(() => {
    onSelectConceptForMentor('mitochondria', { scaleLevel, protonGradient });
  }, [scaleLevel, protonGradient]);

  // ATP production counter
  useEffect(() => {
    if (!isSpinning || protonGradient < 10) return;
    const interval = setInterval(() => {
      setAtpProduced((prev) => prev + Math.floor(protonGradient / 25));
    }, 400);
    return () => clearInterval(interval);
  }, [isSpinning, protonGradient]);

  // Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pointLight = new THREE.PointLight(0x38bdf8, 2, 40);
    pointLight.position.set(5, 8, 6);
    scene.add(pointLight);

    const bioGroup = new THREE.Group();
    scene.add(bioGroup);

    // Objects depending on zoom scaleLevel
    let rotorMesh: THREE.Group | null = null;
    let protonsCloud: THREE.Points | null = null;

    if (scaleLevel === 'cell') {
      // Cell cytoplasm sphere
      const cellGeo = new THREE.SphereGeometry(3.5, 32, 32);
      const cellMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.25,
        wireframe: true
      });
      const cell = new THREE.Mesh(cellGeo, cellMat);
      bioGroup.add(cell);

      // Nucleus in center
      const nuc = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 })
      );
      bioGroup.add(nuc);

      // Several mitochondria around the cell
      const mitoPositions = [
        new THREE.Vector3(1.8, 1.2, 0.5),
        new THREE.Vector3(-1.9, 0.8, -0.6),
        new THREE.Vector3(0.5, -1.8, 1.2),
        new THREE.Vector3(-1.2, -1.5, -0.8),
      ];

      mitoPositions.forEach((pos) => {
        const mito = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
        );
        mito.position.copy(pos);
        mito.rotation.z = Math.random() * Math.PI;
        mito.rotation.x = Math.random() * Math.PI;
        bioGroup.add(mito);
      });
    } else if (scaleLevel === 'mitochondria') {
      // Classic bean-shaped organelle with outer wall and internal folded cristae
      // Outer membrane (translucent orange capsule)
      const outerGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 32);
      const outerMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.35,
        roughness: 0.4,
        side: THREE.DoubleSide
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.rotation.z = Math.PI / 2;
      bioGroup.add(outer);

      // Folded inner cristae sheets
      for (let i = -1.2; i <= 1.2; i += 0.4) {
        const foldGeo = new THREE.BoxGeometry(0.8, 1.6, 0.08);
        const foldMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
        const fold = new THREE.Mesh(foldGeo, foldMat);
        fold.position.set(i, 0, (Math.random() - 0.5) * 0.4);
        fold.rotation.y = (Math.random() - 0.5) * 0.4;
        bioGroup.add(fold);
      }
    } else if (scaleLevel === 'membrane') {
      // Lipid bilayer with embedded proteins
      // Top layer heads (blue spheres)
      const headCount = 80;
      for (let x = -3; x <= 3; x += 0.6) {
        for (let z = -2; z <= 2; z += 0.6) {
          const headTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
          );
          headTop.position.set(x, 0.8, z);
          bioGroup.add(headTop);

          const headBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
          );
          headBottom.position.set(x, -0.8, z);
          bioGroup.add(headBottom);
        }
      }

      // Protein complex (ATP synthase channel in membrane)
      const channel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2.2, 24),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
      );
      bioGroup.add(channel);
    } else if (scaleLevel === 'atp_rotor') {
      // ATP Synthase Rotor (c-ring + central stalk + F1 headpiece)
      rotorMesh = new THREE.Group();

      // c-ring (spinning cylindrical turbine)
      const cRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 })
      );
      cRing.position.y = 1.2;
      rotorMesh.add(cRing);

      // Central Stalk shaft (gamma subunit)
      const stalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 1.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x6366f1 })
      );
      stalk.position.y = 0.3;
      rotorMesh.add(stalk);

      // Stationary stator arm
      const stator = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 2.8, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      stator.position.set(1.4, 0.2, 0);
      bioGroup.add(stator);

      // F1 Catalytic Head (3 alpha-beta dimers synthesizing ATP)
      const headGroup = new THREE.Group();
      headGroup.position.y = -0.7;
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        const sub = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xec4899 : 0xa855f7,
            roughness: 0.3
          })
        );
        sub.position.set(Math.cos(theta) * 0.7, 0, Math.sin(theta) * 0.7);
        headGroup.add(sub);
      }
      bioGroup.add(headGroup);
      bioGroup.add(rotorMesh);

      // Proton stream particles (H+ rushing through c-ring)
      const pCount = 120;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 1.4;
        pPos[i + 1] = 2.5 + Math.random() * 2.0;
        pPos[i + 2] = (Math.random() - 0.5) * 1.4;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1 });
      protonsCloud = new THREE.Points(pGeo, pMat);
      bioGroup.add(protonsCloud);
    }

    // Interaction handlers
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      bioGroup.rotation.y += deltaX * 0.008;
      bioGroup.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(18, camera.position.z + e.deltaY * 0.01));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate whole model slightly
      if (!isDragging) {
        bioGroup.rotation.y += 0.002;
      }

      // Spin ATP turbine proportional to proton gradient
      if (rotorMesh && isSpinning) {
        const spinSpeed = (protonGradient / 100) * 0.08;
        rotorMesh.rotation.y += spinSpeed;
      }

      // Move proton particles downwards
      if (protonsCloud && isSpinning && protonGradient > 0) {
        const posAttr = protonsCloud.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] -= 0.05 * (protonGradient / 50);
          if (arr[i] < -1.5) {
            arr[i] = 3.5 + Math.random() * 0.5;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [scaleLevel, protonGradient, isSpinning]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* 3D Biological Scene */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Scale Hierarchy Nav */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {lang === 'ru' ? 'Погружение: Клетка → Митохондрия → АТФ-синтаза' : 'Deep Dive: Cell to Mitochondria to ATP Synthase'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Проваливайся сквозь масштабы: от 20 микрометров до нано-турбины' : 'Zoom through scales: from 20 micrometers to molecular motor'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              isSpinning
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isSpinning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Scale Step Selector */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setScaleLevel(lvl.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                scaleLevel === lvl.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{lvl.label[lang]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                scaleLevel === lvl.id ? 'bg-slate-950 text-emerald-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {lvl.scale}
              </span>
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="relative w-full h-[440px] sm:h-[480px]">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Scale & Live Gauge */}
          <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs shadow-xl flex flex-col gap-1.5 pointer-events-none">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              {lang === 'ru' ? 'ТЕКУЩИЙ МАСШТАБ' : 'CURRENT SCALE'}
            </span>
            <div className="font-mono text-lg font-bold text-slate-100">
              {levels.find((l) => l.id === scaleLevel)?.scale}
            </div>
            {scaleLevel === 'atp_rotor' && (
              <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-800 font-mono">
                ATP molecules: <span className="font-bold text-amber-300">{atpProduced}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        {scaleLevel === 'atp_rotor' && (
          <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>{lang === 'ru' ? 'Протонный градиент (ΔpH + Δψ)' : 'Proton Motive Force (H+ Gradient)'}</span>
                <span className="font-mono text-emerald-400">{protonGradient}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={protonGradient}
                onChange={(e) => setProtonGradient(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{lang === 'ru' ? 'Турбина вращается со скоростью до 9000 об/мин!' : 'Rotor spins at up to 9,000 RPM in vivo!'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Как клетка генерирует энергию?' : 'How Cells Generate Energy'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {lang === 'ru'
              ? 'Вместо абстрактного определения «митохондрия — энергетическая станция», ты видишь реальный нано-механизм: дыхательная цепь накачивает протоны H+ наружу, как воду в плотину ГЭС. Протоны устремляются назад через узкое кольцо АТФ-синтазы, заставляя ротор физически вращаться и синтезировать АТФ!'
              : 'Instead of dry textbook definitions, you see an actual molecular nanomotor: the electron transport chain pumps protons across the inner membrane like a hydroelectric dam. Protons rush back through ATP synthase, physically spinning its rotor to synthesize high-energy ATP packets!'}
          </p>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200 flex items-start gap-2">
            <span className="text-indigo-400 font-bold">💡</span>
            <span className="leading-relaxed">
              {lang === 'ru'
                ? 'Попробуй уменьшить ползунок протонного градиента до 0% — заметь, что вращение остановится, и клетка перестанет вырабатывать АТФ.'
                : 'Try dragging the proton gradient slider to 0% — observe how the nanomotor halts when the electrochemical gradient collapses.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
