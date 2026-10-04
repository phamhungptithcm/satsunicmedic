#!/usr/bin/env bash
set -euo pipefail
export CLOUDSDK_CORE_PROJECT=satsunicmedic CLOUDSDK_BILLING_QUOTA_PROJECT=satsunicmedic CLOUDSDK_CORE_DISABLE_PROMPTS=1
REGION=asia-southeast1
ZONE=asia-southeast1-b
if ! gcloud compute networks describe medic-production >/dev/null 2>&1; then
  gcloud compute networks create medic-production --subnet-mode=custom
fi
if ! gcloud compute networks subnets describe medic-singapore --region="$REGION" >/dev/null 2>&1; then
  gcloud compute networks subnets create medic-singapore --network=medic-production --region="$REGION" --range=10.71.0.0/24
fi
if ! gcloud compute firewall-rules describe medic-iap-ssh >/dev/null 2>&1; then
  gcloud compute firewall-rules create medic-iap-ssh --network=medic-production --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=medic-production
fi
# Public HTTP/HTTPS firewall is deliberately added only after candidate checks.
if ! gcloud compute addresses describe medic-production --region="$REGION" >/dev/null 2>&1; then
  gcloud compute addresses create medic-production --region="$REGION" --network-tier=STANDARD
fi
IP=$(gcloud compute addresses describe medic-production --region="$REGION" --format='value(address)')
if ! gcloud compute instances describe medic-production --zone="$ZONE" >/dev/null 2>&1; then
  gcloud compute instances create medic-production --zone="$ZONE" --machine-type=e2-small --subnet=medic-singapore --address="$IP" --network-tier=STANDARD --image-family=debian-13 --image-project=debian-cloud --boot-disk-size=30GB --boot-disk-type=pd-standard --no-boot-disk-auto-delete --service-account=medic-runtime@satsunicmedic.iam.gserviceaccount.com --scopes=cloud-platform --tags=medic-production --metadata=enable-oslogin=TRUE,block-project-ssh-keys=TRUE --metadata-from-file=startup-script=infra/production/bootstrap.sh --shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring --deletion-protection --labels=app=satsunicmedic,environment=production
fi
printf 'Temporary host: medic-%s.sslip.io\n' "${IP//./-}"
