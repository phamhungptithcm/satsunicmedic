# Đặc tả sản phẩm

Trạng thái: DRAFT FOR REVIEW. Đây là hành vi cần xây dựng, không phải mô tả ứng dụng đã chạy.

## 1. Vấn đề và kết quả mong muốn

HumanScope giúp người dùng đi từ vị trí một cấu trúc đến chức năng, kiến thức bệnh học và chuyên khoa phù hợp. Điểm vào là không gian khám phá cơ thể, không phải dashboard, đặt lịch hay nhập triệu chứng. “4D” nghĩa là mô hình 3D thay đổi theo thời gian, với ý nghĩa khoa học và mức đơn giản hóa được nêu rõ.

Kết quả cần quan sát qua nghiên cứu người dùng: tìm đúng cấu trúc, hiểu điều đang xem, quay lại toàn thân được, nhận biết nguồn/giới hạn và hoàn thành bài học. Không dùng số phút xem hay số lần click làm bằng chứng hiểu y khoa. Không có tuyên bố hiệu quả điều trị.

## 2. Đối tượng và phạm vi

| Chế độ | Công việc chính | Công cụ xuất hiện |
| --- | --- | --- |
| Khám phá | Hiểu vị trí, vai trò và thông tin cơ bản | Cây cấu trúc, tìm kiếm, chọn, lớp, thông tin |
| Học tập | Nhận diện, đọc thuật ngữ, ôn tập | Nhãn Việt/Anh/Latin đã duyệt, quiz, ghi chú, tiến độ |
| Giảng dạy | Giải thích quan hệ không gian qua các cảnh | Lưu cảnh, chú thích, trình chiếu, bài học |

Chế độ là lựa chọn giao diện, **không phải vai trò phân quyền**. Chuyển chế độ giữ model version, camera, lựa chọn và các lớp. Tài khoản chỉ cần khi lưu dữ liệu lên máy chủ hoặc truy cập lớp học; mở model, bài công khai và xem bài học công khai không cần tài khoản.

| Bản đầu bắt buộc | Giai đoạn tiếp theo | Ngoài phạm vi |
| --- | --- | --- |
| Một mẫu toàn thân và một hệ chuyên sâu | Nhiều mẫu, nhiều hệ, vùng nâng cao | Chẩn đoán cá nhân, kê đơn, tính liều |
| Xoay, zoom, pan, chọn, lớp, nhãn, tìm kiếm | Mặt cắt chính xác, exploded view, so sánh | Ảnh/video giả 3D, hình học giả giải phẫu |
| Một animation đã duyệt, timeline | Nhiều mô phỏng và so sánh bệnh lý | Dự đoán thời gian tiến triển bệnh cá nhân |
| Bài đã duyệt, tra cứu cơ sở có nguồn | Dữ liệu phủ nhiều địa phương | Xếp hạng chất lượng điều trị theo sao |
| Một bài học, quiz, cảnh lưu/mở/trình chiếu/chia sẻ có kiểm soát | Flashcard, lộ trình rộng, tổ chức/LMS | Thanh toán, thương mại tài trợ chưa thiết kế |

Tính năng được dời giai đoạn vẫn phải có ID, lý do và owner chấp thuận; không được ghi PASS cho tiêu chí chưa có.

## 3. Sitemap và cấu trúc thông tin

```text
/{locale}                          Giới thiệu ngắn, đường vào khám phá
/{locale}/explore                  Không gian khám phá chính
/{locale}/anatomy/{slug}            Trang cấu trúc, HTML đọc được
/{locale}/knowledge                Thư viện kiến thức
/{locale}/knowledge/{slug}         Bài theo phiên bản/ngôn ngữ đã xuất bản
/{locale}/facilities               Danh mục và bộ lọc cơ sở
/{locale}/facilities/{slug}        Hồ sơ chi nhánh cụ thể
/{locale}/learn                    Bài học công khai và của người dùng
/{locale}/learn/{id}               Bài học/quiz
/{locale}/teach/{id}               Soạn bài và trình chiếu có quyền
/{locale}/shared/{opaqueId}        Bản chia sẻ đã được cho phép
/{locale}/account                  Hồ sơ, phiên, xuất/xóa dữ liệu
/{locale}/organizations/{id}       Lớp, thành viên (giai đoạn tổ chức)
/{locale}/editor                   Nội dung và kiểm duyệt (có quyền)
/{locale}/asset-review             Quản lý tài nguyên (có quyền)
/{locale}/sources                  Chính sách nguồn và sửa lỗi
/{locale}/privacy                  Quyền riêng tư
```

Locale đầu tiên `vi`, cấu trúc hỗ trợ `en`. Không tự xuất bản bản dịch máy; thiếu bản dịch hiện lựa chọn đọc tiếng Việt với thông báo ngôn ngữ, không gắn nhãn tiếng Anh cho bài tiếng Việt. URL không chứa triệu chứng, ghi chú hay query tìm kiếm sức khỏe. Bộ lọc nhạy cảm giữ trong bộ nhớ phiên; chia sẻ chỉ dùng nội dung/cảnh được kiểm tra riêng.

## 4. Yêu cầu chức năng có định danh

| ID | Hành vi bắt buộc | Điều kiện nghiệm thu |
| --- | --- | --- |
| HS-01 | Vào khám phá không đăng nhập | Cửa sổ mới mở được model đủ điều kiện và nội dung công khai |
| HS-02 | Orbit/zoom/pan/reset và trước/sau/trái/phải | Cả chuột, chạm và nút bàn phím; trái/phải theo cơ thể |
| HS-03 | Lớp và độ trong suốt | Chỉ lớp có asset; giữ giá trị khi đổi mode; không phá material gốc |
| HS-04 | Chọn và đồng bộ cây/model/panel | Một anatomyId, nhiều mesh; không có lựa chọn lệch nhau |
| HS-05 | Tìm kiếm tên/alias và đưa camera đến cấu trúc | Không phân biệt hoa/dấu trong truy hồi; tên hiển thị nguyên gốc; thiếu model báo rõ |
| HS-06 | Cô lập, làm mờ, breadcrumb, undo/redo | Khôi phục cả camera/lớp/selection theo transaction tương tác |
| HS-07 | Nhãn và tiếp cận không canvas | Có HTML tương đương, bàn phím và tên truy cập |
| HS-08 | 4D timeline/play/pause/speed/stage/reset | Animation và chú thích cùng mốc; không giả thời gian thực |
| HS-09 | Trang cấu trúc và bài bệnh học | Nguồn gắn claim, người duyệt thật, phiên bản, ngày rà soát |
| HS-10 | Cơ quan → bệnh → chuyên khoa → cơ sở | Quan hệ được duyệt; không suy ra chẩn đoán từ click |
| HS-11 | Cơ sở y tế và nguồn | Branch, dịch vụ, nguồn, ngày kiểm tra; CTA đến kênh chính thức |
| HS-12 | Bài học và quiz | Đáp án đã duyệt; bài công khai học không login; lưu tiến độ cần login |
| HS-13 | Cảnh giảng dạy | Lưu chính xác scene version; mở lại; conflict không ghi đè âm thầm |
| HS-14 | Chia sẻ bài và cảnh | Tối thiểu quyền, hết hạn/thu hồi, không xuất ghi chú riêng |
| HS-15 | Đa thiết bị/ngôn ngữ | Mobile dùng được, không thu nhỏ ba cột; locale độc lập viewer state |
| HS-16 | Phân quyền và xóa dữ liệu | API kiểm tra từng object; thu hồi phiên; quy trình xóa có trạng thái thật |
| HS-17 | Asset/medical publishing gate | Draft/revoked không rò qua URL, API, cache hay export |
| HS-18 | Khôi phục và lỗi | Hủy tải, retry giới hạn, mất context, offline/partial đều có đường tiếp tục |

## 5. Năm luồng cần nghiệm thu

### F1 — Khám phá cơ thể

Vào `/explore` → đọc manifest được phép → tải mẫu → xoay → tắt da → bật cơ/xương → chọn một cấu trúc → panel theo anatomyId → “Toàn thân”. Nếu lớp không có, không dựng checkbox hoạt động giả. Khi đổi mẫu, cảnh báo phần trạng thái không tương thích và cho hủy; không tự ánh xạ bằng tên mesh.

### F2 — Hiểu một cơ quan

Tìm “tim” → chọn kết quả → tải vùng nếu cần → focus đúng bounds → cô lập → mở Cấu trúc → chọn thành phần → mở Hoạt động → play/pause/scrub và đọc giai đoạn. Truy vấn mới hủy kết quả cũ; không để camera nhảy lại vì response trễ. Nếu chưa có animation hợp lệ, hiển thị nội dung đọc và lý do thiếu mô phỏng, không tạo nút play giả.

### F3 — Kiến thức và cơ sở y tế

Chọn cơ quan → bài liên quan → phần cảnh báo đã duyệt dễ thấy → chuyên khoa dựa trên quan hệ biên tập → lọc tỉnh/thành/chuyên khoa/công-tư → hồ sơ chi nhánh → nguồn/đặt lịch chính thức. Không ghi “đặt lịch thành công” khi chỉ mở liên kết. Nếu chưa có cơ sở đủ bằng chứng, hiện trạng thái thiếu dữ liệu, không suy ra không có cơ sở ở địa phương. Nội dung khẩn cấp do chuyên gia duyệt; không hướng đi xa để tìm nơi nổi tiếng.

### F4 — Tự học

Mở bài đã duyệt → đọc mục tiêu → xem cảnh → ẩn nhãn → chọn cấu trúc trả lời → nhận giải thích sau nộp → tiếp tục. Guest giữ tiến độ tạm trong phiên, UI ghi rõ; đăng nhập để lưu lên máy chủ. Đồng bộ retry không tạo nhiều attempt. Mất mạng giữ đáp án tạm, chỉ báo “Đã lưu tiến độ” khi server xác nhận.

### F5 — Giảng dạy

Người có quyền mở bài → chọn hệ → lưu camera/lớp/selection/time → chú thích → thêm câu hỏi → sắp thứ tự → trình chiếu → lưu revision → chia sẻ bản được phép. Cảnh tham chiếu model không còn được sử dụng phải dừng ở thông báo có thể đọc, không tự đổi sang model mới. Ghi chú riêng không được đưa vào snapshot chia sẻ. Export ảnh và nhúng chỉ bật khi giấy phép cho phép.

## 6. Nội dung cơ quan và bệnh học

Panel cơ quan có Tổng quan, Cấu trúc, Hoạt động, Bệnh liên quan. Tên chuyên sâu/Latin chỉ xuất hiện khi có bản thuật ngữ đã duyệt. Bài bệnh học phân biệt nguyên nhân/yếu tố nguy cơ, triệu chứng/dấu hiệu cần thăm khám; có cách đánh giá, hướng điều trị/phòng ngừa mang tính giáo dục, chuyên khoa, nguồn và phiên bản. Phần thuốc chỉ nói nhóm/mục đích/lưu ý, không liều hay thay đổi đơn.

Mỗi bài có tác giả, người duyệt thực tế, nguồn theo đoạn/claim, ngày xuất bản/rà soát và báo lỗi. Dòng giới hạn: “Nội dung phục vụ học tập và tham khảo, không thay thế thăm khám hoặc chẩn đoán của nhân viên y tế.” Không tự thêm tên chuyên gia, logo trường hay dấu chứng nhận.

## 7. Đo thành công và phạm vi dữ liệu

Đề xuất usability: mỗi nhóm có ít nhất 5 người trong vòng nghiên cứu đầu; ghi tỷ lệ hoàn thành F1–F5 và lỗi thao tác, không coi mẫu nhỏ là thống kê đại diện. Chỉ sự kiện kỹ thuật tối thiểu, không query/triệu chứng/ghi chú trong analytics. Mọi nghiên cứu có đồng ý và quy tắc lưu trữ riêng. Mục tiêu kinh doanh, ngân sách, đối tác nội dung và tên thương hiệu cuối cùng: owner chốt ở D-01…D-10 trong [decision register](09-decisions.md).
