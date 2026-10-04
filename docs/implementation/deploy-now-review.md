# HS-DEPLOY-NOW review cycles

Repository intelligence: DEGRADED (stale indexes; native source/Git/compiler/runtime evidence used). No claim of complete graph coverage. Scope: Singapore single-VM deployment, temporary HTTPS, ads disabled. Independent source WIP remains untouched and outside the frozen archive unless already present when captured.

## Cycle 1 — corrections before public traffic

- Snapshot included an in-progress preview import: local typecheck failed. Waited for the owning chat's files; subsequent 56 tests, lint and typecheck passed. No overwrite of other work.
- Linux Prisma tooling lacked OpenSSL: installed OpenSSL/CA certificates in the build stage before generating engines. Candidate rebuilt.
- Archive excludes empty directories: web Docker COPY failed for empty public directory. Added mkdir during build. Candidate rebuilt.
- Production dependency audit reported 3 high, 2 moderate, 1 low advisories. Applied constrained transitive overrides; audit returned no known vulnerabilities. Prisma generate, 56 unit and 14 API integration tests, lint/typecheck passed after fix. The 14 API tests use local PostgreSQL and Firebase emulator, not live authentication evidence.
- PostgreSQL 18.3 and Caddy 2.10.2 were old candidates. Verified current official PostgreSQL 18.6 / Caddy 2.11.4 releases and pinned their registry digests before the first DB initialization. Caddy configuration validates on the actual VM.
- Corrected secret-file readability after PostgreSQL UID drop without opening the root-only host directory. Backups stream uploads to avoid loading entire databases into RAM.
- Cloud build service account has access only to its build bucket and artifact repository plus log writing. Runtime SA has artifact read, backup create, log write and three Firebase session/user-check permissions; no Firebase user create/delete or secret access.

## Candidate

Source archive SHA256 `b0744aaf28275be7e5a2e47244b8098bb42a735acdd293b5a9e1033ca0feb9ac` (73 build-input files). Build ID `5a051ad5-f094-42c9-9cb8-366ef79ee79d`. Direct app versions remain unchanged. Transitive patch validation is complete locally; Linux build/runtime verification pending here until live evidence is attached.

## Cycle 2 — pending runtime evidence

Do not treat this file as a passing release review before build, migrations, internal/public smoke, backup/restore, resource measurements and browser checks are recorded. Full medical product remains NOT_READY: commercial assets, medical review, full organization/privacy/teaching flows and real user sign-in acceptance are not covered by infrastructure deployment. New custom domain and AdSense are explicitly deferred by the owner.

Trade-offs: one VM and one disk, daily backup without PITR, external temporary DNS, no automatic DB failover, no capacity guarantee, no paging/on-call yet, current conservative proxy-wide rate limiter. Retain strict TLS/session/CSRF/ownership gates. No user-facing copy edits in this deployment; enabling existing Firebase login state still requires in-context review.

Usage: provider-reported tokens and actual billed task/cloud cost unavailable. Monthly infrastructure target is an estimate, not an invoice or hard cap. Memory candidates: None.
