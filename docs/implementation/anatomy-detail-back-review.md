# Compact detail and back — content and implementation review

## Scope and verified root cause
User-requested compact card and back without data reload, continuing approved SELECT-01. Plan: anatomy-detail-back-plan.md. Three application files changed against .ai/local/anatomy-back/baseline. Intelligence DEGRADED; actual renderer/scene source authoritative. Existing renderer disposed geometry outside active scope; now retains only active geometry plus one saved return scope. No prefetch of retained keys, no cumulative visit cache, no asset identity/hash changes, no dependencies or persisted data.

## Product Content Review
Surface: Vietnamese responsive anatomy viewer, learners inspecting a body part. Native web buttons and existing Three camera transitions; no Apple-specific contract. New string inventory: “Quay lại” button; title “Khôi phục góc nhìn trước khi xem chi tiết”; canvas inactive accessible prompt corrected from obsolete “Xoay mô hình” to “Tương tác”. Existing structure/source names, “Xem riêng”, “Xem lân cận” and close accessible names remain. Button means return to the immediately preceding detail-entry scene, not browser history. Another detail/nearby action replaces the single return snapshot; explicit scope/whole reset clears it. The card shrinks from248 to224px, title becomes11px/500 weight, actions remain44px tall with a subtle primary fill.

### States and meaning
Default: back absent without a snapshot. Detail/nearby: back visible and camera interpolates using existing reduced-motion-aware navigation. Back: restores prior scope, filters, labels, clipping, opacity, selection and camera; consumes snapshot, focuses the existing canvas without scrolling. Loading/partial/error: existing status and retry remain, first-time/failed/incomplete chunks may still require loading. Already-loaded prior chunks do not fetch/decode again. Empty search and unauthorized/offline behavior unchanged; no new destructive action, user data or medical meaning. No absolute offline/no-network guarantee for never-loaded data.

### Eight-principle and platform gate
| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Compact contextual choices leave more of the model visible |
| Agency | PASSED | Explicit reversible detail return, original history still available |
| Responsibility | PASSED | One saved scene and qualified loaded-data reuse; no false medical wording |
| Familiarity | PASSED | Arrow plus Quay lại; native button, clear tooltip |
| Flexibility | PASSED | Pointer and keyboard back, focus restored; reduced motion unchanged |
| Simplicity | PASSED | One click returns without searching history or resetting whole body |
| Craft | PASSED |224px card fits390px viewport;44px targets; full-scene/camera checks |
| Delight | PASSED | No reload transition in measured loaded-data flow; not a user-satisfaction claim |

Writing/labels, state feedback, contextual-help vocabulary, terminology, respectful tone, concise meaning, data/privacy boundaries, tested focus/touch sizing and Vietnamese in-context fit: PASSED scoped. Permissions/destructive confirmations/RTL: N/A for this change. Apple-only expression: none. Native screen-reader speech and physical devices NOT TESTED. Evidence: output/playwright/anatomy-back/next-mobile-card.png, next-mobile-detail.png, next-back-check-result.txt. Product Language Gate PASSED within local Chrome evidence.

## Review cycles
1. Source review found that the removed back button should return keyboard focus to the canvas; fixed with preventScroll focus after scene restoration. Initial test compared floating-point camera arrays byte-for-byte and observed an approximately7e-18 difference from OrbitControls. Keep exact equality for all non-camera state and compare camera components within1e-10; no product behavior relaxed. Harness tests passed; cold-start scripts now wait for the renderer canvas before scope actions.
2. Re-review against current three-file delta and current executed checks: retain set is recomputed from latest props; async completions honor latest active/retained keys; stale chunks outside both sets still dispose; pending jobs retain concurrency limit2 and retry latch; unmount disposes every retained model. Scene meshes remain filtered by active sceneSourceIds, so retained context is not accidentally rendered or picked. Back uses immutable scene snapshot, restores camera through existing move, not remount. No auth, API, secrets, model metadata or provider changes. Final decision recorded in runtime receipt after verification.

## Verification and limits
Actual Next route 127.0.0.1:4185/kham-pha/toan-than: return from detail and nested detail, full-state restore, camera tolerance, same canvas, zero asset requests with browser cache disabled, mobile card containment and hit targets. Initial component harness separately verifies same flows. Injected asset failures plus retry/history checks verify recovery after releasing previous scope. Scoped web/viewer types, ESLint and81 focused tests checked; logs and current hashes are in output/playwright/anatomy-back.

Memory cost: active scope plus ONE preceding scope, which can itself be large if user explicitly viewed a broad interior scope. Not an unbounded history cache. Explicit scope/whole reset, replacement snapshot and unmount release unused geometry. WebGL context loss/recreation or navigation away may require loading again. No full production build, release, physical-device or memory-profiler certification. Source review verifies disposal; no exact GPU-memory measurement claimed.

Completion: local feature verification only, no push/deploy. Existing dirty work preserved; rollback only captured three-file delta. Tokens/cost unavailable. Memory candidates: None. Final UI screenshot is evidence of implementation, not owner aesthetic approval.
