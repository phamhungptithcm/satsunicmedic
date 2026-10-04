# AC-01 product-content review — 2026-10-02

Scope: Vietnamese web anatomy explorer, desktop 1440×1000 and mobile viewport 390×844. Audience: people exploring anatomy. Native web selects/buttons/details, keyboard operation and responsive layout; Apple principles are a human-centered reference, not Apple-specific UI conventions. Reviewer: Codex self-review; no claim of qualified medical review.

Verified: source-ID coverage ≠ whole-human completeness; source hierarchy ≠ invented hierarchy; a name ≠ a geometry; system/classes overlap. New geometry is a source-backed educational candidate. Unknown regional context cannot support a nearby view. Coronary illustration is the only linked activity.

## Changed content inventory

| Surface / state | Content / purpose | Evidence |
| --- | --- | --- |
| Catalog select | Danh mục; Cấu trúc và nhóm; Từng phần mô hình; Phần cần bổ sung | Switches between actual data projections; DOM/browser |
| System/class select | Hệ và nhóm cấu trúc; Cơ, Gân, Răng, Dây thần kinh; preserved existing labels | Exact source concept membership; muscle view screenshot |
| Classification | Phân loại; Tất cả; Chưa được gán vùng/hệ | Filters empty metadata, not anatomical absence; exhaustive unit tests |
| Results/default/search | Danh sách cấu trúc; Kết quả tìm kiếm; Các phần theo nguồn; range/total mục; Không có kết quả | 40-row pagination over complete data; desktop/mobile keyboard proof |
| Per-row | Name, source ID or count of phần mô hình | Geometry count is not number of organs; source English retained |
| Part hierarchy | Các phần (count); accessible Các phần của name; Lên một cấp | Official PART-OF relationships, no IS-A conflation; heart drill/back browser test |
| Pagination | Trang danh mục; Trước; Sau; page/total; disabled boundaries | Exact ranges and clamp tests; focus stays on button after Enter |
| Coverage details | Phạm vi mô hình hiện có; source counts, remaining-source count or all-source-ID statement; unknown whole-body completeness | Regenerated coverage; zero source gaps never becomes whole-body 100% |
| Coverage empty | No remaining source ID vs still incomplete body/specimen/micro scope | Browser gap state confirms distinction |
| Search empty | Chưa tìm thấy…; try another name/clear filters; Xóa tìm kiếm/Bỏ bộ lọc | Actual implemented recovery tested |
| Partial source rows | Distinguish some geometry available vs none imported | Generated availability split; covered by audit partial fixture; current live union has no such rows |
| Unassigned nearby | Chưa có phân vùng đủ tin cậy…; retains selection | New tooth browser test and unit regression |
| Activity missing | Chưa có bài hoạt động cho cấu trúc này; select to see available lesson | Does not redirect unrelated anatomy to heart; tooth screenshot |
| Source terms | New unmodified English source names; review status remains unreviewed | No fabricated translations, physiology or medical validation |

## State and accessibility evidence

Default/select/pagination/hierarchy: tested. Keyboard: pagination focused then Enter, state/focus verified. Empty: impossible query + clear tested. Loading/error/retry: deliberately aborted skin request, saw “Chưa tải được mô hình”, removed fault and retried to “Đang xem”. Source partial availability: unit fixture only because current IS-A union has no missing source IDs. Missing neighborhood: real new tooth. Unsupported activity: real tooth. No destructive/confirmation/new authorization flow. The pre-existing auth `/api/v1/me` returns 500 without the local API running; this is disclosed and not called an auth PASS.

Evidence files: `/tmp/ac01-desktop.png`, `/tmp/ac01-tooth.png`, `/tmp/ac01-muscles.png`, `/tmp/ac01-mobile-tooth.png`, `/tmp/ac01-mobile-catalog.png`; Playwright DOM/results in the current chat and `.playwright-cli/` logs. Desktop/mobile no horizontal overflow. Native labels and visible/accessible names match. Screen-reader speech, physical-device GPU performance, browser zoom/text scaling and every anatomical structure were NOT TESTED.

## Human Interface principles

| Principle | Status for changed web flow | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | Search, group drilldown and individual source selection show real geometry |
| Agency | PASSED | Filters, back/up, paging, whole-body reset and existing undo preserved |
| Responsibility | PASSED | Explicit distinction between source completeness, medical review and full anatomy; no fake activity |
| Familiarity | PASSED | Native web selects/buttons/details, standard Enter operation |
| Flexibility | PASSED | Vietnamese/English/ID search, keyboard, mobile layout and unassigned path |
| Simplicity | PASSED | 40 rows; pagination moved above results; common organs prioritized, broad classes ranked later |
| Craft | PASSED | Empty, failed load, retry, long English labels, no-region and gap states checked |
| Delight | PASSED | New tooth opens directly in isolation; lack of nearby data preserves useful view rather than resetting |

Product Language Gate: PASSED for the tested changed discovery flow with the stated evidence limits. It does not approve medical terminology, anatomy, unseen devices, or overall product completeness. No new animations; existing reduced-motion behavior preserved.
