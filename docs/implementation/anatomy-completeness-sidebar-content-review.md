# Product Content Review — AC-01 sidebar refinement

2026-10-02 · Reviewer: Codex · Vietnamese web UI, React client component `full-body-anatomy.tsx` and its CSS. Audience assumption: people browsing anatomy, including beginners. Task: find and inspect a part without configuring technical catalog options first. Native HTML search, details, select and button conventions; Apple-only conventions/HIG components not applicable.

## Context and inventory

Verified: 3,432 source concepts and 2,234 geometry parts remain accessible; concepts and mesh counts are not organ counts. English/source names are retained when translations are unavailable. No anatomy content was added or certified. Existing hierarchy describes source part relationships, not necessarily internal anatomy.

| Change | Job and behavior |
| --- | --- |
| Search placeholder → “Tìm tim, não, xương…” | Give familiar search examples; existing persistent accessible label retained. |
| “Lọc theo vùng, hệ” | Native disclosure contains existing region/system controls. |
| “Hệ và nhóm” | Shorter label retains distinction between systems and source classes such as teeth. |
| Active region/system/source classification text; “Bỏ lọc”, accessible “Bỏ tất cả bộ lọc” | Show hidden active constraints and reset to all concepts/all regions. Search is preserved. |
| “Chưa gán vùng”, “Chưa gán hệ” | Short summaries of source metadata gaps, not absence of body parts. |
| “Chọn bộ phận để khám phá” | Direct first-use instruction; click row still inspects geometry. |
| “Các phần của bộ phận này” | Source child relationships, without claiming all children are internal. |
| “Các phần”, accessible/title “Các phần của {name}” | Separate child browsing from inspecting the row; child total remains in results. |
| Remove ordinary mesh count | Source counts remain under model coverage and selected structure details. |
| “Trang trước”, “Trang sau” | Clarify pagination destination; disabled endpoints preserved. |
| “Tra cứu nâng cao”, “Phân loại theo nguồn” | Technical catalog and unclassified data remain reachable on demand. |
| Select accessible labels explicitly match visible labels | Region, system/group, catalog, source classification. |
| Model status moved below pagination | Loading/error/selected/hidden/cut status retained; stage error and recovery controls remain visible. |

## States and data semantics

Default, active/selected, keyboard focus, disabled first-page button, nonempty search, empty search/clear, filters/collapsed summary/reset, child/up, next-page, parts view and zero source-gap view exercised in local Chrome. Geometry loading was visible during browsing; existing failure/retry code unchanged and reviewed. No new persistence, account, authorization, destructive, offline or stale-data behavior; those flows are outside this presentation change. Existing `/api/v1/me` 500 remains a local backend limitation, not a model error.

Result counts use vi-VN and measure current entries, not anatomy completeness. Unclassified concept count 1,976 in whole-body view differs from unclassified source mesh count by design. Missing source IDs = zero remains explicitly distinct from unknown whole-body completeness. No privacy or authorization boundary changed.

## Mandatory principles

| Principle | Status | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Search and first rows precede technical controls. |
| Agency | PASSED | Active constraints visible even collapsed; reset, clear, child/back and pagination exercised. |
| Responsibility | PASSED | Source scope and unknown complete anatomy preserved; no false organ-count claim. |
| Familiarity | PASSED | Native web controls and concise Vietnamese action labels. |
| Flexibility | PASSED | 1440×1000 and 390×844; keyboard Enter disclosure and pagination; 2× CSS zoom smoke check without horizontal document overflow. |
| Simplicity | PASSED | Zero selects visible initially, full advanced access retained. |
| Craft | PASSED | Empty recovery and long source names wrap; four children for heart, bounded 40 rows, correct page reset after clear. |
| Delight | PASSED | Direct familiar examples and shorter path to parts; no unnecessary animation or interruptions. |

## Pattern and gate results

PASSED within local browser scope: platform fit, meaning/behavior, audience/task inference, calm natural tone, concise labels, actions/state coverage, data semantics/privacy, terminology, keyboard/accessibility structure, Vietnamese rendering/text expansion and current in-context verification. No consequential alerts, permission, onboarding, financial or destructive flows added. Existing reduced-motion model-scroll behavior preserved; no new motion.

Evidence: `/tmp/anatomy-sidebar-desktop.png`, `/tmp/anatomy-sidebar-mobile.png`, `/tmp/anatomy-sidebar-zoom.png`; Playwright session `ac01` current run outputs. 66 focused tests, TypeScript and ESLint recorded in completion report. Speech screen reader, physical mobile/touch, native browser 200% zoom and RTL not tested; CSS zoom is a bounded layout proxy, not an accessibility certification. No claim of translated/clinically reviewed coverage.

Decision: PASSED for this local sidebar refinement. Not approval for full anatomy completeness or production release.
