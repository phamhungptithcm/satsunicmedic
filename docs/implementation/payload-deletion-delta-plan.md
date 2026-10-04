# Delta plan: safe30-day account deletion

Status: proposed; no deletion endpoint, worker or migration is active.

The selected policy is approved: lock immediately, allow30days recovery, then delete personal data and retain minimal non-content audit. Source review identified a prerequisite beyond the original account screen/API plan: content-addressed chunks are shared, and Database.put commits chunks before their parent pointer. An unreferenced scan alone cannot safely authorize physical deletion while writers are active.

## Smallest verifiable option

Use an explicit maintenance barrier for payload garbage collection, preserving normal APIs outside the short maintenance window. Add one barrier document read at the start of every authoritative Database.transaction. All standalone payload writes must be routed through that transaction boundary. The collector atomically acquires the barrier; transactions that saw the previous generation conflict/retry and then fail closed with a retryable service-unavailable response. The collector scans current parent pointers, deletes only proven unreachable chunks, writes a checkpoint, and releases the barrier with a new generation. A crash retains the barrier until recovery verifies the checkpoint; it must never auto-expire while an old collector may still delete bytes.

This option adds one Firestore read per transaction and temporarily pauses transactional session/data requests during GC. That availability/cost trade-off is a material extension requiring owner approval before changing the shared persistence boundary.

## Files and steps

1. `apps/api/src/database.ts`: enforce barrier reads and route standalone payload writes through the same authoritative transaction path. Inventory every direct Firestore write/import; reject bypass paths in production ingestion. Preserve read-before-write rules and callback retries.
2. New `apps/api/src/payload-maintenance.ts`: exclusive generation/owner, bounded scan checkpoints, explicit operator resume, no blind TTL unlock. Prevent competing collectors and future pointer publication while deletion is in progress.
3. New `apps/api/src/account-deletion.ts`, config/domain/app registration: recent same-user identity, idempotent request, disabled user and incremented session generation; reject shared-scene access while owner disabled. Recovery requires new identity and pending state before deadline; never revive old sessions/shares.
4. Worker: atomically claim overdue jobs; batch private notes/lessons/scenes/attempts/reviews/shares/idempotency/session cleanup with checkpoints; retain anonymous distinct author/reviewer identities so independence cannot collapse; retain no raw email/UID/content in final receipt. Purge only under the maintenance barrier. Delete Firebase Auth last and reconcile missing/already-deleted states.
5. Web account/Login:30-day date and consequences, request confirmation, same-account reauth, recovery entry after rejected login, pending/failure states, cancellation safety. Keep capability off until worker and recovery procedure are configured.
6. Tests: writer paused before/after blob upload; collector races; transaction retry; shared vs orphan chunks; crash before/after each checkpoint; reauth/CSRF/IDOR; restoration at deadline; no recovery after purge claim; cross-user data preserved; deleted Firebase user; backup tombstone replay before restored service becomes public.

No existing private data migration or deletion is executed during implementation. Test with isolated synthetic emulator data first. Production activation needs scheduler/IAM, monitored retries and an approved backup-expiry/recovery policy. Rollback disables new requests and workers, preserves jobs/barrier state, and requires checking no collector is active before restoring old writers.

## Alternative

Per-payload leases/reference registries avoid a global maintenance pause but require a more extensive persistence protocol and safe treatment/backfill of existing pointers. Do not silently replace the selected account policy with either approach. Approve this delta explicitly before the shared-storage change; other completed discovery/export work can ship independently.
