import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface PartInfo {
  title: { ru: string; en: string };
  text: { ru: string; en: string };
  // Optional action: e.g. zoom into this part
  goTo?: string;
}

export interface StageOptions {
  cameraPosition?: [number, number, number];
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  fov?: number;
  onPick?: (info: PartInfo | null, object: THREE.Object3D | null) => void;
  onHover?: (info: PartInfo | null, screen: { x: number; y: number } | null) => void;
}

type Updater = (dt: number, elapsed: number) => void;

const STAGE_BG = 0x111214;
const HOVER_EMISSIVE = new THREE.Color(0x2f5bff);

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Finds the nearest ancestor that carries part info
function findInfo(object: THREE.Object3D | null): THREE.Object3D | null {
  let o = object;
  while (o) {
    if (o.userData.info) return o;
    o = o.parent;
  }
  return null;
}

/**
 * Shared 3D stage for labs: renderer, lights, smooth orbit controls (mouse, wheel, touch),
 * hover highlight + click picking of parts tagged with `userData.info`, and animated camera moves.
 * Created once per mount; labs add/remove content groups instead of rebuilding the scene.
 */
export class ThreeStage {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;

  private container: HTMLElement;
  private updaters = new Set<Updater>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private hovered: THREE.Object3D | null = null;
  private hoverSaved = new Map<THREE.Material, THREE.Color>();
  private clock = new THREE.Clock();
  private frame = 0;
  private observer: ResizeObserver;
  private flight: { fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; t: number; duration: number } | null = null;
  private downAt = { x: 0, y: 0 };
  private options: StageOptions;
  pickable: THREE.Object3D[] = [];

  constructor(container: HTMLElement, options: StageOptions = {}) {
    this.container = container;
    this.options = options;
    const { clientWidth: w, clientHeight: h } = container;

    this.scene.background = new THREE.Color(STAGE_BG);
    this.scene.fog = new THREE.Fog(STAGE_BG, 30, 80);

    this.camera = new THREE.PerspectiveCamera(options.fov ?? 42, w / Math.max(h, 1), 0.05, 200);
    this.camera.position.set(...(options.cameraPosition ?? [0, 3, 10]));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    // Soft studio lighting: sky/ground fill, warm key, cool rim
    this.scene.add(new THREE.HemisphereLight(0xdfe7ff, 0x1a1b20, 1.1));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.2);
    key.position.set(6, 9, 7);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fa4ff, 1.2);
    rim.position.set(-7, 3, -6);
    this.scene.add(rim);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.9;
    this.controls.minDistance = options.minDistance ?? 2;
    this.controls.maxDistance = options.maxDistance ?? 30;
    this.controls.target.set(...(options.target ?? [0, 0, 0]));
    this.controls.update();

    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointerleave', this.onPointerLeave);

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);

    this.loop();
  }

  setHandlers(onPick?: StageOptions['onPick'], onHover?: StageOptions['onHover']) {
    this.options.onPick = onPick;
    this.options.onHover = onHover;
  }

  onUpdate(fn: Updater) {
    this.updaters.add(fn);
    return () => this.updaters.delete(fn);
  }

  /** Register meshes/groups that can be hovered and clicked */
  setPickable(objects: THREE.Object3D[]) {
    this.clearHover();
    this.pickable = objects;
  }

  /** Smoothly move the camera and orbit target */
  flyTo(position: [number, number, number], target: [number, number, number] = [0, 0, 0], duration = 1.1) {
    this.flight = {
      fromPos: this.camera.position.clone(),
      toPos: new THREE.Vector3(...position),
      fromTarget: this.controls.target.clone(),
      toTarget: new THREE.Vector3(...target),
      t: 0,
      duration,
    };
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('pointerleave', this.onPointerLeave);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    el.remove();
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private loop = () => {
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    if (this.flight) {
      const f = this.flight;
      f.t = Math.min(1, f.t + dt / f.duration);
      const k = easeInOut(f.t);
      this.camera.position.lerpVectors(f.fromPos, f.toPos, k);
      this.controls.target.lerpVectors(f.fromTarget, f.toTarget, k);
      if (f.t >= 1) this.flight = null;
    }

    this.updaters.forEach((fn) => fn(dt, elapsed));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private pick(event: PointerEvent): THREE.Object3D | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const visible = this.pickable.filter((o) => {
      let v: THREE.Object3D | null = o;
      while (v) {
        if (!v.visible) return false;
        v = v.parent;
      }
      return true;
    });
    const hits = this.raycaster.intersectObjects(visible, true);
    // Translucent shells (membranes) only win when nothing inside them is hit
    let shell: THREE.Object3D | null = null;
    for (const hit of hits) {
      const owner = findInfo(hit.object);
      if (!owner) continue;
      if (!owner.userData.shell) return owner;
      shell ??= owner;
    }
    return shell;
  }

  private setHover(target: THREE.Object3D | null) {
    if (target === this.hovered) return;
    this.clearHover();
    this.hovered = target;
    if (!target) return;
    target.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (mat && 'emissive' in mat && !this.hoverSaved.has(mat)) {
        this.hoverSaved.set(mat, mat.emissive.clone());
        mat.emissive.lerp(HOVER_EMISSIVE, 0.35);
      }
    });
  }

  private clearHover() {
    this.hoverSaved.forEach((color, mat) => (mat as THREE.MeshStandardMaterial).emissive.copy(color));
    this.hoverSaved.clear();
    this.hovered = null;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.buttons) return; // dragging: don't flicker hover
    const target = this.pick(e);
    this.setHover(target);
    this.renderer.domElement.style.cursor = target ? 'pointer' : 'grab';
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.options.onHover?.(target ? (target.userData.info as PartInfo) : null, target ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.downAt = { x: e.clientX, y: e.clientY };
    this.flight = null; // user takes over the camera
  };

  private onPointerUp = (e: PointerEvent) => {
    // A click, not the end of a drag
    if (Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 5) return;
    const target = this.pick(e);
    this.options.onPick?.(target ? (target.userData.info as PartInfo) : null, target);
  };

  private onPointerLeave = () => {
    this.setHover(null);
    this.options.onHover?.(null, null);
  };
}
