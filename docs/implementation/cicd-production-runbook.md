# Production CI/CD

Push/merge to `main` invokes **Release production**. Local commits alone do not trigger it. The workflow reuses Verify foundation, checks candidate acceptance, builds an immutable image, deploys Firebase, reads back the rollout and smoke tests it, then creates `v<package.version>-build.<run_number>` and a GitHub Release. Reruns retain the version; no force-tagging. All commits, including documentation-only commits, run verification. CI generates OpenAPI using the compiled `apps/api/dist/openapi.js` after build so Nest decorator metadata is preserved; source execution through tsx drops path-parameter metadata.

Target: project `satsunicmedic`, Singapore, App Hosting `medic`, Functions codebase `medic`/function `api`, Firestore default database. Resource caps are retained. VM deployment is not used. UI/API/schema are unchanged.

## One-time setup (owner/platform)

1. Commit the complete reviewed application candidate, lockfile, required anatomy assets/attribution, infra, scripts and workflows. This checkout currently contains extensive untracked work; inventory it before staging. Do not use a blanket `git add .` or commit generated `.ai/local`, credentials, build outputs or personal data.
2. Create GitHub environment `production`, restricted to `main`. If automatic deployment is intended, do not configure required reviewers for each run. Protect main with required verification checks and code review. Actions must be allowed to create tags/releases; protect release tags from force updates.
3. Configure WIF for the exact repository `phamhungptithcm/satsunicmedic`, numeric repository/owner identities, main ref, and `production` environment. Grant Workload Identity User on a dedicated deployment service account only to that constrained principal. No service-account key. Authentication alone is not authorization to grant new IAM permissions.
4. Give the deployment identity narrowly scoped access to existing Cloud Build submission/readback, the build-source bucket prefix, Artifact Registry image read, Firebase Functions deployment/readback, Firestore rules/index deployment/readback, and App Hosting builds/rollouts/traffic readback. Permit `iam.serviceAccounts.actAs` only for the existing build/runtime accounts required by these services. Do not grant Owner/Editor. Existing `medic-build` must retain artifact write and build-source/log bucket access. Functions CLI can require Firebase project/service-usage read permissions; validate IAM in a controlled initial run rather than broadening to project-admin automatically.
5. Disable any separate App Hosting Git-triggered rollout. CI checks for a competing active rollout policy before mutating runtime. Do not simultaneously deploy by hand while CI owns the production lock.
6. Set environment variables (configuration names, not credential files):

| Variable | Value |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full `projects/<number>/locations/global/workloadIdentityPools/<pool>/providers/<provider>` |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | Dedicated `…@satsunicmedic.iam.gserviceaccount.com` |
| `FIREBASE_WEB_API_KEY` | Verified public Firebase Web SDK key with appropriate restrictions; no private provider key |
| `DISCOVERY_EVIDENCE_RUN_ID` | Successful trusted Actions run containing exact-candidate evidence below |

The initial inspection found no repository Actions variables and no environments. WIF/IAM have not been provisioned by this task. These are setup prerequisites, not a claim that CI is already active.

## Candidate evidence

The existing discovery gate remains mandatory; a full-product/clinical NOT_READY result is not relabeled PASS. Browser, dependency audit and asset-rights evidence cannot be invented by a deployment workflow.

After committing a candidate, generate the manifest skeleton with:

```sh
node scripts/ci/deploy-production.mjs manifest > evidence.json
```

This command outputs `commit`, `scope`, file hashes, candidate hash, empty `checks`, and empty `deferred`. An authorized acceptance workflow at this exact SHA must run the checks, fill the evidence, and upload an artifact named `discovery-evidence` containing `evidence.json` plus referenced nonempty evidence files. The run must be from this repository, event `push` or `workflow_dispatch`, with conclusion `success`. Set its run ID in the variable, then rerun failed jobs in Release production if its initial attempt stopped for missing evidence. An existing acceptance producer may also finish before the deploy job starts. This task does not add or fabricate a browser/clinical acceptance system.

Manifest coverage is the full committed apps/packages/Firebase/Docker/CI surface selected by `candidatePaths`, including root dependency/build manifests. Check names and 24-hour freshness come from `scripts/discovery-release-check.ts`: typecheck, lint, unit, integration, build, browser, dependencyAudit, assetRights. Each receipt has status `PASSED`, matching `candidateSha256`, UTC `checkedAt`, and artifact-relative `evidence` path. External acceptance (liveGoogle, restore, physicalDevices) needs current evidence or an explicit owner-approved deferral recorded in `deferred`. Do not copy old approval across unrelated releases.

Evidence is externally authored; hashes and trusted-run checks prove binding/provenance, not the truth of manual assertions. The owner remains responsible for acceptance review. The bundle and its upload must not include secrets or protected personal data. CI also executes its own verification and dependency audit; failure stops deployment.

**Consequence:** automatic deploy is gated. Until the acceptance producer/configuration is available, a push stops safely before cloud authentication. The workflow cannot truthfully promise unconditional deployment on every main commit.

## Deployment and failure behavior

Cloud Build receives a fresh allowlist of committed files and never the checkout's generated Google ADC credential file. Builds use a SHA/run/attempt image tag and promote its resolved digest. CI boots this exact image locally before promotion. Functions packaging starts from a clean output folder, captures a lockfile, runs `npm ci` and audit, and retains the compiled artifact plus lockfile for recovery. Fresh transitive resolution is bounded to one recorded candidate artifact; recovery uses its captured lockfile.

Before changing runtime, CI saves the current web build/image and function revision/source reference. It checks main again after build. Changed Firestore configuration is deployed first, indexes must become READY, then Functions, then App Hosting. Firebase is noninteractive without `--force`; unexpected deletion fails closed. New code must remain compatible with old web during API-first deployment. Migration/backfill or incompatible contracts require a separate reviewed plan.

Evidence artifacts are retained 30 days:

- `functions-<run_id>-<attempt>`: compiled API/contracts, package metadata/lock and public runtime env only.
- `production-<run_id>-<attempt>`: identity, candidate paths, acceptance result, immutable image and deployment manifest.

No container source tree, ADC credentials, node_modules, provider raw output or response bodies are uploaded. Cloud operation logs stay with the provider. Action errors name the failed stage; use Cloud Build/Functions/App Hosting consoles for details.

On API success + web failure, status is FAILED with `failedAfter: API_DEPLOYED`; old web may still serve the new API. On smoke failure the new web may already be live. No success release is published. No automatic data/rules rollback is attempted.

## Rerun and release metadata repair

Prefer **Re-run failed jobs**. If deploy failed, the attempt gets a new image/build identity; successful release tags are never overwritten. If only release failed, deploy is not repeated: the release job downloads the newest manifest of this same run, validates SHA/tag/run/digest/smoke, then retries tag and release publication. Existing matching published releases are a no-op; conflicting tags/releases fail. A full rerun after a tag exists is intentionally stopped before Cloud Build; use failed-job rerun for metadata repair. An old run may publish its historical deployment notes, but it is not marked latest when main has advanced.

GitHub concurrency keeps only one running and one pending run. A newer pending push may replace an older pending push. The main-SHA guard skips superseded candidates; this delivers the newest eligible main, not a deployment guarantee for every intermediate commit.

Release notes use GitHub generated notes since the previous successful production release, categories in `.github/release.yml`, plus SHA/digest/revision/run and honest acceptance limits. An additional Commits section lists up to 50 commit subjects, including direct commits without PRs, with a link to the complete history. No release-created workflow is needed for deployment.

## Rollback (operator, controlled production action)

Stop new merges/deployments and establish the active CI run's outcome first. Download the failed run's production artifact and inspect `previous.build`, `previous.image`, `previous.functionRevision` and source references. Verify this is the predecessor of the currently live candidate, not a stale artifact.

For the web, use Firebase Console → App Hosting → medic → Rollouts → the verified previous build → rollback using the existing image. This restores the known image; do not rebuild old source with new dependencies. Confirm traffic is 100% on the previous build, then run:

```sh
node scripts/ci/smoke-production.mjs
```

If API rollback is also required, restore the previous successful run's `functions-…` artifact into `.ai/local/firebase-functions`, install using its `package-lock.json` (`npm ci --omit=dev --ignore-scripts` in that directory), then deploy only `functions:medic` with explicit project after reviewing compatibility. Do not use the failed run's API artifact as the previous version. If the previous production version predates this pipeline, use its retained Cloud Functions source/revision and existing operator procedure. Do not delete Firestore data or roll back indexes/rules blindly. Re-run readback/private-route checks and record the incident.

A real recovery drill and first cloud run remain NOT_TESTED until executed with configured IAM. Local mocked failure tests verify orchestration, not live recovery.

## References

- [Google GitHub Actions OIDC](https://github.com/google-github-actions/auth)
- [Firebase App Hosting rollout and rollback](https://firebase.google.com/docs/app-hosting/rollouts)
- [App Hosting REST discovery contract](https://firebaseapphosting.googleapis.com/$discovery/rest?version=v1beta)
- [GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)


## PROD-LOW15: approved cost envelope

The owner approved PROD-LOW15 except all 3D/asset optimization. Models, routes and caching remain unchanged. Registry now reuses `asia-southeast1-docker.pkg.dev/satsunicmedic/production/web`; this is the existing build-writable repository. `medic` was never provisioned.

Configured provider spend caps: Cloud Run USD 3/month and Cloud Run Functions USD 2/month, project satsunicmedic only, shown as Configured in Billing. Existing project USD 10 alert excludes credits and includes a 100% forecast warning. These do not cap storage/CDN/egress or guarantee a final USD 15 invoice. Credits and free quotas are not assumed when admitting a release.

Before a paid build, `runProduction` requires `acceptance/costs.json` from the trusted exact-candidate acceptance bundle. Supply commit matching the release SHA, project, region, currency USD, checkedAt (within 24h), numeric monthToDateUsd, projectedMonthTotalUsd, and nonempty actualCostSource/projectionSource references. Projection must include remaining-month traffic, new deployment/build, database/storage and the retained disk, and must be below USD 11 so USD 4 remains for tax/variance. Unknown projections block; do not copy a fixture or extrapolate a quiet hour as a promise. The helper reads fresh Cloud Run settings using only resource fields, overwriting any submitted service settings. Both services require min 0, max 1 at revision and service level, CPU 1, 512 MiB, concurrency 20. `cost-result.json` is local operational evidence, not a monetary kill switch.

The legacy static IP was released after source/reference and provider checks; its stopped VM, 30 GB disk and backup buckets are retained. Restoring that VM now requires a newly assigned address and any needed DNS update.

WIF provider is `projects/108608537442/locations/global/workloadIdentityPools/github-production/providers/github`; deploy identity is `medic-deploy@satsunicmedic.iam.gserviceaccount.com`. Numeric repo/owner, main ref and production environment subject are all constrained. GitHub environment allows only branch main. Custom project role omits IAM changes, secret access, Firestore document access and deletion; registry access is scoped read-only, build-source writes are create-only under cicd/. No service-account key was created.

**Still blocked:** `actAs` was not granted because automatic approval review requires explicit recipient/privilege approval. The existing Functions build uses the default Compute identity with Editor, which must not be delegated to CI under the approved least-privilege constraint. Prefer a separate scoped plan to move Functions builds to a narrowly permissioned build identity. The exact-SHA acceptance artifact and verified monthly forecast are also missing. Do not set a dummy DISCOVERY_EVIDENCE_RUN_ID, bypass publication/auth/restore checks, or rerun deployment as if setup were complete.
