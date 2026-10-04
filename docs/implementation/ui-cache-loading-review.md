# UI-PERF-01 — implementation and verification

Approved scope: [ui-cache-loading-plan.md](ui-cache-loading-plan.md). Repository intelligence is DEGRADED (optional indexes stale/unavailable); critical conclusions were checked against source, compiler, tests and browser behavior.

## Change and boundaries

Verified public model bytes are cached in the browser tab for five minutes, with a 32 MiB LRU byte budget. Entries require the same URL, expected length and SHA-256. Each reader gets an isolated copy. Concurrent readers share transport; the final departing reader aborts it. Expired, incomplete, oversized, corrupt and cancelled downloads cannot populate the cache. Geometry, scene objects and materials are never shared through this cache. Active decoded models and caller buffers use additional memory beyond the cache budget.

Progress uses actual received bytes and the current scene's expected manifest total. It describes download availability, not clinical completeness or render readiness. Once bytes arrive, the label changes to “Đang dựng mô hình” with an indeterminate bar until ready. The canvas no longer traverses every mesh merely because its parent reports download progress; repeated draws are scheduled once per animation frame.

API requests retain no-store, CSRF, credentials, abort and ten-second timeout semantics. The shared activity store contains only a count, not URLs, responses or identity. It is inactive on the server. Next Link pending status and router transitions own navigation completion. Fast global requests receive a 180 ms visual delay to avoid flicker; actual work is never delayed. Loading boundaries and contextual pending labels remain immediate. Reduced motion removes bar animation.

No public API, schema, medical content, IAM, infrastructure or model asset change. No new paid service or persistent cache. Initial download and GLTF parsing still take time; this work does not promise a universal speed multiplier.

## Action coverage

| Surface | Work | Feedback and settlement |
| --- | --- | --- |
| Header, footer, content links | Next route transition | Shared thin bar from useLinkStatus; lifecycle cleanup on completion/cancellation. Native full-document links retain browser loading behavior. |
| Account, directory, One Tap | Programmatic push/replace/refresh | useTransition tracked by the same count; memoized router keeps effects stable. |
| Full body | Dynamic import, skin/interior chunks, retry | Local loading bar, byte percentage below 100, then preparation; current scene total only. Error keeps explicit retry and available structures. |
| Simulation | Canonical heart chunks and GLTF preparation | Cumulative bytes across required chunks; render state determines readiness, not download percentage. |
| Directory | Search, pagination, retry, filter change | “Đang tìm cơ sở”; shared API bar; changed filters clear old results; abort on replacement/unmount. |
| Teaching | List/open/create/save/present, quiz picker, atlas import | Contextual labels and disabled action controls; error preserves editor state; existing abort and idempotency behavior retained. |
| Classroom | Class, lesson, quiz and attempt operations | Existing busy state now uses compact local bar; API bar covers each request; existing status/error and cancellation retained. |
| Study notes | Open/load more/save | “Đang tải ghi chú” / “Đang lưu ghi chú”; disabled repeated writes, content retained on failure. |
| Learning | Quiz list/open/submit, reviews, learning position | Shared API bar plus existing quiz Loading and new review Loading; no response-body caching. |
| Account | Load, save, logout, revoke sessions, export | Contextual pending feedback; preparation shown during Google SDK startup; provider prompts retain their instruction; server reads/writes use shared bar. Export closes/cancels incomplete work. |
| One Tap and legacy explorer | Session, sign-in exchange, asset metadata, annotations, notes | Shared API activity and existing contextual Loading/status. Provider-owned account picker is not given an invented percentage. |
| Synchronous local controls | Filtering local catalog, camera, clipping, play/pause | Immediate feedback; no artificial timer or loading state. RAF batching preserves model detail. |

## Review cycles

1. Found missing optional progress parameter in chunk loader (compiler), unstable router wrapper identity affecting One Tap effect (source review), nested live status for chunk loading, and progress-only parent updates causing full mesh traversal. Fixed signatures, memoized router, removed duplicate status wrapper and limited canvas reconciliation to scene/control changes. Verification is recorded below.
2. Focused browser found that an embedded named progressbar duplicated the accessible name of the busy save button. Added explicit pending names to the save, logout and quiz-submit buttons; the operation itself had already completed successfully. Focused browser verification passed after the correction, including the exact accessible name, disabled state and a single synthetic PATCH.
3. Final scoped source/security/concurrency/failure/product-content review passed against the corrected implementation. No unresolved finding in the executed UI/cache checks. Production promotion is a separate blocked criterion; this document is not a production acceptance receipt.

## Evidence and limits

Local verification: 384 unit tests (40 files), 25 focused cache/loader tests, 39 emulator integration tests, typecheck, application/script lint and production build passed. The complete browser acceptance passed full-body interior, muscle visibility, shared simulation, three audiences, responsive widths, directory failure/retry and filter reset (`ui-browser.log`). Subsequent account-button accessibility corrections were rechecked on the final build in `ui-focused-browser.log`: eight focused checks passed with zero page exceptions. Cold skin/heart selection issued six asset requests; SPA unmount/return issued zero. Timing includes synthetic cold delay and is not a production speed benchmark. All tracked 3D asset files remain unchanged.

Current executable results are in ignored `.ai/local/release-all/ui-*.log` and `.ai/local/acceptance/ui-performance.json`. Browser evidence uses real local 3D files, synthetic unauthenticated API states and Chromium software WebGL; it does not certify live Google, personal exports, physical devices, medical correctness or production latency.

Production promotion remains fail-closed pending exact-candidate acceptance and measured cost evidence. The previous candidate timed out loading the full interior on CI; the new local full-body test passed, and the final commit must still receive fresh CI evidence. A focused heart-only pass does not replace that criterion. Rollback is the scoped code revert followed by the existing verified deployment path, with no data migration.

Token usage and actual billed cost: unavailable. Memory candidates: None.

## Quality gates

Compilation, unit/integration tests, static analysis, API compatibility, private-data boundaries, failure/cancellation review, diff review, responsive UI/motion and product-language review: PASSED locally. Applicable profiles: universal, TypeScript/JavaScript, web, frontend HTML/CSS, concurrency/memory, animation/motion, visual design and product content. Architecture/public contract unchanged; no migration. SEO metadata and clinical claims unchanged. No telemetry or endpoint logging added. Optional-index validator limitation remains DEGRADED as permitted by AGENTS.md. Full production readiness: NOT_READY pending exact-candidate CI and external acceptance/cost evidence.
