# CICD-PROD-20261001 v1 — chờ duyệt triển khai

## Mục tiêu và bằng chứng

Khi commit được push/merge vào `main`, GitHub Actions kiểm tra đúng SHA, build artifact, deploy Firebase production, xác minh rollout rồi tạo tag và GitHub Release có release notes. Commit chỉ nằm trên máy không kích hoạt Actions.

Nguồn đã kiểm: `.github/workflows/verify.yml`, `package.json`, `firebase.json`, `infra/firebase/README.md`, `infra/firebase/cloudbuild-web.yaml`, `infra/firebase/package-functions.mjs`, `scripts/discovery-release-check.ts`, `scripts/release-check.mjs`, các hồ sơ discovery/readiness approval hiện hành.

HEAD quan sát: `8a749e7` (Initial commit). Phần lớn source, infra và workflow đang untracked; không tự stage toàn bộ WIP. Workflow hiện chỉ verify và source audits. Runtime hiện hành theo source là Firebase App Hosting backend `medic`, Functions codebase `medic`, Firestore tại project `satsunicmedic`; VM/PostgreSQL là đường triển khai cũ. Chưa xác minh IAM, WIF hoặc GitHub environment hiện hành.

Repository intelligence: gate trả DEGRADED, cả hai index stale dù health query passed. Đã thử refresh một lần với timeout 20 giây/tool; CodeGraph sync đi qua, CocoIndex refresh thất bại và helper báo TypeError khi render lỗi. Dùng bounded source reads ở trên và Git; không dùng index cũ để khẳng định đủ impact. Không cần thay đổi application/UI/schema cho phạm vi này. Profiles dự kiến: typescript-javascript, devops, infrastructure.

## Phạm vi và kế hoạch theo file

1. `.github/workflows/verify.yml`: giữ typecheck, lint, unit, Auth/Firestore emulator, build, OpenAPI drift và Python audits; cho workflow production tái sử dụng verification cùng SHA. PR không nhận cloud credentials.
2. `.github/workflows/release-production.yml` mới: trigger push main; verify → preflight release → build → deploy → smoke/readback → release. Khóa concurrency production, không hủy deployment đang chạy; kiểm SHA trước deploy để tránh deploy candidate đã lỗi thời. Chỉ job deploy có OIDC, chỉ job release có contents-write. Không phụ thuộc một workflow mới tự chạy do tag tạo bằng GITHUB_TOKEN.
3. `.github/release.yml` mới và `scripts/ci/release.mjs` mới: tag tự động `v<package-version>-build.<github-run-number>`, unique giữa các commit; rerun giữ nguyên version. Notes lấy thay đổi từ release production thành công trước, kèm SHA, run URL, artifact digest, kết quả smoke và giới hạn nghiệm thu. Không ghi claim clinical/live OAuth/restore khi chưa có bằng chứng. Tag chỉ tạo sau rollout thành công; tag có sẵn phải trỏ đúng SHA, không force-move. Nếu publish release lỗi sau deploy, cho phép retry metadata mà không deploy lại candidate khác.
4. `scripts/ci/deploy-production.mjs` mới, `infra/firebase/cloudbuild-web.yaml` và `infra/firebase/package-functions.mjs` nếu cần: build từ committed source allowlist, định danh image bằng SHA và deploy digest đã resolve. Package API trong thư mục sạch, giữ dependency/security overrides. Validate biến cấu hình bắt buộc trước mọi cloud mutation. Deploy rules/indexes nếu thay đổi, kiểm index readiness, Functions trước web; chờ từng rollout và kiểm lỗi thực tế. Không dùng --force, không xóa function/data, không chạy VM provisioning. Dependency resolution của artifact Functions phải có lock/audit evidence lưu cùng candidate.
5. `scripts/ci/smoke-production.mjs` và `tests/cicd-release.test.ts` mới: kiểm public readiness, route web, endpoint private trả unauthorized; kiểm revision/digest đúng candidate. Tests cho missing config, failed verify/build/deploy, stale SHA, wrong existing tag, duplicate rerun và release-note range. Không thao tác tài khoản thật hoặc dữ liệu production trong smoke.
6. `infra/firebase/README.md` và `docs/implementation/cicd-production-runbook.md`: khai báo repository variables, GitHub environment production, WIF/SA least privilege, cách bootstrap, vận hành, retry và rollback. Ghi review/check evidence sau triển khai theo quy trình repo.

## Bảo mật, release gate và tác động

Risk HIGH vì automation có quyền production và xuất bản release. WIF giới hạn repository, branch main và environment; dùng credential ngắn hạn, không JSON service-account key. Pin actions tới revision đã xác minh. Không đưa secret vào build context, artifact, logs hoặc notes. Giữ project/backend/codebase rõ ràng và resource caps hiện có.

Giữ discovery scope và các gate hiện hành; không biến full-product NOT_READY thành PASS. Required discovery checks gồm browser, dependency audit, asset rights và candidate hash/freshness. Bằng chứng thủ công thiếu/stale phải chặn deploy; deferral cũ không mặc nhiên áp dụng mọi release mới. Automatic deployment hoạt động khi các gate này đủ bằng chứng. Nếu cần thay đổi release policy để mọi push deploy vô điều kiện thì phải có delta plan, không bỏ gate âm thầm.

Không đổi API/schema/UI, runtime auth, payment, clinical publication hoặc dữ liệu. Cloud build/deploy có chi phí; dùng hạ tầng và giới hạn hiện hành. Chưa cấp mới IAM/WIF hoặc thay branch/environment protection trong giai đoạn viết code; runbook sẽ chỉ rõ cấu hình thiếu sau kiểm tra read-only.

## Failure, rollback và validation

Verify/build/preflight lỗi: không deploy, không tạo release. API thành công nhưng web lỗi: giữ web revision cũ, báo partial deploy cùng revision API; không công bố release thành công. Smoke lỗi: báo failure và hướng dẫn rollback web bằng digest trước, API bằng artifact/revision tương thích; không tự rollback dữ liệu hoặc rules mù quáng. Lưu deployment manifest trước/sau để người vận hành khôi phục.

Validation: workflow YAML/action lint, focused release/deploy tests với mock command runner, failure injection tại từng bước, full existing CI, kiểm clean-checkout build/package và secret exclusion. Sau approval và cấu hình cloud đủ: xác minh một run GitHub Actions trên SHA cụ thể cùng live readback; local tests không thay cho live evidence. Áp dụng code-quality profiles phù hợp TypeScript/Node và security sau kiểm source; chạy final-implementation-review với review → fix → verify → review lại.

## Quyết định cần duyệt

Duyệt CICD-PROD-20261001 v1 cho các file và hành vi trên, bao gồm automatic production deployment cho main sau gates và tag build theo package version. Việc commit/push candidate cần inventory WIP rõ ràng. Đây là kế hoạch, chưa sửa CI/CD, chưa tạo tag/release hoặc deploy. Implementation approval hiện hành của task khác không chứng minh approval cho toàn bộ cơ chế auto-deploy này.

Trạng thái: PLAN_READY / IMPLEMENTATION_AWAITING_APPROVAL. Chưa chạy test implementation vì chưa có implementation. Token usage và cost: Unavailable. Memory candidates: None.
