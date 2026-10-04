# HS-UX-CLEAN-1 — audited UX fixes

2026-10-01. User approved the preceding audit's proposed fixes with “Let do fully fix cho đến khi sạch”. Scope is the five UX findings and motion refinement, followed by regression and rendered review. No deployment or clinical publication approval is implied.

## Intelligence and impact
Gate READY after one incremental refresh and successful CodeGraph/CocoIndex health checks. HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50, broad pre-existing untracked WIP. CodeGraph located focusBodyScene, its viewer caller and scene tests; CocoIndex located full-body design/content contracts. Current source verified: dev home → FullBodyExperience → FullBodyAnatomy → FullBodyCanvas; production home remains published Explorer. Search only translates heart and bound heart parts. Camera focus does not isolate occluding anatomy. Mobile stacks 649px viewer before search and controls. OrbitControls consumes wheel/touch. Quiz empty/error lacks actionable recovery. Semantic labels must preserve atlas source IDs and unreviewed status.

Stack: Next 16.3.8, React 19.3, TS6, Three/OrbitControls, Vitest5, ESLint10. Profiles: universal, typescript-javascript, frontend-html-css, web-app, product-content; motion lifecycle/reduced-motion and memory cleanup reviewed. No API, database, auth, dependency, schema or generated catalog edits.

## File/function plan
- New apps/web/src/lib/body-vocabulary.ts: bounded exact concept-ID + expected English-name mappings for common organ navigation; preserve English/provenance and disclose draft translations. No invented diagnosis/content.
- body-explorer.ts: labels and normalized bilingual aliases; rank direct name matches above inherited part aliases; preserve region/system constraints, LAD alias and unknown English fallback.
- New body-explorer-ux.ts: pure reversible inspect transition combining selected source IDs, focus, restoration of hidden/opacity and clearing clipping. Existing focusBodyScene semantics retained for surrounding-context view.
- full-body-anatomy.tsx and module CSS: primary Xem rõ action; context view; concise inline orientation and human labels. Compact mobile stage, accessible inline switchable search/tool panels directly beneath viewer (no duplicate focusable controls), contextual selected summary/action. Preserve slicing, undo/redo, return from activity and source detail.
- full-body-canvas.tsx: mobile navigation mode permits page scrolling by default, explicit model interaction toggle; bounded requestAnimationFrame damping, interruption and reduced-motion response without permanent render loop. Preserve download validation/disposal.
- quizzes.tsx + scoped learning-empty component/CSS as necessary: distinguish empty/error, retry GET only, preserve private quiz results/schedule and existing cancellation; verified onward links.
- explorer.tsx: published-model empty state must stop suggesting unavailable gestures; retain production publication gate.
- tests/body-explorer-ux.test.ts plus existing medical-body-scene test migration for verified exact-ID translations. No source-ID or clinical assertion weakening.
- docs/implementation/ui-ux-cleanup/: plan, product-content review, verification/final review. Task-local baseline/approval/coordination under .ai/local.

## Acceptance and validation
1. gan/liver, phổi/phoi/lung, thận, não, dạ dày find correct existing concepts; direct organ names outrank alias-containing source groups; filters still constrain results; unknown query recoverable.
2. Xem rõ explicitly focuses and isolates selected anatomy, un-hides it, clears cutting/zero opacity; one undo restores exact prior scene; context view available.
3. 390/320 mobile plus tablet and desktop: readable hierarchy, no horizontal overflow, primary search/tools reachable, default canvas does not trap page scrolling; explicit rotate mode reversible. Keyboard panels, focus, reduced-motion and long labels checked.
4. Empty learning has useful next action; request failure has retry, loading and recovery; no auth/publication bypass or fabricated lessons.
5. Motion interruptible, reduced-motion respected and RAF/listeners cleaned. FPS only claimed if measured on actual runtime.
6. Scoped typecheck/lint/unit regression and rendered success/failure checks pass; final review repeated after fixes. No universal bug-free or production-ready claim.

## Risks, alternatives, coordination
Medium frontend risk: Three event/RAF lifecycle, history capture, mobile panel focus; mitigate pure-state tests plus browser checks. A modal drawer would introduce focus trapping and obscure models; use in-flow panels with explicit navigation instead. Preserve the independent medical-cine and learning-foundation WIP; touch only scoped UI recovery in quizzes. Clinical translation review, physical-device/GPU matrix, production rollout remain separate. Rollback restores this task's baseline only, never other WIP. No new paid resources or runtime dependency.
