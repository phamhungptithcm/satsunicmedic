# AUTH-ONE-TAP-01 — Google One Tap

Status: APPROVED. Human approval: “approved” after this plan was presented. Date: 2026-10-03. Commit/push/release paused by user. No protected implementation changes in this planning pass.

## Evidence and impact

Current Header renders a separate login button; Login opens Firebase popup. google-sign-in.ts exchanges a verified Firebase ID token through CSRF-protected /auth/session and clears memory-only client authentication. Logout entry points exist in explorer and account shell/security. Existing proxy CSP does not permit GIS frames/connect endpoints. HunpeoLabs reference uses Google Identity Services with FedCM, auto_select:false, Firebase credential exchange, authenticated-session detection and signed-out suppression; it retains a contextual manual fallback.

Repository intelligence DEGRADED: stale indexes, bounded source inspection. HIGH risk authentication integration, CSP and session lifecycle. Prior education/copy approvals do not cover this auth delta. User request establishes desired design; repository requires reviewed plan approval before protected auth edits.

## Proposed behavior

- Public header: no separate “Đăng nhập” button. Keep navigation/menu; show compact account entry after server session is confirmed.
- Anonymous visitors: Google One Tap prompt once when configured and eligible. No forced automatic account selection, repeated prompts or provider prompt while manual login/re-authentication is active.
- Successful One Tap: exchange Google credential via Firebase, then existing CSRF/session endpoint; notify existing subscribers and refresh account state. Never trust decoded client identity or send raw Google credential as Firebase ID token.
- Respect dismiss and sign-out: cancel prompt, suppress for current session after logout and revoke-all; never immediately log the user back in. Manual retry clears suppression only after explicit user action.
- Google may suppress One Tap (browser policy, cooldown, unavailable Google session). Keep contextual Google sign-in at account/private-action screens so notes and classes remain reachable; no duplicate standalone header button. Keep recent-login confirmation required by sensitive account actions.

## File plan

1. New components/google-one-tap.tsx and lib/google-one-tap.ts: typed GIS interface, script lifecycle, eligibility, single shared exchange lock with popup, stale callback cancellation, safe generic errors.
2. lib/google-sign-in.ts: reuse Firebase initialization, memory persistence and verified exchange; retain popup path and cleanup guarantees.
3. app/layout.tsx or site-shell.tsx: mount exactly once across explorer and standard shells, pass nonce for GIS script. components/header.tsx: remove signed-out CTA; keep authenticated entry and mobile menu.
4. components/login.tsx plus account/explorer logout/revoke handlers: coordinate prompt visibility, suppression and session events; preserve explicit recent-auth flows.
5. proxy.ts: exact required Google GIS script/frame/connect/style sources; preserve nonce/strict-dynamic, frame-ancestors and all unrelated controls. Review actual provider CSP requirements before final edits.
6. .env.example and existing web build configuration: optional NEXT_PUBLIC_GOOGLE_CLIENT_ID and one-tap flag. Use satsunicmedic client/origins only, never HunpeoLabs client. Provider client ID is public; no secret access or fabricated value.
7. Focused auth/session/CSP tests, product-content review and runbook.

## Verification and rollout

Test success, invalid credential, cancelled/stale callback, concurrent popup and One Tap, cleanup, signed-in suppression, logout/revoke suppression, missing configuration, script/network failure and manual fallback. Verify desktop/mobile no duplicate login CTA, keyboard fallback, existing session CSRF/provider guards. Run typecheck/lint/auth tests/build, final implementation review. Real Google chooser and completed server session need provider/browser evidence; mocks and Emulator are not live acceptance. Verify deployed origin allowlist before enablement. Rollback by disabling One Tap and restoring prior header CTA together. No DB migration.

Sources: current HunpeoLabs components/google-one-tap.tsx and lib/blog/google-one-tap.ts; Google https://developers.google.com/identity/gsi/web/guides/features ; https://developers.google.com/identity/gsi/web/guides/fedcm-migration ; https://developers.google.com/identity/gsi/web/reference/js-reference .
