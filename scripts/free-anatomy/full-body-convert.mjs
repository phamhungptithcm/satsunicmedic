// Identity-preserving conversion. Geometry may merge only within one FJ source element.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as THREE from '../../packages/anatomy-viewer/node_modules/three/build/three.module.js';
import { OBJLoader } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
const folder=process.argv.includes('--source-union')?'.ai/local/free-anatomy/full-body-v3':'.ai/local/free-anatomy/full-body-v2';
const inventory=JSON.parse(await readFile(`${folder}/inventory.json`,'utf8'));
if(inventory.productionReady!==false) throw Error('Review-only candidate required');
globalThis.FileReader=class { readAsArrayBuffer(blob){blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();});} };
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const systemLabels={FMA7161:'Tim mạch',FMA7158:'Hô hấp',FMA7157:'Thần kinh',FMA65132:'Dây thần kinh',FMA7159:'Tiết niệu',FMA7152:'Tiêu hóa',FMA9668:'Nội tiết',FMA23881:'Xương',FMA72979:'Da',FMA5022:'Cơ',FMA9721:'Gân',FMA12516:'Răng'};
const systems=Object.fromEntries(Object.entries(systemLabels).map(([id,label])=>[id,{label,sourceIds:[]} ]));
const concepts={}, structures={}, assets={}, regionBoxes={};
for(const e of inventory.objects) for(const [id,name] of Object.entries(e.concepts)) {
 concepts[id]??={name,sourceIds:[]}; concepts[id].sourceIds.push(e.id);
}
const bound=box=>[box.min.toArray(),box.max.toArray()];
const chunks=new Map(); let triangles=0;
for(const entry of inventory.objects){
 const data=await readFile(`${folder}/objects/${entry.id}.obj`);
 if(hash(data)!==entry.sha256) throw Error('Source integrity mismatch');
 const parsed=new OBJLoader().parse(data.toString()); const geometries=[];
 parsed.traverse(obj=>{if(!obj.isMesh)return;const g=obj.geometry;g.rotateX(-Math.PI/2);g.scale(.001,.001,.001);
 for(const key of Object.keys(g.attributes))if(!['position','normal'].includes(key))g.deleteAttribute(key);
 if(!g.attributes.normal)g.computeVertexNormals();geometries.push(g);});
 const merged=mergeGeometries(geometries,false), geometry=mergeVertices(merged,1e-7); geometry.computeBoundingBox();
 const n=geometry.index.count/3; triangles+=n;
 for(const region of entry.regions){regionBoxes[region]??=new THREE.Box3();regionBoxes[region].union(geometry.boundingBox);}
 const memberships=Object.keys(entry.concepts); const matched=memberships.filter(id=>systems[id]);
 for(const id of matched)systems[id].sourceIds.push(entry.id);
 const ranked=memberships.sort((a,b)=>concepts[a].sourceIds.length-concepts[b].sourceIds.length||a.localeCompare(b));
 const specific=entry.specificConcepts??(entry.primaryConcept?[entry.primaryConcept]:ranked.filter(id=>concepts[id].sourceIds.length===concepts[ranked[0]].sourceIds.length));
 // Colors express source-system membership and source artery/vein terms; not oxygenation or patient tissue color.
 const names=Object.values(entry.concepts).join(' ').toLowerCase();
 const color=entry.id==='FJ2810'?'#cda991':matched.includes('FMA23881')?'#efe3c7':matched.includes('FMA7157')?'#e7c563':/\bvein\b/.test(names)?'#647fad':/\bartery\b|\baorta\b/.test(names)?'#be635d':matched.includes('FMA7158')?'#b98eac':matched.includes('FMA7152')?'#c99b81':matched.includes('FMA7159')?'#a97064':matched.includes('FMA7161')?'#b77970':'#b68c7e';
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.58,metalness:0,side:THREE.DoubleSide}));
 mesh.name=entry.id; mesh.userData={sourceId:entry.id,concepts:memberships,medicalReview:'NOT_REVIEWED'};
 const owner=entry.id==='FJ2810'?'skin':entry.regions[0]??'other';
 let chunk=owner;
 if(owner!=='skin') {const count=[...chunks.keys()].filter(k=>k.startsWith(`${owner}-`)).length;const last=`${owner}-${Math.max(0,count-1)}`;const prior=chunks.get(last)??[];const estimate=g=>g.index.array.byteLength+g.attributes.position.array.byteLength+g.attributes.normal.array.byteLength+10000;chunk=prior.length>0&&prior.length<32&&prior.reduce((sum,m)=>sum+estimate(m.geometry),estimate(geometry))<7_500_000?last:`${owner}-${count}`;}
 if(!chunks.has(chunk))chunks.set(chunk,[]);chunks.get(chunk).push(mesh);
 const representation=specific.some(id=>/\bcavity\b/i.test(concepts[id].name))?'cavity':'surface';
 structures[entry.id]={representation,defaultOpacity:representation==='cavity'?.16:1,name:concepts[specific[0]].name,alternativeConcepts:specific,concepts:memberships,regions:entry.regions,systems:matched,chunk,bounds:bound(geometry.boundingBox),triangles:n,color};
 for(const g of geometries)g.dispose();merged.dispose();
}
for(const [chunk,meshes] of chunks){
 const scene=new THREE.Scene();scene.add(...meshes);
 const bytes=Buffer.from(await new GLTFExporter().parseAsync(scene,{binary:true,copyright:inventory.attribution}));
 if(bytes.length>8_000_000)throw Error('Chunk budget exceeded');
 await writeFile(`${folder}/${chunk}.glb`,bytes);
 assets[chunk]={sha256:hash(bytes),byteLength:bytes.length,bounds:bound(new THREE.Box3().setFromObject(scene)),sourceIds:meshes.map(m=>m.name),meshCount:meshes.length};
 for(const m of meshes){m.geometry.dispose();m.material.dispose();}
}
const regions=Object.fromEntries(Object.entries(inventory.regions).map(([id,value])=>[id,{...value,bounds:bound(regionBoxes[id]),sourceIds:inventory.objects.filter(e=>e.regions.includes(id)).map(e=>e.id)}]));
const metadata={version:inventory.version??'bodyparts3d-fullbody-v2',reviewStatus:'unreviewed',sourceParts:inventory.objects.length,triangles,assets,regions,systems,structures,concepts};
await writeFile(`${folder}/conversion.json`,JSON.stringify(metadata,null,2));
await writeFile('apps/web/src/lib/full-body-anatomy.ts',`// Generated by scripts/free-anatomy/full-body-convert.mjs; do not edit.\nimport type { BodyCatalog } from '@hs/anatomy-viewer/scene-history';\nexport const fullBodyAnatomy: BodyCatalog = ${JSON.stringify(metadata)};\n`);
console.log(JSON.stringify({parts:inventory.objects.length,chunks:chunks.size,triangles,totalBytes:Object.values(assets).reduce((n,a)=>n+a.byteLength,0),maxChunk:Math.max(...Object.values(assets).map(a=>a.byteLength))}));
