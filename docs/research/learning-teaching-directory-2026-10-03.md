# Học tập, giảng dạy và tra cứu cơ sở y tế — nghiên cứu sản phẩm

Ngày nghiên cứu: 2026-10-03. Phạm vi: web tiếng Việt, Việt Nam, cả phổ thông/sinh viên y/chuyên khoa. Đây là nghiên cứu và đề xuất triển khai; không phải tính năng đã nghiệm thu, danh bạ toàn quốc hoặc thẩm định y khoa.

## 1. Khoảng trống xác minh từ source

| Luồng | Đã có | Thiếu để người dùng làm xong việc |
|---|---|---|
| Học | 27 chủ đề, atlas chung, 3 mô phỏng, quiz published có chấm server, lịch ôn/attempt riêng tư | Landing theo mục tiêu/trình độ; lesson-unit-objective liên kết; quay lại đúng vị trí; phân biệt bài đọc và quiz đã xuất bản; thống kê có ý nghĩa |
| Dạy | Private lessons, scene CRUD một phần, chia sẻ snapshot đã bỏ annotation, hết hạn/thu hồi | UI chỉ tạo tên bài và liệt kê; thiếu scene sequence, soạn câu hỏi/ghi chú giảng, trình chiếu, bài giao/lớp học |
| Cơ sở | API lọc areaCode/specialty; chỉ đọc PUBLISHED còn hạn; endpoint chi nhánh | UI không truyền bộ lọc, chỉ lấy 20 mục; chưa có tìm tên/bệnh, cursor, trang chi nhánh, taxonomy địa giới/chuyên khoa và pipeline nguồn |
| Liên thông | Atlas và disease-anatomy đã nối 25 chủ đề với cấu trúc | Chưa có quan hệ bệnh–chuyên khoa–dịch vụ có nguồn; không thể suy ra từ organ string |

Source: apps/web/src/app/hoc-tap/page.tsx; components/quizzes.tsx, learning-reviews.tsx, explorer.tsx PersonalPanel; apps/api/src/private.ts, learning.ts, facilities.ts, domain.ts; packages/contracts/src/index.ts; packages/anatomy-viewer/src/scene-history.ts.

Rủi ro tích hợp cụ thể: BodyScene của atlas mới lưu hidden/opacity/isolate/sections/camera, trong khi SceneSnapshot v1 của backend dùng assetVersionId UUID, mappingVersion và schema khác. Không được ép kiểu hoặc bỏ bớt trạng thái để tuyên bố lưu/khôi phục đúng cảnh. Phải có schema và adapter versioned, asset registry và validation tương ứng.

## 2. Nghiên cứu và quyết định sản phẩm

### Học để nhớ và giải thích được

[IES/WWC — Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1), hướng dẫn 2007, được đọc lại 2026-10-03, hỗ trợ học giãn cách, truy hồi bằng quiz, kết hợp hình với giải thích và câu hỏi yêu cầu giải thích sâu. Bằng chứng này không xác nhận lịch 1/3/7/14/30 là tối ưu, cũng không chứng minh hiệu quả lâm sàng của sản phẩm.

Suy luận thiết kế: mỗi đơn vị có mục tiêu, quan sát có nhiệm vụ, câu hỏi trước khi hiện giải thích, ôn lại câu sai và lịch ôn. Chỉ số gồm kết quả lần đầu, kết quả ôn sau khoảng thời gian và chủ đề cần ôn; không biến số lần bấm/xem video thành năng lực chuyên môn. Chọn mức học quyết định nội dung thực có; mức chuyên khoa thiếu phải hiện thiếu.

### Giảng viên cần hoàn thành một buổi dạy

Luồng đề xuất: chọn mục tiêu → thêm cảnh atlas/chuỗi cơ chế/câu hỏi → sắp xếp → xem như học viên → trình chiếu (ẩn ghi chú và đáp án) → lưu revision → giao cho lớp → xem trạng thái nộp và nhóm câu sai. Bài riêng tư là mặc định; mở chế độ giảng dạy không cấp vai trò quản trị hay xuất bản y khoa. Lớp học cần membership/quyền riêng; không tái sử dụng public share như quyền lớp.

### Địa giới cần thời gian hiệu lực

[Quyết định 19/2025/QĐ-TTg — mã đơn vị hành chính](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/19ttg.signed.pdf) là điểm khởi đầu của danh mục 34 đơn vị cấp tỉnh từ 2025; không đủ để hardcode nhãn mãi mãi. [Nghị quyết 30/2026/QH16](https://chinhphu.vn/?classid=1&docid=218009&pageid=27160) về thành phố Đồng Nai được ban hành 24/04/2026, có hiệu lực 30/04/2026 theo metadata chính thức. Cần tra thêm mọi sửa đổi trước khi chốt toàn bộ danh mục triển khai.

Suy luận thiết kế: areaCode ổn định + loại/tên + effectiveFrom/effectiveTo + predecessor/alias có nguồn. Tìm tên tỉnh cũ có thể đưa tới khu vực mới với lời giải thích; không tự thay địa chỉ đường/phường của một chi nhánh nếu chưa đối chiếu. Quận/huyện lịch sử là dữ liệu tìm kiếm, không bắt buộc như tầng hiện hành cho mọi địa chỉ. Người dùng chọn tỉnh thủ công trước; không cần quyền vị trí để dùng tính năng.

### Cơ sở phải đúng chi nhánh và đúng dịch vụ

[Bạch Mai — đơn vị và thông tin liên hệ](https://bachmai.gov.vn/don-vi) được đọc 2026-10-03: website công bố cơ sở Hà Nội tại 78 Giải Phóng, phường Kim Liên và cơ sở Ninh Bình tại QL21B, phường Liêm Tuyền; có liên kết đặt lịch chính thức. Thông tin này chứng minh phải tách branch khỏi legal entity. Danh sách đơn vị ở trang cấp bệnh viện không tự chứng minh mọi chi nhánh có cùng dịch vụ.

[Bài Chính phủ về ứng dụng tra giấy phép](https://tphcm.chinhphu.vn/ra-mat-ung-dung-tra-cuu-giay-phep-hoat-dong-cua-co-so-y-te-10116787.htm) là nguồn lịch sử xác nhận cách tiếp cận tra giấy phép. Không coi bài 2017 là danh sách cơ sở đang hoạt động năm 2026 hay API sẵn dùng. Trang Chợ Rẫy không đọc được qua công cụ; trang Huế trả nội dung không đủ. Hai nguồn này chưa đủ để đưa bản ghi dịch vụ vào dữ liệu phát hành.

Suy luận thiết kế: tách bằng chứng cơ quan quản lý (giấy phép/trạng thái) và website cơ sở (dịch vụ/liên hệ). Mỗi claim dịch vụ có branch, specialty/service, URL, ngày truy cập, ngày hiệu lực nếu có, hạn đối chiếu. Hiện “theo website cơ sở” khác “đã đối chiếu giấy phép”. Không suy ra chất lượng, lịch trống, BHYT, giá hay khả năng điều trị từ tên bệnh viện.

## 3. Luồng tạo giá trị

1. Người học mở hen → mục tiêu → quan sát phế quản → trả lời câu hỏi → xem giải thích/nguồn → ôn lại. Câu trả lời bài nháp chỉ là luyện tập trong phiên; chỉ quiz published mới lưu như attempt server đã chấm.
2. Giảng viên chuẩn bị bài: chọn các cảnh và câu hỏi có nguồn, lưu, mở lại đúng camera/ẩn cơ/mặt cắt; trình chiếu không lộ ghi chú riêng hay đáp án; giao bài phiên bản cố định; thu hồi quyền có hiệu lực lần truy cập tiếp theo.
3. Người dùng đọc chủ đề bệnh → “Chuyên khoa liên quan” → chủ động chọn chuyên khoa và tỉnh/thành → xem chi nhánh có evidence phù hợp → đọc căn cứ/ngày kiểm tra → mở kênh chính thức. Đây là tra cứu thông tin, không xác định người dùng mắc bệnh hay chỉ định nơi điều trị.
4. Không có dữ liệu: phân biệt lỗi kết nối, không khớp bộ lọc và chưa có dữ liệu đủ nguồn. Cho bỏ bộ lọc/đọc nguồn; không hiện “tỉnh này không có cơ sở”.

## 4. Dữ liệu và giá trị thực

Không đặt mục tiêu giả là “100% bệnh viện” khi chưa có nguồn cấp phép tái sử dụng toàn quốc. V1 phải có bản đồ phủ dữ liệu theo tỉnh/chuyên khoa với trạng thái chưa khảo sát/đang đối chiếu/có bản ghi. Số lượng nguồn đủ điều kiện quyết định danh sách công khai; số hàng database không phải chất lượng.

Mục tiêu nghiệm thu kỹ thuật: truy hồi chính xác các fixture đã biết; không cross-user; không dùng nội dung rút/hết hạn; URL bộ lọc có thể chia sẻ; next page không mất mục; scene round-trip không mất trường; retries không nhân đôi bài/attempt. Nghiệm thu giá trị: pilot một người học, một người soạn bài và một người tra cứu hoàn thành từng kịch bản; đây là test usability, không chứng minh hiệu quả đào tạo.

Không ghi nội dung ghi chú, câu trả lời tự do, truy vấn triệu chứng hoặc lịch sử chọn bệnh vào telemetry dùng chung. Event tối thiểu chỉ thêm sau đánh giá mục đích/quyền và không tự bật third-party analytics.
