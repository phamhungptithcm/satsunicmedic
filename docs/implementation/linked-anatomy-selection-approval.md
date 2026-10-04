# SELECT-01 approval
Plan ID/version: SELECT-01 v3
Repository intelligence gate status: DEGRADED — stale indexes, bounded source verified; repository policy permits fallback.
Approval status: APPROVED
Approver: Workspace owner
Approval timestamp or task reference: Current conversation user message "approved" following SELECT-01 v3.
Approved scope: Linked selectors, on-model view card, pan/cursor zoom/shortcuts, focused tests and verification documentation.
Constraints: Preserve existing WIP, source identities, asset guards; no dependencies, deployment, auth, DB or medical-data changes.
Approved paths:
- `apps/web/src/components/full-body-anatomy.tsx`
- `apps/web/src/components/full-body-anatomy.module.css`
- `apps/web/src/lib/body-explorer-ux.ts`
- `apps/web/src/lib/body-explorer.ts`
- `packages/anatomy-viewer/src/scene-history.ts`
- `packages/anatomy-viewer/src/full-body-canvas.tsx`
- `tests/body-explorer-ux.test.ts`
- `tests/medical-body-scene.test.ts`
- `tests/full-body-load-lifecycle.test.ts`
- `packages/anatomy-viewer/src/body-navigation.ts`
- `tests/body-navigation.test.ts`
- `docs/implementation/linked-anatomy-selection-*`

Validator limitation: validator hard-codes READY; do not misrepresent degraded index status. Human approval and AGENTS degraded fallback govern this scoped implementation.
