# HS-MED4D-CINE-1 — source gate and coordinated handoff

Date: 2026-10-01. **Overall: BLOCKED at the source gate; production NOT_READY.**
Approval: [record](medical-cine-approval.md). Plan: [next 4D upgrade](../research/medical-4d-next-upgrade-2026-10-01.md).

## Implemented and verified

Added `scripts/free-anatomy/audit-cine.py` and `tests/test_cine_audit.py`. The standalone auditor accepts a bounded selected DICOM ZIP, verifies entry safety/CRC, decodes uncompressed single-frame MR images, checks dimensions, orientation/spacing, study/series/reference identity and actual trigger times. ZIP order is not treated as time. It rejects mixed spatial frames, unknown reference relationships, duplicate images/times and oversized inputs. It does not extract files, emit identifiers, approve medical content or publish images. Rejection receipts include the selected archive hash and a stable reason code.

Source preparation used isolated **pydicom 3.0.1 / numpy 2.2.6** with Python 3.11; no application dependency or lockfile changed. Python syntax compilation also passed using the workspace `python3`. Selected quality profiles: universal, Python, memory/resource lifecycle. The new utility is a local source gate, not a public upload service or complete DICOM de-identification implementation.

## What happened with real source data

The [official Sunnybrook page](https://www.cardiacatlas.org/sunnybrook-cardiac-data/) links through an HTML download page. The first small responses were HTML and were not accepted as ZIPs. The actual contour ZIP downloaded successfully: 1,435,102 bytes; 1,664 entries. It has not been mapped to either selected cine sample.

The smallest image batch is 363,437,043 bytes. Whole-batch download timed out after 180 seconds with 9,928,225 bytes; that partial file was not accepted as an archive. The source supports byte ranges. A bounded local acquisition helper read its ZIP directory and selected 20 DICOM entries from each of two distinct source-case folders. Python ZipFile verified CRCs for the selected entries. Whole-archive SHA-256 and complete dataset validation remain unavailable; a selected-entry CRC is not a whole-archive integrity claim.

| Candidate | Selected ZIP bytes | Range bytes fetched, including directory | Audit result |
|---|---:|---:|---|
| Local sample 1, 20 frames | 1,116,113 | 1,976,137 | REJECTED: `UNVERIFIED_CROSS_FRAME_OF_REFERENCE` |
| Local sample 2, 20 frames | 910,608 | 1,760,831 | REJECTED: `UNVERIFIED_CROSS_FRAME_OF_REFERENCE` |

Sample 1 decoded to 20 images of 256×256 pixels. Numeric position/orientation/spacing agreed; DICOM trigger times increased from 20.547945 to 801.369873 ms. CardiacNumberOfImages declares 20. There is one study and one series, but **20 distinct Frame of Reference UIDs**. Identity-removal and burned-in-annotation declarations were absent. Decoder conformance warnings were also observed; subsequent auditor runs suppress raw decoder diagnostics to avoid exposing identifiers and retain only safe statuses/counts.

Both samples decoded before the cross-reference rejection. This is not evidence that the underlying images are wrong, nor that all Sunnybrook cases fail. It means this implementation has no verified mapping establishing their common spatial reference. Per [DICOM PS3.3 C.7.4](https://dicom.nema.org/medical/DICOM/current/output/chtml/part03/sect_C.7.4.html), Frame of Reference identifies the spatial relationship; matching numeric coordinates alone is insufficient evidence to silently register different references. No UID was rewritten to force acceptance.

The approved plan says to stop at source reporting if the data gate fails. Therefore the new image contract, renderer, cine panel, Cornerstone dependency trial and shared UI integration have **not** been implemented. This avoids creating an apparent working cine feature around a rejected sample. Approval remains valid for the remaining scoped work once the prerequisite is satisfied.

Local, ignored receipts:

- `.ai/local/med4d-cine/sample-audit.json` and `sample-audit-case2.json`: hash-bound rejection receipts.
- `.ai/local/med4d-cine/range-receipt.json` and `range-receipt-case2.json`: public source page, batch identity, selected member hashes/CRCs, byte counts; no download access query retained in these receipts.
- `.ai/local/med4d-cine/candidate-hashes.json`: exact auditor/test/approval and selected ZIP hashes.
- `.ai/local/med4d-cine/technical-sample-inspection.json`: bounded numeric metadata for sample 1, no raw identity fields.

Do not commit or publish raw quarantine archives or temporary download URLs. The auditor never sets `displayEligible` to true, even for synthetic fixtures or a technical pass. Pixel privacy, medical review, contour mapping and cycle completeness require separate evidence.

## Cross-session agreement

The user explicitly authorized cross-session coordination. Messages were sent to the existing UI/UX and design sessions. The UI/UX session supplied `.ai/local/coordination/ui-ux-audit-20261001.md` and `ui-ux-cleanup-20261001.md`.

| Owner | Scope |
|---|---|
| UI/UX session `01a0f7c1-48fc-7822-8c38-addcc7ba16dd` | `full-body-anatomy.tsx`, body explorer/vocabulary, full-body camera/input lifecycle, shared styles and its own regression tests |
| This 4D session | New cine audit and tests, source quarantine/receipts, cine-specific documentation; future independent cine modules subject to data gate |
| Design session `01a0f4c2-5e43-7323-82e4-29f79746d451` | Latest observed work was medical-community design/planning; contacted for pending overlaps, no ownership reply yet verified |

Our note: `.ai/local/coordination/medical-cine-20261001.md`. No shared UI files, app manifests, lockfile, generated catalog, API, database or infrastructure were edited by this session. No dev server was started/stopped, no `.next` build or parallel browser session was run. Existing server 4191 was identified for the UI/UX owner. Shared worktree changes by others remain intact.

Reused QA evidence is deliberately limited: desktop/mobile viewport observations, clipping checkbox/slider DOM state and undo behavior. Geometry correctness, physical-touch interaction and animation FPS were NOT_TESTED. No screenshots were produced by this session and no visual PASS is claimed.

## Review and verification

| Check | Result |
|---|---|
| Approval validator, new auditor and tests | PASSED using this task-specific approval record |
| Synthetic DICOM regression tests | PASSED: **15 tests**, final run exit 0 |
| Python syntax compilation | PASSED |
| Whitespace check | `git diff --check` PASSED for tracked changes; new files separately read/reviewed |
| Two real sample audits | Executed; both exit 1 with explicit cross-reference rejection, not a test-suite failure |
| Security/resource review | Bounded ZIP/decoded dimensions, no archive extraction, uncompressed decoding only, no identity diagnostics, fail-closed display status |
| Static Python lint/type tooling | NOT_RUN: no configured/available ruff or Python type-check setup identified; syntax/tests/source review are not substitutes |
| App build/API integration/DB migration | NOT_APPLICABLE to the two new local utility/test files; no app changes by this session |
| UI Product Language Gate | NOT_APPLICABLE to this session's code; no user-facing UI strings changed |
| Clinical, privacy clearance, public delivery | NOT_READY / NOT_TESTED |

Final review applied `final-implementation-review`, `code-review`, `code-quality-review` and `security-review`:

1. Cycle 1: identified unbounded compressed-decoder risk relative to the intended sample scope, potentially sensitive decoder diagnostics, generic mixed-series reporting and rejection receipts missing source hash. Corrections: restrict supported transfer syntaxes, suppress raw diagnostics, distinguish cross-reference failure and hash rejection input. Added failure/privacy regressions. Source blocker remained unresolved.
2. Cycle 2: re-read auditor/tests and approval; reran 15 tests, syntax compilation, approval checks and both real-source entry points. No known additional defect was found within these checks. **Overall review remains BLOCKED** because the approved viewer workflow cannot pass its source prerequisite. The local audit utility has passed its executed checks; this does not turn the whole upgrade or application into a successful handoff.

Acceptance progress, five equally weighted work packages: coordination/ownership and executable sample gate completed; existing clipping QA partial; data acceptance failed; image viewer/integration not started. **2/5 complete (40%)**, not a release completion score. Runtime ledger CLI `ai-agent-kit` is unavailable on PATH; this is a manual evidence summary, not a fabricated runtime report.

HEAD at task start: `8a749e7881f8808473a7fc88a51ff81154aadd50`. Working tree is dirty/untracked from prior and concurrent work. No commit, push or deployment. Token usage, billed cost and API-equivalent cost: **Unavailable**. Memory candidates: **None**.

## Exact next action

Obtain a source-backed explanation/mapping for the per-frame reference UIDs, or select a source case with coherent verified spatial identity. A qualified data/review owner must then review metadata/pixels for privacy and map contour coverage; no approval may be inferred from a public download license. Resume the already approved local contract/viewer work after that data gate passes, and hand the minimal integration patch to the current UI owner rather than overwrite shared files.
