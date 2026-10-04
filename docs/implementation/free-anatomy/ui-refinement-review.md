# UI refinement review — 2026-09-30

Decision: PASSED for the current, explicitly requested UI refinement only. The original multi-age/clinical/release review remains BLOCKED; production remains NOT_READY. This review does not supersede those limits.

## Scope and authorization

Current user requested compact icon-led interaction integrated with the model, better visuals, within the existing app. See ui-refinement-plan.md. Only three scoped files changed. No new dependency, asset, API, publication gate, authentication or persistence change. Source hashes: evidence/refined-source-hashes.json. Other sessions' changes preserved.

## Review cycles

1. Reviewed composition and current behavior. Found the initial tighter camera framing let bottom ribs approach the layer dock on mobile. Corrected framing to reserve overlay space; rechecked at 390px. Retained icon accessible names, keyboard operability, native pressed state and visible medical preview notice. All actions remain direct user initiated, with no continuous animation.
2. Reviewed final component, CSS and renderer and verified current browser state. No new blocking defect found in the scoped visual changes. Existing unverified age/clinical and browser failure-recovery evidence remains outside this refinement and prevents release acceptance.

## Checks

- Local tsc --noEmit for apps/web and packages/anatomy-viewer: PASSED.
- Scoped ESLint: PASSED.
- Vitest tests/reference-anatomy.test.ts: 9 PASSED.
- Browser: loading and disabled controls observed; ready model rendered; layer selection, all-hidden feedback, keyboard Space toggling, all five camera actions with Enter, native details expanded and collapsed: PASSED.
- Narrow viewport: document width and scroll width both 390. Desktop 1280x900 and mobile390x844 rendered evidence: refined-desktop.png and refined-mobile.png.
- pnpm wrapper attempted automatic module maintenance and refused without TTY. No purge was authorized. Existing local executables ran successfully instead.
- Repository intelligence DEGRADED; live gate still reports stale indexes and CocoIndex daemon.log permission failure. Bounded current source used. No complete-index claim.
- Runtime ledger CLI previously unavailable; manual report only, no runtime receipt claimed.

## Product language review

Inventory: existing page title and breadcrumb preserved; compact preview badge; adult male metadata; icon controls Xoay trái / Xoay phải / Phóng to / Thu nhỏ / Góc nhìn ban đầu; layer names Lồng ngực / Mạch và phế quản / Tim; gesture hint; visible unreviewed notice; native details label Thông tin mô hình and existing age/source/fidelity limitations. Loading, error/retry and all-hidden strings retain their previous meaning. Source attribution preserved. No exact age or full lung surface implied.

| Principle | Result | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Model receives main canvas space; actions remain adjacent |
| Agency | PASSED | Direct camera/layer controls, reset and return |
| Responsibility | PASSED | Unreviewed notice visible; source limits in details; no publication change |
| Familiarity | PASSED | Existing HumanScope palette/header and standard icons, native buttons/details |
| Flexibility | PASSED | Keyboard actions and mobile/desktop layouts verified |
| Simplicity | PASSED | Five compact icon actions and three labeled layer chips |
| Craft | PASSED | Narrow layout no overflow, 44px action targets, focus outlines, tooltip names |
| Delight | PASSED | Model-centered composition, soft background, clear depth without automatic motion |

Target: Vietnamese cross-platform web. No Apple-only control or expression. Labels remain present in accessible names; pressed state carries selection beyond color (desktop also shows checkmarks). Tooltip on hover/focus; touch actions use conventional icons. Details disclose unknown age and missing lung surface without inventing capabilities. No destructive or account states added. Meaning/tone/conciseness/data semantics/platform fit: PASSED for changed surface. In-context accessibility evidence is DOM names/states plus keyboard; actual screen-reader speech, extreme text scaling, offline/retry and WebGL-loss simulation were not repeated and are not claimed. Existing error and loading paths retained. No UI-state guarantee beyond observed checks.

## Engineering review

Stack: existing Next/React/TypeScript, Three.js and Lucide. Profiles: universal, TypeScript/JavaScript, web-app, visual-design, product-content, animation-motion, memory. Three resources and event-driven rendering retained. Pixel ratio capped at2 for sharper edges; this can increase GPU cost compared with1.5, and physical low-end-device performance is unmeasured. Lighting only changes presentation, not mesh geometry or clinical fidelity. Rollback: restore these three scoped files from their previous snapshot, preserving concurrent changes elsewhere. No database migration, network provider or deployment needed. Existing production denial and hash tests pass.

Completion: requested UI refinement implemented and checked; anatomical detail and age variants unchanged. Full production readiness NOT_READY. Shared worktree dirty from concurrent work; no commit/push/deploy. Token usage and actual billed cost: Unavailable. No paid provider used. Memory candidates: None.
