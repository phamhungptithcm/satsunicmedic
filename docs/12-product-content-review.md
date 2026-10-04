# Product Content Review — đặc tả HumanScope

Snapshot review của vòng đặc tả. Bộ visual/gallery bổ sung được rà riêng tại [design review](design/humanscope-v1/review.md); chưa có UI sản phẩm native hoặc model 4D để nghiệm thu.

## Scope

- Surface: viewer, cây cấu trúc, panel đọc, directory, học/giảng dạy, quyền và trạng thái được đề xuất ở tài liệu 01/02/04/06.
- Audience: người Việt khám phá, sinh viên, giảng viên; web desktop/tablet/mobile.
- Primary task: tìm cấu trúc, hiểu trạng thái và điều khiển đúng; không tự chẩn đoán.
- Business outcome: một luồng học có kiểm chứng; không hy sinh privacy để đo engagement.
- Locale: vi trước, en theo review; native web conventions, không Apple-only expression.
- Reviewer/date: Codex, 30/09/2026; chỉ review đặc tả, chưa có rendered UI.
- Apple HIG current platform check: NOT_APPLICABLE vì không triển khai Apple-native; dùng tám nguyên tắc từ skill làm quality reference.

## Context and evidence

Verified: brief người dùng, source brand, repo chưa có UI. Assumption: HumanScope tạm, hệ tim mạch đề xuất, control sizes/payload/retention là proposal. Unknown: asset có quyền, người duyệt, final data, browser/device evidence.

## Content inventory

| Location | State | Current → proposed | Job | Evidence |
| --- | --- | --- | --- | --- |
| 02 §3–4 | Navigation/default | Chưa có UI → tên điểm đến/màn hình | Hiểu nơi đến và quay về | Wireframe văn bản, sitemap 01 |
| 02 §5–6 | Search/tree/slider/tabs/timeline | Chưa có UI → label/action có accessible name | Điều khiển và nhận biết selection | Contract component, HS-02…08 |
| 02 §6 | Loading/missing/error/context loss | Chưa có UI → từng hàng copy dự kiến | Biết đang tải/không có/lỗi và đường tiếp tục | State machine 05 §6 |
| 02 §6 | Save/success/error/conflict/guest | Chưa có UI → từng hàng copy dự kiến | Phân biệt lưu tạm/lưu thật và conflict | API ETag/idempotency 04 |
| 02 §6 | Directory empty/stale | Chưa có UI → từng hàng copy dự kiến | Không nhầm thiếu dữ liệu thành không có bệnh viện | Governance 06 §5 |
| 02 §6 | Unauthorized/withdrawn/offline | Chưa có UI → từng hàng copy dự kiến | Hiểu giới hạn mà không lộ private object | Security/cache design 03/06 |
| 02 §6 + 06 §7 | Deletion pending | Chưa có UI → receipt wording | Không coi request là xóa xong | Deletion workflow; thời hạn chưa chốt |
| 01 §6 | Medical limitation/source/reviewer | Chưa có bài → disclaimer từ brief, metadata cần thật | Hiểu mục đích giáo dục | User requirement, chưa medical review |
| 04 | Error message/example | Chưa API → conflict copy mẫu | Giải thích hậu quả/khôi phục | Schema ví dụ, chưa runtime |

Inventory này bao phủ copy đang xuất hiện trong **đặc tả**, không là danh mục localization keys hoàn chỉnh của sản phẩm chưa xây.

## State coverage

Default/action, pending/disabled, no-result/unavailable, success/error, offline/stale/partial, unauthorized và delete pending đều có hợp đồng. Confirmation cho xóa vĩnh viễn chưa được final copy vì retention/ownership policy chưa chốt; implementation bị chặn ở D-09. Không có cơ chế ghi thành công/restore được coi đã hoạt động.

## Data semantics

Không chuyển unavailable sang 0; ngày kiểm tra khác ngày đăng; nội dung published khác approved; source chính thức khác self-published; guest progress khác durable save; giá trị thời gian animation không là dự báo bệnh. Không có metrics sản phẩm được hiển thị như kết quả thật trong docs. Privacy/search query/share boundaries có ở 04/06.

## Mandatory Human Interface principles

| Principle | Status cho UI | Điều kiện đã đặc tả / thiếu evidence |
| --- | --- | --- |
| Purpose | NOT_RUN | Model-first; chưa kiểm màn hình |
| Agency | NOT_RUN | Guest/reset/undo/cancel; chưa thử thao tác |
| Responsibility | NOT_RUN | Nguồn/giới hạn/lưu tạm; chưa đối chiếu dữ liệu thật |
| Familiarity | NOT_RUN | Web controls/copy Việt; chưa usability test |
| Flexibility | NOT_RUN | Mobile/keyboard/HTML/locale; chưa a11y/device |
| Simplicity | NOT_RUN | Progressive disclosure; chưa kiểm task flow |
| Craft | NOT_RUN | Có lỗi/rỗng/conflict; chưa render/zoom/wrap |
| Delight | NOT_RUN | Giữ cảnh/ít gián đoạn; chưa evidence trải nghiệm |

## Platform fit and pattern checks

Target web đã xác định; component/keyboard/touch/WCAG là yêu cầu, không giả Apple-native compliance. Writing/feedback/recovery/privacy/inclusion đều mới ở mức thiết kế; kết quả in-context NOT_RUN. Không có logo/trust badge/chức danh bịa. Bản tiếng Anh chưa được soạn/duyệt nên localization production không đạt.

## Gate results

| Dimension | Result | Evidence |
| --- | --- | --- |
| Context/terminology trong tài liệu | PASSED, chỉ scope tài liệu | User brief + brand source + glossary |
| Meaning matches implemented behavior | NOT_RUN | Chưa triển khai |
| Natural tone/brevity trong bản copy đề xuất | Đã rà soát, chưa UI acceptance | 02 §6; không lời hứa không có điều kiện |
| Eight principles/platform rendered fit | NOT_RUN | Chưa có UI |
| State/data semantics runtime | NOT_RUN | Chưa có API/viewer/data thật |
| Accessibility/locale expansion | NOT_RUN | Chưa screenshot/keyboard/screen reader |
| In-context verification | NOT_RUN | Không dùng string-table làm PASS |

## Decision

Product Language Gate cho **implementation: BLOCKED**. Đây không ngăn giao bản đặc tả để review, nhưng ngăn tuyên bố UI hoàn tất. Cần rendered surfaces cho viewport 360/390/768/1024/1440px, 200% zoom, pseudolocale/en, keyboard/screen reader và mọi state áp dụng trước khi đổi gate thành PASSED.
