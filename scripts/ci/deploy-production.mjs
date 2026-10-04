import { assertExternalDecisions } from './owner-deferrals.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, cpSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { identity, githubClient, assertCurrent, existingTag } from './release.mjs';
import { smoke, productionOrigin } from './smoke-production.mjs';
import { checkProductionCosts, costPolicy } from './check-production-costs.mjs';

const project = 'satsunicmedic';
const projectNumber = '108608537442';
export const canonicalResource = name => typeof name === 'string' ? name.replace(/^projects\/satsunicmedic\//, `projects/${projectNumber}/`) : '';
const location = 'asia-southeast1';
const backend = `projects/${project}/locations/${location}/backends/medic`;
const appHosting = 'https://firebaseapphosting.googleapis.com/v1beta/';
export const publicDiscoveryCatalog = 'scripts/free-anatomy/catalog/discovery.json';
const registry = `${location}-docker.pkg.dev/${project}/production/web`;
const output = '.ai/local/cicd';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const save = (name, value) => { mkdirSync(output, { recursive: true }); writeFileSync(`${output}/${name}.json`, JSON.stringify(value, null, 2) + '\n'); };

// Report only fixed categories, status codes and permission identifiers. Never echo provider text.
export function commandFailureSummary(error) {
  const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
  const statuses = [...new Set([...output.matchAll(/(?:HTTP(?: Error)?[: ]+|status(?:Code)?[":= ]+)([45]\d\d)\b/gi)].map(m => m[1]))];
  const permissions = [...new Set([...output.matchAll(/\b(?:iam|datastore|firebaserules|serviceusage|cloudfunctions|firebaseextensions|storage|run|cloudbuild)\.(?:serviceAccounts|databases|indexes|fields|entities|rulesets|releases|projects|services|functions|operations|instances|buckets|objects|builds)\.(?:get|list|create|update|delete|use|actAs|getMetadata|getAccessToken|setIamPolicy|getIamPolicy|enable)\b/g)].map(m => m[0]))];
  const services = ['firestore', 'firebaserules', 'cloudfunctions', 'serviceusage', 'cloudresourcemanager', 'firebase', 'firebaseextensions', 'iam'].filter(s => output.includes(`${s}.googleapis.com`));
  const categories = Object.entries({ permission: /permission|PERMISSION_DENIED|forbidden/i, authentication: /unauthenticated|authenticate|invalid.credentials/i, interactive: /non.interactive|confirmation|prompt/i, missingFile: /ENOENT|file.*not.found|cannot.find.module/i, validation: /invalid.argument|invalid.config|failed.to.compile/i }).filter(([, pattern]) => pattern.test(output)).map(([name]) => name);
  return JSON.stringify({ statuses, observedPermissions: permissions.slice(0, 20), services, categories });
}
// Commands use argv, never a shell. Raw provider output stays in memory only.

export function command(executable, args, options = {}) {
  try { const result = execFileSync(executable, executable === 'firebase' && args[0] === 'deploy' ? [...args, '--debug'] : args, { encoding: 'utf8', timeout: 2_400_000,
    maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...options }); return Buffer.isBuffer(result) ? result : result.trim(); }
  catch (error) { throw new Error(`Command failed: ${executable} ${args[0]}; ${commandFailureSummary(error)}`); }
}

export function validateConfig(env) {
  if (!/^projects\/\d+\/locations\/global\/workloadIdentityPools\/[\w-]+\/providers\/[\w-]+$/.test(env.GCP_WORKLOAD_IDENTITY_PROVIDER ?? '')) throw new Error('Missing/invalid GCP_WORKLOAD_IDENTITY_PROVIDER');
  if (!/^[a-z][a-z0-9-]*@satsunicmedic\.iam\.gserviceaccount\.com$/.test(env.GCP_DEPLOY_SERVICE_ACCOUNT ?? '')) throw new Error('Missing/invalid GCP_DEPLOY_SERVICE_ACCOUNT');
  if (!/^AIza[\w-]{20,}$/.test(env.FIREBASE_WEB_API_KEY ?? '')) throw new Error('Missing/invalid public FIREBASE_WEB_API_KEY');
  if (!/^[1-9]\d*$/.test(env.DISCOVERY_EVIDENCE_RUN_ID ?? '')) throw new Error('Missing DISCOVERY_EVIDENCE_RUN_ID');
  if (env.GITHUB_EVENT_NAME !== 'push') throw new Error('Only main push events deploy production');
}

export function candidatePaths(paths) {
  const rootFiles = new Set(['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', 'tsconfig.base.json', 'tsconfig.json', '.dockerignore', 'firebase.json']);
  return paths.filter(p => rootFiles.has(p) || p === publicDiscoveryCatalog || /^(apps|packages|infra\/firebase|infra\/docker|scripts\/ci)\//.test(p) || p === 'docs/implementation/production-risk-acceptance-approval.json' || p === 'scripts/discovery-release-check.ts' || p.startsWith('.github/'));
}
export function safeSourcePath(path) {
  return !path.split('/').some(p => p === '..' || p === '.git' || p === 'node_modules' || p === '.next' || p === 'dist' || p === '.ai') &&
    !/(^|\/)(\.env(?:\..*)?|gha-creds-[^/]+\.json|[^/]*(?:credential|private-key|secret)[^/]*)$/i.test(path) &&
    !/\.(pem|p12|key)$/i.test(path) && !path.startsWith('/') && !path.includes('\\');
}

export async function validateAcceptance(evidence, paths, sha, root, bundle, now = Date.now()) {
  if (evidence.commit !== sha) throw new Error('Discovery evidence commit mismatch');
  const declared = evidence.files?.map(f => f.path).sort();
  if (JSON.stringify(declared) !== JSON.stringify(paths)) throw new Error('Discovery manifest must cover every selected committed candidate file');
  const deferred = assertExternalDecisions(evidence, now);
  if (deferred.length) {
    const attachment = realpathSync(resolve(bundle, 'owner-deferrals.json'));
    if (relative(realpathSync(bundle), attachment).startsWith('..') || !lstatSync(attachment).isFile() || JSON.stringify(JSON.parse(readFileSync(attachment, 'utf8'))) !== JSON.stringify(deferred)) throw Error('Missing/mismatched owner decision attachment');
  }
  const { checkDiscovery } = await import('../discovery-release-check.ts');
  const result = checkDiscovery(evidence, root, now);
  if (result.status !== 'READY_FOR_REVIEW') throw new Error(`Discovery gate: ${result.failures.join('; ')}`);
  for (const check of Object.values(evidence.checks)) {
    const base = realpathSync(bundle);
    const evidenceFile = realpathSync(resolve(base, check.evidence));
    const rel = relative(base, evidenceFile);
    if (!rel || rel.startsWith('..') || !lstatSync(evidenceFile).isFile() || !readFileSync(evidenceFile).length) throw new Error('Missing/unsafe acceptance attachment');
  }
  return result;
}

export async function preflight(env = process.env, run = command) {
  validateConfig(env);
  const id = identity(env, json('package.json').version);
  const acceptanceRun = await githubClient(env)(`actions/runs/${env.DISCOVERY_EVIDENCE_RUN_ID}`);
  if (acceptanceRun?.head_sha !== id.sha || acceptanceRun?.head_repository?.full_name !== id.repository ||
      acceptanceRun?.conclusion !== 'success' || !['push', 'workflow_dispatch'].includes(acceptanceRun?.event)) {
    throw new Error('Acceptance artifact must come from a successful trusted run at this exact SHA');
  }
  if (run('git', ['rev-parse', 'HEAD']) !== id.sha) throw new Error('Checkout SHA mismatch');
  run('git', ['diff', '--exit-code', 'HEAD', '--']);
  const paths = candidatePaths(run('git', ['ls-files', '-z']).split('\0').filter(Boolean)).sort();
  if (!paths.includes('apps/api/src/firebase.ts') || !paths.includes('.github/workflows/release-production.yml')) throw new Error('Commit the complete application and workflow first');
  for (const path of paths) {
    if (!safeSourcePath(path) || !lstatSync(path).isFile()) throw new Error(`Unsafe candidate path: ${path}`);
  }
  const result = await validateAcceptance(json(`${output}/acceptance/evidence.json`), paths, id.sha, process.cwd(), `${output}/acceptance`);
  save('identity', id); save('acceptance-result', result); save('candidate-files', paths);
  return id;
}

// Access tokens stay in process memory, never in argv/logs/artifacts. Refresh per request.
export function googleClient(run = command, fetcher = fetch) {
  return async (url, method = 'GET', body, allow404 = false) => {
    if (!/^https:\/\/(firebaseapphosting|firestore|cloudfunctions)\.googleapis\.com\//.test(url)) throw new Error('Unexpected provider API host');
    const token = run('gcloud', ['auth', 'print-access-token']);
    const response = await fetcher(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error(`Provider ${method}: HTTP ${response.status}`);
    return response.json();
  };
}

export async function poll(read, accept, label, { attempts = 120, wait = sleep } = {}) {
  for (let i = 0; i < attempts; i++) {
    const value = await read();
    if (value.error || ['FAILED', 'CANCELLED', 'SKIPPED', 'EXPIRED'].includes(value.state)) throw new Error(`${label} failed`);
    if (accept(value)) return value;
    if (i + 1 < attempts) await wait(10_000);
  }
  throw new Error(`${label} timed out; inspect operation before retry`);
}

export async function waitOperation(op, api) {
  if (!canonicalResource(op.name).startsWith(`projects/${projectNumber}/locations/`)) throw new Error('Unexpected operation name');
  return poll(() => api(appHosting + op.name), v => v.done === true, 'App Hosting operation');
}

export async function indexesReady(api) {
  return poll(async () => {
    let pageToken; let ready = true;
    do {
      // The provider currently only accepts its default (zero) page size.
      const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/-/indexes${pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const page = await api(url);
      for (const index of page.indexes ?? []) {
        if (index.state === 'NEEDS_REPAIR') throw new Error('Firestore index needs repair');
        if (index.state !== 'READY') ready = false;
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
    return { ready };
  }, value => value.ready, 'Firestore indexes');
}

export function functionDeployArgs(existing) {
  const buildAccount = `projects/${project}/serviceAccounts/medic-build@${project}.iam.gserviceaccount.com`;
  const runtimeAccount = `medic-functions@${project}.iam.gserviceaccount.com`;
  if (canonicalResource(existing.name) !== `projects/${projectNumber}/locations/${location}/functions/api` || existing.state !== 'ACTIVE' ||
      existing.environment !== 'GEN_2' || existing.buildConfig?.serviceAccount !== buildAccount ||
      existing.serviceConfig?.serviceAccountEmail !== runtimeAccount) throw new Error('Existing Functions identity drift; do not create or change delegation');
  return ['functions', 'deploy', 'api', '--gen2', '--project', project, '--region', location,
    '--source', '.ai/local/firebase-functions', '--ignore-file', '.gcloudignore',
    '--runtime', 'nodejs24', '--entry-point', 'api', '--build-service-account', buildAccount,
    '--service-account', runtimeAccount, '--min-instances', '0', '--max-instances', '1',
    '--cpu', '1', '--memory', '512Mi', '--concurrency', '20', '--timeout', '60s',
    '--serve-all-traffic-latest-revision',
    '--update-env-vars', `NODE_ENV=production,APP_ORIGIN=${productionOrigin},MEDIC_FIREBASE_PROJECT_ID=${project},ASSET_DELIVERY_ENABLED=false`,
    '--quiet'];
}

export async function deployCandidate(id, image, deps) {
  const { api, run, github, smokeCheck = smoke, persist = save } = deps;
  if (!new RegExp(`^${registry.replaceAll('.', '\\.')}@sha256:[a-f0-9]{64}$`).test(image)) throw new Error('Invalid immutable image');
  const manifest = { ...id, image, status: 'STARTED', smoke: 'NOT_RUN', deferred: deps.deferred ?? [] };
  const functionUrl = `https://cloudfunctions.googleapis.com/v2/projects/${project}/locations/${location}/functions/api`;
  const previous = await api(`${appHosting}${backend}/traffic`);
  if (previous.rolloutPolicy?.codebaseBranch && !previous.rolloutPolicy.disabled) throw new Error('Disable competing App Hosting automatic rollout before CI owns deployment');
  const oldFunction = await api(functionUrl);
  const functionArgs = functionDeployArgs(oldFunction);
  const oldBuild = previous.current?.splits?.find(s => s.percent === 100)?.build;
  if (!oldBuild) throw new Error('Cannot establish previous production build for rollback');
  const oldBuildState = await api(appHosting + oldBuild);
  manifest.previous = { build: oldBuild, image: oldBuildState.image, functionRevision: oldFunction.serviceConfig?.revision,
    functionSource: oldFunction.buildConfig?.source, traffic: previous.current };
  persist('deployment', manifest);
  try {
    await assertCurrent(id, github);
    // Firebase CLI refuses destructive index/function deletion in noninteractive mode without --force.
    // Deploy Firestore config only when it differs from the last successful production release.
    const releases = await github('releases/latest');
    const baseline = releases?.body?.match(/Commit: ([a-f0-9]{40})/)?.[1];
    const changed = !baseline || run('git', ['diff', '--name-only', baseline, id.sha, '--', 'infra/firebase/firestore.rules', 'infra/firebase/firestore.indexes.json']).length > 0;
    if (changed) run('firebase', ['deploy', '--project', project, '--only', 'firestore:rules,firestore:indexes', '--non-interactive']);
    await indexesReady(api);
    manifest.status = 'FIRESTORE_READY'; persist('deployment', manifest);
    // Update only the verified existing function. No invoker/IAM flags: preserve its policy.
    run('gcloud', functionArgs);
    const fn = await poll(() => api(functionUrl), v => v.state === 'ACTIVE', 'Functions readiness');
    if (!fn.serviceConfig?.revision) throw new Error('Missing Functions revision readback');
    manifest.functionRevision = fn.serviceConfig.revision;
    manifest.functionSource = fn.buildConfig?.source;
    manifest.status = 'API_DEPLOYED'; persist('deployment', manifest);
    const buildId = `ci-${id.runId}-${deps.attempt}`;
    if (!/^ci-\d+-\d+$/.test(buildId)) throw new Error('Invalid deployment attempt');
    const buildName = `${backend}/builds/${buildId}`;
    const existing = await api(appHosting + buildName, 'GET', undefined, true);
    if (existing && existing.source?.container?.image !== image) throw new Error('Existing App Hosting build has another image');
    if (!existing) {
      const op = await api(`${appHosting}${backend}/builds?buildId=${buildId}`, 'POST', {
        source: { container: { image } }, labels: { 'commit-sha': id.sha },
        config: { runConfig: { cpu: 1, memoryMib: 512, minInstances: 0, maxInstances: 1, concurrency: 20 },
          env: [...(oldBuildState.config?.env ?? []).filter(entry => entry.variable !== 'APP_ORIGIN').map(entry => ({
            variable: entry.variable, availability: entry.availability,
            ...(entry.secret ? { secret: entry.secret } : { value: entry.value }),
          })), { variable: 'APP_ORIGIN', value: productionOrigin, availability: ['RUNTIME'] }] },
      });
      await waitOperation(op, api);
    }
    await poll(() => api(appHosting + buildName), v => ['READY', 'BUILT'].includes(v.state), 'App Hosting build');
    const rolloutName = `${backend}/rollouts/${buildId}`;
    const rollout = await api(appHosting + rolloutName, 'GET', undefined, true);
    if (rollout && canonicalResource(rollout.build) !== canonicalResource(buildName)) throw new Error('Existing rollout points to another build');
    if (!rollout) await waitOperation(await api(`${appHosting}${backend}/rollouts?rolloutId=${buildId}`, 'POST', { build: buildName }), api);
    await poll(() => api(appHosting + rolloutName), v => v.state === 'SUCCEEDED', 'App Hosting rollout');
    await poll(() => api(`${appHosting}${backend}/traffic`), v => !v.reconciling && v.current?.splits?.some(s => canonicalResource(s.build) === canonicalResource(buildName) && s.percent === 100), 'Production traffic');
    const deployed = await api(appHosting + buildName);
    if (deployed.image !== image) throw new Error('Deployed image digest mismatch');
    manifest.rollout = rolloutName; manifest.build = buildName;
    manifest.smoke = await smokeCheck();
    if (manifest.smoke !== 'PASSED') throw new Error('Smoke did not pass');
    manifest.status = 'SUCCEEDED'; persist('deployment', manifest);
    return manifest;
  } catch (error) {
    manifest.failedAfter = manifest.status; manifest.status = 'FAILED';
    // Error text is not persisted: provider errors can contain confidential metadata.
    persist('deployment', manifest); throw error;
  }
}

export function stageSource(paths, run = command, target = `${output}/source`) {
  mkdirSync(target, { recursive: false });
  // Only the clean committed allowlist is sent to Cloud Build; ADC files are excluded.
  const buildPaths = paths.filter(p => !p.startsWith('.github/') && (!p.startsWith('scripts/') || p === publicDiscoveryCatalog) && !p.startsWith('apps/api/'));
  for (const path of buildPaths) {
    if (!safeSourcePath(path) || !lstatSync(path).isFile()) throw new Error(`Unsafe build input: ${path}`);
    // Ensure the working copy still matches the approved Git object after dependency install.
    const committed = run('git', ['show', `HEAD:${path}`], { encoding: 'buffer' });
    const content = readFileSync(path);
    if (!Buffer.from(committed).equals(content)) throw new Error(`Modified build input: ${path}`);
    mkdirSync(dirname(`${target}/${path}`), { recursive: true }); cpSync(path, `${target}/${path}`);
  }
  writeFileSync(`${target}/.gcloudignore`, '# Source directory already contains only allowlisted committed files.\n');
  return target;
}

// Only resource settings are read; environment variables and credentials are excluded.
export function readLiveCostServices(run = command) {
  return costPolicy.services.map(name => {
    const service = JSON.parse(run('gcloud', ['run', 'services', 'describe', name, '--project', project, '--region', location,
      '--format=json(metadata.annotations,spec.template.metadata.annotations,spec.template.spec.containers[0].resources.limits,spec.template.spec.containerConcurrency)']));
    const annotations = service.spec?.template?.metadata?.annotations ?? {};
    const spec = service.spec?.template?.spec;
    const limits = spec?.containers?.[0]?.resources?.limits ?? {};
    const memory = /^(\d+)(Mi|Gi)$/.exec(limits.memory ?? '');
    const serviceMax = service.metadata?.annotations?.['run.googleapis.com/maxScale'];
    return { name, minInstances: Math.max(Number(annotations['autoscaling.knative.dev/minScale'] ?? 0), Number(service.metadata?.annotations?.['run.googleapis.com/minScale'] ?? 0)),
      maxInstances: Math.max(Number(annotations['autoscaling.knative.dev/maxScale']), Number(serviceMax ?? 0)),
      cpu: Number(limits.cpu), memoryMiB: memory ? Number(memory[1]) * (memory[2] === 'Gi' ? 1024 : 1) : null,
      concurrency: spec?.containerConcurrency };
  });
}

export async function runProduction(env = process.env) {
  const id = json(`${output}/identity.json`);
  if (JSON.stringify(id) !== JSON.stringify(identity(env, json('package.json').version))) throw new Error('Identity artifact mismatch');
  const github = githubClient(env); await assertCurrent(id, github);
  const tag = await existingTag(id, github);
  if (tag) throw new Error('Release already tagged; rerun only the failed release job to avoid redeploying');
  if (!/^[1-9]\d*$/.test(env.GITHUB_RUN_ATTEMPT ?? '')) throw new Error('Invalid run attempt');
  const costs = json(`${output}/acceptance/costs.json`);
  if (costs.commit !== id.sha) throw new Error('Cost evidence commit mismatch');
  costs.services = readLiveCostServices();
  const costResult = checkProductionCosts(costs);
  save('cost-result', costResult);
  if (costResult.status !== 'PASSED') throw new Error(`Cost gate: ${costResult.failures.join('; ')}`);
  const api = googleClient();
  const source = stageSource(json(`${output}/candidate-files.json`));
  const imageTag = `sha-${id.sha}-run-${id.runId}-${env.GITHUB_RUN_ATTEMPT}`;
  command('gcloud', ['builds', 'submit', source, '--project', project, '--region', location,
    '--config', 'infra/firebase/cloudbuild-web.yaml', '--gcs-source-staging-dir', `gs://${project}-build-source/cicd`,
    '--substitutions', `_RELEASE=${imageTag},_FIREBASE_API_KEY=${env.FIREBASE_WEB_API_KEY}`, '--format=json', '--quiet']);
  const digest = command('gcloud', ['artifacts', 'docker', 'images', 'describe', `${registry}:${imageTag}`, '--project', project, '--format=value(image_summary.digest)']);
  if (!/^sha256:[a-f0-9]{64}$/.test(digest)) throw new Error('Missing built image digest');
  save('build', { ...id, image: `${registry}@${digest}` });
  // Test the exact image that will be promoted, not a second rebuild.
  command('gcloud', ['auth', 'configure-docker', `${location}-docker.pkg.dev`, '--quiet']);
  command('docker', ['pull', `${registry}@${digest}`]);
  try {
    command('docker', ['run', '--detach', '--name', 'medic-ci-smoke', '--publish', '127.0.0.1:48080:8080', `${registry}@${digest}`]);
    await poll(async () => {
      try {
        const response = await fetch('http://127.0.0.1:48080/', { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
        await response.body?.cancel(); return { ready: response.status === 200 };
      } catch { return { ready: false }; }
    }, v => v.ready, 'Immutable container smoke', { attempts: 12 });
  } finally { command('docker', ['rm', '--force', 'medic-ci-smoke']); }
  // Recheck main after the long build, before any runtime mutation.
  await assertCurrent(id, github);
  return deployCandidate(id, `${registry}@${digest}`, { api, run: command, github, attempt: env.GITHUB_RUN_ATTEMPT, deferred: assertExternalDecisions(json(`${output}/acceptance/evidence.json`)) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const task = process.argv[2];
  Promise.resolve().then(async () => {
    if (task === 'preflight') await preflight();
    else if (task === 'deploy') await runProduction();
    else if (task === 'manifest') {
      // Offline helper for evidence producers; never manufactures PASSED results.
      const paths = candidatePaths(command('git', ['ls-files', '-z']).split('\0').filter(Boolean)).sort();
      const files = paths.map(path => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') }));
      console.log(JSON.stringify({ commit: command('git', ['rev-parse', 'HEAD']), scope: 'discovery', files,
        candidateSha256: createHash('sha256').update(JSON.stringify(files)).digest('hex'), checks: {}, deferred: [] }, null, 2));
    } else throw new Error('Expected preflight, deploy or manifest');
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
