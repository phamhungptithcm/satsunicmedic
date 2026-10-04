import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('prepare', Path(__file__).resolve().parents[2] / 'scripts/free-anatomy/prepare.py')
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)
TRIANGLE = b'# Bounds(mm): (0,0,0)-(1,1,0)\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n'


class GeometryTests(unittest.TestCase):
    def test_valid_triangle(self):
        self.assertEqual(prepare.inspect_obj(TRIANGLE)['triangles'], 1)

    def test_invalid_geometry_is_rejected(self):
        cases = [TRIANGLE.replace(b'f 1 2 3', b'f 0 2 3'),
                 TRIANGLE.replace(b'f 1 2 3', b'f 1 2 4'),
                 TRIANGLE.replace(b'f 1 2 3', b'f 1 2 2'),
                 TRIANGLE.replace(b'v 0 0 0', b'v nan 0 0'),
                 TRIANGLE + b'vn nan 0 0\n', TRIANGLE + b'mtllib remote.mtl\n',
                 b'', TRIANGLE.replace(b'f 1 2 3', b'f 1 2 3 1')]
        for value in cases:
            with self.subTest(value=value), self.assertRaises(ValueError):
                prepare.inspect_obj(value)

    def test_archive_paths_and_missing_parts_fail_without_output(self):
        for unsafe in [True, False]:
            with self.subTest(unsafe=unsafe), tempfile.TemporaryDirectory() as temp:
                source = Path(temp)
                rows = ['concept id\tname\telement file id']
                for index, concept in enumerate(prepare.SELECTION):
                    rows.append(f'{concept}\ttest\tFJ{index + 1}')
                (source / 'elements.tsv').write_text('\n'.join(rows))
                with zipfile.ZipFile(source / 'bodyparts3d-partof-4.0.zip', 'w') as bundle:
                    bundle.writestr('../outside.obj' if unsafe else 'unrelated.obj', TRIANGLE)
                output = source / 'output'
                with self.assertRaises((ValueError, KeyError)):
                    prepare.prepare(source, output)
                self.assertFalse(output.exists())

    def test_unknown_or_incomplete_mapping_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp)
            (source / 'bodyparts3d-partof-4.0.zip').write_bytes(b'not a zip')
            (source / 'elements.tsv').write_text('concept id\tname\telement file id\nFMA7088\theart\t../../outside')
            with self.assertRaises(ValueError):
                prepare.prepare(source, source / 'output')


if __name__ == '__main__':
    unittest.main()
