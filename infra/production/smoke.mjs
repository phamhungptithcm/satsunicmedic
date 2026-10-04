const origin = process.env.SMOKE_ORIGIN;
if (!origin) throw new Error('SMOKE_ORIGIN required');
const checks = [];
async function check(name, path, expected, init) {
  const res = await fetch(new URL(path, origin), { ...init, signal: AbortSignal.timeout(15000) });
  const body = await res.text();
  if (res.status !== expected) throw new Error(`${name}: HTTP ${res.status}, expected ${expected}`);
  checks.push({ name, status: res.status });
  return { res, body };
}
await check('API readiness', '/api/v1/health/ready', 200);
const page = await check('Home', '/', 200);
if (/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(page.body)) throw new Error('Ads unexpectedly enabled');
if (!page.res.headers.get('content-security-policy')?.includes("object-src 'none'")) throw new Error('CSP absent');
await check('Private account requires session', '/api/v1/me', 401);
await check('Mutation rejects foreign origin', '/auth/session', 403, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' }, body: '{}' });
await check('Unreviewed preview unavailable', '/hoc-tap/sinh-ly-benh', 404);
await check('Missing article', '/bai-viet/not-a-published-article', 404);
const asset = await check('Empty asset catalog', '/api/v1/assets/current', 200);
if (JSON.parse(asset.body).asset !== null) throw new Error('Unexpected production asset');
console.log(JSON.stringify({ origin, checks, ads: 'disabled', result: 'PASS' }, null, 2));
