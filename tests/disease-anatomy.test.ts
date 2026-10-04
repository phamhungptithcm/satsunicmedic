import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {diseaseAnatomy,anatomyForDisease,mechanismStep} from '../apps/web/src/lib/disease-anatomy';
import {fullBodyAnatomy} from '../apps/web/src/lib/full-body-anatomy';
import {selectionIds} from '../packages/anatomy-viewer/src/scene-history';
describe('disease anatomical context',()=>{
 it('covers catalog topics explicitly and resolves every context to real source meshes',()=>{
  const source=readFileSync('apps/web/src/lib/disease-catalog-data.ts','utf8');
  const ids=[...source.matchAll(/"id": "([^"]+)"/g)].map(m=>m[1]);
  expect(Object.keys(diseaseAnatomy).sort()).toEqual(ids.sort());
  for(const parts of Object.values(diseaseAnatomy))for(const id of parts)expect(selectionIds(fullBodyAnatomy,id).length,id).toBeGreaterThan(0);
 });
 it('does not substitute thyroid cartilage, nearby organs, or unknown IDs',()=>{
  expect(anatomyForDisease('hyperthyroidism')).toEqual([]);expect(anatomyForDisease('hypothyroidism')).toEqual([]);
  expect(anatomyForDisease('constructor')).toEqual([]);expect(anatomyForDisease('unknown')).toEqual([]);
  expect(anatomyForDisease('asthma')).toEqual(['FMA7395']);expect(anatomyForDisease('gallstones')).toEqual(['FMA7202']);
 });
 it('keeps manual reading steps bounded, including empty mechanisms',()=>{
  expect(mechanismStep(0,-1,3)).toBe(0);expect(mechanismStep(2,1,3)).toBe(2);expect(mechanismStep(0,1,3)).toBe(1);expect(mechanismStep(0,1,0)).toBe(0);
 });
});
