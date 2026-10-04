# Implementation approval — HS-MED4D-CINE-1

Plan ID/version: HS-MED4D-CINE-1; docs/research/medical-4d-next-upgrade-2026-10-01.md
Repository intelligence gate status: READY
Indexed analysis reviewed: Current CodeGraph FullBodyAnatomy/assetManifestSchema, CocoIndex cine source/asset loading, verified viewer/contracts and asset routes in working tree at HEAD 8a749e7881f8808473a7fc88a51ff81154aadd50.
Approval status: APPROVED
Approver: Workspace owner in this conversation
Approval timestamp or task reference: User response “Approved” to the linked 4D research/implementation plan; subsequent “Continue va syncup vs session khác để không conflict hay trugng laqjp hay override”.
Approved scope: Existing clipping QA; bounded official Sunnybrook source acquisition/audit; separate medical-image contract; client-only image adapter and cine learning panel after sample gate; regression and product-content review. Surface deformation remains conditional on sufficient reviewed segmentation. Sync existing sessions before overlapping changes.

Approved paths:
- `scripts/free-anatomy/audit-cine.py`
- `scripts/free-anatomy/prepare-cine.py`
- `packages/contracts/src/medical-image-manifest.ts`
- `packages/contracts/src/index.ts`
- `packages/anatomy-viewer/src/medical-image-viewer.tsx`
- `packages/anatomy-viewer/src/medical-image-*.ts`
- `packages/anatomy-viewer/package.json`
- `apps/web/src/components/medical-cine*`
- `apps/web/src/components/full-body-anatomy.tsx`
- `apps/web/src/lib/body-explorer.ts`
- `tests/medical-cine*`
- `tests/test_cine_audit.py`
- `tests/body-sections.test.ts`
- `tests/medical-body-scene.test.ts`
- `docs/implementation/medical-cine*`

Required constraints: Preserve all pre-existing untracked/WIP files. Data gate first; no fabricated frames, medical approval, physiological seconds or cross-specimen registration. Quarantine stays local, no clinical data publication. Runtime delivery/production deployment is a separate plan. Keep legacy mesh manifest semantics and development fail-closed asset route. New runtime dependencies remain subject to the plan's compatibility trial and scoped coordination before shared package/lockfile edits. Source tooling may use isolated local decoder tooling without changing app dependencies.
Explicit exclusions: Production/IAM/billing/auth/database mutations; global design changes; removing license/review gates; publishing any patient-source data; creating accounts or sending messages to dataset providers; replacing other sessions' WIP.
Delta approval required when: Source substitution changes intended use/rights, public delivery is needed, security controls change, or runtime scope materially exceeds the approved plan.

Risk: High for source privacy/medical meaning; local bounded processing only. Selected profiles: universal, Python/memory for source audit; TypeScript/web/concurrency/memory/product-content/animation-motion if sample passes and UI work begins.

Coordination: UI/UX session 01a0f7c1-48fc-7822-8c38-addcc7ba16dd and design session 01a0f4c2-5e43-7323-82e4-29f79746d451 contacted under explicit user authorization. Shared UI edits are held until ownership is reconciled. This record adds task-specific approval and does not replace .ai/local/implementation-approval.md or other session records.
