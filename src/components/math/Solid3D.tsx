import { RangeSlider } from '../ui/RangeSlider';
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

/** the polygon where a plane cuts the cube [-a/2, a/2] × [0, a] × [-a/2, a/2] */
function cubeSection(p: P): THREE.Vector3[] {
  if (!p.m) return [];
  const h = p.a / 2;
  const nrm = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, 1, 1)][p.m - 1].normalize();
  const verts: THREE.Vector3[] = [];
  for (const x of [-h, h]) for (const y of [0, p.a]) for (const z of [-h, h]) verts.push(new THREE.Vector3(x, y, z));
  const ds = verts.map((v) => nrm.dot(v));
  const lo = Math.min(...ds);
  const hi = Math.max(...ds);
  const d = lo + (hi - lo) * p.t;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++)
    for (let j = i + 1; j < 8; j++) {
      const v = verts[i];
      const w = verts[j];
      // only the 12 edges: the ends differ in exactly one coordinate
      const diff = [v.x !== w.x, v.y !== w.y, v.z !== w.z].filter(Boolean).length;
      if (diff !== 1) continue;
      const a = ds[i] - d;
      const b = ds[j] - d;
      if (a * b > 0 || a === b) continue;
      const q = v.clone().lerp(w, a / (a - b));
      if (!pts.some((x) => x.distanceTo(q) < 1e-6)) pts.push(q);
    }
  if (pts.length < 3) return pts;
  // order the points around their centre
  const c = pts.reduce((s, v) => s.add(v.clone()), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  const u = new THREE.Vector3().subVectors(pts[0], c).normalize();
  const w = new THREE.Vector3().crossVectors(nrm, u);
  return pts.sort((A, B) => Math.atan2(w.dot(new THREE.Vector3().subVectors(A, c)), u.dot(new THREE.Vector3().subVectors(A, c))) - Math.atan2(w.dot(new THREE.Vector3().subVectors(B, c)), u.dot(new THREE.Vector3().subVectors(B, c))));
}

/** the flat figure that turns into a solid of revolution (x ≥ 0, from the axis outwards) */
function profile(p: P): THREE.Vector2[] {
  if (p.f === 1) return [new THREE.Vector2(0, 0), new THREE.Vector2(p.r, 0), new THREE.Vector2(p.r, p.h), new THREE.Vector2(0, p.h)];
  if (p.f === 2) return [new THREE.Vector2(0, 0), new THREE.Vector2(p.r, 0), new THREE.Vector2(0, p.h)];
  if (p.f === 3) return Array.from({ length: 33 }, (_, i) => new THREE.Vector2(p.r * Math.sin((i / 32) * Math.PI), p.r - p.r * Math.cos((i / 32) * Math.PI)));
  return [new THREE.Vector2(0, 0), new THREE.Vector2(p.r, 0), new THREE.Vector2(p.r / 2, p.h), new THREE.Vector2(0, p.h)];
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
  cube: {
    ru: 'Куб и его сечения',
    en: 'Cube and its cross-sections',
    sliders: [
      { k: 'a', ru: 'Ребро a', en: 'Edge a', min: 2, max: 5, step: 0.5, v: 4 },
      { k: 'm', ru: 'Сечение: 0 нет, 1 горизонтальное, 2 диагональное, 3 через угол', en: 'Section: 0 none, 1 horizontal, 2 diagonal, 3 corner', min: 0, max: 3, step: 1, v: 3 },
      { k: 't', ru: 'Положение плоскости', en: 'Plane position', min: 0.05, max: 0.95, step: 0.01, v: 0.5 },
    ],
    build: (p) => {
      const g = solid(new THREE.BoxGeometry(p.a, p.a, p.a), p.a / 2);
      const h = p.a / 2;
      g.add(line([[-h, 0, -h], [h, p.a, h]]));
      const sec = cubeSection(p);
      if (sec.length >= 3) {
        const c = sec.reduce((s, v) => s.add(v.clone()), new THREE.Vector3()).multiplyScalar(1 / sec.length);
        const pos: number[] = [];
        sec.forEach((v, i) => {
          const w = sec[(i + 1) % sec.length];
          pos.push(c.x, c.y, c.z, v.x, v.y, v.z, w.x, w.y, w.z);
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf5a524, transparent: true, opacity: 0.75, side: THREE.DoubleSide })));
        g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(sec), new THREE.LineBasicMaterial({ color: 0xf5a524 })));
      }
      return g;
    },
    tex: (p) => `d = a\\sqrt{3} = ${n(p.a * Math.sqrt(3))}, \\quad V = a^3 = ${n(p.a ** 3)}, \\quad S = 6a^2 = ${n(6 * p.a * p.a)}`,
    facts: (p, lang) => {
      const sec = cubeSection(p);
      const names: Record<number, [string, string]> = { 3: ['треугольник', 'a triangle'], 4: ['четырёхугольник', 'a quadrilateral'], 5: ['пятиугольник', 'a pentagon'], 6: ['шестиугольник', 'a hexagon'] };
      let S = 0;
      if (sec.length >= 3) {
        const c = sec.reduce((s, v) => s.add(v.clone()), new THREE.Vector3()).multiplyScalar(1 / sec.length);
        sec.forEach((v, i) => (S += new THREE.Vector3().subVectors(v, c).cross(new THREE.Vector3().subVectors(sec[(i + 1) % sec.length], c)).length() / 2));
      }
      return [
        p.m === 0 ? L(lang, 'Выбери вид сечения.', 'Pick a cross-section.') : `${L(lang, 'Сечение', 'The section is')} — ${names[sec.length]?.[lang === 'ru' ? 0 : 1] ?? '—'}, ${L(lang, 'площадь', 'area')} ${n(S)}`,
        L(lang, 'Плоскость через угол даёт треугольник, а ровно посередине — правильный шестиугольник!', 'Through a corner you get a triangle, and right in the middle a regular hexagon!'),
        `${L(lang, 'Диагональ грани', 'Face diagonal')} a√2 = ${n(p.a * Math.SQRT2)}; ${L(lang, 'жёлтым пунктиром — диагональ куба', 'yellow dashes: the space diagonal')}.`,
      ];
    },
  },
  platonic: {
    ru: 'Правильные многогранники',
    en: 'Regular polyhedra',
    sliders: [
      { k: 'k', ru: '1 тетраэдр, 2 куб, 3 октаэдр, 4 додекаэдр, 5 икосаэдр', en: '1 tetra-, 2 cube, 3 octa-, 4 dodeca-, 5 icosahedron', min: 1, max: 5, step: 1, v: 1 },
      { k: 'a', ru: 'Ребро a', en: 'Edge a', min: 1, max: 3.5, step: 0.25, v: 2.5 },
    ],
    build: (p) => {
      const a = p.a;
      const geo =
        p.k === 1
          ? new THREE.TetrahedronGeometry(a * Math.sqrt(3 / 8))
          : p.k === 2
            ? new THREE.BoxGeometry(a, a, a)
            : p.k === 3
              ? new THREE.OctahedronGeometry(a / Math.SQRT2)
              : p.k === 4
                ? new THREE.DodecahedronGeometry((a * Math.sqrt(3) * (1 + Math.sqrt(5))) / 4)
                : new THREE.IcosahedronGeometry((a * Math.sqrt(10 + 2 * Math.sqrt(5))) / 4);
      geo.computeBoundingBox();
      return solid(geo, -geo.boundingBox!.min.y);
    },
    tex: (p) => {
      const a = p.a;
      const V = [a ** 3 / (6 * Math.SQRT2), a ** 3, (Math.SQRT2 / 3) * a ** 3, ((15 + 7 * Math.sqrt(5)) / 4) * a ** 3, ((5 * (3 + Math.sqrt(5))) / 12) * a ** 3][p.k - 1];
      return `V = ${['\\frac{a^3}{6\\sqrt2}', 'a^3', '\\frac{\\sqrt2}{3}a^3', '\\frac{15 + 7\\sqrt5}{4}a^3', '\\frac{5(3 + \\sqrt5)}{12}a^3'][p.k - 1]} = ${n(V)}`;
    },
    facts: (p, lang) => {
      const [V, E, F] = [[4, 6, 4], [8, 12, 6], [6, 12, 8], [20, 30, 12], [12, 30, 20]][p.k - 1];
      const faces = [L(lang, 'треугольники', 'triangles'), L(lang, 'квадраты', 'squares'), L(lang, 'треугольники', 'triangles'), L(lang, 'пятиугольники', 'pentagons'), L(lang, 'треугольники', 'triangles')][p.k - 1];
      return [`${L(lang, 'Вершин', 'Vertices')} ${V}, ${L(lang, 'рёбер', 'edges')} ${E}, ${L(lang, 'граней', 'faces')} ${F} (${faces})`, `${L(lang, 'Формула Эйлера', 'Euler’s formula')}: ${V} − ${E} + ${F} = 2`, L(lang, 'Правильных многогранников ровно пять — их знали ещё Платон и Евклид.', 'There are exactly five regular polyhedra, known since Plato and Euclid.')];
    },
  },
  frustum: {
    ru: 'Усечённые пирамида и конус',
    en: 'Frustums of a pyramid and a cone',
    sliders: [
      { k: 'k', ru: 'Сторон основания (0 — конус)', en: 'Base sides (0 = cone)', min: 0, max: 8, step: 1, v: 4 },
      { k: 'R', ru: 'Радиус нижнего основания R', en: 'Bottom radius R', min: 1, max: 3, step: 0.25, v: 2.5 },
      { k: 'r', ru: 'Радиус верхнего основания r', en: 'Top radius r', min: 0.25, max: 3, step: 0.25, v: 1.25 },
      { k: 'h', ru: 'Высота h', en: 'Height h', min: 1, max: 5, step: 0.5, v: 3 },
    ],
    build: (p) => {
      const sides = p.k < 3 ? 64 : p.k;
      const g = solid(new THREE.CylinderGeometry(Math.min(p.r, p.R), p.R, p.h, sides, 1), p.h / 2);
      g.add(line([[0, 0, 0], [0, p.h, 0]]));
      return g;
    },
    tex: (p) => {
      const r = Math.min(p.r, p.R);
      if (p.k < 3) return `V = \\frac{\\pi h}{3}(R^2 + Rr + r^2) = ${n((Math.PI * p.h * (p.R * p.R + p.R * r + r * r)) / 3)}`;
      const S1 = (p.k * p.R * p.R * Math.sin((2 * Math.PI) / p.k)) / 2;
      const S2 = (p.k * r * r * Math.sin((2 * Math.PI) / p.k)) / 2;
      return `V = \\frac{h}{3}(S_1 + \\sqrt{S_1 S_2} + S_2) = ${n((p.h * (S1 + Math.sqrt(S1 * S2) + S2)) / 3)}`;
    },
    facts: (p, lang) => [L(lang, 'Усечённое тело — то, что остаётся, если отрезать верхушку плоскостью, параллельной основанию.', 'A frustum is what is left after cutting the top off parallel to the base.'), L(lang, 'Сделай r = R — получится призма или цилиндр; r → 0 — полная пирамида или конус.', 'Make r = R for a prism or cylinder; r → 0 gives the whole pyramid or cone.'), p.k < 3 ? `${L(lang, 'Образующая', 'Slant height')} l = √(h² + (R − r)²) = ${n(Math.hypot(p.h, p.R - Math.min(p.r, p.R)))}` : `${L(lang, 'Основания — правильные', 'Bases are regular')} ${p.k}-${L(lang, 'угольники', 'gons')}`],
  },
  rotation: {
    ru: 'Тела вращения',
    en: 'Solids of revolution',
    sliders: [
      { k: 'f', ru: 'Фигура: 1 прямоугольник, 2 треугольник, 3 полукруг, 4 трапеция', en: 'Shape: 1 rectangle, 2 triangle, 3 semicircle, 4 trapezoid', min: 1, max: 4, step: 1, v: 2 },
      { k: 'phi', ru: 'Угол поворота, °', en: 'Turned by, °', min: 0, max: 360, step: 5, v: 250 },
      { k: 'r', ru: 'Радиус / ширина', en: 'Radius / width', min: 1, max: 3, step: 0.25, v: 2 },
      { k: 'h', ru: 'Высота', en: 'Height', min: 1, max: 5, step: 0.5, v: 3.5 },
    ],
    build: (p) => {
      const prof = profile(p);
      const g = new THREE.Group();
      if (p.phi > 0) {
        const geo = new THREE.LatheGeometry(prof, 64, 0, (p.phi * Math.PI) / 180);
        g.add(solid(geo, 0));
      }
      // the flat figure that spins, and the axis
      const shape = new THREE.Shape(prof.map((v) => new THREE.Vector2(v.x, v.y)));
      const flat = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0xf5a524, side: THREE.DoubleSide }));
      flat.rotation.y = -(p.phi * Math.PI) / 180;
      g.add(flat);
      const top = p.f === 3 ? 2 * p.r : p.h;
      g.add(line([[0, -0.5, 0], [0, top + 0.8, 0]], 0xe5484d));
      return g;
    },
    tex: (p) =>
      p.f === 1
        ? `V = \\pi r^2 h = ${n(Math.PI * p.r * p.r * p.h)}`
        : p.f === 2
          ? `V = \\frac{1}{3}\\pi r^2 h = ${n((Math.PI * p.r * p.r * p.h) / 3)}`
          : p.f === 3
            ? `V = \\frac{4}{3}\\pi r^3 = ${n((4 / 3) * Math.PI * p.r ** 3)}`
            : `V = \\frac{\\pi h}{3}(R^2 + Rr + r^2) = ${n((Math.PI * p.h * (p.r * p.r + p.r * (p.r / 2) + (p.r / 2) ** 2)) / 3)}`,
    facts: (p, lang) => [
      [L(lang, 'Прямоугольник, вращаясь вокруг стороны, даёт цилиндр.', 'A rectangle spun about a side makes a cylinder.'), L(lang, 'Прямоугольный треугольник вокруг катета — конус.', 'A right triangle about a leg makes a cone.'), L(lang, 'Полукруг вокруг диаметра — шар.', 'A semicircle about its diameter makes a ball.'), L(lang, 'Прямоугольная трапеция вокруг боковой стороны — усечённый конус.', 'A right trapezoid about its leg makes a frustum.')][p.f - 1],
      L(lang, 'Красная линия — ось вращения, жёлтая фигура «заметает» тело. Доведи угол до 360°.', 'The red line is the axis; the yellow figure sweeps the solid. Take the angle to 360°.'),
      `${L(lang, 'Повёрнуто', 'Turned')}: ${p.phi}° ${L(lang, 'из 360°', 'of 360°')}`,
    ],
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
              <RangeSlider value={p[s.k]} onChange={(v) => setP({ ...p, [s.k]: v })} min={s.min} max={s.max} step={s.step} color="#8E4EC6" />
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
