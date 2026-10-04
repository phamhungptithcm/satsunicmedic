# AC-01 approval

Plan ID/version: AC-01 v1 — docs/implementation/anatomy-completeness-plan.md
Repository intelligence gate status: READY — both indexes refreshed and checked in this execution
Approval status: APPROVED
Approver: Workspace owner
Approval timestamp or task reference: Current conversation, user reply “approved” directly following the AC-01 plan handoff
Approved scope: AC-01 steps A–C: source-backed coverage catalog/audit, exhaustive discovery, source pipeline additions after verification. Existing-source local preview only; no claim of complete or clinically reviewed anatomy.
Constraints: Preserve WIP, identity, publication and integrity gates. No backend/public API/DB/infra/dependency changes, purchase, deployment, or fabricated anatomy. Animation remains separate.

Approved paths:
- `scripts/free-anatomy/**`
- `apps/web/src/lib/body-explorer.ts`
- `apps/web/src/lib/body-explorer-ux.ts`
- `apps/web/src/lib/full-body-anatomy.ts`
- `apps/web/preview-assets/discovery/full-body-v2/**`
- `apps/web/preview-assets/discovery/manifest.json`
- `apps/web/src/components/full-body-anatomy.tsx`
- `apps/web/src/components/full-body-anatomy.module.css`
- `packages/anatomy-viewer/src/scene-history.ts`
- `packages/anatomy-viewer/src/full-body-canvas.tsx`
- `tests/**`
- `docs/anatomy/**`
- `docs/implementation/anatomy-completeness*`

Generated-output clarification: AC-01 source-pipeline regeneration includes the matching local discovery GLBs and manifest consumed by the unchanged asset route. They must match the generated catalog to avoid build/runtime hash failures. No release script, deployment, access gate or publication status is changed.
