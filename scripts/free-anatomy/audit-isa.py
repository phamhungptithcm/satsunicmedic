#!/usr/bin/env python3
"""Audit additional source geometries into quarantine; never edit the live catalog."""
import argparse
import csv
import hashlib
import importlib.util
import json
import re
import zipfile
from pathlib import Path, PurePosixPath


def audit(archive, isa, partof, output, selected):
    if archive.stat().st_size > 160_000_000:
        raise ValueError('Archive budget exceeded')
    for table in (isa, partof):
        if table.stat().st_size > 2_000_000:
            raise ValueError('Metadata budget exceeded')
    with isa.open() as stream:
        rows = list(csv.DictReader(stream, delimiter='\t'))
    with partof.open() as stream:
        prior = {row['element file id'] for row in csv.DictReader(stream, delimiter='\t')}
    names = {}
    for row in rows:
        names.setdefault(row['element file id'], {})[row['concept id']] = row['name']
    additional = set(names) - prior
    if not selected or len(selected) > 20 or len(set(selected)) != len(selected):
        raise ValueError('Select 1 to 20 distinct candidate IDs')
    if any(not re.fullmatch(r'FJ[0-9]{1,6}M?', key) or key not in additional for key in selected):
        raise ValueError('Selection must be additional source IDs')
    spec = importlib.util.spec_from_file_location('prepare', Path(__file__).with_name('prepare.py'))
    parser = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(parser)
    result = []
    with zipfile.ZipFile(archive) as package:
        entries = package.infolist()
        if len(entries) > 5000 or sum(e.file_size for e in entries) > 800_000_000:
            raise ValueError('Archive expansion budget exceeded')
        seen = set()
        for e in entries:
            path = PurePosixPath(e.filename)
            if path.is_absolute() or '..' in path.parts or '\\' in e.filename or e.filename in seen or e.flag_bits & 1:
                raise ValueError('Unsafe archive entry')
            seen.add(e.filename)
        # Read only selected bytes. Never extract paths or execute archive content.
        for key in selected:
            matches = [e for e in entries if PurePosixPath(e.filename).name == key + '.obj']
            if len(matches) != 1 or matches[0].file_size > parser.MAX_ENTRY:
                raise ValueError('Missing, ambiguous or oversized candidate')
            data = package.read(matches[0])
            if b'# Bounds(mm):' not in data:
                raise ValueError('Missing source units')
            result.append({'id': key, 'concepts': names[key], 'sha256': hashlib.sha256(data).hexdigest(), **parser.inspect_obj(data)})
    receipt = {'status': 'QUARANTINE_ONLY', 'medicalReview': 'NOT_REVIEWED', 'overlapReview': 'NOT_REVIEWED',
               'sourceSha256': parser.sha256(archive), 'isaUnique': len(names), 'partofUnique': len(prior),
               'additionalIds': sorted(additional), 'inspected': result}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, indent=2))
    return receipt


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--archive', type=Path, required=True)
    cli.add_argument('--isa', type=Path, required=True)
    cli.add_argument('--partof', type=Path, required=True)
    cli.add_argument('--output', type=Path, required=True)
    cli.add_argument('--select', action='append', required=True)
    args = cli.parse_args()
    result = audit(args.archive, args.isa, args.partof, args.output, args.select)
    print(json.dumps({'status': result['status'], 'inspected': [x['id'] for x in result['inspected']], 'additional': len(result['additionalIds'])}))
