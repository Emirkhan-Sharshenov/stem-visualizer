import * as THREE from 'three';
import type { PartInfo } from '../three/ThreeStage';
import { element } from './elements';

export type AtomRow = [string, number, number, number];
export type BondRow = [number, number, number];
export type Style = 'sticks' | 'spheres';

const sphereGeo = new THREE.SphereGeometry(1, 32, 24);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 16, 1);
const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function atomMaterial(sym: string) {
  const key = sym;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: element(sym).color, roughness: 0.35, metalness: 0.05 });
    matCache.set(key, m);
  }
  return m.clone();
}

export function atomInfo(sym: string, extra?: { ru: string; en: string }): PartInfo {
  const el = element(sym);
  return {
    title: { ru: `${el.name.ru} (${sym})`, en: `${el.name.en} (${sym})` },
    text: { ru: `${el.text.ru}${extra ? ' ' + extra.ru : ''}`, en: `${el.text.en}${extra ? ' ' + extra.en : ''}` },
  };
}

export function atomMesh(sym: string, style: Style) {
  const el = element(sym);
  const mesh = new THREE.Mesh(sphereGeo, atomMaterial(sym));
  mesh.scale.setScalar(style === 'spheres' ? el.vdw * 0.62 : el.r);
  mesh.userData.sym = sym;
  return mesh;
}

/** A bond of order 1–3 drawn as parallel cylinders between two points */
export class Bond {
  readonly group = new THREE.Group();
  private sticks: THREE.Mesh[] = [];
  private material: THREE.MeshStandardMaterial;
  constructor(public order: number, color = '#C9CDD3') {
    this.material = new THREE.MeshStandardMaterial({ color, roughness: 0.45, transparent: true });
    const n = Math.max(1, Math.min(3, order));
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(cylGeo, this.material);
      this.sticks.push(m);
      this.group.add(m);
    }
  }
  private static up = new THREE.Vector3(0, 1, 0);
  private static tmp = new THREE.Vector3();
  private static side = new THREE.Vector3();
  update(a: THREE.Vector3, b: THREE.Vector3, opacity = 1, radius = 0.09) {
    const dir = Bond.tmp.subVectors(b, a);
    const len = dir.length();
    this.group.visible = opacity > 0.02 && len > 1e-3;
    if (!this.group.visible) return;
    this.material.opacity = opacity;
    this.material.depthWrite = opacity > 0.95;
    dir.normalize();
    // offset for multiple bonds: any vector perpendicular to the bond
    const side = Bond.side.crossVectors(dir, Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : Bond.up).normalize();
    const n = this.sticks.length;
    const r = n === 1 ? radius : radius * 0.62;
    const q = new THREE.Quaternion().setFromUnitVectors(Bond.up, dir);
    this.sticks.forEach((s, i) => {
      const off = (i - (n - 1) / 2) * r * 2.6;
      s.position.copy(a).add(b).multiplyScalar(0.5).addScaledVector(side, off);
      s.quaternion.copy(q);
      s.scale.set(r, len, r);
    });
  }
  dispose() {
    this.material.dispose();
  }
}

/** Static molecule model, centred at the origin */
export function buildMolecule(atoms: AtomRow[], bonds: BondRow[], style: Style, infoFor?: (i: number, sym: string, nBonds: number) => PartInfo) {
  const group = new THREE.Group();
  const centre = new THREE.Vector3();
  atoms.forEach(([, x, y, z]) => centre.add(new THREE.Vector3(x, y, z)));
  centre.divideScalar(atoms.length || 1);
  const pos = atoms.map(([, x, y, z]) => new THREE.Vector3(x, y, z).sub(centre));
  const degree = atoms.map(() => 0);
  bonds.forEach(([a, b]) => {
    degree[a]++;
    degree[b]++;
  });
  const meshes = atoms.map(([sym], i) => {
    const m = atomMesh(sym, style);
    m.position.copy(pos[i]);
    m.userData.info = infoFor ? infoFor(i, sym, degree[i]) : atomInfo(sym);
    group.add(m);
    return m;
  });
  const bondObjs: Bond[] = [];
  if (style === 'sticks')
    bonds.forEach(([a, b, o]) => {
      const bond = new Bond(o);
      bond.update(pos[a], pos[b]);
      group.add(bond.group);
      bondObjs.push(bond);
    });
  let radius = 0;
  pos.forEach((p) => (radius = Math.max(radius, p.length())));
  return { group, meshes, bonds: bondObjs, radius: radius + 1 };
}

export function disposeGroup(group: THREE.Object3D) {
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m && 'dispose' in m) m.dispose();
  });
}
