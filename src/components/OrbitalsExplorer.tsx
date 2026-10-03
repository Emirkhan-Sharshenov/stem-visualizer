import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitalRenderStyle, OrbitalType, ExplanationLevel } from '../types/stem';
import { CONCEPTS_LIST } from '../data/concepts';
import { Layers, RotateCcw, Eye, Play, Pause, Compass, HelpCircle, ChevronRight, Sparkles, Sliders } from 'lucide-react';

interface OrbitalsExplorerProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onOpenPrediction: (challengeId: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export const OrbitalsExplorer: React.FC<OrbitalsExplorerProps> = ({
  lang,
  onUnlockMilestone,
  onOpenPrediction,
  onSelectConceptForMentor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [n, setN] = useState<number>(2);
  const [l, setL] = useState<number>(1);
  const [m, setM] = useState<number>(0);
  const [orbitalType, setOrbitalType] = useState<OrbitalType>('2pz');
  const [renderStyle, setRenderStyle] = useState<OrbitalRenderStyle>('density');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [sliceZ, setSliceZ] = useState<number>(0);
  const [particleDensity, setParticleDensity] = useState<number>(3500);
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(2);
  const [showNucleus, setShowNucleus] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);

  const conceptData = orbitalType.startsWith('1s') || orbitalType.startsWith('2s')
    ? CONCEPTS_LIST.find(c => c.id === 's-orbital')!
    : CONCEPTS_LIST.find(c => c.id === 'p-orbital')!;

  // Notify mentor of current state
  useEffect(() => {
    onSelectConceptForMentor('orbitals', { n, l, m, orbitalType, renderStyle });
  }, [n, l, m, orbitalType, renderStyle]);

  // Unlock first milestone on mount
  useEffect(() => {
    onUnlockMilestone('first_orbital');
  }, []);

  // Update quantum numbers when orbitalType preset is picked
  const handleSelectOrbital = (type: OrbitalType) => {
    setOrbitalType(type);
    if (type === '1s') { setN(1); setL(0); setM(0); }
    else if (type === '2s') { setN(2); setL(0); setM(0); }
    else if (type === '2px') { setN(2); setL(1); setM(1); }
    else if (type === '2pz') { setN(2); setL(1); setM(0); }
    else if (type === '3dz2') { setN(3); setL(2); setM(0); }
    else if (type === '3dxy') { setN(3); setL(2); setM(-2); }
    else if (type === '4f') { setN(4); setL(3); setM(0); }
  };

  // Evaluate wavefunctions ψ(x,y,z) for realistic quantum rendering
  const evaluateWavefunction = (x: number, y: number, z: number, currentType: OrbitalType): { psi: number; prob: number; phase: number } => {
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r === 0) return { psi: 1, prob: 1, phase: 1 };
    const theta = Math.acos(Math.max(-1, Math.min(1, z / r)));
    const phi = Math.atan2(y, x);

    let psi = 0;
    const a0 = 1.0; // scaled Bohr radius
    const rho = (2 * r) / (n * a0);

    if (currentType === '1s') {
      psi = Math.exp(-rho / 2);
    } else if (currentType === '2s') {
      // Has radial node at rho = 2 (r = 2a0)
      psi = (2 - rho) * Math.exp(-rho / 2);
    } else if (currentType === '2pz') {
      // Dumbbell along z-axis, angular node at z=0 (theta = pi/2)
      psi = rho * Math.exp(-rho / 2) * Math.cos(theta);
    } else if (currentType === '2px') {
      // Dumbbell along x-axis
      psi = rho * Math.exp(-rho / 2) * Math.sin(theta) * Math.cos(phi);
    } else if (currentType === '3dz2') {
      // 3z^2 - r^2
      psi = (rho * rho) * Math.exp(-rho / 3) * (3 * Math.cos(theta) * Math.cos(theta) - 1);
    } else if (currentType === '3dxy') {
      // Four cloverleaf lobes
      psi = (rho * rho) * Math.exp(-rho / 3) * (Math.sin(theta) * Math.sin(theta)) * Math.sin(2 * phi);
    } else if (currentType === '4f') {
      // Multi-lobed f-orbital
      psi = (rho * rho * rho) * Math.exp(-rho / 4) * (5 * Math.pow(Math.cos(theta), 3) - 3 * Math.cos(theta));
    }

    const prob = psi * psi;
    const phase = psi >= 0 ? 1 : -1;
    return { psi, prob, phase };
  };

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Coordinate grid & axes helper
    const axesGroup = new THREE.Group();
    if (showAxes) {
      const axes = new THREE.AxesHelper(3.5);
      axesGroup.add(axes);
      const grid = new THREE.GridHelper(8, 16, 0x1e293b, 0x0f172a);
      grid.position.y = -2.5;
      axesGroup.add(grid);
    }
    scene.add(axesGroup);

    // Nucleus representation (clustered glowing core)
    const nucleusGroup = new THREE.Group();
    if (showNucleus) {
      const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      nucleusGroup.add(core);

      // Glow halo
      const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff453a,
        transparent: true,
        opacity: 0.35,
        wireframe: true
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      nucleusGroup.add(glow);
    }
    scene.add(nucleusGroup);

    // Orbital Visuals Construction
    const orbitalGroup = new THREE.Group();

    // 1. Particle Cloud (Monte Carlo sampling according to |psi|^2)
    const count = particleDensity;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    let placed = 0;
    const maxRadius = n === 1 ? 3.0 : n === 2 ? 4.2 : 5.5;

    // Monte Carlo rejection / importance sampling
    for (let i = 0; i < count * 25 && placed < count; i++) {
      const u = (Math.random() - 0.5) * 2 * maxRadius;
      const v = (Math.random() - 0.5) * 2 * maxRadius;
      const w = (Math.random() - 0.5) * 2 * maxRadius;

      // Slice filter if in slice mode
      if (renderStyle === 'slice' && Math.abs(w - sliceZ) > 0.35) {
        continue;
      }

      const { psi, prob, phase } = evaluateWavefunction(u, v, w, orbitalType);

      // Rejection threshold
      const threshold = Math.random() * 0.85;
      const normalizedProb = Math.min(1.0, prob * (orbitalType === '1s' ? 1.0 : 3.5));

      if (normalizedProb > threshold) {
        positions[placed * 3] = u;
        positions[placed * 3 + 1] = w; // map z to three.js y
        positions[placed * 3 + 2] = v;

        // Color coding depending on render style
        if (renderStyle === 'phase') {
          if (phase > 0) {
            // Neon cyan (+)
            colors[placed * 3] = 0.05;
            colors[placed * 3 + 1] = 0.85;
            colors[placed * 3 + 2] = 0.95;
          } else {
            // Warm orange/amber (-)
            colors[placed * 3] = 1.0;
            colors[placed * 3 + 1] = 0.45;
            colors[placed * 3 + 2] = 0.1;
          }
        } else if (renderStyle === 'nodes') {
          // Highlight near-zero regions in purple/white
          if (Math.abs(psi) < 0.15) {
            colors[placed * 3] = 0.95;
            colors[placed * 3 + 1] = 0.95;
            colors[placed * 3 + 2] = 1.0;
          } else {
            colors[placed * 3] = 0.2;
            colors[placed * 3 + 1] = 0.3;
            colors[placed * 3 + 2] = 0.5;
          }
        } else {
          // Continuous probability density gradient (deep violet to bright electric blue/cyan)
          const t = Math.min(1.0, normalizedProb * 1.5);
          colors[placed * 3] = 0.1 + 0.3 * t;
          colors[placed * 3 + 1] = 0.2 + 0.7 * t;
          colors[placed * 3 + 2] = 0.7 + 0.3 * t;
        }

        placed++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions.subarray(0, placed * 3), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors.subarray(0, placed * 3), 3));

    const pMaterial = new THREE.PointsMaterial({
      size: renderStyle === 'dots' ? 0.045 : 0.065,
      vertexColors: true,
      transparent: true,
      opacity: renderStyle === 'slice' ? 0.95 : 0.75,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(geometry, pMaterial);
    orbitalGroup.add(pointCloud);

    // 2. Nodal Surfaces visualization when in 'nodes' mode
    if (renderStyle === 'nodes') {
      onUnlockMilestone('discovered_node');
      if (orbitalType === '2s') {
        // Spherical radial node at r = 2
        const nodeSphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.65, 32, 32),
          new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            wireframe: true,
            transparent: true,
            opacity: 0.4
          })
        );
        orbitalGroup.add(nodeSphere);
      } else if (orbitalType === '2pz') {
        // Planar angular node at y=0 (XZ plane)
        const planeGeo = new THREE.PlaneGeometry(5, 5);
        const planeMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
          wireframe: true
        });
        const nodePlane = new THREE.Mesh(planeGeo, planeMat);
        nodePlane.rotation.x = Math.PI / 2;
        orbitalGroup.add(nodePlane);
      } else if (orbitalType === '2px') {
        // Planar angular node at x=0 (YZ plane)
        const planeGeo = new THREE.PlaneGeometry(5, 5);
        const planeMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
          wireframe: true
        });
        const nodePlane = new THREE.Mesh(planeGeo, planeMat);
        nodePlane.rotation.y = Math.PI / 2;
        orbitalGroup.add(nodePlane);
      } else if (orbitalType === '3dz2') {
        // Conical nodes
        const coneGeo = new THREE.ConeGeometry(2.5, 3.5, 32, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        });
        const coneTop = new THREE.Mesh(coneGeo, coneMat);
        coneTop.position.y = 1.7;
        const coneBottom = new THREE.Mesh(coneGeo, coneMat);
        coneBottom.rotation.x = Math.PI;
        coneBottom.position.y = -1.7;
        orbitalGroup.add(coneTop);
        orbitalGroup.add(coneBottom);
      }
    }

    // 3. Slice indicator plane
    if (renderStyle === 'slice') {
      const sliceIndicator = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 6),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.15,
          wireframe: false
        })
      );
      sliceIndicator.position.y = sliceZ;
      sliceIndicator.rotation.x = Math.PI / 2;
      orbitalGroup.add(sliceIndicator);
    }

    scene.add(orbitalGroup);

    // Mouse Drag Interaction for Rotation
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

      orbitalGroup.rotation.y += deltaX * 0.008;
      orbitalGroup.rotation.x += deltaY * 0.008;

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

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        orbitalGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      pMaterial.dispose();
      container.innerHTML = '';
    };
  }, [orbitalType, renderStyle, particleDensity, sliceZ, showNucleus, showAxes, isRotating]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* 3D Visualizer Canvas & Overlays */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {conceptData.title[lang]}
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  n={n}, ℓ={l}, m={m}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{conceptData.subtitle[lang]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrediction('pred-p-orbital')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'ru' ? 'Сначала представь' : 'Predict First'}
            </button>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isRotating
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={lang === 'ru' ? 'Вращение' : 'Rotation'}
            >
              {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Orbitals Quick Selector Badges */}
        <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
            {lang === 'ru' ? 'Орбитали:' : 'Orbitals:'}
          </span>
          {(['1s', '2s', '2pz', '2px', '3dz2', '3dxy', '4f'] as OrbitalType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleSelectOrbital(type)}
              className={`px-3 py-1 rounded-lg font-mono font-medium transition-all cursor-pointer ${
                orbitalType === type
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Main 3D Canvas Mount */}
        <div className="relative w-full h-[460px] sm:h-[500px]">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Interactive Canvas HUD */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-md rounded-xl p-2.5 text-xs text-slate-300 flex flex-col gap-1 shadow-lg max-w-xs pointer-events-auto">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                <span>{lang === 'ru' ? 'ИНТЕРАКТИВ' : 'CONTROLS'}</span>
                <span>🖱️ Drag to Rotate • 🔍 Scroll to Zoom</span>
              </div>
              <div className="text-[11px] text-slate-300">
                {renderStyle === 'phase' && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm"></span>
                      Phase (+)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                      Phase (-)
                    </span>
                  </div>
                )}
                {renderStyle === 'nodes' && (
                  <div className="text-purple-400 font-mono pt-1 text-[11px]">
                    ψ = 0 (Probability = 0 at purple surface)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Mode Switches floating top-right */}
          <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800/90 backdrop-blur-md rounded-xl p-1.5 flex flex-col gap-1 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
              {lang === 'ru' ? 'Режим отображения' : 'Render Style'}
            </div>
            {(
              [
                { id: 'density', label: { en: 'Probability Density', ru: 'Плотность вероятности' } },
                { id: 'dots', label: { en: 'Dot Cloud (Monte Carlo)', ru: 'Облако точек (|ψ|²)' } },
                { id: 'phase', label: { en: 'Wavefunction Phase (+/-)', ru: 'Знак / Фаза (+/-)' } },
                { id: 'nodes', label: { en: 'Nodal Surfaces', ru: 'Узловые поверхности' } },
                { id: 'slice', label: { en: 'Cross-Section Slice', ru: 'Сечение / Срез' } },
              ] as { id: OrbitalRenderStyle; label: { en: string; ru: string } }[]
            ).map((style) => (
              <button
                key={style.id}
                onClick={() => setRenderStyle(style.id)}
                className={`px-3 py-1.5 text-left rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  renderStyle === style.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {style.label[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Interactive Sliders Bar */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Число точек в облаке' : 'Point Sampling'}</span>
              <span className="font-mono text-cyan-400">{particleDensity}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="500"
              value={particleDensity}
              onChange={(e) => setParticleDensity(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {renderStyle === 'slice' && (
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>{lang === 'ru' ? 'Высота среза (Z)' : 'Slice Height (Z)'}</span>
                <span className="font-mono text-cyan-400">{sliceZ.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.5"
                max="2.5"
                step="0.1"
                value={sliceZ}
                onChange={(e) => setSliceZ(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showNucleus}
                onChange={(e) => setShowNucleus(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              {lang === 'ru' ? 'Показать ядро' : 'Show Nucleus'}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              {lang === 'ru' ? 'Оси координат' : 'Coordinate Axes'}
            </label>
          </div>
        </div>
      </div>

      {/* Multi-Level "Why?" Explanation Panel (Beginner → School → Advanced → University) */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HelpCircle className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-100 text-sm">
                {lang === 'ru' ? '«Почему?» — Слои понимания' : '"Why?" — Explanatory Depth'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Lvl {explanationLevel}
            </span>
          </div>

          {/* Level Switcher Buttons */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {([1, 2, 3, 4] as ExplanationLevel[]).map((lvl) => {
              const tier = conceptData.tiers.find((t) => t.level === lvl)!;
              return (
                <button
                  key={lvl}
                  onClick={() => setExplanationLevel(lvl)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    explanationLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tier.badge[lang]}
                </button>
              );
            })}
          </div>

          {/* Tier Content Display */}
          {(() => {
            const currentTier = conceptData.tiers.find((t) => t.level === explanationLevel)!;
            return (
              <div className="flex flex-col gap-3 transition-all">
                <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  {currentTier.title[lang]}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                  {currentTier.content[lang]}
                </p>

                {currentTier.visualCue && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-200 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">💡</span>
                    <span>{currentTier.visualCue[lang]}</span>
                  </div>
                )}

                {currentTier.mathFormula && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs font-mono text-cyan-300 overflow-x-auto shadow-inner">
                    <div className="text-[10px] uppercase text-slate-500 font-sans font-bold tracking-wider mb-1">
                      {lang === 'ru' ? 'МАТЕМАТИЧЕСКАЯ ФОРМУЛА' : 'MATHEMATICAL FORMULATION'}
                    </div>
                    <code>{currentTier.mathFormula}</code>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quick Spatial Prompt */}
          <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'ru' ? 'Как меняется форма при росте n?' : 'How does n affect size?'}</span>
            <button
              onClick={() => handleSelectOrbital(orbitalType === '1s' ? '2s' : '1s')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {orbitalType === '1s' ? 'Try 2s' : 'Try 1s'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
