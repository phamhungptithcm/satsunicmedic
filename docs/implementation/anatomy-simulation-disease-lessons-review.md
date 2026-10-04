# SIM-01 — disease lesson continuation, 2026-10-02

Overall request: INCOMPLETE / production NOT_READY. This increment provides manual mechanism navigation for all 27 existing topics and anatomical context for 25 topics. It does not implement the remaining 24 physiological animations. Specialist mode explicitly discloses that full specialist lessons are not authored.

## Change and scope

Approved SIM-01 continuation; current owner request completes remaining functionality. Added disease-anatomy explicit source IDs, DiseaseLesson component/CSS, optional initialStructure/embedded FullBodyAnatomy props and disease-atlas integration/layout. Existing full-body callers preserve their defaults. The initial ID must resolve to atlas source IDs; unknown IDs fall back to the original initial scene. Thyroid topics have empty mappings: thyroid cartilage/arteries are not substituted for thyroid gland. Skeletal-system and lung context is not represented as cartilage, synovium, alveoli or a lesion. The displayed caveat states this before the atlas.

The atlas loads on request, uses existing verified canonical GLB loader, and unmounts on close or topic change. Step navigation is bounded and manual with no timers. Switching reading level preserves the step; switching topic resets the component. Closing atlas restores focus. A section replaces the nested main landmark, and the repeated full-body h1 is omitted in embedded mode. No backend, dependency, auth, database, external writes or deployment changes.

## Product content review

Web/Vietnamese; general readers, students and specialists. Existing disease prose reused; no new diagnosis/treatment claims. Reading modes change disclosure depth, not clinical validity. Sample source check: https://www.nhlbi.nih.gov/health/asthma and https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones on 2026-10-02; not a fresh full medical audit of all 27 topics. English atlas terms retained where no verified Vietnamese label exists.

Inventory: “Học từng bước”, “Điều gì đang xảy ra?”, “Mức học” and existing three choices; manual-step/time caveat; numbered step buttons with complete accessible mechanism labels; status paragraph; icon buttons “Bước trước”, “Bước tiếp”, “Về bước đầu”; empty mechanism; “Điểm cần phân biệt”; incomplete-specialist/source link; “Xem [structure]”; “Chưa có cấu trúc tương ứng được xác minh trong atlas”; static-atlas caveat; loading “Đang mở atlas”; “Đóng atlas”; embedded landmark “Atlas giải phẫu”. Mechanism counts are reading steps, not measured time or completion/mastery. Open state is aria-expanded; first/last controls disabled. Missing mappings stay unavailable. No storage or private data involved.

| Principle | Result | Evidence |
|---|---|---|
| Purpose | PASSED | Topic mechanism and matching anatomy accessible in one lesson |
| Agency | PASSED | Choose any step, close atlas, return to library; focus restored |
| Responsibility | PASSED | Static/context and missing specialist/mapping limits explicit; simulation count unchanged |
| Familiarity | PASSED | Native buttons/select/links, named icons and selected step |
| Flexibility | PASSED | Keyboard controls, reduced-motion mode, 320/390 px checks; no automatic playback |
| Simplicity | PASSED | Progressive disclosure, concise controls, optional atlas |
| Craft | PASSED | Empty mapping/reset/disabled/focus/one main verified; visual layout issues corrected |
| Delight | PASSED | Close restores place and reading step; no forced motion or interrupting flow |

States: default, selected, disabled, missing mapping, atlas loaded, atlas close, topic reset verified. Existing atlas loading/error/retry controls reused; no newly implemented network layer. Empty mechanism covered by conditional source review, not rendered fixture. Offline/authorization/payment/destructive changes not applicable to this increment. Physical screen reader and touch-device acceptance NOT_RUN; no Apple-platform compliance claim.

## Review cycles and quality

Cycle 1 found narrow nested atlas, repeated h1/main risks and lesson button CSS leaking into atlas. Fixed full-width lesson layout, embedded section/no repeated h1, scoped controls. The browser focus assertion initially ran before requestAnimationFrame; rerun waited for focus and passed without relaxing the product requirement.

Cycle 2 found excessive nested padding on 320 px; embedded page padding removed. No source-mapping, prototype-key, step-bound or simulation-count regression in executed checks. Final browser rerun and build evidence recorded in `.ai/local/sim-01/disease-browser-results.json` and final review JSON.

Validation: 317 unit tests /33 files passed (including 3 new mapping/navigation tests); focused 30 tests passed; root and web TypeScript, changed-file ESLint, Next production webpack build passed. Browser checks manual navigation, levels, bronchus ready, one main, close focus, 320/390 overflow, missing thyroid, topic reset. Screenshots `.ai/local/sim-01/disease-desktop.png` and `disease-mobile-atlas.png` reviewed. Browser runs on local production build; API absent causes existing me request failure, not live-account evidence.

Profiles: TypeScript/React/Next, web, universal, product-content, visual, accessibility, memory/lifecycle; no added automatic animation. Security: fixed source IDs, no raw HTML, external references from existing catalog with noreferrer, no authority changes. Concurrency: manual local state, existing renderer cleanup. Observability: existing model statuses retained. DB/migration N/A. Rollback: restore changed components and remove new module/component imports; no data migration. WIP preserved; no commit/push.

Previous release candidate 06721fd9... does not cover this new code; its build/browser evidence is historical and must not authorize this increment's release. Full requirement remains incomplete: 24 disease animations, missing motion/microstructure/female assets, specialist curricula, and live account/restore/device gates. Token usage and cost: Unavailable. Memory candidates: None. Runtime ledger unavailable; report/JSON manual fallback.

Cycle 3: nested atlas could launch another coronary panel while the disease-level simulation remained available. Suppressed only the embedded atlas's activity entry; the primary disease simulation and the standalone explorer's original activity entry remain. This prevents duplicate simulation controls and unrelated nesting. Added browser regression for heart context plus the primary simulation entry. No new product strings.
