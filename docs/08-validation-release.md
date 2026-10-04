# Kiểm thử, nghiệm thu và release gate

Tất cả test ứng dụng dưới đây: **NOT_IMPLEMENTED / NOT_TESTED** tại thời điểm viết. Bảng là kế hoạch nghiệm thu, không là kết quả kiểm thử.

## 1. Thang bằng chứng

1. Source/spec review chứng minh hợp đồng thiết kế, không chứng minh runtime.
2. Unit/fixture chứng minh logic trên input xác định.
3. Integration với PostgreSQL chứng minh transaction/query/authorization trong môi trường đó.
4. Browser E2E chứng minh luồng trên candidate + trình duyệt ghi nhận.
5. Device thật chứng minh GPU/memory/touch cụ thể.
6. Staging Google Cloud/Firebase thực chứng minh identity/storage/CDN/config tích hợp; Firebase Emulator không thay bằng chứng live.
7. Production readback chứng minh deployment đang phục vụ, không thay review chuyên môn/license.

Không cộng các PASS khác candidate thành “full PASS”. Mỗi evidence ghi commit/image/asset/content hashes, môi trường, test version, người chạy, thời gian, kết quả và hạn chế.

## 2. Ma trận truy vết

| ID | Test bắt buộc | Tầng | Owner |
| --- | --- | --- | --- |
| HS-01 | Anonymous mở explore, không redirect login | E2E + staging | Frontend/QA |
| HS-02 | Orbit/pan/zoom/reset, anatomical left/right, keyboard/touch | Unit + browser + reviewer | Graphics |
| HS-03 | Visible/opacity independent, đổi mode giữ, depth correctness | Unit + visual/device | Graphics/medical |
| HS-04 | Multi-mesh selection đồng bộ model/tree/panel | Unit + E2E | Frontend |
| HS-05 | Alias/dấu/hoa, zero result, missing mesh, stale response cancel | Unit + API + E2E | Search/viewer |
| HS-06 | Isolate/reset/undo/redo roundtrip, history bounded | Unit + E2E | Graphics |
| HS-07 | Không WebGL vẫn đọc; keyboard/screen reader; label overlap | Browser + manual a11y | QA/design |
| HS-08 | Boundary stage/scrub/pause/speed/hidden tab, sync clip | Unit + real browser + medical | Graphics/medical |
| HS-09 | Published revision/locale/source/review date, no draft | API + editorial review | Editorial |
| HS-10 | Quan hệ cơ quan/bệnh/specialty có nguồn, không diagnosis | E2E + medical | Product/medical |
| HS-11 | Branch/area/date/source, stale/no result, official link | Integration + E2E + verification | Directory |
| HS-12 | Quiz đúng revision, submit retry, guest vs stored progress | API/DB + E2E | Learning |
| HS-13 | Save/reopen exact scene, version unavailable, conflict | Schema/unit/DB/E2E | Learning/graphics |
| HS-14 | Share scope/expiry/revoke/private notes/license denied | API negative + E2E | Security |
| HS-15 | 360/390/768/1024/1440px, 200% zoom, Việt/Anh expansion | Browser + devices | Design/QA |
| HS-16 | Tenant/user matrix, role escalation, delete replay/restore | DB integration + staging | Security/backend |
| HS-17 | Direct URL/cache revocation, draft publish bypass denied | API + real CDN | Security/SRE |
| HS-18 | Offline/slow/abort/checksum/context loss/no GPU/retry | Fault injection + device | QA |

## 3. Những bộ kiểm tra riêng

- DB: concurrent scene update, transaction rollback khi audit lỗi, unique idempotency, cross-org composite FK, migration mixed versions, import interrupted/retry, deletion checkpoint.
- Content: source gắn đúng claim; reviewer khác tác giả; sửa hash làm approval stale; translation chưa duyệt không public; review due/withdrawn không lọt search/HTML/API.
- Asset: orphan mapping, wrong laterality, repeated IDs, external URLs, corrupt GLB, oversized textures, expired rights, revoked access, consistency các tiers, export bị chặn theo license.
- Security: IDOR ở từng endpoint/method; không chỉ test UI ẩn nút. XSS, CSRF, unauthenticated upload, rate-limit, no-store/cache variation, log redaction và secret scan.
- Accessibility: manual keyboard + NVDA/Firefox hoặc Chrome trên Windows và VoiceOver/Safari trên Apple; trình duyệt/OS exact ghi trong report. Canvas HTML alternative, focus khi sheet đóng, status announcements, contrast/zoom/text expansion.
- Privacy: synthetic marker trong note/query không xuất hiện ở URL, access logs, traces, analytics, share snapshot, browser storage ngoài thiết kế.
- Firebase: Auth Emulator kiểm luồng local; staging kiểm Admin SDK/session-cookie exchange/CSRF, project mismatch, revoked/disabled user, registry logout và MFA theo tier thực tế. Production reject emulator config. Firestore không thuộc stack nên không nhận Firestore Rules PASS cho bảo mật PostgreSQL.
- Google Cloud: Cloud Run ingress không bị vượt qua direct URL; unsigned/invalid/expired CDN URLs và direct bucket URLs bị chặn cả cold/warm cache; upload grant không ghi sang approved bucket; worker bị retry/chạy chồng vẫn idempotent; Cloud SQL failover/pool cap và Firebase outage không làm mất kiểm soát quyền.
- Storage: nếu Firebase SDK surface được bật, Rules emulator tests kiểm client deny; IAM/ADC/signed URLs phải test riêng trên staging vì Admin SDK không dựa vào client Rules. Không coi Auth/Storage emulator là kiểm thử Cloud SQL, Cloud Run hoặc Cloud CDN.

## 4. Thiết bị và hiệu năng

Baseline proposed: một laptop tích hợp GPU, một Android tầm trung và một iPhone còn được hỗ trợ tại thời điểm test; ghi model/OS/RAM/GPU/browser exact. Không giả định emulator là thiết bị thật. Chrome/Edge/Firefox desktop và Safari macOS/iOS theo support matrix chốt ở P1; browser version pin cho test, kiểm latest stable trước launch.

Mỗi mẫu đo: cold cache/warm cache, vùng toàn thân/hệ sâu, 60 giây orbit + animation, chuyển vùng 20 lần, route/unmount 20 lần, context loss/restore và chất lượng thấp/cao. Lưu bytes, timings, p50/p95 frame time, JS/GPU memory nếu công cụ đo được, context loss và crash. GPU memory không đo được phải ghi unavailable, không ghi 0.

So với mục tiêu ở [runbook](07-zero-to-production.md), nếu model không đạt cần optimize/tier hoặc giảm phạm vi được duyệt. Không xóa cấu trúc quan trọng mà không review chuyên môn. Performance waiver phải có owner/thiết bị bị ảnh hưởng/phương án fallback, không biến số mục tiêu thành số đo.

## 5. Gate trước public launch

| Gate | Điều kiện PASS | Trạng thái hiện tại |
| --- | --- | --- |
| Product | F1–F5 chạy thật, HS trong phạm vi release đạt | NOT_TESTED |
| Asset | Giấy phép + anatomy + capabilities + thiết bị thật | BLOCKED: chưa chọn asset |
| Medical | Người duyệt thật, nguồn, bản dịch, warning và workflow | BLOCKED: chưa gán người/nội dung |
| Design/language | In-context desktop/mobile/a11y và 8 nguyên tắc | NOT_RUN |
| Security/privacy | Negative tests, threat review, retention/consent | NOT_RUN |
| Operations | SLO instrumented, alert/restore/rollback drill | NOT_RUN |
| Legal/commercial | Rights, privacy/jurisdiction, ngân sách/provider | BLOCKED: owner chưa chốt |
| Candidate | Hashes, dependency scan, migration compatibility | NOT_APPLICABLE: chưa có build |
| Deployment | Approval + live readback | NOT_RUN |

Decision hiện tại: **NOT_READY**. Required gate failed/missing/stale/not-run đều NO-GO. Không dùng số lượng test để thay thế các cổng thiếu bằng chứng.

## 6. Release evidence bundle

Mỗi candidate có `manifest`, test summaries + reports gốc, license/review receipts với quyền truy cập thích hợp, content release IDs, screenshots/video phạm vi có quyền, performance captures, migration/restore report, security findings đã triage, product-content review, final review cycles, known limitations và rollback plan. Không đưa PHI/secrets/hợp đồng riêng vào artifact public.

Go/no-go cần Product, medical, security/privacy và release owner xác nhận phần mình chịu trách nhiệm. Nhóm có thể trùng người nếu policy cho phép, nhưng reviewer nội dung không tự duyệt bài mình. Tính năng ngoài release phải ghi deferred và UI không giả khả dụng. Final review chạy sau lần sửa cuối và cùng candidate.
