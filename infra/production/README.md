# Single-VM production runbook

Project `satsunicmedic`, Singapore `asia-southeast1-b`. User approved deploy now, custom domain and ads later. No staging.

## Release inputs

`package-source.py` builds an allowlisted, secret-free source archive. Freeze its SHA-256 before Cloud Build; concurrent local edits are not automatically part of the candidate. Build all three images using `cloudbuild.yaml`, then use their returned `@sha256` IDs in the root-only `/opt/satsunicmedic/.env`. `POSTGRES_IMAGE` and `CADDY_IMAGE` also require reviewed immutable digests. `.env` contains only image IDs and `PUBLIC_HOST`; `api.env` and `db_password` contain generated server-side credentials and must never be copied to the repository or logs. Never run `docker compose config` without `--quiet` on this host.

Bootstrap installs Debian-packaged Docker/Compose and creates the database secret at first boot. API/web run as node with no capabilities/read-only roots. Caddy has only NET_BIND_SERVICE and writable TLS state volumes; its root UID is retained to initialize certificate state and bind privileged ports. Official PostgreSQL initially uses root to initialize its data directory, then drops to postgres. No container mounts Docker's socket. Only the proxy publishes ports; the custom VPC permits IAP SSH and HTTP/HTTPS after candidate checks. OS Login, Shielded VM and deletion protection are on. Boot disk is retained on instance deletion; never use `compose down -v` in production.

## Initial rollout

1. `provision-build.sh`, submit reviewed source to Cloud Build, `provision-vm.sh`.
2. Transfer config/scripts with `gcloud compute scp --tunnel-through-iap`. Install under `/opt/satsunicmedic` as root. Install backup service/timer as `medic-backup.service` / `.timer`.
3. Write `.env` with immutable image IDs and the approved temporary HTTPS hostname.
4. Run `deploy-on-vm.sh` only for the first empty database. It validates Compose, pulls exact images, migrates once, starts API/web and checks readiness. For later updates take and validate a backup BEFORE migrations. Do not automatically rerun old initial migration scripts against existing user data.
5. Run `smoke.mjs` inside the network (`SMOKE_ORIGIN=http://web:8080`), perform bounded memory/load checks, and run `restore-check.sh` before external traffic. Restore verifier uses an isolated temporary container, not the production database.
6. `open-web.sh` opens ports 80/443 and starts Caddy. Verify public TLS, HTTP redirect and smoke checks from outside. Do not disable TLS verification to obtain a PASS.
7. Start daily backup timer, run a backup now and verify its GCS object metadata. Backup fails loudly via systemd journal; check `systemctl status medic-backup.service` and `journalctl -u medic-backup.service`. This is not yet a pager/on-call notification system.

## Backup and recovery

Daily `pg_dump -Fc` to a private GCS bucket, Google-managed encryption at rest, 30-day lifecycle. Runtime SA can create objects, not read/delete them. Restore is an owner/operator action via IAP with temporary read access or an owner-authenticated download, reviewed for privacy. Copy a selected backup into an isolated DB and run `pg_restore --exit-on-error --single-transaction --no-owner`; verify schema, constraints and relevant records before a separately approved production restore. Initial rehearsal uses an empty launch database only; it does not prove recovery of future production data. Daily schedule permits up to about 24 hours of data loss. No HA, no PITR. Database and app share one VM/disk; outage/reboot affects both.

## Rollback

Retain the previous image digest file before each app upgrade. Revert `API_IMAGE`/`WEB_IMAGE` to a previously verified pair, then `docker compose up -d --no-deps api web` and rerun readiness/smoke. Never roll back the database by deleting volumes or automatically applying down migrations. First launch has no previous live release; maintenance response / stopping the proxy is the safe traffic rollback. A process restart test is not a previous-version rollback rehearsal.

## Known release boundaries

Custom domain `satsunicmedic.com` and AdSense are explicitly deferred; both ad flags remain false. Temporary sslip.io DNS is an external dependency and is replaced when the owned domain is ready. Firebase Authentication email/password and the temporary authorized domain are configured. Existing accounts may sign in; no owner account or synthetic user has been created. A real session login still requires end-to-end validation. No fabricated anatomy data or medically unreviewed draft is published; the development-only pathophysiology route must return 404. This deploy is the application foundation, not certification of the complete medical product.

API currently groups rate limits by direct peer address behind the proxy; this is conservative (global throttle) but can limit simultaneous visitors. Forwarded-client trust needs a scoped follow-up plus spoofing tests before increasing traffic. No load-tested capacity promise.

## Costs

See `docs/implementation/singapore-cost.json`. Target about USD 40/month for e2-small with small traffic, excluding tax/assets/reviewer; this is not a hard cap. Existing project-specific USD 10 budget alert retained for early warning. No autoscaling. Build, registry storage, egress and backups still incur usage charges. The approved USD 650 ceiling is a spending instruction, not an automatic provider shutdown.
