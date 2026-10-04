# Whole-product production release preflight — 2026-10-01

Owner request: “Release toàm bộ lên production”. Deployment authorization is recorded; no repeat approval is needed for the same release scope after its required gates pass.

**Decision: BLOCKED / NOT_READY. No cloud deployment or publication was performed.**

Current repository intelligence check returned READY after refresh. `node scripts/release-check.mjs` returned exit 2 with five blockers:

1. No evidence of an anatomy asset verified for rights and correctness.
2. No qualified medical reviewer recorded.
3. Actual-account sign-in/session end-to-end evidence is not PASSED.
4. Backup restore evidence is not PASSED.
5. Whole-product/content acceptance is not READY.

These are the current release script's results, not claims of a new live audit. Its `LIVE_FOUNDATION` value comes from stored evidence and was not independently refreshed against production in this preflight. Existing production has not been changed by this session.

The two Sunnybrook samples remain rejected with `UNVERIFIED_CROSS_FRAME_OF_REFERENCE`; no cine viewer integration or source publication may be inferred from this release request. See [source gate handoff](medical-cine-status.md).

## Coordination

Contacted both active UI/UX and navbar/footer sessions under the owner's prior cross-session authorization. UI/UX response is recorded in `.ai/local/coordination/ui-ux-cleanup-release-status-20261001.md`: it is not deploying; release ownership remains here. Its local checks are scoped evidence and do not certify medical/live-account/production readiness. Shared UI work was still receiving final corrections during the preflight; the navbar/footer task was also active. No competing build, shared-file overwrite, server stop or deployment was initiated here. Do not mix old coordination-note digests with newer `candidate.json` hashes.

## Required completion before whole-product release

- Medical/content owner supplies asset rights/correctness and qualified review evidence bound to the exact published content hashes; rejected cine remains unavailable unless its independent source gate passes.
- Release/QA verifies actual-account sign-in and session behavior using an authorized test account, plus an isolated backup restoration and rollback verification without overwriting production data.
- UI and navbar owners finish their fresh review and hand off exact source hashes; freeze a single full working-tree candidate preserving all WIP, then run the required build/security/integration/browser checks against that candidate.
- Re-run the release script and final implementation review; deploy only within the passing scope, then verify the actual live revision and smoke behavior. A partial foundation/UI update must not be reported as the requested whole-product release.

## Completion evidence

`.ai/local/med4d-production-release/preflight.json` records timestamp, exact evidence-file hashes, command, exit code, blockers and no-cloud-mutation status. `.ai/local/med4d-production-release/final-review.json` records the blocked review; no new production success is claimed. No application edits were made for this preflight.

Review cycle 1: prerequisite gate FAILED; deployment/build/live acceptance NOT_RUN because no complete releasable candidate was established. The repository's final-review rule prevents a successful release handoff while these required checks remain unresolved. The preflight is complete; the requested production release is incomplete.

Runtime ledger CLI unavailable on PATH in this workflow; records above are manual evidence, not runtime-generated receipts. Token usage and billed cost: Unavailable. Memory candidates: None.
