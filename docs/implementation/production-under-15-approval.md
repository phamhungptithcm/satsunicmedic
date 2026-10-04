# Approval — PROD-LOW15 v1
Plan ID/version: PROD-LOW15 v1; docs/implementation/production-under-15-plan.md
Approval status: APPROVED
Approver: repository owner, current conversation
Approval timestamp or task reference: user reply “không giảm mô hình 3D duyệt các plan còn lại” following the concrete PROD-LOW15 v1 approval request.
Approved scope: plan items 1–6 and 8; production cost controls, existing topology, scoped CI WIF/IAM, verified GitHub production variables, registry correction, resource validation, tests, documentation and release only after preserved acceptance gates. Approves proposed interruption policy and legacy static IPv4 release after dependency checks; preserve VM disk and backups.
Explicit exclusion: all item 7 model/asset optimization, geometry/content reduction, asset route/caching modifications. Keep 3D models byte-for-byte unchanged.
Required constraints: target below USD 15/month including deployment costs, no whole-project monetary guarantee, no new paid ancillary topology, no Owner/Editor or service-account keys, no permanent data deletion, no fabricated evidence or release bypass. Prior larger budget ceilings superseded.
Risk: HIGH for IAM/production; static IP release is irreversible to the same address and explicitly approved in the reviewed plan. Record provider readback and unresolved blockers.

Repository intelligence gate status: DEGRADED — indexes drifted after plan/approval files; bounded source/provider readback used.
Approved paths:
- `infra/firebase/production-low-cost.json`
- `infra/firebase/cloudbuild-web.yaml`
- `scripts/ci/check-production-costs.mjs`
- `scripts/ci/deploy-production.mjs`
- `scripts/ci/release.mjs`
- `tests/cicd-release.test.ts`
- `tests/production-cost-controls.test.ts`
- `docs/implementation/production-under-15*`
- `docs/implementation/cicd-production-runbook.md`
Gate limitation: validator requires READY even though repository top-level workflow permits DEGRADED. Do not falsify index readiness or bypass actual approval.
