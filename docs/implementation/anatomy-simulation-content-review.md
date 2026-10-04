# SIM-01 foundation content review — 2026-10-02

Scope: Vietnamese web disease atlas and shared-heart lesson panel. Current implementation is a foundation increment, not complete SIM-01. Audience/task: move between anatomy and lessons without changing anatomical source, see which topics actually have an illustration. Native selects/buttons and existing responsive styles retained. Apple-only HIG components not applicable.

Inventory: atlas statistic “mô phỏng 3D” → “mô phỏng minh họa”; added count “chưa có mô phỏng”. New “Tim” option preserves whole-heart selection; canonical source names for other heart structures come from existing bodyLabel. Source info fallback: “Cấu trúc giải phẫu từ cùng atlas với trang Khám phá.” and “Chưa có lớp mô phỏng riêng cho cấu trúc này.” Source note now identifies common geometry/identity and separate qualitative flow/pathology overlays. No claim of physiological completeness, review or measured flow. No source medical mechanism text changed.

Verified semantics: actual catalog 27 topics, 3 implemented/unreviewed, 24 not implemented. Canonical heart has source identity coverage; unbound source context is selectable but does not become a new simulation. Counts measure existing topics, never all diseases. Baseline flow remains part of coronary lessons, not a complete normal-physiology module.

| Principle | Status | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Same source geometry in learning/discovery; preserved whole-heart choice. |
| Agency | PASSED | Select, play/pause, stage seek, compare and retry retained. |
| Responsibility | PASSED | Missing simulation count and unreviewed notes; context-only structures distinguished. |
| Familiarity | PASSED | Existing native controls, anatomical names and short status language. |
| Flexibility | PASSED | Local Chrome 1440×1000 and 390×844; no horizontal overflow. Existing reduced-motion logic retained. |
| Simplicity | PASSED | No new mandatory controls or dialogs; source details remain secondary. |
| Craft | PASSED | Whole-heart and source options resolve; canonical geometry and overlay registration tested. |
| Delight | PASSED | Reduced unexpected model replacement; no added interruption. |

Changed-content meaning, terminology, data semantics, localization and platform fit PASSED for this increment. Rendered evidence: /tmp/sim-01-canonical-heart.png and /tmp/sim-01-mobile.png. Review-only sources/geometry; no external clinical reviewer. Speech screen reader, physical touch, full physiology/disease coverage and quantitative simulation validation NOT_RUN. Existing /api/v1/me 500 unrelated backend limitation persists. Overall SIM-01 acceptance remains incomplete.
