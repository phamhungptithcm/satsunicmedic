# Product Content Review — UI-PERF-01

## Scope

Web loading feedback in Vietnamese for general readers, medical students and specialists. The task is to understand whether a page, model or personal action is still pending without losing context. Reviewed 2026-10-04 against the approved UI-PERF-01 plan and current source. Apple HIG principles are a human-centered reference from the repository skill; this is a web UI, not an Apple-native contract. No Apple-only expression or pattern was introduced.

## Context and evidence

Observed: Next owns route completion, the request helper owns API completion, and the model loader provides manifest byte totals. Existing error and retry controls remain. Screenshots under `.ai/local/acceptance/` show desktop model pending/ready and desktop/mobile directory loading. Synthetic API fixtures deliberately represent unauthenticated and empty states, not production user records.

Assumption: short “Đang…” labels are understood consistently across the three intended audiences. No new clinical claim or audience-dependent medical term is introduced. Unknown: physical-device rendering, live provider interaction and assistive-technology speech output; these remain release limitations, not inferred passes.

## Content inventory

| Location | State | Changed content | User job and behavioral meaning |
| --- | --- | --- | --- |
| Global bar | Pending | Đang tải hoặc xử lý yêu cầu | Indicates work remains; no percentage or completion promise. |
| Shared Loading | Default pending | Đang mở nội dung | Existing default retained; animation changed to compact bar. |
| Full body | Download | Đang tải mô hình toàn thân; Đang tải các cấu trúc cần xem | Actual current-scene byte totals; unrelated cached chunks excluded. |
| Heart lesson | Download | Đang tải mô hình tim | Same canonical loader, cumulative required chunk bytes. |
| Both viewers | Preparation | Đang dựng mô hình | Bytes received does not mean model rendered; no 100% shown. |
| Model bar | Measured | 0–99% | Floor of received/current required bytes, no ETA, no clinical coverage claim. |
| Teaching/classroom dynamic atlas | Module pending | Đang mở mô hình | Dynamic import has not resolved. |
| Teaching | Requests | Đang tải bài giảng; Đang tải bài kiểm tra; Đang tạo bài giảng; Đang mở bài giảng; Đang lưu bài giảng; Đang mở trình chiếu | Describes the active action, never asserts a successful save early. |
| Classroom | Requests | Đang thực hiện yêu cầu | Existing single busy flag covers several actions; neutral scope is accurate. |
| Personal notes | Requests | Đang tải ghi chú; Đang lưu ghi chú | Private reads/writes; error retains unsaved content. |
| Directory | Search/pagination | Đang tìm cơ sở | No stale result presented as a new-filter match. |
| Reviews | Initial/more | Đang tải lịch ôn; Đang tải thêm bài ôn | Existing messages retained without trailing ellipsis; button keeps action identity. |
| Account | Save/logout | Đang lưu thay đổi; Đang đăng xuất | Existing disabled controls now include local bar; status after response remains unchanged. |
| Account security/export | SDK/request | Đang chuẩn bị xác minh; Đang kết thúc các phiên đăng nhập; existing export record-count message | Preparation differs from provider prompt. Counts are records read, not a completion percentage. |
| Export | Action | Xác minh & tải dữ liệu | Action label remains stable during work; nearby pending message supplies current step. |

Existing labels such as “Đang tải tài khoản”, “Đang mở bài học”, “Đang nộp” and module-loading labels inherit the shared visual component without changing meaning. Link labels, clinical content, confirmation consequences and empty/error/success messages are unchanged.

## State coverage and data semantics

- Default/action: links retain href, labels and navigation guards; synchronous actions do not show invented waiting states.
- Loading/disabled: progress and contextual labels, existing disabled submit controls. Unknown duration is indeterminate; byte percentage is download availability only.
- Empty/true zero: directory synthetic empty fixture; no “0 results” claim while pending.
- Success: progress disappears only after the owning lifecycle settles; existing success message follows its request result.
- Error/recovery: model explicit retry and directory retry remain; error is not rendered as successful completion.
- Offline/partial/stale: failed/partial bytes are never cached; available structures remain and missing chunks can retry. Five-minute cache applies only to verified public bytes with matching manifest.
- Unauthorized: private data stays no-store, unauthorized requests clear the count and retain sign-in guidance. No response is reused across users.
- Confirmation/destructive: existing account confirmations remain, with loading feedback only; no new destructive action.

No date/currency/timezone/clinical measurement changes. The progress denominator includes only unique current-scene chunks plus skin, and each cached hit counts its exact byte length. A new scene may have a different denominator; it is not a global monotonic completion estimate. Server calls do not share the browser activity counter.

## Mandatory Human Interface principles

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Compact status answers whether the requested load/action is ongoing. |
| Agency | PASSED | Existing navigation, cancellation, retry and edit retention remain; global bar has pointer-events:none. |
| Responsibility | PASSED | No invented percentage for API work; preparation separated from byte download; private data excluded. |
| Familiarity | PASSED | Plain Vietnamese “Đang…” labels and native web progress semantics. |
| Flexibility | PASSED | 320px layout and reduced-motion CSS checked in browser; semantic names remain for screen readers. |
| Simplicity | PASSED | Thin global bar, compact contextual bar, no new dialog or extra action. |
| Craft | PASSED | Pending/ready screenshots inspected; no horizontal overflow in focused mobile test. |
| Delight | PASSED | Same-session return reused model bytes; 180ms global delay avoids flashing on fast operations. |

## Platform fit and pattern checks

Web-native progressbar/status roles and Next navigation lifecycle are used. Existing white/navy/blue design is retained. No focus-stealing overlay, translated clinical jargon, new permission or onboarding flow. Contextual status is announced once rather than duplicating an outer live region; global progress has an accessible name without a second live announcement. Motion is removed under prefers-reduced-motion. RTL is not a supported locale in this scoped Vietnamese change.

## Gate results

Meaning, privacy, natural tone, brevity, terminology, target-platform fit and eight principles: PASSED within the inspected source and focused browser coverage. Accessibility: semantic names, reduced motion and existing keyboard controls checked; physical assistive technology is NOT TESTED. Product Language Gate: PASSED for the scoped loading changes. The final build was checked with delayed model/API loads, navigation cancellation, study/review and teaching pending states, and synthetic account saving. Eight focused browser checks passed with zero page exceptions. Account save, study, teaching, model pending/ready and 320px directory screenshots were inspected. Existing real-provider export/revoke flows and physical assistive technology remain NOT TESTED; no claim of full-product production acceptance follows from this scoped gate.

Finding fixed: adding a named progressbar inside a button could duplicate its accessible name. Save/logout/quiz-submit buttons now carry explicit pending names; the synthetic account save browser test verifies the exact name, disabled state, single request, success message and cleared global bar. Evidence: `.ai/local/release-all/ui-focused-browser.log`, `.ai/local/acceptance/ui-performance.json`, `progress-account-save.png`, `progress-study.png`, `progress-teaching.png`, `progress-model-desktop.png`, `progress-model-ready.png`, `progress-directory-mobile.png`.
