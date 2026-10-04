import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export const costPolicy = JSON.parse(readFileSync(new URL('../../infra/firebase/production-low-cost.json', import.meta.url), 'utf8'));

// Normalized provider readback + independently measured monthly projection.
// This admission check is not a monetary cap and cannot stop all ongoing charges.
export function checkProductionCosts(evidence, now = Date.now()) {
  const failures = [];
  if (evidence?.project !== costPolicy.project || evidence?.region !== costPolicy.region || evidence?.currency !== 'USD') failures.push('Wrong cost evidence scope');
  const age = now - Date.parse(evidence?.checkedAt);
  if (!Number.isFinite(age) || age < -300_000 || age > 86_400_000) failures.push('Missing or stale cost evidence');
  for (const key of ['monthToDateUsd', 'projectedMonthTotalUsd']) {
    if (typeof evidence?.[key] !== 'number' || !Number.isFinite(evidence[key]) || evidence[key] < 0) failures.push(`Unknown ${key}`);
  }
  if (typeof evidence?.projectionSource !== 'string' || !evidence.projectionSource.trim() || typeof evidence?.actualCostSource !== 'string' || !evidence.actualCostSource.trim()) failures.push('Missing measured cost sources');
  if (evidence?.projectedMonthTotalUsd < evidence?.monthToDateUsd) failures.push('Projection below accrued costs');
  if (evidence?.projectedMonthTotalUsd >= costPolicy.monthlyCeilingUsd - costPolicy.reserveUsd) failures.push('Insufficient monthly budget headroom');
  const services = Array.isArray(evidence?.services) ? evidence.services : [];
  if (services.length !== costPolicy.services.length || new Set(services.map(s => s?.name)).size !== costPolicy.services.length) failures.push('Invalid service inventory');
  for (const name of costPolicy.services) {
    const service = services.find(s => s?.name === name);
    for (const [key, expected] of Object.entries(costPolicy.limits)) {
      if (service?.[key] !== expected) failures.push(`${name}: ${key} drift or missing`);
    }
  }
  return { status: failures.length ? 'NOT_READY' : 'PASSED', failures, hardTotalSpendCap: false };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = checkProductionCosts(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'PASSED' ? 0 : 2;
  } catch { console.error('Missing or invalid cost evidence file'); process.exitCode = 2; }
}
