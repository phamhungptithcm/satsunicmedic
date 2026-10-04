# Product content review — HS-MED4D-2

Target: web responsive Vietnamese, học và giảng dạy giải phẫu; không công bố dùng chẩn đoán. Brand HunpeoLabs/Satsunic white/navy/royal blue. Native buttons, select, disclosure and range, 44px controls; no Apple-only convention. Scope current local A–D technical candidate. Evidence: parent CUA browser run on 2026-10-01 at 11:46 UTC, local Next dev port 4191; screenshots and source/tests reviewed below. This is a local content and interaction review, not clinical or production acceptance.

## String and state inventory

- Heading: “Cơ thể người, từ toàn cảnh đến chi tiết.”; “Chọn · Bộc lộ · Khám phá”. Full-body geometry is actually loaded first.
- Search: persistent accessible “Tìm cấu trúc Việt hoặc Anh”, example tim, clear query, region/system selects and “Tất cả hệ”. Results source English where not curated, count means source pieces, not independent organs. Empty state advises changing real filters. Groups may overlap.
- Results/details: “Đang chọn”, explicit selection not focus; “Tập trung”, “Cô lập”/“Hiện lân cận”, “Ẩn/Hiện cấu trúc”; source part disclosure and tied concept disclosure; opacity percentage represents renderer opacity only. No anatomical measurements or normal values.
- StructureInfo adapter: actual source-piece count, exact source URL; cavity description explicitly boundary not muscle tissue. No old thorax partial-model description reused.
- Layers: Bề mặt/Bên trong, Độ rõ da, recovery “Hiện lại các cấu trúc đã ẩn”; source colors disclosed under source details. Cắt mô hình/range only enabled for loaded interior; description says geometric clipping, not CT/MRI/histology.
- Camera: Trước/Sau/Trái/Phải relative to anatomy, Phóng to/Thu nhỏ, Hoàn tác/Làm lại, Tập trung cấu trúc, labels and Toàn thân reset; controls accessible with titles/names. Wheel/pinch are additional paths.
- Loading: skin “Đang tải mô hình toàn thân”; chunk “Đang tải các cấu trúc cần xem”. Error keeps loaded geometry, missing-chunk retry is explicit. Initial renderer failure offers remount retry. No success before asset hash and decode checks.
- Activity: “Hoạt động theo thời gian”, “Khám phá cơ chế mạch vành”, and return “Trở về cấu trúc đang xem”. Exact FJ overlap required. Explicit “minh họa định tính”, missing cardiac-contraction data; existing panel timeline content is reused unchanged. Initial source selection is new, no new physiological claim.
- Legacy reference page: clear “Mở toàn thân · Chọn từng cấu trúc và khám phá bên trong” actual link; old reference stays available.
- Source: BodyParts3D adult male, reduced geometry, non-exclusive system grouping, illustrative colors and attribution/license link.

## Current evidence

- Browser record: [.ai/local/med4d-browser-evidence.json](../../.ai/local/med4d-browser-evidence.json). Desktop and viewport-emulated 320/390px, not physical phones.
- [Whole-body interior](../../.ai/local/med4d-inner-final.png), [mobile whole body](../../.ai/local/med4d-mobile-final.png), [isolated heart](../../.ai/local/med4d-heart-final.png), [coronary activity](../../.ai/local/med4d-activity-final.png). Heart and mobile screenshots were additionally opened and visually read during this content review.
- [Focused/regression test log](../../.ai/local/med4d-implementation-tests.txt): 98 tests passed. Source checks substantiate terminology/source bindings, cavity meaning, visibility semantics, scene history and bounded loading. They do not prove browser recovery from injected faults.
- Final browser flow did not reproduce the earlier transitional HMR NaN warning. Historical Next HMR errors remain in the browser record and are not represented as a clean entire-session console.

## Eight principles

| Principle | Status within reviewed local flow | Current evidence and boundary |
|---|---|---|
| Purpose | PASSED | Initial real head-to-feet mesh, Tim group with 83 source pieces, direct source picking and LAD lesson selection were exercised. Heart screenshot shows model central, named selection and exposure controls together. Does not establish educational efficacy. |
| Agency | PASSED | Browser distinguished selection from explicit focus; isolation/hide/opacity, zoom undo and view undo/redo worked. Activity play, pause, stage seek to16 and return preserved LAD/Ngực/isolation/opacity/query. Retry wording is supported by code; browser fault recovery itself is NOT_RUN. |
| Responsibility | PASSED | Rendered activity is named a qualitative coronary mechanism, not cardiac contraction. Source-backed cavity boundary wording/default transparency and source terminology are retained. Clipping copy distinguishes geometry from CT/MRI. Published/medical-review status was not fabricated. No clinical validation claimed. |
| Familiarity | PASSED | Browser used native search/select/range/button actions, visible selected states, undo/redo and return. Opacity Home and clipping ArrowLeft behaved as native keyboard controls; accessible search name remained stable. No Apple-specific interface convention is imposed. |
| Flexibility | PASSED, bounded | At320/390px document width equaled scrollWidth; mobile screenshot shows full model and camera controls. Keyboard opacity/clipping, buttons for zoom and search were exercised. Screen-reader, physical touch and OS reduced-motion runtime are NOT_RUN; reduced-motion bypass is source evidence only. |
| Simplicity | PASSED | Empty search returns prioritized major groups rather than the initial microstructure list; no-result state and clear action were rendered. Heart screenshot keeps the selected name, focus/expose controls and source-piece disclosure together; extra source detail is disclosed rather than repeated. |
| Craft | PASSED, bounded | Exact LAD binding persisted into activity and back; finite opacity values, source count, clipping range70→69 and source selection were verified in context. Earlier list/cavity/accessible-name/zoom/mobile-framing findings were repaired and rechecked. Failure-message meaning is source/test proxy only, not rendered fault-injection evidence. |
| Delight | PASSED, bounded | The model remains the focal surface and returns to the chosen structure after the lesson instead of losing exploration. Browser screenshots show source anatomy with selected label and readable controls; camera and layer actions remained reversible. No claim of measured frame-rate, physical-device smoothness or validated physiological motion. |

## Other content dimensions and untested states

| Dimension | Evidence/status |
|---|---|
| Meaning and behavior | PASSED for exercised controls: select/focus, expose, isolate, opacity, clipping, history, activity and return. Source-only review confirms missing/error messages name the actual failed load and available explicit retry. |
| Audience/business and data semantics | PASSED for local learning-oriented language: counts are source parts, percentages opacity, source groups may overlap, English terms are retained when not curated; absent cardiac motion is absent, not zero or a simulated fact. Medical usefulness and expert correctness remain unvalidated. |
| Voice/brevity/platform | PASSED in current Vietnamese web screens: short action labels, source English for unverified translations, no forced greetings, medical guarantees, purchase or data-consent claims. |
| Loading/empty/selected states | PASSED in exercised flow and screenshots; no-result and clear behavior explicitly recorded. |
| Failure/recovery runtime | NOT_RUN: no injected network failure, invalid browser payload, WebGL loss or rendered retry interaction. Size/hash/cancellation tests and source inspection are a disclosed proxy for message meaning only. |
| Accessibility/localization | PASSED for tested keyboard range operations, named buttons, stable search name and 320/390px wrapping. NOT_RUN for screen-reader, OS reduced-motion runtime, physical-device touch and broader assistive-technology audit. |
| Privacy/auth/payments/destruction | NOT_APPLICABLE to changed flow: no new persistence, billing, patient input, authorization or destructive operation. |

## Decision

The eight principles pass for the explicitly exercised local exploration and coronary-lesson flow. Product-language review of that rendered scope is PASSED with the explicit limitations below; this must not be rendered as an unrestricted accessibility, recovery, medical or production PASS. Full release acceptance remains NOT_READY: fault recovery runtime, broader accessibility/performance checks, qualified medical review and real cardiac-cycle deformation assets are outstanding. See [asset and release gaps](medical-4d-asset-gaps.md).

Memory candidates: None. No application files changed during this final documentation pass.
