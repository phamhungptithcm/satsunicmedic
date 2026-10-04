# UI-PERF-01 implementation approval

Plan ID/version: UI-PERF-01, docs/implementation/ui-cache-loading-plan.md
Repository intelligence gate status: DEGRADED — stale/unavailable optional indexes; source, Git, compiler, tests and browser evidence used as explicitly permitted by AGENTS.md.
Approval status: APPROVED
Approver: Workspace owner
Approval timestamp or task reference: 2026-10-04, explicit human reply to request_user_input_async call_AlbWk0PCFpNp0S6YFstQn2M6, question item 0.
Human approval text: “Duyệt toàn bộ kế hoạch UI-PERF-01”
Approved scope: Bounded verified public-model byte cache, deduplicated download/cancellation, render coalescing, measured model loading, request/navigation pending feedback, contextual action states, regression/browser verification, product-content review and existing gated release. The referenced plan supplies the exact behavior boundary.
Required constraints: Preserve all model detail and asset hashes. No private response cache, new paid service, auth weakening, IAM/schema/public-API changes or fabricated acceptance. Existing under-15-USD budget and release evidence gates remain. Preserve unrelated WIP.
Approved paths:
- `apps/web/src/**`
- `packages/anatomy-viewer/src/**`
- `packages/api-client/src/**`
- `tests/ui-performance.test.ts`
- `scripts/ci/acceptance-browser.mjs`
- `scripts/ci/ui-performance-browser.mjs`
- `.github/workflows/acceptance-production.yml`
- `docs/implementation/ui-cache-loading-*.md`

Paths are restricted to the behavior described in the approved plan. CI changes only retain the new verification evidence; they do not relax production acceptance. The installed approval validator still requires READY while AGENTS.md expressly permits DEGRADED work. Do not mislabel index readiness or alter that validator to obtain a pass.
