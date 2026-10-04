# Quyết định và câu hỏi còn mở

Tất cả quyết định bên dưới là đề xuất trừ stack/constraints người dùng đã yêu cầu. Không có approval triển khai hoặc mua hàng được suy ra từ tài liệu.

## 1. ADR tóm tắt

| ADR | Quyết định | Lý do và đánh đổi | Trạng thái |
| --- | --- | --- | --- |
| ADR-01 | TypeScript, Next App Router + Nest modular monolith | Theo yêu cầu; một backend domain, hai runtime web/API | REQUIRED |
| ADR-02 | PostgreSQL/Prisma, Google Cloud + Firebase, pnpm/Docker/GitHub Actions | Theo yêu cầu cập nhật; Cloud SQL, binary trong Cloud Storage, CDN riêng | REQUIRED |
| ADR-03 | Custom Three/R3F/Drei viewer; GLB có quyền | Đúng stack, kiểm soát scene/mapping; cần công asset/graphics | REQUIRED direction; asset chưa chốt |
| ADR-04 | Một hệ sâu trước, đề xuất tim mạch | Dễ định nghĩa một luồng học/animation; chỉ chọn khi có asset/reviewer | PROPOSED |
| ADR-05 | White/blue/navy; canvas charcoal | Đồng bộ HunpeoLabs/Satsunic, giữ màu giải phẫu | PROPOSED từ yêu cầu brand |
| ADR-06 | Same-origin API + Firebase Auth session cookie và registry | Danh tính Firebase, quyền nghiệp vụ ở Nest/PostgreSQL; CSRF và revocation bắt buộc | PROPOSED |
| ADR-07 | Không shared-cache nội dung y khoa ở V1 | Thu hồi đơn giản, đổi lại origin load cao hơn | PROPOSED |
| ADR-08 | Immutable asset/content/lesson revisions | Replay cảnh và audit chính xác, tốn storage/version management | PROPOSED |
| ADR-09 | DB outbox, worker cùng codebase; chưa Redis/broker | Đủ nhu cầu cụ thể, tránh infra thêm; phải kiểm worker lag/pool | PROPOSED |
| ADR-10 | Cloud Run + Cloud SQL private IP, không Kubernetes | Cloud Run Jobs cho worker; regional SQL HA/Load Balancer cần duyệt chi phí | PROPOSED |

## 2. Owner decisions

| ID | Cần quyết định | Owner cần gán | Hạn chốt / việc bị chặn |
| --- | --- | --- | --- |
| D-01 | HumanScope hay tên khác; quyền dùng brand/logo | Product/brand | Trước thiết kế logo/public domain |
| D-02 | Mẫu/hệ/asset, rights, ngân sách license | Product + medical + procurement | P1, chặn nghiệm thu 3D/4D |
| D-03 | Người duyệt thật, phạm vi chuyên môn, review cadence | Medical owner | Trước nội dung public |
| D-04 | Tổ chức/người dùng đầu, minors, locale launch | Product + privacy | Trước account/organization pilot |
| D-05 | Firebase sign-in providers, Identity Platform/MFA tier, role/session policy | Security/engineering | P2 identity |
| D-06 | Google Cloud region/residency, Firebase projects, billing/IAM ownership, domain | Infra + privacy | Trước provision staging/prod |
| D-07 | Budget, SLO, support window và người trực | Product + SRE | Trước P6; không hứa 24/7 khi chưa có đội |
| D-08 | Nguồn cơ sở y tế/địa giới, quyền tái sử dụng, lịch xác minh | Editorial/directory | Trước P4 dataset |
| D-09 | Retention/deletion/export policy và legal assessment | Privacy/legal | Trước thu dữ liệu thật |
| D-10 | Public lesson vs lớp kín, quyền share/export | Product + license + security | P5 |

## 3. Rủi ro ưu tiên

| Rủi ro | Xử lý trước khi cam kết |
| --- | --- |
| Không có model đúng chất lượng/quyền | Spike và license gate trước xây đủ UI; không thay bằng mannequin |
| Animation đẹp nhưng sai | Reviewer thẩm định clip + stage + text + tier |
| Asset quá nặng/egress cao | Budget/LOD và benchmark/cost model trên traffic giả định |
| Nội dung rút nhưng cache/link còn lộ | No-store, deny delivery, revoke drill và giới hạn downloaded copies |
| Lớp học/ghi chú rò qua share | Snapshot explicit + object policy + negative tests |
| Spec quá rộng, MVP nhiều nút giả | P1 chọn một hệ, nghiệm thu F1–F5 theo capability thật |
| Token/phiên bản tech bị lỗi thời | Compatibility spike theo package metadata trước cài và mỗi release |

## 4. Kiểm soát thay đổi đặc tả

Đổi schema scene/asset, privacy, API breaking, nền tảng viewer hoặc phạm vi release cần ADR/impact, cập nhật test IDs và owner review. Version doc tăng khi baseline thay đổi. Mọi quyết định cần ngày/người/nguồn approval, không đổi `PROPOSED` thành `APPROVED` chỉ vì xuất hiện trong roadmap.
