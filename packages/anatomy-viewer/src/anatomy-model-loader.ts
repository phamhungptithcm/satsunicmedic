import { Group, LoadingManager, Mesh, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readVerifiedBodyBytes } from './verified-body-asset';
import type { BodyCatalog } from './scene-history';

export function disposeAnatomyModel(model: Object3D) {
 model.traverse(object => {
  if (!(object instanceof Mesh)) return;
  object.geometry.dispose();
  for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
 });
}

/** Both discovery and lessons verify the same canonical chunks and source identities. */
export async function loadAnatomyChunk(catalog: BodyCatalog, key: string, signal: AbortSignal): Promise<Group> {
 const asset=catalog.assets[key];
 if (!asset || !/^[a-zA-Z0-9_-]+$/.test(key)) throw Error('Manifest');
 const bytes=await readVerifiedBodyBytes(`/kham-pha/toan-than/asset/${key}`,asset,signal);
 const manager=new LoadingManager();
 manager.setURLModifier(()=>{throw Error('External resources forbidden');});
 const parsed=await new GLTFLoader(manager).parseAsync(bytes.buffer,'');
 try {
  if(signal.aborted)throw Error('Cancelled');
  const ids:string[]=[];
  parsed.scene.traverse(object=>{if(object instanceof Mesh){
   const id=object.userData.sourceId as string;
   if(object.name!==id || catalog.structures[id]?.chunk!==key)throw Error('Identity');
   ids.push(id);
  }});
  if(ids.length!==asset.sourceIds.length || new Set(ids).size!==ids.length || ids.some(id=>!asset.sourceIds.includes(id)))throw Error('Identity');
  return parsed.scene;
 } catch(error) {disposeAnatomyModel(parsed.scene);throw error;}
}
