# Discovery production release

Owner authorization: current conversation “Release toàn bộ lên production” and clarification that this is discovery, medical approval is outside scope, other listed full-product blockers deferred. Approved plan: discovery-release-plan.md.

Release candidate: `.ai/local/discovery-release/candidate.json`, SHA-256 `fc9aac773da34b4e27eb1965afdb7af1b5485404b95a9458998aa2176b5c00e8`. This is an explicit working-tree snapshot, not Git HEAD. HEAD at freeze `8a749e7881f8808473a7fc88a51ff81154aadd50`; repository contains extensive untracked WIP. No reset, clean, commit or overwrite of other owners.

Included: completed NAV-01 and HS-UX-CLEAN-1, approved account/learning foundations, explicit discovery gate, 46 size/hash-verified geometry files, completed BRAND-01 v2 navbar/title/favicon. Excluded: readiness pagination/index WIP and SELECT-01 interaction redesign still being developed in other sessions. Both remain intact locally. Rejected raw cine remains quarantine.

Verification: 218 unit tests, 26 emulator integration tests, web/API/contracts compilation, changed-path ESLint, isolated Next production build; 46 assets verified, unknown paths denied, corrupt reference/heart/layer rejected. 12 discovery browser checks; separate NAV-01 33, BRAND-01 20 and UX 22 checks are scope-bound and not added into a fabricated full-suite total. Packaged API npm audit: 0 vulnerabilities at execution; this is not a full security certification.

Review cycle 1 found missing build-time heart binding metadata and wrong default registry; metadata retained (raw preview excluded), registry corrected to existing `production` from previous successful release. No IAM change. Browser test harness initially checked before route content and skipped the catalog's explicit open-simulation action; fixed to follow real UI, then 12/12 passed. CLI global lacked Node24; use pinned runbook CLI, runtime unchanged.

## Deferred to next release by owner

- Actual Google account sign-in, session/revoke/sign-out E2E.
- Isolated backup restoration drill, no production restore test.
- Physical iOS/Android GPU and assistive technology.
- Discovery content/translation accuracy review; clinical certification is outside current product scope.
- Cine frame mapping, pixel privacy and contour validation before any source-image release.
- New pagination/query index work and linked selection controls after their own review/handoff.

Not waived: copyright attribution; auth, CSRF and ownership; no raw patient data; asset checksum allowlist. Broad clinical release-check script remains unchanged and cannot be presented as PASS for this release.

Live rollout/readback: COMPLETE for the discovery scope. App Hosting rollout `discovery-20261001-03` SUCCEEDED; web `medic-discovery-20261001-03` and API `api-00003-ros` both READY, 100% traffic. Previous App Hosting rollout/image saved for rollback. No database migration, datafix, deletion or security-rule change.

Token usage: Unavailable. Actual billed cost: Unavailable. Memory candidates: None.

API: Firebase reports Successful update operation. CLI exits nonzero only because Artifact Registry cleanup policy was absent; did not use --force or change retention. Record storage cleanup/retention policy for next release; do not misreport this post-deploy warning as application rollback. Live revision/readiness readback follows.

## Final live evidence

URL: https://medic--satsunicmedic.asia-southeast1.hosted.app

Web image: `asia-southeast1-docker.pkg.dev/satsunicmedic/production/web@sha256:5b96bb590f710035a7763058d4cbfc2f15e17696e5150769dbd1d558e7c2226a`. Cloud Build `0fb244ab-fcaf-46ad-ba73-0f30a9b3ff13`. Live read-only checks **58/58 passed** (pages, favicon, health/readiness, 401 private endpoints, invalid layer, all 46 asset sizes/hashes). Chromium live desktop/mobile model loaded, 390px no horizontal overflow, source attribution and reference disclaimer present. Evidence in `.ai/local/discovery-release/live-check.json`, web/api-after.json and `output/playwright/discovery-release/live-*`. These do not claim authenticated Google-account workflows.

Final review cycle 2: PASSED for this exact discovery candidate, after cycle 1 held live acceptance pending. Earlier clinical preflight remains historical NOT_READY outside discovery acceptance. Full production UI still contains HumanScope footer text per limited BRAND-01 scope. Broader branding and concurrent unfinished work are not falsely included.

Governed ledger limitation: whole-workspace readiness is NOT_READY because the shared checkout remains dirty with concurrent unreleased work and the runtime task orchestration/skill-routing state was not established for this historical release. This is not a failed cloud rollout. The immutable deployed candidate and scoped final review are recorded separately; never treat current workspace as identical to production. Owner explicitly deferred other blockers; no ledger state or Git history was fabricated to show clean.
