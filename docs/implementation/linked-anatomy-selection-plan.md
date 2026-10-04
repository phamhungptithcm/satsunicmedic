# SELECT-01 v3 — Chọn là xem, menu trực tiếp, điều hướng tự nhiên

Status: APPROVED by workspace owner (current conversation: "approved"); implemented and locally verified. See linked-anatomy-selection-approval.md and linked-anatomy-selection-review.md. Historical design below records the reviewed scope.

## Outcome and proposed interface

The owner's screenshot and request require linked controls and immediate model feedback, without repeated reveal/focus clicks. Keep the existing web viewer and visual language.

```text
Khám phá cơ thể
[Tìm cấu trúc, ví dụ: tim                ]
Vùng cơ thể       [Ngực                 ▾]
Hệ cơ quan        [Tim mạch             ▾]

Cấu trúc trong vùng và hệ đã chọn
[Tim                              Chọn]

Đang xem: Ngực · Tim mạch
Chọn cấu trúc để xem ngay trên mô hình.
[Về toàn thân]
```

This is a proposed interaction layout, not a rendered/verified UI or a claim that the result list contains only one entry.

### Interaction contract

1. Initial view remains the whole external body, with all regions/systems available. Typing searches the current scope; it does not navigate the camera on each keystroke.
2. Selecting a region immediately frames that region and reveals its internal content. Selecting a system immediately shows the source-ID intersection of that system and region. With all regions selected, selecting a system shows that system across the body. Fit the camera to the actual displayed set.
3. Only systems with source geometry in the current region are available. Region changes preserve a compatible system; otherwise reset it to “Tất cả hệ” and announce the adjustment. Region/system changes clear the previously selected structure and reset cuts/hidden/opacity settings for the newly requested visible set, in one undoable action.
4. Clicking a structure in the list immediately reveals, isolates and frames that structure using the existing inspect helper. The whole named concept is shown, not an undisclosed partial organ. Update region to its catalog-derived primary region; preserve a compatible system, otherwise reset to all systems. Some catalog concepts belong to multiple source groups: do not invent a single medical classification or rewrite generated anatomy data to simplify the menu.
5. Replace the extra “Ẩn hệ”/“Hiện hệ” step with automatic display. Remove duplicate “Đến vùng cơ thể” control. Remove the instruction to select then press “Xem rõ”; retain optional “Xem lân cận” and secondary visibility/cut tools. Use “Đưa vào khung nhìn” if retaining a reframe button.
6. “Đang xem” and selected-state text reflect the current view, including manual hidden/surface changes. Pending selection displays “Đang tải…” until the requested geometry is available; errors/partial loads retain retry and truthful status. Never describe a failed load as an empty catalog.
7. On mobile, a structure selection brings the model into view, without forcing the tools tab. Region/system changes update the model immediately but leave focus on the selector so the user can continue choosing. Keep a nearby view status and explicit “Xem mô hình” jump when the canvas is offscreen. Respect reduced motion.
8. Undo/redo restores region, system, selection, camera and visibility together. “Về toàn thân” resets search text, region/system and scene to the initial exterior; undo restores the previous complete exploration state. Clearing only search text must not alter the scene or request new model chunks.
9. Selecting directly on visible geometry immediately highlights it and opens a compact anchored view popover with its actual source/concept label and two direct actions: “Xem riêng” (reveal/isolate/frame through the same inspection transition) and “Xem lân cận” (frame with regional context, remove isolation and ensure the target remains visible). The initial tap preserves spatial context; it must not isolate on every canvas tap. Reconcile conflicting filter labels so the UI does not describe an unrelated region/system.
10. Owner addition: a small view option at the clicked body part. Proposed default means display modes (Xem riêng / Xem lân cận); standard front/back/left/right camera controls remain available. The popover does not add a required step to list selection, which still reveals immediately. Reuse the selected annotation anchor, clamp to the canvas edges and position beside rather than over the selected part where space allows. For mobile use a compact card inside the model area when the anchor cannot fit.
11. Popover actions are real keyboard-focusable buttons with visible labels and at least 44px touch targets. Close with its labelled close button, Escape, outside tap or starting a rotation; another part replaces its target. Taps inside the popover must not fall through to ray-picking or start OrbitControls. Close on hidden/offscreen target, region/reset/activity changes, or model failure; do not leave an actionable stale target. Preserve a keyboard-accessible entry via the selected-structure controls. Return focus to the opener when applicable, otherwise a stable model/selection control. Action changes remain one undoable scene transition; opening/closing the popover itself does not create history entries.

Proposed on-model card (not rendered evidence):

```text
Tim                              [Đóng]
[Xem riêng]             [Xem lân cận]
```

### Owner addition: free navigation and shortcuts

The user requires moving to the desired area and zooming there, rather than navigation around a fixed point. This extends the same viewer scope; it is not a request to move anatomical meshes or change their spatial relationships.

| Input | Proposed behavior |
| --- | --- |
| Left click / tap | Select visible structure, highlight and open its view card. |
| Left drag | Rotate around the current viewing target; a drag must not trigger selection. |
| Right drag, or Shift + left drag | Pan in screen space: move camera and target together so any displayed area can be brought to the desired screen position. |
| Mouse wheel over active model | Zoom toward pointer position, keeping the inspected area near the pointer; never force the original body-center target. |
| Arrow keys | Pan while the model canvas has focus. |
| Shift + arrow keys | Rotate while the model canvas has focus. |
| + / − | Zoom around the current viewing target (keyboard has no pointer anchor). |
| F | Frame the selected structure; if none, frame the current visible scope. Preserve display mode rather than unexpectedly isolating it. |
| Home | Fit current visible scope to recover after panning out of view; “Về toàn thân” remains the explicit whole-body reset. |
| Escape | Dismiss view card/help and cancel temporary interaction state. |
| ? | Open concise “Cách điều khiển” help, also available as a visible button. |
| Touch in model interaction mode | One finger rotates; two fingers pan and pinch around their midpoint. Outside interaction mode preserve page scrolling and browser pinch accessibility. |

Interaction safeguards:

- Use installed OrbitControls cursor-zoom and screen-space pan capabilities. Preserve translated camera target through wheel zoom, manual rotation, resize and scene renders; refit only after an explicit region/system/structure navigation or frame action.
- Pan changes the view, not source coordinates or anatomy selection/filter state. It does not load new regions merely because the camera moves. The user can reach any area in the displayed scope; choosing another region still updates that scope.
- Keep a visible compact Xoay / Di chuyển mode choice as an alternative for users without a right mouse button or comfortable modifier keys. Show the active mode in cursor/help. Temporary Shift-pan returns to the selected mode on release, blur or cancellation.
- Scope key handlers to the focused model canvas. Do not intercept input, textarea, select, editable content, popover controls, Tab, or browser Ctrl/Cmd shortcuts. Support keyboard entry/exit without a focus trap; prevent page scrolling only for keys actually handled by the focused model. Scope context-menu suppression to the model only.
- Wheel zoom must be limited to the active model surface; preserve scrolling outside it and browser zoom gestures. Confirm installed OrbitControls handling of Ctrl-wheel/trackpad pinch before wiring interception. Do not claim identical trackpad behavior across devices without testing.
- A completed drag/wheel burst/key sequence forms one history action; camera animation writebacks must not erase the previous pose. Explicit mouse interaction cancels scripted framing. No excessive React updates or continuous idle render loop.
- Keep bounded camera distance, finite valid camera poses and a recoverable fit action. No arbitrary pan clamp that prevents inspecting peripheral anatomy. Cursor zoom on empty background may use the current target plane, without fabricating an anatomical hit.

Example acceptance journey: choose thorax → pan the heart to the preferred screen location → point at a small visible detail and zoom → rotate around the adjusted target → Home to recover the scope. None of these manual camera actions snaps back to the original body center.

## Repository intelligence brief

- HEAD: `8a749e7881f8808473a7fc88a51ff81154aadd50`; substantial existing untracked WIP. Preserve and snapshot only scoped files before approved implementation.
- Initial gate DEGRADED: stale CodeGraph and CocoIndex, CocoIndex health failed. One bounded refresh completed; subsequent gate READY with both indexes current/healthy.
- v2 recheck: indexes stale again; attempted one bounded refresh, CocoIndex CLI index failed. Continue DEGRADED with current targeted source reads and CodeGraph exploration; semantic search remained callable but is not proof of current index completeness. Verified canvas annotation currently has `pointerEvents: 'none'` and contains only `props.label`, so interactive view actions require explicit UI/callback wiring and event isolation.
- v3 recheck remains DEGRADED; reuse the failed bounded refresh result rather than retrying indexing repeatedly. Native current-source verification: installed Three.js 0.186.1 OrbitControls defaults `zoomToCursor=false`, `screenSpacePanning=true`, LEFT=ROTATE, MIDDLE=DOLLY, RIGHT=PAN and two-touch DOLLY_PAN. The full-body viewer does not enable cursor zoom or keyboard listeners; its current hints describe rotation/zoom but not pan. This supports improving existing controls rather than replacing the renderer. Physical trackpad/touch behavior remains unverified.
- CodeGraph exploration of `FullBodyAnatomy`, `searchBody`, `inspectBodyStructure` identified UI → search/inspection helpers → scene model. Graph also indexes archived `output/playwright/.../baseline` files; these are evidence snapshots, not implementation targets.
- CocoIndex found `docs/implementation/ui-ux-cleanup/review-cycles.md`: previous filter/scene coupling caused full-atlas loading and a stall. Verified that document and current renderer source. Avoid restoring that bug.
- Source verified: `full-body-anatomy.tsx` keeps query/system/searchRegion outside scene history. Select handlers only set filter state; list selection updates selected ID and only changes isolate if already isolated. Separate region control changes scene. `inspectBodyStructure` already reveals, resets occlusion/cuts and frames a selection.
- `searchBody` uses any overlapping source part for region/system membership, so compound concepts may appear in multiple groups. This is distinct from asserting that the whole named organ belongs exclusively to a system.
- Renderer `sceneSourceIds` and `requiredChunks` derive requests from scene; `FullBodyCanvas` reconciles two bounded downloads, cancels obsolete work and handles reduced-motion camera fitting. `selectionBounds` currently fits regions/concepts, not an arbitrary system intersection.
- Stack: React 19.3, Next 16.3, TypeScript 6, Three.js, pnpm 11, Vitest 5, ESLint 10 (verified manifests). Read installed Next docs before implementation. Relevant quality profiles: TypeScript/frontend, accessibility, product content, performance and existing medical/source-integrity constraints.
- No API, database, auth, medical assets, clinical-review status, production publication or new dependency change required.

## File-by-file implementation plan

| File | Changes |
| --- | --- |
| `apps/web/src/components/full-body-anatomy.tsx` | Route region/system/list/reset handlers through atomic navigation transitions; remove duplicate region/system actions; synchronized statuses and mobile navigation; reconcile canvas selection and manual display tools; provide shared inspect/nearby actions and keyboard entry for the on-model view card; add compact rotate/pan mode, control help, accurate hints and frame-scope action. |
| `apps/web/src/components/full-body-anatomy.module.css` | Compact hierarchy, status/selection treatment, accessible focus and narrow-layout support; preserve existing brand and scoped styles. |
| `apps/web/src/lib/body-explorer-ux.ts` | Add pure scope-selection and reconciliation helpers; reuse `inspectBodyStructure`; calculate exact region/system source intersections and compatibility. |
| `apps/web/src/lib/body-explorer.ts` | Share scope membership logic between list and rendered scope; preserve bilingual ranking, source identities and explicit compound-concept meaning. |
| `packages/anatomy-viewer/src/scene-history.ts` | Add backward-compatible optional navigation state to history (including query if reset is undoable); bounds helper for displayed source sets; default missing fields for existing callers/tests. Keep no-filter all-body reset exterior. |
| `packages/anatomy-viewer/src/full-body-canvas.tsx` | Fit scope views to their visible-set bounds; extend selected annotation into an accessible view card with action callbacks, viewport clamping, dismissal and pointer isolation; enable cursor zoom, explicit pan/rotate mappings, focused keyboard handling and gesture history boundaries; preserve selection framing, chunk verification, cancellation, retries and lifecycle cleanup. |
| `packages/anatomy-viewer/src/body-navigation.ts`, `tests/body-navigation.test.ts` (if extraction needed) | Small pure input/action helpers with modifier/editable-target guards and camera-navigation regression tests; keep implementation scoped to this full-body viewer. |
| `tests/body-explorer-ux.test.ts`, `tests/medical-body-scene.test.ts` | Scope intersections, incompatible resets, hidden/clipped selection recovery, atomic history, whole-body reset, multi-group concepts and empty scope behavior. |
| `tests/full-body-load-lifecycle.test.ts` | Add only necessary regressions for rapid scope changes, stale completion and bounded loading if affected by implementation. |
| `docs/implementation/linked-anatomy-selection-*` | Scoped verification, screenshot paths, completed product-content review and final review/completion record after implementation. |

## Impact and safeguards

Risk: medium, because this changes navigation, visibility and history together. Primary risks are excessive downloads, misleading multi-group labels, losing camera context, and stale async results after rapid changes. Use explicit scope transitions, exact ID sets, existing verified loading/cancellation, and a single history commit per action. Query edits never widen visible scope. All-regions/all-systems reset shows the exterior rather than loading every internal chunk. An explicitly chosen full-body system may still require several chunks; verify its requested set and loading feedback without promising instant network completion.

Smallest safe solution: reuse renderer/inspect behavior and make navigation state coherent. Merely replacing `select` with `inspect` fixes only structure clicks and leaves both dropdowns disconnected. A full renderer rewrite or reclassification of medical catalog data is unnecessary and excluded. Long-term ontology curation remains separate.

Preserve WIP, activity bindings, source IDs, hashes, provenance, review warnings, asset delivery guards, manual rotation/zoom, keyboard operation, clipping tools and error recovery. Snapshot scoped files before editing; rollback only this task's diff. No deployment or cloud operations.

## Acceptance and verification

- Desktop and mobile: region → system → structure visibly affects the real model at each step; single click on Tim reveals/framed tim without an extra action.
- Region/system list, selected item and current view agree through incompatible changes, canvas picks, manual tools, undo, redo and reset.
- Real canvas pick shows the correct source label and view card; Xem riêng and Xem lân cận target that exact selection. Verify close/Escape/outside tap/rotation, replacement, offscreen/hidden targets, model failure, keyboard path, mobile edge placement, touch targets and that card clicks cannot select geometry behind it. Undo restores the prior scene without reopening a stale card.
- Verify actual pan changes both camera position and target, retains their offset and can reach peripheral displayed anatomy. After pan, zoom/rotate/resize must not reset target. Measure cursor-anchor screen drift during zoom on off-center geometry; check distance limits and empty-background fallback. Verify interrupted framing and one undo per completed gesture. Test keyboard actions, editable fields, focus entry/exit, browser shortcut preservation, mode switching, blur/pointer cancellation, click-vs-drag, outside-canvas scroll and touch interaction mode. Record real-device trackpad/mobile gaps separately from simulated browser gestures.
- Hidden/zero-opacity/clipped selection becomes visible; new selection replaces old isolation; no-result search leaves valid model state intact.
- Search editing/clearing triggers no scene widening or extra chunk request. Region/system requests match exact required chunks. Rapid changes cannot restore an obsolete scope. Initial/reset whole body avoids loading the interior atlas.
- Test slow/missing chunks, partial failure/retry, reduced motion, tap vs drag, keyboard focus, status announcements, 200% text zoom and long English labels.
- Run focused Vitest suites, typecheck and scoped lint; then real browser desktop/mobile interactions, request inspection and screenshots. Synthetic/unit evidence does not establish actual model visibility or performance.
- Complete `.ai/templates/product-content-review.md` in context and mandatory final implementation review, fix approved findings, verify and repeat until fresh pass. No successful implementation handoff before that evidence.

## Product-language design requirements

Inventory to verify: heading, region/system labels, list heading, selected marker, scope status, immediate-view hint, reframe/nearby/reset/jump buttons, on-model card title and “Xem riêng”/“Xem lân cận”/“Đóng” labels and accessible names, “Xoay”/“Di chuyển” modes, “Cách điều khiển” help and complete mouse/keyboard/touch hints, removed multi-step instructions, compatibility adjustment announcement, no-result recovery, loading/error/partial status, accessible names and mobile tools text. Preserve left/right anatomical convention and provenance warnings.

| Principle | Planned evidence | Current status |
| --- | --- | --- |
| Purpose | Every navigation choice changes the intended model scope | NOT_RUN |
| Agency | Atomic undo/redo, reset and optional nearby/tools | NOT_RUN |
| Responsibility | Accurate source-group scope and loading/partial caveats | NOT_RUN |
| Familiarity | Native labelled selectors, consistent Vietnamese terms | NOT_RUN |
| Flexibility | Keyboard, mobile, zoom, long labels, reduced motion | NOT_RUN |
| Simplicity | One region selector; no required reveal/focus follow-up | NOT_RUN |
| Craft | List/scene/history/status agree across all applicable states | NOT_RUN |
| Delight | Immediate visible feedback without unwanted tab changes | NOT_RUN |

Target: Vietnamese web; preserve web conventions, no Apple-platform compliance claim. Product Language Gate remains BLOCKED pending implemented/rendered evidence. No new consent, authorization, destructive or persisted medical-data flow. Final runtime tests/review NOT_RUN; production readiness not asserted. Memory candidates: None. Exact token/cost accounting unavailable.

## Approval required

Approve SELECT-01 v3 for the listed navigation/UI/helpers/history/renderer-bounds/on-model-view-card/mouse-pan-cursor-zoom-keyboard/tests/docs scope. Owner additions after v1 are captured as scope refinements, not recorded as reviewed-plan approval. Existing historical approvals do not establish approval of this new reviewed plan. Repository `.ai/workflows/plan-existing-system-change.md` requires stopping after the concrete plan and explicit human approval before existing application edits.
