# HS-ADS-1 — Approved web advertising integration

Owner instruction 2026-09-30: “approved hiện quảng cáo trên web để thu lợi nhuận từ đây too”. This approves implementing the advertising proposal in HS-ECON-1; publisher identity, approved domain and CMP remain missing. No provider account creation, agreement acceptance or invented revenue.

Impact: web article rendering, configuration, ads.txt, nonce CSP for approved public articles, client ad lifecycle, tests and runbook. No schema/auth/API changes, no auto ads globally, no secret values. Current article publication gate remains authoritative; explicit slug allowlist provides separate ad suitability review. Anonymous users only until paid entitlement is implemented. Missing configuration/consent fails closed. No generic consent dialog pretending to be a Google-certified CMP.

Implementation: validate IDs and exact slug allowlist; server ad eligibility checks article published/reviewed, session absent and query absent. Ad component subscribes to an already integrated certified TCF CMP, strictly requires explicit purpose/vendor consent and denies on failure/unknown. Load AdSense once with nonce only after consent. Full-document links on advertising article prevent SDK surviving Next soft-navigation into private surfaces. Disable runtime ads on denied consent and reload to clear third-party runtime. ads.txt generated only for valid configured publisher. CSP expanded only for explicitly eligible ad article; real creative compatibility must be verified with actual account, no global CSP weakening.

Validation: config/eligibility/consent/nonce CSP unit negatives, typecheck/lint/build, rendered disabled state and ads.txt. No real ad clicks, fake publisher IDs in deployment or fabricated fills. Live network/ad/CMP and paid-account exclusion require acceptance before enabling switch.

Repository intelligence DEGRADED: optional indexes missing; bounded source, tests, compiler. Approved paths from HS-IMPLEMENT-1 plus explicit current advertising approval. Risk HIGH due third-party tracking. Current plan is concrete implementation of prior approved advertising scope; no repeated approval required for local code.
