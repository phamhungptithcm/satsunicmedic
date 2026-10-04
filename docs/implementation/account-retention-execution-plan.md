# Account retention implementation boundary

User approved 30-day recovery on 2026-10-01 and prioritized local work before provider setup.

Implement additive deletionJobs and disabled user/session generation transitions. Recent same-user Google identity and CSRF are mandatory. Request locks sessions and shared scenes immediately; recovery before the deadline uses fresh identity, not a disabled session. Recovery never restores old sessions or grants. The purge worker claims an overdue job transactionally, deletes private records in bounded batches, anonymizes retained authorship/audit links, removes unreferenced content-addressed chunks only after a complete bounded reference scan, then deletes Firebase Auth and the internal UID link. Retry checkpoints preserve candidate chunk hashes. Failed or oversized cleanup remains PURGING, never COMPLETE.

Files: apps/api/src/account-deletion.ts, config.ts, identity.ts, learning.ts, app.ts; account UI and Login recovery; scripts/run-account-deletions.ts; unit/emulator/browser tests. No production purge is executed. The local runner refuses any non-demo project and missing loopback emulators. Production enablement requires a separately configured scheduled worker, backup/tombstone recovery policy and operational approval; ACCOUNT_DELETION_ENABLED defaults false. The UI must not promise an enabled deletion service before those prerequisites exist.

Preserve auth checks, original author/reviewer separation and session expiry. Do not delete published medical articles or alter their reviewed body/hash. Retained authorship links become anonymous; audit contains action/time only after cleanup. Source images and third-party rights are outside personal export. Backups expire under provider policy; no immediate erasure of backup copies is claimed.

Validation: two owners, wrong identity, CSRF, concurrent request/recovery/purge, boundary at30days, revoked cookie/share, mid-worker failure/retry, orphan vs shared chunk, missing source documents, idempotent repeated cleanup. Expected impact is private-data lifecycle; risk high. This is the concrete implementation of the user's selected retention policy, not authority to execute production deletion.

## Source-review blocker found before activation

Database.put writes immutable payload chunks before committing their parent pointer, and payloads can be shared across users. A scan-then-delete orphan collector can race an in-flight writer and remove newly referenced bytes. Do not ship that collector. A reference/lease protocol with migration for existing pointers, or a verified maintenance/drain procedure, is required before a purge worker may claim physical deletion. The temporary unregistered implementation was removed during review; no deletion endpoint or worker is shipped and the existing disabled UI remains truthful. This is a separate data-lifecycle delta, not a provider-configuration checkbox. No private data was deleted.
