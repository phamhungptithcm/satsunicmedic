import {Controller,Get,Post,Delete,Body,Param,Req,Headers,Inject,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {randomBytes,randomUUID} from 'node:crypto';
import {classCreateSchema,classJoinSchema,assignmentCreateSchema,submissionSchema,lessonContentSchema,presentLesson,uuid} from '@hs/contracts';
import {Database,keyId} from './database.js';
import {SessionGuard,type AuthRequest} from './identity.js';
import {CsrfGuard,digest} from './security.js';
import {fail} from './errors.js';
import type {Classroom} from './domain.js';
import type {Transaction} from 'firebase-admin/firestore';
@Controller('api/v1/classes') @UseGuards(SessionGuard)
export class ClassroomController{
 constructor(@Inject(Database) private db:Database){}
 private async access(id:string,user:string,tx?:Transaction){uuid.parse(id);const classroom=await this.db.get('classes',id,tx);if(!classroom||classroom.closedAt)fail(404,'NOT_FOUND');if(classroom.ownerId!==user){const member=await this.db.get('classMembers',keyId(id,user),tx);if(!member||member.revokedAt)fail(404,'NOT_FOUND');}return classroom;}
 private owner(classroom:Classroom,user:string){if(classroom.ownerId!==user)fail(404,'NOT_FOUND');}
 @Get() async list(@Req() req:AuthRequest){
  const owned=await this.db.list('classes',this.db.collection('classes').where('ownerId','==',req.user.id),51);
  const memberships=await this.db.list('classMembers',this.db.collection('classMembers').where('userId','==',req.user.id),51);
  if(owned.length>50||memberships.length>50)fail(413,'CLASS_LIST_CAPACITY');
  const joined=await Promise.all(memberships.filter(m=>!m.revokedAt).map(m=>this.db.get('classes',m.classId)));
  const rows=[...new Map([...owned,...joined.filter((c):c is Classroom=>!!c)].map(c=>[c.id,c])).values()];
  return {items:rows.filter(c=>!c.closedAt).map(c=>({id:c.id,title:c.title,owner:c.ownerId===req.user.id}))};
 }
 @Post() @UseGuards(CsrfGuard) async create(@Req() req:AuthRequest,@Body() body:unknown,@Headers('idempotency-key') key:string){uuid.parse(key);const input=classCreateSchema.parse(body);return this.db.transaction(async tx=>{
  const recordId=keyId('class.create',req.user.id,key),fingerprint=digest(JSON.stringify(input)),replay=await this.db.get('idempotency',recordId,tx);
  if(replay){if(replay.fingerprint!==fingerprint)fail(409,'IDEMPOTENCY_CONFLICT');return z.object({id:uuid,title:z.string(),owner:z.boolean()}).parse(replay.response);}
  const classes=await this.db.list('classes',this.db.collection('classes').where('ownerId','==',req.user.id),50,tx);if(classes.length>=50)fail(422,'CLASS_LIMIT');
  const row={...input,id:randomUUID(),ownerId:req.user.id,createdAt:new Date(),closedAt:null,memberCount:0,assignmentCount:0};await this.db.put('classes',row,tx);const response={id:row.id,title:row.title,owner:true};await this.db.put('idempotency',{id:recordId,userId:req.user.id,key,fingerprint,response,expiresAt:new Date(Date.now()+86400000)},tx);return response;
 });}
 @Post(':id/invites') @UseGuards(CsrfGuard) async invite(@Req() req:AuthRequest,@Param('id') id:string){return this.db.transaction(async tx=>{
  const classroom=await this.access(id,req.user.id,tx);this.owner(classroom,req.user.id);
  const token=randomBytes(32).toString('hex'),expiresAt=new Date(Date.now()+86400000);
  // One active code per classroom: issuing a new code revokes the previous code atomically.
  await this.db.put('classInvites',{id:classroom.id,classId:id,tokenHash:digest(token),expiresAt},tx);return {token,expiresAt};
 });}
 @Post(':id/join') @UseGuards(CsrfGuard) async join(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown){uuid.parse(id);const input=classJoinSchema.parse(body);return this.db.transaction(async tx=>{
  const classroom=await this.db.get('classes',id,tx),invite=await this.db.get('classInvites',id,tx),memberId=keyId(id,req.user.id),existing=await this.db.get('classMembers',memberId,tx);
  if(!classroom||classroom.closedAt||!invite||invite.expiresAt<=new Date()||invite.tokenHash!==digest(input.token))fail(404,'INVITE_UNAVAILABLE');
  if(classroom.ownerId===req.user.id)return {joined:true};
  if(existing?.revokedAt)fail(403,'MEMBERSHIP_REVOKED');
  if(!existing&&classroom.memberCount>=100)fail(422,'CLASS_FULL');
  const memberships=await this.db.list('classMembers',this.db.collection('classMembers').where('userId','==',req.user.id),50,tx);if(!existing&&memberships.length>=50)fail(422,'CLASS_LIMIT');
  if(!existing){await this.db.put('classMembers',{id:memberId,classId:id,userId:req.user.id,displayName:input.displayName,createdAt:new Date(),revokedAt:null},tx);await this.db.put('classes',{...classroom,memberCount:classroom.memberCount+1},tx);}return {joined:true};
 });}
 @Get(':id') async detail(@Req() req:AuthRequest,@Param('id') id:string){const classroom=await this.access(id,req.user.id);const assignments=await this.db.list('teachingAssignments',this.db.collection('teachingAssignments').where('classId','==',id),101);if(assignments.length>100)fail(413,'CLASS_CAPACITY');return {id,title:classroom.title,owner:classroom.ownerId===req.user.id,assignments:assignments.map(a=>({id:a.id,classId:id,title:a.content.title,lessonRevision:a.lessonRevision,dueAt:a.dueAt}))};}
 @Post(':id/assignments') @UseGuards(CsrfGuard) async assign(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown,@Headers('idempotency-key') key:string){uuid.parse(key);const input=assignmentCreateSchema.parse(body);return this.db.transaction(async tx=>{
  const classroom=await this.access(id,req.user.id,tx);this.owner(classroom,req.user.id);const recordId=keyId('class.assign',req.user.id,key),fingerprint=digest(JSON.stringify({id,input})),replay=await this.db.get('idempotency',recordId,tx);
  if(replay){if(replay.fingerprint!==fingerprint)fail(409,'IDEMPOTENCY_CONFLICT');return replay.response;}
  const lesson=await this.db.get('lessons',input.lessonId,tx);
  if(!lesson||lesson.ownerId!==req.user.id)fail(404,'NOT_FOUND');if(lesson.revision!==input.lessonRevision)fail(409,'REVISION_CONFLICT');
  if(classroom.assignmentCount>=100)fail(422,'ASSIGNMENT_LIMIT');const dueAt=input.dueAt?new Date(input.dueAt):null;if(dueAt&&dueAt<=new Date())fail(422,'INVALID_DUE_DATE');
  const content=presentLesson(lessonContentSchema.parse({title:lesson.title,description:lesson.description,objectives:lesson.objectives??[],blocks:lesson.blocks??[]}));
  if(!content.blocks.length)fail(422,'EMPTY_LESSON');
  const row={id:randomUUID(),classId:id,ownerId:req.user.id,lessonId:lesson.id,lessonRevision:lesson.revision,content,dueAt,createdAt:new Date()};
  await this.db.put('teachingAssignments',row,tx);await this.db.put('classes',{...classroom,assignmentCount:classroom.assignmentCount+1},tx);const response={id:row.id,classId:id,title:content.title,lessonRevision:row.lessonRevision,dueAt:dueAt?.toISOString()??null};await this.db.put('idempotency',{id:recordId,userId:req.user.id,key,fingerprint,response,expiresAt:new Date(Date.now()+86400000)},tx);return response;
 });}
 @Get(':id/assignments/:assignmentId') async assignment(@Req() req:AuthRequest,@Param('id') id:string,@Param('assignmentId') assignmentId:string){await this.access(id,req.user.id);uuid.parse(assignmentId);const row=await this.db.get('teachingAssignments',assignmentId);if(!row||row.classId!==id)fail(404,'NOT_FOUND');const submission=await this.db.get('teachingSubmissions',keyId(assignmentId,req.user.id));const parsed=lessonContentSchema.safeParse(row.content);if(!parsed.success)fail(422,'CONTENT_REVISION_UNAVAILABLE');return {id:row.id,content:presentLesson(parsed.data),lessonRevision:row.lessonRevision,dueAt:row.dueAt,submission:submission?{reflection:submission.reflection,createdAt:submission.createdAt}:null};}
 @Post(':id/assignments/:assignmentId/submissions') @UseGuards(CsrfGuard) async submit(@Req() req:AuthRequest,@Param('id') id:string,@Param('assignmentId') assignmentId:string,@Body() body:unknown){uuid.parse(assignmentId);const input=submissionSchema.parse(body);return this.db.transaction(async tx=>{
  const classroom=await this.access(id,req.user.id,tx);if(classroom.ownerId===req.user.id)fail(403,'STUDENT_ONLY');const assignment=await this.db.get('teachingAssignments',assignmentId,tx),submissionId=keyId(assignmentId,req.user.id),old=await this.db.get('teachingSubmissions',submissionId,tx);
  if(!assignment||assignment.classId!==id)fail(404,'NOT_FOUND');if(old){if(old.reflection!==input.reflection)fail(409,'ALREADY_SUBMITTED');return {submitted:true,createdAt:old.createdAt};}
  if(assignment.dueAt&&assignment.dueAt<=new Date())fail(422,'DEADLINE_PASSED');const createdAt=new Date();await this.db.put('teachingSubmissions',{id:submissionId,assignmentId,classId:id,userId:req.user.id,reflection:input.reflection,createdAt},tx);return {submitted:true,createdAt};
 });}
 @Get(':id/results/:assignmentId') async results(@Req() req:AuthRequest,@Param('id') id:string,@Param('assignmentId') assignmentId:string){const classroom=await this.access(id,req.user.id);this.owner(classroom,req.user.id);uuid.parse(assignmentId);const assignment=await this.db.get('teachingAssignments',assignmentId);if(!assignment||assignment.classId!==id)fail(404,'NOT_FOUND');const rows=await this.db.list('teachingSubmissions',this.db.collection('teachingSubmissions').where('assignmentId','==',assignmentId),101);if(rows.length>100)fail(413,'CLASS_CAPACITY');const members=await this.db.list('classMembers',this.db.collection('classMembers').where('classId','==',id),101);return {items:rows.map(r=>({displayName:members.find(m=>m.userId===r.userId)?.displayName??'Học viên',reflection:r.reflection,createdAt:r.createdAt}))};}
 @Delete(':id/members/:userId') @UseGuards(CsrfGuard) async revoke(@Req() req:AuthRequest,@Param('id') id:string,@Param('userId') userId:string){uuid.parse(userId);return this.db.transaction(async tx=>{const classroom=await this.access(id,req.user.id,tx);this.owner(classroom,req.user.id);const member=await this.db.get('classMembers',keyId(id,userId),tx);if(!member)fail(404,'NOT_FOUND');await this.db.put('classMembers',{...member,revokedAt:new Date()},tx);return {revoked:true};});}
 @Get(':id/members') async members(@Req() req:AuthRequest,@Param('id') id:string){const classroom=await this.access(id,req.user.id);this.owner(classroom,req.user.id);const rows=await this.db.list('classMembers',this.db.collection('classMembers').where('classId','==',id),101);if(rows.length>100)fail(413,'CLASS_CAPACITY');return {items:rows.map(m=>({userId:m.userId,displayName:m.displayName,revoked:!!m.revokedAt}))};}
}
