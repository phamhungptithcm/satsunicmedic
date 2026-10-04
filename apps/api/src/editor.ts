import { Controller, Post, Body, Param, Req, Inject, UseGuards, Headers } from '@nestjs/common';
import { articleBodySchema, uuid } from '@hs/contracts';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { Database, keyId, searchGrams } from './database.js';
import { SessionGuard, type AuthRequest } from './identity.js';
import { CsrfGuard } from './security.js';
import { fail } from './errors.js';
import { assertPublishable, contentHash, requireRole } from './publication.js';
export function expectedRevision(value:string|undefined) {
  if(!value || !/^"[1-9][0-9]{0,8}"$/.test(value)) fail(428,'REVISION_REQUIRED');
  return Number(value.slice(1,-1));
}
@Controller('api/v1/editor')
@UseGuards(SessionGuard,CsrfGuard)
export class EditorController {
  constructor(@Inject(Database) private db:Database) {}
  @Post('articles') async create(@Req() req:AuthRequest,@Body() body:unknown) {
    requireRole(req.user.roles,'AUTHOR');
    const input=z.object({slug:z.string().regex(/^[a-z0-9-]{1,120}$/),locale:z.enum(['vi','en']),body:articleBodySchema}).strict().parse(body);
    return this.db.transaction(async tx=>{
      const uniqueId=keyId('slug',input.slug);
      if(await this.db.get('unique',uniqueId,tx)) fail(409,'SLUG_CONFLICT');
      const articleId=randomUUID(),revisionId=randomUUID();
      await this.db.put('articles',{id:articleId,slug:input.slug,locale:input.locale,anatomyId:null,publishedRevisionId:null},tx);
      await this.db.put('unique',{id:uniqueId,targetId:articleId},tx);
      await this.db.put('revisions',{id:revisionId,articleId,authorId:req.user.id,body:input.body,contentHash:contentHash(input.body),status:'DRAFT',revision:1,reviewDueAt:null,createdAt:new Date()},tx);
      await this.db.audit(req.user.id,'article.create',articleId,tx);
      return {articleId,revisionId,revision:1};
    });
  }
  @Post('articles/:id/revisions') async revise(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) {
    requireRole(req.user.roles,'AUTHOR'); uuid.parse(id); const parsed=articleBodySchema.parse(body);
    return this.db.transaction(async tx=>{
      if(!await this.db.get('articles',id,tx)) fail(404,'NOT_FOUND');
      const revisionId=randomUUID();
      await this.db.put('revisions',{id:revisionId,articleId:id,authorId:req.user.id,body:parsed,contentHash:contentHash(parsed),status:'DRAFT',revision:1,reviewDueAt:null,createdAt:new Date()},tx);
      await this.db.audit(req.user.id,'revision.create',revisionId,tx);
      return {id:revisionId,revision:1};
    });
  }
  @Post('revisions/:id/submit') async submit(@Req() req:AuthRequest,@Param('id') id:string,@Headers('if-match') etag:string|undefined) {
    requireRole(req.user.roles,'AUTHOR');uuid.parse(id);const revision=expectedRevision(etag);
    return this.db.transaction(async tx=>{
      const row=await this.db.get('revisions',id,tx);
      if(!row||row.authorId!==req.user.id||row.status!=='DRAFT'||row.revision!==revision) fail(409,'REVISION_CONFLICT');
      await this.db.put('revisions',{...row,status:'IN_REVIEW',revision:revision+1},tx);
      await this.db.audit(req.user.id,'revision.submit',id,tx);
      return {id,revision:revision+1,status:'IN_REVIEW'};
    });
  }
  @Post('revisions/:id/reviews') async review(@Req() req:AuthRequest,@Param('id') id:string,@Headers('if-match') etag:string|undefined,@Body() body:unknown) {
    requireRole(req.user.roles,'REVIEWER');uuid.parse(id);const revision=expectedRevision(etag);
    const input=z.object({approved:z.boolean(),contentHash:z.string().regex(/^[a-f0-9]{64}$/),reviewDueAt:z.iso.datetime()}).strict().parse(body);
    const due=new Date(input.reviewDueAt);
    if(due<=new Date()||due.getTime()>Date.now()+366*86400000) fail(422,'INVALID_REVIEW_DATE');
    return this.db.transaction(async tx=>{
      const row=await this.db.get('revisions',id,tx);
      const reviewId=keyId('review',id,req.user.id);
      const existing=await this.db.get('reviews',reviewId,tx);
      if(!row||row.status!=='IN_REVIEW'||row.revision!==revision) fail(409,'REVISION_CONFLICT');
      if(row.authorId===req.user.id||row.contentHash!==input.contentHash) fail(422,'INDEPENDENT_REVIEW_REQUIRED');
      if(existing) fail(409,'REVIEW_ALREADY_RECORDED');
      await this.db.put('revisions',{...row,status:input.approved?'APPROVED':'DRAFT',reviewDueAt:due,revision:revision+1},tx);
      await this.db.put('reviews',{id:reviewId,revisionId:id,reviewerId:req.user.id,contentHash:row.contentHash,approved:input.approved,createdAt:new Date()},tx);
      await this.db.audit(req.user.id,'revision.review',id,tx);
      return {id,revision:revision+1};
    });
  }
  @Post('revisions/:id/publish') async publish(@Req() req:AuthRequest,@Param('id') id:string,@Headers('if-match') etag:string|undefined) {
    requireRole(req.user.roles,'PUBLISHER');uuid.parse(id);const revision=expectedRevision(etag);
    return this.db.transaction(async tx=>{
      const row=await this.db.get('revisions',id,tx);
      if(!row||row.revision!==revision) fail(409,'REVISION_CONFLICT');
      const article=await this.db.get('articles',row.articleId,tx);
      const reviews=await this.db.list('reviews',this.db.collection('reviews').where('revisionId','==',id).where('approved','==',true).where('contentHash','==',row.contentHash),1,tx);
      if(!article) fail(404,'NOT_FOUND');
      assertPublishable({...row,reviews});
      const body=articleBodySchema.parse(row.body);
      await this.db.put('revisions',{...row,status:'PUBLISHED',revision:revision+1},tx);
      await this.db.put('articles',{...article,publishedRevisionId:id},tx);
      await this.db.put('articleSearch',{id:article.id,slug:article.slug,locale:article.locale,title:body.title,summary:body.summary,reviewDueAt:row.reviewDueAt!,grams:searchGrams(body.title),revisionId:id},tx);
      await this.db.audit(req.user.id,'revision.publish',id,tx);
      return {id,revision:revision+1,status:'PUBLISHED'};
    });
  }
  @Post('articles/:id/withdraw') async withdraw(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) {
    requireRole(req.user.roles,'PUBLISHER');uuid.parse(id);z.object({reason:z.string().min(1).max(500)}).strict().parse(body);
    return this.db.transaction(async tx=>{
      const article=await this.db.get('articles',id,tx);if(!article) fail(404,'NOT_FOUND');
      const row=article.publishedRevisionId?await this.db.get('revisions',article.publishedRevisionId,tx):null;
      if(row) await this.db.put('revisions',{...row,status:'WITHDRAWN',revision:row.revision+1},tx);
      await this.db.put('articles',{...article,publishedRevisionId:null},tx);
      this.db.remove('articleSearch',id,tx);
      await this.db.audit(req.user.id,'article.withdraw',id,tx);
      return {withdrawn:true};
    });
  }
}
