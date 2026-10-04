# Hoàn thiện nhóm ưu tiên local — HS-READINESS-COMPLETE-1

**Đã triển khai phân trang, tối ưu lịch ôn, export cá nhân có giới hạn, backend tiếp nhận/phản biện cộng tác cá nhân, gate discovery và đóng gói source tái tạo được. Chưa hoàn thành toàn bộ roadmap hoặc chứng nhận production.**

Owner đã duyệt tiếp tục từ review 2026-10-01, chọn chính sách khôi phục30ngày trước xóa và hai MVP Pro/community; sau đó ưu tiên phần tự xử lý tại local, để phần cần setup bên ngoài lại sau. Approval: `readiness-completion-approval.md`.

## Thay đổi đã thực hiện

| Phần | Kết quả |
| --- | --- |
| Notes/lessons/progress | API giữ trường items, thêm nextCursor; default100, cap100; thứ tự có document-ID tie-breaker. Cursor chỉ dùng điều hướng, luôn kiểm lại owner/scope/anchor. Anchor bị xóa trả409 và có đường tải lại. |
| UI ghi chú/bài giảng | Tải thêm, retry, giữ phần đã đọc khi tải tiếp thất bại; query và request cancellation gắn tài khoản. |
| Lịch ôn | Query theo dueAt trước limit; đọc metadata quiz theo batch, không giải mã payload câu hỏi. Có nextCursor cho cả trang lọc hết bài chưa public; giữ disclosure cho API cũ. Thêm composite index learningReviews(userId,schedule.dueAt). |
| Export cá nhân | POST yêu cầu session + CSRF + fresh same-user identity; whitelist fields, owner-check scenes; không xuất session token/hash, UID mapping hoặc idempotency fingerprint. UI đọc tất cả trang rồi mới tạo file, hủy/lỗi không tạo file một phần. |
| Giới hạn export | Tối đa10000 records/16MiB/500 pages ở client, tối đa8MiB scene payload mỗi lesson trên server. Vượt ngưỡng trả lỗi rõ ràng. Phạm vi là hồ sơ, notes, lessons/scenes, attempts/reviews; không tự nhận là export mọi dữ liệu provider/audit. Bộ sưu tập lớn cần export job riêng trước khi mở Pro quy mô lớn. |
| Release gate | Checker discovery riêng, kiểm candidate hashes, missing/stale/future/wrong-candidate receipts và deferral có owner evidence. Không sửa clinical/full-product gate thành PASS. Kết quả tốt nhất là READY_FOR_REVIEW, không tự cấp quyền deploy. |
| Source archive | Script whitelist build/test inputs; bỏ env, dependencies, local evidence, raw images; chỉ nhận GLB trong manifest đã khớp hash/size. Tar/gzip có metadata xác định, kiểm hash từng file và tái tạo byte-for-byte. Archive chứa snapshot WIP, không thay cho commit hoặc release certification. |
| Cộng tác cá nhân — backend | Draft/revision bất biến, consent đồng tác giả, submit/withdraw, phân công reviewer, quyết định có scope/hash/expiry; policy chống tự duyệt. Intake mặc định OFF, org bị từ chối rõ ràng, publication luôn OFF. Chưa có workspace web hoặc MVP tổ chức. |
| Cine auditor | requirements riêng pin pydicom3.0.1/numpy2.2.6, thêm CI job cho cine/ISA/preparation; không đổi runtime dependency web/API. |
| Browser regression | Harness local dùng Firebase emulator và synthetic accounts; kiểm account persistence, responsive widths, pagination/error recovery, account-change cleanup và keyboard focus. |

## Bằng chứng chạy mới

| Kiểm tra | Kết quả |
| --- | --- |
| Root TypeScript + full ESLint | PASS trong lượt tuần tự mới nhất; scoped lint các file sở hữu cũng PASS |
| Unit toàn working tree tại thời điểm chạy | **281/281,27 files PASS**, `vitest run --maxWorkers=1 --no-file-parallelism`; có tests từ các chat khác, không nhận toàn bộ là coverage mới của task này |
| Unit export + discovery gate | **10/10 PASS**: paging, failure without partial result, abort, repeated cursor, budgets, changed hashes, stale/future receipts, absent deferral |
| Firebase API integration | **36/36 PASS** trên emulator riêng8289/9299, project demo-humanscope; suite tự tắt sau kiểm tra. Không reset emulator chung |
| Community policy/API cuối | 25 unit +7 integration PASS; lượt7 integration chạy lại sau sửa cuối về duplicate author. Không gộp thành live/reviewer acceptance |
| Python audit/preparation | **20/20 +4/4 PASS** trong venv cô lập |
| Dependency audit production | pnpm audit --prod:0 advisories trong báo cáo registry lúc chạy; không phải kiểm tra security toàn diện |
| Optimized Next build | PASS trên bản source test cô lập, có các account routes; runtime local Node25.9, chưa phải Linux/Node24 deployment acceptance |
| Browser trên build cuối | **11 checks PASS**, Chromium; `output/playwright/readiness-completion/results.json`. 105 notes/reviews, error/retry giữ dữ liệu, account/profile/preferences/mobile/keyboard; không phải Google thật |
| Google popup/export trên provider thật | NOT_TESTED. Popup harness development emulator đã timeout; không gọi đó là PASS. Experiment CSP development đã được hoàn nguyên, production CSP không đổi |
| Archive | Xem `.ai/local/readiness-completion/candidate-reviewed/verification.json`; kiểm byte-for-byte, không chứa node_modules/env/.ai evidence |

Các lần không đạt được giữ rõ: test mới ban đầu chạm limiter120/phút vì cùng instance; sửa test isolation, không nới limiter. Lượt dùng emulator chung có3 timeout ở test dữ liệu lớn; chuyển sang emulator riêng và chạy lại thành công. Một lượt unit song song timeout test anatomy; chạy tuần tự đạt. Một lượt lint gặp file CI đang được chat khác ghi; đọc lại và full lint mới đạt. Browser có navigation timeout trong lúc máy/build bận; không cộng các lượt thất bại vào PASS. Thử nghiệm popup emulator chưa đạt và đã dừng hai server thử riêng.

## Ranh giới source và công việc đồng thời

HEAD vẫn `8a749e7881f8808473a7fc88a51ff81154aadd50`, app chủ yếu còn untracked. Không stage/commit/push/deploy. Các chat khác thay layout/header/full-body/scene-history/CI trong cùng working tree; task này giữ nguyên và ghi handoff tại `.ai/local/coordination/production-readiness-handoff.md`. Source archive chụp cả input tại thời điểm đóng gói; browser evidence giới hạn ở bản build cô lập và các luồng đã kiểm. Không coi toàn bộ WIP của mọi chat là một candidate đã nghiệm thu thống nhất.

Final source hash list cho file task đã chạm (workflow CI có phần đồng thời từ chat khác): `readiness-completion-evidence/source-hashes.json`. Lịch sử archive trước thay đổi cuối được giữ để đối chiếu, không dùng làm candidate cuối.

## Những việc còn lại — không gọi là đã hoàn thành

1. **Production account và rollout:** lần GET mới nhất vẫn `/tai-khoan`404 và `/api/v1/me/account`404; homepage200. Chat release có snapshot riêng và đang xử lý deployment. Task này không triển khai chồng. API mới phải đi sau index READY và trước web mới; live revision/readback/OAuth chưa được xác nhận.
2. **Xóa/khôi phục30ngày:** chính sách đã được owner chọn, nhưng endpoint/worker/UI kích hoạt chưa được triển khai. Shared content-addressed payloads cần cơ chế chống race trước physical purge; phương án scan rồi xóa có thể làm mất blob vừa được writer khác tham chiếu. Prototype chưa đăng ký đã bị loại trong review, không có dữ liệu bị xóa. Delta plan: `payload-deletion-delta-plan.md`; có trade-off transaction read/maintenance cần duyệt trước thay đổi shared persistence.
3. **Pro/Lemon:** chưa triển khai checkout/webhook/entitlements hoặc quyền lợi Pro; không chỉ thiếu API key. Giữ màn hình chưa mở bán. Thực hiện MVP và test-mode lifecycle trong scope tiếp theo; cấu hình store/variant/secret/activation do owner quyết định sau.
4. **Community:** backend intake cá nhân và assigned review đã có local evidence. Chưa có org/invitations, verification administration, reviewer inbox, workspace web, export/retention cho dữ liệu cộng đồng, promotion/attribution/public projection. Chi tiết `../community/private-intake-runbook.md`. Intake OFF và publication luôn OFF; không gọi là MVP hoàn chỉnh hay chỉ còn thiếu setup.
5. **Cine renderer:** source gate của hai sample cũ chưa đạt; audit tests không chứng minh source privacy/spatial identity hoặc renderer. Không publish/biến technical fixture thành medical approval.
6. **Vận hành:** real Google E2E, restore/rollback drill, live rate-limit/IP topology, alerts, load/cost, physical-device và screen-reader acceptance vẫn chưa kiểm. Không tự tạo tài nguyên trả phí hoặc chạy restore/purge production.

## Review cycles và quality gates

- Cycle1: triển khai pagination/query, giữ compatibility; sửa UI next-page error để không che dữ liệu đã tải; tách rate-limit window cho test, không thay production limit.
- Cycle2: export dùng whitelist thay blacklist; thêm abort/page/byte/record budgets và repeated-cursor rejection; metadata-only review query và owner/reauth negatives được kiểm. Khôi phục thông báo partial cho API cũ.
- Cycle4: triển khai backend cộng tác cá nhân trong MVP đã duyệt; sửa quyền đọc reviewer sau verification revoke, yêu cầu revision mới sau rejected review, lỗi duplicate author trả400. Full typecheck/lint/unit và36 integration đạt;7 integration cộng tác chạy lại sau sửa cuối. API build/OpenAPI regenerate đạt. Không sửa UI trong cycle này;11 browser checks trước đó không phải evidence cho community hoặc candidate API mới.
- Cycle3: review physical deletion tìm race shared-payload. Không ship collector không an toàn; bổ sung delta plan. Rà lại source hiện hành, chạy lại build/lint/unit/emulator/browser trong phạm vi, giữ giới hạn evidence và công việc đồng thời.

Compilation, local unit/integration/static checks: PASS trong phạm vi nêu trên. Security: kiểm owner/CSRF/reauth/session negatives ở emulator; chưa có comprehensive/live sign-off. Database: additive index, chưa deploy/index readiness; không backfill/purge. UX/product content: account/pagination rendered evidence và eight-principle mapping ở `readiness-completion-product-content.md`; enabled Google export dialog/live provider chưa đủ browser evidence. SEO/motion/medical content: không thay trong scope này. Full release/final review: **BLOCKED / NOT_READY** vì còn phạm vi chưa triển khai và bằng chứng bên ngoài thiếu; không gắn nhãn full end-to-end completed.

## Deploy/rollback sau khi được phép

Deploy composite index, chờ READY; deploy API/contracts; xác minh pagination/export negative tests trên đúng revision; deploy web. Old clients vẫn đọc items và bỏ qua nextCursor. Rollback web trước API; giữ dữ liệu/index additive. Không rollback bằng xóa collections hoặc tắt CSRF. Phối hợp với release owner để chọn snapshot mới, không thay snapshot họ đã freeze.

Repository intelligence sau refresh: kết quả cuối được lưu riêng; DEGRADED không bị biến thành READY. Runtime ledger CLI không có trên PATH, nên report/JSON là evidence thủ công, không giả lập runtime receipt. Token usage, actual billed cost và API-equivalent estimate: **Unavailable**. Memory candidates: **None**.

Final review JSON: `readiness-completion-evidence/final-review.json`. Source archive cuối: `.ai/local/readiness-completion/candidate-reviewed/source.tar.gz`,255 files, SHA-256 `0156e575dad76750922591760ecf489919ce4deca3edbb3b112dc785da8b2767`,57,418,277bytes. Byte-for-byte reproduction PASS; archive is NOT_RELEASE_CERTIFIED.


## Bổ sung sau private intake

Đợt cuối không đổi web UI, nên không chạy lại browser acceptance để gán nhầm evidence cho community. Source-hashes đã chụp lại phần code thay đổi. Bản archive `candidate-reviewed` nêu trên là snapshot trước private intake; snapshot mới nằm ở `.ai/local/readiness-completion/candidate-private-intake/`. Cả hai đều NOT_RELEASE_CERTIFIED. Các bản ghi emulators API là dữ liệu giả, không có hồ sơ bác sĩ/người bệnh thật. Server local do task tạo đã dừng, emulators riêng tự tắt sau mỗi lượt.

Đã gửi câu hỏi duyệt delta shared-storage maintenance barrier; chưa có câu trả lời tại lúc ghi. Việc này không phải yêu cầu setup provider. Pro và các phần cộng đồng nêu trên vẫn là việc cần triển khai, không được đánh dấu hoàn tất.

Snapshot private-intake:259 files,57,436,883bytes, SHA-256 `7fe11871f86d9770c7c06ba9c01c64d56c9ae82efca793149debbc5537d64c06`; kiểm archive manifest và tái tạo byte-for-byte PASS. Working tree tiếp tục đổi sau freeze tại apps/web/src/components/full-body-anatomy.tsx. Không gọi archive là toàn bộ working tree hiện tại hoặc certified release.
