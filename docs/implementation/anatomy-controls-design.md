# Anatomy controls refinement

Reading this as: an anatomy exploration workspace for learners, supporting direct manipulation with a quiet compact instrument dock grounded in the existing dark canvas, blue accent and Lucide system.

Mode: redesign. Authorization: SELECT-01 approved by the user; subsequent explicit request to redesign these buttons, make them compact and arrange them logically. This is a scoped continuation, not a framework or product change.

## Audit and concrete implementation plan
The supplied mobile screenshot has five disconnected control clusters, repeated bordered rectangles, a wide text close button and overlapping model/card space. Consolidate modes, zoom and fit into the primary dock row; standard views, history and an extra-actions disclosure into a second row. Keep label visibility, reset and help in that disclosure. Keep mobile scroll/touch toggle at the top with shorter visible text and its existing accessible meaning. Use an icon close in the selected structure card, equal view actions, and reserve the new dock footprint in camera framing and card placement. Preserve handlers, scene state, keyboard navigation, retry and source identities.

Files: full-body-anatomy.tsx, its CSS module, full-body-canvas.tsx. Risk: medium for responsive overlay hit testing and framing. Verify mobile/tablet/desktop, small width, 200% zoom, target dimensions, all existing actions, help, partial retry, keyboard and pointer/touch navigation. Source intelligence DEGRADED (stale CodeGraph/CocoIndex); current source and focused checks authoritative.

## Direction controls and visual language
Layout variance 2/10: conventional two-row tool dock. Motion 1/10: existing state transition only, reduced motion respected. Density 6/10: compact visual spacing with 44px touch targets. Use existing system fonts, 12px controls, neutral dark surfaces, pale active segment, blue primary card action, 8px internal radii and 16px outer dock. Thin translucent border only around clusters, no border around every icon. No new dependency, brand, image or animation. Existing BodyParts3D assets and licensing unchanged. No external inspiration or copied composition.

## Responsive composition and states
Mobile: dock width constrained to stage, two rows, upper scroll toggle. Tablet/desktop: same logical order and larger available model space. Wide screen inherits constrained dock width. Vietnamese expansion wraps card title; control labels retained. Native focus/keyboard semantics, title plus aria-label for icons. Disabled history/zoom, active mode/view/labels, focus, hover, loading and retry remain explicit. No new authorization, offline or stale-data behavior. Empty selection and exterior state preserve recovery and reveal. No SEO/data-meaning change, no RTL locale supported in current scope.

## Principles and approval boundary
Purpose: model remains primary. Agency: direct controls and recoverable history. Responsibility: preserve exact view/action semantics. Familiarity: conventional icons and segmented views. Flexibility: pointer, keyboard and touch remain. Simplicity: one dock with secondary disclosure. Craft: spacing, hit targets and clamped card. Delight: more unobstructed model space without extra motion.

No auth, API, model, content taxonomy, asset, deployment or dependency changes. Material expansion requires delta review; none planned. Physical-device and production acceptance remain outside this local refinement.

## Revision 2 — user rejected the first visual composition
The first two-row dock passed local hit-target checks but was explicitly rejected aesthetically by the user. Treat that cycle as rejected, not accepted design. Audit: large pale active surfaces compete with anatomy; crowded second row repeats visual hierarchy; long tiny gesture text wraps; blue-black stacked surfaces look heavier than the model.

Research: model-viewer staging/cameras (https://modelviewer.dev/examples/stagingandcameras/index.html) confirms native pan gestures and explicit recenter recovery. W3C APG toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) informs grouping and keyboard distinctions; this implementation uses ordinary native group/tab semantics, not a toolbar role with unimplemented roving tabindex. Sketchfab initialization fetch was blocked 403, not claimed as reviewed. Local awesome-design-md Figma reference is secondary aesthetic inspiration only: neutral chrome lets content carry color, no proprietary fonts/assets copied and no claim that its marketing reference describes editor behavior.

Revised direction: one 54px rail for rotate/pan, zoom, frame and secondary disclosure. Standard view becomes a native select under the breadcrumb. History, labels, reset and help share the disclosure. Active mode uses subtle tonal fill plus a short accent marker, not a bright tile. Mobile done becomes a quiet check/text action. Short contextual hint, neutral charcoal surfaces, more usable model framing. At narrow width <380 only the two mode text labels collapse; accessible names remain. Existing visible controls and all actions stay available, no dependency or product-scope expansion. Layout variance 2, motion 1, density 4. Verify the revised composition rather than reuse prior visual acceptance.
