/** Local-only browser acceptance. Run against the isolated build and demo emulators. */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const apiRequire=createRequire(new URL('../../apps/api/package.json',import.meta.url));
const {initializeApp}=apiRequire('firebase-admin/app');
const {getFirestore}=apiRequire('firebase-admin/firestore');
const base='http://127.0.0.1:4285';
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8189';
process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9199';
const db=getFirestore(initializeApp({projectId:'demo-humanscope'},`readiness-${randomUUID()}`));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const results=[];
let activePage;
const httpFailures=[];
const output=new URL('../../output/playwright/readiness-completion/',import.meta.url);
await mkdir(output,{recursive:true});
try {
  const signup=await context.request.post('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{data:{email:`${randomUUID()}@example.test`,password:'Emulator-only-12345',returnSecureToken:true}});
  assert.equal(signup.status(),200);
  const {idToken}=await signup.json();
  const csrf=await (await context.request.get(`${base}/auth/csrf`)).json();
  const session=await context.request.post(`${base}/auth/session`,{headers:{Origin:base,'X-CSRF-Token':csrf.token},data:{idToken}});
  assert.equal(session.status(),201);
  const me=await (await context.request.get(`${base}/api/v1/me`)).json();
  const quizIds=Array.from({length:105},()=>randomUUID());const batch=db.batch();
  for(let i=0;i<105;i++){
    const id=randomUUID();batch.set(db.collection('notes').doc(id),{id,ownerId:me.id,text:`Synthetic note ${i}`,anatomyId:null,revision:1,createdAt:new Date(2026,0,1,0,0,i),updatedAt:new Date()});
    const quizId=quizIds[i];batch.set(db.collection('quizzes').doc(quizId),{id:quizId,title:`Synthetic review ${i}`,status:'PUBLISHED',revision:1,reviewDueAt:new Date(Date.now()+86400000)});
    const reviewId=randomUUID();batch.set(db.collection('learningReviews').doc(reviewId),{id:reviewId,userId:me.id,quizId,quizRevision:1,schedule:{policy:'practice-intervals-v1',step:0,dueAt:new Date(Date.UTC(2026,0,1)+i*86400000).toISOString()},updatedAt:new Date()});
  }
  await batch.commit();
  const page=await context.newPage();activePage=page;page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))httpFailures.push({path:new URL(response.url()).pathname,status:response.status()});});
  await page.goto(`${base}/tai-khoan/ho-so`);
  await page.getByLabel('Tên hiển thị',{exact:true}).fill('Synthetic readiness learner');
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
  await page.getByText('Đã lưu thay đổi.',{exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByLabel('Tên hiển thị',{exact:true}).inputValue(),'Synthetic readiness learner');results.push('profile persists across reload');
  await page.goto(`${base}/tai-khoan/tuy-chon`);
  await page.getByLabel('Múi giờ hiển thị hoạt động').selectOption('UTC');
  await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();await page.getByText('Đã lưu thay đổi.',{exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByLabel('Múi giờ hiển thị hoạt động').inputValue(),'UTC');assert.equal(await page.getByRole('checkbox').isChecked(),true);results.push('timezone and reduced motion persist');
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto(`${base}/tai-khoan/du-lieu`);await page.getByRole('heading',{name:'Dữ liệu & quyền riêng tư',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:new URL(`account-${width}.png`,output).pathname,fullPage:true});results.push(`account data page no horizontal overflow ${width}`);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/hoc-tap`);
  await page.getByRole('button',{name:'Tải lịch ôn của tôi',exact:true}).click();
  await page.getByRole('button',{name:'Ôn bài: Synthetic review 99',exact:true}).waitFor();
  await page.route('**/api/v1/me/reviews?cursor=*',route=>route.abort());
  await page.getByRole('button',{name:'Tải thêm bài ôn',exact:true}).click();await page.getByText('Chưa tải được lịch ôn. Bạn có thể thử lại.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Ôn bài: Synthetic review 0',exact:true}).count(),1);
  await page.unroute('**/api/v1/me/reviews?cursor=*');await page.getByRole('button',{name:'Tải thêm bài ôn',exact:true}).click();
  await page.getByRole('button',{name:'Ôn bài: Synthetic review 104',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/Ôn bài: Synthetic review/}).count(),105);results.push('review 105 items, failed next page preserves data, retry succeeds');
  await page.evaluate(()=>window.dispatchEvent(new Event('hs-auth-changed')));assert.equal(await page.getByRole('button',{name:/Ôn bài: Synthetic review/}).count(),0);results.push('account-change event clears private review UI');
  await page.goto(base);await page.getByRole('button',{name:'Học tập',exact:true}).click();
  await page.getByText('Synthetic note 104',{exact:true}).waitFor();
  await page.route('**/api/v1/notes?cursor=*',route=>route.abort());
  await page.getByRole('button',{name:'Tải thêm nội dung đã lưu',exact:true}).click();
  await page.getByText('Chưa tải được phần tiếp theo. Bạn có thể thử lại hoặc tải lại danh sách.',{exact:true}).waitFor();
  assert.equal(await page.getByText('Synthetic note 104',{exact:true}).count(),1);
  await page.unroute('**/api/v1/notes?cursor=*');await page.getByRole('button',{name:'Tải thêm nội dung đã lưu',exact:true}).click();
  await page.getByText('Synthetic note 0',{exact:true}).waitFor();assert.equal(await page.locator('.saved-item').count(),105);results.push('notes beyond100 accessible with load-more');
  await page.goto(`${base}/tai-khoan/ho-so`);await page.route('**/api/v1/me/account',route=>route.abort());await page.reload();await page.getByRole('button',{name:'Thử lại',exact:true}).waitFor();await page.unroute('**/api/v1/me/account');await page.getByRole('button',{name:'Thử lại',exact:true}).click();await page.getByLabel('Tên hiển thị',{exact:true}).waitFor();results.push('account network error retries successfully');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.tagName!=='BODY'),true);results.push('keyboard focus reaches interactive controls');
  await writeFile(new URL('results.json',output),JSON.stringify({status:'PASSED',environment:'LOCAL_FIREBASE_EMULATORS',browser:browser.version(),checks:results,limits:['Not real Google OAuth','Not physical device or screen-reader certification','Export browser popup requires configured Google; export API tested separately']},null,2));
  console.log(JSON.stringify({status:'PASSED',checks:results.length}));
} catch(error) { if(activePage)await activePage.screenshot({path:new URL('failure.png',output).pathname,fullPage:true}).catch(()=>{});await writeFile(new URL('failure.json',output),JSON.stringify({status:'FAILED',httpFailures,completed:results,error:error.name},null,2));throw error;} finally {await context.close();await browser.close();await db.terminate();}
