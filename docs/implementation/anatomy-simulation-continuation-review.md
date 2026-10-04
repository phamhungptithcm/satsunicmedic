# SIM-01 continuation — evidence and remaining work
Date: 2026-10-02. Overall request: INCOMPLETE / NOT_READY. Local scene synchronization and introductory function-guide increment: verified within the checks below. No deployment, push or commit.

## Scope and intelligence
Existing SIM-01 approval plus owner request to continue through production readiness. Owner clarified public-information content based on reputable public references. No clinical approval or legal immunity inferred. Existing publication, identity and release controls remain intact. CodeGraph and CocoIndex were initially stale; refreshed once, then queried and critical execution paths checked against source. TypeScript 6 / Next 16 / React 19 / Three; universal, TypeScript, web/frontend, resource lifecycle, animation-motion, visual-design and product-content profiles applied. Git HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50, extensive prior untracked WIP retained; scoped pre-edit copies in .ai/local/sim-01/scene-before.

## Implemented
- Embedded coronary scenes take a cloned BodyScene snapshot. Camera position/target register with the same atlas-to-lesson transform; FOV and control bounds preserve discovery camera context. Explicit hidden/isolate/opacity and region-relative clipping planes carry across. Direct lessons retain their existing defaults.
- Flow and lesion overlays follow source visibility and geometric cuts. Hidden/clipped meshes cannot be picked. Scene reveal uses a compact, labelled icon and restores lesson defaults without changing discovery history.
- Eleven introductory function guides are attached by exact canonical source membership: circulation, breathing, urine, digestion, nervous, skeletal, muscle, endocrine, lymphatic, reproductive and skin. Each offers three explanation depths, structure-selection actions, a primary-source link, a checked date and scope limitation.
- Guides explicitly say static atlas. They do not count as completed animated physiology, specialist curricula or the remaining 24 disease simulations. Missing female/microstructural/motion scope stays visible.

## Content inventory and source check
The complete new text inventory is AnatomyFunction fields title/general/medical/specialist/limitation/source.title/checkedAt for all eleven entries in apps/web/src/lib/anatomy-functions.ts. Exact source URLs are attached to each entry. New interface strings: Chức năng và hoạt động; Mức học and its three existing options; Các cấu trúc tham gia; Xem + canonical bodyLabel; Giải thích trên atlas tĩnh; Đối chiếu nguồn; Chưa có thẩm định độc lập; Giữ cách hiển thị từ Khám phá; Hiện mô hình bài học; Đang giữ phần ẩn, độ rõ và mặt cắt từ Khám phá; the revised unavailable-simulation/choose-structure messages. The existing coronary limitation now displays only for a coronary-linked selection.

Public primary pages retrieved 2026-10-02: NHLBI heart/blood-flow and lungs; NIDDK kidneys-how-they-work and digestive-system-how-it-works; NCI SEER anatomy nervous/skeletal/muscular/endocrine/lymphatic/reproductive; NIAMS educational skin lesson. Text is brief original Vietnamese paraphrase, without treatment recommendations, quantitative thresholds or patient interpretation. All eleven entries were read against their corresponding source; mapping names were checked in the local atlas. No independent expert review is claimed. Audience levels are introductory explanations/reference prompts, not a claim of complete specialist training.

## Product Language Gate
Target: Vietnamese cross-platform web, native details/select/button, existing colors and icon treatment. No Apple-only interaction or expression. Default guide is collapsed, general level selected. Users can open/close it, change level and select a participating structure. Unknown/unmapped selections show no unrelated guide. The unavailable animation message stays separate from guide availability. Source links open deliberately; no new account/private data request or destructive action.

| Principle | Result | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Function explanation appears beside the selected anatomy. |
| Agency | PASSED | Selectable depth/structure, reversible history and explicit lesson reveal. |
| Responsibility | PASSED | Static representation and missing motion/specimen scope disclosed per guide. |
| Familiarity | PASSED | Vietnamese labels, native select/details, existing focus icon. |
| Flexibility | PASSED | Three depths; desktop and 390px mobile; retained discovery state. |
| Simplicity | PASSED | Collapsed explanations and compact structure actions; no extra modal. |
| Craft | PASSED | Fixed label association and unrelated coronary copy; source-linked structure checks. |
| Delight | PASSED | Guide actions move directly to real anatomy; returning from lesson keeps prior view. |

Meaning, terminology, natural tone, concise content, data semantics and platform fit pass within this scope. checkedAt denotes source comparison date, not clinical validation or last source update. Default/loading/error/recovery: existing atlas loader and lesson retry retained; reveal appears only when ready. Empty/partial: missing guides or simulations remain explicit. Unauthorized/destructive states not introduced. Existing model error states are untouched. Keyboard evidence is native semantic controls/accessible snapshot and focus styles; dedicated assistive-technology and physical-touch tests NOT_RUN. Native semantics and screen-width evidence do not imply a full accessibility audit.

## Checks and evidence
- Full configured unit suite: 314 tests passed, 32 files. Integration tests are excluded by that config.
- After final renderer review: 23 focused tests passed across lesson-scene, anatomy-functions, pathophysiology-flow and canonical-heart. Checks cover half-space invariance for tilted/reversed/legacy cuts, camera vector transform, no snapshot mutation, hidden/isolate/zero opacity and exact source membership.
- Root/web TypeScript and scoped ESLint passed. Production Next webpack build passed on current source.
- Browser discovery → hidden heart → lesson: no ghost anatomy/flow; visible reveal control restores the model; return retains hidden state (hiddenPreserved:true). Screenshots /tmp/sim-01-inherited-hidden-final.png and /tmp/sim-01-inherited-revealed-final.png inspected.
- Browser lung guide → medical level → trachea: correct selection, level retained. Mobile specialist selection: no horizontal overflow; accessible snapshot names select Mức học. Images /tmp/sim-01-function-desktop.png and /tmp/sim-01-function-mobile.png inspected.
- Several browser attempts timed out around development reloads/label lookup; fixed label markup, then stable browser reruns passed. No timeout is counted as a pass.
- Existing local /api/v1/me 500 remains because the backend path is unavailable in this local run; no live authentication claim. Device GPU/FPS, screen-reader, complete end-to-end integration, real-account provider and restore evidence not produced.
- Existing release checker exits 2/NOT_READY, reporting missing recorded asset/reviewer, real-account, restore and full-product acceptance evidence. This reads existing receipts; it is not a fresh live-provider audit. Its old full-product scope was not weakened to pass public-information content.

## Review cycles
1. Scene review found inherited default vessel opacity could still use lesson transparency, hidden/clipped geometry could be picked, wall slider could ignore explicit opacity, and an empty inherited view lacked an obvious recovery action. Fixed defaults/visibility/picking/opacity handling and added visible reveal.
2. Content/visual review found static guides under a time-animation heading, unrelated coronary text on lung selection, and ambiguous select label markup. Fixed heading, scoped coronary text and separated label/select; reran browser and compiler/lint checks.
3. Re-read final source and shared callers, checked source citations, resource ownership/cancellation, plane math, defaults and explicit overrides; no additional actionable defect found in tested increment. Whole-request review remains BLOCKED by incomplete simulation/content/asset and release evidence. No final production success claimed.

## Quality and completion report
Compilation/unit/static/changed-surface architecture and local browser checks: PASSED within above boundaries. Security: no new input origin, network loader, secret, authorization, dependency or persistence change; existing verified model loader intact. New guides contain public source links and no patient data. Database/API/infra migration and operational configuration: NOT_APPLICABLE to increment. Animation: same pause/seek/reduced-motion path; no new auto-playing motion. Quantitative or clinical validation: not claimed. Rollback uses scoped files only, not a Git reset over untracked WIP.

Whole request NOT_READY: 24 existing disease simulations remain unimplemented, animated normal physiology and missing source/registration/microstructural/specimen data remain incomplete. See anatomy-simulation-remaining-work.md. Eleven system guides do not define an exhaustive denominator. Asset prerequisites are documented in medical-4d-asset-gaps.md and medical-cine-status.md; public explanatory pages do not supply the missing registered motion. No percentage claimed. Runtime ledger CLI unavailable; this report and hash-bound local review record are the fallback. Token usage, actual cost and API-equivalent cost: Unavailable. Memory candidates: None.
