import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, ArrowRight, ArrowLeft, RefreshCw, Zap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface DeconstructionExplorerProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
  onSelectConceptForMentor: (topic: string, state: any) => void;
}

export type DeconstructMolecule = 'H2O' | 'CH4' | 'CO2';

interface StepInfo {
  step: number;
  badge: { en: string; ru: string };
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  insight: { en: string; ru: string };
}

export const DeconstructionExplorer: React.FC<DeconstructionExplorerProps> = ({
  lang,
  onUnlockMilestone,
  onSelectConceptForMentor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [molecule, setMolecule] = useState<DeconstructMolecule>('H2O');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [forcedAngle, setForcedAngle] = useState<number>(104.5); // For testing repulsion
  const [isRepelling, setIsRepelling] = useState<boolean>(false);
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showDipole, setShowDipole] = useState<boolean>(true);

  const stepsData: Record<DeconstructMolecule, StepInfo[]> = {
    H2O: [
      {
        step: 1,
        badge: { en: 'Intact Molecule', ru: 'Целая молекула' },
        title: { en: 'Water Molecule: H₂O', ru: 'Молекула воды: H₂O' },
        description: {
          en: 'You see two hydrogen atoms bonded to one oxygen atom at a 104.5° angle. But why isn’t it a straight line?',
          ru: 'Два атома водорода соединены с кислородом под углом 104.5°. Но почему молекула не вытянута в прямую линию?'
        },
        insight: {
          en: 'Click "Next Step" to deconstruct into isolated components.',
          ru: 'Нажми «Далее», чтобы разобрать молекулу на составляющие элементы.'
        }
      },
      {
        step: 2,
        badge: { en: 'Atoms', ru: 'Разбор на атомы' },
        title: { en: 'Free Atoms: O + H + H', ru: 'Свободные атомы: O + H + H' },
        description: {
          en: 'Bonds break. We have one isolated Oxygen atom (Z=8) and two isolated Hydrogen atoms (Z=1).',
          ru: 'Связи разорваны. Перед нами отдельный атом кислорода (Z=8) и два отдельных атома водорода (Z=1).'
        },
        insight: {
          en: 'Oxygen has 8 protons and 8 electrons; Hydrogen has 1 proton and 1 electron.',
          ru: 'У кислорода 8 электронов, а у каждого водорода — всего по 1 электрону.'
        }
      },
      {
        step: 3,
        badge: { en: 'Electron Config', ru: 'Конфигурация' },
        title: { en: 'Valence Electron Shells', ru: 'Валентные электронные оболочки' },
        description: {
          en: 'Oxygen configuration: 1s² 2s² 2p⁴. It has 6 valence electrons in its outer shell — it desperately needs 2 more to complete its octet (8)!',
          ru: 'Конфигурация кислорода: 1s² 2s² 2p⁴. На внешнем слое 6 валентных электронов — ему не хватает 2 электронов до устойчивого октета (8)!'
        },
        insight: {
          en: 'The two hydrogen atoms each bring 1 electron to share.',
          ru: 'Два водорода приносят по 1 электрону для совместного обобществления.'
        }
      },
      {
        step: 4,
        badge: { en: 'Hybridization', ru: 'sp³-Гибридизация' },
        title: { en: 'Orbital Mixing: sp³ Hybridization', ru: 'Смешивание орбиталей: sp³-гибридизация' },
        description: {
          en: 'Oxygen mixes one 2s and three 2p orbitals into four equivalent sp³ hybrid lobes pointing toward the vertices of a tetrahedron (109.5°).',
          ru: 'Кислород смешивает одну 2s и три 2p орбитали, образуя четыре sp³-гибридные лопасти, направленные к вершинам тетраэдра (109.5°).'
        },
        insight: {
          en: '2 lobes hold lone pairs; 2 lobes hold single electrons ready to bond.',
          ru: '2 лопасти заняты неподелёнными парами, а 2 лопасти готовы к образованию связей.'
        }
      },
      {
        step: 5,
        badge: { en: 'Orbital Overlap', ru: 'Перекрывание' },
        title: { en: 'Covalent σ-Bond Formation', ru: 'Образование ковалентных σ-связей' },
        description: {
          en: 'Hydrogen 1s spherical orbitals overlap head-on with two of the sp³ lobes, forming two strong covalent sigma (σ) bonds.',
          ru: 'Сферические 1s-орбитали водорода перекрываются с двумя sp³-лопастями кислорода, образуя две прочные ковалентные сигма (σ) связи.'
        },
        insight: {
          en: 'Electrons are shared between nuclei, filling both octet and duet.',
          ru: 'Электронные пары становятся общими, завершая оболочки всех атомов.'
        }
      },
      {
        step: 6,
        badge: { en: 'Lone-Pair Repulsion', ru: 'Отталкивание пар' },
        title: { en: 'Lone Pair Repulsion → 104.5° Geometry', ru: 'Отталкивание неподелённых пар → Угол 104.5°' },
        description: {
          en: 'The two non-bonding lone pairs have broader, more diffuse negative charge clouds. They repel each other and the bonding pairs, squeezing the tetrahedral 109.5° angle down to 104.5°!',
          ru: 'Две неподелённые электронные пары имеют более объемные облака отрицательного заряда. Они сильнее отталкивают связывающие пары, сжимая тетраэдрический угол 109.5° до 104.5°!'
        },
        insight: {
          en: 'This creates a net dipole moment vector (δ- on O, δ+ on H), making water a life-giving polar solvent.',
          ru: 'Так рождается постоянный дипольный момент: кислород заряжен частично отрицательно (δ-), а водороды — положительно (δ+).'
        }
      }
    ],
    CH4: [
      {
        step: 1,
        badge: { en: 'Intact Molecule', ru: 'Целая молекула' },
        title: { en: 'Methane Molecule: CH₄', ru: 'Молекула метана: CH₄' },
        description: {
          en: 'Four hydrogen atoms surround one carbon in perfect tetrahedral symmetry with 109.5° angles.',
          ru: 'Четыре атома водорода окружают углерод в идеальной тетраэдрической симметрии с углами 109.5°.'
        },
        insight: { en: 'Why are all four bonds completely identical in length and strength?', ru: 'Почему все четыре связи абсолютно одинаковы по длине и энергии?' }
      },
      {
        step: 2,
        badge: { en: 'Atoms', ru: 'Разбор на атомы' },
        title: { en: 'Free Atoms: C + 4H', ru: 'Свободные атомы: C + 4H' },
        description: { en: 'Carbon (Z=6) and 4 individual Hydrogen atoms (Z=1).', ru: 'Атом углерода (Z=6) и 4 отдельных атома водорода.' },
        insight: { en: 'Ground state carbon has only 2 unpaired electrons in 2p.', ru: 'В основном состоянии у углерода всего 2 неспаренных электрона.' }
      },
      {
        step: 3,
        badge: { en: 'Excitation', ru: 'Возбуждение' },
        title: { en: 'Valence Excitation: 2s¹ 2p³', ru: 'Возбуждение атома углерода: 2s¹ 2p³' },
        description: { en: 'One 2s electron absorbs energy and promotes into empty 2pz orbital, creating 4 unpaired electrons.', ru: 'Один 2s-электрон переходит на пустую 2pz-орбиталь, создавая 4 неспаренных валентных электрона.' },
        insight: { en: 'Now carbon can form 4 bonds instead of 2.', ru: 'Теперь углерод может образовать 4 связи.' }
      },
      {
        step: 4,
        badge: { en: 'sp³ Hybridization', ru: 'sp³-Гибридизация' },
        title: { en: 'Equalization into 4 sp³ Lobes', ru: 'Выравнивание в 4 sp³-лопасти' },
        description: { en: 'The 2s and three 2p orbitals hybridize into four identical sp³ orbitals spaced at 109.5° apart.', ru: 'Одна 2s и три 2p орбитали гибридизуются в 4 одинаковые sp³-орбитали с углами ровно 109.5°.' },
        insight: { en: 'Maximum distance between 4 electron clouds in 3D is a tetrahedron.', ru: 'Максимальное удаление 4 электронных облаков в пространстве — это тетраэдр.' }
      },
      {
        step: 5,
        badge: { en: 'Bonding', ru: 'Связывание' },
        title: { en: '4 C-H σ-Bonds', ru: '4 ковалентные σ-связи C–H' },
        description: { en: 'Each H 1s orbital overlaps with one sp³ lobe.', ru: 'Каждый водород перекрывается с одной sp³-лопастью.' },
        insight: { en: 'All bond energies are identical: 414 kJ/mol.', ru: 'Все 4 связи полностью эквивалентны.' }
      },
      {
        step: 6,
        badge: { en: 'Non-Polar Geometry', ru: 'Неполярная геометрия' },
        title: { en: 'Perfect Tetrahedral Symmetry (Zero Dipole)', ru: 'Идеальная симметрия (нулевой диполь)' },
        description: { en: 'Because all 4 bonds are identical and symmetric, bond dipole vectors cancel out to zero: net μ = 0.', ru: 'Благодаря строгой симметрии тетраэдра дипольные моменты связей взаимно гасят друг друга: μ = 0.' },
        insight: { en: 'Methane is non-polar and does not dissolve in water.', ru: 'Метан неполярен и не растворяется в воде.' }
      }
    ],
    CO2: [
      {
        step: 1,
        badge: { en: 'Intact Molecule', ru: 'Целая молекула' },
        title: { en: 'Carbon Dioxide: CO₂', ru: 'Углекислый газ: CO₂' },
        description: { en: 'A completely straight, linear molecule O=C=O with a 180° bond angle.', ru: 'Полностью линейная молекула O=C=O с углом связи 180°.' },
        insight: { en: 'Why is CO₂ straight (180°) while H₂O is bent (104.5°)?', ru: 'Почему CO₂ абсолютно прямой (180°), а H₂O согнут (104.5°)?' }
      },
      {
        step: 2,
        badge: { en: 'Atoms', ru: 'Разбор на атомы' },
        title: { en: 'Free Atoms: C + 2O', ru: 'Свободные атомы: C + 2O' },
        description: { en: '1 Carbon and 2 Oxygen atoms.', ru: '1 атом углерода и 2 атома кислорода.' },
        insight: { en: 'Carbon needs 4 electrons, each oxygen needs 2.', ru: 'Углероду нужно 4 электрона, каждому кислороду — по 2.' }
      },
      {
        step: 3,
        badge: { en: 'sp Hybridization', ru: 'sp-Гибридизация' },
        title: { en: 'Linear sp Hybridization on Carbon', ru: 'Линейная sp-гибридизация углерода' },
        description: { en: 'Carbon mixes one 2s and one 2p orbital, pointing in opposite directions (180°). Two unhybridized 2p orbitals remain perpendicular.', ru: 'Углерод смешивает 2s и 2px, образуя 2 sp-орбитали, направленные в противоположные стороны (180°).' },
        insight: { en: '2 electron domains repel as far as possible: straight line.', ru: 'Два электронных домена максимально отдаляются друг от друга: прямая линия.' }
      },
      {
        step: 4,
        badge: { en: 'Double Bonds', ru: 'Двойные связи' },
        title: { en: 'σ Bonds + Lateral π Bonds', ru: '2 σ-связи и 2 боковые π-связи' },
        description: { en: 'sp lobes form axial σ bonds with oxygen; unhybridized p orbitals overlap sideways forming two π bonds.', ru: 'sp-орбитали образуют осевые σ-связи, а оставшиеся p-орбитали перекрываются боками, образуя π-связи.' },
        insight: { en: 'Result: Two double bonds O=C=O.', ru: 'Итог: две прочные двойные связи O=C=O.' }
      },
      {
        step: 5,
        badge: { en: 'Linear Symmetry', ru: 'Линейная симметрия' },
        title: { en: 'Rigid 180° Alignment', ru: 'Жёсткая линейная форма 180°' },
        description: { en: 'No lone pairs reside on central carbon to bend it. The opposing dipoles point in exact opposite directions and cancel.', ru: 'На центральном атоме углерода нет неподелённых пар. Диполи противоположно направлены и взаимно гасятся.' },
        insight: { en: 'CO₂ is non-polar despite very polar C=O bonds.', ru: 'CO₂ неполярен, хотя каждая отдельная связь C=O сильно полярна.' }
      },
      {
        step: 6,
        badge: { en: 'Contrast with Water', ru: 'Контраст с водой' },
        title: { en: 'Why Water Bends but CO₂ Does Not', ru: 'Почему вода гнётся, а CO₂ прямой' },
        description: { en: 'Central Oxygen in water has 4 electron domains (2 bonds + 2 lone pairs). Central Carbon in CO₂ has only 2 electron domains (2 double bonds).', ru: 'У кислорода в воде 4 электронные пары (2 связи + 2 неподелённые пары). У углерода в CO₂ всего 2 электронных домена (две двойные связи).' },
        insight: { en: '2 domains = 180° (linear); 4 domains = 104.5° (bent due to lone pair push).', ru: '2 домена = 180° (линия); 4 домена = 104.5° (угол из-за неподелённых пар).' }
      }
    ]
  };

  const currentStepData = stepsData[molecule][currentStep - 1];

  // Notify mentor
  useEffect(() => {
    onSelectConceptForMentor('deconstruct_h2o', { molecule, currentStep, forcedAngle });
  }, [molecule, currentStep, forcedAngle]);

  // Unlock milestone on reaching step 6
  useEffect(() => {
    if (currentStep === 6 && molecule === 'H2O') {
      onUnlockMilestone('deconstructed_water');
    }
  }, [currentStep, molecule]);

  // Test lone pair repulsion: force angle to 180° and animate snapback to 104.5°!
  const triggerRepulsionSnap = () => {
    setIsRepelling(true);
    setForcedAngle(180);
    setTimeout(() => {
      // Snap back to 104.5
      let current = 180;
      const interval = setInterval(() => {
        current -= 3.5;
        if (current <= 104.5) {
          setForcedAngle(104.5);
          setIsRepelling(false);
          clearInterval(interval);
        } else {
          setForcedAngle(current);
        }
      }, 25);
    }, 900);
  };

  // Three.js Scene Setup for Deconstruction
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060919);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-5, -4, -5);
    scene.add(dirLight2);

    const molGroup = new THREE.Group();
    scene.add(molGroup);

    // Build models based on molecule and step
    if (molecule === 'H2O') {
      const angleRad = (forcedAngle * Math.PI) / 180;
      const bondDist = currentStep === 1 ? 1.6 : currentStep === 2 ? 3.4 : currentStep >= 5 ? 1.6 : 2.5;

      // Central Oxygen (Red)
      const oxygenGeo = new THREE.SphereGeometry(0.75, 32, 32);
      const oxygenMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.25,
        metalness: 0.1
      });
      const oxygen = new THREE.Mesh(oxygenGeo, oxygenMat);
      molGroup.add(oxygen);

      // Translucent vdW electron cloud around Oxygen
      if (currentStep === 1 || currentStep >= 4) {
        const vdwO = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 24, 24),
          new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.15,
            wireframe: true
          })
        );
        molGroup.add(vdwO);
      }

      // Hydrogens (White / light grey)
      const hGeo = new THREE.SphereGeometry(0.42, 24, 24);
      const hMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.3,
        metalness: 0.1
      });

      const halfAngle = angleRad / 2;
      const h1Pos = new THREE.Vector3(Math.sin(halfAngle) * bondDist, -Math.cos(halfAngle) * bondDist, 0);
      const h2Pos = new THREE.Vector3(-Math.sin(halfAngle) * bondDist, -Math.cos(halfAngle) * bondDist, 0);

      const h1 = new THREE.Mesh(hGeo, hMat);
      h1.position.copy(h1Pos);
      molGroup.add(h1);

      const h2 = new THREE.Mesh(hGeo, hMat);
      h2.position.copy(h2Pos);
      molGroup.add(h2);

      // Bonds (Cylinders) when connected (Step 1, 5, 6)
      if (currentStep === 1 || currentStep >= 5) {
        const makeBond = (from: THREE.Vector3, to: THREE.Vector3) => {
          const dir = new THREE.Vector3().subVectors(to, from);
          const len = dir.length();
          const bondGeo = new THREE.CylinderGeometry(0.12, 0.12, len, 16);
          const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
          const bond = new THREE.Mesh(bondGeo, bondMat);
          bond.position.copy(from).addScaledVector(dir, 0.5);
          bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
          return bond;
        };

        molGroup.add(makeBond(new THREE.Vector3(0, 0, 0), h1Pos));
        molGroup.add(makeBond(new THREE.Vector3(0, 0, 0), h2Pos));
      }

      // Lone Pairs Visuals (Cyan/Violet lobe clouds pointing backwards in 3D tetrahedral vertices)
      if (showLonePairs && (currentStep === 4 || currentStep === 6)) {
        const lonePairGeo = new THREE.ConeGeometry(0.55, 1.4, 16);
        const lonePairMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.55,
          roughness: 0.3
        });

        // Lone Pair 1 (pointing up and forward)
        const lp1 = new THREE.Mesh(lonePairGeo, lonePairMat);
        lp1.position.set(0.65, 0.95, 0.85);
        lp1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.65, 0.95, 0.85).normalize());
        molGroup.add(lp1);

        // Lone Pair 2 (pointing up and backward)
        const lp2 = new THREE.Mesh(lonePairGeo, lonePairMat);
        lp2.position.set(-0.65, 0.95, -0.85);
        lp2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.65, 0.95, -0.85).normalize());
        molGroup.add(lp2);

        // Small glowing lone pair electron dots
        const dotGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const d1a = new THREE.Mesh(dotGeo, dotMat);
        d1a.position.set(0.55, 1.7, 0.75);
        const d1b = new THREE.Mesh(dotGeo, dotMat);
        d1b.position.set(0.75, 1.6, 0.95);
        molGroup.add(d1a);
        molGroup.add(d1b);
      }

      // Dipole Vector Arrow on Step 6
      if (showDipole && currentStep === 6) {
        const dipoleDir = new THREE.Vector3(0, 1, 0);
        const arrow = new THREE.ArrowHelper(dipoleDir, new THREE.Vector3(0, -1.2, 0), 2.2, 0xfacc15, 0.4, 0.25);
        molGroup.add(arrow);
      }
    } else if (molecule === 'CH4') {
      // Carbon central sphere (Grey/Dark)
      const carbon = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
      );
      molGroup.add(carbon);

      // 4 Tetrahedral Hydrogens
      const tetrahedralAngles = [
        new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(1.8),
        new THREE.Vector3(-1, -1, 1).normalize().multiplyScalar(1.8),
        new THREE.Vector3(-1, 1, -1).normalize().multiplyScalar(1.8),
        new THREE.Vector3(1, -1, -1).normalize().multiplyScalar(1.8)
      ];

      tetrahedralAngles.forEach((pos) => {
        const h = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 24, 24),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        h.position.copy(pos);
        molGroup.add(h);

        // Bond cylinder
        const dir = pos.clone();
        const bond = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, pos.length(), 16),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
        );
        bond.position.copy(pos).multiplyScalar(0.5);
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        molGroup.add(bond);
      });
    } else if (molecule === 'CO2') {
      // Central Carbon (Grey)
      const carbon = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      molGroup.add(carbon);

      // 2 Oxygens at 180° along X axis
      [-1.9, 1.9].forEach((xPos) => {
        const o = new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xef4444 })
        );
        o.position.set(xPos, 0, 0);
        molGroup.add(o);

        // Double bond cylinders
        [-0.15, 0.15].forEach((offsetY) => {
          const bond = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
          );
          bond.position.set(xPos / 2, offsetY, 0);
          bond.rotation.z = Math.PI / 2;
          molGroup.add(bond);
        });
      });
    }

    // Mouse drag interaction
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

      molGroup.rotation.y += deltaX * 0.008;
      molGroup.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(14, camera.position.z + e.deltaY * 0.01));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        molGroup.rotation.y += 0.003;
      }
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
      container.innerHTML = '';
    };
  }, [molecule, currentStep, forcedAngle, showLonePairs, showDipole]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* 3D Scene View */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Molecule selector header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {lang === 'ru' ? 'Анатомия молекулы: «Разбери объект»' : 'Molecular Deconstruction Explorer'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Шаг за шагом: почему молекула имеет именно такую геометрию' : 'Step-by-step: Why does the molecule adopt this shape?'}
              </p>
            </div>
          </div>

          {/* Molecule picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['H2O', 'CH4', 'CO2'] as DeconstructMolecule[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMolecule(m);
                  setCurrentStep(1);
                  setForcedAngle(104.5);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  molecule === m
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'H2O' ? 'H₂O (Water)' : m === 'CH4' ? 'CH₄ (Methane)' : 'CO₂ (Linear)'}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Step Navigator */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          {stepsData[molecule].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentStep === s.step
                  ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/40'
                  : currentStep > s.step
                  ? 'bg-slate-800/80 text-cyan-300 border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                currentStep === s.step ? 'bg-white text-indigo-700 font-bold' : 'bg-slate-800 text-slate-300'
              }`}>
                {s.step}
              </span>
              <span>{s.badge[lang]}</span>
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="relative w-full h-[440px] sm:h-[480px]">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Interactive HUD Angle & Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-950/85 border border-slate-800/90 backdrop-blur-md rounded-xl p-3 text-xs text-slate-200 flex flex-col gap-1.5 shadow-xl pointer-events-auto">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium">{lang === 'ru' ? 'Угол связи:' : 'Bond Angle:'}</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">{forcedAngle.toFixed(1)}°</span>
              </div>
              {molecule === 'H2O' && (
                <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>{lang === 'ru' ? '2 неподелённые пары (sp³)' : '2 Lone Pairs (sp³)'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Repulsion Sandbox Trigger (Right side) */}
          {molecule === 'H2O' && (
            <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-amber-500/40 backdrop-blur-md rounded-xl p-3 shadow-xl flex flex-col gap-2 max-w-xs">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {lang === 'ru' ? 'Проверь отталкивание пар!' : 'Test Lone-Pair Repulsion!'}
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                {lang === 'ru'
                  ? 'Попробуй распрямить воду в 180° как CO₂ — посмотри, как электронные пары отталкивают атомы обратно!'
                  : 'Force water into a 180° straight line — observe how lone-pair electron clouds repel it back!'}
              </p>
              <button
                onClick={triggerRepulsionSnap}
                disabled={isRepelling}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isRepelling
                  ? (lang === 'ru' ? 'Отталкивание...' : 'Repelling back...')
                  : (lang === 'ru' ? 'Распрямить в 180° (Тест)' : 'Force 180° (Test)')}
              </button>
            </div>
          )}
        </div>

        {/* Step navigation footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ru' ? 'Предыдущий шаг' : 'Previous Step'}
          </button>

          <div className="text-xs text-slate-400 font-mono">
            {lang === 'ru' ? 'Шаг' : 'Step'} {currentStep} / {stepsData[molecule].length}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(stepsData[molecule].length, currentStep + 1))}
            disabled={currentStep === stepsData[molecule].length}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {lang === 'ru' ? 'Следующий шаг' : 'Next Step'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explanation & Insight Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {currentStepData.badge[lang]}
              </span>
              <h3 className="font-bold text-slate-100 text-sm">{currentStepData.title[lang]}</h3>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {currentStepData.description[lang]}
            </p>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200 flex items-start gap-2">
              <span className="text-indigo-400 font-bold">💡</span>
              <span className="leading-relaxed">{currentStepData.insight[lang]}</span>
            </div>
          </div>

          {/* Toggle controls */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 cursor-pointer text-slate-300 hover:text-white">
              <span>{lang === 'ru' ? 'Показывать неподелённые пары' : 'Show Lone Pairs'}</span>
              <input
                type="checkbox"
                checked={showLonePairs}
                onChange={(e) => setShowLonePairs(e.target.checked)}
                className="rounded accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 cursor-pointer text-slate-300 hover:text-white">
              <span>{lang === 'ru' ? 'Вектор дипольного момента' : 'Net Dipole Vector'}</span>
              <input
                type="checkbox"
                checked={showDipole}
                onChange={(e) => setShowDipole(e.target.checked)}
                className="rounded accent-cyan-400"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
