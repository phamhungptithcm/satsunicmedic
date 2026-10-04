# Product Content Review — anatomy control refinement

## Scope
FullBodyAnatomy stage controls and FullBodyCanvas selection card. Audience: Vietnamese anatomy learners using pointer, keyboard or touch. Task: manipulate the model without obscuring it. Target: responsive web, not Apple-native; Apple HIG platform contract not applicable. Existing Vietnamese product vocabulary and Lucide system retained. Reviewer: implementing agent, source + browser review, 2026-10-01 local / 2026-10-02 UTC.

## Context And Evidence
Verified: original source handlers, current Next route at port 4185, actual model geometry in the component harness; view, menu, camera and touch evidence in output/playwright/select-01-controls. Assumption: anatomy remains the primary visual focus. Unknown: user acceptance of final aesthetic, physical devices and spoken screen-reader output. No medical content validation claimed.

## Content Inventory
| Location/state | Before | Current | Job and behavior evidence |
| --- | --- | --- | --- |
| Touch inactive | Xoay mô hình | Tương tác; accessible Tương tác với mô hình | Enables the currently selected manipulation mode; mobile and layout checks |
| Touch active | Xong · Cuộn trang | Xong with check; accessible Xong · Cuộn trang | Returns to page scrolling; original toggle handler retained |
| Mode controls | Xoay / Di chuyển | Same labels, title/accessible names added | Modes also enable interaction; label text collapses below 380px, names remain |
| View options | Trước / Sau / Trái / Phải buttons | Same text in Góc nhìn chuẩn native select | Current baseline view; selection changes scene and undo/redo stay linked |
| Extra control disclosure | None | Thêm điều khiển | Opens history, labels, reset and help; native details semantics |
| Labels in disclosure | Icon with Ẩn hoặc hiện nhãn | Visible Ẩn nhãn / Hiện nhãn, existing accessible name | Action reflects scene.labels, aria-pressed remains; browser toggle check |
| History, reset, help | Icons or standalone controls | Hoàn tác / Làm lại / Về toàn thân / Cách điều khiển | Existing names/actions retained; secondary placement, menu and action tests |
| Close card/help | Đóng | X icon; existing Đóng lựa chọn xem / Đóng hướng dẫn names | Same dismissal, focus returned to appropriate trigger |
| Desktop hint | Long gesture list | Kéo để xoay OR di chuyển · Cuộn để phóng to | Dynamically follows mode; full shortcuts in help |
| Mobile hint | Long gesture list | Kéo để xoay OR di chuyển · Hai ngón để phóng to | Matches enabled mode; inactive explains page scrolling and Tương tác |
| Help | Assumed left drag always rotates | Choose Xoay/Di chuyển for left drag; right drag pans; Shift swaps; cursor zoom | Verified against installed control handling; keyboard shortcuts unchanged |
| Mobile help | Enable Xoay mô hình | Enable Tương tác or choose mode; one finger follows mode, two fingers pan/zoom; Xong scrolls page | Layout auto-enable and emulated touch checks |
| Zoom, frame, direct views | Existing accessible names | Preserved | Plus/minus, frame, Xem riêng/Xem lân cận retain handlers |

## State Coverage
| State | Applicable | Evidence/rationale |
| --- | --- | --- |
| Default/action | Yes | next-mobile.png; layout-check and actions-check results |
| Loading/pending/disabled | Yes | Initial loading observed on Next; zoom/frame disabled until ready; disabled redo preserved |
| Empty/no result | Yes, unchanged | Search edits and original empty-result copy preserved; no new empty strings |
| Success | Yes | Selected heart on Next, view and direct-card actions |
| Error/recovery | Yes | failure-check: interrupted chunks expose retry then recover |
| Offline/stale/partial | Partial modeled by aborted chunks | No stale/offline detection claim added |
| Unauthorized/forbidden | No change | No account/auth surface touched |
| Confirmation/destructive | No | Scene reset is reversible history; no persisted destructive action |

## Data Semantics
No medical names, source provenance, metrics, units, aggregation, privacy or authorization changed. The view select records a standard camera view, not a live anatomical diagnosis or camera-coordinate metric. Labels reflect existing scene state. Null selection preserves disabled frame behavior. Loading and partial failure copy remains qualified.

## Mandatory Human Interface Principles
| Principle | Status | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | One manipulation rail; Next mobile screenshot leaves model primary |
| Agency | PASSED | Direct manipulation, frame, history, reset and touch scroll escape retained |
| Responsibility | PASSED | Names match handlers; mode-aware hints fixed; partial failure not hidden |
| Familiarity | PASSED | Native select/details/button semantics; conventional zoom/close/history icons |
| Flexibility | PASSED | Pointer, focused shortcuts, touch and native form controls; browser checks |
| Simplicity | PASSED | Single rail, standard view separate, secondary actions disclosed |
| Craft | PASSED | Browser-measured 44px rail/card targets, 320–1440 widths, 200% zoom |
| Delight | PASSED | Less obstructed model and no extra animation; screenshot evidence, not a claim of user delight measurement |

## Platform Fit
Responsive web components and ordinary Tab semantics. Group role deliberately used instead of toolbar role requiring roving focus. Existing blue accent retained only for selection guidance/card action. No Apple-only styling, assets or claims. Result: PASSED within local tested Chrome scope; native screen reader speech not tested.

## Human Interface Pattern Checks
| Pattern | Applicable/result | Evidence |
| --- | --- | --- |
| Writing, labels, controls | Yes / PASSED | Inventory and action outcomes |
| Feedback/interruption | Yes / PASSED | In-place selected mode and status; no new modal |
| Alerts/consequential choices | Existing / PASSED | Partial retry preserved, no destructive flows |
| Contextual help | Yes / PASSED | Menu and ? trigger; close and Escape restore focus |
| Permission/privacy/accounts | N/A | Outside three-file change |
| Inclusion/localization | Yes / PASSED scoped | Vietnamese labels, native select, focus, 200% zoom; RTL not a supported locale here |

## Gate Results
Human Interface principles, target-platform fit, meaning/behavior agreement, audience fit, respectful tone, concision, action/state coverage, data/privacy preservation, tested accessibility, Vietnamese expansion, terminology consistency and in-context verification: PASSED within recorded local scope. No claim of full WCAG conformance.

## Verification Evidence and Decision
Screenshots: next-mobile.png, mobile.png, stage-320/390/768/1440.png, desktop-help.png, zoom-200.png, load-error.png. Checks: browser, mobile, layout, actions, failure, nearby and next-route results in output/playwright/select-01-controls. Real geometry; component harness substitutes dynamic-loader wrapper only. Next route verified separately after canvas load, not merely HTTP200.
Product Language Gate: PASSED. Fixed accessible visible-name mismatch, mode-dependent hint meaning and help-dismiss focus. Unavailable: physical devices, spoken assistive technology, production. No owner decision blocks this scoped implementation; visual preference remains the user's judgment.
