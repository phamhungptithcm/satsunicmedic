# HumanScope · satsunicmedic

Nền tảng khám phá giải phẫu, sinh lý và kiến thức bệnh học bằng mô hình tương tác trên web. Tên HumanScope là tên sản phẩm tạm; `satsunicmedic` là tên repository.

**Kiến trúc hiện hành: Firebase App Hosting + Firebase Authentication + Firestore, API NestJS trên Firebase Functions gen2 tại Singapore. Phát hành y khoa đầy đủ vẫn NOT_READY.**

[Quyết định chuyển Firebase](docs/implementation/firebase-migration-plan.md) · [Runbook Firebase](infra/firebase/README.md). Bằng chứng triển khai được ghi riêng; cấu hình không chứng minh dịch vụ đã chạy.

[Chạy và kiểm chứng](docs/implementation/runbook.md) · [Ngân sách production 650 USD, không staging](docs/implementation/budget-proposal.md) · [Trạng thái triển khai](docs/implementation/status.md).

Bộ tài liệu tiếng Việt: [Từ zero đến production](docs/README.md).

Thiết kế trực quan: [UI/UX & mô hình người 4D](docs/design/humanscope-v1/README.md) · [Trang xem thiết kế](docs/design/humanscope-v1/index.html). Hình AI là concept chưa kiểm duyệt, không phải model 3D/4D chạy thật.

- [Đặc tả sản phẩm](docs/01-product-spec.md)
- [Design system HunpeoLabs × Satsunic](docs/02-design-system.md)
- [System design](docs/03-system-design.md)
- [Dữ liệu và API](docs/04-data-api-spec.md)
- [Viewer 3D/4D và tài nguyên](docs/05-viewer-assets-spec.md)
- [Bảo mật, nội dung và dữ liệu](docs/06-security-content-governance.md)
- [Lộ trình triển khai và vận hành](docs/07-zero-to-production.md)
- [Kiểm thử và nghiệm thu](docs/08-validation-release.md)

Stack theo yêu cầu: Next.js App Router, React, TypeScript, Tailwind CSS, Zustand, TanStack Query; Three.js, React Three Fiber, Drei; NestJS, REST/OpenAPI; Firebase App Hosting, Firebase Authentication, Cloud Firestore và Firebase Functions gen2. Phương án PostgreSQL/Cloud SQL/VM trong tài liệu cũ đã được thay thế theo quyết định của owner; không dùng để triển khai mới.
