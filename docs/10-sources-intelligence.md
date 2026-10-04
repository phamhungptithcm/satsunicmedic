# Nguồn và Repository Intelligence Brief

Ngày kiểm tra: 30/09/2026. Scope: viết tài liệu từ yêu cầu, không implementation. Các nguồn web được đọc trong phiên này; không có kiểm tra hợp đồng thương mại hoặc luật áp dụng.

## 1. Đầu vào và bằng chứng local

- Brief “Bạn là một nhóm thiết kế và phát triển sản phẩm…” người dùng đính kèm: trải nghiệm, mô hình thật, nội dung, năm luồng, nghiệm thu. Không sao chép toàn bộ attachment vào repo.
- Brief “CẬP NHẬT BẮT BUỘC VỀ CÔNG NGHỆ VÀ KIẾN TRÚC”: React/Node/TypeScript, Next/Nest, PostgreSQL/Prisma và testing; phần AWS trong brief đã bị yêu cầu Google Cloud/Firebase thay thế.
- Yêu cầu sau đó: đồng bộ style HunpeoLabs/SatsunicSEO; viết document từ zero đến production, system design, spec; sau đó chuyển nền tảng sang Google Cloud + Firebase.
- `../HunpeoLabs/styles/tokens.css`: màu/trục spacing/radius hiện có; chỉ đọc, không sửa.
- `../Satsunic/docs/design/satsunic-ui-contract-v1.md`: CANONICAL contract, white/blue/navy, copy và interaction; chỉ dùng làm nguồn phong cách, không claim đã mở/verify runtime Satsunic.
- `AGENTS.md`, repository intelligence workflow/gate, context map/build placeholders, output/quality/completion/memory rules và product-language skill được đọc.

## 2. Gate và phạm vi khảo sát

`python3 .ai/scripts/check-repository-intelligence.py` trả **DEGRADED**: CodeGraph/CocoIndex installed nhưng project index missing, health failed; indexed commit unknown. Không có stale index để refresh. Fallback: `rg --files` bao gồm hidden với loại trừ governance, Git status/log, đọc README và policies. Không cài công cụ hoặc index lại chỉ để viết tài liệu repo chưa có app.

Git HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`, Initial commit. Repo trước công việc chưa có app source, package manifest, tests, database hay infra. Governance directories untracked có sẵn; không xóa, commit hoặc chỉnh chúng. Tài liệu mới ở `docs/`, README được mở rộng.

Mức tin cậy: đủ để mô tả điểm xuất phát và viết kiến trúc đề xuất; không có bằng chứng ứng dụng, consumer/caller/runtime/deploy để xác nhận implementation hoặc production.

## 3. Nguồn kỹ thuật chính thức đã tra

| Nguồn | Dùng cho | Giới hạn |
| --- | --- | --- |
| [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Self-hosted web/cache đa instance | Chưa chọn/pin Next version, chưa chạy cache test |
| [React Three Fiber repository](https://github.com/pmndrs/react-three-fiber) | R3F/React major compatibility, render integration | URL docs riêng lỗi truy xuất; đã dùng README upstream; peer matrix exact chưa kiểm |
| [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) | Hướng OpenAPI và client generation | Chưa tạo OpenAPI artifact |
| [Prisma transactions](https://www.prisma.io/docs/orm/fundamentals/transactions) | Transaction design và concurrency review | Chưa có schema/runtime test |
| [Cloud CDN signed URLs](https://docs.cloud.google.com/cdn/docs/using-signed-urls) | Asset delivery, signed/unsigned và origin IAM | Chưa có bucket/CDN, cần negative test cold/warm cache |
| [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies) | Auth exchange, revocation check, server cookie | Chưa cấu hình provider/MFA hoặc thử phiên thật |
| [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security) | Client Rules và giới hạn khác với IAM/server access | Chưa triển khai rules hoặc IAM |
| [Cloud SQL từ Cloud Run](https://docs.cloud.google.com/sql/docs/postgres/connect-run) | Private IP/VPC và kết nối backend | Chưa kiểm Prisma/TLS/pool/failover thực tế |
| [Cloud Run ingress](https://docs.cloud.google.com/run/docs/securing/ingress) | Load-balancer ingress và direct URL restriction | Chưa có load balancer/service policy |
| [Cloud Run scheduled execution](https://docs.cloud.google.com/run/docs/triggering/using-scheduler) | Worker jobs có lịch và IAM identity | Chưa có scheduler/job/lease test |
| [Workload Identity Federation cho CI](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) | GitHub Actions truy cập không JSON private key | Chưa tạo federation/IAM binding |
| [Firebase Hosting + Cloud Run](https://firebase.google.com/docs/hosting/cloud-run) | Đã khảo sát phương án routing thay thế | V1 chọn Cloud Run qua Google load balancer; chưa dùng Hosting/App Hosting |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Mục tiêu accessibility và kiểm tra | Không có chứng nhận/PASS UI |
| [BioDigital](https://www.biodigital.com/) | Candidate hosted anatomy platform | Không xác minh quyền cụ thể/giá/API contract |
| [Z-Anatomy models](https://github.com/Z-Anatomy/Models-of-human-anatomy) | Candidate bộ mô hình công khai | Không license audit từng file hoặc benchmark |

Các số SLO, payload limits, retention, traffic, breakpoints, cost workload và rollout thresholds là **đề xuất của tài liệu**, không phải số đo hoặc lời khuyên từ nhà cung cấp. Cần owner duyệt và kiểm chứng. Không trích nội dung y khoa hay kết luận pháp lý từ các nguồn kỹ thuật này.
