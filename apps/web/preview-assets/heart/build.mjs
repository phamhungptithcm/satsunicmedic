// Rebuild derived geometry from the attributed, immutable OBJ inputs in source/.
// Does not fetch or run upstream code. Source geometry is never modified in place.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(new URL('../../../../packages/anatomy-viewer/package.json',import.meta.url));
const THREE=await import(require.resolve('three').replace('three.cjs','three.module.js')); 
const {OBJLoader}=await import(require.resolve('three/examples/jsm/loaders/OBJLoader.js'));
const {GLTFExporter}=await import(require.resolve('three/examples/jsm/exporters/GLTFExporter.js'));
globalThis.FileReader=class{async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();}async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.();}};
const source=JSON.parse(fs.readFileSync(path.join(root,'source-manifest.json'),'utf8'));
const definitions={FJ2428:['ventricle','Thành tâm thất','wall','#ae5866'],FJ2438:['left-atrium','Thành nhĩ trái','wall','#be7880'],FJ2439:['right-atrium','Thành nhĩ phải','wall','#c58791'],FJ2631:['lad','Nhánh gian thất trước (LAD)','artery','#d7414c'],FJ2649:['lcx','Nhánh mũ (LCx)','artery','#cf344c'],FJ2723:['rca','Động mạch vành phải (RCA)','artery','#d95056'],FJ2737:['left-main','Thân chung mạch vành trái','artery','#d34249'],FJ2966:['pulmonary','Thân động mạch phổi','great-vessel','#7186b0'],FJ3411:['aortic-arch','Cung động mạch chủ','great-vessel','#c26975'],FJ3413:['aorta','Động mạch chủ lên','great-vessel','#bb6673']};
const transform=([x,y,z])=>[(x-25)/40,(z-1245)/40,-(y+125)/40];
const scene=new THREE.Group();const structures=[];const raw={};
for(const record of source.records){
 const bytes=fs.readFileSync(path.join(root,'source',record.id+'.obj'));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error('Source hash mismatch');
 const [id,label,kind,color]=definitions[record.id];
 const loaded=new OBJLoader().parse(bytes.toString());
 loaded.traverse(object=>{if(!object.isMesh)return;
  const geometry=object.geometry;const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setXYZ(i,...transform([pos.getX(i),pos.getY(i),pos.getZ(i)]));
  const normals=geometry.attributes.normal; if(normals){for(let i=0;i<normals.count;i++){const x=normals.getX(i),y=normals.getY(i),z=normals.getZ(i);normals.setXYZ(i,x,z,-y);}geometry.normalizeNormals();}else geometry.computeVertexNormals();geometry.computeBoundingBox();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.62,metalness:.05,side:THREE.DoubleSide}));mesh.name=id;scene.add(mesh);
  structures.push({id,label,kind,sourceId:record.id});
 });
 const v=[],f=[];for(const line of bytes.toString().split('\n')){const a=line.trim().split(/\s+/);if(a[0]==='v')v.push(a.slice(1,4).map(Number));if(a[0]==='f')f.push(a.slice(1).map(t=>Number(t.split('/')[0])-1));}raw[id]={v,f};
}
// Cross-sectional centroids from the same LAD/LCx surfaces; no hand-drawn vessel coordinates.
// The atlas tubes are monotone along these selected intervals. This is a geometric
// centerline estimate, not a validated clinical flow solution or a perfusion map.
function centerline(id){const {v,f}=raw[id];const zlo=Math.min(...v.map(p=>p[2]))+.8,zhi=Math.max(...v.map(p=>p[2]))-.8;const points=[];let maxCrossSectionRadius=0;
 for(let n=0;n<65;n++){const z=zhi+(zlo-zhi)*n/64;const intersections=[];
  for(const face of f)for(let i=0;i<face.length;i++){const a=v[face[i]],b=v[face[(i+1)%face.length]];if((a[2]<z)===(b[2]<z))continue;const t=(z-a[2])/(b[2]-a[2]);intersections.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  if(intersections.length<3)throw Error('Insufficient cross section '+id+' '+z);
  const unique=[...new Map(intersections.map(p=>[p.map(x=>x.toFixed(4)).join(','),p])).values()];
  const mx=unique.reduce((s,p)=>s+p[0],0)/unique.length,my=unique.reduce((s,p)=>s+p[1],0)/unique.length;
  unique.sort((a,b)=>Math.atan2(a[1]-my,a[0]-mx)-Math.atan2(b[1]-my,b[0]-mx));
  let area=0,cx=0,cy=0;for(let i=0;i<unique.length;i++){const a=unique[i],b=unique[(i+1)%unique.length],cross=a[0]*b[1]-b[0]*a[1];area+=cross;cx+=(a[0]+b[0])*cross;cy+=(a[1]+b[1])*cross;}
  if(Math.abs(area)<1e-6)throw Error('Degenerate section');cx/=3*area;cy/=3*area;
  maxCrossSectionRadius=Math.max(maxCrossSectionRadius,...unique.map(p=>Math.hypot(p[0]-cx,p[1]-cy)/40));
  points.push(transform([cx,cy,z]));
 }
 return {id,points,method:'mesh-cross-section-centroids',maxCrossSectionRadius};
}
const flows=['lad','lcx'].map(centerline);
const arrayBuffer=await new GLTFExporter().parseAsync(scene,{binary:true});
const buffer=Buffer.from(arrayBuffer);fs.writeFileSync(path.join(root,'heart.glb'),buffer);
const binding={schemaVersion:1,id:'bodyparts3d-heart-preview',sha256:crypto.createHash('sha256').update(buffer).digest('hex'),byteLength:buffer.length,structures,flows,occlusion:{segmentId:'lad',at:.36},territory:null,reviewStatus:'unreviewed',coordinateNote:'Shared atlas transform: [(x-25)/40,(z-1245)/40,-(y+125)/40]. Illustration coordinates, not meters.',attribution:'BodyParts3D, © The Database Center for Life Science. CC BY 4.0. OBJ selection, coordinate transform, materials and centerline derivation by HumanScope; no clinical endorsement.',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourceUrl:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html'};
fs.writeFileSync(path.join(root,'binding.json'),JSON.stringify(binding,null,2));
console.log(JSON.stringify({bytes:buffer.length,meshes:structures.length,flows:flows.map(f=>({id:f.id,samples:f.points.length,maxRadius:f.maxCrossSectionRadius}))}));
