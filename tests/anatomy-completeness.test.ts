import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fullBodyAnatomy as catalog } from '../apps/web/src/lib/full-body-anatomy';
import { bodyPage, bodyChildren, searchBody } from '../apps/web/src/lib/body-explorer';
import { selectionIds } from '../packages/anatomy-viewer/src/scene-history';
import { initialBodyScene, sceneSourceIds } from '../packages/anatomy-viewer/src/scene-history';
import { nearbyBodyStructure } from '../apps/web/src/lib/body-explorer-ux';
import { buildCoverage, validateHierarchy, parseTable } from '../scripts/free-anatomy/coverage-audit.mjs';
import coverage from '../scripts/free-anatomy/catalog/coverage.json';

describe('complete discovery of imported anatomy', () => {
  it.each(['concepts','parts'] as const)('pages through every %s identity exactly once', kind=>{
    const entries=searchBody('','all','',kind);
    const collected=Array.from({length:bodyPage(entries,0).pages},(_,index)=>bodyPage(entries,index).entries).flat();
    expect(collected.map(item=>item.id)).toEqual(entries.map(item=>item.id));
    expect(new Set(collected.map(item=>item.id)).size).toBe(entries.length);
    expect(entries.map(item=>item.id).sort()).toEqual(Object.keys(kind==='parts'?catalog.structures:catalog.concepts).sort());
    expect(entries.every(entry=>selectionIds(catalog,entry.id).length>0)).toBe(true);
  });
  it('search results beyond 60 remain reachable', ()=>{
    const entries=searchBody('artery','all','');
    expect(entries.length).toBeGreaterThan(60);
    expect(bodyPage(entries,1).entries.some(entry=>entries.indexOf(entry)>=60)).toBe(true);
  });
  it('retains broad groups of 500+ source parts and region concepts', ()=>{
    for (const [id,value] of Object.entries(catalog.concepts)) if(value.sourceIds.length>=500) expect(searchBody(id,'all','')[0]?.id).toBe(id);
    for (const region of Object.values(catalog.regions)) expect(searchBody(region.concept,'all','')[0]?.id).toBe(region.concept);
  });
  it('provides a path to every unclassified geometry', ()=>{
    for (const [filter,field] of [['no-region','regions'],['no-system','systems']] as const) {
      expect(searchBody('','all','','parts',null,filter).map(item=>item.id).sort()).toEqual(Object.entries(catalog.structures).filter(([,s])=>!s[field].length).map(([id])=>id).sort());
    }
  });
  it('never loads the full atlas or hides an unassigned source when nearby is unavailable', ()=>{
    const id=Object.keys(catalog.structures).find(key=>!catalog.structures[key]!.regions.length && key!=='FJ2810')!;
    const next=nearbyBodyStructure(catalog,initialBodyScene(),id);
    expect(next.selected).toBe(id);
    expect(next.inside).toBe(true);
    expect(sceneSourceIds(catalog,next)).toEqual([id]);
  });
  it('drills only source part-of children, not inferred subsets or IS-A classes', ()=>{
    for(const parent of ['FMA7088','FMA7309','FMA7197']) expect(searchBody('','all','','concepts',parent).map(item=>item.id).sort()).toEqual([...bodyChildren[parent]!].sort());
    expect(searchBody('','all','','concepts','absent')).toEqual([]);
  });
  it('exposes imported teeth and keeps source gaps distinct from whole-body completeness', ()=>{
    expect(searchBody('tooth','all','').length).toBeGreaterThan(0);
    expect(searchBody('','all','FMA12516','parts')).toHaveLength(28);
    expect(coverage.completeness).toBe('unknown');
    expect(searchBody('tooth','head','FMA23881','gaps')).toEqual(searchBody('tooth','all','','gaps'));
  });
  it('clamps invalid pages and represents empty results accurately', ()=>{
    expect(bodyPage([],100)).toMatchObject({index:0,pages:1,total:0,start:0,end:0});
    expect(bodyPage([1,2],-20).entries).toEqual([1,2]);
    expect(bodyPage([1],NaN).index).toBe(0);
  });
});

describe('coverage provenance and corruption checks', ()=>{
  it('has a current catalog hash and reproducible source receipts', async()=>{
    const bytes=await readFile('apps/web/src/lib/full-body-anatomy.ts');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(coverage.catalogSha256);
    for(const file of coverage.provenance){
      const bytes=await readFile(`scripts/free-anatomy/catalog/${file.file}`);
      expect(bytes.length).toBe(file.byteLength);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
    }
    expect(coverage.completeness).toBe('unknown');
    expect(coverage.missingSourceIds).toHaveLength(0);
    const expectedIds=new Set(coverage.records.flatMap(record=>record.expected));
    expect([...expectedIds].sort()).toEqual(Object.keys(catalog.structures).sort());
  });
  it('rejects cycles, duplicate edges, and missing endpoints', ()=>{
    expect(()=>validateHierarchy([['a','b'],['b','a']],{a:{},b:{}})).toThrow('cycle');
    expect(()=>validateHierarchy([['a','b'],['a','b']],{a:{},b:{}})).toThrow('Duplicate');
    expect(()=>validateHierarchy([['a','missing']],{a:{}})).toThrow('Orphan');
    expect(()=>parseTable('a\tb\n1\n',['a','b'])).toThrow('row');
  });
  it('does not turn partial expected geometry into complete anatomy', ()=>{
    const report=buildCoverage(catalog,{FMA999999:{name:'test fixture',sourceIds:['FJ2631','FJ999999']}},[]);
    expect(report.records[0]).toMatchObject({geometry:'partial',medicalReview:'not-reviewed',detail:'not-audited',activity:'not-audited'});
    expect(report.completeness).toBe('unknown');
  });
  it('rejects orphan/duplicate mesh identities and broken mappings', ()=>{
    const broken=structuredClone(catalog);broken.assets.skin!.sourceIds.push('FJ2810');
    expect(()=>buildCoverage(broken,{},[])).toThrow('identity');
    const brokenMapping=structuredClone(catalog);brokenMapping.concepts.FMA7088!.sourceIds.push('FJ999999');
    expect(()=>buildCoverage(brokenMapping,{},[])).toThrow('sources');
  });
});
