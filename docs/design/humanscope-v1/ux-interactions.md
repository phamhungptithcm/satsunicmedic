# Đặc tả UI/UX — exploration-first

Scope: màn hình khám phá desktop/mobile và chế độ hoạt động 4D. Các màn hình thư viện, cơ sở, bài học đầy đủ tiếp tục theo product spec, chưa được dựng visual ở bộ này.

## 1. Quyết định thị giác

Kế thừa HunpeoLabs/Satsunic: nền #fff, blue #163cff, navy #111c35, line #d9dce4, canvas #151619; nội dung thật không tô màu theo brand làm sai ý nghĩa giải phẫu. Inter/system sans hỗ trợ Việt; body 16/24px, UI 14/20px, title 24/30px; spacing 4/8/12/16/24/32px. Radius controls 6px, panel 8px, modal 12px. Desktop header 56px, context 44px, tree 256px, inspector 320px; canvas phần còn lại. Những số này là thông số implementation đề xuất, ảnh raster chỉ reference.

Primary action trong panel là Xem hoạt động khi asset có capability. Chưa có clip thì thay action bằng trạng thái thiếu, không để nút xanh gợi khả dụng như bản concept. Không lấy play button trong ảnh làm chứng cứ có animation.

## 2. Hệ thống màn hình và điều hướng

| ID | Vào từ | Bố cục / việc chính | Thoát và trạng thái giữ |
| --- | --- | --- | --- |
| E-01 | Mở khám phá | Cây hệ, fullbody canvas, panel đóng hoặc cơ quan được chọn | Camera/lớp/mẫu/selection ở viewer store |
| E-02 | Chọn cấu trúc | Cây + outline + panel cùng anatomyId | Back về cấu trúc cha, không reload model |
| E-03 | Cô lập | Chỉ cấu trúc, context tối giản, minimap phụ | Về toàn thân trả camera/lớp trước isolate |
| E-04 | Hoạt động | Canvas cơ quan, giai đoạn, timeline | Rời màn hình pause; về E-02 giữ góc trước |
| M-01 | Mobile explore | Canvas và action bar | Không mount ba cột desktop |
| M-02 | Mở cấu trúc/thông tin | Một sheet tại một thời điểm | Close trả focus; selection/camera không đổi |
| L-01 | Học tập | Cùng viewer, câu hỏi thay inspector | Đổi mode không reset cấu trúc |
| T-01 | Giảng dạy | Dải scene xuất hiện, chữ lớn/fullscreen | Scene pin assetVersion; chưa lưu có chỉ báo |

L-01/T-01 là interaction contract, chưa có visual riêng; không coi ba ảnh là toàn bộ sản phẩm hoàn tất.

## 3. Chuỗi tương tác mẫu

1. E-01 mở không login. Người dùng mở Tuần hoàn hoặc tìm Tim. Chờ region load có hủy.
2. Chọn kết quả → focus bounds tương ứng → E-02 với Tim được chọn trong cả cây/panel/model. Kết quả request cũ không đổi lựa chọn mới.
3. Chọn Cô lập → E-03, push snapshot camera/lớp vào history. Nhãn chỉ của cấu trúc liên quan.
4. Chọn Hoạt động → E-04. Nếu chưa có clip/review/license hợp lệ, dừng ở unavailable + nội dung đọc đã duyệt, không chơi animation thay thế.
5. Bấm Phát khi clip có thật; stage/text/model chạy cùng clock. Scrub thì pause theo quyết định UI và giữ điểm chọn; resume do người dùng.
6. Về toàn thân → restore snapshot trước cô lập; mode/locale không làm mất selection.

Hai thao tác “chọn cấu trúc” và “bật lớp” khác nhau: click tên cập nhật selection; switch đổi visible. Opacity điều khiển lớp được chỉ tên, không ghi chung “Độ trong suốt” mà không xác định đối tượng trong implementation. Click selection ẩn phải cho lựa chọn hiện lớp, không tự bật mọi lớp.

## 4. Mobile và tablet

- <768px: model area khoảng 52–62dvh khi sheet đóng, toolbar và safe area còn trong viewport. Không cố bắt đầu bằng toàn bộ nội dung sheet mở rộng như ảnh cao.
- Sheet có compact khoảng 120px, medium khoảng 40dvh, expanded tối đa 85dvh; dùng content constraints và bàn phím ảo, không cố định pixel duy nhất. Có button mở rộng/thu gọn, không chỉ drag.
- Mỗi lần chỉ một sheet. Canvas không nhận gesture ở dưới sheet; khi modal expanded, focus trap/inert/Escape; nonmodal compact không trap.
- Chọn cấu trúc xong có thể thu sheet để xem camera focus; không tự đóng nội dung đang đọc ngoài hành động chọn.
- 768–1279px: canvas + một panel, panel còn lại drawer; landscape không ép ba cột khi canvas <480px.
- 200% zoom theo effective width, text expansion 40%; control touch ≥44px, spacing ≥8px; không khoá orientation.

## 5. Trạng thái và copy chuẩn cho triển khai

| State | Copy đề xuất | Hành vi |
| --- | --- | --- |
| Loading | Đang tải mô hình… | Progress khi đo được; hủy tải |
| Không có model | Mô hình này chưa sẵn sàng. | Mở HTML đã xuất bản nếu có |
| Lỗi tải | Chưa tải được mô hình. | Thử lại; giữ metadata an toàn |
| Chưa duyệt bài | Chưa có nội dung được xuất bản. | Không dùng bài nháp làm filler |
| Thiếu clip | Chưa có mô phỏng cho cấu trúc này. | Không phát giả, không timer chạy một mình |
| Context loss | Phiên xem 3D đã bị gián đoạn. | Mở lại; restore paused |
| Không khớp search | Không tìm thấy cấu trúc phù hợp. | Giữ cây; xóa query được |
| Phiên scene chưa lưu | Cảnh có thay đổi chưa lưu. | Không báo saved trước ACK |

Chuẩn copy ở đây ưu tiên hơn câu phụ tự sinh trong ảnh. Không hứa “sẽ được cập nhật” vì chưa có cam kết lịch nội dung. Trong product thật footer design được bỏ, thay bằng giới hạn giáo dục và metadata nguồn thực tế; trong mọi demo dùng ảnh AI thì phải giữ disclosure AI/chưa kiểm duyệt.

## 6. Hợp đồng 4D

Timeline chỉ hiện khi clip có đủ capability. Các control: Phát/Tạm dừng, seek, từng giai đoạn, tốc độ xem, reset. `currentTime` duy nhất xác định animation pose và stage; UI readout throttle, không React render từng frame. Không đưa thời gian đồng hồ lên UI nếu đó chỉ là normalized educational phase.

Scrub keyboard có min/max/step/aria-valuetext đúng metadata, không ghép thời gian sinh lý tùy ý. Stage labels hoàn toàn từ nội dung được duyệt, không đóng cứng ba pha như concept. Các lựa chọn 0.5×/1×/2× là tốc độ phát tương đối clip, không nhịp tim hoặc dự báo bệnh. Hidden tab/reduced-motion không auto-play.

## 7. Accessibility và phím

Native button/link/input; focus-visible 2px+offset, không icon-only thiếu tên. Tab vào tree; arrows điều hướng, Enter chọn, switch có accessible name riêng. Label “Tim” luôn cùng anatomyId; không phân biệt anatomy left/right theo vị trí màn hình.

Không dùng màu alone: selected row có line và state, mesh có outline + label, stage có số và tên. Trình đọc màn hình nhận HTML anatomy hierarchy/description, không phải mô tả từng frame của canvas. `aria-live=polite` cho chọn/lỗi/save, không announce liên tục 10Hz. Có nút cho pan/zoom, không phụ thuộc drag/pinch. Chính xác giải phẫu và a11y runtime vẫn cần test riêng.

## 8. Criteria cần kiểm chứng

F1/F2 chạy bằng mesh thật; E-04 đúng clock/clip; search/cancel/history đồng bộ; sheet không che cấu trúc ở mobile; controls đủ hit area; long Vietnamese/200% zoom; NVDA/VoiceOver; empty/error/context-lost. Bộ thiết kế hiện không có kết quả những test app này.
