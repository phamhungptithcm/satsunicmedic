# SIM-01 v1 — complete anatomy-linked physiology and pathology program

Status: APPROVED by owner reply “apporved”; see anatomy-simulation-approval.md. Supersedes SYNC-01 as the umbrella plan; SYNC-01 model synchronization remains work package 1. User expanded requirement: all normal activities and disease simulations for related body parts. This is not approval to invent clinical content, add generic animations, or claim a complete medical atlas.

## Current verified baseline

Current source disease-catalog-data.ts contains 27 disease topics in 7 groups: cardiovascular 8, respiratory 4, nervous 2, endocrine 4, renal/urinary 2, digestive 4, musculoskeletal 3. Only infarction, stenosis and spasm have simulation bindings, all coronary. Other 24 entries are text/reference content. Disease.simulation is hard-coded to these three variants; Disease.organ is free text, not a canonical anatomical relationship. There is no full-body normal-function simulation registry. Existing motion is qualitative flow/event illustration; co-beating/deformation is not implemented.

Model synchronization evidence and exact component impact: anatomy-model-sync-plan.md. Full anatomy itself has unfilled source/specimen/microstructure coverage; simulations that require absent geometry cannot be passed by relabeling a placeholder. Repository intelligence refreshed in current task and critical conclusions verified against source. WIP remains protected.

## Product acceptance contract

From an anatomical structure: Anatomy / Normal activity / Related diseases. From a disease: affected structures, primary lesion, mechanism, consequences and related organs. Both directions use canonical source identities and the same anatomical base. Preserve selection/view/visibility when appropriate and expose explicit reveal/reset controls.

Every normal-activity lesson needs purpose, participating structures, sequence/cycle, applicable input controls, visible mechanism and explanation, source/version, qualitative-vs-quantitative status, limitations and reviewer status. A part without independent movement may participate in a larger process; never give every mesh an invented animation.

Every pathology lesson needs a matched normal comparison, defined disease/subtype and mechanism, affected source structures, supported stages, localized changes and downstream relationships, sources, assumptions and review. Controls/parameters only where their meaning is supported. No unsupported clinical thresholds, treatment prediction or patient simulation. Organ-specific movement/deformation/flow/signaling are different capabilities; one color-changing template is not completion for every disease.

## Completeness ledger

Create a versioned coverage catalog independent of implemented scenes. Per row record canonical anatomy ID, region/system/specimen, process/disease ID, disease subtype, affected/related structures and relation type, evidence sources, required geometry/capability, implementation status, validation and clinical-review status. Track normal function and pathology separately. States: not inventoried, scoped, missing assets, mapping pending, research pending, implemented/unreviewed, validated, not applicable with rationale. A missing simulation remains visible as unavailable; no silent redirect to a heart lesson.

Whole-body coverage includes cardiovascular, respiratory, nervous and senses, digestive, urinary, endocrine, reproductive (appropriate male/female specimens), locomotor/muscle/bone/joint, integumentary and lymphatic/immune/hematologic processes. This list is an inventory starting point, not a verified exhaustive disease taxonomy. A versioned disease taxonomy and expert-reviewed inclusion list establish the denominator; until then complete disease coverage remains unknown. The 27 existing topics are the first delivery batch, never the definition of all diseases.

## Implementation work packages and file impact

1. SYNC-01: shared canonical asset loading and mapping; reuse existing full-body source geometry; align simulation overlays and preserve scene navigation. See exact file plan in anatomy-model-sync-plan.md.
2. Registry/data model: introduce internal simulation catalog/types in apps/web/src/lib/simulation-catalog*.ts and a versioned source/coverage directory under scripts/free-anatomy/catalog/ or docs/anatomy/. Replace the fixed simulation union in disease-catalog.ts with validated registry references. Update disease-catalog-data.ts, disease-atlas.tsx, discovery capability resolver and tests. Validate missing links, duplicates, cycles and anatomy identity. Determine whether shared contracts require changes from source first; no public API change without delta review.
3. Framework: a shared activity/pathology host using canonical scene state; separate validated capability adapters for motion, deformation, flow, conduction/signaling and process diagrams. Add modules under packages/anatomy-viewer/src/simulation/ and corresponding focused tests. Reuse timeline controls with reduced motion, pause, seek, reset, comparison, loading/error and cancellation. Do not load all systems at once.
4. Content batches: research primary authoritative sources before implementing each mechanism; create a per-lesson specification with geometry, steps, overlay/motion and acceptance evidence. First migrate existing three coronary lessons without claiming physical accuracy; then add appropriate normal-function lessons and missing simulations for the remaining existing topics, grouped by shared process. Expand the reviewed coverage ledger beyond current 27 in subsequent batches. Record genuine missing assets/expert-review blockers without substituting a generic model.
5. UX: anatomy/activity/disease context navigation in full-body-anatomy.tsx, disease-atlas.tsx and simulation host; compact icon controls and accessible explanations consistent with current user preference. Keep schematic illustrations explicitly distinct from anatomical 3D.
6. Evidence: coverage reports, semantic-link tests, source IDs/transform/landmark checks, behavior/timeline tests, source-backed content review, browser before/after and failure-path checks; per-batch final implementation review and remaining-gap report.

## Verification and risks

MEDIUM/HIGH domain/content risk, MEDIUM renderer/refactor risk. Exact risks: absent geometry, incorrect relations, misleading time/scale, clinical causality, deformation registration, load/memory, stale selection and disposal, ambiguous disease taxonomy. Fail closed on missing source/mapping/integrity; never fabricate anatomical associations or claim review from passing code tests. Clinical review needs an actual qualified reviewer and cannot be replaced by agent assertions.

Each batch: TypeScript/lint/unit/integration, web build when runtime changes, desktop/mobile/keyboard/reduced motion, seek/end/reset/compare, load failure/retry/abort, scene return and hidden layers. Coverage accepted only against frozen catalog version with independent content/clinical review. Physical validation requirements vary by capability; qualitative illustration must remain clearly labelled.

Preserve existing lessons and WIP during migration. No new backend/DB, live API changes, external messages, purchases, paid assets, dependencies, deployment, commit or push implied. No diagnostic/treatment engine. Missing licensed assets, validation evidence or professional review are explicit blockers for the affected content, not justification to claim all done. Rollback by small module/batch diffs and task-local baseline copies.

## Approval scope

Approve SIM-01 to execute shared foundation, source-backed inventory, synchronization, existing-topic migration and incremental normal/pathology implementation within these constraints. Each delivered batch reports what is actually usable, pending and unreviewed. Approval does not certify medical correctness or authorize release; material new schemas, dependencies, paid assets or unsupported clinical capabilities need a delta plan.

Success is not a larger list of names: each accepted lesson must run, correspond to its anatomy and teach its specified mechanism. No fixed completion date or exhaustive count asserted before inventory and capability assessment.

## Audience clarification — 2026-10-02

Owner explicitly selected all three audiences: general public, medical students and specialists. Implement progressive content depth on the same anatomical scene. Changing audience must preserve selection, time, play/pause, comparison and camera. General explanations precede technical detail; student mode expands mechanism/consequence/source; specialist mode requires separate reviewed content and must expose its current gap rather than presenting the same lesson as specialist-complete. The existing three lessons remain educational drafts. Inventory acceptance must track each audience separately. This clarifies approved SIM-01, not authorization for clinical claims or deployment.

Next bounded increment: add a compact depth selector in PathophysiologyPanel; reuse existing sourced event/mechanism/consequence for general/student presentation; show current limitations and an explicit missing-specialist-content state. Record per-level availability in simulation-catalog; test level metadata, scene continuity and narrow layout. No new medical assertions or dependencies.

## Production-readiness continuation — 2026-10-02

Owner explicitly requested completion through production readiness. Continue approved packages; release itself is not authorized. First close scene-entry synchronization: pass an immutable BodyScene into embedded lessons, transform camera and clipping planes into the existing canonical heart coordinate frame, preserve explicit hidden/isolate/opacity state, and apply cuts/visibility to overlays as well as anatomy. Allow an explicit lesson-view reveal/reset without mutating discovery history. Direct lessons keep existing defaults. Scope: scene helper, existing canvas/panel/discovery callers, focused tests and evidence. Risks: camera clamp/FOV mismatch, ghost flow through hidden vessels, plane-coordinate errors, accidental history mutation. Validate plane equivalence, transform invariants, visibility precedence, browser entry/reveal/return, direct lessons and load regressions. Continue inventory/content work after this technical dependency; clinical review and a signed-off denominator remain external readiness requirements.

### Public-information scope clarification
Owner requests reliable public references as the content basis and identifies the product as an information site. Treat source-checked educational content separately from independent clinical review; do not claim legal immunity, expert approval or diagnostic validity. Existing authentication/publication controls remain intact. A public-reference lesson may be labelled source-checked only after claim/source comparison; do not require a fictitious reviewer. Missing simulations/assets remain missing regardless of disclaimer.

Next content increment: source-linked normal-function guides for circulation, respiration, urine formation and digestion, attached to the existing canonical atlas selection. Each guide has short audience-specific explanation, source, limitations and selectable participating structures. These are guided anatomy explanations, not mechanical/quantitative simulations; coverage must not count them as completed animations. Source basis: NHLBI heart blood-flow/lungs and NIDDK kidneys/digestive-system public pages retrieved 2026-10-02. Files: anatomy-functions.ts, anatomy-function-guide component/CSS, discovery integration, tests. No new geometry, renderer/dependencies or unsupported thresholds.

## Continuation: usable disease lessons (2026-10-02)
Approval: existing SIM-01 plus owner request “hoàn thiện các chức năng còn lại”. In-scope increment: optional lazy canonical atlas inside disease detail, explicit source-ID context mapping, interactive manual mechanism steps and existing-content reading depths. Touches disease-atlas, new disease lesson components/data, optional embedded/initial selection props on FullBodyAnatomy, tests. No new anatomical mesh, automatic disease deformation, clinical claim, backend or release-control changes. Missing organ mapping stays unavailable. Initial selection validated through existing inspectBodyStructure; embedded viewer avoids nested main landmarks; viewer unmounts on close/topic change. Validate mapping coverage/IDs, navigation endpoints, mount/reset, mobile layout, existing simulation count, compiler/lint/build and rendered product content. This does not complete 24 missing physiological animations.
