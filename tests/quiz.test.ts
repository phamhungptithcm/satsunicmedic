import { describe, it, expect } from "vitest";
import {
  attemptSchema,
  quizQuestionsSchema,
  gradeQuiz,
} from "../packages/contracts/src/index";
const question = {
  id: "10000000-0000-4000-8000-000000000001",
  prompt: "Synthetic test: choose A",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
  correctOptionId: "a",
  explanation: "Synthetic feedback",
};
describe("quiz scoring boundary", () => {
  it("grades on the server contract and returns approved feedback", () => {
    expect(
      gradeQuiz([question], [{ questionId: question.id, optionId: "a" }]),
    ).toMatchObject({ correct: 1, total: 1 });
    expect(
      gradeQuiz([question], [{ questionId: question.id, optionId: "b" }]),
    ).toMatchObject({ correct: 0, total: 1 });
  });
  it("rejects duplicate answers and forged options", () => {
    expect(
      attemptSchema.safeParse({
        revision: 1,
        answers: [
          { questionId: question.id, optionId: "a" },
          { questionId: question.id, optionId: "b" },
        ],
      }).success,
    ).toBe(false);
    expect(() =>
      gradeQuiz([question], [{ questionId: question.id, optionId: "forged" }]),
    ).toThrow();
  });
  it("rejects malformed answer keys and duplicate options before publication", () => {
    expect(
      quizQuestionsSchema.safeParse([
        { ...question, correctOptionId: "missing" },
      ]).success,
    ).toBe(false);
    expect(
      quizQuestionsSchema.safeParse([
        { ...question, options: [question.options[0], question.options[0]] },
      ]).success,
    ).toBe(false);
  });
});
