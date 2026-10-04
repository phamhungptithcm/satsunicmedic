# PROD-LOW15 v1 — Production dưới 15 USD/tháng

Status: APPROVED WITH EXCLUSION. See production-under-15-approval.md. Item 7 is excluded in full; no 3D model, asset route, or caching changes. Original planning inventory follows; execution evidence is recorded separately. Baseline: 100d8e094df9bd9a12296f38fe1c8078be35b4dc. User request: setup toàn bộ production, free website, chi phí thấp nhất dưới 15 USD/month. This replaces older 650 USD and 35–55 USD budget assumptions; it does not waive existing release acceptance.

## Verified inventory and intelligence

Read-only provider inspection 2026-10-04 UTC: project satsunicmedic, region asia-southeast1. Web medic and API api run on Cloud Run-backed Firebase services; web CPU 1, RAM 512 MiB, concurrency 20, min 0, max 1; API max 1. Source API uses min 0, max 1, CPU 1, 512 MiB, concurrency 20, 60-second timeout. Web currently has 300-second timeout. No compute forwarding rules listed. Cloud SQL API is disabled: no claim of successful SQL inventory.

Legacy VM medic-production in asia-southeast1-b is TERMINATED. It retains a 30 GB pd-standard disk and an IN_USE static external IPv4 address of the same name. Static IP attached to a stopped VM remains charged at USD 0.005/hour, approximately USD 3.65/730h. Disk data has NOT been inspected; preserve disk, VM and backups. Releasing the static IP permanently loses the address and requires approval and dependency/DNS verification.

Existing project-scoped monthly budget is USD 10 with actual-spend thresholds 50%, 90%, 100%, INCLUDE_ALL_CREDITS. This is an alert, not verified enforcement. No actual month-to-date invoice/usage amount has been obtained. Free quotas may be shared with other projects under the billing account.

Artifact Registry has production (~0.90 GB) and gcf-artifacts (~0.19 GB). Repository medic does not exist, but deploy-production.mjs and cloudbuild-web.yaml target medic/web. Build bucket has 7-day lifecycle, backup bucket 30-day lifecycle; other provider-managed source buckets exist. Do not blindly delete source/image/backup objects needed for rollback.

No WIF pools or dedicated CI deployment service account exist. Existing service accounts include medic-build, medic-functions and medic-web. Firestore is native Singapore with deletion protection enabled and PITR disabled. GitHub numeric repository ID 1398846396, owner ID 32831453. Prior release run 37166332536 passed both verification jobs and stopped before cloud authentication for missing configuration.

Intelligence initially DEGRADED (stale indexes); one refresh succeeded at current SHA. CodeGraph and CocoIndex queries now succeed. Graph traces validateConfig → preflight and runProduction → deployCandidate, and isDiscoveryEnabled callers. Source/provider evidence verified critical facts. Index is not proof of live readiness. Relevant profiles: universal, TypeScript/JavaScript, web, security, infrastructure, DevOps.

## Cost envelope, not an invoice guarantee

Preserve Firebase topology and Singapore; no new VM, SQL instance, load balancer, paid search, SMS auth, or paid AI API. Scale to zero stays enabled. Keep the existing USD 10 project alert as an early signal, excluding promotional credits in the proposed gross-spend view and preserving existing recipients. Add forecast warnings if supported without changing unrelated budgets.

Proposed planning allocation: runtime USD 3, bandwidth USD 4, storage/database/retained disk USD 3, builds/logging USD 1; USD 4 reserved for taxes, measurement delay and variance. These are allocations, not verified service prices or hard caps. Only launch when measured utilization and projected total fit the user ceiling. One-time build/deployment cost is included in the month's target.

Google App Hosting currently lists 10 GiB/month no-cost bandwidth, then USD 0.15 cached or USD 0.20 uncached per GiB. Thus 20 additional uncached GiB alone uses the USD 4 bandwidth allocation. Without available free quota, USD 4 covers only 20 GiB total. Do not count free quota twice or assume promotional credits.

The 77 full-body GLB assets total 141.72 MiB on disk; that is not a measured page payload. Loading the full set 1000 times would transfer about 138.4 GiB before protocol overhead and other assets, exceeding USD 15 in uncached transfer alone even with 10 GiB available free. Measure actual initial and repeat browsing before making a visitor-capacity promise. Existing routes use private,no-store; public caching requires the explicit controlled change below.

Google spend caps are Preview, per project AND per eligible service (Cloud Run / Cloud Run functions). If available for this account, propose USD 3 Cloud Run and USD 2 Cloud Run functions enforcement, leaving headroom for other charges. They use gross estimated costs; in-flight requests, enforcement delay, storage and CDN may still cost money. Eligibility/readback is required. No whole-project absolute USD 15 guarantee on this usage-based architecture. User must choose whether to accept temporary service interruption; never disable billing as a shortcut.

## Concrete implementation scope

1. Add infra/firebase/production-low-cost.json and scripts/ci/check-production-costs.mjs: explicit project/region, min 0/max 1/CPU 1/512 MiB, no paid ancillary infrastructure, projected-cost and actual-config readback report. Fail deployment when configuration drifts. Do not claim this is a monetary hard limiter. Add tests/production-cost-controls.test.ts for drift, unknown spend and unsafe missing metadata. Avoid provider response bodies containing secrets.
2. Update infra/firebase/cloudbuild-web.yaml and scripts/ci/deploy-production.mjs to reuse existing production/web registry after confirming current image lineage and build identity write access. Update tests/cicd-release.test.ts and runbook consistently. Prefer reusing this repository over creating medic. Preserve existing images and rollback digests. No destructive cleanup in this scope.
3. Configure GitHub production environment for main only; WIF pool github-production, provider github, dedicated medic-deploy@satsunicmedic.iam.gserviceaccount.com. OIDC condition must require repository_id 1398846396, repository_owner_id 32831453, ref refs/heads/main, subject repo:phamhungptithcm/satsunicmedic:environment:production. Use mapped numeric repository identity, short-lived credentials, no service-account keys, no Owner/Editor.
4. IAM scope: Workload Identity User on medic-deploy only for the above constrained principal; deployment permissions for Cloud Build submit/read, App Hosting build/rollout/traffic, Functions deploy/read, Firestore index and rules deploy/read. Artifact read limited to production/gcf-artifacts; source-object access limited to the existing build-source bucket/prefix. actAs only on verified existing build/web/API runtime service accounts required by provider operations. Validate exact permission inventory before applying; no blanket project IAM admin, secret accessor or runtime Firestore data access for CI. New permissions beyond these operations require a delta review.
5. Populate verified GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_DEPLOY_SERVICE_ACCOUNT and public FIREBASE_WEB_API_KEY in GitHub production. Set DISCOVERY_EVIDENCE_RUN_ID only from a real successful exact-SHA acceptance run, never a placeholder. Preserve all medical/auth/restore/asset release checks. Do not reclassify incomplete content as clinically reviewed.
6. Add explicit optional cost action: detach and release only the legacy medic-production static IPv4 after DNS/dependency checks. Keep terminated VM, its disk and backups. This saves approximately USD 3.65/month but is not reversible to the same IP. Default is NO deletion until explicitly approved. No permanent data deletion, snapshot deletion, image cleanup or database mutation.
7. Asset optimization scope: three public educational model route families under apps/web/src/app/kham-pha and hoc-tap/sinh-ly-benh/asset plus a small shared cache helper and matching tests. Preserve release checks BEFORE asset access; disabled/error/private content remains no-store. Begin with browser ETag revalidation (private,max-age=0,must-revalidate and matching 304), never cache sessions or learning/classroom data. Measure bandwidth and validate invalidation/feature-disable behavior. CDN immutable caching or geometry reduction is a separate delta if needed; no automatic shared caching of gated models. Keep current lazy layer behavior; verify initial/revisit network bytes in browser.
8. Update docs/implementation/cicd-production-runbook.md and this report with sanitized provider readback and actual costs/limits, warnings, recovery procedure, remaining blockers. No new user-facing product text is required; if maintenance UI becomes necessary, add a separate content review before implementation.

## Validation and rollback

Run focused cost/CI/asset regression tests; full typecheck/lint/unit/integration/build and OpenAPI drift for the release candidate. Read back budget filters, IAM subject restrictions, scale settings and registry permissions. Verify fork/other-branch identity cannot impersonate the deploy account. Build once with immutable digest; run container smoke, actual Google/session browser acceptance, expected anonymous denials, and remaining release evidence. No fake manual receipts or automatic policy deferrals. Re-read exact deploy SHA/revision/traffic after release.

Cost controls cannot replace product acceptance. Backup restore, asset rights/correctness and missing actual Google session acceptance remain open from the prior report. Evidence producer must exist before rerunning deploy. No production promotion until every applicable current gate is satisfied.

Rollback: revoke new WIF binding/disable provider on identity issue; restore captured configuration for budgets and resource limits. Preserve old App Hosting build and Functions artifact. No database/rules rollback without compatibility review. Released static IP cannot be recovered reliably; disk is preserved independently.

## Approval boundary and current outcome

This plan is a delta from CICD-PROD-20261001, whose approval explicitly excluded IAM bootstrap. AGENTS.md requires a reviewed concrete plan before protected existing-system changes. User's setup request authorizes investigation and preparation; do not represent it as approval of this newly presented IAM/cost/interruption/IP-release design. Reviewable plan prepared; no runtime/IAM/budget/source behavior changes applied. Production remains NOT_READY. Required decisions: approve PROD-LOW15 v1; choose interruption policy; separately approve permanent legacy IPv4 release or retain it in the budget. Tax rate and current actual billed amount remain unverified. Tokens/cost unavailable. Memory candidates: None.

## Primary sources checked

- https://firebase.google.com/docs/app-hosting/costs
- https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps
- https://cloud.google.com/vpc/network-pricing
- https://cloud.google.com/compute/disks-image-pricing
