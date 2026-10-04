# PROD-ACCEPTANCE-01 — Complete the production acceptance producer

Status: APPROVED by repository owner in the 2026-10-04 reply “apporved” to this exact plan. Existing release authorization remains valid; no repeat deployment approval is requested. Baseline: 415a98a03b97ed24bc28def09569494cd2093239.

## Verified gap and intelligence

Repository intelligence is DEGRADED: CodeGraph index stale, CocoIndex stale/unhealthy. Bounded source, Git and provider evidence used. Release production run 37176685583 targets this baseline. Only verify.yml and release-production.yml exist. The latter requires a successful exact-SHA Actions run with discovery-evidence; neither workflow produces that artifact. DISCOVERY_EVIDENCE_RUN_ID is unset. Current manifest hash: feadb5ef8aa8a5f7b3aba3d6d88ae3c110ff4edb4877e6a42e8c5bf10cfb4e90. A retry alone cannot resolve the missing producer.

The separate full-product release check is NOT_READY for anatomical correctness, medical acceptance, real-account session, restore and full-product acceptance. This plan must not relabel those checks as passed or silently reduce the requested full release to discovery-only acceptance. Prior asset-license/browser receipts are older candidates and must be reverified.

## Approved scope requested

Add a reproducible acceptance producer, execute available technical checks, collect fresh external evidence and cost projection, then use the existing deployment pipeline once all applicable gates pass. Preserve all 3D assets and quality, existing API contracts, data, IAM boundaries, spend caps and rollback protection. No new paid service, expanded IAM, production data deletion, or automatic waiver is included.

## File and execution plan

1. `.github/workflows/acceptance-production.yml` (new): main-only manual acceptance workflow, no cloud credentials, read-only repository access. Run reusable verification plus browser checks, dependency/asset provenance audits. Upload nonempty sanitized receipts and discovery-evidence only when every required check has genuine evidence. Bind to exact checkout SHA and candidate file hashes. Use pinned actions and explicit timeout.
2. `.github/workflows/verify.yml`: retain sanitized per-check logs/artifacts at the same SHA for the producer to reference. Preserve all current commands and failure behavior.
3. `scripts/ci/acceptance-production.mjs` (new): assemble and validate receipts, copy only an explicit evidence allowlist, reject stale/failed/mismatched/escaping evidence. Never manufacture success from file existence or copy old timestamps. External checks remain pending until real evidence exists; no implicit deferral from the user's release request.
4. `scripts/ci/acceptance-browser.mjs` and a dedicated browser-test configuration/package manifest only if the existing tooling cannot provide a reproducible runner: exercise current built UI, anatomy loading/selection/hide-muscles, simulations, learning/teaching and directory entry paths plus failure/retry. Real Google completion is separate from emulator auth. Use synthetic data and isolated local emulators; no production writes.
5. Focused acceptance tests: mismatched SHA, failed or missing checks, stale receipts, unsafe paths, absent external approvals, failed audit/browser checks and artifact completeness.
6. `docs/implementation/cicd-production-runbook.md`: document producer execution, actual evidence acquisition, failure recovery and full-product acceptance boundary. Record a new review with current evidence, not historical success.
7. Collect a cost worksheet from actual metering, retained resources, build/storage/egress and explicit traffic assumptions. Do not claim a total invoice cap. Unknown forecast stays blocked. Collect asset attribution/current license evidence independently of medical correctness.
8. When a trusted producer run succeeds at current main with all applicable acceptance and costs.json: set DISCOVERY_EVIDENCE_RUN_ID to that real run, rerun only the failed release jobs, verify immutable image/revisions, protected-route behavior and public web/API smoke, then publish the release through existing automation. No manual bypass deployment.

## Impact, trade-offs and rollback

Risk: medium CI changes, high production promotion; approval applies to the outlined producer and existing gated release, not broader permissions. Current web remains online while checks run. No data schema/model changes. New Actions work consumes runner time; cloud build is still behind the cost gate. Exact-SHA freshness can require re-running evidence after any candidate edit. Production credentials remain isolated from acceptance checks. Artifact upload must exclude raw credentials, provider responses and personal data.

Rollback of CI changes is a scoped revert; application rollback uses the existing recorded predecessor and runbook. No data rollback or removal of budget controls. Auth/restore checks involving real accounts or production data need their own safe execution evidence; the owner may need to complete interactive Google authentication. Medical acceptance cannot be invented by an agent.

## Validation and completion

Profiles: universal, TypeScript/Node, DevOps, infrastructure, security, web as applicable. Run targeted producer tests, workflow/source review, current full verification, fresh browser/audit/provenance checks and actual artifact readback. Verify missing/invalid acceptance blocks before cloud authentication. Final implementation review and exact-candidate production readback are required. No UI copy change is planned; if one becomes necessary, run Product Language Gate. No success handoff until checks pass. No unapproved deferrals, downgraded 3D, fake run IDs or modified gate thresholds.

This is a plan, not implemented CI or proof of release. Current readiness: BLOCKED. Token/cost usage unavailable. Memory candidates: None.
