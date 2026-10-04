import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { heartBindingSchema } from "../packages/contracts/src/pathophysiology";
import { FLOW_PARTICLE_RADIUS, isParticleVisible, particleFraction, preparePath, samplePath } from "../packages/anatomy-viewer/src/pathophysiology-flow";
import binding from "../apps/web/preview-assets/heart/binding.json";

describe("3D flow geometry and deterministic playback", () => {
  it("interpolates by arc length and writes into the reusable output", () => {
    const path = preparePath([[0,0,0],[2,0,0],[2,6,0]]);
    const out: [number,number,number] = [0,0,0];
    expect(samplePath(path, .5, out)).toBe(out);
    expect(out).toEqual([2,2,0]);
    expect(samplePath(path, 2, out)).toEqual([2,6,0]);
    expect(samplePath(path, NaN, out)).toEqual([0,0,0]);
  });
  it("handles repeated vertices without NaN", () => expect(samplePath(preparePath([[0,0,0],[0,0,0],[1,0,0]]), .5, [0,0,0])).toEqual([.5,0,0]));
  it("rejects missing, zero length and non-finite geometry", () => {
    expect(() => preparePath([])).toThrow();
    expect(() => preparePath([[1,1,1],[1,1,1]])).toThrow();
    expect(() => preparePath([[NaN,0,0],[1,1,1]])).toThrow();
  });
  it("seeking to the same clock yields the same particles", () => {
    const before = Array.from({length:42}, (_,i)=>particleFraction(17.5,i,42));
    Array.from({length:42}, (_,i)=>particleFraction(29,i,42));
    expect(Array.from({length:42}, (_,i)=>particleFraction(17.5,i,42))).toEqual(before);
  });
  it("removes distal LAD particles while preserving an unaffected branch", () => {
    const fractions = Array.from({length:42}, (_,i)=>particleFraction(20,i,42));
    const lad = fractions.filter(f=>isParticleVisible(f,true,.36));
    expect(lad.length).toBeGreaterThan(0);
    expect(lad.every(f=>f < .342)).toBe(true);
    expect(fractions.filter(f=>isParticleVisible(f,false,.36))).toHaveLength(42);
    expect(FLOW_PARTICLE_RADIUS).toBeLessThan(.00698);
  });
});

describe("actual preview binding integrity", () => {
  it("binds the installed binary and explicit unreviewed territory status", () => {
    const parsed = heartBindingSchema.parse(binding);
    const bytes = readFileSync(new URL("../apps/web/preview-assets/heart/heart.glb", import.meta.url));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(parsed.sha256);
    expect(bytes.length).toBe(parsed.byteLength);
    expect(parsed.territory).toBeNull();
    expect(parsed.reviewStatus).toBe("unreviewed");
  });
  it.each(["unmapped", "duplicate", "nonfinite", "zero-length", "bad-occlusion", "missing-artery"])("rejects %s scene binding", kind => {
    const changed = structuredClone(binding);
    if(kind === "unmapped") changed.flows[0]!.id = "unknown";
    if(kind === "duplicate") changed.structures.push(changed.structures[0]!);
    if(kind === "nonfinite") changed.flows[0]!.points[0]![0] = Infinity;
    if(kind === "zero-length") changed.flows[0]!.points = [[0,0,0],[0,0,0]];
    if(kind === "bad-occlusion") changed.occlusion.at = 1;
    if(kind === "missing-artery") changed.occlusion.segmentId = "rca";
    expect(heartBindingSchema.safeParse(changed).success).toBe(false);
  });
});
