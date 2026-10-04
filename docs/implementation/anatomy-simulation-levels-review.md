# SIM-01 — Three audience levels, 2026-10-02

## Scope and acceptance
The owner confirmed all three audiences: general public, medical students, specialists. Existing SIM-01 approval covers this increment. A labelled level selector now changes explanation depth without replacing the canonical scene, resetting playback, or changing selection. This is an interface and coverage increment, not completion of three curricula or the whole simulation program.

General and medical content remain drafts. Specialist material is not authored or clinically reviewed. Coverage retains all 27 existing disease topics: three illustrative simulations, 24 without simulations. This is not an exhaustive disease taxonomy.

## Product content review
Vietnamese cross-platform web; native select, explicit label and description, visible focus, 44px touch target. Apple-specific platform conventions are not applicable. Reviewed by coding agent, 2026-10-02.

New content inventory (previously absent):
- Label: “Mức học”; options “Phổ thông”, “Sinh viên y”, “Chuyên khoa”.
- General hint: “Bắt đầu từ điều đang xảy ra. Mở phần giải thích khi muốn hiểu thêm.”
- Medical hint: “Theo dõi cơ chế, hệ quả và đối chiếu nguồn ở từng giai đoạn.”
- Specialist hint: “Xem giới hạn bằng chứng. Bài chuyên khoa riêng chưa được biên soạn và thẩm định.”
- Specialist region label: “Phạm vi nội dung chuyên khoa”; heading: “Giới hạn của bài hiện có”.
- Specialist disclosure: “Nội dung dưới đây vẫn là bài minh họa nền tảng. Chưa có bài chuyên khoa được thẩm định; không dùng mô hình này để suy ra thông số hay quyết định lâm sàng.” Existing scenario limitation is reused without clinical edits.

Default/action: general selected, explanation can be opened. Medical/specialist expand existing mechanism by default; users can close it. Missing specialist material is explicitly disclosed. Loading, disabled playback, recovery and unavailable model retain existing behavior; this selector makes no request and adds no async state. Empty, forbidden, destructive, confirmation states are not introduced. No authentication, patient data, persistence or permissions change.

Data semantics: learningLevels is per-topic authoring status, not expertise certification. draft never means clinically validated; not-authored never means no relevant disease. No units or aggregates are changed. simulation-catalog is the source of truth, mirrored by the coverage document.

| Principle | Result | In-context evidence |
| --- | --- | --- |
| Purpose | PASSED | One control selects explanation depth beside lesson stages. |
| Agency | PASSED | All three levels selectable; explanations remain expandable. |
| Responsibility | PASSED | Missing specialist authorship/review explicitly shown. |
| Familiarity | PASSED | Familiar Vietnamese audience labels and native select. |
| Flexibility | PASSED | Same scene, selected LAD and timeline 8 preserved across levels. |
| Simplicity | PASSED | One compact selector; general explanations collapsed initially. |
| Craft | PASSED | Desktop, 390px mobile and 768px tablet inspected; tablet grid corrected. |
| Delight | PASSED | Switching depth keeps the learner's place without reload. |

Writing/controls, noninterruptive feedback, contextual help, terminology, tone, displayed-data meaning, localization and platform fit pass for this bounded change. No new alerts/accounts/permissions. Accessibility evidence: explicit associated label, hint association, native keyboard-capable control and visible focus CSS; screen-reader execution and full accessibility audit not run. No separate RTL locale is offered. Product Language Gate: PASSED for changed surface within this evidence scope.

## Verification
- Web TypeScript check: passed on current source.
- Scoped ESLint: passed.
- Vitest simulation-catalog + pathophysiology: 35 tests passed across two files.
- Browser: timeline stayed at 8, selected structure stayed lad; canvas element stayed connected across level changes; medical explanation opened; specialist limitation visible; mobile horizontal overflow false.
- Tablet after CSS correction: selector y226/height36, stage button y444; no horizontal overflow. Screenshot visually inspected.
- Images inspected: /tmp/sim-01-levels-desktop.png, /tmp/sim-01-levels-mobile.png, /tmp/sim-01-levels-tablet.png.
- Initial browser attempt encountered reload timing during HMR; a fresh stable rerun passed. Existing /api/v1/me backend 500 and dev warnings remain; these checks do not prove authenticated/backend flows.
- No new production build or deployment this increment. Prior build results do not certify this changed snapshot.

## Final implementation review
Cycle 1 found a tablet layout risk: existing explicitly positioned inspector rows could conflict with the added selector. Fixed with a full-width first row and shifted existing tablet rows. No clinical semantics changed.
Cycle 2 re-read current scope, callers, state ownership, registry/tests and CSS. Typecheck, lint and 35 tests pass; tablet browser evidence confirms correction. No further actionable finding within the executed checks. Local increment review: PASSED. Security/privacy: no network, credentials or authorization changes. Failure handling: no new async dependencies; unavailable specialist state is explicit. Compatibility: no public API/database change. Rollback: revert only this increment, preserving existing WIP. Performance: state update reuses canvas; no new model download path. Observability/deployment changes not applicable.

## Completion report
This increment is complete; whole SIM-01 remains INCOMPLETE / NOT_READY. Required remaining work: authored and reviewed audience-specific curricula, normal functions beyond current coronary scope, remaining disease models and a bounded completeness taxonomy, clinical review, and full scene-state synchronization. Weighted whole-program progress cannot be computed without an agreed exhaustive denominator.
HEAD at review: 8a749e7881f8808473a7fc88a51ff81154aadd50; worktree includes pre-existing untracked WIP and these changes, preserved. Runtime ledger unavailable; this report plus task-local JSON records bounded evidence. Token usage and actual cost: Unavailable. Memory candidates: None.
