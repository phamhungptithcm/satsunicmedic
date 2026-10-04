# SYNC-01 v1 — one anatomical base for discovery and simulation

Status: awaiting explicit approval of this concrete plan. Current request: synchronize activity/pathology models with discovery. AC-01 explicitly deferred simulation work; this is a new renderer/module boundary. No implementation changes made for SYNC-01.

## Verified intelligence and root cause

Repository gate stale initially, refreshed once. CodeGraph traced activityBinding and PathophysiologyCanvas; CocoIndex found prior source/coordinate evidence; critical facts verified in current source. HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50; extensive existing WIP must be preserved.

Discovery uses full-body catalog/chunks with FJ mesh identities and metre-scale atlas transform. PathophysiologyCanvas.loadHeart independently fetches /hoc-tap/sinh-ly-benh/asset, checks binding byte length/hash and expects ten renamed meshes. Heart binding has ten sourceId links and illustration transform [(x-25)/40,(z-1245)/40,-(y+125)/40]; discovery transform is [x,z,-y]*.001. These differ in origin, scale, mesh subset and rendering materials. activityBinding chooses first overlapping source ID, so a whole-heart selection loses group identity. DiseaseAtlas (infarction, stenosis, spasm) and embedded discovery share PathophysiologyPanel; fixing only embedded mode would leave inconsistency.

## Proposed implementation and file impact

1. Add `packages/anatomy-viewer/src/anatomy-model-loader.ts` (or equivalent shared module) by extracting discovery's verified chunk loading/identity/disposal behavior from `full-body-canvas.tsx`. Both viewers load the same canonical catalog assets; retain hashes, byte caps, abort, timeout and mapping checks. Do not create a third geometry copy.
2. Add a tested simulation-to-atlas adapter under `packages/anatomy-viewer/src/`. Match binding sourceIds to canonical source structures; convert overlay coordinates with explicit tested affine mapping (old illustration to atlas: x=.04*x+.025, y=.04*y+1.245, z=.04*z+.125). Verify against actual asset landmarks/bounds before enabling overlays. No guess from visual proximity. Keep flow/clot sizes and camera relative to atlas scale.
3. Update `pathophysiology-canvas.tsx`: use shared anatomical base (canonical heart group plus explicitly bound adjacent vessels); mapped simulation structures may receive overlays, other structures remain selectable context. Use discovery base materials/identity. Keep comparison, playback, wall opacity, selection and load-error recovery. Highlight/flow may differ only as purposeful simulation overlays. No fabricated anatomy or co-beating deformation.
4. Update `pathophysiology-panel.tsx`, `full-body-anatomy.tsx`, `body-explorer.ts`, and, if needed, `body-explorer-ux.ts`: pass source/group selection and scene context separately from scenario targets. Preserve whole-heart identity instead of first-match substitution; retain return scene, view/camera where coordinate-compatible and explicit user hide/opacity settings. Provide a reversible reveal action if visibility prevents reading the lesson, not a silent reset.
5. Update `disease-atlas.tsx` only where needed to pass canonical catalog/selection to the same simulation path. Direct learning pages and embedded simulations must use the same base. Keep qualitative 2D diagram explicitly separate and labelled schematic.
6. Add focused mapping/loader/state regression tests in `tests/`; add current product-content/final-review evidence under `docs/implementation/anatomy-model-sync*`. No direct edits to generated full-body model. Existing legacy asset route may remain for compatibility but synchronized renderer must not depend on it.

## Acceptance and regression checks

- Same source IDs, canonical mesh positions/topology and base materials across discovery and all three existing coronary scenarios; source selection has explicit mapping or unavailable state.
- Flow overlays and lesion markers align with source vessels under tested affine conversion; fail closed if mapping fails.
- Whole-heart and individual-vessel entry, switch normal/pathology, comparison, timeline/play/pause/speed/reduced-motion, pick, hide/show muscle, return and undo do not unintentionally change anatomy or lose saved scene.
- Direct DiseaseAtlas entry and discovery entry use the same rendering data; schematic mode stays clearly distinct.
- Tests for missing/mismatched source IDs, corrupt/truncated assets, abort/timeout, retry and cleanup; no weakened integrity gates.
- TypeScript, lint, relevant existing/full-body/flow suites, production web build; local browser desktop/mobile, network evidence that canonical chunks are used and old standalone heart geometry is not requested; before/after screenshots at matched cameras.

## Risks and boundaries

Risk MEDIUM: shared loader impacts discovery; scale conversion affects particles, camera and lesion placement; loading more heart structures affects GPU/memory. Load only required chunks, preserve cancellation/disposal and current chunk budgets. Extract minimal shared code; avoid unrelated renderer rewrite. Mapping source identity alone is insufficient to prove overlay alignment. Clinical accuracy remains unreviewed; this work cannot certify it.

No new physiological model, heartbeat deformation, disease catalog, backend, DB, public API schema, dependency, paid assets, deployment, commit or push. Existing contracts can remain scenario metadata; new adapter props are internal. No need to change generated assets if exact canonical geometry can be reused. If regeneration or public schema changes become necessary, return with a delta plan.

Alternative rejected: recolor the ten-mesh standalone heart or add only a disclaimer; neither establishes a common anatomical base. Long-term: reuse the same overlay/capability pattern for future organ simulations after separate validated content work.

Rollback: capture task-local baseline for each changed file before implementation; revert only SYNC-01 diff, preserving earlier work. Local implementation does not authorize production release.

Stack/profiles: current TypeScript 6, Next 16/React 19, React Three Fiber/Three.js; universal, TypeScript, web, graphics resource lifecycle/performance, product content/accessibility. Final review must pass with current evidence before local handoff. Token/cost metadata unavailable.
