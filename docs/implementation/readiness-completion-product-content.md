# Product content review — local readiness slice

Audience: người học tiếng Việt, dùng web desktop/mobile. Task: đọc đủ ghi chú/lịch ôn, phục hồi lỗi tải, tải dữ liệu riêng có xác minh. Không thay brand hay biểu đạt clinical.

Evidence: `output/playwright/readiness-completion/results.json`, account screenshots1440/768/390/320; source `explorer.tsx`, `learning-reviews.tsx`, `account-export.tsx`, `personal-export.ts`; API negatives và collector unit tests. Browser dùng synthetic emulator data. Disabled export state được nhìn trong context; enabled Google modal/download provider path chưa đạt browser acceptance.

| Principle | Scoped result | Evidence/limit |
| --- | --- | --- |
| Purpose | PASSED for pagination/account | Tải thêm giúp truy cập dữ liệu ngoài100; export nêu đúng nhóm dữ liệu |
| Agency | NOT_RUN for complete export scope | Tải lại/retry, giữ trang cũ; export source có cancel nhưng popup flow chưa được browser chứng minh |
| Responsibility | PASSED in displayed states | Cảnh báo file riêng tư, không hứa xóa đang disabled; không tạo file partial trong collector tests |
| Familiarity | PASSED | Button/label tiếng Việt, HTML controls và dialog theo web, không sao chép Apple-only convention |
| Flexibility | PASSED within viewport/keyboard proxy |320–1440 không overflow, keyboard focus kiểm tra; physical/screen-reader NOT_RUN |
| Simplicity | PASSED | Một hành động tải thêm, lỗi có đường thử lại; không phơi cursor/hash cho người dùng |
| Craft | NOT_RUN for complete export scope | Pagination/account flow browser đạt; export enabled popup/error/success cần browser evidence tiếp |
| Delight | PASSED in tested recovery | Giữ dữ liệu đã tải khi trang tiếp theo lỗi, không làm người dùng tải lại từ đầu |

Changed strings inventory:

- Personal lists: “Đang tải thêm…”, “Tải thêm nội dung đã lưu”, “Chưa tải được phần tiếp theo. Bạn có thể thử lại hoặc tải lại danh sách.”, “Tải lại danh sách”. States: idle/loading/partial/error/retry.
- Review queue: “Đang tải thêm bài ôn…”, “Phần lịch này chưa có bài ôn khả dụng. Bạn có thể tải tiếp.”, “Chưa tìm thấy bài ôn khả dụng trong phần lịch đã tải.”, “Đã tải hết lịch ôn khả dụng.”, “Lịch ôn đã thay đổi. Tải lại lịch để tiếp tục.”, “Tải thêm bài ôn”, “Đang hiển thị một phần lịch ôn. Các bài khác vẫn được lưu trong tài khoản.” Existing empty/auth/error strings retained.
- Export description: names profile/notes/lessons/scenes/history, JSON/private storage warning, reads occur in pages and user should avoid concurrent edits. Controls: “Tải dữ liệu cá nhân”, “Tải dữ liệu cá nhân” dialog title, “Xác minh & tải dữ liệu”, “Đang chuẩn bị…”, “Đóng”, “Thử lại”. Status: prepare Google, records read, browser download dispatched rather than file definitely saved. Errors: unavailable Google, wrong identity, capacity, failed collection. Exact literals remain in account-export.tsx; this inventory groups long descriptions without claiming string-file-only verification.

Meaning: public quiz publication checks remain server-side; due dates still Vietnam time, not proof of clinical competence. Empty filtered page with cursor is partial, not no stored data. Local collector never returns partial success. Download receipt does not promise OS file persistence. Existing export limit errors keep data intact.

Overall Product Language Gate: **BLOCKED for complete export enabled-state handoff**, because current popup/provider browser evidence is missing. Tested account/pagination portion passes within the disclosed viewport/keyboard proxy. No live provider, native screen reader or physical-device PASS is claimed.
