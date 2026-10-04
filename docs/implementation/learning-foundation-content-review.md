# Product content review — learning foundation

Date: 2026-10-01. Reviewer: Codex, source review only. Decision: **BLOCKED**.
Surface: `/hoc-tap`, quizzes.tsx and learning-reviews.tsx. Audience: Vietnamese learners returning to previously published practice quizzes. Web/React native buttons, lists, form and time elements; HunpeoLabs existing styles. Apple-specific component compliance: not applicable.

## Verified context

API server grades a published, unexpired quiz revision; transaction saves attempt and schedule. The interval policy is experimental, not calibrated to clinical mastery. Dates are elapsed UTC intervals formatted explicitly in Asia/Ho_Chi_Minh. API guards enforce account ownership. Preview quizzes inside 4D scenes remain session-only and are not silently promoted to published exercises.

## Complete new string inventory

| Surface/state | Text / meaning | Source evidence |
| --- | --- | --- |
| Section accessible name | Lịch ôn của bạn | Authenticated owner-only GET |
| Heading | Ôn lại kiến thức | Opens an existing published quiz |
| Default qualifier | Lịch gợi ý thử nghiệm, không phải đánh giá năng lực lâm sàng. Thời gian hiển thị theo giờ Việt Nam (UTC+7). | Versioned experimental schedule, Intl timezone |
| Load action | Tải lịch ôn của tôi | Explicit GET only; no polling |
| Pending/button and live status | Đang tải lịch ôn… | Request pending, button disabled |
| Empty | Chưa có bài ôn khả dụng. Hoàn thành một bài đã xuất bản để tạo lịch ôn. | Successful empty, not a failed request |
| Partial empty | Chưa tìm thấy bài ôn khả dụng trong phần lịch đã tải. | Truncated subset with no eligible entries |
| Unauthorized | Đăng nhập để xem lịch ôn của bạn. | API 401, data cleared |
| Error/offline | Chưa tải được lịch ôn. Bạn có thể thử lại. | Retry same read action |
| Partial | Chỉ hiển thị một phần lịch ôn. Các bài khác vẫn được lưu trong tài khoản. | Limit 101, 100 evaluated; no deletion |
| Item/action | Ôn bài: {title} | Existing quiz open handler |
| Schedule | Localized date/time | Persisted dueAt; explicit UTC+7 in qualifier |
| Result qualifier | Kết quả của lượt luyện tập này không phải đánh giá năng lực lâm sàng. | Current attempt score only |
| Result next step | Lần ôn gợi ý: {date} (giờ Việt Nam). Bạn có thể tải lại lịch ôn để xem lịch mới nhất. | Optional immutable attempt response; current queue may be newer |
| Account change | No extra text; private results cleared | hs-auth-changed aborts pending requests, resets results |

Existing quiz question, choice, feedback and error strings unchanged. No destructive action, notification, new animation, money, or translated English interface added. Loading/disabled, empty, partial, unauthorized, failure/retry and success all have source branches. There is no offline save promise. Zero score is a real quiz score; missing nextReview is omitted for old attempts. An empty queue does not mean mastery or absence of all history.

## Mandatory principles and platform verification

| Principle | Status | Source intent / missing evidence |
| --- | --- | --- |
| Purpose | NOT_RUN | Return to saved practice; rendered flow not checked |
| Agency | NOT_RUN | Explicit load and optional early review; keyboard not checked |
| Responsibility | NOT_RUN | Experimental qualifier and private ownership; in-context perception untested |
| Familiarity | NOT_RUN | Native web controls, Vietnamese labels; user comprehension untested |
| Flexibility | NOT_RUN | Text dates, semantic time, no color-only meaning; zoom/mobile/screen reader untested |
| Simplicity | NOT_RUN | One load action, no forced modal; composition untested |
| Craft | NOT_RUN | State branches and cleanup implemented; wrapping/focus/race interaction untested |
| Delight | NOT_RUN | Calm feedback, no artificial celebration; real interaction untested |

Meaning/data/privacy: source + emulator checked. Platform fit, natural tone in context, readability, localization expansion, live-region behavior, narrow/wide layouts and keyboard/screen-reader interaction: NOT_RUN. No screenshots claimed. Browser tool security policy previously refused local page access; no alternate browser or indirect workaround attempted. Compilation cannot substitute for this gate.

Required next evidence: restore permitted browser access; verify account change during pending requests, loading/empty/partial/error/success, long titles, narrow/wide viewports, keyboard focus and UTC+7 dates. No additional business approval is needed for those checks. Gate remains BLOCKED until executed.
