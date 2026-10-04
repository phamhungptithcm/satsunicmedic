# Đặc tả dữ liệu và API

> **Cập nhật kiến trúc:** quyết định Firebase của owner thay phần PostgreSQL/Prisma/VM/Cloud SQL trong bản thiết kế ban đầu này. Xem [kế hoạch đã duyệt](implementation/firebase-migration-plan.md) và [runbook Firebase](../infra/firebase/README.md) cho cấu hình, lưu trữ, giới hạn giao dịch và triển khai hiện hành.


Trạng thái: PROPOSED; chưa có Prisma schema, migration hoặc OpenAPI sinh ra. Các bảng/endpoint dưới đây là hợp đồng thiết kế cần triển khai và kiểm thử.

## 1. Quy ước dữ liệu

ID opaque UUID; anatomyId là định danh nghiệp vụ ổn định, không tái sử dụng sau xóa/deprecate. Timestamps UTC `timestamptz`; locale riêng; không dùng slug, tên mesh hoặc array index làm khóa. Foreign keys và unique/check constraints nằm trong database, không chỉ TypeScript. Các đối tượng sửa đồng thời có `revision` nguyên tăng dần. Xóa mềm không thay thế xóa cá nhân thực sự.

## 2. Mô hình quan hệ

```mermaid
erDiagram
  User ||--o{ Membership : joins
  Organization ||--o{ Membership : contains
  Organization ||--o{ Class : owns
  AnatomyStructure ||--o{ AnatomyTerm : names
  AnatomyStructure ||--o{ AnatomyRelation : source
  Asset ||--o{ AssetVersion : versions
  AssetVersion ||--o{ StructureMapping : maps
  AnatomyStructure ||--o{ StructureMapping : identifies
  Article ||--o{ ArticleRevision : versions
  ArticleRevision ||--o{ ContentReview : reviewed
  ArticleRevision ||--o{ Citation : cites
  Source ||--o{ Citation : supports
  Facility ||--o{ FacilityBranch : branches
  FacilityBranch ||--o{ ServiceEvidence : proves
  Lesson ||--o{ LessonRevision : versions
  LessonRevision ||--o{ Scene : contains
  AssetVersion ||--o{ Scene : pins
  LessonRevision ||--o{ QuizQuestion : assesses
  User ||--o{ LearningAttempt : submits
  LessonRevision ||--o{ LearningAttempt : evaluates
```

ERD là khái niệm; không mô tả đủ mọi FK. Anatomy relation có hai FK source/target; content có bảng liên kết anatomy/disease/specialty; tenancy phải theo constraints bên dưới.

| Nhóm | Trường và bất biến quan trọng |
| --- | --- |
| User, ExternalIdentity, Session | Firebase project+UID unique và map userId nội bộ; email không là khóa tenant; Firebase session-cookie JWT chỉ lưu hash trong registry với expires/idle/revoked; roles không lấy từ form/custom claims cũ |
| Organization, Class, Membership, ClassMembership | unique org+user; class thuộc org; composite FK ngăn class/lesson/member lệch org |
| AnatomyStructure, AnatomyTerm | anatomyId unique; term locale/type/preferred/review status; laterality anatomical; nullable Latin nghĩa chưa có |
| AnatomyRelation, AnatomySystem | source/target/type như part_of, adjacent_to; taxonomy tree tách quan hệ graph; part_of không có cycle |
| Asset, AssetVersion, LicenseRecord | content hash, immutable object key, origin, rights, attribution, expiry, review receipts; trạng thái quarantine/validated/approved/published/revoked |
| StructureMapping | unique assetVersion+structureId; anatomyId FK; nhiều structureId có thể cùng anatomyId; version mapping được khóa với asset |
| Article, ArticleRevision | locale, body structured, revision hash, author, reviewDueAt, status; immutable sau approval; article pointer publishedRevision |
| Source, Citation, ContentReview | source URL/title/publisher/accessedAt; claim anchor; reviewer identity + content hash + decision + date; không approve bản đã đổi |
| Disease, Specialty, ContentRelation | relation có type/evidence/reviewer; phân biệt bệnh cơ quan/bệnh toàn thân ảnh hưởng |
| Facility, FacilityBranch, ServiceEvidence | tên pháp lý/chi nhánh, địa chỉ, official URL, specialty/service, loại nguồn, checkedAt, reviewDueAt; không inferred quality rank |
| AdministrativeArea | mã, tên, effectiveFrom/effectiveTo, source; địa giới versioned, không hardcode danh sách cũ |
| Lesson, LessonRevision, Scene | ownerUser hoặc org/class scope rõ; lesson revision immutable khi publish; scene schemaVersion và assetVersion pin |
| QuizQuestion, LearningAttempt, Progress | question/answer revision; attempt actor+idempotency key unique; scoring server-side; progress derived theo lesson revision |
| Note | private owner, anatomyId hoặc sceneId; plain text/sanitized rich text; không mặc định trong share/export |
| ShareGrant | opaque ID, token hash nếu dùng token, scope, expiry, revokedAt, creator, exact revision, approved snapshot hash |
| AuditEvent, OutboxEvent, DeletionRequest | audit actor/action/object/version/time; không raw medical note; outbox retry/lease; deletion steps/status/timestamps |

Index dự kiến: terms normalized locale/name; mapping assetVersion/anatomyId; content published pointer/locale; facilities area+specialty qua join indexes; mọi private query owner/org; attempts user+lesson+createdAt; outbox status+nextAttemptAt. Dùng EXPLAIN trên dữ liệu đại diện; không thêm index vô hạn.

## 3. API chung

Prefix `/api/v1`; JSON UTF-8; limit mặc định 20, tối đa 100; cursor opaque ràng buộc sort/filter; sort tiebreaker ID. DTO từ chối field ngoài hợp đồng và giá trị vượt giới hạn. HTML/rich text sanitize theo allowlist. Public DTO tách admin DTO, không chỉ bỏ field ở frontend.

Error envelope đề xuất:

```json
{
  "error": {
    "code": "REVISION_CONFLICT",
    "message": "Cảnh đã được thay đổi ở một phiên khác.",
    "requestId": "opaque-support-reference",
    "fields": []
  }
}
```

HTTP: 400 syntax, 401 phiên thiếu/hết hạn, 403 hành động không được phép, 404 object không tồn tại hoặc không được tiết lộ, 409 version/idempotency conflict, 413 payload, 422 domain validation, 429 rate limit + Retry-After, 503 dependency tạm unavailable. Không trả SQL/stack/object private. Request ID chỉ hiện trong phần hỗ trợ, không dùng làm thông điệp chính.

## 4. Endpoints công khai

| Method/path | Input chính | Output/quy tắc |
| --- | --- | --- |
| GET `/anatomy/systems` | locale | Hệ có metadata được xuất bản |
| POST `/anatomy/search` | query ≤120 ký tự, locale, limit | anatomyId/name/type/available; không log query, không shared cache |
| GET `/anatomy/structures/{id}` | locale | Term, relations, content links đã duyệt |
| GET `/assets/manifests/{id}` | quality tier | Chỉ published/allowed; signed delivery cấp riêng nếu cần |
| POST `/assets/versions/{id}/access` | requested capability | Kiểm license/session nếu cần; TTL, URL không ghi log |
| GET `/articles/{slug}` | locale | Published revision, source/reviewer metadata cho phép công khai |
| POST `/knowledge/search` | query/filter | Kết quả published; query không vào URL/log |
| POST `/facilities/search` | area/specialty/type, consented location optional | Branch DTO + evidence; không ranking chất lượng |
| GET `/facilities/{id}` | branch ID | Official channels, checkedAt và provenance |
| GET `/lessons/{id}/public` | locale | Published lesson, không lộ answer key trước nộp |
| POST `/lessons/{id}/guest-attempts` | question IDs + answers, short-lived guest token | Feedback đã duyệt; TTL guest ngắn, rate limit; không lịch sử định danh |
| POST `/content-reports` | object ID, category, optional text ≤1000 | Receipt thật, không hứa thời hạn chưa có SLA |

POST cho tìm kiếm tránh query sức khỏe trong URL/browser history/proxy access log; không phải quyền thực thi mutation. Cấu hình redaction body vẫn bắt buộc. Có thể SSR danh mục không query; public SEO pages dùng slug nội dung thông thường. Guest attempt chỉ dùng session ngẫu nhiên phục vụ rate limit, không tracking marketing.

## 5. Endpoints có phiên

Auth endpoints cùng origin, ngoài prefix nghiệp vụ: `POST /auth/session` nhận Firebase ID token qua body HTTPS, CSRF + Origin + recent authentication, trả Set-Cookie và ghi Session registry; không log body/token. `DELETE /auth/session` revoke registry entry hiện tại và clear cookie; `POST /auth/revoke-all` reauth rồi revoke registry và Firebase refresh tokens. Đăng ký/provider login do Firebase Auth SDK thực hiện theo policy, không tự xây password store. Protected APIs xác minh cookie/revocation/registry trước object authorization.

| Method/path | Quyền và semantics |
| --- | --- |
| GET `/me`, GET `/me/progress` | Chính chủ; no-store |
| POST `/lessons`, PATCH `/lessons/{id}` | Owner hoặc instructor trong scope; If-Match khi sửa |
| POST `/lessons/{id}/scenes` | Validate asset/version/mapping/rights; idempotency key |
| PUT `/scenes/{id}` | Owner/scope + If-Match; full bounded scene snapshot |
| POST `/lessons/{id}/attempts` | Người học đủ quyền; server chấm với revision pin |
| POST `/notes`, PATCH/DELETE `/notes/{id}` | Private owner, không instructor mặc định |
| POST `/lessons/{id}/shares` | Kiểm quyền chia sẻ, audience, revision, license, private fields |
| DELETE `/shares/{id}` | Creator/admin scope; revoke trước ACK |
| POST `/me/data-export` | Reauthentication; async job; file signed ngắn hạn |
| POST `/me/deletion-requests` | Reauthentication + CSRF; receipt trạng thái queued |
| GET `/me/deletion-requests/{id}` | Chính chủ hoặc cơ chế receipt bảo vệ sau khóa account |
| POST `/organizations/{id}/memberships` | Org admin; không cấp role hệ thống |
| DELETE `/organizations/{id}/memberships/{memberId}` | Thu hồi quyền và các session/grant phụ thuộc theo policy |

Scene payload tối đa đề xuất 256KiB, annotation ≤50/cảnh, text ≤1000/annotation; server giới hạn số scene/bài và số batch. Các ngưỡng cần đo UX, không nhận JSON vô hạn.

## 6. Endpoints biên tập và publication

`POST /editor/articles/{id}/revisions`, `POST /editor/revisions/{id}/submit`, `POST /editor/revisions/{id}/reviews`, `POST /editor/revisions/{id}/publish`, `POST /editor/articles/{id}/withdraw`.

Review yêu cầu hash/revision và expected status. Publish kiểm tra reviewer hợp lệ khác tác giả, bản dịch đúng revision, nguồn bắt buộc, review due chưa quá hạn và tài nguyên liên quan hợp lệ. Chỉ publisher được publish; quyền reviewer không tự cho publish. Transaction cập nhật published pointer và audit/outbox. Rút bài ưu tiên an toàn, có lý do và audit; old revision không còn public.

Assets: `POST /asset-review/uploads` tạo quarantine upload grant có giới hạn; `POST /asset-review/versions/{id}/validate` tạo job; `POST .../approve`, `POST .../publish`, `POST .../revoke` có quyền riêng, state machine và audit. API không nhận arbitrary URL để fetch từ mạng nội bộ.

## 7. Scene snapshot và concurrency

```json
{
  "schemaVersion": 1,
  "assetVersionId": "asset-version-placeholder",
  "mappingVersion": 1,
  "selectedAnatomyId": null,
  "camera": {
    "position": [0, 1.2, 3], "target": [0, 1, 0],
    "quaternion": [0, 0, 0, 1], "projection": "perspective", "fov": 45
  },
  "layers": [{"id": "layer-placeholder", "visible": true, "opacity": 1}],
  "isolation": {"anatomyIds": [], "surroundingOpacity": 0.15},
  "labels": {"visible": true, "locale": "vi"},
  "animation": {"clipId": null, "timeSeconds": 0, "playbackRate": 1, "paused": true},
  "annotations": []
}
```

Đây là ví dụ schema, không phải tọa độ giải phẫu đúng cho một asset. Coordinate system, units, bounds và transform trong manifest bắt buộc để diễn giải camera. Numbers phải finite; opacity [0,1], speed/time trong manifest, IDs thuộc asset đó. Restore luôn paused; lưu giá trị playback để hiển thị nhưng không autoplay ngoài ý muốn.

Lưu trả `ETag` và revision mới. Cùng revision hai phiên ghi: một thắng, một 409. Retry timeout dùng cùng idempotency key và request hash; server có thể replay response đã commit. Không dùng last-write-wins cho bài/ghi chú. Client muốn gộp phải hiển thị thay đổi, không tự merge annotation y khoa.

## 8. Migration và tương thích

Expand → deploy code đọc cả cũ/mới → backfill từng batch/checkpoint → verify → switch write → contract ở release riêng. Không drop cột/đổi ý nghĩa enum trong cùng release còn replica cũ. Prisma migration có review SQL, lock estimate, timeout, staging restore test. API additive trong v1; breaking change tạo v2 và kế hoạch migration client/scene. Asset/scene version không được đổi bằng migration DB ngầm.

OpenAPI sinh trong CI từ Nest, kiểm drift và compatibility, generate client vào `packages/api-client`. Các example dữ liệu chỉ là synthetic và không được seed thành nguồn y khoa đã xác minh. [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction).
