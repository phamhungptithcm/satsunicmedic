import {z} from 'zod';
import {bodyRegistry} from './body-registry.js';
export {bodyRegistry};
const id=z.string().max(100),finite=z.number().finite(),vec=z.tuple([finite.min(-100).max(100),finite.min(-100).max(100),finite.min(-100).max(100)]);
const cut=z.object({position:finite.min(0).max(1),reversed:z.boolean(),tilt:finite.min(-60).max(60)}).strict();
const source=new Set(bodyRegistry.structures),concept=new Set(bodyRegistry.concepts),regions=new Set(['all',...bodyRegistry.regions]),systems=new Set(['',...bodyRegistry.systems]);
const mapped=(value:string)=>source.has(value)||concept.has(value);
export const bodySceneSchema=z.object({
 system:id.optional(),query:z.string().max(120).optional(),region:id,selected:id.nullable(),inside:z.boolean(),skinOpacity:finite.min(0).max(1),
 hidden:z.array(id).max(5000),opacity:z.record(id,finite.min(0).max(1)),isolate:z.array(id).max(5000).nullable(),
 clipping:finite.min(0).max(1).nullable(),sections:z.object({axial:cut.optional(),coronal:cut.optional(),sagittal:cut.optional()}).strict().optional(),
 camera:z.object({position:vec,target:vec}).strict().nullable(),view:z.enum(['front','back','left','right']),zoom:z.int().min(-10000).max(10000),focus:id,focusRevision:z.int().nonnegative(),labels:z.boolean(),
}).strict().superRefine((scene,ctx)=>{
 if(!regions.has(scene.region)||!systems.has(scene.system??'')||(scene.selected&&!mapped(scene.selected))||(!['all','@scope'].includes(scene.focus)&&!regions.has(scene.focus)&&!mapped(scene.focus)))ctx.addIssue({code:'custom',message:'Unmapped scene context'});
 if([...scene.hidden,...(scene.isolate??[]),...Object.keys(scene.opacity)].some(value=>!source.has(value)))ctx.addIssue({code:'custom',message:'Unmapped structure'});
});
export const bodySnapshotSchema=z.object({schemaVersion:z.literal(2),catalogVersion:z.literal(bodyRegistry.version),catalogHash:z.literal(bodyRegistry.hash),scene:bodySceneSchema}).strict();
export type BodySnapshot=z.infer<typeof bodySnapshotSchema>;
export function bodySnapshot(scene:unknown):BodySnapshot{return bodySnapshotSchema.parse({schemaVersion:2,catalogVersion:bodyRegistry.version,catalogHash:bodyRegistry.hash,scene});}
