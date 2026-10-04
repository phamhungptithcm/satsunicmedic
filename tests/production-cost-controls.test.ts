// @ts-expect-error Native ESM operational script has no generated declarations.
import { readLiveCostServices } from '../scripts/ci/deploy-production.mjs';
import { describe, it, expect } from 'vitest';
// @ts-expect-error Native ESM operational script has no generated declarations.
import { checkProductionCosts, costPolicy } from '../scripts/ci/check-production-costs.mjs';
const now = Date.parse('2026-10-04T01:00:00Z');
function fixture() { return {project:'satsunicmedic',region:'asia-southeast1',currency:'USD',checkedAt:new Date(now).toISOString(),monthToDateUsd:1,projectedMonthTotalUsd:5,actualCostSource:'fixture actual',projectionSource:'fixture measured projection',services:costPolicy.services.map((name:string)=>({name,...costPolicy.limits}))}; }
describe('production cost admission',()=>{
 it('admits bounded current measured evidence without claiming a hard cap',()=>expect(checkProductionCosts(fixture(),now)).toEqual({status:'PASSED',failures:[],hardTotalSpendCap:false}));
 it('blocks absent actual costs and projections',()=>expect(checkProductionCosts({},now).status).toBe('NOT_READY'));
 it('blocks scope confusion',()=>expect(checkProductionCosts({...fixture(),project:'other'},now).status).toBe('NOT_READY'));
 it('blocks stale evidence',()=>expect(checkProductionCosts(fixture(),now+86_400_001).status).toBe('NOT_READY'));
 it('blocks future-dated evidence',()=>expect(checkProductionCosts(fixture(),now-300_001).status).toBe('NOT_READY'));
 it('retains reserve at the boundary',()=>expect(checkProductionCosts({...fixture(),projectedMonthTotalUsd:11},now).status).toBe('NOT_READY'));
 it('rejects understated projection',()=>expect(checkProductionCosts({...fixture(),monthToDateUsd:6},now).status).toBe('NOT_READY'));
 it('blocks duplicate and missing services',()=>{const e=fixture();e.services[1]=e.services[0];expect(checkProductionCosts(e,now).status).toBe('NOT_READY');});
 it('blocks scaling drift',()=>{const e=fixture();e.services[0].maxInstances=2;expect(checkProductionCosts(e,now).status).toBe('NOT_READY');});
 it('blocks missing memory limit',()=>{const e=fixture();e.services[0].memoryMiB=undefined;expect(checkProductionCosts(e,now).status).toBe('NOT_READY');});
 it('blocks non-finite projection',()=>expect(checkProductionCosts({...fixture(),projectedMonthTotalUsd:Infinity},now).status).toBe('NOT_READY'));
});

it('rejects malformed service evidence without throwing',()=>{
 for (const services of [null, {}, [null, null]]) expect(checkProductionCosts({...fixture(),services},now).status).toBe('NOT_READY');
});
it('uses fresh provider scaling and excludes environment from queries',()=>{
 const live = readLiveCostServices((_exe:string,args:string[])=>{
  expect(args.join(' ')).not.toContain('environment');
  return JSON.stringify({spec:{template:{metadata:{annotations:{'autoscaling.knative.dev/maxScale':'1'}},spec:{containers:[{resources:{limits:{cpu:'1.00',memory:'512Mi'}}}],containerConcurrency:20}}}});
 });
 expect(live).toEqual(fixture().services);
});

it('detects service-level scaling drift above revision settings',()=>{
 const live=readLiveCostServices(()=>JSON.stringify({metadata:{annotations:{'run.googleapis.com/minScale':'1','run.googleapis.com/maxScale':'20'}},spec:{template:{metadata:{annotations:{'autoscaling.knative.dev/minScale':'0','autoscaling.knative.dev/maxScale':'1'}},spec:{containers:[{resources:{limits:{cpu:'1',memory:'512Mi'}}}],containerConcurrency:20}}}}));
 expect(checkProductionCosts({...fixture(),services:live},now).status).toBe('NOT_READY');
});
