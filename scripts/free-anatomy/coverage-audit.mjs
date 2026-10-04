/** AC-01: source coverage is not medical completeness. No geometry/publication mutation. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const identifier = /^(FMA\d+|FJ\d+M?)$/;

export function parseTable(text, required) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const keys = header.split('\t');
  if (required.some(key => !keys.includes(key))) throw Error('Missing source columns');
  return lines.map(line => {
    const values = line.split('\t');
    if (values.length !== keys.length) throw Error('Invalid source row');
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  });
}

export function validateHierarchy(edges, concepts) {
  const children = {}, seen = new Set();
  for (const [parent, child] of edges) {
    if (!Object.hasOwn(concepts, parent) || !Object.hasOwn(concepts, child)) throw Error('Orphan hierarchy endpoint');
    const key = `${parent}/${child}`;
    if (seen.has(key)) throw Error('Duplicate hierarchy edge');
    seen.add(key); (children[parent] ??= []).push(child);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw Error('Hierarchy cycle');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of children[id] ?? []) visit(child);
    visiting.delete(id); visited.add(id);
  }
  for (const id of Object.keys(concepts)) visit(id);
  return children;
}

export function buildCoverage(catalog, expected, edges) {
  const sourceIds = new Set(Object.keys(catalog.structures));
  const assetIds = Object.values(catalog.assets).flatMap(asset => asset.sourceIds);
  if (new Set(assetIds).size !== assetIds.length || assetIds.length !== sourceIds.size || assetIds.some(id => !sourceIds.has(id))) throw Error('Asset identity mismatch');
  for (const [id, structure] of Object.entries(catalog.structures)) {
    if (!catalog.assets[structure.chunk]?.sourceIds.includes(id)) throw Error('Orphan structure');
    for (const concept of structure.concepts) if (!catalog.concepts[concept]?.sourceIds.includes(id)) throw Error('Broken concept mapping');
  }
  for (const [id, concept] of Object.entries(catalog.concepts)) {
    if (new Set(concept.sourceIds).size !== concept.sourceIds.length || concept.sourceIds.some(source => !sourceIds.has(source) || !catalog.structures[source].concepts.includes(id))) throw Error('Invalid concept sources');
  }
  const children = validateHierarchy(edges, catalog.concepts);
  const records = Object.entries(expected).map(([id, item]) => {
    if (!identifier.test(id) || !item.sourceIds.length || new Set(item.sourceIds).size !== item.sourceIds.length || item.sourceIds.some(source => !/^FJ\d+M?$/.test(source))) throw Error('Invalid expected identity');
    const available = item.sourceIds.filter(source => sourceIds.has(source));
    const missing = item.sourceIds.filter(source => !sourceIds.has(source));
    return { id, name: item.name, expected: item.sourceIds, available, missing,
      geometry: missing.length === 0 ? 'available' : available.length ? 'partial' : 'missing',
      medicalReview: 'not-reviewed', detail: 'not-audited', activity: 'not-audited' };
  });
  const missingSourceIds = [...new Set(records.flatMap(item => item.missing))].sort();
  return { version: 'ac-01-v1', catalogVersion: catalog.version, completeness: 'unknown',
    scope: 'BodyParts3D 4.0 IS-A reference; not a complete human anatomy standard',
    sourceStructures: sourceIds.size, sourceConcepts: Object.keys(catalog.concepts).length,
    expectedSourceStructures: new Set(records.flatMap(item => item.expected)).size,
    unassignedSystem: [...sourceIds].filter(id => !catalog.structures[id].systems.length),
    unassignedRegion: [...sourceIds].filter(id => !catalog.structures[id].regions.length),
    missingSourceIds, children, records };
}

async function main() {
  const folder = 'scripts/free-anatomy/catalog';
  const sourceFiles = ['isa_element_parts.txt', 'partof_inclusion_relation_list.txt', 'isa_inclusion_relation_list.txt'];
  const bytes = await Promise.all(sourceFiles.map(file => readFile(`${folder}/${file}`)));
  if (bytes.some(buffer => buffer.length > 2_000_000)) throw Error('Source metadata budget');
  const rows = parseTable(bytes[0].toString(), ['concept id', 'name', 'element file id']);
  const expected = {};
  for (const row of rows) {
    const id = row['concept id'], source = row['element file id'];
    if (!/^FMA\d+$/.test(id) || !/^FJ\d+M?$/.test(source)) throw Error('Invalid source identity');
    const item = expected[id] ??= { name: row.name, sourceIds: [] };
    if (item.name !== row.name || item.sourceIds.includes(source)) throw Error('Conflicting source row');
    item.sourceIds.push(source);
  }
  const content = await readFile('apps/web/src/lib/full-body-anatomy.ts', 'utf8');
  const catalog = JSON.parse(content.split('export const fullBodyAnatomy: BodyCatalog = ')[1].trim().replace(/;$/, ''));
  const edges = parseTable(bytes[1].toString(), ['parent id', 'child id']).map(row => [row['parent id'], row['child id']]);
  const isaEdges = parseTable(bytes[2].toString(), ['parent id', 'child id']).map(row => [row['parent id'], row['child id']]);
  validateHierarchy(isaEdges, expected); // IS-A is not a part-of tree; never use it as one.
  const report = buildCoverage(catalog, expected, edges);
  const receipt = sourceFiles.map((file, index) => ({ file, byteLength: bytes[index].length, sha256: hash(bytes[index]),
    url: `https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/${file === 'isa_element_parts.txt' ? 'isa_element_parts.txt' : file}` }));
  await writeFile(`${folder}/coverage.json`, JSON.stringify({ ...report, provenance: receipt, catalogSha256: hash(content) }));
  await writeFile(`${folder}/discovery.json`, JSON.stringify({ children: report.children,
    summary: { structures: report.sourceStructures, concepts: report.sourceConcepts, missingSourceIds: report.missingSourceIds.length, completeness: report.completeness },
    gaps: report.records.filter(item => item.missing.length).map(item => ({ id: item.id, name: item.name, geometry: item.geometry, availableCount: item.available.length, missingCount: item.missing.length })) }));
  console.log(JSON.stringify({ structures: report.sourceStructures, expectedSourceStructures: report.expectedSourceStructures, missingSourceIds: report.missingSourceIds.length,
    referenceConcepts: report.records.length, completeness: report.completeness }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
