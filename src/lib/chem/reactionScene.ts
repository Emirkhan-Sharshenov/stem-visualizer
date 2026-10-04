import * as THREE from 'three';
import { atomInfo, atomMesh, Bond } from './build3d';
import { Reaction, SPECIES, Species } from './reactions';

/* Timeline of every reaction (seconds) */
export const RT = {
  meet: 3,
  breakStart: 3.4,
  breakEnd: 4.2,
  moveStart: 3.8,
  moveEnd: 5.2,
  formStart: 4.6,
  formEnd: 5.4,
  flash: 5.0,
  apart: 5.4,
  apartEnd: 9,
  duration: 10,
};

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
const ease = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

interface Instance {
  sp: Species;
  local: THREE.Vector3[];
  /** meeting / formation position */
  at: THREE.Vector3;
  /** start (reactants) or final (products) position */
  far: THREE.Vector3;
  axis: THREE.Vector3;
  baseRot: THREE.Quaternion;
}

function centred(sp: Species) {
  const c = new THREE.Vector3();
  sp.atoms.forEach(([, x, y, z]) => c.add(new THREE.Vector3(x, y, z)));
  c.divideScalar(sp.atoms.length);
  return sp.atoms.map(([, x, y, z]) => new THREE.Vector3(x, y, z).sub(c));
}

function placeRing(n: number, radius: number, rand: () => number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.3;
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.75, (rand() - 0.5) * 1.2);
  });
}

function randomQuat(rand: () => number) {
  const u1 = rand();
  const u2 = rand() * Math.PI * 2;
  const u3 = rand() * Math.PI * 2;
  const a = Math.sqrt(1 - u1);
  const b = Math.sqrt(u1);
  return new THREE.Quaternion(a * Math.sin(u2), a * Math.cos(u2), b * Math.sin(u3), b * Math.cos(u3));
}

export interface ReactionScene {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  update: (t: number) => void;
  dispose: () => void;
  radius: number;
}

/**
 * Builds a 3D reaction: reactant molecules approach and collide, old bonds fade,
 * every atom travels to its place in a product molecule, new bonds appear, products fly apart.
 * Each atom's position is a pure function of time, so the timeline can be scrubbed freely.
 */
export function buildReaction(rx: Reaction): ReactionScene {
  const rand = rng(rx.id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const group = new THREE.Group();

  const mk = (keys: string[], ringR: number, farK: number): Instance[] => {
    const ring = placeRing(keys.length, keys.length === 1 ? 0 : ringR, rand);
    return keys.map((k, i) => {
      const sp = SPECIES[k];
      return { sp, local: centred(sp), at: ring[i], far: ring[i].clone().multiplyScalar(farK), axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), baseRot: randomQuat(rand) };
    });
  };
  const nR = rx.reactants.length;
  const nP = rx.products.length;
  const reactants = mk(rx.reactants, 1.5 + nR * 0.35, 2.4);
  const products = mk(rx.products, 1.4 + nP * 0.35, 2.2);
  if (nR === 1) reactants[0].far.set(-6, 0, 0);
  if (nP === 1) products[0].far.set(0, 0, 0);

  // reactant atoms at the moment of collision
  const spinAt = (inst: Instance, t: number) => new THREE.Quaternion().setFromAxisAngle(inst.axis, 0.45 * t).multiply(inst.baseRot);
  const reactantAtoms: { sym: string; inst: number; idx: number }[] = [];
  reactants.forEach((inst, r) => inst.sp.atoms.forEach(([sym], i) => reactantAtoms.push({ sym, inst: r, idx: i })));
  const meetPos = reactantAtoms.map((a) => {
    const inst = reactants[a.inst];
    return inst.local[a.idx].clone().applyQuaternion(spinAt(inst, RT.meet)).add(inst.at);
  });

  // orient each product so its atoms sit close to atoms of the same element
  products.forEach((inst) => {
    let best = inst.baseRot;
    let bestCost = Infinity;
    for (let k = 0; k < 60; k++) {
      const q = k === 0 ? inst.baseRot : randomQuat(rand);
      let cost = 0;
      inst.sp.atoms.forEach(([sym], i) => {
        const p = inst.local[i].clone().applyQuaternion(q).add(inst.at);
        let m = Infinity;
        reactantAtoms.forEach((ra, j) => {
          if (ra.sym === sym) m = Math.min(m, p.distanceToSquared(meetPos[j]));
        });
        cost += m;
      });
      if (cost < bestCost) {
        bestCost = cost;
        best = q;
      }
    }
    inst.baseRot = best;
  });
  const productSlots: { sym: string; inst: number; idx: number; pos: THREE.Vector3 }[] = [];
  products.forEach((inst, p) => inst.sp.atoms.forEach(([sym], i) => productSlots.push({ sym, inst: p, idx: i, pos: inst.local[i].clone().applyQuaternion(inst.baseRot).add(inst.at) })));

  // greedy nearest assignment of reactant atoms to product slots, element by element
  const slotOf = new Array<number>(reactantAtoms.length).fill(-1);
  const used = new Set<number>();
  const pairs: [number, number, number][] = [];
  reactantAtoms.forEach((ra, i) => productSlots.forEach((ps, j) => ra.sym === ps.sym && pairs.push([meetPos[i].distanceToSquared(ps.pos), i, j])));
  pairs.sort((a, b) => a[0] - b[0]);
  pairs.forEach(([, i, j]) => {
    if (slotOf[i] === -1 && !used.has(j)) {
      slotOf[i] = j;
      used.add(j);
    }
  });
  if (slotOf.some((s) => s === -1) || productSlots.length !== reactantAtoms.length) console.warn('[reaction] unbalanced', rx.id);

  // meshes
  const ox = new Map((rx.oxidation ?? []).map((o) => [o.sym, o]));
  const meshes = reactantAtoms.map((ra) => {
    const m = atomMesh(ra.sym, 'sticks');
    const o = ox.get(ra.sym);
    m.userData.info = atomInfo(
      ra.sym,
      o
        ? {
            ru: `В этой реакции: степень окисления ${o.from} → ${o.to} (${o.role === 'ox' ? 'окисляется, восстановитель' : 'восстанавливается, окислитель'}).`,
            en: `In this reaction: oxidation state ${o.from} → ${o.to} (${o.role === 'ox' ? 'oxidised, the reducing agent' : 'reduced, the oxidising agent'}).`,
          }
        : undefined,
    );
    group.add(m);
    return m;
  });
  const atomIndex = (which: 'r' | 'p', inst: number, idx: number) =>
    which === 'r' ? reactantAtoms.findIndex((a) => a.inst === inst && a.idx === idx) : slotOf.findIndex((s) => s !== -1 && productSlots[s].inst === inst && productSlots[s].idx === idx);
  const oldBonds = reactants.flatMap((inst, r) => inst.sp.bonds.map(([a, b, o]) => ({ a: atomIndex('r', r, a), b: atomIndex('r', r, b), bond: new Bond(o) })));
  const newBonds = products.flatMap((inst, p) => inst.sp.bonds.map(([a, b, o]) => ({ a: atomIndex('p', p, a), b: atomIndex('p', p, b), bond: new Bond(o, '#E8D9A8') })));
  [...oldBonds, ...newBonds].forEach((b) => group.add(b.bond.group));

  // energy flash and electrons
  const exo = rx.dH < 0;
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: exo ? '#FFB547' : '#5B8CFF', transparent: true, opacity: 0, depthWrite: false }));
  group.add(flash);
  const light = new THREE.PointLight(exo ? '#FFB547' : '#5B8CFF', 0, 30);
  group.add(light);
  const electrons: { from: number; to: number; mesh: THREE.Mesh; k: number }[] = [];
  if (rx.electrons) {
    const { from, to, n } = rx.electrons;
    const eMat = new THREE.MeshBasicMaterial({ color: '#3DD6F5' });
    reactantAtoms.forEach((ra, i) => {
      if (ra.sym !== from) return;
      // the nearest acceptor atom in the products
      let best = -1;
      let bd = Infinity;
      reactantAtoms.forEach((rb, j) => {
        if (rb.sym !== to) return;
        const d = productSlots[slotOf[i]].pos.distanceToSquared(productSlots[slotOf[j]].pos);
        if (d < bd) {
          bd = d;
          best = j;
        }
      });
      for (let k = 0; k < n; k++) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), eMat);
        mesh.userData.info = {
          title: { ru: 'Электрон', en: 'Electron' },
          text: { ru: `Переходит от ${from} к ${to}: ${from} окисляется (отдаёт электроны), ${to} восстанавливается (принимает).`, en: `Moves from ${from} to ${to}: ${from} is oxidised (loses electrons), ${to} is reduced (gains them).` },
        };
        group.add(mesh);
        electrons.push({ from: i, to: best, mesh, k });
      }
    });
  }

  const pos = meshes.map(() => new THREE.Vector3());
  const up = new THREE.Vector3(0, 1, 0);
  const update = (t: number) => {
    reactantAtoms.forEach((ra, i) => {
      const r = reactants[ra.inst];
      // reactant pose at time t (rigid approach)
      const tt = Math.min(t, RT.meet);
      const k = ease(tt, 0, RT.meet);
      const centre = r.far.clone().lerp(r.at, k);
      const rp = r.local[ra.idx].clone().applyQuaternion(spinAt(r, tt)).add(centre);
      // collision jitter
      if (t > RT.meet && t < RT.moveEnd) {
        const j = 0.06 * Math.sin(t * 40 + i) * ease(t, RT.meet, RT.breakStart) * (1 - ease(t, RT.moveStart, RT.moveEnd));
        rp.addScalar(j);
      }
      const slot = productSlots[slotOf[i]];
      if (!slot) {
        pos[i].copy(rp);
        return;
      }
      const p = products[slot.inst];
      const after = Math.max(0, t - RT.moveEnd);
      const pk = ease(t, RT.apart, RT.apartEnd);
      const pRot = new THREE.Quaternion().setFromAxisAngle(p.axis, 0.3 * after).multiply(p.baseRot);
      const pp = p.local[slot.idx].clone().applyQuaternion(pRot).add(p.at.clone().lerp(p.far, pk));
      const m = ease(t, RT.moveStart, RT.moveEnd);
      pos[i].copy(rp).lerp(pp, m).addScaledVector(up, Math.sin(m * Math.PI) * 0.35 * ((i % 2) * 2 - 1));
    });
    meshes.forEach((m, i) => m.position.copy(pos[i]));
    const oldOp = 1 - ease(t, RT.breakStart, RT.breakEnd);
    oldBonds.forEach((b) => b.bond.update(pos[b.a], pos[b.b], oldOp));
    const newOp = ease(t, RT.formStart, RT.formEnd);
    newBonds.forEach((b) => b.a >= 0 && b.b >= 0 && b.bond.update(pos[b.a], pos[b.b], newOp));
    // energy
    const fk = (t - RT.flash) / 1.6;
    const on = fk > 0 && fk < 1;
    flash.visible = on;
    if (on) {
      flash.scale.setScalar(exo ? 1 + fk * 7 : 8 - fk * 7);
      (flash.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - Math.abs(fk - 0.25) / 0.75);
    }
    light.intensity = on ? 40 * (1 - fk) : 0;
    electrons.forEach((e) => {
      const ek = ease(t, 3.9 + e.k * 0.12, 4.8 + e.k * 0.12);
      e.mesh.visible = ek > 0 && ek < 1;
      if (e.mesh.visible) e.mesh.position.copy(pos[e.from]).lerp(pos[e.to], ek).addScaledVector(up, Math.sin(ek * Math.PI) * 0.8 + e.k * 0.15);
    });
  };
  update(0);

  let radius = 0;
  [...reactants, ...products].forEach((i) => (radius = Math.max(radius, i.far.length() + 1.5)));
  return {
    group,
    pickables: [...meshes, ...electrons.map((e) => e.mesh)],
    update,
    radius,
    dispose: () => {
      [...oldBonds, ...newBonds].forEach((b) => b.bond.dispose());
      group.traverse((o) => {
        const mat = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (mat) mat.dispose();
      });
    },
  };
}
