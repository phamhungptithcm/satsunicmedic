# Product Content Review — HS-ACCOUNT-UX-1

## Scope

- Surface: 8 account settings screens, sign-in, upgrade, checkout result, account-deletion steps and dialogs.
- Files: `index.html`, `style.css`, `app.js`; runtime inventory `evidence/content-inventory.json` for 8 main screens. Additional dialog and state inventory below.
- Audience: Vietnamese learners managing their own account, plan and data.
- Target: responsive web. Existing HumanScope tokens; native links, buttons, select, forms and dialog. Apple-only component conventions/HIG compliance: NOT_APPLICABLE; human-interface principles used as quality reference.
- Reviewer: Codex self-review, 2026-10-01. No independent agent or human approval claimed.

## Context and evidence

Verified: Google login UI; server has logout/revoke-all but no complete account profile/settings/billing APIs. Owner chose19.99USD/year annual-only. Prototype has no backend fetch or third-party SDK; fixtures are explicitly identified. Store approval, subscription rights and deletion retention are not known.

Assumptions: proposed study role, preference persistence, session metadata, annual renewal policy and retain/export data behavior require backend approval. No real avatar, email, receipt, medical outcome or paid entitlement is asserted. Names and example.com email are synthetic.

## Inventory and states

Runtime inventory records all rendered main-screen copy; `app.js` is complete authoritative prototype string source, not a live locale catalog.

| Surface | States / language | Behavior evidence |
| --- | --- | --- |
| Global chrome | Design-only banner, state selector, account nav, mobile selector, logout | Screenshots and DOM snapshots |
| Profile | Visible field labels, read-only Google email, name validation, save prototype, reset, unsaved navigation confirm | Empty name → alert/input focus; save → scoped status; mobile change-page → confirm |
| Security | Linked Google, current/other synthetic sessions, revoke-one/all, recent identity verification | No password fields, native confirm dialogs; source identity requires recent token |
| Preferences | Vietnamese-only disabled language, timezone, reminders, email opt-in, reduced motion | Labelled native selects/checkboxes; values in memory only |
| Plan | Free/active/cancelled/past_due/expired/pending; one annual price, proposed features, not for sale | State picker; cancelled date retained after mock action |
| Billing | No transactions vs pending; synthetic receipt; unavailable portal | Free empty state; clearly synthetic19.99USD/0tax example |
| Privacy | Export sample, read private data, start deletion | JSON blob contains synthetic data, no server request |
| Support | Account mismatch, pending, cancel vs refund, unavailable contact channel | No fabricated email/SLA; no request for sensitive content |
| Sign-in | Continue with Google; account mock only | Mock transition, no auth token |
| Upgrade | Annual total, recurring term, tax qualifier, checkout disabled | No card form or buy action |
| Result | No transaction, pending, confirmed fixture | Check action never grants Pro |
| Delete | Checklist → reauth preview → explicit final confirm → request pending | Native dialog; no deletion; no claim of completion |
| General | Loading, recoverable error, offline, session expired | All five page states browser-exercised |

## Data semantics

- 19,99 USD/year is annual price, not monthly. No misleading monthly purchase option or discount.
- Fixture receipt explicitly assumes zero tax; zero is not used for unknown actual tax.
- Dates are fixtures; fixed UTC+7 timestamps are marked. Preferences do not yet reformat them; production requirement is in README.
- Pending ≠ successful purchase. Cancelled renewal ≠ expired access. Deletion request pending ≠ data erased. Empty billing ≠ failed fetch.
- Profile and preferences saves state explicitly say prototype/RAM. No localStorage of private data. No payment credentials.

## Mandatory Human Interface Principles — disclosed prototype scope

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | One H1 per view; overview routes to account jobs, no unrelated marketing chart |
| Agency | PASSED | No forced checkout; cancel controls; Escape; unsaved-data choice; separate privacy actions |
| Responsibility | PASSED | Persistent synthetic-data banner, disabled checkout, no fake live payment/auth/deletion success |
| Familiarity | PASSED | Native web forms, select, links, details and dialog; Google-only mental model |
| Flexibility | PASSED | 320/390/768 plus desktop checks; persistent labels; keyboard Escape/skip; reduced-motion CSS |
| Simplicity | PASSED | Eight task-based destinations; one annual SKU; mobile selector replaces clipped tab rail |
| Craft | PASSED | Empty/error/loading/offline/guest and cancellation/pending copy; form validation and recovery |
| Delight | PASSED | Preserved readable account overview; nonblocking scoped feedback; no decorative motion or coercion |

## Platform and pattern checks

Web conventions and design-system boundary: PASSED in prototype. Focus ring/native dialog semantics: inspected; Escape and skip exercised. No custom Apple controls, protected assets, animation imagery or additional dependencies. Long labels wrap; touch controls min44px. Actual screen-reader speech, full tab traversal, 200% browser zoom and RTL/pseudolocalization have not been fully tested. Vietnamese is the only delivered locale.

## Verification and decisions

- In-context evidence: IAB desktop screenshots and390px screenshots; 24 combinations across320/390/768px have no document overflow. Desktop main routes, negative name validation, draft navigation, mock cancellation, pending recovery and dialog Escape verified.
- Review1 findings: mobile nav cut labels, logout unavailable on narrow layout, missing draft warning, skip link changed route. Fixed and focused checks rerun.
- Review2: no known blocking visual/copy defects in exercised prototype paths; no browser console errors in final capture. This is not complete accessibility certification.
- Meaning / respectful concise tone / state distinctions / current screenshot review / terminology: PASSED for prototype.
- Full accessibility, text expansion/zoom, real API semantics and end-to-end privacy/security: NOT_RUN for production; do not transfer prototype pass to application release.
- **Product Language Gate for production implementation: BLOCKED pending real implementation and full required accessibility/in-context checks.** Design review is available for owner review; no claim of production-ready UI.
- Runtime ledger/review receipt: not produced for design-only artifact. No application/config/tests changed. Production readiness NOT_READY. Token usage and cost Unavailable. Memory candidates None.

## Revision 2 review

Changed copy inventory: overview H1 “Không gian của bạn”, mô tả tài khoản, study-role fixture, membership summary, “Đăng nhập an toàn”, “Quản lý đăng nhập”, “Học theo nhịp của bạn”, “Dữ liệu nằm trong tay bạn”, footer private-notes/help; grouped nav labels; profile description; plan H1/description and annual-price badge. Current rendered evidence: r2-1440-overview/profile/plan screenshots; r2-390-overview and other main-page screenshots; six subscription-state texts in revision2-states.json. app.js remains complete string source.

Purpose: stronger personal-account hierarchy. Agency: all controls retained, no new forced upsell. Responsibility: persistent demo notice, annual-only19.99USD and disabled checkout retained. Familiarity: Google and existing brand icon language, task-grouped web navigation. Flexibility: 32 validated route/width pairs, native forms and keyboard verified. Simplicity: smaller task groups, secondary actions moved to compact rows. Craft: form validation, six plan states and screenshots verified after redesign. Delight: personalized overview and restrained blue membership surface. All eight pass only for the disclosed interactive-prototype scope; production gate remains blocked by the previously listed integration/accessibility evidence gaps.
