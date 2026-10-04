# Điều chỉnh yêu cầu: bệnh lý tương tác trên mô hình 3D/4D

Trạng thái: APPROVED. User xác nhận “approved” sau kế hoạch này trong chat 01a0f535-63d5-7f82-9fd0-a24a4ae056f3. Thay thế cách diễn giải mục tiêu thành sơ đồ 2D ở milestone A. User đã làm rõ rằng sản phẩm phải có dòng chảy và tương tác trên mô hình 3D/4D. Bản 2D hiện tại không đáp ứng tiêu chí đó.

## Kết quả người dùng cần

Mở bài nhồi máu cơ tim → thấy tim dạng khối 3D → xoay/zoom/chọn mạch → thấy dòng máu chạy trong mạch → chọn preset bệnh → quan sát vị trí tắc và vùng cơ tim liên quan thay đổi theo giai đoạn → dừng/tua/quay lại bình thường. Góc nhìn được giữ khi đổi trạng thái. “4D” nghĩa là trạng thái của cảnh 3D thay đổi theo thời gian, không phải video phát sẵn.

Màn hình chính phải dành cho mô hình tương tác. Lời giải thích, nguồn, quiz và sơ đồ đọc được là phần hỗ trợ. Không dùng mô hình trang trí nằm cạnh một sơ đồ 2D để nghiệm thu yêu cầu này.

## Evidence và gap

- CodeGraph/CocoIndex stale; gate DEGRADED. Đọc trực tiếp viewer/contracts/panel và inventory file; không có file GLB/glTF/OBJ/FBX/BLEND/STL trong phạm vi repository được liệt kê.
- `packages/anatomy-viewer/src/canvas.tsx`: có R3F, Three, OrbitControls, mesh picking, layer opacity, AnimationMixer và kiểm toàn vẹn GLB. `Scene/useFrame` hiện loop toàn clip; chưa có bệnh lý/dòng chảy.
- `packages/anatomy-viewer/src/index.ts`: scene/history dùng cho viewer hiện tại; chưa có kịch bản mạch/mô theo thời gian.
- `pathophysiology-panel.tsx`: hình hiện tại là SVG phẳng; chỉ có metadata trạng thái trong contract. Không phải mô phỏng 3D.
- `docs/design/humanscope-v1/human-4d-model-brief.md`: asset giải phẫu thực, mapping mạch, license và animation chuyên môn vẫn thiếu. Không thể nhận một model bề mặt bất kỳ rồi coi đường đi mạch tự vẽ là đã đúng.

## Asset feasibility trước tích hợp

Nguồn đã kiểm tra:

- [NIH 3D Heart Library](https://3d.nih.gov/collections/heart-library): bộ tim dựng từ MRI, tập trung bệnh tim bẩm sinh. Cần chọn baseline phù hợp; không lấy ca dị tật làm tim bình thường.
- [NIH Right Coronary Artery tree, 3DPX-011751](https://3d.nih.gov/entries/3DPX-011751): chỉ một phần cây động mạch vành phải. Trang mở được nhưng text phần license chưa trả điều khoản; chưa đủ điều kiện chọn để phân phối. Không ghép vào tim khác specimen rồi coi mapping là chính xác.
- [Open Heart model trên Sketchfab](https://sketchfab.com/3d-models/open-heart-model-a362ea28a5dd430f97eb45e90a6f3945): kết quả tìm kiếm có, mở trang bị 403; chưa kiểm geometry hoặc license.

Chưa chọn asset nào. Bước khả thi: kiểm quyền tải/chỉnh sửa/nhúng web, tính phù hợp với bệnh mạch vành, mesh separation, vessel paths và đơn vị; lưu nguồn/version/hash/attribution. Không mua hay dùng dịch vụ trả phí. Chưa đủ asset thì ghi BLOCKED ở nghiệm thu cảnh thực, không thay bằng trái tim hình học hoặc ảnh giả 3D. Có thể viết và test flow engine bằng fixture kỹ thuật nhưng fixture không phải sản phẩm hoàn thành.

## Hành vi và kỹ thuật cụ thể

1. Tim và mạch là mesh 3D có chiều sâu, chọn được bằng raycast; orbit/zoom/reset và bộ nút cấu trúc cho bàn phím.
2. Đường dòng máu bám centerline được mapping trong cùng hệ tọa độ model. Dùng instanced particles để biểu diễn chiều chuyển động; đây là minh họa định tính, không claim CFD/áp lực/vận tốc thật.
3. Vị trí huyết khối gắn segment ID và tọa độ dọc mạch. Khi preset tắc hoạt động, hạt không đi xuyên đoạn tắc; các nhánh không liên quan vẫn hoạt động theo preset.
4. Vùng ảnh hưởng dùng anatomy/mesh mapping được xác nhận, không chọn một mảng tùy ý theo khoảng cách tới huyết khối.
5. Bật/tắt lớp mô để thấy mạch và dòng bên trong. Chỉ thêm cutaway nếu asset có interior geometry phù hợp; không gọi mặt cắt mesh rỗng là giải phẫu.
6. Một clock điều khiển pose/particles/stage/text. Tách chu kỳ sinh lý có thể lặp khỏi progression bệnh không lặp. Nếu asset không có rig/morph đã được duyệt, không phóng to/thu nhỏ toàn tim để giả nhịp co bóp.
7. Cùng camera/selection khi chuyển bình thường ↔ bệnh lý; pause/scrub xác định được và giữ góc nhìn. Tab ẩn pause, quay lại không tự chạy; reduced motion dùng từng trạng thái 3D tĩnh.
8. Mất WebGL/asset lỗi thì có bài đọc và nút thử lại; UI nói rõ 3D chưa mở được. Không đánh dấu fallback là đáp ứng yêu cầu 3D.

## File/function plan

| File | Công việc |
|---|---|
| `packages/contracts/src/pathophysiology.ts` | Bổ sung schema version riêng cho scene binding: asset/hash, segment/centerline, occlusion, tissue mapping, qualitative mode; validation finite/bounds/references |
| `packages/anatomy-viewer/src/pathophysiology-flow.ts` (mới) | Hàm lấy vị trí/chiều theo centerline và phase; dừng trước occlusion; deterministic seek; không cấp phát theo từng hạt/frame |
| `packages/anatomy-viewer/src/pathophysiology-canvas.tsx` (mới) | Canvas/scene 3D, model loader có integrity, flow instances, picking, layers, camera và cleanup; tách khỏi legacy canvas để giữ behavior cũ |
| `packages/anatomy-viewer/package.json` | Thêm export subpath cho canvas mới; dùng Three/R3F/Drei đã có, không thêm dependency |
| `apps/web/src/components/pathophysiology-panel.tsx` | Dùng canvas mới làm view chính; nối time/stage/selection và controls; SVG chỉ là fallback/phần đọc |
| `apps/web/src/components/pathophysiology.module.css` | Bố cục viewer chiếm vùng chính; touch/narrow/mobile và focus |
| `apps/web/src/lib/pathophysiology-draft.ts`, `pathophysiology.ts` | Binding của một kịch bản nhồi máu, phân biệt playback phase và bệnh; giữ draft server-owned |
| `apps/web/src/app/hoc-tap/sinh-ly-benh/page.tsx` | Giữ development-only; cấp asset/binding local đúng phiên bản; không làm public draft |
| `apps/web/src/app/hoc-tap/sinh-ly-benh/asset/route.ts` (mới, nếu asset đủ điều kiện) | Phục vụ binary local chỉ development, không đặt draft asset vào public directory |
| `apps/web/preview-assets/heart/` (mới, sau feasibility) | Asset có quyền, manifest/source/license/hash; không raw patient data |
| `tests/pathophysiology.test.ts`, `tests/pathophysiology-flow.test.ts` (mới) | Giữ regression cũ; clock, invalid geometry, occlusion, branch isolation, stage boundary và privacy/production gate |
| `docs/implementation/pathophysiology-review.md` | Review mới và screenshot/motion/browser evidence; không tái dùng PASS 2D làm chứng nhận 3D |

## Tác động, risk và giới hạn

Ảnh hưởng local preview + package export/contract mới. Giữ scene v1, legacy viewer, auth, API publication, DB, deploy và existing WIP. Không có migration hoặc paid provider. Rollback: route dùng lại bản trước; asset preview không có đường public. Chưa triển khai stroke hoặc toàn thân trong delta này.

Rủi ro chính: anatomy/rights chưa xác định; geometry mapping sai; hạt xuyên mạch/tắc; transparency/picking; clock không đồng bộ; GPU/memory trên mobile; nội dung nháp bị lộ trong static/public. Dùng bounds validation, layer ownership, single clock, deterministic flow tests, lifecycle disposal và production negative checks.

## Acceptance bắt buộc

- Xoay camera thật làm thay đổi perspective/occlusion của cơ quan; chọn trực tiếp mạch trên mesh đúng panel.
- Dòng chuyển động ở tọa độ 3D bên trong đường mạch; quay mọi góc không biến thành overlay phẳng cố định trên màn hình.
- Preset tắc dừng dòng ở đúng segment và không làm mất dòng của mọi nhánh; vùng mô tương ứng thay đổi đúng binding.
- Pause/seek/speed và camera đồng bộ; chuyển bình thường/bệnh lý giữ góc nhìn; bệnh không tự reset cuối clip.
- Model/centerline/tissue mapping và mức đơn giản hóa có review trước dùng học thuật; thiếu điều kiện này phải ghi rõ draft/blocked.
- Kiểm WebGL thực trên desktop/mobile emulation, reduced motion, keyboard, lỗi tải/context loss, dispose/remount, console, memory/load budget. Không lấy build hoặc hình tĩnh làm proof 4D.
- Production HTML/RSC/asset URL không trả draft; không đặt file trong thư mục public để bypass gate.

## Quyết định cần duyệt

Phê duyệt delta: thay view chính 2D bằng cảnh tim 3D/4D tương tác như trên, gồm khảo sát và tích hợp asset có quyền; vẫn local-only, không mua/deploy/publish. Đây là mở rộng so với approval record milestone A, vốn ghi rõ loại trừ real 3D.

Plan review: source evidence và risk/acceptance đã nêu; implementation NOT_RUN, asset feasibility chưa đủ. Token/cost: Unavailable. Memory candidates: None.

## Implementation evidence update

Approval trên đầu tài liệu áp dụng cho delta này. Các mục feasibility ở trên là trạng thái tại thời điểm lập kế hoạch. Trong implementation đã chọn cùng bộ mesh BodyParts3D qua mirror pin commit, kiểm giấy phép chính thức và lưu source/hash/attribution tại `apps/web/preview-assets/heart/README.md`. Có tim 3D, hai đường dòng chảy, tắc LAD và controls; chưa có tissue-perfusion binding hay review y khoa. Vì vậy acceptance đầy đủ vẫn BLOCKED; xem báo cáo 3D mới, không dùng kết quả milestone 2D để nghiệm thu.
