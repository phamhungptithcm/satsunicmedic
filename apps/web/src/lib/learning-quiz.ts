import type { LearningScenario } from "@hs/contracts";
export type QuizQuestion = LearningScenario["quiz"] & { id: string; kind: string; stageId?: string };
export type QuizResponse = { optionId: string; confirmed: boolean };
export function quizScore(questions: readonly QuizQuestion[], responses: Record<string, QuizResponse>) {
  return questions.reduce((total, q) => total + Number(responses[q.id]?.confirmed === true && responses[q.id]?.optionId === q.correctId), 0);
}
export function answerQuestion(responses: Record<string, QuizResponse>, id: string, optionId: string) {
  return responses[id]?.confirmed ? responses : { ...responses, [id]: { optionId, confirmed: false } };
}
export function confirmQuestion(responses: Record<string, QuizResponse>, question: QuizQuestion) {
  const response = responses[question.id];
  if (!response || !question.options.some(o => o.id === response.optionId)) return responses;
  return { ...responses, [question.id]: { ...response, confirmed: true } };
}
