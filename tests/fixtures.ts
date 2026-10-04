import type { AssetManifest } from "../packages/contracts/src/index";
export const fixtureManifest: AssetManifest = {
  id: "a0000000-0000-4000-8000-000000000001",
  mappingVersion: 1,
  title: "SYNTHETIC TEST ONLY",
  sha256: "a".repeat(64),
  byteLength: 100,
  units: "meter",
  up: "Y",
  front: "Z",
  layers: [{ id: "fixture", label: "Synthetic layer" }],
  structures: [
    {
      meshName: "fixture",
      anatomyId: "fixture",
      layerId: "fixture",
      label: "Synthetic structure",
      laterality: "none",
    },
  ],
  clips: [
    {
      id: "fixture-motion",
      name: "fixture-motion",
      label: "Synthetic test motion",
      duration: 2,
      anatomyIds: ["fixture"],
      reviewed: true,
    },
  ],
  camera: { position: [0, 1, 3], target: [0, 1, 0], fov: 45 },
  license: {
    attribution: "Synthetic test fixture; no anatomical meaning",
    sourceUrl: "https://example.com/test",
    expiresAt: null,
    allowsPublicDisplay: true,
    allowsPublicSharing: true,
  },
  review: {
    reviewerId: "b0000000-0000-4000-8000-000000000001",
    reviewedAt: "2025-01-01T00:00:00.000Z",
    reviewDueAt: "2099-01-01T00:00:00.000Z",
    reviewedHash: "a".repeat(64),
  },
};
