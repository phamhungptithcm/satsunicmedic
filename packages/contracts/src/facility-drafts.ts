import {z} from 'zod';
import {directoryEvidenceSchema,branchServiceSchema,provinceForCode} from './directory.js';
const branch=z.object({id:z.uuid(),legalName:z.string().min(1).max(300),branchName:z.string().min(1).max(300),address:z.string().min(1).max(1000),areaCode:z.string().refine(code=>!!provinceForCode(code)),officialUrl:z.url().startsWith('https://'),sourceIndex:z.int().nonnegative(),services:z.array(branchServiceSchema).max(30),status:z.literal('DRAFT')}).strict();
export const facilityDraftDatasetSchema=z.object({version:z.string(),sources:z.array(directoryEvidenceSchema).min(1),branches:z.array(branch).max(100)}).strict();
