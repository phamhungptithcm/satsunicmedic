# MED-EN-1 — Tiếng Anh y khoa gắn với hình ảnh và bài học

Status: APPROVED — chủ workspace duyệt bằng “approved” trong cuộc hội thoại này. Kết quả triển khai local: `medical-english-verification.md`.

## Mục tiêu và trải nghiệm

Giúp người đọc tiếng Việt học thuật ngữ tiếng Anh ngay khi quan sát giải phẫu và diễn tiến bệnh. Giả định đối tượng là người mới học; chưa có bằng chứng về trình độ hoặc chuyên ngành cụ thể.

1. Nhãn cấu trúc hiển thị tên Việt cùng thuật ngữ Anh đã đối chiếu nguồn. Chi tiết mở theo nhu cầu: nghĩa ngắn bằng tiếng Việt, một câu tiếng Anh trong ngữ cảnh và nghĩa tiếng Việt tương ứng.
2. Trong bài sinh lý bệnh, mỗi giai đoạn có nhóm từ vựng nhỏ liên quan trực tiếp đến phần đang xem. Chọn thuật ngữ chỉ đưa tới cấu trúc/giai đoạn thực sự có trong mô hình; nếu chưa có ánh xạ thì chỉ hiển thị giải thích.
3. Có lựa chọn hiện/ẩn nghĩa tiếng Việt trong phần từ vựng để tự nhớ lại. Không ẩn cảnh báo, giới hạn mô hình hay hướng dẫn thao tác.
4. Ôn tập ngắn Anh → Việt và Việt → Anh theo ngữ cảnh; xác nhận đáp án rồi mới hiện giải thích. Có đường quay lại quan sát khi câu hỏi có giai đoạn tương ứng.
5. Bản đầu bao phủ các cấu trúc tham chiếu và ba bài tim mạch hiện có. Danh mục bệnh giữ tên tiếng Anh hiện tại; không tự sinh bài từ vựng cho toàn bộ danh mục.

## Repository intelligence brief

- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`; phần lớn ứng dụng là WIP untracked. Bảo toàn toàn bộ WIP hiện có.
- Gate: `python3 .ai/scripts/check-repository-intelligence.py --json --refresh-if-stale` → DEGRADED. CodeGraph và CocoIndex health check passed, cả hai index vẫn Stale. Không dùng index cũ làm bằng chứng hiện trạng.
- Nguồn trực tiếp: `apps/web/package.json`, root `package.json`, `docs/01-product-spec.md`, các file trong bảng triển khai dưới đây; `tests/learning-quiz.test.ts`.
- Stack: TypeScript 6.0.3, Next 16.3.8, React 19.3.0, pnpm 11.19.0; Vitest và ESLint hiện có. Web responsive, nội dung giáo dục y khoa.
- `Disease.english` đã có; `filterDiseases` tìm cả tên Việt và Anh; `DiseaseAtlas` hiện tên Anh ở thẻ và đầu chi tiết.
- `StructureInfoData` hiện chứa label/description/scope/source, chưa có dữ liệu học thuật ngữ song ngữ.
- `PathophysiologyPanel` nối timeline, lựa chọn cấu trúc, mô hình và `QuizSlides`; `onObserve` đưa câu hỏi về giai đoạn.
- Trang `/hoc-tap/sinh-ly-benh` chặn ngoài development qua `canPreviewScenario`. Không suy diễn đây là chức năng đã phát hành.
- `docs/01-product-spec.md` yêu cầu không tự xuất bản bản dịch máy. Approval cũ dành cho foundation/Firebase/UI-auth, chưa xác nhận kế hoạch MED-EN-1 này.
- Mức tin cậy: đủ cho phạm vi frontend đã đọc; chưa xác minh runtime, độ đầy đủ thuật ngữ hay medical review.

## Luồng dữ liệu và khoảng trống

Trang preview → dữ liệu server-only về bệnh/kịch bản/câu hỏi → DiseaseAtlas → PathophysiologyPanel → mô hình, StructureInfo, QuizSlides. Explorer và ReferenceAnatomy cũng dùng StructureInfo. Bổ sung dữ liệu học tiếng Anh ở frontend theo ID ổn định, không theo so khớp nhãn tự do. Vấn đề là thiếu cầu nối giữa thuật ngữ và hoạt động quan sát/ôn tập, không phải thiếu một bộ chuyển ngôn ngữ toàn trang.

## Kế hoạch theo file và hàm

| File | Thay đổi dự kiến |
|---|---|
| `apps/web/src/lib/medical-english.ts` (mới) | Kiểu dữ liệu và hàm lấy thuật ngữ theo structure/scenario/stage ID; kiểm tra ánh xạ, nguồn, fallback khi thiếu dữ liệu. |
| `apps/web/src/lib/medical-english-data.ts` (mới) | Bộ thuật ngữ nhỏ có nguồn, câu ngữ cảnh và nghĩa Việt, gắn ID đã xác minh; giữ nội dung draft trong luồng preview phù hợp. |
| `apps/web/src/components/medical-english.tsx` và `.module.css` (mới) | Thẻ học song ngữ, hiện/ẩn nghĩa, callback quan sát có điều kiện; trạng thái thiếu dữ liệu rõ ràng; phần tiếng Anh có `lang="en"`. |
| `apps/web/src/components/structure-info.tsx` và `.module.css` | Mở rộng dữ liệu học bằng trường optional, hiển thị nhãn và chi tiết song ngữ khi được caller cung cấp; giữ Escape/đóng panel/nguồn và scope. |
| `apps/web/src/lib/structure-information.ts`, `apps/web/src/components/reference-anatomy.tsx`, `apps/web/src/components/explorer.tsx` | Nối thuật ngữ đã xác minh vào cấu trúc hiện có; không tự gán bản dịch cho cấu trúc API chưa biết. Kiểm tra publication boundary trước khi cấp dữ liệu ra luồng công khai. |
| `apps/web/src/components/pathophysiology-panel.tsx` và `.module.css` | Đặt phần học theo giai đoạn và cấu trúc; callback dùng seek/onSelect hiện có; chế độ so sánh bình thường phải lấy đúng nội dung bình thường. |
| `apps/web/src/lib/medical-english-quiz.ts` (mới), `apps/web/src/components/quiz-slides.tsx` và `.module.css` | Tạo deck từ nội dung đã kiểm tra, dùng QuizQuestion và cơ chế chấm hiện có; deck song ngữ có trạng thái riêng, không trộn điểm với deck cơ chế bệnh. |
| `tests/medical-english.test.ts` (mới), `tests/learning-quiz.test.ts` | Kiểm tra ánh xạ nguồn/ID, thiếu bản dịch, đáp án duy nhất, ngữ cảnh so sánh và giữ quy tắc xác nhận/chấm điểm. |
| `docs/implementation/medical-english-product-content-review.md`, `medical-english-verification.md` (mới sau triển khai) | Ghi nguồn, inventory chuỗi/states, bằng chứng browser và từng vòng final review. |

Trước khi triển khai: đọc hướng dẫn Next cục bộ và xác minh lại call sites, trạng thái WIP cùng các nguồn y khoa/thuật ngữ có thẩm quyền. Không ghi nội dung dịch chưa kiểm chứng thành đã được chuyên gia duyệt.

## Tác động, rủi ro và giới hạn

- Rủi ro tổng thể MEDIUM: dịch sai thuật ngữ, gắn sai vị trí, gợi ý mô hình thể hiện một cấu trúc chưa có, hoặc làm UI quá dày. Giảm bằng nguồn cho mỗi nhóm từ, ánh xạ ID rõ ràng, nội dung ngắn và mở rộng theo nhu cầu.
- Shared StructureInfo có thể ảnh hưởng explorer/reference; các trường mới phải optional, giữ fallback Việt hiện có.
- Không đổi hợp đồng API/shared contracts, database, đăng nhập, billing, hạ tầng, publication gate hoặc dependency. Nếu cần thay đổi các phần này, lập delta plan.
- Dữ liệu học tĩnh, trạng thái trong phiên/component; không gửi nội dung sức khỏe hay tiến độ học ra dịch vụ ngoài, không thêm persistence hoặc analytics.
- Không thêm request mỗi frame mô hình. Callback không tạo vòng cập nhật giữa lựa chọn từ và timeline; thay giai đoạn không tự cướp focus.
- Phát âm/audio, phiên âm tự sinh, spaced repetition và dịch toàn văn là phần có thể xem xét sau. Bản đầu không cần nhà cung cấp hoặc chi phí mới.
- Không deploy trong phạm vi này. Rollback bằng gỡ các thay đổi thuộc MED-EN-1, bảo toàn WIP khác; không reset toàn repo.

## Phương án và lựa chọn

Chỉ bổ sung tên Anh là ít thay đổi nhất nhưng chưa đáp ứng học theo hình. Dịch toàn bộ UI tạo nhiều nội dung và độ dày lớn. Chọn các thẻ song ngữ trong ngữ cảnh cùng ôn tập ngắn để tận dụng luồng mô hình và quiz hiện có.

## Tiêu chí nghiệm thu và xác minh sau duyệt

- Thuật ngữ Việt–Anh nhất quán, có nguồn; giữ khác biệt giữa cấu trúc gộp và cấu trúc riêng, giữa sơ đồ và mô hình thực.
- Từ vựng đổi đúng khi chuyển bài/giai đoạn/chế độ so sánh; không có nút quan sát khi thiếu target, không hiện tiếng Anh giả khi thiếu bản dịch.
- Quiz không lộ đáp án trước xác nhận, chấm đúng một lần, có giải thích và trở lại đúng giai đoạn; thử reset/chuyển bài.
- Kiểm tra viewport hẹp/rộng, zoom 200%, chuỗi dài, keyboard, focus, screen-reader labels, reduced motion, model loading/error và thiếu dữ liệu. Khi mô hình lỗi, thẻ từ còn đọc được nhưng điều khiển mô hình phản ánh đúng khả năng.
- Chạy focused Vitest cho học tập/sinh lý bệnh/từ vựng; typecheck, lint và web build theo scripts repo. Không coi kiểm tra local là bằng chứng production hoặc chứng nhận nội dung y khoa.
- Profiles áp dụng: universal, typescript-javascript, frontend-html-css, web-app, product-content. Đánh giá Purpose (học từ theo hình), Agency (tự mở/ẩn nghĩa), Responsibility (nguồn/giới hạn), Familiarity (tiếng Việt dẫn đường), Flexibility (keyboard/mobile), Simplicity (ít từ mỗi cảnh), Craft (đồng bộ đầy đủ states), Delight (tự nhớ lại không áp lực).
- Product Language Gate hiện NOT_RUN cho UI mới; chỉ PASSED khi có bằng chứng in-context cho toàn bộ nguyên tắc và state liên quan.
- Sau thực hiện: mandatory final-implementation-review; sửa trong scope, verify và review lại tới khi vòng mới nhất đạt. Báo cáo quality gates/task completion, không tự tuyên bố ready khi thiếu bằng chứng.

## Trạng thái tại thời điểm bàn giao kế hoạch (lịch sử)

Đã khảo sát nguồn và lưu kế hoạch. Chưa thay đổi protected code; chưa chạy test tính năng mới vì chưa triển khai. Chưa có review triển khai hoặc xác nhận production. Token/cost chính xác không có telemetry trong phạm vi này. Memory candidates: None.

Approval requested: chủ workspace duyệt MED-EN-1 cho phạm vi file và ràng buộc ở trên. Lưu bằng chứng duyệt trước protected edits theo implementation approval gate.
