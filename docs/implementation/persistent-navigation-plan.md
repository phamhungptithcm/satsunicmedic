# Persistent navigation and bottom footer — NAV-01

Status: APPROVED by user message "Approved" on 2026-10-01; implementation and scoped local validation complete. Approval record: `.ai/local/nav-01-approval.md`.

## Repository intelligence brief

- Base commit: `8a749e7881f8808473a7fc88a51ff81154aadd50`; extensive existing untracked work must be preserved.
- CodeGraph current and healthy; Header query identifies page, Explorer and AccountShell consumers.
- One index refresh completed. Gate reports READY, but actual CocoIndex semantic search fails because its daemon log is outside sandbox write permissions. Effective evidence is DEGRADED for semantic retrieval; bounded source inspection used instead.
- Verified source: root layout owns Footer, while individual pages, Explorer and AccountShell each own Header. Header normally uses Next Link. Article passes `fullDocument={eligible}`, selecting native anchors for ad-eligible pages. No browser observation yet proves a document reload on ordinary links.
- Body has min-height 100dvh but no vertical flex/content-growth arrangement.
- AccountShell captures navigation inside its own wrapper to warn about unsaved edits. Moving Header outside that wrapper requires moving or registering that guard at the shared shell boundary.
- Stack: Next 16.3.8 App Router, React 19.3.0, TypeScript, pnpm, Vitest. Installed Next layout/navigation documentation is available; shared layouts preserve state across client navigation.
- Data/API: existing session status and auth-change notifications only; no API, schema, infrastructure or authorization changes proposed.

## Proposed implementation

1. `apps/web/src/app/layout.tsx` and new `apps/web/src/components/site-shell.tsx`: own one persistent Header, content region and Footer. Keep existing page main landmarks; avoid nested main elements. Loading, error and not-found content remain inside the persistent shell.
2. `apps/web/src/components/header.tsx`: integrate shared navigation/session handling, preserve active-link and mobile-menu behavior. Ordinary internal destinations use client navigation. Preserve ad-document isolation until verified safe; do not remove full-document behavior blindly.
3. Remove duplicate Header imports/rendering from app pages: `/`, `/thu-vien`, `/co-so-y-te`, `/hoc-tap`, `/gioi-thieu`, `/bai-viet/[slug]`, `/hoc-tap/sinh-ly-benh`, `/kham-pha/toan-than`, `/kham-pha/mo-hinh-tham-khao`; and components `explorer.tsx`, `account/account-shell.tsx`. Preserve page content and preview restrictions.
4. `explorer.tsx`, `account/account-shell.tsx` and shared shell: register necessary login callbacks/session updates and unsaved-change navigation guard with cleanup on unmount. Keep existing account confirmation wording and behavior. Guard navbar/footer exits as applicable, without breaking modified clicks or external links.
5. `apps/web/src/app/globals.css`, `components/footer.module.css`, and only affected shell styles in `components/pathophysiology.module.css` or account styles: vertical flex shell with growing content, keeping header offset. Footer reaches viewport bottom on short pages and follows content on long pages; it does not overlay content.
6. Add focused navigation regression coverage in `tests/site-navigation.test.ts` and browser verification script/evidence under `output/`. Record product-content review and final implementation review after approval.

## Impact and acceptance

Risk: moderate frontend lifecycle impact, especially account unsaved edits, login synchronization, 3D viewer cleanup, and ad-script isolation. No new dependency or backend changes. Shared UI can update its active state; acceptance concerns preserving mounted navbar/footer and avoiding full document navigation on normal navbar links, not forbidding all React renders.

Browser checks: retain header/footer DOM identity and a document sentinel across ordinary navbar navigation; exercise back/forward, mobile menu, active links, loading and error states; verify short/long content geometry on desktop/mobile; confirm account unsaved-change dialog and login/session refresh. Ads remain a documented isolation exception pending source/browser validation. Test browser flows with local fixtures where authentication/provider access is unavailable and label that limit.

Run focused tests, web typecheck and scoped lint; examine production build behavior if development-only routes affect evidence. Apply product-content review to unchanged labels in their changed interaction contexts, keyboard focus and skip link. Complete final review after implementation; do not claim current browser validation or production readiness from this plan.

Alternative considered: only adjust footer CSS and keep page-owned headers. Rejected because headers would continue remounting. A broader routing/auth rewrite is unnecessary.

Rollback: revert only changes made for NAV-01, retaining all existing untracked work. No deployment is included. Memory candidates: None. Token/cost accounting unavailable.

## Completion evidence

See `output/playwright/nav-01/completion.md` and owned-file manifest `output/playwright/nav-01/candidate.json`. Thirty-three browser checks and twenty-five focused regression tests passed. Build/typecheck/scoped lint passed. Browser scripts provide regression coverage instead of implementation-mirroring source tests. No deployment performed.
