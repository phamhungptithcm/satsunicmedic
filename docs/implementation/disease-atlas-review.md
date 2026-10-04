# Visual disease atlas — implementation and content review

Date: 2026-10-01. Scope: local development draft, not a published medical reference. Approval: user expansion recorded in `pathophysiology-multi-disease-plan.md`. Repository intelligence DEGRADED: stale indexes; route, contracts, loaders, consumers and tests inspected directly. Existing concurrent structure-tooltip/viewer work preserved. No dependency, session/API, database or age-model change.

## Delivered coverage

27 disease topics, 7 organ systems. Three coronary 3D teaching scenarios: existing myocardial infarction; coronary atherosclerotic narrowing; coronary spasm with recovery. The remaining 24 have a reference detail view, three-step mechanism, distinction and primary-source link. Search supports Vietnamese without accents, English and included abbreviations; filters intersect by organ system and actual simulation availability. Counts derive from the catalog. Closing/changing disease unmounts the canvas and resets timeline, quiz and selection; returning preserves search/filter context. GLB loads only after opening the simulation.

Sources researched on official NHLBI, NINDS, NIDDK and NIAMS pages; exact per-topic URLs live in `disease-catalog-data.ts`, exposed in each detail. Vietnamese paraphrases are concise, not copied source articles. No diagnosis, dose, patient-specific calculation or universal disease-coverage claim. The catalog groups some heterogeneous disease families (valve disease, arrhythmias); these are introductory topics, not complete subtype entries.

## Assets and clinical limits

Only the existing hash-verified BodyParts3D heart mesh and validated LAD/LCx centerlines are used. Yellow marker represents a hypothetical plaque location; purple represents spasm. Narrowing reduces downstream particle density symbolically, not measured flow. Spasm blocks the selected branch during its chosen phase and recovers at the recovery boundary; no clot mesh. No physical narrowing/deformation or beating heart. MI remains irreversible at its final stage. Optional event times no longer use unsafe non-null assertions. Infarction-specific 2D diagram is hidden for other mechanisms.

Pulmonary/brain inventory feasibility found candidate named artery meshes but no integrated, licensed-manifested, coordinate/centerline-verified organ binding in this delivery. Those simulations are NOT IMPLEMENTED. Do not count catalog entries as 3D-ready. Full academic acceptance remains BLOCKED pending qualified content/anatomy review and correct organ assets. No perfusion territory mapping, CFD, patient-specific physiology or age variants. No production release.

## Validation

- 54 focused tests: catalog IDs/sources/capability, diacritic search, combined filters, event boundaries, spasm recovery, unaffected branch/comparison, existing timeline/schema/geometry contracts.
- Full current Vitest suite: 106 passed / 11 files. Other work exists; this is a local current-workspace result, not a deployment certificate.
- Web and anatomy-viewer TypeScript, focused ESLint and Next production build passed.
- Chromium software WebGL: 30 checks, real canvas for all three scenarios, no eager load, switch/reset, playback, reduced motion, source link, unavailable/empty/filter states, asset abort/retry, catalog and simulation at 768/390/320 px without horizontal overflow. See `evidence/disease-atlas/hs-atlas-browser.json`.
- Production local HTML and RSC resolve to Next not-found (streamed responses can be HTTP 200); no sampled draft identifiers. Binary returns 404. Learning index has no preview link. See production guard JSON. This is not deployment evidence.
- Known nonblocking browser warnings: Three.Clock deprecation from current dependencies and software-GPU readback warning. No uncaught page errors in recorded run.
- First browser attempt interrupted by dev HMR during build. Second attempt asserted reduced-motion before its change listener ran; test changed to await the disabled state, then complete run passed. No production behavior weakened.

## Product Content Review

Audience: Vietnamese medical students exploring mechanisms. Platform: responsive browser, native buttons/selects/checkboxes and WebGL. Apple HIG is only a general human-centered reference, not an Apple platform contract. Reviewer: implementation agent, self-review (no independent or clinical reviewer).

### Content inventory

| Location | Changed content / states | Meaning and evidence |
|---|---|---|
| disease-atlas.tsx hero/search/filter | Atlas name, purpose, count labels, search label/placeholder, system labels/counts, availability filter | Counts derived from actual records; input token matching and browser result checks |
| catalog data, all 27 records | VI/EN titles, organs, summaries, all 81 mechanism steps, distinctions, source titles/URLs | Primary source URLs per record; short educational drafts, review status displayed |
| cards/results | Tra cứu vs 3D tương tác, result count, English label | Capability is non-null only for three existing scenario entries; tests enforce matching IDs |
| detail/default | Organ breadcrumb, overview, mechanism steps, distinction, source/date/scope | Selected record drives every field; no stale disease state |
| detail/unavailable | Explicit no suitable 3D; references remain usable | Stroke browser check finds zero canvases |
| detail/action | Open/close simulation, return library | Real conditional mount/unmount; filter/search preserved |
| empty | No result, try alternate name/filter, clear both | Explicit action resets query/system/capability |
| scenario data | New titles/objectives/limitations, six stages with event/mechanism/consequence, two quizzes/options/explanations, sources | Separate narrowing and spasm mechanisms; schema parse and boundary tests |
| simulation UI | Dynamic stage count/end caption, generic quiz feedback, purple vs yellow marker | Current scenario/variant drives content; no false infarction diagram |
| existing loader/controls | Loading, retry/error, paused/playing/end, comparison, reduced motion | Retained controls verified through runtime checks |

### State coverage

Default, selected, focus, loading, disabled, playback, empty, unavailable, retry/error and restored view: PASSED within browser checks. Offline/partial: aborted asset gives recoverable error while references remain; offline remote sources are not cached. Unauthorized: development boundary prevents public draft delivery, no account access added. Destructive/confirmation: NOT_APPLICABLE. External links open primary references; no user data persisted or sent by search.

### Data semantics

27 is number of topics, not all known diseases; 3 is executable simulation count, not organ count. 4D denotes time-dependent particle/event illustration on a 3D atlas, not dynamic volumetric imaging. Timeline units are playback seconds, not clinical disease duration. No numerical pressure, velocity, stenosis percentage or prognosis. Null capability means reference-only, never “healthy” or zero disease. Source check date is not medical approval date. Search and quiz exist in current client state only.

### Mandatory principles and platform checks

| Principle | Status | In-context evidence |
|---|---|---|
| Purpose | PASSED | Search, system selection and mechanism detail directly support reference lookup |
| Agency | PASSED | Explicit model open/close, back, clear filters, stage seek/pause; no autoplay |
| Responsibility | PASSED | Source, draft review status, missing 3D and modeling limits visible |
| Familiarity | PASSED | Medical Vietnamese with English synonyms; conventional search/filter/back controls |
| Flexibility | PASSED | Accent-insensitive input, organ/capability filters, keyboard/native controls and reduced motion |
| Simplicity | PASSED | Only selected detail opens; model assets loaded on demand; secondary controls retained in disclosure |
| Craft | PASSED | Consistent cards/icons/type; screenshots and 320/390/768 layouts reviewed; final focus scroll corrected |
| Delight | PASSED | Three distinct explanatory scenarios on rotatable anatomy, stage selection and comparison |

Writing/labels, feedback, contextual help, account/privacy, localization: PASSED for inspected flows. No alerts or permission prompts added. No Apple-only visual convention or copied protected design. Basic keyboard and accessible names checked; full VoiceOver/NVDA, real touch hardware and non-Chromium testing NOT_RUN. Target-platform fit, meaning/behavior, audience, tone, concision, data semantics, terminology and in-context verification: PASSED for local UI scope. Source content is academically unapproved; this is explicit and does not become clinically validated because the UI gate passes.

Product Language Gate: PASSED for draft UI. Clinical content gate: BLOCKED. Images: desktop library, mobile library, spasm detail in evidence folder; source snapshot lists exact evaluated files.

## Review cycles and remaining work

Cycle 1 found unsafe assumptions for missing plaque/tack stages, infarction diagram reuse, hardcoded stage counts and scroll-to-heading obscuring the return navigation. Fixed with optional event times, distinct variant/recovery state, conditional diagram, dynamic labels and top-of-detail focus without unexpected scroll. Regression tests and browser rerun verify affected flows.

Cycle 2: technical local implementation self-review passes scoped requirement match, loader/security boundary, typed catalog/consumer compatibility, failure/recovery/unmount, error handling, production guards and trade-off disclosure. Full request remains partial: non-coronary 3D and medical approval are outstanding. Preserve rather than remove that acceptance gap. No independent review claimed.

Quality gates: no secrets/auth/dependency/DB/infra changes; existing fixed asset URL and bounded hash loader retained. Runtime-only state, no account writes. Rollback: return route to original MI panel and stop using catalog/variant modules; no migration. Dirty/untracked workspace pre-exists and concurrent work remains. Token usage and actual cost: Unavailable. Memory candidates: None.
