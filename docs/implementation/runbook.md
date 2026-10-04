# Chạy bản foundation và xác minh trước phát hành

## Trạng thái

Source triển khai nằm trong `apps`, `packages`, `infra`, `tests`. Đây là foundation hoạt động local, **không phải bản production đã release**. Không seed model, reviewer, cơ sở y tế hay nội dung y khoa thật. Dữ liệu có chữ SYNTHETIC chỉ nằm trong database test tách biệt.

## Runtime đã kiểm tra

Node 24 LTS được chọn cho container/CI; phiên local ban đầu dùng Node 25.9, cần đọc evidence cuối để biết runtime từng check. pnpm 11.19.0, TypeScript 6.0.3 vì peer của Nest Swagger và typescript-eslint chưa nhận TS7. Next16.3.8/React19.3, R3F9.8.1/Drei10.7.9/Three0.186.1, Nest12.1.2, Prisma7.10.0 ổn định (không dùng dist-tag latest đang trỏ Prisma8 RC). Phiên bản chính xác nằm trong lockfile, `pnpm peers check` xác minh tương thích.

## Cài và chạy

1. Dùng Node24, cài pnpm11.19.0.
2. `pnpm install --frozen-lockfile`
3. `pnpm db:generate`
4. Chạy `docker compose -f infra/docker/compose.yaml up -d postgres` nếu Docker sẵn sàng. Local phiên này dùng PostgreSQL18.4 Homebrew trên cổng5442 vì Docker daemon không phản hồi; Docker Compose chưa được xác nhận chạy.
5. Export biến của `.env.example` vào terminal dành riêng cho dự án. Không copy biến này sang production. Script không tự load `.env`.
6. `pnpm db:migrate`
7. `firebase emulators:start --only auth --project demo-humanscope --config infra/firebase/firebase.json`. Phiên này dùng firebase-tools14.19.1, Auth9199, không dùng9099 vì cổng đó đã có dịch vụ khác.
8. `pnpm --filter @hs/contracts build`, rồi `pnpm dev`.
9. Web localhost4185, API localhost4186; gallery thiết kế trước đó vẫn ở4184.

Web hiện không có config Firebase public nên hộp đăng nhập đóng an toàn. Để thử UI đăng nhập ở dev, cấu hình `NEXT_PUBLIC_FIREBASE_API_KEY=demo-key`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-humanscope`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-humanscope.firebaseapp.com`, `NEXT_PUBLIC_FIREBASE_EMULATOR=true`. Chỉ dùng tài khoản synthetic trong Auth Emulator. Không đưa cờ emulator vào production.

## Kiểm thử

- `pnpm typecheck`: packages/apps và TypeScript của tests.
- `pnpm lint`
- `pnpm test`: contracts, state/history, quiz và security.
- Tạo database **humanscope_test** trên127.0.0.1:5442; migrate bằng TEST_DATABASE_URL tương ứng. Suite từ chối hostname/database khác để tránh nhầm production.
- `DATABASE_URL=postgresql://humanscope:local-only@127.0.0.1:5442/humanscope_test pnpm db:migrate`
- Auth Emulator9199 đang chạy: `pnpm test:integration`. Dữ liệu synthetic được giữ trong test DB riêng để inspect; không truncate database khác.
- `pnpm build`: Next dùng webpack do Turbopack không bind được IPC ở môi trường local. Đây là bundler được Next hỗ trợ, không thay stack sản phẩm.
- `pnpm openapi:generate`: sinh route inventory. Body/response schema coverage chưa đầy đủ; đây chưa phải generated API client hoàn chỉnh.
- `pnpm release:check`: hiện **phải fail NOT_READY**, chỉ preflight, không deploy.

## Đóng gói

Dockerfile.api đóng gói bằng `pnpm deploy --prod --legacy`; Prisma client custom-output được sinh từ schema rồi đưa vào package. Dockerfile.web sử dụng Next standalone. Hai Dockerfile chạy user node. Container image build, SBOM, scan và smoke bên trong Linux vẫn cần evidence riêng; build host không thay thế image verification.

Không có workflow deploy hoặc Terraform apply. CI chỉ có quyền đọc repo, kiểm tra local và emulator. Chưa chạy workflow trên GitHub. Cần review base image digest, service account, OIDC conditions, network/IAM/DB/CDN và ngân sách trước khi thêm production promotion.

## Giới hạn cần giải quyết trước production

- Anatomy GLB/mesh/clip, quyền thương mại, medical review, asset ingestion/scan/approval và delivery/CDN chưa có. `/assets/versions/:id/access` từ chối503; không phát URL giả.
- Article editorial API có state machine nhưng UI quản trị/reviewer onboarding chưa có; qualification của chuyên gia phải được owner xác minh trước cấp role.
- Quiz, facility và asset hiện không có giao diện xuất bản; fixture test không phải quy trình duyệt thật cho các domain này.
- Tạo/lưu scene, share/revoke và quiz/progress có backend; thao tác teaching đầy đủ, classroom/org authorization và presentation chưa hoàn chỉnh.
- Chưa có account export/deletion workflow, retention policy được owner chốt, outbox worker, audit coverage đầy đủ, distributed rate limiting hay live Firebase acceptance.
- Medical/asset checks phía client chưa có test GPU với asset thật. Không nhận generic GLB bất kỳ làm giải phẫu production; loader hiện chỉ nhận GLB tự chứa, chưa DRACO/KTX2 pipeline.
- English UI, screen-reader thực, 200% zoom, load/device benchmarks, restore drill, SLO/on-call chưa hoàn tất.
- CSP hiện chỉ cho same-origin model delivery; CDN origin cần chốt và kiểm tra trước mở.
- Owner duyệt production tối đa650USD/tháng, không tạo staging. Xem budget-proposal.md; billing account/domain/region và clinical evidence còn thiếu.

## Dừng môi trường local

Dừng đúng process/task terminal đang chạy. PostgreSQL dùng `.ai/local/postgres/data`; `pg_ctl -D .ai/local/postgres/data stop` chỉ sau khi không còn test/app của task dùng cluster. Không xóa volume hay tài nguyên cloud. Không thay đổi process đang dùng9099 hoặc database của dự án khác.
