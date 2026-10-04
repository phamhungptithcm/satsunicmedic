import type { LearningScenario } from "@hs/contracts";

export type MedicalTerm = {
  id: string;
  english: string;
  vietnamese: string;
  meaning: string;
  example: string;
  translation: string;
  source: { id: string; title: string; url: string };
  structureId?: string;
};
export type StageVocabulary = Record<string, Record<string, readonly string[]>>;

export function structureTerm(terms: readonly MedicalTerm[], structureId: string) {
  return terms.find(term => term.structureId === structureId);
}

export function stageTerms(terms: readonly MedicalTerm[], vocabulary: StageVocabulary, scenario: LearningScenario, stageId: string, compare = false) {
  const visibleStage = compare ? scenario.stages[0]?.id : stageId;
  if (!visibleStage || !scenario.stages.some(stage => stage.id === visibleStage)) return [];
  const ids = vocabulary[scenario.id]?.[visibleStage] ?? [];
  return ids.flatMap(id => { const term = terms.find(item => item.id === id); return term ? [term] : []; });
}
