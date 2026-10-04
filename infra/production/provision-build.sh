#!/usr/bin/env bash
set -euo pipefail
export CLOUDSDK_CORE_PROJECT=satsunicmedic CLOUDSDK_BILLING_QUOTA_PROJECT=satsunicmedic CLOUDSDK_CORE_DISABLE_PROMPTS=1
REGION=asia-southeast1
BUILD_SA=medic-build@satsunicmedic.iam.gserviceaccount.com
RUN_SA=medic-runtime@satsunicmedic.iam.gserviceaccount.com
for name in medic-build medic-runtime; do
  if ! gcloud iam service-accounts describe "$name@satsunicmedic.iam.gserviceaccount.com" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$name" --display-name="$name"
  fi
done
if ! gcloud artifacts repositories describe production --location="$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create production --repository-format=docker --location="$REGION" --description='SatsunicMedic production images'
fi
gcloud artifacts repositories add-iam-policy-binding production --location="$REGION" --member="serviceAccount:$BUILD_SA" --role=roles/artifactregistry.writer >/dev/null
gcloud artifacts repositories add-iam-policy-binding production --location="$REGION" --member="serviceAccount:$RUN_SA" --role=roles/artifactregistry.reader >/dev/null
gcloud projects add-iam-policy-binding satsunicmedic --member="serviceAccount:$BUILD_SA" --role=roles/logging.logWriter --condition=None >/dev/null
for bucket in satsunicmedic-build-source satsunicmedic-db-backups; do
  if ! gcloud storage buckets describe "gs://$bucket" >/dev/null 2>&1; then
    gcloud storage buckets create "gs://$bucket" --location="$REGION" --uniform-bucket-level-access --public-access-prevention
  fi
done
gcloud storage buckets add-iam-policy-binding gs://satsunicmedic-build-source --member="serviceAccount:$BUILD_SA" --role=roles/storage.objectViewer >/dev/null
gcloud storage buckets add-iam-policy-binding gs://satsunicmedic-db-backups --member="serviceAccount:$RUN_SA" --role=roles/storage.objectCreator >/dev/null
gcloud storage buckets add-iam-policy-binding gs://satsunicmedic-build-source --member="serviceAccount:$BUILD_SA" --role=roles/storage.legacyBucketReader >/dev/null
gcloud storage buckets add-iam-policy-binding gs://satsunicmedic-build-source --member="serviceAccount:$BUILD_SA" --role=roles/storage.objectAdmin >/dev/null
gcloud projects add-iam-policy-binding satsunicmedic --member="serviceAccount:$RUN_SA" --role=roles/logging.logWriter --condition=None >/dev/null
if ! gcloud iam roles describe medicIdentityRuntime --project=satsunicmedic >/dev/null 2>&1; then
  gcloud iam roles create medicIdentityRuntime --project=satsunicmedic --title='Medic Firebase session runtime' --permissions=firebaseauth.users.get,firebaseauth.users.createSession,firebaseauth.users.update --stage=GA
fi
gcloud projects add-iam-policy-binding satsunicmedic --member="serviceAccount:$RUN_SA" --role=projects/satsunicmedic/roles/medicIdentityRuntime --condition=None >/dev/null
printf '%s\n' 'Build repository and scoped service accounts ready' 
