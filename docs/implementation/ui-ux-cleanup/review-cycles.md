# HS-UX-CLEAN-1 review cycles

Review applies only to the scoped changes, measured against `.ai/local/ui-ux-cleanup/baseline/`, not all pre-existing untracked work. The user approved the audit's fixes. No deployment or medical publication is included.

## Cycle 1 — corrections required

Reviewed source, TypeScript, 133 focused regressions, rendered desktop/mobile and automated browser checks. Findings and corrections:

- Unknown concept could enter translation branch when two optional values were undefined: guarded the vocabulary entry, added unknown-label regression. Typecheck exposed this before handoff.
- Normalized `phổi` matched the middle of `scaphoid`/`xiphoid`: require word-boundary prefix matches, retain short-token exact matching and exact-ID aliases. Added semantic regression rather than weakening search assertions.
- Switching selection while isolated retained the previous organ: retarget isolation without moving camera, preserve history.
- Search region and displayed scene region were coupled: clearing filters could request the full interior atlas and stall inspection. Split `searchRegion` from scene navigation; explicit `Đến vùng cơ thể` retains region navigation. Selecting/focusing anatomy no longer silently changes the search filter.
- Inertial rotation decayed by frame count, extending on slow software rendering: use elapsed-time damping with a 300ms settling bound and cancellation. Do not claim hardware-independent FPS.
- Camera frames could render twice through both OrbitControls change and explicit render: remove duplicate draw when update already emits change.
- Resize/context loss could leave camera state scripted or let media-preference listeners resume work: cancel both frame handles, reset scripted state on resize, stop on context loss and guard input/preferences.
- Retry recovery removed its focused button: announce state through a stable live region and move keyboard focus to the recovered empty heading or first available quiz.
- Clear-search tap target was below the local 44px target: increased both dimensions; retained normal text scaling and focus outlines.

The first browser-script failure assumed that a search could ignore the selected region. That was a test precondition mistake; the replacement assertion explicitly exercises no-results and filter recovery. A subsequent stall exposed the real search/scene coupling noted above. A 1.6-second inertia assertion failed under slow software rendering; the source was corrected to time-bounded settling and the test now awaits actual quiescence with a timeout, retaining the zero-pending-frame assertion.

## Scope/security review

Generated catalog, mesh hashes/identities, clinical review status, development-only model delivery, API/auth/CSRF and learning-review writes remain unchanged by this task. Quiz changes only affect GET list recovery and empty presentation. Concurrent learning-review and medical-cine work preserved; quarantined cine data is not linked or presented as available. Labels are draft navigation translations, with exact English labels and source provenance retained.

## Evidence limits

IAB direct desktop/mobile interaction evidence was useful, but separate test pages sometimes stayed on the server-rendered loading state; no runtime pass was inferred from those pages. The CLI wrapper could not resolve the package registry, so browser regression uses the already installed Playwright package without a dependency change. Chromium fixture checks use local, synthetic GET responses and isolated application snapshots. Physical iOS/Android, real screen-reader speech, live user accounts and production rollout are outside this task's verified scope.

## Cycle 2 — visual hover correction

All functional checks passed, but reviewing the actual coarse-pointer tablet screenshot revealed white button text on the pale global hover background. The global button:hover:not(:disabled) selector outranked the local dark-stage rule. Added scoped higher-specificity dark-stage and primary-action hover styling; no global CSS edit. Added an actual computed foreground/background browser assertion and refreshed screenshots. Production smoke screenshot was captured during an entry transition; recapture waits for settled state and disables screenshot animations, without changing application behavior.

## Cycle 3 — current candidate

Final current-candidate checks and receipt are recorded in verification.md and runtime ledgers. Re-read the full baseline diff including search, source identities, history, lifecycle and quiz failure recovery. No additional actionable scoped finding after the hover correction. Source-only clinical review, physical devices and live accounts remain outside local acceptance.

The baseline diff also contains concurrent site-shell integration in explorer.tsx (Header replacement, auth callback/event). Those edits belong to the shared-layout task and were preserved, not implemented or attributed to this cleanup. The candidate hash includes the actual integrated file tested.
