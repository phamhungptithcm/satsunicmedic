"""Create a reproducible source archive from explicit build/test inputs, including untracked WIP.

Never packages environment files, local evidence, node_modules or quarantined source images.
The discovery asset allowlist is verified byte-for-byte before packaging.
"""
from pathlib import Path
import argparse
import gzip
import hashlib
import io
import json
import re
import os
import tarfile

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = ['LICENSE', 'README.md', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', '.node-version', '.dockerignore', 'tsconfig.base.json', 'tsconfig.json', 'eslint.config.mjs', 'vitest.config.ts', 'vitest.integration.config.ts', 'firebase.json']
SOURCE_SUFFIXES = {'.ts', '.tsx', '.mts', '.js', '.mjs', '.cjs', '.json', '.css', '.yaml', '.yml', '.sql', '.toml', '.prisma', '.sh', '.py', '.txt', '.md', '.html', '.svg'}
EXCLUDED = {'node_modules', '.next', 'dist', 'generated', '__pycache__', 'preview-assets'}

def collect(root: Path):
    paths = [root / name for name in ROOT_FILES]
    for name in ['apps', 'packages', 'tests', 'scripts', 'infra/firebase', 'infra/docker', '.github/workflows']:
        for folder, dirs, names in os.walk(root / name, followlinks=False):
            dirs[:] = sorted(d for d in dirs if d not in EXCLUDED and not d.startswith('.env') and not (Path(folder) / d).is_symlink())
            for filename in sorted(names):
                path = Path(folder) / filename
                if path.is_symlink() or filename.startswith('.env'):
                    continue
                if path.suffix in {'.pyc', '.tsbuildinfo', '.pem', '.p12', '.key'} or filename.endswith('-debug.log'):
                    continue
                if path.suffix not in SOURCE_SUFFIXES and not filename.startswith('Dockerfile'):
                    continue
                paths.append(path)
    asset_root = root / 'apps/web/preview-assets/discovery'
    manifest = asset_root / 'manifest.json'
    paths.append(manifest)
    for asset in json.loads(manifest.read_text())['assets']:
        path = asset_root / asset['path']
        if not path.resolve().is_relative_to(asset_root.resolve()) or path.is_symlink():
            raise ValueError('Asset path is outside the approved pack')
        content = path.read_bytes()
        if len(content) != asset['byteLength'] or hashlib.sha256(content).hexdigest() != asset['sha256']:
            raise ValueError('Asset pack hash mismatch')
        paths.append(path)
    # Binding metadata used by the existing heart illustration, not source images.
    binding = root / 'apps/web/preview-assets/heart/binding.json'
    if binding.exists():
        paths.append(binding)
    return sorted(set(paths))

def freeze(output: Path):
    if output.exists():
        raise ValueError('Use a new output directory; frozen candidates are immutable')
    output.mkdir(parents=True)
    files = []
    archive_path = output / 'source.tar.gz'
    with archive_path.open('wb') as raw, gzip.GzipFile(fileobj=raw, mode='wb', filename='', mtime=0) as zipped, tarfile.open(fileobj=zipped, mode='w') as archive:
        for path in collect(ROOT):
            if path.is_symlink() or not path.resolve().is_relative_to(ROOT):
                raise ValueError('Unapproved source link')
            content = path.read_bytes()
            if path.suffix != '.glb' and re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|_authToken\s*=\s*[^$\s]', content):
                raise ValueError('Potential credential in candidate; inspect locally before packaging')
            name = path.relative_to(ROOT).as_posix()
            files.append({'path': name, 'sha256': hashlib.sha256(content).hexdigest()})
            entry = tarfile.TarInfo(name)
            entry.size = len(content)
            entry.mode = 0o755 if path.suffix == '.sh' else 0o644
            archive.addfile(entry, io.BytesIO(content))
    canonical = json.dumps(files, ensure_ascii=False, separators=(',', ':'))
    manifest = {'scope': 'discovery', 'candidateSha256': hashlib.sha256(canonical.encode()).hexdigest(), 'archiveSha256': hashlib.sha256(archive_path.read_bytes()).hexdigest(), 'files': files, 'checks': {}, 'deferred': []}
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'files': len(files), 'candidateSha256': manifest['candidateSha256'], 'archiveSha256': manifest['archiveSha256'], 'bytes': archive_path.stat().st_size}))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    freeze(parser.parse_args().output.resolve())
