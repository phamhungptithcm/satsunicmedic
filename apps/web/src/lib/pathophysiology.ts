import { isDiscoveryEnabled } from "./discovery-release";
import type { LearningScenario } from "@hs/contracts";

export function clampTime(time: number, duration: number) {
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, Math.min(time, duration));
}

export function stageAt(scenario: LearningScenario, time: number) {
  const bounded = clampTime(time, scenario.duration);
  for (let index = scenario.stages.length - 1; index >= 0; index--) {
    if (scenario.stages[index]!.start <= bounded) return index;
  }
  return 0;
}

export function normalizeTerm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
}

export function matchesScenario(scenario: LearningScenario, query: string) {
  const searchable = normalizeTerm([scenario.title, scenario.englishTitle, ...scenario.aliases].join(" "));
  return normalizeTerm(query).split(/\s+/).every(term => searchable.includes(term));
}

export function canPreviewScenario(environment: string | undefined, discoveryFlag?: string) {
  return isDiscoveryEnabled(environment, discoveryFlag);
}
