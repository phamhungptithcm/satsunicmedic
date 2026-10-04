import type { BodyCatalog } from '../../packages/anatomy-viewer/src/scene-history';
export function parseTable(text: string, required: string[]): Record<string,string>[];
export function validateHierarchy(edges: string[][], concepts: Record<string,unknown>): Record<string,string[]>;
export function buildCoverage(catalog: BodyCatalog, expected: Record<string,{name:string;sourceIds:string[]}>, edges:string[][]): {
  version:string;catalogVersion:string;completeness:'unknown';scope:string;
  sourceStructures:number;sourceConcepts:number;expectedSourceStructures:number;
  unassignedSystem:string[];unassignedRegion:string[];missingSourceIds:string[];
  children:Record<string,string[]>;
  records:{id:string;name:string;expected:string[];available:string[];missing:string[];geometry:'available'|'partial'|'missing';medicalReview:'not-reviewed';detail:'not-audited';activity:'not-audited'}[];
};
