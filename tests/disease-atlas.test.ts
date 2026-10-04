import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { diseases } from "../apps/web/src/lib/disease-catalog-data";
import { filterDiseases } from "../apps/web/src/lib/disease-catalog";
import { coronaryScenarios } from "../apps/web/src/lib/coronary-scenarios";
import { coronaryFlowState } from "../packages/anatomy-viewer/src/pathophysiology-flow";

describe("source-backed atlas coverage", () => {
  it("has unique IDs, real source hosts, and mechanisms for every entry", () => {
    expect(new Set(diseases.map(d => d.id)).size).toBe(diseases.length);
    expect(diseases.length).toBe(27);
    for (const d of diseases) {
      const url = new URL(d.source.url);
      expect(url.protocol).toBe("https:");
      expect(["www.nhlbi.nih.gov", "www.niddk.nih.gov", "www.ninds.nih.gov", "www.niams.nih.gov"]).toContain(url.hostname);
      expect(d.mechanism).toHaveLength(3);
      if (d.simulation) expect(coronaryScenarios[d.simulation].id).toBe(d.id);
    }
  });
  it("only exposes coronary simulations with matching scenarios", () => {
    const ready = filterDiseases(diseases, "", "", true);
    expect(ready).toHaveLength(3);
    expect(ready.every(d => d.organ === "Tim")).toBe(true);
    expect(filterDiseases(diseases, "", "Thần kinh", true)).toHaveLength(0);
  });
  it.each(["dot quy", "ĐỘT QUỴ", "stroke"])("finds both stroke mechanisms for %s", query => expect(filterDiseases(diseases, query, "", false)).toHaveLength(2));
  it("combines terms, organ and capability filters", () => {
    expect(filterDiseases(diseases, "mach vanh", "Tim mạch", true)).toHaveLength(2);
    expect(filterDiseases(diseases, "COPD", "Hô hấp", false)[0]?.id).toBe("copd");
    expect(filterDiseases(diseases, "no-such-disease", "", false)).toHaveLength(0);
  });
});
describe("distinct coronary mechanisms", () => {
  it("stenosis never becomes a complete obstruction", () => {
    expect(coronaryScenarios.stenosis.stages.some(s => s.appearance === "occlusion")).toBe(false);
    expect(coronaryFlowState(16, false, true, Infinity, 16)).toEqual({ blocked: false, narrowed: true });
  });
  it("spasm stops and recovers exactly at its stage boundaries", () => {
    for (const [time, blocked] of [[7.99, false], [8, true], [15.99, true], [16, false], [24, false]] as const) {
      expect(coronaryFlowState(time, false, true, 8, Infinity, 16).blocked).toBe(blocked);
    }
    expect(coronaryScenarios.spasm.stages.at(-1)?.appearance).toBe("normal");
  });
  it("comparison and unaffected branches retain flow", () => {
    expect(coronaryFlowState(10, true, true, 8).blocked).toBe(false);
    expect(coronaryFlowState(10, false, false, 8).blocked).toBe(false);
    expect(coronaryFlowState(18, false, false, Infinity, 16).narrowed).toBe(false);
  });
  it("infarction does not recover at the end", () => expect(coronaryFlowState(32, false, true, 16).blocked).toBe(true));
});
