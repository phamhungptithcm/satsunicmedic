# HS-ACCOUNT-IMPLEMENT-1

Plan ID/version: HS-ACCOUNT-UX-1 revision2; docs/design/account-v1/README.md implementation handoff
Repository intelligence gate status: DEGRADED — indexes stale; native bounded source inspection
Approval status: APPROVED
Approver: Workspace owner
Approval timestamp or task reference: Current chat message “approved triển khai” following the revision2 interactive account design.
Approved scope: Integrate the approved account screens into Next, session-aware navigation, profile/preferences persistence and session visibility using existing Firebase identity/Firestore. Use server validation and CSRF. Retain unavailable states for unimplemented billing/export/deletion. No Lemon calls, transactions, deployment, medical publication or destructive user deletion.
Approved paths:
- `apps/web/src/components/account*`
- `apps/web/src/app/tai-khoan/**`
- `apps/web/src/components/header.tsx`
- `apps/web/src/components/explorer.tsx`
- `apps/web/src/lib/account*`
- `apps/api/src/account.ts`
- `apps/api/src/app.ts`
- `apps/api/src/domain.ts`
- `packages/contracts/src/account.ts`
- `packages/contracts/src/index.ts`
- `tests/account*`
- `tests/api.integration.test.ts`
- `docs/implementation/account*`

Concrete implementation: new guarded /api/v1/me/account GET/PATCH, additive optional account settings on users, revision conflict detection; GET current user's bounded session summaries without cookie hashes or device/location claims; reuse /auth/session and /auth/revoke-all with recent Google token. Frontend private account layout, 8 main pages and upgrade/result/deletion subpages; shared typed client state, no fixtures in runtime; persist profile/locale timezone/motion only, notification delivery remains unavailable. Source stack Next16/React19, Nest/Firestore; no new dependency. Existing private reads/publication/auth contracts remain intact.
Risk HIGH for identity and persisted settings. Tests: schema rejects privileged/unknown fields, unauth/CSRF, cross-owner, conflict/retry, regression suite, browser routes/states/responsive. Rollback: revert additive code; optional settings do not affect prior users/auth. The validator's READY-only check conflicts with repository DEGRADED fallback; report actual limitation without weakening gate.
