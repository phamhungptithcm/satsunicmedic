# Production candidate — 2026-10-03

User authorized testing, commit/push main and production release. Current decision: source publication allowed; production deployment NOT_READY. This is not a production release announcement.

Verification against current working source: 338 unit tests (37 files), 39 API integration tests (2 files, dedicated demo-humanscope Emulators on ports 19299/18289), 24 medical-data source audit tests and 4 anatomy preparation tests pass. TypeScript, application ESLint, CI-script ESLint pass. Production dependency audit reports no known vulnerabilities. Python checks were rerun using the existing isolated audit environment after the system Python lacked pydicom. Existing emulator ports were occupied; no unrelated emulator was stopped or reused. OpenAPI was regenerated from compiled API output as required by CI. Full production build completed successfully (exit 0). Build evidence is retained in .ai/local/release-current. Imported anatomy OBJ/CSV files and existing policy files contain whitespace warnings; those source assets and generated policy files were preserved without unrelated formatting changes.

Bounded secret-pattern scan found no matches in 1099 candidate source/document/policy files before staging; it is not a comprehensive security certification. Generated logs, output screenshots, caches, local credentials/configuration, runtime ledgers and agent-kit baseline copies are excluded. Anatomy derivative asset attribution is included; clinical acceptance is not implied. Current baseline main was the initial commit 8a749e7881f8808473a7fc88a51ff81154aadd50; the application was previously untracked.

## Deployment blockers verified this turn

- GitHub main is unprotected and the repository has no environments or Actions variables. Production workflow needs GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_DEPLOY_SERVICE_ACCOUNT, FIREBASE_WEB_API_KEY and DISCOVERY_EVIDENCE_RUN_ID. WIF/IAM provisioning needs an explicitly scoped access change, not fabricated configuration.
- Required exact-candidate acceptance artifact does not exist. No browser/asset-rights/live-provider/restore/physical-device success or approved deferral is invented.
- Full-product release:check exits NOT_READY: anatomy rights/correctness acceptance, medical reviewer, actual-account auth session E2E, restore and full-product acceptance are missing in its evidence. Existing educational-draft and source work does not automatically close these fields.
- Class retention/deletion policy and implementation remain open from EDU-DIR-01. Real directory drafts are not published verified-service coverage.
- Google One Tap source and public project client configuration are implemented, but actual configured Google prompt, authorized origin and completed account session have not been accepted in a browser. Local header screenshot is not provider evidence.

No weakening of release checks, fabricated evidence, IAM grants or production mutation performed. Push may start verification; deploy must stop at missing configuration/evidence. Deployment/rollback runbook: cicd-production-runbook.md. Final engineering review remains BLOCKED for production, with local checks passing in the stated scope. Token usage and billed cost unavailable. Memory candidates: None.
