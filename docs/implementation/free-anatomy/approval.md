# FREE-ANATOMY-01 — scope and approval

Plan ID/version: FREE-ANATOMY-01 v1, refinement of AGE-01 research to free external assets first
Repository intelligence gate status: DEGRADED — indexes stale; attempted refresh once, CocoIndex CLI cannot write daemon.log in sandbox. MCP searches succeeded; current source verified directly.
Approval status: APPROVED
Approver: Workspace owner, current conversation
Approval timestamp or task reference: User message "approved" following the free-model, quality-first proposal in this chat.
Approved scope: Evaluate and prepare free external anatomy assets, license/provenance inventory, bounded local conversion and preview, relevant validation. Retain accurate age limitations. Use original BodyParts3D as a free source candidate because Z-Anatomy's attribution lists mixed NC components. No new paid provider.
Approved paths:
- `scripts/free-anatomy/**`
- `tests/free-anatomy/**`
- `docs/implementation/free-anatomy/**`
- `.ai/local/free-anatomy/**`
- `apps/web/src/app/kham-pha/mo-hinh-tham-khao/**`
- `apps/web/src/components/reference-anatomy*`
- `apps/web/src/components/explorer.tsx`
- `apps/web/src/lib/reference-anatomy.ts`
- `packages/anatomy-viewer/src/reference-canvas.tsx`
- `packages/anatomy-viewer/package.json`
- `tests/reference-anatomy.test.ts`

Required constraints: Preserve all WIP; no production publication or invented medical review; no imported scripts executed; no paid license, account, new dependency or cloud change. Unknown source units, clinical accuracy and age coverage stay unknown until verified. Asset gate stays intact.
Explicit exclusions: Blanket approval for the whole Z-Anatomy archive, diagnosis, artificial ageing, database changes and production delivery. No app changes are needed to evaluate the candidate.

Concrete implementation: inspect source license and archive; read only selected OBJ entries using bounded reads (no archive extraction); preserve source IDs/hashes; convert a small thoracic selection into review-only GLB using installed Three.js; supply local preview and attribution; verify corruption/missing-data failure paths and current browser rendering. Candidate is not a publishable AssetManifest, and has no fabricated reviewer.

Impact: new offline scripts and review artifacts only; existing app/API/contracts untouched. Risk: untrusted file input, fidelity of reduction, ambiguous provenance. Mitigation: bounds, CRC/hash, allowlist, no external resources/code, fail closed and explicit technical-versus-medical evidence.

Validator limitation: repository validator requires READY even though AGENTS.md explicitly permits DEGRADED work. Record the real state; do not falsify READY or edit the gate.

## Owner steering: integrate the existing project

User explicitly required this feature to live within the existing project/session, with a sensible navigation entry, not a new app. Implement a development-only child of Khám phá at `/kham-pha/mo-hinh-tham-khao`, reuse Header and existing Three dependencies, add a small link to the existing Explorer. Serve the pinned local candidate through a development-only route (never `public/`). No medical-review or production gates change. Scope supersedes the standalone preview as the final deliverable; the standalone files remain conversion QA tooling only. Other active sessions own deployment and pathophysiology; do not edit their modules, header, proxy, global CSS or production files.
