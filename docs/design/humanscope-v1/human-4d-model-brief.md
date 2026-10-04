# Thiết kế mô hình người 4D — brief cho graphics engineer và anatomy artist

**Đây là thiết kế asset và hoạt ảnh cần dựng; chưa có file 3D/4D được tạo.** Ba PNG chỉ tham chiếu bố cục, ánh sáng, vật liệu tổng quát; tuyệt đối không trace AI anatomy thành cơ sở chuyên môn.

## 1. Mẫu người và hình ảnh

Một người trưởng thành ở tư thế giải phẫu trung tính; tỷ lệ/pose được anatomy reviewer chọn từ tài nguyên hợp lệ. Không mặc định một mẫu đại diện mọi giới/cơ địa. Hỗ trợ mẫu khác khi có nguồn. Camera xem trước/sau/trái/phải quy chiếu theo cơ thể; unit meter, orientation/handedness do manifest ghi, không phụ thuộc tên export.

Màu cơ/xương/nội tạng lấy từ tài liệu/asset được duyệt. Ánh sáng soft studio trung tính, tone mapping nhất quán giữa device và tiers. Không neon/hologram, mannequin, gore trang trí hoặc phóng đại tổn thương. Selection là overlay riêng khôi phục được, không sửa texture nguồn.

## 2. Cấu trúc scene graph và lớp

```text
SpecimenRoot (assetVersion, source transform, units)
  AnatomyGeometry (nhóm export, không là ontology)
    Structures (stable structureId trong phiên bản)
      Surface meshes / interior meshes / material slots
  Rigs (skeleton hoặc deformation drivers theo clip)
  LabelAnchors (theo structureId + laterality)
  CameraBookmarks (anatomical view, không business key)
  AnimationClips (clipId, review hash, stage metadata)
```

Không bắt các hệ thành concentric shells. Một cấu trúc có thể liên quan nhiều hệ; system membership là metadata, không duplicate mesh gây z-fighting. `assetVersion + structureId → anatomyId`; nhiều mesh/primitive map cùng anatomyId. Mesh names chỉ phục vụ DCC debugging.

| Nhóm | Yêu cầu tách và kiểm tra |
| --- | --- |
| Da | Surface riêng; không pretend skin opacity là cutaway chính xác |
| Mô dưới da | Chỉ có nếu tài nguyên hỗ trợ và đủ độ tin cậy |
| Cơ và gân | Nhóm chức năng/structure riêng, đường bám do reviewer kiểm |
| Xương và khớp | Mesh chọn riêng, không hợp nhất mất định danh |
| Mạch máu | Major branches đủ để học hệ đã chọn; artery/vein labels có nguồn |
| Thần kinh | Lateral structure và đường đi, không suy từ hình AI |
| Hô hấp | Cơ quan và phần phụ cần cho animation đã chọn |
| Tiêu hóa | Từng cơ quan, quan hệ không gian, không fill hình học tùy ý |
| Tiết niệu | Source/license rõ cho từng thành phần |
| Nội tiết | Khả năng nhận diện kích thước nhỏ qua focus/labels |
| Bạch huyết | Độ phủ có khai báo, không hứa mô tả mọi cấu trúc |
| Sinh sản | Tài nguyên mẫu phù hợp, ngôn ngữ giáo dục trung tính |

V1 chỉ cam kết hệ được làm sâu khi đã qua feasibility. Manifest phân biệt absent, available, reviewed, revoked; UI không hiện toggle hoạt động cho nhóm vắng.

## 3. Topology, material và picking

Giữ geometry nguồn và export derivative có provenance. Deformation topology cần đủ edge flow tại vùng chuyển động, normals/tangents ổn định; không auto-retopo rồi coi giữ nguyên chi tiết học tập. Watertight/interior surfaces chỉ bắt buộc ở cấu trúc/section capability liên quan; không coi mesh surface là volume scan.

Picking dùng geometry/BVH hoặc proxy có quan hệ chính xác với structure, và thử occlusion nhiều góc. Picking proxy không phải mô hình chính hay hotspot ảnh. Material group đổi opacity phải restore đúng alpha/depthWrite/renderOrder; lớp chồng có kiểm depth sorting. Không làm mất bộ phận chỉ để sửa transparency bug.

LOD thấp/cao giữ mapping; boundary shape/landmark có tolerance do reviewer ký nhận. Nhãn neo trên transform local và cập nhật theo deformation; kiểm occlusion/collision, không xuyên người. Anchor bản dịch không thay ID.

## 4. Cách tạo chiều thời gian

Mỗi clip có mục đích học, source, reviewer, deformation method và diễn giải thời gian. Tim: đề xuất morph targets/rig điều khiển vùng cơ quan có chủ đích; reviewer quyết định vùng, thứ tự và độ biến dạng. Hô hấp/khớp là clip khác, cần tissue dependencies tương ứng. Không scale toàn thân/toàn tim một nhịp rồi gọi chính xác sinh lý.

Gói clip cần: `clipId`, duration theo tài nguyên, FPS authoring/sample, track paths tới structure IDs, boundary condition cho loop, normalized phase mapping nếu làm chậm, stage annotations theo locale/revision, bounds suốt hoạt ảnh và allowed speed range. Tên/nhịp/giai đoạn sinh lý chưa được chọn trong bộ này. Không gán 3 giai đoạn của ảnh thành kiến thức y khoa.

| Tác vụ | Clock/state contract |
| --- | --- |
| Play | Advance clip clock, sample tất cả tracks cùng timestamp |
| Pause | Giữ pose/time, không reset camera |
| Scrub | Seek deterministic, stage lookup `[start,end)`, điểm cuối thuộc stage cuối |
| Next stage | Seek đúng boundary do metadata định nghĩa |
| Speed | Đổi playback rate, không thay biological meaning |
| Reset | Clip time về mặc định; camera reset là action khác |
| Save/restore scene | Pin asset+mapping+clip revision, restore paused |
| Background tab | Pause, không chạy bù thời gian nhanh khi quay lại |

Không chèn mô phỏng dòng máu, ECG hoặc tốc độ tiến triển bệnh nếu chưa có nguồn/giả định/validation riêng. FX particle stream đẹp không là bằng chứng dòng chảy huyết động.

## 5. Giao tiếp runtime

GLB/glTF export theo vùng/hệ có manifest, texture tiers, metadata/mapping sidecar và content hash. Three/R3F chạy client; Zustand giữ semantic state, refs/mixer giữ pose/time. Fetch từ Cloud Storage/Cloud CDN qua quyền do Nest cấp; không Firebase Rules-only protection cho server access. PostgreSQL giữ metadata và approval, không binary base64.

Clip loader không nhận script từ asset. External glTF URIs bị allowlist/quarantine, allocation/payload limits trước tải. Abort/cancel giải phóng tài nguyên có ownership, không dispose texture đang shared. Mất WebGL context → đọc HTML, restore model paused nếu có thể.

## 6. Ngân sách thử nghiệm

Mục tiêu ban đầu: tier mobile ≤25MB tải cho cảnh dùng đầu tiên; first useful model p75 ≤8s trên profile mạng đã nêu trong spec; ≥30 FPS trên thiết bị baseline. Đây là target, **NOT_MEASURED**, không thông số đạt được của hình PNG.

Đề xuất bắt đầu đo 250k triangles/cảnh mobile và 600k desktop rồi điều chỉnh theo độ chính xác/draw calls/device; không giảm mesh theo budget mà hy sinh landmark. Memory morph/texture/decoder đo riêng. Ví dụ chỉ position delta: 100k vertices × 3 floats × 4 bytes × 4 targets ≈4,8MB, chưa normals, base geometry, GPU copies. Ghi số vertex/targets/materials/textures thực tế trước quyết định.

## 7. License và nguồn

Tra [Z-Anatomy repository](https://github.com/Z-Anatomy/Models-of-human-anatomy) ngày 30/09/2026: README mô tả Blender template và phần attribution có cả thành phần mang nhãn NC bên cạnh thông báo CC BY-SA chung. Vì vậy không duyệt cả bundle cho thương mại chỉ từ license headline. Cần kiểm file/component thực sử dụng, nguồn gốc, điều kiện derivative/export và attribution; đây không phải kết luận pháp lý về toàn bộ bộ dữ liệu.

Không tải hoặc redistribute bundle trong công việc này. Phương án đặt model/SDK thương mại vẫn cần hợp đồng và thử capability. Chưa xác nhận nhà cung cấp nào đủ điều kiện. Hình do Image Gen tạo không thay giấy phép/nguồn của model thật.

## 8. Bàn giao asset thật trong giai đoạn sau

1. Source DCC, texture sources, license manifest theo component.
2. GLB tiers và checksum, axes/scale/bounds/landmarks verified.
3. Mesh→structure→anatomy mappings, orphan/duplicate report.
4. Clips + stage metadata + review receipts cùng version.
5. Label anchors, camera presets, restore examples đúng specimen.
6. Device/browser load/FPS/memory report, clinical visual review nhiều góc.
7. Capability allowlist, unsupported features và revocation/rollback report.

Chỉ sau các đầu ra này mới được gọi là mô hình người 3D/4D hoạt động; hiện trạng **BLOCKED ở asset/license/anatomy/animation validation**.
