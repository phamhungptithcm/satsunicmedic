import {Controller,Get,Post,Put,Patch,Delete,Body,Param,Req,Headers,Inject,UseGuards,Res,Query} from '@nestjs/common';
import {learningPositionSchema,noteSchema,lessonSchema,lessonContentSchema,lessonDocumentSchema,presentLesson,sceneSchema,validateSceneForAsset,uuid} from '@hs/contracts';
import type {Response} from 'express';
import {randomUUID} from 'node:crypto';
import {Database,keyId} from './database.js';
import {SessionGuard,type AuthRequest} from './identity.js';
import {CsrfGuard,digest} from './security.js';
import {fail} from './errors.js';
import {expectedRevision} from './editor.js';
import {currentAssetManifest} from './publication.js';
import type {Note,Lesson} from './domain.js';
import {ownedPage} from './pagination.js';
const noteView=({id,text,anatomyId,revision}:Note)=>({id,text,anatomyId,revision});
const lessonViewContent=(row:Lesson)=>({title:row.title,description:row.description,objectives:row.objectives??[],blocks:row.blocks??[]});
const lessonView=({id,title,description,revision,objectives=[],blocks=[]}:Lesson)=>({id,title,description,revision,objectives,blocks});
@Controller('api/v1') @UseGuards(SessionGuard)
export class PrivateController {
 constructor(@Inject(Database) private readonly db:Database) {}
 @Get('me') me(@Req() req:AuthRequest) {return {id:req.user.id,roles:req.user.roles};}
 @Get('me/learning-position') position(@Req() req:AuthRequest){const parsed=learningPositionSchema.safeParse(req.user.learningPosition);return {position:parsed.success?parsed.data:null};}
 @Put('me/learning-position') @UseGuards(CsrfGuard) async savePosition(@Req() req:AuthRequest,@Body() body:unknown){const position=learningPositionSchema.parse(body);return this.db.transaction(async tx=>{const user=await this.db.get('users',req.user.id,tx);if(!user||user.disabledAt||user.sessionGeneration!==req.user.sessionGeneration)fail(401,'SESSION_EXPIRED');await this.db.put('users',{...user,learningPosition:position},tx);return {position};});}
 @Get('notes') async notes(@Req() req:AuthRequest,@Query() query:unknown={}) {const page=await ownedPage(this.db,'notes',req.user.id,query);return {...page,items:page.items.map(noteView)};}
 @Post('notes') @UseGuards(CsrfGuard) async createNote(@Req() req:AuthRequest,@Body() body:unknown) {
  const input=noteSchema.parse(body); const now=new Date();
  return noteView(await this.db.put('notes',{...input,anatomyId:input.anatomyId??null,id:randomUUID(),ownerId:req.user.id,revision:1,createdAt:now,updatedAt:now}));
 }
 @Patch('notes/:id') @UseGuards(CsrfGuard) async updateNote(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown,@Headers('if-match') etag:string|undefined) {
  uuid.parse(id);const input=noteSchema.parse(body),revision=expectedRevision(etag);
  return this.db.transaction(async tx=>{
   const row=await this.db.get('notes',id,tx);if(!row||row.ownerId!==req.user.id) fail(404,'NOT_FOUND');if(row.revision!==revision) fail(409,'REVISION_CONFLICT');
   await this.db.put('notes',{...row,...input,anatomyId:input.anatomyId??null,revision:revision+1,updatedAt:new Date()},tx);return {id,...input,revision:revision+1};
  });
 }
 @Delete('notes/:id') @UseGuards(CsrfGuard) async deleteNote(@Req() req:AuthRequest,@Param('id') id:string,@Headers('if-match') etag:string|undefined) {
  uuid.parse(id);const revision=expectedRevision(etag);
  return this.db.transaction(async tx=>{const row=await this.db.get('notes',id,tx);if(!row||row.ownerId!==req.user.id) fail(404,'NOT_FOUND');if(row.revision!==revision) fail(409,'REVISION_CONFLICT');this.db.remove('notes',id,tx);return {deleted:true};});
 }
 @Get('lessons') async lessons(@Req() req:AuthRequest,@Query() query:unknown={}) {const page=await ownedPage(this.db,'lessons',req.user.id,query);return {...page,items:page.items.map(({id,title,description,revision})=>({id,title,description,revision}))};}
 @Post('lessons') @UseGuards(CsrfGuard) async createLesson(@Req() req:AuthRequest,@Body() body:unknown,@Headers('idempotency-key') key?:string) {
  const input=lessonSchema.parse(body);if(key&&!uuid.safeParse(key).success)fail(400,'INVALID_INPUT');
  const fingerprint=digest(JSON.stringify(input));
  return this.db.transaction(async tx=>{
   const recordId=key?keyId('lesson.create',req.user.id,key):null;
   const replay=recordId?await this.db.get('idempotency',recordId,tx):null;
   if(replay){if(replay.fingerprint!==fingerprint)fail(409,'IDEMPOTENCY_CONFLICT');return lessonDocumentSchema.parse(replay.response);}
   const row={...input,id:randomUUID(),ownerId:req.user.id,revision:1,createdAt:new Date(),sceneCount:0};
   await this.db.put('lessons',row,tx);const response=lessonView(row);
   if(recordId&&key)await this.db.put('idempotency',{id:recordId,userId:req.user.id,key,fingerprint,response,expiresAt:new Date(Date.now()+86400000)},tx);
   return response;
  });
 }
 @Get('lessons/:id') async lesson(@Req() req:AuthRequest,@Param('id') id:string,@Res({passthrough:true}) res:Response) {
  uuid.parse(id);const lesson=await this.db.get('lessons',id);if(!lesson||lesson.ownerId!==req.user.id) fail(404,'NOT_FOUND');
  const scenes=(await this.db.list('scenes',this.db.collection('scenes').where('lessonId','==',id),100)).map(({id,snapshot,revision})=>({id,snapshot,revision}));res.setHeader('ETag',`"${lesson.revision}"`);return {...lessonView(lesson),scenes};
 }
 @Patch('lessons/:id') @UseGuards(CsrfGuard) async updateLesson(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown,@Headers('if-match') etag:string|undefined,@Headers('idempotency-key') key?:string) {
  if(key&&!uuid.safeParse(key).success)fail(400,'INVALID_INPUT');
  uuid.parse(id);const input=lessonContentSchema.parse(body),revision=expectedRevision(etag);
  return this.db.transaction(async tx=>{
   const row=await this.db.get('lessons',id,tx);if(!row||row.ownerId!==req.user.id)fail(404,'NOT_FOUND');
   const recordId=key?keyId('lesson.update',req.user.id,key):null,fingerprint=digest(JSON.stringify({id,revision,input}));
   const replay=recordId?await this.db.get('idempotency',recordId,tx):null;
   if(replay){if(replay.fingerprint!==fingerprint)fail(409,'IDEMPOTENCY_CONFLICT');return lessonDocumentSchema.parse(replay.response);}
   if(row.revision!==revision)fail(409,'REVISION_CONFLICT');
   const quizBlocks=input.blocks.filter(b=>b.kind==='quiz');
   const quizIds=[...new Set(quizBlocks.map(b=>b.quizId))];
   const quizzes=await Promise.all(quizIds.map(quizId=>this.db.get('quizzes',quizId,tx)));
   if(quizBlocks.some(block=>!quizzes.some(q=>q&&q.id===block.quizId&&q.revision===block.quizRevision&&q.status==='PUBLISHED'&&q.reviewDueAt&&q.reviewDueAt>new Date())))fail(422,'QUIZ_UNAVAILABLE');
   const updated={...row,...input,revision:revision+1};await this.db.put('lessons',updated,tx);const response=lessonView(updated);
   if(recordId&&key)await this.db.put('idempotency',{id:recordId,userId:req.user.id,key,fingerprint,response,expiresAt:new Date(Date.now()+86400000)},tx);return response;
  });
 }
 @Get('lessons/:id/presentation') async presentation(@Req() req:AuthRequest,@Param('id') id:string) {
  uuid.parse(id);const row=await this.db.get('lessons',id);if(!row||row.ownerId!==req.user.id)fail(404,'NOT_FOUND');
  return {id:row.id,revision:row.revision,...presentLesson(lessonContentSchema.parse(lessonViewContent(row)))};
 }
 @Post('lessons/:id/scenes') @UseGuards(CsrfGuard) async addScene(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown,@Headers('idempotency-key') key:string|undefined) {
  uuid.parse(id);if(!key||!uuid.safeParse(key).success) fail(400,'IDEMPOTENCY_KEY_REQUIRED');const scene=sceneSchema.parse(body),snapshot={...scene,animation:{...scene.animation,paused:true}},fingerprint=digest(JSON.stringify({id,snapshot}));
  return this.db.transaction(async tx=>{
   const lesson=await this.db.get('lessons',id,tx);if(!lesson||lesson.ownerId!==req.user.id) fail(404,'NOT_FOUND');
   const recordId=keyId('scene',req.user.id,key),replay=await this.db.get('idempotency',recordId,tx);
   if(replay){if(replay.fingerprint!==fingerprint) fail(409,'IDEMPOTENCY_CONFLICT');return replay.response;}
   const asset=await this.db.get('assets',scene.assetVersionId,tx);
   if(!asset||asset.status!=='PUBLISHED'||!validateSceneForAsset(scene,currentAssetManifest(asset))) fail(422,'ASSET_UNAVAILABLE');
   if(lesson.sceneCount>=100) fail(422,'SCENE_LIMIT');
   const response={id:randomUUID(),revision:1};
   await this.db.put('scenes',{...response,lessonId:id,assetVersionId:scene.assetVersionId,snapshot},tx);
   await this.db.put('lessons',{...lesson,sceneCount:lesson.sceneCount+1},tx);
   await this.db.put('idempotency',{id:recordId,userId:req.user.id,key,fingerprint,response,expiresAt:new Date(Date.now()+86400000)},tx);
   return response;
  });
 }
 @Put('scenes/:id') @UseGuards(CsrfGuard) async updateScene(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown,@Headers('if-match') etag:string|undefined) {
  uuid.parse(id);const snapshot=sceneSchema.parse(body),revision=expectedRevision(etag);
  return this.db.transaction(async tx=>{
   const row=await this.db.get('scenes',id,tx);const lesson=row?await this.db.get('lessons',row.lessonId,tx):null;const asset=row?await this.db.get('assets',row.assetVersionId,tx):null;
   if(!row||!lesson||lesson.ownerId!==req.user.id) fail(404,'NOT_FOUND');
   if(!asset||asset.status!=='PUBLISHED'||!validateSceneForAsset(snapshot,currentAssetManifest(asset))) fail(422,'ASSET_UNAVAILABLE');
   if(row.revision!==revision) fail(409,'REVISION_CONFLICT');
   await this.db.put('scenes',{...row,snapshot:{...snapshot,animation:{...snapshot.animation,paused:true}},revision:revision+1},tx);return {id,revision:revision+1};
  });
 }
}
