# Quiz slides — implementation and product-content review

2026-10-01. Scope: refinement of the three existing coronary lessons, authorized by the user's screenshot and request for more questions, next/previous slides and better visual craft. This is a local development teaching draft. Intelligence DEGRADED (stale CodeGraph/CocoIndex, daemon unavailable); critical consumers verified directly. Self-review only.

## Implementation

15 questions, five per lesson. Existing core question plus four purpose-specific questions: mechanism, discrimination, observation or model literacy. Private server-only bank passes through the already dev-guarded route; public scenario schema unchanged. NHLBI heart-attack causes, coronary-disease causes and angina types rechecked. Clinical claims remain bounded to sources; app-observation claims describe the actual scenario and are identified as such. No new treatment advice or clinical certification.

Quiz is a reusable component with native radio inputs, lettered choices, five-step progress and short slide transition. A selection must be confirmed before proceeding. Confirmed answers are immutable during review; score counts confirmed correct answers once. Previous/step navigation preserves responses. Summary links to every answer with textual correct/revisit status. Restart clears the whole attempt; lesson reset or changing disease also clears it. Contextual observation pauses/seeks the model's corresponding stage. No automatic progression, time limits, persistence, network requests, sounds or account claims. Reduced-motion disables transitions.

Plan/files: `pathophysiology-quiz-plan.md`; bank `coronary-quiz.ts`; shared types/state `learning-quiz.ts`; component/CSS `quiz-slides.*`; small wiring in route/atlas/panel. Concurrent structure tooltip and other viewer code preserved. No dependencies, APIs, DBs, age assets or production publication changed.

## Content inventory and state semantics

| Surface/state | Inventory | Behavior/source |
|---|---|---|
| Header/default | Practice label, title, dynamic question count | Deck length, not number of diseases |
| Progress/current/disabled | Câu N, đã trả lời, current step, future steps disabled | Confirmed answers and earliest unfinished question |
| All 15 questions | Original core + 12 new prompts, kinds, choices, explanations, source IDs and observation-stage refs | Bank source and referential tests; primary clinical references checked |
| Selected/confirmed | Letter A/B/C, Bạn đã chọn, Đáp án đúng | Explicit label plus color, never color alone |
| Feedback | Gentle correct/revisit lead, explanation, source links | Does not claim clinical mastery; each source resolves within scenario |
| Navigation | Quay lại, Kiểm tra đáp án, Câu tiếp theo, Xem kết quả | Native buttons, disabled initial actions, no auto-advance |
| Model action | Xem giai đoạn trên mô hình | Uses validated stage ID; seek pauses flow, preserves quiz |
| Summary/review | Score denominator, câu đúng, Đã nắm đúng/Cần xem lại, revisit and restart | Count of confirmed correct answers in this attempt, no grading/certification |
| Reset/privacy | Lượt xem only, no account persistence | Component-local state, unmounted on disease switch |
| Loading/error/empty | Quiz does not fetch; route supplies validated nonempty banks; panel has original-question fallback | Existing model loader errors stay independent from quiz |

## Product Language Gate

Audience: Vietnamese medical students. Platform: responsive web; native radio/form/navigation semantics. General HIG principles applied as quality reference, not Apple platform-compliance claim. Design reference: local Airtable-inspired catalog for white/navy hierarchy and restrained blue, no copied branding. All changed text and states inventoried above; exact content in bank/component source snapshot.

Purpose PASSED: supports mechanism recall, not generic trivia. Agency PASSED: confirm, next/back, revisit, reset and model observation; no forced autoplay. Responsibility PASSED: bounded source-backed explanations, unchanged draft boundary, no certification. Familiarity PASSED: Vietnamese terms, radio choices and familiar arrows. Flexibility PASSED: keyboard/native input, mobile, stage navigation and reduced motion. Simplicity PASSED: one question and one primary action per step. Craft PASSED: shared visual hierarchy, inset feedback, aligned progress and responsive spacing. Delight PASSED: contextual questions, short transitions and useful personalized review without punitive feedback.

Default, selection, disabled future/confirm, correct/incorrect, previous/next, completion, review, restart and model-link states are represented. No async quiz loading/error or destructive confirmation needed; no personal data is stored. Failure semantics: missing/invalid choice cannot confirm, revisiting cannot rewrite a scored answer, empty supplied deck falls back to original core question. No network submission to fail. Native form roles/names and focus after slide navigation; correct/incorrect announced via status. No full screen-reader certification claimed.

Data semantics, terminology, tone, localization, concise labels, platform fit and behavior agreement: PASSED within verified local flows. Clinical approval remains pending from parent feature; new assessment is educational and not validated psychometrically. Full medical review is outside this UI refinement and no release occurs.

## Validation and review

- 61 focused tests across quiz, catalog, schema and flow; full suite 113 tests / 12 files passed.
- Web TypeScript and focused ESLint passed.
- Browser evidence, screenshots and final build status recorded in task ledger/evidence directory. Software Chromium; not real-device GPU or assistive-technology certification.
- Cycle 1: review found inherited parent button styles could override progress/CTA and disabled styling. Scoped selectors added; browser screenshots verify intended treatment. Found screenshot could capture intermediate transition opacity; capture with animations disabled for stable design review (runtime animation retained).
- Cycle 2: final source/consumer review, referential tests, state transitions, browser journey and build checked. No production readiness or all-disease quiz coverage claim. Existing model-loader boundary unaffected.

Rollback: restore old single-question panel form and remove optional question-deck props/import. No data migration. Dirty local workspace and unrelated WIP preserved. Token usage: Unavailable. Cost: Unavailable. Memory candidates: None. Technical review result recorded by runtime ledger; educational/clinical review remains unverified.

## Professional medical-language refinement

User requested professional medical vocabulary and less mechanical/AI-like writing during final verification. All 15 prompts/choice sets now use formal revision wording: coronary thrombosis, LAD perfusion distribution, irreversible injury/necrosis, coronary constriction, lumen caliber and qualitative simulation limits. Implausible distractors (skin location, particles becoming tissue, playback speed deciding clinical risk) were replaced with anatomically or mechanistically relevant alternatives. Original correct IDs preserved; nonempty option labels additionally checked. Core questions are overridden privately in the bank, leaving the shared scenario contract intact.

UI now uses “Ôn tập sinh lý bệnh”, “Câu hỏi lượng giá”, “Đáp án đúng”, “Giải thích đáp án”, “Kết quả ôn tập”, “Trả lời đúng”, “Chưa đúng · Xem lại”, and “Đối chiếu giai đoạn mô phỏng”. No motivational canned praise or implication of clinical certification. Existing content inventory covers these updated labels and all bank text. Current primary-source references remain within the original clinical scope.

Post-refinement validation: 113 unit tests pass; scoped dependency-closure TypeScript (`/tmp/hs-quiz-tsconfig.json`, includes development route and imported quiz/atlas/panel dependencies) passes; focused ESLint passes. Whole-web TypeScript is BLOCKED by concurrent account-module work: missing account-page component and not-yet-exported AccountView/AccountSettings symbols. Do not attribute those failures to quiz or modify that unrelated WIP. Earlier full build passed before this wording refinement and concurrent account additions; it is not current whole-project proof. Final browser run blocks only the development HMR WebSocket in the test page to prevent unrelated writes from resetting quiz state; application interactions/assets are unchanged. This test configuration is evidence for the loaded quiz snapshot, not for hot-reload behavior.
