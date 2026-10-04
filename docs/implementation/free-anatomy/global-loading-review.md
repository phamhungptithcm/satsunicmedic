# Global loading and content consolidation review

2026-09-30. Scope: user-requested UI text consolidation and shared loading across the existing app. PASSED for this UI scope; this does not establish clinical accuracy, multi-age completeness, deployment or enforceability of a legal disclaimer.

## Changes and impact

One shared Loading component with scene, overlay, inline and dark options. Route-level fallback, reference model, pathophysiology model, Explorer module/asset/catalog loads, notes, quiz catalog/open/submit, login preparation/exchange and save operations use it. The anatomy package accepts an optional ReactNode fallback, retaining backward compatibility. CSS transforms/opacity only; no timers, extra fetches, fake percentages or artificial delays. Reduced-motion media query stops all loader animation. Actual error/empty states remain distinct.

Repeated draft/demo/unreviewed labels removed from all matched web TSX surfaces, including navigation and metadata. Accuracy and responsibility note added to existing shared Footer, rendered once per route. Footer explicitly explains possible inaccuracies and educational scope, with liability wording limited by applicable law; this is not a legal enforceability assessment. Source attribution, unknown age, missing lung surface, scientific simplifications and operational errors retained. Publication/development/auth/hash gates unchanged.

## Review cycles

1. Inspected current callers and loader states. Fixed initially absent shared footer notice, remaining pathophysiology mapping label and duplicate screen disclaimers. Distinguished opening a different quiz from submitting answers so the loading message reflects the operation.
2. Re-read changed call paths and verified live reference/route/pathophysiology loading and ready transitions, footer count1, and no horizontal overflow at390px. Verified final TypeScript and lint; focused test suite56 passed before the final isolated quiz-label refinement, which was then typechecked/linted. No new blocking scoped finding remains.

## Product content review

Inventory: neutral model and learning navigation labels; remove draft badges and repeated caution copy; footer accuracy/educational/responsibility text; loading labels for opening content/model/heart/library/lesson/saved content, submitting, saving and login states. Existing error/retry and real missing-data messages retained. No inaccurate claims of model approval or guaranteed correctness introduced.

Purpose PASSED: identifies ongoing operation without blocking unrelated reading. Agency PASSED: no fake wait; controls follow existing pending state. Responsibility PASSED: footer consolidates disclosure, source-specific limits retained. Familiarity PASSED: existing blue palette and layered symbol, native statuses. Flexibility PASSED: responsive scene/inline/dark forms and reduced-motion CSS. Simplicity PASSED: one component; redundant banners removed. Craft PASSED: light/dark rendered evidence, narrow no-overflow, scoped compiler/lint. Delight PASSED: quiet orbital motion, no flashing, no false quantified progress.

Target-platform: Vietnamese web; no Apple-specific controls. Accessible status/live region, decorative art hidden, readable contextual labels. Pending/ready verified in browser; unchanged error recovery covered by source and existing boundary tests, not newly simulated in browser. No destructive/confirmation changes. Native screen-reader speech and OS reduced-motion switching not exercised; CSS/static semantic implementation reviewed. Localization beyond Vietnamese not in scope. Meaning, tone, terminology, business meaning and current in-context checks PASSED for changed text. Legal sufficiency not assessed.

## Verification and quality gates

- Web and viewer TypeScript: PASSED.
- Scoped ESLint: PASSED.
- reference-anatomy, pathophysiology, google-sign-in and quiz tests:56 PASSED.
- Rendered loading: shared-loading.png, shared-loading-dark.png. Reference ready controls enabled after load; pathology ready canvas observed; global route fallback observed. Shared footer count1 and disclaimer verified via DOM. Mobile width/scrollWidth390/390.
- Source scan for draft/demo/unreviewed/preview labels: no matches in web TSX at review.
- No database, provider, infrastructure, asset or access-control change. No new dependency.
- Repository intelligence DEGRADED, stale indexes and CocoIndex daemon.log failure; prior refresh attempted, bounded source reviewed. Runtime CLI unavailable; manual report only, no ledger receipt claimed.
- Full deployment, clinical release approval and real Google OAuth flow: NOT TESTED in this UI task. Existing development gates remain.

Scope completion: requested display cleanup and shared loading implemented. Production readiness remains NOT_READY from earlier unmet project gates. Shared worktree remains dirty; no commit/push/deployment. Tokens and billed cost Unavailable. Memory candidates None. Source identity: evidence/global-loading-hashes.json. Rollback only these scoped UI edits, retaining other sessions' WIP.
