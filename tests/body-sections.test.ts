import { describe, expect, it } from 'vitest';
import { defaultSection, sceneSections, sectionPlanes, type SectionPlane } from '../packages/anatomy-viewer/src/body-sections';
import { initialBodyScene, commitScene, undoScene, redoScene } from '../packages/anatomy-viewer/src/scene-history';
const bounds = [[-2, 0, -4], [2, 10, 4]] as const;
const distance = (p: SectionPlane, point: number[]) => p.constant + p.normal.reduce((n, a, i) => n + a * point[i]!, 0);
describe('anatomical mesh section planes', () => {
 it('preserves old axial section and allows explicit empty override', () => {
  expect(sceneSections({...initialBodyScene(),clipping:.3}).axial?.position).toBe(.3);
  expect(sceneSections({...initialBodyScene(),clipping:.3,sections:{}})).toEqual({});
  expect(sectionPlanes(bounds,{})).toEqual([]);
 });
 it('horizontal cut retains inferior geometry at the requested regional height', () => {
  const [p]=sectionPlanes(bounds,{axial:{...defaultSection(),position:.3}});
  expect(distance(p!,[0,3,0])).toBeCloseTo(0);expect(distance(p!,[0,2,0])).toBeGreaterThan(0);expect(distance(p!,[0,4,0])).toBeLessThan(0);
 });
 it('coronal and sagittal planes use converted Z and X rather than source Z-up', () => {
  const [c,s]=sectionPlanes(bounds,{coronal:{...defaultSection(),position:.5},sagittal:{...defaultSection(),position:.75}});
  expect(distance(c!,[0,5,0])).toBeCloseTo(0);expect(distance(c!,[0,5,1])).toBeLessThan(0);
  expect(distance(s!,[1,5,0])).toBeCloseTo(0);expect(distance(s!,[2,5,0])).toBeLessThan(0);
 });
 it('three simultaneous cuts retain their intersection and reversal swaps sides', () => {
  const cuts={axial:{...defaultSection(),position:.5},coronal:{...defaultSection(),position:.5},sagittal:{...defaultSection(),position:.5}};
  const p=sectionPlanes(bounds,cuts);expect(p).toHaveLength(3);expect(p.every(x=>distance(x,[-1,2,-1])>0)).toBe(true);
  const [a]=p,[r]=sectionPlanes(bounds,{axial:{...cuts.axial,reversed:true}});
  expect(distance(r!,[-1,2,-1])).toBeCloseTo(-distance(a!,[-1,2,-1]));
 });
 it('oblique planes remain normalized and pass through center at 50 percent', () => {
  for(const axis of ['axial','coronal','sagittal'] as const){
   const [p]=sectionPlanes(bounds,{[axis]:{...defaultSection(),position:.5,tilt:35}});
   expect(Math.hypot(...p!.normal)).toBeCloseTo(1);expect(distance(p!,[0,5,0])).toBeCloseTo(0);
  }
 });
 it('clamps finite controls and rejects invalid spatial metadata', () => {
  expect(sectionPlanes(bounds,{axial:{...defaultSection(),position:4}})).toEqual(sectionPlanes(bounds,{axial:{...defaultSection(),position:1}}));
  expect(()=>sectionPlanes(bounds,{axial:{...defaultSection(),tilt:NaN}})).toThrow();
  expect(()=>sectionPlanes([[0,0,0],[1,Infinity,1]],{})).toThrow();
  expect(()=>sectionPlanes([[2,0,0],[1,1,1]],{})).toThrow();
 });
 it('undo and redo restore all planes and do not share mutable state', () => {
  const h={past:[],present:initialBodyScene(),future:[]};
  const next=commitScene(h,{...h.present,sections:{axial:defaultSection(),coronal:{...defaultSection(),tilt:30}}});
  expect(undoScene(next).present).toEqual(h.present);expect(redoScene(undoScene(next)).present).toEqual(next.present);
  expect(initialBodyScene().sections).toBeUndefined();
 });
});
