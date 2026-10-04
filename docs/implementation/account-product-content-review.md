# Account integration — product content review

Scope: HS-ACCOUNT-IMPLEMENT-1. HumanScope existing Next application, Vietnamese web UI, personal account management. Source audience: learners already using exploration/library/study; no medical outcomes or Pro entitlement claims inferred. Native web forms, links, select, dialog and keyboard interaction; Apple HIG is a human-centered reference, not a claim of Apple-platform conformance.

## Verified context and inventory

- Existing `Header`, `Login`, `Loading`, root layout/footer and authenticated API client are reused. `/tai-khoan` and all account destinations belong to the same Next application.
- `account-evidence/content-inventory.json` records literal text/labels and source locations. Dynamic display values: owner name and provider email; study-role enum mapping; initials; local-time session timestamps; settings revision used internally, never displayed. No private session ID, cookie digest, password, or location/device inference is displayed.
- Firestore owner settings and Firebase profile are the source of truth. Successful saves follow the PATCH acknowledgement. Unknown email remains unavailable, not an invented address. Session list is capped and discloses truncation.
- Pro price: user-selected 19.99 USD/year, annual only. Current billing connector absent: explicit not open for sale, disabled purchase, no invoice/history or payment success fabricated. Export/deletion unavailable; logout explicitly retains saved data. Future Pro benefits remain undecided and are not promised.
- Test screenshots use disposable synthetic Firebase emulator accounts (`example.test`); not real customers. New profile/preferences API is tested end to end locally. Google live OAuth and Lemon remain NOT TESTED.

## State coverage and interaction evidence

| State | Result | Evidence |
| --- | --- | --- |
| Eight normal pages, selected navigation, responsive | PASSED | `account-evidence/browser-checks.json`: 32 page-width observations at 1440/768/390/320; source labels match observed headings, no horizontal overflow |
| Profile save, pending, durable success, reset | PASSED | Browser edited name, saved, checked disabled save/reset; whitespace normalization regression checked on final build |
| Preferences save and reload | PASSED | Browser selected UTC and reduced motion; both retained after reload |
| Unsaved-change confirmation | PASSED within supported navigation | Browser edited draft, followed shared-header Library link, used Stay then Discard; native dialog traps focus and restores trigger |
| API failure and recovery | PASSED | Own local API stopped: `api-unavailable.png`; restarted, Retry restored account |
| Unauthorized and current logout | PASSED | Browser logout with confirmation returned sign-in gate; API revocation blocks subsequent owner account read |
| Google all-session verification | PASSED for local contract; live OAuth NOT TESTED | Existing provider helper reused; mismatch and successful revocation tested through API emulator; disabled configuration state shown honestly |
| Stale revision and invalid/privileged input | PASSED | API rejects stale update409, absent CSRF403, extra privileged fields400; owner draft retained by catch path |
| Empty/unavailable data and disabled consequential actions | PASSED | Rendered payment/data pages show unavailable wording and disabled purchase/export/delete, not fake zeros or successful deletion |
| Session list partial | PASSED by source review | `sessionsTruncated` notice, no assertion of full device inventory |
| Reduced motion | PASSED | Scoped class disables transitions/animations; preference survives reload; existing system reduced-motion behavior retained |

## Mandatory principles

| Principle | Result | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Each of eight page headings identifies one management task; profile save is the primary action |
| Agency | PASSED | Discard, Stay, logout confirmation, native focus management and public-exploration exit; unsupported purchase cannot be submitted |
| Responsibility | PASSED | Annual USD amount and unavailability visible; private values owner-scoped; no fake receipts, devices or deletion guarantee |
| Familiarity | PASSED | Existing site header/footer and Google login component; normal browser links/selects/forms/dialogs |
| Flexibility | PASSED | Keyboard Enter navigation and form input, four widths including320, long synthetic email wraps, selectable timezone, reduced motion |
| Simplicity | PASSED | Grouped account navigation, one annual Pro option, no payment implementation jargon in normal flow |
| Craft | PASSED | Actual screen inspection, real save/reload/logout/retry, state feedback, readable focus and typed field semantics |
| Delight | PASSED | Familiar blue/neutral HumanScope identity, quiet membership treatment, personal initials and calm error copy without coercive upsell |

## Platform and pattern checks

Writing, control labels, feedback, alerts, onboarding, account privacy, native keyboard/select/dialog behavior and vi-VN date formatting: PASSED for local Chromium evidence. Persistent form labels and polite status region are present. Icons supplement text. Null/unavailable semantics preserved. No automatic notification opt-in, fake urgency or hidden yearly charge. Login/profile/email labels explain what changes and what is managed by Google.

Limitations: no screen-reader device or Safari/Firefox certification, live Google verification, or production provider acceptance. Browser Back within SPA navigation can discard an unsaved form; shared account/header links and hard unload have guards. Only Vietnamese locale is implemented; no RTL claim. New users need a display name before persisting full account settings; the preferences page links to profile when missing. These limitations are disclosed rather than represented as implemented capabilities.

Gate: PASSED for approved local account UI implementation; production release remains NOT_READY pending live auth/environment acceptance. In-context evidence comes from the application build through a local reverse proxy to the real emulator API, not the earlier static4197 prototype.
