# EDU-DIR-01 v1 — học tập, giảng dạy và cơ sở y tế end to end

Date: 2026-10-03. Status: APPROVED / local implementation verified; production acceptance open. Approval: learning-teaching-directory-approval.md. Current evidence: learning-teaching-directory-review.md. Research: docs/research/learning-teaching-directory-2026-10-03.md. Existing SIM-01 approval remains valid for anatomy work; this plan adds shared contracts, account-owned teaching data, optional class membership and directory schema/query changes. Existing foundation approvals are reference context, not a fabricated approval of these new schema/permission decisions.

## Repository intelligence brief

HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50; extensive untracked WIP preserved. Initial gate DEGRADED (stale, CocoIndex health failed); one refresh completed with 950 listed files, no indexing errors. CodeGraph queried FacilityController and callers; CocoIndex queried teaching/facilities and returned limited related atlas docs, so exact API/contracts/UI conclusions verified against source. Context repository-map/build-test files are placeholders, not architecture facts. No current live Firebase or deployment inspection in this research pass.

Stack verified: React19/Next16, TypeScript, NestJS, Firebase identity and Firestore; current Prisma remnants are not grounds to introduce SQL migrations. Direct file inspection: facilities.ts, learning.ts, private.ts, domain.ts, contracts/index.ts, scene-history.ts, explorer.tsx PersonalPanel, learning page, facility page. Integration tests already cover facility expiry and ownership/scene sharing. No claim of new test execution in this plan-only phase.

Risk HIGH for account/class authorization; MEDIUM for directory/data semantics and scene schema compatibility. Retain SessionGuard, CsrfGuard, owner checks, publication/expiry and asset license checks. No paid provider, cloud provisioning, production mutations, new framework or dependency required by default.

## Outcomes / definition of complete

- Learner can select goal and level, open a sourced lesson, interact with the same atlas, answer and receive feedback, resume and review; published server attempts remain distinct from anonymous draft practice.
- Instructor can create/edit/reorder a bounded lesson, save/reopen canonical scenes, preview/present, assign a fixed revision and inspect only authorized results.
- Visitor can find a facility branch by current province, specialty and a sourced disease relation; see why matched, evidence and freshness; reach an official contact channel.
- Operations can identify stale content/branches, withdraw them, diagnose failed jobs and roll back code/data versions. Completion includes these failure cases, not just happy-path screenshots.

## Implementation order

### A. Shared taxonomy and usable directory

1. Add versioned province data with official codes/effective dates/aliases; apply 2026 changes verified from official documents. Reject ambiguous legacy mapping rather than guessing. Add specialty IDs and curated many-to-many disease-specialty relations, each with source/scope/status. Disease relation is an educational association; a facility match must use separately verified branch service evidence.
2. Extend facilities additively: display-safe province ID/name, optional contact/booking URL, structured service evidence, classification/provider source, provenance/check dates. Preserve legacy fields during reader migration. Null means unavailable; never default false/zero for unknown BHYT/hours/availability.
3. Search returns typed items, cursor, evidence and freshness; add normalized name search, validated province/specialty/disease filters. Prefer denormalized service IDs to multiple Firestore array-contains combinations; separate candidate lookup from branch verification with bounded reads. Require indexes before enabling compound search. Cursor bound to query/version; published/expiry checked every page and detail request.
4. `/co-so-y-te`: URL-persisted filters, named compact controls, pending/cancel/retry, paginated list, reset, missing data indication. `/co-so-y-te/[id]`: branch facts, source per claim, official links and correction report. Existing generic content report endpoint should be reused only if it supports this object type/authorization correctly.
5. Data intake dry-run: official-source registry → validated draft normalized branches → duplicate and stale review → bounded idempotent upsert by approved operator. Do not mark PUBLISHED automatically. No crawler fetching arbitrary user URLs; allowlisted hosts, redirect/IP protections if fetching is introduced. Start with records actually supported by sources, display coverage gaps across all provinces.

### B. Learning workspace

1. Replace quiz-only landing with topic/objective/level entry, continue learning, due reviews and saved notes. Use existing API for published quizzes/progress/reviews; maintain errors vs empty vs signed-out states.
2. Define `LearningUnit` metadata (stable ID/revision/objectives/topic/audience/source/representation/quiz references), preserving existing disease IDs and content status. Every button must open available content; missing specialist or simulation depth remains visible.
3. Resume/save only whitelisted scene/unit position. Anonymous session works without account; explicitly explain where local data lives. Signed-in writes require owner scope and version. No silent syncing of anonymous sensitive notes into another account. Quiz draft answers are not rewritten into published attempts.
4. Review: per-question explanation, retry and existing spaced-review queue. Preserve immutable attempts and idempotent retries; old quiz revisions do not masquerade as current results. No “mastered/qualified” label inferred from score alone.

### C. Teaching workspace

1. Add `/giang-day` workspace with private lesson list, create/edit title/objectives/description, ordered blocks (atlas scene, existing topic step, text prompt, published quiz reference). Bound blocks/text size; deterministic order, no unbounded DB loops.
2. Introduce versioned canonical body snapshot alongside v1 rather than coercion. Bind catalog/asset version and manifest hash; validate IDs, numeric bounds, clipping, opacity, camera and selection. Resolve eligible assets server-side. Old snapshots remain readable; missing/withdrawn asset shows recoverable unavailable state.
3. Save with optimistic revision and stable idempotency keys; atomic ordering/scene changes, conflict UI keeps draft. Preview as learner and projector mode hide private speaker notes/answers. Export initially printable lesson outline with source references; no bulk asset export unless license and server authorization permit.
4. Reuse sanitized expiring share for eligible immutable public scene snapshots. Full authored lesson/class sharing requires distinct authorization, not broadening public share payload accidentally.
5. Class assignment slice: classes + owner-controlled membership/invite expiry + fixed lesson revision + assignment deadline + submission. User mode switch does not grant instructor access. Instructor sees assigned learning results only, never private notes/unrelated study history; students cannot see peers' results. Membership revoke checked on every request. No email sending, public discovery of classes, gradebook claims or institutional integration in V1.

### D. Connect and validate

Topic → canonical anatomy → lesson/quiz → review; instructor reuses same unit; disease → related specialties → province-filtered branches → official contact. Back navigation preserves context. Source display accompanies medical claims. Existing three motion lessons remain three until additional actual simulations are independently implemented; this feature work does not conceal the remaining 24.

## File-level impact

| Module/files | Intended change |
|---|---|
| `packages/contracts/src/index.ts` + new learning/directory/teaching modules | Additive validated DTOs, scene discriminator, revisions/cursors and role-scoped payloads |
| `packages/api-client/src/index.ts` | Typed fetch/mutations, cancellation, safe errors |
| `apps/api/src/domain.ts`, `database.ts` | Add collections/types and necessary timestamp decoding; preserve existing documents |
| `apps/api/src/facilities.ts` | Query/details, cursor and evidence validation |
| `apps/api/src/private.ts`, `learning.ts` + new `teaching.ts`, `app.ts` | Lesson operations/ordering, resume, classes/assignment with current guards |
| `apps/api/src/account-export.ts` / account retention integration | Include new private records or explicitly hold release until export/deletion semantics cover them |
| `apps/api/src/openapi.ts` | Update route source inventory; regenerate docs, never hand-edit output |
| `apps/web/src/app/hoc-tap/**`, new `/giang-day/**` | Learning hub, editor, presentation, assignment/results routes |
| `apps/web/src/app/co-so-y-te/**` | Search and branch detail routes |
| `apps/web/src/components/` learning/teaching/facilities and disease entry | Compact responsive components, context links, states and accessible names |
| `apps/web/src/lib/` taxonomy/unit/directory helpers | Pure normalization, version lookup, explicit relations |
| `packages/anatomy-viewer/src/` snapshot adapter and existing FullBodyAnatomy | Capture/restore canonical state through validated props/events, renderer unchanged |
| `infra/firebase/firestore.indexes.json` | Only query-required additive indexes, local validation; no automatic production deployment |
| `scripts/directory/` + `docs/data/` | Source registry, dry-run import/report, versioned provenance; no unattended public publication |
| `tests/` integration/unit and browser harness | Matrix below, fixtures only in local tests |

## Data and compatibility decisions

- Bounded defaults: 20 results/page; 100 blocks/scenes per lesson consistent with existing scene cap; trim/limit user text. Larger future needs require measured revision, not unbounded reads.
- Server assigns owner/timestamps/IDs; client cannot choose role, score, publication status or verified badge.
- Separate mutable private drafts from immutable assigned revisions. New class collection never implies org-wide permissions.
- Additive schema rollout: contracts/backend before frontend; old client behavior retained; backfill dry-run reports ambiguous area codes and leaves them unresolved. No destructive renames or deletes.
- Data-export and retention coverage is a release prerequisite for any new private collection. Avoid shipping a teacher feature whose student data cannot be exported or removed under existing account policy.
- No fees, advertised quality ranking, confirmed booking status, real-time availability or private health intake. Official-link opening is not an appointment booking.

## E2E acceptance matrix

| Scenario | Required evidence |
|---|---|
| Anonymous learner | Select level/topic, load real model, answer local practice, resume without false server save |
| Signed-in learner | Submit published quiz once under retries, see explanation/history/review; account switch clears private state |
| Revision change | Old attempt immutable, new quiz version handled explicitly; withdrawn content not served |
| Teacher round-trip | Hidden muscle, camera, opacity, isolate and all cuts survive save/reload; no missing fields |
| Editor conflict | Two tabs edit: second receives conflict and keeps draft; retry does not duplicate scenes |
| Projector | Learner view excludes answers and speaker notes from rendered DOM/payload as appropriate |
| Class access | Owner/student/outsider/revoked member matrix; assignment freezes revision; result isolation verified |
| Directory match | Province/specialty/disease intersects verified branch services, not hospital-wide assumptions |
| Province migration | Legacy alias and current effective date correct; unknown mapping stays unavailable |
| Search pagination | Stable cursors, duplicate-free continuation, filter reset, network cancel, failed next page preserves results |
| Source withdrawal | Expired/withdrawn branch/claim disappears from list and detail; no cache bypass |
| Empty/error | No-data != no facility exists; outage != zero; retry works |
| Device/accessibility | 320/390/768/1440, keyboard/focus, zoom, reduced motion; physical checks labelled separately |
| Operations | Query read budget, new indexes, rollback, source freshness queue and private export/retention evidence |

## Rollout and completion evidence

Implement A → B → C1–4 → C5 → D in reviewable increments after delta approval; avoid launching classroom data flows before permissions/export tests pass. Local emulator and browser fixtures first; source-backed draft dataset separately reviewed; deployment remains its own explicit action on a frozen candidate. Each increment gets product-content inventory with eight principles, review → fix → verify → fresh review, hashes and exact test evidence. No fabricated successful live account, reviewer approval or all-province coverage.

## Approval requested

Approve EDU-DIR-01 v1: additive contracts/Firestore-backed teaching and directory changes, UI and source-backed draft intake, local/emulator/browser tests, and release preparation. No production data mutation/deploy, paid services, unsolicited email or weakened publication controls. This is a material delta from the recent anatomy-only SIM-01 scope, particularly classroom access and new private collections. Do not implement these protected changes before explicit reviewed-plan approval.

Research/plan completion: completed. Implementation/tests for this new plan: NOT_RUN. Overall production readiness: NOT_READY. Usage/cost: Unavailable. Memory candidates: None.
