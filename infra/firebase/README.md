# HumanScope Firebase deployment

Approved migration profile: Firebase App Hosting web, Firebase Authentication,
Firestore (asia-southeast1) and Firebase Functions gen2 Nest API. The old VM and
Prisma migration sources are historical rollback references, not active runtime.
No production fixtures, clinical publication or paid anatomy assets are included.

## Build and package

Use Node 24 and the pinned pnpm workspace lockfile. Run `pnpm install
--frozen-lockfile`, `pnpm --filter @hs/contracts build`, `pnpm --filter @hs/api
build`, then `node infra/firebase/package-functions.mjs`. The script copies only
compiled API and contracts into `.ai/local/firebase-functions`, including root
security overrides and public runtime configuration. Install dependencies inside
that isolated artifact with `npm install --omit=dev --ignore-scripts`; inspect its
lockfile/audit before deployment. Never add credentials to the artifact.

Use Firebase CLI 15.32.1 and explicit targets:

```
firebase deploy --project satsunicmedic --only firestore:rules,firestore:indexes
firebase deploy --project satsunicmedic --only functions:medic
```

Do not use `--force` or delete retained infrastructure. Index build completion and
live API readiness must be verified separately from emulator success. Functions
uses the dedicated medic-functions service account, Node 24, Singapore, 512 MiB,
CPU 1, minInstances 0, maxInstances 1, concurrency 20 and timeout 60 seconds.
The endpoint is publicly invokable; Nest session/CSRF/role/ownership checks remain
mandatory on protected routes. Functions pre-parses JSON, so its wrapper enforces
the existing 256 KiB request limit before forwarding to Nest. Runtime uses
MEDIC_FIREBASE_PROJECT_ID (or GCLOUD_PROJECT) to avoid reserved Firebase env names.

Build only the web image with `infra/firebase/cloudbuild-web.yaml`, supplying the
verified public Firebase SDK key and a new immutable release tag. API_ORIGIN is
`https://asia-southeast1-satsunicmedic.cloudfunctions.net/api`. Deploy the resolved
image digest through App Hosting backend `medic`; do not overwrite a published
release tag. App Hosting runConfig: cpu 1, memoryMib 512, minInstances 0,
maxInstances 1, concurrency 20. Set APP_ORIGIN to
`https://medic--satsunicmedic.asia-southeast1.hosted.app`; ads remain disabled.

## Persistence and operational bounds

UUID public IDs are preserved. Internal UID, slug, review and idempotency unique
records use deterministic SHA-256 composite keys. Firestore transactions read
all authority records before writes. Scene creation increments a parent counter
atomically and admits at most 100 scenes per lesson. Session generation and a
server-side revocation cutoff block older cookies and old ID-token sign-ins even
while Firebase revocation is propagating. A revoked identical cookie is never
revived. Direct client Firestore reads and writes are denied for every identity.

Article publication/withdrawal atomically updates `articleSearch`. Anatomy writes
must use Database.put('anatomy', row), which atomically maintains `anatomySystems`
and computes search grams. Direct admin imports that bypass the repository must
maintain both projections or must not be published. System counts use aggregate
queries over at most 100 catalog systems and respect current review expiry;
there is no 1024-structure cap on counts. Old catalog entries may remain after
moves/removals and zero counts are omitted.

Substring search indexes unigrams, bigrams and trigrams, then checks complete
case-insensitive substrings in UUID/document-ID order. Empty queries work. Each
search reads at most 1024 candidate documents in pages of 128. If that budget is
exhausted before proving completion or finding the requested matches, the API
returns HTTP 503 `SEARCH_CAPACITY_EXCEEDED`; it never returns silently truncated
success. A full final page conservatively returns 503. Facility/quiz/current-asset
candidate scans use the same explicit safety budget. Reassess indexed query
selectivity before datasets grow beyond that budget; no paid search is assumed.

Bodies, manifests, quizzes and scene JSON use content-addressed immutable byte
chunks (400,000 bytes) with SHA-256/count/byte-length verified reconstruction.
Operational offline ingestion limit is 16 MiB per JSON payload, supporting the
10,000-structure manifest and >1 MiB article fixtures without changing public
schemas. Contract strings may be theoretically unbounded: larger offline payloads
are rejected explicitly. HTTP admission remains 256 KiB. Failed transactions may
leave unreachable payload chunks; no destructive cleanup is automatic. A future
retention job needs a separately reviewed reachability policy. Do not enable TTL
on idempotency/attempt documents without reviewing replay guarantees.

## Verification and rollback

`firebase emulators:exec --only auth,firestore --project demo-humanscope --config
infra/firebase/firebase.json 'pnpm test:integration'` uses only loopback Auth 9199
and Firestore 8189. Tests reject a different Firestore host and install deny-all
rules in the emulator. Production forbids emulator hosts and demo project IDs.
Unit/integration/build evidence does not prove IAM, deployed indexes, App Hosting
cookies/proxying, clinical validity or live OAuth. Verify those independently.
Rollback to a previously verified Firebase image/function revision; preserve the
Firestore data. Do not point old PostgreSQL code at Firestore or silently dual-write.

## Automatic production release

See [CI/CD runbook](../../docs/implementation/cicd-production-runbook.md).
`release-production.yml` invokes verification on main pushes, requires current
candidate-bound discovery acceptance, builds a commit-bound image and promotes
its digest, deploys Functions before App Hosting, checks traffic and smoke, and
only then publishes a release tag and notes. OIDC/environment setup and a trusted
acceptance artifact are required. Missing setup fails before production mutation.

## EDU-DIR private learning and classrooms

Deploy additive indexes for `classes`, `classMembers`, `teachingAssignments`,
and `teachingSubmissions` before enabling classroom export. Each class is capped
at 100 lifetime members and 100 assignments; each account at 50 owned classes
and 50 memberships. These caps include historical/revoked records until an
operator-reviewed retention policy exists. No public class discovery or email.
Invites are 24-hour random codes stored as hashes; issuing another revokes the
old code. Membership revocation is checked on every protected access.

Assignment content is copied at the exact lesson revision and excludes speaker
notes. Quiz references retain their revision and must still be available; class
completion reflections are not quiz scores or clinical qualification.

Personal export includes owned classes/assignments, own membership/submission
records, saved learning position and full authored lesson blocks. New records
are private under deny-all Firestore client rules. Account deletion remains
unavailable: no automatic destructive retention or TTL is introduced. **Do not
release new classroom persistence until retention/deletion handling and the live
authorization/export matrix are approved and verified.** Roll back app code
without deleting new collections; existing notes, scenes and lessons remain.

Canonical teaching snapshots bind catalog version/hash and validate all mapped
structures and cuts. Regenerate with `node scripts/free-anatomy/teaching-registry.mjs`
after converting a new atlas. Current atlas remains unreviewed; preserving a
view does not publish or clinically validate the underlying content.
