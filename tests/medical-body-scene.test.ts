import {describe,it,expect} from 'vitest';
import { fullBodyAnatomy as model } from '../apps/web/src/lib/full-body-anatomy';
import {initialBodyScene,focusBodyScene,commitScene,replaceScene,undoScene,redoScene,selectionIds,sceneSourceIds,requiredChunks,visibleSource,selectionBounds,type SceneHistory} from '../packages/anatomy-viewer/src/scene-history';
import {searchBody,bodyLabel,activityBinding} from '../apps/web/src/lib/body-explorer';
import {heartBindingSchema} from '../packages/contracts/src/index';
import bindingReceipt from '../apps/web/preview-assets/heart/binding.json';
const history=():SceneHistory=>({past:[],present:initialBodyScene(),future:[]});
describe('identity-preserving anatomy',()=>{
 it('contains each of all2234 source-union FJ parts once, never merged anatomical IDs',()=>{
  const ids=Object.values(model.assets).flatMap(a=>a.sourceIds);expect(ids).toHaveLength(2234);expect(new Set(ids).size).toBe(2234);expect([...ids].sort()).toEqual(Object.keys(model.structures).sort());
  for(const [id,part]of Object.entries(model.structures)){expect(model.assets[part.chunk]!.sourceIds).toContain(id);for(const concept of part.concepts)expect(model.concepts[concept]!.sourceIds).toContain(id);}
 });
 it('every source group resolves real FJ geometries without duplication',()=>{for(const group of Object.values(model.concepts)){expect(new Set(group.sourceIds).size).toBe(group.sourceIds.length);expect(group.sourceIds.every(id=>!!model.structures[id])).toBe(true);}});
 it('retains full heart as group of83 source elements, not one false mesh',()=>{expect(selectionIds(model,'FMA7088')).toHaveLength(83);expect(selectionIds(model,'FJ2631')).toEqual(['FJ2631']);expect(selectionIds(model,'constructor')).toEqual([]);});
 it('keeps initial surface with no optional chunk request',()=>{expect(requiredChunks(model,initialBodyScene())).toEqual([]);});
 it('loads only needed region chunks and selected overlap, never old54MB file',()=>{const s={...initialBodyScene(),inside:true,region:'head'};const chunks=requiredChunks(model,s);expect(chunks.length).toBeGreaterThan(0);expect(chunks.length).toBeLessThan(Object.keys(model.assets).length);expect(chunks).not.toContain('internal');expect(chunks.every(k=>model.assets[k]!.byteLength<=8_000_000)).toBe(true);});
 it('heart focus loads thoracic context instead of all1258 parts',()=>{const s=focusBodyScene(model,initialBodyScene(),'FMA7088');expect(s.region).toBe('thorax');expect(s.inside).toBe(true);expect(sceneSourceIds(model,s).length).toBeLessThan(600);expect(s.camera).toBeNull();});
 it('cavity boundaries are explicitly represented and initially translucent',()=>{const cavities=Object.values(model.structures).filter(s=>s.representation==='cavity');expect(cavities.length).toBeGreaterThan(0);expect(cavities.every(s=>s.defaultOpacity===.16)).toBe(true);});
 it('isolation overrides region but keeps all pieces of selected organ',()=>{const ids=selectionIds(model,'FMA7088');expect(sceneSourceIds(model,{...initialBodyScene(),inside:true,region:'head',isolate:ids})).toEqual(ids);});
 it('hidden and zero-opacity parts cannot remain in required source set',()=>{const id='FJ2631',s={...initialBodyScene(),inside:true,isolate:[id],hidden:[id]};expect(visibleSource(id,s)).toBe(false);expect(sceneSourceIds(model,s)).toEqual([]);expect(visibleSource(id,{...s,hidden:[],opacity:{[id]:0}})).toBe(false);});
 it('bounds for heart are inside whole body, not transformed cardiac preview coordinates',()=>{const heart=selectionBounds(model,'FMA7088'),body=selectionBounds(model,'all');expect(heart[0][1]).toBeGreaterThan(body[0][1]!);expect(heart[1][1]).toBeLessThan(body[1][1]!);});
 it('ambiguous specific concepts stay visible in metadata',()=>{expect(Object.values(model.structures).some(s=>s.alternativeConcepts.length>1)).toBe(true);});
});
describe('scene transactions',()=>{
 it('selection does not move camera; focus remains explicit',()=>{const h=history();h.present.camera={position:[1,2,3],target:[0,1,0]};const next=commitScene(h,{...h.present,selected:'FMA7088'});expect(next.present.camera).toEqual(h.present.camera);expect(next.present.focus).toBe('all');});
 it('undo/redo retains exact camera, layers, selected IDs and clipping',()=>{const h=history();h.present.camera={position:[0,1,3],target:[0,1,0]};const next=commitScene(h,{...h.present,selected:'FMA7088',clipping:.42,inside:true,skinOpacity:.12,camera:{position:[0,1,.2],target:[0,1,0]}});expect(undoScene(next).present).toEqual(h.present);expect(redoScene(undoScene(next)).present).toEqual(next.present);});
 it('new action discards redo and no-op does not grow history',()=>{const h=history(),next=commitScene(h,{...h.present,inside:true}),back=undoScene(next);expect(commitScene(back,{...back.present,selected:'FJ2631'}).future).toEqual([]);expect(commitScene(h,h.present)).toBe(h);});
 it('slider replacements coalesce before one commit, copies stay immutable',()=>{const h=history(),a=replaceScene(h,{...h.present,skinOpacity:.8}),b=replaceScene(a,{...a.present,skinOpacity:.2}),end=commitScene({...b,present:h.present},b.present);expect(end.past).toHaveLength(1);expect(undoScene(end).present.skinOpacity).toBe(1);end.present.hidden.push('FJ2631');expect(h.present.hidden).toEqual([]);});
 it('bounds memory history at40 transactions',()=>{let h=history();for(let n=0;n<100;n++)h=commitScene(h,{...h.present,focusRevision:n});expect(h.past).toHaveLength(40);});
});
describe('search and activity semantics',()=>{
 it('Vietnamese accents and English heart find same source group',()=>{expect(searchBody('tim','all','').some(s=>s.id==='FMA7088')).toBe(true);expect(searchBody('heart','all','').some(s=>s.id==='FMA7088')).toBe(true);expect(bodyLabel('FMA7088')).toBe('Tim');});
 it('LAD alias is grounded in exact bound FJ2631 and not injected into unrelated groups',()=>{expect(searchBody('LAD','all','').length).toBeGreaterThan(0);expect(searchBody('LAD','all','').every(s=>selectionIds(model,s.id).includes('FJ2631'))).toBe(true);});
 it('activity requires exact overlapping source and returns no binding for skin',()=>{const binding=heartBindingSchema.parse(bindingReceipt);expect(activityBinding('FJ2631',binding)).toBe('lad');expect(activityBinding('FJ2810',binding)).toBeNull();});
 it('full lung label maps the exact atlas concept, retaining all source geometry',()=>{expect(model.concepts.FMA7309!.name).toBe('right lung');expect(bodyLabel('FMA7309')).toBe('Phổi phải');expect(selectionIds(model,'FMA7309')).toHaveLength(156);});
});
