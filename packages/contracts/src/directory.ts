import { z } from 'zod';
import {relationForDisease} from './disease-directory.js';

export const DIRECTORY_VERSION = '2026-10-03.1';
export const provinceSource = 'https://baochinhphu.vn/bang-danh-muc-va-ma-so-cua-34-tinh-thanh-moi-3321-don-vi-hanh-chinh-cap-xa-moi-102250704153652947.htm';
export const provinceChanges = [{code:'75',effectiveFrom:'2026-04-30',kind:'city',source:'https://chinhphu.vn/?classid=1&docid=218009&pageid=27160'}] as const;
// Official codes from QĐ 19/2025; province names omit administrative prefixes.
export const provinces = [
 ['01','Hà Nội'],['04','Cao Bằng'],['08','Tuyên Quang'],['11','Điện Biên'],['12','Lai Châu'],['14','Sơn La'],['15','Lào Cai'],['19','Thái Nguyên'],['20','Lạng Sơn'],['22','Quảng Ninh'],['24','Bắc Ninh'],['25','Phú Thọ'],['31','Hải Phòng'],['33','Hưng Yên'],['37','Ninh Bình'],['38','Thanh Hóa'],['40','Nghệ An'],['42','Hà Tĩnh'],['44','Quảng Trị'],['46','Huế'],['48','Đà Nẵng'],['51','Quảng Ngãi'],['52','Gia Lai'],['56','Khánh Hòa'],['66','Đắk Lắk'],['68','Lâm Đồng'],['75','Đồng Nai'],['79','Hồ Chí Minh'],['80','Tây Ninh'],['82','Đồng Tháp'],['86','Vĩnh Long'],['91','An Giang'],['92','Cần Thơ'],['96','Cà Mau'],
].map(([code,name])=>({code:code!,name:name!,effectiveFrom:'2025-07-01',source:provinceSource}));
export const specialties = [
 {id:'cardiology',name:'Tim mạch'}, {id:'respiratory',name:'Hô hấp'}, {id:'neurology',name:'Thần kinh'},
 {id:'endocrinology',name:'Nội tiết'}, {id:'nephrology',name:'Thận'}, {id:'urology',name:'Tiết niệu'},
 {id:'gastroenterology',name:'Tiêu hóa'}, {id:'rheumatology',name:'Cơ xương khớp'},
] as const;
export const specialtyIdSchema = z.enum(specialties.map(s=>s.id));
export const directoryEvidenceSchema=z.object({url:z.url().startsWith('https://'),title:z.string().trim().min(1).max(300),checkedAt:z.iso.datetime()}).strict();
export const branchServiceSchema=z.object({specialtyId:specialtyIdSchema,evidence:directoryEvidenceSchema,reviewDueAt:z.iso.datetime()}).strict();
export const facilitySearchSchema=z.object({
 areaCode:z.string().trim().max(30).optional(), // Existing API codes remain accepted for compatibility.
 specialty:z.string().trim().max(120).optional(),
 specialtyId:specialtyIdSchema.optional(),
 diseaseId:z.string().max(100).refine(id=>relationForDisease(id)!==null).optional(),
 query:z.string().trim().max(120).default(''),
 cursor:z.string().max(1024).optional(),limit:z.int().min(1).max(100).default(20),
}).strict();
export const facilityViewSchema=z.object({
 id:z.uuid(),legalName:z.string().min(1).max(300),branchName:z.string().min(1).max(300),address:z.string().min(1).max(1000),areaCode:z.string(),
 officialUrl:z.url().startsWith('https://'),specialties:z.array(z.string()),
 services:z.array(branchServiceSchema),evidence:z.array(directoryEvidenceSchema).min(1).max(20),
 checkedAt:z.iso.datetime(),reviewDueAt:z.iso.datetime(),
});
export const facilityPageSchema=z.object({items:z.array(facilityViewSchema),nextCursor:z.string().nullable(),version:z.literal(DIRECTORY_VERSION)});
export type FacilityView=z.infer<typeof facilityViewSchema>;
export type FacilityPage=z.infer<typeof facilityPageSchema>;
export function normalizeDirectoryTerm(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();}
export function provinceForCode(code:string){return provinces.find(p=>p.code===code)??null;}
/** Resolve current names only; former/ambiguous administrative areas need source review. */
export function resolveProvinceAlias(value:string,asOf='2026-10-03'){
 if(asOf<'2025-07-01')return null;
 const normalized=normalizeDirectoryTerm(value).replace(/^(tinh|thanh pho|tp\.?)[ ]+/,'');
 return provinces.find(p=>p.code===value||normalizeDirectoryTerm(p.name)===normalized)??null;
}
