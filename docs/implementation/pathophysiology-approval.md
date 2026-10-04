# Implementation Approval Record

Plan ID/version: pathophysiology-learning-research / milestone A / v1
Repository intelligence gate status: DEGRADED — bounded source inspection, optional indexes stale
Indexed analysis reviewed: Source evidence in docs/pathophysiology-learning-research.md; no complete index claim
Approval status: APPROVED
Approver: User in current Codex chat
Approval timestamp or task reference: Chat 01a0f535-63d5-7f82-9fd0-a24a4ae056f3; user message “approved” following research and recommendation to implement one myocardial infarction lesson first
Approved scope: Milestone A, local development preview of one myocardial infarction lesson; baseline, stages, interactive 2D flow diagram, comparison, sources, self-check, tests and review. Route and scoped CSS below are the concrete web integration for this milestone; no API/database/3D changes needed.

Approved paths:

- `packages/contracts/src/pathophysiology.ts`
- `packages/contracts/src/index.ts`
- `apps/web/src/lib/pathophysiology.ts`
- `apps/web/src/lib/pathophysiology-draft.ts`
- `apps/web/src/components/pathophysiology-panel.tsx`
- `apps/web/src/components/pathophysiology.module.css`
- `apps/web/src/app/hoc-tap/page.tsx`
- `apps/web/src/app/hoc-tap/sinh-ly-benh/page.tsx`
- `tests/pathophysiology.test.ts`
- `docs/implementation/pathophysiology-approval.md`
- `docs/implementation/pathophysiology-review.md`

Required constraints: Draft is server-owned, development-only, not bundled as client data in production; clear medical-review boundary. No new dependencies, deployment, purchase, database changes or patient data. Preserve existing WIP and scene v1.
Explicit exclusions: Stroke implementation, real 3D/CFD, treatment recommendations, publication of unreviewed content.
Validator limitation: Current validate_implementation_approval.py only accepts READY although AGENTS.md explicitly permits DEGRADED work with bounded source evidence. Record actual gate truthfully; do not change validator or invent READY. Human approval above is current and explicit.
