import { Group, Mesh } from 'three';
import type { HeartBinding } from '@hs/contracts';
import { selectionIds, type BodyCatalog } from './scene-history';
import { loadAnatomyChunk, disposeAnatomyModel } from './anatomy-model-loader';

/** Explicit registration from atlas metres to the existing lesson overlay frame. */
export function atlasToHeart(point: readonly number[]): [number,number,number] {
 return [(point[0]!-.025)/.04,(point[1]!-1.245)/.04,(point[2]!-.125)/.04];
}
export function canonicalHeartIds(catalog: BodyCatalog, binding: HeartBinding): string[] {
 const heart=selectionIds(catalog,'FMA7088');
 if(!heart.length || binding.structures.some(item=>!catalog.structures[item.sourceId]))throw Error('Missing canonical heart mapping');
 return [...new Set([...heart,...binding.structures.map(item=>item.sourceId)])];
}
export async function loadCanonicalHeart(catalog: BodyCatalog,binding: HeartBinding,signal:AbortSignal) {
 const wanted=new Set(canonicalHeartIds(catalog,binding));
 const chunks=[...new Set([...wanted].map(id=>catalog.structures[id]!.chunk))];
 const result=new Group();
 // Uniform view registration only; canonical vertices, IDs and base materials remain unchanged.
 result.scale.setScalar(25);result.position.set(-.625,-31.125,-3.125);
 try {
  for(const key of chunks){
   const loaded=await loadAnatomyChunk(catalog,key,signal);
   const meshes:Mesh[]=[];loaded.traverse(object=>{if(object instanceof Mesh)meshes.push(object);});
   for(const mesh of meshes){
    if(wanted.has(mesh.userData.sourceId as string)){mesh.removeFromParent();result.add(mesh);}
   }
   disposeAnatomyModel(loaded);
  }
  if(signal.aborted)throw Error('Cancelled');
  return result;
 }catch(error){disposeAnatomyModel(result);throw error;}
}
