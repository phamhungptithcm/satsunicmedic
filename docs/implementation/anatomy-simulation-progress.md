# SIM-01 implementation progress — 2026-10-02

Overall: INCOMPLETE. This increment establishes canonical heart geometry and an honest coverage registry; it does not implement all normal functions or all diseases.

## Completed and evidence

- Shared `anatomy-model-loader.ts` verifies bounded bytes, SHA-256, mesh/source identity, foreign resources, abort and disposal for both discovery and lessons.
- Canonical lesson geometry comprises 87 source meshes (full atlas heart plus bound neighboring vessels), loaded from 8 existing discovery chunks, 7,959,640 bytes total; largest 2,315,408 bytes. Sequential load limits temporary residency, unrelated decoded chunk meshes disposed.
- Lesson view applies a documented uniform affine registration to unchanged canonical vertices/material colors; existing flow and lesion coordinates remain in their original illustration frame. Every triangle corner of all ten legacy bound parts matches canonical geometry after registration to tolerance 0.00001 illustration units.
- Whole-heart selection is retained instead of silently becoming LAD; canonical context structures have selectable source identities and truthful fallback information. Embedded return leaves discovery state intact.
- Disease registry reports 27 existing topics, 3 implemented/unreviewed, 24 not implemented. `anatomy-simulation-coverage.json` captures source links and pending mappings. A text description never counts as a simulation.

## Checks

PASSED: web and repository TypeScript; scoped ESLint; production Next webpack build. 88 tests across canonical-heart, simulation-catalog, pathophysiology-flow, pathophysiology, body-explorer-ux, full-body-load-lifecycle, medical-body-load. Tests cover canonical source set, missing mapping, real verified chunk loading, complete triangle-coordinate registration, inventory truthfulness, flow behavior and existing load/scene regressions.

Browser: direct infarction loads only /kham-pha/toan-than/asset/* (no old standalone heart request); play/pause, stage, normal comparison preserve FMA7088 selection. Spasm loads on mobile 390×844 without horizontal overflow. Stenosis forced chunk-network failure disables playback; Tải lại mô hình recovers after fault removal. Desktop screenshot `/tmp/sim-01-canonical-heart.png`, mobile `/tmp/sim-01-mobile.png`. Existing local /api/v1/me 500 and development preload warnings remain separate from simulation evidence. Clinical fidelity/physical-device/GPU performance certification NOT_RUN.

## Review cycles

Cycle 1: registration test initially compared indexed vertex count to legacy unindexed count; inspection confirmed canonical mergeVertices preserves triangles. Corrected test decoder to expand indices; all triangle corners then match, without weakening tolerance. Coverage test JSON slice initially included trailing TypeScript type; fixed extraction boundary. Runtime source aliases normalized to scenario IDs and canonical context labels added. Existing foreign-resource/hash/size guards retained. A browser failure script first used wrong retry label; rerun with actual Tải lại mô hình passed.

Cycle 2: reviewed loader ownership, abort/error cleanup, source mapping, canonical materials, all shared callers, selection, unknown capabilities, source semantics and product language. Local foundation checks PASS; complete SIM-01 acceptance remains BLOCKED by unfinished work, not certified complete. Content review: anatomy-simulation-content-review.md. This status does not mean further authorized implementation must stop.

## Remaining work, in order

1. Complete shared scene context on entry (camera, explicit visibility/opacity/cuts); return state already retained, but lesson still has separate camera/default display settings.
2. Versioned full-body physiology/disease denominator and validated anatomy links beyond the first three coronary lessons. Audience confirmed: all three levels (general, medical student, specialist); no complete list should be invented from current 27 topics.
3. Normal-function simulations beyond coronary flow; current heart does not beat/deform.
4. The remaining 24 current disease topics, each with researched mechanism specifications, appropriate geometry/capability and tests; then inventory expansion beyond 27. No generic animation substitution.
5. Independent clinical/content review; source geometry/specimen/microstructure gaps and quantitative model validation where applicable. No clinical reviewer is available in this execution.

Technical risk remains bounded but actual clinical completeness is unknown. Owner confirmed all three learning depths; no renewed approval is required. See anatomy-simulation-levels-review.md for the depth-selector increment. No new medical mechanism claims added in this increment.

## Governance and handoff limits

Stack/profiles: TypeScript 6, Next16/React19, Three/R3F; universal, TypeScript, web, frontend, resource lifecycle/performance, visual design and product-content. Intelligence refreshed once; critical source checks followed. No public API, DB, dependency, deployment, paid assets or new generated geometry. No commit/push. Existing WIP preserved; main renderer baseline under `.ai/local/sim-01/baseline/`. Rollback must use only current scoped changes.

Production readiness NOT_READY. Final whole-program implementation review BLOCKED/incomplete. Runtime CLI unavailable; report fallback. Token usage and actual/API-equivalent cost Unavailable. Memory candidates None. No overall completion percentage asserted without a scoped denominator.

## Continuation 2026-10-02: scene context and public-reference guides

Scene entry now passes an immutable discovery snapshot: registered camera position/target, explicit hiding/isolation/opacity and converted clipping planes. Anatomy and flow/lesion overlays respect visibility/cuts. An explicit reveal control restores lesson defaults without changing discovery history. Hidden/clipped geometry is excluded from click selection.

Added 11 source-linked static function guides with three explanation depths and canonical structure actions. Sources were retrieved and compared against text from NHLBI, NIDDK, NIAMS and NCI SEER. These are introductory function guides, not completed animated physiology or specialist curricula. User clarified public information/reference scope; independent clinical approval is not claimed and no legal immunity is asserted. Existing publication controls were not changed.

See anatomy-simulation-continuation-review.md and anatomy-simulation-remaining-work.md. The latter accounts for all 24 still-unimplemented existing disease simulations. Whole-program production readiness remains NOT_READY.
