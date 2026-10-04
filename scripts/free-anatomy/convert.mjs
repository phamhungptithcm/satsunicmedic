// Local candidate conversion; uses existing dependencies, never creates a review receipt.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as THREE from '../../packages/anatomy-viewer/node_modules/three/build/three.module.js';
import { OBJLoader } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from '../../packages/anatomy-viewer/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const bundle = resolve(process.argv[2] ?? '.ai/local/free-anatomy/review-v1');
const inventory = JSON.parse(await readFile(resolve(bundle, 'inventory.json'), 'utf8'));
if (inventory.status !== 'LOCAL_REVIEW_ONLY' || inventory.productionReady !== false)
  throw new Error('Only unreviewed local candidates accepted');
const hash = value => createHash('sha256').update(value).digest('hex');
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); });
  }
};
const grouped = new Map();
let triangles = 0;
for (const entry of inventory.objects) {
  if (!/^FJ[0-9]{1,6}$/.test(entry.id)) throw new Error('Invalid source ID');
  const data = await readFile(resolve(bundle, 'objects', `${entry.id}.obj`));
  if (hash(data) !== entry.sha256) throw new Error(`Source hash mismatch: ${entry.id}`);
  const parsed = new OBJLoader().parse(data.toString('utf8'));
  const record = grouped.get(entry.concept) ?? { entry, geometries: [] };
  parsed.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry;
    // Source headers specify millimetres; rotate Z-up into glTF Y-up.
    // Source front direction remains a review question, not an anatomical claim.
    geometry.rotateX(-Math.PI / 2);
    geometry.scale(0.001, 0.001, 0.001);
    for (const key of Object.keys(geometry.attributes))
      if (!['position', 'normal'].includes(key)) geometry.deleteAttribute(key);
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    triangles += geometry.attributes.position.count / 3;
    record.geometries.push(geometry);
  });
  grouped.set(entry.concept, record);
}
if (triangles !== inventory.objects.reduce((sum, item) => sum + item.triangles, 0))
  throw new Error('Conversion changed triangle count');
const scene = new THREE.Scene();
const colors = { heart: '#b65358', lungs: '#d4a3a2', skeleton: '#e6dece' };
for (const [concept, { entry, geometries }] of grouped) {
  const merged = mergeGeometries(geometries, false);
  if (!merged) throw new Error('Incompatible geometry');
  const geometry = mergeVertices(merged, 1e-7);
  if (geometry.index.count !== merged.attributes.position.count) throw new Error('Index count changed');
  const material = new THREE.MeshStandardMaterial({ color: colors[entry.group], roughness: 0.62, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = concept;
  mesh.userData = { label: entry.label, group: entry.group, medicalReview: 'NOT_REVIEWED' };
  scene.add(mesh);
}
const bounds = new THREE.Box3().setFromObject(scene);
const exported = await new GLTFExporter().parseAsync(scene, {
  binary: true, copyright: inventory.attribution,
});
const bytes = Buffer.from(exported);
await writeFile(resolve(bundle, 'candidate.glb'), bytes);
const receipt = { ...inventory, conversion: {
  glbSha256: hash(bytes), glbBytes: bytes.length, triangles,
  meshCount: scene.children.length, boundsMeters: [bounds.min.toArray(), bounds.max.toArray()],
  transformations: ['Millimetres to metres', 'Rotate X -90 degrees', 'Merge by selected FMA concept',
    'Deduplicate matching vertex attributes at 1e-7 m tolerance; preserve face count',
    'Illustrative flat material colors; no source texture or clinical color claim'],
  fineDetailValidation: 'NOT_REVIEWED', sourceFrontDirection: 'NOT_VERIFIED',
} };
await writeFile(resolve(bundle, 'inventory.json'), JSON.stringify(receipt, null, 2) + '\n');
const library = resolve(root, 'packages/anatomy-viewer/node_modules/three');
for (const path of ['build/three.module.js', 'build/three.core.js', 'examples/jsm/loaders/GLTFLoader.js',
  'examples/jsm/controls/OrbitControls.js', 'examples/jsm/utils/BufferGeometryUtils.js',
  'examples/jsm/utils/SkeletonUtils.js', 'LICENSE']) {
  const destination = resolve(bundle, 'vendor/three', path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(library, path), destination);
}
for (const name of ['preview.html', 'preview.mjs', 'preview.css'])
  await copyFile(resolve(root, 'scripts/free-anatomy', name), resolve(bundle, name === 'preview.html' ? 'index.html' : name));
await writeFile(resolve(bundle, 'ATTRIBUTION.txt'), inventory.attribution + '\n' + inventory.licensePage
  + '\nOriginal OBJ headers preserve legacy CC-BY-SA-2.1-JP notices. Current archive license page states CC-BY-4.0.\n'
  + 'Local conversion described in inventory.json; medical review not completed.\n');
console.log(JSON.stringify(receipt.conversion, null, 2));
