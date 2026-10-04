# Design system — HunpeoLabs × Satsunic cho HumanScope

Trạng thái: PROPOSED; mới có đặc tả, chưa có màn hình đã render hoặc kiểm thử thị giác.

## 1. Nguồn và cách chuyển thành thiết kế

Đã đọc `HunpeoLabs/styles/tokens.css`: nền trắng, accent `#173df5`, chữ `#111111`, viền `#d9dbe1`, radius nhỏ, spacing theo bội số 4. Đã đọc `Satsunic/docs/design/satsunic-ui-contract-v1.md`: paper white, royal blue `#163cff`, navy `#111c35`, Inter, giao diện gọn, xanh lá chỉ mang nghĩa trạng thái. Đây là nguồn phong cách trực tiếp; không lấy green SEO console làm chuẩn.

HumanScope chọn **một accent duy nhất `#163cff`** để không trộn hai xanh gần nhau. Dùng nhịp bố cục và tính tiết chế của HunpeoLabs, ngôn ngữ workspace của Satsunic. Logo/tên HumanScope tạm, không tự sao chép logo hay tuyên bố sản phẩm được chứng nhận. Riêng canvas dùng tối trung tính để tôn hình khối, giữ màu mô hình gần tài nguyên đã duyệt.

## 2. Tokens đề xuất

| Token | Giá trị | Cách dùng |
| --- | --- | --- |
| surface/base | `#ffffff` | Nội dung, panel |
| surface/subtle | `#f5f6f9` | Khung ứng dụng, nhóm phụ |
| surface/selected | `#edf1ff` | Hàng được chọn, kèm indicator |
| brand/action | `#163cff` | Hành động chính và lựa chọn |
| brand/link | `#0b29c7` | Liên kết chữ trên nền sáng |
| ink/primary | `#111c35` | Tiêu đề, điểm neo |
| ink/body | `#3e4350` | Nội dung |
| ink/muted | `#697080` | Thông tin phụ; cần đo contrast từng cặp |
| line/subtle | `#d9dce4` | Phân vùng; không dùng làm sole control boundary |
| line/strong | `#a8adba` | Viền cần rõ hơn; vẫn phải đo contrast |
| viewer/base | `#151619` | Vùng model |
| viewer/raised | `#202126` | Toolbar tối |
| viewer/text | `#f7f7f8` | Chữ trên canvas |
| semantic/success | `#08783f` | Lưu được/đã xác minh, kèm chữ |
| semantic/warning | `#8a5700` | Hạn chế/rà soát, kèm chữ |
| semantic/error | `#b42318` | Lỗi/cảnh báo, kèm chữ |

Màu giải phẫu do chuyên môn và asset quyết định; không đổi toàn bộ mô hình thành màu brand. Selection dùng outline và nhãn, giữ màu gốc khi cần phân biệt cấu trúc. Tokens semantic không đồng nghĩa “đã duyệt y khoa”; trạng thái phải đi từ dữ liệu thật.

Typography: Inter có glyph tiếng Việt, fallback system sans-serif. Nội dung 16px/1.6; điều khiển 14px/1.4; metadata 13px/1.5; tiêu đề 20/24/32px. Chế độ trình chiếu đề xuất chữ tối thiểu 20px, nhãn 18px. Kiểm tra giấy phép font trước đóng gói. Không cố nhét tên giải phẫu dài bằng chữ nhỏ.

Spacing 4/8/12/16/24/32/48px; radius control 6px, panel 8px; dialog 12px; pill chỉ cho tag ngắn. Shadow nhẹ cho popover; panel chia bằng border. Primary action tối đa một hành động nổi trội trong từng vùng nhiệm vụ. Motion 120–180ms; chuyển camera ≤400ms và có ngắt; reduced-motion bỏ transition camera và không autoplay animation.

## 3. Bố cục màn hình khám phá

### Desktop ≥1280px

```text
┌ Logo · Khám phá · Kiến thức · Cơ sở y tế · Học tập     Ngôn ngữ · Tài khoản ┐
├ Chế độ: Khám phá / Học tập / Giảng dạy · đường dẫn cấu trúc               ┤
│ Panel cấu trúc     │ Canvas rộng nhất có thể         │ Thông tin          │
│ Mẫu / hệ / vùng    │                                 │ Tên + nguồn        │
│ Tìm cấu trúc       │        MODEL THỰC               │ Các tab nội dung   │
│ Cây + lớp          │                                 │ Mở trang đọc       │
│ Độ trong suốt      │ Góc nhìn · nhãn · cô lập · reset │                    │
├───────────────────┴ Timeline chỉ khi có mô phỏng ────┴────────────────────┤
│ Cảnh bài học chỉ trong chế độ học/giảng dạy                               │
└─────────────────────────────────────────────────────────────────────────┘
```

Header khoảng 56px; context bar 44px; trái 256px; phải 320px; canvas chiếm phần còn lại, tối thiểu hữu dụng đề xuất 480px. Khi không đủ chỗ, chuyển cấu trúc thành drawer trước khi làm model quá nhỏ. Canvas không có thống kê trang trí. Trang đọc riêng 65–75 ký tự mỗi dòng, nguồn gắn phần liên quan.

### Tablet 768–1279px

Một canvas và tối đa một panel 300px; cấu trúc/thông tin mở luân phiên, không phủ cả hai lên model. Toolbar có nhãn khi đủ chỗ; popover dùng được bằng tap. Landscape giữ vùng model rộng; portrait dùng sheet dưới. Zoom 200% theo chiều rộng hiệu dụng, không theo loại thiết bị.

### Mobile <768px

Header gọn, canvas ở trên và ba điểm vào rõ: Cấu trúc, Thông tin, Hoạt động. Bottom sheet có mức gọn/mở rộng; phần nội dung dài cuộn trong vùng xác định. Mở thông tin không mất camera; nút Đóng trở lại model và trả focus vào nút mở. Fullscreen overlay cần focus trap, Escape, nền inert; sheet không modal không khóa focus tùy tiện. Không phụ thuộc hover, hỗ trợ safe area và bàn phím ảo. Có nút thay thế pinch/pan/drag.

## 4. Các màn hình còn lại

| Màn hình | Thành phần chính | Trạng thái cần thiết |
| --- | --- | --- |
| Thư viện | Search, nhóm chủ đề, kết quả dạng hàng | Đang tải, không khớp, lỗi, thiếu bản dịch |
| Bài kiến thức | Tiêu đề, cảnh báo, mục lục, nội dung, nguồn, duyệt | Bị rút, đến hạn rà soát, offline |
| Danh mục cơ sở | Bộ lọc, danh sách, nguồn/ngày kiểm tra | Chưa có dữ liệu, bộ lọc rỗng, lỗi; không hiện số 0 thay lỗi |
| Hồ sơ cơ sở | Chi nhánh, chuyên khoa, căn cứ phù hợp, kênh chính thức | Link lỗi, dữ liệu cũ, chưa đủ bằng chứng |
| Học tập | Mục tiêu, model, câu hỏi, giải thích, tiến độ | Guest tạm, đang lưu, conflict, lỗi lưu |
| Soạn giảng | Dải cảnh, model, chú thích, lưu/chia sẻ | Chưa lưu, lưu thành công, version thiếu, giấy phép chặn |
| Quản trị | Hàng đợi duyệt, diff revision, nguồn, lịch sử | Quyền hạn, stale revision, duyệt thất bại |

## 5. Hợp đồng component và bàn phím

- Button 40px ở desktop, 44px trên touch; trạng thái hover/focus/pressed/disabled/pending riêng. Mục tiêu đáp ứng WCAG 2.2 AA; kích thước 44px là quyết định sản phẩm, không phải tuyên bố ngưỡng AA bắt buộc cho mọi nút.
- Focus ring 2px có offset; không để toolbar/sheet che focus. Chữ thường contrast ≥4.5:1, chữ lớn ≥3:1; thông tin đồ họa/control cần thiết ≥3:1 theo điều kiện WCAG. Phải đo từng cặp thực tế, không suy từ token.
- Tree: mũi tên mở/đóng/di chuyển; Enter chọn; Space đổi hiển thị khi focus đúng switch. Checkbox/switch và chọn hàng là hai hành động khác nhau.
- Slider: có label, giá trị %, keyboard step 5%, Home/End; pointer thả mới ghi một history entry.
- Tabs: thông tin theo pattern web, `aria-selected`, quan hệ panel; không chuyển focus mỗi lần model đổi.
- Timeline: slider có tên, thời điểm và giai đoạn; live region không phát mỗi frame. Icon luôn có tên truy cập; tooltip không thay accessible name.
- Shortcuts chỉ hoạt động khi focus viewer, không chiếm bàn phím ô nhập. Help liệt kê các phím và có cách tắt. Không dùng một gesture làm đường duy nhất.

Nguồn tiêu chuẩn: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Đây là tiêu chí cần kiểm thử, chưa phải kết quả chứng nhận.

## 6. Copy và trạng thái dự kiến

Toàn bộ copy dưới đây là **proposed**, chỉ đưa vào sản phẩm khi hành vi tương ứng có thật.

| Bề mặt/trạng thái | Nội dung | Điều kiện/đường tiếp tục |
| --- | --- | --- |
| Điều hướng | Khám phá · Thư viện kiến thức · Cơ sở y tế · Học tập & Giảng dạy | Từng đích có route thật |
| Search | Tìm cấu trúc | Label cố định, không chỉ placeholder |
| Viewer/loading | Đang tải mô hình… | Progress % chỉ khi đo được tổng byte |
| Viewer/missing | Mô hình này chưa sẵn sàng. Bạn vẫn có thể đọc thông tin cấu trúc. | Link đến HTML đã xuất bản |
| Viewer/load error | Chưa tải được mô hình. | Thử lại, Đọc thông tin; không gọi lỗi mạng là thiếu model |
| Viewer/context lost | Phiên xem 3D đã bị gián đoạn. | Mở lại mô hình; khôi phục state sau tải thành công |
| Search/empty | Không tìm thấy cấu trúc phù hợp. | Xóa tìm kiếm; giữ cây |
| Animation/unsupported | Chưa có mô phỏng cho cấu trúc này. | Hiển thị bài Hoạt động nếu có |
| Scene/dirty | Cảnh có thay đổi chưa lưu. | Lưu cảnh khi có quyền |
| Scene/success | Đã lưu cảnh. | Chỉ sau ACK có revision |
| Scene/error | Chưa lưu được cảnh. Các thay đổi vẫn còn trong phiên này. | Thử lại khi state còn thật |
| Scene/conflict | Cảnh đã được thay đổi ở một phiên khác. | Xem bản mới / Lưu thành bản riêng |
| Guest/progress | Tiến độ chỉ được giữ trong phiên này. | Đăng nhập để lưu; không tự tạo tài khoản |
| Directory/empty | Chưa có cơ sở đã xác minh phù hợp với bộ lọc này. | Đổi bộ lọc, không gợi ý cơ sở bịa |
| Directory/stale | Thông tin cần được kiểm tra lại. | Ngày kiểm tra gần nhất + nguồn chính thức |
| Restricted | Bạn không có quyền thực hiện thao tác này. | Không lộ tên người/lớp/tài nguyên riêng |
| Content/withdrawn | Nội dung này hiện không được cung cấp. | Quay lại thư viện; không phục vụ cache cũ |
| Offline | Đang mất kết nối. Một số nội dung chưa thể tải. | Không hứa lưu/chạy offline nếu chưa có |
| Delete request | Yêu cầu xóa dữ liệu đã được ghi nhận. | Không đồng nghĩa xóa hoàn tất; theo dõi trạng thái |

## 7. Bản địa hóa và nguyên tắc nội dung

Nhãn Việt tự nhiên, sentence case, một thuật ngữ cho một khái niệm; tên Latin phụ trợ, không thay tên dễ hiểu. `Intl` định dạng ngày/số theo locale; lưu thời gian UTC. Ngày rà soát khác ngày sửa bài. Không cắt mất nội dung cảnh báo; nguồn và giấy phép không nằm trong tooltip duy nhất. Pseudolocale mở rộng 40%, kiểm tra tên dài, 200% zoom, screen reader và mobile trước khi duyệt UI.

| Nguyên tắc | Điều kiện phải kiểm chứng trong UI |
| --- | --- |
| Purpose | Model và đường tìm cấu trúc là trọng tâm |
| Agency | Khách vào ngay, hủy tải, undo/reset, không mất cảnh khi đổi mode |
| Responsibility | Nguồn, quyền, giới hạn và lưu tạm/lưu thật được phân biệt |
| Familiarity | Điều khiển web chuẩn và từ vựng nhất quán |
| Flexibility | Bàn phím, touch, HTML thay canvas, Việt/Anh, zoom |
| Simplicity | Công cụ nâng cao chỉ mở theo nhu cầu |
| Craft | Đủ lỗi/empty/conflict/loading, không thành công giả |
| Delight | Tiếp tục việc đang làm, ít gián đoạn, motion phục vụ định hướng |

Product Language Gate cho **UI thực thi: NOT_RUN/BLOCKED** vì chưa có UI. Không dùng bảng nguyên tắc này để tự đánh dấu PASS trước khi kiểm tra màn hình thực.
