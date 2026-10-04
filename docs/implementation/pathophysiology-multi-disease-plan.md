# Mở rộng thư viện sinh lý bệnh — 5 bài mới

Status: PLAN_READY / PENDING_APPROVAL. Request: “thêm nhiều bệnh khác”. Đây là delta nội dung/cơ chế mới, vượt approval cũ chỉ một kịch bản nhồi máu cơ tim. Chưa sửa code ứng dụng hoặc thêm bài khả dụng vào UI.

## Repository intelligence và tác động

CodeGraph current/healthy tại lần kiểm; đã query PathophysiologyPreview, PathophysiologyPanel, HeartScene, BloodFlow, learningScenarioSchema. Schema được dùng qua contracts index, server draft và tests. CocoIndex stale/unhealthy, mode DEGRADED; không dùng semantic-index evidence như hiện hành. Kết luận kiểm lại bằng source tại route, schema, panel, flow/canvas và asset inventory. Không thay dependency để phục hồi index.

Hiện trạng: route import một draft và một heart binding. Schema appearance chỉ có normal/plaque/occlusion/injury. Panel giả định có cả plaque và occlusion bằng non-null assertions, đóng cứng một bài, bốn giai đoạn, tên mạch và giải thích tim. Canvas tải một binary URL, có một điểm tắc LAD, hai flow paths LAD/LCx. Chưa có asset não hay binding mạch não/phổi trong thư mục preview-assets. Không thể thêm các bệnh khác an toàn chỉ bằng mảng tiêu đề.

## Danh mục cụ thể

Giữ bài nhồi máu cơ tim hiện có, bổ sung năm bài riêng:

| Bài | Điều cần quan sát | Điều kiện asset/cơ chế |
|---|---|---|
| Bệnh mạch vành do xơ vữa | Hẹp mạch, hạn chế khả năng tăng cung cấp máu khi nhu cầu tăng; phân biệt với tắc cấp | Tận dụng tim/LAD cùng atlas; marker hẹp và trạng thái dòng định tính, không giả định hẹp nào cũng gây nhồi máu |
| Co thắt động mạch vành | Đoạn mạch co thắt, cản dòng tạm thời và pha hồi phục được người học chọn | Cùng tim; event co thắt khác huyết khối, không vẽ cục máu đông hoặc co bóp toàn tim giả |
| Thuyên tắc động mạch phổi | Vật tắc tại nhánh động mạch phổi làm giảm tưới máu phía sau | Cần chọn/tích hợp mạch phổi cùng hệ tọa độ; không dựng hành trình từ chân khi thiếu chuỗi tĩnh mạch–tim phải đã mapping |
| Đột quỵ thiếu máu não | Tắc động mạch não và gián đoạn cung cấp máu | Cần atlas não + động mạch có định danh, centerline kiểm hình học; không vẽ vùng nhồi máu khi thiếu bản đồ tưới máu |
| Đột quỵ xuất huyết | Vị trí vỡ mạch và máu thoát khỏi mạch; phân biệt với tắc mạch | Cần mô hình não/mạch tương ứng và biểu diễn xuất huyết định tính; không suy thể tích máu tụ, áp lực nội sọ hay vùng tổn thương từ slider |

Nguồn sơ bộ đã đối chiếu:
- NHLBI coronary heart disease: https://www.nhlbi.nih.gov/health/coronary-heart-disease/causes
- NHLBI angina types: https://www.nhlbi.nih.gov/health/angina/types
- NHLBI pulmonary embolism: https://www.nhlbi.nih.gov/health/pulmonary-embolism
- NINDS stroke overview: https://www.ninds.nih.gov/health-information/stroke/stroke-overview

Angina là triệu chứng/hội chứng, không ghi thành một bệnh mới độc lập để tăng số lượng. Không gắn số vận tốc/áp lực thật hoặc làm chậm mọi hạt tại chỗ hẹp rồi gọi đó là huyết động học. Mỗi bài có mục tiêu, diễn tiến, cơ chế, hậu quả, câu hỏi riêng, nguồn theo giai đoạn và mức đơn giản hóa.

## Thứ tự triển khai và tiêu chí hoàn thành

1. Mở cấu trúc thư viện, triển khai hai bài tim mạch với asset hiện có, giữ bài nhồi máu làm regression. Tổng ba bài tim có thể xem khi đã qua kiểm tra kỹ thuật.
2. Kiểm feasibility asset phổi/não: giấy phép nhúng/chỉnh sửa, nguồn/hash, mesh IDs, tọa độ, centerline, payload và tính phù hợp. Chỉ đưa bài vào danh sách “xem 3D” khi thật sự có model đúng và cơ chế hoạt động. Nếu thiếu điều kiện, ghi unavailable rõ lý do; không đếm là bài hoàn thành hoặc nghiệm thu đủ năm bài.
3. Tích hợp ba bài còn lại khi feasibility đạt. Duyệt kỹ thuật mỗi bài; học thuật/public release vẫn cần reviewer chuyên môn. Không publish draft để hoàn thành số lượng.

## File-by-file implementation plan

- `packages/contracts/src/pathophysiology.ts`: thêm version riêng cho catalog/scenario binding mới để giữ contract cũ; stage event phân biệt baseline, stenosis, spasm, occlusion, hemorrhage và recovery. References tới asset/structure/flow phải hợp lệ; tùy chọn event không mặc định là clot. Không ép mọi bệnh có plaque/occlusion hoặc bốn giai đoạn.
- `packages/contracts/src/index.ts`: export schema/types mới, giữ consumers hiện có.
- `apps/web/src/lib/pathophysiology-draft.ts` và module data mới cùng thư mục: catalog server-owned, năm nội dung nháp có nguồn, capability/availability thật, quiz riêng. Không tải binary mọi bài lúc mở trang.
- `apps/web/src/lib/pathophysiology.ts`: chọn/tìm theo bệnh/cơ quan và resolve event state theo scenario, giữ clamp determinism.
- `apps/web/src/app/hoc-tap/sinh-ly-benh/page.tsx`: cấp catalog/metadata qua dev guard; giữ server-only nội dung nháp.
- `.../sinh-ly-benh/asset/route.ts`: chọn asset bằng ID allowlist, không cho nhập path/URL tùy ý; giữ production 404, integrity metadata và no-store.
- `apps/web/preview-assets/`: thêm source/manifest/license/builder cho bộ cần thiết sau feasibility. Không sửa generated outputs thủ công, không mua asset/provider.
- `packages/anatomy-viewer/src/pathophysiology-flow.ts`, `pathophysiology-canvas.tsx`: events theo binding; branching/clot/spasm/hemorrhage không dùng chung hiệu ứng mặc định; same-organ giữ camera phù hợp, đổi organ reset camera/selection an toàn; abort/dispose request cũ khi đổi bài.
- `apps/web/src/components/pathophysiology-panel.tsx`, CSS module: danh mục có tìm kiếm/lọc cơ quan, chọn bài cập nhật model/timeline/text/quiz; không thêm dãy nút mới. Đổi bài pause, reset câu trả lời/thời gian; không giữ selected mesh không tồn tại. Loading/error/empty/unsupported có phục hồi và accessible labels.
- `tests/pathophysiology*.test.ts`: schemas/references, stage không-clot, event boundaries, nhánh không liên quan, pause/reset/switch, unavailable assets, production ID allowlist.
- `docs/implementation/`: cập nhật inventory, sources, product-content review, screenshots và task/review evidence cho từng bài thực sự chạy.

## Risk, boundaries và validation

Risk medium/high ở ý nghĩa y khoa và chuyển asset. Không đổi API session/auth, DB, tuổi mô hình, account persistence, legacy viewer hoặc triển khai production trong delta này. Mong muốn API/session chung trước đó chưa phải approval tích hợp trong yêu cầu thêm bệnh này.

Kiểm: compiler/lint/build; mỗi bài loaded và animation đúng stage; switching nhanh không trả model/quiz của bài cũ; malformed/missing asset không fallback sai cơ quan; pause/seek/reduced-motion giữ deterministic; branch flow behavior; chọn cấu trúc/keyboard/mobile; diagram 2D không xuất hiện sai cơ quan; nguồn/link/reference/quiz theo đúng bài; production HTML/RSC/binary không trả draft. Asset geometry containment không thay cho medical review. No CFD, patient-specific data or treatment recommendation.

Rollback: trả catalog về bài MI và route allowlist cũ; không migration hoặc dữ liệu người dùng. Giữ WIP ngoài scope. Chưa có code/test/browser evidence cho phần mở rộng. Plan review: ready for scope approval; implementation NOT_RUN. Token usage/cost Unavailable. Memory candidates None.

## Approval requested

Duyệt delta năm bài và thứ tự/điều kiện feasibility trên. Approval cũ không bao gồm mở rộng loại bệnh, contract event mới hoặc asset não/phổi; phải có xác nhận cho phạm vi này trước protected edits theo `.ai/workflows/plan-existing-system-change.md`, bước 15, và `.ai/guards/implementation-approval-gate.yaml`.

## Approved expansion — 2026-10-01

User: “let research và thêm nhiều nhất có thể và toàn bộ cũng được làm thành một hệ thống tra cứu trực quan và thôn tin bệnh cũng như mộ phỏng bệnh trên 3D”. This approves implementation and expands the reviewed five-topic plan to a searchable, organ-filtered disease reference. Initial delivery: a source-backed multi-system catalog, detailed mechanisms and reading references, three coronary 3D scenarios using the verified atlas. Other organs explicitly remain reading-only until assets pass feasibility. No claim of exhaustive medicine coverage. Typed catalog capability is separate from the existing scenario contract; no need to alter the public schema. Add deterministic narrowing/spasm/recovery visual states through a private viewer prop. Existing MI and production guard remain. Same exclusions for API/session/age/publishing. Intelligence remains DEGRADED (stale indexes), conclusions verified against source. This entry supersedes PENDING_APPROVAL above for this scope.
