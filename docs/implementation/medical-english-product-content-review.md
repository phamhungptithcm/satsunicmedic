# Product Content Review — MED-EN-1

Decision: **PASSED for local preview UX**, reviewed 2026-10-01 by Codex against `.ai/local/med-en-1/candidate.json`. This is not medical/editorial publication approval.

## Scope and context

Responsive web, Vietnamese-first beginner learning with English terminology. Existing HumanScope colors, cards, native buttons/details/radios/selects. Apple component rules are not applicable; the eight human-interface principles are used as a quality reference. No Apple-only conventions introduced.

Verified: 22 terms, 14 selectable structure mappings, three coronary lessons; bilingual decks contain 7/4/4 questions. Current source and browser behavior agree. Beginner audience is an assumption, not user research. Qualified bilingual clinical review remains unknown and is explicitly disclosed in the UI. General/public Explorer does not receive draft vocabulary.

## Complete content inventory

The exact term/example/translation/source strings are inventoried in `apps/web/src/lib/medical-english-data.ts` (all 22 records); question strings in `medical-english-quiz.ts`. These source inventories are supported by rendered evidence below, not used alone as a pass.

| Location / states | Content or change | User job / evidence |
|---|---|---|
| MedicalEnglish default | ANH–VIỆT Y KHOA; Nhìn hình, nhớ từ; context naming the visible stage or selected structure | Connect term to current observation; desktop and mobile images |
| Toggle shown/hidden/focus | Ẩn nghĩa Việt / Hiện nghĩa Việt; aria-pressed | Recall voluntarily; meaning and translated example removed while hidden; keyboard Enter verified |
| All 22 term records | English name, Vietnamese equivalent, concise meaning, English example and translated example | Learn in context; English headings/examples marked lang=en; no invented phonetics/audio |
| Example and source | Câu trong ngữ cảnh; Nguồn thuật ngữ + accessible source title | Understand sentence and inspect origin |
| Model control ready/loading/error | Chọn trên mô hình, disabled while not ready | Return to selected real binding; no invented target |
| Partial/empty vocabulary | Chưa có từ vựng song ngữ cho phần này. Bạn vẫn có thể đọc giải thích tiếng Việt của bài. | Explicit unavailable state; resolver unit checks and source inspection; not encountered in complete shipped preview data |
| Draft note | Bản học thử · Bản dịch chưa được chuyên gia y khoa duyệt. Các giới hạn của mô hình vẫn áp dụng. | Explain review boundary, retained when meanings are hidden |
| StructureInfo default/open | Optional English subtitle; example pair, Nguồn thuật ngữ ↗, draft note | Keep exact combined lung/bronchi and ventricular-wall meaning; reference screenshot and keyboard checks |
| Quiz disclosure | Thử nhớ từ · N câu Anh–Việt | Optional practice with actual question count |
| Quiz heading/direction | ÔN TẬP ANH–VIỆT; Nhớ từ trong ngữ cảnh; Anh → Việt / Việt → Anh | Distinguish this deck from mechanism quiz |
| Quiz prompt/options | Two instruction sentences plus lang-tagged term/options | One unambiguous translated match, no clinical diagnosis question |
| Quiz feedback/results/reset | Reuses existing confirm, feedback, sources, observe, result and reset strings | Correct answer revealed only after confirm; independent score; observation disabled on model failure |

## State coverage and semantics

Default, focus, toggled, selected, disabled, confirmed, result and reset: browser PASS. Model failure and recovery: fault-injected asset request, PASS. Loading: existing loading overlay/ready state; new model controls depend on ready. Offline after load: no new data fetch is needed; network/offline recovery of the whole app was not assessed. Partial unknown IDs and empty data: unit PASS, fallback wording source-reviewed. No success claim for missing translations. Unauthorized/forbidden, destructive operations, pricing, units, timezones and notifications: NOT_APPLICABLE to this static learning feature. Existing publication/auth gates are preserved.

The quiz score counts confirmed correct answers for the current independent deck. Zero means none confirmed correctly; it is not competence certification. State lives in the current component view, resets on restart/unmount. No new storage, analytics, account data or external requests. Source links open only on user action. The reference right/left pulmonary entries describe grouped vessels and bronchi, not whole lung surfaces; model limitations remain visible separately.

## Mandatory principles

| Principle | Status | Current evidence |
|---|---|---|
| Purpose | PASSED | Terms change with stage/selected structure; three-lesson browser assertions |
| Agency | PASSED | Optional quiz, reversible meaning toggle, answer confirmation, restart |
| Responsibility | PASSED | Term sources and unreviewed-translation disclosure; model failure disables unavailable actions |
| Familiarity | PASSED | Vietnamese instructions, existing native web controls and existing quiz patterns |
| Flexibility | PASSED | 390px reflow; keyboard reveal/submit; reduced-motion scene navigation; English lang attributes |
| Simplicity | PASSED | Two terms per stage, one selected structure, collapsed independent practice |
| Craft | PASSED | Comparison uses baseline vocabulary, grouped labels preserved, quiz/reset/failure/retry verified |
| Delight | PASSED | Learner can reveal meanings at own pace and revisit imagery; no timer, pressure or exaggerated praise |

## Platform and pattern checks

Web fit PASSED. Existing design tokens/patterns retained. Labels match actions; feedback appears after explicit confirmation without unsolicited dialogs. Context help is inline. Privacy/account/permission changes NOT_APPLICABLE. Vietnamese/English mixed content is language-tagged for terms/examples/prompts/options; no RTL locale is offered by this change. Keyboard and accessibility-tree evidence passed; spoken VoiceOver/NVDA was NOT TESTED. CSS zoom 200% is a text-scaling proxy, not a claim of native browser zoom certification. Existing global header clips in that proxy; changed vocabulary cards wrap and remain usable. Real 390px viewport has no horizontal overflow.

## Evidence and gate results

All eight principles, target platform, meaning/behavior, audience assumption handling, natural tone, brevity, action/state coverage, privacy/data semantics, terminology, scoped keyboard/accessibility-tree checks, text wrapping and in-context verification: PASSED for this preview change.

- `output/playwright/med-en-1/desktop.png`: stage/structure side-by-side.
- `mobile-terms.png`, `mobile-quiz.png`: 390×844 content and practice.
- `zoom-200.png`: CSS 200% scaling proxy.
- `reference-mobile.png`: combined-structure name, example and keyboard focus.
- `model-error.png`: learning persists through model-load failure (paired with executed disabled/recovery assertions).
- `.ai/local/med-en-1/tests-all.log`: 148 unit tests.
- Playwright asserted both language directions, 7/7 results, answer locking, separate scores, restart, all three lessons, comparison, reduced motion, model failure/retry, reference selection and Escape.

No clinical correctness certification or multilingual expert sign-off is claimed. Clinical review is required before publication. No owner decision is needed for the completed local implementation scope.
