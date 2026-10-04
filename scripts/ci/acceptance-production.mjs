import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, rmSync, realpathSync, lstatSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { candidatePaths, validateAcceptance } from './deploy-production.mjs';
import { validateDeferrals } from './owner-deferrals.mjs';
import { checkProductionCosts } from './check-production-costs.mjs';

export const technicalChecks = ['typecheck', 'lint', 'unit', 'integration', 'build', 'browser', 'dependencyAudit'];
export const externalChecks = ['assetRights', 'liveGoogle', 'restore', 'physicalDevices', 'medicalReview', 'anatomyCorrectness', 'fullProduct'];
const output = '.ai/local/acceptance';
const digest = value => createHash('sha256').update(value).digest('hex');
const commands = {
  typecheck: [['pnpm', 'typecheck']],
  lint: [['pnpm', 'lint'], ['pnpm', 'exec', 'eslint', 'scripts/ci/*.mjs']],
  unit: [['pnpm', 'test']],
  integration: [['firebase', 'emulators:exec', '--only', 'auth,firestore', '--project', 'demo-humanscope', '--config', 'infra/firebase/firebase.json', 'pnpm test:integration']],
  build: [['pnpm', 'build'], ['pnpm', '--filter', '@hs/api', 'exec', 'node', 'dist/openapi.js'], ['git', 'diff', '--exit-code', '--', 'docs/implementation/openapi.json']],
  browser: [['node', 'scripts/ci/acceptance-browser.mjs']],
  dependencyAudit: [['pnpm', 'audit', '--prod', '--audit-level=high']],
};
export function manifest(root = process.cwd()) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const files = candidatePaths(git(['ls-files', '-z']).split('\0').filter(Boolean)).sort().map(path => ({ path, sha256: digest(readFileSync(resolve(root, path))) }));
  return { commit: git(['rev-parse', 'HEAD']), scope: 'discovery', files, candidateSha256: digest(JSON.stringify(files)), checks: {}, deferred: [] };
}
export function validateReceipt(receipt, candidate, name, now = Date.now()) {
  const age = now - Date.parse(receipt?.checkedAt);
  if (receipt?.name !== name || receipt?.status !== 'PASSED' || receipt?.commit !== candidate.commit ||
      receipt?.candidateSha256 !== candidate.candidateSha256 || !Number.isFinite(age) || age < 0 || age > 86_400_000) throw new Error(`Missing, failed or stale receipt: ${name}`);
}
export function runCheck(name) {
  if (!commands[name]) throw new Error('Unknown technical check');
  mkdirSync(output, { recursive: true });
  const before = manifest();
  const results = [];
  // Invalidate old success before starting, including if interrupted or timed out.
  const path = `${output}/${name}.json`;
  writeFileSync(path, JSON.stringify({ name, status: 'RUNNING' }));
  for (const [cmd, ...args] of commands[name]) {
    const result = spawnSync(cmd, args, { encoding: 'utf8', timeout: 1_200_000, maxBuffer: 32 * 1024 * 1024 });
    const transcript = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    // Upload structured command outcomes only; raw output may contain sensitive values.
    results.push({ command: [cmd, ...args], exitCode: result.status, signal: result.signal, outputSha256: digest(transcript) });
    writeFileSync(`${output}/${name}.local.log`, transcript);
    if (result.status !== 0) break;
  }
  const after = manifest();
  const passed = results.length === commands[name].length && results.every(r => r.exitCode === 0) && before.commit === after.commit && before.candidateSha256 === after.candidateSha256;
  const receipt = { name, status: passed ? 'PASSED' : 'FAILED', commit: before.commit, candidateSha256: before.candidateSha256, checkedAt: new Date().toISOString(), results };
  writeFileSync(path, JSON.stringify(receipt, null, 2));
  if (!passed) throw new Error(`Acceptance check failed: ${name}; inspect local log`);
  console.log(`${name}: PASSED`);
}
function safeJson(root, name) {
  const base = realpathSync(root);
  const path = realpathSync(resolve(base, `${name}.json`));
  if (relative(base, path).startsWith('..') || !lstatSync(path).isFile()) throw new Error('Unsafe receipt path');
  return JSON.parse(readFileSync(path, 'utf8'));
}
export async function assemble(candidate, receiptsRoot, external, destination, root = process.cwd(), now = Date.now()) {
  // Clear old bundles even on failure; never leave a reusable prior success.
  rmSync(destination, { recursive: true, force: true });
  const receipts = {};
  for (const name of technicalChecks) {
    const receipt = safeJson(receiptsRoot, name);
    validateReceipt(receipt, candidate, name, now);
    if (!Array.isArray(receipt.results) || !receipt.results.length || receipt.results.some(r => r.exitCode !== 0 || !/^[a-f0-9]{64}$/.test(r.outputSha256))) throw new Error(`Invalid command evidence: ${name}`);
    // Exclude any undeclared fields from uploaded evidence.
    receipts[name] = { name, status: receipt.status, commit: receipt.commit, candidateSha256: receipt.candidateSha256, checkedAt: receipt.checkedAt, results: receipt.results.map(r => ({ exitCode: r.exitCode, outputSha256: r.outputSha256 })) };
  }
  const deferred = validateDeferrals(external?.deferred, candidate, now);
  const missingExternal = [];
  for (const name of externalChecks) {
    const receipt = external?.checks?.[name];
    if (deferred.some(item => item.check === name)) { if (receipt) throw Error(`Conflicting passed/deferred evidence: ${name}`); continue; }
    try { validateReceipt(receipt, candidate, name, now); } catch { missingExternal.push(name); continue; }
    for (const key of ['summary', 'source', 'reviewer']) {
      if (typeof receipt[key] !== 'string' || !receipt[key].trim() || receipt[key].length > 4000) throw new Error(`Missing external evidence ${name}.${key}`);
    }
    receipts[name] = Object.fromEntries(['name', 'status', 'commit', 'candidateSha256', 'checkedAt', 'summary', 'source', 'reviewer'].map(key => [key, receipt[key]]));
  }
  if (missingExternal.length) throw new Error(`Missing current external acceptance: ${missingExternal.join(', ')}`);
  const costs = external?.costs;
  if (costs?.commit !== candidate.commit || checkProductionCosts(costs, now).status !== 'PASSED') throw new Error('Missing or invalid measured monthly cost projection');
  const cleanCosts = Object.fromEntries(['commit', 'project', 'region', 'currency', 'checkedAt', 'monthToDateUsd', 'projectedMonthTotalUsd', 'actualCostSource', 'projectionSource', 'services'].map(key => [key, costs[key]]));
  cleanCosts.services = costs.services.map(s => Object.fromEntries(['name', 'minInstances', 'maxInstances', 'cpu', 'memoryMiB', 'concurrency'].map(k => [k, s[k]])));
  const content = JSON.stringify({ receipts, deferred, costs: cleanCosts });
  if (/-----BEGIN|AIza[\w-]{20,}|Bearer\s+\S+|eyJ[\w-]{15,}\.[\w-]+\./i.test(content)) throw new Error('Potential secret in supplied evidence');
  mkdirSync(destination, { recursive: true });
  const evidence = { ...candidate, checks: {}, deferred };
  try {
    if (deferred.length) writeFileSync(resolve(destination, 'owner-deferrals.json'), JSON.stringify(deferred, null, 2));
    for (const [name, receipt] of Object.entries(receipts)) {
      writeFileSync(resolve(destination, `${name}.json`), JSON.stringify(receipt, null, 2));
      evidence.checks[name] = { status: 'PASSED', candidateSha256: candidate.candidateSha256, checkedAt: receipt.checkedAt, evidence: `${name}.json` };
    }
    await validateAcceptance(evidence, candidate.files.map(f => f.path), candidate.commit, root, destination, now);
    writeFileSync(resolve(destination, 'costs.json'), JSON.stringify(cleanCosts, null, 2));
    writeFileSync(resolve(destination, 'evidence.json'), JSON.stringify(evidence, null, 2));
  } catch (error) { rmSync(destination, { recursive: true, force: true }); throw error; }
  return evidence;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv[2] === 'run') runCheck(process.argv[3]);
    else if (process.argv[2] === 'assemble') {
      if (process.env.GITHUB_REF !== 'refs/heads/main' || process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw new Error('Acceptance requires a main dispatch');
      const candidate = manifest();
      if (candidate.commit !== process.env.GITHUB_SHA) throw new Error('Checkout SHA mismatch');
      await assemble(candidate, output, JSON.parse(process.env.ACCEPTANCE_EXTERNAL_JSON || '{}'), '.ai/local/discovery-evidence');
    } else throw new Error('Expected run CHECK or assemble');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
