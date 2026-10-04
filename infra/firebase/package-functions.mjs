import { readFile, writeFile, mkdir, cp, access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(root,'.ai/local/firebase-functions');
await access(path.join(root,'apps/api/dist/firebase.js'));
await access(path.join(root,'packages/contracts/dist/index.js'));
const api=JSON.parse(await readFile(path.join(root,'apps/api/package.json'),'utf8'));
const contracts=JSON.parse(await readFile(path.join(root,'packages/contracts/package.json'),'utf8'));
const workspace=await readFile(path.join(root,'pnpm-workspace.yaml'),'utf8');
const overrideSection=workspace.match(/^overrides:\n((?:[ \t]+.*\n?)*)/m)?.[1]??'';
const overrides={};
for(const line of overrideSection.trimEnd().split('\n')) {
  if(!line.trim())continue;
  const match=line.match(/^\s+['"]([^'"]+)['"]:\s*['"]?([^'"\s]+)['"]?\s*$/);
  if(!match)throw new Error('Unsupported override syntax; preserve security overrides explicitly');
  overrides[match[1]]=match[2];
}
// Discard only the fixed generated artifact to avoid deploying stale compiled files.
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'vendor/contracts'),{recursive:true});
await cp(path.join(root,'apps/api/dist'),path.join(output,'dist'),{recursive:true});
await cp(path.join(root,'packages/contracts/dist'),path.join(output,'vendor/contracts/dist'),{recursive:true});
await writeFile(path.join(output,'vendor/contracts/package.json'),JSON.stringify({...contracts,devDependencies:undefined,scripts:undefined},null,2)+'\n');
const dependencies={...api.dependencies,'@hs/contracts':'file:vendor/contracts'};
if(Object.keys(dependencies).some(name=>name.includes('prisma')||name==='pg'))throw new Error('SQL dependency in Firebase artifact');
await writeFile(path.join(output,'package.json'),JSON.stringify({name:'humanscope-firebase-api',version:'0.1.0',private:true,type:'module',main:'dist/firebase.js',engines:{node:'24'},dependencies,overrides},null,2)+'\n');
await writeFile(path.join(output,'.env.satsunicmedic'),'NODE_ENV=production\nAPP_ORIGIN=https://medic--satsunicmedic.asia-southeast1.hosted.app\nMEDIC_FIREBASE_PROJECT_ID=satsunicmedic\nASSET_DELIVERY_ENABLED=false\n');
console.log(output);
