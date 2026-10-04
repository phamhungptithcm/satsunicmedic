#!/usr/bin/env bash
# GCE first boot. Contains no application secrets.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg docker.io docker-compose python3
systemctl enable --now docker
install -d -m 700 /opt/satsunicmedic
# Dedicated data survives container replacement. Secret is generated on the VM.
if [ ! -f /opt/satsunicmedic/db_password ]; then
  umask 077
  python3 -c 'import secrets; print(secrets.token_hex(32),end="")' > /opt/satsunicmedic/db_password
  python3 - <<'PY'
from pathlib import Path
p=Path('/opt/satsunicmedic')
password=(p/'db_password').read_text()
(p/'api.env').write_text('DATABASE_URL=postgresql://humanscope:'+password+'@postgres:5432/humanscope\n')
(p/'api.env').chmod(0o600)
PY
fi
# PostgreSQL drops to its own UID before reading the bind-mounted secret.
# Parent directory remains root-only; only the selected container receives it.
chmod 0444 /opt/satsunicmedic/db_password
printf '%s\n' 'SatsunicMedic bootstrap complete'
