import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Disease } from '../apps/web/src/lib/disease-catalog';
import { simulationCoverage,simulationCapabilities,learningLevels } from '../apps/web/src/lib/simulation-catalog';
import { fullBodyAnatomy } from '../apps/web/src/lib/full-body-anatomy';
const source=readFileSync('apps/web/src/lib/disease-catalog-data.ts','utf8');
const diseases=JSON.parse(source.slice(source.indexOf('['),source.indexOf(' satisfies Disease[]'))) as Disease[];
describe('simulation coverage truthfulness',()=>{
 it('keeps every disease including the unimplemented topics',()=>{
  const rows=simulationCoverage(diseases);
  expect(rows).toHaveLength(27);
  expect(rows.filter(r=>r.status==='not-implemented')).toHaveLength(24);
  expect(rows.every(r=>r.clinicalReview==='unreviewed')).toBe(true);
  expect(rows.filter(r=>r.status==='not-implemented').every(r=>r.anatomyId===null&&r.mappingStatus==='pending')).toBe(true);
 });
 it('tracks all three audiences without marking missing specialist content as implemented',()=>{
  expect(learningLevels.map(level=>level.id)).toEqual(['general','medical','specialist']);
  const rows=simulationCoverage(diseases);
  expect(rows.every(row=>row.learningLevels.specialist==='not-authored')).toBe(true);
  expect(rows.filter(row=>row.simulationId).every(row=>row.learningLevels.medical==='draft'&&row.learningLevels.general==='draft')).toBe(true);
  expect(rows.filter(row=>!row.simulationId).every(row=>Object.values(row.learningLevels).every(status=>status==='not-authored'))).toBe(true);
 });
 it('resolves every implemented capability to canonical anatomy',()=>{
  for(const row of Object.values(simulationCapabilities))expect(fullBodyAnatomy.concepts[row.anatomy]?.sourceIds.length).toBeGreaterThan(0);
 });
});
