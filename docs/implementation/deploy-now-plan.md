# HS-DEPLOY-NOW — Singapore, temporary HTTPS, ads off

Authorization: user explicitly requested deployment now, domain later, no AdSense now; selected Singapore (asia-southeast1). This follows the reviewed single-VM cost plan and prior acceptance of single-zone downtime. Billing readback is now enabled on the existing attached account 01CFF8-B00820-B17A4D; do not change that association.

Scope: provision one e2-small candidate (2 GiB; use e2-medium only if measured memory/load requires), dedicated VPC/firewall, fixed IPv4, Debian VM with OS Login/IAP admin, Docker services Next/Nest/PostgreSQL/Caddy, daily GCS backups. No managed SQL/LB/HA/staging. Cloud Build creates Linux images because local Docker is unresponsive. Use dedicated service accounts and scoped IAM. Temporary sslip.io hostname resolves the VM address and obtains a public TLS certificate; move to satsunicmedic.com later. No changes to its DNS now. AdSense flags remain false. Keep unavailable medical/assets functions closed.

Impact: new infra only, empty production database migrations, internal API routing, no schema or medical content changes. Persist data outside container lifecycle; do not seed synthetic data into production. Firebase public client configuration and authorized temporary origin must be checked before enabling login. Build/artifact costs are incremental; prior US estimate is not a Singapore quote. Target under the previously approved 160 USD/month envelope and 650 USD cap; alerts do not impose a hard spend cap.

Validation: Linux build, immutable image IDs, Compose validation, health/readiness, HTTPS, ads absent, unauthenticated private route rejection, origin/CSRF protections, limits/memory, restart and isolated backup restore. Do not claim complete medical product release. No production data removal or destructive rollback. Rollback app image only; migrations remain forward-only unless a reviewed recovery is required.

Repository intelligence: DEGRADED, indexes stale / CocoIndex health unavailable. Bounded source reads of Dockerfiles, Next rewrites, API config/security/identity and deployment files substitute; no claim of full indexed impact analysis.

## Deployment security correction

Pre-release `pnpm audit --prod` found high advisories in deepmerge-ts (Prisma configuration), mysql2 (Prisma tooling) and an older grpc-js (Firebase Firestore dependency). Scope is constrained transitive overrides to patched releases, preserving direct framework versions and app contracts. Validate Prisma generate/migrate, API tests, Next build and production audit before publishing. This is a necessary correction within the authorized production deployment, not a new feature. Preserve other chats' WIP and update only the frozen release archive with these dependency files.
