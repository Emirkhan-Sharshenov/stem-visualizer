import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Rotate3d, Compass, Play, Pause, ChevronRight, HelpCircle, Layers, Move } from 'lucide-react';

interface Math2D3DExplorerProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export type MathSubMode = 'revolution' | 'divergence';

export const Math2D3DExplorer: React.FC<Math2D3DExplorerProps> = ({
  lang,
  onUnlockMilestone,
  onSelectConceptForMentor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const [subMode, setSubMode] = useState<MathSubMode>('revolution');

  // Solid of revolution state
  const [curveType, setCurveType] = useState<'sqrt' | 'sin' | 'parabola' | 'cone'>('sqrt');
  const [rotationAngle, setRotationAngle] = useState<number>(360); // 0 to 360 deg
  const [sliceCount, setSliceCount] = useState<number>(24);
  const [showDiscs, setShowDiscs] = useState<boolean>(true);

  // Divergence state
  const [fieldType, setFieldType] = useState<'source' | 'sink' | 'vortex' | 'saddle'>('source');
  const [probePos, setProbePos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // Curve definition
  const f = (x: number): number => {
    if (curveType === 'sqrt') return Math.sqrt(Math.max(0, x)) * 1.35;
    if (curveType === 'sin') return Math.sin(x * 1.5) * 0.8 + 1.2;
    if (curveType === 'parabola') return 0.25 * x * x + 0.3;
    if (curveType === 'cone') return 2.2 - 0.45 * x;
    return 1;
  };

  // Integral calculation
  const a = 0.2;
  const b = 3.8;
  const dx = (b - a) / sliceCount;
  let riemannVolume = 0;
  for (let i = 0; i < sliceCount; i++) {
    const xi = a + (i + 0.5) * dx;
    const r = f(xi);
    riemannVolume += Math.PI * r * r * dx;
  }
  const scaledAngleVol = riemannVolume * (rotationAngle / 360);

  // Notify mentor
  useEffect(() => {
    onSelectConceptForMentor(subMode === 'revolution' ? 'revolution' : 'divergence', {
      subMode,
      curveType,
      rotationAngle,
      sliceCount,
      fieldType
    });
  }, [subMode, curveType, rotationAngle, sliceCount, fieldType]);

  // Unlock milestone when full 360 revolution is made
  useEffect(() => {
    if (subMode === 'revolution' && rotationAngle >= 355) {
      onUnlockMilestone('dimension_walker');
    }
  }, [subMode, rotationAngle]);

  // Draw 2D Graph on left canvas
  useEffect(() => {
    const canvas = canvas2DRef.current;
    if (!canvas || subMode !== 'revolution') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = fitCanvas(canvas, ctx);
    ctx.clearRect(0, 0, w, h);

    // Coordinate grid
    ctx.strokeStyle = '#26282D';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    const originX = 35;
    const originY = h - 35;
    const scaleX = (w - 60) / 4;
    const scaleY = (h - 60) / 3;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    // X axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(w - 15, originY);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, 15);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Fira Code';
    ctx.fillText('x (axis of rotation)', w - 130, originY - 8);
    ctx.fillText('y = f(x)', originX + 8, 25);

    // Draw Riemann discs (rectangles in 2D)
    if (showDiscs) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      for (let i = 0; i < sliceCount; i++) {
        const xVal = a + i * dx;
        const midX = xVal + dx / 2;
        const yVal = f(midX);

        const px = originX + xVal * scaleX;
        const pw = dx * scaleX;
        const py = originY - yVal * scaleY;
        const ph = yVal * scaleY;

        ctx.fillRect(px, py, pw, ph);
        ctx.strokeRect(px, py, pw, ph);
      }
    }

    // Draw continuous curve f(x)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let xVal = 0; xVal <= 4.0; xVal += 0.05) {
      const yVal = f(xVal);
      const px = originX + xVal * scaleX;
      const py = originY - yVal * scaleY;
      if (xVal === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [subMode, curveType, sliceCount, showDiscs]);

  // Three.js Scene Setup (Right side 3D model)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111214);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Rotation Axis line (X-axis)
    const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, 12, 16);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const rotAxis = new THREE.Mesh(axisGeo, axisMat);
    rotAxis.rotation.z = Math.PI / 2;
    mainGroup.add(rotAxis);

    if (subMode === 'revolution') {
      // Build 3D Solid of Revolution
      const angleRad = (rotationAngle * Math.PI) / 180;
      const xOffset = -(a + b) / 2;

      if (showDiscs) {
        // Stack of Riemann Discs (Cylinders along X axis)
        for (let i = 0; i < sliceCount; i++) {
          const midX = a + (i + 0.5) * dx;
          const radius = f(midX);

          // Partial cylinder based on rotationAngle
          const discGeo = new THREE.CylinderGeometry(
            radius,
            radius,
            dx * 0.96,
            32,
            1,
            false,
            0,
            angleRad
          );
          const discMat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x06b6d4 : 0x3b82f6,
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
          const disc = new THREE.Mesh(discGeo, discMat);
          disc.rotation.z = Math.PI / 2;
          disc.position.x = midX + xOffset;
          mainGroup.add(disc);
        }
      } else {
        // Smooth revolved surface
        const points: THREE.Vector2[] = [];
        for (let i = 0; i <= 40; i++) {
          const xVal = a + (i / 40) * (b - a);
          points.push(new THREE.Vector2(f(xVal), xVal + xOffset));
        }
        const latheGeo = new THREE.LatheGeometry(points, 48, 0, angleRad);
        const latheMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          roughness: 0.3
        });
        const lathe = new THREE.Mesh(latheGeo, latheMat);
        lathe.rotation.z = Math.PI / 2;
        mainGroup.add(lathe);
      }
    } else {
      // Divergence & Vector Field Visualization
      // Vector Field Grid of Arrows
      const gridSize = 4;
      const step = 1.3;

      for (let x = -gridSize; x <= gridSize; x += step) {
        for (let y = -gridSize; y <= gridSize; y += step) {
          for (let z = -gridSize; z <= gridSize; z += step) {
            const pos = new THREE.Vector3(x, y, z);
            if (pos.length() > gridSize * 1.2 || pos.length() < 0.3) continue;

            let vec = new THREE.Vector3();
            if (fieldType === 'source') {
              vec.copy(pos).normalize(); // Points outward: div > 0
            } else if (fieldType === 'sink') {
              vec.copy(pos).negate().normalize(); // Points inward: div < 0
            } else if (fieldType === 'vortex') {
              vec.set(-y, x, 0).normalize(); // Circular: div = 0, curl != 0
            } else if (fieldType === 'saddle') {
              vec.set(x, -y, 0).normalize();
            }

            const arrow = new THREE.ArrowHelper(
              vec,
              pos,
              0.8,
              fieldType === 'source' ? 0x10b981 : fieldType === 'sink' ? 0xef4444 : 0x8b5cf6,
              0.25,
              0.15
            );
            mainGroup.add(arrow);
          }
        }
      }

      // Flowing dynamic particles
      const pCount = 200;
      const pPositions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i++) {
        pPositions[i] = (Math.random() - 0.5) * 6;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08 });
      const pCloud = new THREE.Points(pGeo, pMat);
      mainGroup.add(pCloud);
    }

    // Smooth orbit / zoom / pan with mouse and touch; the view survives scene rebuilds
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    if (viewRef.current) {
      camera.position.copy(viewRef.current.position);
      controls.target.copy(viewRef.current.target);
    }
    renderer.domElement.style.touchAction = 'none';
    let isDragging = false;
    controls.addEventListener('start', () => { isDragging = true; });
    controls.addEventListener('end', () => { isDragging = false; });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        mainGroup.rotation.y += 0.003;
      }
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      viewRef.current = { position: camera.position.clone(), target: controls.target.clone() };
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [subMode, curveType, rotationAngle, sliceCount, showDiscs, fieldType]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* 2D & 3D Interactive Container */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Rotate3d className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {subMode === 'revolution'
                  ? (lang === 'ru' ? '2D ↔ 3D Тела вращения (Интегралы)' : '2D ↔ 3D Solids of Revolution')
                  : (lang === 'ru' ? 'Векторные поля и Дивергенция (∇·F)' : 'Vector Field & Divergence (∇·F)')}
              </h2>
              <p className="text-xs text-slate-400">
                {subMode === 'revolution'
                  ? (lang === 'ru' ? 'Слева: плоский график f(x). Справа: объёмное вращение дисков dx' : 'Left: 2D curve f(x). Right: 3D Revolved volume of dx discs')
                  : (lang === 'ru' ? 'Визуализация истоков, стоков и векторного потока' : 'Visualize sources, sinks, and vector flux')}
              </p>
            </div>
          </div>

          {/* Sub-mode switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSubMode('revolution')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subMode === 'revolution' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ru' ? 'Тела вращения' : 'Revolution'}
            </button>
            <button
              onClick={() => setSubMode('divergence')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subMode === 'divergence' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ru' ? 'Дивергенция' : 'Divergence'}
            </button>
          </div>
        </div>

        {/* Dual Canvas Display for Revolution: 2D on Left, 3D on Right */}
        {subMode === 'revolution' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950/40">
            {/* 2D Curve Canvas */}
            <div className="flex flex-col p-4">
              <div className="text-[11px] font-mono text-cyan-400 font-bold mb-2 flex items-center justify-between">
                <span>{lang === 'ru' ? '2D ГРАФИК КРИВОЙ y = f(x)' : '2D PROFILE CURVE y = f(x)'}</span>
                <span className="text-slate-400">dx = {dx.toFixed(2)}</span>
              </div>
              <div className="lab-stage bg-slate-950 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
                <canvas ref={canvas2DRef} width={380} height={340} className="block w-full h-auto max-h-[340px] object-contain" />
              </div>

              {/* Curve Switcher */}
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {[
                  { id: 'sqrt', label: '√x' },
                  { id: 'sin', label: 'sin(x)+1' },
                  { id: 'parabola', label: '0.25x²' },
                  { id: 'cone', label: 'Cone' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurveType(c.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      curveType === c.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Revolved Canvas */}
            <div className="flex flex-col p-4">
              <div className="text-[11px] font-mono text-cyan-400 font-bold mb-2 flex items-center justify-between">
                <span>{lang === 'ru' ? '3D ОБЪЕМНОЕ ВРАЩЕНИЕ (ИНТЕГРАЛ)' : '3D SOLID OF REVOLUTION'}</span>
                <span className="text-slate-400 font-mono">θ = {rotationAngle}°</span>
              </div>
              <div className="lab-stage relative w-full rounded-xl overflow-hidden border border-slate-800/80">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              {/* Volume Live Indicator */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{lang === 'ru' ? 'Объём V = π ∫ [f(x)]² dx:' : 'Volume V = π ∫ [f(x)]² dx:'}</span>
                <span className="text-cyan-400 font-bold text-sm">{scaledAngleVol.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Divergence 3D Canvas */
          <div className="lab-stage relative w-full h-[450px]">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Divergence Type Switcher */}
            <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 shadow-xl flex flex-col gap-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {lang === 'ru' ? 'ТИП ВЕКТОРНОГО ПОЛЯ' : 'VECTOR FIELD TYPE'}
              </div>
              {[
                { id: 'source', label: { en: 'Source (div > 0)', ru: 'Источник (div > 0)' }, color: 'text-emerald-400' },
                { id: 'sink', label: { en: 'Sink (div < 0)', ru: 'Сток / Дренаж (div < 0)' }, color: 'text-rose-400' },
                { id: 'vortex', label: { en: 'Vortex / Curl (div = 0)', ru: 'Вихрь (div = 0, curl ≠ 0)' }, color: 'text-purple-400' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFieldType(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all border cursor-pointer ${
                    fieldType === f.id
                      ? 'bg-slate-800 border-cyan-500/60 text-white font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={f.color}>{f.label[lang]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sliders bar */}
        {subMode === 'revolution' && (
          <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>{lang === 'ru' ? 'Угол вращения (2D → 3D)' : 'Rotation Angle (2D → 3D)'}</span>
                <span className="font-mono text-cyan-400">{rotationAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>{lang === 'ru' ? 'Число сечений дисков (n)' : 'Integration Discs (n)'}</span>
                <span className="font-mono text-cyan-400">{sliceCount}</span>
              </div>
              <input
                type="range"
                min="6"
                max="60"
                step="2"
                value={sliceCount}
                onChange={(e) => setSliceCount(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Math Explanation Side Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {subMode === 'revolution'
                ? (lang === 'ru' ? 'Суть метода дисков' : 'The Disc Integration Method')
                : (lang === 'ru' ? 'Что такое дивергенция?' : 'What is Divergence?')}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {subMode === 'revolution' ? (
              lang === 'ru'
                ? 'Формула V = π ∫ [f(x)]² dx перестает быть абстрактной, когда ты видишь монетки! Каждая монетка имеет радиус r = f(x) и тонкую толщину dx. Площадь круга равна π r² = π [f(x)]². Умножая на толщину dx, получаем объём одной монетки dV. Суммируя все монетки от a до b, получаем точный объём всего 3D тела!'
                : 'The formula V = π ∫ [f(x)]² dx becomes intuitive when you see the stacked coins! Each circular coin has radius r = f(x) and tiny thickness dx. The coin’s volume is dV = π [f(x)]² dx. Summing all coins from a to b yields the exact 3D solid volume.'
            ) : (
              lang === 'ru'
                ? 'Дивергенция ∇·F — это скалярная величина, показывающая «плотность источников» поля в данной точке. Если ∇·F > 0, точка испускает поток наружу (как фонтан). Если ∇·F < 0, поле стекается в точку и исчезает (как слив). Если ∇·F = 0, сколько втекает — столько и вытекает!'
                : 'Divergence ∇·F measures outward flux density. If ∇·F > 0, the point acts as an emitter/source (like an expanding gas). If ∇·F < 0, vectors converge and vanish (sink). If ∇·F = 0, net influx equals net outflux (incompressible).'
            )}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs font-mono text-cyan-300">
            <div className="text-[10px] uppercase text-slate-500 font-sans font-bold tracking-wider mb-1">
              {lang === 'ru' ? 'МАТЕМАТИЧЕСКАЯ ЗАПИСЬ' : 'FORMULA'}
            </div>
            <code>
              {subMode === 'revolution'
                ? 'V = \\lim_{\\Delta x \\to 0} \\sum \\pi [f(x_i)]^2 \\Delta x = \\pi \\int_{a}^{b} [f(x)]^2 dx'
                : '\\nabla \\cdot \\vec{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
