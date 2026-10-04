# Heart preview asset provenance

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- Official attribution/license: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (license page updated 2025-02-27, checked during this task).
- License terms: https://creativecommons.org/licenses/by/4.0/
- Download mirror: https://github.com/olivercase/body_parts_3d_api
- Pinned revision: `fd527e6f4daf732fd814314d9257df5877b844bc`.
- `source-manifest.json` records every source filename, URL, size and SHA-256. Source OBJ files are unchanged. The mirror describes the set as BodyParts3D 4.3; this version label was not independently matched against a primary full-release manifest.
- The mirror README retains the older CC-BY-SA-2.1-JP notice. It is preserved in the manifest for provenance; current official BodyParts3D license page specifies CC BY 4.0. No code from the mirror was executed.

HumanScope modifications: select ten structures, transform all shared atlas coordinates by `[(x-25)/40,(z-1245)/40,-(y+125)/40]`, rotate source normals, assign illustrative materials, export GLB, derive LAD and LCx paths from transverse surface centroids. These are illustration coordinates, not physical units. Source filenames determine the selected structures; a mirror metadata CSV was not used as authoritative anatomy mapping because identifiers differed.

Regenerate from verified inputs:

```sh
node apps/web/preview-assets/heart/build.mjs
node apps/web/preview-assets/heart/verify.mjs
```

`heart.glb` and `binding.json` are generated; edit the builder, never the outputs. The verifier checks SHA/size and point containment with three ray directions per interpolated sample, plus nearest triangle clearance for the 0.006-radius particles. This is sampled geometric evidence, not a proof at every continuous point and not a clinical validation. The builder itself rejects changed source hashes. All files stay outside `public/`; the binary route serves only in development.

The occlusion on LAD at path fraction 0.36 is an invented teaching scenario. The yellow marker is a location cue, not a measured plaque. Particle size, phase, uniform speed and abrupt distal removal are qualitative. No coronary flow solver, heartbeat deformation, validated perfusion territory, injury-area estimate or patient-specific claim is present. `territory: null` and `reviewStatus: unreviewed` must remain explicit until specialist review. This atlas mesh selection is not a complete cardiac anatomy model. Nothing here implies endorsement by the source institution.
