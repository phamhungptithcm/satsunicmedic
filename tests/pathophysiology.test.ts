import { describe, expect, it } from "vitest";
import { learningScenarioSchema } from "../packages/contracts/src/pathophysiology";
import { canPreviewScenario, clampTime, matchesScenario, stageAt } from "../apps/web/src/lib/pathophysiology";

function fixture() {
  return {
    id: "test", revision: 1, locale: "vi", status: "draft", title: "Nhồi máu cơ tim", englishTitle: "Myocardial infarction", aliases: ["MI", "động mạch"],
    objective: "Test", limitation: "Synthetic test fixture", duration: 20,
    stages: [
      { id: "normal", start: 0, label: "Normal", appearance: "normal", event: "Test", mechanism: "Test", consequence: "Test", sourceIds: ["source"] },
      { id: "blocked", start: 10, label: "Blocked", appearance: "occlusion", event: "Test", mechanism: "Test", consequence: "Test", sourceIds: ["source"] },
    ],
    sources: [{ id: "source", title: "Test source", url: "https://example.org/test" }],
    structures: [{ id: "vessel", label: "Test", description: "Test" }],
    quiz: { question: "Test?", options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], correctId: "yes", explanation: "Test", sourceIds: ["source"] },
  };
}

describe("learning scenario validation", () => {
  it("accepts a bounded sourced draft", () => expect(learningScenarioSchema.safeParse(fixture()).success).toBe(true));
  it.each(["duplicate-stage", "duplicate-source", "missing-source", "out-of-order", "missing-baseline", "empty-end", "missing-answer", "unsafe-url", "published", "nonfinite"])("rejects %s", kind => {
    const data = fixture();
    if (kind === "duplicate-stage") data.stages[1]!.id = "normal";
    if (kind === "duplicate-source") data.sources.push(data.sources[0]!);
    if (kind === "missing-source") data.stages[1]!.sourceIds = ["unknown"];
    if (kind === "out-of-order") data.stages[1]!.start = 0;
    if (kind === "missing-baseline") data.stages[0]!.appearance = "occlusion";
    if (kind === "empty-end") data.stages[1]!.start = 20;
    if (kind === "missing-answer") data.quiz.correctId = "unknown";
    if (kind === "unsafe-url") data.sources[0]!.url = "javascript:alert(1)";
    if (kind === "published") data.status = "published";
    if (kind === "nonfinite") data.duration = Infinity;
    expect(learningScenarioSchema.safeParse(data).success).toBe(false);
  });
});

describe("illustrative timeline", () => {
  const scenario = learningScenarioSchema.parse(fixture());
  it.each([[0, 0], [9.9, 0], [10, 1], [20, 1], [200, 1], [-1, 0], [NaN, 0]])("time %s resolves to stage %s", (time, expected) => expect(stageAt(scenario, time)).toBe(expected));
  it("ends without wrapping to healthy tissue", () => expect(clampTime(21, 20)).toBe(20));
  it.each(["nhoi mau", "MI", "myocardial", "dong mach", "", "  TIM  "])("finds %s without writing a search URL", query => expect(matchesScenario(scenario, query)).toBe(true));
  it("does not invent a stroke lesson", () => expect(matchesScenario(scenario, "đột quỵ")).toBe(false));
});

describe("draft delivery", () => {
  it.each(["production", "test", "preview", "", undefined])("denies %s", environment => expect(canPreviewScenario(environment)).toBe(false));
  it("only allows local development mode", () => expect(canPreviewScenario("development")).toBe(true));
});
