# Private community intake — local implementation boundary

The user approved the proposed MVP and requested locally controllable work first. This slice implements **personal text intake and assigned review APIs**, not the whole community MVP. No provider, patient data, real reviewer identity or production deployment was used.

## Activation

`COMMUNITY_INTAKE_ENABLED=false` by default. With the flag off, creation, revision, submission, assignment and decisions are denied. Existing owners may still read, withdraw and revoke coauthor consent. Publication always returns `COMMUNITY_PUBLICATION_DISABLED`; there is intentionally no environment switch to enable it yet. Organization drafts fail with `ORGANIZATION_WORKSPACE_UNAVAILABLE` rather than falling back to personal permissions.

Do not open intake to real users until the remaining privacy/export/retention, operator and workspace requirements below have been completed. Verification rows in tests are synthetic fixtures only. Never seed verified credentials into production based on a user-provided role label.

## Implemented API

All routes use the existing session guard; mutations also require CSRF. IDs are UUIDs, request bodies are strict, and owner identity comes from the session.

- `GET /api/v1/me/contributions`: owner-scoped cursor list, default20/max50; owner rechecked on anchors.
- `POST /api/v1/contributions`: personal draft, `Idempotency-Key` required. Same-key concurrent retries resolve to one record; changed body returns409.
- `GET /api/v1/contributions/:id`: owner, named invited coauthor (to inspect before consent), or current assigned/verified reviewer; other users get404. Includes current review feedback for authorized readers.
- `POST /api/v1/contributions/:id/revisions`: If-Match, immutable snapshot, new hash/revision, invalidates prior approval. Up to100 version increments; published/withdrawn/in-review edits denied.
- `POST /api/v1/contributions/:id/consent`: explicit same-snapshot coauthor consent. Revocation moves submitted/reviewed content back to changes requested.
- `POST /api/v1/contributions/:id/submit`: If-Match, all coauthor consent, unchanged article base, snapshot hash. A rejected reviewed revision requires a new revision before resubmission.
- `POST /api/v1/contributions/:id/withdraw-submission`: owner, If-Match. Withdrawal does not physically delete history.
- `POST /api/v1/editor/contributions/:id/assign`: PUBLISHER, If-Match, verified reviewer in exact specialty/org scope, explicit independent editor assessment.
- `POST /api/v1/review-assignments/:revisionId/decisions`: assigned reviewer, current verification/consent/hash/version, future review deadline at most366days. One immutable decision per snapshot.
- `POST /api/v1/editor/contributions/:id/publish`: PUBLISHER authentication then always503; no article/search/public pointer mutation.

Create has idempotent replay. Other mutations use compare-and-swap and return409 for stale retries; clients must reload current state after an uncertain response. They must not blindly repeat a state-changing operation with a fresh revision.

## Persistence and operational limits

Additive collections: contributions, contributionRevisions, contributionConsents, contributionAssignments, contributionDecisions, contributorVerifications. Bounded inline text snapshots avoid shared chunk deletion for those records; existing idempotency receipts still use the repository's payload mechanism. Firestore client access remains deny-by-default. Draft maps and decision reasons have indexing exemptions. Owner equality plus document-ID pagination uses existing automatic indexes; deploy configuration changes before enabling a pilot.

At most50 contribution records per owner, including withdrawn entries. This is a conservative pilot cap, not an advertised paid entitlement. Body has at most20000 text characters and20 HTTPS sources. URLs are stored, never fetched server-side. Intake declares no patient data but **does not automatically anonymize or guarantee absence of PHI**. Logs/audits contain actor/action/object/time, not body or review reason. Existing request rate limiting remains enabled.

Verification storage has no user-write endpoint. A future authenticated operator workflow must verify actual scope, independent verifier, expiry and revocation; setting a self-declared title or global ADMIN role does not make a reviewer valid.

## Still required before the community MVP is complete

Organization membership/invitations and verification administration, reviewer/editor inboxes, the web workspace and browser/screen-reader acceptance, accepted public rights terms, safe article promotion/CAS/attribution, and public withdrawal/projection are not implemented by this slice. Export and account deletion must incorporate these new private records before real intake opens. Existing export remains explicitly scoped to profile/notes/lessons/scenes/learning records. No community data is included in its current file.

Rollback: disable intake; preserve drafts, reviews and audit. This flag does not delete records or revoke global roles. Publication remains disabled. Do not delete collections as rollback.

## Evidence

`tests/community-policy.test.ts`:25 cases covering hash binding, privilege injection, independent review, expiry, consent, terms and public-base conflicts. `tests/community.integration.test.ts`: synthetic Firebase tests for default-off/closed-publication, 401/403/404, cross-user access, concurrent idempotency/submission, consent revocation, full private review/revise flow, reviewer verification revocation, pagination and immutable audit/snapshots. Latest run results and candidate boundaries are recorded in `../implementation/readiness-completion-report.md`; passing these tests is not real reviewer or public medical approval.
