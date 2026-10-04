> HISTORICAL / SUPERSEDED: owner chỉ duyệt production tối đa 650 USD; staging miễn phí. Xem budget-proposal.md.

# HS-BUDGET-2 — Ngân sách Google Cloud + Firebase cần duyệt

Ngày lập: 2026-09-30. Trạng thái: **PROPOSED / chưa được phép chi**.

Owner đã chọn giữ kiến trúc đầy đủ. Đề xuất **650 USD/tháng**, gồm production luôn hoạt động, staging có lịch và khoảng 20% dự phòng. Nếu staging cần hoạt động 24/7, đề xuất **800 USD/tháng**. Đây là ngân sách vận hành dự kiến, không phải báo giá cố định hoặc bảo đảm chặn hóa đơn ở đúng số tiền này. Trần đã xác nhận vẫn là 10 USD cho đến khi owner duyệt thay đổi.

## Cấu hình dùng để tính

- Region đề xuất: Singapore `asia-southeast1`, cần owner xác nhận phù hợp residency. Không suy ra quyền lưu dữ liệu y tế tại đây từ ngôn ngữ người dùng.
- Production: project `satsunicmedic`; Next.js và NestJS trên Cloud Run, Firebase Auth; Cloud SQL PostgreSQL Enterprise General Purpose **regional HA, 2 vCPU/8 GiB, SSD 50 GiB**. Cloud Storage, global Application Load Balancer, Cloud Armor Standard, Cloud CDN; giữ private IP database và Direct VPC egress như system design.
- Staging: project riêng chưa chỉ định; cùng loại thành phần, database zonal 2 vCPU/8 GiB, SSD 20 GiB. **176 giờ compute/tháng** (8 giờ × 22 ngày). Dữ liệu synthetic, không copy production. Lịch stop/start phải được triển khai và xác minh; storage/backup/LB/Armor vẫn tính phí khi DB dừng. Nếu chưa có lịch đã kiểm chứng, dùng dự toán 24/7.
- Workload giả định để lập kế hoạch, chưa đo tải: 1.000 MAU; production 2 triệu request qua WAF/tháng; CDN 200 GiB/tháng tại APAC, cache fill 20 GiB; staging 0,2 triệu request và khoảng 20 GiB CDN. Không phone/SMS, SAML, AI inference hoặc Armor Enterprise.
- 730 giờ/tháng, USD, giá on-demand; không trừ trial credit/CUD. CPU/RAM sizing cần kiểm tra tải và pool trước release; không phải cam kết năng lực hoặc SLA của ứng dụng.

## Chi phí tháng theo kịch bản cơ sở

**U**: phép tính theo đơn giá đã đọc trực tiếp; **A**: khoản dự trù kỹ thuật, chưa phải SKU quote. Số tiền làm tròn đến cent. Backup là dung lượng trung bình thực lưu, không bằng số lần backup × kích thước database.

| Hạng mục | Production USD | Staging có lịch USD | Cơ sở |
|---|---:|---:|---|
| SQL CPU + RAM | 283,24 | 34,14 | U: HA `(2×0,1156 + 8×0,0196)×730`; zonal `(2×0,0578 + 8×0,0098)×176` |
| SQL SSD | 23,80 | 4,76 | U: HA 50 GiB × 0,000652055 × 730; zonal 20 × 0,000326027 × 730 |
| SQL backup / PITR storage | 11,20 | 2,24 | U: giả định tổng 100/20 GiB × 0,000153425 × 730; phải đo tăng trưởng WAL |
| Load balancer forwarding rules | 18,25 | 18,25 | U: 0,025 USD/giờ cho nhóm đầu tối đa 5 rules, mỗi project riêng |
| Armor Standard | 11,50 | 10,15 | U: 1 policy + tổng 5 rules mỗi môi trường; 5 + 5 + 0,75/triệu request |
| Cloud Run web/API/jobs | 40,00 | 10,00 | A: có khoảng cho jobs và cold start; không cam kết free tier hoặc suy phí từ request count |
| CDN delivery + cache fill | 18,40 | 1,84 | U: APAC 200/20 GiB × 0,09 + fill 20/2 GiB × 0,02 |
| Network khác / cache lookups | 15,00 | 3,00 | A: LB xử lý dữ liệu, dynamic egress, lookup, cross-zone; chưa có trace traffic |
| GCS + versioning + operations | 5,00 | 2,00 | A: khoảng 100/20 GiB asset; phụ thuộc kích thước và vòng đời asset được mua |
| Logs / metrics / traces | 10,00 | 3,00 | A: sampling, retention và log exclusions phải chốt; không log nội dung cá nhân |
| Build / Artifact Registry / secrets / DNS | 5,00 | 3,00 | A: tần suất build/giữ image hữu hạn; không bao gồm phí mua domain |
| Firebase Auth | 0,00 | 0,00 | U có điều kiện: auth thông thường, MAU thấp, không SMS/SAML; kiểm tra plan khi enable |
| **Cộng trước dự phòng** | **441,39** | **92,38** | **533,77 USD/tháng** |
| Dự phòng 20% | | **106,75** | 640,52 USD; làm tròn ngân sách **650 USD** |

Nếu staging chạy đủ 730 giờ, SQL compute staging thành 141,62 USD; tổng trước dự phòng **641,25 USD**, sau 20% là **769,50 USD** → ngân sách **800 USD/tháng**. Không giảm HA production để làm đẹp dự toán.

## Cấp ngân sách theo giai đoạn

1. **Chỉ staging: 120 USD/tháng** cho lịch 176 giờ, đã gồm dự phòng. Chưa cấp production; hoàn thiện acceptance, restore drill, đo tải và chi phí. Nếu staging luôn bật cần **250 USD/tháng**.
2. **Mở production sau release gates: 650 USD/tháng tổng hai môi trường**, thay mức staging; không cộng thêm 120. Điều kiện là lịch staging hoạt động đã kiểm chứng. Nếu owner yêu cầu staging 24/7: 800 USD tổng.
3. Tháng đầu có migration, build, chuyển asset và kiểm thử tải nằm trong khoản dự phòng; nếu dự toán trước chạy vượt phần còn lại phải xin delta, không tự chi vượt.

## Độ nhạy và các khoản chưa tính

- Thêm 1 TiB CDN tại APAC trong bậc đầu: khoảng **92,16 USD delivery**, chưa fill/requests. 200 GiB chỉ tương đương khoảng 4.096 lượt tải asset 50 MiB đầy đủ; cache CDN không xóa phí truyền đến người dùng.
- Tăng HA database lên 4 vCPU/16 GiB: thêm **283,24 USD/tháng** compute. Read replica/cross-region DR là phạm vi ngân sách mới.
- Cloud Run có free tier nhưng dùng chung theo billing account; khoản A phải thay bằng CPU-seconds, GiB-seconds, request và min-instance đã đo trước khi apply production.
- **Chưa bao gồm** mua/thuê bộ mô hình giải phẫu, chuyên gia duyệt nội dung, lao động phát triển/vận hành, domain, email bên thứ ba, paid support, thuế và tỷ giá. Các khoản này chưa có báo giá, không phải 0 USD. Owner xác nhận chưa có asset/reviewer; duyệt cloud budget không giải quyết các đầu vào đó.

## Kiểm soát chi phí trước khi tạo tài nguyên

- Xác nhận billing account ID và staging project; budget theo từng project + tổng, cảnh báo 50/80/90/100% và forecast; người nhận cảnh báo phải được chỉ định.
- Không dùng hierarchical Armor policy/Enterprise, CUD, replica hoặc NAT/VPC connector trả phí nếu chưa có delta dự toán. Dùng Direct VPC theo kiến trúc; giữ ingress chỉ từ LB và IAM tối thiểu.
- Cloud Run max instances, concurrency và SQL pool được chốt sau load test; lifecycle image/assets, retention logs và limit dung lượng auto-grow được review. Đây là kế hoạch, chưa có cấu hình cloud được áp dụng.
- Alerts-only budgets **không chặn chi tiêu**. Spend cap budgets hiện là Preview cho dịch vụ đủ điều kiện (có Cloud Run), không dừng phí compute/storage cố định; có độ trễ và vẫn có thể phát sinh vượt. Không coi đây là hard cap toàn stack hoặc tự tắt billing/xóa DB khi chạm ngưỡng.
- 80%: xem forecast, dừng tác vụ batch chưa cần; 90%: yêu cầu quyết định owner trước mở tải/scale thêm. Giữ dữ liệu/backup, không tự destructive cleanup để tiết kiệm.

## Nội dung cần owner duyệt

Đề xuất: “Duyệt HS-BUDGET-2: Singapore, staging theo lịch tối đa 120 USD/tháng; sau khi đạt release gates cho phép tổng production + staging 650 USD/tháng. Billing account: …; staging project: …; domain: …; người nhận cảnh báo: …”.

Đây là yêu cầu duyệt ngân sách mới theo câu trả lời của owner, không phải xin lại quyền triển khai đã cấp. Mức mới vượt 10 USD và chưa có billing account được chỉ định, nên chưa liên kết billing hoặc tạo dịch vụ trả phí. Duyệt ngân sách không đồng nghĩa đã release hoặc được miễn gate về asset, y khoa, quyền riêng tư, restore, vận hành và live acceptance.

## Nguồn và giới hạn xác minh

Đọc ngày 2026-09-30; SQL được chọn **Singapore** trong UI chính thức (không dùng giá mặc định Iowa). Đơn giá có thể thay đổi trước ngày apply. Các dòng A là allowance do dự án đề xuất; cần calculator export/SKU review và workload measurement trước promotion.

- [Cloud SQL pricing](https://cloud.google.com/sql/pricing): Enterprise General Purpose PostgreSQL, compute HA/zonal, SSD và backup; evidence `evidence/sql-singapore-pricing.json`.
- [Load Balancing pricing](https://cloud.google.com/load-balancing/pricing).
- [Cloud Armor pricing](https://cloud.google.com/armor/pricing).
- [Cloud CDN pricing](https://cloud.google.com/cdn/pricing).
- [Cloud Run pricing](https://cloud.google.com/run/pricing).
- [Firebase pricing](https://firebase.google.com/pricing).
- [Spend cap budgets và giới hạn](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps).

Review ngân sách: công thức và tổng được tính lại bằng script; nguồn U kiểm tra chính thức; không thay stack, không tạo tài nguyên. Decision tổng thể vẫn **NOT_READY**; estimate được lập để duyệt, không chứng nhận production.
