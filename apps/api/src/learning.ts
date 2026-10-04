import {Controller,Get,Post,Delete,Req,Body,Param,Headers,Inject,UseGuards,Query} from '@nestjs/common';
import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {quizQuestionsSchema,attemptSchema,gradeQuiz,sceneSchema,uuid,nextReviewSchedule,type LearningReviewList} from '@hs/contracts';
import {Database,keyId,FieldPath} from './database.js';
import {SessionGuard,type AuthRequest} from './identity.js';
import {CsrfGuard,digest} from './security.js';
import {fail} from './errors.js';
import {currentAssetManifest} from './publication.js';
import {ownedPage} from './pagination.js';
@Controller('api/v1')
export class LearningController {
 constructor(@Inject(Database) private db:Database){}
 @Get('quizzes') async list(){return {items:(await this.db.scan('quizzes',this.db.collection('quizzes').where('status','==','PUBLISHED').orderBy(FieldPath.documentId()),q=>!!q.reviewDueAt&&q.reviewDueAt>new Date(),50)).map(({id,title,revision})=>({id,title,revision}))};}
 @Get('quizzes/:id') async quiz(@Param('id') id:string){uuid.parse(id);const quiz=await this.db.get('quizzes',id);if(!quiz||quiz.status!=='PUBLISHED'||!quiz.reviewDueAt||quiz.reviewDueAt<=new Date())fail(404,'NOT_FOUND');return {id,title:quiz.title,revision:quiz.revision,questions:quizQuestionsSchema.parse(quiz.questions).map(q=>({id:q.id,prompt:q.prompt,options:q.options}))};}
 @Post('quizzes/:id/attempts') @UseGuards(SessionGuard,CsrfGuard) async attempt(@Req() req:AuthRequest,@Param('id') id:string,@Headers('idempotency-key') key:string|undefined,@Body() body:unknown){
  uuid.parse(id);if(!key||!uuid.safeParse(key).success)fail(400,'IDEMPOTENCY_KEY_REQUIRED');const input=attemptSchema.parse(body),fingerprint=digest(JSON.stringify({id,input}));
  return this.db.transaction(async tx=>{
   const uniqueId=keyId('attempt',req.user.id,key);const link=await this.db.get('unique',uniqueId,tx);const replay=link?await this.db.get('attempts',link.targetId,tx):null;
   if(replay){if(replay.fingerprint!==fingerprint)fail(409,'IDEMPOTENCY_CONFLICT');return replay.result;}
   const quiz=await this.db.get('quizzes',id,tx);if(!quiz||quiz.status!=='PUBLISHED'||!quiz.reviewDueAt||quiz.reviewDueAt<=new Date())fail(404,'NOT_FOUND');if(quiz.revision!==input.revision)fail(409,'REVISION_CONFLICT');
   let result;try{result=gradeQuiz(quizQuestionsSchema.parse(quiz.questions),input.answers);}catch{fail(422,'INVALID_ANSWER_SET');}
   const reviewId=keyId('review',req.user.id,id,String(quiz.revision));
   const previous=await this.db.get('learningReviews',reviewId,tx);
   const createdAt=new Date();
   const schedule=nextReviewSchedule(previous?.schedule??null,result.correct===result.total,createdAt);
   const response={...result,nextReview:schedule};
   await this.db.put('learningReviews',{id:reviewId,userId:req.user.id,quizId:id,quizRevision:quiz.revision,schedule,updatedAt:createdAt},tx);
   const attemptId=randomUUID();await this.db.put('attempts',{id:attemptId,userId:req.user.id,quizId:id,quizRevision:quiz.revision,idempotencyKey:key,fingerprint,answers:input.answers,result:response,createdAt},tx);await this.db.put('unique',{id:uniqueId,targetId:attemptId},tx);return response;
  });
 }
 @Get('me/reviews') @UseGuards(SessionGuard) async reviews(@Req() req:AuthRequest,@Query() query:unknown={}):Promise<LearningReviewList>{
  const page=await ownedPage(this.db,'learningReviews',req.user.id,query,'schedule.dueAt','asc');
  const now=new Date();
  const items:LearningReviewList['items']=[];
  // Metadata-only batch: never reconstruct quiz question payloads to list a schedule.
  const ids=[...new Set(page.items.map(row=>row.quizId))];
  const snapshots=ids.length?await this.db.firestore.getAll(...ids.map(id=>this.db.ref('quizzes',id)),{fieldMask:['title','revision','status','reviewDueAt']}):[];
  const quizzes=new Map(snapshots.map(snap=>[snap.id,snap.data()]));
  for(const row of page.items){
   const quiz=quizzes.get(row.quizId);
   if(!quiz||quiz.status!=='PUBLISHED'||!quiz.reviewDueAt||quiz.reviewDueAt.toDate()<=now||quiz.revision!==row.quizRevision)continue;
   items.push({quizId:row.quizId,quizRevision:quiz.revision,title:quiz.title,schedule:row.schedule});
  }
  items.sort((a,b)=>a.schedule.dueAt.localeCompare(b.schedule.dueAt));
  return {items,truncated:page.nextCursor!==null,nextCursor:page.nextCursor};
 }
 @Get('me/progress') @UseGuards(SessionGuard) async progress(@Req() req:AuthRequest,@Query() query:unknown={}){const page=await ownedPage(this.db,'attempts',req.user.id,query);return {...page,items:page.items.map(({id,quizId,quizRevision,result,createdAt})=>({id,quizId,quizRevision,result,createdAt}))};}
 @Post('lessons/:id/shares') @UseGuards(SessionGuard,CsrfGuard) async share(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown){
  uuid.parse(id);const input=z.object({sceneId:uuid,revision:z.int().positive(),expiresAt:z.iso.datetime()}).strict().parse(body);const expires=new Date(input.expiresAt);if(expires<=new Date()||expires.getTime()>Date.now()+7*86400000)fail(422,'INVALID_EXPIRY');
  return this.db.transaction(async tx=>{
   const lesson=await this.db.get('lessons',id,tx),scene=await this.db.get('scenes',input.sceneId,tx);const asset=scene?await this.db.get('assets',scene.assetVersionId,tx):null;
   if(!lesson||lesson.ownerId!==req.user.id||!scene||scene.lessonId!==id)fail(404,'NOT_FOUND');if(scene.revision!==input.revision)fail(409,'REVISION_CONFLICT');if(!asset||asset.status!=='PUBLISHED')fail(422,'ASSET_UNAVAILABLE');
   const m=currentAssetManifest(asset);if(!m.license.allowsPublicSharing)fail(403,'SHARING_NOT_LICENSED');const parsed=sceneSchema.parse(scene.snapshot),snapshot={...parsed,annotations:[],animation:{...parsed.animation,paused:true}};const grantId=randomUUID();
   await this.db.put('shares',{id:grantId,ownerId:req.user.id,lessonId:id,assetVersionId:m.id,sceneRevision:scene.revision,snapshot,expiresAt:expires,revokedAt:null,createdAt:new Date()},tx);await this.db.audit(req.user.id,'scene.share',grantId,tx);return {id:grantId,expiresAt:expires};
  });
 }
 @Get('shares/:id') async shared(@Param('id') id:string){
  uuid.parse(id);return this.db.transaction(async tx=>{
   const grant=await this.db.get('shares',id,tx);if(!grant||grant.revokedAt||grant.expiresAt<=new Date())fail(404,'NOT_FOUND');const asset=await this.db.get('assets',grant.assetVersionId,tx);if(!asset||asset.status!=='PUBLISHED'||!currentAssetManifest(asset).license.allowsPublicSharing)fail(404,'NOT_FOUND');const snapshot=sceneSchema.parse(grant.snapshot);return {scene:{...snapshot,annotations:[],animation:{...snapshot.animation,paused:true}},expiresAt:grant.expiresAt};
  });
 }
 @Delete('shares/:id') @UseGuards(SessionGuard,CsrfGuard) async revoke(@Req() req:AuthRequest,@Param('id') id:string){uuid.parse(id);return this.db.transaction(async tx=>{const row=await this.db.get('shares',id,tx);if(!row||row.ownerId!==req.user.id)fail(404,'NOT_FOUND');await this.db.put('shares',{...row,revokedAt:new Date()},tx);await this.db.audit(req.user.id,'share.revoke',id,tx);return {revoked:true};});}
}
