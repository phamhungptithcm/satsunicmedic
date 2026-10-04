"""Bounded full-body candidate preparation; does not publish or attest medical review."""
import csv, hashlib, importlib.util, json, re, zipfile
from pathlib import Path, PurePosixPath
spec = importlib.util.spec_from_file_location('prepare', Path(__file__).with_name('prepare.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.MAX_ENTRY = 24_000_000  # Full skin is 14.5MB; bounded independently of thorax pipeline.
source = Path('.ai/local/free-anatomy/source')
out = Path('.ai/local/free-anatomy/full-body-v2')
regions = {'head': ('FMA7154','Đầu'), 'neck': ('FMA7155','Cổ'), 'thorax': ('FMA9576','Ngực'), 'abdomen': ('FMA9577','Bụng'), 'pelvis': ('FMA9578','Chậu'), 'right-arm': ('FMA7185','Chi trên phải'), 'left-arm': ('FMA7186','Chi trên trái'), 'right-leg': ('FMA7187','Chi dưới phải'), 'left-leg': ('FMA7188','Chi dưới trái')}
rows = list(csv.DictReader((source/'elements.tsv').open(), delimiter='\t'))
by_region = {key: {r['element file id'] for r in rows if r['concept id']==concept} for key,(concept,_) in regions.items()}
if any(not values for values in by_region.values()): raise ValueError('Missing region mapping')
archive = source/'bodyparts3d-partof-4.0.zip'
if archive.stat().st_size > 75_000_000: raise ValueError('Archive limit')
out.mkdir(exist_ok=True); (out/'objects').mkdir(exist_ok=True)
objects=[]
with zipfile.ZipFile(archive) as z:
    entries=z.infolist()
    if len(entries)>2000 or sum(e.file_size for e in entries)>300_000_000: raise ValueError('Expansion limit')
    names=set()
    for e in entries:
        p=PurePosixPath(e.filename)
        if p.is_absolute() or '..' in p.parts or '\\' in e.filename or e.filename in names: raise ValueError('Invalid archive path')
        names.add(e.filename)
    chosen={r['element file id'] for r in rows if r['concept id']=='FMA20394'}
    if len(chosen) != 1258: raise ValueError('Unexpected whole-human source coverage')
    for id in sorted(chosen):
        if not re.fullmatch(r'FJ[0-9]{1,6}M?',id): raise ValueError('Invalid ID')
        e=z.getinfo(f'partof_BP3D_4.0_obj_99/{id}.obj')
        if e.file_size>base.MAX_ENTRY or e.flag_bits&1: raise ValueError('Invalid entry')
        data=z.read(e)
        if b'# Bounds(mm):' not in data: raise ValueError('Missing units')
        stats=base.inspect_obj(data)
        membership=[key for key,ids in by_region.items() if id in ids]
        concepts={r['concept id']:r['name'] for r in rows if r['element file id']==id}
        objects.append({'id':id,'regions':membership,'concepts':concepts,**stats,'sha256':hashlib.sha256(data).hexdigest()})
        (out/'objects'/f'{id}.obj').write_bytes(data)
receipt={'status':'LOCAL_REVIEW_ONLY','productionReady':False,'medicalReview':'NOT_REVIEWED','archiveSha256':base.sha256(archive),'mappingSha256':base.sha256(source/'elements.tsv'),'attribution':'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International','licensePage':'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html','legacyHeaderLicense':'CC-BY-SA-2.1-JP','quality':'99% polygon reduction; no clinical validation','regions':{key:{'concept':c,'label':label} for key,(c,label) in regions.items()},'objects':objects}
(out/'inventory.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print(json.dumps({'objects':len(objects),'triangles':sum(o['triangles'] for o in objects)}))
