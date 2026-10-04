import type { SimulationVariant } from "./simulation-catalog";
import { normalizeTerm } from "./pathophysiology";

export type Disease = {
  id: string; title: string; english: string; system: string; organ: string;
  summary: string; mechanism: readonly string[]; distinction: string;
  source: { title: string; url: string }; simulation: SimulationVariant | null;
};
export function filterDiseases(items: readonly Disease[], query: string, system: string, simulated: boolean) {
  const terms = normalizeTerm(query).split(/\s+/);
  return items.filter(item => (!system || item.system === system) && (!simulated || item.simulation !== null) && terms.every(term => normalizeTerm([item.title, item.english, item.system, item.organ, item.summary].join(" ")).includes(term)));
}
