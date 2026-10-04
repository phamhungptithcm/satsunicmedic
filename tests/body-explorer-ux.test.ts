import { describe, expect, it } from 'vitest';
import { fullBodyAnatomy as model } from '../apps/web/src/lib/full-body-anatomy';
import { searchBody, bodyLabel } from '../apps/web/src/lib/body-explorer';
import { bodyVocabulary } from '../apps/web/src/lib/body-vocabulary';
import { inspectBodyStructure, setBodyMusclesHidden } from '../apps/web/src/lib/body-explorer-ux';
import { initialBodyScene, commitScene, undoScene, redoScene, sceneSourceIds, selectionIds } from '../packages/anatomy-viewer/src/scene-history';

describe('bilingual anatomy discovery', () => {
  it.each([['gan', 'FMA7197'], ['liver', 'FMA7197'], ['não', 'FMA50801'], ['nao', 'FMA50801'], ['dạ dày', 'FMA7148'], ['da day', 'FMA7148'], ['phổi phải', 'FMA7309'], ['right lung', 'FMA7309'], ['thận trái', 'FMA7205'], ['cột sống', 'FMA13478']])('%s finds the exact organ first', (query, id) => {
    expect(searchBody(query, 'all', '')[0]?.id).toBe(id);
  });
  it.each(['phổi', 'phoi', 'lung', 'lungs'])('%s prioritizes lungs over inherited vascular aliases', query => {
    expect(searchBody(query, 'all', '').slice(0, 2).map(item => item.id).sort()).toEqual(['FMA7309', 'FMA7310']);
  });
  it('Vietnamese phoi does not accidentally match scaphoid or xiphoid substrings', () => {
    expect(searchBody('phổi', 'all', '').some(entry => /scaphoid|xiphoid/.test(entry.name))).toBe(false);
  });
  it('only translates verified concept identities without editing the atlas', () => {
    for (const [id, term] of Object.entries(bodyVocabulary)) {
      expect(model.concepts[id]?.name).toBe(term.english);
      expect(selectionIds(model, id).length).toBeGreaterThan(0);
    }
    expect(bodyLabel('FMA7563')).toBe(model.concepts.FMA7563!.name);
    expect(bodyLabel('unknown')).toBe('unknown');
    expect(model.reviewStatus).toBe('unreviewed');
  });
  it('respects anatomy filters and recovers after clearing them', () => {
    expect(searchBody('gan', 'head', '')).toEqual([]);
    expect(searchBody('gan', 'all', 'nervous')).toEqual([]);
    expect(searchBody('gan', 'all', '')[0]?.id).toBe('FMA7197');
    expect(searchBody('zzzzzz', 'all', '')).toEqual([]);
  });
  it('prioritizes common organs while exposing the entire source catalog', () => {
    const suggested = searchBody('', 'all', '');
    expect(suggested.map(entry=>entry.id).sort()).toEqual(Object.keys(model.concepts).sort());
    expect(suggested.slice(0,16).every(entry => entry.label !== entry.name)).toBe(true);
    expect(searchBody('systemic arterial tree', 'all', '')[0]?.id).toBe('FMA49894');
  });
});

describe('explicit clear view and recovery', () => {
  it('reveals a hidden, transparent, clipped heart in one reversible action', () => {
    const ids = selectionIds(model, 'FMA7088');
    const before = { ...initialBodyScene(), region: 'head', hidden: [ids[0]!, 'FJ2810'], opacity: { [ids[0]!]: 0 }, clipping: .2, camera: { position: [1, 2, 3], target: [0, 1, 0] } };
    const next = inspectBodyStructure(model, before, 'FMA7088');
    expect(next.selected).toBe('FMA7088');
    expect(next.region).toBe('thorax');
    expect(next.focus).toBe('FMA7088');
    expect(next.camera).toBeNull();
    expect(next.sections).toEqual({});
    expect(next.clipping).toBeNull();
    expect(next.skinOpacity).toBe(0);
    expect(next.opacity[ids[0]!]).toBeUndefined();
    expect(sceneSourceIds(model, next)).toEqual(ids);
    const history = commitScene({ past: [], present: before, future: [] }, next);
    expect(history.past).toHaveLength(1);
    expect(undoScene(history).present).toEqual(before);
    expect(redoScene(undoScene(history)).present).toEqual(next);
    expect(before.opacity[ids[0]!]).toBe(0);
  });
  it('a second organ replaces isolation rather than retaining the old organ', () => {
    const heart = inspectBodyStructure(model, initialBodyScene(), 'FMA7088');
    const liver = inspectBodyStructure(model, heart, 'FMA7197');
    expect(sceneSourceIds(model, liver)).toEqual(selectionIds(model, 'FMA7197'));
  });
  it('surface inspection restores skin without requesting internal meshes', () => {
    const skin = inspectBodyStructure(model, { ...initialBodyScene(), inside: true, hidden: ['FJ2810'], opacity: { FJ2810: 0 } }, 'FJ2810');
    expect(skin.inside).toBe(false);expect(skin.skinOpacity).toBe(1);expect(skin.hidden).toEqual([]);expect(sceneSourceIds(model, skin)).toEqual([]);
  });
  it('invalid identifiers do not change the scene', () => {
    const scene = initialBodyScene();expect(inspectBodyStructure(model, scene, 'unknown')).toBe(scene);
  });
});


describe('muscle layer visibility', () => {
 it('hides source muscles only and restores them without revealing other hidden parts', () => {
  const muscles=model.systems.FMA5022!.sourceIds;
  expect(muscles.length).toBeGreaterThan(0);
  const before={...initialBodyScene(),inside:true,hidden:['FJ2810'],opacity:{[muscles[0]!]:.3}};
  const hidden=setBodyMusclesHidden(model,before,true);
  expect(new Set(hidden.hidden)).toEqual(new Set(['FJ2810',...muscles]));
  expect(sceneSourceIds(model,hidden).some(id=>muscles.includes(id))).toBe(false);
  expect(setBodyMusclesHidden(model,hidden,true)).toEqual(hidden);
  expect(setBodyMusclesHidden(model,hidden,false)).toEqual(before);
  expect(before.hidden).toEqual(['FJ2810']);
 });
 it('preserves selection, isolation and camera and supports undo and redo', () => {
  const before=inspectBodyStructure(model,initialBodyScene(),'FMA5022');
  const next=setBodyMusclesHidden(model,before,true);
  expect({...next,hidden:before.hidden}).toEqual(before);
  expect(sceneSourceIds(model,next)).toEqual([]);
  const history=commitScene({past:[],present:before,future:[]},next);
  expect(undoScene(history).present).toEqual(before);
  expect(redoScene(undoScene(history)).present).toEqual(next);
 });
});
