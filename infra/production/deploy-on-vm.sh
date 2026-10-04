#!/usr/bin/env bash
# Run as root from /opt/satsunicmedic after transferring the reviewed files.
set -euo pipefail
cd /opt/satsunicmedic
chmod 0444 db_password
chmod 0600 api.env .env
test -f migrate.env || install -m 600 api.env migrate.env
python3 - <<'PY'
from pathlib import Path
import re
values=dict(line.split('=',1) for line in Path('.env').read_text().splitlines() if line and not line.startswith('#'))
for key in ['API_IMAGE','WEB_IMAGE','MIGRATE_IMAGE','POSTGRES_IMAGE','CADDY_IMAGE']:
    if not re.fullmatch(r'[a-z0-9./:_-]+@sha256:[a-f0-9]{64}',values.get(key,'')):
        raise SystemExit(f'{key} must use an immutable digest')
PY
# Metadata token stays in the pipe and temporary Docker config; never a command argument.
export DOCKER_CONFIG
DOCKER_CONFIG=$(mktemp -d)
trap 'rm -rf "$DOCKER_CONFIG"' EXIT
curl -fsS -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])' | docker login -u oauth2accesstoken --password-stdin https://asia-southeast1-docker.pkg.dev >/dev/null
docker compose config --quiet
docker compose --profile tools pull --quiet
docker compose up -d --wait postgres
# New empty production DB only. Subsequent upgrades require verified backup first.
tables=$(docker compose exec -T postgres psql -U humanscope -d humanscope -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
if [ "$tables" != 0 ]; then
  echo 'Existing database detected; use the reviewed upgrade/backup workflow' >&2
  exit 1
fi
docker compose run --rm migrate
python3 /opt/satsunicmedic/configure-db-role.py
docker compose up -d --wait api web
docker compose exec -T api node -e 'fetch("http://127.0.0.1:8080/api/v1/health/ready").then(async r=>{if(!r.ok)process.exit(1);console.log(await r.text())}).catch(()=>process.exit(1))'
