# AC-01 coverage scope — 2026-10-02

## Implemented source coverage

The local educational atlas now contains all 2,234 unique source IDs from the BodyParts3D 4.0 IS-A archive, retaining all previous 1,258 PART-OF source IDs. Every shared OBJ has identical non-comment content across the two archives; header tree/representation identifiers differ. The 976 added OBJs passed bounded syntax, indices, finite-coordinate, path, checksum and source-ID validation before conversion. This establishes technical provenance and shared coordinates, not anatomical overlap or clinical correctness.

The generated union exposes 3,432 source concepts, 12 source-derived system/class filters and 9 named regions. IS-A classification is kept separate from the original PART-OF navigation. Source classes explicitly named muscle of head/neck/thorax/abdomen can establish those regions; unsided limb classes cannot establish laterality. 1,310 source parts remain without region membership and 828 without one of the declared system/class memberships. Both are discoverable through the unassigned filters and through individual source IDs. No anatomical membership is invented from coordinates.

The source is an adult male reference with reduced polygon detail. This is not a catalog of all sexes, ages, anatomical variants or microscopic structures. System/class membership can overlap. Mesh count is not organ count. Geometry may represent a cavity boundary, an organ part or a larger structure. The complete union is 6,681,030 triangles and 148,601,464 GLB bytes; 77 bounded chunks, maximum 6,174,720 bytes. Skin loads first; optional geometry loads by selection/scope. Whole-source views are much heavier than individual structures.

## Whole-body acceptance remains open

| Required dimension | Current evidence | Remaining work |
| --- | --- | --- |
| Every source ID imported/selectable | 2,234 unique IDs; identity tests, 77 GLB checks; new tooth and muscle browser checks | Individual browser verification is sampled, not 2,234 clinical reviews |
| Complete standard terminology | BodyParts3D reference only | Select a versioned independent standard and reconcile each term; TA2 official page returned 502 during this run; no substitute invented |
| Surface, subcutaneous tissue, fascia, muscles/tendons, skeleton/joints/ligaments, vessels, lymphatics, nerves, sensory structures, internal organs | Source mappings available; source lacks a medically validated complete denominator for these groups | Structure-by-structure expert checklist, child relationships and missing-source worklist |
| Female anatomy and specimen variants | No new female or age specimen imported | Obtain separately licensed/coherent specimens and reviewer-backed mapping; never blend specimens into one body |
| Histology and microscopic anatomy | No true microscopic model imported | Separate source-backed tissue/cell representations; zoom is not microanatomy |
| Description/function per structure | Existing content only; provenance fallback remains | Reviewed structure-specific content, translations and evidence |
| Activity per structure | Existing coronary illustration only | Separate approved animation/data work; no new physiology simulated |
| Medical/overlap review | NOT_REVIEWED | Qualified reviewer, version-bound findings and approval; technical OBJ checks do not replace this |

Owner action for whole-body acceptance: designate the anatomical reference version and qualified reviewer; provide/approve sources covering missing specimen and microscopic scope. AC-01 implementation authorization remains valid; no additional implementation approval is being requested for the same scope. No purchase or deployment is included.

## Reproduction and rollback

Existing inputs: PART-OF source archive/mapping and prepared v2 inventory/conversion in `.ai/local/free-anatomy/`; official IS-A archive in `.ai/local/med4d-expansion/bodyparts-isa.zip`. The IS-A archive SHA-256 is `40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e`.

```sh
python3 scripts/free-anatomy/audit-supplement.py --isa .ai/local/med4d-expansion/bodyparts-isa.zip --partof .ai/local/free-anatomy/source/bodyparts3d-partof-4.0.zip --mapping scripts/free-anatomy/catalog/isa_element_parts.txt --output .ai/local/ac-01/supplement-audit.json
python3 scripts/free-anatomy/full-body-supplement.py
node scripts/free-anatomy/full-body-convert.mjs --source-union
python3 scripts/free-anatomy/full-body-supplement.py --activate --package
node scripts/free-anatomy/coverage-audit.mjs
```

All are local generation/packaging, not production publication. The historical `full-body-v2` delivery folder remains to preserve the route; semantic catalog version is `bodyparts3d-fullbody-v3`. The v3 source/conversion are stored separately. Local old delivered assets and packaged manifest are preserved in `.ai/local/ac-01/assets-v2` and `pack-v2`; source baseline is in `baseline`. Rollback requires restoring compatible catalog, asset pack and regenerated coverage together, while preserving later unrelated WIP. Never overwrite newer work blindly or mix manifests with another asset revision.
