# Product Content Review — HS-MED4D-3

Surface: full-body viewer section controls. Audience: Vietnamese anatomy learners. Target: web, keyboard/pointer/touch. Uses native fieldset/legend/checkbox/range/button semantics; no Apple-platform compliance claim. Reviewed 2026-10-01.

## Inventory and meaning

- “Cắt mô hình”: existing master checkbox now enables axial default or clears all sections.
- “Chọn tối đa ba mặt phẳng…”: states bound and distinguishes mesh cuts from CT/MRI.
- “Ngang”, “Trán”, “Dọc”: identifies each anatomical plane; tilt is separate, displayed in degrees.
- “Bật mặt phẳng …”: native per-plane checkbox, checked state from serializable scene.
- “Vị trí … · n%” and accessible “Vị trí cắt …”: regional normalized position, NOT mm or CT slice index.
- “Góc nghiêng … · n°”: bounded -60..60 degrees, one oblique rotation per plane.
- “Đảo phía giữ lại · …”: pressed state reverses retained half-space, no data deletion.
- “Bỏ các mặt phẳng cắt”: clears all planes through history; undo can restore them.

Verified source behavior: controls disable when inside chunks unavailable; selecting surface and whole-body reset clear planes; legacy axial state maps into the new controls; history retains each plane and keyboard/pointer gestures coalesce. Plane sliders reuse outline geometry. No PHI, cloud calls or authentication changes.

## States

Default/checked/disabled/undo/reset are covered in source and state tests. Existing loading/partial/error messages remain; new fieldsets disable with chunk readiness. Empty and unauthorized do not introduce a new branch. There is no destructive confirmation or server persistence. Visual focus, responsive layout, discoverability and contextual text fit are NOT_RUN.

## Eight principles

| Principle | Source evidence | In-context status |
|---|---|---|
| Purpose | Controls change visible mesh cut | NOT_RUN |
| Agency | Three independent planes, reverse/reset/undo | NOT_RUN |
| Responsibility | Explicit mesh vs CT/MRI; percentages vs calibrated distance | NOT_RUN |
| Familiarity | Native ranges, checkbox, fieldset and anatomical names | NOT_RUN |
| Flexibility | Keyboard and pointer gestures; inherited responsive layout | NOT_RUN |
| Simplicity | Extra controls appear only while cutting enabled | NOT_RUN |
| Craft | Shared equations across renderer, raycast and outline | NOT_RUN |
| Delight | Reversible exploration without mandatory animation | NOT_RUN |

## Decision: BLOCKED

The browser tool rejected access to the existing local URL under its URL-security policy. No browser workaround was attempted. Source strings and tests alone do not satisfy the repository Product Language Gate. A fresh permitted in-context desktop/mobile check is required before a successful UI handoff. No screenshot is claimed.
