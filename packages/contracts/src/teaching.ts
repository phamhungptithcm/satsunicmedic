import { z } from 'zod';
import {learningTopicIds} from './learning-position.js';
import {bodySnapshotSchema} from './body-snapshot.js';
const blockBase={id:z.uuid(),title:z.string().trim().min(1).max(160),speakerNotes:z.string().max(2000).default('')};
export const lessonBlockSchema=z.discriminatedUnion('kind',[
 z.object({...blockBase,kind:z.literal('text'),text:z.string().trim().min(1).max(5000)}).strict(),
 z.object({...blockBase,kind:z.literal('topic'),topicId:z.enum(learningTopicIds)}).strict(),
 z.object({...blockBase,kind:z.literal('atlas'),snapshot:bodySnapshotSchema}).strict(),
 z.object({...blockBase,kind:z.literal('quiz'),quizId:z.uuid(),quizRevision:z.int().positive()}).strict(),
]);
export const lessonContentSchema=z.object({
 title:z.string().trim().min(1).max(160),description:z.string().max(2000),
 objectives:z.array(z.string().trim().min(1).max(300)).max(10),
 blocks:z.array(lessonBlockSchema).max(100),
}).strict().superRefine((value,ctx)=>{
 if(new Set(value.blocks.map(b=>b.id)).size!==value.blocks.length)ctx.addIssue({code:'custom',message:'Duplicate block ID'});
 // Keep the entire lesson safely inside request/document budgets, even for multibyte text.
 if(new TextEncoder().encode(JSON.stringify(value)).length>120000)ctx.addIssue({code:'custom',message:'Lesson is too large'});
});
export type LessonContent=z.infer<typeof lessonContentSchema>;
export type LessonBlock=z.infer<typeof lessonBlockSchema>;
export const lessonDocumentSchema=lessonContentSchema.safeExtend({id:z.uuid(),revision:z.int().positive()});
export type LessonDocument=z.infer<typeof lessonDocumentSchema>;
export function presentLesson(content:LessonContent){return {...content,blocks:content.blocks.map(({speakerNotes:_,...block})=>block)};}
