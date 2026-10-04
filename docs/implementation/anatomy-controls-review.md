# Anatomy controls — final implementation and visual review

## Scope, authorization and intelligence
Continuation of user-approved SELECT-01; explicit button redesign request and later rejection of the initial aesthetic. Three changed application files only: FullBodyAnatomy TSX/CSS and FullBodyCanvas. Baseline captured before refinement under .ai/local/select-01-controls/baseline. Preserve other untracked/dirty work. Source HEAD recorded in source-hashes.json. CodeGraph/CocoIndex stale/unhealthy: DEGRADED, current-source/diff/test evidence used. No index-completeness claim.

## Review cycles and findings
1. First two-row revision: REJECTED visually by user. Bulky pale active tiles, excessive control height and repeated chrome. Not successful aesthetic acceptance despite passing hit-target checks.
2. Research-led single-rail revision: source review found narrow rail width overflow, help-dismiss focus loss and hint text assuming rotation when pan was active. Fixed explicit compact mode sizing/narrow icon treatment, focus restoration and dynamic gesture text. Initial Next screenshot caught loader only; strengthened smoke check to await the actual canvas and disabled-state recovery before accepting it. Test instrumentation lost its read-only state probe on HMR; each dependent script now initializes it independently. None treated as an application error or hidden pass.
3. Fresh scoped source/diff re-review after fixes: PASSED within local UI scope, subject to current runtime receipt. No material out-of-scope behavior or new dependency. Reviewer is the implementing agent re-reviewing independently in a new cycle; no independent human/subagent approval claimed.

## Visual direction and research
See anatomy-controls-design.md revision 2 and its primary source links. Mode: redesign. Existing dark 3D workspace, Vietnamese learning controls, actual anatomy remains focal content. Local Figma reference informed only neutral chrome/content-color separation; no proprietary assets/fonts copied. model-viewer supports native navigation/recentering reasoning. W3C informed native grouping semantics. Sketchfab fetch unavailable, not counted as reviewed evidence.

## Evidence
| Evidence | Class | Scope and limits |
| --- | --- | --- |
| next-route-result.txt, next-mobile.png | Browser-measured, screenshot-observed | Actual local Next page 4185: canvas loaded, heart selection, manipulation and fit, HTTP200, no pageerror |
| stage-320/390/768/1440.png, layout-check-result.txt | Browser-measured, screenshot-observed | All visible controls inside stage, dock >=44px, view select, labels and menu Escape; local real-component harness |
| mobile-check-result.txt, mobile.png, zoom-200.png | Browser-measured | Card hit targets/containment, Escape focus, emulated touch, 200% zoom |
| browser-check-result.txt | Browser-measured | Pointer pan, cursor zoom, focused shortcuts, filters, history and source scope |
| actions-check-result.txt, nearby-check-result.txt | Browser-measured | History redo, zoom buttons, focus recovery, direct nearby action, pan selection stability |
| failure-check-result.txt, load-error.png | Browser-measured | Deliberately failed chunks, retry, rapid selection and keyboard undo |
| type/lint/unit logs | Compiler/test-verified | Web/viewer typecheck, scoped lint, 81 focused unit tests |
| Source diff + source-hashes.json | Repository-verified | Three scoped source files; not whole dirty workspace certification |

## System consistency
System font, 11–12px control typography, neutral graphite chrome, subtle blue active marker and existing blue direct-action button. One rail ~56px high replaces the two-row cluster. Native view selector near breadcrumb; history/reset/help in a disclosure. Consistent Lucide icons and inline close SVG in dependency-free viewer. Thin group borders, 8px button radii, 13px rail; no extra animation, font, network library or model assets. At <380px the two mode text labels collapse, while accessible names and touch targets remain.

## Interaction and state coverage
Buttons retain handlers and disabled states; mode choice also enables touch interaction. View select commits camera/view history. Native details responds to pointer, Enter and Tab, closes after actions, on focus departure or Escape; focus returns to summary. Help dismiss restores summary focus; canvas Escape retains canvas focus. Card remains clamped above reserved rail and below header. Reduced motion retains existing camera behavior and no new motion was added. Error/retry remains above controls. Offline, account permissions and production failures are unchanged and not newly certified.

## Quality gates and readiness
Scoped TypeScript, lint, unit tests, browser regression, visual review and product language review PASSED. Current product-content evidence is in anatomy-controls-content-review.md. No secrets, persistence, auth, medical identities, source hash verification or dependency boundaries changed. Error/cancellation/disposal paths preserved by source diff. The final source has no known unresolved issue within executed checks; this is not an assertion of global correctness.

Production: NOT_READY / not deployed or release-certified. Local Next smoke now works, unlike the earlier SELECT-01 compilation limitation. Full production build, whole-workspace acceptance, activity lesson, physical touch/trackpad devices and spoken screen readers NOT TESTED this refinement. Harness console contains expected injected network failures, a missing harness favicon and the corrected HMR test-probe exception; Next smoke has no pageerror. Existing source geometry and large-model performance are unchanged.

## Trade-offs and completion
Primary actions stay one tap. Standard views/history now require a disclosure/select step in exchange for much less permanent chrome; keyboard and gesture access remains. No visual design is claimed user-approved after the user's rejection: the revised implementation is offered for visual judgment. Narrow icon-only mode labels depend on familiar icons plus accessible names/titles; broader novice usability study is not performed.

Acceptance: compact hierarchy, all actions preserved, responsive non-overlap and measured targets, natural manipulation, truthful local verification complete. Exact assertion counts/check receipts are recorded alongside source hashes. Git remains dirty/untracked from existing work, no commit/push/deploy. Rollback only the scoped three-file delta using captured baseline. Token usage and billed cost: Unavailable. Memory candidates: None.
