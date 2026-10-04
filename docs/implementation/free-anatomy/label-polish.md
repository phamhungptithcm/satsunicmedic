# Label visual polish

User explicitly rejects current selection badge appearance. Scoped plan: modify only shared StructureInfo markup/CSS; remove status dot, reduce visual icon weight, eliminate oversized outer focus ring while retaining a high-contrast keyboard-only focus around the icon and44px hit areas; tighten typography and shadows. Existing selection/details semantics, links and data remain. Current source read; intelligence gate remains DEGRADED (prior failed refresh). Verify live closed/open/focused state and narrow layout. Preserve concurrent work.

Review cycle1: removed status dot and bulky focus border; replaced with small inset icon focus treatment. Kept native details, source links, Escape behavior and readable labels. Cycle2: current browser closed/focused/open Tim state verified; scoped ESLint and web TypeScript passed. No new blocking finding in this low-impact presentation scope. No tests added for CSS-only behavior.

Product content: visible/accessible wording unchanged; Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft and Delight PASSED within unchanged content and observed keyboard/visual scope. Fine typography, gentle shadow and restrained180–200ms entry; reduced-motion remains. No source or clinical semantics changed. Close target40x44 and details44x44; keyboard focus retained with2px ring, not removed. Shared CSS applies across all StructureInfo consumers, avoiding screen-specific overrides.

Final implementation review PASSED for label polish only. Production readiness unchanged NOT_READY. Gate DEGRADED and runtime CLI unavailable; manual report only. Token usage/cost Unavailable. Memory candidates None. No commit/push/deploy. Screenshot evidence label-polish.png.
