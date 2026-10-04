# Learning foundation — approved execution slice

Date: 2026-10-01. Authorization: user's latest “Approved” following medical-learning-platform-strategy-2026-10-01.md. This is the first executable slice of that strategy, not completion of the medical platform.

Intelligence: CodeGraph current/healthy, CocoIndex stale/unhealthy; DEGRADED source fallback. Architecture context is placeholder. Verified source: learning.ts uses SessionGuard/CsrfGuard, Firestore transaction, user-scoped idempotency; quizzes.tsx persists server-graded published quizzes; quiz-slides.tsx is separate local practice. Existing published/review-due gates must remain.

Plan: add a pure versioned experimental review scheduler; atomically store submitted answer snapshot and one review plan per user/quiz/revision with each existing attempt. A duplicate idempotency key must return its original result without rescheduling. Only a successful due review advances 1/3/7/14/30-day intervals; early correct practice preserves due time, mistakes reset to one day. No client clock or client score is trusted. Add authenticated bounded review-list endpoint; return current published revisions only. Add optional nextReview response and on-demand review list to existing quiz UI. Preserve old clients/attempts and existing atlas practice. No batch migration, cloud task, notification, medical publication, AI spend or new clinical content.

Files: packages/contracts/src/learning-review.ts and index.ts (additive types/function); apps/api/src/domain.ts, learning.ts (transaction and owner-filtered endpoint); apps/web/src/components/quizzes.tsx (schedule semantics); tests/learning-review.test.ts and learning-controller.test.ts (deterministic boundaries and fake transaction controller checks); docs/implementation/learning-foundation-*.

Security/concurrency: private data via existing API only, no client Firestore permissions. Read before transaction writes. Stable deterministic review key; Firestore transaction contention retries resolve simultaneous attempts. Source publication/revision checked before accepting new answers. No formal exam claims; attempt history immutable. Read queue at most 101 rows; disclose truncation, no claim of complete due queue. No new index necessary for equality owner filter. One small review write per submission. Answers bounded by existing 50-question contract.

Validation: scheduler boundaries, overdue/early/DST-independent UTC durations, repeat/revision reset; controller publication/ownership/replay/conflict; contracts/API/web compilation, lint, existing quiz tests; emulator if available. Browser security policy previously blocked the local URL: do not bypass. Record UI validation NOT_RUN until authorized tool access works.

Rollout: additive fields/collection, deploy backend before frontend after gates; rollback code preserves extra stored fields. No destructive operations/backfill. Cost: bounded read on explicit click, one additional read/write per attempt; no new services. Firestore billed usage not estimated as a guarantee.

Deferred strategy dependencies: reviewed objectives/source claims, scene-quiz catalog mapping, per-item hint/confidence and adaptive review, offline sync, validated medical images, educator tools, measured learning outcomes. These require subsequent slices; no full-roadmap completion claim.

Execution refinement: review UI is a separate learning-reviews.tsx component; regression coverage extends the existing api.integration.test.ts rather than creating fake-controller tests. Existing OpenAPI route inventory regenerated from source. Account-change cancellation added to quiz requests to protect private results. No infrastructure change.

Validation repair (same approved slice): root test project imports web helpers but lacks JSX/Next ambient declarations. Add react-jsx and include the existing generated apps/web/next-env.d.ts in root tsconfig.json. This changes typechecking only, not emitted production code or runtime contracts, and does not weaken strict checking. Re-run root compilation.
