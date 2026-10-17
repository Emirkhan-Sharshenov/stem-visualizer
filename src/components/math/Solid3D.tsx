import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SolidId } from './ids';
import { ThreeStage } from '../../lib/three/ThreeStage';
import { Formula } from '../Formula';
import { useScreenDetail } from '../../lib/pageContext';

/* 3D solids for stereometry: rotate with the mouse, change the sizes, watch the volume and surface area. */

type Lang = 'ru' | 'en';
type P = Record<string, number>;
interface Slider {
  k: string;
  ru: string;
  en: string;
  min: number;
  max: number;
  step: number;
  v: number;
}
interface Def {
  ru: string;
  en: string;
  sliders: Slider[];
  build: (p: P) => THREE.Object3D;
  tex: (p: P) => string;
  facts: (p: P, lang: Lang) => string[];
}

const n = (x: number, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d).replace('.', ',');
const L = (lang: Lang, ru: string, en: string) => (lang === 'ru' ? ru : en);

const FACE = 0x8e4ec6;
const EDGE = 0xf2ecff;

function solid(geo: THREE.BufferGeometry, y = 0): THREE.Group {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: FACE, transparent: true, opacity: 0.45, roughness: 0.4, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: EDGE }));
  mesh.position.y = y;
  edges.position.y = y;
  g.add(mesh, edges);
  return g;
}

function line(points: [number, number, number][], color = 0xf5a524, dashed = true): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }) : new THREE.LineBasicMaterial({ color });
  const l = new THREE.Line(geo, mat);
  l.computeLineDistances();
  return l;
}

const DEFS: Record<SolidId, Def> = {
  cuboid: {
    ru: 'Прямоугольный параллелепипед',
    en: 'Cuboid',
    sliders: [
      { k: 'a', ru: 'Длина a', en: 'Length a', min: 1, max: 6, step: 0.5, v: 4 },
      { k: 'b', ru: 'Ширина b', en: 'Width b', min: 1, max: 6, step: 0.5, v: 3 },
      { k: 'c', ru: 'Высота c', en: 'Height c', min: 1, max: 6, step: 0.5, v: 2 },
    ],
    build: (p) => {
      const g = solid(new THREE.BoxGeometry(p.a, p.c, p.b), p.c / 2);
      g.add(line([[-p.a / 2, 0, -p.b / 2], [p.a / 2, p.c, p.b / 2]]));
      return g;
    },
    tex: (p) => `V = abc = ${n(p.a * p.b * p.c)}, \\quad S = 2(ab + bc + ac) = ${n(2 * (p.a * p.b + p.b * p.c + p.a * p.c))}`,
    facts: (p, lang) => [`${L(lang, 'Диагональ (жёлтая)', 'Diagonal (yellow)')}: d = √(a² + b² + c²) = ${n(Math.hypot(p.a, p.b, p.c))}`, L(lang, '6 граней, 12 рёбер, 8 вершин. Если a = b = c — это куб.', '6 faces, 12 edges, 8 vertices. With a = b = c it is a cube.')],
  },
  prism: {
    ru: 'Правильная призма',
    en: 'Regular prism',
    sliders: [
      { k: 'k', ru: 'Сторон основания', en: 'Base sides', min: 3, max: 8, step: 1, v: 3 },
      { k: 'a', ru: 'Сторона основания a', en: 'Base side a', min: 1, max: 5, step: 0.5, v: 3 },
      { k: 'h', ru: 'Высота h', en: 'Height h', min: 1, max: 6, step: 0.5, v: 4 },
    ],
    build: (p) => {
      const R = p.a / (2 * Math.sin(Math.PI / p.k));
      return solid(new THREE.CylinderGeometry(R, R, p.h, p.k, 1), p.h / 2);
    },
    tex: (p) => {
      const base = (p.k * p.a * p.a) / (4 * Math.tan(Math.PI / p.k));
      return `V = S_{осн} \\cdot h = ${n(base)} \\cdot ${n(p.h)} = ${n(base * p.h)}`;
    },
    facts: (p, lang) => {
      const base = (p.k * p.a * p.a) / (4 * Math.tan(Math.PI / p.k));
      return [`${L(lang, 'Площадь основания', 'Base area')}: ${n(base)}`, `${L(lang, 'Боковая поверхность', 'Lateral area')}: P·h = ${n(p.k * p.a * p.h)}`, `${L(lang, 'Полная поверхность', 'Total area')}: ${n(p.k * p.a * p.h + 2 * base)}`];
    },
  },
  pyramid: {
    ru: 'Правильная пирамида',
    en: 'Regular pyramid',
    sliders: [
      { k: 'k', ru: 'Сторон основания', en: 'Base sides', min: 3, max: 8, step: 1, v: 4 },
      { k: 'a', ru: 'Сторона основания a', en: 'Base side a', min: 1, max: 5, step: 0.5, v: 3 },
      { k: 'h', ru: 'Высота h', en: 'Height h', min: 1, max: 6, step: 0.5, v: 4 },
    ],
    build: (p) => {
      const R = p.a / (2 * Math.sin(Math.PI / p.k));
      const g = solid(new THREE.ConeGeometry(R, p.h, p.k, 1), p.h / 2);
      g.add(line([[0, 0, 0], [0, p.h, 0]]));
      return g;
    },
    tex: (p) => {
      const base = (p.k * p.a * p.a) / (4 * Math.tan(Math.PI / p.k));
      return `V = \\frac{1}{3} S_{осн} h = ${n(base * p.h / 3)}`;
    },
    facts: (p, lang) => {
      const r = p.a / (2 * Math.tan(Math.PI / p.k));
      const apothem = Math.hypot(r, p.h);
      return [`${L(lang, 'Высота (жёлтая) падает в центр основания', 'The height (yellow) drops to the centre of the base')}`, `${L(lang, 'Апофема', 'Slant height')}: √(r² + h²) = ${n(apothem)}`, `${L(lang, 'Боковая поверхность', 'Lateral area')}: ½·P·l = ${n(0.5 * p.k * p.a * apothem)}`, L(lang, 'Пирамида втрое меньше призмы с тем же основанием и высотой.', 'A pyramid is a third of the prism with the same base and height.')];
    },
  },
  cylinder: {
    ru: 'Цилиндр и конус',
    en: 'Cylinder and cone',
    sliders: [
      { k: 'cone', ru: '1 — цилиндр, 2 — конус', en: '1 cylinder, 2 cone', min: 1, max: 2, step: 1, v: 1 },
      { k: 'r', ru: 'Радиус r', en: 'Radius r', min: 0.5, max: 3, step: 0.25, v: 1.5 },
      { k: 'h', ru: 'Высота h', en: 'Height h', min: 1, max: 6, step: 0.5, v: 4 },
    ],
    build: (p) => {
      const g = p.cone === 2 ? solid(new THREE.ConeGeometry(p.r, p.h, 48, 1), p.h / 2) : solid(new THREE.CylinderGeometry(p.r, p.r, p.h, 48, 1), p.h / 2);
      g.add(line([[0, 0, 0], [p.r, 0, 0]], 0x30a46c, false));
      g.add(line([[0, 0, 0], [0, p.h, 0]]));
      return g;
    },
    tex: (p) => (p.cone === 2 ? `V = \\frac{1}{3}\\pi r^2 h = ${n((Math.PI * p.r * p.r * p.h) / 3)}` : `V = \\pi r^2 h = ${n(Math.PI * p.r * p.r * p.h)}`),
    facts: (p, lang) => {
      const l = Math.hypot(p.r, p.h);
      return p.cone === 2
        ? [`${L(lang, 'Образующая', 'Slant height')}: l = √(r² + h²) = ${n(l)}`, `S_${L(lang, 'бок', 'lat')} = πrl = ${n(Math.PI * p.r * l)}`, `S_${L(lang, 'полн', 'tot')} = πr(r + l) = ${n(Math.PI * p.r * (p.r + l))}`]
        : [`S_${L(lang, 'бок', 'lat')} = 2πrh = ${n(2 * Math.PI * p.r * p.h)}`, `S_${L(lang, 'полн', 'tot')} = 2πr(r + h) = ${n(2 * Math.PI * p.r * (p.r + p.h))}`, L(lang, 'Развёртка боковой поверхности — прямоугольник 2πr × h.', 'Unrolled, the side is a 2πr × h rectangle.')];
    },
  },
  sphere: {
    ru: 'Шар и сфера',
    en: 'Ball and sphere',
    sliders: [{ k: 'r', ru: 'Радиус R', en: 'Radius R', min: 0.5, max: 3, step: 0.25, v: 2 }],
    build: (p) => {
      const g = solid(new THREE.SphereGeometry(p.r, 32, 20), p.r);
      g.add(line([[0, p.r, 0], [p.r, p.r, 0]], 0x30a46c, false));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.02, 8, 96), new THREE.MeshBasicMaterial({ color: 0xf5a524 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = p.r;
      g.add(ring);
      return g;
    },
    tex: (p) => `V = \\frac{4}{3}\\pi R^3 = ${n((4 / 3) * Math.PI * p.r ** 3)}, \\quad S = 4\\pi R^2 = ${n(4 * Math.PI * p.r * p.r)}`,
    facts: (p, lang) => [L(lang, 'Жёлтое — большая окружность (экватор), зелёное — радиус.', 'Yellow: a great circle; green: the radius.'), `${L(lang, 'Длина большой окружности', 'Great circle length')}: 2πR = ${n(2 * Math.PI * p.r)}`, L(lang, 'Увеличь R вдвое — объём вырастет в 8 раз, площадь в 4.', 'Double R: the volume grows 8×, the area 4×.')],
  },
};

export const Solid3D: React.FC<{ id: SolidId; lang: Lang }> = ({ id, lang }) => {
  const def = DEFS[id];
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<ThreeStage | null>(null);
  const group = useRef<THREE.Object3D | null>(null);
  const [p, setP] = useState<P>(() => Object.fromEntries(def.sliders.map((s) => [s.k, s.v])));

  useEffect(() => {
    if (!host.current) return;
    const st = new ThreeStage(host.current, { cameraPosition: [7, 6, 9], target: [0, 1.6, 0], minDistance: 4, maxDistance: 24 });
    const grid = new THREE.GridHelper(12, 12, 0x3a3d45, 0x26282e);
    st.scene.add(grid);
    stage.current = st;
    return () => {
      st.dispose();
      stage.current = null;
    };
  }, []);

  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    if (group.current) {
      st.scene.remove(group.current);
      group.current.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose();
      });
    }
    const g = def.build(p);
    st.scene.add(g);
    group.current = g;
  }, [p, def]);

  const facts = def.facts(p, lang);
  useScreenDetail('model-solid', `3D-модель: ${def.ru}. ${def.sliders.map((s) => `${s.ru} = ${p[s.k]}`).join(', ')}. ${facts.join(' ')}`);

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="relative">
        <div ref={host} className="lab-stage h-[340px] md:h-[400px]" />
        <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-md bg-black/40 text-white/80 pointer-events-none">{L(lang, 'Крути мышкой или пальцем', 'Drag to rotate')}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4 border-t border-line">
        <div className="flex flex-col gap-3">
          <p className="font-medium text-ink">{lang === 'ru' ? def.ru : def.en}</p>
          {def.sliders.map((s) => (
            <label key={s.k} className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                <span>{lang === 'ru' ? s.ru : s.en}</span>
                <span className="font-mono text-ink">{n(p[s.k])}</span>
              </span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={p[s.k]} onChange={(e) => setP({ ...p, [s.k]: Number(e.target.value) })} className="w-full accent-[#8E4EC6] cursor-pointer" />
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="overflow-x-auto text-ink text-[17px] py-1">
            <Formula tex={def.tex(p)} display />
          </div>
          <ul className="text-sm text-ink-2 flex flex-col gap-1">
            {facts.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Solid3D;
