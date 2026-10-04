import { describe,it,expect,vi,afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fullBodyAnatomy as catalog } from '../apps/web/src/lib/full-body-anatomy';
import binding from '../apps/web/preview-assets/heart/binding.json';
import { atlasToHeart,canonicalHeartIds,loadCanonicalHeart } from '../packages/anatomy-viewer/src/canonical-heart';
import { heartBindingSchema } from '../packages/contracts/src/pathophysiology';
const parsed=heartBindingSchema.parse(binding);
function positions(file:string){
 const bytes=readFileSync(file),jsonLength=bytes.readUInt32LE(12);
 const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 const binary=bytes.subarray(28+jsonLength);
 return new Map<string,number[][]>(gltf.nodes.filter((n:{mesh?:number})=>n.mesh!==undefined).map((node:{name:string;mesh:number})=>{
  const accessor=gltf.accessors[gltf.meshes[node.mesh].primitives[0].attributes.POSITION],view=gltf.bufferViews[accessor.bufferView];
  const start=(view.byteOffset??0)+(accessor.byteOffset??0),stride=view.byteStride??12;
  const vertices=Array.from({length:accessor.count},(_,i)=>[0,1,2].map(axis=>binary.readFloatLE(start+i*stride+axis*4)));
  const indexId=gltf.meshes[node.mesh].primitives[0].indices;
  if(indexId===undefined)return [node.name,vertices];
  const indices=gltf.accessors[indexId],iv=gltf.bufferViews[indices.bufferView],offset=(iv.byteOffset??0)+(indices.byteOffset??0);
  const size=indices.componentType===5125?4:indices.componentType===5123?2:1;
  return [node.name,Array.from({length:indices.count},(_,i)=>vertices[binary.readUIntLE(offset+i*size,size)]!)];
 }));
}
describe('canonical lesson registration',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it('uses the complete atlas heart and explicitly bound neighboring vessels',()=>{
  const ids=canonicalHeartIds(catalog,parsed);
  expect(new Set(ids).size).toBe(ids.length);
  expect(catalog.concepts.FMA7088!.sourceIds.every(id=>ids.includes(id))).toBe(true);
  expect(parsed.structures.every(s=>ids.includes(s.sourceId))).toBe(true);
 });
 it('fails closed when a scenario source cannot be resolved',()=>{
  expect(()=>canonicalHeartIds(catalog,{...parsed,structures:[{...parsed.structures[0]!,sourceId:'FJ999999'}]})).toThrow();
 });
 it('registers every legacy bound vertex to the exact canonical source geometry',()=>{
  const legacy=positions('apps/web/preview-assets/heart/heart.glb');
  const chunks=new Map<string,Map<string,number[][]>>();
  for(const item of parsed.structures){
   const key=catalog.structures[item.sourceId]!.chunk;
   if(!chunks.has(key))chunks.set(key,positions(`apps/web/preview-assets/discovery/full-body-v2/${key}.glb`));
   const original=legacy.get(item.id)!,canonical=chunks.get(key)!.get(item.sourceId)!;
   expect(canonical.length).toBe(original.length);
   let maxError=0;
   canonical.forEach((point,i)=>{const converted=atlasToHeart(point);for(let axis=0;axis<3;axis++)maxError=Math.max(maxError,Math.abs(converted[axis]!-original[i]![axis]!));});
   expect(maxError,`${item.id} registration error`).toBeLessThan(.00001);
  }
 });
 it('loads only verified canonical chunks and retains every intended source once',async()=>{
  const urls:string[]=[];
  vi.stubGlobal('fetch',async(url:string)=>{
   urls.push(url);
   const key=url.split('/').at(-1)!;
   return new Response(readFileSync(`apps/web/preview-assets/discovery/full-body-v2/${key}.glb`));
  });
  const model=await loadCanonicalHeart(catalog,parsed,new AbortController().signal);
  expect(model.children.map(mesh=>mesh.name).sort()).toEqual(canonicalHeartIds(catalog,parsed).sort());
  expect(urls.every(url=>url.startsWith('/kham-pha/toan-than/asset/'))).toBe(true);
  expect(urls.length).toBe(new Set(urls).size);
  expect(model.scale.toArray()).toEqual([25,25,25]);
 });

});
