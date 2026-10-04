import { describe, it, expect, afterEach } from 'vitest';
// Runtime scripts are deliberately native ESM so the release job needs no install.
// @ts-expect-error Native ESM script has no generated declaration file.
import { identity, assertCurrent, existingTag, publish, validateManifest } from '../scripts/ci/release.mjs';
// @ts-expect-error Native ESM script has no generated declaration file.
import { validateAcceptance, validateConfig, candidatePaths, safeSourcePath, poll, deployCandidate, googleClient, command } from '../scripts/ci/deploy-production.mjs';
// @ts-expect-error Native ESM script has no generated declaration file.
import { smoke } from '../scripts/ci/smoke-production.mjs';

import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { requiredChecks } from '../scripts/discovery-release-check';

const sha = 'a'.repeat(40);
const env = { GITHUB_SHA: sha, GITHUB_REF: 'refs/heads/main', GITHUB_RUN_NUMBER: '12', GITHUB_RUN_ID: '123',
  GITHUB_REPOSITORY: 'owner/repo', GITHUB_EVENT_NAME: 'push',
  GCP_WORKLOAD_IDENTITY_PROVIDER: 'projects/123/locations/global/workloadIdentityPools/ci/providers/github',
  GCP_DEPLOY_SERVICE_ACCOUNT: 'ci@satsunicmedic.iam.gserviceaccount.com', FIREBASE_WEB_API_KEY: `AIza${'a'.repeat(32)}`, DISCOVERY_EVIDENCE_RUN_ID: '99' };
const id = identity(env, '0.1.0');
const image = `asia-southeast1-docker.pkg.dev/satsunicmedic/production/web@sha256:${'b'.repeat(64)}`;
const good = { ...id, status: 'SUCCEEDED', smoke: 'PASSED', image, functionRevision: 'api-1', rollout: 'rollout-1' };

describe('production configuration and immutable identity', () => {
  it('uses stable tag across reruns and rejects non-main', () => {
    expect(id.tag).toBe('v0.1.0-build.12');
    expect(identity({ ...env, GITHUB_RUN_ATTEMPT: '2' }, '0.1.0')).toEqual(id);
    expect(() => identity({ ...env, GITHUB_REF: 'refs/heads/other' }, '0.1.0')).toThrow();
  });
  it('rejects missing configuration and injection before mutations', () => {
    expect(() => validateConfig(env)).not.toThrow();
    for (const name of ['GCP_WORKLOAD_IDENTITY_PROVIDER', 'GCP_DEPLOY_SERVICE_ACCOUNT', 'FIREBASE_WEB_API_KEY', 'DISCOVERY_EVIDENCE_RUN_ID']) {
      expect(() => validateConfig({ ...env, [name]: '' })).toThrow();
    }
    expect(() => validateConfig({ ...env, FIREBASE_WEB_API_KEY: `${env.FIREBASE_WEB_API_KEY},_REGISTRY=attacker` })).toThrow();
  });
  it('rejects stale main and conflicting tags', async () => {
    await expect(assertCurrent(id, async () => ({ object: { sha: 'other' } }))).rejects.toThrow('Stale');
    await expect(existingTag(id, async () => ({ object: { sha: 'other', type: 'commit' } }))).rejects.toThrow('Existing');
  });
  it('binds deployment evidence to SHA, run, tag and image digest', () => {
    expect(() => validateManifest(good, id)).not.toThrow();
    for (const field of ['sha', 'tag', 'runId', 'repository', 'smoke', 'status', 'image']) {
      expect(() => validateManifest({ ...good, [field]: 'wrong' }, id)).toThrow();
    }
  });
  it('limits source scope and excludes credentials and symlink-like traversal', () => {
    expect(candidatePaths(['apps/web/src/a.ts', '.ai/local/private.json', 'package.json', 'output/test.png'])).toEqual(['apps/web/src/a.ts', 'package.json']);
    for (const path of ['apps/web/.env', 'apps/web/.env.production', '../x', 'apps/x/private-key.pem', 'apps/x/gha-creds-1.json', 'apps/web/node_modules/a']) expect(safeSourcePath(path)).toBe(false);
    expect(safeSourcePath('apps/web/src/page.tsx')).toBe(true);
  });
  it('preserves binary Git blob bytes including trailing whitespace', () => {
    const value = command(process.execPath, ['-e', 'process.stdout.write(Buffer.from([0,255,32,10]))'], { encoding: 'buffer' });
    expect([...value]).toEqual([0, 255, 32, 10]);
  });
});

describe('release retry and note range', () => {
  it('creates tag at exact SHA, notes since previous successful release, no duplicate on retry', async () => {
    const writes: { path: string; body: Record<string, unknown> }[] = [];
    let tagged = false; let released: Record<string, unknown> | null = null;
    const api = async (path: string, method = 'GET', body?: Record<string, unknown>) => {
      if (method !== 'GET') {
        writes.push({ path, body: body! });
        if (path === 'git/refs') { tagged = true; return {}; }
        if (path === 'releases/generate-notes') return { body: 'Verified change notes' };
        if (path === 'releases') { released = { ...body, html_url: 'https://github.com/owner/repo/releases/1' }; return released; }
      }
      if (path === 'git/ref/heads/main') return { object: { sha } };
      if (path.startsWith('git/ref/tags/')) return tagged ? { object: { sha, type: 'commit' } } : null;
      if (path.startsWith('releases/tags/')) return released;
      if (path.startsWith('compare/')) return { commits: [{ sha, commit: { message: 'fix(ci): direct main commit' } }] };
      if (path.startsWith('releases?')) return [{ tag_name: 'v0.1.0-build.11', body: 'Production deployment: SUCCEEDED' }];
      throw new Error(`Unexpected ${path}`);
    };
    await publish(id, good, api);
    expect(writes.find(w => w.path === 'git/refs')?.body.sha).toBe(sha);
    expect(writes.find(w => w.path === 'releases/generate-notes')?.body.previous_tag_name).toBe('v0.1.0-build.11');
    expect(writes.find(w => w.path === 'releases')?.body.body).toContain('fix(ci): direct main commit');
    const count = writes.length; await publish(id, good, api); expect(writes).toHaveLength(count);
  });
  it('does not create tags for failed deployments', async () => {
    let calls = 0;
    await expect(publish(id, { ...good, status: 'FAILED' }, async () => { calls++; })).rejects.toThrow();
    expect(calls).toBe(0);
  });
});

describe('provider errors, polling and smoke', () => {
  it('times out and fails terminal provider operations', async () => {
    await expect(poll(async () => ({ ready: false }), () => false, 'test', { attempts: 2, wait: async () => {} })).rejects.toThrow('timed out');
    await expect(poll(async () => ({ state: 'FAILED' }), () => false, 'test')).rejects.toThrow('failed');
  });
  it('does not disclose provider errors or credentials', async () => {
    const api = googleClient(() => 'fake-sensitive-token', async () => ({ status: 403, ok: false, text: () => 'secret' }));
    await expect(api('https://firebaseapphosting.googleapis.com/v1beta/test')).rejects.toThrow('Provider GET: HTTP 403');
    await expect(api('https://attacker.invalid/')).rejects.toThrow('Unexpected');
  });
  it('checks private-route denial and rejects redirects', async () => {
    await expect(smoke(async (url: string) => ({ status: url.endsWith('/me') ? 401 : 200 }), async () => {})).resolves.toBe('PASSED');
    await expect(smoke(async () => ({ status: 302 }), async () => {})).rejects.toThrow('smoke failed');
    await expect(smoke(async () => ({ status: 200 }), async () => {})).rejects.toThrow('/api/v1/me');
  });
});

function deploymentFixture(fail?: string) {
  const commands: string[] = []; const snapshots: Record<string, unknown>[] = [];
  const requests: { url: string; body?: Record<string, unknown> }[] = [];
  const base = 'projects/satsunicmedic/locations/asia-southeast1/backends/medic';
  let rolled = false; let built = false;
  const api = async (url: string, method = 'GET', body?: Record<string, unknown>) => {
    if (url.includes('/collectionGroups/')) return { indexes: [{ state: 'READY' }] };
    if (url.includes('cloudfunctions')) return { state: 'ACTIVE', serviceConfig: { revision: 'api-new' }, buildConfig: { source: {} } };
    if (url.endsWith('/traffic')) return { current: { splits: [{ build: `${base}/builds/${rolled ? 'ci-123-1' : 'previous'}`, percent: 100 }] } };
    if (url.endsWith('/builds/previous')) return { image: 'previous-image', config: { env: [{ variable: 'EXISTING_FLAG', value: 'false', availability: ['RUNTIME'] }] } };
    if (method === 'POST') {
      requests.push({ url, body });
      if (fail === 'web') throw new Error('web failed');
      if (url.includes('rollouts?')) rolled = true;
      if (url.includes('builds?')) built = true;
      return { name: 'projects/satsunicmedic/locations/asia-southeast1/operations/123' };
    }
    if (url.includes('/operations/')) return { done: true };
    if (url.includes('/rollouts/')) return rolled ? { state: 'SUCCEEDED', build: `${base}/builds/ci-123-1` } : null;
    if (url.includes('/builds/ci-123-1')) return built ? { state: 'READY', source: { container: { image } }, image } : null;
    throw new Error(`Unexpected URL ${url}`);
  };
  return { commands, snapshots, requests, deps: { api, attempt: '1',
    github: async (path: string) => path === 'git/ref/heads/main' ? { object: { sha: fail === 'stale' ? 'other' : sha } } : null,
    run: (cmd: string, args: string[]) => { commands.push(`${cmd} ${args.join(' ')}`); if (fail === 'api' && args.includes('functions:medic')) throw new Error('api failed'); return ''; },
    smokeCheck: async () => { if (fail === 'smoke') throw new Error('smoke failed'); return 'PASSED'; },
    persist: (_name: string, value: Record<string, unknown>) => snapshots.push(structuredClone(value)),
  } };
}
describe('deployment ordering and partial failure', () => {
  it('deploys API before web and records rollback metadata and verified success', async () => {
    const { deps, commands, snapshots, requests } = deploymentFixture();
    await expect(deployCandidate(id, image, deps)).resolves.toMatchObject({ status: 'SUCCEEDED', smoke: 'PASSED', functionRevision: 'api-new' });
    expect(commands[0]).toContain('firestore:rules,firestore:indexes'); expect(commands[1]).toContain('functions:medic');
    expect(snapshots[0]?.previous).toHaveProperty('build');
    expect(requests.find(r => r.url.includes('builds?'))?.body).toMatchObject({ config: { env: expect.arrayContaining([{ variable: 'EXISTING_FLAG', value: 'false', availability: ['RUNTIME'] }]) } });
  });
  it.each(['stale', 'api', 'web', 'smoke'])('records %s failure without claiming success', async failure => {
    const { deps, commands, snapshots } = deploymentFixture(failure);
    // Force creation for the web failure case.
    if (failure === 'web') { const original = deps.api; deps.api = async (url, method) => url.includes('/builds/ci-') ? null : original(url, method); }
    await expect(deployCandidate(id, image, deps)).rejects.toThrow();
    expect(snapshots.at(-1)?.status).toBe('FAILED');
    if (failure === 'stale') expect(commands).toHaveLength(0);
    if (failure === 'web' || failure === 'smoke') expect(snapshots.at(-1)?.failedAfter).toBe('API_DEPLOYED');
  });
});

it('does not move latest or compare backwards when repairing an older release', async () => {
  const changes: { path: string; body?: Record<string, unknown> }[] = [];
  const api = async (path: string, method = 'GET', body?: Record<string, unknown>) => {
    if (method !== 'GET') changes.push({ path, body });
    if (path.startsWith('git/ref/tags/') || path.startsWith('releases/tags/')) return null;
    if (path.startsWith('releases?')) return [
      { tag_name: 'v0.1.0-build.13', body: 'Production deployment: SUCCEEDED' },
      { tag_name: 'v0.1.0-build.11', body: 'Production deployment: SUCCEEDED' },
    ];
    if (path === 'releases/generate-notes') return { body: 'notes' };
    if (path.startsWith('compare/')) return { commits: [] };
    if (path === 'git/ref/heads/main') return { object: { sha: 'c'.repeat(40) } };
    return {};
  };
  await publish(id, good, api);
  expect(changes.find(c => c.path === 'releases/generate-notes')?.body?.previous_tag_name).toBe('v0.1.0-build.11');
  expect(changes.find(c => c.path === 'releases')?.body?.make_latest).toBe('false');
});

const directories: string[] = [];
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function acceptanceFixture() {
  const root = mkdtempSync(join(tmpdir(), 'medic-acceptance-')); directories.push(root);
  const bundle = join(root, 'evidence'); mkdirSync(bundle);
  writeFileSync(join(root, 'package.json'), '{}'); writeFileSync(join(bundle, 'check.txt'), 'actual test receipt');
  const files = [{ path: 'package.json', sha256: createHash('sha256').update('{}').digest('hex') }];
  const candidateSha256 = createHash('sha256').update(JSON.stringify(files)).digest('hex');
  const receipt = { status: 'PASSED', candidateSha256, checkedAt: new Date().toISOString(), evidence: 'check.txt' };
  const evidence = { scope: 'discovery', commit: sha, files, candidateSha256,
    checks: Object.fromEntries(requiredChecks.map(c => [c, { ...receipt }])),
    deferred: ['liveGoogle', 'restore', 'physicalDevices'].map(check => ({ check, reason: 'test-only fixture', approval: 'fixture owner' })) };
  return { root, bundle, evidence };
}
describe('acceptance gate completeness and evidence attachments', () => {
  it('accepts complete fresh candidate evidence', async () => {
    const { root, bundle, evidence } = acceptanceFixture();
    await expect(validateAcceptance(evidence, ['package.json'], sha, root, bundle)).resolves.toMatchObject({ status: 'READY_FOR_REVIEW' });
  });
  it('rejects a manifest omitting deployed source and a wrong commit', async () => {
    const { root, bundle, evidence } = acceptanceFixture();
    await expect(validateAcceptance(evidence, ['package.json', 'apps/api/src/firebase.ts'], sha, root, bundle)).rejects.toThrow('every selected');
    await expect(validateAcceptance({ ...evidence, commit: 'b'.repeat(40) }, ['package.json'], sha, root, bundle)).rejects.toThrow('commit mismatch');
  });
  it('rejects changed files and receipts outside the evidence bundle', async () => {
    const { root, bundle, evidence } = acceptanceFixture();
    evidence.checks.build!.evidence = '../package.json';
    await expect(validateAcceptance(evidence, ['package.json'], sha, root, bundle)).rejects.toThrow('unsafe');
    evidence.checks.build!.evidence = 'check.txt'; writeFileSync(join(root, 'package.json'), '{"changed":true}');
    await expect(validateAcceptance(evidence, ['package.json'], sha, root, bundle)).rejects.toThrow('Changed candidate');
  });
});

it('repairs a tag-only release failure without recreating or moving its tag', async () => {
  const writes: string[] = [];
  const api = async (path: string, method = 'GET') => {
    if (method !== 'GET') writes.push(path);
    if (path.startsWith('git/ref/tags/')) return { object: { type: 'commit', sha } };
    if (path.startsWith('releases/tags/')) return null;
    if (path.startsWith('releases?') || path.startsWith('commits?')) return [];
    if (path === 'releases/generate-notes') return { body: 'First production release' };
    if (path === 'git/ref/heads/main') return { object: { sha } };
    return {};
  };
  await publish(id, good, api);
  expect(writes).toEqual(['releases/generate-notes', 'releases']);
});
