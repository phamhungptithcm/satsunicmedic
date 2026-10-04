# HS-FIREBASE-1 — Firebase production migration

Approval: workspace owner answered “Cả web, đăng nhập và database Firestore” in the current conversation, following the explicit architecture choice question. This supersedes the VM/PostgreSQL deployment plan. Production deployment is already authorized; Singapore, production only, minimize cost, 650 USD/month ceiling, domain and AdSense deferred.

## Observed state and impact

Repository intelligence DEGRADED: CodeGraph/CocoIndex indexes are stale; bounded source reads and compiler/emulator tests are the evidence source. Existing Next web proxies Nest API; Nest relies on Prisma PostgreSQL transactions, relational joins, uniqueness and substring search. Auth already uses Firebase session cookies and server-side registry. No customer data was imported to the new VM. VM medic-production was verified TERMINATED; retained disk, IP, images and buckets can still incur charges. Previous private deployment applied empty-schema migrations but API health failed, and no public firewall was opened.

## Implementation

1. Replace active Prisma/PostgreSQL persistence with typed Firestore data access. Preserve route contracts, ownership, CSRF, optimistic revisions, independent publication review, expiry and license checks. Use Firestore transactions with reads before writes, deterministic unique-key documents, bounded queries, and parent counters where concurrent collection inserts require coordination. Do not emulate SQL with unbounded collection scans.
2. Firebase App Hosting serves the existing Next application; Firebase Authentication remains identity authority; Cloud Functions for Firebase gen2 serves the Nest API; Firestore regional database in asia-southeast1 stores application data. Deny direct browser Firestore access: private data and publication writes go through guarded API. Default Firebase URL initially. minInstances=0 and low maxInstances; budget alert is not a hard spending cap.
3. Preserve substring search explicitly using bounded indexed search projections, or document and validate a deliberate compatible alternative before publishing. No paid external search service. All draft medical data remains hidden. No production fixtures, fake reviewers or anatomy assets.
4. Add Firestore emulator integration tests for existing API behavior, concurrency, uniqueness, expiry, revocation, ownership and client-rule denial. Run typecheck, lint, unit/integration, build and dependency audit. Deploy rules/indexes and verify live service readiness independently of emulator results.
5. Keep old VM profile as superseded reference until new deployment is verified. Do not delete retained data/resources as part of the persistence rewrite. Record retained charges. Domain, AdSense, paid licenses and clinical content remain deferred.

Approved edit scope: apps/api, deployment-related apps/web configuration, tests, infra/firebase, scripts, package manifests/lock, docs, .env.example, Firebase configuration. Preserve other chats' viewer/pathophysiology/age-selection WIP. No public API removals, no weakening auth or review gates, no unrelated UI redesign.

Risk HIGH: persistence/identity/production. Rollback: preserve old source snapshots and stopped VM; do not dual-write. Before any real users are accepted on Firestore, verify all negative security flows. Full clinical product remains NOT_READY absent licensed assets and qualified content approval.
