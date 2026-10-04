import { afterEach, describe, expect, it, vi } from "vitest";
import { stat, readFile } from "node:fs/promises";
import { fullBodyAnatomy as model } from "../apps/web/src/lib/full-body-anatomy";
import { GET } from "../apps/web/src/app/kham-pha/toan-than/asset/[layer]/route";
vi.mock("node:fs/promises", () => ({ stat: vi.fn(), readFile: vi.fn() }));
const get = (layer: string) => GET(new Request("http://localhost/"), { params: Promise.resolve({ layer }) });
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
describe("full body candidate access", () => {
    it.each(["production", "test", ""])("rejects %s before filesystem access", async (env) => { vi.stubEnv("NODE_ENV", env); expect((await get("skin")).status).toBe(404); expect(stat).not.toHaveBeenCalled(); });
    it.each(["../skin", "toString", "constructor", ""])("rejects invalid layer %s", async (layer) => { vi.stubEnv("NODE_ENV", "development"); expect((await get(layer)).status).toBe(404); expect(stat).not.toHaveBeenCalled(); });
    it("rejects missing files", async () => { vi.stubEnv("NODE_ENV", "development"); vi.mocked(stat).mockRejectedValue(Error("missing")); expect((await get("skin")).status).toBe(404); expect(readFile).not.toHaveBeenCalled(); });
    it("checks file size before reading", async () => { vi.stubEnv("NODE_ENV", "development"); vi.mocked(stat).mockResolvedValue({ size: model.assets.skin!.byteLength + 1 } as Awaited<ReturnType<typeof stat>>); expect((await get("skin")).status).toBe(404); expect(readFile).not.toHaveBeenCalled(); });
    it("checks exact content digest", async () => { vi.stubEnv("NODE_ENV", "development"); vi.mocked(stat).mockResolvedValue({ size: model.assets.skin!.byteLength } as Awaited<ReturnType<typeof stat>>); vi.mocked(readFile).mockResolvedValue(Buffer.alloc(model.assets.skin!.byteLength)); expect((await get("skin")).status).toBe(404); });
    it("covers whole body and limbs without implying review", () => { expect(model.reviewStatus).toBe("unreviewed"); const [low, high] = model.assets.skin!.bounds; expect(high[1]! - low[1]!).toBeGreaterThan(1.7); expect(model.regions.head!.bounds[0][1]).toBeGreaterThan(1.4); expect(model.regions["left-leg"]!.bounds[0][1]).toBeLessThan(0); expect(Object.keys(model.regions)).toHaveLength(9); });
});
