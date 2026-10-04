# HS-ACCOUNT-UX-1 — Thiết kế khu vực tài khoản

2026-10-01 · **INTERACTIVE DESIGN PROTOTYPE** · Chưa tích hợp ứng dụng hoặc Lemon Squeezy.

Mở `index.html` trực tiếp, hoặc chạy `python3 -m http.server 4197 --bind 127.0.0.1 --directory docs/design/account-v1` rồi vào http://127.0.0.1:4197.

## Phạm vi và hướng thiết kế

Reading this as: khu vực tự quản lý tài khoản cho người học HumanScope, giúp hiểu và kiểm soát danh tính, quyền sử dụng và dữ liệu; giao diện sáng, gọn, theo tokens đang có của repo.

LAYOUT_VARIANCE=2, MOTION_INTENSITY=1, INFORMATION_DENSITY=5. Tác vụ tài khoản cần cấu trúc ổn định hơn hiệu ứng trang trí. Màu blue #163cff, navy #111c35, background #f5f6f9, panel trắng, radius6/8px, controls44px. Một cấp sidebar trên desktop; selector có label trên mobile, luôn có đăng xuất. Không thêm biểu đồ, chỉ số sử dụng giả hay hero bán hàng ở trang tổng quan.

User yêu cầu thiết kế tất cả trang account trước Lemon. Đây là artifact độc lập dưới docs/design, không sửa apps/api, apps/web, auth, database hoặc thanh toán. Không phát sinh dependency. Prototype dùng dữ liệu tổng hợp rõ nhãn, thay đổi chỉ trong RAM; reload đặt lại. Giá duy nhất **19,99 USD/năm** theo owner. Chưa có quyền lợi Pro sẵn sàng để mở bán.

## Danh sách trang và route ứng dụng dự kiến

| Màn hình prototype | Route dự kiến | Công việc chính | Ranh giới backend |
| --- | --- | --- | --- |
| `#overview` | `/tai-khoan` | Tóm tắt hồ sơ, gói, bảo mật, lối vào thiết lập | Hiện `/api/v1/me` chỉ trả ID/roles, cần contract tổng quan |
| `#profile` | `/tai-khoan/ho-so` | Tên hiển thị, vai trò học tùy chọn, email Google chỉ đọc | Chưa có API profile update; không đồng bộ role học thành RBAC |
| `#security` | `/tai-khoan/bao-mat` | Google liên kết, phiên hiện tại/khác, logout/revoke | Có logout và revoke-all; chưa có API list/revoke-one hoặc metadata thiết bị |
| `#preferences` | `/tai-khoan/tuy-chon` | Múi giờ, lời nhắc trong app, email tùy chọn, giảm motion | Chưa có persistence/preferences/notification service; không xin push permission |
| `#plan` | `/tai-khoan/goi` | Free/Pro, chu kỳ năm, hạn quyền, hủy/bật gia hạn | Chờ entitlement và billing APIs |
| `#billing` | `/tai-khoan/thanh-toan` | Phương thức, giao dịch, chi tiết/chứng từ | Chờ Lemon; không thu thập thông tin thẻ trực tiếp |
| `#privacy` | `/tai-khoan/du-lieu` | Xuất dữ liệu, quyền riêng tư, vào luồng xóa | Prototype tải JSON tổng hợp; export thật và retention chưa có |
| `#help` | `/tai-khoan/tro-giup` | Sai Google account, chậm mở Pro, hủy, refund | Không bịa email/ticket hoặc SLA support |
| `#signin` | `/dang-nhap?returnTo=...` | Google sign-in và lý do cần đăng nhập | Dùng flow Firebase Google hiện có; returnTo phải allowlist khi tích hợp |
| `#upgrade` | `/tai-khoan/nang-cap` | Xác nhận giá, chu kỳ, thuế trước hosted checkout | Disabled checkout, có đường xem mô phỏng kết quả |
| `#result` | `/thanh-toan/ket-qua` | Pending/confirmed/no-transaction, phục hồi | Không mở Pro từ redirect hoặc thao tác refresh |
| `#delete-account` | `/tai-khoan/xoa` | Export → xử lý gia hạn → reauth → xác nhận → pending | Không xóa thật; cần thiết kế retention và worker riêng |

Các dialog: thay đổi chưa lưu; logout; revoke một/tất cả phiên; reauthentication; hủy gia hạn; bật lại gia hạn; portal chưa nối; chi tiết giao dịch; xác nhận xóa và pending request. Với Google-only không có đăng ký bằng password, quên mật khẩu, đổi mật khẩu, hoặc email verification riêng của HumanScope. Không yêu cầu thông tin sức khỏe, ngày sinh hoặc địa chỉ cho hồ sơ.

## Luồng và quy tắc tương tác

- Sidebar/selector chọn trang giữ điều hướng nhất quán; H1 nhận focus sau chuyển route, skip link đi vào main; native dialog giữ focus, Escape đóng và trả focus.
- Profile validation tên trống hiện lỗi gắn input; HTML escape giá trị trước render. Save hiển thị rõ lưu trong bản xem thử; sửa chưa lưu rồi chuyển trang bằng điều hướng có confirm. Browser Back/reload không bảo toàn draft trong prototype; cần route blocker/draft strategy ở production.
- Avatar/email Google chỉ đọc. Tên/role chỉ là thiết lập hiển thị, không cấp vai trò nội dung hoặc quyền admin. Avatar MA cố định là fixture, không phải dữ liệu Google thật.
- Preferences là bản xem thử. Giảm chuyển động áp dụng CSS; chọn múi giờ được giữ trong RAM, nhưng các thời gian minh họa ở security vẫn cố định UTC+7 có nhãn. Khi tích hợp phải format toàn bộ timestamps bằng Intl theo timezone.
- Hủy gia hạn khác hoàn tiền: quyền vẫn còn tới hạn đã xác nhận; xóa tài khoản khác xóa hoàn tất. Không tự hứa SLA, refund eligibility hoặc thời hạn xóa.
- Free/Pro ở đây là trạng thái demo chọn trong thanh công cụ riêng. Trang không gọi API tài khoản, không gọi provider; nút checkout tắt. Một sample receipt không được gọi là hóa đơn thật.
- Feature descriptions trên Pro là proposed; lời nhắc “đang được thiết kế, chưa mở bán” nằm trong panel. Không đưa các cam kết này vào live marketing trước nghiệm thu.
- Không vẽ lại hosted payment form. Luồng chuyển portal, loading/redirect/failure cần được kiểm tra với provider ở phase tiếp theo.

## Ma trận trạng thái

Thanh “Trạng thái xem thử” chuyển 6 plan states: Free, active, cancelled, past_due, expired, pending. Khả năng read dữ liệu cá nhân giữ sau hết Pro. `past_due`72h là policy đề xuất từ HS-SUB-1, ngày trong prototype chỉ minh họa.

5 page states: ready, loading, error/retry, offline, expired-session. Không biến lỗi tải thành tài khoản trống hoặc không có giao dịch. Billing Free có empty state riêng; xem chi tiết giao dịch chỉ có trong fixtures paid. Guest quay lại mock sign-in; không phát sinh session thật. Confirmation/success luôn nêu phạm vi mô phỏng.

## Ảnh hưởng khi đưa vào ứng dụng — chưa thực hiện

1. Thêm Next account layout và các routes nêu trên, dùng shared tokens/header/client và local Next docs. Không mang nguyên static script vào production.
2. Account shell cần session-aware menu thay cho CTA đăng nhập hiện tại. Reuse `apps/web/src/lib/google-sign-in.ts`, `components/login.tsx`, `apps/api/src/identity.ts`; không hệ auth thứ hai.
3. Profile/preferences/session list/export/deletion chưa có contract đủ: lập delta-plan backend và kiểm tra quyền owner, CSRF, IDOR, privacy, retry. Revoke-all hiện yêu cầu recent ID token; prototype không thay đổi yêu cầu này.
4. Billing UI có adapter trạng thái, mặc định unavailable; nối catalog/entitlements/portal theo HS-SUB-1 sau duyệt. Không dùng mock Free/Pro làm authorization.
5. API needs trước implement: profile fields nullable, device metadata không đáng tin tuyệt đối, session current marker, auth timestamps, quota/current counts, entitlement end date, invoice tax/currency, export/deletion state machines. Không hardcode state trả về như prototype.
6. Tất cả routes tài khoản private/no-store/noindex; không đưa PII hoặc dữ liệu học vào analytics, query params, shared cache.
7. Kiểm thử integration auth/CSRF/owner và browser real session; annual-only billing source of truth server. Chưa deploy/push hoặc tạo checkout.

Risk khi tích hợp HIGH (identity/payment/data), artifact prototype risk LOW. Plan A–C của HS-SUB-1 chưa được duyệt coding. User đã yêu cầu thực hiện design, nên prototype không cần hỏi lại; application integration cần review phạm vi cụ thể.

## Evidence và review

Đọc source header/login/identity/private/learning/domain/tokens và subscription plan. Gate ban đầu hai index stale, refresh một lần thành công; worktree thay đổi trong lúc design nên không gọi index là proof toàn bộ candidate. Source bounded là evidence chính. Không dựa vào kết quả runtime cũ như test mới.

Browser: Codex IAB, không Playwright process bên ngoài. Đã kiểm tra 8 trang chính desktop và 24 route/viewport kết hợp ở320/390/768px: document width bằng viewport, không page horizontal overflow. Sidebar mobile được sửa thành selector sau review screenshot vì tab ngang cắt bớt nhãn. Saved screenshots là viewport captures; full-page capture của IAB có lỗi stitching nên đã thay bằng viewport ảnh chuẩn ở các artifact chính.

Đã kiểm tra: profile empty validation + save; upgrade → pending → check vẫn pending; Pro cancellation → giữ ngày hết hạn; delete confirm + Escape; unsaved draft ở mobile; generic loading/error/offline/guest. `node --check app.js` PASS. Full backend/build/tests: NOT_APPLICABLE cho standalone artifact này. Live Google/Lemon, actual data export/deletion, full screen-reader and cross-browser certification: NOT_TESTED.

Review cycle1: sửa navigation mobile bị cắt, thêm logout mobile, cảnh báo draft chưa lưu, skip-link giữ route, phân biệt retained data/paid content. Cycle2: browser retest; không phát hiện blocker cho việc xem thử trong phạm vi đã kiểm tra. Final review: **design prototype review complete; production implementation NOT_READY**. Xem `product-content-review.md` và evidence JSON. Token usage/actual billed cost: Unavailable. Memory candidates: None.

## Revision 2 — refinement theo yêu cầu “đẹp hơn và phù hợp hơn”

Đã chỉnh trên toàn bộ prototype: chia navigation thành Cá nhân / Gói & thanh toán / Dữ liệu & hỗ trợ, thêm identity ở sidebar, thay mark H bằng biểu tượng lớp gần hệ icon hiện tại, cải thiện typography và khoảng cách, panel12–14px, tương phản chữ phụ rõ hơn. Tổng quan dùng profile strip, membership nền xanh nhạt, sign-in summary và hai lối vào thiết lập. Giá Pro vẫn19,99USD/năm, checkout chưa mở. Profile tên dài được escape/wrap; mock initials ở tổng quan cập nhật từ tên đã lưu.

Evidence mới có tiền tố `r2-`, `revision2-checks.json`, `revision2-states.json`. 32 route/viewport combinations (1440/768/390/320) đã đối chiếu cả heading lẫn document width. IAB click coordinates bị lệch khi đổi viewport ở tablet; lượt đó đã được thay bằng kiểm tra keyboard Enter trên đúng links. Profile empty validation/save kiểm lại bằng bàn phím. Sáu plan states được render lại; không làm thay đổi payment hoặc quyền thật. Bộ override `refinement.css` giữ v1 làm nền prototype, không phải hướng cấu trúc CSS cho production.

Review cycle3: rà visual hierarchy/brand/control density; sửa chữ phụ quá nhạt và copy tổng quan. Cycle4: xem ảnh overview/profile/plan desktop và overview mobile; kiểm32combination, form và6states. Design artifact review complete trong phạm vi trên. Production account implementation, live auth/payment, full screen-reader/zoom chưa được kiểm chứng. Index refresh đã thử một lần; CocoIndex lỗi permission daemon.log nên discovery vẫn DEGRADED, dùng source trực tiếp. Không thay application/backend. Token usage/cost Unavailable; Memory candidates None.
