# AC-01 muscle visibility — 2026-10-02

Complete: “Ẩn cơ” / “Hiện cơ” in Lớp hiển thị when viewing Bên trong, including mobile Công cụ. Uses FMA5022 source membership; alters only scene.hidden; preserves other hidden structures, opacity, selection, isolation, camera and scope. Existing navigation/inspect can intentionally reveal structures again. Not a persistent global preference and does not change the source atlas.

Plan/approval: anatomy-completeness-muscle-plan.md; existing AC-01 B approval plus explicit current user request. Intelligence initially stale, refreshed once; graph and semantic scope checked. Three code/test files changed, no asset/backend/API/dependency changes. Existing WIP preserved.

Validation: 24 body-explorer-ux tests pass, including two new regression cases for membership, unrelated hidden parts, idempotence, immutability, selection/isolation and undo/redo. Web TypeScript and scoped ESLint pass. Chrome 1440×1000 toggles hidden=true then restored=false; 390×844 mobile tools with keyboard Enter sets hidden=true, no document horizontal overflow. Screenshots `/tmp/anatomy-hide-muscles.png` and `/tmp/anatomy-hide-muscles-mobile.png`. Renderer membership verified through sceneSourceIds tests, not claimed as a clinical geometry audit. Existing local /api/v1/me 500 remains outside scope.

## Product content review

Surface: Vietnamese responsive web, existing native button/text-button pattern. Audience: anatomy explorer. Inventory: “Ẩn cơ” describes hiding source muscle group; “Hiện cơ” removes that hide constraint, respecting other opacity/scope settings. aria-pressed announces hidden-group state. Visible only in inside mode with available source membership. No new loading/error paths or network calls; existing stage loading/retry preserved. No persistence, destructive action, private data or permission change. Unknown whole-body completeness remains unchanged.

| Principle | Result | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Direct muscle visibility option beside display layers. |
| Agency | PASSED | Toggle back and existing undo/redo; unrelated hidden parts preserved by tests. |
| Responsibility | PASSED | Uses source group only; no new anatomical completeness claim. |
| Familiarity | PASSED | Native web button, short Vietnamese verb/object. |
| Flexibility | PASSED | Desktop/mobile layouts and keyboard Enter exercised. |
| Simplicity | PASSED | Single toggle, no extra dialog. |
| Craft | PASSED | State label and pressed state match action, existing styles and history reused. |
| Delight | PASSED | Immediate reversible action without interruption. |

Language gate PASSED in local browser scope: natural labels, meaning/state matching, platform fit, accessibility structure, concise content, terminology and current in-context evidence. No Apple-only controls; native Apple HIG not applicable. Strings are short and wrap using existing styles. Screen-reader speech/physical mobile not tested; no accessibility certification claimed.

## Final implementation review

Browser setup note: first mobile attempt timed out before inside mode was established; explicitly choosing Bên trong then rerunning passed.

One fresh cycle PASSED: approved requirement, security/privacy, correct source membership, immutable state, repeated toggle, history, error paths, resource behavior, compatibility, product language, web layout and trade-offs reviewed. No actionable finding in scoped checks. TypeScript/React client web profiles, universal, frontend HTML/CSS, visual design and product content apply. Source-only group count remains a limitation. No DB, migration, API, observability, deployment, SEO or new motion changes (NOT_APPLICABLE). Production build and live release NOT_RUN; dev compilation/typecheck and local browser are the applicable evidence. Production readiness NOT_READY/not evaluated for release. No commit/push/deploy.

Acceptance: requested local option and reversible behavior complete. Runtime CLI unavailable, report fallback. Token usage and actual/API-equivalent cost: Unavailable. Memory candidates: None.
