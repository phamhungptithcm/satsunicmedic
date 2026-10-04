# Nâng cấp 4D: đề xuất tiếp theo từ hiện trạng đã xác minh

Ngày: 01/10/2026. Phạm vi: nghiên cứu và kế hoạch; không sửa ứng dụng, dependency, cloud hay dữ liệu. Đọc cùng [nghiên cứu nền](medical-4d-expansion-2026-10-01.md) và [trạng thái triển khai](../implementation/medical-4d-expansion-status.md). Báo cáo này cập nhật quyết định tiếp theo, không thay thế lịch sử bằng chứng.

## Quyết định đề xuất

**Làm một luồng học tim theo pha có ảnh nguồn trước; chỉ dựng bề mặt 3D chuyển động khi dữ liệu phân đoạn đủ.** Giữ atlas toàn thân làm điểm vào, bổ sung viewer ảnh độc lập. Hoàn tất QA phần cắt mesh hiện có và xác minh một sample cine trong hai nhánh công việc của cùng lộ trình; chưa cần mở rộng mọi cơ quan hay đổi engine toàn bộ.

Luồng nghiệm thu: tìm tim → xem giải phẫu → mở cine của ca nguồn có nhãn riêng → phát/dừng/tua pha → đọc chú giải đúng pha → trở lại cấu trúc đang chọn. Cine 2D+t phải được gọi đúng là cine; chỉ dùng tên volume 3D+t khi có dữ liệu không gian và thời gian tương ứng. Không tự ghép ảnh ca nguồn với atlas như cùng người.

## Hiện trạng và repository intelligence

- HEAD `8a749e7881f8808473a7fc88a51ff81154aadd50`; nhiều file ứng dụng/tài liệu đang untracked từ trước. Kết luận dựa vào working tree hiện tại, không chỉ HEAD.
- Gate ban đầu bị sandbox chặn CocoIndex daemon log; chạy lại ngoài sandbox đạt **READY**, cả CodeGraph và CocoIndex current/health passed. Đã query CodeGraph `FullBodyAnatomy`, sau đó CocoIndex `4D volume temporal slice implementation`, rồi đối chiếu source. Đây là brief có phạm vi viewer/contracts/asset route; không phải kiểm toán toàn repo.
- `apps/web/src/components/full-body-anatomy.tsx`: tìm/chọn cấu trúc, focus, ẩn/cô lập, lịch sử, mở hoạt động mạch vành. Nội dung hiện nêu chưa có chuyển động co bóp theo chu kỳ tim.
- `packages/anatomy-viewer/src/body-sections.ts`: đã có axial/coronal/sagittal, đảo phía giữ lại, tilt giới hạn ±60°, tương thích clipping cũ. Vì vậy mô tả “chỉ cắt ngang” trong nghiên cứu nền đã cũ.
- `packages/anatomy-viewer/src/full-body-canvas.tsx`: sử dụng chung clipping planes cho mesh, outline và lọc raycast; có hủy request/dọn tài nguyên. Chưa xác nhận trải nghiệm bằng browser trong lượt nghiên cứu này.
- `packages/anatomy-viewer/src/pathophysiology-canvas.tsx`: clock điều khiển trạng thái/hạt minh họa mạch vành; không phải bằng chứng deformation tim đo được.
- `packages/contracts/src/index.ts:assetManifestSchema`: contract mesh dùng meter, Y-up/Z-front, clip duration giây và review gắn hash. Không đưa ảnh mm/LPS hoặc phase-only vào contract này bằng giá trị giả.
- `apps/web/src/app/kham-pha/toan-than/asset/[layer]/route.ts:GET`: ngoài development trả 404. Production asset delivery là phần việc riêng cần plan, không chỉ bỏ điều kiện này.
- Receipt `.ai/local/med4d-expansion/vhp-sample-gate.json` ghi mẫu NLM hiện có là năm PNG không đủ calibration cho MPR. Đã đọc receipt; chưa giải mã lại ảnh trong lượt này.

## Lựa chọn nguồn và công nghệ

| Lựa chọn | Kết luận nghiên cứu | Điều kiện trước implementation |
|---|---|---|
| Sunnybrook | Ưu tiên thử một ca cine tim. Trang nguồn công bố 45 ca, CC0, contour và LV models | Xác minh download thực, định danh ca, hướng ảnh, thứ tự pha và contour có ở pha nào; không suy ra đủ bốn buồng/van |
| TCIA 4D-LUNG | Gói hô hấp tiếp theo, sau khi pipeline tim ổn định | Ca ung thư phổi, không mặc định là phổi khỏe; tuyển chọn một ca và kiểm tra CT/RTSTRUCT theo pha |
| BodyParts3D IS-A | Bổ sung thành mô còn thiếu là công việc atlas hữu ích | Audit overlap/topology và chuyên môn từng phần; không nhập toàn bộ phần thêm một cách tự động |
| Cornerstone3D | Ứng viên cho ảnh stack, MPR và dynamic volume; Three.js tiếp tục phục vụ atlas | PoC tương thích phiên bản thực cài, Next client boundary, workers/CSP, decode, mobile và cleanup; chưa chốt version |
| Chỉ thêm animation rig/morph | Có thể phù hợp minh họa giáo dục | Cần người author/reviewer, giả định rõ; không gọi là chuyển động đo được |

Nguồn chính thức đã tra cứu trực tiếp: [Sunnybrook](https://www.cardiacatlas.org/sunnybrook-cardiac-data/), [Cornerstone viewports](https://www.cornerstonejs.org/docs/concepts/cornerstone-core/viewports/), [BodyParts3D license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html). [TCIA 4D-LUNG](https://www.cancerimagingarchive.net/collection/4d-lung/) mở trực tiếp lỗi 500, nhưng kết quả tìm kiếm trang chính thức trả metadata version 2, CT/RTSTRUCT, 20 subjects và CC BY 3.0; chưa kiểm tra payload tải về.

Rủi ro tích hợp cần chốt bằng package/types: [migration dynamic-volume 4.x](https://www.cornerstonejs.org/docs/migration-guides/4x/dynamic-volume-api/) chuyển API timepoint sang dimension group đánh số từ 1, trong khi [API reference](https://www.cornerstonejs.org/docs/api/core/classes/streamingdynamicimagevolume/) vẫn thể hiện một số accessor deprecated. Không lấy ví dụ cũ ghép với bản mới; test riêng chuyển index, thứ tự pha và frame đã tải. Dimension group chỉ được diễn giải thành thời gian khi metadata nguồn chứng minh điều đó.

## Gói triển khai nhỏ nhất và tác động

Đây là đề xuất phạm vi, không phải bằng chứng phê duyệt thay đổi ứng dụng. Các file mới dưới đây là vị trí dự kiến.

| Bước | File / hàm dự kiến | Tác động và nghiệm thu |
|---|---|---|
| 0. Đóng QA tồn đọng | Viewer hiện tại và `tests/body-sections.test.ts`, `tests/medical-body-scene.test.ts` | Browser desktop/mobile: clipping, chọn phần còn thấy, undo, reset, tải lỗi. Không coi unit tests là visual acceptance |
| 1. Sample gate | Mới `scripts/free-anatomy/audit-cine.py`: kiểm manifest, spatial/temporal metadata và contour coverage | Một ca nguồn; hash, license receipt, giới hạn archive/bytes, kiểm dữ liệu nhận diện; báo accept/reject cụ thể. Không nhập live catalog |
| 2. Contract riêng | Mới `packages/contracts/src/medical-image-manifest.ts`: schema mesh-independent | `kind`, source/specimen ID được phép dùng, dimensions, affine/spacing/unit, temporal kind phase/time, ordered frame IDs, review/hash. Giữ v1 nguyên nghĩa; phase không bắt buộc có giây |
| 3. Adapter ảnh | Mới `packages/anatomy-viewer/src/medical-image-viewer.tsx`: lifecycle, load/cancel, phase selection | Client-only/lazy load; cache có trần, hủy request cũ, frame lỗi không thay bằng ảnh giả; dispose cả CPU/GPU khi đóng |
| 4. Luồng học | `full-body-anatomy.tsx` và `apps/web/src/lib/body-explorer.ts:activityBinding`, component mới cho panel cine | Liên kết bằng cấu trúc và ca, bảo toàn lựa chọn/camera khi quay lại. Không overlay khác mẫu; Product Language Gate và bằng chứng trong UI bắt buộc khi thực hiện |
| 5. Bề mặt động, tùy dữ liệu | Pipeline derivative và adapter sau bước 1–4 | Chỉ triển khai khi segmentation đủ và được duyệt. Morph cần tương ứng topology/đỉnh; mesh khác topology không được nội suy tùy ý |

Contract mới chưa cần endpoint công khai hay database migration trong PoC local. Trước phát hành cần plan riêng cho publish manifest bất biến, quyền truy cập, cache/thu hồi, telemetry, storage và rollback. Giữ route development fail-closed. Không phát sinh cấu hình cloud trả phí từ proposal này.

Rủi ro chính: sai trái/phải do LPS/RAS; sai tỷ lệ meter/mm; thứ tự pha sai; contour thiếu nhưng bị nội suy thành dữ liệu thật; request ca cũ ghi đè ca mới; tràn RAM/GPU; scene cũ mất khả năng mở. Test với affine/landmark biết trước, phase không đều, thiếu frame, mask sai dimensions, hash sai, đổi ca nhanh, context loss và unmount khi đang tải. Giữ bản atlas hiện tại làm rollback; bật gói ảnh theo capability manifest.

## Tiêu chí quyết định tiếp tục hoặc dừng

1. **Data gate:** tải/giải mã được sample có quyền phù hợp, spatial/temporal mapping có bằng chứng. Không đạt thì dừng ở báo cáo source, không dựng volume giả.
2. **Teaching gate:** người học tìm đúng cấu trúc và dừng đúng pha có chú giải được duyệt. Cần baseline người dùng trước khi đặt phần trăm cải thiện; chưa có bằng chứng hiệu quả giáo dục.
3. **Performance gate:** ghi thiết bị/browser, bytes/session, thời gian ảnh đầu có thể dùng, peak memory, độ trễ tua và dropped frames. Mục tiêu đề xuất: ≥30 FPS khi phát dữ liệu đã tải, p95 thao tác đã tải ≤100 ms; là mục tiêu chưa đo.
4. **Medical gate:** có reviewer chịu trách nhiệm cấu trúc/pha/chú giải. Test kỹ thuật hoặc giấy phép không thay thế duyệt y khoa.

Ước lượng bộ nhớ để chọn giải pháp: 512×512×300×2 byte = 150 MiB một volume; 20 pha khoảng 2,93 GiB trước mask/GPU/copy. Vì vậy ưu tiên cine một mặt phẳng, tải theo nhu cầu và cache giới hạn trước full-volume 4D. Không đưa ngân sách cloud hay thời gian hoàn thành khi chưa đo sample và chưa xác định người duyệt.

## Kiểm chứng và completion report

- Tiêu chí nghiên cứu (trọng số bằng nhau): xác minh hiện trạng, đối chiếu nguồn chính thức, so sánh lựa chọn, kế hoạch tác động/nghiệm thu: **4/4 hoàn thành trong phạm vi báo cáo**. Implementation không thuộc tiến độ này.
- Chạy lại `./node_modules/.bin/vitest run tests/body-sections.test.ts tests/medical-body-scene.test.ts tests/medical-body-load.test.ts tests/full-body-load-lifecycle.test.ts tests/full-body-anatomy.test.ts`: **52 tests / 5 files PASSED**, exit 0. Chỉ chứng minh hành vi được các test này bao phủ.
- Build/lint/integration: NOT_RUN trong lượt này vì chỉ thêm tài liệu, không đổi code. Browser/device QA, payload cine/volume decode, clinical validation và production: NOT_TESTED.
- Review nghiên cứu, cycle 1 theo `final-implementation-review`: phát hiện mô tả clipping cũ và rủi ro meter/mm, phase/seconds; báo cáo đã phân biệt hiện trạng, contract mới và điều kiện sử dụng. Không sửa ứng dụng để xử lý các việc ngoài phạm vi.
- Cycle 2: rà lại báo cáo so với source, kết quả tests và trang nguồn; **PASSED cho tài liệu nghiên cứu**. Requirement/trade-offs/security/compatibility/failure-path planning đã kiểm tra; review code implementation và Product Language Gate cho UI mới NOT_APPLICABLE vì chưa triển khai. Không chuyển trạng thái review BLOCKED của candidate ứng dụng thành PASSED.
- CLI `ai-agent-kit` không có trên PATH trong phiên này; không ghi runtime ledger và không có rendered runtime report. Báo cáo thủ công này là evidence summary, không giả lập receipt của runtime.
- Production **NOT_READY**: còn browser QA, sample acquisition/decode, reviewer và asset delivery. Không commit/push/deploy; giữ nguyên WIP có trước.
- Token usage, billed cost và API-equivalent cost: **Unavailable**. Memory candidates: **None**.

Điểm cần chủ sản phẩm chốt trước mở rộng: người dùng học giải phẫu hay sinh lý đầu tiên, reviewer y khoa, thiết bị tối thiểu, người chịu trách nhiệm quyền nguồn. Khuyến nghị bắt đầu bằng sinh viên học tim và một ca cine; đây là giả định đề xuất, chưa phải quyết định của chủ sản phẩm.
