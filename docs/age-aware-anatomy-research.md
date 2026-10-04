# Mô hình giải phẫu theo độ tuổi — nghiên cứu và kế hoạch AGE-01 v1

Trạng thái: PROPOSED, chờ duyệt triển khai. Phạm vi lần này: nghiên cứu và thiết kế; chưa thay đổi ứng dụng, chưa tạo mô hình y khoa, chưa triển khai production.

## 1. Định hướng

Đưa **Độ tuổi mô hình** thành một điều khiển chính của không gian giải phẫu. Khi đổi tuổi, người xem giữ nguyên cấu trúc đang quan sát và thấy những thay đổi có căn cứ về hình thể, mô, hoặc chức năng. Mọi biến đổi phải có tài nguyên và phạm vi chuyên môn đã được duyệt.

Tách phát triển cơ thể ở trẻ em khỏi lão hóa ở người lớn. Không dùng một hệ số tuổi để co giãn mọi cơ quan, không tự bật bệnh lý theo tuổi, không gọi hình ảnh minh họa là dự đoán cơ thể của một người.

## 2. Căn cứ và giới hạn

| Căn cứ | Ý nghĩa đối với sản phẩm |
| --- | --- |
| [WHO: Ageing and health](https://www.who.int/news-room/fact-sheets/detail/ageing-and-health) mô tả thay đổi theo tuổi không tuyến tính hay đồng nhất, chỉ liên hệ tương đối với tuổi theo lịch | Tuổi là thông số của mẫu tham khảo; không có một hình thể bắt buộc cho tất cả người cùng tuổi. Không dùng thanh “% lão hóa”. |
| [WHO: Child growth standards](https://www.who.int/tools/child-growth-standards) có dữ liệu tăng trưởng cho trẻ đến 5 tuổi; [tham chiếu 5–19 tuổi](https://www.who.int/tools/growth-reference-data-for-5to19-years) là phạm vi khác | Dữ liệu chiều cao/cân nặng có thể hỗ trợ quy mô hình thể, nhưng không cung cấp hình học 3D của từng cơ quan. Không suy diễn thành bộ giải phẫu trẻ em đã được kiểm chứng. |
| [MedlinePlus: thay đổi da theo tuổi](https://medlineplus.gov/ency/article/004014.htm) mô tả thay đổi độ dày, đàn hồi và mô dưới da, chịu ảnh hưởng của môi trường và di truyền | Cần phối hợp hình khối và bề mặt; không chỉ phủ texture nếp nhăn. Không tự đổi màu da hoặc phóng đại dấu hiệu tuổi tác. |
| [NIA: Heart health and aging](https://www.nia.nih.gov/health/heart-health/heart-health-and-aging) nêu nhịp tim khi nghỉ không thay đổi đáng kể trong lão hóa bình thường | Không tự tăng/giảm tốc hoạt ảnh tim theo tuổi. Nội dung chức năng cần profile và review riêng. Nguồn này kiểm tra qua trích đoạn tìm kiếm; mở toàn văn bị hạn chế. |
| [Three.js Mesh](https://threejs.org/docs/pages/Mesh.html) hỗ trợ morph target và trọng số ảnh hưởng | Có cơ chế kỹ thuật để biến dạng mượt; điều đó không xác nhận tính đúng y khoa của dữ liệu nội suy. |

Các mốc tuổi, bố cục và thời lượng chuyển cảnh dưới đây là đề xuất thiết kế, không phải ngưỡng sinh học hay kết quả nghiên cứu người dùng. Chưa có hệ số định lượng về xương, cơ, da hoặc cơ quan để đưa vào mô hình. Cần chuyên gia và nguồn dữ liệu phù hợp trước khi dựng những biến đổi đó. Không sao chép hình ảnh hoặc dataset nguồn khi chưa xác minh quyền sử dụng.

## 3. Trải nghiệm đề xuất

### Bố cục

```text
                     KHÔNG GIAN MÔ HÌNH 3D
        Giữ góc nhìn · Giữ lớp đang xem · Giữ cấu trúc chọn

Độ tuổi mô hình       40 tuổi               [So sánh độ tuổi]
20 ───────── 40 ───────── 60 ───────── 80
                 Các mốc có dữ liệu

Thay đổi ở cấu trúc đang chọn
Một giải thích ngắn + nguồn tham khảo, mở thêm khi cần.
```

20/40/60/80 là bộ mốc ứng viên cho thí điểm người lớn, chỉ xuất hiện khi có asset tương ứng được duyệt. Không mặc định hiện đầy đủ rồi cho người dùng chọn vào chỗ trống. Tuổi ban đầu lấy từ profile mặc định của asset, không gán 25 hoặc 40 cho một mẫu chưa rõ tuổi.

- Desktop: thanh tuổi bên dưới canvas; panel thông tin bên cạnh cập nhật theo cấu trúc đang chọn. Dùng nền sáng, viền mảnh và accent xanh hiện có; không dùng màu đỏ để biểu thị tuổi cao.
- Mobile: tuổi và nút chọn luôn dễ thấy; phần giải thích mở trong panel gọn. Không che mô hình bằng form dài. So sánh chuyển A/B trong cùng viewport để tiết kiệm GPU.
- Chọn nhanh: các mốc có dữ liệu. Chỉ cung cấp thanh kéo liên tục hoặc ô nhập năm khi asset có miền nội suy đã duyệt; trẻ rất nhỏ cần đơn vị tháng và profile riêng.
- Chuyển đổi giữ hướng nhìn, lớp và cấu trúc nếu còn tương thích. Giữ một tham chiếu kích thước; không tự fit từng tuổi làm cơ thể khác kích thước trông bằng nhau.
- So sánh: desktop có thể dùng hai góc nhìn đồng bộ nếu thiết bị đáp ứng; bản đầu dùng A/B cùng camera, cùng tỉ lệ để giảm độ phức tạp. Ghi rõ tuổi A và B. Đổi mẫu tham chiếu không được mô tả như ảnh trước/sau của cùng người thật.
- Một lần kéo là một lần undo. Không ghi lịch sử mỗi frame. Undo/redo/restore phải khôi phục đồng thời tuổi, mô hình và chú thích.
- Không tự phát quá trình “già đi”. Nếu bổ sung phát theo tuổi sau này, dùng clock riêng với hoạt ảnh sinh lý, có dừng và giảm chuyển động.

### Thế nào là tự nhiên và đẹp

Ưu tiên hình thể nhất quán, ánh sáng ổn định, vật liệu gần tài nguyên được duyệt, chuyển động vừa phải và chú thích không rung/nhảy. Chuyển tiếp khoảng 250–400 ms là ứng viên UX để kiểm thử, không phải thời gian sinh học. Tôn trọng reduced motion bằng đổi trạng thái trực tiếp.

Morph chỉ dùng giữa các mesh có topology, thứ tự đỉnh và rig tương thích, với miền biến đổi đã duyệt. Khác topology hoặc khác giai đoạn phát triển thì tải mẫu riêng rồi thay cảnh sau kiểm tra; không blend thành cơ thể “lai” chưa được duyệt. Không dùng AI sinh ảnh để thay bằng chứng giải phẫu.

### Phân kỳ nội dung

| Giai đoạn sản phẩm | Phạm vi |
| --- | --- |
| Thí điểm | Mốc người lớn có dữ liệu; một vùng/cấu trúc được duyệt; hình thể và chú thích; chọn tuổi, undo, lưu/khôi phục, A/B |
| Mở rộng người lớn | Nội suy đã kiểm chứng; các lớp giải phẫu bổ sung; giải thích chức năng khi có nguồn |
| Phát triển trẻ em | Asset riêng theo giai đoạn; đơn vị tháng/năm phù hợp; chuyên gia nhi khoa duyệt, không thu nhỏ mẫu người lớn |

Lớp chưa có dữ liệu tuổi phải ghi rõ giới hạn hoặc không cho bật biến đổi. Không để da đổi tuổi nhưng các cơ quan giữ nguyên mà tuyên bố toàn thân đã được mô phỏng theo tuổi.

## 4. Repository intelligence brief

- Gate thực thi: `python3 .ai/scripts/check-repository-intelligence.py --json --refresh-if-stale` → READY; CodeGraph/CocoIndex Current, health Passed.
- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`. Working tree có nhiều WIP/untracked từ trước. Kết luận dựa trên source đang có, không phải chỉ commit này. Không sửa WIP.
- CodeGraph xác nhận scene contracts được dùng bởi viewer, private API, learning API; asset contract bởi publication và explorer. CocoIndex tìm được spec assets và nghiên cứu bệnh sinh liên quan. Đã đối chiếu các kết luận chính với source.
- Stack quan sát: TypeScript, Next 16/React 19, Zustand, React Three Fiber/Three, Zod, pnpm, Vitest. Không đề xuất dependency mới.

| Source kiểm tra | Quan sát |
| --- | --- |
| `packages/contracts/src/index.ts` | `sceneSchema` v1 và manifest strict chưa có tuổi; `validateSceneForAsset` kiểm mapping/layer/clip |
| `packages/anatomy-viewer/src/index.ts` | `initialScene`, `change`, `restore`, history; `setManifest` hiện reset scene và history |
| `packages/anatomy-viewer/src/canvas.tsx` | `loadVerifiedModel` kiểm hash/bytes/mesh/clip; `Scene` điều khiển hiển thị và AnimationMixer; chưa có điều khiển biến đổi theo tuổi |
| `apps/web/src/components/explorer.tsx` | asset current → xin access URL → canvas; chưa có bộ chọn tuổi |
| `apps/api/src/public.ts` | `access()` còn trả 503 `ASSET_DELIVERY_NOT_CONFIGURED` sau kiểm manifest |
| `apps/api/src/private.ts`, `learning.ts` | Lưu/chia sẻ/đọc scene sử dụng schema chung; tuổi không thể chỉ lưu cục bộ trong UI |
| `docs/05-viewer-assets-spec.md` | Yêu cầu license, chuyên gia duyệt, asset capability, fallback; không đồng nghĩa đã có bộ asset theo tuổi |

Luồng cần bổ sung: chọn tuổi → kiểm khả năng của profile → resolve trạng thái hình học/nội dung → xác minh asset → commit tuổi đã hiển thị → lưu scene. Khi đang tải, tách tuổi yêu cầu khỏi tuổi đã hiển thị. Response cũ không được ghi đè lựa chọn mới.

## 5. Kế hoạch thay đổi AGE-01 v1

Rủi ro cao về ý nghĩa y khoa; trung bình/cao về scene compatibility, asset switching và bộ nhớ GPU. Phạm vi cần duyệt bao gồm contracts và API đọc/lưu scene, không chỉ UI. Chưa có phê duyệt triển khai trong tài liệu này.

| File/module dự kiến | Thay đổi theo hàm/trách nhiệm |
| --- | --- |
| `packages/contracts/src/index.ts` | Version scene tuổi; manifest khai báo profile/các mốc/miền hỗ trợ. `validateSceneForAsset` từ chối ngoài phạm vi, profile sai và tuổi không khớp asset; đọc scene v1 không tự gán tuổi |
| `packages/contracts/src/age-profile.ts` mới | Schema profile có ID/revision, đơn vị, mốc tuổi, anatomy coverage, tham chiếu nguồn/review/hash, cách chuyển đổi được phép. Resolver thuần; không dùng công thức lão hóa tự đặt |
| `packages/anatomy-viewer/src/index.ts` | `initialScene`, `change`, `restore`, undo/redo: quản lý tuổi đã commit và history; thêm thao tác đổi tuổi có kiểm khả năng; phân biệt đổi tuổi trong profile và thay asset |
| `packages/anatomy-viewer/src/canvas.tsx` | `loadVerifiedModel` kiểm target/rig; `Scene` áp dụng profile, invalidate khi cần, cập nhật anchor, tránh morph track của AnimationMixer ghi đè tuổi; hủy tải cũ và dispose đúng ownership |
| `apps/web/src/components/explorer.tsx` | `ExplorerWorkspace` tích hợp chọn tuổi, loading/error/unsupported, A/B; giữ camera, selection; chỉ ghi tuổi đang hiển thị khi asset hợp lệ |
| `apps/web/src/components/age-controls.tsx` mới, `globals.css` | Điều khiển web có label, keyboard, focus, reduced motion, narrow layout; không thay toàn bộ design system |
| `apps/api/src/private.ts`, `learning.ts`, `publication.ts` | Kiểm tương thích contract lưu/đọc/share/publish; review phải bao phủ profile và nội dung đi kèm, không chỉ hash GLB |
| `tests/contracts.test.ts`, `tests/api.integration.test.ts`, tests viewer tuổi mới | Miền tuổi, v1 compatibility, race, history, save/restore, không hiện nhầm tuổi khi lỗi |
| `docs/05-viewer-assets-spec.md` và tài liệu nội dung liên quan | Cập nhật capability/review/coverage, quy tắc nội suy và inventory tài nguyên thực có |

Thiết kế dữ liệu tối thiểu: scene tham chiếu profile bất biến và giá trị tuổi có đơn vị; metadata profile cho biết tuổi chính xác hay khoảng tuổi tham khảo. Không đổi nhãn khoảng tuổi thành một năm chính xác giả tạo. Review/hash phải ràng buộc geometry, textures, profile và chú thích. Dùng revision mới khi thay nội dung.

V1 chưa có tuổi vẫn phải mở được theo hành vi cũ; hiển thị tuổi chưa xác định khi cần. Không ghi scene mới qua client/API cũ rồi âm thầm mất tuổi. Chốt cơ chế version negotiation và round-trip trước triển khai. Chưa kết luận cần migration database: phải kiểm kiểu lưu snapshot và đường publish khi bắt đầu bước kỹ thuật.

Asset delivery/CDN hiện thiếu là phụ thuộc riêng. Không mặc nhiên mở rộng AGE-01 sang cloud, chi phí, mua model hay triển khai production; lập delta plan nếu cần. Có thể kiểm cơ chế bằng fixture tổng hợp có nhãn, nhưng fixture không chứng minh độ đúng y khoa.

## 6. Acceptance và xác minh sau phê duyệt

1. Chỉ chọn tuổi có capability được duyệt. Giá trị NaN, vô hạn, âm, sai đơn vị, ngoài miền và profile mismatch bị từ chối ở contract/API.
2. Mô hình, nhãn tuổi và nội dung luôn khớp; đổi liên tiếp không bị response cũ ghi đè. Mất mạng, hết hạn review, sai hash/target giữ mẫu cũ với nhãn cũ hoặc fallback rõ ràng.
3. Camera/lớp/selection không reset ngoài ý muốn; annotation bám đúng vị trí sau morph. Cấu trúc không tương thích có thông báo.
4. Undo một lần trở về trước thao tác kéo; redo/reset/save/restore/share đúng tuổi. Scene cũ vẫn mở và không bị gán tuổi bịa.
5. Review chuyên môn tại các mốc và trung gian trong mọi miền được phép, mọi layer/tier, nhiều góc nhìn. Không xuyên mesh, đảo normals, co giãn cơ quan vô căn cứ hoặc đổi bệnh lý theo tuổi.
6. Desktop/mobile, bàn phím, screen reader, zoom 200%, reduced motion; màu sắc không là cách duy nhất để phân biệt tuổi/trạng thái. Đo load/memory/frame time trên thiết bị mục tiêu trước chốt ngân sách hiệu năng.
7. Regression thích hợp: `pnpm test`, `pnpm typecheck`, `pnpm lint`; integration nếu môi trường test sẵn sàng. Chỉ chạy sau thay đổi phù hợp. Hiện chưa chạy kiểm thử runtime cho tính năng chưa triển khai.

Rollback code/profile cần giữ khả năng đọc scene mới; không hạ validator khiến cảnh đã lưu mất tuổi. Asset revoked không được dùng làm fallback. Không thêm log dữ liệu cá nhân hay thu ngày sinh người dùng: tuổi này thuộc mô hình tham khảo.

## 7. Product content draft và kế hoạch review

Áp dụng skill `write-product-content`. Nền tảng: web responsive, tiếng Việt. Đối tượng giả định: người học giải phẫu; chưa có nghiên cứu người dùng. Đây là đề xuất chuỗi giao diện, không mô tả hành vi đã triển khai.

| Trạng thái | Nội dung đề xuất | Điều kiện |
| --- | --- | --- |
| Nhãn | Độ tuổi mô hình | Không hỏi tuổi/ngày sinh người xem |
| Giá trị | 40 tuổi / 6 tháng | Đúng đơn vị và phạm vi profile |
| So sánh | So sánh độ tuổi; Mẫu A; Mẫu B | Hai mẫu ghi rõ tuổi |
| Tải | Đang tải mô hình 60 tuổi… | Mẫu cũ giữ nhãn tuổi cũ |
| Thành công | Đang hiển thị mô hình 60 tuổi. | Chỉ thông báo sau commit, không đọc mỗi frame |
| Chưa hỗ trợ | Chưa có mô hình cho độ tuổi này. | Không tự thay bằng tuổi gần nhất |
| Lỗi | Chưa tải được mô hình 60 tuổi. Đang hiển thị mẫu 40 tuổi. | Chỉ dùng khi còn mẫu 40 hợp lệ; có nút Thử lại nếu đã triển khai |
| Không còn mẫu hợp lệ | Mô hình này hiện chưa sẵn sàng. | Không tiếp tục hiển thị mẫu hết hạn |
| Một phần | Chưa có dữ liệu thay đổi theo tuổi cho cấu trúc này. | Không hiểu thành cấu trúc không thay đổi |
| Ngữ nghĩa | Mô hình tham khảo. Thay đổi theo tuổi khác nhau ở mỗi người. | Không dùng để chẩn đoán cá nhân |

Không có thao tác hủy dữ liệu hay quyền mới trong bộ chọn tuổi; trạng thái xác nhận destructive/permission mới: NOT_APPLICABLE. Luồng lưu/chia sẻ vẫn phải giữ quyền hiện hành.

| Nguyên tắc | Thiết kế cần kiểm | Trạng thái bằng chứng UI |
| --- | --- | --- |
| Purpose | Tuổi hỗ trợ quan sát cấu trúc | NOT_RUN |
| Agency | Chọn mốc, A/B, undo, không tự phát | NOT_RUN |
| Responsibility | Công khai giới hạn; không suy ra bệnh | NOT_RUN |
| Familiarity | Label và điều khiển web quen thuộc | NOT_RUN |
| Flexibility | Keyboard, mobile, đơn vị tháng, reduced motion | NOT_RUN |
| Simplicity | Một điều khiển chính; giải thích mở thêm | NOT_RUN |
| Craft | Hoàn chỉnh loading/error/partial/restore | NOT_RUN |
| Delight | Chuyển đổi ổn định, tôn trọng mọi độ tuổi | NOT_RUN |

Product Language Gate cho triển khai: BLOCKED, vì chưa có giao diện mới để kiểm trong ngữ cảnh. Khi triển khai phải hoàn thành `.ai/templates/product-content-review.md` với ảnh/render, state coverage, platform fit, data semantics, accessibility, localization và tất cả nguyên tắc. Không coi bảng draft là chứng nhận UI đạt chất lượng.

## 8. Review và bàn giao nghiên cứu

Đã đối chiếu đề xuất với source và nguồn bên ngoài trong một vòng review tài liệu. Đã làm rõ ba điểm dễ gây hiểu nhầm: mốc tuổi chỉ là ứng viên, scene v1 không có tuổi mặc định, và animation/morph không đồng nghĩa với bằng chứng giải phẫu. Không có sửa lỗi ứng dụng trong vòng này.

- Nghiên cứu/impact/plan: đã ghi nhận; chưa được người dùng hoặc chuyên gia y khoa phê duyệt.
- Implementation và runtime tests: NOT_RUN; final implementation review chưa áp dụng vì chưa triển khai. Không tuyên bố tính năng hoàn tất.
- Production: NOT_READY; thiếu asset theo tuổi được duyệt, delivery và kiểm chứng UI/y khoa.
- Chưa xác minh khả năng mua/giấy phép, danh mục asset đang có ở ngoài repo, dữ liệu theo giới tính/sắc tố/thể trạng hay chủ sở hữu review. Không giả định cùng tuổi thì cùng hình thể.
- Token usage và chi phí thực: Unavailable. Không thực hiện mua tài nguyên hay deploy.
- Memory candidates: None.

Quyết định cần cho bước tiếp theo: duyệt AGE-01 v1 cho thí điểm các mốc người lớn có dữ liệu và một vùng giải phẫu; danh mục tuổi cụ thể chỉ được chốt sau kiểm tài nguyên. Trẻ em và nội suy toàn vòng đời là giai đoạn mở rộng, không được coi là đã giải quyết trong thí điểm.
