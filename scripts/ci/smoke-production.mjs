import { pathToFileURL } from 'node:url';
export const productionOrigin = 'https://medic--satsunicmedic.asia-southeast1.hosted.app';
export async function smoke(fetcher = fetch, sleep = ms => new Promise(r => setTimeout(r, ms))) {
  const checks = [['/', 200], ['/hoc-tap', 200], ['/tai-khoan', 200], ['/api/v1/health/ready', 200], ['/api/v1/me', 401]];
  for (const [path, expected] of checks) {
    let passed = false;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const response = await fetcher(`${productionOrigin}${path}`, {
          redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15_000),
          headers: { 'Cache-Control': 'no-cache' },
        });
        passed = response.status === expected;
        // Do not retain response bodies or user data in deployment evidence.
        await response.body?.cancel();
      } catch { passed = false; }
      if (passed) break;
      if (attempt < 5) await sleep(5_000);
    }
    if (!passed) throw new Error(`Production smoke failed: ${path} expected ${expected}`);
  }
  return 'PASSED';
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  smoke().then(console.log).catch(error => { console.error(error.message); process.exitCode = 1; });
}
