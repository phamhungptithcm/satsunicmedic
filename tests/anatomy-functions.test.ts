import {describe,it,expect} from 'vitest';
import {anatomyFunctions,functionsForStructure} from '../apps/web/src/lib/anatomy-functions';
import {fullBodyAnatomy as catalog} from '../apps/web/src/lib/full-body-anatomy';
describe('source-linked anatomy function guides',()=>{
 it('resolves all participating canonical structures and their exact source membership',()=>{
  expect(new Set(anatomyFunctions.map(guide=>guide.id)).size).toBe(anatomyFunctions.length);
  for(const guide of anatomyFunctions)for(const id of guide.structures){
   expect(catalog.concepts[id]?.sourceIds.length).toBeGreaterThan(0);
   expect(functionsForStructure(catalog,id).map(item=>item.id)).toContain(guide.id);
   for(const source of catalog.concepts[id]!.sourceIds)expect(functionsForStructure(catalog,source).map(item=>item.id)).toContain(guide.id);
  }
 });
 it('does not redirect missing activities to an unrelated organ',()=>{
  expect(functionsForStructure(catalog,null)).toEqual([]);
  expect(functionsForStructure(catalog,'not-a-structure')).toEqual([]);
  expect(functionsForStructure(catalog,'FMA50801').map(item=>item.id)).toEqual(['nervous']);
  expect(functionsForStructure(catalog,'FMA7204').map(item=>item.id)).toEqual(['urine']);
 });
 it('distinguishes sourced explanations from animated or validated simulations',()=>{
  for(const guide of anatomyFunctions){
   expect(guide.representation).toBe('guided-anatomy');
   expect(new URL(guide.source.url).protocol).toBe('https:');
   expect(['www.nhlbi.nih.gov','www.niddk.nih.gov','training.seer.cancer.gov','www.niams.nih.gov']).toContain(new URL(guide.source.url).hostname);
   expect(guide.limitation.length).toBeGreaterThan(0);
   for(const level of ['general','medical','specialist'] as const)expect(guide[level].length).toBeGreaterThan(0);
  }
 });
});
