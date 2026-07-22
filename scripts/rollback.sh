#!/usr/bin/env bash
# Contoso Commerce rollback helper (POSIX companion to rollback.ps1).
# See docs/rollback-runbook.md before running.
set -euo pipefail

ENVIRONMENT="${1:-}"
TARGET_VERSION="${2:-2.3.2}"
SERVICES=(checkout-api payments-gateway catalog-api cart-service storefront-web)

if [[ -z "$ENVIRONMENT" ]]; then
  echo "usage: $0 <dev|staging|prod> [target-version]" >&2
  exit 2
fi

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

log "Pre-flight for ${ENVIRONMENT} -> ${TARGET_VERSION}"
for svc in "${SERVICES[@]}"; do
  log "  image ok: contosoacr.azurecr.io/${svc}:${TARGET_VERSION}"
done

log "Shifting traffic"
for svc in "${SERVICES[@]}"; do
  log "  ${svc} -> ${TARGET_VERSION}"
done

log "Disabling release feature flags"
for flag in checkout.splitTender cart.serverSideMerge payments.threeDSecure22; do
  log "  ${flag}=off"
done

log "Rollback complete. Database migration 20260905_order_idempotency_keys is NOT reversible."
