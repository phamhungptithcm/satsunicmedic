#!/usr/bin/env python3
"""Prepare a bounded, local-only BodyParts3D review bundle. Never publish assets."""
import argparse
import csv
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import re
import zipfile

MAX_ARCHIVE = 75_000_000
MAX_ENTRY = 8_000_000
MAX_TOTAL = 300_000_000
SELECTION = {
    "FMA7088": ("Tim", "heart"),
    "FMA7309": ("Mạch và phế quản trong phổi phải", "lungs"),
    "FMA7310": ("Mạch và phế quản trong phổi trái", "lungs"),
    "FMA7480": ("Lồng ngực", "skeleton"),
}


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def inspect_obj(data):
    """Fail closed on invalid geometry and external-resource directives."""
    if len(data) > MAX_ENTRY:
        raise ValueError("OBJ too large")
    text = data.decode("utf-8")
    vertices = []
    triangles = 0
    low = [math.inf] * 3
    high = [-math.inf] * 3
    for line in text.splitlines():
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if fields[0] in {"mtllib", "call", "csh"}:
            raise ValueError("External resources or commands are not accepted")
        if fields[0] == "v":
            if len(fields) != 4:
                raise ValueError("Expected XYZ position")
            xyz = tuple(map(float, fields[1:]))
            if not all(math.isfinite(v) and abs(v) < 100_000 for v in xyz):
                raise ValueError("Invalid coordinate")
            vertices.append(xyz)
            for axis, value in enumerate(xyz):
                low[axis] = min(low[axis], value)
                high[axis] = max(high[axis], value)
        elif fields[0] == "f":
            # Source package uses triangular faces; refuse silent triangulation.
            if len(fields) != 4:
                raise ValueError("Only source triangles accepted")
            indices = [int(token.split("/")[0]) for token in fields[1:]]
            if any(i <= 0 or i > len(vertices) for i in indices):
                raise ValueError("Invalid vertex index")
            if len(set(indices)) != 3:
                raise ValueError("Degenerate index triangle")
            triangles += 1
        elif fields[0] in {"vn", "vt"}:
            values = [float(value) for value in fields[1:]]
            if not 1 <= len(values) <= 3 or not all(math.isfinite(v) for v in values):
                raise ValueError("Invalid normal or texture coordinate")
        elif fields[0] not in {"o", "g", "s", "usemtl"}:
            raise ValueError("Unsupported OBJ directive")
    if not vertices or not triangles:
        raise ValueError("Empty geometry")
    return {"vertices": len(vertices), "triangles": triangles, "boundsMm": [low, high]}


def prepare(source, output):
    archive = source / "bodyparts3d-partof-4.0.zip"
    if archive.stat().st_size > MAX_ARCHIVE:
        raise ValueError("Archive too large")
    mapping = source / "elements.tsv"
    if mapping.stat().st_size > 2_000_000:
        raise ValueError("Mapping too large")
    chosen = {}
    found = set()
    for row in csv.DictReader(io.StringIO(mapping.read_text()), delimiter="\t"):
        concept = row["concept id"]
        if concept not in SELECTION:
            continue
        found.add(concept)
        element = row["element file id"]
        if not re.fullmatch(r"FJ[0-9]{1,6}", element):
            raise ValueError("Invalid element ID")
        if element in chosen and chosen[element]["concept"] != concept:
            raise ValueError("Overlapping selected structures")
        label, group = SELECTION[concept]
        chosen[element] = {"concept": concept, "label": label, "group": group}
    if found != set(SELECTION) or not 1 <= len(chosen) <= 500:
        raise ValueError("Incomplete or oversized selection")
    objects = []
    payloads = {}
    with zipfile.ZipFile(archive) as bundle:
        entries = bundle.infolist()
        if len(entries) > 2000 or sum(i.file_size for i in entries) > MAX_TOTAL:
            raise ValueError("Archive expansion limit exceeded")
        names = set()
        for entry in entries:
            path = PurePosixPath(entry.filename)
            if path.is_absolute() or ".." in path.parts or "\\" in entry.filename:
                raise ValueError("Unsafe archive path")
            if entry.filename in names:
                raise ValueError("Duplicate archive path")
            names.add(entry.filename)
        for element, metadata in sorted(chosen.items()):
            name = f"partof_BP3D_4.0_obj_99/{element}.obj"
            entry = bundle.getinfo(name)
            if entry.file_size > MAX_ENTRY or entry.flag_bits & 1:
                raise ValueError("Unsupported archive entry")
            data = bundle.read(entry)  # ZipFile validates CRC; never extract paths.
            if b"# Bounds(mm):" not in data:
                raise ValueError("Missing source unit evidence")
            statistics = inspect_obj(data)
            payloads[element] = data
            objects.append({"id": element, **metadata, **statistics,
                            "sha256": hashlib.sha256(data).hexdigest()})
    # Only write after the complete allowlisted selection has validated.
    output.mkdir(parents=True, exist_ok=False)
    (output / "objects").mkdir()
    for element, data in payloads.items():
        (output / "objects" / f"{element}.obj").write_bytes(data)
    receipt = {
        "status": "LOCAL_REVIEW_ONLY", "productionReady": False,
        "source": "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html",
        "archiveSha256": sha256(archive), "archiveBytes": archive.stat().st_size,
        "mappingSha256": sha256(mapping), "licensePageSha256": sha256(source / "license.html"),
        "licensePage": "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
        "licenseCurrentPage": "CC-BY-4.0 (updated 2025-02-27)",
        "licenseEmbeddedHeaders": "CC-BY-SA-2.1-JP (legacy headers preserved)",
        "attribution": "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
        "ageCoverage": "adult male reference; exact age unknown; no age variants",
        "medicalReview": "NOT_REVIEWED", "archiveEntries": len(entries),
        "qualityTier": "Source 99% polygon reduction; fine detail not validated",
        "objects": objects,
    }
    (output / "inventory.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    (output / "license-source.html").write_bytes((source / "license.html").read_bytes())
    print(json.dumps({"objects": len(objects), "triangles": sum(o["triangles"] for o in objects),
                      "output": str(output)}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    prepare(args.source, args.output)
