import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { z } from 'zod';
import { uuid, relationForDisease, DIRECTORY_VERSION, facilitySearchSchema, facilityViewSchema, branchServiceSchema, normalizeDirectoryTerm, type FacilityView } from '@hs/contracts';
import { Database, FieldPath } from './database.js';
import { digest } from './security.js';
import { fail } from './errors.js';
import type { FacilityBranch } from './domain.js';
const cursorSchema=z.object({v:z.literal(DIRECTORY_VERSION),scope:z.string().length(64),name:z.string().max(300),id:uuid}).strict();
export function facilityView(row:FacilityBranch,now=new Date()):FacilityView|null {
 if(row.status!=='PUBLISHED'||!row.checkedAt||row.checkedAt>now||!row.reviewDueAt||row.reviewDueAt<=now)return null;
 const services=(row.services??[]).flatMap(value=>{const parsed=branchServiceSchema.safeParse(value);return parsed.success&&new Date(parsed.data.evidence.checkedAt)<=now&&new Date(parsed.data.reviewDueAt)>now?[parsed.data]:[];});
 const view=facilityViewSchema.safeParse({id:row.id,legalName:row.legalName,branchName:row.branchName,address:row.address,areaCode:row.areaCode,officialUrl:row.officialUrl,specialties:row.specialties,services,evidence:row.evidence,checkedAt:row.checkedAt.toISOString(),reviewDueAt:row.reviewDueAt.toISOString()});
 return view.success&&view.data.evidence.every(e=>new Date(e.checkedAt)<=now)?view.data:null;
}
export function directoryScope(input:z.infer<typeof facilitySearchSchema>){return digest(JSON.stringify([DIRECTORY_VERSION,input.areaCode??'',input.specialty??'',input.specialtyId??'',input.diseaseId??'',normalizeDirectoryTerm(input.query),input.limit]));}
export function directoryCursor(scope:string,name:string,id:string){return Buffer.from(JSON.stringify({v:DIRECTORY_VERSION,scope,name,id})).toString('base64url');}
export function readDirectoryCursor(cursor:string,scope:string){
 try{if(!/^[A-Za-z0-9_-]+$/.test(cursor))throw new Error();const anchor=cursorSchema.parse(JSON.parse(Buffer.from(cursor,'base64url').toString('utf8')));if(anchor.scope!==scope)throw new Error();return anchor;}catch{fail(400,'INVALID_CURSOR');}
}
@Controller('api/v1/facilities')
export class FacilityController {
 constructor(@Inject(Database) private db:Database){}
 @Post('search') async search(@Body() body:unknown){
  const input=facilitySearchSchema.parse(body),scope=directoryScope(input),now=new Date();
  const related=input.diseaseId?relationForDisease(input.diseaseId):null;
  let query=this.db.collection('facilities').where('status','==','PUBLISHED');
  if(input.areaCode)query=query.where('areaCode','==',input.areaCode);
  if(input.specialty)query=query.where('specialties','array-contains',input.specialty);
  query=query.orderBy('legalName').orderBy(FieldPath.documentId());
  if(input.cursor){const anchor=readDirectoryCursor(input.cursor,scope);query=query.startAfter(anchor.name,anchor.id);}
  const items:FacilityView[]=[];const terms=normalizeDirectoryTerm(input.query).split(' ').filter(Boolean);
  // Bound candidate reads. A continuation can be present on an empty page; never report false exhaustion.
  for(let read=0;read<256;read+=64){
   const page=await query.limit(64).get();
   for(let index=0;index<page.docs.length;index++){
    const doc=page.docs[index]!,row=await this.db.decode('facilities',doc.data()),view=facilityView(row,now);
    if(view&&(!related||view.services.some(s=>related.specialtyIds.includes(s.specialtyId)))&&(!input.specialtyId||view.services.some(s=>s.specialtyId===input.specialtyId))&&terms.every(t=>normalizeDirectoryTerm(`${view.legalName} ${view.branchName} ${view.address}`).includes(t)))items.push(view);
    if(items.length===input.limit){return {items,version:DIRECTORY_VERSION,nextCursor:index<page.docs.length-1||page.size===64?directoryCursor(scope,row.legalName,doc.id):null};}
   }
   if(page.size<64)return {items,version:DIRECTORY_VERSION,nextCursor:null};
   const last=page.docs.at(-1)!;
   if(read===192)return {items,version:DIRECTORY_VERSION,nextCursor:directoryCursor(scope,last.get('legalName'),last.id)};
   query=query.startAfter(last);
  }
  throw new Error('Unreachable directory scan');
 }
 @Get(':id') async branch(@Param('id') id:string){uuid.parse(id);const row=await this.db.get('facilities',id);const view=row?facilityView(row):null;if(!view)fail(404,'NOT_FOUND');return view;}
}
