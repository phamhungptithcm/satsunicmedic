import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { DIRECTORY_VERSION } from '../../packages/contracts/dist/directory.js';

// Uses real local model assets, synthetic API states, and a fresh browser context.
export async function verifyUiPerformance(browser, origin, directory) {
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(60_000);
 const errors=[],requests=[];let delayAssets=true,delayApi=false;
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/**',async route=>{
  if(delayApi)await new Promise(resolve=>setTimeout(resolve,1200));
  return route.fulfill({status:route.request().url().includes('/facilities/search')?200:401,contentType:'application/json',body:JSON.stringify(route.request().url().includes('/facilities/search')?{items:[],nextCursor:null,version:DIRECTORY_VERSION}:{error:{code:'UNAUTHENTICATED'}})});
 });
 await page.route('**/kham-pha/toan-than/asset/**',async route=>{
  requests.push(route.request().url());
  if(delayAssets)await new Promise(resolve=>setTimeout(resolve,1500));
  await route.continue();
 });
 const ready=()=>page.locator('button[aria-label="Phóng to"]:enabled').waitFor();
 const top=()=>page.getByRole('progressbar',{name:'Đang tải hoặc xử lý yêu cầu',exact:true});
 try {
  const start=Date.now();
  await page.goto(origin+'/kham-pha/toan-than');
  const measured=page.getByRole('progressbar',{name:'Đang tải mô hình toàn thân',exact:true});
  await measured.waitFor();await top().waitFor();
  await page.waitForFunction(()=>document.querySelector('[role=progressbar][aria-label="Đang tải mô hình toàn thân"]')?.hasAttribute('aria-valuenow'));
  assert.ok(Number(await measured.getAttribute('aria-valuenow'))<100);
  assert.equal(await top().locator('span').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.screenshot({path:directory+'/progress-model-desktop.png'});
  await ready();
  await page.getByRole('button',{name:'Tim heart',exact:true}).click();
  await page.getByRole('status').filter({hasText:/^Đang xem:/}).waitFor({timeout:180_000});
  await top().waitFor({state:'hidden'});
  const cold={requests:requests.length,milliseconds:Date.now()-start};
  assert.ok(cold.requests>1);
  await page.screenshot({path:directory+'/progress-model-ready.png'});
  delayAssets=false;
  // Real SPA unmount/remount tests byte reuse, not a model left mounted in a tab.
  await page.locator('header').getByRole('link',{name:'Học tập',exact:true}).click();
  await page.getByRole('heading',{name:'Học và ôn tập',exact:true}).waitFor();
  const before=requests.length,warmStart=Date.now();
  await page.locator('header').getByRole('link',{name:'Khám phá',exact:true}).click();
  await ready();
  await page.getByRole('button',{name:'Tim heart',exact:true}).click();
  await page.getByRole('status').filter({hasText:/^Đang xem:/}).waitFor({timeout:180_000});
  await top().waitFor({state:'hidden'});
  const warm={requests:requests.length-before,milliseconds:Date.now()-warmStart};
  assert.equal(warm.requests,0,'Warm skin and selected-heart bytes should be reused within cache budget/TTL');
  delayApi=true;
  await page.goto(origin+'/co-so-y-te');
  await top().waitFor();
  await page.getByRole('progressbar',{name:'Đang tìm cơ sở',exact:true}).waitFor();
  await page.screenshot({path:directory+'/progress-directory-desktop.png'});
  await page.getByRole('heading',{name:'Chưa tìm thấy cơ sở phù hợp',exact:true}).waitFor();await top().waitFor({state:'hidden'});
  await page.setViewportSize({width:320,height:900});
  await page.getByRole('button',{name:'Tìm cơ sở',exact:true}).click();
  await top().waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:directory+'/progress-directory-mobile.png'});
  await top().waitFor({state:'hidden'});
  // Leave while a request is pending; its cleanup must not strand the shared bar.
  await page.getByRole('button',{name:'Tìm cơ sở',exact:true}).click();await top().waitFor();
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('header').getByRole('link',{name:'Học tập',exact:true}).click();
  await page.getByRole('heading',{name:'Học và ôn tập',exact:true}).waitFor();await top().waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Mở ghi chú',exact:true}).click();
  await page.getByRole('progressbar',{name:'Đang tải ghi chú',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Mở ghi chú',exact:true}).isDisabled(),true);
  await top().waitFor();
  await top().waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Tải lịch ôn của tôi',exact:true}).click();
  await page.getByRole('progressbar',{name:'Đang tải lịch ôn',exact:true}).waitFor();
  await top().waitFor();
  await page.screenshot({path:directory+'/progress-study.png'});
  await top().waitFor({state:'hidden'});
  await page.goto(origin+'/giang-day');
  await page.getByRole('progressbar',{name:'Đang tải bài giảng',exact:true}).waitFor();
  await top().waitFor();
  await page.screenshot({path:directory+'/progress-teaching.png'});
  await top().waitFor({state:'hidden'});
  let accountWrites=0;
  const account={id:'synthetic-ui-fixture',displayName:'Người học thử',email:null,googleLinked:false,studyRole:'self',timezone:'Asia/Ho_Chi_Minh',reducedMotion:true,revision:0,sessions:[],sessionsTruncated:false,capabilities:{billing:false,export:false,deletion:false,notifications:false}};
  await page.route('**/auth/csrf',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  await page.route('**/api/v1/me/account',async route=>{
   const saving=route.request().method()==='PATCH';if(saving)accountWrites++;
   await new Promise(resolve=>setTimeout(resolve,1200));
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(saving?{...account,...route.request().postDataJSON(),revision:1}:account)});
  });
  await page.goto(origin+'/tai-khoan/ho-so');
  await page.getByRole('progressbar',{name:'Đang tải tài khoản',exact:true}).waitFor();
  await page.getByLabel('Tên hiển thị',{exact:true}).fill('Người học thử mới');
  await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).click();
  const saving=page.getByRole('button',{name:'Đang lưu thay đổi',exact:true});await saving.waitFor();assert.equal(await saving.isDisabled(),true);
  await top().waitFor();
  await page.screenshot({path:directory+'/progress-account-save.png'});
  await page.getByText('Đã lưu thay đổi.',{exact:true}).waitFor();await top().waitFor({state:'hidden'});assert.equal(accountWrites,1);
  assert.deepEqual(errors,[]);
  const result={status:'PASSED',cold,warm,errors,checks:['delayed model progress','reduced-motion CSS','real SPA model cache reuse','delayed API progress and cleanup','320px layout','navigation cancellation','study and teaching contextual loading','synthetic account save and disabled duplicate submission'],limits:['synthetic API','software WebGL','timings include imposed cold delay; not a production speed benchmark']};
  writeFileSync(directory+'/ui-performance.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }catch(error){await page.screenshot({path:directory+'/ui-performance-failure.png'}).catch(()=>{});throw error;}
 finally{await context.close();}
}
