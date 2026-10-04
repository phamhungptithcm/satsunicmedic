# HS-COST-LOW — Một VM production, không staging

Owner yêu cầu tiếp tục giảm phí, chấp nhận downtime/rủi ro vận hành. **Đây là phương án triển khai mới để thay managed topology; chưa provision.** Giới hạn650USD vẫn giữ, không phải mục tiêu chi. Không có billing account/domain/region được chỉ định; không tự chọn từ4billing account đang mở.

## Cấu hình nhỏ nhất cần thử tải

Một Google Compute Engine VM Linux chạy reverse proxy TLS + Next standalone + Nest + PostgreSQL; Firebase Auth giữ nguyên. PostgreSQL chỉ trong mạng container, không mở5432 ra internet. Asset public hợp lệ cache fingerprint tại proxy/browser; không cache private responses. Backup mã hóa ở bucket riêng, restore test. Build trên máy local/CI miễn phí, không build Next/Prisma trên VM2GiB. Không Cloud SQL, Cloud Run, external LB/Cloud CDN hay Armor subscription trong phương án này.

| Thành phần,730h/tháng | e2-small2GiB | e2-medium4GiB |
|---|---:|---:|
|VM tại Iowa us-central1|12,23|24,46|
|IPv4 đang dùng|3,65|3,65|
|Disk allowance|3,00|3,00|
|Backup/GCS/operations allowance|2,00|2,00|
|Traffic allowance ban đầu|5,00|5,00|
|Logs/registry allowance|1,00|1,00|
|Tổng trước thuế|26,88|39,11|
|Có20%dự phòng|32,26|46,93|
|Mục tiêu làm tròn|**35USD/tháng**|**50USD/tháng**|

Điều chỉnh ước tính sơ bộ30–45USD thành **35–50USD** sau bổ sung disk/registry/dự phòng. CPU/IP là đơn giá kiểm tra chính thức; các dòng allowance chưa có traffic/asset đo thực, không phải giá cố định. Không dùng credit hay free-tier để làm0chi phí. Không gồm domain, tax, license model, reviewer, công vận hành; tax phải nằm trong giới hạn650. Giá trên là **US, không phải Singapore**. Residency và latency từ Việt Nam cần owner chốt. GiáSingapore cần calculator theo region trước tạoVM.

2GiB có thể không đủ cho Next+Nest+Postgres; không khẳng định đủ tải từ tên VM. Bắt đầu kiểm thử cấu hình2GiB, chỉ dùng nếu p95/resident memory/DB connections chấp nhận được và khôngOOM; nếu thất bại dùng4GiB thay vì phá auth/backup. e2 là shared CPU/burst; throughput phải đo. Không chọn Spot làm nơi duy nhất chạy database chỉ để giảm phí nữa. e2-micro1GiB/free tier có rủi ro thiếuRAM và không chứng minh đủ production, không đề xuất như một cam kết0USD.

## Trade-offs và các kiểm soát giữ lại

Một VM là single point of failure; reboot/deploy/host failure gây downtime. Database tự quản: chủ dự án phải chịu patching, capacity, backup và phục hồi thay vì Cloud SQL. Không có Google managed WAF/HA/CDN trong profile này. TLS, secure cookies, Firebase revocation, CSRF, ownership, private DB, firewall chỉ80/443, OS Login/IAP admin, least-privilege service account và audit vẫn bắt buộc. Reverse proxy rate/connection limits và app rate limit phải kiểm chứng; không gọi chúng tương đương Cloud Armor.

Sao lưu daily cho ngân sách thấp có thể mất dữ liệu từ lần backup gần nhất; đây là rủi ro dữ liệu khác downtime, cần ghi rõ trong vận hành. Nếu cần PITR, bật WAL archive và tính lại storage/network; không khẳng định PITR tự có khi chuyển khỏi Cloud SQL. Chỉ dùng backup thật đã restore được, không dựa vào snapshot crash-consistent để hứa phục hồi giao dịch.

Không dùng “chấp nhận mọi rủi ro” để công khai DB, bỏ TLS/authorization, dùng asset không có quyền, thu thập dữ liệu trái consent hoặc bỏ review tính đúng của nội dung y khoa.

## Plan và phạm vi ảnh hưởng

- Thêm profileinfra singleVM: compose pinned digests, reverseproxyTLS, persistentdisk, restart/resource limits, firewall/IAM, secretmount, backup/restore và rollback. Không đụng dữ liệu production hiện hữu vì chưa deploy.
- Điều chỉnh Next API_ORIGIN thành internalAPI; Nest HOST0.0.0.0 chỉ trongnetworkcontainer; DB không hostpublish. TLSterminates ởproxy, origin/securecookie kiểm thử lại.
- Giữ schema/Prisma/contract. Migrate bằng job một lần có backup và lock; không startupmigration mỗireplica. PersistDB và backup ngoài lifecyclecontainer.
- Validate image trênLinux, tải với memorylimit2GiB/4GiB, restart/restore/rollback vàFirebase live; đo bytes/assetload trước quảng bá. Không staging, kiểm tra local và candidate trước mởproductiontraffic.
- Dừng trước cloud apply khi chưa có billingaccount/domain/region. Không đổi sangUS âm thầm để đạt giá rẻ. Phương án cụ thể còn cần được đối chiếu với owner trước chuyển topology; hiện không có tài nguyên để sửa/xóa.

## Doanh thu ở mức thấp hơn

Giữ giả định license29USD:13,05USD cho cloud hiện tại sau quỹ phí/dự phòng; mục tiêu35USD cần3khách mới/tháng,50USD cần4. Chưa gồm asset/reviewer/nhân công. RPM1USD giả định cần35.000/50.000eligiblePV; không bảo đảmRPM hay thu nhập và traffic cao tăngchi phí. Quảng cáo vẫn0USD trong cashflow launch cho tới khi thật sự được duyệt và ghi nhận.

## Nguồn2026-09-30

- [Compute pricing](https://cloud.google.com/products/compute/pricing/general-purpose): Iowa e2-small0,016752855USD/h; e2-medium0,03350571USD/h.
- [External IPv4](https://cloud.google.com/vpc/pricing): in-use standardVM0,005USD/h.
- [AdSense eligibility](https://support.google.com/adsense/answer/9724): content/site approval vẫn cần, không do code tự bảo đảm.
