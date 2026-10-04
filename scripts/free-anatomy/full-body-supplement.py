#!/usr/bin/env python3
"""Prepare the verified same-coordinate IS-A source union for local preview only."""
import csv
import argparse
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path


def prepare():
    baseline = Path('.ai/local/free-anatomy/full-body-v2')
    report = json.loads(Path('.ai/local/ac-01/supplement-audit.json').read_text())
    archive = Path('.ai/local/med4d-expansion/bodyparts-isa.zip')
    mapping = Path('scripts/free-anatomy/catalog/isa_element_parts.txt')
    def digest(path):
        with path.open('rb') as stream:
            return hashlib.file_digest(stream, 'sha256').hexdigest()
    if report['status'] != 'QUARANTINE_ONLY' or report['productionReady'] is not False or report['sharedGeometryChanged']:
        raise ValueError('Source compatibility not verified')
    if digest(archive) != report['sourceSha256'] or digest(mapping) != report['mappingSha256']:
        raise ValueError('Stale audit')
    inventory = json.loads((baseline / 'inventory.json').read_text())
    prior_catalog = json.loads((baseline / 'conversion.json').read_text())
    original = {item['id'] for item in inventory['objects']}
    if original != set(report['sharedGeometryIdentical']):
        raise ValueError('Baseline identity mismatch')
    memberships = {}
    with mapping.open() as stream:
        for row in csv.DictReader(stream, delimiter='\t'):
            memberships.setdefault(row['element file id'], {})[row['concept id']] = row['name']
    # These source classes explicitly locate muscles in the named region.
    # Unsided upper/lower limb classes cannot establish laterality: leave unassigned.
    regional_classes = {'FMA9616': 'head', 'FMA9617': 'neck', 'FMA9619': 'thorax', 'FMA9620': 'abdomen'}
    output = Path('.ai/local/free-anatomy/full-body-v3')
    output.mkdir(exist_ok=True)
    (output / 'objects').mkdir(exist_ok=True)
    for item in inventory['objects']:
        data = (baseline / 'objects' / (item['id'] + '.obj')).read_bytes()
        if hashlib.sha256(data).hexdigest() != item['sha256']:
            raise ValueError('Baseline OBJ mismatch')
        (output / 'objects' / (item['id'] + '.obj')).write_bytes(data)
        item['concepts'] = {**memberships[item['id']], **item['concepts']}
        item['specificConcepts'] = prior_catalog['structures'][item['id']]['alternativeConcepts']
    with zipfile.ZipFile(archive) as package:
        for item in report['candidates']:
            key = item['id']
            if not re.fullmatch(r'FJ\d{1,6}M?', key) or key in original:
                raise ValueError('Invalid supplement identity')
            entry = package.getinfo(f'isa_BP3D_4.0_obj_99/{key}.obj')
            if entry.file_size > 24_000_000 or entry.flag_bits & 1:
                raise ValueError('Invalid source entry')
            data = package.read(entry)
            if hashlib.sha256(data).hexdigest() != item['sha256']:
                raise ValueError('Supplement OBJ mismatch')
            concept = re.search(rb'^# Concept ID : (FMA\d+)\s*$', data, re.MULTILINE)
            primary = concept.group(1).decode() if concept else None
            if primary is not None and primary not in item['concepts']:
                raise ValueError('Mismatched primary source concept')
            inventory['objects'].append({**item, 'primaryConcept': primary, 'sourceTree': 'IS-A',
                'regions': [region for concept, region in regional_classes.items() if concept in item['concepts']]})
            (output / 'objects' / (key + '.obj')).write_bytes(data)
    inventory.update({'version': 'bodyparts3d-fullbody-v3', 'sourceUnion': True,
        'isaArchiveSha256': report['sourceSha256'], 'compatibilityEvidence': '1258 shared geometries identical excluding comment headers',
        'overlapReview': 'NOT_REVIEWED', 'medicalReview': 'NOT_REVIEWED', 'productionReady': False})
    (output / 'inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2))
    print(json.dumps({'parts': len(inventory['objects']), 'output': str(output), 'productionReady': False}))


def activate(package=False):
    """Install verified local candidate bytes behind the existing local route only."""
    source = Path('.ai/local/free-anatomy/full-body-v3')
    destination = Path('.ai/local/free-anatomy/full-body-v2')
    metadata = json.loads((source / 'conversion.json').read_text())
    backup = Path('.ai/local/ac-01/assets-v2')
    backup.mkdir(parents=True, exist_ok=True)
    for asset in destination.glob('*.glb'):
        if not (backup / asset.name).exists():
            shutil.copyfile(asset, backup / asset.name)
    # Validate the entire candidate before replacing any served bytes.
    for key, expected in metadata['assets'].items():
        if not re.fullmatch(r'[a-z0-9-]+', key):
            raise ValueError('Invalid chunk key')
        path = source / (key + '.glb')
        if path.stat().st_size != expected['byteLength'] or expected['byteLength'] > 8_000_000:
            raise ValueError('Invalid candidate length')
        with path.open('rb') as stream:
            if hashlib.file_digest(stream, 'sha256').hexdigest() != expected['sha256']:
                raise ValueError('Invalid candidate digest')
    for key in metadata['assets']:
        shutil.copyfile(source / (key + '.glb'), destination / (key + '.glb'))
    if package:
        # Pair the repository's educational discovery pack with its generated catalog.
        # This is a local build input, not a deployment or clinical publication.
        pack = Path('apps/web/preview-assets/discovery')
        manifest = json.loads((pack / 'manifest.json').read_text())
        pack_backup = Path('.ai/local/ac-01/pack-v2')
        pack_backup.mkdir(parents=True, exist_ok=True)
        if not (pack_backup / 'manifest.json').exists():
            shutil.copyfile(pack / 'manifest.json', pack_backup / 'manifest.json')
        for asset in (pack / 'full-body-v2').glob('*.glb'):
            if not (pack_backup / asset.name).exists():
                shutil.copyfile(asset, pack_backup / asset.name)
        for key in metadata['assets']:
            shutil.copyfile(source / (key + '.glb'), pack / 'full-body-v2' / (key + '.glb'))
        manifest['assets'] = [asset for asset in manifest['assets'] if not asset['path'].startswith('full-body-v2/')] + [
            {'path': f'full-body-v2/{key}.glb', 'sha256': asset['sha256'], 'byteLength': asset['byteLength']}
            for key, asset in metadata['assets'].items()]
        (pack / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'localChunksInstalled': len(metadata['assets']), 'buildPackUpdated': package, 'productionPublished': False}))


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--activate', action='store_true')
    cli.add_argument('--package', action='store_true', help='Regenerate the local educational build pack; does not deploy')
    args = cli.parse_args()
    if args.package and not args.activate:
        cli.error('--package requires --activate')
    activate(args.package) if args.activate else prepare()
