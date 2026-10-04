import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export const requiredChecks = ['typecheck', 'lint', 'unit', 'integration', 'build', 'browser', 'dependencyAudit', 'assetRights'] as const;
type Check = { status: string; candidateSha256: string; checkedAt: string; evidence: string };
export interface DiscoveryEvidence {
  scope: 'discovery'; candidateSha256: string; files: { path: string; sha256: string }[];
  checks: Record<string, Check>;
  deferred: { check: string; reason: string; approval: string }[];
}
export function checkDiscovery(evidence: DiscoveryEvidence, root: string, now = Date.now()) {
  const failures: string[] = [];
  if (evidence.scope !== 'discovery' || !Array.isArray(evidence.files) || !evidence.files.length) return { status: 'NOT_READY', failures: ['Invalid discovery manifest'] };
  const paths = new Set<string>();
  for (const file of evidence.files) {
    const absolute = resolve(root, file.path);
    const rel = relative(resolve(root), absolute);
    if (!rel || rel.startsWith('..') || paths.has(file.path)) { failures.push('Invalid or duplicate candidate path'); continue; }
    paths.add(file.path);
    try { if (relative(realpathSync(root), realpathSync(absolute)).startsWith('..')) { failures.push('Candidate symlink escapes root'); continue; } if (createHash('sha256').update(readFileSync(absolute)).digest('hex') !== file.sha256) failures.push(`Changed candidate file: ${file.path}`); }
    catch { failures.push(`Missing candidate file: ${file.path}`); }
  }
  const candidateHash = createHash('sha256').update(JSON.stringify(evidence.files)).digest('hex');
  if (candidateHash !== evidence.candidateSha256) failures.push('Candidate manifest hash mismatch');
  for (const name of requiredChecks) {
    const c = evidence.checks?.[name];
    const age = c ? now - Date.parse(c.checkedAt) : NaN;
    if (!c || c.status !== 'PASSED' || c.candidateSha256 !== candidateHash || !Number.isFinite(age) || age < 0 || age > 86400000 || !c.evidence) failures.push(`Missing, failed or stale check: ${name}`);
  }
  for (const name of ['liveGoogle', 'restore', 'physicalDevices']) {
    const c = evidence.checks?.[name];
    const age = c ? now - Date.parse(c.checkedAt) : NaN;
    const passed = c?.status === 'PASSED' && c.candidateSha256 === candidateHash && age >= 0 && age <= 86400000 && !!c.evidence;
    if (!passed && !evidence.deferred?.some(d => d.check === name && d.reason && d.approval)) failures.push(`Missing acceptance or explicit deferral: ${name}`);
  }
  return { status: failures.length ? 'NOT_READY' : 'READY_FOR_REVIEW', scope: 'discovery', failures, deferred: evidence.deferred ?? [], note: 'Evidence validation is not deployment authorization or independent proof that checks ran.' };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const input = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as DiscoveryEvidence;
    const result = checkDiscovery(input, process.cwd());
    console.log(JSON.stringify(result, null, 2)); process.exitCode = result.status === 'NOT_READY' ? 2 : 0;
  } catch { console.error('NOT_READY: provide a valid discovery evidence JSON'); process.exitCode = 2; }
}
