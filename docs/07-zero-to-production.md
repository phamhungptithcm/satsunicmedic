# Lộ trình từ zero đến production

> **Cập nhật kiến trúc:** quyết định Firebase của owner thay phần PostgreSQL/Prisma/VM/Cloud SQL trong bản thiết kế ban đầu này. Xem [kế hoạch đã duyệt](implementation/firebase-migration-plan.md) và [runbook Firebase](../infra/firebase/README.md) cho cấu hình, lưu trữ, giới hạn giao dịch và triển khai hiện hành.


Trạng thái: PROPOSED. Giai đoạn dựa vào kết quả và gate, chưa có lịch cam kết hoặc estimate tiền. Mọi owner là vai trò cần gán người thật.

## 1. Critical path và các giai đoạn

Critical path: quyền + chất lượng asset → viewer spike → anatomy mapping + nội dung duyệt → luồng thật → kiểm thử độc lập môi trường staging → operational/legal review → phê duyệt phát hành. Có thể viết nền tảng và biên tập song song theo công việc, nhưng không tuyên bố model xong khi thiếu asset.

| Giai đoạn | Đầu vào | Đầu ra bắt buộc | Gate ra / owner |
| --- | --- | --- | --- |
| P0 — Chốt baseline | Hai brief + bộ docs | Quyết định D-01…D-10, acceptance IDs, tên owner, phạm vi/chi phí | Product + tech + medical + privacy đồng ý baseline |
| P1 — Asset và feasibility | Candidate sample + quyền thử | Benchmark thiết bị, mapping thử, clip thật, license matrix, capability matrix | Một asset đáp ứng model/layer/animation hoặc ghi BLOCKED / graphics + medical |
| P2 — Foundation | Baseline được duyệt | Monorepo, versions lock, local Compose, CI, migrations nền, session/security skeleton, tokens | Build/type/lint; DB thật; auth negative tests / engineering |
| P3 — Viewer sâu một hệ | P1 + P2 | F1/F2 thật, fallback HTML, state/history, scene schema | Model/cây/panel/animation đồng bộ, mobile/browser evidence / graphics + QA |
| P4 — Content và directory | Reviewer và nguồn thực tế | Workflow draft→review→publish→withdraw, một bộ bài và branch đã duyệt | F3 và draft leakage/revoke tests / editorial + backend |
| P5 — Learning/teaching | P3/P4, policy chia sẻ | Một bài học, quiz, progress, scene restore, trình chiếu/chia sẻ | F4/F5, conflict/idempotency/privacy tests / learning team |
| P6 — Staging hardening | Candidate freeze | E2E, a11y, load, security, backup/restore, incident drill, chi phí | Không có blocker release; tất cả evidence đúng candidate / QA + SRE |
| P7 — Production rollout | Go/no-go đã ký | Hạ tầng đã review, migration, rollout giới hạn, smoke thật | Owner xác nhận kết quả và theo dõi / release owner |
| P8 — Vận hành | Production có người trực | SLO reports, review lịch nội dung/license, restore drill, triage feedback | Mỗi release lặp gate, không dùng PASS cũ / đội vận hành |

Thứ tự không cho phép chặn nội dung y khoa rồi thay bằng dữ liệu giả để public. Dữ liệu synthetic dùng local/staging phải được nhận diện và không lẫn vào publication pipeline.

## 2. Kế hoạch file/module khi bắt đầu implementation

| Phần | Tệp/module dự kiến | Kiểm tra đầu tiên |
| --- | --- | --- |
| Workspace | `package.json`, `pnpm-workspace.yaml`, lockfile, TS strict | Cài frozen lock, không peer mismatch |
| UI | `packages/ui` tokens và controls, `apps/web` shell/routes | Responsive/a11y/content states |
| Viewer | `packages/anatomy-viewer` schema/store/renderer/adapter | Mapping, scene roundtrip, cancel/dispose |
| API | `apps/api/src/modules/{identity,anatomy,assets,...}` | DTO/policy/error contract |
| Persistence | API Prisma schema/migrations/seed scripts | FK/index/migrate/rollback compatibility |
| Client | OpenAPI export + generator, `packages/api-client` | API diff và generation drift |
| Infra | `infra/docker`, `infra/terraform` | Least privilege, plan review, no public DB |
| Firebase | `infra/firebase`, Firebase Admin integration trong Identity | Auth emulator + live staging, client Storage Rules deny, không service-account JSON |
| Validation | unit/integration/e2e/asset fixtures và evidence | Synthetic rõ, provider/live tách riêng |

Đây là implementation plan cấp hệ thống; từng thay đổi existing system sau khi có code vẫn phải có impact plan và approval theo AGENTS.md. Không coi tài liệu này là approval triển khai, deploy hoặc mua license.

## 3. Local development contract

Sau khi scaffold, README của từng app phải có lệnh chạy thực tế được kiểm chứng. **Hiện chưa có các script/lệnh app để chạy.** Interface script đề xuất cho CI/local: `dev`, `build`, `typecheck`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `openapi:generate`, `assets:validate` và `db:migrate`. Không copy thành “đã chạy PASS” trước khi implement.

Compose chạy PostgreSQL theo version chốt và dependencies local cần thiết. Binary fixture nhỏ có license rõ và không giả model production; synthetic content gắn nhãn. `.env.example` chỉ có tên/placeholder cho database, Firebase project/auth, session, asset location, encryption/telemetry; không secret thật, không sử dụng `.env.production` trên máy dev.

Firebase Auth Emulator chạy cùng local stack; Storage emulator chỉ cần khi kiểm bề mặt Firebase SDK/Rules. Emulator dùng project test rõ ràng, không nhầm production project. Cloud SQL local được thay bằng PostgreSQL thật trong Compose, không Firestore emulator. Local có thể stub signed delivery nhưng staging phải kiểm IAM/CDN thật. Không `firebase deploy` hoặc tạo billing project trong giai đoạn viết tài liệu.

Engineer mới phải làm được: cài runtime/pnpm pin → lấy biến local → start DB → migrate → seed synthetic → start web/API → mở luồng F1 với asset được phép → chạy test subset. Ghi prerequisites và cách cleanup local volume riêng; không hướng dẫn xóa DB tùy tiện.

## 4. CI/CD và supply chain

PR: frozen install → type/lint/boundary → unit → integration PostgreSQL → migration compatibility → OpenAPI diff/generate → Playwright synthetic → asset metadata/license/schema checks → dependency/secret/image scan → build immutable images + SBOM. Không upload fixture riêng tư hay license hợp đồng vào public artifact.

Staging: deploy **cùng image digest** dự kiến production → migrations expand bằng job riêng → smoke/auth/tenant/cache tests → browser/device model tests → capacity/backup restore. Candidate gồm Git SHA, dirty snapshot hash nếu có, lock hash, image digests, DB migration set, asset hashes, content release revision, infrastructure plan hash.

Candidate Google Cloud bổ sung Cloud Run revision IDs/traffic, Cloud SQL edition/config, Firebase project ID, authorized domains/provider configuration version, deployed Storage Rules hash nếu có, IAM/CDN policy và Secret Manager version references (không giá trị). Firebase config có lifecycle riêng: review rollback cùng release, không giả rằng rollback container tự phục hồi provider/Rules/IAM. GitHub Actions push image vào Artifact Registry qua federation; Terraform plan review trước apply, environment approvals trước production.

Promotion: release owner review evidence và yêu cầu approvals production → GitHub OIDC qua Google Workload Identity Federation với service account giới hạn → chạy migration job single owner/lock → Cloud Run revision traffic split có metric → smoke anonymous + authenticated → tăng traffic. Không chạy migrate trong startup của từng replica. Có người theo dõi suốt rollout và rollback window.

## 5. Migration, rollout và rollback

Preflight: backup/PITR gần nhất, restore đã thử, compatible schema, capacity, secrets present bằng metadata không in giá trị, license/content còn hiệu lực, alarms/owner liên hệ. Nếu bất kỳ required evidence missing thì NO-GO.

Đề xuất rollout ban đầu: 5% → 25% → 100% traffic sau mỗi cửa sổ tối thiểu 15 phút có đủ sample; nếu lưu lượng thấp dùng synthetic probes bổ sung, không suy green từ zero traffic. Ngưỡng dừng đề xuất: API 5xx >1% trong 5 phút với ≥100 requests, auth/tenant regression bất kỳ, asset error >5% trong ≥20 sessions, hoặc sai nội dung y khoa có ảnh hưởng an toàn. Tối ưu ngưỡng sau baseline.

Rollback code về image digest trước chỉ khi schema tương thích; không tự rollback destructive migration. Database sự cố: cô lập ghi, đánh giá restore/PITR và dữ liệu mất theo RPO; forward fix có thể an toàn hơn downgrade. Asset rollback chỉ đến version còn license/approval; lesson pin version cũ không được tự repoint. Content rollback phải là revision còn đủ điều kiện duyệt, không khôi phục bài bị rút vì sai.

## 6. SLO, đo lường và cảnh báo

Mục tiêu dưới đây là **PROPOSED, NOT_MEASURED**:

| Chỉ số | Mục tiêu đầu | Đo/điều kiện |
| --- | --- | --- |
| Public HTML/API availability | 99,9%/30 ngày | Valid requests, timeout/5xx là lỗi; provider failure người dùng thấy vẫn tính lỗi |
| API read latency | p95 <500ms, p99 <1,5s | 100 reads/s trên workload đã chốt, tách DB/edge latency |
| First useful model | p75 ≤8s | Tier mobile ≤25MB, 20Mbps/80ms RTT; tính từ mở explore đến pick được |
| Viewer fluidity | p50 ≥30 FPS mobile, ≥50 desktop | Scene/clip/camera cụ thể trên thiết bị thật; ghi p95 frame time |
| HTML usability | LCP ≤2,5s, INP ≤200ms, CLS ≤0,1 | Mục tiêu sản phẩm; đo riêng trang đọc và viewer shell |
| Recovery | RPO ≤15 phút, RTO ≤4 giờ | Restore drill đầy đủ DB/assets/deletion tombstones |

Thu thập request count/status/duration, DB pool/saturation, worker lag/retries, storage/egress, asset load tier/errors/context loss; không anatomy query hay note. Error budget và burn-rate alert sau khi có baseline; alarm mẫu cho 5xx, expired license, publication withdrawal pending, backup fail và outbox age >5 phút. Lỗi telemetry không chặn người dùng đọc; lỗi audit bắt buộc làm mutation quan trọng fail closed.

## 7. Backup và phục hồi

DB PITR, daily snapshot theo retention được duyệt; Cloud Storage Object Versioning/soft delete và lifecycle đúng quyền license; cấu hình IaC trong Git, secret store có quy trình phục hồi riêng. Backup mã hóa và role restore riêng. Không backup rồi mặc định đã an toàn.

Cloud SQL automated backup/PITR phải bật và đo theo edition đã chọn; backup retention và PITR window là hai tham số riêng. PostgreSQL backup không chứa Firebase Auth identities: cần phương án export/recovery danh tính được phép, mã hóa, quyền hạn riêng và kiểm Firebase UID mapping. Không tự export password hashes hoặc credentials. Mất identity store là một kịch bản DR độc lập, có thể cần người dùng đăng nhập lại; phải thử trước launch. Khi xóa account, cả Firebase/SQL/Storage cần receipt; restore không được hồi sinh identity đã xóa.

Drill: tạo DB mới từ snapshot/PITR → migrate đúng version → kiểm integrity/references → replay deletion/revocation ledger → kiểm asset availability/rights → smoke public và cross-tenant negative tests → đo RTO/RPO → ký report. Production traffic chỉ chuyển sau readback. Thử trước launch và định kỳ đề xuất mỗi quý; owner chốt tần suất.

## 8. Runbook sự cố

| Sự cố | Hành động đầu | Phục hồi và xác nhận |
| --- | --- | --- |
| Sai nội dung/animation | Withdraw capability/revision, chặn public delivery | Chuyên gia sửa/duyệt; kiểm cache/direct URL; ghi phạm vi ảnh hưởng |
| License hết hạn | Ngừng cấp access, revoke manifest/version | License mới hoặc version hợp lệ; không tự bỏ attribution |
| Asset lỗi diện rộng | Tắt version qua gate, bật HTML fallback | Verify hash/delivery/decoder, canary version đã sửa |
| API/DB down | Degrade đọc khi an toàn, chặn ghi giả thành công | Restore connection/capacity; reconcile idempotency/outbox |
| Rò tenant/private data | Cô lập endpoint/credential/grant liên quan, giữ bằng chứng đã redaction | Security/privacy owner điều phối đánh giá và nghĩa vụ thông báo |
| Xóa account thất bại | Giữ lock/revoke, retry từng store có checkpoint | Không báo completed đến khi kiểm đủ; replay tombstones sau restore |

Không chạy destructive datafix hoặc secret access tự động trong runbook. Chỉ người có quyền vận hành theo incident approval được thực thi. Giao tiếp với người dùng/cơ quan bên ngoài do owner được giao phụ trách, không tự gửi.

## 9. Chi phí và duy trì

Budget sheet trước launch cần: traffic/tải model, egress/requests, storage tiers, GPU processing nếu có, Cloud Run/Load Balancer, Cloud SQL/backup, logs, Cloud Armor/DNS, Firebase Auth/Identity Platform theo tier, license theo người dùng/trường, công chuyên môn/biên tập và vận hành. Ghi giá tại ngày/region/hợp đồng, tỷ giá/thuế và mức dự phòng; hiện **chưa có tổng tiền**.

Cài cost alerts theo budget đã chốt, retention logs, lifecycle asset cũ theo giấy phép và scene references. Không xóa asset còn được pin chỉ để giảm bill. Quy trình hàng tháng kiểm metric/feedback/vulnerability; nội dung và license theo reviewDueAt; release luôn đánh giá lại dependencies hỗ trợ/security. Không đánh dấu production-ready chỉ vì build hoặc tài liệu hoàn tất.
