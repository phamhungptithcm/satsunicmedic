import { afterEach, describe, expect, it, vi } from "vitest";
import { canPreviewReferenceAnatomy, referenceAnatomy } from "../apps/web/src/lib/reference-anatomy";
import { GET } from "../apps/web/src/app/kham-pha/mo-hinh-tham-khao/asset/route";
import { stat, readFile } from "node:fs/promises";
vi.mock("node:fs/promises", () => ({ stat: vi.fn(), readFile: vi.fn() }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
describe("reference anatomy publication boundary", () => {
  it.each(["production", "test", undefined, "", "staging"])("rejects %s preview access", async environment => {
    expect(canPreviewReferenceAnatomy(environment)).toBe(false);
    vi.stubEnv("NODE_ENV", environment ?? "");
    expect((await GET()).status).toBe(404);
    expect(stat).not.toHaveBeenCalled();
  });
  it("fails closed when the candidate is missing", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(stat).mockRejectedValue(new Error("ENOENT"));
    expect((await GET()).status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });
  it("rejects oversized files before reading", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(stat).mockResolvedValue({ size: referenceAnatomy.byteLength + 1 } as Awaited<ReturnType<typeof stat>>);
    expect((await GET()).status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });
  it("rejects bytes whose digest does not match", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(stat).mockResolvedValue({ size: referenceAnatomy.byteLength } as Awaited<ReturnType<typeof stat>>);
    vi.mocked(readFile).mockResolvedValue(Buffer.alloc(referenceAnatomy.byteLength));
    expect((await GET()).status).toBe(404);
    expect(readFile).toHaveBeenCalled();
  });
  it("does not fabricate age variants or a medical review", () => {
    expect(canPreviewReferenceAnatomy("development")).toBe(true);
    expect(referenceAnatomy.exactAge).toBeNull();
    expect(referenceAnatomy.ageVariants).toEqual([]);
    expect(referenceAnatomy.reviewStatus).toBe("unreviewed");
  });
});
