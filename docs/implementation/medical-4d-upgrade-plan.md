# HS-MED4D-2 — Nâng cấp mô hình thành công cụ học giải phẫu và sinh lý

Phiên bản1; ngày2026-09-30 theo múi giờ workspace. Trạng thái: chờ duyệt delta-plan; chưa thay đổi mã ứng dụng. Mục tiêu cuối vẫn là sản phẩm production có giá trị sử dụng y khoa. Phạm vi đề xuất trước mắt: học và giảng dạy giải phẫu/sinh lý cho sinh viên, giảng viên; chưa có bằng chứng phù hợp chẩn đoán, lập kế hoạch phẫu thuật hay quyết định điều trị.

## 1. Bằng chứng và khoảng cách thật

Repository Intelligence: gate ban đầu DEGRADED do chỉ mục stale; refresh một lần thành công, sau đó query CodeGraph FullBodyAnatomy/PathophysiologyCanvas và CocoIndex anatomy publication. Kết luận quan trọng đối chiếu mã nguồn. Shared architecture/ownership context còn placeholder, không suy đoán người phụ trách. Next16.3.8/React19.3, TypeScript6, Three0.186.1, Firebase; không cần đổi stack. Working tree có công việc song song, giữ nguyên các phần không thuộc kế hoạch.

- `scripts/free-anatomy/full-body-convert.mjs` gộp geometry theo region đầu tiên, chỉ lưu danh sách sourceIds của nhóm. Metadata có861 phần nguồn nhưng chỉ8 mesh bên trong. Vì vậy viewer toàn thân không thể raycast chọn từng cơ quan đúng ID.
- `apps/web/src/components/full-body-anatomy.tsx` chỉ có vùng, hai lựa chọn bề mặt/bên trong và mặt phẳng cắt ngang. Nội dung bên phải chưa thành nhiệm vụ học tập theo cơ quan.
- Màu vật liệu phẳng từ converter; không có texture mô, rig hay animation clip trong pipeline toàn thân. Ánh sáng tốt hơn giúp đọc hình khối nhưng không tạo ra dữ liệu giải phẫu/chuyển động còn thiếu.
- `packages/anatomy-viewer/src/pathophysiology-canvas.tsx` có viewer tim và dòng hạt theo centerline riêng, dùng clock/timeline. Đây là diễn họa định tính; chưa phải mô phỏng huyết động hay chuyển động co bóp được kiểm định.
- Review sinh lý bệnh hiện ghi `territory:null`, thiếu kiểm duyệt chuyên môn; không có cơ sở tô vùng nhồi máu như dữ liệu thật.
- Viewer tham khảo, toàn thân và sinh lý bệnh đang là các luồng khác nhau. Cần nối bằng ID và scene context, không ghép ảnh/mesh khác hệ tọa độ tùy ý.
- Binary nội cấu trúc54.3MB/2.38M tổng tam giác gây rủi ro mobile. Production hiện chưa có fullbody được xuất bản; mọi kết quả trước là local.

## 2. Định nghĩa hoàn thành thay cho “trông sinh động”

Mô hình toàn thân phải đúng tỷ lệ nguồn, rõ hình khối ở trước/sau/hai bên, các cấu trúc bên trong phân biệt được. Không nghiệm thu chỉ từ ảnh đẹp hay số lượng test.

Luồng mẫu: mở toàn thân → chọn Ngực → tìm/chọn tim hoặc mạch cụ thể → làm mờ lớp che khuất → cô lập cấu trúc → quan sát hoạt động theo thời gian → dừng/tua để giải thích giai đoạn → tự chọn cấu trúc khi ẩn nhãn → trở về toàn thân. Dùng luồng này để ổn định nền tảng rồi mở rộng từng vùng; không coi một bài tim là hoàn thành toàn bộ cơ thể4D.

4D nghĩa là hình học/chuyển động và trạng thái bài học đồng bộ theo thời gian với ý nghĩa được mô tả. Camera quay hoặc hạt chạy không đủ chứng minh sinh lý đúng. Cắt hình học vẫn là công cụ quan sát; ảnh cắt mô/CT/MRI phải dùng bộ volume thật có nguồn và hệ tọa độ riêng.

## 3. Thiết kế tương tác

- Giữ canvas toàn thân làm trung tâm và phong cách HunpeoLabs/Satsunic. Trái: tìm cấu trúc, cây vùng/hệ; phải: thông tin cấu trúc đang chọn; mobile dùng sheet gọn, giữ vùng nhìn mô hình.
- Click/tap một lần chọn và outline; nút Tập trung mới đưa camera đến cấu trúc. Double action không được làm người dùng mất định hướng. Có breadcrumb Toàn thân→Ngực→Tim và Quay lại.
- Search Việt/Anh/từ đồng nghĩa có nguồn; kết quả dẫn chính xác structureId. Nhãn trái/phải theo cơ thể, không theo màn hình. Chưa dịch xác minh thì giữ thuật ngữ nguồn.
- Công cụ: ẩn/hiện theo hệ, opacity, cô lập, hiện lân cận, nhãn, góc trước/sau/trái/phải, reset và undo/redo. Mesh ẩn không được pick. Cấu trúc không có dữ liệu phải được nhận diện là thiếu.
- Bảng Hoạt động chỉ hiện clip có dữ liệu: play/pause, tua, tốc độ, các giai đoạn và nguồn. Pause giữ camera/selection. Đổi bài dừng clock; tab ẩn tự pause và không tự phát lại.
- Màu mô và ánh sáng phục vụ phân biệt cấu trúc; outline lựa chọn không đổi màu giải phẫu thành màu thương hiệu. Không dùng texture AI như bằng chứng cấu trúc thật.

## 4. Kế hoạch thực hiện theo file và thứ tự

| Đợt | Module/file | Thay đổi và nghiệm thu |
|---|---|---|
| A — nền dữ liệu | `scripts/free-anatomy/full-body-prepare.py`, `full-body-convert.mjs`; metadata sinh ra `apps/web/src/lib/full-body-anatomy.ts` | Giữ stable source/FMA ID theo cấu trúc, mapping vùng/hệ có bằng chứng; không merge mất danh tính. Tách package theo vùng/hệ, deduplicate, ghi hash/bytes/bounds/coverage/license. Không sửa metadata generated bằng tay. So sánh hình học với nguồn trước/sau tối ưu. |
| B — thao tác | `packages/anatomy-viewer/src/full-body-canvas.tsx`; các module mới `structure-selection.ts`, `scene-history.ts`; component toàn thân và CSS | Raycast→semantic selection thống nhất với cây/panel, outline, focus, isolate/opacity/layers, góc chuẩn, undo/reset. Đưa interpolation/clock vào refs, không setState toàn app mỗi frame. Abort tải cũ, loại kết quả stale, dispose rõ ownership. |
| C — trình bày và thông tin | `apps/web/src/components/structure-info.tsx`, `apps/web/src/lib/structure-information.ts`, component toàn thân, route khám phá | Tái sử dụng phần thông tin đang có, phối hợp owner trước sửa. Nhãn anchored theo mesh và chống che; breadcrumb, panel theo vùng, trạng thái lỗi thực. Ánh sáng/material theo mô; texture mới chỉ khi có quyền và matching UV/hình học. |
| D — một bài4D có chiều sâu | adapter mới ở anatomy-viewer và thư viện activity; tái sử dụng clock/stages trong `apps/web/src/lib/pathophysiology.ts`, panel sinh lý bệnh sau kiểm tra công việc song song | Lập storyboard chu kỳ tim và quan hệ cấu trúc; rà nguồn/mapping; kiểm tra rig/morph/clip đầu vào. Khi thiếu animation đúng, ghi asset gap và chuẩn bị binding/timeline; không giả co bóp bằng scale toàn tim. Nội dung/biến dạng mới chỉ nghiệm thu chuyên môn sau reviewer. |
| E — mở rộng | cùng pipeline/adapter, thêm asset manifests và bài học theo vùng | Áp dụng ma trận chất lượng cho hô hấp, hệ vận động và các vùng còn lại. Mỗi vùng có coverage và review riêng. Không nhân bản module tim rồi đổi nhãn. |
| F — production | manifest/contracts/API asset delivery trong `packages/contracts`, `apps/api`; web entry/asset routes; tài liệu release | Thiết kế chi tiết endpoint/storage/cache/quota/rollback sau khi asset footprint đo được; giữ schema cũ tương thích. Chưa đổi guard dev hoặc ghi publish metadata trong A–E. Deployment theo approval trước nhưng chỉ khi receipt thật, build/e2e/prod smoke đạt; phát sinh tài nguyên trả phí phải nằm ngân sách được duyệt. |

Scope duyệt vòng này: A–D phần có thể thực hiện bằng nguồn hiện có, research/asset-gap cho E–F. Không mua license, gọi dịch vụ trả phí, tự ký reviewer hoặc mở publication guard. Đề xuất SDK thương mại là phương án thay thế cần quyết định riêng, không tự thay stack.

## 5. Nguồn dữ liệu và điều kiện tài nguyên

BodyParts3D chính thức là atlas cấu trúc toàn thân nam trưởng thành; mô tả này không chứng minh có animation, texture chân thực hay chứng nhận dùng lâm sàng. Tiếp tục dùng để bảo toàn ID/hình học và nâng tương tác. License trang chính thức hiện CC BY4.0, cần lưu receipt/attribution cho phiên bản phân phối.

NLM Visible Human có ảnh cryosection/CT/MRI thật. Có thể nghiên cứu cho học lát cắt nhưng là mẫu khác: không phủ trực tiếp lên BodyParts3D rồi gọi khớp. Chưa tải bộ hàng chụcGB hay bổ sung storage. Nguồn chính thức nói dữ liệu nam khoảng15GB, nữ40GB; cần prototype giới hạn và ngân sách băng thông trước.

Nếu yêu cầu chất lượng bề mặt/biến dạng gần thực tế vượt dữ liệu sẵn có, lập gói yêu cầu asset: cấu trúc riêng, topology/UV, material có nguồn, registration, animation clips/morphs, mặt trong/buồng/van khi cần, quyền web/thương mại, LOD, reviewer và receipt. Không hứa đạt chất lượng này bằng ánh sáng đơn thuần.

Nguồn kiểm tra trực tiếp:
- https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html
- https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- https://www.nlm.nih.gov/research/visible/visible_human.html
- https://www.biodigital.com/ — phương án nhà cung cấp để đánh giá, chưa có báo giá/hợp đồng/quyền SDK.

## 6. Nghiệm thu đo được — mục tiêu đề xuất, chưa phải kết quả

- Mapping: mọi mesh selectable có đúng stable ID, nhãn/bên/hệ có provenance; không ID mồ côi/trùng; kiểm fixture chọn ray ở các góc và so với cây. Chuyên gia ký duyệt bộ cấu trúc trong phạm vi phát hành.
- Hình ảnh: contact sheet cùng camera trước/sau/hai bên, toàn thân/cận cảnh và từng layer; đối chiếu nguồn, không khe hở/đảo mặt/nhãn đặt sai. Ảnh mockup là chuẩn bố cục, không phải bằng chứng y khoa.
- Tương tác: mọi thao tác chính dùng được bằng chuột, touch và bàn phím; undo/redo/reset khôi phục đúng camera/layer/selection/time; thao tác mới không bị request cũ ghi đè.
- Hiệu năng: đo cold/warm trên desktop và Android tầm trung được ghi rõ; mục tiêu phản hồi chọn p95<100ms, desktop frame p95<20ms, mobile<33ms, vùng đang xem cache warm<500ms. First usable skin mục tiêu≤5s ở10Mbps,RTT100ms với decode tính đủ. Đây là budget để tối ưu/giảm LOD, không được ghi PASS khi chưa đo. Tránh long task>200ms do decode bằng pipeline/chunk phù hợp.
- 4D: clock duy nhất; mọi stage/frame/nhãn đúng khi seek, pause, replay, đổi tốc độ, tab hidden, đổi selection. Đánh dấu rõ slowed/illustrative, không sinh áp lực/lưu lượng “thật” từ đồng hồ hoạt ảnh.
- Giá trị: pilot đề xuất ít nhất1 giảng viên và5 người học; không hướng dẫn thao tác trước, ít nhất4/5 hoàn thành tìm cấu trúc→bộc lộ→giải thích quan hệ→xác định giai đoạn. Ghi lỗi, thời gian và kiểm tra trước/sau; cỡ mẫu này chỉ phát hiện vấn đề usability, không chứng minh hiệu quả giáo dục tổng quát.
- Bảo mật/lỗi: sai hash, chunk thiếu, tải chậm/abort, WebGL lost, payload lớn, externalURI/path traversal; không retry vô hạn, không mất scene khi layer thất bại. Giữ auth/Firestore/privacy.

## 7. Kiểm thử, tác động và rollback

Vitest cho mapping/history/clock/stage/loader; integration cho manifest-chunk-resolution; browser cho chuỗi tác vụ và fault injection; viewer/web typecheck, scoped ESLint, build production trước release. Chọn profiles TypeScript/web/visual-design/animation-motion/product-content; inventory mọi string và8principles ở trong ngữ cảnh. Reduced-motion phải kiểm thực tế. Tests nguồn không thay thế bác sĩ/giảng viên kiểm định.

Rủi ro HIGH: hiểu sai chuyên môn; chặn nghiệm thu chuyên môn khi chưa có reviewer. MEDIUM: draw calls tăng khi tách mesh, sai mapping và tải vùng cạnh tranh; đo/chunk/dedupe/token-cancel. MEDIUM: sửa shared components đụng công việc khác; inventory trước từng đợt, writer ownership riêng. Giữ converter/version cũ và manifest bất biến để rollback; feature mới không sửa saved scene của asset cũ. Không thay auth, billing, ads hoặc database lưu người dùng trong A–D. Logging lỗi mã kỹ thuật/asset version, không thêm dữ liệu bệnh nhân.

## 8. Quyết định cần duyệt

Duyệt HS-MED4D-2/v1 để triển khai A–D theo hướng học/giảng dạy y khoa và đánh giá E–F, dùng tài nguyên hiện có, không chi phí mới. Việc đạt mức dùng lâm sàng hoặc license/asset mới cần phạm vi và kiểm định riêng. Tiếp tục hoàn thiện kỹ thuật trong khi chuẩn bị đầu vào reviewer; không dùng thiếu reviewer làm lý do ngừng sửa tương tác/rendering.

Kế hoạch này mở rộng đáng kể HS-BODY-1 (vùng9nút) sang cấu trúc riêng và hoạt động4D. Theo workflow plan-existing-system-change, cần approval cho delta trước protected edits. Báo cáo vòng này: investigation/plan hoàn tất; implementation/build/new browser validation NOT RUN; production NOT_READY; token/cost Unavailable; memory candidates None.
