# Compact icon controls — AC-01 — 2026-10-02

Completed current request within discovery presentation scope: selected-structure actions, body layers, muscle visibility, restore visibility, pagination, child navigation, rotate and pan use icons. Desktop 32×32 controls; mobile/coarse pointers 44×44 targets with 15–18px glyphs. Layer controls share one row. Text remains for anatomical names, filters, recovery actions and secondary menu items. All action callbacks preserved.

Plan: anatomy-completeness-icon-plan.md. Baseline: `.ai/local/ac-01/icon-before/`. Two app files changed; no assets, data, backend, API, dependencies or deployment. Existing dirty/untracked WIP retained. Intelligence gate initially stale; refreshed once, bounded direct-source impact review of component, shared CSS and existing scene helpers. HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50.

## Product language review

Vietnamese responsive web; native buttons, existing lucide icon set and product colors. Audience/task: explore anatomy with less visual clutter (explicit owner request). Inventory: existing labels Xem riêng, Xem lân cận, Ẩn/Hiện cấu trúc, Bề mặt, Bên trong, Ẩn/Hiện cơ, Hiện lại các cấu trúc đã ẩn, Trang trước/sau, Các phần của {name}, Xoay, Di chuyển move from repeated visible text to icons with accessible names and hover titles. New group names Thao tác với cấu trúc and Lớp hiển thị describe related actions. Decorative SVGs excluded from accessibility tree. Layer/action buttons show names on keyboard focus; pressed state and crossed-muscle glyph convey hidden state without relying on color alone.

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | More space for model/content; actions remain available. |
| Agency | PASSED | Toggle, previous/next, child/back and undo exercised. |
| Responsibility | PASSED | No data changes or anatomical claims; meaningful accessible labels preserved. |
| Familiarity | PASSED | Eye, layers, person, muscle, arrows, focus, move and rotation icons from installed library. |
| Flexibility | PASSED | Desktop 32px and mobile 44px measured; keyboard Enter and focus labels. |
| Simplicity | PASSED | One compact layer row and shorter canvas dock. |
| Craft | PASSED | Secondary menu remains 170px wide, 44px high on mobile; focus and disabled states retained. |
| Delight | PASSED | Less repeated text and no extra dialogs or motion. |

Gate PASSED for local scoped language/platform/layout: natural action names, unchanged meaning, readable focus/hover labels, current browser evidence. Native Apple HIG not applicable to web. Unknown glyph familiarity for all users remains a usability trade-off of the explicit icon request; titles, accessible names and focus text provide labels. No speech screen-reader or physical touch certification. Existing empty/loading/error/source completeness messages unchanged; no new permission/destructive/offline behavior.

## Checks and final review

PASSED: web TypeScript, scoped ESLint, 35 tests across body-explorer-ux and body-navigation. Browser 1440×1000: muscle true/false, 32×32 target, pagination 41–80 / 3,432, four heart children, structure hide/show. Browser 390×844: muscle 44×44, keyboard toggle true, no horizontal overflow, overflow menu 170×44, undo restores muscle state. Initial mobile attempt had an unmet inside-mode precondition and timed out; fresh explicit inside-mode setup passed.

Screenshots `/tmp/anatomy-icons-desktop.png`, `/tmp/anatomy-icons-mobile.png` reviewed. Desktop capture includes loading state; no claim of finished whole-atlas loading. Existing local /api/v1/me 500 remains out of scope.

Final review cycle 1: CSS broad dock selector could shrink text menu rows; corrected specific overflow-menu width/min-height. Cycle 2: complete diff re-reviewed for scope, correctness, compatibility, security, privacy, unchanged callbacks, failure/recovery, focus, display semantics and resource use. Menu width/undo retested; no actionable findings in scoped checks. Final decision PASSED for local compact-controls change.

Profiles: universal, TypeScript/JavaScript, frontend HTML/CSS, web app, visual design, product content. DB, API, secrets, observability, SEO and new animation changes NOT_APPLICABLE. Production build, live backend, physical devices NOT_RUN; local compile and interaction evidence only. Production readiness NOT_READY/not evaluated; no push/deploy. Token usage and cost Unavailable; runtime CLI unavailable, report fallback. Memory candidates None.
