"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Props = {
  url: string; sha256: string; byteLength: number;
  groups: string[]; rotation: number; zoom: number; reset: number;
  selectedId?: string;
  onStatus: (value: "loading" | "ready" | "error") => void;
  onPick?: (value: { id: string; x: number; y: number } | null) => void;
};
type View = { update: (props: Pick<Props, "groups" | "rotation" | "zoom" | "reset" | "selectedId">) => void };

// Review-only renderer; not a replacement for the medically reviewed asset loader.
export default function ReferenceCanvas(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<View | null>(null);
  const current = useRef(props);
  useEffect(() => { current.current = props; view.current?.update(props); }, [props]);
  const { url, sha256, byteLength, onStatus } = props;
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    let stopped = false;
    let cameraFrame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let observer: ResizeObserver | undefined;
    let model: THREE.Object3D | undefined;
    const disposeModel = (object: THREE.Object3D) => object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const materials: THREE.Material[] = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => material.dispose());
      }
    });
    onStatus("loading");
    async function load() {
      const response = await fetch(url, { signal: abort.signal, cache: "no-store" });
      if (!response.ok || !response.body) throw new Error("Unavailable");
      const reader = response.body.getReader();
      const bytes = new Uint8Array(byteLength);
      let count = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (count + value.length > byteLength) { await reader.cancel(); throw new Error("Oversized"); }
          bytes.set(value, count); count += value.length;
        }
      } finally { reader.releaseLock(); }
      if (count !== byteLength) throw new Error("Incomplete");
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        value => value.toString(16).padStart(2, "0")).join("");
      if (digest !== sha256 || stopped) throw new Error("Integrity or cancellation");
      const manager = new THREE.LoadingManager();
      // Candidate is geometry-only; no external or embedded image dependencies.
      manager.setURLModifier(() => { throw new Error("Unexpected resource"); });
      const parsed = await new GLTFLoader(manager).parseAsync(bytes.buffer, "");
      if (stopped) { disposeModel(parsed.scene); return; }
      model = parsed.scene;
      const scene = new THREE.Scene(); scene.add(model);
      scene.add(new THREE.HemisphereLight("#ffffff", "#66718a", 1.3));
      const key = new THREE.DirectionalLight("#fff5ea", 2.6); key.position.set(-2,3,4);scene.add(key);
      const fill = new THREE.DirectionalLight("#dfe9ff", 1.2);fill.position.set(3,1,-2);scene.add(fill);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const canvas = renderer.domElement;
      canvas.style.cursor = "grab";
      canvas.setAttribute("aria-label", "Mô hình vùng ngực; dùng các nút và danh sách lớp để điều khiển");
      container!.append(canvas);
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const camera = new THREE.PerspectiveCamera(38,1,0.005,20);
      controls = new OrbitControls(camera, canvas);
      controls.target.copy(center);controls.enableDamping = false;
      controls.minDistance = size.length() * .25;controls.maxDistance = size.length() * 4;
      const render = () => { if (!stopped) renderer?.render(scene, camera); };
      const moveCamera = (destination: THREE.Vector3, smooth: boolean) => {
        cancelAnimationFrame(cameraFrame);
        const start = camera.position.clone();
        const started = performance.now();
        if (!smooth || matchMedia("(prefers-reduced-motion: reduce)").matches) {
          camera.position.copy(destination); controls!.update(); render(); return;
        }
        const step = (now: number) => {
          if (stopped) return;
          const progress = Math.min(1, (now - started) / 240);
          camera.position.lerpVectors(start, destination, 1 - Math.pow(1 - progress, 3));
          controls!.update(); render();
          if (progress < 1) cameraFrame = requestAnimationFrame(step);
        };
        cameraFrame = requestAnimationFrame(step);
      };
      const resetCamera = (smooth = false) => {
        const tangent = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        // Reserve room for the overlay controls above and below the anatomy.
        const distance = Math.max(size.y / tangent, size.x / camera.aspect / tangent) * 1.35 + size.z / 2;
        controls!.target.copy(center);
        moveCamera(center.clone().add(new THREE.Vector3(0,0,distance)), smooth);
      };
      let previous = { ...current.current };
      view.current = { update(next) {
        model!.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.visible = next.groups.includes(object.userData.group as string);
            if (object.material instanceof THREE.MeshStandardMaterial) {
              object.material.emissive.set(object.name === next.selectedId ? "#315ac9" : "#000000");
              object.material.emissiveIntensity = object.name === next.selectedId ? 0.16 : 0;
            }
          }
        });
        if (next.reset !== previous.reset) resetCamera(true);
        else if (next.rotation !== previous.rotation || next.zoom !== previous.zoom) {
          const offset = camera.position.clone().sub(controls!.target);
          offset.applyAxisAngle(new THREE.Vector3(0,1,0),(next.rotation - previous.rotation) * Math.PI / 12);
          offset.setLength(THREE.MathUtils.clamp(offset.length() * Math.pow(.85, next.zoom - previous.zoom),
            controls!.minDistance, controls!.maxDistance));
          current.current.onPick?.(null);
          moveCamera(controls!.target.clone().add(offset), true);
        }
        previous = { ...previous, ...next };render();
      } };
      let first = true;
      observer = new ResizeObserver(() => {
        renderer!.setSize(container!.clientWidth, container!.clientHeight);
        camera.aspect = container!.clientWidth / container!.clientHeight;camera.updateProjectionMatrix();
        if (first) { resetCamera();first = false; } else render();
      });observer.observe(container!);
      controls.addEventListener("change", render);
      controls.addEventListener("start", () => { cancelAnimationFrame(cameraFrame); current.current.onPick?.(null); });
      const raycaster = new THREE.Raycaster();
      let down: { x: number; y: number; id: number } | null = null;
      canvas.addEventListener("pointerdown", event => {
        down = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
      }, { signal: abort.signal });
      canvas.addEventListener("pointercancel", () => { down = null; }, { signal: abort.signal });
      canvas.addEventListener("pointerup", event => {
        const start = down; down = null;
        if (!start || start.id !== event.pointerId || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 5) return;
        const rect = canvas.getBoundingClientRect();
        raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2), camera);
        const meshes: THREE.Object3D[] = [];
        model!.traverseVisible(object => { if (object instanceof THREE.Mesh) meshes.push(object); });
        const hit = raycaster.intersectObjects(meshes, false)[0];
        current.current.onPick?.(hit ? { id: hit.object.name, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
      }, { signal: abort.signal });
      canvas.addEventListener("webglcontextlost", event => {
        event.preventDefault();cancelAnimationFrame(cameraFrame);controls!.enabled = false;view.current = null;onStatus("error");
      }, { signal: abort.signal });
      view.current.update(current.current);
      onStatus("ready");
    }
    void load().catch(() => { if (!stopped) onStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => {
      stopped = true;clearTimeout(timeout);abort.abort();view.current = null;
      cancelAnimationFrame(cameraFrame);
      observer?.disconnect();controls?.dispose();
      if (model) disposeModel(model);
      renderer?.dispose();renderer?.domElement.remove();
    };
  }, [url, sha256, byteLength, onStatus]);
  return <div ref={host} style={{ position: "absolute", inset: 0 }} />;
}
