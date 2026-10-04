# HumanScope — từ zero đến production

Phiên bản tài liệu: 0.2 · Ngày: 30/09/2026 · Trạng thái: **DRAFT FOR REVIEW**.

## Quyết định hiện hành

Owner đã chọn “Cả web, đăng nhập và database Firestore”. [Kế hoạch Firebase đã duyệt](implementation/firebase-migration-plan.md) và [runbook triển khai](../infra/firebase/README.md) thay thế phần PostgreSQL/Prisma, VM và Cloud SQL của thiết kế ban đầu. Production tại Singapore; không có staging, domain riêng và AdSense để sau. Các phần dưới mô tả lịch sử thiết kế; không phải bằng chứng vận hành.

## Cách đọc và thẩm quyền

Hai bản yêu cầu người dùng cung cấp là đầu vào sản phẩm. Yêu cầu mới “dùng google cloud và firebase” thay phần hạ tầng AWS trong brief trước; giữ PostgreSQL + Prisma và stack React/Node. Bản cập nhật công nghệ thay thế phần công nghệ cũ; yêu cầu đồng bộ HunpeoLabs/Satsunic thay thế hướng teal làm màu thương hiệu. Các đề xuất bổ sung trong bộ tài liệu này chưa phải quyết định được owner phê duyệt.

| Người đọc | Thứ tự đề nghị |
| --- | --- |
| Product, thiết kế, người kiểm duyệt chuyên môn | 01 → 02 → 05 → 06 → 08 |
| Kỹ sư frontend/viewer | 01 → 02 → 03 → 04 → 05 → 08 |
| Backend, bảo mật, vận hành | 03 → 04 → 06 → 07 → 08 |
| Người quyết định phạm vi và phát hành | 01 → 07 → 08 → 09 |

## Danh mục

1. [Product spec](01-product-spec.md): phạm vi, sitemap, vai trò, năm luồng, yêu cầu có ID.
2. [Design system](02-design-system.md): nguồn thương hiệu, tokens, bố cục desktop/tablet/mobile, nội dung và trạng thái.
3. [System design](03-system-design.md): sơ đồ, module, trust boundary, cache, sự kiện và triển khai Google Cloud/Firebase.
4. [Data/API spec](04-data-api-spec.md): thực thể, constraints, quyền, endpoints, lỗi, phiên bản và cạnh tranh ghi.
5. [Viewer/assets spec](05-viewer-assets-spec.md): hợp đồng mô hình, selection, camera, scene, animation, quy trình tài nguyên.
6. [Security/content governance](06-security-content-governance.md): kiểm duyệt, quyền, riêng tư, rút nội dung, xóa dữ liệu.
7. [Zero to production](07-zero-to-production.md): giai đoạn, phụ thuộc, local/CI, release, rollback, sự cố, chi phí.
8. [Validation/release](08-validation-release.md): ma trận nghiệm thu, mục tiêu đo, bằng chứng và điều kiện go/no-go.
9. [Decisions/open questions](09-decisions.md): quyết định đề xuất, owner và thời điểm cần chốt.
10. [Sources/intelligence](10-sources-intelligence.md): nguồn đã đọc, giới hạn xác minh và nguồn tham khảo chính thức.
11. [Document review](11-document-review.md): kiểm tra tài liệu, giới hạn product-language review và bàn giao.
12. [Product content review](12-product-content-review.md): inventory copy đề xuất và evidence còn thiếu để duyệt UI.
13. [Thiết kế trực quan UI/UX & mô hình 4D](design/humanscope-v1/README.md): ba concept desktop/mobile/hoạt động, gallery và brief dựng model; chưa có 3D/4D hoạt động.

## Từ điển trạng thái

- **REQUIRED**: yêu cầu từ người dùng, không được giảm âm thầm.
- **PROPOSED**: thiết kế đề nghị; cần được chấp thuận khi chốt implementation.
- **VERIFIED_SOURCE**: đã đối chiếu nguồn trong phạm vi ghi nhận; không chứng minh runtime.
- **NOT_IMPLEMENTED / NOT_TESTED**: chưa có triển khai hoặc chưa có bằng chứng chạy.
- **BLOCKED**: thiếu đầu vào bắt buộc để vượt một gate.
- **NOT_READY**: chưa đủ bằng chứng phát hành production.

## Điểm xuất phát

Kiểm tra repository tại commit `8a749e7881f8808473a7fc88a51ff81154aadd50`: README, LICENSE và bộ hướng dẫn agent; chưa có package manifest, app, migration, asset hay test ứng dụng. Các tệp governance đang untracked được giữ nguyên. CodeGraph/CocoIndex thiếu index, nên bằng chứng repository ở chế độ **DEGRADED**, dựa trên danh mục tệp, Git và đọc nguồn có giới hạn.

Tài liệu không thay thế mockup đã kiểm tra, hợp đồng bản quyền, duyệt y khoa, benchmark hoặc kiểm thử. Không triển khai, cài dependency, mua tài nguyên, publish, push hoặc tạo hạ tầng trong phạm vi công việc này.

## Phạm vi phát hành đầu tiên

Một mẫu toàn thân đủ điều kiện sử dụng, một hệ được làm sâu, một mô phỏng sinh lý được thẩm định, một bộ nội dung đã duyệt, cơ sở y tế có nguồn, một bài học và cảnh giảng dạy lưu/mở lại được. Đề xuất chọn hệ tim mạch để thẩm định tính khả thi trước; chưa chốt tài nguyên hoặc nội dung tim mạch.

Mọi giai đoạn phải giữ luồng khám phá công khai không bắt đăng nhập. Nếu chưa có mô hình hợp lệ, kết quả chỉ được gọi là bản thiết kế/prototype, không gọi là sản phẩm 3D/4D hoàn chỉnh.
