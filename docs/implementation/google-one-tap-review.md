# AUTH-ONE-TAP-01 — local implementation review

Approved by human “approved” after google-one-tap-plan.md. Commit/push/release remain on hold. No provider setting or production resource changed.

Implemented: single root GIS component with FedCM, explicit account selection, confirmed anonymous-only eligibility, once-per-mount prompt, manual-dialog cancellation, stale callbacks aborted, shared popup/credential exchange lock, memory-only Firebase auth and existing CSRF/session verification. Signed-out header CTA removed; authenticated account entry and contextual/manual account login retained. Logout and revoke-all suppress One Tap even if browser storage is unavailable. Explorer/account shells react to server-session changes.

Current provider metadata readback: satsunicmedic Google provider enabled; public OAuth client 108608537442-7t36jpp5122p4g8rgr1illo0c8amh4av.apps.googleusercontent.com. First read failed without quota project; retry with satsunicmedic quota project succeeded. Only name/enabled/clientId fields requested; no client secret read or printed. Build arguments wired through existing Cloud Build/Docker path; sample local configuration remains off, Emulator explicitly excluded.

CSP adds exact GIS frame/connect/style paths, nonce and strict-dynamic retained. Referrer policy uses strict-origin-when-cross-origin per Google setup guidance. No API permission, data schema, persistence or dependency changes. Sources: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid and approved source comparison with HunpeoLabs.

Verification: 30 focused tests across five files passed. Tests include invalid/oversize credential, Firebase credential exchange versus popup, server receiving Firebase token, provider rejection, CSRF ordering, concurrent attempt guard, cancellation and cleanup, logout suppression with blocked storage. Initial module mock failed to intercept dynamic Firebase imports; changed to a typed injectable SDK loader and reran both exchange cases successfully. Typecheck and lint passed; optimized build passed before final provider-error catch and SDK test seam. Final web typecheck rerun recorded separately. No claim that mocked Firebase results are live OAuth.

Browser: localhost4185 learning page rendered without standalone login CTA (header.png). API was unavailable in this local browser run; existing error state visible. One Tap is not configured/enabled in that local process; actual GIS prompt, all lifecycle UI states, mobile Google/FedCM, domain origin allowlist and successful real-account server cookie NOT VERIFIED. This blocks end-to-end acceptance. Do not release based only on source/tests.

Review cycle 1 identified stale explorer/account auth state after root login; fixed with auth-change listeners. Added best-effort provider cleanup so failed GIS cleanup cannot make completed server logout appear failed. Review cycle 2 rechecked token boundaries, source allowlist, prompt cancellation, state updates, config wiring and test results; no additional defect identified within that scope. Final review BLOCKED on live/provider and full product-state evidence. Repository intelligence DEGRADED from stale indexes. HEAD remains 8a749e7881f8808473a7fc88a51ff81154aadd50 with substantial pre-existing untracked WIP; hashes.json identifies inspected candidate files.

Rollout: before enablement verify OAuth JavaScript origins match actual deployed site, build with project Firebase public config and Google client ID, complete Google/Firebase/server-cookie browser flow and logout/reload. Rollback disable One Tap AND restore prior header CTA; contextual login remains available meanwhile. No production deployment performed.

Tokens/cost: Unavailable. Memory candidates: None.
