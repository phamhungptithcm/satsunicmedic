import { focusBodyScene, selectionIds, scopeSourceIds, initialBodyScene, type BodyCatalog, type BodyScene } from '@hs/anatomy-viewer/scene-history';

/** One explicit, undoable action: reveal only the requested source geometry. */
export function inspectBodyStructure(catalog: BodyCatalog, scene: BodyScene, id: string): BodyScene {
  const ids = selectionIds(catalog, id);
  if (!ids.length) return scene;
  const opacity = { ...scene.opacity };
  for (const source of ids) delete opacity[source];
  const surfaceOnly = ids.every(source => source === 'FJ2810');
  const focused = focusBodyScene(catalog, { ...scene, region: 'all' }, id);
  const system = compatibleSystem(catalog, focused.region, scene.system ?? '', ids);
  return {
    ...focused, selected: id, system,
    inside: !surfaceOnly, skinOpacity: surfaceOnly ? 1 : 0,
    isolate: surfaceOnly ? null : ids,
    hidden: scene.hidden.filter(source => !ids.includes(source)), opacity,
    clipping: null, sections: {},
  };
}

export function compatibleSystem(catalog: BodyCatalog, region: string, system: string, ids?: string[]): string {
 if (!system) return '';
 const scope = scopeSourceIds(catalog, region, system);
 return scope.length && (!ids || ids.some(id => scope.includes(id))) ? system : '';
}
/** Selecting a scope is one reversible navigation operation, not a search side effect. */
export function viewBodyScope(catalog: BodyCatalog, scene: BodyScene, region: string, requestedSystem: string): BodyScene {
 if (region !== 'all' && !catalog.regions[region]) return scene;
 const system = compatibleSystem(catalog, region, requestedSystem);
 if (region === 'all' && !system) return {...initialBodyScene(), query: scene.query, focusRevision:scene.focusRevision+1};
 const ids = scopeSourceIds(catalog, region, system);
 const surfaceOnly = ids.length>0&&ids.every(id=>id==='FJ2810');
 const opacity = {...scene.opacity};
 for (const id of ids) delete opacity[id];
 return {...scene, region, system, selected:null, inside:!surfaceOnly, skinOpacity:surfaceOnly?1:0, isolate:null,
  hidden:scene.hidden.filter(id=>!ids.includes(id)), opacity, clipping:null, sections:{},
  focus:'@scope', focusRevision:scene.focusRevision+1, camera:null};
}
export function nearbyBodyStructure(catalog: BodyCatalog, scene: BodyScene, id: string): BodyScene {
  const inspected = inspectBodyStructure(catalog, scene, id);
  if (inspected === scene) return scene;
  // Source parts without regional evidence have no reliable neighborhood.
  // Keep the exact isolated selection instead of resetting to skin or loading the whole atlas.
  if (inspected.region === 'all') return inspected;
 const nearby = viewBodyScope(catalog, inspected, inspected.region, '');
 return {...nearby,selected:id,focus:id,skinOpacity:.12};
}
export function pickBodyStructure(catalog: BodyCatalog, scene: BodyScene, id: string): BodyScene {
 if (!selectionIds(catalog,id).length) return scene;
 return {...scene,selected:id};
}

/** Toggle the source muscle group without disturbing other visibility settings. */
export function setBodyMusclesHidden(catalog: BodyCatalog, scene: BodyScene, hide: boolean): BodyScene {
 const muscles = new Set(catalog.systems.FMA5022?.sourceIds ?? []);
 if (!muscles.size) return scene;
 return {...scene, hidden: hide
  ? [...new Set([...scene.hidden, ...muscles])]
  : scene.hidden.filter(id => !muscles.has(id))};
}
