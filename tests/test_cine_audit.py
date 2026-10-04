"""Synthetic DICOM fixtures exercise quarantine gates; never clinical evidence."""
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from unittest.mock import patch
import warnings
import zipfile
from pathlib import Path

import numpy as np
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, MRImageStorage
from pydicom.errors import InvalidDicomError

spec = importlib.util.spec_from_file_location('cine_audit', Path(__file__).parents[1] / 'scripts/free-anatomy/audit-cine.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def frame(index, **changes):
    meta = FileMetaDataset()
    meta.TransferSyntaxUID = ExplicitVRLittleEndian
    meta.MediaStorageSOPClassUID = MRImageStorage
    meta.MediaStorageSOPInstanceUID = f'1.2.826.0.1.3680043.10.999.{index+1}'
    ds = FileDataset(None, {}, file_meta=meta, preamble=b'\0'*128)
    for k,v in dict(SOPClassUID=MRImageStorage, SOPInstanceUID=meta.MediaStorageSOPInstanceUID,
                    StudyInstanceUID='1.2.3', SeriesInstanceUID='1.2.3.1', FrameOfReferenceUID='1.2.4',
                    Modality='MR', Rows=4, Columns=4, SamplesPerPixel=1, BitsAllocated=16,
                    BitsStored=12, HighBit=11, PixelRepresentation=0, PhotometricInterpretation='MONOCHROME2',
                    ImagePositionPatient=[0,0,0], ImageOrientationPatient=[1,0,0,0,1,0],
                    PixelSpacing=[1,1], TriggerTime=index*40, PatientIdentityRemoved='YES',
                    BurnedInAnnotation='NO', PatientName='SYNTHETIC^DO_NOT_PRINT',
                    PixelData=np.arange(16,dtype='<u2').tobytes()).items():setattr(ds,k,v)
    for k,v in changes.items():
        if v is None:delattr(ds,k)
        else:setattr(ds,k,v)
    out=io.BytesIO();ds.save_as(out,enforce_file_format=True)
    return out.getvalue()


class CineAuditTests(unittest.TestCase):
    def run_audit(self, frames=None, names=None):
        frames = frames if frames is not None else [frame(0),frame(1)]
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'sample.zip'
            with warnings.catch_warnings(),zipfile.ZipFile(path,'w') as package:
                warnings.simplefilter('ignore',UserWarning)  # Deliberate duplicate ZIP fixture.
                for i,data in enumerate(frames):package.writestr(names[i] if names else f'frame-{i}.dcm',data)
            output=io.StringIO()
            with contextlib.redirect_stderr(output),contextlib.redirect_stdout(output):
                result=module.audit(path)
            self.assertNotIn('SYNTHETIC^DO_NOT_PRINT',output.getvalue()+json.dumps(result))
            self.assertEqual([p.name for p in Path(folder).iterdir()],['sample.zip'])
            return result

    def test_decodes_and_keeps_publication_blocked(self):
        r=self.run_audit()
        self.assertEqual(r['frameCount'],2)
        self.assertEqual(r['technicalStatus'],'DECODED_SINGLE_PLANE_CINE')
        self.assertFalse(r['displayEligible'])
        self.assertEqual(r['metadataPrivacy'],'REQUIRES_REVIEW')
        self.assertEqual(r['pixelPrivacy'],'NOT_REVIEWED')
        self.assertEqual(r['contourCoverage'],'NOT_VERIFIED')

    def test_temporal_order_comes_from_metadata(self):
        r=self.run_audit([frame(2,TriggerTime=93),frame(0),frame(1,TriggerTime=17)])
        self.assertEqual([f['triggerTimeMs'] for f in r['frames']],[0,17,93])
        self.assertEqual(r['cycleComplete'],'NOT_VERIFIED')

    def test_rejects_missing_and_duplicate_times(self):
        for value in [None,0,-1,float('nan')]:
            with self.subTest(value=value),self.assertRaises(ValueError):
                self.run_audit([frame(0),frame(1,TriggerTime=value)])

    def test_rejects_mixed_plane_orientation_and_spacing(self):
        for change in [dict(ImagePositionPatient=[0,0,1]),dict(ImageOrientationPatient=[0,1,0,1,0,0]),dict(PixelSpacing=[2,1])]:
            with self.subTest(change=change),self.assertRaises(ValueError):
                self.run_audit([frame(0),frame(1,**change)])

    def test_rejects_invalid_calibration(self):
        for change in [dict(PixelSpacing=[0,1]),dict(ImageOrientationPatient=[1,0,0,1,0,0]),dict(ImagePositionPatient=None)]:
            with self.subTest(change=change),self.assertRaises(ValueError):
                self.run_audit([frame(0),frame(1,**change)])

    def test_rejects_other_series_and_duplicate_instance(self):
        for second in [frame(1,SeriesInstanceUID='1.2.9'),frame(0,TriggerTime=40)]:
            with self.assertRaises(ValueError):self.run_audit([frame(0),second])

    def test_equal_numeric_positions_do_not_register_different_frames_of_reference(self):
        with self.assertRaisesRegex(ValueError,'UNVERIFIED_CROSS_FRAME_OF_REFERENCE'):
            self.run_audit([frame(0),frame(1,FrameOfReferenceUID='1.2.5')])

    def test_decoder_warnings_do_not_expose_raw_identifiers(self):
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            data=[frame(0,StudyInstanceUID='1.02.3'),frame(1,StudyInstanceUID='1.02.3')]
        r=self.run_audit(data)
        self.assertGreater(r['decoderWarningCount'],0)
        self.assertNotIn('1.02.3',json.dumps(r))

    def test_missing_privacy_tags_never_authorize_display(self):
        r=self.run_audit([frame(0,PatientIdentityRemoved=None,BurnedInAnnotation=None),frame(1)])
        self.assertEqual(r['metadataPrivacy'],'REQUIRES_REVIEW')
        self.assertFalse(r['displayEligible'])

    def test_rejects_archive_paths_and_duplicates(self):
        for name in ['../frame.dcm','/frame.dcm','a\\frame.dcm','C:frame.dcm','a.txt','frame-0.dcm']:
            with self.subTest(name=name),self.assertRaises(ValueError):
                self.run_audit(names=['frame-0.dcm',name])

    def test_rejects_html_and_truncated_pixels(self):
        for data in [b'<html>Download file</html>',frame(1,PixelData=b'xx')]:
            with self.assertRaises((ValueError,InvalidDicomError)):self.run_audit([frame(0),data])

    def test_rejects_huge_dimensions_before_decoding(self):
        with self.assertRaisesRegex(ValueError,'BUDGET'):
            self.run_audit([frame(0),frame(1,Rows=4096,Columns=4096)])

    def test_bounds_entry_count_and_declared_expansion(self):
        class Package:
            def infolist(self):return [zipfile.ZipInfo('a.dcm')]*201
        with self.assertRaisesRegex(ValueError,'COUNT'):module.bounded_entries(Package())
        class LargePackage:
            def infolist(self):
                a=zipfile.ZipInfo('a.dcm');a.file_size=module.MAX_EXPANDED
                b=zipfile.ZipInfo('b.dcm');b.file_size=2
                return [a,b]
        with self.assertRaisesRegex(ValueError,'EXPANSION'):module.bounded_entries(LargePackage())

    def test_cli_rejection_is_hash_bound_and_contains_no_source_text(self):
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/'bad.zip';source.write_bytes(b'SYNTHETIC_PRIVATE_TEXT')
            out=Path(folder)/'receipt.json';capture=io.StringIO()
            with patch('sys.argv',['audit-cine','--archive',str(source),'--output',str(out)]),contextlib.redirect_stdout(capture):
                self.assertEqual(module.main(),1)
            receipt=json.loads(out.read_text())
            self.assertEqual(len(receipt['sourceArchiveSha256']),64)
            self.assertNotIn('SYNTHETIC_PRIVATE_TEXT',out.read_text()+capture.getvalue())

    def test_rejects_symlink_archive_without_following_it(self):
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/'file.zip';source.write_bytes(b'not a ZIP')
            link=Path(folder)/'link.zip';link.symlink_to(source)
            with self.assertRaisesRegex(ValueError,'INVALID_OR_OVERSIZED_ARCHIVE'):module.audit(link)


if __name__=='__main__':unittest.main()
