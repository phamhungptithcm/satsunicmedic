# SIM-01 — kiểm thử và chuẩn bị phát hành, 2026-10-02

**Kết luận: NOT_READY cho production đầy đủ.** Kiểm thử local của phiên bản hiện tại đạt; không triển khai, push, publish hoặc thay đổi dữ liệu thật. Không thay mã sản phẩm trong đợt QA này.

## Phiên bản được kiểm tra

- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`; có WIP và nhiều file untracked, được giữ nguyên và đưa vào snapshot theo allowlist.
- Candidate SHA-256: `06721fd9f04552a2e350dcaf93b6eff37990a453e0520caf508ac9e605504302`.
- Archive SHA-256: `3217e4f1cc7b80b83f7d0d2b90f14c37d1068035cf3ea9c955eceede89479dc0`.
- 315 file, archive 116,172,783 byte: `.ai/local/release-qa-2026-10-02/candidate/source.tar.gz`.
- Snapshot bao gồm source hiện tại và asset đã allowlist; không phải container đã nghiệm thu. Đối chiếu lại tất cả hash sau kiểm thử: không thay đổi.

## Bằng chứng mới

| Gate | Kết quả | Phạm vi |
|---|---|---|
| Repository intelligence | PASSED | Gate READY; CodeGraph lesson-scene/callers và CocoIndex trạng thái mô phỏng; xác minh bằng source |
| Unit | PASSED | `vitest run`: 314 test, 32 file |
| Integration | PASSED | 36 test, 2 file; Firebase Auth/Firestore emulator, project demo-humanscope |
| Static analysis | PASSED | ESLint apps/packages/tests; TypeScript root, API, web |
| Compilation | PASSED | API/contracts tsc; Next production webpack build |
| Account browser | PASSED | 11 checks: lưu/reload hồ sơ và tùy chọn; 4 viewport; 105 ghi chú/bài ôn; lỗi trang tiếp và retry; xóa UI riêng khi đổi tài khoản; lỗi tải hồ sơ và bàn phím |
| Anatomy browser | PASSED | 9 checks: model ready; tìm kiếm rỗng/phục hồi; ẩn/hiện cơ; 3 mức học; kế thừa ẩn; nút phục hồi; quay lại giữ ẩn; không tràn ngang 768/390/320 px |
| Model failure | PASSED | Chặn tải model trong browser → thông báo lỗi; bỏ chặn → retry thành công |
| Assets | PASSED | 77 endpoint, 148,601,464 byte đúng kích thước/hash; tất cả có trong snapshot; ID lạ trả 404 |
| Dependency audit | PASSED | `pnpm audit --prod --json`: 0 advisory tại thời điểm chạy; không tương đương bảo đảm không có lỗ hổng |
| Runtime feature gate | PASSED | Production mặc định không mở khám phá; bật DISCOVERY_MODE_ENABLED=true chỉ trên localhost để kiểm thử |
| Migrations/API changes | NOT_APPLICABLE | Không có thay đổi schema/API trong đợt này; không chạy migration production |
| Live/container acceptance | NOT_RUN | Browser chạy Next production build qua next start, không phải Docker/Cloud Run; Google thật, restore, thiết bị/GPU thật và screen reader chưa kiểm tra |
| Final review / release | BLOCKED | Candidate-bound discovery gate exit 2; thiếu assetRights, liveGoogle, restore, physicalDevices |

Bằng chứng JSON, screenshot và harness nằm tại `.ai/local/release-qa-2026-10-02/`. `account-results.json`, `browser-results.json`, `failure-results.json`, `assets.json`, `dependency-audit.json`, `release-gate.json`, `final-review.json` là các đầu ra riêng. Screenshot lesson được xem trực tiếp; reduced motion đang bật và thông báo hiện đúng. Không ghi token đăng nhập hoặc dữ liệu người thật vào báo cáo.

## Review và các giới hạn

Cycle 1: lỗi khởi chạy môi trường/harness được sửa: sandbox không cho bind localhost (escalation được chấp thuận); chạy tsx từ root lấy sai cấu hình decorator (chuyển sang API biên dịch); waitForFunction bị CSP chặn (dùng locator, không nới CSP). Lệnh build đầu tiên dùng nhầm đường dẫn binary, chạy lại đúng package thành công. Một truy vấn searchbox không đúng role cũng được thay bằng textbox có nhãn. Đây là lỗi thao tác kiểm thử, không phải sửa mã sản phẩm.

Cycle 2: kiểm tra lại source/caller scene, hash asset, canonical model, trạng thái ẩn và recovery, private data/session emulator, CSP và controls. Không thấy thêm lỗi sản phẩm trong phạm vi các check đã chạy. Không tuyên bố không còn lỗi toàn hệ thống. Không có chuỗi UI mới; báo cáo product-content của continuation vẫn áp dụng cho nội dung, với bằng chứng rendered mới về empty, reduced-motion, hidden và retry. Không thẩm định y khoa mới trong đợt này.

Gate tổng quát `scripts/release-check.mjs` cũng trả NOT_READY nhưng đọc receipt lịch sử; không dùng trường LIVE_FOUNDATION của nó làm bằng chứng production hiện tại. Candidate-bound gate mới được lưu riêng và không tự gán approval/deferral để lấy PASS.

## Công việc còn lại trước phát hành

1. Hoàn thiện phạm vi đã yêu cầu: 24/27 chủ đề chưa có mô phỏng; 11 hướng dẫn chức năng là atlas tĩnh, chưa phải mô phỏng chuyển động. Không đổi nhãn thành “đầy đủ”. Xem anatomy-simulation-remaining-work.md cho yêu cầu từng nhóm.
2. Gắn bằng chứng quyền sử dụng, attribution và nghiệm thu nội dung/asset vào đúng candidate. Hash đúng chỉ chứng minh tính toàn vẹn, không chứng minh quyền hay độ đúng giải phẫu. Hướng dẫn thông tin dựa trên nguồn công khai không bị mô tả thành công cụ chẩn đoán hay nội dung đã được chuyên gia duyệt.
3. Kiểm thử tài khoản Google/session thật, diễn tập khôi phục trên môi trường được phép, thiết bị cảm ứng/GPU thật và hỗ trợ tiếp cận. Nghiệm thu container/triển khai với đúng cấu hình API_ORIGIN, Firebase public config và cờ discovery, rồi kiểm tra rollback theo revision đã xác minh.
4. Chốt candidate mới nếu source thay đổi; chạy lại check bị ảnh hưởng, gắn evidence mới và review lại trước phát hành. Không tự bỏ qua các gate còn thiếu.

Không tính tỷ lệ hoàn thành toàn sản phẩm từ số test: thiếu trọng số nghiệm thu đã thống nhất. Local QA hoàn tất trong phạm vi trên; sản phẩm đầy đủ chưa hoàn tất. Token usage, actual cost và API-equivalent cost: Unavailable. Memory candidates: None. Runtime ai-agent-kit không có trong PATH; dùng báo cáo và JSON thủ công, không giả lập runtime receipt.

## Tiếp tục sau xác nhận “let do it”

Cùng candidate hash, không thay source sản phẩm. Repository index được refresh một lần thành công. Gate Docker được thử lại ngoài sandbox: Docker daemon chưa chạy; đây là hạn chế môi trường, không phải automatic approval rejection.

Đã đóng gói runtime standalone với cùng bố cục copy của Dockerfile (standalone + static + discovery assets), khởi chạy localhost:4287. Chạy lại 9 kiểm tra discovery và 2 kiểm tra lỗi/retry: PASSED. Kiểm tra HTTP/hash toàn bộ 77 chunk (148,601,464 byte): PASSED. Không coi đây là Docker image, Linux/Node24 hoặc Cloud Run acceptance; môi trường host vẫn là macOS/Node25. Log 500 của endpoint tài khoản khi API local không chạy không được tính thành lỗi mô hình, cũng không phải account acceptance mới.

Quyền sử dụng asset: đối chiếu trực tiếp [trang license chính thức BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), [download chính thức](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) và [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ngày 2026-10-02. Trang license cập nhật 2025-02-27, chỉ định CC BY 4.0; download vẫn liệt kê BP3D 4.0 IS-A/PART-OF đã dùng. Header license cũ được giữ trong provenance, không xóa dấu vết. Hai archive nguồn khớp hash receipt; cả 79 asset trong manifest phân phối khớp byte/hash. Attribution, license link và mô tả chuyển đổi có trong manifest và UI. Asset-rights gate PASSED trong phạm vi nguồn dữ liệu giáo dục này; không phải ý kiến pháp lý, thẩm định lâm sàng hay quyền cho tài nguyên chưa có.

Bằng chứng mới: `asset-rights.json`, `standalone-assets.json`, `standalone-browser-results.json`, `standalone-failure-results.json` và screenshot `standalone-lesson.png` trong thư mục evidence. Gate candidate chạy lại vẫn **NOT_READY**, nay chỉ còn liveGoogle, restore, physicalDevices. Không tự tạo deferral. Toàn bộ sản phẩm vẫn thiếu 24 mô phỏng và dữ liệu chuyển động/vi thể đã ghi rõ trong inventory.

Fresh review cycle 3: đối chiếu phạm vi source asset và quy trình đóng gói; không thay đổi code/config/dependency/production. Gate asset đã được bổ sung bằng bằng chứng hiện tại; runtime standalone được kiểm tra riêng. Requirement/production acceptance vẫn BLOCKED; local packaging checks PASSED. Các kết quả unit/integration/build cũ trong cùng phiên QA vẫn áp dụng vì candidate được xác minh không thay đổi. Đang chờ người dùng chỉ định URL/project staging và tài khoản kiểm thử để làm Google/session và restore ở môi trường được phép; không yêu cầu gửi bí mật. Không khởi tạo hay khôi phục database production.
