# Free anatomy integrated preview

This feature belongs to the existing HumanScope application in `apps/web`; it is not a separate product. Open the existing development app, then **Khám phá → Mô hình tham khảo · Xem thử**. The child route is `/kham-pha/mo-hinh-tham-khao`; the breadcrumb returns to `/`. The navigation entry works on desktop and mobile. The existing shared header, dependencies and design language are reused.

## Candidate and provenance

- Source: [BodyParts3D download](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), original `partof_BP3D_4.0_obj_99.zip`.
- [Official license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html): CC BY 4.0, changed February 27, 2025. Retain legacy OBJ header notices alongside the official current license. This records provenance, not legal certification.
- Do not assume all Z-Anatomy assets have the same commercial permission: its repository attribution lists some NC sources.
- Selected heart, lungs' vessels/bronchi and rib cage: 404 source parts, 411,662 triangles.
- Candidate: `.ai/local/free-anatomy/review-v2/candidate.glb`, 9,145,964 bytes, SHA-256 `595e110ff1bbb6b03400d31584abcfc3584f77b11cacc452f3a02bea6b3d106a`.
- Source archive is the 99% reduced polygon set. Vertex deduplication reduced converted GLB from 29,643,572 to 9,145,964 bytes without reducing triangles further.
- Adult male reference; exact age unknown. No age variants, no validated aging interpolation, no outer lung surface. Illustrative colors. Fine anatomical accuracy and directional labels are not clinically validated.

## Reproduce locally

Source files and downloaded archive are retained under `.ai/local/free-anatomy/source`; inventory, original selected OBJ and attribution are under `review-v2`. These ignored files are not automatically available in a new checkout. Given the downloaded archive and mappings:

```sh
python3 scripts/free-anatomy/prepare.py --source .ai/local/free-anatomy/source --output .ai/local/free-anatomy/review-v2
node scripts/free-anatomy/convert.mjs .ai/local/free-anatomy/review-v2
```

Preparation deliberately refuses an existing output directory. Review existing artifacts before choosing a fresh directory. If conversion output differs, review its inventory and update the pinned candidate only after approval. The standalone preview scripts are conversion QA tooling; the user-facing deliverable is the existing Next application. The temporary standalone server has been stopped.

## Publication and rollback

Both page and asset route require `NODE_ENV=development`. Production and other environments return 404, and the entry link is hidden. Asset loading checks fixed byte size and digest, prohibits external GLTF resources, supports cancellation, a 30-second download timeout and retry, and disposes Three resources on unmount. No database, credentials, provider or deployment changes. Rollback removes the additive route/component/export and Explorer link; preserve other sessions' changes.

## Validation, September 30, 2026

- Python geometry/archive tests: 4 passed.
- Vitest environment and invalid-asset boundary tests: 9 passed.
- Scoped ESLint: passed.
- Anatomy viewer and web TypeScript checks, root `tsc --noEmit`: passed after the concurrent session corrected its transient pathophysiology error.
- Browser at existing dev server 4191: Explorer entry, route rendering, all layers hidden message, keyboard checkbox toggle, rotation, zoom, reset, breadcrumb back and mobile entry passed. Mobile width/scrollWidth both 390. Screenshots in `evidence/`.
- Loading/disabled state observed. Missing, oversized and digest-mismatch assets tested at handler level. Browser-level offline/retry, WebGL loss, screen-reader speech and text scaling: NOT TESTED.
- Full production build, clinical review, multi-age models and release acceptance: NOT TESTED / NOT READY.

## Review cycles

1. Found mobile navigation hidden by existing `.workspace-account` and `.quiet-link` rules; moved the entry to the heading and explicitly kept it visible with a 44px target. Found unbounded waiting on asset download; added timeout. Corrected misleading lung coverage to vessels/bronchi. Optimized excessive converted payload with matching triangle counts.
2. Rechecked changed sources, 13 focused tests, ESLint, type checks and browser flow. Technical integration works within tested scope. Overall review remains BLOCKED for incomplete age-model acceptance, medical/quality evidence and untested recovery/accessibility states; do not describe this as a finished age-aware or production-ready feature.

Repository intelligence is DEGRADED: refresh attempted once; CocoIndex log permissions prevented full refresh. Source and available queries were used. Approval validator expects READY despite repository permission to continue DEGRADED; no false READY recorded. Runtime CLI `ai-agent-kit` is unavailable on PATH; no ledger receipt is claimed. This report is the fail-open manual record.

## Completion report

Completed: free source evaluation, bounded conversion, attribution, same-project integration, desktop/mobile entry and scoped checks. Remaining: source assets for multiple ages and validated mapping, expert anatomical review, remaining recovery/accessibility tests and release gates. No numeric progress weights were configured; weighted progress unavailable. Worktree contains pre-existing untracked/modified work from several sessions; no commit/push/deploy performed. HEAD at review: `8a749e7881f8808473a7fc88a51ff81154aadd50`; source hashes bound this review to the dirty worktree.

Production readiness: **NOT_READY**. Final review: **BLOCKED**. Token usage: Unavailable. Actual billed cost: Unavailable. No paid asset/provider was purchased. Memory candidates: None.
