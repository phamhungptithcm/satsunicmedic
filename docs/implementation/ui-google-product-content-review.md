# Product Content Review — Google sign-in and workspace refresh

## Scope

- Surface/component: shared fixed navigation and footer; Google sign-in dialog; explorer workspace, toolbar and inspector.
- Changed references: header.tsx, login.tsx, footer.tsx, explorer.tsx, google-sign-in.ts, layout.tsx and globals.css under apps/web/src.
- Audience/task: Vietnamese readers exploring anatomy, learners saving private notes, teachers drafting lessons.
- Business outcome: easier navigation and use of existing account capabilities through Google sign-in.
- Locale/platform: vi, responsive web, mouse/touch/keyboard. Semantic links/buttons, native modal dialog, browser Google popup.
- Apple HIG: bundled human-interface principles reference applied as cross-platform quality criteria; no Apple-specific controls or trade dress.
- Reviewer/date: implementation engineer, 2026-09-30. Parent verified frozen ui-google-1 release in Chrome desktop and 320/390px responsive viewports; scope-limited review completed.

## Context And Evidence

Verified: published exploration remains public; personal notes/lessons require a server session. The Firebase client uses memory-only persistence. The popup is invoked before the first await from a user click. Server session creation requires a verified recent Google token in production, before database reads or cookie mint. Existing session revocation/generation checks remain intact. Existing sessions are not revoked by this change. Emulator password fixtures remain explicit. Provider readback in .ai/local/ui-auth-final.json and live chooser evidence verify configured Google sign-in, separately from account completion.

Assumptions: the current Vietnamese terminology remains appropriate; no user research is invented. Copyright attribution and Google-only sign-in are supplied user requirements.

Evidence: .ai/local/ui-browser-local.json and .ai/local/ui-browser-live.json. Live Google chooser, cancellation/retry, secondary-page login, fixed navigation, mobile menu, 320/390px wrapping and centered modal verified. Actual account completion, physical devices and screenreader not tested; reduced motion verified in source. Error variants use focused tests rather than fabricated browser evidence.

## Content Inventory

| Location/state | Previous | Current content | User job and behavior evidence |
| --- | --- | --- | --- |
| Header destinations | Text labels | Khám phá; Thư viện; Cơ sở y tế; Học tập; Về HumanScope | Same routes; icon plus label; active page/prefix marked with aria-current. |
| Header action, all routes | Đăng nhập or Mở không gian 3D | Đăng nhập | Opens the same account dialog; Explorer refreshes its user query, other pages reload after successful durable login. |
| Header mobile disclosure | Menu | Mở menu / Đóng menu | Expanded boolean, linked menu id, Escape closes and restores focus; focus leaving header closes menu. |
| Header landmark | Điều hướng chính | Điều hướng chính / Điều hướng di động | Distinguishes desktop and mobile navigation regions. |
| Footer default | Absent | © [current year] Copyright by HunpeoLabs; Về HumanScope; Quyền riêng tư | Shared layout; exact requested attribution; verified existing about and #quyen-rieng-tu links. Landmark: Thông tin trang. |
| Footer disclaimer | Concurrent owner request | HumanScope cung cấp nội dung để tham khảo và học tập; mô hình có thể được đơn giản hóa hoặc có sai lệch. Thông tin không thay thế chẩn đoán, điều trị hay tư vấn của chuyên gia y tế. HunpeoLabs không chịu trách nhiệm đối với quyết định dựa riêng vào nội dung này, trong phạm vi pháp luật cho phép. | Live wrapping verified; approved concurrent task cited below; legal effectiveness not assessed. |
| Login heading | Đăng nhập HumanScope | KHÔNG GIAN CÁ NHÂN; Tiếp tục với HumanScope | Explains scope without promising access before server acceptance. |
| Login explanation | Email/password form | Đăng nhập bằng tài khoản Google để lưu ghi chú riêng và soạn bài. | Existing private note/lesson functionality; no password field. |
| Login ready | Đăng nhập | Đăng nhập bằng Google | Prepared Firebase SDK and inMemoryPersistence required before enabling. |
| Login preparation | None | Đang chuẩn bị đăng nhập… | Button disabled until SDK and persistence ready. |
| Login popup pending | Đang đăng nhập… | Đang chờ Google…; Chọn tài khoản trong cửa sổ Google để tiếp tục. | Popup in progress; repeat click blocked; close remains possible. |
| Login exchange pending | None | Đang hoàn tất đăng nhập…; Đang tạo phiên đăng nhập. Cửa sổ này sẽ tự đóng khi hoàn tất. | Server session request in progress; close temporarily disabled through bounded API timeout. |
| Login dismiss | Đóng đăng nhập; Tiếp tục khám phá | Same, now accessible title and icon/arrow | Native modal focus containment; restores previous focus; no exchange after a late popup resolves after dismissal. |
| Login public option | Khám phá nội dung công khai không cần tài khoản. | Same, separate quiet section | Public exploration remains available without account. |
| Login not configured | Đăng nhập chưa được mở. Bạn có thể tiếp tục xem nội dung công khai. | Same | Missing public Firebase API key; no enabled sign-in control. |
| Login setup failure | Generic credentials failure | Chưa chuẩn bị được đăng nhập Google. Kiểm tra kết nối rồi thử lại.; Thử lại | Retry reruns SDK initialization and persistence setup. |
| Login popup cancelled | Generic credentials failure | Bạn đã đóng cửa sổ Google. Chọn đăng nhập để thử lại. | Maps popup-closed/cancelled; button enabled again. |
| Login blocked popup | Generic credentials failure | Trình duyệt đã chặn cửa sổ Google. Cho phép cửa sổ bật lên cho trang này rồi thử lại. | Actual popup-blocked Firebase code; browser action then retry. |
| Login network failure | Generic credentials failure | Chưa kết nối được Google. Kiểm tra kết nối mạng rồi thử lại. | Actual network-request-failed code; no false account-invalid claim. |
| Login provider setup failure | Generic credentials failure | Đăng nhập Google chưa sẵn sàng. Bạn có thể tiếp tục xem nội dung công khai và thử lại sau. | Unavailable operation/domain/key/configuration, no internal codes displayed. |
| Login existing popup | None | Một cửa sổ đăng nhập Google vẫn đang mở. Hoàn tất hoặc đóng cửa sổ đó rồi thử lại. | Module-level attempt serialization prevents late cleanup signing out a newer attempt. |
| Login unknown failure | Generic credentials failure | Chưa hoàn tất đăng nhập. Hãy thử lại; bạn vẫn có thể khám phá nội dung công khai. | Safe generic recovery for token/CSRF/session failures. |
| Viewer standard icon actions | Accessible names only | Thu nhỏ; Phóng to; Khôi phục góc nhìn và các lớp; Hoàn tác; Làm lại | Same accessible names now also native tooltips; same store actions and disabled boundaries. |
| Viewer/body/inspector states | Existing strings | Preserved | Loading, unavailable approved model, failed download, no results, layer labels, orientation and medical limitation meaning unchanged. Decorative search glyph removed. |

## State Coverage

| State | Applicable | Content/rationale | Evidence |
| --- | --- | --- | --- |
| Default/action | Yes | Destinations, Google account action, optional public exploration | Components and helper |
| Loading/pending/disabled | Yes | Preparation, popup wait, bounded server session wait | login.tsx; helper sequencing unit tests |
| Empty/no result/true zero | Yes | Existing unavailable-model/no-search-result meaning retained | explorer.tsx; live empty-state evidence in .ai/local/ui-browser-live.json |
| Success | Yes | Modal closes only after server session exchange; user query refresh/reload | helper/session tests |
| Error/recovery | Yes | Setup retry, popup cancelled/blocked, provider/network/generic failure | google-sign-in.test.ts |
| Offline/stale/partial | Yes | Network-specific recovery; existing model error remains truthful | Failure mapping covered by focused tests; offline injection NOT_TESTED |
| Unauthorized/forbidden | Yes | Production rejects non-Google identity; generic UI failure protects internals | google-session.test.ts |
| Confirmation/destructive | No | No destructive action introduced | Scope |

## Data Semantics

No metrics, aggregation, timestamps, locale formatting or model approval conditions changed. Concurrent owner-requested disclaimer is preserved; legal effectiveness is not certified. Footer uses runtime year. Unavailable model does not become zero or a fabricated model. Identity provider is taken from the verified Firebase token, never a request-supplied provider name. Provider tokens remain memory-only and are cleared in finally. A cleanup exception after cookie creation does not falsely claim the durable login failed. No credentials or protected data are rendered in messages.

## Mandatory Human Interface Principles

| Principle | Status | Current evidence/rationale |
| --- | --- | --- |
| Purpose | PASSED | Live desktop hierarchy and navigation reviewed. |
| Agency | PASSED | Live public bypass, popup cancellation and Escape/focus return; setup retry source inspected. |
| Responsibility | PASSED | Live unavailable model/content and account boundaries verified; disclaimer does not certify legal effectiveness. |
| Familiarity | PASSED | Native dialog and real Google chooser exercised live. |
| Flexibility | PASSED | 320/390px layout and keyboard menu checked; reduced motion source only; screenreader and physical touch NOT_TESTED. |
| Simplicity | PASSED | Live Google-only dialog and labeled navigation retain readable hierarchy. |
| Craft | PASSED | Live pending/cancellation states plus 18/18 focused failure-path tests; account completion NOT_TESTED. |
| Delight | PASSED | Brief transitions visually reviewed; reduced-motion override source checked; heavy model FPS NOT_TESTED. |

## Platform Fit

Responsive web conventions remain authoritative. Royal blue #163cff, navy #111c35, white/gray surfaces. Major destinations retain text; standard actions retain accessible names and titles. Native dialog rather than imitation Apple controls. Platform-fit decision PASSED for tested web surfaces.

## Human Interface Pattern Checks

| Pattern | Applicable | Result | Evidence/rationale |
| --- | --- | --- | --- |
| Writing, labels, controls | Yes | PASSED | Source inventory and live desktop/mobile copy reviewed |
| Feedback/interruption | Yes | PASSED | Polite status and relevant alert; native modal only after account action |
| Alerts/consequential choices | Yes | PASSED | Inline recovery; no new destructive actions |
| Onboarding/help | Yes | PASSED | Existing help and public exploration retained |
| Permission/privacy/accounts | Yes | PASSED | Google-only path, public bypass, no hidden password capture |
| Inclusion/accessibility/localization/RTL | Yes | PASSED | Vietnamese narrow wrapping and Escape/focus checks passed; reduced motion source only; screenreader NOT_TESTED; RTL not offered |

## Gate Results

| Dimension | Status | Evidence/rationale |
| --- | --- | --- |
| Human Interface principles | PASSED | Eight principles reviewed using bounded live/source/test evidence |
| Target-platform fit | PASSED | Live desktop/mobile web layouts verified |
| Meaning matches behavior | PASSED | Token/session helper tests; no premature completion |
| Audience/business context | PASSED | Existing exploration/notes/lesson source and user request |
| Natural/respectful tone | PASSED | Live Vietnamese navigation/dialog/cancellation message reviewed |
| Concise without meaning loss | PASSED | Live compact hierarchy and narrow wrapping reviewed |
| Actions/state coverage | PASSED | Live popup pending/cancellation checked; remaining variants covered by source/tests |
| Data semantics/privacy | PASSED | No model data change; verified provider guard and existing session protections |
| Accessibility | PASSED | Live Escape/focus return and narrow layouts checked; screenreader NOT_TESTED |
| Localization/text expansion | PASSED | 320/390px live wrapping and earlier 80% zoom checked; not exhaustive zoom certification |
| Terminology consistency | PASSED | Existing destination and anatomy labels preserved |
| In-context verification | PASSED | Current evidence: .ai/local/ui-browser-live.json |

## Verification Evidence

Implementation evidence and command logs: docs/implementation/ui-refresh-evidence/. Unit tests exercise popup synchronous invocation, cancelled/dismissed flows, CSRF/session cleanup, serialized attempts and production provider guard before mutation. Live evidence: .ai/local/ui-browser-live.json; mock evidence does not prove actual Google consent or account login.

## Decision

Product Language Gate: PASSED for frozen release scope with limitations below. Fixed during first parent browser pass: native dialog was at origin due to CSS reset; now explicit centered margin/inset with bounded height and scrolling. Required owner decision: none for this approved scope. Current in-context evidence recorded below. Memory candidates: None.

## Final in-context review — frozen release ui-google-1

This section consolidates final evidence and its limits. Purpose: primary destinations stay visible and viewer has clear hierarchy. Agency: public bypass, Escape/focus return, mobile disclosure, and cancelled Google popup recovery exercised. Responsibility: unavailable model/content shown accurately, no account acceptance falsely asserted. Familiarity: real Google chooser, conventional links and native dialog. Flexibility: live320/390px no overflow and centered dialog, keyboard menu; reduced-motion source override verified (OS setting not changed). Simplicity: only Google sign-in, no password fields; icons retain labels/tooltips while major navigation retains words. Craft: pending and cancelled states observed live, configuration/error variants tested18/18, no false success. Delight: compact panels and brief transition design visually reviewed; no sustained model-performance claim. Web platform-fit passed at tested viewports.

Concurrent authorized content preserved: footer accuracy/nonclinical-use/liability note from user request in task 01a0f543-f382-7070-86ae-22e690a58975, along with shared Loading component and shorter model availability copy. Footer text shown in live browser; wraps on mobile; describes simplified informational models and does not establish legal effectiveness. This UI review does not certify enforceability. No medical publication gate changed. Full model binaries excluded from release archive, development preview routes remain guarded.

Limitations: actual user account login/session, screenreader, physical touch device, OS reduced-motion runtime, offline network injection and heavy3D FPS NOT_TESTED. Existing mocked failure paths and source evidence are distinguished from live outcomes. Concurrent later model-selection edits excluded by frozen source archive e40ff5d4d1da841fb416e54deebd3761763688e41ca7bd38d985c90f1715a6e2.
