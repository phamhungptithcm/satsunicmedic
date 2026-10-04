import {describe,it,expect} from 'vitest';
import {randomUUID,createHash} from 'node:crypto';
import {fullBodyAnatomy} from '../apps/web/src/lib/full-body-anatomy';
import {lessonContentSchema,presentLesson} from '../packages/contracts/src/teaching';
import {bodySnapshot,bodySnapshotSchema,bodyRegistry} from '../packages/contracts/src/body-snapshot';
import {initialBodyScene} from '../packages/anatomy-viewer/src/scene-history';
import {PrivateController} from '../apps/api/src/private';
import type {Database} from '../apps/api/src/database';
import type {AuthRequest} from '../apps/api/src/identity';
const id=randomUUID(),owner=randomUUID();
const content={title:'Bài tim',description:'',objectives:['Mô tả cấu trúc'],blocks:[{id:randomUUID(),kind:'text' as const,title:'Mở đầu',text:'Quan sát',speakerNotes:'PRIVATE SPEAKER NOTE'}]};
function fixture(){let lesson={...content,id,ownerId:owner,revision:1,createdAt:new Date(),sceneCount:0};const db={transaction:async(fn:(tx:unknown)=>unknown)=>fn({}),get:async()=>lesson,put:async(_:string,row:typeof lesson)=>{lesson=row;return row;}} as unknown as Database;return {controller:new PrivateController(db),request:{user:{id:owner}} as AuthRequest,row:()=>lesson};}
describe('private lesson authoring',()=>{
 it('binds the registry to the exact catalog used by the renderer',()=>{expect(bodyRegistry.hash).toBe(createHash('sha256').update(JSON.stringify(fullBodyAnatomy)).digest('hex'));expect(bodyRegistry.version).toBe(fullBodyAnatomy.version);});
 it('rejects duplicate block ids, unknown payload fields and oversized text',()=>{expect(lessonContentSchema.safeParse({...content,blocks:[content.blocks[0],content.blocks[0]]}).success).toBe(false);expect(lessonContentSchema.safeParse({...content,ownerId:owner}).success).toBe(false);expect(lessonContentSchema.safeParse({...content,blocks:[{...content.blocks[0],text:'x'.repeat(5001)}]}).success).toBe(false);});
 it('preserves ordered content and speaker notes in edit view but omits notes from presentation',()=>{expect(presentLesson(content).blocks[0]).not.toHaveProperty('speakerNotes');expect(content.blocks[0]!.speakerNotes).toContain('PRIVATE');});
 it('updates only owned current revision; stale and cross-owner writes fail',async()=>{const f=fixture();const result=await f.controller.updateLesson(f.request,id,{...content,title:'Revised'},'"1"');expect(result.revision).toBe(2);expect(f.row().title).toBe('Revised');await expect(f.controller.updateLesson(f.request,id,content,'"1"')).rejects.toThrow();await expect(f.controller.updateLesson({user:{id:randomUUID()}} as AuthRequest,id,content,'"2"')).rejects.toThrow();});
 it('strips speaker notes at the server boundary and refuses another owner',async()=>{const f=fixture();const value=await f.controller.presentation(f.request,id);expect(JSON.stringify(value)).not.toContain('PRIVATE');await expect(f.controller.presentation({user:{id:randomUUID()}} as AuthRequest,id)).rejects.toThrow();});
 it('round trips the canonical body including hidden parts, opacity, cuts and camera',()=>{const scene={...initialBodyScene(),hidden:[bodyRegistry.structures[0]!],opacity:{[bodyRegistry.structures[1]!]:.3},isolate:[bodyRegistry.structures[1]!],camera:{position:[1,2,3],target:[0,1,0]},sections:{axial:{position:.3,reversed:true,tilt:30},sagittal:{position:.7,reversed:false,tilt:-20}}};const snapshot=bodySnapshot(scene);expect(bodySnapshotSchema.parse(JSON.parse(JSON.stringify(snapshot))).scene).toEqual(scene);expect(bodySnapshotSchema.safeParse({...snapshot,catalogHash:'0'.repeat(64)}).success).toBe(false);expect(()=>bodySnapshot({...scene,hidden:['nonexistent']})).toThrow();expect(()=>bodySnapshot({...scene,skinOpacity:2})).toThrow();});
});

describe('learning position',()=>{
 it('accepts only whitelisted educational state and rejects arbitrary saved data',async()=>{const {learningPositionSchema}=await import('../packages/contracts/src/learning-position');const position={schemaVersion:1,unitRevision:'2026-10-01',topicId:'heart-failure',level:'medical',step:2};expect(learningPositionSchema.safeParse(position).success).toBe(true);for(const patch of [{topicId:'unknown'},{notes:'patient information'},{step:-1},{level:'admin'}])expect(learningPositionSchema.safeParse({...position,...patch}).success).toBe(false);});
});
