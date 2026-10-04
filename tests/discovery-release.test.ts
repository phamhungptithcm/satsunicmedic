import { afterEach, describe, expect, it, vi } from "vitest";
import { isDiscoveryEnabled } from "../apps/web/src/lib/discovery-release";
import { canPreviewScenario } from "../apps/web/src/lib/pathophysiology";
import { canPreviewReferenceAnatomy } from "../apps/web/src/lib/reference-anatomy";
import { GET as layer } from "../apps/web/src/app/kham-pha/toan-than/asset/[layer]/route";
import { GET as reference } from "../apps/web/src/app/kham-pha/mo-hinh-tham-khao/asset/route";
import { GET as heart } from "../apps/web/src/app/hoc-tap/sinh-ly-benh/asset/route";
afterEach(() => vi.unstubAllEnvs());
describe("discovery scope", () => {
  it("retains production default and rejects ambiguous flags/environments", () => {
    for (const gate of [isDiscoveryEnabled, canPreviewScenario, canPreviewReferenceAnatomy]) {
      expect(gate("development")).toBe(true);
      expect(gate("production")).toBe(false);
      expect(gate("production", "true")).toBe(true);
      for (const flag of ["false", "1", "TRUE", " true", ""]) expect(gate("production", flag)).toBe(false);
      expect(gate("test", "true")).toBe(false);
      expect(gate(undefined, "true")).toBe(false);
    }
  });
  it("keeps all three asset endpoints closed without production opt-in", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("DISCOVERY_MODE_ENABLED", "false");
    expect((await layer(new Request("https://example.test"), {params: Promise.resolve({layer: "skin"})})).status).toBe(404);
    expect((await reference()).status).toBe(404);
    expect((await heart()).status).toBe(404);
  });
  it("rejects unknown and inherited names even with opt-in", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("DISCOVERY_MODE_ENABLED", "true");
    for (const name of ["../../heart", "__proto__", "constructor", "not-a-layer"]) {
      expect((await layer(new Request("https://example.test"), {params: Promise.resolve({layer: name})})).status).toBe(404);
    }
  });
  it("does not silently fall back to unbundled local assets in production", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("DISCOVERY_MODE_ENABLED", "true");
    // Test cwd is repository root: the curated runtime pack is intentionally absent here.
    expect((await reference()).status).toBe(404);
    expect((await heart()).status).toBe(503);
  });
});
