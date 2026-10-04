# PROD-LOW15 execution review

Review decision: BLOCKED for complete CI/release setup; cost controls are configured on the existing live application. No claim that the new application candidate has been released. Scope: approved PROD-LOW15 excluding all item 7 model/asset work. No app/package/3D asset/cache changes in Git diff.

## Applied and read back

- Project-scoped USD 10 monthly alert: EXCLUDE_ALL_CREDITS; actual thresholds 50/90/100%, forecast threshold 100%. Existing notification recipients preserved.
- Cloud Run USD 3 and Cloud Run Functions USD 2 monthly spend caps created through Cloud Billing UI, both visibly Configured, project satsunicmedic only. They pause their services at threshold until manually lifted. Native caps do not cover every fee or guarantee a USD 15 total invoice. Console displayed USD 0.13 gross month-to-date at inspection; reporting is delayed and this is not final invoice evidence.
- Released old static external IPv4 medic-production; stopped VM retained with original 30 GB pd-standard disk and existing backups. No database/backup/image deletion. No active application source referenced the old address; Cloud DNS API disabled and custom domain previously deferred. External unregistered references cannot be exhaustively ruled out.
- Both Cloud Run services now have min 0/max 1 at service level, matching revision caps; CPU 1, RAM 512 MiB, concurrency 20. Read-only production smoke PASSED after the change.
- WIF provider github-production/github ACTIVE, constrained by numeric owner/repository, main ref and production subject. medic-deploy created without keys; Workload Identity User limited to the repository principal. Custom deployment role excludes deletion, IAM changes, direct document access and secrets. Registry read-only scoped to production and gcf-artifacts; source bucket read and create-only under cicd/.
- GitHub environment production allows only branch main. Three verified variables configured: WIF provider, deploy account and public Firebase Web SDK API key; values of keys were not logged.
- Source fixes use existing production/web registry consistently for build, deploy and release manifest validation. Cost gate before paid build requires current exact-SHA measured monthly costs/forecast, reserve below USD 11, and fresh live service resource readback. Unknown forecast, wrong scope/SHA, stale evidence or resource drift blocks. Models are unchanged.

## Checks and review cycles

Cycle 1 identified release manifest still referencing nonexistent medic/web registry, missing resource-array projection in gcloud formatter, service-level scaling drift, and test ESM declaration errors. Fixed all four; regression fixtures cover malformed evidence and service-level drift. Initial emulator run could not bind ports inside sandbox; rerun with approved local networking passed.

Cycle 2: 352 unit tests (38 files), 39 emulator integration tests, full production build, typecheck, application lint, CI-script lint, focused 35 tests and Git whitespace check passed. Live resource readback and read-only web/API smoke passed. No production auth login or deployment identity smoke claimed. Final review remains BLOCKED for incomplete IAM and acceptance. Approval validator reports READY required although top-level policy allows DEGRADED; no falsified index state or validator modification. Repository intelligence remained bounded source/provider evidence after index drift.

## Remaining findings

1. Resolved after explicit IAM v2 approval: medic-deploy can act as exactly medic-build, medic-web and medic-functions. Fresh provider readback confirms no default Compute delegation. API build migrated to medic-build using only buildConfig.serviceAccount field mask; operation completed, API ACTIVE, runtime identity unchanged, live smoke PASSED. Earlier rejection and cycle 2 describe the prior state. Full trusted CI identity validation remains open under finding 3.
2. Exact-candidate trusted acceptance artifact and actual measured remaining-month projection are absent; DISCOVERY_EVIDENCE_RUN_ID intentionally unset. Existing live Google/session, restore and medical/asset acceptance gaps remain. No gate bypass, fake acceptance or release tag.
3. IAM effectiveness under a real GitHub OIDC token, negative-token rejection and first cloud build remain NOT_TESTED. New custom role may reveal additional narrowly scoped provider requirements; do not broaden automatically.
4. Costs outside native spend caps (storage, bandwidth, builds, logs) and reporting latency can exceed the target. No global hard cap or automatic billing disable was configured. Native pause activation was NOT deliberately triggered; configured enforcement is provider/UI readback, not an outage test.

Detailed local evidence: .ai/local/production-low15 (budgets/scaling/WIF/variables readbacks, focused/unit/integration/build/lint/typecheck logs, live smoke). Runtime task: PROD-LOW15. Token usage and actual billed task cost unavailable. Memory candidates: None.

## IAM v2 follow-up review

Approved cloud-only scope: exact account delegation, scoped build permissions and API build identity migration. No application, UI, database, dependency or model changes. Profiles: universal, DevOps, infrastructure. Security review confirms account-level grants, no new keys, no default Compute delegation and no expanded secret/admin grants. Migration errors were checked through the long-running operation; source/runtime and scaling are checked separately. Rollback is documented in the approved delta plan. New source release stays fail-closed.

Evidence: .ai/local/production-iam-v2 contains sanitized operation, IAM, source/runtime, scaling and live smoke readbacks. Full release review remains BLOCKED by current candidate acceptance, cost projection and real OIDC/restore/auth evidence. Prior full source tests are historical evidence at 5a6b46d; this documentation/provider-only follow-up does not claim a fresh full test suite. Token usage and actual billed task cost unavailable. Memory candidates: None.

Provider post-check: original and copied source archives have identical MD5/CRC32C and size 88,889 bytes despite a new object generation. Revision api-00005-fiq is ACTIVE. Both services retain min 0/max 1, CPU 1, memory 512 MiB and concurrency 20. No new source deployment occurred.
