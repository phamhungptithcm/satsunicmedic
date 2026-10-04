#!/usr/bin/env python3
"""Daily encrypted-at-rest GCS backup. Run as root; never print DB credentials."""
import datetime,json,os,subprocess,tempfile,urllib.request
os.chdir('/opt/satsunicmedic')
with tempfile.TemporaryFile() as dump:
    subprocess.run(['docker','compose','exec','-T','postgres','pg_dump','-U','humanscope','-d','humanscope','-Fc'],stdout=dump,check=True,timeout=180)
    dump.seek(0)
    req=urllib.request.Request('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',headers={'Metadata-Flavor':'Google'})
    token=json.load(urllib.request.urlopen(req,timeout=10))['access_token']
    name='daily/'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.dump'
    url='https://storage.googleapis.com/upload/storage/v1/b/satsunicmedic-db-backups/o?uploadType=media&ifGenerationMatch=0&name='+name
    size=os.fstat(dump.fileno()).st_size
    req=urllib.request.Request(url,data=dump,method='POST',headers={'Authorization':'Bearer '+token,'Content-Type':'application/octet-stream','Content-Length':str(size)})
    with urllib.request.urlopen(req,timeout=180) as res: result=json.load(res)
    print('Backup uploaded:',result['name'],'bytes:',result['size'])
