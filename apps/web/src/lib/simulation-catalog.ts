import type { Disease } from './disease-catalog';

export const learningLevels = [
 {id:'general',label:'Phổ thông'},
 {id:'medical',label:'Sinh viên y'},
 {id:'specialist',label:'Chuyên khoa'},
] as const;
export type LearningLevel = typeof learningLevels[number]['id'];
export const existingLessonDepth: Record<LearningLevel,'draft'|'not-authored'> = {general:'draft',medical:'draft',specialist:'not-authored'};

export type SimulationVariant = 'infarction' | 'stenosis' | 'spasm';
export const simulationCapabilities: Record<SimulationVariant, {
 anatomy: 'FMA7088'; representation: 'qualitative-flow'; clinicalReview: 'unreviewed';
}> = {
 infarction:{anatomy:'FMA7088',representation:'qualitative-flow',clinicalReview:'unreviewed'},
 stenosis:{anatomy:'FMA7088',representation:'qualitative-flow',clinicalReview:'unreviewed'},
 spasm:{anatomy:'FMA7088',representation:'qualitative-flow',clinicalReview:'unreviewed'},
};

/** Inventory is derived from real lessons; text descriptions never count as simulations. */
export function simulationCoverage(diseases: readonly Disease[]) {
 return diseases.map(disease=>({
  diseaseId:disease.id,title:disease.title,system:disease.system,organ:disease.organ,
  source:disease.source,
  simulationId:disease.simulation,
  status:disease.simulation?'implemented-unreviewed' as const:'not-implemented' as const,
  anatomyId:disease.simulation?simulationCapabilities[disease.simulation].anatomy:null,
  mappingStatus:disease.simulation?'source-linked' as const:'pending' as const,
  clinicalReview:'unreviewed' as const,
  learningLevels:disease.simulation?{...existingLessonDepth}:{general:'not-authored' as const,medical:'not-authored' as const,specialist:'not-authored' as const},
 }));
}
