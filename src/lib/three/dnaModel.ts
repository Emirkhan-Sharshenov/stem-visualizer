import * as THREE from 'three';
import type { PartInfo } from './ThreeStage';

export type Base = 'A' | 'T' | 'G' | 'C';
export const PAIR: Record<Base, Base> = { A: 'T', T: 'A', G: 'C', C: 'G' };
export const BASE_COLOR: Record<Base, string> = { A: '#E5484D', T: '#F5A524', G: '#30A46C', C: '#5B7CFF' };
export const OLD_STRAND = '#C9CCD3';
export const NEW_STRAND = '#4FB3BF';

const BASE_INFO: Record<Base, PartInfo> = {
  A: { title: { ru: 'Аденин (A)', en: 'Adenine (A)' }, text: { ru: 'Пурин — крупное основание из двух колец. Всегда стоит напротив тимина и держится за него двумя водородными связями.', en: 'A purine, a large two-ring base. Always sits opposite thymine, held by two hydrogen bonds.' } },
  T: { title: { ru: 'Тимин (T)', en: 'Thymine (T)' }, text: { ru: 'Пиримидин — маленькое основание из одного кольца. Пара для аденина: A = T, две водородные связи.', en: 'A pyrimidine, a small one-ring base. Partners adenine: A = T with two hydrogen bonds.' } },
  G: { title: { ru: 'Гуанин (G)', en: 'Guanine (G)' }, text: { ru: 'Пурин. Пара для цитозина, и связь у них прочнее: G ≡ C держатся тремя водородными связями.', en: 'A purine. Partners cytosine, and more tightly: G ≡ C share three hydrogen bonds.' } },
  C: { title: { ru: 'Цитозин (C)', en: 'Cytosine (C)' }, text: { ru: 'Пиримидин. Всегда напротив гуанина. Чем больше пар G–C, тем труднее расплести ДНК при нагревании.', en: 'A pyrimidine, always opposite guanine. The more G–C pairs, the harder DNA is to melt apart.' } },
};
const SUGAR_INFO: PartInfo = { title: { ru: 'Дезоксирибоза', en: 'Deoxyribose' }, text: { ru: 'Сахар-пятиуглерод. Вместе с фосфатом образует «перила» лестницы. К сахару прикреплено основание.', en: 'A five-carbon sugar. With phosphate it forms the ladder’s rails, and the base hangs off it.' } };
const PHOS_INFO: PartInfo = { title: { ru: 'Фосфатная группа', en: 'Phosphate group' }, text: { ru: 'Соединяет сахара соседних нуклеотидов прочной ковалентной связью. Из-за фосфатов ДНК заряжена отрицательно.', en: 'Links neighbouring sugars with strong covalent bonds. Phosphates give DNA its negative charge.' } };
const HBOND_INFO: PartInfo = { title: { ru: 'Водородные связи', en: 'Hydrogen bonds' }, text: { ru: 'Слабые связи между основаниями. По отдельности хрупкие, вместе держат цепи — и легко расстёгиваются, как молния, когда нужно скопировать ген.', en: 'Weak bonds between bases. Fragile one by one, strong together, and easy to unzip when a gene must be copied.' } };
export const HELICASE_INFO: PartInfo = { title: { ru: 'Хеликаза', en: 'Helicase' }, text: { ru: 'Фермент-кольцо, который едет по ДНК и разрывает водородные связи, разводя цепи в «вилку репликации».', en: 'A ring enzyme that rides along DNA breaking hydrogen bonds and opening the replication fork.' } };
export const POLYMERASE_INFO: PartInfo = { title: { ru: 'ДНК-полимераза', en: 'DNA polymerase' }, text: { ru: 'Строит новую цепь по старой, подбирая к каждому основанию его пару. Умеет двигаться только в направлении 5′→3′, поэтому одна из новых цепей строится кусками.', en: 'Builds a new strand on the old one, matching each base to its partner. It only moves 5′→3′, so one new strand is made in pieces.' } };
const OKAZAKI_INFO: PartInfo = { title: { ru: 'Отстающая цепь', en: 'Lagging strand' }, text: { ru: 'Строится короткими фрагментами Оказаки, потому что полимераза может идти только 5′→3′, а вилка движется в обратную сторону.', en: 'Built in short Okazaki fragments, because polymerase only moves 5′→3′ while the fork moves the other way.' } };

const N = 24;
const RISE = 0.42;
const TWIST = (Math.PI * 2) / 10;
const R = 1.0;
const X0 = -((N - 1) * RISE) / 2;
const UP = new THREE.Vector3(0, 1, 0);

interface Nucleotide {
  sugar: THREE.Mesh;
  phos: THREE.Mesh;
  base: THREE.Mesh;
  link1: THREE.Mesh; // sugar → own phosphate
  link2: THREE.Mesh; // phosphate → next sugar
  bonds: THREE.Mesh[];
}

export interface DnaState {
  mode: 'helix' | 'replication';
  running: boolean;
  speed: number;
  showBonds: boolean;
  /** replication driven by a timeline: seconds since the fork started (overrides the internal clock) */
  forkTime?: number;
}

/** Fork speed (units/s) and the time it takes to copy the whole molecule */
export const FORK_SPEED = 0.9;
export const REPLICATION_TIME = (N * RISE + 5) / FORK_SPEED;

export interface DnaModel {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  sequence: Base[];
  update: (dt: number, state: DnaState) => void;
  reset: () => void;
}

function place(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, baseLength = 1) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  if (len > 1e-6) mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.scale.set(1, len / baseLength, 1);
}

function textSprite(text: string, color = '#B5B8C0') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.font = '500 40px Inter, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(0.6, 0.3, 1);
  return sprite;
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

export function buildDna(): DnaModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const sequence: Base[] = 'ATGCGTACCTAGGCATTCGAGCTA'.split('') as Base[];

  const sugarGeo = new THREE.DodecahedronGeometry(0.13, 0);
  const phosGeo = new THREE.SphereGeometry(0.1, 14, 10);
  const linkGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);
  const baseGeo = new THREE.CylinderGeometry(0.11, 0.11, 1, 14);
  const bondGeo = new THREE.SphereGeometry(0.035, 8, 6);
  const phosMat = new THREE.MeshStandardMaterial({ color: '#F07AA0', roughness: 0.4 });
  const bondMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#555555', roughness: 0.3 });
  const baseMats = Object.fromEntries((Object.keys(BASE_COLOR) as Base[]).map((b) => [b, new THREE.MeshStandardMaterial({ color: BASE_COLOR[b], roughness: 0.45 })])) as Record<Base, THREE.MeshStandardMaterial>;

  const makeStrand = (bases: Base[], color: string): Nucleotide[] => {
    const sugarMat = new THREE.MeshStandardMaterial({ color, roughness: 0.45 });
    const linkMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    return bases.map((b) => {
      const n: Nucleotide = {
        sugar: new THREE.Mesh(sugarGeo, sugarMat),
        phos: new THREE.Mesh(phosGeo, phosMat),
        base: new THREE.Mesh(baseGeo, baseMats[b]),
        link1: new THREE.Mesh(linkGeo, linkMat),
        link2: new THREE.Mesh(linkGeo, linkMat),
        bonds: Array.from({ length: b === 'G' || b === 'C' ? 3 : 2 }, () => new THREE.Mesh(bondGeo, bondMat)),
      };
      n.sugar.userData.info = SUGAR_INFO;
      n.phos.userData.info = PHOS_INFO;
      n.link1.userData.info = PHOS_INFO;
      n.link2.userData.info = PHOS_INFO;
      n.base.userData.info = BASE_INFO[b];
      n.bonds.forEach((m) => (m.userData.info = HBOND_INFO));
      group.add(n.sugar, n.phos, n.base, n.link1, n.link2, ...n.bonds);
      pickables.push(n.sugar, n.phos, n.base, n.link1, n.link2);
      return n;
    });
  };

  const complement = sequence.map((b) => PAIR[b]);
  const old = [makeStrand(sequence, OLD_STRAND), makeStrand(complement, OLD_STRAND)];
  const fresh = [makeStrand(complement, NEW_STRAND), makeStrand(sequence, NEW_STRAND)];
  fresh[1].forEach((n) => [n.sugar, n.base, n.link1, n.link2].forEach((m) => (m.userData.info = m === n.base ? n.base.userData.info : OKAZAKI_INFO)));

  // Enzymes
  const helicase = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.2, 16, 40), new THREE.MeshStandardMaterial({ color: '#F07AA0', roughness: 0.35, transparent: true, opacity: 0.9 }));
  helicase.rotation.y = Math.PI / 2;
  helicase.userData.info = HELICASE_INFO;
  const polyMat = new THREE.MeshStandardMaterial({ color: '#30A46C', roughness: 0.4, transparent: true, opacity: 0.85 });
  const polymerases = [0, 1].map(() => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), polyMat);
    p.scale.set(1.2, 0.9, 0.9);
    p.userData.info = POLYMERASE_INFO;
    return p;
  });
  group.add(helicase, ...polymerases);
  pickables.push(helicase, ...polymerases);

  // End labels
  const labels = [textSprite('5′'), textSprite('3′'), textSprite('3′'), textSprite('5′')];
  group.add(...labels);

  let spin = 0;
  let forkX = X0 - 1.5;
  let hold = 0;

  const v = {
    s: new THREE.Vector3(), p: new THREE.Vector3(), b0: new THREE.Vector3(), b1: new THREE.Vector3(), nextS: new THREE.Vector3(),
    hs: new THREE.Vector3(), hp: new THREE.Vector3(), hb0: new THREE.Vector3(), hb1: new THREE.Vector3(),
  };

  // Geometry of one nucleotide: on the double helix, or flattened into a daughter ladder
  const helixAt = (i: number, strand: number, out: { s: THREE.Vector3; p: THREE.Vector3; b0: THREE.Vector3; b1: THREE.Vector3 }) => {
    const x = X0 + i * RISE;
    const phi = i * TWIST + spin + strand * Math.PI;
    const phi2 = phi + TWIST / 2;
    out.s.set(x, R * Math.cos(phi), R * Math.sin(phi));
    out.p.set(x + RISE / 2, 1.12 * Math.cos(phi2), 1.12 * Math.sin(phi2));
    out.b0.set(x, 0.86 * Math.cos(phi), 0.86 * Math.sin(phi));
    out.b1.set(x, 0.06 * Math.cos(phi), 0.06 * Math.sin(phi));
  };
  const ladderAt = (i: number, strand: number, isNew: boolean, out: { s: THREE.Vector3; p: THREE.Vector3; b0: THREE.Vector3; b1: THREE.Vector3 }) => {
    const x = X0 + i * RISE;
    const sign = strand === 0 ? 1 : -1; // daughter above or below
    const y = isNew ? sign * 0.75 : sign * 2.55;
    const toward = isNew ? sign : -sign; // bases point into the daughter duplex
    out.s.set(x, y, 0);
    out.p.set(x + RISE / 2, y - toward * 0.12, 0);
    out.b0.set(x, y + toward * 0.12, 0);
    out.b1.set(x, sign * 1.65, 0);
  };

  const pose = (n: Nucleotide, s: THREE.Vector3, p: THREE.Vector3, b0: THREE.Vector3, b1: THREE.Vector3, next: THREE.Vector3 | null, scale: number) => {
    n.sugar.position.copy(s);
    n.phos.position.copy(p);
    place(n.base, b0, b1);
    place(n.link1, s, p);
    if (next) place(n.link2, p, next);
    n.link2.visible = !!next && scale > 0.01;
    [n.sugar, n.phos].forEach((m) => m.scale.setScalar(Math.max(0.001, scale)));
    n.base.scale.x = n.base.scale.z = Math.max(0.001, scale);
    n.link1.scale.x = n.link1.scale.z = Math.max(0.001, scale);
    n.link2.scale.x = n.link2.scale.z = Math.max(0.001, scale);
    [n.sugar, n.phos, n.base, n.link1].forEach((m) => (m.visible = scale > 0.01));
  };

  const update = (dt: number, state: DnaState) => {
    const replicating = state.mode === 'replication';
    if (state.running && state.forkTime === undefined) {
      if (!replicating) spin += dt * 0.6 * state.speed;
      else if (hold > 0) {
        hold -= dt;
        if (hold <= 0) forkX = X0 - 1.5;
      } else {
        forkX += dt * 0.9 * state.speed;
        if (forkX > X0 + N * RISE + 3.5) hold = 1.6;
      }
    }
    if (!replicating) forkX = X0 - 1.5;
    else if (state.forkTime !== undefined) forkX = X0 - 1.5 + Math.min(state.forkTime, REPLICATION_TIME) * FORK_SPEED;
    if (replicating) spin += (0 - spin) * Math.min(1, dt * 3); // settle the twist before unzipping

    for (let strand = 0; strand < 2; strand++) {
      for (let i = 0; i < N; i++) {
        const x = X0 + i * RISE;
        const u = replicating ? smooth((forkX - x) / 1.4) : 0;

        // Old (template) strand: helix → spread apart
        helixAt(i, strand, { s: v.hs, p: v.hp, b0: v.hb0, b1: v.hb1 });
        ladderAt(i, strand, false, v);
        v.s.lerpVectors(v.hs, v.s, u);
        v.p.lerpVectors(v.hp, v.p, u);
        v.b0.lerpVectors(v.hb0, v.b0, u);
        v.b1.lerpVectors(v.hb1, v.b1, u);
        let next: THREE.Vector3 | null = null;
        if (i < N - 1) {
          const un = replicating ? smooth((forkX - (x + RISE)) / 1.4) : 0;
          const tmp = { s: new THREE.Vector3(), p: new THREE.Vector3(), b0: new THREE.Vector3(), b1: new THREE.Vector3() };
          const tmp2 = { s: new THREE.Vector3(), p: new THREE.Vector3(), b0: new THREE.Vector3(), b1: new THREE.Vector3() };
          helixAt(i + 1, strand, tmp);
          ladderAt(i + 1, strand, false, tmp2);
          next = v.nextS.lerpVectors(tmp.s, tmp2.s, un);
        }
        const n = old[strand][i];
        pose(n, v.s, v.p, v.b0, v.b1, next, 1);

        // Hydrogen bonds between the original partners fade as they're unzipped
        const zipped = 1 - u;
        n.bonds.forEach((bond, k) => {
          if (strand === 1) {
            bond.visible = false;
            return;
          }
          const f = (k + 1) / (n.bonds.length + 1);
          helixAt(i, 0, { s: v.hs, p: v.hp, b0: v.hb0, b1: v.hb1 });
          bond.position.set(x - 0.11 + f * 0.22, 0, 0).add(new THREE.Vector3(0, v.hb1.y, v.hb1.z));
          bond.visible = state.showBonds && zipped > 0.6;
        });

        // New strand: polymerase adds matching nucleotides behind the fork
        let grow: number;
        if (strand === 0) {
          grow = replicating ? smooth((forkX - 1.3 - x) / 0.5) : 0; // leading: continuous
        } else {
          const chunkEnd = X0 + (Math.floor(i / 6) * 6 + 5) * RISE; // lagging: Okazaki fragments
          // Each fragment is built backwards, away from the fork (5′→3′ on this template)
          grow = replicating ? smooth((forkX - 1.6 - chunkEnd - (chunkEnd - x) * 0.5) / 0.5) : 0;
        }
        const f = fresh[strand][i];
        ladderAt(i, strand, true, v);
        const drift = (1 - grow) * 1.4;
        v.s.z += drift;
        v.p.z += drift;
        v.b0.z += drift;
        v.b1.z += drift;
        let nextNew: THREE.Vector3 | null = null;
        if (i < N - 1) {
          const tmp = { s: new THREE.Vector3(), p: new THREE.Vector3(), b0: new THREE.Vector3(), b1: new THREE.Vector3() };
          ladderAt(i + 1, strand, true, tmp);
          nextNew = v.nextS.copy(tmp.s);
          // Gaps between Okazaki fragments until they're joined
          if (strand === 1 && (i + 1) % 6 === 0 && grow < 0.999) nextNew = null;
        }
        pose(f, v.s, v.p, v.b0, v.b1, nextNew, grow);
        f.bonds.forEach((bond, k) => {
          const fk = (k + 1) / (f.bonds.length + 1);
          bond.position.set(x - 0.11 + fk * 0.22, (strand === 0 ? 1 : -1) * 1.65, 0);
          bond.visible = state.showBonds && grow > 0.95;
        });
      }
    }

    // Enzymes ride the fork
    const active = replicating && forkX > X0 - 1 && forkX < X0 + N * RISE + 1;
    helicase.visible = active;
    helicase.position.set(forkX, 0, 0);
    helicase.rotation.x += dt * 4 * (state.running ? 1 : 0);
    polymerases[0].visible = active;
    polymerases[0].position.set(forkX - 1.3, 1.65, 0.1);
    // Lagging-strand polymerase works on the newest fragment, moving away from the fork
    const chunk = Math.floor((forkX - 1.6 - X0 - 5 * RISE) / (6 * RISE));
    const chunkEnd = X0 + (chunk * 6 + 5) * RISE;
    const front = Math.max(chunkEnd - 5 * RISE, chunkEnd - 2 * (forkX - 1.6 - chunkEnd));
    polymerases[1].visible = active && chunk >= 0 && chunk * 6 < N;
    polymerases[1].position.set(front, -1.65, 0.1);

    // 5′/3′ end labels follow the strand ends
    const ends: [number, number, number][] = [[0, 0, -1], [N - 1, 0, 1], [0, 1, -1], [N - 1, 1, 1]];
    ends.forEach(([i, strand, side], k) => {
      const n = old[strand][i];
      labels[k].position.copy(n.sugar.position).add(new THREE.Vector3(side * 0.45, 0, 0));
    });
  };

  return {
    group,
    pickables,
    sequence,
    update,
    reset: () => {
      forkX = X0 - 1.5;
      hold = 0;
    },
  };
}
