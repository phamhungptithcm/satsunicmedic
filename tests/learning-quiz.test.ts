import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { coronaryQuizDecks } from "../apps/web/src/lib/coronary-quiz";
import { coronaryScenarios } from "../apps/web/src/lib/coronary-scenarios";
import { answerQuestion, confirmQuestion, quizScore } from "../apps/web/src/lib/learning-quiz";

describe("source-backed question decks", () => {
  it.each(["infarction", "stenosis", "spasm"] as const)("validates every question and reference in %s", key => {
    const deck = coronaryQuizDecks[key], scenario = coronaryScenarios[key];
    expect(deck).toHaveLength(5);
    expect(new Set(deck.map(q => q.id)).size).toBe(5);
    for (const q of deck) {
      expect(q.options.filter(o => o.id === q.correctId)).toHaveLength(1);
      expect(new Set(q.options.map(o => o.id)).size).toBe(q.options.length);
      expect(q.sourceIds.length).toBeGreaterThan(0);
      expect(q.options.every(o => typeof o.label === "string" && o.label.trim().length > 0)).toBe(true);
      expect(q.sourceIds.every(id => scenario.sources.some(s => s.id === id))).toBe(true);
      expect(scenario.stages.some(s => s.id === q.stageId)).toBe(true);
    }
  });
  it("counts unanswered questions as zero in a partially completed deck", () => {
    const deck = coronaryQuizDecks.infarction;
    expect(quizScore(deck, {})).toBe(0);
    const first = deck[0]!;
    const responses = confirmQuestion(answerQuestion({}, first.id, first.correctId), first);
    expect(quizScore(deck, responses)).toBe(1);
  });
  it("does not reward an unconfirmed selection", () => {
    const q = coronaryQuizDecks.infarction[0]!;
    const selected = answerQuestion({}, q.id, q.correctId);
    expect(quizScore([q], selected)).toBe(0);
    expect(quizScore([q], confirmQuestion(selected, q))).toBe(1);
  });
  it("locks a confirmed answer during review", () => {
    const q = coronaryQuizDecks.infarction[0]!;
    const wrong = q.options.find(o => o.id !== q.correctId)!;
    const submitted = confirmQuestion(answerQuestion({}, q.id, wrong.id), q);
    expect(answerQuestion(submitted, q.id, q.correctId)).toBe(submitted);
    expect(quizScore([q], submitted)).toBe(0);
  });
  it("ignores confirmation without a valid option", () => {
    const q = coronaryQuizDecks.spasm[0]!;
    expect(confirmQuestion({}, q)).toEqual({});
    const invalid = answerQuestion({}, q.id, "invalid");
    expect(confirmQuestion(invalid, q)).toBe(invalid);
  });
  it("counts each confirmed question exactly once", () => {
    const deck = coronaryQuizDecks.stenosis;
    let responses = {};
    for (const q of deck) responses = confirmQuestion(answerQuestion(responses, q.id, q.correctId), q);
    expect(quizScore(deck, responses)).toBe(5);
    expect(quizScore(deck, confirmQuestion(responses, deck[0]!))).toBe(5);
  });
});
