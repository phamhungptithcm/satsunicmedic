# Product Content Review

Scope: integrated reference anatomy page and Explorer entry; Vietnamese web, adult users evaluating an anatomy reference. Reviewed September 30, 2026. Existing HumanScope design and native HTML buttons/checkboxes; no Apple-only expression.

Verified source semantics: adult male, unknown exact age, no age variants; reduced mesh; vessels/bronchi without outer lung surfaces; technical preview without medical approval. Assumption: this adult reference is useful for initial visual evaluation. Unknown: clinical accuracy and suitability for age comparison.

## Content inventory and state coverage

The complete current user-facing strings are captured in `reference-anatomy.tsx`, the canvas aria label in `reference-canvas.tsx`, and Explorer's “Mô hình tham khảo · Xem thử”; their precise source revisions are bound by `evidence/source-hashes.json`.

| Surface/state | Content and meaning | Evidence |
| --- | --- | --- |
| Entry/breadcrumb | Mô hình tham khảo · Xem thử; Khám phá; Mô hình tham khảo | Desktop/mobile navigation and return exercised |
| Heading/default | Khám phá vùng ngực; adult male source wording | Actual GLB displayed in existing app |
| Layers | Lồng ngực; Mạch và phế quản; Tim; Các lớp giải phẫu | Toggle tests and visible geometry |
| Controls | Xoay trái/phải; Phóng to; Thu nhỏ; Góc nhìn ban đầu; gesture hint | Rotation, zoom, reset and keyboard toggle exercised |
| Loading/disabled | Đang tải mô hình…; controls disabled | Observed on navigation/reload |
| Empty | Các lớp đang được ẩn. Chọn một lớp để xem lại. | All three layers unchecked in browser |
| Error/retry | Chưa mở được mô hình. Bạn có thể thử tải lại.; Thử lại | Source reviewed and handler failure tests; browser recovery NOT TESTED |
| Age | Trưởng thành; unknown exact age and missing other ages | Source metadata; no false numeric selector |
| Partial/limitations | Not medically reviewed; missing lung surface; illustrative color; reduced polygons | Rendered desktop/mobile screenshots |
| Stats/source | 404 source parts; 8,7 MiB; license and transformation attribution | Inventory and current candidate size |
| Unauthorized | Page/asset unavailable outside development | Five environment boundary cases; no auth promise |
| Destructive/confirmation | Not applicable | No persistence/destructive operation |

## Human Interface principles

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Thoracic exploration and evaluation scope clearly stated |
| Agency | PASSED | Layers, camera controls and return navigation exercised |
| Responsibility | PASSED | Unknown age, partial lungs and lack of medical approval disclosed |
| Familiarity | PASSED | Existing header, native controls, Vietnamese labels |
| Flexibility | PASSED | Desktop/mobile and keyboard checkbox action verified |
| Simplicity | PASSED | Three layers; no unsupported age choices |
| Craft | PASSED | Mobile entry fixed; 390px no overflow; current screenshots |
| Delight | PASSED | Direct manipulation without unsolicited motion or modal interruption |

## Platform and gates

Cross-platform browser target. Native link/button/checkbox semantics, focus outline, 44px buttons, polite status, text alternatives for gesture actions. No new persistent account or permission flow. Units: source mm converted to m; displayed binary MiB. Unknown age remains unknown, not zero. Model is a historical reference, not a current patient representation.

Meaning, tone, brevity, audience, terminology, platform fit and in-context visual checks: PASSED for exercised states. Accessibility/localization completeness: NOT_RUN for screen-reader speech, browser text scaling and expanded translations. Error/offline/retry in-context coverage: NOT_RUN; handler validation is not equivalent to browser recovery. Destructive alerts and RTL localization: NOT_APPLICABLE to this Vietnamese preview scope. Current evidence: `evidence/desktop.png`, `evidence/mobile.png`, source hashes and browser checks summarized in README.

Product Language Gate: **BLOCKED** pending remaining state/accessibility evidence. No claim of production or medical readiness. Exact licensing and age limits are visible; no missing evidence is represented as success.
