# Review phần còn thiếu và kế hoạch hoàn thiện

Ngày kiểm tra: 2026-10-01 America/Chicago. Task: HS-READINESS-20261001.

**Kết luận: NOT_READY để xác nhận toàn bộ working tree hiện tại là bản production đã nghiệm thu.** Website công khai có hoạt động, nhưng route tài khoản chưa xuất hiện trên production. Đây là review và kế hoạch; chưa sửa ứng dụng, commit, push hoặc deploy.

## Phạm vi và candidate

- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`. `git ls-files` chỉ có LICENSE và README.md. Ứng dụng, tests, infra và workflow hiện là untracked WIP; HEAD không định danh được candidate đang review.
- Source manifest riêng: `readiness-review-2026-10-01/source-hashes.json`. Không đưa credentials, raw images hoặc dữ liệu người dùng vào manifest.
- Đối chiếu manifest `.ai/local/discovery-release/candidate.json`: 193 file, không thiếu file, chỉ `apps/web/next-env.d.ts` khác hash. Đây là đối chiếu candidate local, không chứng minh candidate đã deploy.
- Intelligence: refresh một lần; CodeGraph current/healthy, CocoIndex vẫn stale/unhealthy. Kết quả DEGRADED. Đã query `trafficLimit`, `LearningController`; dùng source, rg, compiler và tests để kiểm tra kết luận.
- Stack từ manifest: TypeScript 6.0.3, Next 16.3.8/React 19.3, Nest 12, Firebase Auth/Firestore/Functions, App Hosting; runtime local Node 25.9.0, CI/production cấu hình Node 24. Không coi hai runtime tương đương khi chưa build candidate.
- Áp dụng repository-intelligence, code-review, code-quality-review và final-implementation-review. Profiles đọc: universal, typescript-javascript, api. Review có giới hạn; không phải chứng nhận toàn bộ security, UX hay thiết bị.

## Phát hiện đã xác minh

| ID | Mức độ/phạm vi | Bằng chứng | Tác động và việc cần làm |
| --- | --- | --- | --- |
| R1 | High — release | Git chỉ theo dõi 2 file; phần ứng dụng và CI untracked | Fresh checkout không tái tạo được app. Inventory WIP, xác nhận phạm vi, freeze hash manifest, chọn file có chủ đích, kiểm tra secrets/license, tạo candidate có thể build lại. Không `git add .` mù quáng. |
| R2 | High — tính năng account trên production | GET production `/tai-khoan` =404; local `apps/web/src/app/tai-khoan/page.tsx` render AccountPage | Account mới chưa được phục vụ ở URL production đã kiểm tra. Xác minh revision/image thực và release API/web tương thích sau nghiệm thu. Không suy ra nguyên nhân cụ thể chỉ từ 404. |
| R3 | Medium — dữ liệu cá nhân | `apps/api/src/private.ts:18,34` trả tối đa100 notes/lessons; `apps/api/src/learning.ts:44` tối đa100 attempts; không cursor/truncated | Mục cũ không truy xuất được qua các danh sách này khi vượt100, dù có thể vẫn còn trong DB. Thêm cursor ổn định và UI tải thêm; test 101+ mục, owner isolation, concurrent inserts. |
| R4 | Medium — hàng đợi ôn tập | `apps/api/src/learning.ts:33-41` lấy100 record đầu rồi mới lọc/sort dueAt, đọc quiz tuần tự | Bài đến hạn ngoài cửa sổ không xuất hiện; có `truncated` nên không phải lỗi che giấu truncation. Cần query/projection và pagination theo lịch, giữ publication check, giảm N+1 reads trước khi mở rộng. |
| R5 | Medium — độ tái tạo kiểm thử | `python3 -m unittest discover -s tests -p 'test_*audit.py'` thiếu pydicom; workflow Verify chỉ chạy TS | Cine auditor không được kiểm lại bởi môi trường Python mặc định/CI hiện tại. Tạo môi trường pinned và job riêng trước khi nhận source cine; không kết luận auditor sai từ lỗi môi trường. |
| R6 | Medium — release evidence | `scripts/release-check.mjs` đọc JSON foundation/full-product; status.md và docs/08 vẫn có trạng thái cũ | Gate hiện trả NOT_READY đúng với full-product nhưng chưa đánh giá riêng discovery hoặc xác nhận hash/live revision. Thêm gate discovery theo scope, freshness, candidate hash và deferred checks; giữ nguyên yêu cầu clinical khi áp dụng. |

Chưa thấy critical exploit được chứng minh trong phạm vi này. Không đồng nghĩa hệ thống không có lỗ hổng.

## Những phần chưa hoàn thành

| Hạng mục | Trạng thái được chứng minh | Công việc còn lại |
| --- | --- | --- |
| Discovery giải phẫu, sinh lý bệnh, tiếng Anh y khoa | Có source và unit tests; production homepage/learning trả200 | Browser acceptance trên candidate cuối, asset/network/error/retry, keyboard/reduced motion, iOS/Android GPU, kiểm tra phạm vi asset thực trên live |
| Account/profile/preferences/session | Local source + emulator có triển khai; production route404 | Browser workflow hiện hành, Google thật, reload/persistence, logout/revoke-all; xác nhận và rollout candidate tương thích |
| Learning reviews | Scheduler/API/tests đã có; báo cáo foundation còn thiếu UI acceptance | Browser trạng thái empty/error/account-switch/retry, phân trang và tối ưu truy vấn; liên kết bài tập preview với quiz revision được xuất bản nếu muốn lưu tiến độ |
| Notes/lessons/scenes/share | Backend đã có create/update/share/revoke | Hoàn thiện vòng đời người dùng trên UI và pagination; không gọi toàn bộ feature đã hoàn chỉnh chỉ vì endpoint tồn tại |
| Export/xóa tài khoản | UI chủ động disabled ở account-page.tsx:39; không có API tương ứng trong controllers đã đọc | Export job/download giới hạn, reauthentication, deletion workflow có checkpoint/idempotency, xử lý sessions/shares/audit/retention; cần plan riêng vì tác động dữ liệu |
| Pro 19.99 USD/năm / Lemon | Mới có đề xuất và màn hình chưa mở bán | Chốt quyền lợi/quota; checkout/webhook signature, duplicate/out-of-order events, entitlement server-side, portal/refund/expiry; test mode trước live |
| Cộng tác y khoa / tổ chức | Có design + implementation plan chờ duyệt, chưa có module community | Intake, ownership/org scope, invitation, verification, assigned review/COI, publication và public attribution; chưa mở nhận dữ liệu bệnh nhân |
| Cine/DICOM/4D từ dữ liệu ảnh | Có auditor; hai source samples trước bị từ chối, chưa có renderer tích hợp | Xác minh spatial reference, pixel privacy, contour/time mapping; chỉ tiếp tục contract/viewer khi source gate đạt. Không bypass gate để có demo |
| Vận hành | Có deployment/runbook/backup schedule được ghi trong hồ sơ trước | Live Google E2E, restore vào môi trường cô lập, rollback drill, alerts/SLO, tải và chi phí; chưa có bằng chứng mới cho các gate này |
| Domain/ads | Đã được hoãn theo hồ sơ discovery | Không phải điều kiện cần cho discovery; chỉ triển khai khi scope thương mại tương ứng được chốt |

Medical certification không phải yêu cầu cho discovery theo `discovery-release-plan.md`. Quyền sử dụng asset, privacy, auth và mô tả trung thực vẫn phải giữ. Không dùng thiếu clinical sign-off để tự động chặn mọi release discovery; cũng không coi deferral là PASS.

## Các rủi ro cần kiểm chứng, chưa phải lỗi live đã xác nhận

- `trafficLimit()` dùng Map trong process, keyed bằng `req.ip`, 120 requests/phút; chưa xác minh client-IP qua App Hosting/Functions, nhiều user chung NAT, reset instance và burst. Không tự bật trust-proxy tổng quát. Cần test đúng topology trước thay đổi.
- Publication cập nhật pointer article mà chưa có expected basePublishedRevisionId; cần chốt chính sách publish bản cũ và regression concurrency trước khi mở community. Chưa gọi đây là sự cố mất dữ liệu production.
- Search có budget1024 và trả503 khi chưa chứng minh hết dữ liệu; payload chunks orphan chưa có GC, objectKey uniqueness cần chốt trước importer. Đây là giới hạn quy mô/ingestion có ghi trong runbook, không yêu cầu xóa dữ liệu ngay.
- Restore/rollback/load/a11y/device/paid provider chưa được chạy trong lượt này. HTTP200 không xác minh UI, WebGL hoặc auth flow.

## Kiểm tra chạy trong lượt này

| Kiểm tra | Kết quả và giới hạn |
| --- | --- |
| `node_modules/.bin/vitest run` | PASS 22 files,218 tests |
| `node_modules/.bin/vitest run --config vitest.integration.config.ts` | PASS26 tests với Auth/Firestore emulator local demo-humanscope; lần đầu EPERM loopback, retry có quyền thành công; không phải live Firebase |
| `node_modules/.bin/eslint apps packages tests` | PASS |
| Root `tsc --noEmit` | PASS; báo cáo account cũ ghi fail đã lỗi thời |
| API,web,contracts,anatomy-viewer,api-client `tsc --noEmit` | PASS bằng compiler local; chưa thay cho production build Node24 |
| Python audit discovery | 5 ISA tests chạy qua; cine module import FAILED vì thiếu pydicom. Không có PASS cine hiện hành |
| `node scripts/release-check.mjs` | NOT_READY: asset/medical reviewer, live account E2E, restore, full-product acceptance; dùng scope full-product cũ |
| Live GET không cookie | `/`200, `/hoc-tap`200, `/tai-khoan`404, `/api/v1/health/ready`200, `/api/v1/me`401, unknown asset404 |
| Clean production build, dependency advisory scan, browser E2E, device, Google thật, recovery/load | NOT_RUN; cần candidate freeze và môi trường phù hợp, không tái dùng PASS của các snapshot cũ |

Production URL đã đọc: `https://medic--satsunicmedic.asia-southeast1.hosted.app`. Chỉ GET public, không gửi cookie, không sửa dữ liệu hoặc cấu hình cloud. Live revision chưa xác minh.

## Kế hoạch cụ thể để làm tiếp

### Đợt A — hoàn thiện bản discovery hiện có (khuyến nghị làm trước)

1. Release evidence: `scripts/release-check.mjs` hoặc checker discovery mới, `docs/implementation/status.md`, release manifest và `.github/workflows/verify.yml` khi cần. Phân biệt discovery/full-product; validate hash/freshness và required checks. Test missing/stale/hash mismatch/deferred scope. Candidate chỉ gồm file được inventory; Node24 clean build, generated OpenAPI drift, dependency scan và Python environment nếu đưa auditor vào scope.
2. Pagination: `apps/api/src/private.ts` notes/lessons, `learning.ts` progress/reviews, contracts DTO, `explorer.tsx`, `learning-reviews.tsx`, `packages/api-client/src/index.ts` nếu consumer cần helper. API additive `items,nextCursor`, page size cap, stable tie-breaker và cursor gắn owner/query; current authorization không đổi. Thêm regression101+ records, cross-owner cursor, invalid cursor, duplicate/skip và pending/error/retry UI.
3. Learning query: sửa `LearningController.reviews`, projection/index trong `infra/firebase/firestore.indexes.json` nếu query cần; tránh decode toàn bộ question payload chỉ để lấy metadata. Không đổi thuật toán lịch hoặc regrade lịch sử. Review migration/backfill riêng nếu cần.
4. Account + learning acceptance: browser test suite mới dưới `tests/e2e/` hoặc harness hiện hữu đã xác minh; chỉ sửa lỗi được tái hiện tại components account, learning, login. Kiểm profile/preferences, phiên hết hạn, save conflict, account-switch race, popup cancel, logout/revoke-all, mobile/keyboard/reduced-motion. Hoàn thành product-content review đúng trạng thái hiện hành.
5. Operations evidence: runbook Firebase + scripts kiểm tra candidate. Đo IP/rate-limit topology, public/private negative tests, alert test và recovery drill có scope riêng. Restore không ghi đè production. Thiếu Google tài khoản thử hoặc cloud quyền phù hợp thì ghi BLOCKED chính xác.
6. Review lại sau sửa; build/freeze candidate; nếu được phép phát hành thì API trước web, readback image/revision, route account, asset checksum và auth flow; rollback về candidate đã kiểm. Deployment là bước riêng, chưa thực hiện hoặc xin quyền trong review này.

Impact: thay đổi additive API/UI và có thể Firestore index; không thay provider, không xóa/backfill dữ liệu tự động, không bật clinical/cine/paid features. Giữ entitlement Free hiện hành. API additive triển khai trước web; rollback web trước, giữ dữ liệu mới. Delta plan nếu cần schema/backfill hoặc thay đổi đáng kể ngoài phạm vi trên.

### Đợt B — quyền dữ liệu cá nhân

Plan riêng cho export/deletion: account contracts, controllers/jobs, storage grants, UI và retention/audit. Tiêu chí: recent auth, ownership, signed download expiry, replay/retry/recovery, thu hồi sessions/shares và không ảnh hưởng user khác. Không bắt đầu deletion code từ một nút disabled mà thiếu chính sách retention.

### Đợt C — thương mại và cộng đồng

Triển khai hai plan hiện có thành scope độc lập: `subscription-lemon-plan.md`, `docs/community/implementation-plan.md`. Chốt quyền lợi Pro và ownership/reviewer policy trước khi mở bán/intake. Không trộn payment/community/cine vào việc ổn định discovery.

### Đợt D — cine nâng cao

Theo `medical-cine-status.md`: xử lý source prerequisite trước, sau đó contract/rendering và kiểm chứng privacy/device. Không có thời hạn hoàn thành đáng tin khi source gate chưa đạt.

## Final review và handoff

- Cycle1: kiểm nguồn/status/test; tìm R1–R6 và các phần chưa xây. Không sửa protected code vì đây là review trước approved implementation plan.
- Cycle2: đối chiếu trực tiếp route production, candidate hashes và kết quả chạy mới. Loại bỏ kết luận cũ rằng root typecheck còn fail; tách clinical khỏi discovery. R1–R6 chưa đóng; production acceptance vẫn BLOCKED/NOT_READY.
- Requirement review/inventory/plan đã được cung cấp; phần implementation và nghiệm thu production chưa làm. Không đưa phần trăm hoàn thành toàn sản phẩm vì chưa có backlog/weights được chốt.
- Quality: compilation/unit/emulator/lint PASS trong phạm vi trên; security toàn diện, visual/a11y, migration/recovery/load và release candidate build NOT_RUN. Product Language Gate cho thay đổi ứng dụng lượt này NOT_APPLICABLE vì không đổi UI; gate UI của các tính năng hiện hữu vẫn cần làm.
- Runtime ledger CLI `ai-agent-kit` không có trên PATH; đây là báo cáo thủ công kèm review JSON, không giả lập runtime receipt. Token usage, actual billed cost, API-equivalent cost: Unavailable. Memory candidates: None.

Trước khi sửa code đợt A, cần owner duyệt kế hoạch này theo `.ai/workflows/plan-existing-system-change.md`: “Stop and request developer-team approval.” Review request hiện tại chưa phải approval của plan vừa lập. Không xin duyệt lại các hành động read-only hoặc kết quả đã được kiểm tra.
