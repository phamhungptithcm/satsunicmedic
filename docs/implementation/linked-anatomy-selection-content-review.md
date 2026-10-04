# SELECT-01 — Product Content Review

## Scope

FullBodyAnatomy and FullBodyCanvas; approved SELECT-01 v3. Vietnamese web, anatomy exploration. Goal: select and see immediately, then navigate spatially without extra reveal steps. Native web selects/buttons, keyboard focus, pointer/touch input, existing blue/navy/light surfaces. Apple-platform compliance is not applicable; human-centered principles are used as a quality reference. Reviewed 2026-10-02 UTC by Codex.

## Context and evidence

Verified against current component source, catalog IDs, scene history and renderer. Browser evidence uses the actual components, styles, Three renderer and integrity-checked local BodyParts3D bytes with a Vite harness; only Next dynamic loading is adapted with React.lazy. The activity scenario is a placeholder and activity entry is not part of these tests. This is an explicit component proxy, not Next routing/SSR/auth or production evidence.

User intent is observed; assumptions are that direct canvas picks preserve context and offer view modes, while list picks isolate immediately. Native screen-reader speech, physical touch/trackpad devices and clinical terminology review remain unverified. Existing provenance and draft-translation caveats remain visible.

## Content inventory

| Location/state | Old | Current | Meaning/evidence |
| --- | --- | --- | --- |
| Header | Chọn cấu trúc · Xem rõ · Tìm hiểu | Chọn để xem · Kéo để khám phá | List click directly reveals and frames geometry; browser-check. |
| Search heading | Bạn muốn khám phá gì? | Khám phá cơ thể | Primary exploration task, current screenshot. |
| Region field | Tìm trong vùng; separate Đến vùng cơ thể | Vùng cơ thể | One selector drives scene and list, exact region/system intersection. |
| System field | Hệ cơ quan + Ẩn hệ / Hiện hệ | Hệ cơ quan, compatible options | Selection applies immediately; skin maps to external surface; source groups may overlap. |
| Scope status | None | Đang tải / Chưa tải đủ / Đang xem + scope or source name | Uses actual renderer loading/error state; hidden, zero opacity, surface and cuts explicitly qualified. |
| Compatibility | None | Đã chuyển sang tất cả hệ trong vùng này. | Only emitted when requested system has no region intersection. |
| List header | Gợi ý cấu trúc / Kết quả | Cấu trúc trong vùng và hệ đã chọn / Kết quả tìm kiếm | Count remains suggestion/result count, not mesh count or complete atlas inventory. |
| Search recovery | Bỏ bộ lọc | Bỏ bộ lọc | Now navigates to all-body exterior, avoiding full internal atlas download; query is preserved. |
| Hint | Chọn cấu trúc, rồi bấm “Xem rõ”… | Chọn cấu trúc để xem ngay trên mô hình. | Single-action inspection verified. Left/right anatomical convention retained. |
| Mobile jump | None | Xem mô hình | Scroll to actual model; no forced tools tab. |
| On-model card | Name only | Actual source name, Xem riêng, Xem lân cận, Đóng | Native buttons call same inspection/context transitions; close returns focus to model. Accessible group is Lựa chọn xem + source name. |
| Toolbar | Xem rõ cấu trúc | Đưa vào khung nhìn | Frames current selection without changing display mode. |
| Detail action | Xem rõ | Xem riêng | Isolation semantics explicit. Existing nearby/visibility/opacity/source details preserved. |
| Unselected details | …rồi bấm “Xem rõ” | Chọn trong danh sách để xem ngay, hoặc bấm bộ phận trên mô hình để mở lựa chọn xem. | Distinguishes direct list inspection from contextual canvas selection. |
| Navigation | Rotation/zoom hint only | Xoay / Di chuyển / Cách điều khiển | Mode is pressed state, visible name and cursor; help describes implemented controls. |
| Desktop hint | Kéo để xoay · Cuộn để phóng to… | Kéo để xoay · Shift + kéo để di chuyển · Cuộn để zoom tại con trỏ | Current OrbitControls mappings and cursor zoom. |
| Touch hint | Chụm để phóng to | Hai ngón để di chuyển / phóng to | Emulated two-finger input verified; interaction-mode scrolling preserved. |
| Help | None | Di chuyển đến nơi muốn xem; mouse, arrow/Shift, +/−, F, Home, Esc, ? and touch instructions; Đóng hướng dẫn | Explicit canvas-focus condition; does not imply global shortcuts. |
| Canvas accessible name | Generic choose/rotate | Mô hình giải phẫu tương tác; phím mũi tên di chuyển, Shift và mũi tên xoay, F căn lựa chọn, Home căn vùng | Focusable canvas; aria-keyshortcuts; no shortcuts in text inputs. |

## State coverage and data semantics

Default/selected/pressed/focus: PASSED, desktop/mobile screenshots and browser assertions. Loading/pending: PASSED, existing loader plus scope status. Empty query results: PASSED, typing does not change geometry or fetch assets. Error/partial/unavailable recovery: PASSED, intentionally failed thorax chunks and successful retry. Success means local rendered view, not a persisted or medically reviewed result. Offline behavior is covered by failed delivery semantics, not a separate offline capability. Unauthorized, destructive, billing, persistence, numeric units and time/currency: NOT_APPLICABLE to this change. Existing access and asset integrity boundaries are unchanged. Source IDs and English labels retain their exact identities; compound concepts and overlapping source systems are not reclassified. Zero opacity is not described as a missing catalog entry.

## Mandatory Human Interface principles

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | List click reveals heart; region/system directly changes scene. |
| Agency | PASSED | Undo restores selector/scene and camera; reset, close, nearby and pan/rotate alternatives. |
| Responsibility | PASSED | Accurate partial-failure state, original source labels, provenance and medical-review limits. |
| Familiarity | PASSED | Native selects/buttons, ordinary drag/pan/zoom and scoped keyboard shortcuts; no Apple-only conventions. |
| Flexibility | PASSED | 390px and desktop views; 44px menu targets; keyboard focus/escape; reduced-motion and emulated touch; 200% browser content zoom. |
| Simplicity | PASSED | Removed duplicate region and mandatory reveal actions; two direct card actions. |
| Craft | PASSED | Fixed mobile control overlap; fit reserves navigation space; current screenshots show wrapping and readable labels; error/retry tested. |
| Delight | PASSED | Visible response without forced tools navigation; zoom follows pointer and pan keeps the new target. |

## Platform fit and pattern checks

Platform fit PASSED for scoped web components, preserving existing visual language. Writing/labels, feedback, contextual help, inclusion/accessibility/localization: PASSED within the proxy evidence. No new alert dialog, consent, permission, account or destructive pattern is introduced (NOT_APPLICABLE). Vietnamese messages are complete; original English source names wrap naturally. RTL is not an advertised supported locale and is NOT_APPLICABLE here. No claim of Apple HIG compliance or screen-reader certification.

## Gate results

Human Interface principles, platform fit, meaning/behavior, audience/task, natural tone, concision, states, data semantics, accessible keyboard/AX behavior, Vietnamese/English wrapping, terminology and in-context verification: PASSED for the reviewed component scope. Keyboard and browser accessibility-tree evidence is available; native spoken screen-reader testing is NOT_RUN and excluded from the accessibility claim.

## Verification and decision

Evidence: `output/playwright/select-01/{browser-check,mobile-check,failure-check,nearby-check}-result.txt`, `direct-view.png`, `mobile.png`, `desktop-help.png`, `zoom-200.png`, `load-error.png`; current hashes in `source-hashes.json`. 32 browser assertions; 81 focused unit tests. Desktop 1200/1440px; mobile 390x844; reduced motion and content zoom 200%.

Product Language Gate: PASSED for local component acceptance. Fixed mobile interaction-button overlap, model framing around control areas, accurate loading/surface/hidden/cut status and Escape behavior. Residual limits: original source terms may remain English; physical devices, spoken screen-reader testing, Next full-page integration and production remain outside evidence. No additional owner decision required within approved scope.
