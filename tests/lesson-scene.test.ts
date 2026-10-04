import {describe,it,expect} from 'vitest';
import {fullBodyAnatomy as catalog} from '../apps/web/src/lib/full-body-anatomy';
import {initialBodyScene,selectionBounds} from '../packages/anatomy-viewer/src/scene-history';
import {sceneSections,sectionPlanes} from '../packages/anatomy-viewer/src/body-sections';
import {atlasToHeart} from '../packages/anatomy-viewer/src/canonical-heart';
import {lessonCamera,lessonPlanes,lessonSourceOpacity,lessonSourceVisible} from '../packages/anatomy-viewer/src/lesson-scene';
describe('discovery to lesson scene',()=>{
 it('preserves camera direction and distance under uniform registration without mutating history',()=>{
  const scene={...initialBodyScene(),camera:{position:[.1,1.3,.4],target:[.02,1.25,.12]}};
  const before=structuredClone(scene),pose=lessonCamera(scene)!;
  expect(pose.position).toEqual(atlasToHeart(scene.camera.position));
  for(let axis=0;axis<3;axis++)expect(pose.position[axis]!-pose.target[axis]!).toBeCloseTo((scene.camera.position[axis]!-scene.camera.target[axis]!)*25,10);
  pose.position[0]=99;expect(scene).toEqual(before);
 });
 it('preserves the same retained half-space for tilted, reversed and legacy cuts',()=>{
  for(const sections of [{axial:{position:.63,tilt:30,reversed:false},coronal:{position:.2,tilt:-45,reversed:true},sagittal:{position:.8,tilt:10,reversed:false}},undefined]){
   const scene={...initialBodyScene(),sections,clipping:.6};
   const originals=sectionPlanes(selectionBounds(catalog,scene.region),sceneSections(scene));
   const converted=lessonPlanes(catalog,scene);
   for(const point of [[0,0,0],[.1,1.2,.13],[-.4,1.8,-.3]])for(let i=0;i<originals.length;i++){
    const p=originals[i]!,q=converted[i]!,transformed=atlasToHeart(point);
    const distance=p.constant+p.normal.reduce((sum,n,axis)=>sum+n*point[axis]!,0);
    const registered=q.constant+q.normal.reduce((sum,n,axis)=>sum+n*transformed[axis]!,0);
    expect(registered).toBeCloseTo(distance*25,10);
   }
  }
 });
 it('honors hidden, isolated and zero-opacity sources including overlay visibility',()=>{
  const scene={...initialBodyScene(),hidden:['a'],isolate:['a','b','c'],opacity:{b:0,c:.42}};
  expect(['a','b','c','d'].map(id=>lessonSourceVisible(id,scene))).toEqual([false,false,true,false]);
  expect(lessonSourceOpacity('c',.3,scene)).toBe(.42);
  expect(lessonSourceOpacity('b',1,scene)).toBe(0);
 });
 it('keeps standalone lesson defaults and clearing context restores visibility',()=>{
  expect(lessonCamera()).toBeNull();expect(lessonPlanes(catalog)).toEqual([]);
  expect(lessonSourceVisible('a')).toBe(true);expect(lessonSourceOpacity('a',.3)).toBe(.3);
 });
});
