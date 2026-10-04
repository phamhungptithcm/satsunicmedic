# AC-01 discovery refinement — 2026-10-02

Within approved AC-01 B and the owner's current request to simplify this sidebar. No new module, data or capability scope. Risk: low, reversible presentation and navigation change.

Observed: five selectors and status/pagination precede results; source mesh counts dominate ordinary browsing. Keep all 3,432 concepts, individual source IDs, unclassified entries, source gaps and hierarchy reachable.

Plan: search first; region/system filters in native disclosure with active summary and reset; technical catalog/classification in advanced disclosure; compact rows retain English names, remove mesh counts from ordinary cards; child navigation beside each row; count above results and pagination below. Keep source limitations and loading/error feedback. Only component/CSS and AC-01 documentation change. Preserve canvas and unrelated WIP.

Validation: TypeScript, ESLint, existing discovery/scene tests; browser wide/narrow, keyboard, search empty/recovery, filters/reset, child/back, paging, source and gaps views; inspect expanded/zoomed text. Review current diff and product language, record evidence and remaining limits. Rollback: restore the two task-local sidebar-before copies, preserving later edits.
