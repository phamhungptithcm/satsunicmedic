# PROD-RISK-01 — explicit owner risk acceptance for release

Status: APPROVED by repository owner, explicit “approved” reply to PROD-RISK-01 on 2026-10-04. Owner deployment authorization and acceptance of the previously disclosed limitations are recorded from the 2026-10-04 request “mình chấp nhận hay release”. This is genuine risk acceptance, not evidence that missing tests passed. A reviewed-plan decision is required for the following change to the release admission contract.

Baseline: 5e90ef13eabbe65378a33811cf7a8d0dc06136b3. Repository intelligence remains DEGRADED; current producer, deployment preflight and discovery validator inspected directly.

## Verified inconsistency

The discovery validator already permits explicit owner deferral of liveGoogle, restore and physicalDevices. The acceptance producer requires PASSED for every external check and always emits an empty deferred list, so it cannot represent that supported decision. The full-product producer additionally requires medicalReview, anatomyCorrectness and fullProduct. Their absence must remain visible and must never be relabeled PASSED.

## Proposed release contract

Publish the complete implemented application as an explicitly unvalidated educational release, preserving the existing in-product statements that medical content is unreviewed and incomplete. No claim of clinical validation or complete anatomical coverage. Preserve every 3D asset and all feature/auth/privacy boundaries.

Permit explicit owner-approved deferral only for liveGoogle, restore, physicalDevices, medicalReview, anatomyCorrectness and fullProduct. The record must identify this exact candidate, check, owner, task reference, date, reason, known consequence and follow-up. Missing/failed technical checks, asset rights/provenance, security/dependency findings and measured-budget evidence remain non-deferrable. Real Google and restore uncertainty cannot be described as successful testing; existing authentication and backup protections remain intact.

## Minimal changes

1. scripts/ci/acceptance-production.mjs: validate an allowlisted set of exact-candidate owner deferrals; retain genuine PASSED receipts separately; emit the supported deferred list and a sanitized owner decision artifact. Reject missing authority, unknown checks, expired/mismatched decisions and all attempts to waive required technical/license/cost checks.
2. scripts/discovery-release-check.ts and scripts/ci/deploy-production.mjs: validate the same complete-product decision contract, including each permitted deferral and its retained attachment. Preserve source hashes, trusted successful exact-SHA workflow origin, credential boundaries and rollback. No manual deployment bypass.
3. tests/production-acceptance.test.ts and relevant release checks: prove unauthorized/missing/stale deferrals fail, non-deferrable checks cannot be waived, accepted items stay DEFERRED and exact-candidate scope is enforced.
4. CI/runbook/release notes: carry and show the accepted limitations in the evidence and published release notes. No new infrastructure, paid service, IAM, schema or 3D changes.
5. Independently finish asset/provenance verification and measured current cost projection; these are not resolved by owner risk acceptance. Run technical/browser CI on the resulting commit, assemble genuine evidence, set the successful evidence run ID and rerun the existing production deployment. Verify live revisions, public pages, protected-route responses and service limits.

## Risk and validation

High release-policy impact, small code scope. This changes admission semantics and must not be hidden as a UI fix. Regression review must distinguish DEFERRED from PASSED and preserve every hard gate. Existing under-USD15 target and safety reserve remain; no guaranteed invoice cap is asserted. Rollback is the existing recorded predecessor path, with no data deletion or migration.

No production deployment or protected code modification has been performed under this delta plan. No missing test result or medical approval is manufactured.
