# UI polish and Google-only sign-in — approved requested scope

Owner request: fixed, easier navigation; Google account sign-in only; footer copyright by HunpeoLabs; cleaner workspace, appropriate icons and smooth accessible animation. Prior release authorization remains applicable. This plan makes that requested change concrete; no model/content publishing or data deletion.

Intelligence: DEGRADED, stale indexes; current Header/Login/Explorer/global styles, layout, API session route and existing deployment evidence read directly. Next16/React19/TypeScript6, Firebase12/Admin14, Nest12. Preserve all unrelated anatomy/pathophysiology work.

- Header: fixed top, compensated document spacing and anchor offset, responsive navigation with current-page indicator, accessible mobile disclosure and 44px actions. Keep labels for major destinations. Existing fullDocument prop preserved.
- Login: remove email/password form; Google popup initiated directly by user gesture after preloading SDK. Handle popup closed/blocked/network errors, retry and focus return; Firebase token exchanged for existing secure server session. Never persist provider tokens. Enforce Google provider on production session creation; keep emulator fixtures explicit.
- Footer: shared layout footer, exact Copyright by HunpeoLabs attribution, working About/Privacy links, no invented legal claims.
- Workspace: tighter heading, balanced sidebars and larger useful canvas area, grouped controls, icon+tooltip+accessible name for standard actions. Keep orientation labels and organ names; preserve unavailable-model semantics and existing viewer state.
- Motion: short opacity/transform transitions, no layout animation or continuous decorative loops; reduced-motion support; no claims of GPU/model performance without a model.
- Tests: TypeScript/lint/unit; auth provider rejection test; desktop/mobile/keyboard/navigation/dialog/empty state/reduced motion browser checks. Build and deploy immutable web image plus API if changed, readback and smoke; Google provider config verified without printing credentials. User performs any actual Google account chooser/consent/passkey.

Risks: fixed header obscuring focus, mobile overflow, focus/scroll locking, popup blockers, provider configuration or authorized-domain mismatch. Roll back AppHosting revision/API revision; preserve Firestore.

Primary files: apps/web/src/components/header.tsx, login.tsx, explorer.tsx, footer.tsx; apps/web/src/app/layout.tsx, globals.css; apps/api/src/identity.ts/config.ts and focused tests; docs/implementation product-content and verification evidence. No dependency upgrade required.
