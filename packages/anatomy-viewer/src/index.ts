import { create } from "zustand";
import {
  sceneSchema,
  validateSceneForAsset,
  type AssetManifest,
  type SceneSnapshot,
} from "@hs/contracts";
export type Mode = "explore" | "learn" | "teach";
type Store = {
  manifest: AssetManifest | null;
  scene: SceneSnapshot | null;
  mode: Mode;
  past: SceneSnapshot[];
  future: SceneSnapshot[];
  setManifest: (m: AssetManifest | null) => void;
  setMode: (m: Mode) => void;
  change: (patch: Partial<SceneSnapshot>) => void;
  tick: (time: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  restore: (value: unknown) => boolean;
};
export function initialScene(m: AssetManifest): SceneSnapshot {
  return {
    schemaVersion: 1,
    assetVersionId: m.id,
    mappingVersion: m.mappingVersion,
    selectedAnatomyId: null,
    camera: m.camera,
    layers: m.layers.map((l) => ({ id: l.id, visible: true, opacity: 1 })),
    isolation: [],
    labels: true,
    animation: { clipId: null, timeSeconds: 0, playbackRate: 1, paused: true },
    annotations: [],
  };
}
export const useViewer = create<Store>((set, get) => ({
  manifest: null,
  scene: null,
  mode: "explore",
  past: [],
  future: [],
  setManifest: (manifest) =>
    set({
      manifest,
      scene: manifest ? initialScene(manifest) : null,
      past: [],
      future: [],
    }),
  setMode: (mode) => set({ mode }),
  change: (patch) => {
    const { scene, manifest, past } = get();
    if (!scene || !manifest) return;
    const next = sceneSchema.parse({ ...scene, ...patch });
    if (!validateSceneForAsset(next, manifest))
      throw new Error("Invalid scene");
    set({ scene: next, past: [...past.slice(-49), scene], future: [] });
  },
  tick: (time) => {
    const scene = get().scene;
    if (scene)
      set({
        scene: {
          ...scene,
          animation: { ...scene.animation, timeSeconds: time },
        },
      });
  },
  undo: () => {
    const { past, scene, future } = get();
    const previous = past.at(-1);
    if (scene && previous)
      set({
        scene: {
          ...previous,
          animation: { ...previous.animation, paused: true },
        },
        past: past.slice(0, -1),
        future: [scene, ...future].slice(0, 50),
      });
  },
  redo: () => {
    const { past, scene, future } = get();
    const next = future[0];
    if (scene && next)
      set({
        scene: { ...next, animation: { ...next.animation, paused: true } },
        past: [...past, scene].slice(-50),
        future: future.slice(1),
      });
  },
  reset: () => {
    const { manifest } = get();
    if (manifest) get().change(initialScene(manifest));
  },
  restore: (value) => {
    const parsed = sceneSchema.safeParse(value);
    const manifest = get().manifest;
    if (
      !parsed.success ||
      !manifest ||
      !validateSceneForAsset(parsed.data, manifest)
    )
      return false;
    get().change({
      ...parsed.data,
      animation: { ...parsed.data.animation, paused: true },
    });
    return true;
  },
}));
