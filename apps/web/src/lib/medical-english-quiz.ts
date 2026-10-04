import type { LearningScenario } from "@hs/contracts";
import type { QuizQuestion } from "./learning-quiz";
import { stageTerms, type MedicalTerm, type StageVocabulary } from "./medical-english";

export type MedicalQuizQuestion = QuizQuestion & { promptTerm: string; promptLanguage: "en" | "vi"; optionsLanguage: "en" | "vi" };

export function medicalQuiz(terms: readonly MedicalTerm[], vocabulary: StageVocabulary, scenario: LearningScenario): MedicalQuizQuestion[] {
  const seen = new Set<string>();
  const entries = scenario.stages.flatMap(stage => stageTerms(terms, vocabulary, scenario, stage.id).flatMap(term => {
    if (seen.has(term.id)) return [];
    seen.add(term.id);
    return [{ term, stageId: stage.id }];
  }));
  if (entries.length < 2) return [];
  return entries.map(({ term, stageId }, index) => {
    const toVietnamese = index % 2 === 0;
    const language = toVietnamese ? "vietnamese" : "english";
    const alternatives = entries.filter(item => item.term.id !== term.id && item.term[language] !== term[language]).slice(0, 2).map(item => item.term);
    const options = [...alternatives];
    options.splice(index % (options.length + 1), 0, term);
    return {
      id: `medical-${term.id}`, kind: toVietnamese ? "Anh → Việt" : "Việt → Anh", stageId,
      question: toVietnamese ? "Trong bài này, thuật ngữ sau có nghĩa là gì?" : "Chọn thuật ngữ tiếng Anh tương ứng.",
      promptTerm: toVietnamese ? term.english : term.vietnamese, promptLanguage: toVietnamese ? "en" : "vi", optionsLanguage: toVietnamese ? "vi" : "en",
      options: options.map(item => ({ id: item.id, label: item[language] })), correctId: term.id,
      explanation: `${term.english} — ${term.vietnamese}. ${term.meaning}`, sourceIds: [term.source.id],
    };
  });
}
