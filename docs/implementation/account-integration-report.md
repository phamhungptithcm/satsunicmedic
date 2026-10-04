# HumanScope account integration

Task: HS-ACCOUNT-IMPLEMENT-1. Owner approved implementation, then clarified integration into the existing application. Complete local implementation; no deployment or Lemon integration performed.

## Result and boundaries

The existing Next app now owns `/tai-khoan` with overview, profile, sign-in/security, preferences, plans, payment, data/privacy and help. Account and existing library/explorer share `Header`, Google `Login`, root footer, request/CSRF utilities and Firebase session identity. The prior4197 static prototype is a design reference only. Source contains no fixture profile, local-storage paid entitlement, fake receipt or client-only auth bypass.

Profile name/study role and timezone/reduced-motion settings persist through guarded GET/PATCH `/api/v1/me/account`, using the existing Nest application and Firestore users. Optimistic revision checking prevents stale writes. Real active session summaries omit tokens/digests and unverified device claims. Current logout uses existing session DELETE. All-session logout reuses recent Google verification and `/auth/revoke-all`, with truthful unavailable UI when Google verification cannot be offered.

Pro is displayed at the owner-selected **19.99 USD/year**, annual only, not yet open for purchase. Specific paid benefits, Lemon checkout/customer portal, entitlement enforcement, billing history, export and deletion remain future work. Their screens state availability honestly. This delivery is account UI and scoped persistence, not paid-product activation.

## Evidence and checks

| Check | Result | Evidence |
| --- | --- | --- |
| Next optimized build | PASSED | `apps/web/node_modules/.bin/next build --webpack`; account routes appear in build manifest |
| API/contracts typecheck | PASSED | direct repository tsc binaries, same tsconfig files |
| Changed test typecheck | PASSED | temporary config extending root, including account and API integration test files |
| Scoped ESLint | PASSED | account components/routes/helpers, shared header/explorer, account API/domain/controller registration, contracts and changed tests |
| Unit regression | PASSED | 16 files,148 tests; includes9 settings schema tests |
| API regression | PASSED | 26 tests in `tests/api.integration.test.ts`, real local Firebase Auth/Firestore emulators |
| Browser layout | PASSED | `account-evidence/browser-checks.json`,32 route-width observations across eight pages,1440/768/390/320, no horizontal overflow |
| Browser workflow | PASSED | saved profile; trim normalization disables save; UTC/motion retained after reload; draft guard on shared header; current logout/sign-in gate; Library→Account; API failure→Retry recovery |
| Full root test typecheck | FAILED outside changed scope | root `tsc --noEmit`: server-only declarations and missing JSX flag in existing coronary/disease/structure modules; web build and scoped changed tests compile |
| Repository intelligence | DEGRADED | CodeGraph/CocoIndex stale; Coco unhealthy. Bounded source/compiler/tests used, no comprehensive index claim |
| Live Google OAuth, provider revocation, production Firebase, Lemon | NOT TESTED | local emulator acceptance does not establish production readiness |

`pnpm typecheck` wrapper first attempted dependency reinstallation and aborted without TTY. No dependency purge or lockfile changes were performed; verification used installed repository binaries. Local socket tests initially failed EPERM and passed after scoped local-execution approval. These failed attempts are not represented as passing tests.

## Review cycles and corrections

Cycle1 found scope/interaction issues: account shell originally had a separate header, common-header links needed the unsaved guard, form identity needed keys when switching profile/preferences, reduced-motion selector did not match the root class, and trimmed names could leave the form incorrectly dirty. All fixed and verified by build/typecheck/browser. Save failure copy now distinguishes unconfirmed persistence from a proven failed write; inline action arrows align with their labels.

Cycle2 re-read the complete approved scope and current source. Requirement match, owner authorization, CSRF, strict schema, optimistic concurrency, bounded session queries, API error propagation, request cancellation, popup cleanup, shared navigation, product language and eight principles, rollout/rollback boundaries reviewed. No unresolved critical/high finding within the inspected account change. Local final review: PASSED. Runtime receipts and rendered report live under `.ai-agent-kit/runtime/`.

Product content evidence: `account-product-content-review.md`; complete literal text inventory: `account-evidence/content-inventory.json`. Screenshots include final overview, security, narrow pages, tablet and API error. They show synthetic emulator accounts, not customer data. Current app runs locally through4198 reverse proxy to the built Next application on4200 and same-source Nest API on4199. Temporary fixture bootstrap is outside application source, restricted to local emulators; it does not prove Google browser OAuth.

## Compatibility, quality and risk

Selected profiles: universal, TypeScript/JavaScript, web-app, visual-design, product-content, animation-motion; database and security reviews applied. Stack verified from source: Next16.3.8, React19.3.0, TS6.0.3, Nest12, Firebase Admin/Firestore, Zod, Vitest/ESLint. No dependency, public medical content, CI or infrastructure changes.

User settings/revision are optional additive fields. Existing users use defaults; no bulk migration or backfill. Existing SessionGuard/CSRF/deny-all client Firestore rules remain. Writes run in a transaction, preserve roles/generation and retry through Firestore's transaction semantics; there is no looped persistence. Session read caps101 records and marks truncation. Existing safe error/request-ID handler and private no-store headers apply, with no new private-data logs. Rollback: revert these additive application changes; legacy code ignores optional account fields. Deploy API/contracts before web routes in any separately approved release.

Residual limits: SPA browser Back may discard an unsaved form; account/shared-header links and hard unload are guarded. New users without a name are directed to profile before preferences can persist. Session list is bounded and may omit older entries. Google all-session popup is not exercised against a live provider. Screen-reader hardware, Safari/Firefox and production performance/monitoring acceptance were not run. This is not a claim of full product certification.

Production readiness: **NOT_READY**. Live auth/provider/environment validation, full repository test typecheck remediation and a separately authorized deployment remain. Widespread unrelated untracked WIP is preserved; HEAD8a749e7881f8808473a7fc88a51ff81154aadd50, no commit/push/PR created. Source hashes in `account-evidence/source-sha256.json` identify the scoped candidate independently of HEAD.

Acceptance: four local criteria complete (integrated pages/navigation; persistence/security; annual pricing/availability; scoped build/API/browser verification). Memory candidates: None. Provider token usage: Unavailable. Actual billed cost and API-equivalent estimate: Unavailable.
