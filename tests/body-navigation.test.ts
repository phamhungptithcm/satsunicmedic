import {describe,it,expect} from 'vitest';
import {navigateCamera,navigationAction,navigateWheel,wheelIntent} from '../packages/anatomy-viewer/src/body-navigation';
import {fullBodyAnatomy as model} from '../apps/web/src/lib/full-body-anatomy';
import {viewBodyScope,inspectBodyStructure,nearbyBodyStructure} from '../apps/web/src/lib/body-explorer-ux';
import {initialBodyScene,scopeSourceIds,sceneSourceIds,requiredChunks,commitScene,undoScene,redoScene,sceneBounds,selectionIds} from '../packages/anatomy-viewer/src/scene-history';

describe('linked anatomy navigation',()=>{
 it('shows only the requested region/system intersection and clears occlusion in one undo step',()=>{
  const system=Object.keys(model.systems).find(id=>scopeSourceIds(model,'thorax',id).length)!;
  const ids=scopeSourceIds(model,'thorax',system);
  const before={...initialBodyScene(),query:'tim',hidden:ids,opacity:{[ids[0]!]:0},clipping:.3};
  const next=viewBodyScope(model,before,'thorax',system);
  expect(new Set(sceneSourceIds(model,next))).toEqual(new Set(ids));
  expect(new Set(requiredChunks(model,next))).toEqual(new Set(ids.map(id=>model.structures[id]!.chunk)));
  expect(next.clipping).toBeNull();expect(next.camera).toBeNull();expect(next.focus).toBe('@scope');
  const h=commitScene({past:[],present:before,future:[]},next);
  expect(undoScene(h).present).toEqual(before);expect(redoScene(undoScene(h)).present).toEqual(next);
  const bounds=sceneBounds(model,next);expect(bounds[1][1]).toBeGreaterThan(bounds[0][1]!);
 });
 it('falls back from an unavailable system without loading the complete internal atlas on reset',()=>{
  const region=viewBodyScope(model,initialBodyScene(),'thorax','invalid');
  expect(region.system).toBe('');expect(region.inside).toBe(true);
  const reset=viewBodyScope(model,region,'all','');
  expect(reset.inside).toBe(false);expect(requiredChunks(model,reset)).toEqual([]);
  expect(viewBodyScope(model,reset,'invalid','')).toBe(reset);
 });
 it('clicking an organ replaces scope isolation; nearby reveals the target even after hidden/clipped state',()=>{
  const scope=viewBodyScope(model,initialBodyScene(),'head','FMA7157');
  const heart=inspectBodyStructure(model,scope,'FMA7088');
  expect(heart.system).toBe('');expect(sceneSourceIds(model,heart)).toEqual(selectionIds(model,'FMA7088'));
  const nearby=nearbyBodyStructure(model,{...heart,hidden:selectionIds(model,'FMA7088'),clipping:.4},'FMA7088');
  expect(nearby.isolate).toBeNull();expect(nearby.clipping).toBeNull();
  expect(selectionIds(model,'FMA7088').every(id=>sceneSourceIds(model,nearby).includes(id))).toBe(true);
 });
 it('skin system reveals the surface without requesting internal geometry',()=>{
  const scene=viewBodyScope(model,{...initialBodyScene(),hidden:['FJ2810'],opacity:{FJ2810:0}},'all','FMA72979');
  expect(scene.system).toBe('FMA72979');expect(scene.inside).toBe(false);expect(scene.skinOpacity).toBe(1);expect(scene.hidden).toEqual([]);expect(requiredChunks(model,scene)).toEqual([]);
 });
 it('search edits preserve visible IDs and required chunks',()=>{
  const scene=viewBodyScope(model,initialBodyScene(),'thorax','');
  expect(requiredChunks(model,{...scene,query:'gan'})).toEqual(requiredChunks(model,scene));
 });
});
describe('camera keyboard navigation',()=>{
 const pose={position:[0,1,3],target:[0,1,0]};
 it('pans the camera and target together, then zooms around the translated target',()=>{
  const panned=navigateCamera(pose,'right');
  expect(panned.target[0]).toBeGreaterThan(0);
  expect(panned.position.map((v,i)=>v-panned.target[i]!)).toEqual([0,0,3]);
  const zoom=navigateCamera(panned,'in');expect(zoom.target).toEqual(panned.target);expect(zoom.position[2]).toBeCloseTo(2.4);
  const rotated=navigateCamera(zoom,'rotate-left');expect(rotated.target).toEqual(panned.target);
 });
 it('bounds zoom and preserves browser shortcuts',()=>{
  let next=pose;for(let i=0;i<100;i++)next=navigateCamera(next,'in');
  expect(next.position[2]).toBeCloseTo(.025);
  expect(navigationAction('ArrowLeft',true)).toBe('rotate-left');
  expect(navigationAction('+',false,true)).toBeNull();expect(navigationAction('Tab')).toBeNull();
  expect(navigationAction('Home')).toBe('scope');expect(navigationAction('F')).toBe('frame');
 });
});

describe('direct wheel and trackpad navigation',()=>{
 const pose={position:[0,0,3],target:[0,0,0]};
 const wheel={deltaX:0,deltaY:0,deltaMode:0,ctrlKey:false,metaKey:false,shiftKey:false};
 it('normalizes line deltas and pans camera and target together without zoom',()=>{
  const pixel=navigateWheel(pose,{...wheel,deltaX:32,deltaY:16},800,600,400,300);
  const line=navigateWheel(pose,{...wheel,deltaX:2,deltaY:1,deltaMode:1},800,600,400,300);
  expect(pixel).toEqual(line);expect(pixel.position.map((v,i)=>v-pixel.target[i]!)).toEqual([0,0,3]);
  expect(pixel.target[0]).toBeGreaterThan(0);expect(pixel.target[1]).toBeLessThan(0);
 });
 it('uses modifiers instead of hardware heuristics and preserves target while rotating',()=>{
  expect(wheelIntent({...wheel,ctrlKey:true})).toBe('zoom');expect(wheelIntent({...wheel,metaKey:true,shiftKey:true})).toBe('zoom');
  expect(wheelIntent({...wheel,shiftKey:true})).toBe('rotate');expect(wheelIntent(wheel)).toBe('pan');
  const rotated=navigateWheel(pose,{...wheel,deltaX:30,shiftKey:true},800,600,400,300);
  expect(rotated.target).toEqual(pose.target);expect(rotated.position[0]).not.toBe(0);expect(Math.hypot(...rotated.position)).toBeCloseTo(3);
 });
 it('keeps an off-center zoom anchor fixed in screen space after a pan',()=>{
  const panned=navigateWheel(pose,{...wheel,deltaX:80,deltaY:40},800,600,400,300);
  const next=navigateWheel(panned,{...wheel,deltaY:-100,ctrlKey:true},800,600,600,200);
  const half=3*Math.tan(Math.PI/10),anchor=[panned.target[0]!+half*2/3,panned.target[1]!+half/3];
  const nextHalf=(next.position[2]!-next.target[2]!)*Math.tan(Math.PI/10);
  expect((anchor[0]!-next.target[0]!)/(nextHalf*4/3)).toBeCloseTo(.5);
  expect((anchor[1]!-next.target[1]!)/nextHalf).toBeCloseTo(1/3);
  expect(next.target).not.toEqual(panned.target);
 });
 it('clamps extreme zoom and ignores invalid or zero inputs',()=>{
  let next=pose;for(let i=0;i<100;i++)next=navigateWheel(next,{...wheel,deltaY:-500,metaKey:true},800,600,400,300);
  expect(next.position[2]).toBeCloseTo(.025);
  expect(navigateWheel(pose,{...wheel,deltaY:NaN},800,600,400,300)).toBe(pose);
  expect(navigateWheel(pose,wheel,800,600,400,300)).toBe(pose);
  expect(navigateWheel(pose,{...wheel,deltaY:10},0,600,0,0)).toBe(pose);
 });
});
