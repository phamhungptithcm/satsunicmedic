# Kế hoạch triển khai Cộng tác y khoa

**Cập nhật approval:** owner đã trả lời “Dùng hai đề xuất làm MVP, giữ các cổng kích hoạt này” và yêu cầu ưu tiên phần tự kiểm chứng local. Backend intake cá nhân đã được triển khai trong đợt readiness; xem `private-intake-runbook.md`. Các mô tả “chờ duyệt” bên dưới là bối cảnh bản kế hoạch ban đầu, không phủ nhận approval mới. Org/UI/promotion vẫn chưa hoàn thành.

2026-10-01. **Chờ duyệt kế hoạch mới**. Yêu cầu hiện tại xác lập mục tiêu xây cộng đồng; các lần Approved trước thuộc nền tảng học tập/4D, không được coi là duyệt quyền tổ chức và intake cộng đồng mới. Trong lượt này chỉ tạo tài liệu và note điều phối; không sửa app, auth, Firestore rules, viewer hay dev server.

## Quyết định cần duyệt

Triển khai MVP theo medical-community-design.md: gửi đề xuất văn bản, workspace cá nhân/đơn vị, xác minh thủ công, phân công phản biện, ghi công và xuất bản có kiểm soát trên Firebase hiện có. Không mở nhận bệnh án/ảnh/DICOM, không tự cấp role từ hồ sơ, không thêm dịch vụ trả phí. Có thể xây và kiểm thử các luồng trước khi có đối tác; thiếu reviewer/điều khoản thì giữ feature flag publication tắt.

## Thứ tự và phạm vi file

| Bước | Module/file dự kiến | Thay đổi cụ thể | Bằng chứng nghiệm thu |
| --- | --- | --- | --- |
| 1. Contract và policy | packages/contracts/src/community.ts (mới), index.ts; apps/api/src/community-policy.ts (mới), domain.ts | Schema bounded, trạng thái, ownership/org scope, coauthor exclusion, rights/version | Unit transition/authorization matrix, unknown fields/privilege injection |
| 2. Intake có phân quyền | apps/api/src/contributions.ts (mới), app.ts, database.ts | CRUD revision immutable, submit/withdraw, cursor list, CSRF/idempotency/If-Match, audit | Emulator 401/403/404/409, cross-user/cross-org, concurrent submit |
| 3. Đơn vị và xác minh | apps/api/src/organizations.ts và contributor-verification.ts (mới), domain.ts | Invitation hạn dùng một lần, membership revoke, registry xác minh có scope, audit | Claim role giả/expired invite/revoked member/admin-vs-reviewer |
| 4. Biên tập | apps/api/src/editor.ts, publication.ts, community-policy.ts | Assigned review, coauthor/COI/verification checks, change-request, promotion có attribution, CAS public pointer | Review hash mismatch, changing author/source/rights invalidates, concurrent publish |
| 5. Web | apps/web/src/app/cong-tac/** và components/community/** (mới); header.tsx chỉ sau điều phối UI owner | Workspace, editor, public profile/provenance, reviewer inbox, org panel | End-to-end synthetic workflow, all states, keyboard/mobile/screen reader |
| 6. Liên kết kiến thức | public article DTO/component và target mapping sau khi xác định file từ source | Attribution và proposal target revision; anatomy IDs tham chiếu, không đổi renderer | Published-only, correct anatomy link, missing/withdrawn target |
| 7. Vận hành | infra/firebase/firestore.indexes.json khi query cần; generated OpenAPI từ src; docs/community/runbook.md | Indexes theo query thực, flags, limits, monitoring, rollback | Index emulator/query, no private search, no PHI/body logging, rollback drill |

Không sửa file sinh tự động: regenerate OpenAPI bằng lệnh hiện có. Không thay auth provider, không đổi deployment kiến trúc. Từng bước giữ review hiện có chạy được; strict public contracts không thêm trường tùy ý khi chưa cập nhật consumer/tests.

## Impact chính

- Auth: giữ Google/session; quyền mới tra từ server và đối tượng, không từ form/custom claims cũ.
- Persistence: collections additive. Nếu dùng payload chunk hiện có, chỉ ghi blob bất biến; publication pointer và link authoritative trong transaction. Không backfill xác minh/quyền cho người dùng cũ.
- Existing editorial: AUTHOR hiện tạo revision cho article theo id. Community không tái sử dụng endpoint này để cấp quyền viết toàn cục; promotion phải qua policy có scope. Không tuyên bố đây là lỗ hổng đã kiểm thử, nhưng đây là boundary không được mở rộng.
- Reviewer: kiểm reviewerId != authorId hiện có chưa đủ cho coauthor, assignment và org scope; mở rộng policy có regression cho luồng cũ. Không vô hiệu review bài cũ tự động; quyết định migration phải được tài liệu hóa trước rollout.
- Publishing: If-Match revision không tự ngăn một contribution cũ ghi đè article pointer mới; cần transaction kiểm basePublishedRevisionId.
- Search: chỉ public projection; draft/public metadata phân biệt. Không dùng AI tổng hợp nội dung chưa duyệt.
- Cost: paginated list (đề xuất 20/page), quota thao tác, không stream toàn bộ collection, không paid search/AI. Ngân sách vận hành thực phải gồm người kiểm duyệt; chưa ước tính tiền cụ thể khi chưa có tải.
- Viewers/UI: session 4D khác đang xử lý cine/source audit; không chạm full-body renderer và dev servers. Header/UI chung cần phối hợp quyền sở hữu trước sửa.

## Kế hoạch test và release

Áp dụng universal, TypeScript, web, API, database, concurrency, security, product-content, visual-design. Feature flag và default deny phải test trước pilot. Unit policy → emulator transaction/isolation → full synthetic author/reviewer/publisher E2E → in-context product-content → final review → pilot. Không dùng tài liệu bệnh nhân thật làm fixture. Hoàn thành product-content review theo template với cả tám nguyên tắc, không lấy compilation thay kiểm chứng trình duyệt.

Browser gate của lượt trước còn BLOCKED. Có thể triển khai phần server và test emulator sau approval; không coi UI đã nghiệm thu khi công cụ chưa cho kiểm tra. Release cần reviewer có thật được phân công, chính sách quyền sử dụng được chốt, người chịu trách nhiệm vận hành/retention, và tất cả gates có bằng chứng hiện hành.

## Câu hỏi vận hành chưa cần chặn việc viết code sau approval

TODO(owner): người chịu trách nhiệm chuyên môn đầu tiên; đơn vị pilot; phương pháp/tiêu chí xác minh bác sĩ và đại diện; điều khoản cấp quyền nội dung và attribution; thời gian giữ giấy tờ/thông tin kiểm tra; sức chứa hàng đợi review. Không tự điền tên bác sĩ, gắn logo bệnh viện hoặc tạo badge giả.

## Rollback

Tắt intake/publication flag; dừng invitation mới; giữ dữ liệu và audit. API cũ tiếp tục phục vụ nội dung đủ điều kiện. Không xóa contributions hoặc đổi owner hàng loạt. Khi rút bài, dùng publication gate và invalidation, không chỉ giấu nút UI. Không tạo tài nguyên trả phí hoặc công bố đối tác trong bước rollback.
