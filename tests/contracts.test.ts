import { beforeEach, describe, expect, it } from "vitest";
import {
  assetManifestSchema,
  isAssetCurrent,
  sceneSchema,
  validateSceneForAsset,
  searchSchema,
} from "../packages/contracts/src/index";
import { initialScene, useViewer } from "../packages/anatomy-viewer/src/index";
import { fixtureManifest as manifest } from "./fixtures";
describe("asset and scene trust boundary", () => {
  it("rejects review receipts for different bytes", () => {
    expect(
      assetManifestSchema.safeParse({ ...manifest, sha256: "b".repeat(64) })
        .success,
    ).toBe(false);
  });
  it("rejects duplicate mesh IDs and unbound clips", () => {
    expect(
      assetManifestSchema.safeParse({
        ...manifest,
        structures: [...manifest.structures, ...manifest.structures],
      }).success,
    ).toBe(false);
    expect(
      assetManifestSchema.safeParse({
        ...manifest,
        clips: [{ ...manifest.clips[0], anatomyIds: ["missing"] }],
      }).success,
    ).toBe(false);
  });
  it("expires both medical review and licensing", () => {
    expect(isAssetCurrent(manifest, new Date("2100-01-01"))).toBe(false);
    expect(
      isAssetCurrent({
        ...manifest,
        license: { ...manifest.license, expiresAt: "2020-01-01T00:00:00.000Z" },
      }),
    ).toBe(false);
  });
  it("rejects non-finite positions, unbounded annotations and unknown fields", () => {
    const scene = initialScene(manifest);
    expect(
      sceneSchema.safeParse({
        ...scene,
        camera: { ...scene.camera, position: [NaN, 0, 0] },
      }).success,
    ).toBe(false);
    expect(
      sceneSchema.safeParse({ ...scene, privateNotes: "must not share" })
        .success,
    ).toBe(false);
  });
  it("rejects cross-asset scene and unmapped selection", () => {
    expect(
      validateSceneForAsset(
        { ...initialScene(manifest), selectedAnatomyId: "missing" },
        manifest,
      ),
    ).toBe(false);
    expect(
      validateSceneForAsset(
        {
          ...initialScene(manifest),
          assetVersionId: "a0000000-0000-4000-8000-000000000002",
        },
        manifest,
      ),
    ).toBe(false);
  });
  it("requires all unique layers and clip time within duration", () => {
    const scene = initialScene(manifest);
    expect(validateSceneForAsset({ ...scene, layers: [] }, manifest)).toBe(
      false,
    );
    expect(
      validateSceneForAsset(
        {
          ...scene,
          animation: {
            ...scene.animation,
            clipId: "fixture-motion",
            timeSeconds: 3,
          },
        },
        manifest,
      ),
    ).toBe(false);
  });
  it("bounds search before database work", () => {
    expect(searchSchema.safeParse({ query: "a".repeat(121) }).success).toBe(
      false,
    );
    expect(searchSchema.safeParse({ query: "", limit: 101 }).success).toBe(
      false,
    );
  });
});
describe("viewer history and modes", () => {
  beforeEach(() => useViewer.getState().setManifest(manifest));
  it("preserves camera and selection between modes", () => {
    useViewer.getState().change({ selectedAnatomyId: "fixture" });
    const scene = useViewer.getState().scene;
    useViewer.getState().setMode("teach");
    expect(useViewer.getState().scene).toEqual(scene);
  });
  it("undoes and redoes layer changes and clears redo after a new edit", () => {
    const original = useViewer.getState().scene!;
    useViewer
      .getState()
      .change({ layers: [{ id: "fixture", opacity: 0.3, visible: true }] });
    useViewer.getState().undo();
    expect(useViewer.getState().scene).toEqual(original);
    useViewer.getState().redo();
    expect(useViewer.getState().scene?.layers[0]?.opacity).toBe(0.3);
    useViewer.getState().undo();
    useViewer.getState().change({ labels: false });
    expect(useViewer.getState().future).toHaveLength(0);
  });
  it("never autoplays restored scene and rejects foreign scene", () => {
    const scene = initialScene(manifest);
    expect(
      useViewer
        .getState()
        .restore({
          ...scene,
          animation: {
            ...scene.animation,
            clipId: "fixture-motion",
            paused: false,
          },
        }),
    ).toBe(true);
    expect(useViewer.getState().scene?.animation.paused).toBe(true);
    expect(
      useViewer.getState().restore({ ...scene, mappingVersion: 999 }),
    ).toBe(false);
  });
  it("caps history and clears all state on asset removal", () => {
    for (let n = 0; n < 70; n++)
      useViewer.getState().change({ labels: n % 2 === 0 });
    expect(useViewer.getState().past).toHaveLength(50);
    useViewer.getState().setManifest(null);
    expect(useViewer.getState().scene).toBeNull();
    expect(useViewer.getState().past).toHaveLength(0);
  });
});
