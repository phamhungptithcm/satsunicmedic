import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './app.js';
import { readConfig } from './config.js';
let application:Promise<Awaited<ReturnType<typeof createApp>>>|undefined;
function ready() {
  application ??= createApp(readConfig(process.env)).then(async app=>{await app.init();return app;}).catch(error=>{application=undefined;throw error;});
  return application;
}
export const api=onRequest({region:'asia-southeast1',minInstances:0,maxInstances:1,cpu:1,memory:'512MiB',concurrency:20,timeoutSeconds:60,serviceAccount:'medic-functions@satsunicmedic.iam.gserviceaccount.com',invoker:'public'},async(req,res)=>{
  // Functions parses JSON before Express, so apply the same public admission limit.
  if(req.rawBody && req.rawBody.byteLength>256*1024){res.status(413).json({error:{code:'PAYLOAD_TOO_LARGE'}});return;}
  try {const app=await ready();app.getHttpAdapter().getInstance()(req,res);}
  catch {res.status(503).json({error:{code:'SERVICE_UNAVAILABLE'}});}
});
