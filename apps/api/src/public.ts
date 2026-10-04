import {Controller,Get,Post,Param,Body,Inject,Res} from '@nestjs/common';
import type {Response} from 'express';
import {searchSchema,articleBodySchema,uuid} from '@hs/contracts';
import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {Database,FieldPath,keyId} from './database.js';
import {fail} from './errors.js';
import {publicManifest} from './publication.js';
@Controller('api/v1')
export class PublicController {
 constructor(@Inject(Database) private readonly db:Database) {}
 @Get('health/live') live(){return {status:'ok'};}
 @Get('health/ready') async ready(){await this.db.ready();return {status:'ready'};}
 @Get('anatomy/systems') async systems(){
  const systems=await this.db.list('anatomySystems',this.db.collection('anatomySystems'),101);
  if(systems.length>100) fail(503,'SEARCH_CAPACITY_EXCEEDED');
  const now=new Date();const items=await Promise.all(systems.map(async({systemId})=>{
    const result=await this.db.collection('anatomy').where('systemId','==',systemId).where('published','==',true).where('reviewDueAt','>',now).count().get();
    return {id:systemId,count:result.data().count};
  }));return {items:items.filter(item=>item.count>0)};
 }
 @Post('anatomy/search') async search(@Body() input:unknown){
  const {query,locale,limit}=searchSchema.parse(input),term=query.toLowerCase();let q=this.db.collection('anatomy').where('published','==',true);
  if(term) q=q.where('grams','array-contains',term.slice(0,3));
  const rows=await this.db.scan('anatomy',q.orderBy(FieldPath.documentId()),r=>!!r.reviewDueAt&&r.reviewDueAt>new Date()&&(r.nameVi.toLowerCase().includes(term)||(r.nameEn??'').toLowerCase().includes(term)),limit);
  return {items:rows.map(r=>({id:r.id,name:locale==='en'?(r.nameEn??r.nameVi):r.nameVi,systemId:r.systemId,laterality:r.laterality}))};
 }
 @Get('anatomy/structures/:id') async structure(@Param('id') id:string){const row=await this.db.get('anatomy',id);if(!row||!row.published||!row.reviewDueAt||row.reviewDueAt<=new Date()) fail(404,'NOT_FOUND');return {id:row.id,name:row.nameVi,nameEn:row.nameEn,systemId:row.systemId,laterality:row.laterality};}
 @Get('assets/current') async currentAsset(){const now=new Date();const rows=await this.db.scan('assets',this.db.collection('assets').where('status','==','PUBLISHED').orderBy('createdAt','desc'),r=>!!r.reviewDueAt&&r.reviewDueAt>now&&(!r.licenseExpiresAt||r.licenseExpiresAt>now),1);return {asset:rows[0]?publicManifest(rows[0].manifest):null};}
 @Get('assets/manifests/:id') async manifest(@Param('id') id:string){uuid.parse(id);const row=await this.db.get('assets',id);if(!row||row.status!=='PUBLISHED'||!row.reviewDueAt||row.reviewDueAt<=new Date()||(row.licenseExpiresAt&&row.licenseExpiresAt<=new Date())) fail(404,'NOT_FOUND');return publicManifest(row.manifest);}
 @Post('assets/versions/:id/access') async access(@Param('id') id:string){await this.manifest(id);fail(503,'ASSET_DELIVERY_NOT_CONFIGURED');}
 @Post('knowledge/search') async knowledge(@Body() input:unknown){
  const {query,locale,limit}=searchSchema.parse(input),term=query.toLowerCase();let q=this.db.collection('articleSearch').where('locale','==',locale);
  if(term)q=q.where('grams','array-contains',term.slice(0,3));
  const rows=await this.db.scan('articleSearch',q.orderBy(FieldPath.documentId()),r=>r.reviewDueAt>new Date()&&r.title.toLowerCase().includes(term),limit);
  return {items:rows.map(({slug,title,summary})=>({slug,title,summary}))};
 }
 @Get('articles/:slug') async article(@Param('slug') slug:string){
  if(!/^[a-z0-9-]{1,120}$/.test(slug)) fail(404,'NOT_FOUND');
  return this.db.transaction(async tx=>{
   const link=await this.db.get('unique',keyId('slug',slug),tx);const row=link?await this.db.get('articles',link.targetId,tx):null;const rev=row?.publishedRevisionId?await this.db.get('revisions',row.publishedRevisionId,tx):null;
   if(!row||!rev||rev.status!=='PUBLISHED'||!rev.reviewDueAt||rev.reviewDueAt<=new Date()) fail(404,'NOT_FOUND');
   const reviews=await this.db.list('reviews',this.db.collection('reviews').where('revisionId','==',rev.id).where('approved','==',true).where('contentHash','==',rev.contentHash).orderBy('createdAt','desc'),1,tx);
   return {slug:row.slug,locale:row.locale,body:articleBodySchema.parse(rev.body),reviewDueAt:rev.reviewDueAt,reviewedAt:reviews[0]?.createdAt??null};
  });
 }
 @Post('content-reports') async report(@Body() body:unknown,@Res({passthrough:true}) res:Response){const input=z.object({objectId:z.string().min(1).max(120),category:z.enum(['accuracy','accessibility','license','other']),text:z.string().max(1000).optional()}).strict().parse(body);const report=await this.db.put('reports',{...input,id:randomUUID(),createdAt:new Date()});res.status(201);return {id:report.id,status:'received'};}
}
