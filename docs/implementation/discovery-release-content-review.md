# Discovery release — product content review

Scope: explicit production exposure of existing full-body atlas, reference geometry and qualitative disease illustrations. Audience: Vietnamese discovery/learning visitors. No new clinical guarantee, diagnostic output, treatment recommendation, certification or patient-specific data. Existing copy retained. BRAND-01 v2 separately changes navbar/title/favicon to SatsunicMec; other HumanScope surfaces remain by that owner's scope.

Evidence: `output/playwright/discovery-release/results.txt` (12 local Chromium checks), desktop/illustration/mobile screenshots; `output/playwright/brand-01` (20 scoped checks and screenshots); NAV-01 33 checks and HS-UX-CLEAN-1 22 checks. Local discovery browser uses frozen pre-brand source; brand evidence is the owner's current component review. Final live readback validates the integrated candidate. This is web quality, not native Apple HIG compliance. Physical devices and screen-reader acceptance deferred by owner.

## Inventory and states

| Surface/state | Existing displayed meaning and evidence |
| --- | --- |
| Home/default | “Cơ thể người, từ toàn cảnh đến chi tiết.” Search, body region and structure controls retain their actual effects. Desktop loaded model visually inspected. |
| Attribution/limitations | Expanded source disclosure identifies BodyParts3D, adult male, simplified geometry, illustrative color and translation limitations, CC BY 4.0. Corpus carries attribution/source/license and derived-work disclosure. |
| Loading | Mobile screenshot captures actual model loading text; no assertion that loading is completion. |
| Learning/empty | Published exercises absent is distinct from missing anatomy. Existing explanatory empty-state links retained. |
| Learning/private | Browser fixtures verify 401 sign-in message, empty review queue, partial warning, 503 retry, pending request clearing on account transition. Fixtures are local only. |
| Illustration/default | Catalog has 27 topics and 3 illustrative simulations, not 27 full motion models. Opening a topic then “Mở mô phỏng 3D” is required. |
| Illustration/time | Rendered “Tiến trình minh họa · Không phải thời gian diễn tiến bệnh thực tế”; particles are qualitative, not measured flow. No genuine cardiac cine enabled. |
| Motion/accessibility | Reduced-motion setting renders static-stage instruction; keyboard focus remains reachable; 390px document does not overflow horizontally. |
| Missing/corrupt assets | 46 asset checks and three corruption tests verify fail-closed delivery. No substitute data or fake ready state. |
| Destructive/payment | Not applicable to discovery delta; existing account capabilities remain disabled where unavailable. |

No strings were rewritten by the discovery gate delta. It changes which existing screens are available. Full user-visible corpus remains in frozen `source/apps/web/src/components` and `source/packages/anatomy-viewer`; exact hashes in candidate manifest. Vietnamese labels support discovery, not certified terminology. Null territory/unknown movement never becomes measured anatomy. No retained raw DICOM or identifiers in image.

## Human Interface principles

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Root opens actual anatomy discovery, not an empty clinical-publication shell. |
| Agency | PASSED | Search, optional source disclosure, stage scrubbing and browser navigation retained. Header/footer identity check passed. |
| Responsibility | PASSED | License attribution, reference disclaimer and qualitative time/flow limits remain visible; no claims of clinical approval. |
| Familiarity | PASSED | Native links/buttons, Vietnamese action labels and persistent web navigation. |
| Flexibility | PASSED | Narrow viewport, keyboard focus, reduced-motion states plus owner's brand viewport tests. Physical AT is deferred, not certified. |
| Simplicity | PASSED | Source details are contextual; no new gate/consent screen for public discovery. |
| Craft | PASSED | Default, waiting, 401, empty, partial, retry and account transition checked in browser; source asset corruption rejected. |
| Delight | PASSED | Stable shell and optional motion keep interaction predictable; reduced-motion preference is respected. |

Platform fit: browser-native controls and responsive web layout; no Apple assets or native-platform convention claims. Terminology consistency is bounded: navbar brand changes while footer remains HumanScope intentionally; full brand unification is future scope. Localization coverage is Vietnamese with retained English source terms; RTL is not a supported locale. Dates in review queue explicitly Vietnam UTC+7, schedule experimental rather than clinical mastery. No currency/payment changes.

Gate: PASSED for the approved discovery exposure with declared local evidence and accepted next-release gaps. Live OAuth, physical devices, screen readers, content/translation specialist review and restoration drill are not claimed. Missing source cine validation remains quarantine, not a deferred public upload.

Final integrated live evidence: `live-browser.txt`, `live-mobile.png`, `live-desktop.png` under output/playwright/discovery-release. Actual model loaded at 390px; no horizontal overflow; SatsunicMec navbar/title, BodyParts3D attribution and disclaimer present. 58/58 live reads include all 46 hash-verified assets.
