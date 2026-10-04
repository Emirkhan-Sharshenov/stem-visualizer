import React, { useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { continueRender, delayRender, staticFile } from 'remotion';
import type { Frame as SimFrame, SimDef } from '../../src/components/sims/kit';

/**
 * Draws one of the site's 2D process engines at time t.
 * Engines are pure functions of time, so every video frame is exact.
 */
export const SimCanvas: React.FC<{ sim: SimDef; mode?: string; t: number; params?: Record<string, number>; width: number }> = ({ sim, mode, t, params, width }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const W = 960;
    const H = 540;
    const k = c.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const m = mode ?? sim.modes?.[0]?.id ?? 'default';
    const defs = typeof sim.params === 'function' ? sim.params(m) : sim.params ?? [];
    const p = Object.fromEntries(defs.map((d) => [d.id, params?.[d.id] ?? d.value]));
    const f: SimFrame = { ctx, w: W, h: H, t, p, mode: m, lang: 'ru', L: (ru) => ru, hit: () => undefined, hitRect: () => undefined };
    ctx.save();
    sim.draw(f);
    ctx.restore();
  });
  return <canvas ref={ref} width={1920} height={1080} style={{ width, height: (width * 9) / 16, display: 'block' }} />;
};

/** Minimal three.js host for Remotion: creates once, renders synchronously every frame */
export function useThree(width: number, height: number, setup: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void | Promise<void>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera } | null>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('three setup'));
  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 200);
    scene.add(new THREE.HemisphereLight('#dfe6ff', '#1a1c22', 1.4));
    const key = new THREE.DirectionalLight('#ffffff', 2.4);
    key.position.set(5, 8, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#8fa4ff', 1.6);
    rim.position.set(-6, 3, -5);
    scene.add(rim);
    ctx.current = { renderer, scene, camera };
    Promise.resolve(setup(scene, camera)).then(() => {
      setReady(true);
      continueRender(handle);
    });
    return () => renderer.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const render = () => {
    const c = ctx.current;
    if (c) c.renderer.render(c.scene, c.camera);
  };
  return { canvasRef, ready, render, three: ctx };
}

export function loadGLB(path: string) {
  return new Promise<THREE.Group>((resolve, reject) => new GLTFLoader().load(staticFile(path), (g) => resolve(g.scene), undefined, reject));
}
