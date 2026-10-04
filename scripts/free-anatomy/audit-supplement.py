#!/usr/bin/env python3
"""Inspect the complete IS-A supplement in quarantine, with no extraction/publication."""
import argparse
import csv
import hashlib
import importlib.util
import json
import re
import zipfile
from pathlib import Path, PurePosixPath


def geometry_digest(data):
    # Exclude only comments/blank lines, never geometry or parser directives.
    return hashlib.sha256(b'\n'.join(line.strip() for line in data.splitlines() if line.strip() and not line.lstrip().startswith(b'#'))).hexdigest()


def inventory_archive(path, max_bytes, max_total):
    if path.stat().st_size > max_bytes:
        raise ValueError('Archive byte budget')
    archive = zipfile.ZipFile(path)
    try:
        entries = archive.infolist()
        if len(entries) > 5000 or sum(e.file_size for e in entries) > max_total:
            raise ValueError('Archive expansion budget')
        result = {}
        for entry in entries:
            name = PurePosixPath(entry.filename)
            if name.is_absolute() or '..' in name.parts or '\\' in entry.filename or entry.flag_bits & 1:
                raise ValueError('Unsafe entry')
            if entry.is_dir():
                continue
            if not re.fullmatch(r'FJ\d{1,6}M?\.obj', name.name) or entry.file_size > 24_000_000:
                raise ValueError('Unexpected OBJ entry')
            key = name.stem
            if key in result:
                raise ValueError('Duplicate source ID')
            result[key] = entry
        return archive, result
    except Exception:
        archive.close()
        raise


def audit(isa, partof, mapping, output):
    if mapping.stat().st_size > 2_000_000:
        raise ValueError('Mapping byte budget')
    names = {}
    with mapping.open() as stream:
        for row in csv.DictReader(stream, delimiter='\t'):
            key = row['element file id']
            if not re.fullmatch(r'FJ\d{1,6}M?', key):
                raise ValueError('Invalid source ID')
            names.setdefault(key, {})[row['concept id']] = row['name']
    spec = importlib.util.spec_from_file_location('prepare', Path(__file__).with_name('prepare.py'))
    parser = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(parser)
    parser.MAX_ENTRY = 24_000_000
    source, entries = inventory_archive(isa, 160_000_000, 800_000_000)
    try:
        prior, old = inventory_archive(partof, 75_000_000, 300_000_000)
        try:
            if set(entries) != set(names) or not set(old).issubset(entries):
                raise ValueError('Archive/mapping identity mismatch')
            changed, same, candidates, geometry_same, geometry_changed = [], [], [], [], []
            for key, entry in sorted(entries.items()):
                data = source.read(entry)  # CRC verified, one bounded object at a time.
                if b'# Bounds(mm):' not in data or f'# File ID : {key}\n'.encode() not in data:
                    raise ValueError('Missing unit/identity evidence')
                digest = hashlib.sha256(data).hexdigest()
                if key in old:
                    old_data = prior.read(old[key])
                    (same if digest == hashlib.sha256(old_data).hexdigest() else changed).append(key)
                    (geometry_same if geometry_digest(data) == geometry_digest(old_data) else geometry_changed).append(key)
                else:
                    candidates.append({'id': key, 'concepts': names[key], 'sha256': digest, **parser.inspect_obj(data)})
        finally:
            prior.close()
    finally:
        source.close()
    report = {'status': 'QUARANTINE_ONLY', 'productionReady': False, 'medicalReview': 'NOT_REVIEWED',
              'overlapReview': 'NOT_REVIEWED', 'sourceSha256': parser.sha256(isa),
              'mappingSha256': parser.sha256(mapping), 'sharedIdentical': same, 'sharedChanged': changed,
              'sharedGeometryIdentical': geometry_same, 'sharedGeometryChanged': geometry_changed,
              'candidates': candidates,
              'limits': 'Valid OBJ and matching shared bytes do not prove new anatomy, spatial overlap, or clinical validity.'}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2))
    return report


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    for key in ('isa', 'partof', 'mapping', 'output'):
        cli.add_argument('--' + key, type=Path, required=True)
    args = cli.parse_args()
    report = audit(args.isa, args.partof, args.mapping, args.output)
    print(json.dumps({'candidateCount': len(report['candidates']), 'sharedIdentical': len(report['sharedIdentical']),
                      'sharedGeometryIdentical': len(report['sharedGeometryIdentical']),
                      'sharedGeometryChanged': len(report['sharedGeometryChanged']), 'status': report['status']}))
