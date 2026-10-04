import {readFile,writeFile} from 'node:fs/promises';
import {facilityDraftDatasetSchema} from '../../packages/contracts/src/facility-drafts.js';
const dataset=facilityDraftDatasetSchema.parse(JSON.parse(await readFile('docs/data/facility-drafts.json','utf8')));
if(new Set(dataset.branches.map(b=>b.id)).size!==dataset.branches.length)throw new Error('Duplicate branch ID');
const normalized=dataset.branches.map(({sourceIndex,...b})=>{const evidence=dataset.sources[sourceIndex];if(!evidence||new Date(evidence.checkedAt)>new Date())throw new Error('Missing or future source evidence');return {...b,specialties:[],checkedAt:evidence.checkedAt,reviewDueAt:null,evidence:[evidence]};});
await writeFile('/tmp/edu-dir-facility-drafts.json',JSON.stringify({version:dataset.version,items:normalized},null,2)+'\n');
console.log(JSON.stringify({mode:'DRY_RUN',branches:normalized.length,verifiedBranchServices:normalized.reduce((n,b)=>n+b.services.length,0),publication:'DRAFT_ONLY',output:'/tmp/edu-dir-facility-drafts.json'}));
