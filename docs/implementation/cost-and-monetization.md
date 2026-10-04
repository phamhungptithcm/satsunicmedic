# HS-ECON-1 — Production tiết kiệm và doanh thu duy trì

2026-09-30 · **ZONAL160_APPROVED / MONETIZATION_PROPOSED**. Owner cho production tối đa650USD/tháng, không staging và yêu cầu tối ưu rẻ nhất, cân nhắc quảng cáo/license một lần. 650USD là giới hạn, không phải mục tiêu chi. Chưa bật billing, quảng cáo hoặc checkout; không có doanh thu thật được chứng minh.

## 1. Hạ chi phí khởi động

Giữ Google Cloud + Firebase, Next/Nest, PostgreSQL/Prisma, private DB, LB/Armor/CDN. Không thay bằng Firestore hoặc tự quản database trên VM. Singapore vẫn cần owner xác nhận.

| Cấu hình | Zonal tiết kiệm | HA nhỏ |
|---|---:|---:|
| SQL Enterprise General Purpose 1 vCPU/4 GiB | 70,81 | 141,62 |
| SSD 20 GiB | 4,76 | 9,52 |
| Backup/PITR trung bình20GiB | 2,24 | 2,24 |
| LB (730h) | 18,25 | 18,25 |
| Armor Standard 1policy/5rules/1triệu requests | 10,75 | 10,75 |
| Cloud Run web/API/jobs allowance | 10,00 | 10,00 |
| CDN 50GiB + fill5GiB APAC | 4,60 | 4,60 |
| Network khác/cache requests allowance | 3,00 | 3,00 |
| Asset storage/operations allowance | 2,00 | 2,00 |
| Logs/build/registry/secrets/DNS allowance | 3,00 | 3,00 |
| **Cơ sở USD/tháng trước thuế** | **129,41** | **204,98** |
| **Sau dự phòng20%** | **155,29** | **245,98** |
| **Mục tiêu vận hành đề xuất** | **160** | **250** |

Đơn giá SQL Singapore lấy từ evidence/sql-singapore-pricing.json: zonal CPU0,0578/vCPUh + RAM0,0098/GiBh; HA gấp đôi. Các allowances chưa có benchmark; phải đo chi phí thực. Mục tiêu160/250 không phải guaranteed cap, thuế/traffic tăng có thể vượt mục tiêu; giới hạn owner650 vẫn áp dụng, không tự dùng hết khoảng còn lại để mở scope. 50GiB chỉ tương đương khoảng1.024 lượt tải đầy đủ model50MiB/tháng; cần đo asset thật và browser cache trước public acquisition.

**Khuyến nghị tiết kiệm: bắt đầu zonal160USD nếu owner chấp nhận không có DB failover tự động.** Owner đã duyệt delta: “Zonal nhỏ, mục tiêu160 USD/tháng; chấp nhận downtime khi DB/zone lỗi”. Chưa áp dụng tài nguyên cloud. Backup/PITR vẫn bắt buộc nhưng không thay HA. Nếu không chấp nhận downtime khi zone/DB hỏng, dùng HA nhỏ250USD. RTO/RPO phải đo qua restore drill, không hứa vài phút từ cấu hình trên giấy. Không chọn db-f1-micro/db-g1-small cho production: Google xác định đây là shared-core test/dev, không thuộc SLA.

### Quy tắc tiết kiệm có thể triển khai

- Một project production, không staging. Kiểm tra local/emulator; live pre-traffic checks trên candidate production có phạm vi rõ.
- Cloud Run request-based billing, min instances0 ban đầu; max instances theo pool budget sau load test. Nếu cold start không đạt UX thì chỉ nâng min instances sau đo chi phí. Không VPC connector/NAT trả phí mặc định; Direct VPC theo design.
- CDN/browser cache dài cho asset fingerprint bất biến; chỉ cache nội dung public được cấp phép. Không cache notes, quiz answers, session hoặc signed/private responses. Revalidation/thu hồi quyền vẫn phải đúng.
- Tải LOD thấp trước; meshopt/Draco/KTX2 là backlog cần benchmark, không tự đổi pipeline khi chưa có asset. Tránh tải lại model mỗi route/mode, dừng animation khi hidden, giới hạn upload được phép.
- Database privateIP, connection pool nhỏ, TTL/session cleanup theo batch; backup/PITR và deletion protection không bỏ để giảm phí. SSD auto-growth có giới hạn được review, cảnh báo trước gần đầy, không để hard disk cap gây mất khả dụng.
- Logs không chứa nội dung người dùng; sampling/retention theo policy. Image lifecycle giữ candidate/rollback cần thiết, không lưu image vô hạn. Build local hoặc CI miễn phí; không mua phút CI.
- Cảnh báo **100/130/160USD** với cấu hình zonal; forecast vượt160 thì xem lại tải và cache. Cảnh báo giới hạn tuyệt đối **520/585/650USD**; cần owner xử lý trước khi vượt. Budget alerts không tự chặn hóa đơn. Không tự tắt billing/xóa dữ liệu.

## 2. Quảng cáo: AdSense cho web, AdMob khi có native app

Sản phẩm hiện là website. Google phân biệt AdSense cho website và AdMob cho mobile app; không nhúng AdMob SDK vào Next.js và coi đó là tích hợp hợp lệ. Nếu sau này phát triển Android/iOS, đó là scope riêng với SDK, consent và store policy riêng.

Đề xuất quảng cáo là nguồn phụ:

- Chỉ AdSense trên bài kiến thức công khai, đủ nội dung gốc và được duyệt; tối đa1 vị trí inline sau nội dung chính ở giai đoạn đầu. Có nhãn “Quảng cáo”, không trông giống nguồn tham khảo hoặc khuyến nghị y khoa.
- Không ad trong canvas3D, cạnh nút xoay/play, quiz đang làm, notes, trang tài khoản, chia sẻ riêng, trang bệnh lý nhạy cảm hoặc trang trống. Không pop-up/interstitial/autoplay; không bắt xem/click ad để mở kiến thức.
- Chỉ tải script khi trang thuộc allowlist và điều kiện consent được đáp ứng; không tải trước rồi mới ẩn khi người dùng từ chối. Không gửi query sức khỏe, ghi chú, userID, tiến độ hay loại bệnh tới ad/analytics. Không remarketing theo sức khỏe.
- NPA không có nghĩa không cần consent: Google nói vẫn dùng cookies cho frequency/reporting. Đối chiếu vùng phục vụ và CMP trước launch. CSP phải mở đúng origin đã review, không wildcard; kill switch tắt toàn bộ ad script khi lỗi/policy change. Server-side entitlement đảm bảo người mua không nhận ad script.
- Site/account còn phải được Google duyệt. Hiện chưa có model/nội dung y khoa được duyệt và chưa có publisherID nên doanh thu quảng cáo trong ngân sách launch là **0**, không dùng doanh thu giả định để trả hóa đơn đã cam kết.

### Độ nhạy quảng cáo — không phải dự báo RPM

Dùng **page RPM thực nhận giả định**0,5/1/2USD chỉ để tính hòa vốn, chưa có số liệu audience. `Doanh thu = eligible pageviews / 1.000 × page RPM`. Chỉ đếm trang có ad đủ điều kiện, không đếm lượt canvas hoặc ad impressions thành pageviews.

| Hóa đơn cần bù | RPM0,5 | RPM1 | RPM2 |
|---|---:|---:|---:|
|160USD/tháng|320.000PV|160.000PV|80.000PV|
|250USD/tháng|500.000PV|250.000PV|125.000PV|
|650USD/tháng|1.300.000PV|650.000PV|325.000PV|

Traffic này tự làm tăng chi phí CDN/compute. Phải giải đồng thời revenue và chi phí biến đổi, không giữ chi phí160 khi lượt tải model tăng nhiều lần. Ad blocker/consent/fill và thanh toán trễ làm giảm tiền mặt thực nhận. Không cam kết eCPM/RPM thị trường khi chưa chạy thật.

## 3. License một lần: thử giá, không hứa cloud trọn đời

Đề xuất khảo sát willingness-to-pay trước khi chốt: **Personal V1 29USD một lần**, **Teaching V1 59USD một lần**. Đây là giá thử nghiệm, chưa phải checkout hay giá đã được khách hàng chấp nhận; giá địa phương VND cần chốt riêng, không tự dùng tỷ giá giả. Teaching chỉ được bán sau khi có authoring/presentation/export đúng spec và quyền asset cho lớp học; không bán tính năng mới ở mức prototype.

Để nghĩa vụ cloud không tăng vô hạn, gói license một lần nên là **quyền dùng bản V1 local/offline vĩnh viễn +12tháng dịch vụ cloud có quota**, không tự gia hạn. Sau12tháng người dùng giữ bản offline và export dữ liệu; cloud có thể gia hạn tự nguyện hoặc dùng Free. Phiên bản lớn mới được bán riêng, bug/security fixes theo chính sách công bố rõ.

**Điểm chặn quan trọng:** hiện chưa có offline distribution, và license asset chưa xác minh cho phép phân phối binary. Vì vậy đây chỉ là phương án thiết kế. Nếu nhà cung cấp không cho offline/redistribution, không bán lời hứa “vĩnh viễn”; chọn gói cloud12tháng trả trước, hoặc gói nội dung một lần có quyền và điều kiện truy cập rõ. Không đánh tráo thời hạn12tháng bằng nhãn lifetime.

Free: nội dung public được duyệt + thao tác khám phá cơ bản, quảng cáo ở trang allowlist. Paid: không quảng cáo, tính năng học/giảng dạy bổ sung thực sự đã nghiệm thu. Không trả tiền để nhận “chẩn đoán tốt hơn”; accuracy/safety là chuẩn chung.

### Hòa vốn license — giả định thận trọng, không phải báo giá cổng thanh toán

Giữ lại10% gross cho phí/hoàn tiền/thuế chưa biết; trong90% còn lại, dành50% cho nghĩa vụ hỗ trợ/cập nhật/hosting tương lai. Khoản có thể bù chi phí tháng hiện tại = `giá ×0,9×0,5` =13,05USD (Personal) hoặc26,55USD (Teaching). Cần thay10% bằng báo giá và thuế thực trước bán; không coi đây là đầy đủ cost of goods khi chưa có license asset/reviewer.

| Chi phí cần bù/tháng | Chỉ Personal29USD | Chỉ Teaching59USD |
|---|---:|---:|
|160USD|13 khách mua mới|7 khách mua mới|
|250USD|20 khách mua mới|10 khách mua mới|
|650USD|50 khách mua mới|25 khách mua mới|

Đây chỉ bù phần cloud theo giả định; chưa bù lao động, asset, reviewer, marketing và support. Khách mua một lần không tiếp tục trả mỗi tháng: phải có người mua mới hoặc renewal tự nguyện. 100license Personal tạo2.900USD gross nhưng chỉ1.305USD theo công thức dành cho hiện tại, tương đương khoảng8,2tháng hóa đơn160; không bảo đảm sản phẩm sống vô hạn. Nên tích lũy quỹ ít nhất12tháng nghĩa vụ trước khi mở lifetime offer.

## 4. Spec triển khai kiếm tiền sau khi plan được duyệt

Phạm vi ảnh hưởng: `apps/web` pricing/checkout-return/ad slots/consent; `apps/api` orders, provider webhooks, entitlements; Prisma migrations; CSP/security; terms/privacy/product content; tests/operations. Rủi ro HIGH: tiền, quyền truy cập, tracking; cần provider/account, định nghĩa quyền và chính sách hoàn tiền trước edits.

- `ProductVersion`, `Offer`, `Order`, `PaymentEvent`, `Entitlement`, `RefundEvent`: order liên kết internal user, currency/amount lưu minor units, version immutable; không lưu card data. Không dùng client returnURL làm bằng chứng đã trả tiền.
- Hosted checkout với provider được owner chọn, kiểm tra quốc gia merchant/taxes/fees và sandbox trước. Webhook kiểm chữ ký trên rawbody, timestamp/replay, eventID unique, so khớp amount/currency/SKU; atomic order+entitlement, retry idempotent và audit.
- Refund/chargeback thu hồi đúng quyền phát sinh, không xóa nội dung người dùng. API enforce quyền, UI không phải ranh giới. Purchase recovery/receipt không lộ PII; offline license ký cần thiết kế revocation/device transfer riêng.
- Entitlement tách `licenseVersion`, `cloudAccessUntil`, `adFreeUntil`, seatcount; copy hiển thị chính xác phạm vi/thời hạn trước mua. Không có clock-based activation chỉ trên client.
- Ads mặc định OFF. Allowlist route + consent + non-sensitive context + entitlement; denied consent/paid user phải0requests tới ad vendors. Test bằng mock/test mode, không tự click quảng cáo thật.
- Checks: duplicate/out-of-order webhook, price tamper, user mismatch, refund, declined checkout, expired cloud term, currency rounding, no-network consent, CSP, keyboard/mobile, CLS; privacy/security review và live low-value payment chỉ khi owner cho phép giao dịch cụ thể.
- Metrics không chứa thông tin sức khỏe: paid conversion, refund%, net collected, eligiblePV, actual RPM, cost/active learner, asset GiB/session, runway. Không bơm fake analytics.

## 5. Quyết định đề nghị

1. Owner đã chọn zonal160USD để tiết kiệm, chấp nhận không failover tự động. Giới hạn650USD giữ nguyên, không staging.
2. Ưu tiên license có thời hạn cloud minh bạch; Ads chỉ bổ sung sau site approval. Nghiên cứu quyền offline trước chọn “mua một lần”. Chưa triển khai tracking/payment khi plan và điều kiện chưa được chốt.
3. Billing discovery chỉ đọc thấy4account OPEN đều tên Firebase Payment; owner phải chọn ID, không tự chọn ví tiền. Domain và region vẫn chưa xác nhận.

## Nguồn chính thức

Đọc2026-09-30:
- [Cloud SQL configuration, dedicated core, shared core limitation](https://docs.cloud.google.com/sql/docs/postgres/instance-settings).
- [Cloud SQL Singapore pricing](https://cloud.google.com/sql/pricing), [Cloud CDN pricing](https://cloud.google.com/cdn/pricing), [Armor pricing](https://cloud.google.com/armor/pricing), [Load Balancing](https://cloud.google.com/load-balancing/pricing).
- [Google: AdSense, AdMob, Ad Manager](https://support.google.com/admob/answer/9234653?hl=en).
- [AdSense eligibility](https://support.google.com/adsense/answer/9724/eligibility-requirements-for-adsense?hl=en-uk).
- [Publisher policies: sensitive personalized advertising](https://support.google.com/publisherpolicies/answer/15101728?hl=en).
- [Non-personalized ads and consent](https://support.google.com/adsense/answer/9007336?hl=en).

Giá bán, allowances, reserve và RPM scenario là đề xuất dự án, không lấy từ nguồn như sự thật thị trường. Chưa có khảo sát giá, thanh toán, ads approval hoặc doanh thu thật.
