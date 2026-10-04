"use client";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ComponentRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import {
  AnimationMixer,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  Texture,
  Vector3,
  type Material,
  type Object3D,
} from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { type AssetManifest } from "@hs/contracts";
import { useViewer } from "./index";
function dispose(root: Object3D) {
  root.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      const materials: Material[] = Array.isArray(o.material)
        ? o.material
        : [o.material];
      for (const material of materials) {
        for (const v of Object.values(material))
          if (v instanceof Texture) v.dispose();
        material.dispose();
      }
    }
  });
}
export async function loadVerifiedModel(
  url: string,
  manifest: AssetManifest,
  signal: AbortSignal,
): Promise<GLTF> {
  const parsed = new URL(url, window.location.origin);
  if (parsed.origin !== window.location.origin && parsed.protocol !== "https:")
    throw new Error("Unsafe asset URL");
  const response = await fetch(parsed, {
    signal,
    credentials:
      parsed.origin === window.location.origin ? "same-origin" : "omit",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Asset fetch failed");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty response");
  const parts: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > manifest.byteLength) {
        await reader.cancel();
        throw new Error("Asset exceeds declared size");
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (total !== manifest.byteLength) throw new Error("Asset size mismatch");
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== manifest.sha256) throw new Error("Asset integrity mismatch");
  if (signal.aborted) throw new Error("Aborted");
  const manager = new LoadingManager();
  manager.setURLModifier((uri) => {
    if (!uri.startsWith("blob:") && !uri.startsWith("data:"))
      throw new Error("External glTF dependencies are not allowed");
    return uri;
  });
  const result = await new GLTFLoader(manager).parseAsync(bytes.buffer, "");
  try {
    if (signal.aborted) throw new Error("Aborted");
    const expected = new Map(manifest.structures.map((s) => [s.meshName, s]));
    const seen = new Set<string>();
    result.scene.traverse((o) => {
      if (o instanceof Mesh) {
        if (!expected.has(o.name) || seen.has(o.name))
          throw new Error("Unmapped mesh");
        seen.add(o.name);
      }
    });
    if (seen.size !== expected.size) throw new Error("Missing mesh");
    for (const clip of manifest.clips) {
      const actual = result.animations.find((c) => c.name === clip.name);
      if (!actual || Math.abs(actual.duration - clip.duration) > 0.05)
        throw new Error("Animation mismatch");
    }
    // Materials may be shared across meshes in glTF. Isolate display state per mesh.
    const originals=new Set<Material>();
    result.scene.traverse(o=>{if(o instanceof Mesh){const source:Material[]=Array.isArray(o.material)?o.material:[o.material];source.forEach(m=>originals.add(m));o.material=Array.isArray(o.material)?source.map(m=>m.clone()):source[0]!.clone();}});
    originals.forEach(material=>material.dispose());
    return result;
  } catch (error) {
    dispose(result.scene);
    throw error;
  }
}
function Scene({ model, manifest, renderSelection }: { model: GLTF; manifest: AssetManifest; renderSelection?: (id: string) => ReactNode }) {
  const [pickedPoint, setPickedPoint] = useState<{ id: string; point: Vector3 } | null>(null);
  const snapshot = useViewer((s) => s.scene);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, invalidate, gl } = useThree();
  const mixer = useRef(new AnimationMixer(model.scene));
  useEffect(() => {
    const current = mixer.current;
    return () => {
      current.stopAllAction();
      current.uncacheRoot(model.scene);
    };
  }, [model]);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      useViewer
        .getState()
        .change({
          animation: { ...useViewer.getState().scene!.animation, paused: true },
        });
    };
    gl.domElement.addEventListener("webglcontextlost", handler);
    return () => gl.domElement.removeEventListener("webglcontextlost", handler);
  }, [gl]);
  useEffect(() => {
    if (!snapshot) return;
    camera.position.fromArray(snapshot.camera.position);
    controls.current?.target.fromArray(snapshot.camera.target);
    controls.current?.update();
    invalidate();
  }, [snapshot?.camera, camera, invalidate]);
  useEffect(() => {
    if (!snapshot) return;
    const mappings = new Map(manifest.structures.map((s) => [s.meshName, s]));
    model.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const mapping = mappings.get(o.name)!;
      const layer = snapshot.layers.find((l) => l.id === mapping.layerId);
      o.visible =
        !!layer?.visible &&
        (!snapshot.isolation.length ||
          snapshot.isolation.includes(mapping.anatomyId));
      const materials: Material[] = Array.isArray(o.material)
        ? o.material
        : [o.material];
      for (const mat of materials) {
        mat.opacity = layer?.opacity ?? 1;
        mat.transparent = mat.opacity < 1;
        mat.depthWrite = mat.opacity === 1;
        if (mat instanceof MeshStandardMaterial) {
          mat.emissive.set(
            mapping.anatomyId === snapshot.selectedAnatomyId
              ? "#163cff"
              : "#000000",
          );
          mat.emissiveIntensity = 0.18;
        }
      }
    });
    invalidate();
  }, [
    snapshot?.layers,
    snapshot?.isolation,
    snapshot?.selectedAnatomyId,
    model,
    manifest,
    invalidate,
  ]);
  useEffect(() => {
    mixer.current.stopAllAction();
    const clip = manifest.clips.find(
      (c) => c.id === snapshot?.animation.clipId,
    );
    const animation = model.animations.find((c) => c.name === clip?.name);
    if (animation) mixer.current.clipAction(animation).play();
    invalidate();
  }, [snapshot?.animation.clipId, manifest, model, invalidate]);
  useFrame((_state, delta) => {
    const current = useViewer.getState().scene;
    if (!current) return;
    const clip = manifest.clips.find((c) => c.id === current.animation.clipId);
    if (!clip) return;
    let time = current.animation.timeSeconds;
    if (!current.animation.paused) {
      time =
        (time + Math.min(delta, 0.1) * current.animation.playbackRate) %
        clip.duration;
      useViewer.getState().tick(time);
      invalidate();
    }
    mixer.current.setTime(time);
  });
  if (!snapshot) return null;
  const selected = manifest.structures.find(
    (s) => s.anatomyId === snapshot.selectedAnatomyId,
  );
  const selectedMesh = selected
    ? model.scene.getObjectByName(selected.meshName)
    : undefined;
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <directionalLight position={[-3, 2, -4]} intensity={1} />
      <primitive
        object={model.scene}
        onClick={(event: { stopPropagation: () => void; object: Object3D; point: Vector3; delta: number }) => {
          if (event.delta > 5) return;
          event.stopPropagation();
          const mapping = manifest.structures.find(
            (s) => s.meshName === event.object.name,
          );
          if (mapping) {
            setPickedPoint({ id: mapping.anatomyId, point: event.point.clone() });
            useViewer
              .getState()
              .change({ selectedAnatomyId: mapping.anatomyId });
          }
        }}
      />
      {(snapshot.labels || renderSelection) && selected && selectedMesh?.visible && (
        <Html position={pickedPoint?.id === selected.anatomyId ? pickedPoint.point : selectedMesh.getWorldPosition(new Vector3())} zIndexRange={[30, 20]} calculatePosition={(object, camera, size) => { const point = object.getWorldPosition(new Vector3()).project(camera); return [Math.max(12, Math.min(size.width - 300, (point.x + 1) * size.width / 2)), Math.max(16, Math.min(size.height - 360, (1 - point.y) * size.height / 2))]; }}>
          {renderSelection ? renderSelection(selected.anatomyId) : <span className="model-label">{selected.label}</span>}
        </Html>
      )}
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        minDistance={0.1}
        maxDistance={10}
        onChange={() => invalidate()}
        onEnd={() => {
          const c = controls.current;
          if (c)
            useViewer
              .getState()
              .change({
                camera: {
                  position: camera.position.toArray(),
                  target: c.target.toArray(),
                  fov: snapshot.camera.fov,
                },
              });
        }}
      />
    </>
  );
}
class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function AnatomyCanvas({
  url,
  manifest,
  onError,
  loadingFallback,
  renderSelection,
}: {
  url: string;
  manifest: AssetManifest;
  onError: () => void;
  loadingFallback?: ReactNode;
  renderSelection?: (id: string) => ReactNode;
}) {
  const [model, setModel] = useState<GLTF | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    let loaded: GLTF | null = null;
    void loadVerifiedModel(url, manifest, abort.signal)
      .then((result) => {
        loaded = result;
        setModel(result);
      })
      .catch(() => {
        if (!abort.signal.aborted) onError();
      });
    return () => {
      abort.abort();
      if (loaded) dispose(loaded.scene);
    };
  }, [url, manifest, onError]);
  if (!model)
    return loadingFallback ?? (
      <div className="viewer-loading" role="status">
        Đang tải mô hình…
      </div>
    );
  return (
    <CanvasBoundary onError={onError}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{
          position: manifest.camera.position,
          fov: manifest.camera.fov,
        }}
        gl={{ antialias: true, powerPreference: "default" }}
        aria-label="Mô hình giải phẫu 3D; có thể chọn cấu trúc trong danh sách"
      >
        <Scene model={model} manifest={manifest} renderSelection={renderSelection} />
      </Canvas>
    </CanvasBoundary>
  );
}
