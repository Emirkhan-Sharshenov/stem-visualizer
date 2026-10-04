import * as THREE from 'three';
import { RoundedBoxGeometry as RoundedBox } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { PartInfo } from './ThreeStage';

export interface BioSimState {
  gradient: number; // 0..1 proton motive force
  running: boolean;
}

export interface BioModel {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  update: (dt: number, elapsed: number, state: BioSimState) => void;
  camera: { position: [number, number, number]; target: [number, number, number] };
}

export const BIO_COLORS = {
  membrane: '#8EC5F0',
  nucleus: '#8E7CF0',
  nucleolus: '#5B45C9',
  er: '#4FB3BF',
  golgi: '#F07AA0',
  mito: '#F5A524',
  cristae: '#E5484D',
  lysosome: '#30A46C',
  vesicle: '#F7B6CB',
  ribosome: '#E8D9B0',
  lipidHead: '#6FB1E8',
  lipidTail: '#E8D9B0',
  complexI: '#4FB3BF',
  complexIII: '#8E7CF0',
  complexIV: '#E5484D',
  cytC: '#F5A524',
  synthase: '#30A46C',
  proton: '#FF6B6B',
  cRing: '#4FB3BF',
  alpha: '#E5484D',
  beta: '#5B7CFF',
  gamma: '#B79CFF',
  stator: '#9AA0A8',
  atp: '#F5C451',
} as const;

const info = (ru: string, en: string, textRu: string, textEn: string, goTo?: string): PartInfo => ({
  title: { ru, en },
  text: { ru: textRu, en: textEn },
  goTo,
});

const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.02, ...opts });

const glass = (color: string, opacity: number) =>
  new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.25, side: THREE.DoubleSide, depthWrite: false });

function tag<T extends THREE.Object3D>(object: T, partInfo: PartInfo, shell = false): T {
  object.userData.info = partInfo;
  if (shell) object.userData.shell = true;
  return object;
}

// Deterministic pseudo-random so models look the same on every visit
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomInSphere(rand: () => number, radius: number) {
  const u = rand(), v = rand(), w = Math.cbrt(rand()) * radius;
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  return new THREE.Vector3(w * Math.sin(phi) * Math.cos(theta), w * Math.cos(phi) * 0.8, w * Math.sin(phi) * Math.sin(theta));
}

/* ───────────────────────── Level 1: animal cell ───────────────────────── */

export function buildCell(): BioModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const rand = rng(7);

  // Plasma membrane: an organic, slightly lumpy translucent shell
  const membraneGeo = new THREE.IcosahedronGeometry(4, 6);
  const pos = membraneGeo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = 1 + 0.05 * Math.sin(v.x * 1.3 + v.y * 0.7) + 0.04 * Math.sin(v.z * 1.7 - v.x * 0.5);
    v.multiplyScalar(n);
    v.y *= 0.82;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  membraneGeo.computeVertexNormals();
  const membrane = tag(
    new THREE.Mesh(membraneGeo, glass(BIO_COLORS.membrane, 0.14)),
    info('Клеточная мембрана', 'Plasma membrane', 'Двойной слой липидов толщиной около 8 нм. Решает, что войдёт в клетку, а что нет: пропускает воду и кислород, а для ионов и сахаров нужны белки-каналы.', 'A lipid bilayer about 8 nm thick. It decides what gets in: water and oxygen pass, while ions and sugars need protein channels.'),
    true,
  );
  const membraneEdge = new THREE.Mesh(membraneGeo, new THREE.MeshBasicMaterial({ color: BIO_COLORS.membrane, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }));
  membraneEdge.scale.setScalar(1.012);
  group.add(membrane, membraneEdge);
  pickables.push(membrane);

  // Nucleus with envelope, nucleolus and pores
  const nucleus = new THREE.Group();
  nucleus.position.set(-0.6, 0.15, 0);
  const envelope = new THREE.Mesh(new THREE.SphereGeometry(1.25, 48, 32), glass(BIO_COLORS.nucleus, 0.5));
  const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), mat(BIO_COLORS.nucleolus, { roughness: 0.4 }));
  nucleolus.position.set(0.25, 0.1, 0.2);
  const pores = new THREE.InstancedMesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12), mat('#C9BFFF'), 60);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) {
    const dir = randomInSphere(rand, 1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    m4.compose(dir.multiplyScalar(1.25), q, new THREE.Vector3(1, 1, 1));
    pores.setMatrixAt(i, m4);
  }
  nucleus.add(envelope, nucleolus, pores);
  tag(nucleus, info('Ядро', 'Nucleus', 'Хранит ДНК — инструкцию по сборке всех белков клетки. Окружено двойной мембраной с порами, через которые выходят копии генов (мРНК).', 'Stores DNA, the instructions for every protein. Wrapped in a double membrane with pores that let gene copies (mRNA) out.'));
  tag(nucleolus, info('Ядрышко', 'Nucleolus', 'Участок ядра, где собираются рибосомы — машины для сборки белков.', 'The part of the nucleus where ribosomes, the protein-building machines, are assembled.'));
  group.add(nucleus);
  pickables.push(nucleus);

  // Rough ER: folded sheets wrapped around the nucleus, studded with ribosomes
  const er = new THREE.Group();
  er.position.copy(nucleus.position);
  const erMat = mat(BIO_COLORS.er, { roughness: 0.45 });
  for (let i = 0; i < 6; i++) {
    const sheet = new THREE.Mesh(new THREE.TorusGeometry(1.55 + i * 0.16, 0.05, 10, 64, 2.2 + rand() * 0.8), erMat);
    sheet.rotation.set(rand() * 0.6 - 0.3, rand() * Math.PI * 2, Math.PI / 2 + rand() * 0.5 - 0.25);
    er.add(sheet);
  }
  tag(er, info('Шероховатая ЭПС', 'Rough ER', 'Сеть мембранных каналов вокруг ядра. На ней сидят рибосомы, поэтому она «шероховатая»: здесь собираются белки для экспорта.', 'A network of membrane channels around the nucleus. Ribosomes stud its surface, so new export proteins are made here.'));
  group.add(er);
  pickables.push(er);

  // Golgi: stacked curved cisternae
  const golgi = new THREE.Group();
  golgi.position.set(1.9, -0.7, 0.9);
  golgi.rotation.set(0.3, -0.6, 0.2);
  const golgiMat = mat(BIO_COLORS.golgi, { roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const cisterna = new THREE.Mesh(new THREE.TorusGeometry(0.75 - i * 0.05, 0.075, 10, 40, 1.9), golgiMat);
    cisterna.position.y = i * 0.17;
    cisterna.rotation.z = -0.95;
    golgi.add(cisterna);
  }
  tag(golgi, info('Аппарат Гольджи', 'Golgi apparatus', 'Сортировочный центр клетки. Достраивает белки из ЭПС, упаковывает в пузырьки и отправляет по адресу.', 'The cell’s sorting centre. It finishes proteins from the ER, packs them into vesicles and ships them out.'));
  group.add(golgi);
  pickables.push(golgi);

  // Mitochondria: capsules scattered through the cytoplasm
  const mitoInfo = info('Митохондрия', 'Mitochondrion', 'Энергостанция клетки: сжигает глюкозу с кислородом и запасает энергию в молекулах АТФ. Нажми «Приблизить», чтобы заглянуть внутрь.', 'The cell’s power station: it burns glucose with oxygen and stores the energy in ATP. Tap “Zoom in” to look inside.', 'mitochondria');
  const mitoMat = mat(BIO_COLORS.mito, { roughness: 0.4 });
  const mitoInner = mat(BIO_COLORS.cristae, { roughness: 0.5 });
  const mitoSpots = [
    [1.6, 1.3, -0.8], [-2.4, -1.2, 1.1], [0.6, -1.9, -1.4], [2.6, 0.4, -1.6], [-1.6, 1.7, 1.6], [0.2, 1.6, 2.0], [-2.7, 0.2, -1.4], [1.2, -0.4, 2.4],
  ];
  mitoSpots.forEach(([x, y, z], i) => {
    const mito = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.75, 8, 20), mitoMat);
    const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 20), mitoInner);
    ridge.rotation.y = Math.PI / 2;
    const ridge2 = ridge.clone();
    ridge.position.y = 0.2;
    ridge2.position.y = -0.2;
    mito.add(body, ridge, ridge2);
    mito.position.set(x, y, z);
    mito.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    mito.userData.spin = 0.1 + (i % 3) * 0.05;
    tag(mito, mitoInfo);
    group.add(mito);
    pickables.push(mito);
  });

  // Lysosomes and vesicles
  const lysoInfo = info('Лизосома', 'Lysosome', 'Пузырёк с ферментами, которые переваривают старые органеллы и захваченные частицы. Клеточная «переработка мусора».', 'A sac of enzymes that digests worn-out parts and captured particles: the cell’s recycling plant.');
  for (let i = 0; i < 5; i++) {
    const lyso = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), mat(BIO_COLORS.lysosome, { roughness: 0.35 }));
    lyso.position.copy(randomInSphere(rand, 3.0)).add(new THREE.Vector3(0.6, 0, 0));
    tag(lyso, lysoInfo);
    group.add(lyso);
    pickables.push(lyso);
  }
  const vesicles: THREE.Mesh[] = [];
  const vesicleInfo = info('Транспортный пузырёк', 'Transport vesicle', 'Маленькая капсула из мембраны. Перевозит белки от Гольджи к мембране клетки.', 'A tiny membrane bubble carrying proteins from the Golgi to the cell surface.');
  for (let i = 0; i < 9; i++) {
    const ves = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), mat(BIO_COLORS.vesicle, { roughness: 0.3 }));
    ves.position.copy(golgi.position).add(randomInSphere(rand, 1.2));
    ves.userData.phase = rand() * Math.PI * 2;
    ves.userData.base = ves.position.clone();
    tag(ves, vesicleInfo);
    vesicles.push(ves);
    group.add(ves);
    pickables.push(ves);
  }

  // Centrioles
  const centrosome = new THREE.Group();
  centrosome.position.set(0.9, 0.9, 0.4);
  const cMat = mat('#B5B8C0', { roughness: 0.5 });
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 9), cMat);
  const c2 = c1.clone();
  c2.rotation.z = Math.PI / 2;
  c2.position.x = 0.18;
  centrosome.add(c1, c2);
  tag(centrosome, info('Центриоли', 'Centrioles', 'Пара цилиндров из микротрубочек. Во время деления растягивают хромосомы к полюсам клетки.', 'A pair of microtubule cylinders that pull chromosomes apart when the cell divides.'));
  group.add(centrosome);
  pickables.push(centrosome);

  // Free ribosomes in the cytoplasm
  const ribPositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const p = randomInSphere(rand, 3.6);
    ribPositions.set([p.x, p.y, p.z], i * 3);
  }
  const ribGeo = new THREE.BufferGeometry();
  ribGeo.setAttribute('position', new THREE.BufferAttribute(ribPositions, 3));
  group.add(new THREE.Points(ribGeo, new THREE.PointsMaterial({ color: BIO_COLORS.ribosome, size: 0.045, transparent: true, opacity: 0.8 })));

  return {
    group,
    pickables,
    camera: { position: [0, 2.5, 10.5], target: [0, 0, 0] },
    update: (dt, elapsed, state) => {
      if (!state.running) return;
      membrane.scale.setScalar(1 + 0.008 * Math.sin(elapsed * 0.9));
      membraneEdge.scale.setScalar(1.012 + 0.008 * Math.sin(elapsed * 0.9));
      group.children.forEach((c) => {
        if (c.userData.spin) c.rotation.y += c.userData.spin * dt;
      });
      vesicles.forEach((ves) => {
        const ph = ves.userData.phase as number;
        const base = ves.userData.base as THREE.Vector3;
        ves.position.set(base.x + Math.sin(elapsed * 0.6 + ph) * 0.25, base.y + Math.cos(elapsed * 0.5 + ph) * 0.18, base.z + Math.sin(elapsed * 0.4 + ph * 2) * 0.2);
      });
    },
  };
}

/* ───────────────────────── Level 2: mitochondrion ───────────────────────── */

export function buildMitochondrion(): BioModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const rand = rng(11);

  const body = new THREE.Group();
  body.rotation.z = Math.PI / 2;
  group.add(body);

  const outer = tag(
    new THREE.Mesh(new THREE.CapsuleGeometry(1.45, 3.6, 16, 48), glass(BIO_COLORS.mito, 0.22)),
    info('Наружная мембрана', 'Outer membrane', 'Гладкая внешняя оболочка. Пропускает мелкие молекулы через белки-поры, поэтому межмембранное пространство похоже по составу на цитоплазму.', 'The smooth outer wrapper. Pore proteins let small molecules through, so the intermembrane space resembles the cytoplasm.'),
    true,
  );
  const inner = tag(
    new THREE.Mesh(new THREE.CapsuleGeometry(1.28, 3.35, 16, 48), glass('#F08C3A', 0.2)),
    info('Внутренняя мембрана', 'Inner membrane', 'Почти непроницаема для ионов. Именно на ней сидят дыхательная цепь и АТФ-синтазы, а складки (кристы) увеличивают её площадь в разы.', 'Nearly impermeable to ions. It carries the respiratory chain and ATP synthases, and its folds (cristae) multiply its area.'),
    true,
  );
  body.add(outer, inner);
  pickables.push(outer, inner);

  // Cristae: flattened folds reaching in from alternating sides
  const cristaeInfo = info('Криста', 'Crista', 'Складка внутренней мембраны. На её поверхности тысячи дыхательных комплексов и АТФ-синтаз. Нажми «Приблизить», чтобы увидеть мембрану вблизи.', 'A fold of the inner membrane covered in thousands of respiratory complexes and ATP synthases. Tap “Zoom in” to see the membrane up close.', 'membrane');
  const cristaMat = mat(BIO_COLORS.cristae, { roughness: 0.45 });
  const dotMat = mat(BIO_COLORS.synthase, { roughness: 0.35 });
  for (let i = 0; i < 9; i++) {
    const y = -2.0 + i * 0.5;
    const fromTop = i % 2 === 0;
    const crista = new THREE.Group();
    // A thin plate across the long axis, reaching in from one wall
    const fold = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 8, 24), cristaMat);
    fold.scale.set(0.2, 1, 2.0);
    fold.rotation.z = Math.PI / 2;
    crista.add(fold);
    // ATP synthase "lollipops" on both faces of the fold
    for (let k = 0; k < 14; k++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), dotMat);
      dot.position.set(-0.5 + rand() * 1.0, (k % 2 ? 1 : -1) * 0.08, (rand() - 0.5) * 1.1);
      crista.add(dot);
    }
    crista.position.set(fromTop ? 0.6 : -0.6, y, 0);
    crista.rotation.y = (rand() - 0.5) * 0.3;
    tag(crista, cristaeInfo);
    body.add(crista);
    pickables.push(crista);
  }

  // Matrix contents: mtDNA rings, ribosomes, granules
  const dnaInfo = info('ДНК митохондрии', 'Mitochondrial DNA', 'Своя маленькая кольцевая ДНК — след того, что митохондрии когда-то были свободными бактериями.', 'Its own small circular DNA, a trace of the fact that mitochondria were once free-living bacteria.');
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 32), mat(BIO_COLORS.nucleus, { roughness: 0.4 }));
    ring.position.set((rand() - 0.5) * 1.2, -1.5 + i * 1.5, (rand() - 0.5) * 0.8);
    ring.rotation.set(rand() * 3, rand() * 3, 0);
    tag(ring, dnaInfo);
    body.add(ring);
    pickables.push(ring);
  }
  const granules = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) {
    granules.set([(rand() - 0.5) * 2.0, (rand() - 0.5) * 4.6, (rand() - 0.5) * 1.6], i * 3);
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(granules, 3));
  body.add(new THREE.Points(gGeo, new THREE.PointsMaterial({ color: '#F7D78A', size: 0.04, transparent: true, opacity: 0.75 })));

  return {
    group,
    pickables,
    camera: { position: [0, 2.2, 7.5], target: [0, 0, 0] },
    update: (dt, _e, state) => {
      if (state.running) group.rotation.x += dt * 0.12;
    },
  };
}

/* ─────────────── Level 3: inner membrane with the respiratory chain ─────────────── */

const MEMBRANE_HALF = 0.5;

function buildBilayer(width: number, depth: number, spacing: number) {
  const cols = Math.floor(width / spacing);
  const rows = Math.floor(depth / spacing);
  const count = cols * rows * 2;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(spacing * 0.42, 12, 8), mat(BIO_COLORS.lipidHead, { roughness: 0.35 }), count);
  const tails = new THREE.InstancedMesh(new THREE.CylinderGeometry(spacing * 0.08, spacing * 0.08, MEMBRANE_HALF * 0.85, 5), mat(BIO_COLORS.lipidTail, { roughness: 0.7 }), count * 2);
  const base: THREE.Vector3[] = [];
  for (const side of [1, -1]) {
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        base.push(new THREE.Vector3(-width / 2 + (c + 0.5) * spacing + (r % 2) * spacing * 0.5, side * MEMBRANE_HALF, -depth / 2 + (r + 0.5) * spacing));
      }
    }
  }
  return { heads, tails, base, count };
}

function layoutBilayer(b: ReturnType<typeof buildBilayer>, elapsed: number, holes: { x: number; z: number; r: number }[]) {
  const m = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  b.base.forEach((p, i) => {
    const inHole = holes.some((h) => (p.x - h.x) ** 2 + (p.z - h.z) ** 2 < h.r * h.r);
    if (inHole) {
      b.heads.setMatrixAt(i, hidden);
      b.tails.setMatrixAt(i * 2, hidden);
      b.tails.setMatrixAt(i * 2 + 1, hidden);
      return;
    }
    const wave = 0.04 * Math.sin(p.x * 1.4 + elapsed * 1.2) * Math.cos(p.z * 1.1 + elapsed * 0.8);
    const y = p.y + wave;
    m.makeTranslation(p.x, y, p.z);
    b.heads.setMatrixAt(i, m);
    const dir = Math.sign(p.y);
    const tailY = y - dir * MEMBRANE_HALF * 0.45;
    m.makeTranslation(p.x - 0.03, tailY, p.z);
    b.tails.setMatrixAt(i * 2, m);
    m.makeTranslation(p.x + 0.03, tailY, p.z);
    b.tails.setMatrixAt(i * 2 + 1, m);
  });
  b.heads.instanceMatrix.needsUpdate = true;
  b.tails.instanceMatrix.needsUpdate = true;
}

interface Proton {
  mesh: THREE.Mesh;
  mode: 'free' | 'pump' | 'synth';
  t: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  vel: THREE.Vector3;
}

export function buildMembrane(): BioModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const rand = rng(23);

  const bilayer = buildBilayer(9, 5, 0.32);
  tag(bilayer.heads, info('Фосфолипиды', 'Phospholipids', 'Головки любят воду и смотрят наружу, хвосты её боятся и прячутся внутрь. Так сам собой получается двойной слой, который не пропускает протоны.', 'Water-loving heads face out, water-fearing tails hide inside. The bilayer assembles itself and blocks protons.'));
  tag(bilayer.tails, bilayer.heads.userData.info);
  group.add(bilayer.heads, bilayer.tails);
  pickables.push(bilayer.heads, bilayer.tails);

  // Respiratory chain complexes spanning the membrane
  const complexes: { x: number; z: number; r: number }[] = [];
  const addComplex = (object: THREE.Object3D, x: number, z: number, r: number, partInfo: PartInfo) => {
    object.position.x = x;
    object.position.z = z;
    complexes.push({ x, z, r });
    tag(object, partInfo);
    group.add(object);
    pickables.push(object);
    return object;
  };

  const c1 = new THREE.Group();
  const c1Body = new THREE.Mesh(new RoundedBox(1.0, 1.9, 0.8), mat(BIO_COLORS.complexI, { roughness: 0.4 }));
  const c1Arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 6, 16), mat(BIO_COLORS.complexI, { roughness: 0.4 }));
  c1Arm.position.set(-0.3, -1.3, 0);
  c1Arm.rotation.z = 0.5;
  c1.add(c1Body, c1Arm);
  addComplex(c1, -3.2, 0, 0.7, info('Комплекс I', 'Complex I', 'Забирает электроны у NADH и за счёт их энергии перекачивает 4 протона наружу, в межмембранное пространство.', 'Takes electrons from NADH and uses their energy to pump 4 protons out into the intermembrane space.'));

  const c3 = new THREE.Group();
  for (const dz of [-0.32, 0.32]) {
    const half = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), mat(BIO_COLORS.complexIII, { roughness: 0.4 }));
    half.scale.set(1, 2.0, 0.9);
    half.position.z = dz;
    c3.add(half);
  }
  addComplex(c3, -1.2, 0.3, 0.75, info('Комплекс III', 'Complex III', 'Передаёт электроны с убихинона на цитохром c и попутно выталкивает ещё протоны наружу.', 'Passes electrons from ubiquinone to cytochrome c, pushing more protons out along the way.'));

  const c4 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), mat(BIO_COLORS.complexIV, { roughness: 0.4 }));
  c4.scale.set(1, 1.9, 1);
  addComplex(c4, 0.8, -0.2, 0.6, info('Комплекс IV', 'Complex IV', 'Последнее звено: отдаёт электроны кислороду, и получается вода. Без кислорода вся цепь встаёт — поэтому мы дышим.', 'The last link: it hands electrons to oxygen, making water. Without oxygen the whole chain stops, which is why we breathe.'));

  const cytC = tag(new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), mat(BIO_COLORS.cytC, { roughness: 0.3 })), info('Цитохром c', 'Cytochrome c', 'Маленький белок-челнок. Переносит электроны от комплекса III к комплексу IV по наружной стороне мембраны.', 'A small shuttle protein carrying electrons from complex III to complex IV along the outer face.'));
  group.add(cytC);
  pickables.push(cytC);

  const ubiquinone = tag(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mat('#F7D78A', { roughness: 0.3 })), info('Убихинон (Q)', 'Ubiquinone (Q)', 'Жирорастворимый переносчик электронов. Плавает внутри мембраны от комплекса I к комплексу III.', 'A fat-soluble electron carrier that floats inside the membrane from complex I to complex III.'));
  group.add(ubiquinone);
  pickables.push(ubiquinone);

  // ATP synthase embedded on the right
  const synthase = new THREE.Group();
  const fo = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 20), mat(BIO_COLORS.synthase, { roughness: 0.4 }));
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12), mat(BIO_COLORS.gamma));
  stalk.position.y = -0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 28, 20), mat(BIO_COLORS.synthase, { roughness: 0.4 }));
  head.scale.set(1, 0.85, 1);
  head.position.y = -1.85;
  synthase.add(fo, stalk, head);
  addComplex(synthase, 3.0, 0, 0.6, info('АТФ-синтаза', 'ATP synthase', 'Молекулярная турбина. Протоны текут обратно через неё, вращают ротор, и энергия вращения собирает АТФ. Нажми «Приблизить».', 'A molecular turbine. Protons flow back through it, spin its rotor, and the spin builds ATP. Tap “Zoom in”.', 'atp_rotor'));

  // Protons: crowded above (intermembrane space), sparse below (matrix)
  const protonGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const protonMat = mat(BIO_COLORS.proton, { roughness: 0.3, emissive: '#5a1010' });
  const protons: Proton[] = [];
  const protonInfo = info('Протон H⁺', 'Proton H⁺', 'Ядро атома водорода. Снаружи их намного больше, чем внутри, — это и есть градиент, который крутит АТФ-синтазу.', 'A hydrogen nucleus. There are far more outside than inside, and that difference is the gradient that drives ATP synthase.');
  for (let i = 0; i < 70; i++) {
    const mesh = new THREE.Mesh(protonGeo, protonMat);
    const above = i < 56;
    mesh.position.set((rand() - 0.5) * 8.5, above ? 0.9 + rand() * 1.6 : -0.9 - rand() * 1.6, (rand() - 0.5) * 4.5);
    tag(mesh, protonInfo);
    group.add(mesh);
    pickables.push(mesh);
    protons.push({ mesh, mode: 'free', t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), vel: new THREE.Vector3((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3) });
  }

  const pumps = [c1, c3, c4];
  let pumpTimer = 0;
  let synthTimer = 0;

  const launch = (p: Proton, mode: 'pump' | 'synth', through: THREE.Object3D) => {
    p.mode = mode;
    p.t = 0;
    p.from.copy(p.mesh.position);
    const x = through.position.x;
    const z = through.position.z;
    p.to.set(x + (rand() - 0.5) * 0.3, mode === 'pump' ? 1.1 + rand() * 0.8 : -1.2 - rand() * 0.8, z + (rand() - 0.5) * 0.3);
    p.vel.set(x, 0, z); // pass-through point
  };

  return {
    group,
    pickables,
    camera: { position: [0.5, 3.6, 8.2], target: [0, -0.2, 0] },
    update: (dt, elapsed, state) => {
      layoutBilayer(bilayer, state.running ? elapsed : 0, complexes);
      if (!state.running) return;

      // Electron carriers shuttle between complexes
      const s = (Math.sin(elapsed * 0.9) + 1) / 2;
      cytC.position.set(THREE.MathUtils.lerp(-1.2, 0.8, s), 1.15 + 0.05 * Math.sin(elapsed * 3), THREE.MathUtils.lerp(0.3, -0.2, s) + 0.6);
      const q = (Math.sin(elapsed * 0.7 + 1) + 1) / 2;
      ubiquinone.position.set(THREE.MathUtils.lerp(-3.2, -1.2, q), 0, THREE.MathUtils.lerp(0, 0.3, q));

      // Pumps work at a steady pace; synthase flow depends on the gradient
      pumpTimer += dt;
      // Pumps outrun the synthase, so protons pile up above: that pile-up is the gradient
      synthTimer += dt * state.gradient * 1.6;
      if (pumpTimer > 0.45) {
        pumpTimer = 0;
        const p = protons.find((pr) => pr.mode === 'free' && pr.mesh.position.y < -0.6);
        if (p) launch(p, 'pump', pumps[Math.floor(rand() * pumps.length)]);
      }
      if (synthTimer > 1) {
        synthTimer = 0;
        const p = protons.find((pr) => pr.mode === 'free' && pr.mesh.position.y > 0.6);
        if (p) launch(p, 'synth', synthase);
      }

      protons.forEach((p) => {
        if (p.mode === 'free') {
          p.mesh.position.addScaledVector(p.vel, dt);
          const pos = p.mesh.position;
          if (Math.abs(pos.x) > 4.3) p.vel.x *= -1;
          if (Math.abs(pos.z) > 2.3) p.vel.z *= -1;
          pos.y += Math.sin(elapsed * 2 + pos.x) * 0.002;
          return;
        }
        p.t = Math.min(1, p.t + dt * 0.8);
        const t = p.t;
        // Two-segment path: approach the channel, then cross to the other side
        const mid = p.vel;
        if (t < 0.5) p.mesh.position.lerpVectors(p.from, mid, t * 2);
        else p.mesh.position.lerpVectors(mid, p.to, (t - 0.5) * 2);
        if (t >= 1) {
          p.mode = 'free';
          p.vel.set((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3);
        }
      });
    },
  };
}

/* ───────────────────────── Level 4: ATP synthase ───────────────────────── */

export function buildAtpSynthase(onAtp: () => void): BioModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const rand = rng(41);
  const MEMBRANE_Y = 1.6;

  // Membrane disc around the motor
  const bilayer = buildBilayer(5.2, 5.2, 0.3);
  bilayer.heads.position.y = MEMBRANE_Y;
  bilayer.tails.position.y = MEMBRANE_Y;
  tag(bilayer.heads, info('Внутренняя мембрана', 'Inner membrane', 'Двойной слой липидов. Протоны не могут пройти сквозь него — только через канал АТФ-синтазы.', 'A lipid bilayer protons cannot cross, except through the ATP synthase channel.'));
  tag(bilayer.tails, bilayer.heads.userData.info);
  group.add(bilayer.heads, bilayer.tails);
  pickables.push(bilayer.heads, bilayer.tails);

  // Rotor: c-ring in the membrane + asymmetric γ shaft
  const rotor = new THREE.Group();
  rotor.position.y = MEMBRANE_Y;
  const cRing = new THREE.Group();
  const cMat = mat(BIO_COLORS.cRing, { roughness: 0.35 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const sub = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.15, 6, 14), cMat);
    sub.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62);
    cRing.add(sub);
  }
  tag(cRing, info('Кольцо c (ротор Fo)', 'c-ring (Fo rotor)', '10 одинаковых белков по кругу. Каждый подхватывает протон с одной стороны мембраны и после почти полного оборота отпускает с другой.', 'Ten identical proteins in a ring. Each picks up a proton on one side and releases it on the other after almost a full turn.'));
  const gamma = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.4, 16), mat(BIO_COLORS.gamma, { roughness: 0.4 }));
  shaft.position.y = -1.35;
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), mat(BIO_COLORS.gamma, { roughness: 0.4 }));
  cam.position.set(0.18, -2.1, 0);
  const epsilon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat('#9C86F2', { roughness: 0.4 }));
  epsilon.position.set(-0.2, -0.55, 0);
  gamma.add(shaft, cam, epsilon);
  tag(gamma, info('Ось γ', 'γ shaft', 'Изогнутый вал внутри головки. Вращаясь, он по очереди сдавливает три β-субъединицы, и каждая при этом собирает АТФ.', 'A bent shaft inside the head. As it turns it squeezes the three β subunits in turn, and each squeeze builds an ATP.'));
  rotor.add(cRing, gamma);
  group.add(rotor);
  pickables.push(cRing, gamma);

  // Stator: a-subunit channel + peripheral stalk + δ cap
  const stator = new THREE.Group();
  const aSub = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.8), mat('#3E8E99', { roughness: 0.45 }));
  aSub.position.set(1.15, MEMBRANE_Y, 0);
  const bStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 10), mat(BIO_COLORS.stator, { roughness: 0.5 }));
  bStalk.position.set(1.3, -0.35, 0);
  bStalk.rotation.z = 0.08;
  const delta = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat(BIO_COLORS.stator, { roughness: 0.5 }));
  delta.position.set(0.3, -2.75, 0);
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), mat(BIO_COLORS.stator, { roughness: 0.5 }));
  bridge.position.set(0.8, -2.45, 0);
  bridge.rotation.z = Math.PI / 2.6;
  stator.add(aSub, bStalk, delta, bridge);
  tag(stator, info('Статор (a, b, δ)', 'Stator (a, b, δ)', 'Неподвижная часть. Субъединица a образует полуканалы для протонов, а «стебель» b держит головку, чтобы она не крутилась вместе с ротором.', 'The fixed part. Subunit a forms the proton half-channels, and the b stalk holds the head so it doesn’t spin with the rotor.'));
  group.add(stator);
  pickables.push(stator);

  // F1 head: alternating α and β around γ
  const head = new THREE.Group();
  head.position.y = -1.65;
  const betas: THREE.Mesh[] = [];
  const alphaInfo = info('Субъединица α', 'α subunit', 'Три α-субъединицы чередуются с β и держат конструкцию головки. Сами АТФ не собирают.', 'Three α subunits alternate with the β ones and hold the head together. They don’t make ATP themselves.');
  const betaInfo = info('Субъединица β', 'β subunit', 'Здесь собирается АТФ из АДФ и фосфата. У каждой β три состояния: открыта, захватила, собрала — их меняет поворот оси γ.', 'This is where ATP is built from ADP and phosphate. Each β cycles through open, loose and tight states as γ turns.');
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const isBeta = i % 2 === 1;
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 20), mat(isBeta ? BIO_COLORS.beta : BIO_COLORS.alpha, { roughness: 0.4 }));
    lobe.scale.set(0.95, 1.5, 0.95);
    lobe.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62);
    // Lean the lobes toward the central shaft
    lobe.quaternion.setFromAxisAngle(new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), 0.22);
    lobe.userData.angle = a;
    tag(lobe, isBeta ? betaInfo : alphaInfo);
    head.add(lobe);
    pickables.push(lobe);
    if (isBeta) betas.push(lobe);
  }
  group.add(head);

  // Protons and released ATP
  const protonGeo = new THREE.SphereGeometry(0.09, 12, 10);
  const protonMat = mat(BIO_COLORS.proton, { roughness: 0.3, emissive: '#5a1010' });
  type P = { mesh: THREE.Mesh; mode: 'in' | 'ride' | 'out'; t: number; angle: number; start: THREE.Vector3 };
  const protons: P[] = [];
  const protonInfo = info('Протон H⁺', 'Proton H⁺', 'Протон входит через полуканал субъединицы a, садится на кольцо c, делает с ним почти полный оборот и выходит в матрикс.', 'A proton enters through subunit a’s half-channel, rides the c-ring almost a full turn, and exits into the matrix.');
  const spawnProton = () => {
    const mesh = new THREE.Mesh(protonGeo, protonMat);
    mesh.position.set(1.15 + (rand() - 0.5) * 2, MEMBRANE_Y + 1.6 + rand() * 0.8, (rand() - 0.5) * 2);
    tag(mesh, protonInfo);
    group.add(mesh);
    pickables.push(mesh);
    protons.push({ mesh, mode: 'in', t: 0, angle: 0, start: mesh.position.clone() });
  };

  const atpGeo = new THREE.SphereGeometry(0.11, 12, 10);
  const phosGeo = new THREE.SphereGeometry(0.06, 8, 6);
  const atpMat = mat(BIO_COLORS.atp, { roughness: 0.3, emissive: '#3a2a00' });
  const phosMat = mat('#F7A440', { roughness: 0.3 });
  const atpInfo = info('Молекула АТФ', 'ATP molecule', 'Аденозинтрифосфат — «батарейка» клетки. Энергия хранится в связи с третьим фосфатом. За один оборот ротора собираются 3 молекулы.', 'Adenosine triphosphate, the cell’s battery. Energy sits in the bond to the third phosphate. One rotor turn makes 3 of them.');
  const atps: { obj: THREE.Group; vel: THREE.Vector3; life: number }[] = [];
  const releaseAtp = (beta: THREE.Mesh) => {
    const obj = new THREE.Group();
    obj.add(new THREE.Mesh(atpGeo, atpMat));
    for (let k = 1; k <= 3; k++) {
      const ph = new THREE.Mesh(phosGeo, phosMat);
      ph.position.set(0.12 * k, 0.04 * Math.sin(k), 0);
      obj.add(ph);
    }
    const world = new THREE.Vector3();
    beta.getWorldPosition(world);
    obj.position.copy(world);
    tag(obj, atpInfo);
    group.add(obj);
    pickables.push(obj);
    const out = world.clone().setY(0).normalize();
    atps.push({ obj, vel: new THREE.Vector3(out.x * 0.7, -0.35, out.z * 0.7), life: 0 });
  };

  let lastThird = 0;
  let spawnTimer = 0;
  const ENTRY_ANGLE = 0; // c-ring slot facing the a-subunit (+x)

  const removeFromPickables = (o: THREE.Object3D) => {
    const idx = pickables.indexOf(o);
    if (idx >= 0) pickables.splice(idx, 1);
  };

  return {
    group,
    pickables,
    camera: { position: [4.9, 2.4, 6.3], target: [0, -0.3, 0] },
    update: (dt, elapsed, state) => {
      layoutBilayer(bilayer, state.running ? elapsed : 0, [{ x: 0, z: 0, r: 0.95 }, { x: 1.15, z: 0, r: 0.55 }]);
      if (!state.running) return;

      const omega = state.gradient * 1.8; // rad/s, slowed ~1000x for visibility
      rotor.rotation.y += omega * dt;

      // β subunits light up as γ's cam sweeps past them
      const camAngle = -rotor.rotation.y;
      betas.forEach((b) => {
        const d = Math.abs(Math.atan2(Math.sin(b.userData.angle - camAngle), Math.cos(b.userData.angle - camAngle)));
        const glow = Math.max(0, 1 - d / 0.9);
        (b.material as THREE.MeshStandardMaterial).emissive.setRGB(0.05 * glow, 0.12 * glow, 0.45 * glow);
      });

      // Every 120° one β releases an ATP
      const third = Math.floor(rotor.rotation.y / ((Math.PI * 2) / 3));
      if (third > lastThird) {
        lastThird = third;
        releaseAtp(betas[third % 3]);
        onAtp();
      }

      spawnTimer += dt * state.gradient * 2.4;
      if (spawnTimer > 1 && protons.length < 24) {
        spawnTimer = 0;
        spawnProton();
      }

      for (let i = protons.length - 1; i >= 0; i--) {
        const p = protons[i];
        if (p.mode === 'in') {
          p.t = Math.min(1, p.t + dt * 0.9);
          const entry = new THREE.Vector3(0.62 * Math.cos(ENTRY_ANGLE), MEMBRANE_Y + 0.2, 0.62 * Math.sin(ENTRY_ANGLE));
          p.mesh.position.lerpVectors(p.start, entry, p.t * p.t * (3 - 2 * p.t));
          if (p.t >= 1) {
            p.mode = 'ride';
            p.angle = ENTRY_ANGLE + rotor.rotation.y;
            p.t = 0;
          }
        } else if (p.mode === 'ride') {
          const a = p.angle - rotor.rotation.y;
          p.mesh.position.set(0.8 * Math.cos(a), MEMBRANE_Y + 0.2 - 0.4 * Math.min(1, (rotor.rotation.y - p.angle + ENTRY_ANGLE) / 5), 0.8 * Math.sin(a));
          if (rotor.rotation.y - p.angle + ENTRY_ANGLE > 5.2) {
            p.mode = 'out';
            p.start.copy(p.mesh.position);
            p.t = 0;
          }
        } else {
          p.t += dt * 0.6;
          p.mesh.position.set(p.start.x * (1 + p.t), p.start.y - p.t * 1.8, p.start.z * (1 + p.t));
          (p.mesh.scale as THREE.Vector3).setScalar(Math.max(0.01, 1 - p.t));
          if (p.t >= 1) {
            group.remove(p.mesh);
            removeFromPickables(p.mesh);
            protons.splice(i, 1);
          }
        }
      }

      for (let i = atps.length - 1; i >= 0; i--) {
        const a = atps[i];
        a.life += dt;
        a.obj.position.addScaledVector(a.vel, dt);
        a.obj.rotation.y += dt * 1.5;
        a.obj.scale.setScalar(a.life > 3 ? Math.max(0.01, 1 - (a.life - 3)) : Math.min(1, a.life * 3));
        if (a.life > 4) {
          group.remove(a.obj);
          removeFromPickables(a.obj);
          atps.splice(i, 1);
        }
      }
      void elapsed;
    },
  };
}
