import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Orbit, Play, Pause, RotateCcw, Sparkles, Check, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GravityCoulombProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export const GravityCoulombExplorer: React.FC<GravityCoulombProps> = ({
  lang,
  onUnlockMilestone,
  onSelectConceptForMentor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'gravity' | 'coulomb'>('gravity');
  const [m1, setM1] = useState<number>(60);
  const [m2, setM2] = useState<number>(25);
  const [distance, setDistance] = useState<number>(10);
  const [q1, setQ1] = useState<number>(2);
  const [q2, setQ2] = useState<number>(-2);
  const [isSimulatingOrbit, setIsSimulatingOrbit] = useState<boolean>(true);
  const [predictionMode, setPredictionMode] = useState<boolean>(false);
  const [predictionAnswer, setPredictionAnswer] = useState<string | null>(null);
  const [predictionRevealed, setPredictionRevealed] = useState<boolean>(false);

  // Calculate actual force
  const G = 1.0;
  const k_e = 1.0;
  const forceMagnitude = mode === 'gravity'
    ? (G * m1 * m2) / (distance * distance)
    : Math.abs((k_e * q1 * q2) / (distance * distance));

  const isAttractive = mode === 'gravity' ? true : (q1 * q2 < 0);

  // Notify mentor
  useEffect(() => {
    onSelectConceptForMentor('gravity', { mode, m1, m2, distance, forceMagnitude });
  }, [mode, m1, m2, distance, forceMagnitude]);

  // Handle prediction
  const handleRevealPrediction = () => {
    setPredictionRevealed(true);
    if (predictionAnswer === '4x') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      onUnlockMilestone('predicted_correctly');
    }
  };

  // Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040714);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = (Math.random() - 0.5) * 80;
      starPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.15 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Space grid
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);
    const sunLight = new THREE.PointLight(0xffedd5, 2, 50);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Celestial Body 1 (Center)
    const r1 = Math.max(0.8, Math.min(2.5, Math.cbrt(m1) * 0.45));
    const body1Geo = new THREE.SphereGeometry(r1, 32, 32);
    const body1Mat = new THREE.MeshStandardMaterial({
      color: mode === 'gravity' ? 0xf59e0b : q1 > 0 ? 0xef4444 : 0x3b82f6,
      emissive: mode === 'gravity' ? 0xd97706 : q1 > 0 ? 0xb91c1c : 0x1d4ed8,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const body1 = new THREE.Mesh(body1Geo, body1Mat);
    scene.add(body1);

    // Celestial Body 2 (Orbiter / Partner)
    const r2 = Math.max(0.5, Math.min(1.8, Math.cbrt(m2) * 0.45));
    const body2Geo = new THREE.SphereGeometry(r2, 24, 24);
    const body2Mat = new THREE.MeshStandardMaterial({
      color: mode === 'gravity' ? 0x38bdf8 : q2 > 0 ? 0xef4444 : 0x3b82f6,
      roughness: 0.4
    });
    const body2 = new THREE.Mesh(body2Geo, body2Mat);
    scene.add(body2);

    // Force vector arrows
    const arrowLen = Math.max(0.6, Math.min(4.5, forceMagnitude * 1.5));
    const arrowColor = isAttractive ? 0x10b981 : 0xf43f5e;

    // Arrow from Body 2 to Body 1
    const arrow2to1 = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      arrowLen,
      arrowColor,
      0.5,
      0.3
    );
    scene.add(arrow2to1);

    // Orbit trail circle
    const orbitCurve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(64);
    const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.6
    });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    scene.add(orbitLine);

    // Orbit animation state
    let orbitAngle = 0;
    const orbitalSpeed = Math.sqrt((G * m1) / Math.max(1, distance)) * 0.015;

    // Mouse drag controls
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

      scene.rotation.y += deltaX * 0.006;
      camera.position.y = Math.max(4, Math.min(30, camera.position.y - deltaY * 0.08));

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(10, Math.min(35, camera.position.z + e.deltaY * 0.02));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isSimulatingOrbit) {
        orbitAngle += orbitalSpeed;
      }

      // Position body 2 along circular orbit
      const posX = Math.cos(orbitAngle) * distance;
      const posZ = Math.sin(orbitAngle) * distance;
      body2.position.set(posX, 0, posZ);

      // Update force arrow
      const dirToBody1 = new THREE.Vector3(-posX, 0, -posZ).normalize();
      if (!isAttractive) {
        dirToBody1.negate();
      }
      arrow2to1.position.set(posX, 0, posZ);
      arrow2to1.setDirection(dirToBody1);
      arrow2to1.setLength(arrowLen, 0.45, 0.25);

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
      starGeo.dispose();
      starMat.dispose();
      container.innerHTML = '';
    };
  }, [mode, m1, m2, distance, q1, q2, isSimulatingOrbit, forceMagnitude, isAttractive]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* 3D Simulation Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Orbit className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {mode === 'gravity'
                  ? (lang === 'ru' ? 'Закон всемирного тяготения: F = G·(m₁·m₂)/r²' : 'Newtonian Gravity: F = G·(m₁·m₂)/r²')
                  : (lang === 'ru' ? 'Закон Кулона: F = k·|q₁·q₂|/r²' : 'Coulomb Electrostatics: F = k·|q₁·q₂|/r²')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Меняй параметры и ощущай закон обратных квадратов' : 'Adjust parameters and feel the inverse-square law'}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMode('gravity')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'gravity' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ru' ? 'Гравитация' : 'Gravity'}
              </button>
              <button
                onClick={() => setMode('coulomb')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'coulomb' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ru' ? 'Кулон (Заряды)' : 'Coulomb (Charges)'}
              </button>
            </div>

            <button
              onClick={() => setIsSimulatingOrbit(!isSimulatingOrbit)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isSimulatingOrbit
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isSimulatingOrbit ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3D Canvas Mount */}
        <div className="relative w-full h-[440px] sm:h-[480px]">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Live Force Gauge */}
          <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs shadow-xl flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono uppercase text-[10px] tracking-wider">{lang === 'ru' ? 'СИЛА ПРИТЯЖЕНИЯ F' : 'FORCE MAGNITUDE F'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {forceMagnitude.toFixed(3)} <span className="text-xs font-normal text-slate-400">{lang === 'ru' ? 'у.е.' : 'units'}</span>
            </div>
            <div className="text-[11px] text-slate-300 border-t border-slate-800 pt-1">
              F ∝ 1 / r² = 1 / ({distance}²) = {(1 / (distance * distance)).toFixed(4)}
            </div>
          </div>

          {/* Quick distance mutators */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
            <span className="text-[10px] text-slate-400 font-mono px-2">r:</span>
            <button
              onClick={() => setDistance(Math.max(4, distance / 2))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-mono cursor-pointer"
            >
              0.5x
            </button>
            <button
              onClick={() => setDistance(10)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono cursor-pointer"
            >
              1x (10)
            </button>
            <button
              onClick={() => setDistance(Math.min(22, distance * 2))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-mono cursor-pointer"
            >
              2x (Double)
            </button>
          </div>
        </div>

        {/* Real-time Sliders */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{mode === 'gravity' ? (lang === 'ru' ? 'Масса M₁' : 'Mass M₁') : (lang === 'ru' ? 'Заряд Q₁' : 'Charge Q₁')}</span>
              <span className="font-mono text-cyan-400">{mode === 'gravity' ? m1 : q1}</span>
            </div>
            <input
              type="range"
              min={mode === 'gravity' ? 10 : -5}
              max={mode === 'gravity' ? 120 : 5}
              value={mode === 'gravity' ? m1 : q1}
              onChange={(e) => mode === 'gravity' ? setM1(Number(e.target.value)) : setQ1(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{mode === 'gravity' ? (lang === 'ru' ? 'Масса M₂' : 'Mass M₂') : (lang === 'ru' ? 'Заряд Q₂' : 'Charge Q₂')}</span>
              <span className="font-mono text-cyan-400">{mode === 'gravity' ? m2 : q2}</span>
            </div>
            <input
              type="range"
              min={mode === 'gravity' ? 5 : -5}
              max={mode === 'gravity' ? 60 : 5}
              value={mode === 'gravity' ? m2 : q2}
              onChange={(e) => mode === 'gravity' ? setM2(Number(e.target.value)) : setQ2(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>{lang === 'ru' ? 'Расстояние r' : 'Distance r'}</span>
              <span className="font-mono text-amber-400">{distance.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="4"
              max="22"
              step="0.5"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* "Predict Before Simulate" Side Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? '«Сначала представь» — Тест интуиции' : 'Predict Before Simulate'}
            </h3>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
            {lang === 'ru'
              ? 'Вопрос: Что произойдёт с силой притяжения F, если расстояние между телами r увеличить ровно в 2 раза?'
              : 'Question: What happens to the gravitational force F if the distance r is doubled (r → 2r)?'}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {[
              { id: '2x', text: { en: 'Decreases by 2x (half)', ru: 'Уменьшится ровно в 2 раза' } },
              { id: '4x', text: { en: 'Decreases by 4x (1/4th)', ru: 'Уменьшится в 4 раза (вчетверо)' } },
              { id: 'same', text: { en: 'Stays almost identical', ru: 'Останется прежней' } },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setPredictionAnswer(opt.id);
                  setPredictionRevealed(false);
                }}
                className={`p-3 rounded-xl text-xs text-left font-medium transition-all border cursor-pointer ${
                  predictionAnswer === opt.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt.text[lang]}
              </button>
            ))}
          </div>

          {/* Simulate & Reveal Button */}
          <button
            onClick={handleRevealPrediction}
            disabled={!predictionAnswer}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'ru' ? 'SIMULATE & ПРОВЕРИТЬ' : 'SIMULATE & VERIFY'}
          </button>

          {/* Revealed Feedback */}
          {predictionRevealed && (
            <div className={`p-4 rounded-xl text-xs flex flex-col gap-2 border ${
              predictionAnswer === '4x'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {predictionAnswer === '4x' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ru' ? 'Блестяще! Верное предсказание!' : 'Brilliant! Correct prediction!'}</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'ru' ? 'Не совсем так! Вот почему:' : 'Not quite! Here is why:'}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-[11px]">
                {lang === 'ru'
                  ? 'По закону Ньютона F = G·M·m / r². Когда r удваивается (2r), в знаменателе появляется (2)² = 4. Поэтому сила ослабевает ровно в 4 раза, а не в 2!'
                  : 'By Newton’s law F = G·M·m / r². When r doubles (2r), the denominator becomes (2)² = 4. Hence the force drops by 4x, not 2x!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
