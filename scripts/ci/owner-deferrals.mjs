import { readFileSync } from 'node:fs';
export const ownerApproval = JSON.parse(readFileSync(new URL('../../docs/implementation/production-risk-acceptance-approval.json', import.meta.url), 'utf8'));
export const deferrableChecks = ['liveGoogle', 'restore', 'physicalDevices', 'medicalReview', 'anatomyCorrectness', 'fullProduct'];
const fields = ['check', 'status', 'commit', 'candidateSha256', 'approval', 'owner', 'taskReference', 'acceptedAt', 'reason', 'consequence', 'followUp'];
// Authority comes from the reviewed, committed owner decision, not an input claiming approval.
export function validateDeferrals(input, candidate, now = Date.now(), authority = ownerApproval) {
 if (input === undefined) return [];
 if (!Array.isArray(input)) throw Error('Invalid owner deferrals');
 const seen = new Set();
 return input.map(item => {
  if (!deferrableChecks.includes(item?.check) || !authority.allowedChecks?.includes(item.check) || seen.has(item.check)) throw Error(`Non-deferrable or duplicate check: ${item?.check}`);
  seen.add(item.check);
  if (item.status !== 'DEFERRED' || item.commit !== candidate.commit || item.candidateSha256 !== candidate.candidateSha256) throw Error(`Deferral candidate/status mismatch: ${item.check}`);
  const date = Date.parse(item.acceptedAt), approved = Date.parse(authority.approvedAt), until = Date.parse(authority.validUntil);
  if (![date, approved, until].every(Number.isFinite) || date < approved || date > now || now - date > 86_400_000 || now > until) throw Error(`Stale owner deferral: ${item.check}`);
  for (const key of fields) if (typeof item[key] !== 'string' || !item[key].trim() || item[key].length > 4000) throw Error(`Missing owner deferral ${item.check}.${key}`);
  if (item.approval !== authority.id || item.owner !== authority.owner || item.taskReference !== authority.taskReference) throw Error(`Unapproved owner deferral: ${item.check}`);
  return Object.fromEntries(fields.map(key => [key, item[key]]));
 });
}
export function assertExternalDecisions(evidence, now = Date.now()) {
 const deferred = validateDeferrals(evidence.deferred, evidence, now);
 for (const name of ['assetRights', ...deferrableChecks]) {
  const check = evidence.checks?.[name];
  const age = now - Date.parse(check?.checkedAt);
  const passed = check?.status === 'PASSED' && check.candidateSha256 === evidence.candidateSha256 && age >= 0 && age <= 86_400_000 && !!check.evidence;
  const decision = deferred.find(d => d.check === name);
  if (check && decision) throw Error(`Conflicting passed/deferred evidence: ${name}`);
  if (!passed && !decision) throw Error(`Missing external acceptance: ${name}`);
 }
 return deferred;
}
