# Viewer 3D/4D và tài nguyên

Trạng thái: PROPOSED; chưa có model được nhận, kiểm duyệt hoặc cấp phép cho dự án.

## 1. Hướng tài nguyên và điều kiện lựa chọn

Hướng ưu tiên theo stack đã yêu cầu: viewer tự xây bằng Three/R3F từ GLB/glTF có quyền sử dụng. Chọn một bộ toàn thân và hệ chuyên sâu tương thích, không ghép hai bộ khác scale/pose rồi coi đúng giải phẫu. Mua/đặt làm model chỉ sau thử nghiệm và xác minh license. SDK hosted là phương án thay thế cần delta architecture approval vì khác quyền điều khiển, mapping, export, privacy và stack viewer.

| Ứng viên | Bằng chứng có trong vòng tài liệu | Cần xác minh trước lựa chọn |
| --- | --- | --- |
| Z-Anatomy | Có [repository mô hình công khai](https://github.com/Z-Anatomy/Models-of-human-anatomy) | License từng phiên bản/file và nghĩa vụ phái sinh, export GLB, mesh IDs, độ chính xác, texture, animation, mobile |
| BioDigital | Có [nền tảng giải phẫu tương tác của nhà cung cấp](https://www.biodigital.com/) | Hợp đồng nhúng công khai/thương mại/trường học, SDK API, mapping ID, custom viewer/export, quota, privacy, giá |
| Model theo hợp đồng riêng | Chưa có nhà cung cấp/tệp cụ thể | Quyền sở hữu, sử dụng web và trường học, anatomy reviewer, mẫu thử, bảo trì/version |

Không gọi ứng viên “miễn phí”, “đã phù hợp” hay “đã có animation” chỉ từ trang giới thiệu. Không dùng ảnh AI làm bằng chứng chính xác hoặc tải trộm asset. Chi phí và lựa chọn nhà cung cấp: chưa xác định.

## 2. Capability matrix theo asset version

| Capability | Bằng chứng tối thiểu | Khi thiếu |
| --- | --- | --- |
| Full-body realistic | Render mọi hướng, tỷ lệ/pose và reviewer ký nhận | Không nghiệm thu model chính |
| Pick structure | Mesh groups + anatomy mapping test | Không cho click hotspot thay thế để PASS |
| Layers | System membership/material separation đúng | Chỉ hiển thị lớp được hỗ trợ |
| Opacity | Blending/depth test nhiều camera | Chặn lớp gây hiểu sai cho đến sửa |
| Isolation/focus | Bounds và quan hệ nhóm ổn định | Báo không có cấu trúc trên mẫu |
| Labels | Anchor có bên/trái/phải chính xác | Không tự đặt nhãn theo vị trí màn hình |
| Physiology | Clip, stage metadata, ý nghĩa thời gian, review | Tab đọc; không play giả |
| Cross-section | Nội cấu trúc thật hoặc volume hợp lệ + review | Không gọi geometric clipping rỗng là giải phẫu hay CT/MRI |
| Exploded view | Transform được thiết kế và review | Tắt capability |
| Pathology compare | Cặp model/registration + annotations đã duyệt | Không chế biến model bình thường tùy ý |
| Export/embed | Điều khoản license cụ thể | Không hiện action hoạt động |

Trạng thái ban đầu của mọi capability: **UNVERIFIED**. Capability quyết định cả API lẫn UI; người dùng không thể vượt bằng gọi endpoint trực tiếp.

## 3. Manifest contract

Manifest chứa: schemaVersion; assetId/version; SHA-256; mappingVersion; source và license receipt; review receipt; coordinate convention (up/forward/handedness), units/meters, origin; whole-body bounds; tier files với byte size, texture budget, compression; layer memberships; structure records; label anchors; clips/stages; capabilities; expiry/revocation state; approved fallback image và attribution.

`assetVersion + structureId → anatomyId`; importer sinh structureId ổn định trong version, không dùng runtime index. Một anatomyId có thể nhiều structureId, một structureId chỉ map một anatomyId. Mesh không xác định đủ chính xác phải non-selectable và báo trong validation. Đổi asset cần mapping diff/review; scene cũ không bị sửa theo tên gần giống.

Viewer adapter có contract `loadManifest`, `loadRegion`, `select`, `focus`, `setLayer`, `isolate`, `setTime`, `captureScene`, `restoreScene`, `dispose`. API dữ liệu không truy cập trực tiếp renderer; renderer không biết Prisma/database.

## 4. State, rendering và tương tác

Zustand giữ trạng thái semantic: model version, selection, layer settings, mode, panel, scene, history. Camera/animation interpolation trong refs/render loop, không setState toàn app mỗi frame. UI time cập nhật tối đa đề xuất 10Hz, khi pause/scrub cập nhật ngay; live announcement chỉ khi đổi giai đoạn có ý nghĩa.

Pointer raycast bỏ mesh non-selectable; resolve semantic ID rồi cập nhật một selection transaction để cây/panel/highlight thống nhất. Search → resolve exact anatomyId → tải vùng → focus bounds; request token bỏ kết quả cũ. Opacity 0 không có nghĩa được pick “vô hình” trừ tool chuyên sâu chủ động được thiết kế.

Camera fit theo bounding box/sphere, aspect và FOV; không hardcode vị trí tim. Giới hạn near/far và zoom để tránh clipping vô ý. Phím trước/sau/trái/phải dựa coordinate manifest. Nút Toàn thân trả camera/lớp theo scene default; undo khôi phục trước reset.

History là command transactions, tối đa đề xuất 50 entry trong phiên. Drag orbit/opacity/scrub nhiều frame ghi một entry khi hoàn tất; selection, isolate, reset ghi riêng. Undo/redo chỉ thao tác khám phá, **không hứa undo server delete/publish**. Thao tác mới xóa redo branch. Chuyển mode giữ state, đổi asset xóa history sau thông báo tương thích.

## 5. Animation và ý nghĩa 4D

Clip metadata: id, durationSeconds, loop policy, timeInterpretation (`real_time`, `slowed`, `illustrative_stages`), stages `[start,end)`, chú thích theo locale/revision, review hash. Điểm cuối thuộc giai đoạn cuối; scrub clamp [0,duration]. Camera và selection không reset khi pause.

Clip time là clock duy nhất cho model/stage/text; playbackRate không thay đổi chú thích thành tuyên bố tiến triển thật. Chuyển stage seek đúng mốc; hidden tab pause, resume do người dùng chọn. Nếu metadata/clip lệch thời lượng ngoài tolerance đã xác định, không publish animation. Không phóng to toàn thân theo nhịp để gọi là tim/hô hấp đúng.

So sánh chỉ giai đoạn sau: coordinate registration chung, hai camera đồng bộ bằng semantic event, giới hạn recursion; thiết bị không đủ sức chuyển view cùng camera thay hai canvas. Không mặc định hai mẫu khác nhau là cùng kích thước bệnh nhân.

## 6. Trạng thái tải và phục hồi

State machine: idle → manifest-loading → asset-loading → validating → ready; nhánh error/cancelled/context-lost/unavailable. Network retry tối đa đề xuất 3 lần có backoff; checksum/format/mapping mismatch không retry vô hạn. Abort tải khi route/unmount/model đổi. Giữ panel HTML và selection metadata dù WebGL lỗi.

Trước thay model giữ scene trong RAM; tải mới lỗi thì người dùng chọn giữ mẫu cũ hoặc đọc HTML. Không hiển thị mẫu cũ dưới tên mẫu mới. Context restore tải lại tài nguyên từ manifest hợp lệ, restore paused; lỗi lặp đưa sang đọc HTML. GPU objects dispose theo ownership/refcount, không dispose texture dùng chung quá sớm. Decode/convert nặng trong pipeline/worker; không convert model trong request API.

LOD/texture theo thiết bị và lựa chọn người dùng; không tự tải chất lượng cao khi đường truyền yếu. Đánh giá Meshopt/Draco bằng đo load/decode/memory cụ thể. Dừng loop khi cảnh tĩnh nếu khả thi; chỉ render khi cần và khi animation chạy. Không gửi frame/ảnh người dùng lên server để “tối ưu” mặc định.

## 7. Asset pipeline

1. Ghi supplier, license document, phạm vi web/commercial/education/export, expiry, attribution, receipt hash.
2. Upload bằng grant hạn chế vào quarantine; kiểm magic bytes/kích thước/path/archive bomb; không tin extension.
3. Sandbox parse với CPU/RAM/time/network giới hạn; external URI trong glTF bị từ chối trừ tài nguyên cùng package đã kiểm tra; không fetch URL tùy ý.
4. Chuẩn hóa units/axes, chia vùng, optimize, tạo tiers; giữ bản nguồn và report so sánh.
5. Kiểm schema/mapping, orphan/duplicate ID, bounds, texture/triangles/draw calls, scene restore.
6. Chuyên gia review cấu trúc/nhãn/animation trên mọi hướng và tier. Tối ưu làm mất chi tiết cần review lại.
7. Kiểm quyền thương mại/nhúng/export và attribution; publisher chỉ promote version qua đầy đủ gate.
8. Publish immutable path; lưu hash, capabilities, test matrix, approvers; theo dõi lỗi; có phiên bản trước để rollback nếu vẫn đủ quyền.

Mỗi release manifest cần một dòng inventory: ID/version/hash, chủ sở hữu, nguồn, license snapshot hash, phạm vi được phép, ngày hết hạn, người duyệt pháp lý/chuyên môn, capability matrix, performance report, attribution. **Chưa có dòng asset nào đủ điều kiện.**
