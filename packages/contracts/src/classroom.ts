import {z} from 'zod';
export const classCreateSchema=z.object({title:z.string().trim().min(1).max(160)}).strict();
export const classJoinSchema=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),displayName:z.string().trim().min(1).max(80)}).strict();
export const assignmentCreateSchema=z.object({lessonId:z.uuid(),lessonRevision:z.int().positive(),dueAt:z.iso.datetime().nullable()}).strict();
export const submissionSchema=z.object({reflection:z.string().trim().max(2000)}).strict();
export type ClassView={id:string;title:string;owner:boolean};
export type AssignmentView={id:string;classId:string;title:string;lessonRevision:number;dueAt:string|null};
