# 3D/4D pathophysiology preview — implementation review

Status: **functional local preview; full approved acceptance BLOCKED; medical/public release NOT_READY**. User approved the delta plan in this chat. This report supersedes the 2D report for the new scene; it does not rewrite historical 2D evidence.

## Scope and evidence identity

Development URL: http://127.0.0.1:4191/hoc-tap/sinh-ly-benh. One myocardial-infarction scenario, ten aligned atlas meshes, LAD/LCx flow, an invented LAD occlusion, shared playback clock, orbit/zoom/picking, camera presets, wall opacity, comparison preserving camera, accessible native controls and explicit fallback/error recovery. No stroke lesson, hemodynamic solver, heartbeat deformation, clinical measurement or validated tissue territory.

Asset: BodyParts3D, 5,355,044-byte generated GLB; SHA-256 `6438ad759f81fdbc05c5910a1f4b7970bc193633695bff16c1b1e7928e5c2784`. Source OBJ hashes, pinned mirror revision, official license and changes are in `apps/web/preview-assets/heart/README.md` and source manifest. No new dependency, paid call, database mutation, deployment, commit or push.

Repository intelligence: **DEGRADED**. Indexes stale; bounded refresh attempted, CocoIndex daemon log permission failed. Source/compiler/browser evidence used; no full indexed impact claim. Base commit `8a749e7881f8808473a7fc88a51ff81154aadd50`; mostly untracked pre-existing workspace WIP, preserved. New API/database changes appeared during this work (22:11–22:12 file modification times), outside this delta; no edits were made to them.

## Review cycles and findings

1. BLOCKED: camera tuple spread TS2556, React synchronous-unmount warning from Drei HTML overlay, particles of radius .019 exceeded narrow distal-vessel clearance, loader had no deadline. Fixed with explicit camera coordinates, external native selection label, radius .006 after triangle-clearance checks, abortable 15-second deadline and retry. Verified by focused typechecks, browser console, geometric verifier and injected failure/timeout tests.
2. Current review: technical preview checks below pass, but **BLOCKED against full plan**. `territory: null` prevents anatomy-specific injury visualization; no qualified medical review is available. The UI states that no ischemic tissue region is painted and that the lesion location is hypothetical. This is not resolved by unit tests. Clinical content, centerline simplification and perfusion mapping require specialist validation before academic/public use.

Test-harness findings were separated from product defects: exact screenshot hash initially compared changed overlay text, then residual orbit damping; camera preservation now compares only the model image with <0.1% changed-channel tolerance after settling. Resetting the camera would change a much larger region. A first coordinate scan missed the thin vessel; the wider screen-coordinate scan selected **RCA** through real raycast. Production RSC is streamed HTTP 200 with `NEXT_HTTP_ERROR_FALLBACK;404`, not an HTTP 404 response; HTML and GLB requests return 404. Reports preserve this distinction.

Reviewed dimensions: requirement match, additive package/contracts compatibility, security/privacy, bounded loader and integrity, cancellation/disposal, unavailable WebGL, retry, timeline determinism, branch isolation, clinical meaning, product language, production boundary and trade-offs. Self-review, not independent or specialist review.

## Current quality gates

| Gate | Evidence / result | Limits |
|---|---|---|
| Unit/regression | `pnpm test`: 77 passed / 7 files at verification snapshot | Concurrent workspace changes can change later suite totals |
| Geometry | `node apps/web/preview-assets/heart/verify.mjs`: 2,112 rays per vessel, zero outside; nearest triangle clearance LAD .00698, LCx .01597; particle radius .006 | Sampled geometric containment, not continuous proof or physiology validation |
| Focused types/lint | Viewer and web typecheck; `pnpm lint` passed | Whole-workspace typecheck later failed in unrelated API Database consumers; earlier full pass is not claimed current |
| Build | Final `pnpm --filter @hs/web build` passed after timeout fix | Local build, not deployed infrastructure |
| Browser | 17 checks in `evidence/pathophysiology-3d/hs-3d-browser-report.json` | Chromium headless SwiftShader; one expected ERR_FAILED from injected network abort; no uncaught page error |
| Additional browser | `hs-3d-extra.json`: hidden-tab event, no auto-resume, wrong/right quiz, repeated remount, timeout/retry | Synthetic visibility, not actual OS tab suspension; heap samples not leak certification |
| Production boundary | `hs-3d-production.json`: HTML/GLB 404, RSC not-found digest and no draft payload, no learning-page preview link | Local production server only; production metadata still contains preview page title |
| Product language | Review below; current string inventory and screenshots | Technical-preview meaning only; educational efficacy not studied |
| Medical mapping/review | **BLOCKED** | Requires validated tissue-perfusion mapping and qualified review |
| Physical devices/AT | NOT_RUN | No Safari/Firefox, real GPU/mobile, VoiceOver/NVDA or live accessibility certification |
| API/DB/deploy | NOT_APPLICABLE to this delta | No claims about unrelated modules |

In the 60-frame headless SwiftShader sample, mean requestAnimationFrame interval was 56.0 ms (about 18 callbacks/second), maximum 74.9 ms. This is not a physical-GPU benchmark and smooth 60 fps is not claimed. After three remounts and forced GC, sampled JS heap was 30.75 MB before / 30.34 MB after; this is not a leak certification. Hung-load error appeared after 16.46 seconds including navigation and allowed retry.

Browser checks cover animated model pixels, pause stability, camera presets/orbit, baseline comparison without camera reset, direct RCA picking, stage seek, occlusion visual change, no-territory disclosure, end clamping, keyboard opacity, WebGL context-loss retry, no horizontal overflow at 768/390/320px, reduced motion, search unmount/remount, network failure and malformed binary recovery. Screenshots: `desktop.png`, `occlusion.png`, `mobile.png`. These are real rendered atlas meshes, not generated illustrations.

## Product content review

Scope: Vietnamese desktop/touch web for medical students; the current goal is reviewable interaction, not certified teaching. Uses project typography/colors and native web controls. Apple HIG is a human-centered reference, not an Apple-platform contract; no Apple expression copied. Reviewer: Codex. Facts are source/browser-bound; pedagogy and clinical accuracy remain unreviewed.

### Inventory and states

`evidence/pathophysiology-3d/content-inventory.json` inventories every TS/TSX text occurrence in panel, draft and canvas plus binding labels; includes identifiers so literals are not silently dropped. Grouped user-facing changes:

| Surface | Text/state | Meaning verified in context |
|---|---|---|
| Heading/lesson | 3D/4D, Theo dòng máu…, Tim 3D tương tác | Real orbitable mesh and temporal flow; no claim of heartbeat animation |
| View actions | Xem dòng chảy / Dừng dòng chảy; front/back/left/right; opacity | Native controls operate scene; disabled during loading/error, reduced motion and end |
| Comparison | Xem bình thường cùng góc nhìn / Trở lại kịch bản bệnh | Same scene/camera/selection, only educational flow/lesion state changes |
| Viewer status | Loading, unavailable, Tải lại mô hình | Asset/WebGL fail visibly, retry remounts; no fallback marked as 3D success |
| Legend/help | Drag, zoom, select; bright particles; hypothetical lesion | Qualitative symbols and synthetic location explicitly identified |
| Anatomy | Ten structure labels, current selection | Exact names from binding; native select alternative to thin-mesh picking |
| Flow/explanation | LAD stops, LCx remains; no tissue map | Agrees with actual scene; no arbitrary ischemic region colored |
| Sources | Atlas attribution, edits, no medical review, meaning of 4D | Provenance and no-clinical-endorsement distinction visible |
| Existing supporting UI | Search, stages, quiz, 2D details, source links | Retained; quiz now names the illustrated LAD scenario; 2D is collapsed supporting material |

State coverage: default/action/selected, loading/disabled, empty search/recovery, quiz feedback, errors/retry, partial content/no territory, reduced motion/end and production-not-found verified. Offline before load takes the error path; after load scene has no additional remote dependency. No destructive/financial confirmation (N/A). No account write, history persistence or clinical result saved.

Data semantics: clock is illustrative progress, not disease time; speed changes animation only. Particle positions are estimated source-mesh centerlines; dimensions/speed/count are symbols. Time clamps at 32 rather than looping back to healthy. Null territory is unavailable, never zero injury. Medical facts remain sourced draft revision 2. Search/quiz stay in React memory. Loader uses fixed local URL, exact byte bound and SHA-256; binary is outside public and development guarded.

### Human Interface principles

| Principle | Technical preview result | In-context evidence |
|---|---|---|
| Purpose | PASSED | Main model and immediate flow button focus on coronary mechanism |
| Agency | PASSED | Play/pause/seek/reset/presets/opacity; no autoplay; reduced-motion stages |
| Responsibility | PASSED | Draft warning, no territory claim, explicit symbols and production gate |
| Familiarity | PASSED | Native button/select/range/details; familiar anatomical names with abbreviations |
| Flexibility | PASSED | Mouse orbit, touch controls, native keyboard alternatives, 320–1440px layouts |
| Simplicity | PASSED | One scene; secondary 2D/source content collapsed; no invented lesson inventory |
| Craft | PASSED | Loading/failure/retry/end states tested; mobile wraps without overflow |
| Delight | PASSED | Direct exploration and reversible comparison; retry and quiz feedback preserve agency |

Platform fit, meaning/behavior, audience/tone, concision, state coverage, terminology, data/privacy and in-context verification: PASSED for this preview. Writing/help/feedback/privacy/inclusion patterns checked; native disabled/current/pressed states used. Keyboard and readable HTML alternatives are present; real assistive technology is NOT_RUN. Vietnamese text expansion checked in mobile screenshots; unsupported locales/RTL are not claimed. **Product Language Gate PASSED for truthful technical-preview wording; academic content validation BLOCKED.**

## Remaining acceptance and handoff

Missing: reviewed coronary-to-myocardial territory binding, injury visualization based on that binding, specialist review of anatomy labels/flow simplification/medical narrative, physical-device performance and accessibility validation. A qualified anatomy/cardiology reviewer and approved territory dataset are the specific inputs needed for the academic acceptance gate. No further implementation approval is requested for the already approved local scene.

Rollback: remove preview route/link and the new package subpath; no user data or migration to reverse. Local development server remains available for inspection. No public publication or deploy occurred.

Task ledger: `HS-PATHO-3D`; rendered report: `pathophysiology-3d-task-report.txt`. The runtime marks production target NOT_APPLICABLE because this is local-only; this does not supersede the explicit academic/public NOT_READY decision above. Its default team metadata does not represent an independent review; this task used self-review only. Progress: 75% (three of four criteria verified), two review cycles, one academic criterion BLOCKED. Token usage, API-equivalent estimate and actual billed cost: **Unavailable**. Memory candidates: **None**.
