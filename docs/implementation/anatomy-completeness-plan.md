# AC-01 v1 — Đủ cấu trúc giải phẫu trước, hoạt động sau

Trạng thái: ĐÃ ĐƯỢC CHỦ WORKSPACE DUYỆT bằng phản hồi “approved”; xem `anatomy-completeness-approval.md`. Kết quả triển khai và phần còn thiếu được ghi trong `anatomy-completeness-report.md`. Kế hoạch này không phải chứng nhận độ đầy đủ y khoa.

## Yêu cầu và tiêu chí hoàn thành

Ưu tiên của chủ sản phẩm: khám phá toàn bộ bộ phận cơ thể từ ngoài vào trong, đến từng chi tiết; sau đó xem chi tiết và cách hoạt động. Không thay yêu cầu này bằng việc tăng số mesh hoặc thêm vài cơ quan lớn.

Muốn kiểm chứng “không sót”, cần danh mục giải phẫu chuẩn có phiên bản và người thẩm định làm mẫu số độc lập với asset. Không dùng chính 1.258 mesh hiện có làm định nghĩa của toàn bộ cơ thể. Một tên trong danh mục không chứng minh có hình học tương ứng; một mesh không mặc nhiên là một cơ quan hoặc một chi tiết độc lập.

Phạm vi kiểm kê phải bao gồm: bề mặt và phần phụ da; mô dưới da và mạc; cơ, gân; xương, sụn, khớp, dây chằng; tim và mạch; bạch huyết; thần kinh trung ương và ngoại biên; các cấu trúc giác quan; hô hấp; tiêu hóa; nội tiết; tiết niệu; sinh sản của các mẫu cơ thể phù hợp. Đây là nhóm công việc, chưa phải danh sách giải phẫu đã được chuyên gia duyệt. Mỗi nhóm phải được tách xuống cấu trúc con, bên trái/phải và quan hệ cấu trúc theo nguồn. Vùng đầu–cổ, thân, tay/chân phải tiếp tục có vùng con như bàn tay, ngón tay, bàn chân, ngón chân theo danh mục.

Không âm thầm loại vi thể khỏi yêu cầu “mọi chi tiết”: danh mục phải phân biệt cơ quan, cấu trúc con, mô và vi thể, khai báo cấp nào có mô hình hoặc hình minh họa riêng. Không phóng to bề mặt giảm polygon rồi gọi đó là chi tiết mô học. Danh sách chuẩn, giới hạn cấp độ, mẫu cơ thể và biến thể cần được xác nhận trước khi công bố đạt độ phủ toàn bộ; chưa có mẫu số thì tỷ lệ đầy đủ là CHƯA XÁC ĐỊNH.

## Repository intelligence brief và bằng chứng hiện trạng

- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`. Working tree có nhiều WIP/untracked sẵn; không dùng HEAD làm đại diện duy nhất cho candidate.
- Gate ban đầu DEGRADED do hai index stale; đã refresh một lần, kiểm tra lại READY. CodeGraph đã truy vấn `searchBody activityBinding inspectBodyStructure`; CocoIndex tìm nguồn và tài liệu full-body. Kết quả graph có cả bản sao trong `output/playwright/.../baseline`, đã loại bản sao khỏi đường chạy hiện tại. Tài liệu cũ có số đếm 861 khác hiện trạng; không tái sử dụng kết quả kiểm thử cũ.
- TypeScript, Next 16.3.8, React 19.3.0, Three 0.186.1, React Three Fiber 9.8.1; pnpm/Vitest/ESLint theo package manifests.
- Đọc và phân tích JSON bên trong `apps/web/src/lib/full-body-anatomy.ts`: 1.258 source structures, 1.368 concepts, 44 asset chunks, 9 vùng, 8 hệ; tổng byte khai báo 65.930.408. Chưa xác minh lại từng GLB trong lượt này.
- 229 structures có `systems: []`; 398 có `regions: []`. Đây là khoảng trống phân loại hiện tại, không tự chứng minh geometry bị mất hoặc sai giải phẫu.
- `scripts/free-anatomy/full-body-prepare.py` lấy toàn bộ 1.258 ID dưới FMA20394. TSV nguồn local có 17.943 dòng và cũng chỉ 1.258 ID duy nhất: bỏ giới hạn số lượng trong script không tạo thêm cấu trúc.
- Tìm tên trong TSV chưa thấy các từ độc lập `ovary`, `uterus`, `tooth`, `teeth`, `nail`, `cochlea`, `retina`. Đây là ứng viên khoảng trống tên/mapping cần đối chiếu thuật ngữ và geometry, không phải chứng minh y khoa rằng mọi hình tương ứng đều vắng.
- `full-body-convert.mjs` chỉ khai báo 8 nhóm hệ, giữ nguồn FJ, tạo geometry giảm chi tiết và catalog generated. Da FJ2810 xử lý riêng; không có phân lớp da chi tiết được chứng minh.
- `body-explorer.ts::bodySearchEntries` loại concept có >=500 source IDs và concept vùng; `searchBody` không có query chỉ trả 16 nhóm gợi ý, sau đó cắt 60 kết quả. Đây không phải cây duyệt toàn bộ danh mục.
- `FullBodyExperience → FullBodyAnatomy → searchBody/inspectBodyStructure → FullBodyCanvas`: chức năng chọn/xem riêng/lân cận đã có trong source, chưa kiểm chứng trải nghiệm browser ở lượt này.
- `activityBinding` chỉ nối tới heart binding; UI mở bài cơ chế mạch vành. Không có bằng chứng toàn bộ cơ quan đã có mô phỏng hoạt động. Nội dung chi tiết fallback chủ yếu là provenance/hình học, không phải bài giải phẫu riêng cho mọi cấu trúc.
- `.ai/context/repository-map.md`, `architecture.md`, `build-test-commands.md` còn placeholder; kết luận dựa vào source thực tế.

## Các bước triển khai đề xuất

### A. Danh mục chuẩn và báo cáo thiếu

Tạo nguồn dữ liệu được quản lý riêng cho danh mục kỳ vọng, có provenance, phiên bản, ID ổn định, tên nguồn, bản dịch có trạng thái duyệt, cấp độ, specimen, bên, vùng, hệ và quan hệ cha/con có nguồn. Quan hệ thuộc bộ phận khác với thuộc hệ; không suy hierarchy chỉ từ bounding box hoặc số mesh.

Tạo bảng đối chiếu từng mục: có tên / có mapping / có geometry / chọn được / có nội dung chi tiết / được thẩm định. Tách trạng thái thiếu, chưa đối chiếu, không áp dụng cho mẫu và đã có; báo cáo tỷ lệ theo từng chiều riêng. Các mapping chưa chắc chắn phải có hàng chờ xử lý. Không coi “không áp dụng” là lý do bỏ cơ quan của mẫu khác khỏi danh mục sản phẩm.

### B. Duyệt và chọn toàn bộ phần đã có

Thay gợi ý giới hạn bằng cây vùng/hệ/cấu trúc con và danh sách phân trang hoặc virtualized có thể đi hết. Giữ tìm kiếm Việt–Anh; báo tổng kết quả chính xác. Không để giới hạn 60 làm mất khả năng khám phá. Có đường vào cho phần chưa phân loại, không âm thầm bỏ chúng. Cho phép chọn từng phần nguồn và nhóm có mapping chính xác; giữ quay lại, undo/redo, góc nhìn, xem riêng/lân cận, ẩn/hiện, mặt cắt và trạng thái lỗi tải.

### C. Bổ sung mô hình theo báo cáo thiếu

Tìm, đối chiếu và thẩm định nguồn asset cho từng thiếu hụt; ghi license, quyền phân phối, đơn vị, pose, tọa độ, giới hạn chi tiết và specimen. Bổ sung hoặc dựng theo tài liệu có nguồn và kiểm duyệt chuyên môn. Không ghép tùy ý các mẫu nam/nữ hoặc các bộ dữ liệu khác tư thế thành một người; tách specimen khi không thể đăng ký không gian chính xác. Không tạo chi tiết y khoa bằng hình AI rồi coi là đúng.

Từng asset phải có ID, checksum, bounds, mesh mapping, LOD không làm mất cấu trúc cần học. Tải theo vùng/cấp chi tiết và giữ ngân sách từng chunk; không nạp mọi cấp độ cùng lúc. Danh mục chưa đủ geometry vẫn là CHƯA HOÀN THÀNH. Có thể giao từng đợt để xem xét nhưng không đổi thành tuyên bố đã đủ cơ thể.

### D. Nội dung và hoạt động sau nền giải phẫu

Chi tiết theo cấu trúc gồm tên, vị trí, phần con, liên quan và chức năng có nguồn, với trạng thái duyệt. Hoạt động là capability riêng của từng cấu trúc; khi chưa có, giải thích đúng tại cấu trúc đó, không chuyển mọi cơ quan sang bài tim. Animation/co bóp/dòng chảy cần kế hoạch và thẩm định riêng sau bước cấu trúc; không thuộc triển khai đợt đầu AC-01.

## Tác động theo file và hàm

| Đường dẫn | Thay đổi dự kiến |
| --- | --- |
| `docs/anatomy/coverage-scope.md` (mới) | Nguồn danh mục, specimen, cấp độ, người thẩm định và mẫu số nghiệm thu |
| `scripts/free-anatomy/catalog/` (mới) | Nguồn danh mục/mapping được version hóa, tách khỏi output generated |
| `scripts/free-anatomy/coverage-audit.mjs` (mới) | Đối chiếu danh mục kỳ vọng với catalog; xuất thiếu/unmapped/orphan/duplicate và provenance |
| `scripts/free-anatomy/full-body-prepare.py` | Nhập nguồn đã chọn có receipt và giới hạn riêng, không nới assert một cách mù quáng |
| `scripts/free-anatomy/full-body-convert.mjs` | Sinh mapping, specimen, hierarchy có nguồn, membership và coverage; giữ geometry identity |
| `packages/anatomy-viewer/src/scene-history.ts` | Mở rộng BodyCatalog theo schema đã duyệt; điều chỉnh selectionIds/scopeSourceIds/requiredChunks nếu cần; giữ nhiều-hệ và lịch sử cảnh |
| `apps/web/src/lib/full-body-anatomy.ts` | Chỉ regenerate từ pipeline, không sửa trực tiếp |
| `apps/web/src/lib/body-explorer.ts` | bodySearchEntries/searchBody hỗ trợ toàn bộ danh mục và phân trang; bodyLabel không đánh đồng bản dịch chưa duyệt |
| `apps/web/src/lib/body-explorer-ux.ts` | inspectBodyStructure/viewBodyScope/nearbyBodyStructure xử lý mục thiếu asset và chuyển specimen an toàn khi có phạm vi tương ứng |
| `apps/web/src/components/full-body-anatomy.tsx` và CSS cùng tên | Cây duyệt, kết quả đầy đủ, trạng thái capability, thông tin phạm vi; giữ mobile/keyboard |
| `packages/anatomy-viewer/src/full-body-canvas.tsx` | Chỉ sửa nếu cần tải/specimen/LOD đã xác minh; giữ hash checks, hủy tải, retry, dispose và picking |
| `tests/` | Coverage audit, mapping, duyệt hết danh mục, paging, lựa chọn vùng/hệ, thiếu asset và hồi quy thao tác |
| `docs/implementation/anatomy-completeness-content-review.md` (mới) | Inventory strings/states, 8 nguyên tắc Product Language Gate và bằng chứng browser hiện hành |

Chọn quality profiles TypeScript, React/web, accessibility/product-content, security asset ingestion và performance theo `.ai/core/code-quality-intelligence.md` khi triển khai. Không đổi API/backend/DB/infra/dependency trong AC-01. Nếu nguồn mới cần runtime contract công khai hoặc storage khác, lập delta-impact trước. Không tự mua asset hoặc công bố lên production.

## Rủi ro, lựa chọn và nghiệm thu

Rủi ro chính: sai identity/thuật ngữ/hierarchy, geometry không tương thích, license chưa rõ, tải nặng và hiểu nhầm độ đầy đủ. Chỉ thêm bộ lọc là sửa nhỏ nhưng không đáp ứng yêu cầu. Thay toàn bộ atlas ngay là rủi ro và chưa có nguồn được chọn. Hướng đề xuất: mẫu số độc lập → audit → truy cập hết dữ liệu hiện có → bổ sung nguồn theo thiếu hụt → nghiệm thu toàn phạm vi.

- Không có mục kỳ vọng bị bỏ im lặng; mọi thiếu hụt có trạng thái, lý do và đầu việc. Đây là nghiệm thu kiểm kê, KHÔNG phải nghiệm thu đầy đủ mô hình.
- Nghiệm thu đầy đủ mô hình chỉ khi mọi cấu trúc thuộc phạm vi duyệt có representation đúng cấp độ, mapping, khả năng chọn/xem và xác nhận chuyên môn; không còn thiếu hụt chặn. Chi tiết vi thể có representation riêng khi phạm vi đòi hỏi.
- Kiểm tra orphan, duplicate, cycle hierarchy, ID sai, laterality/specimen mismatch, integrity và nguồn; không test chỉ bằng số 1.258.
- Chứng minh duyệt được toàn bộ kết quả >60, nhóm lớn >=500, phần chưa phân loại và từng cấu trúc con; keyboard/mobile không mất đường vào.
- Kiểm tra chọn phần nhỏ/bị che, xem riêng/lân cận, reset/undo/back, mặt cắt, mất mạng/partial failure/retry/cancel; không báo “đang xem đủ” khi tải thiếu.
- Chạy unit liên quan, typecheck, lint; browser verification và đo tải/memory/GPU trên thiết bị đại diện. Đặt ngân sách sau khi đo baseline, không tự bịa số FPS đạt.
- Giữ delivery/auth/integrity gates; rollback bằng manifest/catalog/asset phiên bản tương thích, không trộn revision.
- Sau sửa: Product Language Gate và final-implementation-review mới; chỉ báo production ready theo bằng chứng thực tế.

## Trạng thái lượt khảo sát

Đã hoàn thành kiểm kê tĩnh có giới hạn và kế hoạch; chưa triển khai, chưa xác minh UI hiện hành, chưa thẩm định giải phẫu. Lệnh Vitest cho 4 test files bị automatic approval policy từ chối với `approval required by policy, but AskForApproval is set to Never`; không có kết quả test mới. Final implementation review: NOT_RUN, chưa có implementation được duyệt. Production readiness: NOT_READY. Token usage và chi phí: Unavailable. Memory candidates: None.

Đề nghị duyệt AC-01 v1 cho danh mục/audit/khám phá toàn bộ dữ liệu và pipeline bổ sung theo nguồn được xác minh, ưu tiên bước A–C. Quyết định nguồn asset, mẫu số và cấp độ cần được ghi nhận trước khi tuyên bố đầy đủ; mua tài nguyên, production publication và animation là các bước riêng.
