# Product Content Review — BRAND-01 v2

## Scope, context and evidence

SatsunicMec navbar, home-link accessible name, about link and browser title/favicon. Audience: Vietnamese-speaking users exploring anatomy/learning pages. Task: identify the product and navigate home. Web platform using native links, responsive navigation, keyboard focus, decorative image with empty alt. Reviewer: Codex, 2026-10-02 UTC. Apple-specific compliance is not claimed; human-interface principles used as a quality reference.

User confirmed the exact name SatsunicMec and approved implementation. Current Header, SiteShell, layout metadata, installed Next metadata docs and CSS are the behavior sources. Real local browser evidence: output/playwright/brand-01/browser-results.json, desktop.png, mobile-320.png, mobile-390.png, mobile-768.png, mobile-account-fixture.png, zoom-200.png, favicon-sizes.png. Screenshots inspected at desktop and 320px, and favicon sizes inspected on light/dark proxy backgrounds. The root and Học tập title template were verified. Footer/account/about content outside the navbar still uses HumanScope by explicit scope; this is not a global rename.

## Content inventory

| Location | Previous | Current | Meaning and action |
| --- | --- | --- | --- |
| Navbar wordmark | HumanScope | SatsunicMec | User-approved product identity; home destination remains / |
| Navbar accessible name | HumanScope — trang khám phá | SatsunicMec — trang khám phá | Visible name included; announces home destination |
| Desktop/mobile about link | Về HumanScope | Về SatsunicMec | Same /gioi-thieu destination |
| Root title | HumanScope — Khám phá cơ thể người | SatsunicMec — Khám phá cơ thể người | Product name only changed |
| Nested title template | %s · HumanScope | %s · SatsunicMec | Keeps page identity and product suffix |
| Decorative logo | Hidden Layers3 SVG | Empty-alt local S SVG | Does not duplicate the link name |

## State coverage

Default, mobile, signed-out and signed-in header presentation PASSED; signed-in is explicitly a local intercepted response fixture, not live authentication evidence. Focus and activation PASSED: visible outline, keyboard Enter home, Escape menu focus restoration, home closes mobile menu, persistent header across navigation. Hover keeps readable text under existing global link styling (source review). Logo/wordmark introduce no pending, disabled, empty, success, error, offline, partial, destructive or permission messaging; those state-copy checks are NOT_APPLICABLE. Failure of the image does not remove the text or link accessible name (source review).

## Data semantics

NOT_APPLICABLE: no metric, medical claim, unit, user data, authorization decision or data mapping changed. Static asset is local and contains only svg/rect/path elements; no scripts or external references. No new permissions, claims or persistence.

## Mandatory Human Interface Principles

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Product name remains visible; descriptive home accessible name |
| Agency | PASSED | Same links, keyboard navigation and menu close behavior verified |
| Responsibility | PASSED | No medical guarantees or new claims; fixture boundaries disclosed |
| Familiarity | PASSED | User-confirmed name and existing web home/navigation conventions |
| Flexibility | PASSED | 320/390/768/981/1150/1440px, 44px link, 720px reflow proxy and keyboard checks |
| Simplicity | PASSED | One S mark and one wordmark; no added tagline or instructions |
| Craft | PASSED | Square 30/36px asset, scoped styles, matching favicon, actual screenshots |
| Delight | PASSED | Legible compact identity, no new animation/interruption or delayed navigation |

## Platform fit and pattern checks

PASSED for web platform, writing/labels, terminology within changed surfaces, accessibility scope, concise natural tone, meaning/behavior, audience, state coverage, privacy and in-context verification. English brand spelling is intentionally retained within Vietnamese interface copy. Responsive and zoom-reflow proxy checks cover text fit. Human-interface gate PASSED for this scoped change. Permissions, onboarding, alerts, data-format localization and RTL-specific changes NOT_APPLICABLE; no such flows added. No new motion. Existing browser link semantics and focus styles retained.

## Verification limitations

No live sign-in, screen-reader session, native browser-chrome tab screenshot, Safari/Firefox run, or literal browser 200% menu zoom captured. The 200% check is explicitly a 720-CSS-pixel reflow proxy for a 1440px viewport. SVG request/metadata and 16/24/32px browser rendering on light/dark backgrounds passed. Production build/deployment not performed. These are local scoped checks, not whole-product accessibility or release certification.

## Decision

Product Language Gate: PASSED for approved navbar/tab scope. No owner decision remains for this implementation. Complete product-wide rename is deferred under the approved exclusions.
