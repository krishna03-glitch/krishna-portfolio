#!/usr/bin/env bash
set -euo pipefail

PROJECT="${1:-integral-sol-426919-g1}"
SERVICE="compute.googleapis.com"
MAX_RETRIES=8
DELAY=30

echo "Activating $SERVICE for project $PROJECT ..."

for i in $(seq 1 $MAX_RETRIES); do
  if gcloud services enable "$SERVICE" --project="$PROJECT" 2>&1; then
    echo "Service enabled successfully."
    exit 0
  fi

  STATUS=$(gcloud services list --project="$PROJECT" \
    --filter="name:$SERVICE" --format="value(state)" 2>/dev/null || true)

  echo "Attempt $i/$MAX_RETRIES failed (state: ${STATUS:-unknown}). Retrying in ${DELAY}s ..."
  sleep "$DELAY"
  DELAY=$(( DELAY * 2 > 300 ? 300 : DELAY * 2 ))
done

echo "Failed to enable $SERVICE after $MAX_RETRIES attempts. Check GCP console for pending operations."
exit 1
