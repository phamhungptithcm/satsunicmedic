# Milestone A — Bài nhồi máu cơ tim tương tác

Scope: bản xem trước trong môi trường development theo `pathophysiology-approval.md`. Chưa phải nội dung y khoa được xuất bản. URL local: `http://127.0.0.1:4191/hoc-tap/sinh-ly-benh`.

## Kết quả

- Có một bài nhồi máu cơ tim: baseline bình thường, mảng xơ vữa, huyết khối gây tắc, tổn thương cơ tim. Sơ đồ 2D định tính, không phải model giải phẫu 3D/CFD.
- So sánh bình thường/bệnh lý; chọn cấu trúc; phát/dừng/tua/tốc độ; bước tĩnh với reduced motion; cuối bài không lặp về bình thường.
- Tìm Việt/Anh/không dấu/alias trong một bài hiện có; trạng thái không có kết quả; câu hỏi có giải thích đúng/sai và làm lại. Không lưu câu trả lời hoặc truy vấn lên server.
- Production chặn bằng `notFound()` ở server trước import dữ liệu draft. Không có cấu hình bật public, endpoint public mới hay thay đổi DB.
- Nội dung/nguồn nháp chưa được chuyên gia duyệt. Chưa làm bài đột quỵ, ECG, can thiệp điều trị, mô hình 3D hoặc triển khai cloud.

## Repository intelligence và phạm vi thay đổi

Gate cuối: DEGRADED; CodeGraph/CocoIndex health có thể chạy nhưng index stale với WIP hiện tại. Đã thử refresh một lần. Evidence chính: source, compiler, Vitest, browser và production HTTP local. Không tuyên bố complete blast radius.

Commit nền: `8a749e7881f8808473a7fc88a51ff81154aadd50`; phần lớn workspace là WIP chưa được Git track từ trước. Không commit/push, không đảo WIP. Danh sách/hash file task được lưu trong `/tmp/hs-pathophysiology-files.json`; ledger review có worktree signature riêng.

Luồng mới: server page development guard → server-only draft → Zod validation → client panel → pure stage resolver → SVG/HTML/quiz. Public route ở production → 404; không đi qua draft import. Link từ trang Học tập chỉ có ở development. Schema export thêm mới không thay scene v1; viewer cũ, API, Prisma và auth không chỉnh sửa.

Stack: TypeScript 6, React 19, Next 16 App Router, pnpm, Vitest 5, CSS Modules và SVG. Không thêm dependency. Profiles: universal, TypeScript/JavaScript, web-app, product-content, visual-design, animation-motion; HTML/CSS/accessibility được kiểm trong browser. Cấp độ rủi ro: medium cho hiển thị giáo dục sức khỏe, giảm bằng development-only và nhãn chưa review.

## Review cycles

1. **BLOCKED trong lần rà đầu:** `findLastIndex` không thuộc target library hiện tại (TS2550); header dùng chung rộng tới 349px ở viewport 320px; nhãn SVG nhỏ trên mobile. Test harness ban đầu đọc trạng thái comparison quá sớm; sửa harness đợi DOM có đủ hai hình, không thay logic để làm test xanh.
2. **PASSED trong phạm vi local preview sau sửa:** thay `findLastIndex` bằng vòng lặp có giới hạn; wrapper/CSS chỉ tại route preview cho header xuống dòng dưới 380px; thêm diễn giải HTML dưới mỗi sơ đồ. Chạy lại entry point gây lỗi, unit tests, typecheck/lint/build và browser. Đây là self-review, không phải independent specialist review hoặc y khoa review.

Đã xem các chiều: requirement match, compatibility, nguồn dữ liệu, an toàn public/draft, privacy, invalid contract, clamp/seek, end state, search empty, lựa chọn đáp án, offline sau tải, timer/listener cleanup, reduced motion, text semantics và rollback. Không có thay đổi transaction, auth, infrastructure hoặc chi phí provider.

## Kiểm chứng

| Gate | Trạng thái | Bằng chứng và giới hạn |
|---|---|---|
| Unit/regression | PASSED | `pnpm test`: 56 tests / 5 files; 36 tests mới cho schema, time boundary, search, environment guard |
| Type safety | PASSED | `pnpm typecheck` toàn workspace; web build/typecheck sau chỉnh sửa giao diện cuối |
| Static analysis | PASSED | ESLint các file TS/TSX thuộc task |
| Build | PASSED | `pnpm --filter @hs/web build` trên bản cuối |
| Browser chính | PASSED | `/tmp/hs-pathophysiology-check.json`: 21 checks; identity, comparison, chọn cấu trúc, quiz sai/đúng/reset, pause/end, search, reduced motion, responsive, ARIA snapshot, không page/console error |
| Browser bổ sung | PASSED | `/tmp/hs-pathophysiology-extra.json`: keyboard Enter, visibility event giả lập, không tự resume, offline sau tải, 320px |
| Chặn production | PASSED | `/tmp/hs-pathophysiology-production.json`: HTTP 404, không có draft trong HTML/RSC, không có link preview trong trang Học tập; scan static chunks không thấy ID/nội dung draft |
| API/DB integration | NOT_APPLICABLE | Không thay API, query hoặc schema DB; không lấy unit/browser làm bằng chứng backend live |
| Production deployment | NOT_APPLICABLE | Không triển khai; production local test bằng Next start chỉ kiểm route guard, không chứng nhận standalone image/cloud |
| Medical/asset release | NOT_RUN | Chưa có người duyệt chuyên môn; không có asset 3D được nghiệm thu. Public release NOT_READY |
| Real assistive technology | NOT_RUN | Đã dùng Chromium accessibility tree và keyboard như proxy; chưa chạy VoiceOver/NVDA trên thiết bị thực |
| Cross-browser/GPU | NOT_RUN | Chromium headless; không phải chứng nhận Safari/Firefox hay thiết bị/GPU thực |

Browser plugin chuyên biệt không có trong session; dùng Playwright từ runtime có sẵn, không cài dependency. UI evidence: desktop 1440×1080, tablet 768×1024, mobile 390×844, kiểm tràn 320×800 và 720×540 cho reflow tương đương thu hẹp khi zoom. Không gọi kiểm reflow là phép đo zoom trình duyệt thực.

Không tuyên bố FPS, hiệu quả học tập, nhãn y khoa chính xác đã duyệt hay toàn bộ sản phẩm production-ready. Hoạt ảnh chỉ cập nhật khi người dùng bấm phát; interval 100ms, elapsed được giới hạn sau gián đoạn; effect dọn timer/listeners; tab ẩn yêu cầu thao tác phát lại. Visibility check là sự kiện tổng hợp, chưa phải kiểm quản lý tab của mọi browser.

## Product Content Review — instance của template repository

### Scope, context và evidence

Surface: trang Học tập (link development) và bài mới. Audience: sinh viên/giảng viên xem thử cơ chế và góp ý. Mục tiêu: hiểu sự khác nhau giữa máu nuôi cơ tim và máu trong buồng tim. Locale: tiếng Việt, tiêu đề tham chiếu tiếng Anh; không có claim hỗ trợ toàn bộ UI tiếng Anh/RTL. Platform: web, native button/range/select/radio/details/link, không áp convention Apple-only. Apple HIG current compliance: NOT_APPLICABLE; dùng tám nguyên tắc như quality reference.

Design direction: giữ HumanScope trắng/xám, blue/navy và density gọn; đặt cơ chế ở trung tâm, nguồn/giới hạn ngay trong bài. Layout variance 2/10, motion 2/10 (chỉ khi phát), density 6/10. Sơ đồ gốc vẽ bằng SVG của task, không tái sử dụng hình/animation của nguồn y khoa.

Verified: các thao tác dưới đây chạy trên bản render hiện tại. Assumption: bài cơ chế cơ bản phù hợp để xin góp ý sinh viên; chưa chứng minh fit với một học phần hoặc kết quả học tập. Unknown: reviewer/chương trình đào tạo/asset chuyên sâu.

### Content inventory

Inventory đầy đủ các string occurrence trong bốn file render/content: `/tmp/hs-pathophysiology-content-inventory.json` (367 mục, bao gồm cả identifiers nội bộ để không bỏ sót literals). Bảng sau phân loại phần nhìn/nghe được; nguyên văn nội dung y khoa và nhãn từng stage/question nằm ở `pathophysiology-draft.ts`.

| Vị trí | Nội dung/states | User job và behavior |
|---|---|---|
| Route/link/breadcrumb | Học tập, Sinh lý bệnh, Xem thử bài…, page title | Vào đúng bài preview; link vắng ở production |
| Header bài | Từ dòng máu đến tổn thương; nhãn chưa duyệt; giải thích nháp | Hiểu mục tiêu và phạm vi tin cậy trước tương tác |
| Sidebar | Tìm bệnh hoặc cơ quan, placeholder Việt/Anh/viết tắt, số bài, không kết quả, xóa tìm kiếm | Tìm thật trong bài hiện có, không ngụ ý có thư viện lớn |
| Lesson card | Tên Việt/Anh, số giai đoạn, sơ đồ 2D; hai bài đột quỵ chưa có | Nhận diện nội dung sẵn có và phạm vi chưa triển khai |
| Diagram/legend | Bình thường/kịch bản, không tỷ lệ, mạch/mô/buồng tim, chỗ tắc/mảng xơ vữa, SVG title/desc, HTML summary | Hiểu các trạng thái bằng hình, chữ và họa tiết, không chỉ màu |
| Chọn cấu trúc | Ba tên cấu trúc và mô tả đi cùng; pressed/live status | Chọn bằng nút native và xem giải thích tương ứng |
| Timeline | Bốn stage, tiến trình minh họa, giai đoạn hiện tại, accessible slider value | Tua theo ngữ nghĩa bài; không hiển thị phần trăm hoại tử |
| Playback | Phát/Tạm dừng/Về đầu bài/Bước tiếp/Tốc độ, reduced-motion/end messages | Chủ động dừng/đọc/chuyển bước; biết vì sao phát bị vô hiệu hóa |
| Explanation | Điều gì xảy ra/Vì sao/Hậu quả, dynamic content, nguồn từng stage | Kết nối biến cố–cơ chế–hậu quả và kiểm chứng nguồn |
| Quiz | Câu hỏi, ba đáp án, Xem giải thích, kết quả đúng/sai, Làm lại, không lưu tài khoản | Suy luận trước, đọc lý do sau, không hứa lưu thành tích |
| Sources/details | Nguồn, phạm vi, giới hạn, version/locale/chưa có phê duyệt | Đọc sâu; phân biệt nháp với nội dung đã review |

### State coverage

- Default/action/focus/selected: PASSED, native controls + visible focus; pressed/current/check states.
- Pending/disabled: PASSED, phát bị khóa khi reduced motion/đã cuối, đáp án chưa chọn chưa submit, cuối không có bước tiếp; không có network save/loading mới để hứa.
- Empty/recovery: PASSED, query không khớp có hai đường xóa query; search không vào URL.
- Success: PASSED, phản hồi chỉ xác nhận đúng câu hỏi, không claim năng lực hoặc dữ liệu đã lưu.
- Error: validation từ chối nguồn/stage/answer không hợp lệ; không có API fetch mới trong panel. Route dùng error boundary hiện có; full framework error-boundary injection không thực hiện.
- Offline/partial/stale: PASSED trong phạm vi sau tải, tương tác không cần mạng; lần tải đầu offline vẫn phụ thuộc browser. Source links cần mạng. Không gọi draft là cập nhật/đã duyệt.
- Unauthorized: PASSED, production server 404 và không gửi dữ liệu draft; development preview không có authentication vì chỉ dành local.
- Destructive/financial/confirmation: NOT_APPLICABLE; không có thao tác đó. “Về đầu bài” reset cả câu trả lời, đã test.

### Data semantics

Time là tiến trình minh họa, không clinical elapsed time; speed chỉ tốc độ phát. Màu và hatch là ký hiệu, không số đo. Source data là immutable draft revision 1 trong server-only file, validate trước render. Không có reviewer giả, timestamp giả, đo lưu lượng/áp lực hoặc suy tổn thương từ slider. Nội dung thiếu không thành bài giả. Quiz/search chỉ React memory, không analytics, DB hoặc browser persistence. External links dùng noreferrer.

### Tám nguyên tắc và platform fit

| Nguyên tắc | Kết quả local | Evidence |
|---|---|---|
| Purpose | PASSED | Mục tiêu cụ thể, sơ đồ và một câu hỏi cùng kiểm tra đường máu nuôi cơ tim |
| Agency | PASSED | Dừng/tua/bước/reset/comparison; không auto-play, không loop về khỏe |
| Responsibility | PASSED | Nháp/chưa duyệt hiển thị đầu trang, định tính, production 404, không lưu tiến độ |
| Familiarity | PASSED | Button, range, radio, details, link chuẩn web; thuật ngữ nhất quán |
| Flexibility | PASSED | 320/390/768/1440px, reduced-motion, keyboard, ARIA tree + HTML equivalent; giới hạn AT thực nêu riêng |
| Simplicity | PASSED | Một bài tập trung; nguồn/giới hạn chi tiết có progressive disclosure |
| Craft | PASSED | Empty, disabled, end, wrong/right/reset và narrow layout kiểm trực tiếp; header overflow đã sửa |
| Delight | PASSED | Có thể thử sai và đọc lý do, làm lại không mất hướng, không cổ vũ quá mức trong ngữ cảnh y khoa |

Human Interface pattern checks: writing/labels, feedback, contextual help, privacy, inclusion đều PASSED cho phạm vi local và proxy đã nêu. Destructive alerts NOT_APPLICABLE. Full localization/RTL NOT_APPLICABLE với bài tiếng Việt duy nhất; reflow/long Vietnamese labels đã kiểm, chưa kiểm pseudo-localization của ngôn ngữ chưa hỗ trợ.

Gate dimensions: meaning/behavior, audience context, tone, brevity, state coverage, data/privacy, terminology, target-platform fit, in-context verification PASSED. Accessibility PASSED cho keyboard + accessibility-tree proxy, không phải chứng nhận assistive technology thực. Product Language Gate: **PASSED cho preview kỹ thuật**, không cấp quyền publish medical content.

## Handoff và còn lại

Milestone A local có bằng chứng cho ba tiêu chí; milestone B/C chưa triển khai. Public production: **NOT_READY** do chưa có review chuyên môn/asset và chủ đích chỉ mở development. Tiếp theo cần review nội dung, mapping và pedagogical pilot trước khi có kế hoạch xuất bản. Rollback local: bỏ entry link/route preview, các luồng cũ không cần migration; không có dữ liệu người dùng để rollback.

Reviewer: Codex self-review; không nhờ người/agent khác. Không có PR/Jira/deploy. Token usage, API-equivalent cost, actual billed cost: **Unavailable**. Memory candidates: **None**. Runtime evidence/report task ID: `HS-PATHO-A`.
