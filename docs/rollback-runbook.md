# Rollback Runbook - Contoso Commerce v2.4.0

**Severity to invoke:** Sev-1 or Sev-2 attributable to the v2.4.0 deployment.
**Decision authority:** Incident Commander, or on-call EM if the IC is unreachable.
**Target RTO (application tier):** 18 minutes.
**Target RTO (with database restore):** ~95 minutes.
**Last rehearsed:** 2026-07-22 - passed (16m 41s).

---

## 1. Decision criteria

Invoke rollback if **any** of the following hold for more than 10 minutes after deployment:

- Checkout success rate drops below 97% (baseline 99.4%).
- Payment authorization error rate exceeds 2%.
- Checkout API p99 latency exceeds 1,500ms.
- Any data-integrity alert on the `orders` or `payments` tables.
- Two or more Sev-2 incidents attributable to the release.

## 2. Pre-flight checks (2 minutes)

```powershell
.\scripts\rollback.ps1 -Environment prod -PreflightOnly
```

Confirms: green slot health, previous stable images present in ACR, database snapshot
timestamp, and that no migration is mid-flight.

## 3. Application rollback (blue-green traffic shift)

1. Freeze the deployment pipeline: `az pipelines run --name contoso-commerce-freeze`.
2. Shift traffic back to the blue slot (v2.3.2):

   ```powershell
   .\scripts\rollback.ps1 -Environment prod -TargetVersion 2.3.2 -Confirm
   ```

3. Disable v2.4 feature flags:

   ```bash
   contoso-flags set checkout.splitTender=off cart.serverSideMerge=off payments.threeDSecure22=off
   ```

4. Verify: run the synthetic checkout probe and confirm three consecutive green results.
5. Purge the CDN cache for `/checkout/*` and `/cart/*`.

## 4. Database rollback

> **WARNING: Migration `20260905_order_idempotency_keys` is NOT reversible.**

| Scenario | Action |
|---|---|
| Rollback **before** `20260905` is applied | Run `npm run migrate:down -- --to 20260902` - safe, ~4 minutes. |
| Rollback **after** `20260905` is applied | Point-in-time restore required. Orders created after the restore point must be replayed from the order-events topic. Engage the Data Platform on-call. |

Point-in-time restore:

```bash
az postgres flexible-server restore \
  --name contoso-orders-prod-restore \
  --source-server contoso-orders-prod \
  --restore-time "2026-09-11T01:55:00Z"
```

## 5. Communications

| Time | Audience | Channel | Owner |
|---|---|---|---|
| T+0 | Incident channel | Teams `#incident-bridge` | IC |
| T+5m | Engineering + Release | Teams `#releases` | Release Manager |
| T+15m | Customer Support leads | Email + Teams `#support-leads` | Support Duty Manager |
| T+30m | Executive sponsors | Email | IC |
| T+24h | All hands | Postmortem doc in SharePoint | IC |

## 6. Post-rollback

1. Tag the failed release: `git tag -a v2.4.0-rolled-back -m "Rolled back <date>: <reason>"`.
2. Open a Sev-1 postmortem issue with the `known-risk` label.
3. Reconcile payment captures against the gateway for the deployment window.
4. Schedule a blameless postmortem within 3 business days.

## 7. Escalation

| Role | Name | Contact |
|---|---|---|
| Incident Commander (primary) | Daniel Okafor | `#oncall-ic` |
| Release Manager | Priya Nandakumar | `#releases` |
| Data Platform on-call | rota | `#oncall-data` |
| Payments on-call | rota | `#oncall-payments` |
| Security on-call | Mei Tanaka | `#oncall-security` |
