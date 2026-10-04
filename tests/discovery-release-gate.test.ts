import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { checkDiscovery, requiredChecks, type DiscoveryEvidence } from '../scripts/discovery-release-check';
const directories: string[] = [];
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, {recursive:true}); });
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'discovery-gate-'));directories.push(root);writeFileSync(join(root,'source.ts'),'verified source');
  const files=[{path:'source.ts',sha256:createHash('sha256').update('verified source').digest('hex')}];
  const candidateSha256=createHash('sha256').update(JSON.stringify(files)).digest('hex');
  const now=Date.now();
  const evidence:DiscoveryEvidence={scope:'discovery',candidateSha256,files,checks:Object.fromEntries(requiredChecks.map(name=>[name,{status:'PASSED',candidateSha256,checkedAt:new Date(now).toISOString(),evidence:'synthetic fixture only'}])),deferred:['liveGoogle','restore','physicalDevices'].map(check=>({check,reason:'test fixture',approval:'synthetic owner decision'}))};
  return {root,evidence,now};
}
describe('discovery release evidence gate',()=>{
  it('separates discovery review eligibility from clinical publication',()=>{const {root,evidence,now}=fixture();expect(checkDiscovery(evidence,root,now).status).toBe('READY_FOR_REVIEW');});
  it('rejects changed source even if all recorded checks pass',()=>{const {root,evidence,now}=fixture();writeFileSync(join(root,'source.ts'),'changed');expect(checkDiscovery(evidence,root,now).status).toBe('NOT_READY');});
  it('rejects stale, future and wrong-candidate check receipts',()=>{for(const mode of ['stale','future','hash']){const {root,evidence,now}=fixture();evidence.checks.build!.checkedAt=new Date(mode==='stale'?now-86400001:mode==='future'?now+1:now).toISOString();if(mode==='hash')evidence.checks.build!.candidateSha256='other';expect(checkDiscovery(evidence,root,now).status).toBe('NOT_READY');}});
  it('does not silently waive mandatory checks or external acceptance',()=>{const {root,evidence,now}=fixture();delete evidence.checks.browser;evidence.deferred=[];expect(checkDiscovery(evidence,root,now).failures).toContain('Missing, failed or stale check: browser');expect(checkDiscovery(evidence,root,now).failures).toContain('Missing acceptance or explicit deferral: liveGoogle');});
  it('rejects path traversal and duplicate paths',()=>{const {root,evidence,now}=fixture();evidence.files.push({...evidence.files[0]!},{path:'../outside',sha256:'fake'});expect(checkDiscovery(evidence,root,now).failures).toContain('Invalid or duplicate candidate path');});
});
