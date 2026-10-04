"""Package only application/build inputs, excluding local secrets and artifacts."""
from pathlib import Path
import tarfile
root = Path(__file__).resolve().parents[2]
out = root / '.ai/local/production-source.tar.gz'
out.parent.mkdir(parents=True, exist_ok=True)
inputs = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', 'tsconfig.base.json', '.dockerignore', 'apps', 'packages', 'infra/docker']
excluded = {'node_modules', '.next', 'dist', 'generated', '.git', '.env', '.env.local', 'coverage', 'test-results'}
with tarfile.open(out, 'w:gz') as archive:
    for name in inputs:
        path = root / name
        paths = sorted(path.rglob('*')) if path.is_dir() else [path]
        for file in paths:
            rel = file.relative_to(root)
            if file.is_symlink() or not file.is_file() or any(p in excluded or p.startswith('.env') for p in rel.parts):
                continue
            archive.add(file, arcname=str(rel), recursive=False)
print(f'Packaged build inputs: {out.stat().st_size} bytes')
