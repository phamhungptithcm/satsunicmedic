# Product Content Review — full body navigation

## Scope

- Surface: dev home and `/kham-pha/toan-than`, full-body viewer, region list, layer/clipping controls.
- Audience: Vietnamese learners exploring anatomy. Primary job: see the whole person, choose where to go, then optionally inspect internal geometry.
- Platform: responsive web; native buttons, checkbox and range, keyboard-equivalent controls. Apple human-interface principles used only as cross-platform quality reference; no Apple platform compliance claim.
- Reviewer/date: implementation agent, 2026-09-30; source and current browser review complete; independent final review tracked separately.

## Context and evidence

Verified: BodyParts3D FJ2810 skin spans 1.719m vertically; 861 unique source elements selected across nine region concepts. Skin loads first, internals load only on request. UI does not imply that skin picking identifies an organ: it navigates to the nearest source-derived region box. Internal colors illustrative, geometry reduced; review remains unreviewed in metadata. Source provenance at `full-body-v1/inventory.json` and `conversion.json`.

Unknown: final mobile performance, assistive technology behavior and clinical accuracy. Production routes remain denied; no asset publication authorized by this implementation. Parent browser checks are separate evidence, not inferred from code.

## Content inventory

| Surface/state | Current text | Job and implemented consequence |
| --- | --- | --- |
| Heading/default | GIẢI PHẪU TƯƠNG TÁC; Cơ thể người, từ toàn cảnh đến chi tiết. | Orient whole-body exploration. |
| Region list | Vùng cơ thể; Chọn trên cơ thể hoặc trong danh sách để đến vùng bạn muốn xem. | Region buttons and skin click both change camera position and target. |
| Regions/selected | Toàn thân; Đầu; Cổ; Ngực; Bụng; Chậu; Chi trên phải/trái; Chi dưới phải/trái | Nine FMA source mappings; active button exposes aria-pressed. |
| Region note | Trái và phải theo cơ thể người. Chọn vùng chỉ thay đổi góc nhìn. | Selection does not automatically cut/hide skin. |
| Stage | Không gian mô hình toàn thân; BodyParts3D / 3D | Canvas contains real converted source geometry. |
| Loading | Đang tải mô hình toàn thân; Đang tải cấu trúc bên trong | Shared Loading component, indeterminate, no fake measured progress. |
| Error/recovery | Chưa tải được mô hình; Thử lại | Remounts renderer and repeats bounded integrity-checked load. |
| Internal error | Chưa tải được cấu trúc bên trong.; Về bề mặt cơ thể | Preserves skin; explicit return/retry through layer selection. |
| Canvas accessible label | Mô hình toàn thân; chọn vùng và dùng các nút điều khiển bên cạnh | Keyboard equivalents outside WebGL. |
| Camera control names | Điều khiển góc nhìn; Xoay trái/phải; Thu nhỏ; Phóng to; Về toàn thân | Visible icon titles match accessible names; last resets clipping/skin/full fit. |
| Gesture hint | Kéo để xoay · Cuộn để phóng to · Chọn vùng để khám phá | Matches orbit/pick interactions. |
| Detail | ĐANG XEM; selected region; Bắt đầu với toàn thân. Bạn quyết định khi nào đi sâu vào các cấu trúc bên trong. | Confirms focus and user agency. |
| Layer | Lớp hiển thị; Bề mặt; Bên trong | Optional lazy load; skin remains visible while fetching. |
| Layer caveat | Bên trong gồm các cấu trúc có trong bộ dữ liệu; màu hiển thị chỉ để minh họa. | No completeness or clinical-color claim. |
| Clipping | Cắt mô hình; Bật mặt phẳng cắt; Vị trí cắt ngang | Checkbox initially off, disabled until internal ready; native range only shown on request. |
| Clipping meaning | Ẩn phần mô hình phía trên mặt phẳng. Đây là cắt hình học, không phải ảnh CT/MRI hay lát cắt mô học. | Shader clipping hides geometry; does not synthesize filled tissue cross-sections. |
| Provenance | Nguồn mô hình; BodyParts3D · Nam trưởng thành. Hình học đã được giảm chi tiết.; copyright/license link | Source facts/attribution; no fabricated review. Clinical disclaimer remains shared footer per concurrent owner request. |
| Page metadata | Khám phá toàn thân | noindex development candidate. |

## State coverage and data semantics

Default, selected, keyboard focus and disabled states are explicit. Loading/error/retry covered above. Offline is a load failure with retry, not a false empty dataset. Partial internal failure retains skin. Unauthorized production access returns 404 before filesystem reads. No destructive operations, account writes, persistence, currency, timestamps or invented age variants. No success toast: readiness means geometry loaded/renderable, not medical approval. Positions are meters converted from source millimeters; range is relative geometric height, not a clinical measurement.

## Mandatory Human Interface Principles

| Principle | Status | Evidence / required verification |
| --- | --- | --- |
| Purpose | PASSED | Whole skin first; explicit region list rather than thorax-only default. |
| Agency | PASSED | Separate region, internal layer and clipping actions; full-body reset reverses them. |
| Responsibility | PASSED | Real source; illustrative color/reduced geometry and geometric-cut meaning; publication guards retained. |
| Familiarity | PASSED | Web buttons, checkbox, slider, region labels, rotate/zoom controls. |
| Flexibility | PASSED | Native slider keyboard 70→71 verified; 390px and320px no overflow. Source reduced-motion path reviewed; OS setting and screen reader runtime NOT TESTED. |
| Simplicity | PASSED | Optional internals/clipping secondary; skin requires no API login or published-empty manifest. |
| Craft | PASSED | Current desktop/home and390px screenshots show full head-to-feet geometry above toolbar; mobile model precedes selector. |
| Delight | PASSED | Chest/head navigation, direct body picking and rapid head→leg→wholebody transitions verified; no measured FPS claim. |

## Platform fit and pattern checks

Cross-platform web, royal-blue/neutral panels and dark model stage. No Apple-only conventions/assets. Feedback remains inline, no unsolicited alerts. No new account/permission flow. Vietnamese terminology maintained; no new translation system. RTL not a supported locale in this scoped change. Source labels are data-derived, not inferred organ identity.

## Gate results

Meaning, context, tone, terminology, data/privacy and scoped Product Language Gate: PASSED against current source and browser evidence `.ai/local/body-browser-evidence.json`. Desktop and narrow layout, user-selected region, optional clipping, native keyboard slider and reset were checked in context. Error/retry and reduced-motion are source/test evidence; physical touch, screen reader, OS reduced-motion runtime and performance benchmarks remain NOT TESTED.

## Verification

- 24 focused tests passed, including optional-load failure latch regression.
- Viewer and web typecheck plus scoped lint passed; independent reviewer reran24 tests.
- Geometry hashes, GLB header/length,861 unique source IDs and skin height checked independently.
- Browser evidence: `.ai/local/body-browser-evidence.json`; final screenshots `body-whole-final.png`, `body-mobile-final.png`, geometric cut `body-slice.png`.
- Fixed: initial toolbar-fit overlap, shared timeout abort, skip target, repeated badge, bespoke loader, automatic internal retry loop, mobile stage ordering.
- Residual: optional internals54.3MB/2.38M total triangles; mobile GPU performance unmeasured. No photoreal texture, organ-by-organ selection or medically reviewed content claim.
- Production fullbody delivery remains NOT_READY: unpublished model, development-only delivery, clinical review absent. No production rollout in this scope. Full production build NOT RUN.
