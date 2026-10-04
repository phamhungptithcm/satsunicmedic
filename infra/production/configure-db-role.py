#!/usr/bin/env python3
"""Create the app's DML-only role after initial migrations, without logging secrets."""
from pathlib import Path
import os,secrets,subprocess
os.chdir('/opt/satsunicmedic')
# Do not rotate credentials silently on a later run.
if '://medic_app:' in Path('api.env').read_text():
    print('Application role already configured')
    raise SystemExit(0)
password=secrets.token_hex(32)
sql="""
CREATE ROLE medic_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '%s';
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE humanscope TO medic_app;
GRANT USAGE ON SCHEMA public TO medic_app;
DO $$ DECLARE tab record; BEGIN
 FOR tab IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations' LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%%I TO medic_app', tab.tablename);
 END LOOP;
END $$;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO medic_app;
ALTER DEFAULT PRIVILEGES FOR ROLE humanscope IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO medic_app;
ALTER DEFAULT PRIVILEGES FOR ROLE humanscope IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO medic_app;
""" % password
result=subprocess.run(['docker','compose','exec','-T','postgres','psql','-U','humanscope','-d','humanscope','-v','ON_ERROR_STOP=1','--single-transaction'],input=sql,text=True,capture_output=True)
if result.returncode:
    raise SystemExit('Database role setup failed; secret-bearing SQL output suppressed')
path=Path('api.env')
path.write_text('DATABASE_URL=postgresql://medic_app:'+password+'@postgres:5432/humanscope\n')
path.chmod(0o600)
print('Application uses DML-only role; migration owner credentials kept separately')
