# UI and Google sign-in release

Released: 2026-10-01 UTC. URL: https://medic--satsunicmedic.asia-southeast1.hosted.app

Fixed68px navigation with accessible mobile menu, compact workspace hierarchy, icon controls with names, centered Google-only modal, shared Copyright by HunpeoLabs footer and brief motion with reduced-motion CSS. Concurrent user-requested accuracy disclaimer/shared loading preserved; later model-selection WIP excluded by immutable source archive.

Cloud Build c38bb048-75c1-469a-b36f-88234404aa8e SUCCESS. App Hosting ui-google-1 SUCCEEDED. Image sha256:bab94d715711990fbc4a218c3e63293b5dba966f74bacff19bc53eca1fc76f79. Archive sha256:e40ff5d4d1da841fb416e54deebd3761763688e41ca7bd38d985c90f1715a6e2. API revision api-00002-kov ACTIVE. Google enabled with owner-approved support email; email/password disabled (false omitted by protobuf response). Production session endpoint rejects verified non-Google identities before persistence or session mint.

Validation: implementation96unit,23emulatorintegration,lint and TypeScript passed; independent18focusedauth checks passed; cloud web build passed; live HTTP13checks passed. Browser desktop1512px, mobile320/390px no horizontal overflow, centered modal, menuEscape, modalfocusreturn, secondarypage login, real Google account chooser and cancellation/retry verified. Five main pages return200. Preview pages return streamed200 containing Next404 fallback/noindex/unavailable UI; HTTP404 assertions failed, content guards verified. No realaccount sign-in completed. Native browserChrome focus boundary not claimed as in-documentwrap.

Review cycles: initial BLOCKED awaiting browser/content evidence; final PASSED for frozen release after evidence completed. QA persona initially blocked on stale indexes; bounded source/test fallback independently completed under repository DEGRADED policy. Team runtime bookkeeping remains BLOCKED because original persona result could not be replaced; independent QA/report evidence is retained, not relabeled. Other tasks continue changing this shared dirtyworktree; later source is not automatically the released candidate.

Limitations: no actual-account session, physical touch device, screenreader, OS reducedmotion runtime, offline injection or loaded3D FPS test. Models/clinical publication remain unavailable; fullmedicalproduct NOT_READY. Functions deployment returned nonzero only after successfuldeployment due missing artifact cleanup policy; ACTIVE revision independently confirmed. No cleanup applied without retention decision. No new always-on compute; min0/max1 preserved. Billedcost and tokens unavailable; no zero-cost claim. Memory candidates None.

Evidence: .ai/local/ui-web-build-result.json, ui-rollout-state.json, ui-api-state.json, ui-auth-final.json, ui-browser-live.json, ui-live-smoke.json, ui-page-smoke.json, ui-independent-review.json, ui-production.png. Content review: docs/implementation/ui-google-product-content-review.md. Runtime report: .ai/local/ui-task-report.txt.

Rollback: re-roll App Hosting previous firebase-release-2 image and previous API source together; the prior passwordform requires restoring emailprovider too. Prefer forwardfix to avoid mismatched oldform/newGoogle-only backend. No schema migration or user data deletion occurred.
