import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
// @ts-expect-error Native operational ESM has no generated declarations.
import { assemble, validateReceipt, technicalChecks, externalChecks } from '../scripts/ci/acceptance-production.mjs';
// @ts-expect-error Native operational ESM has no generated declarations.
import { costPolicy } from '../scripts/ci/check-production-costs.mjs';
// @ts-expect-error Native operational ESM has no generated declarations.
import { ownerApproval, deferrableChecks, validateDeferrals } from '../scripts/ci/owner-deferrals.mjs';
// @ts-expect-error Native operational ESM has no generated declarations.
import { validateAcceptance } from '../scripts/ci/deploy-production.mjs';
const roots: string[] = [];
afterEach(() => roots.splice(0).forEach(p => rmSync(p, { recursive: true, force: true })));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'hs-acceptance-')); roots.push(root);
  const receipts = join(root, 'receipts'), bundle = join(root, 'bundle'); mkdirSync(receipts);
  writeFileSync(join(root, 'candidate.txt'), 'candidate');
  const hash = (s: string) => createHash('sha256').update(s).digest('hex');
  const files = [{ path: 'candidate.txt', sha256: hash('candidate') }];
  const candidate = { commit: 'a'.repeat(40), scope: 'discovery', files, candidateSha256: hash(JSON.stringify(files)) };
  const receipt = (name: string) => ({ name, status: 'PASSED', commit: candidate.commit, candidateSha256: candidate.candidateSha256, checkedAt: new Date().toISOString(), results: [{ exitCode: 0, outputSha256: hash('test output') }] });
  for (const name of technicalChecks) writeFileSync(join(receipts, `${name}.json`), JSON.stringify(receipt(name)));
  const external = { checks: Object.fromEntries(externalChecks.map((name: string) => [name, { ...receipt(name), summary: 'Synthetic unit-test evidence, never production acceptance', source: 'fixture', reviewer: 'fixture' }])), costs: { commit: candidate.commit, project: costPolicy.project, region: costPolicy.region, currency: 'USD', checkedAt: new Date().toISOString(), monthToDateUsd: 1, projectedMonthTotalUsd: 8, actualCostSource: 'fixture', projectionSource: 'fixture', services: costPolicy.services.map((name: string) => ({ name, ...costPolicy.limits })) } };
  return { root, receipts, bundle, candidate, external, receipt };
}
describe('production acceptance producer boundary', () => {
  it('assembles only a complete exact-candidate bundle', async () => {
    const f = fixture(); const result = await assemble(f.candidate, f.receipts, f.external, f.bundle, f.root);
    expect(result.deferred).toEqual([]); expect(Object.keys(result.checks)).toHaveLength(14);
    expect(existsSync(join(f.bundle, 'costs.json'))).toBe(true);
  });
  it.each(['commit', 'candidateSha256', 'status', 'name', 'checkedAt'])('rejects invalid %s', key => {
    const f = fixture(); expect(() => validateReceipt({ ...f.receipt('unit'), [key]: 'invalid' }, f.candidate, 'unit')).toThrow();
  });
  it('rejects old and future receipts', () => {
    const f = fixture(); for (const age of [-10000, 86400001]) expect(() => validateReceipt({ ...f.receipt('unit'), checkedAt: new Date(Date.now() - age).toISOString() }, f.candidate, 'unit')).toThrow();
  });
  it('does not reuse a prior bundle when external acceptance is absent', async () => {
    const f = fixture(); mkdirSync(f.bundle); writeFileSync(join(f.bundle, 'evidence.json'), 'old pass');
    await expect(assemble(f.candidate, f.receipts, {}, f.bundle, f.root)).rejects.toThrow();
    expect(existsSync(f.bundle)).toBe(false);
  });
  it.each(['browser', 'dependencyAudit', 'unit'])('blocks failed %s even with PASSED metadata', async name => {
    const f = fixture(); writeFileSync(join(f.receipts, `${name}.json`), JSON.stringify({ ...f.receipt(name), results: [{ exitCode: 1, outputSha256: 'b'.repeat(64) }] }));
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('command evidence');
  });
  it('rejects receipt symlinks outside the input root', async () => {
    const f = fixture(); rmSync(join(f.receipts, 'unit.json')); writeFileSync(join(f.root, 'outside.json'), JSON.stringify(f.receipt('unit'))); symlinkSync(join(f.root, 'outside.json'), join(f.receipts, 'unit.json'));
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('Unsafe');
  });
  it('does not accept blanket approval or implicit external deferrals', async () => {
    const f = fixture(); delete f.external.checks.restore;
    await expect(assemble(f.candidate, f.receipts, { ...f.external, deferred: [{ check: 'restore', approval: 'approved', reason: 'release requested' }] }, f.bundle, f.root)).rejects.toThrow('restore');
  });
  it('requires full-product evidence beyond discovery checks', async () => {
    const f = fixture(); delete f.external.checks.medicalReview;
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('medicalReview');
  });
  it('rejects stale/unknown costs and mismatched cost SHA', async () => {
    for (const override of [{ projectedMonthTotalUsd: 15 }, { commit: 'b'.repeat(40) }, { checkedAt: 'invalid' }]) {
      const f = fixture(); Object.assign(f.external.costs, override);
      await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('cost projection');
    }
  });
  it('cleans bundle if actual source changed after the checks', async () => {
    const f = fixture(); writeFileSync(join(f.root, 'candidate.txt'), 'changed');
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('Changed candidate');
    expect(existsSync(f.bundle)).toBe(false);
  });
  it('rejects recognizable credentials in external evidence', async () => {
    const f = fixture(); f.external.checks.liveGoogle.summary = 'Bearer sensitive-token';
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root)).rejects.toThrow('secret');
  });
});

function deferredFixture() {
  const f = fixture();
  const now = Date.parse(ownerApproval.approvedAt) + 1000;
  const date = new Date(now).toISOString();
  for (const name of technicalChecks) writeFileSync(join(f.receipts, `${name}.json`), JSON.stringify({ ...f.receipt(name), checkedAt: date }));
  f.external.checks.assetRights.checkedAt = date;
  f.external.costs.checkedAt = date;
  const deferred = deferrableChecks.map((check: string) => ({ check, status: 'DEFERRED', commit: f.candidate.commit, candidateSha256: f.candidate.candidateSha256,
    approval: ownerApproval.id, owner: ownerApproval.owner, taskReference: ownerApproval.taskReference, acceptedAt: date,
    reason: 'Synthetic test decision', consequence: 'Acceptance remains unverified', followUp: 'Complete the missing acceptance' }));
  for (const check of deferrableChecks) delete f.external.checks[check];
  return { ...f, now, deferred, external: { ...f.external, deferred } };
}
describe('explicit owner decisions', () => {
  it('retains six DEFERRED decisions separately from eight PASSED checks', async () => {
    const f = deferredFixture();
    const result = await assemble(f.candidate, f.receipts, f.external, f.bundle, f.root, f.now);
    expect(result.deferred).toEqual(f.deferred);
    expect(Object.keys(result.checks)).toHaveLength(8);
    expect(result.checks.restore).toBeUndefined();
    expect(existsSync(join(f.bundle, 'owner-deferrals.json'))).toBe(true);
    writeFileSync(join(f.bundle, 'owner-deferrals.json'), '[]');
    await expect(validateAcceptance(result, ['candidate.txt'], f.candidate.commit, f.root, f.bundle, f.now)).rejects.toThrow('decision attachment');
    rmSync(join(f.bundle, 'owner-deferrals.json'));
    await expect(validateAcceptance(result, ['candidate.txt'], f.candidate.commit, f.root, f.bundle, f.now)).rejects.toThrow();
    writeFileSync(join(f.root, 'outside.json'), JSON.stringify(f.deferred));
    symlinkSync(join(f.root, 'outside.json'), join(f.bundle, 'owner-deferrals.json'));
    await expect(validateAcceptance(result, ['candidate.txt'], f.candidate.commit, f.root, f.bundle, f.now)).rejects.toThrow('decision attachment');
  });
  it.each(['assetRights', 'unit', 'browser', 'dependencyAudit', 'costs', 'unknown'])('cannot defer %s', check => {
    const f = deferredFixture();
    expect(() => validateDeferrals([{ ...f.deferred[0], check }], f.candidate, f.now)).toThrow('Non-deferrable');
  });
  it.each(['owner', 'approval', 'taskReference', 'commit', 'candidateSha256', 'status', 'acceptedAt', 'reason', 'consequence', 'followUp'])('rejects missing or mismatched %s', key => {
    const f = deferredFixture();
    expect(() => validateDeferrals([{ ...f.deferred[0], [key]: '' }], f.candidate, f.now)).toThrow();
  });
  it('rejects expiry, future dates, duplicates and unapproved owners', () => {
    const f = deferredFixture();
    expect(() => validateDeferrals(f.deferred, f.candidate, Date.parse(ownerApproval.validUntil) + 1)).toThrow('Stale');
    expect(() => validateDeferrals(f.deferred, f.candidate, f.now - 1)).toThrow('Stale');
    expect(() => validateDeferrals([f.deferred[0], f.deferred[0]], f.candidate, f.now)).toThrow('duplicate');
    expect(() => validateDeferrals([{ ...f.deferred[0], owner: 'unapproved' }], f.candidate, f.now)).toThrow('Unapproved');
  });
  it('rejects conflicting pass and defer decisions', async () => {
    const f = deferredFixture(); f.external.checks.restore = f.receipt('restore');
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root, f.now)).rejects.toThrow('Conflicting');
  });
  it('keeps costs mandatory when every permitted check is deferred', async () => {
    const f = deferredFixture(); f.external.costs.projectedMonthTotalUsd = 15;
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root, f.now)).rejects.toThrow('cost projection');
  });
  it('rejects secrets in owner decisions', async () => {
    const f = deferredFixture(); f.deferred[0].reason = 'Bearer private-token';
    await expect(assemble(f.candidate, f.receipts, f.external, f.bundle, f.root, f.now)).rejects.toThrow('secret');
  });
});
