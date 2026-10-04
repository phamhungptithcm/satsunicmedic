import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { coronaryScenarios } from "../apps/web/src/lib/coronary-scenarios";
import { heartBinding } from "../apps/web/src/lib/pathophysiology-draft";
import { referenceStructures } from "../apps/web/src/lib/structure-information";
import { coronaryVocabulary, medicalTerms } from "../apps/web/src/lib/medical-english-data";
import { stageTerms, structureTerm } from "../apps/web/src/lib/medical-english";
import { medicalQuiz } from "../apps/web/src/lib/medical-english-quiz";
import { answerQuestion, confirmQuestion, quizScore } from "../apps/web/src/lib/learning-quiz";

describe("bilingual learning in context", () => {
  it("maps all selectable preview structures without inventing unknown labels", () => {
    for (const id of [...heartBinding.structures.map(s => s.id), ...Object.keys(referenceStructures)]) {
      expect(structureTerm(medicalTerms, id)?.english).toBeTruthy();
    }
    expect(structureTerm(medicalTerms, "unknown-api-structure")).toBeUndefined();
    expect(structureTerm(medicalTerms, "FMA7309")?.english).toContain("vessels and bronchi");
    expect(structureTerm(medicalTerms, "ventricle")?.english).toBe("Ventricular wall");
  });
  it("keeps term IDs and structure IDs unique with complete source-backed pairs", () => {
    expect(new Set(medicalTerms.map(t => t.id)).size).toBe(medicalTerms.length);
    const targets = medicalTerms.flatMap(t => t.structureId ? [t.structureId] : []);
    expect(new Set(targets).size).toBe(targets.length);
    for (const term of medicalTerms) {
      expect([term.english, term.vietnamese, term.meaning, term.example, term.translation, term.source.title].every(value => value.trim().length > 0)).toBe(true);
      expect(new URL(term.source.url).protocol).toBe("https:");
    }
  });
  it.each(Object.values(coronaryScenarios))("covers every stage with valid terms for $id", scenario => {
    for (const stage of scenario.stages) {
      const terms = stageTerms(medicalTerms, coronaryVocabulary, scenario, stage.id);
      expect(terms.length).toBeGreaterThan(0);
      expect(terms.map(t => t.id)).toEqual(coronaryVocabulary[scenario.id]![stage.id]);
    }
    expect(Object.keys(coronaryVocabulary[scenario.id]!)).toEqual(scenario.stages.map(s => s.id));
  });
  it("uses baseline vocabulary during comparison, never injury or spasm", () => {
    for (const scenario of Object.values(coronaryScenarios)) {
      const compared = stageTerms(medicalTerms, coronaryVocabulary, scenario, scenario.stages.at(-1)!.id, true);
      expect(compared.map(t => t.id)).toEqual(["coronary-artery", "blood-flow"]);
    }
    expect(stageTerms(medicalTerms, coronaryVocabulary, coronaryScenarios.spasm, "spasm").map(t => t.id)).not.toContain("thrombus");
  });
  it("fails safely for missing scenarios, stages, translations and quiz data", () => {
    expect(stageTerms(medicalTerms, coronaryVocabulary, { ...coronaryScenarios.spasm, id: "unknown" }, "baseline")).toEqual([]);
    expect(stageTerms(medicalTerms, coronaryVocabulary, coronaryScenarios.spasm, "unknown")).toEqual([]);
    expect(stageTerms([], coronaryVocabulary, coronaryScenarios.spasm, "baseline")).toEqual([]);
    expect(medicalQuiz([], coronaryVocabulary, coronaryScenarios.spasm)).toEqual([]);
    expect(medicalQuiz([medicalTerms.find(t => t.id === "blood-flow")!], coronaryVocabulary, coronaryScenarios.spasm)).toEqual([]);
  });
  it.each(Object.values(coronaryScenarios))("has two directions, unique answers, sources and valid observe targets for $id", scenario => {
    const questions = medicalQuiz(medicalTerms, coronaryVocabulary, scenario);
    expect(new Set(questions.map(q => q.kind)).size).toBe(2);
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(scenario.stages.some(stage => stage.id === q.stageId)).toBe(true);
      expect(q.options.filter(option => option.id === q.correctId)).toHaveLength(1);
      expect(new Set(q.options.map(o => o.label)).size).toBe(q.options.length);
      expect(q.options.length).toBeGreaterThan(1);
      expect(q.sourceIds.every(id => medicalTerms.some(t => t.source.id === id))).toBe(true);
      expect(q.optionsLanguage).not.toBe(q.promptLanguage);
      const selected = answerQuestion({}, q.id, q.correctId);
      expect(quizScore(questions, selected)).toBe(0);
      const confirmed = confirmQuestion(selected, q);
      expect(quizScore(questions, confirmed)).toBe(1);
      expect(answerQuestion(confirmed, q.id, "wrong")).toBe(confirmed);
      expect(quizScore([{ ...scenario.quiz, id: "core", kind: "core" }], confirmed)).toBe(0);
    }
  });
});
