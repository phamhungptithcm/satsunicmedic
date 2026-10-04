# BRAND-01 v2 — Navbar identity and SVG favicon

Status: APPROVED by workspace owner in current chat; see approval.md.

## Evidence and repository intelligence

- Gate reports READY: CodeGraph and CocoIndex health passed; both indexes current at inspection. CodeGraph query Header identifies apps/web/src/components/header.tsx and a historical output baseline; only current application source used. CocoIndex brand search identifies existing HumanScope design and integrated application documentation.
- Source: Header uses Layers3 inside .brand-icon and Human/Scope wordmark; home link accessible name is `HumanScope — trang khám phá`. Root metadata uses HumanScope and has no icons declaration. Navbar styles include a <=390px override.
- Next 16.3.8, React 19.3.0, TypeScript 6.0.3, pnpm 11.19.0. Repository map/build context files are placeholders; commands verified in manifests.
- Many existing untracked application files and modified README exist. Preserve all existing work; do not replace from Git HEAD.

## Design and scope

Use the exact product name **SatsunicMec**, as explicitly corrected by the user. This supersedes the initial HumanScope assumption. Replace the generic Layers3 badge with the custom S mark in mark.svg. Use navy Satsunic in semibold/bold and blue Mec in a lighter weight, tight but readable spacing. Navy #111c35, blue #163cff. The continuous S sits in a rounded blue field, with no fine decorative details at favicon scale. No medical certification claims or added tagline. preview.svg is a static design proxy, not a screenshot of implemented UI; typography depends on the viewing system. The name and implementation are approved by the workspace owner.

## File-by-file implementation after approval

1. apps/web/public/brand/satsunicmec-mark.svg: add the reviewed self-contained mark as the canonical navbar and favicon asset. No scripts, external resources or embedded font.
2. apps/web/src/components/header.tsx, Header: remove only the unused Layers3 import, replace the brand glyph with the local asset and explicit dimensions, keep decorative alternative text empty and set the link accessible name to `SatsunicMec — trang khám phá` and change the about-navigation label to `Về SatsunicMec`. Wrap wordmark text for scoped styling. Preserve Nav, href, close handler, login/session behavior and menu.
3. apps/web/src/app/globals.css: replace only .wordmark/.brand-icon rules and their relevant responsive overrides. Keep mark square at 36px desktop/30px narrow; keep text visible and home-link target at least 44px. Explicit wordmark class selectors prevent inherited span colors. Preserve header height, navigation breakpoints, focus treatment and layout.
4. apps/web/src/app/layout.tsx, metadata: add icons.icon pointing to /brand/satsunicmec-mark.svg with type image/svg+xml and sizes any. Verify the installed Next metadata documentation before editing. Update the root default title and title template to SatsunicMec; preserve their descriptive text, description, robots and shell.
5. docs/design/brand-v1/: record approval, content review and final implementation evidence. Do not modify footer, account branding, auth, proxy/CSP, dependencies, database, infrastructure or deployment.

## Impact, alternatives and rollback

Low-risk static visual change shared across routes using Header; risks are cramped narrow navigation, styling leakage, duplicated accessible names, incorrect asset metadata and stale cached favicon. This plan covers the requested navbar and tab identity. Other surfaces still contain HumanScope and require a separately bounded follow-up for complete product-wide naming consistency; do not claim that this scoped change completes a global rename. Use a shared public SVG instead of separate embedded copies to avoid drift. Existing same-origin image policy supports a local SVG; confirm successful serving without changing security rules. No backend/data/API/transaction impact. Rollback only this change's captured file hunks and new asset, preserving unrelated WIP. Do not deploy as part of this scope.

## Verification required after approval

- Run web typecheck and lint on changed TSX; distinguish any baseline failures.
- Render actual navbar at 320, 390, 768 and 1440px; verify no clipping, menu and login fit, 200% zoom and keyboard focus/home-link activation.
- Check root and nested routes, mobile menu close, active navigation, signed-out and signed-in states using appropriate local evidence. Retain persistent shell behavior.
- Verify actual icon link, SVG HTTP 200/image/svg+xml, no console/security failures, and tab icon in a browser. Inspect 16/24/32px on light and dark tab backgrounds. Parsing XML alone is not visual/tab verification.
- Complete product-content review for visible SatsunicMec, about-navigation label, browser title and updated accessible label across default/hover/focus/mobile/auth states. Map all eight principles; other loading/error/data strings are unchanged. Perform final-implementation-review and task completion report. Implementation and browser validation currently NOT_RUN.

## Approval request

Approve BRAND-01 v2: use SatsunicMec with the supplied S logo and revised wordmark, and integrate the shared SVG in navbar and browser metadata within the listed files. This request follows .ai/workflows/plan-existing-system-change.md: “Do not implement until explicit approval evidence exists.”
