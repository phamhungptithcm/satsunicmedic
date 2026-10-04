"""Quarantine importer regressions: IDs, zip traversal and bounded geometry."""
import importlib.util
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('audit_isa', Path(__file__).parents[1] / 'scripts/free-anatomy/audit-isa.py')
audit_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)
OBJ = '# Bounds(mm): test fixture\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n'


class AuditTests(unittest.TestCase):
    def run_audit(self, name='source/FJ2.obj', obj=OBJ, selected=None):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder)
            (p/'isa.tsv').write_text('concept id\tname\telement file id\nFMA1\tsurface\tFJ1\nFMA2\twall\tFJ2\n')
            (p/'part.tsv').write_text('concept id\tname\telement file id\nFMA1\tsurface\tFJ1\n')
            with zipfile.ZipFile(p/'source.zip', 'w') as z:
                z.writestr(name, obj)
            result = audit_module.audit(p/'source.zip', p/'isa.tsv', p/'part.tsv', p/'out.json', selected or ['FJ2'])
            self.assertEqual(json.loads((p/'out.json').read_text()), result)
            self.assertFalse((p/'source').exists())
            return result

    def test_records_geometry_without_publishing_or_extracting(self):
        result = self.run_audit()
        self.assertEqual(result['status'], 'QUARANTINE_ONLY')
        self.assertEqual(result['medicalReview'], 'NOT_REVIEWED')
        self.assertEqual(result['additionalIds'], ['FJ2'])
        self.assertEqual(result['inspected'][0]['triangles'], 1)

    def test_rejects_traversal_before_read(self):
        with self.assertRaises(ValueError):
            self.run_audit('../FJ2.obj')

    def test_rejects_existing_or_unknown_source(self):
        for key in ['FJ1', 'FJ99']:
            with self.assertRaises(ValueError):
                self.run_audit(selected=[key])

    def test_rejects_external_directives_and_nonfinite_geometry(self):
        for obj in [OBJ+'mtllib external.mtl\n', OBJ.replace('v 0 0 0', 'v nan 0 0')]:
            with self.assertRaises(ValueError):
                self.run_audit(obj=obj)

    def test_rejects_duplicate_selection(self):
        with self.assertRaises(ValueError):
            self.run_audit(selected=['FJ2', 'FJ2'])


if __name__ == '__main__':
    unittest.main()
