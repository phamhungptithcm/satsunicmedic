# HS-BUDGET-3 — Production tối đa 650 USD, không staging

Ngày cập nhật: 2026-09-30. Trạng thái: **OWNER_APPROVED_PRODUCTION_BUDGET / CLOUD_NOT_PROVISIONED**.

Owner xác nhận ngân sách “chỉ duy tri production max 650$ only staging miễn phí”, sau đó chốt “không cần staging chỉ cần production”. Áp dụng **tối đa 650 USD/tháng cho production**, **không tạo staging**. Đây là giới hạn được phép vận hành, không phải bảo đảm kỹ thuật nhà cung cấp sẽ chặn hóa đơn ở đúng 650 USD. Chưa có billing account được chỉ định; chưa tạo tài nguyên trả phí.

Production cơ sở dự kiến **441,39 USD/tháng** trước thuế. Khoảng còn lại **208,61 USD** dành cho biến động, thuế và dự phòng; không dùng hết phần này để mở thêm tài nguyên. Không mua license hoặc thuê reviewer bằng ngân sách này. Tổng trước thuế cộng dự phòng 20% là **529,67 USD**; phải xác minh thuế/billing để tổng vẫn nằm trong 650 USD trước apply.

Chỉ kiểm thử local PostgreSQL + Firebase Auth Emulator; đây không phải môi trường staging. CI chỉ chạy trong quota miễn phí đã xác minh. Không tạo Cloud SQL, Cloud Run, load balancer, bucket hoặc project staging có phí. Khi CI vượt quota miễn phí, chạy local hoặc chờ quota; không tự mua phút build. Điện/thiết bị local sẵn có không được tính là hóa đơn cloud staging.

> Cập nhật yêu cầu tối ưu: [HS-ECON-1](cost-and-monetization.md) đề xuất cấu hình nhỏ hơn với mục tiêu160USD zonal hoặc250USD HA. Bảng dưới là baseline trước tối ưu, không phải mục tiêu phải chi. Owner đã chọn zonal160USD và chấp nhận downtime; chưa tạo tài nguyên cloud.

## Cấu hình dùng để tính

- Region đề xuất: Singapore `asia-southeast1`, cần owner xác nhận phù hợp residency. Không suy ra quyền lưu dữ liệu y tế tại đây từ ngôn ngữ người dùng.
- Production: project `satsunicmedic`; Next.js và NestJS trên Cloud Run, Firebase Auth; Cloud SQL PostgreSQL Enterprise General Purpose **regional HA, 2 vCPU/8 GiB, SSD 50 GiB**. Cloud Storage, global Application Load Balancer, Cloud Armor Standard, Cloud CDN; giữ private IP database và Direct VPC egress như system design.
- Không staging. Kiểm thử local/emulator dùng database và danh tính synthetic tách khỏi production.
- Workload giả định để lập kế hoạch, chưa đo tải: 1.000 MAU; production 2 triệu request qua WAF/tháng; CDN 200 GiB/tháng tại APAC, cache fill 20 GiB. Không phone/SMS, SAML, AI inference hoặc Armor Enterprise.
- 730 giờ/tháng, USD, giá on-demand; không trừ trial credit/CUD. CPU/RAM sizing cần kiểm tra tải và pool trước release; không phải cam kết năng lực hoặc SLA của ứng dụng.

## Chi phí tháng theo kịch bản cơ sở

**U**: phép tính theo đơn giá đã đọc trực tiếp; **A**: khoản dự trù kỹ thuật, chưa phải SKU quote. Số tiền làm tròn đến cent. Backup là dung lượng trung bình thực lưu, không bằng số lần backup × kích thước database.

| Hạng mục production | USD/tháng | Cơ sở |
|---|---:|---|
| SQL CPU + RAM HA | 283,24 | U: `(2×0,1156 + 8×0,0196)×730` |
| SQL SSD HA 50 GiB | 23,80 | U: `50×0,000652055×730` |
| SQL backup/PITR trung bình 100 GiB | 11,20 | U: `100×0,000153425×730`; cần đo WAL |
| Load balancer | 18,25 | U: nhóm đầu tối đa 5 forwarding rules × 0,025 USD/giờ |
| Cloud Armor Standard | 11,50 | U: 1 policy 5 USD + tổng 5 rules 5 USD + 2 triệu request 1,50 USD |
| Cloud Run web/API/jobs | 40,00 | A: chưa có CPU/GiB-seconds đo tải; không giả định free tier |
| CDN delivery và fill | 18,40 | U: 200 GiB APAC × 0,09 + 20 GiB fill × 0,02 |
| Network khác/cache lookups | 15,00 | A: LB processing, dynamic egress, requests, cross-zone |
| GCS/versioning/operations | 5,00 | A: khoảng 100 GiB; phụ thuộc asset thật |
| Logs/metrics/traces | 10,00 | A: retention/sampling cần chốt |
| Build/registry/secrets/DNS | 5,00 | A: không bao gồm mua domain |
| Firebase Auth | 0,00 | U có điều kiện: auth thông thường, MAU thấp, không SMS/SAML |
| **Cơ sở production** | **441,39** | Chưa thuế |
| **Dự phòng 20%** | **88,28** | Tổng kế hoạch 529,67 |
| **Khoảng còn lại tới giới hạn** | **120,33** | Thuế/chênh lệch; không tự mở scope |
| **Giới hạn owner duyệt** | **650,00** | Production only |
| **Cloud staging** | **0,00** | Local/emulator, không dịch vụ trả phí |

## Ảnh hưởng tới kế hoạch release

Quyết định mới thay yêu cầu staging GCP thường trực trong system design. Giữ Next/Nest/PostgreSQL/Prisma, Firebase Auth và toàn bộ thành phần production. Local/emulator không chứng minh IAM, live Firebase, private networking, CDN, restore hay rollback trên Google Cloud.

Trước mở traffic công khai, cần kiểm tra candidate ngay trên tài nguyên production dự kiến: revision chưa nhận traffic, IAM hạn chế, fixture synthetic riêng có cleanup được review, migration/backup/restore và rollback. Mọi chi phí kiểm tra thuộc production và nằm trong 650 USD; không dựng một môi trường staging trả phí dưới tên khác. Phép kiểm tra cần tài nguyên thứ hai có phí phải được owner duyệt riêng hoặc thiết kế lại trước khi chạy. Không miễn acceptance chỉ vì staging miễn phí.

## Độ nhạy và các khoản chưa tính

- Thêm 1 TiB CDN tại APAC trong bậc đầu: khoảng **92,16 USD delivery**, chưa fill/requests. 200 GiB chỉ tương đương khoảng 4.096 lượt tải asset 50 MiB đầy đủ; cache CDN không xóa phí truyền đến người dùng.
- Tăng HA database lên 4 vCPU/16 GiB: thêm **283,24 USD/tháng** compute. Read replica/cross-region DR là phạm vi ngân sách mới.
- Cloud Run có free tier nhưng dùng chung theo billing account; khoản A phải thay bằng CPU-seconds, GiB-seconds, request và min-instance đã đo trước khi apply production.
- **Chưa bao gồm** mua/thuê bộ mô hình giải phẫu, chuyên gia duyệt nội dung, lao động phát triển/vận hành, domain, email bên thứ ba, paid support, thuế và tỷ giá. Các khoản này chưa có báo giá, không phải 0 USD. Owner xác nhận chưa có asset/reviewer; duyệt cloud budget không giải quyết các đầu vào đó.

## Kiểm soát chi phí trước khi tạo tài nguyên

- Xác nhận billing account ID; budget production, cảnh báo 50/80/90/100% và forecast; người nhận cảnh báo phải được chỉ định.
- Không dùng hierarchical Armor policy/Enterprise, CUD, replica hoặc NAT/VPC connector trả phí nếu chưa có delta dự toán. Dùng Direct VPC theo kiến trúc; giữ ingress chỉ từ LB và IAM tối thiểu.
- Cloud Run max instances, concurrency và SQL pool được chốt sau load test; lifecycle image/assets, retention logs và limit dung lượng auto-grow được review. Đây là kế hoạch, chưa có cấu hình cloud được áp dụng.
- Alerts-only budgets **không chặn chi tiêu**. Spend cap budgets hiện là Preview cho dịch vụ đủ điều kiện (có Cloud Run), không dừng phí compute/storage cố định; có độ trễ và vẫn có thể phát sinh vượt. Không coi đây là hard cap toàn stack hoặc tự tắt billing/xóa DB khi chạm ngưỡng.
- 80%: xem forecast, dừng tác vụ batch chưa cần; 90%: yêu cầu quyết định owner trước mở tải/scale thêm. Giữ dữ liệu/backup, không tự destructive cleanup để tiết kiệm.

## Quyền đã có và đầu vào còn thiếu

Ngân sách production 650 USD và không staging **đã được owner duyệt**, không xin duyệt lại. Region Singapore vẫn là đề xuất cần xác nhận phù hợp residency. Còn thiếu billing account ID được phép dùng, domain và người nhận cảnh báo. Không yêu cầu staging project nữa.

Sau khi xác minh các đầu vào trên, chỉ chuẩn bị/apply tài nguyên production theo estimate và plan được review. Ngân sách không thay thế asset được cấp phép, reviewer y khoa, các chức năng còn thiếu, live acceptance hoặc release gates. [Dự toán v2](budget-proposal-v2.md) chỉ giữ làm lịch sử, không được dùng để cấp cloud staging.

## Nguồn và giới hạn xác minh

Đọc ngày 2026-09-30; SQL được chọn **Singapore** trong UI chính thức (không dùng giá mặc định Iowa). Đơn giá có thể thay đổi trước ngày apply. Các dòng A là allowance do dự án đề xuất; cần calculator export/SKU review và workload measurement trước promotion.

- [Cloud SQL pricing](https://cloud.google.com/sql/pricing): Enterprise General Purpose PostgreSQL, compute HA/zonal, SSD và backup; evidence `evidence/sql-singapore-pricing.json`.
- [Load Balancing pricing](https://cloud.google.com/load-balancing/pricing).
- [Cloud Armor pricing](https://cloud.google.com/armor/pricing).
- [Cloud CDN pricing](https://cloud.google.com/cdn/pricing).
- [Cloud Run pricing](https://cloud.google.com/run/pricing).
- [Firebase pricing](https://firebase.google.com/pricing).
- [Spend cap budgets và giới hạn](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps).

Review ngân sách: công thức và tổng được tính lại bằng script; nguồn U kiểm tra chính thức; không thay stack, không tạo tài nguyên. Decision tổng thể vẫn **NOT_READY**; ngân sách được duyệt không chứng nhận production.
