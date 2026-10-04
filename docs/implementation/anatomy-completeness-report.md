# AC-01 implementation report — 2026-10-02

## Outcome

Local source-union candidate implemented: **2,234 individually identified geometric parts**, up from 1,258, and **3,432 searchable source concepts**. Added all 976 IS-A geometries after bounded OBJ validation and confirmation that all 1,258 shared objects have identical non-comment geometry across source archives. The source archive/metadata provenance is retained; anatomical and clinical review remain unverified.

Added muscle, tendon, tooth and peripheral-nerve source class filters. All current concepts and parts are reachable through 40-row pagination, including formerly excluded broad groups, and source-backed PART-OF drilldown. Added unassigned filters and source coverage disclosure. A structure without reliable regional context retains its selected isolated view when a nearby view cannot be established. Missing activity is stated at the selected structure rather than sending unrelated anatomy to the heart.

The unchanged asset route remains integrity gated. Local development bytes and the educational build pack were regenerated to the same manifest; no deployment, public API, auth, database, infrastructure or dependency change. Existing unrelated dirty/untracked WIP preserved. HEAD is `8a749e7881f8808473a7fc88a51ff81154aadd50`; source+asset identity is pinned in `.ai/local/ac-01/candidate-hashes.json` (98 files). Git HEAD alone does not identify this candidate.

## Acceptance status

| Criterion | Status | Evidence / limit |
| --- | --- | --- |
| Explicit source inventory, missing vs available | VERIFIED within BodyParts3D | 2,234 expected unique source IDs, all imported; 2,905 IS-A reference concepts. Whole-human completeness remains unknown |
| Traverse every current concept/source part | VERIFIED | Exhaustive identity/pagination tests, >60 results, source hierarchy, unassigned filters, desktop/mobile keyboard |
| Add compatible real source geometry | VERIFIED for local technical integration | 976 new OBJs, 1,258 identical shared geometries, 77 GLB identity/hash validations; medical/overlap review NOT_REVIEWED |
| Every anatomical detail from outside to inside | NOT COMPLETE | Independent standard denominator, missing specimens, microscopic representations, clinical review and per-structure editorial content are still needed |
| Structure-specific activities | DEFERRED per AC-01 | Existing coronary illustration only; no new physiological motion or function claims |

Do not derive a whole-body progress percentage from source mesh count. The broad user requirement is still **NOT_READY** for acceptance. See `docs/anatomy/coverage-scope.md` for reference/reviewer/source work needed. Existing implementation approval remains valid; no duplicate approval requested.

## Quality gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Compilation/build | PASSED | Web `next build --webpack`: compiled + TypeScript + route generation; root `tsc --noEmit` |
| Unit/regression | PASSED | 98 tests across 8 relevant Vitest suites; 4 supplement-audit Python tests + 5 existing ISA-audit tests |
| Static analysis | PASSED | Scoped ESLint over changed application/test TS and TSX |
| Asset identity/security | PASSED within checks | 77 GLBs / 2,234 unique mesh source IDs; bounded chunks ≤8 MB, checksums, OBJ parser/ZIP budgets, traversal/duplicate/invalid-input tests |
| Build-pack consistency | PASSED | All 79 manifest-listed local assets verified byte/hash; pair generated catalog and pack |
| Architecture/API/DB | PASSED / NOT_APPLICABLE for migrations | No backend/API/auth/DB/dependency/infra edits; unchanged route/access controls |
| Repository intelligence | READY at final code review | Both indexes refreshed, gate rerun; CodeGraph callers and CocoIndex approval evidence checked; baseline copies excluded from live paths |
| Profiles | Applied | TypeScript/JavaScript, Python asset scripts, Next/React web, HTML/CSS, product-content, bounded memory/asset ingestion; no new motion |
| Product Language Gate | PASSED for tested changed flow | `anatomy-completeness-content-review.md`, eight principles, current desktop/mobile evidence; no qualified medical review claim |
| Browser interaction | PASSED for sampled local flows | Pagination/range, heart child drill/back, new tooth isolation, unknown nearby context, muscle filter, source gap explanation, keyboard Enter, no horizontal overflow, load abort/retry, empty search recovery |
| Console | EXPLAINED exceptions | Local API is not running: `/api/v1/me` 500; Next dev CSS preload warnings; deliberate asset-abort test. No claim of a clean auth environment |
| Live production, clinical validity, physical mobile GPU | NOT_TESTED / NOT_READY | No deployment, clinician, overlap review or representative physical-device benchmark |
| Final review | BLOCKED for full requested outcome | Local engineering checks pass; full-body completeness and medical/overlap acceptance remain unavailable |

Source payload: 148,601,464 bytes, 6,681,030 triangles, 77 chunks, largest 6,174,720 bytes. Skin remains first-load; optional scope geometry loads on demand. One local desktop run opened the new tooth in approximately 1.0 s and the muscle group in approximately 3.6 s, including screenshot timing. These are development observations, NOT production performance guarantees or physical-device benchmarks. A whole-source view can still be expensive. 1,310 parts lack region metadata; 828 lack declared system/class metadata, both exposed rather than silently omitted.

## Review cycles

1. **Changes required:** legacy tests assumed 16 suggestions/1,258 parts; updated to the approved exhaustive-source behavior while retaining bilingual/source-identity checks. Empty generated gaps inferred `never[]`; added typed empty-data boundary. Identified no-region nearby fallback resetting to skin/full-atlas risk; fixed and added regression + browser evidence. Updated no-region hint to match behavior. Identified stale packaged assets after regeneration; made the existing local build pack regenerate from the same conversion, with old files/manifest backed up. Moved pagination above results and ranked broad generic concepts below specific choices. Each correction was verified by affected checks.
2. **Fresh final review:** requirement match, identity/integrity, input safety, cleanup, errors/retry, compatibility, product semantics, build assets and scope inspected. 98 TS + 9 Python checks, root typecheck, lint, successful production build, 77 GLB checks and 79 packaged-asset checks support the technical slice. No new actionable code defect found within these checks. **Overall BLOCKED** for claiming the entire body is complete: no independent accepted denominator, no new female/microanatomical source, medical/overlap review absent, real-device performance not measured. These limits are visible in UI and documentation.

## Evidence and operations

- `.ai/local/ac-01/{candidate-hashes,glb-validation,supplement-audit,final-review}.json`
- `scripts/free-anatomy/catalog/{coverage,discovery}.json` plus source `.txt` receipts
- `/tmp/ac01-muscles.png`, `/tmp/ac01-tooth.png`, `/tmp/ac01-mobile-tooth.png`, `/tmp/ac01-mobile-catalog.png`
- Playwright local route: `http://127.0.0.1:4185/kham-pha/toan-than`, 1440×1000 and 390×844. Browser plugin absent; installed Playwright CLI used. Not a physical-device or authenticated/live API test.
- Backups and reproduction/rollback instructions: `docs/anatomy/coverage-scope.md`.

Runtime reporting adapter was invoked via `AI_AGENT_KIT_TASK_ID=AC-01 node .ai/scripts/final_task_report.mjs` but produced no ledger report; the standalone `ai-agent-kit` CLI is unavailable. This written report and JSON review are the fallback evidence, not a claim of runtime-ledger recording. Weighted progress unavailable because no complete anatomical acceptance denominator exists. Provider token usage, billed cost and API-equivalent cost: **Unavailable**. Memory candidates: **None**.
