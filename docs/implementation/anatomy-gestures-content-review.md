# Product content review — direct model gestures

Scope: Vietnamese cross-platform web anatomy viewer, users navigating a structure without repeated toolbar presses. Reviewed 2026-10-02 UTC by implementation agent. This is a local implementation review, not independent human or physical-device certification. Source files and approval: anatomy-gestures-plan.md. Product-content, web-app and universal quality profiles applied. Apple-native HIG contract not applicable to this web UI; human-interface principles applied below, no Apple-only visual conventions introduced.

## Verified context and inventory

The renderer uses focus ownership for ordinary wheel, modifiers for rotate/zoom, coarse-pointer touch activation, and retained scene state for back. Official wheel reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event . Installed Three OrbitControls source establishes pointer/touch semantics; no hardware classification based on delta magnitudes. Assume modern browsers emitting standard wheel/pointer/touch events. Physical trackpad and Safari gesture delivery remain unverified.

| Location/state | Previous content | Current content and user job | Evidence |
| --- | --- | --- | --- |
| Help, mouse | Left drag follows mode, modifier controls described less completely | “Mặc định, kéo chuột trái để di chuyển; giữ Shift để xoay. Kéo chuột phải để xoay. Hai nút Xoay / Di chuyển đổi thao tác kéo chuột trái.” | Actual Next drag assertions; default pan aria-pressed |
| Help, trackpad | No direct pan/rotate trackpad instructions | “Trackpad: bấm vào mô hình rồi vuốt hai ngón để di chuyển; giữ Shift và vuốt để xoay. Pinch hoặc giữ Ctrl / ⌘ và cuộn để phóng to tại con trỏ. Esc trả lại cuộn trang; ngoài mô hình, cuộn trang và zoom trình duyệt vẫn hoạt động.” | Focus/wheel/ctrl/meta/Escape assertions; standard pinch encoding only |
| Help, keyboard | Escape closes menu | “Khi mô hình có tiêu điểm: phím mũi tên di chuyển; Shift + mũi tên xoay; + / − phóng to, thu nhỏ; F căn bộ phận đang chọn; Home căn vùng đang xem; Esc đóng menu và rời điều khiển; ? mở hướng dẫn. Ctrl / ⌘ + phím + / − vẫn phóng to trang.” | Model keyboard, undo and browser-shortcut tests |
| Desktop footer | Drag + older zoom hint | “Kéo để di chuyển · Ctrl/⌘ + cuộn để zoom”, or “xoay” for rotate mode | stage-390.png; dynamic mode source |
| Touch help | One finger rotate regardless of mode | “Trên điện thoại, bấm ‘Tương tác’ hoặc chọn Xoay / Di chuyển. Kéo một ngón theo chế độ đã chọn; dùng hai ngón để di chuyển và phóng to. Bấm ‘Xong’ để cuộn trang.” | Coarse-pointer CDP touch test; mode-specific drag and Done |
| Touch footer | Drag to rotate | Drag follows selected mode, two-finger zoom; inactive prompt unchanged | TSX conditional; touch interaction test |

State coverage: default/action and success verified by Next gesture/content scripts. Loading/disabled retain current loader and disabled renderer; no new success promise. Partial/error/recovery verified by aborted chunk and retry regression. Search empty/no-result behavior unchanged; search causes no model fetch. Offline maps to existing chunk failure, no offline capability promised. Unauthorized/destructive/confirmation not applicable: this change introduces none.

Data semantics: no medical names, source attribution, metric, precision, units, freshness, or authorization meaning changed. Camera position and target are local transient state; one wheel burst becomes one undo item. Back restores one previous scene and its resident chunks. No analytics or network payload added.

## Human-interface principles

| Principle | Status | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Pan/zoom reaches off-center structure without toolbar presses; camera math and Next tests |
| Agency | PASSED | Focus ownership, Escape release, touch Done, wheel undo grouping; back with zero asset requests |
| Responsibility | PASSED | Browser zoom keys untouched, outside/unfocused wheel default preserved, failed chunks retain explicit retry |
| Familiarity | PASSED | Left drag pan, right/Shift drag rotate, modifier wheel zoom; both Ctrl and ⌘ named |
| Flexibility | PASSED | Mouse, keyboard, standard trackpad wheel and touch paths plus existing visible controls |
| Simplicity | PASSED | Short contextual footer; detailed help under existing menu; no new toolbar buttons |
| Craft | PASSED | 390px render inspected; thin existing controls retained; help scrolls within viewport |
| Delight | PASSED | Zoom anchored at cursor after pan, continuous direct movement and retained back; no forced motion added |

## Platform, patterns and gates

Cross-platform web controls keep native buttons, aria labels and focus outlines. Pointer capability rather than window width determines touch activation. A narrow desktop no longer presents the touch-only activation button. iPad/phone coarse pointers keep explicit activation to preserve page scroll. Reduced-motion handling is retained. No browser-global wheel listener is introduced.

Writing/labels PASSED: short action wording, complete help sentences and both platform modifier names. Feedback/interruption PASSED: gesture updates directly, no modal or alert added. Onboarding/contextual help PASSED: screenshot help-390.png and content-check result, menu opens/closes. Alerts/consequential choices and permission/accounts NOT_APPLICABLE. Inclusion/accessibility/localization PASSED within current Vietnamese web scope: keyboard alternatives, accessible buttons, dynamic selected mode, narrow view and doubled help text checks. Spoken assistive technology and other-language translation NOT_RUN, not claimed certified.

Gate dimensions: human principles, platform fit, behavior meaning, audience/context, natural tone, concision, actions/states, data/privacy, accessibility within tested keyboard/DOM scope, Vietnamese text expansion, terminology consistency, and in-context verification PASSED. Product Language Gate PASSED for this change.

Evidence: output/playwright/anatomy-gestures/{next-gestures-check,touch-check,back-regression,failure-regression,content-check}-result.txt; help-390.png; stage-390.png. Actual Next app with real local model assets; touch is emulated, pinch is standard ctrl-wheel encoding. No physical-device, Safari, spoken AT or production deployment claim. No owner decision required for this scoped local change.
