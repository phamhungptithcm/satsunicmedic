# DISCOVERY-20261001 — approved release scope and deferred gates

Plan ID/version: DISCOVERY-20261001 v1
Repository intelligence gate status: READY
Approval status: APPROVED
Approver: Workspace owner, current conversation
Approval timestamp or task reference: “Release toàm bộ lên production”, followed by explicit clarification that this is a discovery website, medical approval is not required, other listed blockers are deferred to the next release and must be noted.
Approved scope: Deploy current integrated discovery web and compatible API to existing Firebase production. Include completed NAV-01/HS-UX-CLEAN-1. Enable only known, hash-verified BodyParts3D educational assets through explicit server-side discovery mode; keep clinical publication, authentication and quarantine controls intact. No new paid resources, domain, ads or clinical claims.

Approved paths:
- `apps/web/src/lib/discovery-release.ts`
- `apps/web/src/lib/pathophysiology.ts`
- `apps/web/src/lib/reference-anatomy.ts`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/hoc-tap/page.tsx`
- `apps/web/src/app/hoc-tap/sinh-ly-benh/**`
- `apps/web/src/app/kham-pha/**`
- `apps/web/preview-assets/discovery/**`
- `infra/docker/Dockerfile.web`
- `tests/discovery-release.test.ts`
- `docs/implementation/discovery-release*`

Required constraints: Preserve finalized navbar/footer/shared UI and current data meaning. Keep BodyParts3D attribution/license and exact asset hashes. Do not set clinical review status to approved. Do not package .ai/local quarantine, source DICOM, secrets or test fixtures. Enable runtime DISCOVERY_MODE_ENABLED only for this curated reference experience; missing or invalid flag retains prior production restrictions. No auth/IAM/rules weakening or production data migration/deletion.
Explicit exclusions: Clinical validation/certification, rejected cine publication, new source licenses, medical advice, changing existing reviewed-content workflow, unrestricted filesystem delivery.

## Concrete execution

1. Record explicit deferral of medical acceptance (out of discovery scope), actual-account E2E, backup-restore drill, physical-device and full clinical-product acceptance to the next release. These remain unverified, not PASS.
2. NAV-01 and UX owners have handed off scoped passing local reviews. Preserve their final file hashes while adding the minimal discovery delta.
3. Introduce a pure server gate allowing development or explicit production discovery flag; update existing reference/illustration pages and routes. Serve only packaged allowlisted GLBs with checksum/size validation. Keep unrelated editorial API publication disabled until its own requirements pass.
4. Copy verified BodyParts3D files into a dedicated non-public discovery build pack; copy that pack into the standalone image. Never copy the entire .ai/local directory. Missing/corrupt/unknown assets fail closed.
5. Freeze source + hash manifest, run scoped gate tests and existing unit/integration checks; build with current pinned Docker/Cloud Build profile. Preserve existing Firebase runtime limits and prior immutable web image for rollback. Package/deploy API only if its current compiled content differs from live artifact and compatibility checks pass.
6. Verify actual live revision, home/learning/navigation, a known asset hash, unknown asset rejection, unauthenticated protected API rejection, metadata/copy and mobile rendering. Record exact deferred checks and live limitations.

Risk: public educational asset delivery and application rollout. The current official BodyParts3D license page permits derivatives and redistribution with attribution (checked 2026-10-01); this is copyright permission, not a medical certification. The discovery flag changes presentation scope only. Rollback by restoring the prior App Hosting image/config; no database rollback required.

## Next-release notes requested by owner

- Actual Google account sign-in through session creation, revocation and sign-out.
- Isolated backup restoration/recovery drill; do not overwrite production for testing.
- Physical iOS/Android GPU and assistive-technology coverage.
- Content/translation accuracy review appropriate to discovery; clinical use remains out of scope unless separately commissioned.
- Cine source spatial/temporal mapping, pixel privacy and contour audit before enabling any source-image feature.

User's deferral does not authorize removal of copyright attribution, exposure of private data or weakening auth/security. Broad `scripts/release-check.mjs` remains unchanged as the clinical/full-product gate; this scoped discovery release records its exception rather than falsifying that gate's evidence.
