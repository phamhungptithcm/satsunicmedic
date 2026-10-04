import {readFileSync,existsSync} from 'node:fs';
const preflight=JSON.parse(readFileSync(new URL('../docs/implementation/cloud-preflight.json',import.meta.url),'utf8'));
const evidencePath=new URL('../docs/implementation/firebase-production-evidence.json',import.meta.url);
const evidence=existsSync(evidencePath)?JSON.parse(readFileSync(evidencePath,'utf8')):null;
const failures=[];
if(!preflight.billingEnabled)failures.push('Billing chưa được xác minh.');
if(!evidence || evidence.deploymentStatus!=='LIVE_FOUNDATION')failures.push('Chưa có bằng chứng triển khai Firebase foundation.');
if(!preflight.commercialAnatomyAsset)failures.push('Chưa có anatomy asset được xác minh quyền và tính đúng.');
if(!preflight.medicalReviewer)failures.push('Chưa có người duyệt y khoa.');
if(evidence?.authRealAccountEndToEnd!=='PASSED')failures.push('Đăng nhập bằng tài khoản thật và session end-to-end chưa được xác minh.');
if(evidence?.backupRestore!=='PASSED')failures.push('Backup restore chưa được xác minh.');
if(evidence?.fullProductReadiness!=='READY')failures.push('Nghiệm thu đầy đủ sản phẩm và nội dung y khoa chưa hoàn tất.');
// Recorded JSON is evidence navigation, never independent authorization to deploy.
console.log(JSON.stringify({status:failures.length?'NOT_READY':'READY_FOR_REVIEW',deploymentStatus:evidence?.deploymentStatus??'NOT_VERIFIED',failures},null,2));process.exitCode=failures.length?2:0;
