import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('supplement', Path(__file__).parents[1] / 'scripts/free-anatomy/audit-supplement.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SupplementAuditTests(unittest.TestCase):
    def test_geometry_digest_ignores_only_comments(self):
        first = b'# tree A\nv 1 2 3\nf 1 2 3\n'
        second = b'# tree B\nv 1 2 3\nf 1 2 3\n'
        self.assertEqual(module.geometry_digest(first), module.geometry_digest(second))
        self.assertNotEqual(module.geometry_digest(first), module.geometry_digest(second.replace(b'1 2 3', b'1 3 2')))
        self.assertNotEqual(module.geometry_digest(first), module.geometry_digest(second + b'call attack\n'))

    def test_rejects_traversal_and_duplicate_ids(self):
        for names in [['../FJ1.obj'], ['a/FJ1.obj', 'b/FJ1.obj'], ['a/asset.txt']]:
            with self.subTest(names=names), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / 'test.zip'
                with zipfile.ZipFile(path, 'w') as archive:
                    for name in names:
                        archive.writestr(name, 'v 1 2 3')
                with self.assertRaises(ValueError):
                    module.inventory_archive(path, 10000, 10000)

    def test_rejects_expansion_and_archive_budgets(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'test.zip'
            with zipfile.ZipFile(path, 'w') as archive:
                archive.writestr('a/FJ1.obj', 'x' * 1000)
            with self.assertRaises(ValueError):
                module.inventory_archive(path, 1, 10000)
            with self.assertRaises(ValueError):
                module.inventory_archive(path, 10000, 1)

    def test_complete_audit_is_quarantine_only_and_never_extracts(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            geometry = b'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n'
            for name, ids in [('isa.zip', [1, 2]), ('partof.zip', [1])]:
                with zipfile.ZipFile(root / name, 'w') as archive:
                    for number in ids:
                        archive.writestr(f'objects/FJ{number}.obj', f'# Bounds(mm): source\n# File ID : FJ{number}\n# {name}\n'.encode() + geometry)
            mapping = root / 'mapping.tsv'
            mapping.write_text('concept id\tname\telement file id\nFMA1\tfixture one\tFJ1\nFMA2\tfixture two\tFJ2\n')
            report = module.audit(root / 'isa.zip', root / 'partof.zip', mapping, root / 'report.json')
            self.assertEqual(report['sharedGeometryIdentical'], ['FJ1'])
            self.assertEqual([item['id'] for item in report['candidates']], ['FJ2'])
            self.assertFalse(report['productionReady'])
            self.assertEqual(report['overlapReview'], 'NOT_REVIEWED')
            self.assertEqual(list(root.glob('**/*.obj')), [])


if __name__ == '__main__':
    unittest.main()
