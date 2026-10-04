# PROD-LOW15-IAM v2 — Exact remaining impersonation boundary

Status: APPROVED; applied and provider readback verified (2026-10-03). Approver: repository owner. Approval task reference: current user reply “apporved” to the explicit IAM v2 question naming medic-build, medic-web, medic-functions and the Functions build identity migration. Previous auto-review rejection is resolved by this exact recipient/privilege approval; no broader rights are authorized.

Recipient: serviceAccount:medic-deploy@satsunicmedic.iam.gserviceaccount.com, whose WIF trust is restricted to numeric repo 1398846396, owner 32831453, refs/heads/main, production environment. No key creation.

Proposed exact IAM bindings: roles/iam.serviceAccountUser on each of these three service accounts, not at project level:

- medic-build@satsunicmedic.iam.gserviceaccount.com: build and source/image operations, existing logging writer, registry production writer and build-source bucket permissions.
- medic-web@satsunicmedic.iam.gserviceaccount.com: existing Firebase App Hosting computeRunner web identity.
- medic-functions@satsunicmedic.iam.gserviceaccount.com: existing API runtime identity with roles/datastore.user, medicIdentityRuntime and logging writer. This lets authorized deployment run code under API runtime privileges; it is security-sensitive. No direct secret-access grant.

Explicitly forbidden: actAs on 108608537442-compute@developer.gserviceaccount.com, currently Editor; project-level Service Account User; Owner/Editor grants; new credentials; broad IAM or secret administration.

Functions currently uses the default Compute identity for builds. Proposed alternative: move only api buildConfig.serviceAccount to medic-build, without changing runtime identity or public behavior. Before patch, capture current buildConfig and validate provider-supported service-account update. Grant medic-build only source-object read on the provider source bucket, artifact writer on gcf-artifacts, and required build logging/service-usage permissions. Verify exact missing permissions using provider-supported checks; no widening to Editor or automatic arbitrary grants. Retain existing production registry/build-source access.

Affected operations: API build/deploy, App Hosting build/deploy; possible failed build if a narrow permission is absent. Backup and data remain untouched. New deployment still requires real candidate acceptance, current measured cost projection and Google/restore evidence. Rollback: restore previous Functions build identity if necessary; remove only newly added bindings by exact member/role/condition. Never delete existing identities or modify the default Compute account's Editor binding without separate approval.

Validation: provider readback for all three SA policies; no default-Compute actAs; negative OIDC claims and actual trusted main job; current full tests/build, immutable artifact/readback. Until validation completes, IAM setup remains partial and production release NOT_READY.
