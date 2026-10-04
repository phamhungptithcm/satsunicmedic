# HS-BUDGET-1 — Quyết định triển khai trong 10 USD/tháng

Trạng thái: OPTION_C_SELECTED — owner đã chọn “Giữ kiến trúc đầy đủ, cho lập ngân sách mới để duyệt”. Owner sau đó duyệt production tối đa 650 USD/tháng, staging miễn phí. Xem [HS-BUDGET-3](budget-proposal.md); các lựa chọn dưới đây chỉ là lịch sử.

## Dữ kiện đã kiểm tra

- Chủ dự án xác nhận project `satsunicmedic` và trần **10 USD/tháng**.
- `gcloud projects describe`: ACTIVE; `gcloud billing projects describe`: billingEnabled=false. Chỉ đọc metadata, chưa liên kết billing, chưa tạo tài nguyên trả phí.
- Chủ dự án xác nhận chưa có model thương mại/nguồn asset và người duyệt y khoa.
- Không có domain hoặc billing account được chỉ định.
- Kiến trúc docs v0.2: Next + Nest Cloud Run, PostgreSQL Cloud SQL, external Application Load Balancer/Cloud Armor/CDN, Firebase Auth.

## Vì sao kiến trúc hiện tại không được triển khai

Giá forwarding rule nhóm đầu của Google Cloud Load Balancing là 0,025 USD/giờ. Với 730 giờ/tháng: **18,25 USD/tháng**, riêng thành phần này đã vượt trần 10 USD, chưa tính Cloud SQL, lưu trữ, logs và truyền tải. Đây là phép tính sàn cho kiến trúc, không phải báo giá tổng hoặc cam kết giá cho mọi region.

Nguồn chính thức đã tra 2026-09-30: [Cloud Load Balancing pricing](https://cloud.google.com/load-balancing/pricing), [Cloud SQL pricing](https://cloud.google.com/sql/pricing). Alerts-only budget không phải hard cap cho toàn hệ thống. Không dựa vào credit thử nghiệm để cam kết mức phí vận hành.

## Các lựa chọn có thể duyệt

### A — Giữ trần 10 USD, tiếp tục local (khuyến nghị ở trạng thái hiện tại)

Giữ nguyên source kiến trúc và database. Không tạo dịch vụ Google trả phí. Hoàn thiện kiểm thử, chuẩn bị asset/reviewer trước. Không có public release và không đổi stack. Có thể xem ứng dụng local ở 127.0.0.1:4185.

### B — Giữ trần 10 USD, phát hành bản xem trước tĩnh riêng

Một deployment Firebase Hosting ở Spark chỉ giới thiệu sản phẩm và trạng thái chuẩn bị, không tài khoản, ghi chú, quiz lưu tiến độ, nội dung y khoa hoặc mô hình chưa duyệt. Cần kiểm tra quota/điều kiện Hosting hiện hành và owner duyệt bản nội dung xem trước trước khi publish. Không dùng site này làm bằng chứng hoàn thành ứng dụng. Không đổi source Nest/Prisma; xây một entrypoint static riêng, thêm CI/build/robots rõ trạng thái preview. Đây là **thay đổi phạm vi phát hành**, chưa được áp dụng.

### C — Giữ sản phẩm và kiến trúc đầy đủ, thay ngân sách

Chốt region, workload, SLA và license; lập estimate Google Cloud theo region rồi owner duyệt tổng giới hạn cùng billing account/domain. Sau đó mới dựng IaC/apply staging. Vẫn cần asset có quyền và medical review trước phát hành chức năng giải phẫu.

## Phạm vi ảnh hưởng nếu chọn B

Thêm `apps/preview/**`, cấu hình Hosting ở `infra/firebase/preview.*`, workflow build riêng; không database, secret, identity hay asset downloader. Kiểm tra không có medical claim, đúng robots/noindex, mobile/a11y, rollback bằng Hosting release trước. Dừng trước publish nếu chưa xác minh Spark và site đích. Cần approval delta vì khác kiến trúc serving và không đạt toàn bộ HS acceptance.

Không có phương án nào biến ảnh concept thành mô hình giải phẫu thật hoặc thay thế kiểm duyệt y khoa.
