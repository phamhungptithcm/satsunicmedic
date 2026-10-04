# Design review và bằng chứng

Ngày: 30/09/2026. Phạm vi: 3 visual concepts, gallery HTML local và brief UI/UX/model. Người review: Codex, cùng phiên; chưa có clinical/human acceptance.

## 1. Scope và trạng thái

- Đã tạo 3 PNG bằng built-in Image Gen và copy vào `assets/`; prompt exact ở `prompts.json`.
- Gallery là công cụ xem thiết kế, không phải canvas anatomy. Chuyển ảnh/ghi chú và link ảnh gốc là chức năng thật duy nhất của gallery.
- Dự án sản phẩm vẫn Next/Nest/Three/R3F/Google Cloud/Firebase như spec. HTML standalone này nằm trong docs, không thay stack ứng dụng.
- Repository Intelligence DEGRADED: không index CodeGraph/CocoIndex; dùng source/Git/docs như các vòng trước.
- Không tạo GLB, mesh, rig, clip, nội dung y khoa hoặc backend. Không deploy/publish/commit/push.

## 2. Review cycles

### Cycle 1 — Ảnh concept và scope

Đã mở cả ba PNG bằng `view_image`. Soát brand, model-first composition, typography/labels, mobile sheet, canvas/inspector và timeline. Không coi medical imagery hoặc copy tự sinh là nguồn đúng giải phẫu. Asset-human-model vẫn BLOCKED do chưa có tài nguyên/license/clinical review.

Các khác biệt có chủ đích giữa ảnh và spec thực thi:

| Điểm soát | Bằng chứng ảnh | Quyết định bàn giao |
| --- | --- | --- |
| Brand | White/blue/navy/charcoal nhất quán | Giữ tokens; không suy hex chính xác từ pixel sinh ảnh |
| Layout | Desktop tree/canvas/inspector | Implement 256px/320px panel theo effective width, không trace pixel máy móc |
| Copy | Ảnh có câu “sẽ được cập nhật…” do generator thêm | Spec chuẩn dùng “Chưa có nội dung được xuất bản.”, không hứa lịch |
| Layer state | Switch một số nhóm off nhưng render vẫn có chi tiết liên quan | Concept mỹ thuật; implementation phải ràng buộc visibility với mesh thực |
| Mobile | PNG 853×1844 chứa cả model và sheet dài | Không phải 390px runtime proof; sheet snap và content scrolling theo UX spec |
| Timeline | 3 phase labels và nút pause trên ảnh tĩnh | Chỉ bố cục; phase/time/availability do clip đã duyệt quyết định |
| Anatomy | Model và tim có hình organic, chưa kiểm anatomy | Không được xuất thành atlas/medical fact, không trace làm geometry |
| Fidelity | Gallery hiển thị nguyên ảnh không overlay/crop | Không claim faithful native product implementation; ảnh chưa accepted |

### Cycle 2 — Gallery local

IAB mở `http://127.0.0.1:4184/`, đọc AX/DOM. Lần click automation không đổi state; keyboard Enter trên button chuyển được ba view, selected state/caption/alt/link/note cùng cập nhật. Không dùng click tool success làm bằng chứng pointer interaction đã PASS.

Phát hiện Medium: khi đổi `src`, caption mới có thể xuất hiện trước ảnh mới, làm screenshot thể hiện ảnh cũ dưới tab mới. Sửa: ẩn image pending, `aria-busy`, copy “Đang tải ảnh thiết kế…”, hiện lại theo load event. Đã kiểm lại select + loaded src + selected label; screenshot cũ được thay bằng bản chụp sau load. Không có timer giả lập hoặc hoạt ảnh giả.

### Cycle 3 — Sau sửa

Gallery được kiểm qua IAB native browser, không dùng Playwright Chromium fallback. Phương thức input kiểm được: bàn phím Enter. Viewport quan sát: 1440×1000 desktop, 390px narrow (chiều cao báo 796px ở lần override 844px, do chrome môi trường). Không phát hiện horizontal overflow ở DOM checks. Đây là gallery responsiveness, không chứng minh anatomy viewer mobile.

Screenshot gallery ở `evidence/gallery-desktop.png`, `gallery-mobile.png`, `gallery-activity.png`. Đã dùng `view_image` cho ảnh concept và ảnh gallery. Screenshot gallery scaled theo viewport; concept gốc 1586×992 desktop/activity và 853×1844 mobile. Không có screenshot native implementation vì chưa implement sản phẩm.

## 3. Product Content Review — scope gallery

Audience: chủ sản phẩm/reviewer xem concept; task: chọn ảnh, hiểu luồng và biết giới hạn. Locale vi, web, native buttons/links. Apple-native conventions NOT_APPLICABLE; tám nguyên tắc được dùng làm quality reference.

Inventory toàn bộ nhóm copy gallery:

| Nhóm | String/state | Hành vi được kiểm |
| --- | --- | --- |
| Header/intro | HumanScope, bộ thiết kế, ảnh không phải app | Hiển thị đầu trang |
| Selector | 01 Desktop / 02 Mobile / 03 Trải nghiệm 4D, pressed/focus | Enter đổi view thật |
| Hình/caption | 3 alt texts, 3 captions, loading, image error | Default/loaded kiểm; error chỉ source review |
| Handoff links | Mở ảnh gốc, đặc tả, brief model, README | Đích local tồn tại qua static check |
| Notes | Purpose + 4 bước từng view + hạn chế | Thay text đúng selection qua DOM |
| Disclosure | Hình AI, chưa mesh/animation/license/clinical approval | Luôn có trong page; ảnh cũng có footer |
| Status | `aria-live` sau select; no-script fallback | Live text có trong AX; chưa dùng screen reader thật |
| Footer | Draft/not production | Không success/bệnh viện/chuyên gia bịa |

State applicability: default/selected/focus/loaded có evidence; loading/error đã source-review, không fault injection. Không có write/save/destructive/login flow trong gallery nên confirmation/unauthorized/success persistence NOT_APPLICABLE. Không có metrics sức khỏe hoặc zero/null mapping. Hình tĩnh không có semantic anatomy controls để accessibility tools điều khiển; điều này được nói rõ.

| Principle | Gallery result | Evidence/giới hạn |
| --- | --- | --- |
| Purpose | PASSED trong gallery | Một công việc chọn và xem thiết kế |
| Agency | PASSED trong gallery | Chuyển view/mở ảnh/spec; không buộc đăng nhập |
| Responsibility | PASSED trong gallery | Disclosure AI/chưa 3D/4D rõ, không clinical claim |
| Familiarity | PASSED trong gallery | Native button/link, selected + text |
| Flexibility | NOT_RUN đầy đủ | Enter/390px đã kiểm; screen reader/zoom/en chưa kiểm |
| Simplicity | PASSED trong gallery | Ba view, cùng cấu trúc notes |
| Craft | NOT_RUN đầy đủ | Load mismatch sửa, còn fault/a11y/locale verification |
| Delight | PASSED trong gallery | Xem concept cùng giải thích không ngắt luồng bằng modal |

Product Language Gate: **BLOCKED cho nghiệm thu implementation đầy đủ**, không nâng bằng chứng gallery thành PASS cho app. Copy proposal trong PNG chưa accepted và có deviation nêu trên. Runtime a11y/200% zoom/English/clinical review còn thiếu.

## 4. Quality gates và handoff

| Gate | Status |
| --- | --- |
| PNG tồn tại/kích thước/prompt provenance | PASSED theo inventory |
| Gallery JS syntax | PASSED `node --check` trên inline script được trích |
| Gallery keyboard 3-state navigation | PASSED, IAB DOM/AX |
| Gallery responsive horizontal overflow | PASSED ở 390/1440px đã kiểm |
| Pointer navigation / screen reader / 200% zoom | NOT_RUN hoặc chưa xác nhận |
| Native product fidelity / whole app flows | NOT_RUN, chưa code app |
| Model/license/anatomy/physiology validation | BLOCKED, chưa có tài nguyên |
| Final implementation review | BLOCKED cho sản phẩm, design draft có để review |
| Production readiness | NOT_READY |

Skill `frontend-app-builder` dùng phần concept và review; không gán “10/10 accepted design implementation” cho gallery hiển thị ảnh. Skill `write-product-content` và `final-implementation-review` giữ giới hạn và findings ở trên. Chưa có human approval, final review runtime receipt hoặc provider token/cost metadata. Token usage/cost: Unavailable. Memory candidates: None. Không tạo memory.

## 5. Owner decisions để đi tiếp

Chọn/điều chỉnh hướng visual; xác nhận mẫu/hệ ưu tiên; chọn asset theo license từng thành phần; gán anatomy reviewer; review implementation plan trước xây viewer. Việc thiếu model không chặn giao các visual concepts, nhưng chặn gọi sản phẩm là mô hình người 4D hoạt động.
