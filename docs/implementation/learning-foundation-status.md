# Learning foundation — verification and release status

2026-10-01. Task HS-LEARNING-FOUNDATION-1. **BLOCKED / NOT_READY**, local implementation only. No production deployment or paid resource creation.

## Implemented

- Existing published quiz submission now atomically saves the submitted answers, original graded result and an experimental review schedule.
- Schedule is separate per account, quiz and revision. Intervals: 1/3/7/14/30 elapsed days; correct early practice does not advance; an incorrect answer resets to one day or preserves an earlier imminent due time. This is not a validated optimal learning algorithm.
- Idempotent retries return the original response; concurrent distinct attempts cannot advance the same due review twice.
- Authenticated review list excludes withdrawn/draft/expired/superseded quiz revisions. Explicit bounded lookup evaluates at most 100 records and discloses truncation; pagination remains future work. Old revisions remain stored, never silently regraded.
- `/hoc-tap` includes an on-demand review list and optional next-review date in Vietnam time. Pending requests abort and private UI state clears on the existing account-change event.
- Medical publication and direct Firestore access restrictions unchanged. No new medical facts or clinical competence claims published.

## Evidence and quality gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Intelligence | DEGRADED | .ai/local/learning-implementation-intelligence.json; CodeGraph current, CocoIndex stale/unhealthy; direct source verified |
| Contracts build | PASSED | tsc -p packages/contracts/tsconfig.json |
| API typecheck | PASSED | .ai/local/learning-foundation/api-typecheck.txt |
| Web typecheck | PASSED | .ai/local/learning-foundation/web-typecheck.txt |
| Next production build | PASSED | .ai/local/learning-foundation/build.txt; build only, not deploy |
| Unit regression | PASSED | 18 tests across scheduler, server grading and existing practice helpers; unit.txt |
| Firebase emulator API regression | PASSED | 26 tests; integration.txt, demo-humanscope only |
| Static analysis | PASSED | lint.txt, changed TS/TSX + integration test |
| Root test TypeScript project | PASSED | root-typecheck.txt; added JSX and existing Next ambient declarations to test compiler configuration |
| API compatibility | PASSED (source/emulator) | Additive nextReview/answers/collection/GET; old response fields preserved; generated route inventory updated |
| Database/concurrency | PASSED (emulator) | Replay, conflicting payload, concurrent same/different keys, owner isolation, revision reset, invalid publication, rollback on failed attempt write |
| Security | PASSED (tested API scope) | SessionGuard/CsrfGuard unchanged; unauthorized queue 401, cross-account invisibility; no production OAuth claim |
| Visual/content/accessibility | NOT_RUN | learning-foundation-content-review.md; browser policy blocks local UI verification |
| Motion | NOT_APPLICABLE | No animation changes |
| SEO | NOT_APPLICABLE | No metadata, route discovery or structured-data changes |
| Observability | PASSED (source/emulator) | Existing SafeErrors emits sanitized 503/request ID for injected failure, no answer values logged |
| Migration | NOT_APPLICABLE | Additive schemaless records; no backfill or destructive migration |
| Deployment/production | NOT_RUN | Await current UI and repository checks; no cloud mutation |
| Final review | BLOCKED | .ai/local/learning-foundation/final-review.json |

Stack: TypeScript 6.0.3, Node 25.9, Next 16.3.8, React 19.3, Nest/Firebase Admin, Firestore, Vitest 5.0.3. Profiles: universal, typescript-javascript, web-app, api, database, concurrency, product-content; visual/accessibility checks pending. No dependencies changed. Workspace contains extensive existing untracked work; this is not a clean release candidate.

Emulator note: first restricted run could not bind loopback (EPERM); authorized retry passed. SDK metadata warning occurred during emulator startup; tests completed successfully. This is not evidence of live provider access. Root typecheck initially also caught a generic test-spy typing issue introduced in this slice; corrected and rerun. Root test compiler configuration then repaired using existing Next ambient declarations and react-jsx; final root typecheck passes.

## Review findings and remaining work

Scheduler correction during implementation: overdue wrong answers must schedule one day ahead, not an immediately overdue timestamp. Unit regression now covers it. Account-transition cleanup added after source review; browser race verification remains outstanding. Atomic rollback and concurrency verified in emulator. Queue currently reads quiz metadata through existing payload decoder, bounded but with up to 100 quiz/payload lookups; suitable only for the small pilot, optimize projection and add cursor pagination before a larger catalogue.

This implements one foundation slice. Versioned learning objectives and evidence/claim workflow, binding scene practice to published quiz identities, per-item hint/confidence records, offline synchronization, reviewed pilot curriculum, validated volumetric/cine assets, educator tools and learning-outcome studies remain unfinished. Existing 4D preview practice is still session-only. No claim that the full medical platform or realistic 4D model is complete.

Release sequence: restore permitted browser verification, validate product-content states, perform fresh final review, then deploy API before web under existing release procedure. Rollback code first; preserve additive learningReviews and attempt fields. No automatic deletion or migration required.

Token usage: Unavailable. Actual billed cost: Unavailable. No new paid services requested. Memory candidates: None.
