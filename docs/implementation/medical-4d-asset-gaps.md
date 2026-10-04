# HS-MED4D-2 — dữ liệu cần để đi từ atlas tương tác tới 4D y khoa

Ngày 2026-10-01. Phạm vi đã duyệt A–D: dữ liệu hiện có, không chi phí mới; E–F là đầu vào và kế hoạch. Không chứng nhận lâm sàng, không xuất bản asset production.

## Nền dữ liệu thực tế

V2 chứa đủ 1.258 phần nguồn thuộc FMA20394 (toàn cơ thể) của archive BodyParts3D 4.0, thay cho 861 phần ở V1. Có 44 GLB, tổng 65.930.408 byte, lớn nhất 6.171.944 byte; da khởi đầu 4.901.204 byte. 3.138.996 tam giác. Mỗi mesh giữ FJ riêng, mọi quan hệ FMA many-to-many được lưu; nhóm Tim FMA7088 chọn 83 phần, không gộp thành một mesh. Chunks tối đa 32 phần, trừ da riêng, có giới hạn 8 MB. Ngoài vùng được ánh xạ, phần nguồn nằm trong nhóm `other` và vẫn truy cập qua tìm kiếm hoặc toàn thân bên trong. Không gán vùng không có bằng chứng.

Màu chỉ phân biệt nhóm theo hệ/thuật ngữ artery/vein từ nguồn. Không thể hiện oxygenation, màu mô thật hay dữ liệu bệnh nhân. Bề mặt khoang có khái niệm nguồn `cavity` được làm mờ 16%, không gọi là thành mô. Metadata giữ mọi khái niệm cụ thể đồng hạng, không tự phong một nhãn canonical.

## Bài hoạt động hiện có

Explorer giữ nguyên trạng thái khi mở panel cơ chế mạch vành. Cầu nối dùng FJ thực sự trùng với `preview-assets/heart/binding.json`; bài giữ hệ tọa độ riêng, không ghép trực tiếp lên toàn thân. Lựa chọn đầu vào là đúng source binding. Khi quay lại, panel bị unmount, clock được dừng; explorer không bị unmount. Camera/lựa chọn/lớp/history được giữ. Đây là minh họa định tính cơ chế nhồi máu do huyết khối trên nền xơ vữa, không phải chu kỳ co bóp. `territory:null` không được chuyển thành vùng tổn thương giả.

## Storyboard chu kỳ tim — chỉ là yêu cầu đầu vào

| Giai đoạn cần dựng | Asset và dữ liệu phải có | Trạng thái |
|---|---|---|
| Đổ đầy tâm thất | Buồng/van và hình học theo pha, nguồn thời gian và góc nhìn | Thiếu clip/rig được xác minh |
| Co đẳng tích | Mesh biến dạng bảo toàn tương ứng cấu trúc, chuyển động van | Thiếu biến dạng/kiểm định |
| Tống máu | Pha co bóp, mở van, dữ liệu giải thích có nguồn | Thiếu clip; không dùng hạt làm bằng chứng lưu lượng |
| Giãn đẳng tích | Chuyển pha và đóng van được kiểm tra | Thiếu clip/reviewer |
| Liên kết tín hiệu | Nếu có ECG/áp lực thì có đơn vị, dữ liệu nguồn và đồng bộ | Chưa có; không tự sinh số đo |

Không dùng scale đồng nhất toàn tim, texture AI, hay một đồng hồ camera quay để thay các dữ liệu này. Cần topology/UV/LOD/rig hoặc morph targets, clip/version/hash, nguồn/license web thương mại, danh tính người duyệt và receipt từng cấu trúc/pha. Sản phẩm có thể phát triển kỹ thuật tiếp trong khi chờ đầu vào; không tự đánh dấu review đạt.

## Mở rộng E

- Hô hấp: cặp phổi/phế quản cần bề mặt nhu mô đủ, đăng ký chuyển động lồng ngực/cơ hoành/phổi cùng một mẫu; mô hình mạch/phế quản không tự đại diện nhu mô. Pha hít/thở phải có nguồn.
- Hệ vận động: cấu trúc cơ/gân/xương riêng, vị trí bám, trục khớp, giới hạn và clip xác minh. Atlas tĩnh không chứng minh động học; không suy ra hệ cơ từ vị trí hay màu.
- Thần kinh/tiêu hóa/tiết niệu/nội tiết: phạm vi bài, cấu trúc liên quan và biểu diễn theo thời gian riêng, không đổi tên bài tim.
- Lát cắt: cần volume cryosection/CT/MRI có quyền và registration; mặt phẳng clipping hiện tại không có mặt cắt mô nội suy. Không dán mẫu Visible Human khác lên BodyParts3D rồi gọi đồng nhất.
- Kiểm định: pilot ít nhất một giảng viên và năm người học là đề xuất nghiên cứu usability, chưa tiến hành; không gọi là hiệu quả giáo dục đã chứng minh.

## Production F

Giữ route candidate development-only; asset publication/API delivery guard không đổi. Trước mở production cần metadata published thật, license receipt cho phiên bản phân phối, reviewer receipt cho nội dung thuộc phạm vi phát hành; endpoint/storage/cache/hash/quota/rollback tương thích; build/e2e và smoke live. V2 bỏ file internal đơn 54 MB, nhưng toàn bộ các vùng vẫn 65,9 MB, 1.258 draw objects trước tối ưu. Cần đo cold/warm và frame trên thiết bị Android thật, mạng 10 Mbps/RTT100ms; chưa có kết quả để gọi đạt ngân sách hiệu năng. Cache GPU hiện chỉ giữ chunks của cảnh hiện hành, tải tối đa hai chunk cùng lúc và lỗi chỉ retry chủ động.

Không tạo bucket, sửa billing/auth/Firestore hay gọi dịch vụ tính phí. Không có chứng cứ triển khai production cho HS-MED4D-2. Rollback: giữ toàn bộ candidate V1; trả entry/component/pipeline về phiên bản trước theo snapshot đã lưu, không sửa asset published hoặc dữ liệu người dùng.
