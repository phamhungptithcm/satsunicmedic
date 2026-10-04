#!/usr/bin/env bash
set -euo pipefail
export CLOUDSDK_CORE_PROJECT=satsunicmedic CLOUDSDK_BILLING_QUOTA_PROJECT=satsunicmedic CLOUDSDK_CORE_DISABLE_PROMPTS=1
if ! gcloud compute firewall-rules describe medic-web >/dev/null 2>&1; then
  gcloud compute firewall-rules create medic-web --network=medic-production --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 --target-tags=medic-production
fi
gcloud compute ssh medic-production --zone=asia-southeast1-b --tunnel-through-iap --quiet --command="sudo sh -c 'cd /opt/satsunicmedic && docker compose up -d proxy'"
