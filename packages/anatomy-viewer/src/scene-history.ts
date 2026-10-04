import type { BodySections } from './body-sections';
/** Serializable, asset-version-bound scene state; no renderer objects or patient data. */
export type BodyBounds = readonly [readonly number[], readonly number[]];
export type CameraPose = { position: number[]; target: number[] };
export type BodyAsset = { sha256: string; byteLength: number; bounds: BodyBounds; sourceIds: string[]; meshCount: number };
export type BodyStructure = { representation: 'cavity'|'surface'; defaultOpacity: number; name: string; alternativeConcepts: string[]; concepts: string[]; regions: string[]; systems: string[]; chunk: string; bounds: BodyBounds; triangles: number; color: string };
export type BodyCatalog = { version: string; reviewStatus: string; sourceParts: number; triangles: number; assets: Record<string, BodyAsset>; regions: Record<string, {concept: string; label: string; bounds: BodyBounds; sourceIds: string[]}>; systems: Record<string, {label: string; sourceIds: string[]}>; structures: Record<string, BodyStructure>; concepts: Record<string, {name: string; sourceIds: string[]}> };
export type BodyScene = {
  system?: string; query?: string;
  region: string; selected: string | null; inside: boolean; skinOpacity: number;
  hidden: string[]; opacity: Record<string, number>; isolate: string[] | null;
  clipping: number | null; sections?: BodySections; camera: CameraPose | null; view: 'front' | 'back' | 'left' | 'right';
  zoom: number; focus: string; focusRevision: number; labels: boolean;
};
export const initialBodyScene = (): BodyScene => ({system:'',query:'',region:'all',selected:null,inside:false,skinOpacity:1,hidden:[],opacity:{},isolate:null,clipping:null,camera:null,view:'front',zoom:0,focus:'all',focusRevision:0,labels:true});
export type SceneHistory = {past: BodyScene[]; present: BodyScene; future: BodyScene[]};
const clone = (scene: BodyScene): BodyScene => structuredClone(scene);
export function commitScene(history: SceneHistory, scene: BodyScene): SceneHistory {
  if(JSON.stringify(history.present)===JSON.stringify(scene)) return history;
  return {past:[...history.past.slice(-39),clone(history.present)],present:clone(scene),future:[]};
}
export function replaceScene(history: SceneHistory, scene: BodyScene): SceneHistory { return {...history,present:clone(scene)}; }
export function undoScene(history: SceneHistory): SceneHistory {
  const previous=history.past.at(-1); return previous?{past:history.past.slice(0,-1),present:clone(previous),future:[clone(history.present),...history.future]}:history;
}
export function redoScene(history: SceneHistory): SceneHistory {
  const next=history.future[0];return next?{past:[...history.past,clone(history.present)],present:clone(next),future:history.future.slice(1)}:history;
}
export function selectionIds(catalog: BodyCatalog, selection: string | null): string[] {
  if(!selection)return [];
  if(Object.hasOwn(catalog.structures,selection))return [selection];
  return Object.hasOwn(catalog.concepts,selection)?catalog.concepts[selection]!.sourceIds:[];
}
export function visibleSource(id: string, scene: BodyScene): boolean {
 return !scene.hidden.includes(id) && (scene.opacity[id]??1)>0 && (!scene.isolate || scene.isolate.includes(id));
}
export function sceneSourceIds(catalog: BodyCatalog, scene: BodyScene): string[] {
 if(!scene.inside)return [];
 const base=scene.isolate??scopeSourceIds(catalog,scene.region,scene.system??'');
 return [...new Set([...base,...selectionIds(catalog,scene.selected)])].filter(id=>id!=='FJ2810'&&visibleSource(id,scene));
}
export function requiredChunks(catalog: BodyCatalog, scene: BodyScene): string[] {
 return [...new Set(sceneSourceIds(catalog,scene).map(id=>catalog.structures[id]!.chunk))];
}
export function selectionBounds(catalog: BodyCatalog, id: string): BodyBounds {
 if(id==='all')return catalog.assets.skin!.bounds;
 if(catalog.regions[id])return catalog.regions[id]!.bounds;
 const entries=selectionIds(catalog,id).map(key=>catalog.structures[key]!.bounds);
 if(!entries.length)return catalog.assets.skin!.bounds;
 return [[0,1,2].map(i=>Math.min(...entries.map(b=>b[0][i]!))),[0,1,2].map(i=>Math.max(...entries.map(b=>b[1][i]!)))];
}
export function normalizeSearch(value:string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim(); }
/** Focus a source structure with its known regional context, never implicitly load the whole atlas. */
export function focusBodyScene(catalog:BodyCatalog, scene:BodyScene, id:string):BodyScene {
 const counts=new Map<string,number>();
 for(const source of selectionIds(catalog,id))for(const region of catalog.structures[source]!.regions)counts.set(region,(counts.get(region)??0)+1);
 const primary=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
 return {...scene,region:primary??scene.region,inside:id!=='FJ2810',skinOpacity:.12,focus:id,focusRevision:scene.focusRevision+1,camera:null};
}

/** Exact source intersection, shared by scope display and discovery. */
export function scopeSourceIds(catalog: BodyCatalog, region: string, system: string): string[] {
 const ids = region === 'all' ? Object.keys(catalog.structures) : catalog.regions[region]?.sourceIds ?? [];
 const members = system ? new Set(catalog.systems[system]?.sourceIds ?? []) : null;
 return ids.filter(id => !members || members.has(id));
}
export function sceneBounds(catalog: BodyCatalog, scene: BodyScene): BodyBounds {
 if (scene.focus !== '@scope') return selectionBounds(catalog, scene.focus);
 const bounds = sceneSourceIds(catalog, scene).map(id => catalog.structures[id]!.bounds);
 if (!bounds.length) return selectionBounds(catalog, scene.region);
 return [[0,1,2].map(i=>Math.min(...bounds.map(b=>b[0][i]!))),[0,1,2].map(i=>Math.max(...bounds.map(b=>b[1][i]!)))];
}
