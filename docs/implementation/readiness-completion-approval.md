# End-to-end readiness completion

Plan ID/version: HS-READINESS-20261001 v1
Repository intelligence gate status: DEGRADED
Approval status: APPROVED
Approver: Workspace owner
Approval timestamp or task reference: User follow-up on review: “hãy hoàn thành end to end nhưng phàn còn thiếu này”
Approved scope: Implement the completion plan in production-readiness-review-2026-10-01.md. Begin with release evidence, pagination, learning queries and account/browser acceptance; prepare remaining provider/data/source-dependent work. Existing WIP is preserved.
Constraints: No destructive production operation, patient data publication, clinical approval bypass or live payment activation. Retention and Pro/community choices requested separately because missing business decisions affect implementation. Deployment stays a separate step after a reviewable verified candidate exists. No application rollback or unrelated refactoring.

Approved paths:
- `apps/api/src/**`
- `apps/web/src/components/explorer.tsx`
- `apps/web/src/components/learning-reviews.tsx`
- `apps/web/src/components/account/**`
- `apps/web/src/components/login.tsx`
- `apps/web/src/lib/account.ts`
- `apps/web/src/lib/personal-export.ts`
- `packages/contracts/src/**`
- `packages/api-client/src/index.ts`
- `tests/**`
- `scripts/**`
- `infra/firebase/firestore.indexes.json`
- `infra/firebase/README.md`
- `.github/workflows/verify.yml`
- `docs/implementation/**`

Intelligence note: CodeGraph healthy/current; CocoIndex stale/unhealthy after prior refresh. Repository gate and top-level instructions expressly permit bounded native evidence in DEGRADED. The installed approval validator still hardcodes READY; do not falsify the index status or change that guard to hide this policy mismatch. Human approval of the concrete plan above is current.

Execution: Sole implementation owner in this chat, serial QA/review personas because ai-agent-kit runtime/team CLI is unavailable on PATH. No fabricated team receipt. Baseline source manifest: readiness-review-2026-10-01/source-hashes.json.

Development popup harness was attempted separately but did not complete within navigation timeouts. Temporary development-only CSP experiment was reverted. No auth/CSP policy change is shipped.

User decisions confirmed in this conversation: lock immediately, allow30days recovery, then delete private data with minimal non-content audit; use the existing Pro/community MVP proposals with activation gates off until verified. Latest steering: prioritize100% locally controllable work; provider/owner setup follows later. Retention implementation has a newly found shared-payload concurrency dependency documented in account-retention-execution-plan.md; no deletion code is activated.
