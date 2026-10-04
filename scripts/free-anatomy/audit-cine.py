#!/usr/bin/env python3
"""Bounded local DICOM cine audit. No extraction, publication or identity output.

Run with isolated pydicom 3.0.1 and numpy 2.2.6. This audits a selected ZIP,
not the complete upstream dataset. A technical pass never authorizes display.
"""
import argparse
import hashlib
import io
import json
import logging
import math
import stat
import warnings
import zipfile
from pathlib import Path, PurePosixPath

MAX_ARCHIVE = 32 * 1024 * 1024
MAX_EXPANDED = 64 * 1024 * 1024
MAX_FRAME = 2 * 1024 * 1024
MAX_ENTRIES = 200


class AuditRejection(ValueError):
    """Stable reason code safe for receipts; never contains source identifiers."""


def bounded_entries(package):
    entries = package.infolist()
    if not 2 <= len(entries) <= MAX_ENTRIES:
        raise AuditRejection('FRAME_COUNT_OUT_OF_BOUNDS')
    seen = set()
    if sum(e.file_size for e in entries) > MAX_EXPANDED:
        raise AuditRejection('EXPANSION_BUDGET_EXCEEDED')
    for entry in entries:
        path = PurePosixPath(entry.filename)
        mode = entry.external_attr >> 16
        if (path.is_absolute() or '..' in path.parts or '\\' in entry.filename
                or ':' in entry.filename or entry.filename in seen
                or entry.flag_bits & 1 or stat.S_ISLNK(mode)
                or entry.is_dir() or path.suffix.lower() != '.dcm'):
            raise AuditRejection('UNSAFE_OR_UNSUPPORTED_ARCHIVE_ENTRY')
        if not 0 < entry.file_size <= MAX_FRAME:
            raise AuditRejection('FRAME_BUDGET_EXCEEDED')
        seen.add(entry.filename)
    return entries


def vector(value, size):
    try:
        result = [float(v) for v in value]
    except (TypeError, ValueError):
        raise AuditRejection('INVALID_SPATIAL_METADATA') from None
    if len(result) != size or not all(math.isfinite(v) for v in result):
        raise AuditRejection('INVALID_SPATIAL_METADATA')
    return result


def close(a, b):
    return len(a) == len(b) and all(abs(x-y) < 1e-4 for x, y in zip(a, b))


def audit(archive):
    # Imports are optional tooling, never installed into the application workspace.
    import numpy as np
    import pydicom
    if archive.is_symlink() or not archive.is_file() or archive.stat().st_size > MAX_ARCHIVE:
        raise AuditRejection('INVALID_OR_OVERSIZED_ARCHIVE')
    archive_bytes = archive.read_bytes()
    frames = []
    identities = set()
    spatial_references = set()
    image_ids = set()
    decoded_bytes = 0
    unknown_privacy = False
    sensitive_metadata_present = False
    decoder_warnings = 0
    logger = logging.getLogger('pydicom')
    was_disabled = logger.disabled
    logger.disabled = True  # Decoder diagnostics can contain raw identifiers.
    try:
        with warnings.catch_warnings(record=True) as caught, zipfile.ZipFile(io.BytesIO(archive_bytes)) as package:
            warnings.simplefilter('always')
            for entry in bounded_entries(package):
                raw = package.read(entry)  # ZipFile verifies entry CRC.
                ds = pydicom.dcmread(io.BytesIO(raw))
                if (ds.get('Modality') != 'MR' or int(ds.get('NumberOfFrames', 1)) != 1
                        or int(ds.get('SamplesPerPixel', 0)) != 1
                        or ds.get('PhotometricInterpretation') not in ('MONOCHROME1', 'MONOCHROME2')
                        or int(ds.get('BitsAllocated', 0)) not in (8, 16)):
                    raise AuditRejection('UNSUPPORTED_IMAGE_ENCODING')
                if str(ds.file_meta.TransferSyntaxUID) not in (
                        '1.2.840.10008.1.2', '1.2.840.10008.1.2.1', '1.2.840.10008.1.2.2'):
                    raise AuditRejection('UNSUPPORTED_COMPRESSED_TRANSFER_SYNTAX')
                rows, cols = int(ds.get('Rows', 0)), int(ds.get('Columns', 0))
                if not 1 <= rows <= 1024 or not 1 <= cols <= 1024:
                    raise AuditRejection('PIXEL_DIMENSION_BUDGET_EXCEEDED')
                decoded_bytes += rows * cols * 2
                if decoded_bytes > MAX_EXPANDED:
                    raise AuditRejection('DECODE_BUDGET_EXCEEDED')
                spacing = vector(ds.get('PixelSpacing'), 2)
                position = vector(ds.get('ImagePositionPatient'), 3)
                orientation = vector(ds.get('ImageOrientationPatient'), 6)
                u, v = orientation[:3], orientation[3:]
                if (min(spacing) <= 0 or max(spacing) > 100
                        or abs(sum(x*x for x in u)-1) > 1e-4
                        or abs(sum(x*x for x in v)-1) > 1e-4
                        or abs(sum(x*y for x,y in zip(u,v))) > 1e-4):
                    raise AuditRejection('INVALID_SPATIAL_CALIBRATION')
                trigger = float(ds.get('TriggerTime', 'nan'))
                if not math.isfinite(trigger) or not 0 <= trigger <= 10000:
                    raise AuditRejection('MISSING_OR_INVALID_TRIGGER_TIME')
                identity = tuple(str(ds.get(k, '')) for k in ('StudyInstanceUID', 'SeriesInstanceUID', 'FrameOfReferenceUID'))
                image_id = str(ds.get('SOPInstanceUID', ''))
                if not all(identity) or not image_id or image_id in image_ids:
                    raise AuditRejection('MISSING_OR_DUPLICATE_IMAGE_IDENTITY')
                identities.add(identity[:2])
                spatial_references.add(identity[2])
                image_ids.add(image_id)
                unknown_privacy |= ds.get('PatientIdentityRemoved') != 'YES' or ds.get('BurnedInAnnotation') != 'NO'
                sensitive_metadata_present |= any(bool(ds.get(k)) for k in (
                    'PatientName', 'PatientID', 'PatientBirthDate', 'AccessionNumber',
                    'ReferringPhysicianName', 'InstitutionName')) or any(e.tag.is_private for e in ds.iterall())
                pixels = ds.pixel_array
                if pixels.shape != (rows, cols) or not np.isfinite(pixels).all():
                    raise AuditRejection('INVALID_DECODED_PIXELS')
                frame = {'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw),
                         'dimensions': [cols, rows], 'pixelSpacingMm': spacing,
                         'positionLpsMm': position, 'orientationLps': orientation,
                         'triggerTimeMs': trigger}
                if frames:
                    first = frames[0]
                    if (frame['dimensions'] != first['dimensions'] or any(not close(frame[k], first[k])
                            for k in ('pixelSpacingMm', 'positionLpsMm', 'orientationLps'))):
                        raise AuditRejection('MIXED_SPATIAL_FRAMES')
                frames.append(frame)
            decoder_warnings = len(caught)
    finally:
        logger.disabled = was_disabled
    if len(identities) != 1:
        raise AuditRejection('MIXED_SERIES')
    if len(spatial_references) != 1:
        raise AuditRejection('UNVERIFIED_CROSS_FRAME_OF_REFERENCE')
    if len({frame['triggerTimeMs'] for frame in frames}) != len(frames):
        raise AuditRejection('DUPLICATE_TRIGGER_TIME')
    # ZIP/file order is not a temporal contract. Preserve actual DICOM times.
    frames.sort(key=lambda frame: frame['triggerTimeMs'])
    return {'version': 1, 'status': 'QUARANTINE_ONLY', 'technicalStatus': 'DECODED_SINGLE_PLANE_CINE',
            'sourceArchiveSha256': hashlib.sha256(archive_bytes).hexdigest(),
            'frameCount': len(frames), 'frames': frames, 'decodedBytesUpperBound': decoded_bytes,
            'temporalKind': 'dicom-trigger-time-ms', 'cycleComplete': 'NOT_VERIFIED',
            'contourCoverage': 'NOT_VERIFIED', 'medicalReview': 'NOT_REVIEWED',
            'metadataPrivacy': 'REQUIRES_REVIEW' if unknown_privacy or sensitive_metadata_present else 'DECLARED_DEIDENTIFIED',
            'pixelPrivacy': 'NOT_REVIEWED', 'displayEligible': False,
            'decoderWarningCount': decoder_warnings,
            'decoderConformance': 'REQUIRES_REVIEW' if decoder_warnings else 'NO_WARNINGS_OBSERVED'}


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--archive', type=Path, required=True)
    cli.add_argument('--output', type=Path, required=True)
    args = cli.parse_args()
    try:
        result = audit(args.archive)
    except AuditRejection as error:
        result = {'version': 1, 'status': 'REJECTED', 'displayEligible': False,
                  'reason': str(error)}
    except Exception:
        # Never echo exception text from untrusted medical input or file paths.
        result = {'version': 1, 'status': 'REJECTED', 'displayEligible': False,
                  'reason': 'SOURCE_OR_DECODER_VALIDATION_FAILED'}
    if 'sourceArchiveSha256' not in result:
        # Bind rejection receipts too, without hashing oversized or special input.
        try:
            if not args.archive.is_symlink() and args.archive.is_file() and args.archive.stat().st_size <= MAX_ARCHIVE:
                with args.archive.open('rb') as stream:
                    result['sourceArchiveSha256'] = hashlib.file_digest(stream, 'sha256').hexdigest()
        except OSError:
            pass
    if args.output.resolve() == args.archive.resolve() or args.output.is_symlink():
        raise SystemExit('Refusing unsafe receipt target')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k:result[k] for k in ('status','displayEligible','frameCount','reason') if k in result}))
    return 0 if result['status'] == 'QUARANTINE_ONLY' else 1


if __name__ == '__main__':
    raise SystemExit(main())
