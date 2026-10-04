// Geometric containment only; this does not validate flow physiology or perfusion.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../../packages/anatomy-viewer/package.json', import.meta.url));
const T = await import(require.resolve('three').replace('three.cjs', 'three.module.js'));
const { GLTFLoader } = await import(require.resolve('three/examples/jsm/loaders/GLTFLoader.js'));
const binding = JSON.parse(fs.readFileSync(new URL('./binding.json', import.meta.url)));
const buffer = fs.readFileSync(new URL('./heart.glb', import.meta.url));
if (buffer.length !== binding.byteLength || crypto.createHash('sha256').update(buffer).digest('hex') !== binding.sha256) throw Error('Asset integrity mismatch');
const gltf = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '');
gltf.scene.updateMatrixWorld(true);
const directions = [new T.Vector3(1,0,0), new T.Vector3(0,1,0), new T.Vector3(0,0,1)];
const result = [];
for (const flow of binding.flows) {
 const mesh = gltf.scene.getObjectByName(flow.id); mesh.material.side = T.DoubleSide;
 let tested = 0, outside = 0, minWallDistance = Infinity, minSurfaceClearance = Infinity;
 const positions = mesh.geometry.attributes.position; const indices = mesh.geometry.index;
 const triangle = new T.Triangle(), closest = new T.Vector3();
 for (let i=0; i<flow.points.length-1; i++) for (let k=0; k<=10; k++) {
  const point = new T.Vector3(...flow.points[i]).lerp(new T.Vector3(...flow.points[i+1]), k/10);
  for (let face=0; face<(indices ? indices.count : positions.count); face+=3) {
   triangle.a.fromBufferAttribute(positions, indices ? indices.getX(face) : face);
   triangle.b.fromBufferAttribute(positions, indices ? indices.getX(face+1) : face+1);
   triangle.c.fromBufferAttribute(positions, indices ? indices.getX(face+2) : face+2);
   triangle.closestPointToPoint(point, closest);
   minSurfaceClearance = Math.min(minSurfaceClearance, point.distanceTo(closest));
  }
  for (const direction of directions) {
   const hits = new T.Raycaster(point, direction).intersectObject(mesh, false);
   const distances = hits.map(h=>h.distance).filter((d,j,a)=>j===0 || Math.abs(d-a[j-1])>1e-6);
   if (distances.length % 2 !== 1) outside++;
   minWallDistance = Math.min(minWallDistance, distances[0] ?? Infinity);
   tested++;
  }
 }
 result.push({id:flow.id, testedRays:tested, outside, minSurfaceClearance, minAxialWallDistance:minWallDistance});
 if (outside || minSurfaceClearance < 0.006) throw Error(JSON.stringify(result));
}
console.log(JSON.stringify({sha256:binding.sha256, geometricContainment:result, clinicalValidation:'NOT_REVIEWED'},null,2));
