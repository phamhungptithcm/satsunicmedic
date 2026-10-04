# EDU-DIR-01 — implementation review, 2026-10-03

Decision: **BLOCKED for final acceptance / NOT_READY for production**. Approved local increment implemented. This report is not a claim that every disease, anatomical structure or facility is covered.

## Scope delivered

- Learning: searchable topic entry, general/medical/specialist levels, account-owned saved topic/level/step, private note editing and quiz revision links. Existing 27 draft topics remain subject to publication controls.
- Teaching: private bounded lesson editor with objectives, ordered text/topic/quiz/atlas blocks, revisions and retry keys; canonical atlas capture schema v2 validates catalog hash and complete scene state. Server presentation strips speaker notes. Legacy v1 scenes remain preserved, not silently converted.
- Classes: owner/member checks, hashed expiring replaceable invite, fixed assignment revision, own completion/reflection submission, owner-only results, revocation and account export. This is completion/reflection tracking, not a quiz gradebook.
- Directory: URL filters by name/province/specialty/disease, branch detail, claim evidence/freshness, retry and continuation. Reads capped at 256 candidates/request; empty page with continuation is supported. Old ambiguous province aliases are rejected.
- Intake: two Bạch Mai branches validated as DRAFT; zero branch-service claims approved for publication. Eight disease-specialty educational relations have sources; 19 of 27 topics lack mappings. No live import, publication or nationwide coverage claim.

## Current verification

| Check | Result | Evidence under .ai/local/edu-dir-01 |
|---|---|---|
| Unit suite | 332/332, 35 files | edu-dir-all-tests.log |
| Firebase Emulator integration | 39/39, 2 files | edu-dir-integration.log |
| TypeScript | Passed | edu-dir-typecheck.log |
| ESLint | Passed | edu-dir-lint.log |
| Production build | Passed | edu-dir-build.log |
| Intake dry run | 2 drafts, 0 services | edu-dir-facility-drafts.json |

Local browser verification used the actual UI/API and synthetic Emulator identities: search and level navigation; saved-position resume; author/save/present with private notes excluded; class creation and fixed assignment; directory combined filters/detail; no-results recovery. Learning at 320px and branch detail at 390px had no horizontal overflow; desktop screenshot saved. Multi-user permissions were exercised by API integration, not a multi-user browser run. Full camera/cut persistence has schema/catalog tests, not complete visual browser coverage. Physical devices, screen reader, text scaling, final keyboard traversal and latest quiz-picker browser flow are NOT TESTED. The final browser reopening encountered connection refused after build/server restart; earlier screenshot evidence is retained, not represented as a fresh successful reopen.

## Review cycles

1. Contract/security review: tightened canonical snapshot validation and registry binding; retained auth/CSRF/ownership and optimistic revisions; verified assignment is immutable and presentation excludes private notes. Added bounded payloads, counts and export coverage. Integration suite verifies outsider/revoked access and idempotent retries.
2. UX/performance review: fixed mounting multiple class atlas viewers; lesson list returns summaries rather than all blocks; quiz references include exact revision; stale reference does not silently open latest; unsent reflection and dirty lesson changes are guarded. Regenerated contracts/OpenAPI; typecheck, lint, integration and build rerun.
3. Final review: 332 tests pass including exact renderer-catalog hash binding. Source review rechecked class access guards, transaction paths, directory current publication checks and bounded continuation. No additional blocking code defect identified within executed checks. Overall acceptance remains BLOCKED by the gaps below; Product Language Gate remains BLOCKED by incomplete accessibility/state evidence.

## Release blockers and remaining work

- Owner retention/deletion policy for classroom membership/submissions pending; no deletion/TTL policy invented or deployed. Export is implemented. New class data must not be released until deletion lifecycle is implemented and verified against the agreed policy.
- Medical publication/review and facility service evidence remain incomplete. Draft atlas and topics are not certified clinical content. Expand and review source coverage before claiming comprehensive education or directory coverage.
- Learning-unit metadata and due-review dashboard, comprehensive assignment quiz gradebook, facility correction workflow and operator idempotent intake are not fully delivered in this increment. Existing APIs/content are reused; do not infer these broader planned outcomes from the new screens.
- Staging/live identity, deployed indexes/rules, retention/deletion, monitoring and rollback execution NOT TESTED. No deployment performed.
- Complete browser keyboard/assistive technology, quiz reference UI and canonical scene visual restore checks before closing product-language acceptance.

## Operations and evidence boundary

Contracts/API precede web rollout; additive indexes must be applied and verified by authorized deployment. See infra/firebase/README.md for bounds, registry regeneration and rollback notes. Registry generated from the existing conversion source, never hand-edited. No new dependency or production mutation.

Repository intelligence DEGRADED: stale CodeGraph/CocoIndex health; bounded source/compiler/tests used. HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50 with extensive pre-existing untracked WIP. candidate-sha256.json binds the current inspected source/test scope; it is an inventory, not a claim that every listed file changed in this task. No commit/push.

Token usage: Unavailable. Actual billed cost: Unavailable. API-equivalent cost: Unavailable. Memory candidates: None.
