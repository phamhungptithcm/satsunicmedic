# AC-01 muscle visibility refinement

Within approved discovery hide/show scope and current explicit request: add “Ẩn cơ” / “Hiện cơ” under display layers when inside. Low-risk reversible scene operation. Use source group FMA5022; no invented classification or geometry change. Add/remove only muscle IDs in hidden, preserve other hidden IDs, opacity, scope, selection and camera; commit through existing undo/redo. Showing respects current scope and other visibility settings. Individual inspect may reveal selected muscle by existing design.

Files: body-explorer-ux.ts helper; full-body-anatomy.tsx control; body-explorer-ux.test.ts regression; AC-01 report. Verify membership, unrelated hiding preservation, undo/redo and browser control/selected state. No dependencies, backend, persistence, deployment or assets.
