# Product content review — HS-UX-CLEAN-1

2026-10-01 · Codex self-review · Vietnamese responsive web, English source terminology retained. Scope: the twelve files in `candidate.json`; audience: learners exploring anatomy and opening available quizzes. Outcome: find an organ, deliberately reveal it, recover from empty/error states, and keep control of page navigation. This is a preview anatomy workflow, not clinical guidance. Existing HumanScope typography, blue controls and neutral surfaces remain the design reference.

Apple platforms are not targeted. Human Interface principles were applied as a human-centered reference using the repository's write-product-content guidance, not as Apple UI or an Apple compliance claim. Browser-native buttons, selects, range inputs, links, focus, pointer and reduced-motion behavior govern platform fit.

## Verified facts and limits

Exact catalog IDs plus expected English names gate the sixteen navigation translations. Source geometry identity, original English names, publication/authentication and clinical-review boundaries are preserved. Current production home differs from development preview; standalone production smoke confirms unavailable-model guidance and a 404 for development asset delivery. Clinical validation of new navigation translations, real screen-reader speech, physical phone GPUs, offline-network matrix and live accounts were not tested. No full WCAG certification is claimed.

## Changed content inventory

Before/after behavior is recorded in `review-cycles.md`; this inventory covers every changed text family including accessible and conditional labels. Existing unchanged layer controls, medical disclaimers, errors and source attribution remain in place.

| Location/state | Current delivered content | Purpose and behavior evidence |
| --- | --- | --- |
| Vocabulary, defaults/results/selection | Tim; Não; Hộp sọ; Gan; Tụy; Phổi phải; Phổi trái; Khí quản; Thực quản; Dạ dày; Ruột già; Ruột non; Thận phải; Thận trái; Bàng quang; Cột sống | `body-vocabulary.ts`: sixteen exact ID/name mappings. Aliases support accent-normalized search; unknown names retain source English. Semantic tests verify identities and reject substring false matches. |
| Heading/default | “Chọn cấu trúc · Xem rõ · Tìm hiểu”; “Bạn muốn khám phá gì?” | Short orientation describes actual sequence; desktop screenshot and rendered first-load inspection. |
| Mobile navigation | “Bảng công cụ”; “Tìm cấu trúc”; “Công cụ”; “Có cấu trúc đang chọn” | Two native buttons with pressed state and aria-controls; only active in-flow panel is displayed. Browser selection test verifies heading focus. |
| Search/filter/list | “Tìm trong vùng”; “Kết quả”; “Gợi ý cấu trúc”; “60 đầu tiên” or actual result count; translated label plus original English | Filter does not navigate camera or load all geometry. Common-organ suggestions avoid overwhelming unqueried list. Count is shown result count, not anatomy completeness. |
| No results/filtered suggestions | “Chưa tìm thấy cấu trúc phù hợp.”; “Chưa có gợi ý trong bộ lọc này.”; “Thử tìm trong toàn thân và tất cả hệ.”; “Thử tên khác, chẳng hạn ‘tim’, ‘gan’ hoặc ‘lung’. Tên chuyên sâu có thể cần tiếng Anh.”; “Bỏ bộ lọc”; “Xem gợi ý” | Clear distinction between unknown query and no suggested common organs. Real browser exercises both recovery buttons; clearing filter does not move scene. |
| Search help/default selection | “Chọn cấu trúc, rồi bấm ‘Xem rõ’ để quan sát riêng. Trái và phải theo cơ thể người.”; “Tìm ‘tim’, ‘gan’ hoặc chọn trên mô hình, rồi bấm ‘Xem rõ’.” | Explicit focus action, anatomical left/right preserved; no automatic camera jump on selection. |
| Focus/context actions | “Xem rõ”; accessible/title “Xem rõ cấu trúc”; “Xem lân cận”; “Đang xem riêng cấu trúc. Bấm ‘Xem lân cận’ để thấy các phần xung quanh.” | Atomic reveal/reset clipping/opacity/isolation, reversible with Undo. Context action removes isolation. Semantic and browser regression. |
| Touch mode and gestures | “Xoay mô hình”; “Xong · Cuộn trang”; “Vuốt để cuộn trang · Bấm ‘Xoay mô hình’ để tương tác”; “Kéo để xoay · Chụm để phóng to · Bấm ‘Xong’ để cuộn”; desktop “Kéo để xoay · Cuộn để phóng to · Chọn cấu trúc để xem” | Default pan-y/pinch-zoom; explicit mode enables OrbitControls. Narrow-screen and coarse-pointer tablet browser checks. |
| Canvas accessible label | Interactive: “Mô hình giải phẫu tương tác; chọn cấu trúc, kéo để xoay”. Navigation: “Mô hình giải phẫu; vuốt để cuộn trang, dùng nút Xoay mô hình để tương tác” | Label follows enabled controls; source and DOM inspected. |
| Scene region control | “Đến vùng cơ thể” | Deliberate camera/scene navigation separated from search-only filter. |
| Translation disclosure | “Tên tiếng Việt hỗ trợ tìm kiếm trong bản xem thử; chưa được chuyên gia y khoa duyệt. Tên tiếng Anh và danh tính cấu trúc giữ theo nguồn.” | Visible within source disclosure; does not imply medical review or replace original identity. |
| Learning empty | Region “Bài học chưa xuất bản”; “Chưa có bài kiểm tra được xuất bản”; “Bạn vẫn có thể tìm hiểu cách khám phá mô hình. Bài kiểm tra sẽ xuất hiện khi nội dung được xuất bản.” | GET items=[] produces honest empty state; no fabricated quiz or results. Current mobile screenshot. |
| Learning failure | Region “Kết nối bài học”; “Chưa tải được bài học”; “Thử kết nối lại để xem những bài học hiện có.”; “Thử tải lại” | Synthetic503, retry GET, loading, then empty recovery executed; stable polite announcement and focus recovery. |
| Learning onward actions | “Về không gian khám phá”; “Xem cách sử dụng” | Links resolve to / and /gioi-thieu; help route opened successfully. |
| Production unavailable model | “Các công cụ sẽ mở khi mô hình tải thành công.”; “Bạn có thể mở thư viện kiến thức hoặc tìm hiểu cách sử dụng trong lúc mô hình chưa sẵn sàng.” | Standalone production browser smoke with null asset; removes unavailable drag instructions. |

## State coverage and data semantics

| State | Result and evidence |
| --- | --- |
| Default/action | PASSED: local desktop and mobile workflow screenshots, translated suggestions, explicit inspect/context actions. |
| Loading/pending/disabled | PASSED: existing model loading retained, new rotate/inspect disabled until ready; quiz retry enters loading before recovery. |
| Empty/no result/true zero | PASSED: no-results and quiz-empty fixtures; result count means returned entries only. Null model is unavailable, not zero anatomy. |
| Success | PASSED: gan/tim focus, context/undo, clear filters, route navigation. |
| Error/recovery | PASSED: quiz503, model503, WebGL context loss, explicit retry all exercised. |
| Offline/stale/partial | PASSED for scoped failure handling: generic fetch failure uses same recovery path; partial-chunk messaging retained and lifecycle/unit checks run. Dedicated offline/live stale-network matrix NOT_RUN. |
| Unauthorized/forbidden | PASSED for preservation: mocked401 me and existing Google sign-in regressions; changes introduce no protected writes or bypass. Real login NOT_RUN. |
| Confirmation/destructive | NOT_APPLICABLE: reversible scene controls and GET recovery only. |

Geometry part counts are source components, not numbers of clinical organs. Opacity remains a unitless percent. English/source identity remains authoritative for untranslated entries; translation is explicitly draft. No new dates, currency, aggregations, personal data or permission requests. Existing learning-review time/date/auth semantics are unchanged by this task.

## Human Interface principles

| Principle | Status | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Common-organ suggestions and clear inspect action support finding and seeing anatomy; desktop-heart screenshot. |
| Agency | PASSED | Inspect/context/Undo, explicit rotation toggle and filter recovery; browser and state regression. |
| Responsibility | PASSED | Draft translation disclosure, truthful unavailable learning/model states; no clinical publication or motion claim. |
| Familiarity | PASSED | Vietnamese organ names with source English; native web inputs and predictable navigation links. |
| Flexibility | PASSED | Vietnamese/English/normalized aliases, region/system search, separate scene navigation, touch and desktop input. |
| Simplicity | PASSED | Sixteen default suggestions, one primary reveal action, mobile panels below compact viewer; no duplicate interactive trees. |
| Craft | PASSED | 320/390/768 layout checks, 44px new touch actions, visible focus, retry focus, lifecycle/reduced-motion checks and screenshots. |
| Delight | PASSED | Smooth bounded camera easing and rotation settling; immediate results and preserved user control. This is implementation/rendered review, not a measured user-satisfaction or physical-FPS claim. |

## Platform and pattern checks

Web platform fit PASSED: in-flow mobile panels, CSS responsive composition, accessible names/states and focusable headings, native controls, no Apple-only conventions. Brand fit PASSED against existing HumanScope UI. Writing/controls, feedback, contextual help, accessibility/localization and account boundaries PASSED for scoped changes. Alerts/consequential choices NOT_APPLICABLE beyond existing model error; no new modal interruptions. RTL NOT_APPLICABLE to current Vietnamese/English locale, not claimed supported. Longer Vietnamese strings wrap in tested320px viewport; browser zoom/text-scaling matrix and speech output NOT_RUN.

## Gate decision

Product Language Gate **PASSED for scoped local web changes**. Meaning, audience fit, respectful tone, brevity, actionable states, data semantics/privacy, terminology, platform fit, eight principles and in-context verification reviewed. Accessibility result is limited to names, native semantics, focus, reduced motion and tested layouts; it is not a comprehensive accessibility audit.

Evidence: `/private/tmp/hs-ux-cleanup/browser-checks.json` (22 checks), `production-smoke.json` (4 checks), `unit-results.json` (133 tests), `desktop-heart.png`, `mobile-liver.png`, `tablet.png`, `touch-tablet.png`, `learning-error.png`, `learning-empty.png`, `production-empty.png`; current files hashed in `candidate.json`.

Fixed findings: dark-stage hover contrast, filter/scene coupling, substring search, hidden isolated selection, retry focus, undersized clear-search control, animation cleanup; details in `review-cycles.md`. Remaining owner work outside this task: medical translation review before clinical publication and physical-device/live-account acceptance before rollout. No additional owner decision is needed for the authorized local fixes.
