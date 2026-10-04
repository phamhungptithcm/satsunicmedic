import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
// @ts-expect-error Native operational ESM has no generated declarations.
import { assemble, validateReceipt, technicalChecks, externalChecks } from '../scripts/ci/acceptance-production.mjs';
// @ts-expect-error Native operational ESM has no generated declarations.
import { costPolicy } from '../scripts/ci/check-production-costs.mjs';
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
