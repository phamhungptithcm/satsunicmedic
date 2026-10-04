#!/usr/bin/env bash
# Empty launch DB rehearsal; never target the production PostgreSQL container for restore.
set -euo pipefail
cd /opt/satsunicmedic
dump=$(mktemp)
name=medic-restore-check
trap 'rm -f "$dump"; docker rm -f -v "$name" >/dev/null 2>&1 || true' EXIT
# A second run must not destroy an unrelated existing check container.
if docker container inspect "$name" >/dev/null 2>&1; then
  trap 'rm -f "$dump"' EXIT
  echo 'Restore container already exists; inspect before rerun' >&2
  exit 1
fi
docker compose exec -T postgres pg_dump -U humanscope -d humanscope -Fc > "$dump"
# Isolated one-off verifier: no network, no published ports, no persistent volume.
docker run -d --name "$name" --network=none --memory=256m -e POSTGRES_HOST_AUTH_METHOD=trust postgres:18.6@sha256:5a5a84b19854a9ffaa54082c166ff4ec27473a361e496e5ea167f298f2da9722 >/dev/null
for attempt in $(seq 1 30); do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec -i "$name" pg_restore -U postgres -d postgres --exit-on-error --single-transaction --no-owner < "$dump"
docker exec "$name" psql -U postgres -d postgres -Atc 'SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;'
echo 'Isolated database restore passed'
