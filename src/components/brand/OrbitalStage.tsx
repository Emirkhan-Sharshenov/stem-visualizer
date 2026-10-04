import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type StageOrbital = '2s' | '2pz' | '2px';

interface OrbitalStageProps {
  orbital: StageOrbital;
  className?: string;
}

const POINTS = 7000;
const EXTENT = 11;
const SCALE = 0.16;

// Rejection-sample hydrogen orbitals (atomic units, Z = 1); colour each point by the sign of psi
function sampleOrbital(orbital: StageOrbital) {
  const positions = new Float32Array(POINTS * 3);
  const colors = new Float32Array(POINTS * 3);
  const positive = new THREE.Color('#5B7CFF');
  const negative = new THREE.Color('#30A46C');

  let placed = 0;
  let guard = 0;
  while (placed < POINTS && guard < 4_000_000) {
    guard++;
    const x = (Math.random() * 2 - 1) * EXTENT;
    const y = (Math.random() * 2 - 1) * EXTENT;
    const z = (Math.random() * 2 - 1) * EXTENT;
    const r = Math.sqrt(x * x + y * y + z * z);

    let psi: number;
    let maxDensity: number;
    if (orbital === '2s') {
      psi = (2 - r) * Math.exp(-r / 2);
      maxDensity = 4;
    } else {
      psi = (orbital === '2pz' ? z : x) * Math.exp(-r / 2);
      maxDensity = 0.55;
    }
    if (Math.random() * maxDensity > psi * psi) continue;

    // three.js is y-up: map physics z onto scene y
    positions[placed * 3] = x * SCALE;
    positions[placed * 3 + 1] = z * SCALE;
    positions[placed * 3 + 2] = y * SCALE;
    const c = psi >= 0 ? positive : negative;
    colors[placed * 3] = c.r;
    colors[placed * 3 + 1] = c.g;
    colors[placed * 3 + 2] = c.b;
    placed++;
  }
  return { positions, colors };
}

function nodalRing(orbital: StageOrbital) {
  const radius = orbital === '2s' ? 2 * SCALE : 1.6;
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(96));
  const material = new THREE.LineDashedMaterial({ color: 0x8fa4ff, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.7 });
  const ring = new THREE.Line(geometry, material);
  ring.computeLineDistances();
  if (orbital === '2pz') ring.rotation.x = Math.PI / 2;
  if (orbital === '2px') ring.rotation.y = Math.PI / 2;
  return ring;
}

export const OrbitalStage: React.FC<OrbitalStageProps> = ({ orbital, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<THREE.Points | null>(null);
  const ringRef = useRef<THREE.Line | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(3.2, 1.6, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x3a3d45 });
    const axes = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(0, 0, -2), new THREE.Vector3(0, 0, 2),
    ]);
    group.add(new THREE.LineSegments(axes, axisMaterial));

    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    group.add(nucleus);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const tick = () => {
      if (!reduceMotion) group.rotation.y += 0.0035;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      groupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (cloudRef.current) {
      group.remove(cloudRef.current);
      cloudRef.current.geometry.dispose();
      (cloudRef.current.material as THREE.Material).dispose();
    }
    if (ringRef.current) {
      group.remove(ringRef.current);
      ringRef.current.geometry.dispose();
      (ringRef.current.material as THREE.Material).dispose();
    }

    const { positions, colors } = sampleOrbital(orbital);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false });
    const cloud = new THREE.Points(geometry, material);
    group.add(cloud);
    cloudRef.current = cloud;

    const ring = nodalRing(orbital);
    group.add(ring);
    ringRef.current = ring;
  }, [orbital]);

  return <div ref={mountRef} className={`w-full h-full ${className}`} />;
};
