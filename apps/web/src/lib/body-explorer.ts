import { fullBodyAnatomy as catalog } from './full-body-anatomy';
import bindingReceipt from '../../preview-assets/heart/binding.json';
import { medicalTerms } from './medical-english-data';
import { bodyVocabulary } from './body-vocabulary';
import { normalizeSearch, selectionIds, scopeSourceIds } from '@hs/anatomy-viewer/scene-history';
import type { HeartBinding } from '@hs/contracts';
import discovery from '../../../../scripts/free-anatomy/catalog/discovery.json';
// Never reuse partial preview groups as labels for full atlas concepts.
const curated = new Map(medicalTerms.filter(t=>t.structureId==='FMA7088').map(t=>[t.structureId!,t]));
const exactAliases = new Map(bindingReceipt.structures.map(item=>[item.sourceId,item.label]));
export function bodyLabel(id: string | null): string {
 if(!id)return 'Chọn một cấu trúc';
 if(curated.has(id))return curated.get(id)!.vietnamese;
 const translated=bodyVocabulary[id];
 if(translated&&translated.english===catalog.concepts[id]?.name)return translated.vietnamese;
 return exactAliases.get(id) ?? catalog.concepts[id]?.name ?? catalog.structures[id]?.name ?? id;
}
export const bodySearchEntries=Object.entries(catalog.concepts).map(([id,c])=>{
 const aliases=bodyVocabulary[id]?.english===c.name?bodyVocabulary[id]!.aliases??[]:[];
 const names=[bodyLabel(id),c.name,id,...aliases].map(normalizeSearch);
 return {id,label:bodyLabel(id),name:c.name,count:c.sourceIds.length,names,text:normalizeSearch(`${names.join(' ')} ${c.sourceIds.map(source=>exactAliases.get(source)??'').join(' ')}`)};
});
const majorGroups=["FMA7088","FMA50801","FMA46565","FMA7197","FMA7198","FMA7309","FMA7310","FMA7394","FMA7131","FMA7148","FMA7201","FMA7200","FMA7204","FMA7205","FMA15900","FMA13478"];
export type BodyBrowseKind = 'concepts' | 'parts' | 'gaps';
export type BodyClassification = '' | 'no-region' | 'no-system';
export const bodyCoverage = discovery.summary;
export const bodyChildren: Record<string, string[]> = discovery.children;
const sourceEntries=Object.entries(catalog.structures).map(([id,s])=>({id,label:bodyLabel(id),name:s.name,count:1,names:[normalizeSearch(s.name),normalizeSearch(id),normalizeSearch(bodyLabel(id))],text:normalizeSearch(`${s.name} ${id} ${bodyLabel(id)} ${exactAliases.get(id)??''}`)}));
const sourceGaps: {id:string;name:string;geometry:string;availableCount:number;missingCount:number}[]=discovery.gaps;
const gapEntries=sourceGaps.map(item=>({id:item.id,label:bodyLabel(item.id)===item.id?item.name:bodyLabel(item.id),name:item.name,count:item.missingCount,names:[normalizeSearch(item.name),normalizeSearch(item.id),normalizeSearch(bodyLabel(item.id))],text:normalizeSearch(`${item.name} ${item.id} ${bodyLabel(item.id)}`),geometry:item.geometry,availableCount:item.availableCount}));
export function searchBody(query:string, region:string, system:string, kind:BodyBrowseKind='concepts', parent:string|null=null, classification:BodyClassification='') {
 const scope = new Set(scopeSourceIds(catalog,region,system));
 const terms=normalizeSearch(query).split(/\s+/).filter(Boolean);
 const matches=(text:string)=>{const words=text.split(/[^a-z0-9]+/);return terms.every(t=>words.some(word=>t.length<=3?word===t:word.startsWith(t)));};
 const rank=(entry:typeof bodySearchEntries[number])=>entry.names.includes(normalizeSearch(query))?0:entry.names.some(matches)?1:2;
 const entries=kind==='parts'?sourceEntries:kind==='gaps'?gapEntries:bodySearchEntries;
 const specificity=(entry:typeof bodySearchEntries[number])=>kind==='gaps'?0:!system&&region==='all'?(entry.count>=500?1:0):selectionIds(catalog,entry.id).every(id=>scope.has(id))?0:1;
 const children=parent?new Set(bodyChildren[parent]??[]):null;
 return entries.filter(e=>(!terms.length||matches(e.text))&&(!children||children.has(e.id))&&(kind==='gaps'||selectionIds(catalog,e.id).some(id=>scope.has(id)&&(!classification||(classification==='no-region'?!catalog.structures[id]!.regions.length:!catalog.structures[id]!.systems.length)))))
 .sort((a,b)=>(terms.length?rank(a)-rank(b):0)||(majorGroups.includes(a.id)?majorGroups.indexOf(a.id):999)-(majorGroups.includes(b.id)?majorGroups.indexOf(b.id):999)||specificity(a)-specificity(b)||b.count-a.count||a.label.localeCompare(b.label)||a.id.localeCompare(b.id));
}
export const bodyPageSize=40;
export function bodyPage<T>(entries:readonly T[], requested:number) {
 const pages=Math.max(1,Math.ceil(entries.length/bodyPageSize));
 const index=Math.min(pages-1,Math.max(0,Number.isFinite(requested)?Math.floor(requested):0));
 return { entries:entries.slice(index*bodyPageSize,(index+1)*bodyPageSize),index,pages,total:entries.length,start:entries.length?index*bodyPageSize+1:0,end:Math.min(entries.length,(index+1)*bodyPageSize) };
}
export function activityBinding(selection:string|null,binding:HeartBinding):string|null {
 const ids=selectionIds(catalog,selection);
 // A group maps only to an actual overlapping source element; never coordinates or a guessed substitute.
 const match=binding.structures.find(s=>ids.includes(s.sourceId));return match?.id??null;
}
