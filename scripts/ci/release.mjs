import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function identity(env, version) {
  if (!/^[0-9a-f]{40}$/.test(env.GITHUB_SHA ?? '')) throw new Error('Invalid commit SHA');
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('package.version must be stable semver');
  if (!/^[1-9]\d*$/.test(env.GITHUB_RUN_NUMBER ?? '')) throw new Error('Invalid run number');
  if (!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY ?? '')) throw new Error('Invalid repository');
  if (env.GITHUB_REF !== 'refs/heads/main') throw new Error('Production requires main');
  if (!/^[1-9]\d*$/.test(env.GITHUB_RUN_ID ?? '')) throw new Error('Invalid run id');
  return { sha: env.GITHUB_SHA, tag: `v${version}-build.${env.GITHUB_RUN_NUMBER}`,
    runId: env.GITHUB_RUN_ID, repository: env.GITHUB_REPOSITORY,
    runUrl: `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` };
}

export function githubClient(env = process.env, fetcher = fetch) {
  return async (path, method = 'GET', body) => {
    const response = await fetcher(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}/${path}`, {
      method, headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path.split('?')[0]}: HTTP ${response.status}`);
    return response.status === 204 ? {} : response.json();
  };
}

export async function assertCurrent(id, api) {
  const ref = await api('git/ref/heads/main');
  if (ref?.object?.sha !== id.sha) throw new Error('Stale main SHA; refusing production mutation');
}

export async function existingTag(id, api) {
  const tag = await api(`git/ref/tags/${encodeURIComponent(id.tag)}`);
  if (tag && (tag.object?.type !== 'commit' || tag.object.sha !== id.sha)) {
    throw new Error('Existing release tag does not point directly to this commit');
  }
  return tag;
}

export function validateManifest(manifest, id) {
  if (manifest.status !== 'SUCCEEDED' || manifest.sha !== id.sha || manifest.tag !== id.tag ||
      manifest.runId !== id.runId || manifest.repository !== id.repository ||
      !/^asia-southeast1-docker\.pkg\.dev\/satsunicmedic\/production\/web@sha256:[a-f0-9]{64}$/.test(manifest.image ?? '') ||
      manifest.smoke !== 'PASSED' || !manifest.functionRevision || !manifest.rollout) {
    throw new Error('Missing successful deployment evidence for this run and SHA');
  }
}

export async function commitNotes(id, previous, api) {
  const range = previous ? `${encodeURIComponent(previous.tag_name)}...${id.sha}` : null;
  const result = await api(range ? `compare/${range}?per_page=50&page=1` : `commits?sha=${id.sha}&per_page=50`);
  const commits = range ? result?.commits : result;
  if (!Array.isArray(commits)) throw new Error('Cannot retrieve commit release notes');
  const lines = commits.map(item => {
    const subject = (item.commit?.message ?? '').split('\n')[0].slice(0, 180).replace(/[\\`*_{}[\]<>]/g, '\\$&');
    if (!/^[a-f0-9]{40}$/.test(item.sha ?? '')) throw new Error('Invalid commit in release notes');
    return `- ${subject} ([${item.sha.slice(0, 7)}](https://github.com/${id.repository}/commit/${item.sha}))`;
  });
  const link = range ? `https://github.com/${id.repository}/compare/${range}` : `https://github.com/${id.repository}/commits/${id.sha}`;
  return `## Commits\n${lines.join('\n')}\n\nShowing up to 50 commits. [Full history](${link}).`;
}

export async function publish(id, manifest, api) {
  validateManifest(manifest, id);
  const tag = await existingTag(id, api);
  const found = await api(`releases/tags/${encodeURIComponent(id.tag)}`);
  if (found && !found.draft) {
    if (!tag || !found.body?.includes(`Commit: ${id.sha}`) || !found.body?.includes(manifest.image)) {
      throw new Error('Published release metadata conflicts with deployment');
    }
    return found;
  }
  // Paginate: first release on this repository may predate more than 100 releases.
  let previous;
  for (let page = 1; page <= 100; page++) {
    const releases = await api(`releases?per_page=100&page=${page}`);
    if (!Array.isArray(releases)) throw new Error('Cannot enumerate production releases');
    previous = releases.find(r => !r.draft && !r.prerelease && r.tag_name !== id.tag &&
      /^v\d+\.\d+\.\d+-build\.\d+$/.test(r.tag_name) &&
      BigInt(r.tag_name.split('-build.')[1]) < BigInt(id.tag.split('-build.')[1]) &&
      r.body?.includes('Production deployment: SUCCEEDED'));
    if (previous || releases.length < 100) break;
    if (page === 100) throw new Error('Release history limit exceeded');
  }
  const generated = await api('releases/generate-notes', 'POST', {
    tag_name: id.tag, target_commitish: id.sha,
    ...(previous ? { previous_tag_name: previous.tag_name } : {}),
    configuration_file_path: '.github/release.yml',
  });
  const commits = await commitNotes(id, previous, api);
  const body = `${generated.body}\n\n${commits}\n\n## Deployment\nProduction deployment: SUCCEEDED\nCommit: ${id.sha}\nImage: ${manifest.image}\nFunction revision: ${manifest.functionRevision}\nRollout: ${manifest.rollout}\nSmoke: PASSED (public readiness and unauthenticated private-route denial)\nRun: ${id.runUrl}\n\n## Acceptance limits\nDiscovery scope only. Smoke does not prove clinical validity, real-account OAuth, restore, or physical-device acceptance. See the run's candidate-bound discovery evidence and explicit deferrals.\n`;
  // Creating a release explicitly at SHA avoids creating a tag at a moving branch.
  // Create the lightweight ref first so retries validate the immutable target.
  if (!tag) await api('git/refs', 'POST', { ref: `refs/tags/${id.tag}`, sha: id.sha });
  const main = await api('git/ref/heads/main');
  const payload = { tag_name: id.tag, target_commitish: id.sha, name: id.tag, body, draft: false, prerelease: false, make_latest: main?.object?.sha === id.sha ? 'true' : 'false' };
  return api(found ? `releases/${found.id}` : 'releases', found ? 'PATCH' : 'POST', payload);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const id = identity(process.env, JSON.parse(readFileSync('package.json', 'utf8')).version);
    const api = githubClient();
    if (process.argv[2] === 'publish') {
      const result = await publish(id, JSON.parse(readFileSync('.ai/local/cicd/deployment.json', 'utf8')), api);
      console.log(`Published ${result.html_url}`);
    } else if (process.argv[2] === 'check') {
      await assertCurrent(id, api); await existingTag(id, api);
      writeFileSync('.ai/local/cicd/identity.json', JSON.stringify(id, null, 2));
    } else throw new Error('Expected check or publish');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
