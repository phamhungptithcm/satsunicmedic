# Trạng thái triển khai Firebase

**LIVE_FOUNDATION; sản phẩm y khoa đầy đủ NOT_READY.** Cập nhật 01/10/2026 UTC.

Web: https://medic--satsunicmedic.asia-southeast1.hosted.app

Theo quyết định của owner, web dùng Firebase App Hosting, đăng nhập dùng Firebase Authentication, dữ liệu dùng Firestore; Nest API chạy Firebase Functions gen2. Vùng Singapore `asia-southeast1`, production duy nhất. Domain `satsunicmedic.com` và AdSense để sau; quảng cáo vẫn tắt.

## Đã xác minh

- Web build thành công, App Hosting rollout SUCCEEDED; API ACTIVE trên Node24. Image/revision và bằng chứng trong [firebase-production-evidence.json](firebase-production-evidence.json).
- 13/13 chỉ mục Firestore READY; deny-all client rules đã triển khai; web không có quyền đọc database hoặc quản trị Firebase Auth.
- 23/23 integration với Auth/Firestore Emulator, 78/78 unit tests, TypeScript/API build/scoped lint PASS. Audit dependency production của workspace và artifact API không ghi nhận vulnerability.
- 13/13 kiểm tra API trực tiếp và 13/13 qua website PASS: health/readiness, truy vấn, 401 khi thiếu phiên, CSRF403, input400, body413. Cookie CSRF Secure/SameSite=Strict, response thông thường private/no-store.
- 5 trang công khai trả200; 4 đường dẫn draft model/bệnh lý trả404. Không đưa model binary chưa duyệt lên bản build. Browser production hiển thị trạng thái chưa có model và form đăng nhập.

## Chi phí và vận hành

Web/API đặt minInstances0, maxInstances1, concurrency20, memory512MiB để giảm chi phí khi ít dùng; không có VM chạy thường trực hoặc Cloud SQL. Chưa có số hóa đơn thực tế; không cam kết miễn phí hoặc một mức cố định. Budget alert và maxInstances không phải trần tiền tuyệt đối.

VM cũ đã dừng, nhưng disk/IP tĩnh, registry và bucket giữ lại vẫn có thể tính phí. Chưa xóa dữ liệu/tài nguyên dự phòng. Firestore có lịch sao lưu hằng ngày, giữ7ngày; chưa thử restore. CLI Functions báo thiếu chính sách dọn artifact sau khi API đã ACTIVE; chưa bật xóa tự động.

## Còn thiếu để phát hành sản phẩm hoàn chỉnh

- Tài nguyên mô hình có quyền sử dụng và nội dung y khoa được chuyên gia duyệt; không gọi bản hiện tại là sản phẩm giải phẫu3D/4D hoàn chỉnh.
- Kiểm thử đăng nhập bằng tài khoản thật, phiên đăng nhập end-to-end, restore/rollback, load/cost và đầy đủ accessibility/GPU.
- Các luồng editor/giảng dạy/publishing, tổ chức/lớp học, export/xóa tài khoản và monetization còn phải hoàn tất theo spec.
- Giới hạn hiện tại: search tối đa1024candidates rồi503 rõ ràng, payload offline16MiB, orphan chunks chưa có cleanup, asset objectKey uniqueness cần bổ sung trước khi mở importer.

## Review và phạm vi bằng chứng

Implementation, QA, security, data và independent review dùng nguồn hiện tại; final review được lưu ở task HS-FIREBASE-2. Repo intelligence được refresh nhưng có lúc stale/DEGRADED; kết luận giới hạn bằng source, compiler, tests và live readback. Các chỉ số trên không chứng minh những luồng chưa chạy.

Git dirty và WIP các chat khác được giữ nguyên; chưa commit/push. Token usage và actual billed cost: Unavailable. Memory candidates: None.

Kế hoạch/runbook hiện hành: [Firebase migration](firebase-migration-plan.md), [Firebase deploy](../../infra/firebase/README.md). Tài liệu VM/PostgreSQL trước đây chỉ còn là lịch sử.
